// Default mock data for page 3
import moment from 'moment';

/**
 * Creates a default room reservation
 * @param {string} reservationId - The ID of the parent reservation
 * @param {string} startDate - The start date of the reservation
 * @param {string} endDate - The end date of the reservation
 * @returns {Object} A default room reservation object
 */
export const createDefaultRoomReservation = (reservationId, startDate, endDate) => {
  const roomId = Date.now().toString();
  const checkInDate = startDate || moment().format('YYYY-MM-DD');
  const checkOutDate = endDate || moment().add(1, 'days').format('YYYY-MM-DD');
  
  // Calculate total price
  const nights = moment(checkOutDate).diff(moment(checkInDate), 'days');
  const pricePerNight = '100000';
  const totalPrice = (nights * parseInt(pricePerNight)).toString();
  
  return {
    id: `default_room_${roomId}`,
    reservation_id: reservationId || 'pending',
    room_number: '객실 1',
    room_type: '스탠다드 더블',
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    guests_count: '2',
    price_per_night: pricePerNight,
    total_price: totalPrice,
    notes: ''
  };
};

/**
 * Creates a default place reservation
 * @param {string} reservationId - The ID of the parent reservation
 * @param {string} date - The date of the reservation
 * @returns {Object} A default place reservation object
 */
export const createDefaultPlaceReservation = (reservationId, date) => {
  if (!date) {
    console.error('[defaultMockData] No date provided for default place reservation');
    return null;
  }
  
  const placeId = Date.now().toString();
  
  return {
    id: `default_place_${placeId}`,
    reservation_id: reservationId || 'pending',
    place_id: 'mock-2',
    place_name: '세미나실 A',
    place_type: 'meeting_room',
    reservation_date: date,
    start_time: '09:00',
    end_time: '18:00',
    purpose: '회의',
    notes: ''
  };
};

/**
 * Creates a default meal reservation
 * @param {string} reservationId - The ID of the parent reservation
 * @param {string} date - The date of the reservation
 * @returns {Object} A default meal reservation object
 */
export const createDefaultMealReservation = (reservationId, date) => {
  if (!date) {
    console.error('[defaultMockData] No date provided for default meal reservation');
    return null;
  }
  
  const mealId = Date.now().toString();
  
  return {
    id: `default_meal_${mealId}`,
    reservation_id: reservationId || 'pending',
    meal_date: date,
    breakfast_count: '2',
    lunch_count: '2',
    dinner_count: '2',
    dinner_type: 'regular',
    special_requests: '',
    notes: ''
  };
};

/**
 * Creates a full set of default data for a new reservation
 * @param {string} reservationId - The ID of the parent reservation
 * @param {string} startDate - The start date of the reservation
 * @param {string} endDate - The end date of the reservation
 * @returns {Object} An object containing all default data
 */
export const createDefaultReservationData = (reservationId, startDate, endDate) => {
  const checkInDate = startDate || moment().format('YYYY-MM-DD');
  const checkOutDate = endDate || moment().add(1, 'days').format('YYYY-MM-DD');
  
  // Create default room
  const defaultRoom = createDefaultRoomReservation(reservationId, checkInDate, checkOutDate);
  
  // Create default place reservation
  const defaultPlace = createDefaultPlaceReservation(reservationId, checkInDate);
  
  // Create default meal
  const defaultMeal = createDefaultMealReservation(reservationId, checkInDate);
  
  return {
    rooms: [defaultRoom],
    places: defaultPlace ? [defaultPlace] : [],
    meals: defaultMeal ? [defaultMeal] : []
  };
}; 