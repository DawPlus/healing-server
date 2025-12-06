const prisma = require('../../../prisma/prismaClient');
const moment = require('moment');

// Query resolvers for Page5
const page5Queries = {
  // Get calendar data for month/year
  getCalendarData: async (_, { month, year }) => {
    try {
      console.log(`Fetching calendar data for ${year}-${month}`);
      
      // Format the date range for the entire month
      const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
      
      // Get all Page1 entries that have dates overlapping with this month
      const reservations = await prisma.page1.findMany({
        where: {
          AND: [
            {
              OR: [
                // Start date falls within the month
                {
                  start_date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                  }
                },
                // End date falls within the month
                {
                  end_date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                  }
                },
                // Reservation spans the entire month
                {
                  AND: [
                    { start_date: { lte: new Date(startDate) } },
                    { end_date: { gte: new Date(endDate) } }
                  ]
                }
              ]
            }
          ]
        }
      });
      
      // Map the reservations to the calendar event format
      const events = reservations.map(reservation => {
        // Determine event color based on status
        let color;
        switch(reservation.reservation_status) {
          case 'confirmed':
            color = '#4CAF50'; // Green
            break;
          case 'preparation':
            color = '#FFC107'; // Amber
            break;
          default:
            color = '#2196F3'; // Blue
        }
        
        return {
          id: reservation.id,
          title: reservation.group_name || '미정',
          start: reservation.start_date ? moment(reservation.start_date).format('YYYY-MM-DD') : null,
          end: reservation.end_date ? moment(reservation.end_date).format('YYYY-MM-DD') : null,
          status: reservation.reservation_status,
          organization: reservation.group_name,
          contact: reservation.customer_name,
          color: color,
          page1_id: reservation.id
        };
      });
      
      return events;
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw new Error(`Failed to fetch calendar data: ${error.message}`);
    }
  },
  
  // Get statistics data for reports
  getStatistics: async (_, { period, type }) => {
    try {
      console.log(`[getStatistics] Fetching statistics for ${period}, type: ${type}`);
      
      // Extract year and month from period (format: YYYY-MM)
      const [year, month] = period.split('-');
      
      // Format date range based on the type (monthly or daily)
      let startDate, endDate;
      if (type === 'monthly') {
        startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
        endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
      } else {
        // For daily statistics, use the date provided
        startDate = moment(period).format('YYYY-MM-DD');
        endDate = moment(period).format('YYYY-MM-DD');
      }

      console.log(`[getStatistics] Searching reservations between ${startDate} and ${endDate}`);
      
      // Get all relevant Page1 entries with related Page2, Page3, and Page4 data
      const reservations = await prisma.page1.findMany({
        where: {
              OR: [
                // Start date falls within the range
                {
                  start_date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                  }
                },
                // End date falls within the range
                {
                  end_date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                  }
                },
                // Reservation spans the entire range
                {
                  AND: [
                    { start_date: { lte: new Date(startDate) } },
                    { end_date: { gte: new Date(endDate) } }
              ]
            }
          ]
        },
        include: {
          page2_reservations: {
            include: {
              programs: true // Include programs directly
            }
          },
          page3: true,
          page4_expenses: true
        }
      });

      console.log(`[getStatistics] Found ${reservations.length} reservations`);
      
      // Calculate total reservations and revenue
      const totalReservations = reservations.length;
      
      // Initialize category breakdowns
      const categories = [
        { name: '숙박', value: 0, count: 0, percentage: 0 },
        { name: '식사', value: 0, count: 0, percentage: 0 },
        { name: '프로그램', value: 0, count: 0, percentage: 0 },
        { name: '대관', value: 0, count: 0, percentage: 0 }
      ];
      
      // Initialize organizations data
      const organizationsMap = new Map();
      
      // Initialize daily data
      const dailyDataMap = new Map();
      
      // Calculate the number of days in the period for daily stats
      const daysInMonth = moment(endDate).diff(moment(startDate), 'days') + 1;
      
      // Initialize daily data for each day in the period
      for (let i = 0; i < daysInMonth; i++) {
        const currentDate = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
        dailyDataMap.set(currentDate, { date: currentDate, count: 0, value: 0 });
      }
      
      // Process each reservation to extract statistics
      let totalRevenue = 0;
      let totalNights = 0;
      
      reservations.forEach(reservation => {
        console.log(`[getStatistics] Processing reservation ID: ${reservation.id}, Group: ${reservation.group_name}`);
        // Get organization name
        const orgName = reservation.group_name || '기타';
        
        // Initialize organization data if not exists
        if (!organizationsMap.has(orgName)) {
          organizationsMap.set(orgName, { 
            name: orgName, 
            reservations_count: 0, 
            total_revenue: 0,
            percentage: 0
          });
        }
        
        // Get organization data
        const orgData = organizationsMap.get(orgName);
        orgData.reservations_count++;
        
        // Calculate revenue from Page4 if available
        let reservationRevenue = 0;
        if (reservation.page4_expenses && reservation.page4_expenses.length > 0) {
          reservation.page4_expenses.forEach(expense => {
            const expenseAmount = parseFloat(expense.total_budget || 0);
            reservationRevenue += expenseAmount;
            console.log(`[getStatistics] Found expense: ${expenseAmount}`);
          });
        }
        
        // If no Page4 data, calculate from components - parsing JSON fields
        if (reservationRevenue === 0 && reservation.page3) {
          console.log(`[getStatistics] No page4 expenses, calculating from components for reservation ${reservation.id}`);
          
          try {
          // Parse JSON fields if they are strings
            let roomSelections = [];
            try {
              if (reservation.page3.room_selections) {
                if (typeof reservation.page3.room_selections === 'string') {
                  roomSelections = JSON.parse(reservation.page3.room_selections);
                } else if (Array.isArray(reservation.page3.room_selections)) {
                  roomSelections = reservation.page3.room_selections;
                }
                console.log(`[getStatistics] Found ${roomSelections.length} room selections`);
              }
            } catch (e) {
              console.error(`[getStatistics] Error parsing room_selections for reservation ${reservation.id}:`, e);
              roomSelections = [];
            }
            
            let mealPlans = [];
            try {
              if (reservation.page3.meal_plans) {
                if (typeof reservation.page3.meal_plans === 'string') {
                  mealPlans = JSON.parse(reservation.page3.meal_plans);
                } else if (Array.isArray(reservation.page3.meal_plans)) {
                  mealPlans = reservation.page3.meal_plans;
                }
                console.log(`[getStatistics] Found ${mealPlans.length} meal plans`);
              }
            } catch (e) {
              console.error(`[getStatistics] Error parsing meal_plans for reservation ${reservation.id}:`, e);
              mealPlans = [];
            }
            
            let placeReservations = [];
            try {
              if (reservation.page3.place_reservations) {
                if (typeof reservation.page3.place_reservations === 'string') {
                  placeReservations = JSON.parse(reservation.page3.place_reservations);
                } else if (Array.isArray(reservation.page3.place_reservations)) {
                  placeReservations = reservation.page3.place_reservations;
                }
                console.log(`[getStatistics] Found ${placeReservations.length} place reservations`);
              }
            } catch (e) {
              console.error(`[getStatistics] Error parsing place_reservations for reservation ${reservation.id}:`, e);
              placeReservations = [];
            }
          
          // Calculate from room selections
          roomSelections.forEach(room => {
              if (!room) return;
              
              const roomPrice = parseFloat(room.price || 0);
              const nights = parseInt(room.nights || 1);
              const roomTotal = roomPrice * nights;
              
              categories[0].value += roomTotal;
            categories[0].count++;
              reservationRevenue += roomTotal;
              
              console.log(`[getStatistics] Room: ${room.room_name}, Price: ${roomPrice}, Nights: ${nights}, Total: ${roomTotal}`);
            
            // Track nights for average stay calculation
              totalNights += nights;
          });
          
          // Calculate from meal plans
          mealPlans.forEach(meal => {
              if (!meal) return;
              
              const mealPrice = parseFloat(meal.price || 0);
              const participants = parseInt(meal.participants || 0);
              const mealTotal = mealPrice;
              
              categories[1].value += mealTotal;
            categories[1].count++;
              reservationRevenue += mealTotal;
              
              console.log(`[getStatistics] Meal: ${meal.meal_type}, Price: ${mealPrice}, Participants: ${participants}, Total: ${mealTotal}`);
          });
          
          // Calculate from programs
          if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
            reservation.page2_reservations.forEach(page2 => {
                let programs = [];
                
                try {
              if (page2.programs) {
                    if (typeof page2.programs === 'string') {
                      programs = JSON.parse(page2.programs);
                    } else if (Array.isArray(page2.programs)) {
                      programs = page2.programs;
                    }
                  }
                
                programs.forEach(program => {
                    if (!program) return;
                    
                    // Safely get the program price
                    const programPrice = parseFloat(program.price || 0);
                    const participants = parseInt(program.participants || 0);
                    const programTotal = programPrice;
                    
                    categories[2].value += programTotal;
                  categories[2].count++;
                    reservationRevenue += programTotal;
                    
                    console.log(`[getStatistics] Program: ${program.program_name}, Price: ${programPrice}, Participants: ${participants}, Total: ${programTotal}`);
                });
                } catch (e) {
                  console.error(`[getStatistics] Error processing programs for reservation ${reservation.id}:`, e);
              }
            });
          }
          
          // Calculate from place reservations
          placeReservations.forEach(place => {
              if (!place) return;
              
              const placePrice = parseFloat(place.price || 0);
              const placeTotal = placePrice;
              
              categories[3].value += placeTotal;
            categories[3].count++;
              reservationRevenue += placeTotal;
              
              console.log(`[getStatistics] Place: ${place.place_name}, Price: ${placePrice}, Total: ${placeTotal}`);
          });
          } catch (error) {
            console.error(`[getStatistics] Error processing page3 data for reservation ${reservation.id}:`, error);
          }
        }
        
        console.log(`[getStatistics] Total revenue for reservation ${reservation.id}: ${reservationRevenue}`);
        
        // Update organization revenue
        orgData.total_revenue += reservationRevenue;
        
        // Update total revenue
        totalRevenue += reservationRevenue;
        
        // Update daily data
        try {
        // For each day in the reservation period, increment the count and value
          const reservationStart = moment(reservation.start_date || startDate);
          const reservationEnd = moment(reservation.end_date || endDate);
          const reservationDays = Math.max(1, reservationEnd.diff(reservationStart, 'days') + 1);
        const revenuePerDay = reservationRevenue / reservationDays;
        
        for (let i = 0; i < reservationDays; i++) {
          const currentDate = moment(reservationStart).add(i, 'days').format('YYYY-MM-DD');
          // Only include if within our query period
          if (dailyDataMap.has(currentDate)) {
            const dayData = dailyDataMap.get(currentDate);
            dayData.count++;
            dayData.value += revenuePerDay;
          }
          }
        } catch (error) {
          console.error(`[getStatistics] Error updating daily data for reservation ${reservation.id}:`, error);
        }
      });
      
      // Calculate average stay
      const averageStay = totalReservations ? totalNights / totalReservations : 0;
      
      // Calculate percentages for categories
      categories.forEach(category => {
        category.percentage = totalRevenue ? (category.value / totalRevenue) * 100 : 0;
      });
      
      // Calculate percentages for organizations and sort by revenue
      const organizations = Array.from(organizationsMap.values());
      organizations.forEach(org => {
        org.percentage = totalRevenue ? (org.total_revenue / totalRevenue) * 100 : 0;
      });
      organizations.sort((a, b) => b.total_revenue - a.total_revenue);
      
      // Convert daily data to array
      const dailyData = Array.from(dailyDataMap.values());
      dailyData.sort((a, b) => moment(a.date).diff(moment(b.date)));
      
      console.log(`[getStatistics] Final statistics - Total Reservations: ${totalReservations}, Total Revenue: ${totalRevenue}`);
      console.log(`[getStatistics] Categories: ${JSON.stringify(categories)}`);
      
      return {
        period,
        type,
        totalReservations,
        totalRevenue,
        averageStay,
        categories,
        organizations,
        dailyData
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  },
  
  // Get schedule data for calendar view
  getScheduleData: async (_, { startDate, endDate }) => {
    try {
      console.log(`Fetching schedule data from ${startDate} to ${endDate}`);
      
      // Get all reservations within the date range
      const reservations = await prisma.page1.findMany({
        where: {
          AND: [
            {
              OR: [
                // Start date falls within the range
                {
                  start_date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                  }
                },
                // End date falls within the range
                {
                  end_date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                  }
                },
                // Reservation spans the entire range
                {
                  AND: [
                    { start_date: { lte: new Date(startDate) } },
                    { end_date: { gte: new Date(endDate) } }
                  ]
                }
              ]
            }
          ]
        },
        include: {
          page2_reservations: true,  // Changed from page2 to page2_reservations
          page3: true   // Include page3 data
        }
      });
      
      // Calculate the number of days in the date range
      const daysInRange = moment(endDate).diff(moment(startDate), 'days') + 1;
      
      // Initialize the schedule data for each day
      const scheduleData = [];
      for (let i = 0; i < daysInRange; i++) {
        const currentDate = moment(startDate).add(i, 'days').format('YYYY-MM-DD');
        scheduleData.push({
          date: currentDate,
          programs: [],
          rooms: [],
          meals: [],
          places: []
        });
      }
      
      // Process each reservation
      reservations.forEach(reservation => {
        const orgName = reservation.group_name || '기타';
        
        // Process programs
        if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
          reservation.page2_reservations.forEach(page2 => {
            if (page2.programs) {
              const programsList = Array.isArray(page2.programs) ? page2.programs : 
                (typeof page2.programs === 'string' ? JSON.parse(page2.programs || '[]') : []);
              
              programsList.forEach(program => {
                // Check if program date is within range
                if (program.date) {
                  const programDate = moment(program.date).format('YYYY-MM-DD');
                  // Find the right day in scheduleData
                  const dayIndex = moment(programDate).diff(moment(startDate), 'days');
                  if (dayIndex >= 0 && dayIndex < scheduleData.length) {
                    scheduleData[dayIndex].programs.push({
                      id: program.id,
                      program_name: program.program_name,
                      organization: orgName,
                      start_time: program.start_time,
                      end_time: program.end_time,
                      location: program.place_name,
                      participants: page2.total_count || 0
                    });
                  }
                }
              });
            }
          });
        }
        
        // Process room selections
        if (reservation.page3 && reservation.page3.room_selections) {
          // Parse room_selections if it's a string
          const roomSelections = typeof reservation.page3.room_selections === 'string'
            ? JSON.parse(reservation.page3.room_selections || '[]')
            : (reservation.page3.room_selections || []);
          
          roomSelections.forEach(room => {
            if (room.check_in_date && room.check_out_date) {
              const checkInDate = moment(room.check_in_date);
              const checkOutDate = moment(room.check_out_date);
              
              // For each day the room is occupied
              for (let date = moment(checkInDate); date.isBefore(checkOutDate); date.add(1, 'days')) {
                const currentDate = date.format('YYYY-MM-DD');
                const dayIndex = moment(currentDate).diff(moment(startDate), 'days');
                
                if (dayIndex >= 0 && dayIndex < scheduleData.length) {
                  scheduleData[dayIndex].rooms.push({
                    id: room.id,
                    room_name: room.room_name,
                    organization: orgName,
                    check_in: room.check_in_date,
                    check_out: room.check_out_date,
                    occupancy: room.occupancy || 0
                  });
                }
              }
            }
          });
        }
        
        // Process meal plans
        if (reservation.page3 && reservation.page3.meal_plans) {
          // Parse meal_plans if it's a string
          const mealPlans = typeof reservation.page3.meal_plans === 'string'
            ? JSON.parse(reservation.page3.meal_plans || '[]')
            : (reservation.page3.meal_plans || []);
          
          mealPlans.forEach(meal => {
            if (meal.date) {
              const mealDate = moment(meal.date).format('YYYY-MM-DD');
              const dayIndex = moment(mealDate).diff(moment(startDate), 'days');
              
              if (dayIndex >= 0 && dayIndex < scheduleData.length) {
                scheduleData[dayIndex].meals.push({
                  id: meal.id,
                  meal_type: meal.meal_type,
                  organization: orgName,
                  time: meal.meal_type === 'breakfast' ? '08:00' : 
                        meal.meal_type === 'lunch' ? '12:00' : 
                        meal.meal_type === 'dinner' ? '18:00' : '',
                  participants: meal.participants || 0,
                  location: '식당'
                });
              }
            }
          });
        }
        
        // Process place reservations
        if (reservation.page3 && reservation.page3.place_reservations) {
          // Parse place_reservations if it's a string
          const placeReservations = typeof reservation.page3.place_reservations === 'string'
            ? JSON.parse(reservation.page3.place_reservations || '[]')
            : (reservation.page3.place_reservations || []);
          
          placeReservations.forEach(place => {
            if (place.reservation_date) {
              const placeDate = moment(place.reservation_date).format('YYYY-MM-DD');
              const dayIndex = moment(placeDate).diff(moment(startDate), 'days');
              
              if (dayIndex >= 0 && dayIndex < scheduleData.length) {
                scheduleData[dayIndex].places.push({
                  id: place.id,
                  place_name: place.place_name,
                  organization: orgName,
                  start_time: place.start_time,
                  end_time: place.end_time,
                  purpose: place.purpose,
                  participants: place.participants || 0
                });
              }
            }
          });
        }
      });
      
      return scheduleData;
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      throw new Error(`Failed to fetch schedule data: ${error.message}`);
    }
  },
  
  // Get Page5 documents
  getPage5Documents: async (_, { page1Id }) => {
    try {
      const whereClause = page1Id ? { page1_id: page1Id } : {};
      
      const documents = await prisma.page5Document.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' }
      });
      
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  },
  
  // Get Page5 document by ID
  getPage5DocumentById: async (_, { id }) => {
    try {
      const document = await prisma.page5Document.findUnique({
        where: { id }
      });
      
      if (!document) {
        throw new Error(`Document with id ${id} not found`);
      }
      
      return document;
    } catch (error) {
      console.error('Error fetching document by ID:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  }
};

module.exports = page5Queries;
