import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import MainCard from 'ui-component/cards/MainCard';
import InsertForm from "./insertForm"
import SearchInfo from "./searchInfo"
import Swal from "sweetalert2";
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { GET_SERVICE_FORMS, CREATE_SERVICE_FORM, UPDATE_SERVICE_FORM, DELETE_SERVICE_FORM } from "../../../graphql/serviceForm";
import { v4 as uuidv4 } from 'uuid';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import useDownloadExcel from "utils/useDownloadExcel";
import { validateSearchInfo, clearFormData, parseAgencyInfo, formatDate } from '../../../utils/formUtils';
import { Grid, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useStore } from 'react-redux';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress } from '@mui/material';

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

// 숫자를 문자열로 안전하게 변환하는 헬퍼 함수
const toSafeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const initRowData = {
  idx: "",
  id: "",
  chk: false,
  service_seq: "",
  sex: "미기재", // 성별
  age: "", // 연령
  residence: "미기재", // 거주지
  job: "",
  score1: "", // 숙소는 이용하기 편리했다
  score5: "", // 시설 및 산책로 등에 만족한다
  score11: "", // 프로그램 안내 및 운영방식은 만족스러웠다
  score14: "", // 재료가 신선하고 맛있는 식사가 제공되었다
  facility_opinion: "",
  operation_opinion: ""
};

const Service = forwardRef((props, ref) => {
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // Props에서 onOrganizationChange 받기
  const parentOnOrganizationChange = props.onOrganizationChange;
  
  // State for form data
  const [rows, setRows] = useState([{ ...initRowData, idx: uuidv4() }]);
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    openday: '',
    eval_date: '',
    ptcprogram: '',
    pv: '',
    past_stress_experience: ''
  });
  const [deleteRow, setDeleteRow] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  
  // 외부 searchInfo props를 받아서 내부 상태 업데이트
  useEffect(() => {
    if (props.searchInfo) {
      console.log('[Service] 외부 searchInfo props 수신됨:', props.searchInfo);
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
  const searchInfoRef = useRef(null);
  
  // 외부에서 row 데이터를 설정할 수 있도록 메서드 노출
  const setRowsData = (newRows) => {
    console.log('[Service] 🔄 setRowsData 호출됨', newRows?.length);
    console.log('[Service] 🔍 호출 스택:', new Error().stack.split('\n').slice(1, 3).join('\n'));
    
    if (!newRows || newRows.length === 0) {
      console.log('[Service] ⚠️ 빈 rows 데이터, 무시함');
      return;
    }
    
    // row 데이터가 변경되었는지 확인
    const currentIds = rows.map(row => row.idx).join(',');
    const newIds = newRows.map(row => row.idx).join(',');
    
    console.log('[Service] 🔄 기존 ID:', currentIds);
    console.log('[Service] 🔄 새 ID:', newIds);
    
    if (currentIds === newIds && rows.length > 0) {
      console.log('[Service] ℹ️ 동일한 ID의 rows, 변경 없음');
      return;
    }
    
    // 참가자 정보만 있는 경우 필수 필드 추가
    console.log('[Service] 🔄 행 데이터 처리 시작');
    const processedRows = newRows.map((row, index) => {
      // 기존 행 정보 찾기
      const existingRow = rows.find(r => r.idx === row.idx);
      
      if (existingRow) {
        console.log(`[Service] 🔄 행 ${index}: 기존 데이터 발견 (idx=${row.idx})`);
      } else {
        console.log(`[Service] 🔄 행 ${index}: 새 행 생성 (idx=${row.idx})`);
      }
      
      const result = {
        ...initRowData,  // 기본 데이터 구조
        ...existingRow,  // 기존 행 데이터 (있으면)
        ...row,          // 새로운 데이터
        idx: row.idx || uuidv4(),  // idx는 반드시 있어야 함
        chk: row.chk || false
      };
      
      console.log(`[Service] 🔄 행 ${index} 처리 완료: name=${result.name || result.NAME}`);
      return result;
    });
    
    console.log('[Service] ✅ rows 업데이트:', processedRows.length);
    console.log('[Service] 📊 첫 번째 행 데이터 샘플:', JSON.stringify(processedRows[0]).substring(0, 200) + '...');
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

  // GraphQL queries and mutations
  const { refetch } = useQuery(GET_SERVICE_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null
    },
    skip: true,
    onCompleted: (data) => {
      if (data && data.getServiceForms && data.getServiceForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        
        // Load all forms
        const formData = data.getServiceForms;
        
        // Transform forms to rows format
        const formRows = formData.map(form => ({
            idx: uuidv4(),
          id: form.id || "",
            chk: false,
          service_seq: form.service_seq || "",
          sex: form.sex || "미기재",
          age: form.age || "",
          residence: form.residence || "미기재",
          job: form.job || "",
            // Scores
          score1: form.score1 || "",
          score5: form.score5 || "",
          score11: form.score11 || "",
          score14: form.score14 || "",
          facility_opinion: form.facility_opinion || "",
          operation_opinion: form.operation_opinion || ""
        }));
        
        // Update rows with all entries
        setRows(formRows.length > 0 ? formRows : [{ ...initRowData, idx: uuidv4() }]);
        
        // Update searchInfo with the most recent form data
        const mostRecentForm = formData[0];
        setSearchInfo(prev => ({
          ...prev,
          agency: mostRecentForm.agency || prev.agency,
          agency_id: mostRecentForm.agency_id || prev.agency_id,
          openday: mostRecentForm.openday || prev.openday,
          eval_date: mostRecentForm.eval_date || prev.eval_date,
          ptcprogram: mostRecentForm.ptcprogram || prev.ptcprogram
        }));
        
        // Show success message with number of loaded entries
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

  const [createServiceForm] = useMutation(CREATE_SERVICE_FORM, {
    onCompleted: (data) => {
      if (data.createServiceForm) {
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
            // Reset form state
            setRows([{ ...initRowData, idx: uuidv4() }]);
            setSearchInfo({
              agency: "",
              agency_id: null,
              openday: "",
              eval_date: "",
              ptcprogram: ""
            });
            
            // Clear form inputs in UI
            if (insertFormRef && insertFormRef.current) {
              try {
                insertFormRef.current.resetForm();
              } catch (err) {
                console.error("폼 리셋 중 오류:", err);
              }
            }
            
            // Clear the agency dropdown UI
            if (searchInfoRef && searchInfoRef.current) {
              try {
                searchInfoRef.current.resetForm();
              } catch (err) {
                console.error("드롭다운 리셋 중 오류:", err);
              }
            }
            
            // Force UI refresh
            setTimeout(() => {
              // Force component re-render
              setRows([{ ...initRowData, idx: uuidv4() }]);
              window.scrollTo(0, 0);
            }, 100);
          });
        }
      }
    },
    onError: (error) => {
      console.error("Create 오류:", error);
      console.error("Create 오류 상세:", error.graphQLErrors);
      
      // 변수 타입에 문제가 있는지 확인
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(err => {
          if (err.message.includes("String cannot represent")) {
            console.error("타입 변환 오류:", err.message);
          }
        });
      }
      
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  const [updateServiceForm] = useMutation(UPDATE_SERVICE_FORM, {
    onCompleted: (data) => {
      if (data.updateServiceForm) {
        // Success handling is handled in the Promise.all in onSave
      }
    },
    onError: (error) => {
      console.error("Update 오류:", error);
      console.error("Update 오류 상세:", error.graphQLErrors);
      
      // 변수 타입에 문제가 있는지 확인
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach(err => {
          if (err.message.includes("String cannot represent")) {
            console.error("타입 변환 오류:", err.message);
          }
        });
      }
      
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `저장 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  // Add DELETE mutation hook
  const [deleteServiceForm] = useMutation(DELETE_SERVICE_FORM, {
    onCompleted: (data) => {
      console.log("삭제 성공:", data);
    },
    onError: (error) => {
      console.error("삭제 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `삭제 중 오류가 발생했습니다: ${error.message}`,
      });
    }
  });

  // Handle location state for navigation
  useEffect(() => {
    if (!location.state) return;
    
    const { type, name, openday, evalDate, agencyId } = location.state;
    
    if (type === "serviceInsertForm") {
      setSearchInfo({
        agency: name,
        agency_id: agencyId || null,
        openday: openday,
        eval_date: evalDate,
        ptcprogram: ""
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
      setRows([{ ...initRowData, idx: uuidv4() }]);
      setSearchInfo({
        agency: "",
        agency_id: null,
        openday: "",
        eval_date: "",
        ptcprogram: ""
      });
    };
  }, [location.state, refetch]);

  // Excel export configuration
    const headerInfo = [
    ['순서', '성별', "연령", "거주지", "직업", "숙소(문항1)", "숙소(문항2)", "식당(문항3)", "식당(문항4)", "프로그램장소(문항5)", "프로그램장소(문항6)", "프로그램장소(문항7)", "야외(문항8)", "야외(문항9)", "야외(문항10)", "운영(문항1)", "운영(문항2)", "운영(문항3)", "식사(문항4)", "식사(문항5)", "식사(문항6)"]
  ];

  const cellData = rows.map((i, idx) => Object.values({
    idx: idx + 1,
    SEX: i.sex,
    AGE: i.age,
    RESIDENCE: i.residence,
    JOB: i.job,
    SCORE1: i.score1,
    SCORE5: i.score5,
    SCORE11: i.score11,
    SCORE14: i.score14,
    }));
    
        const wscols = [ 
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }
        ];

  const downloadExcel = useDownloadExcel({
    headerInfo,
    cellData,
    wscols,
    filename: "서비스환경만족도"
  });

  // Event handlers
  const onSave = () => {
    // Validate search info first
    if (!validateSearchInfo(searchInfo, "서비스환경평가")) return;

    // Check if rows have required data
    const missingData = rows.some(row => {
      // Check for required fields - adjust as needed
      if (!row.sex || !row.residence) {
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

    // Check if any scores are entered
    const anyScoresEntered = rows.some(row => (
      row.score1 || row.score5 || row.score11 || row.score14
    ));

    if (!anyScoresEntered) {
      Swal.fire({
        icon: 'warning',
        title: '점수 데이터 누락',
        text: '최소한 하나 이상의 평가 점수를 입력해야 합니다.',
      });
      return;
    }

    // 점수 필드 확인을 위한 로그
    console.log("첫번째 행 데이터 타입 확인:", rows[0]);
    
    try {
      // Prepare data for mutation
      // For consolidated model, we need to create a separate form for each entry
      const promises = rows.map(row => {
        try {
          // 모든 필드 명시적으로 문자열로 변환
      const input = {
            agency: toSafeString(searchInfo.agency),
        agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
            openday: toSafeString(searchInfo.openday),
            eval_date: toSafeString(searchInfo.eval_date),
            ptcprogram: toSafeString(searchInfo.ptcprogram),
            service_seq: row.service_seq ? parseInt(row.service_seq, 10) : null,
            sex: toSafeString(row.sex),
            age: toSafeString(row.age),
            residence: toSafeString(row.residence),
            job: toSafeString(row.job),
            score1: toSafeString(row.score1),
            score5: toSafeString(row.score5),
            score11: toSafeString(row.score11),
            score14: toSafeString(row.score14),
            facility_opinion: toSafeString(row.facility_opinion),
            operation_opinion: toSafeString(row.operation_opinion)
          };

          // 특히 점수 필드가 숫자인지 명시적으로 확인
          const scoreFields = [
            'score1', 'score5', 'score11', 'score14'
          ];
          
          scoreFields.forEach(field => {
            // 타입 확인 및 강제 변환
            if (typeof input[field] !== 'string') {
              console.warn(`${field}가 문자열이 아닙니다. 현재 타입: ${typeof input[field]}, 값: ${input[field]}`);
              input[field] = String(input[field] || "");
            }
          });

          // 데이터 전송 전 확인
          console.log("전송할 데이터:", input);

          // If row has an ID, update it, otherwise create new
          if (row.id) {
            return updateServiceForm({
              variables: {
                id: parseInt(row.id, 10),
                input
              }
            });
          } else {
            return createServiceForm({
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
                ptcprogram: ""
              });
              
              // Clear form inputs in UI
              if (insertFormRef && insertFormRef.current) {
                try {
                  insertFormRef.current.resetForm();
                } catch (err) {
                  console.error("폼 리셋 중 오류:", err);
                }
              }
              
              // Clear the agency dropdown UI
              if (searchInfoRef && searchInfoRef.current) {
                try {
                  searchInfoRef.current.resetForm();
                } catch (err) {
                  console.error("드롭다운 리셋 중 오류:", err);
                }
              }
              
              // Force UI refresh
              setTimeout(() => {
                // Force component re-render
                setRows([{ ...initRowData, idx: uuidv4() }]);
                window.scrollTo(0, 0);
              }, 100);
            });
          }
        })
        .catch(error => {
          console.error("GraphQL 뮤테이션 오류:", error);
          console.error("상세 오류:", error.graphQLErrors);
          
          let errorMessage = "저장 중 오류가 발생했습니다";
          
          // 타입 오류인 경우 더 친절한 메시지 제공
          if (error.graphQLErrors && error.graphQLErrors.some(err => err.message.includes("String cannot represent"))) {
            errorMessage += ": 숫자 값이 문자열로 변환되지 않았습니다. 개발자에게 문의하세요.";
          } else {
            errorMessage += `: ${error.message}`;
          }
          
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: errorMessage,
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
    
    console.log("검색 요청:", {
      agency: searchInfo.agency,
      agency_id: searchInfo.agency_id,
      openday: searchInfo.openday,
      eval_date: searchInfo.eval_date
    });
    
    // 쿼리 변수 명시적으로 설정 (null 값은 자동으로 제외됨)
    refetch({
      agency: searchInfo.agency || null,
      agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null
    })
    .then(result => {
      console.log("검색 결과:", result);
      if (!result.data || !result.data.getServiceForms || result.data.getServiceForms.length === 0) {
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

  const onChangeExcel = (value) => {
    if (value.header && value.data) {
      // Replace empty cells with empty strings
      const processedData = value.data.map(row => {
        return Object.keys(row).reduce((acc, key) => {
          acc[key] = row[key] === null || row[key] === undefined ? "" : row[key];
          return acc;
        }, {});
      });

      // Log Excel headers to help with debugging
      console.log("Excel 헤더:", value.header);

      // 강제로 모든 점수 필드를 문자열로 변환
      const newRows = processedData.map((row, idx) => {
        const newRow = {
          idx: uuidv4(),
          chk: false,
          service_seq: idx + 1,
          sex: toSafeString(row["성별"] || "미기재"),
          age: toSafeString(row["연령"]),
          residence: toSafeString(row["거주지"] || "미기재"),
          job: toSafeString(row["직업"]),
          // 통합된 필드 매핑
          score1: toSafeString(row["숙소는 이용하기 편리했다"] || row["숙소(문항1)"] || row["숙소"] || ""),
          score5: toSafeString(row["시설 및 산책로 등에 만족한다"] || row["시설/야외(문항)"] || row["시설/야외"] || row["프로그램장소(문항5)"] || ""),
          score11: toSafeString(row["프로그램 안내 및 운영방식은 만족스러웠다"] || row["운영(문항)"] || row["운영"] || row["운영(문항11)"] || ""),
          score14: toSafeString(row["재료가 신선하고 맛있는 식사가 제공되었다"] || row["식사(문항)"] || row["식사"] || row["식당(문항3)"] || ""),
          facility_opinion: toSafeString(row["시설의견"] || ""),
          operation_opinion: toSafeString(row["운영의견"] || "")
        };

        // 특히 숫자 데이터는 다시 한번 확인
        const scoreFields = [
          'score1', 'score5', 'score11', 'score14'
        ];
        
        scoreFields.forEach(field => {
          if (typeof newRow[field] !== 'string') {
            console.warn(`엑셀 가져오기: ${field}가 문자열이 아닙니다:`, newRow[field]);
            newRow[field] = String(newRow[field] || "");
          }
        });
        
        return newRow;
      });

      console.log("변환된 엑셀 데이터:", newRows);
      setRows(newRows);

      Swal.fire({
        icon: 'success',
        title: '엑셀 데이터 가져오기 완료',
        text: `${newRows.length}개의 항목이 로드되었습니다.`
      });
    }
  };

  const addRow = () => {
    const newRow = { ...initRowData, idx: uuidv4() };
    setRows([...rows, newRow]);
  };

  const removeRow = () => {
    const checkedRows = rows.filter(row => row.chk);
    if (checkedRows.length === 0) {
      Swal.fire({ icon: 'warning', title: '확인', text: "삭제할 항목을 선택해 주십시오." });
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
        // 삭제를 위해 ID가 있는 항목 필터링
        const rowsToDelete = checkedRows.filter(row => row.id);
        
        // UI에서 먼저 제거
        const newRows = rows.filter(row => !row.chk);
        setRows(newRows);
        
        // 서버에 저장된 항목이 있으면 GraphQL을 통해 삭제
        if (rowsToDelete.length > 0) {
          console.log(`${rowsToDelete.length}개 항목 서버에서 삭제 시작`);
          
          // 각 항목에 대해 DELETE mutation 실행
          const deletePromises = rowsToDelete.map(row => {
            return deleteServiceForm({
              variables: { id: parseInt(row.id, 10) }
            });
          });
          
          // 모든 DELETE 요청이 완료된 후 처리
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
    const newRows = [...rows];
    newRows[idx].chk = checked;
    setRows(newRows);
  };

  const changeValue = (idx, name, value) => {
    const newRows = [...rows];
    newRows[idx][name] = value;
    setRows(newRows);
  };

  // 참가자 정보 일괄 적용 처리
  const setAllData = (obj) => {
    console.log('[Service] setAllData 호출됨:', obj);
    
    if (obj.type === 'all') {
      // 전체 데이터 교체 (참가자 정보 일괄 적용 시)
      if (Array.isArray(obj.value)) {
        console.log(`[Service] setAllData: 전체 ${obj.value.length}개 행 업데이트`);
        
        // 각 행에 필요한 기본 필드 확인 및 추가
        const processedRows = obj.value.map(row => {
          return {
            ...initRowData,  // 기본 필드
            ...row,          // 새 데이터
            idx: row.idx || uuidv4(),  // idx 필드 보장
          };
        });
        
        setRows(processedRows);
        return;
      }
      return;
    }
    
    // 기존 로직 (체크된 행에 값 일괄 적용)
    const checkedRows = rows.filter(item => item.chk);
    
    if (checkedRows.length === 0) {
      Swal.fire({ icon: 'warning', title: '확인', text: '선택된 항목이 없습니다' });
      return;
    }
    
    setRows(rows.map(row => {
      if (row.chk) {
        return { ...row, [obj.type]: obj.value };
      }
      return row;
    }));
  };

  const onChangeSearchInfo = (name, value) => {
    try {
      console.log('[Service] onChangeSearchInfo:', name, value);
      
      if (name === undefined || value === undefined) {
        console.warn('[Service] onChangeSearchInfo called with undefined parameters');
        return;
      }
      
      // agency_id는 정수로 변환하여 저장
      const processedValue = name === 'agency_id' ? (value ? parseInt(value, 10) : null) : value;
      
      setSearchInfo(prev => {
        const newSearchInfo = { ...prev, [name]: processedValue };
        
        // 기관 ID가 변경되면 해당 기관의 시작일자도 자동으로 설정
        if (name === 'agency_id' && processedValue && organizations.length > 0) {
          const selectedOrg = organizations.find(org => org.id === parseInt(processedValue));
          if (selectedOrg && selectedOrg.start_date) {
            newSearchInfo.openday = selectedOrg.start_date;
            console.log('[Service] 기관 선택으로 시작일자 자동 설정:', selectedOrg.start_date);
          }
        }
        
        // 기관선택(agency, agency_id) 또는 시작일자(openday) 변경 시 부모 컴포넌트에 알림
        if ((name === 'agency' || name === 'agency_id' || name === 'openday') && 
            parentOnOrganizationChange && 
            typeof parentOnOrganizationChange === 'function') {
          
          console.log('[Service] 부모 컴포넌트에 기관 정보 변경 알림:', {
            name,
            value: processedValue,
            newSearchInfo
          });
          
          // 기관 ID가 변경된 경우, 기관명과 시작일자도 함께 전달
          if (name === 'agency_id' && processedValue && organizations.length > 0) {
            const selectedOrg = organizations.find(org => org.id === parseInt(processedValue));
            if (selectedOrg) {
              // 한 번에 모든 기관 정보를 전달
              setTimeout(() => {
                parentOnOrganizationChange({
                  target: {
                    name: 'agency_id',
                    value: processedValue
                  }
                });
              }, 0);
              return newSearchInfo;
            }
          }
          
          // 다른 필드들은 개별적으로 전달
          parentOnOrganizationChange({
            target: {
              name: name,
              value: processedValue
            }
          });
        }
        
        return newSearchInfo;
      });
    } catch (err) {
      console.error('[Service] Error in onChangeSearchInfo:', err);
    }
  };

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

  // 기관 선택 변경 핸들러
  const handleOrganizationChange = (e) => {
    const orgId = e.target.value;
    
    if (orgId === '') {
      // 기관 선택이 해제된 경우
      onChangeSearchInfo('agency_id', null);
      onChangeSearchInfo('agency', '');
      return;
    }
    
    // 문자열을 정수로 변환
    const numericOrgId = parseInt(orgId, 10);
    const selectedOrg = organizations.find(org => parseInt(org.id, 10) === numericOrgId);
    
    if (selectedOrg) {
      // 기관명과 ID 업데이트
      onChangeSearchInfo('agency_id', numericOrgId);
      onChangeSearchInfo('agency', selectedOrg.group_name);
      console.log(`Selected org: ${selectedOrg.group_name}, ID: ${numericOrgId}`);
    } else {
      onChangeSearchInfo('agency_id', null);
      onChangeSearchInfo('agency', '');
    }
  };

  return (
    <MainCard title="서비스 환경 만족도">
      <SearchInfo 
        ref={searchInfoRef}
        searchInfo={searchInfo} 
        onChange={(name, value) => {
          try {
            console.log('[Service] SearchInfo onChange:', name, value);
            onChangeSearchInfo(name, value);
          } catch (err) {
            console.error('[Service] Error handling SearchInfo onChange:', err);
          }
        }}
        onSearch={onSearch}
      />
      
      <ServiceFormToolbar
        onSearch={onSearch}
        onSave={onSave}
        onDataProcessed={onChangeExcel}
        startRow={3}
        type="service"
      />

      <InsertForm
        ref={insertFormRef}
        rows={rows} 
        addRow={addRow} 
        removeRow={removeRow} 
        changeValue={changeValue}
        onCheckChange={onCheckChange}
        setAllData={setAllData}
      />
    </MainCard>
  );
});

export default Service;