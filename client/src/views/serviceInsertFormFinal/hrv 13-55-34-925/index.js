import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useDispatch } from 'react-redux';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_HRV_FORM, UPDATE_HRV_FORM, GET_HRV_FORMS, DELETE_HRV_FORM } from '../../../graphql/serviceForm';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import InsertForm from './insertForm';
import { formatDate, showConfirmDialog, parseAgencyUser } from 'utils/serviceFormUtils';
import AgencyDropdown from '../common/AgencyDropdown';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import { validateSearchInfo, clearFormData, parseAgencyInfo } from '../../../utils/formUtils';
import { Button } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import DynamicTableHead from 'ui-component/DynamicTableHead';
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";

// Initial row data structure
const initRowData = {
  idx: uuidv4(),
  id: "",
  chk: false,
  HRV_SEQ: "",
  NAME: "",
  IDENTIFICATION_NUMBER: "",
  SEX: "미기재",
  AGE: "",
  NUM1: "", // 자율신경활성도
  NUM2: "", // 자율신경균형도
  NUM3: "", // 스트레스저항도
  NUM4: "", // 스트레스지수
  NUM5: "", // 피로도지수
  NUM6: "", // 평균심박동수
  NUM7: "", // 심장안정도
  NUM8: ""  // 이상심박동수
};

// Update fields to include NAME and IDENTIFICATION_NUMBER
const fields = [
  { name: "HRV_SEQ", label: "ID"},
  { name: "NAME", label: "이름"},
  { name: "IDENTIFICATION_NUMBER", label: "주민등록번호"},
  { name: "SEX", label: "성별", type: "select"},
  { name: "AGE", label: "연령", type: "age"},
  { name: "NUM1", label: "자율신경활성도"},
  { name: "NUM2", label: "자율신경균형도"},
  { name: "NUM3", label: "스트레스저항도"},
  { name: "NUM4", label: "스트레스지수"},
  { name: "NUM5", label: "피로도지수"},
  { name: "NUM6", label: "평균심박동수"},
  { name: "NUM7", label: "심장안정도"},
  { name: "NUM8", label: "이상심박동수"}
];

// Update headerInfo to match fields
const headerInfo = [
  ['선택', 'ID', '이름', '주민등록번호', '성별', '연령', '자율신경활성도', '자율신경균형도', '스트레스저항도', '스트레스지수', '피로도지수', '평균심박동수', '심장안정도', '이상심박동수'],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '']
];

// Create a custom wrapper for DynamicTableRow that handles both idx and index for the onCheckChange
const HrvTableRow = (props) => {
  const { onCheckChange, ...otherProps } = props;
  
  // Create a wrapper function that handles both idx property and array index
  const handleCheckChange = (idx, checked) => {
    console.log(`HrvTableRow: check change for idx=${idx}, checked=${checked}`);
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

const Hrv = forwardRef((props, ref) => {
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for form data
  const [rows, setRows] = useState([{ ...initRowData }]);
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    name: '',
    openday: '',
    eval_date: '',
    ptcprogram: '',
    pv: '',
    identification_number: ''
  });
  const [deleteRows, setDeleteRows] = useState([]);
  
  // 외부 searchInfo props를 받아서 내부 상태 업데이트
  useEffect(() => {
    if (props.searchInfo) {
      console.log('[Hrv] 외부 searchInfo props 수신됨:', props.searchInfo);
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
    console.log('[Hrv] 🔄 setRowsData 호출됨', newRows?.length);
    console.log('[Hrv] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
    
    if (!newRows || newRows.length === 0) {
      console.log('[Hrv] ⚠️ 빈 rows 데이터, 무시함');
      return;
    }
    
    // row 데이터가 변경되었는지 확인
    const currentIds = rows.map(row => row.idx).join(',');
    const newIds = newRows.map(row => row.idx || row.id).join(',');
    
    console.log('[Hrv] 🔄 기존 ID:', currentIds);
    console.log('[Hrv] 🔄 새 ID:', newIds);
    
    if (currentIds === newIds && rows.length > 0) {
      console.log('[Hrv] ℹ️ 동일한 ID의 rows, 변경 없음');
      return;
    }
    
    // 참가자 정보만 있는 경우 필수 필드 추가
    console.log('[Hrv] 🔄 행 데이터 처리 시작');
    const processedRows = newRows.map((row, index) => {
      // 기존 행 정보 찾기
      const existingRow = rows.find(r => r.idx === row.idx);
      
      if (existingRow) {
        console.log(`[Hrv] 🔄 행 ${index}: 기존 데이터 발견 (idx=${row.idx})`);
      } else {
        console.log(`[Hrv] 🔄 행 ${index}: 새 행 생성 (idx=${row.idx})`);
      }
      
      const result = {
        ...initRowData,  // 기본 데이터 구조
        ...existingRow,  // 기존 행 데이터 (있으면)
        ...row,          // 새로운 데이터
        idx: row.idx || uuidv4(),  // idx는 반드시 있어야 함
        chk: row.chk || false,
        NAME: row.NAME || row.name || "",
        SEX: row.SEX || row.sex || "미기재",
        AGE: row.AGE || row.age || "",
      };
      
      console.log(`[Hrv] 🔄 행 ${index} 처리 완료: name=${result.NAME || result.name}`);
      return result;
    });
    
    console.log('[Hrv] ✅ rows 업데이트:', processedRows.length);
    console.log('[Hrv] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
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

  // GraphQL query to fetch hrv forms
  const { refetch } = useQuery(GET_HRV_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null,
      pv: searchInfo.pv || null
    },
    skip: true, // Always skip initial auto fetching
    onCompleted: (data) => {
      if (data && data.getHrvForms && data.getHrvForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        
        // Transform forms directly to rows format
        const formRows = data.getHrvForms.map(form => ({
          idx: uuidv4(),
          id: form.id || "",
          chk: false,
          HRV_SEQ: form.hrv_seq || "",
          NAME: form.name || "",
          IDENTIFICATION_NUMBER: form.identification_number || "",
          SEX: form.sex || "미기재",
          AGE: form.age || "",
          NUM1: form.score1 || "",
          NUM2: form.score2 || "",
          NUM3: form.score3 || "",
          NUM4: form.score4 || "",
          NUM5: form.score5 || "",
          NUM6: form.score6 || "",
          NUM7: form.score7 || "",
          NUM8: form.score8 || ""
        }));
        
        // Update rows
        setRows(formRows.length > 0 ? formRows : [{ ...initRowData, idx: uuidv4() }]);
        
        // Update searchInfo with the most recent form data
        const mostRecentForm = data.getHrvForms[0];
        setSearchInfo(prev => ({
          ...prev,
          agency: mostRecentForm.agency || prev.agency,
          agency_id: mostRecentForm.agency_id || prev.agency_id,
          name: mostRecentForm.name || prev.name,
          openday: mostRecentForm.openday || prev.openday,
          eval_date: mostRecentForm.eval_date || prev.eval_date,
          ptcprogram: mostRecentForm.ptcprogram || prev.ptcprogram,
          pv: mostRecentForm.pv || prev.pv,
          identification_number: mostRecentForm.identification_number || prev.identification_number
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

  // GraphQL mutation to create hrv form
  const [createHrvForm] = useMutation(CREATE_HRV_FORM, {
    onCompleted: (data) => {
      if (data.createHrvForm) {
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
              pv: "",
              identification_number: ""
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

  // GraphQL mutation to update hrv form
  const [updateHrvForm] = useMutation(UPDATE_HRV_FORM);
  const [deleteHrvForm] = useMutation(DELETE_HRV_FORM, {
    onCompleted: (data) => {
      console.log("HRV 폼 삭제 성공:", data);
    },
    onError: (error) => {
      console.error("HRV 폼 삭제 오류:", error);
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
      const [col1, col2, col3] = [
        data[6], data[3], data[7]
      ];
      
      const formattedDate = formatDate();
      
      setSearchInfo({
        agency: col1 || "",
        agency_id: null,
        name: "",
        openday: col2 || "",
        eval_date: formattedDate,
        ptcprogram: "",
        pv: "",
        identification_number: ""
      });
      
      // Trigger refetch with new parameters
      if (col1 && col2) {
        refetch({
          agency: col1,
          openday: col2,
          eval_date: formattedDate
        });
      }
    }
    
    return () => {
      // Cleanup
      setRows([{ ...initRowData, idx: uuidv4() }]);
      setSearchInfo({
        agency: "",
        agency_id: null,
        name: "",
        openday: "",
        eval_date: "",
        ptcprogram: "",
        pv: "",
        identification_number: ""
      });
    };
  }, [location.state, refetch]);

  const onSave = () => {
    if (!validateSearchInfo(searchInfo)) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "필수 기본정보(기관명과 날짜 중 하나 이상)를 입력해 주십시오.",
      });
      return;
    }

    // Check if rows have required data
    const missingData = rows.some(row => {
      if (!row.SEX) {
        return true;
      }
      return false;
    });

    if (missingData) {
      Swal.fire({
        icon: 'warning',
        title: '필수 데이터 누락',
        text: '성별은 필수 입력 항목입니다.',
      });
      return;
    }

    // For consolidated model, create a separate form for each row
    const promises = rows.map(row => {
      const input = {
        agency: searchInfo.agency,
        agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
        name: row.NAME || "",
        openday: searchInfo.openday,
        eval_date: searchInfo.eval_date,
        ptcprogram: searchInfo.ptcprogram || "",
        pv: searchInfo.pv || "",
        identification_number: row.IDENTIFICATION_NUMBER || "",
        hrv_seq: row.HRV_SEQ ? parseInt(row.HRV_SEQ, 10) : null,
        sex: row.SEX || "미기재",
        age: String(row.AGE || ""),
        residence: "미기재", // Default value as required by schema
        job: "",
        // Ensure all score values are explicitly converted to strings
        score1: row.NUM1 !== null && row.NUM1 !== undefined ? String(row.NUM1) : "",
        score2: row.NUM2 !== null && row.NUM2 !== undefined ? String(row.NUM2) : "",
        score3: row.NUM3 !== null && row.NUM3 !== undefined ? String(row.NUM3) : "",
        score4: row.NUM4 !== null && row.NUM4 !== undefined ? String(row.NUM4) : "",
        score5: row.NUM5 !== null && row.NUM5 !== undefined ? String(row.NUM5) : "",
        score6: row.NUM6 !== null && row.NUM6 !== undefined ? String(row.NUM6) : "",
        score7: row.NUM7 !== null && row.NUM7 !== undefined ? String(row.NUM7) : "",
        score8: row.NUM8 !== null && row.NUM8 !== undefined ? String(row.NUM8) : ""
      };

      // If row has an ID, update it, otherwise create new
      if (row.id) {
        return updateHrvForm({
          variables: {
            id: parseInt(row.id, 10),
            input
          }
        });
      } else {
        return createHrvForm({
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
              pv: "",
              identification_number: ""
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
    if (!searchInfo.agency && !searchInfo.agency_id) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "검색하려면 적어도 기관명을 입력해 주십시오."
      });
      return;
    }
    
    console.log("검색 요청:", {
      agency: searchInfo.agency,
      agency_id: searchInfo.agency_id,
      openday: searchInfo.openday,
      eval_date: searchInfo.eval_date,
      pv: searchInfo.pv
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
      console.log("검색 결과:", result);
      if (!result.data || !result.data.getHrvForms || result.data.getHrvForms.length === 0) {
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
      const processedData = excelData.data.map((row, idx) => {
        // Ensure HRV_SEQ is a number
        const hrvSeq = (idx + 1).toString();
        
        // Parse ID value, ensuring it's a numeric string
        let idValue = '';
        if (row.col0) {
          idValue = row.col0.toString().replace(/[^0-9]/g, '');
        }
        
        return {
          idx: uuidv4(),
          id: idValue,
          chk: false,
          HRV_SEQ: hrvSeq,
          NAME: row.col1 || "",
          IDENTIFICATION_NUMBER: row.col2 ? row.col2.toString().replace(/[^0-9]/g, '') : "",
          SEX: row.col3 || "미기재",
          AGE: row.col4 ? row.col4.toString().replace(/[^0-9]/g, '') : "",
          // Excel 열 매핑
          NUM1: row.col5 || "", 
          NUM2: row.col6 || "", 
          NUM3: row.col7 || "", 
          NUM4: row.col8 || "", 
          NUM5: row.col9 || "", 
          NUM6: row.col10 || "", 
          NUM7: row.col11 || "", 
          NUM8: row.col12 || "" 
        };
      });
      
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

  const addRow = useCallback(() => {
    setRows(prev => [...prev, { ...initRowData, idx: uuidv4() }]);
  }, []);

  const removeRow = useCallback(() => {
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
        
        // Get the actual database IDs for deletion
        const rowsToDelete = selectedRows.filter(row => row.id);
        const deletedIds = rowsToDelete.map(row => parseInt(row.id, 10));
        
        // Update tracking list if needed
        if (deletedIds.length > 0) {
          setDeleteRows(prev => [...prev, ...deletedIds]);
        }
        
        // Remove from UI first
        setRows(prev => prev.filter(row => !selectedIds.includes(row.idx)));
        
        // Delete from server if there are saved items
        if (deletedIds.length > 0) {
          console.log(`${deletedIds.length}개 항목 서버에서 삭제 시작`);
          
          // Execute DELETE mutation for each item
          const deletePromises = deletedIds.map(id => {
            return deleteHrvForm({
              variables: { id }
            });
          });
          
          // Handle all deletion promises
          Promise.all(deletePromises)
            .then(results => {
              console.log("서버 삭제 결과:", results);
              Swal.fire({
                icon: 'success',
                title: '삭제 완료',
                text: `${deletedIds.length}개 항목이 삭제되었습니다.`,
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
  }, [rows, deleteHrvForm]);

  const onCheckChange = useCallback((idx, checked) => {
    console.log(`HRV: check change for idx=${idx}, checked=${checked}`);
    setRows(prev => 
      prev.map((row, index) => {
        // Support both idx property matching and array index matching
        if (row.idx === idx || index === parseInt(idx)) {
          return { ...row, chk: checked };
        }
        return row;
      })
    );
  }, []);

  const handleChange = (idx, name, value) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      
      // Create a copy of the row to modify
      const rowToUpdate = { ...updatedRows[idx] };
      
      // Special handling for numeric fields
      if (name === "HRV_SEQ") {
        // Only allow numbers and convert to integer
        const numericValue = value.toString().replace(/[^0-9]/g, '');
        
        if (numericValue === '') {
          rowToUpdate[name] = '';
        } else {
          // Store as numeric string so it can be parsed later
          rowToUpdate[name] = numericValue;
        }
      } else {
        // For other fields, just set the value
        rowToUpdate[name] = value;
      }
      
      // Replace the row in the array
      updatedRows[idx] = rowToUpdate;
      return updatedRows;
    });
  };

  const setAllData = (type, value) => {
    console.log('[Hrv] setAllData 호출됨:', type, value?.length);
    
    // 'all' 타입 처리 - 전체 데이터 교체 (참가자 정보 일괄 적용 시)
    if (type === 'all' && Array.isArray(value)) {
      console.log(`[Hrv] setAllData: 전체 ${value.length}개 행 업데이트`);
      
      // 각 행에 필요한 기본 필드 확인 및 추가
      const processedRows = value.map(row => {
        return {
          ...initRowData,  // 기본 필드
          ...row,          // 새 데이터
          idx: row.idx || uuidv4(),  // idx 필드 보장
          NAME: row.NAME || row.name || "",
          SEX: row.SEX || row.sex || "미기재",
          AGE: row.AGE || row.age || ""
        };
      });
      
      setRows(processedRows);
      return;
    }
    
    // 객체 형식 처리 ({type: 'all', value: [...]} 형식)
    if (typeof type === 'object' && type.type === 'all' && Array.isArray(type.value)) {
      console.log(`[Hrv] setAllData: 객체 형식으로 전체 ${type.value.length}개 행 업데이트`);
      
      const processedRows = type.value.map(row => {
        return {
          ...initRowData,  // 기본 필드
          ...row,          // 새 데이터
          idx: row.idx || uuidv4(),  // idx 필드 보장
          NAME: row.NAME || row.name || "",
          SEX: row.SEX || row.sex || "미기재",
          AGE: row.AGE || row.age || ""
        };
      });
      
      setRows(processedRows);
      return;
    }
    
    // 체크된 항목 처리
    const checkedRows = rows.filter(row => row.chk);
    
    if (checkedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '선택된 항목이 없습니다.'
      });
      return;
    }
    
    const newRows = [...rows];
    
    checkedRows.forEach(row => {
      const idx = newRows.findIndex(r => r.idx === row.idx);
      if (idx !== -1) {
        newRows[idx][type] = value;
      }
    });
    
    setRows(newRows);
  };

  const onChangeSearchInfo = (name, value) => {
    setSearchInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAgencyChange = (agencyData) => {
    try {
      if (!agencyData) {
        console.log('[Hrv] ⚠️ Agency data is null or undefined');
        return;
      }
      
      console.log('[Hrv] 🔄 Agency changed:', agencyData);
      
      // Ensure we're setting both agency and agency_id together
      setSearchInfo(prev => ({
        ...prev,
        agency: agencyData.agency || '',
        agency_id: agencyData.agency_id || null
      }));
    } catch (err) {
      console.error('[Hrv] Error in handleAgencyChange:', err);
    }
  };

  // Render the component
  return (
    <>
      <MainCard style={{ marginTop: "10px" }}>
        {/* Search Info Section */}
        <Grid container spacing={2} alignItems={"center"} style={{ marginBottom: "15px" }}>
          <Grid item sm={3}>
            <AgencyDropdown
              value={{ 
                agency: searchInfo.agency || '', 
                agency_id: searchInfo.agency_id || null 
              }}
              onChange={(data) => {
                try {
                  console.log('[Hrv Direct] 🔄 Agency changed:', data);
                  if (data && typeof data === 'object') {
                    handleAgencyChange(data);
                  }
                } catch (err) {
                  console.error('[Hrv Direct] Error handling agency change:', err);
                }
              }}
              label="기관명"
            />
          </Grid>
          <Grid item sm={2}>
            <DatePicker
              label="시작일"
              value={searchInfo.openday}
              onChange={(key, value) => onChangeSearchInfo('openday', value)}
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
            type="hrv"
          />
        </div>
      </MainCard>
      
      <MainCard style={{ marginTop: "10px", minHeight: "400px" }}>
        <SetValue onAdd={addRow} onRemove={removeRow} onSetData={setAllData} />
        <TableContainer style={{minHeight: "560px", paddingBottom: "50px"}}>
          <Table className="insertForm custom-table">
            <DynamicTableHead headerInfo={headerInfo} />
            <HrvTableRow 
              rows={rows} 
              fields={fields} 
              id="idx" 
              onCheckChange={onCheckChange} 
              onChange={handleChange} 
            />
          </Table>
        </TableContainer>
      </MainCard>
    </>
  );
});

export default Hrv;