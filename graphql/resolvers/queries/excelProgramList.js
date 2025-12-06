const prisma = require('../../../prisma/prismaClient');


// 배열의 특정 필드 평균을 계산하는 유틸리티 함수 - 항상 숫자를 반환하도록 수정
function calculateAverage(entries, field) {
  if (!entries || entries.length === 0) return 0;
  
  const validValues = entries
    .map(entry => entry[field])
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(value => Number(value));
  
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((a, b) => a + b, 0);
  return Number((sum / validValues.length).toFixed(2));
}
// 엑셀 데이터 리졸버
module.exports = {
 
    excelProgramList: async (_, { openday, endday }, { prisma }) => {
      try {
        // sheet1 - 프로그램 목록 데이터 구성
        const programFormData = await prisma.programForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          },
          distinct: ['openday', 'agency'],
          orderBy: [
            { openday: 'asc' },
            { agency: 'asc' }
          ]
        });

        // 각 program form에 대한 프로그램 목록 정보 결합
        const sheet1 = await Promise.all(programFormData.map(async (pForm) => {
          // 해당 agency와 openday에 대한 프로그램 정보 가져오기
          const programs = await prisma.programForm.findMany({
            where: {
              agency: pForm.agency,
              openday: pForm.openday
            },
            select: {
              ptcprogram: true,
              program_category_id: true,
              teacher_id: true
            }
          });

          // 프로그램 세부 정보 조회
          const programDetails = await Promise.all(programs.map(async (prog) => {
            let category = '';
            let teacher = '';
            
            if (prog.program_category_id) {
              const categoryData = await prisma.programCategory.findUnique({
                where: { id: prog.program_category_id }
              });
              if (categoryData) category = categoryData.category_name;
            }
            
            if (prog.teacher_id) {
              const teacherData = await prisma.instructor.findUnique({
                where: { id: prog.teacher_id }
              });
              if (teacherData) teacher = teacherData.name;
            }
            
            return `${prog.ptcprogram},${category},${teacher}`;
          }));

          // 프로그램 정보 문자열로 결합
          return {
            OPENDAY: pForm.openday,
            AGENCY: pForm.agency,
            PROGRAM_IN_OUT: programDetails.join(',')
          };
        }));

        // sheet2 - 운영현황 데이터 구성
        const programFormGroups = await prisma.programForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          },
          distinct: ['openday', 'agency'],
          orderBy: [
            { openday: 'asc' },
            { agency: 'asc' }
          ]
        });

        const sheet2 = await Promise.all(programFormGroups.map(async (pForm) => {
          // 참가자 수 계산
          const participants = await prisma.userTemp.count({
            where: {
              agency: pForm.agency,
              openday: pForm.openday
            }
          });

          // 지역 정보 가져오기
          const userTempWithResidence = await prisma.userTemp.findFirst({
            where: {
              agency: pForm.agency,
              openday: pForm.openday
            },
            select: {
              residence: true
            }
          });

          const date = new Date(pForm.openday);
          
          return {
            OPENDAY: pForm.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            BUSINESS: 'forest',
            AGENCY: pForm.agency,
            REGION: userTempWithResidence?.residence || '',
            ORG_TYPE: 'Social',
            PART_FORM: 'Full',
            AGE_TYPE: 'Adult',
            PART_TYPE: 'General',
            SERVICE_TYPE: 'Healing',
            STAYDAYS: '1',
            PART_COUNT: Math.floor(participants),
            PEOPLE_COUNT: Math.floor(participants),
            MINE_AREA: 'Y',
            OM: 'Manager',
            EXPENSE: '0'
          };
        }));

        // sheet3 - 프로그램현황 데이터 구성
        const programForms = await prisma.programForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          }
        });

        const sheet3 = await Promise.all(programForms.map(async (pForm) => {
          // 분야(category) 정보 가져오기
          let bunya = '';
          if (pForm.program_category_id) {
            const category = await prisma.programCategory.findUnique({
              where: { id: pForm.program_category_id }
            });
            if (category) bunya = category.category_name;
          }

          // 강사 정보 가져오기
          let teacher = '';
          if (pForm.teacher_id) {
            const instructorData = await prisma.instructor.findUnique({
              where: { id: pForm.teacher_id }
            });
            if (instructorData) teacher = instructorData.name;
          }

          // 점수 필드들 - 이제 entries가 아닌 직접 form에서 가져옴
          return {
            OPENDAY: pForm.openday,
            AGENCY: pForm.agency,
            PROGRAM_NAME: pForm.ptcprogram,
            BUNYA: bunya,
            TEACHER: teacher,
            row_count: 1, // 각 폼은 이제 하나의 엔트리만 있으므로 1로 설정
            avg_score1: Number(pForm.score1 || 0),
            avg_score2: Number(pForm.score2 || 0),
            avg_score3: Number(pForm.score3 || 0),
            avg_score4: Number(pForm.score4 || 0),
            avg_score5: Number(pForm.score5 || 0),
            avg_score6: Number(pForm.score6 || 0),
            avg_score7: Number(pForm.score7 || 0),
            avg_score8: Number(pForm.score8 || 0),
            avg_score9: Number(pForm.score9 || 0)
          };
        }));

        // sheet4 - 강사현황 데이터 구성
        // 강사별 프로그램 그룹화 및 평가 점수 산출
        const teacherGroups = [];
        const teacherProgramMap = new Map();

        // 프로그램별 강사 데이터 그룹화
        for (const program of programForms) {
          if (!program.teacher_id) continue;
          
          const key = `${program.teacher_id}-${program.ptcprogram}`;
          if (!teacherProgramMap.has(key)) {
            teacherProgramMap.set(key, {
              teacherId: program.teacher_id,
              programName: program.ptcprogram,
              forms: [] // entries 대신 forms로 이름 변경
            });
          }
          
          // 프로그램 폼 자체를 저장
          teacherProgramMap.get(key).forms.push(program);
        }

        // 그룹화된 데이터에서 평균 계산
        for (const [_, data] of teacherProgramMap) {
          const instructorData = await prisma.instructor.findUnique({
            where: { id: data.teacherId }
          });

          const teacherName = instructorData ? instructorData.name : '';
          const forms = data.forms; // forms로 이름 변경
          
          // 각 점수 필드의 평균 계산
          const avg1 = forms.reduce((sum, form) => sum + Number(form.score1 || 0), 0) / forms.length;
          const avg2 = forms.reduce((sum, form) => sum + Number(form.score2 || 0), 0) / forms.length;
          const avg3 = forms.reduce((sum, form) => sum + Number(form.score3 || 0), 0) / forms.length;
          const avg_avg1 = ((avg1 + avg2 + avg3) / 3).toFixed(2);
          
          const avg4 = forms.reduce((sum, form) => sum + Number(form.score4 || 0), 0) / forms.length;
          const avg5 = forms.reduce((sum, form) => sum + Number(form.score5 || 0), 0) / forms.length;
          const avg6 = forms.reduce((sum, form) => sum + Number(form.score6 || 0), 0) / forms.length;
          const avg_avg2 = ((avg4 + avg5 + avg6) / 3).toFixed(2);
          
          const avg7 = forms.reduce((sum, form) => sum + Number(form.score7 || 0), 0) / forms.length;
          const avg8 = forms.reduce((sum, form) => sum + Number(form.score8 || 0), 0) / forms.length;
          const avg9 = forms.reduce((sum, form) => sum + Number(form.score9 || 0), 0) / forms.length;
          const avg_avg3 = ((avg7 + avg8 + avg9) / 3).toFixed(2);
          
          const total_avg = ((avg1 + avg2 + avg3 + avg4 + avg5 + avg6 + avg7 + avg8 + avg9) / 9).toFixed(2);
          
          teacherGroups.push({
            TEACHER: teacherName,
            PROGRAM_NAME: data.programName,
            avg_score1: Number(avg1.toFixed(2)),
            avg_score2: Number(avg2.toFixed(2)),
            avg_score3: Number(avg3.toFixed(2)),
            avg_avg1: Number(avg_avg1),
            avg_score4: Number(avg4.toFixed(2)),
            avg_score5: Number(avg5.toFixed(2)),
            avg_score6: Number(avg6.toFixed(2)),
            avg_avg2: Number(avg_avg2),
            avg_score7: Number(avg7.toFixed(2)),
            avg_score8: Number(avg8.toFixed(2)),
            avg_score9: Number(avg9.toFixed(2)),
            avg_avg3: Number(avg_avg3),
            total_avg: Number(total_avg)
          });
        }

        const sheet4 = teacherGroups;

        // sheet5 - 시설서비스만족도 데이터 구성
        const serviceForms = await prisma.serviceForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          }
        });
        
        const sheet5 = serviceForms.map(sf => {
          const date = new Date(sf.openday);
          
          // 점수 필드들 가져오기
          const roomConvenience = Number(sf.score1 || 0);
          const roomClean = Number(sf.score2 || 0);
          const restaurantConvenience = Number(sf.score3 || 0);
          const restaurantClean = Number(sf.score4 || 0);
          const programPlaceConvenience = Number(sf.score5 || 0);
          const programPlaceClean = Number(sf.score6 || 0);
          const programPlaceProper = Number(sf.score7 || 0);
          const forestConvenience = Number(sf.score8 || 0);
          const forestClean = Number(sf.score9 || 0);
          const forestProper = Number(sf.score10 || 0);
          const operationMethod = Number(sf.score16 || 0);
          const operationTime = Number(sf.score17 || 0);
          const operationKindness = Number(sf.score18 || 0);
          const mealFresh = Number(sf.score21 || 0);
          const mealDiversity = Number(sf.score22 || 0);
          const mealNutrition = Number(sf.score23 || 0);

          // 총 평균 계산
          const total = [
            roomConvenience, roomClean,
            restaurantConvenience, restaurantClean,
            programPlaceConvenience, programPlaceClean, programPlaceProper,
            forestConvenience, forestClean, forestProper,
            operationMethod, operationTime, operationKindness,
            mealFresh, mealDiversity, mealNutrition
          ].filter(val => val > 0);
          
          const totalAvg = total.length > 0 ? (total.reduce((a, b) => a + b, 0) / total.length).toFixed(2) : "0.00";
          
          return {
            OPENDAY: sf.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            AGENCY: sf.agency,
            PART_COUNT: 1, // Each form is one entry now
            ROOM_CONVENIENCE: roomConvenience,
            ROOM_CLEAN: roomClean,
            RESTAURANT_CONVENIENCE: restaurantConvenience,
            RESTAURANT_CLEAN: restaurantClean,
            PROGRAM_PLACE_CONVENIENCE: programPlaceConvenience,
            PROGRAM_PLACE_CLEAN: programPlaceClean,
            PROGRAM_PLACE_PROPER: programPlaceProper,
            FOREST_CONVENIENCE: forestConvenience,
            FOREST_CLEAN: forestClean,
            FOREST_PROPER: forestProper,
            OPERATION_METHOD: operationMethod,
            OPERATION_TIME: operationTime,
            OPERATION_KINDNESS: operationKindness,
            MEAL_FRESH: mealFresh,
            MEAL_DIVERSITY: mealDiversity,
            MEAL_NUTRITION: mealNutrition,
            TOTAL_AVG: Number(totalAvg)
          };
        });

        // sheet6 - 효과성분석(힐링효과) 데이터 구성
        const healingForms = await prisma.healingForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          }
        });
        
        const sheet6 = healingForms.map(hf => {
          const date = new Date(hf.openday);
          const healingScore = Number(hf.score1 || 0);
          
          return {
            OPENDAY: hf.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            AGENCY: hf.agency,
            PART_COUNT: 1, // Each form is one entry now
            TYPE: 'healing',
            HEALING_SUM: healingScore,
            HEALING_AVG: healingScore // With one entry, sum and avg are the same
          };
        });

        // sheet7 - 효과성분석(예방효과) 데이터 구성
        const preventForms = await prisma.preventForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          }
        });
        
        const sheet7 = preventForms.map(pf => {
          const date = new Date(pf.openday);
          const beforeScore = Number(pf.score1 || 0);
          const afterScore = Number(pf.score10 || 0);
          const changeScore = afterScore - beforeScore;
          
          return {
            OPENDAY: pf.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            AGENCY: pf.agency,
            PART_COUNT: 1, // Each form is one entry now
            TYPE: 'prevent',
            PREVENTION_BEFORE: beforeScore,
            PREVENTION_AFTER: afterScore,
            PREVENTION_CHANGE: changeScore
          };
        });

        // sheet8 - 효과성분석(상담치유) 데이터 구성
        const counselForms = await prisma.counselTherapyForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          }
        });
        
        const sheet8 = counselForms.map(cf => {
          const date = new Date(cf.openday);
          const beforeScore = Number(cf.score1 || 0);
          const afterScore = Number(cf.score6 || 0);
          
          return {
            OPENDAY: cf.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            AGENCY: cf.agency,
            PART_COUNT: 1, // Each form is one entry now
            TYPE: 'counsel',
            COUNSEL_BEFORE: beforeScore,
            COUNSEL_AFTER: afterScore
          };
        });

        // sheet9 - 효과성분석(자율신경) 데이터 구성
        const hrvForms = await prisma.hrvForm.findMany({
          where: {
            openday: {
              gte: openday,
              lte: endday
            }
          }
        });
        
        const sheet9 = hrvForms.map(hf => {
          const date = new Date(hf.openday);
          
          return {
            OPENDAY: hf.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            AGENCY: hf.agency,
            PART_COUNT: 1, // Each form is one entry now
            TYPE: 'hrv',
            ANS_ACTIVITY: Number(hf.score1 || 0),
            ANS_BALANCE: Number(hf.score2 || 0),
            STRESS_RESISTANCE: Number(hf.score3 || 0),
            STRESS_INDEX: Number(hf.score4 || 0),
            FATIGUE: Number(hf.score5 || 0)
          };
        });

        // sheet10 - 강의횟수 데이터 구성
        // 강사별 프로그램 진행 횟수 계산
        const teacherProgramCount = new Map();
        
        for (const program of programForms) {
          if (!program.teacher_id || !program.ptcprogram) continue;
          
          const key = `${program.teacher_id}-${program.ptcprogram}-${program.program_category_id || 'none'}`;
          
          if (!teacherProgramCount.has(key)) {
            // 강사 및 분야 정보 조회
            let teacherName = '';
            let categoryName = '';
            
            const instructorData = await prisma.instructor.findUnique({
              where: { id: program.teacher_id }
            });
            if (instructorData) teacherName = instructorData.name;
            
            if (program.program_category_id) {
              const categoryData = await prisma.programCategory.findUnique({
                where: { id: program.program_category_id }
              });
              if (categoryData) categoryName = categoryData.category_name;
            }
            
            teacherProgramCount.set(key, {
              TEACHER: teacherName,
              PROGRAM_NAME: program.ptcprogram,
              BUNYA: categoryName,
              count: 0
            });
          }
          
          // 카운트 증가
          teacherProgramCount.get(key).count += 1;
        }
        
        // Map을 배열로 변환
        const sheet10 = Array.from(teacherProgramCount.values()).map(item => ({
          TEACHER: item.TEACHER,
          PROGRAM_NAME: item.PROGRAM_NAME,
          BUNYA: item.BUNYA,
          CNT: Math.floor(item.count)
        }));

        // sheet11 - 프로그램현황(미실행포함) 데이터 구성 (sheet3와 유사하지만 장소 정보 포함)
        const sheet11 = await Promise.all(programForms.map(async (pForm) => {
          // 분야(category) 정보 가져오기
          let bunya = '';
          if (pForm.program_category_id) {
            const category = await prisma.programCategory.findUnique({
              where: { id: pForm.program_category_id }
            });
            if (category) bunya = category.category_name;
          }

          // 강사 정보 가져오기
          let teacher = '';
          if (pForm.teacher_id) {
            const instructorData = await prisma.instructor.findUnique({
              where: { id: pForm.teacher_id }
            });
            if (instructorData) teacher = instructorData.name;
          }

          const date = new Date(pForm.openday);
          return {
            OPENDAY: pForm.openday,
            YEAR: Math.floor(date.getFullYear()),
            MONTH: Math.floor(date.getMonth() + 1),
            DAY: Math.floor(date.getDate()),
            AGENCY: pForm.agency,
            BUNYA: bunya,
            PROGRAM_NAME: pForm.ptcprogram,
            TEACHER: teacher,
            PLACE: pForm.place || '',
            PART_COUNT: 1,
            avg_score1: Number(pForm.score1 || 0),
            avg_score2: Number(pForm.score2 || 0),
            avg_score3: Number(pForm.score3 || 0),
            avg_score4: Number(pForm.score4 || 0),
            avg_score5: Number(pForm.score5 || 0),
            avg_score6: Number(pForm.score6 || 0),
            avg_score7: Number(pForm.score7 || 0),
            avg_score8: Number(pForm.score8 || 0),
            avg_score9: Number(pForm.score9 || 0)
          };
        }));

        // 모든 데이터를 객체로 반환
        return {
          sheet1,
          sheet2,
          sheet3,
          sheet4,
          sheet5,
          sheet6,
          sheet7,
          sheet8,
          sheet9,
          sheet10,
          sheet11
        };
      } catch (error) {
        console.error('Excel data fetch error:', error);
        throw new Error('엑셀 데이터를 가져오는 중 오류가 발생했습니다.');
      }
    }
};



