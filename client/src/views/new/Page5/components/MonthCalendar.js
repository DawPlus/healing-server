import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_CALENDAR_DATA, GET_PAGE5_RESERVATION_LIST } from '../graphql';
import moment from 'moment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Calendar Day component
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

  // Event colors based on business category
  const EVENT_COLORS = {
    social_contribution: '#c8e6c9', // Light green for 사회공헌
    profit_business: '#f8bbd0',     // Light pink for 수익사업
    preparation: '#e0e0e0',         // Light gray for 가예약/대기중
    default: '#c8e6c9'              // 확정예약 하늘색 삭제 - 사회공헌과 동일한 초록색 사용
  };

  // Function to get color based on business category
  const getEventColor = (reservation) => {
    // 1순위: 사업구분에 따른 색상 (page1에서 선택한 사업구분 우선)
    if (reservation.business_category === 'social_contribution') {
      return EVENT_COLORS.social_contribution;
    } else if (reservation.business_category === 'profit_business') {
      return EVENT_COLORS.profit_business;
    }
    
    // 2순위: 사업구분이 선택되지 않았을 때만 예약상태에 따른 색상 적용
    if (!reservation.business_category || reservation.business_category === '' || reservation.business_category === null) {
      const status = reservation.status || reservation.reservation_status || '대기중';
      if (status === '가예약' || status === '대기중' || status === 'preparation') {
        return EVENT_COLORS.preparation; // 가예약일 때 회색
      } else if (status === '확정예약' || status === '예약확인' || status === 'confirmed') {
        return EVENT_COLORS.social_contribution; // 확정예약일 때 초록색 (성공 색상)
      }
    }
    
    // 기본 색상 (확정예약 하늘색 삭제로 초록색 사용)
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
            
            // Get the color based on business_category
            const eventColor = getEventColor(reservation);
            
            return (
              <Box
                key={index}
                sx={{
                  backgroundColor: eventColor,
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

// Format date for comparison
const formatDateForComparison = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // If already a unix timestamp (number)
    if (typeof dateValue === 'number') {
      return moment.unix(dateValue).format('YYYY-MM-DD');
    }
    
    // If server-converted date object
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
    
    // If string (ISO date etc)
    if (typeof dateValue === 'string') {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    // If moment object
    if (moment.isMoment(dateValue)) {
      return dateValue.format('YYYY-MM-DD');
    }
    
    // If regular Date object
    if (dateValue instanceof Date) {
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    return null;
  } catch (error) {
    console.error('날짜 변환 오류:', error, dateValue);
    return null;
  }
};

// Monthly Calendar component
const MonthCalendar = ({ onSelectDay }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayReservations, setDayReservations] = useState([]);
  
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
  
  // Debug - log calendar data changes
  useEffect(() => {
    console.log('달력 데이터 업데이트됨:', events);
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month'));
  };

  // Get events for a specific day
  const getCalendarDayEvents = (day) => {
    try {
      if (!events || events.length === 0) {
        console.log('캘린더: 달력 데이터 없음');
        return [];
      }
      
      // Convert day to a date string for comparison
      const dateStr = moment.isMoment(day) ? day.format('YYYY-MM-DD') : 
                     (day instanceof Date) ? moment(day).format('YYYY-MM-DD') : 
                     moment(currentDate).date(parseInt(day)).format('YYYY-MM-DD');
      
      // Filter events for this day
      const dayEvents = events.filter(event => {
        const eventStart = moment(event.start);
        const eventEnd = moment(event.end);
        const dayDate = moment(dateStr);
        
        return dayDate.isBetween(eventStart, eventEnd, 'day', '[]');
      });
      
      console.log('캘린더: 일자 데이터 조회', {
        day: dateStr,
        events: dayEvents
      });
      
      // Also check if there are any relevant Page1 entries in the main list
      // that should be displayed for this day
      const additionalEvents = list.filter(item => {
        const itemDate = item.start_date || item.reservation_date;
        if (!itemDate) return false;
        
        const formattedItemDate = formatDateForComparison(itemDate);
        return formattedItemDate === dateStr;
      }).map(item => ({
        // Map page1 fields to expected format for display
        id: item.id,
        organization_name: item.group_name || '단체명 없음',
        contact_name: item.customer_name || '',
        contact_phone: item.mobile_phone || item.landline_phone || '',
        contact_email: item.email || '',
        reservation_status: item.reservation_status || '대기중',
        details: item
      }));
      
      // Combine and deduplicate the events
      const combinedEvents = [...dayEvents, ...additionalEvents];
      const uniqueEvents = [...new Map(combinedEvents.map(event => [event.id, event])).values()];
      
      return uniqueEvents;
    } catch (error) {
      console.error('캘린더 데이터 조회 오류:', error);
      return [];
    }
  };

  const handleDayClick = (day) => {
    // Get events for this day
    const events = getCalendarDayEvents(day) || [];
    
    console.log(`[Calendar] Selected ${day.format('YYYY-MM-DD')}, found ${events.length} events:`, events);
    
    // Update the selected day
    setSelectedDay(day);
    setDayReservations(events);
    
    // Call the callback with both the day and events
    if (onSelectDay) {
      onSelectDay({ day, reservations: events });
    }
  };

  const renderCalendar = () => {
    const monthStart = moment(currentDate).startOf('month');
    const monthEnd = moment(currentDate).endOf('month');
    const startDate = moment(monthStart).startOf('week');
    const endDate = moment(monthEnd).endOf('week');

    const rows = [];
    let days = [];
    let day = startDate;

    // Render weekday headers
    const weekdayHeaders = moment.weekdaysShort().map((weekday) => (
      <Box key={weekday} width="14.28%" p={1} textAlign="center" fontWeight="bold">
        {weekday}
      </Box>
    ));

    // Keep rendering days until we reach the end date
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const clonedDay = moment(day);
        // Get the day number (1-31) to match calendarData keys
        const dayNumber = clonedDay.date(); 
        const isCurrentMonth = clonedDay.month() === currentDate.month();
        
        // Get reservations for this day using the day number
        const dayReservations = getCalendarDayEvents(clonedDay);
        
        days.push(
          <Box width="14.28%" key={day.format('YYYY-MM-DD')}>
            <CalendarDay
              day={clonedDay}
              reservations={dayReservations}
              onClick={() => handleDayClick(clonedDay)}
              selected={selectedDay}
              currentMonth={currentDate.month()}
              theme={theme}
            />
          </Box>
        );

        day = moment(day).add(1, 'day');
      }

      rows.push(
        <Box key={day.format('YYYY-MM-DD')} display="flex" width="100%">
          {days}
        </Box>
      );
      days = [];
    }

    return (
      <Box>
        <Box display="flex" width="100%">
          {weekdayHeaders}
        </Box>
        {rows}
      </Box>
    );
  };

  return (
    <Box p={2} border="1px solid #ddd" borderRadius={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {currentDate.format('YYYY년 MM월')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        renderCalendar()
      )}
    </Box>
  );
};

export default MonthCalendar; 