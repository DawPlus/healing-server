const { gql } = require('apollo-server-express');
const { mergeTypeDefs } = require('@graphql-tools/merge');

// Import all the separate schema files
const commonTypeDefs = require('./common');
const page1TypeDefs = require('./page1');
const page2TypeDefs = require('./page2');
const page3TypeDefs = require('./page3');
const page4TypeDefs = require('./page4');
const page5TypeDefs = require('./page5');
const page6TypeDefs = require('./page6');
const pageFinalTypeDefs = require('./pageFinal');
const excelTypeDefs = require('./excelProgramList');
const serviceFormsTypeDefs = require('./serviceForms');
const yearMonthResultTypeDefs = require('./yearMonthResult');
const searchProgramResultTypeDefs = require('./searchProgramResult');
const searchResultTypeDefs = require('./searchResult');
const agencyListTypeDefs = require('./agencyList');
const userActivityTypeDefs = require('./userActivity');
const effectivenessTypeDefs = require('./effectiveness');

// Menu System queries and mutations
const menuSystemOperations = gql`
  type Query {
    # Program List Queries
    getProgramList(openDay: String, endDay: String): [ProgramListItem!]!
    getProgramDetail(seq: Int!, agency: String!, openday: String!): ProgramDetailResponse!

    # Program Categories Queries
    getProgramCategories: [ProgramCategory!]!
    getProgramCategoryById(id: Int!): ProgramCategory

    # Program Items Queries
    getProgramItems: [ProgramItem!]!
    getProgramItemsByCategoryId(categoryId: Int!): [ProgramItem!]!
    getProgramItemById(id: Int!): ProgramItem
    getProgramsByCategory(categoryId: Int!): [ProgramItem!]!

    # Location Categories Queries
    getLocationCategories: [LocationCategory!]!
    getLocationCategoryById(id: Int!): LocationCategory

    # Locations Queries
    getLocations: [Location!]!
    getLocationsByCategoryId(categoryId: Int!): [Location!]!
    getLocationById(id: Int!): Location

    # Instructor Queries
    getInstructors: [Instructor!]!
    getInstructorById(id: Int!): Instructor

    # Assistant Instructor Queries
    getAssistantInstructors: [AssistantInstructor!]!
    getAssistantInstructorById(id: Int!): AssistantInstructor

    # Helper Queries
    getHelpers: [Helper!]!
    getHelperById(id: Int!): Helper

    # Menu Room Queries
    getMenuRooms: [MenuRoom!]!
    getAvailableMenuRooms: [MenuRoom!]!
    getMenuRoomById(id: Int!): MenuRoom

    # Employee Management Queries
    getUsers: [User!]!
    getUserById(id: Int!): User

    # Menu System Queries
    programCategories: [ProgramCategory]
    programCategory(id: Int!): ProgramCategory
    programItems: [ProgramItem]
    programItemsByCategory(categoryId: Int!): [ProgramItem]
    programItem(id: Int!): ProgramItem
    
    locationCategories: [LocationCategory]
    locationCategory(id: Int!): LocationCategory
    locations: [Location]
    locationsByCategory(categoryId: Int!): [Location]
    location(id: Int!): Location
    
    instructors: [Instructor]
    instructor(id: Int!): Instructor
    
    assistantInstructors: [AssistantInstructor]
    assistantInstructor(id: Int!): AssistantInstructor
    
    helpers: [Helper]
    helper(id: Int!): Helper
    
    menuRooms: [MenuRoom]
    menuRoom(id: Int!): MenuRoom
    
    users: [User]
    user(id: Int!): User
  }
  
  type ProgramListItem {
    BASIC_INFO_SEQ: Int!
    AGENCY: String!
    OPENDAY: String!
    ENDDAY: String!
    SERVICE_TYPE: String!
    PART_MAN_CNT: String!
    PART_WOMAN_CNT: String!
    LEAD_MAN_CNT: String!
    LEAD_WOMAN_CNT: String!
    OM: String!
  }
  
  type Mutation {
    # Program Categories Mutations
    createProgramCategory(input: ProgramCategoryInput!): ProgramCategory!
    updateProgramCategory(id: Int!, input: ProgramCategoryInput!): ProgramCategory!
    deleteProgramCategory(id: Int!): Boolean!

    # Program Items Mutations
    createProgramItem(input: ProgramItemInput!): ProgramItem!
    updateProgramItem(id: Int!, input: ProgramItemInput!): ProgramItem!
    deleteProgramItem(id: Int!): Boolean!

    # Location Categories Mutations
    createLocationCategory(input: LocationCategoryInput!): LocationCategory!
    updateLocationCategory(id: Int!, input: LocationCategoryInput!): LocationCategory!
    deleteLocationCategory(id: Int!): Boolean!

    # Locations Mutations
    createLocation(input: LocationInput!): Location!
    updateLocation(id: Int!, input: LocationInput!): Location!
    deleteLocation(id: Int!): Boolean!

    # Instructor Mutations
    createInstructor(input: InstructorInput!): Instructor!
    updateInstructor(id: Int!, input: InstructorInput!): Instructor!
    deleteInstructor(id: Int!): Boolean!

    # Assistant Instructor Mutations
    createAssistantInstructor(input: AssistantInstructorInput!): AssistantInstructor!
    updateAssistantInstructor(id: Int!, input: AssistantInstructorInput!): AssistantInstructor!
    deleteAssistantInstructor(id: Int!): Boolean!

    # Helper Mutations
    createHelper(input: HelperInput!): Helper!
    updateHelper(id: Int!, input: HelperInput!): Helper!
    deleteHelper(id: Int!): Boolean!

    # Menu Room Mutations
    createMenuRoom(input: MenuRoomInput!): MenuRoom!
    updateMenuRoom(id: Int!, input: MenuRoomInput!): MenuRoom!
    deleteMenuRoom(id: Int!): Boolean!

    # Employee Management Mutations
    createUser(input: UserInput!): User!
    updateUser(id: Int!, input: UserInput!): User!
    deleteUser(id: Int!): Boolean!
  }
`;

// Merge all type definitions
const typeDefs = mergeTypeDefs([
  commonTypeDefs,
  page1TypeDefs,
  page2TypeDefs,
  page3TypeDefs,
  page4TypeDefs,
  page5TypeDefs,
  page6TypeDefs,
  pageFinalTypeDefs,
  excelTypeDefs,
  serviceFormsTypeDefs,
  yearMonthResultTypeDefs,
  searchProgramResultTypeDefs,
  searchResultTypeDefs,
  agencyListTypeDefs,
  userActivityTypeDefs,
  effectivenessTypeDefs,
  menuSystemOperations
]);

module.exports = typeDefs; 