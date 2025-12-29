import { gql } from '@apollo/client';

// Updated Service Form Fragment for consolidated model
const SERVICE_FORM_FIELDS = gql`
  fragment ServiceFormFields on ServiceForm {
    id
    agency
    agency_id
    openday
    eval_date
    ptcprogram
    service_seq
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
    created_at
    updated_at
  }
`;

// Updated Program Form Fragment
const PROGRAM_FORM_FIELDS = gql`
  fragment ProgramFormFields on ProgramForm {
    id
    agency
    agency_id
    openday
    eval_date
    ptcprogram
    program_id
    program_category_id
    teacher_id
    place
    program_seq
    sex
    age
    residence
    job
    type
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
    expectation
    improvement
    created_at
    updated_at
  }
`;

// CounselTherapy Form Fragments
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

// Prevent Form Fragment
const PREVENT_FORM_FIELDS = gql`
  fragment PreventFormFields on PreventForm {
    id
    agency
    agency_id
    name
    openday
    eval_date
    ptcprogram
    prevent_contents
    pv
    past_stress_experience
    participation_period
    prevent_seq
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
    score11
    score12
    score13
    score14
    created_at
    updated_at
  }
`;

// PreventGambling Form Fragment
const PREVENT_GAMBLING_FORM_FIELDS = gql`
  fragment PreventGamblingFormFields on PreventGamblingForm {
    id
    agency
    agency_id
    name
    openday
    eval_date
    ptcprogram
    prevent_contents
    pv
    past_stress_experience
    participation_period
    prevent_gambling_seq
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
    score11
    score12
    score13
    score14
    created_at
    updated_at
  }
`;

// Healing Form Fragment
const HEALING_FORM_FIELDS = gql`
  fragment HealingFormFields on HealingForm {
    id
    agency
    agency_id
    name
    openday
    eval_date
    ptcprogram
    pv
    past_stress_experience
    healing_seq
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
    created_at
    updated_at
  }
`;

// HRV Form Fragment
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

// Vibra Form Fragment
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

// Service Form Queries
export const GET_SERVICE_FORM = gql`
  query GetServiceForm($id: Int!) {
    getServiceForm(id: $id) {
      ...ServiceFormFields
    }
  }
  ${SERVICE_FORM_FIELDS}
`;

export const GET_SERVICE_FORMS = gql`
  query GetServiceForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String) {
    getServiceForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date) {
      ...ServiceFormFields
    }
  }
  ${SERVICE_FORM_FIELDS}
`;

// Program Form Queries
export const GET_PROGRAM_FORM = gql`
  query GetProgramForm($id: Int!) {
    getProgramForm(id: $id) {
      ...ProgramFormFields
    }
  }
  ${PROGRAM_FORM_FIELDS}
`;

export const GET_PROGRAM_FORMS = gql`
  query GetProgramForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String, $program_id: Int, $program_category_id: Int, $teacher_id: Int, $place: String) {
    getProgramForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date, program_id: $program_id, program_category_id: $program_category_id, teacher_id: $teacher_id, place: $place) {
      id
      agency
      agency_id
      openday
      eval_date
      ptcprogram
      program_seq
      program_id
      program_category_id
      teacher_id
      place
      sex
      age
      residence
      job
      type
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
      expectation
      improvement
    }
  }
`;

// CounselTherapy Form Queries
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

// Prevent Form Queries
export const GET_PREVENT_FORM = gql`
  query GetPreventForm($id: Int!) {
    getPreventForm(id: $id) {
      ...PreventFormFields
    }
  }
  ${PREVENT_FORM_FIELDS}
`;

export const GET_PREVENT_FORMS = gql`
  query GetPreventForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String, $pv: String) {
    getPreventForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date, pv: $pv) {
      ...PreventFormFields
    }
  }
  ${PREVENT_FORM_FIELDS}
`;

// Prevent Gambling Form Queries
export const GET_PREVENT_GAMBLING_FORM = gql`
  query GetPreventGamblingForm($id: Int!) {
    getPreventGamblingForm(id: $id) {
      ...PreventGamblingFormFields
    }
  }
  ${PREVENT_GAMBLING_FORM_FIELDS}
`;

export const GET_PREVENT_GAMBLING_FORMS = gql`
  query GetPreventGamblingForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String, $pv: String) {
    getPreventGamblingForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date, pv: $pv) {
      ...PreventGamblingFormFields
    }
  }
  ${PREVENT_GAMBLING_FORM_FIELDS}
`;

// Healing Form Queries
export const GET_HEALING_FORM = gql`
  query GetHealingForm($id: Int!) {
    getHealingForm(id: $id) {
      ...HealingFormFields
    }
  }
  ${HEALING_FORM_FIELDS}
`;

export const GET_HEALING_FORMS = gql`
  query GetHealingForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String, $pv: String) {
    getHealingForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date, pv: $pv) {
      ...HealingFormFields
    }
  }
  ${HEALING_FORM_FIELDS}
`;

// HRV Form Queries
export const GET_HRV_FORM = gql`
  query GetHrvForm($id: Int!) {
    getHrvForm(id: $id) {
      ...HrvFormFields
    }
  }
  ${HRV_FORM_FIELDS}
`;

export const GET_HRV_FORMS = gql`
  query GetHrvForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String, $pv: String) {
    getHrvForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date, pv: $pv) {
      ...HrvFormFields
    }
  }
  ${HRV_FORM_FIELDS}
`;

// Vibra Form Queries
export const GET_VIBRA_FORM = gql`
  query GetVibraForm($id: Int!) {
    getVibraForm(id: $id) {
      ...VibraFormFields
    }
  }
  ${VIBRA_FORM_FIELDS}
`;

export const GET_VIBRA_FORMS = gql`
  query GetVibraForms($agency: String, $agency_id: Int, $openday: String, $eval_date: String) {
    getVibraForms(agency: $agency, agency_id: $agency_id, openday: $openday, eval_date: $eval_date) {
      ...VibraFormFields
    }
  }
  ${VIBRA_FORM_FIELDS}
`;

// Service Form Mutations
export const CREATE_SERVICE_FORM = gql`
  mutation CreateServiceForm($input: ServiceFormInput!) {
    createServiceForm(input: $input) {
      ...ServiceFormFields
    }
  }
  ${SERVICE_FORM_FIELDS}
`;

export const UPDATE_SERVICE_FORM = gql`
  mutation UpdateServiceForm($id: Int!, $input: ServiceFormInput!) {
    updateServiceForm(id: $id, input: $input) {
      ...ServiceFormFields
    }
  }
  ${SERVICE_FORM_FIELDS}
`;

export const DELETE_SERVICE_FORM = gql`
  mutation DeleteServiceForm($id: Int!) {
    deleteServiceForm(id: $id)
  }
`;

// Program Form Mutations
export const CREATE_PROGRAM_FORM = gql`
  mutation CreateProgramForm($input: ProgramFormInput!) {
    createProgramForm(input: $input) {
      id
      agency
      agency_id
      openday
      eval_date
      ptcprogram
      program_seq
      program_id
      program_category_id
      teacher_id
      place
      sex
      age
      residence
      job
      type
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
      expectation
      improvement
    }
  }
`;

export const UPDATE_PROGRAM_FORM = gql`
  mutation UpdateProgramForm($id: Int!, $input: ProgramFormInput!) {
    updateProgramForm(id: $id, input: $input) {
      id
      agency
      agency_id
      openday
      eval_date
      ptcprogram
      program_seq
      program_id
      program_category_id
      teacher_id
      place
      sex
      age
      residence
      job
      type
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
      expectation
      improvement
    }
  }
`;

export const DELETE_PROGRAM_FORM = gql`
  mutation DeleteProgramForm($id: Int!) {
    deleteProgramForm(id: $id)
  }
`;

// CounselTherapy Form Mutations
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

// Prevent Form Mutations
export const CREATE_PREVENT_FORM = gql`
  mutation CreatePreventForm($input: PreventFormInput!) {
    createPreventForm(input: $input) {
      ...PreventFormFields
    }
  }
  ${PREVENT_FORM_FIELDS}
`;

export const UPDATE_PREVENT_FORM = gql`
  mutation UpdatePreventForm($id: Int!, $input: PreventFormInput!) {
    updatePreventForm(id: $id, input: $input) {
      ...PreventFormFields
    }
  }
  ${PREVENT_FORM_FIELDS}
`;

export const DELETE_PREVENT_FORM = gql`
  mutation DeletePreventForm($id: Int!) {
    deletePreventForm(id: $id)
  }
`;

// Prevent Gambling Form Mutations
export const CREATE_PREVENT_GAMBLING_FORM = gql`
  mutation CreatePreventGamblingForm($input: PreventGamblingFormInput!) {
    createPreventGamblingForm(input: $input) {
      ...PreventGamblingFormFields
    }
  }
  ${PREVENT_GAMBLING_FORM_FIELDS}
`;

export const UPDATE_PREVENT_GAMBLING_FORM = gql`
  mutation UpdatePreventGamblingForm($id: Int!, $input: PreventGamblingFormInput!) {
    updatePreventGamblingForm(id: $id, input: $input) {
      ...PreventGamblingFormFields
    }
  }
  ${PREVENT_GAMBLING_FORM_FIELDS}
`;

export const DELETE_PREVENT_GAMBLING_FORM = gql`
  mutation DeletePreventGamblingForm($id: Int!) {
    deletePreventGamblingForm(id: $id)
  }
`;

// Healing Form Mutations
export const CREATE_HEALING_FORM = gql`
  mutation CreateHealingForm($input: HealingFormInput!) {
    createHealingForm(input: $input) {
      ...HealingFormFields
    }
  }
  ${HEALING_FORM_FIELDS}
`;

export const UPDATE_HEALING_FORM = gql`
  mutation UpdateHealingForm($id: Int!, $input: HealingFormInput!) {
    updateHealingForm(id: $id, input: $input) {
      ...HealingFormFields
    }
  }
  ${HEALING_FORM_FIELDS}
`;

export const DELETE_HEALING_FORM = gql`
  mutation DeleteHealingForm($id: Int!) {
    deleteHealingForm(id: $id)
  }
`;

// HRV Form Mutations
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

// Vibra Form Mutations
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