const { gql } = require('apollo-server-express');

const effectivenessTypeDefs = gql`
  type PreventEffectivenessItem {
    id: Int!
    openday: String
    agency: String
    agency_id: Int
    name: String
    sex: String
    age: String
    residence: String
    job: String
    pv: String
    past_stress_experience: String
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

  extend type Query {
    getPreventEffectiveness(year: Int!): [PreventEffectivenessItem!]!
  }
`;

module.exports = effectivenessTypeDefs; 