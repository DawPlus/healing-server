// 두 번째 시트 - 프로그램 예약현황
export const createSheet2 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('프로그램 예약현황');
  
  // 첫 번째 행: 그룹 헤더 설정
  // 일자 그룹 헤더 (A1:B1)
  worksheet.mergeCells('A1:B1');
  const dateGroupHeader = worksheet.getCell('A1');
  dateGroupHeader.value = '일자';
  Object.assign(dateGroupHeader, headerStyle);
  
  // 단독 헤더들 (2행 병합)
  const singleHeaders = [
    { range: 'C1:C2', value: '고객유형 - 개인 or 단체명' },
    { range: 'D1:D2', value: '프로그램명' },
    { range: 'G1:G2', value: '강사' },
    { range: 'H1:H2', value: '기타(특이사항 등)' }
  ];
  
  singleHeaders.forEach(({ range, value }) => {
    worksheet.mergeCells(range);
    const cell = worksheet.getCell(range.split(':')[0]);
    cell.value = value;
    Object.assign(cell, headerStyle);
  });
  
  // 진행 프로그램 그룹 헤더 (E1:F1)
  worksheet.mergeCells('E1:F1');
  const programGroupHeader = worksheet.getCell('E1');
  programGroupHeader.value = '진행 프로그램';
  Object.assign(programGroupHeader, headerStyle);
  
  // 두 번째 행: 세부 헤더들
  // 일자 하위 헤더들 (A2, B2)
  const dateSubHeaders = ['월', '요일'];
  dateSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 1 + index); // A열부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 진행 프로그램 하위 헤더들 (E2, F2)
  const programSubHeaders = ['장소', '시간'];
  programSubHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(2, 5 + index); // E열부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
  });
  
  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;
  
  // 데이터 처리 및 삽입
  if (data && data.length > 0) {
    // 날짜별로 데이터 그룹화
    const groupedByDate = {};
    
    data.forEach(program => {
      const startDate = new Date(program.reservation_date || program.start_date || program.날짜);
      const month = startDate.getMonth() + 1;
      const day = startDate.getDate();
      const weekday = ['일', '월', '화', '수', '목', '금', '토'][startDate.getDay()];
      const dateKey = `${month}월${day}일`;
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          month: month,
          day: day,
          weekday: weekday,
          programs: []
        };
      }
      
      groupedByDate[dateKey].programs.push({
        customerName: program.group_name || program.단체명 || program.기관명 || '',
        programName: program.program_name || program.프로그램명 || '',
        place: program.place_name || program.장소 || program.진행장소 || '',
        time: program.start_time && program.end_time ? 
          `${program.start_time}-${program.end_time}` : 
          (program.시간 || ''),
        instructor: program.instructor_name || program.강사 || program.담당자 || '',
        notes: program.notes || program.기타 || program.특이사항 || ''
      });
    });
    
    // 날짜별로 데이터 삽입
    let currentRow = 3; // 헤더 2행 이후부터 시작
    
    Object.keys(groupedByDate).sort().forEach(dateKey => {
      const dateInfo = groupedByDate[dateKey];
      const programCount = dateInfo.programs.length;
      
      if (programCount > 0) {
        // 날짜 셀 병합 (여러 프로그램이 있는 경우)
        if (programCount > 1) {
          worksheet.mergeCells(`A${currentRow}:A${currentRow + programCount - 1}`);
          worksheet.mergeCells(`B${currentRow}:B${currentRow + programCount - 1}`);
        }
        
        // 날짜 정보 입력
        const monthCell = worksheet.getCell(currentRow, 1);
        monthCell.value = dateKey;
        Object.assign(monthCell, defaultStyle);
        
        const weekdayCell = worksheet.getCell(currentRow, 2);
        weekdayCell.value = dateInfo.weekday;
        Object.assign(weekdayCell, defaultStyle);
        
        // 각 프로그램별 데이터 입력
        dateInfo.programs.forEach((program, index) => {
          const rowIndex = currentRow + index;
          
          // 프로그램 데이터 입력
          const programData = [
            '', // A열 (날짜) - 이미 병합됨
            '', // B열 (요일) - 이미 병합됨
            program.customerName, // C열
            program.programName,  // D열
            program.place,        // E열
            program.time,         // F열
            program.instructor,   // G열
            program.notes         // H열
          ];
          
          programData.forEach((value, colIndex) => {
            if (colIndex >= 2) { // A, B열은 이미 병합되어 처리함
              const cell = worksheet.getCell(rowIndex, colIndex + 1);
              cell.value = value;
              Object.assign(cell, defaultStyle);
            }
          });
        });
        
        currentRow += programCount;
      }
    });
  }
  
  // 컬럼 너비 설정
  worksheet.columns = [
    { width: 10 },  // A: 월
    { width: 8 },   // B: 요일
    { width: 25 },  // C: 고객유형 - 개인 or 단체명
    { width: 20 },  // D: 프로그램명
    { width: 20 },  // E: 장소
    { width: 15 },  // F: 시간
    { width: 12 },  // G: 강사
    { width: 30 }   // H: 기타
  ];
  
  return worksheet;
}; 