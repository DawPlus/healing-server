/**
 * Utility for date formatting
 */
const DateFormatter = {
  /**
   * Format a Date object to YYYY-MM-DD string
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string
   */
  format: (date) => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },
  
  /**
   * Parse a date string to Date object
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {Date} Date object
   */
  parse: (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  }
};

export default DateFormatter; 