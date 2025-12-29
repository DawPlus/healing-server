const prisma = require('../../../prisma/prismaClient');

module.exports = {
  getUserActivities: async (_, { filter = {}, skip = 0, take = 10 }) => {
    const { search, startDate, endDate, user_id, action } = filter || {};
    
    // Build the where condition
    const where = {};
    
    if (search) {
      where.OR = [
        { user_name: { contains: search } },
        { action_target: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.created_at = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.created_at = {
        lte: new Date(endDate)
      };
    }
    
    if (user_id) {
      where.user_id = user_id;
    }
    
    if (action) {
      where.action = action;
    }
    
    try {
      // Get the activities
      const activities = await prisma.userActivity.findMany({
        where,
        skip,
        take,
        orderBy: {
          created_at: 'desc'
        }
      });
      
      // Get the total count
      const totalCount = await prisma.userActivity.count({ where });
      
      return {
        activities,
        totalCount
      };
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw new Error('Failed to fetch user activities');
    }
  },
  
  getUserActivityById: async (_, { id }) => {
    try {
      return await prisma.userActivity.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching user activity by ID:', error);
      throw new Error('Failed to fetch user activity');
    }
  }
}; 