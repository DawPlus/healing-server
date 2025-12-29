import { gql } from '@apollo/client';

// Fragments
export const USER_TEMP_FIELDS = gql`
  fragment UserTempFields on UserTemp {
    id
    seq
    name
    sex
    age
    residence
    job
    idx
    agency
    openday
    created_at
    updated_at
  }
`;

export const USER_TEMP_AGENCY_FIELDS = gql`
  fragment UserTempAgencyFields on UserTempAgency {
    id
    agency
    openday
    created_at
    updated_at
  }
`;

// Queries
export const GET_USER_TEMP = gql`
  query GetUserTemp($agency: String!, $openday: String!) {
    getUserTemp(agency: $agency, openday: $openday) {
      ...UserTempFields
    }
  }
  ${USER_TEMP_FIELDS}
`;

export const GET_USER_TEMP_AGENCIES = gql`
  query GetUserTempAgencies {
    getUserTempAgencies {
      ...UserTempAgencyFields
    }
  }
  ${USER_TEMP_AGENCY_FIELDS}
`;

export const GET_ORGANIZATION_LIST = gql`
  query GetOrganizationList {
    getPage1List {
      id
      group_name
      start_date
      end_date
    }
  }
`;

// Mutations
export const CREATE_USER_TEMP = gql`
  mutation CreateUserTemp($input: [UserTempInput!]!) {
    createUserTemp(input: $input) {
      success
      message
    }
  }
`;

export const UPDATE_USER_TEMP = gql`
  mutation UpdateUserTemp($id: Int!, $input: UserTempInput!) {
    updateUserTemp(id: $id, input: $input) {
      success
      message
    }
  }
`;

export const DELETE_USER_TEMP = gql`
  mutation DeleteUserTemp($agency: String!, $openday: String!) {
    deleteUserTemp(agency: $agency, openday: $openday) {
      success
      message
    }
  }
`; 