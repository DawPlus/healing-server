import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_STATISTICS, GET_PAGE5_RESERVATION_LIST, GET_PAGE5_RESERVATION_DETAIL } from '../graphql';
import { formatDate, showAlert } from '../services/dataService';
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
import Page5Layout from './Page5Layout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportSalesReportExcel } from '../../Page5/salesReportExcelExport';

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
import AssignmentIcon from '@mui/icons-material/Assignment';
import DownloadIcon from '@mui/icons-material/Download';

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
            
            // Since discount and quantity aren't available in the API, use default values
            const discount = 0; // No discount
            const roomPrice = safeParseNumber(room.price);
            const nights = room.nights || 1;
            const quantity = 1; // Default: one room
            
            // Calculate total price (without discount)
            const roomTotal = roomPrice * nights * quantity;
            
            categories[0].count++;
            categories[0].value += roomTotal;
            reservationRevenue += roomTotal;
            
            console.log(`Room: ${room.room_name}, Price: ${roomPrice}, Nights: ${nights}, Quantity: ${quantity}, Discount: ${discount}%, Total: ${roomTotal}`);
            
            // Update daily data for room
            try {
              if (room.check_in_date) {
                const checkInDate = moment(room.check_in_date);
                for (let i = 0; i < nights; i++) {
                  const date = checkInDate.clone().add(i, 'days');
                  // Only count if the date is in the selected month
                  if (date.format('YYYY-MM') === `${year}-${month}`) {
                    const dayIndex = date.date() - 1;
                    if (dayIndex >= 0 && dayIndex < dailyData.length) {
                      dailyData[dayIndex].count++;
                      // Divide the room price by the number of nights for daily attribution
                      dailyData[dayIndex].value += roomTotal / nights;
                    }
                  }
                }
              }
            } catch (error) {
              console.warn('Error processing room data:', error);
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
            
            const mealPrice = safeParseNumber(meal.price);
            const participants = meal.participants || 0;
            
            // Calculate total price
            let mealTotal = 0;
            
            if (participants > 0) {
              const unitPrice = Math.round(mealPrice / participants);
              mealTotal = unitPrice * participants;
              console.log(`Meal: ${meal.meal_type}, Unit Price: ${unitPrice}, Participants: ${participants}, Total: ${mealTotal}`);
            } else {
              mealTotal = mealPrice;
              console.log(`Meal: ${meal.meal_type}, Price: ${mealPrice} (no participants), Total: ${mealTotal}`);
            }
            
            categories[1].count++;
            categories[1].value += mealTotal;
            reservationRevenue += mealTotal;
            
            // Update daily data for meal
            try {
              if (meal.date) {
                const mealDate = moment(meal.date);
                if (mealDate.format('YYYY-MM') === `${year}-${month}`) {
                  const dayIndex = mealDate.date() - 1;
                  if (dayIndex >= 0 && dayIndex < dailyData.length) {
                    dailyData[dayIndex].count++;
                    dailyData[dayIndex].value += mealTotal;
                  }
                }
              }
            } catch (error) {
              console.warn('Error processing meal data:', error);
            }
          });
        } else {
          console.log(`No meal plans for ${reservation.group_name}`);
        }
        
        // Process place data
        if (reservation.page3 && reservation.page3.place_reservations && reservation.page3.place_reservations.length > 0) {
          console.log(`Processing ${reservation.page3.place_reservations.length} place reservations for ${reservation.group_name}`);
          
          reservation.page3.place_reservations.forEach(place => {
            if (!place) return;
            
            // Log the raw place reservation object to debug
            console.log("Raw place reservation data:", JSON.stringify(place));
            
            // Since discount isn't available in the API, use default values
            const discount = 0; // Default: no discount
            
            // Ensure price is a number using our helper
            const placePrice = safeParseNumber(place.price);
            
            // Additional debug info
            console.log(`Place: ${place.place_name}, Price: ${placePrice}, Type: ${typeof placePrice}`);
            
            if (placePrice > 0) {
              // Use the full price without discount
              const placeTotal = placePrice;
              
              categories[3].count++;
              categories[3].value += placeTotal;
              reservationRevenue += placeTotal;
              
              console.log(`Added place ${place.place_name} with price ${placeTotal} to total. Category total: ${categories[3].value}`);
              
              // Update daily data for place
              try {
                if (place.reservation_date) {
                  const placeDate = moment(place.reservation_date);
                  if (placeDate.format('YYYY-MM') === `${year}-${month}`) {
                    const dayIndex = placeDate.date() - 1;
                    if (dayIndex >= 0 && dayIndex < dailyData.length) {
                      dailyData[dayIndex].count++;
                      dailyData[dayIndex].value += placeTotal;
                    }
                  }
                }
              } catch (error) {
                console.warn('Error processing place data:', error);
              }
            } else {
              console.warn(`Place ${place.place_name} has zero or invalid price: ${place.price}`);
            }
          });
        } else {
          console.log(`No place reservations for ${reservation.group_name}`);
        }
        
        // Process program data
        if (reservation.page2_reservations && reservation.page2_reservations.length > 0) {
          let programCount = 0;
          reservation.page2_reservations.forEach(page2 => {
            if (page2 && page2.programs && page2.programs.length > 0) {
              programCount += page2.programs.length;
            }
          });
          
          console.log(`Processing ${programCount} programs from ${reservation.page2_reservations.length} page2 reservations for ${reservation.group_name}`);
          
          reservation.page2_reservations.forEach(page2 => {
            if (page2 && page2.programs && page2.programs.length > 0) {
              page2.programs.forEach(program => {
                if (!program) return;
                
                // Log the raw program object to debug
                console.log("Raw program data:", JSON.stringify(program));
                
                // Use price directly from the program - ensure it's a number with our helper
                const programPrice = safeParseNumber(program.price);
                
                // Additional debug info
                console.log(`Program: ${program.program_name}, Price: ${programPrice}, Type: ${typeof programPrice}`);
                
                if (programPrice > 0) {
                  categories[2].count++;
                  categories[2].value += programPrice;
                  reservationRevenue += programPrice;
                  
                  console.log(`Added program ${program.program_name} with price ${programPrice} to total`);
                  
                  // Update daily data for program
                  try {
                    if (program.date) {
                      const programDate = moment(program.date);
                      if (programDate.format('YYYY-MM') === `${year}-${month}`) {
                        const dayIndex = programDate.date() - 1;
                        if (dayIndex >= 0 && dayIndex < dailyData.length) {
                          dailyData[dayIndex].count++;
                          dailyData[dayIndex].value += programPrice;
                        }
                      }
                    }
                  } catch (error) {
                    console.warn('Error processing program data:', error);
                  }
                } else {
                  console.warn(`Program ${program.program_name} has zero or invalid price: ${program.price}`);
                }
              });
            }
          });
        } else {
          console.log(`No programs for ${reservation.group_name}`);
        }
        
        // Update organization revenue
        orgData.total_revenue += reservationRevenue;
        organizationMap.set(orgName, orgData);
        
        console.log(`Total revenue for ${reservation.group_name}: ${reservationRevenue}`);
      });
      
      // Calculate total values
      const totalRevenue = categories.reduce((sum, category) => sum + category.value, 0);
      console.log(`Total revenue across all categories: ${totalRevenue}`);
      
      // Calculate percentages
      if (totalRevenue > 0) {
        categories.forEach(category => {
          category.percentage = (category.value / totalRevenue) * 100;
        });
      }
      
      // Convert organization map to array and calculate percentages
      const organizations = Array.from(organizationMap.values());
      if (totalRevenue > 0) {
        organizations.forEach(org => {
          org.percentage = (org.total_revenue / totalRevenue) * 100;
        });
      }
      
      // Sort organizations by revenue (descending)
      organizations.sort((a, b) => b.total_revenue - a.total_revenue);
      
      // Calculate average stay
      let totalNights = 0;
      let roomReservations = 0;
      
      reservationsData.getPage1List.forEach(reservation => {
        if (reservation.page3 && reservation.page3.room_selections) {
          reservation.page3.room_selections.forEach(room => {
            if (room && room.nights) {
              totalNights += room.nights;
              roomReservations++;
            }
          });
        }
      });
      
      const averageStay = roomReservations > 0 ? totalNights / roomReservations : 0;
      
      const result = {
        totalRevenue,
        totalReservations: reservationsData.getPage1List.length,
        averageStay,
        categories,
        organizations,
        dailyData
      };
      
      console.log("Processed data result:", result);
      return result;
    } catch (error) {
      console.error('Error processing reservation data:', error);
      return {
        totalRevenue: 0,
        totalReservations: 0,
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
    }
  };
  
  // Process the data
  const processedData = processReservationData();
  
  // Use processed data or fallback to provided data
  const displayData = {
    totalReservations: processedData.totalReservations || data.totalReservations || 0,
    totalRevenue: processedData.totalRevenue || data.totalRevenue || 0,
    averageStay: processedData.averageStay || data.averageStay || 0,
    categories: processedData.categories.length > 0 ? processedData.categories : (data.categories || []),
    organizations: processedData.organizations.length > 0 ? processedData.organizations : (data.organizations || []),
    dailyData: processedData.dailyData.length > 0 ? processedData.dailyData : (data.dailyData || [])
  };
  
  // If there's no data at all, show a fallback message
  if (displayData.totalReservations === 0 && reservationsData?.getPage1List?.length > 0) {
    console.log("No data filtered for the selected period, but reservations exist");
    // Automatically look for reservations in nearby months if necessary
    // This is just for logging, we won't actually change the user's selection
    const nearbyMonths = [
      { year, month: parseInt(month) - 1 },
      { year, month: parseInt(month) + 1 },
    ];
    
    nearbyMonths.forEach(({ year, month }) => {
      const adjustedMonth = month < 1 ? 12 : month > 12 ? 1 : month;
      const adjustedYear = month < 1 ? year - 1 : month > 12 ? year + 1 : year;
      console.log(`Checking for reservations in nearby month: ${adjustedYear}-${adjustedMonth}`);
      
      reservationsData.getPage1List.forEach(reservation => {
        const reservationMonth = moment(reservation.start_date).month() + 1;
        const reservationYear = moment(reservation.start_date).year();
        if (reservationMonth === adjustedMonth && reservationYear === adjustedYear) {
          console.log(`Found reservation in ${adjustedYear}-${adjustedMonth}: ${reservation.group_name}`);
        }
      });
    });
  }
  
  // Format data for charts
  const barChartData = displayData.categories.map(cat => ({
    name: cat.name,
    value: cat.value / 10000 // Convert to 만원
  }));
  
  const pieChartData = displayData.categories.map(cat => ({
    name: cat.name,
    value: cat.percentage
  }));
  
  const categoryColors = [
    theme.palette.primary.main, 
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.success.main
  ];
  
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 예약 건수
              </Typography>
              <Typography variant="h4">
                {displayData.totalReservations}건
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
                {((displayData.totalRevenue || 0) / 10000).toFixed(1)}만원
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
                {displayData.averageStay.toFixed(1)}일
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
                {Math.floor(((displayData.totalReservations || 0) / 60) * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    항목별 수익 분석
                  </Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>카테고리</TableCell>
                      <TableCell align="right">건수</TableCell>
                      <TableCell align="right">수익</TableCell>
                      <TableCell align="right">비율</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayData.categories.map((category, index) => (
                      <TableRow key={category.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {category.name === '숙박' && <HomeIcon fontSize="small" sx={{ mr: 1 }} />}
                            {category.name === '식사' && <RestaurantIcon fontSize="small" sx={{ mr: 1 }} />}
                            {category.name === '프로그램' && <SportsKabaddiIcon fontSize="small" sx={{ mr: 1 }} />}
                            {category.name === '대관' && <MeetingRoomIcon fontSize="small" sx={{ mr: 1 }} />}
                            {category.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{category.count}건</TableCell>
                        <TableCell align="right">{(category.value / 10000).toFixed(1)}만원</TableCell>
                        <TableCell align="right">
                          {category.percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>총계</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {displayData.categories.reduce((sum, item) => sum + item.count, 0)}건
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {((displayData.totalRevenue || 0) / 10000).toFixed(1)}만원
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ height: 300, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}만원`} />
                    <Legend />
                    <Bar dataKey="value" name="매출액(만원)" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PieChartIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    단체별 예약 분석
                  </Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>단체명</TableCell>
                      <TableCell align="right">예약 건수</TableCell>
                      <TableCell align="right">매출액</TableCell>
                      <TableCell align="right">비율</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayData.organizations.map((org) => (
                      <TableRow key={org.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                            {org.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{org.reservations_count}건</TableCell>
                        <TableCell align="right">{(org.total_revenue / 10000).toFixed(1)}만원</TableCell>
                        <TableCell align="right">{org.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>총계</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {displayData.organizations.reduce((sum, item) => sum + item.reservations_count, 0)}건
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {((displayData.totalRevenue || 0) / 10000).toFixed(1)}만원
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ height: 300, mt: 3, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="80%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    일별 현황
                  </Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>날짜</TableCell>
                      <TableCell align="right">예약수</TableCell>
                      <TableCell align="right">매출</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayData.dailyData.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>{moment(day.date).format('YYYY-MM-DD')}</TableCell>
                        <TableCell align="right">{day.count}건</TableCell>
                        <TableCell align="right">{(day.value / 10000).toFixed(1)}만원</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ height: 300, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayData.dailyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => moment(value).format('DD')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => moment(value).format('YYYY-MM-DD')}
                      formatter={(value, name) => {
                        if (name === 'value') return `${(value / 10000).toFixed(1)}만원`;
                        return value;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="예약수" fill={theme.palette.primary.main} />
                    <Bar dataKey="value" name="매출액" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// 수주보고 메인 컴포넌트
const OrderReport = () => {
  const theme = useTheme();
  const location = useLocation();
  const [year, setYear] = useState(moment().format('YYYY'));
  const [month, setMonth] = useState(moment().format('MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  // Queries
  const { loading: statsLoading, error: statsError, data: statsData } = useQuery(GET_PAGE5_STATISTICS, {
    variables: { period: `${year}-${month}`, type: 'monthly' },
    fetchPolicy: 'network-only'
  });
  
  const { loading: reservationsLoading, error: reservationsError, data: reservationsData } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only'
  });
  
  // Search functionality
  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
    // Implement search functionality here
    if (!searchTerm.trim()) {
      showAlert('검색어를 입력해주세요', 'warning');
      return;
    }
    
    // Search logic implemented in the component will filter the displayed data
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // PDF generation dialog handlers
  const handleOpenPrintDialog = () => {
    setPrintDialogOpen(true);
  };
  
  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };
  
  // PDF generation function
  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title and date
      doc.setFontSize(20);
      doc.text(`${year}년 ${month}월 이용실적 보고서`, 14, 20);
      
      doc.setFontSize(12);
      doc.text(`생성일: ${moment().format('YYYY-MM-DD')}`, 14, 30);
      
      if (statsData) {
        // Summary data
        doc.autoTable({
          startY: 40,
          head: [['지표', '값']],
          body: [
            ['총 예약 수', `${statsData.totalReservations || 0}건`],
            ['총 매출액', `${(statsData.totalRevenue || 0).toLocaleString()}원`],
            ['평균 체류 기간', `${statsData.averageStay || 0}일`]
          ],
          theme: 'grid'
        });
        
        // Category breakdown
        if (statsData.categories && statsData.categories.length > 0) {
          doc.autoTable({
            startY: doc.previousAutoTable.finalY + 10,
            head: [['카테고리', '건수', '매출액', '비중']],
            body: statsData.categories.map(category => [
              category.name,
              `${category.count}건`,
              `${category.value.toLocaleString()}원`,
              `${category.percentage.toFixed(1)}%`
            ]),
            theme: 'grid'
          });
        }
        
        // Organization data
        if (statsData.organizations && statsData.organizations.length > 0) {
          doc.autoTable({
            startY: doc.previousAutoTable.finalY + 10,
            head: [['단체명', '예약 수', '매출액', '비중']],
            body: statsData.organizations.map(org => [
              org.name,
              `${org.reservations_count}건`,
              `${org.total_revenue.toLocaleString()}원`,
              `${org.percentage.toFixed(1)}%`
            ]),
            theme: 'grid'
          });
        }
      }
      
      doc.save(`매출보고서_${year}${month}.pdf`);
      
      // Close dialog and show success alert
      handleClosePrintDialog();
      showAlert('PDF 파일이 생성되었습니다', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다', 'error');
      handleClosePrintDialog();
    }
  };

  // Excel generation function for sales report
  const handleGenerateExcel = () => {
    try {
      if (!reservationsData || !reservationsData.getPage1List) {
        showAlert('데이터가 없습니다', 'warning');
        return;
      }

      const success = exportSalesReportExcel(reservationsData, parseInt(year), parseInt(month));
      
      if (success) {
        showAlert('매출실적 엑셀 파일이 생성되었습니다', 'success');
      } else {
        showAlert('엑셀 파일 생성 중 오류가 발생했습니다', 'error');
      }
    } catch (error) {
      console.error('Excel generation error:', error);
      showAlert('엑셀 파일 생성 중 오류가 발생했습니다', 'error');
    }
  };
  
  return (
    <Page5Layout 
      title="이용실적(매출)" 
      icon={<AssessmentIcon />}
      activeTab="usage-report"
    >
      <Box sx={{ width: '100%' }}>
        {/* Monthly statistics content - directly rendered without tabs */}
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
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleGenerateExcel}
                  size="small"
                  disabled={reservationsLoading}
                  sx={{ mr: 1 }}
                >
                  매출실적 다운로드
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
            
              </Grid>
              
         
            </Grid>
          </Box>
          
          <MonthlyStatisticsReport 
            data={statsData} 
            reservationsData={reservationsData} 
            year={year} 
            month={month} 
          />
        </Box>
        
        {/* Print Dialog */}
        <Dialog open={printDialogOpen} onClose={handleClosePrintDialog}>
          <DialogTitle>보고서 출력</DialogTitle>
          <DialogContent>
            <Typography paragraph>
              {year}년 {month}월 이용실적 보고서를 PDF로 출력하시겠습니까?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePrintDialog}>취소</Button>
            <Button onClick={handleGeneratePDF} color="primary">확인</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Page5Layout>
  );
};

export default OrderReport; 