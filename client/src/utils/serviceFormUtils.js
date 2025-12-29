import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

/**
 * Create a new row with initial values
 * @param {Object} initRow - Initial row values
 * @returns {Object} - A new row with UUID and empty values
 */
export const createNewRow = (initRow) => ({
  ...initRow,
  idx: uuidv4(),
  chk: false
});

/**
 * Process Excel data into rows for the table
 * @param {Array} excelData - Excel data from the uploader
 * @param {Object} mapping - Mapping from excel columns to row properties
 * @param {Object} initRow - Initial row values
 * @returns {Array} - Processed rows
 */
export const processExcelData = (excelData, mapping, initRow) => {
  if (!excelData || !excelData.data || excelData.data.length === 0) {
    return [];
  }

  return excelData.data.map((row, idx) => {
    const processedRow = { ...initRow, idx: uuidv4(), chk: false };
    
    // Apply mapping from excel columns to row properties
    Object.entries(mapping).forEach(([fieldName, colIndex]) => {
      const colName = `col${colIndex}`;
      if (row[colName] !== undefined) {
        processedRow[fieldName] = row[colName] || "";
      }
    });
    
    return processedRow;
  });
};

/**
 * Extract GraphQL entries from rows
 * @param {Array} rows - Rows from the table
 * @param {Array} fields - Fields to extract for GraphQL
 * @returns {Array} - Entries for GraphQL mutation
 */
export const extractGraphQLEntries = (rows, fields) => {
  return rows.map(row => {
    const entry = {};
    fields.forEach(field => {
      const { name, graphqlName } = field;
      entry[graphqlName || name.toLowerCase()] = row[name] || "";
    });
    return entry;
  });
};

/**
 * Transform GraphQL response to table rows
 * @param {Array} graphqlData - Data from GraphQL response
 * @param {Object} mapping - Mapping from GraphQL fields to row properties
 * @param {Object} initRow - Initial row values
 * @returns {Array} - Transformed rows
 */
export const transformGraphQLToRows = (graphqlData, mapping, initRow) => {
  if (!graphqlData || graphqlData.length === 0) {
    return [];
  }

  return graphqlData.map(item => {
    const row = { ...initRow, idx: uuidv4(), chk: false };
    
    // Apply mapping from GraphQL fields to row properties
    Object.entries(mapping).forEach(([graphqlField, rowField]) => {
      row[rowField] = item[graphqlField] || "";
    });
    
    return row;
  });
};

/**
 * Show a confirmation dialog and execute the callback if confirmed
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @param {Function} onConfirm - Callback to execute if confirmed
 */
export const showConfirmDialog = (title, text, onConfirm) => {
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

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Parse agency user from string
 * @param {string} value - Agency string (format: "agency/openday")
 * @returns {Object} - Parsed agency and openday
 */
export const parseAgencyUser = (value) => {
  const [agency, openday] = value ? value.split('/') : [null, null];
  return { agency, openday };
};

/**
 * Validate search info fields are not empty
 * @param {Object} searchInfo - Search info object
 * @param {Array} requiredFields - Required field names
 * @returns {boolean} - Whether all required fields are filled
 */
export const validateSearchInfo = (searchInfo, requiredFields) => {
  return requiredFields.every(field => searchInfo[field]);
}; 