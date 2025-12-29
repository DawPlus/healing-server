import { gql } from '@apollo/client';
import apolloClient from 'utils/apolloClient';
import Swal from 'sweetalert2';

/**
 * Fetch page2 data by id using GraphQL
 * @param {string} id - The ID of the record to fetch
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|null>} - The fetched data or null if not found
 */
export const fetchPage2DataByPageId = async (id, showAlert) => {
  try {
    console.log('[DataService] Fetching page2 data by ID:', id);
    
    const { data } = await apolloClient.query({
      query: gql`
        query GetPage2ById($id: Int!) {
          getPage2ById(id: $id) {
            id
            page1_id
            male_count
            female_count
            total_count
            male_leader_count
            female_leader_count
            total_leader_count
            is_mou
            org_nature
            part_type
            age_type
            part_form
            service_type
            created_at
            updated_at
            page1 {
              id
              reservation_status
              start_date
              end_date
              group_name
              customer_name
              total_count
              email
              mobile_phone
              landline_phone
              notes
            }
            programs {
              id
              reservation_id
              category
              category_name
              program
              program_name
              date
              start_time
              end_time
              duration
              place
              place_name
              instructor
              instructor_name
              assistant
              assistant_name
              helper
              helper_name
              notes
              price
              participants
              is_multi
              multi1_name
              multi2_name
            }
          }
        }
      `,
      variables: { id: parseInt(id) },
      fetchPolicy: 'network-only'
    });
    
    if (data?.getPage2ById) {
      console.log('[DataService] Found page2 data:', data.getPage2ById);
      showAlert?.('Page2 데이터를 성공적으로 불러왔습니다.', 'success');
      return data.getPage2ById;
    } else {
      console.log('[DataService] No page2 data found for ID:', id);
      showAlert?.('ID에 해당하는 데이터를 찾을 수 없습니다.', 'warning');
      return null;
    }
  } catch (error) {
    console.error('[DataService] Error fetching page2 data:', error);
    showAlert?.('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Fetch page2 data by page1_id using GraphQL
 * @param {string} page1Id - The page1_id to search by
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<Object|null>} - The fetched data or null if not found
 */
export const fetchPage2DataByPage1Id = async (page1Id, showAlert) => {
  try {
    console.log('[DataService] Fetching page2 data by page1_id:', page1Id);
    
    const { data } = await apolloClient.query({
      query: gql`
        query GetPage2ByPage1Id($page1Id: Int!) {
          getPage2ByPage1Id(page1Id: $page1Id) {
            id
            page1_id
            male_count
            female_count
            total_count
            male_leader_count
            female_leader_count
            total_leader_count
            is_mou
            org_nature
            part_type
            age_type
            part_form
            service_type
            created_at
            updated_at
            page1 {
              id
              reservation_status
              start_date
              end_date
              group_name
              customer_name
              total_count
              email
              mobile_phone
              landline_phone
              notes
            }
            programs {
              id
              reservation_id
              category
              category_name
              program
              program_name
              date
              start_time
              end_time
              duration
              place
              place_name
              instructor
              instructor_name
              assistant
              assistant_name
              helper
              helper_name
              notes
              price
              participants
              is_multi
              multi1_name
              multi2_name
            }
          }
        }
      `,
      variables: { page1Id: parseInt(page1Id) },
      fetchPolicy: 'network-only'
    });
    
    if (data?.getPage2ByPage1Id) {
      console.log('[DataService] Found page2 data by page1_id:', data.getPage2ByPage1Id);
      showAlert?.('Page1 ID로 Page2 데이터를 불러왔습니다.', 'success');
      return data.getPage2ByPage1Id;
    } else {
      console.log('[DataService] No page2 data found for page1_id:', page1Id);
      showAlert?.('Page1 ID에 해당하는 Page2 데이터가 없습니다.', 'info');
      return null;
    }
  } catch (error) {
    console.error('[DataService] Error fetching page2 data by page1_id:', error);
    showAlert?.('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Save page2 data using GraphQL
 * @param {Object} formData - The form data to save
 * @param {Array} programs - The programs to save
 * @param {Function} showAlert - Function to show alerts
 * @param {Function} navigate - Function to navigate
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export const savePage2Data = async (formData, programs, showAlert, navigate) => {
  try {
    console.log('[DataService] Saving page2 data:', formData);
    
    const input = {
      page1_id: parseInt(formData.page1_id) || null,
      male_count: parseInt(formData.male_count) || 0,
      female_count: parseInt(formData.female_count) || 0,
      total_count: parseInt(formData.total_count) || 0,
      male_leader_count: parseInt(formData.male_leader_count) || 0,
      female_leader_count: parseInt(formData.female_leader_count) || 0,
      total_leader_count: parseInt(formData.total_leader_count) || 0,
      is_mou: formData.is_mou || false,
      org_nature: formData.org_nature || '',
      part_type: formData.part_type || '',
      age_type: formData.age_type || '',
      part_form: formData.part_form || '',
      service_type: formData.service_type || ''
    };
    
    // Check if we're creating or updating
    let result;
    if (formData.id) {
      // Update existing record
      const { data } = await apolloClient.mutate({
        mutation: gql`
          mutation UpdatePage2($id: Int!, $input: Page2Input!) {
            updatePage2(id: $id, input: $input) {
              id
              page1_id
            }
          }
        `,
        variables: {
          id: parseInt(formData.id),
          input
        }
      });
      
      result = data?.updatePage2;
      console.log('[DataService] Updated page2:', result);
    } else {
      // Create new record
      const { data } = await apolloClient.mutate({
        mutation: gql`
          mutation CreatePage2($input: Page2Input!) {
            createPage2(input: $input) {
              id
              page1_id
            }
          }
        `,
        variables: { input }
      });
      
      result = data?.createPage2;
      console.log('[DataService] Created page2:', result);
    }
    
    if (result) {
      showAlert('Page2 데이터가 성공적으로 저장되었습니다.', 'success');
      
      // Save programs
      if (programs && programs.length > 0) {
        console.log('[DataService] Saving programs:', programs.length);
      
        // Process each program
        for (const program of programs) {
          // Skip programs that are already saved and associated with this reservation
          if (program.id && !program.id.toString().startsWith('temp_') && 
              program.reservation_id && program.reservation_id.toString() === result.id.toString()) {
            console.log('[DataService] Skipping already saved program:', program.id);
            continue;
          }
          
          const programInput = {
            reservation_id: parseInt(result.id),
            category: program.category || null,
            program: program.program || null,
            date: program.date || null,
            start_time: program.start_time || null,
            end_time: program.end_time || null,
            duration: parseInt(program.duration) || null,
            place: program.place || null,
            instructor: program.instructor || null,
            assistant: program.assistant || null,
            helper: program.helper || null,
            notes: program.notes || null
          };
          
          try {
            const { data } = await apolloClient.mutate({
              mutation: gql`
                mutation CreatePage2Program($input: Page2ProgramInput!) {
                  createPage2Program(input: $input) {
                    id
        }
      }
              `,
              variables: { input: programInput }
            });
            
            console.log('[DataService] Program saved:', data?.createPage2Program);
          } catch (programError) {
            console.error('[DataService] Error saving program:', programError);
          }
        }
      }
      
      Swal.fire({
        icon: 'success',
        title: '저장 완료',
        text: '모든 데이터가 성공적으로 저장되었습니다.',
        confirmButtonText: '확인'
      }).then(() => {
        navigate('/new/page2');
      });
      
      return true;
      } else {
      showAlert('데이터 저장 중 문제가 발생했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error saving page2 data:', error);
    showAlert('데이터 저장 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Delete page2 data using GraphQL
 * @param {string} id - The ID of the record to delete
 * @param {Function} showAlert - Function to show alerts
 * @param {Function} navigate - Function to navigate
 * @param {Object} theme - MUI theme for confirmation dialog
 * @returns {Promise<boolean>} - Whether the delete was successful
 */
export const deletePage2Data = async (id, showAlert, navigate, theme) => {
  try {
    console.log('[DataService] Deleting page2 data:', id);
    
    // Confirmation dialog
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
      console.log('[DataService] Delete canceled by user');
      return false;
    }
    
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation DeletePage2($id: Int!) {
          deletePage2(id: $id)
        }
      `,
      variables: { id: parseInt(id) }
    });
    
    if (data?.deletePage2) {
      console.log('[DataService] Deleted page2:', id);
      
        Swal.fire({
          icon: 'success',
          title: '삭제 완료',
        text: '데이터가 성공적으로 삭제되었습니다.',
          confirmButtonText: '확인'
        }).then(() => {
          navigate('/new/page2');
        });
      
        return true;
      } else {
      showAlert('데이터 삭제 중 문제가 발생했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[DataService] Error deleting page2 data:', error);
    showAlert('데이터 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
}; 