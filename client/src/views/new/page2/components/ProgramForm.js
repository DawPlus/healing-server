import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  TextField,
  Box,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  useTheme,
  Button,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { add, format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Icons
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ScheduleIcon from '@mui/icons-material/Schedule';

const ProgramForm = ({ 
  formData, 
  programForm = {}, // 기본값 빈 객체로 설정
  handleFieldChange, 
  handleProgramFormChange, 
  reservation_status, 
  addProgram, 
  editingProgram, 
  resetProgramForm,
  categories = [],
  programs = [],
  locations = [],
  instructors = [],
  assistants = [],
  helpers = [],
  getCategoryName,
  getProgramName,
  getLocationName,
  getInstructorName,
  getAssistantName,
  getHelperName,
  disabled
}) => {
  const theme = useTheme();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [duration, setDuration] = useState(2); // Default 2 hours
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [dropdownWarnings, setDropdownWarnings] = useState({
    categories: false,
    programs: false,
    locations: false
  });

  // Debug empty dropdown data
  useEffect(() => {
    const checkDropdownData = () => {
      const warnings = {
        categories: !Array.isArray(categories) || categories.length === 0,
        programs: !Array.isArray(programs) || programs.length === 0,
        locations: !Array.isArray(locations) || locations.length === 0
      };

      console.log('[ProgramForm] Dropdown data status:');
      console.log(`- Categories: ${categories?.length || 0} items${warnings.categories ? ' (EMPTY)' : ''}`);
      console.log(`- Programs: ${programs?.length || 0} items${warnings.programs ? ' (EMPTY)' : ''}`);
      console.log(`- Locations: ${locations?.length || 0} items${warnings.locations ? ' (EMPTY)' : ''}`);
      console.log(`- Instructors: ${instructors?.length || 0} items`);

      setDropdownWarnings(warnings);
    };

    checkDropdownData();
  }, [categories, programs, locations, instructors]);

  // Update available programs when category changes
  useEffect(() => {
    // Categories filtering logic
    if (programForm?.category && Array.isArray(programs) && programs.length > 0) {
      const categoryId = parseInt(programForm.category, 10);
      console.log(`[ProgramForm] 프로그램 필터링: 카테고리 ID ${categoryId}로 ${programs.length}개 중 필터링`);
      
        // Find programs with matching category_id
        const filtered = programs.filter(program => {
        const progCategoryId = typeof program.category_id === 'string' 
          ? parseInt(program.category_id, 10)
          : program.category_id;
        
        const categoryMatch = 
          progCategoryId === categoryId || 
          (program.category && (
            typeof program.category.id === 'string' 
              ? parseInt(program.category.id, 10) === categoryId
              : program.category.id === categoryId
          ));
        
        return categoryMatch;
        });
        
        console.log(`[ProgramForm] 필터링 결과: ${filtered.length}개 프로그램 발견`);
      
      // Only update state if the filtered programs are different
      if (JSON.stringify(filtered.map(p => p.id)) !== JSON.stringify(filteredPrograms.map(p => p.id))) {
        setFilteredPrograms(filtered);
      }
    } else if (programForm?.category) {
      // 카테고리는 선택되었지만 프로그램 데이터가 없는 경우
        console.warn('[ProgramForm] 프로그램 목록이 비어있거나 유효하지 않습니다.');
      if (filteredPrograms.length > 0) {
        setFilteredPrograms([]);
      }
    } else {
      // 카테고리가 선택되지 않은 경우
      if (filteredPrograms.length > 0) {
      setFilteredPrograms([]);
      }
    }
  }, [programForm?.category, programs, filteredPrograms]);

  // Set filtered locations - only program type
  useEffect(() => {
    // Locations filtering logic
    if (Array.isArray(locations) && locations.length > 0) {
      console.log(`[ProgramForm] 장소 필터링: 총 ${locations.length}개 장소 중 '프로그램' 카테고리 필터링`);
      
      // 프로그램 카테고리의 장소만 필터링
      const programLocations = locations.filter(loc => {
        // 카테고리 객체가 있는 경우
        if (loc.category) {
          return loc.category.category_name === '프로그램';
        }
        // 카테고리 ID가 2번인 경우 (일반적으로 프로그램 카테고리)
        else if (loc.category_id) {
          return loc.category_id === 2 || loc.category_id === '2';
        }
        return false;
      });
      
      console.log(`[ProgramForm] 필터링 결과: ${programLocations.length}개 장소 발견`);
      
      // Only update state if filtered locations are different
      const currentIds = filteredLocations.map(loc => loc.id).sort().join(',');
      const newIds = programLocations.map(loc => loc.id).sort().join(',');
      
      // 프로그램 장소가 있다면 사용, 없다면 모든 장소 사용 (폴백)
      if (programLocations.length > 0 && currentIds !== newIds) {
        setFilteredLocations(programLocations);
      } else if (programLocations.length === 0 && currentIds !== locations.map(loc => loc.id).sort().join(',')) {
        console.log('[ProgramForm] 프로그램 장소가 없어 모든 장소를 표시합니다');
        setFilteredLocations(locations);
      }
    } else if (filteredLocations.length > 0) {
      console.warn('[ProgramForm] 장소 목록이 비어있거나 유효하지 않습니다.');
      setFilteredLocations([]);
    }
  }, [locations, filteredLocations]);

  // Handle initial loading of time data from existing program
  useEffect(() => {
    // Only run once when editing an existing program
    if (editingProgram && programForm?.start_time && !startTime) {
      try {
        // Create a date object for today with the time values from the program
        const today = new Date();
        const [startHours, startMinutes] = programForm.start_time.split(':').map(num => parseInt(num, 10));
        
        // Set the hours and minutes
        today.setHours(startHours, startMinutes, 0, 0);
        
        // Update the startTime state without triggering the form update
        setStartTime(today);
        
        // If we have an end_time, set that too
        if (programForm?.end_time) {
          const [endHours, endMinutes] = programForm.end_time.split(':').map(num => parseInt(num, 10));
          const endTimeDate = new Date();
          endTimeDate.setHours(endHours, endMinutes, 0, 0);
          setEndTime(endTimeDate);
          
          // Set duration from the programForm if available, or calculate it
          if (programForm?.duration) {
            const durationValue = parseFloat(programForm.duration);
            setDuration(durationValue);
          } else {
            // Calculate approximate duration
            let durationHours = endHours - startHours;
            let durationMinutes = endMinutes - startMinutes;
            
            if (durationMinutes < 0) {
              durationHours -= 1;
              durationMinutes += 60;
            }
            
            // duration 값을 결정 - 허용된 옵션 중 선택
            let normalizedDuration;
            const totalMinutes = durationHours * 60 + durationMinutes;
            
            if (totalMinutes <= 75) { // 1시간 15분 이하
              normalizedDuration = 1;
            } else if (totalMinutes <= 135) { // 2시간 15분 이하
              normalizedDuration = 1.5;
            } else if (totalMinutes <= 150) { // 2시간 30분 이하
              normalizedDuration = 2;  
            } else {
              normalizedDuration = 3;
            }
            
            setDuration(normalizedDuration);
            handleProgramFormChange('duration', normalizedDuration.toString());
          }
        }
      } catch (error) {
        console.error('[ProgramForm] Error loading program time data:', error);
      }
    }
  }, [editingProgram, programForm?.start_time, programForm?.end_time, programForm?.duration]);

  // Add a separate effect to handle programForm changes to ensure time fields are updated
  useEffect(() => {
    if (editingProgram && programForm?.start_time) {
      try {
        console.log('[ProgramForm] Updating time fields based on programForm change:', programForm);
        // Create a date object for today with the time values from the program
        const today = new Date();
        const [startHours, startMinutes] = programForm.start_time.split(':').map(num => parseInt(num, 10));
        
        // Set the hours and minutes
        today.setHours(startHours, startMinutes, 0, 0);
        
        // Update the startTime state
        setStartTime(today);
        
        // If we have an end_time, set that too
        if (programForm?.end_time) {
          const [endHours, endMinutes] = programForm.end_time.split(':').map(num => parseInt(num, 10));
          const endTimeDate = new Date();
          endTimeDate.setHours(endHours, endMinutes, 0, 0);
          setEndTime(endTimeDate);
        }
      } catch (error) {
        console.error('[ProgramForm] Error updating time fields:', error);
      }
    }
  }, [editingProgram, programForm?.id]);

  // Set duration when component mounts
  useEffect(() => {
    // Only set default duration once on mount if not already set
    if (!programForm.duration && !duration && handleProgramFormChange) {
      console.log('[ProgramForm] Setting default duration: 2 hours');
      handleProgramFormChange('duration', '2');
      setDuration(2);
    }
  }, []); 
  
  // 기존 duration 값을 4가지 옵션 중 하나로 매핑
  useEffect(() => {
    if (programForm.duration) {
      const durationValue = parseFloat(programForm.duration);
      
      console.log('[ProgramForm] Normalizing duration value:', durationValue);
      
      // 현재 선택된 값이 이미 허용된 옵션인지 확인
      if ([1, 1.5, 2, 3].includes(durationValue)) {
        setDuration(durationValue);
        return;
      }
      
      // 가장 가까운 허용된 옵션으로 맵핑
      let normalizedDuration;
      
      if (durationValue <= 1.25) {
        normalizedDuration = '1';
      } else if (durationValue <= 1.75) {
        normalizedDuration = '1.5';
      } else if (durationValue <= 2.5) {
        normalizedDuration = '2';
      } else {
        normalizedDuration = '3';
      }
      
      console.log(`[ProgramForm] Normalized duration from ${durationValue} to ${normalizedDuration}`);
      
      // 폼 상태 업데이트
      handleProgramFormChange('duration', normalizedDuration);
      setDuration(parseFloat(normalizedDuration));
      
      // 종료 시간도 업데이트
      if (startTime) {
        let newEndTime;
        if (normalizedDuration === '1.5') {
          newEndTime = add(startTime, { hours: 1, minutes: 30 });
        } else {
          newEndTime = add(startTime, { hours: parseFloat(normalizedDuration) });
        }
        setEndTime(newEndTime);
        handleProgramFormChange('end_time', format(newEndTime, 'HH:mm'));
      }
    }
  }, [programForm.id, programForm.duration]);

  const handleStartTimeChange = (newTime) => {
    if (!newTime) return;
    
    setStartTime(newTime);
    
    // Update form with the new time value using 24-hour format
    const timeString = format(newTime, 'HH:mm');
    handleProgramFormChange('start_time', timeString);
    
    // Calculate and update end time based on current duration
    let endTimeValue;
    
    // 1.5시간(1시간 30분)인 경우 특별 처리
    if (duration === 1.5) {
      endTimeValue = add(newTime, { hours: 1, minutes: 30 });
    } else {
      endTimeValue = add(newTime, { hours: duration });
    }
    
    setEndTime(endTimeValue);
    handleProgramFormChange('end_time', format(endTimeValue, 'HH:mm'));
  };
  
  const handleDurationChange = (e) => {
    const durationValue = e.target.value;
    const durationFloat = parseFloat(durationValue);
    
    // Update local state
    setDuration(durationFloat);
    
    // Update form value
    handleProgramFormChange('duration', durationValue);
    
    // Update end time if start time is set
    if (startTime) {
      let newEndTime;
      
      // 1.5시간(1시간 30분)인 경우 특별 처리
      if (durationFloat === 1.5) {
        newEndTime = add(startTime, { hours: 1, minutes: 30 });
      } else {
        newEndTime = add(startTime, { hours: durationFloat });
      }
      
      setEndTime(newEndTime);
      handleProgramFormChange('end_time', format(newEndTime, 'HH:mm'));
    }
  };
  
  // Check if form is valid
  const isFormValid = () => {
    // Required fields
    const requiredFields = ['category', 'program', 'date', 'start_time', 'place'];
    
    // Only add instructor as required if reservation status is explicitly "confirmed"
    // This prevents the issue when reservation_status is undefined
    if (reservation_status === 'confirmed') {
      requiredFields.push('instructor');
    }
    
    // For debugging
    console.log('[ProgramForm] Form validation - required fields:', requiredFields);
    console.log('[ProgramForm] Form validation - current values:', requiredFields.map(f => ({ 
      field: f, 
      value: programForm?.[f],
      valid: !!programForm?.[f]
    })));

    // Check required fields
    for (const field of requiredFields) {
      if (!programForm[field]) {
        console.log(`[ProgramForm] Form validation failed: ${field} is missing`);
        return false;
      }
    }
    
    console.log('[ProgramForm] Form validation passed');
    return true;
  };

  // Handle add/edit program button click
  const handleProgramAction = () => {
    if (isFormValid()) {
      console.log('[ProgramForm] Handling program action:', {
        isEditing: editingProgram,
        programData: programForm,
        programId: programForm.id,
        requiredFields: ['category', 'program', 'date', 'start_time', 'place'].map(f => ({ 
          field: f, 
          value: programForm?.[f],
          valid: !!programForm?.[f]
        }))
      });
      
      // 수정할 때 programForm의 모든 필드가 명확히 전달되도록 깊은 복사 사용
      const programDataCopy = JSON.parse(JSON.stringify(programForm || {}));
      
      // Always set multi-related fields to false/null
      programDataCopy.is_multi = false;
      programDataCopy.multi1_name = null;
      programDataCopy.multi2_name = null;
      
      if (editingProgram) {
        console.log('[ProgramForm] 프로그램 수정 모드 - 기존 프로그램을 업데이트합니다');
        // 수정 시 프로그램 ID 확인
        if (!programForm.id) {
          console.error('[ProgramForm] 프로그램 ID가 없어 업데이트할 수 없습니다');
          alert('프로그램 ID가 없어 업데이트할 수 없습니다. 다시 시도해주세요.');
          return;
        }
        // When editing, pass the ID and the program data
        addProgram(programForm.id, programDataCopy);
      } else {
        console.log('[ProgramForm] 프로그램 추가 모드 - 새 프로그램을 추가합니다');
        // When adding, just pass the program data
        addProgram(programDataCopy);
      }
    } else {
      console.warn('[ProgramForm] Form validation failed');
      
      // 어떤 필드가 누락되었는지 보여주기
      const requiredFields = ['category', 'program', 'date', 'start_time', 'place'];
      if (reservation_status === 'confirmed') {
        requiredFields.push('instructor');
      }
      
      const missingFields = requiredFields.filter(field => !programForm?.[field]);
      console.warn('[ProgramForm] Missing required fields:', missingFields);
    }
  };

  // 디버깅 모드 플래그
  const isDebugMode = false;

  // Render dropdown with empty state handling and better display text
  const renderDropdown = (id, label, value, onChange, options, fieldName, required = false) => {
    const isWarning = dropdownWarnings[fieldName];
    
    // Get the item name display function based on fieldName
    const getItemDisplayText = (option) => {
      if (fieldName === 'categories' && option.category_name) {
        return option.category_name;
      } else if (fieldName === 'programs' && option.program_name) {
        return option.program_name;
      } else if (fieldName === 'locations' && option.location_name) {
        return option.location_name;
      } else if ((fieldName === 'instructors' || fieldName === 'assistants' || fieldName === 'helpers') && option.name) {
        return option.name;
      } else {
        // Fallback for unexpected structure
        return option.name || option.title || option.label || option.text || option.id?.toString() || '항목';
      }
    };

    // Debug log the available options and current value
    if (isDebugMode) {
    console.log(`[ProgramForm] Rendering dropdown for ${fieldName}:`, {
      currentValue: value,
      currentValueType: typeof value,
      availableOptions: options.map(opt => ({ id: opt.id, idType: typeof opt.id }))
    });
    }
    
    return (
      <FormControl fullWidth required={required} error={isWarning}>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`${id}-label`}
          id={id}
          value={value || ''}
          label={label}
          onChange={onChange}
          disabled={options.length === 0}
        >
          {options.length > 0 ? (
            options.map((option) => {
              // Always convert ID to string for comparison
              const optionId = option.id?.toString() || '';
              return (
                <MenuItem key={optionId} value={optionId}>
                  {getItemDisplayText(option)}
                </MenuItem>
              );
            })
          ) : (
            <MenuItem disabled value="">
              데이터 없음
            </MenuItem>
          )}
        </Select>
        {isWarning && <FormHelperText>데이터를 불러올 수 없습니다. 세션이 만료되었거나 네트워크 오류가 발생했습니다.</FormHelperText>}
      </FormControl>
    );
  };

  // 드롭다운 메뉴에서 표시될 항목 텍스트를 결정하는 함수
  const getItemDisplayText = (option) => {
    // 옵션이 없는 경우
    if (!option) return '';
    
    // 카테고리 옵션인 경우
    if (option.category_name) {
      return option.category_name;
    }
    
    // 프로그램 옵션인 경우
    if (option.program_name) {
      return option.program_name;
    }
    
    // 장소 옵션인 경우
    if (option.location_name) {
      return option.location_name;
    }
    
    // 강사/보조강사/헬퍼 옵션인 경우
    if (option.name) {
      // specialty가 있으면 이름과 함께 표시
      return option.specialty 
        ? `${option.name} (${option.specialty})` 
        : option.name;
    }
    
    // 기타 모든 경우
    return option.id ? option.id.toString() : '';
  };
  
  // 카테고리 드롭다운 렌더링
  const renderCategoryDropdown = () => {
  return (
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel>카테고리</InputLabel>
        <Select
          value={programForm.category ? programForm.category.toString() : ''}
          onChange={(e) => handleProgramFormChange('category', e.target.value)}
          label="카테고리"
        >
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id.toString()}>
              {cat.category_name}
            </MenuItem>
          ))}
        </Select>
        {dropdownWarnings.categories && (
          <FormHelperText error>카테고리 데이터가 없습니다. 메뉴 데이터를 로드하세요.</FormHelperText>
        )}
      </FormControl>
    );
  };
  
  // 프로그램 드롭다운 렌더링
  const renderProgramDropdown = () => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }} required disabled={!programForm.category}>
        <InputLabel>프로그램</InputLabel>
        <Select
          value={programForm.program ? programForm.program.toString() : ''}
          onChange={(e) => handleProgramFormChange('program', e.target.value)}
          label="프로그램"
        >
          {filteredPrograms.map((prog) => (
            <MenuItem key={prog.id} value={prog.id.toString()}>
              {prog.program_name}
            </MenuItem>
          ))}
        </Select>
        {programForm.category && filteredPrograms.length === 0 && (
          <FormHelperText error>
            선택한 카테고리에 프로그램이 없습니다.
          </FormHelperText>
        )}
      </FormControl>
    );
  };
  
  // 장소 드롭다운 렌더링
  const renderLocationDropdown = () => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel>장소</InputLabel>
        <Select
          value={programForm.place ? programForm.place.toString() : ''}
          onChange={(e) => handleProgramFormChange('place', e.target.value)}
          label="장소"
        >
          {filteredLocations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id.toString()}>
              {loc.location_name} {loc.capacity ? `(정원 ${loc.capacity}명)` : ''}
            </MenuItem>
          ))}
        </Select>
        {dropdownWarnings.locations && (
          <FormHelperText error>장소 데이터가 없습니다. 메뉴 데이터를 로드하세요.</FormHelperText>
        )}
      </FormControl>
    );
  };
  
  // 강사 드롭다운 렌더링
  const renderInstructorDropdown = () => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>강사</InputLabel>
        <Select
          value={programForm.instructor ? programForm.instructor.toString() : ''}
          onChange={(e) => handleProgramFormChange('instructor', e.target.value)}
          label="강사"
        >
          <MenuItem value="">없음</MenuItem>
          {instructors.map((instructor) => (
            <MenuItem key={instructor.id} value={instructor.id.toString()}>
              {instructor.name} {instructor.specialty ? `(${instructor.specialty})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
  
  // 보조강사 드롭다운 렌더링
  const renderAssistantDropdown = () => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>보조강사</InputLabel>
        <Select
          value={programForm.assistant ? programForm.assistant.toString() : ''}
          onChange={(e) => handleProgramFormChange('assistant', e.target.value)}
          label="보조강사"
        >
          <MenuItem value="">없음</MenuItem>
          {assistants.map((assistant) => (
            <MenuItem key={assistant.id} value={assistant.id.toString()}>
              {assistant.name} {assistant.specialty ? `(${assistant.specialty})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
  
  // 헬퍼 드롭다운 렌더링
  const renderHelperDropdown = () => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>헬퍼</InputLabel>
        <Select
          value={programForm.helper ? programForm.helper.toString() : ''}
          onChange={(e) => handleProgramFormChange('helper', e.target.value)}
          label="헬퍼"
        >
          <MenuItem value="">없음</MenuItem>
          {helpers.map((helper) => (
            <MenuItem key={helper.id} value={helper.id.toString()}>
              {helper.name} {helper.specialty ? `(${helper.specialty})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  // Listen for form reset events
  useEffect(() => {
    const handleResetForm = () => {
      console.log('[ProgramForm] Form reset triggered');
      
      // 빈 날짜 객체 참조 문제 방지
      setStartTime(null);
      setEndTime(null);
      
      // Reset duration
      setDuration(2);
      
      // 전체 폼 초기화 - 각 필드를 기본값으로
      const initialFormState = {
        category: '',
        program: '',
        date: null,
        start_time: '',
        end_time: '',
        duration: '2', // 기본값 2시간
        place: '',
        instructor: '',
        assistant: '',
        helper: '',
        notes: '',
        participants: 0,
        price: 0,
        is_multi: false,
        multi1_name: null,
        multi2_name: null
      };
      
      // Force reset of each individual field
      Object.entries(initialFormState).forEach(([field, value]) => {
        // Skip direct update for date field as it needs special handling
        if (field !== 'date') {
          handleProgramFormChange(field, value);
        }
      });
      
      // Delay needed to allow React to process state updates
      setTimeout(() => {
        console.log('[ProgramForm] Form reset completed');
        
        // Force form validation to run again with empty values
        isFormValid();
      }, 100);
    };
    
    // Add event listener
    window.addEventListener('reset-program-form', handleResetForm);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('reset-program-form', handleResetForm);
    };
  }, [handleProgramFormChange, isFormValid]);
  
  // Check for ID when in edit mode
  useEffect(() => {
    if (editingProgram && !programForm.id) {
      console.error('[ProgramForm] Warning: Editing mode enabled but program ID is missing', programForm);
    }
    
    if (editingProgram && programForm.id) {
      console.log('[ProgramForm] Editing program with ID:', programForm.id);
    }
  }, [editingProgram, programForm.id]);

  return (
    <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <EventNoteIcon sx={{ mr: 1 }} color="primary" />
        {editingProgram ? '프로그램 수정' : '프로그램 추가'}
      </Typography>
      
      <Grid container spacing={2}>
        {/* 첫 번째 행: 5개 필드 */}
        <Grid item xs={12} sm={6} md={2.4}>
          {renderCategoryDropdown()}
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          {renderProgramDropdown()}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <DatePicker
              key={`date-picker-${programForm.id || 'new'}-${programForm.date || 'empty'}`}
              label="날짜"
              value={programForm.date ? new Date(programForm.date) : null}
              onChange={(newDate) => handleProgramFormChange('date', newDate)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  required
                  error={!programForm.date && programForm.touched?.date}
                  helperText={!programForm.date && programForm.touched?.date ? '날짜를 선택하세요' : ''}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <TimePicker
              key={`time-picker-${programForm.id || 'new'}-${programForm.start_time || 'empty'}`}
              label="시작 시간"
              value={startTime}
              onChange={handleStartTimeChange}
              ampm={false} 
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  required
                  error={!programForm.start_time && programForm.touched?.start_time}
                  helperText={!programForm.start_time && programForm.touched?.start_time ? '시작 시간을 선택하세요' : ''}
                  InputProps={{
                    startAdornment: (
                      <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    ),
                    ...params.InputProps
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>진행 시간</InputLabel>
            <Select
              value={programForm.duration || '2'}
              onChange={handleDurationChange}
              label="진행 시간"
            >
              <MenuItem value="1">1시간</MenuItem>
              <MenuItem value="1.5">1시간 30분</MenuItem>
              <MenuItem value="2">2시간</MenuItem>
              <MenuItem value="3">3시간</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Price field */}
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            label="가격"
            type="number"
            value={programForm.price || ''}
            onChange={(e) => handleProgramFormChange('price', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <Typography sx={{ color: 'text.secondary', mr: 1 }}>₩</Typography>
              ),
              endAdornment: (
                <Typography sx={{ color: 'text.secondary', ml: 1 }}>원</Typography>
              ),
            }}
          />
        </Grid>
        
        {/* 두 번째 행: 4개 필드 */}
        <Grid item xs={12} sm={6} md={3}>
          {renderLocationDropdown()}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderInstructorDropdown()}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderAssistantDropdown()}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderHelperDropdown()}
        </Grid>
        
        {/* 세 번째 행: 추가 필드 및 버튼 */}
        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            label="참가 인원"
            type="number"
            name="participants"
            InputProps={{ inputProps: { min: 0 } }}
            value={programForm.participants || ''}
            onChange={(e) => handleProgramFormChange('participants', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            label="비고"
            name="notes"
            value={programForm.notes || ''}
            onChange={(e) => handleProgramFormChange('notes', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>
        
        {/* 버튼 행 */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={resetProgramForm}
            sx={{ mr: 1 }}
            startIcon={<RestartAltIcon />}
          >
            초기화
          </Button>
          <Button
            variant="contained"
            onClick={handleProgramAction}
            disabled={!isFormValid()}
          >
            {editingProgram ? '수정하기' : '추가하기'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProgramForm; 