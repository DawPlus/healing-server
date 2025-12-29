// Type resolvers for Page3 entities
const prisma = require('../../../prisma/prismaClient');

const page3TypeResolvers = {
  Page3: {
    // Resolver for room_selections field
    room_selections: async (parent) => {
      try {
        if (!parent.room_selections) return [];
        
        // If it's already a string, parse it
        if (typeof parent.room_selections === 'string') {
          return JSON.parse(parent.room_selections);
        }
        
        // If it's already an object (not a string), return it
        return parent.room_selections;
      } catch (error) {
        console.error('Error resolving Page3.room_selections:', error);
        return [];
      }
    },
    
    // Resolver for meal_plans field
    meal_plans: async (parent) => {
      try {
        if (!parent.meal_plans) return [];
        
        // If it's already a string, parse it
        if (typeof parent.meal_plans === 'string') {
          return JSON.parse(parent.meal_plans);
        }
        
        // If it's already an object (not a string), return it
        return parent.meal_plans;
      } catch (error) {
        console.error('Error resolving Page3.meal_plans:', error);
        return [];
      }
    },
    
    // Resolver for place_reservations field
    place_reservations: async (parent) => {
      try {
        if (!parent.place_reservations) return [];
        
        // If it's already a string, parse it
        if (typeof parent.place_reservations === 'string') {
          return JSON.parse(parent.place_reservations);
        }
        
        // If it's already an object (not a string), return it
        return parent.place_reservations;
      } catch (error) {
        console.error('Error resolving Page3.place_reservations:', error);
        return [];
      }
    }
  }
};

module.exports = page3TypeResolvers; 