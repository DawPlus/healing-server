const { gql } = require('apollo-server-express');

const pageFinalTypeDefs = gql`
  type PageFinal {
    id: Int!
    page1_id: Int!
    page1: Page1
    teacher_expenses: [TeacherExpense!]
    participant_expenses: [ParticipantExpense!]
    income_items: [IncomeItem!]
    discount_rate: Float
    discount_notes: String
    complaint: String
    created_at: DateTime!
    updated_at: DateTime!
  }
  
  type TeacherExpense {
    id: Int!
    page_final_id: Int!
    category: String!
    amount: Int!
    details: String
    notes: String
    is_planned: Boolean!
    created_at: DateTime!
    updated_at: DateTime!
  }
  
  type ParticipantExpense {
    id: Int!
    page_final_id: Int!
    category: String!
    amount: Int!
    details: String
    notes: String
    is_planned: Boolean!
    created_at: DateTime!
    updated_at: DateTime!
  }
  
  type IncomeItem {
    id: Int!
    page_final_id: Int!
    category: String!
    amount: Int!
    details: String
    notes: String
    created_at: DateTime!
    updated_at: DateTime!
  }
  
  input PageFinalInput {
    page1_id: Int!
    complaint: String
    discount_rate: Float
    discount_notes: String
  }
  
  input ExpenseItemInput {
    category: String!
    amount: Int!
    details: String
    notes: String
    is_planned: Boolean
  }
  
  input IncomeItemInput {
    category: String!
    amount: Int!
    details: String
    notes: String
  }

  extend type Query {
    getPageFinalList: [PageFinal!]!
    getPageFinalById(id: Int!): PageFinal
    getPageFinalByPage1Id(page1_id: Int!): PageFinal
  }

  extend type Mutation {
    createPageFinal(input: PageFinalInput!): PageFinal!
    updatePageFinal(id: Int!, input: PageFinalInput!): PageFinal!
    upsertPageFinal(input: PageFinalInput!): PageFinal!
    deletePageFinal(id: Int!): Boolean!
    
    # Teacher expense mutations
    addTeacherExpense(pageFinalId: Int!, input: ExpenseItemInput!): TeacherExpense!
    updateTeacherExpense(id: Int!, input: ExpenseItemInput!): TeacherExpense!
    deleteTeacherExpense(id: Int!): Boolean!
    
    # Participant expense mutations
    addParticipantExpense(pageFinalId: Int!, input: ExpenseItemInput!): ParticipantExpense!
    updateParticipantExpense(id: Int!, input: ExpenseItemInput!): ParticipantExpense!
    deleteParticipantExpense(id: Int!): Boolean!
    
    # Income item mutations
    addIncomeItem(pageFinalId: Int!, input: IncomeItemInput!): IncomeItem!
    updateIncomeItem(id: Int!, input: IncomeItemInput!): IncomeItem!
    deleteIncomeItem(id: Int!): Boolean!
    
    # Discount info update
    updateDiscountInfo(pageFinalId: Int!, rate: Float, notes: String): PageFinal!
  }
`;

module.exports = pageFinalTypeDefs; 