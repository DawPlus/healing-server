import { gql } from '@apollo/client';
import { client } from '../index';
import Swal from 'sweetalert2';

/**
 * Add or update a program
 * @param {Object} progData - Program data to add/update
 * @param {Object} formData - Parent form data
 * @param {Array} categories - Available categories
 * @param {Array} menuPrograms - Available programs
 * @param {Array} locations - Available locations
 * @param {Array} instructors - Available instructors
 * @param {Array} assistants - Available assistants
 * @param {Array} helpers - Available helpers
 * @param {string|null} editingProgramId - ID of program being edited, or null for new program
 * @param {Function} setEditingProgramId - Function to update editing ID state
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const addOrUpdateProgram = async (
  progData,
  formData,
  categories,
  menuPrograms,
  locations,
  instructors,
  assistants,
  helpers,
  editingProgramId,
  setEditingProgramId,
  showAlert
) => {
  try {
    console.log('[ProgramService] Adding/updating program:', progData, 'Editing ID:', editingProgramId);
    
    // Get name fields based on IDs
    const categoryName = getCategoryName(progData.category, categories);
    const programName = getProgramName(progData.program, menuPrograms);
    const placeName = getLocationName(progData.place, locations);
    const instructorName = getInstructorName(progData.instructor, instructors);
    const assistantName = getAssistantName(progData.assistant, assistants);
    const helperName = getHelperName(progData.helper, helpers);
    
    // Prepare the input data
    const input = {
      reservation_id: parseInt(formData.id) || null,
      category: progData.category || null,
      program: progData.program || null,
      date: progData.date || null,
      start_time: progData.start_time || null,
      end_time: progData.end_time || null,
      duration: parseInt(progData.duration) || null,
      place: progData.place || null,
      instructor: progData.instructor || null,
      assistant: progData.assistant || null,
      helper: progData.helper || null,
      notes: progData.notes || null
    };
    
    let result;
    
    // If we have a reservation_id and we're editing, update the program
    if (formData.id && editingProgramId && !editingProgramId.toString().startsWith('temp_')) {
      const { data } = await client.mutate({
        mutation: gql`
          mutation UpdatePage2Program($id: Int!, $input: Page2ProgramInput!) {
            updatePage2Program(id: $id, input: $input) {
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
            }
          }
        `,
        variables: {
          id: parseInt(editingProgramId),
          input
        }
      });
      
      result = data?.updatePage2Program;
      console.log('[ProgramService] Updated program:', result);
      showAlert('프로그램이 성공적으로 업데이트되었습니다.', 'success');
  }
    // If we have a reservation_id but not editing, create a new program
    else if (formData.id) {
      const { data } = await client.mutate({
        mutation: gql`
          mutation CreatePage2Program($input: Page2ProgramInput!) {
            createPage2Program(input: $input) {
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
            }
          }
        `,
        variables: { input }
      });
      
      result = data?.createPage2Program;
      console.log('[ProgramService] Created program:', result);
      showAlert('프로그램이 성공적으로 추가되었습니다.', 'success');
  }
    // If we don't have a reservation_id yet, return a temporary structure
    else {
      result = {
        id: `temp_${Date.now()}`,
        reservation_id: null,
        ...progData,
    category_name: categoryName,
    program_name: programName,
    place_name: placeName,
    instructor_name: instructorName,
    assistant_name: assistantName,
    helper_name: helperName
  };
  
      console.log('[ProgramService] Created temporary program:', result);
      showAlert('프로그램이 목록에 추가되었습니다. 예약 정보 저장 시 함께 저장됩니다.', 'success');
    }
    
    // Reset editing state
    if (setEditingProgramId) {
    setEditingProgramId(null);
    }
    
    return result;
  } catch (error) {
    console.error('[ProgramService] Error adding/updating program:', error);
    showAlert('프로그램 추가/수정 중 오류가 발생했습니다: ' + error.message, 'error');
    return null;
  }
};

/**
 * Edit a program (set program form data)
 * @param {Object} program - Program to edit
 * @param {Function} setProgramForm - Function to update program form state
 * @param {Function} setEditingProgramId - Function to update editing ID state
 */
export const editProgram = (program, setProgramForm, setEditingProgramId) => {
  console.log('[ProgramService] Setting program form for editing:', program);
  setProgramForm(program);
  setEditingProgramId(program.id);
};

/**
 * Update a program
 * @param {Object} progData - Updated program data
 * @param {Array} programs - Current programs list
 * @param {string} programId - ID of program to update
 * @param {Array} categories - Available categories
 * @param {Array} menuPrograms - Available programs
 * @param {Array} locations - Available locations
 * @param {Array} instructors - Available instructors
 * @param {Array} assistants - Available assistants
 * @param {Array} helpers - Available helpers
 * @param {Function} setProgramForm - Function to update program form state
 * @param {Function} handleResetProgramForm - Function to reset program form
 * @param {Function} showAlert - Function to show alerts
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const updateProgram = async (
  progData,
  programs,
  programId,
  categories,
  menuPrograms,
  locations,
  instructors,
  assistants,
  helpers,
  setProgramForm,
  handleResetProgramForm,
  showAlert
) => {
  try {
    console.log('[ProgramService] Updating program:', progData, 'ID:', programId);
  
    // If it's a temporary ID (client-side only)
    if (typeof programId === 'string' && programId.startsWith('temp_')) {
      // Get name fields
      const categoryName = getCategoryName(progData.category, categories);
      const programName = getProgramName(progData.program, menuPrograms);
      const placeName = getLocationName(progData.place, locations);
      const instructorName = getInstructorName(progData.instructor, instructors);
      const assistantName = getAssistantName(progData.assistant, assistants);
      const helperName = getHelperName(progData.helper, helpers);
  
      // Create updated program object
  const updatedProgram = {
        ...progData,
        id: programId,
    category_name: categoryName,
    program_name: programName,
    place_name: placeName,
    instructor_name: instructorName,
    assistant_name: assistantName,
    helper_name: helperName
  };
  
      console.log('[ProgramService] Updated temporary program:', updatedProgram);
      
      // Find the program in the list
      const programIndex = programs.findIndex(p => p.id === programId);
      if (programIndex !== -1) {
        const updatedPrograms = [...programs];
        updatedPrograms[programIndex] = updatedProgram;
        
        // Return the updated list
        setProgramForm(updatedPrograms);
        showAlert('프로그램이 업데이트되었습니다.', 'success');
      } else {
        console.error('[ProgramService] Program not found in list:', programId);
        showAlert('업데이트할 프로그램을 찾을 수 없습니다.', 'error');
    }
    } else {
      // Use GraphQL to update
      const input = {
        reservation_id: parseInt(progData.reservation_id) || null,
        category: progData.category || null,
        program: progData.program || null,
        date: progData.date || null,
        start_time: progData.start_time || null,
        end_time: progData.end_time || null,
        duration: parseInt(progData.duration) || null,
        place: progData.place || null,
        instructor: progData.instructor || null,
        assistant: progData.assistant || null,
        helper: progData.helper || null,
        notes: progData.notes || null
      };
      
      const { data } = await client.mutate({
        mutation: gql`
          mutation UpdatePage2Program($id: Int!, $input: Page2ProgramInput!) {
            updatePage2Program(id: $id, input: $input) {
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
            }
          }
        `,
        variables: {
          id: parseInt(programId),
          input
        }
      });
      
      const result = data?.updatePage2Program;
      console.log('[ProgramService] Updated program via GraphQL:', result);
      
      if (result) {
        // Find the program in the list and update it
        const updatedPrograms = programs.map(p => 
          p.id === result.id ? result : p
        );
        
        // Return the updated list
        setProgramForm(updatedPrograms);
        showAlert('프로그램이 성공적으로 업데이트되었습니다.', 'success');
      } else {
        showAlert('프로그램 업데이트 중 문제가 발생했습니다.', 'error');
      }
    }
  
    // Reset form
  handleResetProgramForm();
  
    return true;
  } catch (error) {
    console.error('[ProgramService] Error updating program:', error);
    showAlert('프로그램 업데이트 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

/**
 * Delete a program
 * @param {string} programId - ID of program to delete
 * @param {Function} setPrograms - Function to update programs state
 * @param {Function} showAlert - Function to show alerts
 * @param {Object} theme - MUI theme for confirmation dialog
 * @returns {Promise<boolean>} - Whether the delete was successful
 */
export const deleteProgram = async (programId, setPrograms, showAlert, theme) => {
  try {
    console.log('[ProgramService] Deleting program:', programId);
    
    // If it's a temporary ID (client-side only)
    if (typeof programId === 'string' && programId.startsWith('temp_')) {
      // Just remove from the local state
      setPrograms(prev => prev.filter(p => p.id !== programId));
      showAlert('프로그램이 목록에서 삭제되었습니다.', 'success');
      return true;
    }
    
    // Confirmation dialog
  const result = await Swal.fire({
      title: '프로그램을 삭제하시겠습니까?',
      text: '이 작업은 되돌릴 수 없습니다!',
    icon: 'warning',
    showCancelButton: true,
      confirmButtonColor: theme?.palette?.error?.main || '#f44336',
      cancelButtonColor: theme?.palette?.grey?.[500] || '#aaaaaa',
      confirmButtonText: '예, 삭제합니다',
      cancelButtonText: '취소'
  });
  
    if (!result.isConfirmed) {
      console.log('[ProgramService] Delete canceled by user');
      return false;
    }
    
    const { data } = await client.mutate({
      mutation: gql`
        mutation DeletePage2Program($id: Int!) {
          deletePage2Program(id: $id)
        }
      `,
      variables: { id: parseInt(programId) }
    });
    
    if (data?.deletePage2Program) {
      console.log('[ProgramService] Deleted program:', programId);
      
      // Update local state
      setPrograms(prev => prev.filter(p => p.id !== programId));
      
      showAlert('프로그램이 성공적으로 삭제되었습니다.', 'success');
    return true;
    } else {
      showAlert('프로그램 삭제 중 문제가 발생했습니다.', 'error');
      return false;
    }
  } catch (error) {
    console.error('[ProgramService] Error deleting program:', error);
    showAlert('프로그램 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    return false;
  }
};

// Helper functions to get names from IDs
const getCategoryName = (categoryId, categories) => {
  if (!categoryId || !categories) return '';
  const category = categories.find(c => c.id === categoryId);
  return category ? category.category_name : '';
};

const getProgramName = (programId, menuPrograms) => {
  if (!programId || !menuPrograms) return '';
  const program = menuPrograms.find(p => p.id === programId);
  return program ? program.program_name : '';
};

const getLocationName = (locationId, locations) => {
  if (!locationId || !locations) return '';
  const location = locations.find(l => l.id === locationId);
  return location ? location.location_name : '';
};

const getInstructorName = (instructorId, instructors) => {
  if (!instructorId || !instructors) return '';
  const instructor = instructors.find(i => i.id === instructorId);
  return instructor ? instructor.name : '';
};

const getAssistantName = (assistantId, assistants) => {
  if (!assistantId || !assistants) return '';
  const assistant = assistants.find(a => a.id === assistantId);
  return assistant ? assistant.name : '';
};

const getHelperName = (helperId, helpers) => {
  if (!helperId || !helpers) return '';
  const helper = helpers.find(h => h.id === helperId);
  return helper ? helper.name : '';
}; 