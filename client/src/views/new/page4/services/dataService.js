import { gql } from '@apollo/client';
import apolloClient from 'utils/apolloClient';
import Swal from 'sweetalert2';
import { 
  GET_PAGE4_BY_ID, 
  GET_PAGE4_BY_PAGE1_ID, 
  CREATE_PAGE4,
  UPDATE_PAGE4,
  DELETE_PAGE4,
  CREATE_PAGE4_MATERIAL,
  UPDATE_PAGE4_MATERIAL,
  DELETE_PAGE4_MATERIAL,
  CREATE_PAGE4_EXPENSE,
  UPDATE_PAGE4_EXPENSE,
  DELETE_PAGE4_EXPENSE
} from '../graphql';

// 추가: GET_PAGE1_BY_ID 임포트
const GET_PAGE1_BY_ID = gql`
  query GetPage1ById($id: Int!) {
    getPage1ById(id: $id) {
      id
      group_name
      customer_name
      total_count
      start_date
      end_date
      reservation_status
      email
      mobile_phone
    }
  }
`;

/**
 * Fetch page4 data by ID using GraphQL
 * @param {string} id - The ID of the page4 record
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|boolean>}
 */
export const fetchPage4DataById = async (id, dispatch, showAlert) => {
  try {
    if (!id) {
      console.log('[DataService] No ID provided');
      showAlert?.('Page4 ID가 필요합니다.', 'warning');
      return false;
    }
    
    // 문자열을 정수로 확실히 변환
    const idInt = Number(id);
    if (isNaN(idInt)) {
      console.error('[DataService] Invalid ID provided:', id);
      showAlert?.('유효하지 않은 ID입니다.', 'error');
      return false;
    }
    
    console.log(`[DataService] Fetching page4 data for ID: ${idInt}`);
    
    // GraphQL 쿼리 실행
    const { data } = await apolloClient.query({
      query: GET_PAGE4_BY_ID,
      variables: { id: idInt },
      fetchPolicy: 'network-only'
    });
    
    if (data && data.getPage4ById) {
      console.log('[DataService] Found page4 data:', data.getPage4ById);
      showAlert?.('Page4 데이터를 성공적으로 불러왔습니다.', 'success');
      
      // Redux 액션이 제공된 경우 데이터 설정
      if (dispatch) {
        dispatch({ 
          type: 'new4/setFormData', 
          payload: data.getPage4ById 
        });
        
        // 재료비와 기타비용 항목도 설정
        if (data.getPage4ById.materials) {
          dispatch({ 
            type: 'new4/setMaterials', 
            payload: data.getPage4ById.materials 
          });
        }
        
        if (data.getPage4ById.expenses) {
          dispatch({ 
            type: 'new4/setEtcExpenses', 
            payload: data.getPage4ById.expenses 
          });
        }
      }
      
      return data.getPage4ById;
    } else {
      console.log('[DataService] No data found');
      showAlert?.('유효한 데이터가 없습니다.', 'warning');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error fetching page4 data:', error);
    showAlert?.('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Fetch page4 data by page1_id using GraphQL
 * @param {string} page1Id - The ID of the page1 record
 * @param {Function} dispatch - Redux dispatch function 
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|boolean>}
 */
export const fetchPage4DataByPage1Id = async (page1Id, dispatch, showAlert) => {
  try {
    if (!page1Id) {
      console.log('[DataService] No page1_id provided');
      showAlert?.('Page1 ID가 필요합니다.', 'warning');
      return false;
    }
    
    // 문자열을 정수로 확실히 변환
    const page1IdInt = Number(page1Id);
    if (isNaN(page1IdInt)) {
      console.error('[DataService] Invalid page1_id provided:', page1Id);
      showAlert?.('유효하지 않은 Page1 ID입니다.', 'error');
      return false;
    }
    
    console.log(`[DataService] Fetching page4 data for page1_id: ${page1IdInt}`);
    
    // Show loading state
    showAlert?.('Page4 데이터를 불러오는 중입니다...', 'info');
    
    // GraphQL 쿼리 실행
    const { data } = await apolloClient.query({
      query: GET_PAGE4_BY_PAGE1_ID,
      variables: { page1Id: page1IdInt },
      fetchPolicy: 'network-only'
    });
    
    if (data && data.getPage4ByPage1Id) {
      console.log('[DataService] Found page4 data:', data.getPage4ByPage1Id);
      showAlert?.('Page4 데이터를 성공적으로 불러왔습니다.', 'success');
      
      // Redux 액션이 제공된 경우 데이터 설정
      if (dispatch) {
        dispatch({ 
          type: 'new4/setFormData', 
          payload: data.getPage4ByPage1Id 
        });
        
        // 재료비와 기타비용 항목도 설정
        if (data.getPage4ByPage1Id.materials) {
          dispatch({ 
            type: 'new4/setMaterials', 
            payload: data.getPage4ByPage1Id.materials 
          });
        }
        
        if (data.getPage4ByPage1Id.expenses) {
          dispatch({ 
            type: 'new4/setEtcExpenses', 
            payload: data.getPage4ByPage1Id.expenses 
          });
        }
      }
      
      return data.getPage4ByPage1Id;
    } else {
      console.log('[DataService] No data found for page1_id, this is a new record');
      showAlert?.('Page1 ID에 대한 기존 데이터가 없습니다. 새 경비 데이터를 생성합니다.', 'info');
      
      // 새 레코드를 위한 Page1 데이터 가져오기
      try {
        const { data: page1Data } = await apolloClient.query({
          query: GET_PAGE1_BY_ID,
          variables: { id: page1IdInt },
          fetchPolicy: 'network-only'
        });
        
        if (page1Data && page1Data.getPage1ById) {
          console.log('[DataService] Found page1 data:', page1Data.getPage1ById);
          
          // Page4 초기 폼 데이터 설정
          const initialFormData = {
            page1_id: parseInt(page1Id),
            project_name: page1Data.getPage1ById.group_name || '새 프로젝트',
            created_by: page1Data.getPage1ById.customer_name || '',
            material_total: 0,
            etc_expense_total: 0,
            total_budget: 0,
            page1: page1Data.getPage1ById
          };
          
          // Redux 액션이 제공된 경우 데이터 설정
          if (dispatch) {
            dispatch({ 
              type: 'new4/setFormData', 
              payload: initialFormData 
            });
            
            // 빈 재료비와 기타비용 배열 설정
            dispatch({ type: 'new4/setMaterials', payload: [] });
            dispatch({ type: 'new4/setEtcExpenses', payload: [] });
          }
          
          return initialFormData;
        }
      } catch (page1Error) {
        console.error('[DataService] Error fetching page1 data:', page1Error);
      }
      
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error fetching page4 data by page1_id:', error);
    showAlert?.('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Save page4 data using GraphQL
 * @param {Object} formData - The form data to save
 * @param {Array} materials - Materials list
 * @param {Array} etcExpenses - Etc expenses list
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|boolean>} - Returns the saved page4 data or false on error
 */
export const savePage4Data = async (formData, materials, etcExpenses, showAlert) => {
  try {
    // Make sure formData is not empty
    if (!formData || Object.keys(formData).length === 0) {
      console.error('[DataService] formData is empty or undefined');
      showAlert?.('폼 데이터가 없습니다.', 'error');
      return false;
    }
    
    // Ensure project_name exists
    if (!formData.project_name) {
      console.error('[DataService] project_name is required');
      showAlert?.('프로젝트명은 필수 입력 항목입니다.', 'error');
      return false;
    }
    
    // page1_id를 정수로 확인 및 변환
    const page1IdInt = Number(formData.page1_id);
    if (isNaN(page1IdInt)) {
      console.error('[DataService] Invalid page1_id:', formData.page1_id);
      showAlert?.('유효하지 않은 Page1 ID입니다.', 'error');
      return false;
    }
    
    // Prepare the mutation input
    const input = {
      project_name: formData.project_name,
      created_by: formData.created_by || '',
      page1_id: page1IdInt,
      material_total: Number(formData.material_total) || 0,
      etc_expense_total: Number(formData.etc_expense_total) || 0,
      total_budget: Number(formData.total_budget) || 0
    };
    
    console.log('[DataService] Saving page4 data with input:', input);
    
    let result;
    let isCreating = false;
    
    // If we have an ID, update existing record, otherwise create new
    if (formData.id && !isNaN(Number(formData.id))) {
      const idInt = Number(formData.id);
      console.log('[DataService] Updating existing page4 with ID:', idInt);
      
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PAGE4,
        variables: {
          id: idInt,
          input
        }
      });
      
      result = data?.updatePage4;
      console.log('[DataService] Updated page4:', result);
    } else {
      console.log('[DataService] Creating new page4 record');
      isCreating = true;
      
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PAGE4,
        variables: { input }
      });
      
      result = data?.createPage4;
      console.log('[DataService] Created page4:', result);
    }
    
    if (!result || !result.id) {
      console.error('[DataService] Failed to save page4 data');
      showAlert?.('경비 데이터 저장에 실패했습니다.', 'error');
      return false;
    }
    
    // Log success
    console.log('[DataService] Successfully saved page4 data with ID:', result.id);
    showAlert?.('경비 데이터가 성공적으로 저장되었습니다.', 'success');
    
    // Get complete page4 data including materials and expenses
    const savedData = await fetchPage4DataById(result.id, null, null);
    
    if (savedData) {
      console.log('[DataService] Retrieved complete page4 data:', savedData);
      return savedData;
    }
    
    // If we couldn't fetch the complete data, return the basic result
    return result;
  } catch (error) {
    console.error('[DataService] Error saving page4 data:', error);
    showAlert?.('경비 데이터 저장 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Delete page4 data using GraphQL
 * @param {string} id - The ID of the page4 record to delete
 * @param {Function} showAlert - Function to show alerts
 * @param {Function} navigate - React Router navigate function
 * @param {Object} theme - MUI theme for confirmation dialog
 * @returns {Promise<boolean>}
 */
export const deletePage4Data = async (id, showAlert, navigate, theme) => {
  try {
    if (!id) {
      console.error('[DataService] No ID provided for deletion');
      showAlert?.('삭제할 ID가 지정되지 않았습니다.', 'error');
      return false;
    }
    
    // ID를 정수로 변환
    const idInt = Number(id);
    if (isNaN(idInt)) {
      console.error('[DataService] Invalid ID for deletion:', id);
      showAlert?.('유효하지 않은 ID입니다.', 'error');
      return false;
    }
    
    console.log(`[DataService] Deleting page4 data for ID: ${idInt}`);
    
    // 삭제 확인 대화상자
    const result = await Swal.fire({
      title: '정말 삭제하시겠습니까?',
      text: '이 작업은 되돌릴 수 없습니다!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme?.palette?.error?.main || '#f44336',
      cancelButtonColor: theme?.palette?.grey?.[500] || '#aaaaaa',
      confirmButtonText: '예, 삭제합니다',
      cancelButtonText: '취소'
    });
    
    if (!result.isConfirmed) {
      console.log('[DataService] Deletion canceled by user');
      return false;
    }
    
    // GraphQL mutation 실행
    const { data } = await apolloClient.mutate({
      mutation: DELETE_PAGE4,
      variables: { id: idInt }
    });
    
    if (data && data.deletePage4) {
      console.log('[DataService] Successfully deleted page4:', id);
      
      Swal.fire({
        icon: 'success',
        title: '삭제 완료',
        text: '경비 데이터가 성공적으로 삭제되었습니다.',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/new/page4');
      });
      
      return true;
    } else {
      console.error('[DataService] Delete failed');
      showAlert?.('데이터 삭제에 실패했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error deleting page4 data:', error);
    showAlert?.('데이터 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Save a single material to the backend
 * @param {Object} material - The material data to save
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|boolean>} - Returns the saved material or false on error
 */
export const saveMaterial = async (material, showAlert) => {
  try {
    console.log('[DataService] Saving material:', material);
    
    // 기본 객체 체크
    if (!material) {
      console.error('[DataService] Material object is missing');
      showAlert?.('재료비 데이터가 없습니다.', 'error');
      return false;
    }
    
    // expense_id 체크
    if (!material.expense_id) {
      console.error('[DataService] expense_id is missing');
      showAlert?.('경비 ID가 없습니다. 먼저 메인 경비 데이터를 저장해주세요.', 'error');
      return false;
    }
    
    // 필수 필드 체크
    if (!material.name) {
      console.error('[DataService] name is missing');
      showAlert?.('항목명은 필수 입력 항목입니다.', 'error');
      return false;
    }
    
    if (!material.material_type) {
      console.error('[DataService] material_type is missing');
      showAlert?.('재료 종류는 필수 입력 항목입니다.', 'error');
      return false;
    }
    
    // 숫자 필드 체크
    const amount = Number(material.amount);
    const actual_amount = Number(material.actual_amount);
    const quantity = Number(material.quantity);
    const total = Math.round(Number(material.total)); // total은 정수로 변환
    
    if (isNaN(amount)) {
      console.error('[DataService] Invalid amount:', material.amount);
      showAlert?.('단가는 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(actual_amount)) {
      console.error('[DataService] Invalid actual_amount:', material.actual_amount);
      showAlert?.('지출 단가는 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      console.error('[DataService] Invalid quantity:', material.quantity);
      showAlert?.('수량은 0보다 큰 숫자여야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(total)) {
      console.error('[DataService] Invalid total:', material.total);
      showAlert?.('합계는 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    // Prepare the input for the GraphQL mutation - GraphQL 스키마에 맞게 타입 변환
    const input = {
      expense_id: Number(material.expense_id),
      material_type: material.material_type || '',
      name: material.name || '',
      amount: Number(amount), // 문자열이 아닌 숫자로 변환 (Int 타입으로)
      actual_amount: Number(actual_amount), // 지출 단가를 숫자로 변환
      quantity: Number(quantity), // 문자열이 아닌 숫자로 변환 (Int 타입으로)
      total: total, // 정수로 변환 (스키마에 맞게)
      note: material.note || ''
    };
    
    console.log('[DataService] Prepared material input:', input);
    
    let result;
    
    // Update or create based on whether ID exists
    if (material.id && !material.id.toString().startsWith('temp_')) {
      // Update existing material
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PAGE4_MATERIAL,
        variables: {
          id: Number(material.id),
          input
        }
      });
      
      result = data?.updatePage4Material;
      console.log('[DataService] Updated material:', result);
    } else {
      // Create new material
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PAGE4_MATERIAL,
        variables: { input }
      });
      
      result = data?.createPage4Material;
      console.log('[DataService] Created material:', result);
    }
    
    if (result && result.id) {
      showAlert?.('재료비가 성공적으로 저장되었습니다.', 'success');
      return result;
    } else {
      showAlert?.('재료비 저장에 실패했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error saving material:', error);
    showAlert?.('재료비 저장 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Save a single expense to the backend
 * @param {Object} expense - The expense data to save
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|boolean>} - Returns the saved expense or false on error
 */
export const saveExpense = async (expense, showAlert) => {
  try {
    console.log('[DataService] Saving expense:', expense);
    
    // Validate expense object exists
    if (!expense) {
      console.error('[DataService] Expense object is missing');
      showAlert?.('지출 데이터가 없습니다.', 'error');
      return false;
    }
    
    // Validate expense_id specifically
    if (!expense.expense_id) {
      console.error('[DataService] expense_id is missing');
      showAlert?.('경비 ID가 없습니다. 먼저 메인 경비 데이터를 저장해주세요.', 'error');
      return false;
    }
    
    // Validate expense_id is a number
    if (isNaN(Number(expense.expense_id))) {
      console.error('[DataService] expense_id is not a valid number:', expense.expense_id);
      showAlert?.('유효하지 않은 경비 ID입니다.', 'error');
      return false;
    }
    
    // Validate required fields
    if (!expense.name || !expense.expense_type || !expense.amount) {
      console.error('[DataService] Required fields are missing');
      showAlert?.('항목명, 종류, 금액은 필수 입력 항목입니다.', 'error');
      return false;
    }
    
    // 숫자 값을 검증하고 변환
    const expenseId = Number(expense.expense_id);
    // amount는 정수로 변환 (Int 타입)
    const amount = Math.round(Number(expense.amount)); 
    const actual_amount = Math.round(Number(expense.actual_amount));
    const quantity = Number(expense.quantity) || 0;
    const price = Number(expense.price) || 0;
    const actual_price = Number(expense.actual_price) || 0;
    
    // 모든 숫자가 유효한지 확인
    if (isNaN(expenseId) || expenseId <= 0) {
      showAlert?.('유효하지 않은 경비 ID입니다.', 'error');
      return false;
    }
    
    if (isNaN(amount)) {
      showAlert?.('수입 금액은 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(actual_amount)) {
      showAlert?.('지출 금액은 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      showAlert?.('수량은 0보다 커야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(price)) {
      showAlert?.('수입 단가는 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    if (isNaN(actual_price)) {
      showAlert?.('지출 단가는 유효한 숫자여야 합니다.', 'error');
      return false;
    }
    
    // Prepare the input for the GraphQL mutation
    // GraphQL 스키마에 맞게 amount는 Int 타입으로 전송
    const input = {
      expense_id: expenseId,
      name: expense.name || '',
      amount: amount, // 정수로 전송 (문자열이 아님)
      actual_amount: actual_amount, // 지출 금액
      expense_type: expense.expense_type || '',
      quantity: quantity.toString(), // 문자열로 변환 (String 타입으로)
      price: price.toString(), // 문자열로 변환 (String 타입으로)
      actual_price: actual_price, // 지출 단가
      note: expense.note || ''
    };
    
    console.log('[DataService] Prepared expense input:', input);
    
    let result;
    
    // Update or create based on whether ID exists
    if (expense.id && !expense.id.toString().startsWith('temp_')) {
      // Update existing expense
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PAGE4_EXPENSE,
        variables: {
          id: Number(expense.id),
          input
        }
      });
      
      result = data?.updatePage4Expense;
      console.log('[DataService] Updated expense:', result);
    } else {
      // Create new expense
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PAGE4_EXPENSE,
        variables: { input }
      });
      
      result = data?.createPage4Expense;
      console.log('[DataService] Created expense:', result);
    }
    
    if (result && result.id) {
      showAlert?.('지출이 성공적으로 저장되었습니다.', 'success');
      return result;
    } else {
      showAlert?.('지출 저장에 실패했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error saving expense:', error);
    showAlert?.('지출 저장 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Delete a material from the backend
 * @param {number|string} id - The ID of the material to delete
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<boolean>} - Returns true if deleted successfully
 */
export const deleteMaterial = async (id, showAlert) => {
  try {
    // Skip server call for temporary IDs (not yet saved to backend)
    if (id.toString().startsWith('temp_')) {
      console.log('[DataService] Skipping server delete for temp material:', id);
      return true;
    }
    
    const { data } = await apolloClient.mutate({
      mutation: DELETE_PAGE4_MATERIAL,
      variables: { id: Number(id) }
    });
    
    if (data && data.deletePage4Material) {
      console.log('[DataService] Successfully deleted material:', id);
      showAlert?.('재료비가 성공적으로 삭제되었습니다.', 'success');
      return true;
    } else {
      console.error('[DataService] Delete material failed');
      showAlert?.('재료비 삭제에 실패했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error deleting material:', error);
    showAlert?.('재료비 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Delete an expense from the backend
 * @param {number|string} id - The ID of the expense to delete
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<boolean>} - Returns true if deleted successfully
 */
export const deleteExpense = async (id, showAlert) => {
  try {
    // Skip server call for temporary IDs (not yet saved to backend)
    if (id.toString().startsWith('temp_')) {
      console.log('[DataService] Skipping server delete for temp expense:', id);
      return true;
    }
    
    const { data } = await apolloClient.mutate({
      mutation: DELETE_PAGE4_EXPENSE,
      variables: { id: Number(id) }
    });
    
    if (data && data.deletePage4Expense) {
      console.log('[DataService] Successfully deleted expense:', id);
      showAlert?.('지출이 성공적으로 삭제되었습니다.', 'success');
      return true;
    } else {
      console.error('[DataService] Delete expense failed');
      showAlert?.('지출 삭제에 실패했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error deleting expense:', error);
    showAlert?.('지출 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Update Page4 totals in the database
 * @param {object} page4Data - The Page4 data with updated totals
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<boolean>} - Returns true if update was successful
 */
export const updatePage4Totals = async (page4Data, showAlert) => {
  try {
    if (!page4Data || !page4Data.id) {
      console.error('[DataService] No Page4 ID provided for updating totals');
      return false;
    }
    
    const idInt = Number(page4Data.id);
    if (isNaN(idInt)) {
      console.error('[DataService] Invalid Page4 ID:', page4Data.id);
      return false;
    }
    
    // Prepare the update input with just the totals
    const input = {
      project_name: page4Data.project_name,
      created_by: page4Data.created_by || '',
      page1_id: Number(page4Data.page1_id),
      material_total: Number(page4Data.material_total) || 0,
      etc_expense_total: Number(page4Data.etc_expense_total) || 0,
      total_budget: Number(page4Data.total_budget) || 0
    };
    
    console.log('[DataService] Updating Page4 totals for ID:', idInt);
    
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PAGE4,
      variables: {
        id: idInt,
        input
      }
    });
    
    if (data && data.updatePage4) {
      console.log('[DataService] Successfully updated Page4 totals');
      return true;
    } else {
      console.error('[DataService] Failed to update Page4 totals');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error updating Page4 totals:', error);
    showAlert?.('총액 업데이트 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
}; 