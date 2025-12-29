import { gql } from '@apollo/client';

// 참가유형 조회 쿼리
export const GET_SEARCH_PART_TYPE_LIST = gql`
  query GetSearchPartTypeList($keyword: [KeywordInput!]!, $openday: String, $endday: String) {
    getSearchPartTypeList(keyword: $keyword, openday: $openday, endday: $endday) {
      count_adult
      count_benefit
      count_boy
      count_etc
      count_general
      count_family
      count_handicap
      count_multicultural
      count_income_etc
      count_income_green
      count_income_voucher
      count_kidboy
      count_old
      count_society
      part_adult
      part_benefit
      part_boy
      part_general
      part_family
      part_handicap
      part_multicultural
      part_income_etc
      part_income_green
      part_income_voucher
      part_kidboy
      part_old
      part_society
      org_1
      org_2
      org_3
      org_4
      org_5
      org_part_1
      org_part_2
      org_part_3
      org_part_4
      org_part_5
    }
  }
`;

// 지역 분포 쿼리
export const GET_SEARCH_RESIDENCE_LIST = gql`
  query GetSearchResidenceList($keyword: [KeywordInput!]!, $openday: String, $endday: String) {
    getSearchResidenceList(keyword: $keyword, openday: $openday, endday: $endday) {
      RESIDENCE
      count
      total
    }
  }
`;

// 프로그램 관리 및 만족도 쿼리
export const GET_SEARCH_PROGRAM_MANAGE = gql`
  query GetSearchProgramManage($keyword: [KeywordInput!]!, $openday: String, $endday: String) {
    getSearchProgramManage(keyword: $keyword, openday: $openday, endday: $endday) {
      manage {
        type
        forestEducation
        preventEducation
        forestHealing
        art
        relaxing
        energetic
        cooking
        event
        total
      }
      bunya {
        type
        forestEducation
        preventEducation
        forestHealing
        art
        relaxing
        energetic
        cooking
        event
      }
    }
  }
`;

// 시설 서비스 만족도 쿼리
export const GET_SEARCH_SER_LIST = gql`
  query GetSearchSerList($keyword: [KeywordInput!]!, $openday: String, $endday: String) {
    getSearchSerList(keyword: $keyword, openday: $openday, endday: $endday) {
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
      total
    }
  }
`;

// 프로그램 효과성 분석 쿼리
export const GET_SEARCH_PROGRAM_EFFECT = gql`
  query GetSearchProgramEffect($keyword: [KeywordInput!]!, $openday: String, $endday: String) {
    getSearchProgramEffect(keyword: $keyword, openday: $openday, endday: $endday) {
      PV
      preventSum
      preventAvg
      counselSum
      counselAvg
      healingTotalSum
      healingAverageScore
      hrvNum1
      hrvNum2
      hrvNum3
      hrvNum4
      hrvNum5
    }
  }
`;

// 폐광지역 카운트 쿼리
export const GET_SEARCH_IS_CLOSE_MINE = gql`
  query GetSearchIsCloseMine($keyword: [KeywordInput!]!, $openday: String, $endday: String) {
    getSearchIsCloseMine(keyword: $keyword, openday: $openday, endday: $endday)
  }
`; 