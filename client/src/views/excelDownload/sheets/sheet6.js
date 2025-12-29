// 여섯번째 시트 - 프로그램 만족도
export const createSheet6 = async (workbook, data, defaultStyle, headerStyle) => {
  const worksheet = workbook.addWorksheet('프로그램 만족도');

  // 1행: 헤더 병합 및 스타일 적용 (이미지와 동일하게)
  worksheet.mergeCells('A1:A2'); // 순번
  worksheet.mergeCells('B1:B2'); // 분야
  worksheet.mergeCells('C1:C2'); // 프로그램명
  worksheet.mergeCells('D1:D2'); // 강사명
  worksheet.mergeCells('E1:E2'); // 강사구분
  worksheet.mergeCells('F1:F2'); // 운영횟수
  worksheet.mergeCells('G1:G2'); // 설문참가인원
  worksheet.mergeCells('H1:K1'); // 만족도 그룹 헤더

  // 1행 헤더 값
  worksheet.getCell('A1').value = '순번';
  worksheet.getCell('B1').value = '분야';
  worksheet.getCell('C1').value = '프로그램명';
  worksheet.getCell('D1').value = '강사명';
  worksheet.getCell('E1').value = '강사구분';
  worksheet.getCell('F1').value = '운영횟수';
  worksheet.getCell('G1').value = '설문참가인원';
  worksheet.getCell('H1').value = '만족도';

  // 1행 기본 스타일 적용 (모든 헤더에 동일한 배경과 중앙정렬 적용)
  ['A1','B1','C1','D1','E1','F1','G1','H1'].forEach(cell => {
    Object.assign(worksheet.getCell(cell), headerStyle);
  });

  // 1행 검정색 폰트 적용 (기본 스타일 적용 후 폰트 색상만 변경)
  const blackHeaderCells = ['B1', 'E1'];
  blackHeaderCells.forEach(cell => {
    worksheet.getCell(cell).font = { ...headerStyle.font, color: { argb: 'FF000000' } };
  });

  // 2행: 만족도 하위 헤더들
  const subHeaders = ['강사', '프로그램구성', '효과성', '평균'];
  subHeaders.forEach((header, idx) => {
    const cell = worksheet.getCell(2, 8 + idx); // H열부터 시작
    cell.value = header;
    Object.assign(cell, headerStyle);
    cell.font = { ...headerStyle.font, color: { argb: 'FF000000' } }; // 검정색
  });

  // 컬럼 너비 설정 (A~K)
  worksheet.columns = [
    { width: 6 },   // A: 순번
    { width: 10 },  // B: 분야
    { width: 24 },  // C: 프로그램명
    { width: 12 },  // D: 강사명
    { width: 10 },  // E: 강사구분
    { width: 10 },  // F: 운영횟수
    { width: 14 },  // G: 설문참가인원
    { width: 8 },   // H: 강사
    { width: 12 },  // I: 프로그램구성
    { width: 10 },  // J: 효과성
    { width: 8 }    // K: 평균
  ];

  // 행 높이 설정
  worksheet.getRow(1).height = 25;
  worksheet.getRow(2).height = 25;

  // 데이터 추가
  if (data && data.length > 0) {
    data.forEach((item, idx) => {
      const rowIndex = idx + 3; // 3번째 행부터 데이터
      const rowData = [
        item.no || idx + 1,
        item.category || item.분야 || '',
        item.program_name || item.프로그램명 || '',
        item.instructor_name || item.강사명 || '',
        item.instructor_type || item.강사구분 || '',
        item.run_count || item.운영횟수 || '',
        item.survey_participants || item.설문참가인원 || '',
        item.satisfaction_instructor || item.강사 || '',
        item.satisfaction_program || item.프로그램구성 || '',
        item.satisfaction_effect || item.효과성 || '',
        item.satisfaction_avg || item.평균 || '',
      ];
      rowData.forEach((value, colIdx) => {
        const cell = worksheet.getCell(rowIndex, colIdx + 1);
        cell.value = value;
        Object.assign(cell, defaultStyle);
        // 빨간색 컬럼들: 분야(B), 강사구분(E), 만족도 관련(H,I,J,K)
        if (colIdx === 1 || colIdx === 4 || colIdx >= 7) {
          cell.font = { ...defaultStyle.font, color: { argb: 'FF000000' } };
        }
      });
    });
  }

  return worksheet;
}; 