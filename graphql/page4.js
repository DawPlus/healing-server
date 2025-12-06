const { gql } = require('apollo-server-express');

const page4TypeDefs = gql`
  type Page4 {
    id: Int!
    project_name: String!
    created_by: String
    page1_id: Int
    page1: Page1
    material_total: Int
    etc_expense_total: Int
    total_budget: Int
    created_at: DateTime!
    updated_at: DateTime!
    materials: [Page4Material]
    expenses: [Page4Expense]
  }

  type Page4Material {
    id: Int!
    expense_id: Int!
    expense: Page4
    material_type: String!
    name: String
    amount: Int!
    quantity: Int!
    total: Int!
    note: String
    created_at: DateTime!
    updated_at: DateTime!
  }

  type Page4Expense {
    id: Int!
    expense_id: Int!
    expense: Page4
    name: String!
    amount: Int!
    expense_type: String
    quantity: String
    price: String
    note: String
    created_at: DateTime!
    updated_at: DateTime!
  }

  input Page4Input {
    project_name: String!
    created_by: String
    page1_id: Int
    material_total: Int
    etc_expense_total: Int
    total_budget: Int
  }

  input Page4MaterialInput {
    expense_id: Int!
    material_type: String!
    name: String
    amount: Int!
    quantity: Int!
    total: Int!
    note: String
  }

  input Page4ExpenseInput {
    expense_id: Int!
    name: String!
    amount: Int!
    expense_type: String
    quantity: String
    price: String
    note: String
  }

  type Query {
    # Page4 queries
    getPage4List: [Page4!]!
    getPage4ById(id: Int!): Page4
    getPage4ByPage1Id(page1Id: Int!): Page4
    getPage4Materials(expenseId: Int!): [Page4Material!]!
    getPage4Expenses(expenseId: Int!): [Page4Expense!]!
  }

  type Mutation {
    # Page4 mutations
    createPage4(input: Page4Input!): Page4!
    updatePage4(id: Int!, input: Page4Input!): Page4!
    deletePage4(id: Int!): Boolean!
    createPage4Material(input: Page4MaterialInput!): Page4Material!
    updatePage4Material(id: Int!, input: Page4MaterialInput!): Page4Material!
    deletePage4Material(id: Int!): Boolean!
    createPage4Expense(input: Page4ExpenseInput!): Page4Expense!
    updatePage4Expense(id: Int!, input: Page4ExpenseInput!): Page4Expense!
    deletePage4Expense(id: Int!): Boolean!
  }
`;

module.exports = page4TypeDefs; 