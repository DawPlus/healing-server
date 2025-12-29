const { gql } = require('apollo-server-express');

const page2TypeDefs = gql`
  type Page2 {
    id: Int!
    page1_id: Int!
    page1: Page1
    male_count: Int
    female_count: Int
    total_count: Int
    male_leader_count: Int
    female_leader_count: Int
    total_leader_count: Int
    is_mou: Boolean
    org_nature: String
    part_type: String
    age_type: String
    part_form: String
    service_type: String
    infant_count: Int
    elementary_count: Int
    middle_count: Int
    high_count: Int
    adult_count: Int
    elderly_count: Int
    age_group_total: Int
    created_at: DateTime!
    updated_at: DateTime!
    programs: [Page2Program]
  }

  type Page2Program {
    id: Int!
    reservation_id: Int!
    reservation: Page2
    category: String
    category_name: String
    program: String
    program_name: String
    date: DateTime
    start_time: String
    end_time: String
    duration: String
    place: String
    place_name: String
    instructor: String
    instructor_name: String
    assistant: String
    assistant_name: String
    helper: String
    helper_name: String
    notes: String
    price: Int
    price_per_person: Int
    participants: Int
    is_multi: Boolean
    multi1_name: String
    multi2_name: String
    created_at: DateTime!
    updated_at: DateTime!
  }

  input Page2Input {
    page1_id: Int!
    male_count: Int
    female_count: Int
    total_count: Int
    male_leader_count: Int
    female_leader_count: Int
    total_leader_count: Int
    is_mou: Boolean
    org_nature: String
    part_type: String
    age_type: String
    part_form: String
    service_type: String
    infant_count: Int
    elementary_count: Int
    middle_count: Int
    high_count: Int
    adult_count: Int
    elderly_count: Int
    age_group_total: Int
  }

  input Page2ProgramInput {
    reservation_id: Int!
    category: String
    category_name: String
    program: String
    program_name: String
    date: DateTime
    start_time: String
    end_time: String
    duration: String
    place: String
    place_name: String
    instructor: String
    instructor_name: String
    assistant: String
    assistant_name: String
    helper: String
    helper_name: String
    notes: String
    price: Int
    price_per_person: Int
    participants: Int
    is_multi: Boolean
    multi1_name: String
    multi2_name: String
  }

  type Query {
    # Page2 queries
    getPage2List: [Page2!]!
    getPage2ById(id: Int!): Page2
    getPage2ByPage1Id(page1Id: Int!): Page2
    getPage2Programs(reservationId: Int!): [Page2Program!]!
    getAllPrograms: [Page2Program!]!
  }

  type Mutation {
    # Page2 mutations
    createPage2(input: Page2Input!): Page2!
    updatePage2(id: Int!, input: Page2Input!): Page2!
    deletePage2(id: Int!): Boolean!
    createPage2Program(input: Page2ProgramInput!): Page2Program!
    updatePage2Program(id: Int!, input: Page2ProgramInput!): Page2Program!
    deletePage2Program(id: Int!): Boolean!
  }
`;

module.exports = page2TypeDefs; 