// PrismaClient 직접 임포트 대신 공유 인스턴스 사용
const prisma = require('../../../prisma/prismaClient');
// MariaDB 연결을 위한 모듈 임포트 (경로: server/graphql/resolvers/mutations -> server/maria.js)
const maria = require('../../../maria');

const page1Mutations = {
  // Create a new Page1 record
  createPage1: async (_, { input }) => {
    try {
      const result = await prisma.page1.create({
        data: input
      });
      return result;
    } catch (error) {
      console.error('Error creating Page1:', error);
      throw new Error(`Failed to create Page1: ${error.message}`);
    }
  },

  // Update an existing Page1 record
  updatePage1: async (_, { id, input }) => {
    try {
      const result = await prisma.page1.update({
        where: { id },
        data: input
      });
      return result;
    } catch (error) {
      console.error('Error updating Page1:', error);
      throw new Error(`Failed to update Page1: ${error.message}`);
    }
  },

  // Delete a Page1 record and all related data
  deletePage1: async (_, { id }) => {
    try {
      console.log(`시작: Page1 ID ${id}에 대한 연쇄 삭제 작업`);

      // 먼저 모든 관련 레코드를 조회해 둠
      const page1Record = await prisma.page1.findUnique({
        where: { id },
        include: {
          page2_reservations: true,
          page3: true,
          page4_expenses: true,
          page5_documents: true,
          page_final: true
        }
      });

      if (!page1Record) {
        throw new Error(`Page1 ID ${id}에 해당하는 레코드를 찾을 수 없습니다.`);
      }

      // 관련 데이터 조회 (RoomAssignment, ProgramSchedule, ParticipantMeal, ParticipantRoom, RoomAvailability, RoomManage)
      const roomAssignmentsCount = await prisma.roomAssignment.count({
        where: { reservation_id: id }
      });
      const programSchedulesCount = await prisma.programSchedule.count({
        where: { reservation_id: id }
      });
      const participantMealsCount = await prisma.participantMeal.count({
        where: { page1_id: id }
      });
      const participantRoomsCount = await prisma.participantRoom.count({
        where: { page1_id: id }
      });
      const roomAvailabilitiesCount = await prisma.roomAvailability.count({
        where: { page1_id: id }
      });
      const roomManagesCount = await prisma.roomManage.count({
        where: { page1_id: id }
      });
      const project3ReservationsCount = await prisma.project3Reservation.count({
        where: { page1_id: id }
      });

      console.log(`삭제 시작: Page1 ID ${id}에 연결된 데이터 현황:`);
      console.log(`- Page2 프로그램 정보: ${page1Record.page2_reservations?.length || 0}개`);
      console.log(`- Page3 시설 이용 정보: ${page1Record.page3 ? '있음' : '없음'}`);
      console.log(`- Page4 비용 정보: ${page1Record.page4_expenses?.length || 0}개`);
      console.log(`- Page5 문서: ${page1Record.page5_documents?.length || 0}개`);
      console.log(`- 최종 만족도 정보: ${page1Record.page_final ? '있음' : '없음'}`);
      console.log(`- 객실 배정 정보: ${roomAssignmentsCount}개`);
      console.log(`- 프로그램 일정표 정보: ${programSchedulesCount}개`);
      console.log(`- 참가자 식사 정보: ${participantMealsCount}개`);
      console.log(`- 참가자 객실 정보: ${participantRoomsCount}개`);
      console.log(`- 객실 가용성 정보: ${roomAvailabilitiesCount}개`);
      console.log(`- 객실 관리 정보: ${roomManagesCount}개`);
      console.log(`- 프로젝트3 예약 정보: ${project3ReservationsCount}개`);

      // 필요한 모든 관련 ID 수집
      const page4Ids = page1Record.page4_expenses?.map(p => p.id) || [];
      const page2Ids = page1Record.page2_reservations?.map(p => p.id) || [];

      // 트랜잭션 없이 순차적으로 처리 (각 단계가 독립적으로 실행됨)
      
      // Step 1: Delete related PageFinal if it exists
      if (page1Record.page_final) {
        try {
          await prisma.pageFinal.delete({
            where: { page1_id: id }
          });
          console.log(`삭제됨: 최종 만족도 정보`);
        } catch (error) {
          console.error(`최종 만족도 정보 삭제 중 오류: ${error.message}`);
          // 계속 진행
        }
      } else {
        console.log(`최종 만족도 정보 없음`);
      }

      // Step 2: Delete related Page5 documents if they exist
      try {
        const deletedPage5 = await prisma.page5Document.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: Page5 문서 ${deletedPage5.count}개`);
      } catch (error) {
        console.error(`Page5 문서 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 3: Delete related Page4 (expenses) data if it exists
      try {
        // Delete any materials related to each Page4 record
        if (page4Ids.length > 0) {
          const deletedMaterials = await prisma.page4Material.deleteMany({
            where: {
              expense_id: { in: page4Ids }
            }
          });
          console.log(`삭제됨: Page4 재료 ${deletedMaterials.count}개`);
          
          // Delete any additional expenses related to each Page4 record
          const deletedAdditionalExpenses = await prisma.page4AdditionalExpense.deleteMany({
            where: {
              expense_id: { in: page4Ids }
            }
          });
          console.log(`삭제됨: Page4 추가 비용 ${deletedAdditionalExpenses.count}개`);
        }
        
        // Delete the Page4 records themselves
        const deletedPage4 = await prisma.page4.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: Page4 비용 정보 ${deletedPage4.count}개`);
      } catch (error) {
        console.error(`Page4 비용 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 4: Delete related Page3 (facility) data if it exists
      if (page1Record.page3) {
        try {
          await prisma.page3.delete({
            where: { page1_id: id }
          });
          console.log(`삭제됨: Page3 시설 이용 정보 (ID: ${page1Record.page3.id})`);
        } catch (error) {
          console.error(`Page3 시설 이용 정보 삭제 중 오류: ${error.message}`);
          // 계속 진행
        }
      } else {
        console.log(`Page3 시설 이용 정보 없음`);
      }

      // Step 5: Delete related Page2 (program) data if it exists
      try {
        if (page2Ids.length > 0) {
          // Delete all programs related to any Page2 record in one query
          const deletedPrograms = await prisma.page2Program.deleteMany({
            where: {
              reservation_id: { in: page2Ids }
            }
          });
          console.log(`삭제됨: Page2 프로그램 세부항목 ${deletedPrograms.count}개`);
        }
        
        // Delete the Page2 records themselves
        const deletedPage2 = await prisma.page2.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: Page2 프로그램 정보 ${deletedPage2.count}개`);
      } catch (error) {
        console.error(`Page2 프로그램 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 6: Delete related RoomAssignment (객실 배정) data if it exists
      try {
        const deletedRoomAssignments = await prisma.roomAssignment.deleteMany({
          where: { reservation_id: id }
        });
        console.log(`삭제됨: 객실 배정 정보 ${deletedRoomAssignments.count}개`);
      } catch (error) {
        console.error(`객실 배정 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 7: Delete related ProgramSchedule (프로그램 일정표) data if it exists
      // ScheduleProgram은 CASCADE로 자동 삭제됨
      try {
        const deletedProgramSchedules = await prisma.programSchedule.deleteMany({
          where: { reservation_id: id }
        });
        console.log(`삭제됨: 프로그램 일정표 정보 ${deletedProgramSchedules.count}개`);
      } catch (error) {
        console.error(`프로그램 일정표 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 8: Delete related ParticipantMeal (참가자 식사) data if it exists
      try {
        const deletedParticipantMeals = await prisma.participantMeal.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: 참가자 식사 정보 ${deletedParticipantMeals.count}개`);
      } catch (error) {
        console.error(`참가자 식사 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 9: Delete related ParticipantRoom (참가자 객실) data if it exists
      try {
        const deletedParticipantRooms = await prisma.participantRoom.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: 참가자 객실 정보 ${deletedParticipantRooms.count}개`);
      } catch (error) {
        console.error(`참가자 객실 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 10: Delete related RoomAvailability (객실 가용성) data if it exists
      try {
        const deletedRoomAvailabilities = await prisma.roomAvailability.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: 객실 가용성 정보 ${deletedRoomAvailabilities.count}개`);
      } catch (error) {
        console.error(`객실 가용성 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 11: Delete related RoomManage (객실 관리) data if it exists
      try {
        const deletedRoomManages = await prisma.roomManage.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: 객실 관리 정보 ${deletedRoomManages.count}개`);
      } catch (error) {
        console.error(`객실 관리 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 12: Delete related Project3Reservation (프로젝트3 예약) data if it exists
      try {
        const deletedProject3Reservations = await prisma.project3Reservation.deleteMany({
          where: { page1_id: id }
        });
        console.log(`삭제됨: 프로젝트3 예약 정보 (Prisma) ${deletedProject3Reservations.count}개`);
      } catch (error) {
        console.error(`프로젝트3 예약 정보 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Step 13: Delete related MariaDB project3_reservations data if it exists
      try {
        const sql = 'DELETE FROM dbstatistics.project3_reservations WHERE page1_id = ?';
        const result = await maria(sql, [id]);
        console.log(`삭제됨: 프로젝트3 예약 정보 (MariaDB) ${result.affectedRows || 0}개`);
      } catch (error) {
        console.error(`프로젝트3 예약 정보 (MariaDB) 삭제 중 오류: ${error.message}`);
        // 계속 진행
      }

      // Finally, delete the Page1 record
      try {
        await prisma.page1.delete({
          where: { id }
        });
        console.log(`삭제됨: Page1 기본 정보 (ID: ${id})`);
      } catch (error) {
        console.error(`Page1 기본 정보 삭제 중 오류: ${error.message}`);
        throw error; // 기본 정보 삭제에 실패하면 오류 전파
      }

      console.log(`완료: Page1 ID ${id}에 대한 모든 연관 데이터 삭제 완료`);
      return true;
    } catch (error) {
      console.error('연쇄 삭제 작업 중 오류 발생:', error);
      throw new Error(`관련 데이터 삭제 실패: ${error.message}`);
    }
  }
};

module.exports = page1Mutations; 