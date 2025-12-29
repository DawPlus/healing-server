import XLSX from 'xlsx-js-style';
import moment from 'moment';

// Define styles
const styles = {
  defaultStyle: {
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
  },
  headerStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 10,
      name: '굴림',
      bold: true,
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'D9D9D9' }, patternType: 'solid' }
  },
  titleStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 12,
      name: '굴림',
      bold: true,
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'D9D9D9' }, patternType: 'solid' }
  },
  dateHeaderStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 10,
      name: '굴림',
      bold: true,
      color: { rgb: '0000FF' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  },
  dateWeekendStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 10,
      name: '굴림',
      bold: true,
      color: { rgb: 'FF0000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  },
  programCell: {
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
    },
    fill: { fgColor: { rgb: 'CCFFCC' }, patternType: 'solid' }
  },
  highlightCell: {
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
    },
    fill: { fgColor: { rgb: 'FFFF99' }, patternType: 'solid' }
  },
  totalCell: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 10,
      name: '굴림',
      bold: true,
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'D9D9D9' }, patternType: 'solid' }
  }
};

// Helper functions
const getWeekday = (dateStr) => {
  const date = new Date(dateStr);
  const weekday = date.getDay();
  const koreanDays = ['일', '월', '화', '수', '목', '금', '토'];
  return koreanDays[weekday];
};

const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6; // 0 is Sunday, 6 is Saturday
};

// Function to generate styled cells
const styledCell = (value, style) => {
  return { v: value, t: value === null || value === '' ? 's' : typeof value === 'number' ? 'n' : 's', s: style };
};

// Main export function
const exportMonthlySchedule = (year, month, scheduleData) => {
  try {
    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Format the title
    const monthName = month.toString().padStart(2, '0');
    const title = `${month}월 예약 현황`;
    
    // Get all dates for the month
    const daysInMonth = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const dateStr = `${year}-${monthName}-${(i + 1).toString().padStart(2, '0')}`;
      return {
        date: dateStr,
        day: i + 1,
        weekday: getWeekday(dateStr),
        isWeekend: isWeekend(dateStr)
      };
    });
    
    // Initialize worksheet data
    const wsData = [];
    
    // Add title row
    const titleRow = [styledCell(title, styles.titleStyle)];
    // Extended title across all columns
    for (let i = 0; i < 14; i++) {
      titleRow.push(styledCell('', styles.titleStyle));
    }
    wsData.push(titleRow);
    
    // Add date and header info
    const dateHeaderRow = [
      styledCell('', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('고객정보 - 개인 or 단체명', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('고객수', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('식수 인원', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('진행 프로그램', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell('', styles.headerStyle),
      styledCell(`작성일자: ${moment().format('YYYY.MM.DD')}`, styles.headerStyle)
    ];
    wsData.push(dateHeaderRow);
    
    // Add column headers
    const columnHeaders = [
      styledCell('일', styles.headerStyle),
      styledCell('요일', styles.headerStyle),
      styledCell('시간대', styles.headerStyle),
      styledCell('소계', styles.headerStyle),
      styledCell('유료', styles.headerStyle),
      styledCell('무료', styles.headerStyle),
      styledCell('스탠다드', styles.headerStyle),
      styledCell('디럭스', styles.headerStyle),
      styledCell('조', styles.headerStyle),
      styledCell('중', styles.headerStyle),
      styledCell('석', styles.headerStyle),
      styledCell('프로그램명', styles.headerStyle),
      styledCell('장소', styles.headerStyle),
      styledCell('시간', styles.headerStyle),
      styledCell('강사', styles.headerStyle)
    ];
    wsData.push(columnHeaders);
    
    // Add data rows for each date in the month
    dates.forEach((date, dateIndex) => {
      // Get schedule data for this date
      const dayData = scheduleData.find(d => d.date === date.date) || { programs: [], rooms: [], meals: [] };
      
      // Define the dayStyle based on weekend status
      const dayStyle = date.isWeekend ? styles.dateWeekendStyle : styles.dateHeaderStyle;
      
      // Morning rows (오전)
      // First morning row
      wsData.push([
        styledCell(`${date.day}일차`, dayStyle),
        styledCell(date.weekday, dayStyle),
        styledCell('시간대', styles.defaultStyle),
        styledCell('오전', styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle)
      ]);
      
      // Morning program rows 
      const morningPrograms = dayData.programs?.filter(p => {
        const hour = parseInt(p.start_time?.split(':')[0] || 0);
        return hour < 12;
      }) || [];
      
      if (morningPrograms.length > 0) {
        morningPrograms.forEach(program => {
          wsData.push([
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('오전', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell(program.program_name || '', styles.programCell),
            styledCell(program.location || '', styles.defaultStyle),
            styledCell(`${program.start_time || ''}-${program.end_time || ''}`, styles.defaultStyle),
            styledCell(program.instructor || '', styles.defaultStyle)
          ]);
        });
      }
      
      // Morning subtotal row
      wsData.push([
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('소계', styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle)
      ]);
      
      // Afternoon rows (오후)
      // First afternoon row
      wsData.push([
        styledCell('', styles.defaultStyle),
        styledCell(date.weekday, dayStyle),
        styledCell('시간대', styles.defaultStyle),
        styledCell('오후', styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle)
      ]);
      
      // Afternoon program rows
      const afternoonPrograms = dayData.programs?.filter(p => {
        const hour = parseInt(p.start_time?.split(':')[0] || 0);
        return hour >= 12;
      }) || [];
      
      if (afternoonPrograms.length > 0) {
        afternoonPrograms.forEach(program => {
          wsData.push([
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('오후', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell('', styles.defaultStyle),
            styledCell(program.program_name || '', styles.programCell),
            styledCell(program.location || '', styles.defaultStyle),
            styledCell(`${program.start_time || ''}-${program.end_time || ''}`, styles.defaultStyle),
            styledCell(program.instructor || '', styles.defaultStyle)
          ]);
        });
      }
      
      // Afternoon subtotal row
      wsData.push([
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('소계', styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell(0, styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle),
        styledCell('', styles.defaultStyle)
      ]);
    });
    
    // Create the worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 6 },   // 일
      { width: 4 },   // 요일
      { width: 6 },   // 시간대
      { width: 8 },   // 소계
      { width: 5 },   // 유료
      { width: 5 },   // 무료
      { width: 8 },   // 스탠다드
      { width: 6 },   // 디럭스
      { width: 3 },   // 조
      { width: 3 },   // 중
      { width: 3 },   // 석
      { width: 20 },  // 프로그램명
      { width: 15 },  // 장소
      { width: 12 },  // 시간
      { width: 10 }   // 강사
    ];
    
    // Set merges
    const merges = [
      // Title across all columns
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
      
      // Header merges
      { s: { r: 1, c: 2 }, e: { r: 1, c: 3 } },   // 고객정보
      { s: { r: 1, c: 4 }, e: { r: 1, c: 5 } },   // 고객수
      { s: { r: 1, c: 6 }, e: { r: 1, c: 8 } },   // 식수 인원
      { s: { r: 1, c: 9 }, e: { r: 1, c: 13 } }   // 진행 프로그램
    ];
    
    ws['!merges'] = merges;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, '월별 일정표');
    
    // Generate filename
    const filename = `${year}년 ${month}월 예약현황_${moment().format('YYYYMMDD')}`;
    
    // Write the file
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    return false;
  }
};

export default exportMonthlySchedule;