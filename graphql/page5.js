const { gql } = require('apollo-server-express');

const page5TypeDefs = gql`
  # Page5 Types
  type Page5Document {
    id: Int!
    page1_id: Int!
    document_type: String!
    status: String!
    organization_name: String!
    contact_name: String
    contact_email: String
    contact_phone: String
    reservation_date: String
    reservation_code: String
    created_at: DateTime!
    updated_at: DateTime!
    reservation: Page1
  }

  input Page5DocumentInput {
    page1_id: Int!
    document_type: String!
    status: String
    organization_name: String!
    contact_name: String
    contact_email: String
    contact_phone: String
    reservation_date: String
    reservation_code: String
  }

  # Calendar Events for Page 5
  type CalendarEvent {
    id: Int!
    title: String
    start: DateTime
    end: DateTime
    status: String
    organization: String
    contact: String
    color: String
    page1_id: Int
  }

  # Statistics Types for Order Reports
  type StatisticsCategory {
    name: String!
    value: Float!
    count: Int!
    percentage: Float!
    # Add color field for chart display
    color: String
  }

  type StatisticsOrganization {
    name: String!
    reservations_count: Int!
    total_revenue: Float!
    percentage: Float!
  }

  type DailyStatistic {
    date: String!
    count: Int!
    value: Float!
    # Add dayNumber field for chart display
    dayNumber: Int
  }

  type Statistics {
    period: String!
    type: String!
    totalReservations: Int!
    totalRevenue: Float!
    averageStay: Float!
    categories: [StatisticsCategory!]!
    organizations: [StatisticsOrganization!]!
    dailyData: [DailyStatistic!]!
    # Add extra fields for summary information
    accommodationCount: Int
    mealCount: Int
    programCount: Int
    venueCount: Int
  }

  type ScheduleProgram {
    id: String
    program_name: String
    organization: String
    start_time: String
    end_time: String
    location: String
    participants: Int
    date: String
  }

  type ScheduleRoom {
    id: String
    room_name: String
    organization: String
    check_in: String
    check_out: String
    occupancy: Int
  }

  type ScheduleMeal {
    id: String
    meal_type: String
    organization: String
    time: String
    participants: Int
    location: String
  }

  type SchedulePlace {
    id: String
    place_name: String
    organization: String
    start_time: String
    end_time: String
    purpose: String
    participants: Int
  }

  type ScheduleData {
    date: String!
    programs: [ScheduleProgram]
    rooms: [ScheduleRoom]
    meals: [ScheduleMeal]
    places: [SchedulePlace]
  }

  # === Calendar Schedule Types ===
  type DailySchedule {
    date: String!
    programs: [ScheduleProgram]
    rooms: [ScheduleRoom]
    meals: [ScheduleMeal]
    places: [SchedulePlace]
  }

  type ReservationSchedule {
    id: ID!
    group_name: String
    customer_name: String
    start_date: String
    end_date: String
    total_count: Int
    programs: [ScheduleProgram]
  }

  type Query {
    # Page5 queries
    getCalendarData(month: String!, year: String!): [CalendarEvent]
    getStatistics(period: String!, type: String!): Statistics
    getScheduleData(startDate: String!, endDate: String!): [ScheduleData]
    getReservationDataForSchedule(startDate: String!, endDate: String!): [ReservationSchedule]
    getPage5Documents(page1Id: Int): [Page5Document]
    getPage5DocumentById(id: Int!): Page5Document
  }

  type Mutation {
    # Page5 mutations
    createPage5Document(input: Page5DocumentInput!): Page5Document!
    updatePage5Document(id: Int!, input: Page5DocumentInput!): Page5Document!
    deletePage5Document(id: Int!): DeleteResult!
    updatePage5ReservationStatus(id: Int!, status: String!): Page1
    updatePage5CalendarEvent(id: Int!, start: DateTime!, end: DateTime!): Page1
  }
`;

module.exports = page5TypeDefs; 