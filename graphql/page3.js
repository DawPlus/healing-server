const { gql } = require('apollo-server-express');

const page3TypeDefs = gql`
  type Page3 {
    id: Int!
    page1_id: Int!
    page1: Page1
    reservation_status: String!
    start_date: DateTime
    end_date: DateTime
    company_name: String
    department: String
    contact_person: String
    position: String
    participants_count: Int
    room_count: Int
    email: String
    phone: String
    purpose: String
    catering_required: Boolean
    special_requirements: String
    room_selections: [RoomSelection]
    meal_plans: [MealPlan]
    place_reservations: [PlaceReservation]
    create_dtm: DateTime!
    create_user: String!
    update_dtm: DateTime!
    update_user: String!
  }

  # New types for participant data
  type ParticipantRoom {
    id: ID!
    page1_id: Int!
    room_type: String!
    count: Int!
    created_at: DateTime
    updated_at: DateTime
  }

  type ParticipantMeal {
    id: ID!
    page1_id: Int!
    meal_type: String!
    count: Int!
    created_at: DateTime
    updated_at: DateTime
  }

  input ParticipantRoomInput {
    id: ID
    page1_id: Int!
    room_type: String!
    count: Int!
  }

  input ParticipantMealInput {
    id: ID
    page1_id: Int!
    meal_type: String!
    count: Int!
  }

  type RoomSelection {
    id: ID!
    room_id: String
    room_name: String
    room_type: String
    check_in_date: String
    check_out_date: String
    occupancy: Int
    price: Float
    total_price: Float
    capacity: Int
    nights: Int
    notes: String
  }

  type MealPlan {
    id: ID!
    date: String
    meal_type: String
    meal_option: String
    participants: Int
    dinner_option: String
    price: Float
    price_per_person: Float
    notes: String
  }

  type PlaceReservation {
    id: ID!
    place_id: String
    place_name: String
    reservation_date: String
    start_time: String
    end_time: String
    purpose: String
    participants: Int
    price: Float
    notes: String
  }

  input RoomSelectionInput {
    id: ID
    room_id: String
    room_name: String
    room_type: String
    check_in_date: String
    check_out_date: String
    occupancy: Int
    price: Float
    total_price: Float
    capacity: Int
    nights: Int
    notes: String
  }

  input MealPlanInput {
    id: ID
    date: String
    meal_type: String
    meal_option: String
    participants: Int
    dinner_option: String
    price: Float
    price_per_person: Float
    notes: String
  }

  input PlaceReservationInput {
    id: ID
    place_id: String
    place_name: String
    reservation_date: String
    start_time: String
    end_time: String
    purpose: String
    participants: Int
    price: Float
    notes: String
  }

  input Page3Input {
    id: ID
    page1_id: ID!
    reservation_status: String
    start_date: String
    end_date: String
    company_name: String
    department: String
    contact_person: String
    position: String
    participants_count: Int
    room_count: Int
    email: String
    phone: String
    purpose: String
    catering_required: Boolean
    special_requirements: String
    room_selections: [RoomSelectionInput]
    meal_plans: [MealPlanInput]
    place_reservations: [PlaceReservationInput]
  }

  # Room Page3 Type
  type Room {
    id: ID!
    name: String!
    room_type: String!
    capacity: Int!
    price_per_night: Float!
    description: String
    is_active: Boolean!
  }

  input RoomInput {
    name: String!
    room_type: String!
    capacity: Int
    price_per_night: Float!
    description: String
    is_active: Boolean
  }

  type Place {
    id: ID!
    name: String!
    capacity: Int!
    price_per_hour: Float!
    description: String
    is_active: Boolean!
  }

  input PlaceInput {
    name: String!
    capacity: Int
    price_per_hour: Float!
    description: String
    is_active: Boolean
  }

  type MealOption {
    id: ID!
    meal_type: String!
    meal_option: String!
    price_per_person: Float!
    description: String
    is_active: Boolean!
  }

  input MealOptionInput {
    meal_type: String!
    meal_option: String!
    price_per_person: Float!
    description: String
    is_active: Boolean
  }

  type Project3Reservation {
    id: ID!
    page1_id: ID
    room_id: ID
    meal_option_id: ID
    place_id: ID
    total_amount: Float
    created_at: String
    updated_at: String
    room: Room
    meal_option: MealOption
    place: Place
  }

  # Room reservation type for availability checking
  type RoomReservationInfo {
    id: ID!
    check_in_date: String
    check_out_date: String
    page1_id: Int
    next_available_date: String
    group_name: String
  }
  
  # Room with availability information
  type RoomWithAvailability {
    id: ID!
    room_name: String!
    room_type: String!
    capacity: Int!
    price: Int!
    description: String
    is_available: Boolean!
    floor: Int
    facilities: String
    display_order: Int
    created_at: DateTime
    updated_at: DateTime
    reservations: [RoomReservationInfo]
  }

  # Room Management type
  type RoomManage {
    id: ID!
    page1_id: Int!
    room_id: Int!
    check_in_date: DateTime!
    check_out_date: DateTime!
    organization_name: String
    status: String!
    occupancy: Int!
    price: Int!
    total_price: Int!
    capacity: Int!
    nights: Int!
    notes: String
    created_at: DateTime!
    updated_at: DateTime!
  }

  # Input for creating/updating room management
  input RoomManageInput {
    id: ID
    page1_id: Int!
    room_id: Int!
    check_in_date: String!
    check_out_date: String!
    organization_name: String
    status: String
    occupancy: Int
    price: Int
    total_price: Int
    capacity: Int
    nights: Int
    notes: String
  }

  type Query {
    getPage3List: [Page3!]!
    getPage3ByPage1Id(page1Id: Int!): Page3
    getPage3ById(id: Int!): Page3
    
    # Page3 queries
    getRooms: [Room]
    getPlaces: [Place]
    getMealOptions: [MealOption]
    getReservations(page1Id: ID!): [Project3Reservation]
    
    # Room availability query
    getAvailableRoomsByDate(
      startDate: String!, 
      endDate: String!, 
      excludePage1Id: Int
    ): [RoomWithAvailability]

    # Participant data queries
    getParticipantRooms(page1Id: Int!): [ParticipantRoom]
    getParticipantMeals(page1Id: Int!): [ParticipantMeal]
    
    # Room Management queries
    getRoomManage(id: ID!): RoomManage
    getRoomManageByPage1Id(page1Id: Int!): [RoomManage]
    getRoomManageByRoomId(roomId: Int!): [RoomManage]
    getRoomManageByDateRange(startDate: String!, endDate: String!): [RoomManage]
    getRoomAvailabilityStatus(roomId: Int!, startDate: String!, endDate: String!): String
  }

  type Mutation {
    createOrUpdatePage3(input: Page3Input!): Page3!
    deletePage3(id: Int!): Boolean!
    deletePage3ByPage1Id(page1Id: ID!): Boolean!
    
    # Page3 Room mutations
    createRoom(input: RoomInput!): Room
    updateRoom(id: ID!, input: RoomInput!): Room
    deleteRoom(id: ID!): Boolean
    
    # Page3 Place mutations
    createPlace(input: PlaceInput!): Place
    updatePlace(id: ID!, input: PlaceInput!): Place
    deletePlace(id: ID!): Boolean
    
    # Page3 MealOption mutations
    createMealOption(input: MealOptionInput!): MealOption
    updateMealOption(id: ID!, input: MealOptionInput!): MealOption
    deleteMealOption(id: ID!): Boolean

    # Participant data mutations
    createParticipantRoom(input: ParticipantRoomInput!): ParticipantRoom
    updateParticipantRoom(id: ID!, input: ParticipantRoomInput!): ParticipantRoom
    deleteParticipantRoom(id: ID!): Boolean
    
    createParticipantMeal(input: ParticipantMealInput!): ParticipantMeal
    updateParticipantMeal(id: ID!, input: ParticipantMealInput!): ParticipantMeal
    deleteParticipantMeal(id: ID!): Boolean
    
    # Room Management mutations
    createRoomManage(input: RoomManageInput!): RoomManage
    updateRoomManage(id: ID!, input: RoomManageInput!): RoomManage
    deleteRoomManage(id: ID!): Boolean
  }
`;

module.exports = page3TypeDefs; 