const { gql } = require('apollo-server-express');

const searchResultTypeDefs = gql`
  # Search result response type
  type SearchResult {
    # Common fields
    SEQ: Int
    AGENCY: String
    OPENDAY: String
    ENDDAY: String
    
    # Program satisfaction fields
    SCORE1: Float
    SCORE2: Float
    SCORE3: Float
    SCORE4: Float
    SCORE5: Float
    SCORE6: Float
    SCORE7: Float
    SCORE8: Float
    SCORE9: Float
    SCORE10: Float
    SCORE11: Float
    SCORE12: Float
    SCORE13: Float
    SCORE14: Float
    SCORE15: Float
    SCORE16: Float
    SCORE17: Float
    SCORE18: Float
    SCORE19: Float
    SCORE20: Float
    
    # Participant info
    SEX: String
    AGE: Int
    RESIDENCE: String
    JOB: String
    TYPE: String
    
    # For healing and prevent services
    NAME: String
    PV: String
    BUNYA: String
    PROGRAM_NAME: String
    PLACE: String
    TEACHER: String
  }

  # Input for keyword search
  input SearchKeywordInput {
    type: String!
    text: String!
  }

  # Search parameters input
  input SearchParamsInput {
    effect: String!
    openday: String
    endday: String
    keyword: [SearchKeywordInput!]!
  }

  # Input type for keyword searches
  input KeywordInput {
    type: String!
    text: String!
  }

  # Program Result Item Type
  type SearchProgramResult {
    ID: Int
    SEX: String
    AGE: String
    TYPE: String
    AGENCY: String
    OPENDAY: String
    ENDDAY: String
    SCORE1: Float
    SCORE2: Float
    SCORE3: Float
    SCORE4: Float
    SCORE5: Float
    SCORE6: Float
    SCORE7: Float
    SCORE8: Float
    SCORE9: Float
    PROGRAM_NAME: String
    TEACHER: String
    BUNYA: String
    PLACE: String
    sum1: Float
    sum2: Float
    sum3: Float
  }

  # Facility Result Item Type
  type SearchFacilityResult {
    ID: Int
    SEX: String
    AGE: String
    TYPE: String
    AGENCY: String
    OPENDAY: String
    ENDDAY: String
    PTCPROGRAM: String
    RESIDENCE: String
    JOB: String
    SCORE1: Float
    SCORE2: Float
    SCORE3: Float
    SCORE4: Float
    SCORE5: Float
    SCORE6: Float
    SCORE7: Float
    SCORE8: Float
    SCORE9: Float
    SCORE10: Float
    FACILITY_OPINION: String
    SCORE11: Float
    SCORE12: Float
    SCORE13: Float
    SCORE14: Float
    SCORE15: Float
    SCORE16: Float
    OPERATION_OPINION: String
    SCORE17: Float
    SCORE18: Float
    sum1: Float
    sum2: Float
    sum3: Float
    sum4: Float
    sum5: Float
    sum6: Float
    sum7: Float
  }

  # Prevent Result Item Type
  type SearchPreventResult {
    ID: Int
    NAME: String
    SEX: String
    AGE: String
    TYPE: String
    AGENCY: String
    OPENDAY: String
    ENDDAY: String
    PTCPROGRAM: String
    RESIDENCE: String
    JOB: String
    PV: String
    PAST_STRESS_EXPERIENCE: String
    SCORE1: Float
    SCORE2: Float
    SCORE3: Float
    SCORE4: Float
    SCORE5: Float
    SCORE6: Float
    SCORE7: Float
    SCORE8: Float
    SCORE9: Float
    SCORE10: Float
    SCORE11: Float
    SCORE12: Float
    SCORE13: Float
    SCORE14: Float
    SCORE15: Float
    SCORE16: Float
    SCORE17: Float
    SCORE18: Float
    SCORE19: Float
    SCORE20: Float
    sum1: Float
    sum2: Float
    sum3: Float
    sum4: Float
    sum5: Float
    sum6: Float
  }

  # Healing Result Item Type
  type SearchHealingResult {
    ID: Int
    NAME: String
    SEX: String
    AGE: String
    TYPE: String
    AGENCY: String
    OPENDAY: String
    ENDDAY: String
    PTCPROGRAM: String
    RESIDENCE: String
    JOB: String
    PV: String
    PAST_STRESS_EXPERIENCE: String
    SCORE1: Float
    SCORE2: Float
    SCORE3: Float
    SCORE4: Float
    SCORE5: Float
    SCORE6: Float
    SCORE7: Float
    SCORE8: Float
    SCORE9: Float
    SCORE10: Float
    SCORE11: Float
    SCORE12: Float
    SCORE13: Float
    SCORE14: Float
    SCORE15: Float
    SCORE16: Float
    SCORE17: Float
    SCORE18: Float
    SCORE19: Float
    SCORE20: Float
    SCORE21: Float
    SCORE22: Float
    sum1: Float
    sum2: Float
    sum3: Float
    sum4: Float
    sum5: Float
    sum6: Float
    sum7: Float
  }

  # Query operations
  extend type Query {
    # Get search results based on parameters
    getSearchResults(effect: String!, keyword: [SearchKeywordInput!]!, openday: String, endday: String): [SearchResult]!
    searchProgramResults(openday: String, endday: String, keywords: [KeywordInput], agency: String): [SearchProgramResult]!
    searchFacilityResults(openday: String, endday: String, keywords: [KeywordInput], agency: String): [SearchFacilityResult]!
    searchPreventResults(openday: String, endday: String, keywords: [KeywordInput], agency: String): [SearchPreventResult]!
    searchHealingResults(openday: String, endday: String, keywords: [KeywordInput], agency: String): [SearchHealingResult]!
  }
`;

module.exports = searchResultTypeDefs; 