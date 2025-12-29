import { gql } from '@apollo/client';

// Fragment for CounselTherapy fields
const COUNSEL_THERAPY_FORM_FIELDS = gql`
  fragment CounselTherapyFormFields on CounselTherapyForm {
    id
    agency
    agency_id
    name
    openday
    eval_date
    ptcprogram
    counsel_contents
    session1
    session2
    pv
    past_stress_experience
    content_type
    average_usage_time
    monthly_expense
    counsel_therapy_seq
    sex
    age
    residence
    job
    past_experience
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
    score21
    score22
    score23
    score24
    score25
    score26
    score27
    score28
    score29
    score30
    score31
    score32
    score33
    score34
    score35
    score36
    score37
    score38
    score39
    score40
    score41
    score42
    score43
    score44
    score45
    score46
    score47
    score48
    score49
    score50
    score51
    score52
    score53
    score54
    score55
    score56
    score57
    score58
    score59
    score60
    score61
    score62
    created_at
    updated_at
  }
`;

// Queries
export const GET_COUNSEL_THERAPY_FORM = gql`
  query GetCounselTherapyForm($id: Int!) {
    getCounselTherapyForm(id: $id) {
      ...CounselTherapyFormFields
    }
  }
  ${COUNSEL_THERAPY_FORM_FIELDS}
`;

export const GET_COUNSEL_THERAPY_FORMS = gql`
  query GetCounselTherapyForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String, $pv: String) {
    getCounselTherapyForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date, pv: $pv) {
      ...CounselTherapyFormFields
    }
  }
  ${COUNSEL_THERAPY_FORM_FIELDS}
`;

// Mutations
export const CREATE_COUNSEL_THERAPY_FORM = gql`
  mutation CreateCounselTherapyForm($input: CounselTherapyFormInput!) {
    createCounselTherapyForm(input: $input) {
      ...CounselTherapyFormFields
    }
  }
  ${COUNSEL_THERAPY_FORM_FIELDS}
`;

export const UPDATE_COUNSEL_THERAPY_FORM = gql`
  mutation UpdateCounselTherapyForm($id: Int!, $input: CounselTherapyFormInput!) {
    updateCounselTherapyForm(id: $id, input: $input) {
      ...CounselTherapyFormFields
    }
  }
  ${COUNSEL_THERAPY_FORM_FIELDS}
`;

export const DELETE_COUNSEL_THERAPY_FORM = gql`
  mutation DeleteCounselTherapyForm($id: Int!) {
    deleteCounselTherapyForm(id: $id)
  }
`; 