const prisma = require('../../../prisma/prismaClient');

const createUserTemp = async (_, { input }) => {
  // Use Prisma transaction
  return await prisma.$transaction(async (tx) => {
    try {
      if (!input || input.length === 0) {
        throw new Error('No input data provided');
      }

      const { agency, openday } = input[0];

      if (!agency || !openday) {
        throw new Error('Agency and openday are required');
      }

      // Delete existing data for this agency/openday
      await tx.userTemp.deleteMany({
        where: {
          agency,
          openday,
        },
      });

      // Create new entries (transform input to match Prisma format)
      const createData = input.map(item => ({
        seq: item.seq || '',
        name: item.name || '',
        sex: item.sex || '',
        age: item.age || '',
        residence: item.residence || '',
        job: item.job || '',
        agency,
        openday,
      }));
      
      await tx.userTemp.createMany({
        data: createData,
      });

      // Check if agency already exists in UserTempAgency
      const existingAgency = await tx.userTempAgency.findFirst({
        where: {
          agency,
          openday,
        },
      });

      // If agency doesn't exist, create it
      if (!existingAgency) {
        await tx.userTempAgency.create({
          data: {
            agency,
            openday,
          },
        });
      }

      return {
        success: true,
        message: 'User temp data saved successfully',
      };
    } catch (error) {
      console.error('Error creating user temp:', error);
      throw error;
    }
  }).catch(error => {
    return {
      success: false,
      message: `Failed to save user temp data: ${error.message}`,
    };
  });
};

const updateUserTemp = async (_, { id, input }) => {
  try {
    // Validate input
    if (!id || !input) {
      return {
        success: false,
        message: 'ID and input data are required'
      };
    }

    // Update the record
    await prisma.userTemp.update({
      where: {
        id: parseInt(id)
      },
      data: {
        seq: input.seq || '',
        name: input.name || '',
        sex: input.sex || '',
        age: input.age || '',
        residence: input.residence || '',
        job: input.job || '',
        agency: input.agency,
        openday: input.openday,
      }
    });

    return {
      success: true,
      message: 'User temp record updated successfully'
    };
  } catch (error) {
    console.error('Error updating user temp:', error);
    return {
      success: false,
      message: `Failed to update user temp record: ${error.message}`
    };
  }
};

const deleteUserTemp = async (_, { agency, openday }) => {
  // Use Prisma transaction
  return await prisma.$transaction(async (tx) => {
    try {
      // Delete data from UserTemp
      await tx.userTemp.deleteMany({
        where: {
          agency,
          openday,
        },
      });

      // Delete from UserTempAgency
      await tx.userTempAgency.deleteMany({
        where: {
          agency,
          openday,
        },
      });

      return {
        success: true,
        message: 'User temp data deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting user temp:', error);
      throw error;
    }
  }).catch(error => {
    return {
      success: false,
      message: `Failed to delete user temp data: ${error.message}`,
    };
  });
};

module.exports = {
  createUserTemp,
  updateUserTemp,
  deleteUserTemp,
}; 