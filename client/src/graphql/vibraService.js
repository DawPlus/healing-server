import { gql } from '@apollo/client';

// Fragment for Vibra form fields
const VIBRA_FORM_FIELDS = gql`
  fragment VibraFormFields on VibraForm {
    id
    agency
    agency_id
    name
    openday
    eval_date
    ptcprogram
    pv
    identification_number
    vibra_seq
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
    score9
    score10
    created_at
    updated_at
  }
`;

// Queries
export const GET_VIBRA_FORM = gql`
  query GetVibraForm($id: Int!) {
    getVibraForm(id: $id) {
      ...VibraFormFields
    }
  }
  ${VIBRA_FORM_FIELDS}
`;

export const GET_VIBRA_FORMS = gql`
  query GetVibraForms($agency: String, $openday: String, $eval_date: String) {
    getVibraForms(agency: $agency, openday: $openday, eval_date: $eval_date) {
      ...VibraFormFields
    }
  }
  ${VIBRA_FORM_FIELDS}
`;

// Mutations
export const CREATE_VIBRA_FORM = gql`
  mutation CreateVibraForm($input: VibraFormInput!) {
    createVibraForm(input: $input) {
      ...VibraFormFields
    }
  }
  ${VIBRA_FORM_FIELDS}
`;

export const UPDATE_VIBRA_FORM = gql`
  mutation UpdateVibraForm($id: Int!, $input: VibraFormInput!) {
    updateVibraForm(id: $id, input: $input) {
      ...VibraFormFields
    }
  }
  ${VIBRA_FORM_FIELDS}
`;

export const DELETE_VIBRA_FORM = gql`
  mutation DeleteVibraForm($id: Int!) {
    deleteVibraForm(id: $id)
  }
`;

export const DELETE_VIBRA_FORM_ENTRY = gql`
  mutation DeleteVibraFormEntry($id: Int!) {
    deleteVibraFormEntry(id: $id)
  }
`; 