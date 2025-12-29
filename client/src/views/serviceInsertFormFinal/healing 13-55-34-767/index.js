import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_HEALING_FORM, UPDATE_HEALING_FORM, GET_HEALING_FORMS, DELETE_HEALING_FORM } from "../../../graphql/serviceForm";
import Grid from '@mui/material/Grid';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import InsertForm from './insertForm';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress, Button, Autocomplete, TextField } from '@mui/material';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import { validateSearchInfo, parseAgencyInfo, formatDate } from '../../../utils/formUtils';
import { v4 as uuidv4 } from 'uuid';
import DynamicTableRow from "../component/dynamicTableRow";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import SetValue from "../component/setValue";

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

// 프로그램 카테고리 쿼리
const GET_PROGRAM_CATEGORIES = gql`
  query ProgramCategories {
    programCategories {
      id
      category_name
      description
    }
  }
`;

// 프로그램 목록 쿼리
const GET_PROGRAMS_BY_CATEGORY = gql`
  query GetProgramsByCategory($categoryId: Int!) {
    getProgramsByCategory(categoryId: $categoryId) {
      id
      program_name
      category_id
      description
    }
  }
`;

// Initial row data structure
const initRowData = {
  idx: "",
  id: "",
  chk: false,
  healing_seq: "",
  name: "",
  sex: "미기재",
  age: "",
  residence: "미기재",
  job: "",
  past_stress_experience: "",
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
  score22: ""
};

// Create a custom wrapper for DynamicTableRow that handles both idx and index for the onCheckChange
const HealingTableRow = (props) => {
  const { onCheckChange, ...otherProps } = props;
  
  // Create a wrapper function that handles both idx property and array index
  const handleCheckChange = (idx, checked) => {
    console.log(`HealingTableRow: check change for idx=${idx}, checked=${checked}`);
    if (typeof onCheckChange === 'function') {
      // Try to find the row by idx first
      const foundRow = otherProps.rows.find(row => row.idx === idx);
      if (foundRow) {
        // If found by idx, pass the idx
        onCheckChange(idx, checked);
      } else {
        // If not found by idx, assume idx is the array index
        const rowAtIndex = otherProps.rows[idx];
        if (rowAtIndex) {
          onCheckChange(rowAtIndex.idx, checked);
        } else {
          // Fallback to original behavior
          onCheckChange(idx, checked);
        }
      }
    }
  };
  
  return <DynamicTableRow {...otherProps} onCheckChange={handleCheckChange} />;
};

// After the HealingTableRow component and before the Healing component
// Define fields
const fields = [
    {name: 'name', label: "이름", type: "text"},
    {name: 'sex', label: "성별", type: "select"},
    {name: 'age', label: "연령", type: "age"},
    {name: 'residence', label: "거주지", type: "select"},
    {name: 'job', label: "직업", type: "select"},
    {name: 'past_stress_experience', label: "과거 경험", type: "select", options: ["", "없음", "있음"]},
    {name: 'score1', label: "내면화된 수치심(문항1)", type: "sNumber"},
    {name: 'score2', label: "내면화된 수치심(문항2)", type: "sNumber"},
    {name: 'score3', label: "내면화된 수치심(문항3)", type: "sNumber"},
    {name: 'score4', label: "내면화된 수치심(문항4)", type: "sNumber"},
    {name: 'score5', label: "문제해결 능력(문항5)", type: "sNumber"},
    {name: 'score6', label: "문제해결 능력(문항6)", type: "sNumber"},
    {name: 'score7', label: "문제해결 능력(문항7)", type: "sNumber"},
    {name: 'score8', label: "문제해결 능력(문항8)", type: "sNumber"},
    {name: 'score9', label: "인지적 정서조절(문항9)", type: "sNumber"},
    {name: 'score10', label: "인지적 정서조절(문항10)", type: "sNumber"},
    {name: 'score11', label: "인지적 정서조절(문항11)", type: "sNumber"},
    {name: 'score12', label: "인지적 정서조절(문항12)", type: "sNumber"},
    {name: 'score13', label: "회복탄력성(문항13)", type: "sNumber"},
    {name: 'score14', label: "회복탄력성(문항14)", type: "sNumber"},
    {name: 'score15', label: "회복탄력성(문항15)", type: "sNumber"},
    {name: 'score16', label: "회복탄력성(문항16)", type: "sNumber"},
    {name: 'score17', label: "자존감(문항17)", type: "sNumber"},
    {name: 'score18', label: "자존감(문항18)", type: "sNumber"},
    {name: 'score19', label: "자존감(문항19)", type: "sNumber"},
    {name: 'score20', label: "자존감(문항20)", type: "sNumber"},
    {name: 'score21', label: "생활 스트레스(문항21)", type: "sNumber"},
    {name: 'score22', label: "생활 스트레스(문항22)", type: "sNumber"}
];

// Define header structure
const headerInfo = [
    ['선택', '이름', '성별', '연령', '거주지', '직업', '과거경험', '내면화된 수치심', '내면화된 수치심', '내면화된 수치심', '내면화된 수치심', '문제해결 능력', '문제해결 능력', '문제해결 능력', '문제해결 능력', '인지적 정서조절', '인지적 정서조절', '인지적 정서조절', '인지적 정서조절', '회복탄력성', '회복탄력성', '회복탄력성', '회복탄력성', '자존감', '자존감', '자존감', '자존감', '생활 스트레스', '생활 스트레스'],
    ['', '', '', '', '', '', '', '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', '문항11', '문항12', '문항13', '문항14', '문항15', '문항16', '문항17', '문항18', '문항19', '문항20', '문항21', '문항22']
];

const Healing = forwardRef((props, ref) => {
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // 기관 목록 상태
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rows, setRows] = useState([{ ...initRowData, idx: uuidv4() }]);
  const [deleteRow, setDeleteRow] = useState([]);
  
  // State for form data
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    openday: '',
    eval_date: '',
    ptcprogram: '',
    pv: '',
    past_stress_experience: ''
  });

  // 선택된 기관 찾기
  const selectedAgency = searchInfo?.agency_id ? 
    organizations.find(org => org.id === parseInt(searchInfo.agency_id, 10)) : null;

  // 외부에서 접근할 수 있도록 ref 노출
  const insertFormRef = useRef(null);
  
  // 외부 searchInfo props를 받아서 내부 상태 업데이트
  useEffect(() => {
    if (props.searchInfo) {
      console.log('[Healing] 외부 searchInfo props 수신됨:', props.searchInfo);
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
  
  // 외부에서 row 데이터를 설정할 수 있도록 메서드 노출
  const setRowsData = (newRows) => {
    console.log('[Healing] 🔄 setRowsData 호출됨', newRows?.length);
    console.log('[Healing] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
    
    if (!newRows || newRows.length === 0) {
      console.log('[Healing] ⚠️ 빈 rows 데이터, 무시함');
      return;
    }
    
    // row 데이터가 변경되었는지 확인
    const currentIds = rows.map(row => row.idx).join(',');
    const newIds = newRows.map(row => row.idx).join(',');
    
    console.log('[Healing] 🔄 기존 ID:', currentIds);
    console.log('[Healing] 🔄 새 ID:', newIds);
    
    if (currentIds === newIds && rows.length > 0) {
      console.log('[Healing] ℹ️ 동일한 ID의 rows, 변경 없음');
      return;
    }
    
    // 참가자 정보만 있는 경우 필수 필드 추가
    console.log('[Healing] 🔄 행 데이터 처리 시작');
    const processedRows = newRows.map((row, index) => {
      // 기존 행 정보 찾기
      const existingRow = rows.find(r => r.idx === row.idx);
      
      if (existingRow) {
        console.log(`[Healing] 🔄 행 ${index}: 기존 데이터 발견 (idx=${row.idx})`);
      } else {
        console.log(`[Healing] 🔄 행 ${index}: 새 행 생성 (idx=${row.idx})`);
      }
      
      const result = {
        ...initRowData,  // 기본 데이터 구조
        ...existingRow,  // 기존 행 데이터 (있으면)
        ...row,          // 새로운 데이터
        idx: row.idx || uuidv4(),  // idx는 반드시 있어야 함
        chk: row.chk || false,
        past_stress_experience: row.past_stress_experience || (existingRow ? existingRow.past_stress_experience : ""),
      };
      
      console.log(`[Healing] 🔄 행 ${index} 처리 완료: name=${result.name || result.NAME}`);
      return result;
    });
    
    console.log('[Healing] ✅ rows 업데이트:', processedRows.length);
    console.log('[Healing] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
    setRows(processedRows);
  };
  
  // Event handlers for rows manipulation
  const onCheckChange = (idx, checked) => {
    console.log(`Healing: check change for idx=${idx}, checked=${checked}`);
    setRows(prev => 
      prev.map((row, index) => {
        // Support both idx property matching and array index matching
        if (row.idx === idx || index === parseInt(idx)) {
          return { ...row, chk: checked };
        }
        return row;
      })
    );
  };

  const changeValue = (idx, name, value) => {
    console.log(`Healing: value change for idx=${idx}, name=${name}, value=${value}`, new Date().toISOString());
    
    // Create a new rows array with the updated value for the specified row
    const updatedRows = rows.map((row, rowIndex) => {
      if (rowIndex === idx || row.idx === idx) {
        // Create a new row object with the updated value
        return { ...row, [name]: value };
      }
      return row;
    });
    
    // Set the state with the updated rows array
    setRows(updatedRows);
    
    // Force a re-render by triggering a state update
    setTimeout(() => {
      setRows(prevRows => [...prevRows]);
    }, 0);
  };
  
  // Also add aliases for different handler naming conventions
  const onChange = changeValue;
  const onChangeValue = changeValue;

  const addRow = () => {
    console.log("Healing: adding new row");
    setRows(prev => [...prev, { ...initRowData, idx: uuidv4() }]);
  };

  const removeRow = () => {
    const selectedRows = rows.filter(row => row.chk);
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "삭제할 항목을 선택해주세요.",
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
        const selectedIds = selectedRows.map(row => row.idx);
        
        // Get actual healing_seq numbers for deletion from server
        const deletedSeqs = selectedRows
          .filter(row => row.id || row.healing_seq)
          .map(row => row.id || row.healing_seq);
        
        // Save to delete tracking list
        if (deletedSeqs.length > 0) {
          setDeleteRow(prev => [...prev, ...deletedSeqs]);
        }
        
        // Remove from UI first
        setRows(prev => prev.filter(row => !selectedIds.includes(row.idx)));
        
        // Delete from server if there are saved items
        if (deletedSeqs.length > 0) {
          console.log(`${deletedSeqs.length}개 항목 서버에서 삭제 시작`);
          
          // Execute DELETE mutation for each item
          const deletePromises = deletedSeqs.map(id => {
            return deleteHealingForm({
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
  
  const setAllData = (type, value) => {
    console.log(`[Healing] setAllData 호출: type=${type}, value=`, value);
    
    // 'all' 타입일 경우 전체 rows 데이터 업데이트
    if (type === 'all') {
      // 전체 데이터 교체 (참가자 정보 일괄 적용 시)
      if (Array.isArray(value)) {
        console.log(`[Healing] setAllData: 전체 ${value.length}개 행 업데이트`);
        
        // 각 행에 필요한 기본 필드 확인 및 추가
        const processedRows = value.map(row => {
          return {
            ...initRowData,  // 기본 필드
            ...row,          // 새 데이터
            idx: row.idx || uuidv4(),  // idx 필드 보장
            past_stress_experience: row.past_stress_experience || ""  // 기본값 설정
          };
        });
        
        setRows(processedRows);
        return;
      }
    }
    
    // 기존 로직 (문항점수 일괄 적용 등)
    const newRows = [...rows];
    
    // 체크된 행만 처리
    const checkedRows = newRows.filter(row => row.chk);
    
    if (checkedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '선택된 참가자가 없습니다.'
      });
      return;
    }
    
    // 문항별 일괄 입력
    if (type.startsWith('score')) {
      checkedRows.forEach(row => {
        const idx = newRows.findIndex(r => r.idx === row.idx);
        if (idx !== -1) {
          newRows[idx][type] = value;
        }
      });
    }
    
    // 과거 경험 일괄 입력
    else if (type === 'past_stress_experience') {
      checkedRows.forEach(row => {
        const idx = newRows.findIndex(r => r.idx === row.idx);
        if (idx !== -1) {
          newRows[idx][type] = value;
        }
      });
    }
    
    setRows(newRows);
  };
  
  // 컴포넌트 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    setRows: setRowsData,
    rows,
    _insertFormRef: insertFormRef,
    addRow,
    removeRow,
    changeValue,
    onChange,
    onChangeValue,
    onCheckChange,
    setAllData,
    onChangeSearchInfo,
    forceUpdate: () => {
      const currentRows = [...rows];
      setRows(currentRows);
    }
  }), [rows, insertFormRef, addRow, removeRow, changeValue, onChange, onChangeValue, onCheckChange, setAllData]);
  
  // 기관 목록 조회
  const { loading: orgLoading } = useQuery(GET_ORGANIZATION_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getPage1List) {
        setOrganizations(data.getPage1List);
      }
    }
  });
  
  // 프로그램 카테고리 조회
  const { loading: programCategoryLoading, refetch: refetchPrograms } = useQuery(GET_PROGRAM_CATEGORIES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.programCategories) {
        setCategories(data.programCategories);
        console.log("카테고리 목록 로드됨:", data.programCategories);
      }
    },
    onError: (err) => {
      console.error("프로그램 카테고리 조회 오류:", err);
    }
  });
  
  // 선택된 카테고리에 따라 프로그램 목록 조회
  const { loading: programLoading, refetch: refetchProgramsByCategory } = useQuery(GET_PROGRAMS_BY_CATEGORY, {
    variables: { categoryId: selectedCategory ? parseInt(selectedCategory, 10) : 0 },
    skip: !selectedCategory,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getProgramsByCategory) {
        console.log("프로그램 목록 로드됨:", data.getProgramsByCategory);
        setPrograms(data.getProgramsByCategory);
      }
    },
    onError: (err) => {
      console.error("프로그램 목록 조회 오류:", err);
    }
  });
  
  // 카테고리 변경 시 프로그램 목록 다시 조회
  useEffect(() => {
    if (selectedCategory) {
      console.log('Fetching programs for category:', selectedCategory);
      refetchProgramsByCategory({ categoryId: parseInt(selectedCategory, 10) });
    }
  }, [selectedCategory, refetchProgramsByCategory]);
  
  // When ptcprogram changes, find matching category if not already selected
  useEffect(() => {
    if (searchInfo.ptcprogram && programs.length > 0) {
      const matchingProgram = programs.find(p => p.program_name === searchInfo.ptcprogram);
      if (matchingProgram && !selectedCategory) {
        console.log('Found matching program category:', matchingProgram.category_id);
        setSelectedCategory(String(matchingProgram.category_id));
      }
    }
  }, [searchInfo.ptcprogram, programs, selectedCategory]);

  // GraphQL query to fetch healing forms
  const { refetch } = useQuery(GET_HEALING_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    },
    skip: true,
    onCompleted: (data) => {
      if (data && data.getHealingForms && data.getHealingForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러쵸니다." });
        transformHealingData(data);
      } else if (searchInfo.agency && searchInfo.openday && searchInfo.eval_date) {
          Swal.fire({ icon: 'warning', title: '확인', text: "기존 입력된 데이터가 없습니다." });
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
  const [createHealingForm] = useMutation(CREATE_HEALING_FORM, {
    onCompleted: (data) => {
      if (data.createHealingForm) {
        console.log("등록 성공:", data.createHealingForm);
        // Individual success is handled by Promise.all
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

  const [updateHealingForm] = useMutation(UPDATE_HEALING_FORM, {
    onCompleted: (data) => {
      if (data.updateHealingForm) {
        console.log("업데이트 성공:", data.updateHealingForm);
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

  const [deleteHealingForm] = useMutation(DELETE_HEALING_FORM, {
    onCompleted: (data) => {
      console.log("힐링서비스 폼 삭제 성공:", data);
    },
    onError: (error) => {
      console.error("힐링서비스 폼 삭제 오류:", error);
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
        data[6], data[3], data[4], data[7], data[9]
      ];
      
      setSearchInfo({
        agency: col1 || "",
        openday: col2 || "",
        eval_date: col3 || "",
        ptcprogram: col4 || "",
        pv: col5 || "",
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
      setRows([{ ...initRowData, idx: uuidv4() }]);
      setSearchInfo({
        agency: "",
        agency_id: null,
        openday: "",
        eval_date: "",
        ptcprogram: "",
        pv: "",
        past_stress_experience: ""
      });
    };
  }, [location.state, refetch]);

  // Set default dates if not already set
  useEffect(() => {
    // If dates aren't set, initialize with today's date
    if (!searchInfo.eval_date) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      console.log("Setting default eval_date to today:", formattedDate);
      onChangeSearchInfo('eval_date', formattedDate);
    }
  }, []);

  // 기관 선택 변경 핸들러 (Autocomplete 용)
  const handleOrganizationChange = (event, newValue) => {
    try {
      if (newValue) {
        // 기관명과 ID 업데이트
        console.log(`[Healing] Selected org: ${newValue.group_name}, ID: ${newValue.id}`);
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
      console.error('[Healing] Error in handleOrganizationChange:', err);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log('Category changed:', categoryId);
    setSelectedCategory(categoryId);
    // Reset program selection when category changes
    onChangeSearchInfo('ptcprogram', '');
  };

  const handleProgramChange = (e) => {
    const programName = e.target.value;
    console.log('Program selected:', programName);
    onChangeSearchInfo('ptcprogram', programName);
  };

  const onSave = () => {
    console.log("Saving form with searchInfo:", JSON.stringify(searchInfo, null, 2));
    
    // Ensure searchInfo values are properly formatted
    const validatedSearchInfo = {
      ...searchInfo,
      agency: searchInfo.agency?.trim() || "",
      agency_id: searchInfo.agency_id || null,
      openday: searchInfo.openday?.trim() || "",
      eval_date: searchInfo.eval_date?.trim() || ""
    };
    
    console.log("Validated searchInfo:", JSON.stringify(validatedSearchInfo, null, 2));
    
    // Check if agency and at least one date field exists
    const hasAgency = Boolean(validatedSearchInfo.agency && validatedSearchInfo.agency !== "") || 
                     Boolean(validatedSearchInfo.agency_id && validatedSearchInfo.agency_id !== null);
    
    const hasDate = Boolean(validatedSearchInfo.openday && validatedSearchInfo.openday !== "") || 
                   Boolean(validatedSearchInfo.eval_date && validatedSearchInfo.eval_date !== "");
    
    console.log("Validation checks:", { hasAgency, hasDate });
    
    // Manual validation instead of using validateSearchInfo
    if (!hasAgency || !hasDate) {
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
    const missingData = rows.some(row => !row.sex || !row.residence);

    if (missingData) {
      Swal.fire({
        icon: 'warning',
        title: '필수 데이터 누락',
        text: '성별 및 거주지는 필수 입력 항목입니다.',
      });
      return;
    }

    try {
      // agency_id가 정수인지 확인
      let agencyId = null;
      if (validatedSearchInfo.agency_id) {
        agencyId = typeof validatedSearchInfo.agency_id === 'number' 
          ? validatedSearchInfo.agency_id 
          : parseInt(validatedSearchInfo.agency_id, 10);
      }

      // For consolidated model, need to create a separate form for each entry
      const promises = rows.map(row => {
        const input = {
          agency: validatedSearchInfo.agency,
          agency_id: agencyId,
          openday: validatedSearchInfo.openday,
          eval_date: validatedSearchInfo.eval_date,
          ptcprogram: validatedSearchInfo.ptcprogram || "",
          pv: validatedSearchInfo.pv || "",
          past_stress_experience: validatedSearchInfo.past_stress_experience || "",
          healing_seq: row.healing_seq ? parseInt(row.healing_seq, 10) : null,
          name: row.name || "",
          sex: row.sex || "미기재",
          age: String(row.age || ""),
          residence: row.residence || "미기재",
          job: row.job || "",
          // Ensure all score values are explicitly converted to strings
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
          score22: row.score22 !== null && row.score22 !== undefined ? String(row.score22) : ""
        };

        // If row has an ID, update it, otherwise create new
        if (row.id && row.id !== '1') {
          return updateHealingForm({
            variables: {
              id: parseInt(row.id, 10),
              input
            }
          });
        } else {
          return createHealingForm({
            variables: {
              input
            }
          });
        }
      });

      // Show confirmation dialog
      Swal.fire({
        title: '힐링 효과평가 등록',
        text: `${promises.length}개의 항목을 등록 하시겠습니까?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#767676',
        confirmButtonText: '확인',
        cancelButtonText: '취소'
      }).then((result) => {
        if (result.isConfirmed) {
          // Show loading indicator
          Swal.fire({
            title: '저장 중...',
            text: '데이터를 저장하고 있습니다.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          // Execute all mutations
          Promise.all(promises)
            .then((results) => {
              console.log("All mutations completed successfully:", results);
              // Always close the loading modal
              Swal.close();
              
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
                // First close any existing Swal modal to ensure loading is gone
                Swal.close();
                
                // Then show success message without loading indicator
                setTimeout(() => {
                  Swal.fire({
                    icon: 'success',
                    title: '확인',
                    text: "정상등록 되었습니다.",
                    showConfirmButton: true,
                    allowOutsideClick: true
                  }).then(() => {
                    // Reset form - more thorough approach
                    resetForm();
                    
                    // Force React to rerender the entire component
                    setRows([{ ...initRowData, idx: uuidv4() }]);
                    
                    // Force immediate UI update
                    setTimeout(() => {
                      if (insertFormRef.current && insertFormRef.current.forceUpdate) {
                        insertFormRef.current.forceUpdate();
                      }
                    }, 0);
                  });
                }, 100); // Small delay to ensure previous modal is fully closed
              }
            })
            .catch(error => {
              // Always close the loading modal even on error
              Swal.close();
              
              console.error("GraphQL 뮤테이션 오류:", error);
              Swal.fire({
                icon: 'error',
                title: '오류',
                text: `저장 중 오류가 발생했습니다: ${error.message}`,
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
    // Basic validation
    if (!searchInfo.agency && !searchInfo.agency_id) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "검색하려면 적어도 기관명을 입력해 주십시오."
      });
      return;
    }
    
    // Execute query
    refetch({
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    })
    .then(result => {
      if (!result.data || !result.data.getHealingForms || result.data.getHealingForms.length === 0) {
        setRows([{ ...initRowData, idx: uuidv4() }]);
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

  const onChangeExcel = (value) => {
    if (!value || !value.data || value.data.length === 0) return;
    
    try {
      // Process Excel data
      const transformedRows = value.data.map((row, idx) => ({
        idx: uuidv4(),
        id: "",
        chk: false,
        healing_seq: (idx + 1).toString(),
        name: row.col0 || "",
        sex: row.col1 || "미기재",
        age: row.col2 ? row.col2.toString() : "",
        residence: row.col3 || "미기재",
        job: row.col4 || "",
        past_stress_experience: row.col5 === "미기재" ? "" : (row.col5 || ""),
        score1: row.col6 || "",
        score2: row.col7 || "",
        score3: row.col8 || "",
        score4: row.col9 || "",
        score5: row.col10 || "",
        score6: row.col11 || "",
        score7: row.col12 || "",
        score8: row.col13 || "",
        score9: row.col14 || "",
        score10: row.col15 || "",
        score11: row.col16 || "",
        score12: row.col17 || "",
        score13: row.col18 || "",
        score14: row.col19 || "",
        score15: row.col20 || "",
        score16: row.col21 || "",
        score17: row.col22 || "",
        score18: row.col23 || "",
        score19: row.col24 || "",
        score20: row.col25 || "",
        score21: row.col26 || "",
        score22: row.col27 || ""
      }));

      // Update state directly
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
    console.log(`Changing searchInfo ${name}:`, value);
    
    // Ensure value is converted to appropriate type
    let processedValue = value;
    
    // Special handling for dates - ensure they're in correct format
    if (name === 'openday' || name === 'eval_date') {
      // Check if the value is a valid date string
      if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedValue = value;
      } else if (!value) {
        processedValue = ''; // Empty string for empty date
      }
    }
    
    // Special handling for agency_id - ensure it's a number or null
    if (name === 'agency_id') {
      if (value === '' || value === null || value === undefined) {
        processedValue = null;
      } else if (typeof value === 'string') {
        processedValue = parseInt(value, 10);
      }
    }
    
    setSearchInfo(prev => {
      const updated = { ...prev, [name]: processedValue };
      console.log(`Updated searchInfo: ${name}=`, processedValue, "full:", updated);
      return updated;
    });
  };

  // Transform API data directly to state
  const transformHealingData = (apiData) => {
    if (!apiData || !apiData.getHealingForms || apiData.getHealingForms.length === 0) {
      return null;
    }
    
    // Load all forms
    const formData = apiData.getHealingForms;
    console.log("Loaded healing forms:", formData);
    
    // Transform entries
    const allEntries = formData.map(form => ({
      idx: uuidv4(),
      id: form.id || "",
      chk: false,
      healing_seq: form.healing_seq || "",
      name: form.name || "",
      sex: form.sex || "미기재",
      age: form.age || "",
      residence: form.residence || "미기재",
      job: form.job || "",
      past_stress_experience: form.past_stress_experience === "미기재" ? "" : (form.past_stress_experience || ""),
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
      score22: form.score22 || ""
    }));
    
    // Update state directly
    setRows(allEntries);
    
    // Update searchInfo with the most recent form data
    const mostRecentForm = formData[0];
    
    const updatedSearchInfo = {
      agency: mostRecentForm.agency || "",
      agency_id: mostRecentForm.agency_id || null,
      openday: mostRecentForm.openday || "",
      eval_date: mostRecentForm.eval_date || "",
      ptcprogram: mostRecentForm.ptcprogram || "",
      pv: mostRecentForm.pv || "",
      past_stress_experience: mostRecentForm.past_stress_experience || ""
    };
    
    console.log("Updating search info with:", updatedSearchInfo);
    setSearchInfo(updatedSearchInfo);
    
    // Find and set program category based on program name
    if (mostRecentForm.ptcprogram) {
      console.log("Looking for program category for:", mostRecentForm.ptcprogram);
      
      // If we already have program categories loaded
      if (categories.length > 0) {
        findAndSetProgramCategory(mostRecentForm.ptcprogram);
      } else {
        // Set a flag to find the category once categories are loaded
        console.log("Categories not loaded yet, will set program after categories load");
        
        // Save the program name for later use
        window.sessionStorage.setItem('healingPendingProgram', mostRecentForm.ptcprogram);
      }
    }
    
    // Show success message
    if (allEntries.length > 0) {
      Swal.fire({
        icon: 'success',
        title: '데이터 로드 완료',
        text: `${allEntries.length}개의 이전 데이터를 불러왔습니다.`
      });
    }
    
    return allEntries;
  };

  // Helper function to find and set the program category based on program name
  const findAndSetProgramCategory = (programName) => {
    if (!programName || categories.length === 0) return;
    
    console.log(`Finding category for program: ${programName}`);
    
    // For each category, fetch programs and check if the programName exists
    let foundCategory = false;
    
    // Sequential check of each category (this is a bit inefficient but ensures we find the right category)
    const checkNextCategory = async (index) => {
      if (index >= categories.length) {
        console.log("Program not found in any category");
        return;
      }
      
      const category = categories[index];
      console.log(`Checking category ${category.category_name}...`);
      
      // Query for programs in this category
      try {
        const result = await refetchProgramsByCategory({ 
          categoryId: parseInt(category.id, 10)
        });
        
        if (result.data && result.data.getProgramsByCategory) {
          const programExists = result.data.getProgramsByCategory.some(
            prog => prog.program_name === programName
          );
          
          if (programExists) {
            console.log(`Found program in category: ${category.category_name}`);
            setSelectedCategory(String(category.id));
            setPrograms(result.data.getProgramsByCategory);
            foundCategory = true;
            return;
          }
        }
        
        // If not found, check next category
        if (!foundCategory) {
          await checkNextCategory(index + 1);
        }
      } catch (error) {
        console.error(`Error checking category ${category.id}:`, error);
        await checkNextCategory(index + 1);
      }
    };
    
    // Start the sequential checking
    checkNextCategory(0);
  };
  
  // When categories are loaded, check if we need to set a pending program
  useEffect(() => {
    if (categories.length > 0) {
      const pendingProgram = window.sessionStorage.getItem('healingPendingProgram');
      if (pendingProgram) {
        console.log("Categories loaded, setting pending program:", pendingProgram);
        findAndSetProgramCategory(pendingProgram);
        window.sessionStorage.removeItem('healingPendingProgram');
      }
    }
  }, [categories]);

  const resetForm = () => {
    console.log("Resetting form...");
    // Reset rows
    setRows([{ ...initRowData, idx: uuidv4() }]);
    
    // Reset search info
    setSearchInfo({
      agency: "",
      agency_id: null,
      openday: "",
      eval_date: new Date().toISOString().split('T')[0], // Set today's date
      ptcprogram: "",
      pv: "",
      past_stress_experience: ""
    });
    
    // Reset program selection
    setSelectedCategory("");
    setPrograms([]);
    
    // Force refresh the ref
    if (insertFormRef.current && insertFormRef.current.forceUpdate) {
      insertFormRef.current.forceUpdate();
    }
  };

  // Render the component
  return (
    <>
      <MainCard title="힐링서비스 효과평가" key={`healing-card-${rows.length}`}>
        <Grid container spacing={2}>
          {/* Agency selection */}
          <Grid item xs={12} sm={4}>
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
          
          {/* Start date picker */}
          <Grid item xs={12} sm={4}>
            <DatePicker 
              label="시작일자"
              value={searchInfo.openday || ''}
              onChange={(name, value) => {
                console.log("DatePicker onChange:", name, value);
                onChangeSearchInfo('openday', value);
              }}
              name="openday"
            />
          </Grid>
          
          {/* Evaluation date picker */}
          <Grid item xs={12} sm={4}>
            <DatePicker 
              label="실시일자"
              value={searchInfo.eval_date || ''}
              onChange={(name, value) => {
                console.log("DatePicker onChange:", name, value);
                onChangeSearchInfo('eval_date', value);
              }}
              name="eval_date"
            />
          </Grid>
          
      
          
          {/* PV Number */}
          <Grid item xs={12} sm={4}>
            <Select
              id="pv"
              name="pv"
              label="시점"
              placeholder="시점 입력"
              options={["사전", "사후"]} 
              value={searchInfo.pv || ''}
              onChange={(e) => onChangeSearchInfo('pv', e.target.value)}
            />
          </Grid>
        </Grid>
        
        <ServiceFormToolbar
          onSearch={onSearch}
          onSave={onSave}
          onDataProcessed={onChangeExcel}
          startRow={3}
          type="healing"
        />

        {/* Replace InsertForm implementation with this */}
        <Grid container>
          <Grid item xs={12}>
            <SetValue onAdd={addRow} onRemove={removeRow} onSetData={setAllData} />
            <TableContainer style={{ minHeight: "560px", paddingBottom: "50px" }}>
              <Table className="insertForm custom-table">
                <DynamicTableHead headerInfo={headerInfo} />
                <HealingTableRow
                  rows={rows}
                  fields={fields}
                  id="idx" 
                  onCheckChange={onCheckChange}
                  onChange={changeValue}
                />
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
});

export default Healing;