// express 애플리케이션이 있다고 가정하고, express 서버에 GraphQL을 추가하는 코드만 작성합니다.
// 실제 서버 파일이 다를 수 있으므로 아래 코드를 적절한 위치에 추가해주세요.

// GraphQL 관련 모듈 가져오기
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

// Apollo Server 설정
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // 필요한 경우 JWT 토큰 검증 등의 인증 로직 추가
    return { req };
  },
  formatError: (error) => {
    console.error('GraphQL 오류:', error);
    return {
      message: error.message,
      path: error.path
    };
  }
});

// Express 애플리케이션에 Apollo Server 연결
async function startApolloServer(app) {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  console.log(`🚀 GraphQL 서버 준비 완료: ${apolloServer.graphqlPath}`);
}

// 서버 시작 시 아래 코드를 호출하세요:
// startApolloServer(app); 