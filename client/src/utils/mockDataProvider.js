// mockDataProvider.js - Provides mock data when API endpoints are not available

/**
 * Mock data for room listings when the API endpoint is unavailable
 * This helps maintain UI functionality even when backend services are down
 */
export const mockRooms = [
  {
    id: 'mock-1',
    room_name: '스탠다드 트윈',
    room_number: '101',
    price: '100000',
    max_guests: 2,
    description: '기본 2인실',
    is_active: true
  },
  {
    id: 'mock-2',
    room_name: '디럭스 더블',
    room_number: '201',
    price: '150000',
    max_guests: 2,
    description: '고급 2인실',
    is_active: true
  },
  {
    id: 'mock-3',
    room_name: '스위트',
    room_number: '301',
    price: '200000',
    max_guests: 4,
    description: '고급 4인실 스위트',
    is_active: true
  },
  {
    id: 'mock-4',
    room_name: '패밀리룸',
    room_number: '401',
    price: '250000',
    max_guests: 6,
    description: '가족용 대형 객실',
    is_active: true
  },
  {
    id: 'mock-5',
    room_name: '이코노미 싱글',
    room_number: '102',
    price: '80000',
    max_guests: 1,
    description: '경제적인 1인실',
    is_active: true
  }
];

/**
 * Mock data for places when the API endpoint is unavailable
 */
export const mockPlaces = [
  {
    id: 'mock-1',
    name: '대강당',
    category_name: '예약/회의실',
    max_capacity: 100,
    is_active: true
  },
  {
    id: 'mock-2',
    name: '세미나실 A',
    category_name: '예약/회의실',
    max_capacity: 20,
    is_active: true
  },
  {
    id: 'mock-3',
    name: '야외 정원',
    category_name: '예약/행사장',
    max_capacity: 50,
    is_active: true
  },
  {
    id: 'mock-4',
    name: '소회의실 B',
    category_name: '예약/회의실',
    max_capacity: 10,
    is_active: true
  },
  {
    id: 'mock-5',
    name: '식당 홀',
    category_name: '예약/식당',
    max_capacity: 80,
    is_active: true
  }
];

/**
 * Mock data for place reservations
 */
export const mockPlaceReservations = [
  {
    id: 'mock-pr-1',
    reservation_id: '4',
    place_id: 'mock-1',
    place_name: '대강당',
    place_type: 'conference_hall',
    reservation_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '12:00',
    purpose: '컨퍼런스',
    notes: ''
  },
  {
    id: 'mock-pr-2',
    reservation_id: '4',
    place_id: 'mock-2',
    place_name: '세미나실 A',
    place_type: 'meeting_room',
    reservation_date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    purpose: '세미나',
    notes: ''
  }
];

/**
 * Gets mock data based on request type
 * @param {string} requestType - The type of data to retrieve ('room', 'place', etc.)
 * @return {Array} The mock data array
 */
export const getMockData = (requestType) => {
  switch (requestType) {
    case 'room':
    case 'rooms':
      return [...mockRooms];
    case 'place':
      return [...mockPlaces];
    case 'place_reservations':
      return [...mockPlaceReservations];
    default:
      console.log(`[MockDataProvider] No mock data available for type: ${requestType}, returning empty array`);
      return [];
  }
};

/**
 * Force use of mock data for testing
 * @param {boolean} force - Whether to force use of mock data
 */
export const forceMockData = (force = true) => {
  if (typeof window !== 'undefined') {
    window.forceMockData = force;
    
    if (force && !window.requestCache) {
      window.requestCache = {
        notFoundEndpoints: new Set(),
        lastRequested: new Map(),
        failedAttempts: new Map()
      };
    }
    
    // Mark all common endpoints as not found to force mock data usage
    if (force && window.requestCache) {
      console.log('[MockDataProvider] Forcing use of mock data for all endpoints');
      window.requestCache.notFoundEndpoints.add('rooms_all');
      window.requestCache.notFoundEndpoints.add('room_all');
      window.requestCache.notFoundEndpoints.add('place_all');
      window.requestCache.notFoundEndpoints.add('place_reservation_4');
    }
  }
};

/**
 * Checks if an endpoint has been marked as not found
 * @param {string} requestKey - The request key to check
 * @param {Object} requestCache - The request cache object
 * @return {boolean} True if the endpoint is marked as not found
 */
export const isEndpointNotFound = (requestKey, requestCache) => {
  return requestCache && requestCache.notFoundEndpoints && 
         requestCache.notFoundEndpoints.has(requestKey);
};

// Automatically force mock data if in development mode
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
  forceMockData(true);
} 