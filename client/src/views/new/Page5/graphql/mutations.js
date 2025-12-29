import { gql } from '@apollo/client';

// Mutation to create a new Page5 document
export const CREATE_PAGE5_DOCUMENT = gql`
  mutation CreatePage5Document($input: Page5DocumentInput!) {
    createPage5Document(input: $input) {
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

// Mutation to update an existing Page5 document
export const UPDATE_PAGE5_DOCUMENT = gql`
  mutation UpdatePage5Document($id: Int!, $input: Page5DocumentInput!) {
    updatePage5Document(id: $id, input: $input) {
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

// Mutation to delete a Page5 document
export const DELETE_PAGE5_DOCUMENT = gql`
  mutation DeletePage5Document($id: Int!) {
    deletePage5Document(id: $id) {
      id
      success
    }
  }
`; 