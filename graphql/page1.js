const { gql } = require('apollo-server-express');

const page1TypeDefs = gql`
  type Page1 {
    id: Int!
    reservation_status: String!
    start_date: DateTime
    end_date: DateTime
    group_name: String
    customer_name: String
    total_count: Int
    email: String
    mobile_phone: String
    landline_phone: String
    notes: String
    reservation_manager: String
    operation_manager: String
    business_category: String
    business_subcategory: String
    business_detail_category: String
    region: String
    is_mine_area: Boolean
    create_dtm: DateTime!
    create_user: String!
    update_dtm: DateTime!
    update_user: String!
    page2: Page2
    page2_reservations: [Page2]
    page3: Page3
    page4: Page4
    page4_expenses: [Page4]
    page5_documents: [Page5Document]
  }
  
  input Page1Input {
    id: Int
    reservation_status: String!
    start_date: DateTime
    end_date: DateTime
    group_name: String
    customer_name: String
    total_count: Int
    email: String
    mobile_phone: String
    landline_phone: String
    notes: String
    reservation_manager: String
    operation_manager: String
    business_category: String
    business_subcategory: String
    business_detail_category: String
    region: String
    is_mine_area: Boolean
    create_user: String!
    update_user: String!
  }

  type Reservation {
    id: Int!
    reservation_status: String!
    business_category: String!
    business_subcategory: String
    business_detail_category: String
    start_date: DateTime!
    end_date: DateTime!
    group_name: String!
    customer_name: String!
    landline_phone: String
    mobile_phone: String
    email: String!
    reservation_manager: String
    operation_manager: String
    notes: String
    created_at: DateTime!
    updated_at: DateTime!
  }

  input ReservationInput {
    id: Int
    reservation_status: String!
    business_category: String!
    business_subcategory: String
    business_detail_category: String
    start_date: DateTime!
    end_date: DateTime!
    group_name: String!
    customer_name: String!
    landline_phone: String
    mobile_phone: String
    email: String!
    reservation_manager: String
    operation_manager: String
    notes: String
  }

  type Query {
    getPage1List: [Page1!]!
    getPage1ById(id: Int!): Page1
    loginCheck: AuthResponse!
    
    # UserTemp queries
    getUserTemp(agency: String!, openday: String!): [UserTemp]
    getUserTempAgencies: [UserTempAgency]
    
    # New reservation queries
    getReservationList: [Reservation!]!
    getReservationById(id: Int!): Reservation
  }

  type Mutation {
    createPage1(input: Page1Input!): Page1!
    updatePage1(id: Int!, input: Page1Input!): Page1!
    deletePage1(id: Int!): Boolean!
    
    # UserTemp mutations
    createUserTemp(input: [UserTempInput!]!): UserTempResponse
    updateUserTemp(id: Int!, input: UserTempInput!): UserTempResponse
    deleteUserTemp(agency: String!, openday: String!): UserTempResponse
    
    login(input: LoginInput!): AuthResponse!
    register(input: RegisterInput!): AuthResponse!
    logout: AuthResponse!
    
    # New reservation mutations
    createReservation(input: ReservationInput!): Reservation!
    updateReservation(input: ReservationInput!): Reservation!
    deleteReservation(id: Int!): Boolean!
  }
`;

module.exports = page1TypeDefs; 