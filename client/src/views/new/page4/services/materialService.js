import Swal from 'sweetalert2';
import apolloClient from 'utils/apolloClient';
import { 
  CREATE_PAGE4_MATERIAL, 
  UPDATE_PAGE4_MATERIAL, 
  DELETE_PAGE4_MATERIAL 
} from '../graphql';

/**
 * Create a new material
 * @param {Object} material - The material to create
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|null>} - The created material or null
 */
export const createMaterial = async (material, showAlert) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_PAGE4_MATERIAL,
      variables: { 
        input: material
      }
    });
    
    return data?.createPage4Material || null;
  } catch (error) {
    console.error('[materialService] Error creating material:', error);
    showAlert?.('재료 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Update an existing material
 * @param {Object} material - The material to update
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|null>} - The updated material or null
 */
export const updateMaterial = async (material, showAlert) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PAGE4_MATERIAL,
      variables: { 
        id: parseInt(material.id),
        input: material
      }
    });
    
    return data?.updatePage4Material || null;
  } catch (error) {
    console.error('[materialService] Error updating material:', error);
    showAlert?.('재료 수정 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Delete a material
 * @param {number|string} id - The material ID to delete
 * @param {Function} showAlert - Function to show alerts
 * @param {Object} theme - MUI theme for styling
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
export const deleteMaterial = async (id, showAlert, theme) => {
  try {
    const result = await Swal.fire({
      title: '재료 삭제',
      text: '이 재료를 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme?.palette?.error?.main || '#f44336'
    });
    
    if (result.isConfirmed) {
      // Delete using GraphQL mutation
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PAGE4_MATERIAL,
        variables: { id: parseInt(id) }
      });
      
      if (data && data.deletePage4Material) {
        showAlert?.('재료가 삭제되었습니다.', 'success');
        return true;
      } else {
        showAlert?.('재료 삭제에 실패했습니다.', 'error');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[materialService] Error deleting material:', error);
    showAlert?.('재료 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
}; 