import { gql } from '@apollo/client';

export const GET_PAGE3_LIST = gql`
  query GetPage3List {
    getPage3List {
      id
      page1_id
      reservation_status
      start_date
      end_date
      company_name
      contact_person
      participants_count
      email
      phone
      page1 {
        id
        group_name
        customer_name
        total_count
      }
    }
  }
`;

export const GET_PAGE3_BY_PAGE1_ID = gql`
  query GetPage3ByPage1Id($page1Id: ID!) {
    getPage3ByPage1Id(page1Id: $page1Id) {
      id
      page1_id
      reservation_status
      start_date
      end_date
      company_name
      department
      contact_person
      position
      participants_count
      room_count
      email
      phone
      purpose
      catering_required
      special_requirements
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
    getPage1ById(id: $page1Id) {
      id
      group_name
      customer_name
      reservation_status
      start_date
      end_date
      total_count
      email
      mobile_phone
      landline_phone
      notes
    }
  }
`;

export const GET_ROOMS = gql`
  query GetRooms {
    getRooms {
      id
      name
      room_type
      capacity
      price_per_night
      description
      is_active
    }
  }
`;

export const GET_PLACES = gql`
  query GetPlaces {
    getPlaces {
      id
      name
      capacity
      price_per_hour
      description
      is_active
    }
  }
`;

export const GET_MEAL_OPTIONS = gql`
  query GetMealOptions {
    getMealOptions {
      id
      meal_type
      meal_option
      price_per_person
      ingredient_cost
      description
      is_active
    }
  }
`;

// New query to check room availability by date range
export const GET_AVAILABLE_ROOMS_BY_DATE = gql`
  query GetAvailableRoomsByDate($startDate: String!, $endDate: String!, $excludePage1Id: Int) {
    getAvailableRoomsByDate(startDate: $startDate, endDate: $endDate, excludePage1Id: $excludePage1Id) {
      id
      room_name
      room_type
      capacity
      price
      description
      is_available
      floor
      reservations {
        id
        check_in_date
        check_out_date
        page1_id
        next_available_date
        group_name
      }
    }
  }
`;

export const GET_PARTICIPANT_ROOMS = gql`
  query GetParticipantRooms($page1Id: Int!) {
    getParticipantRooms(page1Id: $page1Id) {
      id
      page1_id
      room_type
      count
      created_at
      updated_at
    }
  }
`;

export const GET_PARTICIPANT_MEALS = gql`
  query GetParticipantMeals($page1Id: Int!) {
    getParticipantMeals(page1Id: $page1Id) {
      id
      page1_id
      meal_type
      count
      created_at
      updated_at
    }
  }
`;

// Queries for RoomManage
export const GET_ROOM_MANAGE_BY_PAGE1_ID = gql`
  query GetRoomManageByPage1Id($page1Id: Int!) {
    getRoomManageByPage1Id(page1Id: $page1Id) {
      id
      page1_id
      room_id
      check_in_date
      check_out_date
      organization_name
      status
      occupancy
      price
      total_price
      capacity
      nights
      notes
      created_at
      updated_at
    }
  }
`;

export const GET_ROOM_MANAGE_BY_ROOM_ID = gql`
  query GetRoomManageByRoomId($roomId: Int!) {
    getRoomManageByRoomId(roomId: $roomId) {
      id
      page1_id
      room_id
      check_in_date
      check_out_date
      organization_name
      status
      occupancy
      price
      total_price
      capacity
      nights
      notes
      created_at
      updated_at
    }
  }
`;

export const GET_ROOM_MANAGE_BY_DATE_RANGE = gql`
  query GetRoomManageByDateRange($startDate: String!, $endDate: String!) {
    getRoomManageByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      page1_id
      room_id
      check_in_date
      check_out_date
      organization_name
      status
      occupancy
      price
      total_price
      capacity
      nights
      notes
      created_at
      updated_at
    }
  }
`;

export const GET_ROOM_AVAILABILITY_STATUS = gql`
  query GetRoomAvailabilityStatus($roomId: Int!, $startDate: String!, $endDate: String!) {
    getRoomAvailabilityStatus(roomId: $roomId, startDate: $startDate, endDate: $endDate)
  }
`; 