import ExcelJS from 'exceljs';
import moment from 'moment';

/**
 * Export usage report data to Excel with consistent column widths and improved readability
 * @param {Array} data - The usage report data
 * @param {Number} year - Report year
 * @param {Number} month - Report month
 * @param {String} startDate - Start date in YYYY-MM-DD format
 * @param {String} endDate - End date in YYYY-MM-DD format
 * @param {String} searchType - Type of search ('month', 'week', 'custom')
 * @returns {Boolean} - Success flag
 */
function exportUsageReport(data, year, month, startDate, endDate, searchType = 'month') {
  if (!data || !data.length) return false;

  try {
    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    
    // Set worksheet name based on search type
    let worksheetName = `${year}년 ${month}월 수익 실적`;
    if (searchType === 'week') {
      worksheetName = `${year}년 ${month}월 주간 수익 실적`;
    } else if (searchType === 'custom') {
      worksheetName = `맞춤 기간 수익 실적`;
    }
    
    const worksheet = workbook.addWorksheet(worksheetName);

    // Set default column width and row height for better readability
    worksheet.properties.defaultColWidth = 12;
    worksheet.properties.defaultRowHeight = 24;

    // Define columns with optimized widths
    worksheet.columns = [
      { header: '월', key: 'month', width: 6 },
      { header: '일', key: 'day', width: 6 },
      { header: '형태', key: 'type', width: 8 },
      { header: '대상', key: 'target', width: 8 },
      { header: '사업구분', key: 'business', width: 12 },
      { header: '단체명', key: 'organization', width: 30 },
      { header: '객실', key: 'room', width: 15 },
      { header: '식사', key: 'food', width: 15 },
      { header: '프로그램', key: 'program', width: 15 },
      { header: '체험비', key: 'facility', width: 15 },
      { header: 'VAT', key: 'vat', width: 15 },
      { header: '할인액', key: 'discount', width: 15 },
      { header: '계', key: 'total', width: 15 },
      { header: '결제방법', key: 'paymentMethod', width: 12 },
      { header: '결제번호', key: 'paymentCode', width: 12 },
      { header: '입금일자', key: 'receiptDate', width: 12 },
      { header: '비고', key: 'notes', width: 20 }
    ];

    // Add title row with appropriate naming based on search type
    worksheet.mergeCells('A1:Q1');
    const titleCell = worksheet.getCell('A1');
    if (searchType === 'month') {
      titleCell.value = `하이힐링원 ${year}년 ${month}월 수익 실적`;
    } else if (searchType === 'week') {
      titleCell.value = `하이힐링원 ${year}년 ${month}월 (${moment(startDate).format('MM.DD')}~${moment(endDate).format('MM.DD')}) 수익 실적`;
    } else if (searchType === 'custom') {
      titleCell.value = `하이힐링원 ${moment(startDate).format('YYYY.MM.DD')} ~ ${moment(endDate).format('YYYY.MM.DD')} 수익 실적`;
    }
    
    titleCell.font = {
      size: 16,
      bold: true
    };
    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: false
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D6E9F8' }
    };
    worksheet.getRow(1).height = 30;

    // Add date row at the right side
    worksheet.mergeCells('P2:Q2');
    const dateCell = worksheet.getCell('P2');
    dateCell.value = `${moment().format('YYYY. M. DD.')}`;
    dateCell.alignment = { horizontal: 'right' };
    dateCell.font = { size: 10 };

    // Explicitly set header values in row 3
    const headerRow = worksheet.getRow(3);
    headerRow.getCell(1).value = '월';
    headerRow.getCell(2).value = '일';
    headerRow.getCell(3).value = '형태';
    headerRow.getCell(4).value = '대상';
    headerRow.getCell(5).value = '사업구분';
    headerRow.getCell(6).value = '단체명';
    headerRow.getCell(7).value = '객실';
    headerRow.getCell(8).value = '식사';
    headerRow.getCell(9).value = '프로그램';
    headerRow.getCell(10).value = '체험비';
    headerRow.getCell(11).value = 'VAT';
    headerRow.getCell(12).value = '할인액';
    headerRow.getCell(13).value = '계';
    headerRow.getCell(14).value = '결제방법';
    headerRow.getCell(15).value = '결제번호';
    headerRow.getCell(16).value = '입금일자';
    headerRow.getCell(17).value = '비고';

    // Style the header row
    headerRow.font = {
      bold: true,
      size: 11
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: false
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F5F5F5' }
    };
    headerRow.height = 24;
    
    // Add border to header row
    headerRow.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'DDDDDD' } },
        left: { style: 'thin', color: { argb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
        right: { style: 'thin', color: { argb: 'DDDDDD' } }
      };
    });

    // Add data rows
    let rowIndex = 4;
    data.forEach((item) => {
      const row = worksheet.getRow(rowIndex);
      row.getCell('month').value = item.month;
      row.getCell('day').value = item.day;
      row.getCell('type').value = item.usage_type;
      row.getCell('target').value = item.customer_type;
      row.getCell('business').value = item.service_type;
      row.getCell('organization').value = item.organization;
      row.getCell('room').value = item.amount || 0;
      row.getCell('food').value = item.food_amount || 0;
      row.getCell('program').value = item.program_amount || 0;
      row.getCell('facility').value = item.facility_amount || 0;
      row.getCell('vat').value = item.vat || 0;
      row.getCell('discount').value = item.discount_amount || 0;
      row.getCell('total').value = item.total_amount || 0;
      row.getCell('paymentMethod').value = item.payment_method;
      row.getCell('paymentCode').value = item.payment_code;
      
      // Format receipt date to match the image format (MM-DD) with parentheses
      if (item.receipt_date) {
        const formattedDate = moment(item.receipt_date).format('MM-DD');
        row.getCell('receiptDate').value = `(${formattedDate})`;
      }
      
      row.getCell('notes').value = item.notes;

      // Set number format for amount cells
      ['room', 'food', 'program', 'facility', 'vat', 'discount', 'total'].forEach(key => {
        const cell = row.getCell(key);
        cell.numFmt = '#,##0';
        
        // Right align the numeric values
        cell.alignment = { horizontal: 'right' };
      });
      
      // Center align text cells
      ['month', 'day', 'type', 'target', 'business', 'paymentMethod', 'paymentCode', 'receiptDate'].forEach(key => {
        const cell = row.getCell(key);
        cell.alignment = { horizontal: 'center' };
      });

      // Set white background for all data cells
      row.eachCell({ includeEmpty: true }, cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }
        };
      });

      // Apply borders to all cells
      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'DDDDDD' } },
          left: { style: 'thin', color: { argb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
          right: { style: 'thin', color: { argb: 'DDDDDD' } }
        };
      });

      // Set row height for better readability
      row.height = 22;

      rowIndex++;
    });

    // Add a totals row
    const totalRow = worksheet.getRow(rowIndex);
    totalRow.getCell('organization').value = '합계';
    totalRow.getCell('organization').font = { bold: true };
    totalRow.getCell('organization').alignment = { horizontal: 'center' };

    // Calculate and set totals
    ['room', 'food', 'program', 'facility', 'vat', 'discount', 'total'].forEach(key => {
      const columnLetter = worksheet.getColumn(key).letter;
      totalRow.getCell(key).value = {
        formula: `SUM(${columnLetter}4:${columnLetter}${rowIndex - 1})`,
        date1904: false
      };
      totalRow.getCell(key).font = { bold: true };
      totalRow.getCell(key).numFmt = '#,##0';
      totalRow.getCell(key).alignment = { horizontal: 'right' };
    });

    // Apply background color and styling to total row
    totalRow.eachCell({ includeEmpty: true }, cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DCE6F2' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.font = {
        bold: true
      };
    });
    
    // Set height for total row
    totalRow.height = 24;

    // Create filename based on search type
    let fileName;
    if (searchType === 'month') {
      fileName = `${year}년_${month}월_수익실적_${moment().format('YYYY-MM-DD')}.xlsx`;
    } else if (searchType === 'week') {
      fileName = `${year}년_${month}월_주간수익실적_${moment(startDate).format('MMDD')}-${moment(endDate).format('MMDD')}_${moment().format('YYYY-MM-DD')}.xlsx`;
    } else {
      fileName = `맞춤기간_수익실적_${moment(startDate).format('YYYYMMDD')}-${moment(endDate).format('YYYYMMDD')}_${moment().format('YYYY-MM-DD')}.xlsx`;
    }
    
    // Write to a buffer first
    return workbook.xlsx.writeBuffer()
      .then(buffer => {
        // Create a blob from the buffer
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      });
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
}

export default exportUsageReport; 