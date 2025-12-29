/**
 * Utility functions for data formatting and handling
 */

import moment from 'moment';

// Format date for server submission (YYYY-MM-DD)
export const formatDateForServer = (dateString) => {
  if (!dateString) return '';
  
  try {
    const momentDate = moment(dateString);
    if (!momentDate.isValid()) {
      console.error('Invalid date format:', dateString);
      return '';
    }
    return momentDate.format('YYYY-MM-DD');
  } catch (error) {
    console.error('Error formatting date for server:', error);
    return '';
  }
};

// Format date for display
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Use Unix timestamp if it's a number
    if (typeof dateString === 'number') {
      return moment.unix(dateString).format('YYYY-MM-DD');
    }
    // Otherwise treat as regular date string
    return moment(dateString).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Sanitize page1 data for submission
export const sanitizePage1DataForSubmit = (data) => {
  if (!data) return null;
  
  try {
    // Create a deep copy to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Ensure id is an integer
    if (sanitized.id) {
      sanitized.id = parseInt(sanitized.id, 10);
    }
    
    // Sanitize date fields
    if (sanitized.start_date) {
      sanitized.start_date = formatDateForServer(sanitized.start_date);
    }
    
    if (sanitized.end_date) {
      sanitized.end_date = formatDateForServer(sanitized.end_date);
    }
    
    return sanitized;
  } catch (error) {
    console.error('Error sanitizing page1 data:', error);
    return data; // Return original on error
  }
}; 