const { gql } = require('apollo-server-express');

const userActivityTypeDefs = gql`
  # User Activity Types
  type UserActivity {
    id: Int!
    user_id: Int!
    user_name: String!
    action: String!
    action_target: String!
    target_id: String
    description: String
    ip_address: String
    created_at: DateTime!
  }

  input UserActivityInput {
    user_id: Int!
    user_name: String!
    action: String!
    action_target: String!
    target_id: String
    description: String
    ip_address: String
  }

  # Pagination and search for activities
  input ActivityFilterInput {
    search: String
    startDate: DateTime
    endDate: DateTime
    user_id: Int
    action: String
  }

  type UserActivityResponse {
    activities: [UserActivity!]!
    totalCount: Int!
  }

  extend type Query {
    # User activity queries
    getUserActivities(filter: ActivityFilterInput, skip: Int, take: Int): UserActivityResponse!
    getUserActivityById(id: Int!): UserActivity
  }

  extend type Mutation {
    # User activity mutations
    createUserActivity(input: UserActivityInput!): UserActivity!
    deleteUserActivity(id: Int!): Boolean!
    clearUserActivities(olderThan: DateTime): Int! # Returns count of deleted records
  }
`;

module.exports = userActivityTypeDefs; 