import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  ButtonGroup,
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
  Tab,
  Tabs,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  CircularProgress,
  Stack
} from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_SCHEDULE_DATA, GET_PAGE5_RESERVATION_DATA_FOR_SCHEDULE } from '../graphql';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { formatDate, showAlert } from '../services/dataService';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PrintIcon from '@mui/icons-material/Print';
import TableChartIcon from '@mui/icons-material/TableChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';

// SweetAlert
import Swal from 'sweetalert2';

// Page5Layout
import Page5Layout from './Page5Layout';

// Import Excel export utility
import exportMonthlySchedule from '../services/scheduleExcelExport';

// Helper function to safely handle IDs that may be strings or numbers
const safeHandleId = (id) => {
  // For display or comparison purposes, convert to string
  if (id === null || id === undefined) return '';
  return id.toString();
};

// Helper function to safely generate unique keys for React lists
const generateUniqueKey = (prefix, item, index) => {
  // If the item has a reliable ID, use it
  if (item && item.id) {
    return `${prefix}-${safeHandleId(item.id)}`;
  }
  // Otherwise use the index and some item property
  return `${prefix}-${index}-${item.organization || item.room_name || item.meal_type || item.place_name || 'item'}`;
};

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 더미 방 데이터
const dummyRooms = [
  { id: 1, name: '스탠다드 A', type: '숙박', capacity: 2, floor: 1 },
  { id: 2, name: '스탠다드 B', type: '숙박', capacity: 2, floor: 1 },
  { id: 3, name: '스탠다드 C', type: '숙박', capacity: 2, floor: 1 },
  { id: 4, name: '디럭스 A', type: '숙박', capacity: 4, floor: 2 },
  { id: 5, name: '디럭스 B', type: '숙박', capacity: 4, floor: 2 },
  { id: 6, name: '스위트 A', type: '숙박', capacity: 6, floor: 3 },
  { id: 7, name: '대강당', type: '대관', capacity: 100, floor: 1 },
  { id: 8, name: '세미나실 A', type: '대관', capacity: 30, floor: 1 },
  { id: 9, name: '세미나실 B', type: '대관', capacity: 20, floor: 1 },
  { id: 10, name: '다목적실', type: '대관', capacity: 50, floor: 2 },
];

// 더미 예약 데이터
const dummySchedules = [
  {
    id: 1,
    roomId: 1,
    organization: '하이힐링원',
    startDate: '2023-04-15',
    endDate: '2023-04-17',
    status: 'confirmed',
    numberOfPeople: 2,
    contactName: '김철수',
    contactPhone: '010-1234-5678'
  },
  {
    id: 2,
    roomId: 4,
    organization: '서울대학교',
    startDate: '2023-04-16',
    endDate: '2023-04-18',
    status: 'confirmed',
    numberOfPeople: 4,
    contactName: '이영희',
    contactPhone: '010-9876-5432'
  },
  {
    id: 3,
    roomId: 7,
    organization: '한림대학교',
    startDate: '2023-04-20',
    endDate: '2023-04-20',
    status: 'pending',
    numberOfPeople: 80,
    contactName: '박민수',
    contactPhone: '010-5555-1234'
  },
];

// 일정 계획 컴포넌트
const SchedulePlan = ({ scheduleData, date }) => {
  const theme = useTheme();
  
  if (!scheduleData || scheduleData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography variant="body1" color="textSecondary">
          선택한 기간에 일정 데이터가 없습니다.
        </Typography>
      </Box>
    );
  }
  
  // Find the schedule for the selected date
  const daySchedule = scheduleData.find(item => item.date === moment(date).format('YYYY-MM-DD')) || {
    date: moment(date).format('YYYY-MM-DD'),
    programs: [],
    rooms: [],
    meals: [],
    places: []
  };
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {moment(date).format('YYYY년 MM월 DD일')} 일정
      </Typography>
      
      <Grid container spacing={3}>
        {/* 프로그램 일정 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    프로그램 일정
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.primary.light }}
            />
            <Divider />
            <CardContent>
              {daySchedule.programs && daySchedule.programs.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>시간</TableCell>
                        <TableCell>프로그램명</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>장소</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {daySchedule.programs.map((program, index) => (
                        <TableRow key={generateUniqueKey('program', program, index)} hover>
                          <TableCell>{program.start_time}-{program.end_time}</TableCell>
                          <TableCell>{program.program_name}</TableCell>
                          <TableCell>{program.organization}</TableCell>
                          <TableCell>{program.location}</TableCell>
                          <TableCell align="right">{program.participants}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 프로그램이 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 객실 이용 현황 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    객실 이용 현황
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.secondary.light }}
            />
            <Divider />
            <CardContent>
              {daySchedule.rooms && daySchedule.rooms.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>객실명</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>체크인</TableCell>
                        <TableCell>체크아웃</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {daySchedule.rooms.map((room, index) => (
                        <TableRow key={generateUniqueKey('room', room, index)} hover>
                          <TableCell>{room.room_name}</TableCell>
                          <TableCell>{room.organization}</TableCell>
                          <TableCell>{formatDate(room.check_in)}</TableCell>
                          <TableCell>{formatDate(room.check_out)}</TableCell>
                          <TableCell align="right">{room.occupancy}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 객실 이용이 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 식사 일정 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    식사 일정
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.success.light }}
            />
            <Divider />
            <CardContent>
              {daySchedule.meals && daySchedule.meals.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>시간</TableCell>
                        <TableCell>식사 종류</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>장소</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {daySchedule.meals.map((meal, index) => (
                        <TableRow key={generateUniqueKey('meal', meal, index)} hover>
                          <TableCell>{meal.time}</TableCell>
                          <TableCell>
                            {meal.meal_type === 'breakfast' ? '아침' : 
                             meal.meal_type === 'lunch' ? '점심' : 
                             meal.meal_type === 'dinner' ? '저녁' : meal.meal_type}
                          </TableCell>
                          <TableCell>{meal.organization}</TableCell>
                          <TableCell>{meal.location}</TableCell>
                          <TableCell align="right">{meal.participants}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 식사가 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 장소 이용 현황 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    장소 이용 현황
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.warning.light }}
            />
            <Divider />
            <CardContent>
              {daySchedule.places && daySchedule.places.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>시간</TableCell>
                        <TableCell>장소명</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>용도</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {daySchedule.places.map((place, index) => (
                        <TableRow key={generateUniqueKey('place', place, index)} hover>
                          <TableCell>{place.start_time}-{place.end_time}</TableCell>
                          <TableCell>{place.place_name}</TableCell>
                          <TableCell>{place.organization}</TableCell>
                          <TableCell>{place.purpose}</TableCell>
                          <TableCell align="right">{place.participants}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 장소 이용이 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// 일정표 테이블 컴포넌트
const ScheduleTable = ({ scheduleData, startDate, endDate }) => {
  const theme = useTheme();
  
  if (!scheduleData || scheduleData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography variant="body1" color="textSecondary">
          선택한 기간에 일정 데이터가 없습니다.
        </Typography>
      </Box>
    );
  }
  
  // 날짜 범위에 있는 모든 일정 집계
  const allPrograms = scheduleData.flatMap(day => 
    day.programs.map(program => ({ ...program, date: day.date }))
  );
  
  const allRooms = scheduleData.flatMap(day => 
    day.rooms.map(room => ({ ...room, date: day.date }))
  );
  
  const allMeals = scheduleData.flatMap(day => 
    day.meals.map(meal => ({ ...meal, date: day.date }))
  );
  
  const allPlaces = scheduleData.flatMap(day => 
    day.places.map(place => ({ ...place, date: day.date }))
  );
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    프로그램 일정표
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.primary.light }}
            />
            <Divider />
            <CardContent>
              {allPrograms.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>날짜</TableCell>
                        <TableCell>시간</TableCell>
                        <TableCell>프로그램명</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>장소</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPrograms.map((program, index) => (
                        <TableRow key={generateUniqueKey('program', program, index)} hover>
                          <TableCell>{formatDate(program.date)}</TableCell>
                          <TableCell>{program.start_time}-{program.end_time}</TableCell>
                          <TableCell>{program.program_name}</TableCell>
                          <TableCell>{program.organization}</TableCell>
                          <TableCell>{program.location}</TableCell>
                          <TableCell align="right">{program.participants}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 프로그램이 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    객실 이용 현황
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.secondary.light }}
            />
            <Divider />
            <CardContent>
              {allRooms.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>날짜</TableCell>
                        <TableCell>객실명</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>체크인</TableCell>
                        <TableCell>체크아웃</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allRooms.map((room, index) => (
                        <TableRow key={generateUniqueKey('room', room, index)} hover>
                          <TableCell>{formatDate(room.date)}</TableCell>
                          <TableCell>{room.room_name}</TableCell>
                          <TableCell>{room.organization}</TableCell>
                          <TableCell>{formatDate(room.check_in)}</TableCell>
                          <TableCell>{formatDate(room.check_out)}</TableCell>
                          <TableCell align="right">{room.occupancy}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 객실 이용이 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    식사 일정
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.success.light }}
            />
            <Divider />
            <CardContent>
              {allMeals.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>날짜</TableCell>
                        <TableCell>시간</TableCell>
                        <TableCell>식사 종류</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>장소</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allMeals.map((meal, index) => (
                        <TableRow key={generateUniqueKey('meal', meal, index)} hover>
                          <TableCell>{formatDate(meal.date)}</TableCell>
                          <TableCell>{meal.time}</TableCell>
                          <TableCell>
                            {meal.meal_type === 'breakfast' ? '아침' : 
                             meal.meal_type === 'lunch' ? '점심' : 
                             meal.meal_type === 'dinner' ? '저녁' : meal.meal_type}
                          </TableCell>
                          <TableCell>{meal.organization}</TableCell>
                          <TableCell>{meal.location}</TableCell>
                          <TableCell align="right">{meal.participants}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 식사가 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    장소 이용 현황
                  </Typography>
                </Box>
              }
              sx={{ backgroundColor: theme.palette.warning.light }}
            />
            <Divider />
            <CardContent>
              {allPlaces.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>날짜</TableCell>
                        <TableCell>시간</TableCell>
                        <TableCell>장소명</TableCell>
                        <TableCell>단체명</TableCell>
                        <TableCell>용도</TableCell>
                        <TableCell align="right">인원</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPlaces.map((place, index) => (
                        <TableRow key={generateUniqueKey('place', place, index)} hover>
                          <TableCell>{formatDate(place.date)}</TableCell>
                          <TableCell>{place.start_time}-{place.end_time}</TableCell>
                          <TableCell>{place.place_name}</TableCell>
                          <TableCell>{place.organization}</TableCell>
                          <TableCell>{place.purpose}</TableCell>
                          <TableCell align="right">{place.participants}명</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  예정된 장소 이용이 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// 수주보고 메인 컴포넌트
const ScheduleView = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(moment().startOf('month'));
  const [endDate, setEndDate] = useState(moment().endOf('month'));
  const [date, setDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('daily'); // 'daily' or 'overall' view mode
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [exportLoading, setExportLoading] = useState(false);
  
  // Fetch data using the original schedule query (fallback)
  const { loading: dataLoading, error, data, refetch } = useQuery(GET_PAGE5_SCHEDULE_DATA, {
    variables: { startDate: startDate.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD') },
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching schedule data:', error);
      
      // Check if the error is related to ID type conversion
      if (error.message && error.message.includes('Int cannot represent non-integer value')) {
        console.warn('ID type conversion error detected. This is expected with temporary IDs. Proceeding with available data.');
        // We don't show an alert here as this is an expected error with temporary IDs
        // The processScheduleData function will handle it gracefully
      } else {
        showAlert('일정 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
      }
    }
  });
  
  // Fetch reservation data directly from Page1, Page2, and Page3
  const { 
    loading: reservationsLoading, 
    error: reservationsError, 
    data: reservationsData, 
    refetch: refetchReservations 
  } = useQuery(GET_PAGE5_RESERVATION_DATA_FOR_SCHEDULE, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching reservation data for schedule:', error);
      showAlert('예약 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  });
  
  // Process the reservation data into a format compatible with the schedule components
  const processReservationDataForSchedule = () => {
    if (!reservationsData || !reservationsData.getPage1List) {
      console.log("No reservation data available for schedule");
      return [];
    }
    
    try {
      // Create a map of dates within the selected range
      const dateMap = new Map();
      const currentDate = moment(startDate);
      const lastDate = moment(endDate);
      
      while (currentDate.isSameOrBefore(lastDate)) {
        const dateString = currentDate.format('YYYY-MM-DD');
        dateMap.set(dateString, {
          date: dateString,
          programs: [],
          rooms: [],
          meals: [],
          places: []
        });
        currentDate.add(1, 'days');
      }
      
      // Process each reservation - filter for those within the selected date range
      reservationsData.getPage1List
        .filter(reservation => {
          // Check if reservation falls within our date range
          const resStart = moment(reservation.start_date);
          const resEnd = moment(reservation.end_date);
          return (
            (resStart.isSameOrAfter(startDate) && resStart.isSameOrBefore(endDate)) || 
            (resEnd.isSameOrAfter(startDate) && resEnd.isSameOrBefore(endDate)) ||
            (resStart.isBefore(startDate) && resEnd.isAfter(endDate))
          );
        })
        .forEach(reservation => {
          const groupName = reservation.group_name || '미지정';
          
          // Process programs from Page2
          if (reservation.page2_reservations) {
            reservation.page2_reservations.forEach(page2 => {
              if (page2.programs) {
                page2.programs.forEach(program => {
                  if (!program || !program.date) return;
                  
                  const programDate = moment(program.date).format('YYYY-MM-DD');
                  if (!dateMap.has(programDate)) return;
                  
                  const dayData = dateMap.get(programDate);
                  dayData.programs.push({
                    id: safeHandleId(program.id),
                    program_name: program.program_name || program.category_name || '프로그램',
                    organization: groupName,
                    start_time: program.start_time || '00:00',
                    end_time: program.end_time || '00:00',
                    location: program.place_name || '미정',
                    participants: page2.total_count || 0
                  });
                });
              }
            });
          }
          
          // Process page3 data (rooms, meals, places)
          if (reservation.page3) {
            // Process room selections
            if (reservation.page3.room_selections) {
              reservation.page3.room_selections.forEach(room => {
                if (!room || !room.check_in_date) return;
                
                const checkInDate = moment(room.check_in_date);
                const nights = room.nights || 1;
                
                // Add room for each night of the stay
                for (let i = 0; i < nights; i++) {
                  const roomDate = checkInDate.clone().add(i, 'days').format('YYYY-MM-DD');
                  if (!dateMap.has(roomDate)) continue;
                  
                  const dayData = dateMap.get(roomDate);
                  dayData.rooms.push({
                    id: safeHandleId(room.id),
                    room_name: room.room_name || '객실',
                    organization: groupName,
                    check_in: roomDate === checkInDate.format('YYYY-MM-DD') ? '14:00' : '',
                    check_out: roomDate === checkInDate.clone().add(nights - 1, 'days').format('YYYY-MM-DD') ? '11:00' : '',
                    occupancy: room.occupancy || reservation.total_count || 0
                  });
                }
              });
            }
            
            // Process meal plans
            if (reservation.page3.meal_plans) {
              reservation.page3.meal_plans.forEach(meal => {
                if (!meal || !meal.date) return;
                
                const mealDate = moment(meal.date).format('YYYY-MM-DD');
                if (!dateMap.has(mealDate)) return;
                
                const dayData = dateMap.get(mealDate);
                const mealTime = meal.meal_type === '조식' ? '08:00' : 
                                meal.meal_type === '중식' ? '12:00' : 
                                meal.meal_type === '석식' ? '18:00' : '00:00';
                
                dayData.meals.push({
                  id: safeHandleId(meal.id),
                  meal_type: meal.meal_type || '식사',
                  organization: groupName,
                  time: mealTime,
                  participants: meal.participants || 0,
                  location: '식당'
                });
              });
            }
            
            // Process place reservations
            if (reservation.page3.place_reservations) {
              reservation.page3.place_reservations.forEach(place => {
                if (!place || !place.reservation_date) return;
                
                const placeDate = moment(place.reservation_date).format('YYYY-MM-DD');
                if (!dateMap.has(placeDate)) return;
                
                const dayData = dateMap.get(placeDate);
                dayData.places.push({
                  id: safeHandleId(place.id),
                  place_name: place.place_name || '장소',
                  organization: groupName,
                  start_time: place.start_time || '00:00',
                  end_time: place.end_time || '00:00',
                  purpose: place.purpose || '대관',
                  participants: place.participants || 0
                });
              });
            }
          }
        });
      
      // Convert the map to an array
      return Array.from(dateMap.values());
    } catch (error) {
      console.error('Error processing reservation data for schedule:', error);
      return [];
    }
  };
  
  // Process schedule data from the original query with error handling
  const processScheduleData = () => {
    // Check if we have partial data despite GraphQL errors
    if (!data) {
      console.log("No schedule data available");
      return [];
    }
    
    try {
      // Even if there were errors, we might have partial data we can use
      const scheduleData = data.getScheduleData || [];
      
      // Add error handling for ID type mismatches
      return scheduleData.map(day => {
        if (!day) return null;
        
        // Create a new day object with cleaned data
        return {
          date: day.date,
          
          // Clean program data
          programs: Array.isArray(day.programs) ? day.programs.map(program => {
            if (!program) return null;
            return {
              ...program,
              id: safeHandleId(program.id)
            };
          }).filter(Boolean) : [],
          
          // Clean room data
          rooms: Array.isArray(day.rooms) ? day.rooms.map(room => {
            if (!room) return null;
            return {
              ...room,
              id: safeHandleId(room.id)
            };
          }).filter(Boolean) : [],
          
          // Clean meal data
          meals: Array.isArray(day.meals) ? day.meals.map(meal => {
            if (!meal) return null;
            return {
              ...meal,
              id: safeHandleId(meal.id)
            };
          }).filter(Boolean) : [],
          
          // Clean place data
          places: Array.isArray(day.places) ? day.places.map(place => {
            if (!place) return null;
            return {
              ...place,
              id: safeHandleId(place.id)
            };
          }).filter(Boolean) : []
        };
      }).filter(Boolean); // Remove any null days
    } catch (error) {
      console.error('Error processing schedule data:', error);
      return [];
    }
  };
  
  // Get schedule data from both sources, preferring the direct reservation data
  const reservationScheduleData = processReservationDataForSchedule();
  const fallbackScheduleData = processScheduleData();
  
  // Use reservation data if available, otherwise fall back to the original data
  const scheduleData = reservationScheduleData.length > 0 ? reservationScheduleData : fallbackScheduleData;
  
  console.log("Final schedule data:", scheduleData);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Update dates based on selected year and month
  const updateDatesFromYearMonth = (year, month) => {
    const newStartDate = moment().year(year).month(month - 1).startOf('month');
    const newEndDate = moment().year(year).month(month - 1).endOf('month');
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setDate(newStartDate);
    
    // Refetch data with new date range
    refetch({
      startDate: newStartDate.format('YYYY-MM-DD'),
      endDate: newEndDate.format('YYYY-MM-DD')
    });
    
    refetchReservations();
  };
  
  // Year selection handler
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateDatesFromYearMonth(year, selectedMonth);
  };
  
  // Month selection handler
  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    updateDatesFromYearMonth(selectedYear, month);
  };
  
  // Handle date change (for daily view)
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };
  
  // Refresh data
  const handleRefresh = () => {
    refetch({
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    });
    refetchReservations();
  };
  
  // Handle Excel Export
  const handleExcelExport = async () => {
    try {
      setExportLoading(true);
      
      // Get schedule data from the processed data
      const scheduleData = processReservationDataForSchedule();
      
      // Call the export function
      exportMonthlySchedule(selectedYear, selectedMonth, scheduleData);
      
      showAlert('엑셀 파일이 다운로드되었습니다.', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showAlert('엑셀 내보내기 중 오류가 발생했습니다.', 'error');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Handle print button click
  const handlePrint = async () => {
    try {
      setLoading(true);
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('landscape');
      
      // Set font to handle Korean characters
      doc.setFont('helvetica', 'normal');
      
      // Add title to the first page
      doc.setFontSize(18);
      doc.text(`일정표 ${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')}`, 10, 15);
      
      // Add date range info
      doc.setFontSize(12);
      doc.text(`출력일: ${formatDate(new Date())}`, 10, 25);
      
      // Page number styling
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      // Footer with page number
      const addFooter = (doc) => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
      };
      
      // Default styling for tables
      const tableOptions = {
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: 0
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 35 }
      };
      
      // Extract data from scheduleData for printing
      const allPrograms = [];
      const allRooms = [];
      const allMeals = [];
      const allPlaces = [];
      
      // Collect all items from the schedule data
      if (scheduleData && scheduleData.length > 0) {
        scheduleData.forEach(day => {
          // Collect programs
          if (day.programs && day.programs.length > 0) {
            day.programs.forEach(program => {
              allPrograms.push({
                ...program,
                date: day.date,
                time: `${program.start_time || '00:00'}-${program.end_time || '00:00'}`,
                name: program.program_name,
                instructor: program.organization,
                location: program.location,
                notes: ''
              });
            });
          }
          
          // Collect rooms
          if (day.rooms && day.rooms.length > 0) {
            day.rooms.forEach(room => {
              allRooms.push({
                ...room,
                date: day.date,
                name: room.room_name,
                people: room.occupancy,
                check_in: room.check_in,
                check_out: room.check_out,
                notes: ''
              });
            });
          }
          
          // Collect meals
          if (day.meals && day.meals.length > 0) {
            day.meals.forEach(meal => {
              allMeals.push({
                ...meal,
                date: day.date,
                time: meal.time,
                type: meal.meal_type,
                menu: '',
                people: meal.participants,
                location: meal.location,
                notes: ''
              });
            });
          }
          
          // Collect places
          if (day.places && day.places.length > 0) {
            day.places.forEach(place => {
              allPlaces.push({
                ...place,
                date: day.date,
                time: `${place.start_time || '00:00'}-${place.end_time || '00:00'}`,
                name: place.place_name,
                purpose: place.purpose || '',
                notes: ''
              });
            });
          }
        });
      }
      
      if (tabValue === 0) { // Daily view
        // Daily schedule view - table for each date
        let firstPage = true;
        const dateSchedules = {};
        
        // Group programs by date
        allPrograms.forEach(program => {
          const date = formatDate(program.date);
          if (!dateSchedules[date]) {
            dateSchedules[date] = { programs: [], rooms: [], meals: [], places: [] };
          }
          dateSchedules[date].programs.push(program);
        });
        
        // Group rooms by date
        allRooms.forEach(room => {
          const date = formatDate(room.date);
          if (!dateSchedules[date]) {
            dateSchedules[date] = { programs: [], rooms: [], meals: [], places: [] };
          }
          dateSchedules[date].rooms.push(room);
        });
        
        // Group meals by date
        allMeals.forEach(meal => {
          const date = formatDate(meal.date);
          if (!dateSchedules[date]) {
            dateSchedules[date] = { programs: [], rooms: [], meals: [], places: [] };
          }
          dateSchedules[date].meals.push(meal);
        });
        
        // Group places by date
        allPlaces.forEach(place => {
          const date = formatDate(place.date);
          if (!dateSchedules[date]) {
            dateSchedules[date] = { programs: [], rooms: [], meals: [], places: [] };
          }
          dateSchedules[date].places.push(place);
        });
        
        // Sort dates
        const sortedDates = Object.keys(dateSchedules).sort();
        
        // Create a table for each date
        for (const date of sortedDates) {
          if (!firstPage) {
            doc.addPage();
          } else {
            firstPage = false;
          }
          
          let yPosition = 35;
          
          // Add date header
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(`${date} 일정`, 10, yPosition);
          yPosition += 10;
          
          // Programs table for this date
          if (dateSchedules[date].programs.length > 0) {
            doc.setFontSize(10);
            doc.text('프로그램 일정', 10, yPosition);
            yPosition += 5;
            
            // Define programs table
            await doc.autoTable({
              startY: yPosition,
              head: [['시간', '프로그램명', '담당자', '장소', '비고']],
              body: dateSchedules[date].programs.map(program => [
                program.time,
                program.name,
                program.instructor,
                program.location,
                program.notes || ''
              ]),
              ...tableOptions
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
          }
          
          // Rooms table for this date
          if (dateSchedules[date].rooms.length > 0) {
            doc.setFontSize(10);
            doc.text('객실 일정', 10, yPosition);
            yPosition += 5;
            
            // Define rooms table
            await doc.autoTable({
              startY: yPosition,
              head: [['객실명', '인원수', '체크인', '체크아웃', '비고']],
              body: dateSchedules[date].rooms.map(room => [
                room.name,
                room.people,
                formatDate(room.check_in),
                formatDate(room.check_out),
                room.notes || ''
              ]),
              ...tableOptions
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
          }
          
          // Meals table for this date
          if (dateSchedules[date].meals.length > 0) {
            doc.setFontSize(10);
            doc.text('식사 일정', 10, yPosition);
            yPosition += 5;
            
            // Define meals table
            await doc.autoTable({
              startY: yPosition,
              head: [['시간', '식사유형', '메뉴', '인원수', '장소', '비고']],
              body: dateSchedules[date].meals.map(meal => [
                meal.time,
                meal.type,
                meal.menu,
                meal.people,
                meal.location,
                meal.notes || ''
              ]),
              ...tableOptions
            });
            
            yPosition = doc.lastAutoTable.finalY + 10;
          }
          
          // Places table for this date
          if (dateSchedules[date].places.length > 0) {
            doc.setFontSize(10);
            doc.text('장소 일정', 10, yPosition);
            yPosition += 5;
            
            // Define places table
            await doc.autoTable({
              startY: yPosition,
              head: [['시간', '장소', '용도', '비고']],
              body: dateSchedules[date].places.map(place => [
                place.time,
                place.name,
                place.purpose,
                place.notes || ''
              ]),
              ...tableOptions
            });
          }
        }
        
      } else { // Overall view
        // Overall program schedule view - single table for each category
        
        // Programs table
        if (allPrograms.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text('프로그램 일정', 10, 35);
          
          await doc.autoTable({
            startY: 40,
            head: [['날짜', '시간', '프로그램명', '담당자', '장소', '비고']],
            body: allPrograms.map(program => [
              formatDate(program.date),
              program.time,
              program.name,
              program.instructor,
              program.location,
              program.notes || ''
            ]),
            ...tableOptions
          });
          
          // If there are more tables to come, add a page
          if (allRooms.length > 0 || allMeals.length > 0 || allPlaces.length > 0) {
            doc.addPage();
          }
        }
        
        // Rooms table
        if (allRooms.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text('객실 일정', 10, 35);
          
          await doc.autoTable({
            startY: 40,
            head: [['날짜', '객실명', '인원수', '체크인', '체크아웃', '비고']],
            body: allRooms.map(room => [
              formatDate(room.date),
              room.name,
              room.people,
              formatDate(room.check_in),
              formatDate(room.check_out),
              room.notes || ''
            ]),
            ...tableOptions
          });
          
          // If there are more tables to come, add a page
          if (allMeals.length > 0 || allPlaces.length > 0) {
            doc.addPage();
          }
        }
        
        // Meals table
        if (allMeals.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text('식사 일정', 10, 35);
          
          await doc.autoTable({
            startY: 40,
            head: [['날짜', '시간', '식사유형', '메뉴', '인원수', '장소', '비고']],
            body: allMeals.map(meal => [
              formatDate(meal.date),
              meal.time,
              meal.type,
              meal.menu,
              meal.people,
              meal.location,
              meal.notes || ''
            ]),
            ...tableOptions
          });
          
          // If there are more tables to come, add a page
          if (allPlaces.length > 0) {
            doc.addPage();
          }
        }
        
        // Places table
        if (allPlaces.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text('장소 일정', 10, 35);
          
          await doc.autoTable({
            startY: 40,
            head: [['날짜', '시간', '장소', '용도', '비고']],
            body: allPlaces.map(place => [
              formatDate(place.date),
              place.time,
              place.name,
              place.purpose,
              place.notes || ''
            ]),
            ...tableOptions
          });
        }
      }
      
      // Add page numbers
      addFooter(doc);
      
      // Save the PDF
      doc.save(`일정표_${startDate.format('YYYYMMDD')}-${endDate.format('YYYYMMDD')}.pdf`);
      showAlert('일정표가 PDF로 저장되었습니다.', 'success');
      setLoading(false);
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };
  
  return (
    <Page5Layout 
      title="일정표" 
      icon={<EventNoteIcon sx={{ fontSize: 28 }} />}
      activeTab="schedule"
    >
      <Box sx={{ width: '100%' }}>
        <Card>
          <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    월별 일정 조회
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>연도</InputLabel>
                        <Select
                          value={selectedYear}
                          onChange={handleYearChange}
                          label="연도"
                        >
                          {[...Array(10)].map((_, idx) => (
                            <MenuItem key={idx} value={moment().year() - 5 + idx}>
                              {moment().year() - 5 + idx}년
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>월</InputLabel>
                        <Select
                          value={selectedMonth}
                          onChange={handleMonthChange}
                          label="월"
                        >
                          {[...Array(12)].map((_, idx) => (
                            <MenuItem key={idx} value={idx + 1}>
                              {idx + 1}월
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRefresh}
                        fullWidth
                      >
                        조회
                      </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleExcelExport}
                        startIcon={<GetAppIcon />}
                        disabled={exportLoading}
                        fullWidth
                      >
                        {exportLoading ? '처리 중...' : '예약종합 현황표 엑셀 다운로드(6번 항목)'}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    {startDate.format('YYYY년 MM월')} 일정표
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {loading || dataLoading || reservationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">
                  일정 데이터를 불러오는 중 오류가 발생했습니다.
                </Typography>
              </Box>
            ) : (
              <>
                <ScheduleTable 
                  scheduleData={scheduleData}
                  startDate={startDate}
                  endDate={endDate}
                />
              </>
            )}
          </Box>
        </Card>
      </Box>
    </Page5Layout>
  );
};

export default ScheduleView; 