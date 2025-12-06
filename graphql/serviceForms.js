const { gql } = require('apollo-server-express');

const serviceFormsTypeDefs = gql`
  # === Service Insert Form Types ===
  # Consolidated service form types
  type ServiceForm {
    id: Int!
    agency: String!
    agency_id: Int
    openday: String!
    eval_date: String!
    ptcprogram: String
    service_seq: Int
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
    score19: String
    score20: String
    facility_opinion: String
    score21: String
    score22: String
    score23: String
    score24: String
    score25: String
    score26: String
    operation_opinion: String
    score27: String
    score28: String
    created_at: DateTime!
    updated_at: DateTime
  }

  type ProgramForm {
    id: Int!
    agency: String!
    agency_id: Int
    openday: String!
    eval_date: String!
    ptcprogram: String
    program_id: Int
    program_category_id: Int
    teacher_id: Int
    place: String
    program_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    type: String
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
    expectation: String
    improvement: String
    created_at: DateTime!
    updated_at: DateTime
  }

  type CounselTherapyForm {
    id: Int!
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    counsel_contents: String
    session1: String
    session2: String
    pv: String
    past_stress_experience: String
    counsel_therapy_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    past_experience: String
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
    score23: String
    score24: String
    score25: String
    score26: String
    score27: String
    score28: String
    score29: String
    score30: String
    score31: String
    score32: String
    score33: String
    score34: String
    score35: String
    score36: String
    score37: String
    score38: String
    score39: String
    score40: String
    score41: String
    score42: String
    score43: String
    score44: String
    score45: String
    score46: String
    score47: String
    score48: String
    score49: String
    score50: String
    score51: String
    score52: String
    score53: String
    score54: String
    score55: String
    score56: String
    score57: String
    score58: String
    score59: String
    score60: String
    score61: String
    score62: String
    created_at: DateTime!
    updated_at: DateTime
  }

  type PreventForm {
    id: Int!
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
    created_at: DateTime!
    updated_at: DateTime
  }

  type HealingForm {
    id: Int!
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
    created_at: DateTime!
    updated_at: DateTime
  }

  type HrvForm {
    id: Int!
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    pv: String
    identification_number: String
    hrv_seq: Int
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
    created_at: DateTime!
    updated_at: DateTime
  }

  type VibraForm {
    id: Int!
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    pv: String
    identification_number: String
    vibra_seq: Int
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
    created_at: DateTime!
    updated_at: DateTime
  }

  input ServiceFormInput {
    id: Int
    agency: String!
    agency_id: Int
    openday: String!
    eval_date: String!
    ptcprogram: String
    service_seq: Int
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
    facility_opinion: String
    score21: String
    score22: String
    score23: String
    score24: String
    score25: String
    score26: String
    operation_opinion: String
    score27: String
    score28: String
  }

  input ProgramFormInput {
    id: Int
    agency: String!
    agency_id: Int
    openday: String!
    eval_date: String!
    ptcprogram: String
    program_id: Int
    program_category_id: Int
    teacher_id: Int
    place: String
    program_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    type: String
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
    expectation: String
    improvement: String
  }

  input PreventFormInput {
    id: Int
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

  input HealingFormInput {
    id: Int
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

  input HrvFormInput {
    id: Int
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    pv: String
    identification_number: String
    hrv_seq: Int
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
  }

  input VibraFormInput {
    id: Int
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    pv: String
    identification_number: String
    vibra_seq: Int
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
  }

  input CounselTherapyFormInput {
    id: Int
    agency: String!
    agency_id: Int
    name: String
    openday: String!
    eval_date: String!
    ptcprogram: String
    counsel_contents: String
    session1: String
    session2: String
    pv: String
    past_stress_experience: String
    counsel_therapy_seq: Int
    sex: String
    age: String
    residence: String
    job: String
    past_experience: String
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
    score23: String
    score24: String
    score25: String
    score26: String
    score27: String
    score28: String
    score29: String
    score30: String
    score31: String
    score32: String
    score33: String
    score34: String
    score35: String
    score36: String
    score37: String
    score38: String
    score39: String
    score40: String
    score41: String
    score42: String
    score43: String
    score44: String
    score45: String
    score46: String
    score47: String
    score48: String
    score49: String
    score50: String
    score51: String
    score52: String
    score53: String
    score54: String
    score55: String
    score56: String
    score57: String
    score58: String
    score59: String
    score60: String
    score61: String
    score62: String
  }

  type Query {
    # Service Insert Form Queries
    getServiceForm(id: Int!): ServiceForm
    getServiceForms(agency: String, agency_id: Int, openday: String, eval_date: String): [ServiceForm]
    getProgramForm(id: Int!): ProgramForm
    getProgramForms(agency: String, agency_id: Int, openday: String, eval_date: String): [ProgramForm]
    getCounselTherapyForm(id: Int!): CounselTherapyForm
    getCounselTherapyForms(agency: String, agency_id: Int, openday: String, eval_date: String): [CounselTherapyForm!]!
    getPreventForm(id: Int!): PreventForm
    getPreventForms(agency: String, agency_id: Int, openday: String, eval_date: String): [PreventForm]
    getHealingForm(id: Int!): HealingForm
    getHealingForms(agency: String, agency_id: Int, openday: String, eval_date: String): [HealingForm]
    getHrvForm(id: Int!): HrvForm
    getHrvForms(agency: String, agency_id: Int, openday: String, eval_date: String): [HrvForm]
    getVibraForm(id: Int!): VibraForm
    getVibraForms(agency: String, agency_id: Int, openday: String, eval_date: String): [VibraForm]
  }

  type Mutation {
    # Service Insert Form Mutations
    createServiceForm(input: ServiceFormInput!): ServiceForm
    updateServiceForm(id: Int!, input: ServiceFormInput!): ServiceForm
    deleteServiceForm(id: Int!): Boolean
    
    createProgramForm(input: ProgramFormInput!): ProgramForm
    updateProgramForm(id: Int!, input: ProgramFormInput!): ProgramForm
    deleteProgramForm(id: Int!): Boolean
    
    createCounselTherapyForm(input: CounselTherapyFormInput!): CounselTherapyForm!
    updateCounselTherapyForm(id: Int!, input: CounselTherapyFormInput!): CounselTherapyForm!
    deleteCounselTherapyForm(id: Int!): Boolean!
    
    createPreventForm(input: PreventFormInput!): PreventForm
    updatePreventForm(id: Int!, input: PreventFormInput!): PreventForm
    deletePreventForm(id: Int!): Boolean
    
    createHealingForm(input: HealingFormInput!): HealingForm
    updateHealingForm(id: Int!, input: HealingFormInput!): HealingForm
    deleteHealingForm(id: Int!): Boolean
    
    createHrvForm(input: HrvFormInput!): HrvForm
    updateHrvForm(id: Int!, input: HrvFormInput!): HrvForm
    deleteHrvForm(id: Int!): Boolean
    
    createVibraForm(input: VibraFormInput!): VibraForm
    updateVibraForm(id: Int!, input: VibraFormInput!): VibraForm
    deleteVibraForm(id: Int!): Boolean
  }
`;

module.exports = serviceFormsTypeDefs; 