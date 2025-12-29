import Swal from 'sweetalert2';
import apolloClient from 'utils/apolloClient';
import { 
  CREATE_PAGE4_EXPENSE, 
  UPDATE_PAGE4_EXPENSE, 
  DELETE_PAGE4_EXPENSE 
} from '../graphql';

/**
 * Create a new expense
 * @param {Object} expense - The expense to create
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|null>} - The created expense or null
 */
export const createExpense = async (expense, showAlert) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_PAGE4_EXPENSE,
      variables: { 
        input: expense
      }
    });
    
    return data?.createPage4Expense || null;
  } catch (error) {
    console.error('[expenseService] Error creating expense:', error);
    showAlert?.('지출 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Update an existing expense
 * @param {Object} expense - The expense to update
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|null>} - The updated expense or null
 */
export const updateExpense = async (expense, showAlert) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PAGE4_EXPENSE,
      variables: { 
        id: parseInt(expense.id),
        input: expense
      }
    });
    
    return data?.updatePage4Expense || null;
  } catch (error) {
    console.error('[expenseService] Error updating expense:', error);
    showAlert?.('지출 수정 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Delete an expense
 * @param {number|string} id - The expense ID to delete
 * @param {Function} showAlert - Function to show alerts
 * @param {Object} theme - MUI theme for styling
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
export const deleteExpense = async (id, showAlert, theme) => {
  try {
    const result = await Swal.fire({
      title: '지출 삭제',
      text: '이 지출 항목을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme?.palette?.error?.main || '#f44336'
    });
    
    if (result.isConfirmed) {
      // Delete using GraphQL mutation
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PAGE4_EXPENSE,
        variables: { id: parseInt(id) }
      });
      
      if (data && data.deletePage4Expense) {
        showAlert?.('지출이 삭제되었습니다.', 'success');
        return true;
      } else {
        showAlert?.('지출 삭제에 실패했습니다.', 'error');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[expenseService] Error deleting expense:', error);
    showAlert?.('지출 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
}; 