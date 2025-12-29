const { gql } = require('apollo-server-express');

const agencyListTypeDefs = gql`
  # Input type for keyword searches
  input KeywordInput {
    type: String!
    text: String!
  }

  type AgencyItem {
    label: String!
    value: String!
    agency_id: Int
  }

  type ProgramResultItem {
    NAME: String
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

  type FacilityListItem {
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

  type PreventListItem {
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

  type HealingListItem {
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

  extend type Query {
    getAgenciesByType(type: String!): [AgencyItem!]!
    getProgramResult(type: String!, agency: String, agency_id: Int, openday: String, endday: String, inType: String, keywords: [KeywordInput]): [ProgramResultItem!]!
    getFacilityList(type: String!, agency: String, agency_id: Int, openday: String, endday: String, keywords: [KeywordInput]): [FacilityListItem!]!
    getPreventList(type: String!, agency: String, agency_id: Int, openday: String, endday: String, keywords: [KeywordInput]): [PreventListItem!]!
    getHealingList(type: String!, agency: String, agency_id: Int, openday: String, endday: String, keywords: [KeywordInput]): [HealingListItem!]!
  }
`;

module.exports = agencyListTypeDefs; 