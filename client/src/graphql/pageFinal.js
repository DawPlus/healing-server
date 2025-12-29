import { gql } from '@apollo/client';

// Query to get all PageFinal records
export const GET_PAGE_FINAL_LIST = gql`
  query GetPageFinalList {
    getPageFinalList {
      id
      page1_id
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
      discount_rate
      discount_notes
      complaint
      created_at
      updated_at
      page1 {
        id
        group_name
        customer_name
        reservation_status
        start_date
        end_date
      }
    }
  }
`;

// Query to get a specific PageFinal record by ID
export const GET_PAGE_FINAL_BY_ID = gql`
  query GetPageFinalById($id: Int!) {
    getPageFinalById(id: $id) {
      id
      page1_id
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
      discount_rate
      discount_notes
      complaint
      created_at
      updated_at
    }
  }
`;

// Query to get a PageFinal record by Page1 ID
export const GET_PAGE_FINAL_BY_PAGE1_ID = gql`
  query GetPageFinalByPage1Id($page1_id: Int!) {
    getPageFinalByPage1Id(page1_id: $page1_id) {
      id
      page1_id
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
      discount_rate
      discount_notes
      complaint
      created_at
      updated_at
    }
  }
`;

// Query to get Page1 data with business_category
export const GET_PAGE1_DETAILS = gql`
  query GetPage1Details($id: Int!) {
    getPage1ById(id: $id) {
      id
      business_category
      business_subcategory
      group_name
      customer_name
      reservation_status
      start_date
      end_date
    }
  }
`;

// Query to get all instructors for payment rate lookup
export const GET_INSTRUCTORS_FOR_PAYMENT = gql`
  query GetInstructorsForPayment {
    instructors {
      id
      name
      payment_rate
    }
  }
`;

// Mutation to create a new PageFinal record
export const CREATE_PAGE_FINAL = gql`
  mutation CreatePageFinal($input: PageFinalInput!) {
    createPageFinal(input: $input) {
      id
      page1_id
    }
  }
`;

// Mutation to update an existing PageFinal record
export const UPDATE_PAGE_FINAL = gql`
  mutation UpdatePageFinal($id: Int!, $input: PageFinalInput!) {
    updatePageFinal(id: $id, input: $input) {
      id
      page1_id
    }
  }
`;

// Mutation to upsert (create or update) a PageFinal record
export const UPSERT_PAGE_FINAL = gql`
  mutation UpsertPageFinal($input: PageFinalInput!) {
    upsertPageFinal(input: $input) {
      id
      page1_id
    }
  }
`;

// Mutations for expense items
export const ADD_TEACHER_EXPENSE = gql`
  mutation AddTeacherExpense($pageFinalId: Int!, $input: ExpenseItemInput!) {
    addTeacherExpense(pageFinalId: $pageFinalId, input: $input) {
      id
      category
      amount
      details
      notes
      is_planned
      discount_rate
    }
  }
`;

export const UPDATE_TEACHER_EXPENSE = gql`
  mutation UpdateTeacherExpense($id: Int!, $input: ExpenseItemInput!) {
    updateTeacherExpense(id: $id, input: $input) {
      id
      category
      amount
      details
      notes
      is_planned
      discount_rate
    }
  }
`;

export const DELETE_TEACHER_EXPENSE = gql`
  mutation DeleteTeacherExpense($id: Int!) {
    deleteTeacherExpense(id: $id)
  }
`;

export const ADD_PARTICIPANT_EXPENSE = gql`
  mutation AddParticipantExpense($pageFinalId: Int!, $input: ExpenseItemInput!) {
    addParticipantExpense(pageFinalId: $pageFinalId, input: $input) {
      id
      category
      amount
      details
      notes
      is_planned
      discount_rate
    }
  }
`;

export const UPDATE_PARTICIPANT_EXPENSE = gql`
  mutation UpdateParticipantExpense($id: Int!, $input: ExpenseItemInput!) {
    updateParticipantExpense(id: $id, input: $input) {
      id
      category
      amount
      details
      notes
      is_planned
      discount_rate
    }
  }
`;

export const DELETE_PARTICIPANT_EXPENSE = gql`
  mutation DeleteParticipantExpense($id: Int!) {
    deleteParticipantExpense(id: $id)
  }
`;

// Mutations for income items
export const ADD_INCOME_ITEM = gql`
  mutation AddIncomeItem($pageFinalId: Int!, $input: IncomeItemInput!) {
    addIncomeItem(pageFinalId: $pageFinalId, input: $input) {
      id
      category
      amount
      details
      notes
      discount_rate
    }
  }
`;

export const UPDATE_INCOME_ITEM = gql`
  mutation UpdateIncomeItem($id: Int!, $input: IncomeItemInput!) {
    updateIncomeItem(id: $id, input: $input) {
      id
      category
      amount
      details
      notes
      discount_rate
    }
  }
`;

export const DELETE_INCOME_ITEM = gql`
  mutation DeleteIncomeItem($id: Int!) {
    deleteIncomeItem(id: $id)
  }
`;

// Mutation to update discount info
export const UPDATE_DISCOUNT_INFO = gql`
  mutation UpdateDiscountInfo($pageFinalId: Int!, $discountRate: Int!, $discountNotes: String) {
    updateDiscountInfo(pageFinalId: $pageFinalId, discountRate: $discountRate, discountNotes: $discountNotes) {
      id
      discount_rate
      discount_notes
    }
  }
`;

// Mutation to delete a PageFinal record
export const DELETE_PAGE_FINAL = gql`
  mutation DeletePageFinal($id: Int!) {
    deletePageFinal(id: $id)
  }
`;

// 페이지2 프로그램 데이터 불러오기 쿼리
export const GET_INSTRUCTOR_DATA_FOR_IMPORT = gql`
  query GetInstructorDataForImport($page1Id: Int!) {
    getPage2ByPage1Id(page1Id: $page1Id) {
      id
      page1 {
        id
        group_name
        business_category
        business_subcategory
        business_detail_category
      }
      programs {
        id
        instructor
        instructor_name
        price
        category
        program_name
        start_time
        duration
        place
        participants
      }
    }
  }
`;

// 페이지3 객실 데이터 불러오기 쿼리
export const GET_ROOM_DATA_FOR_IMPORT = gql`
  query GetRoomDataForImport($page1Id: Int!) {
    getPage3ByPage1Id(page1Id: $page1Id) {
      id
      room_selections {
        id
        room_name
        room_type
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
        price
        notes
      }
    }
  }
`;

// 페이지4 비용 데이터 불러오기 쿼리
export const GET_EXPENSE_DATA_FOR_IMPORT = gql`
  query GetExpenseDataForImport($page1Id: Int!) {
    getPage4ByPage1Id(page1Id: $page1Id) {
      id
      materials {
        id
        material_type
        name
        total
        note
      }
      expenses {
        id
        name
        expense_type
        amount
        note
      }
    }
  }
`;