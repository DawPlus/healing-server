const { PrismaClient } = require('@prisma/client');
const prisma = require('../../../prisma/prismaClient');

module.exports = {
  getPage1List: async () => {
    return prisma.page1.findMany({
      include: {
        page2_reservations: {
          include: {
            programs: true
          }
        },
        page3: true,
      },
    });
  },
  
  getPage1ById: async (_, { id }) => {
    return prisma.page1.findUnique({
      where: { id },
      include: {
        page2_reservations: {
          include: {
            programs: true
          }
        },
        page3: true,
      },
    });
  },

  // Page1 type resolver
  Page1: {
    page2: (parent) => {
      // If page2_reservations is an array with at least one element, return the first element
      if (parent.page2_reservations && parent.page2_reservations.length > 0) {
        return parent.page2_reservations[0];
      }
      return null;
    },
    page4: (parent) => {
      // If page4_expenses is an array with at least one element, return the first element
      if (parent.page4_expenses && parent.page4_expenses.length > 0) {
        return parent.page4_expenses[0];
      }
      return null;
    }
  }
}; 




