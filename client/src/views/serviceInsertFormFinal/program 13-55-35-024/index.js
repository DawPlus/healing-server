import React, { useState, useEffect, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import MainCard from 'ui-component/cards/MainCard';
import Swal from "sweetalert2";
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_PROGRAM_FORM, UPDATE_PROGRAM_FORM, GET_PROGRAM_FORMS, DELETE_PROGRAM_FORM } from "../../../graphql/serviceForm";
import { GET_PROGRAMS_BY_CATEGORY, GET_PROGRAM_CATEGORIES, GET_INSTRUCTORS, GET_RESERVATIONS, GET_LOCATIONS } from "../../../graphql/menu";
import { v4 as uuidv4 } from 'uuid';
import useDownloadExcel from "utils/useDownloadExcel";
import { generateMergeInfo } from "utils/utils";
import { validateSearchInfo, formatDate, parseAgencyInfo } from '../../../utils/formUtils';
import { Grid } from '@mui/material';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import InsertForm, { headerInfo } from "./insertForm";
import { useDispatch } from 'react-redux';
import { useStore } from 'react-redux';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress, Button } from '@mui/material';
import InsertFormAdapter from "../component/InsertFormAdapter";
import SearchInfo from "./searchInfo";

// Wrap InsertForm with the adapter
const EnhancedInsertForm = InsertFormAdapter(InsertForm);

// Initial row data structure
const initRowData = {
  idx: "",
  id: "",
  chk: false,
  program_seq: null,
  sex: "미기재",
  age: "",
  residence: "미기재",
  job: "미기재",
  type: "참가자",
  score1: "",
  score2: "",
  score3: "",
  score4: "",
  score5: "",
  score6: "",
  score7: "",
  score8: "",
  score9: "",
  score10: "",
  score11: "",
  score12: "",
  expectation: "",
  improvement: ""
};

// Field configurations for the table - moved to insertForm.js

// Header configuration for table display - moved to insertForm.js

// 기관 목록 조회 쿼리
const GET_ORGANIZATION_LIST = gql`
  query GetPage1List {
    getPage1List {
      id
      group_name
      start_date
      end_date
    }
  }
`;

const Program = forwardRef((props, ref) => {
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore();
  
  // State for form data
  const [rows, setRows] = useState([{ ...initRowData, idx: uuidv4(), type: "참가자" }]);
  const [searchInfo, setSearchInfo] = useState({
    agency: "",
    agency_id: "",
    openday: "",
    eval_date: "",
    ptcprogram: "",
    program_name: "",
    program_id: "",
    program_category_id: "",
    teacher_id: "",
    location_name: "",
    place: "",
    bunya: ""
  });
  const [deleteRows, setDeleteRows] = useState([]);
  
  // 외부 searchInfo props를 받아서 내부 상태 업데이트
  useEffect(() => {
    if (props.searchInfo) {
      console.log('[Program] 외부 searchInfo props 수신됨:', props.searchInfo);
      setSearchInfo(prev => ({
        ...prev,
        agency: props.searchInfo.agency || prev.agency,
        agency_id: props.searchInfo.agency_id || prev.agency_id,
        openday: props.searchInfo.openday || prev.openday,
        eval_date: props.searchInfo.eval_date || prev.eval_date,
        ptcprogram: props.searchInfo.ptcprogram || prev.ptcprogram
      }));
    }
  }, [props.searchInfo]);
  
  // State for dropdown data
  const [reservations, setReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Excel download preparation
  const excelData = useMemo(() => {
    return rows.map((i, idx) => ({
      '순서': idx + 1,
      '성별': i.sex,
      '연령': i.age,
      '거주지': i.residence,
      '직업': i.job,
      '참여구분': i.type,
      '강사는 전문성을 가지고 프로그램을 제공했다': i.score1,
      '프로그램은 체계적이고 알찼다': i.score4,
      '기회가 된다면 이 프로그램에 다시 참여할 것이다': i.score7
    }));
  }, [rows]);
  
  const excelConfig = useMemo(() => ({
    headerInfo,
    mergeInfo: generateMergeInfo(headerInfo),
    sheetName: "프로그램 만족도",
    fileType: "xlsx",
    fileName: `프로그램만족도_${searchInfo.agency || 'export'}_${searchInfo.eval_date || new Date().toISOString().slice(0, 10)}`,
    data: excelData
  }), [headerInfo, excelData, searchInfo.agency, searchInfo.eval_date]);
  
  // 최상위 레벨에서 엑셀 다운로드 함수 가져오기
  const downloadExcel = useDownloadExcel(excelConfig);
  
  // GraphQL queries
  const { refetch } = useQuery(GET_PROGRAM_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      program_id: searchInfo.program_id ? parseInt(searchInfo.program_id, 10) : null,
      program_category_id: searchInfo.program_category_id ? parseInt(searchInfo.program_category_id, 10) : null,
      teacher_id: searchInfo.teacher_id ? parseInt(searchInfo.teacher_id, 10) : null,
      place: searchInfo.place || null
    },
    skip: true,
    onCompleted: (data) => {
      if (data && data.getProgramForms && data.getProgramForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        
        // Transform forms to rows format
        const formRows = data.getProgramForms.map(form => ({
          idx: uuidv4(),
          id: form.id || "",
          chk: false,
          program_seq: form.program_seq ? parseInt(form.program_seq, 10) : null,
          sex: form.sex || "미기재",
          age: form.age || "",
          residence: form.residence || "미기재",
          job: form.job || "",
          type: form.type || "참가자",
          score1: form.score1 || "",
          score2: form.score2 || "",
          score3: form.score3 || "",
          score4: form.score4 || "",
          score5: form.score5 || "",
          score6: form.score6 || "",
          score7: form.score7 || "",
          score8: form.score8 || "",
          score9: form.score9 || "",
          score10: form.score10 || "",
          score11: form.score11 || "",
          score12: form.score12 || "",
          expectation: form.expectation || "",
          improvement: form.improvement || ""
        }));
        
        // Update rows
        setRows(formRows.length > 0 ? formRows : [{ ...initRowData, idx: uuidv4(), type: "참가자" }]);
        
        // Update searchInfo with the most recent form data
        const mostRecentForm = data.getProgramForms[0];
        console.log("[DEBUG] Most recent form from database:", {
          place: mostRecentForm.place,
          program_id: mostRecentForm.program_id,
          program_category_id: mostRecentForm.program_category_id
        });

        setSearchInfo(prev => {
          const newSearchInfo = {
            ...prev,
            agency: mostRecentForm.agency || prev.agency,
            agency_id: mostRecentForm.agency_id || prev.agency_id,
            openday: mostRecentForm.openday || prev.openday,
            eval_date: mostRecentForm.eval_date || prev.eval_date,
            ptcprogram: mostRecentForm.ptcprogram || prev.ptcprogram,
            program_id: mostRecentForm.program_id || prev.program_id,
            program_category_id: mostRecentForm.program_category_id || prev.program_category_id,
            teacher_id: mostRecentForm.teacher_id || prev.teacher_id,
            location_name: mostRecentForm.place || prev.location_name,
            place: mostRecentForm.place || prev.place
          };
          
          console.log("[DEBUG] Updated searchInfo with form data:", {
            place: newSearchInfo.place,
            location_name: newSearchInfo.location_name
          });
          
          return newSearchInfo;
        });
        
        // Show success message with number of loaded forms
        if (formRows.length > 0) {
          Swal.fire({
            icon: 'success',
            title: '데이터 로드 완료',
            text: `${formRows.length}개의 데이터가 로드되었습니다.`
          });
        }
      } else {
        if (searchInfo.agency && searchInfo.openday && searchInfo.eval_date) {
          Swal.fire({ icon: 'warning', title: '확인', text: "기존 입력된 데이터가 없습니다." });
        }
      }
    },
    onError: (error) => {
      console.error("GraphQL 쿼리 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });
  
  // GraphQL mutations
  const [createProgramForm] = useMutation(CREATE_PROGRAM_FORM);
  const [updateProgramForm] = useMutation(UPDATE_PROGRAM_FORM);
  const [deleteProgramForm] = useMutation(DELETE_PROGRAM_FORM, {
    onCompleted: (data) => {
      console.log("프로그램 폼 삭제 성공:", data);
    },
    onError: (error) => {
      console.error("프로그램 폼 삭제 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `삭제 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });
  
  // Fetch agency list
  const { loading: reservationsLoading, error: reservationsError, data: reservationsData } = useQuery(GET_RESERVATIONS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.getPage1List) {
        console.log('기관 목록 로드됨:', data.getPage1List.length);
        setReservations(data.getPage1List);
      }
    },
    onError: (error) => {
      console.error('기관 목록 쿼리 오류:', error);
    }
  });

  // Fetch program categories
  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_PROGRAM_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.getProgramCategories) {
        console.log('카테고리 목록 로드됨:', data.getProgramCategories.length);
        setCategories(data.getProgramCategories);
      }
    },
    onError: (error) => {
      console.error('카테고리 목록 쿼리 오류:', error);
    }
  });

  // Fetch programs by category when category is selected
  const { refetch: refetchPrograms, loading: programsLoading, data: programsData } = useQuery(GET_PROGRAMS_BY_CATEGORY, {
    variables: { categoryId: searchInfo.program_category_id ? parseInt(searchInfo.program_category_id, 10) : 0 },
    skip: !searchInfo.program_category_id,
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.getProgramsByCategory) {
        console.log('프로그램 목록 로드됨:', data.getProgramsByCategory.length);
        setProgramList(data.getProgramsByCategory);
      }
    },
    onError: (error) => {
      console.error('프로그램 목록 쿼리 오류:', error);
    }
  });

  // Fetch instructors
  const { loading: instructorsLoading, error: instructorsError, data: instructorsData } = useQuery(GET_INSTRUCTORS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.getInstructors) {
        console.log('강사 목록 로드됨:', data.getInstructors.length);
        setTeacherList(data.getInstructors);
      }
    },
    onError: (error) => {
      console.error('강사 목록 쿼리 오류:', error);
    }
  });

  // Fetch locations
  const { loading: locationsLoading, error: locationsError, data: locationsData } = useQuery(GET_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.locations) {
        console.log('[DEBUG] 장소 목록 로드됨:', data.locations.length);
        console.log('[DEBUG] 첫 번째 장소 샘플:', data.locations[0]);
        setLocations(data.locations);
      }
    },
    onError: (error) => {
      console.error('장소 목록 쿼리 오류:', error);
    }
  });
  
  // Handle location state for navigation
  useEffect(() => {
    if (!location.state) return;
    
    const { type, name, openday, evalDate, agencyId } = location.state;
    
    if (type === "programInsertForm") {
      setSearchInfo({
        agency: name,
        agency_id: agencyId || "",
        openday: openday,
        eval_date: evalDate,
        ptcprogram: "",
        program_name: "",
        program_id: "",
        program_category_id: "",
        teacher_id: "",
        location_name: "",
        place: "",
        bunya: ""
      });
      
      // Trigger refetch with new parameters
      if (name && openday && evalDate) {
        refetch({
          agency: name,
          openday: openday,
          eval_date: evalDate
        });
      }
    }
    
    return () => {
      // Cleanup
      setRows([{ ...initRowData, idx: uuidv4(), type: "참가자" }]);
      setSearchInfo({
        agency: "",
        agency_id: "",
        openday: "",
        eval_date: "",
        ptcprogram: "",
        program_name: "",
        program_id: "",
        program_category_id: "",
        teacher_id: "",
        location_name: "",
        place: "",
        bunya: ""
      });
    };
  }, [location.state, refetch]);
  
  // Row management functions
  const addRow = useCallback(() => {
    setRows(prev => [...prev, { ...initRowData, idx: uuidv4() }]);
  }, []);
  
  const removeRow = useCallback(() => {
    const checkedRows = rows.filter(row => row.chk);
    
    if (checkedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '선택된 항목이 없습니다',
        text: '삭제할 항목을 선택해주세요.'
      });
      return;
    }
    
    Swal.fire({
      icon: 'question',
      title: '확인',
      text: `${checkedRows.length}개 항목을 삭제하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오'
    }).then((result) => {
      if (result.isConfirmed) {
        // Store rows to be deleted from database (those with IDs)
        const rowsToDelete = checkedRows.filter(row => row.id);
        
        // Remove checked rows from the state
        setRows(prev => prev.filter(row => !row.chk));
        
        // Delete from server if there are saved items
        if (rowsToDelete.length > 0) {
          console.log(`${rowsToDelete.length}개 항목 서버에서 삭제 시작`);
          
          // Track IDs for future deletion
          setDeleteRows(prev => [...prev, ...rowsToDelete.map(r => r.id)]);
          
          // Execute DELETE mutation for each item
          const deletePromises = rowsToDelete.map(row => {
            return deleteProgramForm({
              variables: { id: parseInt(row.id, 10) }
            });
          });
          
          // Handle all deletion promises
          Promise.all(deletePromises)
            .then(results => {
              console.log("서버 삭제 결과:", results);
              Swal.fire({
                icon: 'success',
                title: '삭제 완료',
                text: `${rowsToDelete.length}개 항목이 삭제되었습니다.`,
              });
            })
            .catch(error => {
              console.error("삭제 중 오류 발생:", error);
              Swal.fire({
                icon: 'error',
                title: '오류',
                text: `삭제 중 오류가 발생했습니다: ${error.message}`,
              });
            });
        }
      }
    });
  }, [rows, deleteProgramForm]);
  
  const onCheckChange = useCallback((idx, checked) => {
    setRows(prev => prev.map((row, i) => 
      i === idx ? { ...row, chk: checked } : row
    ));
  }, []);
  
  const changeValue = useCallback((idx, name, value) => {
    setRows(prev => prev.map((row, i) => 
      i === idx ? { ...row, [name]: value } : row
    ));
  }, []);
  
  const setAllData = (type, value) => {
    console.log('[Program] setAllData 호출됨:', { type, value });
    
    // Handle 'all' type for participant data updates
    if (type === 'all') {
      if (Array.isArray(value)) {
        console.log(`[Program] setAllData: 전체 ${value.length}개 행 업데이트`);
        
        // Process rows with required fields
        const processedRows = value.map(row => {
          return {
            ...initRowData,  // Basic structure
            ...row,          // New data
            idx: row.idx || uuidv4()  // Ensure idx exists
          };
        });
        
        setRows(processedRows);
        return;
      }
      return;
    }
    
    // Handle object-style call (backward compatibility)
    if (typeof type === 'object' && type.type === 'all' && Array.isArray(type.value)) {
      setAllData('all', type.value);
      return;
    }
    
    // Original behavior for score updates
    const checkedRows = rows.filter(item => item.chk);
    if (checkedRows.length === 0) {
      Swal.fire({ icon: 'warning', title: '확인', text: '선택된 행이 없습니다.' });
      return;
    }
    
    setRows(rows.map(row => {
      if (row.chk) {
        return { ...row, [type]: value };
      }
      return row;
    }));
  };
  
  const onChangeSearchInfo = (name, value) => {
    try {
      console.log('[Program] onChangeSearchInfo:', name, value);
      
      if (name === undefined || value === undefined) {
        console.warn('[Program] onChangeSearchInfo called with undefined parameters');
        return;
      }
      
      setSearchInfo(prev => ({ ...prev, [name]: value }));
    } catch (err) {
      console.error('[Program] Error in onChangeSearchInfo:', err);
    }
  };
  
  // Excel file import handler
  const onChangeExcel = (value) => {
    if (!value.header || !value.data || value.data.length === 0) {
      console.error("Excel data format is invalid:", value);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '엑셀 파일 형식이 올바르지 않습니다.'
      });
      return;
    }

    console.log("엑셀 헤더:", value.header);
    console.log("첫 번째 데이터 항목:", value.data[0]);

    // Process the Excel data
    try {
      const processedRows = value.data.map((row, idx) => {
        // Create a new row with defaults
        const newRow = {
          ...initRowData,
          idx: uuidv4(),
          chk: false,
          program_seq: idx + 1
        };

        // Map Excel fields to our data structure
        // Support both old and new field names
        if (row['성별']) newRow.sex = row['성별'];
        if (row['연령']) newRow.age = row['연령'];
        if (row['거주지']) newRow.residence = row['거주지'];
        if (row['직업']) newRow.job = row['직업'];
        if (row['참여구분']) newRow.type = row['참여구분'];
        
        // New consolidated field names
        if (row['강사는 전문성을 가지고 프로그램을 제공했다']) {
          newRow.score1 = row['강사는 전문성을 가지고 프로그램을 제공했다'];
        } 
        // Support old field names too
        else if (row['강사(문항1)']) {
          newRow.score1 = row['강사(문항1)'];
        }
        
        if (row['프로그램은 체계적이고 알찼다']) {
          newRow.score4 = row['프로그램은 체계적이고 알찼다'];
        }
        // Support old field names too
        else if (row['구성/품질(문항4)']) {
          newRow.score4 = row['구성/품질(문항4)'];
        }
        
        if (row['기회가 된다면 이 프로그램에 다시 참여할 것이다']) {
          newRow.score7 = row['기회가 된다면 이 프로그램에 다시 참여할 것이다'];
        }
        // Support old field names too
        else if (row['효과성(문항7)']) {
          newRow.score7 = row['효과성(문항7)'];
        }
        
        // Still process these fields for database compatibility, but they won't be displayed in the UI
        if (row['기대했던 점']) newRow.expectation = row['기대했던 점'];
        if (row['개선할 점']) newRow.improvement = row['개선할 점'];

        return newRow;
      });

      // Update state with processed data
      setRows(processedRows);

      Swal.fire({
        icon: 'success',
        title: '엑셀 데이터 가져오기',
        text: `${processedRows.length}개의 항목이 로드되었습니다.`
      });
    } catch (error) {
      console.error("Excel data processing error:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `엑셀 데이터 처리 중 오류가 발생했습니다: ${error.message}`
      });
    }
  };
  
  // Helper function to safely convert any value to a string
  const toSafeString = (value) => {
    if (value === null || value === undefined) return "";
    return String(value);
  };
  
  // Form operations
  const onSave = () => {
    // Validate that we have the required search info
    if (!validateSearchInfo(searchInfo, "프로그램")) {
      return false;
    }

    // Check for required program field
    if (!searchInfo.program_id && !searchInfo.ptcprogram) {
      Swal.fire({
        icon: 'warning',
        title: '필수 정보 누락',
        text: '프로그램을 선택하거나 입력해주세요.'
      });
      return false;
    }

    // Check that we have at least one score for each entry
    const missingScores = rows.some(row => {
      return !row.score1 && !row.score4 && !row.score7;
    });

    if (missingScores) {
      Swal.fire({
        icon: 'warning',
        title: '점수 데이터 필요',
        text: '각 항목은 적어도 하나의 평가 점수가 필요합니다.'
      });
      return false;
    }

    // Ensure place is set from location if needed
    let placeValue = searchInfo.place || "";
    if (searchInfo.location_name && !placeValue && locations && locations.length > 0) {
      const selectedLocation = locations.find(loc => loc.id === searchInfo.location_name);
      if (selectedLocation) {
        placeValue = selectedLocation.location_name;
      }
    }

    try {
      // Prepare data for mutation
      const promises = rows.map(row => {
        // Format the openday as YYYY-MM-DD for consistency
        let formattedOpenday = searchInfo.openday || "";
        try {
          if (formattedOpenday) {
            const openDate = new Date(formattedOpenday);
            formattedOpenday = openDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            console.log(`[Program] Normalized openday from "${searchInfo.openday}" to "${formattedOpenday}"`);
          }
        } catch (e) {
          console.error(`[Program] Error formatting date:`, e);
          // Keep original if there's an error
          formattedOpenday = searchInfo.openday;
        }
      
        const input = {
          agency: searchInfo.agency || "",
          agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
          openday: formattedOpenday, // Use the formatted date
          eval_date: searchInfo.eval_date || "",
          ptcprogram: searchInfo.ptcprogram || "",
          program_id: searchInfo.program_id ? parseInt(searchInfo.program_id, 10) : null,
          program_category_id: searchInfo.program_category_id ? parseInt(searchInfo.program_category_id, 10) : null,
          teacher_id: searchInfo.teacher_id ? parseInt(searchInfo.teacher_id, 10) : null,
          place: placeValue,
          program_seq: row.program_seq ? parseInt(row.program_seq, 10) : null,
          sex: toSafeString(row.sex),
          age: toSafeString(row.age),
          residence: toSafeString(row.residence),
          job: toSafeString(row.job),
          type: toSafeString(row.type),
          // Convert all score fields to strings
          score1: toSafeString(row.score1),
          score2: toSafeString(row.score2),
          score3: toSafeString(row.score3),
          score4: toSafeString(row.score4),
          score5: toSafeString(row.score5),
          score6: toSafeString(row.score6),
          score7: toSafeString(row.score7),
          score8: toSafeString(row.score8),
          score9: toSafeString(row.score9),
          score10: toSafeString(row.score10),
          score11: toSafeString(row.score11),
          score12: toSafeString(row.score12),
          expectation: toSafeString(row.expectation),
          improvement: toSafeString(row.improvement)
        };

        console.log("[Program] Saving row with data:", input);

        // If row has an ID, update it, otherwise create new
        if (row.id && row.id !== "") {
          console.log(`[Program] Attempting to update program form with ID: ${row.id}`);
          return updateProgramForm({
            variables: {
              id: parseInt(row.id, 10),
              input
            }
          }).catch(error => {
            console.error(`[Program] Update failed for ID ${row.id}:`, error);
            // If update fails, try creating instead
            console.log(`[Program] Fallback: Creating new program form instead`);
            return createProgramForm({
              variables: {
                input
              }
            });
          });
        } else {
          console.log(`[Program] Creating new program form (no ID provided)`);
          return createProgramForm({
            variables: {
              input
            }
          });
        }
      });

      // Execute all mutations
      Promise.all(promises)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: '저장 완료',
            text: "데이터가 성공적으로 저장되었습니다.",
          }).then(() => {
            // If we came from another page, navigate back
            if (location.state) {
              navigate("/updateDelete", {
                state: {
                  params: location.state.searchInfo
                }
              });
            } else {
              // Reset form for new entries
              setRows([{ ...initRowData, idx: uuidv4(), type: "참가자" }]);
              setSearchInfo({
                agency: "",
                agency_id: "",
                openday: "",
                eval_date: "",
                ptcprogram: "",
                program_name: "",
                program_id: "",
                program_category_id: "",
                teacher_id: "",
                location_name: "",
                place: "",
                bunya: ""
              });
            }
          });
        })
        .catch(error => {
          console.error("[Program] GraphQL mutation error:", error);
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: `저장 중 오류가 발생했습니다: ${error.message}`,
          });
        });
    } catch (error) {
      console.error("[Program] Save function error:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `예상치 못한 오류가 발생했습니다: ${error.message}`,
      });
    }
  };
  
  const onSearch = () => {
    // Validate minimum search criteria - only require basic info
    if (!searchInfo.agency && !searchInfo.agency_id) {
      Swal.fire({
        icon: 'warning',
        title: '검색 조건 필요',
        text: "검색하려면 적어도 기관명을 입력해 주십시오."
      });
      return;
    }
    
    console.log("[Program] Searching with criteria:", searchInfo);
    
    // Execute GraphQL query with all search parameters
    refetch({
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      program_id: searchInfo.program_id ? parseInt(searchInfo.program_id, 10) : null,
      program_category_id: searchInfo.program_category_id ? parseInt(searchInfo.program_category_id, 10) : null,
      teacher_id: searchInfo.teacher_id ? parseInt(searchInfo.teacher_id, 10) : null,
      place: searchInfo.place || null
    })
    .then(result => {
      console.log("[Program] Search results:", result);
      
      const forms = result.data?.getProgramForms || [];
      
      console.log(`[Program] Server filtered results: ${forms.length} forms`);
      
      if (forms.length === 0) {
        // No results found - clear form but keep search criteria
        setRows([{ ...initRowData, idx: uuidv4(), type: "참가자" }]);
        
        Swal.fire({ 
          icon: 'info', 
          title: '결과 없음', 
          text: "검색 조건에 맞는 데이터가 없습니다." 
        });
      } else {
        // Transform forms to rows format
        const formRows = forms.map(form => ({
          idx: uuidv4(),
          id: form.id || "",
          chk: false,
          program_seq: form.program_seq ? parseInt(form.program_seq, 10) : null,
          sex: form.sex || "미기재",
          age: form.age || "",
          residence: form.residence || "미기재",
          job: form.job || "",
          type: form.type || "참가자",
          score1: form.score1 || "",
          score2: form.score2 || "",
          score3: form.score3 || "",
          score4: form.score4 || "",
          score5: form.score5 || "",
          score6: form.score6 || "",
          score7: form.score7 || "",
          score8: form.score8 || "",
          score9: form.score9 || "",
          score10: form.score10 || "",
          score11: form.score11 || "",
          score12: form.score12 || "",
          expectation: form.expectation || "",
          improvement: form.improvement || ""
        }));
        
        setRows(formRows);
        
        // Update searchInfo with most recent form data if available
        const mostRecentForm = forms[0];
        if (mostRecentForm) {
          setSearchInfo(prev => ({
            ...prev,
            program_id: mostRecentForm.program_id?.toString() || prev.program_id,
            program_category_id: mostRecentForm.program_category_id?.toString() || prev.program_category_id,
            teacher_id: mostRecentForm.teacher_id?.toString() || prev.teacher_id,
            place: mostRecentForm.place || prev.place
          }));
        }
        
        Swal.fire({ 
          icon: 'success', 
          title: '조회 완료', 
          text: `${forms.length}개의 데이터를 불러왔습니다.` 
        });
      }
    })
    .catch(error => {
      console.error("[Program] Search error:", error);
      Swal.fire({
        icon: 'error',
        title: '검색 오류',
        text: `데이터 검색 중 오류가 발생했습니다: ${error.message}`
      });
    });
  };
  
  // Handle reservation selection
  const handleReservationChange = useCallback((event, newValue) => {
    if (newValue) {
      // 선택된 기관 정보 추출
      const agency = newValue.group_name || '';
      const agency_id = newValue.id ? newValue.id.toString() : '';
      const openday = newValue.start_date || '';
      
      setSearchInfo(prev => ({
        ...prev,
        agency,
        agency_id,
        openday,
        eval_date: prev.eval_date || formatDate(new Date()) // 기본 실시일자 설정
      }));
      
      console.log(`기관 선택: ${agency} (ID: ${agency_id}, 시작일: ${openday})`);
    } else {
      // 선택 취소 시 해당 필드 초기화
      setSearchInfo(prev => ({
        ...prev,
        agency: '',
        agency_id: '',
        openday: ''
      }));
    }
  }, []);
  
  // Find the current selected reservation
  const selectedReservation = useMemo(() => {
    if (!reservations || reservations.length === 0) return null;
    
    // ID로 먼저 찾기 시도
    if (searchInfo.agency_id) {
      const byId = reservations.find(r => r.id === parseInt(searchInfo.agency_id, 10));
      if (byId) return byId;
    }
    
    // 기관명으로 찾기 시도
    if (searchInfo.agency) {
      const byName = reservations.find(r => r.group_name === searchInfo.agency);
      if (byName) return byName;
    }
    
    return null;
  }, [reservations, searchInfo.agency, searchInfo.agency_id]);
  
  // Find the selected program category
  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === parseInt(searchInfo.program_category_id, 10));
  }, [categories, searchInfo.program_category_id]);
  
  // Find the selected program
  const selectedProgram = useMemo(() => {
    return programList.find(p => p.id === parseInt(searchInfo.program_id, 10));
  }, [programList, searchInfo.program_id]);
  
  // Find the selected teacher
  const selectedTeacher = useMemo(() => {
    return teacherList.find(t => t.id === parseInt(searchInfo.teacher_id, 10));
  }, [teacherList, searchInfo.teacher_id]);
  
  // 카테고리 선택 시 프로그램 목록 다시 로드
  useEffect(() => {
    if (searchInfo.program_category_id) {
      refetchPrograms({ 
        categoryId: parseInt(searchInfo.program_category_id, 10) 
      });
    }
  }, [searchInfo.program_category_id, refetchPrograms]);
  
  // Auto-select location based on place value when locations are loaded
  useEffect(() => {
    console.log('[DEBUG] Location auto-select effect triggered with:', {
      place: searchInfo.place,
      location_name: searchInfo.location_name,
      locationsLength: locations.length
    });
    
    if (searchInfo.place && locations.length > 0) {
      console.log('[DEBUG] Searching for location that matches place:', searchInfo.place);
      
      // Try to find the location by name
      const matchingLocation = locations.find(loc => {
        const isMatch = loc.location_name === searchInfo.place;
        console.log(`[DEBUG] Comparing location: "${loc.location_name}" (id:${loc.id}, type:${typeof loc.id}) with place: "${searchInfo.place}" -> match: ${isMatch}`);
        return isMatch;
      });
      
      if (matchingLocation) {
        console.log('[DEBUG] Found matching location:', {
          id: matchingLocation.id,
          name: matchingLocation.location_name,
          type: typeof matchingLocation.id
        });
        
        setSearchInfo(prev => {
          const updated = {
            ...prev,
            location_name: matchingLocation.id
          };
          console.log('[DEBUG] Updated searchInfo with location_name:', updated.location_name);
          return updated;
        });
      } else {
        console.log('[DEBUG] No matching location found for:', searchInfo.place);
        console.log('[DEBUG] First 5 available locations:', locations.slice(0, 5).map(l => `"${l.location_name}" (id:${l.id})`).join(', '));
      }
    }
  }, [searchInfo.place, locations]);
  
  // 쿼리 응답이 변경될 때 상태 업데이트
  useEffect(() => {
    if (reservationsData?.getPage1List) {
      setReservations(reservationsData.getPage1List);
    }
  }, [reservationsData]);

  useEffect(() => {
    if (categoriesData?.getProgramCategories) {
      setCategories(categoriesData.getProgramCategories);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (instructorsData?.getInstructors) {
      setTeacherList(instructorsData.getInstructors);
    }
  }, [instructorsData]);

  useEffect(() => {
    if (programsData?.getProgramsByCategory) {
      setProgramList(programsData.getProgramsByCategory);
    }
  }, [programsData]);
  
  useEffect(() => {
    if (locationsData?.locations) {
      console.log('[DEBUG] Locations data updated:', locationsData.locations.length);
      setLocations(locationsData.locations);
    }
  }, [locationsData]);
  
  // External ref to the insert form
  const insertFormRef = useRef(null);
  
  // Method to set rows from outside
  const setRowsData = (newRows) => {
    console.log('[Program] 🔄 setRowsData 호출됨', newRows?.length);
    console.log('[Program] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
    
    if (!newRows || newRows.length === 0) {
      console.log('[Program] ⚠️ 빈 rows 데이터, 무시함');
      return;
    }
    
    // Process new rows
    console.log('[Program] 🔄 행 데이터 처리 시작');
    const processedRows = newRows.map((row, index) => {
      // Find existing row data if available
      const existingRow = rows.find(r => r.idx === row.idx);
      
      if (existingRow) {
        console.log(`[Program] 🔄 행 ${index}: 기존 데이터 발견 (idx=${row.idx})`);
      } else {
        console.log(`[Program] 🔄 행 ${index}: 새 행 생성 (idx=${row.idx})`);
      }
      
      const result = {
        ...initRowData,  // Basic fields
        ...existingRow,  // Existing data (if any)
        ...row,          // New data takes precedence
        idx: row.idx || uuidv4(),  // Ensure idx exists
        chk: row.chk || false
      };
      
      console.log(`[Program] 🔄 행 ${index} 처리 완료: sex=${result.sex}, age=${result.age}`);
      return result;
    });
    
    console.log('[Program] ✅ rows 업데이트:', processedRows.length);
    console.log('[Program] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
    setRows(processedRows);
  };
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setRows: setRowsData,
    rows,
    _insertFormRef: insertFormRef,
    forceUpdate: () => {
      const currentRows = [...rows];
      setRows(currentRows);
    }
  }), [rows]);
  
  return (
    <>
      <MainCard title="프로그램 만족도">
        <SearchInfo 
          searchInfo={searchInfo} 
          onChange={onChangeSearchInfo}
          onSearch={onSearch}
        />
        
        <ServiceFormToolbar
          onSearch={onSearch}
          onSave={onSave}
          onDataProcessed={onChangeExcel}
          startRow={3}
          type="program"
        />

        <EnhancedInsertForm
          rows={rows} 
          addRow={addRow} 
          removeRow={removeRow} 
          changeValue={changeValue}
          onCheckChange={onCheckChange}
          setAllData={setAllData}
        />
      </MainCard>
    </>
  );
});

export default Program; 