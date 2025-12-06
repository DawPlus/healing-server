const prisma = require('../../../prisma/prismaClient');

module.exports = {
  // 프로그램 일정표 저장
  saveProgramSchedule: async (_, { programSchedule }) => {
    try {
      // 기존 프로그램 일정표가 있는지 확인
      const existingSchedule = await prisma.programSchedule.findFirst({
        where: {
          reservation_id: programSchedule.reservation_id
        }
      });
      
      if (existingSchedule) {
        // 기존 프로그램 일정 삭제
        await prisma.scheduleProgram.deleteMany({
          where: {
            schedule_id: existingSchedule.id
          }
        });
        
        // 일정표 업데이트
        const updatedSchedule = await prisma.programSchedule.update({
          where: {
            id: existingSchedule.id
          },
          data: {
            group_name: programSchedule.group_name,
            start_date: new Date(programSchedule.start_date),
            end_date: new Date(programSchedule.end_date),
            updated_at: new Date(),
            programs: {
              create: programSchedule.programs.map(program => ({
                day: program.day,
                time_slot: program.time_slot,
                program_name: program.program_name,
                location: program.location,
                instructor: program.instructor
              }))
            }
          }
        });
        
        return {
          success: true,
          message: '프로그램 일정표가 성공적으로 업데이트되었습니다.',
          id: updatedSchedule.id.toString()
        };
      } else {
        // 새 프로그램 일정표 생성
        const newSchedule = await prisma.programSchedule.create({
          data: {
            reservation_id: programSchedule.reservation_id,
            group_name: programSchedule.group_name,
            start_date: new Date(programSchedule.start_date),
            end_date: new Date(programSchedule.end_date),
            programs: {
              create: programSchedule.programs.map(program => ({
                day: program.day,
                time_slot: program.time_slot,
                program_name: program.program_name,
                location: program.location,
                instructor: program.instructor
              }))
            }
          }
        });
        
        return {
          success: true,
          message: '새 프로그램 일정표가 성공적으로 생성되었습니다.',
          id: newSchedule.id.toString()
        };
      }
    } catch (error) {
      console.error('Error saving program schedule:', error);
      return {
        success: false,
        message: `프로그램 일정표 저장 중 오류가 발생했습니다: ${error.message}`
      };
    }
  },
  
  // 객실 배정 저장
  saveRoomAssignment: async (_, { roomAssignment }) => {
    try {
      // 매개변수 정리 및 유효성 검사
      const { reservation_id, room_id, room_name, floor, date, organization, occupancy } = roomAssignment;
      
      if (!room_id || !date) {
        return {
          success: false,
          message: '객실 ID와 날짜는 필수 입력 항목입니다.'
        };
      }
      
      // 기존 객실 배정이 있는지 확인
      const existingAssignment = await prisma.roomAssignment.findFirst({
        where: {
          room_id: parseInt(room_id),
          date: new Date(date)
        }
      });
      
      if (existingAssignment) {
        // 기존 객실 배정 업데이트
        const updatedAssignment = await prisma.roomAssignment.update({
          where: {
            id: existingAssignment.id
          },
          data: {
            reservation_id: parseInt(reservation_id),
            organization,
            occupancy: parseInt(occupancy),
            updated_at: new Date()
          }
        });
        
        return {
          success: true,
          message: '객실 배정이 성공적으로 업데이트되었습니다.',
          id: updatedAssignment.id.toString()
        };
      } else {
        // 새 객실 배정 생성
        const newAssignment = await prisma.roomAssignment.create({
          data: {
            reservation_id: parseInt(reservation_id),
            room_id: parseInt(room_id),
            room_name,
            floor: parseInt(floor),
            date: new Date(date),
            organization,
            occupancy: parseInt(occupancy)
          }
        });
        
        return {
          success: true,
          message: '새 객실 배정이 성공적으로 생성되었습니다.',
          id: newAssignment.id.toString()
        };
      }
    } catch (error) {
      console.error('Error saving room assignment:', error);
      return {
        success: false,
        message: `객실 배정 저장 중 오류가 발생했습니다: ${error.message}`
      };
    }
  },
  
  // 객실 배정 삭제
  deleteRoomAssignment: async (_, { id }) => {
    try {
      // 객실 배정 삭제
      await prisma.roomAssignment.delete({
        where: {
          id: parseInt(id)
        }
      });
      
      return {
        success: true,
        message: '객실 배정이 성공적으로 삭제되었습니다.'
      };
    } catch (error) {
      console.error('Error deleting room assignment:', error);
      return {
        success: false,
        message: `객실 배정 삭제 중 오류가 발생했습니다: ${error.message}`
      };
    }
  },
  
  // 다수의 객실 배정 저장
  bulkSaveRoomAssignments: async (_, { assignments }) => {
    const transaction = await prisma.$transaction(async (prisma) => {
      try {
        let savedCount = 0;
        
        // 각 배정 데이터에 대해 저장 또는 업데이트 수행
        for (const assignment of assignments) {
          const { reservation_id, room_id, room_name, floor, date, organization, occupancy } = assignment;
          
          // 기존 객실 배정이 있는지 확인
          const existingAssignment = await prisma.roomAssignment.findFirst({
            where: {
              room_id: parseInt(room_id),
              date: new Date(date)
            }
          });
          
          if (existingAssignment) {
            // 기존 객실 배정 업데이트
            await prisma.roomAssignment.update({
              where: {
                id: existingAssignment.id
              },
              data: {
                reservation_id: parseInt(reservation_id),
                organization,
                occupancy: parseInt(occupancy),
                updated_at: new Date()
              }
            });
          } else {
            // 새 객실 배정 생성
            await prisma.roomAssignment.create({
              data: {
                reservation_id: parseInt(reservation_id),
                room_id: parseInt(room_id),
                room_name,
                floor: parseInt(floor),
                date: new Date(date),
                organization,
                occupancy: parseInt(occupancy)
              }
            });
          }
          
          savedCount++;
        }
        
        return {
          success: true,
          message: `총 ${savedCount}개의 객실 배정이 성공적으로 저장되었습니다.`,
          count: savedCount
        };
      } catch (error) {
        console.error('Error bulk saving room assignments:', error);
        throw error;
      }
    });
    
    return transaction;
  }
};
