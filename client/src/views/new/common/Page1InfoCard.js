import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  useTheme,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  InputLabel,
  Button,
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ko } from 'date-fns/locale';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

// Helper function to format dates for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Use Unix timestamp if it's a number
    if (typeof dateString === 'number') {
      return new Date(dateString * 1000).toISOString().split('T')[0];
    }
    // Otherwise treat as regular date string
    return new Date(dateString).toISOString().split('T')[0];
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Helper function to parse date for form input
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Use Unix timestamp if it's a number
    if (typeof dateString === 'number') {
      return new Date(dateString * 1000);
    }
    // Otherwise treat as regular date string
    return new Date(dateString);
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

const Page1InfoCard = ({ formData, isDetailView = false, onSave }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...formData });
  
  // Update editedData when formData changes (only if not currently editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedData({ ...formData });
    }
  }, [formData, isEditing]);
  
  // Log formData to debug
  useEffect(() => {
    console.log('Page1InfoCard - formData:', formData);
  }, [formData]);
  
  // Determine if we're displaying profit business categories
  // Use business_category from page1 with proper priority
  const businessCategory = editedData.business_category || editedData.business_type || '';
  const isProfitBusiness = businessCategory === 'profit_business' || businessCategory === 'profit';

  // Log the business category determination
  useEffect(() => {
    console.log('Page1InfoCard - Business category determination:', { 
      businessCategory,
      isProfitBusiness,
      fromPage1: editedData.business_category,
      fromPage2: editedData.business_type
    });
  }, [businessCategory, isProfitBusiness, editedData.business_category, editedData.business_type]);

  // Get business category display text
  const getBusinessCategoryText = () => {
    switch(businessCategory) {
      case 'social_contribution': return '사회공헌';
      case 'profit_business': 
      case 'profit': return '수익사업';
      default: return businessCategory || '-';
    }
  };

  // Get subcategory display text
  const getSubCategoryText = () => {
    // Use business_subcategory from page1 if available, otherwise use sub_category from page2
    const subCategory = editedData.business_subcategory || editedData.sub_category || '';
    switch(subCategory) {
      case 'group': return '단체';
      case 'forest_education': return '산림교육';
      case 'individual': return '개인고객';
      case 'corporate_csr': return '사회공헌';
      case 'family': return '가족';
      default: return subCategory || '-';
    }
  };

  // Get detail category display text
  const getDetailCategoryText = () => {
    // Use business_detail_category from page1 if available, otherwise use detail_category from page2
    const detailCategory = editedData.business_detail_category || editedData.detail_category || '';
    switch(detailCategory) {
      // Individual customer types
      case 'general_customer': return '일반고객';
      case 'local_resident': return '지역주민';
      case 'employee_discount': return '직원할인';
      case 'instructor_driver': return '강사 및 기사';
      case 'etc': return '기타';
      
      // Group types
      case 'general_group': return '일반단체';
      case 'local_group': return '지역단체';
      
      // Forest education types
      case 'teacher_training': return '산림바우처';
      case 'forest_voucher': return '산림바우처';
      
      default: return detailCategory || '-';
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (onSave) {
      onSave(editedData);
    }
    setIsEditing(false);
  };

  // Handle cancel editing
  const handleCancel = () => {
    setEditedData({ ...formData });
    setIsEditing(false);
  };

  return (
    <Card sx={{ mb: 3, overflow: 'hidden' }}>
      {/* Header with status and edit controls */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: editedData.reservation_status === 'confirmed' ? 
            theme.palette.success.light : theme.palette.primary.light,
          color: 'white'
        }}
      >
        <Box>
          <Typography variant="h4">Page1 예약 정보</Typography>
          {editedData.id && (
            <Typography variant="subtitle2">ID: {editedData.id}</Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip 
            label={editedData.reservation_status === 'confirmed' ? '확정예약' : '가예약'} 
            color={editedData.reservation_status === 'confirmed' ? 'success' : 'primary'} 
            sx={{ bgcolor: 'white' }}
          />
          {!isEditing ? (
            <Button 
              variant="contained" 
              color="info" 
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{ color: 'white' }}
            >
              수정
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                sx={{ color: 'white' }}
              >
                저장
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                sx={{ color: 'white' }}
              >
                취소
              </Button>
            </>
          )}
        </Stack>
      </Box>
      
      <CardContent>
        {/* Reservation Status */}
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1,
          bgcolor: theme.palette.grey[50]
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            예약상태 *
          </Typography>
          
          <Box sx={{ ml: 2 }}>
            {isEditing ? (
              <FormControl>
                <RadioGroup
                  row
                  value={editedData.reservation_status || 'preparation'}
                  onChange={(e) => handleChange('reservation_status', e.target.value)}
                >
                  <FormControlLabel value="preparation" control={<Radio />} label="가예약" />
                  <FormControlLabel value="confirmed" control={<Radio />} label="확정예약" />
                </RadioGroup>
              </FormControl>
            ) : (
              <Typography>
                {editedData.reservation_status === 'confirmed' ? '확정예약' : '가예약'}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Business Category Information */}
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1,
          bgcolor: theme.palette.grey[50]
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            <BusinessIcon sx={{ mr: 1 }} />
            사업 정보
          </Typography>
          
          <Grid container spacing={2}>
            {/* Business Type - Always show this */}
            <Grid item xs={12} md={isProfitBusiness ? 6 : 12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">사업구분 *</Typography>
                {isEditing ? (
                  <FormControl fullWidth size="small" margin="dense">
                    <Select
                      value={editedData.business_category || ''}
                      onChange={(e) => handleChange('business_category', e.target.value)}
                    >
                      <MenuItem value="social_contribution">사회공헌</MenuItem>
                      <MenuItem value="profit_business">수익사업</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography fontWeight="medium">
                    {getBusinessCategoryText()}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Only show sub-category and detail-category for profit business */}
            {isProfitBusiness && (
              <>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">세부구분 *</Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small" margin="dense">
                        <Select
                          value={editedData.business_subcategory || ''}
                          onChange={(e) => handleChange('business_subcategory', e.target.value)}
                        >
                          <MenuItem value="group">단체</MenuItem>
                          <MenuItem value="forest_education">산림교육</MenuItem>
                          <MenuItem value="individual">개인고객</MenuItem>
                          <MenuItem value="corporate_csr">사회공헌</MenuItem>
                          <MenuItem value="family">가족</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography fontWeight="medium">
                        {getSubCategoryText()}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">상세구분 *</Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small" margin="dense">
                        <Select
                          value={editedData.business_detail_category || ''}
                          onChange={(e) => handleChange('business_detail_category', e.target.value)}
                        >
                          {/* Render appropriate options based on subcategory */}
                          {editedData.business_subcategory === 'individual' && (
                            <>
                              <MenuItem value="general_customer">일반고객</MenuItem>
                              <MenuItem value="local_resident">지역주민</MenuItem>
                              <MenuItem value="employee_discount">직원할인</MenuItem>
                              <MenuItem value="instructor_driver">강사 및 기사</MenuItem>
                              <MenuItem value="etc">기타</MenuItem>
                            </>
                          )}
                          {editedData.business_subcategory === 'group' && (
                            <>
                              <MenuItem value="general_group">일반단체</MenuItem>
                              <MenuItem value="local_group">지역단체</MenuItem>
                            </>
                          )}
                          {editedData.business_subcategory === 'forest_education' && (
                            <>
                              <MenuItem value="teacher_training">산림바우처</MenuItem>
                              <MenuItem value="forest_voucher">산림바우처</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography fontWeight="medium">
                        {getDetailCategoryText()}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        
        {/* Schedule Information */}
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1,
          bgcolor: theme.palette.grey[50]
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            <CalendarMonthIcon sx={{ mr: 1 }} />
            일정 *
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">시작일</Typography>
                {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                    <DatePicker
                      value={parseDate(editedData.start_date)}
                      onChange={(newDate) => handleChange('start_date', newDate ? newDate.toISOString() : null)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" margin="dense" />}
                    />
                  </LocalizationProvider>
                ) : (
                  <Typography fontWeight="medium">{formatDateForDisplay(editedData.start_date)}</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">종료일</Typography>
                {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                    <DatePicker
                      value={parseDate(editedData.end_date)}
                      onChange={(newDate) => handleChange('end_date', newDate ? newDate.toISOString() : null)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" margin="dense" />}
                    />
                  </LocalizationProvider>
                ) : (
                  <Typography fontWeight="medium">{formatDateForDisplay(editedData.end_date)}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Group & Contact Information */}
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1,
          bgcolor: theme.palette.grey[50]
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            <GroupsIcon sx={{ mr: 1 }} />
            단체 및 인솔자 정보
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">단체명/고객명 *</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.group_name || ''}
                    onChange={(e) => handleChange('group_name', e.target.value)}
                  />
                ) : (
                  <Typography fontWeight="medium">{editedData.group_name || '-'}</Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">인솔자명 *</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.customer_name || ''}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                  />
                ) : (
                  <Typography fontWeight="medium">{editedData.customer_name || '-'}</Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">유선연락처</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.landline_phone || ''}
                    onChange={(e) => handleChange('landline_phone', e.target.value)}
                    InputProps={{
                      startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.grey[600] }} />
                    }}
                  />
                ) : (
                  <Typography>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.grey[600] }} />
                      {editedData.landline_phone || '-'}
                    </Box>
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">무선연락처</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.mobile_phone || ''}
                    onChange={(e) => handleChange('mobile_phone', e.target.value)}
                    InputProps={{
                      startAdornment: <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.grey[600] }} />
                    }}
                  />
                ) : (
                  <Typography>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.grey[600] }} />
                      {editedData.mobile_phone || '-'}
                    </Box>
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">이메일 *</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    InputProps={{
                      startAdornment: <EmailIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.grey[600] }} />
                    }}
                  />
                ) : (
                  <Typography>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.grey[600] }} />
                      {editedData.email || '-'}
                    </Box>
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Management Info */}
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1,
          bgcolor: theme.palette.grey[50]
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            <PersonIcon sx={{ mr: 1 }} />
            담당자 정보
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">예약담당 *</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.reservation_manager || ''}
                    onChange={(e) => handleChange('reservation_manager', e.target.value)}
                  />
                ) : (
                  <Typography>{editedData.reservation_manager || '-'}</Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">운영담당</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    value={editedData.operation_manager || ''}
                    onChange={(e) => handleChange('operation_manager', e.target.value)}
                  />
                ) : (
                  <Typography>{editedData.operation_manager || '-'}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Notes */}
        <Box sx={{ 
          p: 2, 
          border: `1px solid ${theme.palette.divider}`, 
          borderRadius: 1,
          bgcolor: theme.palette.grey[50]
        }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom 
            sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.main, fontWeight: 'bold' }}
          >
            <NotesIcon sx={{ mr: 1 }} />
            비고
          </Typography>
          
          <Box sx={{ ml: 2 }}>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                margin="dense"
                value={editedData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            ) : (
              <Typography variant="body2">{editedData.notes || '-'}</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Page1InfoCard; 