import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@apollo/client';
import moment from 'moment';

// Icons
import HotelIcon from '@mui/icons-material/Hotel';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';

// GraphQL queries
import { 
  GET_ROOM_MANAGE_BY_PAGE1_ID, 
  GET_AVAILABLE_ROOMS_BY_DATE 
} from '../graphql/queries';

const RoomManageInfo = ({ page1Id, startDate, endDate }) => {
  const theme = useTheme();
  const [roomManageData, setRoomManageData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Query room management data
  const { 
    loading: loadingManage, 
    error: errorManage, 
    data: dataManage,
    refetch: refetchManage 
  } = useQuery(GET_ROOM_MANAGE_BY_PAGE1_ID, {
    variables: { page1Id: parseInt(page1Id) },
    skip: !page1Id,
    fetchPolicy: 'network-only'
  });

  // Query available rooms data if dates are provided
  const { 
    loading: loadingRooms, 
    error: errorRooms, 
    data: dataRooms,
    refetch: refetchRooms 
  } = useQuery(GET_AVAILABLE_ROOMS_BY_DATE, {
    variables: { 
      startDate: startDate || moment().format('YYYY-MM-DD'),
      endDate: endDate || moment().add(1, 'day').format('YYYY-MM-DD'),
      excludePage1Id: parseInt(page1Id)
    },
    skip: !startDate || !endDate,
    fetchPolicy: 'network-only'
  });

  // Process data when it changes
  useEffect(() => {
    setLoading(loadingManage || loadingRooms);
    
    if (errorManage) {
      setError(errorManage.message);
    } else if (errorRooms) {
      setError(errorRooms.message);
    } else {
      setError(null);
    }
    
    if (dataManage?.getRoomManageByPage1Id) {
      setRoomManageData(dataManage.getRoomManageByPage1Id);
    }
    
    if (dataRooms?.getAvailableRoomsByDate) {
      setRoomsData(dataRooms.getAvailableRoomsByDate);
    }
  }, [dataManage, dataRooms, loadingManage, loadingRooms, errorManage, errorRooms]);

  // Function to get room details by ID
  const getRoomDetails = (roomId) => {
    if (!roomsData || roomsData.length === 0) return null;
    return roomsData.find(room => room.id == roomId);
  };

  // Calculate availability status
  const getAvailabilityStatus = (record) => {
    if (record.status === 'available') {
      return { label: '이용 가능', color: 'success', icon: <CheckCircleIcon /> };
    } else if (record.status === 'occupied') {
      return { label: '이용 불가', color: 'error', icon: <CancelIcon /> };
    } else if (record.status === 'maintenance') {
      return { label: '유지보수 중', color: 'warning', icon: <WarningIcon /> };
    } else {
      return { label: record.status, color: 'default', icon: null };
    }
  };

  // Refresh data
  const handleRefresh = () => {
    refetchManage();
    if (startDate && endDate) {
      refetchRooms();
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <MeetingRoomIcon sx={{ mr: 1 }} /> 객실 관리 현황
        </Typography>
        <Button variant="outlined" size="small" onClick={handleRefresh}>
          새로고침
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Typography>데이터 로딩 중...</Typography>
      ) : roomManageData.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>객실번호</TableCell>
                <TableCell>객실유형</TableCell>
                <TableCell>체크인</TableCell>
                <TableCell>체크아웃</TableCell>
                <TableCell>박</TableCell>
                <TableCell>인원</TableCell>
                <TableCell>단체명</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomManageData.map((record) => {
                const roomDetails = getRoomDetails(record.room_id);
                const status = getAvailabilityStatus(record);
                
                return (
                  <TableRow key={record.id}>
                    <TableCell>{roomDetails?.room_name || `객실 ${record.room_id}`}</TableCell>
                    <TableCell>{roomDetails?.room_type || '알 수 없음'}</TableCell>
                    <TableCell>{moment(record.check_in_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell>{moment(record.check_out_date).format('YYYY-MM-DD')}</TableCell>
                    <TableCell>{record.nights || 1}</TableCell>
                    <TableCell>{record.occupancy || 1}</TableCell>
                    <TableCell>{record.organization_name || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        label={status.label}
                        color={status.color} 
                        icon={status.icon}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box py={2} textAlign="center">
          <Typography color="textSecondary">
            현재 등록된 객실 예약 정보가 없습니다.
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          <EventIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
          객실 이용 가능 현황 ({startDate || '날짜 미선택'} ~ {endDate || '날짜 미선택'})
        </Typography>
        
        {roomsData.length > 0 ? (
          <Grid container spacing={1} mt={1}>
            {roomsData.map((room) => {
              const isAvailable = room.reservations.length === 0;
              return (
                <Grid item key={room.id} xs={6} sm={4} md={3} lg={2}>
                  <Paper 
                    elevation={0} 
                    variant="outlined"
                    sx={{ 
                      p: 1, 
                      borderColor: isAvailable ? theme.palette.success.light : theme.palette.error.light,
                      backgroundColor: isAvailable ? theme.palette.success.lightest : theme.palette.error.lightest
                    }}
                  >
                    <Typography variant="subtitle2">{room.room_name}</Typography>
                    <Typography variant="body2" color="textSecondary">{room.room_type}</Typography>
                    <Chip 
                      size="small" 
                      label={isAvailable ? '이용 가능' : '이용 불가'}
                      color={isAvailable ? 'success' : 'error'} 
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : startDate && endDate ? (
          <Typography color="textSecondary" textAlign="center" py={1}>
            {loadingRooms ? '객실 정보 로딩 중...' : '이용 가능한 객실 정보가 없습니다.'}
          </Typography>
        ) : (
          <Typography color="textSecondary" textAlign="center" py={1}>
            체크인, 체크아웃 날짜를 선택하면 객실 이용 가능 정보가 표시됩니다.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default RoomManageInfo; 