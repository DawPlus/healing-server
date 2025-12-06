const { gql } = require('apollo-server-express');

const yearMonthResultTypeDefs = gql`
  # Define scalar type for JSON
  scalar JSON

  # Input type for keyword search parameters
  input KeywordSearchInput {
    type: String!
    value: String!
  }

  # 참가유형 결과 타입
  type PartType {
    count_adult: String
    count_benefit: String
    count_boy: String
    count_etc: String
    count_general: String 
    count_family: String
    count_handicap: String
    count_multicultural: String
    count_income_etc: String
    count_income_green: String
    count_income_voucher: String
    count_kidboy: String
    count_old: String
    count_society: String
    part_adult: String
    part_benefit: String
    part_boy: String
    part_general: String
    part_family: String
    part_handicap: String
    part_multicultural: String
    part_income_etc: String
    part_income_green: String
    part_income_voucher: String
    part_kidboy: String
    part_old: String
    part_society: String
    org_1: Int
    org_2: Int
    org_3: Int
    org_4: Int
    org_5: Int
    org_part_1: Int
    org_part_2: Int
    org_part_3: Int
    org_part_4: Int
    org_part_5: Int
  }

  # 지역 목록 타입
  type ResidenceItem {
    area: String
    cnt: Int
  }

  # 프로그램시행개요 타입
  type ProgramOverviewPeople {
    cnt: Int
    part: Int
  }

  type ProgramOverviewTotal {
    cnt: Int
    part: Int
  }

  type ProgramOverviewService {
    cnt: Int
    part: Int
  }

  type ProgramOverviewRoom {
    meal_etc: String
    meal_lead: String
    meal_part: String
    room_etc_people: String
    room_etc_room: String
    room_lead_people: String
    room_lead_room: String
    room_part_people: String
    room_part_room: String
  }

  type ProgramOverview {
    people: [ProgramOverviewPeople]
    pTotal: [ProgramOverviewTotal]
    service: [ProgramOverviewService]
    room: [ProgramOverviewRoom]
  }

  # 프로그램운영 타입
  type ProgramManageManage {
    ITEM_ID: Int
    SCORE1: Float
    SCORE2: Float
    SCORE3: Float
    SCORE4: Float
    SCORE5: Float
    SCORE6: Float
    SCORE7: Float
    SCORE8: Float
    SCORE9: Float
    SCORE10: Float
    SCORE11: Float
    SCORE12: Float
    ITEM_NM: String
  }

  type ProgramManageBunya {
    cnt: Int
    ITEM_CD: String
    ITEM_NM: String
  }

  type ProgramManageCnt {
    cnt: Int
    CNT: Int
  }

  type ProgramSatisfaction {
    instructor: Float
    content: Float
    effectiveness: Float
    average: Float
  }

  type CategoryData {
    programs: Int
    internal_instructors: Int
    external_instructors: Int
    satisfaction: ProgramSatisfaction
  }

  type ProgramManage {
    manage: [ProgramManageManage]
    bunya: [ProgramManageBunya]
    manage_cnt: [ProgramManageCnt]
  }

  # 시설서비스 만족도 타입
  type SerList {
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
    total: Float
  }

  # 프로그램 효과성 분석 타입
  type ProgramEffect {
    PV: String
    physicalFitness: Float
    physicalPositive: Float
    physicalSleep: Float
    psychologicalAnxiety: Float
    psychologicalDepression: Float
    psychologicalSelfEsteem: Float
    psychologicalStress: Float
    socialFamily: Float
    socialFriend: Float
    socialSchool: Float
    spiritualExistence: Float
    spiritualMeditation: Float
    spiritualNature: Float
  }

  # 수입지출 타입
  type Income {
    other: Int
    accommodation: Int
    meals: Int
    materials: Int
    program: Int
    discount: Int
    total: Int
  }

  type Expense {
    instructorPlannedCost: Int
    instructorPlannedTransportation: Int
    instructorPlannedAssistant: Int
    instructorPlannedMeals: Int
    instructorExecutedCost: Int
    instructorExecutedTransportation: Int
    instructorExecutedAssistant: Int
    instructorExecutedMeals: Int
    customerPlannedAccommodation: Int
    customerPlannedMeals: Int
    customerPlannedReserve: Int
    customerPlannedMaterials: Int
    customerExecutedOthers: Int
    customerExecutedAccommodation: Int
    customerExecutedMeals: Int
    customerExecutedMaterials: Int
    reserve: Int
    total: Int
  }

  type ExIncomeList {
    income: Income
    expend: Expense
    incomeTotal: Int
  }

  # 프로그램 관심도 타입
  type ProgramInterestItem {
    INTEREST: Int
    COUNT: Int
  }

  type YearMonthResultItem {
    id: Int!
    agency: String!
    start_date: String!
    end_date: String!
    service_type: String!
    male_count: Int!
    female_count: Int!
    total_count: Int!
    male_leader_count: Int!
    female_leader_count: Int!
    total_leader_count: Int!
    operation_manager: String
    business_category: String
    business_detail_category: String
    part_type: String
    age_type: String
    region: String
  }

  type MonthlyServiceSummary {
    month: String!
    total_programs: Int!
    total_participants: Int!
    service_types: [ServiceTypeCount!]!
    age_distribution: [AgeTypeCount!]!
    part_type_distribution: [PartTypeCount!]!
  }

  type ServiceTypeCount {
    service_type: String!
    count: Int!
  }

  type AgeTypeCount {
    age_type: String!
    count: Int!
  }

  type PartTypeCount {
    part_type: String!
    count: Int!
  }

  # New type for the flat participant type list object
  type PartTypeListResult {
    count_adult: Int
    count_benefit: Int
    count_boy: Int
    count_etc: Int
    count_general: Int 
    count_family: Int
    count_handicap: Int
    count_multicultural: Int
    count_income_etc: Int
    count_income_green: Int
    count_income_voucher: Int
    count_kidboy: Int
    count_old: Int
    count_society: Int
    part_adult: Int
    part_benefit: Int
    part_boy: Int
    part_etc: Int
    part_general: Int
    part_family: Int
    part_handicap: Int
    part_multicultural: Int
    part_income_etc: Int
    part_income_green: Int
    part_income_voucher: Int
    part_kidboy: Int
    part_old: Int
    part_society: Int
    org_1: Int
    org_2: Int
    org_3: Int
    org_4: Int
    org_5: Int
    org_part_1: Int
    org_part_2: Int
    org_part_3: Int
    org_part_4: Int
    org_part_5: Int
  }

  type YearMonthServiceStats {
    total_participants: Int!
    male_participants: Int!
    female_participants: Int!
    total_leaders: Int!
    male_leaders: Int!
    female_leaders: Int!
    total_programs: Int!
    month_summaries: [MonthlyServiceSummary!]!
    service_type_distribution: [ServiceTypeCount!]!
    partTypeList: PartTypeListResult!
    age_type_distribution: [AgeTypeCount!]!
    service_satisfaction_scores: ServiceScores
    program_satisfaction_scores: [ProgramTypeScores!]!
    effect_scores: EffectScores
  }

  type ServiceScores {
    facility_scores: [Float!]!
    environment_scores: [Float!]!
    staff_scores: [Float!]!
    overall_score: Float!
  }

  type ProgramTypeScores {
    program_type: String!
    instructor_scores: [Float!]!
    content_scores: [Float!]!
    effectiveness_scores: [Float!]!
    overall_score: Float!
  }

  type EffectScores {
    prevent_effect: EffectScore
    counsel_effect: EffectScore
    healing_effect: EffectScore
    hrv_effect: HrvEffect
  }

  type EffectScore {
    pre_score: Float!
    post_score: Float!
    difference: Float!
  }

  type HrvEffect {
    autonomic_activity: EffectScore
    autonomic_balance: EffectScore
    stress_resistance: EffectScore
    stress_index: EffectScore
    fatigue_index: EffectScore
  }

  # --- New Types for Structured Report Data ---
  
  type ProgramOverviewPeopleType {
      man: Int!
      woman: Int!
      total: Int!
  }

  type ProgramOverviewTotalType {
      sum: Int!
  }

  type ProgramOverviewServiceType {
      name: String!
      cnt: Int!
  }

  type ProgramOverviewRoomType {
      meal_etc: String
      meal_lead: String
      meal_part: String
      room_etc_people: String
      room_etc_room: String
      room_lead_people: String
      room_lead_room: String
      room_part_people: String
      room_part_room: String
  }

  type ProgramOverviewType {
      people: [ProgramOverviewPeopleType!]!
      pTotal: [ProgramOverviewTotalType!]!
      service: [ProgramOverviewServiceType!]!
      room: [ProgramOverviewRoomType!]!
      male_leaders: Int!
      female_leaders: Int!
      total_leaders: Int!
  }

  type ProgramManageManageItem {
      month: String!
      total: Int!
  }

  type ProgramManageBunyaItem {
      month: String!
      type: String!
      cnt: Int!
  }

  type ProgramManageCntItem {
      type: String!
      cnt: Int!
  }

  type ProgramManageType {
      manage: [ProgramManageManageItem!]!
      bunya: [ProgramManageBunyaItem!]!
      manage_cnt: [ProgramManageCntItem!]!
      categoryData: JSON
  }

  type SerListType {
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
      total: Float
  }

  type ProgramEffectType {
      type: String!
      sum1: Int!
      sum2: Int!
      avg1: Float!
      avg2: Float!
      diff: Float!
  }

  type ExIncomeListIncome {
      other: Int
      accommodation: Int
      meals: Int
      materials: Int
      program: Int
      discount: Int
      total: Int
  }

  type ExIncomeListExpend {
      instructorPlannedCost: Int
      instructorPlannedTransportation: Int
      instructorPlannedAssistant: Int
      instructorPlannedMeals: Int
      instructorExecutedCost: Int
      instructorExecutedTransportation: Int
      instructorExecutedAssistant: Int
      instructorExecutedMeals: Int
      customerPlannedAccommodation: Int
      customerPlannedMeals: Int
      customerPlannedReserve: Int
      customerPlannedMaterials: Int
      customerExecutedOthers: Int
      customerExecutedAccommodation: Int
      customerExecutedMeals: Int
      customerExecutedMaterials: Int
      reserve: Int
      total: Int
  }

  type ExIncomeListType {
      expend: ExIncomeListExpend!
      income: ExIncomeListIncome!
      incomeTotal: Int!
  }
  
  # --- Top-Level Report Data Type ---
  type YearMonthReportData {
      partTypeList: PartTypeListResult!
      programOverview: ProgramOverviewType!
      programManage: ProgramManageType!
      serList: SerListType!
      programEffect: [ProgramEffectType!]!
      exIncomeList: ExIncomeListType!
  }

  # 쿼리 타입
  type Query {
    # 연월결과 보고서 관련 쿼리
    getPartTypeList(openday: String!, endday: String!): PartType
    getResidenceList(openday: String!, endday: String!): [ResidenceItem]
    getProgramOverview(openday: String!, endday: String!): ProgramOverview
    getProgramManage(openday: String!, endday: String!): ProgramManage
    getSerList(openday: String!, endday: String!): SerList
    getProgramEffect(openday: String!, endday: String!): [ProgramEffect]
    getExIncomeList(openday: String!, endday: String!): ExIncomeList
    getIsCloseMine(openday: String!, endday: String!): Int
    getProgramInterest(openday: String!, endday: String!): [ProgramInterestItem]
    getYearMonthResults(startDate: String!, endDate: String!, keywords: [KeywordSearchInput]): [YearMonthResultItem!]!
    getYearMonthServiceStats(startDate: String!, endDate: String!, keywords: [KeywordSearchInput]): YearMonthReportData!
  }
`;

module.exports = yearMonthResultTypeDefs; 