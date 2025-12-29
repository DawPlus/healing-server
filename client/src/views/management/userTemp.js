import React, { useState, useEffect } from "react";
import { Button, Grid, IconButton, Tooltip, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import Swal from "sweetalert2";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import DatePicker from "ui-component/inputs/datePicker";
import { Input, SelectItems } from "ui-component/inputs";
import UserInfos, { Sex, Age, Residence, Job } from "./userinfos";
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_USER_TEMP, 
  GET_USER_TEMP_AGENCIES, 
  GET_ORGANIZATION_LIST,
  CREATE_USER_TEMP, 
  UPDATE_USER_TEMP,
  DELETE_USER_TEMP 
} from '../../graphql/userTemp';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';

const initUserTempRow = {
  seq: "",
  id: "",
  name: "",
  sex: "",
  age: "",
  residence: "",
  job: "",
  idx: uuidv4(),
};

const UserTemp = () => {
  // State Management
  const [userTemp, setUserTemp] = useState(new Array(20).fill(null).map(() => ({ ...initUserTempRow, idx: uuidv4() })));
  const [agency, setAgency] = useState("");
  const [openday, setOpenday] = useState("");
  const [agencySelect, setAgencySelect] = useState("");
  const [opendaySelect, setOpendaySelect] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [tempEditData, setTempEditData] = useState(null);

  // GraphQL Queries & Mutations
  const { data: agenciesData } = useQuery(GET_USER_TEMP_AGENCIES);
  const { loading: organizationsLoading, error: organizationsError, data: organizationsData } = useQuery(GET_ORGANIZATION_LIST, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching organizations list:', error);
    }
  });
  const [createUserTempMutation] = useMutation(CREATE_USER_TEMP);
  const [updateUserTempMutation] = useMutation(UPDATE_USER_TEMP);
  const [deleteUserTempMutation] = useMutation(DELETE_USER_TEMP);
  
  // Load user temp data based on selected agency and openday
  const { data: userTempData, refetch } = useQuery(GET_USER_TEMP, {
    variables: { agency, openday },
    skip: !agency || !openday,
    fetchPolicy: 'network-only'
  });

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    try {
      return moment(dateString).format('YYYY-MM-DD');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Process agency data when available
  useEffect(() => {
    if (agenciesData?.getUserTempAgencies && agenciesData.getUserTempAgencies.length > 0) {
      const firstAgency = agenciesData.getUserTempAgencies[0];
      setAgencySelect(firstAgency.agency);
    }
  }, [agenciesData]);

  // Update userTemp when data is fetched
  useEffect(() => {
    if (userTempData?.getUserTemp) {
      if (userTempData.getUserTemp.length > 0) {
        // Map the data and add unique id
        setUserTemp(userTempData.getUserTemp.map(item => ({
          ...item,
          idx: uuidv4()
        })));
      } else {
        // Reset to default rows if no data
        setUserTemp(new Array(20).fill(null).map(() => ({ ...initUserTempRow, idx: uuidv4() })));
      }
    }
  }, [userTempData]);

  // Start editing a row
  const startEditing = (row) => {
    if (!row.id) {
      Swal.fire({
        icon: 'warning',
        title: '편집 불가',
        text: '저장된 데이터만 개별 편집이 가능합니다.',
        confirmButtonText: '확인',
      });
      return;
    }
    
    setEditingRow(row.id);
    setTempEditData({...row});
  };

  // Cancel editing a row
  const cancelEditing = () => {
    setEditingRow(null);
    setTempEditData(null);
  };

  // Save edited row
  const saveRow = async (row) => {
    if (!row.id) return;
    
    // 신청자명과 연령 검증
    if ((!row.name || row.name.trim() === '') && (!row.age || row.age.toString().trim() === '')) {
      Swal.fire({
        icon: 'info',
        title: '안내',
        text: '신청자명 또는 연령을 입력해주세요.',
        confirmButtonText: '확인',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // UserTempInput 스키마에 맞게 필드 정리
      const cleanedData = {
        seq: row.seq || '',
        name: row.name || '',
        sex: row.sex || '',
        age: String(row.age || ''), // age를 문자열로 변환
        residence: row.residence || '',
        job: row.job || '',
        agency: row.agency,
        openday: row.openday
      };
      
      console.log('Saving cleaned row data:', cleanedData);
      
      const { data } = await updateUserTempMutation({
        variables: {
          id: parseInt(row.id),
          input: cleanedData
        }
      });
      
      if (data?.updateUserTemp?.success) {
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '데이터가 업데이트되었습니다.',
          confirmButtonText: '확인',
        });
        setEditingRow(null);
        refetch();
      } else {
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: data?.updateUserTemp?.message || '업데이트 중 오류가 발생했습니다.',
          confirmButtonText: '확인',
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '업데이트 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving user temp data
  const onSave = async () => {
    // 날짜 디버깅을 위한 로그
    console.log('Saving with values:', { agencySelect, opendaySelect });
    
    // UserTempInput 스키마에 맞게 필드 정리
    // id, idx 필드 제거하고 age가 숫자일 경우 문자열로 변환
    // name이나 age가 비어있는 행은 필터링하여 제외
    const currentUserTemp = userTemp
      .filter(item => {
        // 신청자명이나 연령 중 하나라도 비어있으면 제외
        return (item.name && item.name.trim() !== '') || (item.age && item.age.toString().trim() !== '');
      })
      .map(item => {
        // 필요한 필드만 추출하고 타입 변환
        const cleanedItem = {
          seq: item.seq || '',
          name: item.name || '',
          sex: item.sex || '',
          age: String(item.age || ''), // age를 문자열로 변환
          residence: item.residence || '',
          job: item.job || '',
          agency: agencySelect || agency,
          openday: opendaySelect || openday
        };
        
        return cleanedItem;
      });

    // Validate required fields
    if (!agencySelect && !agency) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '기관은 필수 입력 항목입니다.',
        confirmButtonText: '확인',
      });
      return;
    }

    if (!opendaySelect && !openday) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '시작일은 필수 입력 항목입니다.',
        confirmButtonText: '확인',
      });
      return;
    }

    console.log('Cleaned data for saving:', currentUserTemp);
    
    // 저장할 데이터가 없으면 알림
    if (currentUserTemp.length === 0) {
      Swal.fire({
        icon: 'info',
        title: '안내',
        text: '저장할 데이터가 없습니다. 신청자명 또는 연령을 입력해주세요.',
        confirmButtonText: '확인',
      });
      return;
    }

    if (window.confirm("저장하시겠습니까?")) {
      setIsLoading(true);
      try {
        const { data } = await createUserTempMutation({
          variables: {
            input: currentUserTemp
          }
        });

        if (data?.createUserTemp?.success) {
          Swal.fire({
            icon: 'success',
            title: '성공',
            text: '저장되었습니다.',
            confirmButtonText: '확인',
          });
          // Set the agency/openday and refresh data
          setAgency(agencySelect);
          setOpenday(opendaySelect);
          refetch();
        } else {
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: data?.createUserTemp?.message || '오류가 발생했습니다.',
            confirmButtonText: '확인',
          });
        }
      } catch (error) {
        console.error("Save error:", error);
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: '저장 중 오류가 발생했습니다.',
          confirmButtonText: '확인',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add a new row to the userTemp array
  const onAdd = () => {
    setUserTemp(prev => [...prev, { ...initUserTempRow, idx: uuidv4() }]);
  };

  // Update row data with values from first row
  const setRowData = () => {
    Swal.fire({
      icon: 'warning',
      title: '정보수정',
      text: '첫번째행의 정보로 업데이트 됩니다.',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: "취소"
    }).then((result) => {
      if (result.isConfirmed && userTemp.length > 0) {
        const firstRow = userTemp[0];
        setUserTemp(prev => prev.map(row => ({
          ...row,
          sex: firstRow.sex,
          age: firstRow.age,
          residence: firstRow.residence,
          job: firstRow.job,
        })));
      }
    });
  };

  // Handle input changes in table rows
  const onChangeUserTemp = (index, key, value) => {
    setUserTemp(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [key]: value };
      return newData;
    });
  };

  // Handle input changes for editing row
  const onChangeEditRow = (key, value) => {
    setTempEditData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle agency select change
  const onChangeAgency = (e) => {
    setAgencySelect(e.target.value);
  };

  // Search for data based on selected agency and openday
  const onSearch = () => {
    if (!agencySelect || !opendaySelect) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '[기관, 시작일] 을 선택해 주십시오',
        confirmButtonText: '확인',
      });
      return;
    }

    setAgency(agencySelect);
    setOpenday(opendaySelect);
    refetch({ agency: agencySelect, openday: opendaySelect });
  };

  // Delete data for selected agency and openday
  const onDelete = () => {
    if (!agencySelect || !opendaySelect) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '[기관, 시작일] 을 선택해 주십시오',
        confirmButtonText: '확인',
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '삭제',
      text: '해당 기관의 참가자정보를 삭제 하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: "취소"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await deleteUserTempMutation({
            variables: {
              agency: agencySelect,
              openday: opendaySelect
            }
          });

          if (data?.deleteUserTemp?.success) {
            Swal.fire({
              icon: 'success',
              title: '확인',
              text: '삭제 되었습니다.'
            });
            
            // Reset form and refetch agency list
            setAgency("");
            setOpenday("");
            setAgencySelect("");
            setOpendaySelect("");
            setUserTemp(new Array(20).fill(null).map(() => ({ ...initUserTempRow, idx: uuidv4() })));
            
            // Refetch the agencies list
            refetch();
          } else {
            Swal.fire({
              icon: 'error',
              title: '오류',
              text: data?.deleteUserTemp?.message || '삭제 중 오류가 발생했습니다.'
            });
          }
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({
            icon: 'error',
            title: '오류',
            text: '삭제 중 오류가 발생했습니다.'
          });
        }
      }
    });
  };

  // Format organization items for dropdown using getPage1List
  const organizationItems = organizationsData?.getPage1List?.map(item => ({ 
    label: `${item.group_name} (${formatDateForDisplay(item.start_date)} ~ ${formatDateForDisplay(item.end_date)})`, 
    value: item.group_name 
  })) || [];

  // Format agency items for dropdown from the userTempAgency data
  const agencyItems = agenciesData?.getUserTempAgencies?.map(item => ({ 
    label: item.agency, 
    value: item.agency 
  })) || [];
  
  // Combine both sources with organizations having priority
  const combinedAgencyItems = [
    ...organizationItems,
    ...agencyItems.filter(agencyItem => 
      !organizationItems.some(orgItem => orgItem.value === agencyItem.value)
    )
  ];

  return (
    <MainCard title="참가자 정보관리" secondary={
      <div style={{ display: "flex" }}>
        <Button variant="contained" color="primary" size="small" style={{ margin: "0px 5px" }} onClick={onSave} disabled={isLoading}>
          저장
        </Button>
        <Button variant="contained" color="warning" size="small" style={{ margin: "0px 5px" }} onClick={setRowData}>
          정보수정
        </Button>
      </div>
    }>
      <Grid container xs={12} style={{ margin: "20px 0px", display: "flex", alignItems: "center" }}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>기관</InputLabel>
            <Select
              value={agencySelect}
              onChange={onChangeAgency}
              label="기관"
              disabled={organizationsLoading}
            >
              {organizationsLoading ? (
                <MenuItem value="">
                  <CircularProgress size={24} />
                </MenuItem>
              ) : organizationsError ? (
                <MenuItem value="">
                  <div>데이터 로딩 오류</div>
                </MenuItem>
              ) : (
                combinedAgencyItems.map((item, index) => (
                  <MenuItem key={`${item.value}-${index}`} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <input 
            type="date" 
            style={{ 
              padding: '8.5px 14px',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              width: '100%',
              fontSize: '16px'
            }}
            value={opendaySelect}
            onChange={(e) => {
              console.log('Date selected:', e.target.value);
              setOpendaySelect(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={5} style={{ display: "flex", gap: "5px" }}>
          <Button variant="outlined" color="primary" size="medium" onClick={onSearch}>조회</Button>
          <Button variant="outlined" color="error" size="medium" onClick={onDelete}>삭제</Button>
        </Grid>
      </Grid>
      
      <div style={{ padding: "15px 5px" }}>
        <Button variant="contained" color="primary" size="small" style={{ margin: "0px 5px" }} onClick={onAdd}>
          추가
        </Button>
      </div>

      <TableContainer style={{ minHeight: "60vh", maxHeight: "60vh", overflow: "auto" }}>
        <Table stickyHeader className="fixed_header">
          <TableHead>
            <TableRow>
              <TableCell style={{ minWidth: 70 }}>번호</TableCell>
              <TableCell style={{ minWidth: 100 }}>신청자명</TableCell>
              <TableCell style={{ minWidth: 70 }}>성별</TableCell>
              <TableCell style={{ minWidth: 80 }}>연령</TableCell>
              <TableCell style={{ minWidth: 100 }}>거주지역</TableCell>
              <TableCell style={{ minWidth: 150 }}>직업</TableCell>
              <TableCell style={{ minWidth: 80 }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userTemp.map((row, index) => (
              <TableRow key={row.idx}>
                {editingRow === row.id ? (
                  // Editing mode
                  <>
                    <TableCell>
                      <Input
                        value={tempEditData.seq}
                        style={{ minWidth: "70px" }}
                        onChange={e => onChangeEditRow("seq", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={tempEditData.name}
                        style={{ minWidth: "70px" }}
                        onChange={e => onChangeEditRow("name", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Sex
                        value={tempEditData.sex}
                        onChange={e => onChangeEditRow("sex", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Age
                        value={tempEditData.age}
                        onChange={e => onChangeEditRow("age", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Residence
                        value={tempEditData.residence}
                        onChange={e => onChangeEditRow("residence", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Job
                        value={tempEditData.job}
                        onChange={e => onChangeEditRow("job", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="저장">
                        <IconButton size="small" color="primary" onClick={() => saveRow(tempEditData)} disabled={isLoading}>
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="취소">
                        <IconButton size="small" color="default" onClick={cancelEditing}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </>
                ) : (
                  // Normal mode
                  <>
                    <TableCell>
                      <Input
                        value={row.seq}
                        style={{ minWidth: "70px" }}
                        onChange={e => onChangeUserTemp(index, "seq", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.name}
                        style={{ minWidth: "70px" }}
                        onChange={e => onChangeUserTemp(index, "name", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Sex
                        value={row.sex}
                        onChange={e => onChangeUserTemp(index, "sex", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Age
                        value={row.age}
                        onChange={e => onChangeUserTemp(index, "age", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Residence
                        value={row.residence}
                        onChange={e => onChangeUserTemp(index, "residence", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Job
                        value={row.job}
                        onChange={e => onChangeUserTemp(index, "job", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      {row.id && (
                        <Tooltip title="수정">
                          <IconButton size="small" color="primary" onClick={() => startEditing(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

// 컴포넌트 내보내기
export default UserTemp;