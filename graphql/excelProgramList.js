const { gql } = require('apollo-server-express');

const excelTypeDefs = gql`
  type ExcelSheet1 {
    OPENDAY: String
    AGENCY: String
    PROGRAM_IN_OUT: String
  }

  type ExcelSheet2 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    BUSINESS: String
    AGENCY: String
    REGION: String
    ORG_TYPE: String
    PART_FORM: String
    AGE_TYPE: String
    PART_TYPE: String
    SERVICE_TYPE: String
    STAYDAYS: String
    PART_COUNT: Int!
    PEOPLE_COUNT: Int!
    MINE_AREA: String
    OM: String
    EXPENSE: String
  }

  type ExcelSheet3 {
    OPENDAY: String
    AGENCY: String
    PROGRAM_NAME: String
    BUNYA: String
    TEACHER: String
    row_count: Int!
    avg_score1: Float
    avg_score2: Float
    avg_score3: Float
    avg_score4: Float
    avg_score5: Float
    avg_score6: Float
    avg_score7: Float
    avg_score8: Float
    avg_score9: Float
  }

  type ExcelSheet4 {
    TEACHER: String
    PROGRAM_NAME: String
    avg_score1: Float
    avg_score2: Float
    avg_score3: Float
    avg_avg1: Float
    avg_score4: Float
    avg_score5: Float
    avg_score6: Float
    avg_avg2: Float
    avg_score7: Float
    avg_score8: Float
    avg_score9: Float
    avg_avg3: Float
    total_avg: Float
  }

  type ExcelSheet5 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    AGENCY: String
    PART_COUNT: Int!
    ROOM_CONVENIENCE: Float
    ROOM_CLEAN: Float
    RESTAURANT_CONVENIENCE: Float
    RESTAURANT_CLEAN: Float
    PROGRAM_PLACE_CONVENIENCE: Float
    PROGRAM_PLACE_CLEAN: Float
    PROGRAM_PLACE_PROPER: Float
    FOREST_CONVENIENCE: Float
    FOREST_CLEAN: Float
    FOREST_PROPER: Float
    OPERATION_METHOD: Float
    OPERATION_TIME: Float
    OPERATION_KINDNESS: Float
    MEAL_FRESH: Float
    MEAL_DIVERSITY: Float
    MEAL_NUTRITION: Float
    TOTAL_AVG: Float
  }

  type ExcelSheet6 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    AGENCY: String
    PART_COUNT: Int!
    TYPE: String
    HEALING_SUM: Float
    HEALING_AVG: Float
  }

  type ExcelSheet7 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    AGENCY: String
    PART_COUNT: Int!
    TYPE: String
    PREVENTION_BEFORE: Float
    PREVENTION_AFTER: Float
    PREVENTION_CHANGE: Float
  }

  type ExcelSheet8 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    AGENCY: String
    PART_COUNT: Int!
    TYPE: String
    COUNSEL_BEFORE: Float
    COUNSEL_AFTER: Float
  }

  type ExcelSheet9 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    AGENCY: String
    PART_COUNT: Int!
    TYPE: String
    ANS_ACTIVITY: Float
    ANS_BALANCE: Float
    STRESS_RESISTANCE: Float
    STRESS_INDEX: Float
    FATIGUE: Float
  }

  type ExcelSheet10 {
    TEACHER: String
    PROGRAM_NAME: String
    BUNYA: String
    CNT: Int!
  }

  type ExcelSheet11 {
    OPENDAY: String
    YEAR: Int!
    MONTH: Int!
    DAY: Int!
    AGENCY: String
    BUNYA: String
    PROGRAM_NAME: String
    TEACHER: String
    PLACE: String
    PART_COUNT: Int!
    avg_score1: Float
    avg_score2: Float
    avg_score3: Float
    avg_score4: Float
    avg_score5: Float
    avg_score6: Float
    avg_score7: Float
    avg_score8: Float
    avg_score9: Float
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