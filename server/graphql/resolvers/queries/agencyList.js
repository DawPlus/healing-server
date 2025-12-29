const prisma = require('../../../prisma/prismaClient');

// Helper function to calculate average from an array of scores
const calculateAverage = (scores) => {
  const validScores = scores.filter(score => score !== null && score !== undefined && score !== '');
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((acc, score) => acc + parseFloat(score), 0);
  return (sum / validScores.length).toFixed(2);
};

// Helper function to convert empty string or non-numeric values to null
const sanitizeFloat = (value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Helper function to apply keyword filters to results
const applyKeywordFilters = (results, keywords) => {
  // 유효한 키워드가 없으면 모든 결과 반환
  if (!keywords || keywords.length === 0 || keywords.every(k => k.type === 'X' || !k.text)) {
    console.log("No valid keywords provided, returning all results:", results.length);
    return results;
  }

  const validKeywords = keywords.filter(k => k.type !== 'X' && k.text);
  console.log(`Applying ${validKeywords.length} keyword filters:`, JSON.stringify(validKeywords, null, 2));
  
  if (results.length > 0) {
    console.log("Sample result item fields:", Object.keys(results[0]));
    console.log("Sample result item:", JSON.stringify(results[0], null, 2));
  } else {
    console.log("No results to filter");
    return [];
  }

  // 결과 필터링 (모든 키워드에 일치하는 항목만 반환)
  const filteredResults = results.filter(item => {
    return validKeywords.every(keyword => {
      const fieldName = keyword.type;
      const searchValue = keyword.text;
      
      // 키워드 타입에 대응하는 필드가 없으면 필터링 건너뛰기 -> 필터링 실패로 처리
      if (!(fieldName in item)) {
        console.log(`Field ${fieldName} not found in item, filter fails for this keyword.`);
        return false; // If field doesn't exist, it cannot match the keyword.
      }
      
      const itemValue = item[fieldName];
      console.log(`Comparing field ${fieldName}: '${itemValue}' with keyword '${searchValue}'`);
      
      // null/undefined/empty 값 처리
      if (itemValue === null || itemValue === undefined || itemValue === '') {
        // 미기재를 찾는 경우 일치, 그 외에는 불일치
        const match = searchValue.toLowerCase() === '미기재' || searchValue === '';
        console.log(`Empty value check for ${fieldName}: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      }
      
      // 날짜 필드 처리 (OPENDAY, ENDDAY)
      if (fieldName === 'OPENDAY' || fieldName === 'ENDDAY') {
        // 날짜 형식 정규화 및 비교
        const formattedItemDate = String(itemValue).trim();
        const formattedKeywordDate = String(searchValue).trim();
        const match = formattedItemDate.includes(formattedKeywordDate);
        console.log(`Date comparison for ${fieldName}: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      }
      
      // 숫자 필드 처리 (AGE)
      if (fieldName === 'AGE') {
        // 숫자로 변환하여 정확히 일치하는지 확인
        const itemAge = parseInt(itemValue);
        const keywordAge = parseInt(searchValue);
        if (isNaN(itemAge) || isNaN(keywordAge)) {
          console.log(`Invalid numeric values for AGE: item=${itemValue}, keyword=${searchValue}`);
          return false;
        }
        const match = itemAge === keywordAge;
        console.log(`Age comparison: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      }
      
      // 특정 열거형 필드 처리 (SEX, RESIDENCE, JOB, TYPE, PV)
      if (['SEX', 'RESIDENCE', 'JOB', 'TYPE', 'PV'].includes(fieldName)) {
        // 대소문자 무시하고 정확히 일치하는지 확인
        const match = String(itemValue).trim().toLowerCase() === String(searchValue).trim().toLowerCase();
        console.log(`Exact match check for ${fieldName}: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      }
      
      // 일반 텍스트 필드 처리 (PROGRAM_NAME, TEACHER, PLACE 등)
      if (typeof itemValue === 'string') {
        // 대소문자 무시하고 부분 일치 확인
        const match = itemValue.toLowerCase().includes(searchValue.toLowerCase());
        console.log(`Text contains check for ${fieldName}: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      }
      
      // 숫자 필드 처리 (점수 등)
      if (typeof itemValue === 'number') {
        // 숫자로 변환하여 근사 비교
        const keywordNum = parseFloat(searchValue);
        if (isNaN(keywordNum)) {
          console.log(`Invalid numeric value for keyword: ${searchValue}`);
          return false;
        }
        const match = Math.abs(itemValue - keywordNum) < 0.01; // 부동소수점 오차 허용
        console.log(`Numeric comparison for ${fieldName}: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      }
      
      console.log(`No matching condition for field ${fieldName}, returning false`);
      return false;
    });
  });

  console.log(`Filtered results: ${filteredResults.length} of ${results.length}`);
  return filteredResults;
};

// Get agencies by type
const getAgenciesByType = async (_, { type }) => {
  try {
    // Get unique agencies from all forms
    const programForms = await prisma.programForm.findMany({
      select: {
        agency: true,
        agency_id: true
      },
      distinct: ['agency']
    });
    
    const serviceForms = await prisma.serviceForm.findMany({
      select: {
        agency: true,
        agency_id: true
      },
      distinct: ['agency']
    });
    
    const preventForms = await prisma.preventForm.findMany({
      select: {
        agency: true,
        agency_id: true
      },
      distinct: ['agency']
    });
    
    const healingForms = await prisma.healingForm.findMany({
      select: {
        agency: true,
        agency_id: true
      },
      distinct: ['agency']
    });
    
    // Combine all agencies
    const allAgencies = [
      ...programForms,
      ...serviceForms,
      ...preventForms,
      ...healingForms
    ];
    
    // Remove duplicates and format for output
    const uniqueAgencies = Array.from(
      new Map(allAgencies.map(item => [item.agency, item])).values()
    );
    
    return uniqueAgencies.map(({ agency, agency_id }) => ({
      label: agency,
      value: agency,
      agency_id
    }));
  } catch (error) {
    console.error('Error getting agencies by type:', error);
    throw new Error('Failed to get agencies by type');
  }
};

// Get program result data (type=1)
const getProgramResult = async (_, { type, agency, agency_id, openday, endday, inType, keywords }) => {
  try {
    // Build where clause for Prisma
    const where = {};
    
    // Only add agency filter if provided
    if (agency) {
      where.agency = agency;
    }
    
    // Only add agency_id filter if provided
    if (agency_id) {
      where.agency_id = agency_id;
    }
    
    if (openday) {
      where.openday = {
        gte: openday
      };
    }
    
    if (endday) {
      where.eval_date = {
        lte: endday
      };
    }
    
    if (inType) {
      where.type = inType;
    }
    

       // Get program form data (no more entries relation)
       const programFormstt = await prisma.programForm.findMany({
        where,
        orderBy: {
          eval_date: 'desc'
        }
      });
      console.log("programFormstt", programFormstt);
    // Get program form data (no more entries relation)
    const programForms = await prisma.programForm.findMany({
      where,
      orderBy: {
        eval_date: 'desc'
      }
    });
    
    // Map to the required output format
    const results = [];
    for (const form of programForms) {
      // Get program, category and instructor data if available
      let programName = null;
      let categoryName = null;
      let instructorName = null;
      
      if (form.program_id) {
        const program = await prisma.programItem.findUnique({
          where: { id: form.program_id },
          include: { category: true }
        });
        if (program) {
          programName = program.program_name;
          if (program.category) {
            categoryName = program.category.category_name;
          }
        }
      }
      
      if (form.teacher_id) {
        const instructor = await prisma.instructor.findUnique({
          where: { id: form.teacher_id }
        });
        if (instructor) {
          instructorName = instructor.name;
        }
      }
      
      // Add form data directly to results (no more entry iteration)
      results.push({
        ID: form.id,
        SEX: form.sex || '',
        AGE: form.age || '',
        TYPE: form.type || '',
        AGENCY: form.agency,
        OPENDAY: form.openday,
        ENDDAY: form.eval_date,
        SCORE1: sanitizeFloat(form.score1),
        SCORE2: sanitizeFloat(form.score2),
        SCORE3: sanitizeFloat(form.score3),
        SCORE4: sanitizeFloat(form.score4),
        SCORE5: sanitizeFloat(form.score5),
        SCORE6: sanitizeFloat(form.score6),
        SCORE7: sanitizeFloat(form.score7),
        SCORE8: sanitizeFloat(form.score8),
        SCORE9: sanitizeFloat(form.score9),
        PROGRAM_NAME: programName || form.ptcprogram || '',
        TEACHER: instructorName || '',
        BUNYA: categoryName || '',
        PLACE: form.place || ''
      });
    }
    
    // Apply keyword filters if provided
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log(`getProgramResult: Applying keywords to ${results.length} results`, JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`getProgramResult: After filtering, ${filteredResults.length} results remain`);
    }
    
    // Calculate averages
    return filteredResults.map(item => {
      const sum1List = [item.SCORE1, item.SCORE2, item.SCORE3];
      const sum2List = [item.SCORE4, item.SCORE5, item.SCORE6];
      const sum3List = [item.SCORE7, item.SCORE8, item.SCORE9];

      const sum1 = calculateAverage(sum1List);
      const sum2 = calculateAverage(sum2List);
      const sum3 = calculateAverage(sum3List);

      return { ...item, sum1, sum2, sum3 };
    });
  } catch (error) {
    console.error('Error getting program results:', error);
    throw new Error('Failed to get program results');
  }
};

// Get facility list data (type=2)
const getFacilityList = async (_, { type, agency, agency_id, openday, endday, keywords }) => {
  console.log("getFacilityList2");
  console.log("getFacilityList",{ type, agency, agency_id, openday, endday, keywords });
  try {
    // Build where clause for Prisma
    const where = {};
    
    // Only add agency filter if provided
    if (agency) {
      where.agency = agency;
    }
    
    // Only add agency_id filter if provided
    if (agency_id) {
      where.agency_id = agency_id;
    }
    
    if (openday) {
      where.openday = {
        gte: openday
      };
    }
    
    if (endday) {
      where.eval_date = {
        lte: endday
      };
    }
    
    // Get service form data (no more entries relation)
    const serviceForms = await prisma.serviceForm.findMany({
      where,
      orderBy: {
        eval_date: 'desc'
      }
    });
    
    // Map to the required output format
    const results = [];
    for (const form of serviceForms) {
      // Add form data directly to results (no more entry iteration)
      results.push({
        ID: form.id,
        SEX: form.sex || '',
        AGE: form.age || '',
        TYPE: '',
        AGENCY: form.agency,
        OPENDAY: form.openday,
        ENDDAY: form.eval_date,
        PTCPROGRAM: form.ptcprogram || '',
        RESIDENCE: form.residence || '',
        JOB: form.job || '',
        SCORE1: sanitizeFloat(form.score1),
        SCORE2: sanitizeFloat(form.score2),
        SCORE3: sanitizeFloat(form.score3),
        SCORE4: sanitizeFloat(form.score4),
        SCORE5: sanitizeFloat(form.score5),
        SCORE6: sanitizeFloat(form.score6),
        SCORE7: sanitizeFloat(form.score7),
        SCORE8: sanitizeFloat(form.score8),
        SCORE9: sanitizeFloat(form.score9),
        SCORE10: sanitizeFloat(form.score10),
        FACILITY_OPINION: form.facility_opinion || '',
        SCORE11: sanitizeFloat(form.score11),
        SCORE12: sanitizeFloat(form.score12),
        SCORE13: sanitizeFloat(form.score13),
        SCORE14: sanitizeFloat(form.score14),
        SCORE15: sanitizeFloat(form.score15),
        SCORE16: sanitizeFloat(form.score16),
        OPERATION_OPINION: form.operation_opinion || '',
        SCORE17: sanitizeFloat(form.score17),
        SCORE18: sanitizeFloat(form.score18)
      });
    }
    
    // Apply keyword filters if provided
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log(`getFacilityList: Applying keywords to ${results.length} results`, JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`getFacilityList: After filtering, ${filteredResults.length} results remain`);
    }
    
    // Calculate averages
    return filteredResults.map(item => {
      const sum1List = [item.SCORE1, item.SCORE2];
      const sum2List = [item.SCORE3, item.SCORE4];
      const sum3List = [item.SCORE5, item.SCORE6, item.SCORE7];
      const sum4List = [item.SCORE8, item.SCORE9, item.SCORE10];
      const sum5List = [item.SCORE11, item.SCORE12, item.SCORE13];
      const sum6List = [item.SCORE14, item.SCORE15, item.SCORE16];
      const sum7List = [item.SCORE17, item.SCORE18];

      const sum1 = calculateAverage(sum1List);
      const sum2 = calculateAverage(sum2List);
      const sum3 = calculateAverage(sum3List);
      const sum4 = calculateAverage(sum4List);
      const sum5 = calculateAverage(sum5List);
      const sum6 = calculateAverage(sum6List);
      const sum7 = calculateAverage(sum7List);

      return { ...item, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
    });
  } catch (error) {
    console.error('Error getting facility list:', error);
    throw new Error('Failed to get facility list');
  }
};

// Get prevent list data (type=4)
const getPreventList = async (_, { type, agency, agency_id, openday, endday, keywords }) => {
  try {
    // Build where clause for Prisma
    const where = {};
    
    // Only add agency filter if provided
    if (agency) {
      where.agency = agency;
    }
    
    // Only add agency_id filter if provided
    if (agency_id) {
      where.agency_id = agency_id;
    }
    
    if (openday) {
      where.openday = {
        gte: openday
      };
    }
    
    if (endday) {
      where.eval_date = {
        lte: endday
      };
    }

    // 타입에 따라 다른 테이블 조회
    let preventForms;
    if (type === "도박") {
      // 도박 예방 설문 - PreventGamblingForm 테이블 (14개 문항)
      preventForms = await prisma.preventGamblingForm.findMany({
        where,
        orderBy: [
          { name: 'asc' },
          { pv: 'asc' }
        ]
      });
    } else {
      // 스마트폰 예방 설문 - PreventForm 테이블 (20개 문항)
      preventForms = await prisma.preventForm.findMany({
        where,
        orderBy: [
          { name: 'asc' },
          { pv: 'asc' }
        ]
      });
    }

    // Map to the required output format
    const results = [];
    for (const form of preventForms) {
      // Add form data directly to results
      results.push({
        ID: form.id,
        NAME: form.name || '',
        SEX: form.sex || '',
        AGE: form.age || '',
        TYPE: type,
        AGENCY: form.agency,
        OPENDAY: form.openday,
        ENDDAY: form.eval_date,
        PTCPROGRAM: form.ptcprogram || '',
        RESIDENCE: form.residence || '',
        JOB: form.job || '',
        PV: form.pv || '',
        PAST_STRESS_EXPERIENCE: form.past_stress_experience || '',
        SCORE1: sanitizeFloat(form.score1),
        SCORE2: sanitizeFloat(form.score2),
        SCORE3: sanitizeFloat(form.score3),
        SCORE4: sanitizeFloat(form.score4),
        SCORE5: sanitizeFloat(form.score5),
        SCORE6: sanitizeFloat(form.score6),
        SCORE7: sanitizeFloat(form.score7),
        SCORE8: sanitizeFloat(form.score8),
        SCORE9: sanitizeFloat(form.score9),
        SCORE10: sanitizeFloat(form.score10),
        SCORE11: sanitizeFloat(form.score11),
        SCORE12: sanitizeFloat(form.score12),
        SCORE13: sanitizeFloat(form.score13),
        SCORE14: sanitizeFloat(form.score14),
        // 스마트폰 예방 설문의 경우 추가 문항들
        SCORE15: type === "스마트폰" ? sanitizeFloat(form.score15) : null,
        SCORE16: type === "스마트폰" ? sanitizeFloat(form.score16) : null,
        SCORE17: type === "스마트폰" ? sanitizeFloat(form.score17) : null,
        SCORE18: type === "스마트폰" ? sanitizeFloat(form.score18) : null,
        SCORE19: type === "스마트폰" ? sanitizeFloat(form.score19) : null,
        SCORE20: type === "스마트폰" ? sanitizeFloat(form.score20) : null
      });
    }
    
    // Apply keyword filters if provided
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log(`getPreventList: Applying keywords to ${results.length} results`, JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`getPreventList: After filtering, ${filteredResults.length} results remain`);
    }
    
    // Calculate averages
    return filteredResults.map(item => {
      // 새로운 카테고리 구조에 맞는 합계 계산 (14개 문항)
      const sum1List = [item.SCORE1, item.SCORE2, item.SCORE3]; // 자가인식/도박인식 (3개)
      const sum2List = [item.SCORE4, item.SCORE5, item.SCORE6]; // 예방역량/도박예방역량 (3개)
      const sum3List = [item.SCORE7, item.SCORE8, item.SCORE9, item.SCORE10]; // 스트레스관리/자기통제력 (4개)
      const sum4List = [item.SCORE11, item.SCORE12, item.SCORE13, item.SCORE14]; // 중독위험인식/대인관계능력 (4개)
      
      const sum1 = calculateAverage(sum1List);
      const sum2 = calculateAverage(sum2List);
      const sum3 = calculateAverage(sum3List);
      const sum4 = calculateAverage(sum4List);
      
      return { ...item, sum1, sum2, sum3, sum4 };
    });
  } catch (error) {
    console.error('Error getting prevent list:', error);
    throw new Error('Failed to get prevent list');
  }
};

// Get healing list data (type=5)
const getHealingList = async (_, { type, agency, agency_id, openday, endday, keywords }) => {
  try {
    // Build where clause for Prisma
    const where = {};
    
    // Only add agency filter if provided
    if (agency) {
      where.agency = agency;
    }
    
    // Only add agency_id filter if provided
    if (agency_id) {
      where.agency_id = agency_id;
    }
    
    if (openday) {
      where.openday = {
        gte: openday
      };
    }
    
    if (endday) {
      where.eval_date = {
        lte: endday
      };
    }
    
    // Get healing form data (no more entries relation)
    const healingForms = await prisma.healingForm.findMany({
      where,
      orderBy: [
        {
          name: 'asc'
        },
        {
          pv: 'asc'
        }
      ]
    });
    
    // Map to the required output format
    const results = [];
    for (const form of healingForms) {
      // Add form data directly to results (no more entry iteration)
      results.push({
        ID: form.id,
        NAME: form.name || '',
        SEX: form.sex || '',
        AGE: form.age || '',
        TYPE: '',
        AGENCY: form.agency,
        OPENDAY: form.openday,
        ENDDAY: form.eval_date,
        PTCPROGRAM: form.ptcprogram || '',
        RESIDENCE: form.residence || '',
        JOB: form.job || '',
        PV: form.pv || '',
        PAST_STRESS_EXPERIENCE: form.past_stress_experience || '',
        SCORE1: sanitizeFloat(form.score1),
        SCORE2: sanitizeFloat(form.score2),
        SCORE3: sanitizeFloat(form.score3),
        SCORE4: sanitizeFloat(form.score4),
        SCORE5: sanitizeFloat(form.score5),
        SCORE6: sanitizeFloat(form.score6),
        SCORE7: sanitizeFloat(form.score7),
        SCORE8: sanitizeFloat(form.score8),
        SCORE9: sanitizeFloat(form.score9),
        SCORE10: sanitizeFloat(form.score10),
        SCORE11: sanitizeFloat(form.score11),
        SCORE12: sanitizeFloat(form.score12),
        SCORE13: sanitizeFloat(form.score13),
        SCORE14: sanitizeFloat(form.score14),
        SCORE15: sanitizeFloat(form.score15),
        SCORE16: sanitizeFloat(form.score16),
        SCORE17: sanitizeFloat(form.score17),
        SCORE18: sanitizeFloat(form.score18),
        SCORE19: sanitizeFloat(form.score19),
        SCORE20: sanitizeFloat(form.score20),
        SCORE21: sanitizeFloat(form.score21),
        SCORE22: sanitizeFloat(form.score22)
      });
    }
    
    // Apply keyword filters if provided
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log(`getHealingList: Applying keywords to ${results.length} results`, JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`getHealingList: After filtering, ${filteredResults.length} results remain`);
    }
    
    // Calculate averages
    return filteredResults.map(item => {
      const sum1List = [item.SCORE1, item.SCORE2];
      const sum2List = [item.SCORE3, item.SCORE4, item.SCORE5];
      const sum3List = [item.SCORE6, item.SCORE7, item.SCORE8, item.SCORE9];
      const sum4List = [item.SCORE10, item.SCORE11, item.SCORE12];
      const sum5List = [item.SCORE13, item.SCORE14, item.SCORE15, item.SCORE16];
      const sum6List = [item.SCORE17, item.SCORE18, item.SCORE19];
      const sum7List = [item.SCORE20, item.SCORE21, item.SCORE22];
      
      const sum1 = calculateAverage(sum1List);
      const sum2 = calculateAverage(sum2List);
      const sum3 = calculateAverage(sum3List);
      const sum4 = calculateAverage(sum4List);
      const sum5 = calculateAverage(sum5List);
      const sum6 = calculateAverage(sum6List);
      const sum7 = calculateAverage(sum7List);
      
      return { ...item, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
    });
  } catch (error) {
    console.error('Error getting healing list:', error);
    throw new Error('Failed to get healing list');
  }
};

// Implement getAgencies resolver
const getAgencies = async () => {
  try {
    // Simply get all unique agencies across all forms
    const programForms = await prisma.programForm.findMany({
      select: {
        agency: true,
        agency_id: true
      },
      distinct: ['agency']
    });
    
    return programForms.map(form => ({
      id: form.agency_id || null,
      agency: form.agency
    }));
  } catch (error) {
    console.error('Error getting agencies:', error);
    throw new Error('Failed to get agencies');
  }
};

module.exports = {
  getAgenciesByType,
  getProgramResult,
  getFacilityList,
  getPreventList,
  getHealingList,
  getAgencies
}; 