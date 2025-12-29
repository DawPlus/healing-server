const prisma = require('../../../prisma/prismaClient');

module.exports = {
  // Simplified queries for ServiceForm component
  getProgramCategories: async () => {
    return await prisma.programCategory.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  getProgramsByCategory: async (_, { categoryId }) => {
    return await prisma.programItem.findMany({
      where: { category_id: parseInt(categoryId) },
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  getInstructors: async () => {
    return await prisma.instructor.findMany({
      orderBy: { name: 'asc' }
    });
  },

  // Program Categories Queries
  programCategories: async () => {
    return await prisma.programCategory.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  programCategory: async (_, { id }) => {
    return await prisma.programCategory.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Program Items Queries
  programItems: async () => {
    return await prisma.programItem.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  programItemsByCategory: async (_, { categoryId }) => {
    return await prisma.programItem.findMany({
      where: { category_id: parseInt(categoryId) },
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  programItem: async (_, { id }) => {
    return await prisma.programItem.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Location Categories Queries
  locationCategories: async () => {
    return await prisma.locationCategory.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  locationCategory: async (_, { id }) => {
    return await prisma.locationCategory.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Locations Queries
  locations: async () => {
    return await prisma.location.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  locationsByCategory: async (_, { categoryId }) => {
    return await prisma.location.findMany({
      where: { category_id: parseInt(categoryId) },
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
  },

  location: async (_, { id }) => {
    return await prisma.location.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Instructor Queries
  instructors: async () => {
    return await prisma.instructor.findMany({
      orderBy: { id: 'asc' }
    });
  },

  instructor: async (_, { id }) => {
    return await prisma.instructor.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Assistant Instructor Queries
  assistantInstructors: async () => {
    return await prisma.assistantInstructor.findMany({
      orderBy: { id: 'asc' }
    });
  },

  assistantInstructor: async (_, { id }) => {
    return await prisma.assistantInstructor.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Helper Queries
  helpers: async () => {
    return await prisma.helper.findMany({
      orderBy: { id: 'asc' }
    });
  },

  helper: async (_, { id }) => {
    return await prisma.helper.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Menu Room Queries
  menuRooms: async () => {
    try {
      const rooms = await prisma.menuRoom.findMany({
        orderBy: [
          { display_order: 'asc' },
          { created_at: 'desc' }
        ]
      });
      return rooms;
    } catch (error) {
      console.error('Error fetching menu rooms:', error);
      throw new Error('객실 목록을 불러오는 중 오류가 발생했습니다.');
    }
  },

  menuRoom: async (_, { id }) => {
    return await prisma.menuRoom.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // User Management Queries
  users: async () => {
    return await prisma.user.findMany({
      orderBy: { id: 'asc' }
    });
  },

  user: async (_, { id }) => {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
  },

  getUsers: async () => {
    return await prisma.user.findMany({
      orderBy: { id: 'asc' }
    });
  },

  getUserById: async (_, { id }) => {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Type Resolvers
  ProgramCategory: {
    programs: async (parent) => {
      return await prisma.programItem.findMany({
        where: { category_id: parent.id },
        orderBy: [
          { display_order: 'asc' },
          { id: 'asc' }
        ]
      });
    }
  },

  ProgramItem: {
    category: async (parent) => {
      if (!parent.category_id) return null;
      
      return await prisma.programCategory.findUnique({
        where: { id: parent.category_id }
      });
    }
  },

  LocationCategory: {
    locations: async (parent) => {
      return await prisma.location.findMany({
        where: { category_id: parent.id },
        orderBy: [
          { display_order: 'asc' },
          { id: 'asc' }
        ]
      });
    }
  },

  Location: {
    category: async (parent) => {
      if (!parent.category_id) return null;
      
      return await prisma.locationCategory.findUnique({
        where: { id: parent.category_id }
      });
    }
  }
}; 