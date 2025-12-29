import React, { useState } from 'react';
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
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import moment from 'moment';
import 'moment/locale/ko';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { GET_PAGE5_RESERVATION_LIST } from './graphql/queries';
import Page5Layout from './components/Page5Layout';
import TableChartIcon from '@mui/icons-material/TableChart';

moment.locale('ko');

// Utility function to format price with thousands separator
const formatPrice = (price) => {
  if (!price || price === 0) return '';
  return `${(price * 1000).toLocaleString('ko-KR')}원`;
};

const ReservationStatusTab = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [pdfLoading, setPdfLoading] = useState(false);

  console.log("결과디버깅 - 컴포넌트 렌더링:", {
    selectedYear,
    selectedMonth,
    currentYear,
    currentMonth
  });

  const { loading, error, data } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (queryData) => {
      console.log("결과디버깅 - GraphQL 쿼리 완료:", queryData);
      console.log("결과디버깅 - getPage1List 길이:", queryData?.getPage1List?.length || 0);
      if (queryData?.getPage1List) {
        queryData.getPage1List.forEach((item, index) => {
          console.log(`결과디버깅 - GraphQL 결과[${index}]:`, {
            id: item.id,
            group_name: item.group_name,
            start_date: item.start_date,
            business_category: item.business_category,
            page2_reservations_count: item.page2_reservations?.length || 0,
            page3_exists: !!item.page3
          });
        });
      }
    },
    onError: (queryError) => {
      console.error("결과디버깅 - GraphQL 쿼리 오류:", queryError);
    }
  });

  const handleSearch = () => {
    // Data is already fetched, filtering is done on the client side
  };

  const handlePdfDownload = async () => {
    setPdfLoading(true);
    const tableElement = document.getElementById('status-table');
    if (tableElement) {
      try {
        const canvas = await html2canvas(tableElement, {
            scale: 2,
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a2',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = pdfWidth / imgWidth;
        const pdfImageHeight = imgHeight * ratio;

        let heightLeft = pdfImageHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${selectedYear}년_${selectedMonth}월_예약현황.pdf`);
      } catch (e) {
        console.error("Error generating PDF", e);
      }
    }
    setPdfLoading(false);
  };
  
  const processData = (reservations) => {
    console.log("결과디버깅 - 전체 예약 데이터:", reservations);
    
    const monthStart = moment(`${selectedYear}-${selectedMonth}-01`);
    const daysInMonth = monthStart.daysInMonth();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const date = monthStart.clone().add(i, 'days');
      return {
        date,
        day: date.date(),
        dayOfWeek: date.format('ddd'),
        am: [],
        pm: [],
      };
    });

    console.log("결과디버깅 - 선택된 년월:", selectedYear, selectedMonth);
    console.log("결과디버깅 - 일별 데이터 초기화:", dailyData.length, "일");

    if (reservations) {
      reservations.forEach((res, resIndex) => {
        console.log(`결과디버깅 - 예약 ${resIndex + 1}:`, {
          id: res.id,
          group_name: res.group_name,
          start_date: res.start_date,
          end_date: res.end_date,
          business_category: res.business_category,
          total_count: res.total_count,
          page2_reservations: res.page2_reservations?.length || 0,
          page3: !!res.page3
        });
        
        const start = moment(res.start_date);
        const end = moment(res.end_date);
        
        console.log(`결과디버깅 - 예약 ${resIndex + 1} 날짜 체크:`, {
          start_year: start.year(),
          start_month: start.month() + 1,
          end_year: end.year(),
          end_month: end.month() + 1,
          selected_year: selectedYear,
          selected_month: selectedMonth,
          start_date: start.format('YYYY-MM-DD'),
          end_date: end.format('YYYY-MM-DD')
        });
        
        // Check if reservation period overlaps with selected month
        const monthStartDate = moment(`${selectedYear}-${selectedMonth}-01`);
        const monthEndDate = monthStartDate.clone().endOf('month');
        
        const reservationOverlapsMonth = start.isSameOrBefore(monthEndDate) && end.isSameOrAfter(monthStartDate);
        
        console.log(`결과디버깅 - 예약 ${resIndex + 1} 월 겹침 확인:`, {
          monthStartDate: monthStartDate.format('YYYY-MM-DD'),
          monthEndDate: monthEndDate.format('YYYY-MM-DD'),
          reservationOverlapsMonth
        });
        
        if (reservationOverlapsMonth) {
            // Calculate total participants and leaders from page2_reservations
            let totalParticipants = 0;
            let totalLeaders = 0;
            
            console.log(`결과디버깅 - 예약 ${resIndex + 1} page2_reservations:`, res.page2_reservations);
            
            if (res.page2_reservations && res.page2_reservations.length > 0) {
                res.page2_reservations.forEach((page2, page2Index) => {
                    console.log(`결과디버깅 - 예약 ${resIndex + 1} page2[${page2Index}]:`, {
                        total_count: page2.total_count,
                        total_leader_count: page2.total_leader_count,
                        male_count: page2.male_count,
                        female_count: page2.female_count,
                        male_leader_count: page2.male_leader_count,
                        female_leader_count: page2.female_leader_count
                    });
                    
                    totalParticipants += page2.total_count || 0;
                    totalLeaders += page2.total_leader_count || 0;
                });
            }
            
            const totalPeople = totalParticipants + totalLeaders;
            
            console.log(`결과디버깅 - 예약 ${resIndex + 1} 인원 계산:`, {
                totalParticipants,
                totalLeaders,
                totalPeople,
                business_category: res.business_category
            });
            
            // Determine paid/free based on business_category
            let paidCount = 0;
            let freeCount = 0;
            
            console.log("계산로직입니다 - 유료/무료 분류 시작:", {
                예약ID: res.id,
                기관명: res.group_name,
                사업구분: res.business_category,
                총참가자수: totalParticipants,
                총리더수: totalLeaders,
                총인원: totalPeople
            });
            
            if (res.business_category === 'profit_business') {
                paidCount = totalPeople;
                freeCount = 0;
                console.log("계산로직입니다 - 수익사업으로 분류:", { 유료: paidCount, 무료: freeCount });
            } else if (res.business_category === 'social_contribution') {
                paidCount = 0;
                freeCount = totalPeople;
                console.log("계산로직입니다 - 사회공헌으로 분류:", { 유료: paidCount, 무료: freeCount });
            } else {
                // Default case - if no business_category specified, treat as paid
                paidCount = totalPeople;
                freeCount = 0;
                console.log("계산로직입니다 - 기본값(유료)으로 분류:", { 유료: paidCount, 무료: freeCount });
            }
            
            console.log(`결과디버깅 - 예약 ${resIndex + 1} 유료/무료 분류:`, {
                business_category: res.business_category,
                paidCount,
                freeCount
            });
            
            // [수정] 날짜별 객실/식사/대관 데이터 미리 계산
            const roomsByDate = new Map();
            if (res.page3 && res.page3.room_selections) {
                res.page3.room_selections.forEach(room => {
                    const checkIn = moment(room.check_in_date);
                    const checkOut = moment(room.check_out_date);
                    let currentRoomDate = checkIn.clone();
                    while (currentRoomDate.isBefore(checkOut, 'day')) {
                        const dateStr = currentRoomDate.format('YYYY-MM-DD');
                        if (!roomsByDate.has(dateStr)) {
                            roomsByDate.set(dateStr, { standard: 0, deluxe: 0 });
                        }
                        const dataForDate = roomsByDate.get(dateStr);
                        if (room.room_type === '디럭스') {
                            dataForDate.deluxe += 1;
                        } else {
                            dataForDate.standard += 1;
                        }
                        currentRoomDate.add(1, 'day');
                    }
                });
            }
            console.log(`계산로직입니다 - 예약 ${resIndex + 1} 날짜별 객실:`, roomsByDate);

            // 날짜별 대관 데이터 계산
            const venueRentalsByDate = new Map();
            if (res.page3 && res.page3.place_reservations) {
                res.page3.place_reservations.forEach(place => {
                    const reservationDate = place.reservation_date;
                    if (reservationDate) {
                        const dateStr = moment(reservationDate).format('YYYY-MM-DD');
                        if (!venueRentalsByDate.has(dateStr)) {
                            venueRentalsByDate.set(dateStr, []);
                        }
                        venueRentalsByDate.get(dateStr).push({
                            place_name: place.place_name,
                            start_time: place.start_time,
                            end_time: place.end_time,
                            purpose: place.purpose,
                            participants: place.participants
                        });
                    }
                });
            }
            console.log(`계산로직입니다 - 예약 ${resIndex + 1} 날짜별 대관:`, venueRentalsByDate);

            const mealsByDate = new Map();
            if (res.page3 && res.page3.meal_plans) {
                res.page3.meal_plans.forEach(meal => {
                    const dateStr = moment(meal.date).format('YYYY-MM-DD');
                    if (!mealsByDate.has(dateStr)) {
                        mealsByDate.set(dateStr, { breakfast: 0, lunch: 0, dinner: 0 });
                    }
                    const dataForDate = mealsByDate.get(dateStr);
                    const participants = meal.participants || 0;
                    if (meal.meal_type === 'breakfast') {
                        dataForDate.breakfast += participants;
                    } else if (meal.meal_type === 'lunch' || meal.meal_type === 'lunch_box') {
                        dataForDate.lunch += participants;
                    } else if (meal.meal_type === 'dinner' || meal.meal_type === 'dinner_special_a' || meal.meal_type === 'dinner_special_b') {
                        dataForDate.dinner += participants;
                    }
                });
            }
            console.log(`계산로직입니다 - 예약 ${resIndex + 1} 날짜별 식사:`, mealsByDate);
            
            // Process programs by date - each program only appears on its specific date
            const programsByDate = new Map();
            
            if (res.page2_reservations && res.page2_reservations.length > 0) {
                res.page2_reservations.forEach((page2, page2Index) => {
                    if (page2.programs && page2.programs.length > 0) {
                        page2.programs.forEach((program, progIndex) => {
                            if (program.date) {
                                const programDate = moment(program.date).format('YYYY-MM-DD');
                                const programMoment = moment(programDate);
                                
                                console.log(`결과디버깅 - 예약 ${resIndex + 1} page2[${page2Index}] 프로그램[${progIndex}]:`, {
                                    program_name: program.program_name,
                                    date: program.date,
                                    formatted_date: programDate,
                                    start_time: program.start_time,
                                    end_time: program.end_time
                                });
                                
                                // Check if program date is within selected month
                                if (programMoment.year() === selectedYear && programMoment.month() + 1 === selectedMonth) {
                                    if (!programsByDate.has(programDate)) {
                                        programsByDate.set(programDate, []);
                                    }
                                    
                                    programsByDate.get(programDate).push({
                                        name: program.program_name,
                                        place: program.place_name || program.place,
                                        time: `${moment(program.start_time, 'HH:mm:ss').format('HH:mm')}~${moment(program.end_time, 'HH:mm:ss').format('HH:mm')}`,
                                        instructor: program.instructor_name || program.instructor,
                                        start_time: program.start_time,
                                    });
                                }
                            }
                        });
                    }
                });
            }

            console.log(`결과디버깅 - 예약 ${resIndex + 1} 날짜별 프로그램:`, programsByDate);

            // Add reservation data to each day it spans, but programs only on their specific dates
            const reservationStartInMonth = moment.max(start, monthStartDate);
            const reservationEndInMonth = moment.min(end, monthEndDate);
            
            console.log(`결과디버깅 - 예약 ${resIndex + 1} 월 내 기간:`, {
                reservationStartInMonth: reservationStartInMonth.format('YYYY-MM-DD'),
                reservationEndInMonth: reservationEndInMonth.format('YYYY-MM-DD')
            });
            
            // Add reservation to all days within the period
            let currentDate = reservationStartInMonth.clone();
            while (currentDate.isSameOrBefore(reservationEndInMonth)) {
                const dayIndex = currentDate.date() - 1;
                const currentDateStr = currentDate.format('YYYY-MM-DD');
                
                console.log(`결과디버깅 - 예약 ${resIndex + 1} ${currentDate.date()}일 처리 중`);
                
                if (dailyData[dayIndex]) {
                    // [수정] 미리 계산된 날짜별 데이터 사용
                    const dailyRoomData = roomsByDate.get(currentDateStr) || { standard: 0, deluxe: 0 };
                    const dailyMealData = mealsByDate.get(currentDateStr) || { breakfast: 0, lunch: 0, dinner: 0 };
                    const dailyVenueData = venueRentalsByDate.get(currentDateStr) || [];

                    console.log(`계산로직입니다 - ${currentDateStr}일 데이터 가져오기:`, { dailyRoomData, dailyMealData, dailyVenueData });

                    const dayPrograms = programsByDate.get(currentDateStr) || [];
                    const amPrograms = dayPrograms.filter(p => moment(p.start_time, 'HH:mm:ss').hour() < 12);
                    const pmPrograms = dayPrograms.filter(p => moment(p.start_time, 'HH:mm:ss').hour() >= 12);
                    
                    let dataAddedForDay = false;

                    const hasAmActivity = amPrograms.length > 0 || dayPrograms.length === 0;
                    if (hasAmActivity) {
                        // 대관 정보 생성 (해당 날짜의 실제 대관 데이터 기반)
                        const venueInfo = dailyVenueData.map(venue => ({
                            place_name: venue.place_name || '',
                            time: venue.start_time && venue.end_time ? `${venue.start_time}~${venue.end_time}` : '',
                            purpose: venue.purpose || '',
                            participants: venue.participants || ''
                        }));

                        const amProcessedRes = {
                            groupName: res.group_name,
                            paid: paidCount,
                            free: freeCount,
                            rooms: dailyRoomData,
                            meals: dailyMealData,
                            programs: amPrograms,
                            venueInfo: venueInfo,
                            notes: res.notes
                        };
                        console.log("계산로직입니다 - 오전 데이터 추가:", {
                            날짜: currentDateStr,
                            기관명: res.group_name,
                            유료: paidCount,
                            무료: freeCount,
                            스탠다드: dailyRoomData.standard,
                            디럭스: dailyRoomData.deluxe,
                            조식: dailyMealData.breakfast,
                            중식: dailyMealData.lunch,
                            석식: dailyMealData.dinner,
                            프로그램수: amPrograms.length
                        });
                        dailyData[dayIndex].am.push(amProcessedRes);
                        dataAddedForDay = true;
                        console.log(`결과디버깅 - 예약 ${resIndex + 1} ${currentDate.date()}일 오전 데이터 추가:`, amProcessedRes);
                    }

                    if (pmPrograms.length > 0) {
                        // 대관 정보 생성 (AM에서 이미 표시된 경우 중복 방지)
                        const pmVenueInfo = !dataAddedForDay ? dailyVenueData.map(venue => ({
                            place_name: venue.place_name || '',
                            time: venue.start_time && venue.end_time ? `${venue.start_time}~${venue.end_time}` : '',
                            purpose: venue.purpose || '',
                            participants: venue.participants || ''
                        })) : [];

                        const pmProcessedRes = {
                            groupName: res.group_name,
                            paid: dataAddedForDay ? 0 : paidCount,
                            free: dataAddedForDay ? 0 : freeCount,
                            rooms: dataAddedForDay ? { standard: 0, deluxe: 0 } : dailyRoomData,
                            meals: dataAddedForDay ? { breakfast: 0, lunch: 0, dinner: 0 } : dailyMealData,
                            programs: pmPrograms,
                            venueInfo: pmVenueInfo,
                            notes: res.notes
                        };
                        console.log("계산로직입니다 - 오후 데이터 추가:", {
                            날짜: currentDateStr,
                            기관명: res.group_name,
                            유료: pmProcessedRes.paid,
                            무료: pmProcessedRes.free,
                            스탠다드: pmProcessedRes.rooms.standard,
                            디럭스: pmProcessedRes.rooms.deluxe,
                            조식: pmProcessedRes.meals.breakfast,
                            중식: pmProcessedRes.meals.lunch,
                            석식: pmProcessedRes.meals.dinner,
                            프로그램수: pmPrograms.length,
                            중복방지: dataAddedForDay
                        });
                        dailyData[dayIndex].pm.push(pmProcessedRes);
                        console.log(`결과디버깅 - 예약 ${resIndex + 1} ${currentDate.date()}일 오후 데이터 추가:`, pmProcessedRes);
                    }
                }
                
                currentDate.add(1, 'day');
            }
        }
      });
    }

    console.log("결과디버깅 - 최종 일별 데이터:", dailyData);
    return dailyData;
  };
  
  const cellStyle = {
    border: '1px solid black',
    textAlign: 'center',
    padding: '4px',
    fontSize: '11px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    minWidth: '60px',
  };

  const headerCellStyle = { 
    ...cellStyle, 
    backgroundColor: '#e0e0e0', 
    fontWeight: 'bold', 
    whiteSpace: 'nowrap',
    minWidth: '80px',
  };
  const subTotalCellStyle = { ...cellStyle, backgroundColor: '#f0f0f0' };
  const weekendStyle = (dayOfWeek) => {
      if (dayOfWeek === '토') return { color: 'blue' };
      if (dayOfWeek === '일') return { color: 'red' };
      return {};
  };

  if (loading) {
    console.log("결과디버깅 - 로딩 중...");
    return <CircularProgress />;
  }

  if (error) {
    console.error("결과디버깅 - 오류 발생:", error);
    return <Alert severity="error">Error loading data.</Alert>;
  }

  console.log("결과디버깅 - 데이터 처리 시작:", data);
  const reservationData = processData(data.getPage1List);
  console.log("결과디버깅 - 처리된 예약 데이터:", reservationData);
  
  const renderRows = () => {
    console.log("결과디버깅 - renderRows 시작, reservationData:", reservationData);
    
    const rows = [];
    const renderedGroupsForPaidFree = new Set(); // To track groups for which paid/free has been rendered

    reservationData.forEach((dayData, dayIndex) => {
        console.log(`결과디버깅 - ${dayData.day}일 데이터 처리:`, {
            day: dayData.day,
            dayOfWeek: dayData.dayOfWeek,
            amCount: dayData.am.length,
            pmCount: dayData.pm.length,
            amData: dayData.am,
            pmData: dayData.pm
        });
        
        const amSubtotal = { paid: 0, free: 0, standard: 0, deluxe: 0, breakfast: 0, lunch: 0, dinner: 0 };
        const pmSubtotal = { paid: 0, free: 0, standard: 0, deluxe: 0, breakfast: 0, lunch: 0, dinner: 0 };

        console.log(`계산로직입니다 - ${dayData.day}일 소계 계산 시작:`, {
            오전데이터수: dayData.am.length,
            오후데이터수: dayData.pm.length
        });

        dayData.am.forEach((r, amIndex) => {
            console.log(`계산로직입니다 - ${dayData.day}일 오전[${amIndex}] 소계 누적:`, {
                기관명: r.groupName, 유료: r.paid, 무료: r.free,
                스탠다드: r.rooms.standard, 디럭스: r.rooms.deluxe,
                조식: r.meals.breakfast, 중식: r.meals.lunch, 석식: r.meals.dinner
            });
            // 중복 항목은 유료/무료 인원을 소계에 포함하지 않음
            if (!renderedGroupsForPaidFree.has(r.groupName)) {
                amSubtotal.paid += r.paid;
                amSubtotal.free += r.free;
            }
            amSubtotal.standard += r.rooms.standard;
            amSubtotal.deluxe += r.rooms.deluxe;
            amSubtotal.breakfast += r.meals.breakfast;
            amSubtotal.lunch += r.meals.lunch;
            amSubtotal.dinner += r.meals.dinner;
        });
        
        console.log(`계산로직입니다 - ${dayData.day}일 오전 소계 완료:`, amSubtotal);
        
        dayData.pm.forEach((r, pmIndex) => {
            console.log(`계산로직입니다 - ${dayData.day}일 오후[${pmIndex}] 소계 누적:`, {
                기관명: r.groupName, 유료: r.paid, 무료: r.free,
                스탠다드: r.rooms.standard, 디럭스: r.rooms.deluxe,
                조식: r.meals.breakfast, 중식: r.meals.lunch, 석식: r.meals.dinner
            });
            // 중복 항목은 유료/무료 인원을 소계에 포함하지 않음 (오후 데이터는 당일 중복도 이미 0으로 처리됨)
            if (!renderedGroupsForPaidFree.has(r.groupName)) {
                pmSubtotal.paid += r.paid;
                pmSubtotal.free += r.free;
            }
            pmSubtotal.standard += r.rooms.standard;
            pmSubtotal.deluxe += r.rooms.deluxe;
            pmSubtotal.breakfast += r.meals.breakfast;
            pmSubtotal.lunch += r.meals.lunch;
            pmSubtotal.dinner += r.meals.dinner;
        });

        console.log(`계산로직입니다 - ${dayData.day}일 오후 소계 완료:`, pmSubtotal);

        const dayTotal = {
            paid: amSubtotal.paid + pmSubtotal.paid,
            free: amSubtotal.free + pmSubtotal.free,
            standard: amSubtotal.standard + pmSubtotal.standard,
            deluxe: amSubtotal.deluxe + pmSubtotal.deluxe,
            breakfast: amSubtotal.breakfast + pmSubtotal.breakfast,
            lunch: amSubtotal.lunch + pmSubtotal.lunch,
            dinner: amSubtotal.dinner + pmSubtotal.dinner,
        };

        console.log(`계산로직입니다 - ${dayData.day}일 최종 소계:`, {
            유료: dayTotal.paid, 무료: dayTotal.free, 스탠다드: dayTotal.standard,
            디럭스: dayTotal.deluxe, 조식: dayTotal.breakfast, 중식: dayTotal.lunch, 석식: dayTotal.dinner
        });

        // Calculate row spans - ensure minimum 1 row per time period for layout consistency
        const amProgramRows = dayData.am.length > 0 ? 
            dayData.am.reduce((acc, res) => acc + Math.max(1, res.programs?.length || 1), 0) : 1;
        const pmProgramRows = dayData.pm.length > 0 ? 
            dayData.pm.reduce((acc, res) => acc + Math.max(1, res.programs?.length || 1), 0) : 1;
        
        const amSectionRows = Math.max(1, amProgramRows);
        const pmSectionRows = Math.max(1, pmProgramRows);
        const dayTotalRows = amSectionRows + pmSectionRows;
        
        console.log(`결과디버깅 - ${dayData.day}일 행 계산:`, {
            amProgramRows, pmProgramRows, amSectionRows, pmSectionRows, dayTotalRows
        });
        
        let isFirstRowOfDay = true;

        // AM Rows
        if (dayData.am.length > 0) {
            dayData.am.forEach((res, resIdx) => {
                console.log(`결과디버깅 - ${dayData.day}일 오전[${resIdx}] 렌더링:`, res);
                
                const programs = res.programs?.length > 0 ? res.programs : [{}];
                const numProgramRows = programs.length;

                programs.forEach((program, progIdx) => {
                    console.log(`결과디버깅 - ${dayData.day}일 오전[${resIdx}] 프로그램[${progIdx}]:`, program);
                    
                    rows.push(
                        <TableRow key={`${dayData.day}-am-${resIdx}-${progIdx}`}>
                            {isFirstRowOfDay && progIdx === 0 && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.day}</TableCell>}
                            {isFirstRowOfDay && progIdx === 0 && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.dayOfWeek}</TableCell>}
                            {resIdx === 0 && progIdx === 0 && <TableCell rowSpan={amSectionRows} sx={cellStyle}>오전</TableCell>}
                            
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.groupName || ''}</TableCell>}
                            {progIdx === 0 && (() => {
                                if (renderedGroupsForPaidFree.has(res.groupName)) {
                                    return <TableCell rowSpan={numProgramRows} sx={{ ...cellStyle, color: 'text.secondary', textAlign: 'center' }} colSpan={2}>중복 항목</TableCell>;
                                }
                                renderedGroupsForPaidFree.add(res.groupName);
                                return (
                                    <>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.paid !== undefined ? res.paid : 0}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.free !== undefined ? res.free : 0}</TableCell>
                                    </>
                                );
                            })()}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.rooms?.standard !== undefined ? res.rooms.standard : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.rooms?.deluxe !== undefined ? res.rooms.deluxe : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.meals?.breakfast !== undefined ? res.meals.breakfast : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.meals?.lunch !== undefined ? res.meals.lunch : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.meals?.dinner !== undefined ? res.meals.dinner : 0}</TableCell>}

                            <TableCell sx={cellStyle}>{program.name || ''}</TableCell>
                            <TableCell sx={cellStyle}>{program.place || ''}</TableCell>
                            <TableCell sx={cellStyle}>{program.time || ''}</TableCell>
                            <TableCell sx={cellStyle}>{program.instructor || ''}</TableCell>

                            {progIdx === 0 && (() => {
                                const firstVenue = res.venueInfo && res.venueInfo.length > 0 ? res.venueInfo[0] : {};
                                return (
                                    <>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.place_name || ''}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.time || ''}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.purpose || ''}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.participants || ''}</TableCell>
                                    </>
                                );
                            })()}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.notes || ''}</TableCell>}
                        </TableRow>
                    );
                });
                if (isFirstRowOfDay) isFirstRowOfDay = false;
            });
        } else {
            console.log(`결과디버깅 - ${dayData.day}일 오전 데이터 없음, 빈 행 추가`);
            rows.push(
                <TableRow key={`${dayData.day}-am-empty`}>
                    {isFirstRowOfDay && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.day}</TableCell>}
                    {isFirstRowOfDay && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.dayOfWeek}</TableCell>}
                    <TableCell sx={cellStyle}>오전</TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                </TableRow>
            );
            if (isFirstRowOfDay) isFirstRowOfDay = false;
        }

        // PM Rows
        if (dayData.pm.length > 0) {
            dayData.pm.forEach((res, resIdx) => {
                console.log(`결과디버깅 - ${dayData.day}일 오후[${resIdx}] 렌더링:`, res);
                
                const programs = res.programs?.length > 0 ? res.programs : [{}];
                const numProgramRows = programs.length;

                programs.forEach((program, progIdx) => {
                    console.log(`결과디버깅 - ${dayData.day}일 오후[${resIdx}] 프로그램[${progIdx}]:`, program);
                    
                    rows.push(
                        <TableRow key={`${dayData.day}-pm-${resIdx}-${progIdx}`}>
                            {isFirstRowOfDay && progIdx === 0 && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.day}</TableCell>}
                            {isFirstRowOfDay && progIdx === 0 && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.dayOfWeek}</TableCell>}
                            {resIdx === 0 && progIdx === 0 && <TableCell rowSpan={pmSectionRows} sx={cellStyle}>오후</TableCell>}
                            
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.groupName || ''}</TableCell>}
                            {progIdx === 0 && (() => {
                                if (renderedGroupsForPaidFree.has(res.groupName)) {
                                    return <TableCell rowSpan={numProgramRows} sx={{ ...cellStyle, color: 'text.secondary', textAlign: 'center' }} colSpan={2}>중복 항목</TableCell>;
                                }
                                renderedGroupsForPaidFree.add(res.groupName);
                                return (
                                    <>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.paid !== undefined ? res.paid : 0}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.free !== undefined ? res.free : 0}</TableCell>
                                    </>
                                );
                            })()}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.rooms?.standard !== undefined ? res.rooms.standard : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.rooms?.deluxe !== undefined ? res.rooms.deluxe : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.meals?.breakfast !== undefined ? res.meals.breakfast : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.meals?.lunch !== undefined ? res.meals.lunch : 0}</TableCell>}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.meals?.dinner !== undefined ? res.meals.dinner : 0}</TableCell>}

                            <TableCell sx={cellStyle}>{program.name || ''}</TableCell>
                            <TableCell sx={cellStyle}>{program.place || ''}</TableCell>
                            <TableCell sx={cellStyle}>{program.time || ''}</TableCell>
                            <TableCell sx={cellStyle}>{program.instructor || ''}</TableCell>

                            {progIdx === 0 && (() => {
                                const firstVenue = res.venueInfo && res.venueInfo.length > 0 ? res.venueInfo[0] : {};
                                return (
                                    <>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.place_name || ''}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.time || ''}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.purpose || ''}</TableCell>
                                        <TableCell rowSpan={numProgramRows} sx={cellStyle}>{firstVenue.participants || ''}</TableCell>
                                    </>
                                );
                            })()}
                            {progIdx === 0 && <TableCell rowSpan={numProgramRows} sx={cellStyle}>{res.notes || ''}</TableCell>}
                        </TableRow>
                    );
                });
                if (isFirstRowOfDay) isFirstRowOfDay = false;
            });
        } else {
            console.log(`결과디버깅 - ${dayData.day}일 오후 데이터 없음, 빈 행 추가`);
             rows.push(
                <TableRow key={`${dayData.day}-pm-empty`}>
                    {isFirstRowOfDay && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.day}</TableCell>}
                    {isFirstRowOfDay && <TableCell rowSpan={dayTotalRows} sx={{...cellStyle, ...weekendStyle(dayData.dayOfWeek)}}>{dayData.dayOfWeek}</TableCell>}
                    <TableCell sx={cellStyle}>오후</TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                    <TableCell sx={cellStyle}></TableCell>
                </TableRow>
            );
            if (isFirstRowOfDay) isFirstRowOfDay = false;
        }
        
        // Subtotal row
        console.log(`결과디버깅 - ${dayData.day}일 소계 행 추가:`, dayTotal);
        rows.push(
            <TableRow key={`${dayData.day}-total`}>
                <TableCell sx={subTotalCellStyle} colSpan={4}>소계</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.paid !== undefined ? dayTotal.paid : 0}</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.free !== undefined ? dayTotal.free : 0}</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.standard !== undefined ? dayTotal.standard : 0}</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.deluxe !== undefined ? dayTotal.deluxe : 0}</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.breakfast !== undefined ? dayTotal.breakfast : 0}</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.lunch !== undefined ? dayTotal.lunch : 0}</TableCell>
                <TableCell sx={subTotalCellStyle}>{dayTotal.dinner !== undefined ? dayTotal.dinner : 0}</TableCell>
                <TableCell sx={subTotalCellStyle} colSpan={9}></TableCell>
            </TableRow>
        );
    });
    
    console.log("결과디버깅 - renderRows 완료, 총 행 수:", rows.length);
    return rows;
  };

  return (
    <Page5Layout title="예약종합현황" icon={<TableChartIcon fontSize="large" />} activeTab="status">
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControl>
              <InputLabel>연도</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label="연도">
                {[...Array(5)].map((_, i) => (
                  <MenuItem key={i} value={currentYear - 2 + i}>{currentYear - 2 + i}년</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <InputLabel>월</InputLabel>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="월">
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}월</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        
          <Grid item>
            <Button variant="outlined" onClick={handlePdfDownload} disabled={pdfLoading}>
                {pdfLoading ? <CircularProgress size={24} /> : 'PDF 다운로드'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" align="center" sx={{ mb: 1 }}>{selectedMonth}월 예약종합현황</Typography>
        <Typography variant="body2" align="right" sx={{ mb: 2 }}>작성일자: {moment().format('YYYY.MM.DD')}</Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table id="status-table" size="small" sx={{ borderRadius: 0 }}>
            <TableHead>
              <TableRow>
                    <TableCell rowSpan={2} sx={{...headerCellStyle, minWidth: '40px'}}>일</TableCell>
                    <TableCell rowSpan={2} sx={{...headerCellStyle, minWidth: '50px'}}>요일</TableCell>
                    <TableCell rowSpan={2} sx={{...headerCellStyle, minWidth: '60px'}}>시간대</TableCell>
                    <TableCell rowSpan={2} sx={{...headerCellStyle, minWidth: '150px'}}>고객유형-개인 or 단체명</TableCell>
                    <TableCell colSpan={2} sx={{...headerCellStyle, minWidth: '80px'}}>고객수</TableCell>
                    <TableCell colSpan={2} sx={{...headerCellStyle, minWidth: '80px'}}>객실수</TableCell>
                    <TableCell colSpan={3} sx={{...headerCellStyle, minWidth: '90px'}}>식수 인원</TableCell>
                    <TableCell colSpan={4} sx={{...headerCellStyle, minWidth: '120px'}}>진행 프로그램</TableCell>
                    <TableCell colSpan={4} sx={{...headerCellStyle, minWidth: '160px'}}>대관</TableCell>
                    <TableCell rowSpan={2} sx={{...headerCellStyle, minWidth: '200px'}}>기타(고객요청사항 및 특이사항 등)</TableCell>
              </TableRow>
              <TableRow>
                    <TableCell sx={{...headerCellStyle, minWidth: '50px'}}>유료</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '50px'}}>무료</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '70px'}}>스탠다드</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '60px'}}>디럭스</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '50px'}}>조식</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '50px'}}>중식</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '50px'}}>석식</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '100px'}}>프로그램명</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '80px'}}>장소</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '80px'}}>시간</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '80px'}}>강사</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '100px'}}>장소명</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '80px'}}>예약시간</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '80px'}}>목적</TableCell>
                    <TableCell sx={{...headerCellStyle, minWidth: '60px'}}>인원</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderRows()}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Page5Layout>
  );
};

export default ReservationStatusTab; 