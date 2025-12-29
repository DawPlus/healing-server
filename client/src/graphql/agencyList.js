import { gql } from '@apollo/client';

// Fragment for agency items
export const AGENCY_ITEM_FIELDS = gql`
  fragment AgencyItemFields on AgencyItem {
    label
    value
    agency_id
  }
`;

// Query to get agencies by type
export const GET_AGENCIES_BY_TYPE = gql`
  query GetAgenciesByType($type: String!) {
    getAgenciesByType(type: $type) {
      ...AgencyItemFields
    }
  }
  ${AGENCY_ITEM_FIELDS}
`;

// Query for program results
export const GET_PROGRAM_RESULT = gql`
  query GetProgramResult($type: String!, $agency: String!, $agency_id: Int, $openday: String, $endday: String, $inType: String) {
    getProgramResult(type: $type, agency: $agency, agency_id: $agency_id, openday: $openday, endday: $endday, inType: $inType) {
      NAME
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

// Query for facility list
export const GET_FACILITY_LIST = gql`
  query GetFacilityList($type: String!, $agency: String!, $agency_id: Int, $openday: String, $endday: String) {
    getFacilityList(type: $type, agency: $agency, agency_id: $agency_id, openday: $openday, endday: $endday) {
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

// Query for prevent list
export const GET_PREVENT_LIST = gql`
  query GetPreventList($type: String!, $agency: String!, $agency_id: Int, $openday: String, $endday: String) {
    getPreventList(type: $type, agency: $agency, agency_id: $agency_id, openday: $openday, endday: $endday) {
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

// Query for healing list
export const GET_HEALING_LIST = gql`
  query GetHealingList($type: String!, $agency: String!, $agency_id: Int, $openday: String, $endday: String) {
    getHealingList(type: $type, agency: $agency, agency_id: $agency_id, openday: $openday, endday: $endday) {
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