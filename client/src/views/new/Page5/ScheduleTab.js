import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker, StaticDatePicker } from '@mui/x-date-pickers';
import koLocale from 'date-fns/locale/ko';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_RESERVATION_LIST } from './graphql';
import apolloClient from 'utils/apolloClient';
import moment from 'moment';

// Import services
import { formatDate, fetchAllPage1DataForPage5 } from './services/dataService';
import exportMonthlySchedule from './services/scheduleExcelExport';
import exportWeeklySchedule from './services/weeklyScheduleExport';

// Import components
import Page5Layout from './components/Page5Layout';
import EventNoteIcon from '@mui/icons-material/EventNote';

// Import icons
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parse, isWithinInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';

// Function to get date range
const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateRange = [];
  
  let currentDate = new Date(start);
  while (currentDate <= end) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateRange;
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
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

const ScheduleTabContent = () => {
  // Use Apollo client for data fetching
  const { loading, error, data, refetch } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    client: apolloClient,
    fetchPolicy: 'network-only'
  });
  
  const [searchDate, setSearchDate] = useState(null);
  const [searchGroup, setSearchGroup] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [filteredReservations, setFilteredReservations] = useState([]);

  // New state for weekly schedule tab
  const [tabValue, setTabValue] = useState(0);
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekEndDate, setWeekEndDate] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Calculate week range when selectedWeek changes
  useEffect(() => {
    if (selectedWeek) {
      const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      setWeekStartDate(start);
      setWeekEndDate(end);
    }
  }, [selectedWeek]);
  
  // Update filtered reservations when data changes
  useEffect(() => {
    if (data && data.getPage1List) {
      const reservations = data.getPage1List;
      const filtered = reservations.map(reservation => ({
        id: reservation.id,
        groupName: reservation.group_name || '단체명 없음',
        date: formatDate(reservation.start_date),
        type: reservation.reservation_status === 'preparation' ? '가예약' : 
              reservation.reservation_status === 'confirmed' ? '확정예약' : '일정미정',
        business_category: reservation.business_category,
        customer_name: reservation.customer_name,
        mobile_phone: reservation.mobile_phone,
        email: reservation.email,
        start_date: formatDate(reservation.start_date),
        end_date: formatDate(reservation.end_date)
      }));
      
      setFilteredReservations(filtered);
    }
  }, [data]);

  // Create scheduleData from reservation data
  const createScheduleData = () => {
    const scheduleData = {};
    
    if (data && data.getPage1List) {
      data.getPage1List.forEach(reservation => {
      const id = reservation.id;
      
      if (!scheduleData[id]) {
        // Default empty schedule structure
          const startDate = formatDate(reservation.start_date);
          const endDate = formatDate(reservation.end_date);
        const dateRange = getDateRange(startDate, endDate);
        
        const meals = {};
        const halls = {};
        const schedules = [];
        
        // Create basic schedule structure for each day
        dateRange.forEach((date, index) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          
          // Default meals
          meals[dateStr] = [];
          
          // Default halls
          halls[dateStr] = [];
          
          // Default schedule for each day
          schedules.push({
            date: dateStr,
            items: []
          });
        });
        
        scheduleData[id] = {
          groupName: reservation.group_name || '단체명 없음',
          period: `${startDate} ~ ${endDate}`,
            participants: reservation.total_count || 0,
          rooms: '정보 없음', // No room info in page1
          customer_name: reservation.customer_name,
          mobile_phone: reservation.mobile_phone,
          email: reservation.email,
          reservation_status: reservation.reservation_status,
          business_category: reservation.business_category,
          meals,
          halls,
          schedules
        };
      }
    });
    }
    
    return scheduleData;
  };
  
  // Get schedule data
  const scheduleData = createScheduleData();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Search handler
  const handleSearch = () => {
    if (!data || !data.getPage1List) return;
    
    // Apply search filters to the reservation list
    const filtered = data.getPage1List.filter(reservation => {
      // Date filter
      const dateMatch = !searchDate || (
        searchDate && isWithinInterval(
          new Date(searchDate),
          {
            start: new Date(formatDate(reservation.start_date)),
            end: new Date(formatDate(reservation.end_date))
          }
        )
      );
      
      // Group name filter
      const groupMatch = !searchGroup || (
        reservation.group_name && 
        reservation.group_name.toLowerCase().includes(searchGroup.toLowerCase())
      );
      
      return dateMatch && groupMatch;
    });
    
    // Update filtered reservations
    setFilteredReservations(filtered.map(reservation => ({
      id: reservation.id,
      groupName: reservation.group_name || '단체명 없음',
      date: formatDate(reservation.start_date),
      type: reservation.reservation_status === 'preparation' ? '가예약' : 
            reservation.reservation_status === 'confirmed' ? '확정예약' : '일정미정',
      business_category: reservation.business_category,
      customer_name: reservation.customer_name,
      mobile_phone: reservation.mobile_phone,
      email: reservation.email,
      start_date: formatDate(reservation.start_date),
      end_date: formatDate(reservation.end_date)
    })));

    // Reset selected group
    setSelectedGroup(null);
    setCurrentSchedule(null);
    setSelectedDay(0);
    setIsEditMode(false);
  };

  // Weekly search handler
  const handleWeeklySearch = () => {
    if (!data || !data.getPage1List) return;
    
    // Apply weekly filter
    const filtered = data.getPage1List.filter(reservation => {
      // Check if reservation overlaps with selected week
      const reservationStart = new Date(formatDate(reservation.start_date));
      const reservationEnd = new Date(formatDate(reservation.end_date));
      
      return (
        (reservationStart <= weekEndDate && reservationEnd >= weekStartDate) ||
        (reservationStart >= weekStartDate && reservationStart <= weekEndDate) ||
        (reservationEnd >= weekStartDate && reservationEnd <= weekEndDate)
      );
    });
    
    // Update filtered reservations
    setFilteredReservations(filtered.map(reservation => ({
      id: reservation.id,
      groupName: reservation.group_name || '단체명 없음',
      date: formatDate(reservation.start_date),
      type: reservation.reservation_status === 'preparation' ? '가예약' : 
            reservation.reservation_status === 'confirmed' ? '확정예약' : '일정미정',
      business_category: reservation.business_category,
      customer_name: reservation.customer_name,
      mobile_phone: reservation.mobile_phone,
      email: reservation.email,
      start_date: formatDate(reservation.start_date),
      end_date: formatDate(reservation.end_date)
    })));
  };

  // Group selection handler
  const handleSelectGroup = (groupId) => {
    const schedule = scheduleData[groupId] || null;
    setSelectedGroup(schedule);
    
    if (schedule) {
      // Create editing copy
      setCurrentSchedule(JSON.parse(JSON.stringify(schedule)));
      setSelectedDay(0); // Select first day
    } else {
      setCurrentSchedule(null);
    }
    
    setIsEditMode(false);
  };

  // Handle selection of a week
  const handleWeekChange = (date) => {
    setSelectedWeek(date);
  };

  // Excel export handler for monthly schedule
  const handleExportExcel = () => {
    if (searchDate) {
      const year = moment(searchDate).year();
      const month = moment(searchDate).month() + 1; // moment months are 0-indexed
      
      // Call export function
      const success = exportMonthlySchedule(year, month, []);
      
      if (success) {
        setNotification({
          open: true,
          message: '엑셀 파일이 성공적으로 다운로드되었습니다.',
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: '엑셀 파일 생성 중 오류가 발생했습니다.',
          severity: 'error'
        });
      }
    } else {
      setNotification({
        open: true,
        message: '검색 날짜를 선택해주세요.',
        severity: 'warning'
      });
    }
  };

  // Excel export handler for weekly schedule
  const handleExportWeeklyExcel = () => {
    // Convert dates to string format
    const startDate = format(weekStartDate, 'yyyy-MM-dd');
    const endDate = format(weekEndDate, 'yyyy-MM-dd');
    
    // Call export function
    const success = exportWeeklySchedule(startDate, endDate, []);
    
    if (success) {
      setNotification({
        open: true,
        message: '주간 일정 엑셀 파일이 성공적으로 다운로드되었습니다.',
        severity: 'success'
      });
    } else {
      setNotification({
        open: true,
        message: '엑셀 파일 생성 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  // Other handlers from original code
  const handleEditClick = (reservation) => {
    // Implement edit functionality
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDayChange = (event, newValue) => {
    setSelectedDay(newValue);
  };

  const handleOpenPrintDialog = () => {
    setPrintDialogOpen(true);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };

  const handleOpenEditItemDialog = (item, index) => {
    setEditingItem({ ...item });
    setEditIndex(index);
    setEditItemDialogOpen(true);
  };

  const handleCloseEditItemDialog = () => {
    setEditItemDialogOpen(false);
    setEditingItem(null);
    setEditIndex(-1);
  };

  const handleEditItemChange = (field, value) => {
    setEditingItem({
      ...editingItem,
      [field]: value
    });
  };

  const handleSaveScheduleItem = () => {
    if (!editingItem || !currentSchedule) return;
    
    const updatedSchedule = { ...currentSchedule };
    const dayData = updatedSchedule.schedules[selectedDay];
    
    if (editIndex >= 0) {
      // Update existing item
      dayData.items[editIndex] = editingItem;
    } else {
      // Add new item
      dayData.items.push(editingItem);
    }
    
    setCurrentSchedule(updatedSchedule);
    
    // Close dialog
    handleCloseEditItemDialog();
    
    // Show notification
    setNotification({
      open: true,
      message: '일정이 저장되었습니다.',
      severity: 'success'
    });
  };

  const handleDeleteScheduleItem = (index) => {
    if (!currentSchedule) return;
    
    const updatedSchedule = { ...currentSchedule };
    const dayData = updatedSchedule.schedules[selectedDay];
    
    // Remove item
    dayData.items = dayData.items.filter((_, i) => i !== index);
    
    setCurrentSchedule(updatedSchedule);
    
    // Show notification
    setNotification({
      open: true,
      message: '일정이 삭제되었습니다.',
      severity: 'success'
    });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setNotification({ ...notification, open: false });
  };

  const handlePrint = () => {
    // Implement print functionality
  };

  // Function to render weekly schedule
  const renderWeeklySchedule = () => {
    const weekDays = Array(7).fill(0).map((_, i) => 
      addDays(weekStartDate, i)
    );
    
    return (
      <Box>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                label="주 선택"
                value={selectedWeek}
                onChange={handleWeekChange}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                선택된 주: {format(weekStartDate, 'yyyy/MM/dd')} ~ {format(weekEndDate, 'yyyy/MM/dd')}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<DownloadIcon />}
                onClick={handleExportWeeklyExcel}
                sx={{ mt: 2 }}
              >
                주간 일정표 엑셀 다운로드(7번 항목)
              </Button>
              
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleWeeklySearch}
                sx={{ mt: 2, ml: 2 }}
              >
                검색
              </Button>
            </Paper>
            
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                검색 결과
              </Typography>
              
              {loading ? (
                <Typography variant="body2">데이터를 불러오는 중...</Typography>
              ) : error ? (
                <Typography variant="body2" color="error">데이터를 불러오는 중 오류가 발생했습니다.</Typography>
              ) : filteredReservations.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>단체명</TableCell>
                        <TableCell>예약 상태</TableCell>
                        <TableCell>기간</TableCell>
                        <TableCell>액션</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReservations.map((reservation) => (
                        <TableRow 
                          key={reservation.id}
                          hover
                          selected={selectedGroup && selectedGroup.groupName === reservation.groupName}
                          onClick={() => handleSelectGroup(reservation.id)}
                        >
                          <TableCell>{reservation.groupName}</TableCell>
                          <TableCell>{reservation.type}</TableCell>
                          <TableCell>{reservation.start_date} ~ {reservation.end_date}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(reservation);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  검색 결과가 없습니다.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {renderWeeklySchedule()}
      
      {/* Dialogs and notifications */}
      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog}>
        <DialogTitle>인쇄 옵션</DialogTitle>
        <DialogContent>
          <Typography>인쇄 옵션을 선택하세요</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>취소</Button>
          <Button onClick={handlePrint} variant="contained" color="primary">인쇄</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={editItemDialogOpen} onClose={handleCloseEditItemDialog}>
        <DialogTitle>일정 항목 편집</DialogTitle>
        <DialogContent>
          {editingItem && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="일정명"
                  value={editingItem.title || ''}
                  onChange={(e) => handleEditItemChange('title', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                  <TimePicker
                    label="시작 시간"
                    value={editingItem.startTime ? new Date(`2000-01-01T${editingItem.startTime}`) : null}
                    onChange={(newValue) => {
                      const timeStr = newValue ? format(newValue, 'HH:mm') : null;
                      handleEditItemChange('startTime', timeStr);
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                  <TimePicker
                    label="종료 시간"
                    value={editingItem.endTime ? new Date(`2000-01-01T${editingItem.endTime}`) : null}
                    onChange={(newValue) => {
                      const timeStr = newValue ? format(newValue, 'HH:mm') : null;
                      handleEditItemChange('endTime', timeStr);
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="장소"
                  value={editingItem.location || ''}
                  onChange={(e) => handleEditItemChange('location', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="설명"
                  value={editingItem.description || ''}
                  onChange={(e) => handleEditItemChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditItemDialog}>취소</Button>
          <Button onClick={handleSaveScheduleItem} variant="contained" color="primary">저장</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Wrap with Page5Layout for consistent navigation
const ScheduleTab = () => {
  return (
    <Page5Layout 
      title="주간 일정표 관리" 
      icon={<EventNoteIcon fontSize="large" />}
      activeTab="documents"
      breadcrumbsItems={[
        <Typography key="documents" color="text.primary">주간 일정표</Typography>
      ]}
    >
      <ScheduleTabContent />
    </Page5Layout>
  );
};

export default ScheduleTab; 