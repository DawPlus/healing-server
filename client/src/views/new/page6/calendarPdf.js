import { jsPDF } from 'jspdf';
import moment from 'moment';
import 'moment/locale/ko';
import html2canvas from 'html2canvas';

// Add Korean font support
const addKoreanFont = (pdf) => {
  // Using default font that supports Korean characters better
  pdf.setFont('helvetica');
};

/**
 * Export calendar schedule as PDF for Page6
 * @param {Object} calendarData - The calendar data with events
 * @param {Moment} currentDate - Current month being displayed
 * @returns {boolean} - Whether the export was successful
 */
export const exportPage6CalendarPdf = (calendarData, currentDate) => {
  try {
    if (!calendarData || !currentDate) {
      console.error('Invalid calendar data');
      return false;
    }

    moment.locale('ko');
    
    // Get first day of month and calculate dates for rendering
    const firstDayOfMonth = moment(currentDate).startOf('month');
    const lastDayOfMonth = moment(currentDate).endOf('month');
    const startDate = moment(firstDayOfMonth).startOf('week');
    const endDate = moment(lastDayOfMonth).endOf('week');
    
    // Prepare data for calendar - handle both array and object formats
    let events = [];
    let list = [];
    
    if (Array.isArray(calendarData)) {
      list = calendarData;
    } else if (calendarData.events || calendarData.list) {
      events = calendarData.events || [];
      list = calendarData.list || [];
    } else {
      // If calendarData is a direct list of reservations
      list = [calendarData];
    }
    
    // Map to store organization colors
    const organizationColors = new Map();
    
    // Event colors
    const EVENT_COLORS = [
      '#c8e6c9', // Light green - Confirmed
      '#ffecb3', // Light yellow - Pending
      '#bbdefb', // Light blue
      '#f8bbd0', // Light pink
      '#d7ccc8', // Light brown
      '#b2dfdb', // Teal
      '#c5cae9', // Lavender
      '#ffe0b2', // Light orange
      '#cfcfcf'  // Light gray
    ];
    
    // Assign colors to organizations
    const assignOrganizationColors = () => {
      // Get all unique organizations
      const organizations = new Set();
      
      // Add from events data
      events.forEach(event => {
        const orgName = event.organization || event.title || event.group_name;
        if (orgName) organizations.add(orgName);
      });
      
      // Add from list data
      list.forEach(item => {
        const orgName = item.group_name || item.organization;
        if (orgName) organizations.add(orgName);
      });
      
      // Assign colors to organizations
      let colorIndex = 2; // Start from 2 to reserve 0 and 1 for confirmed and pending status
      organizations.forEach(org => {
        if (!organizationColors.has(org)) {
          organizationColors.set(org, EVENT_COLORS[colorIndex % EVENT_COLORS.length]);
          colorIndex++;
        }
      });
    };
    
    // Call the function to assign colors
    assignOrganizationColors();
    
    // Pre-process all events for the entire month to assign layers
    const processAllEvents = () => {
      // Combine both event sources
      const combinedEvents = [...events];
      
      // Add entries from list data
      list.forEach(item => {
        if (item.start_date) {
          combinedEvents.push({
            id: `list-${item.id}`,
            title: item.group_name || '단체명 없음',
            organization: item.group_name || '단체명 없음',
            start: item.start_date,
            end: item.end_date || item.start_date,
            status: item.reservation_status || '대기중',
            multiDay: item.start_date !== item.end_date && item.end_date,
            total_count: item.total_count,
            room_count: item.room_count
          });
        }
      });
      
      // Process each event to determine its date range and organization
      const processedEvents = combinedEvents.map(event => {
        const startMoment = moment(event.start);
        const endMoment = event.end ? moment(event.end) : startMoment.clone();
        const orgName = event.organization || event.title || event.group_name;
        
        return {
          ...event,
          startMoment,
          endMoment,
          orgName,
          dateRange: []
        };
      });
      
      // Generate date range for each event
      processedEvents.forEach(event => {
        let current = event.startMoment.clone();
        while (current.isSameOrBefore(event.endMoment, 'day')) {
          event.dateRange.push(current.format('YYYY-MM-DD'));
          current.add(1, 'day');
        }
      });
      
      return processedEvents;
    };
    
    // Assign layers to events to avoid conflicts and maintain consistency
    const assignEventLayers = (allEvents) => {
      const eventLayers = new Map(); // eventId -> layer
      const dayLayers = new Map(); // date -> [events in each layer]
      
      // Sort events by start date and organization for consistent ordering
      const sortedEvents = [...allEvents].sort((a, b) => {
        const startCompare = a.startMoment.unix() - b.startMoment.unix();
        if (startCompare !== 0) return startCompare;
        return (a.orgName || '').localeCompare(b.orgName || '');
      });
      
      sortedEvents.forEach(event => {
        // Find the first available layer for this event across all its dates
        let assignedLayer = 0;
        let layerFound = false;
        
        while (!layerFound) {
          let canUseLayer = true;
          
          // Check if this layer is available for all dates of this event
          for (const dateStr of event.dateRange) {
            if (!dayLayers.has(dateStr)) {
              dayLayers.set(dateStr, []);
            }
            
            const dayLayerEvents = dayLayers.get(dateStr);
            if (dayLayerEvents[assignedLayer]) {
              // Layer is occupied, try next layer
              canUseLayer = false;
              break;
            }
          }
          
          if (canUseLayer) {
            // Assign this layer to the event
            eventLayers.set(event.id, assignedLayer);
            
            // Mark this layer as occupied for all dates of this event
            event.dateRange.forEach(dateStr => {
              const dayLayerEvents = dayLayers.get(dateStr);
              dayLayerEvents[assignedLayer] = event;
            });
            
            layerFound = true;
          } else {
            assignedLayer++;
          }
        }
      });
      
      return { eventLayers, dayLayers };
    };
    
    // Process all events and assign layers
    const allEvents = processAllEvents();
    const { eventLayers, dayLayers } = assignEventLayers(allEvents);
    
    // Process and organize events for a specific day
    const processEvents = (day) => {
      try {
        // Format day as string for comparison
        const dateStr = moment(day).format('YYYY-MM-DD');
        
        // Get events for this day from the pre-processed layer data
        const dayLayerEvents = dayLayers.get(dateStr) || [];
        
        // Convert layer array to regular array, filtering out empty slots
        const dayEvents = [];
        dayLayerEvents.forEach((event, layer) => {
          if (event) {
            dayEvents.push({
              ...event,
              layer: layer // Add layer information
            });
          }
        });
        
        // Remove duplicates by organization name (keep first occurrence)
        const uniqueOrgNames = new Set();
        const filteredEvents = dayEvents.filter(event => {
          const orgName = event.organization || event.title || event.group_name;
          
          if (uniqueOrgNames.has(orgName)) {
            return false;
          }
          
          uniqueOrgNames.add(orgName);
          return true;
        });
        
        // Sort by layer to maintain consistent positioning
        return filteredEvents.sort((a, b) => (a.layer || 0) - (b.layer || 0));
      } catch (error) {
        console.error('Event processing error:', error);
        return [];
      }
    };
    
    // Days of week in Korean
    const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
    
    // Create temporary container for PDF content with proper width
    const container = document.createElement('div');
    container.style.width = '1400px'; // Increased width to prevent horizontal overflow
    container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Build HTML calendar content with improved layout
    container.innerHTML = `
      <div style="padding: 30px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <div style="display: flex; align-items: baseline;">
            <span style="font-size: 32px; color: #444; margin-right: 15px; font-weight: bold;">2024</span>
            <span style="font-size: 72px; color: #007bff; margin: 0; font-weight: bold;">${currentDate.format('M')}</span>
          </div>
          <div style="text-align: right; font-size: 16px; color: #666;">
            최종 수정일 : ${moment().format('M')}월 ${moment().format('D')}일
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #333; table-layout: fixed;">
          <thead>
            <tr>
              ${DAYS_OF_WEEK.map((day, index) => `
                <th style="width: 14.28%; padding: 12px 8px; border: 1px solid #333; text-align: center; 
                  background-color: #f8f9fa; font-size: 16px; font-weight: bold;
                  color: ${index === 0 ? '#dc3545' : (index === 6 ? '#0066cc' : '#333')};">
                  ${day}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${generateCalendarRows(startDate, endDate, currentDate, processEvents, EVENT_COLORS, organizationColors)}
          </tbody>
        </table>
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
          width: 1400,
          height: container.scrollHeight,
          windowWidth: 1400,
          windowHeight: container.scrollHeight
        });
        
        // Create PDF with proper dimensions (landscape A4)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add Korean font support
        addKoreanFont(pdf);
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
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
        pdf.save(`하이힐링원_예약현황_${currentDate.format('YYYY_MM')}.pdf`);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        return false;
      }
    }, 1000); // Increased timeout for better rendering
    
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
};

// Helper function to generate calendar rows with improved styling
function generateCalendarRows(startDate, endDate, currentDate, processEvents, EVENT_COLORS, organizationColors) {
  let html = '';
  let day = startDate.clone();
  
  // Calculate the exact number of rows needed for this month
  const totalDays = endDate.diff(startDate, 'days') + 1;
  const rowsNeeded = Math.ceil(totalDays / 7);
  
  // Define a fixed height for each row to ensure proper spacing
  const rowHeight = 120; // Increased height for better content display
  
  for (let row = 0; row < rowsNeeded; row++) {
    html += `<tr style="height: ${rowHeight}px;">`;
    
    // Each week row
    for (let i = 0; i < 7; i++) {
      if (day.isAfter(endDate)) {
        // We've gone past the end date, add empty cell
        html += `<td style="width: 14.28%; border: 1px solid #333; background-color: #f5f5f5; vertical-align: top; padding: 8px;"></td>`;
        continue;
      }
      
      const isCurrentMonth = day.month() === currentDate.month();
      const isToday = day.isSame(moment(), 'day');
      const dayEvents = processEvents(day);
      
      // Set cell color based on day type
      let bgColor = isCurrentMonth ? 'white' : '#f8f8f8';
      let dayColor = i === 0 ? '#dc3545' : (i === 6 ? '#0066cc' : '#333');
      let dayStyle = 'font-weight: bold;';
      
      if (isToday) {
        bgColor = '#e3f2fd';
        dayStyle += ' border: 2px solid #2196f3;';
      }
      
      // Format events with better styling
      let eventHtml = '';
      dayEvents.forEach((event, index) => {
        if (index < 3) { // Show max 3 events per day for better readability
          // Determine event color based on status and organization
          let eventColor = organizationColors.get(event.organization || event.title || event.group_name) || EVENT_COLORS[2];
          
          // Override color based on status if needed
          if (event.status === '예약확인' || event.reservation_status === '예약확인' || event.status === 'confirmed') {
            eventColor = EVENT_COLORS[0]; // Green for confirmed
          } else if (event.status === '가예약' || event.status === '대기중' || 
                 event.reservation_status === '가예약' || event.reservation_status === '대기중' || 
                 event.status === 'preparation') {
            eventColor = EVENT_COLORS[1]; // Yellow for pending
          }
          
          // Format the organization name and additional info
          const organizationName = event.organization || event.title || event.group_name || '단체명 미지정';
          const groupInfo = event.total_count ? `(${event.total_count}명)` : '';
          const roomInfo = event.room_count ? `${event.room_count}실` : '';
          
          eventHtml += `
            <div style="background-color: ${eventColor}; margin: 3px 0; padding: 4px 6px; 
              border-radius: 4px; font-size: 11px; line-height: 1.2; overflow: hidden; 
              border: 1px solid rgba(0,0,0,0.1); word-wrap: break-word;">
              <div style="font-weight: bold; margin-bottom: 2px;">${organizationName}</div>
              ${groupInfo || roomInfo ? `<div style="font-size: 10px; opacity: 0.8;">${groupInfo} ${roomInfo}</div>` : ''}
            </div>
          `;
        }
      });
      
      // Add overflow indicator if there are more events
      if (dayEvents.length > 3) {
        eventHtml += `
          <div style="font-size: 10px; color: #666; margin-top: 4px; text-align: center; 
            background-color: rgba(0,0,0,0.05); padding: 2px; border-radius: 2px;">
            외 ${dayEvents.length - 3}건
          </div>
        `;
      }
      
      // Special day markers (e.g., New Year's)
      let specialDayMarker = '';
      if (day.month() === 0 && day.date() === 1) {
        specialDayMarker = '<span style="color: #dc3545; font-size: 10px; margin-left: 4px;">신정</span>';
      }
      
      // Create the day cell with better layout
      html += `
        <td style="width: 14.28%; border: 1px solid #333; vertical-align: top; 
          background-color: ${bgColor}; padding: 8px; position: relative; ${isToday ? dayStyle : ''}">
          <div style="color: ${dayColor}; font-weight: bold; margin-bottom: 8px; font-size: 16px; display: flex; align-items: center;">
            ${isCurrentMonth ? day.date() : `<span style="opacity: 0.4;">${day.date()}</span>`}
            ${day.date() === 1 ? `<span style="font-size: 11px; margin-left: 4px; color: #666;">${day.format('M')}월</span>` : ''}
            ${specialDayMarker}
          </div>
          <div style="min-height: 80px;">
            ${eventHtml}
          </div>
        </td>
      `;
      
      day.add(1, 'days');
    }
    
    html += '</tr>';
  }
  
  // If we have fewer than 5 rows, add empty rows to maintain consistent height
  while (rowsNeeded < 5) {
    html += `<tr style="height: ${rowHeight}px;"><td colspan="7" style="border: 1px solid #333; background-color: #f8f8f8;"></td></tr>`;
    rowsNeeded++;
  }
  
  return html;
} 