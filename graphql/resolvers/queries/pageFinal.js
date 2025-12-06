const prisma = require('../../../prisma/prismaClient');

const pageFinalQueries = {
  // Get all PageFinal records
  getPageFinalList: async () => {
    try {
      const results = await prisma.pageFinal.findMany({
        include: {
          page1: true,
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      return results;
    } catch (error) {
      console.error('Error fetching PageFinal list:', error);
      throw new Error(`Failed to fetch PageFinal list: ${error.message}`);
    }
  },
  
  // Get a specific PageFinal record by ID
  getPageFinalById: async (_, { id }) => {
    try {
      const result = await prisma.pageFinal.findUnique({
        where: { id },
        include: {
          page1: true,
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      
      if (!result) {
        throw new Error(`PageFinal with ID ${id} not found`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching PageFinal with ID ${id}:`, error);
      throw new Error(`Failed to fetch PageFinal: ${error.message}`);
    }
  },
  
  // Get a PageFinal record by Page1 ID
  getPageFinalByPage1Id: async (_, { page1_id }) => {
    try {
      const result = await prisma.pageFinal.findFirst({
        where: { page1_id },
        include: {
          page1: true,
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      
      return result; // This can be null if no record exists
    } catch (error) {
      console.error(`Error fetching PageFinal for Page1 ID ${page1_id}:`, error);
      throw new Error(`Failed to fetch PageFinal for Page1: ${error.message}`);
    }
  }
};

module.exports = pageFinalQueries; 