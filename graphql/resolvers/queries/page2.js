const prisma = require('../../../prisma/prismaClient');

module.exports = {
  getPage2List: async () => {
    try {
      return prisma.page2.findMany({
        include: {
          page1: true,
          programs: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching Page2 list:', error);
      throw new Error(`Failed to fetch Page2 list: ${error.message}`);
    }
  },
  
  getPage2ById: async (_, { id }) => {
    try {
      return prisma.page2.findUnique({
        where: { id },
        include: {
          page1: true,
          programs: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error fetching Page2 with ID ${id}:`, error);
      throw new Error(`Failed to fetch Page2: ${error.message}`);
    }
  },
  
  getPage2ByPage1Id: async (_, { page1Id }) => {
    try {
      console.log(`Fetching Page2 with page1_id ${page1Id}`);
      
      // Check if page1_id exists
      const page1 = await prisma.page1.findUnique({
        where: { id: page1Id }
      });
      
      if (!page1) {
        console.log(`Page1 with id ${page1Id} not found`);
        return null;
      }
      
      const result = await prisma.page2.findFirst({
        where: { page1_id: page1Id },
        include: {
          page1: true,
          programs: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      });
      
      return result; // This can be null if no record found
    } catch (error) {
      console.error(`Error fetching Page2 with page1_id ${page1Id}:`, error);
      throw new Error(`Failed to fetch Page2: ${error.message}`);
    }
  },
  
  getPage2Programs: async (_, { reservationId }) => {
    try {
      return prisma.page2Program.findMany({
        where: { reservation_id: reservationId },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      console.error(`Error fetching Page2 programs for reservation ID ${reservationId}:`, error);
      throw new Error(`Failed to fetch Page2 programs: ${error.message}`);
    }
  },
  
  // Page2 type resolver
  Page2: {
    page1: async (parent, _, context) => {
      if (parent.page1) {
        return parent.page1;
      }
      
      return await context.prisma.page1.findUnique({
        where: { id: parent.page1_id }
      });
    },
    programs: async (parent, _, context) => {
      if (parent.programs) {
        return parent.programs;
      }
      
      return await context.prisma.page2Program.findMany({
        where: { reservation_id: parent.id },
        orderBy: { date: 'asc' }
      });
    }
  },
  
  // Page2Program type resolver
  Page2Program: {
    reservation: async (parent, _, context) => {
      if (parent.reservation) {
        return parent.reservation;
      }
      
      return await context.prisma.page2.findUnique({
        where: { id: parent.reservation_id }
      });
    }
  }
};
