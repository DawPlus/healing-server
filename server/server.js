require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const loginRouter = require('./Router/login');
const prisma = require('./prisma/prismaClient');

const app = express();

app.use(express.json());
app.use(cookieParser('foresthealing'));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://statistics.gabia.io",
    "http://ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com:3000",
    "http://ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com",
    "ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com:3000",
    "ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com",
    "https://highhealing1.gabia.io",
    "https://highhealing1.gabia.io:3000"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(session({
  name: 'healing',
  secret: 'forestHealing',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/api', loginRouter);

app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/downloads', filename + ".xlsx");
  console.log(filename, filePath);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('파일 다운로드 오류:', err);
      res.status(404).send('파일을 찾을 수 없습니다.');
    }
  });
});

// 환경별 정적 파일 설정
if (process.env.NODE_ENV === 'development') {
  // 개발환경: 정적 파일 서빙 없음 (클라이언트는 별도 포트에서 실행)
  console.log('🔧 개발 모드: 클라이언트는 별도 포트(3000)에서 실행됩니다.');
} else {
  // 프로덕션: 빌드된 정적 파일 서빙
  const prodBuildPath = path.resolve(__dirname, '../build');
  const devBuildPath = path.resolve(__dirname, '../client/build');
  const buildPath = fs.existsSync(prodBuildPath) ? prodBuildPath : devBuildPath;
  
  console.log(`📁 정적 파일 서빙 경로: ${buildPath}`);
  app.use(express.static(buildPath));
}

// SPA 라우팅 (프로덕션에서만)
if (process.env.NODE_ENV !== 'development') {
  app.get('*', (req, res, next) => {
    if(req.path.split('/')[1] === 'static' || req.path.startsWith('/graphql') || req.path.startsWith('/api')) {
      return next();
    }
    const prodBuildPath = path.resolve(__dirname, '../build');
    const devBuildPath = path.resolve(__dirname, '../client/build');
    const buildPath = fs.existsSync(prodBuildPath) ? prodBuildPath : devBuildPath;
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { 
      req,
      prisma
    };
  },
  formatError: (error) => {
    console.error('GraphQL 오류:', error);
    return {
      message: error.message,
      path: error.path
    };
  }
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('🔌 Prisma connected to database');
    
    await apolloServer.start();
    
    apolloServer.applyMiddleware({ 
      app,
      path: '/graphql',
      cors: false
    });
    
    const PORT = process.env.PORT || 8080;
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL available at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });

    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await prisma.$disconnect();
      server.close(() => {
        console.log('Server shut down successfully');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();