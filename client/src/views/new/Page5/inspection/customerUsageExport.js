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
  fill: { fgColor: { rgb: 'ffff00' }, patternType: 'solid' }
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

// 실제 데이터로 계산하는 함수 추가
const calculateTotals = (roomSelections, mealPlans, programs, placeReservations) => {
  let roomTotal = 0;
  let mealTotal = 0;
  let programTotal = 0;
  let venueTotal = 0;
  let etcTotal = 0;
  
  // 객실 계산
  if (roomSelections && roomSelections.length > 0) {
    roomSelections.forEach(room => {
      console.log('customerUsageExport - 객실 정보:', room);
      
      // page3와 동일한 계산 공식 적용
      const baseRoomPrice = room.price ? parseInt(room.price) : 0;
      const nights = room.nights ? parseInt(room.nights) : 1;
      const occupancy = room.occupancy ? parseInt(room.occupancy) : 1;
      const capacity = room.capacity ? parseInt(room.capacity) : 1;
      
      let roomTotalPrice = 0;
      
      // total_price가 수동으로 입력된 값이 있으면 우선 사용
      if (room.total_price && parseInt(room.total_price) > 0) {
        roomTotalPrice = parseInt(room.total_price);
        console.log('customerUsageExport - total_price(수동입력) 사용:', roomTotalPrice);
      } else {
        // page3와 동일한 계산 공식 적용:
        // 1. Base price for the room multiplied by nights
        // 2. Additional charge of 10,000 won per person when exceeding room capacity
        roomTotalPrice = baseRoomPrice * nights;
        
        // Add extra charge for people exceeding room capacity (10,000 won per extra person per night)
        if (occupancy > capacity) {
          const extraPeople = occupancy - capacity;
          const extraCharge = extraPeople * 10000 * nights; // 10,000 won per extra person per night
          roomTotalPrice += extraCharge;
          console.log(`customerUsageExport - 인원수 초과 요금: ${extraPeople}명 × 10,000원 × ${nights}박 = ${extraCharge}원`);
        }
        
        console.log('customerUsageExport - page3 공식으로 계산된 가격:', {
          객실타입: room.room_type,
          기본가격: baseRoomPrice,
          박수: nights,
          투숙인원: occupancy,
          객실정원: capacity,
          계산된가격: roomTotalPrice
        });
      }
      
      roomTotal += roomTotalPrice;
    });
  }
  
  // 식사 계산
  if (mealPlans && mealPlans.length > 0) {
    mealPlans.forEach(meal => {
      const price = meal.price || 0;
      const participants = meal.participants || 0;
      let subtotal = 0;
      
      if (participants > 0) {
        const unitPrice = Math.round(price / participants);
        subtotal = unitPrice * participants;
      } else {
        subtotal = price;
      }
      
      const koreanType = 
        meal.meal_type === 'breakfast' ? '조식' : 
        meal.meal_type === 'lunch' ? '중식' : 
        meal.meal_type === 'dinner' ? '석식' : meal.meal_type || '기타';
      
      // 10% 할인 적용
      const discount = Math.round(subtotal * 0.1);
      const total = subtotal - discount;
      
      mealTotal += subtotal;
    });
  }
  
  // 프로그램 계산
  if (programs && programs.length > 0) {
    programs.forEach(program => {
      if (!program) return;
      const price = program.price || 0;
      programTotal += price;
    });
  }
  
  // 대관 계산
  if (placeReservations && placeReservations.length > 0) {
    placeReservations.forEach(place => {
      const price = place.price || 0;
      venueTotal += price;
    });
  }
  
  const totalAmount = roomTotal + mealTotal + programTotal + venueTotal + etcTotal;
  
  return {
    roomTotal,
    mealTotal,
    programTotal,
    venueTotal,
    etcTotal,
    totalAmount
  };
};

// 고객이용내역서 엑셀 내보내기 함수
export const exportCustomerUsageExcel = (reservationData) => {
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
    
    // 실제 데이터로 금액 계산
    const totals = calculateTotals(roomSelections, mealPlans, programs, placeReservations);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 워크시트 데이터 구성
    const wsData = [];
    
    // 제목 추가
    wsData.push([{ v: '고객 이용 내역서', t: 's', s: titleStyle }]);
    wsData.push([]);
    
    // 실적 현황 테이블 타이틀 추가 (이 부분은 이미지에서 파란 배경색 부분)
    const reportTitleRow = [{ 
      v: `하이힐링원 ${moment().format('YYYY')}년 ${moment().format('M')}월 수익 실적`, 
      t: 's', 
      s: {
        alignment: {
          vertical: 'center',
          horizontal: 'center'
        },
        font: {
          sz: 14,
          name: '굴림',
          bold: true,
          color: { rgb: '000000' }
        },
        fill: { fgColor: { rgb: 'daeef3' }, patternType: 'solid' }
      }
    }];
    wsData.push(reportTitleRow);
    
    // 메인 테이블 헤더 행 추가
    const mainTableHeaders = [
      { v: '월', t: 's', s: headerStyle },
      { v: '일', t: 's', s: headerStyle },
      { v: '단체', t: 's', s: headerStyle },
      { v: '일반', t: 's', s: headerStyle },
      { v: '행위중독예방', t: 's', s: headerStyle },
      { v: '단체명', t: 's', s: headerStyle },
      { v: '객실', t: 's', s: headerStyle },
      { v: '식사', t: 's', s: headerStyle },
      { v: '프로그램', t: 's', s: headerStyle },
      { v: '체험비', t: 's', s: headerStyle },
      { v: 'VAT', t: 's', s: headerStyle },
      { v: '할인액', t: 's', s: headerStyle },
      { v: '계', t: 's', s: headerStyle },
      { v: '결제방법', t: 's', s: headerStyle },
      { v: '결제번호', t: 's', s: headerStyle },
      { v: '입금일자', t: 's', s: headerStyle },
      { v: '비고', t: 's', s: headerStyle }
    ];
    wsData.push(mainTableHeaders);
    
    // 실적 데이터 행 추가
    if (detail.start_date) {
      const reservationDate = moment(detail.start_date);
      const reservationMonth = reservationDate.format('M');
      const reservationDay = reservationDate.format('D');
      
      // 객실 금액
      if (totals.roomTotal > 0) {
        const roomRow = Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle }));
        roomRow[0] = { v: reservationMonth, t: 's', s: defaultStyle }; // 월
        roomRow[1] = { v: reservationDay, t: 's', s: defaultStyle }; // 일
        roomRow[2] = { v: '단체', t: 's', s: defaultStyle }; // 유형 (단체/일반)
        roomRow[3] = { v: '일반', t: 's', s: defaultStyle }; // 일반
        roomRow[4] = { v: detail.service_type || '행위중독예방', t: 's', s: defaultStyle }; // 행위중독예방
        roomRow[5] = { v: detail.group_name || '', t: 's', s: defaultStyle }; // 단체명
        roomRow[6] = { v: totals.roomTotal.toLocaleString(), t: 's', s: defaultStyle }; // 객실
        roomRow[12] = { v: totals.roomTotal.toLocaleString(), t: 's', s: defaultStyle }; // 계
        wsData.push(roomRow);
      }
      
      // 식사 금액
      if (totals.mealTotal > 0) {
        const mealRow = Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle }));
        mealRow[0] = { v: reservationMonth, t: 's', s: defaultStyle }; // 월
        mealRow[1] = { v: reservationDay, t: 's', s: defaultStyle }; // 일
        mealRow[2] = { v: '단체', t: 's', s: defaultStyle }; // 유형 (단체/일반)
        mealRow[3] = { v: '일반', t: 's', s: defaultStyle }; // 일반
        mealRow[4] = { v: detail.service_type || '행위중독예방', t: 's', s: defaultStyle }; // 행위중독예방
        mealRow[5] = { v: detail.group_name || '', t: 's', s: defaultStyle }; // 단체명
        mealRow[7] = { v: totals.mealTotal.toLocaleString(), t: 's', s: defaultStyle }; // 식사
        mealRow[12] = { v: totals.mealTotal.toLocaleString(), t: 's', s: defaultStyle }; // 계
        wsData.push(mealRow);
      }
      
      // 프로그램 금액
      if (totals.programTotal > 0) {
        const programRow = Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle }));
        programRow[0] = { v: reservationMonth, t: 's', s: defaultStyle }; // 월
        programRow[1] = { v: reservationDay, t: 's', s: defaultStyle }; // 일
        programRow[2] = { v: '단체', t: 's', s: defaultStyle }; // 유형 (단체/일반)
        programRow[3] = { v: '일반', t: 's', s: defaultStyle }; // 일반
        programRow[4] = { v: detail.service_type || '행위중독예방', t: 's', s: defaultStyle }; // 행위중독예방
        programRow[5] = { v: detail.group_name || '', t: 's', s: defaultStyle }; // 단체명
        programRow[8] = { v: totals.programTotal.toLocaleString(), t: 's', s: defaultStyle }; // 프로그램
        programRow[12] = { v: totals.programTotal.toLocaleString(), t: 's', s: defaultStyle }; // 계
        wsData.push(programRow);
      }
      
      // 대관 금액
      if (totals.venueTotal > 0) {
        const venueRow = Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle }));
        venueRow[0] = { v: reservationMonth, t: 's', s: defaultStyle }; // 월
        venueRow[1] = { v: reservationDay, t: 's', s: defaultStyle }; // 일
        venueRow[2] = { v: '단체', t: 's', s: defaultStyle }; // 유형 (단체/일반)
        venueRow[3] = { v: '일반', t: 's', s: defaultStyle }; // 일반
        venueRow[4] = { v: detail.service_type || '행위중독예방', t: 's', s: defaultStyle }; // 행위중독예방
        venueRow[5] = { v: detail.group_name || '', t: 's', s: defaultStyle }; // 단체명
        venueRow[9] = { v: totals.venueTotal.toLocaleString(), t: 's', s: defaultStyle }; // 체험비
        venueRow[12] = { v: totals.venueTotal.toLocaleString(), t: 's', s: defaultStyle }; // 계
        wsData.push(venueRow);
      }
      
      // 합계 행
      if (totals.totalAmount > 0) {
        const totalRow = Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle }));
        totalRow[5] = { v: '합계', t: 's', s: boldStyle }; // 단체명
        totalRow[6] = { v: totals.roomTotal.toLocaleString(), t: 's', s: boldStyle }; // 객실
        totalRow[7] = { v: totals.mealTotal.toLocaleString(), t: 's', s: boldStyle }; // 식사
        totalRow[8] = { v: totals.programTotal.toLocaleString(), t: 's', s: boldStyle }; // 프로그램
        totalRow[9] = { v: totals.venueTotal.toLocaleString(), t: 's', s: boldStyle }; // 체험비
        totalRow[12] = { v: totals.totalAmount.toLocaleString(), t: 's', s: boldStyle }; // 계
        wsData.push(totalRow);
      }
      
      // 빈 줄 추가
      wsData.push(Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle })));
    }
    
    // 추가 빈 줄 삽입
    wsData.push(Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle })));
    wsData.push(Array(17).fill().map(() => ({ v: '', t: 's', s: defaultStyle })));
    
    // 고객 이용 내역서 섹션 타이틀 추가
    wsData.push([{ 
      v: '고객 이용 내역서', 
      t: 's', 
      s: {
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
      }
    }]);
    wsData.push([]);
    
    // 안내문구 추가
    wsData.push([{ 
      v: '하이힐링원을 이용해주셔서 감사합니다', 
      t: 's', 
      s: {
        alignment: {
          vertical: 'center',
          horizontal: 'center'
        },
        font: {
          sz: 12,
          name: '굴림',
          bold: true,
          color: { rgb: '000000' }
        }
      }
    }]);
    wsData.push([]);
    
    // 기본 정보 테이블 추가
    const basicInfoHeaders = [
      { v: '단 체 명', t: 's', s: headerStyle },
      { v: detail.group_name || '태백시정신건강복지센터', t: 's', s: defaultStyle },
      { v: '고객명', t: 's', s: headerStyle },
      { v: detail.customer_name || '정지은 선생님', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoHeaders);
    
    const basicInfoRow2 = [
      { v: '행 사 명', t: 's', s: headerStyle },
      { v: detail.group_name || '태백시정신건강복지센터', t: 's', s: defaultStyle },
      { v: 'H.P', t: 's', s: headerStyle },
      { v: detail.mobile_phone || '010-5178-6269', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow2);
    
    const basicInfoRow3 = [
      { v: '행사 일정', t: 's', s: headerStyle },
      { v: detail.start_date ? `${moment(detail.start_date).format('YY.MM.DD')}(${moment(detail.start_date).format('ddd')})~${moment(detail.end_date).format('DD')}(${moment(detail.end_date).format('ddd')}), ${moment(detail.end_date).diff(moment(detail.start_date), 'days') + 1}박${moment(detail.end_date).diff(moment(detail.start_date), 'days')}일` : '24.08.24(토)~25(일), 1박2일', t: 's', s: defaultStyle },
      { v: 'TEL', t: 's', s: headerStyle },
      { v: detail.landline_phone || '033-554-1278', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow3);
    
    const basicInfoRow4 = [
      { v: '행사 인원', t: 's', s: headerStyle },
      { v: detail.total_count ? `${detail.total_count}명` : '45명', t: 's', s: defaultStyle },
      { v: 'E-mail', t: 's', s: headerStyle },
      { v: detail.email || 'tmhc2012@naver.com', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow4);

    const basicInfoRow5 = [
      { v: '행사 장소', t: 's', s: headerStyle },
      { v: '하이힐링원', t: 's', s: defaultStyle },
      { v: '담당자', t: 's', s: headerStyle },
      { v: detail.reservation_manager || '김재훈', t: 's', s: defaultStyle },
    ];
    wsData.push(basicInfoRow5);
    
    wsData.push([]);
    
    // 금액 요약 테이블 추가
    const summaryHeaders = [
      { v: '금액', t: 's', s: headerStyle },
      { v: '객실', t: 's', s: headerStyle },
      { v: '식사', t: 's', s: headerStyle },
      { v: '프로그램', t: 's', s: headerStyle },
      { v: '대관', t: 's', s: headerStyle },
      { v: '기타', t: 's', s: headerStyle },
      { v: '최종금액', t: 's', s: yellowStyle },
    ];
    wsData.push(summaryHeaders);
    
    // 계산된 금액 사용
    const summaryValues = [
      { v: '\\', t: 's', s: boldStyle },
      { v: totals.roomTotal.toLocaleString(), t: 's', s: defaultStyle },
      { v: totals.mealTotal.toLocaleString(), t: 's', s: defaultStyle },
      { v: totals.programTotal.toLocaleString(), t: 's', s: defaultStyle },
      { v: totals.venueTotal.toLocaleString(), t: 's', s: defaultStyle },
      { v: totals.etcTotal.toLocaleString(), t: 's', s: defaultStyle },
      { v: totals.totalAmount.toLocaleString(), t: 's', s: yellowStyle },
    ];
    wsData.push(summaryValues);
    
    const noteRow = [
      { v: '비 고', t: 's', s: headerStyle },
      { 
        v: '예정지원 할인(숙박 및 대관 30%, 식사 10%, 프로그램 20%), 취소마감 절차', 
        t: 's', 
        s: defaultStyle 
      }
    ];
    wsData.push(noteRow);
    
    wsData.push([]);
    
    // 객실 섹션 추가
    wsData.push([{ v: '• 객실', t: 's', s: boldStyle }]);
    
    const accommodationHeaders = [
      { v: '일자', t: 's', s: headerStyle },
      { v: '타입', t: 's', s: headerStyle },
      { v: '인원', t: 's', s: headerStyle },
      { v: '객실수', t: 's', s: headerStyle },
      { v: '숙박', t: 's', s: headerStyle },
      { v: '단가', t: 's', s: headerStyle },
      { v: '소계', t: 's', s: headerStyle },
      { v: '할인금액', t: 's', s: headerStyle },
      { v: '합계(VAT포함)', t: 's', s: headerStyle },
      { v: '비고', t: 's', s: headerStyle },
    ];
    wsData.push(accommodationHeaders);
    
    // 객실 데이터 추가
    let accommodationData = [];
    if (roomSelections && roomSelections.length > 0) {
      // 객실 데이터 그룹화 함수 (같은 일자, 같은 객실종류별로 그룹화)
      const groupRoomSelections = (roomSelections) => {
        const grouped = {};
        
        roomSelections.forEach(room => {
          const date = room.check_in_date ? moment(room.check_in_date).format('MM월 DD일') : '-';
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
          
          let roomTotalPrice = 0;
          
          if (room.total_price && parseInt(room.total_price) > 0) {
            roomTotalPrice = parseInt(room.total_price);
          } else {
            roomTotalPrice = baseRoomPrice * nights;
            if (occupancy > capacity) {
              const extraPeople = occupancy - capacity;
              const extraCharge = extraPeople * 10000 * nights;
              roomTotalPrice += extraCharge;
            }
          }
          
          const discount = Math.round(roomTotalPrice * 0.3); // 30% discount as an example
          const total = roomTotalPrice - discount;
          
          grouped[key].totalSubtotal += roomTotalPrice;
          grouped[key].totalDiscount += discount;
          grouped[key].totalAmount += total;
        });
        
        return Object.values(grouped);
      };

      const groupedRooms = groupRoomSelections(roomSelections);
      
      // 그룹화된 데이터로 행 생성
      groupedRooms.forEach((group) => {
        console.log('customerUsageExport - 그룹화된 객실 정보:', group);
        
        accommodationData.push([
          group.date,
          group.roomType,
          group.totalOccupancy.toString(),  // 총 인원
          group.totalQuantity.toString(),   // 총 객실수
          `${group.nights}박`,              // 숙박
          group.basePrice.toLocaleString(), // 단가
          group.totalSubtotal.toLocaleString(), // 소계
          group.totalDiscount.toLocaleString(), // 할인금액
          group.totalAmount.toLocaleString(),   // 합계(VAT포함)
          ''                                    // 비고
        ]);
      });
    }
    
    // If no room data, add a placeholder row
    if (accommodationData.length === 0) {
      accommodationData.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
    }
    
    accommodationData.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    // 객실 합계 추가
    wsData.push([
      { v: '소 계', t: 's', s: headerStyle }, 
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '1,201,200', t: 's', s: boldStyle },
      { v: '', t: 's', s: defaultStyle }
    ]);
    
    wsData.push([]);
    
    // 식사 섹션 추가
    wsData.push([{ v: '• 식사', t: 's', s: boldStyle }]);
    
    const mealHeaders = [
      { v: '일자', t: 's', s: headerStyle },
      { v: '구분', t: 's', s: headerStyle },
      { v: '메뉴', t: 's', s: headerStyle },
      { v: '제공횟수', t: 's', s: headerStyle },
      { v: '인원', t: 's', s: headerStyle },
      { v: '단가', t: 's', s: headerStyle },
      { v: '소계', t: 's', s: headerStyle },
      { v: '할인금액', t: 's', s: headerStyle },
      { v: '합계(VAT포함)', t: 's', s: headerStyle },
      { v: '비고', t: 's', s: headerStyle },
    ];
    wsData.push(mealHeaders);
    
    // 식사 데이터 추가
    let mealData = [];
    if (mealPlans && mealPlans.length > 0) {
      mealPlans.forEach(meal => {
        const mealDate = meal.date ? moment(meal.date).format('MM월 DD일') : '-';
        const price = meal.price || 0;
        const participants = meal.participants || 0;
        let subtotal = 0;
        
        if (participants > 0) {
          const unitPrice = Math.round(price / participants);
          subtotal = unitPrice * participants;
        } else {
          subtotal = price;
        }
        
        const koreanType = 
          meal.meal_type === 'breakfast' ? '조식' : 
          meal.meal_type === 'lunch' ? '중식' : 
          meal.meal_type === 'dinner' ? '석식' : meal.meal_type || '기타';
        
        // 10% 할인 적용
        const discount = Math.round(subtotal * 0.1);
        const total = subtotal - discount;
        
        mealData.push([
          mealDate,
          koreanType,
          meal.meal_option || '일반식',
          '1', // 제공횟수
          participants.toString(),
          subtotal.toLocaleString(),
          discount.toLocaleString(),
          total.toLocaleString(),
          ''
        ]);
      });
    }
    
    // If no meal data, add a placeholder row
    if (mealData.length === 0) {
      mealData.push(['-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
    }
    
    mealData.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    // 식사 합계 추가
    wsData.push([
      { v: '소 계', t: 's', s: headerStyle }, 
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '1,737,450', t: 's', s: boldStyle },
      { v: '', t: 's', s: defaultStyle }
    ]);
    
    wsData.push([]);
    
    // 프로그램 섹션 추가
    wsData.push([{ v: '• 프로그램', t: 's', s: boldStyle }]);
    
    const programHeaders = [
      { v: '일자', t: 's', s: headerStyle },
      { v: '프로그램명', t: 's', s: headerStyle },
      { v: '차수', t: 's', s: headerStyle },
      { v: '회수', t: 's', s: headerStyle },
      { v: '단가', t: 's', s: headerStyle },
      { v: '소계', t: 's', s: headerStyle },
      { v: '할인금액', t: 's', s: headerStyle },
      { v: '합계(VAT포함)', t: 's', s: headerStyle },
      { v: '비고', t: 's', s: headerStyle },
    ];
    wsData.push(programHeaders);
    
    // 프로그램 데이터 추가
    let programData = [];
    if (programs && programs.length > 0) {
      programs.forEach(program => {
        if (!program) return;
        
        const programDate = program.date ? moment(program.date).format('MM월 DD일') : '-';
        const price = program.price || 0;
        
        // 20% 할인 적용
        const discount = Math.round(price * 0.2);
        const total = price - discount;
        
        programData.push([
          programDate,
          program.program_name || program.name || '-',
          '1', // 차수
          '1', // 회수
          price.toLocaleString(),
          price.toLocaleString(),
          discount.toLocaleString(),
          total.toLocaleString(),
          '' // 비고
        ]);
      });
    }
    
    // If no program data, add a placeholder row
    if (programData.length === 0) {
      programData.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']);
    }
    
    programData.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    // 프로그램 합계 추가
    wsData.push([
      { v: '소 계', t: 's', s: headerStyle }, 
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '3,498,000', t: 's', s: boldStyle },
      { v: '', t: 's', s: defaultStyle }
    ]);
    
    wsData.push([]);
    
    // 대관 섹션 추가
    wsData.push([{ v: '• 대관', t: 's', s: boldStyle }]);
    
    const venueHeaders = [
      { v: '일자', t: 's', s: headerStyle },
      { v: '대관장소', t: 's', s: headerStyle },
      { v: '회수', t: 's', s: headerStyle },
      { v: '시간', t: 's', s: headerStyle },
      { v: '단가', t: 's', s: headerStyle },
      { v: '소계', t: 's', s: headerStyle },
      { v: '할인금액', t: 's', s: headerStyle },
      { v: '합계(VAT포함)', t: 's', s: headerStyle },
      { v: '비고', t: 's', s: headerStyle },
    ];
    wsData.push(venueHeaders);
    
    // 대관 데이터 추가
    let venueData = [];
    if (placeReservations && placeReservations.length > 0) {
      placeReservations.forEach(place => {
        const placeDate = place.date ? moment(place.date).format('MM월 DD일') : '-';
        const startTime = place.start_time || '';
        const endTime = place.end_time || '';
        let hours = 1;
        
        // 시작 시간과 종료 시간이 있는 경우 시간 계산
        if (startTime && endTime) {
          const start = moment(startTime, 'HH:mm');
          const end = moment(endTime, 'HH:mm');
          if (start.isValid() && end.isValid()) {
            hours = Math.max(1, Math.round(end.diff(start, 'hours', true)));
          }
        }
        
        const price = place.price || 0;
        const subtotal = price;
        
        // 30% 할인 적용
        const discount = Math.round(subtotal * 0.3);
        const total = subtotal - discount;
        
        venueData.push([
          placeDate,
          place.place_name || '-',
          '1', // 회수
          hours.toString(),
          (price / hours).toLocaleString(), // 시간당 단가
          subtotal.toLocaleString(),
          discount.toLocaleString(),
          total.toLocaleString(),
          '' // 비고
        ]);
      });
    }
    
    // If no venue data, add a placeholder row
    if (venueData.length === 0) {
      venueData.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']);
    }
    
    venueData.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    // 대관 합계 추가
    wsData.push([
      { v: '소 계', t: 's', s: headerStyle }, 
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '462,000', t: 's', s: boldStyle },
      { v: '', t: 's', s: defaultStyle }
    ]);
    
    wsData.push([]);
    
    // 기타 섹션 추가
    wsData.push([{ v: '• 기타', t: 's', s: boldStyle }]);
    
    const etcHeaders = [
      { v: '일자', t: 's', s: headerStyle },
      { v: '항목', t: 's', s: headerStyle },
      { v: '회수', t: 's', s: headerStyle },
      { v: '수량', t: 's', s: headerStyle },
      { v: '단가', t: 's', s: headerStyle },
      { v: '소계', t: 's', s: headerStyle },
      { v: '할인금액', t: 's', s: headerStyle },
      { v: '합계(VAT포함)', t: 's', s: headerStyle },
      { v: '비고', t: 's', s: headerStyle },
    ];
    wsData.push(etcHeaders);
    
    // 기타 데이터 추가 - 실제 데이터 사용
    let etcData = [];
    
    // totals.etcItems에서 실제 기타 항목 데이터 가져오기
    if (totals.etcItems && totals.etcItems.length > 0) {
      totals.etcItems.forEach(item => {
        etcData.push([
          '-', // 일자
          item.name, // 항목명
          '1', // 회수
          '1', // 수량
          item.amount.toLocaleString(), // 단가
          item.amount.toLocaleString(), // 소계
          item.discount.toLocaleString(), // 할인금액
          item.total.toLocaleString(), // 합계
          '' // 비고
        ]);
      });
    }
    
    // If no etc data, add a placeholder row
    if (etcData.length === 0) {
      etcData.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']);
    }
    
    etcData.forEach(row => {
      const styledRow = row.map(cell => ({ v: cell, t: 's', s: defaultStyle }));
      wsData.push(styledRow);
    });
    
    // 기타 합계 추가 - 실제 계산된 값 사용
    wsData.push([
      { v: '소 계', t: 's', s: headerStyle }, 
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: totals.etcTotal.toLocaleString(), t: 's', s: boldStyle },
      { v: '', t: 's', s: defaultStyle }
    ]);
    
    wsData.push([]);
    
    // 날짜 및 서명 섹션
    const dateRow = [{ 
      v: `2024년 8월 28일`, 
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
      { v: '회 사 명 :', t: 's', s: defaultStyle },
      { v: '태백시정신건강복지센터', t: 's', s: defaultStyle },
    ];
    wsData.push(signatureRow1);
    
    const signatureRow2 = [
      { v: '담 당 자 :', t: 's', s: defaultStyle },
      { v: detail.reservation_manager || '김재훈', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '', t: 's', s: defaultStyle },
      { v: '담 당 자 :', t: 's', s: defaultStyle },
      { v: detail.customer_name || '정지은 선생님', t: 's', s: defaultStyle },
      { v: '(인)', t: 's', s: defaultStyle }
    ];
    wsData.push(signatureRow2);
    
    // 워크시트 생성
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 셀 병합 정보 설정
    const merges = [
      // 제목 병합
      { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } },
      // 실적 현황 타이틀 병합
      { s: { r: 2, c: 0 }, e: { r: 2, c: 16 } },
      // 고객 이용 내역서 섹션 타이틀 병합
      { s: { r: wsData.length - 15, c: 0 }, e: { r: wsData.length - 15, c: 16 } },
      // 안내문구 병합
      { s: { r: wsData.length - 13, c: 0 }, e: { r: wsData.length - 13, c: 16 } },
      // 비고 병합
      { s: { r: 14, c: 1 }, e: { r: 14, c: 16 } },
      // 날짜 병합
      { s: { r: wsData.length - 3, c: 0 }, e: { r: wsData.length - 3, c: 16 } },
    ];
    
    ws['!merges'] = merges;
    
    // 열 너비 설정
    ws['!cols'] = [
      { wch: 6 },  // A - 월
      { wch: 6 },  // B - 일
      { wch: 8 },  // C - 단체
      { wch: 8 },  // D - 일반
      { wch: 14 }, // E - 행위중독예방
      { wch: 30 }, // F - 단체명
      { wch: 15 }, // G - 객실
      { wch: 15 }, // H - 식사
      { wch: 15 }, // I - 프로그램
      { wch: 15 }, // J - 체험비
      { wch: 12 }, // K - VAT
      { wch: 12 }, // L - 할인액
      { wch: 15 }, // M - 계
      { wch: 12 }, // N - 결제방법
      { wch: 12 }, // O - 결제번호
      { wch: 12 }, // P - 입금일자
      { wch: 20 }, // Q - 비고
    ];
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, '고객이용내역서');
    
    // 파일명 생성
    const fileName = `고객이용내역서_${detail.group_name || '태백시정신건강복지센터'}_${moment().format('YYYYMMDD')}.xlsx`;
    
    // 파일 저장
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    return false;
  }
};

export default exportCustomerUsageExcel; 