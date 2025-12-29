const fs = require('fs');
const path = require('path');

// Import specific type resolvers to ensure they're loaded
const page1TypeResolvers = require('./page1');
const page3TypeResolvers = require('./page3');
const page5TypeResolvers = require('./page5');
const pageFinalTypeResolvers = require('./pageFinal');

// Combine all type resolvers
const typeResolvers = {
  ...page1TypeResolvers,
  ...page3TypeResolvers,
  ...page5TypeResolvers,
  ...pageFinalTypeResolvers
};

// Additional debugging for the loaded type resolvers
Object.keys(typeResolvers).forEach(type => {
  console.log(`Loaded type resolver for: ${type}`);
  if (typeResolvers[type]) {
    console.log(`Fields: ${Object.keys(typeResolvers[type])}`);
  }
});

module.exports = typeResolvers; 