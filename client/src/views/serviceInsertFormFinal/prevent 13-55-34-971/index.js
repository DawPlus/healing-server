import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_PREVENT_FORM, UPDATE_PREVENT_FORM, GET_PREVENT_FORMS, DELETE_PREVENT_FORM } from '../../../graphql/serviceForm';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import InsertForm from './insertForm';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress, Button, Box, Autocomplete, TextField } from '@mui/material';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import { validateSearchInfo, parseAgencyInfo, formatDate } from '../../../utils/formUtils';

// 숫자를 문자열로 안전하게 변환하는 헬퍼 함수
const toSafeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

// 기본 행 데이터 정의
const initRow = {
  id: "",
  chk: false,
  PREVENT_SEQ: "",
  NAME: "",
  SEX: "",
  AGE: "",
  RESIDENCE: "",
  JOB: "",
  PAST_STRESS_EXPERIENCE: "",
  PARTICIPATION_PERIOD: "",
  SCORE1: "", SCORE2: "", SCORE3: "", SCORE4: "", SCORE5: "",
  SCORE6: "", SCORE7: "", SCORE8: "", SCORE9: "", SCORE10: "",
  SCORE11: "", SCORE12: "", SCORE13: "", SCORE14: ""
};

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

const Prevent = forwardRef((props, ref) => {
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // 기관 목록 상태
  const [organizations, setOrganizations] = useState([]);
  
  // 기관 목록 조회
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
  
  // 로컬 상태 관리
  const [rows, setRows] = useState([{ ...initRow, id: uuidv4() }]);
  const [deleteRows, setDeleteRows] = useState([]);
  
  // State for form data
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    openday: '',
    eval_date: '',
    ptcprogram: '',
    prevent_contents: '',
    pv: '',
    past_stress_experience: '',
    participation_period: ''
  });
  
  // 선택된 기관 찾기
  const selectedAgency = searchInfo?.agency_id ? 
    organizations.find(org => org.id === parseInt(searchInfo.agency_id, 10)) : null;
  
  // 외부 searchInfo props를 받아서 내부 상태 업데이트
  useEffect(() => {
    if (props.searchInfo) {
      console.log('[Prevent] 외부 searchInfo props 수신됨:', props.searchInfo);
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
  
  // 외부에서 접근할 수 있도록 ref 노출
  const insertFormRef = useRef(null);
  
  // 외부에서 row 데이터를 설정할 수 있도록 메서드 노출
  const setRowsData = (newRows) => {
    console.log('[Prevent] 🔄 setRowsData 호출됨', newRows?.length);
    console.log('[Prevent] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
    
    if (!newRows || newRows.length === 0) {
      console.log('[Prevent] ⚠️ 빈 rows 데이터, 무시함');
      return;
    }
    
    // row 데이터가 변경되었는지 확인
    const currentIds = rows.map(row => row.id).join(',');
    const newIds = newRows.map(row => row.idx || row.id).join(',');
    
    console.log('[Prevent] 🔄 기존 ID:', currentIds);
    console.log('[Prevent] 🔄 새 ID:', newIds);
    
    if (currentIds === newIds && rows.length > 0) {
      console.log('[Prevent] ℹ️ 동일한 ID의 rows, 변경 없음');
      return;
    }
    
    // 참가자 정보만 있는 경우 필수 필드 추가
    console.log('[Prevent] 🔄 행 데이터 처리 시작');
    const processedRows = newRows.map((row, index) => {
      // 기존 행 정보 찾기
      const existingRow = rows.find(r => r.id === row.id || r.id === row.idx);
      
      if (existingRow) {
        console.log(`[Prevent] 🔄 행 ${index}: 기존 데이터 발견 (id=${existingRow.id})`);
      } else {
        console.log(`[Prevent] 🔄 행 ${index}: 새 행 생성 (id=${row.id || row.idx})`);
      }
      
      const result = {
        ...initRow,  // 기본 데이터 구조
        ...existingRow,  // 기존 행 데이터 (있으면)
        ...row,          // 새로운 데이터
        id: row.id || row.idx || uuidv4(),  // id는 반드시 있어야 함
        chk: row.chk || false,
        PREVENT_SEQ: row.PREVENT_SEQ || existingRow?.PREVENT_SEQ || "",
        NAME: row.NAME || row.name || "",
        SEX: row.SEX || row.sex || "미기재",
        AGE: row.AGE || row.age || "",
                RESIDENCE: row.RESIDENCE || row.residence || "미기재",
        JOB: row.JOB || row.job || "미기재",
        PAST_STRESS_EXPERIENCE: row.PAST_STRESS_EXPERIENCE || row.past_stress_experience || "1",
        PARTICIPATION_PERIOD: row.PARTICIPATION_PERIOD || row.participationPeriod || ""
      };
      
      console.log(`[Prevent] 🔄 행 ${index} 처리 완료: name=${result.NAME || result.name}, PREVENT_SEQ=${result.PREVENT_SEQ}`);
      return result;
    });
    
    console.log('[Prevent] ✅ rows 업데이트:', processedRows.length);
    console.log('[Prevent] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
    setRows(processedRows);
  };
  
  // 컴포넌트 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    setRows: setRowsData,
    rows,
    _insertFormRef: insertFormRef,
    onChangeSearchInfo,
    forceUpdate: () => {
      const currentRows = [...rows];
      setRows(currentRows);
    }
  }), [rows]);

  // GraphQL query to fetch prevent forms
  const { refetch } = useQuery(GET_PREVENT_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    },
    skip: true,
    onCompleted: (data) => {
      if (data && data.getPreventForms && data.getPreventForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러쵸니다." });
        
        // Transform data to local state
        const transformedData = transformPreventData(data);
        setRows(transformedData);
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

  // GraphQL mutation to create prevent form
  const [createPreventForm] = useMutation(CREATE_PREVENT_FORM, {
    onCompleted: (data) => {
      console.log("Create response:", data);
      if (data.createPreventForm) {
        if (location.state) {
          Swal.fire({
            icon: 'success',
            title: '확인',
            text: "수정이 완료 되었습니다. 수정/삭제 페이지로 이동합니다.",
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
            setRows([{ ...initRow, id: uuidv4() }]);
            setSearchInfo({
              agency: "",
              agency_id: null,
              openday: "",
              eval_date: "",
              ptcprogram: "",
              prevent_contents: "",
              pv: "",
              past_stress_experience: ""
            });
          });
        }
      }
    },
    onError: (error) => {
      console.error("Create 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  // GraphQL mutation to update prevent form
  const [updatePreventForm] = useMutation(UPDATE_PREVENT_FORM, {
    onCompleted: (data) => {
      console.log("Update response:", data);
      // Success handling is in the Promise.all chain in onSave
    },
    onError: (error) => {
      console.error("Update 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  const [deletePreventForm] = useMutation(DELETE_PREVENT_FORM, {
    onCompleted: (data) => {
      console.log("예방서비스 폼 삭제 성공:", data);
    },
    onError: (error) => {
      console.error("예방서비스 폼 삭제 오류:", error);
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
      
      setSearchInfo({
        agency: col1 || "",
        openday: col2 || "",
        eval_date: col3 || "",
        ptcprogram: col4 || "",
        prevent_contents: col5 || "",
        pv: data[9] || "",
        past_stress_experience: ""
      });
      
      // Trigger refetch with new parameters
      if (col1 && col2 && col3) {
        refetch({
          agency: col1,
          openday: col2,
          eval_date: col3
        });
      }
    }
    
    return () => {
      // Cleanup
      setRows([{ ...initRow, id: uuidv4() }]);
      setSearchInfo({
        agency: "",
        agency_id: null,
        openday: "",
        eval_date: "",
        ptcprogram: "",
        prevent_contents: "",
        pv: "",
        past_stress_experience: ""
      });
    };
  }, [location.state, refetch]);

  // 기관 선택 변경 핸들러 (Autocomplete 용)
  const handleOrganizationChange = (event, newValue) => {
    try {
      if (newValue) {
        // 기관명과 ID 업데이트
        console.log(`[Prevent] Selected org: ${newValue.group_name}, ID: ${newValue.id}`);
        onChangeSearchInfo('agency_id', parseInt(newValue.id, 10));
        onChangeSearchInfo('agency', newValue.group_name);
        
        // 기관 선택 시 시작일자 자동 설정
        if (newValue.start_date) {
          onChangeSearchInfo('openday', newValue.start_date);
        }
      } else {
        // 기관 선택이 해제된 경우
        onChangeSearchInfo('agency_id', null);
        onChangeSearchInfo('agency', '');
      }
    } catch (err) {
      console.error('[Prevent] Error in handleOrganizationChange:', err);
    }
  };

  const onSave = () => {
    // Check only essential fields
    if (!validateSearchInfo(searchInfo)) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "필수 기본정보(기관명과 시작일/실시일자 중 하나 이상)를 입력해 주십시오.",
      });
      return;
    }

    // Check if rows exist
    if (!rows || rows.length === 0) {
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '입력된 데이터가 없습니다.'
      });
      return;
    }
      
    // Check if any required fields are missing
    const missingData = rows.some(row => {
      if (!row.SEX || !row.RESIDENCE) {
        return true;
      }
      return false;
    });

    if (missingData) {
      Swal.fire({
        icon: 'warning',
        title: '필수 데이터 누락',
        text: '성별 및 거주지는 필수 입력 항목입니다.',
      });
      return;
    }
    
    try {
      // Generate mutation promises
      const promises = rows.map(row => {
        try {
          // 모든 필드 명시적으로 문자열로 변환
          const input = {
            agency: toSafeString(searchInfo.agency),
            agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
            name: toSafeString(row.NAME),
            openday: toSafeString(searchInfo.openday),
            eval_date: toSafeString(searchInfo.eval_date),
            ptcprogram: toSafeString(searchInfo.ptcprogram),
            prevent_contents: toSafeString(searchInfo.prevent_contents),
            pv: toSafeString(searchInfo.pv),
            past_stress_experience: toSafeString(row.PAST_STRESS_EXPERIENCE),
            participation_period: toSafeString(row.PARTICIPATION_PERIOD),
            prevent_seq: row.PREVENT_SEQ ? parseInt(row.PREVENT_SEQ, 10) : null,
            sex: toSafeString(row.SEX),
            age: toSafeString(row.AGE),
            residence: toSafeString(row.RESIDENCE),
            job: toSafeString(row.JOB),
            // 점수 필드 문자열 변환
            score1: toSafeString(row.SCORE1),
            score2: toSafeString(row.SCORE2),
            score3: toSafeString(row.SCORE3),
            score4: toSafeString(row.SCORE4),
            score5: toSafeString(row.SCORE5),
            score6: toSafeString(row.SCORE6),
            score7: toSafeString(row.SCORE7),
            score8: toSafeString(row.SCORE8),
            score9: toSafeString(row.SCORE9),
            score10: toSafeString(row.SCORE10),
            score11: toSafeString(row.SCORE11),
            score12: toSafeString(row.SCORE12),
            score13: toSafeString(row.SCORE13),
            score14: toSafeString(row.SCORE14)
          };

          // 데이터베이스 ID가 있으면 업데이트, 없으면 생성
          if (row.PREVENT_SEQ) {
            console.log(`Updating existing record with PREVENT_SEQ: ${row.PREVENT_SEQ}, name: ${row.NAME}`);
            return updatePreventForm({
              variables: {
                id: parseInt(row.PREVENT_SEQ, 10),
                input
              }
            });
          } else {
            console.log(`Creating new record for name: ${row.NAME}`);
            return createPreventForm({
              variables: {
                input
              }
            });
          }
        } catch (err) {
          console.error("데이터 변환 중 오류:", err);
          throw err;
        }
      });

      // Execute all mutations
      Promise.all(promises)
        .then((results) => {
          console.log("저장 결과:", results);
          
          if (location.state) {
            Swal.fire({
              icon: 'success',
              title: '확인',
              text: "수정이 완료 되었습니다. 수정/삭제 페이지로 이동합니다.",
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
              setRows([{ ...initRow, id: uuidv4() }]);
              setSearchInfo({
                agency: "",
                agency_id: null,
                openday: "",
                eval_date: "",
                ptcprogram: "",
                prevent_contents: "",
                pv: "",
                past_stress_experience: "",
                participation_period: ""
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
    } catch (error) {
      console.error("전체 저장 로직 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `예상치 못한 오류가 발생했습니다: ${error.message}`,
      });
    }
  };

  const onSearch = () => {
    // 적어도 기관명이나 기관ID 중 하나는 있어야 함
    if (!searchInfo.agency && !searchInfo.agency_id) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "검색하려면 적어도 기관명을 입력해 주십시오."
      });
      return;
    }
    
    console.log("Search parameters:", {
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    });
    
    // 쿼리 변수 명시적으로 설정 (null 값은 자동으로 제외됨)
    refetch({
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    })
    .then(result => {
      console.log("Search result from API:", result);
      
      if (!result.data || !result.data.getPreventForms || result.data.getPreventForms.length === 0) {
        console.log("No data found, resetting table");
        // Clear rows when no results are found
        setRows([{ ...initRow, id: uuidv4() }]);
        
        Swal.fire({ 
          icon: 'info', 
          title: '결과 없음', 
          text: "검색 조건에 맞는 데이터가 없습니다." 
        });
      } else {
        console.log("Data found, transforming for table");
        // Transform API data to local state
        const transformedData = transformPreventData(result.data);
        setRows(transformedData);
      }
    })
    .catch(error => {
      console.error("검색 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `데이터 검색 중 오류가 발생했습니다: ${error.message}`
      });
    });
  };

  const onChangeExcel = (value) => {
    if (!value || !value.data || value.data.length === 0) {
      return;
    }
    
    try {
      // Process Excel data for table
      const transformedRows = value.data.map((row, idx) => ({
        id: uuidv4(),
        chk: false,
        PREVENT_SEQ: (idx + 1).toString(),
        NAME: row.col0 || "",
        SEX: row.col1 || "미기재",
        AGE: row.col2 ? row.col2.toString() : "",
        RESIDENCE: row.col3 || "미기재",
        JOB: row.col4 || "",
        PAST_STRESS_EXPERIENCE: row.col5 || "",
        PARTICIPATION_PERIOD: row.col6 || "",
        SCORE1: row.col7 || "",
        SCORE2: row.col8 || "",
        SCORE3: row.col9 || "",
        SCORE4: row.col10 || "",
        SCORE5: row.col11 || "",
        SCORE6: row.col12 || "",
        SCORE7: row.col13 || "",
        SCORE8: row.col14 || "",
        SCORE9: row.col15 || "",
        SCORE10: row.col16 || "",
        SCORE11: row.col17 || "",
        SCORE12: row.col18 || "",
        SCORE13: row.col19 || "",
        SCORE14: row.col20 || ""
      }));
      
      // Update local state
      setRows(transformedRows);
      
      Swal.fire({
        icon: 'success',
        title: '데이터 가져오기 성공',
        text: `${transformedRows.length}개의 항목을 가져왔습니다.`
      });
    } catch (error) {
      console.error("Excel 데이터 처리 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `Excel 데이터 처리 중 오류가 발생했습니다: ${error.message}`
      });
    }
  };

  const onChangeSearchInfo = (name, value) => {
    setSearchInfo(prev => ({ ...prev, [name]: value }));
  };

  // Transform API data to table format
  const transformPreventData = (apiData) => {
    console.log("API Data received:", apiData);
    
    if (!apiData || !apiData.getPreventForms || apiData.getPreventForms.length === 0) {
      console.log("No prevent forms found in API data");
      return [{ ...initRow, id: uuidv4() }];
    }
    
    // Load all forms
    const formData = apiData.getPreventForms;
    console.log("Form data:", formData);
    
    // The API response structure is flat - each form item in the array is a single entry
    // We don't have a nested entries array
    const allEntries = formData.map(form => {
      console.log(`Processing form data: id=${form.id}, prevent_seq=${form.prevent_seq || 'not set'}`);
      
      return ({
        id: form.id ? String(form.id) : uuidv4(),
        chk: false,
        PREVENT_SEQ: form.prevent_seq ? String(form.prevent_seq) : String(form.id), // Use ID as PREVENT_SEQ if prevent_seq doesn't exist
        NAME: form.name || "",
        SEX: form.sex || "미기재",
        AGE: form.age || "",
        RESIDENCE: form.residence || "미기재",
        JOB: form.job || "",
        PAST_STRESS_EXPERIENCE: form.past_stress_experience || "",
        PARTICIPATION_PERIOD: form.participation_period || "",
        SCORE1: form.score1 || "",
        SCORE2: form.score2 || "",
        SCORE3: form.score3 || "",
        SCORE4: form.score4 || "",
        SCORE5: form.score5 || "",
        SCORE6: form.score6 || "",
        SCORE7: form.score7 || "",
        SCORE8: form.score8 || "",
        SCORE9: form.score9 || "",
        SCORE10: form.score10 || "",
        SCORE11: form.score11 || "",
        SCORE12: form.score12 || "",
        SCORE13: form.score13 || "",
        SCORE14: form.score14 || ""
      });
    });
    
    console.log("Transformed entries for table:", allEntries);
    console.log("First entry PREVENT_SEQ value:", allEntries.length > 0 ? allEntries[0].PREVENT_SEQ : "No entries");
    
    // Update search info with the most recent form data
    const mostRecentForm = formData[0];
    setSearchInfo(prev => {
      const updatedInfo = {
        ...prev,
        agency: mostRecentForm.agency || prev.agency,
        agency_id: mostRecentForm.agency_id || prev.agency_id,
        openday: mostRecentForm.openday || prev.openday,
        eval_date: mostRecentForm.eval_date || prev.eval_date,
        ptcprogram: mostRecentForm.ptcprogram || prev.ptcprogram,
        prevent_contents: mostRecentForm.prevent_contents || prev.prevent_contents,
        pv: mostRecentForm.pv || prev.pv,
        past_stress_experience: mostRecentForm.past_stress_experience || prev.past_stress_experience,
        participation_period: mostRecentForm.participation_period || prev.participation_period
      };
      console.log("Updated search info:", updatedInfo);
      return updatedInfo;
    });
    
    // 데이터가 로드되었으면 성공 메시지 표시
    if (allEntries.length > 0) {
      Swal.fire({
        icon: 'success',
        title: '데이터 로드 완료',
        text: `${allEntries.length}개의 이전 데이터를 불러왔습니다.`
      });
    }
    
    return allEntries;
  };

  // 로컬 데이터 처리 함수들
  const handleAddRow = () => {
    setRows(prev => [...prev, { ...initRow, id: uuidv4() }]);
  };

  const handleRemoveRow = () => {
    const selectedRows = rows.filter(row => row.chk);
    
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '선택 필요',
        text: '삭제할 행을 선택해주세요.'
      });
      return;
    }
    
    Swal.fire({
      icon: 'question',
      title: '확인',
      text: `${selectedRows.length}개 항목을 삭제하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오'
    }).then((result) => {
      if (result.isConfirmed) {
        // 삭제할 행의 ID 가져오기
        const deletedSeqs = selectedRows
          .filter(row => row.PREVENT_SEQ)
          .map(row => row.PREVENT_SEQ);
        
        // 현재 삭제 목록에 추가
        setDeleteRows(prev => [...prev, ...deletedSeqs]);
        
        // UI에서 먼저 제거
        const selectedIds = selectedRows.map(row => row.id);
        setRows(prev => prev.filter(row => !selectedIds.includes(row.id)));
        
        // 서버에서 삭제 (PREVENT_SEQ가 있는 항목만)
        if (deletedSeqs.length > 0) {
          console.log(`${deletedSeqs.length}개 항목 서버에서 삭제 시작`);
          
          // 각 항목에 대해 DELETE mutation 실행
          const deletePromises = deletedSeqs.map(seq => {
            return deletePreventForm({
              variables: { id: parseInt(seq, 10) }
            });
          });
          
          // 모든 DELETE 요청이 완료된 후 처리
          Promise.all(deletePromises)
            .then(results => {
              console.log("서버 삭제 결과:", results);
              Swal.fire({
                icon: 'success',
                title: '삭제 완료',
                text: `${deletedSeqs.length}개 항목이 삭제되었습니다.`,
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
  };

  const handleChangeValue = (idx, name, value) => {
    setRows(prev => 
      prev.map((row, index) => 
        index === idx ? { ...row, [name]: value } : row
      )
    );
  };

  const handleCheckChange = (idx, checked) => {
    setRows(prev => 
      prev.map((row, index) => 
        index === idx ? { ...row, chk: checked } : row
      )
    );
  };

  const handleSetAllData = (type, value) => {
    console.log('[Prevent] setAllData 호출됨:', type, value?.length);
    
    // 'all' 타입 처리 - 전체 데이터 교체 (참가자 정보 일괄 적용 시)
    if (type === 'all' && Array.isArray(value)) {
      console.log(`[Prevent] setAllData: 전체 ${value.length}개 행 업데이트`);
      
      // 각 행에 필요한 기본 필드 확인 및 추가
      const processedRows = value.map(row => {
        return {
          ...initRow,  // 기본 필드
          ...row,      // 새 데이터
          id: row.idx || row.id || uuidv4(),  // idx 필드 보장
        };
      });
      
      setRows(processedRows);
      return;
    }
    
    // 객체 형식 처리 ({type: 'all', value: [...]} 형식)
    if (typeof type === 'object' && type.type === 'all' && Array.isArray(type.value)) {
      console.log(`[Prevent] setAllData: 객체 형식으로 전체 ${type.value.length}개 행 업데이트`);
      
      const processedRows = type.value.map(row => {
        return {
          ...initRow,  // 기본 필드
          ...row,      // 새 데이터
          id: row.id || row.idx || uuidv4(),  // id 필드 보장
        };
      });
      
      setRows(processedRows);
      return;
    }
    
    // 체크된 항목에 값 설정 - 기존 로직
    const checkedRows = rows.filter(item => item.chk);
    
    if (checkedRows.length === 0) {
      Swal.fire({ icon: 'warning', title: '확인', text: '선택된 항목이 없습니다' });
      return;
    }
    
    const newRows = [...rows];
    checkedRows.forEach(row => {
      const idx = newRows.findIndex(r => r.id === row.id);
      if (idx !== -1) {
        newRows[idx][type] = value;
      }
    });
    
    setRows(newRows);
  };

  // Render the component
  return (
    <>
      <MainCard style={{ marginTop: "10px" }}>
        {/* Search Info Section - All inputs in a single row */}
        <Grid container spacing={2} alignItems={"center"} style={{ marginBottom: "15px" }}>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={organizations}
              getOptionLabel={(option) => option.group_name || ''}
              value={selectedAgency || null}
              onChange={handleOrganizationChange}
              loading={orgLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="기관명"
                  size="small"
                  error={!!orgLoading}
                  helperText={orgLoading ? "데이터를 불러오는 중..." : ""}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker 
              value={searchInfo.openday} 
              onChange={(key, value) => onChangeSearchInfo('openday', value)} 
              label="시작일자" 
              name="openday" 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker 
              label="실시일자" 
              value={searchInfo.eval_date} 
              onChange={(key, value) => onChangeSearchInfo('eval_date', value)} 
              name="eval_date"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Select 
              options={["사전", "사후"]} 
              label="시점" 
              name="pv" 
              value={searchInfo.pv || ""} 
              onChange={(e) => onChangeSearchInfo(e.target.name, e.target.value)}
            />
          </Grid>
        </Grid>
        <div style={{ marginTop: "10px" }}>
          <ServiceFormToolbar
            onSearch={onSearch}
            onSave={onSave}
            onDataProcessed={onChangeExcel}
            startRow={3}
            type="prevent"
          />
        </div>
      </MainCard>
      
      <MainCard style={{ marginTop: "10px", minHeight: "400px" }}>
        {/* Insert Form */}
        <InsertForm 
          ref={insertFormRef}
          rows={rows}
          onAdd={handleAddRow}
          onRemove={handleRemoveRow}
          onCheckChange={handleCheckChange}
          onChange={handleChangeValue}
          onChangeValue={handleChangeValue}
          setAllData={handleSetAllData}
        />
      </MainCard>
    </>
  );
});

export default Prevent;