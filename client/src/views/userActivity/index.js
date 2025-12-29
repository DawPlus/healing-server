import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent,
  Avatar, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Alert,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { format } from 'date-fns';
import { gql, useQuery } from '@apollo/client';
import activityLogger from 'utils/activityLogger';
import { useSelector } from 'react-redux';
import { gridSpacing } from 'store/constant';
import usePermissionCheck from 'hooks/usePermissionCheck';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import FilterListIcon from '@mui/icons-material/FilterList';

// GraphQL queries
const GET_USER_ACTIVITIES = gql`
  query GetUserActivities($filter: ActivityFilterInput, $skip: Int, $take: Int) {
    getUserActivities(filter: $filter, skip: $skip, take: $take) {
      activities {
        id
        user_id
        user_name
        action
        action_target
        target_id
        description
        ip_address
        created_at
      }
      totalCount
    }
  }
`;

// Mock data is kept as a fallback if GraphQL is not available
const MOCK_ACTIVITIES = [
  { 
    id: 1, 
    user_name: '김관리자', 
    action: 'view', 
    action_target: '프로그램 만족도 입력', 
    created_at: '2023-09-15T09:30:00Z',
    description: '단체 "산림치유연구소" 프로그램 만족도 조회'
  },
  { 
    id: 2, 
    user_name: '이담당자', 
    action: 'update', 
    action_target: '프로그램 만족도 입력', 
    created_at: '2023-09-15T10:15:00Z',
    description: '단체 "국립산림과학원" 프로그램 만족도 수정'
  },
  { 
    id: 3, 
    user_name: '박사용자', 
    action: 'create', 
    action_target: '프로그램 만족도 입력', 
    created_at: '2023-09-15T11:00:00Z',
    description: '단체 "숲체험교실" 프로그램 만족도 신규 등록'
  },
  { 
    id: 4, 
    user_name: '김관리자', 
    action: 'login', 
    action_target: '로그인', 
    created_at: '2023-09-15T08:45:00Z',
    description: '로그인 성공'
  },
  { 
    id: 5, 
    user_name: '이담당자', 
    action: 'logout', 
    action_target: '로그아웃', 
    created_at: '2023-09-15T17:30:00Z',
    description: '로그아웃'
  },
  { 
    id: 6, 
    user_name: '최사용자', 
    action: 'view', 
    action_target: '시설 서비스 만족도 입력', 
    created_at: '2023-09-16T09:15:00Z',
    description: '단체 "국립공원공단" 시설 서비스 만족도 조회'
  },
  { 
    id: 7, 
    user_name: '정사용자', 
    action: 'delete', 
    action_target: '프로그램 만족도 입력', 
    created_at: '2023-09-16T14:25:00Z',
    description: '단체 "산림복지진흥원" 프로그램 만족도 삭제'
  }
];

// Helper functions
const getActionIcon = (action) => {
  switch (action) {
    case 'view': return <VisibilityIcon fontSize="small" />;
    case 'create': return <AddIcon fontSize="small" />;
    case 'update': return <EditIcon fontSize="small" />;
    case 'delete': return <DeleteIcon fontSize="small" />;
    case 'login': return <LoginIcon fontSize="small" />;
    case 'logout': return <LogoutIcon fontSize="small" />;
    default: return <PersonIcon fontSize="small" />;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'view': return 'info';
    case 'create': return 'success';
    case 'update': return 'warning';
    case 'delete': return 'error';
    case 'login': return 'primary';
    case 'logout': return 'secondary';
    default: return 'default';
  }
};

const UserActivity = () => {
  // 권한 체크 - 관리자만 접근 가능
  const { userInfo: permissionUserInfo } = usePermissionCheck(['admin']);
  
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState('mock'); // 'mock' or 'graphql'
  const [debugInfo, setDebugInfo] = useState(''); // 디버깅 정보
  
  // Redux에서 현재 로그인한 사용자 정보 가져오기
  const userInfo = useSelector(state => state.common.userInfo) || {};
  const isLogin = useSelector(state => state.common.isLogin);

  // Set up debounced search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // GraphQL query with variables
  const { loading, error, data, refetch } = useQuery(GET_USER_ACTIVITIES, {
    variables: {
      filter: debouncedSearchTerm ? { search: debouncedSearchTerm } : {},
      skip: page * rowsPerPage,
      take: rowsPerPage
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('UserActivity GraphQL 데이터 로드됨:', data);
      if (data?.getUserActivities?.activities?.length > 0) {
        setDataSource('graphql');
      }
    },
    onError: (error) => {
      console.error('UserActivity GraphQL 오류:', error.message);
      console.error('Error details:', error);
      setDataSource('mock');
    }
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    console.log('새로고침 실행');
    refetch();
  };

  // 사용자 활동 테스트 함수
  const handleTestLog = async () => {
    try {
      // 먼저 현재 로그인 상태 및 사용자 정보 확인
      const loginStatus = {
        isLogin,
        userInfo,
        localStorageUserId: localStorage.getItem('userId'),
        localStorageUserName: localStorage.getItem('userName')
      };
      
      console.log('현재 로그인 상태:', loginStatus);
      setDebugInfo(JSON.stringify(loginStatus, null, 2));
      
      // 사용자 정보가 없으면 오류 표시
      if (!isLogin || !userInfo || !userInfo.id) {
        alert('로그인 상태가 아니거나 사용자 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      // 테스트 활동 로깅
      const actionTypes = ['view', 'create', 'update', 'delete'];
      const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      
      const result = await activityLogger.logCustom(
        randomAction,
        '활동 로그 테스트',
        'test-' + Date.now(),
        `테스트 ${randomAction} 액션 - ${new Date().toLocaleTimeString()}`,
        userInfo.id,
        userInfo.user_name
      );
      
      if (result) {
        alert('활동 로그가 성공적으로 생성되었습니다. 새로고침해서 확인하세요.');
        setTimeout(() => refetch(), 500);
      } else {
        alert('활동 로그 생성에 실패했습니다. 콘솔을 확인하세요.');
      }
    } catch (error) {
      console.error('활동 로그 테스트 오류:', error);
      setDebugInfo(error.toString());
    }
  };

  // Use mock data if GraphQL query fails or if in development without backend
  const activities = data?.getUserActivities?.activities || MOCK_ACTIVITIES;
  const totalCount = data?.getUserActivities?.totalCount || MOCK_ACTIVITIES.length;

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Card elevation={3}>
          <CardHeader 
            title={
              <Box display="flex" alignItems="center">
                <HistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h3">사용자 이용기록</Typography>
              </Box>
            }
            subheader={
              <Typography variant="subtitle2" color="textSecondary">
                시스템 사용자들의 활동 내역을 확인합니다 {dataSource === 'mock' ? '(목업 데이터)' : ''}
              </Typography>
            }
            action={
              <Button 
                variant="contained"
                color="primary" 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh}
                disabled={loading}
                sx={{ borderRadius: '12px' }}
              >
                {loading ? '로딩중...' : '새로고침'}
              </Button>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-action': { 
                alignSelf: 'center' 
              }
            }}
          />
          
          <Divider />
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={gridSpacing}>
              {/* 검색 및 사용자 정보 섹션 */}
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="검색"
                  placeholder="사용자명, 활동 또는 설명 검색"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" color="primary">
                          <FilterListIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: '12px',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.grey[300]
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light
                      }
                    }
                  }}
                />
              </Grid>
              
              {/* 로그인 정보 카드 */}
              <Grid item xs={12} md={4}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%', 
                    borderColor: theme.palette.grey[200],
                    backgroundColor: alpha(theme.palette.primary.light, 0.1),
                    borderRadius: '12px'
                  }}
                >
                  <CardContent sx={{ height: '100%', p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main, 
                          width: 36, 
                          height: 36,
                          mr: 1.5
                        }}
                      >
                        {userInfo?.user_name ? userInfo.user_name.charAt(0) : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {userInfo?.user_name || '익명 사용자'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {isLogin ? '로그인됨' : '로그인되지 않음'} • ID: {userInfo?.id || '없음'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 테이블 섹션 */}
              <Grid item xs={12}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <CircularProgress color="primary" />
                  </Box>
                ) : error ? (
                  <Alert 
                    severity="error" 
                    variant="filled" 
                    sx={{ 
                      borderRadius: '12px',
                      mb: 2
                    }}
                  >
                    데이터를 불러오는 중 오류가 발생했습니다: {error.message}
                    {dataSource === 'mock' && ' - 목업 데이터를 표시합니다.'}
                  </Alert>
                ) : (
                  <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      borderColor: theme.palette.grey[200]
                    }}
                  >
                    <Table sx={{ minWidth: 700 }}>
                      <TableHead>
                        <TableRow sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiTableCell-head': {
                            color: theme.palette.primary.dark,
                            fontWeight: 600
                          }
                        }}>
                          <TableCell sx={{ pl: 3 }}>사용자</TableCell>
                          <TableCell>활동유형</TableCell>
                          <TableCell>대상</TableCell>
                          <TableCell>일시</TableCell>
                          <TableCell sx={{ pr: 3 }}>설명</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activities.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2">활동 내역이 없습니다</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          activities.map((activity, index) => (
                            <TableRow 
                              key={activity.id} 
                              hover
                              sx={{
                                backgroundColor: index % 2 === 0 ? 'white' : alpha(theme.palette.grey[100], 0.5),
                                '&:last-child td, &:last-child th': { 
                                  borderBottom: 0 
                                }
                              }}
                            >
                              <TableCell sx={{ pl: 3 }}>
                                <Box display="flex" alignItems="center">
                                  <Avatar 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      mr: 1.5,
                                      bgcolor: theme.palette.primary.main
                                    }}
                                  >
                                    {activity.user_name.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight={500}>
                                    {activity.user_name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getActionIcon(activity.action)}
                                  label={
                                    {
                                      'view': '조회',
                                      'create': '생성',
                                      'update': '수정',
                                      'delete': '삭제',
                                      'login': '로그인',
                                      'logout': '로그아웃'
                                    }[activity.action] || activity.action
                                  }
                                  color={getActionColor(activity.action)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderRadius: '8px', 
                                    '& .MuiChip-label': { 
                                      px: 1, 
                                      fontWeight: 500 
                                    } 
                                  }}
                                />
                              </TableCell>
                              <TableCell>{activity.action_target}</TableCell>
                              <TableCell>
                                {format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm')}
                              </TableCell>
                              <TableCell sx={{ pr: 3 }}>{activity.description}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
              
              {/* 페이지네이션 섹션 */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="항목 수:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}`}
                    sx={{ 
                      '.MuiTablePagination-select': {
                        borderRadius: '8px',
                        px: 1
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              {/* 디버깅 정보 - 필요할 경우에만 표시 */}
              {debugInfo && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: '12px',
                      borderColor: theme.palette.grey[200],
                      mt: 2
                    }}
                  >
                    <Typography variant="body2" color="textSecondary" gutterBottom>디버깅 정보:</Typography>
                    <Box 
                      sx={{ 
                        overflowX: 'auto', 
                        backgroundColor: alpha(theme.palette.grey[100], 0.5), 
                        p: 1.5,
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {debugInfo}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UserActivity; 