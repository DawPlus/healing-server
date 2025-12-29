// Force mock data for testing and development

/**
 * Force all API endpoints to use mock data
 */
export const forceMockData = () => {
  if (typeof window !== 'undefined') {
    console.log('[forceMockData] Setting up mock data for all endpoints');
    
    // Initialize request cache if it doesn't exist
    if (!window.requestCache) {
      window.requestCache = {
        notFoundEndpoints: new Set(),
        lastRequested: new Map(),
        failedAttempts: new Map(),
        minRequestInterval: 5000,
        maxRetryAttempts: 3
      };
    }
    
    // Clear any existing endpoints to avoid conflicts
    window.requestCache.notFoundEndpoints.clear();
    
    // Mark endpoints as not found to force mock data usage
    window.requestCache.notFoundEndpoints.add('rooms_all');
    window.requestCache.notFoundEndpoints.add('room_all');
    window.requestCache.notFoundEndpoints.add('place_all');
    window.requestCache.notFoundEndpoints.add('place_reservation_4');
    window.requestCache.notFoundEndpoints.add('place_reservation_pending');
    
    // Set global flag
    window.forceMockData = true;
    
    // Reset API call tracking flags
    window.hasRunRoomsFetch = true;
    window.hasRunPlacesFetch = true;
    window.hasInitializedPlaceReservations = true;
    window.roomsLoadedInHook = true;
    window.placesLoadedInHook = true;
    window.isFetchingRoomsInComponent = false;
    window.isFetchingPlaces = false;
    
    // Reset API response cache
    if (!window.placeReservationsFetched) {
      window.placeReservationsFetched = {};
    }
    window.placeReservationsFetched['4'] = true;
    window.placeReservationsFetched['pending'] = true;
    
    console.log('[forceMockData] Mock data setup complete');
  }
};

// Create global method for debugging
if (typeof window !== 'undefined') {
  window.initializeMockData = forceMockData;
  
  // Auto-execute immediately
  forceMockData();
  
  // Also run on DOMContentLoaded to ensure it runs after page load
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[forceMockData] Running on DOMContentLoaded');
    forceMockData();
  });
}

export default forceMockData; 