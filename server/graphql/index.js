const { GraphQLScalarType, Kind } = require('graphql');
const path = require('path');
const fs = require('fs');
const { ApolloServer } = require('apollo-server');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http = require('http');

// Custom scalar for DateTime
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom scalar for JSON
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((obj, field) => {
          obj[field.name.value] = field.value.value;
          return obj;
        }, {});
      default:
        return null;
    }
  },
});

// Import all query resolvers
const queriesPath = path.join(__dirname, 'queries');
const queryResolvers = {};

fs.readdirSync(queriesPath).forEach(file => {
  if (file.endsWith('.js')) {
    const resolver = require(path.join(queriesPath, file));
    Object.keys(resolver).forEach(key => {
      if (typeof resolver[key] === 'function') {
        queryResolvers[key] = resolver[key];
      }
    });
  }
});

// Import all mutation resolvers
const mutationsPath = path.join(__dirname, 'mutations');
const mutationResolvers = {};

fs.readdirSync(mutationsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const mutation = require(path.join(mutationsPath, file));
    Object.keys(mutation).forEach(key => {
      if (typeof mutation[key] === 'function') {
        mutationResolvers[key] = mutation[key];
      }
    });
  }
});

// Import all type resolvers
const typeResolvers = require('./types');

// Import resolvers.js with getSearchResults resolver
const resolvers = require('./resolvers');

// Make sure page5 resolvers are properly loaded
console.log('Loaded query resolvers:', Object.keys(queryResolvers));
console.log('Loaded mutation resolvers:', Object.keys(mutationResolvers));
console.log('Loaded type resolvers:', Object.keys(typeResolvers));

const resolvers = {
  DateTime: dateTimeScalar,
  JSON: jsonScalar,
  Query: queryResolvers,
  Mutation: mutationResolvers,
  ...typeResolvers
};

// Setup Apollo Server
async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      // Return a custom error message to client
      return {
        message: error.message,
        path: error.path,
        extensions: error.extensions
      };
    },
    context: ({ req }) => {
      // Extract user info from request
      const user = req.user || null;
      return { user };
    }
  });

  // Start the server
  await server.start();

  // Apply middleware
  server.applyMiddleware({ app, path: '/graphql' });

  // Serve static files if needed
  app.use(express.static(path.join(__dirname, '../public')));

  // Return the app and http server
  return { app, httpServer };
}

module.exports = startApolloServer; 