require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const loginRouter = require('./Router/login');
const prisma = require('./prisma/prismaClient');

// Load environment variables

// Create Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(cookieParser('foresthealing'));
app.use(express.urlencoded({ extended: true }));

// Configure CORS
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://statistics.gabia.io",
    "http://ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com:3000",
    "http://ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com",
    "ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com:3000",
    "ec2-3-35-210-58.ap-northeast-2.compute.amazonaws.com"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configure session
app.use(session({
  name: 'healing',
  secret: 'forestHealing',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Add login router for authentication
app.use('/api', loginRouter);

// File download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/downloads', filename + ".xlsx");
  console.log(filename, filePath);

  // Send the download file as a response
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('파일 다운로드 오류:', err);
      res.status(404).send('파일을 찾을 수 없습니다.');
    }
  });
});

// Serve static files
app.use('/', express.static(path.resolve(__dirname, './build')));
app.get('*', (req, res, next) => {
  if(req.path.split('/')[1] === 'static' || req.path.startsWith('/graphql')) return next();
  res.sendFile(path.resolve(__dirname, './build/index.html'));
});

// Configure Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { 
      req,
      prisma // Include Prisma client in the context
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

// Start the server
async function startServer() {
  try {
    // Connect Prisma before starting the server
    await prisma.$connect();
    console.log('🔌 Prisma connected to database');
    
    // Start Apollo Server
    await apolloServer.start();
    
    // Apply GraphQL middleware
    apolloServer.applyMiddleware({ 
      app,
      path: '/graphql',
      cors: false // We're already handling CORS with the Express middleware
    });
    
    // Set port
    const PORT = process.env.PORT || 8080;
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🚀 GraphQL available at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    });

    // Graceful shutdown
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

// Start the server
startServer();