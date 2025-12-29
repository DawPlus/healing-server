// 아홉 번째 시트 - 효과성분석
export const createSheet9 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('효과성분석(예방효과)');
  
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
  
  // 프로그램효과 그룹 헤더 (H1:I1)
  worksheet.mergeCells('H1:I1');
  const programEffectHeaderCell = worksheet.getCell('H1');
  programEffectHeaderCell.value = '프로그램효과';
  Object.assign(programEffectHeaderCell, headerStyle);
  
  // 두 번째 행: 프로그램효과 세부 헤더들 (H2:I2)
  const programEffectSubHeaders = ['예방효과(합계)', '예방효과(평균)'];
  programEffectSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 8 + index); // H열은 8번째 컬럼부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 처리
  const sheet9Data = [];
  let sequenceNumber = 1;
  
  if (data && data.length > 0) {
    data.forEach(item => {
      const startDate = new Date(item.start_date || item.시작일 || item.예약일);
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;
      const day = startDate.getDate();
      
      sheet9Data.push([
        sequenceNumber++,
        year,
        month,
        day,
        item.group_name || item.단체명 || '미기재',
        item.participant_count || item.참가인원 || 0,
        item.category || item.구분 || '미기재',
        item.prevention_effect_total || item.예방효과합계 || 0,
        item.prevention_effect_average || item.예방효과평균 || 0
      ]);
    });
  }
  
  // 데이터 추가
  if (sheet9Data.length > 0) {
    sheet9Data.forEach((row, index) => {
      const rowIndex = index + 3; // 헤더 2행 이후부터 시작
      row.forEach((value, colIndex) => {
        const cell = worksheet.getCell(rowIndex, colIndex + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
      });
    });
  }
  
  // 컬럼 너비 설정 (9개 컬럼)
  worksheet.columns = [
    { width: 8 },   // A: 순번
    { width: 8 },   // B: 년도
    { width: 6 },   // C: 월
    { width: 6 },   // D: 일
    { width: 20 },  // E: 단체명
    { width: 10 },  // F: 참가인원
    { width: 12 },  // G: 구분
    { width: 15 },  // H: 예방효과(합계)
    { width: 15 }   // I: 예방효과(평균)
  ];
  
  return worksheet;
}; 