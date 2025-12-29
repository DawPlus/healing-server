import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_COUNSEL_THERAPY_FORM, UPDATE_COUNSEL_THERAPY_FORM, GET_COUNSEL_THERAPY_FORMS, DELETE_COUNSEL_THERAPY_FORM } from '../../../graphql/serviceForm';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import InsertForm from './insertForm';
import SearchInfo from './searchInfo';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";

const initRowData = {
  idx: "",
  id: "",
  chk: false,
  counsel_therapy_seq: "",
  sex: "미기재", // 성별
  age: "", // 연령
  residence: "미기재", // 거주지
  job: "",
  past_experience: "", // 과거 상담/치유서비스 경험
  content_type: "", // 콘텐츠 종류
  average_usage_time: "", // 1회 평균 사용 시간
  monthly_expense: "", // 월 평균 지출 금액
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
  score13: "",
  score14: "",
  score15: "",
  score16: "",
  score17: "",
  score18: "",
  score19: "",
  score20: "",
  score21: "",
  score22: "",
  score23: "",
  score24: "",
  score25: "",
  score26: "",
  score27: "",
  score28: "",
  score29: "",
  score30: ""
};

// Add the missing GraphQL query for organizations
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

const CounselTherapy = forwardRef((props, ref) => {
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Add the missing organizations state
  const [organizations, setOrganizations] = useState([]);

  // State for form data
  const [rows, setRows] = useState([{ ...initRowData, idx: uuidv4() }]);
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    openday: '',
    eval_date: '',
    ptcprogram: '',
    counsel_contents: '',
    session1: '',
    session2: '',
    pv: '',
    content_type: '',
    average_usage_time: '',
    monthly_expense: ''
  });
  const [deleteRow, setDeleteRow] = useState([]);
  
  // 외부에서 접근할 수 있도록 ref 노출
  const insertFormRef = useRef(null);
  
  // Add the missing organizations query
  const { loading: orgLoading } = useQuery(GET_ORGANIZATION_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getPage1List) {
        setOrganizations(data.getPage1List);
      }
    },
    onError: (error) => {
      console.error("Error fetching organizations:", error);
    }
  });
  
  // 외부에서 row 데이터를 설정할 수 있도록 메서드 노출
  const setRowsData = (newRows) => {
    console.log('[CounselTherapy] 🔄 setRowsData 호출됨', newRows?.length);
    console.log('[CounselTherapy] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
    
    if (!newRows || newRows.length === 0) {
      console.log('[CounselTherapy] ⚠️ 빈 rows 데이터, 무시함');
      return;
    }
    
    // row 데이터가 변경되었는지 확인
    const currentIds = rows.map(row => row.idx).join(',');
    const newIds = newRows.map(row => row.idx).join(',');
    
    console.log('[CounselTherapy] 🔄 기존 ID:', currentIds);
    console.log('[CounselTherapy] 🔄 새 ID:', newIds);
    
    if (currentIds === newIds && rows.length > 0) {
      console.log('[CounselTherapy] ℹ️ 동일한 ID의 rows, 변경 없음');
      return;
    }
    
    // 참가자 정보만 있는 경우 필수 필드 추가
    console.log('[CounselTherapy] 🔄 행 데이터 처리 시작');
    const processedRows = newRows.map((row, index) => {
      // 기존 행 정보 찾기
      const existingRow = rows.find(r => r.idx === row.idx);
      
      if (existingRow) {
        console.log(`[CounselTherapy] 🔄 행 ${index}: 기존 데이터 발견 (idx=${row.idx})`);
      } else {
        console.log(`[CounselTherapy] 🔄 행 ${index}: 새 행 생성 (idx=${row.idx})`);
      }
      
      const result = {
        ...initRowData,  // 기본 데이터 구조
        ...existingRow,  // 기존 행 데이터 (있으면)
        ...row,          // 새로운 데이터
        idx: row.idx || uuidv4(),  // idx는 반드시 있어야 함
        chk: row.chk || false
      };
      
      console.log(`[CounselTherapy] 🔄 행 ${index} 처리 완료: name=${result.name || result.NAME}`);
      return result;
    });
    
    console.log('[CounselTherapy] ✅ rows 업데이트:', processedRows.length);
    console.log('[CounselTherapy] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
    setRows(processedRows);
  };
  
  // 컴포넌트 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    setRows: setRowsData,
    rows,
    _insertFormRef: insertFormRef,
    forceUpdate: () => {
      const currentRows = [...rows];
      setRows(currentRows);
    }
  }), [rows]);

  // GraphQL query to fetch counsel therapy forms
  const { refetch } = useQuery(GET_COUNSEL_THERAPY_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    },
    // Skip the query entirely until user explicitly searches
    skip: true,
    onCompleted: (data) => {
      if (data && data.getCounselTherapyForms && data.getCounselTherapyForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        
        // Transform forms to rows format
        const formRows = data.getCounselTherapyForms.map(form => ({
          idx: uuidv4(),
          id: form.id || "",
          chk: false,
          counsel_therapy_seq: form.counsel_therapy_seq || "",
          sex: form.sex || "미기재",
          age: form.age || "",
          residence: form.residence || "미기재",
          job: form.job || "",
          past_experience: form.past_experience || "",
          content_type: form.content_type || "",
          average_usage_time: form.average_usage_time || "",
          monthly_expense: form.monthly_expense || "",
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
          score13: form.score13 || "",
          score14: form.score14 || "",
          score15: form.score15 || "",
          score16: form.score16 || "",
          score17: form.score17 || "",
          score18: form.score18 || "",
          score19: form.score19 || "",
          score20: form.score20 || "",
          score21: form.score21 || "",
          score22: form.score22 || "",
          score23: form.score23 || "",
          score24: form.score24 || "",
          score25: form.score25 || "",
          score26: form.score26 || "",
          score27: form.score27 || "",
          score28: form.score28 || "",
          score29: form.score29 || "",
          score30: form.score30 || ""
        }));
        
        // Update rows
        setRows(formRows.length > 0 ? formRows : [{ ...initRowData, idx: uuidv4() }]);
        
        // Update searchInfo with the most recent form data
        const mostRecentForm = data.getCounselTherapyForms[0];
        console.log('[CounselTherapy] Form data loaded from database:', {
          agency: mostRecentForm.agency,
          openday: mostRecentForm.openday,
          eval_date: mostRecentForm.eval_date,
          ptcprogram: mostRecentForm.ptcprogram
        });
        
        setSearchInfo(prev => ({
          ...prev,
          agency: mostRecentForm.agency || prev.agency,
          agency_id: mostRecentForm.agency_id || prev.agency_id,
          name: mostRecentForm.name || prev.name,
          openday: mostRecentForm.openday || prev.openday,
          eval_date: mostRecentForm.eval_date || prev.eval_date,
          ptcprogram: mostRecentForm.ptcprogram || prev.ptcprogram,
          counsel_contents: mostRecentForm.counsel_contents || prev.counsel_contents,
          session1: mostRecentForm.session1 || prev.session1,
          session2: mostRecentForm.session2 || prev.session2,
          pv: mostRecentForm.pv || prev.pv,
          past_stress_experience: mostRecentForm.past_stress_experience || prev.past_stress_experience,
          content_type: mostRecentForm.content_type || prev.content_type,
          average_usage_time: mostRecentForm.average_usage_time || prev.average_usage_time,
          monthly_expense: mostRecentForm.monthly_expense || prev.monthly_expense
        }));
        
        // Show success message with number of loaded forms
        if (formRows.length > 0) {
          Swal.fire({
            icon: 'success',
            title: '데이터 로드 완료',
            text: `${formRows.length}개의 데이터가 로드되었습니다.`
          });
        }
      } else {
        // Only show this message when explicitly searching and no results found
        // Not when dropdown values change
        console.log("[CounselTherapy] No data found for search criteria");
      }
    },
    onError: (error) => {
      console.error("GraphQL 쿼리 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`,
      });
    },
    // Don't fetch on every parameter change, only when explicitly called
    fetchPolicy: 'no-cache'
  });

  // GraphQL mutation to create counsel therapy form
  const [createCounselTherapyForm] = useMutation(CREATE_COUNSEL_THERAPY_FORM, {
    onCompleted: (data) => {
      if (data.createCounselTherapyForm) {
        if (location.state) {
          Swal.fire({
            icon: 'success',
            title: '확인',
            text: "수정이 완료 되었습니다. 수정/삭제 페이지로 이동합니다. ",
          }).then(() => {
            navigate("/updateDelete", {
              state: {
                params: location.state.searchInfo
              }
            });
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: '확인',
            text: "정상등록 되었습니다.",
          }).then(() => {
            // Reset form
            setRows([{ ...initRowData, idx: uuidv4() }]);
            setSearchInfo({
              agency: "",
              agency_id: null,
              openday: "",
              eval_date: "",
              ptcprogram: "",
              counsel_contents: "",
              session1: '',
              session2: '',
              pv: ''
            });
          });
        }
      }
    },
    onError: (error) => {
      console.error("GraphQL 뮤테이션 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  // GraphQL mutation to update counsel therapy form
  const [updateCounselTherapyForm] = useMutation(UPDATE_COUNSEL_THERAPY_FORM);
  const [deleteCounselTherapyForm] = useMutation(DELETE_COUNSEL_THERAPY_FORM, {
    onCompleted: (data) => {
      console.log("상담&치유서비스 폼 삭제 성공:", data);
    },
    onError: (error) => {
      console.error("상담&치유서비스 폼 삭제 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `삭제 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  // Effect to handle location state updates
  useEffect(() => {
    if (!location.state) return;
    
    const { data } = location.state;
    
    if (data) {
      const [col1, col2, col3, col4, col5] = [
        data[6], data[3], data[4], data[7], data[8]
      ];
      
      console.log("[CounselTherapy] Loading data from navigation:", { 
        agency: col1, 
        openday: col2, 
        eval_date: col3 
      });
      
      setSearchInfo({
        agency: col1 || "",
        openday: col2 || "",
        eval_date: col3 || "",
        ptcprogram: col4 || "",
        counsel_contents: col5 || "",
        session1: data[9] || '',
        session2: data[10] || '',
        pv: data[11] || ''
      });
      
      // Only trigger a search if all three required values are present
      if (col1) {
        console.log("[CounselTherapy] Searching with data from navigation");
        
        // We need to wrap the refetch in a small timeout to ensure state is updated first
        setTimeout(() => {
          refetch({
            agency: col1,
            openday: col2 || null,
            eval_date: col3 || null
          }).then(result => {
            if (!result.data || !result.data.getCounselTherapyForms || result.data.getCounselTherapyForms.length === 0) {
              console.log("[CounselTherapy] No data found from navigation search");
            }
          });
        }, 100);
      }
    }
    
    return () => {
      // Cleanup
      setRows([{ ...initRowData, idx: uuidv4() }]);
      setSearchInfo({
        agency: "",
        agency_id: null,
        openday: "",
        eval_date: "",
        ptcprogram: "",
        counsel_contents: "",
        session1: '',
        session2: '',
        pv: ''
      });
    };
  }, [location.state, refetch]);

  // Initial component load setup
  useEffect(() => {
    // Initialize eval_date with today's date if not set
    if (!searchInfo.eval_date) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      console.log('[CounselTherapy] Setting default eval_date on component mount:', today);
      setSearchInfo(prev => ({...prev, eval_date: today}));
    }
  }, []);

  const onSave = () => {
    console.log('[CounselTherapy] Starting form save with searchInfo:', {
      agency: searchInfo.agency,
      agency_id: searchInfo.agency_id,
      openday: searchInfo.openday, 
      eval_date: searchInfo.eval_date,
      ptcprogram: searchInfo.ptcprogram
    });
    
    // Initialize missing date fields with today's date
    const today = new Date().toISOString().split('T')[0];
    
    let isValid = true;
    const validationErrors = [];
    
    // Check required fields
    if(!searchInfo.agency) {
      console.log('[CounselTherapy] Save validation failed: No agency');
      validationErrors.push("기관을 선택해주세요.");
      isValid = false;
    }

    // Convert openday to string for consistent type checking
    const formattedOpenday = searchInfo.openday ? String(searchInfo.openday).trim() : '';
    if(!formattedOpenday) {
      console.log('[CounselTherapy] Save validation failed: No openday');
      // Auto-set the date instead of showing error
      setSearchInfo(prev => ({...prev, openday: today}));
    }

    // Process eval_date for consistent validation
    const formattedEvalDate = searchInfo.eval_date ? String(searchInfo.eval_date).trim() : '';
    if(!formattedEvalDate) {
      console.log('[CounselTherapy] Save validation failed: No eval_date');
      // Auto-set the date instead of showing error
      setSearchInfo(prev => ({...prev, eval_date: today}));
    }

    // Check rows for required data
    const missingDataRows = rows.filter(row => !row.sex || !row.residence);
    if (missingDataRows.length > 0) {
      console.log('[CounselTherapy] Save validation failed: Missing required data in rows:', 
        missingDataRows.map(r => ({ idx: r.idx, sex: r.sex, residence: r.residence })));
      
      validationErrors.push('성별 및 거주지는 필수 입력 항목입니다.');
      isValid = false;
    }
    
    // If any validation errors, show them and return
    if (!isValid) {
      Swal.fire({
        icon: 'warning',
        title: '필수 데이터 누락',
        text: validationErrors.join(' ')
      });
      return;
    }

    console.log('[CounselTherapy] Form validation passed, proceeding with save');

    // For consolidated model, create a separate form for each row
    const promises = rows.map(row => {
    const input = {
      agency: searchInfo.agency || '',
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      name: searchInfo.name || "",
      openday: formattedOpenday || today,
      eval_date: formattedEvalDate || today,
      ptcprogram: searchInfo.ptcprogram || "",
      counsel_contents: searchInfo.counsel_contents || "",
      session1: searchInfo.session1 || "",
      session2: searchInfo.session2 || "",
      pv: searchInfo.pv || "",
      past_stress_experience: searchInfo.past_stress_experience || "",
      counsel_therapy_seq: row.counsel_therapy_seq || null,
      sex: row.sex || "미기재",
      age: row.age || "",
      residence: row.residence || "미기재",
      job: row.job || "",
      past_experience: row.past_experience || "",
      content_type: row.content_type || "",
      average_usage_time: row.average_usage_time || "",
      monthly_expense: row.monthly_expense || "",
      score1: row.score1 !== null && row.score1 !== undefined ? String(row.score1) : "",
      score2: row.score2 !== null && row.score2 !== undefined ? String(row.score2) : "",
      score3: row.score3 !== null && row.score3 !== undefined ? String(row.score3) : "",
      score4: row.score4 !== null && row.score4 !== undefined ? String(row.score4) : "",
      score5: row.score5 !== null && row.score5 !== undefined ? String(row.score5) : "",
      score6: row.score6 !== null && row.score6 !== undefined ? String(row.score6) : "",
      score7: row.score7 !== null && row.score7 !== undefined ? String(row.score7) : "",
      score8: row.score8 !== null && row.score8 !== undefined ? String(row.score8) : "",
      score9: row.score9 !== null && row.score9 !== undefined ? String(row.score9) : "",
      score10: row.score10 !== null && row.score10 !== undefined ? String(row.score10) : "",
      score11: row.score11 !== null && row.score11 !== undefined ? String(row.score11) : "",
      score12: row.score12 !== null && row.score12 !== undefined ? String(row.score12) : "",
      score13: row.score13 !== null && row.score13 !== undefined ? String(row.score13) : "",
      score14: row.score14 !== null && row.score14 !== undefined ? String(row.score14) : "",
      score15: row.score15 !== null && row.score15 !== undefined ? String(row.score15) : "",
      score16: row.score16 !== null && row.score16 !== undefined ? String(row.score16) : "",
      score17: row.score17 !== null && row.score17 !== undefined ? String(row.score17) : "",
      score18: row.score18 !== null && row.score18 !== undefined ? String(row.score18) : "",
      score19: row.score19 !== null && row.score19 !== undefined ? String(row.score19) : "",
      score20: row.score20 !== null && row.score20 !== undefined ? String(row.score20) : "",
      score21: row.score21 !== null && row.score21 !== undefined ? String(row.score21) : "",
      score22: row.score22 !== null && row.score22 !== undefined ? String(row.score22) : "",
      score23: row.score23 !== null && row.score23 !== undefined ? String(row.score23) : "",
      score24: row.score24 !== null && row.score24 !== undefined ? String(row.score24) : "",
      score25: row.score25 !== null && row.score25 !== undefined ? String(row.score25) : "",
      score26: row.score26 !== null && row.score26 !== undefined ? String(row.score26) : "",
      score27: row.score27 !== null && row.score27 !== undefined ? String(row.score27) : "",
      score28: row.score28 !== null && row.score28 !== undefined ? String(row.score28) : "",
      score29: row.score29 !== null && row.score29 !== undefined ? String(row.score29) : "",
      score30: row.score30 !== null && row.score30 !== undefined ? String(row.score30) : ""
    };

    // If row has an ID, update it, otherwise create new
    if (row.id) {
      return updateCounselTherapyForm({
        variables: {
          id: parseInt(row.id, 10),
          input
        }
      });
    } else {
      return createCounselTherapyForm({
        variables: {
          input
        }
      });
    }
  });

  // Execute all mutations
  Promise.all(promises)
    .then(() => {
      if (location.state) {
        Swal.fire({
          icon: 'success',
          title: '확인',
          text: "수정이 완료 되었습니다. 수정/삭제 페이지로 이동합니다. ",
        }).then(() => {
          navigate("/updateDelete", {
            state: {
              params: location.state.searchInfo
            }
          });
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '확인',
          text: "정상등록 되었습니다.",
        }).then(() => {
          // Reset form
          setRows([{ ...initRowData, idx: uuidv4() }]);
          setSearchInfo({
            agency: "",
            agency_id: null,
            name: "",
            openday: "",
            eval_date: "",
            ptcprogram: "",
            counsel_contents: "",
            session1: "",
            session2: "",
            pv: "",
            past_stress_experience: ""
          });
        });
      }
    })
    .catch(error => {
      console.error("GraphQL 뮤테이션 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
      });
    });
  };

  const onSearch = () => {
    if (!searchInfo.agency) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "검색하려면 적어도 기관명을 입력해 주십시오.",
      });
      return;
    }

    console.log("[CounselTherapy] Searching with criteria:", {
      agency: searchInfo.agency,
      agency_id: searchInfo.agency_id,
      openday: searchInfo.openday,
      eval_date: searchInfo.eval_date,
      pv: searchInfo.pv
    });
    
    // Only require agency name, make other fields optional
    refetch({
      agency: searchInfo.agency,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    }).then(result => {
      console.log("[CounselTherapy] Search results:", result?.data?.getCounselTherapyForms?.length || 0);
      
      if (!result.data || !result.data.getCounselTherapyForms || result.data.getCounselTherapyForms.length === 0) {
        // No results found - clear form but keep search criteria
        setRows([{ ...initRowData, idx: uuidv4() }]);
        
        Swal.fire({ 
          icon: 'info', 
          title: '결과 없음', 
          text: "검색 조건에 맞는 데이터가 없습니다." 
        });
      }
    }).catch(error => {
      console.error("Search error:", error);
      Swal.fire({
        icon: 'error',
        title: '검색 오류',
        text: `데이터 검색 중 오류가 발생했습니다: ${error.message}`
      });
    });
  };

  const onChangeExcel = (excelData) => {
    if (!excelData || excelData.length === 0) {
      return;
    }
    
    try {
      const processedData = excelData.map((row, idx) => ({
        idx: uuidv4(),
        chk: false,
        counsel_therapy_seq: idx + 1,
        sex: row.col1 || "미기재",
        age: row.col2 || "",
        residence: row.col3 || "미기재",
        job: row.col4 || "",
        past_experience: row.col5 || "",
        content_type: row.col6 || "",
        average_usage_time: row.col7 || "",
        monthly_expense: row.col8 || "",
        score1: row.col9 || "",
        score2: row.col10 || "",
        score3: row.col11 || "",
        score4: row.col12 || "",
        score5: row.col13 || "",
        score6: row.col14 || "",
        score7: row.col15 || "",
        score8: row.col16 || "",
        score9: row.col17 || "",
        score10: row.col18 || "",
        score11: row.col19 || "",
        score12: row.col20 || "",
        score13: row.col21 || "",
        score14: row.col22 || "",
        score15: row.col23 || "",
        score16: row.col24 || "",
        score17: row.col25 || "",
        score18: row.col26 || "",
        score19: row.col27 || "",
        score20: row.col28 || "",
        score21: row.col29 || "",
        score22: row.col30 || "",
        score23: row.col31 || "",
        score24: row.col32 || "",
        score25: row.col33 || "",
        score26: row.col34 || "",
        score27: row.col35 || "",
        score28: row.col36 || "",
        score29: row.col37 || "",
        score30: row.col38 || ""
      }));
      
      setRows(processedData);
    } catch (error) {
      console.error("Excel 데이터 처리 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `Excel 데이터 처리 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  };

  const addRow = () => {
    setRows(prev => [...prev, { ...initRowData, idx: uuidv4() }]);
  };

  const removeRow = () => {
    try {
      const hasCheckedRows = rows.some(row => row.chk);
      
      if (!hasCheckedRows) {
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
        text: `선택한 항목을 삭제하시겠습니까?`,
        showCancelButton: true,
        confirmButtonText: '예',
        cancelButtonText: '아니오'
      }).then((result) => {
        if (result.isConfirmed) {
          const filteredRows = rows.filter(row => !row.chk);
          const checkedRows = rows.filter(row => row.chk);
          
          // Store IDs to delete
          const idsToDelete = checkedRows.filter(row => row.id).map(row => row.id);
          
          // Remove from UI first
          setRows(filteredRows.length > 0 ? filteredRows : [{ ...initRowData, idx: uuidv4() }]);
          
          // Delete from server if there are saved rows
          if (idsToDelete.length > 0) {
            console.log(`${idsToDelete.length}개 항목 서버에서 삭제 시작`);
            
            // Track IDs for future reference
            setDeleteRow(prev => [...prev, ...idsToDelete]);
            
            // Execute DELETE mutation for each item
            const deletePromises = idsToDelete.map(id => {
              return deleteCounselTherapyForm({
                variables: { id: parseInt(id, 10) }
              });
            });
            
            // Handle all deletion promises
            Promise.all(deletePromises)
              .then(results => {
                console.log("서버 삭제 결과:", results);
                Swal.fire({
                  icon: 'success',
                  title: '삭제 완료',
                  text: `${idsToDelete.length}개 항목이 삭제되었습니다.`,
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
    } catch (error) {
      console.error('Error removing rows:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `행 삭제 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  };

  const onCheckChange = (idx, checked) => {
    console.log('[CounselTherapy] Checkbox change:', { idx, checked });
    setRows(prev => 
      prev.map((row, i) => i === idx ? { ...row, chk: checked } : row)
    );
  };

  const changeValue = (idx, name, value) => {
    console.log('[CounselTherapy] Value change:', { idx, name, value });
    setRows(prev => 
      prev.map((row, i) => i === idx ? { ...row, [name]: value } : row)
    );
  };

  const setAllData = (type, value) => {
    console.log('[CounselTherapy] setAllData called:', { type, value: Array.isArray(value) ? `${value.length} items` : value });
    
    // Handle different types of calls
    if (type === 'all' || (typeof type === 'object' && type.type === 'all')) {
      const newRows = typeof type === 'object' ? type.value : value;
      
      if (Array.isArray(newRows) && newRows.length > 0) {
        console.log('[CounselTherapy] Updating all rows with new data:', newRows.length);
        setRows(newRows.map(row => ({
          ...initRowData,
          ...row,
          idx: row.idx || uuidv4()
        })));
        return;
      }
    } else {
      // Handle score updates for checked rows
      const checkedRows = rows.filter(row => row.chk);
      
      if (checkedRows.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: '선택된 항목이 없습니다',
          text: '값을 적용할 항목을 선택해주세요.'
        });
        return;
      }
      
      // Update the selected value for all checked rows
      setRows(prev => 
        prev.map(row => row.chk ? { ...row, [type]: value } : row)
      );
    }
  };

  const onChangeSearchInfo = (name, value) => {
    console.log(`[CounselTherapy] Search info changed: ${name} = ${value}`);
    setSearchInfo(prev => ({ ...prev, [name]: value }));
  };

  // Effect to ensure dates are properly formatted and updated when agency changes
  useEffect(() => {
    if (searchInfo.agency_id && !searchInfo.openday) {
      // If agency is selected but no start date, try to find it from API
      const getInitialOrganization = async () => {
        try {
          console.log('[CounselTherapy] Attempting to fetch start date for agency:', searchInfo.agency_id);
          const result = await refetch({
            agency: searchInfo.agency,
            agency_id: parseInt(searchInfo.agency_id, 10),
            openday: null,
            eval_date: null
          });
          
          if (result?.data?.getCounselTherapyForms?.length > 0) {
            const openday = result.data.getCounselTherapyForms[0].openday;
            if (openday) {
              console.log('[CounselTherapy] Setting start date from API result:', openday);
              setSearchInfo(prev => ({...prev, openday}));
            }
          }
        } catch (error) {
          console.error('[CounselTherapy] Error fetching agency data:', error);
        }
      };
      
      getInitialOrganization();
    }
  }, [searchInfo.agency_id, searchInfo.agency, searchInfo.openday, refetch]);

  return (
    <MainCard title="상담&치유서비스 효과평가">
      <SearchInfo 
        searchInfo={searchInfo}
        onChangeSearchInfo={onChangeSearchInfo}
        onSearch={onSearch}
      />
      
      <ServiceFormToolbar
        onSearch={onSearch}
        onSave={onSave}
        onDataProcessed={onChangeExcel}
        startRow={3}
        type="counselTherapy"
      />
      
      <InsertForm
        ref={insertFormRef}
        rows={rows}
        onAdd={addRow}
        onRemove={removeRow}
        onCheckChange={onCheckChange}
        onChange={changeValue}
        setAllData={setAllData}
      />
    </MainCard>
  );
});

export default CounselTherapy; 