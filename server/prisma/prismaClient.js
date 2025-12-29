const { PrismaClient } = require('@prisma/client');

/**
 * Prisma 클라이언트 싱글톤 인스턴스
 * Node.js에서 모든 리졸버가 동일한 Prisma 인스턴스를 공유하도록 보장
 */
global.__prismaClient = global.__prismaClient || (() => {
  // Prisma 클라이언트 생성 - 연결 풀링 설정 추가
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}connection_limit=5&pool_timeout=10`
      }
    }
  });
  
  console.log('🔌 PrismaClient 인스턴스 생성됨 - 연결 풀링 설정 적용됨');
  
  // 연결 상태 모니터링
  let isConnected = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  
  // 연결 시도 함수
  const connect = async () => {
    try {
      if (!isConnected) {
        await prisma.$connect();
        isConnected = true;
        reconnectAttempts = 0;
        console.log('🔌 Prisma 데이터베이스 연결 성공');
      }
    } catch (error) {
      console.error('🔌 Prisma 데이터베이스 연결 실패:', error);
      isConnected = false;
      
      // 연결 재시도 로직
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔌 연결 재시도 중... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(connect, 5000); // 5초 후 재시도
      } else {
        console.error('🔌 최대 재시도 횟수 초과. 연결 실패.');
      }
    }
  };
  
  // 초기 연결 시도
  connect();

  // 프로세스 종료 이벤트 핸들러
  const handleShutdown = async () => {
    console.log('🔌 Prisma 연결 종료 중...');
    await prisma.$disconnect();
    isConnected = false;
    console.log('🔌 Prisma 연결 종료됨');
    
    // SIGINT 또는 SIGTERM 신호의 경우 프로세스 종료
    if (process._events[process.exitCode]) {
      process.exit(0);
    }
  };

  // Node.js 프로세스 이벤트에 리스너 등록
  process.on('beforeExit', handleShutdown);
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
  
  // 개발 환경에서 Nodemon 재시작 지원
  process.on('SIGUSR2', async () => {
    await handleShutdown();
    process.kill(process.pid, 'SIGUSR2');
  });

  // 처리되지 않은 예외 및 거부 처리
  process.on('uncaughtException', async (error) => {
    console.error('처리되지 않은 예외:', error);
    await handleShutdown();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('처리되지 않은 거부:', reason);
    await handleShutdown();
    process.exit(1);
  });

  // 확장된 Prisma 클라이언트
  return new Proxy(prisma, {
    get: (target, prop) => {
      // 원본 메소드 또는 프로퍼티
      const original = target[prop];
      
      // 함수가 아닌 프로퍼티 또는 내부 메소드는 그대로 반환
      if (typeof original !== 'function' || prop.startsWith('$')) {
        return original;
      }
      
      // 모델 메소드를 프록시로 감싸서 자동 재연결 및 오류 처리 추가
      return new Proxy(original, {
        apply: async (method, thisArg, args) => {
          try {
            // 연결이 끊어진 경우 재연결 시도
            if (!isConnected) {
              await connect();
            }
            
            return await method.apply(thisArg, args);
          } catch (error) {
            // 연결 오류 감지 및 처리
            if (error.message && error.message.includes('Too many connections')) {
              console.error('🔌 데이터베이스 연결 제한 초과 감지. 연결 복구 시도 중...');
              isConnected = false;
              
              // 잠시 대기 후 재시도
              await new Promise(resolve => setTimeout(resolve, 1000));
              await connect();
              
              // 재시도
              console.log('🔌 쿼리 재시도 중...');
              return await method.apply(thisArg, args);
            }
            
            // 다른 오류는 그대로 전파
            throw error;
          }
        }
      });
    }
  });
})();

// 싱글톤 인스턴스 내보내기
module.exports = global.__prismaClient; 