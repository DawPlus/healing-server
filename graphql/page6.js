const { gql } = require('apollo-server-express');

const page6TypeDefs = gql`

 # 프로그램 일정표 관련 타입
  type ProgramSchedule {
    id: ID
    reservation_id: Int!
    group_name: String!
    start_date: String!
    end_date: String!
    created_at: String
    updated_at: String
    programs: [ProgramScheduleItem]
  }

  type ProgramScheduleItem {
    id: ID
    day: Int!
    time_slot: String!
    program_name: String!
    location: String
    instructor: String
  }

  # 숙소 배정 관련 타입
  type RoomAssignment {
    id: ID
    reservation_id: Int!
    room_id: Int!
    room_name: String!
    floor: Int!
    date: String!
    organization: String!
    occupancy: Int!
    created_at: String
    updated_at: String
  }

  type Room {
    id: ID!
    room_name: String!
    room_type: String!
    capacity: Int!
    floor: Int!
    status: String
  }

  type RoomWithAssignments {
    room_id: ID!
    room_name: String!
    floor: Int!
    capacity: Int!
    assignments: [Assignment]
  }

  type Assignment {
    id: ID
    date: String!
    organization: String
    occupancy: Int
    reservation_id: Int
  }

  # 식사 인원 타입
  type MealStaff {
    date: String!
    meal_type: String!
    youth_count: Int
    adult_count: Int
    instructor_count: Int
    other_count: Int
    total_count: Int
    organization: String
    reservation_id: Int
  }

  # 주간일정표 관련 타입
  type WeeklySchedule {
    date: String!
    timeSlots: [TimeSlot!]!
  }

  type TimeSlot {
    time: String!
    events: [ScheduleEvent!]!
  }

  type ScheduleEvent {
    id: ID!
    type: String!
    organization: String!
    programName: String
    location: String
    startTime: String
    endTime: String
    instructorName: String
    participants: Int
    reservation_status: String
  }

  # 프로그램 시행보고 관련 타입
  type ImplementationPlan {
    id: ID!
    group_name: String!
    location: String!
    period: String!
    programs: [ProgramParticipants!]!
    service_types: [ServiceTypeCount!]!
    meal_info: [MealInfo!]!
    events: String
    accommodations: [Accommodation!]!
    employee_info: [EmployeeInfo]
    etc_notes: String
  }

  type ProgramParticipants {
    type: String!
    male_count: Int!
    female_count: Int!
    total_count: Int!
    instructor_count: Int!
    total_with_instructors: Int!
  }

  type ServiceTypeCount {
    name: String!
    count: Int!
  }

  type MealInfo {
    type: String!
    date: String!
    count: Int!
  }

  type Accommodation {
    room_name: String!
    count: Int!
  }

  # 수익 실적 보고서 관련 타입
  type UsageReport {
    id: ID!
    month: String
    day: Int
    weekday: String
    usage_type: String
    customer_type: String
    service_type: String
    organization: String
    amount: Int
    food_amount: Int
    program_amount: Int
    etc_amount: Int
    facility_amount: Int
    vat: Int
    discount_amount: Int
    total_amount: Int
    payment_method: String
    payment_code: String
    receipt_date: String
    notes: String
  }

  # 단체 정보 타입
  type Organization {
    name: String!
  }

  # 뮤테이션 결과 타입
  type MutationResult {
    success: Boolean!
    message: String
    id: ID
    count: Int
  }

  # 입력 타입
  input ProgramScheduleInput {
    reservation_id: Int!
    group_name: String!
    start_date: String!
    end_date: String!
    programs: [ProgramScheduleItemInput]
  }

  input ProgramScheduleItemInput {
    day: Int!
    time_slot: String!
    program_name: String!
    location: String
    instructor: String
  }

  input RoomAssignmentInput {
    reservation_id: Int!
    room_id: Int!
    room_name: String!
    floor: Int!
    date: String!
    organization: String!
    occupancy: Int!
  }

  # 쿼리와 뮤테이션에 추가
  extend type Query {
    # 객실 정보 가져오기
    getRooms: [Room]
    
    # 특정 날짜 기간의 객실 예약 현황 가져오기
    getRoomAssignments(startDate: String!, endDate: String!): [RoomWithAssignments]
    
    # 식사 인원 정보 가져오기
    getMealStaff(startDate: String!, endDate: String!, reservationId: Int): [MealStaff]
    
    # 주간일정표 정보 가져오기
    getWeeklySchedule(startDate: String!, endDate: String!): [WeeklySchedule]
    
    # 프로그램 시행보고 정보 가져오기
    getImplementationPlan(month: String, startDate: String, endDate: String, reservationId: Int): [ImplementationPlan]
    
    # 수익 실적 보고서 정보 가져오기
    getUsageReport(year: Int, month: Int, organization: String): [UsageReport]
    
    # 수익 실적 보고서를 위한 단체 목록 가져오기
    getOrganizationsForUsageReport(year: Int, month: Int): [Organization]
    
    # 강사비 지급 정보 가져오기 
    getInstructorPayments(year: Int, month: Int, instructorName: String): [InstructorPayment]
    
    # 강사 목록 가져오기
    getInstructors: [Instructor]
    
    # 강사비 지급 월별 요약 정보 가져오기
    getMonthlyInstructorSummary(year: Int, month: Int): MonthlyInstructorSummary
  }

  extend type Mutation {
    # 프로그램 일정표 저장
    saveProgramSchedule(programSchedule: ProgramScheduleInput!): MutationResult
    
    # 객실 배정 저장
    saveRoomAssignment(roomAssignment: RoomAssignmentInput!): MutationResult
    
    # 객실 배정 삭제
    deleteRoomAssignment(id: ID!): MutationResult
    
    # 다수의 객실 배정 저장
    bulkSaveRoomAssignments(assignments: [RoomAssignmentInput!]!): MutationResult
  }

  type InstructorPayment {
    id: ID
    month: String
    day: Int
    weekday: String
    instructor_name: String
    instructor_type: String
    instructor_category: String
    organization: String
    business_category: String
    program_name: String
    date: String
    time: String
    sessions: Int
    payment_amount: Int
    tax_amount: Int
    final_amount: Int
    payment_date: String
  }

  type MonthlyInstructorSummary {
    month: String
    year: Int
    total_amount: Int
    total_tax: Int
    total_final_amount: Int
    instructor_count: Int
    session_count: Int
  }

  type Instructor {
    id: Int
    name: String
    type: String
    category: String
  }

  type EmployeeInfo {
    name: String
    type: String
    position: String
  }
 
`;

module.exports = page6TypeDefs; 
