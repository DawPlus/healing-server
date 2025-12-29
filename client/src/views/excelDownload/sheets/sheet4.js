// 네 번째 시트 - 프로그램 현황

// 영어 값을 한국어로 변환하는 매핑 함수들
const translateBusinessCategory = (value) => {
  const mapping = {
    'social_contribution': '사회공헌',
    'profit_business': '수익사업',
    'government': '정부사업',
    'public': '공공사업',
    'forest': '숲사업',
    'healing': '힐링사업',
    'education': '교육사업',
    'recreation': '레크리에이션',
    'training': '연수사업',
    'experience': '체험사업',
    'health': '건강사업',
    'welfare': '복지사업',
    'culture': '문화사업',
    'environment': '환경사업',
    'tourism': '관광사업',
    'agriculture': '농업사업',
    'rural': '농촌사업',
    'community': '마을사업',
    'volunteer': '자원봉사',
    'corporate': '기업사업',
    'ngo': '시민단체',
    'school': '학교사업',
    'family': '가족사업',
    'youth': '청소년사업',
    'senior': '시니어사업',
    'disability': '장애인사업',
    'multicultural': '다문화사업',
    'low_income': '저소득층사업',
    'other': '기타'
  };
  return mapping[value] || value || '';
};

const translateProgramType = (value) => {
  const mapping = {
    'healing': '힐링',
    'education': '교육',
    'training': '연수',
    'recreation': '레크리에이션',
    'experience': '체험',
    'therapy': '치료',
    'counseling': '상담',
    'workshop': '워크숍',
    'seminar': '세미나',
    'lecture': '강의',
    'discussion': '토론',
    'activity': '활동',
    'game': '게임',
    'exercise': '운동',
    'meditation': '명상',
    'yoga': '요가',
    'walking': '산책',
    'hiking': '등산',
    'climbing': '등반',
    'cycling': '자전거',
    'swimming': '수영',
    'fishing': '낚시',
    'camping': '캠핑',
    'bbq': '바베큐',
    'picnic': '피크닉',
    'festival': '축제',
    'performance': '공연',
    'exhibition': '전시',
    'tour': '관람',
    'visit': '견학',
    'culture': '문화',
    'art': '예술',
    'music': '음악',
    'dance': '댄스',
    'craft': '공예',
    'cooking': '요리',
    'baking': '제빵',
    'gardening': '원예',
    'farming': '농업',
    'forestry': '임업',
    'ecology': '생태',
    'environment': '환경',
    'nature': '자연',
    'wildlife': '야생동물',
    'bird': '조류',
    'insect': '곤충',
    'plant': '식물',
    'tree': '나무',
    'flower': '꽃',
    'herb': '허브',
    'mushroom': '버섯',
    'other': '기타'
  };
  return mapping[value] || value || '';
};

const translateInstructorType = (value) => {
  const mapping = {
    'regular': '정규강사',
    'part_time': '시간강사',
    'guest': '초빙강사',
    'volunteer': '자원봉사강사',
    'expert': '전문강사',
    'professor': '교수',
    'doctor': '의사',
    'therapist': '치료사',
    'counselor': '상담사',
    'trainer': '트레이너',
    'coach': '코치',
    'guide': '가이드',
    'facilitator': '진행자',
    'assistant': '보조강사',
    'intern': '인턴강사',
    'student': '학생강사',
    'external': '외부강사',
    'internal': '내부강사',
    'freelance': '프리랜서',
    'contract': '계약강사',
    'other': '기타'
  };
  return mapping[value] || value || '정규강사';
};

export const createSheet4 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('프로그램 현황');
  
  // 첫 번째 행: 그룹 헤더
  // 단독 헤더들 (2행 병합)
  const programSingleHeaders = [
    { range: 'A1:A2', value: '순번' },
    { range: 'B1:B2', value: '년도' },
    { range: 'C1:C2', value: '월' },
    { range: 'D1:D2', value: '일' },
    { range: 'E1:E2', value: '단체명' },
    { range: 'F1:F2', value: '사업구분' },
    { range: 'G1:G2', value: '분야' },
    { range: 'H1:H2', value: '프로그램명' },
    { range: 'I1:I2', value: '장소' },
    { range: 'J1:J2', value: '참가인원' },
    { range: 'K1:K2', value: '강사명' },
    { range: 'L1:L2', value: '강사구분' }
  ];
  
  programSingleHeaders.forEach((header) => {
    worksheet.mergeCells(header.range);
    const cell = worksheet.getCell(header.range.split(':')[0]);
    cell.value = header.value;
    Object.assign(cell, headerStyle);
  });
  
  // 만족도 그룹 헤더 (M1:O1)
  worksheet.mergeCells('M1:O1');
  const satisfactionHeaderCell = worksheet.getCell('M1');
  satisfactionHeaderCell.value = '만족도';
  Object.assign(satisfactionHeaderCell, headerStyle);
  
  // 두 번째 행: 만족도 세부 헤더들 (M2:O2)
  const satisfactionSubHeaders = ['강사', '프로그램구성', '효과성'];
  satisfactionSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 13 + index); // M열은 13번째 컬럼부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 프로그램 현황 데이터 처리 (영어값을 한국어로 변환)
  const programData = [];
  
  if (data && data.length > 0) {
    data.forEach(item => {
      programData.push([
        item.sequenceNumber,
        item.year,
        item.month,
        item.day,
        item.groupName,
        translateBusinessCategory(item.businessCategory),
        translateProgramType(item.categoryName),
        item.programName,
        item.placeName,
        item.participants,
        item.instructorName,
        translateInstructorType(item.instructorType),
        item.instructorSatisfaction,
        item.programComposition,
        item.effectiveness
      ]);
    });
  }
  
  // 데이터 추가
  if (programData.length > 0) {
    programData.forEach((row, index) => {
      const rowIndex = index + 3; // 헤더 2행 이후부터 시작
      row.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex, colIndex + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
      });
    });
  }
  
  // 컬럼 너비 설정 (15개 컬럼)
  worksheet.columns = [
    { width: 8 },   // A: 순번
    { width: 8 },   // B: 년도
    { width: 6 },   // C: 월
    { width: 6 },   // D: 일
    { width: 20 },  // E: 단체명
    { width: 12 },  // F: 사업구분
    { width: 12 },  // G: 분야
    { width: 15 },  // H: 프로그램명
    { width: 12 },  // I: 장소
    { width: 10 },  // J: 참가인원
    { width: 12 },  // K: 강사명
    { width: 12 },  // L: 강사구분
    { width: 10 },  // M: 강사 (만족도)
    { width: 15 },  // N: 프로그램구성 (만족도)
    { width: 10 }   // O: 효과성 (만족도)
  ];
  
  return worksheet;
}; 