import { gql } from '@apollo/client';

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

export const DELETE_PAGE1 = gql`
  mutation DeletePage1($id: Int!) {
    deletePage1(id: $id)
  }
`; 