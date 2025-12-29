import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import moment from 'moment';
import LoadingComponent from './LoadingComponent';

const ReservationStatusTab = () => {
  const dispatch = useDispatch();
  
  // Redux 상태 가져오기
  const {
    reservationStatus,
    selectedMonth,
    isLoading,
    error
  } = ""

  // 월 선택 핸들러
  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    dispatch(actions.setSelectedMonth(newMonth));
    dispatch(actions.fetchReservationStatus({ month: newMonth }));
  };

  // 출력 핸들러
  const handlePrint = () => {
    dispatch(actions.printReport({ type: 'reservation_status', params: { month: selectedMonth } }));
  };

  // 엑셀 내보내기 핸들러
  const handleExportExcel = () => {
    dispatch(actions.exportExcel({ type: 'reservation_status', params: { month: selectedMonth } }));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="월 선택"
            value={selectedMonth}
            onChange={handleMonthChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          >
            <MenuItem value={moment().format('YYYY-MM')}>
              <Typography sx={{ fontWeight: 'medium' }}>{moment().format('YYYY년 M월')}</Typography>
            </MenuItem>
            <MenuItem value={moment().subtract(1, 'months').format('YYYY-MM')}>
              <Typography sx={{ fontWeight: 'medium' }}>{moment().subtract(1, 'months').format('YYYY년 M월')}</Typography>
            </MenuItem>
            <MenuItem value={moment().subtract(2, 'months').format('YYYY-MM')}>
              <Typography sx={{ fontWeight: 'medium' }}>{moment().subtract(2, 'months').format('YYYY년 M월')}</Typography>
            </MenuItem>
            <MenuItem value={moment().add(1, 'months').format('YYYY-MM')}>
              <Typography sx={{ fontWeight: 'medium' }}>{moment().add(1, 'months').format('YYYY년 M월')}</Typography>
            </MenuItem>
            <MenuItem value={moment().add(2, 'months').format('YYYY-MM')}>
              <Typography sx={{ fontWeight: 'medium' }}>{moment().add(2, 'months').format('YYYY년 M월')}</Typography>
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />} 
            sx={{ mr: 1, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            onClick={handlePrint}
            disabled={isLoading}
          >
            현황표 출력
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            onClick={handleExportExcel}
            disabled={isLoading}
          >
            엑셀
          </Button>
        </Grid>
      </Grid>

      {isLoading ? <LoadingComponent /> : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '15%' }}>날짜</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '25%' }}>단체명</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '15%' }}>프로그램</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '10%' }}>인원</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '15%' }}>담당자</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '10%' }}>연락처</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '10%' }}>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                      <Typography color="error">데이터 로드 오류: {error}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(reservationStatus) || reservationStatus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                      <CalendarMonthIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography color="textSecondary">선택한 월에 예약 데이터가 없습니다.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                reservationStatus.map((reservation, index) => (
                  <TableRow key={index} sx={{ 
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    transition: 'background-color 0.2s'
                  }}>
                    <TableCell>{reservation.date}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{reservation.group_name}</TableCell>
                    <TableCell>{reservation.program}</TableCell>
                    <TableCell>{reservation.participants}명</TableCell>
                    <TableCell>{reservation.contact_name}</TableCell>
                    <TableCell>{reservation.contact_phone}</TableCell>
                    <TableCell>
                      {reservation.status === 'confirmed' ? 
                        <Typography color="success.main" sx={{ fontWeight: 'bold' }}>확정</Typography> : 
                        reservation.status === 'pending' ? 
                        <Typography color="warning.main" sx={{ fontWeight: 'bold' }}>대기</Typography> :
                        <Typography color="error.main" sx={{ fontWeight: 'bold' }}>취소</Typography>
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Paper elevation={2} sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: '#f5f7ff' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e', display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1 }} /> 세부 기능 설명
        </Typography>
        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          <ListItem>
            <ListItemText 
              primary="• 월별로 확인가능(달력 형태)" 
              secondary="월별로 예약 현황을 달력 형태로 확인할 수 있습니다." 
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText 
              primary="• 세부양식 불림6. 예약종합상태 확인 준용" 
              secondary="예약종합상태 확인은 지정된 양식에 따라 제공됩니다." 
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default ReservationStatusTab; 