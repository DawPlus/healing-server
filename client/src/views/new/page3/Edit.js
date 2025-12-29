import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Chip,
  Alert,
  Snackbar,
  TextField,
  Paper,
  Grid,
  Card,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Container,
  FormControl
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ko } from 'date-fns/locale';
import { useQuery, useMutation, gql } from '@apollo/client';

// Import common components and utilities
import Page1InfoCard from 'views/new/common/Page1InfoCard';
import { formatDateForServer, mapPage1ToPage3, sanitizePage1DataForSubmit } from 'views/new/common/Page1DataMapper';

// Import components
import RoomSelectionForm from './components/RoomSelectionForm';
import MealPlanForm from './components/MealPlanForm';
import PlaceReservationForm from './components/PlaceReservationForm';
import RoomManageInfo from './components/RoomManageInfo';

// Import icons
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import HotelIcon from '@mui/icons-material/Hotel';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DescriptionIcon from '@mui/icons-material/Description';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

// GraphQL queries
const GET_PAGE3_BY_PAGE1_ID_QUERY = gql`
  query GetPage3ByPage1Id($page1Id: Int!) {
    getPage3ByPage1Id(page1Id: $page1Id) {
      id
      page1_id
      reservation_status
      start_date
      end_date
      company_name
      department
      contact_person
      position
      participants_count
      room_count
      email
      phone
      purpose
      catering_required
      special_requirements
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
        price_per_person
        notes
      }
      place_reservations {
        id
        place_id
        place_name
        reservation_date
        start_time
        end_time
        purpose
        participants
        price
        notes
      }
    }
    getPage1ById(id: $page1Id) {
      id
      group_name
      customer_name
      reservation_status
      start_date
      end_date
      total_count
      email
      mobile_phone
      landline_phone
      notes
    }
    getPage2ByPage1Id(page1Id: $page1Id) {
      id
      page1_id
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      org_nature
      part_type
      age_type
      part_form
      service_type
    }
  }
`;

// GraphQL mutations
const CREATE_OR_UPDATE_PAGE3_MUTATION = gql`
  mutation CreateOrUpdatePage3($input: Page3Input!) {
    createOrUpdatePage3(input: $input) {
      id
      page1_id
      reservation_status
    }
  }
`;

const DELETE_PAGE3_MUTATION = gql`
  mutation DeletePage3ByPage1Id($page1Id: Int!) {
    deletePage3ByPage1Id(page1Id: $page1Id)
  }
`;

const GET_ROOMS_QUERY = gql`
  query GetMenuRooms {
    menuRooms {
      id
      room_type
      room_name
      capacity
      price
      description
      is_available
      facilities
      display_order
    }
  }
`;

const GET_AVAILABLE_ROOMS_QUERY = gql`
  query GetAvailableRoomsByDate($startDate: String!, $endDate: String!, $excludePage1Id: Int) {
    getAvailableRoomsByDate(startDate: $startDate, endDate: $endDate, excludePage1Id: $excludePage1Id) {
      id
      room_name
      room_type
      capacity
      price
      description
      is_available
      floor
      reservations {
        id
        check_in_date
        check_out_date
        page1_id
        next_available_date
        group_name
      }
    }
  }
`;

const GET_PLACES_QUERY = gql`
  query GetLocationsAndCategories {
    locations {
      id
      location_name
      category_id
      capacity
      description
      category {
        id
        category_name
      }
    }
    locationCategories {
      id
      category_name
      description
    }
  }
`;

const GET_MEAL_OPTIONS_QUERY = gql`
  query GetMealOptions {
    getMealOptions {
      id
      meal_type
      meal_option
      price_per_person
      description
      is_active
    }
  }
`;

// Add the a11yProps function before the Edit component
/**
 * Helper function to set accessibility properties for tabs
 * @param {number} index - The index of the tab
 * @returns {object} Props to spread on the tab
 */
const a11yProps = (index) => {
  return {
    id: `page3-tab-${index}`,
    'aria-controls': `page3-tabpanel-${index}`,
  };
};

const Edit = ({ overrideId, isEmbedded = false, onDataUpdate, hideReservationInfo = false }) => {
  const { page1Id: urlPage1Id } = useParams(); // id 대신 page1Id로 변경
  const page1Id = overrideId || urlPage1Id; // Use overrideId if provided
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', type: 'info' });
  const isMounted = useRef(true);
  const autoSaveTimerRef = useRef(null);
  
  // page1Id를 정수로 변환
  const page1IdInt = Number(page1Id);
  
  // 유효하지 않은 ID 체크
  useEffect(() => {
    if (isNaN(page1IdInt)) {
      showToast('유효하지 않은 ID입니다.', 'error');
      navigate('/new/page3');
    }
  }, [page1IdInt]);
  
  // Form state
  const [formData, setFormData] = useState({
    page1_id: page1IdInt, // 정수로 변환한 ID 사용
    reservation_status: 'preparation',
    start_date: '',
    end_date: '',
    company_name: '',
    department: '',
    contact_person: '',
    position: '',
    participants_count: 0,
    room_count: 0,
    email: '',
    phone: '',
    purpose: '',
    catering_required: false,
    special_requirements: '',
    room_selections: [],
    meal_plans: [],
    place_reservations: []
  });

  // State for form items
  const [roomForm, setRoomForm] = useState({});
  const [mealForm, setMealForm] = useState({});
  const [placeForm, setPlaceForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_PAGE3_BY_PAGE1_ID_QUERY, {
    variables: { page1Id: page1IdInt }, // 정수로 변환한 ID 사용
    fetchPolicy: 'network-only',
    skip: !page1Id || isNaN(page1IdInt)
  });

  // Fetch rooms
  const { data: roomsData } = useQuery(GET_ROOMS_QUERY, {
    fetchPolicy: 'network-only'
  });
  
  // Fetch places
  const { data: placesData } = useQuery(GET_PLACES_QUERY, {
    fetchPolicy: 'network-only'
  });
  
  // Fetch meal options
  const { data: mealOptionsData } = useQuery(GET_MEAL_OPTIONS_QUERY, {
    fetchPolicy: 'network-only'
  });

  // Save mutation
  const [createOrUpdatePage3, { loading: submitting }] = useMutation(CREATE_OR_UPDATE_PAGE3_MUTATION, {
    onCompleted: (data) => {
      setIsSaving(false);
      // Refetch data to update the UI with freshly saved data
      refetch().then(() => {
        // Remove Swal.fire dialog
        showToast('예약 정보가 저장되었습니다.', 'success');
      });
    },
    onError: (error) => {
      setIsSaving(false);
      // Remove Swal.fire dialog
      showToast('저장 중 오류가 발생했습니다: ' + error.message, 'error');
    }
  });
  
  // Delete mutation
  const [deletePage3, { loading: deleting }] = useMutation(DELETE_PAGE3_MUTATION, {
    onCompleted: () => {
      setIsDeleting(false);
      // Keep the Swal dialog for deletion confirmation but remove it for the success message
      showToast('예약 정보가 삭제되었습니다.', 'success');
      navigate('/new/page3');
    },
    onError: (error) => {
      setIsDeleting(false);
      // Remove Swal.fire dialog
      showToast('삭제 중 오류가 발생했습니다: ' + error.message, 'error');
    }
  });
  
  // Extracted available data
  const availableRooms = roomsData?.menuRooms || [];
  
  // Filter locations by the "대관" category
  const rentalCategoryId = placesData?.locationCategories?.find(
    cat => cat.category_name === "대관" || cat.category_name === "예약"
  )?.id;
  
  // 모든 장소를 사용 - 카테고리 필터링하지 않음 (필터링이 작동하지 않는 경우 대비)
  const availablePlaces = placesData?.locations || [];
  
  const availableMealOptions = mealOptionsData?.getMealOptions || [];
  
  // 디버깅을 위한 데이터 로깅
  useEffect(() => {
    if (mealOptionsData) {
      console.log("Available meal options:", availableMealOptions);
    }
    
    if (roomsData) {
      console.log("Available rooms:", availableRooms);
    }
    
    if (placesData) {
      console.log("All categories:", placesData.locationCategories);
      console.log("All available locations:", placesData.locations);
      console.log("Filtered places:", availablePlaces);
    }
  }, [mealOptionsData, roomsData, placesData, availablePlaces, availableRooms, availableMealOptions]);
  
  // Replace showAlert with showToast that uses Snackbar instead of Swal
  const showToast = (message, severity = 'info') => {
    if (!isMounted.current) return;
    setAlertInfo({ open: true, message, type: severity });
    
    // Call onDataUpdate if provided and severity is success
    if (typeof onDataUpdate === 'function' && severity === 'success') {
      onDataUpdate(message);
    }
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setAlertInfo(prev => ({ ...prev, open: false }));
  };

  // Load data when component mounts and data is available
  useEffect(() => {
    if (data && data.getPage3ByPage1Id) {
      const page3Data = data.getPage3ByPage1Id;
      const page1Data = data.getPage1ById;
      const page2Data = data.getPage2ByPage1Id;
      
      // Calculate total participants from page2 data if available
      let calculatedParticipantsCount = 0;
      if (page2Data) {
        const maleCount = parseInt(page2Data.male_count || 0);
        const femaleCount = parseInt(page2Data.female_count || 0);
        const maleLeaderCount = parseInt(page2Data.male_leader_count || 0);
        const femaleLeaderCount = parseInt(page2Data.female_leader_count || 0);
        calculatedParticipantsCount = maleCount + femaleCount + maleLeaderCount + femaleLeaderCount;
      } else if (page1Data) {
        // Fallback to page1 total_count if page2 is not available
        calculatedParticipantsCount = page1Data.total_count || 0;
      }
      
      // Format dates for form fields
      const formattedStartDate = page3Data.start_date ? moment(page3Data.start_date).format('YYYY-MM-DD') : '';
      const formattedEndDate = page3Data.end_date ? moment(page3Data.end_date).format('YYYY-MM-DD') : '';
      
      // Ensure all arrays have valid data before setting in state
      const ensureArrayWithValidIds = (array, prefix) => {
        if (!array || !Array.isArray(array)) return [];
        return array.map((item, index) => {
          // Ensure each item has an ID
          if (!item.id) {
            return {
              ...item, 
              id: `${prefix}_${Date.now()}_${index}`
            };
          }
          return item;
        });
      };
      
      setFormData({
        id: page3Data.id,
        page1_id: page3Data.page1_id || page1IdInt,
        reservation_status: page3Data.reservation_status || 'preparation',
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        company_name: page3Data.company_name || '',
        department: page3Data.department || '',
        contact_person: page3Data.contact_person || (page1Data ? page1Data.customer_name : ''),
        position: page3Data.position || '',
        participants_count: page3Data.participants_count || calculatedParticipantsCount,
        room_count: page3Data.room_count || 0,
        email: page3Data.email || (page1Data ? page1Data.email : ''),
        phone: page3Data.phone || (page1Data ? page1Data.mobile_phone : ''),
        purpose: page3Data.purpose || '',
        catering_required: page3Data.catering_required || false,
        special_requirements: page3Data.special_requirements || '',
        room_selections: ensureArrayWithValidIds(page3Data.room_selections || [], 'room'),
        meal_plans: ensureArrayWithValidIds(page3Data.meal_plans || [], 'meal'),
        place_reservations: ensureArrayWithValidIds(page3Data.place_reservations || [], 'place')
      });
    } else if (data && data.getPage1ById) {
      // If page3 doesn't exist but page1 does, initialize with page1 data
      const page1Data = data.getPage1ById;
      const page2Data = data.getPage2ByPage1Id;
      
      // Calculate total participants from page2 data if available
      let calculatedParticipantsCount = 0;
      if (page2Data) {
        const maleCount = parseInt(page2Data.male_count || 0);
        const femaleCount = parseInt(page2Data.female_count || 0);
        const maleLeaderCount = parseInt(page2Data.male_leader_count || 0);
        const femaleLeaderCount = parseInt(page2Data.female_leader_count || 0);
        calculatedParticipantsCount = maleCount + femaleCount + maleLeaderCount + femaleLeaderCount;
      } else {
        // Fallback to page1 total_count if page2 is not available
        calculatedParticipantsCount = page1Data.total_count || 0;
      }
      
      setFormData(prev => ({
        ...prev,
        page1_id: page1IdInt,
        contact_person: page1Data.customer_name || '',
        participants_count: calculatedParticipantsCount,
        email: page1Data.email || '',
        phone: page1Data.mobile_phone || '',
        start_date: page1Data.start_date ? moment(page1Data.start_date).format('YYYY-MM-DD') : '',
        end_date: page1Data.end_date ? moment(page1Data.end_date).format('YYYY-MM-DD') : '',
        special_requirements: page1Data.notes || '',
        company_name: page1Data.group_name || ''
      }));
    }
  }, [data, page1IdInt]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      isMounted.current = false;
    };
  }, []);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle field change with explicit field name and value
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Remove __typename field and other GraphQL-specific fields from main object
      const { __typename, page1, ...cleanFormData } = formData;
      
      // Create a clean copy of the form data
      const inputData = {
        ...cleanFormData,
        page1_id: parseInt(formData.page1_id),
        reservation_status: cleanFormData.reservation_status || 'confirmed',
        // Convert dates to ISO format for Prisma
        start_date: cleanFormData.start_date ? new Date(cleanFormData.start_date).toISOString() : null,
        end_date: cleanFormData.end_date ? new Date(cleanFormData.end_date).toISOString() : null,
        company_name: cleanFormData.company_name,
        department: cleanFormData.department || '',
        contact_person: cleanFormData.contact_person,
        position: cleanFormData.position || '',
        participants_count: parseInt(cleanFormData.participants_count || 0),
        room_count: parseInt(cleanFormData.room_count || 0),
        catering_required: Boolean(cleanFormData.catering_required)
      };
      
      // Ensure all place_id values in place_reservations are strings and remove __typename
      if (inputData.place_reservations && inputData.place_reservations.length > 0) {
        inputData.place_reservations = inputData.place_reservations.map(reservation => {
          const { __typename, ...cleanedReservation } = reservation;
          return {
            ...cleanedReservation,
            place_id: String(cleanedReservation.place_id) // Convert to string
          };
        });
      }
      
      // Ensure all room_id values in room_selections are strings and remove __typename
      if (inputData.room_selections && inputData.room_selections.length > 0) {
        inputData.room_selections = inputData.room_selections.map(room => {
          const { __typename, ...cleanedRoom } = room;
          return {
            ...cleanedRoom,
            room_id: String(cleanedRoom.room_id) // Convert to string
          };
        });
      }
      
      // Remove __typename field from meal_plans objects
      if (inputData.meal_plans && inputData.meal_plans.length > 0) {
        inputData.meal_plans = inputData.meal_plans.map(meal => {
          const { __typename, ...cleanedMeal } = meal;
          // Make sure price_per_person is included and converted to a number
          if (cleanedMeal.price_per_person) {
            cleanedMeal.price_per_person = parseFloat(cleanedMeal.price_per_person);
          }
          
          // For temp IDs, keep them but make sure they're not null
          if (cleanedMeal.id && typeof cleanedMeal.id === 'string' && cleanedMeal.id.startsWith('temp_')) {
            console.log(`[Edit] Keeping temp ID: ${cleanedMeal.id}`);
            return {
              ...cleanedMeal,
              // Keep the temp id - it's better than null for non-nullable fields
              id: cleanedMeal.id
            };
          }
          
          // For existing IDs, convert to integer if numeric
          if (cleanedMeal.id && !isNaN(parseInt(cleanedMeal.id))) {
            console.log(`[Edit] Converting ID to number: ${cleanedMeal.id}`);
            return {
              ...cleanedMeal,
              id: parseInt(cleanedMeal.id)
            };
          }
          
          // If somehow ID is missing, add a temporary one
          if (!cleanedMeal.id) {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            console.log(`[Edit] Generated new ID for meal: ${tempId}`);
            return {
              ...cleanedMeal,
              id: tempId
            };
          }
          
          return cleanedMeal;
        });
      }
      
      console.log('[Edit] Submitting cleaned input data:', inputData);
      
      await createOrUpdatePage3({
        variables: {
          input: inputData
        }
      });
      
      // Refetch data to ensure we have latest state
      refetch();
      
    } catch (error) {
      setIsSaving(false);
      console.error('[Edit] Error saving data:', error);
      showToast('저장 중 오류가 발생했습니다: ' + error.message, 'error');
    }
  };
  
  // Handle navigation back to list
  const handleBack = () => {
    navigate('/new/page3');
  };
  
  // Handle deleting the reservation
  const handleDeleteReservation = () => {
    if (!formData.page1_id) {
      showToast('Page1 ID가 필요합니다.', 'warning');
      return;
    }
    
    // page1_id를 정수로 확인
    const deleteId = Number(formData.page1_id);
    if (isNaN(deleteId)) {
      showToast('유효하지 않은 Page1 ID입니다.', 'error');
      return;
    }
    
    Swal.fire({
      title: '삭제 확인',
      text: '이 예약 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme.palette.error.main
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        deletePage3({
          variables: { page1Id: deleteId }
        });
      }
    });
  };

  // Update handleRoomSelection to use toast and refetch data quickly
  const handleRoomSelection = (action, item) => {
    console.log(`[Edit] Room ${action} operation:`, item);
    console.log(`[디버깅] Page3 룸 ${action} 작업 =================`);
    console.log(`단체 일정: ${formData.start_date} ~ ${formData.end_date}`);
    console.log(`객실 일정: ${item.check_in_date || 'N/A'} ~ ${item.check_out_date || 'N/A'}`);
    
    if (action === 'add') {
      // Check if room is already in selections by room_id
      const existingRoom = formData.room_selections.find(room => 
        String(room.room_id) === String(item.room_id)
      );
      
      if (existingRoom) {
        showToast(`객실 ${item.room_name}은(는) 이미 선택되었습니다.`, 'warning');
        return;
      }
      
      // Create a unique ID for new room
      if (!item.id) {
        item.id = `new_room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
      
      // Update room count
      const newRoomCount = formData.room_count + 1;
      
      // Add new room to selections
      setFormData(prev => {
        const updatedData = {
          ...prev,
          room_count: newRoomCount,
          room_selections: [...prev.room_selections, item]
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      // Success message
      showToast(`객실 ${item.room_name}이(가) 추가되었습니다.`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'edit') {
      // Update existing room - find by ID and replace
      setFormData(prev => {
        const updatedSelections = prev.room_selections.map(room => 
          room.id === item.id ? item : room
        );
        
        const updatedData = {
          ...prev,
          room_selections: updatedSelections
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      // Success message
      showToast(`객실 ${item.room_name}이(가) 수정되었습니다.`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'remove') {
      // Find index of room to remove
      const roomIndex = formData.room_selections.findIndex(
        room => room.id === item
      );
      
      if (roomIndex === -1) {
        console.error(`Room with ID ${item} not found for removal`);
        return;
      }
      
      // Get room details for message
      const roomToRemove = formData.room_selections[roomIndex];
      
      // Create copy of selections and remove the room
      const updatedSelections = [...formData.room_selections];
      updatedSelections.splice(roomIndex, 1);
      
      // Update room count
      const newRoomCount = Math.max(0, formData.room_count - 1);
      
      // Update state
      setFormData(prev => {
        const updatedData = {
          ...prev,
          room_count: newRoomCount,
          room_selections: updatedSelections
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      // Success message
      showToast(`객실 ${roomToRemove.room_name}이(가) 제거되었습니다.`, 'info');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'setAllZero') {
      // Set all room prices to zero
      setFormData(prev => {
        const updatedData = {
          ...prev,
          room_selections: item // item is already the updated array with zero prices
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast('모든 객실의 가격이 0원으로 변경되었습니다.', 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    }
  };

  // Update handleMealPlan to use toast and refetch data quickly
  const handleMealPlan = (action, item) => {
    console.log(`Meal plan operation: ${action}`, item);
    
    if (action === 'add') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          meal_plans: [...prev.meal_plans, item]
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast(`식사 계획이 추가되었습니다: ${getMealTypeName(item.meal_type)}`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'addAll') {
      // Add multiple meal plans at once
      setFormData(prev => {
        const updatedData = {
          ...prev,
          meal_plans: [...prev.meal_plans, ...item]
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast(`${item.length}개의 식사 계획이 한번에 추가되었습니다.`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'edit') {
      // Find and replace the item with the same ID
      setFormData(prev => {
        const updatedData = {
          ...prev,
          meal_plans: prev.meal_plans.map(meal => 
            meal.id === item.id ? item : meal
          )
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast(`식사 계획이 수정되었습니다: ${getMealTypeName(item.meal_type)}`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'remove') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          meal_plans: prev.meal_plans.filter(meal => meal.id !== item)
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast('식사 계획이 삭제되었습니다.', 'info');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'setAllZero') {
      // Set all meal prices to zero
      setFormData(prev => {
        const updatedData = {
          ...prev,
          meal_plans: item // item is already the updated array with zero prices
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast('모든 식사 가격이 0원으로 변경되었습니다.', 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    }
  };
  
  // Helper to get meal type name
  const getMealTypeName = (type) => {
    const mealTypes = {
      'breakfast': '아침',
      'lunch': '점심',
      'dinner': '저녁'
    };
    return mealTypes[type] || type;
  };

  // Update handlePlaceReservation to use toast and refetch data quickly
  const handlePlaceReservation = (action, item) => {
    console.log(`Place reservation operation: ${action}`, item);
    
    if (action === 'add') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          place_reservations: [...prev.place_reservations, item]
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast(`장소 예약이 추가되었습니다: ${item.place_name}`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'edit') {
      // Find and replace the item with the same ID
      setFormData(prev => {
        const updatedData = {
          ...prev,
          place_reservations: prev.place_reservations.map(reservation => 
            reservation.id === item.id ? item : reservation
          )
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast(`장소 예약이 수정되었습니다: ${item.place_name}`, 'success');
      // Refetch data
      setTimeout(() => refetch(), 200);
    } else if (action === 'remove') {
      setFormData(prev => {
        const updatedData = {
          ...prev,
          place_reservations: prev.place_reservations.filter(reservation => 
            reservation.id !== item
          )
        };
        
        // Auto-save to server
        saveToServer(updatedData);
        
        return updatedData;
      });
      
      showToast('장소 예약이 삭제되었습니다.', 'info');
      // Refetch data
      setTimeout(() => refetch(), 200);
    }
  };
  
  // Handle room form change
  const handleRoomFormChange = (field, value) => {
    console.log(`Updating room form: ${field} = ${value}`);
    setRoomForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle meal form change
  const handleMealFormChange = (field, value) => {
    if (field === 'resetAll') {
      // 한 번에 모든 필드 초기화
      console.log('[Edit] Resetting meal form with values:', value);
      setMealForm(value);
    } else {
      setMealForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Handle place form change
  const handlePlaceFormChange = (field, value) => {
    console.log(`[Edit] Updating place form: ${field} = ${value}`);
    setPlaceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update saveToServer to provide toast messages instead of alerts
  const saveToServer = async (dataToSave) => {
    try {
      console.log('[Edit] Auto-saving data to server');
      setIsAutoSaving(true);
      
      // Remove __typename field and other GraphQL-specific fields from main object
      const { __typename, page1, created_at, updated_at, ...cleanData } = dataToSave;
      
      // Create a clean copy of the form data
      const inputData = {
        ...cleanData,
        // Convert id to integer if present
        id: cleanData.id ? parseInt(cleanData.id) : undefined,
        page1_id: parseInt(formData.page1_id),
        reservation_status: cleanData.reservation_status || 'confirmed',
        // Convert dates to ISO format for Prisma
        start_date: cleanData.start_date ? new Date(cleanData.start_date).toISOString() : null,
        end_date: cleanData.end_date ? new Date(cleanData.end_date).toISOString() : null,
        company_name: cleanData.company_name,
        department: cleanData.department || '',
        contact_person: cleanData.contact_person,
        position: cleanData.position || '',
        participants_count: parseInt(cleanData.participants_count || 0),
        room_count: parseInt(cleanData.room_count || 0),
        catering_required: Boolean(cleanData.catering_required)
      };
      
      console.log('[Edit] Cleaned input data for mutation:', inputData);

      // Process meal_plans properly for GraphQL
      if (inputData.meal_plans && inputData.meal_plans.length > 0) {
        console.log(`[Edit] Processing ${inputData.meal_plans.length} meal plans`);
        inputData.meal_plans = inputData.meal_plans.map((meal, index) => {
          console.log(`[Edit] Processing meal plan ${index+1}/${inputData.meal_plans.length}: ${meal.id}`);
          
          // Remove __typename field if present
          const { __typename, ...cleanedMeal } = meal;
          
          // Make sure price_per_person is included and converted to a number
          if (cleanedMeal.price_per_person) {
            cleanedMeal.price_per_person = parseFloat(cleanedMeal.price_per_person);
          }
          
          // For temp IDs, keep them but make sure they're not null
          if (cleanedMeal.id && typeof cleanedMeal.id === 'string' && cleanedMeal.id.startsWith('temp_')) {
            console.log(`[Edit] Keeping temp ID: ${cleanedMeal.id}`);
            return {
              ...cleanedMeal,
              // Keep the temp id - it's better than null for non-nullable fields
              id: cleanedMeal.id
            };
          }
          
          // For existing IDs, convert to integer if numeric
          if (cleanedMeal.id && !isNaN(parseInt(cleanedMeal.id))) {
            console.log(`[Edit] Converting ID to number: ${cleanedMeal.id}`);
            return {
              ...cleanedMeal,
              id: parseInt(cleanedMeal.id)
            };
          }
          
          // If somehow ID is missing, add a temporary one
          if (!cleanedMeal.id) {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            console.log(`[Edit] Generated new ID for meal: ${tempId}`);
            return {
              ...cleanedMeal,
              id: tempId
            };
          }
          
          return cleanedMeal;
        });
      }
      
      // Process room_selections properly for GraphQL
      if (inputData.room_selections && inputData.room_selections.length > 0) {
        console.log(`[Edit] Processing ${inputData.room_selections.length} room selections`);
        inputData.room_selections = inputData.room_selections.map((room, index) => {
          console.log(`[Edit] Processing room ${index+1}/${inputData.room_selections.length}: ${room.id}`);
          
          // Remove __typename field if present
          const { __typename, ...cleanedRoom } = room;
          
          // Always ensure room_id is a string
          cleanedRoom.room_id = String(cleanedRoom.room_id || '');
          
          // For temp IDs, keep them but make sure they're not null
          if (cleanedRoom.id && typeof cleanedRoom.id === 'string' && 
              (cleanedRoom.id.startsWith('temp_') || cleanedRoom.id.startsWith('new_room_'))) {
            console.log(`[Edit] Keeping temp ID: ${cleanedRoom.id}`);
            return cleanedRoom;
          }
          
          // For existing IDs, convert to integer if numeric
          if (cleanedRoom.id && !isNaN(parseInt(cleanedRoom.id))) {
            console.log(`[Edit] Converting ID to number: ${cleanedRoom.id}`);
            return {
              ...cleanedRoom,
              id: parseInt(cleanedRoom.id)
            };
          }
          
          // If somehow ID is missing, add a temporary one
          if (!cleanedRoom.id) {
            return {
              ...cleanedRoom,
              id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            };
          }
          
          return cleanedRoom;
        });
      }
      
      // Process place_reservations properly for GraphQL
      if (inputData.place_reservations && inputData.place_reservations.length > 0) {
        console.log(`[Edit] Processing ${inputData.place_reservations.length} place reservations`);
        inputData.place_reservations = inputData.place_reservations.map((reservation, index) => {
          console.log(`[Edit] Processing place ${index+1}/${inputData.place_reservations.length}: ${reservation.id}`);
          
          // Remove __typename field if present
          const { __typename, ...cleanedReservation } = reservation;
          
          // Always ensure place_id is a string
          cleanedReservation.place_id = String(cleanedReservation.place_id || '');
          
          // For temp IDs, keep them but make sure they're not null
          if (cleanedReservation.id && typeof cleanedReservation.id === 'string' && 
              (cleanedReservation.id.startsWith('temp_') || cleanedReservation.id.startsWith('place_'))) {
            console.log(`[Edit] Keeping temp ID: ${cleanedReservation.id}`);
            return cleanedReservation;
          }
          
          // For existing IDs, convert to integer if numeric
          if (cleanedReservation.id && !isNaN(parseInt(cleanedReservation.id))) {
            console.log(`[Edit] Converting ID to number: ${cleanedReservation.id}`);
            return {
              ...cleanedReservation,
              id: parseInt(cleanedReservation.id)
            };
          }
          
          // If somehow ID is missing, add a temporary one
          if (!cleanedReservation.id) {
            const tempId = `place_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            console.log(`[Edit] Generated new ID for place: ${tempId}`);
            return {
              ...cleanedReservation,
              id: tempId
            };
          }
          
          return cleanedReservation;
        });
      }
      
      console.log('[Edit] Final inputData for mutation:', inputData);
      
      const result = await createOrUpdatePage3({
        variables: {
          input: inputData
        }
      });
      
      // After successful save, refetch data to update UI with server data
      if (result && result.data) {
        console.log('[Edit] Mutation successful:', result.data);
        await refetch();
        showToast('저장이 완료되었습니다.', 'success');
      }
      
      setIsAutoSaving(false);
      
    } catch (error) {
      console.error('[Edit] Error auto-saving data:', error);
      showToast('자동 저장 중 오류가 발생했습니다: ' + error.message, 'error');
      setIsAutoSaving(false);
    }
  };
  
  // Handle saving edited Page1 data
  const handlePage1DataSave = (updatedData) => {
    console.log('[Edit] Saving updated Page1 data:', updatedData);
    
    // First update the local form data with the changes
    setFormData(updatedData);
    
    // Format the dates properly before saving to server
    const formattedData = {
      ...updatedData,
      start_date: updatedData.start_date ? new Date(updatedData.start_date).toISOString() : null,
      end_date: updatedData.end_date ? new Date(updatedData.end_date).toISOString() : null
    };
    
    // Then save the changes to the server
    saveToServer(formattedData);
    
    // Show a success message
    showToast('예약 정보가 업데이트되었습니다.', 'success');
  };
  
  // Get the card data for Page1InfoCard
  const getPage1InfoCardData = () => {
    if (hideReservationInfo) return null;
    
    if (data?.getPage1ById) {
      return data.getPage1ById;
    }
    
    return {};
  };

  // 배열 정렬 시 원본을 변경하지 않고 복사본을 만들어 정렬
  const getSortedRooms = () => {
    if (!availableRooms || availableRooms.length === 0) return [];
    return [...availableRooms].sort((a, b) => {
      // 정렬 로직 (예: 가격 또는 이름으로 정렬)
      return a.room_name?.localeCompare(b.room_name) || 0;
    });
  };

  const getSortedPlaces = () => {
    if (!availablePlaces || availablePlaces.length === 0) return [];
    return [...availablePlaces].sort((a, b) => {
      return a.location_name?.localeCompare(b.location_name) || 0;
    });
  };

  const getSortedMealOptions = () => {
    if (!availableMealOptions || availableMealOptions.length === 0) return [];
    return [...availableMealOptions].sort((a, b) => {
      return a.meal_type?.localeCompare(b.meal_type) || 0;
    });
  };

  const renderPlaces = useCallback(() => {
    try {
      if (!formData.place_reservations || formData.place_reservations.length === 0) return null;

      // 읽기 전용 배열을 복사한 후 정렬하여 TypeError 방지
      const sortedPlaces = [...formData.place_reservations].sort((a, b) => {
        return a.display_order - b.display_order;
      });

      return sortedPlaces.map((place, index) => {
        // ... existing code ...
      });
    } catch (error) {
      console.error('[Edit] Error rendering places:', error);
      return null;
    }
  }, [formData.place_reservations]);

  // Ensure the formData properly uses the page1 data to set start and end dates
  useEffect(() => {
    if (data?.getPage1ById) {
      const page1 = data.getPage1ById;
      
      // Format dates for display
      const formattedStartDate = page1.start_date ? moment(page1.start_date).format('YYYY-MM-DD') : '';
      const formattedEndDate = page1.end_date ? moment(page1.end_date).format('YYYY-MM-DD') : '';
      
      console.log('[디버깅] Page1 원본 날짜 정보 =================');
      console.log(`단체명: ${page1.group_name}`);
      console.log(`원본 시작일: ${page1.start_date}, 포맷팅: ${formattedStartDate}`);
      console.log(`원본 종료일: ${page1.end_date}, 포맷팅: ${formattedEndDate}`);
      
      // Only update if start_date is different or empty
      if (!formData.start_date || formData.start_date !== formattedStartDate || 
          !formData.end_date || formData.end_date !== formattedEndDate) {
        
        setFormData(prev => {
          const updated = {
            ...prev,
            start_date: formattedStartDate,
            end_date: formattedEndDate
          };
          
          console.log('[디버깅] formData 날짜 업데이트:');
          console.log(`시작일: ${updated.start_date}, 종료일: ${updated.end_date}`);
          
          return updated;
        });
      }
    }
  }, [data?.getPage1ById]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, mb: isEmbedded ? 0 : 3, width: '100%' }}>
      <FormControl fullWidth component="form" onSubmit={handleSubmit}>
        <MainCard 
          title={isEmbedded ? "시설 이용 관리" : "시설 이용 관리 - " + (formData.company_name || '')}
          secondary={
            !isEmbedded && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  저장
                  {isSaving && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteReservation}
                  disabled={isDeleting}
                >
                  삭제
                  {isDeleting && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                >
                  목록
                </Button>
              </Box>
            )
          }
          sx={{ overflow: 'visible' }}
        >
          <Box sx={{ width: '100%' }}>
            {/* Show Page1 Info Card if not hidden */}
            {!hideReservationInfo && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Page1InfoCard 
                  data={getPage1InfoCardData()} 
                  loading={loading}
                  onSave={handlePage1DataSave}
                  isEmbedded={isEmbedded}
                />
              </Paper>
            )}

            {/* Page1 ID 관리 섹션 추가 - hideReservationInfo가 true일 때 숨김 */}
            {!hideReservationInfo && (
              <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">Page1 ID 관리</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Page1 ID"
                      variant="outlined"
                      value={formData.page1_id || ''}
                      onChange={(e) => handleFieldChange('page1_id', e.target.value)}
                      helperText="Page1의 ID를 직접 입력하세요"
                    />
                  </Grid>
                  {!formData.page1_id && (
                    <Grid item xs={12} md={6}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => {
                          if (page1Id) {
                            handleFieldChange('page1_id', page1Id);
                            showToast('Page1 ID가 설정되었습니다.', 'success');
                          } else {
                            showToast('URL에서 ID를 찾을 수 없습니다.', 'warning');
                          }
                        }}
                      >
                        URL ID로 설정
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Room Manage Info - Shows room availability and management */}
            {!hideReservationInfo && (
              <RoomManageInfo 
                page1Id={page1IdInt} 
                startDate={formData.start_date} 
                endDate={formData.end_date} 
              />
            )}

      
            {/* Room Selection Form */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <RoomSelectionForm
                formData={formData}
                handleFieldChange={handleFieldChange}
                roomForm={roomForm}
                updateRoomForm={handleRoomFormChange}
                addRoomSelection={handleRoomSelection}
                removeRoomSelection={(id) => handleRoomSelection('remove', id)}
                availableRooms={getSortedRooms()}
                onRoomSelect={handleRoomSelection}
              />
            </LocalizationProvider>
            
            {/* Meal Plan Form */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <MealPlanForm
                formData={formData}
                mealForm={mealForm}
                updateMealForm={handleMealFormChange}
                addMealPlan={handleMealPlan}
                removeMealPlan={(id) => handleMealPlan('remove', id)}
                availableMealOptions={getSortedMealOptions()}
              />
            </LocalizationProvider>
            
            {/* Place Reservation Form */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <PlaceReservationForm
                formData={formData}
                placeForm={placeForm}
                updatePlaceForm={handlePlaceFormChange}
                addPlaceReservation={handlePlaceReservation}
                removePlaceReservation={(id) => handlePlaceReservation('remove', id)}
                availablePlaces={getSortedPlaces()}
              />
            </LocalizationProvider>
            
            {/* Bottom action buttons */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                목록으로 돌아가기
              </Button>
              <Box>
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteReservation}
                  disabled={isSaving || isDeleting}
                  sx={{ mr: 1 }}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  disabled={isSaving}
                >
                  새로고침
                </Button>
              </Box>
            </Box>
            
            {/* Auto-save indicator */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption">
                객실, 식사, 장소 정보는 추가, 수정, 삭제 시 자동으로 저장됩니다.
              </Typography>
            </Box>
          </Box>
        </MainCard>
        
        {/* Alert message */}
        <Snackbar 
          open={alertInfo.open} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseAlert} severity={alertInfo.type} sx={{ width: '100%' }}>
            {alertInfo.message}
          </Alert>
        </Snackbar>
        
        {/* Auto-save indicator snackbar */}
        <Snackbar
          open={isAutoSaving}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ width: '100%' }}>
            변경사항 자동 저장 중...
          </Alert>
        </Snackbar>
      </FormControl>
    </Box>
  );
};

export default Edit; 