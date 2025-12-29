import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import Select from 'ui-component/inputs/select';
import InsertForm from './insertForm';
import SearchInfo from './searchInfo';
import ServiceFormToolbar from "ui-component/ServiceFormToolbar";
import { initRowData, processExcelData } from './fields';

// GraphQL operations
const CREATE_PREVENT_FORM = gql`
  mutation CreatePreventForm($input: PreventFormInput!) {
    createPreventForm(input: $input) {
      id
      prevent_seq
      agency
      openday
      eval_date
    }
  }
`;

const UPDATE_PREVENT_FORM = gql`
  mutation UpdatePreventForm($id: Int!, $input: PreventFormInput!) {
    updatePreventForm(id: $id, input: $input) {
      id
      prevent_seq
      agency
      openday
      eval_date
    }
  }
`;

const GET_PREVENT_FORMS = gql`
  query GetPreventForms($agency: String, $openday: String, $eval_date: String) {
    getPreventForms(agency: $agency, openday: $openday, eval_date: $eval_date) {
      id
      agency
      agency_id
      openday
      eval_date
      ptcprogram
      prevent_contents
      session1
      session2
      pv
      prevent_seq
      sex
      age
      residence
      job
      past_experience
      score1
      score2
      score3
      score4
      score5
      score6
      score7
      score8
      score9
      score10
      score11
      score12
      score13
      score14
      score15
      score16
      score17
      score18
      score19
      score20
      score21
      score22
      score23
      score24
      score25
      score26
      score27
      score28
      score29
      score30
    }
  }
`;

const PreventForm = () => {
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();

  // State for form data
  const [rows, setRows] = useState([{ ...initRowData, idx: uuidv4() }]);
  const [searchInfo, setSearchInfo] = useState({
    agency: '',
    agency_id: null,
    openday: '',
    eval_date: '',
    ptcprogram: '',
    prevent_contents: '',
    session1: '',
    session2: '',
    pv: ''
  });
  const [deleteRow, setDeleteRow] = useState([]);

  // GraphQL query to fetch prevent forms
  const { refetch } = useQuery(GET_PREVENT_FORMS, {
    variables: {
      agency: searchInfo.agency || null,
      openday: searchInfo.openday || null,
      eval_date: searchInfo.eval_date || null
    },
    skip: !searchInfo.agency || !searchInfo.openday || !searchInfo.eval_date,
    onCompleted: (data) => {
      if (data && data.getPreventForms && data.getPreventForms.length > 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        
        // Transform forms to rows format
        const formRows = data.getPreventForms.map(form => ({
          idx: uuidv4(),
          id: form.id || "",
          chk: false,
          prevent_seq: form.prevent_seq || "",
          sex: form.sex || "미기재",
          age: form.age || "",
          residence: form.residence || "미기재",
          job: form.job || "",
          past_experience: form.past_experience || "",
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
        const mostRecentForm = data.getPreventForms[0];
        setSearchInfo(prev => ({
          ...prev,
          agency: mostRecentForm.agency || prev.agency,
          agency_id: mostRecentForm.agency_id || prev.agency_id,
          name: mostRecentForm.name || prev.name,
          openday: mostRecentForm.openday || prev.openday,
          eval_date: mostRecentForm.eval_date || prev.eval_date,
          ptcprogram: mostRecentForm.ptcprogram || prev.ptcprogram,
          prevent_contents: mostRecentForm.prevent_contents || prev.prevent_contents,
          session1: mostRecentForm.session1 || prev.session1,
          session2: mostRecentForm.session2 || prev.session2,
          pv: mostRecentForm.pv || prev.pv
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

  // GraphQL mutation to create prevent form
  const [createPreventForm] = useMutation(CREATE_PREVENT_FORM, {
    onCompleted: (data) => {
      if (data.createPreventForm) {
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
              prevent_contents: "",
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

  // GraphQL mutation to update prevent form
  const [updatePreventForm] = useMutation(UPDATE_PREVENT_FORM);

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
        session1: data[9] || '',
        session2: data[10] || '',
        pv: data[11] || ''
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
        prevent_contents: "",
        session1: '',
        session2: '',
        pv: ''
      });
    };
  }, [location.state, refetch]);

  const onSave = () => {
    if(!searchInfo.agency) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "기관을 선택해주세요.",
      });
      return;
    }

    if(!searchInfo.openday) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "시작일을 입력해주세요.",
      });
      return;
    }

    if(!searchInfo.eval_date) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "실시일자를 입력해주세요.",
      });
      return;
    }

    // Check if rows have required data
    const missingData = rows.some(row => {
      // Check for required fields
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

    // For consolidated model, create a separate form for each row
    const promises = rows.map(row => {
      const input = {
        agency: searchInfo.agency,
        agency_id: searchInfo.agency_id ? parseInt(searchInfo.agency_id, 10) : null,
        name: searchInfo.name || "",
        openday: searchInfo.openday,
        eval_date: searchInfo.eval_date,
        ptcprogram: searchInfo.ptcprogram || "",
        prevent_contents: searchInfo.prevent_contents || "",
        session1: searchInfo.session1 || "",
        session2: searchInfo.session2 || "",
        pv: searchInfo.pv || "",
        prevent_seq: row.prevent_seq || null,
        sex: row.sex || "미기재",
        age: row.age || "",
        residence: row.residence || "미기재",
        job: row.job || "",
        past_experience: row.past_experience || "",
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
        return updatePreventForm({
          variables: {
            id: parseInt(row.id, 10),
            input
          }
        });
      } else {
        return createPreventForm({
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
              prevent_contents: "",
              session1: "",
              session2: "",
              pv: ""
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
    if (!searchInfo.agency || !searchInfo.openday || !searchInfo.eval_date) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "필수 기본정보(기관명, 시작일, 실시일자)를 모두 입력해 주십시오.",
      });
      return;
    }

    refetch({
      agency: searchInfo.agency,
      openday: searchInfo.openday,
      eval_date: searchInfo.eval_date
    });
  };

  const onChangeExcel = (excelData) => {
    const processedData = processExcelData(excelData);
    if (processedData && processedData.length > 0) {
      setRows(processedData);
    }
  };

  const onCheckChange = (idx, checked) => {
    setRows(prev => 
      prev.map(row => 
        row.idx === idx ? { ...row, chk: checked } : row
      )
    );
  };

  const changeValue = (idx, name, value) => {
    setRows(prev => 
      prev.map(row => 
        row.idx === idx ? { ...row, [name]: value } : row
      )
    );
  };

  const setAllData = (type, value) => {
    if (type === "addRow") {
      setRows(prev => [...prev, { ...initRowData, idx: uuidv4() }]);
    } else if (type === "removeRow") {
      const selectedRows = rows.filter(row => row.chk);
      if (selectedRows.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: '확인',
          text: "삭제할 항목을 선택해주세요.",
        });
        return;
      }

      const selectedIds = selectedRows.map(row => row.idx);
      const deletedSeqs = selectedRows
        .filter(row => row.prevent_seq)
        .map(row => row.prevent_seq);
      
      setDeleteRow(prev => [...prev, ...deletedSeqs]);
      setRows(prev => prev.filter(row => !selectedIds.includes(row.idx)));
    } else {
      setRows(prev => 
        prev.map(row => ({ ...row, [type]: value }))
      );
    }
  };

  const onChangeSearchInfo = (name, value) => {
    setSearchInfo(prev => ({ ...prev, [name]: value }));
  };

  const getUserTemp = (agency) => {
    // This would typically be a GraphQL query to get user templates
    // For now, just show an alert
    Swal.fire({
      icon: 'info',
      title: '정보',
      text: `사용자 템플릿을 요청했습니다: ${agency}`,
    });
  };

  return (
    <MainCard title="예방서비스 효과평가">
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
        type="preventForm"
      />
      
      <InsertForm 
        rows={rows}
        onCheckChange={onCheckChange}
        onChange={changeValue}
        setAllData={setAllData}
        getUserTemp={getUserTemp}
      />
    </MainCard>
  );
};

export default PreventForm; 