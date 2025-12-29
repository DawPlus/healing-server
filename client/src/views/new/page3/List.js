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
  IconButton,
  Fab,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQuery, useMutation, gql } from '@apollo/client';
import { DELETE_PAGE3 } from './graphql/mutations';
import Swal from 'sweetalert2';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ReplayIcon from '@mui/icons-material/Replay';
import BusinessIcon from '@mui/icons-material/Business';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FilterListIcon from '@mui/icons-material/FilterList';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

// GraphQL Queries
const GET_PAGE1_LIST = gql`
  query GetPage1List {
    getPage1List {
      id
      reservation_status
      start_date
      end_date
      group_name
      customer_name
      total_count
      email
      mobile_phone
      landline_phone
      notes
      business_category
      business_subcategory
      business_detail_category
      create_dtm
      update_dtm
      page3 {
        id
        page1_id
        company_name
        department
        contact_person
        position
        room_count
        catering_required
      }
    }
  }
`;

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
  
  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoomStatus, setFilterRoomStatus] = useState('all');
  const [filterCatering, setFilterCatering] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch data from GraphQL API
  const { loading, error, data, refetch } = useQuery(GET_PAGE1_LIST);
  
  // Helper function to get reservation status chip
  const getStatusChip = (status) => {
    switch(status) {
      case 'confirmed':
        return <Chip label="확정예약" size="small" color="success" />;
      case 'preparation':
        return <Chip label="가예약" size="small" color="primary" />;
      default:
        return <Chip label={status || '미정'} size="small" />;
    }
  };
  
  // Helper function for room status chip
  const getRoomStatusChip = (page3) => {
    if (!page3) {
      return <Chip label="미입력" size="small" variant="outlined" />;
    }
    if (page3.room_count > 0) {
      return <Chip label={`${page3.room_count}실`} size="small" color="success" />;
    }
    return <Chip label="0실" size="small" color="warning" />;
  };
  
  // Helper function for catering status chip
  const getCateringChip = (page3) => {
    if (!page3) {
      return <Chip label="미입력" size="small" variant="outlined" />;
    }
    if (page3.catering_required) {
      return <Chip label="필요" size="small" color="info" />;
    }
    return <Chip label="불필요" size="small" color="default" />;
  };
  
  // Filter and search logic
  const filteredReservations = data?.getPage1List.filter(page1 => {
    // Search term filtering
    const matchesSearch = 
      (page1.group_name && page1.group_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (page1.customer_name && page1.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (page1.page3?.company_name && page1.page3.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (page1.page3?.contact_person && page1.page3.contact_person.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filtering
    const matchesStatus = 
      filterStatus === 'all' || 
      page1.reservation_status === filterStatus;
    
    // Room status filtering
    const matchesRoomStatus = 
      filterRoomStatus === 'all' || 
      (filterRoomStatus === 'has_rooms' && page1.page3?.room_count > 0) ||
      (filterRoomStatus === 'no_rooms' && page1.page3?.room_count === 0) ||
      (filterRoomStatus === 'not_entered' && !page1.page3);
    
    // Catering filtering
    const matchesCatering = 
      filterCatering === 'all' || 
      (filterCatering === 'needed' && page1.page3?.catering_required === true) ||
      (filterCatering === 'not_needed' && page1.page3?.catering_required === false) ||
      (filterCatering === 'not_entered' && !page1.page3);
    
    return matchesSearch && matchesStatus && matchesRoomStatus && matchesCatering;
  }) || [];
  
  // Handle row click to navigate to edit page
  const handleEditPage = (page1) => {
    navigate(`/new/page3/edit/${page1.id}`);
  };
  
  // Handle new page creation
  const handleNewPage = () => {
    navigate('/new/page1/edit/create');
  };

  // Delete mutation
  const [deletePage3, { loading: deleteLoading }] = useMutation(DELETE_PAGE3, {
    onCompleted: () => {
      Swal.fire({
        icon: 'success',
        title: '삭제 완료',
        text: '예약이 성공적으로 삭제되었습니다.',
        timer: 2000,
        showConfirmButton: false
      });
      refetch();
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: '삭제 실패',
        text: error.message || '예약 삭제 중 오류가 발생했습니다.',
      });
    }
  });
  
  // Confirm and delete Page3 record
  const handleDelete = (id, e) => {
    e.stopPropagation();
    
    Swal.fire({
      title: '삭제 확인',
      text: '이 예약을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme.palette.error.main
    }).then((result) => {
      if (result.isConfirmed) {
        deletePage3({ variables: { id } });
      }
    });
  };

  return (
    <MainCard title={
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <MeetingRoomIcon sx={{ mr: 1 }} />
        <Typography variant="h3">회의실 및 시설 예약 관리</Typography>
      </Box>
    }>
      {/* Reservations List Panel */}
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Card elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
            {/* First Row - 3 items using flexbox */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mb: 2 
            }}>
              <Box sx={{ flex: '1 1 0', minWidth: '150px' }}>
                <TextField
                  fullWidth
                  placeholder="회사명, 담당자, 이메일 검색..."
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
                  <MenuItem value="canceled">취소됨</MenuItem>
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
             
              </Box>
            </Box>
          </Card>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <Typography color="error">
              데이터 로딩 중 오류가 발생했습니다: {error.message}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell width="5%">ID</TableCell>
                    <TableCell width="15%">회사명</TableCell>
                    <TableCell width="10%">담당자</TableCell>
                    <TableCell width="15%">이메일</TableCell>
                    <TableCell width="10%">연락처</TableCell>
                    <TableCell width="15%">체크인/체크아웃</TableCell>
                    <TableCell width="10%" align="center">인원</TableCell>
                    <TableCell width="10%" align="center">상태</TableCell>
                    <TableCell width="10%" align="center">관리</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map((page1) => (
                      <TableRow 
                        key={page1.id} 
                        hover
                        onClick={() => handleEditPage(page1)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: theme.palette.grey[50] }
                        }}
                      >
                        <TableCell>{page1.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{page1.page3?.company_name || (page1.group_name && page1.group_name) || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{page1.page3?.contact_person || (page1.customer_name && page1.customer_name) || '-'}</TableCell>
                        <TableCell>{page1.page3?.email || (page1.email && page1.email) || '-'}</TableCell>
                        <TableCell>{page1.page3?.mobile_phone || (page1.mobile_phone && page1.mobile_phone) || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDateForDisplay(page1.start_date) || '-'} ~ {formatDateForDisplay(page1.end_date) || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GroupIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {page1.page3?.total_count || (page1.total_count && page1.total_count) || '0'}명
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(page1.reservation_status)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPage(page1);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => handleDelete(page1.page3.id, e)}
                            disabled={deleteLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          {searchTerm || filterStatus !== 'all' 
                            ? '검색 조건에 맞는 예약이 없습니다.' 
                            : '예약 정보가 없습니다.'}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<AddIcon />}
                          onClick={handleNewPage}
                          sx={{ mt: 2 }}
                        >
                          새 예약 만들기
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
      
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleNewPage}
      >
        <AddIcon />
      </Fab>
    </MainCard>
  );
};

export default List; 