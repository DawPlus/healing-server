// 객실 목록 가져오기
router.post('/getRooms', async (req, res) => {
  try {
    const sql = `
      SELECT id, room_name, room_type, capacity, price_weekday, price_weekend, facilities, description, is_available, display_order
      FROM room
      ORDER BY display_order, id
    `;
    
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('객실 목록 조회 오류:', error);
    res.status(500).json({ error: '객실 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 장소 구분 목록 가져오기
router.post('/getLocationCategories', async (req, res) => {
  try {
    const sql = `
      SELECT id, name, description, display_order
      FROM location_category
      ORDER BY display_order, id
    `;
    
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('장소 구분 목록 조회 오류:', error);
    res.status(500).json({ error: '장소 구분 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 장소 목록 가져오기
router.post('/getPlaces', async (req, res) => {
  try {
    const sql = `
      SELECT p.id, p.name, p.category_id, p.description, p.capacity, p.price, p.is_available,
             p.facilities, p.display_order, lc.name as category_name
      FROM place p
      LEFT JOIN location_category lc ON p.category_id = lc.id
      ORDER BY p.display_order, p.id
    `;
    
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('장소 목록 조회 오류:', error);
    res.status(500).json({ error: '장소 목록을 가져오는 중 오류가 발생했습니다.' });
  }
}); 