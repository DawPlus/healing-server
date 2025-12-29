// Utility functions for service forms

/**
 * Validates if search info contains required fields
 * @param {Object} searchInfo - The search info object
 * @param {string} formType - The type of form being validated (optional)
 * @returns {boolean} - Whether the search info is valid
 */
export const validateSearchInfo = (searchInfo, formType = '') => {
  if (!searchInfo) return false;
  
  // Check if agency or agency_id exists (기관명)
  const hasAgency = Boolean(searchInfo.agency && searchInfo.agency.trim() !== '') || 
                    (searchInfo.agency_id && searchInfo.agency_id !== '' && searchInfo.agency_id !== null);
  
  // Check if at least one date field exists (시작일자 or 실시일자)
  const hasDate = Boolean(searchInfo.openday && searchInfo.openday.trim() !== '') || 
                  Boolean(searchInfo.eval_date && searchInfo.eval_date.trim() !== '');
  
  if (!hasAgency || !hasDate) {
    // Import sweetalert2 for showing alerts
    const Swal = require('sweetalert2');
    
    Swal.fire({
      icon: 'warning',
      title: '필수 입력 항목 누락',
      text: `${formType ? `${formType} 양식에서 ` : ''}기관명과 일자(시작일/실시일) 중 하나 이상 필수입니다.`,
    });
    
    return false;
  }
  
  return true;
};

/**
 * Clear form data when search results are empty
 * @param {Function} setRows - State setter for rows
 * @param {Object} initRowData - Initial row data structure
 * @param {Function} uuidv4 - UUID generator function
 */
export const clearFormData = (setRows, initRowData, uuidv4) => {
  setRows([{ ...initRowData, idx: uuidv4() }]);
};

/**
 * Parse agency info from slash-separated string (agency/date) or from reservation object
 * @param {string|Object} agencyInfo - Agency info string "agencyName/date" or reservation object
 * @returns {Object} - Parsed agency object { agency, agency_id, openday, eval_date }
 */
export const parseAgencyInfo = (agencyInfo) => {
  if (!agencyInfo) return { agency: null, openday: null };
  
  // If agencyInfo is an object (from Autocomplete)
  if (typeof agencyInfo === 'object') {
    return {
      agency: agencyInfo.group_name || null,
      agency_id: agencyInfo.id || null,
      openday: agencyInfo.start_date || null,
      eval_date: agencyInfo.end_date || null
    };
  }
  
  // If agencyInfo is a string (legacy format)
  const parts = agencyInfo.split("/");
  if (parts.length < 2) return { agency: null, openday: null };
  
  return {
    agency: parts[0],
    openday: parts[1]
  };
};

/**
 * Format date to YYYY-MM-DD
 * @returns {string} - Current date in YYYY-MM-DD format
 */
export const formatDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converts a value to string safely, returning empty string for null/undefined
 * @param {*} value - The value to convert to string
 * @returns {string} - String representation or empty string if null/undefined
 */
export const toSafeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

/**
 * Create a confirmation dialog using Swal
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @param {Function} onConfirm - Function to call on confirm
 */
export const showConfirmDialog = (title, text, onConfirm) => {
  const Swal = require('sweetalert2');
  
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#767676',
    confirmButtonText: '확인',
    cancelButtonText: '취소'
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
}; 