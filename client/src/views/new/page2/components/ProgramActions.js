import React from 'react';
import { useMutation, useQuery, gql, useApolloClient } from '@apollo/client';
import Swal from 'sweetalert2';
import { 
  CREATE_PAGE2_PROGRAM, 
  UPDATE_PAGE2_PROGRAM,
  DELETE_PAGE2_PROGRAM,
  GET_ALL_PROGRAMS
} from '../graphql';
import { formatDateForServer } from '../utils/DataUtils';
import { 
  checkForBookingConflict, 
  checkForPersonnelConflict,
  checkForGlobalPersonnelConflict, 
  formatTimeNoSeconds 
} from '../utils/PersonnelUtils';

/**
 * ProgramActions component handles all program management functionality (CRUD)
 */
const ProgramActions = ({
  programs,
  setProgramForm,
  setPrograms,
  formData,
  editingProgramId,
  setEditingProgramId,
  programForm,
  setProgramListKey,
  showAlert,
  theme,
  getInstructorName,
  getAssistantName,
  getHelperName,
  getCategoryName,
  getProgramName,
  getLocationName
}) => {
  // Get Apollo client at component level
  const client = useApolloClient();

  // GraphQL Mutations
  const [createPage2Program, { loading: programCreateLoading }] = useMutation(CREATE_PAGE2_PROGRAM, {
    onCompleted: (data) => {
      console.log('[ProgramActions] Created new program:', data.createPage2Program);
      
      // 응답 데이터에 누락된 이름 필드가 있는지 확인하고 보완
      const newProgram = {
        ...data.createPage2Program,
        // 서버 응답에 이름 필드가 없으면 우리가 보낸 데이터나 함수로 보완
        category_name: data.createPage2Program.category_name || getCategoryName(data.createPage2Program.category),
        program_name: data.createPage2Program.program_name || getProgramName(data.createPage2Program.program),
        place_name: data.createPage2Program.place_name || getLocationName(data.createPage2Program.place),
        instructor_name: data.createPage2Program.instructor_name || getInstructorName(data.createPage2Program.instructor),
        assistant_name: data.createPage2Program.assistant_name || getAssistantName(data.createPage2Program.assistant),
        helper_name: data.createPage2Program.helper_name || getHelperName(data.createPage2Program.helper)
      };
      
      console.log('[ProgramActions] Enhanced new program with names:', newProgram);
      
      // Add new program to the list
      setPrograms([...programs, newProgram]);
      // Force a complete UI refresh using key based approach
      setProgramListKey(Date.now().toString());
      
      // Reset form
      setProgramForm({
        category: '',
        program: '',
        date: null,
        start_time: '',
        place: '',
        participants: 0,
        is_multi: false
      });
      
      // ProgramForm 컴포넌트에 초기화 이벤트 발생
      window.dispatchEvent(new CustomEvent('reset-program-form'));
      
      // Show success message
      let successMessage = '프로그램이 성공적으로 추가되었습니다.';
      showAlert(successMessage, 'success');
    },
    onError: (error) => {
      console.error('[ProgramActions] Error creating program:', error);
      showAlert(`프로그램 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });
  
  const [updatePage2Program, { loading: programUpdateLoading }] = useMutation(UPDATE_PAGE2_PROGRAM, {
    onCompleted: (data) => {
      console.log('[ProgramActions] Updated program from server response:', data.updatePage2Program);
      
      if (!data || !data.updatePage2Program) {
        console.error('[ProgramActions] Unexpected empty response from server');
        return;
      }
      
      // Update the program in the list, ensuring all name fields are set
      // Use both the data we sent and the response from the server
      const serverProgram = data.updatePage2Program;
      const editingProgram = programForm;
      const updatedProgram = {
        ...serverProgram,
        // Ensure name fields are populated with what we sent if server doesn't return them
        // This is critical to ensure the display names match what the user selected
        category_name: serverProgram.category_name || editingProgram.category_name || getCategoryName(serverProgram.category),
        program_name: serverProgram.program_name || editingProgram.program_name || getProgramName(serverProgram.program),
        place_name: serverProgram.place_name || editingProgram.place_name || getLocationName(serverProgram.place),
        instructor_name: serverProgram.instructor_name || editingProgram.instructor_name || getInstructorName(serverProgram.instructor),
        assistant_name: serverProgram.assistant_name || editingProgram.assistant_name || getAssistantName(serverProgram.assistant),
        helper_name: serverProgram.helper_name || editingProgram.helper_name || getHelperName(serverProgram.helper),
        // Always set multi-related fields to false/null
        is_multi: false,
        multi1_name: null,
        multi2_name: null
      };
      
      console.log('[ProgramActions] Updating program in list with merged data:', updatedProgram);
      
      // Immediately update the programs state with the updated program
      // This ensures the UI reflects changes right away
      setPrograms(prevPrograms => {
        const programIndex = prevPrograms.findIndex(p => p.id === updatedProgram.id);
        if (programIndex === -1) {
          console.warn(`[ProgramActions] Program with ID ${updatedProgram.id} not found in programs list`);
          return prevPrograms;
        }
        
        // Create a new array with the updated program
        const newPrograms = [...prevPrograms];
        newPrograms[programIndex] = updatedProgram;
        return newPrograms;
      });
      
      // Reset form state
      setProgramForm({});
      
      // ProgramForm 컴포넌트에 초기화 이벤트 발생
      window.dispatchEvent(new CustomEvent('reset-program-form'));
      
      // Clear editing ID with a small delay to ensure all updates are processed
      setTimeout(() => {
        setEditingProgramId(null);
      }, 100);
      
      // Force a complete UI refresh using key based approach
      setProgramListKey(Date.now().toString());
      
      // Show success alert with appropriate message
      let successMessage = '프로그램이 성공적으로 수정되었습니다.';
      showAlert(successMessage, 'success');
    },
    onError: (error) => {
      console.error('[ProgramActions] Error updating program:', error);
      showAlert(`프로그램 수정 중 오류가 발생했습니다: ${error.message}`, 'error');
      
      // Reset form state on error
      setProgramForm({});
      setEditingProgramId(null);
    }
  });
  
  const [deletePage2Program, { loading: programDeleteLoading }] = useMutation(DELETE_PAGE2_PROGRAM, {
    onCompleted: (data) => {
      if (data.deletePage2Program) {
        console.log('[ProgramActions] Deleted program:', editingProgramId);
        // Remove the program from the list
        setPrograms(prev => prev.filter(p => p.id !== editingProgramId));
        // Force a complete UI refresh using key based approach
        setProgramListKey(Date.now().toString());
        showAlert('프로그램이 성공적으로 삭제되었습니다.', 'success');
      }
    },
    onError: (error) => {
      console.error('[ProgramActions] Error deleting program:', error);
      showAlert('프로그램 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    }
  });

  // 모든 프로그램 데이터 조회 (다른 단체 포함)
  const { data: allProgramsData, loading: allProgramsLoading, error: allProgramsError } = useQuery(GET_ALL_PROGRAMS, {
    fetchPolicy: 'network-only', // 항상 최신 데이터를 서버에서 가져옴
    onCompleted: (data) => {
      console.log('[ProgramActions] Fetched all programs from all reservations:', data?.getAllPrograms?.length || 0);
    },
    onError: (error) => {
      console.error('[ProgramActions] Error fetching all programs:', error);
    }
  });

  // 인원 충돌 여부를 확인하는 함수
  const checkPersonnelConflicts = (programData) => {
    // 1. 현재 단체의 프로그램 내에서 충돌 확인
    const internalConflict = checkForPersonnelConflict(
      programData,
      programs,
      editingProgramId,
      getInstructorName,
      getAssistantName,
      getHelperName
    );

    // 현재 단체 내 충돌이 있으면 먼저 처리
    if (internalConflict.hasConflict) {
      return {
        ...internalConflict,
        isGlobal: false
      };
    }

    // 2. 모든 단체의 프로그램 간 충돌 확인 (다른 단체와의 충돌)
    if (allProgramsData?.getAllPrograms) {
      const globalConflict = checkForGlobalPersonnelConflict(
        programData,
        allProgramsData.getAllPrograms,
        editingProgramId,
        getInstructorName,
        getAssistantName,
        getHelperName
      );

      // 전체 단체 간 충돌 반환
      if (globalConflict.hasConflict) {
        return globalConflict;
      }
    }

    // 충돌 없음
    return { hasConflict: false };
  };

  // 인원 충돌 확인 및 경고 처리 함수
  const handlePersonnelConflict = (programData, externalPrograms, onConfirm) => {
    // Check both internal and external conflicts
    const hasConflict = checkForBookingConflict(programData, programs, editingProgramId, externalPrograms);
    console.log('[ProgramActions] Personnel conflict check result:', hasConflict);
    
    if (hasConflict) {
      // Show a conflict warning for place
      Swal.fire({
        title: '예약 충돌 감지',
        text: '같은 장소에 동일 시간대에 다른 예약이 이미 존재합니다. 계속 진행하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '예, 계속 진행합니다',
        cancelButtonText: '아니오, 취소합니다'
      }).then((result) => {
        if (result.isConfirmed) {
          // User wants to proceed even with conflicts
          onConfirm();
        }
      });
    } else {
      // No conflicts, proceed
      onConfirm();
    }
  };

  // Add a helper function to fetch external programs and check for conflicts
  const checkForExternalConflicts = (programData, callback) => {
    // If we don't have a valid place and date, no need to check
    if (!programData.place || !programData.date) {
      callback([]);
      return;
    }
    
    // Fetch all programs to check for conflicts
    client.query({
      query: GET_ALL_PROGRAMS,
      fetchPolicy: 'network-only' // Make sure we get the latest data
    }).then(({ data }) => {
      if (data && data.getAllPrograms) {
        // Filter to only include programs from other groups
        const externalPrograms = data.getAllPrograms.filter(program => {
          // If this program is from our current group, exclude it
          if (program.reservation?.page1?.id === parseInt(formData.page1_id)) {
            return false;
          }
          return true;
        });
        
        console.log('[ProgramActions] Found external programs to check against:', externalPrograms.length);
        callback(externalPrograms);
      } else {
        callback([]);
      }
    }).catch(error => {
      console.error('[ProgramActions] Error fetching external programs:', error);
      callback([]);
    });
  };

  // Handle add program
  const handleAddProgram = (progData) => {
    console.log('[ProgramActions] Adding program with data:', progData);
    
    // Don't add programs without a reservation_id
    if (!formData.id) {
      console.error('[ProgramActions] Cannot add program without reservation_id');
      alert('예약 정보를 먼저 저장해주세요.');
      return;
    }
    
    // Make sure we have an integer reservation_id
    const reservationId = parseInt(formData.id, 10);
    if (isNaN(reservationId)) {
      console.error('[ProgramActions] Invalid reservation_id:', formData.id);
      alert('유효하지 않은 예약 ID입니다. 새로고침 후 다시 시도해주세요.');
      return;
    }
    
    // Process and clean up data
    const processedProgData = {
      ...progData,
      reservation_id: reservationId,
      // Make sure numeric fields are sent as numbers
      participants: parseInt(progData.participants || 0, 10),
      price: parseInt(progData.price || 0, 10),
      // Always set multi-group fields to false/null
      is_multi: false,
      multi1_name: null,
      multi2_name: null
    };
    
    // Verify required fields
    const requiredFields = ['category', 'program', 'date', 'start_time', 'place'];
    const missingFields = requiredFields.filter(field => !processedProgData[field]);
    
    if (missingFields.length > 0) {
      console.error('[ProgramActions] Missing required fields:', missingFields);
      alert(`누락된 필수 항목이 있습니다: ${missingFields.join(', ')}`);
      return;
    }
    
    // Format date for server
    if (processedProgData.date) {
      processedProgData.date = formatDateForServer(processedProgData.date);
    }
    
    console.log('[ProgramActions] Processed program data:', processedProgData);
    
    // Before creating, check for possible conflicts
    checkForExternalConflicts(processedProgData, (externalPrograms) => {
      // Format date for server
      if (processedProgData.date) {
        processedProgData.date = formatDateForServer(processedProgData.date);
      }
      
      console.log('[ProgramActions] Processed program data:', processedProgData);
      
      // Create the base input for all program variants
      const baseInput = {
        reservation_id: reservationId,
        category: processedProgData.category,
        program: processedProgData.program,
        date: processedProgData.date,
        place: processedProgData.place,
        notes: processedProgData.notes || '',
        participants: processedProgData.participants || 0,
        price: processedProgData.price || 0
      };
      
      // If we have a program name collision, check for possible conflicts
      if (checkForBookingConflict(processedProgData, programs, null, externalPrograms)) {
        console.log('[ProgramActions] Booking conflict detected');
        // Show a conflict warning
        Swal.fire({
          title: '예약 충돌 감지',
          text: '같은 장소에 동일 시간대에 다른 예약이 이미 존재합니다. 계속 진행하시겠습니까?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: '예, 계속 진행합니다',
          cancelButtonText: '아니오, 취소합니다'
        }).then((result) => {
          if (result.isConfirmed) {
            // User wants to proceed even with a conflict
            completeCreateProgram(processedProgData);
          }
        });
      } else {
        // No conflicts, proceed with creation
        completeCreateProgram(processedProgData);
      }
    });
  };
  
  // Helper function to complete program creation after checks
  const completeCreateProgram = (processedProgData) => {
    // Create the input object for the mutation
    const input = {
      reservation_id: parseInt(formData.id),
      category: processedProgData.category,
      category_name: processedProgData.category_name,
      program: processedProgData.program,
      program_name: processedProgData.program_name,
      date: processedProgData.date,
      start_time: processedProgData.start_time,
      end_time: processedProgData.end_time,
      duration: processedProgData.duration?.toString(),
      place: processedProgData.place,
      place_name: processedProgData.place_name,
      instructor: processedProgData.instructor,
      instructor_name: processedProgData.instructor_name,
      assistant: processedProgData.assistant,
      assistant_name: processedProgData.assistant_name,
      helper: processedProgData.helper,
      helper_name: processedProgData.helper_name,
      notes: processedProgData.notes,
      price: processedProgData.price,
      participants: processedProgData.participants,
      is_multi: false,
      multi1_name: null,
      multi2_name: null
    };
    
    // Store the processed data in the state before sending to the server
    // This ensures we can merge properly in the onCompleted callback
    setProgramForm(processedProgData);
    
    createPage2Program({
      variables: { input }
    });
  };
  
  // Handle edit program
  const handleEditProgram = (program) => {
    console.log('[ProgramActions] Editing program:', program);
    
    // Set editing ID to track which program is being edited
    setEditingProgramId(program.id);
    
    // Reset program form completely
    setProgramForm({});
    
    // Force a complete reset of the form components by dispatching a custom event
    window.dispatchEvent(new CustomEvent('reset-program-form'));
    
    // 작은 지연 후 폼에 데이터 로딩
    setTimeout(() => {
      // Make a clean deep copy of the program data to avoid reference issues
      const programData = JSON.parse(JSON.stringify(program));
      
      // Always set multi-group fields to false/null
      programData.is_multi = false;
      programData.multi1_name = null;
      programData.multi2_name = null;
      
      // Create complete program object with all required fields
      const completeProgram = {
        ...programData,
        date: programData.date || null,
        start_time: programData.start_time || '',
        end_time: programData.end_time || '',
        duration: programData.duration || '',
        price: programData.price || 0,
        participants: programData.participants || 0
      };
      
      // Set the program form data
      setProgramForm(completeProgram);
      
      // Log the complete state for debugging
      console.log('[ProgramActions] Program form loaded with data:', completeProgram);
      
      showAlert('프로그램을 수정합니다.', 'info');
    }, 200); // Increased delay to ensure reset is complete
  };
  
  // Handle update program
  const handleUpdateProgram = (id, progData) => {
    console.log('[ProgramActions] Updating program:', id, progData);
    
    // Process and clean up data for update
    const processedProgData = {
      ...progData,
      id: parseInt(id, 10),
      // Make sure numeric fields are sent as numbers
      participants: parseInt(progData.participants || 0, 10),
      price: parseInt(progData.price || 0, 10),
      // Always set multi-group fields to false/null
      is_multi: false,
      multi1_name: null,
      multi2_name: null
    };
    
    // Format date for server
    if (processedProgData.date) {
      processedProgData.date = formatDateForServer(processedProgData.date);
    }
    
    console.log('[ProgramActions] Processed program update data:', processedProgData);
    
    // Check for external conflicts with other groups
    checkForExternalConflicts(processedProgData, (externalPrograms) => {
      // Check for personnel conflicts using the enhanced function that includes external programs
      handlePersonnelConflict(processedProgData, externalPrograms, () => {
        // This function is called if there's no conflict or user confirms despite the conflict
        
        // Create the input object for the mutation
        const input = {
          reservation_id: parseInt(formData.id),
          category: processedProgData.category,
          category_name: processedProgData.category_name,
          program: processedProgData.program,
          program_name: processedProgData.program_name,
          date: processedProgData.date,
          start_time: processedProgData.start_time,
          end_time: processedProgData.end_time,
          duration: processedProgData.duration?.toString(),
          place: processedProgData.place,
          place_name: processedProgData.place_name,
          instructor: processedProgData.instructor,
          instructor_name: processedProgData.instructor_name,
          assistant: processedProgData.assistant,
          assistant_name: processedProgData.assistant_name,
          helper: processedProgData.helper,
          helper_name: processedProgData.helper_name,
          notes: processedProgData.notes,
          price: processedProgData.price,
          participants: processedProgData.participants,
          is_multi: false,
          multi1_name: null,
          multi2_name: null
        };
        
        // Store the processed data in the state before sending to the server
        // This ensures we can merge properly in the onCompleted callback
        setProgramForm(processedProgData);
        
        updatePage2Program({
          variables: { 
            id: parseInt(id),
            input
          }
        });
      });
    });
  };
  
  // Handle delete program
  const handleDeleteProgram = (programId) => {
    console.log('[ProgramActions] Deleting program with ID:', programId);
    
    // Find the program to get its details
    const programToDelete = programs.find(p => p.id === programId);
    
    // Build appropriate message
    let confirmMessage = '프로그램을 삭제하시겠습니까?';
    
    // If it's a temporary ID (client-side only)
    if (typeof programId === 'string' && programId.startsWith('temp_')) {
      console.log('[ProgramActions] Deleting temporary program from local state');
      setPrograms(prev => prev.filter(p => p.id !== programId));
      // Force a complete UI refresh using key based approach
      setProgramListKey(Date.now().toString());
      showAlert('프로그램이 목록에서 삭제되었습니다.', 'success');
    } else {
      // Confirm deletion
      Swal.fire({
        title: confirmMessage,
        text: '이 작업은 되돌릴 수 없습니다!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: theme.palette.error.main,
        cancelButtonColor: theme.palette.grey[500],
        confirmButtonText: '예, 삭제합니다',
        cancelButtonText: '취소'
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('[ProgramActions] Confirmed deletion of program ID:', programId);
          setEditingProgramId(programId); // Set for the callback to use
          
          deletePage2Program({
            variables: { id: parseInt(programId) }
          })
          .then(response => {
            console.log('[ProgramActions] Program deleted successfully:', response);
            
            // Show success alert with appropriate message
            let successMessage = '프로그램이 성공적으로 삭제되었습니다.';
            showAlert(successMessage, 'success');
            // The program will be removed from the list by the onCompleted callback
          })
          .catch(error => {
            console.error('[ProgramActions] Error deleting program:', error);
            showAlert(`프로그램 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
          });
        }
      });
    }
  };
  
  // Handle reset program form
  const handleResetProgramForm = () => {
    // Reset to empty values for required fields
    setProgramForm({
      category: '',
      program: '',
      date: null,
      start_time: '',
      place: '',
      participants: 0,
      is_multi: false,
      multi1_name: null,
      multi2_name: null
    });
    setEditingProgramId(null);
    
    // ProgramForm 컴포넌트에 초기화 이벤트 발생
    window.dispatchEvent(new CustomEvent('reset-program-form'));
  };

  return {
    handleAddProgram,
    handleEditProgram,
    handleUpdateProgram,
    handleDeleteProgram,
    handleResetProgramForm,
    loading: programCreateLoading || programUpdateLoading || programDeleteLoading
  };
};

export default ProgramActions; 