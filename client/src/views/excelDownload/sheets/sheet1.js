// 첫 번째 시트 - 예약 현황

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

const translateReservationStatus = (value) => {
  const mapping = {
    'confirmed': '확정',
    'tentative': '가예약',
    'preparation': '가예약',
    'pending': '대기',
    'cancelled': '취소',
    'completed': '완료',
    'reserved': '예약',
    'draft': '임시저장',
    'approved': '승인',
    'rejected': '거부',
    'processing': '처리중'
  };
  return mapping[value] || value || '예약';
};

const translateOrgNature = (value) => {
  const mapping = {
    'company': '기업',
    'school': '학교',
    'government': '정부기관',
    'ngo': '시민단체',
    'association': '협회',
    'foundation': '재단',
    'church': '종교단체',
    'hospital': '의료기관',
    'welfare': '복지기관',
    'community': '지역사회',
    'family': '가족',
    'friends': '친구',
    'club': '동호회',
    'union': '노동조합',
    'cooperative': '협동조합',
    'volunteer': '자원봉사단체',
    'other': '기타'
  };
  return mapping[value] || value || '';
};

const translatePartType = (value) => {
  const mapping = {
    'general': '일반',
    'student': '학생',
    'teacher': '교사',
    'employee': '직장인',
    'senior': '시니어',
    'youth': '청소년',
    'child': '아동',
    'family': '가족',
    'disabled': '장애인',
    'multicultural': '다문화',
    'low_income': '저소득층',
    'volunteer': '자원봉사자',
    'professional': '전문직',
    'farmer': '농업인',
    'fisherman': '어업인',
    'miner': '광업인',
    'other': '기타'
  };
  return mapping[value] || value || '';
};

const translatePartForm = (value) => {
  const mapping = {
    'full': '전체참여',
    'partial': '부분참여',
    'individual': '개별참여',
    'group': '단체참여',
    'family': '가족참여',
    'couple': '부부참여',
    'friend': '친구참여',
    'colleague': '동료참여',
    'volunteer': '자원봉사',
    'experience': '체험참여',
    'education': '교육참여',
    'training': '연수참여',
    'recreation': '레크리에이션',
    'healing': '힐링참여',
    'therapy': '치료참여',
    'counseling': '상담참여',
    'other': '기타'
  };
  return mapping[value] || value || '';
};

const translateServiceType = (value) => {
  const mapping = {
    'healing': '힐링',
    'education': '교육',
    'training': '연수',
    'recreation': '레크리에이션',
    'experience': '체험',
    'therapy': '치료',
    'counseling': '상담',
    'consultation': '컨설팅',
    'workshop': '워크숍',
    'seminar': '세미나',
    'conference': '컨퍼런스',
    'festival': '축제',
    'tour': '관광',
    'camping': '캠핑',
    'hiking': '등산',
    'walking': '산책',
    'meditation': '명상',
    'yoga': '요가',
    'exercise': '운동',
    'culture': '문화',
    'art': '예술',
    'music': '음악',
    'dance': '댄스',
    'craft': '공예',
    'cooking': '요리',
    'gardening': '원예',
    'farming': '농업',
    'forestry': '임업',
    'ecology': '생태',
    'environment': '환경',
    'sustainability': '지속가능성',
    'volunteer': '자원봉사',
    'service': '봉사',
    'community': '지역사회',
    'social': '사회',
    'welfare': '복지',
    'charity': '자선',
    'donation': '기부',
    'other': '기타'
  };
  return mapping[value] || value || '';
};

export const createSheet1 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('예약 현황');
  
  // 첫 번째 행: 그룹 헤더 설정
  worksheet.mergeCells('A1:D1'); // 예약일정
  const headerCell1 = worksheet.getCell('A1');
  headerCell1.value = '예약일정';
  Object.assign(headerCell1, headerStyle);
  
  // 2줄로 병합되는 개별 헤더들
  const singleHeaders = [
    { range: 'E1:E2', value: '체류일' },
    { range: 'F1:F2', value: '예약형태' },
    { range: 'G1:G2', value: '단체명' },
    { range: 'H1:H2', value: '지역' },
    { range: 'I1:I2', value: '사업구분' },
    { range: 'J1:J2', value: '폐광지역' },
    { range: 'K1:K2', value: '단체성격' },
    { range: 'L1:L2', value: '참가자유형' },
    { range: 'M1:M2', value: '참여형태' },
    { range: 'N1:N2', value: '서비스유형' },
    { range: 'O1:O2', value: '참여인원' },
    { range: 'P1:P2', value: '연인원' }
  ];
  
  singleHeaders.forEach((header, index) => {
    worksheet.mergeCells(header.range);
    const cell = worksheet.getCell(header.range.split(':')[0]);
    cell.value = header.value;
    Object.assign(cell, headerStyle);
  });
  
  // 그룹 헤더들
  worksheet.mergeCells('Q1:V1'); // 연령대
  const headerCell2 = worksheet.getCell('Q1');
  headerCell2.value = '연령대';
  Object.assign(headerCell2, headerStyle);
  
  worksheet.mergeCells('W1:W2'); // 예약담당
  const headerCell3 = worksheet.getCell('W1');
  headerCell3.value = '예약담당';
  Object.assign(headerCell3, headerStyle);
  
  worksheet.mergeCells('X1:X2'); // OM
  const headerCell4 = worksheet.getCell('X1');
  headerCell4.value = 'OM';
  Object.assign(headerCell4, headerStyle);
  
  worksheet.mergeCells('Y1:Y2'); // 프로그램 예정횟수
  const headerCell5 = worksheet.getCell('Y1');
  headerCell5.value = '프로그램 예정횟수';
  Object.assign(headerCell5, headerStyle);
  
  worksheet.mergeCells('Z1:AA1'); // 객실예약현황
  const headerCell6 = worksheet.getCell('Z1');
  headerCell6.value = '객실예약현황';
  Object.assign(headerCell6, headerStyle);
  
  worksheet.mergeCells('AB1:AB2'); // 식사예정횟수
  const headerCell7 = worksheet.getCell('AB1');
  headerCell7.value = '식사예정횟수';
  Object.assign(headerCell7, headerStyle);
  
  worksheet.mergeCells('AC1:AC2'); // 견적금액
  const headerCell8 = worksheet.getCell('AC1');
  headerCell8.value = '견적금액';
  Object.assign(headerCell8, headerStyle);
  
  // 두 번째 행: 세부 헤더들 추가
  
  // 예약일정 아래 (A2:D2)
  const scheduleHeaders = ['연도', '월', '일', '요일'];
  scheduleHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, index + 1);
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 연령대 아래 (Q2:V2)
  const ageHeaders = ['유아', '초등', '중등', '고등', '성인', '노인(65세이상)'];
  ageHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 17 + index); // Q열은 17번째 컬럼
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 객실예약현황 아래 (Z2:AA2)
  const roomHeaders = ['2일차', '4일차'];
  roomHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 26 + index); // Z열은 26번째 컬럼
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 컬럼 너비 설정 (29개 컬럼)
  worksheet.columns = [
    { width: 8 },   // A: 연도
    { width: 6 },   // B: 월
    { width: 6 },   // C: 일
    { width: 8 },   // D: 요일
    { width: 12 },  // E: 체류일
    { width: 12 },  // F: 예약형태
    { width: 15 },  // G: 단체명
    { width: 12 },  // H: 지역
    { width: 12 },  // I: 사업구분
    { width: 12 },  // J: 폐광지역
    { width: 12 },  // K: 단체성격
    { width: 12 },  // L: 참가자유형
    { width: 12 },  // M: 참여형태
    { width: 12 },  // N: 서비스유형
    { width: 12 },  // O: 참여인원
    { width: 12 },  // P: 연인원
    { width: 12 },  // Q: 유아
    { width: 12 },  // R: 초등
    { width: 12 },  // S: 중등
    { width: 12 },  // T: 고등
    { width: 12 },  // U: 성인
    { width: 15 },  // V: 노인(65세이상)
    { width: 12 },  // W: 예약담당
    { width: 12 },  // X: OM
    { width: 12 },  // Y: 프로그램 예정횟수
    { width: 12 },  // Z: 객실예약현황-2일차
    { width: 12 },  // AA: 객실예약현황-4일차
    { width: 12 },  // AB: 식사예정횟수
    { width: 12 }   // AC: 견적금액
  ];
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 추가
  if (data && data.length > 0) {
    // 새로운 데이터 구조에 맞게 변환 (영어값을 한국어로 변환)
    const sheet1Data = data.map(row => [
      row.year,
      row.month,
      row.day,
      row.dayOfWeek,
      row.stayDays,
      translateReservationStatus(row.reservationType),
      row.groupName,
      row.region,
      translateBusinessCategory(row.businessCategory),
      row.mineArea,
      translateOrgNature(row.orgNature),
      translatePartType(row.partType),
      translatePartForm(row.partForm),
      translateServiceType(row.serviceType),
      row.participantCount,
      row.totalPersonDays,
      row.infantCount,
      row.elementaryCount,
      row.middleCount,
      row.highCount,
      row.adultCount,
      row.elderlyCount,
      row.reservationManager,
      row.operationManager,
      row.programCount,
      row.day2Rooms,
      row.day4Rooms,
      row.mealCount,
      row.totalBudget
    ]);
    
    sheet1Data.forEach((row, index) => {
      const rowIndex = index + 3; // 헤더 2행 이후부터 시작
      row.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex, colIndex + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
      });
    });
  }
  
  return worksheet;
}; 