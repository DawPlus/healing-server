import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import moment from 'moment';
import Swal from 'sweetalert2';
import {
  GET_PAGE5_RESERVATION_LIST,
  GET_PAGE5_RESERVATION_DETAIL,
  GET_PAGE5_CALENDAR_DATA,
  GET_PAGE5_STATISTICS,
  GET_PAGE5_SCHEDULE_DATA,
  CREATE_PAGE5_DOCUMENT,
  UPDATE_PAGE5_DOCUMENT,
  DELETE_PAGE5_DOCUMENT
} from '../graphql';

// Format date for display
export const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  
  try {
    // Handle different date formats
    if (typeof dateValue === 'number') {
      return moment.unix(dateValue).format('YYYY-MM-DD');
    }
    
    if (typeof dateValue === 'object' && dateValue !== null) {
      if (dateValue.unix) {
        return moment.unix(dateValue.unix).format('YYYY-MM-DD');
      } else if (dateValue.formatted) {
        return dateValue.formatted;
      } else if (dateValue.raw) {
        return moment(dateValue.raw).format('YYYY-MM-DD');
      }
    }
    
    if (typeof dateValue === 'string') {
      if (dateValue === '0000-00-00') return '-';
      return moment(dateValue).format('YYYY-MM-DD');
    }
    
    return '-';
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

// Get status chip color based on reservation status
export const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return '#4CAF50'; // Green
    case 'pending':
    case 'preparation':
      return '#e0e0e0'; // Amber
    case 'cancelled':
      return '#F44336'; // Red
    default:
      return '#2196F3'; // Blue
  }
};

// Create a showAlert helper function
export const showAlert = (message, type = 'info') => {
  return Swal.fire({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    text: message,
    icon: type,
    confirmButtonText: '확인'
  });
};

// Fetch Page1 data for Page5 using GraphQL
export const fetchAllPage1DataForPage5 = async (client) => {
  try {
    const { data } = await client.query({
      query: GET_PAGE5_RESERVATION_LIST,
      fetchPolicy: 'network-only'
    });
    
    return data.getPage1List;
  } catch (error) {
    console.error('Error fetching page1 data for page5:', error);
    showAlert('예약 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    return [];
  }
};

// Fetch detailed data for a specific reservation by ID
export const fetchPage5DataByPage1Id = async (page1Id, client) => {
  try {
    if (!page1Id) {
      console.error('No page1_id provided');
      showAlert('Page1 ID가 필요합니다.', 'warning');
      return null;
    }
    
    console.log(`Fetching page5 data for page1_id: ${page1Id}`);
    
    const { data } = await client.query({
      query: GET_PAGE5_RESERVATION_DETAIL,
      variables: { id: parseInt(page1Id) },
      fetchPolicy: 'network-only'
    });
    
    return data.getPage1ById;
  } catch (error) {
    console.error('Error fetching page5 data:', error);
    showAlert('예약 상세 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    return null;
  }
};

// Fetch calendar data
export const fetchCalendarData = async (client, month, year) => {
  try {
    const { data } = await client.query({
      query: GET_PAGE5_CALENDAR_DATA,
      variables: { month, year },
      fetchPolicy: 'network-only'
    });
    
    return data.getCalendarData;
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    showAlert('달력 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    return [];
  }
};

// Fetch statistics for order reports
export const fetchStatistics = async (client, period, type) => {
  try {
    const { data } = await client.query({
      query: GET_PAGE5_STATISTICS,
      variables: { period, type },
      fetchPolicy: 'network-only'
    });
    
    return data.getStatistics;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    showAlert('통계 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    return null;
  }
};

// Fetch schedule data
export const fetchScheduleData = async (client, startDate, endDate) => {
  try {
    const { data } = await client.query({
      query: GET_PAGE5_SCHEDULE_DATA,
      variables: { startDate, endDate },
      fetchPolicy: 'network-only'
    });
    
    if (!data.getScheduleData) {
      console.error('No schedule data returned');
      return [];
    }
    
    return data.getScheduleData;
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    showAlert('일정 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    return [];
  }
};

// Create a new Page5 document
export const createPage5Document = async (client, documentData) => {
  try {
    const { data } = await client.mutate({
      mutation: CREATE_PAGE5_DOCUMENT,
      variables: { input: documentData }
    });
    
    if (data.createPage5Document) {
      showAlert('문서가 성공적으로 생성되었습니다.', 'success');
      return data.createPage5Document;
    }
    return null;
  } catch (error) {
    console.error('Error creating document:', error);
    showAlert('문서 생성 중 오류가 발생했습니다.', 'error');
    return null;
  }
};

// Update an existing Page5 document
export const updatePage5Document = async (client, id, documentData) => {
  try {
    const { data } = await client.mutate({
      mutation: UPDATE_PAGE5_DOCUMENT,
      variables: { 
        id: parseInt(id), 
        input: documentData 
      }
    });
    
    if (data.updatePage5Document) {
      showAlert('문서가 성공적으로 업데이트되었습니다.', 'success');
      return data.updatePage5Document;
    }
    return null;
  } catch (error) {
    console.error('Error updating document:', error);
    showAlert('문서 업데이트 중 오류가 발생했습니다.', 'error');
    return null;
  }
};

// Delete a Page5 document
export const deletePage5Document = async (client, id) => {
  try {
    // Ask for confirmation before deleting
    const confirmation = await Swal.fire({
      title: '문서 삭제',
      text: '이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
    
    if (!confirmation.isConfirmed) {
      return false;
    }
    
    const { data } = await client.mutate({
      mutation: DELETE_PAGE5_DOCUMENT,
      variables: { id: parseInt(id) }
    });
    
    if (data.deletePage5Document) {
      showAlert('문서가 성공적으로 삭제되었습니다.', 'success');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting document:', error);
    showAlert('문서 삭제 중 오류가 발생했습니다.', 'error');
    return false;
  }
};

// Format currency for display
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', { 
    style: 'currency', 
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(amount);
}; 