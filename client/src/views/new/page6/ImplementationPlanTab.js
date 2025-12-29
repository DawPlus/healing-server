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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Divider,
  TextField,
  IconButton,
  Tooltip,
  Autocomplete
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

import Page6Layout from './components/Page6Layout';
import { GET_PAGE6_RESERVATION_LIST, GET_PAGE6_IMPLEMENTATION_PLAN, GET_PROGRAM_CATEGORIES } from './graphql/queries';
// Import Page5 queries for actual data
import { GET_PAGE5_RESERVATION_LIST } from '../Page5/graphql/queries';
import { formatDate, showAlert } from './services/dataService';
import { createKoreanPdf, safeText } from 'utils/koreanFonts';
import { exportImplementationPlan } from './services';
// Import business category translation function
import { translateBusinessCategory } from '../common/Page1DataMapper';

const ImplementationPlanTab = () => {
  const [searchPeriod, setSearchPeriod] = useState('week'); // Changed default to 'week'
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  // 시행계획: 전 일정 월 월요일로 수정 (가장 좌측이 월요일)
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
  
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const monday = getMondayOfWeek(moment());
    return {
      start: monday, // 월요일
      end: monday.clone().add(6, 'days').startOf('day') // 일요일
    };
  });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setLoading] = useState(false);
  
  // Generate month options
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = moment();
    const startDate = moment().subtract(12, 'months'); // 1년 전부터
    
    let month = moment(startDate);
    while (month.isSameOrBefore(currentDate)) {
      options.push({
        value: month.format('YYYY-MM'),
        label: month.format('YYYY년 MM월')
      });
      month.add(1, 'month');
    }
    
    return options.reverse(); // 최근 월을 먼저 표시
  };
  
  // Generate week options
  const generateWeekOptions = () => {
    const options = [];
    const currentDate = moment();
    
    // Show current week and future weeks (up to 8 weeks from now)
    // 월요일 기준으로 주간 설정 (가장 좌측이 월요일)
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
    
    let week = getMondayOfWeek(currentDate); // 월요일로 설정
    for (let i = 0; i < 8; i++) {
      const weekEnd = week.clone().add(6, 'days').startOf('day'); // 월요일 + 6일 = 일요일
      options.push({
        value: {
          start: week.format('YYYY-MM-DD'),
          end: weekEnd.format('YYYY-MM-DD')
        },
        label: `${week.format('YYYY-MM-DD')} ~ ${weekEnd.format('YYYY-MM-DD')} (${i === 0 ? '이번주' : i + '주 후'})`
      });
      week.add(1, 'week');
    }
    
    return options;
  };
  
  // Reservation list query - Use Page5 data for actual reservations
  const { 
    loading: loadingReservationList, 
    error: errorReservationList, 
    data: reservationListData 
  } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only'
  });
  
  // Debug reservation list query results
  React.useEffect(() => {
    console.log("개요데이터 - 예약 목록 쿼리 상태:", {
      loading: loadingReservationList,
      error: errorReservationList,
      data: reservationListData
    });
    
    if (reservationListData?.getPage1List) {
      console.log("개요데이터 - 가져온 예약 목록 개수:", reservationListData.getPage1List.length);
      reservationListData.getPage1List.forEach((reservation, index) => {
        console.log(`개요데이터 - 예약 목록 ${index + 1}:`, {
          id: reservation.id,
          group_name: reservation.group_name,
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          region: reservation.region,
          business_category: reservation.business_category,
          page2_count: reservation.page2_reservations?.length || 0,
          page3_exists: !!reservation.page3,
          page4_count: reservation.page4_reservations?.length || 0
        });
      });
    }
  }, [loadingReservationList, errorReservationList, reservationListData]);
  
  // Implementation plan data query
  // Update the query variables based on search period type
  const { 
    loading: loadingImplementationPlan, 
    error: errorImplementationPlan, 
    data: implementationPlanData,
    refetch: refetchImplementationPlan
  } = useQuery(GET_PAGE6_IMPLEMENTATION_PLAN, {
    variables: { 
      month: searchPeriod === 'month' ? selectedMonth : null,
      startDate: searchPeriod === 'week' ? selectedWeek.start.format('YYYY-MM-DD') : null,
      endDate: searchPeriod === 'week' ? selectedWeek.end.format('YYYY-MM-DD') : null,
      reservationId: selectedReservation?.id
    },
    fetchPolicy: 'network-only'
  });
  
  // Program categories query for dynamic table headers
  const { 
    loading: loadingProgramCategories, 
    error: errorProgramCategories, 
    data: programCategoriesData 
  } = useQuery(GET_PROGRAM_CATEGORIES, {
    fetchPolicy: 'cache-first'
  });
  
  // Debug program categories query results
  React.useEffect(() => {
    console.log("개요데이터 - 프로그램 카테고리 쿼리 상태:", {
      loading: loadingProgramCategories,
      error: errorProgramCategories,
      data: programCategoriesData
    });
    
    if (programCategoriesData?.programCategories) {
      console.log("개요데이터 - 가져온 프로그램 카테고리:", programCategoriesData.programCategories);
    }
  }, [loadingProgramCategories, errorProgramCategories, programCategoriesData]);
  
  // Get sorted program categories for table headers
  const sortedCategories = React.useMemo(() => {
    if (!programCategoriesData?.programCategories) return [];
    return [...programCategoriesData.programCategories].sort((a, b) => a.display_order - b.display_order);
  }, [programCategoriesData]);
  
  // Debug implementation plan query results
  React.useEffect(() => {
    console.log("개요데이터 - 구현 계획 쿼리 상태:", {
      loading: loadingImplementationPlan,
      error: errorImplementationPlan,
      data: implementationPlanData,
      variables: {
        month: searchPeriod === 'month' ? selectedMonth : null,
        startDate: searchPeriod === 'week' ? selectedWeek.start.format('YYYY-MM-DD') : null,
        endDate: searchPeriod === 'week' ? selectedWeek.end.format('YYYY-MM-DD') : null,
        reservationId: selectedReservation?.id
      }
    });
  }, [loadingImplementationPlan, errorImplementationPlan, implementationPlanData, searchPeriod, selectedMonth, selectedWeek, selectedReservation]);
  
  // Handler for period type change
  const handlePeriodChange = (event) => {
    setSearchPeriod(event.target.value);
  };
  
  // Handler for month selection
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };
  
  // Handler for week selection
  const handleWeekChange = (event) => {
    const [start, end] = event.target.value.split(',');
    setSelectedWeek({
      start: moment(start),
      end: moment(end)
    });
  };
  
  // Handler for reservation selection
  const handleReservationChange = (event) => {
    const reservationId = parseInt(event.target.value);
    if (!reservationId) {
      setSelectedReservation(null);
      return;
    }
    
    const reservation = reservationListData.getPage1List.find(r => r.id === reservationId);
    setSelectedReservation(reservation);
  };
  
  // Select default reservation on data load
  useEffect(() => {
    if (reservationListData?.getPage1List) {
      const currentDate = moment();
      const upcomingReservations = reservationListData.getPage1List
        .filter(reservation => moment(reservation.end_date).isSameOrAfter(currentDate))
        .sort((a, b) => moment(a.start_date).diff(moment(b.start_date)));
        
      if (upcomingReservations.length > 0 && !selectedReservation) {
        setSelectedReservation(upcomingReservations[0]);
      }
    }
  }, [reservationListData, selectedReservation]);

  // Refetch data when search parameters change
  useEffect(() => {
    if (refetchImplementationPlan) {
      // In week mode, we show all organizations, so set reservationId to null
      const reservationIdToUse = searchPeriod === 'week' ? null : selectedReservation?.id;
      
      refetchImplementationPlan({
        month: searchPeriod === 'month' ? selectedMonth : null,
        startDate: searchPeriod === 'week' ? selectedWeek.start.format('YYYY-MM-DD') : null,
        endDate: searchPeriod === 'week' ? selectedWeek.end.format('YYYY-MM-DD') : null,
        reservationId: reservationIdToUse
      });
    }
  }, [searchPeriod, selectedMonth, selectedWeek, selectedReservation, refetchImplementationPlan]);

  // Excel export handler
  const handleExportExcel = () => {
    try {
      // Get the actual data being displayed on screen
      const data = actualImplementationData || [];
      
      if (data.length === 0) {
        showAlert('내보낼 데이터가 없습니다.', 'warning');
        return;
      }
      
      // Get the date range for the filename
      const startDate = searchPeriod === 'month' 
        ? moment(selectedMonth).startOf('month').format('YYYY-MM-DD')
        : selectedWeek.start.format('YYYY-MM-DD');
        
      const endDate = searchPeriod === 'month'
        ? moment(selectedMonth).endOf('month').format('YYYY-MM-DD')
        : selectedWeek.end.format('YYYY-MM-DD');
      
      // Export to Excel with actual screen data
      exportImplementationPlan(data, {
        period: searchPeriod,
        selectedMonth,
        selectedWeek,
        startDate,
        endDate
      });
      
      showAlert('엑셀 파일이 성공적으로 다운로드되었습니다.', 'success');
      
    } catch (error) {
      console.error('Excel export error:', error);
      showAlert('엑셀 파일 생성 중 오류가 발생했습니다.', 'error');
    }
  };

  // PDF export handler
  const handlePdfExport = async () => {
    setLoading(true);
    
    try {
      const data = actualImplementationData || []; // Use actual screen data
      
      if (data.length === 0) {
        showAlert('PDF로 내보낼 데이터가 없습니다.', 'warning');
        setLoading(false);
        return;
      }

      // Get the table container element by ID
      const tableElement = document.getElementById('implementation-plan-container');
      if (!tableElement) {
        showAlert('테이블을 찾을 수 없습니다.', 'error');
        setLoading(false);
        return;
      }

      try {
        // Create canvas from the table element with high quality settings
        const canvas = await html2canvas(tableElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          foreignObjectRendering: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with landscape orientation for better table display
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a3' // Use A3 for better table visibility
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate scaling to fit width
        const ratio = pdfWidth / imgWidth;
        const pdfImageHeight = imgHeight * ratio;

        let heightLeft = pdfImageHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
        heightLeft -= pdfHeight;

        // Add additional pages if content is longer than one page
        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
          heightLeft -= pdfHeight;
        }

        // Generate filename based on search period
        const fileName = searchPeriod === 'month' 
          ? `하이힐링원_프로그램시행계획_${moment(selectedMonth).format('YYYYMM')}.pdf`
          : `하이힐링원_프로그램시행계획_${selectedWeek.start.format('YYYYMMDD')}_${selectedWeek.end.format('YYYYMMDD')}.pdf`;
            
        pdf.save(fileName);
        
        setLoading(false);
        showAlert('PDF 파일이 다운로드 되었습니다.', 'success');
        
      } catch (canvasError) {
        console.error('Canvas generation error:', canvasError);
        setLoading(false);
        showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
      }
      
    } catch (error) {
      console.error('PDF export error:', error);
      setLoading(false);
      showAlert('PDF 파일 생성 중 오류가 발생했습니다.', 'error');
    }
  };

  // Helper function to process actual reservation data for implementation plan
  const processReservationData = (reservations) => {
    console.log("=== processReservationData 함수 시작 ===");
    console.log("입력 reservations:", reservations);
    
    return reservations.map((reservation, index) => {
      console.log(`개요데이터 - 예약 ${index + 1} 처리 시작:`, reservation.group_name);
      
      console.log(`개요데이터 - 예약 ${index + 1} region 필드 상세:`, {
        region: reservation.region,
        region_type: typeof reservation.region,
        region_empty: !reservation.region,
        all_fields: Object.keys(reservation)
      });
      
      const startDate = moment(reservation.start_date);
      const endDate = moment(reservation.end_date);
      const duration = endDate.diff(startDate, 'days') + 1;
      
      console.log(`개요데이터 - 예약 ${index + 1} 기간:`, {
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        duration: duration
      });
      
      // Get participant counts from page2
      let totalMale = 0;
      let totalFemale = 0;
      let totalLeaders = 0;
      let maleLeaders = 0;
      let femaleLeaders = 0;
      let participantType = '';
      let programInfo = [];
      
      console.log(`개요데이터 - 예약 ${index + 1} page2_reservations:`, reservation.page2_reservations);
      
      if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
        reservation.page2_reservations.forEach((page2, page2Index) => {
          console.log(`개요데이터 - 예약 ${index + 1} page2[${page2Index}]:`, page2);
          
          totalMale += page2.male_count || 0;
          totalFemale += page2.female_count || 0;
          maleLeaders += page2.male_leader_count || 0;
          femaleLeaders += page2.female_leader_count || 0;
          totalLeaders += (page2.male_leader_count || 0) + (page2.female_leader_count || 0);
          
          console.log(`개요데이터 - 예약 ${index + 1} page2[${page2Index}] 인원 정보:`, {
            male_count: page2.male_count,
            female_count: page2.female_count,
            male_leader_count: page2.male_leader_count,
            female_leader_count: page2.female_leader_count,
            part_type: page2.part_type
          });
          
          // Get participant type from page2
          if (page2.part_type && !participantType) {
            participantType = page2.part_type;
            console.log(`개요데이터 - 예약 ${index + 1} 참가자 유형 설정:`, participantType);
          }
          
          // Collect program information
          console.log(`개요데이터 - 예약 ${index + 1} page2[${page2Index}] programs:`, page2.programs);
          if (page2.programs && page2.programs.length > 0) {
            page2.programs.forEach((program, programIndex) => {
              console.log(`개요데이터 - 예약 ${index + 1} page2[${page2Index}] program[${programIndex}]:`, program);
              programInfo.push({
                type: program.category_name || program.program_name || '일반 프로그램',
                instructor: program.instructor_name || '강사 미정',
                price: program.price || 0,
                duration: program.duration || 1
              });
            });
          }
        });
      }
      
      console.log(`개요데이터 - 예약 ${index + 1} 집계된 인원 정보:`, {
        totalMale,
        totalFemale,
        maleLeaders,
        femaleLeaders,
        totalLeaders,
        participantType,
        programCount: programInfo.length
      });
      
      // Get accommodation and meal info from page3
      let accommodations = [];
      let mealInfo = [];
      const accommodationInfo = {
        totalRooms: 0,
        totalOccupancy: 0,
      };
      
      // Initialize meal plans data for dynamic meal table headers
      let mealPlansData = [];
      let uniqueMealHeaders = [];
      
      console.log(`개요데이터 - 예약 ${index + 1} page3:`, reservation.page3);
      
      if (reservation.page3) {
        // Process room selections
        console.log(`개요데이터 - 예약 ${index + 1} page3 room_selections:`, reservation.page3.room_selections);
        if (reservation.page3.room_selections && reservation.page3.room_selections.length > 0) {
          accommodations = reservation.page3.room_selections;
          accommodationInfo.totalRooms = reservation.page3.room_selections.length;
          accommodationInfo.totalOccupancy = reservation.page3.room_selections.reduce(
            (sum, room) => sum + (room.occupancy || 0),
            0
          );
        }
        
        // Process meal plans data for dynamic meal table headers
        if (reservation.page3 && reservation.page3.meal_plans && reservation.page3.meal_plans.length > 0) {
          console.log(`개요데이터 - 예약 ${index + 1} meal_plans 데이터:`, reservation.page3.meal_plans);
          
          // Process meal plans
          mealPlansData = reservation.page3.meal_plans.map(meal => {
            const processedMeal = {
              date: meal.date,
              meal_type: meal.meal_type,
              meal_option: meal.meal_option,
              participants: meal.participants || 0,
              price: meal.price || 0
            };
            console.log(`개요데이터 - 예약 ${index + 1} 처리된 meal:`, processedMeal);
            return processedMeal;
          });
          
          console.log(`개요데이터 - 예약 ${index + 1} 최종 mealPlansData:`, mealPlansData);
          
          // Create unique meal headers sorted by date and meal type order
          const mealTypeOrder = { 'breakfast': 1, 'lunch': 2, 'dinner': 3 };
          const mealTypeLabels = { 
            'breakfast': '조식', 
            'lunch': '중식', 
            'dinner': '석식',
            'breakfast_regular': '조식',
            'lunch_regular': '중식',
            'dinner_regular': '석식',
            'breakfast_special': '조식',
            'lunch_special': '중식',
            'dinner_special': '석식'
          };
          
          // Group meals by date
          const mealsByDate = {};
          mealPlansData.forEach(meal => {
            if (!mealsByDate[meal.date]) {
              mealsByDate[meal.date] = [];
            }
            mealsByDate[meal.date].push(meal);
          });
          
          console.log(`개요데이터 - 예약 ${index + 1} mealsByDate:`, mealsByDate);
          
          // Sort dates and create headers
          const sortedDates = Object.keys(mealsByDate).sort();
          console.log(`개요데이터 - 예약 ${index + 1} sortedDates:`, sortedDates);
          
          sortedDates.forEach((date, dayIndex) => {
            const dayNumber = dayIndex + 1;
            const mealsForDate = mealsByDate[date].sort((a, b) => 
              (mealTypeOrder[a.meal_type] || 999) - (mealTypeOrder[b.meal_type] || 999)
            );
            
            console.log(`개요데이터 - 예약 ${index + 1} ${date} (${dayNumber}일) 식사:`, mealsForDate);
            
            mealsForDate.forEach(meal => {
              // 더 유연한 meal_type 처리
              const getMealLabel = (mealType) => {
                if (mealTypeLabels[mealType]) {
                  return mealTypeLabels[mealType];
                }
                // 기본적인 타입 추출 (예: breakfast_regular -> breakfast)
                const basicType = mealType.split('_')[0];
                return mealTypeLabels[basicType] || '식사';
              };
              
              const mealLabel = getMealLabel(meal.meal_type);
              const header = {
                key: `${date}_${meal.meal_type}`,
                label: `${dayNumber}일/${mealLabel}`,
                date: date,
                meal_type: meal.meal_type,
                dayNumber: dayNumber
              };
              uniqueMealHeaders.push(header);
              console.log(`개요데이터 - 예약 ${index + 1} 생성된 헤더:`, header);
            });
          });
        } else {
          console.log(`개요데이터 - 예약 ${index + 1} page3.meal_plans가 없음 - 기본 식사 계획 생성하지 않음`);
        }
        }
      
      console.log(`개요데이터 - 예약 ${index + 1} 식사 헤더:`, uniqueMealHeaders);
        
        // Process meal plans
      console.log(`개요데이터 - 예약 ${index + 1} page3 meal_plans:`, reservation.page3?.meal_plans);
      if (reservation.page3 && reservation.page3.meal_plans && reservation.page3.meal_plans.length > 0) {
          reservation.page3.meal_plans.forEach((meal, mealIndex) => {
            console.log(`개요데이터 - 예약 ${index + 1} page3 meal[${mealIndex}]:`, meal);
            mealInfo.push({
              type: meal.meal_type || 'lunch',
              date: meal.date,
              count: meal.participants || totalMale + totalFemale,
              menu: meal.menu || '일반식',
              cost_per_person: meal.cost_per_person || 6000 // 기본 6천원
            });
          });
        } else {
          console.log(`개요데이터 - 예약 ${index + 1} 기본 식사 계획 생성 시작 (duration: ${duration})`);
          // Generate default meal plan if none exists based on duration
          for (let i = 0; i < duration; i++) {
            const currentDate = startDate.clone().add(i, 'days');
            
            // 첫날: 중식, 석식 (조식 제외)
            if (i === 0) {
              mealInfo.push({
                type: 'lunch',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '중식',
                cost_per_person: 6000
              });
              mealInfo.push({
                type: 'dinner',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '석식',
                cost_per_person: 6000
              });
            }
            // 중간일: 조식, 중식, 석식
            else if (i < duration - 1) {
              mealInfo.push({
                type: 'breakfast',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '조식',
                cost_per_person: 6000
              });
              mealInfo.push({
                type: 'lunch',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '중식',
                cost_per_person: 6000
              });
              mealInfo.push({
                type: 'dinner',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '석식',
                cost_per_person: 6000
              });
            }
            // 마지막날: 조식, 중식만 (석식 제외)
            else {
              mealInfo.push({
                type: 'breakfast',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '조식',
                cost_per_person: 6000
              });
              mealInfo.push({
                type: 'lunch',
                date: currentDate.format('YYYY-MM-DD'),
                count: totalMale + totalFemale,
                menu: '중식',
                cost_per_person: 6000
              });
            }
          }
          console.log(`개요데이터 - 예약 ${index + 1} 생성된 기본 식사 계획:`, mealInfo);
      }
      
      console.log(`개요데이터 - 예약 ${index + 1} 숙박/식사 정보:`, {
        accommodations,
        mealInfo
      });
      
      // Get additional info from page4 if available
      let facilitiesInfo = {};
      console.log(`개요데이터 - 예약 ${index + 1} page4_reservations:`, reservation.page4_reservations);
      if (reservation.page4_reservations && reservation.page4_reservations.length > 0) {
        const page4 = reservation.page4_reservations[0]; // 첫 번째 page4 데이터 사용
        console.log(`개요데이터 - 예약 ${index + 1} page4 데이터:`, page4);
        facilitiesInfo = {
          special_requests: page4.special_requests || '',
          equipment_needs: page4.equipment_needs || '',
          accessibility_needs: page4.accessibility_needs || '',
          additional_services: page4.additional_services || '',
          emergency_contact: page4.emergency_contact || '',
          insurance_info: page4.insurance_info || ''
        };
      }
      
      // Calculate budget breakdown with more accurate data
      const calculateBudget = () => {
        const totalParticipants = totalMale + totalFemale;
        const instructorFee = programInfo.reduce((sum, program) => sum + (program.price || 200), 0);
        const transportFee = 0; // Will be calculated based on location
        const dailyAllowance = 50; // 50천원
        const mealCost = mealInfo.length > 0 
          ? mealInfo.reduce((sum, meal) => sum + (meal.count * (meal.cost_per_person || 6000) / 1000), 0) // 천원 단위로 계산
          : totalParticipants * 6 * (duration - 1) * 3; // 3 meals per day
        const accommodationCost = totalParticipants * 5 * (duration - 1); // 5천원 per person per night
        const experienceCost = totalParticipants * 10; // 10천원 per person
        const contingency = Math.round((instructorFee + mealCost + accommodationCost + experienceCost) * 0.1);
        
        return {
          instructorFee,
          transportFee,
          dailyAllowance,
          mealCost,
          accommodationCost,
          experienceCost,
          contingency,
          total: instructorFee + transportFee + dailyAllowance + mealCost + accommodationCost + experienceCost + contingency
        };
      };
      
      const budget = calculateBudget();
      console.log(`개요데이터 - 예약 ${index + 1} 예산 정보:`, budget);
      
      // Get expense data from pageFinal
      let teacherExpenses = [];
      let participantExpenses = [];
      if (reservation.pageFinal) {
        teacherExpenses = reservation.pageFinal.teacher_expenses || [];
        participantExpenses = reservation.pageFinal.participant_expenses || [];
      }
      
      // Dynamic O/X indicators
      const indicators = {
        program: programInfo.length > 0 ? 'O' : 'X',
        accommodation: accommodations.length > 0 ? 'O' : 'X', 
        meal: mealInfo.length > 0 ? 'O' : 'X'
      };
      console.log(`개요데이터 - 예약 ${index + 1} O/X 지원종류 표시:`, indicators);
      
      // Return processed data with original reservation reference
      const processedItem = {
        id: reservation.id,
        group_name: reservation.group_name,
        location: reservation.region || '미기재', // page1의 region 필드 사용
        period: `${startDate.format('MM.DD')} ~ ${endDate.format('MM.DD')}`, // Remove duration from here
        duration: `${duration}일`, // Add separate duration field
        participant_days: (totalMale + totalFemale) * duration,
        participants: {
          confirmed: { 
            male: totalMale, 
            female: totalFemale, 
            total: totalMale + totalFemale 
          },
          leaders: {
            male: maleLeaders,
            female: femaleLeaders,
            total: totalLeaders
          },
          waiting: {
            total: 0 // TODO: Add waiting list data if available
          },
          total: {
            male: totalMale + maleLeaders,
            female: totalFemale + femaleLeaders,
            total: totalMale + totalFemale + totalLeaders
          }
        },
        indicators: {
          mine_area: reservation.is_mine_area || false,
          voucher: reservation.business_category === 'forest_education',
          disability: false, // TODO: Add disability info if available
          multicultural: false // TODO: Add multicultural info if available
        },
        participant_type: participantType || '일반',
        business_category: reservation.business_category,
        business_subcategory: reservation.business_subcategory,
        business_detail_category: reservation.business_detail_category,
        accommodations: accommodations,
        meals: mealInfo,
        budget: calculateBudget(),
        // 원본 예약 데이터 보존 (프로그램 계산용)
        originalReservation: reservation,
        accommodationInfo: accommodationInfo,
        mealPlansData,
        uniqueMealHeaders,
        teacherExpenses,
        participantExpenses,
      };
      
      console.log(`개요데이터 - 예약 ${index + 1} 최종 처리 결과:`, processedItem);
      
      return processedItem;
    });
  };

  // Helper function to get location from business category
  const getLocationFromBusinessCategory = (category) => {
    const locationMap = {
      'social_contribution': '사회공헌',
      'profit_business': '수익사업',
      'forest_education': '산림교육',
      'group': '단체',
      'individual': '개인',
      'family': '가족'
    };
    return locationMap[category] || '기타';
  };

  // Get processed data from actual reservations
  const getFilteredReservations = () => {
    console.log("개요데이터 - getFilteredReservations 시작");
    console.log("개요데이터 - reservationListData:", reservationListData);
    
    if (!reservationListData?.getPage1List) {
      console.log("개요데이터 - reservationListData.getPage1List가 없음");
      return [];
    }
    
    let filteredReservations = [...reservationListData.getPage1List];
    console.log("개요데이터 - 초기 예약 목록:", filteredReservations);
    
    // Filter by selected period
    console.log("개요데이터 - 검색 조건:", {
      searchPeriod,
      selectedMonth,
      selectedWeek,
      selectedReservation: selectedReservation?.id
    });
    
    if (searchPeriod === 'month') {
      const selectedMonthStart = moment(selectedMonth).startOf('month');
      const selectedMonthEnd = moment(selectedMonth).endOf('month');
      
      console.log("개요데이터 - 월별 필터링:", {
        selectedMonthStart: selectedMonthStart.format('YYYY-MM-DD'),
        selectedMonthEnd: selectedMonthEnd.format('YYYY-MM-DD')
      });
      
      filteredReservations = filteredReservations.filter(reservation => {
        const startDate = moment(reservation.start_date);
        const endDate = moment(reservation.end_date);
        const isInRange = (startDate.isBetween(selectedMonthStart, selectedMonthEnd, null, '[]') ||
                endDate.isBetween(selectedMonthStart, selectedMonthEnd, null, '[]') ||
                (startDate.isBefore(selectedMonthStart) && endDate.isAfter(selectedMonthEnd)));
        
        console.log(`개요데이터 - 예약 ${reservation.id} (${reservation.group_name}) 월별 필터링:`, {
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          isInRange
        });
        
        return isInRange;
      });
    } else if (searchPeriod === 'week') {
      console.log("개요데이터 - 주별 필터링:", {
        selectedWeekStart: selectedWeek.start.format('YYYY-MM-DD'),
        selectedWeekEnd: selectedWeek.end.format('YYYY-MM-DD')
      });
      
      filteredReservations = filteredReservations.filter(reservation => {
        const startDate = moment(reservation.start_date);
        const endDate = moment(reservation.end_date);
        const isInRange = (startDate.isBetween(selectedWeek.start, selectedWeek.end, null, '[]') ||
                endDate.isBetween(selectedWeek.start, selectedWeek.end, null, '[]') ||
                (startDate.isBefore(selectedWeek.start) && endDate.isAfter(selectedWeek.end)));
        
        console.log(`개요데이터 - 예약 ${reservation.id} (${reservation.group_name}) 주별 필터링:`, {
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          isInRange
        });
        
        return isInRange;
      });
    }
    
    // Filter by selected reservation if in month mode
    if (searchPeriod === 'month' && selectedReservation) {
      console.log("개요데이터 - 선택된 예약으로 필터링:", selectedReservation.id);
      filteredReservations = filteredReservations.filter(reservation => {
        const isSelected = reservation.id === selectedReservation.id;
        console.log(`개요데이터 - 예약 ${reservation.id} 선택 필터링:`, isSelected);
        return isSelected;
      });
    }
    
    console.log("개요데이터 - 필터링된 예약 목록:", filteredReservations);
    
    const processedData = processReservationData(filteredReservations);
    console.log("개요데이터 - 최종 처리된 구현 계획 데이터:", processedData);
    
    return processedData;
  };

  // Get the actual implementation data
  const actualImplementationData = getFilteredReservations();
  console.log("개요데이터 - actualImplementationData (화면에 표시될 데이터):", actualImplementationData);
  
  // Debug table totals
  if (actualImplementationData.length > 0) {
    const totals = {
      confirmedMale: actualImplementationData.reduce((sum, item) => sum + item.participants.confirmed.male, 0),
      confirmedFemale: actualImplementationData.reduce((sum, item) => sum + item.participants.confirmed.female, 0),
      confirmedTotal: actualImplementationData.reduce((sum, item) => sum + item.participants.confirmed.total, 0),
      leadersMale: actualImplementationData.reduce((sum, item) => sum + item.participants.leaders.male, 0),
      leadersFemale: actualImplementationData.reduce((sum, item) => sum + item.participants.leaders.female, 0),
      leadersTotal: actualImplementationData.reduce((sum, item) => sum + item.participants.leaders.total, 0),
      waitingTotal: actualImplementationData.reduce((sum, item) => sum + item.participants.waiting.total, 0),
      grandTotal: actualImplementationData.reduce((sum, item) => sum + item.participants.total.total, 0)
    };
    
    console.log("개요데이터 - 테이블 합계 정보:", totals);
    
    // Debug each item's display values
    actualImplementationData.forEach((item, index) => {
      console.log(`개요데이터 - 테이블 행 ${index + 1} (${item.group_name}) 표시 값:`, {
        group_name: item.group_name,
        location: item.location,
        period: item.period,
        participant_days: item.participant_days,
        participants: {
          confirmed: item.participants.confirmed,
          leaders: item.participants.leaders,
          waiting: item.participants.waiting,
          total: item.participants.total
        },
        indicators: item.indicators,
        participant_type: item.participant_type,
        business_category: item.business_category,
        accommodations: item.accommodations,
        meals: item.meals,
        budget: item.budget
      });
    });
  } else {
    console.log("개요데이터 - 표시할 데이터가 없음");
  }

  // Function to get service type text from business category
  const getServiceTypeText = (processedItem) => {
    const businessCategory = processedItem?.business_category;
    const businessSubcategory = processedItem?.business_subcategory;
    const businessDetailCategory = processedItem?.business_detail_category;
    
    // Return the subcategory text if available, otherwise return business category
    if (businessSubcategory) {
      switch(businessSubcategory) {
        case 'group': return '단체';
        case 'forest_education': return '산림교육';
        case 'individual': return '개인고객';
        case 'corporate_csr': return '사회공헌';
        case 'family': return '가족';
        default: return businessSubcategory;
      }
    }
    
    // Fallback to business category
    if (businessCategory === 'social_contribution') return '사회공헌';
    if (businessCategory === 'profit_business') return '수익사업';
    
    return '활동효율'; // Default fallback
  };

  // Function to calculate program data by category for a reservation
  const calculateProgramDataByCategory = (processedItem) => {
    // Use original reservation data for program calculations
    const reservation = processedItem.originalReservation;
    const programs = reservation?.page2_reservations?.[0]?.programs || [];
    const categoryData = {};
    
    console.log(`[ImplementationPlan] 프로그램 데이터 계산 - 예약 ${reservation.id}:`, {
      group_name: reservation.group_name,
      programs_count: programs.length,
      programs: programs.map(p => ({
        category: p.category,
        category_name: p.category_name,
        program_name: p.program_name,
        instructor_name: p.instructor_name,
        assistant_name: p.assistant_name,
        helper_name: p.helper_name,
        participants: p.participants
      }))
    });
    
    // Initialize category data
    sortedCategories.forEach(category => {
      categoryData[category.id] = {
        programCount: 0,
        internalInstructors: new Set(),
        externalInstructors: new Set(), // 보조강사만 포함 (assistant_name)
        helpers: new Set(), // 헬퍼는 별도 관리 (helper_name)
        totalParticipants: 0
      };
    });
    
    // Process each program
    programs.forEach(program => {
      const categoryId = program.category;
      if (categoryId && categoryData[categoryId]) {
        // Count programs
        categoryData[categoryId].programCount += 1;
        
        // Count main instructors as internal
        if (program.instructor_name && program.instructor_name.trim() !== '') {
          categoryData[categoryId].internalInstructors.add(program.instructor_name);
        }
        
        // Count only assistants as external instructors (보조강사)
        if (program.assistant_name && program.assistant_name.trim() !== '') {
          categoryData[categoryId].externalInstructors.add(program.assistant_name);
        }
        
        // Count helpers separately (헬퍼는 외부강사가 아님)
        if (program.helper_name && program.helper_name.trim() !== '') {
          categoryData[categoryId].helpers.add(program.helper_name);
        }
        
        // Add participants count
        const participants = parseInt(program.participants) || 0;
        categoryData[categoryId].totalParticipants += participants;
      }
    });
    
    // Convert Sets to counts and log results
    Object.keys(categoryData).forEach(categoryId => {
      const category = sortedCategories.find(c => c.id.toString() === categoryId.toString());
      const categoryName = category?.category_name || 'Unknown';
      
      categoryData[categoryId].internalInstructorCount = categoryData[categoryId].internalInstructors.size;
      categoryData[categoryId].externalInstructorCount = categoryData[categoryId].externalInstructors.size; // 보조강사만
      categoryData[categoryId].helperCount = categoryData[categoryId].helpers.size; // 헬퍼 수
      categoryData[categoryId].totalInstructorCount = categoryData[categoryId].internalInstructorCount + categoryData[categoryId].externalInstructorCount;
      
      console.log(`[ImplementationPlan] 카테고리 ${categoryName} (ID: ${categoryId}) 집계:`, {
        programCount: categoryData[categoryId].programCount,
        internalInstructors: Array.from(categoryData[categoryId].internalInstructors),
        externalInstructors: Array.from(categoryData[categoryId].externalInstructors), // 보조강사
        helpers: Array.from(categoryData[categoryId].helpers), // 헬퍼
        totalParticipants: categoryData[categoryId].totalParticipants
      });
    });
    
    return categoryData;
  };

  // Function to get program data for a specific category and reservation
  const getProgramDataForCategory = (processedItem, categoryId, dataType) => {
    const programData = calculateProgramDataByCategory(processedItem);
    const categoryData = programData[categoryId] || {};
    
    switch(dataType) {
      case 'program':
        return categoryData.programCount || 0;
      case 'internal':
        return categoryData.internalInstructorCount || 0;
      case 'external':
        return categoryData.externalInstructorCount || 0;
      case 'participants':
        // If no specific participant data, use total participants divided by number of programs
        if (categoryData.totalParticipants > 0) {
          return categoryData.totalParticipants;
        }
        // Fallback: use total reservation participants for this category
        const reservation = processedItem.originalReservation;
        const totalReservationParticipants = reservation?.page2_reservations?.[0]?.total_count || 
                                           processedItem.participants.confirmed.total || 0;
        const totalPrograms = Object.values(programData).reduce((sum, cat) => sum + cat.programCount, 0);
        return totalPrograms > 0 && categoryData.programCount > 0 ? 
          Math.ceil((totalReservationParticipants * categoryData.programCount) / totalPrograms) : 0;
      default:
        return 0;
    }
  };

  // Function to calculate totals for a row
  const calculateRowTotal = (processedItem, dataType) => {
    let total = 0;
    sortedCategories.forEach(category => {
      total += getProgramDataForCategory(processedItem, category.id, dataType);
    });
    return total;
  };

  // Helper function to get meal data for specific date and meal type
  const getMealDataForHeader = (processedItem, headerKey) => {
    console.log(`[getMealDataForHeader] 처리 중 - 단체: ${processedItem.group_name}, headerKey: ${headerKey}`);
    console.log(`[getMealDataForHeader] mealPlansData:`, processedItem.mealPlansData);
    
    if (!processedItem.mealPlansData || processedItem.mealPlansData.length === 0) {
      console.log(`[getMealDataForHeader] mealPlansData가 없음 - 0 반환`);
      return { participants: 0, leaders: 0, total: 0 };
    }
    
    const [date, mealType] = headerKey.split('_');
    console.log(`[getMealDataForHeader] 찾는 조건 - date: ${date}, mealType: ${mealType}`);
    
    const meal = processedItem.mealPlansData.find(m => {
      console.log(`[getMealDataForHeader] 비교 중 - meal.date: ${m.date}, meal.meal_type: ${m.meal_type}`);
      return m.date === date && m.meal_type === mealType;
    });
    
    if (meal) {
      const participants = meal.participants || 0;
      const leaders = Math.ceil(participants / 10); // Assume 1 leader per 10 participants
      const total = participants + leaders;
      
      console.log(`[getMealDataForHeader] 찾은 식사 데이터:`, {
        date: meal.date,
        meal_type: meal.meal_type,
        participants,
        leaders,
        total
      });
      
      return { participants, leaders, total };
    }
    
    console.log(`[getMealDataForHeader] 해당하는 식사 데이터 없음 - 0 반환`);
    return { participants: 0, leaders: 0, total: 0 };
  };

  // Get all unique meal headers across all reservations
  const getAllUniqueMealHeaders = () => {
    const allHeaders = [];
    const headerMap = new Map();
    
    actualImplementationData.forEach(item => {
      if (item.uniqueMealHeaders) {
        item.uniqueMealHeaders.forEach(header => {
          if (!headerMap.has(header.key)) {
            headerMap.set(header.key, header);
            allHeaders.push(header);
          }
        });
      }
    });
    
    // Sort headers by day number and meal type
    const mealTypeOrder = { 'breakfast': 1, 'lunch': 2, 'dinner': 3 };
    return allHeaders.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) {
        return a.dayNumber - b.dayNumber;
      }
      return (mealTypeOrder[a.meal_type] || 999) - (mealTypeOrder[b.meal_type] || 999);
    });
  };

  return (
    <Page6Layout
      title="프로그램 시행계획"
      icon={<PeopleIcon fontSize="large" />}
      activeTab="implementation-plan"
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 0 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Period type selection */}
          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth>
              <InputLabel>조회 기간</InputLabel>
              <Select
                value={searchPeriod}
                onChange={handlePeriodChange}
                label="조회 기간"
              >
                <MenuItem value="month">월별</MenuItem>
                <MenuItem value="week">주별</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Month selection - shown only when period type is 'month' */}
          {searchPeriod === 'month' && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>월 선택</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  label="월 선택"
                >
                  {generateMonthOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {/* Week selection - shown only when period type is 'week' */}
          {searchPeriod === 'week' && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>주 선택</InputLabel>
                <Select
                  value={`${selectedWeek.start.format('YYYY-MM-DD')},${selectedWeek.end.format('YYYY-MM-DD')}`}
                  onChange={handleWeekChange}
                  label="주 선택"
                >
                  {generateWeekOptions().map((option) => (
                    <MenuItem 
                      key={`${option.value.start}-${option.value.end}`} 
                      value={`${option.value.start},${option.value.end}`}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {/* 단체 선택 (주별 검색일 때는 표시하지 않음) */}
          {searchPeriod === 'month' && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <Autocomplete
                  value={selectedReservation || null}
                  onChange={(event, newValue) => {
                    setSelectedReservation(newValue);
                  }}
                  options={reservationListData?.getPage1List || []}
                  getOptionLabel={(option) => `${option.group_name} (${formatDate(option.start_date)}~${formatDate(option.end_date)})`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="단체 선택"
                      placeholder="전체 보기"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingReservationList ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  loading={loadingReservationList}
                  disabled={loadingReservationList}
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
          )}
          
          {/* 주별 검색일 때 설명 표시 */}
          {searchPeriod === 'week' && (
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ width: '100%' }}>
                주간 검색에서는 선택한 주의 모든 단체 정보가 표시됩니다.
              </Alert>
            </Grid>
          )}
          
          <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined" 
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => refetchImplementationPlan()}
              sx={{ mr: 1, whiteSpace: 'nowrap' }}
            >
              새로고침
            </Button>
            
            {/* PDF Download button */}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PictureAsPdfIcon />}
              onClick={handlePdfExport}
              sx={{ whiteSpace: 'nowrap' }}
              disabled={isLoading}
            >
              PDF 다운로드
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error message */}
      {errorImplementationPlan && (
        <Alert severity="error" sx={{ mb: 3 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}
      
      {/* Main Implementation Plan Table matching the image exactly */}
      <Paper id="implementation-plan-container" elevation={3} sx={{ mb: 3, borderRadius: 0 }}>
        <Box sx={{ p: 1 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            {moment().format('YYYY년 M월')} 프로그램 시행(안)
                    </Typography>
       

          {/* First Table - Program Overview */}
          <Box sx={{ display: 'flex', mb: 4 }}>
            {/* Horizontal text label */}
            <Box sx={{ 
              border: '1px solid black',
              backgroundColor: '#f5f5f5',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              width: '110px',
              minWidth: '110px',
              borderRadius: 0
            }}>
              프로그램<br />시행개요
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', mx: 0, borderRadius: 0 }}>
              <Table size="small" sx={{ border: '2px solid black', width: '100%', tableLayout: 'fixed', minWidth: '100%', borderRadius: 0 }}>
                <TableHead>
                  {/* First Header Row */}
                  <TableRow>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0,
                      width: '10%'
                    }}>
                      단체명
                    </TableCell>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      지역
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      참여일자 및 기간
                    </TableCell>
                    <TableCell colSpan={7} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      참여자수(명)
                    </TableCell>
                    <TableCell colSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      지원종류
                    </TableCell>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      참가자<br />유형*
                    </TableCell>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0,
                      whiteSpace: 'nowrap'
                    }}>
                      사업종류
                    </TableCell>
                  </TableRow>
                  
                  {/* Second Header Row */}
                  <TableRow>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      참여일자
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      체류기간
                    </TableCell>
                    <TableCell colSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      참여자(명)
                    </TableCell>
                    <TableCell colSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      인솔자(명)
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      합계
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      프로그램
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      숙박
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      식사
                    </TableCell>
                  </TableRow>
                  
                  {/* Third Header Row */}
                  <TableRow>
                    <TableCell align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      남
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      여
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      계
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      남
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      여
                    </TableCell>
                    <TableCell align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      계
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actualImplementationData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.group_name}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.location}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.period}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.duration}
                      </TableCell>
                
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.confirmed.male}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.confirmed.female}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.confirmed.total}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.leaders.male}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.leaders.female}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.leaders.total}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participants.total.total}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.indicators.program || 'O'}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.indicators.accommodation || 'O'}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.indicators.meal || 'O'}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {item.participant_type}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        {translateBusinessCategory(item.business_category)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      합계
                    </TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}>-</TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}>-</TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      0
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.confirmed.male, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.confirmed.female, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.confirmed.total, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.leaders.male, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.leaders.female, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.leaders.total, 0)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.participants.total.total, 0)}
                    </TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9', borderRadius: 0 }}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
                  
    

          {/* Second Table - Program Operation */}
          <Box sx={{ display: 'flex', mb: 4 }}>
            {/* Horizontal text label */}
            <Box sx={{ 
              border: '1px solid black',
              backgroundColor: '#f5f5f5',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              width: '110px',
              minWidth: '110px',
              borderRadius: 0
            }}>
              프로그램<br />운영
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', mx: 0, borderRadius: 0 }}>
              <Table size="small" sx={{ border: '2px solid black', width: '100%', tableLayout: 'fixed', minWidth: '100%', borderRadius: 0 }}>
                        <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      단체명
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      서비스유형
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      프로그램 구분
                    </TableCell>
                    {/* Dynamic program category headers */}
                    {sortedCategories.map((category) => (
                      <TableCell key={category.id} rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                        {category.category_name}
                    </TableCell>
                    ))}
                    <TableCell rowSpan={2} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      계
                    </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                  {actualImplementationData.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <TableRow>
                        <TableCell rowSpan={4} sx={{ 
                          border: '1px solid black', 
                          fontSize: '0.8rem',
                          verticalAlign: 'middle',
                          fontWeight: 'bold',
                          borderRadius: 0
                        }}>
                          {item.group_name}
                              </TableCell>
                        <TableCell rowSpan={4} align="center" sx={{ 
                          border: '1px solid black', 
                          fontSize: '0.8rem',
                          verticalAlign: 'middle',
                          fontWeight: 'bold',
                          borderRadius: 0
                        }}>
                          {getServiceTypeText(item)}
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        프로그램(개)
                        </TableCell>
                        {/* Dynamic program category cells for 프로그램 row */}
                        {sortedCategories.map((category) => (
                          <TableCell key={`program-${item.id}-${category.id}`} align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                            {getProgramDataForCategory(item, category.id, 'program')}
                        </TableCell>
                        ))}
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {calculateRowTotal(item, 'program')}
                        </TableCell>
                            </TableRow>
                            <TableRow>
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        내부강사(명)
                        </TableCell>
                        {/* Dynamic program category cells for 내부강사 row */}
                        {sortedCategories.map((category) => (
                          <TableCell key={`internal-${item.id}-${category.id}`} align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                            {getProgramDataForCategory(item, category.id, 'internal')}
                        </TableCell>
                        ))}
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {calculateRowTotal(item, 'internal')}
                        </TableCell>
                            </TableRow>
                      <TableRow>
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        외부강사(명)
                        </TableCell>
                        {/* Dynamic program category cells for 외부강사 row */}
                        {sortedCategories.map((category) => (
                          <TableCell key={`external-${item.id}-${category.id}`} align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                            {getProgramDataForCategory(item, category.id, 'external')}
                        </TableCell>
                        ))}
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {calculateRowTotal(item, 'external')}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          인원(명)
                        </TableCell>
                        {/* Dynamic program category cells for 인원 row */}
                        {sortedCategories.map((category) => (
                          <TableCell key={`participants-${item.id}-${category.id}`} align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                            {getProgramDataForCategory(item, category.id, 'participants')}
                        </TableCell>
                        ))}
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {calculateRowTotal(item, 'participants')}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  
          {/* Third Table - 객실 및 식사 */}
          <Box sx={{ display: 'flex', mb: 4 }}>
            {/* Horizontal text label */}
            <Box sx={{ 
              border: '1px solid black',
              backgroundColor: '#f5f5f5',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              width: '110px',
              minWidth: '110px',
              borderRadius: 0
            }}> 
              객실 및 식사
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', mx: 0, borderRadius: 0 }}>
              <Table size="small" sx={{ border: '2px solid black', width: '100%', tableLayout: 'fixed', minWidth: '100%', borderRadius: 0 }}>
                        <TableHead>
                  <TableRow>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      단체명
                    </TableCell>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      구분
                    </TableCell>
                    <TableCell rowSpan={3} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      객실
                    </TableCell>
                    <TableCell colSpan={getAllUniqueMealHeaders().length + 1} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      borderRadius: 0
                    }}>
                      식사
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {/* Individual meal headers without grouping */}
                    {getAllUniqueMealHeaders().map((header) => (
                      <TableCell key={header.key} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                        {header.label}
                    </TableCell>
                    ))}
                    <TableCell rowSpan={1} align="center" sx={{ 
                      border: '1px solid black', 
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      borderRadius: 0
                    }}>
                      합계
                    </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                  {actualImplementationData.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <TableRow>
                        <TableCell rowSpan={2} sx={{ 
                          border: '1px solid black', 
                          fontSize: '0.8rem',
                          verticalAlign: 'middle',
                          fontWeight: 'bold',
                          borderRadius: 0
                        }}>
                          {item.group_name}
                        </TableCell>
                        <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          인원(명)
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {item.accommodationInfo.totalOccupancy}
                        </TableCell>
                        {(() => {
                          const headers = getAllUniqueMealHeaders();
                          const groupedData = [];
                          for (let i = 0; i < headers.length; i++) {
                            const mealData = getMealDataForHeader(item, headers[i].key);
                            groupedData.push(
                              <TableCell key={headers[i].key} align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                                {mealData.total}
                        </TableCell>
                            );
                          }
                          return groupedData;
                        })()}
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {getAllUniqueMealHeaders().reduce((sum, header) => {
                            const mealData = getMealDataForHeader(item, header.key);
                            return sum + mealData.total;
                          }, 0)}
                        </TableCell>
                            </TableRow>
                      <TableRow>
                        <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          객실(실)
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                          {item.accommodationInfo.totalRooms}
                        </TableCell>
                        {(() => {
                          const headers = getAllUniqueMealHeaders();
                          const groupedCells = [];
                          for (let i = 0; i < headers.length; i++) {
                            groupedCells.push(
                              <TableCell key={i} sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        </TableCell>
                            );
                          }
                          return groupedCells;
                        })()}
                        <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                            <TableRow>
                            <TableCell rowSpan={2} sx={{ 
                          border: '1px solid black', 
                          fontSize: '0.8rem',
                          verticalAlign: 'middle',
                          fontWeight: 'bold',
                          borderRadius: 0
                    }}>
                      합계
                    </TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                      인원(명)
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.accommodationInfo.totalOccupancy, 0)}
                    </TableCell>
                    {(() => {
                      const headers = getAllUniqueMealHeaders();
                      const groupedTotals = [];
                      for (let i = 0; i < headers.length; i++) {
                        const total = actualImplementationData.reduce((sum, item) => {
                          const mealData = getMealDataForHeader(item, headers[i].key);
                          return sum + mealData.total;
                        }, 0);
                        groupedTotals.push(
                          <TableCell key={headers[i].key} align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                            {total}
                    </TableCell>
                          );
                      }
                      return groupedTotals;
                    })()}
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => {
                        return sum + getAllUniqueMealHeaders().reduce((mealSum, header) => {
                          const mealData = getMealDataForHeader(item, header.key);
                          return mealSum + mealData.total;
                        }, 0);
                      }, 0)}
                    </TableCell>
                            </TableRow>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                      객실(실)
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderRadius: 0 }}>
                      {actualImplementationData.reduce((sum, item) => sum + item.accommodationInfo.totalRooms, 0)}
                    </TableCell>
                    {(() => {
                      const headers = getAllUniqueMealHeaders();
                      const groupedCells = [];
                      for (let i = 0; i < headers.length; i++) {
                        groupedCells.push(
                          <TableCell key={i} sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                    </TableCell>
                        );
                      }
                      return groupedCells;
                    })()}
                    <TableCell sx={{ border: '1px solid black', fontSize: '0.8rem', borderRadius: 0 }}>
                    </TableCell>
                  </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  
          {/* Fourth Section - 기타 특이사항, 프로그램 관련 사항 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              border: '1px solid black',
              backgroundColor: '#f5f5f5',
              p: 1,
              borderRadius: 0
            }}>
              기타 특이사항, 보고가 필요한 사항
                      </Typography>

            {/* Text Area for additional notes */}
            <Box sx={{ 
              border: '1px solid black',
              minHeight: '150px',
              p: 2,
              mb: 4,
              backgroundColor: '#ffffff',
              borderRadius: 0
            }}>
              {/* Empty text area - can be filled with actual content if needed */}
                    </Box>

            {/* Dynamic Budget section */}
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ 
                border: '1px solid black',
                backgroundColor: '#f5f5f5',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                width: '110px',
                minWidth: '110px',
                borderRadius: 0
              }}>
                예산금액
              </Box>
              
              <Box sx={{ width: '100%' }}>
                {actualImplementationData.map((item, index) => {
                  // --- Expense Aggregation Logic ---
                  const aggregateExpenses = (expenses, type) => {
                    const categoryOrder = type === 'teacher' 
                      ? ['강사비', '교통비', '보조강사비']
                      : ['숙박비', '식사비', '재료비', '기타비', '예비비'];

                    const aggregated = categoryOrder.map(categoryName => ({
                      category: categoryName,
                      amount: 0,
                      details: new Set()
                    }));

                    const expenseMap = new Map();
                    aggregated.forEach(agg => expenseMap.set(agg.category, agg));

                    // Filter for actual expenses (is_planned is false or not present)
                    const actualExpenses = (expenses || []).filter(expense => !expense.is_planned);

                    actualExpenses.forEach(expense => {
                      if (expenseMap.has(expense.category)) {
                        const existing = expenseMap.get(expense.category);
                        existing.amount += expense.amount || 0;
                        if (expense.details) {
                          existing.details.add(expense.details);
                        }
                      }
                    });

                    return Array.from(expenseMap.values()).map(exp => ({
                      ...exp,
                      details: Array.from(exp.details).join(', ')
                    }));
                  };

                  const aggregatedTeacherExpenses = aggregateExpenses(item.teacherExpenses, 'teacher');
                  const aggregatedParticipantExpenses = aggregateExpenses(item.participantExpenses, 'participant');
                  
                  const allExpenses = [
                    { type: '강사비', expenses: aggregatedTeacherExpenses },
                    { type: '참가자', expenses: aggregatedParticipantExpenses }
                  ];

                  const totalAmount = allExpenses.reduce((sum, group) => 
                    sum + group.expenses.reduce((groupSum, exp) => groupSum + exp.amount, 0), 0);

                  return (
                  <Box key={item.id} sx={{ mb: index === actualImplementationData.length - 1 ? 0 : 2 }}>
                    <Typography variant="body1" align="center" sx={{ 
                      fontWeight: 'bold',
                      border: '1px solid black',
                      backgroundColor: '#f5f5f5',
                      p: 1,
                      borderRadius: 0
                    }}>
                      {item.group_name}
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0 }}>
                      <Table size="small" sx={{ border: '1px solid black', borderRadius: 0 }}>
                        <TableHead>
                          <TableRow>
                              <TableCell align="center" sx={{ border: '1px solid black', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '10%' }}>항목</TableCell>
                              <TableCell align="center" sx={{ border: '1px solid black', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '15%' }}>산출내역</TableCell>
                              <TableCell align="center" sx={{ border: '1px solid black', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '15%' }}>금액(천원)</TableCell>
                              <TableCell align="center" sx={{ border: '1px solid black', backgroundColor: '#f5f5f5', fontWeight: 'bold', width: '60%' }}>비고</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                            {allExpenses.map((group, groupIndex) => (
                              <React.Fragment key={groupIndex}>
                                {group.expenses.map((expense, expenseIndex) => (
                                  <TableRow key={`${group.type}-${expense.category}`}>
                                    {expenseIndex === 0 && (
                                      <TableCell rowSpan={group.expenses.length} sx={{ border: '1px solid black', verticalAlign: 'middle', fontWeight: 'bold' }}>
                                        {group.type}
                            </TableCell>
                                    )}
                                    <TableCell sx={{ border: '1px solid black' }}>{expense.category}</TableCell>
                                    <TableCell align="right" sx={{ border: '1px solid black' }}>{expense.amount ? expense.amount.toLocaleString() : '0'}</TableCell>
                                    <TableCell sx={{ border: '1px solid black' }}>{expense.details}</TableCell>
                          </TableRow>
                                ))}
                              </React.Fragment>
                            ))}
                          <TableRow>
                              <TableCell colSpan={2} align="center" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                              합계
                            </TableCell>
                              <TableCell align="right" sx={{ border: '1px solid black', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                                {totalAmount.toLocaleString()}
                            </TableCell>
                              <TableCell sx={{ border: '1px solid black', backgroundColor: '#f9f9f9' }}></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  );
                })}
        </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Page6Layout>
  );
};

export default ImplementationPlanTab; 