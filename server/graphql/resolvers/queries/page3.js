const prisma = require('../../../prisma/prismaClient');
const { Decimal } = require('decimal.js');
const moment = require('moment');

// Ensure all JSON arrays are properly formatted with non-null IDs
const ensureValidIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map((item, index) => {
    // If item has no ID or ID is null, generate a placeholder
    if (!item || item.id === null || item.id === undefined) {
      // Generate a consistent ID based on index
      return {
        ...(item || {}),
        id: `generated_${index}_${Date.now()}`
      };
    }
    
    // Ensure id is a string value
    return {
      ...item,
      id: String(item.id)
    };
  });
};

module.exports = {
  getPage3List: async () => {
    return prisma.page3.findMany({
      include: {
        page1: true,
      },
    });
  },
  
  getPage3ByPage1Id: async (_, { page1Id }) => {
    const id = parseInt(page1Id);
    const page3 = await prisma.page3.findUnique({
      where: { page1_id: id },
      include: {
        page1: true,
      },
    });
    
    // Format JSON fields if they exist
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
        room_selections: ensureValidIds(roomSelections),
        meal_plans: ensureValidIds(mealPlans),
        place_reservations: ensureValidIds(placeReservations)
      };
    }
    
    return null;
  },
  
  getPage3ById: async (_, { id }) => {
    const numId = parseInt(id);
    return prisma.page3.findUnique({
      where: { id: numId },
      include: {
        page1: true,
      },
    });
  },
  
  getRooms: async () => {
    try {
      // Use the new Project3Room model instead of raw SQL
      const rooms = await prisma.project3Room.findMany({
        where: {
          is_active: true
        },
        select: {
          id: true,
          name: true,
          room_type: true,
          capacity: true,
          price_per_night: true,
          description: true,
          is_active: true
        }
      });
      
      // Convert decimal to float for GraphQL
      return rooms.map(room => ({
        ...room,
        price_per_night: parseFloat(room.price_per_night)
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  },
  
  getPlaces: async () => {
    try {
      // Use the new Project3Place model instead of raw SQL
      const places = await prisma.project3Place.findMany({
        where: {
          is_active: true
        },
        select: {
          id: true,
          name: true,
          capacity: true,
          price_per_hour: true,
          description: true,
          is_active: true
        }
      });
      
      // Convert decimal to float for GraphQL
      return places.map(place => ({
        ...place,
        price_per_hour: parseFloat(place.price_per_hour)
      }));
    } catch (error) {
      console.error('Error fetching places:', error);
      return [];
    }
  },
  
  getMealOptions: async () => {
    try {
      // Use the new Project3MealOption model instead of raw SQL
      const mealOptions = await prisma.project3MealOption.findMany({
        where: {
          is_active: true
        },
        select: {
          id: true,
          meal_type: true,
          meal_option: true,
          price_per_person: true,
          ingredient_cost: true,
          description: true,
          is_active: true
        }
      });
      
      // Convert decimal to float for GraphQL
      return mealOptions.map(option => ({
        ...option,
        price_per_person: parseFloat(option.price_per_person),
        ingredient_cost: parseFloat(option.ingredient_cost || 0)
      }));
    } catch (error) {
      console.error('Error fetching meal options:', error);
      return [];
    }
  },
  
  getReservations: async (_, { page1Id }) => {
    try {
      const numPage1Id = parseInt(page1Id);
      
      const reservations = await prisma.project3Reservation.findMany({
        where: {
          page1_id: numPage1Id
        },
        include: {
          room: true,
          meal_option: true,
          place: true
        }
      });
      
      // Convert decimal values to float for GraphQL
      return reservations.map(reservation => ({
        ...reservation,
        total_amount: parseFloat(reservation.total_amount || 0),
        room: reservation.room ? {
          ...reservation.room,
          price_per_night: parseFloat(reservation.room.price_per_night)
        } : null,
        meal_option: reservation.meal_option ? {
          ...reservation.meal_option,
          price_per_person: parseFloat(reservation.meal_option.price_per_person)
        } : null,
        place: reservation.place ? {
          ...reservation.place,
          price_per_hour: parseFloat(reservation.place.price_per_hour)
        } : null
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  },

  // Type Resolvers - Moved from page3TypeResolvers.js
  Page3: {
    page1: async (parent, _, context) => {
      if (parent.page1) {
        return parent.page1;
      }
      
      return await context.prisma.page1.findUnique({
        where: { id: parent.page1_id }
      });
    },
    room_selections: (parent) => {
      // If room_selections is already a JSON array, return it, otherwise parse or return empty array
      let selections = [];
      
      try {
        if (parent.room_selections) {
          selections = typeof parent.room_selections === 'string' 
            ? JSON.parse(parent.room_selections)
            : parent.room_selections;
        }
      } catch (e) {
        console.error("Error parsing room_selections in resolver:", e);
      }
      
      return ensureValidIds(selections);
    },
    meal_plans: (parent) => {
      // If meal_plans is already a JSON array, return it, otherwise parse or return empty array
      let mealPlans = [];
      
      try {
        if (parent.meal_plans) {
          mealPlans = typeof parent.meal_plans === 'string'
            ? JSON.parse(parent.meal_plans)
            : parent.meal_plans;
        }
      } catch (e) {
        console.error("Error parsing meal_plans in resolver:", e);
      }
      
      return ensureValidIds(mealPlans);
    },
    place_reservations: (parent) => {
      // If place_reservations is already a JSON array, return it, otherwise parse or return empty array
      let reservations = [];
      
      try {
        if (parent.place_reservations) {
          reservations = typeof parent.place_reservations === 'string'
            ? JSON.parse(parent.place_reservations)
            : parent.place_reservations;
        }
      } catch (e) {
        console.error("Error parsing place_reservations in resolver:", e);
      }
      
      return ensureValidIds(reservations);
    }
  },
  
  Project3Reservation: {
    room: async (parent, _, context) => {
      if (parent.room) {
        return {
          ...parent.room,
          price_per_night: parseFloat(parent.room.price_per_night)
        };
      }
      
      if (!parent.room_id) {
        return null;
      }
      
      const room = await context.prisma.project3Room.findUnique({
        where: { id: parent.room_id }
      });
      
      return room ? {
        ...room,
        price_per_night: parseFloat(room.price_per_night)
      } : null;
    },
    meal_option: async (parent, _, context) => {
      if (parent.meal_option) {
        return {
          ...parent.meal_option,
          price_per_person: parseFloat(parent.meal_option.price_per_person)
        };
      }
      
      if (!parent.meal_option_id) {
        return null;
      }
      
      const mealOption = await context.prisma.project3MealOption.findUnique({
        where: { id: parent.meal_option_id }
      });
      
      return mealOption ? {
        ...mealOption,
        price_per_person: parseFloat(mealOption.price_per_person)
      } : null;
    },
    place: async (parent, _, context) => {
      if (parent.place) {
        return {
          ...parent.place,
          price_per_hour: parseFloat(parent.place.price_per_hour)
        };
      }
      
      if (!parent.place_id) {
        return null;
      }
      
      const place = await context.prisma.project3Place.findUnique({
        where: { id: parent.place_id }
      });
      
      return place ? {
        ...place,
        price_per_hour: parseFloat(place.price_per_hour)
      } : null;
    }
  },
  
  Room: {
    price_per_night: (parent) => {
      return typeof parent.price_per_night === 'string' || parent.price_per_night instanceof Decimal 
        ? parseFloat(parent.price_per_night) 
        : parent.price_per_night;
    }
  },
  
  Place: {
    price_per_hour: (parent) => {
      return typeof parent.price_per_hour === 'string' || parent.price_per_hour instanceof Decimal 
        ? parseFloat(parent.price_per_hour) 
        : parent.price_per_hour;
    }
  },
  
  MealOption: {
    price_per_person: (parent) => {
      return typeof parent.price_per_person === 'string' || parent.price_per_person instanceof Decimal 
        ? parseFloat(parent.price_per_person) 
        : parent.price_per_person;
    }
  },

  // New resolver to check room availability by date range
  getAvailableRoomsByDate: async (_, { startDate, endDate, excludePage1Id }) => {
    try {
      // Convert to Date objects
      const requestStart = moment(startDate).startOf('day');
      const requestEnd = moment(endDate).endOf('day');
      const excludeId = excludePage1Id ? parseInt(excludePage1Id) : null;
      
      console.log(`[Room Availability] ======= 객실 예약 가능 상태 조회 =======`);
      console.log(`[Room Availability] 요청된 날짜 범위: ${requestStart.format('YYYY-MM-DD')} ~ ${requestEnd.format('YYYY-MM-DD')}`);
      console.log(`[Room Availability] 요청 기간 일수: ${requestEnd.diff(requestStart, 'days')}일`);
      console.log(`[Room Availability] 오버부킹 방지 로직 실행 시작`);
      if (excludeId) {
        console.log(`[Room Availability] 제외할 예약 ID: ${excludeId}`);
      }
      
      // Get all rooms
      const rooms = await prisma.menuRoom.findMany({
        where: {
          is_available: true
        },
        orderBy: [
          { display_order: 'asc' },
          { room_name: 'asc' }
        ]
      });
      
      console.log(`[Room Availability] 총 ${rooms.length}개 객실 조회 중...`);
      
      // For each room, check if it's reserved during the date range
      const result = await Promise.all(rooms.map(async room => {
        console.log(`[Room Availability] 객실 ${room.room_name} (ID: ${room.id}) 예약 확인 시작`);
        // First, check existing RoomManage records
        const roomManageRecords = await prisma.roomManage.findMany({
          where: {
            room_id: room.id,
            status: { not: 'available' },
            ...(excludeId ? { page1_id: { not: excludeId } } : {}),
            OR: [
              // Check-in date is within the range, but not on the check-out date
              {
                check_in_date: {
                  gt: requestStart.toDate(),
                  lt: requestEnd.toDate()
                }
              },
              // Middle dates within the range, but excluding exact check-out date matches with check-in date
              {
                AND: [
                  { check_in_date: { lt: requestStart.toDate() } },
                  { check_out_date: { gt: requestStart.toDate() } },
                  // Exclude cases where checkout date equals check-in date
                  {
                    NOT: {
                      check_out_date: {
                        equals: requestStart.toDate()
                      }
                    }
                  }
                ]
              },
              // Start and end dates span over the room's booking
              {
                AND: [
                  { check_in_date: { lt: requestStart.toDate() } },
                  { check_out_date: { gt: requestStart.toDate() } },
                  // Exclude cases where checkout date equals check-in date
                  {
                    NOT: {
                      check_out_date: {
                        equals: requestStart.toDate()
                      }
                    }
                  }
                ]
              }
            ]
          }
        });
        
        console.log(`[Room Availability] 객실 ${room.room_name} - RoomManage 예약 쿼리 완료 (결과: ${roomManageRecords.length}개)`);
        
        // Track reservations for this room
        const roomReservations = [];
        
        // Process RoomManage records
        for (const record of roomManageRecords) {
          console.log(`[Room Availability] 객실 ${room.room_name} - 기존 예약 발견: ${moment(record.check_in_date).format('YYYY-MM-DD')} ~ ${moment(record.check_out_date).format('YYYY-MM-DD')} (ID: ${record.id})`);
          roomReservations.push({
            id: `rm_${record.id}`,
            check_in_date: moment(record.check_in_date).format('YYYY-MM-DD'),
            check_out_date: moment(record.check_out_date).format('YYYY-MM-DD'),
            page1_id: record.page1_id,
            next_available_date: moment(record.check_out_date).add(1, 'day').format('YYYY-MM-DD'),
            group_name: record.organization_name || '알 수 없는 그룹'
          });
        }
        
        // Then, check the Page3 records from the existing logic
        const page3Records = await prisma.page3.findMany({
          where: {
            // Exclude the current page1's reservations if specified
            ...(excludeId ? { page1_id: { not: excludeId } } : {}),
            // Only get confirmed reservations (not drafts or cancelled)
            reservation_status: { in: ['confirmed', 'active'] }
          },
          include: {
            page1: true // Include page1 data to get group_name
          }
        });
        
        // Additional debugging info
        console.log(`[Room Availability] 객실 ${room.room_name} - RoomManage 예약 수: ${roomManageRecords.length}`);
        console.log(`[Room Availability] 객실 ${room.room_name} - Page3 예약 검증 시작 (총 ${page3Records.length}개)`);
        
        // Check each page3 record for this room
        for (const page3 of page3Records) {
          if (!page3.room_selections) {
            console.log(`[Room Availability] 객실 ${room.room_name} - Page3 ID ${page3.id}에 room_selections이 없음, 건너뜀`);
            continue;
          }
          
          // Parse room_selections which is stored as JSON
          let roomSelections;
          try {
            roomSelections = typeof page3.room_selections === 'string' 
              ? JSON.parse(page3.room_selections) 
              : page3.room_selections;
              
            console.log(`[Room Availability] 객실 ${room.room_name} - Page3 ID ${page3.id}의 room_selections 파싱 성공 (${roomSelections.length}개 객실)`);
          } catch (e) {
            console.error(`Error parsing room_selections for page3 id ${page3.id}:`, e);
            console.log(`[Room Availability] 객실 ${room.room_name} - Page3 ID ${page3.id}의 room_selections 파싱 실패`);
            continue;
          }
          
          // Find if this room is in the selections
          for (const selection of roomSelections) {
            if (selection.room_id == room.id) {
              const reserveStart = moment(selection.check_in_date).startOf('day');
              const reserveEnd = moment(selection.check_out_date).endOf('day');
              
              console.log(`[Room Availability] 객실 ${room.room_name} - Page3 ID ${page3.id}에서 객실 발견`);
              console.log(`[Room Availability] 객실 ${room.room_name} - 예약 기간 검증: ${reserveStart.format('YYYY-MM-DD')} ~ ${reserveEnd.format('YYYY-MM-DD')} (${page3.page1?.group_name || '알 수 없는 그룹'})`);
              console.log(`[Room Availability] 객실 ${room.room_name} - 요청 기간: ${requestStart.format('YYYY-MM-DD')} ~ ${requestEnd.format('YYYY-MM-DD')}`);
              
              // 더 정확한 날짜 범위 겹침 체크: 날짜가 겹치는지 확인
              // 1. 요청 시작일이 예약 기간 내에 있는 경우 (체크아웃 제외)
              // 2. 예약 시작일이 요청 기간 내에 있는 경우 (체크아웃 제외)
              // 3. 예약 기간에 요청 기간이 완전히 포함되는 경우
              // 4. 요청 기간에 예약 기간이 완전히 포함되는 경우
              
              // 각 겹침 조건을 개별적으로 검사하고 로깅
              const condition1 = requestStart.isAfter(reserveStart) && requestStart.isBefore(reserveEnd) && !reserveEnd.isSame(requestStart, 'day');
              const condition2 = reserveStart.isAfter(requestStart) && reserveStart.isBefore(requestEnd) && !requestEnd.isSame(reserveStart, 'day');
              const condition3 = reserveStart.isBefore(requestStart) && reserveEnd.isAfter(requestEnd);
              const condition4 = requestStart.isBefore(reserveStart) && requestEnd.isAfter(reserveEnd);
              
              console.log(`[Room Availability] 객실 ${room.room_name} - 겹침 조건 1 (요청 시작일이 예약 내): ${condition1}`);
              console.log(`[Room Availability] 객실 ${room.room_name} - 겹침 조건 2 (예약 시작일이 요청 내): ${condition2}`);
              console.log(`[Room Availability] 객실 ${room.room_name} - 겹침 조건 3 (예약이 요청 포함): ${condition3}`);
              console.log(`[Room Availability] 객실 ${room.room_name} - 겹침 조건 4 (요청이 예약 포함): ${condition4}`);
              
              const isOverlapping = condition1 || condition2 || condition3 || condition4;
              
              console.log(`[Room Availability] 객실 ${room.room_name} - 겹침 여부: ${isOverlapping ? '겹침 (예약 불가)' : '겹치지 않음 (예약 가능)'}`);
              
              // Additional debug for same-day check-in/check-out cases
              if (reserveEnd.isSame(requestStart, 'day')) {
                console.log(`[Room Availability] 객실 ${room.room_name} - 체크아웃 날짜와 체크인 날짜 일치 (예약 가능)`);
              }
              
              // 다른 예약 체크인 = 현재 체크아웃 경우
              if (reserveStart.isSame(requestEnd, 'day')) {
                console.log(`[Room Availability] 객실 ${room.room_name} - 체크인 날짜와 체크아웃 날짜 일치 (예약 가능)`);
              }
              
              if (isOverlapping) {
                console.log(`[Room Availability] 객실 ${room.room_name} - 날짜 겹침으로 예약 불가 추가`);
                roomReservations.push({
                  id: `p3_${page3.id}_${selection.id || 'unknown'}`,
                  check_in_date: reserveStart.format('YYYY-MM-DD'),
                  check_out_date: reserveEnd.format('YYYY-MM-DD'),
                  page1_id: page3.page1_id,
                  next_available_date: reserveEnd.add(1, 'day').format('YYYY-MM-DD'),
                  group_name: page3.page1?.group_name || '알 수 없는 그룹'
                });
              }
            }
          }
        }
        
        // Extract floor from room name (e.g., "101호" -> 1)
        const floorMatch = room.room_name.match(/^(\d)0\d/);
        const floor = floorMatch ? parseInt(floorMatch[1]) : 0;
        
        console.log(`[Room Availability] 객실 ${room.room_name} - 예약 충돌 수: ${roomReservations.length}`);
        console.log(`[Room Availability] 객실 ${room.room_name} - 예약 가능 여부: ${roomReservations.length === 0 ? '예약 가능' : '예약 불가'}`);
        
        return {
          ...room,
          floor,
          reservations: roomReservations
        };
      }));
      
      console.log(`[Room Availability] 객실 예약 가능 상태 조회 완료 (총 ${result.length}개 객실)`);
      return result;
    } catch (error) {
      console.error('Error fetching available rooms by date:', error);
      console.log(`[Room Availability] 오류 발생: ${error.message}`);
      throw new Error(`객실 예약 가능 여부 조회 중 오류가 발생했습니다: ${error.message}`);
    }
  },

  // Add new queries for participant data
  getParticipantRooms: async (_, { page1Id }) => {
    try {
      const numPage1Id = parseInt(page1Id);
      return prisma.participantRoom.findMany({
        where: { page1_id: numPage1Id },
        orderBy: { created_at: 'asc' }
      });
    } catch (error) {
      console.error("Error fetching participant rooms:", error);
      return [];
    }
  },
  
  getParticipantMeals: async (_, { page1Id }) => {
    try {
      const numPage1Id = parseInt(page1Id);
      return prisma.participantMeal.findMany({
        where: { page1_id: numPage1Id },
        orderBy: { created_at: 'asc' }
      });
    } catch (error) {
      console.error("Error fetching participant meals:", error);
      return [];
    }
  },
  
  // Room Management resolvers
  getRoomManage: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      return prisma.roomManage.findUnique({
        where: { id: numId }
      });
    } catch (error) {
      console.error("Error fetching room manage record:", error);
      return null;
    }
  },
  
  getRoomManageByPage1Id: async (_, { page1Id }) => {
    try {
      const numPage1Id = parseInt(page1Id);
      return prisma.roomManage.findMany({
        where: { page1_id: numPage1Id },
        orderBy: { check_in_date: 'asc' }
      });
    } catch (error) {
      console.error("Error fetching room manage records by page1Id:", error);
      return [];
    }
  },
  
  getRoomManageByRoomId: async (_, { roomId }) => {
    try {
      const numRoomId = parseInt(roomId);
      return prisma.roomManage.findMany({
        where: { room_id: numRoomId },
        orderBy: { check_in_date: 'asc' }
      });
    } catch (error) {
      console.error("Error fetching room manage records by roomId:", error);
      return [];
    }
  },
  
  getRoomManageByDateRange: async (_, { startDate, endDate }) => {
    try {
      // Convert to Date objects
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();
      
      return prisma.roomManage.findMany({
        where: {
          OR: [
            // Check-in date is within the range, but not on the check-out date
            {
              check_in_date: {
                gt: start,
                lt: end
              }
            },
            // Middle dates within the range, but excluding exact check-out date matches
            {
              AND: [
                { check_in_date: { lt: start } },
                { check_out_date: { gt: start } }
              ]
            },
            // Start and end dates span over the room's booking
            {
              AND: [
                { check_in_date: { lt: start } },
                { check_out_date: { gt: start } }
              ]
            }
          ]
        },
        orderBy: [
          { room_id: 'asc' },
          { check_in_date: 'asc' }
        ]
      });
    } catch (error) {
      console.error("Error fetching room manage records by date range:", error);
      return [];
    }
  },
  
  getRoomAvailabilityStatus: async (_, { roomId, startDate, endDate }) => {
    try {
      const numRoomId = parseInt(roomId);
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();
      
      console.log(`[Room Status] 객실 ID ${numRoomId} 사용 가능 여부 확인 (${moment(start).format('YYYY-MM-DD')} ~ ${moment(end).format('YYYY-MM-DD')})`);
      
      // Check if there are any bookings for this room in the given date range
      const existingBookings = await prisma.roomManage.findMany({
        where: {
          room_id: numRoomId,
          status: { not: 'available' },
          OR: [
            // Check-in date is within the range, but not on the check-out date
            {
              check_in_date: {
                gt: start,
                lt: end
              }
            },
            // Middle dates are within the range (excluding the check-out date)
            {
              AND: [
                { check_in_date: { lt: start } },
                { check_out_date: { gt: start } }
              ]
            },
            // Start and end dates span over the room's booking (excluding the check-out date)
            {
              AND: [
                { check_in_date: { lt: start } },
                { check_out_date: { gt: start } }
              ]
            }
          ]
        }
      });
      
      console.log(`[Room Status] 객실 ID ${numRoomId} - 기존 예약 수: ${existingBookings.length}`);
      
      if (existingBookings.length > 0) {
        // Room is not available for the entire range
        // Find the first available date after the end date
        const lastBooking = existingBookings
          .sort((a, b) => b.check_out_date - a.check_out_date)[0];
        
        console.log(`[Room Status] 객실 ID ${numRoomId} - 해당 기간에 이미 예약됨. 다음 가능 날짜: ${moment(lastBooking.check_out_date).format('YYYY-MM-DD')}`);
        return `occupied:${moment(lastBooking.check_out_date).format('YYYY-MM-DD')}`;
      }
      
      // Check if the room exists and is generally available
      const room = await prisma.menuRoom.findUnique({
        where: { id: numRoomId }
      });
      
      if (!room || !room.is_available) {
        console.log(`[Room Status] 객실 ID ${numRoomId} - 객실이 존재하지 않거나 사용 불가 상태`);
        return 'unavailable';
      }
      
      console.log(`[Room Status] 객실 ID ${numRoomId} - 예약 가능`);
      return 'available';
    } catch (error) {
      console.error("Error checking room availability status:", error);
      console.log(`[Room Status] 객실 ID ${roomId} - 오류 발생: ${error.message}`);
      return 'error';
    }
  }
}; 