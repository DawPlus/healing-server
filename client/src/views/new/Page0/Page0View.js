import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
  Paper,
  Grid,
  Button,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  styled,
  TextField
} from '@mui/material';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Autocomplete from '@mui/material/Autocomplete';
import usePermissionCheck from '../../../hooks/usePermissionCheck';

// Import existing page components
import Page1Edit from '../page1/Page1Edit';
import Page2Edit from '../page2/Edit';
import Page3Edit from '../page3/Edit';
import Page4Edit from '../page4/Edit';
import PageFinalEdit from '../pageFinal/PageFinalEdit';

// Import GraphQL query
import { GET_PAGE5_RESERVATION_LIST } from '../Page5/graphql';
import { showAlert } from '../Page5/services/dataService';

// Import Redux actions
import { setSelectedReservation, setLastCreatedReservation } from '../../../store/reducers/reservationSlice';

// GraphQL mutations for cascade delete
const CASCADE_DELETE_PAGE1 = gql`
  mutation CascadeDeletePage1($id: Int!) {
    deletePage1(id: $id)
  }
`;

// Custom styled tab for progressive look
const ProgressTab = styled(Tab)(({ theme, selected, completed }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '64px',
  fontWeight: selected ? '600' : '400',
  transition: 'all 0.3s',
  position: 'relative',
  padding: '12px 20px',
  fontSize: '1.05rem',
  letterSpacing: '0.5px',
  '&::after': completed === 'true' ? {
    content: '""',
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: theme.palette.success.main,
    zIndex: 1
  } : {},
  '&.Mui-selected': {
    backgroundColor: 'rgba(0, 171, 85, 0.12)',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    color: theme.palette.primary.main
  }
}));

// Number badge for steps
const StepNumber = styled('div')(({ theme, selected, completed }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: selected === 'true' 
    ? theme.palette.primary.main 
    : completed === 'true'
      ? theme.palette.success.main
      : theme.palette.grey[400],
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '18px',
  marginRight: theme.spacing(2),
  transition: 'all 0.3s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
}));

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`page0-tabpanel-${index}`}
      aria-labelledby={`page0-tab-${index}`}
      style={{ width: '100%', maxWidth: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Page0View = () => {
  // 권한 체크 - 열람자는 접근 불가 (관리자, 직원만 가능)
  const { userInfo: permissionUserInfo } = usePermissionCheck(['admin', 'employee']);
  
  const theme = useTheme();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get the last created reservation ID from Redux store
  const lastCreatedReservationId = useSelector(state => state.reservation.lastCreatedReservationId);
  // Get the selected reservation ID from Redux store
  const selectedReservationId = useSelector(state => state.reservation.selectedReservationId);
  
  console.log('Redux lastCreatedReservationId:', lastCreatedReservationId);
  console.log('Redux selectedReservationId:', selectedReservationId);

  // Fetch reservation list for the dropdown
  const { loading, error, data, refetch } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error fetching reservation list:', error);
      showAlert('예약 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    }
  });

  // Check if we have a selected organization from the calendar page
  useEffect(() => {
    if (location.state?.selectedOrganization && data?.getPage1List) {
      const orgName = location.state.selectedOrganization;
      // Find the reservation with matching organization name
      const matchingReservation = data.getPage1List.find(
        res => (res.organization_name || res.group_name) === orgName
      );
      
      if (matchingReservation) {
        setSelectedGroup(matchingReservation.id.toString());
        // Clear the location state to prevent reselection on page refresh
        navigate(location.pathname, { replace: true });
        showNotification(`${orgName} 단체가 선택되었습니다.`, 'info');
      }
    }
  }, [data, location.state, navigate, location.pathname]);
  
  // Check for selected reservation ID from Redux (coming from Page5)
  useEffect(() => {
    if (selectedReservationId && data?.getPage1List) {
      // Find the reservation with matching ID
      const matchingReservation = data.getPage1List.find(
        res => res.id === parseInt(selectedReservationId)
      );
      
      if (matchingReservation) {
        setSelectedGroup(selectedReservationId.toString());
        showNotification(`${matchingReservation.group_name} 단체가 선택되었습니다.`, 'info');
        
        // Clear the selected reservation ID from Redux
        dispatch(setSelectedReservation(null));
      }
    }
  }, [selectedReservationId, data, dispatch]);
  
  // Check for last created reservation ID from Redux
  useEffect(() => {
    if (lastCreatedReservationId && data?.getPage1List) {
      // Find the reservation with matching ID
      const matchingReservation = data.getPage1List.find(
        res => res.id === parseInt(lastCreatedReservationId)
      );
      
      if (matchingReservation) {
        setSelectedGroup(lastCreatedReservationId.toString());
        showNotification(`새로 생성된 예약이 선택되었습니다.`, 'success');
        
        // Clear the last created reservation ID from Redux
        dispatch(setLastCreatedReservation(null));
      }
    }
  }, [lastCreatedReservationId, data, dispatch]);

  // Cascade delete mutation
  const [cascadeDeletePage1, { loading: deleteLoading }] = useMutation(CASCADE_DELETE_PAGE1, {
    onCompleted: () => {
      setIsDeleting(false);
      showNotification('모든 관련 데이터가 성공적으로 삭제되었습니다.', 'success');
      setSelectedGroup(''); // Reset selected group
      setTabValue(0); // Reset to first tab
      refetch(); // Refresh the list
    },
    onError: (error) => {
      setIsDeleting(false);
      showNotification(`삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Refresh data after CRUD operations
  const handleRefresh = useCallback(() => {
    refetch();
    setRefreshKey(Date.now());
    showNotification('데이터가 새로고침되었습니다.', 'success');
  }, [refetch]);
  
  // Create a new reservation
  const handleCreateNew = () => {
    navigate('/new/page1/edit/new');
  };
  
  // Handle deleting the reservation and all related records
  const handleDeleteReservation = () => {
    if (!selectedGroup) {
      showNotification('삭제할 예약을 선택해주세요.', 'warning');
      return;
    }

    Swal.fire({
      title: '삭제 확인',
      text: '이 예약 정보와 모든 관련 데이터(프로그램, 시설, 비용 정보 등)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme.palette.error.main
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDeleting(true);
        cascadeDeletePage1({
          variables: { id: parseInt(selectedGroup) }
        });
      }
    });
  };
  
  // Show notification
  const showNotification = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Handle data update from any component
  const handleDataUpdate = useCallback((message) => {
    refetch();
    showNotification(message || '데이터가 업데이트되었습니다.', 'success');
  }, [refetch]);
  
  // Close alert
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters
      sx={{ 
        mt: 3, 
        px: { xs: 1, sm: 2, md: 3 },
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            통합 예약 관리
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ mr: 1 }}
            >
              새 예약 생성
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              새로고침
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Autocomplete
                value={selectedGroup ? data?.getPage1List?.find(item => item.id.toString() === selectedGroup) || null : null}
                onChange={(event, newValue) => {
                  setSelectedGroup(newValue ? newValue.id.toString() : '');
                  dispatch(setSelectedReservation(newValue ? newValue.id.toString() : null));
                  setTabValue(0);
                }}
                options={data?.getPage1List || []}
                getOptionLabel={(option) => `${option.group_name} (${new Date(option.start_date).toLocaleDateString()} ~ ${new Date(option.end_date).toLocaleDateString()})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="단체명 선택"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={loading}
                disabled={loading}
              />
            </FormControl>
          </Grid>
          {selectedGroup && tabValue === 0 && (
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteReservation}
                disabled={isDeleting}
              >
                 삭제
                {isDeleting && <CircularProgress size={20} sx={{ ml: 1 }} />}
              </Button>
            </Grid>
          )}
        </Grid>

        {selectedGroup && (
          <>
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              position: 'relative',
              zIndex: 1,
              width: '100%'
            }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="integrated reservation tabs"
                variant="fullWidth"
                sx={{
                  width: '100%',
                  '& .MuiTabs-flexContainer': {
                    width: '100%'
                  },
                  '& .MuiTabs-indicator': {
                    height: 4,
                    borderRadius: '3px 3px 0 0',
                    backgroundColor: theme.palette.primary.main,
                    zIndex: 2
                  }
                }}
              >
                <ProgressTab 
                  icon={
                    <StepNumber selected={tabValue === 0 ? 'true' : 'false'} completed={tabValue > 0 ? 'true' : 'false'}>
                      1
                    </StepNumber>
                  } 
                  label="기본 정보" 
                  iconPosition="start"
                  selected={tabValue === 0}
                  completed={tabValue > 0 ? 'true' : 'false'}
                />
                <ProgressTab 
                  icon={
                    <StepNumber selected={tabValue === 1 ? 'true' : 'false'} completed={tabValue > 1 ? 'true' : 'false'}>
                      2
                    </StepNumber>
                  } 
                  label="프로그램 정보" 
                  iconPosition="start"
                  selected={tabValue === 1}
                  completed={tabValue > 1 ? 'true' : 'false'}
                />
                <ProgressTab 
                  icon={
                    <StepNumber selected={tabValue === 2 ? 'true' : 'false'} completed={tabValue > 2 ? 'true' : 'false'}>
                      3
                    </StepNumber>
                  } 
                  label="시설 이용" 
                  iconPosition="start"
                  selected={tabValue === 2}
                  completed={tabValue > 2 ? 'true' : 'false'}
                />
                <ProgressTab 
                  icon={
                    <StepNumber selected={tabValue === 3 ? 'true' : 'false'} completed={tabValue > 3 ? 'true' : 'false'}>
                      4
                    </StepNumber>
                  } 
                  label="비용 정보" 
                  iconPosition="start"
                  selected={tabValue === 3}
                  completed={tabValue > 3 ? 'true' : 'false'}
                />
                <ProgressTab 
                  icon={
                    <StepNumber selected={tabValue === 4 ? 'true' : 'false'} completed={tabValue > 4 ? 'true' : 'false'}>
                      5
                    </StepNumber>
                  } 
                  label="결과 입력" 
                  iconPosition="start"
                  selected={tabValue === 4}
                  completed={tabValue > 4 ? 'true' : 'false'}
                />
              </Tabs>
            </Box>

            <Box sx={{ 
              p: { xs: 1, sm: 2, md: 3 }, 
              border: '1px solid rgba(0, 0, 0, 0.12)', 
              borderTop: 0,
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              backgroundColor: theme.palette.background.paper,
              width: '100%',
              maxWidth: '100%',
              '& > div[role="tabpanel"] > div': {
                width: '100%',
                maxWidth: '100%'
              },
              '& .MuiGrid-container': {
                width: '100%',
                margin: '0',
                maxWidth: '100%'
              }
            }}>
              <TabPanel value={tabValue} index={0}>
                <Page1Edit key={`page1-${selectedGroup}-${refreshKey}`} id={selectedGroup} isEmbedded={true} onDataUpdate={handleDataUpdate} />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Page2Edit key={`page2-${selectedGroup}-${refreshKey}`} overrideId={selectedGroup} isEmbedded={true} onDataUpdate={handleDataUpdate} hideReservationInfo={true} />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {console.log('Page3Edit selectedGroup:', selectedGroup)}
                <Page3Edit 
                  key={`page3-${selectedGroup}-${refreshKey}`} 
                  overrideId={parseInt(selectedGroup)} 
                  isEmbedded={true} 
                  onDataUpdate={handleDataUpdate} 
                  hideReservationInfo={true} 
                />
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                <Page4Edit key={`page4-${selectedGroup}-${refreshKey}`} overrideId={selectedGroup} isEmbedded={true} onDataUpdate={handleDataUpdate} hideReservationInfo={true} />
              </TabPanel>
              <TabPanel value={tabValue} index={4}>
                <PageFinalEdit key={`pageFinal-${selectedGroup}-${refreshKey}`} overrideId={selectedGroup} isEmbedded={true} onDataUpdate={handleDataUpdate} hideReservationInfo={true} />
              </TabPanel>
            </Box>
          </>
        )}
      </Paper>
      
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Page0View; 