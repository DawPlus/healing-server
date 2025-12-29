import { gql } from '@apollo/client';

// Fragment for HRV form fields
const HRV_FORM_FIELDS = gql`
  fragment HrvFormFields on HrvForm {
    id
    agency
    agency_id
    name
    openday
    eval_date
    ptcprogram
    pv
    identification_number
    hrv_seq
    sex
    age
    residence
    job
    score1
    score2
    score3
    score4
    score5
    score6
    score7
    score8
    created_at
    updated_at
  }
`;

// Queries
export const GET_HRV_FORM = gql`
  query GetHrvForm($id: Int!) {
    getHrvForm(id: $id) {
      ...HrvFormFields
    }
  }
  ${HRV_FORM_FIELDS}
`;

export const GET_HRV_FORMS = gql`
  query GetHrvForms($agency: String, $openday: String, $eval_date: String) {
    getHrvForms(agency: $agency, openday: $openday, eval_date: $eval_date) {
      ...HrvFormFields
    }
  }
  ${HRV_FORM_FIELDS}
`;

// Mutations
export const CREATE_HRV_FORM = gql`
  mutation CreateHrvForm($input: HrvFormInput!) {
    createHrvForm(input: $input) {
      ...HrvFormFields
    }
  }
  ${HRV_FORM_FIELDS}
`;

export const UPDATE_HRV_FORM = gql`
  mutation UpdateHrvForm($id: Int!, $input: HrvFormInput!) {
    updateHrvForm(id: $id, input: $input) {
      ...HrvFormFields
    }
  }
  ${HRV_FORM_FIELDS}
`;

export const DELETE_HRV_FORM = gql`
  mutation DeleteHrvForm($id: Int!) {
    deleteHrvForm(id: $id)
  }
`;

export const DELETE_HRV_FORM_ENTRY = gql`
  mutation DeleteHrvFormEntry($id: Int!) {
    deleteHrvFormEntry(id: $id)
  }
`; 