import apolloClient from 'utils/apolloClient';
import { 
  GET_AGENCIES_BY_TYPE, 
  GET_PROGRAM_RESULT, 
  GET_FACILITY_LIST, 
  GET_PREVENT_LIST, 
  GET_HEALING_LIST 
} from '../graphql/agencyList';

/**
 * Get agencies by type
 * @param {Object} param - Parameters
 * @param {string} param.type - Type of agencies
 * @returns {Promise<Object>} - GraphQL query result
 */
const getProgramAgency = async (param) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_AGENCIES_BY_TYPE,
      variables: { type: param.type },
      fetchPolicy: 'network-only'
    });
    return { data: data.getAgenciesByType };
  } catch (error) {
    console.error('Error getting agencies:', error);
    throw error;
  }
};

/**
 * Get program results
 * @param {Object} param - Parameters
 * @param {string} param.type - Type of program
 * @param {string} param.agency - Agency name
 * @param {number} param.agency_id - Agency ID
 * @param {string} param.openday - Start date
 * @param {string} param.endday - End date
 * @param {string} param.inType - Participation type
 * @returns {Promise<Object>} - GraphQL query result
 */
const getProgramResult = async (param) => {
  try {
    // Different queries based on type
    let query;
    let queryName;
    
    switch (param.type) {
      case '1':
        query = GET_PROGRAM_RESULT;
        queryName = 'getProgramResult';
        break;
      case '2':
        query = GET_FACILITY_LIST;
        queryName = 'getFacilityList';
        break;
      case '4':
        query = GET_PREVENT_LIST;
        queryName = 'getPreventList';
        break;
      case '5':
        query = GET_HEALING_LIST;
        queryName = 'getHealingList';
        break;
      default:
        throw new Error(`Unknown type: ${param.type}`);
    }
    
    const { data } = await apolloClient.query({
      query,
      variables: { 
        type: param.type,
        agency: param.agency,
        agency_id: param.agency_id ? parseInt(param.agency_id) : null,
        openday: param.openday || null,
        endday: param.endday || null,
        inType: param.inType || null
      },
      fetchPolicy: 'network-only'
    });
    
    return { data: data[queryName] };
  } catch (error) {
    console.error('Error getting program results:', error);
    throw error;
  }
};

/**
 * Functions that still use the REST API
 * These should be migrated to GraphQL in the future
 */
const getSearchResult = (param) => {
  throw new Error('Not implemented with GraphQL yet');
};

const getPartTypeList = (param) => {
  throw new Error('Not implemented with GraphQL yet');
};

const getResidenceList = (param) => {
  throw new Error('Not implemented with GraphQL yet');
};

const programManage = (param) => {
  throw new Error('Not implemented with GraphQL yet');
};

const api = {
  getProgramAgency,
  getProgramResult,
  getSearchResult,
  getPartTypeList,
  getResidenceList,
  programManage
};

export default api; 