// 여덟 번째 시트 - 효과성분석(힐링효과)
export const createSheet8 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('효과성분석(힐링효과)');
  
  // 1행: 기본 헤더들과 프로그램효과 그룹 헤더
  const singleHeaders = [
    { range: 'A1:A2', value: '순번' },
    { range: 'B1:B2', value: '년도' },
    { range: 'C1:C2', value: '월' },
    { range: 'D1:D2', value: '일' },
    { range: 'E1:E2', value: '단체명' },
    { range: 'F1:F2', value: '참가인원' },
    { range: 'G1:G2', value: '구분' }
  ];
  
  // 단일 헤더 병합
  singleHeaders.forEach(({ range, value }) => {
    worksheet.mergeCells(range);
    const cell = worksheet.getCell(range.split(':')[0]);
    cell.value = value;
    Object.assign(cell, headerStyle);
  });
  
  // 프로그램효과 그룹 헤더 병합 (H1:I1)
  worksheet.mergeCells('H1:I1');
  const programEffectHeader = worksheet.getCell('H1');
  programEffectHeader.value = '프로그램효과';
  Object.assign(programEffectHeader, headerStyle);
  
  // 2행: 프로그램효과 하위 헤더들
  const subHeaders = ['힐링효과(합계)', '힐링효과(평균)'];
  subHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 8 + index); // H열부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 컬럼 너비 설정
  worksheet.columns = [
    { width: 8 },   // A: 순번
    { width: 8 },   // B: 년도
    { width: 6 },   // C: 월
    { width: 6 },   // D: 일
    { width: 20 },  // E: 단체명
    { width: 12 },  // F: 참가인원
    { width: 12 },  // G: 구분
    { width: 15 },  // H: 힐링효과(합계)
    { width: 15 }   // I: 힐링효과(평균)
  ];
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 추가
  if (data && data.length > 0) {
    let sequenceNumber = 1;
    
    data.forEach((item, index) => {
      const startDate = new Date(item.start_date || item.시작일 || item.예약일);
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;
      const day = startDate.getDate();
      
      const rowIndex = index + 3; // 헤더 2행 이후부터 시작
      const rowData = [
        sequenceNumber++,
        year,
        month,
        day,
        item.group_name || item.단체명 || '미기재',
        item.participant_count || item.참가인원 || 0,
        item.category || item.구분 || '미기재',
        item.healing_effect_total || item.힐링효과합계 || 0,
        item.healing_effect_average || item.힐링효과평균 || 0
      ];
      
      rowData.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex, colIndex + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
      });
    });
  }
  
  return worksheet;
}; 