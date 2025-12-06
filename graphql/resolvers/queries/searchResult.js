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
  console.log("getProgramResult", { type, agency, agency_id, openday, endday, inType, keywords });
  try {
    // Build where clause for Prisma
    const where = {};
    
    if (agency) {
      where.agency = agency;
    }
    
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
    
    // Get program form data
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
      
      // Only add form if it matches the type filter (if provided)
      if (!inType || form.type === inType) {
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
          PLACE: form.place || '',
          RESIDENCE: form.residence || '',
          JOB: form.job || ''
        });
      }
    }
    
    // 키워드 필터 적용
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log("프로그램 검색에 키워드 적용:", JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`키워드 필터링 결과: ${filteredResults.length}/${results.length} 항목 반환`);
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

  console.log("getFacilityList22", { type, agency, agency_id, openday, endday, keywords });
  try {
    // Build where clause for Prisma
    const where = {};
    
    if (agency) {
      where.agency = agency;
    }
    
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
    
    // Get service form data
    const serviceForms = await prisma.serviceForm.findMany({
      where,
      orderBy: {
        eval_date: 'desc'
      }
    });
    
    // Map to the required output format
    const results = [];
    for (const form of serviceForms) {
      // Add form data directly
      results.push({
        ID: form.id,
        SEX: form.sex || '',
        AGE: form.age || '',
        TYPE: form.type || '',
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
    
    // 키워드 필터 적용
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log("시설 검색에 키워드 적용:", JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`키워드 필터링 결과: ${filteredResults.length}/${results.length} 항목 반환`);
    }
    
    // Calculate averages
    return filteredResults.map(item => {
      const sum1List = [item.SCORE1, item.SCORE2];
      const sum2List = [item.SCORE3, item.SCORE4];
      const sum3List = [item.SCORE5, item.SCORE6, item.SCORE7];
      const sum4List = [item.SCORE8, item.SCORE9, item.SCORE10];

      const sum1 = calculateAverage(sum1List);
      const sum2 = calculateAverage(sum2List);
      const sum3 = calculateAverage(sum3List);
      const sum4 = calculateAverage(sum4List);

      return { ...item, sum1, sum2, sum3, sum4 };
    });
  } catch (error) {
    console.error('Error getting facility list:', error);
    throw new Error('Failed to get facility list');
  }
};

// Get prevent list data (type=4)
const getPreventList = async (_, { type, agency, agency_id, openday, endday, keywords }) => {
  console.log("getPreventList", { type, agency, agency_id, openday, endday, keywords });
  try {
    // Build where clause for Prisma
    const where = {};
    
    if (agency) {
      where.agency = agency;
    }
    
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
    
    // Get prevent form data
    const preventForms = await prisma.preventForm.findMany({
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
    for (const form of preventForms) {
      results.push({
        ID: form.id,
        SEX: form.sex || '',
        AGE: form.age || '',
        PV: form.pv || '',
        NAME: form.name || '',
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
        SCORE11: sanitizeFloat(form.score11),
        SCORE12: sanitizeFloat(form.score12),
        SCORE13: sanitizeFloat(form.score13),
        SCORE14: sanitizeFloat(form.score14),
        SCORE15: sanitizeFloat(form.score15),
        SCORE16: sanitizeFloat(form.score16),
        SCORE17: sanitizeFloat(form.score17),
        SCORE18: sanitizeFloat(form.score18),
        SCORE19: sanitizeFloat(form.score19),
        SCORE20: sanitizeFloat(form.score20)
      });
    }
    
    // 키워드 필터 적용
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log("예방 검색에 키워드 적용:", JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`키워드 필터링 결과: ${filteredResults.length}/${results.length} 항목 반환`);
    }
    
    // Calculate averages
    return filteredResults.map(item => {
      const sum1List = [item.SCORE1, item.SCORE2, item.SCORE3];
      const sum2List = [item.SCORE4, item.SCORE5, item.SCORE6];
      const sum3List = [item.SCORE7, item.SCORE8, item.SCORE9, item.SCORE10];

      const sum1 = calculateAverage(sum1List);
      const sum2 = calculateAverage(sum2List);
      const sum3 = calculateAverage(sum3List);

      return { ...item, sum1, sum2, sum3 };
    });
  } catch (error) {
    console.error('Error getting prevent list:', error);
    throw new Error('Failed to get prevent list');
  }
};

// Get healing list data (type=5)
const getHealingList = async (_, { type, agency, agency_id, openday, endday, keywords }) => {
  console.log("getHealingList", { type, agency, agency_id, openday, endday, keywords });
  try {
    // Build where clause for Prisma
    const where = {};
    
    if (agency) {
      where.agency = agency;
    }
    
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
    
    // Get healing form data
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
      results.push({
        ID: form.id,
        SEX: form.sex || '',
        AGE: form.age || '',
        PV: form.pv || '',
        NAME: form.name || '',
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
    
    // 키워드 필터 적용
    let filteredResults = results;
    if (keywords && keywords.length > 0) {
      console.log("힐링 검색에 키워드 적용:", JSON.stringify(keywords, null, 2));
      filteredResults = applyKeywordFilters(results, keywords);
      console.log(`키워드 필터링 결과: ${filteredResults.length}/${results.length} 항목 반환`);
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

// Helper function to apply keyword filters to results
const applyKeywordFilters = (results, keywords) => {
  // 유효한 키워드가 없으면 모든 결과 반환
  if (!keywords || keywords.length === 0 || keywords.every(k => k.type === 'X' || !k.text)) {
    console.log("유효한 키워드가 없음, 모든 결과 반환:", results.length);
    return results;
  }

  // 유효한 키워드만 필터링
  const validKeywords = keywords.filter(k => k.type !== 'X' && k.text);
  console.log(`${validKeywords.length}개 키워드 필터 적용:`, JSON.stringify(validKeywords, null, 2));
  
  if (results.length > 0) {
    console.log("결과 샘플 필드:", Object.keys(results[0]));
  } else {
    console.log("필터링할 결과 없음");
    return [];
  }

  // 결과 필터링 (모든 유효한 키워드에 일치하는 항목만 반환)
  const filteredResults = results.filter(item => {
    return validKeywords.every(keyword => {
      const fieldName = keyword.type;
      const searchValue = keyword.text;
      
      // 키워드 타입에 해당하는 필드가 없으면 로그 출력 및 불일치 처리
      if (!(fieldName in item)) {
        console.log(`필드 ${fieldName}가 항목에 없음`);
        return false; // 해당 필드가 없으면 불일치
      }
      
      const itemValue = item[fieldName];
      
      // null/undefined/빈 문자열 처리
      if (itemValue === null || itemValue === undefined || itemValue === '') {
        // 미기재를 찾는 경우에만 일치
        const match = searchValue.toLowerCase() === '미기재';
        if (match) console.log(`${fieldName}: 미기재 값 일치`);
        return match;
      }
      
      // 날짜 필드 (OPENDAY, ENDDAY) 처리
      if (fieldName === 'OPENDAY' || fieldName === 'ENDDAY') {
        const formattedItemDate = String(itemValue).trim();
        const formattedKeywordDate = String(searchValue).trim();
        const match = formattedItemDate.includes(formattedKeywordDate);
        if (match) console.log(`${fieldName}: 날짜 ${formattedItemDate}와 ${formattedKeywordDate} 일치`);
        return match;
      }
      
      // 숫자 필드 (AGE) 처리
      if (fieldName === 'AGE') {
        const itemAge = parseInt(itemValue);
        const keywordAge = parseInt(searchValue);
        if (isNaN(itemAge) || isNaN(keywordAge)) return false;
        const match = itemAge === keywordAge;
        if (match) console.log(`${fieldName}: 나이 ${itemAge} 일치`);
        return match;
      }
      
      // 열거형 필드 (SEX, RESIDENCE, JOB, TYPE, PV) 처리
      if (['SEX', 'RESIDENCE', 'JOB', 'TYPE', 'PV'].includes(fieldName)) {
        const match = String(itemValue).trim().toLowerCase() === String(searchValue).trim().toLowerCase();
        if (match) console.log(`${fieldName}: ${itemValue} 정확히 일치`);
        return match;
      }
      
      // 텍스트 필드 처리 (기타 모든 문자열 필드)
      if (typeof itemValue === 'string') {
        const match = itemValue.toLowerCase().includes(searchValue.toLowerCase());
        if (match) console.log(`${fieldName}: ${itemValue}에 ${searchValue} 포함됨`);
        return match;
      }
      
      // 숫자 필드 처리 (점수 등)
      if (typeof itemValue === 'number') {
        const keywordNum = parseFloat(searchValue);
        if (isNaN(keywordNum)) return false;
        const match = Math.abs(itemValue - keywordNum) < 0.01; // 부동소수점 오차 허용
        if (match) console.log(`${fieldName}: 숫자 ${itemValue} 일치`);
        return match;
      }
      
      return false;
    });
  });

  console.log(`필터링 결과: ${filteredResults.length}/${results.length} 항목`);
  return filteredResults;
};

// Search Program Results
const searchProgramResults = async (_, { openday, endday, keywords, agency }) => {
  try {
    // Get base results using existing function
    const baseParams = { type: "1", openday, endday };
    
    // Add agency parameter if provided
    if (agency) {
      baseParams.agency = agency;
    }
    
    const results = await getProgramResult(_, baseParams);
    
    // Apply keyword filters
    return applyKeywordFilters(results, keywords);
  } catch (error) {
    console.error('Error searching program results:', error);
    throw new Error('Failed to search program results');
  }
};

// Search Facility Results
const searchFacilityResults = async (_, { openday, endday, keywords, agency }) => {
  try {
    // Get base results using existing function
    const baseParams = { type: "2", openday, endday };
    
    // Add agency parameter if provided
    if (agency) {
      baseParams.agency = agency;
    }
    
    const results = await getFacilityList(_, baseParams);
    
    // Apply keyword filters
    return applyKeywordFilters(results, keywords);
  } catch (error) {
    console.error('Error searching facility results:', error);
    throw new Error('Failed to search facility results');
  }
};

// Search Prevent Results
const searchPreventResults = async (_, { openday, endday, keywords, agency }) => {
  try {
    // Get base results using existing function
    const baseParams = { type: "4", openday, endday };
    
    // Add agency parameter if provided
    if (agency) {
      baseParams.agency = agency;
    }
    
    const results = await getPreventList(_, baseParams);
    
    // Apply keyword filters
    return applyKeywordFilters(results, keywords);
  } catch (error) {
    console.error('Error searching prevent results:', error);
    throw new Error('Failed to search prevent results');
  }
};

// Search Healing Results
const searchHealingResults = async (_, { openday, endday, keywords, agency }) => {
  try {
    // Get base results using existing function
    const baseParams = { type: "5", openday, endday };
    
    // Add agency parameter if provided
    if (agency) {
      baseParams.agency = agency;
    }
    
    const results = await getHealingList(_, baseParams);
    
    // Apply keyword filters
    return applyKeywordFilters(results, keywords);
  } catch (error) {
    console.error('Error searching healing results:', error);
    throw new Error('Failed to search healing results');
  }
};

module.exports = {
  getAgenciesByType,
  getProgramResult,
  getFacilityList,
  getPreventList,
  getHealingList,
  getAgencies,
  searchProgramResults,
  searchFacilityResults,
  searchPreventResults,
  searchHealingResults
}; 