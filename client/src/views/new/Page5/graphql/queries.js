import { gql } from '@apollo/client';

// Query to get Page5 reservation list
export const GET_PAGE5_RESERVATION_LIST = gql`
  query GetPage5ReservationList {
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
      business_subcategory
      business_detail_category
      region
      notes
      reservation_manager
      operation_manager
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
          assistant_name
          helper_name
          price
          participants
          notes
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
          total_price
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
      page4_expenses {
        id
        project_name
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
      pageFinal {
        id
        page1_id
        discount_rate
        discount_notes
        complaint
        teacher_expenses {
          id
          category
          amount
          details
          notes
          is_planned
          discount_rate
        }
        participant_expenses {
          id
          category
          amount
          details
          notes
          is_planned
          discount_rate
        }
        income_items {
          id
          category
          amount
          details
          notes
          discount_rate
        }
      }
    }
  }
`;

// Query to get Page5 reservation details with related data
export const GET_PAGE5_RESERVATION_DETAIL = gql`
  query GetPage5ReservationDetail($id: Int!) {
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
      business_subcategory
      business_detail_category
      region
      notes
      reservation_manager
      operation_manager
      
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
          assistant_name
          helper_name
          notes
          price
          participants
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
          total_price
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
      page4_expenses {
        id
        project_name
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
      pageFinal {
        id
        page1_id
        discount_rate
        discount_notes
        complaint
        teacher_expenses {
          id
          category
          amount
          details
          notes
          is_planned
          discount_rate
        }
        participant_expenses {
          id
          category
          amount
          details
          notes
          is_planned
          discount_rate
        }
        income_items {
          id
          category
          amount
          details
          notes
          discount_rate
        }
      }
    }
  }
`;

// Query to get Page2 program details
export const GET_PAGE5_PROGRAMS = gql`
  query GetPage5Programs($id: Int!) {
    getPage2ByPage1Id(page1Id: $id) {
      id
      page1_id
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
  }
`;

// Query to get Page3 facility details
export const GET_PAGE5_FACILITIES = gql`
  query GetPage5Facilities($id: Int!) {
    getPage3ByPage1Id(page1Id: $id) {
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
        total_price
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
`;

// Query to get Page4 expense details
export const GET_PAGE5_EXPENSES = gql`
  query GetPage5Expenses($id: Int!) {
    getPage4ByPage1Id(page1Id: $id) {
      id
      project_name
      page1_id
      material_total
      etc_expense_total
      total_budget
      materials {
        id
        material_type
        name
        amount
        quantity
        total
        note
      }
      expenses {
        id
        name
        amount
        expense_type
        quantity
        price
        note
      }
    }
  }
`;

// Query to get calendar data for a specific month/year
export const GET_PAGE5_CALENDAR_DATA = gql`
  query GetCalendarData($month: String!, $year: String!) {
    getCalendarData(month: $month, year: $year) {
      id
      title
      start
      end
      status
      organization
      contact
      color
      business_category
      page1_id
    }
  }
`;

// Query to get statistics for reports
export const GET_PAGE5_STATISTICS = gql`
  query GetStatistics($period: String!, $type: String!) {
    getStatistics(period: $period, type: $type) {
      period
      type
      totalReservations
      totalRevenue
      averageStay
      categories {
        name
        value
        count
        percentage
      }
      organizations {
        name
        reservations_count
        total_revenue
        percentage
      }
      dailyData {
        date
        count
        value
      }
    }
  }
`;

// Query to get schedule data
export const GET_PAGE5_SCHEDULE_DATA = gql`
  query GetScheduleData($startDate: String!, $endDate: String!) {
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

// Query to get Page5 documents
export const GET_PAGE5_DOCUMENTS = gql`
  query GetPage5Documents($page1Id: Int) {
    getPage5Documents(page1Id: $page1Id) {
      id
      page1_id
      document_type
      status
      organization_name
      contact_name
      contact_email
      contact_phone
      reservation_date
      reservation_code
      created_at
      updated_at
    }
  }
`;

// Query to get Page5 document by ID
export const GET_PAGE5_DOCUMENT_BY_ID = gql`
  query GetPage5DocumentById($id: Int!) {
    getPage5DocumentById(id: $id) {
      id
      page1_id
      document_type
      status
      organization_name
      contact_name
      contact_email
      contact_phone
      reservation_date
      reservation_code
      created_at
      updated_at
    }
  }
`;

// Query to get reservation data for schedule view directly from Page1, Page2, and Page3
export const GET_PAGE5_RESERVATION_DATA_FOR_SCHEDULE = gql`
  query GetPage5ReservationDataForSchedule {
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
      business_subcategory
      business_detail_category
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
          assistant_name
          helper_name
          price
          notes
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
          total_price
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

// Query to get monthly reservation status data
export const GET_PAGE5_MONTHLY_STATUS = gql`
  query GetMonthlyReservationStatus($year: Int!, $month: Int!) {
    getMonthlyReservationStatus(year: $year, month: $month) {
      date
      day_of_week
      reservations {
        id
        group_name
        customer_name
        start_date
        end_date
        total_count
        business_category
        reservation_status
        programs {
          category_name
          program_name
          participants
        }
        rooms {
          room_name
          occupancy
        }
        meals {
          meal_type
          participants
        }
      }
      totals {
        total_groups
        total_participants
        confirmed_count
        tentative_count
        social_contribution_count
        profit_business_count
      }
    }
  }
`;

// Custom query for Excel export with individual income items (no grouping)
export const GET_PAGE5_EXCEL_EXPORT_DATA = gql`
  query GetPage5ExcelExportData($id: Int!) {
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
      business_subcategory
      business_detail_category
      notes
      reservation_manager
      
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
          assistant_name
          helper_name
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
          total_price
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
      page4_expenses {
        id
        project_name
        material_total
        etc_expense_total
        total_budget
        materials {
          id
          material_type
          name
          amount
          quantity
          total
          note
        }
        expenses {
          id
          name
          amount
          expense_type
          quantity
          price
          note
        }
      }
      pageFinal {
        id
        page1_id
        discount_rate
        discount_notes
        complaint
        participant_expenses {
          id
          category
          amount
          details
          notes
          is_planned
          discount_rate
        }
        income_items {
          id
          category
          amount
          details
          notes
          discount_rate
        }
      }
    }
    
    # Get individual income items for Excel export
    getExcelExportData(page1Id: $id) {
      page1_id
      group_name
      customer_name
      start_date
      end_date
      income_items {
        id
        category
        amount
        details
        notes
        discount_rate
      }
    }
  }
`; 