const prisma = require('../../../prisma/prismaClient');

module.exports = {
  // 프로그램 일정표를 위한 스케줄 데이터 가져오기
  getScheduleData: async (_, { startDate, endDate }) => {
    try {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // 날짜 범위 생성
      const dateRange = [];
      const currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // 모든 프로그램 데이터를 미리 가져와서 메모리에서 필터링
      const allPrograms = await prisma.page2Program.findMany({
        select: {
          id: true,
          program_name: true,
          program: true,
          category: true,
          category_name: true,
          start_time: true,
          end_time: true,
          date: true,
          place_name: true,
          place: true,
          instructor_name: true,
          instructor: true,
          reservation_id: true,
          duration: true,
          notes: true,
          price: true,
          participants: true,
          reservation: {
            select: {
              page1: {
                select: {
                  id: true,
                  group_name: true,
                  reservation_status: true,
                }
              }
            }
          }
        },
      });
      
      console.log(`총 프로그램 데이터 수: ${allPrograms.length}`);
      
      // 각 날짜별 스케줄 데이터 준비
      const scheduleData = await Promise.all(
        dateRange.map(async (date) => {
          const dateStr = date.toISOString().split('T')[0];
          
          // 메모리에서 해당 날짜의 프로그램 필터링
          const programs = allPrograms.filter(program => {
            if (!program.date) return false;
            
            // 날짜 비교 시 timezone 문제 해결을 위해 날짜만 비교
            // 1. 프로그램 날짜의 시간 부분을 제거하고 표준 시간대로 변환
            const programDate = new Date(program.date);
            // 2. 로컬 시간대의 년,월,일 값만 가져옴
            const programYear = programDate.getFullYear();
            const programMonth = programDate.getMonth();
            const programDay = programDate.getDate();
            // 3. 위 값으로 시간 없는 새 Date 객체 생성 (로컬 기준)
            const normalizedProgramDate = new Date(programYear, programMonth, programDay);
            
            // 4. 현재 날짜의 년,월,일 값만 가져옴
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth();
            const currentDay = date.getDate();
            // 5. 위 값으로 시간 없는 새 Date 객체 생성 (로컬 기준)
            const normalizedCurrentDate = new Date(currentYear, currentMonth, currentDay);
            
            // 6. 날짜 부분만 비교 (시간 무시)
            const matches = normalizedProgramDate.getTime() === normalizedCurrentDate.getTime();
            
            if (matches) {
              console.log(`  매치된 프로그램: ID ${program.id} - ${program.program_name}`);
              console.log(`    프로그램 날짜: ${normalizedProgramDate.toString()}`);
              console.log(`    현재 날짜: ${normalizedCurrentDate.toString()}`);
            }
            
            return matches;
          });
          
          console.log(`[${dateStr}] 필터링된 프로그램 수: ${programs.length}`);
          
          // 객실 배정 데이터 조회
          const roomAssignments = await prisma.roomAssignment.findMany({
            where: {
              date: {
                equals: new Date(dateStr),
              },
            },
            include: {
              room: true,
            },
          });
          
          // Page3 식사 계획 조회
          // (식사 계획은 JSON 형태로 저장되어 있어 복잡한 처리가 필요)
          const page3Data = await prisma.page3.findMany({
            where: {
              page1: {
                start_date: {
                  lte: new Date(dateStr),
                },
                end_date: {
                  gte: new Date(dateStr),
                },
              },
            },
            select: {
              meal_plans: true,
              page1: {
                select: {
                  group_name: true,
                },
              },
            },
          });
          
          // meal_plans는 JSON 문자열이므로 파싱 필요
          const meals = page3Data.flatMap(p3 => {
            try {
              const mealPlans = typeof p3.meal_plans === 'string' 
                ? JSON.parse(p3.meal_plans) 
                : p3.meal_plans || [];
              
              return mealPlans
                .filter(meal => meal.date === dateStr)
                .map(meal => ({
                  id: `${meal.id || Math.random().toString(36).substr(2, 9)}`,
                  meal_type: meal.meal_type,
                  organization: p3.page1?.group_name || '',
                  time: meal.meal_type === 'breakfast' ? '08:00' 
                       : meal.meal_type === 'lunch' ? '12:00' 
                       : '18:00',
                  participants: meal.participants,
                  location: '식당',
                }));
            } catch (e) {
              console.error('Error parsing meal plans:', e);
              return [];
            }
          });
          
          // Page3 장소 예약 조회
          const page3PlaceData = await prisma.page3.findMany({
            where: {
              page1: {
                start_date: {
                  lte: new Date(dateStr),
                },
                end_date: {
                  gte: new Date(dateStr),
                },
              },
            },
            select: {
              place_reservations: true,
              page1: {
                select: {
                  group_name: true,
                },
              },
            },
          });
          
          // place_reservations도 JSON 문자열이므로 파싱 필요
          const places = page3PlaceData.flatMap(p3 => {
            try {
              const placeReservations = typeof p3.place_reservations === 'string' 
                ? JSON.parse(p3.place_reservations) 
                : p3.place_reservations || [];
              
              return placeReservations
                .filter(place => place.reservation_date === dateStr)
                .map(place => ({
                  id: `${place.id || Math.random().toString(36).substr(2, 9)}`,
                  place_name: place.place_name,
                  organization: p3.page1?.group_name || '',
                  start_time: place.start_time,
                  end_time: place.end_time,
                  purpose: place.purpose,
                  participants: place.participants,
                }));
            } catch (e) {
              console.error('Error parsing place reservations:', e);
              return [];
            }
          });
          
          // 결과 반환
          return {
            date: dateStr,
            programs: programs.map(p => ({
              id: p.id.toString(),
              program_name: p.program_name || p.program || '',
              organization: p.reservation?.page1?.group_name || '',
              start_time: p.start_time || '',
              end_time: p.end_time || '',
              location: p.place_name || p.category_name || '',
              participants: p.participants || 0,
              instructor_name: p.instructor_name || '',
            })),
            rooms: roomAssignments.map(r => ({
              id: r.id.toString(),
              room_name: r.room_name,
              organization: r.organization,
              check_in: new Date(dateStr).toISOString().split('T')[0],
              check_out: new Date(dateStr).toISOString().split('T')[0],
              occupancy: r.occupancy,
            })),
            meals,
            places,
          };
        })
      );
      
      return scheduleData;
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      throw new Error(`스케줄 데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 객실 정보 가져오기
  getRooms: async () => {
    try {
      const rooms = await prisma.menuRoom.findMany({
        where: {
          is_available: true
        },
        orderBy: [
          { display_order: 'asc' },
          { room_name: 'asc' },
        ],
      });
      
      // menuRoom 모델에 맞게 결과 형식 변환
      return rooms.map(room => ({
        id: room.id,
        room_name: room.room_name,
        room_type: room.room_type,
        capacity: room.capacity,
        floor: Math.floor(parseInt(room.room_name.replace(/\D/g, '')) / 100) || 1, // 객실번호에서 층수 추출 (101 -> 1층, 205 -> 2층)
        status: room.is_available ? 'active' : 'inactive',
        price: room.price
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error(`객실 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 특정 날짜 기간의 객실 예약 현황 가져오기
  getRoomAssignments: async (_, { startDate, endDate }) => {
    try {
      console.log(`[getRoomAssignments] 요청 받음: ${startDate} ~ ${endDate}`);
      console.log(`[getRoomAssignments] 쿼리 파라미터: 시작일=${startDate}, 종료일=${endDate}`);
      
      // 모든 객실 조회 - 예약 상태와 관계없이 모든 방을 반환
      const rooms = await prisma.menuRoom.findMany({
        orderBy: [
          { display_order: 'asc' },
          { room_name: 'asc' },
        ],
        where: {
          is_available: true
        },
      });
      
      console.log(`[getRoomAssignments] 총 ${rooms.length}개 객실 데이터 로드됨`);
      console.log('[getRoomAssignments] 객실 샘플 데이터:', rooms.slice(0, 3).map(r => ({
        id: r.id,
        room_name: r.room_name,
        room_type: r.room_type || '일반',
        capacity: r.capacity,
        display_order: r.display_order
      })));
      
      // 먼저 모든 유효한 page1 ID 목록 가져오기 (삭제된 단체 필터링을 위해)
      const allValidPage1Ids = await prisma.page1.findMany({
        select: { id: true }
      });
      const validPage1IdSet = new Set(allValidPage1Ids.map(p => p.id));
      console.log(`[getRoomAssignments] 유효한 단체(page1) 개수: ${validPage1IdSet.size}개`);
      
      // 1. 특정 기간의 모든 객실 배정 조회 (roomAssignment 테이블)
      // 삭제된 단체의 데이터는 제외
      const allRoomAssignments = await prisma.roomAssignment.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
      
      // 유효한 reservation_id를 가진 배정만 필터링
      const assignments = allRoomAssignments.filter(a => 
        a.reservation_id === null || validPage1IdSet.has(a.reservation_id)
      );
      
      console.log(`[getRoomAssignments] roomAssignment 테이블에서 ${allRoomAssignments.length}개 배정 데이터 찾음 (유효한 것: ${assignments.length}개)`);
      if (assignments.length > 0) {
        console.log('[getRoomAssignments] 객실 배정 샘플 데이터:', assignments.slice(0, 3).map(a => ({
          id: a.id,
          room_id: a.room_id,
          date: a.date.toISOString().split('T')[0],
          organization: a.organization,
          occupancy: a.occupancy,
          reservation_id: a.reservation_id
        })));
      }
      
      // 2. RoomManage 테이블에서 겹치는 예약 조회 (page3에서 사용하는 테이블)
      // 삭제된 단체의 데이터는 제외
      const allRoomManageRecords = await prisma.roomManage.findMany({
        where: {
          OR: [
            // 기간이 겹치는 모든 예약
            {
              check_in_date: { lte: new Date(endDate) },
              check_out_date: { gte: new Date(startDate) }
            }
          ]
        }
      });
      
      // 유효한 page1_id를 가진 레코드만 필터링
      const roomManageRecords = allRoomManageRecords.filter(r => 
        r.page1_id === null || validPage1IdSet.has(r.page1_id)
      );
      
      console.log(`[getRoomAssignments] RoomManage 테이블에서 ${allRoomManageRecords.length}개 배정 데이터 찾음 (유효한 것: ${roomManageRecords.length}개)`);
      if (roomManageRecords.length > 0) {
        console.log('[getRoomAssignments] RoomManage 샘플 데이터:', roomManageRecords.slice(0, 3).map(r => ({
          id: r.id,
          room_id: r.room_id,
          page1_id: r.page1_id,
          check_in: r.check_in_date?.toISOString().split('T')[0],
          check_out: r.check_out_date?.toISOString().split('T')[0],
          organization: r.organization_name
        })));
      }
      
      // 관련 page1 정보 가져오기 (필요한 경우)
      const page1Ids = [...new Set(roomManageRecords.map(record => record.page1_id).filter(id => id !== null))];
      const page1Records = page1Ids.length > 0 ? await prisma.page1.findMany({
        where: {
          id: { in: page1Ids }
        },
        select: {
          id: true,
          group_name: true
        }
      }) : [];
      
      // page1 정보를 조회용 맵으로 변환
      const page1Map = {};
      page1Records.forEach(p1 => {
        page1Map[p1.id] = p1;
      });
      
      console.log(`[getRoomAssignments] 관련 단체(page1) 정보: ${page1Records.length}개 단체 조회됨`);
      
      // RoomManage 레코드를 개별 날짜별 배정으로 변환
      const convertedAssignments = [];
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      for (const record of roomManageRecords) {
        // page1_id가 유효하지 않은 경우 건너뛰기 (이미 필터링되었지만 추가 안전장치)
        if (record.page1_id && !validPage1IdSet.has(record.page1_id)) {
          continue;
        }
        
        const roomId = record.room_id;
        const checkInDate = new Date(record.check_in_date);
        const checkOutDate = new Date(record.check_out_date);
        
        // 각 날짜를 순회하면서 범위 내의 날짜에 대한 배정 생성
        let currentDate = new Date(Math.max(checkInDate, startDateObj));
        const lastDate = new Date(Math.min(checkOutDate, endDateObj));
        
        while (currentDate < lastDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // 이미 roomAssignment에 동일한 방/날짜 조합이 있는지 확인
          const existingAssignment = assignments.find(a => 
            a.room_id === roomId && 
            a.date.toISOString().split('T')[0] === dateStr
          );
          
          // 중복이 없는 경우에만 추가
          if (!existingAssignment) {
            // page1_id가 유효한 경우에만 추가
            if (!record.page1_id || validPage1IdSet.has(record.page1_id)) {
              convertedAssignments.push({
                id: `rm-${record.id}-${dateStr}`, // 가상 ID 생성
                room_id: roomId,
                date: new Date(dateStr),
                organization: record.organization_name || (page1Map[record.page1_id]?.group_name) || '미정',
                occupancy: record.occupancy || 1,
                reservation_id: record.page1_id,
                // page3에서 온 데이터임을 표시
                source: 'room_manage'
              });
            }
          }
          
          // 다음 날짜로 이동
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      console.log(`[getRoomAssignments] RoomManage 테이블에서 ${convertedAssignments.length}개 날짜별 배정 데이터 생성됨`);
      
      // 기존 배정과 변환된 배정 병합
      const allAssignments = [...assignments, ...convertedAssignments];
      console.log(`[getRoomAssignments] 총 ${allAssignments.length}개 객실 배정 데이터 (roomAssignment + RoomManage 병합)`);
      
      // 객실별로 배정 데이터 그룹화
      const result = rooms.map(room => {
        // 객실번호에서 층수 추출 (101 -> 1층, 205 -> 2층)
        const floor = Math.floor(parseInt(room.room_name.replace(/\D/g, '')) / 100) || 1;
        
        // 해당 객실에 대한 배정 필터링
        // 삭제된 단체의 데이터는 제외 (reservation_id가 유효한 것만)
        const roomAssignments = allAssignments
          .filter(a => {
            // 객실 ID가 일치하고
            if (a.room_id !== room.id) return false;
            // reservation_id가 null이거나 유효한 page1_id인 경우만 포함
            if (a.reservation_id !== null && !validPage1IdSet.has(a.reservation_id)) {
              return false;
            }
            return true;
          })
          .map(a => ({
            id: a.id.toString(),
            date: a.date.toISOString().split('T')[0],
            organization: a.organization,
            occupancy: a.occupancy,
            reservation_id: a.reservation_id,
            source: a.source || 'room_assignment' // 데이터 출처 표시
          }));
        
        return {
          room_id: room.id.toString(),
          room_name: room.room_name,
          room_type: room.room_type || '',
          floor: floor,
          capacity: room.capacity,
          status: room.status || 'active',
          assignments: roomAssignments,
        };
      });
      
      // 층 번호로 정렬 후 객실명으로 정렬
      result.sort((a, b) => {
        if (a.floor !== b.floor) {
          return a.floor - b.floor;
        }
        return a.room_name.localeCompare(b.room_name);
      });
      
      // 층별 통계 계산
      const floorStats = {};
      let totalAssignments = 0;
      
      result.forEach(room => {
        const floor = room.floor;
        if (!floorStats[floor]) {
          floorStats[floor] = { rooms: 0, assignments: 0 };
        }
        
        floorStats[floor].rooms++;
        const count = room.assignments.length;
        floorStats[floor].assignments += count;
        totalAssignments += count;
      });
      
      console.log(`[getRoomAssignments] 응답 데이터: ${result.length}개 객실, ${totalAssignments}개 배정`);
      console.log('[getRoomAssignments] 층별 객실 및 배정 통계:');
      Object.entries(floorStats).forEach(([floor, stats]) => {
        console.log(`  - ${floor}층: ${stats.rooms}개 객실, ${stats.assignments}개 배정`);
      });
      
      if (result.length > 0 && result[0].assignments.length > 0) {
        console.log('[getRoomAssignments] 첫 번째 객실의 배정 예시:', 
          result[0].room_name, 
          result[0].assignments.slice(0, 2)
        );
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching room assignments:', error);
      throw new Error(`객실 배정 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },

  // 식사 인원 정보 가져오기
  getMealStaff: async (_, { startDate, endDate, reservationId }) => {
    try {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      console.log(`[getMealStaff] 요청 받음: ${startDate} ~ ${endDate}, 예약 ID: ${reservationId || '전체'}`);
      
      // 날짜 범위 생성
      const dateRange = [];
      const currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`[getMealStaff] 조회 날짜 범위: ${dateRange.length}일`);

      // 예약 ID 필터링 조건 설정
      const whereCondition = reservationId 
        ? { page1_id: reservationId }
        : {};
      
      // Page3 데이터 조회 (식사 계획이 있는 예약)
      const page3Data = await prisma.page3.findMany({
        where: whereCondition,
        include: {
          page1: true
        }
      });
      
      console.log(`[getMealStaff] 조회된 Page3 데이터: ${page3Data.length}개 단체`);
      if (page3Data.length > 0) {
        console.log('[getMealStaff] 조회된 단체 목록:');
        page3Data.forEach(p3 => {
          console.log(`  - ${p3.page1.group_name} (ID: ${p3.page1_id}), 기간: ${p3.page1.start_date} ~ ${p3.page1.end_date}`);
        });
      }
      
      // 각 날짜와 식사 유형 조합에 대한 결과 처리
      const mealStaffResults = [];
      
      // 날짜별로 처리
      for (const date of dateRange) {
        const dateStr = date.toISOString().split('T')[0];
        
        // 식사 유형별 집계
        const mealTypes = ['조식', '중식', '석식'];
        
        // 각 식사 유형에 대해 데이터 처리
        for (const mealType of mealTypes) {
          // 시간대에 따라 날짜 제외 (첫날 아침, 마지막날 저녁 등)
          if ((dateStr === startDate && mealType === '조식') || 
              (dateStr === endDate && mealType === '석식')) {
            continue;
          }
          
          // 해당 식사에 대한 집계 초기화
          const mealStaff = {
            date: dateStr,
            meal_type: mealType,
            youth_count: 0,
            adult_count: 0,
            instructor_count: 0,
            other_count: 0,
            total_count: 0,
            organization: '',
            reservation_id: null
          };
          
          // 해당 날짜와 식사 유형에 맞는 예약 정보 검색
          for (const p3 of page3Data) {
            // 예약 기간에 해당 날짜가 포함되는지 확인
            const reservationStart = new Date(p3.page1.start_date);
            const reservationEnd = new Date(p3.page1.end_date);
            
            if (date >= reservationStart && date <= reservationEnd) {
              try {
                // meal_plans 데이터 파싱
                const mealPlans = typeof p3.meal_plans === 'string'
                  ? JSON.parse(p3.meal_plans)
                  : p3.meal_plans || [];
                
                if (mealPlans.length > 0) {
                  console.log(`[getMealStaff] 단체: ${p3.page1.group_name}, ${dateStr}의 식사 계획: ${mealPlans.length}개`);
                }
                
                // 해당 날짜와 식사 유형에 맞는 식사 계획 찾기
                const meal = mealPlans.find(m => 
                  m.date === dateStr && 
                  (m.meal_type === mealType || 
                   (mealType === '조식' && m.meal_type === 'breakfast') ||
                   (mealType === '중식' && m.meal_type === 'lunch') ||
                   (mealType === '석식' && m.meal_type === 'dinner'))
                );
                
                if (meal) {
                  console.log(`[getMealStaff] 단체: ${p3.page1.group_name}, ${dateStr}의 ${mealType} 식사 계획 찾음: ${meal.participants}명`);
                  
                  // 참가자 정보 집계
                  const participants = meal.participants || 0;
                  
                  // Page2 데이터에서 참가자 세부정보 조회
                  const page2 = await prisma.page2.findFirst({
                    where: { page1_id: p3.page1_id }
                  });
                  
                  if (page2) {
                    console.log(`[getMealStaff] Page2 데이터 찾음 - 참가자 세부 정보: 청소년 ${page2.total_count - page2.total_leader_count}명, 강사 ${page2.total_leader_count}명`);
                    
                    // 참가자를 유형별로 분류 (예: 청소년, 성인, 강사)
                    // 기본 분류 로직 (실제 데이터 구조에 맞게 수정 필요)
                    if (page2.age_type === 'youth') {
                      mealStaff.youth_count += participants;
                    } else if (page2.age_type === 'adult') {
                      mealStaff.adult_count += participants;
                    } else {
                      // 기타 인원 처리
                      mealStaff.other_count += participants;
                    }
                    
                    // 강사 수 처리 (if available)
                    if (page2.total_leader_count) {
                      mealStaff.instructor_count += page2.total_leader_count;
                    }
                  } else {
                    console.log(`[getMealStaff] Page2 데이터 없음 - 전체 ${participants}명을 기타로 처리`);
                    // Page2 데이터가 없는 경우 기타 인원으로 처리
                    mealStaff.other_count += participants;
                  }
                  
                  // 전체 인원 업데이트
                  mealStaff.total_count += participants;
                  
                  // 단체명 설정 (첫 번째 단체만 표시, 실제로는 여러 단체가 있을 수 있음)
                  if (!mealStaff.organization) {
                    mealStaff.organization = p3.page1.group_name;
                    mealStaff.reservation_id = p3.page1_id;
                  }
                }
              } catch (e) {
                console.error(`[getMealStaff] Error parsing meal plans for ${p3.page1.group_name}:`, e);
              }
            }
          }
          
          // 빈 결과라도 일단 추가 (프론트엔드에서 표시용)
          mealStaffResults.push(mealStaff);
        }
      }
      
      // 결과 요약 로깅
      const mealStaffSummary = {
        totalCount: 0,
        dates: {},
        types: {
          '조식': 0,
          '중식': 0,
          '석식': 0
        }
      };
      
      mealStaffResults.forEach(meal => {
        mealStaffSummary.totalCount += meal.total_count;
        
        // 날짜별 집계
        if (!mealStaffSummary.dates[meal.date]) {
          mealStaffSummary.dates[meal.date] = 0;
        }
        mealStaffSummary.dates[meal.date] += meal.total_count;
        
        // 식사 유형별 집계
        mealStaffSummary.types[meal.meal_type] += meal.total_count;
      });
      
      console.log(`[getMealStaff] 결과 데이터: ${mealStaffResults.length}개 식사 배정, 총 ${mealStaffSummary.totalCount}명`);
      console.log(`[getMealStaff] 식사 유형별 인원: 조식 ${mealStaffSummary.types['조식']}명, 중식 ${mealStaffSummary.types['중식']}명, 석식 ${mealStaffSummary.types['석식']}명`);
      
      if (mealStaffResults.length > 0) {
        console.log('[getMealStaff] 날짜별 인원:');
        Object.entries(mealStaffSummary.dates)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, count]) => {
            console.log(`  - ${date}: ${count}명`);
          });
      }
      
      return mealStaffResults;
    } catch (error) {
      console.error('Error fetching meal staff data:', error);
      throw new Error(`식사 인원 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 주간일정표 정보 가져오기
  getWeeklySchedule: async (_, { startDate, endDate }) => {
    try {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      console.log(`주간일정표 조회 기간: ${startDate} ~ ${endDate}`);
      
      // 날짜 범위 생성
      const dateRange = [];
      const currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // 시간 슬롯 정의 (30분 단위)
      const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 7; hour <= 22; hour++) {
          for (let minute of ['00', '30']) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute}`);
          }
        }
        return slots;
      };
      
      const timeSlots = generateTimeSlots();
      
      // 모든 프로그램 데이터를 미리 가져와서 메모리에서 필터링
      const allPrograms = await prisma.page2Program.findMany({
        select: {
          id: true,
          program_name: true,
          program: true,
          category: true,
          category_name: true,
          start_time: true,
          end_time: true,
          date: true,
          place_name: true,
          place: true,
          instructor_name: true,
          instructor: true,
          reservation_id: true,
          duration: true,
          notes: true,
          price: true,
          participants: true,
          reservation: {
            select: {
              page1: {
                select: {
                  id: true,
                  group_name: true,
                  reservation_status: true,
                }
              }
            }
          }
        },
      });
      
      console.log(`총 프로그램 데이터 수: ${allPrograms.length}`);
      
      // 프로그램 날짜 디버깅
      allPrograms.forEach(program => {
        if (program.date) {
          const rawDate = program.date;
          const programDate = new Date(program.date);
          const programDateISO = programDate.toISOString();
          const programDateLocal = programDate.toString();
          const programDateLocalDate = new Date(programDate.getFullYear(), programDate.getMonth(), programDate.getDate()).toString();
          
          console.log(`프로그램 ID ${program.id} - 원본 날짜: ${rawDate}`);
          console.log(`  프로그램명: ${program.program_name}`);
          console.log(`  ISO 날짜: ${programDateISO}`);
          console.log(`  로컬 날짜: ${programDateLocal}`);
          console.log(`  날짜만: ${programDateLocalDate}`);
        }
      });
      
      // 각 날짜별 주간일정표 데이터 생성
      const scheduleData = await Promise.all(
        dateRange.map(async (date) => {
          const dateStr = date.toISOString().split('T')[0];
          const localDateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toString();
          
          console.log(`------------ 날짜 처리 중: ${dateStr} (로컬: ${localDateStr}) ------------`);
          
          // 메모리에서 해당 날짜의 프로그램 필터링
          const programs = allPrograms.filter(program => {
            if (!program.date) return false;
            
            // 날짜 비교 시 timezone 문제 해결을 위해 날짜만 비교
            // 1. 프로그램 날짜의 시간 부분을 제거하고 표준 시간대로 변환
            const programDate = new Date(program.date);
            // 2. 로컬 시간대의 년,월,일 값만 가져옴
            const programYear = programDate.getFullYear();
            const programMonth = programDate.getMonth();
            const programDay = programDate.getDate();
            // 3. 위 값으로 시간 없는 새 Date 객체 생성 (로컬 기준)
            const normalizedProgramDate = new Date(programYear, programMonth, programDay);
            
            // 4. 현재 날짜의 년,월,일 값만 가져옴
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth();
            const currentDay = date.getDate();
            // 5. 위 값으로 시간 없는 새 Date 객체 생성 (로컬 기준)
            const normalizedCurrentDate = new Date(currentYear, currentMonth, currentDay);
            
            // 6. 날짜 부분만 비교 (시간 무시)
            const matches = normalizedProgramDate.getTime() === normalizedCurrentDate.getTime();
            
            if (matches) {
              console.log(`  매치된 프로그램: ID ${program.id} - ${program.program_name}`);
              console.log(`    프로그램 날짜: ${normalizedProgramDate.toString()}`);
              console.log(`    현재 날짜: ${normalizedCurrentDate.toString()}`);
            }
            
            return matches;
          });
          
          console.log(`[${dateStr}] 필터링된 프로그램 수: ${programs.length}`);
          
          // 2. 객실 배정 정보
          const roomAssignments = await prisma.roomAssignment.findMany({
            where: {
              date: {
                equals: new Date(dateStr),
              },
            },
            include: {
              room: true,
            },
          });
          
          // 3. 식사 정보
          const page3Data = await prisma.page3.findMany({
            where: {
              OR: [
                {
                  page1: {
                    start_date: {
                      lte: new Date(dateStr),
                    },
                    end_date: {
                      gte: new Date(dateStr),
                    },
                  },
                },
                {
                  // 해당 날짜에 식사 예약이 있는 경우도 포함
                  meal_plans: {
                    path: '$[*].date',
                    equals: dateStr
                  }
                }
              ]
            },
            select: {
              id: true,
              meal_plans: true,
              page1: {
                select: {
                  id: true,
                  group_name: true,
                  reservation_status: true,
                },
              },
            },
          });
          
          // 식사 정보 처리
          const meals = page3Data.flatMap(p3 => {
            try {
              const mealPlans = typeof p3.meal_plans === 'string' 
                ? JSON.parse(p3.meal_plans) 
                : p3.meal_plans || [];
              
              return mealPlans
                .filter(meal => meal.date === dateStr)
                .map(meal => {
                  // 식사 유형에 따른 시간 설정
                  let startTime, endTime;
                  if (meal.meal_type === 'breakfast' || meal.meal_type === '조식') {
                    startTime = '08:00';
                    endTime = '09:00';
                  } else if (meal.meal_type === 'lunch' || meal.meal_type === '중식') {
                    startTime = '12:00';
                    endTime = '13:00';
                  } else {
                    startTime = '18:00';
                    endTime = '19:00';
                  }
                  
                  const mealType = 
                    meal.meal_type === 'breakfast' ? '조식' : 
                    meal.meal_type === 'lunch' ? '중식' : '석식';
                  
                  return {
                    id: `meal-${p3.id}-${meal.id || Date.now()}`,
                    type: 'meal',
                    organization: p3.page1?.group_name || '',
                    programName: mealType,
                    location: '식당',
                    startTime,
                    endTime,
                    participants: meal.participants || 0,
                    reservation_status: p3.page1?.reservation_status || 'unknown'
                  };
                });
            } catch (e) {
              console.error('Error parsing meal plans:', e);
              return [];
            }
          });
          
          // 4. 장소 예약 정보
          const page3PlaceData = await prisma.page3.findMany({
            where: {
              OR: [
                {
                  page1: {
                    start_date: {
                      lte: new Date(dateStr),
                    },
                    end_date: {
                      gte: new Date(dateStr),
                    },
                  },
                },
                {
                  // 해당 날짜에 장소 예약이 있는 경우도 포함
                  place_reservations: {
                    path: '$[*].reservation_date',
                    equals: dateStr
                  }
                }
              ]
            },
            select: {
              id: true,
              place_reservations: true,
              page1: {
                select: {
                  id: true,
                  group_name: true,
                  reservation_status: true,
                },
              },
            },
          });
          
          // 장소 예약 정보 처리
          const places = page3PlaceData.flatMap(p3 => {
            try {
              const placeReservations = typeof p3.place_reservations === 'string' 
                ? JSON.parse(p3.place_reservations) 
                : p3.place_reservations || [];
              
              return placeReservations
                .filter(place => place.reservation_date === dateStr)
                .map(place => ({
                  id: `place-${p3.id}-${place.id || Date.now()}`,
                  type: 'place',
                  organization: p3.page1?.group_name || '',
                  programName: place.purpose || '장소 사용',
                  location: place.place_name,
                  startTime: place.start_time,
                  endTime: place.end_time,
                  participants: place.participants || 0,
                  reservation_status: p3.page1?.reservation_status || 'unknown'
                }));
            } catch (e) {
              console.error('Error parsing place reservations:', e);
              return [];
            }
          });
          
          // 모든 이벤트 병합
          const allEvents = [
            ...programs.map(p => ({
              id: `program-${p.id}`,
              type: 'program',
              organization: p.reservation?.page1?.group_name || '',
              programName: p.program_name || p.program || '',
              location: p.place_name || p.category_name || '',
              startTime: p.start_time || '',
              endTime: p.end_time || '',
              instructorName: p.instructor_name || '',
              participants: p.participants || 0,
              reservation_status: p.reservation?.page1?.reservation_status || 'unknown'
            })),
            ...meals.map(meal => ({
              ...meal,
              reservation_status: page3Data.find(p3 => meal.id.includes(`meal-${p3.id}`))?.page1?.reservation_status || 'unknown'
            })),
            ...places.map(place => ({
              ...place,
              reservation_status: page3PlaceData.find(p3 => place.id.includes(`place-${p3.id}`))?.page1?.reservation_status || 'unknown'
            })),
            ...roomAssignments.map(r => ({
              id: `room-${r.id}`,
              type: 'room',
              organization: r.organization,
              programName: '숙박',
              location: r.room_name,
              startTime: '00:00',
              endTime: '24:00',
              participants: r.occupancy,
              reservation_status: 'confirmed' // 룸 배정이 있다면 confirmed로 간주
            })),
          ];
          
          // 시간대별로 이벤트 그룹화
          const timeSlotsWithEvents = timeSlots.map(time => {
            const slotEvents = allEvents.filter(event => {
              // 이벤트 시작 시간과 종료 시간
              const eventStart = event.startTime ? event.startTime.substring(0, 5) : '00:00';
              const eventEnd = event.endTime ? event.endTime.substring(0, 5) : '23:59';
              
              // 시간 슬롯 정보
              const [slotHour, slotMinute] = time.split(':').map(Number);
              const slotTime = new Date();
              slotTime.setHours(slotHour, slotMinute, 0, 0);
              
              // 이벤트 시작/종료 시간
              const eventStartParts = eventStart.split(':').map(Number);
              const eventEndParts = eventEnd.split(':').map(Number);
              
              const eventStartTime = new Date();
              eventStartTime.setHours(eventStartParts[0], eventStartParts[1], 0, 0);
              
              const eventEndTime = new Date();
              eventEndTime.setHours(eventEndParts[0], eventEndParts[1], 0, 0);
              
              // 이벤트가 현재 시간 슬롯에 포함되는지 확인
              return slotTime >= eventStartTime && slotTime < eventEndTime;
            });
            
            return {
              time,
              events: slotEvents,
            };
          });
          
          return {
            date: dateStr,
            timeSlots: timeSlotsWithEvents,
          };
        })
      );
      
      return scheduleData;
    } catch (error) {
      console.error('Error fetching weekly schedule data:', error);
      throw new Error(`주간일정표 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 프로그램 시행보고 정보 가져오기
  getImplementationPlan: async (_, { month, startDate, endDate, reservationId }) => {
    try {
      // Determine date range based on provided parameters
      let startDateObj, endDateObj;
      
      if (month) {
        // Month-based search (existing functionality)
        const [year, monthNum] = month.split('-');
        startDateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        endDateObj = new Date(parseInt(year), parseInt(monthNum), 0); // Last day of month
      } else if (startDate && endDate) {
        // Week-based search (new functionality)
        startDateObj = new Date(startDate);
        endDateObj = new Date(endDate);
      } else {
        // Default to current month if no parameters provided
        const now = new Date();
        startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
        endDateObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
      
      // Build the query conditions
      const whereCondition = {
        start_date: {
          lte: endDateObj,
        },
        end_date: {
          gte: startDateObj,
        },
      };
      
      // Add reservation ID filter if provided
      if (reservationId) {
        whereCondition.id = reservationId;
      }
      
      // Fetch the reservations from the database
      const reservations = await prisma.page1.findMany({
        where: whereCondition,
        include: {
          page2_reservations: true,
          page3: true
        },
        orderBy: {
          start_date: 'asc'
        }
      });
      
      // Transform the data for the implementation plan
      const implementationPlans = reservations.map(reservation => {
        // Format the period
        const startDate = new Date(reservation.start_date);
        const endDate = new Date(reservation.end_date);
        const period = `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`;
        
        // Extract program information
        const programs = reservation.page2_reservations?.flatMap(page2 => {
          if (!page2.programs) return [];
          
          const programs = Array.isArray(page2.programs) 
            ? page2.programs 
            : JSON.parse(typeof page2.programs === 'string' ? page2.programs : '[]');
            
          return programs.map(program => {
            // Calculate participant counts
            const participantCount = parseInt(reservation.participant_count) || 0;
            const maleCount = Math.round(participantCount * 0.5); // Assuming 50/50 split
            const femaleCount = participantCount - maleCount;
            const instructorCount = Math.ceil(participantCount * 0.1); // Approx 1 instructor per 10 participants
            
            return {
              type: program.name || '일반 프로그램',
              male_count: maleCount || 0,
              female_count: femaleCount || 0,
              total_count: participantCount || 0,
              instructor_count: instructorCount || 0,
              total_with_instructors: (participantCount + instructorCount) || 0
            };
          });
        }) || [];
        
        // If no programs, add a default one
        if (programs.length === 0) {
          // Calculate participant counts
          const participantCount = parseInt(reservation.participant_count) || 0;
          const maleCount = Math.round(participantCount * 0.5); // Assuming 50/50 split
          const femaleCount = participantCount - maleCount;
          const instructorCount = Math.ceil(participantCount * 0.1);
          
          programs.push({
            type: '기본 프로그램',
            male_count: maleCount || 0,
            female_count: femaleCount || 0,
            total_count: participantCount || 0,
            instructor_count: instructorCount || 0,
            total_with_instructors: (participantCount + instructorCount) || 0
          });
        }
        
        // Extract service types
        const serviceTypes = (reservation.page2_reservations || []).map(page2 => ({
          name: page2.service_type || '일반',
          count: parseInt(reservation.participant_count) || 0
        }));
        
        // Extract meal information
        let mealInfo = [];
        if (reservation.page3?.meal_plans) {
          try {
            const mealPlans = typeof reservation.page3.meal_plans === 'string'
              ? JSON.parse(reservation.page3.meal_plans)
              : reservation.page3.meal_plans || [];
              
            mealInfo = mealPlans.map(meal => ({
              type: meal.meal_type || '일반식',
              date: meal.date || startDate.toISOString().split('T')[0],
              count: parseInt(meal.participants) || parseInt(reservation.participant_count) || 0
            }));
          } catch (e) {
            console.error('Error parsing meal plans:', e);
          }
        }
        
        // Extract accommodation information
        let accommodations = [];
        if (reservation.page3?.room_selections) {
          try {
            const roomSelections = typeof reservation.page3.room_selections === 'string'
              ? JSON.parse(reservation.page3.room_selections)
              : reservation.page3.room_selections || [];
              
            // Group by room type and count
            const roomCounts = {};
            roomSelections.forEach(room => {
              const roomName = room.room_type || room.room_name || '일반실';
              if (!roomCounts[roomName]) {
                roomCounts[roomName] = 0;
              }
              roomCounts[roomName] += parseInt(room.count) || 1;
            });
            
            accommodations = Object.entries(roomCounts).map(([roomName, count]) => ({
              room_name: roomName,
              count: count || 0
            }));
          } catch (e) {
            console.error('Error parsing room selections:', e);
          }
        }
        
        // Extract place reservations for events
        let events = '';
        if (reservation.page3?.place_reservations) {
          try {
            const placeReservations = typeof reservation.page3.place_reservations === 'string'
              ? JSON.parse(reservation.page3.place_reservations)
              : reservation.page3.place_reservations || [];
              
            events = placeReservations.map(place => place.place_name || '').join(', ');
          } catch (e) {
            console.error('Error parsing place reservations:', e);
          }
        }
        
        // Handle employee information
        let employeeInfo = [];
        if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
          const page2 = reservation.page2_reservations[0];
          if (page2.instructors) {
            try {
              const parsedInstructors = typeof page2.instructors === 'string'
                ? JSON.parse(page2.instructors)
                : page2.instructors || [];
              
              // Transform to match EmployeeInfo type
              employeeInfo = parsedInstructors.map(instructor => ({
                name: instructor.name || '',
                type: instructor.type || '일반',
                position: instructor.position || '강사'
              }));
            } catch (e) {
              console.error('Error parsing instructors:', e);
              // Default empty array is fine
            }
          }
        }
        
        // If no employee info found, add a default entry
        if (employeeInfo.length === 0) {
          employeeInfo = [{
            name: '담당자',
            type: '일반',
            position: '담당'
          }];
        }
        
        return {
          id: reservation.id,
          group_name: reservation.group_name,
          location: reservation.location || reservation.address || '',
          period,
          programs,
          service_types: serviceTypes.length > 0 ? serviceTypes : [{ 
            name: '일반', 
            count: parseInt(reservation.participant_count) || 0 
          }],
          meal_info: mealInfo,
          events,
          accommodations,
          employee_info: employeeInfo,
          etc_notes: reservation.remarks || ''
        };
      });
      
      return implementationPlans;
    } catch (error) {
      console.error('Error fetching implementation plan:', error);
      throw new Error(`시행계획 데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 수익 실적 보고서 정보 가져오기
  getUsageReport: async (_, { year, month, organization }) => {
    try {
      // 연도와 월에 따른 날짜 범위 설정
      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;
      
      const startDate = new Date(targetYear, targetMonth - 1, 1); // 해당 월의 첫째 날
      const endDate = new Date(targetYear, targetMonth, 0); // 해당 월의 마지막 날
      
      // 요일 가져오기 함수
      const getWeekday = (date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
      };
      
      // 1. 예약 데이터 조회 - Page1에서 해당 월에 종료하는 예약들
      const reservations = await prisma.page1.findMany({
        where: {
          end_date: {
            gte: startDate,
            lte: endDate
          },
          ...(organization ? { group_name: organization } : {})
        },
        include: {
          page2_reservations: true,
          page3: true,
        },
        orderBy: {
          end_date: 'asc'
        }
      });
      
      // 2. 각 예약에 대한 수익 데이터 변환
      const usageReports = [];
      
      for (const reservation of reservations) {
        const endDate = new Date(reservation.end_date);
        const day = endDate.getDate();
        const weekday = getWeekday(endDate);
        
        // 숙박 비용 계산
        let roomAmount = 0;
        if (reservation.page3?.room_selections) {
          try {
            const roomSelections = typeof reservation.page3.room_selections === 'string'
              ? JSON.parse(reservation.page3.room_selections)
              : reservation.page3.room_selections || [];
            
            roomSelections.forEach(room => {
              roomAmount += (room.price || 0) * (room.nights || 0);
            });
          } catch(e) {
            console.error('Error parsing room selections:', e);
          }
        }
        
        // 식사 비용 계산
        let foodAmount = 0;
        if (reservation.page3?.meal_plans) {
          try {
            const mealPlans = typeof reservation.page3.meal_plans === 'string'
              ? JSON.parse(reservation.page3.meal_plans)
              : reservation.page3.meal_plans || [];
            
            mealPlans.forEach(meal => {
              foodAmount += meal.price || 0;
            });
          } catch(e) {
            console.error('Error parsing meal plans:', e);
          }
        }
        
        // 프로그램 비용 계산
        let programAmount = 0;
        for (const page2 of reservation.page2_reservations) {
          for (const program of page2.programs || []) {
            programAmount += program.price || 0;
          }
        }
        
        // 장소 사용 비용 계산
        let facilityAmount = 0;
        if (reservation.page3?.place_reservations) {
          try {
            const placeReservations = typeof reservation.page3.place_reservations === 'string'
              ? JSON.parse(reservation.page3.place_reservations)
              : reservation.page3.place_reservations || [];
            
            placeReservations.forEach(place => {
              facilityAmount += place.price || 0;
            });
          } catch(e) {
            console.error('Error parsing place reservations:', e);
          }
        }
        
        // 부가세 계산 (10%)
        const subtotal = roomAmount + foodAmount + programAmount + facilityAmount;
        const vat = Math.round(subtotal * 0.1);
        
        // 할인 적용 (reservation.discount_amount 또는 reservation.discount_rate 필드 활용)
        const discountAmount = reservation.discount_amount || 0;
        
        // 총액 계산
        const totalAmount = subtotal + vat - discountAmount;
        
        // 고객 유형 (카테고리) 확인
        let customerType = '일반';
        if (reservation.business_category) {
          if (['교육기관', '학교'].includes(reservation.business_category)) {
            customerType = '교육기관';
          } else if (['기업', '공공기관'].includes(reservation.business_category)) {
            customerType = '기업';
          } else if (['복지시설', '사회공헌'].includes(reservation.business_category)) {
            customerType = '사회공헌';
          }
        }
        
        // 서비스 유형 확인 (page2_reservations의 첫 번째 항목 사용)
        let serviceType = '일반';
        if (reservation.page2_reservations.length > 0) {
          serviceType = reservation.page2_reservations[0].service_type || '일반';
        }
        
        // 결제 방법 정보 (실제로는 다른 테이블에서 가져와야 할 수 있음)
        const paymentMethod = reservation.payment_method || '입금';
        
        // 결제 코드 (회계 코드) - 실제 데이터에 맞게 수정
        const paymentCodeMap = {
          '교육기관': '45310',
          '사회공헌': '45315',
          '복지': '45317',
          '기업': '45321',
          '일반': '45324'
        };
        const paymentCode = paymentCodeMap[serviceType] || '45349';
        
        // 결제 날짜 (일반적으로 예약 종료일 또는 그 이후)
        const receiptDate = reservation.payment_date || reservation.end_date.toISOString().split('T')[0];
        
        // 비고 필드
        const notes = reservation.notes || '';
        
        // 보고서 항목 추가
        usageReports.push({
          id: `${reservation.id}`,
          month: `${targetMonth}월`,
          day,
          weekday,
          usage_type: '단체',
          customer_type: customerType,
          service_type: serviceType,
          organization: reservation.group_name,
          amount: roomAmount,
          food_amount: foodAmount,
          program_amount: programAmount,
          facility_amount: facilityAmount,
          etc_amount: 0,
          vat,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_code: paymentCode,
          receipt_date: receiptDate,
          notes
        });
      }
      
      // 날짜순 정렬
      usageReports.sort((a, b) => a.day - b.day);
      
      return usageReports;
    } catch (error) {
      console.error('Error fetching usage report data:', error);
      throw new Error(`수익 실적 보고서 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 수익 실적 보고서를 위한 단체 목록 가져오기
  getOrganizationsForUsageReport: async (_, { year, month }) => {
    try {
      // 연도와 월에 따른 날짜 범위 설정 (선택적)
      const targetYear = year || new Date().getFullYear();
      const targetMonth = month || new Date().getMonth() + 1;
      
      const startDate = new Date(targetYear, targetMonth - 1, 1); // 해당 월의 첫째 날
      const endDate = new Date(targetYear, targetMonth, 0); // 해당 월의 마지막 날
      
      let whereCondition = {};
      
      // 연도와 월이 제공된 경우 해당 기간 내의 예약만 필터링
      if (year && month) {
        whereCondition = {
          end_date: {
            gte: startDate,
            lte: endDate
          }
        };
      }
      
      // 실제 데이터베이스에서 단체명 가져오기
      const organizations = await prisma.page1.findMany({
        where: whereCondition,
        select: {
          group_name: true
        },
        distinct: ['group_name'],
        orderBy: {
          group_name: 'asc'
        }
      });
      
      // 고유한 단체명 목록 반환
      return organizations.map(org => ({
        name: org.group_name
      }));
    } catch (error) {
      console.error('Error fetching organizations for usage report:', error);
      throw new Error(`수익 실적 보고서를 위한 단체 목록을 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 강사비 지급 정보 가져오기
  getInstructorPayments: async (_, { year, month, startDate, endDate, instructorName }) => {
    try {
      let searchStartDate, searchEndDate;
      let targetYear, targetMonth;
      
      // 날짜 범위 설정 (startDate/endDate가 있으면 우선 사용)
      if (startDate && endDate) {
        searchStartDate = new Date(startDate);
        searchEndDate = new Date(endDate);
        // 종료일은 해당 일자의 마지막 시간으로 설정
        searchEndDate.setHours(23, 59, 59, 999);
        
        // 시작 날짜에서 연도와 월 추출 (date range 모드에서 사용)
        targetYear = searchStartDate.getFullYear();
        targetMonth = searchStartDate.getMonth() + 1;
      } else {
        // 연도와 월에 따른 날짜 범위 설정
        targetYear = year || new Date().getFullYear();
        targetMonth = month || new Date().getMonth() + 1;
        
        searchStartDate = new Date(targetYear, targetMonth - 1, 1); // 해당 월의 첫째 날
        searchEndDate = new Date(targetYear, targetMonth, 0); // 해당 월의 마지막 날
        searchEndDate.setHours(23, 59, 59, 999);
      }
      
      // 요일 가져오기 함수
      const getWeekday = (date) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return days[date.getDay()];
      };
      
      // 1. 강사 목록 조회 (모든 유형 - 강사, 보조강사, 힐링헬퍼 포함)
      const instructors = await prisma.instructor.findMany({
        where: instructorName ? { name: instructorName } : {},
        orderBy: { name: 'asc' }
      });
      
      // 2. 해당 기간의 프로그램 데이터 조회 (Page2)
      const programData = await prisma.page2Program.findMany({
        where: {
          date: {
            gte: searchStartDate,
            lte: searchEndDate
          },
          ...(instructorName ? { 
            OR: [
              { instructor_name: instructorName },
              { assistant_instructor_name: instructorName },
              { healing_helper_name: instructorName }
            ]
          } : {})
        },
        include: {
          reservation: {
            include: {
              page1: true
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { instructor_name: 'asc' }
        ]
      });
      
      // 3. 강사비 지급 정보 생성
      const instructorPayments = [];
      
      for (const program of programData) {
        // 주 강사 정보 처리
        // 강사비 정산: 내부강사 강사비 제외, 힐링헬퍼/보조강사 비용 포함
        if (program.instructor_name) {
          const programDate = new Date(program.date);
          const day = programDate.getDate();
          const weekday = getWeekday(programDate);
          
          // 강사 정보 찾기
          const instructor = instructors.find(i => i.name === program.instructor_name) || {
            type: '일반',
            category: '강사',
            payment_rate: 200000,
            tax_rate: 0.033
          };
          
          // 내부강사인지 확인
          // category가 '강사'이고 type이 '내부'인 경우만 내부강사로 간주
          const isInternalInstructor = instructor.category === '강사' && instructor.type === '내부';
          
          // 내부강사는 강사비 제외 (주 강사비는 포함하지 않음)
          // 외부강사, 보조강사, 힐링헬퍼는 모두 포함
          if (!isInternalInstructor) {
            // 강사비 계산
            let paymentAmount = instructor.payment_rate || 0;
            let taxRate = instructor.tax_rate || 0.033;
            
            // 세금 계산 (차감할 금액)
            const taxAmount = Math.round(paymentAmount * taxRate);
            
            // 최종 지급액
            const finalAmount = paymentAmount - taxAmount;
            
            // 단체명 및 업종 구하기
            const organization = program.reservation?.page1?.group_name || '미정';
            const businessCategory = program.reservation?.page1?.business_category || '일반';
            
            instructorPayments.push({
              id: `${program.id}-instructor`,
              month: `${targetMonth}월`,
              day,
              weekday,
              instructor_name: program.instructor_name,
              instructor_type: instructor.type || '일반',
              instructor_category: instructor.category || '강사',
              organization,
              business_category: businessCategory,
              program_name: program.program_name || '프로그램',
              date: programDate.toISOString().split('T')[0],
              time: `${program.start_time || ''}~${program.end_time || ''}`,
              sessions: 1,
              payment_amount: paymentAmount,
              tax_amount: taxAmount,
              final_amount: finalAmount,
              payment_date: null,
              assistant_instructor_name: program.assistant_name || null,
              assistant_instructor_fee: program.assistant_name ? 60000 : 0,
              healing_helper_name: program.helper_name || null,
              healing_helper_fee: program.helper_name ? 50000 : 0
            });
          } else {
            // 내부강사인 경우 보조강사와 힐링헬퍼 비용만 포함
            const organization = program.reservation?.page1?.group_name || '미정';
            const businessCategory = program.reservation?.page1?.business_category || '일반';
            
            // 보조강사와 힐링헬퍼 비용만 포함하는 항목 추가
            if (program.assistant_name || program.helper_name) {
              instructorPayments.push({
                id: `${program.id}-internal-assistant-helper`,
                month: `${targetMonth}월`,
                day,
                weekday,
                instructor_name: program.instructor_name,
                instructor_type: instructor.type || '내부',
                instructor_category: instructor.category || '강사',
                organization,
                business_category: businessCategory,
                program_name: program.program_name || '프로그램',
                date: programDate.toISOString().split('T')[0],
                time: `${program.start_time || ''}~${program.end_time || ''}`,
                sessions: 1,
                payment_amount: 0, // 내부강사 강사비는 0
                tax_amount: 0,
                final_amount: 0,
                payment_date: null,
                assistant_instructor_name: program.assistant_name || null,
                assistant_instructor_fee: program.assistant_name ? 60000 : 0,
                healing_helper_name: program.helper_name || null,
                healing_helper_fee: program.helper_name ? 50000 : 0
              });
            }
          }
        }
        
        // 보조강사가 있는 경우 처리
        if (program.assistant_name) {
          const programDate = new Date(program.date);
          const day = programDate.getDate();
          const weekday = getWeekday(programDate);
          
          // 해당 보조강사 정보 찾기
          const assistantInstructor = instructors.find(i => i.name === program.assistant_name) || {
            type: '일반',
            category: '보조강사',
            payment_rate: 60000,
            tax_rate: 0.033
          };
          
          // 보조강사 세금 계산
          let paymentAmount = assistantInstructor.payment_rate || 60000;
          let taxRate = assistantInstructor.tax_rate || 0.033;
          
          // 세금 계산 (차감할 금액)
          const taxAmount = Math.round(paymentAmount * taxRate);
          
          // 최종 지급액
          const finalAmount = paymentAmount - taxAmount;
          
          // 단체명 및 업종 구하기
          const organization = program.reservation?.page1?.group_name || '미정';
          const businessCategory = program.reservation?.page1?.business_category || '일반';
          
          instructorPayments.push({
            id: `${program.id}-assistant`,
            month: `${targetMonth}월`,
            day,
            weekday,
            instructor_name: program.assistant_name,
            instructor_type: assistantInstructor.type || '일반',
            instructor_category: assistantInstructor.category || '보조강사',
            organization,
            business_category: businessCategory,
            program_name: program.program_name || '프로그램',
            date: programDate.toISOString().split('T')[0],
            time: `${program.start_time || ''}~${program.end_time || ''}`,
            sessions: 1,
            payment_amount: paymentAmount,
            tax_amount: taxAmount,
            final_amount: finalAmount,
            payment_date: null,
            assistant_instructor_name: null,
            assistant_instructor_fee: 0,
            healing_helper_name: program.helper_name || null,
            healing_helper_fee: program.helper_name ? 50000 : 0
          });
        }
        
        // 힐링헬퍼가 있는 경우 처리
        if (program.helper_name) {
          const programDate = new Date(program.date);
          const day = programDate.getDate();
          const weekday = getWeekday(programDate);
          
          // 해당 힐링헬퍼 정보 찾기
          const healingHelper = instructors.find(i => i.name === program.helper_name) || {
            type: '일반',
            category: '힐링헬퍼',
            payment_rate: 50000,
            tax_rate: 0.033
          };
          
          // 힐링헬퍼 세금 계산
          let paymentAmount = healingHelper.payment_rate || 50000;
          let taxRate = healingHelper.tax_rate || 0.033;
          
          // 세금 계산 (차감할 금액)
          const taxAmount = Math.round(paymentAmount * taxRate);
          
          // 최종 지급액
          const finalAmount = paymentAmount - taxAmount;
          
          // 단체명 및 업종 구하기
          const organization = program.reservation?.page1?.group_name || '미정';
          const businessCategory = program.reservation?.page1?.business_category || '일반';
          
          instructorPayments.push({
            id: `${program.id}-helper`,
            month: `${targetMonth}월`,
            day,
            weekday,
            instructor_name: program.helper_name,
            instructor_type: healingHelper.type || '일반',
            instructor_category: healingHelper.category || '힐링헬퍼',
            organization,
            business_category: businessCategory,
            program_name: program.program_name || '프로그램',
            date: programDate.toISOString().split('T')[0],
            time: `${program.start_time || ''}~${program.end_time || ''}`,
            sessions: 1,
            payment_amount: paymentAmount,
            tax_amount: taxAmount,
            final_amount: finalAmount,
            payment_date: null,
            assistant_instructor_name: program.assistant_name || null,
            assistant_instructor_fee: program.assistant_name ? 60000 : 0,
            healing_helper_name: null,
            healing_helper_fee: 0
          });
        }
      }
      
      // 결과가 없는 경우 테스트 데이터 생성
      if (instructorPayments.length === 0 && instructors.length > 0) {
        // 테스트 데이터 생성에 필요한 날짜 범위 계산
        let daysInMonth;
        if (searchEndDate instanceof Date) {
          // searchEndDate가 Date 객체인 경우
          daysInMonth = searchEndDate.getDate();
        } else if (typeof searchEndDate === 'string') {
          // searchEndDate가 문자열인 경우
          daysInMonth = new Date(searchEndDate).getDate();
        } else {
          // 기본값 설정 (한 달을 30일로 가정)
          daysInMonth = 30;
        }
        
        for (const instructor of instructors) {
          // 테스트 데이터 생성 (각 강사별 랜덤 일자에 1-3개의 프로그램)
          const programCount = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < programCount; i++) {
            const day = Math.floor(Math.random() * daysInMonth) + 1;
            const date = new Date(targetYear, targetMonth - 1, day);
            const weekday = getWeekday(date);
            
            // 강사 유형에 따라 지급액 다르게 설정
            let paymentAmount = 0;
            if (instructor.category === '보조강사') {
              paymentAmount = instructor.payment_rate || 100000;
            } else if (instructor.category === '힐링헬퍼') {
              paymentAmount = instructor.payment_rate || 50000;
            } else {
              paymentAmount = instructor.payment_rate || 200000;
            }
            
            // 일부는 0원 지급 테스트
            if (i === 0 && Math.random() < 0.2) {
              paymentAmount = 0;
            }
            
            const taxRate = instructor.tax_rate || 0.033;
            const taxAmount = Math.round(paymentAmount * taxRate);
            const finalAmount = paymentAmount - taxAmount;
            
            // 프로그램 이름 (테스트용)
            const programNames = ['숲체험', '도자체험', '요리교실', '명상 프로그램', '생태교육'];
            const programName = programNames[Math.floor(Math.random() * programNames.length)];
            
            // 단체명 (테스트용)
            const organizations = ['남동청소년센터', '구립한내지역아동센터', '서초구드림스타트'];
            const organization = organizations[Math.floor(Math.random() * organizations.length)];
            
            // 시간 (테스트용)
            const timeSlots = ['09:00~12:00', '13:00~16:00', '14:00~17:00'];
            const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            
            // 사업구분 (테스트용)
            const businessCategories = ['social_contribution', 'profit_business', 'preparation', 'default'];
            const businessCategory = businessCategories[Math.floor(Math.random() * businessCategories.length)];
            
            instructorPayments.push({
              id: `test-${instructor.id}-${date.getTime()}-${i}`,
              month: `${targetMonth}월`,
              day,
              weekday,
              instructor_name: instructor.name,
              instructor_type: instructor.type || '일반',
              instructor_category: instructor.category || '강사',
              organization,
              business_category: businessCategory,
              program_name: programName,
              date: date.toISOString().split('T')[0],
              time: timeSlot,
              sessions: 1,
              payment_amount: paymentAmount,
              tax_amount: taxAmount,
              final_amount: finalAmount,
              payment_date: null
            });
          }
        }
      }
      
      // 날짜순 정렬
      instructorPayments.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.instructor_name.localeCompare(b.instructor_name);
      });
      
      return instructorPayments;
      
    } catch (error) {
      console.error('Error fetching instructor payment data:', error);
      throw new Error(`강사비 지급 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 강사 목록 가져오기
  getInstructors: async () => {
    try {
      // 실제 데이터베이스에서 강사 목록 조회
      const instructors = await prisma.instructor.findMany({
        orderBy: { name: 'asc' }
      });
      
      // 강사 목록이 비어있는 경우 기본 데이터 반환
      if (instructors.length === 0) {
        return [
          { id: 1, name: '이준상', type: '일반', category: '강사' },
          { id: 2, name: '조희숙', type: '일반', category: '강사' },
          { id: 3, name: '공명자', type: '기타소득', category: '강사' },
          { id: 4, name: '백현숙', type: '일반', category: '헬퍼' },
          { id: 5, name: '이순금', type: '일반', category: '헬퍼' }
        ];
      }
      
      return instructors;
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new Error(`강사 목록을 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  },
  
  // 강사비 지급 월별 요약 정보 가져오기
  getMonthlyInstructorSummary: async (_, { year, month, startDate, endDate }) => {
    try {
      // 강사비 지급 정보 가져오기 (기간별 혹은 월별)
      let paymentData;
      let targetYear, targetMonth;
      
      if (startDate && endDate) {
        // startDate와 endDate로 조회
        paymentData = await module.exports.getInstructorPayments(_, { 
          startDate, 
          endDate 
        });
        
        // 시작 날짜에서 연도와 월 추출 (요약 정보 제목용)
        const startDateObj = new Date(startDate);
        targetYear = startDateObj.getFullYear();
        targetMonth = startDateObj.getMonth() + 1;
      } else {
        // 연도와 월에 따른 날짜 범위 설정
        targetYear = year || new Date().getFullYear();
        targetMonth = month || new Date().getMonth() + 1;
        
        // 해당 월의 강사비 지급 정보 가져오기
        paymentData = await module.exports.getInstructorPayments(_, { 
          year: targetYear, 
          month: targetMonth 
        });
      }
      
      // 요약 정보 계산
      const uniqueInstructors = new Set();
      let totalAmount = 0;
      let totalTax = 0;
      let totalFinalAmount = 0;
      let totalAssistantFee = 0;
      let totalHelperFee = 0;
      let sessionCount = 0;
      
      paymentData.forEach(payment => {
        uniqueInstructors.add(payment.instructor_name);
        totalAmount += payment.payment_amount;
        totalTax += payment.tax_amount;
        totalFinalAmount += payment.final_amount;
        
        // Add assistant and helper fees to the totals
        if (payment.assistant_instructor_fee) {
          totalAssistantFee += payment.assistant_instructor_fee;
        }
        
        if (payment.healing_helper_fee) {
          totalHelperFee += payment.healing_helper_fee;
        }
        
        sessionCount += payment.sessions;
      });
      
      return {
        month: `${targetMonth}월`,
        year: targetYear,
        total_amount: totalAmount,
        total_tax: totalTax,
        total_final_amount: totalFinalAmount,
        total_assistant_fee: totalAssistantFee,
        total_helper_fee: totalHelperFee,
        instructor_count: uniqueInstructors.size,
        session_count: sessionCount
      };
    } catch (error) {
      console.error('Error fetching monthly instructor summary:', error);
      throw new Error(`강사비 지급 월별 요약 정보를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
  }
};
