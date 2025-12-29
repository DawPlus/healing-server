import React, { useState, useEffect, useCallback } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import ExcelUpload from 'ui-component/excelUploader';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Grid from '@mui/material/Grid';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import { formatDate, showConfirmDialog, parseAgencyUser } from 'utils/serviceFormUtils';

/**
 * Template for creating a service form component
 * 
 * @param {Object} props 
 * @param {string} props.formType - Type of form (e.g., 'hrv', 'service')
 * @param {Object} props.initRowData - Initial row data
 * @param {Object} props.graphqlQueries - GraphQL queries for the form
 * @param {Object} props.graphqlMutations - GraphQL mutations for the form
 * @param {Array} props.requiredFields - Required fields for search info
 * @param {Array} props.columns - Table columns
 * @param {Object} props.excelMapping - Mapping from Excel columns to row fields
 * @param {Function} props.transformResponseToRows - Function to transform GraphQL response to rows
 * @param {Function} props.transformRowsToEntries - Function to transform rows to GraphQL entries
 * @returns {React.Component}
 */
export const createServiceForm = (options) => {
  const {
    formType,
    formTitle,
    initRowData,
    graphqlQueries,
    graphqlMutations,
    requiredFields,
    columns,
    excelMapping,
    transformResponseToRows,
    transformRowsToEntries,
    renderSearchFields,
    renderInsertForm
  } = options;

  return function ServiceForm() {
    // React Router hooks
    const location = useLocation();
    const navigate = useNavigate();
    
    // State for form data
    const [rows, setRows] = useState([{ ...initRowData, idx: uuidv4() }]);
    const [searchInfo, setSearchInfo] = useState({
      agency: '',
      openday: '',
      eval_date: '',
      ptcprogram: '',
      // Custom fields can be added here
    });
    const [deleteRows, setDeleteRows] = useState([]);
    
    // GraphQL query to fetch forms
    const { refetch } = graphqlQueries.useGetForms({
      variables: {
        agency: searchInfo.agency || null,
        openday: searchInfo.openday || null,
        eval_date: searchInfo.eval_date || null
      },
      skip: !searchInfo.agency || !searchInfo.openday || !searchInfo.eval_date,
      onCompleted: (data) => {
        if (data && data[`get${formType}Forms`] && data[`get${formType}Forms`].length > 0) {
          Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
          
          // Transform the data to match the expected structure
          const transformedRows = transformResponseToRows(data[`get${formType}Forms`][0]);
          
          setRows(transformedRows);
          
          // Update any additional search info from the response
          updateSearchInfoFromResponse(data[`get${formType}Forms`][0]);
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

    const updateSearchInfoFromResponse = (responseData) => {
      if (!responseData) return;
      
      const updateData = {};
      
      // Common fields
      if (responseData.ptcprogram) {
        updateData.ptcprogram = responseData.ptcprogram;
      }
      
      // Custom fields can be added here based on the form type
      
      if (Object.keys(updateData).length > 0) {
        setSearchInfo(prev => ({
          ...prev,
          ...updateData
        }));
      }
    };

    // GraphQL mutation to create form
    const [createForm] = graphqlMutations.useCreateForm({
      onCompleted: (data) => {
        if (data[`create${formType}Form`]) {
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
              resetSearchInfo();
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

    const resetSearchInfo = () => {
      setSearchInfo({
        agency: "",
        openday: "",
        eval_date: "",
        ptcprogram: "",
        // Reset custom fields here
      });
    };

    // Effect to handle location state updates
    useEffect(() => {
      if (!location.state) return;
      
      const { data } = location.state;
      
      if (data) {
        handleLocationStateData(data);
      }
      
      return () => {
        // Cleanup
        setRows([{ ...initRowData, idx: uuidv4() }]);
        resetSearchInfo();
      };
    }, [location.state, refetch]);

    const handleLocationStateData = (data) => {
      // Extract values from location state data
      // This will vary by form type
      const [col1, col2, col3] = [
        data[6], data[3], data[7]
      ];
      
      const formattedDate = formatDate();
      
      setSearchInfo({
        agency: col1 || "",
        openday: col2 || "",
        eval_date: formattedDate,
        ptcprogram: "",
        // Set custom fields here
      });
      
      // Trigger refetch with new parameters
      if (col1 && col2) {
        refetch({
          agency: col1,
          openday: col2,
          eval_date: formattedDate
        });
      }
    };

    const onSave = () => {
      // Check if all required fields are filled
      const hasEmptyValues = requiredFields.some(field => !searchInfo[field]);

      if (hasEmptyValues) {
        Swal.fire({
          icon: 'warning',
          title: '확인',
          text: `필수 기본정보(${requiredFields.join(', ')})를 모두 입력해 주십시오.`,
        });
        return;
      }

      // Prepare data for GraphQL mutation
      try {
        // Prepare input
        const input = {
          agency: searchInfo.agency,
          openday: searchInfo.openday,
          eval_date: searchInfo.eval_date,
          ptcprogram: searchInfo.ptcprogram || "",
          // Add custom fields here
        };

        // Prepare entries data from rows
        const entries = transformRowsToEntries(rows);

        showConfirmDialog(
          `${formTitle} 등록`,
          '항목을 등록 하시겠습니까?',
          () => {
            createForm({
              variables: { input, entries }
            });
          }
        );
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
      // Check if all required fields are filled
      const hasEmptyValues = requiredFields.some(field => !searchInfo[field]);
      
      if (hasEmptyValues) {
        Swal.fire({
          icon: 'warning',
          title: '확인',
          text: `필수 조회조건(${requiredFields.join(', ')})을 입력해 주십시오`,
        });
        return;
      }
      
      refetch({
        agency: searchInfo.agency,
        openday: searchInfo.openday,
        eval_date: searchInfo.eval_date
      });
    };

    const onChangeExcel = useCallback((excelData) => {
      if (!excelData || !excelData.data || excelData.data.length === 0) {
        return;
      }
      
      try {
        // Map Excel data to rows
        const processedData = excelData.data.map((row, idx) => {
          const newRow = { ...initRowData, idx: uuidv4(), chk: false };
          
          // Apply mapping
          Object.entries(excelMapping).forEach(([fieldName, colIndex]) => {
            const colName = `col${colIndex}`;
            if (row[colName] !== undefined) {
              newRow[fieldName] = row[colName] || "";
            }
          });
          
          return newRow;
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
    }, [excelMapping, initRowData]);

    const addRow = useCallback(() => {
      setRows(prev => [...prev, { ...initRowData, idx: uuidv4() }]);
    }, [initRowData]);

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

      const selectedIds = selectedRows.map(row => row.idx);
      
      // Get any sequenced rows to be deleted
      const seqField = `${formType.toUpperCase()}_SEQ`;
      const deletedSeqs = selectedRows
        .filter(row => row[seqField])
        .map(row => row[seqField]);
      
      setDeleteRows(prev => [...prev, ...deletedSeqs]);
      setRows(prev => prev.filter(row => !selectedIds.includes(row.idx)));
    }, [rows, formType]);

    const onCheckChange = useCallback((idx, checked) => {
      setRows(prev => 
        prev.map(row => 
          row.idx === idx ? { ...row, chk: checked } : row
        )
      );
    }, []);

    const changeValue = useCallback((idx, name, value) => {
      setRows(prev => 
        prev.map(row => 
          row.idx === idx ? { ...row, [name]: value } : row
        )
      );
    }, []);

    const setAllData = useCallback((type, value) => {
      setRows(prev => 
        prev.map(row => ({ ...row, [type]: value }))
      );
    }, []);

    const onChangeSearchInfo = useCallback((name, value) => {
      setSearchInfo(prev => ({ ...prev, [name]: value }));
    }, []);

    const getUserTemp = useCallback((agencyInfo) => {
      const { agency, openday } = parseAgencyUser(agencyInfo);
      
      if (!agency || !openday) {
        Swal.fire({ icon: 'warning', title: '확인', text: "기관정보가 유효하지 않습니다." });
        return;
      }

      const formattedDate = formatDate();

      setSearchInfo({
        agency,
        openday,
        eval_date: formattedDate,
        ptcprogram: "",
        // Clear custom fields here
      });

      // Fetch user data from API (previously handled by saga)
      // For now, we'll just refetch the form data
      refetch({
        agency,
        openday,
        eval_date: formattedDate
      });
    }, [refetch]);

    // Render the component
    return (
      <>
        <MainCard style={{ marginTop: "10px" }}>
          {/* Search Info Section */}
          {renderSearchFields({ 
            searchInfo, 
            onChangeSearchInfo 
          })}
          <div style={{ marginTop: "10px" }}>
            <Button variant="contained" size="small" color="secondary" onClick={onSearch}>조회</Button>
            <Button variant="contained" size="small" color="primary" onClick={onSave} style={{ marginLeft: "5px" }}>전송</Button>
            <ExcelUpload onDataProcessed={onChangeExcel} startRow={3} type={formType} />
          </div>
        </MainCard>
        
        <MainCard style={{ marginTop: "10px", minHeight: "400px" }}>
          {/* Pass row data and handlers to InsertForm */}
          {renderInsertForm({
            rows,
            onAdd: addRow,
            onRemove: removeRow,
            onCheckChange,
            onChange: changeValue,
            onSetValue: setAllData,
            onGetUserTemp: getUserTemp
          })}
        </MainCard>
      </>
    );
  };
};

export default createServiceForm; 