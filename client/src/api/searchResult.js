import apolloClient from 'utils/apolloClient';
import { 
  SEARCH_PROGRAM_RESULTS, 
  SEARCH_FACILITY_RESULTS,
  SEARCH_PREVENT_RESULTS,
  SEARCH_HEALING_RESULTS,
  GET_AGENCY_LIST
} from '../graphql/searchResult';

/**
 * Search for program results
 * @param {Object} params - Search parameters
 * @param {string} params.openday - Start date (optional)
 * @param {string} params.endday - End date (optional)
 * @param {Array} params.keywords - Keyword filters (optional)
 * @returns {Promise<Object>} - GraphQL query result
 */
const searchProgramResults = async (params) => {
  try {
    const { data } = await apolloClient.query({
      query: SEARCH_PROGRAM_RESULTS,
      variables: { 
        openday: params.openday || null,
        endday: params.endday || null,
        keywords: params.keywords || null
      },
      fetchPolicy: 'network-only'
    });
    return { data: data.searchProgramResults };
  } catch (error) {
    console.error('Error searching program results:', error);
    throw error;
  }
};

/**
 * Search for facility results
 * @param {Object} params - Search parameters
 * @param {string} params.openday - Start date (optional)
 * @param {string} params.endday - End date (optional)
 * @param {Array} params.keywords - Keyword filters (optional)
 * @returns {Promise<Object>} - GraphQL query result
 */
const searchFacilityResults = async (params) => {
  try {
    const { data } = await apolloClient.query({
      query: SEARCH_FACILITY_RESULTS,
      variables: { 
        openday: params.openday || null,
        endday: params.endday || null,
        keywords: params.keywords || null
      },
      fetchPolicy: 'network-only'
    });
    return { data: data.searchFacilityResults };
  } catch (error) {
    console.error('Error searching facility results:', error);
    throw error;
  }
};

/**
 * Search for prevent results
 * @param {Object} params - Search parameters
 * @param {string} params.openday - Start date (optional)
 * @param {string} params.endday - End date (optional)
 * @param {Array} params.keywords - Keyword filters (optional)
 * @returns {Promise<Object>} - GraphQL query result
 */
const searchPreventResults = async (params) => {
  try {
    const { data } = await apolloClient.query({
      query: SEARCH_PREVENT_RESULTS,
      variables: { 
        openday: params.openday || null,
        endday: params.endday || null,
        keywords: params.keywords || null
      },
      fetchPolicy: 'network-only'
    });
    return { data: data.searchPreventResults };
  } catch (error) {
    console.error('Error searching prevent results:', error);
    throw error;
  }
};

/**
 * Search for healing results
 * @param {Object} params - Search parameters
 * @param {string} params.openday - Start date (optional)
 * @param {string} params.endday - End date (optional)
 * @param {Array} params.keywords - Keyword filters (optional)
 * @returns {Promise<Object>} - GraphQL query result
 */
const searchHealingResults = async (params) => {
  try {
    const { data } = await apolloClient.query({
      query: SEARCH_HEALING_RESULTS,
      variables: { 
        openday: params.openday || null,
        endday: params.endday || null,
        keywords: params.keywords || null
      },
      fetchPolicy: 'network-only'
    });
    return { data: data.searchHealingResults };
  } catch (error) {
    console.error('Error searching healing results:', error);
    throw error;
  }
};

/**
 * Get the list of agencies
 * @returns {Promise<Object>} - GraphQL query result
 */
const getAgencyList = async () => {
  try {
    const { data } = await apolloClient.query({
      query: GET_AGENCY_LIST,
      fetchPolicy: 'network-only'
    });
    return { data: data.getAgencies };
  } catch (error) {
    console.error('Error getting agency list:', error);
    throw error;
  }
};

export {
  searchProgramResults,
  searchFacilityResults,
  searchPreventResults,
  searchHealingResults,
  getAgencyList
}; 