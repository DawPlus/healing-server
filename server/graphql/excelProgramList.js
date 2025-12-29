const { gql } = require('apollo-server-express');

const excelTypeDefs = gql`
  type ExcelSheet1 {
    year: Int!
    month: Int!
    day: Int!
    dayOfWeek: String
    stayDays: Int!
    reservationType: String
    groupName: String
    region: String
    businessCategory: String
    mineArea: String
    orgNature: String
    partType: String
    partForm: String
    serviceType: String
    participantCount: Int!
    totalPersonDays: Int!
    infantCount: Int!
    elementaryCount: Int!
    middleCount: Int!
    highCount: Int!
    adultCount: Int!
    elderlyCount: Int!
    reservationManager: String
    operationManager: String
    programCount: Int!
    day2Rooms: Int!
    day4Rooms: Int!
    mealCount: Int!
    totalBudget: Int!
  }

  type ExcelSheet2 {
    id: Int!
    date: String
    dayOfWeek: String
    groupName: String
    programName: String
    place: String
    startTime: String
    endTime: String
    timeSlot: String
    instructorName: String
    assistantName: String
    helperName: String
    businessCategory: String
    totalCount: Int
    programType: String
    reservation_date: String
    start_date: String
    group_name: String
    program_name: String
    place_name: String
    start_time: String
    end_time: String
    instructor_name: String
    assistant_name: String
    helper_name: String
    notes: String
    venue: String
    manager: String
    special_notes: String
    institution_name: String
  }

  type ExcelSheet3 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    dayOfWeek: String
    stayDays: Int!
    groupName: String
    region: String
    mineArea: String
    businessCategory: String
    orgNature: String
    isMou: String
    partType: String
    partForm: String
    serviceType: String
    participantCount: Int!
    totalPersonDays: Int!
    elementaryCount: Int!
    middleCount: Int!
    highCount: Int!
    adultCount: Int!
    elderlyCount: Int!
    operationManager: String
    programCount: Int!
    day2Rooms: Int!
    day4Rooms: Int!
    mealTotalCount: Int!
    totalExpense: Int!
    totalRevenue: Int!
  }

  type ExcelSheet4 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    groupName: String
    businessCategory: String
    categoryName: String
    programName: String
    placeName: String
    participants: Int!
    instructorName: String
    instructorType: String
    instructorSatisfaction: Float
    programComposition: Float
    effectiveness: Float
  }

  type ExcelSheet5 {
    sequenceNumber: Int!
    instructorName: String
    instructorType: String
    categoryName: String
    programName: String
    lectureCount: Int!
    totalParticipants: Int!
    instructorSatisfaction: Float
    programComposition: Float
    effectiveness: Float
    averageScore: Float
  }

  type ExcelSheet6 {
    no: Int!
    category: String
    program_name: String
    instructor_name: String
    instructor_type: String
    run_count: Int!
    survey_participants: Int!
    satisfaction_instructor: Float
    satisfaction_program: Float
    satisfaction_effect: Float
    satisfaction_avg: Float
  }

  type ExcelSheet7 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    groupName: String
    businessType: String
    participantCount: Int!
    accommodationSatisfaction: Float
    programPlaceSatisfaction: Float
    outdoorAccommodationSatisfaction: Float
    operationSatisfaction: Float
    mealSatisfaction: Float
    facilityAverage: Float
  }

  type ExcelSheet8 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    groupName: String
    participantCount: Int!
    category: String
    healingEffectTotal: Float
    healingEffectAverage: Float
  }

  type ExcelSheet9 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    groupName: String
    participantCount: Int!
    category: String
    preventionEffectTotal: Float
    preventionEffectAverage: Float
  }

  type ExcelSheet10 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    groupName: String
    participantCount: Int!
    category: String
    counselingTherapyTotal: Float
    counselingTherapyAverage: Float
  }

  type ExcelSheet11 {
    sequenceNumber: Int!
    year: Int!
    month: Int!
    day: Int!
    groupName: String
    participantCount: Int!
    category: String
    autonomicNervousActivity: Float
    autonomicNervousBalance: Float
    stressIndexLevel: Float
    stressIndex: Float
    ratio: Float
  }

  type ExcelProgramListData {
    sheet1: [ExcelSheet1]
    sheet2: [ExcelSheet2]
    sheet3: [ExcelSheet3]
    sheet4: [ExcelSheet4]
    sheet5: [ExcelSheet5]
    sheet6: [ExcelSheet6]
    sheet7: [ExcelSheet7]
    sheet8: [ExcelSheet8]
    sheet9: [ExcelSheet9]
    sheet10: [ExcelSheet10]
    sheet11: [ExcelSheet11]
  }

  extend type Query {
    excelProgramList(openday: String, endday: String): ExcelProgramListData
  }
`;

module.exports = excelTypeDefs; 