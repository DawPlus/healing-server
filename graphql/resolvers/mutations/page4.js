const prisma = require('../../../prisma/prismaClient');

module.exports = {
  createPage4: async (_, { input }) => {
    try {
      // Calculate total budget if material_total and etc_expense_total are provided
      const materialTotal = input.material_total || 0;
      const etcExpenseTotal = input.etc_expense_total || 0;
      const totalBudget = materialTotal + etcExpenseTotal;

      const newPage4 = await prisma.page4.create({
        data: {
          project_name: input.project_name,
          created_by: input.created_by,
          page1_id: input.page1_id,
          material_total: materialTotal,
          etc_expense_total: etcExpenseTotal,
          total_budget: totalBudget
        },
        include: {
          page1: true,
          materials: true,
          expenses: true
        }
      });
      
      return newPage4;
    } catch (error) {
      console.error('Error creating Page4:', error);
      throw new Error(`Failed to create Page4 record: ${error.message}`);
    }
  },

  updatePage4: async (_, { id, input }) => {
    try {
      // Calculate total budget if material_total and etc_expense_total are provided
      const materialTotal = input.material_total || 0;
      const etcExpenseTotal = input.etc_expense_total || 0;
      const totalBudget = materialTotal + etcExpenseTotal;

      const updatedPage4 = await prisma.page4.update({
        where: { id },
        data: {
          project_name: input.project_name,
          created_by: input.created_by,
          page1_id: input.page1_id,
          material_total: materialTotal,
          etc_expense_total: etcExpenseTotal,
          total_budget: totalBudget
        },
        include: {
          page1: true,
          materials: true,
          expenses: true
        }
      });
      
      return updatedPage4;
    } catch (error) {
      console.error(`Error updating Page4 with ID ${id}:`, error);
      throw new Error(`Failed to update Page4 record: ${error.message}`);
    }
  },

  deletePage4: async (_, { id }) => {
    try {
      // Deleting the Page4 record will cascade delete all related materials and expenses
      // due to the onDelete: Cascade in the Prisma schema
      await prisma.page4.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting Page4 with ID ${id}:`, error);
      throw new Error(`Failed to delete Page4 record: ${error.message}`);
    }
  },
  
  createPage4Material: async (_, { input }) => {
    try {
      const newMaterial = await prisma.page4Material.create({
        data: {
          expense_id: input.expense_id,
          material_type: input.material_type,
          name: input.name,
          amount: input.amount,
          quantity: input.quantity,
          total: input.total,
          note: input.note
        }
      });
      
      // Update the material_total and total_budget in the parent Page4 record
      const materials = await prisma.page4Material.findMany({
        where: { expense_id: input.expense_id }
      });
      
      const materialTotal = materials.reduce((sum, material) => sum + material.total, 0);
      
      const expense = await prisma.page4.findUnique({
        where: { id: input.expense_id }
      });
      
      await prisma.page4.update({
        where: { id: input.expense_id },
        data: {
          material_total: materialTotal,
          total_budget: materialTotal + (expense.etc_expense_total || 0)
        }
      });
      
      return newMaterial;
    } catch (error) {
      console.error('Error creating Page4 Material:', error);
      throw new Error(`Failed to create Page4 Material record: ${error.message}`);
    }
  },
  
  updatePage4Material: async (_, { id, input }) => {
    try {
      const updatedMaterial = await prisma.page4Material.update({
        where: { id },
        data: {
          expense_id: input.expense_id,
          material_type: input.material_type,
          name: input.name,
          amount: input.amount,
          quantity: input.quantity,
          total: input.total,
          note: input.note
        }
      });
      
      // Update the material_total and total_budget in the parent Page4 record
      const materials = await prisma.page4Material.findMany({
        where: { expense_id: input.expense_id }
      });
      
      const materialTotal = materials.reduce((sum, material) => sum + material.total, 0);
      
      const expense = await prisma.page4.findUnique({
        where: { id: input.expense_id }
      });
      
      await prisma.page4.update({
        where: { id: input.expense_id },
        data: {
          material_total: materialTotal,
          total_budget: materialTotal + (expense.etc_expense_total || 0)
        }
      });
      
      return updatedMaterial;
    } catch (error) {
      console.error(`Error updating Page4 Material with ID ${id}:`, error);
      throw new Error(`Failed to update Page4 Material record: ${error.message}`);
    }
  },
  
  deletePage4Material: async (_, { id }) => {
    try {
      // Get the expense_id before deleting
      const material = await prisma.page4Material.findUnique({
        where: { id }
      });
      
      if (!material) {
        throw new Error(`Material with ID ${id} not found`);
      }
      
      const expense_id = material.expense_id;
      
      // Delete the material
      await prisma.page4Material.delete({
        where: { id }
      });
      
      // Update the material_total and total_budget in the parent Page4 record
      const remainingMaterials = await prisma.page4Material.findMany({
        where: { expense_id }
      });
      
      const materialTotal = remainingMaterials.reduce((sum, material) => sum + material.total, 0);
      
      const expense = await prisma.page4.findUnique({
        where: { id: expense_id }
      });
      
      await prisma.page4.update({
        where: { id: expense_id },
        data: {
          material_total: materialTotal,
          total_budget: materialTotal + (expense.etc_expense_total || 0)
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting Page4 Material with ID ${id}:`, error);
      throw new Error(`Failed to delete Page4 Material record: ${error.message}`);
    }
  },
  
  createPage4Expense: async (_, { input }) => {
    try {
      const newExpense = await prisma.page4Expense.create({
        data: {
          expense_id: input.expense_id,
          name: input.name,
          amount: input.amount,
          expense_type: input.expense_type,
          quantity: input.quantity,
          price: input.price,
          note: input.note
        }
      });
      
      // Update the etc_expense_total and total_budget in the parent Page4 record
      const expenses = await prisma.page4Expense.findMany({
        where: { expense_id: input.expense_id }
      });
      
      const etcExpenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const mainExpense = await prisma.page4.findUnique({
        where: { id: input.expense_id }
      });
      
      await prisma.page4.update({
        where: { id: input.expense_id },
        data: {
          etc_expense_total: etcExpenseTotal,
          total_budget: (mainExpense.material_total || 0) + etcExpenseTotal
        }
      });
      
      return newExpense;
    } catch (error) {
      console.error('Error creating Page4 Expense:', error);
      throw new Error(`Failed to create Page4 Expense record: ${error.message}`);
    }
  },
  
  updatePage4Expense: async (_, { id, input }) => {
    try {
      const updatedExpense = await prisma.page4Expense.update({
        where: { id },
        data: {
          expense_id: input.expense_id,
          name: input.name,
          amount: input.amount,
          expense_type: input.expense_type,
          quantity: input.quantity,
          price: input.price,
          note: input.note
        }
      });
      
      // Update the etc_expense_total and total_budget in the parent Page4 record
      const expenses = await prisma.page4Expense.findMany({
        where: { expense_id: input.expense_id }
      });
      
      const etcExpenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const mainExpense = await prisma.page4.findUnique({
        where: { id: input.expense_id }
      });
      
      await prisma.page4.update({
        where: { id: input.expense_id },
        data: {
          etc_expense_total: etcExpenseTotal,
          total_budget: (mainExpense.material_total || 0) + etcExpenseTotal
        }
      });
      
      return updatedExpense;
    } catch (error) {
      console.error(`Error updating Page4 Expense with ID ${id}:`, error);
      throw new Error(`Failed to update Page4 Expense record: ${error.message}`);
    }
  },
  
  deletePage4Expense: async (_, { id }) => {
    try {
      // Get the expense_id before deleting
      const expense = await prisma.page4Expense.findUnique({
        where: { id }
      });
      
      if (!expense) {
        throw new Error(`Expense with ID ${id} not found`);
      }
      
      const expense_id = expense.expense_id;
      
      // Delete the expense
      await prisma.page4Expense.delete({
        where: { id }
      });
      
      // Update the etc_expense_total and total_budget in the parent Page4 record
      const remainingExpenses = await prisma.page4Expense.findMany({
        where: { expense_id }
      });
      
      const etcExpenseTotal = remainingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const mainExpense = await prisma.page4.findUnique({
        where: { id: expense_id }
      });
      
      await prisma.page4.update({
        where: { id: expense_id },
        data: {
          etc_expense_total: etcExpenseTotal,
          total_budget: (mainExpense.material_total || 0) + etcExpenseTotal
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting Page4 Expense with ID ${id}:`, error);
      throw new Error(`Failed to delete Page4 Expense record: ${error.message}`);
    }
  }
};
