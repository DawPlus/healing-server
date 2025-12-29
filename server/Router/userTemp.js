const express = require('express');
const router = express.Router();
const prisma = require('../../../prisma/prismaClient');

// Get list of user temp data by agency and openday
router.post('/list', async (req, res) => {
  try {
    const { agency, openday } = req.body;
    const userTemp = await prisma.userTemp.findMany({
      where: {
        agency,
        openday
      },
      orderBy: {
        seq: 'asc'
      }
    });
    
    res.json(userTemp || []);
  } catch (error) {
    console.error('Error fetching user temp data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get list of agencies
router.post('/agencyList', async (req, res) => {
  try {
    const agencies = await prisma.userTempAgency.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    res.json(agencies || []);
  } catch (error) {
    console.error('Error fetching user temp agencies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user temp data
router.post('/create', async (req, res) => {
  try {
    const input = req.body;
    
    if (!input || !Array.isArray(input)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    const { agency, openday } = input[0];
    
    if (!agency || !openday) {
      return res.status(400).json({ error: 'Agency and openday are required' });
    }
    
    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing data for this agency/openday
      await tx.userTemp.deleteMany({
        where: {
          agency,
          openday,
        },
      });
      
      // Create new entries
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
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error creating user temp:', error);
    res.status(500).json({
      success: false,
      message: `Failed to save user temp data: ${error.message}`,
    });
  }
});

// Delete user temp data
router.post('/delete', async (req, res) => {
  try {
    const { agency, openday } = req.body;
    
    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
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
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting user temp:', error);
    res.status(500).json({
      success: false,
      message: `Failed to delete user temp data: ${error.message}`,
    });
  }
});

module.exports = router; 