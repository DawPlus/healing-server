import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { 
  GET_YEAR_MONTH_RESULTS,
  GET_YEAR_MONTH_SERVICE_STATS 
} from '../graphql/yearMonthResult';

/**
 * 연/월별 결과 리포트 데이터를 처리하는 커스텀 훅
 * @returns {{
 *  startDate: string,
 *  setStartDate: function,
 *  endDate: string,
 *  setEndDate: function,
 *  isLoading: boolean,
 *  searchError: string|null,
 *  hasData: boolean,
 *  hasResults: boolean,
 *  yearMonthResultData: object,
 *  fetchData: function,
 *  resetData: function
 * }}
 */
const useYearMonthResult = () => {
  // 검색 조건 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 로딩 및 오류 상태
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // GraphQL 지연 쿼리 정의
  const [getYearMonthResults, { data: resultsData, loading: resultsLoading, error: resultsError }] = useLazyQuery(GET_YEAR_MONTH_RESULTS, {
    fetchPolicy: 'network-only', // 캐시를 사용하지 않고 항상 서버에서 가져오기
    notifyOnNetworkStatusChange: true // 로딩 상태 변경 시 알림
  });
  
  const [getYearMonthServiceStats, { data: statsData, loading: statsLoading, error: statsError }] = useLazyQuery(GET_YEAR_MONTH_SERVICE_STATS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });
  
  // 오류 감지
  useEffect(() => {
    if (resultsError || statsError) {
      const errorMessage = (resultsError || statsError).message;
      setSearchError(errorMessage);
      console.error("GraphQL Error:", errorMessage);
    }
  }, [resultsError, statsError]);
  
  // 데이터 조회 상태
  const isLoading = resultsLoading || statsLoading || isSearching;
  const hasData = resultsData?.getYearMonthResults !== undefined && statsData?.getYearMonthServiceStats !== undefined;
  const hasResults = resultsData?.getYearMonthResults?.length > 0;
  
  // 데이터 조회 함수
  const fetchData = async () => {
    // 입력값 검증
    if (!startDate || !endDate) {
      throw new Error('시작일과 종료일을 모두 입력해주세요.');
    }
    
    try {
      // 검색 시작 상태 설정
      setIsSearching(true);
      setSearchError(null);
      
      // 날짜 형식 검증 및 변환 (YYYY-MM-DD 형식인지 확인)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const formattedStartDate = dateRegex.test(startDate) ? startDate : startDate;
      const formattedEndDate = dateRegex.test(endDate) ? endDate : endDate;
      
      console.log(`조회 시작: ${formattedStartDate} ~ ${formattedEndDate}`);
      
      // 모든 데이터 조회 실행
      const resultsPromise = getYearMonthResults({ 
        variables: { startDate: formattedStartDate, endDate: formattedEndDate }
      });
      
      const statsPromise = getYearMonthServiceStats({ 
        variables: { startDate: formattedStartDate, endDate: formattedEndDate }
      });
      
      // 모든 쿼리가 완료될 때까지 기다림
      const [resultsResponse, statsResponse] = await Promise.all([resultsPromise, statsPromise]);
      
      console.log("데이터 조회 완료", resultsResponse, statsResponse);
      
      return {
        resultsData: resultsResponse.data,
        statsData: statsResponse.data
      };
    } catch (error) {
      console.error("데이터 조회 중 오류 발생:", error);
      setSearchError(error.message || "데이터 조회 중 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsSearching(false);
    }
  };
  
  // 데이터 리셋 함수
  const resetData = () => {
    setStartDate('');
    setEndDate('');
    setSearchError(null);
  };
  
  // 데이터 변환 - 컴포넌트에서 사용할 형태로 가공
  const yearMonthResultData = {
    // 참가자 유형 데이터
    partTypeList: statsData?.getYearMonthServiceStats ? {
      count_addict: 0,
      count_adult: 0,
      count_benefit: 0,
      count_boy: 0,
      count_etc: 0,
      count_family: 0,
      count_handicap: 0,
      count_income_etc: 0,
      count_income_green: 0,
      count_income_voucher: 0,
      count_kidboy: 0,
      count_lowincome: 0,
      count_old: 0,
      count_society: 0,
      count_teacher: 0,
      part_addict: 0,
      part_adult: 0,
      part_benefit: 0,
      part_boy: 0,
      part_etc: 0,
      part_family: 0,
      part_handicap: 0,
      part_income_etc: 0,
      part_income_green: 0,
      part_income_voucher: 0,
      part_kidboy: 0,
      part_lowincome: 0,
      part_old: 0,
      part_society: 0,
      part_teacher: 0,
      ...(statsData?.getYearMonthServiceStats?.part_type_distribution || []).reduce((acc, item) => {
        if (item && item.part_type) {
          acc[`part_${item.part_type.toLowerCase()}`] = item.count || 0;
          acc[`count_${item.part_type.toLowerCase()}`] = 1;
        }
        return acc;
      }, {})
    } : {},
    
    // 거주지 목록 데이터
    residenceList: resultsData?.getYearMonthResults || [],
    
    // 프로그램 개요 데이터
    programOverview: statsData?.getYearMonthServiceStats ? {
      people: [{
        man: statsData?.getYearMonthServiceStats?.male_participants || 0,
        woman: statsData?.getYearMonthServiceStats?.female_participants || 0,
        total: statsData?.getYearMonthServiceStats?.total_participants || 0
      }],
      pTotal: [{
        sum: statsData?.getYearMonthServiceStats?.total_participants || 0
      }],
      service: (statsData?.getYearMonthServiceStats?.service_type_distribution || []).map(item => ({
        name: item?.service_type || '',
        cnt: item?.count || 0
      })),
      room: [{
        meal_etc: "0",
        meal_lead: (statsData?.getYearMonthServiceStats?.total_leaders || 0).toString(),
        meal_part: (statsData?.getYearMonthServiceStats?.total_participants || 0).toString(),
        room_etc_people: "0",
        room_etc_room: "0",
        room_lead_people: (statsData?.getYearMonthServiceStats?.total_leaders || 0).toString(),
        room_lead_room: "0",
        room_part_people: (statsData?.getYearMonthServiceStats?.total_participants || 0).toString(),
        room_part_room: "0"
      }],
      male_leaders: statsData?.getYearMonthServiceStats?.male_leaders || 0,
      female_leaders: statsData?.getYearMonthServiceStats?.female_leaders || 0,
      total_leaders: statsData?.getYearMonthServiceStats?.total_leaders || 0
    } : {
      people: [],
      pTotal: [],
      service: [],
      room: [{
        meal_etc: "",
        meal_lead: "",
        meal_part: "",
        room_etc_people: "",
        room_etc_room: "",
        room_lead_people: "",
        room_lead_room: "",
        room_part_people: "",
        room_part_room: ""
      }],
      male_leaders: 0,
      female_leaders: 0,
      total_leaders: 0
    },
    
    // 프로그램 관리 데이터
    programManage: statsData?.getYearMonthServiceStats ? {
      manage: (statsData?.getYearMonthServiceStats?.month_summaries || []).map(month => ({
        month: month?.month || '',
        total: month?.total_participants || 0
      })),
      bunya: (statsData?.getYearMonthServiceStats?.month_summaries || []).flatMap(month => 
        (month?.service_types || []).map(st => ({
          month: month?.month || '',
          type: st?.service_type || '',
          cnt: st?.count || 0
        }))
      ),
      manage_cnt: (statsData?.getYearMonthServiceStats?.service_type_distribution || []).map(item => ({
        type: item?.service_type || '',
        cnt: item?.count || 0
      }))
    } : {
      manage: [],
      bunya: [],
      manage_cnt: []
    },
    
    // 서비스 만족도 데이터
    serList: statsData?.getYearMonthServiceStats?.service_satisfaction_scores ? {
      score1: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.facility_scores?.[0] || 0,
      score2: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.facility_scores?.[1] || 0,
      score3: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.facility_scores?.[2] || 0,
      score4: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.facility_scores?.[3] || 0,
      score5: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.facility_scores?.[4] || 0,
      score6: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.facility_scores?.[5] || 0,
      score7: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.environment_scores?.[0] || 0,
      score8: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.environment_scores?.[1] || 0,
      score9: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.environment_scores?.[2] || 0,
      score10: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.environment_scores?.[3] || 0,
      score11: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.environment_scores?.[4] || 0,
      score12: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.environment_scores?.[5] || 0,
      score13: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.staff_scores?.[0] || 0,
      score14: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.staff_scores?.[1] || 0,
      score15: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.staff_scores?.[2] || 0,
      score16: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.staff_scores?.[3] || 0,
      total: statsData?.getYearMonthServiceStats?.service_satisfaction_scores?.overall_score || 0
    } : {
      score1: 0,
      score2: 0,
      score3: 0,
      score4: 0,
      score5: 0,
      score6: 0,
      score7: 0,
      score8: 0,
      score9: 0,
      score10: 0,
      score11: 0,
      score12: 0,
      score13: 0,
      score14: 0,
      score15: 0,
      score16: 0,
      total: 0
    },
    
    // 프로그램 효과 데이터
    programEffect: statsData?.getYearMonthServiceStats?.effect_scores ? [
      // 예방 효과
      {
        type: '예방',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.prevent_effect?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.prevent_effect?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.prevent_effect?.difference || 0
      },
      // 상담 효과
      {
        type: '상담',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.counsel_effect?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.counsel_effect?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.counsel_effect?.difference || 0
      },
      // 힐링 효과
      {
        type: '힐링',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.healing_effect?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.healing_effect?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.healing_effect?.difference || 0
      },
      // HRV - 자율신경활성도
      {
        type: 'HRV(자율신경활성도)',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.autonomic_activity?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.autonomic_activity?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.autonomic_activity?.difference || 0
      },
      // HRV - 자율신경균형도
      {
        type: 'HRV(자율신경균형도)',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.autonomic_balance?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.autonomic_balance?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.autonomic_balance?.difference || 0
      },
      // HRV - 스트레스저항도
      {
        type: 'HRV(스트레스저항도)',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.stress_resistance?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.stress_resistance?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.stress_resistance?.difference || 0
      },
      // HRV - 스트레스지수
      {
        type: 'HRV(스트레스지수)',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.stress_index?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.stress_index?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.stress_index?.difference || 0
      },
      // HRV - 피로도지수
      {
        type: 'HRV(피로도지수)',
        sum1: 0,
        sum2: 0,
        avg1: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.fatigue_index?.pre_score || 0,
        avg2: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.fatigue_index?.post_score || 0,
        diff: statsData?.getYearMonthServiceStats?.effect_scores?.hrv_effect?.fatigue_index?.difference || 0
      }
    ] : [],
    
    // 수입/지출 데이터 (기본값 0으로 설정)
    exIncomeList: {
      expend: {
        instructorPlannedCost: 0,
        instructorPlannedTransportation: 0,
        instructorPlannedAssistant: 0,
        instructorPlannedMeals: 0,
        instructorExecutedCost: 0,
        instructorExecutedTransportation: 0,
        instructorExecutedAssistant: 0,
        instructorExecutedMeals: 0,
        customerPlannedAccommodation: 0,
        customerPlannedMeals: 0,
        customerPlannedReserve: 0,
        customerPlannedMaterials: 0,
        customerExecutedOthers: 0,
        customerExecutedAccommodation: 0,
        customerExecutedMeals: 0,
        customerExecutedMaterials: 0,
        reserve: 0,
        total: 0
      },
      income: {
        other: 0,
        accommodation: 0,
        meals: 0,
        materials: 0,
        program: 0,
        discount: 0,
        total: 0
      },
      incomeTotal: 0
    },
    programInterest: []
  };

  return {
    // 상태 관리
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    searchError,
    hasData,
    hasResults,
    
    // 데이터 
    yearMonthResultData,
    
    // 기능
    fetchData,
    resetData
  };
};

export default useYearMonthResult; 