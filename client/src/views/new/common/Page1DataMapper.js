/**
 * Utility functions for mapping data between Page1 and Page2
 * This can be imported across different files to maintain consistent data transformation
 */
import moment from 'moment';

/**
 * Maps Page1 data fields to Page2 format
 * @param {Object} page1Data - Data from Page1
 * @returns {Object} Transformed data in Page2 format
 */
export const mapPage1ToPage2 = (page1Data) => {
  if (!page1Data) return {};
  
  // Map business category fields
  const businessType = page1Data.business_category === 'profit_business' ? 'profit' : 'social_contribution';
  const subCategory = page1Data.business_subcategory || '';
  const detailCategory = page1Data.business_detail_category || '';
  
  // Map detail category to group type for UI state
  let groupType = '';
  if (subCategory === 'individual') {
    switch(detailCategory) {
      case 'general_customer': groupType = 'general'; break;
      case 'local_resident': groupType = 'local'; break;
      case 'employee_discount': groupType = 'employee'; break;
      case 'instructor_driver': groupType = 'instructor'; break;
      case 'etc': groupType = 'other'; break;
      default: groupType = '';
    }
  } else if (subCategory === 'group') {
    switch(detailCategory) {
      case 'general_group': groupType = 'general'; break;
      case 'local_group': groupType = 'local'; break;
      default: groupType = '';
    }
  }
  
  // Return transformed data
  return {
    // Basic info transferred from Page1
    reservation_status: page1Data.reservation_status || 'preparation',
    start_date: page1Data.start_date,
    end_date: page1Data.end_date,
    group_name: page1Data.group_name || '',
    customer_name: page1Data.customer_name || '',
    email: page1Data.email || '',
    landline_phone: page1Data.landline_phone || '',
    mobile_phone: page1Data.mobile_phone || '',
    male_count: page1Data.male_count || '',
    female_count: page1Data.female_count || '',
    total_count: page1Data.total_count || '',
    reservation_manager: page1Data.reservation_manager || '',
    operation_manager: page1Data.operation_manager || '',
    notes: page1Data.notes || '',
    page1_id: page1Data.id,
    
    // Page2 specific fields - mapped from Page1
    business_type: businessType,
    sub_category: subCategory,
    detail_category: detailCategory,
    
    // Default values for additional fields - only applied for profit business
    participant_type: businessType === 'profit' ? 'employee' : '',
    group_type: businessType === 'profit' ? groupType : '',
    service_type: businessType === 'profit' ? 'healing' : '',
    region: '서울',
    
    // Store original Page1 values for reference
    business_category: page1Data.business_category,
    business_subcategory: page1Data.business_subcategory,
    business_detail_category: page1Data.business_detail_category
  };
};

/**
 * Maps Page1 data fields to Page3 format
 * @param {Object} page1Data - Data from Page1
 * @returns {Object} Transformed data in Page3 format
 */
export const mapPage1ToPage3 = (page1Data) => {
  if (!page1Data) return {};
  
  return {
    id: page1Data.id,
    reservation_status: page1Data.reservation_status || 'preparation',
    start_date: page1Data.start_date,
    end_date: page1Data.end_date,
    company_name: page1Data.group_name || '',
    department: page1Data.business_subcategory || '',  // Using business_subcategory as department
    contact_person: page1Data.customer_name || '',
    position: page1Data.business_detail_category || '', // Using business_detail_category as position
    participants_count: parseInt(page1Data.total_count) || 0,
    room_count: Math.ceil((parseInt(page1Data.total_count) || 0) / 2), // Estimate: 2 people per room
    email: page1Data.email || '',
    phone: page1Data.mobile_phone || page1Data.landline_phone || '',
    purpose: page1Data.business_category || '', // Using business_category as purpose
    catering_required: false,
    special_requirements: page1Data.notes || '',
    room_selections: [],
    meal_plans: [],
    place_reservations: [],
    page1_id: page1Data.id,
    
    // Additional fields for reference
    reservation_manager: page1Data.reservation_manager || '',
    operation_manager: page1Data.operation_manager || ''
  };
};

/**
 * Apply default values to form data if missing
 * @param {Object} formData - Current form data
 * @returns {Object} Form data with defaults applied
 */
export const applyDefaultValues = (formData) => {
  if (!formData) return {};
  
  const updatedFormData = { ...formData };
  
  // Apply defaults only if fields are missing
  // Set different defaults based on business type
  const isSocialContribution = 
    updatedFormData.business_type === 'social_contribution' || 
    updatedFormData.business_category === 'social_contribution';
  
  if (!updatedFormData.business_type) updatedFormData.business_type = 'social_contribution';
  
  // Only apply these if not social contribution
  if (!isSocialContribution) {
    if (!updatedFormData.sub_category) updatedFormData.sub_category = 'corporate_csr';
    if (!updatedFormData.participant_type) updatedFormData.participant_type = 'employee';
    if (!updatedFormData.group_type) updatedFormData.group_type = 'company';
    if (!updatedFormData.service_type) updatedFormData.service_type = 'healing';
  }
  
  // These defaults apply to all business types
  if (!updatedFormData.age_group) updatedFormData.age_group = 'adult';
  if (!updatedFormData.participation_form) updatedFormData.participation_form = 'reservation';
  if (!updatedFormData.region) updatedFormData.region = '서울';
  
  // New fields defaults
  if (!updatedFormData.org_nature) updatedFormData.org_nature = '';
  if (!updatedFormData.part_type) updatedFormData.part_type = '';
  if (!updatedFormData.age_type) updatedFormData.age_type = '';
  if (!updatedFormData.part_form) updatedFormData.part_form = '';
  if (!updatedFormData.service_type) updatedFormData.service_type = 'healing';
  
  return updatedFormData;
};

/**
 * Translate business category values for display
 * @param {String} businessCategory - Business category code
 * @returns {String} Translated display value
 */
export const translateBusinessCategory = (businessCategory) => {
  switch(businessCategory) {
    case 'social_contribution': return '사회공헌';
    case 'profit_business': 
    case 'profit': return '수익사업';
    default: return businessCategory || '-';
  }
};

/**
 * Translate sub-category values for display
 * @param {String} subCategory - Sub-category code
 * @returns {String} Translated display value
 */
export const translateSubCategory = (subCategory) => {
  switch(subCategory) {
    case 'group': return '단체';
    case 'forest_education': return '산림교육';
    case 'individual': return '개인고객';
    case 'corporate_csr': return '사회공헌';
    case 'family': return '가족';
    default: return subCategory || '-';
  }
};

/**
 * Translate detail category values for display
 * @param {String} detailCategory - Detail category code
 * @returns {String} Translated display value
 */
export const translateDetailCategory = (detailCategory) => {
  switch(detailCategory) {
    // Individual customer types
    case 'general_customer': return '일반고객';
    case 'local_resident': return '지역주민';
    case 'employee_discount': return '직원할인';
    case 'instructor_driver': return '강사 및 기사';
    case 'etc': return '기타';
    
    // Group types
    case 'general_group': return '일반단체';
    case 'local_group': return '지역단체';
    
    // Forest education types
    case 'teacher_training': return '산림바우처';
    case 'forest_voucher': return '산림바우처';
    
    default: return detailCategory || '-';
  }
};

/**
 * Format date for sending to the server
 * @param {String|Number} dateValue - Date value to format
 * @returns {String|null} Formatted date string or null
 */
export const formatDateForServer = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // If it's already a Unix timestamp (number)
    if (typeof dateValue === 'number') {
      return moment(dateValue * 1000).format('YYYY-MM-DD');
    }
    // Try to parse as ISO string or other date format
    return moment(dateValue).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error for server:', error);
    return null;
  }
};

/**
 * Sanitize Page1 data for API submission, removing fields not accepted in the Page1Input type
 * @param {Object} page1Data - Original Page1 data
 * @returns {Object} Sanitized data for API submission
 */
export const sanitizePage1DataForSubmit = (page1Data) => {
  if (!page1Data) return {};
  
  // Extract only the fields that are valid for Page1Input
  const {
    reservation_status,
    start_date,
    end_date,
    group_name,
    customer_name,
    total_count,
    email,
    mobile_phone,
    landline_phone,
    notes,
    business_category,
    business_subcategory,
    business_detail_category,
    reservation_manager,
    operation_manager,
    region,
    is_mine_area
  } = page1Data;
  
  // Construct a new object with only valid fields
  const sanitizedData = {
    reservation_status: reservation_status || 'preparation',
    start_date,
    end_date,
    group_name,
    customer_name,
    total_count: total_count ? parseInt(total_count) : null,
    email,
    mobile_phone,
    landline_phone,
    notes,
    business_category,
    business_subcategory,
    business_detail_category,
    reservation_manager,
    operation_manager,
    region,
    is_mine_area,
    // Include these required fields with defaults
    create_user: 'admin',
    update_user: 'admin'
  };
  
  // Add id if it exists for updates
  if (page1Data.id) {
    sanitizedData.id = parseInt(page1Data.id);
  }
  
  return sanitizedData;
}; 