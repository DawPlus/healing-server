import { gql } from '@apollo/client';

// Query to search program results with keywords
export const SEARCH_PROGRAM_RESULTS = gql`
  query SearchProgramResults($openday: String, $endday: String, $keywords: [KeywordInput], $agency: String) {
    searchProgramResults(openday: $openday, endday: $endday, keywords: $keywords, agency: $agency) {
      ID
      SEX
      AGE
      TYPE
      AGENCY
      OPENDAY
      ENDDAY
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      PROGRAM_NAME
      TEACHER
      BUNYA
      PLACE
      sum1
      sum2
      sum3
    }
  }
`;

// Query to search facility results with keywords
export const SEARCH_FACILITY_RESULTS = gql`
  query SearchFacilityResults($openday: String, $endday: String, $keywords: [KeywordInput], $agency: String) {
    searchFacilityResults(openday: $openday, endday: $endday, keywords: $keywords, agency: $agency) {
      ID
      SEX
      AGE
      TYPE
      AGENCY
      OPENDAY
      ENDDAY
      PTCPROGRAM
      RESIDENCE
      JOB
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      SCORE10
      FACILITY_OPINION
      SCORE11
      SCORE12
      SCORE13
      SCORE14
      SCORE15
      SCORE16
      OPERATION_OPINION
      SCORE17
      SCORE18
      sum1
      sum2
      sum3
      sum4
      sum5
      sum6
      sum7
    }
  }
`;

// Query to search prevent results with keywords
export const SEARCH_PREVENT_RESULTS = gql`
  query SearchPreventResults($openday: String, $endday: String, $keywords: [KeywordInput], $agency: String) {
    searchPreventResults(openday: $openday, endday: $endday, keywords: $keywords, agency: $agency) {
      ID
      NAME
      SEX
      AGE
      TYPE
      AGENCY
      OPENDAY
      ENDDAY
      PTCPROGRAM
      RESIDENCE
      JOB
      PV
      PAST_STRESS_EXPERIENCE
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      SCORE10
      SCORE11
      SCORE12
      SCORE13
      SCORE14
      SCORE15
      SCORE16
      SCORE17
      SCORE18
      SCORE19
      SCORE20
      sum1
      sum2
      sum3
      sum4
      sum5
      sum6
    }
  }
`;

// Query to search healing results with keywords
export const SEARCH_HEALING_RESULTS = gql`
  query SearchHealingResults($openday: String, $endday: String, $keywords: [KeywordInput], $agency: String) {
    searchHealingResults(openday: $openday, endday: $endday, keywords: $keywords, agency: $agency) {
      ID
      NAME
      SEX
      AGE
      TYPE
      AGENCY
      OPENDAY
      ENDDAY
      PTCPROGRAM
      RESIDENCE
      JOB
      PV
      PAST_STRESS_EXPERIENCE
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      SCORE10
      SCORE11
      SCORE12
      SCORE13
      SCORE14
      SCORE15
      SCORE16
      SCORE17
      SCORE18
      SCORE19
      SCORE20
      SCORE21
      SCORE22
      sum1
      sum2
      sum3
      sum4
      sum5
      sum6
      sum7
    }
  }
`;

// Query to get agency list for dropdown
export const GET_AGENCY_LIST = gql`
  query GetAgencyList {
    getAgencies {
      id
      agency
    }
  }
`; 