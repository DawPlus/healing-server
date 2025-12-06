const prisma = require('../../../prisma/prismaClient');

const pageFinalTypeResolvers = {
  PageFinal: {
    page1: async (parent) => {
      try {
        return await prisma.page1.findUnique({
          where: { id: parent.page1_id }
        });
      } catch (error) {
        console.error('Error resolving page1:', error);
        throw new Error(`Failed to load related page1: ${error.message}`);
      }
    },
    teacher_expenses: async (parent) => {
      try {
        return await prisma.teacherExpense.findMany({
          where: { page_final_id: parent.id },
          orderBy: [
            { is_planned: 'desc' },
            { category: 'asc' }
          ]
        });
      } catch (error) {
        console.error('Error resolving teacher expenses:', error);
        throw new Error(`Failed to load teacher expenses: ${error.message}`);
      }
    },
    participant_expenses: async (parent) => {
      try {
        return await prisma.participantExpense.findMany({
          where: { page_final_id: parent.id },
          orderBy: [
            { is_planned: 'desc' },
            { category: 'asc' }
          ]
        });
      } catch (error) {
        console.error('Error resolving participant expenses:', error);
        throw new Error(`Failed to load participant expenses: ${error.message}`);
      }
    },
    income_items: async (parent) => {
      try {
        return await prisma.incomeItem.findMany({
          where: { page_final_id: parent.id },
          orderBy: { category: 'asc' }
        });
      } catch (error) {
        console.error('Error resolving income items:', error);
        throw new Error(`Failed to load income items: ${error.message}`);
      }
    }
  }
};

module.exports = pageFinalTypeResolvers; 