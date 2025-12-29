const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // 개발환경에서 로컬 서버로 프록시
  const targetUrl = 'http://localhost:8080'
    
  app.use(
    '/api',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
    }),
  );
  
  app.use(
    '/graphql',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
    }),
  );
};
