/**
 * Service module for fetching menu data using GraphQL (categories, programs, instructors, etc.)
 */
import { gql } from '@apollo/client';
import apolloClient from 'utils/apolloClient';

// GraphQL Queries for new integrated menu system
const GET_PROGRAM_CATEGORIES = gql`
  query ProgramCategories {
    programCategories {
      id
      category_name
      description
      display_order
      created_at
      updated_at
    }
  }
`;

const GET_PROGRAM_ITEMS = gql`
  query ProgramItems {
    programItems {
      id
      program_name
      category_id
      description
      display_order
      created_at
      updated_at
      category {
        id
        category_name
      }
    }
  }
`;

const GET_LOCATIONS = gql`
  query Locations {
    locations {
      id
      location_name
      category_id
      capacity
      description
      display_order
      created_at
      updated_at
      category {
        id
        category_name
      }
    }
  }
`;

const GET_INSTRUCTORS = gql`
  query Instructors {
    instructors {
      id
      name
      specialty
      phone
      email
      description
      created_at
      updated_at
    }
  }
`;

const GET_ASSISTANTS = gql`
  query AssistantInstructors {
    assistantInstructors {
      id
      name
      specialty
      phone
      email
      description
      created_at
      updated_at
    }
  }
`;

const GET_HELPERS = gql`
  query Helpers {
    helpers {
      id
      name
      specialty
      phone
      email
      description
      created_at
      updated_at
    }
  }
`;

/**
 * Fetch menu data for dropdowns using GraphQL
 * @param {Function} setCategories - State setter for categories
 * @param {Function} setMenuPrograms - State setter for menu programs
 * @param {Function} setLocations - State setter for locations
 * @param {Function} setInstructors - State setter for instructors
 * @param {Function} setAssistants - State setter for assistants
 * @param {Function} setHelpers - State setter for helpers
 * @param {Function} setAlertOpen - State setter for alert open state
 * @param {Function} setAlertMessage - State setter for alert message
 * @param {Function} setAlertSeverity - State setter for alert severity
 * @param {Object} isMounted - Ref to track if component is mounted
 * @returns {Promise<void>}
 */
export const fetchMenuData = async (
  setCategories,
  setMenuPrograms,
  setLocations,
  setInstructors,
  setAssistants,
  setHelpers,
  setAlertOpen,
  setAlertMessage,
  setAlertSeverity,
  isMounted
) => {
  try {
    // 로딩 상태 표시
    setAlertOpen(true);
    setAlertMessage('통합 메뉴 데이터를 불러오는 중입니다...');
    setAlertSeverity('info');
    
    console.log('[MenuService] ============ FETCHING MENU DATA USING GRAPHQL (for dropdown menus) ============');
    
    // GraphQL 쿼리 실행 함수
    const executeQuery = async (query, label) => {
      try {
        console.log(`[MenuService] Fetching ${label} using GraphQL`);
        const { data } = await apolloClient.query({ 
          query,
          fetchPolicy: 'network-only' // 항상 최신 데이터를 서버에서 가져옴
        });
        
        // Extract data from response based on the query name
        const queryName = Object.keys(data)[0];
        const responseData = data[queryName] || [];
        
        console.log(`[MenuService] Successfully fetched ${responseData.length} ${label} items`);
        
        // 첫 번째 항목을 로그로 출력하여 디버깅 (데이터가 있을 경우)
        if (responseData.length > 0) {
          console.log(`[MenuService] First ${label} item sample:`, responseData[0]);
        }
        
        return responseData;
      } catch (error) {
        console.error(`[MenuService] Error fetching ${label} with GraphQL:`, error);
        return [];
      }
    };
    
    // Fetch data in parallel using GraphQL
    const [
      categoryData,
      programData,
      locationData,
      instructorData,
      assistantData,
      helperData
    ] = await Promise.all([
      executeQuery(GET_PROGRAM_CATEGORIES, 'categories'),
      executeQuery(GET_PROGRAM_ITEMS, 'programs'),
      executeQuery(GET_LOCATIONS, 'locations'),
      executeQuery(GET_INSTRUCTORS, 'instructors'),
      executeQuery(GET_ASSISTANTS, 'assistants'),
      executeQuery(GET_HELPERS, 'helpers')
    ]);
    
    // Set state with fetched data
    setCategories(categoryData);
    setMenuPrograms(programData);
    setLocations(locationData);
    setInstructors(instructorData);
    setAssistants(assistantData);
    setHelpers(helperData);
    
    // Log results
    console.log(`[MenuService] Categories: ${categoryData.length}`);
    console.log(`[MenuService] Programs: ${programData.length}`);
    console.log(`[MenuService] Locations: ${locationData.length}`);
    console.log(`[MenuService] Instructors: ${instructorData.length}`);
    console.log(`[MenuService] Assistants: ${assistantData.length}`);
    console.log(`[MenuService] Helpers: ${helperData.length}`);
    
    // Check if we were able to get any data
    const hasData = categoryData.length > 0 || 
                   programData.length > 0 || 
                   locationData.length > 0;
    
    // Show appropriate message based on success
    if (hasData) {
      setAlertMessage('메뉴 데이터를 불러왔습니다.');
      setAlertSeverity('success');
    } else {
      setAlertMessage('메뉴 데이터를 불러오지 못했습니다. GraphQL 서버 연결에 문제가 있습니다.');
      setAlertSeverity('warning');
    }
    
    console.log('[MenuService] ============ MENU DATA FETCH COMPLETED ============');
    
    // Always close the alert after a delay
    setTimeout(() => {
      if (isMounted && isMounted.current) {
        setAlertOpen(false);
      }
    }, 3000);
  } catch (error) {
    console.error('[MenuService] Error loading integrated menu data:', error);
    setAlertMessage('메뉴 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    setAlertSeverity('error');
    
    // 5초 후 알림 닫기
    setTimeout(() => {
      if (isMounted && isMounted.current) {
        setAlertOpen(false);
      }
    }, 5000);
  }
}; 