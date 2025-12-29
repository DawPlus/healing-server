const prisma = require('../../../prisma/prismaClient');

const pageFinalMutations = {
  // Create a new PageFinal record
  createPageFinal: async (_, { input }) => {
    console.log('[PageFinal Server] createPageFinal 시작:', { input });
    try {
      // Check if there's already a PageFinal for this page1_id
      const existingRecord = await prisma.pageFinal.findFirst({
        where: { page1_id: input.page1_id }
      });
      
      if (existingRecord) {
        console.log('[PageFinal Server] createPageFinal: 이미 존재하는 레코드', {
          existingId: existingRecord.id,
          page1_id: input.page1_id
        });
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
      
      console.log('[PageFinal Server] createPageFinal 성공:', {
        id: result.id,
        page1_id: result.page1_id
      });
      
      return result;
    } catch (error) {
      console.error('[PageFinal Server] createPageFinal 오류:', error);
      throw new Error(`Failed to create PageFinal: ${error.message}`);
    }
  },
  
  // Update an existing PageFinal record
  updatePageFinal: async (_, { id, input }) => {
    console.log('[PageFinal Server] updatePageFinal 시작:', { id, input });
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
      
      console.log('[PageFinal Server] updatePageFinal 성공:', {
        id: result.id,
        page1_id: result.page1_id
      });
      
      return result;
    } catch (error) {
      console.error(`[PageFinal Server] updatePageFinal 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to update PageFinal: ${error.message}`);
    }
  },
  
  // Create or update PageFinal (upsert)
  upsertPageFinal: async (_, { input }) => {
    console.log('[PageFinal Server] upsertPageFinal 시작:', { input });
    try {
      const { page1_id, ...data } = input;
      
      // Check if a record already exists
      const existingRecord = await prisma.pageFinal.findFirst({
        where: { page1_id }
      });
      
      if (existingRecord) {
        console.log('[PageFinal Server] upsertPageFinal: 기존 레코드 업데이트', {
          existingId: existingRecord.id,
          page1_id
        });
        // Update existing record
        const result = await prisma.pageFinal.update({
          where: { id: existingRecord.id },
          data,
          include: {
            teacher_expenses: true,
            participant_expenses: true,
            income_items: true
          }
        });
        
        console.log('[PageFinal Server] upsertPageFinal 업데이트 성공:', {
          id: result.id,
          page1_id: result.page1_id
        });
        
        return result;
      } else {
        console.log('[PageFinal Server] upsertPageFinal: 새 레코드 생성', { page1_id });
        // Create new record
        const result = await prisma.pageFinal.create({
          data: input,
          include: {
            teacher_expenses: true,
            participant_expenses: true,
            income_items: true
          }
        });
        
        console.log('[PageFinal Server] upsertPageFinal 생성 성공:', {
          id: result.id,
          page1_id: result.page1_id
        });
        
        return result;
      }
    } catch (error) {
      console.error('[PageFinal Server] upsertPageFinal 오류:', error);
      throw new Error(`Failed to upsert PageFinal: ${error.message}`);
    }
  },
  
  // Delete a PageFinal record
  deletePageFinal: async (_, { id }) => {
    console.log('[PageFinal Server] deletePageFinal 시작:', { id });
    try {
      await prisma.pageFinal.delete({
        where: { id }
      });
      
      console.log('[PageFinal Server] deletePageFinal 성공:', { id });
      return true;
    } catch (error) {
      console.error(`[PageFinal Server] deletePageFinal 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to delete PageFinal: ${error.message}`);
    }
  },
  
  // Teacher expense mutations
  addTeacherExpense: async (_, { pageFinalId, input }) => {
    console.log('[PageFinal Server] addTeacherExpense 시작:', { pageFinalId, input });
    try {
      const result = await prisma.teacherExpense.create({
        data: {
          ...input,
          page_final_id: pageFinalId
        }
      });
      
      console.log('[PageFinal Server] addTeacherExpense 성공:', {
        id: result.id,
        pageFinalId,
        category: result.category,
        amount: result.amount,
        isPlanned: result.is_planned
      });
      
      return result;
    } catch (error) {
      console.error('[PageFinal Server] addTeacherExpense 오류:', error);
      throw new Error(`Failed to add teacher expense: ${error.message}`);
    }
  },
  
  updateTeacherExpense: async (_, { id, input }) => {
    console.log('[PageFinal Server] updateTeacherExpense 시작:', { id, input });
    try {
      const result = await prisma.teacherExpense.update({
        where: { id },
        data: input
      });
      
      console.log('[PageFinal Server] updateTeacherExpense 성공:', {
        id: result.id,
        category: result.category,
        amount: result.amount,
        isPlanned: result.is_planned
      });
      
      return result;
    } catch (error) {
      console.error(`[PageFinal Server] updateTeacherExpense 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to update teacher expense: ${error.message}`);
    }
  },
  
  deleteTeacherExpense: async (_, { id }) => {
    console.log('[PageFinal Server] deleteTeacherExpense 시작:', { id });
    try {
      // 삭제 전 항목 존재 여부 확인
      const expense = await prisma.teacherExpense.findUnique({
        where: { id }
      });
      
      if (!expense) {
        console.log(`[PageFinal Server] deleteTeacherExpense: 항목 없음 (ID: ${id})`);
        return true; // 이미 존재하지 않으면 성공으로 처리
      }
      
      await prisma.teacherExpense.delete({
        where: { id }
      });
      
      console.log('[PageFinal Server] deleteTeacherExpense 성공:', { id });
      return true;
    } catch (error) {
      console.error(`[PageFinal Server] deleteTeacherExpense 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to delete teacher expense: ${error.message}`);
    }
  },
  
  // Participant expense mutations
  addParticipantExpense: async (_, { pageFinalId, input }) => {
    console.log('[PageFinal Server] addParticipantExpense 시작:', { pageFinalId, input });
    try {
      const result = await prisma.participantExpense.create({
        data: {
          ...input,
          page_final_id: pageFinalId
        }
      });
      
      console.log('[PageFinal Server] addParticipantExpense 성공:', {
        id: result.id,
        pageFinalId,
        category: result.category,
        amount: result.amount,
        isPlanned: result.is_planned
      });
      
      return result;
    } catch (error) {
      console.error('[PageFinal Server] addParticipantExpense 오류:', error);
      throw new Error(`Failed to add participant expense: ${error.message}`);
    }
  },
  
  updateParticipantExpense: async (_, { id, input }) => {
    console.log('[PageFinal Server] updateParticipantExpense 시작:', { id, input });
    try {
      const result = await prisma.participantExpense.update({
        where: { id },
        data: input
      });
      
      console.log('[PageFinal Server] updateParticipantExpense 성공:', {
        id: result.id,
        category: result.category,
        amount: result.amount,
        isPlanned: result.is_planned
      });
      
      return result;
    } catch (error) {
      console.error(`[PageFinal Server] updateParticipantExpense 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to update participant expense: ${error.message}`);
    }
  },
  
  deleteParticipantExpense: async (_, { id }) => {
    console.log('[PageFinal Server] deleteParticipantExpense 시작:', { id });
    try {
      // 삭제 전 항목 존재 여부 확인
      const expense = await prisma.participantExpense.findUnique({
        where: { id }
      });
      
      if (!expense) {
        console.log(`[PageFinal Server] deleteParticipantExpense: 항목 없음 (ID: ${id})`);
        return true; // 이미 존재하지 않으면 성공으로 처리
      }
      
      await prisma.participantExpense.delete({
        where: { id }
      });
      
      console.log('[PageFinal Server] deleteParticipantExpense 성공:', { id });
      return true;
    } catch (error) {
      console.error(`[PageFinal Server] deleteParticipantExpense 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to delete participant expense: ${error.message}`);
    }
  },
  
  // Income item mutations
  addIncomeItem: async (_, { pageFinalId, input }) => {
    console.log('[PageFinal Server] addIncomeItem 시작:', { pageFinalId, input });
    try {
      const result = await prisma.incomeItem.create({
        data: {
          ...input,
          page_final_id: pageFinalId
        }
      });
      
      console.log('[PageFinal Server] addIncomeItem 성공:', {
        id: result.id,
        pageFinalId,
        category: result.category,
        amount: result.amount
      });
      
      return result;
    } catch (error) {
      console.error('[PageFinal Server] addIncomeItem 오류:', error);
      throw new Error(`Failed to add income item: ${error.message}`);
    }
  },
  
  updateIncomeItem: async (_, { id, input }) => {
    console.log('[PageFinal Server] updateIncomeItem 시작:', { id, input });
    try {
      const result = await prisma.incomeItem.update({
        where: { id },
        data: input
      });
      
      console.log('[PageFinal Server] updateIncomeItem 성공:', {
        id: result.id,
        category: result.category,
        amount: result.amount
      });
      
      return result;
    } catch (error) {
      console.error(`[PageFinal Server] updateIncomeItem 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to update income item: ${error.message}`);
    }
  },
  
  deleteIncomeItem: async (_, { id }) => {
    console.log('[PageFinal Server] deleteIncomeItem 시작:', { id });
    try {
      // 삭제 전 항목 존재 여부 확인
      const income = await prisma.incomeItem.findUnique({
        where: { id }
      });
      
      if (!income) {
        console.log(`[PageFinal Server] deleteIncomeItem: 항목 없음 (ID: ${id})`);
        return true; // 이미 존재하지 않으면 성공으로 처리
      }
      
      await prisma.incomeItem.delete({
        where: { id }
      });
      
      console.log('[PageFinal Server] deleteIncomeItem 성공:', { id });
      return true;
    } catch (error) {
      console.error(`[PageFinal Server] deleteIncomeItem 오류 (ID: ${id}):`, error);
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