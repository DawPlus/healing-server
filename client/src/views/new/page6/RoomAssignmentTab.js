import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip,
  useTheme,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TableFooter,
  Modal,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PictureAsPdfIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/ko';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import GetAppIcon from '@mui/icons-material/GetApp';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';
import { formatNumber } from './services/dataService';
import dayjs from 'dayjs';
import { gql } from '@apollo/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

import Page6Layout from './components/Page6Layout';
import { 
  GET_PAGE6_RESERVATION_LIST, 
  GET_PAGE6_ROOM_ASSIGNMENTS, 
  GET_PAGE6_RESERVATION_DETAIL, 
  GET_PAGE6_MEAL_STAFF, 
  GET_PAGE6_ROOMS,
  GET_PAGE6_MENU_ROOMS 
} from './graphql/queries';
import { SAVE_ROOM_ASSIGNMENT, DELETE_ROOM_ASSIGNMENT } from './graphql/mutations';
import { formatDate, generateDateRange, showAlert } from './services/dataService';
import { exportRoomMealPdf } from '../Page5/inspection/roomMealPdf';
import { generateAccommodationMealPDF, generateInspectionPdf, generateRoomAssignmentAndMealPDF, generateRoomAssignmentTable, generateMealScheduleTable } from '../../../utils/pdfGenerator';

// Add Page3 GraphQL query
const GET_PAGE3_BY_PAGE1_ID_QUERY = gql`
  query GetPage3ByPage1Id($page1Id: Int!) {
    getPage3ByPage1Id(page1Id: $page1Id) {
      id
      page1_id
      room_selections {
        id
        room_id
        room_name
        room_type
        check_in_date
        check_out_date
        occupancy
        price
        total_price
        capacity
        nights
        notes
      }
      meal_plans {
        id
        date
        meal_type
        meal_option
        participants
        dinner_option
        price
        notes
      }
    }
  }
`;

// Korean day of week labels
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// TabPanel component for handling tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Add these functions to parse JSON data and create accommodation and meal sections
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

// Create accommodation section data for display
const createAccommodationSection = (roomSelections) => {
  const rows = [];
  let totalRoomPrice = 0;
  
  if (roomSelections && roomSelections.length > 0) {
    const groupedByDate = {};
    
    // Group by date
    roomSelections.forEach(room => {
      const date = moment(room.check_in_date).format('MM월 DD일');
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(room);
    });
    
    // Create rows from grouped data
    Object.entries(groupedByDate).forEach(([date, rooms]) => {
      rooms.forEach((room, idx) => {
        const baseRoomPrice = room.price || 0;
        const nights = room.nights || 1;
        const occupancy = room.occupancy || 1;
        const capacity = room.capacity || 1;
        
        let roomTotalPrice = 0;
        
        // total_price가 수동으로 입력된 값이 있으면 우선 사용 (page3와 동일한 로직)
        if (room.total_price && parseInt(room.total_price) > 0) {
          roomTotalPrice = parseInt(room.total_price);
        } else {
          // page3와 동일한 계산 공식 적용:
          // 1. Base price for the room multiplied by nights
          // 2. Additional charge of 10,000 won per person when exceeding room capacity
          roomTotalPrice = baseRoomPrice * nights;
          
          // Add extra charge for people exceeding room capacity (10,000 won per extra person per night)
          if (occupancy > capacity) {
            const extraPeople = occupancy - capacity;
            const extraCharge = extraPeople * 10000 * nights; // 10,000 won per extra person per night
            roomTotalPrice += extraCharge;
          }
        }
        
        const discount = 0;
        const total = roomTotalPrice - discount;
        
        totalRoomPrice += total;
        
        rows.push({
          date: idx === 0 ? date : '',
          roomType: room.room_type || room.room_name,
          people: '',
          roomCount: occupancy,
          nights: nights,
          unitPrice: baseRoomPrice,
          subtotal: roomTotalPrice,
          discount: discount,
          total: total,
          notes: ''
        });
      });
    });
  }
  
  return {
    rows,
    totalRoomPrice
  };
};

// Create meal section data for display
const createMealSection = (mealPlans) => {
  console.log('===== createMealSection 함수 호출 =====');
  console.log('입력된 mealPlans:', mealPlans);
  console.log('mealPlans 타입:', typeof mealPlans);
  console.log('mealPlans 길이:', mealPlans?.length);
  
  const rows = [];
  let totalMealPrice = 0;
  
  // Define meal type translations (fallback only)
  const translations = {
    'breakfast': '조식',
    'breakfast_regular': '조식',
    'lunch': '중식',
    'lunch_regular': '중식',
    'lunch_box': '중식(도시락)',
    'dinner': '석식',
    'dinner_regular': '석식',
    'dinner_special_a': '석식(특식A)',
    'dinner_special_b': '석식(특식B)'
  };
  
  // Helper function to translate meal type to Korean
  const translateMealType = (mealType) => {
    if (!mealType) return '기타';
    
    // Check if it's already in Korean
    if (mealType === '조식' || mealType === '중식' || mealType === '석식') {
      return mealType;
    }
    
    // Check translations
    if (translations[mealType]) {
      return translations[mealType];
    }
    
    // Check if it contains keywords
    if (mealType.includes('breakfast') || mealType.includes('조식')) {
      return '조식';
    } else if (mealType.includes('lunch') || mealType.includes('중식')) {
      return '중식';
    } else if (mealType.includes('dinner') || mealType.includes('석식')) {
      return '석식';
    }
    
    return mealType; // Return as-is if no match
  };
  
  if (mealPlans && mealPlans.length > 0) {
    console.log('===== 식사 계획 데이터 처리 시작 =====');
    
    // 각 식사 계획의 상세 정보 로그
    mealPlans.forEach((meal, index) => {
      console.log(`식사 계획 ${index + 1}:`, {
        meal_type: meal.meal_type,
        meal_option: meal.meal_option,
        price: meal.price,
        participants: meal.participants,
        date: meal.date,
        전체_데이터: meal
      });
    });
    
    // Group by meal type
    const groupedByType = {};
    
    mealPlans.forEach(meal => {
      const type = meal.meal_type || '기타';
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(meal);
    });
    
    console.log('===== 타입별 그룹화 결과 =====');
    console.log('groupedByType:', groupedByType);
    Object.entries(groupedByType).forEach(([type, meals]) => {
      console.log(`타입 '${type}': ${meals.length}개 식사`);
      meals.forEach((meal, idx) => {
        console.log(`  - 식사 ${idx + 1}: meal_option='${meal.meal_option}', price=${meal.price}, participants=${meal.participants}`);
      });
    });
    
    // Create rows from grouped data
    Object.entries(groupedByType).forEach(([type, meals]) => {
      console.log(`===== 타입 '${type}' 처리 중 =====`);
      
      meals.forEach((meal, idx) => {
        const price = meal.price || 0; // 총액으로 간주
        const participants = meal.participants || 0;
        let calculatedUnitPrice = 0;
        let calculatedTotal = 0;

        // 단가 계산: 총액 / 인원수. 인원수가 0이면 단가는 총액으로 처리 (오류 방지)
        calculatedUnitPrice = participants > 0 ? Math.round(price / participants) : price;
        calculatedTotal = price; // 총액은 그대로 사용
        
        totalMealPrice += calculatedTotal;
        
        // Use meal_option first, then fall back to translations
        let displayType;
        if (meal.meal_option) {
          // meal_option도 한국어로 변환
          displayType = translateMealType(meal.meal_option);
          console.log(`meal_option 사용: '${meal.meal_option}' -> '${displayType}'`);
        } else {
          displayType = translateMealType(type);
          console.log(`번역 사용: '${type}' -> '${displayType}'`);
        }
        
        const rowData = {
          type: displayType, // 모든 행에 타입 표시
          people: participants,
          unitPrice: calculatedUnitPrice, // 제공단가 = 총액 / 인원
          total: calculatedTotal, // 총액
          notes: '',
          date: meal.date
        };
        
        console.log(`생성된 행 데이터:`, rowData);
        rows.push(rowData);
      });
    });
  } else {
    console.log('식사 계획 데이터가 없거나 비어있음');
  }
  
  const result = {
    rows,
    totalMealPrice
  };
  
  console.log('===== createMealSection 최종 결과 =====');
  console.log('총 행 수:', rows.length);
  console.log('총 식사비:', totalMealPrice);
  console.log('전체 결과:', result);
  console.log('=====================================');
  
  return result;
};

const RoomAssignmentTab = () => {
  // 한국어 로케일 설정
  moment.locale('ko');
  
  console.log('객실 배정 탭: 컴포넌트 초기화');
  
  const theme = useTheme();
  const client = useApolloClient();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [startDate, setStartDate] = useState(moment().startOf('month'));
  const [endDate, setEndDate] = useState(moment().endOf('month'));
  const [dateRange, setDateRange] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    reservation_id: '',
    organization: '',
    occupancy: 1
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllReservations, setShowAllReservations] = useState(true);
  const [monthDate, setMonthDate] = useState(moment());
  const [viewType, setViewType] = useState('calendar'); // 'calendar' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayData, setDayData] = useState({ rooms: [], meals: [] });
  const [allRooms, setAllRooms] = useState([]);
  
  // 추가: 필터링 관련 상태 변수
  const [customStartDate, setCustomStartDate] = useState(moment().startOf('month'));
  const [customEndDate, setCustomEndDate] = useState(moment().endOf('month'));
  const [selectedFloor, setSelectedFloor] = useState('all'); // 층별 필터링
  const [dateError, setDateError] = useState(''); // 날짜 관련 오류 메시지

  // 상세 정보 모달을 위한 상태 추가
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reservationCheckInOut, setReservationCheckInOut] = useState({
    checkIn: null,
    checkOut: null
  });

  // Add new state variables for inspection tab
  const [inspectionSelectedReservation, setInspectionSelectedReservation] = useState(null);
  const [accommodationData, setAccommodationData] = useState({ rows: [], totalRoomPrice: 0 });
  const [inspectionMealData, setInspectionMealData] = useState({ rows: [], totalMealPrice: 0 });
  const [inspectionPdfLoading, setInspectionPdfLoading] = useState(false);
  const [inspectionSearchTerm, setInspectionSearchTerm] = useState('');

  console.log('객실 배정 탭: 컴포넌트 렌더링', {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD')
  });

  // Get reservation list
  const { 
    loading: loadingReservations, 
    error: errorReservations, 
    data: reservationListData 
  } = useQuery(GET_PAGE6_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('객실 배정 탭: 예약 목록 데이터', {
        count: data?.getPage1List?.length || 0,
        reservations: data?.getPage1List?.map(r => ({
          id: r.id,
          group_name: r.group_name,
          start_date: r.start_date,
          end_date: r.end_date,
          total_count: r.total_count
        })) || []
      });
    }
  });
  
  // Get all rooms information
  const { 
    loading: loadingMenuRooms,
    error: errorMenuRooms,
    data: menuRoomsData
  } = useQuery(GET_PAGE6_MENU_ROOMS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('===== 객실 배정 탭: 메뉴 객실 데이터 =====');
      console.log(`총 ${data.menuRooms?.length || 0}개 객실 불러옴`);
      if (data.menuRooms) {
        data.menuRooms.forEach(room => {
          console.log(`객실: ${room.room_name}, 타입: ${room.room_type}, 정원: ${room.capacity}, 표시순서: ${room.display_order}`);
        });
      }
    }
  });
  
  // Get room assignments
  const { 
    loading: loadingRooms, 
    error: errorRooms, 
    data: roomData,
    refetch: refetchRooms
  } = useQuery(GET_PAGE6_ROOM_ASSIGNMENTS, {
    variables: { 
      startDate: startDate.format('YYYY-MM-DD'), 
      endDate: endDate.format('YYYY-MM-DD')
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('===== 객실 배정 탭: 객실 배정 데이터 =====');
      console.log('시작일:', startDate.format('YYYY-MM-DD'));
      console.log('종료일:', endDate.format('YYYY-MM-DD'));
      console.log(`총 ${data.getRoomAssignments?.length || 0}개 객실 배정 데이터 불러옴`);
      
      if (data.getRoomAssignments) {
        let totalAssignments = 0;
        let assignmentsByFloor = {};
        
        data.getRoomAssignments.forEach(room => {
          const assignmentCount = room.assignments?.length || 0;
          totalAssignments += assignmentCount;
          
          // 층별 통계 수집
          const floor = room.floor || '1';
          if (!assignmentsByFloor[floor]) {
            assignmentsByFloor[floor] = {
              roomCount: 0,
              assignmentCount: 0
            };
          }
          assignmentsByFloor[floor].roomCount++;
          assignmentsByFloor[floor].assignmentCount += assignmentCount;
          
          console.log(`객실: ${room.room_name}, 층: ${room.floor}, 배정 수: ${assignmentCount}`);
          
          // 개별 배정 정보 (최대 5개까지만 표시)
          if (assignmentCount > 0 && assignmentCount <= 5) {
          room.assignments.forEach(assignment => {
              console.log(`  - 날짜: ${assignment.date}, 단체: ${assignment.organization}, 인원: ${assignment.occupancy}명`);
            });
          } else if (assignmentCount > 5) {
            // 5개 이상인 경우 처음 3개만 표시
            console.log(`  - 일부 배정 정보 (총 ${assignmentCount}개 중 3개):`);
            for (let i = 0; i < 3; i++) {
              const assignment = room.assignments[i];
              console.log(`  - 날짜: ${assignment.date}, 단체: ${assignment.organization}, 인원: ${assignment.occupancy}명`);
            }
          }
        });
        
        console.log(`총 배정 수: ${totalAssignments}`);
        
        // 층별 통계 출력
        console.log('===== 층별 객실 배정 통계 =====');
        Object.entries(assignmentsByFloor).forEach(([floor, stats]) => {
          console.log(`${floor}층: ${stats.roomCount}개 객실, ${stats.assignmentCount}개 배정`);
        });
      }
    }
  });
  
  // Get meal staff data
  const {
    loading: loadingMeals,
    error: errorMeals,
    data: mealData,
    refetch: refetchMeals
  } = useQuery(GET_PAGE6_MEAL_STAFF, {
    variables: {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      reservationId: selectedReservation?.id || null
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('===== 객실 배정 탭: 식사 인원 데이터 =====');
      console.log('시작일:', startDate.format('YYYY-MM-DD'));
      console.log('종료일:', endDate.format('YYYY-MM-DD'));
      console.log('선택된 단체:', selectedReservation ? selectedReservation.group_name : '전체');
      
      if (data.getMealStaff && data.getMealStaff.length > 0) {
        console.log(`총 ${data.getMealStaff.length}개 식사 데이터`);
        
        // 식사 타입별로 데이터 집계
        const mealsByType = {
          '조식': [],
          '중식': [],
          '석식': []
        };
        
        // 날짜별 식사 집계
        const mealsByDate = {};
        
        // 단체별 식사 집계
        const mealsByOrganization = {};
        
        // 데이터 분류
        data.getMealStaff.forEach(meal => {
          // 타입별 분류
          if (mealsByType[meal.meal_type]) {
            mealsByType[meal.meal_type].push(meal);
          }
          
          // 날짜별 분류
          if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = {
              '조식': 0,
              '중식': 0,
              '석식': 0,
              'total': 0
            };
          }
          mealsByDate[meal.date][meal.meal_type] += meal.total_count;
          mealsByDate[meal.date].total += meal.total_count;
          
          // 단체별 분류
          if (meal.organization) {
            if (!mealsByOrganization[meal.organization]) {
              mealsByOrganization[meal.organization] = {
                '조식': 0,
                '중식': 0,
                '석식': 0,
                'total': 0
              };
            }
            mealsByOrganization[meal.organization][meal.meal_type] += meal.total_count;
            mealsByOrganization[meal.organization].total += meal.total_count;
          }
        });
        
        // 집계 결과 출력
        console.log('===== 식사 타입별 통계 =====');
        Object.entries(mealsByType).forEach(([type, meals]) => {
          const totalCount = meals.reduce((sum, meal) => sum + meal.total_count, 0);
          console.log(`${type}: ${meals.length}건, 총 ${totalCount}명`);
        });
        
        console.log('===== 날짜별 식사 통계 =====');
        const dates = Object.keys(mealsByDate).sort();
        dates.forEach(date => {
          const mealCounts = mealsByDate[date];
          console.log(`${date}: 조식 ${mealCounts['조식']}명, 중식 ${mealCounts['중식']}명, 석식 ${mealCounts['석식']}명, 총 ${mealCounts.total}명`);
        });
        
        if (Object.keys(mealsByOrganization).length > 0) {
          console.log('===== 단체별 식사 통계 =====');
          Object.entries(mealsByOrganization).forEach(([org, counts]) => {
            console.log(`${org}: 조식 ${counts['조식']}명, 중식 ${counts['중식']}명, 석식 ${counts['석식']}명, 총 ${counts.total}명`);
          });
        }
        
        // 샘플 데이터 표시
        if (data.getMealStaff.length > 0) {
          console.log('===== 식사 데이터 샘플 =====');
          const sample = data.getMealStaff.slice(0, 3);
          sample.forEach(meal => {
            console.log(`${meal.date} ${meal.meal_type}: ${meal.organization || '미지정'}, 총 ${meal.total_count}명 (청소년 ${meal.youth_count}명, 성인 ${meal.adult_count}명, 강사 ${meal.instructor_count}명, 기타 ${meal.other_count}명)`);
          });
        }
      } else {
        console.log('식사 인원 데이터가 없습니다.');
      }
    }
  });
  
  // Query page3 data for selected reservation
  const { data: page3Data, loading: page3Loading, refetch: refetchPage3Data } = useQuery(
    GET_PAGE3_BY_PAGE1_ID_QUERY,
    {
      variables: {
        page1Id: inspectionSelectedReservation?.id || 0
      },
      skip: !inspectionSelectedReservation?.id,
      fetchPolicy: 'network-only', // 항상 최신 데이터를 가져오도록 변경
      notifyOnNetworkStatusChange: true
    }
  );

  // inspectionSelectedReservation이 변경될 때마다 Page3 데이터를 새로 가져오기
  useEffect(() => {
    if (inspectionSelectedReservation?.id && refetchPage3Data) {
      console.log(`[Page6] 선택된 예약 변경 - Page3 데이터 새로고침: ${inspectionSelectedReservation.id}`);
      refetchPage3Data();
    }
  }, [inspectionSelectedReservation?.id, refetchPage3Data]);

  // 페이지 포커스 시 데이터 새로고침 (Page3에서 변경사항이 있을 수 있으므로)
  useEffect(() => {
    const handleFocus = () => {
      if (inspectionSelectedReservation?.id && refetchPage3Data) {
        console.log('[Page6] 페이지 포커스 - Page3 데이터 새로고침');
        refetchPage3Data();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [inspectionSelectedReservation?.id, refetchPage3Data]);

  // Get selected reservation details
  const {
    loading: loadingReservationDetail, 
    error: errorReservationDetail, 
    data: reservationDetailData 
  } = useQuery(GET_PAGE6_RESERVATION_DETAIL, {
    variables: { id: selectedReservation?.id },
    skip: !selectedReservation?.id,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getPage1ById) {
        console.log('===== 객실 배정 탭: 예약 상세 정보 =====');
        console.log('예약 ID:', data.getPage1ById.id);
        console.log('단체명:', data.getPage1ById.group_name);
        console.log('담당자:', data.getPage1ById.customer_name);
        console.log('기간:', data.getPage1ById.start_date, '~', data.getPage1ById.end_date);
        
        // 객실 예약 정보
        if (data.getPage1ById.page3 && data.getPage1ById.page3.room_selections) {
          console.log('객실 예약:', data.getPage1ById.page3.room_selections.map(room => ({
            객실: room.room_name,
            입실일: room.check_in_date,
            퇴실일: room.check_out_date,
            인원: room.occupancy,
            정원: room.capacity,
            박수: room.nights,
            가격: room.price
          })));
        }
        
        // 식사 계획 정보
        if (data.getPage1ById.page3 && data.getPage1ById.page3.meal_plans) {
          console.log('식사 계획:', data.getPage1ById.page3.meal_plans.map(meal => ({
            날짜: meal.date,
            식사유형: meal.meal_type,
            식사옵션: meal.meal_option,
            인원: meal.participants,
            가격: meal.price
          })));
        }
        
        console.log('===============================');
      }
    }
  });
  
  // Mutations
  const [saveRoomAssignment, { loading: savingAssignment }] = useMutation(SAVE_ROOM_ASSIGNMENT, {
    onCompleted: (data) => {
      console.log('===== 객실 배정 저장 완료 =====');
      console.log('서버 응답:', data);
      console.log('============================');
      showAlert('객실 배정이 저장되었습니다.', 'success');
      refetchRooms();
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('===== 객실 배정 저장 오류 =====');
      console.error('오류 내용:', error.message);
      console.error('=============================');
      showAlert(`객실 배정 저장 실패: ${error.message}`, 'error');
    }
  });
  
  const [deleteRoomAssignment, { loading: deletingAssignment }] = useMutation(DELETE_ROOM_ASSIGNMENT, {
    onCompleted: (data) => {
      console.log('===== 객실 배정 삭제 완료 =====');
      console.log('서버 응답:', data);
      console.log('============================');
      showAlert('객실 배정이 삭제되었습니다.', 'success');
      refetchRooms();
    },
    onError: (error) => {
      console.error('===== 객실 배정 삭제 오류 =====');
      console.error('오류 내용:', error.message);
      console.error('=============================');
      showAlert(`객실 배정 삭제 실패: ${error.message}`, 'error');
    }
  });
  
  // Update date range when dates change
  useEffect(() => {
    console.log('객실 배정 탭: 날짜 범위 변경', {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    });
    
    if (startDate && endDate) {
      setDateRange(generateDateRange(startDate, endDate));
    }
  }, [startDate, endDate]);
  
  // Refetch data when date range changes
  useEffect(() => {
    if (refetchRooms) {
      refetchRooms({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      });
    }
    
    if (refetchMeals) {
      refetchMeals({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        reservationId: selectedReservation?.id || null
      });
    }
  }, [startDate, endDate, selectedReservation, refetchRooms, refetchMeals]);
  
  // Process reservation data
  useEffect(() => {
    if (reservationListData?.getPage1List) {
      // Log available reservations for debugging
      console.log('===== 사용 가능한 단체 목록 =====');
      console.log(`총 ${reservationListData.getPage1List.length}개 단체 있음`);
      reservationListData.getPage1List.forEach(r => {
        console.log(`- ${r.group_name} (ID: ${r.id}): ${formatDate(r.start_date)} ~ ${formatDate(r.end_date)}`);
      });
      console.log('============================');
      
      // By default, show all groups
      if (selectedReservation === null && !showAllReservations) {
        setShowAllReservations(true);
        console.log("초기화: 전체 단체 표시 모드로 설정");
      }
    }
  }, [reservationListData, selectedReservation, showAllReservations]);
  
  // Ensure meal data is fetched with correct parameters
  useEffect(() => {
    if (refetchMeals) {
      refetchMeals({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        reservationId: selectedReservation?.id || null
      });
      
      console.log('===== 식사 데이터 요청 =====');
      console.log('시작일:', startDate.format('YYYY-MM-DD'));
      console.log('종료일:', endDate.format('YYYY-MM-DD'));
      console.log('단체 ID:', selectedReservation?.id || '전체 (null)');
      console.log('==========================');
    }
  }, [selectedReservation, startDate, endDate, refetchMeals]);
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Debug log for tab change
    console.log('===== 탭 변경 =====');
    console.log('선택된 탭:', newValue === 0 ? '객실 배정' : newValue === 1 ? '단체별 조회' : '기타');
    console.log('현재 월:', monthDate.format('YYYY-MM'));
    console.log('날짜 범위:', startDate.format('YYYY-MM-DD'), '~', endDate.format('YYYY-MM-DD'));
    console.log('선택된 단체:', selectedReservation ? selectedReservation.group_name : '전체');
    console.log('====================');
  };
  
  // Handle view type change (calendar or list)
  const handleViewTypeChange = (event, newViewType) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (period) => {
    let newStartDate, newEndDate;
    
    switch (period) {
      case 'month':
        newStartDate = moment().startOf('month');
        newEndDate = moment().endOf('month');
        break;
      case 'next-month':
        newStartDate = moment().add(1, 'month').startOf('month');
        newEndDate = moment().add(1, 'month').endOf('month');
        break;
      case 'two-months':
        newStartDate = moment().startOf('month');
        newEndDate = moment().add(1, 'month').endOf('month');
        break;
      default:
        newStartDate = moment().startOf('month');
        newEndDate = moment().endOf('month');
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setMonthDate(newStartDate);
  };
  
  // Selected reservation change handler
  const handleReservationChange = (event) => {
    const reservationId = event.target.value;
    
    console.log('객실 배정 탭: 예약 변경', {
      reservationId,
      selectedReservation: reservationListData.getPage1List.find(r => r.id === parseInt(reservationId))
    });
    
    if (reservationId === 'all') {
      setSelectedReservation(null);
      setShowAllReservations(true);
      console.log('전체 단체 선택됨');
      
      // Keep current date range for "all" view
      // Refetch data with current date range
      if (refetchMeals) {
        refetchMeals({
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          reservationId: null
        });
      }
    } else {
      const reservation = reservationListData.getPage1List.find(r => r.id === parseInt(reservationId));
      
      if (reservation) {
        setSelectedReservation(reservation);
        setShowAllReservations(false);
        
        console.log('선택된 단체 정보:', {
          '단체명': reservation.group_name,
          '담당자': reservation.customer_name,
          '시작일': formatDate(reservation.start_date),
          '종료일': formatDate(reservation.end_date),
          '인원': reservation.total_count
        });
        
        // Adjust date range to match reservation period
        const reservationStart = moment(reservation.start_date);
        const reservationEnd = moment(reservation.end_date);
        
        // Expand to include the month
        const start = moment(reservationStart).startOf('month');
        const end = moment(reservationEnd).endOf('month');
        
        console.log('날짜 범위 조정:', start.format('YYYY-MM-DD'), '~', end.format('YYYY-MM-DD'));
        
        setStartDate(start);
        setEndDate(end);
        setMonthDate(start); // Also update the month view
        
        // Refetch meal data with the selected reservation ID
        if (refetchMeals) {
          refetchMeals({
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            reservationId: reservation.id
          });
        }
      }
    }
    console.log('===========================');
  };
  
  // Handle opening the assignment dialog
  const handleOpenAssignmentDialog = (room, date) => {
    console.log('객실 배정 탭: 객실 배정 대화상자 열기', {
      room_id: room.room_id,
      room_name: room.room_name,
      date: date,
      현재_배정: room.assignments[date] ? {
        id: room.assignments[date].id,
        단체명: room.assignments[date].organization,
        인원: room.assignments[date].occupancy,
        예약ID: room.assignments[date].reservation_id
      } : '배정 없음'
    });
    
    setSelectedRoom(room);
    setSelectedDate(moment(date));
    
    // Check if there's an existing assignment
    const existingAssignment = room.assignments[date];
    
    setAssignmentData({
      reservation_id: selectedReservation.id,
      organization: selectedReservation.group_name,
      occupancy: existingAssignment ? existingAssignment.occupancy : 1
    });
    
    setDialogOpen(true);
  };
  
  // Dialog close handler
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRoom(null);
  };
  
  // Handle change in assignment occupancy
  const handleAssignmentDataChange = (field, value) => {
    setAssignmentData({
      ...assignmentData,
      [field]: value
    });
  };
  
  // Handle saving an assignment
  const handleSaveAssignment = () => {
    console.log('객실 배정 탭: 객실 배정 저장', {
      room_id: selectedRoom.room_id,
      room_name: selectedRoom.room_name,
      date: selectedDate.format('YYYY-MM-DD'),
      배정정보: {
        reservation_id: assignmentData.reservation_id,
        organization: assignmentData.organization,
        occupancy: assignmentData.occupancy
      }
    });
    
    if (!selectedRoom || !selectedDate) return;
    
    const roomAssignmentData = {
      reservation_id: parseInt(assignmentData.reservation_id),
      room_id: parseInt(selectedRoom.room_id),
      room_name: selectedRoom.room_name,
      floor: parseInt(selectedRoom.floor),
      date: selectedDate.format('YYYY-MM-DD'),
      organization: assignmentData.organization,
      occupancy: parseInt(assignmentData.occupancy)
    };
    
    console.log('===== 객실 배정 저장 =====');
    console.log('저장할 데이터:', roomAssignmentData);
    console.log('=========================');
    
    saveRoomAssignment({
      variables: {
        roomAssignment: roomAssignmentData
      }
    });
  };
  
  // Handle deleting an assignment
  const handleDeleteAssignment = (room, date) => {
    console.log('객실 배정 탭: 객실 배정 삭제', {
      room_id: room.room_id, 
      room_name: room.room_name,
      date: date,
      배정정보: room.assignments[date] ? {
        id: room.assignments[date].id,
        단체명: room.assignments[date].organization,
        인원: room.assignments[date].occupancy
      } : '배정 없음'
    });
    
    if (!room.assignments[date] || !room.assignments[date].id) return;
    
    const assignment = room.assignments[date];
    
    console.log('===== 객실 배정 삭제 =====');
    console.log('삭제할 배정 정보:', {
      id: assignment.id,
      날짜: typeof date === 'string' ? date : date.format('YYYY-MM-DD'),
      객실: room.room_name,
      단체명: assignment.organization,
      인원: assignment.occupancy
    });
    console.log('=========================');
    
    if (window.confirm('이 배정을 삭제하시겠습니까?')) {
      deleteRoomAssignment({
        variables: {
          id: assignment.id
        }
      });
    }
  };
  
  // PDF generation function for room and meal assignment
  const generateRoomMealPDF = async (reservationData, accommodationData, mealData) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };
    
    try {
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = '숙소 및 식사 배정표';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
      yPosition += 15;
      
      // Organization info
      if (reservationData) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const orgInfo = [
          `단체명: ${reservationData.group_name || ''}`,
          `담당자: ${reservationData.customer_name || ''}`,
          `기간: ${reservationData.start_date ? moment(reservationData.start_date).format('YYYY-MM-DD') : ''} ~ ${reservationData.end_date ? moment(reservationData.end_date).format('YYYY-MM-DD') : ''}`,
          `인원: ${reservationData.total_count || 0}명`
        ];
        
        orgInfo.forEach(info => {
          checkNewPage(8);
          doc.text(info, margin, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      }
      
      // Accommodation section
      if (accommodationData && accommodationData.rows.length > 0) {
        checkNewPage(40);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('■ 숙박 정보', margin, yPosition);
        yPosition += 10;
        
        const accommodationHeaders = ['구분', '객실', '입실', '퇴실', '박수', '인원', '단가', '소계', '할인', '합계', '비고'];
        const accommodationData_formatted = accommodationData.rows.map(row => [
          row.type,
          row.room,
          row.checkIn,
          row.checkOut,
          row.nights,
          row.people,
          row.unitPrice.toLocaleString(),
          row.subtotal.toLocaleString(),
          row.discount.toLocaleString(),
          row.total.toLocaleString(),
          row.notes
        ]);
        
        doc.autoTable({
          head: [accommodationHeaders],
          body: accommodationData_formatted,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [70, 130, 180],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 20 },
            2: { cellWidth: 15 },
            3: { cellWidth: 15 },
            4: { cellWidth: 12 },
            5: { cellWidth: 12 },
            6: { cellWidth: 18 },
            7: { cellWidth: 18 },
            8: { cellWidth: 15 },
            9: { cellWidth: 18 },
            10: { cellWidth: 25 }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      
      // Meal section
      if (mealData && mealData.rows.length > 0) {
        checkNewPage(40);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('■ 식사 정보', margin, yPosition);
        yPosition += 10;
        
        const mealHeaders = ['구분', '메뉴', '횟수', '인원', '단가', '소계', '할인', '합계', '비고'];
        const mealData_formatted = mealData.rows.map(row => [
          row.type,
          row.menu,
          row.count,
          row.people,
          row.unitPrice.toLocaleString(),
          row.subtotal.toLocaleString(),
          row.discount.toLocaleString(),
          row.total.toLocaleString(),
          row.notes
        ]);
        
        doc.autoTable({
          head: [mealHeaders],
          body: mealData_formatted,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [70, 130, 180],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 25 },
            2: { cellWidth: 12 },
            3: { cellWidth: 12 },
            4: { cellWidth: 18 },
            5: { cellWidth: 18 },
            6: { cellWidth: 15 },
            7: { cellWidth: 18 },
            8: { cellWidth: 25 }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      
      // Summary section
      checkNewPage(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('■ 요약', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const accommodationTotal = accommodationData ? accommodationData.totalRoomPrice : 0;
      const mealTotal = mealData ? mealData.totalMealPrice : 0;
      const grandTotal = accommodationTotal + mealTotal;
      
      const summaryInfo = [
        `숙박비 합계: ${accommodationTotal.toLocaleString()}원`,
        `식사비 합계: ${mealTotal.toLocaleString()}원`,
        `총 합계: ${grandTotal.toLocaleString()}원`
      ];
      
      summaryInfo.forEach(info => {
        doc.text(info, margin, yPosition);
        yPosition += 6;
      });
      
      // Footer
      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      doc.setFontSize(8);
      doc.text(`생성일시: ${now}`, margin, pageHeight - 10);
      
      return doc;
      
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      throw error;
    }
  };

  // PDF export handler for room and meal assignment - 월별 전체 PDF 생성
  const handleRoomMealPdf = async () => {
    try {
      setPdfLoading(true);
      
      // 선택된 달(월)의 모든 예약 데이터 가져오기
      const monthStart = startDate.clone().startOf('month');
      const monthEnd = endDate.clone().endOf('month');
      
      console.log('월별 PDF 생성 시작:', {
        monthStart: monthStart.format('YYYY-MM-DD'),
        monthEnd: monthEnd.format('YYYY-MM-DD')
      });
      
      // 해당 월 범위 내의 모든 예약 필터링
      const reservationsInMonth = (reservationListData?.getPage1List || []).filter(reservation => {
        const resStart = moment(reservation.start_date);
        const resEnd = moment(reservation.end_date);
        
        // 예약 기간이 선택된 월과 겹치는지 확인
        return (resStart.isSameOrBefore(monthEnd) && resEnd.isSameOrAfter(monthStart));
      });
      
      console.log(`월별 예약 건수: ${reservationsInMonth.length}개`);
      
      if (reservationsInMonth.length === 0) {
        showAlert('해당 월에 예약된 데이터가 없습니다.', 'warning');
        setPdfLoading(false);
        return;
      }
      
      // 각 예약에 대한 상세 데이터 가져오기
      const allReservationData = [];
      
      for (const reservation of reservationsInMonth) {
        try {
      const { data: detailData } = await client.query({
        query: GET_PAGE6_RESERVATION_DETAIL,
            variables: { id: reservation.id },
        fetchPolicy: 'network-only'
      });
      
          if (detailData?.getPage1ById) {
            allReservationData.push(detailData.getPage1ById);
          }
        } catch (error) {
          console.error(`예약 ${reservation.id} 데이터 가져오기 실패:`, error);
        }
      }
      
      console.log(`총 ${allReservationData.length}개 예약 데이터 수집 완료`);
      
      // 월별 전체 PDF 생성: 모든 예약을 하나의 HTML로 합쳐서 하나의 PDF로 생성
      const monthLabel = monthStart.format('YYYY년 MM월');
      
      // 모든 예약의 HTML 콘텐츠를 생성
      const allReservationHTMLs = [];
      
      for (const reservationData of allReservationData) {
        // Process room assignment data
        const roomAssignmentData = reservationData.page3?.room_selections?.map(room => ({
          room_name: room.room_name,
          capacity: room.capacity,
          assignments: [{
            date: room.check_in_date,
            occupancy: room.occupancy,
            organization: reservationData.group_name || ''
          }]
        })) || [];
        
        // Process meal data
        const mealDataRows = createMealSection(reservationData.page3?.meal_plans || []);
        const mealData = mealDataRows.rows.map(meal => {
          // meal_type을 영어로 변환
          let mealTypeEn = meal.type;
          if (meal.type === '조식') mealTypeEn = 'breakfast';
          else if (meal.type === '중식') mealTypeEn = 'lunch';
          else if (meal.type === '석식') mealTypeEn = 'dinner';
          
          return {
            date: meal.date,
            meal_type: mealTypeEn,
            participants: meal.people,
            unitPrice: meal.unitPrice,
            total: meal.total
          };
        });
        
        // 각 예약별 HTML 생성
        const startDate = moment(reservationData.start_date);
        const endDate = moment(reservationData.end_date);
        const usagePeriod = `${startDate.format('MM/DD')}-${endDate.format('DD')}`;
        
        // Generate room assignment table
        const roomAssignmentTableHTML = generateRoomAssignmentTable(roomAssignmentData, startDate);
        
        // Generate meal schedule table
        const mealScheduleTableHTML = generateMealScheduleTable(mealData, startDate, endDate);
        
        const reservationHTML = `
          <div style="page-break-after: always; padding: 30px; width: 100%; box-sizing: border-box; line-height: 1.4;">
            <!-- 제목 섹션 -->
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="font-size: 22px; margin: 0; color: #000; font-weight: bold;">숙소 배정 및 식사 인원</h1>
              <div style="text-align: right; font-size: 13px; color: #000; margin-top: 15px; font-weight: normal;">
                ${reservationData.group_name || '단체명'}(${usagePeriod})
              </div>
            </div>
            
            <!-- 숙소 배정 섹션 -->
            <div style="margin-bottom: 25px;">
              <h2 style="font-size: 15px; color: #000; margin-bottom: 10px; font-weight: bold;">◯ 숙소 배정</h2>
              ${roomAssignmentTableHTML}
              <div style="margin-top: 8px;">
                <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 파란색 부분이 배정된 객실입니다. 실제 이용인원을 적어주세요.</p>
                <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 객실 추가 및 축소 필요시 사전협의 필수입니다</p>
                <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 기사님 숙소(유료) 필요시 하단 "기타요청사항"에 기재하여 주십시오.</p>
              </div>
            </div>
            
            <!-- 식사 인원 섹션 -->
            <div style="margin-bottom: 25px;">
              <h2 style="font-size: 15px; color: #000; margin-bottom: 10px; font-weight: bold;">◯ 식사 인원</h2>
              ${mealScheduleTableHTML}
              <div style="margin-top: 8px;">
                <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 최종 식사인원을 확인하여 주십시오.</p>
              </div>
            </div>
            
            <!-- 기타 요청사항 섹션 -->
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 15px; color: #000; margin-bottom: 10px; font-weight: bold;">◯ 기타 요청사항</h2>
              <div style="border: 2px solid #000; min-height: 60px; padding: 10px; background-color: #fff;"></div>
            </div>
          </div>
        `;
        
        allReservationHTMLs.push(reservationHTML);
      }
      
      // 모든 예약의 HTML을 하나로 합치기
      const combinedHTML = allReservationHTMLs.join('');
      
      // 하나의 PDF로 생성
      const container = document.createElement('div');
      container.style.width = '1000px';
      container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);
      
      container.innerHTML = combinedHTML;
      
      // HTML을 PDF로 변환
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 1000,
            height: container.scrollHeight,
            windowWidth: 1000,
            windowHeight: container.scrollHeight
          });
          
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const imgData = canvas.toDataURL('image/png', 1.0);
          const pdfWidth = 210;
          const pdfHeight = 297;
          const margin = 10;
          const imgWidth = pdfWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          const pageHeight = pdfHeight - (margin * 2);
          const totalPages = Math.ceil(imgHeight / pageHeight);
          
          for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
              pdf.addPage();
            }
            
            const sourceY = (canvas.height / totalPages) * page;
            const sourceHeight = Math.min(canvas.height / totalPages, canvas.height - sourceY);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            
            const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
            
            let finalWidth = imgWidth;
            let finalHeight = (sourceHeight * imgWidth) / canvas.width;
            
            if (finalHeight > pageHeight) {
              finalHeight = pageHeight;
              finalWidth = (canvas.width * finalHeight) / sourceHeight;
            }
            
            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = margin;
            
            pdf.addImage(pageImgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
          }
          
          const fileName = `숙소및식사배정표_${monthLabel}_전체_${moment().format('YYYYMMDD')}.pdf`;
          pdf.save(fileName);
          
          document.body.removeChild(container);
          showAlert(`${monthLabel} 전체 PDF 다운로드가 완료되었습니다. (${allReservationData.length}개 단체)`, 'success');
          setPdfLoading(false);
        } catch (error) {
          console.error('PDF 생성 오류:', error);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
          setPdfLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Excel export handler for room assignments and meal data
  const handleRoomMealExcel = async () => {
    try {
      setPdfLoading(true); // Reuse the loading state
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Styles
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
      
      const subHeaderStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E0E0E0' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
      
      const defaultStyle = {
        alignment: { vertical: 'center', horizontal: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
      
      const roomAssignmentHighlightStyle = {
        ...defaultStyle,
        fill: { fgColor: { rgb: 'FFCC33' }, patternType: 'solid' }
      };
      
      // 1. Room Assignment Worksheet
      if (roomData?.getRoomAssignments && dateRange.length > 0) {
        // Process rooms data by floor
        const roomsByFloor = processRoomData();
        
        // Generate title text based on whether a reservation is selected
        const titleText = selectedReservation 
          ? `${selectedReservation.group_name} 객실 배정 현황 (${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`
          : `전체 객실 배정 현황 (${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`;
        
        // First row: Title
        const roomAssignmentData = [
          [{ v: titleText, s: {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center' }
          }}]
        ];
        
        // Add empty row
        roomAssignmentData.push(['']);
        
        // Header row with dates
        const headerRow = [{ v: '구분', s: headerStyle }];
        
        dateRange.forEach(date => {
          headerRow.push({ 
            v: `${date.format('M/DD')} (${getDayName(date.day())})`, 
            s: headerStyle 
          });
        });
        
        roomAssignmentData.push(headerRow);
        
        // Add rooms by floor
        roomsByFloor.forEach(([floor, rooms]) => {
          // Floor header
          roomAssignmentData.push([
            { v: `${floor}층`, s: subHeaderStyle, colspan: dateRange.length + 1 }
          ]);
          
          // Add rooms
          rooms.forEach(room => {
            const rowData = [{ v: `${room.room_name}호`, s: defaultStyle }];
            
            // For each date
            dateRange.forEach(date => {
              const dateStr = date.format('YYYY-MM-DD');
              // Handle both object format (assignments[dateStr]) and array format
              let assignment = null;
              if (room.assignments) {
                if (typeof room.assignments === 'object' && !Array.isArray(room.assignments)) {
                  assignment = room.assignments[dateStr] || null;
                } else if (Array.isArray(room.assignments)) {
                  assignment = room.assignments.find(a => {
                    const assignmentDate = moment(a.date).format('YYYY-MM-DD');
                    return assignmentDate === dateStr;
                  }) || null;
                }
              }
              
              // If no assignment or filtered out (only if a specific reservation is selected)
              if (!assignment || (selectedReservation && assignment.reservation_id && parseInt(assignment.reservation_id) !== parseInt(selectedReservation.id))) {
                rowData.push({ v: '', s: defaultStyle });
              } else {
                // With assignment
                rowData.push({ 
                  v: `${assignment.organization || ''} (${assignment.occupancy || 0}명)`, 
                  s: roomAssignmentHighlightStyle 
                });
              }
            });
            
            roomAssignmentData.push(rowData);
          });
        });
        
        const roomAssignmentWs = XLSX.utils.aoa_to_sheet(roomAssignmentData);
        
        // Set column widths
        const roomAssignmentWsCols = [{ wch: 15 }]; // First column width
        for (let i = 0; i < dateRange.length; i++) {
          roomAssignmentWsCols.push({ wch: 15 }); // Date columns width
        }
        roomAssignmentWs['!cols'] = roomAssignmentWsCols;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, roomAssignmentWs, '객실 배정 현황');
      }
      
      // 2. Meal Worksheet
      if (roomData?.getRoomAssignments && dateRange.length > 0) {
        // Calculate meal data from room assignments
        const allOrganizations = {};
        
        // Extract unique organization names from room assignments
        roomData.getRoomAssignments.forEach(room => {
          Object.entries(room.assignments).forEach(([date, assignment]) => {
            if (moment(date).isBetween(startDate, endDate, 'day', '[]')) {
              if (!allOrganizations[assignment.organization]) {
                allOrganizations[assignment.organization] = {
                  name: assignment.organization,
                  reservationId: assignment.reservation_id,
                  dates: {}
                };
              }
              
              if (!allOrganizations[assignment.organization].dates[date]) {
                allOrganizations[assignment.organization].dates[date] = {
                  breakfast: 0,
                  lunch: 0,
                  dinner: 0
                };
              }
              
              // Add occupancy count to all meal types
              allOrganizations[assignment.organization].dates[date].breakfast += assignment.occupancy;
              allOrganizations[assignment.organization].dates[date].lunch += assignment.occupancy;
              allOrganizations[assignment.organization].dates[date].dinner += assignment.occupancy;
            }
          });
        });
        
        // Filter by selected organization or include all organizations
        const organizationsArray = Object.values(allOrganizations)
          .filter(org => !selectedReservation || org.reservationId === selectedReservation.id);
        
        if (organizationsArray.length > 0) {
          // Generate title text based on whether a reservation is selected
          const titleText = selectedReservation 
            ? `${selectedReservation.group_name} 식사 현황 (${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`
            : `전체 식사 현황 (${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')})`;
          
          // First row: Title
          const mealData = [
            [{ v: titleText, s: {
              font: { bold: true, sz: 14 },
              alignment: { horizontal: 'center' }
            }}]
          ];
          
          // Add empty row
          mealData.push(['']);
          
          // For each organization
          organizationsArray.forEach(org => {
            // Organization name
            mealData.push([{ v: org.name, s: {
              font: { bold: true, sz: 12 },
              alignment: { horizontal: 'left' }
            }}]);
            
            // Header row
            mealData.push([
              { v: '날짜', s: headerStyle },
              { v: '조식', s: headerStyle },
              { v: '중식', s: headerStyle },
              { v: '석식', s: headerStyle }
            ]);
            
            // Data rows for each date
            dateRange.forEach(date => {
              const dateStr = date.format('YYYY-MM-DD');
              const mealInfo = org.dates[dateStr] || { breakfast: 0, lunch: 0, dinner: 0 };
              
              const dateStyle = date.isSame(moment(), 'day') 
                ? { ...defaultStyle, fill: { fgColor: { rgb: 'FFF2CC' }, patternType: 'solid' } }
                : { ...defaultStyle, fill: { fgColor: { rgb: 'F5F5F5' }, patternType: 'solid' } };
              
              mealData.push([
                { v: `${date.format('MM/DD')} (${date.format('ddd')})`, s: dateStyle },
                { v: mealInfo.breakfast > 0 ? `${mealInfo.breakfast}명` : '-', s: defaultStyle },
                { v: mealInfo.lunch > 0 ? `${mealInfo.lunch}명` : '-', s: defaultStyle },
                { v: mealInfo.dinner > 0 ? `${mealInfo.dinner}명` : '-', s: defaultStyle }
              ]);
            });
            
            // Total row
            const totalBreakfast = Object.values(org.dates).reduce((sum, data) => sum + data.breakfast, 0);
            const totalLunch = Object.values(org.dates).reduce((sum, data) => sum + data.lunch, 0);
            const totalDinner = Object.values(org.dates).reduce((sum, data) => sum + data.dinner, 0);
            
            const totalStyle = { 
              ...defaultStyle, 
              font: { bold: true },
              fill: { fgColor: { rgb: 'C6E0B4' }, patternType: 'solid' }
            };
            
            mealData.push([
              { v: '합계', s: { ...totalStyle, alignment: { horizontal: 'left' } } },
              { v: `${totalBreakfast}명`, s: totalStyle },
              { v: `${totalLunch}명`, s: totalStyle },
              { v: `${totalDinner}명`, s: totalStyle }
            ]);
            
            // Add empty row between organizations
            mealData.push(['']);
          });
          
          const mealWs = XLSX.utils.aoa_to_sheet(mealData);
          
          // Set column widths
          const mealWsCols = [
            { wch: 20 }, // Date column
            { wch: 15 }, // Breakfast
            { wch: 15 }, // Lunch
            { wch: 15 }  // Dinner
          ];
          mealWs['!cols'] = mealWsCols;
          
          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(wb, mealWs, '식사 현황');
        }
      }
      
      // Generate file name based on whether a reservation is selected
      const fileName = selectedReservation 
        ? `${selectedReservation.group_name}_객실식사현황_${moment().format('YYYYMMDD')}.xlsx`
        : `전체객실식사현황_${moment().format('YYYYMMDD')}.xlsx`;
      
      // Save the workbook
      XLSX.writeFile(wb, fileName);
      
      showAlert('엑셀 파일이 생성되었습니다.', 'success');
    } catch (error) {
      console.error('Excel export error:', error);
      showAlert('엑셀 파일 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Process room data
  const processRoomData = () => {
    // Check if we have rooms data
    const hasAssignments = roomData?.getRoomAssignments && roomData.getRoomAssignments.length > 0;
    const hasRooms = menuRoomsData?.menuRooms && menuRoomsData.menuRooms.length > 0;
    
    console.log('객실 배정 탭: processRoomData 호출', {
      hasData: hasRooms || hasAssignments,
      roomCount: hasRooms ? menuRoomsData.menuRooms.length : 0,
      assignmentsCount: hasAssignments ? roomData.getRoomAssignments.length : 0,
    });
    
    // If no rooms data available, try returning empty result
    if (!hasRooms && !hasAssignments) return [];
    
    // Use menuRooms as base or fall back to assignments rooms if menuRooms not available
    const roomsToUse = hasRooms ? menuRoomsData.menuRooms : 
                      (hasAssignments ? roomData.getRoomAssignments : []);
    
    // Group rooms by floor (1층, 2층, 3층, etc. - 첫 번째 자리를 floor로 사용)
    const roomsByFloor = {};
    
    // First add all available rooms
    roomsToUse.forEach(room => {
      // 객실 번호에서 첫 자리를 floor로 사용 (기본값 1)
      const roomNum = parseInt(room.room_name.replace(/\D/g, '')) || 0;
      const floor = String(Math.floor(roomNum / 100) || '1'); // 100번대 = 1층, 200번대 = 2층
      
      if (!roomsByFloor[floor]) {
        roomsByFloor[floor] = [];
      }
      
      // Create base room object
      const roomObj = {
        room_id: String(room.id),
        room_name: room.room_name,
        room_type: room.room_type,
        floor: floor,
        capacity: room.capacity,
        price: room.price,
        is_available: room.is_available,
        display_order: room.display_order || 0,
        assignments: {}
      };
      
      // Add to floor group
      roomsByFloor[floor].push(roomObj);
    });
    
    // If we have assignments data, merge it with our rooms
    if (hasAssignments) {
      roomData.getRoomAssignments.forEach(room => {
        // 객실 번호에서 첫 자리를 floor로 사용 (기본값 1)
        const roomNum = parseInt(room.room_name.replace(/\D/g, '')) || 0;
        const floor = String(Math.floor(roomNum / 100) || '1');
        
        // Find existing room in roomsByFloor
        let existingRoom = null;
        if (roomsByFloor[floor]) {
          existingRoom = roomsByFloor[floor].find(r => r.room_id === String(room.room_id));
      }
      
      // Convert assignments from array to object with date as key
      const assignments = {};
      if (room.assignments && Array.isArray(room.assignments)) {
        room.assignments.forEach(assignment => {
          const date = assignment.date; // Already formatted as YYYY-MM-DD
          assignments[date] = assignment;
        });
      }
      
        // Update existing room or add new room
        if (existingRoom) {
          existingRoom.assignments = assignments;
        } else {
          // Room not found in roomsByFloor, add it
          if (!roomsByFloor[floor]) {
            roomsByFloor[floor] = [];
          }
          
          roomsByFloor[floor].push({
            room_id: String(room.room_id),
            room_name: room.room_name,
            floor: floor,
            capacity: room.capacity,
            assignments: assignments
          });
        }
      });
    }
    
    // Sort floors and rooms
    return Object.entries(roomsByFloor)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([floor, rooms]) => [
        floor,
        rooms.sort((a, b) => {
          // 객실명에서 숫자만 추출
          const aNum = parseInt(a.room_name.replace(/\D/g, '')) || 0;
          const bNum = parseInt(b.room_name.replace(/\D/g, '')) || 0;
          
          // 숫자 기준으로 오름차순 정렬 (첫 번째 기준)
          if (aNum !== bNum) {
            return aNum - bNum;
          }
          
          // 두 번째 기준: display_order 기준 정렬
          return (a.display_order || 0) - (b.display_order || 0);
        })
      ]);
  };

  // Render room assignments view
  const renderRoomAssignmentsView = () => {
    console.log('===== 객실 배정 뷰 렌더링 =====');
    console.log('조회 기간:', startDate.format('YYYY-MM-DD'), '~', endDate.format('YYYY-MM-DD'));
    console.log('현재 월:', monthDate.format('YYYY-MM'));
    console.log('날짜 범위에 포함된 일 수:', dateRange.length);
    console.log('선택된 층:', selectedFloor);
    console.log('선택된 단체:', selectedReservation ? selectedReservation.group_name : '전체');
    
    // Process room data to group by floor
    const roomsByFloor = processRoomData();
    
    // Check if there's any room data
    if (!roomsByFloor || roomsByFloor.length === 0) {
      console.log('객실 데이터가 없음');
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          객실 데이터가 없습니다.
        </Alert>
      );
    }
    
    // 층별 필터링
    let filteredRoomsByFloor = roomsByFloor;
    if (selectedFloor !== 'all') {
      filteredRoomsByFloor = roomsByFloor.filter(([floor]) => floor === selectedFloor);
      console.log(`${selectedFloor}층으로 필터링된 객실 데이터:`, filteredRoomsByFloor.length);
    }
    
    // 로그
    console.log('===== 필터링된 객실 데이터 =====');
    let totalRooms = 0;
    let totalAssignments = 0;
    
    filteredRoomsByFloor.forEach(([floor, rooms]) => {
      totalRooms += rooms.length;
      console.log(`${floor}층: ${rooms.length}개 객실`);
      
      rooms.forEach(room => {
        const assignmentCount = room.assignments ? Object.keys(room.assignments).length : 0;
        totalAssignments += assignmentCount;
        if (assignmentCount > 0) {
          console.log(`  - 객실: ${room.room_name}, 배정 수: ${assignmentCount}`);
        }
      });
    });
    
    console.log(`총 ${filteredRoomsByFloor.length}개 층, ${totalRooms}개 객실, ${totalAssignments}개 배정`);
    
    // 사용 가능한 모든 층 목록 가져오기
    const availableFloors = [...new Set(roomsByFloor.map(([floor]) => floor))];
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => handlePrevMonth()}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h4" sx={{ mx: 2 }}>
              {monthDate.format('YYYY년 MM월')}
            </Typography>
            <IconButton onClick={() => handleNextMonth()}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* 조회기간 설정 카드 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#d4e6d0', p: 2 }}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
                조회기간 설정
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      label="시작일"
                      value={customStartDate}
                      onChange={(newDate) => setCustomStartDate(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      format="YYYY-MM-DD"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                  <Typography>~</Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      label="종료일"
                      value={customEndDate}
                      onChange={(newDate) => setCustomEndDate(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      format="YYYY-MM-DD"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleCustomDateSearch}
                    fullWidth
                  >
                    검색
                  </Button>
                </Grid>
              </Grid>
              
              {dateError && (
                <Typography color="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                  {dateError}
                </Typography>
              )}
            </Card>
          </Grid>
          
          {/* 조회 중 선택 카드 */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#f7c8ab', p: 2 }}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
                필터 옵션
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>층별 필터</InputLabel>
                    <Select
                      value={selectedFloor}
                      onChange={handleFloorFilterChange}
                      label="층별 필터"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      {availableFloors.map(floor => (
                        <MenuItem key={floor} value={floor}>{floor}층</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
             
              </Grid>
            </Card>
          </Grid>
        </Grid>
        
        <Card sx={{ mb: 4, overflow: 'auto' }}>
          <CardHeader 
            title="객실 배정 현황"
            subheader={`${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')}`}
            action={
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* 단체 선택 드롭다운 */}
                <FormControl sx={{ minWidth: 250 }}>
                  <Autocomplete
                    value={selectedReservation || null}
                    onChange={(event, newValue) => {
                      setSelectedReservation(newValue);
                    }}
                    options={reservationListData?.getPage1List || []}
                    getOptionLabel={(option) => `${option.group_name} (${formatDate(option.start_date)} ~ ${formatDate(option.end_date)})`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="단체 선택"
                        placeholder="전체 보기"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingReservations ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    loading={loadingReservations}
                    disabled={loadingReservations}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {option.group_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(option.start_date)} ~ {formatDate(option.end_date)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  />
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleRoomMealPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? '처리 중...' : 'PDF 다운로드'}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<GetAppIcon />}
                  onClick={handleRoomMealExcel}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? '처리 중...' : '엑셀 다운로드'}
                </Button>
              </Box>
            }
          />
          <Divider />
          <CardContent sx={{ p: 0, overflow: 'auto' }}>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 800, tableLayout: 'fixed' }}>
                {/* 테이블 헤더 */}
                    <TableHead>
                      <TableRow sx={{ height: '24px' }}>
                        <TableCell 
                          align="center"
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            fontWeight: 'bold',
                            position: 'sticky',
                            left: 0,
                            zIndex: 1,
                            width: 80,
                            minWidth: 80,
                            maxWidth: 80,
                            height: '24px',
                            py: 0.5,
                            px: 0.5
                          }}
                        >
                          구분
                        </TableCell>
                        {dateRange.map(date => (
                          <TableCell 
                            key={date.format('YYYY-MM-DD')} 
                            align="center"
                            sx={{ 
                              bgcolor: date.isSame(moment(), 'day') ? 'warning.main' : 'primary.main', 
                              color: 'white',
                              fontWeight: 'bold',
                              width: 80,
                              minWidth: 80,
                              maxWidth: 80,
                              height: '24px',
                              py: 0.5,
                              px: 0.5
                            }}
                          >
                            <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
                              {date.format('M/DD')}
                            </Box>
                            <Typography variant="caption" display="block" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.7rem', lineHeight: 1 }}>
                              ({getDayName(date.day())})
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                
                {/* 테이블 본문 - 층별로 객실 표시 (필터링 적용) */}
                    <TableBody>
                  {filteredRoomsByFloor.map(([floor, rooms]) => (
                    <React.Fragment key={floor}>
                      {/* 층 구분 행 */}
                      <TableRow sx={{ height: '20px' }}>
                          <TableCell 
                          colSpan={dateRange.length + 1}
                          sx={{ 
                            bgcolor: 'grey.200', 
                            fontWeight: 'bold',
                            py: 0.5,
                            height: '20px'
                          }}
                        >
                          {floor}층
                          </TableCell>
                      </TableRow>
                      
                      {/* 각 객실 행 */}
                      {rooms.map(room => (
                        <TableRow key={room.room_id} sx={{ height: '22px' }}>
                          <TableCell 
                            align="center"
                            sx={{ 
                              bgcolor: 'grey.100', 
                              fontWeight: 'bold',
                              position: 'sticky',
                              left: 0,
                              zIndex: 1,
                              width: 80,
                              minWidth: 80,
                              maxWidth: 80,
                              height: '22px',
                              py: 0.5,
                              px: 0.5,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {room.room_name}호
                          </TableCell>
                          
                          {/* 날짜별 셀 */}
                          {(() => {
                            // 연속된 날짜 계산 로직
                            const cells = [];
                            let skipDays = 0;
                            
                            for (let dateIndex = 0; dateIndex < dateRange.length; dateIndex++) {
                              // 이전에 병합된 셀로 인해 건너뛰어야 하는 경우
                              if (skipDays > 0) {
                                skipDays--;
                                continue;
                              }
                              
                              const date = dateRange[dateIndex];
                            const dateStr = date.format('YYYY-MM-DD');
                              const assignment = room.assignments ? room.assignments[dateStr] : null;
                              
                              // 현재 날짜에 배정이 없는 경우 빈 셀 추가
                              if (!assignment) {
                                cells.push(
                                  <TableCell 
                                    key={dateStr} 
                                    align="center"
                                    onClick={() => handleOpenAssignmentDialog(room, dateStr)}
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': { bgcolor: 'grey.200' },
                                      p: 0.5,
                                      border: '1px solid #ddd',
                                      width: 80,
                                      minWidth: 80,
                                      maxWidth: 80,
                                      height: '22px',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                );
                                continue;
                              }
                              
                              // 배정된 객실이지만 필터링에 의해 표시되지 않는 경우
                            const showAssignment = !selectedReservation || 
                              (assignment && assignment.reservation_id === selectedReservation.id);
                            
                              if (!showAssignment) {
                                cells.push(
                              <TableCell 
                                key={dateStr} 
                                align="center"
                                onClick={() => handleOpenAssignmentDialog(room, dateStr)}
                                sx={{ 
                                  cursor: 'pointer',
                                      '&:hover': { bgcolor: 'grey.200' },
                                      p: 0.5,
                                      border: '1px solid #ddd',
                                      width: 80,
                                      minWidth: 80,
                                      maxWidth: 80,
                                      height: '22px',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                );
                                continue;
                              }
                              
                              // 연속된 날짜의 같은 단체 객실 배정 확인
                              let consecutiveDays = 1;
                              let nextDateIndex = dateIndex + 1;
                              
                              while (nextDateIndex < dateRange.length) {
                                const nextDate = dateRange[nextDateIndex];
                                const nextDateStr = nextDate.format('YYYY-MM-DD');
                                const nextAssignment = room.assignments ? room.assignments[nextDateStr] : null;
                                
                                // 다음 날짜에 같은 단체의 배정이 있는지 확인
                                if (nextAssignment && 
                                    nextAssignment.organization === assignment.organization && 
                                    nextAssignment.reservation_id === assignment.reservation_id &&
                                    (!selectedReservation || nextAssignment.reservation_id === selectedReservation.id)) {
                                  consecutiveDays++;
                                  nextDateIndex++;
                                } else {
                                  break;
                                }
                              }
                              
                              // 체크아웃 날짜 포함을 위해 마지막 체크인 이후 하루 더 추가 (체크아웃 날짜)
                              // 단, 다음 날짜가 dateRange 내에 있고, 다른 배정이 없는 경우에만 추가
                              let includeCheckout = false;
                              if (nextDateIndex < dateRange.length) {
                                const checkoutDate = dateRange[nextDateIndex];
                                const checkoutDateStr = checkoutDate.format('YYYY-MM-DD');
                                const checkoutAssignment = room.assignments ? room.assignments[checkoutDateStr] : null;
                                
                                // 체크아웃 날짜에 다른 배정이 없는 경우에만 체크아웃 날짜 포함
                                if (!checkoutAssignment) {
                                  consecutiveDays++;
                                  skipDays++;
                                  includeCheckout = true;
                                }
                              }
                              
                              // 건너뛸 날짜 수 계산
                              skipDays = consecutiveDays - 1;
                              
                              // 연속된 날짜를 병합한 셀 생성
                              cells.push(
                                <TableCell 
                                  key={dateStr} 
                                  align="center"
                                  colSpan={consecutiveDays}
                                  onClick={() => handleOpenDetailModal(assignment)}
                                  sx={{ 
                                    cursor: 'pointer',
                                    bgcolor: '#FFCC33',
                                    '&:hover': { bgcolor: '#FFDD66' },
                                    p: 0.5,
                                    border: '1px solid #ddd',
                                    width: 80 * consecutiveDays,
                                    minWidth: 80,
                                    height: '22px',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                        fontSize: '0.75rem',
                                        lineHeight: 1.1
                                      }}
                                    >
                                      {assignment.organization} ({assignment.occupancy}명)
                                      {consecutiveDays > 1 && ` [${consecutiveDays - (includeCheckout ? 1 : 0)}박`}
                                      {includeCheckout && ` C/O]`}
                                      {!includeCheckout && consecutiveDays > 1 && `]`}
                                  </Typography>
                                  </Box>
                              </TableCell>
                            );
                            }
                            
                            return cells;
                          })()}
                        </TableRow>
                      ))}
                    </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
          </CardContent>
        </Card>
        
        {/* 상세 정보 모달 */}
        <Dialog
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>객실 배정 상세 정보</DialogTitle>
          <DialogContent>
            {selectedAssignment && (
              <Box sx={{ pt: 2 }}>
                {console.log('[디버깅] 모달에 표시되는 데이터:', {
                  단체명: selectedAssignment.organization,
                  인원: selectedAssignment.occupancy,
                  체크인: reservationCheckInOut.checkIn ? formatDate(reservationCheckInOut.checkIn) : '로딩 중...',
                  체크아웃: reservationCheckInOut.checkOut ? formatDate(reservationCheckInOut.checkOut) : '로딩 중...',
                  예약ID: selectedAssignment.reservation_id
                })}
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      <strong>단체명:</strong> {selectedAssignment.organization}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      <strong>이용 인원:</strong> {selectedAssignment.occupancy}명
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                    </Typography>
                  </Grid>
                  
                  {/* 추가: 체크인/체크아웃 날짜 정보 */}
                  {reservationCheckInOut.checkIn ? (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">
                          <strong>체크인 날짜:</strong> {formatDate(reservationCheckInOut.checkIn)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">
                          <strong>체크아웃 날짜:</strong> {formatDate(reservationCheckInOut.checkOut)}
                        </Typography>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="text.secondary">
                        <strong>체크인/체크아웃 정보 로딩 중...</strong>
                      </Typography>
                    </Grid>
                  )}
                  
             
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailModal} color="primary">
              닫기
            </Button>
            {selectedAssignment && (
              <Button 
                onClick={() => {
                  handleCloseDetailModal();
                  // 객실과 날짜를 찾아 삭제 함수 호출
                  const roomWithAssignment = roomData?.getRoomAssignments.find(
                    room => room.assignments && room.assignments.find(a => a.id === selectedAssignment.id)
                  );
                  if (roomWithAssignment) {
                    handleDeleteAssignment(roomWithAssignment, selectedAssignment.date);
                  }
                }} 
                color="error"
              >
                삭제
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Render meal view
  const renderMealView = () => {
    if (!roomData?.getRoomAssignments) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          식사 배정 데이터가 없습니다.
        </Alert>
      );
    }
    
    // Generate a list of all organizations in the selected date range
    const allOrganizations = {};
    
    // Extract unique organization names from room assignments
    roomData.getRoomAssignments.forEach(room => {
      Object.entries(room.assignments).forEach(([date, assignment]) => {
        if (moment(date).isBetween(startDate, endDate, 'day', '[]')) {
          if (!allOrganizations[assignment.organization]) {
            allOrganizations[assignment.organization] = {
              name: assignment.organization,
              reservationId: assignment.reservation_id,
              dates: {}
            };
          }
          
          if (!allOrganizations[assignment.organization].dates[date]) {
            allOrganizations[assignment.organization].dates[date] = {
              breakfast: 0,
              lunch: 0,
              dinner: 0
            };
          }
          
          // Add occupancy count to all meal types
          allOrganizations[assignment.organization].dates[date].breakfast += assignment.occupancy;
          allOrganizations[assignment.organization].dates[date].lunch += assignment.occupancy;
          allOrganizations[assignment.organization].dates[date].dinner += assignment.occupancy;
        }
      });
    });
    
    // Convert to array and filter by selected organization if needed
    const organizationsArray = Object.values(allOrganizations)
      .filter(org => !selectedReservation || org.reservationId === selectedReservation.id);
    
    if (organizationsArray.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          선택한 단체의 식사 데이터가 없습니다.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => handlePrevMonth()}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h4" sx={{ mx: 2 }}>
              {monthDate.format('YYYY년 MM월')}
            </Typography>
            <IconButton onClick={() => handleNextMonth()}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="식사 배정 현황"
            subheader={`${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')}`}
            action={
              <Button
                variant="contained"
                color="secondary"
                startIcon={<GetAppIcon />}
                onClick={handleRoomMealExcel}
                disabled={pdfLoading}
              >
                {pdfLoading ? '처리 중...' : '엑셀 다운로드'}
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {organizationsArray.map(org => (
                <Grid item xs={12} key={org.name}>
                  <Card variant="outlined">
                    <CardHeader title={org.name} />
                    <Divider />
                    <CardContent>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ height: '24px' }}>
                              <TableCell sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white', 
                                fontWeight: 'bold',
                                py: 0.5,
                                px: 1,
                                height: '24px'
                              }}>날짜</TableCell>
                              <TableCell align="center" sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white', 
                                fontWeight: 'bold',
                                py: 0.5,
                                px: 1,
                                height: '24px'
                              }}>조식</TableCell>
                              <TableCell align="center" sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white', 
                                fontWeight: 'bold',
                                py: 0.5,
                                px: 1,
                                height: '24px'
                              }}>중식</TableCell>
                              <TableCell align="center" sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'white', 
                                fontWeight: 'bold',
                                py: 0.5,
                                px: 1,
                                height: '24px'
                              }}>석식</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dateRange.map(date => {
                              const dateStr = date.format('YYYY-MM-DD');
                              const mealData = org.dates[dateStr] || { breakfast: 0, lunch: 0, dinner: 0 };
                              
                              return (
                                <TableRow key={dateStr} sx={{ height: '22px' }}>
                                  <TableCell sx={{ 
                                    bgcolor: date.isSame(moment(), 'day') ? 'warning.light' : 'grey.100',
                                    py: 0.5,
                                    px: 1,
                                    height: '22px',
                                    fontSize: '0.75rem'
                                  }}>
                                    {date.format('MM/DD')} ({date.format('ddd')})
                                  </TableCell>
                                  <TableCell align="center" sx={{ py: 0.5, px: 1, height: '22px', fontSize: '0.75rem' }}>
                                    {mealData.breakfast > 0 ? mealData.breakfast + '명' : '-'}
                                  </TableCell>
                                  <TableCell align="center" sx={{ py: 0.5, px: 1, height: '22px', fontSize: '0.75rem' }}>
                                    {mealData.lunch > 0 ? mealData.lunch + '명' : '-'}
                                  </TableCell>
                                  <TableCell align="center" sx={{ py: 0.5, px: 1, height: '22px', fontSize: '0.75rem' }}>
                                    {mealData.dinner > 0 ? mealData.dinner + '명' : '-'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow sx={{ height: '22px' }}>
                              <TableCell sx={{ fontWeight: 'bold', py: 0.5, px: 1, height: '22px', fontSize: '0.75rem' }}>합계</TableCell>
                              <TableCell align="center" sx={{ 
                                fontWeight: 'bold', 
                                bgcolor: 'success.light',
                                py: 0.5,
                                px: 1,
                                height: '22px',
                                fontSize: '0.75rem'
                              }}>
                                {Object.values(org.dates).reduce((sum, data) => sum + data.breakfast, 0)}명
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                fontWeight: 'bold', 
                                bgcolor: 'success.light', 
                                py: 0.5,
                                px: 1,
                                height: '22px',
                                fontSize: '0.75rem'
                              }}>
                                {Object.values(org.dates).reduce((sum, data) => sum + data.lunch, 0)}명
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                fontWeight: 'bold', 
                                bgcolor: 'success.light',
                                py: 0.5,
                                px: 1,
                                height: '22px',
                                fontSize: '0.75rem'
                              }}>
                                {Object.values(org.dates).reduce((sum, data) => sum + data.dinner, 0)}명
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter reservations based on search term
  const filteredReservations = reservationListData?.getPage1List
    ? reservationListData.getPage1List.filter(reservation => 
        reservation.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.customer_name && reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase())))
    : [];

  // Month navigation handlers
  const handlePrevMonth = () => {
    const newMonthDate = monthDate.clone().subtract(1, 'month');
    setMonthDate(newMonthDate);
    setStartDate(newMonthDate.clone().startOf('month'));
    setEndDate(newMonthDate.clone().endOf('month'));
  };
  
  const handleNextMonth = () => {
    const newMonthDate = monthDate.clone().add(1, 'month');
    setMonthDate(newMonthDate);
    setStartDate(newMonthDate.clone().startOf('month'));
    setEndDate(newMonthDate.clone().endOf('month'));
  };

  // Day click handler for opening sidebar
  const handleDayClick = (day) => {
    setSelectedDay(day);
    
    // Get the data for the clicked day
    const rooms = getRoomsForDay(day);
    const meals = getMealsForDay(day);
    
    console.log('객실 배정 탭: 날짜 클릭', {
      day: day.format('YYYY-MM-DD'),
      rooms: rooms,
      meals: meals
    });
    
    // Open the sidebar
    setSidebarOpen(true);
  };
  
  // Close sidebar handler
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Get rooms for a specific day
  const getRoomsForDay = (day) => {
    if (!roomData?.getRoomAssignments) return [];
    
    const dateStr = day.format('YYYY-MM-DD');
    const roomsForDate = [];
    
    roomData.getRoomAssignments.forEach(room => {
      if (room.assignments) {
        const assignment = room.assignments.find(a => a.date === dateStr);
        if (assignment && (!selectedReservation || assignment.reservation_id === selectedReservation.id)) {
          roomsForDate.push({
            ...room,
            assignment
          });
        }
      }
    });
    
    console.log('객실 배정 탭: getRoomsForDay', {
      date: dateStr,
      roomCount: roomsForDate.length,
      rooms: roomsForDate.map(r => ({
        room_name: r.room_name,
        단체명: r.assignment.organization,
        인원: r.assignment.occupancy
      }))
    });
    
    return roomsForDate;
  };
  
  // Get meal data for a specific day
  const getMealsForDay = (day) => {
    if (!mealData?.getMealStaff) return { breakfast: [], lunch: [], dinner: [] };
    
    const dateStr = day.format('YYYY-MM-DD');
    
    // Find meal data for this day
    const mealsForDate = mealData.getMealStaff.filter(meal => {
      const matchesDate = meal.date === dateStr;
      const matchesReservation = !selectedReservation || 
                                 meal.reservation_id === selectedReservation.id;
      
      return matchesDate && matchesReservation;
    });

    // Group by meal type
    const result = {
      breakfast: mealsForDate.filter(m => m.meal_type === 'breakfast'),
      lunch: mealsForDate.filter(m => m.meal_type === 'lunch'),
      dinner: mealsForDate.filter(m => m.meal_type === 'dinner')
    };
    
    console.log('객실 배정 탭: getMealsForDay', {
      date: dateStr,
      조식: result.breakfast.length,
      중식: result.lunch.length,
      석식: result.dinner.length,
      meals: {
        조식: result.breakfast.map(m => ({ 단체: m.organization, 인원: m.total_count })),
        중식: result.lunch.map(m => ({ 단체: m.organization, 인원: m.total_count })),
        석식: result.dinner.map(m => ({ 단체: m.organization, 인원: m.total_count }))
      }
    });
    
    return result;
  };

  // Sidebar component to show day details
  const DaySidebar = () => {
    if (!selectedDay) return null;
    const day = selectedDay;
    
    // Determine what to show based on active tab
    const isRoomTab = tabValue === 0;
    
    // Get data for this day
    const rooms = getRoomsForDay(day);
    
    // Format day string
    const formattedDay = `${day.format('YYYY년 MM월 DD일')} (${DAYS_OF_WEEK[day.day()]})`;
    
    return (
      <Box sx={{ width: 350, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">상세 정보</Typography>
          <IconButton onClick={handleCloseSidebar}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 3 }}>
          {formattedDay}
        </Typography>
        
        {isRoomTab && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              객실 배정 정보
            </Typography>
            
            {rooms.length > 0 ? (
              <List disablePadding>
                {rooms.map((room, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardHeader
                      title={room.room_name}
                      titleTypographyProps={{ variant: 'subtitle2', fontSize: '0.85rem' }}
                      subheader={`정원: ${room.capacity || '정보 없음'}명`}
                      subheaderTypographyProps={{ fontSize: '0.75rem' }}
                      sx={{ py: 0.5, px: 1 }}
                    />
                    <CardContent sx={{ py: 0.5, px: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                        <strong>단체명:</strong> {room.assignment.organization}
                          </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                        <strong>이용 인원:</strong> {room.assignment.occupancy}명
                          </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary" 
                          onClick={() => handleOpenAssignmentDialog(room, day)}
                          sx={{ mr: 1, py: 0.25, minHeight: '24px', fontSize: '0.75rem' }}
                        >
                          수정
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error" 
                          onClick={() => handleDeleteAssignment(room, day)}
                          sx={{ py: 0.25, minHeight: '24px', fontSize: '0.75rem' }}
                        >
                          삭제
                        </Button>
                        </Box>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                이 날짜에 배정된 객실이 없습니다.
              </Alert>
            )}
            
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => handleOpenAssignmentDialog(null, day)}
                startIcon={<MeetingRoomIcon />}
                disabled={!selectedReservation}
                size="small"
                sx={{ py: 0.5 }}
              >
                객실 배정하기
              </Button>
            </Box>
          </>
        )}
      </Box>
    );
  };


  // Handle inspection search change
  const handleInspectionSearchChange = (event) => {
    setInspectionSearchTerm(event.target.value);
  };

  // Handle selecting a reservation for inspection
  const handleInspectionReservationSelect = async (reservation) => {
    console.log('===== 단체별 조회: 예약 선택 =====');
    console.log('선택된 예약:', reservation);
    console.log('예약 ID:', reservation.id);
    console.log('단체명:', reservation.group_name);
    
    setInspectionSelectedReservation(reservation);
    
    try {
      console.log('===== GraphQL 쿼리 실행 중 =====');
      console.log('쿼리 변수:', { id: reservation.id });
      
      // Get reservation details
      const { data: detailData } = await client.query({
        query: GET_PAGE6_RESERVATION_DETAIL,
        variables: { id: reservation.id },
        fetchPolicy: 'network-only'
      });
      
      console.log('===== GraphQL 응답 데이터 =====');
      console.log('detailData:', detailData);
      console.log('page3 데이터:', detailData?.getPage1ById?.page3);
      
      if (!detailData) {
        throw new Error('예약 상세 정보를 불러올 수 없습니다.');
      }
      
      // Process room data
      console.log('===== 숙박 데이터 처리 =====');
      const rawRoomSelections = detailData.getPage1ById.page3?.room_selections || [];
      console.log('원본 room_selections:', rawRoomSelections);
      console.log('room_selections 타입:', typeof rawRoomSelections);
      
      const parsedRoomSelections = parseJsonData(rawRoomSelections);
      console.log('파싱된 room_selections:', parsedRoomSelections);
      
      const roomAccommodationResult = createAccommodationSection(parsedRoomSelections);
      console.log('숙박 처리 결과:', roomAccommodationResult);
      setAccommodationData(roomAccommodationResult);
      
      // Process meal data
      console.log('===== 식사 데이터 처리 =====');
      const rawMealPlans = detailData.getPage1ById.page3?.meal_plans || [];
      console.log('원본 meal_plans:', rawMealPlans);
      console.log('meal_plans 타입:', typeof rawMealPlans);
      
      const parsedMealPlans = parseJsonData(rawMealPlans);
      console.log('파싱된 meal_plans:', parsedMealPlans);
      
      // createMealSection 함수 호출 (이미 내부에 로그가 있음)
      const finalMealResult = createMealSection(parsedMealPlans);
      console.log('식사 처리 최종 결과:', finalMealResult);
      setInspectionMealData(finalMealResult);
      
      console.log('===== 데이터 처리 완료 =====');
      console.log('accommodationData 설정:', roomAccommodationResult);
      console.log('inspectionMealData 설정:', finalMealResult);
      
    } catch (error) {
      console.error('===== 데이터 로딩 오류 =====');
      console.error('오류 상세:', error);
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      showAlert('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  };

  // Export accommodation and meal data to PDF
  const handleInspectionPdfExport = async () => {
    console.log('===== [PDF] PDF 생성 시작 =====');
    
    if (!inspectionSelectedReservation) {
      showAlert('단체를 선택해주세요.', 'warning');
      return;
    }

    setInspectionPdfLoading(true);

    try {
      console.log('[PDF] 선택된 예약:', inspectionSelectedReservation);
      console.log('[PDF] 예약 기간:', inspectionSelectedReservation.start_date, '~', inspectionSelectedReservation.end_date);
      
      // Get room selection data from page3 (actual data)
      let roomAssignmentData = [];
      
      if (page3Data?.getPage3ByPage1Id?.room_selections) {
        roomAssignmentData = page3Data.getPage3ByPage1Id.room_selections.map(room => ({
          room_name: room.room_name,
          capacity: room.capacity,
          assignments: [{
            date: room.check_in_date,
            occupancy: room.occupancy,
            organization: inspectionSelectedReservation.group_name || ''
          }]
        }));
      }
      
      console.log('[PDF] 객실 배정 데이터:', roomAssignmentData);
      
      // Get meal data - try to get from getMealStaff query first (has detailed counts)
      let mealData = [];
      
      // Try to get meal staff data with detailed counts (youth_count, adult_count, etc.)
      try {
        console.log('[PDF] getMealStaff 쿼리 실행 중...');
        const { data: mealStaffData } = await client.query({
          query: GET_PAGE6_MEAL_STAFF,
          variables: {
            startDate: moment(inspectionSelectedReservation.start_date).format('YYYY-MM-DD'),
            endDate: moment(inspectionSelectedReservation.end_date).format('YYYY-MM-DD'),
            reservationId: inspectionSelectedReservation.id
          },
          fetchPolicy: 'network-only'
        });
        
        console.log('[PDF] getMealStaff 응답:', mealStaffData);
        console.log('[PDF] getMealStaff 데이터 개수:', mealStaffData?.getMealStaff?.length || 0);
        
        if (mealStaffData?.getMealStaff && mealStaffData.getMealStaff.length > 0) {
          console.log('[PDF] getMealStaff 원본 데이터:', mealStaffData.getMealStaff);
          
          // Use meal staff data with detailed counts
          // Also get price information from page3 meal plans
          const mealPlansMap = {};
      if (page3Data?.getPage3ByPage1Id?.meal_plans) {
            console.log('[PDF] page3 meal_plans:', page3Data.getPage3ByPage1Id.meal_plans);
            page3Data.getPage3ByPage1Id.meal_plans.forEach(meal => {
              const key = `${meal.date}_${meal.meal_type}`;
              mealPlansMap[key] = meal;
            });
            console.log('[PDF] mealPlansMap:', mealPlansMap);
          }
          
          mealData = mealStaffData.getMealStaff.map(meal => {
            const key = `${meal.date}_${meal.meal_type}`;
            const mealPlan = mealPlansMap[key];
            const price = mealPlan?.price || 0;
            const participants = meal.total_count || 0;
            const unitPrice = participants > 0 ? Math.round(price / participants) : price;
            
            const result = {
          date: meal.date,
          meal_type: meal.meal_type,
              youth_count: meal.youth_count || 0,
              adult_count: meal.adult_count || 0,
              instructor_count: meal.instructor_count || 0,
              other_count: meal.other_count || 0,
              total_count: meal.total_count || 0,
              participants: participants,
              unitPrice: unitPrice,
              total: price
            };
            
            console.log(`[PDF] mealData 항목 생성: date=${meal.date}, meal_type=${meal.meal_type}, participants=${participants}, total_count=${meal.total_count}, price=${price}, unitPrice=${unitPrice}`);
            return result;
          });
          
          console.log('[PDF] mealData (getMealStaff 기반) 최종:', mealData);
        } else {
          console.log('[PDF] getMealStaff 데이터가 없음, fallback 로직으로 진행');
        }
      } catch (error) {
        console.warn('[PDF] 식사 인원 상세 데이터를 가져오는 중 오류:', error);
      }
      
      // Fallback to page3 meal plans if meal staff data is not available
      if (mealData.length === 0 && page3Data?.getPage3ByPage1Id?.meal_plans) {
        console.log('[PDF] Fallback 1: page3 meal_plans 사용');
        console.log('[PDF] page3 meal_plans 원본:', page3Data.getPage3ByPage1Id.meal_plans);
        mealData = page3Data.getPage3ByPage1Id.meal_plans.map(meal => {
          const price = meal.price || 0;
          const participants = meal.participants || 0;
          const unitPrice = participants > 0 ? Math.round(price / participants) : price;
          const result = {
            date: meal.date,
            meal_type: meal.meal_type,
            participants: participants,
            unitPrice: unitPrice,
            total: price
          };
          console.log(`[PDF] Fallback 1 항목:`, result);
          return result;
        });
        console.log('[PDF] Fallback 1 mealData 최종:', mealData);
      }
      
      // Fallback to existing data if page3 data is not available
      if (mealData.length === 0) {
        console.log('[PDF] Fallback 2: GET_PAGE6_RESERVATION_DETAIL 쿼리 사용');
        // Get detailed reservation data to access raw meal plans
        const { data: detailData } = await client.query({
          query: GET_PAGE6_RESERVATION_DETAIL,
          variables: { id: inspectionSelectedReservation.id },
          fetchPolicy: 'network-only'
        });
        
        console.log('[PDF] Fallback 2 detailData:', detailData);
        
        // Get room assignment data for the selected reservation
        roomAssignmentData = roomData?.getRoomAssignments?.filter(room => 
          room.assignments?.some(assignment => assignment.reservation_id === inspectionSelectedReservation.id)
        ) || [];
        
        // Extract raw meal data from the reservation
        const rawMealPlans = detailData?.getPage1ById?.page3?.meal_plans || [];
        console.log('[PDF] Fallback 2 rawMealPlans:', rawMealPlans);
        const parsedMealPlans = parseJsonData(rawMealPlans);
        console.log('[PDF] Fallback 2 parsedMealPlans:', parsedMealPlans);
        
        // Convert meal plans to the format expected by PDF generator
        mealData = parsedMealPlans.map(meal => {
          const price = meal.price || 0;
          const participants = meal.participants || 0;
          const unitPrice = participants > 0 ? Math.round(price / participants) : price;
          const result = {
          date: meal.date,
          meal_type: meal.meal_type,
            participants: participants,
            unitPrice: unitPrice,
            total: price
          };
          console.log(`[PDF] Fallback 2 항목:`, result);
          return result;
        });
        console.log('[PDF] Fallback 2 mealData 최종:', mealData);
      } else {
        // If we have meal staff data, we need to add price information from page3
        console.log('[PDF] meal staff 데이터가 있음, page3 가격 정보 추가 중...');
        if (page3Data?.getPage3ByPage1Id?.meal_plans) {
          const mealPlansMap = {};
          page3Data.getPage3ByPage1Id.meal_plans.forEach(meal => {
            const key = `${meal.date}_${meal.meal_type}`;
            mealPlansMap[key] = meal;
          });
          console.log('[PDF] 가격 정보 mealPlansMap:', mealPlansMap);
          
          mealData = mealData.map(meal => {
            const key = `${meal.date}_${meal.meal_type}`;
            const mealPlan = mealPlansMap[key];
            if (mealPlan) {
              const price = mealPlan.price || 0;
              const participants = meal.total_count || meal.participants || 0;
              const unitPrice = participants > 0 ? Math.round(price / participants) : price;
              const result = {
                ...meal,
                unitPrice: unitPrice,
                total: price
              };
              console.log(`[PDF] 가격 정보 추가된 항목:`, result);
              return result;
            }
            console.log(`[PDF] 가격 정보 없음 (key=${key}):`, meal);
            return meal;
          });
          console.log('[PDF] 가격 정보 추가 후 mealData:', mealData);
        }
      }
      
      // 화면에 표시되는 inspectionMealData를 사용하여 PDF 생성 (화면과 동일한 데이터 보장)
      console.log('[PDF] ===== 화면 데이터와 동기화 =====');
      console.log('[PDF] inspectionMealData (화면 데이터):', inspectionMealData);
      console.log('[PDF] inspectionMealData.rows:', inspectionMealData?.rows);
      
      // 화면에 표시되는 데이터를 PDF 생성용 형식으로 변환
      if (inspectionMealData && inspectionMealData.rows && inspectionMealData.rows.length > 0) {
        console.log('[PDF] 화면 데이터를 사용하여 mealData 재구성');
        mealData = inspectionMealData.rows.map(row => {
          // meal_type을 영어로 변환
          let mealTypeEn = 'breakfast';
          if (row.type === '조식') mealTypeEn = 'breakfast';
          else if (row.type === '중식') mealTypeEn = 'lunch';
          else if (row.type === '석식') mealTypeEn = 'dinner';
          else if (row.type && row.type.includes('lunch')) mealTypeEn = 'lunch';
          else if (row.type && row.type.includes('dinner')) mealTypeEn = 'dinner';
          else if (row.type && row.type.includes('breakfast')) mealTypeEn = 'breakfast';
          
          const result = {
            date: row.date,
            meal_type: mealTypeEn,
            participants: row.people || 0,
            total_count: row.people || 0,
            unitPrice: row.unitPrice || 0,
            total: row.total || 0
          };
          
          console.log(`[PDF] 화면 데이터 변환: ${row.date} ${row.type} (${row.people}명) -> meal_type=${mealTypeEn}`);
          return result;
        });
        console.log('[PDF] 화면 데이터 기반 mealData:', mealData);
      }
      
      console.log('[PDF] ===== 최종 mealData (PDF 생성 함수에 전달) =====');
      console.log('[PDF] mealData 개수:', mealData.length);
      console.log('[PDF] mealData 전체:', JSON.stringify(mealData, null, 2));
      mealData.forEach((meal, index) => {
        console.log(`[PDF] mealData[${index}]:`, {
          date: meal.date,
          meal_type: meal.meal_type,
          participants: meal.participants,
          total_count: meal.total_count,
          unitPrice: meal.unitPrice,
          total: meal.total
        });
      });
      
      console.log('[PDF] roomAssignmentData:', roomAssignmentData);
      console.log('[PDF] 예약 기간:', inspectionSelectedReservation.start_date, '~', inspectionSelectedReservation.end_date);
      
      // Generate PDF with the new layout matching the image
      console.log('[PDF] generateRoomAssignmentAndMealPDF 함수 호출 시작');
      await generateRoomAssignmentAndMealPDF(inspectionSelectedReservation, roomAssignmentData, mealData);
      console.log('[PDF] generateRoomAssignmentAndMealPDF 함수 호출 완료');
      showAlert('PDF 다운로드가 완료되었습니다.', 'success');
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      showAlert('PDF 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setInspectionPdfLoading(false);
    }
  };

  // Export accommodation and meal data to Excel (editable format)
  const handleInspectionExcelExport = async () => {
    if (!inspectionSelectedReservation) {
      showAlert('단체를 선택해주세요.', 'warning');
      return;
    }

    setInspectionPdfLoading(true);

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Styles
      const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      const defaultStyle = {
        alignment: { vertical: 'center', horizontal: 'center' },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };

      // 1. Accommodation Worksheet
      const accommodationSheetData = [
        [{ v: `${inspectionSelectedReservation.group_name} 숙박 정보`, s: {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: 'center' }
        }}],
        [''], // Empty row
        [
          { v: '일자', s: headerStyle },
          { v: '타입', s: headerStyle },
          { v: '인원', s: headerStyle },
          { v: '박수', s: headerStyle },
          { v: '제공단가', s: headerStyle },
          { v: '소계', s: headerStyle },
          { v: '합계', s: headerStyle }
        ]
      ];

      if (accommodationData && accommodationData.rows && accommodationData.rows.length > 0) {
        accommodationData.rows.forEach(row => {
          accommodationSheetData.push([
            { v: row.date || '', s: defaultStyle },
            { v: row.roomType || '', s: defaultStyle },
            { v: row.roomCount ? `${row.roomCount}명` : '', s: defaultStyle },
            { v: row.nights ? `${row.nights}박` : '', s: defaultStyle },
            { v: row.unitPrice ? formatNumber(row.unitPrice) + '원' : '', s: defaultStyle },
            { v: row.subtotal ? formatNumber(row.subtotal) + '원' : '', s: defaultStyle },
            { v: row.total ? formatNumber(row.total) + '원' : '', s: defaultStyle }
          ]);
        });

        // Total row
        accommodationSheetData.push([
          { v: '총 합계', s: { ...defaultStyle, font: { bold: true } } },
          { v: '', s: defaultStyle },
          { v: '', s: defaultStyle },
          { v: '', s: defaultStyle },
          { v: '', s: defaultStyle },
          { v: accommodationData.totalRoomPrice ? formatNumber(accommodationData.totalRoomPrice) + '원' : '0원', s: { ...defaultStyle, font: { bold: true } } },
          { v: accommodationData.totalRoomPrice ? formatNumber(accommodationData.totalRoomPrice) + '원' : '0원', s: { ...defaultStyle, font: { bold: true } } }
        ]);
      } else {
        accommodationSheetData.push([{ v: '숙박 정보가 없습니다.', s: defaultStyle }]);
      }

      const accommodationWs = XLSX.utils.aoa_to_sheet(accommodationSheetData);

      accommodationWs['!cols'] = [
        { wch: 15 }, // 일자
        { wch: 15 }, // 타입
        { wch: 10 }, // 인원
        { wch: 10 }, // 박수
        { wch: 15 }, // 제공단가
        { wch: 15 }, // 소계
        { wch: 15 }  // 합계
      ];
      XLSX.utils.book_append_sheet(wb, accommodationWs, '숙박 정보');

      // 2. Meal Worksheet
      const mealSheetData = [
        [{ v: `${inspectionSelectedReservation.group_name} 식사 정보`, s: {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: 'center' }
        }}],
        [''], // Empty row
        [
          { v: '날짜', s: headerStyle },
          { v: '구분', s: headerStyle },
          { v: '인원', s: headerStyle },
          { v: '제공단가', s: headerStyle },
          { v: '합계', s: headerStyle }
        ]
      ];

      if (inspectionMealData && inspectionMealData.rows && inspectionMealData.rows.length > 0) {
        inspectionMealData.rows.forEach(row => {
          mealSheetData.push([
            { v: row.date || '', s: defaultStyle },
            { v: row.type || '', s: defaultStyle },
            { v: row.people ? `${row.people}명` : '', s: defaultStyle },
            { v: row.unitPrice ? formatNumber(row.unitPrice) + '원' : '', s: defaultStyle },
            { v: row.total ? formatNumber(row.total) + '원' : '', s: defaultStyle }
          ]);
        });

        // Total row
        mealSheetData.push([
          { v: '총 합계', s: { ...defaultStyle, font: { bold: true } } },
          { v: '', s: defaultStyle },
          { v: '', s: defaultStyle },
          { v: '', s: defaultStyle },
          { v: inspectionMealData.totalMealPrice ? formatNumber(inspectionMealData.totalMealPrice) + '원' : '0원', s: { ...defaultStyle, font: { bold: true } } }
        ]);
      } else {
        mealSheetData.push([{ v: '식사 정보가 없습니다.', s: defaultStyle }]);
      }

      const mealWs = XLSX.utils.aoa_to_sheet(mealSheetData);

      mealWs['!cols'] = [
        { wch: 15 }, // 날짜
        { wch: 15 }, // 구분
        { wch: 10 }, // 인원
        { wch: 15 }, // 제공단가
        { wch: 15 }  // 합계
      ];
      XLSX.utils.book_append_sheet(wb, mealWs, '식사 정보');

      // Generate file name
      const fileName = `${inspectionSelectedReservation.group_name}_숙박식사정보_${moment().format('YYYYMMDD')}.xlsx`;

      // Save the workbook
      XLSX.writeFile(wb, fileName);

      showAlert('엑셀 파일이 생성되었습니다.', 'success');
    } catch (error) {
      console.error('Excel export error:', error);
      showAlert('엑셀 파일 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
      setInspectionPdfLoading(false);
    }
  };

  // Filter reservations for inspection tab
  const getFilteredReservationsForInspection = () => {
    if (!reservationListData?.getPage1List) return [];
    
    return reservationListData.getPage1List.filter(item => {
      if (!inspectionSearchTerm) return true;
      
      return (
        (item.group_name && item.group_name.toLowerCase().includes(inspectionSearchTerm.toLowerCase())) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(inspectionSearchTerm.toLowerCase()))
      );
    });
  };

  // Render the inspection tab content
  const renderInspectionContent = () => {
    return (
      <Box>
        <Grid container spacing={3}>
          {/* Left panel - reservation list */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  단체 목록
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="단체명 또는 예약자명 검색..."
                  value={inspectionSearchTerm}
                  onChange={handleInspectionSearchChange}
                  InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ mb: 2 }}
                />
             
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {loadingReservations ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  getFilteredReservationsForInspection().map(reservation => (
                    <Box
                      key={reservation.id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: inspectionSelectedReservation?.id === reservation.id ? 'primary.light' : 'background.paper',
                        '&:hover': {
                          bgcolor: inspectionSelectedReservation?.id === reservation.id ? 'primary.light' : 'action.hover',
                        },
                        border: '1px solid',
                        borderColor: inspectionSelectedReservation?.id === reservation.id ? 'primary.main' : 'divider',
                      }}
                      onClick={() => handleInspectionReservationSelect(reservation)}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {reservation.group_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reservation.customer_name || '담당자 미지정'} | {formatDateKorean(reservation.start_date)} ~ {formatDateKorean(reservation.end_date)}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Right panel - detail view */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {inspectionSelectedReservation ? (
                <>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {inspectionSelectedReservation.group_name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {formatDateKorean(inspectionSelectedReservation.start_date)} ~ {formatDateKorean(inspectionSelectedReservation.end_date)}
                        {inspectionSelectedReservation.total_count && ` | 총 ${inspectionSelectedReservation.total_count}명`}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={handleInspectionPdfExport}
                      startIcon={<PictureAsPdfIcon />}
                      disabled={inspectionPdfLoading}
                      sx={{ minWidth: 200 }}
                    >
                      {inspectionPdfLoading ? '처리 중...' : '식사, 숙소정보 PDF 다운로드'}
                    </Button>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Accommodation section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <HotelIcon sx={{ mr: 1 }} />
                      숙박 정보
                    </Typography>
                    
                    {accommodationData.rows.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                              <TableCell align="center">일자</TableCell>
                              <TableCell align="center">타입</TableCell>
                              <TableCell align="center">인원</TableCell>
                              <TableCell align="center">박수</TableCell>
                              <TableCell align="center">제공단가</TableCell>
                              <TableCell align="center">소계</TableCell>
                              <TableCell align="center">합계</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {accommodationData.rows.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell align="center">{row.date}</TableCell>
                                <TableCell align="center">{row.roomType}</TableCell>
                                <TableCell align="center">{row.roomCount}명</TableCell>
                                <TableCell align="center">{row.nights}박</TableCell>
                                <TableCell align="right">{formatNumber(row.unitPrice)}원</TableCell>
                                <TableCell align="right">{formatNumber(row.subtotal)}원</TableCell>
                                <TableCell align="right">{formatNumber(row.total)}원</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={5} align="right">
                                <Typography variant="subtitle1" fontWeight="bold">총 합계:</Typography>
                              </TableCell>
                              <TableCell colSpan={2} align="right">
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                  {formatNumber(accommodationData.totalRoomPrice)}원
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        숙박 정보가 없습니다.
                      </Alert>
                    )}
                  </Box>

                  {/* Meal section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <RestaurantIcon sx={{ mr: 1 }} />
                      식사 정보
                    </Typography>
                    
                    {(() => {
                      console.log('[화면] ===== 식사 정보 테이블 렌더링 =====');
                      console.log('[화면] inspectionMealData:', inspectionMealData);
                      console.log('[화면] inspectionMealData.rows:', inspectionMealData?.rows);
                      console.log('[화면] inspectionMealData.rows.length:', inspectionMealData?.rows?.length || 0);
                      if (inspectionMealData?.rows && inspectionMealData.rows.length > 0) {
                        console.log('[화면] 화면에 표시될 식사 데이터:');
                        inspectionMealData.rows.forEach((row, index) => {
                          console.log(`[화면]   행 ${index + 1}:`, {
                            date: row.date,
                            type: row.type,
                            people: row.people,
                            unitPrice: row.unitPrice,
                            total: row.total
                          });
                        });
                      }
                      return null;
                    })()}
                    {inspectionMealData.rows.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                              <TableCell align="center">날짜</TableCell>
                              <TableCell align="center">구분</TableCell>
                              <TableCell align="center">인원</TableCell>
                              <TableCell align="center">제공단가</TableCell>
                              <TableCell align="center">합계</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {inspectionMealData.rows.map((row, index) => {
                              console.log(`[화면] 테이블 행 렌더링 ${index + 1}:`, row);
                              return (
                              <TableRow key={index}>
                                <TableCell align="center">{row.date}</TableCell>
                                <TableCell align="center">{row.type}</TableCell>
                                <TableCell align="center">{row.people}</TableCell>
                                <TableCell align="right">{formatNumber(row.unitPrice)}원</TableCell>
                                <TableCell align="right">{formatNumber(row.total)}원</TableCell>
                              </TableRow>
                              );
                            })}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={4} align="right">
                                <Typography variant="subtitle1" fontWeight="bold">총 합계:</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                  {formatNumber(inspectionMealData.totalMealPrice)}원
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        식사 정보가 없습니다.
                      </Alert>
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                  <Typography color="text.secondary">
                    왼쪽에서 단체를 선택하세요
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Get the total occupancy for a day
  const getTotalOccupancyForDay = (day) => {
    const rooms = getRoomsForDay(day);
    return rooms.reduce((sum, room) => sum + (room.assignment?.occupancy || 0), 0);
  };
  
  // Get the total meal counts for a day
  const getTotalMealsForDay = (day) => {
    const meals = getMealsForDay(day);
    
    const breakfast = meals.breakfast.reduce((sum, m) => sum + (m.total_count || 0), 0);
    const lunch = meals.lunch.reduce((sum, m) => sum + (m.total_count || 0), 0);
    const dinner = meals.dinner.reduce((sum, m) => sum + (m.total_count || 0), 0);
    
    return { breakfast, lunch, dinner, total: breakfast + lunch + dinner };
  };

  // 요일 이름 가져오기 함수
  const getDayName = (dayIndex) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayIndex];
  };

  // 해당 월의 모든 날짜 배열 가져오기
  const getDaysInMonth = (date) => {
    const daysInMonth = [];
    const year = date.year();
    const month = date.month();
    const lastDay = date.daysInMonth();
    
    for (let i = 1; i <= lastDay; i++) {
      daysInMonth.push(dayjs(new Date(year, month, i)));
    }
    
    return daysInMonth;
  };

  // Calendar view rendering function
  const renderCalendarView = () => {
    console.log('===== 객실 배정 탭: 캘린더 뷰 렌더링 =====');
    console.log('현재 탭:', tabValue === 0 ? '객실 배정' : tabValue === 1 ? '단체별 조회' : '기타');
    console.log('날짜 범위:', startDate.format('YYYY-MM-DD'), '~', endDate.format('YYYY-MM-DD'));
    console.log('선택된 단체:', selectedReservation ? selectedReservation.group_name : '전체');
    
    if (roomData && roomData.getRoomAssignments) {
      console.log('쿼리 결과 데이터:', {
        객실수: roomData.getRoomAssignments.length,
        날짜범위: `${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')}`,
        조회기간일수: dateRange.length
      });
      
      // 층별 객실 수와 배정 수 계산
      const floorStats = {};
      let totalAssignments = 0;
      
      roomData.getRoomAssignments.forEach(room => {
        const floor = room.floor || '1';
        if (!floorStats[floor]) {
          floorStats[floor] = { rooms: 0, assignments: 0 };
        }
        
        floorStats[floor].rooms++;
        const assignmentCount = room.assignments?.length || 0;
        floorStats[floor].assignments += assignmentCount;
        totalAssignments += assignmentCount;
      });
      
      console.log('층별 통계:');
      Object.entries(floorStats).forEach(([floor, stats]) => {
        console.log(`${floor}층: ${stats.rooms}개 객실, ${stats.assignments}개 배정`);
      });
      console.log(`총 배정 수: ${totalAssignments}`);
    } else {
      console.log('객실 배정 데이터가 없거나 로딩 중');
    }
    
    // Room view in table format
    if (tabValue === 0) {
      console.log('객실 배정 뷰 렌더링 시작');
      return renderRoomAssignmentsView();
    }
      
    console.log('일치하는 탭 컨텐츠 없음');
        return (
          <Alert severity="info" sx={{ mt: 3 }}>
        선택한 탭에 해당하는 내용이 없습니다.
          </Alert>
        );
  };

  // 모달 열기 함수
  const handleOpenDetailModal = async (assignment) => {
    console.log('[디버깅] 객실 상세 정보 모달 열기:', assignment);

    // Set the basic assignment info immediately to show the modal faster
    setSelectedAssignment(assignment);
    setDetailModalOpen(true);
    
    // Clear previous dates while loading
    setReservationCheckInOut({ checkIn: null, checkOut: null });
    
    // Find the room this assignment belongs to
    const room = roomData?.getRoomAssignments.find(
      r => r.assignments && Object.values(r.assignments).some(a => a.id === assignment.id)
    );
    
    if (!room) {
      console.error('객실 정보를 찾을 수 없습니다:', assignment);
      return;
    }
    
    console.log('[디버깅] 선택된 객실 정보:', {
      room_id: room.room_id,
      room_name: room.room_name,
      배정ID: assignment.id,
      단체명: assignment.organization,
      인원: assignment.occupancy,
      예약ID: assignment.reservation_id
    });
    
    try {
      // Get the room-specific check-in/out dates
      const dates = await getRoomCheckInOutDates(room.room_id, assignment.reservation_id);
      
      // Update the state with the retrieved dates
      setReservationCheckInOut(dates);
      
      console.log('[디버깅] 객실 모달에 표시될 체크인/체크아웃 날짜:', {
        체크인: dates.checkIn,
        체크아웃: dates.checkOut
      });
    } catch (error) {
      console.error('예약 정보 로딩 중 오류:', error);
    }
  };

  // 모달 닫기 함수
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
  };

  // 커스텀 날짜 검색 처리 함수
  const handleCustomDateSearch = () => {
    // 날짜 간격이 31일을 초과하는지 확인
    const diffDays = customEndDate.diff(customStartDate, 'days') + 1;
    
    if (diffDays > 31) {
      setDateError('검색 기간은 최대 31일로 제한됩니다.');
      return;
    }
    
    setDateError('');
    setStartDate(customStartDate);
    setEndDate(customEndDate);
    
    // 새 날짜로 데이터 다시 불러오기
    if (refetchRooms) {
      refetchRooms({
        startDate: customStartDate.format('YYYY-MM-DD'),
        endDate: customEndDate.format('YYYY-MM-DD')
      });
    }
    
    console.log('커스텀 날짜 검색:', {
      시작일: customStartDate.format('YYYY-MM-DD'),
      종료일: customEndDate.format('YYYY-MM-DD'),
      날짜수: diffDays
    });
  };

  // 층별 필터링 처리 함수
  const handleFloorFilterChange = (event) => {
    setSelectedFloor(event.target.value);
  };

  // Add a function to format dates for display in Korean format
  const formatDateKorean = (dateString) => {
    if (!dateString) return '';
    const formatted = moment(dateString).format('YYYY년 MM월 DD일');
    // Remove trailing '0' if exists (format issue)
    return formatted.replace(/0$/, '');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('YYYY-MM-DD');
  };

  // Enhanced function to get room-specific check-in/out dates
  const getRoomCheckInOutDates = async (roomId, reservationId) => {
    try {
      // First check if we can get the dates from page3 room_selections (most accurate)
      const { data: page3Data } = await client.query({
        query: gql`
          query GetRoomSelectionDates($page1Id: Int!) {
            getPage3ByPage1Id(page1Id: $page1Id) {
              room_selections {
                room_id
                check_in_date
                check_out_date
              }
            }
          }
        `,
        variables: { page1Id: reservationId },
        fetchPolicy: 'network-only'
      });

      // Check if we have room selection data
      if (page3Data?.getPage3ByPage1Id?.room_selections) {
        const roomSelection = page3Data.getPage3ByPage1Id.room_selections.find(
          selection => selection.room_id === roomId.toString()
        );

        if (roomSelection) {
          console.log('[디버깅] 객실별 체크인/체크아웃 정보 (page3):', {
            room_id: roomId,
            체크인: roomSelection.check_in_date,
            체크아웃: roomSelection.check_out_date
          });
          return {
            checkIn: roomSelection.check_in_date,
            checkOut: roomSelection.check_out_date
          };
        }
      }

      // If not found in page3, try RoomManage records
      const { data: roomManageData } = await client.query({
        query: gql`
          query GetRoomManageDates($page1Id: Int!) {
            getRoomManageByPage1Id(page1Id: $page1Id) {
              id
              room_id
              check_in_date
              check_out_date
            }
          }
        `,
        variables: { 
          page1Id: reservationId 
        },
        fetchPolicy: 'network-only'
      });

      if (roomManageData?.getRoomManageByPage1Id) {
        const roomManage = roomManageData.getRoomManageByPage1Id.find(
          record => record.room_id === parseInt(roomId)
        );

        if (roomManage) {
          console.log('[디버깅] 객실별 체크인/체크아웃 정보 (RoomManage):', {
            room_id: roomId,
            체크인: roomManage.check_in_date,
            체크아웃: roomManage.check_out_date
          });
          return {
            checkIn: roomManage.check_in_date,
            checkOut: roomManage.check_out_date
          };
        }
      }

      // Fallback to page1 general dates
      const { data: page1Data } = await client.query({
        query: GET_PAGE6_RESERVATION_DETAIL,
        variables: { id: reservationId },
        fetchPolicy: 'network-only'
      });

      if (page1Data?.getPage1ById) {
        console.log('[디버깅] 단체 전체 체크인/체크아웃 정보 (fallback):', {
          체크인: page1Data.getPage1ById.start_date,
          체크아웃: page1Data.getPage1ById.end_date
        });
        return {
          checkIn: page1Data.getPage1ById.start_date,
          checkOut: page1Data.getPage1ById.end_date
        };
      }

      return { checkIn: null, checkOut: null };
    } catch (error) {
      console.error('객실별 체크인/체크아웃 정보 조회 중 오류:', error);
      return { checkIn: null, checkOut: null };
    }
  };

  if (loadingReservations) {
    return (
      <Page6Layout
        title="식사/숙소 현황"
        icon={<HotelIcon fontSize="large" />}
        activeTab="room-assignment"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress size={24} />
        </Box>
      </Page6Layout>
    );
  }
  
  if (errorReservations) {
    return (
      <Page6Layout
        title="식사/숙소 현황"
        icon={<HotelIcon fontSize="large" />}
        activeTab="room-assignment"
      >
        <Alert severity="error">
          데이터를 불러오는 중 오류가 발생했습니다: {errorReservations.message}
        </Alert>
      </Page6Layout>
    );
  }

  return (
    <Page6Layout
      title="객실 배정 및 식사 현황"
      icon={<MeetingRoomIcon fontSize="large" />}
      activeTab="room-assignment"
    >
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<CalendarIcon />} 
            label="객실 배정" 
            iconPosition="start" 
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="단체별 조회 (숙박 식사)" 
            iconPosition="start" 
          />
        </Tabs>
      </Box>
      
      {/* Room assignment tab */}
      <TabPanel value={tabValue} index={0}>
        {renderCalendarView()}
      </TabPanel>

      {/* New inspection tab */}
      <TabPanel value={tabValue} index={1}>
        {renderInspectionContent()}
      </TabPanel>
      
      {/* Assignment dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>객실 배정</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="객실 정보"
                value={selectedRoom ? `${selectedRoom.room_name} (정원: ${selectedRoom.capacity}명)` : ''}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="배정일"
                value={selectedDate.format('YYYY-MM-DD')}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="단체명"
                value={selectedReservation?.group_name || ''}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="이용 인원"
                type="number"
                value={assignmentData.occupancy}
                onChange={(e) => handleAssignmentDataChange('occupancy', e.target.value)}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button 
            onClick={handleSaveAssignment} 
            variant="contained" 
            color="primary"
            disabled={savingAssignment}
          >
            {savingAssignment ? <CircularProgress size={24} /> : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Day details sidebar */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={handleCloseSidebar}
      >
        <DaySidebar />
      </Drawer>
    </Page6Layout>
  );
};

export default RoomAssignmentTab; 