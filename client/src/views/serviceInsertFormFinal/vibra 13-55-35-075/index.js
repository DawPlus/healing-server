import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useStore } from 'react-redux';
import MainCard from 'ui-component/cards/MainCard';
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_VIBRA_FORM, UPDATE_VIBRA_FORM, GET_VIBRA_FORMS, DELETE_VIBRA_FORM } from "../../../graphql/serviceForm";
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import { formatDate, showConfirmDialog, validateSearchInfo, clearFormData, parseAgencyInfo } from '../../../utils/formUtils';
import AgencyDropdown from '../common/AgencyDropdown';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import Button from '@mui/material/Button';

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
    VIBRA_SEQ: "",
    NAME: "",
    IDENTIFICATION_NUMBER: "",
    SEX: "미기재",
    AGE: "",
    NUM1: "", // 적극공격성
    NUM2: "", // 스트레스
    NUM3: "", // 불안
    NUM4: "", // 의심
    NUM5: "", // 밸런스
    NUM6: "", // 카리스마
    NUM7: "", // 에너지
    NUM8: "", // 자기조절
    NUM9: "", // 억제
    NUM10: "" // 신경증
};

// Create a custom wrapper for DynamicTableRow that handles both idx and index for the onCheckChange
const VibraTableRow = (props) => {
  const { onCheckChange, ...otherProps } = props;
  
  // Create a wrapper function that handles both idx property and array index
  const handleCheckChange = (idx, checked) => {
    console.log(`VibraTableRow: check change for idx=${idx}, checked=${checked}`);
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

const Vibra = forwardRef((props, ref) => {
    // React Router hooks
    const location = useLocation();
    const navigate = useNavigate();
    const store = useStore();
    
    // Add organizations state
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
        agency: "",
        agency_id: null,
        name: "",
        openday: "",
        eval_date: "",
        ptcprogram: "",
        pv: "",
        identification_number: ""
    });
    
    // 외부 searchInfo props를 받아서 내부 상태 업데이트
    useEffect(() => {
        if (props.searchInfo) {
            console.log('[Vibra] 외부 searchInfo props 수신됨:', props.searchInfo);
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
        console.log('[Vibra] 🔄 setRowsData 호출됨', newRows?.length);
        console.log('[Vibra] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
        
        if (!newRows || newRows.length === 0) {
            console.log('[Vibra] ⚠️ 빈 rows 데이터, 무시함');
            return;
        }
        
        // row 데이터가 변경되었는지 확인
        const currentIds = rows.map(row => row.idx).join(',');
        const newIds = newRows.map(row => row.idx || row.id).join(',');
        
        console.log('[Vibra] 🔄 기존 ID:', currentIds);
        console.log('[Vibra] 🔄 새 ID:', newIds);
        
        if (currentIds === newIds && rows.length > 0) {
            console.log('[Vibra] ℹ️ 동일한 ID의 rows, 변경 없음');
            return;
        }
        
        // 참가자 정보만 있는 경우 필수 필드 추가
        console.log('[Vibra] 🔄 행 데이터 처리 시작');
        const processedRows = newRows.map((row, index) => {
            // 기존 행 정보 찾기
            const existingRow = rows.find(r => r.idx === row.idx);
            
            if (existingRow) {
                console.log(`[Vibra] 🔄 행 ${index}: 기존 데이터 발견 (idx=${row.idx})`);
            } else {
                console.log(`[Vibra] 🔄 행 ${index}: 새 행 생성 (idx=${row.idx})`);
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
            
            console.log(`[Vibra] 🔄 행 ${index} 처리 완료: name=${result.NAME || result.name}`);
            return result;
        });
        
        console.log('[Vibra] ✅ rows 업데이트:', processedRows.length);
        console.log('[Vibra] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
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

    // Fields definition for the table
    const fields = [ 
        {name: "VIBRA_SEQ", label: "ID"},
        {name: "NAME", label: "이름"},
        {name: "IDENTIFICATION_NUMBER", label: "주민등록번호"},
        {name: "SEX", label: "성별", type: "select"},
        {name: "AGE", label: "연령", type: "age"},
        {name: "NUM1", label: "적극공격성"},
        {name: "NUM2", label: "스트레스"},
        {name: "NUM3", label: "불안"},
        {name: "NUM4", label: "의심"},
        {name: "NUM5", label: "밸런스"},
        {name: "NUM6", label: "카리스마"},
        {name: "NUM7", label: "에너지"},
        {name: "NUM8", label: "자기조절"},
        {name: "NUM9", label: "억제"},
        {name: "NUM10", label: "신경증"},
    ];
    
    const headerInfo = [
        ['선택','ID', '이름', '주민등록번호', '성별', '연령', '적극공격성', '스트레스', '불안', '의심', '밸런스', '카리스마', '에너지', '자기조절', '억제','신경증'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];

    // GraphQL queries and mutations
    const { refetch } = useQuery(GET_VIBRA_FORMS, {
        variables: {
            agency: searchInfo.agency || null,
            openday: searchInfo.openday || null,
            eval_date: searchInfo.eval_date || null
        },
        skip: true, // Always skip initial auto fetching
        onCompleted: (data) => {
            if (data && data.getVibraForms && data.getVibraForms.length > 0) {
                Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
                
                // Use transformVibraData to handle all form data
                transformVibraData(data);
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

    const [createVibraForm] = useMutation(CREATE_VIBRA_FORM, {
        onCompleted: (data) => {
            if (data.createVibraForm) {
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
                        // Reset form completely with empty date fields
                        setRows([{ ...initRowData, idx: uuidv4() }]);
                        
                        // Use a completely fresh state object for reset to avoid any stale date values
                        const resetState = {
                            agency: "",
                            agency_id: null,
                            name: "",
                            openday: "",
                            eval_date: "",
                            ptcprogram: "",
                            pv: "",
                            identification_number: ""
                        };
                        
                        // Reset the form with the fresh state
                        setSearchInfo(resetState);
                        
                        // Force UI refresh of date pickers
                        setTimeout(() => {
                            console.log("Form has been reset completely");
                        }, 0);
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

    const [updateVibraForm] = useMutation(UPDATE_VIBRA_FORM, {
        onCompleted: (data) => {
            if (data.updateVibraForm) {
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

    const [deleteVibraForm] = useMutation(DELETE_VIBRA_FORM, {
        onCompleted: (data) => {
            console.log("바이브라 폼 삭제 성공:", data);
        },
        onError: (error) => {
            console.error("바이브라 폼 삭제 오류:", error);
            Swal.fire({
                icon: 'error',
                title: '오류',
                text: `삭제 중 오류가 발생했습니다: ${error.message}`,
            });
        }
    });

    useEffect(() => {
        if(!location.state) return;
        
        const {data} = location.state;
        
        const [col1, col2, col3] = [data[6], data[3], data[7]];
        
        setSearchInfo({
            agency: col1 || "",
            agency_id: null,
            name: "",
            openday: col2 || "",
            eval_date: col3 || formatDate(),
            ptcprogram: "",
            pv: "",
            identification_number: ""
        });
        
        return () => {
            // Cleanup
            setRows([{ ...initRowData, idx: uuidv4() }]);
        };
    }, [location.state]);

    const onSave = () => {
        if (!validateSearchInfo(searchInfo)) {
            Swal.fire({
                icon: 'warning',
                title: '확인',
                text: "필수 기본정보(기관명과 날짜 중 하나 이상)를 입력해 주십시오.",
            });
            return;
        }

        // Use local rows state instead of Redux store
        if (!rows || rows.length === 0) {
            Swal.fire({
                icon: 'error',
                title: '오류',
                text: '입력된 데이터가 없습니다.'
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
                vibra_seq: row.VIBRA_SEQ ? parseInt(row.VIBRA_SEQ, 10) : null,
                sex: row.SEX || "미기재",
                age: row.AGE || "",
                residence: "미기재", // Default value as required by schema
                job: "",
                score1: row.NUM1 !== null && row.NUM1 !== undefined ? String(row.NUM1) : "",
                score2: row.NUM2 !== null && row.NUM2 !== undefined ? String(row.NUM2) : "",
                score3: row.NUM3 !== null && row.NUM3 !== undefined ? String(row.NUM3) : "",
                score4: row.NUM4 !== null && row.NUM4 !== undefined ? String(row.NUM4) : "",
                score5: row.NUM5 !== null && row.NUM5 !== undefined ? String(row.NUM5) : "",
                score6: row.NUM6 !== null && row.NUM6 !== undefined ? String(row.NUM6) : "",
                score7: row.NUM7 !== null && row.NUM7 !== undefined ? String(row.NUM7) : "",
                score8: row.NUM8 !== null && row.NUM8 !== undefined ? String(row.NUM8) : "",
                score9: row.NUM9 !== null && row.NUM9 !== undefined ? String(row.NUM9) : "",
                score10: row.NUM10 !== null && row.NUM10 !== undefined ? String(row.NUM10) : ""
            };

            // If row has an ID, update it, otherwise create new
            if (row.id) {
                return updateVibraForm({
                    variables: {
                        id: parseInt(row.id, 10),
                        input
                    }
                });
            } else {
                return createVibraForm({
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
                        // Reset form completely with empty date fields
                        setRows([{ ...initRowData, idx: uuidv4() }]);
                        
                        // Use a completely fresh state object for reset to avoid any stale date values
                        const resetState = {
                            agency: "",
                            agency_id: null,
                            name: "",
                            openday: "",
                            eval_date: "",
                            ptcprogram: "",
                            pv: "",
                            identification_number: ""
                        };
                        
                        // Reset the form with the fresh state
                        setSearchInfo(resetState);
                        
                        // Force UI refresh of date pickers
                        setTimeout(() => {
                            console.log("Form has been reset completely");
                        }, 0);
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
        // 적어도 기관명이나 기관ID 중 하나는 있어야 함
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
            eval_date: searchInfo.eval_date
        });
        
        // 쿼리 변수 명시적으로 설정 (null 값은 자동으로 제외됨)
        const searchParams = {
            agency: searchInfo.agency || null,
            agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
            openday: searchInfo.openday || null,
            eval_date: searchInfo.eval_date || null
        };
        
        // Ensure searchInfo is updated with the exact search parameters used
        setSearchInfo(prev => ({
            ...prev,
            agency: searchParams.agency || prev.agency,
            agency_id: searchParams.agency_id || prev.agency_id,
            openday: searchParams.openday || prev.openday,
            eval_date: searchParams.eval_date || prev.eval_date
        }));
        
        refetch(searchParams)
        .then(result => {
            console.log("검색 결과:", result);
            if (!result.data || !result.data.getVibraForms || result.data.getVibraForms.length === 0) {
                // Clear form data when no results are found
                clearFormData(setRows, initRowData, uuidv4);
                
                Swal.fire({ 
                    icon: 'info', 
                    title: '결과 없음', 
                    text: "검색 조건에 맞는 데이터가 없습니다." 
                });
            } else {
                // Process and transform the search results
                transformVibraData(result.data);
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

    const onChangeSearchInfo = (name, value) => {
        setSearchInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAgencyChange = (agencyData) => {
        try {
            console.log('[Vibra] 🔄 Agency change called with:', agencyData);
            
            if (!agencyData) {
                console.log('[Vibra] ⚠️ Agency data is null or undefined, resetting agency info');
                setSearchInfo(prev => ({
                    ...prev,
                    agency: '',
                    agency_id: null
                }));
                return;
            }
            
            // Handle both object format and direct value format
            if (typeof agencyData === 'object' && (agencyData.agency || agencyData.agency_id)) {
                // Object format from AgencyDropdown component
                console.log('[Vibra] 🔍 Updating from AgencyDropdown data:', agencyData.agency, agencyData.agency_id);
                setSearchInfo(prev => ({
                    ...prev,
                    agency: agencyData.agency || '',
                    agency_id: agencyData.agency_id || null
                }));
            } else if (typeof agencyData === 'object' && agencyData.target) {
                // Event format from MuiSelect
                const value = agencyData.target.value;
                console.log('[Vibra] 🔍 Processing MuiSelect event, value:', value);
                
                if (!value) {
                    setSearchInfo(prev => ({
                        ...prev,
                        agency: '',
                        agency_id: null
                    }));
                    return;
                }
                
                const selectedOrg = organizations.find(org => org.id === parseInt(value, 10));
                if (selectedOrg) {
                    console.log('[Vibra] ✅ Found organization:', selectedOrg.group_name, selectedOrg.id);
                    setSearchInfo(prev => ({
                        ...prev,
                        agency: selectedOrg.group_name || '',
                        agency_id: selectedOrg.id || null
                    }));
                } else {
                    console.log('[Vibra] ⚠️ Organization not found for id:', value);
                }
            } else {
                console.log('[Vibra] ⚠️ Unrecognized agency data format:', typeof agencyData);
            }
            
            // For debugging, log the searchInfo state after a short delay to see the update
            setTimeout(() => {
                console.log('[Vibra] 📊 Current searchInfo after agency change:', searchInfo);
            }, 100);
            
        } catch (err) {
            console.error('[Vibra] ❌ Error in handleAgencyChange:', err);
        }
    };

    const onChangeExcel = (excelData) => {
        if (!excelData || !excelData.data || excelData.data.length === 0) {
            return;
        }
        
        try {
            const processedData = excelData.data.map((row, idx) => {
                const vibraSeq = (idx + 1).toString();
                
                let idValue = '';
                if (row.col0) {
                    idValue = row.col0.toString().replace(/[^0-9]/g, '');
                }
                
                return {
                    idx: uuidv4(),
                    id: idValue,
                    chk: false,
                    VIBRA_SEQ: vibraSeq,
                    NAME: row.col1 || "",
                    IDENTIFICATION_NUMBER: row.col2 ? row.col2.toString().replace(/[^0-9]/g, '') : "",
                    SEX: row.col3 || "미기재",
                    AGE: row.col4 ? row.col4.toString().replace(/[^0-9]/g, '') : "",
                    NUM1: row.col5 || "", // 적극공격성
                    NUM2: row.col6 || "", // 스트레스
                    NUM3: row.col7 || "", // 불안
                    NUM4: row.col8 || "", // 의심
                    NUM5: row.col9 || "", // 밸런스
                    NUM6: row.col10 || "", // 카리스마
                    NUM7: row.col11 || "", // 에너지
                    NUM8: row.col12 || "", // 자기조절
                    NUM9: row.col13 || "", // 억제
                    NUM10: row.col14 || "" // 신경증
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

    const addRow = () => {
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
                
                // Get IDs for database deletion
                const rowsToDelete = selectedRows.filter(row => row.id);
                
                // Remove from UI first
                setRows(prev => prev.filter(row => !selectedIds.includes(row.idx)));
                
                // Delete from server if there are saved items
                if (rowsToDelete.length > 0) {
                    console.log(`${rowsToDelete.length}개 항목 서버에서 삭제 시작`);
                    
                    // Execute DELETE mutation for each item
                    const deletePromises = rowsToDelete.map(row => {
                        return deleteVibraForm({
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
    };

    const onCheckChange = (idx, checked) => {
        console.log(`Vibra: check change for idx=${idx}, checked=${checked}`);
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

    const handleChange = (idx, name, value) => {
        setRows(prevRows => {
            const updatedRows = [...prevRows];
            
            const rowToUpdate = { ...updatedRows[idx] };
            
            if (name === "VIBRA_SEQ") {
                const numericValue = value.toString().replace(/[^0-9]/g, '');
                rowToUpdate[name] = numericValue === '' ? '' : numericValue;
                rowToUpdate["id"] = numericValue === '' ? '' : numericValue;
            } else {
                rowToUpdate[name] = value;
            }
            
            updatedRows[idx] = rowToUpdate;
            return updatedRows;
        });
    };

    const setAllData = (type, value) => {
        console.log('[Vibra] setAllData 호출됨:', type, value?.length);
        
        // 'all' 타입 처리 - 전체 데이터 교체 (참가자 정보 일괄 적용 시)
        if (type === 'all' && Array.isArray(value)) {
            console.log(`[Vibra] setAllData: 전체 ${value.length}개 행 업데이트`);
            
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
            console.log(`[Vibra] setAllData: 객체 형식으로 전체 ${type.value.length}개 행 업데이트`);
            
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
        
        // 체크된 항목에 값 설정 - 기존 로직
        const checkedRows = rows.filter(item => item.chk);
        
        if (checkedRows.length === 0) {
            Swal.fire({ icon: 'warning', title: '확인', text: '선택된 항목이 없습니다' });
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
    
    // Transform Vibra data to match rows structure
    const transformVibraData = (data) => {
        if (!data || !data.getVibraForms || data.getVibraForms.length === 0) {
            return null;
        }
        
        // Transform forms directly to rows format
        const formRows = data.getVibraForms.map(form => ({
                idx: uuidv4(),
            id: form.id || "",
                chk: false,
            VIBRA_SEQ: form.vibra_seq || "",
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
            NUM8: form.score8 || "",
            NUM9: form.score9 || "",
            NUM10: form.score10 || ""
        }));
        
        // Update rows
        setRows(formRows.length > 0 ? formRows : [{ ...initRowData, idx: uuidv4() }]);
        
        // Update searchInfo with data from the first form (to ensure it's available for save operation)
        if (formRows.length > 0 && data.getVibraForms[0]) {
            const firstForm = data.getVibraForms[0];
            setSearchInfo(prev => ({
                ...prev,
                agency: firstForm.agency || prev.agency,
                agency_id: firstForm.agency_id || prev.agency_id,
                openday: firstForm.openday || prev.openday,
                eval_date: firstForm.eval_date || prev.eval_date,
                ptcprogram: firstForm.ptcprogram || prev.ptcprogram,
                pv: firstForm.pv || prev.pv
            }));
            console.log("Updated searchInfo with data from search results:", firstForm.agency, firstForm.agency_id);
        }
        
        // Show success message with number of loaded forms
        if (formRows.length > 0) {
            Swal.fire({
                icon: 'success',
                title: '데이터 로드 완료',
                text: `${formRows.length}개의 데이터가 로드되었습니다.`
            });
        }
        
        return formRows;
    };
    
    // Render the component
    return (
        <MainCard title="바이브라 측정 검사" contentClass="insertForm-card">
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                    <AgencyDropdown
                        value={{ 
                            agency: searchInfo.agency || '', 
                            agency_id: searchInfo.agency_id || null 
                        }}
                        onChange={handleAgencyChange}
                        label="기관명" 
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <DatePicker
                        label="시작일"
                        name="openday"
                        value={searchInfo.openday}
                        onChange={(value) => onChangeSearchInfo('openday', value)}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <DatePicker
                        label="실시일자"
                        name="eval_date"
                        value={searchInfo.eval_date}
                        onChange={(value) => onChangeSearchInfo('eval_date', value)}
                    />
                </Grid>
            </Grid>

            <ServiceFormToolbar
                onSearch={onSearch}
                onSave={onSave}
                onChangeExcel={onChangeExcel}
            />

            <TableContainer style={{ minHeight: "560px", paddingBottom: "50px" }}>
                <SetValue 
                    onAdd={addRow} 
                    onRemove={removeRow}
                    onSetData={setAllData}
                />
                <Table className="insertForm custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <VibraTableRow
                        rows={rows}
                        fields={fields}
                        onCheckChange={onCheckChange}
                        onChange={handleChange}
                        id="idx"
                    />
                </Table>
            </TableContainer>
        </MainCard>
    );
});

export default Vibra;

