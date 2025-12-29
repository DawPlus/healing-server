import React, { useState, useEffect } from "react";
import MainCard from 'ui-component/cards/MainCard';
import DataGrid from "ui-component/dataGrid"
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_PROGRAM_LIST, GET_PROGRAM_DETAIL } from 'graphql/programList';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from "ui-component/inputs/datePicker";
import Report from "./report"
import Swal from "sweetalert2";
import {
  Grid,
  Button,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  DateRange as DateRangeIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const ProgramList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Check if the report parameter exists
  const showReport = searchParams.get('report') === 'true';
  
  // Get report parameters if they exist
  const seq = searchParams.get('seq');
  const agency = searchParams.get('agency');
  const openday = searchParams.get('openday');
  const om = searchParams.get('om');
  const detailed = searchParams.get('detailed') === 'true';
  console.log('[DEBUG] 클라이언트 파라미터:', { 
    detailed, 
    detailedParam: searchParams.get('detailed'),
    currentURL: location.search 
  });
  
  // 상태 관리
  const [tabIndex, setTabIndex] = useState("1");
  const [openDay, setOpenDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [selectedDetail, setSelectedDetail] = useState({
    AGENCY: agency || "",
    OM: om || "",
    OPENDAY: openday || ""
  });
  
  // 단체별 검색을 위한 상태 추가
  const [organizationFilter, setOrganizationFilter] = useState("기관명");
  const [searchText, setSearchText] = useState("");
  
  // GraphQL 쿼리
  const { data: programListData, refetch, loading } = useQuery(GET_PROGRAM_LIST, {
    variables: { openDay, endDay },
    fetchPolicy: 'network-only'
  });
  
  const [getProgramDetail, { data: programDetailData, loading: detailLoading }] = useLazyQuery(GET_PROGRAM_DETAIL);
  

  
  // Load report data if we're showing a report
  useEffect(() => {
    if (showReport && seq && agency && openday) {
      // Format the date to ensure consistency
      let formattedOpenday = openday;
              try {
          const dateObj = new Date(openday);
          if (!isNaN(dateObj.getTime())) {
            formattedOpenday = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        } catch (e) {
          // Keep original value if there's an error
        }
      
      console.log('[DEBUG] GraphQL 호출 variables:', {
        seq: parseInt(seq),
        agency,
        openday: formattedOpenday,
        detailed: detailed
      });
      
      getProgramDetail({
        variables: {
          seq: parseInt(seq),
          agency,
          openday: formattedOpenday,
          detailed: detailed
        }
      }).then(result => {
        
        // Update selectedDetail with actual data from server
        if (result.data?.getProgramDetail?.basicInfo) {
          const basicInfo = result.data.getProgramDetail.basicInfo;
          setSelectedDetail({
            AGENCY: basicInfo.AGENCY || agency || "",
            OM: basicInfo.OM || om || "",
            OPENDAY: basicInfo.OPENDAY || openday || ""
          });

        }
              }).catch(error => {
          console.error("GraphQL query error:", error);
        });
    }
  }, [showReport, seq, agency, openday, getProgramDetail]);
  
  // 프로그램 목록 데이터
  const rows = programListData?.getProgramList || [];
  
  // 인덱스 및 총 인원수 계산
  const rowsWithIndex = rows.map((item, idx) => {
    const totalPeople = (
      parseFloat(item.LEAD_MAN_CNT) + 
      parseFloat(item.LEAD_WOMAN_CNT) + 
      parseFloat(item.PART_MAN_CNT) + 
      parseFloat(item.PART_WOMAN_CNT)
    );
    
    return {
      ...item,
      index: idx + 1,
      totalPeople
    };
  });
  
  // 날짜순으로 내림차순 정렬 (최신 날짜가 상단에 표시)
  const sortedRows = [...rowsWithIndex].sort((a, b) => {
    // 날짜 형식의 문자열을 Date 객체로 변환하여 비교
    const dateA = new Date(a.OPENDAY);
    const dateB = new Date(b.OPENDAY);
    
    // 내림차순 정렬 (최신 날짜가 앞에 오도록)
    return dateB - dateA;
  });

  // 정렬 후 인덱스 다시 부여
  const finalRows = sortedRows.map((item, idx) => ({
    ...item,
    index: idx + 1
  }));
  
  // 단체별 검색 필터링 적용
  const filteredRows = finalRows.filter(item => {
    if (!searchText.trim()) return true;
    
    const searchLower = searchText.toLowerCase().trim();
    const agencyName = (item.AGENCY || '').toLowerCase();
    
    return agencyName.includes(searchLower);
  });
  
  // 고유한 기관명 목록 생성 (드롭다운용)
  const uniqueAgencies = [...new Set(finalRows.map(item => item.AGENCY).filter(Boolean))].sort();
  
  // 상세 보기 클릭 핸들러
  const onClick = (data) => {
    const seq = data[0];
    const agency = data[2];
    const openday = data[3];
    const om = data[7];
    
    // Navigate to report page with parameters
    navigate(`/programList?report=true&seq=${seq}&agency=${encodeURIComponent(agency)}&openday=${encodeURIComponent(openday)}&om=${encodeURIComponent(om)}`);
  };

  // 상세 보기 (Detailed 모드) 클릭 핸들러
  const onClickDetailed = (data) => {
    const seq = data[0];
    const agency = data[2];
    const openday = data[3];
    const om = data[7];
    
    // Navigate to report page with detailed=true parameter
    navigate(`/programList?report=true&seq=${seq}&agency=${encodeURIComponent(agency)}&openday=${encodeURIComponent(openday)}&om=${encodeURIComponent(om)}&detailed=true`);
  };

  // 탭 변경 핸들러
  const handleChange = (_, newValue) => {
    if (selectedDetail.AGENCY === "") {
      Swal.fire({ icon: 'warning', title: '확인', text: "조회된 운영결과보고가 없습니다. [상세보기] 를 통해 조회해 주십시오." });
      return;
    }
    
    setTabIndex(newValue);
  };

  // 검색 버튼 클릭 핸들러
  const onSearch = () => {
    refetch({ openDay, endDay });
  };
  
  // 초기화 버튼 클릭 핸들러
  const onReset = () => {
    Swal.fire({
      icon: 'warning',
      title: '조회조건 초기화',
      text: `조회조건을 초기화 하시겠습니까? `,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: "취소"
    }).then((result) => {
      if (result.isConfirmed) {
        setOpenDay("");
        setEndDay("");
        setSearchText("");
        setOrganizationFilter("기관명");
        refetch({ openDay: "", endDay: "" });
      }
    });
  };
  
  // 데이터 테이블 컬럼 정의
  const columns = [
    {
      name: "BASIC_INFO_SEQ",
      options: {
        filter: false,
        display: false,
      }
    },
    { name: "index", label: "번호", options: { filter: false } },
    { 
      name: "AGENCY", 
      label: "단체명",
      options: {
        customBodyRender: (value) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight="medium">{value}</Typography>
          </Box>
        )
      }
    },
    { 
      name: "OPENDAY", 
      label: "시작일",
      options: {
        customBodyRender: (value) => (
          <Chip 
            label={value} 
            size="small" 
            variant="outlined" 
            color="primary" 
            sx={{ borderRadius: 1 }}
          />
        )
      }
    },
    { 
      name: "ENDDAY", 
      label: "종료일",
      options: {
        customBodyRender: (value) => (
          <Chip 
            label={value} 
            size="small" 
            variant="outlined" 
            color="secondary" 
            sx={{ borderRadius: 1 }}
          />
        )
      }
    },
    { 
      name: "SERVICE_TYPE", 
      label: "서비스유형",
      options: {
        customBodyRender: (value) => (
          <Chip 
            label={value} 
            size="small" 
            sx={{ 
              backgroundColor: value === '수입' ? '#e3f2fd' : '#f3e5f5',
              color: value === '수입' ? '#1976d2' : '#9c27b0',
              fontWeight: 'medium',
              borderRadius: 1
            }}
          />
        )
      }
    },
    { 
      name: "totalPeople", 
      label: "인원수",
      options: {
        customBodyRender: (value) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
            <Typography variant="body2" fontWeight="bold">{value}</Typography>
          </Box>
        )
      }
    },
    { name: "OM", label: "OM" },
    {
      name: "actions",
      label: " ",
      options: {
        filter: false,
        customBodyRender: (_, tableMeta, _u) => {
          const data = tableMeta.rowData;
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                onClick={() => onClick(data)}
                startIcon={<InfoIcon />}
                sx={{ 
                  boxShadow: 'none',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.75rem'
                }}
              >
                상세보기
              </Button> */}
              <Button 
                variant="outlined" 
                color="secondary" 
                size="small" 
                onClick={() => onClickDetailed(data)}
                startIcon={<InfoIcon />}
                sx={{ 
                  boxShadow: 'none',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.65rem'
                }}
              >
                상세보기
              </Button>
            </Box>
          );
        },
      },
    },
  ];
  
  // Back to search handler
  const handleBackToSearch = () => {
    navigate('/programList');
  };

  return (
    <>
      {!showReport ? (
        // Search Page
        <>
          <MainCard 
            contentSX={{ 
              p: 2.5, 
              backgroundColor: '#f5f7fa' 
            }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Typography variant="h4" sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
                운영결과 검색
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 'medium' }}>기간:</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <DatePicker 
                      label="시작일" 
                      name="OPENDAY" 
                      value={openDay} 
                      onChange={(_, value) => setOpenDay(value)}
                      fullWidth
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ visibility: 'hidden', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="subtitle1">.</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <DatePicker 
                      label="종료일" 
                      name="ENDDAY" 
                      value={endDay} 
                      onChange={(_, value) => setEndDay(value)}
                      fullWidth
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 2, md: 4 } }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={onSearch} 
                      startIcon={<SearchIcon />}
                      sx={{ 
                        mr: 1.5, 
                        boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)',
                        borderRadius: 1.5,
                        px: 3
                      }}
                    >
                      조회
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      onClick={onReset}
                      startIcon={<RefreshIcon />}
                      sx={{ borderRadius: 1.5, px: 3 }}
                    >
                      초기화
                    </Button>
                  </Box>
                </Grid>
                
                {/* 단체별 검색 추가 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    border: '2px solid #ff5722',
                    borderRadius: 2,
                    backgroundColor: '#fff3e0'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', minWidth: 80 }}>
                      추가검색 :
                    </Typography>
                    <FormControl sx={{ minWidth: 120 }}>
                      <Select
                        value={organizationFilter}
                        onChange={(e) => setOrganizationFilter(e.target.value)}
                        size="small"
                        sx={{ 
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ff5722'
                          }
                        }}
                      >
                        <MenuItem value="기관명">기관명</MenuItem>
                      </Select>
                    </FormControl>
                    <Autocomplete
                      freeSolo
                      options={uniqueAgencies}
                      value={searchText}
                      onInputChange={(event, newValue) => {
                        setSearchText(newValue || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="검색어를 입력하세요"
                          size="small"
                          sx={{ 
                            minWidth: 300,
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#ff5722',
                              },
                              '&:hover fieldset': {
                                borderColor: '#ff5722',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#ff5722',
                              },
                            }
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </MainCard>
          
          <MainCard 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>운영결과보고 목록</Typography>
                {filteredRows.length > 0 && (
                  <Chip 
                    label={`총 ${filteredRows.length}건`} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 2, borderRadius: 1 }}
                  />
                )}
              </Box>
            }
            contentSX={{ p: 0 }}
            sx={{ mt: 3, overflow: 'hidden' }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid 
                data={filteredRows} 
                columns={columns} 
                options={{
                  elevation: 0,
                  selectableRows: 'none'
                }}
              />
            )}
          </MainCard>
        </>
      ) : (
        // Report Page
        <>
          <MainCard 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>결과보고서 상세</Typography>
                {agency && (
                  <Chip 
                    label={agency} 
                    color="primary" 
                    sx={{ ml: 2, fontWeight: 'bold', borderRadius: 1 }}
                  />
                )}
              </Box>
            }
            contentSX={{ p: 3 }}
            sx={{ mt: 2 }}
          >
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleBackToSearch} 
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 1.5 }}
              >
                목록으로 돌아가기
              </Button>
              {!detailed && (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate(`${location.pathname}${location.search}&detailed=true`)}
                  sx={{ borderRadius: 1.5 }}
                >
                  개별 항목 보기
                </Button>
              )}
        
            </Box>
            
            {detailLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Report 
                programDetailData={programDetailData} 
                selectedDetail={selectedDetail} 
              />
            )}
          </MainCard>
        </>
      )}
    </>
  );
};

export default ProgramList;
