import { gql } from '@apollo/client';

// 프로그램 일정표 저장
export const SAVE_PROGRAM_SCHEDULE = gql`
  mutation SaveProgramSchedule($programSchedule: ProgramScheduleInput!) {
    saveProgramSchedule(programSchedule: $programSchedule) {
      success
      message
      id
    }
  }
`;

// 객실 배정 저장
export const SAVE_ROOM_ASSIGNMENT = gql`
  mutation SaveRoomAssignment($roomAssignment: RoomAssignmentInput!) {
    saveRoomAssignment(roomAssignment: $roomAssignment) {
      success
      message
      id
    }
  }
`;

// 객실 배정 삭제
export const DELETE_ROOM_ASSIGNMENT = gql`
  mutation DeleteRoomAssignment($id: ID!) {
    deleteRoomAssignment(id: $id) {
      success
      message
    }
  }
`;

// 다수의 객실 배정 저장
export const BULK_SAVE_ROOM_ASSIGNMENTS = gql`
  mutation BulkSaveRoomAssignments($assignments: [RoomAssignmentInput!]!) {
    bulkSaveRoomAssignments(assignments: $assignments) {
      success
      message
      count
    }
  }
`; 