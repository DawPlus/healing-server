import React, { useMemo } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

// 프로그램 만족도
const ProgramSatisfaction = ({ data = {} }) => {
  // Get program forms and categories data
  const programForms = data.programForms || [];
  const programCategories = data.programCategories || [];
  const programItems = data.programItems || [];
  const instructors = data.instructors || [];
  const basicInfo = data.basicInfo || {};
  const programSatisfactionData = data.programSatisfaction || [];
  const PROGRAM_IN_OUT = basicInfo.PROGRAM_IN_OUT || '';

  // page2 프로그램 목록 데이터 추가
  const page2Programs = data.programs || [];





  // Log programForms detail for debugging
  if (programForms.length > 0) {
    programForms.slice(0, 3).forEach((form, idx) => {
 
    });
    
    // 점수 통계 디버깅
    const scoreStats = {
      score1: { min: Number.MAX_VALUE, max: Number.MIN_VALUE, sum: 0, count: 0 },
      score4: { min: Number.MAX_VALUE, max: Number.MIN_VALUE, sum: 0, count: 0 },
      score7: { min: Number.MAX_VALUE, max: Number.MIN_VALUE, sum: 0, count: 0 }
    };
    
    programForms.forEach(form => {
      ['score1', 'score4', 'score7'].forEach(scoreField => {
        const scoreValue = parseFloat(form[scoreField]);
        if (!isNaN(scoreValue)) {
          scoreStats[scoreField].min = Math.min(scoreStats[scoreField].min, scoreValue);
          scoreStats[scoreField].max = Math.max(scoreStats[scoreField].max, scoreValue);
          scoreStats[scoreField].sum += scoreValue;
          scoreStats[scoreField].count++;
        }
      });
    });
    
    // 평균 계산
    Object.keys(scoreStats).forEach(key => {
      if (scoreStats[key].count > 0) {
        scoreStats[key].avg = scoreStats[key].sum / scoreStats[key].count;
      } else {
        scoreStats[key].min = 0;
        scoreStats[key].avg = 0;
      }
    });
    
  } else {
  }

  // If there's programSatisfactionData, log it for debugging
  if (programSatisfactionData.length > 0) {
    programSatisfactionData.slice(0, 3).forEach((item, idx) => {
  
    });
  } else {
  }

  // Build map of program items by ID for quick lookup
  const programItemsMap = useMemo(() => {
    const map = {};
    programItems.forEach(item => {
      map[item.id] = item;
    });
    return map;
  }, [programItems]);

  // Build map of categories by ID for quick lookup
  const categoriesMap = useMemo(() => {
    const map = {};
    programCategories.forEach(category => {
      map[category.id] = category;
    });
    return map;
  }, [programCategories]);

  // Build map of instructors by ID for quick lookup
  const instructorsMap = useMemo(() => {
    const map = {};
    instructors.forEach(instructor => {
      map[instructor.id] = instructor;
    });
    return map;
  }, [instructors]);

  // Process program forms to get satisfaction data
  const combinedSatisfactionData = useMemo(() => {
    
    // 1. page2 프로그램 목록을 기본으로 만족도 구조 생성 (항상 기본으로 사용)
    const baseSatisfactionData = [];
    
    if (page2Programs.length > 0) {
      
      page2Programs.forEach(program => {
        const programName = program.program_name || '프로그램';
        const categoryName = program.category_name || '미분류';
        const instructorName = program.instructor_name || '담당강사';
        
        // 기본적으로 참여자만 생성
        baseSatisfactionData.push({
          PROGRAM_NAME: programName,
          BUNYA: categoryName,
          TEACHER: instructorName,
          type: '참여자',
          score1: '0',
          score4: '0',
          score7: '0',
          cnt: 0
        });
      });
      
    } else {
      
      // page2 프로그램이 없으면 PROGRAM_IN_OUT 파싱으로 대체
      if (PROGRAM_IN_OUT && PROGRAM_IN_OUT !== '') {
        
        const programList = PROGRAM_IN_OUT.split(',').reduce((acc, curr, idx) => {
          const rowNumber = Math.floor(idx / 5);
          if (!acc[rowNumber]) {
            acc[rowNumber] = { id: rowNumber + 1 };
          }
          const colName = ['programName', 'col1', 'col2', 'col3', 'col4'][idx % 5];
          acc[rowNumber][colName] = curr;
          return acc;
        }, []);
        
        programList.forEach(program => {
          baseSatisfactionData.push({
            PROGRAM_NAME: program.programName || '프로그램',
            BUNYA: '미분류',
            TEACHER: '담당강사',
            type: '참여자',
            score1: '0',
            score4: '0',
            score7: '0',
            cnt: 0
          });
        });
        
      }
    }
    
    // 기본 구조가 없으면 빈 배열 반환
    if (baseSatisfactionData.length === 0) {
      return [];
    }
    
    // 2. 서버에서 전달받은 programSatisfactionData가 있으면 매칭하여 업데이트
    if (programSatisfactionData.length > 0) {

      programSatisfactionData.forEach(serverData => {
        
        // 참여구분 정규화 ('참가자' -> '참여자')
        const normalizedType = serverData.type === '참가자' ? '참여자' : serverData.type;
        
        // 기본 구조에서 매칭되는 항목 찾기
        const matchingIndex = baseSatisfactionData.findIndex(baseItem => 
          baseItem.PROGRAM_NAME === serverData.PROGRAM_NAME &&
          baseItem.BUNYA === serverData.BUNYA &&
          baseItem.TEACHER === serverData.TEACHER &&
          baseItem.type === normalizedType
        );
        
        
        if (matchingIndex !== -1) {
          // 매칭되는 항목이 있으면 서버 데이터로 업데이트
          baseSatisfactionData[matchingIndex] = {
            ...baseSatisfactionData[matchingIndex],
            score1: serverData.score1 || '0',
            score4: serverData.score4 || '0',
            score7: serverData.score7 || '0',
            cnt: serverData.cnt || 0
          };

        } else {
          // 매칭되지 않는 모든 서버 데이터를 새 항목으로 추가
          baseSatisfactionData.push({
            PROGRAM_NAME: serverData.PROGRAM_NAME,
            BUNYA: serverData.BUNYA,
            TEACHER: serverData.TEACHER,
            type: serverData.type, // 원본 타입 사용 (참가자, 인솔자, 미기재 등)
            score1: serverData.score1 || '0',
            score4: serverData.score4 || '0',
            score7: serverData.score7 || '0',
            cnt: serverData.cnt || 0
          });
        }
      });
      
    }
    
    // 3. programForms에서 실제 설문 결과가 있는 경우 기본 구조에 매칭하여 업데이트
    if (programForms.length > 0) {
      
      // 설문 결과를 프로그램별, 타입별로 그룹화
      const formGroups = {};
      
      programForms.forEach(form => {
        const programId = form.program_id;
      const type = form.type || '참여자';
      
        const programItem = programItemsMap[programId];
        if (!programItem) return;
        
        const category = categoriesMap[form.program_category_id];
        const instructor = instructorsMap[form.teacher_id];
        
        const programName = programItem.program_name || '프로그램';
        const categoryName = category?.category_name || '미분류';
        const instructorName = instructor?.name || form.teacher_name || '담당강사';
        
        // 참여구분 정규화 ('참가자' -> '참여자')
        const normalizedType = type === '참가자' ? '참여자' : type;
        
        const key = `${programName}_${categoryName}_${instructorName}_${normalizedType}`;
        
        if (!formGroups[key]) {
          formGroups[key] = {
            programName,
            categoryName,
            instructorName,
            type: normalizedType,
            forms: []
          };
        }
        
        formGroups[key].forms.push(form);
      });
      
      // 기본 구조의 각 항목에 대해 매칭되는 설문 결과가 있으면 업데이트
      baseSatisfactionData.forEach((item, index) => {
        const key = `${item.PROGRAM_NAME}_${item.BUNYA}_${item.TEACHER}_${item.type}`;
        const matchingGroup = formGroups[key];
        
        if (matchingGroup && matchingGroup.forms.length > 0) {
          const forms = matchingGroup.forms;
          
          // 점수 계산
          const scores = { score1: 0, score4: 0, score7: 0 };
          
          [1, 4, 7].forEach(scoreNum => {
            const scoreKey = `score${scoreNum}`;
            const validScores = forms
              .map(form => parseFloat(form[scoreKey]))
              .filter(score => !isNaN(score) && score >= 0); // 0점도 유효한 점수로 포함
            
            if (validScores.length > 0) {
              scores[scoreKey] = (validScores.reduce((sum, val) => sum + val, 0) / validScores.length).toFixed(1);
            }
          });
          
          // 기본 항목 업데이트
          baseSatisfactionData[index] = {
            ...item,
            score1: scores.score1.toString(),
            score4: scores.score4.toString(),
            score7: scores.score7.toString(),
            cnt: forms.length
          };
          
        }
      });
    }
    
    
    // 프로그램명 가나다순으로 정렬, 같은 프로그램명 내에서는 참여구분(참여자 > 인솔자 > 미기재) 순으로 정렬
    const typeOrder = {
      '참여자': 1,
      '참가자': 1,
      '인솔자': 2,
      '미기재': 3,
    };

    baseSatisfactionData.sort((a, b) => {
      const nameCompare = a.PROGRAM_NAME.localeCompare(b.PROGRAM_NAME, 'ko');
      if (nameCompare !== 0) {
        return nameCompare;
      }
      
      const typeA = typeOrder[a.type] || 99;
      const typeB = typeOrder[b.type] || 99;
      return typeA - typeB;
    });
    
    return baseSatisfactionData;
  }, [page2Programs, programSatisfactionData, programForms, programItems, programCategories, instructors, PROGRAM_IN_OUT]);

  // PROGRAM_IN_OUT을 파싱하여 프로그램 목록 생성
  const _programList = PROGRAM_IN_OUT.split(',').reduce((acc, curr, idx) => {
    // 데이터가 비어있으면 빈 배열 반환
    if (!PROGRAM_IN_OUT || PROGRAM_IN_OUT === '') return [];
    
    const rowNumber = Math.floor(idx / 5);
    if (!acc[rowNumber]) {
      acc[rowNumber] = { id: rowNumber + 1 };
    }
    const colName = ['programName', 'col1', 'col2', 'col3', 'col4'][idx % 5];
    acc[rowNumber][colName] = curr;
    return acc;
  }, []);

  // 평균 계산 함수
  const calculateAverage = (inputObject) => {
    
    // 입력값을 숫자로 변환
    const numericValues = Object.values(inputObject).map(val => {
      const num = parseFloat(val);
      return !isNaN(num) ? num : 0;
    });
    
    // 유효한 값(0이 아닌)만 필터링
    const validValues = numericValues.filter(value => value !== 0);
    
    
    if (validValues.length === 0) {
      return "0";
    }
    
    // 합계 계산 및 평균 반환
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const average = sum / validValues.length;
    
    
    return average.toFixed(2);
  };



  combinedSatisfactionData.forEach(item => {
    // 각 항목별 점수
    const instructorScore = String(item.score1 || '0');
    const qualityScore = String(item.score4 || '0');
    const effectScore = String(item.score7 || '0');
      
    // 전체 평균
    const totalAvg = calculateAverage({
      score1: parseFloat(instructorScore),
      score4: parseFloat(qualityScore),
      score7: parseFloat(effectScore)
    });
      
 
  });
    

  return (
    <>
      <TableContainer style={{ marginTop: '20px' }}>
        <h3 className="tableTitle">프로그램만족도</h3>
        <Table className="report custom-table" style={{ 
          tableLayout: 'auto', 
          width: '100%',
          '@media print': {
            tableLayout: 'auto !important',
            width: '100% !important'
          }
        }}>
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '19%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell className="table-header" align="center" rowSpan={2}>
                프로그램명
              </TableCell>
              <TableCell className="table-header" align="center" rowSpan={2}>
                분야
              </TableCell>
              <TableCell className="table-header" align="center" rowSpan={2}>
                강사명
              </TableCell>
              <TableCell className="table-header" align="center" rowSpan={2}>
                참여구분
              </TableCell>
              <TableCell className="table-header" align="center">
                강사
              </TableCell>
              <TableCell className="table-header" align="center">
                구성/품질
              </TableCell>
              <TableCell className="table-header" align="center">
                효과성
              </TableCell>
              <TableCell
                className="table-header"
                align="center"
                rowSpan={2}
              >
                설문참가인원
              </TableCell>
              <TableCell className="table-header" align="center" rowSpan={2}>
                전체평균
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="table-header" align="center" style={{ whiteSpace: 'normal' }}>
                강사는 전문성을 가지고 프로그램을 제공했다
              </TableCell>
              <TableCell className="table-header" align="center" style={{ whiteSpace: 'normal' }}>
                프로그램은 체계적이고 알찼다
              </TableCell>
              <TableCell className="table-header" align="center" style={{ whiteSpace: 'normal' }}>
                기회가 된다면 이 프로그램에 다시 참여할 것이다
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combinedSatisfactionData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <span style={{ color: '#f44336', fontWeight: 'bold' }}>설문 데이터가 없습니다.</span>
                  <br/>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    프로그램 만족도 설문을 통해 데이터를 입력해주세요.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              // Always show the program list if we have combinedSatisfactionData
              // This includes both real survey data and page2Programs base structure
                combinedSatisfactionData.map((i, key) => {
                  // 실제 설문 데이터가 있는지 확인 (cnt가 0이 아닌 경우)
                  const hasRealData = parseInt(i.cnt) > 0;
                  
                  // 점수 데이터를 확실히 문자열로 변환
                  const score1 = String(i.score1 || '0');
                  const score4 = String(i.score4 || '0');
                  const score7 = String(i.score7 || '0');
                  
                  
                  // 평균 계산
                  const avgScore = hasRealData ? calculateAverage({
                    score1: parseFloat(score1),
                    score4: parseFloat(score4),
                    score7: parseFloat(score7)
                  }) : "0";
                  
                  
                  return (
                    <TableRow key={key}>
                      <TableCell>{i.PROGRAM_NAME}</TableCell>
                      <TableCell>{i.BUNYA}</TableCell>
                      <TableCell>{i.TEACHER}</TableCell>
                      <TableCell align="center">{i.type}</TableCell>
                      <TableCell align="center" style={{ fontWeight: hasRealData ? 'normal' : 'normal' }}>
                      {hasRealData ? score1 : <span style={{ color: '#999' }}>0</span>}
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: hasRealData ? 'normal' : 'normal' }}>
                      {hasRealData ? score4 : <span style={{ color: '#999' }}>0</span>}
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: hasRealData ? 'normal' : 'normal' }}>
                      {hasRealData ? score7 : <span style={{ color: '#999' }}>0</span>}
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: hasRealData ? 'bold' : 'normal' }}>
                        {hasRealData ? i.cnt : "0"}
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: hasRealData ? 'bold' : 'normal' }}>
                      {hasRealData ? avgScore : <span style={{ color: '#999' }}>0</span>}
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ProgramSatisfaction;
