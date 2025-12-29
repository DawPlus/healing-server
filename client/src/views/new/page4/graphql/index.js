import { gql } from '@apollo/client';

// Queries
export const GET_PAGE4_LIST = gql`
  query GetPage4List {
    getPage4List {
      id
      project_name
      created_by
      page1_id
      material_total
      etc_expense_total
      total_budget
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
      }
      materials {
        id
        expense_id
        material_type
        name
        amount
        quantity
        total
        note
      }
      expenses {
        id
        expense_id
        name
        amount
        expense_type
        quantity
        price
        note
      }
    }
  }
`;

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
      page4 {
        id
        project_name
        material_total
        etc_expense_total
        total_budget
      }
    }
  }
`;

export const GET_PAGE4_BY_ID = gql`
  query GetPage4ById($id: Int!) {
    getPage4ById(id: $id) {
      id
      project_name
      created_by
      page1_id
      material_total
      etc_expense_total
      total_budget
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
      }
      materials {
        id
        expense_id
        material_type
        name
        amount
        actual_amount
        quantity
        total
        note
      }
      expenses {
        id
        expense_id
        name
        amount
        actual_price
        actual_amount
        expense_type
        quantity
        price
        note
      }
    }
  }
`;

export const GET_PAGE4_BY_PAGE1_ID = gql`
  query GetPage4ByPage1Id($page1Id: Int!) {
    getPage4ByPage1Id(page1Id: $page1Id) {
      id
      project_name
      created_by
      page1_id
      material_total
      etc_expense_total
      total_budget
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
      }
      materials {
        id
        expense_id
        material_type
        name
        amount
        actual_amount
        quantity
        total
        note
      }
      expenses {
        id
        expense_id
        name
        amount
        actual_price
        actual_amount
        expense_type
        quantity
        price
        note
      }
    }
  }
`;

export const GET_PAGE4_MATERIALS = gql`
  query GetPage4Materials($expenseId: Int!) {
    getPage4Materials(expenseId: $expenseId) {
      id
      expense_id
      material_type
      name
      amount
      actual_amount
      quantity
      total
      note
      created_at
      updated_at
    }
  }
`;

export const GET_PAGE4_EXPENSES = gql`
  query GetPage4Expenses($expenseId: Int!) {
    getPage4Expenses(expenseId: $expenseId) {
      id
      expense_id
      name
      amount
      actual_price
      actual_amount
      expense_type
      quantity
      price
      note
      created_at
      updated_at
    }
  }
`;

// Mutations
export const CREATE_PAGE4 = gql`
  mutation CreatePage4($input: Page4Input!) {
    createPage4(input: $input) {
      id
      project_name
      created_by
      page1_id
      material_total
      etc_expense_total
      total_budget
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PAGE4 = gql`
  mutation UpdatePage4($id: Int!, $input: Page4Input!) {
    updatePage4(id: $id, input: $input) {
      id
      project_name
      created_by
      page1_id
      material_total
      etc_expense_total
      total_budget
      created_at
      updated_at
    }
  }
`;

export const DELETE_PAGE4 = gql`
  mutation DeletePage4($id: Int!) {
    deletePage4(id: $id)
  }
`;

export const CREATE_PAGE4_MATERIAL = gql`
  mutation CreatePage4Material($input: Page4MaterialInput!) {
    createPage4Material(input: $input) {
      id
      expense_id
      material_type
      name
      amount
      actual_amount
      quantity
      total
      note
    }
  }
`;

export const UPDATE_PAGE4_MATERIAL = gql`
  mutation UpdatePage4Material($id: Int!, $input: Page4MaterialInput!) {
    updatePage4Material(id: $id, input: $input) {
      id
      expense_id
      material_type
      name
      amount
      actual_amount
      quantity
      total
      note
    }
  }
`;

export const DELETE_PAGE4_MATERIAL = gql`
  mutation DeletePage4Material($id: Int!) {
    deletePage4Material(id: $id)
  }
`;

export const CREATE_PAGE4_EXPENSE = gql`
  mutation CreatePage4Expense($input: Page4ExpenseInput!) {
    createPage4Expense(input: $input) {
      id
      expense_id
      name
      amount
      actual_price
      actual_amount
      expense_type
      quantity
      price
      note
    }
  }
`;

export const UPDATE_PAGE4_EXPENSE = gql`
  mutation UpdatePage4Expense($id: Int!, $input: Page4ExpenseInput!) {
    updatePage4Expense(id: $id, input: $input) {
      id
      expense_id
      name
      amount
      actual_price
      actual_amount
      expense_type
      quantity
      price
      note
    }
  }
`;

export const DELETE_PAGE4_EXPENSE = gql`
  mutation DeletePage4Expense($id: Int!) {
    deletePage4Expense(id: $id)
  }
`; 