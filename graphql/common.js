const { gql } = require('apollo-server-express');

const commonTypeDefs = gql`
  scalar DateTime
  scalar JSON

  # === Menu System Types ===
  type ProgramCategory {
    id: Int!
    category_name: String!
    description: String
    display_order: Int
    created_at: DateTime
    updated_at: DateTime
    programs: [ProgramItem]
  }

  type ProgramItem {
    id: Int!
    category_id: Int!
    program_name: String!
    description: String
    display_order: Int
    created_at: DateTime
    updated_at: DateTime
    category: ProgramCategory
  }

  type LocationCategory {
    id: Int!
    category_name: String!
    description: String
    display_order: Int
    created_at: DateTime
    updated_at: DateTime
    locations: [Location]
  }

  type Location {
    id: Int!
    location_name: String!
    category_id: Int
    capacity: Int
    description: String
    display_order: Int
    created_at: DateTime
    updated_at: DateTime
    category: LocationCategory
  }

  type Instructor {
    id: Int!
    name: String!
    type: String
    category: String
    payment_rate: Int
    payment: Int
    tax_rate: Float
    specialty: String
    phone: String
    email: String
    description: String
    bank_info: String
    address: String
    contact: String
    notes: String
    created_at: DateTime
    updated_at: DateTime
  }

  type AssistantInstructor {
    id: Int!
    name: String!
    specialty: String
    phone: String
    email: String
    description: String
    payment_rate: Int
    created_at: DateTime
    updated_at: DateTime
  }

  type Helper {
    id: Int!
    name: String!
    specialty: String
    phone: String
    email: String
    description: String
    payment_rate: Int
    created_at: DateTime
    updated_at: DateTime
  }

  type MenuRoom {
    id: Int!
    room_type: String!
    room_name: String!
    capacity: Int!
    price: Int!
    description: String
    is_available: Boolean!
    facilities: String
    display_order: Int!
    created_at: DateTime
    updated_at: DateTime
  }

  # Input types for mutations
  input ProgramCategoryInput {
    category_name: String!
    description: String
    display_order: Int
  }

  input ProgramItemInput {
    category_id: Int!
    program_name: String!
    description: String
    display_order: Int
  }

  input LocationCategoryInput {
    category_name: String!
    description: String
    display_order: Int
  }

  input LocationInput {
    location_name: String!
    category_id: Int
    capacity: Int
    description: String
    display_order: Int
  }

  input InstructorInput {
    name: String!
    type: String
    category: String
    payment_rate: Int
    payment: Int
    tax_rate: Float
    specialty: String
    phone: String
    email: String
    description: String
    bank_info: String
    address: String
    contact: String
    notes: String
  }

  input AssistantInstructorInput {
    name: String!
    specialty: String
    phone: String
    email: String
    description: String
    payment_rate: Int
  }

  input HelperInput {
    name: String!
    specialty: String
    phone: String
    email: String
    description: String
    payment_rate: Int
  }

  input MenuRoomInput {
    room_type: String!
    room_name: String!
    capacity: Int!
    price: Int!
    description: String
    is_available: Boolean
    facilities: String
    display_order: Int
  }

  # Basic User and Auth Types
  type User {
    id: Int!
    user_id: String!
    user_name: String!
    user_pwd: String!
    value: String
    role: String
    create_dtm: DateTime
    update_dtm: DateTime
  }

  type AuthResponse {
    message: String!
    isLogin: Boolean!
    result: Boolean!
    userInfo: User
  }

  input LoginInput {
    id: String!
    password: String!
  }

  input RegisterInput {
    id: String!
    name: String!
    password: String!
  }

  input UserInput {
    user_id: String!
    user_name: String!
    user_pwd: String
    role: String
    value: String
  }

  # UserTemp Types
  type UserTemp {
    id: Int
    seq: String
    name: String
    sex: String
    age: String
    residence: String
    job: String
    agency: String
    openday: String
    created_at: DateTime
    updated_at: DateTime
  }

  type UserTempAgency {
    id: Int
    agency: String
    openday: String
    created_at: DateTime
    updated_at: DateTime
  }

  type UserTempResponse {
    success: Boolean!
    message: String
  }

  input UserTempInput {
    seq: String
    name: String
    sex: String
    age: String
    residence: String
    job: String
    agency: String
    openday: String
  }

  type DeleteResult {
    id: Int!
    success: Boolean!
  }

  # ProgramList related types
  type ProgramItem {
    BASIC_INFO_SEQ: Int
    index: Int
    AGENCY: String
    OPENDAY: String
    ENDDAY: String
    SERVICE_TYPE: String
    totalPeople: Int
    OM: String
  }

  type ProgramListDetailBasicInfo {
    AGENCY: String
    OM: String
    OPENDAY: String
    DAYS_TO_STAY: String
    RESIDENCE: String
    PART_MAN_CNT: Int
    PART_WOMAN_CNT: Int
    LEAD_MAN_CNT: Int
    LEAD_WOMAN_CNT: Int
    SUPPORT: String
    INCOME_TYPE: String
    PART_TYPE: String
    AGE_TYPE: String
    BIZ_PURPOSE: String
    PROGRAM_IN_OUT: String
    ROOM_PART_PEOPLE: String
    ROOM_PART_ROOM: String
    MEAL_TYPE: String
    MEAL_PART: String
    ROOM_LEAD_PEOPLE: String
    ROOM_LEAD_ROOM: String
    MEAL_LEAD: String
    ROOM_ETC_PEOPLE: String
    ROOM_ETC_ROOM: String
    MEAL_ETC: String
    PROGRAM_OPINION: String
    SERVICE_OPINION: String
    OVERALL_OPINION: String
    SERVICE_TYPE: String
    org_nature: String
  }

  type ProgramListServiceScore {
    score1: Float
    score2: Float
    score3: Float
    score4: Float
    score5: Float
    score6: Float
    score7: Float
    score8: Float
    score9: Float
    score10: Float
    score11: Float
    score12: Float
    score13: Float
    score14: Float
    score15: Float
    score16: Float
    score17: Float
    score18: Float
  }

  type ProgramSatisfaction {
    PROGRAM_NAME: String
    TEACHER: String
    BUNYA: String
    type: String
    score1: Float
    score2: Float
    score3: Float
    score4: Float
    score5: Float
    score6: Float
    score7: Float
    score8: Float
    score9: Float
    cnt: Int
  }

  type ProgramListResponse {
    items: [ProgramItem]
  }

  # Service Form types
  type ServiceForm {
    id: Int
    agency: String
    agency_id: Int
    openday: String
    eval_date: String
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
    score21: String
    score22: String
    score23: String
    score24: String
    score25: String
    score26: String
    score27: String
    score28: String
    facility_opinion: String
    operation_opinion: String
    created_at: DateTime
    updated_at: DateTime
  }

  type ProgramForm {
    id: Int
    agency: String
    agency_id: Int
    openday: String
    eval_date: String
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
    created_at: DateTime
    updated_at: DateTime
  }

  type PreventForm {
    id: Int
    agency: String
    agency_id: Int
    name: String
    openday: String
    eval_date: String
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
    created_at: DateTime
    updated_at: DateTime
  }

  type HealingForm {
    id: Int
    agency: String
    agency_id: Int
    name: String
    openday: String
    eval_date: String
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
    created_at: DateTime
    updated_at: DateTime
  }

  type CounselTherapyForm {
    id: Int
    agency: String
    agency_id: Int
    name: String
    openday: String
    eval_date: String
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
    created_at: DateTime
    updated_at: DateTime
  }

  type HrvForm {
    id: Int
    agency: String
    agency_id: Int
    name: String
    openday: String
    eval_date: String
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
    created_at: DateTime
    updated_at: DateTime
  }

  type VibraForm {
    id: Int
    agency: String
    agency_id: Int
    name: String
    openday: String
    eval_date: String
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
    created_at: DateTime
    updated_at: DateTime
  }

  # Input types for form mutations
  input ServiceFormInput {
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
    score21: String
    score22: String
    score23: String
    score24: String
    score25: String
    score26: String
    score27: String
    score28: String
    facility_opinion: String
    operation_opinion: String
  }

  input ProgramFormInput {
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

  input CounselTherapyFormInput {
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

  input HrvFormInput {
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

  type ProgramDetailResponse {
    basicInfo: ProgramListDetailBasicInfo
    serviceList: [ProgramListServiceScore]
    programSatisfaction: [ProgramSatisfaction]
    programSaf: [ProgramSaf]
    effect: ProgramEffect
    inExpense: ProgramExpense
    serviceForms: [ServiceForm]
    programForms: [ProgramForm]
    preventForms: [PreventForm]
    healingForms: [HealingForm]
    counselForms: [CounselTherapyForm]
    hrvForms: [HrvForm]
    programCategories: [ProgramCategory]
    programItems: [ProgramItem]
    instructors: [Instructor]
    assistantInstructors: [AssistantInstructor]
    helpers: [Helper]
    complaint: String
  }

  type ProgramSaf {
    SAF_SEQ: Int!
    PROGRAM_NAME: String!
    START_TIME: String!
    END_TIME: String!
    SAF_DATE: String!
  }

  type ProgramExpense {
    income: [IncomeItem]
    expense: [ExpenseItem]
  }

  type IncomeItem {
    ITEM: String!
    PRICE: String!
    DETAIL: String
  }

  type ExpenseItem {
    ITEM: String!
    PRICE: String!
  }

  type ProgramEffectItem {
    type: String
    sum1: Float
    avg1: Float
    sum2: Float
    avg2: Float
  }

  type HrvEffectItem {
    pv: String
    num1: Float
    num2: Float
    num3: Float
    num4: Float
    num5: Float
  }

  type ProgramEffect {
    prevent: [ProgramEffectItem]
    counsel: [ProgramEffectItem]
    healing: [ProgramEffectItem]
    hrv: [HrvEffectItem]
  }

  type Agency {
    id: Int
    agency: String
  }

  type Menu {
    id: Int!
    name: String!
    path: String!
    parent_id: Int
    children: [Menu]
  }

  extend type Query {
    # Common queries
    getAgencies: [Agency]
    getMenus: [Menu]
    
    # Program Categories Queries
    getProgramCategories: [ProgramCategory!]!
    getProgramCategoryById(id: Int!): ProgramCategory
    programCategories: [ProgramCategory]
    programCategory(id: Int!): ProgramCategory
    
    # Program Items Queries
    getProgramItems: [ProgramItem!]!
    getProgramItemsByCategoryId(categoryId: Int!): [ProgramItem!]!
    getProgramItemById(id: Int!): ProgramItem
    getProgramsByCategory(categoryId: Int!): [ProgramItem!]!
    programItems: [ProgramItem]
    programItemsByCategory(categoryId: Int!): [ProgramItem]
    programItem(id: Int!): ProgramItem
    
    # Location Categories Queries
    getLocationCategories: [LocationCategory!]!
    getLocationCategoryById(id: Int!): LocationCategory
    locationCategories: [LocationCategory]
    locationCategory(id: Int!): LocationCategory
    
    # Locations Queries
    getLocations: [Location!]!
    getLocationsByCategoryId(categoryId: Int!): [Location!]!
    getLocationById(id: Int!): Location
    locations: [Location]
    locationsByCategory(categoryId: Int!): [Location]
    location(id: Int!): Location
    
    # Instructor Queries
    getInstructors: [Instructor!]!
    getInstructorById(id: Int!): Instructor
    instructors: [Instructor]
    instructor(id: Int!): Instructor
    
    # Assistant Instructor Queries
    getAssistantInstructors: [AssistantInstructor!]!
    getAssistantInstructorById(id: Int!): AssistantInstructor
    assistantInstructors: [AssistantInstructor]
    assistantInstructor(id: Int!): AssistantInstructor
    
    # Helper Queries
    getHelpers: [Helper!]!
    getHelperById(id: Int!): Helper
    helpers: [Helper]
    helper(id: Int!): Helper
    
    # Menu Room Queries
    getMenuRooms: [MenuRoom!]!
    getAvailableMenuRooms: [MenuRoom!]!
    getMenuRoomById(id: Int!): MenuRoom
    menuRooms: [MenuRoom]
    menuRoom(id: Int!): MenuRoom
  }

  extend type Mutation {
    # Program Categories Mutations
    createProgramCategory(input: ProgramCategoryInput!): ProgramCategory!
    updateProgramCategory(id: Int!, input: ProgramCategoryInput!): ProgramCategory!
    deleteProgramCategory(id: Int!): Boolean!
    
    # Program Items Mutations
    createProgramItem(input: ProgramItemInput!): ProgramItem!
    updateProgramItem(id: Int!, input: ProgramItemInput!): ProgramItem!
    deleteProgramItem(id: Int!): Boolean!
    
    # Location Categories Mutations
    createLocationCategory(input: LocationCategoryInput!): LocationCategory!
    updateLocationCategory(id: Int!, input: LocationCategoryInput!): LocationCategory!
    deleteLocationCategory(id: Int!): Boolean!
    
    # Locations Mutations
    createLocation(input: LocationInput!): Location!
    updateLocation(id: Int!, input: LocationInput!): Location!
    deleteLocation(id: Int!): Boolean!
    
    # Instructor Mutations
    createInstructor(input: InstructorInput!): Instructor!
    updateInstructor(id: Int!, input: InstructorInput!): Instructor!
    deleteInstructor(id: Int!): Boolean!
    
    # Assistant Instructor Mutations
    createAssistantInstructor(input: AssistantInstructorInput!): AssistantInstructor!
    updateAssistantInstructor(id: Int!, input: AssistantInstructorInput!): AssistantInstructor!
    deleteAssistantInstructor(id: Int!): Boolean!
    
    # Helper Mutations
    createHelper(input: HelperInput!): Helper!
    updateHelper(id: Int!, input: HelperInput!): Helper!
    deleteHelper(id: Int!): Boolean!
    
    # Menu Room Mutations
    createMenuRoom(input: MenuRoomInput!): MenuRoom!
    updateMenuRoom(id: Int!, input: MenuRoomInput!): MenuRoom!
    deleteMenuRoom(id: Int!): Boolean!
  
}`;

module.exports = commonTypeDefs; 