// Type resolvers for Page1 entities
const prisma = require('../../../prisma/prismaClient');

const page1TypeResolvers = {
  Page1: {
    // Resolver for page2_reservations field
    page2_reservations: async (parent) => {
      try {
        if (!parent.id) return [];
        
        return await prisma.page2.findMany({
          where: { page1_id: parent.id },
          include: { programs: true }
        });
      } catch (error) {
        console.error('Error resolving Page1.page2_reservations:', error);
        return [];
      }
    },
    
    // Resolver for page4_expenses field
    page4_expenses: async (parent) => {
      try {
        if (!parent.id) return [];
        
        return await prisma.page4.findMany({
          where: { page1_id: parent.id },
          include: { materials: true, expenses: true }
        });
      } catch (error) {
        console.error('Error resolving Page1.page4_expenses:', error);
        return [];
      }
    }
  }
};

module.exports = page1TypeResolvers; 