import { gql } from '@apollo/client';

// 예약 정보 목록 가져오기
export const GET_PAGE6_RESERVATION_LIST = gql`
  query GetPage6ReservationList {
    getPage1List {
      id
      group_name
      customer_name
      mobile_phone
      landline_phone
      email
      start_date
      end_date
      reservation_status
      total_count
      business_category
      operation_manager
      reservation_manager
    }
  }
`;

// 특정 예약의 상세 정보 가져오기
export const GET_PAGE6_RESERVATION_DETAIL = gql`
  query GetPage6ReservationDetail($id: Int!) {
    getPage1ById(id: $id) {
      id
      group_name
      customer_name
      mobile_phone
      landline_phone
      email
      start_date
      end_date
      reservation_status
      total_count
      business_category
      operation_manager
      reservation_manager
      notes
      page2_reservations {
        id
        male_count
        female_count
        total_count
        male_leader_count
        female_leader_count
        total_leader_count
        org_nature
        part_type
        age_type
        part_form
        service_type
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
          notes
          price
        }
      }
      page3 {
        id
        page1_id
        reservation_status
        room_selections {
          id
          room_id
          room_name
          room_type
          check_in_date
          check_out_date
          occupancy
          price
          capacity
          nights
          notes
        }
        meal_plans {
          id
          date
          meal_type
          meal_option
          participants
          dinner_option
          price
          notes
        }
        place_reservations {
          id
          place_id
          place_name
          reservation_date
          start_time
          end_time
          purpose
          participants
          price
          notes
        }
      }
    }
  }
`;

// 프로그램 일정표를 위한 스케줄 데이터 가져오기
export const GET_PAGE6_SCHEDULE_DATA = gql`
  query GetPage6ScheduleData($startDate: String!, $endDate: String!) {
    getScheduleData(startDate: $startDate, endDate: $endDate) {
      date
      programs {
        id
        program_name
        organization
        start_time
        end_time
        location
        participants
        instructor_name
      }
      rooms {
        id
        room_name
        organization
        check_in
        check_out
        occupancy
      }
      meals {
        id
        meal_type
        organization
        time
        participants
        location
      }
      places {
        id
        place_name
        organization
        start_time
        end_time
        purpose
        participants
      }
    }
  }
`;

// 객실 정보 가져오기
export const GET_PAGE6_ROOMS = gql`
  query GetPage6Rooms {
    getRooms {
      id
      room_name
      room_type
      capacity
      floor
      status
    }
  }
`;

// 특정 날짜 기간의 객실 예약 현황 가져오기
export const GET_PAGE6_ROOM_ASSIGNMENTS = gql`
  query GetPage6RoomAssignments($startDate: String!, $endDate: String!) {
    getRoomAssignments(startDate: $startDate, endDate: $endDate) {
      room_id
      room_name
      floor
      capacity
      assignments {
        id
        date
        organization
        occupancy
        reservation_id
      }
    }
  }
`;

// 식사 인원 정보 가져오기
export const GET_PAGE6_MEAL_STAFF = gql`
  query GetPage6MealStaff($startDate: String!, $endDate: String!, $reservationId: Int) {
    getMealStaff(startDate: $startDate, endDate: $endDate, reservationId: $reservationId) {
      date
      meal_type
      youth_count
      adult_count
      instructor_count
      other_count
      total_count
      organization
      reservation_id
    }
  }
`;

// 주간일정표를 위한 데이터 가져오기
export const GET_PAGE6_WEEKLY_SCHEDULE = gql`
  query GetPage6WeeklySchedule($startDate: String!, $endDate: String!) {
    getWeeklySchedule(startDate: $startDate, endDate: $endDate) {
      date
      timeSlots {
        time
        events {
          id
          type  # 이벤트 유형 (program, meal, place, room)
          organization
          programName
          location
          startTime
          endTime
          instructorName
          participants
          reservation_status
        }
      }
    }
  }
`;

// 프로그램 시행보고 데이터 가져오기
export const GET_PAGE6_IMPLEMENTATION_PLAN = gql`
  query GetPage6ImplementationPlan($month: String, $startDate: String, $endDate: String, $reservationId: Int) {
    getImplementationPlan(month: $month, startDate: $startDate, endDate: $endDate, reservationId: $reservationId) {
      id
      group_name
      location
      period
      programs {
        type
        male_count
        female_count
        total_count
        instructor_count
        total_with_instructors
      }
      service_types {
        name
        count
      }
      meal_info {
        type
        date
        count
      }
      events
      accommodations {
        room_name
        count
      }
      employee_info {
        name
        type
        position
      }
      etc_notes
    }
  }
`;

// 수익 실적 보고서 데이터 가져오기
export const GET_PAGE6_USAGE_REPORT = gql`
  query GetPage6UsageReport($year: Int, $month: Int, $organization: String) {
    getUsageReport(year: $year, month: $month, organization: $organization) {
      id
      month
      day
      weekday
      usage_type
      customer_type
      service_type
      organization
      amount
      food_amount
      program_amount
      etc_amount
      facility_amount
      vat
      discount_amount
      total_amount
      payment_method
      payment_code
      receipt_date
      notes
    }
  }
`;

// 수익 실적 보고서를 위한 단체 목록 가져오기
export const GET_PAGE6_ORGANIZATIONS_FOR_USAGE_REPORT = gql`
  query GetPage6OrganizationsForUsageReport($year: Int, $month: Int) {
    getOrganizationsForUsageReport(year: $year, month: $month) {
      name
    }
  }
`;

// 강사비 지급 정보 가져오기
export const GET_PAGE6_INSTRUCTOR_PAYMENTS = gql`
  query GetPage6InstructorPayments($year: Int, $month: Int, $startDate: String, $endDate: String, $instructorName: String) {
    getInstructorPayments(year: $year, month: $month, startDate: $startDate, endDate: $endDate, instructorName: $instructorName) {
      id
      month
      day
      weekday
      instructor_name
      instructor_type
      instructor_category
      organization
      business_category
      program_name
      date
      time
      sessions
      payment_amount
      tax_amount
      final_amount
      payment_date
      assistant_instructor_name
      assistant_instructor_fee
      healing_helper_name
      healing_helper_fee
    }
  }
`;

// 강사 목록 가져오기
export const GET_PAGE6_INSTRUCTORS = gql`
  query GetPage6Instructors {
    getInstructors {
      id
      name
      type
      category
    }
  }
`;

// 강사비 지급 월별 요약 정보 가져오기
export const GET_PAGE6_MONTHLY_INSTRUCTOR_SUMMARY = gql`
  query GetPage6MonthlyInstructorSummary($year: Int, $month: Int, $startDate: String, $endDate: String) {
    getMonthlyInstructorSummary(year: $year, month: $month, startDate: $startDate, endDate: $endDate) {
      month
      year
      total_amount
      total_tax
      total_final_amount
      total_assistant_fee
      total_helper_fee
      instructor_count
      session_count
    }
  }
`;

// 객실 정보 가져오기 (MenuRoom 모델)
export const GET_PAGE6_MENU_ROOMS = gql`
  query MenuRooms {
    menuRooms {
      id
      room_type
      room_name
      capacity
      price
      description
      is_available
      facilities
      display_order
    }
  }
`;

// 프로그램 카테고리 정보 가져오기 (Implementation Plan용)
export const GET_PROGRAM_CATEGORIES = gql`
  query GetProgramCategories {
    programCategories {
      id
      category_name
      description
      display_order
    }
  }
`; 