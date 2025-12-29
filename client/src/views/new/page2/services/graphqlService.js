import apolloClient from 'utils/apolloClient';
import moment from 'moment';
import Swal from 'sweetalert2';

// Import GraphQL queries and mutations
import {
  GET_PAGE2_BY_ID,
  GET_PAGE2_BY_PAGE1_ID,
  GET_PAGE2_PROGRAMS,
  CREATE_PAGE2,
  UPDATE_PAGE2,
  DELETE_PAGE2,
  CREATE_PAGE2_PROGRAM,
  UPDATE_PAGE2_PROGRAM,
  DELETE_PAGE2_PROGRAM
} from '../graphql';

// Helper function to format dates for server
export const formatDateForServer = (dateString) => {
  if (!dateString) return null;
  
  try {
    return moment(dateString).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};

// Fetch Page2 data by ID
export const fetchPage2ById = async (id) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_PAGE2_BY_ID,
      variables: { id: parseInt(id) },
      fetchPolicy: 'network-only'
    });
    
    return data.getPage2ById;
  } catch (error) {
    console.error('Error fetching Page2 by ID:', error);
    throw error;
  }
};

// Fetch Page2 data by Page1 ID
export const fetchPage2ByPage1Id = async (page1Id) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_PAGE2_BY_PAGE1_ID,
      variables: { page1Id: parseInt(page1Id) },
      fetchPolicy: 'network-only'
    });
    
    return data.getPage2ByPage1Id;
  } catch (error) {
    console.error('Error fetching Page2 by Page1 ID:', error);
    throw error;
  }
};

// Fetch Page2 programs
export const fetchPage2Programs = async (reservationId) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_PAGE2_PROGRAMS,
      variables: { reservationId: parseInt(reservationId) },
      fetchPolicy: 'network-only'
    });
    
    return data.getPage2Programs;
  } catch (error) {
    console.error('Error fetching Page2 programs:', error);
    throw error;
  }
};

// Create or update Page2
export const savePage2Data = async (formData, programs, showAlert, navigate) => {
  try {
    const page1Id = parseInt(formData.page1_id);
    if (!page1Id) {
      showAlert('Page1 ID가 필요합니다', 'error');
      return;
    }
    
    // Prepare input data
    const input = {
      page1_id: page1Id,
      male_count: formData.male_count ? parseInt(formData.male_count) : 0,
      female_count: formData.female_count ? parseInt(formData.female_count) : 0,
      total_count: formData.total_count ? parseInt(formData.total_count) : 0,
      male_leader_count: formData.male_leader_count ? parseInt(formData.male_leader_count) : 0,
      female_leader_count: formData.female_leader_count ? parseInt(formData.female_leader_count) : 0,
      total_leader_count: formData.total_leader_count ? parseInt(formData.total_leader_count) : 0,
      is_mou: formData.is_mou || false,
      org_nature: formData.org_nature || null,
      part_type: formData.part_type || null,
      age_type: formData.age_type || null,
      part_form: formData.part_form || null,
      service_type: formData.service_type || null
    };
    
    let result;
    
    // Update if id exists, create otherwise
    if (formData.id) {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PAGE2,
        variables: {
          id: parseInt(formData.id),
          input
        }
      });
      
      result = data.updatePage2;
      showAlert('예약 정보가 성공적으로 업데이트되었습니다.', 'success');
    } else {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PAGE2,
        variables: { input }
      });
      
      result = data.createPage2;
      showAlert('예약 정보가 성공적으로 생성되었습니다.', 'success');
    }
    
    // Handle programs - assuming all programs need to be managed from this function
    // This would typically be handled in a more sophisticated way in a real application,
    // comparing existing programs with current ones and only updating/deleting/creating as needed
    
    return result;
  } catch (error) {
    console.error('Error saving Page2 data:', error);
    showAlert(`저장 중 오류가 발생했습니다: ${error.message}`, 'error');
    throw error;
  }
};

// Delete Page2
export const deletePage2Data = async (id, showAlert, navigate, theme) => {
  try {
    // Confirm deletion
    const result = await Swal.fire({
      title: '정말 삭제하시겠습니까?',
      text: "이 작업은 되돌릴 수 없습니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.primary.main,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });
    
    if (result.isConfirmed) {
      await apolloClient.mutate({
        mutation: DELETE_PAGE2,
        variables: { id: parseInt(id) }
      });
      
      Swal.fire(
        '삭제됨!',
        '예약이 삭제되었습니다.',
        'success'
      );
      
      navigate('/new/page2');
    }
  } catch (error) {
    console.error('Error deleting Page2:', error);
    showAlert(`삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    throw error;
  }
};

// Add new program
export const createProgram = async (programData, reservationId) => {
  try {
    const input = {
      ...programData,
      reservation_id: parseInt(reservationId),
      date: programData.date ? moment(programData.date).toISOString() : null
    };
    
    const { data } = await apolloClient.mutate({
      mutation: CREATE_PAGE2_PROGRAM,
      variables: { input }
    });
    
    return data.createPage2Program;
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

// Update program
export const updateProgram = async (programData, programId) => {
  try {
    const input = {
      ...programData,
      reservation_id: parseInt(programData.reservation_id),
      date: programData.date ? moment(programData.date).toISOString() : null
    };
    
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PAGE2_PROGRAM,
      variables: {
        id: parseInt(programId),
        input
      }
    });
    
    return data.updatePage2Program;
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

// Delete program
export const deleteProgram = async (programId) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_PAGE2_PROGRAM,
      variables: { id: parseInt(programId) }
    });
    
    return data.deletePage2Program;
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
}; 