import { gql } from '@apollo/client';

// 참가유형 쿼리
export const GET_PART_TYPE_LIST = gql`
  query GetPartTypeList($openday: String!, $endday: String!) {
    getPartTypeList(openday: $openday, endday: $endday) {
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

// 지역목록 쿼리
export const GET_RESIDENCE_LIST = gql`
  query GetResidenceList($openday: String!, $endday: String!) {
    getResidenceList(openday: $openday, endday: $endday) {
      area
      cnt
    }
  }
`;

// 프로그램 개요 쿼리
export const GET_PROGRAM_OVERVIEW = gql`
  query GetProgramOverview($openday: String!, $endday: String!) {
    getProgramOverview(openday: $openday, endday: $endday) {
      people {
        cnt
        part
      }
      pTotal {
        cnt
        part
      }
      service {
        cnt
        part
      }
      room {
        meal_etc
        meal_lead
        meal_part
        room_etc_people
        room_etc_room
        room_lead_people
        room_lead_room
        room_part_people
        room_part_room
      }
    }
  }
`;

// 프로그램 관리 쿼리
export const GET_PROGRAM_MANAGE = gql`
  query GetProgramManage($openday: String!, $endday: String!) {
    getProgramManage(openday: $openday, endday: $endday) {
      manage {
        ITEM_ID
        ITEM_NM
        SCORE1
        SCORE2
        SCORE3
        SCORE4
        SCORE5
        SCORE6
        SCORE7
        SCORE8
        SCORE9
        SCORE10
        SCORE11
        SCORE12
      }
      bunya {
        cnt
        ITEM_CD
        ITEM_NM
      }
      manage_cnt {
        cnt
        CNT
      }
    }
  }
`;

// 시설 서비스 만족도 쿼리
export const GET_SER_LIST = gql`
  query GetSerList($openday: String!, $endday: String!) {
    getSerList(openday: $openday, endday: $endday) {
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
export const GET_PROGRAM_EFFECT = gql`
  query GetProgramEffect($openday: String!, $endday: String!) {
    getProgramEffect(openday: $openday, endday: $endday) {
      PV
      physicalFitness
      physicalPositive
      physicalSleep
      psychologicalAnxiety
      psychologicalDepression
      psychologicalSelfEsteem
      psychologicalStress
      socialFamily
      socialFriend
      socialSchool
      spiritualExistence
      spiritualMeditation
      spiritualNature
    }
  }
`;

// 수입지출 쿼리
export const GET_EX_INCOME_LIST = gql`
  query GetExIncomeList($openday: String!, $endday: String!) {
    getExIncomeList(openday: $openday, endday: $endday) {
      income {
        other
        accommodation
        meals
        materials
        program
        discount
        total
      }
      expend {
        instructorPlannedCost
        instructorPlannedTransportation
        instructorPlannedAssistant
        instructorPlannedMeals
        instructorExecutedCost
        instructorExecutedTransportation
        instructorExecutedAssistant
        instructorExecutedMeals
        customerPlannedAccommodation
        customerPlannedMeals
        customerPlannedReserve
        customerPlannedMaterials
        customerExecutedOthers
        customerExecutedAccommodation
        customerExecutedMeals
        customerExecutedMaterials
        reserve
        total
      }
      incomeTotal
    }
  }
`;

// 폐광지역 카운트 쿼리
export const GET_IS_CLOSE_MINE = gql`
  query GetIsCloseMine($openday: String!, $endday: String!) {
    getIsCloseMine(openday: $openday, endday: $endday)
  }
`;

// 프로그램 관심도 쿼리
export const GET_PROGRAM_INTEREST = gql`
  query GetProgramInterest($openday: String!, $endday: String!) {
    getProgramInterest(openday: $openday, endday: $endday) {
      INTEREST
      COUNT
    }
  }
`;

// 기본 월별 목록 조회 쿼리 - 키워드 검색 기능 추가
export const GET_YEAR_MONTH_RESULTS = gql`
  query GetYearMonthResults($startDate: String!, $endDate: String!, $keywords: [KeywordSearchInput]) {
    getYearMonthResults(startDate: $startDate, endDate: $endDate, keywords: $keywords) {
      id
      agency
      start_date
      end_date
      service_type
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      operation_manager
      business_category
      business_detail_category
      part_type
      age_type
      region
      meal_plans
      standard_room_count
      deluxe_room_count
      total_room_count
    }
  }
`;

// 월별 통계 데이터 조회 쿼리 - 키워드 검색 기능 추가
export const GET_YEAR_MONTH_SERVICE_STATS = gql`
  query GetYearMonthServiceStats($startDate: String!, $endDate: String!, $keywords: [KeywordSearchInput]) {
    getYearMonthServiceStats(startDate: $startDate, endDate: $endDate, keywords: $keywords) {
      partTypeList {
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
        part_etc
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
      programOverview {
        people {
          man
          woman
          total
        }
        pTotal {
          sum
        }
        service {
          name
          cnt
        }
        room {
          meal_etc
          meal_lead
          meal_part
          room_etc_people
          room_etc_room
          room_lead_people
          room_lead_room
          room_part_people
          room_part_room
        }
        male_leaders
        female_leaders
        total_leaders
      }
      programManage {
        manage {
          month
          total
        }
        bunya {
          month
          type
          cnt
        }
        manage_cnt {
          type
          cnt
        }
        categoryData
      }
      serList {
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
      facilityScoresByAgency
      programEffect {
        type
        sum1
        sum2
        avg1
        avg2
        diff
      }
      preventEffect {
        smartphone {
          preventSum
          preventAvg
          counselSum
          counselAvg
          healingTotalSum
          healingAverageScore
          avgScore1
          avgScore2
          avgScore3
          avgScore4
          avgScore5
          avgScore6
        }
        gambling {
          preventSum
          preventAvg
          counselSum
          counselAvg
          healingTotalSum
          healingAverageScore
          avgScore1
          avgScore2
          avgScore3
          avgScore4
          avgScore5
          avgScore6
        }
        experienceStats {
          hasExperience
          noExperience
          notSpecified
        }
      }
      facilityEnvironment {
        facility_avg1
        facility_avg2
        facility_avg3
        facility_avg4
        facility_avg5
        facility_avg6
        facility_avg7
        facility_avg8
        facility_avg9
        facility_avg10
        operation_avg1
        operation_avg2
        operation_avg3
        operation_avg4
        operation_avg5
        operation_avg6
        overall_satisfaction
      }
      healingEffect {
        pre_avg1
        pre_avg2
        pre_avg3
        pre_avg4
        pre_avg5
        pre_avg6
        pre_avg7
        post_avg1
        post_avg2
        post_avg3
        post_avg4
        post_avg5
        post_avg6
        post_avg7
        diff_avg1
        diff_avg2
        diff_avg3
        diff_avg4
        diff_avg5
        diff_avg6
        diff_avg7
        experienceStats {
          hasExperience
          noExperience
          notSpecified
        }
      }
      exIncomeList {
        income {
          other
          accommodation
          meals
          materials
          program
          discount
          total
        }
        expend {
          instructorPlannedCost
          instructorPlannedTransportation
          instructorPlannedAssistant
          instructorPlannedMeals
          instructorExecutedCost
          instructorExecutedTransportation
          instructorExecutedAssistant
          instructorExecutedMeals
          customerPlannedAccommodation
          customerPlannedMeals
          customerPlannedReserve
          customerPlannedMaterials
          customerExecutedOthers
          customerExecutedAccommodation
          customerExecutedMeals
          customerExecutedMaterials
          reserve
          total
        }
        incomeTotal
      }
    }
  }
`; 