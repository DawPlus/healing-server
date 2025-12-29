const maria = require("mysql");

// // DB 연결 정보
// const dbConfig = {
//     host : "db.statistics.gabia.io",
//     port : 3306, 
//     user : 'statistics',
//     password : "forest113*", 
//     database : "dbstatistics"
//   };
  
const dbConfig = {
  host : "database-1.chks64k84x0v.ap-northeast-2.rds.amazonaws.com",
  port : 3306, 
  user : 'admin',
  password : "City1321!", 
  database : "dbstatistics",
  // Connection pool 최적화 설정
  connectionLimit: 50, // 증가된 연결 수
  acquireTimeout: 60000, // 연결 획득 타임아웃 60초로 증가
  waitForConnections: true,
  queueLimit: 0, // 무제한 대기열
  // 트랜잭션 관련 설정
  multipleStatements: true, // 다중 쿼리 지원
  // 타임아웃 설정
  connectTimeout: 20000, // 연결 타임아웃 20초로 증가
  // 재연결 설정
  reconnect: true
};

  

// DB 연결 풀 생성
const pool = maria.createPool(dbConfig);

// 풀 이벤트 리스너 추가
pool.on('connection', (connection) => {
  console.log('MySQL 연결이 생성되었습니다.');
  // 트랜잭션 관련 설정
  connection.query('SET SESSION transaction_isolation = "READ-COMMITTED"');
  // 락 타임아웃 설정 증가
  connection.query('SET innodb_lock_wait_timeout = 150'); // 150초로 증가
  // 추가 최적화 설정
  connection.query('SET SESSION sql_mode = "NO_ENGINE_SUBSTITUTION"');
  connection.query('SET SESSION wait_timeout = 28800'); // 8시간
  connection.query('SET SESSION interactive_timeout = 28800'); // 8시간
});

pool.on('error', (err) => {
  console.error('MySQL 풀 오류:', err);
});

// 커넥션 풀 상태 정기 점검
setInterval(() => {
  pool.query('SELECT 1', (err, results) => {
    if (err) {
      console.error('Connection pool healthcheck failed:', err);
    }
  });
}, 30000); // 30초마다 실행

// MySQL 쿼리 실행 함수
const executeQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
      // 쿼리 시작 시간 기록
      const startTime = Date.now();
      
      pool.getConnection((err, conn) => {
        if (err) {
          console.error('연결 획득 오류:', err);
          reject(err);
          return;
        }
  
        conn.query(sql, params, (err, rows, fields) => {
          // 쿼리 종료 시간 기록
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // 연결 해제는 항상 쿼리 완료 후에
          conn.release();
          
          // 느린 쿼리 로깅 (500ms 이상 걸린 쿼리)
          if (duration > 500) {
            const query = sql.replace(/\s+/g, ' ').substring(0, 100);
            console.warn(`느린 쿼리 감지 (${duration}ms): ${query}...`);
          }
          
          if (err) {
            console.error('쿼리 실행 오류:', err.code, err.message);
            reject(err);
            return;
          }
  
          // DELETE, UPDATE, INSERT 쿼리의 경우 result 객체를 반환 (affectedRows 포함)
          // SELECT 쿼리의 경우 rows 배열을 반환
          if (sql.trim().toUpperCase().startsWith('DELETE') || 
              sql.trim().toUpperCase().startsWith('UPDATE') || 
              sql.trim().toUpperCase().startsWith('INSERT')) {
            resolve({ affectedRows: rows.affectedRows || 0, insertId: rows.insertId || null });
          } else {
            resolve(rows);
          }
        });
      });
    });
  };
  
module.exports= executeQuery;