import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import 'moment/locale/ko';
import html2canvas from 'html2canvas';

/**
 * Export room assignment and meal personnel as PDF
 * @param {Object} reservationData - The reservation data
 * @returns {boolean} - Whether the export was successful
 */
export const exportRoomMealPdf = (reservationData) => {
  try {
    if (!reservationData || !reservationData.getPage1ById) {
      console.error('Invalid reservation data');
      return false;
    }

    moment.locale('ko');
    
    const reservation = reservationData.getPage1ById;
    const page2Data = reservation.page2_reservations?.[0] || {};
    const page3Data = reservation.page3 || {};
    
    // Extract necessary data
    const startDate = moment(reservation.start_date);
    const endDate = moment(reservation.end_date);
    const usagePeriod = `${startDate.format('MM/DD')}~${endDate.format('MM/DD')}`;
    const organizationName = reservation.group_name || '단체명 미지정';
    const totalParticipants = reservation.total_count || 0;
    
    // Process room data
    const rooms = Array.isArray(page3Data.room_selections) ? page3Data.room_selections : [];
    const roomsByFloor = {
      '1F': [],
      '2F': [],
      '3F': []
    };
    
    // Organize rooms by floor
    rooms.forEach(room => {
      if (!room || !room.room_name) return;
      
      const roomNumber = parseInt(room.room_name.replace(/[^0-9]/g, ''), 10);
      if (isNaN(roomNumber)) return;
      
      if (roomNumber >= 100 && roomNumber < 200) {
        roomsByFloor['1F'].push(room);
      } else if (roomNumber >= 200 && roomNumber < 300) {
        roomsByFloor['2F'].push(room);
      } else if (roomNumber >= 300 && roomNumber < 400) {
        roomsByFloor['3F'].push(room);
      }
    });
    
    // Process meal data
    const meals = Array.isArray(page3Data.meal_plans) ? page3Data.meal_plans : [];
    const mealsByDate = {};
    
    // Organize meals by date and type
    meals.forEach(meal => {
      if (!meal || !meal.date) return;
      
      const mealDate = moment(meal.date).format('M/DD');
      if (!mealsByDate[mealDate]) {
        mealsByDate[mealDate] = {
          breakfast: { count: 0 },
          lunch: { count: 0 },
          dinner: { count: 0 }
        };
      }
      
      if (meal.meal_type === 'breakfast') {
        mealsByDate[mealDate].breakfast.count = meal.participants || 0;
      } else if (meal.meal_type === 'lunch') {
        mealsByDate[mealDate].lunch.count = meal.participants || 0;
      } else if (meal.meal_type === 'dinner') {
        mealsByDate[mealDate].dinner.count = meal.participants || 0;
      }
    });
    
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    // Create the HTML content to be converted to PDF
    container.innerHTML = `
      <div style="padding: 20px;">
        <div style="text-align: left; font-size: 16px;">
          &lt;별첨5&gt; 숙소 및 식사인원
        </div>
        
        <div style="text-align: center; margin: 15px 0;">
          <h1 style="font-size: 22px;">숙소 배정 및 식사 인원</h1>
        </div>
        
        <div style="text-align: right; font-size: 14px; margin-bottom: 10px;">
          연천군가족재단(${usagePeriod})
        </div>
        
        <div style="margin-top: 10px; font-size: 12px;">
          ○ 숙소 배정
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
          <thead>
            <tr>
              <th colspan="3" style="width: 33.3%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">1F</th>
              <th colspan="3" style="width: 33.3%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">2F</th>
              <th colspan="3" style="width: 33.3%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">3F</th>
            </tr>
            <tr>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">호수</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">정원</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">이용인원</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">호수</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">정원</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">이용인원</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">호수</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">정원</th>
              <th style="width: 11%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">이용인원</th>
            </tr>
          </thead>
          <tbody>
            ${generateRoomRows(roomsByFloor)}
          </tbody>
        </table>
        
        <div style="margin-top: 10px; font-size: 9px;">
          ※ 파란색 부분이 배정된 객실입니다. 실제 이용인원을 적어주세요<br/>
          ※ 객실 추가 및 추소 필요시 사전협의 필수입니다.<br/>
          ※ 기사님 숙소(유료) 필요시 하단 '기타요청사항'에 기재하여 주십시오.
        </div>
        
        <div style="margin-top: 20px; font-size: 12px;">
          ○ 식사 인원
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
          <thead>
            <tr>
              <th style="width: 15%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">일자</th>
              <th style="width: 15%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">구분</th>
              <th style="width: 14%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">청소년</th>
              <th style="width: 14%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">성인</th>
              <th style="width: 14%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">강사</th>
              <th style="width: 14%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">기사/기타</th>
              <th style="width: 14%; background-color: #dcdcdc; padding: 8px; border: 1px solid black; text-align: center;">계</th>
            </tr>
          </thead>
          <tbody>
            ${generateMealRows(mealsByDate, startDate, endDate)}
          </tbody>
        </table>
        
        <div style="margin-top: 10px; font-size: 9px;">
          ※ 최종 식사인원을 기재하여 주십시오.
        </div>
        
        <div style="margin-top: 20px; font-size: 12px;">
          ○ 기타 요청사항
        </div>
        
        <div style="margin-top: 10px; width: 100%; height: 60px; border: 1px solid black;"></div>
      </div>
    `;
    
    // Wait for DOM to be ready, then capture to canvas and convert to PDF
    setTimeout(async () => {
      try {
        // Create canvas from HTML
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        // Create PDF with proper dimensions
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save(`${organizationName}_숙소식사인원_${moment().format('YYMMDD')}.pdf`);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating PDF:', error);
        document.body.removeChild(container);
        return false;
      }
    }, 500);
    
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
};

// Helper function to generate room assignment rows
function generateRoomRows(roomsByFloor) {
  // Define room data (from the image example)
  const roomData = {
    '1F': [
      { room: '101', capacity: 3, occupancy: '' },
      { room: '102', capacity: 3, occupancy: '' },
      { room: '103', capacity: 6, occupancy: '' },
      { room: '104', capacity: 6, occupancy: '' },
      { room: '105', capacity: 6, occupancy: '' },
      { room: '106', capacity: 6, occupancy: '' },
      { room: '107', capacity: 6, occupancy: '' },
      { room: '109', capacity: 3, occupancy: '' },
      { room: '110', capacity: 3, occupancy: '' }
    ],
    '2F': [
      { room: '201', capacity: 3, occupancy: '' },
      { room: '202', capacity: 3, occupancy: '' },
      { room: '203', capacity: 6, occupancy: '' },
      { room: '204', capacity: 6, occupancy: '' },
      { room: '205', capacity: 6, occupancy: '' },
      { room: '206', capacity: 6, occupancy: '' },
      { room: '207', capacity: 6, occupancy: '' },
      { room: '208', capacity: 6, occupancy: '' },
      { room: '209', capacity: 6, occupancy: '' },
      { room: '210', capacity: 3, occupancy: '' },
      { room: '211', capacity: 3, occupancy: '' },
      { room: '212', capacity: 3, occupancy: '' },
      { room: '213', capacity: 3, occupancy: '' },
      { room: '214', capacity: 3, occupancy: '' }
    ],
    '3F': [
      { room: '301', capacity: 3, occupancy: '' },
      { room: '302', capacity: 3, occupancy: '' },
      { room: '303', capacity: 6, occupancy: '' },
      { room: '304', capacity: 6, occupancy: '' },
      { room: '305', capacity: 6, occupancy: '' },
      { room: '306', capacity: 6, occupancy: '' },
      { room: '307', capacity: 6, occupancy: '' },
      { room: '308', capacity: 6, occupancy: '' },
      { room: '309', capacity: 6, occupancy: '' },
      { room: '310', capacity: 3, occupancy: '' },
      { room: '311', capacity: 3, occupancy: '' },
      { room: '312', capacity: 3, occupancy: '' },
      { room: '313', capacity: 3, occupancy: '' },
      { room: '314', capacity: 3, occupancy: '' }
    ]
  };
  
  // Find the maximum number of rows needed
  const maxRows = Math.max(
    roomData['1F'].length,
    roomData['2F'].length,
    roomData['3F'].length
  );
  
  let html = '';
  
  // Generate rows
  for (let i = 0; i < maxRows; i++) {
    html += '<tr>';
    
    // 1F cells
    if (i < roomData['1F'].length) {
      const room = roomData['1F'][i];
      const bgColor = room.room.startsWith('3') ? '#d9e1f2' : '';
      html += `
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.room}</td>
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.capacity}</td>
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.occupancy}</td>
      `;
    } else {
      html += `
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
      `;
    }
    
    // 2F cells
    if (i < roomData['2F'].length) {
      const room = roomData['2F'][i];
      html += `
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.room}</td>
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.capacity}</td>
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${room.occupancy}</td>
      `;
    } else {
      html += `
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
      `;
    }
    
    // 3F cells
    if (i < roomData['3F'].length) {
      const room = roomData['3F'][i];
      const bgColor = room.room.startsWith('3') ? 'background-color: #d9e1f2;' : '';
      html += `
        <td style="${bgColor} padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">${room.room}</td>
        <td style="${bgColor} padding: 8px; border: 1px solid black; text-align: center; font-weight: bold;">${room.capacity}</td>
        <td style="${bgColor} padding: 8px; border: 1px solid black;"></td>
      `;
    } else {
      html += `
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
      `;
    }
    
    html += '</tr>';
  }
  
  return html;
}

// Helper function to generate meal rows
function generateMealRows(mealsByDate, startDate, endDate) {
  let html = '';
  const dates = [];
  
  // Generate array of dates between start and end date
  const currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate)) {
    dates.push(currentDate.format('M/DD'));
    currentDate.add(1, 'day');
  }
  
  // Function to create a meal row
  const createMealRow = (date, mealType, mealKorean) => {
    const count = mealsByDate[date]?.[mealType]?.count || 0;
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${date}</td>
        <td style="padding: 8px; border: 1px solid black; text-align: center;">${mealKorean}</td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
        <td style="padding: 8px; border: 1px solid black;"></td>
      </tr>
    `;
  };
  
  // Generate rows for each date with meal types
  dates.forEach(date => {
    // First day: dinner only
    if (date === dates[0]) {
      html += createMealRow(date, 'dinner', '석식');
      html += createMealRow(date, 'breakfast', '조식');
    } 
    // Last day: breakfast only
    else if (date === dates[dates.length - 1]) {
      html += createMealRow(date, 'breakfast', '조식');
    }
    // Middle days: all three meals
    else {
      html += createMealRow(date, 'breakfast', '조식');
      html += createMealRow(date, 'lunch', '중식');
      html += createMealRow(date, 'dinner', '석식');
    }
  });
  
  return html;
} 