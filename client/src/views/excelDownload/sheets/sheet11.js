// 열한 번째 시트 - 효과성분석(자율신경검사효과성)
export const createSheet11 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('효과성분석(자율신경검사효과성)');
  
  // 첫 번째 행: 그룹 헤더
  // 단독 헤더들 (2행 병합)
  const effectivenessSingleHeaders = [
    { range: 'A1:A2', value: '순번' },
    { range: 'B1:B2', value: '년도' },
    { range: 'C1:C2', value: '월' },
    { range: 'D1:D2', value: '일' },
    { range: 'E1:E2', value: '단체명' },
    { range: 'F1:F2', value: '참가인원' },
    { range: 'G1:G2', value: '구분' }
  ];
  
  effectivenessSingleHeaders.forEach((header) => {
    worksheet.mergeCells(header.range);
    const cell = worksheet.getCell(header.range.split(':')[0]);
    cell.value = header.value;
    Object.assign(cell, headerStyle);
  });
  
  // 자율신경검사효과성 그룹 헤더 (H1:L1)
  worksheet.mergeCells('H1:L1');
  const autonomicNervousHeaderCell = worksheet.getCell('H1');
  autonomicNervousHeaderCell.value = '자율신경검사효과성';
  Object.assign(autonomicNervousHeaderCell, headerStyle);
  
  // 두 번째 행: 자율신경검사효과성 세부 헤더들 (H2:L2)
  const autonomicNervousSubHeaders = ['자율신경험성도', '자율신경균형도', '스트레스지수도', '스트레스지수', '비포도'];
  autonomicNervousSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 8 + index); // H열은 8번째 컬럼부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 추가
  if (data && data.length > 0) {
    data.forEach((item, index) => {
      const rowIndex = index + 3; // 헤더 2행 이후부터 시작
      const rowData = [
        item.sequenceNumber || index + 1,
        item.year || 0,
        item.month || 0,
        item.day || 0,
        item.groupName || '',
        item.participantCount || 0,
        item.category || '',
        item.autonomicNervousActivity || 0,
        item.autonomicNervousBalance || 0,
        item.stressIndexLevel || 0,
        item.stressIndex || 0,
        item.ratio || 0
      ];
      
      rowData.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex, colIndex + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
      });
    });
  }
  
  // 컬럼 너비 설정 (12개 컬럼)
  worksheet.columns = [
    { width: 8 },   // A: 순번
    { width: 8 },   // B: 년도
    { width: 6 },   // C: 월
    { width: 6 },   // D: 일
    { width: 20 },  // E: 단체명
    { width: 10 },  // F: 참가인원
    { width: 12 },  // G: 구분
    { width: 15 },  // H: 자율신경험성도
    { width: 15 },  // I: 자율신경균형도
    { width: 15 },  // J: 스트레스지수도
    { width: 12 },  // K: 스트레스지수
    { width: 10 }   // L: 비포도
  ];
  
  return worksheet;
}; 