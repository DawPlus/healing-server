import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Divider,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Avatar,
  FormControlLabel,
  Switch
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/ko';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GetAppIcon from '@mui/icons-material/GetApp';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import RefreshIcon from '@mui/icons-material/Refresh';
import html2canvas from 'html2canvas';

import Page6Layout from './components/Page6Layout';
import { GET_PAGE6_RESERVATION_LIST, GET_PAGE6_RESERVATION_DETAIL, GET_PAGE6_SCHEDULE_DATA } from './graphql/queries';
import { formatDate, formatTime, generateDateRange, showAlert, generateTimeSlots, calculateDay } from './services/dataService';
import { exportProgramSchedulePdf } from '../Page5/inspection/programSchedulePdf';
import { exportPage6CalendarPdf } from './calendarPdf';

// Korean day of week labels
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// Background colors for different program types
const PROGRAM_COLORS = [
  '#c8e6c9', // Light green
  '#ffecb3', // Light yellow
  '#bbdefb', // Light blue
  '#f8bbd0', // Light pink
  '#d7ccc8'  // Light brown
];

// Weekly Schedule PDF Export Function with improved Korean font support using HTML-to-canvas
const exportWeeklySchedulePdf = (scheduleData, startDate, endDate, selectedReservation, showAllOrganizations) => {
  try {
    moment.locale('ko');
    
    // Generate date range for the week
    const weekDates = [];
    let currentDate = moment(startDate);
    while (currentDate.isSameOrBefore(moment(endDate))) {
      weekDates.push(currentDate.clone());
      currentDate.add(1, 'day');
    }
    
    // Prepare table data
    const timeSlots = generateTimeSlots('09:00', '18:00', 60); // Generate hourly slots from 9AM to 6PM
    
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.fontFamily = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Build HTML content with improved styling
    const title = showAllOrganizations 
      ? `주간 일정표 (${moment(startDate).format('YYYY년 MM월 DD일')} ~ ${moment(endDate).format('MM월 DD일')})`
      : `${selectedReservation?.group_name || '단체'} 주간 일정표 (${moment(startDate).format('YYYY년 MM월 DD일')} ~ ${moment(endDate).format('MM월 DD일')})`;
    
    // Generate table headers
    const headerCells = weekDates.map(date => 
      `<th style="width: ${85 / weekDates.length}%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
        text-align: center; font-weight: bold; font-size: 12px;">
        ${date.format('MM/DD')}<br/>(${DAYS_OF_WEEK[date.day()]})
      </th>`
    ).join('');
    
    // Generate table rows
    const tableRows = timeSlots.map(timeSlot => {
      const cells = weekDates.map(date => {
        const dateStr = date.format('YYYY-MM-DD');
        let cellContent = '';
        
        // Find programs for this date and time
        const daySchedule = scheduleData.find(day => day.date === dateStr);
        if (daySchedule && daySchedule.programs) {
          // Filter programs by organization if not showing all - 화면과 동일한 로직
          const filteredPrograms = showAllOrganizations
            ? daySchedule.programs
            : daySchedule.programs.filter(program => program.organization === selectedReservation?.group_name);
            
          const programsAtTime = filteredPrograms.filter(program => {
            const programStart = moment(program.start_time, 'HH:mm');
            const programEnd = moment(program.end_time, 'HH:mm');
            const slotTime = moment(timeSlot, 'HH:mm');
            
            return slotTime.isSameOrAfter(programStart) && slotTime.isBefore(programEnd);
          });
          
          if (programsAtTime.length > 0) {
            cellContent = programsAtTime.map(program => 
              `<div style="margin-bottom: 4px; padding: 3px; background-color: #e3f2fd; border-radius: 3px; font-size: 10px;">
                <div style="font-weight: bold;">${program.organization || ''}</div>
                <div>${program.program_name || ''}</div>
                <div style="color: #666;">${program.location || ''}</div>
              </div>`
            ).join('');
          }
        }
        
        // Find place reservations for this date and time
        if (daySchedule && daySchedule.places) {
          // Filter places by organization if not showing all - 화면과 동일한 로직
          const filteredPlaces = showAllOrganizations
            ? daySchedule.places
            : daySchedule.places.filter(place => place.organization === selectedReservation?.group_name);
            
          const placesAtTime = filteredPlaces.filter(place => {
            const placeStart = moment(place.start_time, 'HH:mm');
            const placeEnd = moment(place.end_time, 'HH:mm');
            const slotTime = moment(timeSlot, 'HH:mm');
            
            return slotTime.isSameOrAfter(placeStart) && slotTime.isBefore(placeEnd);
          });
          
          if (placesAtTime.length > 0) {
            const placeContent = placesAtTime.map(place => 
              `<div style="margin-bottom: 4px; padding: 3px; background-color: #fff3e0; border-radius: 3px; font-size: 10px;">
                <div style="font-weight: bold;">${place.organization || ''}</div>
                <div>[대관] ${place.purpose || '대관 예약'}</div>
                <div style="color: #666;">${place.place_name || ''} (${place.participants || 0}명)</div>
              </div>`
            ).join('');
            cellContent += placeContent;
          }
        }
        
        return `<td style="padding: 6px; border: 1px solid #333; vertical-align: top; min-height: 60px;">
          ${cellContent}
        </td>`;
      }).join('');
      
      return `<tr>
        <td style="width: 15%; background-color: #f8f9fa; padding: 8px; border: 1px solid #333; 
          text-align: center; font-weight: bold; font-size: 11px;">${timeSlot}</td>
        ${cells}
      </tr>`;
    }).join('');
    
    // Count total programs and organizations - 필터링된 데이터로 계산
    let totalPrograms = 0;
    let totalPlaces = 0;
    const organizations = new Set();
    
    scheduleData.forEach(day => {
      // Filter programs by organization if not showing all
      const filteredPrograms = showAllOrganizations
        ? day.programs
        : day.programs.filter(program => program.organization === selectedReservation?.group_name);
      
      // Filter places by organization if not showing all  
      const filteredPlaces = showAllOrganizations
        ? day.places || []
        : (day.places || []).filter(place => place.organization === selectedReservation?.group_name);
      
      totalPrograms += filteredPrograms.length;
      totalPlaces += filteredPlaces.length;
      
      filteredPrograms.forEach(program => {
          if (program.organization) {
            organizations.add(program.organization);
          }
        });
      
      filteredPlaces.forEach(place => {
        if (place.organization) {
          organizations.add(place.organization);
      }
      });
    });
    
    const orgList = Array.from(organizations);
    const orgListHtml = orgList.map((org, index) => 
      `<div style="margin: 2px 0; font-size: 11px;">  ${index + 1}. ${org}</div>`
    ).join('');
    
    container.innerHTML = `
      <div style="padding: 30px; width: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0; color: #333;">${title}</h1>
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            생성일: ${moment().format('YYYY년 MM월 DD일')}
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
          <thead>
            <tr>
              <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">시간</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div style="margin-top: 30px;">
          <h3 style="font-size: 16px; color: #333; margin-bottom: 15px;">주간 일정 요약</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <div style="font-size: 12px; margin-bottom: 8px;">• 총 프로그램 수: <strong>${totalPrograms}개</strong></div>
            <div style="font-size: 12px; margin-bottom: 8px;">• 총 대관 예약 수: <strong>${totalPlaces}개</strong></div>
            <div style="font-size: 12px; margin-bottom: 8px;">• 참여 단체 수: <strong>${organizations.size}개</strong></div>
            
            ${organizations.size > 0 ? `
              <div style="margin-top: 15px;">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">참여 단체:</div>
                ${orgListHtml}
              </div>
            ` : ''}
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
        
        // Create PDF with proper dimensions (landscape A4)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = 210; // A4 landscape height in mm
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
          
          // 이미지가 페이지를 넘어가지 않도록 조정
          let finalWidth = imgWidth;
          let finalHeight = (sourceHeight * imgWidth) / canvas.width;
          
          if (finalHeight > pageHeight) {
            finalHeight = pageHeight;
            finalWidth = (canvas.width * finalHeight) / sourceHeight;
          }
          
          // 페이지 중앙 정렬
          const xOffset = (pdfWidth - finalWidth) / 2;
          const yOffset = margin;
          
          // 이미지의 해당 부분만 잘라서 추가
          pdf.addImage(
            imgData, 
            'PNG', 
            xOffset, 
            yOffset, 
            finalWidth, 
            finalHeight,
            undefined,
            'FAST', // 빠른 렌더링
            0,
            sourceY, // 소스 Y 오프셋
            canvas.width,
            sourceHeight // 소스 높이
          );
        }
    
    // Save the PDF
        const fileName = showAllOrganizations 
          ? `전체일정표_${moment(startDate).format('YYYY_MM_DD')}_${moment(endDate).format('MM_DD')}.pdf`
          : `${selectedReservation?.group_name || '단체'}일정표_${moment(startDate).format('YYYY_MM_DD')}_${moment(endDate).format('MM_DD')}.pdf`;
        
        pdf.save(fileName);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating weekly schedule PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        return false;
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Weekly schedule PDF export error:', error);
    return false;
  }
};

// All Schedule PDF Export Function with improved Korean font support
const exportAllSchedulePdf = (scheduleData, startDate, endDate, selectedReservation, showAllOrganizations) => {
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
    
    // Build HTML content with improved styling
    const title = showAllOrganizations 
      ? `전체 프로그램 및 대관 일정표 (${moment(startDate).format('YYYY년 MM월 DD일')} ~ ${moment(endDate).format('MM월 DD일')})`
      : `${selectedReservation?.group_name || '단체'} 프로그램 및 대관 일정표 (${moment(startDate).format('YYYY년 MM월 DD일')} ~ ${moment(endDate).format('MM월 DD일')})`;
    
    // Collect all schedule items - 화면 표시 로직과 동일하게 처리
    const allScheduleItems = [];
    
    scheduleData.forEach(day => {
      const dateStr = day.date;
      const currentDate = moment(dateStr);
      
      // Filter programs by organization if not showing all - 화면과 동일한 로직
      const programs = showAllOrganizations
        ? day.programs
        : day.programs.filter(program => program.organization === selectedReservation?.group_name);
      
      // Filter places by organization if not showing all - 화면과 동일한 로직
      const places = showAllOrganizations
        ? day.places || []
        : (day.places || []).filter(place => place.organization === selectedReservation?.group_name);
      
      // Add programs
      if (programs && programs.length > 0) {
        programs.forEach(program => {
          allScheduleItems.push({
            date: dateStr,
            dateFormatted: currentDate.format('MM월 DD일'),
            dayOfWeek: currentDate.format('ddd'),
            type: '프로그램',
            organization: program.organization || '',
            title: program.program_name || '',
            location: program.location || '',
            time: program.start_time && program.end_time ? `${program.start_time}~${program.end_time}` : '',
            instructor: program.instructor_name || '',
            notes: program.notes || ''
          });
        });
      }
      
      // Add place reservations
      if (places && places.length > 0) {
        places.forEach(place => {
          allScheduleItems.push({
            date: dateStr,
            dateFormatted: currentDate.format('MM월 DD일'),
            dayOfWeek: currentDate.format('ddd'),
            type: '대관',
            organization: place.organization || '',
            title: place.purpose || '대관 예약',
            location: place.place_name || '',
            time: place.start_time && place.end_time ? `${place.start_time}~${place.end_time}` : '',
            instructor: `${place.participants || 0}명`,
            notes: place.notes || ''
          });
        });
      }
    });
    
    // Sort by date and time
    allScheduleItems.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      
      // Sort by start time within same date
      const aTime = a.time.split('~')[0] || '';
      const bTime = b.time.split('~')[0] || '';
      return aTime.localeCompare(bTime);
    });
    
    // Group by date for display
    const scheduleByDate = {};
    allScheduleItems.forEach(item => {
      if (!scheduleByDate[item.date]) {
        scheduleByDate[item.date] = [];
      }
      scheduleByDate[item.date].push(item);
    });
    
    // Generate table rows
    const tableRows = Object.keys(scheduleByDate).sort().map(dateStr => {
      const items = scheduleByDate[dateStr];
      
      return items.map((item, index) => {
        const isFirstOfDate = index === 0;
        const rowSpan = items.length;
        
        return `<tr style="border-bottom: 1px solid #ddd;">
          ${isFirstOfDate ? `<td rowspan="${rowSpan}" style="padding: 8px; border: 1px solid #333; text-align: center; 
            font-weight: bold; background-color: #f8f9fa; font-size: 11px;">
            ${item.dateFormatted}
          </td>` : ''}
          ${isFirstOfDate ? `<td rowspan="${rowSpan}" style="padding: 8px; border: 1px solid #333; text-align: center; 
            font-weight: bold; background-color: #f8f9fa; font-size: 11px;">
            ${item.dayOfWeek}
          </td>` : ''}
          <td style="padding: 6px; border: 1px solid #333; font-size: 10px;">${item.organization}</td>
          <td style="padding: 6px; border: 1px solid #333; text-align: center; font-size: 10px;">
            <span style="background-color: ${item.type === '프로그램' ? '#e3f2fd' : '#fff3e0'}; 
              padding: 2px 6px; border-radius: 3px; font-size: 9px;">${item.type}</span>
          </td>
          <td style="padding: 6px; border: 1px solid #333; font-size: 10px;">${item.title}</td>
          <td style="padding: 6px; border: 1px solid #333; text-align: center; font-size: 10px;">${item.location}</td>
          <td style="padding: 6px; border: 1px solid #333; text-align: center; font-size: 10px;">${item.time}</td>
        </tr>`;
      }).join('');
    }).join('');
    
    // Count totals
    const totalPrograms = allScheduleItems.filter(item => item.type === '프로그램').length;
    const totalPlaces = allScheduleItems.filter(item => item.type === '대관').length;
    const organizations = new Set(allScheduleItems.map(item => item.organization).filter(org => org));
    
    const orgList = Array.from(organizations);
    const orgListHtml = orgList.map((org, index) => 
      `<div style="margin: 2px 0; font-size: 11px;">  ${index + 1}. ${org}</div>`
    ).join('');
    
    container.innerHTML = `
      <div style="padding: 30px; width: 100%; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0; color: #333;">${title}</h1>
          <div style="font-size: 12px; color: #666; margin-top: 10px;">
            생성일: ${moment().format('YYYY년 MM월 DD일')}
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
          <thead>
            <tr>
              <th style="width: 10%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">일자</th>
              <th style="width: 8%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">요일</th>
              <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">단체명</th>
              <th style="width: 8%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">유형</th>
              <th style="width: 15%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">내용</th>
              <th style="width: 12%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">장소</th>
              <th style="width: 10%; background-color: #f0f0f0; padding: 8px; border: 1px solid #333; 
                text-align: center; font-weight: bold; font-size: 12px;">시간</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div style="margin-top: 30px;">
          <h3 style="font-size: 16px; color: #333; margin-bottom: 15px;">전체 일정 요약</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <div style="font-size: 12px; margin-bottom: 8px;">• 총 프로그램 수: <strong>${totalPrograms}개</strong></div>
            <div style="font-size: 12px; margin-bottom: 8px;">• 총 대관 예약 수: <strong>${totalPlaces}개</strong></div>
            <div style="font-size: 12px; margin-bottom: 8px;">• 참여 단체 수: <strong>${organizations.size}개</strong></div>
            
            ${organizations.size > 0 ? `
              <div style="margin-top: 15px;">
                <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">참여 단체:</div>
                ${orgListHtml}
              </div>
            ` : ''}
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
        
        // Create PDF with proper dimensions (landscape A4)
        const pdf = new jsPDF({
          orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          });
          
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
        const fileName = showAllOrganizations 
          ? `전체일정표_${moment(startDate).format('YYYY_MM_DD')}_${moment(endDate).format('MM_DD')}.pdf`
          : `${selectedReservation?.group_name || '단체'}일정표_${moment(startDate).format('YYYY_MM_DD')}_${moment(endDate).format('MM_DD')}.pdf`;
        
        pdf.save(fileName);
        
        // Remove the temporary container
        document.body.removeChild(container);
        return true;
      } catch (error) {
        console.error('Error generating all schedule PDF:', error);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        return false;
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('All schedule PDF export error:', error);
    return false;
  }
};

const ScheduleTab = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [monthDate, setMonthDate] = useState(moment());
  const [dateRange, setDateRange] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [viewType, setViewType] = useState('list'); // Changed default to 'list' from 'month'
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // 날짜 범위 선택 상태
  const [startDateFilter, setStartDateFilter] = useState(moment().startOf('month'));
  const [endDateFilter, setEndDateFilter] = useState(moment().endOf('month'));
  const [isCustomDateRange, setIsCustomDateRange] = useState(false);
  const [showAllOrganizations, setShowAllOrganizations] = useState(false);
  
  // 검색 상태
  const [tempStartDate, setTempStartDate] = useState(moment().startOf('month'));
  const [tempEndDate, setTempEndDate] = useState(moment().endOf('month'));
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Calculate start and end of month for queries
  const queryStartDate = isCustomDateRange ? startDateFilter.format('YYYY-MM-DD') : monthDate.clone().startOf('month').format('YYYY-MM-DD');
  const queryEndDate = isCustomDateRange ? endDateFilter.format('YYYY-MM-DD') : monthDate.clone().endOf('month').format('YYYY-MM-DD');
  
  // 예약 목록 가져오기
  const { loading: loadingReservations, error: errorReservations, data: reservationListData, refetch: refetchReservations } = useQuery(
    GET_PAGE6_RESERVATION_LIST,
    {
      fetchPolicy: 'network-only'
    }
  );
  
  // 선택된 예약의 상세 정보 가져오기
  const { loading: loadingReservationDetail, error: errorReservationDetail, data: reservationDetailData } = useQuery(
    GET_PAGE6_RESERVATION_DETAIL,
    {
      variables: { id: selectedReservation?.id },
      skip: !selectedReservation?.id,
      fetchPolicy: 'network-only'
    }
  );
  
  // 프로그램 일정 데이터 가져오기
  const { loading: loadingSchedule, error: errorSchedule, data: scheduleDataResult, refetch: refetchSchedule } = useQuery(
    GET_PAGE6_SCHEDULE_DATA,
    {
      variables: { startDate: queryStartDate, endDate: queryEndDate },
      fetchPolicy: 'network-only'
    }
  );
  
  // Process schedule data when it's loaded
  useEffect(() => {
    if (scheduleDataResult?.getScheduleData) {
      setScheduleData(scheduleDataResult.getScheduleData);
    }
  }, [scheduleDataResult]);

  // Filter reservations based on search term
  const filteredReservations = React.useMemo(() => {
    const reservations = reservationListData?.getPage1List || [];
    
    return reservations.filter(reservation => {
      // Apply search filter
      const searchMatch = 
        (reservation.group_name && reservation.group_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.customer_name && reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.email && reservation.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filter
      const statusMatch = 
        filterStatus === 'all' ||
        (filterStatus === 'preparation' && reservation.reservation_status === 'preparation') ||
        (filterStatus === 'confirmed' && reservation.reservation_status === 'confirmed');
      
      // Apply date range filter
      const dateMatch = !isCustomDateRange || (
        moment(reservation.start_date).isSameOrBefore(endDateFilter) && 
        moment(reservation.end_date).isSameOrAfter(startDateFilter)
      );
      
      return searchMatch && statusMatch && dateMatch;
    });
  }, [reservationListData, searchTerm, filterStatus, startDateFilter, endDateFilter, isCustomDateRange]);
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle temporary search input change
  const handleTempSearchChange = (event) => {
    setTempSearchTerm(event.target.value);
  };
  
  // Month change handler for date picker
  const handleMonthChange = (newDate) => {
    setMonthDate(newDate);
    setIsCustomDateRange(false);
  };
  
  // Date range handlers
  const handleStartDateChange = (newDate) => {
    setStartDateFilter(newDate);
    setIsCustomDateRange(true);
  };
  
  const handleEndDateChange = (newDate) => {
    setEndDateFilter(newDate);
    setIsCustomDateRange(true);
  };
  
  // Temporary date range handlers for search
  const handleTempStartDateChange = (newDate) => {
    setTempStartDate(newDate);
  };
  
  const handleTempEndDateChange = (newDate) => {
    setTempEndDate(newDate);
  };
  
  // Handle search submit
  const handleSearch = () => {
    setIsSearching(true);
    setStartDateFilter(tempStartDate);
    setEndDateFilter(tempEndDate);
    setSearchTerm(tempSearchTerm);
    setIsCustomDateRange(true);
    
    // Refetch data with new date range
    refetchSchedule({
      startDate: tempStartDate.format('YYYY-MM-DD'),
      endDate: tempEndDate.format('YYYY-MM-DD')
    });
  };
  
  // Handle date range reset
  const handleResetDateRange = () => {
    setIsCustomDateRange(false);
    setStartDateFilter(moment().startOf('month'));
    setEndDateFilter(moment().endOf('month'));
    setMonthDate(moment());
    setTempStartDate(moment().startOf('month'));
    setTempEndDate(moment().endOf('month'));
    setTempSearchTerm('');
    setSearchTerm('');
    setIsSearching(false);
    
    // Refetch with default date range
    refetchSchedule({
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().endOf('month').format('YYYY-MM-DD')
    });
  };
  
  // Previous month button handler
  const handlePrevMonth = () => {
    setMonthDate(monthDate.clone().subtract(1, 'month'));
  };
  
  // Next month button handler
  const handleNextMonth = () => {
    setMonthDate(monthDate.clone().add(1, 'month'));
  };
  
  // Date change handler for date picker
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // Toggle "All Organizations" view
  const handleToggleAllOrganizations = () => {
    setShowAllOrganizations(!showAllOrganizations);
    
    // If turning off "show all", reset to current month
    if (showAllOrganizations) {
      setIsCustomDateRange(false);
      setStartDateFilter(monthDate.clone().startOf('month'));
      setEndDateFilter(monthDate.clone().endOf('month'));
    }
  };
  
  // Handle weekly schedule PDF export
  const handleWeeklySchedulePdfExport = () => {
    try {
      setPdfLoading(true);
      
      // Calculate current week range based on selected date
      const weekStart = moment(selectedDate).startOf('week');
      const weekEnd = moment(selectedDate).endOf('week');
      
      // Filter schedule data for the current week
      const weekScheduleData = scheduleData.filter(day => {
        const dayMoment = moment(day.date);
        return dayMoment.isSameOrAfter(weekStart, 'day') && dayMoment.isSameOrBefore(weekEnd, 'day');
      });
      
      // Export PDF with the same filtering logic as the screen display
      const success = exportWeeklySchedulePdf(
        weekScheduleData, 
        weekStart.toDate(), 
        weekEnd.toDate(),
        selectedReservation,
        showAllOrganizations
      );
      
      if (success) {
        showAlert('주간 일정표 PDF가 생성되었습니다.', 'success');
      } else {
        showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('Weekly schedule PDF export error:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle all schedule PDF export
  const handleAllSchedulePdfExport = () => {
    try {
      setPdfLoading(true);
      
      // Use current date range filters
      const exportStartDate = isCustomDateRange ? startDateFilter.toDate() : moment(queryStartDate).toDate();
      const exportEndDate = isCustomDateRange ? endDateFilter.toDate() : moment(queryEndDate).toDate();
      
      // Filter schedule data for the selected date range - 화면 표시와 동일한 필터링 로직 사용
      const filteredScheduleData = scheduleData.filter(day => {
        const dayMoment = moment(day.date);
        return dayMoment.isBetween(
          moment(exportStartDate).subtract(1, 'day'),
          moment(exportEndDate).add(1, 'day'),
          'day',
          '[]'
        );
      });
      
      // Export PDF with the same filtering logic as the screen display
      const success = exportAllSchedulePdf(
        filteredScheduleData, 
        exportStartDate, 
        exportEndDate, 
        selectedReservation, 
        showAllOrganizations
      );
      
      if (success) {
        showAlert('전체 일정표 PDF가 생성되었습니다.', 'success');
      } else {
        showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('All schedule PDF export error:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle calendar PDF export
  const handleCalendarPdfExport = () => {
    try {
      setPdfLoading(true);
      
      // Prepare calendar data from filtered reservations
      const calendarData = filteredReservations.map(reservation => ({
        id: reservation.id,
        group_name: reservation.group_name,
        organization: reservation.group_name,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        reservation_status: reservation.reservation_status,
        total_count: reservation.total_count,
        room_count: reservation.room_count
      }));
      
      // Use the current month date for calendar display
      const currentDate = moment(monthDate);
      
      // Export calendar PDF
      const success = exportPage6CalendarPdf(calendarData, currentDate);
      
      if (success) {
        showAlert('캘린더 PDF가 생성되었습니다.', 'success');
      } else {
        showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('Calendar PDF export error:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePdfExport = () => {
    if (!selectedReservation) {
      showAlert('단체를 선택해주세요.', 'warning');
      return;
    }
    
    try {
      setPdfLoading(true);
      
      // Ensure we have the necessary program data
      const reservation = { ...selectedReservation };
      
      // Add console log to check what fields are available
      console.log("Original selected reservation data:", selectedReservation);
      
      // If we have schedule data available for this organization, add it to the reservation object
      const orgPrograms = [];
      const orgPlaces = []; // 대관 예약 데이터를 위한 배열 추가
      
      // Extract programs and places from schedule data that match the selected organization
      if (scheduleData && scheduleData.length > 0) {
        scheduleData.forEach(day => {
          // 프로그램 데이터 추출
          if (day.programs && Array.isArray(day.programs)) {
            day.programs.forEach(program => {
              if (program.organization === reservation.group_name) {
                orgPrograms.push({
                  date: day.date,
                  program_name: program.program_name,
                  name: program.program_name,
                  place_name: program.location,
                  location: program.location,
                  start_time: program.start_time,
                  end_time: program.end_time,
                  instructor_name: program.instructor_name,
                  notes: program.notes
                });
              }
            });
          }
          
          // 대관 예약 데이터 추출
          if (day.places && Array.isArray(day.places)) {
            day.places.forEach(place => {
              if (place.organization === reservation.group_name) {
                orgPlaces.push({
                  date: day.date,
                  program_name: place.purpose || '대관 예약', // 대관 목적을 프로그램명으로 사용
                  name: place.purpose || '대관 예약',
                  place_name: place.place_name,
                  location: place.place_name,
                  start_time: place.start_time,
                  end_time: place.end_time,
                  instructor_name: `${place.participants || 0}명`, // 인원수를 강사명 필드에 저장
                  notes: place.notes || '',
                  type: 'place' // 대관 예약임을 구분하기 위한 타입 필드
                });
              }
            });
          }
        });
        
        // Add the programs to the reservation object
        if (orgPrograms.length > 0) {
          console.log("Adding programs to reservation:", orgPrograms);
          reservation.programs = orgPrograms;
        }
        
        // Add the place reservations to the reservation object
        if (orgPlaces.length > 0) {
          console.log("Adding place reservations to reservation:", orgPlaces);
          reservation.places = orgPlaces;
        }
        
        // 프로그램과 대관 예약을 통합하여 전체 일정으로 만들기
        const allScheduleItems = [...orgPrograms, ...orgPlaces].sort((a, b) => {
          // 날짜 순으로 정렬
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          
          // 같은 날짜면 시간 순으로 정렬
          const aTime = a.start_time || '';
          const bTime = b.start_time || '';
          return aTime.localeCompare(bTime);
        });
        
        if (allScheduleItems.length > 0) {
          console.log("Adding combined schedule items to reservation:", allScheduleItems);
          reservation.allScheduleItems = allScheduleItems; // 통합된 일정 데이터 추가
        }
      }
      
      // Get reservation details if available
      if (reservationDetailData && reservationDetailData.getPage1ById) {
        const page1Data = reservationDetailData.getPage1ById;
        
        // Extract any missing fields from the detailed data if available
        if (page1Data) {
          reservation.landline_phone = page1Data.landline_phone || reservation.landline_phone || '';
          reservation.reservation_manager = page1Data.reservation_manager || reservation.reservation_manager || '';
          reservation.operation_manager = page1Data.operation_manager || reservation.operation_manager || '';
          
          // Make sure we have participant count data
          // Include the page2_reservations data for participant counts
          if (page1Data.page2_reservations && page1Data.page2_reservations.length > 0) {
            console.log("Found page2 data with participant counts:", page1Data.page2_reservations[0]);
            
            // Ensure we have the page2_reservations array
            if (!reservation.page2_reservations) {
              reservation.page2_reservations = [];
            }
            
            // Add any page2 data that doesn't already exist
            page1Data.page2_reservations.forEach(page2 => {
              if (page2) {
                // Log the participant counts
                console.log("Participant counts:", {
                  total: page2.total_count,
                  male: page2.male_count,
                  female: page2.female_count,
                  leaders_total: page2.total_leader_count,
                  leaders_male: page2.male_leader_count,
                  leaders_female: page2.female_leader_count
                });
                
                const exists = reservation.page2_reservations.some(p => p.id === page2.id);
                if (!exists) {
                  reservation.page2_reservations.push(page2);
                }
              }
            });
          }
          
          // Add page3 data including meal plans
          if (page1Data.page3) {
            console.log("Found page3 data with meal plans:", page1Data.page3);
            reservation.page3 = page1Data.page3;
          } else {
            console.log("No page3 data found in reservation detail");
          }
        }
      }
      
      console.log("Sending reservation data to PDF export:", reservation);
      
      exportProgramSchedulePdf({ getPage1ById: reservation });
      showAlert('프로그램 일정표 PDF가 생성되었습니다.', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Render the organization list (left panel)
  const renderOrganizationList = () => {
    // Get status chip based on reservation status
    const getStatusChip = (status) => {
      switch(status) {
        case 'preparation':
          return <Chip label="가예약" size="small" color="primary" />;
        case 'confirmed':
          return <Chip label="확정예약" size="small" color="success" />;
        default:
          return <Chip label={status || '미정'} size="small" />;
      }
    };
    
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="단체명, 담당자명, 이메일 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>예약상태</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="예약상태"
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="preparation">가예약</MenuItem>
                <MenuItem value="confirmed">확정예약</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="시작일"
                value={isCustomDateRange ? startDateFilter : monthDate.clone().startOf('month')}
                onChange={handleStartDateChange}
                renderInput={(props) => 
                  <TextField {...props} size="small" fullWidth />
                }
              />
            </LocalizationProvider>
            
            <Typography sx={{ lineHeight: '40px' }}>~</Typography>
            
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="종료일"
                value={isCustomDateRange ? endDateFilter : monthDate.clone().endOf('month')}
                onChange={handleEndDateChange}
                renderInput={(props) => 
                  <TextField {...props} size="small" fullWidth />
                }
              />
            </LocalizationProvider>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={showAllOrganizations}
                  onChange={handleToggleAllOrganizations}
                  color="primary"
                />
              }
              label="전체 보기"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
            
              <Button
              size="small" 
              onClick={handleResetDateRange}
              startIcon={<RefreshIcon />}
              disabled={!isCustomDateRange}
            >
              초기화
              </Button>
          </Box>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>단체명</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>기간</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                      예약 데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => {
              return (
                    <TableRow 
                      key={reservation.id} 
                  sx={{
                    '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          cursor: 'pointer'
                        },
                        backgroundColor: (selectedReservation && selectedReservation.id === reservation.id) ? theme.palette.action.selected : 'inherit'
                      }}
                      onClick={() => {
                        setSelectedReservation((selectedReservation && selectedReservation.id === reservation.id) ? null : reservation);
                        setShowAllOrganizations(false);
                      }}
                    >
                      <TableCell>
                        {getStatusChip(reservation.reservation_status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: (selectedReservation && selectedReservation.id === reservation.id) ? 'bold' : 'normal' }}>
                          {reservation.group_name || '-'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {reservation.customer_name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {formatDate(reservation.start_date)}
                  </Typography>
                        <Typography variant="caption" display="block">
                          ~ {formatDate(reservation.end_date)}
                          </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
                        )}
            </TableBody>
          </Table>
        </Box>
                  </Box>
    );
  };

  // Render the schedule view in tabular format (right panel)
  const renderScheduleTable = () => {
    if (!selectedReservation && !showAllOrganizations) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column',
          p: 3
        }}>
          <BusinessIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            좌측에서 단체를 선택하거나 전체 보기를 활성화하세요
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            프로그램 일정표가 표시됩니다.
          </Typography>
        </Box>
      );
    }
    
    if (loadingReservationDetail && !showAllOrganizations) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // Determine date range
    let dateRangeText;
    if (isCustomDateRange) {
      dateRangeText = `${startDateFilter.format('YYYY년 MM월 DD일')} ~ ${endDateFilter.format('YYYY년 MM월 DD일')}`;
    } else {
      dateRangeText = `${monthDate.format('YYYY년 MM월')}`;
    }
    
    // Get program data
    const programsByDay = {};
    
    // Get program data filtering by the selected organization or showing all
    scheduleData
      .filter(day => {
        // Only include days in selected date range
        const dayDate = moment(day.date);
        return dayDate.isBetween(
          isCustomDateRange ? startDateFilter.clone().subtract(1, 'day') : moment(queryStartDate).subtract(1, 'day'),
          isCustomDateRange ? endDateFilter.clone().add(1, 'day') : moment(queryEndDate).add(1, 'day'),
          'day',
          '[]'
        );
      })
      .forEach(day => {
        // Filter by organization if not showing all
        const programs = showAllOrganizations
          ? day.programs
          : day.programs.filter(program => program.organization === selectedReservation.group_name);
        
        if (programs.length > 0) {
          programsByDay[day.date] = programs;
        }
      });
    
    // Get program and place data (통합된 스케줄 데이터)
    const scheduleByDay = {};
    
    // Get program and place data filtering by the selected organization or showing all
    scheduleData
      .filter(day => {
        // Only include days in selected date range
        const dayDate = moment(day.date);
        return dayDate.isBetween(
          isCustomDateRange ? startDateFilter.clone().subtract(1, 'day') : moment(queryStartDate).subtract(1, 'day'),
          isCustomDateRange ? endDateFilter.clone().add(1, 'day') : moment(queryEndDate).add(1, 'day'),
          'day',
          '[]'
        );
      })
      .forEach(day => {
        // Filter programs by organization if not showing all
        const programs = showAllOrganizations
          ? day.programs
          : day.programs.filter(program => program.organization === selectedReservation.group_name);
        
        // Filter places by organization if not showing all
        const places = showAllOrganizations
          ? day.places || []
          : (day.places || []).filter(place => place.organization === selectedReservation.group_name);
        
        // 프로그램 데이터를 통합 형태로 변환
        const programItems = programs.map(program => ({
          ...program,
          type: 'program',
          title: program.program_name,
          location: program.location,
          time: program.start_time && program.end_time ? `${program.start_time}~${program.end_time}` : '-',
          instructor: program.instructor_name || '-',
          notes: program.notes || '',
          participants: program.participants || '-'
        }));
        
        // 대관 예약 데이터를 통합 형태로 변환
        const placeItems = places.map(place => ({
          ...place,
          type: 'place',
          title: place.purpose || '대관 예약',
          location: place.place_name,
          time: place.start_time && place.end_time ? `${place.start_time}~${place.end_time}` : '-',
          instructor: `${place.participants || 0}명`,
          notes: place.notes || '',
          participants: place.participants || '-'
        }));
        
        // 프로그램과 대관 예약을 시간 순으로 정렬
        const allItems = [...programItems, ...placeItems].sort((a, b) => {
          if (a.start_time && b.start_time) {
            return a.start_time.localeCompare(b.start_time);
          }
          return 0;
        });
        
        if (allItems.length > 0) {
          scheduleByDay[day.date] = allItems;
        }
      });

    // Get the sorted dates with schedule items
    const datesWithSchedule = Object.keys(scheduleByDay).sort();
    
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {showAllOrganizations 
                ? '전체 단체 프로그램 일정표' 
                : selectedReservation?.group_name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {dateRangeText}
              {!showAllOrganizations && selectedReservation && ` (${formatDate(selectedReservation.start_date)} ~ ${formatDate(selectedReservation.end_date)})`}
          </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Weekly Schedule PDF Download Button - Always available */}
            {/* <Button
              variant="contained"
              color="info"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleWeeklySchedulePdfExport}
              disabled={pdfLoading}
            >
              {pdfLoading ? '처리 중...' : '주간일정 PDF'}
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CalendarTodayIcon />}
              onClick={handleCalendarPdfExport}
              disabled={pdfLoading}
            >
              {pdfLoading ? '처리 중...' : '캘린더 PDF'}
            </Button>
             */}
            {/* All Schedule PDF Download Button - Only when showing all organizations */}
            {showAllOrganizations && (
              <Button
                variant="contained"
                color="success"
                startIcon={<GetAppIcon />}
                onClick={handleAllSchedulePdfExport}
                disabled={pdfLoading}
              >
                {pdfLoading ? '처리 중...' : '일정표 다운로드(전체보기)'}
              </Button>
            )}
            
            {/* Individual Organization Schedule PDF - Only when organization is selected */}
            {!showAllOrganizations && selectedReservation && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handlePdfExport}
                disabled={pdfLoading}
              >
                {pdfLoading ? '처리 중...' : '일정표 다운로드'}
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <TableContainer component={Paper} sx={{ height: '100%' }}>
            <Table stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '12%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    일자
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '10%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    요일
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '20%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    단체명
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '20%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    프로그램명
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '10%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    유형
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '18%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    장소
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      backgroundColor: theme.palette.primary.main, 
                      color: theme.palette.primary.contrastText,
                      width: '10%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    시간
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSchedule ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={30} />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        프로그램 일정을 불러오는 중...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : datesWithSchedule.length > 0 ? 
                  datesWithSchedule.map(dateStr => {
                    const currentDate = moment(dateStr);
                    const daySchedule = scheduleByDay[dateStr] || [];
                    
                    return daySchedule.map((item, itemIndex) => (
                      <TableRow 
                        key={`${dateStr}-${itemIndex}`}
        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: theme.palette.action.hover,
                          },
                          '& td': {
                            borderRight: `1px solid ${theme.palette.divider}`,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }
                        }}
                      >
                        {itemIndex === 0 && (
                          <TableCell 
                            rowSpan={daySchedule.length} 
                            align="center"
          sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: theme.palette.grey[100]
                            }}
                          >
                            {currentDate.format('MM월 DD일')}
                          </TableCell>
                        )}
                        
                        {itemIndex === 0 && (
                          <TableCell 
                            rowSpan={daySchedule.length} 
                            align="center"
                  sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: theme.palette.grey[100]
                            }}
                          >
                            {currentDate.format('ddd')}
                          </TableCell>
                        )}
                        
                        <TableCell>
                          {item.organization || '-'}
                        </TableCell>
                        
                        <TableCell>
                          {item.title}
                        </TableCell>
                        
                        <TableCell align="center">
                          <Chip 
                            label={item.type === 'program' ? '프로그램' : '대관'} 
                            size="small" 
                            color={item.type === 'program' ? 'primary' : 'secondary'}
                            sx={{ minWidth: 60 }}
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          {item.location || '-'}
                        </TableCell>
                        
                        <TableCell align="center">
                          {item.time}
                        </TableCell>
                      </TableRow>
                    ));
                  })
                : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="textSecondary">
                        등록된 프로그램 및 대관 예약이 없습니다.
                        </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
          </Box>
    );
  };
  
  return (
    <Page6Layout
      title="프로그램 일정"
      icon={<EventNoteIcon sx={{ fontSize: 28 }} />}
      activeTab="schedule"
    >
    
      
      {loadingReservations || (loadingSchedule && !isSearching) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : errorReservations || errorSchedule ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          height: 'calc(100vh - 210px)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          {/* Left panel - organization list */}
          <Box sx={{ 
            width: '30%', 
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            overflow: 'hidden'
          }}>
            {renderOrganizationList()}
          </Box>
          
          {/* Right panel - schedule table */}
          <Box sx={{ 
            width: '70%',
            height: '100%',
            overflow: 'hidden'
          }}>
            {renderScheduleTable()}
          </Box>
        </Box>
      )}
    </Page6Layout>
  );
};

export default ScheduleTab; 