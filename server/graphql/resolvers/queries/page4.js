const prisma = require('../../../prisma/prismaClient');

module.exports = {
  getPage4List: async () => {
    try {
      return prisma.page4.findMany({
        include: {
          page1: true,
          materials: true,
          expenses: true
        }
      });
    } catch (error) {
      console.error('Error fetching Page4 list:', error);
      throw new Error(`Failed to fetch Page4 list: ${error.message}`);
    }
  },
  
  getPage4ById: async (_, { id }) => {
    try {
      return prisma.page4.findUnique({
        where: { id },
        include: {
          page1: true,
          materials: true,
          expenses: true
        }
      });
    } catch (error) {
      console.error(`Error fetching Page4 with ID ${id}:`, error);
      throw new Error(`Failed to fetch Page4: ${error.message}`);
    }
  },
  
  getPage4ByPage1Id: async (_, { page1Id }) => {
    try {
      const page4 = await prisma.page4.findFirst({
        where: { page1_id: page1Id },
        include: {
          page1: true,
          materials: true,
          expenses: true
        }
      });
      
      return page4;
    } catch (error) {
      console.error(`Error fetching Page4 with page1_id ${page1Id}:`, error);
      throw new Error(`Failed to fetch Page4: ${error.message}`);
    }
  },
  
  getPage4Materials: async (_, { expenseId }) => {
    try {
      return prisma.page4Material.findMany({
        where: { expense_id: expenseId }
      });
    } catch (error) {
      console.error(`Error fetching Page4 materials for expense ID ${expenseId}:`, error);
      throw new Error(`Failed to fetch Page4 materials: ${error.message}`);
    }
  },
  
  getPage4Expenses: async (_, { expenseId }) => {
    try {
      return prisma.page4Expense.findMany({
        where: { expense_id: expenseId }
      });
    } catch (error) {
      console.error(`Error fetching Page4 expenses for expense ID ${expenseId}:`, error);
      throw new Error(`Failed to fetch Page4 expenses: ${error.message}`);
    }
  },
  
  // Page4 type resolver
  Page4: {
    page1: async (parent, _, context) => {
      if (parent.page1) {
        return parent.page1;
      }
      
      if (!parent.page1_id) {
        return null;
      }
      
      return await context.prisma.page1.findUnique({
        where: { id: parent.page1_id }
      });
    },
    materials: async (parent, _, context) => {
      if (parent.materials) {
        return parent.materials;
      }
      
      return await context.prisma.page4Material.findMany({
        where: { expense_id: parent.id }
      });
    },
    expenses: async (parent, _, context) => {
      if (parent.expenses) {
        return parent.expenses;
      }
      
      return await context.prisma.page4Expense.findMany({
        where: { expense_id: parent.id }
      });
    }
  },
  
  // Page4Material type resolver
  Page4Material: {
    expense: async (parent, _, context) => {
      if (parent.expense) {
        return parent.expense;
      }
      
      return await context.prisma.page4.findUnique({
        where: { id: parent.expense_id }
      });
    }
  },
  
  // Page4Expense type resolver
  Page4Expense: {
    expense: async (parent, _, context) => {
      if (parent.expense) {
        return parent.expense;
      }
      
      return await context.prisma.page4.findUnique({
        where: { id: parent.expense_id }
      });
    }
  }
};
