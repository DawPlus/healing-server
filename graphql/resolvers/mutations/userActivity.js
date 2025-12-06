const prisma = require('../../../prisma/prismaClient');

module.exports = {
  createUserActivity: async (_, { input }, context) => {
    try {
      // Get client IP from context if available
      const ip_address = context.req?.ip || input.ip_address || null;
      
      // Create the user activity record
      const activity = await prisma.userActivity.create({
        data: {
          ...input,
          ip_address
        }
      });
      
      return activity;
    } catch (error) {
      console.error('Error creating user activity:', error);
      throw new Error('Failed to create user activity');
    }
  },
  
  deleteUserActivity: async (_, { id }) => {
    try {
      await prisma.userActivity.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user activity:', error);
      throw new Error('Failed to delete user activity');
    }
  },
  
  clearUserActivities: async (_, { olderThan }) => {
    try {
      let where = {};
      
      if (olderThan) {
        where.created_at = {
          lt: new Date(olderThan)
        };
      }
      
      const result = await prisma.userActivity.deleteMany({
        where
      });
      
      return result.count;
    } catch (error) {
      console.error('Error clearing user activities:', error);
      throw new Error('Failed to clear user activities');
    }
  }
}; 