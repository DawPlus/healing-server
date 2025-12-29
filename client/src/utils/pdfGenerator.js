import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import 'moment/locale/ko';

// 숫자 포맷팅 함수
const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 날짜 포맷팅 함수
const formatDateKorean = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  return `${year}.${month}.${day}(${dayName})`;
};

// 숙박 및 식사 정보 PDF 생성 (HTML-to-canvas 방식)
export const generateAccommodationMealPDF = async (reservationData, accommodationData, mealData) => {
  try {
    moment.locale('ko');
    
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Build HTML content
    const title = `${reservationData.group_name} 숙박 및 식사 정보`;
    
    // Generate accommodation table rows
    let accommodationTableRows = '';
    if (accommodationData.rows.length > 0) {
      accommodationTableRows = accommodationData.rows.map(row => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.date}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.roomType}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.roomCount}명</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.nights}박</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(row.unitPrice)}원</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(row.subtotal)}원</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(row.total)}원</td>
        </tr>
      `).join('');
      
      accommodationTableRows += `
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          <td colspan="5" style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">총 합계</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;"></td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(accommodationData.totalRoomPrice)}원</td>
        </tr>
      `;
    }
    
    // Generate meal table rows
    let mealTableRows = '';
    if (mealData.rows.length > 0) {
      mealTableRows = mealData.rows.map(row => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.date}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.type}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${row.people}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(row.unitPrice)}원</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(row.total)}원</td>
        </tr>
      `).join('');
      
      mealTableRows += `
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          <td colspan="3" style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">총 합계</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;"></td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-size: 11px;">${formatNumber(mealData.totalMealPrice)}원</td>
        </tr>
      `;
    }
    
    container.innerHTML = `
      <div style="padding: 30px; width: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0; color: #333;">${title}</h1>
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            기간: ${formatDateKorean(reservationData.start_date)} ~ ${formatDateKorean(reservationData.end_date)}
          </div>
          ${reservationData.total_count ? `
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              총 인원: ${reservationData.total_count}명
            </div>
          ` : ''}
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            생성일: ${moment().format('YYYY년 MM월 DD일')}
          </div>
        </div>
        
        ${accommodationData.rows.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">■ 숙박 정보</h2>
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
              <thead>
                <tr>
                  <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">일자</th>
                  <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">타입</th>
                  <th style="width: 10%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">인원</th>
                  <th style="width: 10%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">박수</th>
                  <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">제공단가</th>
                  <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">소계</th>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">합계</th>
                </tr>
              </thead>
              <tbody>
                ${accommodationTableRows}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${mealData.rows.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 18px; color: #333; margin-bottom: 15px;">■ 식사 정보</h2>
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
              <thead>
                <tr>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">날짜</th>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">구분</th>
                  <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">인원</th>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">제공단가</th>
                  <th style="width: 25%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">합계</th>
                </tr>
              </thead>
              <tbody>
                ${mealTableRows}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;
    
    // Wait for DOM to be ready then capture to canvas and convert to PDF
    setTimeout(async () => {
      try {
        // Create canvas from HTML with higher quality settings
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1200,
          height: container.scrollHeight
        });
        
        // Create PDF with proper dimensions (portrait A4)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 210; // A4 portrait width in mm
        const pdfHeight = 297; // A4 portrait height in mm
        const imgWidth = pdfWidth - 20; // Leave margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If image height exceeds page height, scale it down
        let finalWidth = imgWidth;
        let finalHeight = imgHeight;
        
        if (imgHeight > pdfHeight - 20) {
          finalHeight = pdfHeight - 20;
          finalWidth = (canvas.width * finalHeight) / canvas.height;
        }
        
        // Center the image on the page
        const xOffset = (pdfWidth - finalWidth) / 2;
        const yOffset = (pdfHeight - finalHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        
        // Save the PDF
        const fileName = `${reservationData.group_name}_숙박식사정보_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating accommodation meal PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        return false;
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Accommodation meal PDF export error:', error);
    return false;
  }
};

// 검수용 PDF 생성 (HTML-to-canvas 방식)
export const generateInspectionPdf = async (reservationData, accommodationData, mealData) => {
  try {
    moment.locale('ko');
    
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Build HTML content for inspection document
    const title = `${reservationData.group_name} 숙소 배정표 및 식사 인원표`;
    
    // Generate floor room data
    const floors = ['1F', '2F', '3F'];
    const floorTables = floors.map((floor, floorIndex) => {
      const roomRows = [];
      for (let i = 1; i <= 8; i++) {
        const roomNumber = `${floorIndex + 1}0${i}`;
        roomRows.push(`
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 6px; border: 1px solid #333; text-align: center; font-size: 10px;">${roomNumber}</td>
            <td style="padding: 6px; border: 1px solid #333; text-align: center; font-size: 10px;">2인실</td>
            <td style="padding: 6px; border: 1px solid #333; text-align: left; font-size: 10px;">홍길동, 김철수</td>
            <td style="padding: 6px; border: 1px solid #333; text-align: left; font-size: 10px;">비고</td>
          </tr>
        `);
      }
      
      return `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">${floor}</h3>
          <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
            <thead>
              <tr>
                <th style="width: 15%; background-color: #f0f0f0; padding: 6px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 11px;">객실번호</th>
                <th style="width: 15%; background-color: #f0f0f0; padding: 6px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 11px;">객실타입</th>
                <th style="width: 50%; background-color: #f0f0f0; padding: 6px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 11px;">배정인원</th>
                <th style="width: 20%; background-color: #f0f0f0; padding: 6px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 11px;">비고</th>
              </tr>
            </thead>
            <tbody>
              ${roomRows.join('')}
            </tbody>
          </table>
        </div>
      `;
    }).join('');
    
    // Generate meal table for inspection
    let mealInspectionRows = '';
    if (mealData.rows.length > 0) {
      // Group meals by date
      const mealByDate = {};
      mealData.rows.forEach(row => {
        if (!mealByDate[row.date]) {
          mealByDate[row.date] = { breakfast: 0, lunch: 0, dinner: 0 };
        }
        
        if (row.type.includes('조식') || row.type.includes('아침')) {
          mealByDate[row.date].breakfast = parseInt(row.people.replace('명', '')) || 0;
        } else if (row.type.includes('중식') || row.type.includes('점심')) {
          mealByDate[row.date].lunch = parseInt(row.people.replace('명', '')) || 0;
        } else if (row.type.includes('석식') || row.type.includes('저녁')) {
          mealByDate[row.date].dinner = parseInt(row.people.replace('명', '')) || 0;
        }
      });

      mealInspectionRows = Object.entries(mealByDate).map(([date, meals]) => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${date}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${meals.breakfast > 0 ? `${meals.breakfast}명` : '-'}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${meals.lunch > 0 ? `${meals.lunch}명` : '-'}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: center; font-size: 11px;">${meals.dinner > 0 ? `${meals.dinner}명` : '-'}</td>
        </tr>
      `).join('');
    }
    
    container.innerHTML = `
      <div style="padding: 30px; width: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0; color: #333;">${title}</h1>
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            기간: ${formatDateKorean(reservationData.start_date)} ~ ${formatDateKorean(reservationData.end_date)}
          </div>
          ${reservationData.total_count ? `
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              총 인원: ${reservationData.total_count}명
            </div>
          ` : ''}
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            생성일: ${moment().format('YYYY년 MM월 DD일')}
          </div>
        </div>
        
        <div style="margin-bottom: 50px;">
          <h2 style="font-size: 20px; color: #333; margin-bottom: 20px;">■ 숙소 배정표</h2>
          ${floorTables}
        </div>
        
        ${mealData.rows.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">■ 식사 인원표</h2>
            <table style="width: 60%; border-collapse: collapse; border: 2px solid #333;">
              <thead>
                <tr>
                  <th style="width: 30%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">일자</th>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">조식</th>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">중식</th>
                  <th style="width: 20%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; text-align: center; font-weight: bold; font-size: 12px;">석식</th>
                </tr>
              </thead>
              <tbody>
                ${mealInspectionRows}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        <div style="margin-top: 50px;">
          <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">■ 기타 요청사항</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <div style="font-size: 12px; margin-bottom: 15px;">・</div>
            <div style="font-size: 12px; margin-bottom: 15px;">・</div>
            <div style="font-size: 12px; margin-bottom: 15px;">・</div>
          </div>
        </div>
      </div>
    `;
    
    // Wait for DOM to be ready then capture to canvas and convert to PDF
    setTimeout(async () => {
      try {
        // Create canvas from HTML with higher quality settings
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1200,
          height: container.scrollHeight
        });
        
        // Create PDF with proper dimensions (portrait A4)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 210; // A4 portrait width in mm
        const pdfHeight = 297; // A4 portrait height in mm
        const imgWidth = pdfWidth - 20; // Leave margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If content is too long, create multiple pages
        if (imgHeight > pdfHeight - 20) {
          const pageHeight = pdfHeight - 20;
          const ratio = canvas.width / canvas.height;
          const pageWidth = pageHeight * ratio;
          
          let yPosition = 0;
          let pageCount = 0;
          
          while (yPosition < canvas.height) {
            if (pageCount > 0) {
              pdf.addPage();
            }
            
            const remainingHeight = canvas.height - yPosition;
            const currentPageHeight = Math.min(pageHeight / (imgWidth / canvas.width), remainingHeight);
            
            // Create a temporary canvas for this page
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = currentPageHeight;
            const pageCtx = pageCanvas.getContext('2d');
            
            pageCtx.drawImage(canvas, 0, yPosition, canvas.width, currentPageHeight, 0, 0, canvas.width, currentPageHeight);
            
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            const actualPageHeight = (currentPageHeight * imgWidth) / canvas.width;
            
            pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, actualPageHeight);
            
            yPosition += currentPageHeight;
            pageCount++;
          }
        } else {
          // Single page
          const xOffset = (pdfWidth - imgWidth) / 2;
          const yOffset = (pdfHeight - imgHeight) / 2;
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        }
        
        // Save the PDF
        const fileName = `${reservationData.group_name}_검수자료_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating inspection PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        return false;
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Inspection PDF export error:', error);
    return false;
  }
}; 

// 숙소 배정 및 식사 인원 PDF 생성 (이미지 레이아웃 매칭)
export const generateRoomAssignmentAndMealPDF = async (reservationData, roomAssignmentData, mealData) => {
  console.log('[PDF] ===== generateRoomAssignmentAndMealPDF 함수 시작 =====');
  console.log('[PDF] reservationData:', reservationData);
  console.log('[PDF] roomAssignmentData:', roomAssignmentData);
  console.log('[PDF] mealData (입력):', mealData);
  console.log('[PDF] mealData 타입:', Array.isArray(mealData) ? 'Array' : typeof mealData);
  console.log('[PDF] mealData 길이:', Array.isArray(mealData) ? mealData.length : 'N/A');
  
  try {
    moment.locale('ko');
    
    // Create temporary container for PDF content with proper width
    const container = document.createElement('div');
    container.style.width = '1000px'; // Fixed width for consistent layout
    container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Extract date range from reservation data
    const startDate = moment(reservationData.start_date);
    const endDate = moment(reservationData.end_date);
    const usagePeriod = `${startDate.format('MM/DD')}-${endDate.format('DD')}`;
    
    console.log('[PDF] 예약 기간:', startDate.format('YYYY-MM-DD'), '~', endDate.format('YYYY-MM-DD'));
    
    // Generate room assignment table
    console.log('[PDF] generateRoomAssignmentTable 호출 시작');
    const roomAssignmentTableHTML = generateRoomAssignmentTable(roomAssignmentData, startDate);
    console.log('[PDF] generateRoomAssignmentTable 완료');
    
    // Generate meal schedule table
    console.log('[PDF] generateMealScheduleTable 호출 시작');
    console.log('[PDF] generateMealScheduleTable에 전달되는 mealData:', mealData);
    const mealScheduleTableHTML = generateMealScheduleTable(mealData, startDate, endDate);
    console.log('[PDF] generateMealScheduleTable 완료');
    console.log('[PDF] 생성된 mealScheduleTableHTML 길이:', mealScheduleTableHTML.length);
    
    container.innerHTML = `
      <div style="padding: 30px; width: 100%; box-sizing: border-box; line-height: 1.4;">
        <!-- 제목 섹션 -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="font-size: 22px; margin: 0; color: #000; font-weight: bold;">숙소 배정 및 식사 인원</h1>
          <div style="text-align: right; font-size: 13px; color: #000; margin-top: 15px; font-weight: normal;">
            ${reservationData.group_name || '단체명'}(${usagePeriod})
          </div>
        </div>
        
        <!-- 숙소 배정 섹션 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 15px; color: #000; margin-bottom: 10px; font-weight: bold;">◯ 숙소 배정</h2>
          ${roomAssignmentTableHTML}
          <div style="margin-top: 8px;">
            <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 파란색 부분이 배정된 객실입니다. 실제 이용인원을 적어주세요.</p>
            <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 객실 추가 및 축소 필요시 사전협의 필수입니다</p>
            <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 기사님 숙소(유료) 필요시 하단 "기타요청사항"에 기재하여 주십시오.</p>
          </div>
        </div>
        
        <!-- 식사 인원 섹션 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 15px; color: #000; margin-bottom: 10px; font-weight: bold;">◯ 식사 인원</h2>
          ${mealScheduleTableHTML}
          <div style="margin-top: 8px;">
            <p style="font-size: 11px; color: #000; margin: 1px 0; line-height: 1.3;">※ 최종 식사인원을 확인하여 주십시오.</p>          </div>
        </div>
        
        <!-- 기타 요청사항 섹션 -->
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 15px; color: #000; margin-bottom: 10px; font-weight: bold;">◯ 기타 요청사항</h2>
          <div style="border: 2px solid #000; min-height: 60px; padding: 10px; background-color: #fff;"></div>
        </div>
      </div>
    `;
    
    // Wait for DOM to be ready then capture to canvas and convert to PDF
    setTimeout(async () => {
      try {
        // Create canvas from HTML with higher quality settings
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1000,
          height: container.scrollHeight,
          windowWidth: 1000,
          windowHeight: container.scrollHeight
        });
        
        // Create PDF with proper dimensions (portrait A4)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 210; // A4 portrait width in mm
        const pdfHeight = 297; // A4 portrait height in mm
        const margin = 10; // 페이지 여백
        const imgWidth = pdfWidth - (margin * 2); // Leave margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // 페이지 분할 처리: 이미지가 페이지를 넘어가면 여러 페이지로 분할
        const pageHeight = pdfHeight - (margin * 2); // 사용 가능한 페이지 높이
        const totalPages = Math.ceil(imgHeight / pageHeight);
        
        // 각 페이지에 이미지 추가
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage(); // 새 페이지 추가
          }
          
          // 현재 페이지에 표시할 이미지 부분 계산
          const sourceY = (canvas.height / totalPages) * page;
          const sourceHeight = Math.min(canvas.height / totalPages, canvas.height - sourceY);
          
          // 임시 캔버스에 해당 부분만 그리기
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          
          const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
          
          // 이미지가 페이지를 넘어가지 않도록 조정
        let finalWidth = imgWidth;
          let finalHeight = (sourceHeight * imgWidth) / canvas.width;
          
          if (finalHeight > pageHeight) {
            finalHeight = pageHeight;
            finalWidth = (canvas.width * finalHeight) / sourceHeight;
          }
          
          // 페이지 상단 정렬
        const xOffset = (pdfWidth - finalWidth) / 2;
          const yOffset = margin;
        
          // 이미지 추가
          pdf.addImage(pageImgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        }
        
        // Save the PDF (파일명은 호출하는 쪽에서 결정)
        // 파일명이 제공되지 않으면 기본 파일명 사용
        const defaultFileName = `${reservationData.group_name}_숙소배정및식사인원_${moment().format('YYYY-MM-DD')}.pdf`;
        
        // 파일명을 반환하여 호출하는 쪽에서 저장하도록 함
        // 또는 여기서 바로 저장
        pdf.save(defaultFileName);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return { pdf, fileName: defaultFileName };
      } catch (error) {
        console.error('Error generating room assignment and meal PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        return false;
      }
    }, 1000); // Increased timeout for better rendering
    
    return true;
  } catch (error) {
    console.error('Room assignment and meal PDF export error:', error);
    return false;
  }
};

// Helper function to generate room assignment table
export function generateRoomAssignmentTable(roomAssignmentData, startDate) {
  // Define room structure as shown in the image
  const roomStructure = {
    '1F': [
      { room: '101', capacity: 3 },
      { room: '102', capacity: 3 },
      { room: '103', capacity: 6 },
      { room: '104', capacity: 6 },
      { room: '105', capacity: 6 },
      { room: '106', capacity: 6 },
      { room: '107', capacity: 6 },
      { room: '109', capacity: 3 },
      { room: '110', capacity: 3 }
    ],
    '2F': [
      { room: '201', capacity: 3 },
      { room: '202', capacity: 3 },
      { room: '203', capacity: 6 },
      { room: '204', capacity: 6 },
      { room: '205', capacity: 6 },
      { room: '206', capacity: 6 },
      { room: '207', capacity: 6 },
      { room: '208', capacity: 6 },
      { room: '209', capacity: 6 },
      { room: '210', capacity: 3 },
      { room: '211', capacity: 3 },
      { room: '212', capacity: 3 },
      { room: '213', capacity: 3 },
      { room: '214', capacity: 3 }
    ],
    '3F': [
      { room: '301', capacity: 3 },
      { room: '302', capacity: 3 },
      { room: '303', capacity: 6 },
      { room: '304', capacity: 6 },
      { room: '305', capacity: 6 },
      { room: '306', capacity: 6 },
      { room: '307', capacity: 6 },
      { room: '308', capacity: 6 },
      { room: '309', capacity: 6 },
      { room: '310', capacity: 3 },
      { room: '311', capacity: 3 },
      { room: '312', capacity: 3 },
      { room: '313', capacity: 3 },
      { room: '314', capacity: 3 }
    ]
  };
  
  // Process room assignment data to map room assignments
  const roomAssignments = {};
  if (roomAssignmentData && Array.isArray(roomAssignmentData)) {
    roomAssignmentData.forEach(roomData => {
      if (roomData.assignments && Array.isArray(roomData.assignments)) {
        roomData.assignments.forEach(assignment => {
          const assignmentDate = moment(assignment.date);
          if (assignmentDate.format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD')) {
            roomAssignments[roomData.room_name] = {
              occupancy: assignment.occupancy || 0,
              organization: assignment.organization || ''
            };
          }
        });
      } else if (roomData.assignments && typeof roomData.assignments === 'object') {
        // Handle case where assignments is an object with date keys
        Object.entries(roomData.assignments).forEach(([date, assignment]) => {
          const assignmentDate = moment(date);
          if (assignmentDate.format('YYYY-MM-DD') === startDate.format('YYYY-MM-DD')) {
            roomAssignments[roomData.room_name] = {
              occupancy: assignment.occupancy || 0,
              organization: assignment.organization || ''
            };
          }
        });
      }
    });
  }
  
  // Generate table HTML exactly as shown in the image with 3-column layout
  const maxRows = Math.max(
    roomStructure['1F'].length,
    roomStructure['2F'].length,
    roomStructure['3F'].length
  );
  
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; table-layout: fixed;">
      <thead>
        <tr>
          <th style="width: 33.33%; background-color: #c0c0c0; padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 13px;">1F</th>
          <th style="width: 33.33%; background-color: #c0c0c0; padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 13px;">2F</th>
          <th style="width: 33.33%; background-color: #c0c0c0; padding: 6px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 13px;">3F</th>
        </tr>
        <tr>
          <th style="background-color: #c0c0c0; padding: 0; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 11px;">
            <table style="width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse;">
              <tr>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px; border-right: 1px solid #000;">호수</td>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px; border-right: 1px solid #000;">정원</td>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px;">이용인원</td>
              </tr>
            </table>
          </th>
          <th style="background-color: #c0c0c0; padding: 0; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 11px;">
            <table style="width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse;">
              <tr>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px; border-right: 1px solid #000;">호수</td>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px; border-right: 1px solid #000;">정원</td>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px;">이용인원</td>
              </tr>
            </table>
          </th>
          <th style="background-color: #c0c0c0; padding: 0; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 11px;">
            <table style="width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse;">
              <tr>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px; border-right: 1px solid #000;">호수</td>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px; border-right: 1px solid #000;">정원</td>
                <td style="width: 33.33%; text-align: center; font-size: 11px; padding: 3px;">이용인원</td>
              </tr>
            </table>
          </th>
        </tr>
      </thead>
      <tbody>
  `;
  
  for (let i = 0; i < maxRows; i++) {
    tableHTML += '<tr>';
    
    ['1F', '2F', '3F'].forEach(floor => {
      const room = roomStructure[floor][i];
      if (room) {
        const assignment = roomAssignments[room.room];
        const isAssigned = assignment && assignment.occupancy > 0;
        const backgroundColor = isAssigned ? '#C5D9F1' : '#ffffff'; // Light blue color from the image
        const occupancyText = isAssigned ? assignment.occupancy : '';
        
        tableHTML += `
          <td style="padding: 0; border: 1px solid #000; background-color: ${backgroundColor}; height: 20px;">
            <table style="width: 100%; height: 100%; table-layout: fixed; border-collapse: collapse;">
              <tr>
                <td style="width: 33.33%; text-align: center; font-size: 12px; padding: 2px; border-right: 1px solid #000;">${room.room}</td>
                <td style="width: 33.33%; text-align: center; font-size: 12px; padding: 2px; border-right: 1px solid #000;">${room.capacity}</td>
                <td style="width: 33.33%; text-align: center; font-size: 12px; padding: 2px;">${occupancyText}</td>
              </tr>
            </table>
          </td>
        `;
      } else {
        tableHTML += '<td style="padding: 4px; border: 1px solid #000; text-align: center; font-size: 12px; background-color: #ffffff; height: 20px;"></td>';
      }
    });
    
    tableHTML += '</tr>';
  }
  
  tableHTML += '</tbody></table>';
  
  return tableHTML;
}

// Helper function to generate meal schedule table
export function generateMealScheduleTable(mealData, startDate, endDate) {
  console.log('[PDF] ===== generateMealScheduleTable 함수 시작 =====');
  console.log('[PDF] 입력 mealData:', mealData);
  console.log('[PDF] 입력 startDate:', startDate);
  console.log('[PDF] 입력 endDate:', endDate);
  
  // Generate date range
  const dates = [];
  const currentDate = moment(startDate);
  while (currentDate.isSameOrBefore(endDate)) {
    dates.push({
      date: currentDate.format('M/DD'),
      dateKey: currentDate.format('YYYY-MM-DD'),
      dayOfWeek: currentDate.format('dddd')
    });
    currentDate.add(1, 'day');
  }
  
  console.log('[PDF] 생성된 날짜 범위:', dates.map(d => d.dateKey));
  
  // Process meal data - support both old format (participants) and new format (youth_count, adult_count, etc.)
  const mealSchedule = {};
  console.log('[PDF] Processing meal data:', mealData);
  console.log('[PDF] mealData 타입:', Array.isArray(mealData) ? 'Array' : typeof mealData);
  console.log('[PDF] mealData 길이:', Array.isArray(mealData) ? mealData.length : 'N/A');
  
  if (mealData && Array.isArray(mealData)) {
    mealData.forEach(meal => {
      let mealDate;
      let mealDateKey;
      // Handle different date formats
      if (meal.date) {
        mealDate = moment(meal.date).format('M/DD');
        mealDateKey = moment(meal.date).format('YYYY-MM-DD');
      } else {
        // Skip if no date
        return;
      }
      
      // Initialize meal schedule for this date if not exists
      if (!mealSchedule[mealDateKey]) {
        mealSchedule[mealDateKey] = {
          breakfast: { youth: '', adult: '', instructor: '', other: '', total: '' },
          lunch: { youth: '', adult: '', instructor: '', other: '', total: '' },
          dinner: { youth: '', adult: '', instructor: '', other: '', total: '' }
        };
      }
      
      // Determine meal type (breakfast, lunch, dinner)
      // Convert all meal type variations to standard types
      let mealType = 'breakfast';
      const mealTypeStr = meal.meal_type || '';
      
      // Check for lunch types
      if (mealTypeStr.includes('lunch') || mealTypeStr === '중식' || mealTypeStr === 'lunch_box' || mealTypeStr === 'lunch_regular') {
        mealType = 'lunch';
      } 
      // Check for dinner types
      else if (mealTypeStr.includes('dinner') || mealTypeStr === '석식' || mealTypeStr === 'dinner_special_a' || mealTypeStr === 'dinner_special_b' || mealTypeStr === 'dinner_regular') {
        mealType = 'dinner';
      }
      // Default to breakfast
      else if (mealTypeStr.includes('breakfast') || mealTypeStr === '조식' || mealTypeStr === 'breakfast_regular') {
        mealType = 'breakfast';
      }
      
      console.log(`[PDF] Processing meal: date=${mealDateKey}, meal_type=${mealTypeStr} -> ${mealType}, participants=${meal.participants}, total_count=${meal.total_count}`);
      
      // Get total count - prioritize total_count, then participants
      let totalCount = '';
      if (meal.total_count !== undefined && meal.total_count !== null && meal.total_count !== '') {
        totalCount = meal.total_count;
      } else if (meal.participants !== undefined && meal.participants !== null && meal.participants !== '') {
        totalCount = meal.participants;
      }
      
      // If new format with detailed counts (youth_count, adult_count, etc.)
      if (meal.youth_count !== undefined || meal.adult_count !== undefined || meal.instructor_count !== undefined || meal.other_count !== undefined) {
        mealSchedule[mealDateKey][mealType].youth = meal.youth_count || '';
        mealSchedule[mealDateKey][mealType].adult = meal.adult_count || '';
        mealSchedule[mealDateKey][mealType].instructor = meal.instructor_count || '';
        mealSchedule[mealDateKey][mealType].other = meal.other_count || '';
        mealSchedule[mealDateKey][mealType].total = totalCount;
      } else {
        // Old format: only total participants
        mealSchedule[mealDateKey][mealType].total = totalCount;
      }
      
      console.log(`[PDF] Stored in mealSchedule[${mealDateKey}][${mealType}].total = ${mealSchedule[mealDateKey][mealType].total}`);
    });
  }
  
  console.log('[PDF] Final mealSchedule:', JSON.stringify(mealSchedule, null, 2));
  
  // Process meal data to match screen layout (날짜, 구분, 인원, 제공단가, 합계)
  // Show all dates with all meal types (조식, 중식, 석식) - even if no data
  const mealRows = [];
  console.log('[PDF] ===== mealRows 생성 시작 =====');
  dates.forEach(dateInfo => {
    const dateSchedule = mealSchedule[dateInfo.dateKey] || {
      breakfast: { total: '' },
      lunch: { total: '' },
      dinner: { total: '' }
    };
    
    console.log(`[PDF] 날짜 ${dateInfo.dateKey} 처리 중, dateSchedule:`, dateSchedule);
    
    // Process each meal type - always show all three types for each date
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const mealInfo = dateSchedule[mealType];
      // Get total count - handle both string and number, and 0 values
      let totalCount = '';
      if (mealInfo && mealInfo.total !== undefined && mealInfo.total !== null && mealInfo.total !== '') {
        totalCount = mealInfo.total;
      }
      
      console.log(`[PDF]   ${dateInfo.dateKey} ${mealType}: totalCount=${totalCount}, mealInfo=`, mealInfo);
      
      // Find the original meal data to get price information
      const originalMeal = mealData.find(m => {
        if (!m.date) return false;
        const mealDate = moment(m.date).format('YYYY-MM-DD');
        const mealTypeStr = m.meal_type || '';
        let type = 'breakfast';
        
        // Check for lunch types
        if (mealTypeStr.includes('lunch') || mealTypeStr === '중식' || mealTypeStr === 'lunch_box' || mealTypeStr === 'lunch_regular') {
          type = 'lunch';
        } 
        // Check for dinner types
        else if (mealTypeStr.includes('dinner') || mealTypeStr === '석식' || mealTypeStr === 'dinner_special_a' || mealTypeStr === 'dinner_special_b' || mealTypeStr === 'dinner_regular') {
          type = 'dinner';
        }
        // Default to breakfast
        else if (mealTypeStr.includes('breakfast') || mealTypeStr === '조식' || mealTypeStr === 'breakfast_regular') {
          type = 'breakfast';
        }
        
        const matches = mealDate === dateInfo.dateKey && type === mealType;
        if (matches) {
          console.log(`[PDF]     originalMeal 찾음: date=${mealDate}, meal_type=${mealTypeStr} -> ${type}, participants=${m.participants}, total_count=${m.total_count}, unitPrice=${m.unitPrice}, total=${m.total}`);
        }
        return matches;
      });
      
      const unitPrice = originalMeal && originalMeal.unitPrice !== undefined && originalMeal.unitPrice !== null ? originalMeal.unitPrice : '';
      const totalPrice = originalMeal && originalMeal.total !== undefined && originalMeal.total !== null ? originalMeal.total : '';
      
      const mealTypeName = mealType === 'breakfast' ? '조식' : mealType === 'lunch' ? '중식' : '석식';
      
      // Only add row if there is actual data (participants > 0 or price > 0)
      // 화면과 동일하게 실제 데이터가 있는 것만 표시
      const hasData = (totalCount && totalCount !== '' && totalCount !== 0) || 
                      (totalPrice && totalPrice !== '' && totalPrice !== 0) ||
                      (unitPrice && unitPrice !== '' && unitPrice !== 0);
      
      console.log(`[PDF]   ${dateInfo.dateKey} ${mealTypeName} hasData 체크: totalCount=${totalCount}, totalPrice=${totalPrice}, unitPrice=${unitPrice}, hasData=${hasData}`);
      
      if (hasData) {
        const row = {
          date: dateInfo.date,
          type: mealTypeName,
          people: totalCount,
          unitPrice: unitPrice,
          total: totalPrice
        };
        console.log(`[PDF]   행 추가:`, row);
        mealRows.push(row);
      } else {
        console.log(`[PDF]   행 제외 (데이터 없음): ${dateInfo.date} ${mealTypeName}`);
      }
    });
  });
  
  console.log('[PDF] ===== mealRows 생성 완료 =====');
  console.log('[PDF] 최종 mealRows 개수:', mealRows.length);
  console.log('[PDF] 최종 mealRows:', JSON.stringify(mealRows, null, 2));
  
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; table-layout: fixed;">
      <thead>
        <tr>
          <th style="width: 20%; background-color: #c0c0c0; padding: 4px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px;">날짜</th>
          <th style="width: 20%; background-color: #c0c0c0; padding: 4px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px;">구분</th>
          <th style="width: 20%; background-color: #c0c0c0; padding: 4px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px;">인원</th>
          <th style="width: 20%; background-color: #c0c0c0; padding: 4px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px;">제공단가</th>
          <th style="width: 20%; background-color: #c0c0c0; padding: 4px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 12px;">합계</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Always show all meal rows (already processed above to include all dates and meal types)
  console.log('[PDF] ===== HTML 테이블 생성 시작 =====');
  console.log('[PDF] mealRows를 HTML로 변환 중, 개수:', mealRows.length);
  mealRows.forEach((row, index) => {
    console.log(`[PDF] HTML 행 ${index + 1}:`, row);
    tableHTML += `
      <tr>
        <td style="padding: 4px; border: 1px solid #000; text-align: center; font-size: 12px; height: 20px;">${row.date}</td>
        <td style="padding: 4px; border: 1px solid #000; text-align: center; font-size: 12px; height: 20px;">${row.type}</td>
        <td style="padding: 4px; border: 1px solid #000; text-align: center; font-size: 12px; height: 20px;">${row.people || ''}</td>
        <td style="padding: 4px; border: 1px solid #000; text-align: right; font-size: 12px; height: 20px;">${row.unitPrice ? formatNumber(row.unitPrice) + '원' : ''}</td>
        <td style="padding: 4px; border: 1px solid #000; text-align: right; font-size: 12px; height: 20px;">${row.total ? formatNumber(row.total) + '원' : ''}</td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  
  console.log('[PDF] ===== generateMealScheduleTable 함수 완료 =====');
  console.log('[PDF] 생성된 HTML 길이:', tableHTML.length);
  
  return tableHTML;
} 