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
  IconButton,
  Chip,
  Tooltip,
  Autocomplete
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import PrintIcon from '@mui/icons-material/Print';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HotelIcon from '@mui/icons-material/Hotel';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import Page5Layout from '../Page5/components/Page5Layout';
import { GET_PAGE6_RESERVATION_LIST, GET_PAGE6_WEEKLY_SCHEDULE } from './graphql/queries';
import { formatDate, generateDateRange, showAlert, compareDates } from './services/dataService';
import exportWeeklySchedule from '../Page5/services/weeklyScheduleExport';

// 이벤트 유형에 따른 아이콘 및 색상 정의
const eventTypeConfig = {
  program: {
    icon: <EventNoteIcon fontSize="small" />,
    color: '#03A9F4',
    bgColor: 'rgba(3, 169, 244, 0.1)',
    label: '프로그램'
  },
  meal: {
    icon: <RestaurantIcon fontSize="small" />,
    color: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    label: '식사'
  },
  place: {
    icon: <MeetingRoomIcon fontSize="small" />,
    color: '#FF9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    label: '장소예약'
  },
  room: {
    icon: <HotelIcon fontSize="small" />,
    color: '#9C27B0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    label: '숙박'
  }
};

const WeeklyScheduleTab = () => {
  // 시간대 조정을 위해 moment의 로케일 설정
  useEffect(() => {
    moment.locale('ko');
  }, []);

  // 날짜를 UTC 기준으로 초기화하여 시간대 이슈 방지
  // 주간일정: 전 일정 월 월요일로 수정 (가장 좌측이 월요일)
  const getMondayOfWeek = (date) => {
    const d = moment(date);
    const day = d.day(); // 0=일요일, 1=월요일, ..., 6=토요일
    // 월요일(1)부터 시작하도록 조정
    if (day === 0) {
      // 일요일이면 이전 월요일로
      return d.subtract(6, 'days').startOf('day');
    } else {
      // 월요일~토요일이면 현재 주의 월요일로
      return d.subtract(day - 1, 'days').startOf('day');
    }
  };
  
  const [startDate, setStartDate] = useState(() => {
    // 현재 주의 시작일(월요일)을 시간 없이 설정
    return getMondayOfWeek(moment());
  });
  
  const [endDate, setEndDate] = useState(() => {
    // 현재 주의 마지막일(일요일)을 시간 없이 설정
    const monday = getMondayOfWeek(moment());
    return monday.clone().add(6, 'days').startOf('day'); // 월요일 + 6일 = 일요일
  });
  
  const [dateRange, setDateRange] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return getMondayOfWeek(moment());
  });
  const [excelLoading, setExcelLoading] = useState(false);
  
  // 예약 목록 가져오기
  const { 
    loading: loadingReservations, 
    error: errorReservations, 
    data: reservationListData 
  } = useQuery(GET_PAGE6_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('===== 예약 목록 데이터 =====');
      console.log('예약 목록:', data.getPage1List);
      if (data.getPage1List && data.getPage1List.length > 0) {
        console.log(`총 ${data.getPage1List.length}개 단체 예약 있음`);
        
        // 단체명 목록 출력
        const groupNames = data.getPage1List.map(item => item.group_name);
        console.log('단체명 목록:', groupNames);
      }
      console.log('==========================');
    }
  });
  
  // 주간일정표 데이터 가져오기
  const { 
    loading: loadingSchedule, 
    error: errorSchedule, 
    data: scheduleData,
    refetch: refetchSchedule
  } = useQuery(GET_PAGE6_WEEKLY_SCHEDULE, {
    variables: { 
      startDate: formatDate(startDate, 'YYYY-MM-DD'), 
      endDate: formatDate(endDate, 'YYYY-MM-DD')
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('===== 주간일정표 데이터 =====');
      console.log('시작일:', formatDate(startDate, 'YYYY-MM-DD'));
      console.log('종료일:', formatDate(endDate, 'YYYY-MM-DD'));
      console.log('스케줄 데이터:', data.getWeeklySchedule);
      
      // 날짜별 이벤트 건수 확인
      if (data.getWeeklySchedule && data.getWeeklySchedule.length > 0) {
        data.getWeeklySchedule.forEach(daySchedule => {
          let eventCount = 0;
          let organizations = new Set();
          
          daySchedule.timeSlots.forEach(slot => {
            eventCount += slot.events.length;
            slot.events.forEach(event => {
              if (event.organization) organizations.add(event.organization);
            });
          });
          
          console.log(`${daySchedule.date} 일정 건수: ${eventCount}개, 단체 수: ${organizations.size}개`);
          if (organizations.size > 0) {
            console.log('참여 단체:', Array.from(organizations));
          }
        });
      }
      console.log('==========================');
    }
  });
  
  // 날짜 범위 업데이트
  useEffect(() => {
    if (startDate && endDate) {
      const dateRangeArray = generateDateRange(startDate, endDate);
      setDateRange(dateRangeArray);
      console.log('날짜 범위 업데이트:', dateRangeArray.map(d => formatDate(d, 'YYYY-MM-DD')));
    }
  }, [startDate, endDate]);
  
  // 예약 데이터 가공
  useEffect(() => {
    if (reservationListData?.getPage1List) {
      // 현재 날짜에 가장 가까운 예약 선택
      const currentDate = moment();
      const upcomingReservations = reservationListData.getPage1List
        .filter(reservation => {
          // 시간대 이슈를 방지하기 위해 날짜 비교를 정규화
          return compareDates(reservation.end_date, currentDate) >= 0;
        })
        .sort((a, b) => moment(a.start_date).diff(moment(b.start_date)));
        
      // 초기에는 selectedReservation을 null로 유지하여 모든 단체가 표시되도록 함
      if (selectedReservation === null) {
        console.log("전체보기 모드: 모든 단체의 일정이 표시됩니다.");
      }
    }
  }, [reservationListData]);
  
  // 헬퍼 함수: 시간대 배열에서 시간의 인덱스 찾기
  const getTimeSlotIndex = (time) => {
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                       '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    return timeSlots.indexOf(time);
  };

  // 헬퍼 함수: 이벤트의 rowspan 계산 (시작 시간과 종료 시간 기반)
  const calculateRowspan = (startTime, endTime) => {
    if (!startTime || !endTime) return 1;
    
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                       '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    // 종료 시간이 정각이 아니면 다음 시간대까지 포함
    const endSlot = endMinute > 0 ? endHour + 1 : endHour;
    
    // 시작 시간대와 종료 시간대 사이의 시간대 개수 계산
    const startIndex = timeSlots.findIndex(t => parseInt(t.split(':')[0]) === startHour);
    const endIndex = timeSlots.findIndex(t => parseInt(t.split(':')[0]) === endSlot);
    
    if (startIndex === -1 || endIndex === -1) return 1;
    
    const rowspan = Math.max(1, endIndex - startIndex + 1);
    return rowspan;
  };

  // 헬퍼 함수: 각 날짜별로 이벤트를 정리하고 첫 번째 이벤트 정보 반환
  const processDayEvents = (daySchedule, date, selectedReservation) => {
    if (!daySchedule || !daySchedule.timeSlots) return { events: [], firstEventInfo: null };
    
    // 모든 이벤트 수집
    let allEvents = [];
    daySchedule.timeSlots.forEach(slot => {
      if (slot.events && slot.events.length > 0) {
        allEvents = [...allEvents, ...slot.events];
      }
    });
    
    // 선택된 단체가 있을 경우 필터링
    if (selectedReservation) {
      allEvents = allEvents.filter(event => 
        event.organization === selectedReservation.group_name
      );
    }
    
    // 이벤트 중복 제거
    const uniqueEvents = allEvents.reduce((acc, event) => {
      const existingEvent = acc.find(e => e.id === event.id);
      if (!existingEvent) {
        acc.push(event);
      }
      return acc;
    }, []);
    
    // 시간 순으로 정렬
    uniqueEvents.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.localeCompare(b.startTime);
    });
    
    // 각 이벤트에 rowspan 정보 추가
    const eventsWithRowspan = uniqueEvents.map(event => {
      const rowspan = calculateRowspan(event.startTime, event.endTime);
      const startTimeSlot = event.startTime ? `${String(parseInt(event.startTime.split(':')[0])).padStart(2, '0')}:00` : '08:00';
      const startTimeIndex = getTimeSlotIndex(startTimeSlot);
      
      return {
        ...event,
        rowspan,
        startTimeSlot,
        startTimeIndex
      };
    });
    
    // 첫 번째 이벤트 정보 (단체명, 인원 표시용)
    const firstEventInfo = eventsWithRowspan.length > 0 ? {
      organization: eventsWithRowspan[0].organization,
      participants: eventsWithRowspan[0].participants,
      startTimeSlot: eventsWithRowspan[0].startTimeSlot,
      startTimeIndex: eventsWithRowspan[0].startTimeIndex
    } : null;
    
    return { events: eventsWithRowspan, firstEventInfo };
  };

  // 이전 주 이동 핸들러 (월요일 기준)
  const handlePrevWeek = () => {
    const newStart = currentWeekStart.clone().subtract(7, 'days').startOf('day');
    const newEnd = newStart.clone().add(6, 'days').startOf('day'); // 월요일 + 6일 = 일요일
    console.log(`이전 주로 이동: ${formatDate(newStart)} ~ ${formatDate(newEnd)}`);
    
    setCurrentWeekStart(newStart);
    setStartDate(newStart);
    setEndDate(newEnd);
  };
  
  // 다음 주 이동 핸들러 (월요일 기준)
  const handleNextWeek = () => {
    const newStart = currentWeekStart.clone().add(7, 'days').startOf('day');
    const newEnd = newStart.clone().add(6, 'days').startOf('day'); // 월요일 + 6일 = 일요일
    console.log(`다음 주로 이동: ${formatDate(newStart)} ~ ${formatDate(newEnd)}`);
    
    setCurrentWeekStart(newStart);
    setStartDate(newStart);
    setEndDate(newEnd);
  };
  
  // 엑셀 내보내기 핸들러
  const handleExcelExport = async () => {
    try {
      setExcelLoading(true);
      
      const XLSX = await import('xlsx');
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // 현재 화면에 표시된 데이터 사용
      const exportData = scheduleData?.getWeeklySchedule || [];
      
      // 시간대 정의 (테이블과 동일)
      const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
      
      // 제목 행 추가
      const titleRow = [`주간 일정표`];
      const dateRangeRow = [`${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')}`];
      const selectedGroupName = selectedReservation ? selectedReservation.group_name : '전체 단체';
      const subtitleRow = [`${selectedGroupName}`];
      const emptyRow = [''];
      
      // 엑셀 헤더 생성 (요일별 색상 구분을 위한 정보 포함)
      const headers = ['시간'];
      const headerColors = ['F9F9F9']; // 시간 컬럼 색상
      
      dateRange.forEach(date => {
        const dayOfWeek = moment(date).format('dd');
        const isWeekend = dayOfWeek === '토' || dayOfWeek === '일';
        const isSunday = dayOfWeek === '일';
        
        headers.push(`${moment(date).format('MM/DD')} (${dayOfWeek})`);
        
        // 요일별 헤더 색상 설정
        if (isSunday) {
          headerColors.push('FFE6E6'); // 일요일 - 연한 빨간색
        } else if (isWeekend) {
          headerColors.push('E6F3FF'); // 토요일 - 연한 파란색
        } else {
          headerColors.push('F5F5F5'); // 평일 - 회색
        }
      });
      
      // 엑셀 데이터 생성
      const excelData = [titleRow, dateRangeRow, subtitleRow, emptyRow, headers];
      
      timeSlots.forEach(time => {
        const row = [time];
        
        dateRange.forEach(date => {
          // 해당 날짜의 스케줄 찾기
          const daySchedule = exportData.find(
            s => s.date === formatDate(date, 'YYYY-MM-DD')
          );
          
          if (!daySchedule) {
            row.push('');
            return;
          }
          
          // 해당 시간대의 모든 슬롯에서 이벤트 찾기
          const currentHour = parseInt(time.split(':')[0]);
          const relevantSlots = daySchedule.timeSlots.filter(slot => {
            const slotHour = parseInt(slot.time.split(':')[0]);
            return slotHour === currentHour;
          });
          
          // 모든 관련 슬롯에서 이벤트 수집
          let allEvents = [];
          relevantSlots.forEach(slot => {
            if (slot.events && slot.events.length > 0) {
              allEvents = [...allEvents, ...slot.events];
            }
          });
          
          // 선택된 단체가 있을 경우 필터링
          let events = allEvents;
          if (selectedReservation) {
            events = events.filter(event => 
              event.organization === selectedReservation.group_name
            );
          }
          
          // 이벤트 중복 제거
          const uniqueEvents = events.reduce((acc, event) => {
            const existingEvent = acc.find(e => e.id === event.id);
            if (!existingEvent) {
              acc.push(event);
            }
            return acc;
          }, []);
          
          // 이벤트 정보를 문자열로 변환 (PDF 스타일 적용)
          if (uniqueEvents.length === 0) {
            row.push('');
          } else {
            const eventText = uniqueEvents.map(event => {
              const parts = [];
              
              // 이벤트 타입을 아이콘과 함께 표시 (PDF 스타일)
              const typeLabels = {
                'meal': '🍽️ 식사',
                'program': '📋 프로그램',
                'place': '🏢 장소예약',
                'room': '🏨 숙박'
              };
              
              const typeLabel = typeLabels[event.type] || '📌 기타';
              parts.push(`${typeLabel}: ${event.programName}`);
              
              const details = [];
              if (event.organization && !selectedReservation) {
                details.push(`단체: ${event.organization}`);
              }
              
              if (event.participants > 0) {
                details.push(`${event.participants}명`);
              }
              
              if (event.startTime && event.endTime) {
                details.push(`${event.startTime}-${event.endTime}`);
              }
              
              if (event.location) {
                details.push(`장소: ${event.location}`);
              }
              
              if (details.length > 0) {
                parts.push(`(${details.join(' | ')})`);
              }
              
              return parts.join(' ');
            }).join('\n\n');
            
            row.push(eventText);
          }
        });
        
        excelData.push(row);
      });
      
      // 범례 추가
      const legendRow1 = ['', '📋 프로그램', '🍽️ 식사', '🏢 장소예약', '🏨 숙박'];
      const legendRow2 = ['범례', '파란색 배경', '초록색 배경', '주황색 배경', '보라색 배경'];
      excelData.push([''], legendRow1, legendRow2);
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [{ wch: 12 }]; // 시간 컬럼
      dateRange.forEach(() => {
        columnWidths.push({ wch: 35 }); // 날짜 컬럼들 (더 넓게)
      });
      ws['!cols'] = columnWidths;
      
      // Set row heights
      ws['!rows'] = excelData.map((_, index) => {
        if (index === 0) return { hpt: 40 }; // 제목
        if (index === 1) return { hpt: 30 }; // 날짜 범위
        if (index === 2) return { hpt: 25 }; // 단체명
        if (index === 3) return { hpt: 10 }; // 빈 줄
        if (index === 4) return { hpt: 35 }; // 헤더
        if (index >= excelData.length - 3) return { hpt: 25 }; // 범례
        return { hpt: 100 }; // 데이터 행들 (더 높게)
      });
      
      // 향상된 스타일 정의
      const titleStyle = {
        font: { bold: true, size: 18, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: false },
        fill: { fgColor: { rgb: "4A90E2" }, patternType: "solid" }, // 진한 파란색
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } }
        }
      };
      
      const dateRangeStyle = {
        font: { bold: true, size: 14, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: false },
        fill: { fgColor: { rgb: "B8D4F0" }, patternType: "solid" }, // 연한 파란색
        border: {
          top: { style: "thin", color: { rgb: "DDDDDD" } },
          bottom: { style: "thin", color: { rgb: "DDDDDD" } },
          left: { style: "thin", color: { rgb: "DDDDDD" } },
          right: { style: "thin", color: { rgb: "DDDDDD" } }
        }
      };
      
      const subtitleStyle = {
        font: { bold: true, size: 12, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: false },
        fill: { fgColor: { rgb: "E8E8E8" }, patternType: "solid" }, // 연한 회색
        border: {
          top: { style: "thin", color: { rgb: "DDDDDD" } },
          bottom: { style: "thin", color: { rgb: "DDDDDD" } },
          left: { style: "thin", color: { rgb: "DDDDDD" } },
          right: { style: "thin", color: { rgb: "DDDDDD" } }
        }
      };
      
      const timeStyle = {
        font: { bold: true, size: 11, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: false },
        fill: { fgColor: { rgb: "F9F9F9" }, patternType: "solid" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      };
      
      const dataStyle = {
        font: { size: 10, color: { rgb: "000000" } },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
        fill: { fgColor: { rgb: "FFFFFF" }, patternType: "solid" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      };
      
      const mealTimeStyle = {
        ...dataStyle,
        fill: { fgColor: { rgb: "E8F5E8" }, patternType: "solid" } // 연한 초록색 (식사시간)
      };
      
      const legendStyle = {
        font: { bold: true, size: 10, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: false },
        fill: { fgColor: { rgb: "F0F0F0" }, patternType: "solid" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      };
      
      // 스타일 적용
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) continue;
          
          // 제목 행
          if (row === 0) {
            ws[cellAddress].s = titleStyle;
          }
          // 날짜 범위 행
          else if (row === 1) {
            ws[cellAddress].s = dateRangeStyle;
          }
          // 단체명 행
          else if (row === 2) {
            ws[cellAddress].s = subtitleStyle;
          }
          // 헤더 행 (요일별 색상 적용)
          else if (row === 4) {
            const headerStyle = {
              font: { bold: true, size: 11, color: { rgb: "000000" } },
              alignment: { horizontal: "center", vertical: "center", wrapText: false },
              fill: { fgColor: { rgb: headerColors[col] || "F5F5F5" }, patternType: "solid" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } }
              }
            };
            ws[cellAddress].s = headerStyle;
          }
          // 범례 행
          else if (row >= excelData.length - 3) {
            ws[cellAddress].s = legendStyle;
          }
          // 데이터 행
          else if (row > 4 && row < excelData.length - 3) {
            // 시간 컬럼
            if (col === 0) {
              ws[cellAddress].s = timeStyle;
            } else {
              // 식사 시간대 확인
              const timeRowIndex = row - 5;
              const isMealTime = timeSlots[timeRowIndex] === '08:00' || 
                               timeSlots[timeRowIndex] === '12:00' || 
                               timeSlots[timeRowIndex] === '18:00';
              
              ws[cellAddress].s = isMealTime ? mealTimeStyle : dataStyle;
            }
          }
        }
      }
      
      // 제목, 날짜 범위, 단체명 행 병합
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: dateRange.length } }, // 제목 행 병합
        { s: { r: 1, c: 0 }, e: { r: 1, c: dateRange.length } }, // 날짜 범위 행 병합
        { s: { r: 2, c: 0 }, e: { r: 2, c: dateRange.length } }  // 단체명 행 병합
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, '주간일정표');
      
      // Generate filename
      const filename = `주간일정표_${selectedGroupName}_${startDate.format('YYYYMMDD')}_${endDate.format('YYYYMMDD')}.xlsx`;
      
      // Download file
      XLSX.writeFile(wb, filename);
      
      showAlert('주간일정표 엑셀 다운로드가 완료되었습니다.', 'success');
      
    } catch (error) {
      console.error('Excel export error:', error);
      showAlert('엑셀 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setExcelLoading(false);
    }
  };
  
  // PDF 생성 및 인쇄 - html2canvas 사용
  const handlePrint = async () => {
    try {
      setExcelLoading(true);
      
      // Create temporary container for PDF content
      const container = document.createElement('div');
      container.style.width = '1200px';
      container.style.fontFamily = 'Arial, sans-serif, "Malgun Gothic", "맑은 고딕"';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      document.body.appendChild(container);

      // Create HTML content for PDF
      const htmlContent = `
        <div style="font-family: Arial, sans-serif, 'Malgun Gothic', '맑은 고딕'; background: white; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin: 0; color: #333;">주간 일정표</h1>
            <h2 style="font-size: 18px; margin: 10px 0; color: #666;">
              ${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')}
            </h2>
            <h3 style="font-size: 16px; margin: 10px 0; color: #888;">
              ${selectedReservation ? selectedReservation.group_name : '전체 단체'}
            </h3>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 80px;">시간</th>
                ${dateRange.map(date => {
                  const dayOfWeek = moment(date).format('dd');
                  const isWeekend = dayOfWeek === '토' || dayOfWeek === '일';
                  const color = isWeekend ? (dayOfWeek === '일' ? '#d32f2f' : '#1976d2') : '#333';
                  return `<th style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${color};">
                    ${moment(date).format('MM/DD')} (${dayOfWeek})
                  </th>`;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => {
                const isMealTime = time === '08:00' || time === '12:00' || time === '18:00';
                const timeRowBg = isMealTime ? '#e8f5e8' : 'white';
                
                return `<tr style="height: 60px;">
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; background-color: ${timeRowBg};">
                    ${time}
                  </td>
                  ${dateRange.map(date => {
                    // 해당 날짜의 스케줄 찾기
                    const daySchedule = scheduleData?.getWeeklySchedule?.find(
                      s => s.date === formatDate(date, 'YYYY-MM-DD')
                    );
                    
                    if (!daySchedule) {
                      return `<td style="border: 1px solid #ddd; padding: 8px; background-color: ${isMealTime ? '#f0f8f0' : 'white'};"></td>`;
                    }
                    
                    // 해당 시간대의 모든 슬롯에서 이벤트 찾기
                    const currentHour = parseInt(time.split(':')[0]);
                    const relevantSlots = daySchedule.timeSlots.filter(slot => {
                      const slotHour = parseInt(slot.time.split(':')[0]);
                      return slotHour === currentHour;
                    });
                    
                    // 모든 관련 슬롯에서 이벤트 수집
                    let allEvents = [];
                    relevantSlots.forEach(slot => {
                      if (slot.events && slot.events.length > 0) {
                        allEvents = [...allEvents, ...slot.events];
                      }
                    });
                    
                    if (allEvents.length === 0) {
                      return `<td style="border: 1px solid #ddd; padding: 8px; background-color: ${isMealTime ? '#f0f8f0' : 'white'};"></td>`;
                    }
                    
                    // 선택된 단체가 있을 경우 필터링
                    let events = allEvents;
                    if (selectedReservation) {
                      events = events.filter(event => 
                        event.organization === selectedReservation.group_name
                      );
                    }
                    
                    if (events.length === 0) {
                      return `<td style="border: 1px solid #ddd; padding: 8px; background-color: ${isMealTime ? '#f0f8f0' : 'white'};"></td>`;
                    }
                    
                    // 이벤트 중복 제거 (같은 이벤트가 여러 슬롯에 있을 수 있음)
                    const uniqueEvents = events.reduce((acc, event) => {
                      const existingEvent = acc.find(e => e.id === event.id);
                      if (!existingEvent) {
                        acc.push(event);
                      }
                      return acc;
                    }, []);
                    
                    // 이벤트 내용 생성
                    const eventContent = uniqueEvents.map(event => {
                      const typeColors = {
                        program: '#03A9F4',
                        meal: '#4CAF50',
                        place: '#FF9800',
                        room: '#9C27B0'
                      };
                      const color = typeColors[event.type] || '#03A9F4';
                      
                      let content = `<div style="margin-bottom: 4px; padding: 4px; border-left: 3px solid ${color}; background-color: rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.1); font-size: 11px;">`;
                      content += `<div style="font-weight: bold;">${event.programName}</div>`;
                      
                      const details = [];
                      if (event.organization && !selectedReservation) {
                        details.push(event.organization);
                      }
                      if (event.participants > 0) {
                        details.push(`${event.participants}명`);
                      }
                      if (event.startTime && event.endTime) {
                        details.push(`${event.startTime}-${event.endTime}`);
                      }
                      
                      if (details.length > 0) {
                        content += `<div style="color: #666; font-size: 10px;">${details.join(' | ')}</div>`;
                      }
                      content += `</div>`;
                      
                      return content;
                    }).join('');
                    
                    return `<td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; background-color: ${isMealTime ? '#f0f8f0' : 'white'};">
                      ${eventContent}
                    </td>`;
                  }).join('')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
            <div style="display: flex; gap: 20px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background-color: #03A9F4; margin-right: 5px;"></div>
                프로그램
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background-color: #4CAF50; margin-right: 5px;"></div>
                식사
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background-color: #FF9800; margin-right: 5px;"></div>
                장소예약
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background-color: #9C27B0; margin-right: 5px;"></div>
                숙박
              </div>
            </div>
            <div>생성일시: ${moment().format('YYYY년 MM월 DD일 HH:mm')}</div>
          </div>
        </div>
      `;

      container.innerHTML = htmlContent;

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate canvas from HTML
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: container.scrollHeight
      });

      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = 297; // A4 landscape width in mm
      const pageHeight = 210; // A4 landscape height in mm
      
      const imgWidth = pageWidth - 20; // Margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // If content is taller than page, add more pages
      if (imgHeight > pageHeight - 20) {
        let remainingHeight = imgHeight - (pageHeight - 20);
        let currentY = -(pageHeight - 20);
        
        while (remainingHeight > 0) {
          pdf.addPage();
          const pageContentHeight = Math.min(pageHeight - 20, remainingHeight);
          pdf.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight);
          
          remainingHeight -= pageContentHeight;
          currentY -= pageContentHeight;
        }
      }

      // Save PDF
      const pdfName = selectedReservation 
        ? `주간일정표_${selectedReservation.group_name}_${moment().format('YYYYMMDD')}.pdf`
        : `주간일정표_전체단체_${moment().format('YYYYMMDD')}.pdf`;
      
      pdf.save(pdfName);
      
      // Clean up
      document.body.removeChild(container);
      
      showAlert('주간 일정표 PDF가 생성되었습니다.', 'success');
      
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setExcelLoading(false);
    }
  };
  
  // 로딩 중 표시
  if (loadingReservations) {
    return (
      <Page5Layout
        title="주간 일정"
        icon={<ScheduleIcon fontSize="large" />}
        activeTab="weekly-schedule"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Page5Layout>
    );
  }
  
  // 오류 표시
  if (errorReservations) {
    return (
      <Page5Layout
        title="주간 일정"
        icon={<ScheduleIcon fontSize="large" />}
        activeTab="weekly-schedule"
      >
        <Alert severity="error">
          데이터를 불러오는 중 오류가 발생했습니다: {errorReservations.message}
        </Alert>
      </Page5Layout>
    );
  }
  
  return (
    <Page5Layout
      title="주간 일정"
      icon={<ScheduleIcon fontSize="large" />}
      activeTab="weekly-schedule"
    >
    <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <Autocomplete
                value={selectedReservation || null}
                onChange={(event, newValue) => {
                  // 전체 보기를 선택한 경우
                  if (!newValue) {
                    setSelectedReservation(null);
                    console.log("전체 단체 표시 모드로 변경");
                  } else {
                    // 특정 단체를 선택한 경우
                    setSelectedReservation(newValue);
                    console.log("선택된 단체:", newValue);
                  }
                }}
                options={reservationListData?.getPage1List || []}
                getOptionLabel={(option) => `${option.group_name} (${formatDate(option.start_date)} ~ ${formatDate(option.end_date)})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="단체 선택"
                    placeholder="전체 보기"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingReservations ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={loadingReservations}
                disabled={loadingReservations}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.group_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(option.start_date)} ~ {formatDate(option.end_date)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton color="primary" onClick={handlePrevWeek}>
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography variant="h6" sx={{ mx: 2, minWidth: '200px', textAlign: 'center' }}>
                {startDate.format('YYYY-MM-DD')} ~ {endDate.format('YYYY-MM-DD')}
              </Typography>
              
              <IconButton color="primary" onClick={handleNextWeek}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<GetAppIcon />}
              onClick={handleExcelExport}
              disabled={excelLoading || loadingSchedule}
            >
              {excelLoading ? '처리 중...' : '주간 일정표 엑셀 다운로드'}
            </Button>
            
            <Button
              variant="contained"
              color="info"
              startIcon={<PictureAsPdfIcon />}
              onClick={handlePrint}
              disabled={excelLoading || loadingSchedule}
            >
              {excelLoading ? '처리 중...' : '주간 일정표 PDF 다운로드'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {loadingSchedule ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : errorSchedule ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          주간일정표 데이터를 불러오는 중 오류가 발생했습니다: {errorSchedule.message}
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', mb: 3 }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(200, 200, 200, 0.2)' }}>
                <TableCell 
                  width="80px" 
                  align="center" 
                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                  시간
                </TableCell>
                
                {/* 날짜 헤더 */}
                {dateRange.map(date => {
                  const dayOfWeek = moment(date).format('dd');
                  // 요일에 따른 색상 설정
                  const isWeekend = dayOfWeek === '토' || dayOfWeek === '일';
                  return (
                    <TableCell 
                      key={date} 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        color: isWeekend ? (dayOfWeek === '일' ? 'error.main' : 'primary.main') : 'inherit'
                      }}
                    >
                      {moment(date).format('MM/DD')} ({dayOfWeek})
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            
            <TableBody>
              {/* 시간대별 일정 데이터 */}
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => {
                
                // 식사 시간대 배경색 설정
                const isMealTime = time === '08:00' || time === '12:00' || time === '18:00';
                
                return (
                  <TableRow key={time} sx={{ height: 70 }}>
                    <TableCell 
                      align="center" 
                      sx={{ 
                        backgroundColor: isMealTime ? 'rgba(200, 230, 201, 0.3)' : 'inherit',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      {time}
                    </TableCell>
                    
                    {/* 날짜별 해당 시간대 일정 */}
                    {dateRange.map(date => {
                      // 해당 날짜의 스케줄 찾기
                      const daySchedule = scheduleData?.getWeeklySchedule?.find(
                        s => s.date === formatDate(date, 'YYYY-MM-DD')
                      );
                      
                      if (!daySchedule) {
                        return <TableCell key={`${date}-${time}`} />;
                      }
                      
                      // 날짜별 이벤트 처리
                      const { events: processedEvents, firstEventInfo } = processDayEvents(daySchedule, date, selectedReservation);
                      
                      // 현재 시간대에 시작하는 이벤트 찾기
                      const currentTimeIndex = getTimeSlotIndex(time);
                      const eventsAtThisTime = processedEvents.filter(event => 
                        event.startTimeIndex === currentTimeIndex
                      );
                      
                      // 현재 시간대에 이벤트가 없으면 빈 셀
                      if (eventsAtThisTime.length === 0) {
                        // 첫 번째 이벤트가 있는 시간대인지 확인 (단체명/인원 표시용)
                        if (firstEventInfo && firstEventInfo.startTimeIndex === currentTimeIndex) {
                          return (
                            <TableCell 
                              key={`${date}-${time}`}
                              rowSpan={firstEventInfo.startTimeIndex === currentTimeIndex ? 1 : undefined}
                              sx={{ 
                                backgroundColor: isMealTime ? 'rgba(200, 230, 201, 0.2)' : 'inherit',
                                verticalAlign: 'top',
                                p: 1
                              }}
                            >
                              {/* 단체명과 인원 표시 (첫 번째 이벤트가 있는 시간대에만) */}
                              {firstEventInfo && (
                                <Box sx={{ mb: 1, pb: 1, borderBottom: '1px solid #ddd' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                                    {firstEventInfo.organization}
                                  </Typography>
                                  {firstEventInfo.participants > 0 && (
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', ml: 0.5 }}>
                                      {firstEventInfo.participants}명
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </TableCell>
                          );
                        }
                        return <TableCell key={`${date}-${time}`} />;
                      }
                      
                      // 현재 시간대에 시작하는 이벤트 렌더링
                      return (
                        <TableCell 
                          key={`${date}-${time}`} 
                          rowSpan={eventsAtThisTime[0]?.rowspan || 1}
                          sx={{ 
                            backgroundColor: isMealTime ? 'rgba(200, 230, 201, 0.2)' : 'inherit',
                            verticalAlign: 'top',
                            p: 1
                          }}
                        >
                          {/* 단체명과 인원 표시 (첫 번째 이벤트가 있는 시간대에만) */}
                          {firstEventInfo && firstEventInfo.startTimeIndex === currentTimeIndex && (
                            <Box sx={{ mb: 1, pb: 1, borderBottom: '1px solid #ddd' }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                                {firstEventInfo.organization}
                              </Typography>
                              {firstEventInfo.participants > 0 && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', ml: 0.5 }}>
                                  {firstEventInfo.participants}명
                                </Typography>
                              )}
                            </Box>
                          )}
                          
                          {/* 이벤트 표시 (시간 정보 제외) */}
                          {eventsAtThisTime.map((event, idx) => {
                            const config = eventTypeConfig[event.type] || eventTypeConfig.program;
                            
                            return (
                              <Tooltip 
                                key={`${event.id}-${idx}`} 
                                title={
                                  <Box sx={{ p: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  {event.programName}
                                </Typography>
                                    <Typography variant="caption" display="block">
                                      단체: {event.organization}
                                    </Typography>
                                {event.location && (
                                  <Typography variant="caption" display="block">
                                    장소: {event.location}
                                  </Typography>
                                )}
                                    {event.startTime && event.endTime && (
                                  <Typography variant="caption" display="block">
                                    시간: {event.startTime}~{event.endTime}
                                  </Typography>
                                )}
                                {event.instructorName && (
                                  <Typography variant="caption" display="block">
                                    강사: {event.instructorName}
                                  </Typography>
                                )}
                                {event.participants > 0 && (
                                  <Typography variant="caption" display="block">
                                    인원: {event.participants}명
                                  </Typography>
                                )}
                              </Box>
                                }
                                placement="top"
                                arrow
                              >
                                <Box 
                                  sx={{ 
                                    mb: 0.5, 
                                    p: 0.8, 
                                    borderLeft: `3px solid ${config.color}`,
                                    backgroundColor: config.bgColor,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: `${config.color}20`,
                                      transform: 'scale(1.02)',
                                      transition: 'all 0.2s ease-in-out'
                                    }
                                  }}
                                >
                                  {/* 프로그램명만 표시 (단체명, 인원, 시간 제외) */}
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ color: config.color, mr: 0.5, fontSize: '0.7rem' }}>
                                      {config.icon}
                                    </Box>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontWeight: 'bold', 
                                        fontSize: '0.7rem',
                                        lineHeight: 1.1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1
                                      }}
                                    >
                                      {event.programName}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Tooltip>
                            );
                          })}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* 범례 추가 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ color: config.color, mr: 0.5 }}>
              {config.icon}
            </Box>
            <Typography variant="caption">{config.label}</Typography>
          </Box>
        ))}
      </Box>
      
    </Page5Layout>
  );
};

export default WeeklyScheduleTab; 