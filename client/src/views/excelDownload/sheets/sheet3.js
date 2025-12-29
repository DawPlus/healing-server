// 세 번째 시트 - 운영현황

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

export const createSheet3 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('운영현황');
  
  // 첫 번째 행: 그룹 헤더
      worksheet.mergeCells('A1:A2'); // 순번
      const headerCell_A = worksheet.getCell('A1');
      headerCell_A.value = '순번';
      Object.assign(headerCell_A, headerStyle);
      
      worksheet.mergeCells('B1:E1'); // 시작일
      const headerCell_B = worksheet.getCell('B1');
      headerCell_B.value = '시작일';
      Object.assign(headerCell_B, headerStyle);
      
      // 2줄로 병합되는 개별 헤더들
      const operationSingleHeaders = [
        { range: 'F1:F2', value: '체류일' },
        { range: 'G1:G2', value: '단체명' },
        { range: 'H1:H2', value: '지역' },
        { range: 'I1:I2', value: '폐광지역' },
        { range: 'J1:J2', value: '사업구분' },
        { range: 'K1:K2', value: '단체성격' },
        { range: 'L1:L2', value: 'MOU' },
        { range: 'M1:M2', value: '참가자유형' },
        { range: 'N1:N2', value: '참여형태' },
        { range: 'O1:O2', value: '서비스유형' },
        { range: 'P1:P2', value: '참여인원' },
        { range: 'Q1:Q2', value: '연인원' }
      ];
      
      operationSingleHeaders.forEach((header, index) => {
        worksheet.mergeCells(header.range);
        const cell = worksheet.getCell(header.range.split(':')[0]);
        cell.value = header.value;
        Object.assign(cell, headerStyle);
      });
      
      // 그룹 헤더들
      worksheet.mergeCells('R1:V1'); // 연령대
      const headerCell_R = worksheet.getCell('R1');
      headerCell_R.value = '연령대';
      Object.assign(headerCell_R, headerStyle);
      
      worksheet.mergeCells('W1:W2'); // OM
      const headerCell_W = worksheet.getCell('W1');
      headerCell_W.value = 'OM';
      Object.assign(headerCell_W, headerStyle);
      
      worksheet.mergeCells('X1:X2'); // 프로그램 예정횟수
      const headerCell_X = worksheet.getCell('X1');
      headerCell_X.value = '프로그램 예정횟수';
      Object.assign(headerCell_X, headerStyle);
      
      worksheet.mergeCells('Y1:Z1'); // 객실사용현황
      const headerCell_Y = worksheet.getCell('Y1');
      headerCell_Y.value = '객실사용현황';
      Object.assign(headerCell_Y, headerStyle);
      
      worksheet.mergeCells('AA1:AA2'); // 식사총인원
      const headerCell_AA = worksheet.getCell('AA1');
      headerCell_AA.value = '식사총인원';
      Object.assign(headerCell_AA, headerStyle);
      
      worksheet.mergeCells('AB1:AB2'); // 지출금액
      const headerCell_AB = worksheet.getCell('AB1');
      headerCell_AB.value = '지출금액';
      Object.assign(headerCell_AB, headerStyle);
      
      worksheet.mergeCells('AC1:AC2'); // 수익금액
      const headerCell_AC = worksheet.getCell('AC1');
      headerCell_AC.value = '수익금액';
      Object.assign(headerCell_AC, headerStyle);
      
      // 두 번째 행: 세부 헤더들 추가
      
      // 시작일 아래 (B2:E2)
      const dateHeaders = ['년도', '월', '일', '요일'];
      dateHeaders.forEach((header, index) => {
        const cell = worksheet.getCell(2, index + 2); // B열부터 시작
        cell.value = header;
        Object.assign(cell, headerStyle);
      });
      
      // 연령대 아래 (R2:V2)
      const currentPersonHeaders = ['초등', '중등', '고등', '성인', '노인(65세이상)'];
      currentPersonHeaders.forEach((header, index) => {
        const cell = worksheet.getCell(2, 18 + index); // R열은 18번째 컬럼
        cell.value = header;
        Object.assign(cell, headerStyle);
      });
      
      // 객실사용현황 아래 (Y2:Z2)
      const operationRoomHeaders = ['2일차', '4일차'];
      operationRoomHeaders.forEach((header, index) => {
        const cell = worksheet.getCell(2, 25 + index); // Y열은 25번째 컬럼
        cell.value = header;
        Object.assign(cell, headerStyle);
      });
      
      // 행 높이 설정
      worksheet.getRow(1).height = 25;
      worksheet.getRow(2).height = 25;
      
      // 운영현황 데이터 처리 (영어값을 한국어로 변환)
      const operationData = [];
      
      if (data && data.length > 0) {
        data.forEach(item => {
          operationData.push([
            item.sequenceNumber,
            item.year,
            item.month,
            item.day,
            item.dayOfWeek,
            item.stayDays,
            item.groupName,
            item.region,
            item.mineArea,
            translateBusinessCategory(item.businessCategory),
            translateOrgNature(item.orgNature),
            item.isMou,
            translatePartType(item.partType),
            translatePartForm(item.partForm),
            translateServiceType(item.serviceType),
            item.participantCount,
            item.totalPersonDays,
            item.elementaryCount,
            item.middleCount,
            item.highCount,
            item.adultCount,
            item.elderlyCount,
            item.operationManager,
            item.programCount,
            item.day2Rooms,
            item.day4Rooms,
            item.mealTotalCount,
            item.totalExpense,
            item.totalRevenue
          ]);
        });
      }
      
      // 데이터 추가
      if (operationData.length > 0) {
        operationData.forEach((row, index) => {
          const rowIndex = index + 3; // 헤더 2행 이후부터 시작
          row.forEach((value, colIndex) => {
            const cell = worksheet.getCell(rowIndex, colIndex + 1);
            cell.value = value;
            Object.assign(cell, defaultStyle);
          });
        });
      }
      
      // 컬럼 너비 설정 (29개 컬럼)
      worksheet.columns = [
        { width: 8 },   // A: 순번
        { width: 8 },   // B: 년도
        { width: 6 },   // C: 월
        { width: 6 },   // D: 일
        { width: 8 },   // E: 요일
        { width: 12 },  // F: 체류일
        { width: 20 },  // G: 단체명
        { width: 12 },  // H: 지역
        { width: 12 },  // I: 폐광지역
        { width: 12 },  // J: 사업구분
        { width: 12 },  // K: 단체성격
        { width: 10 },  // L: MOU
        { width: 12 },  // M: 참가자유형
        { width: 12 },  // N: 참여형태
        { width: 12 },  // O: 서비스유형
        { width: 10 },  // P: 참여인원
        { width: 10 },  // Q: 연인원
        { width: 8 },   // R: 초등
        { width: 8 },   // S: 중등
        { width: 8 },   // T: 고등
        { width: 8 },   // U: 성인
        { width: 8 },   // V: 노인(65세이상)
        { width: 10 },  // W: OM
        { width: 15 },  // X: 프로그램 예정횟수
        { width: 12 },  // Y: 객실사용현황-2일차
        { width: 12 },  // Z: 객실사용현황-4일차
        { width: 12 },  // AA: 식사총인원
        { width: 12 },  // AB: 지출금액
        { width: 12 }   // AC: 수익금액
      ];
      
  return worksheet;
}; 