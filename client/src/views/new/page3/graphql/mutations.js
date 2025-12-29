import { gql } from '@apollo/client';

export const CREATE_OR_UPDATE_PAGE3 = gql`
  mutation CreateOrUpdatePage3($input: Page3Input!) {
    createOrUpdatePage3(input: $input) {
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
    }
  }
`;

export const CREATE_PARTICIPANT_ROOM = gql`
  mutation CreateParticipantRoom($input: ParticipantRoomInput!) {
    createParticipantRoom(input: $input) {
      id
      page1_id
      room_type
      count
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PARTICIPANT_ROOM = gql`
  mutation UpdateParticipantRoom($id: ID!, $input: ParticipantRoomInput!) {
    updateParticipantRoom(id: $id, input: $input) {
      id
      page1_id
      room_type
      count
      created_at
      updated_at
    }
  }
`;

export const DELETE_PARTICIPANT_ROOM = gql`
  mutation DeleteParticipantRoom($id: ID!) {
    deleteParticipantRoom(id: $id)
  }
`;

export const CREATE_PARTICIPANT_MEAL = gql`
  mutation CreateParticipantMeal($input: ParticipantMealInput!) {
    createParticipantMeal(input: $input) {
      id
      page1_id
      meal_type
      count
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PARTICIPANT_MEAL = gql`
  mutation UpdateParticipantMeal($id: ID!, $input: ParticipantMealInput!) {
    updateParticipantMeal(id: $id, input: $input) {
      id
      page1_id
      meal_type
      count
      created_at
      updated_at
    }
  }
`;

export const DELETE_PARTICIPANT_MEAL = gql`
  mutation DeleteParticipantMeal($id: ID!) {
    deleteParticipantMeal(id: $id)
  }
`;

export const DELETE_PAGE3 = gql`
  mutation DeletePage3($id: ID!) {
    deletePage3(id: $id)
  }
`;

export const DELETE_PAGE3_BY_PAGE1_ID = gql`
  mutation DeletePage3ByPage1Id($page1Id: ID!) {
    deletePage3ByPage1Id(page1Id: $page1Id)
  }
`;

// Room Management mutations
export const CREATE_ROOM_MANAGE = gql`
  mutation CreateRoomManage($input: RoomManageInput!) {
    createRoomManage(input: $input) {
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

export const UPDATE_ROOM_MANAGE = gql`
  mutation UpdateRoomManage($id: ID!, $input: RoomManageInput!) {
    updateRoomManage(id: $id, input: $input) {
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

export const DELETE_ROOM_MANAGE = gql`
  mutation DeleteRoomManage($id: ID!) {
    deleteRoomManage(id: $id)
  }
`; 