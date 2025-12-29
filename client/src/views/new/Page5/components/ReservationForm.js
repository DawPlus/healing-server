import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko as koLocale } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { actions, getState } from 'store/reducers/new5Reducer';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventNoteIcon from '@mui/icons-material/EventNote';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Services
import { savePage5Data } from '../services/dataService';

// 더미 객실 데이터
const dummyRooms = [
  { id: 1, name: '스탠다드 A', type: '숙박', capacity: 2, price: 80000 },
  { id: 2, name: '스탠다드 B', type: '숙박', capacity: 2, price: 80000 },
  { id: 3, name: '스탠다드 C', type: '숙박', capacity: 2, price: 80000 },
  { id: 4, name: '디럭스 A', type: '숙박', capacity: 4, price: 120000 },
  { id: 5, name: '디럭스 B', type: '숙박', capacity: 4, price: 120000 },
  { id: 6, name: '스위트 A', type: '숙박', capacity: 6, price: 180000 },
  { id: 7, name: '대강당', type: '대관', capacity: 100, price: 300000 },
  { id: 8, name: '세미나실 A', type: '대관', capacity: 30, price: 150000 },
  { id: 9, name: '세미나실 B', type: '대관', capacity: 20, price: 100000 },
  { id: 10, name: '다목적실', type: '대관', capacity: 50, price: 200000 },
];

// 더미 식사 옵션
const dummyMealOptions = [
  { id: 1, name: '조식', price: 10000 },
  { id: 2, name: '중식', price: 15000 },
  { id: 3, name: '석식', price: 15000 },
  { id: 4, name: '연회식', price: 25000 },
];

// 더미 프로그램 옵션
const dummyProgramOptions = [
  { id: 1, name: '힐링 프로그램', price: 50000 },
  { id: 2, name: '명상 객실예약', price: 30000 },
  { id: 3, name: '숲속 트레킹', price: 20000 },
  { id: 4, name: '팀빌딩', price: 40000 },
];

const ReservationForm = ({ editId, onBack, onNavigateToEdit, previousPageData }) => {
  const dispatch = useDispatch();
  const { isLoading = false, formData: reduxFormData } = useSelector(getState);
  
  // 로컬 로딩 상태 관리
  const [localLoading, setLocalLoading] = useState(false);
  
  // 문서 생성 대화상자 상태
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState(null);
  
  // 정렬 순서 상태
  const [sortOrder, setSortOrder] = useState('asc');
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    organization: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    startDate: moment(),
    endDate: moment().add(1, 'days'),
    numberOfPeople: 1,
    status: 'pending',
    rooms: [],
    meals: [],
    programs: [],
    note: '',
    page1_id: null,
    // Fields for page integration
    visit_type: '',
    purpose: '',
    male_count: 0,
    female_count: 0,
    total_count: 0,
    male_leader_count: 0,
    female_leader_count: 0,
    total_leader_count: 0,
    activities: [],
    page2_programs: [],
    page3_meals: [],
    project_name: '',
    material_total: 0,
    etc_expense_total: 0,
    total_budget: 0,
    materials: [],
    etcExpenses: []
  });
  
  // 에러 상태 관리
  const [errors, setErrors] = useState({});
  
  // Data from previous pages state
  const [hasPreviousData, setHasPreviousData] = useState(false);
  
  // 데이터 소스 표시를 위한 상태
  const [expandedSections, setExpandedSections] = useState({
    page1: true,
    page2: false,
    page3: false,
    page4: false
  });
  
  // Add navigate hook
  const navigate = useNavigate();
  
  // 데이터 통합 - previousPageData가 있는 경우 사용
  useEffect(() => {
    if (previousPageData && (previousPageData.page1 || previousPageData.page2 || previousPageData.page3 || previousPageData.page4)) {
      console.log('Previous page data detected:', previousPageData);
      setHasPreviousData(true);
      
      // Let's integrate all the data
      const { page1, page2, page3, page4 } = previousPageData;
      
      // Start with an integrated form data object
      const integratedData = { ...formData };
      
      // Integrate Page1 data
      if (page1) {
        integratedData.organization = page1.organization_name || '';
        integratedData.contactName = page1.contact_name || '';
        integratedData.contactPhone = page1.contact_phone || '';
        integratedData.contactEmail = page1.contact_email || '';
        integratedData.startDate = page1.visit_date ? moment(page1.visit_date) : moment();
        integratedData.endDate = page1.end_date ? moment(page1.end_date) : moment().add(1, 'days');
        integratedData.visit_type = page1.visit_type || '';
        integratedData.purpose = page1.purpose || '';
        integratedData.page1_id = page1.id || null;
      }
      
      // Integrate Page2 data
      if (page2) {
        integratedData.male_count = page2.male_count || 0;
        integratedData.female_count = page2.female_count || 0;
        integratedData.total_count = page2.total_count || 0;
        integratedData.male_leader_count = page2.male_leader_count || 0;
        integratedData.female_leader_count = page2.female_leader_count || 0;
        integratedData.total_leader_count = page2.total_leader_count || 0;
        integratedData.numberOfPeople = page2.total_count || 1;
        
        // Page2 programs (special handling for array data)
        if (Array.isArray(page2.programs)) {
          integratedData.page2_programs = page2.programs;
          
          // Also add these programs to the reservation
          const programsToAdd = page2.programs.map(program => {
            // Find a matching dummy program or create a basic one
            const matchingProgram = dummyProgramOptions.find(p => p.name === program.name) || 
              { name: program.name, price: program.cost || 0 };
            
            return {
              id: program.id || `temp_${Date.now()}_${Math.random()}`,
              name: program.name,
              price: program.cost || matchingProgram.price,
              quantity: 1,
              discount: 0,
              total: program.cost || matchingProgram.price
            };
          });
          
          integratedData.programs = programsToAdd;
        }
      }
      
      // Integrate Page3 data
      if (page3) {
        integratedData.activities = page3.activities || [];
        
        // Add meals from page3
        if (Array.isArray(page3.meals)) {
          integratedData.page3_meals = page3.meals;
          
          // Add these meals to the reservation
          const mealsToAdd = page3.meals.map(meal => {
            // Find a matching dummy meal or create a basic one
            const matchingMeal = dummyMealOptions.find(m => m.name === meal.name) || 
              { name: meal.name, price: meal.cost || 0 };
            
            return {
              id: meal.id || `temp_${Date.now()}_${Math.random()}`,
              name: meal.name,
              price: meal.cost || matchingMeal.price,
              quantity: meal.quantity || integratedData.numberOfPeople,
              discount: 0,
              total: (meal.cost || matchingMeal.price) * (meal.quantity || integratedData.numberOfPeople)
            };
          });
          
          integratedData.meals = mealsToAdd;
        }
      }
      
      // Integrate Page4 data
      if (page4) {
        integratedData.project_name = page4.project_name || '';
        integratedData.material_total = page4.material_total || 0;
        integratedData.etc_expense_total = page4.etc_expense_total || 0;
        integratedData.total_budget = page4.total_budget || 0;
        integratedData.materials = page4.materials || [];
        integratedData.etcExpenses = page4.etcExpenses || [];
      }
      
      // Update the form with integrated data
      setFormData(integratedData);
      console.log('Integrated form data:', integratedData);
    }
  }, [previousPageData]);
  
  // 편집 모드인 경우 데이터 불러오기
  useEffect(() => {
    if (editId) {
      dispatch(actions.fetchReservation(editId));
    }
  }, [dispatch, editId]);
  
  // 불러온 데이터가 있으면 폼에 채우기
  useEffect(() => {
    if (reduxFormData && reduxFormData.id) {
      try {
        // 날짜 처리 로직 통합
        let startDate = moment();
        let endDate = moment().add(1, 'days');
        
        // 날짜 처리 - 다양한 형식 지원
        if (reduxFormData.reservation_date) {
          // 유닉스 타임스탬프 형식인 경우
          if (typeof reduxFormData.reservation_date === 'number') {
            startDate = moment.unix(reduxFormData.reservation_date);
          } 
          // 객체 형식(서버 응답)인 경우
          else if (typeof reduxFormData.reservation_date === 'object' && reduxFormData.reservation_date !== null) {
            if (reduxFormData.reservation_date.unix) {
              startDate = moment.unix(reduxFormData.reservation_date.unix);
            } else if (reduxFormData.reservation_date.formatted) {
              startDate = moment(reduxFormData.reservation_date.formatted);
            } else if (reduxFormData.reservation_date.raw) {
              startDate = moment(reduxFormData.reservation_date.raw);
            }
          }
          // 문자열인 경우
          else if (typeof reduxFormData.reservation_date === 'string') {
            // 날짜가 유효한지 확인
            const parsedDate = moment(reduxFormData.reservation_date);
            if (parsedDate.isValid() && reduxFormData.reservation_date !== '0000-00-00') {
              startDate = parsedDate;
            }
          }
        }
        
        // details에서 체크아웃 날짜 (endDate) 가져오기
        let details = {};
        if (reduxFormData.details) {
          if (typeof reduxFormData.details === 'string') {
            try {
              details = JSON.parse(reduxFormData.details);
            } catch (e) {
              console.error('Details parsing error:', e);
            }
          } else {
            details = reduxFormData.details;
          }
          
          // details에서 endDate 처리
          if (details.endDate) {
            // 유닉스 타임스탬프인 경우
            if (typeof details.endDate === 'number') {
              endDate = moment.unix(details.endDate);
            } 
            // 문자열인 경우
            else if (typeof details.endDate === 'string') {
              const parsedEndDate = moment(details.endDate);
              if (parsedEndDate.isValid()) {
                endDate = parsedEndDate;
              }
            }
          } else {
            // endDate가 없으면 startDate + 1일로 설정
            endDate = moment(startDate).add(1, 'days');
          }
        }
        
        console.log('날짜 변환 결과:', {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        });
        
        setFormData(prevFormData => ({
          ...prevFormData,
          id: reduxFormData.id,
          organization: reduxFormData.organization_name || '',
          contactName: reduxFormData.contact_name || '',
          contactPhone: reduxFormData.contact_phone || '',
          contactEmail: reduxFormData.contact_email || '',
          startDate,
          endDate,
          numberOfPeople: details.numberOfPeople || 1,
          status: reduxFormData.reservation_status || 'pending',
          rooms: details.rooms || [],
          meals: details.meals || [],
          programs: details.programs || [],
          note: details.note || '',
          page1_id: reduxFormData.page1_id || null,
          // Additional fields from different pages
          visit_type: details.visit_type || '',
          purpose: details.purpose || '',
          male_count: details.male_count || 0,
          female_count: details.female_count || 0,
          total_count: details.total_count || 0,
          male_leader_count: details.male_leader_count || 0,
          female_leader_count: details.female_leader_count || 0,
          total_leader_count: details.total_leader_count || 0,
          activities: details.activities || [],
          page2_programs: details.page2_programs || [],
          page3_meals: details.page3_meals || [],
          project_name: details.project_name || '',
          material_total: details.material_total || 0,
          etc_expense_total: details.etc_expense_total || 0,
          total_budget: details.total_budget || 0,
          materials: details.materials || [],
          etcExpenses: details.etcExpenses || []
        }));
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      }
    }
  }, [reduxFormData]);
  
  // 입력값 변경 핸들러
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // 날짜 변경 핸들러
  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    
    // 날짜 유효성 검사
    if (name === 'startDate' && moment(date).isAfter(formData.endDate)) {
      setFormData(prev => ({ ...prev, endDate: moment(date).add(1, 'days') }));
    }
  };
  
  // 객실 추가 핸들러
  const handleAddRoom = (roomId) => {
    const existingRoom = formData.rooms.find(r => r.roomId === roomId);
    if (existingRoom) {
      // 이미 있는 객실이면 수량 증가
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => 
          r.roomId === roomId 
            ? { ...r, quantity: r.quantity + 1 } 
            : r
        )
      }));
    } else {
      // 없으면 새로 추가
      const room = dummyRooms.find(r => r.id === roomId);
      setFormData(prev => ({
        ...prev,
        rooms: [...prev.rooms, { 
          roomId: roomId, 
          name: room.name, 
          price: room.price, 
          quantity: 1,
          discount: 0
        }]
      }));
    }
  };
  
  // 객실 삭제 핸들러
  const handleRemoveRoom = (roomId) => {
    const existingRoom = formData.rooms.find(r => r.roomId === roomId);
    if (existingRoom && existingRoom.quantity > 1) {
      // 수량이 1보다 크면 수량 감소
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => 
          r.roomId === roomId 
            ? { ...r, quantity: r.quantity - 1 } 
            : r
        )
      }));
    } else {
      // 수량이 1이면 완전히 삭제
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.filter(r => r.roomId !== roomId)
      }));
    }
  };
  
  // 식사 추가 핸들러
  const handleAddMeal = (mealId) => {
    const existingMeal = formData.meals.find(m => m.mealId === mealId);
    if (existingMeal) {
      // 이미 있는 식사면 수량 증가
      setFormData(prev => ({
        ...prev,
        meals: prev.meals.map(m => 
          m.mealId === mealId 
            ? { ...m, quantity: m.quantity + 1 } 
            : m
        )
      }));
    } else {
      // 없으면 새로 추가
      const meal = dummyMealOptions.find(m => m.id === mealId);
      setFormData(prev => ({
        ...prev,
        meals: [...prev.meals, { 
          mealId: mealId, 
          name: meal.name, 
          price: meal.price, 
          quantity: 1,
          discount: 0
        }]
      }));
    }
  };
  
  // 식사 삭제 핸들러
  const handleRemoveMeal = (mealId) => {
    const existingMeal = formData.meals.find(m => m.mealId === mealId);
    if (existingMeal && existingMeal.quantity > 1) {
      // 수량이 1보다 크면 수량 감소
      setFormData(prev => ({
        ...prev,
        meals: prev.meals.map(m => 
          m.mealId === mealId 
            ? { ...m, quantity: m.quantity - 1 } 
            : m
        )
      }));
    } else {
      // 수량이 1이면 완전히 삭제
      setFormData(prev => ({
        ...prev,
        meals: prev.meals.filter(m => m.mealId !== mealId)
      }));
    }
  };
  
  // 프로그램 추가 핸들러
  const handleAddProgram = (programId) => {
    const existingProgram = formData.programs.find(p => p.programId === programId);
    if (existingProgram) {
      // 이미 있는 프로그램이면 수량 증가
      setFormData(prev => ({
        ...prev,
        programs: prev.programs.map(p => 
          p.programId === programId 
            ? { ...p, quantity: p.quantity + 1 } 
            : p
        )
      }));
    } else {
      // 없으면 새로 추가
      const program = dummyProgramOptions.find(p => p.id === programId);
      setFormData(prev => ({
        ...prev,
        programs: [...prev.programs, { 
          programId: programId, 
          name: program.name, 
          price: program.price, 
          quantity: 1,
          discount: 0
        }]
      }));
    }
  };
  
  // 프로그램 삭제 핸들러
  const handleRemoveProgram = (programId) => {
    const existingProgram = formData.programs.find(p => p.programId === programId);
    if (existingProgram && existingProgram.quantity > 1) {
      // 수량이 1보다 크면 수량 감소
      setFormData(prev => ({
        ...prev,
        programs: prev.programs.map(p => 
          p.programId === programId 
            ? { ...p, quantity: p.quantity - 1 } 
            : p
        )
      }));
    } else {
      // 수량이 1이면 완전히 삭제
      setFormData(prev => ({
        ...prev,
        programs: prev.programs.filter(p => p.programId !== programId)
      }));
    }
  };
  
  // 할인율 변경 핸들러
  const handleDiscountChange = (type, id, discount) => {
    const discountValue = parseInt(discount) || 0;
    
    if (type === 'room') {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => 
          r.roomId === id ? { ...r, discount: discountValue } : r
        )
      }));
    } else if (type === 'meal') {
      setFormData(prev => ({
        ...prev,
        meals: prev.meals.map(m => 
          m.mealId === id ? { ...m, discount: discountValue } : m
        )
      }));
    } else if (type === 'program') {
      setFormData(prev => ({
        ...prev,
        programs: prev.programs.map(p => 
          p.programId === id ? { ...p, discount: discountValue } : p
        )
      }));
    }
  };
  
  // 총액 계산
  const calculateTotal = () => {
    const roomTotal = formData.rooms.reduce((sum, room) => {
      const roomPrice = room.price * room.quantity;
      const discount = room.discount / 100;
      return sum + (roomPrice - (roomPrice * discount));
    }, 0);
    
    const mealTotal = formData.meals.reduce((sum, meal) => {
      const mealPrice = meal.price * meal.quantity * formData.numberOfPeople;
      const discount = meal.discount / 100;
      return sum + (mealPrice - (mealPrice * discount));
    }, 0);
    
    const programTotal = formData.programs.reduce((sum, program) => {
      const programPrice = program.price * program.quantity * formData.numberOfPeople;
      const discount = program.discount / 100;
      return sum + (programPrice - (programPrice * discount));
    }, 0);
    
    return {
      roomTotal,
      mealTotal,
      programTotal,
      grandTotal: roomTotal + mealTotal + programTotal
    };
  };
  
  // 폼 제출 핸들러
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // 폼 유효성 검사
    const newErrors = {};
    if (!formData.organization) newErrors.organization = '단체명은 필수 항목입니다.';
    if (!formData.contactName) newErrors.contactName = '담당자명은 필수 항목입니다.';
    if (!formData.contactPhone) newErrors.contactPhone = '연락처는 필수 항목입니다.';
    if (!formData.startDate) newErrors.startDate = '체크인 날짜는 필수 항목입니다.';
    if (!formData.endDate) newErrors.endDate = '체크아웃 날짜는 필수 항목입니다.';
    
    // 체크아웃 날짜가 체크인 날짜 이후인지 확인
    if (formData.startDate && formData.endDate && formData.endDate.isBefore(formData.startDate)) {
      newErrors.endDate = '체크아웃 날짜는 체크인 날짜 이후여야 합니다.';
    }
    
    // 에러가 있으면 저장 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 저장 시작
    setLocalLoading(true);
    
    // 저장용 데이터 준비
    const reservationData = {
      // ID 관련 정보 (기존 예약인 경우)
      id: formData.id || null,
      page1_id: formData.page1_id || null,
      
      // 기본 정보
      organization_name: formData.organization,
      contact_name: formData.contactName,
      contact_phone: formData.contactPhone,
      contact_email: formData.contactEmail,
      
      // 예약 상태 정보
      reservation_status: formData.status,
      reservation_date: formData.startDate,
      
      // 세부 정보 (details로 통합)
      details: {
        // 날짜 및 인원 정보
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfPeople: formData.numberOfPeople,
        
        // 객실, 식사, 프로그램 정보
        rooms: formData.rooms,
        meals: formData.meals,
        programs: formData.programs,
        
        // 기타 정보
        note: formData.note,
        
        // Page1 데이터
        visit_type: formData.visit_type,
        purpose: formData.purpose,
        
        // Page2 데이터
        male_count: formData.male_count,
        female_count: formData.female_count,
        total_count: formData.total_count,
        male_leader_count: formData.male_leader_count,
        female_leader_count: formData.female_leader_count,
        total_leader_count: formData.total_leader_count,
        page2_programs: formData.page2_programs,
        
        // Page3 데이터
        activities: formData.activities,
        page3_meals: formData.page3_meals,
        
        // Page4 데이터
        project_name: formData.project_name,
        material_total: formData.material_total,
        etc_expense_total: formData.etc_expense_total,
        total_budget: formData.total_budget,
        materials: formData.materials,
        etcExpenses: formData.etcExpenses
      }
    };
    
    console.log('저장할 데이터:', reservationData);
    
    // Alert 함수
    const showAlert = (message, type) => {
      if (type === 'success') {
      Swal.fire({
          title: '성공',
          text: message,
          icon: 'success'
        });
      } else if (type === 'error') {
        Swal.fire({
          title: '오류',
          text: message,
          icon: 'error'
        });
      } else {
        Swal.fire({
          title: '알림',
          text: message,
          icon: type || 'info'
        });
      }
    };
    
    // Navigate 함수 (여기서는 onBack을 사용)
    const navigate = () => {
      // 저장 후 목록으로 돌아가기
      onBack();
    };
    
    // 성공 콜백
    const onSuccess = (data) => {
      console.log('저장 성공:', data);
      setLocalLoading(false);
      
      // 목록 새로고침을 위한 액션 디스패치
      dispatch(actions.searchReservations({
        searchType: 'term',
        term: ''
      }));
      
      // 목록으로 돌아가기
      onBack();
    };
    
    // savePage5Data 서비스 함수 호출
    savePage5Data(reservationData, showAlert, navigate, onSuccess)
      .catch(error => {
        console.error('저장 중 오류 발생:', error);
        setLocalLoading(false);
        
        Swal.fire({
          title: '오류',
          text: '예약 저장 중 오류가 발생했습니다.',
          icon: 'error'
        });
      });
  };
  
  // 문서 생성 대화상자 열기
  const handleOpenDocumentDialog = (type) => {
    setDocumentType(type);
    setDocumentDialogOpen(true);
  };
  
  // 문서 생성 대화상자 닫기
  const handleCloseDocumentDialog = () => {
    setDocumentDialogOpen(false);
  };
  
  // 문서 생성 처리
  const handleGenerateDocument = () => {
    if (!documentType) return;
    
    // 견적서 문서를 클릭한 경우 페이지 이동
    if (documentType === 'inspection_doc' && editId) {
      navigate(`/new/page5/inspection/excel?id=${editId}&layout=page6`);
      setDocumentDialogOpen(false);
      return;
    }
    
    // 로딩 상태 표시
    setLocalLoading(true);
    
    // 문서 생성 요청 및 처리
    dispatch(actions.saveReservationDoc({
      reservationId: editId,
      documentType: documentType
    }));
    
    // 대화상자 닫기
    setDocumentDialogOpen(false);
    
    // 성공 메시지 표시
    Swal.fire({
      icon: 'success',
      title: '문서 생성 완료',
      text: '문서가 성공적으로 생성되었습니다.',
      timer: 2000
    }).then(() => {
      setLocalLoading(false);
    });
  };
  
  // 특정 페이지로 이동하기 위한 핸들러
  const handleEditSection = (section) => {
    if (editId && onNavigateToEdit) {
      // 삭제 전 확인
      onNavigateToEdit({id: editId}, section);
    }
  };
  
  // 각 아이템 목록 렌더링
  const renderSelectedItems = (items, type, handleRemove, handleDiscount) => {
    if (items.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">선택된 항목이 없습니다</Typography>
        </Box>
      );
    }
    
    return items.map(item => (
      <Box 
        key={item[`${type}Id`]} 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid #eee'
        }}
      >
        <Box>
          <Typography variant="subtitle2">{item.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {item.price.toLocaleString()}원 x {item.quantity}
            {type !== 'room' && ` x ${formData.numberOfPeople}명`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="할인(%)"
            type="number"
            size="small"
            value={item.discount}
            onChange={(e) => handleDiscount(type, item[`${type}Id`], e.target.value)}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            sx={{ width: 100, mr: 1 }}
          />
          <IconButton 
            size="small" 
            color="error"
            onClick={() => handleRemove(item[`${type}Id`])}
          >
            <RemoveIcon />
          </IconButton>
        </Box>
      </Box>
    ));
  };
  
  const totals = calculateTotal();
  
  // 정렬 토글
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };
  
  // Function to handle section expansion
  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={onBack}
          variant="outlined"
        >
          뒤로 가기
        </Button>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSubmit}
            disabled={localLoading || isLoading}
            sx={{ ml: 1 }}
          >
            저장하기
          </Button>
        </Box>
      </Box>
      
      {/* 문서 생성 및 페이지 이동 메뉴 */}
      {editId && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>문서 생성</Typography>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  onClick={() => handleOpenDocumentDialog('inspection_doc')}
                >
                  견적서
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleOpenDocumentDialog('order_report')}
                >
                  수주보고
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleOpenDocumentDialog('schedule')}
                >
                  일정표
                </Button>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>예약 항목 수정</Typography>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  onClick={() => handleEditSection('accommodation')}
                >
                  숙박 정보
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleEditSection('meals')}
                >
                  식사 정보
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleEditSection('activities')}
                >
                  활동 정보
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleEditSection('facilities')}
                >
                  시설 정보
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 데이터 소스 표시 */}
      {hasPreviousData && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            이전 페이지 데이터 통합
        </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            이 예약은 이전 페이지에서 입력한 데이터를 기반으로 생성되었습니다. 각 섹션을 클릭하여 상세 정보를 확인할 수 있습니다.
          </Alert>
          
          {/* Page1 Data */}
          <Accordion 
            expanded={expandedSections.page1} 
            onChange={() => handleSectionToggle('page1')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>기본 정보 (Page1)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">단체명</Typography>
                  <Typography>{formData.organization || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">방문일</Typography>
                  <Typography>
                    {formData.startDate ? formData.startDate.format('YYYY-MM-DD') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">담당자</Typography>
                  <Typography>{formData.contactName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">연락처</Typography>
                  <Typography>{formData.contactPhone || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">이메일</Typography>
                  <Typography>{formData.contactEmail || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">방문 목적</Typography>
                  <Typography>{formData.purpose || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">방문 유형</Typography>
                  <Typography>{formData.visit_type || '-'}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          
          {/* Page2 Data */}
          <Accordion 
            expanded={expandedSections.page2} 
            onChange={() => handleSectionToggle('page2')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>참가자 정보 (Page2)</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">남성</Typography>
                  <Typography>{formData.male_count || 0}명</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">여성</Typography>
                  <Typography>{formData.female_count || 0}명</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">총원</Typography>
                  <Typography>{formData.total_count || 0}명</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">남성 리더</Typography>
                  <Typography>{formData.male_leader_count || 0}명</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">여성 리더</Typography>
                  <Typography>{formData.female_leader_count || 0}명</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">리더 총원</Typography>
                  <Typography>{formData.total_leader_count || 0}명</Typography>
                </Grid>
                
                {/* Programs from Page2 */}
                {Array.isArray(formData.page2_programs) && formData.page2_programs.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>프로그램</Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {formData.page2_programs.map((program, idx) => (
                        <Box component="li" key={`p2-program-${idx}`}>
                          {program.name} - {program.cost ? `${program.cost.toLocaleString()}원` : ''}
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
          
          {/* Page3 Data */}
          <Accordion 
            expanded={expandedSections.page3} 
            onChange={() => handleSectionToggle('page3')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>활동 정보 (Page3)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Activities */}
              {Array.isArray(formData.activities) && formData.activities.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>등록된 활동</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {formData.activities.map((activity, idx) => (
                      <Box component="li" key={`activity-${idx}`}>
                        {activity.name || '무제'} - {activity.description || '설명 없음'}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">등록된 활동 정보가 없습니다.</Typography>
              )}
              
              {/* Meals from Page3 */}
              {Array.isArray(formData.page3_meals) && formData.page3_meals.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>식사 정보</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {formData.page3_meals.map((meal, idx) => (
                      <Box component="li" key={`p3-meal-${idx}`}>
                        {meal.name} - {meal.quantity || 1}인분
                        {meal.cost ? ` (${meal.cost.toLocaleString()}원)` : ''}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
          
          {/* Page4 Data */}
          <Accordion 
            expanded={expandedSections.page4} 
            onChange={() => handleSectionToggle('page4')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>예산 정보 (Page4)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">프로젝트명</Typography>
                  <Typography>{formData.project_name || '-'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">총 예산</Typography>
                  <Typography>{formData.total_budget ? `${formData.total_budget.toLocaleString()}원` : '-'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">자재비 합계</Typography>
                  <Typography>{formData.material_total ? `${formData.material_total.toLocaleString()}원` : '-'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">기타 경비 합계</Typography>
                  <Typography>{formData.etc_expense_total ? `${formData.etc_expense_total.toLocaleString()}원` : '-'}</Typography>
                </Grid>
                
                {/* Materials */}
                {Array.isArray(formData.materials) && formData.materials.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>자재 목록</Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {formData.materials.map((material, idx) => (
                        <Box component="li" key={`material-${idx}`}>
                          {material.name} - {material.quantity || 1}{material.unit || '개'} 
                          ({material.total ? `${material.total.toLocaleString()}원` : '-'})
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
                
                {/* Etc Expenses */}
                {Array.isArray(formData.etcExpenses) && formData.etcExpenses.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>기타 경비</Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {formData.etcExpenses.map((expense, idx) => (
                        <Box component="li" key={`expense-${idx}`}>
                          {expense.description || '무제'} - 
                          {expense.amount ? `${expense.amount.toLocaleString()}원` : '-'}
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}
      
      {/* Main Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {editId ? '예약 수정' : '새 예약 생성'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="기본 정보" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="단체명"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                    required
                      error={!!errors.organization}
                      helperText={errors.organization}
                      InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="담당자명"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                    required
                      error={!!errors.contactName}
                      helperText={errors.contactName}
                      InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="연락처"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                    required
                      error={!!errors.contactPhone}
                      helperText={errors.contactPhone}
                      InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="이메일"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                      <DatePicker
                        label="체크인 날짜"
                        value={formData.startDate}
                        onChange={(date) => handleDateChange('startDate', date)}
                        format="yyyy년 MM월 dd일"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate,
                            InputProps: {
                              startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                      <DatePicker
                        label="체크아웃 날짜"
                        value={formData.endDate}
                        onChange={(date) => handleDateChange('endDate', date)}
                        format="yyyy년 MM월 dd일"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: !!errors.endDate,
                            helperText: errors.endDate,
                            InputProps: {
                              startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="인원수"
                      name="numberOfPeople"
                      type="number"
                      value={formData.numberOfPeople}
                      onChange={handleChange}
                    required
                      InputProps={{ 
                      startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                      <InputLabel>예약 상태</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="예약 상태"
                      >
                        <MenuItem value="pending">대기중</MenuItem>
                      <MenuItem value="예약확인">예약확인</MenuItem>
                      <MenuItem value="완료">완료</MenuItem>
                      <MenuItem value="취소">취소</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          
          {/* 객실 선택 */}
          <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="객실 선택" 
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditSection('rooms')}
                >
                  수정
                </Button>
              }
            />
              <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {dummyRooms.map((room) => (
                      <Button
                        key={room.id}
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddRoom(room.id)}
                        startIcon={<MeetingRoomIcon />}
                      >
                        {room.name} ({room.capacity}인실)
                      </Button>
                    ))}
                </Box>
                </Grid>
                <Grid item xs={12}>
                  {renderSelectedItems(formData.rooms, 'room', handleRemoveRoom, handleDiscountChange)}
                </Grid>
              </Grid>
              </CardContent>
            </Card>
            
          {/* 식사 선택 */}
          <Card sx={{ mb: 3 }}>
              <CardHeader 
              title="식사 옵션" 
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditSection('meals')}
                >
                  수정
                </Button>
              }
            />
              <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {dummyMealOptions.map((meal) => (
                      <Button
                        key={meal.id}
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddMeal(meal.id)}
                        startIcon={<RestaurantIcon />}
                      >
                        {meal.name}
                      </Button>
                    ))}
                </Box>
                </Grid>
                <Grid item xs={12}>
                  {renderSelectedItems(formData.meals, 'meal', handleRemoveMeal, handleDiscountChange)}
                </Grid>
              </Grid>
              </CardContent>
            </Card>
            
          {/* 프로그램 선택 */}
          <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="프로그램 선택" 
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleEditSection('programs')}
                >
                  수정
                </Button>
              }
            />
              <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {dummyProgramOptions.map((program) => (
                      <Button
                        key={program.id}
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddProgram(program.id)}
                        startIcon={<SportsKabaddiIcon />}
                      >
                        {program.name}
                      </Button>
                    ))}
                </Box>
                </Grid>
                <Grid item xs={12}>
                  {renderSelectedItems(formData.programs, 'program', handleRemoveProgram, handleDiscountChange)}
                </Grid>
              </Grid>
              </CardContent>
            </Card>
            
          {/* 비고 */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="비고" />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="비고 사항"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="특이사항이나 기타 요청 사항을 입력하세요."
                InputProps={{
                  startAdornment: <EventNoteIcon sx={{ mt: 1, mr: 1, color: 'text.secondary' }} />
                }}
              />
            </CardContent>
          </Card>
          
          {/* 총 금액 표시 */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="결제 정보" />
              <CardContent>
                <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1">객실 금액</Typography>
                  <Typography variant="h6">
                    {formData.rooms.reduce((total, room) => total + room.total, 0).toLocaleString()}원
                    </Typography>
                  </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1">식사 금액</Typography>
                  <Typography variant="h6">
                    {formData.meals.reduce((total, meal) => total + meal.total, 0).toLocaleString()}원
                    </Typography>
                  </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1">프로그램 금액</Typography>
                  <Typography variant="h6">
                    {formData.programs.reduce((total, program) => total + program.total, 0).toLocaleString()}원
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5">총 금액</Typography>
                    <Typography variant="h4">
                      {calculateTotal().toLocaleString()}원
                    </Typography>
                  </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          
          {/* 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
            >
              목록으로
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setDocumentDialogOpen(true)}
              >
                문서 생성
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading || localLoading}
                startIcon={isLoading || localLoading ? <CircularProgress size={24} /> : <SaveIcon />}
              >
                {isLoading || localLoading ? '저장 중...' : '저장'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
      
      {/* 문서 생성 대화상자 */}
      <Dialog open={documentDialogOpen} onClose={handleCloseDocumentDialog}>
        <DialogTitle>문서 생성</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            다음 중 생성할 문서 유형을 선택하세요.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleGenerateDocument('reservation_result')}
              >
                예약 결과
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(`/new/page5/inspection/excel?id=${editId}&layout=page6`)}
              >
                견적서
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleGenerateDocument('order_report')}
              >
                수주보고
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleGenerateDocument('schedule')}
              >
                일정표
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocumentDialog}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReservationForm; 