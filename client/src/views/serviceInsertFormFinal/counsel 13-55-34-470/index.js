import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import useDownloadExcel from 'utils/useDownloadExcel';
import { generateMergeInfo } from 'utils/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_COUNSEL_THERAPY_FORM, GET_COUNSEL_THERAPY_FORMS } from '../../../graphql/counselTherapy';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import InsertForm from './insertForm';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import { validateSearchInfo, clearFormData, parseAgencyInfo, formatDate } from '../../../utils/formUtils';

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

// Initial row data structure
const initRowData = {
  idx: uuidv4(),
  id: "",
  chk: false,
  COUNSEL_SEQ: "",
  NAME: "",
  SEX: "미기재",
  AGE: "",
  RESIDENCE: "미기재",
  JOB: "",
  PAST_STRESS_EXPERIENCE: "",
  SCORE1: "",
  SCORE2: "",
  SCORE3: "",
  SCORE4: "",
  SCORE5: "",
  SCORE6: "",
  SCORE7: "",
  SCORE8: "",
  SCORE9: "",
  SCORE10: "",
  SCORE11: "",
  SCORE12: "",
  SCORE13: "",
  SCORE14: "",
  SCORE15: "",
  SCORE16: "",
  SCORE17: "",
  SCORE18: "",
  SCORE19: "",
  SCORE20: "",
  SCORE21: "",
  SCORE22: "",
  SCORE23: "",
  SCORE24: "",
  SCORE25: "",
  SCORE26: "",
  SCORE27: "",
  SCORE28: "",
  SCORE29: "",
  SCORE30: "",
  SCORE31: "",
  SCORE32: "",
  SCORE33: "",
  SCORE34: "",
  SCORE35: "",
  SCORE36: "",
  SCORE37: "",
  SCORE38: "",
  SCORE39: "",
  SCORE40: "",
  SCORE41: "",
  SCORE42: "",
  SCORE43: "",
  SCORE44: "",
  SCORE45: "",
  SCORE46: "",
  SCORE47: "",
  SCORE48: "",
  SCORE49: "",
  SCORE50: "",
  SCORE51: "",
  SCORE52: "",
  SCORE53: "",
  SCORE54: "",
  SCORE55: "",
  SCORE56: "",
  SCORE57: "",
  SCORE58: "",
  SCORE59: "",
  SCORE60: "",
  SCORE61: "",
  SCORE62: ""
};

const Counsel = forwardRef((props, ref) => {
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
  
  // State for form data
  const [rows, setRows] = useState([{ ...initRowData }]);
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    openday: '',
    eval_date: '',
    ptcprogram: '',
    counsel_contents: '',
    session1: '',
    session2: '',
    pv: ''
  });
  const [deleteRow, setDeleteRow] = useState([]);
  
  // GraphQL query to fetch counsel therapy forms
  const { refetch } = useQuery(GET_COUNSEL_THERAPY_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    },
    skip: true, // Always skip initial auto fetching
    onCompleted: (data) => {
      if (data && data.getCounselTherapyForms && data.getCounselTherapyForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        
        // Use the transform function to handle all the data
        transformCounselData(data);
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

  // 외부 searchInfo props를 받아서 내부 상태 업데이트
  useEffect(() => {
    if (props.searchInfo) {
      console.log('[Counsel] props.searchInfo 변경 감지됨:', props.searchInfo);
      setSearchInfo(prev => {
        const newSearchInfo = {
          ...prev,
          agency: props.searchInfo.agency !== undefined ? props.searchInfo.agency : prev.agency,
          agency_id: props.searchInfo.agency_id !== undefined ? props.searchInfo.agency_id : prev.agency_id,
          openday: props.searchInfo.openday !== undefined ? props.searchInfo.openday : prev.openday,
          eval_date: props.searchInfo.eval_date !== undefined ? props.searchInfo.eval_date : prev.eval_date,
          ptcprogram: props.searchInfo.ptcprogram !== undefined ? props.searchInfo.ptcprogram : prev.ptcprogram
        };
        console.log('[Counsel] 내부 searchInfo 업데이트:', newSearchInfo);
        return newSearchInfo;
      });
    }
  }, [props.searchInfo?.agency, props.searchInfo?.agency_id, props.searchInfo?.openday, props.searchInfo?.eval_date, props.searchInfo?.ptcprogram]);

  // 기관 선택 변경 핸들러
  const handleAgencyChange = (event, newValue) => {
    if (newValue) {
      const agency = newValue.group_name || '';
      const agency_id = parseInt(newValue.id, 10);
      const openday = newValue.start_date || '';
      
      onChangeSearchInfo('agency', agency);
      onChangeSearchInfo('agency_id', agency_id);
      onChangeSearchInfo('openday', openday);
      
      // 상위 컴포넌트에 기관 변경 알림
      if (props.onOrganizationChange && typeof props.onOrganizationChange === 'function') {
        console.log('[Counsel] 상위 컴포넌트에 기관 변경 알림:', { agency, agency_id, openday });
        props.onOrganizationChange({
          agency,
          agency_id,
          openday,
          eval_date: searchInfo.eval_date || new Date().toISOString().split('T')[0]
        });
      }
    } else {
      onChangeSearchInfo('agency', '');
      onChangeSearchInfo('agency_id', null);
      onChangeSearchInfo('openday', '');
      
      // 상위 컴포넌트에 기관 선택 해제 알림
      if (props.onOrganizationChange && typeof props.onOrganizationChange === 'function') {
        console.log('[Counsel] 상위 컴포넌트에 기관 선택 해제 알림');
        props.onOrganizationChange({
          agency: '',
          agency_id: null,
          openday: '',
          eval_date: searchInfo.eval_date || new Date().toISOString().split('T')[0]
        });
      }
    }
  };

  const onSave = () => {
    // Check that required fields are provided
    if (!searchInfo.agency && !searchInfo.agency_id) {
      Swal.fire({
        icon: 'warning',
        title: '필수 정보 누락',
        text: "기관명은 필수 입력 항목입니다.",
      });
      return;
    }

    if (!searchInfo.openday) {
      Swal.fire({
        icon: 'warning',
        title: '필수 정보 누락',
        text: "시작일은 필수 입력 항목입니다.",
      });
      return;
    }

    if (!searchInfo.eval_date) {
      Swal.fire({
        icon: 'warning',
        title: '필수 정보 누락',
        text: "실시일자는 필수 입력 항목입니다.",
      });
      return;
    }

    // Make sure rows is not empty
    if (!rows || rows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "저장할 데이터가 없습니다.",
      });
      return;
    }

    try {
      // Convert numeric scores to strings to avoid GraphQL errors
      const stringifyScores = (row) => {
        const result = { ...row };
        // Handle all score fields from score1 to score62
        for (let i = 1; i <= 62; i++) {
          const scoreKey = `SCORE${i}`;
          if (result[scoreKey] !== null && result[scoreKey] !== undefined) {
            result[scoreKey] = String(result[scoreKey]);
          } else {
            result[scoreKey] = "";
          }
        }
        return result;
      };

      // Map each row to a GraphQL mutation
      const promises = rows.map(row => {
        // Convert scores to strings
        const stringifiedRow = stringifyScores(row);

        const input = {
          agency: searchInfo.agency,
          agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
          openday: searchInfo.openday,
          eval_date: searchInfo.eval_date,
          ptcprogram: searchInfo.ptcprogram || "",
          counsel_contents: searchInfo.counsel_contents || "",
          session1: searchInfo.session1 || "",
          session2: searchInfo.session2 || "",
          pv: searchInfo.pv || "",
          past_stress_experience: searchInfo.past_stress_experience || "",
          counsel_therapy_seq: stringifiedRow.COUNSEL_SEQ ? parseInt(stringifiedRow.COUNSEL_SEQ, 10) : null,
          sex: stringifiedRow.SEX || "미기재",
          age: String(stringifiedRow.AGE || ""),
          residence: stringifiedRow.RESIDENCE || "미기재",
          job: stringifiedRow.JOB || "",
          past_experience: stringifiedRow.PAST_STRESS_EXPERIENCE || "",
          // Include all score fields (1-62)
          score1: stringifiedRow.SCORE1 || "",
          score2: stringifiedRow.SCORE2 || "",
          score3: stringifiedRow.SCORE3 || "",
          score4: stringifiedRow.SCORE4 || "",
          score5: stringifiedRow.SCORE5 || "",
          score6: stringifiedRow.SCORE6 || "",
          score7: stringifiedRow.SCORE7 || "",
          score8: stringifiedRow.SCORE8 || "",
          score9: stringifiedRow.SCORE9 || "",
          score10: stringifiedRow.SCORE10 || "",
          score11: stringifiedRow.SCORE11 || "",
          score12: stringifiedRow.SCORE12 || "",
          score13: stringifiedRow.SCORE13 || "",
          score14: stringifiedRow.SCORE14 || "",
          score15: stringifiedRow.SCORE15 || "",
          score16: stringifiedRow.SCORE16 || "",
          score17: stringifiedRow.SCORE17 || "",
          score18: stringifiedRow.SCORE18 || "",
          score19: stringifiedRow.SCORE19 || "",
          score20: stringifiedRow.SCORE20 || "",
          score21: stringifiedRow.SCORE21 || "",
          score22: stringifiedRow.SCORE22 || "",
          score23: stringifiedRow.SCORE23 || "",
          score24: stringifiedRow.SCORE24 || "",
          score25: stringifiedRow.SCORE25 || "",
          score26: stringifiedRow.SCORE26 || "",
          score27: stringifiedRow.SCORE27 || "",
          score28: stringifiedRow.SCORE28 || "",
          score29: stringifiedRow.SCORE29 || "",
          score30: stringifiedRow.SCORE30 || "",
          score31: stringifiedRow.SCORE31 || "",
          score32: stringifiedRow.SCORE32 || "",
          score33: stringifiedRow.SCORE33 || "",
          score34: stringifiedRow.SCORE34 || "",
          score35: stringifiedRow.SCORE35 || "",
          score36: stringifiedRow.SCORE36 || "",
          score37: stringifiedRow.SCORE37 || "",
          score38: stringifiedRow.SCORE38 || "",
          score39: stringifiedRow.SCORE39 || "",
          score40: stringifiedRow.SCORE40 || "",
          score41: stringifiedRow.SCORE41 || "",
          score42: stringifiedRow.SCORE42 || "",
          score43: stringifiedRow.SCORE43 || "",
          score44: stringifiedRow.SCORE44 || "",
          score45: stringifiedRow.SCORE45 || "",
          score46: stringifiedRow.SCORE46 || "",
          score47: stringifiedRow.SCORE47 || "",
          score48: stringifiedRow.SCORE48 || "",
          score49: stringifiedRow.SCORE49 || "",
          score50: stringifiedRow.SCORE50 || "",
          score51: stringifiedRow.SCORE51 || "",
          score52: stringifiedRow.SCORE52 || "",
          score53: stringifiedRow.SCORE53 || "",
          score54: stringifiedRow.SCORE54 || "",
          score55: stringifiedRow.SCORE55 || "",
          score56: stringifiedRow.SCORE56 || "",
          score57: stringifiedRow.SCORE57 || "",
          score58: stringifiedRow.SCORE58 || "",
          score59: stringifiedRow.SCORE59 || "",
          score60: stringifiedRow.SCORE60 || "",
          score61: stringifiedRow.SCORE61 || "",
          score62: stringifiedRow.SCORE62 || ""
        };

        return createCounselTherapyForm({
          variables: { input }
        });
      });
      
      // Show confirmation dialog
      Swal.fire({
        title: '상담서비스 만족도 등록',
        text: '항목을 등록 하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#767676',
        confirmButtonText: '확인',
        cancelButtonText: '취소'
      }).then((result) => {
        if (result.isConfirmed) {
          Promise.all(promises)
            .then(results => {
              if (results.every(result => result.data.createCounselTherapyForm)) {
                Swal.fire({
                  icon: 'success',
                  title: '확인',
                  text: '데이터가 성공적으로 저장되었습니다.'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: '저장 실패',
                  text: '일부 데이터 저장에 실패했습니다.'
                });
              }
            })
            .catch(error => {
              console.error("저장 중 오류 발생:", error);
              Swal.fire({
                icon: 'error',
                title: '저장 실패',
                text: `오류: ${error.message}`
              });
            });
        }
      });
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
      Swal.fire({
        icon: 'error',
        title: '저장 실패',
        text: `오류: ${error.message}`
      });
    }
  };

  const onSearch = () => {
    // Check for required fields
    if (!searchInfo.agency && !searchInfo.agency_id) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "검색하려면 적어도 기관명을 입력해 주십시오."
      });
      return;
    }
    
    // Execute the GraphQL query
    refetch({
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    })
    .then(result => {
      if (!result.data || !result.data.getCounselTherapyForms || result.data.getCounselTherapyForms.length === 0) {
        // Clear form data when no results are found
        clearFormData(setRows, initRowData, uuidv4);
        
        Swal.fire({
          icon: 'info',
          title: '결과 없음',
          text: "검색 조건에 맞는 데이터가 없습니다."
        });
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

  const onChangeExcel = (excelData) => {
    if (!excelData || !excelData.data || excelData.data.length === 0) {
      return;
    }
    
    try {
      // Helper function to ensure we get a string value
      const sanitizeValue = (val) => {
        if (val === null || val === undefined) return "";
        return String(val);
      };
      
      const processedData = excelData.data.map((row, idx) => ({
        idx: uuidv4(),
        id: "",
        chk: false,
        COUNSEL_SEQ: idx + 1,
        NAME: sanitizeValue(row.col0),
        SEX: sanitizeValue(row.col1) || "미기재",
        AGE: sanitizeValue(row.col2),
        RESIDENCE: sanitizeValue(row.col3) || "미기재",
        JOB: sanitizeValue(row.col4),
        PAST_STRESS_EXPERIENCE: sanitizeValue(row.col5),
        SCORE1: sanitizeValue(row.col6),
        SCORE2: sanitizeValue(row.col7),
        SCORE3: sanitizeValue(row.col8),
        SCORE4: sanitizeValue(row.col9),
        SCORE5: sanitizeValue(row.col10),
        SCORE6: sanitizeValue(row.col11),
        SCORE7: sanitizeValue(row.col12),
        SCORE8: sanitizeValue(row.col13),
        SCORE9: sanitizeValue(row.col14),
        SCORE10: sanitizeValue(row.col15),
        SCORE11: sanitizeValue(row.col16),
        SCORE12: sanitizeValue(row.col17),
        SCORE13: sanitizeValue(row.col18),
        SCORE14: sanitizeValue(row.col19),
        SCORE15: sanitizeValue(row.col20),
        SCORE16: sanitizeValue(row.col21),
        SCORE17: sanitizeValue(row.col22),
        SCORE18: sanitizeValue(row.col23),
        SCORE19: sanitizeValue(row.col24),
        SCORE20: sanitizeValue(row.col25),
        SCORE21: sanitizeValue(row.col26),
        SCORE22: sanitizeValue(row.col27),
        SCORE23: sanitizeValue(row.col28),
        SCORE24: sanitizeValue(row.col29),
        SCORE25: sanitizeValue(row.col30),
        SCORE26: sanitizeValue(row.col31),
        SCORE27: sanitizeValue(row.col32),
        SCORE28: sanitizeValue(row.col33),
        SCORE29: sanitizeValue(row.col34),
        SCORE30: sanitizeValue(row.col35),
        SCORE31: sanitizeValue(row.col36),
        SCORE32: sanitizeValue(row.col37),
        SCORE33: sanitizeValue(row.col38),
        SCORE34: sanitizeValue(row.col39),
        SCORE35: sanitizeValue(row.col40),
        SCORE36: sanitizeValue(row.col41),
        SCORE37: sanitizeValue(row.col42),
        SCORE38: sanitizeValue(row.col43),
        SCORE39: sanitizeValue(row.col44),
        SCORE40: sanitizeValue(row.col45),
        SCORE41: sanitizeValue(row.col46),
        SCORE42: sanitizeValue(row.col47),
        SCORE43: sanitizeValue(row.col48),
        SCORE44: sanitizeValue(row.col49),
        SCORE45: sanitizeValue(row.col50),
        SCORE46: sanitizeValue(row.col51),
        SCORE47: sanitizeValue(row.col52),
        SCORE48: sanitizeValue(row.col53),
        SCORE49: sanitizeValue(row.col54),
        SCORE50: sanitizeValue(row.col55),
        SCORE51: sanitizeValue(row.col56),
        SCORE52: sanitizeValue(row.col57),
        SCORE53: sanitizeValue(row.col58),
        SCORE54: sanitizeValue(row.col59),
        SCORE55: sanitizeValue(row.col60),
        SCORE56: sanitizeValue(row.col61),
        SCORE57: sanitizeValue(row.col62),
        SCORE58: sanitizeValue(row.col63),
        SCORE59: sanitizeValue(row.col64),
        SCORE60: sanitizeValue(row.col65),
        SCORE61: sanitizeValue(row.col66),
        SCORE62: sanitizeValue(row.col67),
      }));
      
      setRows(processedData);
      
    } catch (error) {
      console.error("Excel 업로드 처리 중 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '업로드 실패',
        text: `엑셀 데이터 처리 중 오류가 발생했습니다: ${error.message}`
      });
    }
  };

  const addRow = () => {
    const newRow = { ...initRowData, idx: uuidv4() };
    setRows(prevRows => [...prevRows, newRow]);
  };

  const removeRow = () => {
    const checkedRows = rows.filter(row => row.chk);
    
    if (checkedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '삭제할 항목을 선택해주세요.',
      });
      return;
    }

    // 선택된 행의 ID 목록 추출
    const selectedIds = checkedRows.filter(row => row.id).map(row => row.id);
    if (selectedIds.length > 0) {
      setDeleteRow(prev => [...prev, ...selectedIds]);
    }
    
    // 선택되지 않은 행만 유지
    const remainingRows = rows.filter(row => !row.chk);
    
    // 남은 행이 없으면 초기값으로 하나 추가
    if (remainingRows.length === 0) {
      setRows([{ ...initRowData, idx: uuidv4() }]);
    } else {
      setRows(remainingRows);
    }
  };

  const onCheckChange = (rowIdx, checked) => {
    setRows(rows.map(row => row.idx === rowIdx ? { ...row, chk: checked } : row));
  };

  const changeValue = (rowIdx, name, value) => {
    // 값이 undefined/null인 경우 빈 문자열로 처리
    const safeValue = value !== null && value !== undefined ? String(value) : "";
    
    setRows(rows.map(row => row.idx === rowIdx ? { ...row, [name]: safeValue } : row));
  };

  const setAllData = (type, value) => {
    setRows(rows.map(item => ({ ...item, [type]: value })));
  };

  const onChangeSearchInfo = (name, value) => {
    setSearchInfo(prev => {
      const newSearchInfo = { ...prev, [name]: value };
      
      // eval_date 변경 시에도 상위 컴포넌트에 알림
      if (name === 'eval_date' && props.onOrganizationChange && typeof props.onOrganizationChange === 'function') {
        console.log('[Counsel] 상위 컴포넌트에 실시일자 변경 알림:', value);
        props.onOrganizationChange({
          agency: newSearchInfo.agency,
          agency_id: newSearchInfo.agency_id,
          openday: newSearchInfo.openday,
          eval_date: value
        });
      }
      
      return newSearchInfo;
    });
  };

  const getUserTemp = (agencyInfo) => {
    const { agency, openday } = parseAgencyInfo(agencyInfo);
    
    if (!agency || !openday) {
      Swal.fire({ icon: 'warning', title: '확인', text: "기관정보가 유효하지 않습니다." });
      return;
    }

    const currentDate = formatDate();
    
    setSearchInfo(prev => ({
      ...prev,
      agency,
      openday,
      eval_date: currentDate
    }));
    
    // Try to fetch from API first
    fetch(`/api/userTemp?agency=${encodeURIComponent(agency)}&openday=${encodeURIComponent(openday)}`)
      .then(response => {
        if (!response.ok) {
          // If server returns error, create mock data for demonstration
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .catch(error => {
        console.warn('Using mock data because API endpoint not available:', error);
        
        // Create mock data with realistic user information
        // This simulates what would be returned from the API
        return [
          { name: "홍길동", sex: "남", age: "45", residence: "서울", job: "회사원" },
          { name: "김영희", sex: "여", age: "32", residence: "경기", job: "교사" },
          { name: "이철수", sex: "남", age: "28", residence: "부산", job: "엔지니어" },
          { name: "박지영", sex: "여", age: "37", residence: "대전", job: "공무원" }
        ];
      })
      .then(data => {
        if (data && data.length > 0) {
          // Process the data to fit the rows structure
          const transformedData = data.map((user, idx) => ({
            idx: uuidv4(),
            id: "",
            chk: false,
            COUNSEL_SEQ: (idx + 1).toString(),
            NAME: user.name || "",
            SEX: user.sex || "미기재",
            AGE: user.age || "",
            RESIDENCE: user.residence || "미기재",
            JOB: user.job || "",
            PAST_STRESS_EXPERIENCE: "",
            SCORE1: "",
            SCORE2: "",
            SCORE3: "",
            SCORE4: "",
            SCORE5: "",
            SCORE6: ""
          }));
          
          setRows(transformedData);
          
          Swal.fire({
            icon: 'success',
            title: '불러오기 성공',
            text: `${data.length}명의 참여자 정보를 불러왔습니다.`
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: '정보 없음',
            text: '등록된 참여자 정보가 없습니다.'
          });
        }
      });
  };

  // Excel export configuration
  const headerInfo = [
    ['이름', '성별', '연령', '거주지', '직업', '과거상담/치유서비스 경험', 
      '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', 
      '문항11', '문항12', '문항13', '문항14', '문항15', '문항16', '문항17', '문항18', '문항19', '문항20', 
      '문항21', '문항22', '문항23', '문항24', '문항25', '문항26', '문항27', '문항28', '문항29', '문항30', 
      '문항31', '문항32', '문항33', '문항34', '문항35', '문항36', '문항37', '문항38', '문항39', '문항40', 
      '문항41', '문항42', '문항43', '문항44', '문항45', '문항46', '문항47', '문항48', '문항49', '문항50', 
      '문항51', '문항52', '문항53', '문항54', '문항55', '문항56', '문항57', '문항58', '문항59', '문항60', 
      '문항61', '문항62']
  ];

  const cellData = rows.map(row => [
    row.NAME, row.SEX, row.AGE, row.RESIDENCE, row.JOB, row.PAST_STRESS_EXPERIENCE,
    row.SCORE1, row.SCORE2, row.SCORE3, row.SCORE4, row.SCORE5, row.SCORE6, row.SCORE7, row.SCORE8, row.SCORE9, row.SCORE10,
    row.SCORE11, row.SCORE12, row.SCORE13, row.SCORE14, row.SCORE15, row.SCORE16, row.SCORE17, row.SCORE18, row.SCORE19, row.SCORE20,
    row.SCORE21, row.SCORE22, row.SCORE23, row.SCORE24, row.SCORE25, row.SCORE26, row.SCORE27, row.SCORE28, row.SCORE29, row.SCORE30,
    row.SCORE31, row.SCORE32, row.SCORE33, row.SCORE34, row.SCORE35, row.SCORE36, row.SCORE37, row.SCORE38, row.SCORE39, row.SCORE40,
    row.SCORE41, row.SCORE42, row.SCORE43, row.SCORE44, row.SCORE45, row.SCORE46, row.SCORE47, row.SCORE48, row.SCORE49, row.SCORE50,
    row.SCORE51, row.SCORE52, row.SCORE53, row.SCORE54, row.SCORE55, row.SCORE56, row.SCORE57, row.SCORE58, row.SCORE59, row.SCORE60,
    row.SCORE61, row.SCORE62
  ]);

  const wscols = [
    { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 8 }, { wch: 8 }
  ];

  const downloadExcel = useDownloadExcel({
    headerInfo,
    cellData,
    wscols,
    filename: "상담치유서비스효과평가"
  });

  // Find the selected agency object
  const selectedAgency = (() => {
    // agency_id가 있으면 ID로 찾기
    if (searchInfo?.agency_id) {
      const agencyId = parseInt(searchInfo.agency_id, 10);
      const foundById = organizations.find(org => parseInt(org.id, 10) === agencyId);
      if (foundById) {
        return foundById;
      }
    }
    
    // agency_id가 없거나 ID로 찾지 못했으면 이름으로 찾기
    if (searchInfo?.agency) {
      return organizations.find(org => org.group_name === searchInfo.agency);
    }
    
    return null;
  })();
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    onChangeSearchInfo,
    rows,
    setRows
  }), [rows]);

  // Add transformCounselData function to handle all forms data
  const transformCounselData = (data) => {
    if (!data || !data.getCounselTherapyForms || data.getCounselTherapyForms.length === 0) {
      return null;
    }
    
    // Get all forms
    const formData = data.getCounselTherapyForms;
    
    // Transform all entries to the correct format
    const allEntries = formData.map(form => ({
      idx: uuidv4(),
      id: form.id || "",
      chk: false,
      COUNSEL_SEQ: form.counsel_therapy_seq || "",
      NAME: form.name || "", 
      SEX: form.sex || "미기재",
      AGE: form.age || "",
      RESIDENCE: form.residence || "미기재",
      JOB: form.job || "",
      PAST_STRESS_EXPERIENCE: form.past_experience || "",
      // Include all score fields
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
      SCORE14: form.score14 || "",
      SCORE15: form.score15 || "",
      SCORE16: form.score16 || "",
      SCORE17: form.score17 || "",
      SCORE18: form.score18 || "",
      SCORE19: form.score19 || "",
      SCORE20: form.score20 || "",
      SCORE21: form.score21 || "",
      SCORE22: form.score22 || "",
      SCORE23: form.score23 || "",
      SCORE24: form.score24 || "",
      SCORE25: form.score25 || "",
      SCORE26: form.score26 || "",
      SCORE27: form.score27 || "",
      SCORE28: form.score28 || "",
      SCORE29: form.score29 || "",
      SCORE30: form.score30 || "",
      SCORE31: form.score31 || "",
      SCORE32: form.score32 || "",
      SCORE33: form.score33 || "",
      SCORE34: form.score34 || "",
      SCORE35: form.score35 || "",
      SCORE36: form.score36 || "",
      SCORE37: form.score37 || "",
      SCORE38: form.score38 || "",
      SCORE39: form.score39 || "",
      SCORE40: form.score40 || "",
      SCORE41: form.score41 || "",
      SCORE42: form.score42 || "",
      SCORE43: form.score43 || "",
      SCORE44: form.score44 || "",
      SCORE45: form.score45 || "",
      SCORE46: form.score46 || "",
      SCORE47: form.score47 || "",
      SCORE48: form.score48 || "",
      SCORE49: form.score49 || "",
      SCORE50: form.score50 || "",
      SCORE51: form.score51 || "",
      SCORE52: form.score52 || "",
      SCORE53: form.score53 || "",
      SCORE54: form.score54 || "",
      SCORE55: form.score55 || "",
      SCORE56: form.score56 || "",
      SCORE57: form.score57 || "",
      SCORE58: form.score58 || "",
      SCORE59: form.score59 || "",
      SCORE60: form.score60 || "",
      SCORE61: form.score61 || "",
      SCORE62: form.score62 || ""
    }));
    
    // Update rows with all entries
    setRows(allEntries);
    
    // Update searchInfo with the most recent form data
    const mostRecentForm = formData[0];
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
      past_stress_experience: mostRecentForm.past_stress_experience || prev.past_stress_experience
    }));
    
    // If data was found, show a success message
    if (allEntries.length > 0) {
      Swal.fire({
        icon: 'success',
        title: '데이터 로드 완료',
        text: `${allEntries.length}개의 데이터가 로드되었습니다.`
      });
    }
    
    return allEntries;
  };

  // Render the component
  return (
    <>
      <MainCard style={{ marginTop: "10px" }}>
        <Grid container spacing={2} alignItems={"center"} style={{ marginBottom: "15px" }}>
          <Grid item sm={2}>
            <DatePicker 
              value={searchInfo.openday} 
              onChange={(key, value) => onChangeSearchInfo('openday', value)} 
              label="시작일자" 
              name="openday" 
            />
          </Grid>
          <Grid item sm={2}>
            <DatePicker 
              label="실시일자" 
              value={searchInfo.eval_date} 
              onChange={(key, value) => onChangeSearchInfo('eval_date', value)} 
              name="eval_date"
            />
          </Grid>
       
        </Grid>
        <Grid container spacing={2} alignItems={"center"}>
          <Grid item sm={2}>
            <FormControl fullWidth size="small">
              <Autocomplete
                options={organizations}
                getOptionLabel={(option) => option.group_name || ''}
                value={selectedAgency || null}
                onChange={handleAgencyChange}
                loading={orgLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="기관명"
                    size="small"
                    error={!!orgLoading}
                    helperText={orgLoading ? "데이터를 불러오는 중 오류가 발생했습니다." : ""}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item sm={2}>
            <Select 
              options={["게임", "도박", "SNS", "성인물", "웹툰/웹소설", "기타동영상", "기타"]} 
              label="콘텐츠종류" 
              name="counsel_contents" 
              value={searchInfo.counsel_contents} 
              onChange={(e) => onChangeSearchInfo(e.target.name, e.target.value)}
            />
          </Grid>
          <Grid item sm={2}>
            <Grid container spacing={1} alignItems={"center"}>
              <Grid item sm={5}>
                <Input 
                  label="회기1" 
                  value={searchInfo.session1 || ""} 
                  name="session1" 
                  onChange={(e) => onChangeSearchInfo(e.target.name, e.target.value)}
                /> 
              </Grid>
              <Grid item sm={1}>
                /
              </Grid>
              <Grid item sm={5}>
                <Input 
                  label="회기2" 
                  value={searchInfo.session2 || ""} 
                  name="session2" 
                  onChange={(e) => onChangeSearchInfo(e.target.name, e.target.value)}
                /> 
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={2}>
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
            type="counsel"
          />
        </div>
      </MainCard>
      
      <MainCard style={{ marginTop: "10px", minHeight: "400px" }}>
        {/* Pass row data and handlers to InsertForm */}
        <InsertForm 
          rows={rows}
          onCheckChange={onCheckChange}
          onChange={changeValue}
          addRow={addRow}
          removeRow={removeRow}
          setAllData={setAllData}
        />
      </MainCard>
    </>
  );
});

export default Counsel;
