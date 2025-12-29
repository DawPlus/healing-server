/**
 * Import handlers for PageFinalEdit component
 * These functions handle importing data from other pages into the final page
 */

// Helper function to format details from grouped items
const formatGroupDetails = (groups) => {
  let details = '';
  
  for (const [key, value] of Object.entries(groups)) {
    const info = typeof value === 'number' 
      ? `${key} ${value}건` 
      : `${key} ${value.length}건`;
      
    details = details ? `${details}, ${info}` : info;
  }
  
  return details;
};

// Helper function to determine if this is a batch import run
const isBatchImport = (showAlert) => {
  // Don't use name property which is read-only
  return typeof showAlert === 'function' && showAlert.toString().includes('silentLogger');
};

// Global tracking set to prevent duplicate data processing
// This will help prevent duplicate instructor data loading
export const processedDataTracker = {
  instructors: new Set(), // Store instructor:category:planned keys that have been processed
  resetTracking: function() {
    this.instructors.clear();
  },
  hasProcessed: function(key) {
    return this.instructors.has(key);
  },
  markProcessed: function(key) {
    this.instructors.add(key);
  }
};

/**
 * Handle loading instructor data from page 2
 */
export const handleInstructorDataLoaded = (data, { showAlert, handleAddTeacherExpense, refetch, instructors = [], existingExpenses = [], skipInstructorData = false }) => {
  // Log arguments to debug
  console.log('========================= handleInstructorDataLoaded 시작 =========================');
  console.log('handleInstructorDataLoaded called with:', {
    hasData: !!data,
    hasGetPage2ByPage1Id: !!(data && data.getPage2ByPage1Id),
    programsCount: data?.getPage2ByPage1Id?.programs?.length || 0,
    hasShowAlert: !!showAlert,
    hasHandleAddTeacherExpense: !!handleAddTeacherExpense,
    hasRefetch: !!refetch,
    instructorsCount: instructors.length,
    existingExpensesCount: existingExpenses.length,
    skipInstructorData
  });
  
  // Skip instructor data loading if requested (for income-only loading)
  if (skipInstructorData) {
    console.log('강사비 항목 추가 건너뜀 (skipInstructorData=true)');
    console.log('========================= handleInstructorDataLoaded 종료 (건너뜀) =========================');
    return;
  }
  
  if (!data || !data.getPage2ByPage1Id || !data.getPage2ByPage1Id.programs || data.getPage2ByPage1Id.programs.length === 0) {
    // Only show alert if not in batch import
    console.log('데이터가 없거나 프로그램이 없음, 처리 중단');
    if (!isBatchImport(showAlert)) {
      showAlert('불러올 강사 데이터가 없습니다.', 'warning');
    }
    console.log('========================= handleInstructorDataLoaded 종료 (데이터 없음) =========================');
    return;
  }
  
  // handleAddTeacherExpense 함수가 없으면 진행할 수 없음
  if (typeof handleAddTeacherExpense !== 'function') {
    console.error('handleAddTeacherExpense is not a function:', handleAddTeacherExpense);
    showAlert('강사비 항목을 추가할 수 없습니다. 시스템 오류가 발생했습니다.', 'error');
    console.log('========================= handleInstructorDataLoaded 종료 (함수 없음) =========================');
    return;
  }
  
  const programs = data.getPage2ByPage1Id.programs;
  console.log(`프로그램 데이터 확인: ${programs.length}개 프로그램 존재`);
  
  // 강사별로 그룹화
  const instructorGroups = {};
  programs.forEach(program => {
    const instructorName = program.instructor_name || '이름 없음';
    if (!instructorGroups[instructorName]) {
      instructorGroups[instructorName] = [];
    }
    instructorGroups[instructorName].push(program);
  });
  
  console.log(`강사별 그룹화 완료: ${Object.keys(instructorGroups).length}명의 강사 확인됨`);
  console.log('강사 목록:', Object.keys(instructorGroups));
  
  // 이 함수는 예정 OR 집행 비용 하나만 추가
  // 중복 저장 방지를 위해 예정 항목만 추가하도록 수정
  const addOnlyPlannedExpenses = isBatchImport(showAlert);
  console.log(`일괄 처리 모드: ${addOnlyPlannedExpenses ? '예정 비용만 추가' : '예정/집행 비용 모두 추가'}`);
  
  // instructorExpenseMap - 강사:카테고리 별 항목이 이미 있는지 체크 (중복 방지)
  // 이 맵에 키가 존재하면 이미 추가된 항목이므로 건너뜀
  const instructorExpenseMap = new Map();
  
  // 만약 existingExpenses가 제공되었다면 맵 초기화
  if (existingExpenses && existingExpenses.length > 0) {
    console.log(`${existingExpenses.length}개의 기존 비용 항목 중복 체크 시작`);
    existingExpenses.forEach(expense => {
      if (expense.details) {
        // 세부 내역에서 강사 이름 추출 (강사 이름: 세부 내역 형식)
        const instructorMatch = expense.details.match(/^([^:]+):/);
        if (instructorMatch && instructorMatch[1]) {
          const instructorName = instructorMatch[1].trim();
          const key = `${instructorName}:${expense.category}:${expense.is_planned}`;
          instructorExpenseMap.set(key, true);
          console.log(`중복 항목 등록: ${key}`);
          
          // 전역 트래커에도 추가
          processedDataTracker.markProcessed(key);
        }
      }
    });
  }
  
  console.log('중복 체크 맵 초기화 완료:', [...instructorExpenseMap.keys()]);
  
  // 각 강사별로 항목 생성
  const instructorPromises = [];
  
  Object.entries(instructorGroups).forEach(([instructorName, programs]) => {
    console.log(`----- 강사 [${instructorName}] 비용 계산 시작 -----`);
    // 강사 시간당 단가 조회 - 강사 목록에서 찾거나 기본값 사용
    const instructorInfo = instructors.find(i => i.name === instructorName);
    const hourlyRate = instructorInfo && instructorInfo.payment_rate !== undefined && instructorInfo.payment_rate !== null
      ? instructorInfo.payment_rate
      : 200000; // 기본값 200,000원
    
    // 로그에 강사 시간당 단가 출력 (디버깅용)
    console.log(`강사 [${instructorName}] 시간당 단가: ${hourlyRate}원 (${instructorInfo ? '데이터베이스' : '기본값'})`);
    
    // 각 프로그램별 비용 계산 (시간당 금액 * 진행 시간)
    let totalPrice = 0;
    let totalDuration = 0;
    
    const programDetailsList = programs.map(program => {
      // duration 값 확인 및 파싱
      let duration;
      if (program.duration && parseFloat(program.duration) > 0) {
        duration = parseFloat(program.duration);
      } else {
        // 시작 시간과 종료 시간으로부터 duration 계산 시도
        const startTime = program.start_time ? parseTimeString(program.start_time) : null;
        const endTime = program.end_time ? parseTimeString(program.end_time) : null;
        
        if (startTime && endTime && endTime > startTime) {
          // 시간 차이 계산 (시간 단위)
          duration = (endTime - startTime) / 60 / 60 / 1000;
        } else {
          // 기본값 - 1시간
          duration = 1;
        }
      }
      
      // 최종 duration 추가
      totalDuration += duration;
      
      // 프로그램별 비용 계산
      const programPrice = hourlyRate * duration;
      totalPrice += programPrice;
      console.log(`  프로그램: ${program.program_name}, 시간: ${duration}, 비용: ${programPrice}원`);
      
      // 세부 내역 (프로그램명(합계: 금액))
      return `${program.program_name || '프로그램'}(합계: ${programPrice.toLocaleString()}원)`;
    });
    
    // 세부 내역 문자열 생성
    const programDetails = programDetailsList.join(' | ');
    
    // 천원 단위로 변환 (1000으로 나눔)
    const amountInThousands = Math.round(totalPrice / 1000);
    console.log(`  강사 [${instructorName}] 총 비용: ${totalPrice}원, 천원 단위: ${amountInThousands}천원`);
    
    // 중복 방지를 위한 플래그
    const addExpensePromises = [];
    
    // 비용이 0원인 경우에도 항목을 추가하도록 수정 (기존 코드는 0원이면 건너뜀)
    /* if (totalPrice === 0) {
      console.log(`  강사 [${instructorName}] 총 비용이 0원이라 추가하지 않음`);
      return;
    } */
    
    // 예정 강사 비용 - 중복 체크 후 추가
    const plannedKey = `${instructorName}:강사비:true`;
    if (!instructorExpenseMap.has(plannedKey) && !processedDataTracker.hasProcessed(plannedKey)) {
      instructorExpenseMap.set(plannedKey, true); // 키 추가해서 다음번에 중복 방지
      processedDataTracker.markProcessed(plannedKey); // 전역 트래커에도 추가
      
      console.log(`  강사 [${instructorName}] 예정 비용 항목 추가 중 (중복 없음)`);
      
      // 예정 강사 비용 추가
      const addPlannedExpense = handleAddTeacherExpense({
        category: '강사비',
        amount: amountInThousands,
        details: `${instructorName}: ${programDetails}`,
        notes: `${programDetailsList.length}개 프로그램, 총 ${totalDuration}시간, ${amountInThousands}(단위:천원)`,
        is_planned: true
      });
      
      addExpensePromises.push(addPlannedExpense);
    } else {
      console.log(`  강사 [${instructorName}] 예정 비용 항목 중복으로 건너뜀`);
    }
    
    // 집행 강사 비용 - 일괄 가져오기 아닐 때만 + 중복 체크 후 추가
    if (!addOnlyPlannedExpenses) {
      const executedKey = `${instructorName}:강사비:false`;
      if (!instructorExpenseMap.has(executedKey) && !processedDataTracker.hasProcessed(executedKey)) {
        instructorExpenseMap.set(executedKey, true); // 키 추가해서 다음번에 중복 방지
        processedDataTracker.markProcessed(executedKey); // 전역 트래커에도 추가
        
        console.log(`  강사 [${instructorName}] 집행 비용 항목 추가 중 (중복 없음)`);
        
        // 집행 강사 비용 추가
        const addExecutedExpense = handleAddTeacherExpense({
          category: '강사비',
          amount: amountInThousands,
          details: `${instructorName}: ${programDetails}`,
          notes: `${programDetailsList.length}개 프로그램, 총 ${totalDuration}시간, ${amountInThousands}(단위:천원)`,
          is_planned: false
        });
        
        addExpensePromises.push(addExecutedExpense);
      } else {
        console.log(`  강사 [${instructorName}] 집행 비용 항목 중복으로 건너뜀`);
      }
    }
    
    // 이 강사에 대한 Promise들 추가
    if (addExpensePromises.length > 0) {
      instructorPromises.push(Promise.all(addExpensePromises));
      console.log(`  강사 [${instructorName}] 비용 항목 추가 요청 완료 (${addExpensePromises.length}개 항목)`);
    } else {
      console.log(`  강사 [${instructorName}] 중복으로 인해 추가할 항목 없음`);
    }
    console.log(`----- 강사 [${instructorName}] 비용 계산 종료 -----`);
  });
  
  // 시간 문자열을 파싱하는 유틸리티 함수
  function parseTimeString(timeStr) {
    try {
      // HH:MM 또는 HH:MM:SS 형식의 시간 파싱
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        // 밀리초로 변환하여 반환
        return new Date(0, 0, 0, hours, minutes, 0, 0).getTime();
      }
    } catch (e) {
      console.error('시간 파싱 오류:', e);
    }
    return null;
  }
  
  // 모든 강사 데이터 저장 대기
  if (instructorPromises.length > 0) {
    console.log(`총 ${instructorPromises.length}명의 강사 비용 항목 처리 중...`);
    Promise.all(instructorPromises)
      .then((results) => {
        console.log(`모든 강사 비용 처리 완료:`, results);
        // Only show alert if not in batch import
        if (!isBatchImport(showAlert)) {
          showAlert('강사 비용 정보를 성공적으로 불러왔습니다.', 'success');
          refetch();
        }
        console.log('========================= handleInstructorDataLoaded 종료 (성공) =========================');
      })
      .catch(error => {
        // Always log errors but only show alert if not in batch import
        console.error('Error adding teacher expenses:', error);
        if (!isBatchImport(showAlert)) {
          showAlert(`강사 비용 추가 중 오류 발생: ${error.message}`, 'error');
        }
        console.log('========================= handleInstructorDataLoaded 종료 (오류) =========================');
      });
  } else {
    console.log(`추가할 강사 비용 항목이 없음`);
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('가격 정보가 있는 강사 데이터가 없습니다.', 'warning');
    }
    console.log('========================= handleInstructorDataLoaded 종료 (항목 없음) =========================');
  }
};

/**
 * Handle loading room data from page 3
 */
export const handleRoomDataLoaded = (data, { showAlert, handleAddParticipantExpense, handleAddIncome, refetch }) => {
  if (!data || !data.getPage3ByPage1Id || !data.getPage3ByPage1Id.room_selections || data.getPage3ByPage1Id.room_selections.length === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('불러올 객실 데이터가 없습니다.', 'warning');
    }
    return;
  }
  
  const rooms = data.getPage3ByPage1Id.room_selections;
  
  // 객실 타입별 그룹화
  const roomTypeGroups = {};
  
  // 객실 정보 합산 - page3 로직과 동일하게 수정
  let totalPrice = 0;
  let roomNightsTotal = 0;
  
  rooms.forEach(room => {
    console.log('pageFinal 숙박비 계산 - 객실 정보:', room);
    
    // total_price가 있으면 우선 사용 (page3에서 인원수 초과 요금까지 계산된 최종 가격)
    let roomTotal = 0;
    
    if (room.total_price && parseInt(room.total_price) > 0) {
      // total_price 사용 (이미 인원수 초과 요금이 포함된 최종 가격)
      roomTotal = parseInt(room.total_price);
      console.log('pageFinal 숙박비 계산 - total_price 사용:', roomTotal);
    } else {
      // total_price가 없으면 page3과 동일한 로직으로 계산
      const nights = room.nights ? parseInt(room.nights) : 1;
      const basePrice = room.price ? parseInt(room.price) : 0;
      const occupancy = room.occupancy ? parseInt(room.occupancy) : 1;
      const capacity = room.capacity ? parseInt(room.capacity) : 1;
      
      // 기본 가격 * 박수
      roomTotal = basePrice * nights;
      
      // 인원수 초과시 추가 요금 계산 (1인당 10,000원/박)
      if (occupancy > capacity) {
        const extraPeople = occupancy - capacity;
        const extraCharge = extraPeople * 10000 * nights;
        roomTotal += extraCharge;
        console.log(`pageFinal 숙박비 계산 - 인원수 초과 요금: ${extraPeople}명 × 10,000원 × ${nights}박 = ${extraCharge}원`);
      }
      
      console.log('pageFinal 숙박비 계산 - 계산된 가격:', {
        기본가격: basePrice,
        박수: nights,
        투숙인원: occupancy,
        객실정원: capacity,
        최종가격: roomTotal
      });
    }
    
    const nights = room.nights ? parseInt(room.nights) : 1;
    roomNightsTotal += nights;
    totalPrice += roomTotal;
    
    // 객실 타입별 그룹화
    const roomType = room.room_type || '기본';
    if (!roomTypeGroups[roomType]) {
      roomTypeGroups[roomType] = {
        rooms: [],
        total: 0,
        nights: 0
      };
    }
    
    roomTypeGroups[roomType].rooms.push({
      ...room,
      calculatedTotal: roomTotal // 계산된 금액을 저장
    });
    roomTypeGroups[roomType].total += roomTotal;
    roomTypeGroups[roomType].nights += nights;
  });
  
  console.log('pageFinal 숙박비 계산 - 전체 합계:', totalPrice);
  
  // 개별 객실별 세부 내역 구성 (타입별 그룹화 대신 각 객실 정보 표시)
  const roomDetailsList = rooms.map(room => {
    const roomName = room.room_name || room.room_type || '객실';
    const nights = room.nights ? parseInt(room.nights) : 1;
    const occupancy = room.occupancy ? parseInt(room.occupancy) : 1;
    const capacity = room.capacity ? parseInt(room.capacity) : 1;
    
    // 계산된 총액 가져오기 (이미 위에서 계산됨)
    let roomTotal = 0;
    if (room.total_price && parseInt(room.total_price) > 0) {
      roomTotal = parseInt(room.total_price);
    } else {
      const basePrice = room.price ? parseInt(room.price) : 0;
      roomTotal = basePrice * nights;
      if (occupancy > capacity) {
        const extraPeople = occupancy - capacity;
        const extraCharge = extraPeople * 10000 * nights;
        roomTotal += extraCharge;
      }
    }
    
    // 인원수 초과 여부에 따른 표시
    let occupancyInfo = `${occupancy}명`;
    if (occupancy > capacity) {
      const extraPeople = occupancy - capacity;
      occupancyInfo = `${occupancy}명(정원${capacity}명+${extraPeople}명)`;
    }
    
    return `${roomName}(${occupancyInfo}, ${nights}박, 합계: ${roomTotal.toLocaleString()}원)`;
  });
  
  const roomDetails = roomDetailsList.join(' | ');
  
  // 비용이 없는 경우
  if (totalPrice === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('객실 가격 정보가 없습니다.', 'warning');
    }
    return;
  }
  
  // 천원 단위로 변환 (1000으로 나눔)
  const amountInThousands = Math.round(totalPrice / 1000);
  
  console.log('pageFinal 숙박비 계산 - 최종 결과:', {
    총액원: totalPrice,
    천원단위: amountInThousands,
    세부내역: roomDetails
  });
  
  // 예정 비용에 추가
  const addPlannedExpense = handleAddParticipantExpense({
    category: '숙박비',
    amount: amountInThousands,
    details: roomDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: true
  });
  
  // 집행 비용에도 추가
  const addExecutedExpense = handleAddParticipantExpense({
    category: '숙박비',
    amount: amountInThousands,
    details: roomDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: false
  });
  
  // 숙박비 수입 추가
  const addIncomeItem = handleAddIncome({
    category: '숙박비',
    amount: amountInThousands,
    details: roomDetails,
    notes: `${amountInThousands}(단위:천원)`
  });
  
  // 병렬로 세 작업 실행
  Promise.all([addPlannedExpense, addExecutedExpense, addIncomeItem])
    .then(() => {
      // Only show alert if not in batch import
      if (!isBatchImport(showAlert)) {
        showAlert('숙박비 정보를 성공적으로 불러왔습니다.', 'success');
        // 강제로 데이터 다시 가져오기
        refetch();
      }
    })
    .catch(error => {
      // Always log errors but only show alert if not in batch import
      console.error('Error adding room expenses:', error);
      if (!isBatchImport(showAlert)) {
        showAlert(`숙박비 추가 중 오류 발생: ${error.message}`, 'error');
      }
    });
};

/**
 * Get the ingredient cost instead of regular price for meal expenses
 * @param {Object} meal - Meal data object
 * @returns {number} - Ingredient cost or 0 if not found
 */
export const getMealIngredientCost = (meal) => {
  const mealTypes = [
    { value: 'breakfast', label: '조식', price: 8800, ingredient: 6000 },
    { value: 'lunch', label: '중식(일반)', price: 12000, ingredient: 6000 },
    { value: 'lunch_box', label: '중식(도시락)', price: 15000, ingredient: 10000 },
    { value: 'dinner', label: '석식(일반)', price: 12000, ingredient: 6000 },
    { value: 'dinner_special_a', label: '석식(특식A)', price: 20000, ingredient: 10000 },
    { value: 'dinner_special_b', label: '석식(특식B)', price: 25000, ingredient: 13000 }
  ];
  
  // Find matching meal type
  const mealType = mealTypes.find(type => type.value === meal.meal_type);
  
  // Return ingredient cost if found, otherwise 0
  return mealType ? mealType.ingredient : 0;
};

/**
 * Handle loading meal data from page 3
 */
export const handleMealDataLoaded = (data, { showAlert, handleAddParticipantExpense, handleAddIncome, refetch, useMealIngredientCost = false }) => {
  if (!data || !data.getPage3ByPage1Id || !data.getPage3ByPage1Id.meal_plans || data.getPage3ByPage1Id.meal_plans.length === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('불러올 식사 데이터가 없습니다.', 'warning');
    }
    return;
  }
  
  const meals = data.getPage3ByPage1Id.meal_plans;
  
  // 식사 타입별 그룹화
  const mealTypeGroups = {};
  
  // 식사 정보 합산
  let totalPrice = 0;
  let totalParticipants = 0;
  
  meals.forEach(meal => {
    // Use ingredient cost instead of regular price if specified
    const price = useMealIngredientCost ? 
      getMealIngredientCost(meal) * (meal.participants || 0) : 
      (meal.price ? parseInt(meal.price) : 0);
    
    const participants = meal.participants ? parseInt(meal.participants) : 0;
    
    totalPrice += price;
    totalParticipants += participants;
    
    // 식사 타입별 그룹화 (예: 아침 일반, 점심 특별) - 한국어로 변환하고, 옵션 표시하지 않음
    // 식사 유형을 한국어로 변환
    const koreanMealType = translateMealType(meal.meal_type || '기타');
    const mealKey = koreanMealType;
    
    if (!mealTypeGroups[mealKey]) {
      mealTypeGroups[mealKey] = {
        meals: [],
        total: 0,
        participants: 0,
        count: 0
      };
    }
    
    mealTypeGroups[mealKey].meals.push(meal);
    mealTypeGroups[mealKey].total += price;
    mealTypeGroups[mealKey].participants += participants;
    mealTypeGroups[mealKey].count += 1;
  });
  
  // 식사 타입 변환 함수 추가
  function translateMealType(type) {
    const translations = {
      'breakfast': '조식',
      'lunch': '중식(일반)',
      'lunch_box': '중식(도시락)',
      'dinner': '석식(일반)',
      'dinner_special_a': '석식(특식A)',
      'dinner_special_b': '석식(특식B)'
    };
    
    return translations[type] || type;
  }
  
  // 식사 타입별 세부 내역 구성
  const mealDetailsList = Object.entries(mealTypeGroups).map(([mealType, data]) => {
    const typeTotal = data.total;
    return `${mealType}(합계: ${typeTotal.toLocaleString()}원)`;
  });
  
  const mealDetails = mealDetailsList.join(' | ');
  
  // 비용이 없는 경우
  if (totalPrice === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('식사 가격 정보가 없습니다.', 'warning');
    }
    return;
  }
  
  // 천원 단위로 변환 (1000으로 나눔)
  const amountInThousands = Math.round(totalPrice / 1000);
  
  // 자세한 설명 업데이트 (재료비 사용 여부 표시)
  const costsExplanation = useMealIngredientCost ? 
    '식사가격이 아닌 재료비로 계산됨' : 
    '식사 판매가로 계산됨';
  
  const updatedMealDetails = `${mealDetails} (${costsExplanation})`;
  
  // 예정 비용에 추가
  const addPlannedExpense = handleAddParticipantExpense({
    category: '식사비',
    amount: amountInThousands,
    details: updatedMealDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: true
  });
  
  // 집행 비용에도 추가
  const addExecutedExpense = handleAddParticipantExpense({
    category: '식사비',
    amount: amountInThousands,
    details: updatedMealDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: false
  });
  
  // 식사비 수입 추가
  const addIncomeItem = handleAddIncome({
    category: '식사비',
    amount: amountInThousands,
    details: updatedMealDetails,
    notes: `${amountInThousands}(단위:천원)`
  });
  
  // 병렬로 세 작업 실행
  Promise.all([addPlannedExpense, addExecutedExpense, addIncomeItem])
    .then(() => {
      // Only show alert if not in batch import
      if (!isBatchImport(showAlert)) {
        showAlert('식사 정보를 성공적으로 불러왔습니다.', 'success');
        // 강제로 데이터 다시 가져오기
        refetch();
      }
    })
    .catch(error => {
      // Always log errors but only show alert if not in batch import
      console.error('Error adding meal data:', error);
      if (!isBatchImport(showAlert)) {
        showAlert(`식사 정보 추가 중 오류 발생: ${error.message}`, 'error');
      }
    });
};

/**
 * Handle loading material data from page 4
 */
export const handleMaterialDataLoaded = (data, { showAlert, handleAddParticipantExpense, handleAddIncome, refetch }) => {
  if (!data || !data.getPage4ByPage1Id || !data.getPage4ByPage1Id.materials || data.getPage4ByPage1Id.materials.length === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('불러올 재료비 데이터가 없습니다.', 'warning');
    }
    return;
  }
  
  const materials = data.getPage4ByPage1Id.materials;
  
  // 재료 유형별 그룹화
  const materialTypeGroups = {};
  
  // 재료비 정보 합산
  let totalPrice = 0;
  
  materials.forEach(material => {
    const total = material.total ? parseInt(material.total) : 0;
    totalPrice += total;
    
    // 재료 유형별 그룹화
    const materialType = material.material_type || '기타';
    if (!materialTypeGroups[materialType]) {
      materialTypeGroups[materialType] = {
        materials: [],
        total: 0,
        count: 0
      };
    }
    
    materialTypeGroups[materialType].materials.push(material);
    materialTypeGroups[materialType].total += total;
    materialTypeGroups[materialType].count += 1;
  });
  
  // 재료 유형별 세부 내역 구성
  const materialDetailsList = Object.entries(materialTypeGroups).map(([materialType, data]) => {
    const typeTotal = data.total;
    return `${materialType}(합계: ${typeTotal.toLocaleString()}원)`;
  });
  
  const materialDetails = materialDetailsList.join(' | ');
  
  // 비용이 없는 경우
  if (totalPrice === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('재료비 가격 정보가 없습니다.', 'warning');
    }
    return;
  }
  
  // 천원 단위로 변환 (1000으로 나눔)
  const amountInThousands = Math.round(totalPrice / 1000);
  
  // 예정 비용에 추가
  const addPlannedExpense = handleAddParticipantExpense({
    category: '재료비',
    amount: amountInThousands,
    details: materialDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: true
  });
  
  // 집행 비용에도 추가
  const addExecutedExpense = handleAddParticipantExpense({
    category: '재료비',
    amount: amountInThousands,
    details: materialDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: false
  });
  
  // 수입 항목에도 재료비 추가
  const addIncomeItem = handleAddIncome({
    category: '재료비',
    amount: amountInThousands,
    details: materialDetails,
    notes: `${amountInThousands}(단위:천원)`
  });
  
  // 병렬로 세 작업 실행
  Promise.all([addPlannedExpense, addExecutedExpense, addIncomeItem])
    .then(() => {
      // Only show alert if not in batch import
      if (!isBatchImport(showAlert)) {
        showAlert('재료비 정보를 성공적으로 불러왔습니다.', 'success');
        refetch();
      }
    })
    .catch(error => {
      // Always log errors but only show alert if not in batch import
      console.error('Error adding material data:', error);
      if (!isBatchImport(showAlert)) {
        showAlert(`재료비 추가 중 오류 발생: ${error.message}`, 'error');
      }
    });
};

/**
 * Handle loading expense data from page 4 as participant expenses
 */
export const handleExpenseDataLoadedAsParticipant = (data, { showAlert, handleAddParticipantExpense, refetch }) => {
  if (!data || !data.getPage4ByPage1Id || !data.getPage4ByPage1Id.expenses || data.getPage4ByPage1Id.expenses.length === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('불러올 기타비 데이터가 없습니다.', 'warning');
    }
    return;
  }
  
  const expenses = data.getPage4ByPage1Id.expenses;
  
  // 기타비 유형별 그룹화
  const expenseTypeGroups = {};
  
  // 기타비 정보 합산
  let totalPrice = 0;
  
  expenses.forEach(expense => {
    const amount = expense.amount ? parseInt(expense.amount) : 0;
    totalPrice += amount;
    
    // 기타비 유형별 그룹화
    const expenseType = expense.expense_type || '기타';
    if (!expenseTypeGroups[expenseType]) {
      expenseTypeGroups[expenseType] = {
        expenses: [],
        total: 0,
        count: 0
      };
    }
    
    expenseTypeGroups[expenseType].expenses.push(expense);
    expenseTypeGroups[expenseType].total += amount;
    expenseTypeGroups[expenseType].count += 1;
  });
  
  // 기타비 유형별 세부 내역 구성
  const expenseDetailsList = Object.entries(expenseTypeGroups).map(([expenseType, data]) => {
    const typeTotal = data.total;
    return `${expenseType}(합계: ${typeTotal.toLocaleString()}원)`;
  });
  
  const expenseDetails = expenseDetailsList.join(' | ');
  
  // 비용이 없는 경우
  if (totalPrice === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('기타비 가격 정보가 없습니다.', 'warning');
    }
    return;
  }
  
  // 천원 단위로 변환 (1000으로 나눔)
  const amountInThousands = Math.round(totalPrice / 1000);
  
  // 예정 비용에 추가
  const addPlannedExpense = handleAddParticipantExpense({
    category: '기타비',
    amount: amountInThousands,
    details: expenseDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: true
  });
  
  // 집행 비용에도 추가
  const addExecutedExpense = handleAddParticipantExpense({
    category: '기타비',
    amount: amountInThousands,
    details: expenseDetails,
    notes: `${amountInThousands}(단위:천원)`,
    is_planned: false
  });
  
  // 병렬로 두 작업 실행
  Promise.all([addPlannedExpense, addExecutedExpense])
    .then(() => {
      // Only show alert if not in batch import
      if (!isBatchImport(showAlert)) {
        showAlert('기타비 정보를 성공적으로 불러왔습니다.', 'success');
        refetch();
      }
    })
    .catch(error => {
      // Always log errors but only show alert if not in batch import
      console.error('Error adding expense data as participant expense:', error);
      if (!isBatchImport(showAlert)) {
        showAlert(`기타비 추가 중 오류 발생: ${error.message}`, 'error');
      }
    });
};

/**
 * Handle loading expense data from page 4
 */
export const handleExpenseDataLoaded = (data, { showAlert, handleAddIncome, refetch }) => {
  if (!data || !data.getPage4ByPage1Id || !data.getPage4ByPage1Id.expenses || data.getPage4ByPage1Id.expenses.length === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('불러올 기타비 데이터가 없습니다.', 'warning');
    }
    return;
  }
  
  const expenses = data.getPage4ByPage1Id.expenses;
  
  // 기타비 유형별 그룹화
  const expenseTypeGroups = {};
  
  // 기타비 정보 합산
  let totalPrice = 0;
  
  expenses.forEach(expense => {
    const amount = expense.amount ? parseInt(expense.amount) : 0;
    totalPrice += amount;
    
    // 기타비 유형별 그룹화
    const expenseType = expense.expense_type || '기타';
    if (!expenseTypeGroups[expenseType]) {
      expenseTypeGroups[expenseType] = {
        expenses: [],
        total: 0,
        count: 0
      };
    }
    
    expenseTypeGroups[expenseType].expenses.push(expense);
    expenseTypeGroups[expenseType].total += amount;
    expenseTypeGroups[expenseType].count += 1;
  });
  
  // 기타비 유형별 세부 내역 구성
  const expenseDetailsList = Object.entries(expenseTypeGroups).map(([expenseType, data]) => {
    const typeTotal = data.total;
    return `${expenseType}(합계: ${typeTotal.toLocaleString()}원)`;
  });
  
  const expenseDetails = expenseDetailsList.join(' | ');
  
  // 비용이 없는 경우
  if (totalPrice === 0) {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('기타비 가격 정보가 없습니다.', 'warning');
    }
    return;
  }
  
  // 천원 단위로 변환 (1000으로 나눔)
  const amountInThousands = Math.round(totalPrice / 1000);
  
  // 수입 항목에 기타비 추가
  handleAddIncome({
    category: '기타비',
    amount: amountInThousands,
    details: expenseDetails,
    notes: `${amountInThousands}(단위:천원)`
  }).then(() => {
    // Only show alert if not in batch import
    if (!isBatchImport(showAlert)) {
      showAlert('기타비 정보를 성공적으로 불러왔습니다.', 'success');
      // 강제로 데이터 다시 가져오기
      refetch();
    }
  }).catch(error => {
    // Always log errors but only show alert if not in batch import
    console.error('Error adding expense data:', error);
    if (!isBatchImport(showAlert)) {
      showAlert(`기타비 추가 중 오류 발생: ${error.message}`, 'error');
    }
  });
};

/**
 * Handle loading program data from page 2
 */
export const handleProgramDataLoaded = (data, { showAlert, handleAddIncome, refetch }) => {
  console.log('[handleProgramDataLoaded] 시작 - 프로그램 데이터 가져오기');
  
  // 입력 데이터 검증
  if (!data || !data.getPage2ByPage1Id) {
    console.error('[handleProgramDataLoaded] 데이터가 없음:', data);
    if (!isBatchImport(showAlert)) {
      showAlert('프로그램 데이터를 가져올 수 없습니다.', 'error');
    }
    return;
  }

  const page2Data = data.getPage2ByPage1Id;
  const page1Data = page2Data.page1;  // page1 데이터는 page2Data 내부에 있음
  const programs = page2Data.programs || [];

  console.log('[handleProgramDataLoaded] 전체 데이터 구조:', {
    hasPage2Data: !!page2Data,
    hasPage1Data: !!page1Data,
    programsCount: programs.length,
    rawData: data
  });

  console.log('[handleProgramDataLoaded] Page1 데이터:', {
    hasPage1: !!page1Data,
    businessSubcategory: page1Data?.business_subcategory,
    groupName: page1Data?.group_name
  });
  
  // 단체 여부 확인 (page1의 business_subcategory가 "group"인지 확인)
  const isGroup = page1Data?.business_subcategory === 'group';
  console.log('[handleProgramDataLoaded] 단체 여부:', {
    isGroup,
    businessSubcategory: page1Data?.business_subcategory,
    계산방식: isGroup ? '프로그램 당 가격만' : '가격 × 인원수'
  });
  
  // 프로그램 정보 합산 (그룹화 없이 개별 처리)
  let totalPrice = 0;
  const programDetailsList = [];
  
  // 각 프로그램별 정보 처리 (그룹화 없음)
  programs.forEach(program => {
    const price = program.price ? parseInt(program.price) : 0;
    const participants = program.participants ? parseInt(program.participants) : 0;
    
    // 단체 여부에 따른 계산 방식 변경
    let programTotal;
    let detailText;
    
    if (isGroup) {
      // 단체일 경우: 프로그램 당 가격만
      programTotal = price;
      detailText = `${program.program_name || '프로그램'}(합계: ${programTotal.toLocaleString()}원, (단체 일괄 계산))`;
    } else {
      // 단체가 아닐 경우: 가격 × 인원수
      programTotal = price * participants;
      detailText = `${program.program_name || '프로그램'}(합계: ${programTotal.toLocaleString()}원, 총원: ${participants}명)`;
    }
    
    console.log('[handleProgramDataLoaded] 프로그램 계산:', {
      programName: program.program_name,
      programCategory: program.category || '기타',
      price,
      participants,
      programTotal,
      isGroup,
      detailText
    });
    
    totalPrice += programTotal;
    programDetailsList.push(detailText);
  });
  
  console.log('[handleProgramDataLoaded] 전체 계산 결과:', {
    programCount: programs.length,
    programDetailsList,
    totalPrice,
    isGroup
  });
  
  // 세부 내역 문자열 생성 (그룹화 없이 개별 프로그램들의 세부 내역을 | 로 연결)
  const programDetails = programDetailsList.join(' | ');
  console.log('[handleProgramDataLoaded] 프로그램 세부 내역:', programDetails);
  
  console.log("여기입니다~~ 프로그램 전처리 결과:", {
    isGroup,
    programDetailsList,
    programDetails,
    totalPrice,
    programs: programs.map(p => ({
      name: p.program_name,
      category: p.category,
      price: p.price,
      participants: p.participants,
      total: isGroup ? (p.price || 0) : (p.price || 0) * (p.participants || 0)
    }))
  });
  
  // 비용이 없는 경우
  if (totalPrice === 0) {
    // Only show alert if not in batch import
    console.log('[handleProgramDataLoaded] 프로그램 가격 정보가 없음');
    if (!isBatchImport(showAlert)) {
      showAlert('프로그램 가격 정보가 없습니다.', 'warning');
    }
    return;
  }
  
  // 천원 단위로 변환 (1000으로 나눔)
  const amountInThousands = Math.round(totalPrice / 1000);
  console.log('[handleProgramDataLoaded] 총액 계산 결과:', {
    totalPriceWon: totalPrice,
    amountInThousands
  });
  
  console.log("여기입니다~~ 최종 수입 항목 데이터:", {
    category: '프로그램',
    amount: amountInThousands,
    details: programDetails,
    notes: `${amountInThousands}(단위:천원)`
  });
  
  // 수입 항목에 프로그램 추가
  handleAddIncome({
    category: '프로그램',
    amount: amountInThousands,
    details: programDetails,
    notes: `${amountInThousands}(단위:천원)`
  }).then(() => {
    // Only show alert if not in batch import
    console.log('[handleProgramDataLoaded] 프로그램 정보 성공적으로 추가됨');
    if (!isBatchImport(showAlert)) {
      showAlert('프로그램 정보를 성공적으로 불러왔습니다.', 'success');
      // 강제로 데이터 다시 가져오기
      refetch();
    }
  }).catch(error => {
    // Always log errors but only show alert if not in batch import
    console.error('[handleProgramDataLoaded] 프로그램 데이터 추가 오류:', error);
    if (!isBatchImport(showAlert)) {
      showAlert(`프로그램 정보 추가 중 오류 발생: ${error.message}`, 'error');
    }
  });
};

/**
 * Integrated import handlers for batch loading data
 */

/**
 * Teacher Expense Import Component
 * 강사비 한번에 가져오는 함수 - 개별로 가져올 때 사용
 */
export const handleImportAllTeacherExpenses = async (
  { page1Id, showAlert, handleAddTeacherExpense, refetch, loadInstructorData, instructors = [], existingExpenses = [] }
) => {
  console.log('[handleImportAllTeacherExpenses] 시작 =================');
  console.log('[handleImportAllTeacherExpenses] 입력 매개변수:', {
    page1Id,
    hasShowAlert: !!showAlert,
    hasHandleAddTeacherExpense: !!handleAddTeacherExpense,
    hasRefetch: !!refetch,
    hasLoadInstructorData: !!loadInstructorData,
    instructorsCount: instructors?.length,
    existingExpensesCount: existingExpenses?.length
  });
  
  // 로딩 상태 표시
  showAlert('강사 비용 데이터를 불러오는 중...', 'info');
  
  // Create a silent logger for batch operations
  const silentLogger = function silentLogger(msg, sev) {
    console.log(`[Teacher Expense] ${sev}: ${msg}`);
  };
  
  try {
    // 강사 데이터 로드
    console.log('[handleImportAllTeacherExpenses] loadInstructorData 호출...');
    const result = await loadInstructorData({ 
      variables: { page1Id }
    });
    console.log('[handleImportAllTeacherExpenses] loadInstructorData 결과:', {
      hasResult: !!result,
      hasData: !!result?.data,
      hasPage2Data: !!result?.data?.getPage2ByPage1Id,
      programsCount: result?.data?.getPage2ByPage1Id?.programs?.length || 0
    });
    
    if (result?.data) {
      // 배치 모드로 설정 - 예정 항목만 추가
      // 여기가 오류 발생 지점 - name 속성 대신 다른 방식으로 처리
      // silentLogger.name = 'silentLogger'; 
      
      // 기존에 저장된 모든 강사 항목의 세부 정보를 체크하기 위한 함수 정의
      // 실제 프로젝트에서는 이 부분을 props에서 받아온 현재 항목 목록을 사용해서 체크하는 것이 더 좋음
      const existingInstructors = result.data.getPage2ByPage1Id?.programs
        .filter(p => p.instructor_name)
        .map(p => p.instructor_name);
      
      const uniqueInstructors = [...new Set(existingInstructors)];
      console.log('[handleImportAllTeacherExpenses] 데이터 불러오기 전 중복 체크 - 강사 목록:', uniqueInstructors);
      console.log('[handleImportAllTeacherExpenses] 데이터 불러오기 전 중복 체크 - 기존 강사비 항목 수:', existingExpenses.length);
      
      console.log('[handleImportAllTeacherExpenses] handleInstructorDataLoaded 호출...');
      await handleInstructorDataLoaded(result.data, { 
        showAlert: silentLogger, 
        handleAddTeacherExpense: async (expenseData) => {
          console.log('[handleImportAllTeacherExpenses] 강사비 항목 추가 요청:', {
            category: expenseData.category,
            amount: expenseData.amount,
            is_planned: expenseData.is_planned
          });
          return handleAddTeacherExpense(expenseData);
        }, 
        refetch: () => Promise.resolve(), // Prevent individual refetches
        instructors, // Pass instructors to the handler
        existingExpenses // 기존 항목 전달
      });
      
      // 데이터 로드 완료 후 UI 새로고침
      console.log('[handleImportAllTeacherExpenses] 처리 완료, 알림 표시 및 데이터 새로고침');
      showAlert('강사 비용 정보를 성공적으로 불러왔습니다.', 'success');
      await refetch();
    }
  } catch (error) {
    console.error('[handleImportAllTeacherExpenses] 오류 발생:', error);
    showAlert(`강사 비용 데이터 불러오기 중 오류 발생: ${error.message}`, 'error');
  }
  console.log('[handleImportAllTeacherExpenses] 종료 =================');
};

/**
 * Handle importing all participant expenses
 */
export const handleImportAllParticipantExpenses = async (
  { page1Id, showAlert, handleAddParticipantExpense, refetch, loadRoomData, loadMealData, loadMaterialData, loadExpenseData, useMealIngredientCost = false }
) => {
  if (!page1Id) {
    showAlert('유효한 페이지 ID가 없습니다.', 'error');
    return;
  }
  
  console.log('Participant expense import starting for page1Id:', page1Id);
  
  // 여러 작업을 병렬로 처리하기 위한 Promise 배열
  const tasks = [];
  
  // 무음 로깅 처리
  const silentLogger = function silentLogger(msg, sev) {
    console.log(`[Participant Import] ${sev}: ${msg}`);
    return Promise.resolve();
  };
  
  // 1. 객실 정보 쿼리
  if (loadRoomData) {
    const roomTask = async () => {
      try {
        console.log('Loading room data...');
        
        const { data } = await loadRoomData({
          variables: { page1Id: parseInt(page1Id) }
        });
        
        // 객실 정보 처리
        if (data && data.getPage3ByPage1Id) {
          handleRoomDataLoaded(data, { 
            showAlert: silentLogger, 
            handleAddParticipantExpense, 
            handleAddIncome: () => Promise.resolve(), 
            refetch 
          });
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      }
    };
    
    tasks.push(roomTask());
  }
  
  // 2. 식사 정보 쿼리
  if (loadMealData) {
    const mealTask = async () => {
      try {
        console.log('Loading meal data with ingredient cost option:', useMealIngredientCost);
        
        const { data } = await loadMealData({
          variables: { page1Id: parseInt(page1Id) }
        });
        
        // 식사 정보 처리
        if (data && data.getPage3ByPage1Id) {
          handleMealDataLoaded(data, { 
            showAlert: silentLogger, 
            handleAddParticipantExpense, 
            handleAddIncome: () => Promise.resolve(), // 식사 수입은 따로 처리 
            refetch,
            useMealIngredientCost
          });
        }
      } catch (error) {
        console.error('Error loading meal data:', error);
      }
    };
    
    tasks.push(mealTask());
  }
  
  // 3. 재료비 로드
  if (loadMaterialData) {
    const materialTask = async () => {
      try {
        console.log('Loading material data...');
        
        const { data } = await loadMaterialData({ variables: { page1Id: parseInt(page1Id) } });
        
        // 재료비 정보 처리
        if (data && data.getPage4ByPage1Id) {
          handleMaterialDataLoaded(data, { 
            showAlert: silentLogger, 
            handleAddParticipantExpense, 
            handleAddIncome: () => Promise.resolve(), 
            refetch 
          });
        }
      } catch (error) {
        console.error('Error loading material data:', error);
      }
    };
    
    tasks.push(materialTask());
  }

  // 4. 기타비 로드 (참가자 지출로)
  if (loadExpenseData) {
    const expenseTask = async () => {
      try {
        console.log('Loading expense data for participant expenses...');
        
        const { data } = await loadExpenseData({ variables: { page1Id: parseInt(page1Id) } });
        
        // 기타비 정보를 참가자 지출로 처리
        if (data && data.getPage4ByPage1Id) {
          handleExpenseDataLoadedAsParticipant(data, { 
            showAlert: silentLogger, 
            handleAddParticipantExpense, 
            refetch 
          });
        }
      } catch (error) {
        console.error('Error loading expense data for participant expenses:', error);
      }
    };
    
    tasks.push(expenseTask());
  }
  
  // 모든 작업이 완료된 후 결과 처리
  Promise.all(tasks)
    .then(() => {
      console.log('All participant expense tasks completed.');
      showAlert('참가자 비용 정보를 성공적으로 불러왔습니다.', 'success');
      return refetch();
    })
    .catch(error => {
      console.error('Error loading participant expenses:', error);
      showAlert(`참가자 비용 데이터 로드 중 오류 발생: ${error.message}`, 'error');
    });
};

export const handleImportAllIncome = async (
  { page1Id, showAlert, handleAddIncome, refetch, loadInstructorData, loadMealData, loadMaterialData, loadExpenseData }
) => {
  console.log('[handleImportAllIncome] 시작 =================');
  console.log('[handleImportAllIncome] 입력 매개변수:', {
    page1Id,
    hasShowAlert: !!showAlert,
    hasHandleAddIncome: !!handleAddIncome,
    hasRefetch: !!refetch,
    hasLoadInstructorData: !!loadInstructorData,
    hasLoadMealData: !!loadMealData,
    hasLoadMaterialData: !!loadMaterialData,
    hasLoadExpenseData: !!loadExpenseData
  });
  
  // 로딩 상태 표시
  showAlert('수입 데이터를 불러오는 중...', 'info');
  
  // Create a silent logger for batch operations
  const silentLogger = function silentLogger(msg, sev) {
    console.log(`[Income] ${sev}: ${msg}`);
  };
  
  try {
    // 1. 프로그램 수입 로드
    console.log('[handleImportAllIncome] 1. 프로그램 수입 데이터 로드 시작...');
    console.log('[handleImportAllIncome] loadInstructorData 함수 호출 전:', { 
      page1Id,
      loadInstructorDataFn: loadInstructorData.toString().substring(0, 100) + '...'
    });
    
    const programResult = await loadInstructorData({ variables: { page1Id } });
    console.log('[handleImportAllIncome] 프로그램 수입 데이터 로드 결과:', {
      hasProgramResult: !!programResult,
      hasData: !!programResult?.data,
      hasPage2Data: !!programResult?.data?.getPage2ByPage1Id,
      programsCount: programResult?.data?.getPage2ByPage1Id?.programs?.length || 0
    });
    
    if (programResult?.data?.getPage2ByPage1Id?.programs) {
      console.log('[handleImportAllIncome] 프로그램 데이터 샘플:', 
        programResult.data.getPage2ByPage1Id.programs.slice(0, 2).map(p => ({
          name: p.name,
          category: p.category,
          price: p.price,
          participants: p.participants
        }))
      );
    }
    
    if (programResult?.data) {
      // 여기서도 강사비 항목을 다시 추가하려고 시도하기 때문에, skipInstructorData 플래그를 추가해 건너뜀
      // 컴포넌트 분리를 위해 기존 handleInstructorDataLoaded를 재사용하지만 이 경우에는 강사비는 추가하지 않음
      console.log('[handleImportAllIncome] handleInstructorDataLoaded 호출, skipInstructorData=true');
      await handleInstructorDataLoaded(programResult.data, { 
        showAlert: silentLogger, 
        handleAddTeacherExpense: () => Promise.resolve(), // Dummy function
        refetch: () => Promise.resolve(),
        instructors: [],
        existingExpenses: [],
        skipInstructorData: true // Skip instructor expense handling
      });
      
      console.log('[handleImportAllIncome] handleProgramDataLoaded 함수 호출 준비');
      const handlers = { 
        showAlert: silentLogger, 
        handleAddIncome: (data) => {
          console.log('[handleImportAllIncome] 프로그램 수입 항목 추가 요청:', {
            category: data.category,
            amount: data.amount
          });
          return handleAddIncome(data);
        }, 
        refetch: () => Promise.resolve() // Prevent individual refetches
      };
      console.log('[handleImportAllIncome] handleProgramDataLoaded 함수 호출');
      await handleProgramDataLoaded(programResult.data, handlers);
      console.log('[handleImportAllIncome] handleProgramDataLoaded 함수 완료');
    }
    
    // 2. 식사비 수입 로드
    console.log('[handleImportAllIncome] 2. 식사비 수입 데이터 로드 시작...');
    const mealResult = await loadMealData({ variables: { page1Id } });
    console.log('[handleImportAllIncome] 식사비 수입 데이터 로드 결과:', {
      hasMealResult: !!mealResult,
      hasData: !!mealResult?.data,
      hasPage3Data: !!mealResult?.data?.getPage3ByPage1Id,
      mealsCount: mealResult?.data?.getPage3ByPage1Id?.meal_plans?.length || 0
    });
    
    if (mealResult?.data) {
      const handlers = { 
        showAlert: silentLogger, 
        handleAddParticipantExpense: () => Promise.resolve(), 
        handleAddIncome: (data) => {
          console.log('[handleImportAllIncome] 식사비 수입 항목 추가 요청:', {
            category: data.category,
            amount: data.amount
          });
          return handleAddIncome(data);
        }, 
        refetch: () => Promise.resolve() // Prevent individual refetches
      };
      await handleMealDataLoaded(mealResult.data, handlers);
    }
    
    // 3. 재료비 수입 로드
    console.log('[handleImportAllIncome] 3. 재료비 수입 데이터 로드 시작...');
    const materialResult = await loadMaterialData({ variables: { page1Id } });
    console.log('[handleImportAllIncome] 재료비 수입 데이터 로드 결과:', {
      hasMaterialResult: !!materialResult,
      hasData: !!materialResult?.data,
      hasPage4Data: !!materialResult?.data?.getPage4ByPage1Id,
      materialsCount: materialResult?.data?.getPage4ByPage1Id?.materials?.length || 0
    });
    
    if (materialResult?.data) {
      const handlers = { 
        showAlert: silentLogger, 
        handleAddParticipantExpense: () => Promise.resolve(), 
        handleAddIncome: (data) => {
          console.log('[handleImportAllIncome] 재료비 수입 항목 추가 요청:', {
            category: data.category,
            amount: data.amount
          });
          return handleAddIncome(data);
        }, 
        refetch: () => Promise.resolve() // Prevent individual refetches
      };
      await handleMaterialDataLoaded(materialResult.data, handlers);
    }
    
    // 4. 기타비 수입 로드
    console.log('[handleImportAllIncome] 4. 기타비 수입 데이터 로드 시작...');
    const expenseResult = await loadExpenseData({ variables: { page1Id } });
    console.log('[handleImportAllIncome] 기타비 수입 데이터 로드 결과:', {
      hasExpenseResult: !!expenseResult,
      hasData: !!expenseResult?.data,
      hasPage4Data: !!expenseResult?.data?.getPage4ByPage1Id,
      expensesCount: expenseResult?.data?.getPage4ByPage1Id?.expenses?.length || 0
    });
    
    if (expenseResult?.data) {
      const handlers = { 
        showAlert: silentLogger, 
        handleAddIncome: (data) => {
          console.log('[handleImportAllIncome] 기타비 수입 항목 추가 요청:', {
            category: data.category,
            amount: data.amount
          });
          return handleAddIncome(data);
        }, 
        refetch: () => Promise.resolve() // Prevent individual refetches
      };
      await handleExpenseDataLoaded(expenseResult.data, handlers);
    }
    
    // 성공 메시지와 UI 업데이트
    console.log('[handleImportAllIncome] 처리 완료, 알림 표시 및 데이터 새로고침');
    showAlert('수입 정보를 성공적으로 불러왔습니다.', 'success');
    await refetch();
  } catch (error) {
    console.error('[handleImportAllIncome] 오류 발생:', error);
    showAlert(`수입 데이터 처리 중 오류 발생: ${error.message}`, 'error');
  }
  console.log('[handleImportAllIncome] 종료 =================');
}; 