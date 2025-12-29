import { gql } from '@apollo/client';

// Queries
export const GET_PAGE2_LIST = gql`
  query GetPage2List {
    getPage2List {
      id
      page1_id
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      is_mou
      org_nature
      part_type
      age_type
      part_form
      service_type
      infant_count
      elementary_count
      middle_count
      high_count
      adult_count
      elderly_count
      age_group_total
      created_at
      updated_at
      page1 {
        id
        reservation_status
        start_date
        end_date
        group_name
        customer_name
        total_count
        email
        mobile_phone
        landline_phone
        notes
        operation_manager
        reservation_manager
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
        price
        notes
      }
    }
  }
`;

export const GET_PAGE2_BY_ID = gql`
  query GetPage2ById($id: Int!) {
    getPage2ById(id: $id) {
      id
      page1_id
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      is_mou
      org_nature
      part_type
      age_type
      part_form
      service_type
      infant_count
      elementary_count
      middle_count
      high_count
      adult_count
      elderly_count
      age_group_total
      created_at
      updated_at
      page1 {
        id
        reservation_status
        start_date
        end_date
        group_name
        customer_name
        total_count
        email
        mobile_phone
        landline_phone
        notes
        operation_manager
        reservation_manager
      }
      programs {
        id
        reservation_id
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
        participants
        is_multi
        multi1_name
        multi2_name
      }
    }
  }
`;

export const GET_PAGE2_BY_PAGE1_ID = gql`
  query GetPage2ByPage1Id($page1Id: Int!) {
    getPage2ByPage1Id(page1Id: $page1Id) {
      id
      page1_id
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      is_mou
      org_nature
      part_type
      age_type
      part_form
      service_type
      infant_count
      elementary_count
      middle_count
      high_count
      adult_count
      elderly_count
      age_group_total
      created_at
      updated_at
      page1 {
        id
        reservation_status
        start_date
        end_date
        group_name
        customer_name
        total_count
        email
        mobile_phone
        landline_phone
        notes
        operation_manager
        reservation_manager
      }
      programs {
        id
        reservation_id
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
        participants
        is_multi
        multi1_name
        multi2_name
      }
    }
  }
`;

export const GET_PAGE2_PROGRAMS = gql`
  query GetPage2Programs($reservationId: Int!) {
    getPage2Programs(reservationId: $reservationId) {
      id
      reservation_id
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
      participants
      is_multi
      multi1_name
      multi2_name
      created_at
      updated_at
    }
  }
`;

// Mutations
export const CREATE_PAGE2 = gql`
  mutation CreatePage2($input: Page2Input!) {
    createPage2(input: $input) {
      id
      page1_id
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      is_mou
      org_nature
      part_type
      age_type
      part_form
      service_type
      infant_count
      elementary_count
      middle_count
      high_count
      adult_count
      elderly_count
      age_group_total
    }
  }
`;

export const UPDATE_PAGE2 = gql`
  mutation UpdatePage2($id: Int!, $input: Page2Input!) {
    updatePage2(id: $id, input: $input) {
      id
      page1_id
      male_count
      female_count
      total_count
      male_leader_count
      female_leader_count
      total_leader_count
      is_mou
      org_nature
      part_type
      age_type
      part_form
      service_type
      infant_count
      elementary_count
      middle_count
      high_count
      adult_count
      elderly_count
      age_group_total
    }
  }
`;

export const DELETE_PAGE2 = gql`
  mutation DeletePage2($id: Int!) {
    deletePage2(id: $id)
  }
`;

// Page1 Mutations
export const CREATE_PAGE1 = gql`
  mutation CreatePage1($input: Page1Input!) {
    createPage1(input: $input) {
      id
      reservation_status
      start_date
      end_date
      group_name
      customer_name
      total_count
      email
      mobile_phone
      landline_phone
      notes
      operation_manager
      reservation_manager
      business_category
      business_subcategory
      business_detail_category
      region
      is_mine_area
      create_user
      update_user
    }
  }
`;

export const UPDATE_PAGE1 = gql`
  mutation UpdatePage1($id: Int!, $input: Page1Input!) {
    updatePage1(id: $id, input: $input) {
      id
      reservation_status
      start_date
      end_date
      group_name
      customer_name
      total_count
      email
      mobile_phone
      landline_phone
      notes
      operation_manager
      reservation_manager
      create_user
      update_user
    }
  }
`;

export const CREATE_PAGE2_PROGRAM = gql`
  mutation CreatePage2Program($input: Page2ProgramInput!) {
    createPage2Program(input: $input) {
      id
      reservation_id
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
      participants
      is_multi
      multi1_name
      multi2_name
    }
  }
`;

export const UPDATE_PAGE2_PROGRAM = gql`
  mutation UpdatePage2Program($id: Int!, $input: Page2ProgramInput!) {
    updatePage2Program(id: $id, input: $input) {
      id
      reservation_id
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
      participants
      is_multi
      multi1_name
      multi2_name
    }
  }
`;

export const DELETE_PAGE2_PROGRAM = gql`
  mutation DeletePage2Program($id: Int!) {
    deletePage2Program(id: $id)
  }
`;

// 전체 예약에 걸친 프로그램 조회 쿼리
export const GET_ALL_PROGRAMS = gql`
  query GetAllPrograms {
    getAllPrograms {
      id
      date
      start_time
      end_time
      place
      place_name
      reservation {
        id
        page1 {
          id
          group_name
        }
      }
    }
  }
`; 