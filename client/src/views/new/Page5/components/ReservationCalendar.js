import React, { useState, useEffect, useCallback } from 'react';
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
  useTheme,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  ButtonGroup,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';

import { useQuery } from '@apollo/client';
import { GET_PAGE5_CALENDAR_DATA, GET_PAGE5_RESERVATION_LIST } from '../graphql';
import moment from 'moment';
import PrintIcon from '@mui/icons-material/Print';
import MonthIcon from '@mui/icons-material/DateRange';
import YearIcon from '@mui/icons-material/EventNote';
import FilterIcon from '@mui/icons-material/FilterList';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';

// Import custom components
import Page5Layout from './Page5Layout';
import MonthCalendar from './MonthCalendar';

// 달력 날짜 셀 컴포넌트
const CalendarDay = ({ day, reservations, onClick, selected, currentMonth, theme }) => {
  const dateStr = day.format('YYYY-MM-DD');
  const isToday = moment().format('YYYY-MM-DD') === dateStr;
  const hasReservations = Array.isArray(reservations) && reservations.length > 0;
  
  // Fix the selected.format error by safely checking if selected is a valid moment object
  const isSelected = selected && 
                     typeof selected === 'object' && 
                     typeof selected.format === 'function' && 
                     dateStr === selected.format('YYYY-MM-DD');
  
  // Safely check if currentMonth matches day.month()
  const isCurrentMonth = typeof currentMonth === 'number' ? 
                        day.month() === currentMonth : 
                        true;
  
  // Define color constants for the 4 categories
  const EVENT_COLORS = {
    social_contribution: '#c8e6c9', // Light green for 사회공헌
    profit_business: '#f8bbd0',     // Light pink for 수익사업
    preparation: '#e0e0e0',         // Light gray for 가예약
    default: '#c8e6c9',             // 확정예약 하늘색 삭제 - 사회공헌과 동일한 초록색 사용
  };
  
  // Function to determine reservation color based on category
  const getReservationColor = (reservation) => {
    // Check business category first
    if (reservation.business_category === 'social_contribution') {
      return EVENT_COLORS.social_contribution;
    } else if (reservation.business_category === 'profit_business') {
      return EVENT_COLORS.profit_business;
    } else if (
      reservation.status === '가예약' || 
      reservation.status === '대기중' || 
      reservation.reservation_status === 'preparation'
    ) {
      return EVENT_COLORS.preparation;
    } else if (
      reservation.status === '확정예약' || 
      reservation.status === '예약확인' || 
      reservation.reservation_status === 'confirmed'
    ) {
      return EVENT_COLORS.social_contribution; // 확정예약일 때 초록색 (하늘색 삭제)
    }
    // Default to 기타 color for all other cases (확정예약 하늘색 삭제로 초록색 사용)
    return EVENT_COLORS.default;
  };
  
  return (
    <Box
      onClick={() => onClick(day)}
      sx={{
        position: 'relative',
        width: '100%',
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        padding: '4px',
        cursor: 'pointer',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        backgroundColor: isSelected 
          ? theme.palette.primary.light
          : isToday 
            ? '#f8f8ff' 
            : 'white',
        opacity: isCurrentMonth ? 1 : 0.5,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        }
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: isToday ? 'bold' : 'normal',
          color: 
            !isCurrentMonth ? '#bdbdbd' :
            day.day() === 0 ? 'error.main' : 
            day.day() === 6 ? 'primary.main' : 
            'text.primary'
        }}
      >
        {day.date()}
      </Typography>
      
      {hasReservations && (
        <Box sx={{ mt: 'auto', overflowY: 'hidden', maxHeight: '40px' }}>
          {Array.isArray(reservations) ? reservations.map((reservation, index) => {
            // Get organization name from either Page1 or Page5 data
            const orgName = reservation.organization_name || 
                           reservation.organization || 
                           reservation.group_name || 
                           '단체명 없음';
            
            return (
              <Box
                key={index}
                sx={{
                  backgroundColor: getReservationColor(reservation),
                  color: 'text.primary',
                  fontSize: '10px',
                  p: 0.3,
                  mb: 0.3,
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {orgName}
              </Box>
            );
          }) : <Box sx={{ fontSize: '10px', p: 0.3 }}>데이터 오류</Box>}
        </Box>
      )}
    </Box>
  );
};

// 예약 상태 레이블 표시
const getStatusLabel = (status) => {
  switch (status) {
    case '예약확인':
      return <CheckCircleIcon color="success" sx={{ mr: 1 }} />;
    case '가예약':
      return <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />;
    default:
      return null;
  }
};

// 통합된 날짜 변환 유틸리티 함수
const formatDateForComparison = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // 이미 유닉스 타임스탬프인 경우 (숫자)
    if (typeof dateValue === 'number') {
      return moment.unix(dateValue).format('YYYY-MM-DD');
    }
    
    // 서버에서 변환한 날짜 객체인 경우
    if (typeof dateValue === 'object' && dateValue !== null) {
      if (dateValue.unix) {
        return moment.unix(dateValue.unix).format('YYYY-MM-DD');
      }
      if (dateValue.formatted) {
        return dateValue.formatted;
      }
      if (dateValue.raw) {
        return moment(dateValue.raw).format('YYYY-MM-DD');
      }
    }
    
    // 문자열인 경우 (ISO 날짜 등)
    if (typeof dateValue === 'string') {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    // Moment 객체인 경우
    if (moment.isMoment(dateValue)) {
      return dateValue.format('YYYY-MM-DD');
    }
    
    // 일반 Date 객체인 경우
    if (dateValue instanceof Date) {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    return null;
  } catch (error) {
    console.error('날짜 변환 오류:', error, dateValue);
    return null;
  }
};

const ReservationCalendar = ({ onEditReservation, onNavigateToEdit }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [dateDetailOpen, setDateDetailOpen] = useState(false);
  const [roomStatusOpen, setRoomStatusOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printType, setPrintType] = useState('monthly');
  const [viewRoomStatus, setViewRoomStatus] = useState(false);
  
  // Room status dialog state
  const [roomStatusDialogOpen, setRoomStatusDialogOpen] = useState(false);
  const [monthViewRoomStatus, setMonthViewRoomStatus] = useState(false);
  
  // Day detail content state
  const [dayDetailContent, setDayDetailContent] = useState(null);
  
  // Request calendar data from Apollo Client on mount
  useEffect(() => {
    fetchCalendarDataForMonth(moment());
  }, []);
  
  // Update calendar data when month changes
  const fetchCalendarDataForMonth = useCallback((date) => {
    // Implement the logic to fetch calendar data from Apollo Client
  }, []);

  // 프린트 대화상자 열기
  const handleOpenPrintDialog = () => {
    setPrintDialogOpen(true);
    // Only support monthly printing now as per requirements
    setPrintType('monthly');
  };
  
  // 프린트 대화상자 닫기
  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };
  
  // 프린트 유형 변경 핸들러
  const handlePrintTypeChange = (type) => {
    setPrintType(type);
  };
  
  // 프린트 실행 핸들러
  const handlePrint = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // 제목 추가
      doc.setFontSize(18);
      doc.text(`${selectedDate.format('YYYY년 MM월')} 예약 캘린더`, pageWidth / 2, 15, { align: 'center' });
      
      // 서브타이틀 추가
      doc.setFontSize(12);
      doc.text(`출력일: ${moment().format('YYYY-MM-DD')}`, pageWidth / 2, 22, { align: 'center' });
      
      // 이미지 캡처를 위한 HTML 요소 스크린샷 (HTML2Canvas 라이브러리 필요)
      // 이 예제에서는 기본 PDF 테이블 형식으로 대체
      
      // 달력 헤더 (요일)
      const daysHeader = ['일', '월', '화', '수', '목', '금', '토'];
      const cellWidth = (pageWidth - 20) / 7;
      const cellHeight = 15;
      const startY = 30;
      
      // 헤더 그리기
      doc.setFillColor(220, 220, 220);
      for (let i = 0; i < 7; i++) {
        doc.rect(10 + i * cellWidth, startY, cellWidth, cellHeight, 'FD');
        doc.text(daysHeader[i], 10 + i * cellWidth + cellWidth / 2, startY + cellHeight / 2, { align: 'center' });
      }
      
      // 달력 날짜 그리기
      const monthStart = moment(selectedDate).startOf('month');
      const monthEnd = moment(selectedDate).endOf('month');
      const startDate = moment(monthStart).startOf('week');
      const endDate = moment(monthEnd).endOf('week');
      
      let day = startDate.clone();
      let weekCount = 0;
      
      while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
          const isCurrentMonth = day.month() === selectedDate.month();
          const y = startY + (weekCount + 1) * cellHeight;
          
          // 날짜 셀 그리기
          if (isCurrentMonth) {
            doc.setDrawColor(100, 100, 100);
          } else {
            doc.setDrawColor(200, 200, 200);
          }
          
          doc.rect(10 + i * cellWidth, y, cellWidth, cellHeight);
          
          // 날짜 텍스트
          if (isCurrentMonth) {
            doc.setTextColor(0, 0, 0);
          } else {
            doc.setTextColor(150, 150, 150);
          }
          
          doc.text(day.date().toString(), 10 + i * cellWidth + 5, y + 5);
          
          // 해당 날짜의 예약 정보
          const dateStr = day.format('YYYY-MM-DD');
          const eventsForDay = selectedReservations.filter(event => 
            moment(event.reservation_date).format('YYYY-MM-DD') === dateStr ||
            moment(event.start_date).format('YYYY-MM-DD') === dateStr
          );
          
          if (eventsForDay.length > 0) {
            doc.setFontSize(7);
            eventsForDay.slice(0, 2).forEach((event, index) => {
              const org = event.organization_name || event.organization || '단체명 없음';
              doc.text(`• ${org.substring(0, 8)}${org.length > 8 ? '..' : ''}`, 
                10 + i * cellWidth + 5, 
                y + 10 + (index * 4)
              );
            });
            
            if (eventsForDay.length > 2) {
              doc.text(`외 ${eventsForDay.length - 2}건`, 10 + i * cellWidth + 5, y + 10 + 8);
            }
            
            doc.setFontSize(12);
          }
          
          day.add(1, 'day');
        }
        
        weekCount++;
      }
      
      // PDF 저장
      doc.save(`${selectedDate.format('YYYY-MM')}_calendar.pdf`);
      handleClosePrintDialog();
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: 'PDF 생성 중 오류가 발생했습니다.'
      });
    }
  };
  
  // 객실 현황 대화상자 열기
  const handleOpenRoomStatus = () => {
    setRoomStatusDialogOpen(true);
    // 기본값은 일자별 보기
    setMonthViewRoomStatus(false);
    
    if (selectedDate) {
      const formattedDate = selectedDate.format('YYYY-MM-DD');
      // Implement the logic to fetch room reservation status from Apollo Client
    }
  };
  
  // 객실 현황 대화상자 닫기
  const handleCloseRoomStatus = () => {
    setRoomStatusDialogOpen(false);
  };
  
  const toggleRoomStatusView = () => {
    setMonthViewRoomStatus(!monthViewRoomStatus);
    
    // 월별 보기로 전환 시 해당 월의 모든 객실 데이터 로드
    if (!monthViewRoomStatus) {
      const monthStart = moment(selectedDate).startOf('month').format('YYYY-MM-DD');
      const monthEnd = moment(selectedDate).endOf('month').format('YYYY-MM-DD');
      
      // Implement the logic to fetch room reservation status for the entire month
    } else if (selectedDate) {
      // 일자별 보기로 돌아갈 때는 선택한 날짜의 데이터만 로드
      const formattedDate = selectedDate.format('YYYY-MM-DD');
      // Implement the logic to fetch room reservation status for the selected date
    }
  };
  
  // 객실 현황 출력 핸들러
  const handlePrintRoomStatus = () => {
    const doc = new jsPDF();
    
    // 헤더 추가
    doc.setFontSize(18);
    doc.text("객실 예약 현황", 105, 15, null, null, "center");
    doc.setFontSize(12);
    doc.text(`${selectedDate.format('YYYY년 MM월 DD일')} 기준`, 105, 25, null, null, "center");
    
    // 테이블 데이터 준비
    const tableColumn = ["객실명", "예약 상태", "단체명", "체크인", "체크아웃"];
    const tableRows = selectedReservations?.map(res => {
      const roomDetails = res.details && res.details.rooms ? res.details.rooms.map(r => r.name).join(', ') : '정보없음';
      
      return [
        roomDetails,
        res.reservation_status || res.status || '확인중',
        res.organization_name || res.organization || '단체명 없음',
        moment(res.reservation_date).format('YYYY-MM-DD'),
        res.details && res.details.endDate 
          ? moment(res.details.endDate).format('YYYY-MM-DD')
          : moment(res.reservation_date).add(1, 'days').format('YYYY-MM-DD')
      ];
    });
    
    // 예약이 없는 경우
    if (tableRows.length === 0) {
      tableRows.push(['예약 정보가 없습니다.', '', '', '', '']);
    }
    
    // 테이블 생성
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { cellPadding: 5, fontSize: 10 },
      headerStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    // PDF 출력
    doc.save(`객실예약현황_${selectedDate.format('YYYY-MM-DD')}.pdf`);
    handleCloseRoomStatus();
  };

  // Handle selection of a day
  const handleDateSelect = ({ day, reservations }) => {
    setSelectedDate(day);
    
    // Ensure we have an array of reservation objects
    let normalizedReservations = reservations || [];
    
    // If we got a single object, wrap it in an array
    if (normalizedReservations && !Array.isArray(normalizedReservations)) {
      normalizedReservations = [normalizedReservations];
    }
    
    // Normalize the data structure for each reservation
    normalizedReservations = normalizedReservations.map(res => {
      if (!res) return null;
      
      // Create a standard object with fields from both page1 and page5
      return {
        id: res.id,
        // Organization info - page5 fields first, then page1 fallbacks
        organization_name: res.organization_name || res.group_name || res.organization || '',
        // Contact info - page5 fields first, then page1 fallbacks
        contact_name: res.contact_name || res.customer_name || '',
        contact_phone: res.contact_phone || res.mobile_phone || res.landline_phone || '',
        contact_email: res.contact_email || res.email || '',
        // Status
        reservation_status: res.reservation_status || res.status || '가예약',
        // Dates
        reservation_date: res.reservation_date || res.start_date || '',
        end_date: res.end_date || '',
        // Page1 specific fields
        business_category: res.business_category || '',
        business_subcategory: res.business_subcategory || '',
        business_detail_category: res.business_detail_category || '',
        notes: res.notes || '',
        // Details - could be object or string
        details: res.details || {}
      };
    }).filter(Boolean); // Remove any null entries
    
    setSelectedReservations(normalizedReservations);
    console.log('선택된 날짜의 예약:', { day: day.format('YYYY-MM-DD'), reservations: normalizedReservations });
    
    // Render the DayDetail component with the selected information
    setDayDetailContent(
      <DayDetail 
        day={day} 
        reservations={normalizedReservations}
        onEditReservation={handleReservationClick}
      />
    );
  };
  
  // Handle click on a reservation in the list
  const handleReservationClick = (reservation) => {
    try {
      if (reservation && reservation.id) {
        console.log('선택한 예약 정보:', reservation);
        // 선택된 예약 정보 저장
        setSelectedDate(reservation.reservation_date ? moment(reservation.reservation_date) : moment(reservation.start_date));
      } else if (reservation && (reservation.organization || reservation.organization_name || reservation.group_name)) {
        // Handle data without ID - search by name
        const searchTerm = reservation.organization || reservation.organization_name || reservation.group_name;
        console.log('ID 없는 예약, 이름으로 검색:', searchTerm);
        // Implement the logic to search for reservations by name
      }
    } catch (error) {
      console.error('Error handling reservation click:', error);
    }
  };
  
  // 예약 수정을 위한 핸들러 - 특정 섹션으로 이동
  const handleEditSection = (section) => {
    if (selectedDate && selectedDate.isValid()) {
      onNavigateToEdit(selectedDate, section);
    }
  };
  
  // 전체 예약 수정 화면으로 이동
  const handleEditFullReservation = () => {
    if (selectedDate && selectedDate.isValid()) {
      onEditReservation(selectedDate.format('YYYY-MM-DD'));
    }
  };
  
  // 선택된 날짜의 상세 정보 표시
  const DayDetail = ({ day, reservations, onEditReservation }) => {
    const [expandedId, setExpandedId] = useState(null);
    
    const handleExpandClick = (id) => {
      setExpandedId(expandedId === id ? null : id);
    };
    
    // 상태 칩 렌더링
    const renderStatusChip = (status) => {
      let color = 'default';
      let icon = <HourglassEmptyIcon />;
      
      if (status === '예약확인') {
        color = 'success';
        icon = <CheckCircleIcon />;
      } else if (status === '취소') {
        color = 'error';
        icon = <CloseIcon />;
      }
      
      return (
        <Chip 
          size="small" 
          color={color} 
          icon={icon} 
          label={status || '대기중'} 
        />
      );
    };
    
    // 날짜 포맷팅 헬퍼
    const formatDate = (date) => {
      if (!date) return '-';
      
      if (moment.isMoment(date)) {
        return date.format('YYYY-MM-DD');
      }
      
      try {
        return moment(date).format('YYYY-MM-DD');
      } catch (e) {
        return '-';
      }
    };
    
    // 예약 상세 내역 표시
    const renderReservationDetail = (reservation) => {
      // 세부 정보 추출
      let details = {};
      
      if (typeof reservation.details === 'string') {
        try {
          details = JSON.parse(reservation.details);
        } catch (e) {
          console.error('예약 상세 정보 파싱 오류:', e);
        }
      } else if (typeof reservation.details === 'object') {
        details = reservation.details;
      }
      
      // Page1 데이터 매핑 (reservation 객체에서 직접 접근할 수 있는 필드들)
      const visitDate = details.visit_date || reservation.reservation_date || reservation.start_date || '';
      const endDate = details.endDate || reservation.end_date || '';
      const businessCategory = details.business_category || reservation.business_category || '';
      const notes = details.notes || reservation.notes || '';
      const totalCount = details.total_count || reservation.total_count || 0;
      
      return (
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={1}>
            {/* Page1 정보 */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">방문일</Typography>
              <Typography variant="body2">{formatDate(visitDate)}</Typography>
            </Grid>
            
            {endDate && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">종료일</Typography>
                <Typography variant="body2">{formatDate(endDate)}</Typography>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">방문 목적</Typography>
              <Typography variant="body2">{details.purpose || businessCategory || '-'}</Typography>
            </Grid>
            
            {/* Page2 정보 */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">총 인원</Typography>
              <Typography variant="body2">
                {totalCount || details.numberOfPeople || '-'}명
                {details.male_count && details.female_count && 
                  ` (남 ${details.male_count}명, 여 ${details.female_count}명)`}
              </Typography>
            </Grid>
            
            {(details.male_leader_count || details.female_leader_count) && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">리더 인원</Typography>
                <Typography variant="body2">
                  {details.total_leader_count || 0}명
                  {details.male_leader_count && details.female_leader_count && 
                    ` (남 ${details.male_leader_count}명, 여 ${details.female_leader_count}명)`}
                </Typography>
              </Grid>
            )}
            
            {/* Page4 정보 */}
            {details.project_name && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">프로젝트명</Typography>
                <Typography variant="body2">{details.project_name}</Typography>
              </Grid>
            )}
            
            {details.total_budget > 0 && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">총 예산</Typography>
                <Typography variant="body2">{details.total_budget.toLocaleString()}원</Typography>
              </Grid>
            )}
            
            {/* 객실 정보 */}
            {Array.isArray(details.rooms) && details.rooms.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>객실</Typography>
                <List dense disablePadding>
                  {details.rooms.map((room, index) => (
                    <ListItem key={`room-${index}`} disableGutters dense>
                      <ListItemText 
                        primary={`${room.name} (${room.quantity || 1}개)`}
                        secondary={`${room.total?.toLocaleString?.() || (room.price * (room.quantity || 1)).toLocaleString()}원`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {/* 프로그램 정보 */}
            {Array.isArray(details.programs) && details.programs.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>프로그램</Typography>
                <List dense disablePadding>
                  {details.programs.map((program, index) => (
                    <ListItem key={`program-${index}`} disableGutters dense>
                      <ListItemText 
                        primary={program.name}
                        secondary={`${program.total?.toLocaleString?.() || program.price.toLocaleString()}원`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {/* 식사 정보 */}
            {Array.isArray(details.meals) && details.meals.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>식사</Typography>
                <List dense disablePadding>
                  {details.meals.map((meal, index) => (
                    <ListItem key={`meal-${index}`} disableGutters dense>
                      <ListItemText 
                        primary={`${meal.name} (${meal.quantity || details.numberOfPeople || 1}인분)`}
                        secondary={`${meal.total?.toLocaleString?.() || (meal.price * (meal.quantity || 1)).toLocaleString()}원`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            
            {/* 비고 */}
            {notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>비고</Typography>
                <Typography variant="body2">{notes}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      );
    };
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title={`${day.format('YYYY년 M월 D일')} (${['일', '월', '화', '수', '목', '금', '토'][day.day()]})`}
          subheader={`예약 ${reservations.length}건`}
        />
        
        <CardContent>
          {reservations.length === 0 ? (
            <Typography color="textSecondary">예약이 없습니다.</Typography>
          ) : (
            <List disablePadding>
              {reservations.map((reservation, index) => (
                <React.Fragment key={reservation.id || index}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={() => onEditReservation(reservation)}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    }
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                    onClick={() => handleExpandClick(reservation.id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {reservation.organization_name || reservation.group_name || '단체명 없음'}
                          </Typography>
                          {renderStatusChip(reservation.reservation_status || reservation.status)}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                담당자: {reservation.contact_name || reservation.customer_name || '-'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                연락처: {reservation.contact_phone || reservation.mobile_phone || reservation.landline_phone || '-'}
                              </Typography>
                            </Grid>
                            
                            {expandedId === reservation.id && renderReservationDetail(reservation)}
                          </Grid>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  // Handle printer calendar
  const handlePrintCalendar = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`${selectedDate.format('YYYY년 MM월')} 예약 캘린더`, pageWidth / 2, 15, { align: 'center' });
      
      // Add subtitle with current date
      doc.setFontSize(12);
      doc.text(`출력일: ${moment().format('YYYY-MM-DD')}`, pageWidth / 2, 22, { align: 'center' });
      
      // Generate and save PDF
      doc.save(`calendar_${selectedDate.format('YYYYMM')}.pdf`);
      handleClosePrintDialog();
    } catch (error) {
      console.error('캘린더 인쇄 오류:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '인쇄 중 오류가 발생했습니다.'
      });
    }
  };
  
  // Handle view room status
  const handleViewRoomStatus = () => {
    setRoomStatusOpen(true);
  };
  
  // Get status chip for reservations
  const getStatusChip = (status) => {
    let color = 'default';
    let label = '상태 정보 없음';
    
    switch(status.toLowerCase()) {
      case 'confirmed':
      case '예약확인':
      case 'confirmed_reservation':
        color = 'success';
        label = '예약확인';
        break;
      case 'pending':
      case '대기중':
      case 'pending_confirmation':
        color = 'warning';
        label = '대기중';
        break;
      case 'cancelled':
      case '취소됨':
        color = 'error';
        label = '취소됨';
        break;
      default:
        color = 'default';
        label = status;
    }
    
    return <Chip size="small" color={color} label={label} />;
  };
  
  // Handle edit reservation
  const handleEditReservation = (id) => {
    if (id && onEditReservation) {
      onEditReservation(id);
    } else {
      // Open in new tab
      window.open(`/new/page1/edit/${id}`, '_blank');
    }
  };
  
  // Dummy room data for room status dialog
  const dummyRooms = [
    { id: 1, number: '101', type: '스탠다드', status: 'available' },
    { id: 2, number: '102', type: '스탠다드', status: 'booked' },
    { id: 3, number: '103', type: '스탠다드', status: 'available' },
    { id: 4, number: '201', type: '디럭스', status: 'booked' },
    { id: 5, number: '202', type: '디럭스', status: 'available' },
    { id: 6, number: '301', type: '스위트', status: 'booked' }
  ];

  return (
    <Page5Layout 
      title="예약 캘린더" 
      icon={<CalendarTodayIcon sx={{ fontSize: 28 }} />}
      activeTab="calendar"
    >
      <Box sx={{ display: 'flex', height: '75vh', gap: 2 }}>
        {/* Left side - calendar view */}
        <Paper sx={{ 
          flex: 2, 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          overflowY: 'hidden'
        }}>
          {/* Calendar action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<MonthIcon />}
            >
              {selectedDate.format('YYYY년 MM월')} 달력
            </Button>
            
            <Box>
              <ButtonGroup size="small" sx={{ mr: 1 }}>
                <Button>
                  <ChevronLeftIcon />
                </Button>
                <Button>
                  <ChevronRightIcon />
                </Button>
              </ButtonGroup>
              
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                onClick={handleOpenPrintDialog}
              >
                인쇄
              </Button>
              
         
            </Box>
          </Box>
          
          {/* Monthly calendar */}
          <MonthCalendar 
            onSelectDay={handleDateSelect}
          />
        </Paper>
        
        {/* Right side - selected day view */}
        <Paper sx={{ 
          flex: 1, 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto'
        }}>
          <Typography variant="h5" gutterBottom>
            {selectedDate.format('YYYY년 MM월 DD일')} 예약 목록
          </Typography>
          
          {selectedDate && (
            <>
              {selectedReservations && selectedReservations.length > 0 ? (
                <>
                  {selectedReservations.map((reservation, index) => {
                    // 다양한 형태의 데이터를 통합하여 처리
                    const id = reservation.id;
                    const orgName = reservation.organization_name || reservation.group_name || '-';
                    const contactName = reservation.contact_name || reservation.customer_name || '-';
                    const contactPhone = reservation.contact_phone || reservation.mobile_phone || reservation.landline_phone || '-';
                    const contactEmail = reservation.contact_email || reservation.email || '-';
                    const status = reservation.reservation_status || 'pending';
                    
                    return (
                      <Card key={id || index} sx={{ mb: 2, position: 'relative' }}>
                        <CardContent>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">{orgName}</Typography>
                            {getStatusChip(status)}
                          </Box>
                          
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {contactName}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {contactPhone}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {contactEmail}
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handleEditReservation(id)}
                            startIcon={<EditIcon />}
                          >
                            예약 정보 수정
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                  <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="textSecondary">
                    {selectedDate ? '예약 정보가 없습니다' : '날짜를 선택하세요'}
                  </Typography>
                  {selectedDate && (
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => {
                        // 새 예약 날짜를 선택된 날짜로 설정
                        const formattedDate = selectedDate.format('YYYY-MM-DD');
                        // Implement the logic to create a new reservation
                      }}
                    >
                      새 예약 만들기
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog}>
        <DialogTitle>일정표 인쇄</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {`${selectedDate.format('YYYY년 MM월')} 예약 캘린더를 인쇄하시겠습니까?`}
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={printType}
              onChange={(e) => setPrintType(e.target.value)}
            >
              <FormControlLabel value="monthly" control={<Radio />} label="월간 일정표" />
              <FormControlLabel value="day" control={<Radio />} label="일일 일정표" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>취소</Button>
          <Button 
            onClick={handlePrint} 
            color="primary" 
            variant="contained"
          >
            인쇄
          </Button>
        </DialogActions>
      </Dialog>

      {/* Room Status Dialog */}
      <Dialog 
        open={roomStatusOpen} 
        onClose={handleCloseRoomStatus}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          객실 예약 현황 
          {monthViewRoomStatus 
            ? ` (${selectedDate.format('YYYY년 MM월')})` 
            : selectedDate 
              ? ` (${selectedDate.format('YYYY년 MM월 DD일')})` 
              : ''
          }
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>객실번호</TableCell>
                    <TableCell>객실타입</TableCell>
                    <TableCell>단체명</TableCell>
                    <TableCell>담당자</TableCell>
                    <TableCell>연락처</TableCell>
                    <TableCell>상태</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dummyRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.number}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{'단체명 정보 없음'}</TableCell>
                      <TableCell>{'담당자 정보 없음'}</TableCell>
                      <TableCell>{'연락처 정보 없음'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={room.status === 'available' ? '이용가능' : '예약중'} 
                          color={room.status === 'available' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setMonthViewRoomStatus(!monthViewRoomStatus)}
          >
            {monthViewRoomStatus ? '일자별 보기' : '월별 보기'}
          </Button>
          <Button onClick={handleCloseRoomStatus}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Page5Layout>
  );
};

export default ReservationCalendar; 