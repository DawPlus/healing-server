import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import 'moment/locale/ko';
import html2canvas from 'html2canvas';

/**
 * Export customer usage report as PDF
 * @param {Object} reservationData - The reservation data
 * @returns {boolean} - Whether the export was successful
 */
export const exportCustomerUsagePdf = async (reservationData) => {
  try {
    if (!reservationData || !reservationData.getPage1ById) {
      console.error('Invalid reservation data');
      return false;
    }

    moment.locale('ko');
    
    // Extract reservation data
    const reservation = reservationData.getPage1ById;
    const page3Data = reservation.page3 || {};
    
    // Parse JSON data
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
    
    // Get room selections, meal plans, and place reservations
    const roomSelections = parseJsonData(page3Data.room_selections);
    const mealPlans = parseJsonData(page3Data.meal_plans);
    const placeReservations = parseJsonData(page3Data.place_reservations);
    
    // Get programs
    let programs = [];
    if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
      reservation.page2_reservations.forEach(page2 => {
        const progs = parseJsonData(page2.programs);
        if (progs && progs.length > 0) {
          programs = [...programs, ...progs];
        }
      });
    }
    
    // Calculate totals
    let roomTotal = 0;
    let mealTotal = 0;
    let programTotal = 0;
    let venueTotal = 0;
    
    // Calculate room total
    if (roomSelections && roomSelections.length > 0) {
      roomSelections.forEach(room => {
        console.log('customerUsagePdf - 객실 정보:', room);
        
        // page3와 동일한 계산 공식 적용
        const baseRoomPrice = room.price ? parseInt(room.price) : 0;
        const nights = room.nights ? parseInt(room.nights) : 1;
        const occupancy = room.occupancy ? parseInt(room.occupancy) : 1;
        const capacity = room.capacity ? parseInt(room.capacity) : 1;
        
        let roomTotalPrice = 0;
        
        // total_price가 수동으로 입력된 값이 있으면 우선 사용
        if (room.total_price && parseInt(room.total_price) > 0) {
          roomTotalPrice = parseInt(room.total_price);
          console.log('customerUsagePdf - total_price(수동입력) 사용:', roomTotalPrice);
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
            console.log(`customerUsagePdf - 인원수 초과 요금: ${extraPeople}명 × 10,000원 × ${nights}박 = ${extraCharge}원`);
          }
          
          console.log('customerUsagePdf - page3 공식으로 계산된 가격:', {
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
    
    // Calculate meal total
    if (mealPlans && mealPlans.length > 0) {
      mealPlans.forEach(meal => {
        const price = meal.price || 0;
        const participants = meal.participants || 0;
        let subtotal = 0;
        let unitPrice = 0;
        
        if (participants > 0) {
          unitPrice = Math.round(price / participants);
          subtotal = unitPrice * participants;
        } else {
          unitPrice = price;
          subtotal = price;
        }
        
        const koreanType = 
          meal.meal_type === 'breakfast' ? '조식' : 
          meal.meal_type === 'lunch' ? '중식' : 
          meal.meal_type === 'dinner' ? '석식' : meal.meal_type || '기타';
        
        mealTotal += subtotal;
      });
    }
    
    // Calculate program total
    if (programs && programs.length > 0) {
      programs.forEach(program => {
        if (!program) return;
        const price = program.price || 0;
        programTotal += price;
      });
    }
    
    // Calculate venue total
    if (placeReservations && placeReservations.length > 0) {
      placeReservations.forEach(place => {
        const price = place.price || 0;
        venueTotal += price;
      });
    }
    
    const totalAmount = roomTotal + mealTotal + programTotal + venueTotal;
    
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    // Get the reservation period
    const startDate = moment(reservation.start_date);
    const endDate = moment(reservation.end_date);
    const usagePeriod = `${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')}`;
    
    // Create HTML content
    let htmlContent = `
      <div style="padding: 20px;">
        <div style="text-align: center; margin: 15px 0;">
          <h1 style="font-size: 24px;">고객 이용 내역서</h1>
        </div>
        
        <div style="text-align: center; margin: 15px 0;">
          <p style="font-size: 14px;">하이힐링원을 이용해주셔서 감사합니다</p>
        </div>
        
        <div style="margin-top: 20px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <tr>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold; width: 20%;">단체명</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center; width: 30%;">${reservation.group_name || '-'}</td>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold; width: 20%;">고객명</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center; width: 30%;">${reservation.customer_name || '-'}</td>
            </tr>
            <tr>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">행사명</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${reservation.group_name || '-'}</td>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">H.P</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${reservation.mobile_phone || '-'}</td>
            </tr>
            <tr>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">이용기간</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${usagePeriod}</td>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">인원</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${reservation.total_count || 0}명</td>
            </tr>
          </table>
        </div>
        
        <!-- 이용 일정 요약 -->
        <div style="margin-top: 30px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">이용 내역 요약</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">구분</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">내용</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">숙박</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${roomSelections && roomSelections.length > 0 ? `${roomSelections.length}개 객실` : '없음'}</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${roomTotal.toLocaleString()}원</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">식사</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${mealPlans && mealPlans.length > 0 ? `${mealPlans.length}회` : '없음'}</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${mealTotal.toLocaleString()}원</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">프로그램</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${programs && programs.length > 0 ? `${programs.length}개` : '없음'}</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${programTotal.toLocaleString()}원</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">대관</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${placeReservations && placeReservations.length > 0 ? `${placeReservations.length}건` : '없음'}</td>
                <td style="padding: 8px; border: 1px solid black; text-align: center;">${venueTotal.toLocaleString()}원</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colspan="2" style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">총 합계</th>
                <td style="padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">${totalAmount.toLocaleString()}원</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- 숙박 상세 정보 -->
        <div style="margin-top: 30px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">숙박 상세 내역</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">일자</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">객실 유형</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">객실 수</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">박 수</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">단가</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">금액</th>
              </tr>
            </thead>
            <tbody>`;
    
    if (roomSelections && roomSelections.length > 0) {
      // Group rooms by check-in date
      const groupedByDate = {};
      roomSelections.forEach(room => {
        const date = room.check_in_date ? moment(room.check_in_date).format('YYYY-MM-DD') : 'unknown';
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(room);
      });
      
      // Add each room to the table
      Object.entries(groupedByDate).forEach(([date, rooms]) => {
        rooms.forEach(room => {
          console.log('customerUsagePdf 두번째 - 객실 정보:', room);
          
          // page3와 동일한 계산 공식 적용
          const baseRoomPrice = room.price ? parseInt(room.price) : 0;
          const nights = room.nights ? parseInt(room.nights) : 1;
          const occupancy = room.occupancy ? parseInt(room.occupancy) : 1;
          const capacity = room.capacity ? parseInt(room.capacity) : 1;
          
          let roomTotalPrice = 0;
          
          // total_price가 수동으로 입력된 값이 있으면 우선 사용
          if (room.total_price && parseInt(room.total_price) > 0) {
            roomTotalPrice = parseInt(room.total_price);
            console.log('customerUsagePdf 두번째 - total_price(수동입력) 사용:', roomTotalPrice);
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
              console.log(`customerUsagePdf 두번째 - 인원수 초과 요금: ${extraPeople}명 × 10,000원 × ${nights}박 = ${extraCharge}원`);
            }
            
            console.log('customerUsagePdf 두번째 - page3 공식으로 계산된 가격:', {
              객실타입: room.room_type,
              기본가격: baseRoomPrice,
              박수: nights,
              투숙인원: occupancy,
              객실정원: capacity,
              계산된가격: roomTotalPrice
            });
          }
          
          htmlContent += `
            <tr>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${date !== 'unknown' ? moment(date).format('MM/DD') : '-'}</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.room_type || room.room_name || '-'}</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${occupancy}</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${nights}</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${baseRoomPrice.toLocaleString()}원</td>
              <td style="padding: 8px; border: 1px solid black; text-align: center;">${roomTotalPrice.toLocaleString()}원</td>
            </tr>`;
        });
      });
    } else {
      htmlContent += `
        <tr>
          <td colspan="6" style="padding: 8px; border: 1px solid black; text-align: center;">숙박 정보가 없습니다.</td>
        </tr>`;
    }
    
    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <!-- 식사 상세 정보 -->
        <div style="margin-top: 30px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">식사 상세 내역</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">날짜</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">구분</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">메뉴</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">인원</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">단가</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">금액</th>
              </tr>
            </thead>
            <tbody>`;
    
    if (mealPlans && mealPlans.length > 0) {
      mealPlans.forEach(meal => {
        const mealDate = meal.date ? moment(meal.date).format('MM/DD') : '-';
        const price = meal.price || 0;
        const participants = meal.participants || 0;
        let subtotal = 0;
        let unitPrice = 0;
        
        if (participants > 0) {
          unitPrice = Math.round(price / participants);
          subtotal = unitPrice * participants;
        } else {
          unitPrice = price;
          subtotal = price;
        }
        
        const koreanType = 
          meal.meal_type === 'breakfast' ? '조식' : 
          meal.meal_type === 'lunch' ? '중식' : 
          meal.meal_type === 'dinner' ? '석식' : meal.meal_type || '기타';
        
        htmlContent += `
          <tr>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${mealDate}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${koreanType}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${meal.meal_option || '일반식'}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${participants}명</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${unitPrice.toLocaleString()}원</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${subtotal.toLocaleString()}원</td>
          </tr>`;
      });
    } else {
      htmlContent += `
        <tr>
          <td colspan="6" style="padding: 8px; border: 1px solid black; text-align: center;">식사 정보가 없습니다.</td>
        </tr>`;
    }
    
    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <!-- 프로그램 상세 정보 -->
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">프로그램 상세 내역</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">날짜</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">시간</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">프로그램명</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">장소</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">금액</th>
              </tr>
            </thead>
            <tbody>`;
    
    if (programs && programs.length > 0) {
      programs.forEach(program => {
        if (!program) return;
        
        const programDate = program.date ? moment(program.date).format('MM/DD') : '-';
        const startTime = program.start_time || '';
        const endTime = program.end_time || '';
        const timeString = startTime && endTime ? `${startTime} ~ ${endTime}` : '-';
        const price = program.price || 0;
        
        htmlContent += `
          <tr>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${programDate}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${timeString}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${program.program_name || program.name || '-'}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${program.place_name || program.location || '-'}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${price.toLocaleString()}원</td>
          </tr>`;
      });
    } else {
      htmlContent += `
        <tr>
          <td colspan="5" style="padding: 8px; border: 1px solid black; text-align: center;">프로그램 정보가 없습니다.</td>
        </tr>`;
    }
    
    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <!-- 대관 상세 정보 -->
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">대관 상세 내역</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">날짜</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">시간</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">장소</th>
                <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold;">금액</th>
              </tr>
            </thead>
            <tbody>`;
    
    if (placeReservations && placeReservations.length > 0) {
      placeReservations.forEach(place => {
        const placeDate = place.date ? moment(place.date).format('MM/DD') : '-';
        const startTime = place.start_time || '';
        const endTime = place.end_time || '';
        const timeString = startTime && endTime ? `${startTime} ~ ${endTime}` : '-';
        const price = place.price || 0;
        
        htmlContent += `
          <tr>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${placeDate}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${timeString}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${place.place_name || '-'}</td>
            <td style="padding: 8px; border: 1px solid black; text-align: center;">${price.toLocaleString()}원</td>
          </tr>`;
      });
    } else {
      htmlContent += `
        <tr>
          <td colspan="4" style="padding: 8px; border: 1px solid black; text-align: center;">대관 정보가 없습니다.</td>
        </tr>`;
    }
    
    htmlContent += `
            </tbody>
          </table>
        </div>
        
        <!-- 최종 결제 내역 -->
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">결제 내역</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black;">
            <tr>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold; width: 20%;">결제 합계</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center; font-weight: bold; font-size: 16px; width: 30%;">${totalAmount.toLocaleString()}원</td>
              <th style="padding: 8px; border: 1px solid black; background-color: #f5f5f5; text-align: center; font-weight: bold; width: 20%;">결제 수단</th>
              <td style="padding: 8px; border: 1px solid black; text-align: center; width: 30%;">${reservation.payment_method || '미지정'}</td>
            </tr>
          </table>
        </div>
        
        <!-- 안내 사항 -->
        <div style="margin-top: 30px; font-size: 12px;">
          <p>※ 본 고객 이용 내역서는 부가가치세가 포함된 금액입니다.</p>
          <p>※ 문의사항: 하이힐링원 063-123-4567</p>
          <p>※ 이용해 주셔서 감사합니다.</p>
        </div>
      </div>`;
    
    container.innerHTML = htmlContent;
    
    try {
      // Create canvas from HTML with higher resolution
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Add canvas to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Create new PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add the image to cover the full page without margins
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content is taller than page, add additional pages
      if (imgHeight > 297) { // A4 height
        let remainingHeight = imgHeight;
        let currentPage = 1;
        
        while (remainingHeight > 297) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            0, // x position
            -297 * currentPage, // y position (negative to move up)
            imgWidth,
            imgHeight
          );
          
          remainingHeight -= 297;
          currentPage++;
        }
      }
      
      // Save the PDF
      const fileName = `${reservation.group_name || '고객이용내역서'}_${moment().format('YYYYMMDD')}.pdf`;
      pdf.save(fileName);
      
      // Remove temporary container
      document.body.removeChild(container);
      
      return true;
    } catch (error) {
      console.error('PDF canvas error:', error);
      document.body.removeChild(container);
      return false;
    }
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
}; 