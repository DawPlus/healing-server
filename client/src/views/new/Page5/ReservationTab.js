import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import { useDispatch, useSelector } from 'react-redux';
import { actions, getState } from 'store/reducers/new5Reducer';
import moment from 'moment';

// Import services
import { fetchAllPage1DataForPage5 } from './services/dataService';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';

// Helper function to format dates
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Use Unix timestamp if it's a number
    if (typeof dateString === 'number') {
      return moment.unix(dateString).format('YYYY-MM-DD');
    }
    // Otherwise treat as regular date string
    return moment(dateString).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

const ReservationTab = () => {
  const dispatch = useDispatch();
  const { reservationList, isLoading } = useSelector(getState);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reservationsForDate, setReservationsForDate] = useState([]);
  
  // Fetch page1 data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchAllPage1DataForPage5(dispatch);
    };
    
    loadData();
  }, [dispatch]);
  
  // Function to get all dates for the selected month
  const getDatesForMonth = () => {
    const dates = [];
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    // Previous month's dates
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDate = new Date(selectedYear, selectedMonth, 1 - i - 1);
      dates.push({
        date: prevMonthDate,
        isCurrentMonth: false
      });
    }
    
    // Current month's dates
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({
        date: new Date(selectedYear, selectedMonth, i),
        isCurrentMonth: true
      });
    }
    
    // Next month's dates to fill the grid (6 rows of 7 days)
    const remainingCells = 42 - dates.length;
    for (let i = 1; i <= remainingCells; i++) {
      dates.push({
        date: new Date(selectedYear, selectedMonth + 1, i),
        isCurrentMonth: false
      });
    }
    
    return dates;
  };
  
  // Monthly reservation change handler
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Year change handler
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  
  // Date selection handler
  const handleDateClick = (date) => {
    setSelectedDate(date);
    
    // Filter reservations for the selected date
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find reservations that start on or before the selected date and end on or after it
    const matchingReservations = reservationList.filter(reservation => {
      const startDate = formatDateForDisplay(reservation.start_date);
      const endDate = formatDateForDisplay(reservation.end_date);
      
      // Check if the selected date falls within the reservation period
      return (dateStr >= startDate && dateStr <= endDate);
    });
    
    setReservationsForDate(matchingReservations);
  };
  
  // Open edit page in new tab
  const handleEditClick = (reservation) => {
    if (!reservation || !reservation.id) return;
    
    const editUrl = `/new/page1/edit/${reservation.id}`;
    window.open(editUrl, '_blank');
  };
  
  // Function to get reservation status chip
  const getStatusChip = (status) => {
    switch(status) {
      case 'preparation':
        return <Chip label="가예약" size="small" color="primary" />;
      case 'confirmed':
        return <Chip label="확정예약" size="small" color="success" />;
      default:
        return <Chip label={status || '상태없음'} size="small" />;
    }
  };
  
  // Calculate reservations for each date
  const calendarDates = getDatesForMonth().map(dateObj => {
    const dateStr = format(dateObj.date, 'yyyy-MM-dd');
    
    // Find reservations that include this date
    const dateReservations = reservationList.filter(reservation => {
      const startDate = formatDateForDisplay(reservation.start_date);
      const endDate = formatDateForDisplay(reservation.end_date);
      
      return (dateStr >= startDate && dateStr <= endDate);
    });
    
    return {
      ...dateObj,
      reservations: dateReservations
    };
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 예약달력
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography color="primary">예약 관리 시스템</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 예약관리시스템 첫화면</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 가예약/확정예약 달력형태 화면출력</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>- 월별/연별 프린팅 가능</Typography>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 일자 선택 시 객실예약 현황 화면 출력(프린트 기능)</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 일자별 단체 선택 시 단체별 세부정보 화면 이동</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>- 정보 확인 및 출력</Typography>
                  <Typography>- 수정 아이콘 클릭 시 새 탭에서 해당 데이터 수정</Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={3}>
            <FormControl fullWidth>
              <InputLabel id="year-select-label">연도</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                label="연도"
                onChange={handleYearChange}
              >
                {[2022, 2023, 2024, 2025].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
              <DatePicker
                views={['month']}
                label="월 선택"
                minDate={new Date(selectedYear, 0)}
                maxDate={new Date(selectedYear, 11)}
                value={new Date(selectedYear, selectedMonth)}
                onChange={(newDate) => handleMonthChange(newDate.getMonth())}
                renderInput={(params) => <TextField {...params} helperText={null} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                // Re-fetch the data
                fetchAllPage1DataForPage5(dispatch);
              }}
            >
              조회
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={3} sx={{ textAlign: 'right' }}>
            <Button variant="outlined">
              출력
            </Button>
          </Grid>
        </Grid>
        
        <Paper 
          elevation={3} 
          sx={{ p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '500px',
            borderRadius: 2,
            overflowY: 'auto' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            {selectedYear}년 {selectedMonth + 1}월 예약 달력
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gridTemplateRows: 'auto repeat(5, 1fr)',
            gap: 1,
            flex: 1
          }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <Box key={day} sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 1, 
                textAlign: 'center',
                fontWeight: 'bold',
                color: index === 0 ? 'error.main' : index === 6 ? 'primary.main' : 'text.primary'
              }}>
                {day}
              </Box>
            ))}
            
            {calendarDates.map((dateObj, index) => {
              const { date, isCurrentMonth, reservations } = dateObj;
              const dateStr = format(date, 'd');
              
              return (
                <Box 
                  key={index} 
                  sx={{ 
                    border: '1px solid #e0e0e0', 
                    p: 1, 
                    minHeight: '60px',
                    backgroundColor: isCurrentMonth ? 'white' : '#f9f9f9',
                    opacity: isCurrentMonth ? 1 : 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f0f7ff'
                    }
                  }}
                  onClick={() => handleDateClick(date)}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'absolute', 
                      top: 2, 
                      left: 5,
                      fontWeight: 'bold',
                      color: date.getDay() === 0 ? 'error.main' : 
                             date.getDay() === 6 ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {dateStr}
                  </Typography>
                  
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {reservations.slice(0, 3).map((reservation) => (
                      <Box 
                        key={reservation.id} 
                        sx={{ 
                          backgroundColor: 
                            reservation.reservation_status === 'confirmed' ? '#e8f5e9' : 
                            reservation.reservation_status === 'preparation' ? '#e3f2fd' : 
                            '#f5f5f5',
                          p: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography variant="caption" noWrap sx={{ maxWidth: '75%' }}>
                          {reservation.group_name || '단체명 없음'}
                        </Typography>
                        {getStatusChip(reservation.reservation_status)}
                      </Box>
                    ))}
                    
                    {reservations.length > 3 && (
                      <Typography variant="caption" align="center">
                        +{reservations.length - 3} 더보기
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
        
        {/* Selected date reservations */}
        {selectedDate && (
          <Paper elevation={3} sx={{ mt: 4, p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              {format(selectedDate, 'yyyy년 MM월 dd일')} 예약 목록
            </Typography>
            
            {reservationsForDate.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>단체명</TableCell>
                      <TableCell>예약상태</TableCell>
                      <TableCell>기간</TableCell>
                      <TableCell>담당자</TableCell>
                      <TableCell>연락처</TableCell>
                      <TableCell>이메일</TableCell>
                      <TableCell>수정</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservationsForDate.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.group_name || '단체명 없음'}</TableCell>
                        <TableCell>{getStatusChip(reservation.reservation_status)}</TableCell>
                        <TableCell>
                          {formatDateForDisplay(reservation.start_date)} ~ {formatDateForDisplay(reservation.end_date)}
                        </TableCell>
                        <TableCell>{reservation.customer_name || '-'}</TableCell>
                        <TableCell>{reservation.mobile_phone || reservation.landline_phone || '-'}</TableCell>
                        <TableCell>{reservation.email || '-'}</TableCell>
                        <TableCell>
                          <Tooltip title="수정하기 (새 탭)">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(reservation);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" align="center" sx={{ py: 4 }}>
                해당 날짜에 예약이 없습니다.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ReservationTab; 