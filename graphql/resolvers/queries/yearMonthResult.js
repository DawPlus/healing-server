const prisma = require('../../../prisma/prismaClient');

/**
 * 키워드 검색 조건을 생성하는 함수
 * @param {Array} keywords - 검색 키워드 배열
 * @returns {Object} - Prisma 검색 조건 객체
 */
const buildKeywordSearchCondition = (keywords) => {
  if (!keywords || keywords.length === 0) {
    return {};
  }

  // 각 키워드 타입별 검색 조건 생성
  const conditions = keywords.map(({ type, value }) => {
    switch (type) {
      case 'AGENCY': // 기관명
        return {
          page1: {
            group_name: {
              contains: value
            }
          }
        };
      case 'OM': // OM (운영 매니저)
        return {
          page1: {
            operation_manager: {
              contains: value
            }
          }
        };
      case 'DAYS_TO_STAY': // 체류 기간 (일수로 검색)
        const days = parseInt(value);
        if (isNaN(days)) return {};
        
        return {
          page1: {
            // 시작일과 종료일 차이가 지정한 일수와 일치
            OR: [
              {
                end_date: {
                  equals: prisma.raw(`DATE_ADD(start_date, INTERVAL ${days-1} DAY)`)
                }
              }
            ]
          }
        };
      case 'RESIDENCE': // 거주 지역
        return {
          page1: {
            region: {
              equals: value
            }
          }
        };
      case 'BIZ_PURPOSE': // 사업 구분
        return {
          page1: {
            business_category: {
              equals: value
            }
          }
        };
      case 'PART_TYPE': // 참가자 유형
        return {
          part_type: {
            equals: value
          }
        };
      case 'AGE_TYPE': // 연령대
        return {
          age_type: {
            equals: value
          }
        };
      case 'PART_FORM': // 참여 형태
        return {
          part_form: {
            equals: value
          }
        };
      case 'ORG_NATURE': // 단체 성격
        return {
          org_nature: {
            equals: value
          }
        };
      case 'SERVICE_TYPE': // 서비스 유형
        return {
          service_type: {
            equals: value
          }
        };
      default:
        return {};
    }
  });

  // AND 조건으로 모든 검색 조건 적용
  if (conditions.length === 1) {
    return conditions[0];
  } else {
    return {
      AND: conditions
    };
  }
};

/**
 * 월별 통계 목록 조회 resolver
 * 시작일과 종료일 기준으로 프로그램 목록 조회
 */
const getYearMonthResults = async (_, { startDate, endDate, keywords }) => {
  console.log("검색 조건:", { startDate, endDate, keywords });
  try {
    // 날짜 범위 기본 조건
    let whereCondition = {
      page1: {
        start_date: {
          gte: new Date(startDate)
        },
        end_date: {
          lte: new Date(endDate)
        }
      },
      service_type: {
        not: null
      }
    };

    // 키워드 검색 조건 추가
    const keywordCondition = buildKeywordSearchCondition(keywords);
    if (keywordCondition && Object.keys(keywordCondition).length > 0) {
      // AND 조건으로 키워드 검색 조건 결합
      whereCondition = {
        AND: [
          whereCondition,
          keywordCondition
        ]
      };
    }

    // 쿼리 실행
    const page2Data = await prisma.page2.findMany({
      where: whereCondition,
      include: {
        page1: true
      }
    });
    
    // 데이터가 없을 경우 빈 배열 반환
    if (page2Data.length === 0) {
      console.log('No data found for the specified search conditions, returning empty array');
      return [];
    }

    console.log(`검색 결과: ${page2Data.length}건`);
    
    // 결과 데이터 변환
    return page2Data.map(item => ({
      id: item.id,
      agency: item.page1?.group_name || '',
      start_date: item.page1?.start_date ? new Date(item.page1.start_date).toISOString().split('T')[0] : '',
      end_date: item.page1?.end_date ? new Date(item.page1.end_date).toISOString().split('T')[0] : '',
      service_type: item.service_type || '',
      male_count: item.male_count || 0,
      female_count: item.female_count || 0,
      total_count: item.total_count || 0,
      male_leader_count: item.male_leader_count || 0,
      female_leader_count: item.female_leader_count || 0,
      total_leader_count: item.total_leader_count || 0,
      operation_manager: item.page1?.operation_manager || '',
      business_category: item.page1?.business_category || '',
      business_detail_category: item.page1?.business_detail_category || '',
      part_type: item.part_type || '',
      age_type: item.age_type || '',
      // Include region directly for ResidenceList component
      region: item.page1?.region || null
    }));
  } catch (error) {
    console.error('Error fetching year/month results:', error);
    return [];
  }
};

/**
 * 월별 통계 데이터 조회 resolver - Returns data matching client's processedData structure
 */
const getYearMonthServiceStats = async (_, { startDate, endDate, keywords }) => {
  try {
    // 날짜 범위 기본 조건
    let whereCondition = {
      page1: {
        start_date: { 
          gte: new Date(startDate) 
        },
        end_date: { 
          lte: new Date(endDate) 
        }
      }
    };

    // 키워드 검색 조건 추가
    const keywordCondition = buildKeywordSearchCondition(keywords);
    if (keywordCondition && Object.keys(keywordCondition).length > 0) {
      // AND 조건으로 키워드 검색 조건 결합
      whereCondition = {
        AND: [
          whereCondition,
          keywordCondition
        ]
      };
    }

    // --- Step 1: Fetch Base Data --- 
    const page2Data = await prisma.page2.findMany({
      where: whereCondition,
      include: { page1: true, programs: true }
    });

    // --- Step 2: Handle No Data --- 
    if (page2Data.length === 0) {
      console.log('No data found for the specified search conditions, returning default client structure');
      // Return the complete default structure matching client expectation
      return {
        partTypeList: {
          count_adult: 0, count_benefit: 0, count_boy: 0, count_etc: 0,
          count_general: 0, count_family: 0, count_handicap: 0, count_multicultural: 0,
          count_income_etc: 0, count_income_green: 0, count_income_voucher: 0, count_kidboy: 0,
          count_old: 0, count_society: 0,
          part_adult: 0, part_benefit: 0, part_boy: 0, part_etc: 0,
          part_general: 0, part_family: 0, part_handicap: 0, part_multicultural: 0,
          part_income_etc: 0, part_income_green: 0, part_income_voucher: 0, part_kidboy: 0,
          part_old: 0, part_society: 0,
          org_1: 0, org_2: 0, org_3: 0, org_4: 0, org_5: 0,
          org_part_1: 0, org_part_2: 0, org_part_3: 0, org_part_4: 0, org_part_5: 0
        },
        programOverview: {
          people: [{ man: 0, woman: 0, total: 0 }],
          pTotal: [{ sum: 0 }],
          service: [],
          room: [{
            meal_etc: "0", meal_lead: "0", meal_part: "0", room_etc_people: "0",
            room_etc_room: "0", room_lead_people: "0", room_lead_room: "0",
            room_part_people: "0", room_part_room: "0"
          }],
          male_leaders: 0, female_leaders: 0, total_leaders: 0
        },
        programManage: { 
          manage: [], 
          bunya: [], 
          manage_cnt: [],
          categoryData: {
            '기타': {
              programs: 0,
              internal_instructors: 0,
              external_instructors: 0,
              satisfaction: {
                instructor: 0,
                content: 0,
                effectiveness: 0,
                average: 0
              }
            }
          }
        },
        serList: {
          score1: 0, score2: 0, score3: 0, score4: 0, score5: 0, score6: 0, 
          score7: 0, score8: 0, score9: 0, score10: 0, score11: 0, score12: 0, 
          score13: 0, score14: 0, score15: 0, score16: 0, total: 0
        },
        programEffect: [
          { type: '예방', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: '상담', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: '힐링', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(자율신경활성도)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(자율신경균형도)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(스트레스저항도)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(스트레스지수)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(피로도지수)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 }
        ],
        exIncomeList: {
          expend: { instructorPlannedCost: 0, instructorPlannedTransportation: 0, instructorPlannedAssistant: 0, instructorPlannedMeals: 0, instructorExecutedCost: 0, instructorExecutedTransportation: 0, instructorExecutedAssistant: 0, instructorExecutedMeals: 0, customerPlannedAccommodation: 0, customerPlannedMeals: 0, customerPlannedReserve: 0, customerPlannedMaterials: 0, customerExecutedOthers: 0, customerExecutedAccommodation: 0, customerExecutedMeals: 0, customerExecutedMaterials: 0, reserve: 0, total: 0 },
          income: { other: 0, accommodation: 0, meals: 0, materials: 0, program: 0, discount: 0, total: 0 },
          incomeTotal: 0
        }
      };
    }

    // --- Step 3: Calculate Intermediate Stats --- 
    // Participant & Leader Counts
    const totalParticipants = page2Data.reduce((sum, item) => sum + (item.total_count || 0), 0);
    const maleParticipants = page2Data.reduce((sum, item) => sum + (item.male_count || 0), 0);
    const femaleParticipants = page2Data.reduce((sum, item) => sum + (item.female_count || 0), 0);
    const totalLeaders = page2Data.reduce((sum, item) => sum + (item.total_leader_count || 0), 0);
    const maleLeaders = page2Data.reduce((sum, item) => sum + (item.male_leader_count || 0), 0);
    const femaleLeaders = page2Data.reduce((sum, item) => sum + (item.female_leader_count || 0), 0);

    // Service Type Distribution (for ProgramOverview and ProgramManage)
    const serviceTypeCount = {};
    page2Data.forEach(item => {
      if (item.service_type) {
        serviceTypeCount[item.service_type] = (serviceTypeCount[item.service_type] || 0) + 1;
      }
    });
    const serviceTypeDistribution = Object.entries(serviceTypeCount).map(([type, count]) => ({ name: type, cnt: count }));
    const serviceTypeDistributionForManage = Object.entries(serviceTypeCount).map(([type, count]) => ({ type, cnt: count }));

    // Participant Type List (Flat Object)
    const partTypeListResult = {
      count_adult: 0, count_benefit: 0, count_boy: 0, count_etc: 0,
      count_general: 0, count_family: 0, count_handicap: 0, count_multicultural: 0,
      count_income_etc: 0, count_income_green: 0, count_income_voucher: 0, count_kidboy: 0,
      count_old: 0, count_society: 0,
      part_adult: 0, part_benefit: 0, part_boy: 0, part_etc: 0,
      part_general: 0, part_family: 0, part_handicap: 0, part_multicultural: 0,
      part_income_etc: 0, part_income_green: 0, part_income_voucher: 0, part_kidboy: 0,
      part_old: 0, part_society: 0,
      org_1: 0, org_2: 0, org_3: 0, org_4: 0, org_5: 0,
      org_part_1: 0, org_part_2: 0, org_part_3: 0, org_part_4: 0, org_part_5: 0
     };
     const partTypeMapping = {
      '일반': 'general', '가족': 'family', '장애인': 'handicap', '다문화': 'multicultural',
      '성인': 'adult', '노인': 'old', '아동청소년': 'kidboy', '사회공헌': 'society',
      '수입사업': 'benefit', '기초생활수급자': 'income_voucher', '차상위계층': 'income_green',
      '소년소녀가장': 'boy', // Example, adjust as needed
      // '기타 소득구분' might map to income_etc
    };
    // Placeholder mapping for org_nature to org_1..5
    const orgNatureMapping = {
        '교육기관': 'org_1',
        '복지기관': 'org_2',
        '기업': 'org_3',
        '관공서': 'org_4',
        '강원랜드': 'org_5'
    }
    page2Data.forEach(item => {
      const participants = item.total_count || 0;
      const partType = item.part_type;
      const ageType = item.age_type; // Note: ageType seems conflated with partType in client logic
      const orgNature = item.org_nature;
      
      const mappedPartKey = partTypeMapping[partType];
      const mappedAgeKey = partTypeMapping[ageType]; 

      if (mappedPartKey) {
          partTypeListResult[`part_${mappedPartKey}`] = (partTypeListResult[`part_${mappedPartKey}`] || 0) + participants;
          partTypeListResult[`count_${mappedPartKey}`] = (partTypeListResult[`count_${mappedPartKey}`] || 0) + 1;
      } else if (partType) {
          partTypeListResult.part_etc = (partTypeListResult.part_etc || 0) + participants;
          partTypeListResult.count_etc = (partTypeListResult.count_etc || 0) + 1;
      }
      // If age type needs distinct summing (client component mixes them)
      if (mappedAgeKey && partTypeListResult.hasOwnProperty(`part_${mappedAgeKey}`)) {
          // Add logic here if needed, e.g., if client *really* needs part_adult summed by age_type='성인'
      }
      
      // Handle org types based on org_nature
      const orgKey = orgNatureMapping[orgNature];
      if (orgKey) {
        partTypeListResult[orgKey] = (partTypeListResult[orgKey] || 0) + 1; // Count occurrences
        partTypeListResult[`org_part_${orgKey.split('_')[1]}`] = (partTypeListResult[`org_part_${orgKey.split('_')[1]}`] || 0) + participants; // Sum participants
      }
    });

    // Month Summaries (for ProgramManage)
    const monthData = {};
    page2Data.forEach(item => {
      if (item.page1?.start_date) {
        const date = new Date(item.page1.start_date);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthData[month]) {
          monthData[month] = { total_participants: 0, service_types: {} };
        }
        monthData[month].total_participants += item.total_count || 0;
        if (item.service_type) {
          monthData[month].service_types[item.service_type] = (monthData[month].service_types[item.service_type] || 0) + 1;
        }
      }
    });

    // Extract all program data from the fetched programs
    let allPrograms = [];
    page2Data.forEach(item => {
      if (item.programs && item.programs.length > 0) {
        allPrograms = [...allPrograms, ...item.programs];
      }
    });

    // Fetch all program categories
    const programCategories = await prisma.programCategory.findMany({
      orderBy: { display_order: 'asc' }
    });

    // Initialize category data structure
    const categoryData = {};
    programCategories.forEach(category => {
      categoryData[category.category_name] = {
        programs: 0,
        internal_instructors: 0,
        external_instructors: 0,
        satisfaction: {
          instructor: 0,
          content: 0,
          effectiveness: 0,
          average: 0
        }
      };
    });

    // 프로그램 카테고리가 없는 경우 기본값으로 '기타' 카테고리 추가
    if (Object.keys(categoryData).length === 0) {
      categoryData['기타'] = {
        programs: 0,
        internal_instructors: 0,
        external_instructors: 0,
        satisfaction: {
          instructor: 0,
          content: 0,
          effectiveness: 0,
          average: 0
        }
      };
    }

    // Process programs by category
    // Since the Page2Program model has category as a string field, not a relation
    allPrograms.forEach(program => {
      const categoryName = program.category_name || '기타';
      
      // Ensure the category exists in our structure
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          programs: 0,
          internal_instructors: 0,
          external_instructors: 0,
          satisfaction: {
            instructor: 0,
            content: 0,
            effectiveness: 0,
            average: 0
          }
        };
      }
      
      // Increment program count
      categoryData[categoryName].programs++;
      
      // Count instructors (instructor is a string field, not a relation)
      if (program.instructor && program.instructor.trim() !== '') {
        categoryData[categoryName].internal_instructors++;
      }
      
      // Count assistant and helper as external instructors
      if (program.assistant && program.assistant.trim() !== '') {
        categoryData[categoryName].external_instructors++;
      }
      
      if (program.helper && program.helper.trim() !== '') {
        categoryData[categoryName].external_instructors++;
      }
    });

    // Fetch program satisfaction data
    const programForms = await prisma.programForm.findMany({
      where: { openday: { gte: startDate, lte: endDate } }
    });

    // Map program forms to categories
    // This is a simplified approach since we don't have direct program_item relations
    programForms.forEach(form => {
      // Try to associate with a category
      // This is a simple approach - you might need to adjust based on your data structure
      let categoryName = '기타';
      
      // Get program by ID - simplified approach
      if (form.program_category_id) {
        const category = programCategories.find(c => c.id === form.program_category_id);
        if (category) {
          categoryName = category.category_name;
        }
      }
      
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          programs: 0,
          internal_instructors: 0,
          external_instructors: 0,
          satisfaction: {
            instructor: 0,
            content: 0,
            effectiveness: 0,
            average: 0
          }
        };
      }
      
      // Calculate satisfaction scores directly from form fields
      let instructorTotal = 0, instructorCount = 0;
      let contentTotal = 0, contentCount = 0;
      let effectivenessTotal = 0, effectivenessCount = 0;
      
      // Instructor scores (score1, score2, score3)
      for (let i = 1; i <= 3; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score > 0) {
          instructorTotal += score;
          instructorCount++;
        }
      }
      
      // Content scores (score4, score5, score6)
      for (let i = 4; i <= 6; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score > 0) {
          contentTotal += score;
          contentCount++;
        }
      }
      
      // Effectiveness scores (score7, score8, score9)
      for (let i = 7; i <= 9; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score > 0) {
          effectivenessTotal += score;
          effectivenessCount++;
        }
      }
      
      // Calculate averages
      const instructorAvg = instructorCount > 0 ? parseFloat((instructorTotal / instructorCount).toFixed(2)) : 0;
      const contentAvg = contentCount > 0 ? parseFloat((contentTotal / contentCount).toFixed(2)) : 0;
      const effectivenessAvg = effectivenessCount > 0 ? parseFloat((effectivenessTotal / effectivenessCount).toFixed(2)) : 0;
      
      // Update category satisfaction data
      categoryData[categoryName].satisfaction.instructor = instructorAvg;
      categoryData[categoryName].satisfaction.content = contentAvg;
      categoryData[categoryName].satisfaction.effectiveness = effectivenessAvg;
      
      // Overall average
      const validScores = [instructorAvg, contentAvg, effectivenessAvg].filter(s => s > 0);
      const overallAvg = validScores.length > 0 
        ? parseFloat((validScores.reduce((sum, s) => sum + s, 0) / validScores.length).toFixed(2)) 
        : 0;
      
      categoryData[categoryName].satisfaction.average = overallAvg;
    });
    
    // Create program manage data structure
    const programManageData = {
        manage: Object.entries(monthData).map(([month, data]) => ({ month, total: data.total_participants })),
        bunya: Object.entries(monthData).flatMap(([month, data]) => 
            Object.entries(data.service_types).map(([type, cnt]) => ({ month, type, cnt }))
        ),
        manage_cnt: serviceTypeDistributionForManage,
        categoryData: categoryData
    };

    // Service Satisfaction Scores
    const serviceForms = await prisma.serviceForm.findMany({ 
        where: { openday: { gte: startDate, lte: endDate } }
    });

    let facilityScores = [0, 0, 0, 0, 0, 0], facilityCounts = [0, 0, 0, 0, 0, 0];
    let environmentScores = [0, 0, 0, 0, 0, 0], environmentCounts = [0, 0, 0, 0, 0, 0];
    let staffScores = [0, 0, 0, 0, 0, 0], staffCounts = [0, 0, 0, 0, 0, 0]; // Assuming 6 scores for staff based on loops

    serviceForms.forEach(form => {
      // Process facility scores (score1-score6)
      for (let i = 1; i <= 6; i++) { 
        const score = parseFloat(form[`score${i}`]); 
        if (!isNaN(score) && score > 0) { 
          facilityScores[i-1] += score; 
          facilityCounts[i-1]++; 
        } 
      }
      
      // Process environment scores (score7-score12)
      for (let i = 7; i <= 12; i++) { 
        const score = parseFloat(form[`score${i}`]); 
        if (!isNaN(score) && score > 0) { 
          environmentScores[i-7] += score; 
          environmentCounts[i-7]++; 
        } 
      }
      
      // Process staff scores (score13-score18)
      for (let i = 13; i <= 18; i++) { 
        const score = parseFloat(form[`score${i}`]); 
        if (!isNaN(score) && score > 0) { 
          staffScores[i-13] += score; 
          staffCounts[i-13]++; 
        } 
      }
    });

    const facilityScoresAvg = facilityScores.map((s, i) => facilityCounts[i] > 0 ? parseFloat((s / facilityCounts[i]).toFixed(2)) : 0);
    const environmentScoresAvg = environmentScores.map((s, i) => environmentCounts[i] > 0 ? parseFloat((s / environmentCounts[i]).toFixed(2)) : 0);
    const staffScoresAvg = staffScores.map((s, i) => staffCounts[i] > 0 ? parseFloat((s / staffCounts[i]).toFixed(2)) : 0);
    const allScores = [...facilityScoresAvg, ...environmentScoresAvg, ...staffScoresAvg];
    const overallScore = allScores.reduce((sum, val) => sum + val, 0) > 0 ? parseFloat((allScores.reduce((sum, val) => sum + val, 0) / allScores.filter(s => s > 0).length).toFixed(2)) : 0;
    const serListResult = {
        score1: facilityScoresAvg[0] || 0, score2: facilityScoresAvg[1] || 0, score3: facilityScoresAvg[2] || 0, 
        score4: facilityScoresAvg[3] || 0, score5: facilityScoresAvg[4] || 0, score6: facilityScoresAvg[5] || 0,
        score7: environmentScoresAvg[0] || 0, score8: environmentScoresAvg[1] || 0, score9: environmentScoresAvg[2] || 0,
        score10: environmentScoresAvg[3] || 0, score11: environmentScoresAvg[4] || 0, score12: environmentScoresAvg[5] || 0,
        score13: staffScoresAvg[0] || 0, score14: staffScoresAvg[1] || 0, score15: staffScoresAvg[2] || 0, 
        score16: staffScoresAvg[3] || 0, // Client only uses up to score16
        total: overallScore || 0
    };
    
    // Effect Scores
    const preventForms = await prisma.preventForm.findMany({ where: { openday: { gte: startDate, lte: endDate } } });
    const healingForms = await prisma.healingForm.findMany({ where: { openday: { gte: startDate, lte: endDate } } });
    const counselForms = await prisma.CounselTherapyForm.findMany({ where: { openday: { gte: startDate, lte: endDate } } });
    const hrvForms = await prisma.hrvForm.findMany({ where: { openday: { gte: startDate, lte: endDate } } });

    // Calculate prevent form scores
    let preventPreScore = 0, preventPreCount = 0;
    let preventPostScore = 0, preventPostCount = 0;
    preventForms.forEach(form => {
      let sum = 0, count = 0;
      for (let i = 1; i <= 20; i++) { 
        const score = parseFloat(form[`score${i}`]); 
        if (!isNaN(score) && score > 0) { 
          sum += score; 
          count++; 
        } 
      }
      if (count > 0) { 
        const avg = sum / count; 
        if (form.pv === '사전') { 
          preventPreScore += avg; 
          preventPreCount++; 
        } else { 
          preventPostScore += avg; 
          preventPostCount++; 
        } 
      }
    });
    const preventPreAvg = preventPreCount > 0 ? parseFloat((preventPreScore / preventPreCount).toFixed(2)) : 0;
    const preventPostAvg = preventPostCount > 0 ? parseFloat((preventPostScore / preventPostCount).toFixed(2)) : 0;
    const preventDiff = parseFloat((preventPostAvg - preventPreAvg).toFixed(2));

    // Calculate counsel form scores
    let counselPreScore = 0, counselPreCount = 0;
    let counselPostScore = 0, counselPostCount = 0;
    counselForms.forEach(form => {
      let sum = 0, count = 0;
      for (let i = 1; i <= 6; i++) { 
        const score = parseFloat(form[`score${i}`]); 
        if (!isNaN(score) && score > 0) { 
          sum += score; 
          count++; 
        } 
      }
      if (count > 0) { 
        const avg = sum / count; 
        if (form.pv === '사전') { 
          counselPreScore += avg; 
          counselPreCount++; 
        } else { 
          counselPostScore += avg; 
          counselPostCount++; 
        } 
      }
    });
    const counselPreAvg = counselPreCount > 0 ? parseFloat((counselPreScore / counselPreCount).toFixed(2)) : 0;
    const counselPostAvg = counselPostCount > 0 ? parseFloat((counselPostScore / counselPostCount).toFixed(2)) : 0;
    const counselDiff = parseFloat((counselPostAvg - counselPreAvg).toFixed(2));

    // Calculate healing form scores
    let healingPreScore = 0, healingPreCount = 0;
    let healingPostScore = 0, healingPostCount = 0;
    healingForms.forEach(form => {
      let sum = 0, count = 0;
      for (let i = 1; i <= 22; i++) { 
        const score = parseFloat(form[`score${i}`]); 
        if (!isNaN(score) && score > 0) { 
          sum += score; 
          count++; 
        } 
      }
      if (count > 0) { 
        const avg = sum / count; 
        if (form.pv === '사전') { 
          healingPreScore += avg; 
          healingPreCount++; 
        } else { 
          healingPostScore += avg; 
          healingPostCount++; 
        } 
      }
    });
    const healingPreAvg = healingPreCount > 0 ? parseFloat((healingPreScore / healingPreCount).toFixed(2)) : 0;
    const healingPostAvg = healingPostCount > 0 ? parseFloat((healingPostScore / healingPostCount).toFixed(2)) : 0;
    const healingDiff = parseFloat((healingPostAvg - healingPreAvg).toFixed(2));

    // Calculate HRV metrics
    const hrvMetrics = [
      { name: 'autonomic_activity', pre: 0, post: 0, preCount: 0, postCount: 0 },
      { name: 'autonomic_balance', pre: 0, post: 0, preCount: 0, postCount: 0 },
      { name: 'stress_resistance', pre: 0, post: 0, preCount: 0, postCount: 0 },
      { name: 'stress_index', pre: 0, post: 0, preCount: 0, postCount: 0 },
      { name: 'fatigue_index', pre: 0, post: 0, preCount: 0, postCount: 0 }
    ];

    hrvForms.forEach(form => {
      for (let i = 1; i <= 5; i++) {
        const score = parseFloat(form[`score${i}`]);
        if (!isNaN(score) && score > 0) {
          if (form.pv === '사전') {
            hrvMetrics[i-1].pre += score;
            hrvMetrics[i-1].preCount++;
          } else {
            hrvMetrics[i-1].post += score;
            hrvMetrics[i-1].postCount++;
          }
        }
      }
    });

    const hrvEffect = { 
      autonomic_activity: {}, 
      autonomic_balance: {}, 
      stress_resistance: {}, 
      stress_index: {}, 
      fatigue_index: {} 
    };

    Object.keys(hrvEffect).forEach((key, idx) => {
      const pre = hrvMetrics[idx].preCount > 0 ? parseFloat((hrvMetrics[idx].pre / hrvMetrics[idx].preCount).toFixed(2)) : 0;
      const post = hrvMetrics[idx].postCount > 0 ? parseFloat((hrvMetrics[idx].post / hrvMetrics[idx].postCount).toFixed(2)) : 0;
      hrvEffect[key] = { pre_score: pre, post_score: post, difference: parseFloat((post - pre).toFixed(2)) };
    });
    
    const programEffectResult = [
      { type: '예방', sum1: 0, sum2: 0, avg1: preventPreAvg, avg2: preventPostAvg, diff: preventDiff },
      { type: '상담', sum1: 0, sum2: 0, avg1: counselPreAvg, avg2: counselPostAvg, diff: counselDiff },
      { type: '힐링', sum1: 0, sum2: 0, avg1: healingPreAvg, avg2: healingPostAvg, diff: healingDiff },
      { type: 'HRV(자율신경활성도)', sum1: 0, sum2: 0, avg1: hrvEffect.autonomic_activity.pre_score, avg2: hrvEffect.autonomic_activity.post_score, diff: hrvEffect.autonomic_activity.difference },
      { type: 'HRV(자율신경균형도)', sum1: 0, sum2: 0, avg1: hrvEffect.autonomic_balance.pre_score, avg2: hrvEffect.autonomic_balance.post_score, diff: hrvEffect.autonomic_balance.difference },
      { type: 'HRV(스트레스저항도)', sum1: 0, sum2: 0, avg1: hrvEffect.stress_resistance.pre_score, avg2: hrvEffect.stress_resistance.post_score, diff: hrvEffect.stress_resistance.difference },
      { type: 'HRV(스트레스지수)', sum1: 0, sum2: 0, avg1: hrvEffect.stress_index.pre_score, avg2: hrvEffect.stress_index.post_score, diff: hrvEffect.stress_index.difference },
      { type: 'HRV(피로도지수)', sum1: 0, sum2: 0, avg1: hrvEffect.fatigue_index.pre_score, avg2: hrvEffect.fatigue_index.post_score, diff: hrvEffect.fatigue_index.difference }
    ];

    // Default ExIncomeList
    const exIncomeListResult = {
      expend: { 
        instructorPlannedCost: 0, 
        instructorPlannedTransportation: 0, 
        instructorPlannedAssistant: 0, 
        instructorPlannedMeals: 0, 
        instructorExecutedCost: 0, 
        instructorExecutedTransportation: 0, 
        instructorExecutedAssistant: 0, 
        instructorExecutedMeals: 0, 
        customerPlannedAccommodation: 0, 
        customerPlannedMeals: 0, 
        customerPlannedReserve: 0, 
        customerPlannedMaterials: 0, 
        customerExecutedOthers: 0, 
        customerExecutedAccommodation: 0, 
        customerExecutedMeals: 0, 
        customerExecutedMaterials: 0, 
        reserve: 0, 
        total: 0 
      },
      income: { 
        other: 0, 
        accommodation: 0, 
        meals: 0, 
        materials: 0, 
        program: 0, 
        discount: 0, 
        total: 0 
      },
      incomeTotal: 0
    };
    
    // 지출 및 수입 데이터 집계
    try {
      // 모든 page1 ID 목록 가져오기
      const page1Ids = page2Data.map(item => item.page1_id).filter(Boolean);
      
      if (page1Ids.length > 0) {
        // PageFinal 데이터 가져오기 (수입, 지출 정보)
        const pageFinals = await prisma.pageFinal.findMany({
          where: {
            page1_id: {
              in: page1Ids
            }
          },
          include: {
            teacher_expenses: true,
            participant_expenses: true,
            income_items: true
          }
        });
        
        if (pageFinals.length > 0) {
          // 강사 관련 지출 집계
          pageFinals.forEach(pageFinal => {
            // 강사 지출 - 예정
            const instructorPlannedExpenses = pageFinal.teacher_expenses
              .filter(exp => exp.is_planned === true)
              .reduce((acc, exp) => {
                const amount = Number(exp.amount || 0);
                const category = exp.category?.toLowerCase() || '';
                
                if (category.includes('강사비') || category === '강사' || category === '강사료') {
                  acc.instructorPlannedCost += amount;
                } else if (category.includes('교통') || category.includes('여비')) {
                  acc.instructorPlannedTransportation += amount;
                } else if (category.includes('식비') || category.includes('식사')) {
                  acc.instructorPlannedMeals += amount;
                } else if (category.includes('보조') || category.includes('조교')) {
                  acc.instructorPlannedAssistant += amount;
                }
                
                return acc;
              }, {
                instructorPlannedCost: 0,
                instructorPlannedTransportation: 0,
                instructorPlannedMeals: 0,
                instructorPlannedAssistant: 0
              });
            
            // 강사 지출 - 집행
            const instructorExecutedExpenses = pageFinal.teacher_expenses
              .filter(exp => exp.is_planned === false)
              .reduce((acc, exp) => {
                const amount = Number(exp.amount || 0);
                const category = exp.category?.toLowerCase() || '';
                
                if (category.includes('강사비') || category === '강사' || category === '강사료') {
                  acc.instructorExecutedCost += amount;
                } else if (category.includes('교통') || category.includes('여비')) {
                  acc.instructorExecutedTransportation += amount;
                } else if (category.includes('식비') || category.includes('식사')) {
                  acc.instructorExecutedMeals += amount;
                } else if (category.includes('보조') || category.includes('조교')) {
                  acc.instructorExecutedAssistant += amount;
                }
                
                return acc;
              }, {
                instructorExecutedCost: 0,
                instructorExecutedTransportation: 0,
                instructorExecutedMeals: 0,
                instructorExecutedAssistant: 0
              });
            
            // 참가자 지출 - 예정
            const customerPlannedExpenses = pageFinal.participant_expenses
              .filter(exp => exp.is_planned === true)
              .reduce((acc, exp) => {
                const amount = Number(exp.amount || 0);
                const category = exp.category?.toLowerCase() || '';
                
                if (category.includes('숙박') || category.includes('숙소')) {
                  acc.customerPlannedAccommodation += amount;
                } else if (category.includes('식비') || category.includes('식사')) {
                  acc.customerPlannedMeals += amount;
                } else if (category.includes('재료') || category.includes('교구')) {
                  acc.customerPlannedMaterials += amount;
                } else if (category.includes('예비') || category.includes('예비비')) {
                  acc.customerPlannedReserve += amount;
                }
                
                return acc;
              }, {
                customerPlannedAccommodation: 0,
                customerPlannedMeals: 0,
                customerPlannedMaterials: 0,
                customerPlannedReserve: 0
              });
            
            // 참가자 지출 - 집행
            const customerExecutedExpenses = pageFinal.participant_expenses
              .filter(exp => exp.is_planned === false)
              .reduce((acc, exp) => {
                const amount = Number(exp.amount || 0);
                const category = exp.category?.toLowerCase() || '';
                
                if (category.includes('숙박') || category.includes('숙소')) {
                  acc.customerExecutedAccommodation += amount;
                } else if (category.includes('식비') || category.includes('식사')) {
                  acc.customerExecutedMeals += amount;
                } else if (category.includes('재료') || category.includes('교구')) {
                  acc.customerExecutedMaterials += amount;
                } else if (category.includes('기타')) {
                  acc.customerExecutedOthers += amount;
                } else if (category.includes('예비') || category.includes('예비비')) {
                  acc.reserve += amount;
                }
                
                return acc;
              }, {
                customerExecutedAccommodation: 0,
                customerExecutedMeals: 0,
                customerExecutedMaterials: 0,
                customerExecutedOthers: 0,
                reserve: 0
              });
            
            // 수입 집계
            const incomeData = pageFinal.income_items.reduce((acc, income) => {
              const amount = Number(income.amount || 0);
              const category = income.category?.toLowerCase() || '';
              
              if (category.includes('프로그램') || category.includes('참가비')) {
                acc.program += amount;
              } else if (category.includes('숙박') || category.includes('숙소')) {
                acc.accommodation += amount;
              } else if (category.includes('식비') || category.includes('식사')) {
                acc.meals += amount;
              } else if (category.includes('재료') || category.includes('교구')) {
                acc.materials += amount;
              } else if (category.includes('할인')) {
                acc.discount += amount;
              } else {
                acc.other += amount;
              }
              
              return acc;
            }, {
              program: 0,
              accommodation: 0,
              meals: 0,
              materials: 0,
              discount: 0,
              other: 0
            });
            
            // exIncomeListResult에 합산
            exIncomeListResult.expend.instructorPlannedCost += instructorPlannedExpenses.instructorPlannedCost;
            exIncomeListResult.expend.instructorPlannedTransportation += instructorPlannedExpenses.instructorPlannedTransportation;
            exIncomeListResult.expend.instructorPlannedMeals += instructorPlannedExpenses.instructorPlannedMeals;
            exIncomeListResult.expend.instructorPlannedAssistant += instructorPlannedExpenses.instructorPlannedAssistant;
            
            exIncomeListResult.expend.instructorExecutedCost += instructorExecutedExpenses.instructorExecutedCost;
            exIncomeListResult.expend.instructorExecutedTransportation += instructorExecutedExpenses.instructorExecutedTransportation;
            exIncomeListResult.expend.instructorExecutedMeals += instructorExecutedExpenses.instructorExecutedMeals;
            exIncomeListResult.expend.instructorExecutedAssistant += instructorExecutedExpenses.instructorExecutedAssistant;
            
            exIncomeListResult.expend.customerPlannedAccommodation += customerPlannedExpenses.customerPlannedAccommodation;
            exIncomeListResult.expend.customerPlannedMeals += customerPlannedExpenses.customerPlannedMeals;
            exIncomeListResult.expend.customerPlannedMaterials += customerPlannedExpenses.customerPlannedMaterials;
            exIncomeListResult.expend.customerPlannedReserve += customerPlannedExpenses.customerPlannedReserve;
            
            exIncomeListResult.expend.customerExecutedAccommodation += customerExecutedExpenses.customerExecutedAccommodation;
            exIncomeListResult.expend.customerExecutedMeals += customerExecutedExpenses.customerExecutedMeals;
            exIncomeListResult.expend.customerExecutedMaterials += customerExecutedExpenses.customerExecutedMaterials;
            exIncomeListResult.expend.customerExecutedOthers += customerExecutedExpenses.customerExecutedOthers;
            exIncomeListResult.expend.reserve += customerExecutedExpenses.reserve;
            
            exIncomeListResult.income.program += incomeData.program;
            exIncomeListResult.income.accommodation += incomeData.accommodation;
            exIncomeListResult.income.meals += incomeData.meals;
            exIncomeListResult.income.materials += incomeData.materials;
            exIncomeListResult.income.discount += incomeData.discount;
            exIncomeListResult.income.other += incomeData.other;
          });
          
          // 지출 및 수입 합계 계산 (천원 단위로 변환)
          const totalExpenditure = (
            exIncomeListResult.expend.instructorExecutedCost + 
            exIncomeListResult.expend.instructorExecutedTransportation + 
            exIncomeListResult.expend.instructorExecutedMeals + 
            exIncomeListResult.expend.instructorExecutedAssistant + 
            exIncomeListResult.expend.customerExecutedAccommodation + 
            exIncomeListResult.expend.customerExecutedMeals + 
            exIncomeListResult.expend.customerExecutedMaterials + 
            exIncomeListResult.expend.customerExecutedOthers + 
            exIncomeListResult.expend.reserve
          );
          
          const totalIncome = (
            exIncomeListResult.income.program + 
            exIncomeListResult.income.accommodation + 
            exIncomeListResult.income.meals + 
            exIncomeListResult.income.materials + 
            exIncomeListResult.income.other
          ) - exIncomeListResult.income.discount; // 할인은 차감
          
          // 천원 단위로 변환
          exIncomeListResult.expend.instructorPlannedCost = Math.round(exIncomeListResult.expend.instructorPlannedCost / 1000);
          exIncomeListResult.expend.instructorPlannedTransportation = Math.round(exIncomeListResult.expend.instructorPlannedTransportation / 1000);
          exIncomeListResult.expend.instructorPlannedMeals = Math.round(exIncomeListResult.expend.instructorPlannedMeals / 1000);
          exIncomeListResult.expend.instructorPlannedAssistant = Math.round(exIncomeListResult.expend.instructorPlannedAssistant / 1000);
          
          exIncomeListResult.expend.instructorExecutedCost = Math.round(exIncomeListResult.expend.instructorExecutedCost / 1000);
          exIncomeListResult.expend.instructorExecutedTransportation = Math.round(exIncomeListResult.expend.instructorExecutedTransportation / 1000);
          exIncomeListResult.expend.instructorExecutedMeals = Math.round(exIncomeListResult.expend.instructorExecutedMeals / 1000);
          exIncomeListResult.expend.instructorExecutedAssistant = Math.round(exIncomeListResult.expend.instructorExecutedAssistant / 1000);
          
          exIncomeListResult.expend.customerPlannedAccommodation = Math.round(exIncomeListResult.expend.customerPlannedAccommodation / 1000);
          exIncomeListResult.expend.customerPlannedMeals = Math.round(exIncomeListResult.expend.customerPlannedMeals / 1000);
          exIncomeListResult.expend.customerPlannedMaterials = Math.round(exIncomeListResult.expend.customerPlannedMaterials / 1000);
          exIncomeListResult.expend.customerPlannedReserve = Math.round(exIncomeListResult.expend.customerPlannedReserve / 1000);
          
          exIncomeListResult.expend.customerExecutedAccommodation = Math.round(exIncomeListResult.expend.customerExecutedAccommodation / 1000);
          exIncomeListResult.expend.customerExecutedMeals = Math.round(exIncomeListResult.expend.customerExecutedMeals / 1000);
          exIncomeListResult.expend.customerExecutedMaterials = Math.round(exIncomeListResult.expend.customerExecutedMaterials / 1000);
          exIncomeListResult.expend.customerExecutedOthers = Math.round(exIncomeListResult.expend.customerExecutedOthers / 1000);
          exIncomeListResult.expend.reserve = Math.round(exIncomeListResult.expend.reserve / 1000);
          
          exIncomeListResult.income.program = Math.round(exIncomeListResult.income.program / 1000);
          exIncomeListResult.income.accommodation = Math.round(exIncomeListResult.income.accommodation / 1000);
          exIncomeListResult.income.meals = Math.round(exIncomeListResult.income.meals / 1000);
          exIncomeListResult.income.materials = Math.round(exIncomeListResult.income.materials / 1000);
          exIncomeListResult.income.discount = Math.round(exIncomeListResult.income.discount / 1000);
          exIncomeListResult.income.other = Math.round(exIncomeListResult.income.other / 1000);
          
          // 총 합계 (천원 단위)
          exIncomeListResult.expend.total = Math.round(totalExpenditure / 1000);
          exIncomeListResult.income.total = Math.round(totalIncome / 1000);
          exIncomeListResult.incomeTotal = Math.round((totalIncome - totalExpenditure) / 1000);
        }
      }
    } catch (error) {
      console.error('Error calculating expense/income data:', error);
    }
    
    // --- Step 4: Assemble Final Structure --- 
    const finalResult = {
      partTypeList: partTypeListResult,
      programOverview: {
        people: [{ man: maleParticipants, woman: femaleParticipants, total: totalParticipants }],
        pTotal: [{ sum: totalParticipants }], // Or extendedPeople if calculated
        service: serviceTypeDistribution,
        room: [{
            // Placeholder/Default room data - needs actual calculation if available
            meal_etc: "0", 
            meal_lead: totalLeaders.toString(), 
            meal_part: totalParticipants.toString(), 
            room_etc_people: "0",
            room_etc_room: "0", 
            room_lead_people: totalLeaders.toString(), 
            room_lead_room: "0", // Assuming 0 rooms for leaders unless specified
            room_part_people: totalParticipants.toString(), 
            room_part_room: "0" // Assuming 0 rooms for participants unless specified
          }],
        male_leaders: maleLeaders,
        female_leaders: femaleLeaders,
        total_leaders: totalLeaders
      },
      programManage: programManageData,
      serList: serListResult,
      programEffect: programEffectResult,
      exIncomeList: exIncomeListResult // Using default
    };

    console.log("Final structure returned from resolver:", JSON.stringify(finalResult, null, 2));
    return finalResult;

    } catch (error) {
      console.error('Error fetching year/month service stats:', error);
      // Return default structure on error with empty categoryData
      return {
        partTypeList: {
          count_adult: 0, count_benefit: 0, count_boy: 0, count_etc: 0,
          count_general: 0, count_family: 0, count_handicap: 0, count_multicultural: 0,
          count_income_etc: 0, count_income_green: 0, count_income_voucher: 0, count_kidboy: 0,
          count_old: 0, count_society: 0,
          part_adult: 0, part_benefit: 0, part_boy: 0, part_etc: 0,
          part_general: 0, part_family: 0, part_handicap: 0, part_multicultural: 0,
          part_income_etc: 0, part_income_green: 0, part_income_voucher: 0, part_kidboy: 0,
          part_old: 0, part_society: 0,
          org_1: 0, org_2: 0, org_3: 0, org_4: 0, org_5: 0,
          org_part_1: 0, org_part_2: 0, org_part_3: 0, org_part_4: 0, org_part_5: 0
        },
        programOverview: {
          people: [{ man: 0, woman: 0, total: 0 }],
          pTotal: [{ sum: 0 }],
          service: [],
          room: [{
            meal_etc: "0", meal_lead: "0", meal_part: "0", room_etc_people: "0",
            room_etc_room: "0", room_lead_people: "0", room_lead_room: "0",
            room_part_people: "0", room_part_room: "0"
          }],
          male_leaders: 0, female_leaders: 0, total_leaders: 0
        },
        programManage: { 
          manage: [], 
          bunya: [], 
          manage_cnt: [],
          categoryData: {
            '기타': {
              programs: 0,
              internal_instructors: 0,
              external_instructors: 0,
              satisfaction: {
                instructor: 0,
                content: 0,
                effectiveness: 0,
                average: 0
              }
            }
          }
        },
        serList: {
          score1: 0, score2: 0, score3: 0, score4: 0, score5: 0, score6: 0, 
          score7: 0, score8: 0, score9: 0, score10: 0, score11: 0, score12: 0, 
          score13: 0, score14: 0, score15: 0, score16: 0, total: 0
        },
        programEffect: [
          { type: '예방', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: '상담', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: '힐링', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(자율신경활성도)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(자율신경균형도)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(스트레스저항도)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(스트레스지수)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 },
          { type: 'HRV(피로도지수)', sum1: 0, sum2: 0, avg1: 0, avg2: 0, diff: 0 }
        ],
        exIncomeList: {
          expend: { instructorPlannedCost: 0, instructorPlannedTransportation: 0, instructorPlannedAssistant: 0, instructorPlannedMeals: 0, instructorExecutedCost: 0, instructorExecutedTransportation: 0, instructorExecutedAssistant: 0, instructorExecutedMeals: 0, customerPlannedAccommodation: 0, customerPlannedMeals: 0, customerPlannedReserve: 0, customerPlannedMaterials: 0, customerExecutedOthers: 0, customerExecutedAccommodation: 0, customerExecutedMeals: 0, customerExecutedMaterials: 0, reserve: 0, total: 0 },
          income: { other: 0, accommodation: 0, meals: 0, materials: 0, program: 0, discount: 0, total: 0 },
          incomeTotal: 0
        }
      };
    }
};

module.exports = {
  getYearMonthResults,
  getYearMonthServiceStats
}; 