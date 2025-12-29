import { gql } from '@apollo/client';

// 프로그램 목록 조회 쿼리
export const GET_PROGRAM_LIST = gql`
  query GetProgramList($openDay: String, $endDay: String) {
    getProgramList(openDay: $openDay, endDay: $endDay) {
      BASIC_INFO_SEQ
      AGENCY
      OPENDAY
      ENDDAY
      SERVICE_TYPE
      PART_MAN_CNT
      PART_WOMAN_CNT
      LEAD_MAN_CNT
      LEAD_WOMAN_CNT
      OM
    }
  }
`;

// 프로그램 상세 정보 조회 쿼리
export const GET_PROGRAM_DETAIL = gql`
  query GetProgramDetail($seq: Int!, $agency: String!, $openday: String!, $detailed: Boolean) {
    getProgramDetail(seq: $seq, agency: $agency, openday: $openday, detailed: $detailed) {
      basicInfo {
        AGENCY
        OM
        OPENDAY
        DAYS_TO_STAY
        RESIDENCE
        PART_MAN_CNT
        PART_WOMAN_CNT
        LEAD_MAN_CNT
        LEAD_WOMAN_CNT
        SUPPORT
        INCOME_TYPE
        PART_TYPE
        AGE_TYPE
        BIZ_PURPOSE
        PROGRAM_IN_OUT
        ROOM_PART_PEOPLE
        ROOM_PART_ROOM
        MEAL_TYPE
        MEAL_PART
        ROOM_LEAD_PEOPLE
        ROOM_LEAD_ROOM
        MEAL_LEAD
        ROOM_ETC_PEOPLE
        ROOM_ETC_ROOM
        MEAL_ETC
        PROGRAM_OPINION
        SERVICE_OPINION
        OVERALL_OPINION
        SERVICE_TYPE
        org_nature
        STANDARD_ROOM_COUNT
        DELUXE_ROOM_COUNT
        TOTAL_ROOM_COUNT
        TOTAL_MEAL_PARTICIPANTS
      }
      serviceList {
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
      }
      programSatisfaction {
        PROGRAM_NAME
        TEACHER
        BUNYA
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
        cnt
      }
      programSaf {
        SAF_SEQ
        PROGRAM_NAME
        START_TIME
        END_TIME
        SAF_DATE
      }
      programs {
        id
        category
        category_name
        program
        program_name
        date
        start_time
        end_time
        duration
        place
        place_name
        instructor
        instructor_name
        assistant
        assistant_name
        helper
        helper_name
        notes
        price
        price_per_person
        participants
      }
      effect {
        counsel {
          type
          sum1
          avg1
          sum2
          avg2
        }
        healing {
          type
          sum1
          avg1
          sum2
          avg2
        }
        hrv {
          pv
          num1
          num2
          num3
          num4
          num5
        }
        prevent {
          type
          sum1
          avg1
          sum2
          avg2
        }
      }
      inExpense {
        income {
          ITEM
          PRICE
          DETAIL
        }
        expense {
          ITEM
          PRICE
          DETAIL
        }
      }
      serviceForms {
        id
        agency
        openday
        eval_date
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
      }
      programForms {
        id
        agency
        openday
        eval_date
        program_category_id
        program_id
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
      }
      preventForms {
        id
        agency
        openday
        eval_date
        pv
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
      }
      healingForms {
        id
        agency
        openday
        eval_date
        pv
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
      }
      counselForms {
        id
        agency
        openday
        eval_date
        score1
        score2
        score3
        score4
        score5
        score6
      }
      hrvForms {
        id
        agency
        openday
        eval_date
        pv
        score1
        score2
        score3
        score4
        score5
      }
      programCategories {
        id
        category_name
        display_order
      }
      programItems {
        id
        program_name
        category_id
        display_order
      }
      instructors {
        id
        name
        payment
      }
      assistantInstructors {
        id
        name
      }
      helpers {
        id
        name
      }
      page4Data {
        id
        project_name
        created_by
        page1_id
        material_total
        etc_expense_total
        total_budget
        materials {
          id
          material_type
          name
          amount
          actual_amount
          quantity
          total
          note
        }
        expenses {
          id
          name
          amount
          actual_price
          actual_amount
          expense_type
          quantity
          price
          note
        }
      }
      complaint
    }
  }
`; 