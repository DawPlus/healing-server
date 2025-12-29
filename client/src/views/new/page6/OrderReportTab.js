import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_STATISTICS, GET_PAGE5_RESERVATION_LIST } from '../Page5/graphql';
import { formatDate, showAlert } from '../Page5/services/dataService';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MainCard from 'ui-component/cards/MainCard';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Page5Layout from '../Page5/components/Page5Layout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Helper function to safely convert price values to numbers
const safeParseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

// 월별 통계 리포트 컴포넌트
const MonthlyStatisticsReport = ({ data, reservationsData, year, month }) => {
  const theme = useTheme();
  
  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Process reservation data from Page2 and Page3
  const processReservationData = () => {
    if (!reservationsData || !reservationsData.getPage1List) {
      console.log("No reservation data available");
      return {
        categories: [],
        organizations: [],
        dailyData: []
      };
    }
    
    // Debug: Log the raw data
    console.log("Processing reservation data:", reservationsData.getPage1List);
    
    try {
      // Initialize category data
      const categories = [
        { name: '숙박', count: 0, value: 0, percentage: 0 },
        { name: '식사', count: 0, value: 0, percentage: 0 },
        { name: '프로그램', count: 0, value: 0, percentage: 0 },
        { name: '대관', count: 0, value: 0, percentage: 0 }
      ];
      
      // Initialize organization map
      const organizationMap = new Map();
      
      // Initialize daily data for the month
      const daysInMonth = moment(`${year}-${month}`).daysInMonth();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        date: moment(`${year}-${month}-${(i + 1).toString().padStart(2, '0')}`).format('YYYY-MM-DD'),
        count: 0,
        value: 0
      }));
      
      // Process each reservation
      reservationsData.getPage1List.forEach(reservation => {
        console.log(`Processing reservation for ${reservation.group_name}:`, reservation);
        
        // Filter for reservations in the selected month
        const startDate = moment(reservation.start_date);
        const endDate = moment(reservation.end_date);
        
        // Check if any part of the reservation falls within the selected month
        const monthStart = moment(`${year}-${month}-01`);
        const monthEnd = moment(monthStart).endOf('month');
        
        if (!moment.max(startDate, monthStart).isSameOrBefore(moment.min(endDate, monthEnd))) {
          console.log(`Reservation ${reservation.id} is outside the selected month range`);
          return;
        }
        
        // Update organization data first
        const orgName = reservation.group_name || '미지정';
        const orgData = organizationMap.get(orgName) || {
          name: orgName,
          reservations_count: 0,
          total_revenue: 0,
          percentage: 0
        };
        
        orgData.reservations_count++;
        organizationMap.set(orgName, orgData);
        
        let reservationRevenue = 0;
        
        // Process room data
        if (reservation.page3 && reservation.page3.room_selections && reservation.page3.room_selections.length > 0) {
          console.log(`Processing ${reservation.page3.room_selections.length} room selections for ${reservation.group_name}`);
          
          reservation.page3.room_selections.forEach(room => {
            if (!room) return;
            
            const roomPrice = safeParseNumber(room.price);
            const nights = room.nights || 1;
            const quantity = 1; // Assuming 1 room if not specified
            
            const roomTotal = roomPrice * nights * quantity;
            
            categories[0].count++;
            categories[0].value += roomTotal;
            reservationRevenue += roomTotal;
            
            // Update daily data for room
            try {
              if (room.check_in_date) {
                const checkInDate = moment(room.check_in_date);
                for (let i = 0; i < nights; i++) {
                  const date = checkInDate.clone().add(i, 'days');
                  if (date.format('YYYY-MM') === `${year}-${month}`) {
                    const dayIndex = date.date() - 1;
                    if (dayIndex >= 0 && dayIndex < dailyData.length) {
                      dailyData[dayIndex].count++;
                      dailyData[dayIndex].value += roomTotal / nights;
                    }
                  }
                }
              }
            } catch (error) {
              console.warn('Error processing room daily data:', error);
            }
          });
        } else {
          console.log(`No room selections for ${reservation.group_name}`);
        }
        
        // Process meal data
        if (reservation.page3 && reservation.page3.meal_plans && reservation.page3.meal_plans.length > 0) {
          console.log(`Processing ${reservation.page3.meal_plans.length} meal plans for ${reservation.group_name}`);
          reservation.page3.meal_plans.forEach(meal => {
            if (!meal) return;

            const price = safeParseNumber(meal.price); // 총액
            const participants = meal.participants || 0;
            let unitPrice = 0;
            let mealSubTotal = 0;

            if (participants > 0) {
              unitPrice = Math.round(price / participants);
              mealSubTotal = unitPrice * participants;
            } else {
              unitPrice = price;
              mealSubTotal = price;
            }
            
            categories[1].count++;
            categories[1].value += mealSubTotal;
            reservationRevenue += mealSubTotal;

            // Update daily data for meal
            try {
              if (meal.date) {
                const mealDate = moment(meal.date);
                if (mealDate.format('YYYY-MM') === `${year}-${month}`) {
                  const dayIndex = mealDate.date() - 1;
                  if (dayIndex >= 0 && dayIndex < dailyData.length) {
                    dailyData[dayIndex].count++; // 식사 건수도 카운트 (선택사항)
                    dailyData[dayIndex].value += mealSubTotal; // 일일 매출에 식사 금액 추가
                  }
                }
              }
            } catch (error) {
              console.warn('Error processing meal daily data:', error);
            }
          });
        } else {
          console.log(`No meal plans for ${reservation.group_name}`);
        }

        // Process program data (example, adapt as needed)
        if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
          reservation.page2_reservations.forEach(page2 => {
            if (page2.programs && page2.programs.length > 0) {
              page2.programs.forEach(program => {
                if (!program) return;
                const programPrice = safeParseNumber(program.price);
                categories[2].count++;
                categories[2].value += programPrice;
                reservationRevenue += programPrice;
                // Add daily data processing if applicable
              });
            }
          });
        }

        // Process venue (place) data (example, adapt as needed)
        if (reservation.page3 && reservation.page3.place_reservations && reservation.page3.place_reservations.length > 0) {
          reservation.page3.place_reservations.forEach(place => {
            if (!place) return;
            const placePrice = safeParseNumber(place.price);
            const hours = place.hours || 1;
            const placeTotal = placePrice * hours;
            categories[3].count++;
            categories[3].value += placeTotal;
            reservationRevenue += placeTotal;
            // Add daily data processing if applicable
          });
        }
        
        // Add the total revenue to the organization
        const updatedOrgData = organizationMap.get(orgName);
        updatedOrgData.total_revenue += reservationRevenue;
        organizationMap.set(orgName, updatedOrgData);
      });
      
      // Calculate total revenue across all categories
      const totalRevenue = categories.reduce((sum, category) => sum + category.value, 0);
      
      // Update percentages for categories
      categories.forEach(category => {
        category.percentage = totalRevenue > 0 ? (category.value / totalRevenue) * 100 : 0;
      });
      
      // Convert organization map to array and calculate percentages
      const organizations = Array.from(organizationMap.values());
      const totalOrgRevenue = organizations.reduce((sum, org) => sum + org.total_revenue, 0);
      
      organizations.forEach(org => {
        org.percentage = totalOrgRevenue > 0 ? (org.total_revenue / totalOrgRevenue) * 100 : 0;
      });
      
      // Sort organizations by revenue (highest first)
      organizations.sort((a, b) => b.total_revenue - a.total_revenue);
      
      return {
        categories,
        organizations,
        dailyData
      };
    } catch (error) {
      console.error('Error processing reservation data:', error);
      return {
        categories: [],
        organizations: [],
        dailyData: []
      };
    }
  };
  
  // Process the data
  const processedData = processReservationData();
  
  // Use processed data or fallback to provided data
  const categoryData = processedData.categories.length > 0 
    ? processedData.categories 
    : data.categories || [];
  
  const organizationData = processedData.organizations.length > 0
    ? processedData.organizations
    : data.organizations || [];
  
  const dailyData = processedData.dailyData.length > 0
    ? processedData.dailyData
    : data.dailyData || [];
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 예약 건수
              </Typography>
              <Typography variant="h4">
                {data.totalReservations || 0}건
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 매출
              </Typography>
              <Typography variant="h4">
                {((data.totalRevenue || 0) / 10000).toFixed(1)}만원
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                평균 숙박일
              </Typography>
              <Typography variant="h4">
                {(data.averageStay || 0).toFixed(1)}일
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                객실 점유율
              </Typography>
              <Typography variant="h4">
                {Math.floor(((data.totalReservations || 0) / 60) * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* ... charts and other content as in the original component ... */}
      </Grid>
    </Box>
  );
};

// 수주보고 메인 컴포넌트
const OrderReportTab = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [year, setYear] = useState(moment().format('YYYY'));
  const [month, setMonth] = useState(moment().format('MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  // Fetch reservation list data
  const { loading: reservationsLoading, error: reservationsError, data: reservationsData, refetch: refetchReservations } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching reservations:', error);
      // Check if the error is related to ID type conversion
      if (error.message && error.message.includes('Int cannot represent non-integer value')) {
        console.warn('ID type conversion error detected. This may be due to temporary IDs in the data.');
        // Error is non-fatal, so just show a warning
        showAlert('일부 데이터의 형식이 맞지 않습니다. 결과가 일부 누락될 수 있습니다.', 'warning');
      } else {
        showAlert('예약 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
      }
    }
  });
  
  // Get statistics data from GraphQL (as fallback)
  const { loading, error, data, refetch } = useQuery(GET_PAGE5_STATISTICS, {
    variables: { period: `${year}-${month}`, type: 'monthly' },
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching statistics:', error);
      showAlert('통계 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
  });
  
  // Fallback/dummy data if needed
  const statsData = data?.getStatistics || {
    totalReservations: 0,
    totalRevenue: 0,
    averageStay: 0,
    categories: [
      { name: '숙박', count: 0, value: 0, percentage: 0 },
      { name: '식사', count: 0, value: 0, percentage: 0 },
      { name: '프로그램', count: 0, value: 0, percentage: 0 },
      { name: '대관', count: 0, value: 0, percentage: 0 }
    ],
    organizations: [],
    dailyData: []
  };
  
  // Handle search to refetch data
  const handleSearch = () => {
    console.log("Searching with parameters:", { year, month, searchTerm });
    try {
      refetch({
        variables: {
          period: `${year}-${month}`,
          type: 'monthly'
        }
      }).then(result => {
        console.log("Refetch result:", result);
      }).catch(err => {
        console.error("Error during refetch:", err);
      });
      
      refetchReservations().then(result => {
        console.log("Refetch reservations result:", result);
      }).catch(err => {
        console.error("Error during refetch reservations:", err);
      });
    } catch (error) {
      console.error("Error during search:", error);
      showAlert('검색 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Open print dialog
  const handleOpenPrintDialog = () => {
    setPrintDialogOpen(true);
  };
  
  // Close print dialog
  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };
  
  // Generate PDF report
  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      
      // 헤더 정보
      doc.setFontSize(20);
      doc.text(`수주보고서 (${year}년 ${month}월)`, 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`작성일: ${moment().format('YYYY-MM-DD')}`, 105, 30, { align: 'center' });
      
      // 기본 정보
      doc.setFontSize(14);
      doc.text('1. 기본 현황', 14, 45);
      
      const basicInfoRows = [
        ['총 예약 건수', `${statsData.totalReservations}건`],
        ['총 매출', `${(statsData.totalRevenue / 10000).toFixed(1)}만원`],
        ['평균 숙박일', `${statsData.averageStay.toFixed(1)}일`],
        ['객실 점유율', `${Math.floor((statsData.totalReservations / 60) * 100)}%`]
      ];
      
      doc.autoTable({
        startY: 50,
        head: [['항목', '내용']],
        body: basicInfoRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 14, right: 14 }
      });
      
      // ... rest of PDF generation code ...
      
      // PDF 출력
      doc.save(`수주보고서_${year}년${month}월.pdf`);
      handleClosePrintDialog();
      
      showAlert('수주보고서 PDF가 성공적으로 생성되었습니다.', 'success');
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    }
  };
  
  return (
    <Page5Layout 
      title="이용내역서"
      icon={<ReceiptIcon fontSize="large" />}
      activeTab="usage-report"
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>연도</InputLabel>
                  <Select
                    value={year}
                    onChange={(event) => {
                      setYear(event.target.value);
                    }}
                    label="연도"
                  >
                    {Array.from({ length: 5 }, (_, i) => 
                      moment().subtract(2, 'year').add(i, 'year').format('YYYY')
                    ).map((y) => (
                      <MenuItem key={y} value={y}>{y}년</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>월</InputLabel>
                  <Select
                    value={month}
                    onChange={(event) => {
                      setMonth(event.target.value);
                    }}
                    label="월"
                  >
                    {Array.from({ length: 12 }, (_, i) => 
                      (i + 1).toString().padStart(2, '0')
                    ).map((m) => (
                      <MenuItem key={m} value={m}>{m}월</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="검색어 입력..."
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                  >
                    검색
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={handleOpenPrintDialog}
                  >
                    보고서 출력
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {/* Monthly statistics report */}
          <MonthlyStatisticsReport
            data={statsData}
            reservationsData={reservationsData}
            year={year}
            month={month}
          />
        </Box>
      </Box>
      
      {/* Print dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        aria-labelledby="print-dialog-title"
      >
        <DialogTitle id="print-dialog-title">보고서 출력</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography paragraph>
              {`${year}년 ${month}월 수주보고서를 PDF로 생성하시겠습니까?`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              생성된 PDF는 자동으로 다운로드됩니다.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleGeneratePDF} color="primary" autoFocus>
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Page5Layout>
  );
};

export default OrderReportTab; 