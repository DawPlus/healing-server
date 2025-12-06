const prisma = require('../../../prisma/prismaClient');

const pageFinalMutations = {
  // Create a new PageFinal record
  createPageFinal: async (_, { input }) => {
    try {
      // Check if there's already a PageFinal for this page1_id
      const existingRecord = await prisma.pageFinal.findFirst({
        where: { page1_id: input.page1_id }
      });
      
      if (existingRecord) {
        throw new Error(`A PageFinal record already exists for Page1 ID ${input.page1_id}`);
      }
      
      const result = await prisma.pageFinal.create({
        data: input,
        include: {
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error creating PageFinal:', error);
      throw new Error(`Failed to create PageFinal: ${error.message}`);
    }
  },
  
  // Update an existing PageFinal record
  updatePageFinal: async (_, { id, input }) => {
    try {
      const result = await prisma.pageFinal.update({
        where: { id },
        data: input,
        include: {
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating PageFinal with ID ${id}:`, error);
      throw new Error(`Failed to update PageFinal: ${error.message}`);
    }
  },
  
  // Create or update PageFinal (upsert)
  upsertPageFinal: async (_, { input }) => {
    try {
      const { page1_id, ...data } = input;
      
      // Check if a record already exists
      const existingRecord = await prisma.pageFinal.findFirst({
        where: { page1_id }
      });
      
      if (existingRecord) {
        // Update existing record
        return await prisma.pageFinal.update({
          where: { id: existingRecord.id },
          data,
          include: {
            teacher_expenses: true,
            participant_expenses: true,
            income_items: true
          }
        });
      } else {
        // Create new record
        return await prisma.pageFinal.create({
          data: input,
          include: {
            teacher_expenses: true,
            participant_expenses: true,
            income_items: true
          }
        });
      }
    } catch (error) {
      console.error('Error upserting PageFinal:', error);
      throw new Error(`Failed to upsert PageFinal: ${error.message}`);
    }
  },
  
  // Delete a PageFinal record
  deletePageFinal: async (_, { id }) => {
    try {
      await prisma.pageFinal.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting PageFinal with ID ${id}:`, error);
      throw new Error(`Failed to delete PageFinal: ${error.message}`);
    }
  },
  
  // Teacher expense mutations
  addTeacherExpense: async (_, { pageFinalId, input }) => {
    try {
      const result = await prisma.teacherExpense.create({
        data: {
          ...input,
          page_final_id: pageFinalId
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error adding teacher expense:', error);
      throw new Error(`Failed to add teacher expense: ${error.message}`);
    }
  },
  
  updateTeacherExpense: async (_, { id, input }) => {
    try {
      const result = await prisma.teacherExpense.update({
        where: { id },
        data: input
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating teacher expense with ID ${id}:`, error);
      throw new Error(`Failed to update teacher expense: ${error.message}`);
    }
  },
  
  deleteTeacherExpense: async (_, { id }) => {
    try {
      // 삭제 전 항목 존재 여부 확인
      const expense = await prisma.teacherExpense.findUnique({
        where: { id }
      });
      
      if (!expense) {
        console.log(`Teacher expense with ID ${id} not found. It may have already been deleted.`);
        return true; // 이미 존재하지 않으면 성공으로 처리
      }
      
      await prisma.teacherExpense.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting teacher expense with ID ${id}:`, error);
      throw new Error(`Failed to delete teacher expense: ${error.message}`);
    }
  },
  
  // Participant expense mutations
  addParticipantExpense: async (_, { pageFinalId, input }) => {
    try {
      const result = await prisma.participantExpense.create({
        data: {
          ...input,
          page_final_id: pageFinalId
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error adding participant expense:', error);
      throw new Error(`Failed to add participant expense: ${error.message}`);
    }
  },
  
  updateParticipantExpense: async (_, { id, input }) => {
    try {
      const result = await prisma.participantExpense.update({
        where: { id },
        data: input
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating participant expense with ID ${id}:`, error);
      throw new Error(`Failed to update participant expense: ${error.message}`);
    }
  },
  
  deleteParticipantExpense: async (_, { id }) => {
    try {
      // 삭제 전 항목 존재 여부 확인
      const expense = await prisma.participantExpense.findUnique({
        where: { id }
      });
      
      if (!expense) {
        console.log(`Participant expense with ID ${id} not found. It may have already been deleted.`);
        return true; // 이미 존재하지 않으면 성공으로 처리
      }
      
      await prisma.participantExpense.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting participant expense with ID ${id}:`, error);
      throw new Error(`Failed to delete participant expense: ${error.message}`);
    }
  },
  
  // Income item mutations
  addIncomeItem: async (_, { pageFinalId, input }) => {
    try {
      const result = await prisma.incomeItem.create({
        data: {
          ...input,
          page_final_id: pageFinalId
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error adding income item:', error);
      throw new Error(`Failed to add income item: ${error.message}`);
    }
  },
  
  updateIncomeItem: async (_, { id, input }) => {
    try {
      const result = await prisma.incomeItem.update({
        where: { id },
        data: input
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating income item with ID ${id}:`, error);
      throw new Error(`Failed to update income item: ${error.message}`);
    }
  },
  
  deleteIncomeItem: async (_, { id }) => {
    try {
      // 삭제 전 항목 존재 여부 확인
      const income = await prisma.incomeItem.findUnique({
        where: { id }
      });
      
      if (!income) {
        console.log(`Income item with ID ${id} not found. It may have already been deleted.`);
        return true; // 이미 존재하지 않으면 성공으로 처리
      }
      
      await prisma.incomeItem.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting income item with ID ${id}:`, error);
      throw new Error(`Failed to delete income item: ${error.message}`);
    }
  },
  
  // Update discount info
  updateDiscountInfo: async (_, { pageFinalId, rate, notes }) => {
    try {
      const result = await prisma.pageFinal.update({
        where: { id: pageFinalId },
        data: {
          discount_rate: rate,
          discount_notes: notes
        },
        include: {
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating discount info for PageFinal ID ${pageFinalId}:`, error);
      throw new Error(`Failed to update discount info: ${error.message}`);
    }
  }
};

module.exports = pageFinalMutations; 