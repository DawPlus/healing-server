const prisma = require('../../../prisma/prismaClient');

module.exports = {
  getUserTemp: async (_, { agency, openday }) => {
    try {
      const userTemp = await prisma.userTemp.findMany({
        where: {
          agency,
          openday
        },
        orderBy: {
          seq: 'asc'
        }
      });
      
      return userTemp || [];
    } catch (error) {
      console.error('Error fetching user temp data:', error);
      return [];
    }
  },

  getUserTempAgencies: async () => {
    try {
      const agencies = await prisma.userTempAgency.findMany({
        orderBy: {
          created_at: 'desc'
        }
      });
      
      return agencies || [];
    } catch (error) {
      console.error('Error fetching user temp agencies:', error);
      return [];
    }
  }
}; 