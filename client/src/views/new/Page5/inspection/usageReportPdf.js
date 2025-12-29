import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import 'moment/locale/ko';
import html2canvas from 'html2canvas';

/**
 * Export usage report as PDF with exact layout matching DocumentPreview component
 * @param {Object} reservationData - The reservation data
 * @returns {boolean} - Whether the export was successful
 */
export const exportUsageReportPdf = async (reservationData) => {
  try {
    if (!reservationData || !reservationData.getPage1ById) {
      console.error('Invalid reservation data');
      return false;
    }

    moment.locale('ko');
    
    const detail = reservationData.getPage1ById;
    const page3Data = detail.page3 || {};
    
    // Parse JSON data function (same as DocumentPreview)
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
    
    // Data parsing (same as DocumentPreview)
    const roomSelections = parseJsonData(page3Data.room_selections);
    const mealPlans = parseJsonData(page3Data.meal_plans);
    const placeReservations = parseJsonData(page3Data.place_reservations);
    
    // Get programs (same as DocumentPreview)
    let programs = [];
    if (detail.page2_reservations && detail.page2_reservations.length > 0) {
      detail.page2_reservations.forEach(page2 => {
        if (page2.programs && page2.programs.length > 0) {
          programs = [...programs, ...page2.programs];
        }
      });
    }
    
    // Calculate total attendees (same as DocumentPreview)
    const calculateTotalAttendees = () => {
      let totalParticipants = 0;
      let totalLeaders = 0;
      
      if (detail.page2_reservations && detail.page2_reservations.length > 0) {
        detail.page2_reservations.forEach(page2 => {
          totalParticipants += page2.total_count || 0;
          totalLeaders += page2.total_leader_count || 0;
        });
      }
      
      return totalParticipants + totalLeaders;
    };

    const totalAttendees = calculateTotalAttendees();
    
    // Calculate totals with discount rates (same logic as in invoicePdf.js)
    const calculateTotal = () => {
      let roomTotal = 0;
      let mealTotal = 0;
      let programTotal = 0;
      let venueTotal = 0;
      let etcTotal = 0;
      let etcItems = [];
      
      const pageFinal = detail.pageFinal;
      
      // Get discount rate function
      const getDiscountRate = (category) => {
        if (!pageFinal) return 0;
        
        let discountRate = 0;
        
        if (category === 'room') {
          const roomExpenses = pageFinal.participant_expenses?.filter(exp => 
            !exp.is_planned && (exp.category?.includes('숙박') || exp.category?.includes('객실'))
          );
          if (roomExpenses?.length > 0 && roomExpenses[0].discount_rate !== null && roomExpenses[0].discount_rate !== undefined) {
            discountRate = roomExpenses[0].discount_rate;
          }
        } else if (category === 'meal') {
          const mealExpenses = pageFinal.participant_expenses?.filter(exp => 
            !exp.is_planned && exp.category?.includes('식사')
          );
          if (mealExpenses?.length > 0 && mealExpenses[0].discount_rate !== null && mealExpenses[0].discount_rate !== undefined) {
            discountRate = mealExpenses[0].discount_rate;
          }
        } else if (category === 'program') {
          const programExpenses = pageFinal.income_items?.filter(exp => 
            exp.category?.includes('프로그램')
          );
          if (programExpenses?.length > 0 && programExpenses[0].discount_rate !== null && programExpenses[0].discount_rate !== undefined) {
            discountRate = programExpenses[0].discount_rate;
          }
        } else if (category === 'etc') {
          const etcExpenses = pageFinal.participant_expenses?.filter(exp => 
            !exp.is_planned && exp.category?.includes('재료비')
          );
          if (etcExpenses?.length > 0 && etcExpenses[0].discount_rate !== null && etcExpenses[0].discount_rate !== undefined) {
            discountRate = etcExpenses[0].discount_rate;
          }
        }
        
        return discountRate;
      };
      
      // Calculate all totals using same logic as invoicePdf.js - page3 공식 적용
      const roomDiscountRate = getDiscountRate('room');
      roomSelections.forEach(room => {
        console.log('usageReportPdf calculateTotal - 객실 정보:', room);
        
        // page3와 동일한 계산 공식 적용
        const baseRoomPrice = room.price ? parseInt(room.price) : 0;
        const nights = room.nights ? parseInt(room.nights) : 1;
        const occupancy = room.occupancy ? parseInt(room.occupancy) : 1;
        const capacity = room.capacity ? parseInt(room.capacity) : 1;
        
        let roomTotalPrice = 0;
        
        // total_price가 수동으로 입력된 값이 있으면 우선 사용
        if (room.total_price && parseInt(room.total_price) > 0) {
          roomTotalPrice = parseInt(room.total_price);
          console.log('usageReportPdf calculateTotal - total_price(수동입력) 사용:', roomTotalPrice);
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
            console.log(`usageReportPdf calculateTotal - 인원수 초과 요금: ${extraPeople}명 × 10,000원 × ${nights}박 = ${extraCharge}원`);
          }
          
          console.log('usageReportPdf calculateTotal - page3 공식으로 계산된 가격:', {
            객실타입: room.room_type,
            기본가격: baseRoomPrice,
            박수: nights,
            투숙인원: occupancy,
            객실정원: capacity,
            계산된가격: roomTotalPrice
          });
        }
        
        const discount = Math.round(roomTotalPrice * (roomDiscountRate / 100));
        const total = roomTotalPrice - discount;
        roomTotal += total;
      });
      
      const mealDiscountRate = getDiscountRate('meal');
      mealPlans.forEach(meal => {
        const price = meal.price || 0;
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
        
        const discount = Math.round(subtotal * (mealDiscountRate / 100));
        const total = subtotal - discount;
        mealTotal += total;
      });
      
      const programDiscountRate = getDiscountRate('program');
      programs.forEach(program => {
        if (!program) return;
        const price = program.price || 0;
        const discount = Math.round(price * (programDiscountRate / 100));
        const total = price - discount;
        programTotal += total;
      });
      
      const venueDiscountRate = 0;
      placeReservations.forEach(place => {
        const price = place.price || 0;
        const hours = place.hours || 1;
        const subtotal = price * hours;
        const total = subtotal;
        venueTotal += total;
      });
      
      // Handle etc items
      const etcDiscountRate = getDiscountRate('etc');
      
      if (detail.page4_expenses && detail.page4_expenses.length > 0) {
        detail.page4_expenses.forEach(page4 => {
          // 재료 항목들 개별 처리
          if (page4.materials && page4.materials.length > 0) {
            page4.materials.forEach(material => {
              const subtotal = material.total || 0;
              const unitPrice = material.amount || 0;
              const discount = Math.round(subtotal * (etcDiscountRate / 100));
              const total = subtotal - discount;
              etcTotal += total;

              etcItems.push({
                name: material.material_type || '재료비',
                unitPrice: unitPrice,
                amount: subtotal,
                discount: discount,
                total: total,
              });
            });
          }

          // 기타비용 항목들 개별 처리
          if (page4.expenses && page4.expenses.length > 0) {
            page4.expenses.forEach(expense => {
              const subtotal = expense.amount || 0;
              const unitPrice = expense.price || 0;
              const discount = Math.round(subtotal * (etcDiscountRate / 100));
              const total = subtotal - discount;
              etcTotal += total;
              
              etcItems.push({
                name: expense.name || expense.expense_type || '기타비',
                unitPrice: unitPrice,
                amount: subtotal,
                discount: discount,
                total: total,
              });
            });
          }
        });
      }
      
      const grandTotal = roomTotal + mealTotal + programTotal + venueTotal + etcTotal;
      
      return {
        roomTotal,
        mealTotal,
        programTotal,
        venueTotal,
        etcTotal,
        etcItems,
        grandTotal,
        discountRates: {
          room: roomDiscountRate,
          meal: mealDiscountRate,
          program: programDiscountRate,
          venue: venueDiscountRate,
          etc: etcDiscountRate
        }
      };
    };
    
    const totals = calculateTotal();
    
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '210mm';
    container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", sans-serif';
    container.style.fontSize = '10px';
    container.style.lineHeight = '1.2';
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Meal type translations
    const typeTranslations = { 
      'breakfast': '조식', 
      'lunch': '중식(일반)', 
      'lunch_box': '도시락 중식', 
      'dinner': '석식(일반)', 
      'dinner_special_a': '석식(특식A)', 
      'dinner_special_b': '석식(특식B)' 
    };
    
    // Create HTML content for usage report
    const htmlContent = createUsageReportHTML(detail, totals, totalAttendees, typeTranslations, roomSelections, mealPlans, programs, placeReservations);
    
    container.innerHTML = htmlContent;
    
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      if (imgHeight > 297) {
        let remainingHeight = imgHeight;
        let currentPage = 1;
        
        while (remainingHeight > 297) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            0,
            -297 * currentPage,
            imgWidth,
            imgHeight
          );
          
          remainingHeight -= 297;
          currentPage++;
        }
      }
      
      const fileName = `${detail.group_name || '이용내역서'}_이용내역서_${moment().format('YYYYMMDD')}.pdf`;
      pdf.save(fileName);
      
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

// Function to create HTML content for usage report (different header/subtitle)
function createUsageReportHTML(detail, totals, totalAttendees, typeTranslations, roomSelections, mealPlans, programs, placeReservations) {
  const headerCellStyle = 'background-color: #f0f0f0; font-weight: bold; text-align: center; border: 1px solid #000; padding: 4px 8px; font-size: 10px;';
  const dataCellStyle = 'border: 1px solid #000; padding: 4px 8px; font-size: 10px; text-align: center;';
  const yellowCellStyle = 'background-color: #ffff99; font-weight: bold; border: 1px solid #000; padding: 4px 8px; font-size: 10px; text-align: center;';
  
  return `
    <div style="width: 100%; max-width: 210mm; margin: 0 auto; padding: 20px; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 10px; line-height: 1.2; background-color: white;">
      <!-- 헤더 -->
      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px; border: 2px solid #000; padding: 8px;">
        <div style="font-size: 18px; font-weight: bold;">고객 이용 내역서</div>
      </div>
      
      <!-- 안내문구 -->
      <div style="text-align: center; margin-bottom: 10px; border: 1px solid #000; padding: 8px; font-size: 10px;">
        <div>하이힐링원을 이용해주셔서 감사합니다</div>
      </div>
      
      <!-- 기본 정보 테이블 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tbody>
          <tr>
            <td style="${headerCellStyle}">단 체 명</td>
            <td style="${dataCellStyle}">${detail.group_name}</td>
            <td style="${headerCellStyle}">고객명</td>
            <td style="${dataCellStyle}">${detail.customer_name || '-'}</td>
          </tr>
          <tr>
            <td style="${headerCellStyle}">행 사 명</td>
            <td style="${dataCellStyle}"></td>
            <td style="${headerCellStyle}">H.P</td>
            <td style="${dataCellStyle}">${detail.mobile_phone || '-'}</td>
          </tr>
          <tr>
            <td style="${headerCellStyle}">행사 일정</td>
            <td style="${dataCellStyle}">
              ${moment(detail.start_date).format('YY.MM.DD')}(${moment(detail.start_date).format('ddd')})~${moment(detail.end_date).format('DD')}(${moment(detail.end_date).format('ddd')}), ${moment(detail.end_date).diff(moment(detail.start_date), 'days') + 1}박${moment(detail.end_date).diff(moment(detail.start_date), 'days')}일
            </td>
            <td style="${headerCellStyle}">TEL</td>
            <td style="${dataCellStyle}">${detail.landline_phone || '-'}</td>
          </tr>
          <tr>
            <td style="${headerCellStyle}">행사 인원</td>
            <td style="${dataCellStyle}">${totalAttendees}명</td>
            <td style="${headerCellStyle}">E-mail</td>
            <td style="${dataCellStyle}">${detail.email || '-'}</td>
          </tr>
          <tr>
            <td style="${headerCellStyle}">행사 장소</td>
            <td style="${dataCellStyle}">하이힐링원</td>
            <td style="${headerCellStyle}">상담담당자</td>
            <td style="${dataCellStyle}">${detail.reservation_manager || '김재훈'}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- 금액 요약 테이블 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <thead>
          <tr>
            <th style="${headerCellStyle}">금액</th>
            <th style="${headerCellStyle}">객실</th>
            <th style="${headerCellStyle}">식사</th>
            <th style="${headerCellStyle}">프로그램</th>
            <th style="${headerCellStyle}">대관</th>
            <th style="${headerCellStyle}">기타</th>
            <th style="${headerCellStyle}">최종금액</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="${dataCellStyle}">\\</td>
            <td style="${dataCellStyle}">₩ ${totals.roomTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}">₩ ${totals.mealTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}">₩ ${totals.programTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}">₩ ${totals.venueTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}">₩ ${totals.etcTotal.toLocaleString()}</td>
            <td style="${yellowCellStyle}">₩ ${totals.grandTotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="${headerCellStyle}">비 고</td>
            <td style="${dataCellStyle}; text-align: left;" colspan="6">
              체크인전 입금, 취소마감 일주일전
            </td>
          </tr>
        </tbody>
      </table>
      
      ${createRoomSection(roomSelections, totals, headerCellStyle, dataCellStyle)}
      ${createMealSection(mealPlans, totals, typeTranslations, headerCellStyle, dataCellStyle)}
      ${createProgramSection(programs, totals, headerCellStyle, dataCellStyle)}
      ${createVenueSection(placeReservations, totals, headerCellStyle, dataCellStyle)}
      ${createEtcSection(totals, headerCellStyle, dataCellStyle)}
      
      <!-- 날짜 및 서명 -->
      <div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
        <div style="font-size: 12px;">${moment().format('YYYY년 MM월 DD일')}</div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="text-align: left; border: none; width: 50%;">회 사 명 : (재)산림힐링재단</td>
            <td style="border: none; width: 25%;"></td>
            <td style="text-align: left; border: none; width: 25%;">회 사 명 : ${detail.group_name || '-'}</td>
          </tr>
          <tr>
            <td style="text-align: left; border: none;">담 당 자 : ${detail.reservation_manager || '김재훈'}</td>
            <td style="border: none;"></td>
            <td style="text-align: left; border: none;">담 당 자 : ${detail.customer_name || '-'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(인)</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Helper functions for creating sections (copied from invoicePdf.js)
function createRoomSection(roomSelections, totals, headerCellStyle, dataCellStyle) {
  let roomRows = '';
  
  if (roomSelections.length > 0) {
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
        
        const discount = Math.round(roomTotalPrice * (totals.discountRates.room / 100));
        const total = roomTotalPrice - discount;
        
        grouped[key].totalSubtotal += roomTotalPrice;
        grouped[key].totalDiscount += discount;
        grouped[key].totalAmount += total;
      });
      
      return Object.values(grouped);
    };

    const groupedRooms = groupRoomSelections(roomSelections);
    
    groupedRooms.forEach((group) => {
      console.log('usageReportPdf createRoomSection - 그룹화된 객실 정보:', group);
      
      roomRows += `
        <tr>
          <td style="${dataCellStyle}">${group.date}</td>
          <td style="${dataCellStyle}">${group.roomType}</td>
          <td style="${dataCellStyle}">${group.totalOccupancy}</td>
          <td style="${dataCellStyle}">${group.totalQuantity}</td>
          <td style="${dataCellStyle}">${group.nights}박</td>
          <td style="${dataCellStyle}">₩ ${group.basePrice.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${group.totalSubtotal.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${group.totalDiscount.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${group.totalAmount.toLocaleString()}</td>
          <td style="${dataCellStyle}"></td>
        </tr>
      `;
    });
  } else {
    roomRows = `
      <tr>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
      </tr>
    `;
  }
  
  return `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">• 객실</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="${headerCellStyle}">일자</th>
            <th style="${headerCellStyle}">타입</th>
            <th style="${headerCellStyle}">인원</th>
            <th style="${headerCellStyle}">객실수</th>
            <th style="${headerCellStyle}">숙박</th>
            <th style="${headerCellStyle}">단가</th>
            <th style="${headerCellStyle}">소계</th>
            <th style="${headerCellStyle}">할인금액</th>
            <th style="${headerCellStyle}">합계(VAT포함)</th>
            <th style="${headerCellStyle}">비고</th>
          </tr>
        </thead>
        <tbody>
          ${roomRows}
          <tr>
            <td style="${headerCellStyle}" colspan="8">소 계</td>
            <td style="${dataCellStyle}">₩ ${totals.roomTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}"></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function createMealSection(mealPlans, totals, typeTranslations, headerCellStyle, dataCellStyle) {
  let mealRows = '';
  
  if (mealPlans.length > 0) {
    mealPlans.forEach((meal, index) => {
      const price = meal.price || 0;
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
      
      const discount = Math.round(subtotal * (totals.discountRates.meal / 100));
      const total = subtotal - discount;
      
      mealRows += `
        <tr>
          <td style="${dataCellStyle}">${moment(meal.meal_date).format('MM월 DD일') || `${index + 1}일차`}</td>
          <td colspan="2" style="${dataCellStyle}">${typeTranslations[meal.meal_type] || meal.meal_type}</td>
          <td style="${dataCellStyle}">1</td>
          <td style="${dataCellStyle}">${participants}</td>
          <td style="${dataCellStyle}">₩ ${unitPrice.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${subtotal.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${discount.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${total.toLocaleString()}</td>
          <td style="${dataCellStyle}"></td>
        </tr>
      `;
    });
  } else {
    mealRows = `
      <tr>
        <td style="${dataCellStyle}">-</td>
        <td colspan="2" style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
      </tr>
    `;
  }
  
  return `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">• 식사</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="${headerCellStyle}">일자</th>
            <th colspan="2" style="${headerCellStyle}">구분</th>
            <th style="${headerCellStyle}">제공횟수</th>
            <th style="${headerCellStyle}">인원</th>
            <th style="${headerCellStyle}">단가</th>
            <th style="${headerCellStyle}">소계</th>
            <th style="${headerCellStyle}">할인금액</th>
            <th style="${headerCellStyle}">합계(VAT포함)</th>
            <th style="${headerCellStyle}">비고</th>
          </tr>
        </thead>
        <tbody>
          ${mealRows}
          <tr>
            <td style="${headerCellStyle}" colspan="8">소 계</td>
            <td style="${dataCellStyle}">₩ ${totals.mealTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}"></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function createProgramSection(programs, totals, headerCellStyle, dataCellStyle) {
  let programRows = '';
  
  if (programs.length > 0) {
    programs.forEach((program, index) => {
      if (!program) return;
      
      const price = program.price || 0;
      const discount = Math.round(price * (totals.discountRates.program / 100));
      const total = price - discount;
      
      programRows += `
        <tr>
          <td style="${dataCellStyle}">${moment(program.program_date).format('MM월 DD일') || '날짜 미정'}</td>
          <td style="${dataCellStyle}">${program.program_name || program.name}</td>
          <td style="${dataCellStyle}">₩ ${price.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${price.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${discount.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${total.toLocaleString()}</td>
          <td colspan="3" style="${dataCellStyle}"></td>
        </tr>
      `;
    });
  } else {
    programRows = `
      <tr>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td colspan="3" style="${dataCellStyle}">-</td>
      </tr>
    `;
  }
  
  return `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">• 프로그램</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="${headerCellStyle}">일자</th>
            <th style="${headerCellStyle}">프로그램명</th>
            <th style="${headerCellStyle}">단가</th>
            <th style="${headerCellStyle}">소계</th>
            <th style="${headerCellStyle}">할인금액</th>
            <th style="${headerCellStyle}">합계(VAT포함)</th>
            <th colspan="3" style="${headerCellStyle}">비고</th>
          </tr>
        </thead>
        <tbody>
          ${programRows}
          <tr>
            <td style="${headerCellStyle}" colspan="5">소 계</td>
            <td style="${dataCellStyle}">₩ ${totals.programTotal.toLocaleString()}</td>
            <td colspan="3" style="${dataCellStyle}"></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function createVenueSection(placeReservations, totals, headerCellStyle, dataCellStyle) {
  let venueRows = '';
  
  if (placeReservations.length > 0) {
    placeReservations.forEach((place, index) => {
      const price = place.price || 0;
      const hours = place.hours || 1;
      const subtotal = price * hours;
      const discount = 0; // 대관 할인 없음
      const total = subtotal;
      
      venueRows += `
        <tr>
          <td style="${dataCellStyle}">${moment(place.reservation_date).format('MM월 DD일') || '날짜 미정'}</td>
          <td colspan="3" style="${dataCellStyle}">${place.place_name || place.venue_name}</td>
          <td style="${dataCellStyle}">₩ ${price.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${subtotal.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${discount.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${total.toLocaleString()}</td>
          <td style="${dataCellStyle}"></td>
        </tr>
      `;
    });
  } else {
    venueRows = `
      <tr>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
      </tr>
    `;
  }
  
  return `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">• 대관</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="${headerCellStyle}">일자</th>
            <th colspan="3" style="${headerCellStyle}">대관장소</th>
            <th style="${headerCellStyle}">단가</th>
            <th style="${headerCellStyle}">소계</th>
            <th style="${headerCellStyle}">할인금액</th>
            <th style="${headerCellStyle}">합계(VAT포함)</th>
            <th style="${headerCellStyle}">비고</th>
          </tr>
        </thead>
        <tbody>
          ${venueRows}
          <tr>
            <td style="${headerCellStyle}" colspan="7">소 계</td>
            <td style="${dataCellStyle}">₩ ${totals.venueTotal.toLocaleString()}</td>
            <td style="${dataCellStyle}"></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function createEtcSection(totals, headerCellStyle, dataCellStyle) {
  let etcRows = '';
  
  if (totals.etcItems.length > 0) {
    totals.etcItems.forEach((item, index) => {
      etcRows += `
        <tr>
          <td style="${dataCellStyle}">-</td>
          <td style="${dataCellStyle}">${item.name}</td>
          <td style="${dataCellStyle}">₩ ${Number(item.unitPrice).toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${item.amount.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${item.discount.toLocaleString()}</td>
          <td style="${dataCellStyle}">₩ ${item.total.toLocaleString()}</td>
          <td colspan="3" style="${dataCellStyle}"></td>
        </tr>
      `;
    });
  } else {
    etcRows = `
      <tr>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td style="${dataCellStyle}">-</td>
        <td colspan="3" style="${dataCellStyle}">-</td>
      </tr>
    `;
  }
  
  return `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 10px; font-weight: bold; margin-bottom: 5px;">• 기타</div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="${headerCellStyle}">일자</th>
            <th style="${headerCellStyle}">항목</th>
            <th style="${headerCellStyle}">단가</th>
            <th style="${headerCellStyle}">소계</th>
            <th style="${headerCellStyle}">할인금액</th>
            <th style="${headerCellStyle}">합계(VAT포함)</th>
            <th colspan="3" style="${headerCellStyle}">비고</th>
          </tr>
        </thead>
        <tbody>
          ${etcRows}
          <tr>
            <td style="${headerCellStyle}" colspan="5">소 계</td>
            <td style="${dataCellStyle}">₩ ${totals.etcTotal.toLocaleString()}</td>
            <td colspan="3" style="${dataCellStyle}"></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
} 