import moment from 'moment';
import { generateDateArray } from './dateUtils';

/**
 * Create a default place reservation
 * @param {string|number} reservationId - The reservation ID
 * @param {string} startDate - The start date for the reservation
 * @returns {Object|null} Default place reservation object or null if invalid
 */
export const createDefaultPlaceReservation = (reservationId, startDate) => {
  if (!startDate) {
    console.error('[ReservationUtils] Cannot create default reservation without start date');
    return null;
  }
  
  try {
    // Validate the date
    const dateObj = moment(startDate);
    if (!dateObj.isValid()) {
      console.error('[ReservationUtils] Invalid start date:', startDate);
      return null;
    }
    
    const placeId = `default_place_${Date.now()}`;
    
    return {
      id: placeId,
      reservation_id: reservationId || 'pending',
      place_id: null,
      place_name: '회의실 1',
      place_type: 'meeting_room',
      reservation_date: startDate,
      start_time: '09:00',
      end_time: '18:00',
      purpose: '회의',
      notes: ''
    };
  } catch (error) {
    console.error('[ReservationUtils] Error creating default place reservation:', error);
    return null;
  }
};

/**
 * Create default room reservation
 * @param {string|number} reservationId - The reservation ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Default room object
 */
export const createDefaultRoom = (reservationId, startDate, endDate) => {
  const roomId = `default_room_${Date.now()}`;
  return {
    id: roomId,
    room_number: '객실 1',
    room_type: '스탠다드 더블',
    check_in_date: startDate,
    check_out_date: endDate,
    guests_count: '2',
    price_per_night: '100000',
    total_price: '100000',
    notes: '',
    reservation_id: reservationId
  };
};

/**
 * Create default meal data
 * @param {string|number} reservationId - The reservation ID
 * @param {string} mealDate - The meal date
 * @param {string} type - Meal type (breakfast, lunch, dinner)
 * @param {string|number} participantsCount - Number of participants
 * @returns {Object} Default meal object
 */
export const createDefaultMeal = (reservationId, mealDate, type = 'breakfast', participantsCount = '0') => {
  const count = participantsCount.toString();
  let price = 15000; // Default price for breakfast
  
  if (type === 'lunch') {
    price = 20000;
  } else if (type === 'dinner') {
    price = 25000;
  }
  
  const mealId = `default_${type}_${Date.now()}`;
  const totalPrice = (parseInt(count) * price).toString();
  
  return {
    id: mealId,
    meal_date: mealDate,
    meal_type: type,
    breakfast_count: type === 'breakfast' ? count : '0',
    lunch_count: type === 'lunch' ? count : '0',
    dinner_count: type === 'dinner' ? count : '0',
    dinner_type: 'regular',
    price_per_person: price.toString(),
    total_price: totalPrice,
    special_requests: '',
    notes: '',
    reservation_id: reservationId
  };
};

/**
 * Check if a place reservation fetch should be performed
 * @param {Object} state - The current state
 * @param {string} reservationId - The reservation ID
 * @returns {boolean} True if fetch should proceed, false otherwise
 */
export const shouldFetchPlaceReservations = (state, reservationId) => {
  if (!state || !reservationId) {
    return false;
  }
  
  // Check if we have valid dates
  if (!state.formData?.start_date || !state.formData?.end_date) {
    console.log('[ReservationUtils] Missing start or end date, skipping fetch');
    return false;
  }
  
  // Check if we already have reservations
  if (state.placeReservations && state.placeReservations.length > 0) {
    console.log('[ReservationUtils] Already have place reservations, skipping fetch');
    return false;
  }
  
  // Check if data is already in cache
  if (state.cachedPlaceReservations && state.cachedPlaceReservations[reservationId]) {
    console.log('[ReservationUtils] Have cached data for this ID, skipping fetch');
    return false;
  }
  
  // Check if we're already loading
  if (state.isLoading) {
    console.log('[ReservationUtils] Already loading, skipping fetch');
    return false;
  }
  
  return true;
};

/**
 * Transform page1 data to page4 format
 * @param {Object} page1Data - The page1 reservation data
 * @returns {Object|null} Transformed data in page4 format or null if invalid
 */
export const transformPage1ToPage4 = (page1Data) => {
  // 데이터 유효성 검사: ID와 group_name 또는 customer_name 중 하나는 필수
  if (!page1Data || !page1Data.id || (
    (!page1Data.group_name || page1Data.group_name.trim() === '') && 
    (!page1Data.customer_name || page1Data.customer_name.trim() === '')
  )) {
    console.log('[ReservationUtils] transformPage1ToPage4 - 유효하지 않은 데이터:', 
      page1Data ? `ID: ${page1Data.id}, 이름: ${page1Data.group_name || page1Data.customer_name}` : 'null');
    return null;
  }
  
  try {
    // 데이터 변환: Page1 예약 → Page4 경비 형식
    const transformed = {
      id: page1Data.id,
      project_name: page1Data.group_name || page1Data.customer_name || '무제',
      created_by: page1Data.customer_name || '',
      // page1_data 필드에 모든 page1 정보 포함 (필요한 렌더링용)
      page1_data: {
        id: page1Data.id,
        reservation_status: page1Data.reservation_status || 'preparation',
        business_category: page1Data.business_category || '',
        start_date: page1Data.start_date || '',
        end_date: page1Data.end_date || '',
        group_name: page1Data.group_name || '',
        customer_name: page1Data.customer_name || '',
        email: page1Data.email || '',
        mobile_phone: page1Data.mobile_phone || '',
        landline_phone: page1Data.landline_phone || '',
        total_count: page1Data.total_count || 0,
        notes: page1Data.notes || '',
        createdAt: page1Data.createdAt,
        updatedAt: page1Data.updatedAt
      },
      // 기본 경비 데이터 초기화
      material_count: 0,
      etc_expense_count: 0,
      material_total: 0,
      etc_expense_total: 0,
      // Page1 참조 ID (매핑/중복 방지용)
      page1_id: page1Data.id,
      // 생성/수정 일자 (있는 경우)
      created_at: page1Data.createdAt || new Date().toISOString(),
      updated_at: page1Data.updatedAt || new Date().toISOString()
    };
    
    console.log('[ReservationUtils] transformPage1ToPage4 - 변환 성공:', transformed.id);
    return transformed;
  } catch (error) {
    console.error('[ReservationUtils] transformPage1ToPage4 - 변환 오류:', error);
    return null;
  }
}; 