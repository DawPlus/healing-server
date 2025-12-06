const prisma = require('../../../prisma/prismaClient');

/**
 * Get prevent service effectiveness evaluation data by year
 * @param {Object} _ - Parent resolver
 * @param {Object} args - Query arguments
 * @param {number} args.year - Year to filter data by
 * @returns {Promise<Array>} - Array of prevent form data
 */
const getPreventEffectiveness = async (_, { year }) => {
  try {
    console.log(`Getting prevention service effectiveness data for year ${year}`);
    
    // Start date and end date for the specified year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    // Get prevent form data for the year
    const preventData = await prisma.preventForm.findMany({
      where: {
        openday: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log(`Found ${preventData.length} prevention service effectiveness records for year ${year}`);
    
    return preventData;
  } catch (error) {
    console.error('Error fetching prevent effectiveness data:', error);
    throw new Error(`Failed to fetch prevention service effectiveness data: ${error.message}`);
  }
};

module.exports = {
  getPreventEffectiveness
}; 