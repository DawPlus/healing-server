import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  FormControl, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  FormLabel, 
  TextField,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress,
  useTheme,
  Card,
  Breadcrumbs,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { store } from 'store';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PAGE1_BY_ID } from './graphql/queries';
import { CREATE_PAGE1, UPDATE_PAGE1, DELETE_PAGE1 } from './graphql/mutations';
import { setLastCreatedReservation } from '../../../store/reducers/reservationSlice';

// Import icons
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import ListIcon from '@mui/icons-material/List';

// Helper function to format dates using moment unix
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

const Edit = ({ overrideId, isEmbedded = false, onDataUpdate }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Use overrideId if provided (for embedded mode), otherwise use from URL params
  const { id: urlId } = useParams();
  const id = overrideId || urlId;
  
  const [openDialog, setOpenDialog] = useState(false);
  const isNewReservation = id === 'new';
  const [intervals, setIntervals] = useState([]);

  // State for form data
  const [formDataGraphQL, setFormDataGraphQL] = useState({
    reservation_status: 'preparation',
    start_date: '',
    end_date: '',
    group_name: '',
    customer_name: '',
    total_count: 0,
    email: '',
    mobile_phone: '',
    landline_phone: '',
    notes: '',
    business_category: 'profit_business',
    business_subcategory: '',
    business_detail_category: '',
    reservation_manager: '',
    operation_manager: '',
    region: '',
    is_mine_area: false,
    create_user: 'admin', // Default value, should come from auth
    update_user: 'admin'  // Default value, should come from auth
  });
  
  // State for form validation
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // GraphQL queries and mutations
  const { loading, error, data, refetch } = useQuery(GET_PAGE1_BY_ID, {
    variables: { id: parseInt(id) },
    skip: isNewReservation,
    fetchPolicy: 'network-only'
  });
  
  const [createPage1, { loading: createLoading }] = useMutation(CREATE_PAGE1, {
    onCompleted: (data) => {
      setSuccessMessage('Page1이 성공적으로 생성되었습니다.');
      setIsSubmitting(false);
      
      // Get the newly created ID
      const newlyCreatedId = data.createPage1.id;
      
      // Dispatch the newly created ID to Redux
      console.log('새로 생성된 예약 ID를 Redux에 저장:', newlyCreatedId);
      dispatch(setLastCreatedReservation(newlyCreatedId));
      
      // Show toast message using SweetAlert2
      Swal.fire({
        icon: 'success',
        title: '성공',
        text: '정보가 성공적으로 생성되었습니다.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      
      // Call onDataUpdate if provided
      if (typeof onDataUpdate === 'function') {
        onDataUpdate('기본 정보가 성공적으로 생성되었습니다.');
      }
      
      setTimeout(() => {
        navigate('/new/page0');
      }, 1500);
    },
    onError: (error) => {
      setErrors({ submit: `생성 중 오류가 발생했습니다: ${error.message}` });
      setIsSubmitting(false);
      
      // Show error toast
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `생성 중 오류가 발생했습니다: ${error.message}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
      });
    }
  });
  
  // Function to refetch data
  const refetchData = async () => {
    try {
      console.log('Refetching data...');
      const { data: refreshedData } = await refetch();
      if (refreshedData && refreshedData.getPage1ById) {
        const page1 = refreshedData.getPage1ById;
        
        // Format dates for form inputs
        const formattedPage1 = {
          ...page1,
          start_date: page1.start_date ? moment(page1.start_date).format('YYYY-MM-DD') : '',
          end_date: page1.end_date ? moment(page1.end_date).format('YYYY-MM-DD') : '',
        };
        
        console.log('Refreshed data:', formattedPage1);
        setFormDataGraphQL(formattedPage1);
      }
    } catch (error) {
      console.error('Error refetching data:', error);
    }
  };
  
  const [updatePage1, { loading: updateLoading }] = useMutation(UPDATE_PAGE1, {
    onCompleted: (data) => {
      // Only set success message for new records
      if (isNewReservation) {
        setSuccessMessage('Page1이 성공적으로 생성되었습니다.');
      } else {
        setSuccessMessage(''); // Clear any existing success message
      }
      
      setIsSubmitting(false);
      
      // Refetch data instead of navigating away
      if (data && !isNewReservation) {
        // Reload the data by refetching the query
        refetchData();
        
        // Show toast message using SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '정보가 성공적으로 업데이트되었습니다.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        
        // Call onDataUpdate if provided
        if (typeof onDataUpdate === 'function') {
          onDataUpdate('기본 정보가 성공적으로 업데이트되었습니다.');
        }
      } else {
        // For new records, still navigate to list
        setTimeout(() => {
          navigate('/new/page1');
        }, 1500);
      }
    },
    onError: (error) => {
      setErrors({ submit: `업데이트 중 오류가 발생했습니다: ${error.message}` });
      setIsSubmitting(false);
      
      // Show error toast
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `업데이트 중 오류가 발생했습니다: ${error.message}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
      });
    }
  });
  
  const [deletePage1, { loading: deleteLoading }] = useMutation(DELETE_PAGE1, {
    onCompleted: () => {
      setSuccessMessage('Page1이 성공적으로 삭제되었습니다.');
      
      // Show toast message using SweetAlert2
      Swal.fire({
        icon: 'success',
        title: '성공',
        text: '정보가 성공적으로 삭제되었습니다.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      
      setTimeout(() => {
        navigate('/new/page1');
      }, 1500);
    },
    onError: (error) => {
      setErrors({ delete: `삭제 중 오류가 발생했습니다: ${error.message}` });
      
      // Show error toast
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: `삭제 중 오류가 발생했습니다: ${error.message}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
      });
    }
  });

  // Helper function to add an interval to the state for cleanup
  const addIntervalForCleanup = (intervalId) => {
    setIntervals(prev => [...prev, intervalId]);
  };

  // Load reservation data when component mounts or ID changes
  useEffect(() => {
    if (isNewReservation) {
      // 삭제: dispatch(actions.resetForm());
    } else {
      // GraphQL 쿼리가 이미 위에서 정의되어 있으므로, 별도의 fetchPage1Data 함수가 필요 없음
      // refetch()를 사용하여 데이터 다시 불러오기 
      // 삭제: fetchPage1Data(id, dispatch, () => {});
    }

    // Cleanup on unmount
    return () => {
      // Clear all intervals on unmount
      intervals.forEach(intervalId => clearInterval(intervalId));
    };
  }, [id, isNewReservation, intervals]);

  // Load data when component mounts
  useEffect(() => {
    if (!isNewReservation && data && data.getPage1ById) {
      const page1 = data.getPage1ById;
      
      // Format dates for form inputs
      const formattedPage1 = {
        ...page1,
        start_date: page1.start_date ? moment(page1.start_date).format('YYYY-MM-DD') : '',
        end_date: page1.end_date ? moment(page1.end_date).format('YYYY-MM-DD') : '',
      };
      
      // Debug business category fields
      console.log('Loaded Page1 data:', formattedPage1);
      console.log('Business Category:', formattedPage1.business_category);
      console.log('Business Subcategory:', formattedPage1.business_subcategory);
      console.log('Business Detail Category:', formattedPage1.business_detail_category);
      
      setFormDataGraphQL(formattedPage1);
    }
  }, [isNewReservation, data]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataGraphQL({
      ...formDataGraphQL,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation checks
    const newErrors = {};
    
    // Required fields
    if (!formDataGraphQL.reservation_status) newErrors.reservation_status = "예약 상태는 필수 항목입니다.";
    if (!formDataGraphQL.start_date) newErrors.start_date = "시작일은 필수 항목입니다.";
    if (!formDataGraphQL.end_date) newErrors.end_date = "종료일은 필수 항목입니다.";
    if (!formDataGraphQL.group_name) newErrors.group_name = "단체명은 필수 항목입니다.";
    if (!formDataGraphQL.customer_name) newErrors.customer_name = "고객명은 필수 항목입니다.";
    if (!formDataGraphQL.landline_phone && !formDataGraphQL.mobile_phone) {
      newErrors.landline_phone = "유선연락처 또는 무선연락처 중 하나는 필수입니다.";
      newErrors.mobile_phone = "유선연락처 또는 무선연락처 중 하나는 필수입니다.";
    }
    if (!formDataGraphQL.email) newErrors.email = "이메일은 필수 항목입니다.";
    if (!formDataGraphQL.business_category) newErrors.business_category = "사업구분은 필수 항목입니다.";
    
    // Check if business category requires additional validation
    if (formDataGraphQL.business_category === 'profit_business') {
      if (!formDataGraphQL.business_subcategory) {
        newErrors.business_subcategory = "세부구분은 필수 항목입니다.";
      }
      
      if (formDataGraphQL.business_subcategory && !formDataGraphQL.business_detail_category) {
        newErrors.business_detail_category = "상세구분은 필수 항목입니다.";
      }
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formDataGraphQL.email && !emailRegex.test(formDataGraphQL.email)) {
      newErrors.email = "유효한 이메일 형식이 아닙니다.";
    }
    
    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      return;
    }
    
    // Prepare data for GraphQL submission
    const input = {
      reservation_status: formDataGraphQL.reservation_status,
      start_date: formDataGraphQL.start_date,
      end_date: formDataGraphQL.end_date,
      group_name: formDataGraphQL.group_name,
      customer_name: formDataGraphQL.customer_name,
      total_count: formDataGraphQL.total_count || 0,
      email: formDataGraphQL.email,
      mobile_phone: formDataGraphQL.mobile_phone,
      landline_phone: formDataGraphQL.landline_phone,
      notes: formDataGraphQL.notes,
      business_category: formDataGraphQL.business_category,
      business_subcategory: formDataGraphQL.business_subcategory,
      business_detail_category: formDataGraphQL.business_detail_category,
      reservation_manager: formDataGraphQL.reservation_manager,
      operation_manager: formDataGraphQL.operation_manager,
      region: formDataGraphQL.region,
      is_mine_area: formDataGraphQL.is_mine_area || false,
      create_user: 'admin', // Default value, should come from auth
      update_user: 'admin'  // Default value, should come from auth
    };
    
    try {
      if (isNewReservation) {
        await createPage1({
          variables: {
            input: input
          }
        });
      } else {
        await updatePage1({
          variables: {
            id: parseInt(id),
            input: input
          }
        });
      }
    } catch (error) {
      console.error('Mutation error:', error);
      setErrors({ submit: `저장 중 오류가 발생했습니다: ${error.message}` });
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    if (!formDataGraphQL.id) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: '삭제할 예약 정보를 선택해주세요.',
      });
      return;
    }
    
    setOpenDialog(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDialog(false);
  };
  
  // Delete the selected reservation
  const handleDeleteReservation = () => {
    setOpenDialog(false);
    
    // Use dataService to delete reservation - 알림 표시하지 않음
    deletePage1({
      variables: {
        id: parseInt(id)
      }
    });
  };

  // Handle navigation to Page2
  const handleContinueToPage2 = () => {
    // Check if a reservation is selected
    if (!formDataGraphQL.id) {
      // 조용히 리턴
      return;
    }
    
    // Store the current reservation in localStorage instead of redux store
    localStorage.setItem('page1_selected_item', JSON.stringify(formDataGraphQL));
    
    // Then navigate to page2 create route
    navigate(`/new/page2/${formDataGraphQL.id}`);
  };

  // Show loading while fetching data
  if (!isNewReservation && loading) {
    return (
      <MainCard title="예약 정보 로딩 중">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }
  
  // Show error if data fetch failed
  if (!isNewReservation && error) {
    return (
      <MainCard title="오류 발생">
        <Alert severity="error">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/new/page0')} 
          sx={{ mt: 2 }}
        >
          목록으로 돌아가기
        </Button>
      </MainCard>
    );
  }

  // Conditionally render based on isEmbedded
  return (
    <>
      {!isEmbedded ? (
        <MainCard title={isNewReservation ? '신규 예약 정보 입력' : '예약 정보 수정'}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, p: 2, bgcolor: theme.palette.grey[50], borderRadius: 1 }}>
        <Link 
          to="/new/page0"
          style={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          홈
        </Link>
        <Link
          to="/new/page0"
          style={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, textDecoration: 'none' }}
        >
          <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          예약 목록
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center', color: theme.palette.text.primary }}
        >
          {isNewReservation ? '새 예약 등록' : '예약 정보 수정'}
        </Typography>
      </Breadcrumbs>

      <form onSubmit={handleSubmit}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/new/page0')}
              sx={{ mr: 2 }}
            >
              목록으로 돌아가기
            </Button>
            {formDataGraphQL.id && (
              <Button
                variant="contained"
                color="success"
                endIcon={<ArrowForwardIcon />}
                onClick={handleContinueToPage2}
              >
                상세정보
              </Button>
            )}
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel id="reservation-status-label" sx={{ mb: 1, color: 'error.main' }}>예약상태 *</FormLabel>
            <RadioGroup
              row
              aria-labelledby="reservation-status-label"
              name="reservation_status"
              value={formDataGraphQL.reservation_status || ''}
              onChange={handleChange}
            >
              <FormControlLabel value="preparation" control={<Radio />} label="가예약" />
              <FormControlLabel value="confirmed" control={<Radio />} label="확정예약" />
            </RadioGroup>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel id="business-category-label" sx={{ mb: 1, color: 'error.main' }}>사업구분 *</FormLabel>
            <RadioGroup
              row
              aria-labelledby="business-category-label"
              name="business_category"
              value={formDataGraphQL.business_category || ''}
              onChange={handleChange}
            >
              <FormControlLabel value="social_contribution" control={<Radio />} label="사회공헌" />
              <FormControlLabel value="profit_business" control={<Radio />} label="수익사업" />
            </RadioGroup>
            {errors.business_category && (
              <Typography color="error" variant="caption">
                {errors.business_category}
              </Typography>
            )}
          </FormControl>

          {formDataGraphQL.business_category === 'profit_business' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel id="business-subcategory-label" sx={{ mb: 1, color: 'error.main' }}>세부구분 *</FormLabel>
              <RadioGroup
                row
                aria-labelledby="business-subcategory-label"
                name="business_subcategory"
                value={formDataGraphQL.business_subcategory || ''}
                onChange={handleChange}
              >
                <FormControlLabel value="group" control={<Radio />} label="단체" />
                <FormControlLabel value="forest_education" control={<Radio />} label="산림교육" />
                <FormControlLabel value="individual" control={<Radio />} label="개인고객" />
              </RadioGroup>
              {errors.business_subcategory && (
                <Typography color="error" variant="caption">
                  {errors.business_subcategory}
                </Typography>
              )}
            </FormControl>
          )}

          {formDataGraphQL.business_category === 'profit_business' && formDataGraphQL.business_subcategory && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel id="business-detail-category-label" sx={{ mb: 1, color: 'error.main' }}>상세구분 *</FormLabel>
              {formDataGraphQL.business_subcategory === 'group' && (
                <RadioGroup
                  row
                  aria-labelledby="business-detail-category-label"
                  name="business_detail_category"
                  value={formDataGraphQL.business_detail_category || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="general_group" control={<Radio />} label="일반단체" />
                  <FormControlLabel value="local_group" control={<Radio />} label="지역단체" />
                </RadioGroup>
              )}
              
              {formDataGraphQL.business_subcategory === 'forest_education' && (
                <RadioGroup
                  row
                  aria-labelledby="business-detail-category-label"
                  name="business_detail_category"
                  value={formDataGraphQL.business_detail_category || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="teacher_training" control={<Radio />} label="산림바우처" />
                  <FormControlLabel value="forest_healing" control={<Radio />} label="산림치유" />
                  <FormControlLabel value="forest_guide" control={<Radio />} label="숲해설가" />
                </RadioGroup>
              )}
              
              {formDataGraphQL.business_subcategory === 'individual' && (
                <RadioGroup
                  row
                  aria-labelledby="business-detail-category-label"
                  name="business_detail_category"
                  value={formDataGraphQL.business_detail_category || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="general_customer" control={<Radio />} label="일반고객" />
                  <FormControlLabel value="local_resident" control={<Radio />} label="지역주민" />
                  <FormControlLabel value="employee_discount" control={<Radio />} label="직원할인" />
                  <FormControlLabel value="instructor_driver" control={<Radio />} label="강사 및 기사" />
                  <FormControlLabel value="etc" control={<Radio />} label="기타" />
                </RadioGroup>
              )}
              {errors.business_detail_category && (
                <Typography color="error" variant="caption">
                  {errors.business_detail_category}
                </Typography>
              )}
            </FormControl>
          )}

          {/* 거주지역 선택 드롭다운 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>거주지역</InputLabel>
            <Select
              name="region"
              value={formDataGraphQL.region || ''}
              onChange={handleChange}
              label="거주지역"
            >
              <MenuItem value="">선택하세요</MenuItem>
              <MenuItem value="서울">서울</MenuItem>
              <MenuItem value="부산">부산</MenuItem>
              <MenuItem value="대구">대구</MenuItem>
              <MenuItem value="인천">인천</MenuItem>
              <MenuItem value="광주">광주</MenuItem>
              <MenuItem value="대전">대전</MenuItem>
              <MenuItem value="울산">울산</MenuItem>
              <MenuItem value="세종">세종</MenuItem>
              <MenuItem value="경기">경기</MenuItem>
              <MenuItem value="강원">강원</MenuItem>
              <MenuItem value="충북">충북</MenuItem>
              <MenuItem value="충남">충남</MenuItem>
              <MenuItem value="전북">전북</MenuItem>
              <MenuItem value="전남">전남</MenuItem>
              <MenuItem value="경북">경북</MenuItem>
              <MenuItem value="경남">경남</MenuItem>
              <MenuItem value="제주">제주</MenuItem>
              <MenuItem value="미기재">미기재</MenuItem>
            </Select>
          </FormControl>

          {/* 폐광지역 체크박스 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="is_mine_area"
                  checked={formDataGraphQL.is_mine_area || false}
                  onChange={(e) => setFormDataGraphQL({
                    ...formDataGraphQL,
                    is_mine_area: e.target.checked
                  })}
                />
              }
              label="폐광지역"
            />
          </FormControl>

          <Typography variant="subtitle1" sx={{ mb: 1, color: 'error.main' }}>일정 *</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="시작일"
                InputLabelProps={{ shrink: true }}
                name="start_date"
                value={formDataGraphQL.start_date || ''}
                onChange={handleChange}
                error={!!errors.start_date}
                helperText={errors.start_date}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="종료일"
                InputLabelProps={{ shrink: true }}
                name="end_date"
                value={formDataGraphQL.end_date || ''}
                onChange={handleChange}
                error={!!errors.end_date}
                helperText={errors.end_date}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="단체명/고객명 *"
                variant="outlined"
                name="group_name"
                value={formDataGraphQL.group_name || ''}
                onChange={handleChange}
                error={!!errors.group_name}
                helperText={errors.group_name}
                InputProps={{
                  startAdornment: <GroupIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="인솔자명 *"
                variant="outlined"
                name="customer_name"
                value={formDataGraphQL.customer_name || ''}
                onChange={handleChange}
                error={!!errors.customer_name}
                helperText={errors.customer_name}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="유선연락처"
                variant="outlined"
                fullWidth
                name="landline_phone"
                value={formDataGraphQL.landline_phone || ''}
                onChange={handleChange}
                error={!!errors.landline_phone}
                helperText={errors.landline_phone}
                InputProps={{
                  startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="무선연락처"
                variant="outlined"
                fullWidth
                name="mobile_phone"
                value={formDataGraphQL.mobile_phone || ''}
                onChange={handleChange}
                error={!!errors.mobile_phone}
                helperText={errors.mobile_phone || "유선연락처 또는 무선연락처 중 하나는 필수입력입니다"}
                InputProps={{
                  startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="이메일 *"
                variant="outlined"
                type="email"
                name="email"
                value={formDataGraphQL.email || ''}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="예약담당 *"
                variant="outlined"
                fullWidth
                name="reservation_manager"
                value={formDataGraphQL.reservation_manager || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="운영담당"
                variant="outlined"
                fullWidth
                name="operation_manager"
                value={formDataGraphQL.operation_manager || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* 총 인원 항목은 요구사항에 따라 화면에 표시하지 않음 - 필요하지 않은 필드 */}
            
            <Grid item xs={12}>
              <TextField
                label="비고"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                name="notes"
                value={formDataGraphQL.notes || ''}
                onChange={handleChange}
                error={!!errors.notes}
                helperText={errors.notes}
                InputProps={{
                  startAdornment: <NotesIcon fontSize="small" sx={{ mr: 1, mt: 1 }} />
                }}
                sx={{ mb: 3 }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 3,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            {!isEmbedded && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/new/page0')}
              >
                취소
              </Button>
            )}

            <Box>
              {!isNewReservation && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                  disabled={deleteLoading || isSubmitting}
                >
                  삭제
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SaveIcon />}
                disabled={isSubmitting || createLoading || updateLoading}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isNewReservation ? '저장' : '업데이트'
                )}
              </Button>
            </Box>
          </Box>
        </Card>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '10px',
            boxShadow: theme.shadows[5]
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            예약 정보 삭제
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            선택한 예약 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            color="primary" 
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteReservation} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            autoFocus
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
      ) : (
        // When embedded, don't use the MainCard wrapper
        <Box>
          {renderMainContent()}
        </Box>
      )}
    </>
  );
  
  // Function to render the main content
  function renderMainContent() {
    return (
      <form onSubmit={handleSubmit}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          {!isEmbedded && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/new/page0')}
                sx={{ mr: 2 }}
              >
                목록으로 돌아가기
              </Button>
              {formDataGraphQL.id && (
                <Button
                  variant="contained"
                  color="success"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleContinueToPage2}
                >
                  상세정보
                </Button>
              )}
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel id="reservation-status-label" sx={{ mb: 1, color: 'error.main' }}>예약상태 *</FormLabel>
            <RadioGroup
              row
              aria-labelledby="reservation-status-label"
              name="reservation_status"
              value={formDataGraphQL.reservation_status || ''}
              onChange={handleChange}
            >
              <FormControlLabel value="preparation" control={<Radio />} label="가예약" />
              <FormControlLabel value="confirmed" control={<Radio />} label="확정예약" />
            </RadioGroup>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel id="business-category-label" sx={{ mb: 1, color: 'error.main' }}>사업구분 *</FormLabel>
            <RadioGroup
              row
              aria-labelledby="business-category-label"
              name="business_category"
              value={formDataGraphQL.business_category || ''}
              onChange={handleChange}
            >
              <FormControlLabel value="social_contribution" control={<Radio />} label="사회공헌" />
              <FormControlLabel value="profit_business" control={<Radio />} label="수익사업" />
            </RadioGroup>
            {errors.business_category && (
              <Typography color="error" variant="caption">
                {errors.business_category}
              </Typography>
            )}
          </FormControl>

          {formDataGraphQL.business_category === 'profit_business' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel id="business-subcategory-label" sx={{ mb: 1, color: 'error.main' }}>세부구분 *</FormLabel>
              <RadioGroup
                row
                aria-labelledby="business-subcategory-label"
                name="business_subcategory"
                value={formDataGraphQL.business_subcategory || ''}
                onChange={handleChange}
              >
                <FormControlLabel value="group" control={<Radio />} label="단체" />
                <FormControlLabel value="forest_education" control={<Radio />} label="산림교육" />
                <FormControlLabel value="individual" control={<Radio />} label="개인고객" />
              </RadioGroup>
              {errors.business_subcategory && (
                <Typography color="error" variant="caption">
                  {errors.business_subcategory}
                </Typography>
              )}
            </FormControl>
          )}

          {formDataGraphQL.business_category === 'profit_business' && formDataGraphQL.business_subcategory && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel id="business-detail-category-label" sx={{ mb: 1, color: 'error.main' }}>상세구분 *</FormLabel>
              {formDataGraphQL.business_subcategory === 'group' && (
                <RadioGroup
                  row
                  aria-labelledby="business-detail-category-label"
                  name="business_detail_category"
                  value={formDataGraphQL.business_detail_category || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="general_group" control={<Radio />} label="일반단체" />
                  <FormControlLabel value="local_group" control={<Radio />} label="지역단체" />
                </RadioGroup>
              )}
              
              {formDataGraphQL.business_subcategory === 'forest_education' && (
                <RadioGroup
                  row
                  aria-labelledby="business-detail-category-label"
                  name="business_detail_category"
                  value={formDataGraphQL.business_detail_category || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="teacher_training" control={<Radio />} label="산림바우처" />
                  <FormControlLabel value="forest_healing" control={<Radio />} label="산림치유" />
                  <FormControlLabel value="forest_guide" control={<Radio />} label="숲해설가" />
                </RadioGroup>
              )}
              
              {formDataGraphQL.business_subcategory === 'individual' && (
                <RadioGroup
                  row
                  aria-labelledby="business-detail-category-label"
                  name="business_detail_category"
                  value={formDataGraphQL.business_detail_category || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="general_customer" control={<Radio />} label="일반고객" />
                  <FormControlLabel value="local_resident" control={<Radio />} label="지역주민" />
                  <FormControlLabel value="employee_discount" control={<Radio />} label="직원할인" />
                  <FormControlLabel value="instructor_driver" control={<Radio />} label="강사 및 기사" />
                  <FormControlLabel value="etc" control={<Radio />} label="기타" />
                </RadioGroup>
              )}
              {errors.business_detail_category && (
                <Typography color="error" variant="caption">
                  {errors.business_detail_category}
                </Typography>
              )}
            </FormControl>
          )}

          {/* 거주지역 선택 드롭다운 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>거주지역</InputLabel>
            <Select
              name="region"
              value={formDataGraphQL.region || ''}
              onChange={handleChange}
              label="거주지역"
            >
              <MenuItem value="">선택하세요</MenuItem>
              <MenuItem value="서울">서울</MenuItem>
              <MenuItem value="부산">부산</MenuItem>
              <MenuItem value="대구">대구</MenuItem>
              <MenuItem value="인천">인천</MenuItem>
              <MenuItem value="광주">광주</MenuItem>
              <MenuItem value="대전">대전</MenuItem>
              <MenuItem value="울산">울산</MenuItem>
              <MenuItem value="세종">세종</MenuItem>
              <MenuItem value="경기">경기</MenuItem>
              <MenuItem value="강원">강원</MenuItem>
              <MenuItem value="충북">충북</MenuItem>
              <MenuItem value="충남">충남</MenuItem>
              <MenuItem value="전북">전북</MenuItem>
              <MenuItem value="전남">전남</MenuItem>
              <MenuItem value="경북">경북</MenuItem>
              <MenuItem value="경남">경남</MenuItem>
              <MenuItem value="제주">제주</MenuItem>
              <MenuItem value="미기재">미기재</MenuItem>
            </Select>
          </FormControl>

          {/* 폐광지역 체크박스 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="is_mine_area"
                  checked={formDataGraphQL.is_mine_area || false}
                  onChange={(e) => setFormDataGraphQL({
                    ...formDataGraphQL,
                    is_mine_area: e.target.checked
                  })}
                />
              }
              label="폐광지역"
            />
          </FormControl>

          <Typography variant="subtitle1" sx={{ mb: 1, color: 'error.main' }}>일정 *</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="시작일"
                InputLabelProps={{ shrink: true }}
                name="start_date"
                value={formDataGraphQL.start_date || ''}
                onChange={handleChange}
                error={!!errors.start_date}
                helperText={errors.start_date}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="종료일"
                InputLabelProps={{ shrink: true }}
                name="end_date"
                value={formDataGraphQL.end_date || ''}
                onChange={handleChange}
                error={!!errors.end_date}
                helperText={errors.end_date}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="단체명/고객명 *"
                variant="outlined"
                name="group_name"
                value={formDataGraphQL.group_name || ''}
                onChange={handleChange}
                error={!!errors.group_name}
                helperText={errors.group_name}
                InputProps={{
                  startAdornment: <GroupIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="인솔자명 *"
                variant="outlined"
                name="customer_name"
                value={formDataGraphQL.customer_name || ''}
                onChange={handleChange}
                error={!!errors.customer_name}
                helperText={errors.customer_name}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="유선연락처"
                variant="outlined"
                fullWidth
                name="landline_phone"
                value={formDataGraphQL.landline_phone || ''}
                onChange={handleChange}
                error={!!errors.landline_phone}
                helperText={errors.landline_phone}
                InputProps={{
                  startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="무선연락처"
                variant="outlined"
                fullWidth
                name="mobile_phone"
                value={formDataGraphQL.mobile_phone || ''}
                onChange={handleChange}
                error={!!errors.mobile_phone}
                helperText={errors.mobile_phone || "유선연락처 또는 무선연락처 중 하나는 필수입력입니다"}
                InputProps={{
                  startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="이메일 *"
                variant="outlined"
                type="email"
                name="email"
                value={formDataGraphQL.email || ''}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="예약담당 *"
                variant="outlined"
                fullWidth
                name="reservation_manager"
                value={formDataGraphQL.reservation_manager || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="운영담당"
                variant="outlined"
                fullWidth
                name="operation_manager"
                value={formDataGraphQL.operation_manager || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* 총 인원 항목은 요구사항에 따라 화면에 표시하지 않음 - 필요하지 않은 필드 */}
            
            <Grid item xs={12}>
              <TextField
                label="비고"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                name="notes"
                value={formDataGraphQL.notes || ''}
                onChange={handleChange}
                error={!!errors.notes}
                helperText={errors.notes}
                InputProps={{
                  startAdornment: <NotesIcon fontSize="small" sx={{ mr: 1, mt: 1 }} />
                }}
                sx={{ mb: 3 }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 3,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            {!isEmbedded && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/new/page0')}
              >
                취소
              </Button>
            )}

            <Box>
              {!isNewReservation && !isEmbedded && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                  disabled={deleteLoading || isSubmitting}
                >
                  삭제
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SaveIcon />}
                disabled={isSubmitting || createLoading || updateLoading}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isNewReservation ? '저장' : '업데이트'
                )}
              </Button>
            </Box>
          </Box>
        </Card>
      </form>
    );
  }
};

export default Edit; 