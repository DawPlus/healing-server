import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useLocation } from 'react-router-dom';

// Tab components
import ScheduleTab from './ScheduleTab';
import ReservationStatusTab from './ReservationStatusTab';
import WeeklyScheduleTab from './WeeklyScheduleTab';
import ImplementationPlanTab from './ImplementationPlanTab';
import UsageReportTab from './UsageReportTab';
import SalesPerformanceTab from './SalesPerformanceTab';
import InstructorPaymentTab from './InstructorPaymentTab';

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MainView = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // URL 파라미터에서 탭 정보 가져오기
  const tabParam = searchParams.get('tab');
  
  // 탭 매핑 (URL 파라미터 값을 탭 인덱스로 변환)
  const getTabIndexFromParam = (param) => {
    if (!param) return 0;
    
    const tabMapping = {
      'schedule': 0,
      'reservation-status': 1,
      'weekly-schedule': 2, 
      'implementation-plan': 3,
      'usage-report': 4,
      'sales-performance': 5,
      'instructor-payment': 6
    };
    
    return tabMapping[param] !== undefined ? tabMapping[param] : 0;
  };
  
  // Redux 상태 가져오기
  const {
    selectedMonth,
    selectedWeek,
    selectedPeriod,
    activeTab = getTabIndexFromParam(tabParam)
  } = ""
  
  // 로컬 상태 관리
  const [tabValue, setTabValue] = useState(activeTab);

  // URL 파라미터가 변경되면 탭 업데이트
  useEffect(() => {
    const newTabIndex = getTabIndexFromParam(tabParam);
    setTabValue(newTabIndex);
  }, [tabParam]);

  // 탭이 변경될 때 해당 탭의 데이터 로드
  useEffect(() => {
    switch (tabValue) {
      case 0: // 일정표 및 식사/숙소 현황표
        dispatch(actions.fetchSchedules());
        break;
      case 1: // 예약종합현황표
        dispatch(actions.fetchReservationStatus({ month: selectedMonth }));
        break;
      case 2: // 주간일정표
        dispatch(actions.fetchWeeklySchedules({ week: selectedWeek }));
        break;
      case 3: // 실시계획
        dispatch(actions.fetchImplementationPlans({ week: selectedWeek }));
        break;
      case 4: // 이용내역서
        dispatch(actions.fetchUsageReports());
        break;
      case 5: // 매출실적
        dispatch(actions.fetchSalesPerformance({ month: selectedMonth }));
        break;
      case 6: // 강사비 정산
        dispatch(actions.fetchInstructorPayments({ period: selectedPeriod }));
        break;
      default:
        break;
    }
  }, [dispatch, tabValue, selectedMonth, selectedWeek, selectedPeriod]);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    dispatch(actions.setActiveTab(newValue));
  };

  return (
    <MainCard title="예약관리시스템" 
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="SFR-006"
            color="primary"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          <Chip
            label="필수"
            color="success"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      }
      sx={{ minHeight: '100vh' }}
    >
      <Grid container spacing={3}>
        {/* 요구사항 기본 정보 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 2, bgcolor: '#f8fdff', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1 }} /> 예약정보 확인
            </Typography>
            <Typography variant="body1" sx={{ color: '#34495e', mb: 2 }}>
              이 시스템은 예약 정보를 다양한 형태로 확인하고 관리할 수 있는 기능을 제공합니다. 일정표, 예약현황, 이용내역서 등을 조회하고 출력할 수 있습니다.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#34495e' }}>요구사항 ID:</Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>SFR-006</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#34495e' }}>요구사항 중요도:</Typography>
                  <Chip size="small" label="필수" color="success" sx={{ ml: 1 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 정의: 예약정보 확인 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>정의: 예약정보 확인</Typography>
            
            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab icon={<CalendarMonthIcon />} label="일정표 및 식사/숙소 현황표" />
                <Tab icon={<DescriptionIcon />} label="예약종합현황표" />
                <Tab icon={<AssignmentIcon />} label="주간일정표" />
                <Tab icon={<PeopleIcon />} label="실시계획" />
                <Tab icon={<ReceiptIcon />} label="이용내역서" />
                <Tab icon={<MonetizationOnIcon />} label="매출실적" />
                <Tab icon={<CalculateIcon />} label="강사비 정산" />
              </Tabs>
            </Box>

            {/* 일정표 및 식사/숙소 현황표 */}
            <TabPanel value={tabValue} index={0}>
              <ScheduleTab />
            </TabPanel>

            {/* 예약종합현황표 */}
            <TabPanel value={tabValue} index={1}>
              <ReservationStatusTab />
            </TabPanel>

            {/* 주간일정표 */}
            <TabPanel value={tabValue} index={2}>
              <WeeklyScheduleTab />
            </TabPanel>

            {/* 실시계획 */}
            <TabPanel value={tabValue} index={3}>
              <ImplementationPlanTab />
            </TabPanel>

            {/* 이용내역서 */}
            <TabPanel value={tabValue} index={4}>
              <UsageReportTab />
            </TabPanel>

            {/* 매출실적 */}
            <TabPanel value={tabValue} index={5}>
              <SalesPerformanceTab />
            </TabPanel>

            {/* 강사비 정산 */}
            <TabPanel value={tabValue} index={6}>
              <InstructorPaymentTab />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default MainView; 