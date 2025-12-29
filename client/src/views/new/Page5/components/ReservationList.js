import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedReservation } from '../../../../store/reducers/reservationSlice';
import { GET_PAGE5_RESERVATION_LIST } from '../graphql';
import { formatDate, showAlert } from '../services/dataService';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  CircularProgress,
  Card,
  Tabs,
  Tab,
  useTheme,
  Avatar,
  TableSortLabel
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko as koLocale } from 'date-fns/locale';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/ko';
import Page5Layout from './Page5Layout';
import Swal from 'sweetalert2';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ReplayIcon from '@mui/icons-material/Replay';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RefreshIcon from '@mui/icons-material/Refresh';

// Set Korean locale for dayjs and extend with plugins
dayjs.locale('ko');
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const ReservationList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.common.userInfo); // 현재 로그인한 사용자 정보
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // 날짜 정렬 상태 추가
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [sortByDate, setSortByDate] = useState(true);
  
  // Get reservation list using GraphQL query
  const { loading, error, data, refetch } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching reservation list:', error);
      showAlert('예약 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    }
  });
    
  // Filter reservations based on search term, status, date range
  const filteredReservations = React.useMemo(() => {
    let reservations = data?.getPage1List || [];
    
    // 초기화면에서만 최근 1개월치 데이터 제한 (기간별 검색이 없을 때만)
    const hasDateFilter = startDate || endDate;
    
    if (!hasDateFilter) {
      // 기간별 검색이 없는 경우에만 최근 1개월치로 제한
      const oneMonthAgo = dayjs().subtract(1, 'month');
      const today = dayjs();
      
      reservations = reservations.filter(reservation => {
        // 날짜 유효성 검사
        const startDateValue = reservation.start_date;
        const endDateValue = reservation.end_date;
        
        if (!startDateValue && !endDateValue) {
          return false; // 둘 다 없으면 제외
        }
        
        // 시작일 또는 종료일 중 하나라도 있으면 그것을 기준으로 판단
        const reservationDate = dayjs(startDateValue || endDateValue);
        
        // 유효한 날짜인지 확인
        if (!reservationDate.isValid()) {
          return false;
        }
        
        return reservationDate.isSameOrAfter(oneMonthAgo, 'day') && 
               reservationDate.isSameOrBefore(today, 'day');
      });
    }
    
    // 검색어, 상태, 날짜 범위 필터링 적용
    reservations = reservations.filter(reservation => {
      // Apply search filter
      const searchMatch = 
        reservation.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const statusMatch = 
        filterStatus === 'all' ||
        (filterStatus === 'preparation' && reservation.reservation_status === 'preparation') ||
        (filterStatus === 'confirmed' && reservation.reservation_status === 'confirmed');
      
      // Apply date range filter (기간별 검색)
      let dateMatch = true;
      if (startDate || endDate) {
        const reservationStartDate = reservation.start_date ? dayjs(reservation.start_date) : null;
        const reservationEndDate = reservation.end_date ? dayjs(reservation.end_date) : null;
        
        if (startDate && endDate) {
          // 시작일과 종료일이 모두 선택된 경우 - 예약 기간이 선택 기간과 겹치는지 확인
          if (reservationStartDate && reservationEndDate) {
            dateMatch = reservationStartDate.isSameOrBefore(dayjs(endDate), 'day') && 
                       reservationEndDate.isSameOrAfter(dayjs(startDate), 'day');
          } else if (reservationStartDate) {
            // 종료일이 없는 경우 시작일만으로 판단
            dateMatch = reservationStartDate.isSameOrAfter(dayjs(startDate), 'day') && 
                       reservationStartDate.isSameOrBefore(dayjs(endDate), 'day');
          } else if (reservationEndDate) {
            // 시작일이 없는 경우 종료일만으로 판단
            dateMatch = reservationEndDate.isSameOrAfter(dayjs(startDate), 'day') && 
                       reservationEndDate.isSameOrBefore(dayjs(endDate), 'day');
          } else {
            dateMatch = false;
          }
        } else if (startDate) {
          // 시작일만 선택된 경우 - 해당 날짜 이후의 예약
          if (reservationEndDate) {
            dateMatch = reservationEndDate.isSameOrAfter(dayjs(startDate), 'day');
          } else if (reservationStartDate) {
            dateMatch = reservationStartDate.isSameOrAfter(dayjs(startDate), 'day');
          } else {
            dateMatch = false;
          }
        } else if (endDate) {
          // 종료일만 선택된 경우 - 해당 날짜 이전의 예약
          if (reservationStartDate) {
            dateMatch = reservationStartDate.isSameOrBefore(dayjs(endDate), 'day');
          } else if (reservationEndDate) {
            dateMatch = reservationEndDate.isSameOrBefore(dayjs(endDate), 'day');
          } else {
            dateMatch = false;
          }
        }
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
    
    // 날짜 정렬 적용
    if (sortByDate) {
      reservations.sort((a, b) => {
        const dateA = dayjs(a.start_date || a.end_date);
        const dateB = dayjs(b.start_date || b.end_date);
        
        // 유효하지 않은 날짜는 맨 뒤로
        if (!dateA.isValid() && !dateB.isValid()) return 0;
        if (!dateA.isValid()) return 1;
        if (!dateB.isValid()) return -1;
        
        if (sortOrder === 'asc') {
          return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
        } else {
          return dateA.isAfter(dateB) ? -1 : dateA.isBefore(dateB) ? 1 : 0;
        }
      });
    }
    
    return reservations;
  }, [data, searchTerm, filterStatus, startDate, endDate, sortOrder, sortByDate]);
  
  // 날짜 정렬 핸들러
  const handleDateSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setSortByDate(true);
  };
  
  // Handle row click to navigate to detail page
  const handleRowClick = (reservation) => {
    // Dispatch the selected reservation ID to Redux
    dispatch(setSelectedReservation(reservation.id));
    
    // Navigate to Page0 where the reservation will be automatically selected
    navigate('/new/page0');
  };
  
  // Handle create new reservation
  const handleNewReservation = () => {
    navigate('/new/page1/edit/new');
  };
  
  // Handle date search
  const handleDateSearch = () => {
    // Refetch data (the filtering is done in the useMemo above)
    refetch();
  };
  
  // Handle reset filters
  const handleReset = () => {
    Swal.fire({
      icon: 'warning',
      title: '검색조건 초기화',
      text: '검색조건을 초기화 하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        setSearchTerm('');
        setFilterStatus('all');
        setStartDate(null);
        setEndDate(null);
        refetch();
      }
    });
  };
  
  // Get status chip based on reservation status
  const getStatusChip = (status) => {
    switch(status) {
      case 'preparation':
        return <Chip label="가예약" size="small" color="primary" />;
      case 'confirmed':
        return <Chip label="확정예약" size="small" color="success" />;
      default:
        return <Chip label={status || '미정'} size="small" />;
    }
  };

  return (
    <Page5Layout 
      title="예약 관리시스템" 
      icon={<ListAltIcon sx={{ fontSize: 28 }} />}
      activeTab="list"
    >
      <Box sx={{ width: '100%', p: 3 }}>
        {/* Date Range Search Section */}
        <Box sx={{ mb: 3 }}>
          <Card elevation={0} sx={{ p: 2.5, bgcolor: theme.palette.grey[50] }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
              기간별 검색
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>기간:</Typography>
                  </Box>
                  <DatePicker
                    label="시작일"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    format="yyyy년 MM월 dd일"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ visibility: 'hidden', display: { xs: 'none', md: 'block' }, mb: 1 }}>
                    <Typography variant="subtitle1">.</Typography>
                  </Box>
                  <DatePicker
                    label="종료일"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    format="yyyy년 MM월 dd일"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: { xs: 2, md: 3 } }}>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      onClick={handleReset}
                      startIcon={<RefreshIcon />}
                      sx={{ borderRadius: 1.5, px: 3 }}
                    >
                      초기화
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Card>
        </Box>

        {/* Text Search and Filter Section */}
        <Box sx={{ mb: 3 }}>
          <Card elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
            {/* Search and filter controls */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mb: 2 
            }}>
              <Box sx={{ flex: '1 1 0', minWidth: '150px' }}>
              <TextField
                fullWidth
                  placeholder="단체명, 고객명, 이메일 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 0', minWidth: '150px' }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="예약상태"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="preparation">가예약</MenuItem>
                  <MenuItem value="confirmed">확정예약</MenuItem>
                </TextField>
              </Box>
          
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<ReplayIcon />}
                  onClick={() => refetch()}
                >
                  새로고침
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleNewReservation}
                >
                  신규예약
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
        
        {/* Reservations Table */}
        <Box sx={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              color: 'error.main' 
            }}>
              <Typography>데이터를 불러오는 중 오류가 발생했습니다.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <TableSortLabel
                        active={sortByDate}
                        direction={sortOrder}
                        onClick={handleDateSort}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        기간
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>단체명</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>고객명</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>연락처</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>이메일</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          예약 데이터가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <TableRow 
                        key={reservation.id} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover,
                            cursor: 'pointer'
                          } 
                        }}
                        onClick={() => handleRowClick(reservation)}
                      >
                        <TableCell>
                          {getStatusChip(reservation.reservation_status)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">
                              {formatDate(reservation.start_date)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              ~ {formatDate(reservation.end_date)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{reservation.group_name || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.light, fontSize: '0.8rem' }}>
                              {reservation.customer_name?.[0] || '?'}
                            </Avatar>
                            <Typography variant="body2">{reservation.customer_name || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              {reservation.landline_phone || reservation.mobile_phone || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon fontSize="small" color="action" />
                            {reservation.email || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Dispatch the selected reservation ID to Redux
                                dispatch(setSelectedReservation(reservation.id));
                                // Navigate to Page0
                                navigate('/new/page0');
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Page5Layout>
  );
};

export default ReservationList; 