// 공유 Prisma 인스턴스 사용
const prisma = require('../../../prisma/prismaClient');

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
        OM: item.page1?.operation_manager || ''
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching program list:', error);
    throw new Error('Failed to fetch program list');
  }
};

/**
 * 프로그램 상세 정보 조회 resolver
 */
const getProgramDetail = async (_, { seq, agency, openday }) => {
  try {
    // Page2 상세 정보 조회
    const page2Data = await prisma.page2.findUnique({
      where: { id: seq },
      include: {
        page1: true,
        programs: true
      }
    });
    
    if (!page2Data) {
      throw new Error(`No program details found for seq: ${seq}`);
    }
    
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

    // PageFinal 정보 조회 (민원사항, 수입/지출 금액)
    const pageFinalData = await prisma.pageFinal.findUnique({
      where: { page1_id: page2Data.page1_id },
      include: {
        teacher_expenses: true,
        participant_expenses: true,
        income_items: true
      }
    });
    
    // 체류일수 계산
    const stayDays = page2Data.page1?.end_date && page2Data.page1?.start_date ? 
      Math.ceil((new Date(page2Data.page1.end_date) - new Date(page2Data.page1.start_date)) / (1000 * 60 * 60 * 24)) : 0;
    
    // 객실 수 계산 (참여자/인솔자)
    const participantRoomCount = Math.ceil((page2Data.male_count + page2Data.female_count) / 4); // 참여자 객실 (4명 기준)
    const leaderRoomCount = Math.ceil((page2Data.male_leader_count + page2Data.female_leader_count) / 2); // 인솔자 객실 (2명 기준)
    
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
    const basicInfo = {
      BASIC_INFO_SEQ: seq,
      AGENCY: agency,
      OM: page2Data.page1?.operation_manager || '',
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
      SERVICE_TYPE: page2Data.service_type || ''
    };
    
    // 서비스 폼 데이터 조회
    const serviceForms = await prisma.serviceForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
    // 서비스 만족도 계산
    const serviceList = [];
    let serviceScores = {};
    
    if (serviceForms.length > 0) {
      // 모든 서비스 폼 데이터의 평균 점수 계산
      let totalScores = Array(18).fill(0);
      let totalCounts = Array(18).fill(0);
      
      serviceForms.forEach(form => {
        // Process scores directly from the form object instead of entries
        for (let i = 1; i <= 18; i++) {
          const score = parseFloat(form[`score${i}`]);
          if (!isNaN(score) && score > 0) {
            totalScores[i-1] += score;
            totalCounts[i-1]++;
          }
        }
      });
      
      // 평균 계산
      serviceScores = {};
      for (let i = 1; i <= 18; i++) {
        serviceScores[`score${i}`] = totalCounts[i-1] > 0 ? 
          parseFloat((totalScores[i-1] / totalCounts[i-1]).toFixed(1)) : 0;
      }
      
      serviceList.push(serviceScores);
    } else {
      // 서비스 폼 데이터가 없는 경우 기본 값 설정
      serviceScores = Array(18).fill(0).reduce((acc, _, idx) => {
        acc[`score${idx + 1}`] = 0;
        return acc;
      }, {});
      serviceList.push(serviceScores);
    }
    
    // 프로그램 폼 데이터 조회
    const programForms = await prisma.programForm.findMany({
      where: {
        agency: agency,
        
      }
    });
    
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
    
    // 프로그램 만족도 계산
    const programSatisfaction = [];
    
    // 1. 먼저 각 program_id 별로 관련 폼 그룹화
    const programFormsByProgramId = {};
    
    programForms.forEach(form => {
      const formProgramId = form.program_id?.toString();
      if (!formProgramId) return;
      
      if (!programFormsByProgramId[formProgramId]) {
        programFormsByProgramId[formProgramId] = [];
      }
      
      programFormsByProgramId[formProgramId].push(form);
    });
    
    // 강사 ID로 강사명 조회하기 위한 map 생성
    const instructorIdToNameMap = new Map();
    
    // 2. page2Data의 프로그램 목록을 기준으로 만족도 데이터 구성
    for (const program of page2Data.programs) {
      const programId = program.program?.toString();
      if (!programId) continue;
      
      const forms = programFormsByProgramId[programId] || [];
      if (forms.length === 0) continue;
      
      // 강사 정보 조회
      let instructorName = program.instructor_name || '';
      
      // 강사 ID가 있는 경우 실제 강사 정보 조회
      if (program.instructor) {
        const instructorId = parseInt(program.instructor);
        
        // 이미 조회한 강사인지 확인
        if (!instructorIdToNameMap.has(instructorId)) {
          try {
            // 강사 정보 조회
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
          // 이미 조회한 강사인 경우 캐시된 값 사용
          instructorName = instructorIdToNameMap.get(instructorId);
        }
      }
      
      // 참여 유형별로 그룹화
      const formsByType = {};
      
      forms.forEach(form => {
        const type = form.type || '참여자';
        
        if (!formsByType[type]) {
          formsByType[type] = [];
        }
        
        formsByType[type].push(form);
      });
      
      // 각 유형별로 평균 계산
      for (const [type, typeForms] of Object.entries(formsByType)) {
        if (typeForms.length === 0) continue;
        
        const scores = {};
        
        // 각 문항별 평균 점수 계산
        for (let i = 1; i <= 9; i++) {
          const scoreKey = `score${i}`;
          
          // 유효한 점수값만 필터링
          const validScores = typeForms
            .map(form => {
              const value = form[scoreKey];
              return value ? parseFloat(value) : null;
            })
            .filter(score => score !== null && !isNaN(score) && score > 0);
          
          // 평균 계산
          scores[scoreKey] = validScores.length > 0
            ? parseFloat((validScores.reduce((sum, val) => sum + val, 0) / validScores.length).toFixed(1))
            : 0;
        }
        
        // 고유키 생성 (프로그램명, 분야, 강사명, 참여구분으로 구성)
        const key = `${program.program_name || ''}_${program.category_name || ''}_${instructorName}_${type}`;
        
        // 동일 키에 해당하는 항목이 이미 있는지 검사
        const existingItemIndex = programSatisfaction.findIndex(item => 
          `${item.PROGRAM_NAME}_${item.BUNYA}_${item.TEACHER}_${item.type}` === key
        );
        
        if (existingItemIndex >= 0) {
          // 이미 존재하는 항목이면 점수와 개수 업데이트
          const existingItem = programSatisfaction[existingItemIndex];
          
          // 기존 항목과 새 항목의 점수 합산
          for (let i = 1; i <= 9; i++) {
            const scoreKey = `score${i}`;
            const existingScore = existingItem[scoreKey] * existingItem.cnt;
            const newScore = scores[scoreKey] * typeForms.length;
            const totalCnt = existingItem.cnt + typeForms.length;
            
            // 새로운 평균 계산
            existingItem[scoreKey] = totalCnt > 0 
              ? parseFloat(((existingScore + newScore) / totalCnt).toFixed(1)) 
              : 0;
          }
          
          // 카운트 업데이트
          existingItem.cnt += typeForms.length;
        } else {
          // 결과 추가
          programSatisfaction.push({
            PROGRAM_NAME: program.program_name || '',
            TEACHER: instructorName,
            BUNYA: program.category_name || '',
            type,
            ...scores,
            cnt: typeForms.length
          });
        }
      }
    }
    
    // 프로그램 실시 결과 데이터 구성
    const programSaf = page2Data.programs.map((program, index) => ({
      SAF_SEQ: index + 1,
      PROGRAM_NAME: program.program_name || '',
      START_TIME: program.start_time || '',
      END_TIME: program.end_time || '',
      SAF_DATE: program.date ? new Date(program.date).toISOString().split('T')[0] : ''
    }));
    
    // Prevent 폼 데이터 조회 (예방서비스 효과평가)
    const preventForms = await prisma.preventForm.findMany({
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
      
      // 모든 score 필드 처리
      for (let i = 1; i <= 20; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score > 0) {
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
        if (!isNaN(score) && score > 0) {
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
        if (!isNaN(score) && score > 0) {
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
      // 1. 강사 관련 지출 데이터 처리 (예정/집행 구분, 동일 카테고리 합산)
      if (pageFinalData.teacher_expenses && pageFinalData.teacher_expenses.length > 0) {
        // 강사 예정 지출을 카테고리별로 집계
        const instructorPlannedMap = {};
        pageFinalData.teacher_expenses
          .filter(exp => exp.is_planned === true)
          .forEach(exp => {
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
        pageFinalData.teacher_expenses
          .filter(exp => exp.is_planned === false)
          .forEach(exp => {
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
        
        // 강사 예정금액 항목 추가 (천원 단위로 변환)
        Object.entries(instructorPlannedMap).forEach(([category, data]) => {
          inExpense.expense.push({
            ITEM: `${category}(천원)_예정`,
            PRICE: Math.round(data.amount / 1000).toString(),
            DETAIL: data.details.join(', ') || ''
          });
        });
        
        // 강사 집행금액 항목 추가 (천원 단위로 변환)
        Object.entries(instructorActualMap).forEach(([category, data]) => {
          inExpense.expense.push({
            ITEM: `${category}(천원)_집행`,
            PRICE: Math.round(data.amount / 1000).toString(),
            DETAIL: data.details.join(', ') || ''
          });
        });
      }
      
      // 2. 참가자 관련 지출 데이터 처리 (예정/집행 구분, 동일 카테고리 합산)
      if (pageFinalData.participant_expenses && pageFinalData.participant_expenses.length > 0) {
        // 참가자 예정 지출을 카테고리별로 집계
        const participantPlannedMap = {};
        pageFinalData.participant_expenses
          .filter(exp => exp.is_planned === true)
          .forEach(exp => {
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
        
        // 참가자 집행 지출을 카테고리별로 집계
        const participantActualMap = {};
        pageFinalData.participant_expenses
          .filter(exp => exp.is_planned === false)
          .forEach(exp => {
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
        
        // 참가자 예정금액 항목 추가 (천원 단위로 변환)
        Object.entries(participantPlannedMap).forEach(([category, data]) => {
          inExpense.expense.push({
            ITEM: `${category}(천원)_예정`,
            PRICE: Math.round(data.amount / 1000).toString(),
            DETAIL: data.details.join(', ') || ''
          });
        });
        
        // 참가자 집행금액 항목 추가 (천원 단위로 변환)
        Object.entries(participantActualMap).forEach(([category, data]) => {
          inExpense.expense.push({
            ITEM: `${category}(천원)_집행`,
            PRICE: Math.round(data.amount / 1000).toString(),
            DETAIL: data.details.join(', ') || ''
          });
        });
      }
      
      // 3. 수입 데이터 처리 (동일 카테고리 합산)
      if (pageFinalData.income_items && pageFinalData.income_items.length > 0) {
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
        
        // 수입 항목 추가 (천원 단위로 변환)
        Object.entries(incomeMap).forEach(([category, data]) => {
          inExpense.income.push({
            ITEM: `${category}(천원)`,
            PRICE: Math.round(data.amount / 1000).toString(),
            DETAIL: data.details.join(', ') || ''
          });
        });
      }
    }
    
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
    
    // 프로그램 아이템 정보 조회
    const programItems = await prisma.programItem.findMany({
      orderBy: [
        { display_order: 'asc' },
        { id: 'asc' }
      ]
    });
    
    // 결합된 상세 정보 반환
    const result = {
      basicInfo,
      serviceList,
      programSatisfaction,
      programSaf,
      effect,
      effectHelpers,
      inExpense,
      serviceForms,
      programForms,
      preventForms,
      healingForms,
      counselForms,
      hrvForms,
      programCategories,
      programItems,
      instructors,
      assistantInstructors,
      helpers,
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
    console.log('- 숙소(편리): serviceList[0].score1 =', serviceList[0]?.score1);
    console.log('- 숙소(청결): serviceList[0].score2 =', serviceList[0]?.score2);
    console.log('- 식당(편리): serviceList[0].score3 =', serviceList[0]?.score3);
    console.log('- 식당(청결): serviceList[0].score4 =', serviceList[0]?.score4);
    console.log('- 프로그램장소(만족도): serviceList[0].score5 =', serviceList[0]?.score5);
    console.log('- 식사(신선도): serviceList[0].score14 =', serviceList[0]?.score14);
    
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
      const incomeMap = {};
      
      pageFinalData.income_items.forEach(inc => {
        const category = inc.category || '기타';
        if (!incomeMap[category]) incomeMap[category] = 0;
        incomeMap[category] += Number(inc.amount || 0);
      });
      
      Object.entries(incomeMap).forEach(([category, amount]) => 
        console.log(`  ${category}: ${Math.round(amount / 1000)}천원`));
      
      const totalIncome = pageFinalData.income_items.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
      console.log('- 총 수입금액:', Math.round(totalIncome / 1000), '천원');
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
              if (!isNaN(score) && score > 0) entrySum += score;
            }
            return sum + entrySum;
          }, 0),
          count: form.entries.reduce((count, entry) => {
            let entryCount = 0;
            for (let i = 1; i <= 18; i++) {
              const score = parseFloat(entry[`score${i}`]);
              if (!isNaN(score) && score > 0) entryCount++;
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
              if (!isNaN(score) && score > 0) entrySum += score;
            }
            return sum + entrySum;
          }, 0),
          count: form.entries.reduce((count, entry) => {
            let entryCount = 0;
            for (let i = 1; i <= 18; i++) {
              const score = parseFloat(entry[`score${i}`]);
              if (!isNaN(score) && score > 0) entryCount++;
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
        숙소편리성: serviceList[0]?.score1 || 0,
        숙소청결성: serviceList[0]?.score2 || 0,
        식당편리성: serviceList[0]?.score3 || 0,
        식당청결성: serviceList[0]?.score4 || 0,
        프로그램장소만족도: serviceList[0]?.score5 || 0,
        숙소적합성: serviceList[0]?.score6 || 0,
        숙소만족도: serviceList[0]?.score7 || 0,
        식당적합성: serviceList[0]?.score8 || 0,
        식당만족도: serviceList[0]?.score9 || 0,
        프로그램장소적합성: serviceList[0]?.score10 || 0,
        프로그램장소만족도2: serviceList[0]?.score11 || 0,
        식사다양성: serviceList[0]?.score12 || 0,
        식사영양: serviceList[0]?.score13 || 0,
        식사신선도: serviceList[0]?.score14 || 0,
        식사만족도: serviceList[0]?.score15 || 0,
        운영진친절도: serviceList[0]?.score16 || 0,
        운영진전문성: serviceList[0]?.score17 || 0,
        운영진만족도: serviceList[0]?.score18 || 0
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

    return result;
  } catch (error) {
    console.error('Error fetching program detail:', error);
    throw new Error(`Failed to fetch program detail: ${error.message}`);
  }
};

module.exports = {
  getProgramList,
  getProgramDetail
}; 