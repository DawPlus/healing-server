const { gql } = require('apollo-server-express');

const searchProgramResultTypeDefs = gql`
  # 키워드 입력 타입
  input KeywordInput {
    type: String!
    text: String!
  }

  # 참가유형 타입
  type SearchPartType {
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

  # 지역별 분포 타입
  type SearchResidenceItem {
    RESIDENCE: String
    count: Int
    total: Int
  }

  # 프로그램 관리 및 만족도 타입
  type ProgramManageItem {
    type: String!
    forestEducation: Float
    preventEducation: Float
    forestHealing: Float
    art: Float
    relaxing: Float
    energetic: Float
    cooking: Float
    event: Float
    total: Float
  }

  type ProgramBunyaItem {
    type: String!
    forestEducation: Float
    preventEducation: Float
    forestHealing: Float
    art: Float
    relaxing: Float
    energetic: Float
    cooking: Float
    event: Float
  }

  type SearchProgramManage {
    manage: [ProgramManageItem!]!
    bunya: [ProgramBunyaItem!]!
  }

  # 시설 서비스 만족도 타입
  type SearchSerList {
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
  type SearchProgramEffect {
    PV: String!
    preventSum: Float
    preventAvg: Float
    counselSum: Float
    counselAvg: Float
    healingTotalSum: Float
    healingAverageScore: Float
    hrvNum1: Float
    hrvNum2: Float
    hrvNum3: Float
    hrvNum4: Float
    hrvNum5: Float
  }

  # 쿼리 타입
  type Query {
    # 참가유형 조회
    getSearchPartTypeList(keyword: [KeywordInput!]!, openday: String, endday: String): SearchPartType

    # 지역별 분포 조회
    getSearchResidenceList(keyword: [KeywordInput!]!, openday: String, endday: String): [SearchResidenceItem]

    # 프로그램 관리 및 만족도 조회
    getSearchProgramManage(keyword: [KeywordInput!]!, openday: String, endday: String): SearchProgramManage

    # 시설 서비스 만족도 조회
    getSearchSerList(keyword: [KeywordInput!]!, openday: String, endday: String): SearchSerList

    # 프로그램 효과성 분석 조회
    getSearchProgramEffect(keyword: [KeywordInput!]!, openday: String, endday: String): [SearchProgramEffect]
    
    # 폐광지역 카운트 조회
    getSearchIsCloseMine(keyword: [KeywordInput!]!, openday: String, endday: String): Int
  }
`;

module.exports = searchProgramResultTypeDefs; 