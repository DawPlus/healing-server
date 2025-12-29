import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import 'moment/locale/ko';
import html2canvas from 'html2canvas';

// Korean font support - let's modify the PDF solution to work without the font file
// remove the problematic import
// import NotoSansKRRegular from '../../../../NotoSansKR-Regular-base64.txt';

/**
 * Export program schedule as PDF
 * @param {Object} reservationData - The reservation data
 * @returns {boolean} - Whether the export was successful
 */
export const exportProgramSchedulePdf = (reservationData) => {
  try {
    if (!reservationData || !reservationData.getPage1ById) {
      console.error('Invalid reservation data');
      return false;
    }

    console.log("Input reservationData for PDF:", JSON.parse(JSON.stringify(reservationData)));
    
    const reservation = reservationData.getPage1ById;
    
    // Add detailed logging for page3 data
    console.log("Checking page3 data in reservation:", {
      hasPage3: !!reservation.page3,
      page3Data: reservation.page3 ? JSON.parse(JSON.stringify(reservation.page3)) : null
    });
    
    if (reservation.page3) {
      console.log("Found page3 data with meal_plans:", {
        mealPlans: reservation.page3.meal_plans,
        mealPlansType: typeof reservation.page3.meal_plans,
        mealPlansLength: Array.isArray(reservation.page3.meal_plans) ? reservation.page3.meal_plans.length : 'not array'
      });
    } else {
      console.log("No page3 data found in reservation");
    }
    
    moment.locale('ko');
    
    const page2Data = reservation.page2_reservations?.[0] || {};
    
    // 운영담당자를 우선적으로 사용
    const operationManager = reservation.operation_manager || reservation.reservation_manager || reservation.customer_name || '담당자 미지정';
    
    // 디버깅을 위한 로그
    console.log("📄 PDF관련로그: PDF 생성 - 담당자 정보:", {
      operation_manager: reservation.operation_manager,
      reservation_manager: reservation.reservation_manager,
      customer_name: reservation.customer_name,
      final_operationManager: operationManager
    });
    
    // 전체 reservation 객체 로그
    console.log("📄 PDF관련로그: PDF 생성 - 전체 예약 객체:", {
      id: reservation.id,
      group_name: reservation.group_name,
      operation_manager: reservation.operation_manager,
      reservation_manager: reservation.reservation_manager,
      customer_name: reservation.customer_name,
      email: reservation.email,
      start_date: reservation.start_date,
      end_date: reservation.end_date
    });
    // 연락처: 일반전화와 휴대전화 모두 표시
    const landlinePhone = reservation.landline_phone || '';
    const mobilePhone = reservation.mobile_phone || '';
    const contactPhone = [landlinePhone, mobilePhone].filter(phone => phone).join(' / ') || '';
    const contactEmail = reservation.email || '';
    const startDate = moment(reservation.start_date);
    const endDate = moment(reservation.end_date);
    const usagePeriod = `${startDate.format('M월 DD일(ddd)')} ~ ${endDate.format('M월 DD일(ddd)')}`;
    const organizationName = reservation.group_name || '단체명 미지정';
    
    const totalParticipants = (page2Data && page2Data.total_count) ? page2Data.total_count : 
                              (reservation.total_count || 0);
                              
    const leaderCount = (page2Data && page2Data.total_leader_count) ? page2Data.total_leader_count : 0;
    
    const businessCategory = reservation.business_category === 'profit_business' ? '수익사업' : 
                             reservation.business_category === 'social_contribution' ? '사회공헌' : '미지정';
    
    const programsByDay = {};
    const dayCount = endDate.diff(startDate, 'days') + 1;
    const totalPages = Math.ceil(dayCount / 3);
    console.log("reservation",reservation)
    // 식사 데이터 수집
    const mealsByDay = {};
    if (reservation.page3 && reservation.page3.meal_plans) {
      let mealPlans = reservation.page3.meal_plans;
      if (typeof mealPlans === 'string') {
        try {
          mealPlans = JSON.parse(mealPlans);
        } catch (e) {
          console.error("Error parsing page3.meal_plans string:", e);
          mealPlans = [];
        }
      }
      
      if (Array.isArray(mealPlans)) {
        mealPlans.forEach(meal => {
          if (!meal || !meal.date) return;
          
          // 날짜 문자열을 YYYY-MM-DD 형태로 정규화
          const mealDateStr = moment(meal.date).format('YYYY-MM-DD');
          const startDateStr = startDate.format('YYYY-MM-DD');
          
          // 문자열 기준으로 날짜 차이 계산 (타임존 문제 해결)
          const mealMoment = moment(mealDateStr);
          const startMoment = moment(startDateStr);
          const dayDiff = mealMoment.diff(startMoment, 'days');
          
          console.log(`Meal date processing: ${meal.date} -> ${mealDateStr}, start: ${startDateStr}, diff: ${dayDiff}`);
          
          if (dayDiff >= 0 && dayDiff < dayCount) {
            const dayKey = `day${dayDiff + 1}`;
            if (!mealsByDay[dayKey]) {
              mealsByDay[dayKey] = {};
            }
            
            // 식사 타입을 한국어로 변환 (영어와 한국어 모두 지원)
            let mealType = '';
            const mealTypeStr = (meal.meal_type || '').toLowerCase();
            
            if (mealTypeStr.includes('breakfast') || mealTypeStr.includes('조식')) {
              mealType = '조식';
            } else if (mealTypeStr.includes('lunch') || mealTypeStr.includes('중식')) {
              mealType = '중식';
            } else if (mealTypeStr.includes('dinner') || mealTypeStr.includes('석식')) {
              mealType = '석식';
            }
            
            if (mealType) {
              // 같은 날의 같은 식사 타입은 하나만 저장 (중복 방지)
              mealsByDay[dayKey][mealType] = {
                meal_type: mealType,
                participants: meal.participants || 0,
                organization: organizationName,
                meal_option: meal.meal_option || '',
                original_date: meal.date,
                processed_date: mealDateStr,
                day_diff: dayDiff
              };
              
              console.log(`Added meal: ${mealType} on ${dayKey} (${mealDateStr})`);
            }
          } else {
            console.log(`Meal date ${mealDateStr} is outside range (diff: ${dayDiff}, dayCount: ${dayCount})`);
          }
        });
      }
    }
    
    console.log("Collected meals by day (for PDF generation):", JSON.parse(JSON.stringify(mealsByDay)));

    const allProgramsRaw = [];
    if (reservation.page2_reservations) {
      for (const page2 of reservation.page2_reservations) {
        if (page2.programs) {
          let programs = page2.programs;
          if (typeof programs === 'string') {
            try {
              programs = JSON.parse(programs);
            } catch (e) {
              console.error("Error parsing page2.programs string:", e);
              programs = [];
            }
          }
          if (Array.isArray(programs)) {
            allProgramsRaw.push(...programs.map(p => ({...p, source: 'page2'}))); // 소스 추가
          }
        }
      }
    }

    // 화면 로그와 동일한 방식으로 reservation.programs (ScheduleProgram 타입) 직접 사용
    // GET_PROGRAM_SCHEDULE_BY_PAGE1_ID 쿼리 결과가 reservation.programs에 해당한다고 가정
    if (reservation.programs && Array.isArray(reservation.programs)) {
        allProgramsRaw.push(...reservation.programs.map(p => ({...p, source: 'reservation'}))); // 소스 추가
    }
    
    // 대관 예약 데이터도 프로그램으로 처리 (reservation.places)
    if (reservation.places && Array.isArray(reservation.places)) {
        allProgramsRaw.push(...reservation.places.map(p => ({
            ...p, 
            source: 'place',
            id: `place_${p.date}_${p.start_time}_${p.place_name}`, // 대관 예약용 고유 ID 생성
            program_name: p.program_name || p.name || '대관 예약',
            instructor_name: p.instructor_name || `${p.participants || 0}명`
        })));
    }
    
    // 통합된 일정 데이터 사용 (프로그램 + 대관 예약)
    if (reservation.allScheduleItems && Array.isArray(reservation.allScheduleItems)) {
        allProgramsRaw.push(...reservation.allScheduleItems.map(item => ({
            ...item,
            source: item.type === 'place' ? 'place' : 'combined',
            id: item.id || `${item.type}_${item.date}_${item.start_time}_${item.program_name || item.name}`,
            program_name: item.program_name || item.name,
            instructor_name: item.instructor_name
        })));
    }

    console.log("Raw combined programs before processing:", JSON.parse(JSON.stringify(allProgramsRaw)));

    const processedProgramIds = new Set(); // 프로그램 ID 기준으로 중복 제거용

    allProgramsRaw.forEach(program => {
      // 프로그램 객체 구조 확인 및 필수 필드 검증 (프로그램과 대관 예약 모두 처리)
      // 대관 예약의 경우 일부 필드가 다를 수 있으므로 더 유연한 검증
      if (!program || !program.date) {
        console.warn("Skipping invalid program/place object (missing date):", program);
        return; // 날짜 정보가 없으면 건너뛰기
      }
      
      // program_name이나 name 중 하나는 있어야 함
      if (!program.program_name && !program.name) {
        console.warn("Skipping program/place object (missing name):", program);
        return;
      }
      
      // ID가 없으면 생성
      if (!program.id) {
        const nameForId = program.program_name || program.name || 'unknown';
        program.id = `${program.source || 'unknown'}_${program.date}_${program.start_time || 'notime'}_${nameForId}`;
      }
      
      if (processedProgramIds.has(program.id)) {
        // console.log(`Skipping duplicate program ID: ${program.id} - ${program.program_name || program.name}`);
        return; // 이미 처리된 프로그램 ID면 건너뛰기
      }

      // 날짜 문자열을 YYYY-MM-DD 형태로 정규화 (타임존 문제 해결)
      const programDateStr = moment(program.date).format('YYYY-MM-DD');
      const startDateStr = startDate.format('YYYY-MM-DD');
      
      // 문자열 기준으로 날짜 차이 계산
      const programMoment = moment(programDateStr);
      const startMoment = moment(startDateStr);
      const dayDiff = programMoment.diff(startMoment, 'days');
      
      console.log(`Program date processing: ${program.date} -> ${programDateStr}, start: ${startDateStr}, diff: ${dayDiff}`);
            
            if (dayDiff >= 0 && dayDiff < dayCount) {
              const dayKey = `day${dayDiff + 1}`;
              if (!programsByDay[dayKey]) {
                programsByDay[dayKey] = [];
              }
              
        // 화면 로그와 동일한 필드 구조로 저장
              programsByDay[dayKey].push({
          id: program.id, // 중복 제거 및 식별용
          program_name: program.program_name || program.name || '프로그램명 미지정',
          organization: program.organization, // 화면 로그 형식에 맞게 추가
          start_time: program.start_time || '',
          end_time: program.end_time || '',
          location: program.location || program.place_name, // place_name도 확인
          participants: program.participants, // 화면 로그 형식에 맞게 추가
          instructor_name: program.instructor_name, // 화면 로그 형식에 맞게 추가
          date: program.date, // 화면 로그 형식에 맞게 추가
          original_date: program.date,
          processed_date: programDateStr,
          day_diff: dayDiff,
          source: program.source, // 소스 정보 추가 (프로그램/대관 구분)
          type: program.type || (program.source === 'place' ? 'place' : 'program') // 타입 정보 추가
          // 필요한 경우 다른 필드도 추가
        });
        processedProgramIds.add(program.id); // 처리된 프로그램 ID 추가
        const displayName = program.program_name || program.name || '이름 미지정';
        const typeLabel = program.source === 'place' ? '[대관]' : '[프로그램]';
        console.log(`Added ${typeLabel} ${displayName} on ${dayKey} (${programDateStr})`);
      } else {
        console.log(`Program date ${programDateStr} is outside range (diff: ${dayDiff}, dayCount: ${dayCount})`);
      }
    });
    
    console.log("Collected programs by day (for PDF generation):", JSON.parse(JSON.stringify(programsByDay)));
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const generatePdfPage = async (pageIndex) => {
      const startDayNum = pageIndex * 3 + 1;
      const endDayNum = Math.min(startDayNum + 2, dayCount);
      
      console.log("Generating PDF page", pageIndex + 1, "for days", startDayNum, "to", endDayNum);
      
      const dayHeaders = [];
      for (let i = startDayNum - 1; i < endDayNum; i++) {
        const day = startDate.clone().add(i, 'days');
        dayHeaders.push(`${i+1}일차<br/>(${day.format('M/D')})`);
      }
      
      const container = document.createElement('div');
      container.style.width = '1200px'; // 더 큰 너비로 설정
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);
      
      container.innerHTML = `
        <div style="padding: 20px;">
          <div style="text-align: left; font-size: 16px;">
            &lt;별지4&gt; 프로그램 일정표 (${pageIndex + 1}/${totalPages})
          </div>
          <div style="text-align: center; margin: 15px 0;">
            <h1 style="font-size: 22px;">프로그램 일정표</h1>
          </div>
          <div style="text-align: right; font-size: 11px;">
             담당 OM : ${operationManager}
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid black;">
            <tr style="height: 30px;">
              <td style="width: 15%; background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">이용기간</td>
              <td style="width: 35%; padding: 5px; border: 1px solid black;">${usagePeriod}</td>
              <td style="width: 15%; background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">단체명</td>
              <td style="width: 35%; padding: 5px; border: 1px solid black;">${organizationName}</td>
            </tr>
            <tr style="height: 30px;">
              <td style="background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">이용인원</td>
              <td colspan="3" style="padding: 0; border: 1px solid black;">
                <table style="width: 100%; border-collapse: collapse; height: 100%;">
                  <tr style="height: 30px;">
                    <td style="width: 50%; background-color: #dcdcdc; padding: 5px; border-right: 1px solid black; font-weight: bold; text-align: center;">참가자</td>
                    <td style="width: 50%; background-color: #dcdcdc; padding: 5px; font-weight: bold; text-align: center;">인솔자</td>
                  </tr>
                  <tr style="height: 30px;">
                    <td style="padding: 5px; border-right: 1px solid black; text-align: center;">${totalParticipants}</td>
                    <td style="padding: 5px; text-align: center;">${leaderCount}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr style="height: 30px;">
              <td style="background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">연락처</td>
              <td style="padding: 5px; border: 1px solid black;">${contactPhone}</td>
              <td style="background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">참가자 연령</td>
              <td style="padding: 5px; border: 1px solid black;">${page2Data.age_type || '가족'}</td>
            </tr>
            <tr style="height: 30px;">
              <td style="background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">이메일</td>
              <td style="padding: 5px; border: 1px solid black;">${contactEmail}</td>
              <td style="background-color: #dcdcdc; padding: 5px; border: 1px solid black; font-weight: bold;">사업구분</td>
              <td style="padding: 5px; border: 1px solid black;">${businessCategory}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; font-size: 11px;">
            ○ 프로그램 일정
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black;">
            <thead>
              <tr>
                <th style="width: 15%; background-color: #f0f0f0; padding: 5px; border: 1px solid black; text-align: center; height: 30px;">시 간</th>
                ${dayHeaders.map(day => 
                  `<th style="width: ${85 / dayHeaders.length}%; background-color: #f0f0f0; padding: 5px; border: 1px solid black; text-align: center; height: 30px;">${day}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${generateTimeRows(programsByDay, dayCount, startDayNum, endDayNum, mealsByDay)}
            </tbody>
          </table>
          <div style="margin-top: 10px; font-size: 9px;">
            ※ 프로그램 일정은 상황에 따라 변경될 수 있으며, 우천 시 대체 프로그램으로 제공<br/>
            ※ 개별프로그램 운영시간은 90분~120분입니다.<br/>
            ※ 자율시간 중 공간사용이 필요한 경우 사전협의가 반드시 필요합니다.
          </div>
          <div style="margin-top: 20px; font-size: 11px;">
            ○ 특이사항
          </div>
          <div style="margin-top: 10px; width: 100%; height: 60px; border: 1px solid black;"></div>
        </div>
      `;
      
      try {
        const canvas = await html2canvas(container, {
          scale: 1.5, // 더 적절한 스케일링
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1200,
          height: 1600 // 더 큰 높이 설정
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        if (pageIndex > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating PDF page canvas:', error);
        document.body.removeChild(container);
        return false;
      }
    };
    
    const generateAllPages = async () => {
      for (let i = 0; i < totalPages; i++) {
        const success = await generatePdfPage(i);
        if (!success) {
          console.error(`Failed to generate page ${i + 1}`);
          // Optionally, handle page generation failure (e.g., stop PDF generation)
          return; 
        }
      }
      pdf.save(`${organizationName}_프로그램일정표_${moment().format('YYMMDD')}.pdf`);
    };
    
    setTimeout(() => {
      generateAllPages().catch(err => console.error("Error in generateAllPages:", err));
    }, 500);
    
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
};

// Helper function to generate time rows with merged cells for multi-time programs
function generateTimeRows(programsByDay, dayCount, startDay, endDay, mealsByDay) {
  // 시간 문자열을 분으로 변환 (예: "19:30" -> 19 * 60 + 30 = 1170)
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  // 30분 단위 시간 슬롯 정의
  const timeSlots = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push({ 
      label: `${String(hour).padStart(2, '0')}:00~${String(hour).padStart(2, '0')}:30`, 
      start: `${String(hour).padStart(2, '0')}:00`, 
      end: `${String(hour).padStart(2, '0')}:30`,
      minutes: hour * 60
    });
    if (hour < 21) {
      timeSlots.push({ 
        label: `${String(hour).padStart(2, '0')}:30~${String(hour + 1).padStart(2, '0')}:00`, 
        start: `${String(hour).padStart(2, '0')}:30`, 
        end: `${String(hour + 1).padStart(2, '0')}:00`,
        minutes: hour * 60 + 30
      });
    }
  }
  timeSlots.push({ 
    label: '21:00~21:30', 
    start: '21:00', 
    end: '21:30',
    minutes: 21 * 60
  });
  
  console.log("11 Generating time rows for days", startDay, "to", endDay);
  console.log("Programs by day (input to generateTimeRows):", JSON.parse(JSON.stringify(programsByDay)));
  
  // 각 일자별로 프로그램의 시간 범위를 계산하여 rowspan 정보 생성
  const programSpans = {};
  const mealSpans = {}; // 식사 rowspan 정보 추가
  
  for (let dayIndex = startDay; dayIndex <= endDay; dayIndex++) {
    const dayKey = `day${dayIndex}`;
    const dailyPrograms = programsByDay[dayKey] || [];
    const dailyMeals = mealsByDay[dayKey] || {};
    
    programSpans[dayKey] = [];
    mealSpans[dayKey] = [];
    
    // 프로그램 rowspan 계산
    dailyPrograms.forEach(program => {
      if (!program.start_time || !program.end_time) return;
      
      const startMinutes = timeToMinutes(program.start_time);
      const endMinutes = timeToMinutes(program.end_time);
      
      // 프로그램이 시작되는 첫 번째 슬롯과 끝나는 마지막 슬롯 찾기
      let startSlotIndex = -1;
      let endSlotIndex = -1;
      
      for (let i = 0; i < timeSlots.length; i++) {
        const slotStartMinutes = timeToMinutes(timeSlots[i].start);
        const slotEndMinutes = timeToMinutes(timeSlots[i].end);
        
        if (startSlotIndex === -1 && startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) {
          startSlotIndex = i;
        }
        if (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) {
          endSlotIndex = i;
        }
      }
      
      if (startSlotIndex !== -1 && endSlotIndex !== -1) {
        const rowspan = endSlotIndex - startSlotIndex + 1;
        programSpans[dayKey].push({
          program,
          startSlotIndex,
          endSlotIndex,
          rowspan
        });
      }
    });
    
    // 식사 rowspan 계산 및 설정
    Object.keys(dailyMeals).forEach(mealType => {
      let startSlotIndex = -1;
      let rowspan = 2; // 각 식사는 1시간(2개 슬롯)을 차지
      
      if (mealType === '조식') {
        // 08:00~09:00 (슬롯 0, 1)
        startSlotIndex = timeSlots.findIndex(slot => slot.start === "08:00");
      } else if (mealType === '중식') {
        // 12:00~13:00 (슬롯 8, 9)
        startSlotIndex = timeSlots.findIndex(slot => slot.start === "12:00");
      } else if (mealType === '석식') {
        // 18:00~19:00 (슬롯 20, 21)
        startSlotIndex = timeSlots.findIndex(slot => slot.start === "18:00");
      }
      
      if (startSlotIndex !== -1) {
        mealSpans[dayKey].push({
          mealType,
          startSlotIndex,
          rowspan
        });
      }
    });
  }
  
  // 이미 처리된 셀을 추적하기 위한 배열
  const processedCells = {};
  
  // Generate rows
  return timeSlots.map((timeSlot, slotIndex) => {
    const rowCells = [];
    
    // Time column
    rowCells.push(`<td style="background-color: #f0f0f0; padding: 5px; border: 1px solid black; text-align: center; height: 20px; font-size:9px;">${timeSlot.label}</td>`);
    
    // Day columns for the specific range of days on this page
    for (let dayIndex = startDay; dayIndex <= endDay; dayIndex++) {
      const dayKey = `day${dayIndex}`;
      const cellKey = `${dayKey}_${slotIndex}`;
      
      // 이미 처리된 셀이면 건너뛰기 (rowspan으로 병합됨)
      if (processedCells[cellKey]) {
        continue;
      }
      
      const daySpans = programSpans[dayKey] || [];
      const dayMealSpans = mealSpans[dayKey] || [];
      const programSpan = daySpans.find(span => span.startSlotIndex === slotIndex);
      const mealSpan = dayMealSpans.find(span => span.startSlotIndex === slotIndex);
      
      if (programSpan) {
        // 프로그램이 시작되는 슬롯 - rowspan 적용
        const program = programSpan.program;
        const rowspan = programSpan.rowspan;
        
        // rowspan에 해당하는 모든 셀을 처리됨으로 표시
        for (let i = 0; i < rowspan; i++) {
          processedCells[`${dayKey}_${slotIndex + i}`] = true;
        }
        
        // 프로그램 정보를 단체명, 장소, 시간 형태로 표시
        const programName = program.program_name || program.name || '';
        const location = program.location || '';
        const timeRange = `${program.start_time}~${program.end_time}`;
        const isPlace = program.source === 'place' || program.type === 'place';
        
        let cellContent = '';
        
        cellContent += `<div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; line-height: 1.2;">${programName}</div>`;
        if (location) {
          cellContent += `<div style="font-size: 11px; margin-bottom: 3px; color: #666; line-height: 1.1;">${location}</div>`;
        } 
        cellContent += `<div style="font-size: 11px; color: #333; line-height: 1.1;">${timeRange}</div>`;
        
        // 대관 예약과 프로그램의 배경색 구분
        const backgroundColor = isPlace ? '#fce4ec' : '#e2efda'; // 대관: 옅은 분홍색, 프로그램: 녹색 계열
        
        const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : '';
        rowCells.push(`<td${rowspanAttr} style="background-color: ${backgroundColor}; padding: 4px; border: 1px solid black; text-align: center; height: 20px; font-size:9px; vertical-align: middle;">${cellContent}</td>`);
      } else if (mealSpan) {
        // 식사가 시작되는 슬롯 - rowspan 적용
        const rowspan = mealSpan.rowspan;
        
        // rowspan에 해당하는 모든 셀을 처리됨으로 표시
        for (let i = 0; i < rowspan; i++) {
          processedCells[`${dayKey}_${slotIndex + i}`] = true;
          }
        
        const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : '';
        rowCells.push(`<td${rowspanAttr} style="background-color: #d9e1f2; padding: 5px; border: 1px solid black; text-align: center; height: 20px; font-size:10px; vertical-align: middle;">${mealSpan.mealType}</td>`);
      } else {
        // 빈 셀 처리
        rowCells.push(`<td style="padding: 5px; border: 1px solid black; text-align: center; height: 20px; font-size:9px;"></td>`);
        }
      }
    return `<tr style="height: 20px;">${rowCells.join('')}</tr>`;
  }).join('');
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  
  if (hex === 'ffffff') return [255, 255, 255];
  if (hex === 'd9e1f2') return [217, 225, 242]; // Light blue
  if (hex === 'e2efda') return [226, 239, 218]; // Light green
  if (hex === 'fce4ec') return [252, 228, 236]; // Light pink (대관 예약)
  if (hex === 'ffff99') return [255, 255, 153]; // Yellow
  
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return [r, g, b];
} 