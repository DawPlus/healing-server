import { gql } from '@apollo/client';

export const GET_PAGE1_LIST = gql`
  query GetPage1List {
    getPage1List {
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
      business_category
      business_subcategory
      business_detail_category
      reservation_manager
      operation_manager
      region
      is_mine_area
      create_dtm
      create_user
      update_dtm
      update_user
    }
  }
`;

export const GET_PAGE1_BY_ID = gql`
  query GetPage1ById($id: Int!) {
    getPage1ById(id: $id) {
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
      business_category
      business_subcategory
      business_detail_category
      reservation_manager
      operation_manager
      region
      is_mine_area
      create_dtm
      create_user
      update_dtm
      update_user
      page3 {
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
        create_dtm
        create_user
        update_dtm
        update_user
      }
    }
  }
`; 