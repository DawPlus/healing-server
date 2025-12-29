import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_PAGE5_RESERVATION_DETAIL, GET_PAGE5_RESERVATION_LIST, GET_PAGE5_EXCEL_EXPORT_DATA } from '../graphql/queries';
import { formatDate } from '../services/dataService';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List as MuiList,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import Page6Layout from '../../page6/components/Page6Layout';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportToExcel } from './excelExport'; // 엑셀 내보내기 함수 임포트
import { exportProgramSchedulePdf } from './programSchedulePdf'; // 프로그램 일정표 PDF 내보내기 함수 임포트
import { exportRoomMealPdf } from './roomMealPdf'; // 숙소배정 및 식사인원 PDF 내보내기 함수 임포트
import { exportCustomerUsageExcel } from './customerUsageExport'; // 고객이용내역서 엑셀 내보내기 함수 임포트
import { exportInvoicePdf } from './invoicePdf'; // 견적서 PDF 내보내기 함수 임포트
import { exportCustomerUsagePdf } from './customerUsagePdf'; // 고객이용내역서 PDF 내보내기 함수 임포트

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';

const InspectionPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const client = useApolloClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [roomMealPdfLoading, setRoomMealPdfLoading] = useState(false);
  const [customerUsageLoading, setCustomerUsageLoading] = useState(false);
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(false);
  const [customerUsagePdfLoading, setCustomerUsagePdfLoading] = useState(false);

  // 예약 목록 데이터 가져오기
  const { loading, error, data, refetch } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only'
  });

  // URL 파라미터에서 id 가져오기
  useEffect(() => {
    if (!loading && data && data.getPage1List) {
      const params = new URLSearchParams(location.search);
      const reservationId = params.get('id');
      
      if (reservationId) {
        // 문자열을 숫자로 변환
        const id = parseInt(reservationId, 10);
        const reservation = data.getPage1List.find(item => item.id === id);
        
        if (reservation) {
          console.log(`Automatically selecting reservation: ${reservation.group_name} (ID: ${id})`);
          setSelectedDoc(reservation);
          
          // 해당 예약의 연도 및 월로 필터 업데이트
          const startDate = new Date(reservation.start_date);
          setYear(startDate.getFullYear());
          setMonth(startDate.getMonth() + 1);
        }
      }
    }
  }, [loading, data, location.search, navigate]);

  // 검색어와 날짜로 예약 필터링
  const filteredReservations = React.useMemo(() => {
    if (!data || !data.getPage1List) return [];
    
    return data.getPage1List.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const startDate = new Date(item.start_date);
      const matchesDate = startDate.getFullYear() === year && 
                          (startDate.getMonth() + 1) === month;
      
      return matchesSearch && matchesDate;
    });
  }, [data, searchTerm, year, month]);

  // 검색어 입력 핸들러
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // 견적서 선택 핸들러
  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
  };

  // 엑셀 내보내기 핸들러
  const handleExcelExport = async () => {
    if (!selectedDoc) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '견적서를 먼저 선택해주세요.'
      });
      return;
    }

    try {
      setExportLoading(true);
      
      // 엑셀 내보내기용 상세 데이터 가져오기 - 새로운 쿼리 사용
      const { data: detailData } = await client.query({
        query: GET_PAGE5_EXCEL_EXPORT_DATA,
        variables: { id: selectedDoc.id },
        fetchPolicy: 'network-only'
      });
      
      if (!detailData) {
        throw new Error('견적서 상세 정보를 불러올 수 없습니다.');
      }
      
      console.log('Excel Export - detailData:', detailData);
      
      // 엑셀 내보내기 함수 호출
      const success = exportToExcel(detailData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: '엑셀 다운로드 성공',
          text: '견적서가 엑셀 파일로 다운로드 되었습니다.'
        });
      } else {
        throw new Error('엑셀 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      Swal.fire({
        icon: 'error',
        title: '엑셀 다운로드 실패',
        text: error.message || '엑셀 파일 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // 고객이용내역서 엑셀 내보내기 핸들러
  const handleCustomerUsageExport = async () => {
    if (!selectedDoc) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '견적서를 먼저 선택해주세요.'
      });
      return;
    }

    try {
      setCustomerUsageLoading(true);
      
      // 엑셀 내보내기용 상세 데이터 가져오기
      const { data: detailData } = await client.query({
        query: GET_PAGE5_RESERVATION_DETAIL,
        variables: { id: selectedDoc.id },
        fetchPolicy: 'network-only'
      });
      
      if (!detailData) {
        throw new Error('견적서 상세 정보를 불러올 수 없습니다.');
      }
      
      // 고객이용내역서 엑셀 내보내기 함수 호출
      const success = exportCustomerUsageExcel(detailData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: '엑셀 다운로드 성공',
          text: '고객이용내역서가 엑셀 파일로 다운로드 되었습니다.'
        });
      } else {
        throw new Error('엑셀 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      Swal.fire({
        icon: 'error',
        title: '엑셀 다운로드 실패',
        text: error.message || '엑셀 파일 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setCustomerUsageLoading(false);
    }
  };

  // 프로그램 일정표 PDF 내보내기 핸들러
  const handleProgramSchedulePdf = async () => {
    if (!selectedDoc) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '견적서를 먼저 선택해주세요.'
      });
      return;
    }

    try {
      setPdfLoading(true);
      
      // PDF 내보내기용 상세 데이터 가져오기
      const { data: detailData } = await client.query({
        query: GET_PAGE5_RESERVATION_DETAIL,
        variables: { id: selectedDoc.id },
        fetchPolicy: 'network-only'
      });
      
      if (!detailData) {
        throw new Error('견적서 상세 정보를 불러올 수 없습니다.');
      }
      
      // PDF 내보내기 함수 호출
      const success = exportProgramSchedulePdf(detailData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'PDF 다운로드 성공',
          text: '프로그램 일정표가 PDF 파일로 다운로드 되었습니다.'
        });
      } else {
        throw new Error('PDF 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF 다운로드 실패',
        text: error.message || 'PDF 파일 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // 숙소배정 및 식사인원 PDF 내보내기 핸들러
  const handleRoomMealPdf = async () => {
    if (!selectedDoc) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '견적서를 먼저 선택해주세요.'
      });
      return;
    }

    try {
      setRoomMealPdfLoading(true);
      
      // PDF 내보내기용 상세 데이터 가져오기
      const { data: detailData } = await client.query({
        query: GET_PAGE5_RESERVATION_DETAIL,
        variables: { id: selectedDoc.id },
        fetchPolicy: 'network-only'
      });
      
      if (!detailData) {
        throw new Error('견적서 상세 정보를 불러올 수 없습니다.');
      }
      
      // PDF 내보내기 함수 호출
      const success = exportRoomMealPdf(detailData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'PDF 다운로드 성공',
          text: '숙소배정 및 식사인원 표가 PDF 파일로 다운로드 되었습니다.'
        });
      } else {
        throw new Error('PDF 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF 다운로드 실패',
        text: error.message || 'PDF 파일 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setRoomMealPdfLoading(false);
    }
  };

  // 견적서 PDF 내보내기 핸들러
  const handleInvoicePdf = async () => {
    if (!selectedDoc) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '견적서를 먼저 선택해주세요.'
      });
      return;
    }

    try {
      setInvoicePdfLoading(true);
      
      // PDF 내보내기용 상세 데이터 가져오기
      const { data: detailData } = await client.query({
        query: GET_PAGE5_RESERVATION_DETAIL,
        variables: { id: selectedDoc.id },
        fetchPolicy: 'network-only'
      });
      
      if (!detailData) {
        throw new Error('견적서 상세 정보를 불러올 수 없습니다.');
      }
      
      // PDF 내보내기 함수 호출
      const success = await exportInvoicePdf(detailData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'PDF 다운로드 성공',
          text: '견적서가 PDF 파일로 다운로드 되었습니다.'
        });
      } else {
        throw new Error('PDF 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF 다운로드 실패',
        text: error.message || 'PDF 파일 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setInvoicePdfLoading(false);
    }
  };

  // 고객이용내역서 PDF 내보내기 핸들러
  const handleCustomerUsagePdf = async () => {
    if (!selectedDoc) {
      Swal.fire({
        icon: 'warning',
        title: '알림',
        text: '견적서를 먼저 선택해주세요.'
      });
      return;
    }

    try {
      setCustomerUsagePdfLoading(true);
      
      // PDF 내보내기용 상세 데이터 가져오기
      const { data: detailData } = await client.query({
        query: GET_PAGE5_RESERVATION_DETAIL,
        variables: { id: selectedDoc.id },
        fetchPolicy: 'network-only'
      });
      
      if (!detailData) {
        throw new Error('견적서 상세 정보를 불러올 수 없습니다.');
      }
      
      // PDF 내보내기 함수 호출
      const success = await exportCustomerUsagePdf(detailData);
      
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'PDF 다운로드 성공',
          text: '고객 이용 내역서가 PDF 파일로 다운로드 되었습니다.'
        });
      } else {
        throw new Error('PDF 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'PDF 다운로드 실패',
        text: error.message || 'PDF 파일 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setCustomerUsagePdfLoading(false);
    }
  };

  return (
    <Page6Layout
      title="견적서"
      icon={<DescriptionIcon fontSize="large" />}
      activeTab="inspection"
    >
      <Grid container spacing={2}>
        {/* Sidebar with document list */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">견적서 목록</Typography>
                </Box>
              }
              action={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 90, mr: 1 }} size="small">
                    <InputLabel>연도</InputLabel>
                    <Select
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      label="연도"
                    >
                      {[...Array(5)].map((_, i) => {
                        const yearValue = new Date().getFullYear() - 2 + i;
                        return (
                          <MenuItem key={yearValue} value={yearValue}>
                            {yearValue}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ minWidth: 80 }} size="small">
                    <InputLabel>월</InputLabel>
                    <Select
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      label="월"
                    >
                      {[...Array(12)].map((_, i) => {
                        const monthValue = i + 1;
                        return (
                          <MenuItem key={monthValue} value={monthValue}>
                            {monthValue}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              }
            />
            
            <Divider />
            
            <CardContent sx={{ p: 0, pb: '0 !important' }}>
              <Box sx={{ p: 2 }}>
                <TextField
                  placeholder="단체명 검색..."
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              
              <Divider />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Box sx={{ p: 2 }}>
                  <Typography color="error">데이터 로딩 중 오류가 발생했습니다.</Typography>
                </Box>
              ) : filteredReservations.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography color="textSecondary">검색 결과가 없습니다.</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                  <MuiList disablePadding>
                    {filteredReservations.map((doc) => (
                      <ListItem
                        key={doc.id}
                        button
                        selected={selectedDoc && selectedDoc.id === doc.id}
                        onClick={() => handleSelectDoc(doc)}
                        divider
                      >
                        <ListItemText
                          primary={doc.group_name}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {formatDate(doc.start_date)} ~ {formatDate(doc.end_date)}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span" color="textSecondary">
                                {doc.customer_name} ({doc.mobile_phone})
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </MuiList>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {/* Export buttons - moved above preview */}
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DownloadIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">문서 내보내기</Typography>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
               
                    
                 
                    
                
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleInvoicePdf}
                        disabled={!selectedDoc || invoicePdfLoading}
                      >
                        {invoicePdfLoading ? <CircularProgress size={24} /> : '견적서 PDF'}
                      </Button>
                    </Grid>
                    
                    </Grid>
                </CardContent>
              </Card>
                  </Grid>

            {/* Document preview - moved below export buttons */}
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">견적서 미리보기</Typography>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  {selectedDoc ? (
                    <DocumentPreview data={selectedDoc} />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                      <Typography color="textSecondary">견적서를 선택하세요</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Page6Layout>
  );
};

// 견적서 미리보기 컴포넌트
const DocumentPreview = ({ data }) => {
  // 선택된 견적서에 대한 상세 데이터 가져오기
  const { loading, error, data: detailData } = useQuery(
    GET_PAGE5_RESERVATION_DETAIL,
    {
      variables: { id: data?.id },
      skip: !data?.id,
      fetchPolicy: 'network-only'
    }
  );
  
  console.log('DocumentPreview - Raw detailData:', detailData);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !detailData) {
    console.error('DocumentPreview error:', error);
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="textSecondary">데이터를 불러오는 중 오류가 발생했습니다.</Typography>
      </Box>
    );
  }
  
  const detail = detailData.getPage1ById;
  const page3Data = detail.page3 || {};
  
  console.log('DocumentPreview - detail:', detail);
  console.log('DocumentPreview - detail.pageFinal:', detail.pageFinal);
  
  // JSON 데이터 파싱 함수
  const parseJsonData = (jsonData) => {
    if (!jsonData) return [];
    if (typeof jsonData === 'string') {
      try {
        return JSON.parse(jsonData);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
      }
    }
    return jsonData;
  };
  
  // 데이터 파싱
  const roomSelections = parseJsonData(page3Data.room_selections);
  const mealPlans = parseJsonData(page3Data.meal_plans);
  const placeReservations = parseJsonData(page3Data.place_reservations);
  
  console.log('DocumentPreview - Parsed data:', {
    roomSelections,
    mealPlans,
    placeReservations
  });
  
  // 프로그램 정보 수집
  let programs = [];
  if (detail.page2_reservations && detail.page2_reservations.length > 0) {
    detail.page2_reservations.forEach(page2 => {
      if (page2.programs && page2.programs.length > 0) {
        programs = [...programs, ...page2.programs];
      }
    });
  }
  
  console.log('DocumentPreview - Programs:', programs);
  
  // page2에서 총 참여자수와 총 인솔자수 계산
  const calculateTotalAttendees = () => {
    let totalParticipants = 0;
    let totalLeaders = 0;
    
    if (detail.page2_reservations && detail.page2_reservations.length > 0) {
      detail.page2_reservations.forEach(page2 => {
        totalParticipants += page2.total_count || 0;
        totalLeaders += page2.total_leader_count || 0;
      });
    }
    
    return totalParticipants + totalLeaders;
  };
  
  const totalAttendees = calculateTotalAttendees();
  
  // 금액 계산 함수
  const calculateTotal = () => {
    let roomTotal = 0;
    let mealTotal = 0;
    let programTotal = 0;
    let venueTotal = 0;
    let etcTotal = 0;
    let etcItems = []; // 기타 항목 목록
    
    // 실제 적용된 할인율 계산 함수 (기본값 제거)
    const getDiscountRate = (category) => {
      if (!detail.pageFinal) return 0; // 기본 할인 없음
      
      // 해당 카테고리의 항목들에서 할인율 찾기
      let discountRate = 0; // 기본값은 할인 없음
      
      if (category === 'room') {
        // 참가자 집행금액(is_planned: false)의 숙박비에서 할인율 가져오기
        const roomExpenses = detail.pageFinal.participant_expenses?.filter(exp => 
          !exp.is_planned && (exp.category?.includes('숙박') || exp.category?.includes('객실'))
        );
        if (roomExpenses?.length > 0 && roomExpenses[0].discount_rate !== null && roomExpenses[0].discount_rate !== undefined) {
          discountRate = roomExpenses[0].discount_rate;
        }
      } else if (category === 'meal') {
        // 참가자 집행금액(is_planned: false)의 식사비에서 할인율 가져오기
        const mealExpenses = detail.pageFinal.participant_expenses?.filter(exp => 
          !exp.is_planned && exp.category?.includes('식사')
        );
        if (mealExpenses?.length > 0 && mealExpenses[0].discount_rate !== null && mealExpenses[0].discount_rate !== undefined) {
          discountRate = mealExpenses[0].discount_rate;
        }
      } else if (category === 'program') {
        // 수입금액의 프로그램에서 할인율 가져오기
        const programExpenses = detail.pageFinal.income_items?.filter(exp => 
          exp.category?.includes('프로그램')
        );
        if (programExpenses?.length > 0 && programExpenses[0].discount_rate !== null && programExpenses[0].discount_rate !== undefined) {
          discountRate = programExpenses[0].discount_rate;
        }
      } else if (category === 'venue') {
        // 대관 할인은 항상 0%
        discountRate = 0;
      } else if (category === 'etc') {
        // 참가자 집행금액(is_planned: false)의 재료비에서 할인율 가져오기
        const etcExpenses = detail.pageFinal.participant_expenses?.filter(exp => 
          !exp.is_planned && exp.category?.includes('재료비')
        );
        if (etcExpenses?.length > 0 && etcExpenses[0].discount_rate !== null && etcExpenses[0].discount_rate !== undefined) {
          discountRate = etcExpenses[0].discount_rate;
        }
      }
      
      return discountRate;
    };
    
    // 객실 금액 계산 - page3 completeRoomSave 함수와 동일한 로직 적용
    const roomDiscountRate = getDiscountRate('room');
    roomSelections.forEach(room => {
      console.log('calculateTotal - 객실 정보:', room);
      
      // page3와 동일한 계산 공식 적용
      const baseRoomPrice = room.price || 0;
      const nights = room.nights || 1;
      const occupancy = room.occupancy || 1;
      const capacity = room.capacity || 1;
      
      let subtotal = 0;
      
      // total_price가 수동으로 입력된 값이 있으면 우선 사용
      if (room.total_price && parseInt(room.total_price) > 0) {
        subtotal = parseInt(room.total_price);
        console.log('calculateTotal - total_price(수동입력) 사용:', subtotal);
      } else {
        // page3와 동일한 계산 공식 적용:
        // 1. Base price for the room multiplied by nights
        // 2. Additional charge of 10,000 won per person when exceeding room capacity
        subtotal = baseRoomPrice * nights;
        
        // Add extra charge for people exceeding room capacity (10,000 won per extra person per night)
        if (occupancy > capacity) {
          const extraPeople = occupancy - capacity;
          const extraCharge = extraPeople * 10000 * nights; // 10,000 won per extra person per night
          subtotal += extraCharge;
          console.log(`calculateTotal - 인원수 초과 요금: ${extraPeople}명 × 10,000원 × ${nights}박 = ${extraCharge}원`);
        }
        
        console.log('calculateTotal - page3 공식으로 계산된 가격:', {
          객실타입: room.room_type,
          기본가격: baseRoomPrice,
          박수: nights,
          투숙인원: occupancy,
          객실정원: capacity,
          계산된가격: subtotal
        });
      }
      
      const discount = Math.round(subtotal * (roomDiscountRate / 100));
      const total = subtotal - discount;
      roomTotal += total;
    });
    
    // 식사 금액 계산
    const mealDiscountRate = getDiscountRate('meal');
    mealPlans.forEach(meal => {
      const price = meal.price || 0;
      const participants = meal.participants || 0;
      let unitPrice = 0;
      let subtotal = 0;
      
      if (participants > 0) {
        unitPrice = Math.round(price / participants);
        subtotal = unitPrice * participants;
      } else {
        unitPrice = price;
        subtotal = price;
      }
      
      const discount = Math.round(subtotal * (mealDiscountRate / 100));
      const total = subtotal - discount;
      mealTotal += total;
    });
    
    // 프로그램 금액 계산
    const programDiscountRate = getDiscountRate('program');
    programs.forEach(program => {
      if (!program) return;
      const price = program.price || 0;
      const discount = Math.round(price * (programDiscountRate / 100));
      const total = price - discount;
      programTotal += total;
    });
    
    // 대관 금액 계산 (할인 없음)
    const venueDiscountRate = 0; // 대관 할인 없음
    placeReservations.forEach(place => {
      const price = place.price || 0;
      const hours = place.hours || 1;
      const subtotal = price * hours;
      // 대관은 할인 없음
      const total = subtotal;
      venueTotal += total;
    });
    
    // 기타 항목 계산 - Page4의 재료비와 기타비를 직접 사용
    const etcDiscountRate = getDiscountRate('etc');
    console.log('calculateTotal - Starting etc items calculation from page4_expenses');
    
    if (detail.page4_expenses && detail.page4_expenses.length > 0) {
      detail.page4_expenses.forEach(page4 => {
        // 재료 항목들 개별 처리
        if (page4.materials && page4.materials.length > 0) {
          page4.materials.forEach(material => {
            const subtotal = material.total || 0;
            const unitPrice = material.amount || 0;
            const discount = Math.round(subtotal * (etcDiscountRate / 100));
            const total = subtotal - discount;
            etcTotal += total;

            etcItems.push({
              name: material.material_type || '재료비',
              material_type: material.material_type || 'page4_material',
              unitPrice: unitPrice,
              amount: subtotal,
              discount: discount,
              total: total,
              note: material.note || 'Page4 데이터',
              discountRate: etcDiscountRate
            });
          });
        }

        // 기타비용 항목들 개별 처리
        if (page4.expenses && page4.expenses.length > 0) {
          page4.expenses.forEach(expense => {
            const subtotal = expense.amount || 0;
            const unitPrice = expense.price || 0;
            const discount = Math.round(subtotal * (etcDiscountRate / 100));
            const total = subtotal - discount;
            etcTotal += total;
            
            etcItems.push({
              name: expense.name || expense.expense_type || '기타비',
              material_type: expense.expense_type || 'page4_expense',
              unitPrice: unitPrice,
              amount: subtotal,
              discount: discount,
              total: total,
              note: expense.note || 'Page4 데이터',
              discountRate: etcDiscountRate
            });
          });
        }
      });
    }

    console.log('calculateTotal - Final etc calculation:', {
      etcTotal,
      etcItemCount: etcItems.length,
      etcItems,
    });
    
    const grandTotal = roomTotal + mealTotal + programTotal + venueTotal + etcTotal;
    
    return {
      roomTotal,
      mealTotal,
      programTotal,
      venueTotal,
      etcTotal,
      etcItems, // 기타 항목 목록 추가
      grandTotal,
      discountRates: {
        room: roomDiscountRate,
        meal: mealDiscountRate,
        program: programDiscountRate,
        venue: venueDiscountRate,
        etc: etcDiscountRate
      }
    };
  };
  
  const totals = calculateTotal();
  
  // 텍스트 길이 제한 함수
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // 식사 타입 번역
  const typeTranslations = { 
    'breakfast': '조식', 
    'lunch': '중식(일반)', 
    'lunch_box': '도시락 중식', 
    'dinner': '석식(일반)', 
    'dinner_special_a': '석식(특식A)', 
    'dinner_special_b': '석식(특식B)' 
  };
  
  // 공통 스타일
  const headerCellStyle = {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    textAlign: 'center',
    border: '1px solid #000',
    padding: '4px 8px',
    fontSize: '10px'
  };
  
  const dataCellStyle = {
    border: '1px solid #000',
    padding: '4px 8px',
    fontSize: '10px',
    textAlign: 'center'
  };
  
  const yellowCellStyle = {
    ...dataCellStyle,
    backgroundColor: '#ffff99',
    fontWeight: 'bold'
  };
  
  // 객실 데이터 그룹화 함수 (같은 일자, 같은 객실종류별로 그룹화)
  const groupRoomSelections = (roomSelections) => {
    const grouped = {};
    
    roomSelections.forEach(room => {
      const date = moment(room.check_in_date).format('MM월 DD일');
      const roomType = room.room_type || room.room_name;
      const key = `${date}_${roomType}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          date,
          roomType,
          rooms: [],
          totalQuantity: 0,
          totalOccupancy: 0,
          nights: room.nights || 1,
          basePrice: room.price || 0,
          totalSubtotal: 0,
          totalDiscount: 0,
          totalAmount: 0
        };
      }
      
      grouped[key].rooms.push(room);
      grouped[key].totalQuantity += 1; // 객실 수
      grouped[key].totalOccupancy += (room.occupancy || 1); // 총 인원
      
      // 각 객실별 계산
      const baseRoomPrice = room.price || 0;
      const nights = room.nights || 1;
      const occupancy = room.occupancy || 1;
      const capacity = room.capacity || 1;
      
      let subtotal = 0;
      
      if (room.total_price && parseInt(room.total_price) > 0) {
        subtotal = parseInt(room.total_price);
      } else {
        subtotal = baseRoomPrice * nights;
        if (occupancy > capacity) {
          const extraPeople = occupancy - capacity;
          const extraCharge = extraPeople * 10000 * nights;
          subtotal += extraCharge;
        }
      }
      
      const discount = Math.round(subtotal * (totals.discountRates.room / 100));
      const total = subtotal - discount;
      
      grouped[key].totalSubtotal += subtotal;
      grouped[key].totalDiscount += discount;
      grouped[key].totalAmount += total;
    });
    
    return Object.values(grouped);
  };

  const groupedRooms = groupRoomSelections(roomSelections);

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Malgun Gothic", "맑은 고딕", sans-serif',
      fontSize: '10px',
      lineHeight: 1.2,
      '@media print': {
        padding: '0',
        maxWidth: 'none'
      }
    }}>
      {/* 헤더 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '10px',
        border: '2px solid #000',
        padding: '8px'
      }}>
       
        <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 'bold' }}>
        단체행사 견적/계약서
      </Typography>
      </Box>
      
      {/* 안내문구 */}
      <Box sx={{ 
        textAlign: 'center', 
        marginBottom: '10px',
        border: '1px solid #000',
        padding: '8px',
        fontSize: '10px'
      }}>
        <div> 하이힐링원에 관심을 기울여 주심에 감사드리며 아래와 같이 견적서를 제출합니다.
</div>
        <div>  아울러 하이힐링원은 본 행사의 성공적인 개최를 위해 최선을 다할 것을 약속드립니다.</div>
      </Box>
      
      {/* 기본 정보 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={headerCellStyle}>단 체 명</td>
            <td style={dataCellStyle}>{detail.group_name}</td>
            <td style={headerCellStyle}>고객명</td>
            <td style={dataCellStyle}>{detail.customer_name || '-'}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>행 사 명</td>
            <td style={dataCellStyle}></td>
            <td style={headerCellStyle}>H.P</td>
            <td style={dataCellStyle}>{detail.mobile_phone || '-'}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>행사 일정</td>
            <td style={dataCellStyle}>
              {moment(detail.start_date).format('YY.MM.DD')}({moment(detail.start_date).format('ddd')})~{moment(detail.end_date).format('DD')}({moment(detail.end_date).format('ddd')}), {moment(detail.end_date).diff(moment(detail.start_date), 'days') + 1}박{moment(detail.end_date).diff(moment(detail.start_date), 'days')}일
            </td>
            <td style={headerCellStyle}>TEL</td>
            <td style={dataCellStyle}>{detail.landline_phone || '-'}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>행사 인원</td>
            <td style={dataCellStyle}>{totalAttendees}명</td>
            <td style={headerCellStyle}>E-mail</td>
            <td style={dataCellStyle}>{detail.email || '-'}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>행사 장소</td>
            <td style={dataCellStyle}>하이힐링원</td>
            <td style={headerCellStyle}>상담담당자</td>
            <td style={dataCellStyle}>{detail.reservation_manager || '김재훈'}</td>
          </tr>
        </tbody>
      </table>
      
      {/* 금액 요약 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>금액</th>
            <th style={headerCellStyle}>객실</th>
            <th style={headerCellStyle}>식사</th>
            <th style={headerCellStyle}>프로그램</th>
            <th style={headerCellStyle}>대관</th>
            <th style={headerCellStyle}>기타</th>
            <th style={headerCellStyle}>최종금액</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={dataCellStyle}>₩</td>
            <td style={dataCellStyle}>{totals.roomTotal.toLocaleString()}</td>
            <td style={dataCellStyle}>{totals.mealTotal.toLocaleString()}</td>
            <td style={dataCellStyle}>{totals.programTotal.toLocaleString()}</td>
            <td style={dataCellStyle}>{totals.venueTotal.toLocaleString()}</td>
            <td style={dataCellStyle}>{totals.etcTotal.toLocaleString()}</td>
            <td style={yellowCellStyle}>{totals.grandTotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style={headerCellStyle}>비 고</td>
            <td style={{ ...dataCellStyle, textAlign: 'left' }} colSpan={6}>
              체크인전 입금, 취소마감 일주일전
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* 객실 섹션 */}
      <Box sx={{ marginBottom: '10px' }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>• 객실</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>일자</th>
              <th style={headerCellStyle}>타입</th>
              <th style={headerCellStyle}>인원</th>
              <th style={headerCellStyle}>객실수</th>
              <th style={headerCellStyle}>숙박</th>
              <th style={headerCellStyle}>제공단가</th>
              <th style={headerCellStyle}>소계</th>
              <th style={headerCellStyle}>할인금액</th>
              <th style={headerCellStyle}>합계(VAT포함)</th>
              <th style={headerCellStyle}>비고</th>
            </tr>
          </thead>
          <tbody>
            {groupedRooms.length > 0 ? groupedRooms.map((group, index) => {
              console.log('Page5 inspection DocumentPreview - 그룹화된 객실 정보:', group);
              
              return (
                <tr key={index}>
                  <td style={dataCellStyle}>{group.date}</td>
                  <td style={dataCellStyle}>{group.roomType}</td>
                  <td style={dataCellStyle}>{group.totalOccupancy}</td>
                  <td style={dataCellStyle}>{group.totalQuantity}</td>
                  <td style={dataCellStyle}>{group.nights}박</td>
                  <td style={dataCellStyle}>₩ {group.basePrice.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {group.totalSubtotal.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {group.totalDiscount.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {group.totalAmount.toLocaleString()}</td>
                  <td style={dataCellStyle}></td>
                </tr>
              );
            }) : (
              <tr>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
              </tr>
            )}
            <tr>
              <td style={headerCellStyle} colSpan={8}>소 계</td>
              <td style={dataCellStyle}>₩ {totals.roomTotal.toLocaleString()}</td>
              <td style={dataCellStyle}></td>
            </tr>
          </tbody>
        </table>
      </Box>
      
      {/* 식사 섹션 */}
      <Box sx={{ marginBottom: '10px' }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>• 식사</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>일자</th>
              <th style={headerCellStyle} colSpan={2}>구분</th>
              <th style={headerCellStyle}>제공횟수</th>
              <th style={headerCellStyle}>인원</th>
              <th style={headerCellStyle}>제공단가</th>
              <th style={headerCellStyle}>소계</th>
              <th style={headerCellStyle}>할인금액</th>
              <th style={headerCellStyle}>합계(VAT포함)</th>
              <th style={headerCellStyle}>비고</th>
            </tr>
          </thead>
          <tbody>
            {mealPlans.length > 0 ? mealPlans.map((meal, index) => {
              const price = meal.price || 0;
              const participants = meal.participants || 0;
              let unitPrice = 0;
              let subtotal = 0;
              
              if (participants > 0) {
                unitPrice = Math.round(price / participants);
                subtotal = unitPrice * participants;
              } else {
                unitPrice = price;
                subtotal = price;
              }
              
              const discount = Math.round(subtotal * (totals.discountRates.meal / 100));
              const total = subtotal - discount;
              
              return (
                <tr key={index}>
                  <td style={dataCellStyle}>{moment(meal.meal_date).format('MM월 DD일') || `${index + 1}일차`}</td>
                  <td style={dataCellStyle} colSpan={2}>{typeTranslations[meal.meal_type] || meal.meal_type}</td>
                  <td style={dataCellStyle}>1</td>
                  <td style={dataCellStyle}>{participants}</td>
                  <td style={dataCellStyle}>₩ {unitPrice.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {subtotal.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {discount.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {total.toLocaleString()}</td>
                  <td style={dataCellStyle}></td>
                </tr>
              );
            }) : (
              <tr>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle} colSpan={2}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
              </tr>
            )}
            <tr>
              <td style={headerCellStyle} colSpan={8}>소 계</td>
              <td style={dataCellStyle}>₩ {totals.mealTotal.toLocaleString()}</td>
              <td style={dataCellStyle}></td>
            </tr>
          </tbody>
        </table>
      </Box>
      
      {/* 프로그램 섹션 */}
      <Box sx={{ marginBottom: '10px' }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>• 프로그램</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>일자</th>
              <th style={headerCellStyle}>프로그램명</th>
              <th style={headerCellStyle}>제공단가</th>
              <th style={headerCellStyle}>소계</th>
              <th style={headerCellStyle}>할인금액</th>
              <th style={headerCellStyle}>합계(VAT포함)</th>
              <th style={headerCellStyle} colSpan={3}>비고</th>
            </tr>
          </thead>
          <tbody>
            {programs.length > 0 ? programs.map((program, index) => {
              if (!program) return null;
              
              const price = program.price || 0;
              const discount = Math.round(price * (totals.discountRates.program / 100));
              const total = price - discount;
              
              return (
                <tr key={index}>
                  <td style={dataCellStyle}>{moment(program.program_date).format('MM월 DD일') || '날짜 미정'}</td>
                  <td style={dataCellStyle}>{program.program_name || program.name}</td>
                  <td style={dataCellStyle}>₩ {price.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {price.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {discount.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {total.toLocaleString()}</td>
                  <td style={dataCellStyle} colSpan={3}></td>
                </tr>
              );
            }) : (
              <tr>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle} colSpan={3}>-</td>
              </tr>
            )}
            <tr>
              <td style={headerCellStyle} colSpan={5}>소 계</td>
              <td style={dataCellStyle}>₩ {totals.programTotal.toLocaleString()}</td>
              <td style={dataCellStyle} colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </Box>
      
      {/* 대관 섹션 */}
      <Box sx={{ marginBottom: '10px' }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>• 대관</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>일자</th>
              <th colSpan={3}style={headerCellStyle}>대관장소</th>
        
              <th style={headerCellStyle}>제공단가</th>
              <th style={headerCellStyle}>소계</th>
              <th style={headerCellStyle}>할인금액</th>
              <th style={headerCellStyle}>합계(VAT포함)</th>
              <th style={headerCellStyle}>비고</th>
            </tr>
          </thead>
          <tbody>
            {placeReservations.length > 0 ? placeReservations.map((place, index) => {
              const price = place.price || 0;
              const hours = place.hours || 1;
              const subtotal = price * hours;
              const discount = 0; // 대관 할인 없음
              const total = subtotal; // 할인 없으므로 subtotal과 동일
              
              return (
                <tr key={index}>
                  <td style={dataCellStyle}>{moment(place.reservation_date).format('MM월 DD일') || '날짜 미정'}</td>
                  <td colSpan={3} style={dataCellStyle}>{place.place_name || place.venue_name}</td>
        
                  <td style={dataCellStyle}>₩ {price.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {subtotal.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {discount.toLocaleString()}</td>
                  <td style={dataCellStyle}>₩ {total.toLocaleString()}</td>
                  <td style={dataCellStyle}></td>
                </tr>
              );
            }) : (
              <tr>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
              </tr>
            )}
            <tr>
              <td style={headerCellStyle} colSpan={7}>소 계</td>
              <td style={dataCellStyle}>₩ {totals.venueTotal.toLocaleString()}</td>
              <td style={dataCellStyle}></td>
            </tr>
          </tbody>
        </table>
      </Box>
      
      {/* 기타 섹션 */}
      <Box sx={{ marginBottom: '10px' }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '5px' }}>• 기타</Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>일자</th>
              <th style={headerCellStyle}>항목</th>
              <th style={headerCellStyle}>제공단가</th>
              <th style={headerCellStyle}>소계</th>
              <th style={headerCellStyle}>할인금액</th>
              <th style={headerCellStyle}>합계(VAT포함)</th>
              <th style={headerCellStyle} colSpan={3}>비고</th>
            </tr>
          </thead>
          <tbody>
            {totals.etcItems.length > 0 ? totals.etcItems.map((item, index) => (
              <tr key={index}>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>{item.name}</td>
                <td style={dataCellStyle}>₩ {Number(item.unitPrice).toLocaleString()}</td>
                <td style={dataCellStyle}>₩ {item.amount.toLocaleString()}</td>
                <td style={dataCellStyle}>₩ {item.discount.toLocaleString()}</td>
                <td style={dataCellStyle}>₩ {item.total.toLocaleString()}</td>
                <td style={dataCellStyle} colSpan={3}></td>
              </tr>
            )) : (
              <tr>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle}>-</td>
                <td style={dataCellStyle} colSpan={3}>-</td>
              </tr>
            )}
            <tr>
              <td style={headerCellStyle} colSpan={5}>소 계</td>
              <td style={dataCellStyle}>₩ {totals.etcTotal.toLocaleString()}</td>
              <td style={dataCellStyle} colSpan={3}></td>
            </tr>
          </tbody>
        </table>
      </Box>
      
      {/* 날짜 및 서명 */}
      <Box sx={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
        <Typography sx={{ fontSize: '12px' }}>
          {moment().format('YYYY년 MM월 DD일')}
        </Typography>
      </Box>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ ...dataCellStyle, textAlign: 'left', border: 'none', width: '50%' }}>
              회 사 명 : (재)산림힐링재단
            </td>
            <td style={{ ...dataCellStyle, textAlign: 'right', border: 'none', width: '50%' }}>
              회 사 명 : {detail.group_name || '-'}
            </td>
          </tr>
          <tr>
            <td style={{ ...dataCellStyle, textAlign: 'left', border: 'none', width: '50%' }}>
              담 당 자 : {detail.reservation_manager || '김재훈'}
            </td>
            <td style={{ ...dataCellStyle, textAlign: 'right', border: 'none', width: '50%' }}>
              담 당 자 : {detail.customer_name || '-'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(인)
            </td>
          </tr>
        </tbody>
      </table>
      
    
    </Box>
  );
};

export default InspectionPage; 