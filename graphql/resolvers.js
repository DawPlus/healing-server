const { GraphQLScalarType, Kind } = require('graphql');
const path = require('path');
const fs = require('fs');

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
const queriesPath = path.join(__dirname, 'resolvers/queries');
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

// Import programList resolver
const programListResolver = require('./resolvers/queries/programList');
Object.keys(programListResolver).forEach(key => {
  queryResolvers[key] = programListResolver[key];
});

// Import yearMonthResult resolver
const yearMonthResultResolver = require('./resolvers/queries/yearMonthResult');
Object.keys(yearMonthResultResolver).forEach(key => {
  queryResolvers[key] = yearMonthResultResolver[key];
});

// Import all mutation resolvers
const mutationsPath = path.join(__dirname, 'resolvers/mutations');
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
const typeResolvers = require('./resolvers/types');

// Make sure resolvers are properly loaded
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

module.exports = resolvers; 