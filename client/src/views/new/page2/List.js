import React, { useState } from 'react';
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
  Chip,
  MenuItem,
  CircularProgress,
  Card,
  useTheme,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';

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
      page2 {
        id
        page1_id
        male_count
        female_count
        total_count
        male_leader_count
        female_leader_count
        total_leader_count
        is_mou
        org_nature
        part_type
        age_type
        part_form
        service_type
      }
    }
  }
`;

// Helper function to format dates using moment
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Use Unix timestamp if it's a number
    if (typeof dateString === 'number') {
      return moment.unix(dateString).format('YYYY-MM-DD');
    }
    // Otherwise treat as regular date string
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
  const [filterOrgNature, setFilterOrgNature] = useState('all');
  const [filterPartType, setFilterPartType] = useState('all');
  const [filterAgeType, setFilterAgeType] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Fetch page1 data using GraphQL
  const { loading, error, data, refetch } = useQuery(GET_PAGE1_LIST);
  
  // Handle creating a new reservation
  const handleNewReservation = () => {
    navigate('/new/page1/edit/create');
  };
  
  // Handle viewing/editing an existing reservation
  const handleRowClick = (page1) => {
    // Navigate to page2 edit with page1 id
    navigate(`/new/page2/edit/${page1.id}`);
  };

  // Process data for display
  const list = data?.getPage1List || [];
  
  // Get unique values for filters
  const uniqueOrgNatures = ['all', ...new Set(list
    .filter(item => item.page2)
    .map(item => item.page2.org_nature)
    .filter(Boolean))];
  const uniquePartTypes = ['all', ...new Set(list
    .filter(item => item.page2)
    .map(item => item.page2.part_type)
    .filter(Boolean))];
  const uniqueAgeTypes = ['all', ...new Set(list
    .filter(item => item.page2)
    .map(item => item.page2.age_type)
    .filter(Boolean))];

  // Filter reservations based on search term and filters
  const filteredReservations = list.filter(page1 => {
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
    
    // Apply org nature filter - only if page2 exists
    const orgNatureMatch = 
      filterOrgNature === 'all' || 
      (page1.page2 && page1.page2.org_nature === filterOrgNature);
    
    // Apply participant type filter - only if page2 exists
    const partTypeMatch = 
      filterPartType === 'all' || 
      (page1.page2 && page1.page2.part_type === filterPartType);
    
    // Apply age type filter - only if page2 exists
    const ageTypeMatch = 
      filterAgeType === 'all' || 
      (page1.page2 && page1.page2.age_type === filterAgeType);
    
    return searchMatch && statusMatch && orgNatureMatch && partTypeMatch && ageTypeMatch;
  });

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon sx={{ mr: 1 }} />
          <Typography variant="h3">프로젝트 예약 관리시스템</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            예약 항목 {filteredReservations.length}개
          </Typography>
        </Box>
      </Box>
    }>
      {/* Reservations List Panel */}
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Card elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="단체명, 고객명, 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="예약상태 필터"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="preparation">가예약</MenuItem>
                  <MenuItem value="confirmed">확정예약</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={() => refetch()}
                  sx={{ mr: 1 }}
                >
                  새로고침
                </Button>
             
              </Grid>
            </Grid>

            {showAdvancedFilters && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>단체 성격</InputLabel>
                      <Select
                        value={filterOrgNature}
                        label="단체 성격"
                        onChange={(e) => setFilterOrgNature(e.target.value)}
                      >
                        {uniqueOrgNatures.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === 'all' ? '전체' : type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>참가자 유형</InputLabel>
                      <Select
                        value={filterPartType}
                        label="참가자 유형"
                        onChange={(e) => setFilterPartType(e.target.value)}
                      >
                        {uniquePartTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === 'all' ? '전체' : type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>연령대</InputLabel>
                      <Select
                        value={filterAgeType}
                        label="연령대"
                        onChange={(e) => setFilterAgeType(e.target.value)}
                      >
                        {uniqueAgeTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === 'all' ? '전체' : type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                startIcon={showAdvancedFilters ? null : <FilterListIcon />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                color="inherit"
                size="small"
              >
                {showAdvancedFilters ? '간단한 필터 보기' : '고급 필터 보기'}
              </Button>
            </Box>
          </Card>
        </Box>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Box sx={{ p: 2, bgcolor: theme.palette.error.light, borderRadius: 1, my: 2 }}>
            <Typography color="error">데이터를 불러오는 중 오류가 발생했습니다: {error.message}</Typography>
          </Box>
        )}

        {/* Data display */}
        {!loading && !error && (
          <>
            {filteredReservations.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Typography variant="body1" color="textSecondary">예약 정보가 없습니다.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 800 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>예약상태</TableCell>
                      <TableCell>행사시작일</TableCell>
                      <TableCell>행사종료일</TableCell>
                      <TableCell>단체명</TableCell>
                      <TableCell>고객명</TableCell>
                      <TableCell>이메일</TableCell>
                      <TableCell>연락처</TableCell>
                      <TableCell>참여자</TableCell>
                      <TableCell>Page2 상태</TableCell>
                      <TableCell>기관유형</TableCell>
                      <TableCell>참가자유형</TableCell>
                      <TableCell>참가자연령</TableCell>
                      <TableCell>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={13} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : filteredReservations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} align="center">
                          예약 정보가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReservations.map((page1) => (
                        <TableRow 
                          key={page1.id} 
                          hover 
                          onClick={() => handleRowClick(page1)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: theme.palette.action.hover }
                          }}
                        >
                          <TableCell>{getStatusChip(page1.reservation_status)}</TableCell>
                          <TableCell>{formatDateForDisplay(page1.start_date)}</TableCell>
                          <TableCell>{formatDateForDisplay(page1.end_date)}</TableCell>
                          <TableCell>{page1.group_name}</TableCell>
                          <TableCell>{page1.customer_name}</TableCell>
                          <TableCell>{page1.email}</TableCell>
                          <TableCell>{page1.mobile_phone || page1.landline_phone}</TableCell>
                          <TableCell>{page1.total_count || 0}</TableCell>
                          <TableCell>
                            {page1.page2 ? (
                              <Chip 
                                label="입력완료" 
                                size="small" 
                                color="success" 
                              />
                            ) : (
                              <Chip 
                                label="미입력" 
                                size="small" 
                                color="default" 
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>{page1.page2?.org_nature || '-'}</TableCell>
                          <TableCell>{page1.page2?.part_type || '-'}</TableCell>
                          <TableCell>{page1.page2?.age_type || '-'}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(page1);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </MainCard>
  );
};

export default List; 