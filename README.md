# 하이 힐링원 프로젝트 정보  
URL : highhealing1.gabia.io  
테스트 경로 : test/1111  

 
##   사용 기술 스택
- **Frontend** : React.js (Gabia 웹컨테이너에서 정적 빌드 배포)  
- **Backend** : Node.js + Express  
- **ORM** : Prisma  
- **DB** : AWS RDS MySQL  
- **프로세스 관리** : PM2  
- 구성 흐름  
  - React.js (Client)  
    → Express API(Server)  
    → Prisma / MySQL2  
    → AWS RDS  
 
##   호스팅 정보 (Gabia)
- 사이트 : gabia.com  
- 계정 ID : foresthealing113  
- 계정 PW : forest113*  
- 접속 경로  
- 로그인 → 상단 **My 가비아** → **웹컨테이너** → highhealing1.gabia.io  
 

##   웹서버 접속 정보 (SFTP / SSH)
- 서버 주소 : highhealing1.gabia.io  
- 접속 ID : highhealing1  
- 접속 PW : forest113*  



##   서버 실행(PM2) 정보
```bash
[guser@nodejs ~]$ pm2 list

┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ forest-healing     │ fork     │ 3    │ online    │ 0%       │ 128.2mb  │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

### Server Project Infos 
# Package.json 
"dependencies": {
    "@prisma/client": "^5.5.2",
    "apollo-server-express": "^3.12.1",
    "body-parser": "^1.19.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "crypto-js": "^4.2.0",
    "decimal.js": "^10.5.0",
    "dotenv": "^16.3.1",
    "express": "^4.17.1",
    "express-session": "^1.18.1",
    "graphql": "^16.8.1",
    "graphql-type-json": "^0.3.2",
    "moment": "^2.30.1",
    "mysql": "^2.18.1",
    "mysql2": "^3.6.5",
    "react-table": "^7.8.0"
},
"devDependencies": {
    "nodemon": "^2.0.15",
    "prisma": "^5.5.2"
}

## Db Connection Info  
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

  
