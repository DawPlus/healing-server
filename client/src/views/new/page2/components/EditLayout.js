import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import SaveIcon from '@mui/icons-material/Save';
import { gql } from '@apollo/client';

import { 
  GET_PAGE2_BY_PAGE1_ID, 
  CREATE_PAGE2, 
  UPDATE_PAGE2, 
  DELETE_PAGE2
} from '../graphql';
import Page1InfoCard from 'views/new/common/Page1InfoCard';
import { sanitizePage1DataForSubmit } from '../utils/DataUtils';
import ProgramForm from './ProgramForm';
import ProgramList from './ProgramList';
import ProgramActions from './ProgramActions';
import { fetchMenuData } from '../services/menuService';
import ParticipantForm from './ParticipantForm';
import BusinessCategoryForm from './BusinessCategoryForm';
import AgeGroupForm from './AgeGroupForm';

/**
 * EditLayout component provides the layout structure for Edit functionality
 */
const EditLayout = ({ 
  id, 
  isEmbedded = false, 
  onDataUpdate, 
  hideReservationInfo = false 
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if initial data fetch has been done
  const initialFetchDone = useRef(false);
  
  // Track if defaults have been applied
  const defaultsApplied = useRef(false);
  
  // State
  const [formData, setFormData] = useState({ 
    page1_id: parseInt(id),
    male_count: 0,
    female_count: 0,
    total_count: 0,
    male_leader_count: 0,
    female_leader_count: 0,
    total_leader_count: 0,
    org_nature: '',
    part_type: '',
    age_type: '',
    part_form: '',
    service_type: '',
    // Age group fields - initialize with 0 instead of default values
    infant_count: 0,
    elementary_count: 0,
    middle_count: 0,
    high_count: 0,
    adult_count: 0,
    elderly_count: 0,
    age_group_total: 0
  });
  const [programForm, setProgramForm] = useState({
    // Initialize with empty values for required fields
    category: '',
    program: '',
    date: null,
    start_time: '',
    place: '',
    participants: 0,
    is_multi: false
  });
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [programListKey, setProgramListKey] = useState(Date.now().toString());
  
  // State for menu data
  const [categories, setCategories] = useState([]);
  const [menuPrograms, setMenuPrograms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [helpers, setHelpers] = useState([]);

  // Show alert message
  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
    
    // Call onDataUpdate if provided and severity is success
    if (typeof onDataUpdate === 'function' && severity === 'success') {
      onDataUpdate(message);
    }
  };
  
  // Helper functions to get names from IDs
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '';
    const id = typeof categoryId === 'string' ? categoryId : categoryId.toString();
    const category = categories.find(c => c.id.toString() === id);
    return category ? category.category_name : '';
  };
  
  const getProgramName = (programId) => {
    if (!programId) return '';
    const id = typeof programId === 'string' ? programId : programId.toString();
    const program = menuPrograms.find(p => p.id.toString() === id);
    return program ? program.program_name : '';
  };
  
  const getLocationName = (locationId) => {
    if (!locationId) return '';
    const id = typeof locationId === 'string' ? locationId : locationId.toString();
    const location = locations.find(l => l.id.toString() === id);
    return location ? location.location_name : '';
  };
  
  const getInstructorName = (instructorId) => {
    if (!instructorId) return '';
    const id = typeof instructorId === 'string' ? instructorId : instructorId.toString();
    const instructor = instructors.find(i => i.id.toString() === id);
    return instructor ? instructor.name : '';
  };
  
  const getAssistantName = (assistantId) => {
    if (!assistantId) return '';
    const id = typeof assistantId === 'string' ? assistantId : assistantId.toString();
    const assistant = assistants.find(a => a.id.toString() === id);
    return assistant ? assistant.name : '';
  };
  
  const getHelperName = (helperId) => {
    if (!helperId) return '';
    const id = typeof helperId === 'string' ? helperId : helperId.toString();
    const helper = helpers.find(h => h.id.toString() === id);
    return helper ? helper.name : '';
  };

  // Check if a program is an event program (allowed to have booking conflicts)
  const isEventProgram = (program) => {
    // Check if the program or category has "이벤트" in its name
    const programName = program.program_name || getProgramName(program.program) || '';
    const categoryName = program.category_name || getCategoryName(program.category) || '';
    
    return programName.includes('이벤트') || categoryName.includes('이벤트');
  };

  // Function to ensure program data is normalized with all needed display fields
  const normalizePrograms = (programList) => {
    if (!programList || !Array.isArray(programList)) return [];

    console.log('[EditLayout] Normalizing program data:', programList.length, 'items');
    
    return programList.map(program => {
      // Create a clone to avoid mutations
      const normalized = { ...program };
      
      try {
        // Ensure name fields are set if they're missing
        if (!normalized.category_name && normalized.category) {
          normalized.category_name = getCategoryName(normalized.category);
          console.log(`[EditLayout] Set category_name for ID ${normalized.category}: ${normalized.category_name}`);
        }
        
        if (!normalized.program_name && normalized.program) {
          normalized.program_name = getProgramName(normalized.program);
          console.log(`[EditLayout] Set program_name for ID ${normalized.program}: ${normalized.program_name}`);
        }
        
        if (!normalized.place_name && normalized.place) {
          normalized.place_name = getLocationName(normalized.place);
          console.log(`[EditLayout] Set place_name for ID ${normalized.place}: ${normalized.place_name}`);
        }
        
        if (!normalized.instructor_name && normalized.instructor) {
          normalized.instructor_name = getInstructorName(normalized.instructor);
          console.log(`[EditLayout] Set instructor_name for ID ${normalized.instructor}: ${normalized.instructor_name}`);
        }
        
        if (!normalized.assistant_name && normalized.assistant) {
          normalized.assistant_name = getAssistantName(normalized.assistant);
          console.log(`[EditLayout] Set assistant_name for ID ${normalized.assistant}: ${normalized.assistant_name}`);
        }
        
        if (!normalized.helper_name && normalized.helper) {
          normalized.helper_name = getHelperName(normalized.helper);
          console.log(`[EditLayout] Set helper_name for ID ${normalized.helper}: ${normalized.helper_name}`);
        }
      } catch (error) {
        console.error('[EditLayout] Error normalizing program data:', error);
      }
      
      return normalized;
    });
  };

  // Page1 data query
  const { 
    loading: page1Loading, 
    error: page1Error,
    data: page1Data 
  } = useQuery(gql`
    query GetPage1ById($id: Int!) {
      getPage1ById(id: $id) {
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
        business_category
        business_subcategory
        business_detail_category
        reservation_manager
        operation_manager
      }
    }
  `, {
    variables: { id: parseInt(id) },
    skip: !id || isNaN(parseInt(id)),
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('[EditLayout] Fetched page1 data:', data);
    }
  });
  
  // Page2 data query
  const { 
    loading: page2Loading, 
    error: page2Error,
    data: page2Data,
    refetch: refetchPage2
  } = useQuery(GET_PAGE2_BY_PAGE1_ID, {
    variables: { page1Id: parseInt(id) },
    skip: !id || isNaN(parseInt(id)),
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.getPage2ByPage1Id) {
        console.log('[EditLayout] Fetched page2 data by page1_id:', data.getPage2ByPage1Id);
        // 상태 업데이트 전에 초기화 완료로 표시하여 무한 루프 방지
        defaultsApplied.current = true;
        
        setFormData({
          ...data.getPage2ByPage1Id,
          page1_id: parseInt(id)
        });
        
        // Normalize the programs data to ensure all name fields are available
        const normalizedPrograms = normalizePrograms(data.getPage2ByPage1Id.programs || []);
        setPrograms(normalizedPrograms);
      } else if (page1Data?.getPage1ById) {
        // page2 데이터가 없지만 page1 데이터는 있는 경우 - 새로운 page2 레코드 생성 준비
        console.log('[EditLayout] No page2 data found, initializing with page1 data and default age group values');
        // 상태 업데이트 전에 초기화 완료로 표시하여 무한 루프 방지
        defaultsApplied.current = true;
        
        setFormData({
          page1_id: parseInt(id),
          total_count: page1Data.getPage1ById.total_count || 0,
          male_count: 0,
          female_count: 0,
          male_leader_count: 0,
          female_leader_count: 0,
          total_leader_count: 0,
          org_nature: '',
          part_type: '',
          age_type: '',
          part_form: '',
          service_type: '',
          // Initialize age group values with 0 for new records
          infant_count: 0,
          elementary_count: 0,
          middle_count: 0,
          high_count: 0,
          adult_count: 0,
          elderly_count: 0,
          age_group_total: 0
        });
        setPrograms([]);
      }
    }
  });

  // Page2 mutations
  const [createPage2, { loading: createPage2Loading }] = useMutation(CREATE_PAGE2, {
    onCompleted: (data) => {
      console.log('[EditLayout] Created new Page2 record:', data.createPage2);
      
      // Update the form data with the new ID and refetch
      setFormData({
        ...formData,
        id: data.createPage2.id
      });
      
      setIsLoading(false);
      showAlert('예약 정보가 성공적으로 저장되었습니다.', 'success');
    },
    onError: (error) => {
      console.error('[EditLayout] Error creating Page2:', error);
      setIsLoading(false);
      showAlert(`예약 정보 저장 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });
  
  const [updatePage2, { loading: updatePage2Loading }] = useMutation(UPDATE_PAGE2, {
    onCompleted: (data) => {
      console.log('[EditLayout] Updated Page2 record:', data.updatePage2);
      if (onDataUpdate) onDataUpdate(formData);
      setIsLoading(false);
      showAlert('예약 정보가 성공적으로 업데이트되었습니다.', 'success');
    },
    onError: (error) => {
      console.error('[EditLayout] Error updating Page2:', error);
      setIsLoading(false);
      showAlert(`예약 정보 업데이트 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });
  
  const [deletePage2, { loading: deletePage2Loading }] = useMutation(DELETE_PAGE2, {
    onCompleted: () => {
      console.log('[EditLayout] Deleted Page2 record');
      navigate('/dashboard/reservations');
      showAlert('예약 정보가 성공적으로 삭제되었습니다.', 'success');
    },
    onError: (error) => {
      console.error('[EditLayout] Error deleting Page2:', error);
      showAlert(`예약 정보 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });
  
  // Initialize ProgramActions
  const {
    handleAddProgram,
    handleEditProgram,
    handleUpdateProgram,
    handleDeleteProgram,
    handleResetProgramForm,
    loading: programActionsLoading
  } = ProgramActions({
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
  });

  // Compute overall loading state
  useEffect(() => {
    setIsLoading(page1Loading || page2Loading || createPage2Loading || updatePage2Loading || 
                 deletePage2Loading || programActionsLoading);
  }, [page1Loading, page2Loading, createPage2Loading, updatePage2Loading, 
      deletePage2Loading, programActionsLoading]);
  
  // Initial data load - only runs once
  useEffect(() => {
    if (!id || initialFetchDone.current) return;
    
    console.log('[EditLayout] Component mounted, id:', id, 'ID type:', typeof id);
    initialFetchDone.current = true; // Mark as fetched to prevent repeated fetches
    
    // Fetch menu data
    fetchMenuData(
      setCategories,
      setMenuPrograms,
      setLocations,
      setInstructors,
      setAssistants,
      setHelpers,
      setAlertOpen,
      setAlertMessage,
      setAlertSeverity,
      isMounted
    );
    
    // If we have an ID, try to fetch data
    if (id) {
      console.log(`[EditLayout] Fetching data for page1_id: ${id}`);
      
      // Force refetch page2 data
      if (refetchPage2) {
        console.log('[EditLayout] Forcing refetch of page2 data');
        refetchPage2({ variables: { page1Id: parseInt(id) } });
      }
    }
  }, [id, refetchPage2]);

  // Monitor menu data loading
  useEffect(() => {
    // 메뉴 데이터가 로드되었는지 확인
    console.log(`[EditLayout] Menu data loaded status:
      - Categories: ${categories.length} items
      - Programs: ${menuPrograms.length} items
      - Locations: ${locations.length} items
      - Instructors: ${instructors.length} items
      - Assistants: ${assistants.length} items
      - Helpers: ${helpers.length} items
    `);
    
    // 메뉴 데이터가 존재하고 프로그램이 있는 경우에만 프로그램 정규화
    if (programs.length > 0 && menuPrograms.length > 0) {
      console.log('[EditLayout] Re-normalizing programs with fresh menu data');
      const normalizedPrograms = normalizePrograms(programs);
      
      // 정규화된 데이터가 다른 경우에만 업데이트
      const currentProgramNames = programs.map(p => p.program_name).join(',');
      const newProgramNames = normalizedPrograms.map(p => p.program_name).join(',');
      
      if (currentProgramNames !== newProgramNames) {
        console.log('[EditLayout] Program names changed, updating program list');
        setPrograms(normalizedPrograms);
        // 프로그램 목록 키 업데이트하여 리렌더링 강제화
        setProgramListKey(Date.now().toString());
      }
    }
  }, [categories, menuPrograms, locations, instructors, assistants, helpers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[EditLayout] Component unmounting');
      isMounted.current = false;
    };
  }, []);
  
  // Handle changing a form field
  const handleFieldChange = (field, value) => {
    // 현재 값과 동일하면 업데이트하지 않음 (불필요한 리렌더링 방지)
    if (formData[field] === value) {
      console.log(`[EditLayout] Skipping update for ${field} - value unchanged`);
      return;
    }
    
    // Special handling for boolean fields
    let processedValue = value;
    if (field === 'is_mou') {
      // Convert to proper boolean
      processedValue = value === true || value === 'true' || value === 1 ? true : false;
      console.log(`[EditLayout] Converting is_mou value from ${value} (${typeof value}) to ${processedValue} (${typeof processedValue})`);
    }
    
    console.log(`[EditLayout] Updating field ${field} from '${formData[field]}' to '${processedValue}'`);
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };
  
  // Handle program form changes
  const handleProgramFormChange = (field, value) => {
    // Avoid unnecessary updates
    if (programForm[field] === value) {
      return;
    }
    
    console.log(`[EditLayout] Updating program form field ${field}:`, value);
    
    // 폼이 비어있고, 첫 필드가 입력되는 경우 다른 필드들을 초기화
    const isEmptyForm = !programForm.category && !programForm.program && !programForm.date;
    const isFirstFieldInput = isEmptyForm && ['category', 'program', 'date', 'start_time'].includes(field);
    
    if (isFirstFieldInput && editingProgramId === null) {
      console.log('[EditLayout] First field input detected, resetting any lingering form data');
      const initialForm = {
        category: '',
        program: '',
        date: null,
        start_time: '',
        end_time: '',
        place: '',
        instructor: '',
        assistant: '',
        helper: '',
        notes: '',
        participants: 0,
        price: 0,
        is_multi: false,
        multi1_name: null,
        multi2_name: null,
        [field]: value // 현재 입력 필드만 값을 설정
      };
      
      // ID 필드 선택 시 관련 이름 필드도 설정
      if (field === 'category') {
        initialForm.category_name = getCategoryName(value);
      } else if (field === 'program') {
        initialForm.program_name = getProgramName(value);
      } else if (field === 'place') {
        initialForm.place_name = getLocationName(value);
      } else if (field === 'instructor') {
        initialForm.instructor_name = getInstructorName(value);
      } else if (field === 'assistant') {
        initialForm.assistant_name = getAssistantName(value);
      } else if (field === 'helper') {
        initialForm.helper_name = getHelperName(value);
      }
      
      setProgramForm(initialForm);
    } else {
      // 일반적인 경우에는 단일 필드 업데이트
      const updates = { [field]: value };
      
      // ID 필드 선택 시 관련 이름 필드도 업데이트
      if (field === 'category') {
        updates.category_name = getCategoryName(value);
        console.log(`[EditLayout] Adding category_name: ${updates.category_name}`);
      } else if (field === 'program') {
        updates.program_name = getProgramName(value);
        console.log(`[EditLayout] Adding program_name: ${updates.program_name}`);
      } else if (field === 'place') {
        updates.place_name = getLocationName(value);
        console.log(`[EditLayout] Adding place_name: ${updates.place_name}`);
      } else if (field === 'instructor') {
        updates.instructor_name = getInstructorName(value);
        console.log(`[EditLayout] Adding instructor_name: ${updates.instructor_name}`);
      } else if (field === 'assistant') {
        updates.assistant_name = getAssistantName(value);
        console.log(`[EditLayout] Adding assistant_name: ${updates.assistant_name}`);
      } else if (field === 'helper') {
        updates.helper_name = getHelperName(value);
        console.log(`[EditLayout] Adding helper_name: ${updates.helper_name}`);
      }
      
      setProgramForm(prev => ({
        ...prev,
        ...updates
      }));
    }
  };

  // Handle save reservation
  const handleSaveReservation = () => {
    // Validate form data
    if (!formData.page1_id) {
      showAlert('Page1 ID는 필수 입력 항목입니다.', 'warning');
      return;
    }
    
    // Calculate totals for validation
    const participantTotal = parseInt(formData.total_count || 0) + parseInt(formData.total_leader_count || 0);
    const ageGroupTotal = parseInt(formData.age_group_total || 0);
    
    // Check if the age group counts match the participant totals
    if (ageGroupTotal > 0 && participantTotal !== ageGroupTotal) {
      Swal.fire({
        title: '인원수 불일치',
        html: `
          <p>연령대 총인원(${ageGroupTotal}명)과 참여자+인솔자 총인원(${participantTotal}명)이 일치하지 않습니다.</p>
          <p>모든 인원수를 확인해주세요.</p>
        `,
        icon: 'warning',
        confirmButtonText: '확인'
      });
      return;
    }
    
    console.log('[EditLayout] Starting save operation with formData:', formData);
    setIsLoading(true);
    
    const input = {
      page1_id: parseInt(formData.page1_id),
      male_count: parseInt(formData.male_count || 0),
      female_count: parseInt(formData.female_count || 0),
      total_count: parseInt(formData.total_count || 0),
      male_leader_count: parseInt(formData.male_leader_count || 0),
      female_leader_count: parseInt(formData.female_leader_count || 0),
      total_leader_count: parseInt(formData.total_leader_count || 0),
      org_nature: formData.org_nature || '',
      part_type: formData.part_type || '',
      age_type: formData.age_type || '',
      part_form: formData.part_form || '',
      service_type: formData.service_type || '',
      // Age group data
      infant_count: parseInt(formData.infant_count || 0),
      elementary_count: parseInt(formData.elementary_count || 0),
      middle_count: parseInt(formData.middle_count || 0),
      high_count: parseInt(formData.high_count || 0),
      adult_count: parseInt(formData.adult_count || 0),
      elderly_count: parseInt(formData.elderly_count || 0)
    };
    
    console.log('[EditLayout] Saving reservation data with cleaned input:', input);
    
    // Page1 ID 기준으로 페이지2 저장 처리
    try {
      // 이미 존재하는 페이지2 데이터가 있으면 업데이트, 없으면 생성
      if (formData.id) {
        console.log('[EditLayout] Updating existing Page2 record with ID:', formData.id);
        updatePage2({
          variables: {
            id: parseInt(formData.id),
            input: input
          }
        });
      } else {
        console.log('[EditLayout] Creating new Page2 record');
        createPage2({
          variables: {
            input: input
          }
        });
      }
    } catch (error) {
      console.error('[EditLayout] Error in save operation:', error);
      Swal.fire({
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
        icon: 'error',
        confirmButtonText: '확인'
      });
      setIsLoading(false);
    }
  };
  
  // Handle delete reservation
  const handleDeleteReservation = () => {
    if (!formData.id) {
      showAlert('삭제할 데이터가 없습니다.', 'warning');
      return;
    }
    
    // Confirm deletion
    Swal.fire({
      title: '정말 삭제하시겠습니까?',
      text: '이 작업은 되돌릴 수 없습니다!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: '예, 삭제합니다',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('[EditLayout] Deleting Page2 data:', formData.id);
        deletePage2({
          variables: { id: parseInt(formData.id) }
        });
      }
    });
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  // Navigate back to list
  const handleBack = () => {
    navigate('/new/page2');
  };

  // Handle page1 data save callback
  const handlePage1DataSave = (updatedData) => {
    console.log('[EditLayout] Page1 data saved:', updatedData);
    
    // Sanitize the data before using it
    const sanitizedData = sanitizePage1DataForSubmit(updatedData);
    
    if (sanitizedData && sanitizedData.id) {
      setFormData(prev => ({
        ...prev,
        page1_id: sanitizedData.id,
        group_name: sanitizedData.group_name,
        customer_name: sanitizedData.customer_name,
        start_date: sanitizedData.start_date,
        end_date: sanitizedData.end_date
      }));
      
      // Refetch page2 data using the updated page1_id
      if (sanitizedData.id) {
        refetchPage2();
      }
      
      showAlert('예약 정보가 업데이트되었습니다.', 'success');
    }
  };

  // Rendering conditional for Page1InfoCard
  const renderPage1InfoCard = () => {
    if (hideReservationInfo) return null;
    
    return (
      <Page1InfoCard 
        data={page1Data?.getPage1ById || {}} 
        loading={page1Loading}
        onSave={handlePage1DataSave}
        isEmbedded={isEmbedded}
      />
    );
  };

  return (
    <MainCard 
      title={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h3" component="div">
            {isEmbedded ? '상세정보' : '예약 상세정보'}
          </Typography>
          {isLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Box>
      }
    >
      <Grid container spacing={2}>
        {/* Main form with participant and program data */}
        <Grid item xs={12}>
          {/* Reservation Info Card */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            {renderPage1InfoCard()}
          </Paper>
          
          {/* Participant Form */}
          <ParticipantForm 
            formData={formData} 
            handleFieldChange={handleFieldChange} 
          />
          
          {/* Age Group Form */}
          <AgeGroupForm 
            formData={formData} 
            handleFieldChange={handleFieldChange} 
          />
          
          {/* Business Category Form */}
          <BusinessCategoryForm 
            formData={formData} 
            handleFieldChange={handleFieldChange} 
          />
          
          {/* Save Button Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveReservation}
                  disabled={isLoading}
                  sx={{ minWidth: 200 }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                      저장 중...
                    </>
                  ) : (
                    '참여자 및 관련 정보 저장하기'
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Program List */}
          <ProgramList
            programs={programs}
            handleEditProgram={handleEditProgram}
            handleDeleteProgram={handleDeleteProgram}
            programListKey={programListKey}
            disabled={isLoading}
          />
          
          <Divider sx={{ mt: 3, mb: 3 }} />
          
          {/* Program Form */}
          <ProgramForm
            programForm={programForm}
            handleProgramFormChange={handleProgramFormChange}
            addProgram={editingProgramId ? 
              (id, data) => handleUpdateProgram(id, data) : 
              (data) => handleAddProgram(data)
            }
            resetProgramForm={handleResetProgramForm}
            editingProgram={Boolean(editingProgramId)}
            categories={categories}
            programs={menuPrograms}
            locations={locations}
            instructors={instructors}
            assistants={assistants}
            helpers={helpers}
            getCategoryName={getCategoryName}
            getProgramName={getProgramName}
            getLocationName={getLocationName}
            getInstructorName={getInstructorName}
            getAssistantName={getAssistantName}
            getHelperName={getHelperName}
            reservation_status={page1Data?.getPage1ById?.reservation_status || ''}
            disabled={isLoading}
          />
        </Grid>
      </Grid>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default EditLayout; 