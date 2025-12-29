const prisma = require('../../../prisma/prismaClient');
const moment = require('moment');

module.exports = {
  createOrUpdatePage3: async (_, { input }, context) => {
    const { page1_id, id } = input;
    const user = context.req.session?.userInfo?.user_name || 'admin';
    
    // Ensure numeric page1_id and id
    const numPage1Id = parseInt(page1_id);
    
    // Process and sanitize input data
    const processInputArrays = (array) => {
      if (!array || !Array.isArray(array)) return [];
      
      return array.map((item, index) => {
        // First, check if item is valid
        if (!item) {
          return {
            id: `generated_${index}_${Date.now()}`
          };
        }
        
        // If item has no id at all, generate one
        if (item.id === null || item.id === undefined) {
          return {
            ...item,
            id: `generated_${index}_${Date.now()}`
          };
        }
        
        // Rest of the processing remains the same
        if (item.id && typeof item.id === 'string' && item.id.startsWith('temp_')) {
          // Keep the item as is for JSON storage
          return item;
        }
        
        // If it's a numeric ID, keep it as is
        if (item.id && !isNaN(parseInt(item.id))) {
          return {
            ...item,
            id: parseInt(item.id)
          };
        }
        
        // Default return the item as-is
        return item;
      });
    };
    
    // Create a cleaned and processed input object
    const processedInput = {
      ...input,
      // Remove the id field entirely - we don't want to update it
      id: undefined,
      page1_id: numPage1Id,
      room_selections: processInputArrays(input.room_selections || []),
      meal_plans: processInputArrays(input.meal_plans || []),
      place_reservations: processInputArrays(input.place_reservations || [])
    };
    
    let result;
    
    try {
      // Start a transaction to handle all operations
      // Use an interactive transaction instead of callback-style transaction
      const tx = prisma.$transaction;
      
      // First, check if record already exists
      const existingPage3 = await prisma.page3.findUnique({
        where: { page1_id: numPage1Id },
      });
      
      let updatedPage3;
      
      if (existingPage3) {
        // Update existing record
        updatedPage3 = await prisma.page3.update({
          where: { page1_id: numPage1Id },
          data: {
            ...processedInput,
            update_user: user,
          },
          include: {
            page1: true,
          }
        });
      } else {
        // Create new record
        updatedPage3 = await prisma.page3.create({
          data: {
            ...processedInput,
            create_user: user,
            update_user: user,
          },
          include: {
            page1: true,
          }
        });
      }
      
      // Delete any existing reservations for this page1_id
      await prisma.project3Reservation.deleteMany({
        where: { page1_id: numPage1Id }
      });
      
      // Now create reservations based on selections
      
      // Process room selections
      if (processedInput.room_selections && processedInput.room_selections.length > 0) {
        for (const room of processedInput.room_selections) {
          const roomId = parseInt(room.room_id);
          
          if (roomId) {
            try {
              // Get organization name from page1 or input
              const page1 = await prisma.page1.findUnique({
                where: { id: numPage1Id },
                select: { group_name: true }
              });
              
              const orgName = page1?.group_name || processedInput.company_name || '';
              
              // Create or update RoomManage record for this room selection
              if (room.check_in_date && room.check_out_date) {
                // Calculate number of nights
                const checkInDate = moment(room.check_in_date);
                const checkOutDate = moment(room.check_out_date);
                const nights = checkOutDate.diff(checkInDate, 'days');
                
                // Check if a RoomManage record already exists
                const existingRoomManage = await prisma.roomManage.findFirst({
                  where: {
                    page1_id: numPage1Id,
                    room_id: roomId
                  }
                });
                
                if (existingRoomManage) {
                  // Update existing record
                  await prisma.roomManage.update({
                    where: { id: existingRoomManage.id },
                    data: {
                      check_in_date: new Date(room.check_in_date),
                      check_out_date: new Date(room.check_out_date),
                      organization_name: orgName,
                      status: 'occupied',
                      occupancy: room.occupancy || 1,
                      price: parseInt(room.price) || 0,
                      total_price: parseInt(room.total_price) || 0,
                      capacity: room.capacity || 2,
                      nights: nights || 1,
                      notes: room.notes || ''
                    }
                  });
                  console.log(`Updated RoomManage record for page1_id ${numPage1Id}, room_id ${roomId}`);
                } else {
                  // Create new record
                  await prisma.roomManage.create({
                    data: {
                      page1_id: numPage1Id,
                      room_id: roomId,
                      check_in_date: new Date(room.check_in_date),
                      check_out_date: new Date(room.check_out_date),
                      organization_name: orgName,
                      status: 'occupied',
                      occupancy: room.occupancy || 1,
                      price: parseInt(room.price) || 0,
                      total_price: parseInt(room.total_price) || 0,
                      capacity: room.capacity || 2,
                      nights: nights || 1,
                      notes: room.notes || ''
                    }
                  });
                  console.log(`Created new RoomManage record for page1_id ${numPage1Id}, room_id ${roomId}`);
                }
              }
              
              // Check if the room exists in Project3Room
              const roomExists = await prisma.project3Room.findUnique({
                where: { id: roomId }
              });
              
              if (roomExists) {
                await prisma.project3Reservation.create({
                  data: {
                    page1_id: numPage1Id,
                    room_id: roomId,
                    total_amount: parseFloat(room.total_price) || 0.00
                  }
                });
              } else {
                console.warn(`Skipping reservation creation for room_id ${roomId} - room does not exist`);
              }
            } catch (err) {
              console.error(`Error creating room reservation: ${err.message}`);
              // Continue processing other items even if one fails
            }
          }
        }
        
        // Delete RoomManage records that are no longer in the selection
        try {
          // Get all current room selections
          const currentRoomIds = processedInput.room_selections
            .map(r => parseInt(r.room_id))
            .filter(id => id);
          
          // Get all existing RoomManage records for this page1_id
          const existingRoomManage = await prisma.roomManage.findMany({
            where: { page1_id: numPage1Id }
          });
          
          // Delete records for rooms that are no longer selected
          for (const record of existingRoomManage) {
            if (!currentRoomIds.includes(record.room_id)) {
              await prisma.roomManage.delete({
                where: { id: record.id }
              });
              console.log(`Deleted RoomManage record for page1_id ${numPage1Id}, room_id ${record.room_id}`);
            }
          }
        } catch (err) {
          console.error(`Error cleaning up unused RoomManage records: ${err.message}`);
        }
      }
      
      // Process meal plans
      if (processedInput.meal_plans && processedInput.meal_plans.length > 0) {
        for (const meal of processedInput.meal_plans) {
          try {
            if (meal.meal_option_id || meal.meal_option) {
              // Try to get meal_option_id first, fallback to meal_option if needed
              let mealOptionId;
              try {
                if (meal.meal_option_id) {
                  mealOptionId = parseInt(meal.meal_option_id);
                } else if (meal.meal_option) {
                  // If we have meal_option but not id, try to find the matching meal option
                  const mealOption = await prisma.project3MealOption.findFirst({
                    where: { meal_option: meal.meal_option }
                  });
                  if (mealOption) {
                    mealOptionId = mealOption.id;
                  } else {
                    console.warn(`Could not find meal option with name: ${meal.meal_option}`);
                    continue; // Skip this meal
                  }
                }
                
                if (isNaN(mealOptionId)) {
                  console.warn(`Invalid meal_option_id: ${meal.meal_option_id || meal.meal_option}, not a valid integer`);
                  continue; // Skip this meal
                }
              } catch (parseError) {
                console.error(`Error parsing meal_option_id: ${meal.meal_option_id || meal.meal_option}`, parseError);
                continue; // Skip this meal
              }
              
              // Check if the meal option exists before creating the reservation
              const existingMealOption = await prisma.project3MealOption.findUnique({
                where: { id: mealOptionId }
              });
              
              if (existingMealOption) {
                await prisma.project3Reservation.create({
                  data: {
                    page1_id: numPage1Id,
                    meal_option_id: mealOptionId,
                    total_amount: parseFloat(meal.price) || 0.00
                  }
                });
              } else {
                console.warn(`Skipping reservation creation for meal_option_id ${mealOptionId} - meal option does not exist`);
              }
            }
          } catch (err) {
            console.error(`Error creating meal reservation: ${err.message}`);
            // Continue processing other items even if one fails
          }
        }
      }
      
      // Process place reservations
      if (processedInput.place_reservations && processedInput.place_reservations.length > 0) {
        // 장소 예약 시간 중복 검사 (동일 장소, 동일 일자, 시간 겹침 체크)
        // 먼저 현재 요청의 장소 예약 시간 중복을 검사
        const placeReservations = processedInput.place_reservations;
        
        // 중복 체크 - 내부 예약 내에서 시간 겹침 확인
        for (let i = 0; i < placeReservations.length; i++) {
          const reservation1 = placeReservations[i];
          const place1Id = parseInt(reservation1.place_id);
          const date1 = reservation1.reservation_date;
          const start1 = reservation1.start_time;
          const end1 = reservation1.end_time;
          
          // 다른 모든 예약과 비교
          for (let j = i + 1; j < placeReservations.length; j++) {
            const reservation2 = placeReservations[j];
            const place2Id = parseInt(reservation2.place_id);
            const date2 = reservation2.reservation_date;
            const start2 = reservation2.start_time;
            const end2 = reservation2.end_time;
            
            // 같은 장소이고 같은 날짜일 때만 시간 중복 확인
            if (place1Id === place2Id && date1 === date2) {
              // 시간 중복 확인
              // (시작1 <= 종료2) && (종료1 >= 시작2) -> 중복
              const isOverlapping = 
                (start1 <= end2 && end1 >= start2);
              
              if (isOverlapping) {
                throw new Error(`장소 예약 시간이 중복됩니다: ${reservation1.place_name || '장소'}, ${date1}, ${start1}~${end1} / ${start2}~${end2}`);
              }
            }
          }
        }
        
        // 기존 다른 예약과의 중복 체크
        for (const place of processedInput.place_reservations) {
          try {
            // 장소 ID 파싱
            let placeId;
            try {
              placeId = parseInt(place.place_id);
              if (isNaN(placeId)) {
                console.warn(`Invalid place_id: ${place.place_id}, not a valid integer`);
                continue; // Skip this place
              }
            } catch (parseError) {
              console.error(`Error parsing place_id: ${place.place_id}`, parseError);
              continue; // Skip this place
            }
            
            // 동일 장소, 동일 날짜에 이미 예약된 다른 예약이 있는지 확인
            const existingReservations = await prisma.page3.findMany({
              where: {
                page1_id: { not: numPage1Id }, // 자신의 예약은 제외
                place_reservations: {
                  path: '$[*].place_id',
                  equals: placeId.toString()
                }
              },
              select: {
                page1_id: true,
                page1: {
                  select: {
                    group_name: true
                  }
                },
                place_reservations: true
              }
            });
            
            // 각 예약에서 동일 장소, 동일 날짜, 시간 겹침 확인
            for (const existingReservation of existingReservations) {
              // JSON 데이터 파싱
              let placeReservations = [];
              try {
                placeReservations = typeof existingReservation.place_reservations === 'string'
                  ? JSON.parse(existingReservation.place_reservations)
                  : existingReservation.place_reservations;
              } catch (e) {
                console.error('Error parsing place_reservations:', e);
                continue;
              }
              
              // 동일 장소, 동일 날짜 예약 필터링
              const matchingPlaceReservations = placeReservations.filter(r => 
                parseInt(r.place_id) === placeId && 
                r.reservation_date === place.reservation_date
              );
              
              // 시간 중복 확인
              for (const existingPlace of matchingPlaceReservations) {
                const start1 = place.start_time;
                const end1 = place.end_time;
                const start2 = existingPlace.start_time;
                const end2 = existingPlace.end_time;
                
                // 시간 중복 확인
                // (시작1 <= 종료2) && (종료1 >= 시작2) -> 중복
                const isOverlapping = 
                  (start1 <= end2 && end1 >= start2);
                
                if (isOverlapping) {
                  const groupName = existingReservation.page1?.group_name || '다른 단체';
                  throw new Error(`장소 예약 시간이 다른 예약과 중복됩니다: ${place.place_name || '장소'}, ${place.reservation_date}, ${start1}~${end1} (${groupName}의 예약과 충돌)`);
                }
              }
            }
            
            // 장소 존재 여부 확인 및 예약 생성
            const existingPlace = await prisma.project3Place.findUnique({
              where: { id: placeId }
            });
            
            if (existingPlace) {
              await prisma.project3Reservation.create({
                data: {
                  page1_id: numPage1Id,
                  place_id: placeId,
                  total_amount: parseFloat(place.price) || 0.00
                }
              });
            } else {
              console.warn(`Skipping reservation creation for place_id ${placeId} - place does not exist`);
            }
          } catch (err) {
            console.error(`Error creating place reservation: ${err.message}`);
            throw new Error(`장소 예약 저장 중 오류: ${err.message}`);
          }
        }
      }
      
      result = updatedPage3;
      return result;
    } catch (error) {
      console.error('Error in createOrUpdatePage3:', error);
      throw new Error(`Failed to save Page3 data: ${error.message}`);
    }
  },
  
  deletePage3: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      
      // Get the page1_id first
      const page3 = await prisma.page3.findUnique({
        where: { id: numId },
        select: { page1_id: true }
      });
      
      if (page3) {
        // Use transaction to delete both Page3 and its related reservations
        await prisma.$transaction([
          // Delete related reservations
          prisma.project3Reservation.deleteMany({
            where: { page1_id: page3.page1_id }
          }),
          // Delete the page3 record
          prisma.page3.delete({
            where: { id: numId }
          })
        ]);
      } else {
        // Just delete the page3 record
        await prisma.page3.delete({
          where: { id: numId }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error in deletePage3:', error);
      return false;
    }
  },
  
  deletePage3ByPage1Id: async (_, { page1Id }) => {
    try {
      const numPage1Id = parseInt(page1Id);
      
      // Use transaction to delete both Page3 and its related reservations
      await prisma.$transaction([
        // Delete related reservations
        prisma.project3Reservation.deleteMany({
          where: { page1_id: numPage1Id }
        }),
        // Delete the page3 record
        prisma.page3.delete({
          where: { page1_id: numPage1Id }
        })
      ]);
      
      return true;
    } catch (error) {
      console.error('Error in deletePage3ByPage1Id:', error);
      return false;
    }
  },
  
  // CRUD operations for Project3Room
  createRoom: async (_, { input }) => {
    try {
      const newRoom = await prisma.project3Room.create({
        data: {
          name: input.name,
          room_type: input.room_type,
          capacity: parseInt(input.capacity) || 2,
          price_per_night: parseFloat(input.price_per_night) || 0,
          description: input.description,
          is_active: input.is_active !== undefined ? input.is_active : true
        }
      });
      
      return {
        ...newRoom,
        price_per_night: parseFloat(newRoom.price_per_night)
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  },
  
  // CRUD operations for Project3Place
  createPlace: async (_, { input }) => {
    try {
      const newPlace = await prisma.project3Place.create({
        data: {
          name: input.name,
          capacity: parseInt(input.capacity) || 0,
          price_per_hour: parseFloat(input.price_per_hour) || 0,
          description: input.description,
          is_active: input.is_active !== undefined ? input.is_active : true
        }
      });
      
      return {
        ...newPlace,
        price_per_hour: parseFloat(newPlace.price_per_hour)
      };
    } catch (error) {
      console.error('Error creating place:', error);
      throw new Error(`Failed to create place: ${error.message}`);
    }
  },
  
  // CRUD operations for Project3MealOption
  createMealOption: async (_, { input }) => {
    try {
      const newMealOption = await prisma.project3MealOption.create({
        data: {
          meal_type: input.meal_type,
          meal_option: input.meal_option,
          price_per_person: parseFloat(input.price_per_person) || 0,
          ingredient_cost: parseFloat(input.ingredient_cost) || 0,
          description: input.description,
          is_active: input.is_active !== undefined ? input.is_active : true
        }
      });
      
      return {
        ...newMealOption,
        price_per_person: parseFloat(newMealOption.price_per_person),
        ingredient_cost: parseFloat(newMealOption.ingredient_cost || 0)
      };
    } catch (error) {
      console.error('Error creating meal option:', error);
      throw new Error(`Failed to create meal option: ${error.message}`);
    }
  },
  
  updateRoom: async (_, { id, input }) => {
    try {
      const numId = parseInt(id);
      const updatedRoom = await prisma.project3Room.update({
        where: { id: numId },
        data: {
          name: input.name,
          room_type: input.room_type,
          capacity: parseInt(input.capacity) || 2,
          price_per_night: parseFloat(input.price_per_night) || 0,
          description: input.description,
          is_active: input.is_active !== undefined ? input.is_active : true
        }
      });
      
      return {
        ...updatedRoom,
        price_per_night: parseFloat(updatedRoom.price_per_night)
      };
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error(`Failed to update room: ${error.message}`);
    }
  },
  
  deleteRoom: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      await prisma.project3Room.delete({
        where: { id: numId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  },
  
  updatePlace: async (_, { id, input }) => {
    try {
      const numId = parseInt(id);
      const updatedPlace = await prisma.project3Place.update({
        where: { id: numId },
        data: {
          name: input.name,
          capacity: parseInt(input.capacity) || 0,
          price_per_hour: parseFloat(input.price_per_hour) || 0,
          description: input.description,
          is_active: input.is_active !== undefined ? input.is_active : true
        }
      });
      
      return {
        ...updatedPlace,
        price_per_hour: parseFloat(updatedPlace.price_per_hour)
      };
    } catch (error) {
      console.error('Error updating place:', error);
      throw new Error(`Failed to update place: ${error.message}`);
    }
  },
  
  deletePlace: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      await prisma.project3Place.delete({
        where: { id: numId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting place:', error);
      return false;
    }
  },
  
  updateMealOption: async (_, { id, input }) => {
    try {
      const numId = parseInt(id);
      
      // Validate meal type
      const validMealTypes = ['breakfast', 'lunch', 'lunch_box', 'dinner', 'dinner_special_a', 'dinner_special_b'];
      if (!validMealTypes.includes(input.meal_type)) {
        throw new Error(`Invalid meal_type: ${input.meal_type}. Must be one of: ${validMealTypes.join(', ')}`);
      }
      
      // Check existing option to record the change
      const existingOption = await prisma.project3MealOption.findUnique({
        where: { id: numId }
      });
      
      if (!existingOption) {
        throw new Error(`Meal option with ID ${numId} not found`);
      }
      
      // Check if this is a special dinner option
      const isSpecialDinner = input.meal_type === 'dinner' && (
        input.meal_option.includes('특식') || 
        input.meal_option.includes('special')
      );
      
      // Update the meal option
      const updatedMealOption = await prisma.project3MealOption.update({
        where: { id: numId },
        data: {
          meal_type: input.meal_type,
          meal_option: input.meal_option,
          price_per_person: parseFloat(input.price_per_person) || 0,
          ingredient_cost: parseFloat(input.ingredient_cost) || existingOption.ingredient_cost || 0,
          description: input.description || existingOption.description,
          is_active: input.is_active !== undefined ? input.is_active : existingOption.is_active
        }
      });
      
      console.log(`Updated meal option ${numId}: ${updatedMealOption.meal_type} - ${updatedMealOption.meal_option}, price changed from ${parseFloat(existingOption.price_per_person)} to ${parseFloat(updatedMealOption.price_per_person)}, ingredient cost changed from ${parseFloat(existingOption.ingredient_cost || 0)} to ${parseFloat(updatedMealOption.ingredient_cost || 0)}`);
      
      return {
        ...updatedMealOption,
        price_per_person: parseFloat(updatedMealOption.price_per_person),
        ingredient_cost: parseFloat(updatedMealOption.ingredient_cost || 0)
      };
    } catch (error) {
      console.error('Error updating meal option:', error);
      throw new Error(`Failed to update meal option: ${error.message}`);
    }
  },
  
  deleteMealOption: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      await prisma.project3MealOption.delete({
        where: { id: numId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting meal option:', error);
      return false;
    }
  },
  
  // Participant Room mutations
  createParticipantRoom: async (_, { input }) => {
    try {
      const { page1_id, room_type, count } = input;
      const numPage1Id = parseInt(page1_id);
      
      // Create the participant room record
      const participantRoom = await prisma.participantRoom.create({
        data: {
          page1_id: numPage1Id,
          room_type,
          count: parseInt(count) || 0
        }
      });
      
      return participantRoom;
    } catch (error) {
      console.error('Error creating participant room:', error);
      throw new Error(`객실 참여자 데이터 생성 중 오류: ${error.message}`);
    }
  },
  
  updateParticipantRoom: async (_, { id, input }) => {
    try {
      const numId = parseInt(id);
      const numPage1Id = parseInt(input.page1_id);
      
      // Update the participant room record
      const updatedParticipantRoom = await prisma.participantRoom.update({
        where: { id: numId },
        data: {
          page1_id: numPage1Id,
          room_type: input.room_type,
          count: parseInt(input.count) || 0
        }
      });
      
      return updatedParticipantRoom;
    } catch (error) {
      console.error('Error updating participant room:', error);
      throw new Error(`객실 참여자 데이터 수정 중 오류: ${error.message}`);
    }
  },
  
  deleteParticipantRoom: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      
      // Delete the participant room record
      await prisma.participantRoom.delete({
        where: { id: numId }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting participant room:', error);
      return false;
    }
  },
  
  // Participant Meal mutations
  createParticipantMeal: async (_, { input }) => {
    try {
      const { page1_id, meal_type, count } = input;
      const numPage1Id = parseInt(page1_id);
      
      // Create the participant meal record
      const participantMeal = await prisma.participantMeal.create({
        data: {
          page1_id: numPage1Id,
          meal_type,
          count: parseInt(count) || 0
        }
      });
      
      return participantMeal;
    } catch (error) {
      console.error('Error creating participant meal:', error);
      throw new Error(`식사 참여자 데이터 생성 중 오류: ${error.message}`);
    }
  },
  
  updateParticipantMeal: async (_, { id, input }) => {
    try {
      const numId = parseInt(id);
      const numPage1Id = parseInt(input.page1_id);
      
      // Update the participant meal record
      const updatedParticipantMeal = await prisma.participantMeal.update({
        where: { id: numId },
        data: {
          page1_id: numPage1Id,
          meal_type: input.meal_type,
          count: parseInt(input.count) || 0
        }
      });
      
      return updatedParticipantMeal;
    } catch (error) {
      console.error('Error updating participant meal:', error);
      throw new Error(`식사 참여자 데이터 수정 중 오류: ${error.message}`);
    }
  },
  
  deleteParticipantMeal: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      await prisma.participantMeal.delete({
        where: { id: numId }
      });
      return true;
    } catch (error) {
      console.error("Error deleting participant meal:", error);
      return false;
    }
  },
  
  // Room Management mutations
  createRoomManage: async (_, { input }) => {
    try {
      const {
        page1_id,
        room_id,
        check_in_date,
        check_out_date,
        organization_name,
        status,
        occupancy,
        price,
        total_price,
        capacity,
        nights,
        notes
      } = input;
      
      // Calculate total price if not provided
      let calculatedTotalPrice = total_price;
      if (!calculatedTotalPrice && price && nights) {
        calculatedTotalPrice = price * nights;
      }
      
      // Calculate nights if not provided
      let calculatedNights = nights;
      if (!calculatedNights && check_in_date && check_out_date) {
        const startDate = moment(check_in_date);
        const endDate = moment(check_out_date);
        calculatedNights = endDate.diff(startDate, 'days');
      }
      
      const newRoomManage = await prisma.roomManage.create({
        data: {
          page1_id: parseInt(page1_id),
          room_id: parseInt(room_id),
          check_in_date: new Date(check_in_date),
          check_out_date: new Date(check_out_date),
          organization_name: organization_name || '',
          status: status || 'occupied',
          occupancy: occupancy || 1,
          price: price || 0,
          total_price: calculatedTotalPrice || 0,
          capacity: capacity || 2,
          nights: calculatedNights || 1,
          notes: notes || ''
        }
      });
      
      return newRoomManage;
    } catch (error) {
      console.error("Error creating room manage record:", error);
      throw new Error(`Failed to create room manage record: ${error.message}`);
    }
  },
  
  updateRoomManage: async (_, { id, input }) => {
    try {
      const numId = parseInt(id);
      const {
        page1_id,
        room_id,
        check_in_date,
        check_out_date,
        organization_name,
        status,
        occupancy,
        price,
        total_price,
        capacity,
        nights,
        notes
      } = input;
      
      // Get existing record to update only provided fields
      const existingRoomManage = await prisma.roomManage.findUnique({
        where: { id: numId }
      });
      
      if (!existingRoomManage) {
        throw new Error(`Room manage record with ID ${numId} not found`);
      }
      
      // Calculate total price if price or nights changed
      let calculatedTotalPrice = total_price;
      if (
        (price !== undefined && price !== existingRoomManage.price) || 
        (nights !== undefined && nights !== existingRoomManage.nights)
      ) {
        calculatedTotalPrice = (price || existingRoomManage.price) * 
          (nights || existingRoomManage.nights);
      }
      
      // Calculate nights if dates changed
      let calculatedNights = nights;
      if (
        (check_in_date !== undefined || check_out_date !== undefined) &&
        !nights
      ) {
        const startDate = check_in_date 
          ? moment(check_in_date) 
          : moment(existingRoomManage.check_in_date);
        const endDate = check_out_date 
          ? moment(check_out_date) 
          : moment(existingRoomManage.check_out_date);
        calculatedNights = endDate.diff(startDate, 'days');
      }
      
      const updatedRoomManage = await prisma.roomManage.update({
        where: { id: numId },
        data: {
          page1_id: page1_id !== undefined ? parseInt(page1_id) : undefined,
          room_id: room_id !== undefined ? parseInt(room_id) : undefined,
          check_in_date: check_in_date ? new Date(check_in_date) : undefined,
          check_out_date: check_out_date ? new Date(check_out_date) : undefined,
          organization_name: organization_name !== undefined ? organization_name : undefined,
          status: status !== undefined ? status : undefined,
          occupancy: occupancy !== undefined ? occupancy : undefined,
          price: price !== undefined ? price : undefined,
          total_price: calculatedTotalPrice !== undefined ? calculatedTotalPrice : undefined,
          capacity: capacity !== undefined ? capacity : undefined,
          nights: calculatedNights !== undefined ? calculatedNights : undefined,
          notes: notes !== undefined ? notes : undefined
        }
      });
      
      return updatedRoomManage;
    } catch (error) {
      console.error("Error updating room manage record:", error);
      throw new Error(`Failed to update room manage record: ${error.message}`);
    }
  },
  
  deleteRoomManage: async (_, { id }) => {
    try {
      const numId = parseInt(id);
      await prisma.roomManage.delete({
        where: { id: numId }
      });
      return true;
    } catch (error) {
      console.error("Error deleting room manage record:", error);
      return false;
    }
  }
}; 