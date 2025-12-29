import ExcelJS from 'exceljs';
import moment from 'moment';

/**
 * Translate business category to Korean
 * @param {string} category - Business category in English
 * @returns {string} - Business category in Korean
 */
const translateBusinessCategory = (category) => {
  const categoryMap = {
    'social_contribution': '사회공헌',
    'profit_business': '수익사업', 
    'preparation': '가예약',
    'default': '일반'
  };
  
  return categoryMap[category] || category;
};

/**
 * Export instructor payment data to Excel file
 * @param {Object} data - The instructor payment data
 * @param {Number} year - The year of the data
 * @param {Number} month - The month of the data
 * @param {Object} dateRange - Optional date range object with startDate and endDate
 * @returns {boolean} - Whether the export was successful
 */
export const exportInstructorPaymentExcel = (data, year, month, dateRange = null) => {
  try {
    if (!data || !data.getInstructorPayments) {
      console.error('Invalid instructor payment data');
      return false;
    }

    const payments = data.getInstructorPayments || [];
    
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('강사비지급내역');
    
    // Calculate total sums for the footer
    let totalPreTax = 0;
    let totalPostTax = 0;
    let totalAssistantFee = 0;
    let totalHelperFee = 0;
    let totalSessions = 0;
    
    payments.forEach(item => {
      totalPreTax += item.payment_amount || 0;
      totalPostTax += (item.payment_amount - item.tax_amount) || 0;
      totalAssistantFee += item.assistant_instructor_fee || 0;
      totalHelperFee += item.healing_helper_fee || 0;
      totalSessions += item.sessions || 0;
    });
    
    const totalFinalWithHelpers = totalPostTax + totalAssistantFee + totalHelperFee;
    
    // Format title with correct year, month, or date range
    let title = '';
    let applicationPeriod = '';
    
    if (dateRange) {
      // 기간별 검색 제목
      const startDateObj = moment(dateRange.startDate);
      const endDateObj = moment(dateRange.endDate);
      title = `${startDateObj.format('YYYY년 MM월 DD일')} ~ ${endDateObj.format('YYYY년 MM월 DD일')} 강사비&헬퍼활동비 지급 요청(3회차)`;
      applicationPeriod = `적용기간: ${startDateObj.format('YYYY년 MM월 DD일')} ~ ${endDateObj.format('YYYY년 MM월 DD일')}`;
    } else {
      // 월별 검색 제목
      title = `${year}년 ${month}월 강사비&헬퍼활동비 지급 요청(3회차)`;
      applicationPeriod = `적용기간: ${year}년 ${month}월 1일 ~ ${moment(new Date(year, month, 0)).format('YYYY년 MM월 DD일')}`;
    }
    
    // Set column widths
    worksheet.columns = [
      { key: 'category', width: 8 },      // 구분
      { key: 'instructor', width: 12 },   // 강사
      { key: 'type', width: 12 },         // 강사구분
      { key: 'organization', width: 25 }, // 단체
      { key: 'business', width: 12 },     // 사업구분
      { key: 'program', width: 25 },      // 프로그램명
      { key: 'date', width: 12 },         // 일자
      { key: 'time', width: 12 },         // 시간
      { key: 'preTax', width: 15 },       // 강사비(세전)
      { key: 'postTax', width: 15 },      // 강사비(세후)
      { key: 'assistant', width: 12 },    // 보조강사
      { key: 'assistantFee', width: 15 }, // 보조강사 활동비
      { key: 'helper', width: 12 },       // 힐링헬퍼
      { key: 'helperFee', width: 15 },    // 힐링헬퍼 활동비
      { key: 'total', width: 15 }         // 지급액
    ];
    
    // Title row (row 1)
    worksheet.mergeCells('A1:O1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Application period row (row 2)
    worksheet.mergeCells('A2:N2');
    const periodCell = worksheet.getCell('A2');
    periodCell.value = applicationPeriod;
    periodCell.font = { bold: true, size: 11 };
    periodCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Payment date (row 2, column O)
    const paymentDateCell = worksheet.getCell('O2');
    paymentDateCell.value = `지급일 : ${moment().format('YYYY년 MM월 DD일')}`;
    paymentDateCell.font = { size: 11 };
    paymentDateCell.alignment = { horizontal: 'right', vertical: 'middle' };
    
    // Empty row (row 3)
    worksheet.addRow([]);
    
    // Header row (row 4) - Blue background with white text
    const headerRow = worksheet.addRow([
      '구분', '강사', '강사구분', '단체', '사업구분', 
      '프로그램명', '일자', '시간', 
      '강사비(세전)', '강사비(세후)', '보조강사', '보조강사 활동비', 
      '힐링헬퍼', '힐링헬퍼 활동비', '지급액'
    ]);
    
    // Style header row
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Blue background
      };
      cell.font = { 
        bold: true, 
        size: 11, 
        color: { argb: 'FFFFFFFF' } // White text
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Add data rows
    payments.forEach(item => {
      const dataRow = worksheet.addRow([
        item.instructor_category || '강사',
        item.instructor_name || '',
        item.instructor_type || '지역강사',
        item.organization || '',
        translateBusinessCategory(item.business_category || 'default'),
        item.program_name || '',
        `${item.day}일(${item.weekday})`,
        item.time || '',
        item.payment_amount || 0,
        (item.payment_amount - item.tax_amount) || 0,
        item.assistant_instructor_name || '',
        item.assistant_instructor_fee || 0,
        item.healing_helper_name || '',
        item.healing_helper_fee || 0,
        (item.final_amount || 0) + (item.assistant_instructor_fee || 0) + (item.healing_helper_fee || 0)
      ]);
      
      // Style data row - Center alignment and borders
      dataRow.eachCell((cell, colNumber) => {
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.font = { size: 10 };
        
        // Format number columns with commas
        if (colNumber >= 9 && colNumber <= 15 && colNumber !== 11 && colNumber !== 13) {
          if (cell.value && typeof cell.value === 'number') {
            cell.numFmt = '#,##0';
          }
        }
      });
    });
    
    // Add empty rows to ensure minimum table size
    const targetRows = Math.max(15, payments.length);
    const currentDataRows = payments.length;
    
    for (let i = currentDataRows; i < targetRows; i++) {
      const emptyRow = worksheet.addRow([
        '', '', '', '', '', '', '', '', 
        '', '', '', '', '', '', ''
      ]);
      
      // Style empty rows
      emptyRow.eachCell((cell) => {
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
    
    // Add totals row - Green background
    const totalRow = worksheet.addRow([
      '합계', '', '', '', '', '', '', totalSessions,
      totalPreTax, totalPostTax, '', totalAssistantFee, 
      '', totalHelperFee, totalFinalWithHelpers
    ]);
    
    // Style total row
    totalRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC6E0B4' } // Green background
      };
      cell.font = { 
        bold: true, 
        size: 11, 
        color: { argb: 'FF000000' } // Black text
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Format number columns in footer with commas
      if (colNumber >= 9 && colNumber <= 15 && colNumber !== 11 && colNumber !== 13) {
        if (cell.value && typeof cell.value === 'number') {
          cell.numFmt = '#,##0';
        }
      }
    });
    
    // Generate Excel file and trigger download
    const fileName = dateRange 
      ? `강사비지급내역_${moment(dateRange.startDate).format('YYYYMMDD')}_${moment(dateRange.endDate).format('YYYYMMDD')}.xlsx`
      : `강사비지급내역_${year}${month.toString().padStart(2, '0')}.xlsx`;
    
    // Write to buffer and download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });
    
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
}; 