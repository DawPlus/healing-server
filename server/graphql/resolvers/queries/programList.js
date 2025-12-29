// 공유 Prisma 인스턴스 사용
const prisma = require('../../../prisma/prismaClient');

/**
 * 세부내역 배열을 포맷팅하는 함수
 * 2개 이상일 때는 처음 2개만 보여주고 "외 N개" 추가
 */
const formatDetails = (detailsArray) => {
  console.log('[formatDetails] 입력 데이터:', detailsArray);
  
  if (!detailsArray || detailsArray.length === 0) {
    console.log('[formatDetails] 빈 배열, 빈 문자열 반환');
    return '';
  }
  
  // 빈 값, null, undefined, 빈 문자열, 숫자만 있는 문자열 필터링
  const validDetails = detailsArray.filter(detail => {
    if (!detail) return false;
    const trimmed = detail.toString().trim();
    if (trimmed === '') return false;
    // 숫자만 있는 문자열 제외 (예: "23", "123" 등)
    if (/^\d+$/.test(trimmed)) return false;
    return true;
  });
  
  console.log('[formatDetails] 필터링된 유효한 세부내역:', validDetails);
  
  if (validDetails.length === 0) {
    console.log('[formatDetails] 유효한 세부내역 없음, 빈 문자열 반환');
    return '';
  }
  
  if (validDetails.length <= 2) {
    const result = validDetails.join(', ');
    console.log('[formatDetails] 2개 이하, 전체 반환:', result);
    return result;
  }
  
  // 2개 이상인 경우: 처음 2개만 보여주고 "외 N개" 추가
  const firstTwo = validDetails.slice(0, 2).join(', ');
  const remainingCount = validDetails.length - 2;
  const result = `${firstTwo} 외 ${remainingCount}개`;
  console.log('[formatDetails] 3개 이상, 축약된 형태 반환:', result);
  return result;
};

/**
 * 프로그램 목록 조회 resolver
 * 시작일과 종료일 기준으로 프로그램 목록 조회
 */
const getProgramList = async (_, { openDay, endDay }) => {
  try {
    // 프로그램 목록을 실제 데이터베이스에서 조회
    // Page2에서 service_type이 존재하는 데이터 조회
    let whereCondition = {};
    
    // 날짜 필터링 조건 추가
    if (openDay && endDay) {
      whereCondition = {
        ...whereCondition,
        page1: {
          start_date: {
            gte: new Date(openDay)
          },
          end_date: {
            lte: new Date(endDay)
          }
        }
      };
    } else if (openDay) {
      whereCondition = {
        ...whereCondition,
        page1: {
          start_date: {
            gte: new Date(openDay)
          }
        }
      };
    } else if (endDay) {
      whereCondition = {
        ...whereCondition,
        page1: {
          end_date: {
            lte: new Date(endDay)
          }
        }
      };
    }
    
    // service_type이 존재하는 page2 데이터 조회
    whereCondition = {
      ...whereCondition,
      service_type: {
        not: null
      }
    };
    
    // Page2 정보 조회하고 Page1 정보도 함께 불러오기
    const page2Data = await prisma.page2.findMany({
      where: whereCondition,
      include: {
        page1: true
      }
    });
    
    // ProgramList 형식에 맞게 데이터 변환
    const formattedData = page2Data.map(item => {
      return {
        BASIC_INFO_SEQ: item.id,
        AGENCY: item.page1?.group_name || '',
        OPENDAY: item.page1?.start_date ? new Date(item.page1.start_date).toISOString().split('T')[0] : '',
        ENDDAY: item.page1?.end_date ? new Date(item.page1.end_date).toISOString().split('T')[0] : '',
        SERVICE_TYPE: item.service_type || '',
        PART_MAN_CNT: item.male_count?.toString() || '0',
        PART_WOMAN_CNT: item.female_count?.toString() || '0',
        LEAD_MAN_CNT: item.male_leader_count?.toString() || '0',
        LEAD_WOMAN_CNT: item.female_leader_count?.toString() || '0',
        OM: item.page1?.operation_manager || item.page1?.reservation_manager || ''
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching program list:', error);
    throw new Error('Failed to fetch program list');
  }
};

/**
 * 프로그램 상세 정보 조회 resolver (detailed 버전 추가)
 */
const getProgramDetail = async (_, { seq, agency, openday, detailed = false }) => {
  try {
    console.log('[DEBUG] 받은 파라미터들:', { seq, agency, openday, detailed, detailedType: typeof detailed });
    
    // Will hold various data we collect
    let page2Data = { programs: [] };
    let basicInfo = {};
    let serviceList = [];
    let programSatisfaction = []; // Initialize programSatisfaction as empty array
    
    // Page2 상세 정보 조회
    page2Data = await prisma.page2.findUnique({
      where: { id: seq },
      include: {
        page1: true,
        programs: true
      }
    });
    
    if (!page2Data) {
      throw new Error(`No program details found for seq: ${seq}`);
    }
    
    // 프로그램 목록 출력
    console.log('\n[REPORT] Programs for agency:', agency);
    console.log(`Total programs count: ${page2Data.programs.length}`);
    
    // 프로그램 강사 정보 출력
    const reportInstructors = new Set();
    const reportAssistants = new Set();
    const reportHelpers = new Set();
    
    page2Data.programs.forEach((prog, idx) => {
      console.log(`[REPORT] Program ${idx+1}:`, {
        id: prog.id,
        program: prog.program,
        program_name: prog.program_name,
        category_name: prog.category_name,
        category: prog.category,
        instructor_name: prog.instructor_name,
        assistant_name: prog.assistant_name,
        helper_name: prog.helper_name
      });
      
      // Count unique instructors, assistants, helpers
      if (prog.instructor_name && prog.instructor_name.trim() !== '') {
        reportInstructors.add(prog.instructor_name);
      }
      
      if (prog.assistant_name && prog.assistant_name.trim() !== '') {
        reportAssistants.add(prog.assistant_name);
      }
      
      if (prog.helper_name && prog.helper_name.trim() !== '') {
        reportHelpers.add(prog.helper_name);
      }
    });
    
    console.log('\n[REPORT] Instructor summary:');
    console.log('Unique instructors:', Array.from(reportInstructors));
    console.log('Unique assistants:', Array.from(reportAssistants));
    console.log('Unique helpers:', Array.from(reportHelpers));
    console.log('Instructor count:', reportInstructors.size);
    console.log('Assistant count:', reportAssistants.size);
    console.log('Helper count:', reportHelpers.size);
    console.log('Total external count (assistants + helpers):', reportAssistants.size + reportHelpers.size);
    
    // Validate that the requested agency matches the agency in the database
    if (page2Data.page1 && page2Data.page1.group_name !== agency) {
      console.log(`[REPORT] Warning: Requested agency (${agency}) doesn't match page2Data.page1.group_name (${page2Data.page1.group_name})`);
    }
    
    // Ensure we're only processing programs for this specific page/agency
    const programsForThisAgency = page2Data.programs;
    console.log(`[DEBUG] Found ${programsForThisAgency.length} programs for agency: ${agency}`);
    
    // Page3 관련 정보 조회
    const page3Data = await prisma.page3.findUnique({
      where: { page1_id: page2Data.page1_id }
    });
    
    // Page4 관련 정보 조회
    const page4Data = await prisma.page4.findMany({
      where: { page1_id: page2Data.page1_id },
      include: {
        materials: true,
        expenses: true
      }
    });

    // Get all instructors for the system
    const allInstructors = await prisma.instructor.findMany();
    
    console.log(`[DEBUG] Loaded ${allInstructors.length} instructors from the database`);
    
    // Map instructor IDs from Page2Program to actual instructor records
    // Extract instructor IDs from programs - use programInstructorIds to avoid redeclaration
    const programInstructorIds = page2Data.programs
      .filter(p => p.instructor)
      .map(p => parseInt(p.instructor))
      .filter(id => !isNaN(id)); // Filter out any NaN values
    
    console.log(`[DEBUG] Extracted ${programInstructorIds.length} valid instructor IDs from programs`);
    console.log('[DEBUG] Instructor IDs:', programInstructorIds);
    
    // Count internal and external instructors
    const internalInstructors = new Set();
    const externalInstructors = new Set();
    
    // For each program, add a reference to its instructor object if available
    const programsWithInstructorData = page2Data.programs.map(program => {
      if (program.instructor) {
        const instructorId = parseInt(program.instructor);
        if (!isNaN(instructorId)) {
          const instructorData = allInstructors.find(i => i.id === instructorId);
          if (instructorData) {
            // Store internal/external classification for debugging
            if (instructorData.type === '내부') {
              internalInstructors.add(instructorId);
            } else {
              externalInstructors.add(instructorId);
            }
            
            return {
              ...program,
              instructorData: instructorData
            };
          }
        }
      }
      // If there's an instructor_name but no matching instructor data, assume external
      if (program.instructor_name && !program.instructorData) {
        externalInstructors.add(program.instructor_name);
      }
      return program;
    });
    
    console.log(`[DEBUG] Internal instructors (${internalInstructors.size}):`, Array.from(internalInstructors));
    console.log(`[DEBUG] External instructors (${externalInstructors.size}):`, Array.from(externalInstructors));
    
    // Update page2Data with the enhanced programs
    page2Data.programs = programsWithInstructorData;

    // PageFinal 정보 조회 (민원사항, 수입/지출 금액)
    
    const pageFinalData = await prisma.pageFinal.findUnique({
      where: { page1_id: page2Data.page1_id },
      include: {
        teacher_expenses: true,
        participant_expenses: true,
        income_items: true
      }
    });
    

    
    // 체류일수 계산 (+1 추가)
    const stayDays = page2Data.page1?.end_date && page2Data.page1?.start_date ? 
      Math.ceil((new Date(page2Data.page1.end_date) - new Date(page2Data.page1.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 1;
    
    // 객실 수 계산 (참여자/인솔자)
    const participantRoomCount = Math.ceil((page2Data.male_count + page2Data.female_count) / 4); // 참여자 객실 (4명 기준)
    const leaderRoomCount = Math.ceil((page2Data.male_leader_count + page2Data.female_leader_count) / 2); // 인솔자 객실 (2명 기준)
    
    // Page3의 room_selections에서 스탠다드룸과 디럭스룸 개수 계산 (Page5 status 로직 참고)
    let standardRoomCount = 0;
    let deluxeRoomCount = 0;
    let totalRoomCount = 0;
    
    console.log('[ProgramList Server] Page3 room_selections 처리 시작');
    console.log('[ProgramList Server] page3Data:', page3Data);
    
    if (page3Data && page3Data.room_selections) {
      try {
        const roomSelections = JSON.parse(page3Data.room_selections);
        // Room selections logic without logs
        for (const selection of roomSelections) {
          if (selection.room_type === 'standard') {
            standardRoomCount += selection.count;
          } else if (selection.room_type === 'deluxe') {
            deluxeRoomCount += selection.count;
          }
        }
          totalRoomCount = standardRoomCount + deluxeRoomCount;
          
        // Page5 status logic without logs
        if (page2Data.page1 && page2Data.page1.status === 'arrival_completed') {
          totalRoomCount = Math.max(totalRoomCount, participantRoomCount + leaderRoomCount + 2);
        }
      } catch (e) {
        totalRoomCount = participantRoomCount + leaderRoomCount + 2;
      }
    } else {
      totalRoomCount = participantRoomCount + leaderRoomCount + 2;
    }
    
    console.log('[ProgramList Server] 최종 객실 수 계산 결과:', standardRoomCount, deluxeRoomCount, totalRoomCount);
    
    // Page3의 식사 계획에서 총 식사 인원 계산
    let totalMealParticipants = 0;
    console.log('[ProgramList Server] Page3 식사 계획 처리 시작');
    console.log('[ProgramList Server] page3Data:', page3Data);
    
    if (page3Data && page3Data.meal_plans) {
      try {
        const mealPlans = JSON.parse(page3Data.meal_plans);
        // Meal plans logic without logs
        for (const plan of mealPlans) {
          if (plan.participants) {
            totalMealParticipants = Math.max(totalMealParticipants, plan.participants);
          }
        }
      } catch (e) {
        totalMealParticipants = page2Data.male_count + page2Data.female_count + page2Data.male_leader_count + page2Data.female_leader_count;
      }
    } else {
      totalMealParticipants = page2Data.male_count + page2Data.female_count + page2Data.male_leader_count + page2Data.female_leader_count;
    }
    
    console.log('[ProgramList Server] 최종 식사 총 인원:', totalMealParticipants);
    
    // 식사 수 계산 (참여자/인솔자)
    const mealPerDay = 3; // 3식 기준
    const participantMealCount = (page2Data.male_count + page2Data.female_count) * stayDays * mealPerDay;
    const leaderMealCount = (page2Data.male_leader_count + page2Data.female_leader_count) * stayDays * mealPerDay;
    
    // 참여자 객실 및 식사 정보 조회
    const participantRooms = await prisma.participantRoom.findMany({
      where: {
        page1_id: page2Data.page1_id
      }
    });

    const participantMeals = await prisma.participantMeal.findMany({
      where: {
        page1_id: page2Data.page1_id
      }
    });

    // 객실 데이터 매핑
    let roomPartPeople = (page2Data.male_count + page2Data.female_count).toString() || '0';
    let roomPartRoom = participantRoomCount.toString();
    let roomLeadPeople = (page2Data.male_leader_count + page2Data.female_leader_count).toString() || '0';
    let roomLeadRoom = leaderRoomCount.toString();
    let roomEtcPeople = '0';
    let roomEtcRoom = '0';

    // 식사 데이터 매핑
    let mealType = (page3Data?.meal_plans) ? '3' : '0';
    let mealPart = participantMealCount.toString();
    let mealLead = leaderMealCount.toString();
    let mealEtc = '0';

    // 사용자 입력 객실 데이터로 덮어쓰기
    if (participantRooms.length > 0) {
      // 참여자 인원
      const participantPeopleRoom = participantRooms.find(room => room.room_type === '참여자');
      if (participantPeopleRoom) {
        roomPartPeople = participantPeopleRoom.count.toString();
      }
      
      // 참여자 객실
      const participantRoomsRoom = participantRooms.find(room => room.room_type === '참여자_rooms');
      if (participantRoomsRoom) {
        roomPartRoom = participantRoomsRoom.count.toString();
      }
      
      // 인솔자 인원
      const leaderPeopleRoom = participantRooms.find(room => room.room_type === '인솔자');
      if (leaderPeopleRoom) {
        roomLeadPeople = leaderPeopleRoom.count.toString();
      }
      
      // 인솔자 객실
      const leaderRoomsRoom = participantRooms.find(room => room.room_type === '인솔자_rooms');
      if (leaderRoomsRoom) {
        roomLeadRoom = leaderRoomsRoom.count.toString();
      }
      
      // 기타 인원
      const etcPeopleRoom = participantRooms.find(room => room.room_type === '기타');
      if (etcPeopleRoom) {
        roomEtcPeople = etcPeopleRoom.count.toString();
      }
      
      // 기타 객실
      const etcRoomsRoom = participantRooms.find(room => room.room_type === '기타_rooms');
      if (etcRoomsRoom) {
        roomEtcRoom = etcRoomsRoom.count.toString();
      }
    }

    // 사용자 입력 식사 데이터로 덮어쓰기
    if (participantMeals.length > 0) {
      // 식사 횟수
      const mealCountMeal = participantMeals.find(meal => meal.meal_type === '식사횟수');
      if (mealCountMeal) {
        mealType = mealCountMeal.count.toString();
      }
      
      // 참여자 인원
      const participantMeal = participantMeals.find(meal => meal.meal_type === '참여자인원');
      if (participantMeal) {
        mealPart = participantMeal.count.toString();
      }
      
      // 인솔자 인원
      const leaderMeal = participantMeals.find(meal => meal.meal_type === '인솔자인원');
      if (leaderMeal) {
        mealLead = leaderMeal.count.toString();
      }
      
      // 기타 인원
      const etcMeal = participantMeals.find(meal => meal.meal_type === '기타인원');
      if (etcMeal) {
        mealEtc = etcMeal.count.toString();
      }
    }
    
    // Make sure mealType is a valid numeric string
    mealType = (!isNaN(parseInt(mealType))) ? mealType : '0';
    
    // 기본 정보 구성
    basicInfo = {
      BASIC_INFO_SEQ: seq,
      AGENCY: agency,
      OM: page2Data.page1?.operation_manager || page2Data.page1?.reservation_manager || '',
      OPENDAY: page2Data.page1?.start_date ? new Date(page2Data.page1.start_date).toISOString().split('T')[0] : '',
      DAYS_TO_STAY: stayDays.toString(),
      RESIDENCE: page2Data.page1?.region || '', // 지역 정보
      PART_MAN_CNT: page2Data.male_count || 0,
      PART_WOMAN_CNT: page2Data.female_count || 0,
      LEAD_MAN_CNT: page2Data.male_leader_count || 0,
      LEAD_WOMAN_CNT: page2Data.female_leader_count || 0,
      SUPPORT: '', // 지원 정보는 별도로 저장되지 않음
      INCOME_TYPE: '', // 수입 유형 정보는 별도로 저장되지 않음
      PART_TYPE: page2Data.part_type || '',
      AGE_TYPE: page2Data.age_type || '',
      BIZ_PURPOSE: page2Data.page1?.business_category === 'business_profit' ? '수익사업' : '사회공헌',
      org_nature: page2Data?.org_nature || '', // 단체성격
      
      // 참여형태
      PROGRAM_IN_OUT: page2Data?.part_form || '',
      
      // 객실 및 식사 정보 업데이트
      ROOM_PART_PEOPLE: roomPartPeople,
      ROOM_PART_ROOM: roomPartRoom,
      MEAL_TYPE: mealType + '식',
      MEAL_PART: mealPart,
      ROOM_LEAD_PEOPLE: roomLeadPeople,
      ROOM_LEAD_ROOM: roomLeadRoom,
      MEAL_LEAD: mealLead,
      ROOM_ETC_PEOPLE: roomEtcPeople,
      ROOM_ETC_ROOM: roomEtcRoom,
      MEAL_ETC: mealEtc,
      // 민원사항
      PROGRAM_OPINION: pageFinalData?.complaint || '',
      SERVICE_OPINION: '',
      OVERALL_OPINION: '',
      SERVICE_TYPE: page2Data.service_type || '',
      STANDARD_ROOM_COUNT: standardRoomCount,
      DELUXE_ROOM_COUNT: deluxeRoomCount,
      TOTAL_ROOM_COUNT: totalRoomCount,
      TOTAL_MEAL_PARTICIPANTS: totalMealParticipants
    };
    
    // OM 디버깅
    console.log('[ProgramList Server] OM 디버깅:', {
      'page2Data.page1?.operation_manager': page2Data.page1?.operation_manager,
      'page2Data.page1?.reservation_manager': page2Data.page1?.reservation_manager,
      'basicInfo.OM': basicInfo.OM,
      'page2Data.page1 전체': page2Data.page1
    });
    
    // 객실 수 계산 결과 디버깅
    console.log('[ProgramList Server] 최종 객실 수 계산 결과:', {
      STANDARD_ROOM_COUNT: standardRoomCount,
      DELUXE_ROOM_COUNT: deluxeRoomCount,
      TOTAL_ROOM_COUNT: totalRoomCount,
      basicInfo_STANDARD_ROOM_COUNT: basicInfo.STANDARD_ROOM_COUNT,
      basicInfo_DELUXE_ROOM_COUNT: basicInfo.DELUXE_ROOM_COUNT,
      basicInfo_TOTAL_ROOM_COUNT: basicInfo.TOTAL_ROOM_COUNT
    });
    
    // 서비스 폼 데이터 조회
    const serviceForms = await prisma.serviceForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
    // 서비스 만족도 계산
    serviceList = [];
    let serviceScores = {};
    
    console.log("\n[서비스 만족도 계산 디버깅]");
    console.log(`- serviceForms 개수: ${serviceForms.length}`);
    
    if (serviceForms.length > 0) {
      // 먼저 모든 score 필드를 확인해보자
      console.log("\n[모든 Score 필드 확인]");
      
      serviceForms.forEach((form, formIndex) => {
        console.log(`\n--- Form ${formIndex + 1} ---`);
        console.log(`- 기본 정보: id=${form.id}, agency=${form.agency}`);
        
        // 모든 score 필드 값 확인 (form 자체)
        const allScoreFields = Object.keys(form).filter(key => key.startsWith('score'));
        console.log(`- Form 자체의 모든 score 필드 (총 ${allScoreFields.length}개):`);
        allScoreFields.forEach(field => {
          const value = form[field];
          if (value !== null && value !== undefined && value !== 0 && value !== '0') {
            console.log(`  * ${field}: ${value} (유효 데이터)`);
          }
        });
        
        // entries가 있으면 entries도 확인
        if (form.entries && form.entries.length > 0) {
          console.log(`- Entries (${form.entries.length}개):`);
          form.entries.forEach((entry, entryIndex) => {
            console.log(`  Entry ${entryIndex + 1}:`);
            const entryScoreFields = Object.keys(entry).filter(key => key.startsWith('score'));
            entryScoreFields.forEach(field => {
              const value = entry[field];
              if (value !== null && value !== undefined && value !== 0 && value !== '0') {
                console.log(`    * ${field}: ${value} (유효 데이터)`);
              }
            });
          });
        }
      });
      
      // 서비스 환경 만족도는 4개 항목만 사용
      const serviceScoreFields = ['score1', 'score5', 'score11', 'score14'];
      const scoreSum = { score1: 0, score5: 0, score11: 0, score14: 0 };
      const scoreCounts = { score1: 0, score5: 0, score11: 0, score14: 0 };
      
      serviceForms.forEach((form, formIndex) => {
        console.log(`\n[Form ${formIndex + 1} 처리]`);
        console.log(`- entries: ${form.entries?.length || 0}개`);
        console.log(`- form 자체의 대상 score 값들:`, {
          score1: form.score1,
          score5: form.score5,
          score11: form.score11,
          score14: form.score14
        });
        
        // entries가 있으면 entries에서 처리, 없으면 form 자체에서 처리
        const dataSource = form.entries && form.entries.length > 0 ? form.entries : [form];
        
        dataSource.forEach((entry, entryIndex) => {
          console.log(`  Entry ${entryIndex + 1} 처리:`);
          console.log(`    대상 score 값들:`, {
            score1: entry.score1,
            score5: entry.score5,
            score11: entry.score11,
            score14: entry.score14
          });
          
          serviceScoreFields.forEach(scoreField => {
            const scoreValue = parseFloat(entry[scoreField]);
            
            if (!isNaN(scoreValue) && scoreValue > 0) {
              scoreSum[scoreField] += scoreValue;
              scoreCounts[scoreField]++;
              console.log(`    ✓ ${scoreField}: ${scoreValue} 추가됨 (누적: ${scoreSum[scoreField]}, 개수: ${scoreCounts[scoreField]})`);
            } else {
              console.log(`    ✗ ${scoreField}: 무효값 (원본: ${entry[scoreField]}, 파싱: ${scoreValue})`);
            }
          });
        });
      });
      
      // 평균 계산
      serviceScores = {};
      serviceScoreFields.forEach(scoreField => {
        serviceScores[scoreField] = scoreCounts[scoreField] > 0 ? 
          parseFloat((scoreSum[scoreField] / scoreCounts[scoreField]).toFixed(1)) : 0;
        console.log(`- ${scoreField} 평균: ${serviceScores[scoreField]} (총합: ${scoreSum[scoreField]}, 개수: ${scoreCounts[scoreField]})`);
      });
      
      serviceList.push(serviceScores);
    } else {
      // 서비스 폼 데이터가 없는 경우 기본 값 설정
      serviceScores = {
        score1: 0,   // 숙소는 이용하기 편리했다
        score5: 0,   // 시설 및 산책로 등에 만족한다
        score11: 0,  // 프로그램 안내 및 운영방식은 만족스러웠다
        score14: 0   // 재료가 신선하고 맛있는 식사가 제공되었다
      };
      serviceList.push(serviceScores);
      console.log("- 서비스 폼 데이터 없음, 기본값 사용");
    }
    
    // 프로그램 폼 데이터 조회
    const programForms = await prisma.programForm.findMany({
      where: {
        agency: agency,
        openday: openday
      }
    });
    
    console.log("\n[프로그램 폼 정보 디버깅]");
    console.log(`- agency: ${agency}, openday: ${openday}`);
    console.log(`- 찾은 프로그램 폼 수: ${programForms.length}`);
    
    if (programForms.length > 0) {
      console.log("- 첫 번째 프로그램 폼 샘플:", {
        id: programForms[0].id,
        agency: programForms[0].agency,
        openday: programForms[0].openday,
        program_id: programForms[0].program_id,
        program_category_id: programForms[0].program_category_id,
        teacher_id: programForms[0].teacher_id,
        type: programForms[0].type,
        score1: programForms[0].score1,
        score4: programForms[0].score4,
        score7: programForms[0].score7
      });
    }
    
    // 보다 정확한 매칭을 위해 필요한 정보 확인
    console.log("\n[프로그램 정보 매칭 디버깅]");
    console.log("- page2Data.programs:", page2Data.programs.map(p => ({ 
      id: p.id, 
      program: p.program, 
      program_name: p.program_name, 
      instructor_name: p.instructor_name,
      category_name: p.category_name
    })));

    console.log("programForms:", programForms);
    console.log("- programForms:", programForms.map(f => ({ 
      id: f.id, 
      program_id: f.program_id,
      score1: f.score1,
      score2: f.score2
    })));
    
    // 프로그램 만족도 계산 - page2 프로그램 목록을 기본으로 함
    programSatisfaction = [];
    
    // 1. page2Data.programs를 기본으로 프로그램 만족도 구조 생성
    console.log(`[ProgramDetail] page2 프로그램 목록 기반으로 만족도 구조 생성: ${page2Data.programs.length}개`);
    
    // 강사 ID로 강사명 조회하기 위한 map 생성
    const instructorIdToNameMap = new Map();
    
    for (const program of page2Data.programs) {
      // 프로그램 기본 정보
      const programName = program.program_name || '프로그램';
      const categoryName = program.category_name || '미분류';
      
      // 강사 정보 조회
      let instructorName = program.instructor_name || '담당강사';
      
      if (program.instructor) {
        const instructorId = parseInt(program.instructor);
        
        if (!instructorIdToNameMap.has(instructorId)) {
          try {
            const instructor = await prisma.instructor.findUnique({
              where: { id: instructorId }
            });
            
            if (instructor) {
              instructorIdToNameMap.set(instructorId, instructor.name);
              instructorName = instructor.name;
            }
          } catch (err) {
            console.error(`강사정보 조회 실패 (ID: ${instructorId}):`, err);
          }
        } else {
          instructorName = instructorIdToNameMap.get(instructorId);
        }
      }
      
      console.log(`[ProgramDetail] 프로그램 기본 정보: ${programName}, 분야: ${categoryName}, 강사: ${instructorName}`);
      
      // 기본 만족도 항목 생성 (참여자, 인솔자 구분)
      const defaultTypes = ['참여자', '인솔자'];
      
      for (const type of defaultTypes) {
        const baseItem = {
          PROGRAM_NAME: programName,
          BUNYA: categoryName,
          TEACHER: instructorName,
          type: type,
          score1: '0',
          score4: '0', 
          score7: '0',
          cnt: 0
        };
        
        programSatisfaction.push(baseItem);
        console.log(`[ProgramDetail] 기본 만족도 항목 생성: ${programName} - ${type}`);
      }
    }
    
    // 2. programForms에서 실제 설문 결과가 있는 경우 매칭하여 업데이트
    if (programForms.length > 0) {
      console.log(`[ProgramDetail] 설문 결과 매칭 시작: ${programForms.length}개 폼`);
      
      // 프로그램 ID별로 폼 그룹화
      const programFormsByProgramId = {};
      
      programForms.forEach(form => {
        const formProgramId = form.program_id?.toString();
        if (!formProgramId) return;
        
        if (!programFormsByProgramId[formProgramId]) {
          programFormsByProgramId[formProgramId] = [];
        }
        
        programFormsByProgramId[formProgramId].push(form);
      });
      
      // page2 프로그램과 설문 결과 매칭
      for (const program of page2Data.programs) {
        const programId = program.program?.toString();
        if (!programId) continue;
        
        const forms = programFormsByProgramId[programId] || [];
        if (forms.length === 0) continue;
        
        console.log(`[ProgramDetail] 프로그램 ID ${programId}에 대한 설문 결과 ${forms.length}개 발견`);
        
        // 참여 유형별로 그룹화
        const formsByType = {};
        
        forms.forEach(form => {
          const type = form.type || '참여자';
          
          if (!formsByType[type]) {
            formsByType[type] = [];
          }
          
          formsByType[type].push(form);
        });
        
        // 각 유형별로 평균 계산 및 기존 항목 업데이트
        for (const [type, typeForms] of Object.entries(formsByType)) {
          if (typeForms.length === 0) continue;
          
          // 해당 프로그램과 타입에 매칭되는 기존 항목 찾기
          const programName = program.program_name || '프로그램';
          const categoryName = program.category_name || '미분류';
          let instructorName = program.instructor_name || '담당강사';
          
          // 강사명 업데이트
          if (program.instructor && instructorIdToNameMap.has(parseInt(program.instructor))) {
            instructorName = instructorIdToNameMap.get(parseInt(program.instructor));
          }
          
          const existingItemIndex = programSatisfaction.findIndex(item => 
            item.PROGRAM_NAME === programName &&
            item.BUNYA === categoryName &&
            item.TEACHER === instructorName &&
            item.type === type
          );
          
          if (existingItemIndex >= 0) {
            // 점수 계산
            const scores = {};
            
            // 각 문항별 평균 점수 계산 (score1, score4, score7만 사용)
            [1, 4, 7].forEach(i => {
              const scoreKey = `score${i}`;
              
              const validScores = typeForms
                .map(form => {
                  const value = form[scoreKey];
                  return value ? parseFloat(value) : null;
                })
                .filter(score => score !== null && !isNaN(score) && score >= 0); // 0점도 유효한 점수로 포함
              
              scores[scoreKey] = validScores.length > 0
                ? parseFloat((validScores.reduce((sum, val) => sum + val, 0) / validScores.length).toFixed(1))
                : 0;
            });
            
            // 기존 항목 업데이트
            programSatisfaction[existingItemIndex] = {
              ...programSatisfaction[existingItemIndex],
              score1: scores.score1.toString(),
              score4: scores.score4.toString(),
              score7: scores.score7.toString(),
              cnt: typeForms.length
            };
            
            console.log(`[ProgramDetail] 설문 결과로 업데이트: ${programName} - ${type}, 점수: ${scores.score1}/${scores.score4}/${scores.score7}, 참가자: ${typeForms.length}`);
          }
        }
      }
    }
    
    console.log(`[ProgramDetail] 최종 프로그램 만족도 항목 개수: ${programSatisfaction.length}`);
    
    // 3. 만약 page2 프로그램이 없는 경우에만 기존 로직 사용 (하위 호환성)
    if (page2Data.programs.length === 0 && programForms.length > 0) {
      console.log(`[ProgramDetail] page2 프로그램이 없어 기존 로직으로 폴백`);
      
      // 기존 로직 유지...
      // ... existing code ...
    }
    
    // 프로그램 실시 결과 데이터 구성
    const programSaf = page2Data.programs.map((program, index) => ({
      SAF_SEQ: index + 1,
      PROGRAM_NAME: program.program_name || '',
      START_TIME: program.start_time || '',
      END_TIME: program.end_time || '',
      SAF_DATE: program.date ? new Date(program.date).toISOString().split('T')[0] : ''
    }));
    
    // Prevent 폼 데이터 조회 (예방효과 - 도박)
    const preventForms = await prisma.preventGamblingForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
    console.log("preventForms",preventForms)
    
    // Healing 폼 데이터 조회 (힐링서비스 효과평가)
    const healingForms = await prisma.healingForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
    // Counsel 폼 데이터 조회 (상담&치유서비스 효과평가)
    const counselForms = await prisma.CounselTherapyForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
    // HRV 폼 데이터 조회
    const hrvForms = await prisma.hrvForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
    // 효과성 데이터 계산
    // 예방 효과 계산 (예방서비스 효과평가)
    const preventEffect = {
      '사전': { sum: 0, avg: 0, count: 0 },
      '사후': { sum: 0, avg: 0, count: 0 }
    };
    
    // 분류하여 예방 효과 계산
    preventForms.forEach(form => {
      // form.pv 값에 따라 분류
      const pv = form.pv === '사전' ? '사전' : '사후';
      let sum = 0;
      let count = 0;
      
      // 예방효과(도박) 폼의 score 필드 처리 (score1~score14)
      for (let i = 1; i <= 14; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score >= 0) { // 0점도 유효한 점수로 포함
          sum += score;
          count++;
        }
      }
      
      // 합계 및 평균 계산
      if (count > 0) {
        preventEffect[pv].sum += sum;
        preventEffect[pv].count += count;
        preventEffect[pv].avg = parseFloat((preventEffect[pv].sum / preventEffect[pv].count).toFixed(2));
      }
    });
    
    // 상담치유 효과 계산 (상담&치유서비스 효과평가)
    const counselEffect = {
      '사전': { sum: 0, avg: 0, count: 0 },
      '사후': { sum: 0, avg: 0, count: 0 }
    };
    
    // 분류하여 상담치유 효과 계산
    counselForms.forEach(form => {
      // form.pv 값에 따라 분류
      const pv = form.pv === '사전' ? '사전' : '사후';
      let sum = 0;
      let count = 0;
      
      // 필요한 score 필드 처리 (상담치유는 주로 1-6 사용)
      for (let i = 1; i <= 6; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score >= 0) { // 0점도 유효한 점수로 포함
          sum += score;
          count++;
        }
      }
      
      // 합계 및 평균 계산
      if (count > 0) {
        counselEffect[pv].sum += sum;
        counselEffect[pv].count += count;
        counselEffect[pv].avg = parseFloat((counselEffect[pv].sum / counselEffect[pv].count).toFixed(2));
      }
    });
    
    // 힐링 효과 계산 (힐링서비스 효과평가)
    const healingEffect = {
      '사전': { sum: 0, avg: 0, count: 0 },
      '사후': { sum: 0, avg: 0, count: 0 }
    };
    
    // 분류하여 힐링 효과 계산
    healingForms.forEach(form => {
      // form.pv 값에 따라 분류
      const pv = form.pv === '사전' ? '사전' : '사후';
      let sum = 0;
      let count = 0;
      
      // 모든 score 필드 처리
      for (let i = 1; i <= 22; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score >= 0) { // 0점도 유효한 점수로 포함
          sum += score;
          count++;
        }
      }
      
      // 합계 및 평균 계산
      if (count > 0) {
        healingEffect[pv].sum += sum;
        healingEffect[pv].count += count;
        healingEffect[pv].avg = parseFloat((healingEffect[pv].sum / healingEffect[pv].count).toFixed(2));
      }
    });
    
    // 효과 데이터 구성 - HRV 데이터 처리 전에 초기화
    const effect = {
      prevent: [
        {
          type: '사전',
          sum1: preventEffect['사전'].sum,
          avg1: preventEffect['사전'].avg,
          count: preventEffect['사전'].count,
          sum2: 0,
          avg2: 0
        },
        {
          type: '사후',
          sum1: preventEffect['사후'].sum,
          avg1: preventEffect['사후'].avg,
          count: preventEffect['사후'].count,
          sum2: 0,
          avg2: 0
        }
      ],
      counsel: [
        {
          type: '사전',
          sum1: counselEffect['사전'].sum,
          avg1: counselEffect['사전'].avg,
          count: counselEffect['사전'].count,
          sum2: 0,
          avg2: 0
        },
        {
          type: '사후',
          sum1: counselEffect['사후'].sum,
          avg1: counselEffect['사후'].avg,
          count: counselEffect['사후'].count,
          sum2: 0,
          avg2: 0
        }
      ],
      healing: [
        {
          type: '사전',
          sum1: healingEffect['사전'].sum,
          avg1: healingEffect['사전'].avg,
          count: healingEffect['사전'].count,
          sum2: 0,
          avg2: 0
        },
        {
          type: '사후',
          sum1: healingEffect['사후'].sum,
          avg1: healingEffect['사후'].avg,
          count: healingEffect['사후'].count,
          sum2: 0,
          avg2: 0
        }
      ],
      hrv: [] // HRV 데이터 추가
    };
    
    // HRV 데이터 처리
    if (hrvForms && hrvForms.length > 0) {
      console.log(`[HRV 데이터] ${hrvForms.length}개 항목이 있습니다.`);
      
      // HRV 데이터 그룹화 및 통계 계산
      const hrvByType = {};
      
      hrvForms.forEach(form => {
        const type = form.type || 'default';
        if (!hrvByType[type]) {
          hrvByType[type] = [];
        }
        hrvByType[type].push(form);
      });
      
      // 각 타입별로 합계 및 평균 계산
      Object.keys(hrvByType).forEach(type => {
        const forms = hrvByType[type];
        const totalForms = forms.length;
        
        // 데이터 추출 및 계산
        const sum1 = forms.reduce((acc, form) => acc + (parseFloat(form.score1) || 0), 0);
        const sum2 = forms.reduce((acc, form) => acc + (parseFloat(form.score2) || 0), 0);
        
        const avg1 = totalForms > 0 ? sum1 / totalForms : 0;
        const avg2 = totalForms > 0 ? sum2 / totalForms : 0;
        
        effect.hrv.push({
          type,
          sum1,
          sum2,
          avg1,
          avg2,
          count: totalForms
        });
        
        console.log(`  - 타입 [${type}]: ${totalForms}개, 평균1: ${avg1.toFixed(2)}, 평균2: ${avg2.toFixed(2)}`);
      });
    } else {
      console.log("[HRV 데이터] 항목이 없습니다.");
    }
    
    // 프론트엔드 사용을 위한 보완된 데이터 구조 추가
    // 프론트엔드에서는 effect.prevent[0].sum1 대신 이 값들에 직접 접근
    const effectHelpers = {
      prevent: {
        사전: {
          sum: preventEffect['사전'].sum,
          avg: preventEffect['사전'].avg,
          count: preventEffect['사전'].count
        },
        사후: {
          sum: preventEffect['사후'].sum,
          avg: preventEffect['사후'].avg,
          count: preventEffect['사후'].count
        }
      },
      counsel: {
        사전: {
          sum: counselEffect['사전'].sum,
          avg: counselEffect['사전'].avg,
          count: counselEffect['사전'].count
        },
        사후: {
          sum: counselEffect['사후'].sum,
          avg: counselEffect['사후'].avg,
          count: counselEffect['사후'].count
        }
      },
      healing: {
        사전: {
          sum: healingEffect['사전'].sum,
          avg: healingEffect['사전'].avg,
          count: healingEffect['사전'].count
        },
        사후: {
          sum: healingEffect['사후'].sum,
          avg: healingEffect['사후'].avg,
          count: healingEffect['사후'].count
        }
      }
    };
    
    // 최종 결과 값 확인을 위한 로그
    console.log('\n프로그램 효과 데이터 최종값 확인:');
    console.log('예방효과(사전):', { sum: effect.prevent[0].sum1, avg: effect.prevent[0].avg1, count: effect.prevent[0].count });
    console.log('예방효과(사후):', { sum: effect.prevent[1].sum1, avg: effect.prevent[1].avg1, count: effect.prevent[1].count });
    console.log('상담치유효과(사전):', { sum: effect.counsel[0].sum1, avg: effect.counsel[0].avg1, count: effect.counsel[0].count });
    console.log('상담치유효과(사후):', { sum: effect.counsel[1].sum1, avg: effect.counsel[1].avg1, count: effect.counsel[1].count });
    console.log('힐링효과(사전):', { sum: effect.healing[0].sum1, avg: effect.healing[0].avg1, count: effect.healing[0].count });
    console.log('힐링효과(사후):', { sum: effect.healing[1].sum1, avg: effect.healing[1].avg1, count: effect.healing[1].count });
    
    // 강사 정보 조회
    const instructorIds = page2Data.programs
      .filter(p => p.instructor)
      .map(p => parseInt(p.instructor));
    
    const instructors = await prisma.instructor.findMany({
      where: {
        id: {
          in: instructorIds
        }
      }
    });
    
    // 보조강사 정보 조회
    const assistantIds = page2Data.programs
      .filter(p => p.assistant)
      .map(p => parseInt(p.assistant));
    
    const assistantInstructors = await prisma.assistantInstructor.findMany({
      where: {
        id: {
          in: assistantIds
        }
      }
    });
    
    // 헬퍼 정보 조회
    const helperIds = page2Data.programs
      .filter(p => p.helper)
      .map(p => parseInt(p.helper));
    
    const helpers = await prisma.helper.findMany({
      where: {
        id: {
          in: helperIds
        }
      }
    });
    
    // 수입/지출 데이터 구성
    const inExpense = {
      income: [],
      expense: []
    };
    
    // PageFinal에서 수입/지출 데이터 가져오기
    if (pageFinalData) {

      
      if (detailed) {
        // DETAILED 모드: 개별 항목으로 표시 (page4 방식)
        console.log('[DEBUG] ✅ DETAILED 모드 실행됨! 개별 항목으로 처리합니다.');
        
        // 1. 강사 관련 지출 데이터 - 개별 항목으로 처리
        if (pageFinalData.teacher_expenses && pageFinalData.teacher_expenses.length > 0) {
          // 예정 지출 개별 항목
          const plannedExpenses = pageFinalData.teacher_expenses.filter(exp => exp.is_planned === true);
          plannedExpenses.forEach((exp, index) => {
            const expenseItem = {
              ITEM: `${exp.category || '기타'}(천원)_예정`,
              PRICE: (Number(exp.amount || 0)).toString(),
              DETAIL: exp.details || '',
              index: index,
              category: exp.category || '기타',
              type: 'planned'
            };
            inExpense.expense.push(expenseItem);
          });
          
          // 집행 지출 개별 항목
          const actualExpenses = pageFinalData.teacher_expenses.filter(exp => exp.is_planned === false);
          actualExpenses.forEach((exp, index) => {
            const expenseItem = {
              ITEM: `${exp.category || '기타'}(천원)_집행`,
              PRICE: (Number(exp.amount || 0)).toString(),
              DETAIL: exp.details || '',
              index: index,
              category: exp.category || '기타',
              type: 'actual'
            };
            inExpense.expense.push(expenseItem);
          });
        }
        
        // 2. 참가자 관련 지출 데이터 - 개별 항목으로 처리
        if (pageFinalData.participant_expenses && pageFinalData.participant_expenses.length > 0) {
          // 예정 지출 개별 항목
          const plannedExpenses = pageFinalData.participant_expenses.filter(exp => exp.is_planned === true);
          plannedExpenses.forEach((exp, index) => {
            const expenseItem = {
              ITEM: `${exp.category || '기타'}(천원)_예정`,
              PRICE: (Number(exp.amount || 0)).toString(),
              DETAIL: exp.details || '',
              index: index,
              category: exp.category || '기타',
              type: 'planned'
            };
            // 재료비, 기타비, 예비비만 로그 출력
            if (exp.category && (exp.category.includes('재료') || exp.category.includes('기타') || exp.category.includes('예비'))) {
              console.log('[재료/기타/예비비] 참가자 예정금액 개별 항목:', expenseItem);
            }
            inExpense.expense.push(expenseItem);
          });
          
          // 집행 지출 개별 항목
          const actualExpenses = pageFinalData.participant_expenses.filter(exp => exp.is_planned === false);
          actualExpenses.forEach((exp, index) => {
            const expenseItem = {
              ITEM: `${exp.category || '기타'}(천원)_집행`,
              PRICE: (Number(exp.amount || 0)).toString(),
              DETAIL: exp.details || '',
              index: index,
              category: exp.category || '기타',
              type: 'actual'
            };
            // 재료비, 기타비, 예비비만 로그 출력
            if (exp.category && (exp.category.includes('재료') || exp.category.includes('기타') || exp.category.includes('예비'))) {
              console.log('[재료/기타/예비비] 참가자 집행금액 개별 항목:', expenseItem);
            }
            inExpense.expense.push(expenseItem);
          });
        }
        
        // 3. 수입 데이터 - 개별 항목으로 처리
        if (pageFinalData.income_items && pageFinalData.income_items.length > 0) {
          pageFinalData.income_items.forEach((inc, index) => {
            const incomeItem = {
              ITEM: `${inc.category || '기타'}(천원)`,
              PRICE: (Number(inc.amount || 0)).toString(),
              DETAIL: inc.details || '',
              index: index,
              category: inc.category || '기타'
            };
            inExpense.income.push(incomeItem);
          });
        }
        
      } else {
        // 기존 모드: 카테고리별 합산
        console.log('[DEBUG] ❌ 기존 모드 실행됨! 카테고리별 합산 처리합니다.');
      
      // 1. 강사 관련 지출 데이터 처리 (예정/집행 구분, 동일 카테고리 합산)
      if (pageFinalData.teacher_expenses && pageFinalData.teacher_expenses.length > 0) {
        
        // 강사 예정 지출을 카테고리별로 집계
        const instructorPlannedMap = {};
        const plannedExpenses = pageFinalData.teacher_expenses.filter(exp => exp.is_planned === true);
        
        plannedExpenses.forEach(exp => {
            const category = exp.category || '기타';
            if (!instructorPlannedMap[category]) {
              instructorPlannedMap[category] = {
                amount: 0,
                details: []
              };
            }
            instructorPlannedMap[category].amount += Number(exp.amount || 0);
            if (exp.details) {
              instructorPlannedMap[category].details.push(exp.details);
            }
          });
        
        // 강사 집행 지출을 카테고리별로 집계
        const instructorActualMap = {};
        const actualExpenses = pageFinalData.teacher_expenses.filter(exp => exp.is_planned === false);
        
        actualExpenses.forEach(exp => {
            const category = exp.category || '기타';
            if (!instructorActualMap[category]) {
              instructorActualMap[category] = {
                amount: 0,
                details: []
              };
            }
            instructorActualMap[category].amount += Number(exp.amount || 0);
            if (exp.details) {
              instructorActualMap[category].details.push(exp.details);
            }
          });
        
        console.log('[ProgramList Server] 강사 집행 지출 집계 결과:', instructorActualMap);
        
        // 강사 예정금액 항목 추가 (이미 천원 단위)
        Object.entries(instructorPlannedMap).forEach(([category, data]) => {
          const expenseItem = {
            ITEM: `${category}(천원)_예정`,
            PRICE: data.amount.toString(),
            DETAIL: formatDetails(data.details)
          };
          console.log('[ProgramList Server] 강사 예정금액 항목 추가:', expenseItem);
          inExpense.expense.push(expenseItem);
        });
        
        // 강사 집행금액 항목 추가 (이미 천원 단위)
        Object.entries(instructorActualMap).forEach(([category, data]) => {
          const expenseItem = {
            ITEM: `${category}(천원)_집행`,
            PRICE: data.amount.toString(),
            DETAIL: formatDetails(data.details)
          };
          console.log('[ProgramList Server] 강사 집행금액 항목 추가:', expenseItem);
          inExpense.expense.push(expenseItem);
        });
      }
      
      // 2. 참가자 관련 지출 데이터 처리 (예정/집행 구분, 동일 카테고리 합산)
      if (pageFinalData.participant_expenses && pageFinalData.participant_expenses.length > 0) {
        console.log('[ProgramList Server] 참가자 지출 데이터 원본:', pageFinalData.participant_expenses);
        
        // 참가자 예정 지출을 카테고리별로 집계
        const participantPlannedMap = {};
        const plannedExpenses = pageFinalData.participant_expenses.filter(exp => exp.is_planned === true);
        console.log('[ProgramList Server] 참가자 예정 지출 필터:', plannedExpenses);
        
        plannedExpenses.forEach(exp => {
            const category = exp.category || '기타';
            if (!participantPlannedMap[category]) {
              participantPlannedMap[category] = {
                amount: 0,
                details: []
              };
            }
            participantPlannedMap[category].amount += Number(exp.amount || 0);
            if (exp.details) {
              participantPlannedMap[category].details.push(exp.details);
            }
          });
        
        console.log('[ProgramList Server] 참가자 예정 지출 집계 결과:', participantPlannedMap);
        
        // 참가자 집행 지출을 카테고리별로 집계
        const participantActualMap = {};
        const actualExpenses = pageFinalData.participant_expenses.filter(exp => exp.is_planned === false);
        console.log('[ProgramList Server] 참가자 집행 지출 필터:', actualExpenses);
        
        actualExpenses.forEach(exp => {
            const category = exp.category || '기타';
            if (!participantActualMap[category]) {
              participantActualMap[category] = {
                amount: 0,
                details: []
              };
            }
            participantActualMap[category].amount += Number(exp.amount || 0);
            if (exp.details) {
              participantActualMap[category].details.push(exp.details);
            }
          });
        
        console.log('[ProgramList Server] 참가자 집행 지출 집계 결과:', participantActualMap);
        
        // 참가자 예정금액 항목 추가 (이미 천원 단위)
        Object.entries(participantPlannedMap).forEach(([category, data]) => {
          const expenseItem = {
            ITEM: `${category}(천원)_예정`,
            PRICE: data.amount.toString(),
            DETAIL: formatDetails(data.details)
          };
          console.log('[ProgramList Server] 참가자 예정금액 항목 추가:', expenseItem);
          inExpense.expense.push(expenseItem);
        });
        
        // 참가자 집행금액 항목 추가 (이미 천원 단위)
        Object.entries(participantActualMap).forEach(([category, data]) => {
          const expenseItem = {
            ITEM: `${category}(천원)_집행`,
            PRICE: data.amount.toString(),
            DETAIL: formatDetails(data.details)
          };
          console.log('[ProgramList Server] 참가자 집행금액 항목 추가:', expenseItem);
          inExpense.expense.push(expenseItem);
        });
      }
      
      // 3. 수입 데이터 처리 (동일 카테고리 합산)
      if (pageFinalData.income_items && pageFinalData.income_items.length > 0) {
        console.log('[ProgramList Server] 수입 데이터 원본:', pageFinalData.income_items);
        
        // 수입 항목을 카테고리별로 집계
        const incomeMap = {};
        
        pageFinalData.income_items.forEach(inc => {
          const category = inc.category || '기타';
          if (!incomeMap[category]) {
            incomeMap[category] = {
              amount: 0,
              details: []
            };
          }
          incomeMap[category].amount += Number(inc.amount || 0);
          if (inc.details) {
            incomeMap[category].details.push(inc.details);
          }
        });
        
        console.log('[ProgramList Server] 수입 데이터 집계 결과:', incomeMap);
        
        // 수입 항목 추가 (천원 단위로 변환)
        Object.entries(incomeMap).forEach(([category, data]) => {
          const incomeItem = {
            ITEM: `${category}(천원)`,
            PRICE: data.amount.toString(),
            DETAIL: formatDetails(data.details)
          };
          console.log('[ProgramList Server] 수입 항목 추가:', incomeItem);
          inExpense.income.push(incomeItem);
          });
        }
      }
    } else {
      console.log('[ProgramList Server] PageFinal 데이터가 없음');
      }
    
    console.log('[ProgramList Server] 최종 inExpense 데이터:', {
      income: inExpense.income,
      expense: inExpense.expense,
      incomeCount: inExpense.income.length,
      expenseCount: inExpense.expense.length
    });
    
    // 기존 지출 데이터도 추가 (Page4에서 가져온 데이터)
    if (page4Data.length > 0 && inExpense.expense.length === 0) {
      // 강사비 계산
      const instructorTotal = instructors.reduce((sum, i) => sum + (i.payment || 0), 0);
      if (instructorTotal > 0) {
        inExpense.expense.push({
          ITEM: '강사비',
          PRICE: instructorTotal.toString()
        });
      }
      
      // 페이지4 지출 항목 추가
      page4Data.forEach(p4 => {
        // 식사비, 숙박비, 재료비 찾기
        const mealExpense = p4.expenses.find(exp => exp.name.includes('식사') || exp.name.includes('식비'));
        const accommodationExpense = p4.expenses.find(exp => exp.name.includes('숙박') || exp.name.includes('숙소'));
        const materialExpense = p4.materials.reduce((sum, mat) => sum + (mat.total || 0), 0);
        
        if (mealExpense) {
          inExpense.expense.push({
            ITEM: '식사비',
            PRICE: mealExpense.amount.toString()
          });
        }
        
        if (accommodationExpense) {
          inExpense.expense.push({
          ITEM: '숙박비',
            PRICE: accommodationExpense.amount.toString()
          });
        }
        
        if (materialExpense > 0) {
          inExpense.expense.push({
            ITEM: '재료비',
            PRICE: materialExpense.toString()
          });
        }
      });
    }
    
    // 프로그램 카테고리 정보 조회
    const programCategories = await prisma.programCategory.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
    
    console.log(`\n[REPORT] Program Categories (${programCategories.length}):`);
    programCategories.forEach(cat => {
      console.log(`- Category: ${cat.category_name}, ID: ${cat.id}`);
    });
    
    // Count programs and instructors by category
    console.log('\n[REPORT] Programs and Instructors by Category:');
    const reportCategoryCounts = {};
    
    programCategories.forEach(category => {
      const programsInCategory = page2Data.programs.filter(
        prog => prog.category && prog.category === category.id.toString()
      );
      
      // Count unique instructors in this category
      const categoryInstructors = new Set();
      const categoryAssistants = new Set();
      const categoryHelpers = new Set();
      
      programsInCategory.forEach(prog => {
        if (prog.instructor_name && prog.instructor_name.trim() !== '') {
          categoryInstructors.add(prog.instructor_name);
        }
        
        if (prog.assistant_name && prog.assistant_name.trim() !== '') {
          categoryAssistants.add(prog.assistant_name);
        }
        
        if (prog.helper_name && prog.helper_name.trim() !== '') {
          categoryHelpers.add(prog.helper_name);
        }
      });
      
      reportCategoryCounts[category.category_name] = {
        programCount: programsInCategory.length,
        instructorCount: categoryInstructors.size,
        assistantHelperCount: categoryAssistants.size + categoryHelpers.size,
        instructorNames: Array.from(categoryInstructors),
        assistantNames: Array.from(categoryAssistants),
        helperNames: Array.from(categoryHelpers)
      };
      
      console.log(`Category ${category.category_name}:`, reportCategoryCounts[category.category_name]);
    });
    
    // 프로그램 아이템 정보 조회
    const programItems = await prisma.programItem.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
    
    console.log(`[DEBUG] Loaded ${programItems.length} program items`);
    
    // Debug program counts by category - using programsForThisAgency
    const programsByCategory = {};
    programCategories.forEach(category => {
      const categoryPrograms = programsForThisAgency.filter(program => 
        program.category && program.category === category.id.toString());
      programsByCategory[category.category_name] = categoryPrograms.length;
    });
    
    console.log('[DEBUG] Programs by category:', programsByCategory);
    
    // Debug instructor counts by category - using programsForThisAgency
    const instructorsByCategory = {};
    programCategories.forEach(category => {
      const categoryPrograms = programsForThisAgency.filter(program => 
        program.category && program.category === category.id.toString());
      
      const uniqueInstructors = new Set();
      const uniqueAssistants = new Set();
      const uniqueHelpers = new Set();
      
      categoryPrograms.forEach(program => {
        if (program.instructor_name && program.instructor_name.trim() !== '') {
          uniqueInstructors.add(program.instructor_name);
        }
        
        if (program.assistant_name && program.assistant_name.trim() !== '') {
          uniqueAssistants.add(program.assistant_name);
        }
        
        if (program.helper_name && program.helper_name.trim() !== '') {
          uniqueHelpers.add(program.helper_name);
        }
      });
      
      instructorsByCategory[category.category_name] = {
        internal: uniqueInstructors.size,
        external: uniqueAssistants.size + uniqueHelpers.size,
        internalNames: Array.from(uniqueInstructors),
        externalNames: [...Array.from(uniqueAssistants), ...Array.from(uniqueHelpers)]
      };
    });
    
    console.log('[DEBUG] Instructors by category:', instructorsByCategory);
    
    // Ensure specific scores in serviceForms are numbers for the client
    const processedServiceForms = serviceForms.map((form, index) => {
      // GraphQL 스키마에서 score 필드들이 String 타입으로 정의되어 있으므로 문자열로 변환
      const s1 = form.score1 ? String(form.score1) : '0';
      const s2 = form.score2 ? String(form.score2) : '0';
      const s3 = form.score3 ? String(form.score3) : '0';
      const s4 = form.score4 ? String(form.score4) : '0';
      const s5 = form.score5 ? String(form.score5) : '0';
      const s6 = form.score6 ? String(form.score6) : '0';
      const s7 = form.score7 ? String(form.score7) : '0';
      const s8 = form.score8 ? String(form.score8) : '0';
      const s9 = form.score9 ? String(form.score9) : '0';
      const s10 = form.score10 ? String(form.score10) : '0';
      const s11 = form.score11 ? String(form.score11) : '0';
      const s12 = form.score12 ? String(form.score12) : '0';
      const s13 = form.score13 ? String(form.score13) : '0';
      const s14 = form.score14 ? String(form.score14) : '0';
      // Add more scores if serviceForms can have more than score1-14

      // Specific log for Form 5 (index 4)
      if (index === 4) { // Form 5 is at index 4 (0-indexed)
        console.log(`\n[SERVER MAPPING Form 5 (index 4)] Raw data from DB:`);
        console.log(`  Raw score1: '${form.score1}', Raw score5: '${form.score5}', Raw score11: '${form.score11}', Raw score14: '${form.score14}'`);
        console.log(`[SERVER MAPPING Form 5 (index 4)] Converted to strings:`);
        console.log(`  String s1: '${s1}', String s5: '${s5}', String s11: '${s11}', String s14: '${s14}'\n`);
      }

      return {
        ...form, // Spread original form first, so ID, agency etc. are preserved
        // Overwrite only the specific score fields with their string versions
        score1: s1, score2: s2, score3: s3, score4: s4, score5: s5,
        score6: s6, score7: s7, score8: s8, score9: s9, score10: s10,
        score11: s11, score12: s12, score13: s13, score14: s14,
        // Ensure other potential score fields are also strings if they exist
        // For any other fields like 'name', 'sex', 'age', they come from ...form
      };
    });

    // Log the state of processedServiceForms, especially Form 5, right before returning
    if (processedServiceForms.length > 4) {
      const form5FromServer = processedServiceForms[4];
      console.log('\n[SERVER PRE-RETURN CHECK For Form 5 (index 4) in processedServiceForms]:');
      console.log(`  Form 5 ID (example): ${form5FromServer.id}`); // Assuming forms have an ID
      console.log(`  score1: '${form5FromServer.score1}' (type: ${typeof form5FromServer.score1})`);
      console.log(`  score5: '${form5FromServer.score5}' (type: ${typeof form5FromServer.score5})`);
      console.log(`  score11: '${form5FromServer.score11}' (type: ${typeof form5FromServer.score11})`);
      console.log(`  score14: '${form5FromServer.score14}' (type: ${typeof form5FromServer.score14})\n`);
    }
    
    // 결합된 상세 정보 반환
    const result = {
      basicInfo,
      serviceList,
      programSatisfaction,
      programSaf,
      effect: {
        counsel: effect.counsel,
        healing: effect.healing,
        hrv: effect.hrv,
        prevent: effect.prevent
      },
      inExpense: {
        income: inExpense.income,
        expense: inExpense.expense
      },
      serviceForms: processedServiceForms, // Use the processed version
      programForms: programForms, // Use fetched program forms
      preventForms,
      healingForms,
      counselForms,
      hrvForms,
      programCategories,
      programItems,
      instructors,
      assistantInstructors,
      helpers,
      programs: page2Data.programs || [], // page2 프로그램 목록 추가
      complaint: pageFinalData?.complaint || ''
    };

    // 각 항목들이 프론트엔드 어느 부분에 매칭되는지 확인하는 로그
    console.log('---------- 프로그램 결과 보고서 데이터 매핑 정보 ----------');
    console.log('1. 프로그램시행개요 데이터:');
    console.log('- 참여일자: basicInfo.OPENDAY =', basicInfo.OPENDAY);
    console.log('- 체류일자: basicInfo.DAYS_TO_STAY =', basicInfo.DAYS_TO_STAY);
    console.log('- 지역: basicInfo.RESIDENCE =', basicInfo.RESIDENCE);
    console.log('- 참여자(남/여/계): basicInfo.PART_MAN_CNT, PART_WOMAN_CNT =', 
      basicInfo.PART_MAN_CNT, basicInfo.PART_WOMAN_CNT, Number(basicInfo.PART_MAN_CNT) + Number(basicInfo.PART_WOMAN_CNT));
    console.log('- 인솔자(남/여/계): basicInfo.LEAD_MAN_CNT, LEAD_WOMAN_CNT =', 
      basicInfo.LEAD_MAN_CNT, basicInfo.LEAD_WOMAN_CNT, Number(basicInfo.LEAD_MAN_CNT) + Number(basicInfo.LEAD_WOMAN_CNT));
    console.log('- 연령대: basicInfo.AGE_TYPE =', basicInfo.AGE_TYPE);
    console.log('- 참가자유형: basicInfo.PART_TYPE =', basicInfo.PART_TYPE);
    console.log('- 사업구분: basicInfo.BIZ_PURPOSE =', basicInfo.BIZ_PURPOSE);
    console.log('- 단체성격: basicInfo.org_nature =', basicInfo.org_nature);
    console.log('- 참여형태: basicInfo.PROGRAM_IN_OUT =', basicInfo.PROGRAM_IN_OUT);
    
    console.log('\n2. 객실 및 식사 정보:');
    console.log('- 참여자 객실: basicInfo.ROOM_PART_ROOM =', basicInfo.ROOM_PART_ROOM);
    console.log('- 인솔자 객실: basicInfo.ROOM_LEAD_ROOM =', basicInfo.ROOM_LEAD_ROOM);
    console.log('- 참여자 식사: basicInfo.MEAL_PART =', basicInfo.MEAL_PART);
    console.log('- 인솔자 식사: basicInfo.MEAL_LEAD =', basicInfo.MEAL_LEAD);
    
    console.log('\n3. 시설서비스만족도:');
    console.log('- 숙소는 이용하기 편리했다: serviceList[0].score1 =', serviceList[0]?.score1);
    console.log('- 시설 및 산책로 등에 만족한다: serviceList[0].score5 =', serviceList[0]?.score5);
    console.log('- 프로그램 안내 및 운영방식은 만족스러웠다: serviceList[0].score11 =', serviceList[0]?.score11);
    console.log('- 재료가 신선하고 맛있는 식사가 제공되었다: serviceList[0].score14 =', serviceList[0]?.score14);
    
    console.log('\n4. 프로그램만족도:');
    if (programSatisfaction.length > 0) {
      programSatisfaction.forEach((prog, idx) => {
        console.log(`[${idx+1}] 프로그램: ${prog.PROGRAM_NAME}, 분야: ${prog.BUNYA}, 강사: ${prog.TEACHER}`);
        console.log(`- 강사(전문성/성실성/반응성): ${prog.score1}/${prog.score2}/${prog.score3}`);
        console.log(`- 내용(체계성/적합성/흥미성): ${prog.score4}/${prog.score5}/${prog.score6}`);
        console.log(`- 효과(학습성/재참여/추천): ${prog.score7}/${prog.score8}/${prog.score9}`);
      });
    } else {
      console.log('프로그램 만족도 데이터가 없습니다. agency:', agency, 'openday:', openday);
      console.log('programForms:', programForms.length > 0 ? `${programForms.length}개 항목` : '데이터 없음');
      console.log('programForms entries:', programForms.length > 0 ? 
        programForms.reduce((sum, form) => sum + (form.entries?.length || 0), 0) : '데이터 없음');
      
      // 프로그램 목록 확인
      console.log('programs:', page2Data.programs.length > 0 ? 
        page2Data.programs.map(p => `${p.program_name}(${p.program})`) : '데이터 없음');
    }
    
    console.log('\n5. 프로그램효과:');
    console.log('예방효과(사전): entries=', preventForms.reduce((sum, form) => sum + (form.entries?.length || 0), 0),
      'sum=', effect.prevent[0]?.sum1, 'count=', effect.prevent[0]?.count, 'avg=', effect.prevent[0]?.avg1);
    console.log('예방효과(사후): entries=', preventForms.filter(f => f.pv === '사후').reduce((sum, form) => sum + (form.entries?.length || 0), 0),
      'sum=', effect.prevent[1]?.sum1, 'count=', effect.prevent[1]?.count, 'avg=', effect.prevent[1]?.avg1);
    
    console.log('상담치유효과(사전): entries=', counselForms.reduce((sum, form) => sum + (form.entries?.filter(e => e.pv === '사전').length || 0), 0),
      'sum=', effect.counsel[0]?.sum1, 'count=', effect.counsel[0]?.count, 'avg=', effect.counsel[0]?.avg1);
    console.log('상담치유효과(사후): entries=', counselForms.reduce((sum, form) => sum + (form.entries?.filter(e => e.pv === '사후').length || 0), 0),
      'sum=', effect.counsel[1]?.sum1, 'count=', effect.counsel[1]?.count, 'avg=', effect.counsel[1]?.avg1);
    
    console.log('힐링효과(사전): entries=', healingForms.filter(f => f.pv === '사전').reduce((sum, form) => sum + (form.entries?.length || 0), 0),
      'sum=', effect.healing[0]?.sum1, 'count=', effect.healing[0]?.count, 'avg=', effect.healing[0]?.avg1);
    console.log('힐링효과(사후): entries=', healingForms.filter(f => f.pv === '사후').reduce((sum, form) => sum + (form.entries?.length || 0), 0),
      'sum=', effect.healing[1]?.sum1, 'count=', effect.healing[1]?.count, 'avg=', effect.healing[1]?.avg1);
    
    console.log('\n6. 민원사항:');
    console.log('- basicInfo.PROGRAM_OPINION =', basicInfo.PROGRAM_OPINION);
    console.log('- complaint =', result.complaint);
    
    console.log('\n7. 지출금액:');
    if (pageFinalData?.teacher_expenses?.length > 0) {
      // 카테고리별로 집계
      const instructorPlannedMap = {};
      const instructorActualMap = {};
      
      pageFinalData.teacher_expenses.forEach(exp => {
        const category = exp.category || '기타';
        const map = exp.is_planned ? instructorPlannedMap : instructorActualMap;
        
        if (!map[category]) {
          map[category] = {
            amount: 0,
            details: []
          };
        }
        map[category].amount += Number(exp.amount || 0);
        if (exp.details) {
          map[category].details.push(exp.details);
        }
      });
      
      console.log('- 강사 예정금액:');
      Object.entries(instructorPlannedMap).forEach(([category, data]) => 
        console.log(`  ${category}: ${Math.round(data.amount / 1000)}천원, 세부내역: ${data.details.join(', ') || '-'}`));
      
      console.log('- 강사 집행금액:');
      Object.entries(instructorActualMap).forEach(([category, data]) => 
        console.log(`  ${category}: ${Math.round(data.amount / 1000)}천원, 세부내역: ${data.details.join(', ') || '-'}`));
    }
    
    if (pageFinalData?.participant_expenses?.length > 0) {
      // 카테고리별로 집계
      const participantPlannedMap = {};
      const participantActualMap = {};
      
      pageFinalData.participant_expenses.forEach(exp => {
        const category = exp.category || '기타';
        const map = exp.is_planned ? participantPlannedMap : participantActualMap;
        
        if (!map[category]) {
          map[category] = {
            amount: 0,
            details: []
          };
        }
        map[category].amount += Number(exp.amount || 0);
        if (exp.details) {
          map[category].details.push(exp.details);
        }
      });
      
      console.log('- 참가자 예정금액:');
      Object.entries(participantPlannedMap).forEach(([category, data]) => 
        console.log(`  ${category}: ${Math.round(data.amount / 1000)}천원, 세부내역: ${data.details.join(', ') || '-'}`));
      
      console.log('- 참가자 집행금액:');
      Object.entries(participantActualMap).forEach(([category, data]) => 
        console.log(`  ${category}: ${Math.round(data.amount / 1000)}천원, 세부내역: ${data.details.join(', ') || '-'}`));
    }
    
    console.log('\n8. 수입금액:');
    if (pageFinalData?.income_items?.length > 0) {
      // 카테고리별로 집계
      const incomeMapForLog = {}; // 로그용 집계
      pageFinalData.income_items.forEach(inc => {
        const category = inc.category || '기타';
        if (!incomeMapForLog[category]) incomeMapForLog[category] = 0;
        incomeMapForLog[category] += Number(inc.amount || 0);
      });
      
      Object.entries(incomeMapForLog).forEach(([category, amount]) => 
        console.log(`  ${category}: ${amount}천원`)); // amount를 그대로 사용 (이미 천원 단위)
      
      const totalIncome = pageFinalData.income_items.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
      console.log('- 총 수입금액:', totalIncome, '천원'); // totalIncome을 그대로 사용
    }
    
    // inExpense 데이터 확인
    console.log('\n수입/지출 항목 최종값:');
    console.log('- 지출 항목:', inExpense.expense.length, '개');
    inExpense.expense.forEach(item => console.log(`  ${item.ITEM}: ${item.PRICE}천원, 세부내역: ${item.DETAIL || '-'}`));
    console.log('- 수입 항목:', inExpense.income.length, '개');
    inExpense.income.forEach(item => console.log(`  ${item.ITEM}: ${item.PRICE}천원, 세부내역: ${item.DETAIL || '-'}`));
    
    console.log('--------------------------------------------------------');

    console.log("\n[전체 데이터 디버깅 로그]");
    console.log("=== 1. 프로그램 폼 데이터 ===");
    console.log("programForms 개수:", programForms.length);
    programForms.forEach((form, idx) => {
      console.log(`[Form ${idx+1}]`, {
        id: form.id,
        agency: form.agency,
        openday: form.openday,
        eval_date: form.eval_date,
        program_id: form.program_id,
        program_category_id: form.program_category_id,
        entries: form.entries?.length || 0
      });
      
      if (form.entries && form.entries.length > 0) {
        console.log(`  - Entries 샘플 (첫 2개):`, 
          form.entries.slice(0, 2).map(entry => ({
            id: entry.id, 
            sex: entry.sex,
            type: entry.type,
            score1: entry.score1,
            score2: entry.score2,
            score3: entry.score3,
            // 나머지 점수는 생략
          }))
        );
      }
    });
    
    console.log("\n=== 2. 서비스 폼 데이터 ===");
    console.log("serviceForms 개수:", serviceForms.length);
    serviceForms.forEach((form, idx) => {
      console.log(`[Form ${idx+1}]`, {
        id: form.id,
        agency: form.agency,
        openday: form.openday,
        entries: form.entries?.length || 0
      });
      
      if (form.entries && form.entries.length > 0) {
        const entrySample = form.entries[0];
        console.log(`  - Entries 샘플 (첫번째):`, {
          id: entrySample.id,
          score1: entrySample.score1, // 숙소(편리)
          score2: entrySample.score2, // 숙소(청결)
          score3: entrySample.score3, // 식당(편리)
          score4: entrySample.score4, // 식당(청결)
          score5: entrySample.score5, // 프로그램장소(만족도)
          score14: entrySample.score14 // 식사(신선도)
        });
      }
    });
    
    console.log("\n=== 3. 예방 폼 데이터 ===");
    console.log("preventForms 개수:", preventForms.length);
    preventForms.forEach((form, idx) => {
      console.log(`[Form ${idx+1}]`, {
        id: form.id,
        agency: form.agency,
        openday: form.openday,
        pv: form.pv,
        entries: form.entries?.length || 0
      });
      
      if (form.entries && form.entries.length > 0) {
        console.log(`  - 점수 합계/평균:`, {
          sum: form.entries.reduce((sum, entry) => {
            let entrySum = 0;
            for (let i = 1; i <= 18; i++) {
              const score = parseFloat(entry[`score${i}`]);
              if (!isNaN(score) && score >= 0) entrySum += score; // 0점도 유효한 점수로 포함
            }
            return sum + entrySum;
          }, 0),
          count: form.entries.reduce((count, entry) => {
            let entryCount = 0;
            for (let i = 1; i <= 18; i++) {
              const score = parseFloat(entry[`score${i}`]);
              if (!isNaN(score) && score >= 0) entryCount++; // 0점도 유효한 점수로 포함
            }
            return count + entryCount;
          }, 0)
        });
      }
    });
    
    console.log("\n=== 4. 상담 폼 데이터 ===");
    console.log("counselForms 개수:", counselForms.length);
    counselForms.forEach((form, idx) => {
      console.log(`[Form ${idx+1}]`, {
        id: form.id,
        agency: form.agency,
        openday: form.openday,
        entries: form.entries?.length || 0
      });
      
      if (form.entries && form.entries.length > 0) {
        // 사전/사후 별로 그룹화
        const preEntries = form.entries.filter(e => e.pv === '사전');
        const postEntries = form.entries.filter(e => e.pv === '사후');
        
        console.log(`  - 사전 entries: ${preEntries.length}개, 사후 entries: ${postEntries.length}개`);
        
        if (preEntries.length > 0) {
          console.log(`  - 사전 점수 샘플 (첫번째):`, {
            id: preEntries[0].id,
            score1: preEntries[0].score1,
            score2: preEntries[0].score2,
            score3: preEntries[0].score3,
            score4: preEntries[0].score4,
            score5: preEntries[0].score5,
            score6: preEntries[0].score6
          });
        }
        
        if (postEntries.length > 0) {
          console.log(`  - 사후 점수 샘플 (첫번째):`, {
            id: postEntries[0].id,
            score1: postEntries[0].score1,
            score2: postEntries[0].score2,
            score3: postEntries[0].score3,
            score4: postEntries[0].score4,
            score5: postEntries[0].score5,
            score6: postEntries[0].score6
          });
        }
      }
    });
    
    console.log("\n=== 5. 힐링 폼 데이터 ===");
    console.log("healingForms 개수:", healingForms.length);
    healingForms.forEach((form, idx) => {
      console.log(`[Form ${idx+1}]`, {
        id: form.id,
        agency: form.agency,
        openday: form.openday,
        pv: form.pv,
        entries: form.entries?.length || 0
      });
      
      if (form.entries && form.entries.length > 0) {
        console.log(`  - 점수 합계/평균:`, {
          sum: form.entries.reduce((sum, entry) => {
            let entrySum = 0;
            for (let i = 1; i <= 18; i++) {
              const score = parseFloat(entry[`score${i}`]);
              if (!isNaN(score) && score >= 0) entrySum += score; // 0점도 유효한 점수로 포함
            }
            return sum + entrySum;
          }, 0),
          count: form.entries.reduce((count, entry) => {
            let entryCount = 0;
            for (let i = 1; i <= 18; i++) {
              const score = parseFloat(entry[`score${i}`]);
              if (!isNaN(score) && score >= 0) entryCount++; // 0점도 유효한 점수로 포함
            }
            return count + entryCount;
          }, 0)
        });
      }
    });
    
    console.log("\n=== 6. 최종 계산된 효과 데이터 ===");
    console.log("예방효과:", {
      사전: {
        sum: effect.prevent[0]?.sum1 || 0,
        avg: effect.prevent[0]?.avg1 || 0,
        count: effect.prevent[0]?.count || 0
      },
      사후: {
        sum: effect.prevent[1]?.sum1 || 0,
        avg: effect.prevent[1]?.avg1 || 0,
        count: effect.prevent[1]?.count || 0
      }
    });
    
    console.log("상담치유효과:", {
      사전: {
        sum: effect.counsel[0]?.sum1 || 0,
        avg: effect.counsel[0]?.avg1 || 0,
        count: effect.counsel[0]?.count || 0
      },
      사후: {
        sum: effect.counsel[1]?.sum1 || 0,
        avg: effect.counsel[1]?.avg1 || 0,
        count: effect.counsel[1]?.count || 0
      }
    });
    
    console.log("힐링효과:", {
      사전: {
        sum: effect.healing[0]?.sum1 || 0,
        avg: effect.healing[0]?.avg1 || 0,
        count: effect.healing[0]?.count || 0
      },
      사후: {
        sum: effect.healing[1]?.sum1 || 0,
        avg: effect.healing[1]?.avg1 || 0,
        count: effect.healing[1]?.count || 0
      }
    });

    console.log("\n=== 7. page2Data 기본 정보 ===");
    console.log({
      id: page2Data.id,
      page1_id: page2Data.page1_id,
      service_type: page2Data.service_type,
      part_type: page2Data.part_type,
      age_type: page2Data.age_type,
      part_form: page2Data.part_form,
      male_count: page2Data.male_count,
      female_count: page2Data.female_count,
      male_leader_count: page2Data.male_leader_count,
      female_leader_count: page2Data.female_leader_count,
      programs_count: page2Data.programs?.length || 0
    });
    
    console.log("\n=== 8. 프로그램 목록 상세 ===");
    if (page2Data.programs && page2Data.programs.length > 0) {
      page2Data.programs.forEach((prog, idx) => {
        console.log(`[프로그램 ${idx+1}]`, {
          id: prog.id,
          program: prog.program,
          program_name: prog.program_name,
          category_name: prog.category_name,
          instructor_name: prog.instructor_name,
          assistant_name: prog.assistant_name,
          helper_name: prog.helper_name,
          date: prog.date,
          start_time: prog.start_time,
          end_time: prog.end_time
        });
      });
    } else {
      console.log("프로그램 정보 없음");
    }
    
    console.log("\n=== 9. 프로그램 만족도 최종 결과 ===");
    if (programSatisfaction.length > 0) {
      programSatisfaction.forEach((prog, idx) => {
        console.log(`[만족도 ${idx+1}]`, {
          PROGRAM_NAME: prog.PROGRAM_NAME,
          TEACHER: prog.TEACHER,
          BUNYA: prog.BUNYA,
          type: prog.type,
          score1: prog.score1, // 강사 전문성
          score2: prog.score2, // 강사 성실성
          score3: prog.score3, // 강사 반응성
          score4: prog.score4, // 내용 체계성
          score5: prog.score5, // 내용 적합성
          score6: prog.score6, // 내용 흥미성 
          score7: prog.score7, // 효과 학습성
          score8: prog.score8, // 효과 재참여
          score9: prog.score9, // 효과 추천
          cnt: prog.cnt
        });
      });
    } else {
      console.log("프로그램 만족도 결과 없음");
    }
    
    console.log("\n=== 10. 시설서비스 만족도 최종 결과 ===");
    if (serviceList.length > 0) {
      console.log({
        숙소는_이용하기_편리했다: serviceList[0]?.score1 || 0,
        시설_및_산책로_등에_만족한다: serviceList[0]?.score5 || 0,
        프로그램_안내_및_운영방식은_만족스러웠다: serviceList[0]?.score11 || 0,
        재료가_신선하고_맛있는_식사가_제공되었다: serviceList[0]?.score14 || 0
      });
    } else {
      console.log("시설서비스 만족도 결과 없음");
    }
    
    console.log("\n=== 11. 최종 반환 데이터 요약 ===");
    console.log("basicInfo:", Object.keys(basicInfo).length, "개 항목");
    console.log("serviceList:", serviceList.length, "개 항목");
    console.log("programSatisfaction:", programSatisfaction.length, "개 항목");
    console.log("programSaf:", programSaf.length, "개 항목");
    console.log("effect 카테고리:", Object.keys(effect).length, "개");
    console.log("inExpense 수입항목:", inExpense.income.length, "개, 지출항목:", inExpense.expense.length, "개");

    // Return summary debug info
    console.log('\n[DEBUG] SUMMARY:');
    console.log(`Agency: ${agency}`);
    console.log(`Total programs: ${page2Data.programs.length}`);
    console.log(`Total internal instructors: ${internalInstructors.size}`);
    console.log(`Total external instructors: ${externalInstructors.size}`);
    console.log(`Total instructor count: ${internalInstructors.size + externalInstructors.size}`);
    console.log(`Total program categories: ${programCategories.length}`);
    console.log(`Programs by category:`, programsByCategory);
    console.log(`Instructors by category:`, instructorsByCategory);
    
    // Log the exact structure of data being returned
    console.log('\n[DEBUG] RETURNED DATA STRUCTURE:');
    console.log('Program Counts:', page2Data.programs.length);
    console.log('ProgramCategory Counts:', programCategories.length);
    console.log('ProgramItem Counts:', programItems.length);
    
    // Inspect the first few programs being returned
    if (page2Data.programs.length > 0) {
      console.log('\n[DEBUG] SAMPLE PROGRAMS:');
      page2Data.programs.slice(0, 3).forEach((program, idx) => {
        console.log(`Program ${idx+1}:`, {
          id: program.id,
          program_name: program.program_name,
          category: program.category,
          category_name: program.category_name,
          instructor_name: program.instructor_name,
          assistant_name: program.assistant_name,
          helper_name: program.helper_name
        });
      });
    }
    
    // Inspect the first few program categories
    if (programCategories.length > 0) {
      console.log('\n[DEBUG] SAMPLE CATEGORIES:');
      programCategories.slice(0, 3).forEach((cat, idx) => {
        console.log(`Category ${idx+1}:`, {
          id: cat.id,
          category_name: cat.category_name,
          display_order: cat.display_order
        });
      });
    }
    
    console.log('----------------- END DEBUG -----------------\n');

    // Log the input parameters for better debugging
    console.log("\n=== getProgramDetail query parameters ===");
    console.log("seq:", seq);
    console.log("agency:", agency);
    console.log("openday:", openday);

    // Program form data query for satisfaction
    console.log("\n=== Fetching program form data ===");
    console.log(`[ProgramDetail] Query parameters: agency=${agency}, openday=${openday}`);
    
    // Check for any forms from serviceInsertFormFinal
    console.log("\n[ProgramDetail] 🔍 CHECKING FOR SERVICE INSERT FORM FINAL DATA");
    
    // Diagnostic info - where does programForm data come from?
    console.log("[ProgramDetail] Table structure info: programForm table contains submissions from serviceInsertFormFinal");
    console.log("[ProgramDetail] Checking for any program forms in the system...");
    
    // Getting a sample of total form count
    const totalProgramForms = await prisma.programForm.count();
    console.log(`[ProgramDetail] Total programForm entries in database: ${totalProgramForms}`);
    
    // Try different date formats for the openday parameter
    console.log("\n[ProgramDetail] ⚠️ DATE FORMAT ISSUE DETECTION");
    console.log(`[ProgramDetail] Original openday parameter: "${openday}" (${typeof openday})`);
    
    // Try to normalize the date format for better matching
    let possibleDateFormats = [
      openday, // original
      new Date(openday).toISOString().split('T')[0], // YYYY-MM-DD
      new Date(openday).toLocaleDateString('en-CA') // also YYYY-MM-DD but might handle differently
    ];
    
    console.log("[ProgramDetail] Trying these date formats:", possibleDateFormats);
    
    // Modify the query to attempt multiple date formats
    const fetchedProgramForms = await prisma.programForm.findMany({
      where: {
        agency: agency,
        OR: [
          { openday: openday },
          { openday: new Date(openday).toISOString().split('T')[0] },
          { openday: new Date(openday).toLocaleDateString('en-CA') }
        ]
      }
    });
    
    console.log(`[ProgramDetail] Modified query found ${fetchedProgramForms.length} forms`);
    console.log(`[ProgramDetail] SQL equivalent: SELECT * FROM programForm WHERE agency='${agency}' AND (openday='${openday}' OR openday='${new Date(openday).toISOString().split('T')[0]}' OR openday='${new Date(openday).toLocaleDateString('en-CA')}')`);
    
    // Check forms by agency only 
    const agencyFormsCount = await prisma.programForm.count({
      where: {
        agency: agency
      }
    });
    
    console.log(`[ProgramDetail] Found ${agencyFormsCount} total forms for agency: ${agency}`);
    
    if (agencyFormsCount > 0) {
      // Sample a few forms from this agency to check scores
      const sampleAgencyForms = await prisma.programForm.findMany({
        where: { agency: agency },
        take: 3
      });
      
      console.log("[ProgramDetail] Sample forms for this agency:");
      sampleAgencyForms.forEach((form, idx) => {
        console.log(`[ProgramDetail] Sample #${idx+1}:`, {
          id: form.id,
          openday: form.openday,
          program_id: form.program_id,
          program_category_id: form.program_category_id,
          score1: form.score1,
          score4: form.score4,
          score7: form.score7,
          // Check for null/undefined values
          score1Type: typeof form.score1,
          score4Type: typeof form.score4,
          score7Type: typeof form.score7,
          hasScore1: form.score1 !== null && form.score1 !== undefined,
          hasScore4: form.score4 !== null && form.score4 !== undefined,
          hasScore7: form.score7 !== null && form.score7 !== undefined
        });
      });
    }
    
    // 첫 번째 form 샘플 출력 (디버깅용)
    if (fetchedProgramForms.length > 0) {
      console.log("[ProgramDetail] First program form sample:", {
        id: fetchedProgramForms[0].id,
        program_id: fetchedProgramForms[0].program_id,
        program_category_id: fetchedProgramForms[0].program_category_id,
        teacher_id: fetchedProgramForms[0].teacher_id,
        type: fetchedProgramForms[0].type,
        sex: fetchedProgramForms[0].sex,
        age: fetchedProgramForms[0].age,
        score1: fetchedProgramForms[0].score1,
        score1Type: typeof fetchedProgramForms[0].score1,
        score4: fetchedProgramForms[0].score4,
        score4Type: typeof fetchedProgramForms[0].score4,
        score7: fetchedProgramForms[0].score7,
        score7Type: typeof fetchedProgramForms[0].score7
      });
      
      // 점수 데이터 통계
      const scoreStats = { 
        score1: [], score4: [], score7: [] 
      };
      
      fetchedProgramForms.forEach(form => {
        if (form.score1) scoreStats.score1.push(parseFloat(form.score1));
        if (form.score4) scoreStats.score4.push(parseFloat(form.score4));
        if (form.score7) scoreStats.score7.push(parseFloat(form.score7));
      });
      
      // 각 점수 필드별 통계 출력
      Object.keys(scoreStats).forEach(key => {
        const values = scoreStats[key].filter(v => !isNaN(v));
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = values.length > 0 ? sum / values.length : 0;
        
        console.log(`[ProgramDetail] ${key} stats:`, {
          count: values.length,
          min: values.length > 0 ? Math.min(...values) : 'N/A',
          max: values.length > 0 ? Math.max(...values) : 'N/A',
          avg: avg.toFixed(2),
          sample: values.slice(0, 5)
        });
      });
    } else {
      console.log("[ProgramDetail] ⚠️ WARNING: No program forms found for this agency and date. Check agency name and date format.");
      console.log("[ProgramDetail] Agency:", agency);
      console.log("[ProgramDetail] Date:", openday);
      
      // 추가 디버깅: 해당 기관의 모든 날짜 프로그램 폼 조회
      const allAgencyForms = await prisma.programForm.findMany({
        where: { agency: agency },
        select: { 
          id: true,
          openday: true
        },
        take: 10
      });
      
      if (allAgencyForms.length > 0) {
        console.log(`[ProgramDetail] Found ${allAgencyForms.length} program forms for agency '${agency}' on other dates:`);
        allAgencyForms.forEach(form => {
          console.log(`- ID: ${form.id}, Date: ${form.openday}`);
        });
        console.log("[ProgramDetail] ⚠️ Possible date format issue. Check that openday parameter format matches database format.");
      } else {
        console.log(`[ProgramDetail] No program forms found for agency '${agency}' on any date.`);
        console.log("[ProgramDetail] ⚠️ Possible agency name issue. Check that agency parameter is correct.");
      }
    }

    // Extract all unique program and category IDs from forms (for reference only)
    const programIds = [...new Set(fetchedProgramForms.filter(f => f.program_id).map(f => f.program_id))];
    const categoryIds = [...new Set(fetchedProgramForms.filter(f => f.program_category_id).map(f => f.program_category_id))];
    const teacherIds = [...new Set(fetchedProgramForms.filter(f => f.teacher_id).map(f => f.teacher_id))];
    
    console.log(`[ProgramDetail] Found unique IDs: programs=${programIds.length}, categories=${categoryIds.length}, teachers=${teacherIds.length}`);
    console.log(`[ProgramDetail] Program IDs:`, programIds);
    console.log(`[ProgramDetail] Category IDs:`, categoryIds);
    console.log(`[ProgramDetail] Teacher IDs:`, teacherIds);
    
    // Process forms to generate programSatisfaction data with direct database queries
    console.log("\n=== Processing satisfaction data with direct DB queries ===");
    
    // 직접 programSatisfaction 데이터 생성
    const directSatisfactionData = [];
    
    for (const form of fetchedProgramForms) {
      const programId = form.program_id;
      const categoryId = form.program_category_id;
      const teacherId = form.teacher_id;
      const type = form.type || '참여자';
      
      console.log(`[ProgramDetail] Processing form with programId=${programId}, categoryId=${categoryId}, teacherId=${teacherId}, type=${type}`);
      
      // 프로그램명 직접 조회
      let programName = '프로그램';
      if (programId) {
        try {
          const programRecord = await prisma.programItem.findUnique({
            where: { id: parseInt(programId) }
          });
          if (programRecord && programRecord.program_name) {
            programName = programRecord.program_name;
            console.log(`[ProgramDetail] 프로그램명 조회 성공: ID ${programId} -> ${programName}`);
          } else {
            console.log(`[ProgramDetail] 프로그램명 조회 실패: ID ${programId} not found`);
          }
        } catch (error) {
          console.log(`[ProgramDetail] 프로그램명 조회 오류: ID ${programId}, error:`, error.message);
        }
      }
      
      // 분야명 직접 조회
      let bunyaName = '미분류';
      if (categoryId) {
        try {
          const categoryRecord = await prisma.programCategory.findUnique({
            where: { id: parseInt(categoryId) }
          });
          if (categoryRecord && categoryRecord.category_name) {
            bunyaName = categoryRecord.category_name;
            console.log(`[ProgramDetail] 분야명 조회 성공: ID ${categoryId} -> ${bunyaName}`);
          } else {
            console.log(`[ProgramDetail] 분야명 조회 실패: ID ${categoryId} not found`);
          }
        } catch (error) {
          console.log(`[ProgramDetail] 분야명 조회 오류: ID ${categoryId}, error:`, error.message);
        }
    }
    
      // 강사명 직접 조회
      let teacherName = '강사 명칭';
      if (teacherId) {
        try {
          const instructorRecord = await prisma.instructor.findUnique({
            where: { id: parseInt(teacherId) }
          });
          if (instructorRecord && instructorRecord.name) {
            teacherName = instructorRecord.name;
            console.log(`[ProgramDetail] 강사명 조회 성공: ID ${teacherId} -> ${teacherName}`);
          } else {
            console.log(`[ProgramDetail] 강사명 조회 실패: ID ${teacherId} not found`);
          }
        } catch (error) {
          console.log(`[ProgramDetail] 강사명 조회 오류: ID ${teacherId}, error:`, error.message);
        }
      }
      
      // 폼에 직접 강사명이 있는 경우 사용
      if (teacherName === '강사 명칭' && form.teacher_name) {
        teacherName = form.teacher_name;
        console.log(`[ProgramDetail] 폼에서 강사명 사용: ${teacherName}`);
      }
      
      // page2Data에서 추가 정보 확인
      if (page2Data.programs && page2Data.programs.length > 0) {
        const matchingProgram = page2Data.programs.find(p => 
          p.id == programId || p.program_id == programId || p.program == programId
        );
        if (matchingProgram) {
          if (programName === '프로그램' && matchingProgram.program_name) {
            programName = matchingProgram.program_name;
            console.log(`[ProgramDetail] page2Data에서 프로그램명 보완: ${programName}`);
      }
          if (bunyaName === '미분류' && matchingProgram.category_name) {
            bunyaName = matchingProgram.category_name;
            console.log(`[ProgramDetail] page2Data에서 분야명 보완: ${bunyaName}`);
          }
          if (teacherName === '강사 명칭' && matchingProgram.instructor_name) {
            teacherName = matchingProgram.instructor_name;
            console.log(`[ProgramDetail] page2Data에서 강사명 보완: ${teacherName}`);
      }
        }
      }
      
      console.log(`[ProgramDetail] 최종 매핑 결과: 프로그램="${programName}", 분야="${bunyaName}", 강사="${teacherName}"`);
      
      directSatisfactionData.push({
        PROGRAM_NAME: programName,
        BUNYA: bunyaName,
        TEACHER: teacherName,
        type: type,
        score1: form.score1 || '0',
        score4: form.score4 || '0',
        score7: form.score7 || '0',
        cnt: 1
    });
    }
    
    console.log(`[ProgramDetail] Generated ${directSatisfactionData.length} direct satisfaction entries`);
    if (directSatisfactionData.length > 0) {
      console.log("[ProgramDetail] Direct satisfaction sample:", directSatisfactionData[0]);
    }
    
    // 동일한 프로그램, 강사, 분류별로 그룹화하여 평균 계산
    const groupedSatisfaction = {};
    
    directSatisfactionData.forEach(item => {
      const key = `${item.PROGRAM_NAME}_${item.BUNYA}_${item.TEACHER}_${item.type}`;
      
      if (!groupedSatisfaction[key]) {
        groupedSatisfaction[key] = {
          PROGRAM_NAME: item.PROGRAM_NAME,
          BUNYA: item.BUNYA,
          TEACHER: item.TEACHER,
          type: item.type,
          score1Total: 0,
          score4Total: 0, 
          score7Total: 0,
          count: 0
        };
      }
      
      groupedSatisfaction[key].score1Total += parseFloat(item.score1) || 0;
      groupedSatisfaction[key].score4Total += parseFloat(item.score4) || 0;
      groupedSatisfaction[key].score7Total += parseFloat(item.score7) || 0;
      groupedSatisfaction[key].count += 1;
    });
    
    // 최종 satisfaction 데이터 생성
    const finalSatisfactionData = Object.values(groupedSatisfaction).map(group => {
      // 모든 숫자를 정수로 확실하게 변환하여 의도하지 않은 문자열 변환 방지
      const count = parseInt(group.count) || 0;
      
      // Value debugging for each group before score calculation
      console.log(`[ProgramDetail] 📊 Processing group: ${group.PROGRAM_NAME}, ${group.TEACHER}, ${group.type}`);
      console.log(`[ProgramDetail] Raw totals for this group:`, {
        score1Total: group.score1Total,
        score4Total: group.score4Total,
        score7Total: group.score7Total,
        count: count,
        score1TotalType: typeof group.score1Total,
        score4TotalType: typeof group.score4Total,
        score7TotalType: typeof group.score7Total
      });
      
      // Ensure totals are valid numbers
      const score1Total = typeof group.score1Total === 'number' ? group.score1Total : parseFloat(group.score1Total) || 0;
      const score4Total = typeof group.score4Total === 'number' ? group.score4Total : parseFloat(group.score4Total) || 0;
      const score7Total = typeof group.score7Total === 'number' ? group.score7Total : parseFloat(group.score7Total) || 0;
      
      // 점수 계산시 소수점 한자리까지만 표시
      const score1 = count > 0 ? (score1Total / count).toFixed(1) : '0';
      const score4 = count > 0 ? (score4Total / count).toFixed(1) : '0';
      const score7 = count > 0 ? (score7Total / count).toFixed(1) : '0';
      
      console.log(`[ProgramDetail] Calculated scores for ${group.PROGRAM_NAME} - count: ${count}, scores: ${score1}, ${score4}, ${score7}`);
      
      // Check the actual values we're returning
      const result = {
        PROGRAM_NAME: group.PROGRAM_NAME,
        BUNYA: group.BUNYA, 
        TEACHER: group.TEACHER,
        type: group.type,
        score1: score1,
        score4: score4,
        score7: score7,
        cnt: count // 정수값으로 확실하게 설정
      };
      
      console.log(`[ProgramDetail] Final satisfaction entry:`, result);
      
      return result;
    });
    
    console.log(`[ProgramDetail] Generated ${finalSatisfactionData.length} final satisfaction entries after grouping`);
    if (finalSatisfactionData.length > 0) {
      console.log("[ProgramDetail] Final satisfaction sample:", finalSatisfactionData[0]);
    }
    
    // 최종 programSatisfaction 데이터 사용
    programSatisfaction = finalSatisfactionData;
    
    // 프로그램 만족도 데이터가 비어 있으면 대안 데이터 사용
    if (programSatisfaction.length === 0) {
      console.log("[ProgramDetail] ⚠️ No programSatisfaction data found initially. Attempting to find more data...");
      
      // 더 광범위한 검색 시도 - 날짜 형식 변형, 정확한 에이전시 이름 등
      const alternativeForms = await prisma.programForm.findMany({
        where: {
          OR: [
            { agency: { contains: agency } },
            { agency_id: parseInt(agency) ? parseInt(agency) : undefined }
          ]
        },
        take: 50 // 최대 50개 결과로 제한
      });
      
      console.log(`[ProgramDetail] 🔎 Found ${alternativeForms.length} alternative program forms for similar agency names`);
      
      if (alternativeForms.length > 0) {
        // 첫 번째 레코드 출력
        console.log("[ProgramDetail] Sample alternative form:", {
          id: alternativeForms[0].id,
          agency: alternativeForms[0].agency,
          openday: alternativeForms[0].openday,
          program_id: alternativeForms[0].program_id,
          score1: alternativeForms[0].score1
        });
        
        // 대체 programForm 데이터에서 만족도 데이터 생성
        console.log("[ProgramDetail] Creating satisfaction data from alternative forms");
        
        // 대체 데이터로 satisfaction 데이터 생성
        const alternativeSatisfactionData = [];
        
        // 프로그램 ID별 그룹화
        const groupedByProgram = {};
        
        alternativeForms.forEach(form => {
          const programId = form.program_id?.toString();
          if (!programId) return;
          
          if (!groupedByProgram[programId]) {
            groupedByProgram[programId] = [];
          }
          
          groupedByProgram[programId].push(form);
        });
        
        // 각 프로그램 그룹에 대해 만족도 항목 생성
        for (const [programId, forms] of Object.entries(groupedByProgram)) {
          if (forms.length === 0) continue;
          
          // 첫 번째 폼으로부터 기본 정보 추출
          const firstForm = forms[0];
          
          // 프로그램명 직접 조회
          let programName = '프로그램';
          if (programId) {
            try {
              const programRecord = await prisma.programItem.findUnique({
                where: { id: parseInt(programId) }
              });
              if (programRecord && programRecord.program_name) {
                programName = programRecord.program_name;
              }
            } catch (error) {
              console.log(`[ProgramDetail] Alternative 프로그램명 조회 오류: ID ${programId}`);
            }
          }
          
          // 분야명 직접 조회
          const categoryId = firstForm.program_category_id;
          let bunyaName = '미분류';
          if (categoryId) {
            try {
              const categoryRecord = await prisma.programCategory.findUnique({
                where: { id: parseInt(categoryId) }
              });
              if (categoryRecord && categoryRecord.category_name) {
                bunyaName = categoryRecord.category_name;
              }
            } catch (error) {
              console.log(`[ProgramDetail] Alternative 분야명 조회 오류: ID ${categoryId}`);
            }
          }
          
          // 강사명 직접 조회
          const teacherId = firstForm.teacher_id;
          let teacherName = '강사명 없음';
          if (teacherId) {
            try {
              const instructorRecord = await prisma.instructor.findUnique({
                where: { id: parseInt(teacherId) }
              });
              if (instructorRecord && instructorRecord.name) {
                teacherName = instructorRecord.name;
              }
            } catch (error) {
              console.log(`[ProgramDetail] Alternative 강사명 조회 오류: ID ${teacherId}`);
            }
          }
          
          // 각 참여 유형별로 그룹화
          const typeGroups = {};
          
          forms.forEach(form => {
            const type = form.type || '참여자';
            
            if (!typeGroups[type]) {
              typeGroups[type] = {
                count: 0,
                score1Total: 0,
                score4Total: 0,
                score7Total: 0
              };
            }
            
            // 점수 합산
            if (form.score1) typeGroups[type].score1Total += parseFloat(form.score1) || 0;
            if (form.score4) typeGroups[type].score4Total += parseFloat(form.score4) || 0;
            if (form.score7) typeGroups[type].score7Total += parseFloat(form.score7) || 0;
            typeGroups[type].count++;
          });
          
          // 각 유형별로 만족도 항목 생성
          for (const [type, group] of Object.entries(typeGroups)) {
            // 평균 계산
            const score1 = group.count > 0 ? (group.score1Total / group.count).toFixed(1) : '0';
            const score4 = group.count > 0 ? (group.score4Total / group.count).toFixed(1) : '0';
            const score7 = group.count > 0 ? (group.score7Total / group.count).toFixed(1) : '0';
            
            console.log(`[ProgramDetail] Adding alternative satisfaction for ${programName}, ${type}: scores=${score1}/${score4}/${score7}, cnt=${group.count}`);
            
            alternativeSatisfactionData.push({
              PROGRAM_NAME: programName,
              BUNYA: bunyaName,
              TEACHER: teacherName,
              type: type,
              score1: score1,
              score4: score4,
              score7: score7,
              cnt: group.count
            });
          }
        }
        
        // 실제 데이터가 생성되었으면 사용
        if (alternativeSatisfactionData.length > 0) {
          console.log(`[ProgramDetail] Using ${alternativeSatisfactionData.length} real satisfaction items from alternative forms`);
          
          // page2 프로그램 목록을 기본 구조로 사용
          if (page2Data.programs && page2Data.programs.length > 0) {
            console.log("[ProgramDetail] Creating base structure from page2 programs and overlaying alternative satisfaction data");
            
            // 기본 구조 생성
            const baseSatisfactionData = [];
            
            page2Data.programs.forEach(program => {
              const categoryName = program.category_name || '기타';
              const programName = program.program_name || categoryName + '프로그램';
              const teacher = program.instructor_name || '담당강사';
              
              // 기본적으로 참여자만 생성
              baseSatisfactionData.push({
                PROGRAM_NAME: programName,
                BUNYA: categoryName,
                TEACHER: teacher,
                type: '참여자',
                score1: '0',
                score4: '0',
                score7: '0',
                cnt: 0
              });
            });
            
            console.log(`[ProgramDetail] Created base structure with ${baseSatisfactionData.length} items`);
            
            // alternativeSatisfactionData를 기본 구조에 매칭하여 업데이트
            alternativeSatisfactionData.forEach(altData => {
              const matchingIndex = baseSatisfactionData.findIndex(baseItem => 
                baseItem.PROGRAM_NAME === altData.PROGRAM_NAME &&
                baseItem.BUNYA === altData.BUNYA &&
                baseItem.TEACHER === altData.TEACHER &&
                baseItem.type === altData.type
              );
              
              if (matchingIndex !== -1) {
                // 매칭되는 항목이 있으면 설문 데이터로 업데이트
                baseSatisfactionData[matchingIndex] = {
                  ...baseSatisfactionData[matchingIndex],
                  score1: altData.score1,
                  score4: altData.score4,
                  score7: altData.score7,
                  cnt: altData.cnt
                };
                console.log(`[ProgramDetail] Updated base item with alternative data: ${altData.PROGRAM_NAME} - ${altData.type}`);
              } else {
                // 매칭되지 않는 항목은 추가 (기존 설문 데이터에만 있는 경우)
                baseSatisfactionData.push(altData);
                console.log(`[ProgramDetail] Added additional alternative data: ${altData.PROGRAM_NAME} - ${altData.type}`);
              }
            });
            
            programSatisfaction = baseSatisfactionData;
            console.log(`[ProgramDetail] Final satisfaction data count: ${programSatisfaction.length}`);
          } else {
            // page2 프로그램이 없으면 alternativeSatisfactionData만 사용
            programSatisfaction = alternativeSatisfactionData;
          }
        }
      }
    }
    
    // 여전히 프로그램 만족도 데이터가 비어 있으면 구조만 생성
    if (programSatisfaction.length === 0) {
      console.log("[ProgramDetail] No real satisfaction data found even after alternative search");
      
      // 실제 프로그램 목록이 있는 경우에만 구조 생성 (모의 점수 없이)
      if (page2Data.programs && page2Data.programs.length > 0) {
        console.log("[ProgramDetail] Creating empty structure from program list without mock scores");
        
        // 프로그램 목록에서 데이터 구조만 가져옴 (점수는 실제 설문 데이터가 없음을 표시)
        page2Data.programs.forEach(program => {
          const categoryName = program.category_name || '기타';
          const programName = program.program_name || categoryName + '프로그램';
          const teacher = program.instructor_name || '담당강사';
          
          // 기본적으로 참여자만 생성
          programSatisfaction.push({
            PROGRAM_NAME: programName,
            BUNYA: categoryName,
            TEACHER: teacher,
            type: '참여자',
            score1: '0',
            score4: '0',
            score7: '0',
            cnt: 0  // 실제 설문 참가자가 없음을 표시
          });
        });
        
        console.log("[ProgramDetail] Created empty structure for", programSatisfaction.length, "programs");
      } else {
        console.log("[ProgramDetail] No programs found, programSatisfaction will remain empty");
      }
    }

    // 프로그램 만족도 섹션 이미지와 동일한 형태로 로그 출력
    console.log('\n\n=========== 프로그램 만족도 섹션 데이터 ===========');
    console.log('| 프로그램명 | 분야 | 강사명 | 참여구분 | 강사 점수 | 구성/품질 점수 | 효과성 점수 | 설문참가인원 | 전체평균 |');
    console.log('|------------|------|--------|----------|----------|--------------|------------|------------|----------|');
    
    programSatisfaction.forEach(item => {
      // 각 항목별 평균 계산
      const instructorAvg = ((parseFloat(item.score1) || 0)).toFixed(1);
      const qualityAvg = ((parseFloat(item.score4) || 0)).toFixed(1);
      const effectAvg = ((parseFloat(item.score7) || 0)).toFixed(1);
      
      // 전체 평균
      const totalAvg = (
        (parseFloat(instructorAvg) + parseFloat(qualityAvg) + parseFloat(effectAvg)) / 3
      ).toFixed(2);
      
      console.log(
        `| ${item.PROGRAM_NAME.padEnd(10)} | ${item.BUNYA.padEnd(4)} | ${item.TEACHER.padEnd(6)} | ${item.type.padEnd(8)} | ${
          instructorAvg.padEnd(8)} | ${qualityAvg.padEnd(12)} | ${effectAvg.padEnd(10)} | ${
          String(item.cnt).padEnd(10)} | ${totalAvg.padEnd(8)} |`
      );
    });
    
    console.log('===================================================\n\n');
    
    // Return the updated result structure with all needed data
    return {
      basicInfo,
      serviceList,
      programSatisfaction,
      programSaf,
      effect: {
        counsel: effect.counsel,
        healing: effect.healing,
        hrv: effect.hrv,
        prevent: effect.prevent
      },
      inExpense: {
        income: inExpense.income,
        expense: inExpense.expense
      },
      serviceForms: processedServiceForms, // Use the processed version
      programForms: programForms, // Use fetched program forms
      preventForms,
      healingForms,
      counselForms,
      hrvForms,
      programCategories,
      programItems,
      instructors,
      assistantInstructors,
      helpers,
      programs: page2Data.programs || [], // page2 프로그램 목록 추가
      page4Data: page4Data || [], // page4 데이터 추가
      complaint: pageFinalData?.complaint || ''
    };
  } catch (error) {
    console.error('Error fetching program detail:', error);
    throw new Error(`Failed to fetch program detail: ${error.message}`);
  }
};

module.exports = {
  getProgramList,
  getProgramDetail
}; 