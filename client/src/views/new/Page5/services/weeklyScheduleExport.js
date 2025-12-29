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
  tableHeaderStyle: {
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
    fill: { fgColor: { rgb: 'FFFFCC' }, patternType: 'solid' }
  },
  timeSlotStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 9,
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
  facilityNameStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 9,
      name: '굴림',
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'FFFFCC' }, patternType: 'solid' }
  },
  emptyStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 9,
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
  breakTimeStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 9,
      name: '굴림',
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'FFFFCC' }, patternType: 'solid' }
  },
  programStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 9,
      name: '굴림',
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'E6E6E6' }, patternType: 'solid' }
  },
  sleepStyle: {
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      wrapText: true
    },
    font: {
      sz: 9,
      name: '굴림',
      color: { rgb: '000000' }
    },
    border: {
      bottom: { style: 'thin', color: { rgb: '000000' } },
      top: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    },
    fill: { fgColor: { rgb: 'CCCCFF' }, patternType: 'solid' }
  }
};

// Function to generate styled cells
const styledCell = (value, style) => {
  return { v: value, t: value === null || value === '' ? 's' : typeof value === 'number' ? 'n' : 's', s: style };
};

// Function to get weekday in Korean
const getKoreanWeekday = (date) => {
  const weekday = date.day();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[weekday];
};

// Main export function that matches the image layout
const exportWeeklySchedule = (startDate, endDate, scheduleData = []) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Format dates
    const momentStartDate = moment(startDate);
    const momentEndDate = moment(endDate);
    
    // Get the date range for the week
    const dateRange = [];
    let current = momentStartDate.clone();
    
    while (current.isSameOrBefore(momentEndDate)) {
      dateRange.push(current.clone());
      current.add(1, 'day');
    }
    
    if (dateRange.length === 0) {
      console.error('Invalid date range');
      return false;
    }
    
    // Generate title for the sheet
    const title = `${momentStartDate.format('M.D')}(${getKoreanWeekday(momentStartDate)}) ~ ${momentEndDate.format('M.D')}(${getKoreanWeekday(momentEndDate)})`;
    
    // Create 3 tables as shown in the image
    for (let tableIndex = 0; tableIndex < 3; tableIndex++) {
      // Initialize worksheet data
      const wsData = [];
      
      // Define which dates to show in this table (each table shows 2 days)
      const tableDates = dateRange.slice(tableIndex * 2, tableIndex * 2 + 2);
      if (tableDates.length === 0) break;
      
      // Create title row for the table
      const dateFormatted = tableDates.map(date => `${date.format('M.D')}(${getKoreanWeekday(date)})`).join(' ~ ');
      const titleRow = [styledCell('', styles.defaultStyle)];
      for (let i = 0; i < 30; i++) {
        titleRow.push(styledCell('', styles.defaultStyle));
      }
      wsData.push(titleRow);
      
      // Add header rows for the facilities
      const headerRow1 = [styledCell('시간', styles.headerStyle)];
      
      // For each date in this table (typically 2 days)
      for (let dateIndex = 0; dateIndex < tableDates.length; dateIndex++) {
        const date = tableDates[dateIndex];
        const dateString = date.format('M.D');
        const weekday = getKoreanWeekday(date);
        
        // Each date has 3 facilities (as shown in the image)
        headerRow1.push(styledCell('테라피 허브/자연치유인돌홈센터(19인)', styles.headerStyle));
        headerRow1.push(styledCell('서울 구립서남장애인종합복지센터(23인)', styles.headerStyle));
        headerRow1.push(styledCell('인천 에나자연치유힐링센터(27인)', styles.headerStyle));
      }
      
      // Add an empty column at the end if there's only one date in this table
      if (tableDates.length === 1) {
        headerRow1.push(styledCell('시간', styles.headerStyle));
      }
      
      wsData.push(headerRow1);
      
      // Add instructor row
      const headerRow2 = [styledCell('시간', styles.headerStyle)];
      
      for (let dateIndex = 0; dateIndex < tableDates.length; dateIndex++) {
        headerRow2.push(styledCell('OM : 김선록', styles.defaultStyle));
        headerRow2.push(styledCell('OM : 박근태', styles.defaultStyle));
        headerRow2.push(styledCell('OM : 김현종', styles.defaultStyle));
      }
      
      // Add an empty column if there's only one date
      if (tableDates.length === 1) {
        headerRow2.push(styledCell('시간', styles.headerStyle));
      }
      
      wsData.push(headerRow2);
      
      // Create time slots (as shown in the image)
      const timeSlots = [
        '07:00-07:30', '07:30-08:00', '08:00-08:30', '08:30-09:00',
        '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
        '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00',
        '13:00-13:30', '13:30-14:00', '14:00-14:30', '14:30-15:00',
        '15:00-15:30', '15:30-16:00', '16:00-16:30', '16:30-17:00',
        '17:00-17:30', '17:30-18:00', '18:00-18:30', '18:30-19:00',
        '19:00-19:30', '19:30-20:00', '20:00-20:30', '20:30-21:00',
        '21:00-21:30', '21:30-22:00', '22:00-22:30', '22:30-23:00',
        '23:00-23:30', '23:30-24:00'
      ];
      
      // Mock data for the programs (in a real implementation, this would come from the scheduleData)
      const mockPrograms = {
        '08:00-08:30': {
          program: '조식',
          facilities: [0, 1, 2]
        },
        '09:00-09:30': {
          program: '설문 및 마무리',
          facilities: [0]
        },
        '10:30-11:00': {
          program: '아로마테라피정',
          facilities: [0]
        },
        '15:30-16:00': {
          program: '도심형힐링 (컨디션스톤 - OM)',
          facilities: [0]
        },
        '19:30-20:00': {
          program: '자세교정그룹 (컨디션스톤 - 지혜)',
          facilities: [0, 2]
        },
        '22:30-23:00': {
          program: '취침',
          facilities: [0, 1, 2]
        }
      };
      
      // Create rows for each time slot
      for (let i = 0; i < timeSlots.length; i++) {
        const timeSlot = timeSlots[i];
        const row = [styledCell(timeSlot, styles.timeSlotStyle)];
        
        // For each date in this table
        for (let dateIndex = 0; dateIndex < tableDates.length; dateIndex++) {
          // For each facility (3 facilities per date)
          for (let facilityIndex = 0; facilityIndex < 3; facilityIndex++) {
            // Check if there's a program for this time slot
            if (mockPrograms[timeSlot] && mockPrograms[timeSlot].facilities.includes(facilityIndex)) {
              if (timeSlot === '08:00-08:30' || timeSlot === '12:00-12:30' || timeSlot === '18:00-18:30') {
                row.push(styledCell('조식', styles.breakTimeStyle));
              } else if (timeSlot === '22:30-23:00') {
                row.push(styledCell('취침', styles.sleepStyle));
              } else if (timeSlot === '09:00-09:30') {
                row.push(styledCell('설문 및 마무리', styles.programStyle));
              } else if (timeSlot === '10:30-11:00') {
                row.push(styledCell('아로마테라피정', styles.programStyle));
              } else if (timeSlot === '15:30-16:00') {
                row.push(styledCell('도심형힐링 (컨디션스톤 - OM)', styles.programStyle));
              } else if (timeSlot === '19:30-20:00') {
                row.push(styledCell('자세교정그룹 (컨디션스톤 - 지혜)', styles.programStyle));
              } else {
                row.push(styledCell('', styles.emptyStyle));
              }
            } else if (timeSlot === '09:30-10:00' || timeSlot === '13:30-14:00' || timeSlot === '17:30-18:00') {
              row.push(styledCell('자유시간', styles.defaultStyle));
            } else {
              // Empty cell
              row.push(styledCell('', styles.emptyStyle));
            }
          }
        }
        
        // Add an empty column if there's only one date
        if (tableDates.length === 1) {
          row.push(styledCell(timeSlot, styles.timeSlotStyle));
        }
        
        wsData.push(row);
      }
      
      // Add footer row
      const footerRow = [styledCell('관리자', styles.defaultStyle)];
      for (let dateIndex = 0; dateIndex < tableDates.length; dateIndex++) {
        for (let i = 0; i < 3; i++) {
          footerRow.push(styledCell('취침', styles.defaultStyle));
        }
      }
      if (tableDates.length === 1) {
        footerRow.push(styledCell('관리자', styles.defaultStyle));
      }
      wsData.push(footerRow);
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths
      const colWidth = 15;
      ws['!cols'] = [{ width: colWidth }];
      for (let i = 0; i < 6; i++) {
        ws['!cols'].push({ width: colWidth });
      }
      
      // Set row heights
      ws['!rows'] = [];
      for (let i = 0; i < wsData.length; i++) {
        ws['!rows'].push({ hpt: 20 }); // Height in points
      }
      
      // Add merges
      let merges = [];
      
      // Merge facility header cells
      for (let dateIndex = 0; dateIndex < tableDates.length; dateIndex++) {
        for (let facilityIndex = 0; facilityIndex < 3; facilityIndex++) {
          const colStart = 1 + dateIndex * 3 + facilityIndex;
          merges.push({
            s: { r: 1, c: colStart },
            e: { r: 1, c: colStart }
          });
        }
      }
      
      ws['!merges'] = merges;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `일정표 ${tableIndex + 1}`);
    }
    
    // Generate filename
    const filename = `주간일정표_${momentStartDate.format('YYYYMMDD')}_${momentEndDate.format('YYYYMMDD')}`;
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel:', error);
    return false;
  }
};

export default exportWeeklySchedule; 