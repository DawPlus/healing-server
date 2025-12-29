import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  CircularProgress,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_CALENDAR_DATA, GET_PAGE5_RESERVATION_LIST } from '../graphql';
import moment from 'moment';
import 'moment/locale/ko';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PrintIcon from '@mui/icons-material/Print';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import Page5Layout from '../components/Page5Layout';
import { PrintSection } from 'ui-component/printButton';
import '../../../../styles/calendar.css';
import { createKoreanPdf, safeText } from 'utils/koreanFonts';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { exportCalendarPdf } from './calendarPdf';  // Import the calendarPdf function
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedReservation } from '../../../../store/reducers/reservationSlice';

// Korean day of week labels
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// Background colors for different events
const EVENT_COLORS = {
  social_contribution: '#c8e6c9', // Light green for 사회공헌
  profit_business: '#f8bbd0',     // Light pink for 수익사업
  preparation: '#e0e0e0',         // Light gray for 가예약/가예약
  default: '#c8e6c9',             // 확정예약 하늘색 삭제 - 사회공헌과 동일한 초록색 사용
  available: '#d3d3d3',          // Light gray for available
  unavailable: '#f0f0f0',         // Light gray for unavailable
};

// Legacy array of colors for backward compatibility
const EVENT_COLORS_ARRAY = [
  '#c8e6c9', // Light green
  '#ffecb3', // Light yellow
  '#bbdefb', // Light blue
  '#f8bbd0', // Light pink
  '#d7ccc8'  // Light brown
];

const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, onPrint, onPdfDownload, pdfLoading }) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onPrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h4" sx={{ mx: 2 }}>
          {currentDate.format('YYYY년 MM월')}
        </Typography>
        <IconButton onClick={onNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
    
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PictureAsPdfIcon />}
          onClick={onPdfDownload}
          disabled={pdfLoading}
        >
          {pdfLoading ? '처리 중...' : 'PDF 다운로드'}
        </Button>
      </Box>
    </Box>
  );
};

const formatDateForComparison = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    if (typeof dateValue === 'number') {
      return moment.unix(dateValue).format('YYYY-MM-DD');
    }
    
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
    
    if (typeof dateValue === 'string') {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    if (moment.isMoment(dateValue)) {
      return dateValue.format('YYYY-MM-DD');
    }
    
    if (dateValue instanceof Date) {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    return null;
  } catch (error) {
    console.error('날짜 변환 오류:', error, dateValue);
    return null;
  }
};

// Sidebar component to display reservation details
const ReservationSidebar = ({ open, onClose, selectedDay, reservations, listData }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const drawerWidth = 320;
  
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return moment(date).format('YYYY년 MM월 DD일');
    } catch (error) {
      return '';
    }
  };
  
  const handleClose = () => {
    if (onClose) onClose();
  };
  
  const getStatusChip = (status) => {
    let color = 'default';
    let variant = 'outlined';
    let customStyle = {};
    
    if (status === '예약확인' || status === 'confirmed') {
      color = 'success';
      variant = 'filled';
    } else if (status === '가예약' || status === '대기중' || status === 'preparation') {
      // Use custom style instead of warning color
      color = 'default';
      variant = 'filled';
      customStyle = {
        backgroundColor: '#e0e0e0',
        color: 'rgba(0, 0, 0, 0.87)'
      };
    }
    
    return (
      <Chip 
        label={status === 'confirmed' ? '예약확인' : (status === 'preparation' ? '가예약' : (status || '상태 미정'))} 
        color={color} 
        variant={variant}
        size="small"
        sx={customStyle}
      />
    );
  };

  // Get a chip to display business category
  const getBusinessCategoryChip = (category) => {
    if (!category) return null;
    
    let label = '확정예약';  // 기타 → 확정예약으로 변경
    let color = 'default';
    
    if (category === 'social_contribution') {
      label = '사회공헌';
      color = 'success';
    } else if (category === 'profit_business') {
      label = '수익사업';
      color = 'secondary';
    }
    
    return (
      <Chip 
        label={label} 
        color={color} 
        variant="outlined" 
        size="small" 
        sx={{ ml: 1 }}
      />
    );
  };

  // Function to navigate to page0 with the selected organization
  const handleOrganizationClick = (reservation) => {
    if (!reservation) return;
    
    // Get reservation ID if it exists
    if (reservation.id) {
      let id = reservation.id;
      
      // If id is in format "list-123", extract the numeric part
      if (typeof id === 'string' && id.startsWith('list-')) {
        id = id.replace('list-', '');
      }
      
      // Dispatch the selected reservation ID to Redux
      dispatch(setSelectedReservation(id.toString()));
      // Navigate to Page0
      navigate('/new/page0');
    } else {
      // Try to find the reservation by organization name
      const orgName = reservation.organization_name || reservation.organization;
      if (!orgName) return;
      
      // Check if we have list data
      const list = listData?.getPage1List || [];
      const matchingReservation = list.find(
        res => (res.organization_name || res.group_name) === orgName
      );
      
      if (matchingReservation) {
        // Dispatch the selected reservation ID to Redux
        dispatch(setSelectedReservation(matchingReservation.id.toString()));
        // Navigate to Page0
        navigate('/new/page0');
      } else {
        // Fallback to using the organization name via state (old method)
        navigate('/new/page0', { 
          state: { 
            selectedOrganization: orgName 
          }
        });
      }
    }
  };
  
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '84px',
          height: 'calc(100% - 84px)',
          zIndex: 1000
        },
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}
      >
        <Typography variant="h6" noWrap>
          {selectedDay ? selectedDay.format('YYYY년 MM월 DD일') : '예약 정보'}
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: theme.palette.primary.contrastText }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: 3, px: 2 }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          예약된 일정 {reservations?.length || 0}개
        </Typography>
      </Box>
      {selectedDay && (
        <List sx={{ mt: 1, p: 0 }}>
          {reservations && reservations.length > 0 ? (
            reservations.map((reservation, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  p: 1.5,
                  mb: 1
                }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    transition: 'all 0.3s ease',
                    borderLeft: `4px solid ${reservation.color || EVENT_COLORS_ARRAY[index % EVENT_COLORS_ARRAY.length]}`,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleOrganizationClick(reservation)}
                >
                  <CardHeader
                    title={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {reservation.organization_name || reservation.organization || '단체명 없음'}
                      </Typography>
                    }
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(reservation.start_date || reservation.reservation_date)}
                        </Typography>
                        {getBusinessCategoryChip(reservation.business_category)}
                      </Box>
                    }
                    action={getStatusChip(reservation.reservation_status || reservation.status)}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    <Stack spacing={1.5}>
                      {reservation.contact_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2">{reservation.contact_name}</Typography>
                        </Box>
                      )}
                      {reservation.contact_phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2">{reservation.contact_phone}</Typography>
                        </Box>
                      )}
                      {reservation.contact_email && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2">{reservation.contact_email}</Typography>
                        </Box>
                      )}
                      {reservation.persons && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <GroupIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2">{reservation.persons}명</Typography>
                        </Box>
                      )}
                      {reservation.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2" noWrap>{reservation.address}</Typography>
                        </Box>
                      )}
                    </Stack>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="textSecondary">
                        클릭하여 이 단체 정보 페이지로 이동
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                해당 일자에 예약이 없습니다.
              </Typography>
            </Box>
          )}
        </List>
      )}
    </Drawer>
  );
};

// Create a new component for the color legend
const ColorLegend = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: EVENT_COLORS.social_contribution,
            borderRadius: '3px',
            mr: 1 
          }} 
        />
        <Typography variant="caption">사회공헌</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: EVENT_COLORS.profit_business,
            borderRadius: '3px',
            mr: 1 
          }} 
        />
        <Typography variant="caption">수익사업</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: EVENT_COLORS.preparation,
            borderRadius: '3px',
            mr: 1 
          }} 
        />
        <Typography variant="caption">가예약</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: EVENT_COLORS.default,
            borderRadius: '3px',
            mr: 1 
          }} 
        />
        <Typography variant="caption">확정예약</Typography>
      </Box>
    </Box>
  );
};

const CalendarPage = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use Apollo Client queries
  const { data: calendarData, loading: calendarLoading } = useQuery(GET_PAGE5_CALENDAR_DATA, {
    variables: { 
      month: currentDate.format('MM'),
      year: currentDate.format('YYYY')
    },
    fetchPolicy: 'network-only'
  });
  
  const { data: listData, loading: listLoading } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only'
  });
  
  const isLoading = calendarLoading || listLoading;
  const events = calendarData?.getCalendarData || [];
  const list = listData?.getPage1List || [];

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };
  
  const handleDayClick = (day, events) => {
    setSelectedDay(day);
    setSelectedReservations(events);
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  // Handle PDF download button click
  const handlePdfDownload = () => {
    try {
      setPdfLoading(true);
      
      // Prepare data for PDF export
      const dataForPdf = {
        events: events,
        list: list
      };
      
      // Call the PDF export function
      const success = exportCalendarPdf(dataForPdf, currentDate);
      
      if (!success) {
        console.error('PDF 생성에 실패했습니다.');
        alert('PDF 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Process events to identify multi-day events
  const processEvents = () => {
    console.log('Processing calendar events data...');
    
    // Create a map to track unique events by ID to prevent duplicates
    const eventMap = new Map();
    
    // Add entries from events data
    const eventsArray = Array.isArray(events) ? events : [];
    eventsArray.forEach(event => {
      // Only add if not already in the map
      if (!eventMap.has(event.id)) {
        console.log(`현재상태 확인 - 이벤트 데이터:`, {
          id: event.id,
          organization: event.organization || event.title,
          business_category: event.business_category,
          status: event.status,
          reservation_status: event.reservation_status
        });
        
        // Determine color based on business_category FIRST (highest priority)
        let color = EVENT_COLORS.default; // 기본 색상 (확정예약 하늘색 삭제로 초록색 사용)
        let colorReason = '기본색상(초록색)';
        
        if (event.business_category === 'social_contribution') {
          color = EVENT_COLORS.social_contribution; // Light green for social contribution
          colorReason = '사회공헌(초록색)';
        } else if (event.business_category === 'profit_business') {
          color = EVENT_COLORS.profit_business; // Light pink for profit business
          colorReason = '수익사업(분홍색)';
        } else if (event.status === '가예약' || event.status === '대기중' || event.reservation_status === 'preparation') {
          color = EVENT_COLORS.preparation; // Use consistent light gray for preparation
          colorReason = '가예약/대기중(회색)';
        } else if (event.status === '확정예약' || event.status === '예약확인' || event.reservation_status === 'confirmed') {
          color = EVENT_COLORS.social_contribution; // 확정예약일 때 초록색 (하늘색 삭제)
          colorReason = '확정예약(초록색)';
        }
        // If none of the above conditions match, color remains as default (초록색)
        
        console.log(`현재상태 확인 - 색상 결정:`, {
          organization: event.organization || event.title,
          selectedColor: color,
          reason: colorReason,
          business_category: event.business_category || 'null',
          status: event.status || 'null',
          reservation_status: event.reservation_status || 'null'
        });
        
        // Check if this is a multi-day event
        const startDate = moment(event.start);
        const endDate = event.end ? moment(event.end) : startDate.clone();
        const isMultiDay = startDate.format('YYYY-MM-DD') !== endDate.format('YYYY-MM-DD');
        
        if (isMultiDay) {
          console.log(`Multi-day event detected: ${event.organization || event.title}, start: ${startDate.format('YYYY-MM-DD')}, end: ${endDate.format('YYYY-MM-DD')}`);
        }
        
        eventMap.set(event.id, {
          ...event,
          // Keep track of data source
          source: 'events',
          // Apply business_category color with highest priority
          color: color,
          colorReason: colorReason, // 디버깅용
          // Explicitly mark as multi-day if it spans multiple days
          multiDay: isMultiDay
        });
      }
    });
    
    // Add entries from list data
    const listArray = Array.isArray(list) ? list : [];
    listArray.forEach(item => {
      // Only add if not already in the map and has start_date
      if (item.start_date && !eventMap.has(`list-${item.id}`)) {
        console.log(`현재상태 확인 - 리스트 데이터:`, {
          id: `list-${item.id}`,
          organization: item.group_name,
          business_category: item.business_category,
          status: item.status,
          reservation_status: item.reservation_status
        });
        
        // Determine color based on business_category FIRST (highest priority)
        let color = EVENT_COLORS.default; // 기본 색상 (확정예약 하늘색 삭제로 초록색 사용)
        let colorReason = '기본색상(초록색)';
        
        if (item.business_category === 'social_contribution') {
          color = EVENT_COLORS.social_contribution; // Light green for social contribution
          colorReason = '사회공헌(초록색)';
        } else if (item.business_category === 'profit_business') {
          color = EVENT_COLORS.profit_business; // Light pink for profit business
          colorReason = '수익사업(분홍색)';
        } else if (item.reservation_status === 'preparation' || item.status === '가예약' || item.status === '대기중') {
          color = EVENT_COLORS.preparation; // Use light gray for preparation status
          colorReason = '가예약/대기중(회색)';
        } else if (item.status === '확정예약' || item.status === '예약확인' || item.reservation_status === 'confirmed') {
          color = EVENT_COLORS.social_contribution; // 확정예약일 때 초록색 (하늘색 삭제)
          colorReason = '확정예약(초록색)';
        }
        // If none of the above conditions match, color remains as default (초록색)
        
        console.log(`현재상태 확인 - 색상 결정:`, {
          organization: item.group_name,
          selectedColor: color,
          reason: colorReason,
          business_category: item.business_category || 'null',
          status: item.status || 'null',
          reservation_status: item.reservation_status || 'null'
        });
        
        // Check if this is a multi-day event
        const startDate = moment(item.start_date);
        const endDate = item.end_date ? moment(item.end_date) : startDate.clone();
        const isMultiDay = startDate.format('YYYY-MM-DD') !== endDate.format('YYYY-MM-DD');
        
        eventMap.set(`list-${item.id}`, {
          id: `list-${item.id}`,
          title: item.group_name || '단체명 없음',
          organization: item.group_name || '단체명 없음',
          start: item.start_date,
          end: item.end_date || item.start_date,
          status: item.reservation_status || '대기중',
          color: color,
          colorReason: colorReason, // 디버깅용
          multiDay: isMultiDay,
          // Add all properties from the list item
          ...item,
          // Keep track of data source
          source: 'list'
        });
      }
    });
    
    // Convert map to array
    const combinedEvents = Array.from(eventMap.values());
    
    console.log(`현재상태 확인 - 최종 처리된 이벤트 수: ${combinedEvents.length} (events: ${events?.length || 0}, list: ${list?.length || 0})`);
    
    // Process multi-day events
    return combinedEvents.map(event => {
      const startDate = moment(event.start);
      const endDate = event.end ? moment(event.end) : startDate.clone();
      
      // Consider it multi-day if it spans more than one day
      const isMultiDay = startDate.format('YYYY-MM-DD') !== endDate.format('YYYY-MM-DD');
      
      return {
        ...event,
        multiDay: isMultiDay,
        duration: isMultiDay ? endDate.diff(startDate, 'days') + 1 : 1,
        startDateFormatted: startDate.format('YYYY-MM-DD'),
        endDateFormatted: endDate.format('YYYY-MM-DD')
      };
    });
  };

  // Memoize processed events to prevent infinite loops
  const processedEvents = useMemo(() => {
    if (!events && !list) return [];
    return processEvents();
  }, [events, list]);

  // Create a global organization order cache to maintain consistent ordering
  const [organizationOrderCache] = useState(new Map());

  // Pre-populate the organization order cache when events data changes
  useEffect(() => {
    if (events?.length > 0 || list?.length > 0) {
      console.log(`Calendar data loaded: ${events?.length || 0} events, ${list?.length || 0} list items`);
      
      // Count multi-day events for debugging
      let multiDayCount = 0;
      processedEvents.forEach(event => {
        if (event.multiDay) {
          multiDayCount++;
        }
      });
      
      console.log(`Found ${multiDayCount} multi-day events`);
      
      const organizations = new Set();
      
      // Collect all organization names
      processedEvents.forEach(event => {
        const orgName = event.organization || event.title || event.group_name || '';
        if (orgName && !organizations.has(orgName)) {
          organizations.add(orgName);
        }
      });

      // Assign consistent order to all organizations
      let order = 0;
      organizations.forEach(orgName => {
        if (!organizationOrderCache.has(orgName)) {
          organizationOrderCache.set(orgName, order++);
        }
      });
    }
  }, [processedEvents, organizationOrderCache]);

  // Get events for a specific day
  const getCalendarDayEvents = (day) => {
    try {
      if (!events && !list) {
        return [];
      }
      
      // Convert day to a date string for comparison
      const dateStr = moment.isMoment(day) ? day.format('YYYY-MM-DD') : 
                     (day instanceof Date) ? moment(day).format('YYYY-MM-DD') : 
                     moment(currentDate).date(parseInt(day)).format('YYYY-MM-DD');
      
      // Filter events for this day using memoized processedEvents
      let dayEvents = processedEvents.filter(event => {
        if (!event.start) return false;
        
        try {
          const eventStart = moment(event.start);
          const eventEnd = event.end ? moment(event.end) : eventStart.clone();
          const dayDate = moment(dateStr);
          
          // 날짜 비교를 더 안전하게 처리
          const startDateStr = eventStart.format('YYYY-MM-DD');
          const endDateStr = eventEnd.format('YYYY-MM-DD');
          const dayDateStr = dayDate.format('YYYY-MM-DD');
          
          // 시작일과 종료일 사이에 있는지 확인 (포함)
          return dayDateStr >= startDateStr && dayDateStr <= endDateStr;
        } catch (error) {
          console.error('날짜 비교 오류:', error, event);
          return false;
        }
      });
      
      // Filter out duplicates by organization/group name to ensure each organization appears only once
      // BUT ONLY for the CURRENT DAY, not across the entire calendar
      const uniqueOrgNames = new Set();
      dayEvents = dayEvents.filter(event => {
        const orgName = event.organization || event.title || event.group_name;
        
        // If we've already seen this organization name ON THIS DAY, filter it out
        if (uniqueOrgNames.has(orgName)) {
          return false;
        }
        
        // Otherwise, add it to our set and keep it
        uniqueOrgNames.add(orgName);
        return true;
      });
      
      // Sort events based on a consistent organization order
      dayEvents.sort((a, b) => {
        const orgNameA = a.organization || a.title || a.group_name || '';
        const orgNameB = b.organization || b.title || b.group_name || '';
        
        // If both organizations exist in the cache, use their cached order
        if (organizationOrderCache.has(orgNameA) && organizationOrderCache.has(orgNameB)) {
          return organizationOrderCache.get(orgNameA) - organizationOrderCache.get(orgNameB);
        }
        
        // If only one exists in the cache, prioritize the cached one
        if (organizationOrderCache.has(orgNameA)) return -1;
        if (organizationOrderCache.has(orgNameB)) return 1;
        
        // If neither exists in cache, add them with a new order
        const nextOrder = organizationOrderCache.size;
        if (!organizationOrderCache.has(orgNameA)) {
          organizationOrderCache.set(orgNameA, nextOrder);
        }
        if (!organizationOrderCache.has(orgNameB)) {
          organizationOrderCache.set(orgNameB, nextOrder + 1);
        }
        
        // Use the newly assigned order
        return organizationOrderCache.get(orgNameA) - organizationOrderCache.get(orgNameB);
      });
      
      // Calculate event positions based on day of the event
      return dayEvents.map((event, index) => {
        const startDateFormatted = event.startDateFormatted;
        const isFirstDay = startDateFormatted === dateStr;
        const isLastDay = event.endDateFormatted === dateStr;
        
        // Use the color already determined in processedEvents
        let color = event.color;
        
        if (!color) {
          if (event.business_category === 'social_contribution') {
            color = EVENT_COLORS.social_contribution; // Light green for social contribution
          } else if (event.business_category === 'profit_business') {
            color = EVENT_COLORS.profit_business; // Light pink for profit business
          } else if (event.status === '가예약' || event.status === '대기중' || 
                  event.reservation_status === 'preparation') {
            color = EVENT_COLORS.preparation; // Light gray for pending status
          } else if (event.status === '확정예약' || event.status === '예약확인' || event.reservation_status === 'confirmed') {
            color = EVENT_COLORS.social_contribution; // 확정예약일 때 초록색 (하늘색 삭제)
          } else {
            color = EVENT_COLORS.default; // 기본 색상 (확정예약 하늘색 삭제로 초록색)
          }
        }
        
        return {
          ...event,
          color,
          isFirstDay,
          isLastDay,
          dayPosition: index % 3, // Limit to 3 positions
          isOverflowing: index >= 3
        };
      });
    } catch (error) {
      console.error('캘린더 데이터 조회 오류:', error);
      return [];
    }
  };

  // Get the color for an event based on its properties
  const getEventColor = (event, index) => {
    // If event already has a color assigned (from processEvents), use it with highest priority
    if (event.color) {
      return event.color;
    }
    
    // 1순위: 사업구분에 따른 색상 (business_category 최우선)
    if (event.business_category === 'social_contribution') {
      return EVENT_COLORS.social_contribution;
    } else if (event.business_category === 'profit_business') {
      return EVENT_COLORS.profit_business;
    }
    
    // 2순위: 사업구분이 없을 때만 예약상태에 따른 색상
    if (!event.business_category || event.business_category === '' || event.business_category === null) {
      if (event.status === '가예약' || event.status === '대기중' || event.reservation_status === 'preparation') {
        return EVENT_COLORS.preparation;
      } else if (event.status === '확정예약' || event.status === '예약확인' || event.reservation_status === 'confirmed') {
        return EVENT_COLORS.social_contribution; // 확정예약일 때 초록색
      }
    }
    
    // 3순위: 기본 색상 (확정예약 하늘색 삭제로 초록색 사용)
    return EVENT_COLORS.default;
  };

  // Handle print button click - use jsPDF like other reports
  const handlePrint = () => {
    try {
      // PDF 생성 - 가로 방향(landscape)으로 설정
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // 타이틀 추가
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80); // 어두운 파란색 계열
      doc.text('하이힐링원 예약현황', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // 서브타이틀 
      doc.setFontSize(16);
      doc.setTextColor(52, 73, 94); // 약간 더 밝은 파란색
      doc.text(`${currentDate.format('YYYY년 M월')} 예약 달력`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      
      // 업데이트 날짜
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // 회색
      doc.text(`최종 수정일: ${moment().format('YYYY년 MM월 DD일')}`, doc.internal.pageSize.getWidth() - 20, 40, { align: 'right' });
      
      // 달력 데이터 준비
      const monthStart = moment(currentDate).startOf('month');
      const monthEnd = moment(currentDate).endOf('month');
      const startDate = moment(monthStart).startOf('week');
      const endDate = moment(monthEnd).endOf('week');
      
      // 달력 데이터 생성
      const tableData = [];
      let days = [];
      let day = startDate.clone();
      
      // 각 주 처리
      while (day <= endDate) {
        let weekData = [];
        
        // 각 요일 처리
        for (let i = 0; i < 7; i++) {
          const isCurrentMonth = day.month() === currentDate.month();
          const isToday = day.isSame(moment(), 'day');
          const isWeekend = i === 0 || i === 6;
          const isHoliday = day.month() === 0 && day.date() === 1;
          
          // 이 날짜의 이벤트 가져오기
          const events = getCalendarDayEvents(day.clone());
          
          // 날짜 셀 내용 구성 
          let cellContent = '';
          
          // 날짜 표시 (강조 표시를 위해 ★로 감싸기)
          cellContent += isCurrentMonth ? 
            `★${day.date()}★` : 
            `★(${day.date()})★`;
            
          // 신정 표시
          if (isHoliday) {
            cellContent += ' 신정';
          }
          
          // 각 이벤트 추가
          events.forEach((event, index) => {
            if (index < 5) {  // 최대 5개까지만 표시
              cellContent += `\n• ${event.organization || event.title}`;
            } else if (index === 5) {
              cellContent += `\n외 ${events.length - 5}건 더...`;
            }
          });
          
          weekData.push({
            content: cellContent,
            isCurrentMonth: isCurrentMonth,
            isWeekend: isWeekend,
            isToday: isToday,
            dayOfWeek: i
          });
          day.add(1, 'days');
        }
        
        // 주 데이터 테이블에 추가
        tableData.push(weekData);
      }
      
      // 요일 헤더
      const DAYS_OF_WEEK_SIMPLE = ['일', '월', '화', '수', '목', '금', '토'];
      
      // 테이블 생성
      doc.autoTable({
        head: [DAYS_OF_WEEK_SIMPLE.map(day => day)],
        body: tableData.map(week => week.map(day => day.content)),
        startY: 45,
        styles: {
          cellPadding: 3,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [80, 80, 80],
          valign: 'top'
        },
        columnStyles: {
          0: { textColor: [220, 20, 20] },  // 일요일 - 빨간색
          6: { textColor: [20, 20, 220] }   // 토요일 - 파란색
        },
        willDrawCell: function(data) {
          const td = data.cell;
          const tr = data.row;
          
          // 헤더 스타일
          if (data.section === 'head') {
            doc.setFillColor(240, 240, 240);
            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'bold');
            return;
          }
          
          // 테두리 색상 설정
          doc.setDrawColor(200, 200, 200);
          
          // 셀 내용이 없는 경우 무시
          if (!data.cell.text || data.cell.text.length === 0) return;
          
          const cellInfo = tableData[data.row.index][data.column.index];
          const dayOfWeek = cellInfo.dayOfWeek;
          
          // 셀 배경색 설정 (주말, 평일, 오늘 등에 따라 다르게)
          if (!cellInfo.isCurrentMonth) {
            // 다른 달 날짜는 연한 회색
            doc.setFillColor(245, 245, 245);
            doc.setTextColor(150, 150, 150);
          } else if (cellInfo.isToday) {
            // 오늘 날짜는 연한 노란색 배경
            doc.setFillColor(255, 250, 210);
            if (dayOfWeek === 0) {
              doc.setTextColor(220, 20, 20); // 일요일 빨간색
            } else if (dayOfWeek === 6) {
              doc.setTextColor(20, 20, 220); // 토요일 파란색
            } else {
              doc.setTextColor(0, 0, 0); // 평일 검정색
            }
          } else if (dayOfWeek === 0) {
            // 일요일은 연한 빨간색 배경
            doc.setFillColor(255, 240, 240);
            doc.setTextColor(220, 20, 20);
          } else if (dayOfWeek === 6) {
            // 토요일은 연한 파란색 배경
            doc.setFillColor(240, 240, 255);
            doc.setTextColor(20, 20, 220);
          } else {
            // 평일은 흰색 배경
            doc.setFillColor(255, 255, 255);
            doc.setTextColor(0, 0, 0);
          }
        },
        didParseCell: function(data) {
          // 날짜 숫자 부분 강조 설정
          if (data.section === 'body' && data.cell.text.length > 0) {
            // ★로 감싼 부분을 찾아서 볼드체로 변경
            let mainText = data.cell.text[0];
            const match = mainText.match(/★(.+?)★/);
            
            if (match) {
              // ★ 기호 제거하고 볼드체로 설정
              mainText = mainText.replace(/★(.+?)★/, '$1');
              
              // 내용의 첫 부분(날짜)를 굵게 표시하는 방식으로 변경
              data.cell.text[0] = mainText;
              data.cell.styles.fontStyle = 'bold';
              
              // 날짜 이후 내용(이벤트들)을 일반 폰트로 표시
              if (mainText.includes('\n')) {
                const [dateText, ...eventTexts] = mainText.split('\n');
                data.cell.text = [dateText, ...eventTexts];
                
                // 첫 줄만 볼드처리, 나머지는 일반 텍스트
                data.cell.styles.font = 'helvetica'; 
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        },
        didDrawCell: function(data) {
          // 셀이 그려진 후 추가 처리
          if (data.section === 'body') {
            // 날짜와 이벤트 사이에 구분선 추가
            if (data.cell.text.length > 1) {
              const y = data.cell.y + 10; // 첫 줄 높이 이후에 선 추가
              doc.setDrawColor(220, 220, 220);
              doc.setLineWidth(0.1);
              doc.line(data.cell.x, y, data.cell.x + data.cell.width, y);
            }
          }
        }
      });
      
      // 참고 사항 추가
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('※ 본 달력은 하이힐링원의 예약현황을 나타내며, 실제 상황과 다를 수 있습니다.', 14, finalY);
      doc.text('※ 자세한 내용은 관리자에게 문의하시기 바랍니다.', 14, finalY + 5);
      
      // PDF 저장
      doc.save(`하이힐링원_예약현황_${currentDate.format('YYYY_MM')}.pdf`);
      
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const renderCalendar = () => {
    // Get first day of month and calculate start date (first Sunday before or on the first day)
    const firstDayOfMonth = moment(currentDate).startOf('month');
    const lastDayOfMonth = moment(currentDate).endOf('month');
    
    // Start from the beginning of the week containing the first day of the month
    const startDate = moment(firstDayOfMonth).startOf('week');
    // End at the end of the week containing the last day of the month
    const endDate = moment(lastDayOfMonth).endOf('week');
    
    // Create an array for day headers (Sunday to Saturday)
    const dayHeaders = DAYS_OF_WEEK.map((day, index) => (
      <TableCell 
        key={`header-${index}`} 
        align="center"
        sx={{ 
          fontWeight: 'bold',
          color: index === 0 ? 'error.main' : (index === 6 ? 'primary.main' : 'text.primary'),
          backgroundColor: theme.palette.grey[100],
          width: '14.28%', // 100% / 7 days
          maxWidth: '14.28%', // Ensure cells don't grow beyond their allocated width
          minWidth: '100px' // Ensure minimum width for mobile devices
        }}
      >
        {day}
      </TableCell>
    ));
    
    // Create a map of all multi-day events and assign consistent positions
    const eventPositionMap = new Map();
    const eventRowAssignments = new Map();
    
    // First, identify all unique events that span multiple days
    processedEvents.forEach(event => {
      if (event.multiDay) {
        const eventKey = event.id || `${event.organization || event.title}-${event.start}`;
        if (!eventPositionMap.has(eventKey)) {
          const orgName = event.organization || event.title || event.group_name;
          eventPositionMap.set(eventKey, {
            id: eventKey,
            organization: orgName,
            startDate: moment(event.start),
            endDate: moment(event.end),
            color: event.color || getEventColor(event, 0),
            event: event
          });
        }
      }
    });
    
    // Pre-organize all organizations by consistent ordering
    const organizationOrder = new Map();
    let orderCounter = 0;
    
    processedEvents.forEach(event => {
      const orgName = event.organization || event.title || event.group_name;
      if (orgName && !organizationOrder.has(orgName)) {
        organizationOrder.set(orgName, orderCounter++);
      }
    });
    
    // Sort multi-day events by organization order for consistent assignment
    const sortedMultiDayEvents = Array.from(eventPositionMap.values())
      .sort((a, b) => {
        const orderA = organizationOrder.get(a.organization) || 0;
        const orderB = organizationOrder.get(b.organization) || 0;
        return orderA - orderB;
      });
    
    // First assign positions to multi-day events to ensure consistency
    sortedMultiDayEvents.forEach((eventInfo, index) => {
      // Assign each multi-day event a position
      eventRowAssignments.set(eventInfo.id, index % 3); // Limit to 3 rows
    });
    
    // Now process day by day to assign positions to single-day events
    let day = startDate.clone();
    while (day <= endDate) {
      const dateStr = day.format('YYYY-MM-DD');
      
      // Get events for this day but maintain consistent organization ordering
      const dayEvents = getCalendarDayEvents(day.clone());
      
      // Track which row positions are occupied for this day
      const occupiedPositions = new Set();
      
      // Check existing multi-day events first to mark their positions as occupied
      eventPositionMap.forEach(eventInfo => {
        if (day.isBetween(eventInfo.startDate, eventInfo.endDate, 'day', '[]')) {
          const rowPosition = eventRowAssignments.get(eventInfo.id);
          if (rowPosition !== undefined) {
            occupiedPositions.add(rowPosition);
          }
        }
      });
      
      // Now process this day's events
      dayEvents.forEach(event => {
        const eventKey = event.id || `${event.organization || event.title}-${event.start}`;
        const isMultiDay = event.multiDay;
        
        // If this is already assigned a position, skip
        if (eventRowAssignments.has(eventKey)) {
          return;
        }
        
        // Find the first available row position
        let rowPosition = 0;
        while (occupiedPositions.has(rowPosition)) {
          rowPosition++;
        }
        
        // Assign this position
        eventRowAssignments.set(eventKey, rowPosition);
        occupiedPositions.add(rowPosition);
        
        // If it's multi-day, add to the position map if not already there
        if (isMultiDay && !eventPositionMap.has(eventKey)) {
          const orgName = event.organization || event.title || event.group_name;
          eventPositionMap.set(eventKey, {
            id: eventKey,
            organization: orgName,
            startDate: moment(event.start),
            endDate: moment(event.end),
            color: event.color || getEventColor(event, 0),
            event: event
          });
        }
      });
      
      day.add(1, 'days');
    }
    
    // Now render the calendar with consistent event positions
    const calendarRows = [];
    let days = [];
    day = startDate.clone();
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const clonedDay = day.clone();
        const dateStr = day.format('YYYY-MM-DD');
        const isCurrentMonth = day.month() === currentDate.month();
        const isToday = day.isSame(moment(), 'day');
        
        // Get events for this day with consistent organization ordering
        const dayEvents = getCalendarDayEvents(day.clone());
        
        // Sort events by their assigned row positions
        const sortedEvents = dayEvents.map(event => {
          const eventKey = event.id || `${event.organization || event.title}-${event.start}`;
          return {
            ...event,
            rowPosition: eventRowAssignments.get(eventKey) || 0
          };
        }).sort((a, b) => a.rowPosition - b.rowPosition);
        
        // Determine which events need to be rendered for this cell
        // and in which positions
        const cellEvents = [];
        
        // Create empty slots for up to 3 event positions
        for (let pos = 0; pos < 3; pos++) {
          cellEvents.push(null);
        }
        
        // Fill the positions with actual events (최대 3개까지 표시)
        let displayedCount = 0;
        sortedEvents.forEach(event => {
          if (displayedCount < 3) {
            // 사용 가능한 첫 번째 빈 슬롯 찾기
            let slotIndex = -1;
            for (let i = 0; i < 3; i++) {
              if (cellEvents[i] === null) {
                slotIndex = i;
                break;
              }
            }
            // 빈 슬롯이 있으면 할당
            if (slotIndex !== -1) {
              cellEvents[slotIndex] = event;
              displayedCount++;
            }
          }
        });
        
        days.push(
          <TableCell 
            key={dateStr} 
            align="left"
            onClick={() => handleDayClick(clonedDay, dayEvents)}
            sx={{ 
              height: '100px',
              padding: '4px',
              position: 'relative',
              verticalAlign: 'top',
              backgroundColor: isToday ? '#f8f8ff' : (isCurrentMonth ? 'white' : '#f5f5f5'),
              opacity: isCurrentMonth ? 1 : 0.7,
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              width: '14.28%', // Fixed width percentage
              maxWidth: '14.28%', // Ensure cells don't grow beyond their allocated width
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <Typography 
              variant="body2"
              sx={{ 
                fontWeight: isToday ? 'bold' : 'normal',
                color: !isCurrentMonth 
                  ? theme.palette.text.disabled
                  : i === 0 
                    ? theme.palette.error.main
                    : i === 6 
                      ? theme.palette.primary.main
                      : theme.palette.text.primary
              }}
            >
              {day.date()} {/* Day number */}
              {day.date() === 1 && <span style={{ fontSize: '0.8em' }}>{day.format('M')}월</span>}
              {day.date() === 1 && day.month() === 0 && <span style={{ fontSize: '0.8em', color: 'red' }}> 신정</span>}
            </Typography>
            
            {/* Events for this day */}
            <Box sx={{ mt: 1 }}>
              {cellEvents.map((event, index) => {
                if (!event) return (
                  <Box 
                    key={`${dateStr}-empty-${index}`}
                    sx={{
                      height: '19px', // Match the height of event boxes
                      mb: '2px'
                    }}
                  />
                );
                
                const eventColor = event.color || getEventColor(event, index);
                const isFirstDay = moment(event.start).format('YYYY-MM-DD') === dateStr;
                const isLastDay = moment(event.end || event.start).format('YYYY-MM-DD') === dateStr;
                const isMultiDay = event.multiDay;
                
                // For direct navigation to reservation details when clicking an event
                const handleEventClick = (e, eventData) => {
                  e.stopPropagation(); // Prevent triggering the cell's click handler
                  
                  // Display event information in the sidebar instead of navigating
                  // This maintains all functionality but prevents page navigation
                  handleDayClick(moment(dateStr, 'YYYY-MM-DD'), [eventData]);
                };
                
                return (
                  <Box
                    key={`${dateStr}-event-${index}`}
                    onClick={(e) => handleEventClick(e, event)}
                    sx={{
                      backgroundColor: (() => {
                        // processEvents()에서 이미 설정된 색상이 있다면 우선 사용
                        if (event.color) {
                          const appliedColor = event.color;
                          console.log(`🎨 현재상태 확인 - 백그라운드 색상 적용 (기존 색상):`, {
                            date: dateStr,
                            organization: event.organization || event.title,
                            business_category: event.business_category || 'null',
                            status: event.status || 'null',
                            reservation_status: event.reservation_status || 'null',
                            eventColor: event.color,
                            eventColorReason: event.colorReason || 'processEvents에서 설정됨',
                            '🎨 최종적용색상': appliedColor,
                            '🎨 색상코드': appliedColor,
                            '🎨 적용위치': 'Box backgroundColor'
                          });
                          return appliedColor;
                        }
                        
                        // 기존 색상이 없는 경우에만 새로 계산
                        let finalColor;
                        let finalReason;
                        
                        if (event.business_category === 'social_contribution') {
                          finalColor = EVENT_COLORS.social_contribution;
                          finalReason = '사회공헌(초록색)';
                        } else if (event.business_category === 'profit_business') {
                          finalColor = EVENT_COLORS.profit_business;
                          finalReason = '수익사업(분홍색)';
                        } else if (!event.business_category || event.business_category === '' || event.business_category === null) {
                          // 2순위: 사업구분이 없을 때만 예약상태에 따른 색상
                          if (event.status === '가예약' || event.status === '대기중' || event.reservation_status === 'preparation') {
                            finalColor = EVENT_COLORS.preparation;
                            finalReason = '가예약/대기중(회색)';
                          } else if (event.status === '확정예약' || event.status === '예약확인' || event.reservation_status === 'confirmed') {
                            finalColor = EVENT_COLORS.social_contribution; // 확정예약일 때 초록색
                            finalReason = '확정예약(초록색)';
                          } else {
                            finalColor = EVENT_COLORS.default;
                            finalReason = '기본색상(초록색)';
                          }
                        } else {
                          finalColor = EVENT_COLORS.default;
                          finalReason = '기본색상(초록색)';
                        }
                        
                        console.log(`🎨 현재상태 확인 - 백그라운드 색상 적용 (새로 계산):`, {
                          date: dateStr,
                          organization: event.organization || event.title,
                          business_category: event.business_category || 'null',
                          status: event.status || 'null',
                          reservation_status: event.reservation_status || 'null',
                          finalColor: finalColor,
                          finalReason: finalReason,
                          '🎨 최종적용색상': finalColor,
                          '🎨 색상코드': finalColor,
                          '🎨 적용위치': 'Box backgroundColor',
                          '🎨 EVENT_COLORS': EVENT_COLORS
                        });
                        
                        return finalColor;
                      })(),
                      p: '2px 4px',
                      borderRadius: isFirstDay && isLastDay ? '4px' : 
                                  isFirstDay ? '4px 0 0 4px' : 
                                  isLastDay ? '0 4px 4px 0' : '0',
                      mb: '2px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      position: 'relative',
                      height: '19px',
                      maxWidth: '100%', // Ensure content doesn't overflow
                      border: event.room_name ? '1px solid rgba(0,0,0,0.12)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer', // Add cursor pointer for clickable events
                      '&:hover': {
                        filter: 'brightness(0.9)' // Add hover effect
                      },
                      '&::before': isFirstDay ? {} : {
                        content: '""',
                        position: 'absolute',
                        width: '4px',
                        height: '100%',
                        left: '-4px',
                        top: 0,
                        backgroundColor: (() => {
                          // Business category color has highest priority for pseudo-elements too
                          const pseudoColor = (event.business_category === 'social_contribution') 
                            ? EVENT_COLORS.social_contribution
                            : (event.business_category === 'profit_business')
                              ? EVENT_COLORS.profit_business
                              : event.color || eventColor;
                          
                          console.log(`🎨 현재상태 확인 - Pseudo Before 색상:`, {
                            organization: event.organization || event.title,
                            business_category: event.business_category || 'null',
                            pseudoColor: pseudoColor,
                            eventColor: event.color,
                            eventColorFallback: eventColor
                          });
                          
                          return pseudoColor;
                        })()
                      },
                      '&::after': isLastDay ? {} : {
                        content: '""',
                        position: 'absolute',
                        width: '4px',
                        height: '100%',
                        right: '-4px',
                        top: 0,
                        backgroundColor: (() => {
                          // Business category color has highest priority for pseudo-elements too
                          const pseudoColor = (event.business_category === 'social_contribution') 
                            ? EVENT_COLORS.social_contribution
                            : (event.business_category === 'profit_business')
                              ? EVENT_COLORS.profit_business
                              : event.color || eventColor;
                          
                          console.log(`🎨 현재상태 확인 - Pseudo After 색상:`, {
                            organization: event.organization || event.title,
                            business_category: event.business_category || 'null',
                            pseudoColor: pseudoColor,
                            eventColor: event.color,
                            eventColorFallback: eventColor
                          });
                          
                          return pseudoColor;
                        })()
                      }
                    }}
                    title={event.displayText || event.organization || event.title} // Add tooltip for long names
                  >
                    {event.organization || event.title}
                  </Box>
                );
              })}
              
              {(() => {
                // 실제로 표시된 이벤트 개수 계산 (null이 아닌 것만)
                const displayedEvents = cellEvents.filter(e => e !== null);
                const remainingCount = dayEvents.length - displayedEvents.length;
                
                if (remainingCount > 0) {
                  return (
                    <Box 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(clonedDay, dayEvents);
                      }}
                      sx={{ 
                        fontSize: '0.75rem', 
                        mt: 0.5, 
                        color: theme.palette.primary.main,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        '&:hover': {
                          color: theme.palette.primary.dark,
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      외 {remainingCount}건
                    </Box>
                  );
                }
                return null;
              })()}
            </Box>
          </TableCell>
        );
        
        day.add(1, 'days');
      }
      
      calendarRows.push(<TableRow key={day.format('YYYY-MM-W')}>{days}</TableRow>);
      days = [];
    }
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2, overflow: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {dayHeaders}
            </TableRow>
          </TableHead>
          <TableBody>
            {calendarRows}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Page5Layout title="하이힐링원 예약현황" icon={<DateRangeIcon />}>
      <Box sx={{ display: 'flex' }}>
        <Container maxWidth="xl" sx={{ 
          width: sidebarOpen ? `calc(100% - 320px)` : '100%',
          transition: 'width 0.3s ease'
        }}>
          <CalendarHeader 
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onPrint={handlePrint}
            onPdfDownload={handlePdfDownload}
            pdfLoading={pdfLoading}
          />
          
          <ColorLegend />
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderCalendar()
          )}
        </Container>
        
        <ReservationSidebar 
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          selectedDay={selectedDay}
          reservations={selectedReservations}
          listData={listData}
        />
      </Box>
    </Page5Layout>
  );
};

export default CalendarPage; 