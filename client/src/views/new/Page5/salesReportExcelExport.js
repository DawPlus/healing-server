import ExcelJS from 'exceljs';
import moment from 'moment';

/**
 * Export sales report data to Excel file with the exact design from the image
 * @param {Object} reservationsData - The reservations data
 * @param {Number} year - The year of the data
 * @param {Number} month - The month of the data
 * @returns {boolean} - Whether the export was successful
 */
export const exportSalesReportExcel = (reservationsData, year, month) => {
  try {
    if (!reservationsData || !reservationsData.getPage1List) {
      console.error('Invalid reservations data');
      return false;
    }

    const reservations = reservationsData.getPage1List || [];
    
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('매출실적');
    
    // Process reservations data to match the image format exactly
    const processedData = [];
    
    reservations.forEach(reservation => {
      // Filter reservations for the selected month
      const startDate = moment(reservation.start_date);
      const endDate = moment(reservation.end_date);
      const monthStart = moment(`${year}-${month.toString().padStart(2, '0')}-01`);
      const monthEnd = moment(monthStart).endOf('month');
      
      // Check if reservation falls within the selected month
      if (!moment.max(startDate, monthStart).isSameOrBefore(moment.min(endDate, monthEnd))) {
        return;
      }
      
      console.log(`Processing reservation: ${reservation.group_name}, ID: ${reservation.id}`);
      console.log('Page2 reservations:', reservation.page2_reservations);
      console.log('Page3 data:', reservation.page3);
      console.log('Page4 expenses:', reservation.page4_expenses);
      
      const orgName = reservation.group_name || reservation.organization_name || '단체명 없음';
      const contactName = reservation.contact_name || reservation.customer_name || '';
      
      // 기본 정보 설정
      const baseInfo = {
        월: month + '월',
        일: startDate.format('DD') + '일',
        일자: startDate.format('YYYY-MM-DD'),
        대상: getCustomerType(reservation),
        사업구분: getBusinessCategory(reservation.business_category),
        단체구분: getOrganizationType(reservation),
        단체명: orgName
      };
      
      // 각 서비스별로 별도 행 생성
      let hasData = false;
      
      // 1. 숙박 데이터 처리 (page3의 room_selections 사용)
      if (reservation.page3 && reservation.page3.room_selections) {
        let roomSelections = reservation.page3.room_selections;
        
        // Handle JSON parsing if needed
        if (typeof roomSelections === 'string') {
          try {
            roomSelections = JSON.parse(roomSelections);
          } catch (e) {
            console.warn('Failed to parse room_selections JSON:', e);
            roomSelections = [];
          }
        }
        
        if (Array.isArray(roomSelections) && roomSelections.length > 0) {
          // 객실 데이터 그룹화 (같은 일자, 같은 객실종류별로)
          const groupedRooms = {};
          
          roomSelections.forEach(room => {
            if (!room) return;
            
            const roomDate = moment(room.check_in_date).format('MM월 DD일');
            const roomType = room.room_type || room.room_name || '일반실';
            const key = `${roomDate}_${roomType}`;
            
            if (!groupedRooms[key]) {
              groupedRooms[key] = {
                date: roomDate,
                roomType,
                rooms: [],
                totalQuantity: 0,
                totalOccupancy: 0,
                totalAmount: 0
              };
            }
            
            groupedRooms[key].rooms.push(room);
            groupedRooms[key].totalQuantity += 1;
            groupedRooms[key].totalOccupancy += (room.occupancy || 1);
            
            // 객실 금액 계산
            const basePrice = room.price || 0;
            const nights = room.nights || 1;
            const occupancy = room.occupancy || 1;
            const capacity = room.capacity || 1;
            
            let roomAmount = 0;
            if (room.total_price && parseInt(room.total_price) > 0) {
              roomAmount = parseInt(room.total_price);
            } else {
              roomAmount = basePrice * nights;
              // 초과 인원 요금 계산
              if (occupancy > capacity) {
                const extraPeople = occupancy - capacity;
                const extraCharge = extraPeople * 10000 * nights;
                roomAmount += extraCharge;
              }
            }
            
            groupedRooms[key].totalAmount += roomAmount;
          });
          
          // 그룹화된 객실 데이터로 행 생성
          Object.values(groupedRooms).forEach(group => {
            const vat = Math.floor(group.totalAmount * 0.1);
            const totalWithVat = group.totalAmount + vat;
            
            processedData.push({
              ...baseInfo,
              객실: group.totalAmount,
              식사: 0,
              프로그램: 0,
              재료비: 0,
              '기타(대관 등)': 0,
              물품구매: 0,
              VAT: vat,
              합계액: totalWithVat,
              개: group.totalOccupancy
            });
            hasData = true;
          });
        }
      }
      
      // 2. 식사 데이터 처리 (page3의 meal_plans 사용)
      if (reservation.page3 && reservation.page3.meal_plans) {
        let mealPlans = reservation.page3.meal_plans;
        
        // Handle JSON parsing if needed
        if (typeof mealPlans === 'string') {
          try {
            mealPlans = JSON.parse(mealPlans);
          } catch (e) {
            console.warn('Failed to parse meal_plans JSON:', e);
            mealPlans = [];
          }
        }
        
        if (Array.isArray(mealPlans) && mealPlans.length > 0) {
          // 식사 타입별로 그룹화
          const groupedMeals = {};
          
          mealPlans.forEach(meal => {
            if (!meal || !meal.price || meal.price <= 0) return;
            
            const mealType = meal.meal_type || '기타';
            const mealDate = meal.date ? moment(meal.date).format('MM월 DD일') : startDate.format('MM월 DD일');
            const key = `${mealDate}_${mealType}`;
            
            if (!groupedMeals[key]) {
              groupedMeals[key] = {
                date: mealDate,
                type: mealType,
                meals: [],
                totalAmount: 0,
                totalParticipants: 0
              };
            }
            
            groupedMeals[key].meals.push(meal);
            groupedMeals[key].totalAmount += meal.price;
            groupedMeals[key].totalParticipants += (meal.participants || 0);
          });
          
          // 그룹화된 식사 데이터로 행 생성
          Object.values(groupedMeals).forEach(group => {
            const vat = Math.floor(group.totalAmount * 0.1);
            const totalWithVat = group.totalAmount + vat;
            
            processedData.push({
              ...baseInfo,
              객실: 0,
              식사: group.totalAmount,
              프로그램: 0,
              재료비: 0,
              '기타(대관 등)': 0,
              물품구매: 0,
              VAT: vat,
              합계액: totalWithVat,
              개: group.totalParticipants
            });
            hasData = true;
          });
        }
      }
      
      // 3. 프로그램 데이터 처리 (page2_reservations의 programs 사용)
      if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
        console.log('Processing programs from page2_reservations...');
        reservation.page2_reservations.forEach(page2 => {
          console.log('Page2 programs:', page2.programs);
          if (page2.programs && page2.programs.length > 0) {
            page2.programs.forEach(program => {
              console.log('Processing program:', program.program_name, 'Price:', program.price);
              if (!program || !program.price || program.price <= 0) return;
              
              const vat = Math.floor(program.price * 0.1);
              const totalWithVat = program.price + vat;
              
              processedData.push({
                ...baseInfo,
                객실: 0,
                식사: 0,
                프로그램: program.price,
                재료비: 0,
                '기타(대관 등)': 0,
                물품구매: 0,
                VAT: vat,
                합계액: totalWithVat,
                개: program.participants || page2.total_count || 0
              });
              hasData = true;
              console.log('Added program data to Excel');
            });
          }
        });
      }
      
      // 4. 대관 데이터 처리 (page3의 place_reservations 사용)
      if (reservation.page3 && reservation.page3.place_reservations) {
        console.log('Processing place reservations from page3...');
        let placeReservations = reservation.page3.place_reservations;
        
        // Handle JSON parsing if needed
        if (typeof placeReservations === 'string') {
          try {
            placeReservations = JSON.parse(placeReservations);
          } catch (e) {
            console.warn('Failed to parse place_reservations JSON:', e);
            placeReservations = [];
          }
        }
        
        console.log('Place reservations:', placeReservations);
        if (Array.isArray(placeReservations) && placeReservations.length > 0) {
          placeReservations.forEach(place => {
            console.log('Processing place:', place.place_name, 'Price:', place.price);
            if (!place || !place.price || place.price <= 0) return;
            
            const vat = Math.floor(place.price * 0.1);
            const totalWithVat = place.price + vat;
            
            processedData.push({
              ...baseInfo,
              객실: 0,
              식사: 0,
              프로그램: 0,
              재료비: 0,
              '기타(대관 등)': place.price,
              물품구매: 0,
              VAT: vat,
              합계액: totalWithVat,
              개: place.participants || 0
            });
            hasData = true;
            console.log('Added place reservation data to Excel');
          });
        }
      }
      
      // 5. page4_expenses 데이터 처리 (재료비 및 기타 비용)
      if (reservation.page4_expenses && reservation.page4_expenses.length > 0) {
        console.log('Processing page4_expenses...');
        reservation.page4_expenses.forEach(page4 => {
          console.log('Page4 data:', page4);
          // 재료비 처리
          if (page4.materials && page4.materials.length > 0) {
            console.log('Processing materials:', page4.materials);
            page4.materials.forEach(material => {
              console.log('Processing material:', material.name, 'Total:', material.total);
              if (!material || !material.total || material.total <= 0) return;
              
              const materialAmount = material.total;
              const vat = Math.floor(materialAmount * 0.1);
              const totalWithVat = materialAmount + vat;
              
              processedData.push({
                ...baseInfo,
                객실: 0,
                식사: 0,
                프로그램: 0,
                재료비: materialAmount,
                '기타(대관 등)': 0,
                물품구매: 0,
                VAT: vat,
                합계액: totalWithVat,
                개: parseInt(material.quantity) || 0
              });
              hasData = true;
              console.log('Added material data to Excel');
            });
          }
          
          // 기타 비용 처리 (expenses)
          if (page4.expenses && page4.expenses.length > 0) {
            console.log('Processing expenses:', page4.expenses);
            page4.expenses.forEach(expense => {
              console.log('Processing expense:', expense.name, 'Amount:', expense.actual_amount);
              if (!expense || !expense.actual_amount || expense.actual_amount <= 0) return;
              
              const expenseAmount = expense.actual_amount;
              const vat = Math.floor(expenseAmount * 0.1);
              const totalWithVat = expenseAmount + vat;
              
              // 비용 유형에 따라 분류
              let categoryField = '물품구매';
              if (expense.expense_type === 'material' || (expense.name && expense.name.includes('재료'))) {
                categoryField = '재료비';
              } else if (expense.expense_type === 'rental' || (expense.name && (expense.name.includes('대관') || expense.name.includes('장소')))) {
                categoryField = '기타(대관 등)';
              } else {
                categoryField = '물품구매';
              }
              
              const rowData = {
                ...baseInfo,
                객실: 0,
                식사: 0,
                프로그램: 0,
                재료비: 0,
                '기타(대관 등)': 0,
                물품구매: 0,
                VAT: vat,
                합계액: totalWithVat,
                개: parseInt(expense.quantity) || 0
              };
              
              rowData[categoryField] = expenseAmount;
              
              processedData.push(rowData);
              hasData = true;
              console.log(`Added expense data to Excel in category: ${categoryField}`);
            });
          }
        });
      }
      
      // 데이터가 없는 경우 빈 행 추가
      if (!hasData) {
        processedData.push({
          ...baseInfo,
          객실: 0,
          식사: 0,
          프로그램: 0,
          재료비: 0,
          '기타(대관 등)': 0,
          물품구매: 0,
          VAT: 0,
          합계액: 0,
          개: 0
        });
      }
    });
    
    // 데이터를 날짜순으로 정렬
    processedData.sort((a, b) => moment(a.일자).diff(moment(b.일자)));
    
    // Set column widths to match the original format
    worksheet.columns = [
      { key: 'month', width: 6 },        // 월
      { key: 'day', width: 6 },          // 일  
      { key: 'date', width: 12 },        // 일자
      { key: 'target', width: 8 },       // 대상
      { key: 'business', width: 10 },    // 사업구분
      { key: 'group_type', width: 10 },  // 단체구분
      { key: 'group_name', width: 20 },  // 단체명
      { key: 'vegetarian', width: 10 },  // 객실
      { key: 'meal', width: 10 },        // 식사
      { key: 'program', width: 10 },     // 프로그램
      { key: 'material', width: 10 },    // 재료비
      { key: 'etc', width: 12 },         // 기타(대관 등)
      { key: 'purchase', width: 10 },    // 물품구매
      { key: 'vat', width: 10 },         // VAT
      { key: 'total', width: 12 },       // 합계액
      { key: 'count', width: 6 }         // 개
    ];
    
    // Header row with the exact columns from the image
    const headerRow = worksheet.addRow([
      '월',
      '일', 
      '일자',
      '대상',
      '사업구분',
      '단체구분',
      '단체명',
      '객실',
      '식사',
      '프로그램',
      '재료비',
      '기타(대관 등)',
      '물품구매',
      'VAT',
      '합계액',
      '개'
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
        size: 10, 
        color: { argb: 'FFFFFFFF' }, // White text
        name: '맑은 고딕'
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
    processedData.forEach(item => {
      const dataRow = worksheet.addRow([
        item.월,
        item.일,
        item.일자,
        item.대상,
        item.사업구분,
        item.단체구분,
        item.단체명,
        item.객실,
        item.식사,
        item.프로그램,
        item.재료비,
        item['기타(대관 등)'],
        item.물품구매,
        item.VAT,
        item.합계액,
        item.개
      ]);
      
      // Style data row
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.font = { size: 9, name: '맑은 고딕' };
        
        // Right align for numeric columns (객실, 식사, 프로그램, 재료비, 기타, 물품구매, VAT, 합계액, 개)
        if (colNumber >= 8 && colNumber <= 16) {
          cell.alignment = { 
            horizontal: 'right', 
            vertical: 'middle' 
          };
          // Format numbers with comma separator
          if (cell.value && typeof cell.value === 'number' && cell.value > 0) {
            cell.numFmt = '#,##0';
          }
        } else {
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
        }
      });
    });
    
    // Add summary row if needed
    if (processedData.length > 0) {
      const summaryRow = worksheet.addRow([
        '', '', '', '', '', '', '합계',
        processedData.reduce((sum, item) => sum + (item.객실 || 0), 0),
        processedData.reduce((sum, item) => sum + (item.식사 || 0), 0),
        processedData.reduce((sum, item) => sum + (item.프로그램 || 0), 0),
        processedData.reduce((sum, item) => sum + (item.재료비 || 0), 0),
        processedData.reduce((sum, item) => sum + (item['기타(대관 등)'] || 0), 0),
        processedData.reduce((sum, item) => sum + (item.물품구매 || 0), 0),
        processedData.reduce((sum, item) => sum + (item.VAT || 0), 0),
        processedData.reduce((sum, item) => sum + (item.합계액 || 0), 0),
        processedData.reduce((sum, item) => sum + (item.개 || 0), 0)
      ]);
      
      // Style summary row
      summaryRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thick' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.font = { bold: true, size: 9, name: '맑은 고딕' };
        
        if (colNumber >= 8 && colNumber <= 16) {
          cell.alignment = { 
            horizontal: 'right', 
            vertical: 'middle' 
          };
          if (cell.value && typeof cell.value === 'number' && cell.value > 0) {
            cell.numFmt = '#,##0';
          }
        } else {
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle' 
          };
        }
        
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE7F3FF' } // Light blue background
        };
      });
    }
    
    // Generate Excel file and trigger download
    const fileName = `매출실적_${year}년_${month.toString().padStart(2, '0')}월.xlsx`;
    
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

// Helper functions
function getCustomerType(reservation) {
  // 대상 구분 로직
  if (reservation.business_category === 'social_contribution') {
    return '사회공헌';
  } else if (reservation.business_category === 'profit_business') {
    return '수익사업';
  } else {
    return '일반';
  }
}

function getBusinessCategory(business_category) {
  // 사업구분 로직
  switch (business_category) {
    case 'social_contribution':
      return '사회공헌';
    case 'profit_business':
      return '수익사업';
    default:
      return '기타';
  }
}

function getOrganizationType(reservation) {
  // 단체구분 로직 (데이터에 따라 조정 필요)
  if (reservation.total_count > 50) {
    return '대규모';
  } else if (reservation.total_count > 20) {
    return '중규모';
  } else {
    return '소규모';
  }
}

function isVegetarian(name) {
  // 객실 여부 판단 로직
  if (!name || typeof name !== 'string') {
    return false;
  }
  const vegetarianKeywords = ['객실', '비건', '베지', 'vegetarian', 'vegan'];
  return vegetarianKeywords.some(keyword => 
    name.toLowerCase().includes(keyword)
  );
} 