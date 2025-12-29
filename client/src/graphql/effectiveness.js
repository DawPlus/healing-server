import { gql } from '@apollo/client';

// Query to get prevention service effectiveness evaluation data by year
export const GET_PREVENT_EFFECTIVENESS = gql`
  query GetPreventEffectiveness($year: Int!) {
    getPreventEffectiveness(year: $year) {
      id
      openday
      agency
      agency_id
      name
      sex
      age
      residence
      job
      pv
      past_stress_experience
      score1
      score2
      score3
      score4
      score5
      score6
      score7
      score8
      score9
      score10
      score11
      score12
      score13
      score14
      score15
      score16
      score17
      score18
      score19
      score20
    }
  }
`; 