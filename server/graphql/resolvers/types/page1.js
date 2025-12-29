// Type resolvers for Page1 entities
const prisma = require('../../../prisma/prismaClient');

const page1TypeResolvers = {
  Page1: {
    // Resolver for page2_reservations field
    page2_reservations: async (parent) => {
      try {
        if (!parent.id) return [];
        
        return await prisma.page2.findMany({
          where: { page1_id: parent.id },
          include: { programs: true }
        });
      } catch (error) {
        console.error('Error resolving Page1.page2_reservations:', error);
        return [];
      }
    },
    
    // Resolver for page3 field
    page3: async (parent) => {
      try {
        if (!parent.id) return null;
        
        const page3 = await prisma.page3.findUnique({
          where: { page1_id: parent.id }
        });
        
        if (page3) {
          // Parse JSON fields if they are strings
          let roomSelections = [];
          let mealPlans = [];
          let placeReservations = [];

          try {
            roomSelections = typeof page3.room_selections === 'string' 
              ? JSON.parse(page3.room_selections)
              : (page3.room_selections || []);
          } catch (e) {
            console.error("Error parsing room_selections:", e);
            roomSelections = [];
          }

          try {
            mealPlans = typeof page3.meal_plans === 'string'
              ? JSON.parse(page3.meal_plans)
              : (page3.meal_plans || []);
          } catch (e) {
            console.error("Error parsing meal_plans:", e);
            mealPlans = [];
          }

          try {
            placeReservations = typeof page3.place_reservations === 'string'
              ? JSON.parse(page3.place_reservations)
              : (page3.place_reservations || []);
          } catch (e) {
            console.error("Error parsing place_reservations:", e);
            placeReservations = [];
          }
          
          return {
            ...page3,
            room_selections: roomSelections,
            meal_plans: mealPlans,
            place_reservations: placeReservations
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error resolving Page1.page3:', error);
        return null;
      }
    },
    
    // Resolver for page4_expenses field
    page4_expenses: async (parent) => {
      try {
        if (!parent.id) return [];
        
        return await prisma.page4.findMany({
          where: { page1_id: parent.id },
          include: { materials: true, expenses: true }
        });
      } catch (error) {
        console.error('Error resolving Page1.page4_expenses:', error);
        return [];
      }
    },
    
    // Resolver for pageFinal field
    pageFinal: async (parent) => {
      try {
        if (!parent.id) return null;
        
        return await prisma.pageFinal.findUnique({
          where: { page1_id: parent.id },
          include: {
            teacher_expenses: true,
            participant_expenses: true,
            income_items: true
          }
        });
      } catch (error) {
        console.error('Error resolving Page1.pageFinal:', error);
        return null;
      }
    }
  }
};

module.exports = page1TypeResolvers; 