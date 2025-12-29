import XLSX from 'xlsx-js-style';
import moment from 'moment';

// 스타일 정의
const defaultStyle = {
  alignment: {
    vertical: 'center',
    horizontal: 'center',
    wrapText: true
  },
  font: {
    sz: 10,
    name: '굴림',
    color: { rgb: '000000' }
  },
  border: {
    bottom: { style: 'thin', color: { rgb: '000000' } },
    top: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  }
};

const headerStyle = {
  ...defaultStyle,
  font: {
    ...defaultStyle.font,
    bold: true
  },
  fill: { fgColor: { rgb: 'e6e6e6' }, patternType: 'solid' }
};

const headerBigStyle = {
  ...headerStyle,
  font: {
    ...headerStyle.font,
    sz: 11
  }
};

const titleStyle = {
  alignment: {
    vertical: 'center',
    horizontal: 'center'
  },
  font: {
    sz: 16,
    name: '굴림',
    bold: true,
    color: { rgb: '000000' }
  }
};

const boldStyle = {
  ...defaultStyle,
  font: {
    ...defaultStyle.font,
    bold: true
  }
};

const yellowStyle = {
  ...defaultStyle,
  fill: { fgColor: { rgb: 'ffff99' }, patternType: 'solid' }
};

// JSON 데이터 파싱 함수
const parseJsonData = (jsonData) => {
  if (!jsonData) return [];
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return [];
    }
  }
  return jsonData;
};

// 텍스트 길이 제한 함수
const truncateText = (text, maxLength = 15) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 숙박 정보 생성
const createAccommodationSection = (roomSelections) => {
  const headerRow = ['일자', '타입', '인원', '객실수', '숙박', '제공단가', '소계', '할인금액', '합계(VAT포함)', '비고'];
  const rows = [];
  
  let totalRoomPrice = 0;
  
  if (roomSelections && roomSelections.length > 0) {
    console.log('inspection excelExport 숙박비 계산 시작 - 총 객실 수:', roomSelections.length);
    
    // 객실 데이터 그룹화 함수 (같은 일자, 같은 객실종류별로 그룹화)
    const groupRoomSelections = (roomSelections) => {
      const grouped = {};
      
      roomSelections.forEach(room => {
        const date = moment(room.check_in_date).format('MM월 DD일');
        const roomType = room.room_type || room.room_name;
        const key = `${date}_${roomType}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            date,
            roomType,
            rooms: [],
            totalQuantity: 0,
            totalOccupancy: 0,
            nights: room.nights || 1,
            basePrice: room.price || 0,
            totalSubtotal: 0,
            totalDiscount: 0,
            totalAmount: 0
          };
        }
        
        grouped[key].rooms.push(room);
        grouped[key].totalQuantity += 1; // 객실 수
        grouped[key].totalOccupancy += (room.occupancy || 1); // 총 인원
        
        // 각 객실별 계산
        const baseRoomPrice = room.price || 0;
        const nights = room.nights || 1;
        const occupancy = room.occupancy || 1;
        const capacity = room.capacity || 1;
        
        let subtotal = 0;
        
        if (room.total_price && parseInt(room.total_price) > 0) {
          subtotal = parseInt(room.total_price);
        } else {
          subtotal = baseRoomPrice * nights;
          if (occupancy > capacity) {
            const extraPeople = occupancy - capacity;
            const extraCharge = extraPeople * 10000 * nights;
            subtotal += extraCharge;
          }
        }
        
        const discount = 0; // 할인 정보가 없어서 0으로 설정
        const total = subtotal - discount;
        
        grouped[key].totalSubtotal += subtotal;
        grouped[key].totalDiscount += discount;
        grouped[key].totalAmount += total;
      });
      
      return Object.values(grouped);
    };

    const groupedRooms = groupRoomSelections(roomSelections);
    
    // 그룹화된 데이터로 행 생성
    groupedRooms.forEach((group) => {
      console.log('inspection excelExport 숙박비 계산 - 그룹화된 객실 정보:', group);
      
      // 전체 합계에 추가
      totalRoomPrice += group.totalAmount;
      
      console.log('inspection excelExport 숙박비 계산 - 최종 계산 결과:', {
        일자: group.date,
        객실타입: group.roomType,
        총객실수: group.totalQuantity,
        총인원: group.totalOccupancy,
        기본단가: group.basePrice,
        계산된소계: group.totalSubtotal,
        할인후합계: group.totalAmount,
        전체누적합계: totalRoomPrice
      });
      
      rows.push([
        group.date,
        group.roomType,
        group.totalOccupancy,  // 총 인원
        group.totalQuantity,   // 총 객실수
        `${group.nights}박`,   // 숙박
        group.basePrice,       // 제공단가
        group.totalSubtotal,   // 소계
        group.totalDiscount,   // 할인금액
        group.totalAmount,     // 합계(VAT포함)
        ''                     // 비고
      ]);
    });
  }
  
  if (rows.length === 0) {
    rows.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
  }
  
  console.log('inspection excelExport 숙박비 계산 - 전체 최종 합계:', totalRoomPrice);
  
  return {
    headerRow,
    rows,
    totalRoomPrice
  };
};

// 식사 정보 생성
const createMealSection = (mealPlans) => {
  const headerRow = ['구분', '메뉴', '제공횟수', '인원', '제공단가', '소계', '할인금액', '합계(VAT포함)', '비고'];
  const rows = [];
  
  let totalMealPrice = 0;
  
  if (mealPlans && mealPlans.length > 0) {
    // 식사 타입별로 그룹화 (조식, 중식, 석식)
    const groupedByType = {};
    
    mealPlans.forEach(meal => {
      const type = meal.meal_type || '기타';
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(meal);
    });
    
    // 그룹화된 데이터로 행 생성
    Object.entries(groupedByType).forEach(([type, meals], typeIndex) => {
      meals.forEach((meal, idx) => {
        const price = meal.price || 0; // 총액으로 간주
        const participants = meal.participants || 0;

        let unitPrice = 0;
        let subtotal = 0;

        if (participants > 0) {
          unitPrice = Math.round(price / participants);
          subtotal = unitPrice * participants;
        } else {
          unitPrice = price;
          subtotal = price;
        }

        const discount = 0; // 할인 정보가 없어서 0으로 설정
        const total = subtotal - discount;
        
        totalMealPrice += total;
        
        const koreanType = 
          type === 'breakfast' ? '조식' : 
          type === 'lunch' ? '중식' : 
          type === 'dinner' ? '석식' : type;
        
        rows.push([
          idx === 0 ? koreanType : '',  // 구분은 첫 행에만 표시
          meal.meal_option || '일반식',
          '1',  // 제공횟수는 1로 가정
          participants,
          unitPrice,
          subtotal,
          discount,
          total,
          truncateText(meal.notes || '')  // 비고에 길이 제한 적용
        ]);
      });
    });
  }
  
  if (rows.length === 0) {
    rows.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']);
  }
  
  return {
    headerRow,
    rows,
    totalMealPrice
  };
};

// 프로그램 정보 생성
const createProgramSection = (programs) => {
  const headerRow = ['일자', '프로그램명', '제공단가', '소계', '할인금액', '합계(VAT포함)', '비고'];
  const rows = [];
  
  let totalProgramPrice = 0;
  
  if (programs && programs.length > 0) {
    // 날짜별로 프로그램 정보 그룹화
    const groupedByDate = {};
    
    programs.forEach(program => {
      if (!program) return;
      const date = program.date ? moment(program.date).format('MM월 DD일') : '날짜 미정';
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(program);
    });
    
    // 그룹화된 데이터로 행 생성
    Object.entries(groupedByDate).forEach(([date, datePrograms]) => {
      datePrograms.forEach((program, idx) => {
        const price = program.price || 0;
        const subtotal = price;
        const discount = 0; // 할인 정보가 없어서 0으로 설정
        const total = subtotal - discount;
        
        totalProgramPrice += total;
        
        rows.push([
          idx === 0 ? date : '',  // 날짜는 첫 행에만 표시
          program.program_name,
          price,
          subtotal,
          discount,
          total,
          truncateText(program.notes || '')  // 비고에 길이 제한 적용
        ]);
      });
    });
  }
  
  if (rows.length === 0) {
    rows.push(['-', '-', '-', '-', '-', '-', '-']);
  }
  
  return {
    headerRow,
    rows,
    totalProgramPrice
  };
};

// 대관 정보 생성
const createVenueSection = (placeReservations) => {
  const headerRow = ['일자', '대관장소', '회수', '시간', '제공단가', '소계', '할인금액', '합계(VAT포함)', '비고'];
  const rows = [];
  
  let totalVenuePrice = 0;
  
  if (placeReservations && placeReservations.length > 0) {
    // 날짜별로 대관 정보 그룹화
    const groupedByDate = {};
    
    placeReservations.forEach(place => {
      const date = place.reservation_date ? moment(place.reservation_date).format('MM월 DD일') : '날짜 미정';
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(place);
    });
    
    // 그룹화된 데이터로 행 생성
    Object.entries(groupedByDate).forEach(([date, places]) => {
      places.forEach((place, idx) => {
        const price = place.price || 0;
        const startTime = place.start_time || '';
        const endTime = place.end_time || '';
        const hours = startTime && endTime ? 
          `${startTime.substring(0, 5)} ~ ${endTime.substring(0, 5)}` : '';
        
        const subtotal = price;
        const discount = 0; // 할인 정보가 없어서 0으로 설정
        const total = subtotal - discount;
        
        totalVenuePrice += total;
        
        rows.push([
          idx === 0 ? date : '',  // 날짜는 첫 행에만 표시
          place.place_name,
          '1',  // 회수는 1로 가정
          hours,
          price,
          subtotal,
          discount,
          total,
          truncateText(place.notes || '')  // 비고에 길이 제한 적용
        ]);
      });
    });
  }
  
  if (rows.length === 0) {
    rows.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']);
  }
  
  return {
    headerRow,
    rows,
    totalVenuePrice
  };
};

// 기타 정보 생성 - 개별 항목으로 표시
const createEtcSection = (reservationData) => {
  const headerRow = ['항목', '단가', '금액', '할인', '합계', '비고'];
  const rows = [];
  let totalEtcPrice = 0;

  const detail = reservationData.getPage1ById;
  
  // Page4 재료비 및 기타비용 데이터 처리
  if (detail.page4_expenses && detail.page4_expenses.length > 0) {
    console.log('Excel createEtcSection - Using page4_expenses data');

    detail.page4_expenses.forEach(page4 => {
      // 재료 항목들 개별 처리
      if (page4.materials && page4.materials.length > 0) {
        page4.materials.forEach(material => {
          const amount = material.total || 0;
          const discount = 0; // 할인 정보가 없으므로 0으로 설정
          const total = amount - discount;
          totalEtcPrice += total;

          rows.push([
            material.name || material.material_type || '재료비',
            material.amount || 0, // 단가
            amount, // 금액
            discount,
            total,
            truncateText(material.note || 'Page4 재료비')
          ]);
        });
      }

      // 기타비용 항목들 개별 처리
      if (page4.expenses && page4.expenses.length > 0) {
        page4.expenses.forEach(expense => {
          const amount = expense.amount || 0;
          const discount = 0; // 할인 정보가 없으므로 0으로 설정
          const total = amount - discount;
          totalEtcPrice += total;

          rows.push([
            expense.name || expense.expense_type || '기타비',
            expense.price || 0, // 단가
            amount, // 금액
            discount,
            total,
            truncateText(expense.note || 'Page4 기타비')
          ]);
        });
      }
    });
  }

  // 항목이 없는 경우 빈 행 추가
  if (rows.length === 0) {
    rows.push(['-', '-', '-', '-', '-', '-']);
  }

  console.log('Excel createEtcSection - Final result:', {
    totalItems: rows.length,
    totalEtcPrice,
    items: rows.map(row => row[0])
  });

  return {
    headerRow,
    rows,
    totalEtcPrice
  };
};

// 엑셀 내보내기 함수
export const exportToExcel = (reservationData) => {
  try {
    // 예약 데이터 가져오기
    if (!reservationData || !reservationData.getPage1ById) {
      console.error('No reservation data available');
      return false;
    }
    
    const detail = reservationData.getPage1ById;
    const page3Data = detail.page3 || {};
    
    // JSON 데이터 파싱
    const roomSelections = parseJsonData(page3Data.room_selections);
    const mealPlans = parseJsonData(page3Data.meal_plans);
    const placeReservations = parseJsonData(page3Data.place_reservations);
    
    // 프로그램 정보 수집
    let programs = [];
    if (detail.page2_reservations && detail.page2_reservations.length > 0) {
      detail.page2_reservations.forEach(page2 => {
        if (page2.programs && page2.programs.length > 0) {
          programs = [...programs, ...page2.programs];
        }
      });
    }
    
    // 각 섹션 데이터 생성
    const accommodationSection = createAccommodationSection(roomSelections);
    const mealSection = createMealSection(mealPlans);
    const programSection = createProgramSection(programs);
    const venueSection = createVenueSection(placeReservations);
    const etcSection = createEtcSection(reservationData);
    
    // 총 금액 계산
    const totalAmount = 
      accommodationSection.totalRoomPrice + 
      mealSection.totalMealPrice + 
      programSection.totalProgramPrice + 
      venueSection.totalVenuePrice + 
      etcSection.totalEtcPrice;
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 워크시트 데이터 구성
    const wsData = [];
    
    // 제목 추가
    wsData.push([{ v: '단체행사 견적/계약서', t: 's', s: titleStyle }]);
    wsData.push([]);
    
    // 안내문구 추가
    wsData.push([{ 
      v: '하이힐링원 관심을 가져와 주심에 감사드리며 아래와 같이 견적서를 제출합니다.', 
      t: 's', 
      s: {
        ...defaultStyle,
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }]);
    wsData.push([{ 
      v: '아울러 하이힐링원은 본 행사의 성공적인 개최를 위해 최선을 다할 것을 약속드립니다.', 
      t: 's', 
      s: {
        ...defaultStyle,
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }]);
    wsData.push([]);
    
    // 기본 정보 테이블 추가
    const basicInfoHeaders = [
      { v: '단 체 명', t: 's', s: headerStyle },
      { v: detail.group_name, t: 's', s: defaultStyle },
      { v: '고객명', t: 's', s: headerStyle },
      { v: 'H.P', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoHeaders);
    
    const dateRange = `${moment(detail.start_date).format('YY.MM.DD')}(${moment(detail.start_date).format('ddd')})~${moment(detail.end_date).format('DD')}(${moment(detail.end_date).format('ddd')}), ${moment(detail.end_date).diff(moment(detail.start_date), 'days') + 1}박${moment(detail.end_date).diff(moment(detail.start_date), 'days')}일`;
    const basicInfoRow2 = [
      { v: '행 사 명', t: 's', s: headerStyle },
      { v: detail.group_name, t: 's', s: defaultStyle },
      { v: 'TEL', t: 's', s: headerStyle },
      { v: detail.mobile_phone || detail.landline_phone, t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow2);
    
    const basicInfoRow3 = [
      { v: '행사 일정', t: 's', s: headerStyle },
      { v: dateRange, t: 's', s: defaultStyle },
      { v: 'E-mail', t: 's', s: headerStyle },
      { v: detail.email, t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow3);
    
    const basicInfoRow4 = [
      { v: '행사 인원', t: 's', s: headerStyle },
      { v: `${detail.total_count}명`, t: 's', s: defaultStyle },
      { v: '담당자', t: 's', s: headerStyle },
      { v: detail.reservation_manager || '김재훈', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow4);
    
    wsData.push([]);
    
    // 금액 요약 테이블 추가
    const summaryHeaders = [
      { v: '금액', t: 's', s: headerBigStyle },
      { v: '객실', t: 's', s: headerStyle },
      { v: '식사', t: 's', s: headerStyle },
      { v: '프로그램', t: 's', s: headerStyle },
      { v: '대관', t: 's', s: headerStyle },
      { v: '기타', t: 's', s: headerStyle },
      { v: '최종금액', t: 's', s: headerStyle },
    ];
    wsData.push(summaryHeaders);
    
    const summaryValues = [
      { v: '\\', t: 's', s: boldStyle },
      { v: accommodationSection.totalRoomPrice.toLocaleString(), t: 's', s: defaultStyle },
      { v: mealSection.totalMealPrice.toLocaleString(), t: 's', s: defaultStyle },
      { v: programSection.totalProgramPrice.toLocaleString(), t: 's', s: defaultStyle },
      { v: venueSection.totalVenuePrice.toLocaleString(), t: 's', s: defaultStyle },
      { v: etcSection.totalEtcPrice.toLocaleString(), t: 's', s: defaultStyle },
      { v: totalAmount.toLocaleString(), t: 's', s: yellowStyle },
    ];
    wsData.push(summaryValues);
    
    const noteRow = [
      { v: '비 고', t: 's', s: headerStyle },
      { 
        v: '체크인전 입금, 취소마감 7일전', 
        t: 's', 
        s: defaultStyle 
      }
    ];
    wsData.push(noteRow);
    
    wsData.push([]);
    
    // 객실 섹션 추가
    wsData.push([{ v: '• 객실', t: 's', s: boldStyle }]);
    
    const accommodationHeaderRow = accommodationSection.headerRow.map(h => ({ v: h, t: 's', s: headerStyle }));
    wsData.push(accommodationHeaderRow);
    
    accommodationSection.rows.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    wsData.push([{ v: '소 계', t: 's', s: headerStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: accommodationSection.totalRoomPrice.toLocaleString(), t: 's', s: boldStyle }]);
    
    wsData.push([]);
    
    // 식사 섹션 추가
    wsData.push([{ v: '• 식사', t: 's', s: boldStyle }]);
    
    const mealHeaderRow = mealSection.headerRow.map(h => ({ v: h, t: 's', s: headerStyle }));
    wsData.push(mealHeaderRow);
    
    mealSection.rows.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    wsData.push([{ v: '소 계', t: 's', s: headerStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: mealSection.totalMealPrice.toLocaleString(), t: 's', s: boldStyle }]);
    
    wsData.push([]);
    
    // 프로그램 섹션 추가
    wsData.push([{ v: '• 프로그램', t: 's', s: boldStyle }]);
    
    const programHeaderRow = programSection.headerRow.map(h => ({ v: h, t: 's', s: headerStyle }));
    wsData.push(programHeaderRow);
    
    programSection.rows.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    wsData.push([{ v: '소 계', t: 's', s: headerStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: programSection.totalProgramPrice.toLocaleString(), t: 's', s: boldStyle }]);
    
    wsData.push([]);
    
    // 대관 섹션 추가
    wsData.push([{ v: '• 대관', t: 's', s: boldStyle }]);
    
    const venueHeaderRow = venueSection.headerRow.map(h => ({ v: h, t: 's', s: headerStyle }));
    wsData.push(venueHeaderRow);
    
    venueSection.rows.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    wsData.push([{ v: '소 계', t: 's', s: headerStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: '', t: 's', s: defaultStyle }, { v: venueSection.totalVenuePrice.toLocaleString(), t: 's', s: boldStyle }]);
    
    wsData.push([]);
    
    // 기타 섹션 추가
    wsData.push([{ v: '• 기타', t: 's', s: boldStyle }]);
    
    const etcHeaderRow = etcSection.headerRow.map(h => ({ v: h, t: 's', s: headerStyle }));
    wsData.push(etcHeaderRow);
    
    etcSection.rows.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    // 소계 행의 길이를 헤더 길이에 맞춤
    const etcFooterRow = [{ v: '소 계', t: 's', s: headerStyle }];
    for (let i = 0; i < etcSection.headerRow.length - 2; i++) {
      etcFooterRow.push({ v: '', t: 's', s: defaultStyle });
    }
    etcFooterRow.push({ v: etcSection.totalEtcPrice.toLocaleString(), t: 's', s: boldStyle });
    wsData.push(etcFooterRow);
    
    wsData.push([]);
    
    // 날짜 및 서명 섹션
    const dateRow = [{ 
      v: `${moment().format('YYYY년 MM월 DD일')}`, 
      t: 's', 
      s: {
        ...defaultStyle,
        alignment: { horizontal: 'center', vertical: 'center' }
      } 
    }];
    wsData.push(dateRow);
    
    wsData.push([]);
    
    const signatureRow1 = [
      { v: '회 사 명 : (주)산림힐링헬스케어', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: `회 사 명 : ${detail.group_name || '-'}`, t: 's', s: defaultStyle }
    ];
    wsData.push(signatureRow1);
    
    const signatureRow2 = [
      { v: `담 당 자 : ${detail.reservation_manager || '김재훈'}`, t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: `담 당 자 : ${detail.customer_name || '-'}                    (인)`, t: 's', s: defaultStyle }
    ];
    wsData.push(signatureRow2);
    
    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 셀 병합 정보 설정
    const merges = [
      // 제목 병합
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      // 안내문구 병합
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
      // 비고 병합
      { s: { r: 12, c: 1 }, e: { r: 12, c: 6 } },
      // 날짜 병합
      { s: { r: wsData.length - 3, c: 0 }, e: { r: wsData.length - 3, c: 6 } },
    ];
    
    ws['!merges'] = merges;
    
    // 열 너비 설정
    ws['!cols'] = [
      { wch: 15 }, // A
      { wch: 20 }, // B
      { wch: 15 }, // C
      { wch: 15 }, // D
      { wch: 15 }, // E
      { wch: 15 }, // F
      { wch: 15 }, // G
      { wch: 15 }, // H
      { wch: 15 }, // I
      { wch: 15 }, // J
    ];
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '견적서');
    
    // 파일명 생성
    const fileName = `견적서_${detail.group_name}_${moment().format('YYYYMMDD')}.xlsx`;
    
    // 파일 저장
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    return false;
  }
};

export default exportToExcel; 