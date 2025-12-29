import moment from 'moment';

/**
 * Format a date for display in consistent YYYY-MM-DD format
 * @param {string|number} dateValue - Date string or Unix timestamp
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    // Handle Unix timestamp (number)
    if (typeof dateValue === 'number') {
      return moment.unix(dateValue).format('YYYY-MM-DD');
    }
    // Handle date string
    return moment(dateValue).format('YYYY-MM-DD');
  } catch (error) {
    console.error('[DateUtils] Format display error:', error);
    return '';
  }
};

/**
 * Format a date for API requests in YYYY-MM-DD format
 * @param {string|number} dateValue - Date string or Unix timestamp 
 * @returns {string|null} Formatted date string or null
 */
export const formatDateForAPI = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // Handle Unix timestamp (number)
    if (typeof dateValue === 'number') {
      return moment.unix(dateValue).format('YYYY-MM-DD');
    }
    // Convert to YYYY-MM-DD format for API
    return moment(dateValue).format('YYYY-MM-DD');
  } catch (error) {
    console.error('[DateUtils] Format API error:', error);
    return null;
  }
};

/**
 * Calculate the number of nights between two dates
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {number} Number of nights
 */
export const calculateNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  } catch (error) {
    console.error('[DateUtils] Calculate nights error:', error);
    return 0;
  }
};

/**
 * Generate array of dates between start and end dates
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Array} Array of date strings in YYYY-MM-DD format
 */
export const generateDateArray = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return [];
  }
  
  try {
    const start = moment(startDate);
    const end = moment(endDate);
    
    if (!start.isValid() || !end.isValid()) {
      return [];
    }
    
    const days = end.diff(start, 'days') + 1; // Include end date
    
    if (days <= 0) {
      return [];
    }
    
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = start.clone().add(i, 'days');
      dates.push(date.format('YYYY-MM-DD'));
    }
    
    return dates;
  } catch (error) {
    console.error('[DateUtils] Error generating date array:', error);
    return [];
  }
}; 