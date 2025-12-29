const express = require('express');
const router = express.Router();
const maria = require('../maria');
const fs = require('fs');
const path = require('path');

// Response formatting utilities
const formatResponse = (res, data) => {
  return res.status(200).json({
    success: true,
    data
  });
};

const formatError = (res, message, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.message : null
  });
};

// Helper function to handle errors
const handleError = (res, err) => {
  console.error('[project3] Error:', err);
  res.status(500).json({
    error: err.message || 'An unexpected error occurred',
    success: false
  });
};

// Get all project3 reservations
router.post('/getReservations', async (req, res) => {
  try {
    console.log('[project3] Getting all reservations');
    
    const sql = `
      SELECT * FROM dbstatistics.project3_reservations
      ORDER BY created_at DESC
    `;
    
    const reservations = await maria(sql);
    console.log(`[project3] Found ${reservations.length} reservations`);
    
    res.json(reservations);
  } catch (err) {
    console.error('[project3] Error getting reservations:', err);
    handleError(res, err);
  }
});

// Get a single project3 reservation by ID
router.post('/getReservation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[project3] Getting reservation with ID: ${id}`);
    
    const sql = 'SELECT * FROM dbstatistics.project3_reservations WHERE id = ?';
    
    const results = await maria(sql, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Reservation not found', success: false });
    }
    
    console.log(`[project3] Found reservation with ID: ${id}`);
    res.json(results[0]);
  } catch (err) {
    console.error(`[project3] Error getting reservation with ID ${req.params.id}:`, err);
    handleError(res, err);
  }
});

// Get a project3 reservation by page1_id
router.post('/getByPage1Id/:page1Id', async (req, res) => {
  try {
    const page1Id = req.params.page1Id;
    console.log(`[project3] Getting reservation with page1_id: ${page1Id}`);
    
    const sql = 'SELECT * FROM dbstatistics.project3_reservations WHERE page1_id = ?';
    
    const results = await maria(sql, [page1Id]);
    
    if (results.length === 0) {
      return res.json({ 
        success: false, 
        error: 'No reservation found for this page1_id',
        data: null
      });
    }
    
    console.log(`[project3] Found reservation with page1_id: ${page1Id}`);
    res.json({
      success: true,
      data: results[0]
    });
  } catch (err) {
    console.error(`[project3] Error getting reservation with page1_id ${req.params.page1Id}:`, err);
    handleError(res, err);
  }
});

// Create a new project3 reservation
router.post('/createReservation', async (req, res) => {
  try {
    const {
      page1_id,
      room_selections,
      meal_plans,
      place_reservations
    } = req.body;
    
    console.log('[project3] Creating new reservation:', {
      page1_id,
      room_selections: Array.isArray(room_selections) ? `${room_selections.length} items` : 'none',
      meal_plans: Array.isArray(meal_plans) ? `${meal_plans.length} items` : 'none',
      place_reservations: Array.isArray(place_reservations) ? `${place_reservations.length} items` : 'none'
    });
    
    // Convert arrays to JSON strings if they're not already
    const roomSelectionsJson = typeof room_selections === 'string' 
      ? room_selections 
      : JSON.stringify(room_selections || []);
      
    const mealPlansJson = typeof meal_plans === 'string' 
      ? meal_plans 
      : JSON.stringify(meal_plans || []);
      
    const placeReservationsJson = typeof place_reservations === 'string' 
      ? place_reservations 
      : JSON.stringify(place_reservations || []);
    
    // Check if a record with this page1_id already exists
    const checkSql = 'SELECT id FROM dbstatistics.project3_reservations WHERE page1_id = ?';
    const existingRecord = await maria(checkSql, [page1_id]);
    
    if (existingRecord.length > 0) {
      // Update the existing record instead
      const updateSql = `
        UPDATE dbstatistics.project3_reservations
        SET 
          room_selections = ?,
          meal_plans = ?,
          place_reservations = ?
        WHERE page1_id = ?
      `;
      
      const params = [
        roomSelectionsJson,
        mealPlansJson,
        placeReservationsJson,
        page1_id
      ];
      
      await maria(updateSql, params);
      console.log(`[project3] Updated existing reservation for page1_id: ${page1_id}`);
      
      res.json({
        id: existingRecord[0].id,
        ...req.body
      });
      return;
    }
    
    // Create a new record
    const insertSql = `
      INSERT INTO dbstatistics.project3_reservations (
        page1_id,
        room_selections,
        meal_plans,
        place_reservations
      ) VALUES (?, ?, ?, ?)
    `;
    
    const params = [
      page1_id || null,
      roomSelectionsJson,
      mealPlansJson,
      placeReservationsJson
    ];
    
    const result = await maria(insertSql, params);
    console.log(`[project3] Created reservation with ID: ${result.insertId}`);
    
    res.json({
      id: result.insertId,
      ...req.body
    });
  } catch (err) {
    console.error('[project3] Error creating reservation:', err);
    handleError(res, err);
  }
});

// Update an existing project3 reservation
router.post('/updateReservation', async (req, res) => {
  try {
    const {
      id,
      page1_id,
      room_selections,
      meal_plans,
      place_reservations
    } = req.body;
    
    if (!id && !page1_id) {
      return res.status(400).json({ error: 'ID or page1_id is required for updating a reservation', success: false });
    }
    
    console.log(`[project3] Updating reservation with ${id ? 'ID: ' + id : 'page1_id: ' + page1_id}`);
    
    // Convert arrays to JSON strings if they're not already
    const roomSelectionsJson = typeof room_selections === 'string' 
      ? room_selections 
      : JSON.stringify(room_selections || []);
      
    const mealPlansJson = typeof meal_plans === 'string' 
      ? meal_plans 
      : JSON.stringify(meal_plans || []);
      
    const placeReservationsJson = typeof place_reservations === 'string' 
      ? place_reservations 
      : JSON.stringify(place_reservations || []);
    
    let sql, params;
    
    if (id) {
      sql = `
        UPDATE dbstatistics.project3_reservations
        SET 
          page1_id = ?,
          room_selections = ?,
          meal_plans = ?,
          place_reservations = ?
        WHERE id = ?
      `;
      
      params = [
        page1_id || null,
        roomSelectionsJson,
        mealPlansJson,
        placeReservationsJson,
        id
      ];
    } else {
      sql = `
        UPDATE dbstatistics.project3_reservations
        SET 
          room_selections = ?,
          meal_plans = ?,
          place_reservations = ?
        WHERE page1_id = ?
      `;
      
      params = [
        roomSelectionsJson,
        mealPlansJson,
        placeReservationsJson,
        page1_id
      ];
    }
    
    await maria(sql, params);
    console.log(`[project3] Updated reservation successfully`);
    
    res.json({
      success: true,
      ...req.body
    });
  } catch (err) {
    console.error(`[project3] Error updating reservation:`, err);
    handleError(res, err);
  }
});

// Delete a project3 reservation
router.post('/deleteReservation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[project3] Deleting reservation with ID: ${id}`);
    
    const sql = 'DELETE FROM dbstatistics.project3_reservations WHERE id = ?';
    
    await maria(sql, [id]);
    console.log(`[project3] Deleted reservation with ID: ${id}`);
    
    res.json({ success: true, id });
  } catch (err) {
    console.error(`[project3] Error deleting reservation with ID ${req.params.id}:`, err);
    handleError(res, err);
  }
});

// Delete a project3 reservation by page1_id
router.post('/deleteByPage1Id/:page1Id', async (req, res) => {
  try {
    const { page1Id } = req.params;
    console.log(`[project3] Deleting reservation with page1_id: ${page1Id}`);
    
    const sql = 'DELETE FROM dbstatistics.project3_reservations WHERE page1_id = ?';
    
    const result = await maria(sql, [page1Id]);
    console.log(`[project3] Deleted reservation with page1_id: ${page1Id}, affected rows: ${result.affectedRows}`);
    
    res.json({ 
      success: true, 
      page1Id,
      message: result.affectedRows > 0 
        ? '데이터가 성공적으로 삭제되었습니다.' 
        : '해당 page1_id로 등록된 데이터가 없습니다.'
    });
  } catch (err) {
    console.error(`[project3] Error deleting reservation with page1_id ${req.params.page1Id}:`, err);
    handleError(res, err);
  }
});

// Get rooms
router.post('/getRooms', async (req, res) => {
  try {
    console.log('[project3] Getting all rooms');
    
    const sql = 'SELECT * FROM dbstatistics.project3_rooms WHERE is_active = 1 ORDER BY id';
    const rooms = await maria(sql);
    
    console.log(`[project3] Found ${rooms.length} rooms`);
    res.json(rooms);
  } catch (err) {
    console.error('[project3] Error getting rooms:', err);
    handleError(res, err);
  }
});

// Get places
router.post('/getPlaces', async (req, res) => {
  try {
    console.log('[project3] Getting all places');
    
    const sql = 'SELECT * FROM dbstatistics.project3_places WHERE is_active = 1 ORDER BY id';
    const places = await maria(sql);
    
    console.log(`[project3] Found ${places.length} places`);
    res.json(places);
  } catch (err) {
    console.error('[project3] Error getting places:', err);
    handleError(res, err);
  }
});

// Initialize the database if needed
router.post('/initDatabase', async (req, res) => {
  try {
    console.log('[project3] Initializing database');
    
    // Read the SQL script from the file
    const sqlPath = path.join(__dirname, '..', 'new3.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the script into individual statements
    const statements = sql
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    // Execute each statement
    for (let statement of statements) {
      await maria(statement);
    }
    
    console.log('[project3] Database initialized successfully');
    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (err) {
    console.error('[project3] Error initializing database:', err);
    handleError(res, err);
  }
});

module.exports = router; 