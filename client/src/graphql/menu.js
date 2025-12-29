import { gql } from '@apollo/client';

// Query to get reservations (page1 list)
export const GET_RESERVATIONS = gql`
  query GetReservations {
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
      notes
    }
  }
`;

// Query to get program categories
export const GET_PROGRAM_CATEGORIES = gql`
  query ProgramCategories {
    programCategories {
      id
      category_name
      description
      display_order
      created_at
      updated_at
    }
  }
`;

// Query to get programs by category
export const GET_PROGRAMS_BY_CATEGORY = gql`
  query GetProgramsByCategory($categoryId: Int!) {
    getProgramsByCategory(categoryId: $categoryId) {
      id
      program_name
      category_id
      description
      display_order
      created_at
      updated_at
    }
  }
`;

// Query to get instructors
export const GET_INSTRUCTORS = gql`
  query Instructors {
    instructors {
      id
      name
      specialty
      phone
      email
      description
      created_at
      updated_at
    }
  }
`;

// Query to get locations
export const GET_LOCATIONS = gql`
  query Locations {
    locations {
      id
      location_name
      category_id
      description
      created_at
      updated_at
    }
  }
`; 