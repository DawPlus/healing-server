// 일곱 번째 시트 - 시설서비스 만족도
export const createSheet7 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('시설서비스 만족도');
  
  // 첫 번째 행: 개별 헤더들과 그룹 헤더
  // 2행 병합되는 개별 헤더들
  const singleHeaders = [
    { range: 'A1:A2', value: '순번' },
    { range: 'E1:E2', value: '단체명' },
    { range: 'F1:F2', value: '사업구분' },
    { range: 'G1:G2', value: '참가인원' }
  ];
  
  // 개별 헤더 병합 (기본 스타일)
  singleHeaders.forEach(({ range, value }) => {
    worksheet.mergeCells(range);
    const cell = worksheet.getCell(range.split(':')[0]);
    cell.value = value;
    Object.assign(cell, headerStyle);
  });
  
  // 시작일자 그룹 헤더 (B1:D1)
  worksheet.mergeCells('B1:D1');
  const startDateHeader = worksheet.getCell('B1');
  startDateHeader.value = '시작일자';
  Object.assign(startDateHeader, headerStyle);
  
  // 운영구분 헤더 빨간색 적용 (F1)
  const businessTypeCell = worksheet.getCell('F1');
  businessTypeCell.font = { ...headerStyle.font, color: { argb: 'FF000000' } };

  // 시설 만족도 헤더 빨간색 적용 (H1)
  worksheet.mergeCells('H1:M1');
  const facilityHeaderCell = worksheet.getCell('H1');
  facilityHeaderCell.value = '시설 만족도';
  Object.assign(facilityHeaderCell, headerStyle);
  facilityHeaderCell.font = { ...headerStyle.font, color: { argb: 'FF000000' } };

  // 두 번째 행: 시작일자 하위 헤더들 (B2:D2)
  const startDateSubHeaders = ['년도', '월', '일'];
  startDateSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 2 + index); // B열부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 두 번째 행: 시설만족도 하위 헤더들 (H2:M2)
  const facilitySubHeaders = ['숙소', '프로그램장소', '숙박(야외)', '운영', '식사', '평균'];
  facilitySubHeaders.forEach((header, idx) => {
    const cell = worksheet.getCell(2, 8 + idx); // H열부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
    cell.font = { ...headerStyle.font, color: { argb: 'FF000000' } }; // 검정색
  });
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 처리
  const facilityData = [];
  let sequenceNumber = 1;
  
  if (data && data.length > 0) {
    data.forEach((item, idx) => {
      const rowIndex = idx + 3; // 3번째 행부터 데이터
      const rowData = [
        item.sequenceNumber || idx + 1,
        item.year || new Date().getFullYear(),
        item.month || new Date().getMonth() + 1,
        item.day || new Date().getDate(),
        item.groupName || item.단체명 || '미기재',
        item.businessType || item.운영구분 || '미기재',
        item.participantCount || item.참여인원 || 0,
        item.accommodationSatisfaction || item.숙소만족도 || 0,
        item.programPlaceSatisfaction || item.프로그램장소만족도 || 0,
        item.outdoorAccommodationSatisfaction || item.야외숙박만족도 || 0,
        item.operationSatisfaction || item.운영만족도 || 0,
        item.mealSatisfaction || item.식사만족도 || 0,
        item.facilityAverage || item.시설평균 || 0,
      ];
      rowData.forEach((value, colIdx) => {
        const cell = worksheet.getCell(rowIndex, colIdx + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
        // 빨간색 컬럼들: 운영구분(F), 시설만족도(H~M)
        if (colIdx === 5 || colIdx >= 7) {
          cell.font = { ...defaultStyle.font, color: { argb: 'FF000000' } };
        }
      });
    });
  }
  
  // 컬럼 너비 설정
  worksheet.columns = [
    { width: 8 },   // A: 순번
    { width: 8 },   // B: 년도
    { width: 6 },   // C: 월
    { width: 6 },   // D: 일
    { width: 20 },  // E: 단체명
    { width: 12 },  // F: 사업구분
    { width: 10 },  // G: 참가인원
    { width: 10 },  // H: 숙소
    { width: 15 },  // I: 프로그램장소
    { width: 12 },  // J: 숙박(야외)
    { width: 10 },  // K: 운영
    { width: 10 },  // L: 식사
    { width: 10 }   // M: 평균
  ];
  
  return worksheet;
}; 