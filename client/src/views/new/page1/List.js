import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  useTheme,
  Avatar,
  Chip,
  Tooltip,
  MenuItem,
  Fab,
  IconButton,
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { GET_PAGE1_LIST } from './graphql/queries';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';

// Helper function to format dates
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    return moment(dateString).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

const List = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // GraphQL query for Page1 list
  const { loading, error, data, refetch } = useQuery(GET_PAGE1_LIST);
  
  // Select a reservation row to edit
  const handleRowClick = (page1) => {
    // Navigate to edit page with reservation ID
    navigate(`/new/page1/edit/${page1.id}`);
  };

  // Reset form to create a new reservation
  const handleNewReservation = () => {
    // Navigate to edit page with no ID, which will create a new reservation
    navigate('/new/page1/edit/new');
  };

  // Filter reservations based on search term and status
  const filteredReservations = data?.getPage1List?.filter(page1 => {
    // Apply search filter
    const searchMatch = 
      page1.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page1.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page1.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const statusMatch = 
      filterStatus === 'all' ||
      (filterStatus === 'preparation' && page1.reservation_status === 'preparation') ||
      (filterStatus === 'confirmed' && page1.reservation_status === 'confirmed');
    
    return searchMatch && statusMatch;
  }) || [];

  // Get reservation status chip
  const getStatusChip = (status) => {
    switch(status) {
      case 'preparation':
        return <Chip label="가예약" size="small" color="primary" />;
      case 'confirmed':
        return <Chip label="확정예약" size="small" color="success" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <MainCard title={
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CalendarMonthIcon sx={{ mr: 1 }} />
        <Typography variant="h3">예약 관리시스템</Typography>
      </Box>
    }>
      {/* Reservations List Panel */}
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Card elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
            {/* First Row - 4 items using flexbox */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mb: 2 
            }}>
              <Box sx={{ flex: '1 1 0', minWidth: '150px' }}>
                <TextField
                  fullWidth
                  placeholder="단체명, 고객명, 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 0', minWidth: '150px' }}>
                <TextField
                  select
                  fullWidth
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="예약상태"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="preparation">가예약</MenuItem>
                  <MenuItem value="confirmed">확정예약</MenuItem>
                </TextField>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<ReplayIcon />}
                  onClick={() => refetch()}
                >
                  새로고침
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={handleNewReservation}
                >
                  신규예약
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
        
        {/* Reservations Table */}
        <Box sx={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              color: 'error.main' 
            }}>
              <Typography>데이터를 불러오는 중 오류가 발생했습니다.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>상태</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>기간</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>단체명</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>고객명</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>연락처</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>이메일</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          예약 데이터가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((page1) => (
                      <TableRow 
                        key={page1.id} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover,
                            cursor: 'pointer'
                          } 
                        }}
                        onClick={() => handleRowClick(page1)}
                      >
                        <TableCell>
                          {getStatusChip(page1.reservation_status)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">
                              {formatDateForDisplay(page1.start_date)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              ~ {formatDateForDisplay(page1.end_date)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{page1.group_name || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.light, fontSize: '0.8rem' }}>
                              {page1.customer_name?.[0] || '?'}
                            </Avatar>
                            <Typography variant="body2">{page1.customer_name || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {page1.mobile_phone && (
                              <Typography variant="body2">
                                <PhoneIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle', color: 'text.secondary' }} />
                                {page1.mobile_phone}
                              </Typography>
                            )}
                            {page1.landline_phone && (
                              <Typography variant="body2" color="textSecondary">
                                <PhoneIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'middle', color: 'text.secondary' }} />
                                {page1.landline_phone}
                              </Typography>
                            )}
                            {!page1.mobile_phone && !page1.landline_phone && '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {page1.email ? (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'text.secondary' }} />
                                {page1.email}
                              </Box>
                            ) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="편집">
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(page1);
                            }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      
      {/* Floating Action Button for New Reservation */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}
        onClick={handleNewReservation}
      >
        <AddIcon />
      </Fab>
    </MainCard>
  );
};

export default List; 