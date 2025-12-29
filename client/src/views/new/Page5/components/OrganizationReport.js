import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_RESERVATION_LIST, GET_PAGE5_RESERVATION_DETAIL } from '../graphql';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  FormControl,
  TextField
} from '@mui/material';
import Page6Layout from '../../page6/components/Page6Layout';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';
import 'moment/locale/ko'; // Import Korean locale for moment
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { showAlert } from '../services/dataService';
import Autocomplete from '@mui/material/Autocomplete';

moment.locale('ko'); // Set moment to use Korean locale globally

// Helper to safely parse numbers
const safeParseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// JSON 데이터 파싱 함수
const parseJsonData = (jsonData) => {
  if (!jsonData) return [];
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return [];
    }
  }
  return jsonData;
};

const OrganizationReport = () => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef(null);

  // Fetch reservation data
  const { loading: dataLoading, error, data } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching reservations:', error);
      showAlert('예약 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  });

  // Fetch detailed reservation data for selected group
  const { loading: detailLoading, error: detailError, data: detailData } = useQuery(GET_PAGE5_RESERVATION_DETAIL, {
    variables: { id: parseInt(selectedGroupId, 10) },
    skip: !selectedGroupId,
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching reservation detail:', error);
      showAlert('예약 상세 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  });

  // Generate report data when detail data is loaded
  useEffect(() => {
    if (selectedGroupId && detailData && detailData.getPage1ById) {
      generateReportData(detailData.getPage1ById);
      } else {
        setReportData(null);
      }
  }, [selectedGroupId, detailData]);

  // Handle organization selection change
  const handleGroupChange = (event) => {
    setSelectedGroupId(event.target.value);
  };

  // Generate report data from reservation (based on inspection excel logic)
  const generateReportData = (reservation) => {
    if (!reservation) return;

    try {
      setLoading(true);
      
      console.log('Processing reservation data:', reservation);
      
      // Basic reservation info
      const startDate = moment(reservation.start_date);
      const endDate = moment(reservation.end_date);
      const page3Data = reservation.page3 || {};
      const pageFinal = reservation.pageFinal;
      
      // 실제 데이터 구조에 맞게 파싱 (page3는 이미 객체)
      const roomSelections = page3Data.room_selections || [];
      const mealPlans = page3Data.meal_plans || [];
      const placeReservations = page3Data.place_reservations || [];
      
      console.log('Room selections:', roomSelections);
      console.log('Meal plans:', mealPlans);
      console.log('Place reservations:', placeReservations);
      
      // 프로그램 정보 수집 (실제 데이터 구조에 맞게)
      let programs = [];
      if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
        reservation.page2_reservations.forEach(page2 => {
          if (page2.programs && page2.programs.length > 0) {
            programs = [...programs, ...page2.programs];
          }
        });
      }
      
      console.log('Programs:', programs);
      console.log('PageFinal data:', pageFinal);
      
      // Get discount rate function (견적서 로직에 맞게 수정)
      const getDiscountRate = (category) => {
        console.log("할인률 관련 - category:", category, "pageFinal:", pageFinal);
        
        if (!pageFinal) {
          console.log("할인률 관련 - pageFinal 데이터가 없어서 할인율 0 반환");
          return 0; // pageFinal 데이터가 없으면 할인 없음
        }
        
        let discountRate = 0;
        
        if (category === 'room') {
          console.log("할인률 관련 - 객실 할인율 확인");
          // income_items에서 먼저 확인 (판매가 기준)
          const roomIncome = pageFinal.income_items?.find(item => 
            item.category?.includes('숙박')
          );
          if (roomIncome && roomIncome.discount_rate !== null && roomIncome.discount_rate !== undefined) {
            discountRate = roomIncome.discount_rate;
            console.log("할인률 관련 - 객실 할인율 적용(income):", discountRate);
          } else {
            // participant_expenses에서 확인 (실제 비용 기준)
            const roomExpenses = pageFinal.participant_expenses?.find(exp => 
              !exp.is_planned && exp.category?.includes('숙박')
            );
            if (roomExpenses && roomExpenses.discount_rate !== null && roomExpenses.discount_rate !== undefined) {
              discountRate = roomExpenses.discount_rate;
              console.log("할인률 관련 - 객실 할인율 적용(expense):", discountRate);
            }
          }
        } else if (category === 'meal') {
          console.log("할인률 관련 - 식사 할인율 확인");
          // income_items에서 먼저 확인 (판매가 기준)
          const mealIncome = pageFinal.income_items?.find(item => 
            item.category?.includes('식사')
          );
          if (mealIncome && mealIncome.discount_rate !== null && mealIncome.discount_rate !== undefined) {
            discountRate = mealIncome.discount_rate;
            console.log("할인률 관련 - 식사 할인율 적용(income):", discountRate);
          } else {
            // participant_expenses에서 확인 (실제 비용 기준)
            const mealExpenses = pageFinal.participant_expenses?.find(exp => 
              !exp.is_planned && exp.category?.includes('식사')
            );
            if (mealExpenses && mealExpenses.discount_rate !== null && mealExpenses.discount_rate !== undefined) {
              discountRate = mealExpenses.discount_rate;
              console.log("할인률 관련 - 식사 할인율 적용(expense):", discountRate);
            }
          }
        } else if (category === 'program') {
          console.log("할인률 관련 - 프로그램 할인율 확인");
          // income_items에서 확인 (판매가 기준)
          const programIncome = pageFinal.income_items?.find(item => 
            item.category?.includes('프로그램')
          );
          if (programIncome && programIncome.discount_rate !== null && programIncome.discount_rate !== undefined) {
            discountRate = programIncome.discount_rate;
            console.log("할인률 관련 - 프로그램 할인율 적용(income):", discountRate);
          }
        } else if (category === 'etc') {
          console.log("할인률 관련 - 기타 할인율 확인");
          // income_items에서 재료비 할인율 확인
          const materialIncome = pageFinal.income_items?.find(item => 
            item.category?.includes('재료비')
          );
          if (materialIncome && materialIncome.discount_rate !== null && materialIncome.discount_rate !== undefined) {
            discountRate = materialIncome.discount_rate;
            console.log("할인률 관련 - 기타(재료비) 할인율 적용(income):", discountRate);
          }
        }
        
        console.log("할인률 관련 - 최종 할인율 반환:", category, "->", discountRate);
        return discountRate;
      };
      
      // 참가자 수 계산 (사용자 요구사항에 맞게 수정)
      const calculateTotalAttendees = () => {
        let totalParticipants = 0;
        let totalLeaders = 0;
        
        if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
          reservation.page2_reservations.forEach(page2 => {
            totalParticipants += page2.total_count || 0;  // 참가인원
            totalLeaders += page2.total_leader_count || 0; // 인솔인원
          });
        }
        
        return {
          total: totalParticipants + totalLeaders,  // 총 참가자 수 (참가인원 + 인솔인원)
          participants: totalParticipants,          // 참가인원(명)
          staff: totalLeaders                       // 인솔인원(명)
        };
      };
      
      const participantData = calculateTotalAttendees();
      
      console.log('Participant data:', participantData);
      
      // 예상 수주 테이블 데이터 (첫 번째 테이블)
      const expectedOrderData = {
        participants: participantData.total || 0,
        rooms: roomSelections ? roomSelections.length : 0,
        meals: mealPlans ? mealPlans.reduce((sum, meal) => {
          const participants = meal.participants || meal.total_participants || participantData.total || 0;
          return sum + participants;
        }, 0) : 0,
        programs: programs.length || 0,
        places: placeReservations ? placeReservations.length : 0
      };
      
      console.log('Expected order data:', expectedOrderData);
      
      // 객실 데이터 그룹화 함수 (같은 일자, 같은 객실종류별로 그룹화)
      const groupRoomSelections = (roomSelections) => {
        const grouped = {};
        
        roomSelections.forEach(room => {
          const date = moment(room.check_in_date).format('MM월 DD일');
          const roomType = room.room_type || room.room_name;
          const key = `${date}_${roomType}`;
          
          if (!grouped[key]) {
            grouped[key] = {
              date,
              roomType,
              rooms: [],
              totalQuantity: 0,
              totalOccupancy: 0,
              nights: room.nights || 1,
              basePrice: room.price || 0,
              totalSubtotal: 0,
              totalDiscount: 0,
              totalAmount: 0
            };
          }
          
          grouped[key].rooms.push(room);
          grouped[key].totalQuantity += 1; // 객실 수
          grouped[key].totalOccupancy += (room.occupancy || 1); // 총 인원
          
          // 각 객실별 계산
          const baseRoomPrice = room.price || 0;
          const nights = room.nights || 1;
          const occupancy = room.occupancy || 1;
          const capacity = room.capacity || 1;
          
          let subtotal = 0;
          
          if (room.total_price && parseInt(room.total_price) > 0) {
            subtotal = parseInt(room.total_price);
          } else {
            subtotal = baseRoomPrice * nights;
            if (occupancy > capacity) {
              const extraPeople = occupancy - capacity;
              const extraCharge = extraPeople * 10000 * nights;
              subtotal += extraCharge;
            }
          }
          
          const discount = Math.round(subtotal * (roomDiscountRate / 100));
          const total = subtotal - discount;
          
          grouped[key].totalSubtotal += subtotal;
          grouped[key].totalDiscount += discount;
          grouped[key].totalAmount += total;
        });
        
        return Object.values(grouped);
      };

      // 객실 데이터 계산 (그룹화된 로직 적용)
      let roomData = { 
        totalPrice: 0,
        details: [] 
      };
      
      const roomDiscountRate = getDiscountRate('room');
      
      if (roomSelections && roomSelections.length > 0) {
        console.log('OrganizationReport 숙박비 계산 시작 - 총 객실 수:', roomSelections.length);
        
        const groupedRooms = groupRoomSelections(roomSelections);
        
        // 그룹화된 데이터로 details 생성
        groupedRooms.forEach((group) => {
          console.log('OrganizationReport 숙박비 계산 - 그룹화된 객실 정보:', group);
          
          // 전체 합계에 추가
          roomData.totalPrice += group.totalAmount;
          
          // 인원수 초과 여부에 따른 표시
          let occupancyInfo = `${group.totalOccupancy}명`;
          const avgCapacity = Math.round(group.rooms.reduce((sum, room) => sum + (room.capacity || 1), 0) / group.rooms.length);
          if (group.totalOccupancy > avgCapacity * group.totalQuantity) {
            occupancyInfo = `${group.totalOccupancy}명(초과)`;
          }
          
          roomData.details.push({
            roomName: '',
            roomType: group.roomType,
            occupancy: group.totalOccupancy,
            capacity: avgCapacity * group.totalQuantity,
            nights: group.nights,
            unitPrice: group.basePrice,
            totalPrice: group.totalAmount,
            occupancyInfo,
            roomCount: group.totalQuantity,
            date: group.date,
            calculation: `${group.basePrice.toLocaleString()}원 X ${group.totalQuantity}실 X ${group.nights}박 = ${group.totalAmount.toLocaleString()}원(${group.roomType}, ${group.date}, ${occupancyInfo})`
          });
        });
      }
      
      console.log('OrganizationReport 숙박비 계산 - 전체 합계:', roomData.totalPrice);
      
      // 할인 계산 (pageFinal 데이터 기반)
      const roomDiscount = Math.round(roomData.totalPrice * (roomDiscountRate / 100));
      const roomFinalPrice = roomData.totalPrice - roomDiscount;
      
      // 식사 데이터 계산 (실제 데이터 구조 기반)
      let mealData = {
        totalPrice: 0,
        details: []
      };
      
      const mealDiscountRate = getDiscountRate('meal');
      
      if (mealPlans && mealPlans.length > 0) {
        mealPlans.forEach(meal => {
          console.log('Processing meal:', meal);
          
          // 실제 데이터 구조에 맞게 필드 매핑
          const price = safeParseNumber(meal.price || meal.unit_price);
          const participants = meal.participants || meal.total_participants || participantData.total || 0;
          const mealType = meal.meal_type || 'unknown';
          const mealOption = meal.meal_option || '';
          
          console.log('식사 계산 디버깅:', {
            meal_type: mealType,
            원본_price: meal.price,
            파싱된_price: price,
            participants: participants,
            meal_option: mealOption
          });
          
          // 식사 총액 계산 로직
          let totalPrice = 0;
          let unitPrice = 0;
          
          if (participants > 0) {
            unitPrice = Math.round(price / participants);
            totalPrice = unitPrice * participants;
          } else {
            unitPrice = price;
            totalPrice = price;
          }
          
          console.log('식사 계산 결과:', {
            type: mealType,
            unitPrice,
            participants,
            totalPrice,
            calculation: `${unitPrice.toLocaleString()}원 X ${participants}명 X 1식 = ${totalPrice.toLocaleString()}원`
          });
          
          mealData.totalPrice += totalPrice;
          
          // 한국어 식사 타입 변환
          const koreanType = 
            mealType === 'breakfast' ? '조식' : 
            mealType === 'lunch' ? '중식' :
            mealType === 'lunch_box' ? '도시락' :
            mealType === 'dinner' ? '석식' :
            mealType === 'dinner_special_a' ? '특별석식A' :
            mealType === 'dinner_special_b' ? '특별석식B' :
            mealOption || mealType || '기타';
          
          mealData.details.push({
            type: koreanType,
            participants,
            unitPrice,
            totalPrice,
            option: mealOption,
            calculation: `${unitPrice.toLocaleString()}원 X ${participants}명 X 1식 = ${totalPrice.toLocaleString()}원 (${koreanType})`
          });
        });
      }
      
      console.log('Meal data calculated:', mealData);
      console.log('식사 최종 총액:', mealData.totalPrice.toLocaleString() + '원');
      
      // 할인 계산 (pageFinal 데이터 기반)
      const mealDiscount = Math.round(mealData.totalPrice * (mealDiscountRate / 100));
      const mealFinalPrice = mealData.totalPrice - mealDiscount;
      
      // 프로그램 데이터 계산 (실제 데이터 구조 기반)
      let programData = {
        totalPrice: 0,
        details: []
      };
      
      const programDiscountRate = getDiscountRate('program');
      
      if (programs && programs.length > 0) {
        programs.forEach(program => {
          console.log('Processing program:', program);
          
          // 실제 데이터 구조에 맞게 필드 매핑
          const price = safeParseNumber(program.price || program.program_price || 0);
          const programName = program.program_name || program.name || program.category_name || '체험프로그램';
          const categoryName = program.category_name || '';
          
          programData.totalPrice += price;
          programData.details.push({
            name: categoryName ? `${categoryName} - ${programName}` : programName,
            price,
            category: categoryName,
            calculation: `${price.toLocaleString()}원 X 1회 = ${price.toLocaleString()}원`
          });
        });
      }
      
      console.log('Program data calculated:', programData);
      
      // 할인 계산 (pageFinal 데이터 기반)
      const programDiscount = Math.round(programData.totalPrice * (programDiscountRate / 100));
      const programFinalPrice = programData.totalPrice - programDiscount;
      
      // 대관 데이터 계산 (실제 데이터 구조 기반)
      let placeData = {
        totalPrice: 0,
        details: []
      };
      
      const placeDiscountRate = getDiscountRate('venue');
      
      if (placeReservations && placeReservations.length > 0) {
        placeReservations.forEach(place => {
          console.log('Processing place:', place);
          
          // 실제 데이터 구조에 맞게 필드 매핑
          const price = safeParseNumber(place.price || place.total_price || place.rental_fee);
          const hours = place.hours || place.duration || 1;
          const placeName = place.place_name || place.venue_name || place.name || '대관장소';
          
          const subtotal = price * hours;
          placeData.totalPrice += subtotal;
          placeData.details.push({
            name: placeName,
            price: subtotal,
            hours: hours,
            unitPrice: price,
            calculation: `${price.toLocaleString()}원 X 1개소 X ${hours}시간 = ${subtotal.toLocaleString()}원`
          });
        });
      }
      
      console.log('Place data calculated:', placeData);
      
      // 대관은 할인 없음 (사용자 요구사항에 따라)
      const placeDiscount = 0;
      const placeFinalPrice = placeData.totalPrice;
      
      // 기타 비용 계산 (견적서 income_items 로직에 맞게 수정)
      let etcCost = 0;
      let etcItems = [];
      let etcOriginalPrice = 0;
      let etcTotalDiscount = 0;
      const etcDiscountRate = getDiscountRate('etc');
      
      if (pageFinal && pageFinal.income_items) {
        console.log("할인률 관련 - income_items에서 기타 비용 계산:", pageFinal.income_items);
        
        // 재료비 처리 (income_items 기준)
        const materialIncomes = pageFinal.income_items.filter(item => 
          item.category?.includes('재료비')
        );
        
        materialIncomes.forEach(income => {
          const amount = income.amount * 1000; // Convert thousands to units
          const discountRate = income.discount_rate !== null && income.discount_rate !== undefined ? income.discount_rate : 0;
          const discount = Math.round(amount * (discountRate / 100));
          const total = amount - discount;
          
          etcOriginalPrice += amount;
          etcTotalDiscount += discount;
          etcCost += total;
          
          console.log("할인률 관련 - 재료비 처리:", {
            원래금액: amount,
            할인율: discountRate,
            할인금액: discount,
            최종금액: total
          });
          
          etcItems.push({
            name: '재료비',
            amount: amount,
            discount: discount,
            discountRate: discountRate,
            total: total,
            note: income.details || '수입단가 기준',
            calculation: discountRate > 0 ? 
              `${amount.toLocaleString()}원 - ${discountRate}% 할인(${discount.toLocaleString()}원) = ${total.toLocaleString()}원` :
              `${total.toLocaleString()}원`
          });
        });
        
        // 기타 비용 처리 (income_items 기준)
        const etcIncomes = pageFinal.income_items.filter(item => 
          item.category?.includes('기타') && !item.category?.includes('재료비')
        );
        
        etcIncomes.forEach(income => {
          const amount = income.amount * 1000; // Convert thousands to units
          const discountRate = income.discount_rate !== null && income.discount_rate !== undefined ? income.discount_rate : 0;
          const discount = Math.round(amount * (discountRate / 100));
          const total = amount - discount;
          
          etcOriginalPrice += amount;
          etcTotalDiscount += discount;
          etcCost += total;
          
          console.log("할인률 관련 - 기타비 처리:", {
            원래금액: amount,
            할인율: discountRate,
            할인금액: discount,
            최종금액: total
          });
          
          etcItems.push({
            name: '기타비',
            amount: amount,
            discount: discount,
            discountRate: discountRate,
            total: total,
            note: income.details || '수입단가 기준',
            calculation: discountRate > 0 ? 
              `${amount.toLocaleString()}원 - ${discountRate}% 할인(${discount.toLocaleString()}원) = ${total.toLocaleString()}원` :
              `${total.toLocaleString()}원`
          });
        });
      }
      
      // Page4 material costs as fallback
      if (reservation.page4_expenses && reservation.page4_expenses.length > 0 && etcItems.length === 0) {
        reservation.page4_expenses.forEach(page4 => {
          if (page4.materials && page4.materials.length > 0) {
            page4.materials.forEach(material => {
              const amount = material.total || 0;
              const discount = Math.round(amount * (etcDiscountRate / 100));
              const total = amount - discount;
              etcCost += total;
              
              etcItems.push({
                name: material.name || '재료비',
                amount: amount,
                discount: discount,
                total: total,
                note: material.note || 'Page4 데이터'
              });
            });
          }
        });
      }
      
      // 총 계산
      const subtotal = roomFinalPrice + mealFinalPrice + programFinalPrice + placeFinalPrice + etcCost;
      const totalWithVAT = Math.round(subtotal * 1); // VAT 0% 추가
      
      console.log('=== Final Calculation Results ===');
      console.log('Room final price:', roomFinalPrice);
      console.log('Meal final price:', mealFinalPrice);
      console.log('Program final price:', programFinalPrice);
      console.log('Place final price:', placeFinalPrice);
      console.log('Etc cost:', etcCost);
      console.log('Subtotal:', subtotal);
      console.log('Total with VAT:', totalWithVAT);
      
      // Get age type from page2 data
      let ageType = '성인(성년층)'; // default value
      if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
        const page2Data = reservation.page2_reservations[0];
        if (page2Data.age_type) {
          ageType = page2Data.age_type;
        }
      }
      
      const report = {
        id: reservation.id,
        usagePeriod: `${startDate.format('YY. MM. DD. (ddd)')} ~ ${endDate.format('DD. (ddd)')}`,
        organizationName: reservation.group_name || '',
        contactPerson: {
          name: reservation.customer_name || '',
          phone: reservation.mobile_phone || reservation.landline_phone || '',
          email: reservation.email || ''
        },
        participants: participantData,
        expectedOrder: expectedOrderData,
        ageType: ageType,
        // 할인율 정보 포함
        roomData: {
          originalPrice: roomData.totalPrice,
          discount: roomDiscount,
          discountRate: roomDiscountRate,
          finalPrice: roomFinalPrice,
          details: roomData.details
        },
        mealData: {
          originalPrice: mealData.totalPrice,
          discount: mealDiscount,
          discountRate: mealDiscountRate,
          finalPrice: mealFinalPrice,
          details: mealData.details
        },
        programData: {
          originalPrice: programData.totalPrice,
          discount: programDiscount,
          discountRate: programDiscountRate,
          finalPrice: programFinalPrice,
          details: programData.details
        },
        placeData: {
          originalPrice: placeData.totalPrice,
          discount: placeDiscount,
          discountRate: placeDiscountRate,
          finalPrice: placeFinalPrice,
          details: placeData.details
        },
        etcData: {
          originalPrice: etcOriginalPrice,
          discount: etcTotalDiscount,
          discountRate: etcTotalDiscount > 0 ? Math.round((etcTotalDiscount / etcOriginalPrice) * 100) : 0,
          finalPrice: etcCost
        },
        etcCost,
        etcItems,
        totalWithVAT
      };
      
      console.log('=== Generated Report Data ===', report);
      
      setReportData(report);
      setLoading(false);
    } catch (error) {
      console.error('Error generating report data:', error);
      showAlert('보고서 데이터 생성 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    }
  };

  // Handle PDF export
  const handlePdfExport = async () => {
    if (!reportData || !reportRef.current) {
      showAlert('내보낼 데이터가 없습니다.', 'warning');
      return;
    }

    try {
      setLoading(true);
      showAlert('PDF 파일을 생성 중입니다...', 'info');
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight; // Mind negative position value
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `수주보고서_${reportData.organizationName}_${moment().format('YYMMDD')}.pdf`;
      pdf.save(fileName);
      
      showAlert('PDF가 성공적으로 생성되었습니다.', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading || detailLoading) {
    return (
      <Page6Layout>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      </Page6Layout>
    );
  }

  if (error || detailError) {
    return (
      <Page6Layout>
        <Box sx={{ p: 3 }}>
          <Typography color="error">
            데이터를 불러오는 중 오류가 발생했습니다: {(error || detailError).message}
          </Typography>
        </Box>
      </Page6Layout>
    );
  }

  return (
    <Page6Layout>
      <Grid container spacing={3}>
        {/* Header Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
                  <Autocomplete
                    value={selectedGroupId ? data?.getPage1List?.find(item => item.id.toString() === selectedGroupId) || null : null}
                    onChange={(event, newValue) => {
                      setSelectedGroupId(newValue ? newValue.id.toString() : '');
                    }}
                    options={data?.getPage1List || []}
                    getOptionLabel={(option) => `${option.group_name} - ${moment(option.start_date).format('MM/DD')} (${option.reservation_status})`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="단체 선택"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {dataLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    loading={dataLoading}
                    disabled={dataLoading}
                  />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
                <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePdfExport}
            disabled={!reportData || loading}
            fullWidth
          >
                    PDF 내보내기
          </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Report Content */}
        {reportData && (
          <Grid item xs={12}>
            <Paper 
              ref={reportRef}
              sx={{
                padding: '20px', // Inner padding
                width: '210mm', // A4 width
                margin: '20px auto', // Center the "page"
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                },
                '& td, & th': {
                  border: '1px solid #000',
                  padding: '5px', // Adjusted padding
                  textAlign: 'center',
                  fontSize: '10px', // Adjusted font size
                },
                '@media print': {
                  margin: '0 auto',
                  padding: '0',
                  width: '100%',
                  boxShadow: 'none',
                  backgroundColor: '#fff',
                }
              }}
            >
              {/* 제목 */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontSize: '16px' }}> {/* Adjusted font size for title */}
                    하이힐링원 B2B 유료 프로그램 수주 보고
                  </Typography>
                <Typography variant="body2" sx={{ fontSize: '12px' }}> {/* Adjusted font size for subtitle */}
                  ({reportData.usagePeriod})
                  </Typography>
                </Box>
                
              {/* 기본 정보 테이블 */}
              <Box sx={{ mb: 4 }}>
                <table style={{ width: '100%', marginBottom: '20px' }}>
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', width: '15%' }}>이용기간</td>
                      <td style={{ width: '35%' }}>{reportData.usagePeriod}</td>
                      <td rowSpan="3" style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', width: '15%', textAlign: 'center', verticalAlign: 'middle' }}>참가자<br/>정보</td>
                      <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', width: '15%' }}>참가인원(명)</td>
                      <td style={{ width: '20%' }}>{reportData.participants.participants}</td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>단체명</td>
                      <td>{reportData.organizationName}</td>
                      <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>인솔인원(명)</td>
                      <td>{reportData.participants.staff}</td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>담당자</td>
                      <td style={{ textAlign: 'left', verticalAlign: 'middle', borderLeft: 'none', borderRight: 'none' }} colSpan="2">이름: {reportData.contactPerson.name}<br/>연락처: {reportData.contactPerson.phone}<br/>E-mail: {reportData.contactPerson.email}</td>
                      <td colSpan="2" style={{ backgroundColor: '', fontWeight: 'bold', textAlign: 'center', borderLeft: 'none' }}>연령: {reportData.ageType || '성인(성년층)'}</td>
                    </tr>
                
                  </tbody>
                </table>
              </Box>

              {/* 1. 예상 수주 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '14px' }}> {/* Adjusted font size */}
                  1. 예상 수주
                </Typography>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e8f5e9' }}>
                      <th>구분</th>
                      <th>기간</th>
                      <th>소계</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>참가자수</td>
                      <td>{reportData.participants.total}명</td>
                      <td>{reportData.participants.total}</td>
                      <td>참가자 {reportData.participants.participants}명, 인솔자 {reportData.participants.staff}명</td>
                    </tr>
                    <tr>
                      <td>객실</td>
                      <td>{reportData.expectedOrder.rooms}개</td>
                      <td>{reportData.expectedOrder.rooms}</td>
                      <td>
                        {reportData.roomData.details.length > 0 && typeof reportData.roomData.details[0] === 'object' && reportData.roomData.details[0].roomType ? 
                          reportData.roomData.details.map(room => `${room.date} ${room.roomType} ${room.roomCount}실(${room.occupancyInfo})`).join(', ')
                          : reportData.roomData.details.length > 0 ? '객실 정보' : '객실 예약 없음'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>식사</td>
                      <td>{reportData.expectedOrder.meals}식</td>
                      <td>{reportData.expectedOrder.meals}</td>
                      <td>
                        {reportData.mealData.details.length > 0 && typeof reportData.mealData.details[0] === 'object' && reportData.mealData.details[0].type
                          ? reportData.mealData.details.map(meal => `${meal.type}(${meal.participants}명)`).join(', ')
                          : reportData.mealData.details.length > 0 ? '식사 정보' : '식사 예약 없음'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>프로그램</td>
                      <td>{reportData.expectedOrder.programs}개</td>
                      <td>{reportData.expectedOrder.programs}</td>
                      <td>
                        {reportData.programData.details.length > 0 && typeof reportData.programData.details[0] === 'object' && reportData.programData.details[0].name
                          ? reportData.programData.details.map(program => program.name).slice(0, 3).join(', ') + (reportData.programData.details.length > 3 ? ' 외' : '')
                          : reportData.programData.details.length > 0 ? '프로그램 정보' : '프로그램 예약 없음'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>대관</td>
                      <td>{reportData.expectedOrder.places}개소</td>
                      <td>{reportData.expectedOrder.places}</td>
                      <td>
                        {reportData.placeData.details.length > 0 && typeof reportData.placeData.details[0] === 'object' && reportData.placeData.details[0].name
                          ? reportData.placeData.details.map(place => place.name).join(', ')
                          : reportData.placeData.details.length > 0 ? '정보' : '대관 예약 없음'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>

              {/* 2. 예상 수주금액 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '14px' }}> {/* Adjusted font size */}
                  2. 예상 수주금액
                </Typography>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e8f5e9' }}>
                      <th>구분</th>
                      <th>금액(원)</th>
                      <th style={{width: '40%'}}>산출근거</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>객실</td>
                      <td>{reportData.roomData.originalPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                        {reportData.roomData.details.length > 0 ? 
                          reportData.roomData.details.map((d, i) => <div key={i}>{d.calculation}</div>) :
                          <div>객실 예약 정보 없음</div>
                        }
                      </td>
                      <td></td>
                    </tr>
                    {reportData.roomData.discount > 0 && reportData.roomData.discountRate > 0 && (
                    <tr>
                      <td></td>
                      <td style={{ color: 'red' }}>-{reportData.roomData.discount.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>· {reportData.roomData.discountRate}% 할인</td>
                      <td></td>
                    </tr>
                    )}
                    <tr>
                      <td>식사</td>
                      <td>{reportData.mealData.originalPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                        {reportData.mealData.details.length > 0 ? 
                          reportData.mealData.details.map((d, i) => <div key={i}>{d.calculation}</div>) :
                          <div>식사 예약 정보 없음</div>
                        }
                      </td>
                      <td></td>
                    </tr>
                    {reportData.mealData.discount > 0 && reportData.mealData.discountRate > 0 && (
                    <tr>
                      <td></td>
                      <td style={{ color: 'red' }}>-{reportData.mealData.discount.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>· {reportData.mealData.discountRate}% 할인</td>
                      <td></td>
                    </tr>
                    )}
                    <tr>
                      <td>프로그램</td>
                      <td>{reportData.programData.originalPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                        {reportData.programData.details.length > 0 ? 
                          reportData.programData.details.map((d, i) => <div key={i}>{d.calculation}</div>) :
                          <div>프로그램 예약 정보 없음</div>
                        }
                      </td>
                      <td></td>
                    </tr>
                    {reportData.programData.discount > 0 && reportData.programData.discountRate > 0 && (
                    <tr>
                      <td></td>
                      <td style={{ color: 'red' }}>-{reportData.programData.discount.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>· {reportData.programData.discountRate}% 할인</td>
                      <td></td>
                    </tr>
                    )}
                    <tr>
                      <td>대관</td>
                      <td>{reportData.placeData.originalPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                        {reportData.placeData.details.length > 0 ? 
                          reportData.placeData.details.map((d, i) => <div key={i}>{d.calculation}</div>) :
                          <div>대관 예약 정보 없음</div>
                        }
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>기타</td>
                      <td>{reportData.etcData.originalPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>
                        {reportData.etcItems && reportData.etcItems.length > 0 && typeof reportData.etcItems[0] === 'object' && reportData.etcItems[0].name ? (
                          reportData.etcItems.map((item, index) => (
                            <div key={index}>
                              · {item.name}: {item.amount.toLocaleString()}원 {item.note ? `(${item.note})` : ''}
                            </div>
                          ))
                        ) : (
                          <div>기타 비용 정보 없음</div>
                        )}
                      </td>
                      <td></td>
                    </tr>
                    {reportData.etcData.discount > 0 && reportData.etcData.discountRate > 0 && (
                    <tr>
                      <td></td>
                      <td style={{ color: 'red' }}>-{reportData.etcData.discount.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}>· {reportData.etcData.discountRate}% 할인</td>
                      <td></td>
                    </tr>
                    )}
                    <tr style={{ backgroundColor: '#e8f5e9', fontWeight: 'bold' }}>
                      <td>총계</td>
                      <td>{reportData.totalWithVAT.toLocaleString()}</td>
                      <td style={{ textAlign: 'left', paddingLeft: '10px' }}></td>
                      <td>VAT포함</td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </Paper>
          </Grid>
        )}
        
        {!reportData && selectedGroupId && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary" textAlign="center">
                선택한 단체의 보고서 데이터를 생성하는 중입니다...
                          </Typography>
            </Paper>
          </Grid>
        )}
        
        {!selectedGroupId && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography color="text.secondary" textAlign="center">
                보고서를 생성할 단체를 선택해주세요.
                          </Typography>
              </Paper>
          </Grid>
        )}
      </Grid>
    </Page6Layout>
  );
};

export default OrganizationReport; 