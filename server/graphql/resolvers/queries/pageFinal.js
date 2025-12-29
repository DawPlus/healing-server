const prisma = require('../../../prisma/prismaClient');

const pageFinalQueries = {
  // Get all PageFinal records
  getPageFinalList: async () => {
    console.log('[PageFinal Server] getPageFinalList 쿼리 시작');
    try {
      const results = await prisma.pageFinal.findMany({
        include: {
          page1: true,
          teacher_expenses: true,
          participant_expenses: true,
          income_items: true
        }
      });
      
      console.log('[PageFinal Server] getPageFinalList 결과:', {
        count: results.length,
        sample: results.length > 0 ? {
          id: results[0].id,
          page1_id: results[0].page1_id,
          teacherExpenseCount: results[0].teacher_expenses?.length || 0,
          participantExpenseCount: results[0].participant_expenses?.length || 0,
          incomeItemCount: results[0].income_items?.length || 0
        } : null
      });
      
      return results;
    } catch (error) {
      console.error('[PageFinal Server] getPageFinalList 오류:', error);
      throw new Error(`Failed to fetch PageFinal list: ${error.message}`);
    }
  },
  
  // Get a specific PageFinal record by ID
  getPageFinalById: async (_, { id }) => {
    console.log('[PageFinal Server] getPageFinalById 쿼리 시작:', { id });
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
        console.log('[PageFinal Server] getPageFinalById: 레코드 없음', { id });
        throw new Error(`PageFinal with ID ${id} not found`);
      }
      
      console.log('[PageFinal Server] getPageFinalById 결과:', {
        id: result.id,
        page1_id: result.page1_id,
        teacherExpenseCount: result.teacher_expenses?.length || 0,
        participantExpenseCount: result.participant_expenses?.length || 0,
        incomeItemCount: result.income_items?.length || 0,
        complaint: result.complaint,
        discountRate: result.discount_rate,
        discountNotes: result.discount_notes
      });
      
      return result;
    } catch (error) {
      console.error(`[PageFinal Server] getPageFinalById 오류 (ID: ${id}):`, error);
      throw new Error(`Failed to fetch PageFinal: ${error.message}`);
    }
  },
  
  // Get a PageFinal record by Page1 ID
  getPageFinalByPage1Id: async (_, { page1_id }) => {
    console.log('[PageFinal Server] getPageFinalByPage1Id 쿼리 시작:', { page1_id });
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
      
      if (result) {
        console.log('[PageFinal Server] getPageFinalByPage1Id 결과:', {
          id: result.id,
          page1_id: result.page1_id,
          teacherExpenseCount: result.teacher_expenses?.length || 0,
          participantExpenseCount: result.participant_expenses?.length || 0,
          incomeItemCount: result.income_items?.length || 0,
          complaint: result.complaint,
          discountRate: result.discount_rate,
          discountNotes: result.discount_notes
        });

        // 강사 비용 상세 분석
        if (result.teacher_expenses && result.teacher_expenses.length > 0) {
          const plannedExpenses = result.teacher_expenses.filter(e => e.is_planned);
          const executedExpenses = result.teacher_expenses.filter(e => !e.is_planned);
          
          console.log('[PageFinal Server] 강사 비용 상세:', {
            total: result.teacher_expenses.length,
            planned: plannedExpenses.length,
            executed: executedExpenses.length,
            plannedDetails: plannedExpenses.map(e => ({
              id: e.id,
              category: e.category,
              amount: e.amount,
              details: e.details
            })),
            executedDetails: executedExpenses.map(e => ({
              id: e.id,
              category: e.category,
              amount: e.amount,
              details: e.details
            }))
          });
        }

        // 참가자 비용 상세 분석
        if (result.participant_expenses && result.participant_expenses.length > 0) {
          const plannedExpenses = result.participant_expenses.filter(e => e.is_planned);
          const executedExpenses = result.participant_expenses.filter(e => !e.is_planned);
          
          console.log('[PageFinal Server] 참가자 비용 상세:', {
            total: result.participant_expenses.length,
            planned: plannedExpenses.length,
            executed: executedExpenses.length,
            plannedDetails: plannedExpenses.map(e => ({
              id: e.id,
              category: e.category,
              amount: e.amount,
              details: e.details
            })),
            executedDetails: executedExpenses.map(e => ({
              id: e.id,
              category: e.category,
              amount: e.amount,
              details: e.details
            }))
          });
        }

        // 수입 항목 상세 분석
        if (result.income_items && result.income_items.length > 0) {
          console.log('[PageFinal Server] 수입 항목 상세:', {
            total: result.income_items.length,
            details: result.income_items.map(i => ({
              id: i.id,
              category: i.category,
              amount: i.amount,
              details: i.details
            }))
          });
        }
      } else {
        console.log('[PageFinal Server] getPageFinalByPage1Id: 레코드 없음', { page1_id });
      }
      
      return result; // This can be null if no record exists
    } catch (error) {
      console.error(`[PageFinal Server] getPageFinalByPage1Id 오류 (Page1 ID: ${page1_id}):`, error);
      throw new Error(`Failed to fetch PageFinal for Page1: ${error.message}`);
    }
  }
};

module.exports = pageFinalQueries; 