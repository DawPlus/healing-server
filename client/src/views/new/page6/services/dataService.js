import moment from 'moment';
import Swal from 'sweetalert2';

// 날짜 포맷팅 함수
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  try {
    // date가 유효한 날짜인지 확인
    const momentDate = moment(date);
    if (!momentDate.isValid()) {
      console.warn(`Invalid date passed to formatDate: ${date}`);
      return '';
    }
    
    // 날짜 형식 변환
    return momentDate.format(format);
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return '';
  }
};

// 시간 포맷팅
export const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    return moment(timeString, 'HH:mm').format('HH:mm');
  } catch (e) {
    return timeString;
  }
};

// 시작일과 종료일 사이의 날짜 범위 생성
export const generateDateRange = (startDate, endDate) => {
  try {
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');
    
    if (!start.isValid() || !end.isValid()) {
      console.warn(`Invalid dates passed to generateDateRange: ${startDate}, ${endDate}`);
      return [];
    }
    
    const dates = [];
    
    // 시작일과, 종료일 사이의 모든 날짜 추가
    const current = start.clone();
    while (current.isSameOrBefore(end)) {
      // 날짜만 포함하는 새 moment 객체 생성 (시간대 이슈 방지)
      dates.push(current.clone());
      current.add(1, 'day');
    }
    
    return dates;
  } catch (error) {
    console.error(`Error generating date range: ${startDate} - ${endDate}`, error);
    return [];
  }
};

// 알림 표시 함수
export const showAlert = (message, type = 'info') => {
  if (window.Swal) {
    window.Swal.fire({
      icon: type,
      title: type === 'success' ? '성공' : type === 'error' ? '오류' : '알림',
      text: message,
      timer: 3000,
      timerProgressBar: true
    });
  } else {
    alert(message);
  }
};

// 일정표 시간 슬롯 생성
export const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 8; hour <= 21; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00~${(hour + 1).toString().padStart(2, '0')}:00`);
  }
  return timeSlots;
};

// 일차 계산 (시작일 기준)
export const calculateDay = (startDate, currentDate) => {
  const start = moment(startDate);
  const current = moment(currentDate);
  const diff = current.diff(start, 'days');
  return diff + 1; // 첫날은 1일차
};

// 예약 데이터에서 일정표 데이터 추출
export const extractScheduleData = (reservationDetail) => {
  if (!reservationDetail) return { programs: [], meals: [], places: [] };
  
  const programs = [];
  const meals = [];
  const places = [];
  
  // 프로그램 데이터 추출
  if (reservationDetail.page2_reservations) {
    reservationDetail.page2_reservations.forEach(page2 => {
      if (page2.programs) {
        page2.programs.forEach(program => {
          if (program && program.date) {
            programs.push({
              id: program.id,
              date: program.date,
              program_name: program.program_name || program.category_name,
              start_time: program.start_time,
              end_time: program.end_time,
              place_name: program.place_name,
              instructor_name: program.instructor_name
            });
          }
        });
      }
    });
  }
  
  // 식사 데이터 추출
  if (reservationDetail.page3 && reservationDetail.page3.meal_plans) {
    reservationDetail.page3.meal_plans.forEach(meal => {
      if (meal && meal.date) {
        const mealTypeMap = {
          breakfast: '조식',
          lunch: '중식',
          dinner: '석식'
        };
        
        meals.push({
          id: meal.id,
          date: meal.date,
          meal_type: mealTypeMap[meal.meal_type] || meal.meal_type,
          participants: meal.participants,
          meal_option: meal.meal_option
        });
      }
    });
  }
  
  // 장소 예약 데이터 추출
  if (reservationDetail.page3 && reservationDetail.page3.place_reservations) {
    reservationDetail.page3.place_reservations.forEach(place => {
      if (place && place.reservation_date) {
        places.push({
          id: place.id,
          date: place.reservation_date,
          place_name: place.place_name,
          start_time: place.start_time,
          end_time: place.end_time,
          purpose: place.purpose,
          participants: place.participants
        });
      }
    });
  }
  
  return { programs, meals, places };
};

// formatRoomAssignments 함수: 객실 배정 데이터를 날짜별로 포맷팅
export const formatRoomAssignments = (roomAssignments, dateRange) => {
  // 결과 객체 초기화
  const result = roomAssignments.map(room => {
    // 날짜별 배정 정보를 저장할 객체 초기화
    const assignments = {};
    
    // dateRange의 각 날짜에 대한 기본값 설정
    dateRange.forEach(date => {
      assignments[date] = null;
    });
    
    // 해당 객실의 배정 정보 설정
    if (room.assignments && room.assignments.length > 0) {
      room.assignments.forEach(assignment => {
        // 서버에서 오는 날짜 형식을 dateRange와 일치시킴
        const dateStr = assignment.date;
        if (assignments.hasOwnProperty(dateStr)) {
          assignments[dateStr] = {
            id: assignment.id,
            reservation_id: assignment.reservation_id,
            organization: assignment.organization,
            occupancy: assignment.occupancy
          };
        }
      });
    }
    
    return {
      ...room,
      assignments
    };
  });
  
  console.log("Formatted room assignments:", result);
  return result;
};

// 숫자 포맷팅 (1000 단위 콤마 추가)
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  
  // 숫자가 0이면 '0' 반환
  if (num === 0) return '0';
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 수익 실적 보고서 데이터 필터링
export const filterUsageReportData = (data, selectedOrganization) => {
  if (!data) return [];
  
  if (!selectedOrganization) return data;
  
  return data.filter(item => item.organization === selectedOrganization);
};

// 강사비 지급 정보 필터링
export const filterInstructorPayments = (data, selectedInstructor) => {
  if (!data) return [];
  
  if (!selectedInstructor) return data;
  
  return data.filter(item => item.instructor_name === selectedInstructor);
};

// 강사비 지급 월별 요약 계산
export const calculateInstructorSummary = (data) => {
  if (!data || data.length === 0) {
    return {
      total_amount: 0,
      total_tax: 0,
      total_final_amount: 0,
      total_assistant_fee: 0,
      total_helper_fee: 0,
      instructor_count: 0,
      session_count: 0
    };
  }
  
  // 중복 제거를 위한 Set
  const uniqueInstructors = new Set();
  
  // 합계 계산
  const summary = data.reduce((acc, item) => {
    uniqueInstructors.add(item.instructor_name);
    
    return {
      total_amount: acc.total_amount + (item.payment_amount || 0),
      total_tax: acc.total_tax + (item.tax_amount || 0),
      total_final_amount: acc.total_final_amount + (item.final_amount || 0),
      total_assistant_fee: acc.total_assistant_fee + (item.assistant_instructor_fee || 0),
      total_helper_fee: acc.total_helper_fee + (item.healing_helper_fee || 0),
      session_count: acc.session_count + (item.sessions || 1)
    };
  }, {
    total_amount: 0,
    total_tax: 0,
    total_final_amount: 0,
    total_assistant_fee: 0,
    total_helper_fee: 0,
    session_count: 0
  });
  
  // 강사 수 추가
  summary.instructor_count = uniqueInstructors.size;
  
  return summary;
};

// 날짜 비교 함수 (서버와 클라이언트 간 일관된 날짜 처리)
export const compareDates = (date1, date2) => {
  try {
    // 날짜만 비교 (시간 무시)
    const d1 = moment(date1).startOf('day');
    const d2 = moment(date2).startOf('day');
    
    if (!d1.isValid() || !d2.isValid()) {
      console.warn(`Invalid dates in compareDates: ${date1}, ${date2}`);
      return false;
    }
    
    return d1.diff(d2, 'days');
  } catch (error) {
    console.error(`Error comparing dates: ${date1}, ${date2}`, error);
    return 0;
  }
};

// 이벤트가 날짜에 속하는지 확인
export const isEventOnDate = (event, date) => {
  if (!event || !event.date) return false;
  
  try {
    const eventDate = moment(event.date).startOf('day');
    const checkDate = moment(date).startOf('day');
    
    if (!eventDate.isValid() || !checkDate.isValid()) {
      console.warn(`Invalid dates in isEventOnDate: ${event.date}, ${date}`);
      return false;
    }
    
    return eventDate.isSame(checkDate);
  } catch (error) {
    console.error(`Error checking if event is on date: ${event.date}, ${date}`, error);
    return false;
  }
}; 