// 다섯 번째 시트 - 강사 운영현황
export const createSheet5 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('강사 운영현황');
  
  // 첫 번째 행: 그룹 헤더
  // 단독 헤더들 (2행 병합)
  const instructorSingleHeaders = [
    { range: 'A1:A2', value: '순번' },
    { range: 'B1:B2', value: '강사명' },
    { range: 'C1:C2', value: '강사구분' },
    { range: 'D1:D2', value: '분야' },
    { range: 'E1:E2', value: '프로그램명' },
    { range: 'F1:F2', value: '강의횟수' },
    { range: 'G1:G2', value: '설문참가인원' }
  ];
  
  instructorSingleHeaders.forEach((header) => {
    worksheet.mergeCells(header.range);
    const cell = worksheet.getCell(header.range.split(':')[0]);
    cell.value = header.value;
    Object.assign(cell, headerStyle);
  });
  
  // 만족도 그룹 헤더 (H1:K1)
  worksheet.mergeCells('H1:K1');
  const satisfactionHeaderCell = worksheet.getCell('H1');
  satisfactionHeaderCell.value = '만족도';
  Object.assign(satisfactionHeaderCell, headerStyle);
  
  // 두 번째 행: 만족도 세부 헤더들 (H2:K2)
  const satisfactionSubHeaders = ['강사', '프로그램구성', '효과성', '평균'];
  satisfactionSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 8 + index); // H열은 8번째 컬럼부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 처리
  const sheet5Data = [];
  
  if (data && data.length > 0) {
    data.forEach(item => {
      sheet5Data.push([
        item.sequenceNumber,
        item.instructorName,
        item.instructorType,
        item.categoryName,
        item.programName,
        item.lectureCount,
        item.totalParticipants,
        item.instructorSatisfaction,
        item.programComposition,
        item.effectiveness,
        item.averageScore
      ]);
    });
  }
  
  // 데이터 추가
  if (sheet5Data.length > 0) {
    sheet5Data.forEach((row, index) => {
      const rowIndex = index + 3; // 헤더 2행 이후부터 시작
      row.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex, colIndex + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
      });
    });
  }
  
  // 컬럼 너비 설정 (11개 컬럼)
  worksheet.columns = [
    { width: 8 },   // A: 순번
    { width: 12 },  // B: 강사명
    { width: 12 },  // C: 강사구분
    { width: 12 },  // D: 분야
    { width: 15 },  // E: 프로그램명
    { width: 12 },  // F: 강의횟수
    { width: 15 },  // G: 설문참가인원
    { width: 10 },  // H: 강사 (만족도)
    { width: 15 },  // I: 프로그램구성 (만족도)
    { width: 10 },  // J: 효과성 (만족도)
    { width: 10 }   // K: 평균 (만족도)
  ];
  
  return worksheet;
}; 