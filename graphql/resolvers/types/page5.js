// Type resolvers for Page5 entities
const prisma = require('../../../prisma/prismaClient');

const page5TypeResolvers = {
  Page5Document: {
    // Resolver to get the associated reservation (Page1) for a document
    reservation: async (parent) => {
      try {
        if (!parent.page1_id) return null;
        
        return await prisma.page1.findUnique({
          where: { id: parent.page1_id }
        });
      } catch (error) {
        console.error('Error resolving Page5Document.reservation:', error);
        throw new Error('Failed to fetch reservation for document');
      }
    }
  },
  
  // Add more type resolvers as needed for other Page5 types
};

module.exports = page5TypeResolvers; 