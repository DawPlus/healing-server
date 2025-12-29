const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type MutationResponse {
    success: Boolean!
    message: String
  }

  input ServiceFormInput {
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    sex: String
    age: String
    residence: String
    job: String
    score1: String
    score2: String
    score3: String
    score4: String
    score5: String
    score6: String
    score7: String
    score8: String
    score9: String
    score10: String
    facility_opinion: String
    score11: String
    score12: String
    score13: String
    score14: String
    score15: String
    score16: String
    operation_opinion: String
    score17: String
    score18: String
  }

  input ProgramFormInput {
    agency: String!
    agency_id: Int
    type: String
    name: String
    sex: String
    age: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    bunya: String
    teacher: String
    place: String
    score1: String
    score2: String
    score3: String
    score4: String
    score5: String
    score6: String
    score7: String
    score8: String
    score9: String
  }
  
  input PreventFormInput {
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    prevent_contents: String
    pv: String
    past_stress_experience: String
    prevent_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    score1: String
    score2: String
    score3: String
    score4: String
    score5: String
    score6: String
    score7: String
    score8: String
    score9: String
    score10: String
    score11: String
    score12: String
    score13: String
    score14: String
    score15: String
    score16: String
    score17: String
    score18: String
    score19: String
    score20: String
  }

  input PreventGamblingFormInput {
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    prevent_contents: String
    pv: String
    past_stress_experience: String
    prevent_gambling_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    score1: String
    score2: String
    score3: String
    score4: String
    score5: String
    score6: String
    score7: String
    score8: String
    score9: String
    score10: String
    score11: String
    score12: String
    score13: String
    score14: String
  }

  input HealingFormInput {
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    pv: String
    past_stress_experience: String
    healing_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    score1: String
    score2: String
    score3: String
    score4: String
    score5: String
    score6: String
    score7: String
    score8: String
    score9: String
    score10: String
    score11: String
    score12: String
    score13: String
    score14: String
    score15: String
    score16: String
    score17: String
    score18: String
    score19: String
    score20: String
    score21: String
    score22: String
  }

  type Mutation {
    createServiceForm(input: ServiceFormInput!): MutationResponse!
    createProgramForm(input: ProgramFormInput!): MutationResponse!
    createPreventForm(input: PreventFormInput!): MutationResponse!
    createPreventGamblingForm(input: PreventGamblingFormInput!): MutationResponse!
    createHealingForm(input: HealingFormInput!): MutationResponse!
  }
`;

module.exports = typeDefs;