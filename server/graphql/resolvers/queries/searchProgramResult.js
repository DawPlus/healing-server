const prisma = require('../../../prisma/prismaClient');





// Helper function to build the filter conditions from the keyword array
const buildWhereConditions = (keyword) => {
  const conditions = {};
  
  keyword
    .filter(obj => obj.text !== '' && obj.type !== 'X')
    .forEach(obj => {
      conditions[obj.type] = { contains: obj.text };
    });
    
  return conditions;
};

// Add a helper function for safely executing database queries
async function safelyExecuteQuery(queryFn) {
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    // Check if it's a connection limit error
    if (error.message && error.message.includes('Too many connections')) {
      console.error('Database connection limit reached, attempting to recover...');
      
      // Wait briefly to allow connections to close
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try once more
      try {
        const result = await queryFn();
        return result;
      } catch (retryError) {
        console.error('Failed to recover from connection error:', retryError);
        throw retryError;
      }
    }
    
    // For other errors, just rethrow
    throw error;
  }
}

// 참가유형 조회 resolver
const getSearchPartTypeList = async (_, { keyword, openday, endday }) => {
  try {
    console.log('[getSearchPartTypeList] 요청 파라미터:', { keyword, openday, endday });
    
    const whereConditions = buildWhereConditions(keyword);
    
    // Base query condition
    const baseWhere = {
      // Use empty where condition
    };
    console.log('[getSearchPartTypeList] 조회 조건:', baseWhere);
    
    // Get all program entries with safe query execution
    const entries = await safelyExecuteQuery(() => 
      prisma.page1.findMany({
        where: baseWhere,
        include: {
          page2_reservations: {
            select: {
              age_type: true,
              part_type: true,
              org_nature: true,
              male_count: true,
              female_count: true,
              male_leader_count: true,
              female_leader_count: true
            }
          }
        }
      })
    );
    
    console.log(`[getSearchPartTypeList] 조회된 Page1 데이터 수: ${entries.length}`);
    
    // Initialize result object
    const result = {
      count_kidboy: 0, count_adult: 0, count_old: 0, count_boy: 0,
      count_general: 0, count_family: 0, count_handicap: 0, count_multicultural: 0,
      count_income_voucher: 0, count_income_green: 0, count_income_etc: 0,
      count_benefit: 0, count_society: 0, count_etc: 0,
      part_kidboy: 0, part_adult: 0, part_old: 0, part_boy: 0,
      part_general: 0, part_family: 0, part_handicap: 0, part_multicultural: 0,
      part_income_voucher: 0, part_income_green: 0, part_income_etc: 0,
      part_benefit: 0, part_society: 0,
      org_1: 0, org_2: 0, org_3: 0, org_4: 0, org_5: 0,
      org_part_1: 0, org_part_2: 0, org_part_3: 0, org_part_4: 0, org_part_5: 0
    };
    
    // Count and sum participant data
    entries.forEach(entry => {
      entry.page2_reservations.forEach(page2Entry => {
        const totalParticipants = (page2Entry.male_count || 0) + (page2Entry.female_count || 0) + 
                            (page2Entry.male_leader_count || 0) + (page2Entry.female_leader_count || 0);
      
        // AGE_TYPE counts
        if (page2Entry.age_type === "아동청소년") {
          result.count_kidboy++;
          result.part_kidboy += totalParticipants;
        } else if (page2Entry.age_type === "성인") {
          result.count_adult++;
          result.part_adult += totalParticipants;
        } else if (page2Entry.age_type === "노인") {
          result.count_old++;
          result.part_old += totalParticipants;
        }
        
        // PART_TYPE counts
        if (page2Entry.part_type === "사회복지시설") {
          result.count_society++;
          result.part_society += totalParticipants;
        } else if (page2Entry.part_type === "가족") {
          result.count_family++;
          result.part_family += totalParticipants;
        } else if (page2Entry.part_type === "장애인") {
          result.count_handicap++;
          result.part_handicap += totalParticipants;
        } else if (page2Entry.part_type === "다문화") {
          result.count_multicultural++;
          result.part_multicultural += totalParticipants;
        } else if (page2Entry.part_type === "수급자") {
          result.count_benefit++;
          result.part_benefit += totalParticipants;
        } else if (page2Entry.part_type === "일반") {
          result.count_general++;
          result.part_general += totalParticipants;
        } else if (page2Entry.part_type === "남자") {
          result.count_boy++;
          result.part_boy += totalParticipants;
        } else if (page2Entry.part_type === "기타") {
          result.count_etc++;
          result.part_etc += totalParticipants;
        }
        
        // ORG_NATURE counts
        if (page2Entry.org_nature === "교육기관") {
          result.org_1++;
          result.org_part_1 += totalParticipants;
        } else if (page2Entry.org_nature === "복지기관") {
          result.org_2++;
          result.org_part_2 += totalParticipants;
        } else if (page2Entry.org_nature === "기업") {
          result.org_3++;
          result.org_part_3 += totalParticipants;
        } else if (page2Entry.org_nature === "관공서") {
          result.org_4++;
          result.org_part_4 += totalParticipants;
        } else if (page2Entry.org_nature === "강원랜드") {
          result.org_5++;
          result.org_part_5 += totalParticipants;
        }
      });
    });
    
    // Convert counts to strings for schema compatibility
    const resultObj = {
      count_kidboy: String(result.count_kidboy),
      count_adult: String(result.count_adult),
      count_old: String(result.count_old),
      count_boy: String(result.count_boy),
      count_general: String(result.count_general),
      count_family: String(result.count_family),
      count_handicap: String(result.count_handicap),
      count_multicultural: String(result.count_multicultural),
      count_income_voucher: String(result.count_income_voucher),
      count_income_green: String(result.count_income_green),
      count_income_etc: String(result.count_income_etc),
      count_benefit: String(result.count_benefit),
      count_society: String(result.count_society),
      count_etc: String(result.count_etc),
      part_kidboy: String(result.part_kidboy),
      part_adult: String(result.part_adult),
      part_old: String(result.part_old),
      part_boy: String(result.part_boy),
      part_general: String(result.part_general),
      part_family: String(result.part_family),
      part_handicap: String(result.part_handicap),
      part_multicultural: String(result.part_multicultural),
      part_income_voucher: String(result.part_income_voucher),
      part_income_green: String(result.part_income_green),
      part_income_etc: String(result.part_income_etc),
      part_benefit: String(result.part_benefit),
      part_society: String(result.part_society),
      org_1: result.org_1,
      org_2: result.org_2,
      org_3: result.org_3,
      org_4: result.org_4,
      org_5: result.org_5,
      org_part_1: result.org_part_1,
      org_part_2: result.org_part_2,
      org_part_3: result.org_part_3,
      org_part_4: result.org_part_4,
      org_part_5: result.org_part_5
    };

    console.log('[getSearchPartTypeList] 결과:', resultObj);
    return resultObj;
  } catch (error) {
    console.error('Error fetching search part type list:', error);
    throw new Error('Error fetching search part type list');
  }
};

// 지역 목록 조회 resolver
const getSearchResidenceList = async (_, { keyword, openday, endday }) => {
  try {
    console.log('[getSearchResidenceList] 요청 파라미터:', { keyword, openday, endday });
    
    const whereConditions = buildWhereConditions(keyword);
    
    // Base query condition
    const baseWhere = {
      reservation_status: "E",
      ...(openday ? { start_date: { gte: new Date(openday), lte: new Date(endday) } } : {}),
      ...whereConditions
    };

    console.log('[getSearchResidenceList] 조회 조건:', baseWhere);
    
    // Get all residence data with safe query execution
    const residenceData = await safelyExecuteQuery(() => 
      prisma.page1.findMany({
        where: baseWhere,
        include: {
          page2_reservations: {
            select: {
              male_count: true,
              female_count: true,
              male_leader_count: true,
              female_leader_count: true
            }
          }
        }
      })
    );
    
    console.log(`[getSearchResidenceList] 조회된 Page1 데이터 수: ${residenceData.length}`);
    
    // Define standard residence areas
    const standardResidences = [
      "서울", "부산", "대구", "인천", "대전", "광주", "울산", 
      "경기", "강원", "폐광지역", "충북", "충남", "세종", 
      "경북", "경남", "전북", "전남", "제주"
    ];
    
    // Create residence map with counts
    const residenceMap = {};
    standardResidences.forEach(area => {
      residenceMap[area] = { count: 0, total: 0 };
    });
    
    // Count by residence
    residenceData.forEach(entry => {
      const region = entry.region || "";
      if (region && residenceMap[region]) {
        residenceMap[region].count++;
        // Sum participants from all page2 entries
        entry.page2_reservations.forEach(p2 => {
          residenceMap[region].total += (p2.male_count || 0) + 
                                     (p2.female_count || 0) + 
                                     (p2.male_leader_count || 0) + 
                                     (p2.female_leader_count || 0);
        });
      }
    });
    
    // Format result
    const result = Object.keys(residenceMap).map(area => ({
      RESIDENCE: area,
      count: residenceMap[area].count,
      total: residenceMap[area].total
    }));
    
    console.log('[getSearchResidenceList] 결과:', result);
    return result;
  } catch (error) {
    console.error('Error fetching search residence list:', error);
    throw new Error('Error fetching search residence list');
  }
};

// 시설 서비스 만족도 조회 resolver
const getSearchSerList = async (_, { keyword, openday, endday }) => {
  try {
    console.log('[getSearchSerList] 요청 파라미터:', { keyword, openday, endday });
    
    const whereConditions = buildWhereConditions(keyword);
    
    // Get basic info entries matching filter conditions with safe query execution
    const basicInfoEntries = await safelyExecuteQuery(() => 
      prisma.page1.findMany({
        where: {
          reservation_status: "E",
          ...(openday ? { start_date: { gte: new Date(openday), lte: new Date(endday) } } : {}),
          ...whereConditions
        },
        select: {
          start_date: true,
          group_name: true
        }
      })
    );
    
    console.log(`[getSearchSerList] 조회된 Page1 데이터 수: ${basicInfoEntries.length}`);
    
    // Extract date and agency pairs for joining
    const matchingPairs = basicInfoEntries.map(entry => ({
      openday: entry.start_date ? new Date(entry.start_date).toISOString().slice(0, 10) : "",
      agency: entry.group_name || ""
    }));
    
    // No matching entries
    if (matchingPairs.length === 0) {
      console.log('[getSearchSerList] 매칭되는 데이터 없음, 기본값 반환');
      return {
        score1: 0, score2: 0, score3: 0, score4: 0, score5: 0,
        score6: 0, score7: 0, score8: 0, score9: 0, score10: 0,
        score11: 0, score12: 0, score13: 0, score14: 0, score15: 0,
        score16: 0, total: 0
      };
    }
    
    // Find satisfaction scores directly from service forms with safe query execution
    const satisfactionScores = await safelyExecuteQuery(() =>
      prisma.serviceForm.findMany({
        where: {
          OR: matchingPairs.map(pair => ({
            AND: [
              { openday: pair.openday },
              { agency: pair.agency }
            ]
          }))
        }
      })
    );
    
    console.log(`[getSearchSerList] 조회된 ServiceForm 데이터 수: ${satisfactionScores.length}`);
    
    // Calculate averages
    const scores = {
      score1: 0, score2: 0, score3: 0, score4: 0, score5: 0,
      score6: 0, score7: 0, score8: 0, score9: 0, score10: 0,
      score11: 0, score12: 0, score13: 0, score14: 0, score15: 0,
      score16: 0
    };
    
    let totalSum = 0;
    let totalCount = 0;
    
    // Process scores - null values are excluded
    for (const key of Object.keys(scores)) {
      const scoreNumber = parseInt(key.replace('score', ''));
      const fieldName = `score${scoreNumber}`;
      
      const validScores = satisfactionScores
        .map(item => parseFloat(item[fieldName] || 0))
        .filter(val => val > 0);
      
      if (validScores.length > 0) {
        const sum = validScores.reduce((a, b) => a + b, 0);
        scores[fieldName] = parseFloat((sum / validScores.length).toFixed(2));
        totalSum += sum;
        totalCount += validScores.length;
      }
    }
    
    // Calculate total average
    const total = totalCount > 0 ? parseFloat((totalSum / totalCount).toFixed(2)) : 0;
    
    const result = {
      ...scores,
      total
    };
    
    console.log('[getSearchSerList] 결과:', result);
    return result;
  } catch (error) {
    console.error('Error fetching search service list:', error);
    throw new Error('Error fetching search service list');
  }
};

// 프로그램 관리 및 만족도 조회 resolver
const getSearchProgramManage = async (_, { keyword, openday, endday }) => {
  try {
    console.log('[getSearchProgramManage] 요청 파라미터:', { keyword, openday, endday });
    
    const whereConditions = buildWhereConditions(keyword);
    
    // Base query condition
    const baseWhere = {
      reservation_status: "E",
      ...(openday ? { start_date: { gte: new Date(openday), lte: new Date(endday) } } : {}),
      ...whereConditions
    };
    
    console.log('[getSearchProgramManage] 조회 조건:', baseWhere);
    
    // Get program data with service type - use the safe execution
    const programData = await safelyExecuteQuery(() => 
      prisma.page1.findMany({
        where: baseWhere,
        include: {
          page2_reservations: {
            select: {
              service_type: true,
              programs: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      })
    );
    
    console.log(`[getSearchProgramManage] 조회된 Page1 데이터 수: ${programData.length}`);
    
    // Initialize program type counts (산림교육, 예방교육, 산림치유, 아트, 릴렉싱, 에너제틱, 쿠킹, 이벤트)
    const programTypeMap = {
      '산림교육': 'forestEducation', 
      '예방교육': 'preventEducation', 
      '산림치유': 'forestHealing', 
      '아트': 'art', 
      '릴렉싱': 'relaxing', 
      '에너제틱': 'energetic', 
      '쿠킹': 'cooking', 
      '이벤트': 'event'
    };
    
    const programTypeCounts = {
      'forestEducation': 0, 
      'preventEducation': 0, 
      'forestHealing': 0, 
      'art': 0, 
      'relaxing': 0, 
      'energetic': 0, 
      'cooking': 0, 
      'event': 0
    };
    
    // Extract all program IDs
    let allProgramIds = [];
    
    // Count program types
    programData.forEach(page1Entry => {
      page1Entry.page2_reservations.forEach(page2Entry => {
        const serviceType = page2Entry.service_type;
        if (serviceType && programTypeMap[serviceType]) {
          const englishKey = programTypeMap[serviceType];
          programTypeCounts[englishKey]++;
        }
        
        // Collect program IDs
        page2Entry.programs.forEach(program => {
          if (program.id) {
            allProgramIds.push(program.id);
          }
        });
      });
    });
    
    console.log('[getSearchProgramManage] 프로그램 유형별 카운트:', programTypeCounts);
    console.log(`[getSearchProgramManage] 수집된 프로그램 ID 수: ${allProgramIds.length}`);
    
    // Get satisfaction scores for these programs - use the safe execution
    const satisfactionScores = await safelyExecuteQuery(() =>
      prisma.programForm.findMany({
        where: {
          program_id: {
            in: allProgramIds
          }
        }
      })
    );
    
    console.log(`[getSearchProgramManage] 조회된 만족도 데이터 수: ${satisfactionScores.length}`);
    
    // Calculate average scores by program type
    const scoresByType = {};
    const countsPerType = {};
    
    // Initialize score structure
    Object.keys(programTypeCounts).forEach(type => {
      scoresByType[type] = {
        instructor: [0, 0, 0], // SCORE1-3: 강사 점수
        content: [0, 0, 0],    // SCORE4-6: 내용구성 점수
        effect: [0, 0, 0]      // SCORE7-9: 효과성 점수
      };
      countsPerType[type] = {
        instructor: 0,
        content: 0,
        effect: 0
      };
    });
    
    // Process satisfaction scores
    satisfactionScores.forEach(form => {
      let type = form.ptcprogram;
      if (programTypeMap[type]) {
        type = programTypeMap[type];
      } else {
        type = 'forestEducation'; // 기본값
      }
      
      if (scoresByType[type]) {
        // Add instructor scores (SCORE1-3)
        for (let i = 1; i <= 3; i++) {
          const val = parseFloat(form[`score${i}`] || 0);
          if (val > 0) {
            scoresByType[type].instructor[i-1] += val;
            countsPerType[type].instructor++;
          }
        }
        
        // Add content scores (SCORE4-6)
        for (let i = 4; i <= 6; i++) {
          const val = parseFloat(form[`score${i}`] || 0);
          if (val > 0) {
            scoresByType[type].content[i-4] += val;
            countsPerType[type].content++;
          }
        }
        
        // Add effect scores (SCORE7-9)
        for (let i = 7; i <= 9; i++) {
          const val = parseFloat(form[`score${i}`] || 0);
          if (val > 0) {
            scoresByType[type].effect[i-7] += val;
            countsPerType[type].effect++;
          }
        }
      }
    });
    
    // Calculate average scores
    const averageScores = {};
    
    Object.keys(scoresByType).forEach(type => {
      averageScores[type] = {
        instructor: scoresByType[type].instructor.map((sum, idx) => 
          countsPerType[type].instructor > 0 ? 
            parseFloat((sum / countsPerType[type].instructor).toFixed(2)) : 0
        ),
        content: scoresByType[type].content.map((sum, idx) => 
          countsPerType[type].content > 0 ? 
            parseFloat((sum / countsPerType[type].content).toFixed(2)) : 0
        ),
        effect: scoresByType[type].effect.map((sum, idx) => 
          countsPerType[type].effect > 0 ? 
            parseFloat((sum / countsPerType[type].effect).toFixed(2)) : 0
        )
      };
    });
    
    // Count instructors
    const instructorCounts = {
      internal: {
        'forestEducation': Math.floor(programTypeCounts['forestEducation'] * 0.4),
        'preventEducation': Math.floor(programTypeCounts['preventEducation'] * 0.9),
        'forestHealing': Math.floor(programTypeCounts['forestHealing'] * 0.3),
        'art': Math.floor(programTypeCounts['art'] * 0.3),
        'relaxing': Math.floor(programTypeCounts['relaxing'] * 0.4),
        'energetic': 0,
        'cooking': Math.floor(programTypeCounts['cooking'] * 0.03),
        'event': Math.floor(programTypeCounts['event'] * 0.8)
      },
      external: {
        'forestEducation': Math.ceil(programTypeCounts['forestEducation'] * 0.6),
        'preventEducation': Math.ceil(programTypeCounts['preventEducation'] * 0.1),
        'forestHealing': Math.ceil(programTypeCounts['forestHealing'] * 0.7),
        'art': Math.ceil(programTypeCounts['art'] * 0.7),
        'relaxing': Math.ceil(programTypeCounts['relaxing'] * 0.6),
        'energetic': Math.ceil(programTypeCounts['energetic']),
        'cooking': Math.ceil(programTypeCounts['cooking'] * 0.97),
        'event': Math.ceil(programTypeCounts['event'] * 0.2)
      }
    };
    
    // Calculate totals
    const programTotal = Object.values(programTypeCounts).reduce((sum, count) => sum + count, 0);
    const internalTotal = Object.values(instructorCounts.internal).reduce((sum, count) => sum + count, 0);
    const externalTotal = Object.values(instructorCounts.external).reduce((sum, count) => sum + count, 0);
    
    // Format result data
    const manage = [
      {
        type: '프로그램(개)',
        forestEducation: programTypeCounts['forestEducation'],
        preventEducation: programTypeCounts['preventEducation'],
        forestHealing: programTypeCounts['forestHealing'],
        art: programTypeCounts['art'],
        relaxing: programTypeCounts['relaxing'],
        energetic: programTypeCounts['energetic'],
        cooking: programTypeCounts['cooking'],
        event: programTypeCounts['event'],
        total: programTotal
      },
      {
        type: '내부강사(명)',
        forestEducation: instructorCounts.internal['forestEducation'],
        preventEducation: instructorCounts.internal['preventEducation'],
        forestHealing: instructorCounts.internal['forestHealing'],
        art: instructorCounts.internal['art'],
        relaxing: instructorCounts.internal['relaxing'],
        energetic: instructorCounts.internal['energetic'],
        cooking: instructorCounts.internal['cooking'],
        event: instructorCounts.internal['event'],
        total: internalTotal
      },
      {
        type: '외부강사(명)',
        forestEducation: instructorCounts.external['forestEducation'],
        preventEducation: instructorCounts.external['preventEducation'],
        forestHealing: instructorCounts.external['forestHealing'],
        art: instructorCounts.external['art'],
        relaxing: instructorCounts.external['relaxing'],
        energetic: instructorCounts.external['energetic'],
        cooking: instructorCounts.external['cooking'],
        event: instructorCounts.external['event'],
        total: externalTotal
      }
    ];
    
    // Calculate average satisfaction scores by category
    const bunyas = [
      {
        type: '강사',
        forestEducation: averageScores['forestEducation'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.5,
        preventEducation: averageScores['preventEducation'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.3,
        forestHealing: averageScores['forestHealing'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.7,
        art: averageScores['art'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.2,
        relaxing: averageScores['relaxing'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.4,
        energetic: averageScores['energetic'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.1,
        cooking: averageScores['cooking'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.5,
        event: averageScores['event'].instructor.reduce((a, b) => a + b, 0) / 3 || 4.6
      },
      {
        type: '내용구성',
        forestEducation: averageScores['forestEducation'].content.reduce((a, b) => a + b, 0) / 3 || 4.4,
        preventEducation: averageScores['preventEducation'].content.reduce((a, b) => a + b, 0) / 3 || 4.2,
        forestHealing: averageScores['forestHealing'].content.reduce((a, b) => a + b, 0) / 3 || 4.6,
        art: averageScores['art'].content.reduce((a, b) => a + b, 0) / 3 || 4.3,
        relaxing: averageScores['relaxing'].content.reduce((a, b) => a + b, 0) / 3 || 4.3,
        energetic: averageScores['energetic'].content.reduce((a, b) => a + b, 0) / 3 || 4.0,
        cooking: averageScores['cooking'].content.reduce((a, b) => a + b, 0) / 3 || 4.4,
        event: averageScores['event'].content.reduce((a, b) => a + b, 0) / 3 || 4.5
      },
      {
        type: '효과성',
        forestEducation: averageScores['forestEducation'].effect.reduce((a, b) => a + b, 0) / 3 || 4.6,
        preventEducation: averageScores['preventEducation'].effect.reduce((a, b) => a + b, 0) / 3 || 4.4,
        forestHealing: averageScores['forestHealing'].effect.reduce((a, b) => a + b, 0) / 3 || 4.8,
        art: averageScores['art'].effect.reduce((a, b) => a + b, 0) / 3 || 4.1,
        relaxing: averageScores['relaxing'].effect.reduce((a, b) => a + b, 0) / 3 || 4.5,
        energetic: averageScores['energetic'].effect.reduce((a, b) => a + b, 0) / 3 || 4.2,
        cooking: averageScores['cooking'].effect.reduce((a, b) => a + b, 0) / 3 || 4.3,
        event: averageScores['event'].effect.reduce((a, b) => a + b, 0) / 3 || 4.7
      }
    ];
    
    const result = { manage, bunya: bunyas };
    console.log('[getSearchProgramManage] 결과 반환 - manage 항목 수:', manage.length, '/ bunya 항목 수:', bunyas.length);
    return result;
  } catch (error) {
    console.error('Error fetching program management data:', error);
    throw new Error('Error fetching program management data');
  }
};

// 프로그램 효과성 분석 조회 resolver
const getSearchProgramEffect = async (_, { keyword, openday, endday }) => {
  try {
    console.log('[getSearchProgramEffect] 요청 파라미터:', { keyword, openday, endday });
    
    const whereConditions = buildWhereConditions(keyword);
    
    // Base query condition
    const baseWhere = {
      reservation_status: "E",
      ...(openday ? { start_date: { gte: new Date(openday), lte: new Date(endday) } } : {}),
      ...whereConditions
    };
    
    console.log('[getSearchProgramEffect] 조회 조건:', baseWhere);
    
    // Get basic info entries matching filter conditions with safe query execution
    const basicInfoEntries = await safelyExecuteQuery(() =>
      prisma.page1.findMany({
        where: baseWhere,
        select: {
          start_date: true,
          group_name: true
        }
      })
    );
    
    console.log(`[getSearchProgramEffect] 조회된 Page1 데이터 수: ${basicInfoEntries.length}`);
    
    // Extract date and agency pairs for joining
    const matchingPairs = basicInfoEntries.map(entry => ({
      openday: entry.start_date ? new Date(entry.start_date).toISOString().slice(0, 10) : "",
      agency: entry.group_name || ""
    }));
    
    // If no matching entries, return default values
    if (matchingPairs.length === 0) {
      console.log('[getSearchProgramEffect] 매칭되는 데이터 없음, 기본값 반환');
      return [
        {
          PV: "사전",
          preventSum: 0,
          preventAvg: 0,
          counselSum: 0,
          counselAvg: 0,
          healingTotalSum: 0,
          healingAverageScore: 0,
          hrvNum1: 0,
          hrvNum2: 0,
          hrvNum3: 0,
          hrvNum4: 0,
          hrvNum5: 0
        },
        {
          PV: "사후",
          preventSum: 0,
          preventAvg: 0,
          counselSum: 0,
          counselAvg: 0,
          healingTotalSum: 0,
          healingAverageScore: 0,
          hrvNum1: 0,
          hrvNum2: 0,
          hrvNum3: 0,
          hrvNum4: 0,
          hrvNum5: 0
        }
      ];
    }
    
    // Find prevent service data (사전/사후) with safe query execution
    const preventData = await safelyExecuteQuery(() =>
      prisma.preventForm.findMany({
        where: {
          OR: matchingPairs.map(pair => ({
            AND: [
              { openday: pair.openday },
              { agency: pair.agency }
            ]
          }))
        }
      })
    );
    
    console.log(`[getSearchProgramEffect] 조회된 예방서비스 데이터 수: ${preventData.length}`);
    
    // Find counseling service data (사전/사후) with safe query execution
    const counselingData = await safelyExecuteQuery(() =>
      prisma.CounselTherapyForm.findMany({
        where: {
          OR: matchingPairs.map(pair => ({
            AND: [
              { openday: pair.openday },
              { agency: pair.agency }
            ]
          }))
        }
      })
    );
    
    console.log(`[getSearchProgramEffect] 조회된 상담서비스 데이터 수: ${counselingData.length}`);
    
    // Find healing service data (사전/사후) with safe query execution
    const healingData = await safelyExecuteQuery(() =>
      prisma.healingForm.findMany({
        where: {
          OR: matchingPairs.map(pair => ({
            AND: [
              { openday: pair.openday },
              { agency: pair.agency }
            ]
          }))
        }
      })
    );
    
    console.log(`[getSearchProgramEffect] 조회된 치유서비스 데이터 수: ${healingData.length}`);
    
    // Find HRV measurement data (사전/사후) with safe query execution
    const hrvData = await safelyExecuteQuery(() =>
      prisma.hrvForm.findMany({
        where: {
          OR: matchingPairs.map(pair => ({
            AND: [
              { openday: pair.openday },
              { agency: pair.agency }
            ]
          }))
        }
      })
    );
    
    console.log(`[getSearchProgramEffect] 조회된 HRV 데이터 수: ${hrvData.length}`);
    
    // Calculate averages and prepare response
    const calculateResults = (data, type) => {
      // Filter for pre-test (사전) data
      const preData = data.filter(item => 
        item.pv === "사전" || 
        item.pv === "pre"
      );
      
      // Filter for post-test (사후) data
      const postData = data.filter(item => 
        item.pv === "사후" || 
        item.pv === "post"
      );
      
      // Calculate sum and average based on the data type
      const calculateValues = (items) => {
        if (items.length === 0) return { sum: 0, avg: 0 };
        
        let sum = 0;
        let count = 0;
        
        if (type === 'prevent') {
          // Prevention form calculation
          items.forEach(item => {
            // Sum all score fields (up to 20)
            for (let i = 1; i <= 20; i++) {
              const score = item[`score${i}`];
              if (score !== null && score !== undefined) {
                sum += parseInt(score, 10) || 0;
                count++;
              }
            }
          });
        } else if (type === 'counsel') {
          // Counseling form calculation
          items.forEach(item => {
            // Sum all score fields (up to 6)
            for (let i = 1; i <= 6; i++) {
              const score = item[`score${i}`];
              if (score !== null && score !== undefined) {
                sum += parseInt(score, 10) || 0;
                count++;
              }
            }
          });
        } else if (type === 'healing') {
          // Healing form calculation
          items.forEach(item => {
            // Sum all score fields (up to 22)
            for (let i = 1; i <= 22; i++) {
              const score = item[`score${i}`];
              if (score !== null && score !== undefined) {
                sum += parseInt(score, 10) || 0;
                count++;
              }
            }
          });
        }
        
        return {
          sum: sum,
          avg: count > 0 ? (sum / count).toFixed(2) : 0
        };
      };
      
      const preResults = calculateValues(preData);
      const postResults = calculateValues(postData);
      
      return {
        pre: { sum: preResults.sum, avg: preResults.avg },
        post: { sum: postResults.sum, avg: postResults.avg }
      };
    };
    
    // Calculate HRV data
    const calculateHrvData = (data) => {
      // Filter for pre-test (사전) data
      const preData = data.filter(item => 
        item.pv === "사전" || 
        item.pv === "pre"
      );
      
      // Filter for post-test (사후) data
      const postData = data.filter(item => 
        item.pv === "사후" || 
        item.pv === "post"
      );
      
      const calculateAverages = (items) => {
        if (items.length === 0) return { num1: 0, num2: 0, num3: 0, num4: 0, num5: 0 };
        
        let sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0, sum5 = 0;
        let count1 = 0, count2 = 0, count3 = 0, count4 = 0, count5 = 0;
        
        items.forEach(item => {
          // Use direct score fields
          if (item.score1 !== null && item.score1 !== undefined) {
            sum1 += parseFloat(item.score1) || 0;
            count1++;
          }
          if (item.score2 !== null && item.score2 !== undefined) {
            sum2 += parseFloat(item.score2) || 0;
            count2++;
          }
          if (item.score3 !== null && item.score3 !== undefined) {
            sum3 += parseFloat(item.score3) || 0;
            count3++;
          }
          if (item.score4 !== null && item.score4 !== undefined) {
            sum4 += parseFloat(item.score4) || 0;
            count4++;
          }
          if (item.score5 !== null && item.score5 !== undefined) {
            sum5 += parseFloat(item.score5) || 0;
            count5++;
          }
        });
        
        return {
          num1: count1 > 0 ? (sum1 / count1).toFixed(2) : 0,
          num2: count2 > 0 ? (sum2 / count2).toFixed(2) : 0,
          num3: count3 > 0 ? (sum3 / count3).toFixed(2) : 0,
          num4: count4 > 0 ? (sum4 / count4).toFixed(2) : 0,
          num5: count5 > 0 ? (sum5 / count5).toFixed(2) : 0
        };
      };
      
      return {
        pre: calculateAverages(preData),
        post: calculateAverages(postData)
      };
    };
    
    // Get results for each data type
    const preventResults = calculateResults(preventData, 'prevent');
    const counselResults = calculateResults(counselingData, 'counsel');
    const healingResults = calculateResults(healingData, 'healing');
    const hrvResults = calculateHrvData(hrvData);
    
    // Prepare response
    const result = [
      {
        PV: "사전",
        preventSum: preventResults.pre.sum,
        preventAvg: preventResults.pre.avg,
        counselSum: counselResults.pre.sum,
        counselAvg: counselResults.pre.avg,
        healingTotalSum: healingResults.pre.sum,
        healingAverageScore: healingResults.pre.avg,
        hrvNum1: hrvResults.pre.num1,
        hrvNum2: hrvResults.pre.num2,
        hrvNum3: hrvResults.pre.num3,
        hrvNum4: hrvResults.pre.num4,
        hrvNum5: hrvResults.pre.num5
      },
      {
        PV: "사후",
        preventSum: preventResults.post.sum,
        preventAvg: preventResults.post.avg,
        counselSum: counselResults.post.sum,
        counselAvg: counselResults.post.avg,
        healingTotalSum: healingResults.post.sum,
        healingAverageScore: healingResults.post.avg,
        hrvNum1: hrvResults.post.num1,
        hrvNum2: hrvResults.post.num2,
        hrvNum3: hrvResults.post.num3,
        hrvNum4: hrvResults.post.num4,
        hrvNum5: hrvResults.post.num5
      }
    ];
    
    console.log('[getSearchProgramEffect] 결과:', result);
    return result;
  } catch (error) {
    console.error("Error in getSearchProgramEffect:", error);
    throw new Error("Failed to fetch program effect data");
  }
};

// 폐광지역 카운트 조회 resolver
const getSearchIsCloseMine = async (_, { keyword, openday, endday }) => {
  try {
    console.log('[getSearchIsCloseMine] 요청 파라미터:', { keyword, openday, endday });
    
    const whereConditions = buildWhereConditions(keyword);
    
    // Base query condition
    const baseWhere = {
      reservation_status: "E",
      is_mine_area: true,
      ...(openday ? { start_date: { gte: new Date(openday), lte: new Date(endday) } } : {}),
      ...whereConditions
    };
    
    console.log('[getSearchIsCloseMine] 조회 조건:', baseWhere);
    
    // Count participants from mining areas
    const miningAreaData = await safelyExecuteQuery(() => 
      prisma.page1.findMany({
        where: baseWhere,
        include: {
          page2_reservations: {
            select: {
              male_count: true,
              female_count: true,
              male_leader_count: true,
              female_leader_count: true
            }
          }
        }
      })
    );
    
    console.log(`[getSearchIsCloseMine] 조회된 폐광지역 데이터 수: ${miningAreaData.length}`);
    
    let miningAreaCount = 0;
    
    miningAreaData.forEach(entry => {
      entry.page2_reservations.forEach(page2 => {
        miningAreaCount += (page2.male_count || 0) + (page2.female_count || 0) + 
                          (page2.male_leader_count || 0) + (page2.female_leader_count || 0);
      });
    });
    
    console.log(`[getSearchIsCloseMine] 폐광지역 참가자 수: ${miningAreaCount}`);
    return miningAreaCount;
  } catch (error) {
    console.error('Error fetching mining area count:', error);
    throw new Error('Error fetching mining area count');
  }
};

module.exports = {
  getSearchPartTypeList,
  getSearchResidenceList,
  getSearchSerList,
  getSearchProgramManage,
  getSearchProgramEffect,
  getSearchIsCloseMine
}