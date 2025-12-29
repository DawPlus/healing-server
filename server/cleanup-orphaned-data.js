/**
 * 잔존 데이터 정리 스크립트
 * Page1에 존재하지 않지만 다른 테이블에 연결된 데이터를 찾아서 삭제합니다.
 */

const prisma = require('./prisma/prismaClient');
const maria = require('./maria');

async function cleanupOrphanedData() {
  console.log('========================================');
  console.log('잔존 데이터 정리 시작');
  console.log('========================================\n');

  try {
    // 1. 모든 Page1 ID 목록 가져오기
    const allPage1Ids = await prisma.page1.findMany({
      select: { id: true }
    });
    const validPage1Ids = new Set(allPage1Ids.map(p => p.id));
    console.log(`현재 유효한 Page1 ID 개수: ${validPage1Ids.size}\n`);

    let totalDeleted = 0;

    // 2. RoomAssignment에서 orphaned 데이터 찾기 및 삭제
    console.log('2. RoomAssignment 잔존 데이터 확인 중...');
    const allRoomAssignments = await prisma.roomAssignment.findMany({
      select: { id: true, reservation_id: true }
    });
    
    const orphanedRoomAssignments = allRoomAssignments.filter(
      ra => ra.reservation_id && !validPage1Ids.has(ra.reservation_id)
    );
    
    if (orphanedRoomAssignments.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedRoomAssignments.length}개`);
      const orphanedIds = orphanedRoomAssignments.map(ra => ra.id);
      const deleted = await prisma.roomAssignment.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 3. ProgramSchedule에서 orphaned 데이터 찾기 및 삭제
    console.log('3. ProgramSchedule 잔존 데이터 확인 중...');
    const allProgramSchedules = await prisma.programSchedule.findMany({
      select: { id: true, reservation_id: true }
    });
    
    const orphanedProgramSchedules = allProgramSchedules.filter(
      ps => ps.reservation_id && !validPage1Ids.has(ps.reservation_id)
    );
    
    if (orphanedProgramSchedules.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedProgramSchedules.length}개`);
      const orphanedIds = orphanedProgramSchedules.map(ps => ps.id);
      const deleted = await prisma.programSchedule.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 4. ParticipantMeal에서 orphaned 데이터 찾기 및 삭제
    console.log('4. ParticipantMeal 잔존 데이터 확인 중...');
    const allParticipantMeals = await prisma.participantMeal.findMany({
      select: { id: true, page1_id: true }
    });
    
    const orphanedParticipantMeals = allParticipantMeals.filter(
      pm => pm.page1_id && !validPage1Ids.has(pm.page1_id)
    );
    
    if (orphanedParticipantMeals.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedParticipantMeals.length}개`);
      const orphanedIds = orphanedParticipantMeals.map(pm => pm.id);
      const deleted = await prisma.participantMeal.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 5. ParticipantRoom에서 orphaned 데이터 찾기 및 삭제
    console.log('5. ParticipantRoom 잔존 데이터 확인 중...');
    const allParticipantRooms = await prisma.participantRoom.findMany({
      select: { id: true, page1_id: true }
    });
    
    const orphanedParticipantRooms = allParticipantRooms.filter(
      pr => pr.page1_id && !validPage1Ids.has(pr.page1_id)
    );
    
    if (orphanedParticipantRooms.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedParticipantRooms.length}개`);
      const orphanedIds = orphanedParticipantRooms.map(pr => pr.id);
      const deleted = await prisma.participantRoom.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 6. RoomAvailability에서 orphaned 데이터 찾기 및 삭제
    console.log('6. RoomAvailability 잔존 데이터 확인 중...');
    const allRoomAvailabilities = await prisma.roomAvailability.findMany({
      select: { id: true, page1_id: true }
    });
    
    const orphanedRoomAvailabilities = allRoomAvailabilities.filter(
      ra => ra.page1_id && !validPage1Ids.has(ra.page1_id)
    );
    
    if (orphanedRoomAvailabilities.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedRoomAvailabilities.length}개`);
      const orphanedIds = orphanedRoomAvailabilities.map(ra => ra.id);
      const deleted = await prisma.roomAvailability.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 7. RoomManage에서 orphaned 데이터 찾기 및 삭제
    console.log('7. RoomManage 잔존 데이터 확인 중...');
    const allRoomManages = await prisma.roomManage.findMany({
      select: { id: true, page1_id: true }
    });
    
    const orphanedRoomManages = allRoomManages.filter(
      rm => rm.page1_id && !validPage1Ids.has(rm.page1_id)
    );
    
    if (orphanedRoomManages.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedRoomManages.length}개`);
      const orphanedIds = orphanedRoomManages.map(rm => rm.id);
      const deleted = await prisma.roomManage.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 8. Project3Reservation에서 orphaned 데이터 찾기 및 삭제
    console.log('8. Project3Reservation (Prisma) 잔존 데이터 확인 중...');
    const allProject3Reservations = await prisma.project3Reservation.findMany({
      select: { id: true, page1_id: true },
      where: { page1_id: { not: null } }
    });
    
    const orphanedProject3Reservations = allProject3Reservations.filter(
      p3r => p3r.page1_id && !validPage1Ids.has(p3r.page1_id)
    );
    
    if (orphanedProject3Reservations.length > 0) {
      console.log(`  발견된 잔존 데이터: ${orphanedProject3Reservations.length}개`);
      const orphanedIds = orphanedProject3Reservations.map(p3r => p3r.id);
      const deleted = await prisma.project3Reservation.deleteMany({
        where: { id: { in: orphanedIds } }
      });
      console.log(`  삭제 완료: ${deleted.count}개\n`);
      totalDeleted += deleted.count;
    } else {
      console.log('  잔존 데이터 없음\n');
    }

    // 9. MariaDB project3_reservations에서 orphaned 데이터 찾기 및 삭제
    console.log('9. project3_reservations (MariaDB) 잔존 데이터 확인 중...');
    try {
      // 모든 project3_reservations 데이터 가져오기
      const sql = 'SELECT id, page1_id FROM dbstatistics.project3_reservations WHERE page1_id IS NOT NULL';
      const allMariaReservations = await maria(sql, []);
      
      const orphanedMariaReservations = allMariaReservations.filter(
        mr => mr.page1_id && !validPage1Ids.has(mr.page1_id)
      );
      
      if (orphanedMariaReservations.length > 0) {
        console.log(`  발견된 잔존 데이터: ${orphanedMariaReservations.length}개`);
        const orphanedIds = orphanedMariaReservations.map(mr => mr.id);
        
        // 배치로 삭제 (IN 절 사용)
        const placeholders = orphanedIds.map(() => '?').join(',');
        const deleteSql = `DELETE FROM dbstatistics.project3_reservations WHERE id IN (${placeholders})`;
        const result = await maria(deleteSql, orphanedIds);
        console.log(`  삭제 완료: ${result.affectedRows || 0}개\n`);
        totalDeleted += (result.affectedRows || 0);
      } else {
        console.log('  잔존 데이터 없음\n');
      }
    } catch (error) {
      console.error(`  MariaDB 조회/삭제 중 오류: ${error.message}\n`);
    }

    console.log('========================================');
    console.log(`정리 완료! 총 ${totalDeleted}개의 잔존 데이터가 삭제되었습니다.`);
    console.log('========================================');

  } catch (error) {
    console.error('오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  cleanupOrphanedData()
    .then(() => {
      console.log('\n스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = cleanupOrphanedData;
