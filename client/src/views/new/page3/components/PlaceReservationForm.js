import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  InputAdornment,
  FormHelperText,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';

// Icons
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SubjectIcon from '@mui/icons-material/Subject';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NoteIcon from '@mui/icons-material/Note';

const PlaceReservationForm = ({ 
  formData, 
  placeForm, 
  updatePlaceForm, 
  addPlaceReservation, 
  removePlaceReservation,
  availablePlaces = []
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const theme = useTheme();

  useEffect(() => {
    // Log available places for debugging
    console.log('Available places:', availablePlaces);
    
    // Find place details when place_id changes
    if (placeForm.place_id) {
      // Handle "undecided" case
      if (placeForm.place_id === 'undecided') {
        setSelectedPlace({ id: 'undecided', location_name: '미정', capacity: null });
        return;
      }
      
      const place = availablePlaces.find(p => parseInt(p.id, 10) === parseInt(placeForm.place_id, 10));
      console.log('Selected place from ID:', place);
      setSelectedPlace(place);
      
      if (place) {
        // Update form with place details - only if it hasn't been set already
        if (placeForm.place_name !== place.location_name) {
          updatePlaceForm('place_name', place.location_name);
        }
      }
    } else {
      setSelectedPlace(null);
    }
  }, [placeForm.place_id, availablePlaces]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return moment(dateString).format('YYYY-MM-DD');
    } catch (e) {
      return dateString;
    }
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // Check if time has correct format
      if (timeString.includes(':')) {
        return timeString;
      }
      
      // Try to parse as Date object if it's not already a time string
      const date = new Date(timeString);
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return timeString;
    }
  };
  
  // Toggle form visibility
  const toggleForm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowForm(!showForm);
    if (!showForm) {
      // Initialize with first day of reservation
      updatePlaceForm('reservation_date', formData.start_date);
      // Default start time (9:00)
      updatePlaceForm('start_time', '09:00');
      // Default end time (18:00)
      updatePlaceForm('end_time', '18:00');
      // Default to all participants
      updatePlaceForm('participants', formData.participants_count || 0);
      // Default purpose
      updatePlaceForm('purpose', '회의');
      // Default price
      updatePlaceForm('price', 0);
    }
  };
  
  // Handle form field changes
  const handleFormChange = (field, value) => {
    updatePlaceForm(field, value);
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle time change (format hh:mm)
  const handleTimeChange = (field, time) => {
    if (!time) return;
    
    try {
      // Format as HH:MM
      const formattedTime = moment(time).format('HH:mm');
      handleFormChange(field, formattedTime);
    } catch (e) {
      console.error('Time format error:', e);
    }
  };
  
  // Parse time string to Date object for TimePicker
  const parseTimeToDate = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    if (!timeStr.includes(':')) return null;
    
    try {
      // Create a base date (today) and set the time components
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch (e) {
      console.error('Error parsing time string:', e);
      return null;
    }
  };
  
  // Handle place selection change to update name in the form
  const handlePlaceSelectChange = (event) => {
    const value = event.target.value;
    console.log('Selected place ID:', value, typeof value);
    
    // Handle "미정" (undecided) selection
    if (value === "undecided") {
      updatePlaceForm('place_id', 'undecided');
      updatePlaceForm('place_name', '미정');
      return;
    }
    
    // Handle test values
    if (value === "201" || value === "202") {
      const isTestPlaceA = value === "201";
      const testPlace = {
        id: value,
        location_name: isTestPlaceA ? "테스트 장소 A" : "테스트 장소 B",
        capacity: isTestPlaceA ? 50 : 100
      };
      
      // Only update the ID, the rest will be updated in useEffect
      // Ensure place_id is always a string
      updatePlaceForm('place_id', String(testPlace.id));
      return;
    }
    
    // Only update the ID, the rest will be updated in useEffect
    // Ensure place_id is always a string
    updatePlaceForm('place_id', String(value));
  };

  // Handle adding the selected place reservation
  const handleAddClick = () => {
    console.log('Current place form:', placeForm);
    
    // Validate required fields
    if (!placeForm.place_id) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '장소를 선택해주세요.'
      });
      return;
    }
    
    if (!placeForm.reservation_date) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '예약 날짜를 선택해주세요.'
      });
      return;
    }
    
    if (!placeForm.start_time || !placeForm.end_time) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '시작 시간과 종료 시간을 모두 입력해주세요.'
      });
      return;
    }
    
    // 시간 유효성 검사 추가
    if (placeForm.start_time >= placeForm.end_time) {
      Swal.fire({
        icon: 'warning',
        title: '시간 오류',
        text: '종료 시간은 시작 시간보다 뒤여야 합니다.'
      });
      return;
    }
    
    // 기존 예약과의 시간 중복 체크
    // 동일 장소, 동일 날짜에 시간이 겹치는 예약 확인
    const isDuplicateReservation = formData.place_reservations.some(reservation => {
      // 수정 모드에서 자기 자신은 제외
      if (editMode && reservation.id === placeForm.id) {
        return false;
      }
      
      // 동일 장소, 동일 날짜 확인
      if (
        reservation.place_id === placeForm.place_id && 
        reservation.reservation_date === placeForm.reservation_date
      ) {
        // 시간 중복 확인
        // (시작1 <= 종료2) && (종료1 >= 시작2) -> 중복
        const isTimeOverlapping = 
          (placeForm.start_time <= reservation.end_time && 
           placeForm.end_time >= reservation.start_time);
        
        return isTimeOverlapping;
      }
      
      return false;
    });
    
    if (isDuplicateReservation) {
      Swal.fire({
        icon: 'error',
        title: '예약 중복',
        text: '동일 장소에 이미 같은 시간대에 예약이 있습니다. 다른 시간을 선택해주세요.'
      });
      return;
    }
    
    // Ensure place_id is a string and get place_name if it's missing
    let place_id = String(placeForm.place_id);
    let place_name = placeForm.place_name;
    
    // If place_name is not available, try to find it from available places
    if (!place_name && place_id) {
      const selectedPlace = availablePlaces.find(p => String(p.id) === place_id);
      if (selectedPlace) {
        place_name = selectedPlace.location_name;
      }
    }
    
    // Make sure the date is properly formatted
    let reservation_date;
    try {
      reservation_date = typeof placeForm.reservation_date === 'string'
        ? placeForm.reservation_date
        : moment(placeForm.reservation_date).format('YYYY-MM-DD');
    } catch (e) {
      reservation_date = moment().format('YYYY-MM-DD');
      console.error('Error formatting date:', e);
    }
    
    // Format the reservation object
    const reservation = {
      // Keep original ID if in edit mode, otherwise create a new one
      id: editMode ? placeForm.id : `place_${Date.now()}`,
      place_id: place_id,
      place_name: place_name,
      reservation_date: reservation_date,
      start_time: placeForm.start_time,
      end_time: placeForm.end_time,
      purpose: placeForm.purpose || '',
      participants: parseInt(placeForm.participants) || 0,
      price: parseInt(placeForm.price) || 0,
      notes: placeForm.notes || ''
    };
    
    console.log('Submitting place reservation:', reservation, 'Edit mode:', editMode);
    
    if (editMode) {
      // Call parent handler to update place reservation
      addPlaceReservation('edit', reservation);
    } else {
      // Call parent handler to add new place reservation
      addPlaceReservation('add', reservation);
    }
    
    // Reset form and close it
    resetForm();
  };

  // Add edit functionality for place reservations
  const handleEditPlaceReservation = (reservation) => {
    console.log('Editing place reservation:', reservation);
    
    // Set form values with the selected place reservation
    updatePlaceForm('id', reservation.id);
    updatePlaceForm('place_id', reservation.place_id);
    updatePlaceForm('place_name', reservation.place_name);
    
    // Handle date in different formats
    try {
      const dateObj = typeof reservation.reservation_date === 'string'
        ? new Date(reservation.reservation_date)
        : reservation.reservation_date;
        
      updatePlaceForm('reservation_date', dateObj);
    } catch (e) {
      console.error('Error parsing date:', e);
      updatePlaceForm('reservation_date', new Date());
    }
    
    updatePlaceForm('start_time', reservation.start_time);
    updatePlaceForm('end_time', reservation.end_time);
    updatePlaceForm('purpose', reservation.purpose || '');
    updatePlaceForm('participants', reservation.participants || 0);
    updatePlaceForm('price', reservation.price || 0);
    updatePlaceForm('notes', reservation.notes || '');
    
    // Open the form in edit mode
    setShowForm(true);
    setEditMode(true);
    
    // Update the selected place reference
    if (reservation.place_id) {
      const place = availablePlaces.find(p => String(p.id) === String(reservation.place_id));
      if (place) {
        setSelectedPlace(place);
      }
    }
  };

  // Add a function to reset form
  const resetForm = () => {
    updatePlaceForm('id', null);
    updatePlaceForm('place_id', '');
    updatePlaceForm('place_name', '');
    updatePlaceForm('reservation_date', formData.start_date);
    updatePlaceForm('start_time', '09:00');
    updatePlaceForm('end_time', '18:00');
    updatePlaceForm('purpose', '');
    updatePlaceForm('participants', formData.participants_count || 0);
    updatePlaceForm('price', 0);
    updatePlaceForm('notes', '');
    setShowForm(false);
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!placeForm.place_id) {
      newErrors.place_id = '장소를 선택해주세요';
    }
    
    if (!placeForm.reservation_date) {
      newErrors.reservation_date = '예약 일자를 선택해주세요';
    }
    
    if (!placeForm.start_time) {
      newErrors.start_time = '시작 시간을 입력해주세요';
    }
    
    if (!placeForm.end_time) {
      newErrors.end_time = '종료 시간을 입력해주세요';
    }
    
    if (placeForm.participants < 1) {
      newErrors.participants = '참가자 수는 1명 이상이어야 합니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocationOnIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">대관 예약</Typography>
      </Box>

      {/* 장소 목록이 비어있는 경우 메시지 및 새로고침 버튼 추가 */}
      {availablePlaces.length === 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => {
                console.log('[PlaceReservationForm] Manually triggering places data refresh');
                const event = new CustomEvent('refreshPlacesData', { detail: { source: 'PlaceReservationForm' } });
                window.dispatchEvent(event);
              }}
            >
              데이터 새로고침
            </Button>
          }
        >
          장소 정보를 불러오지 못했습니다. 데이터 새로고침을 눌러 다시 시도하세요.
        </Alert>
      )}

      {/* Place reservations table */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          <MeetingRoomIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
          대관 예약 ({formData.place_reservations.length})
        </Typography>
        
        {formData.place_reservations.length === 0 ? (
          <Alert severity="info">대관 예약이 없습니다. 아래 버튼을 눌러 장소를 예약하세요.</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>장소명</TableCell>
                  <TableCell>예약일</TableCell>
                  <TableCell>시간</TableCell>
                  <TableCell>목적</TableCell>
                  <TableCell>인원</TableCell>
                  <TableCell>가격</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.place_reservations.map((place, index) => (
                  <TableRow key={place.id || index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {place.place_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(place.reservation_date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {formatTime(place.start_time)} ~ {formatTime(place.end_time)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={place.purpose} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{place.participants}명</TableCell>
                    <TableCell>{place.price ? `${place.price.toLocaleString()}원` : '0원'}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleEditPlaceReservation(place)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => removePlaceReservation(place.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Add place button or form */}
      {showForm ? (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            <AddIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            대관 예약 추가
          </Typography>
          
          <form onSubmit={(e) => {
            e.preventDefault(); // 폼 기본 동작 방지
            if (validateForm()) {
              handleAddClick();
            }
            return false; // 추가 방어
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth error={!!errors.place_id}>
                  <InputLabel>장소 선택</InputLabel>
                  <Select
                    value={placeForm.place_id || ''}
                    onChange={handlePlaceSelectChange}
                    label="장소 선택"
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      장소를 선택하세요
                    </MenuItem>
                    <MenuItem value="undecided">
                      미정 (장소 선택 안함)
                    </MenuItem>
                    {availablePlaces.length > 0 ? (
                      availablePlaces.map((place) => (
                        <MenuItem key={place.id} value={place.id}>
                          {place.location_name} - {place.capacity ? `${place.capacity}명` : '인원 제한 없음'}
                        </MenuItem>
                      ))
                    ) : (
                      // Add dummy places for testing if none available
                      <>
                        <MenuItem value="201">
                          테스트 장소 A - 50명
                        </MenuItem>
                        <MenuItem value="202">
                          테스트 장소 B - 100명
                        </MenuItem>
                      </>
                    )}
                  </Select>
                  {errors.place_id && <FormHelperText>{errors.place_id}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <DatePicker
                    label="예약일"
                    value={placeForm.reservation_date ? new Date(placeForm.reservation_date) : null}
                    onChange={(date) => {
                      if (date) {
                        try {
                          // 유효한 날짜인지 확인
                          const dateObj = new Date(date);
                          if (isNaN(dateObj.getTime())) {
                            throw new Error('Invalid date');
                          }
                          
                          // 날짜를 YYYY-MM-DD 형식으로 변환
                          const year = dateObj.getFullYear();
                          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                          const day = String(dateObj.getDate()).padStart(2, '0');
                          const dateStr = `${year}-${month}-${day}`;
                          
                          // 이전 값과 같으면 업데이트하지 않음
                          if (dateStr === placeForm.reservation_date) {
                            console.log('[PlaceReservationForm] Date unchanged, skipping update');
                            return;
                          }

                          handleFormChange('reservation_date', dateStr);
                          console.log('[PlaceReservationForm] Reservation date selected:', dateStr);
                        } catch (error) {
                          console.error('Error formatting date:', error);
                          Swal.fire({
                            icon: 'warning',
                            title: '날짜 오류',
                            text: '유효한 날짜를 선택해주세요.'
                          });
                        }
                      }
                    }}
                    renderInput={(params) => 
                      <TextField 
                        {...params} 
                        fullWidth 
                        size="small" 
                        required 
                        error={!placeForm.reservation_date}
                        helperText={!placeForm.reservation_date ? "날짜를 선택해주세요" : ""}
                        sx={{ 
                          '& .MuiOutlinedInput-notchedOutline': { 
                            borderColor: (theme) => !placeForm.reservation_date ? theme.palette.error.main : undefined 
                          }
                        }}
                      />
                    }
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="목적"
                  value={placeForm.purpose}
                  onChange={(e) => handleFormChange('purpose', e.target.value)}
                  size="small"
                  placeholder="회의, 워크샵, 강의 등"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SubjectIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <TimePicker
                    label="시작 시간"
                    value={parseTimeToDate(placeForm.start_time)}
                    onChange={(time) => handleTimeChange('start_time', time)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    ampm={false}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <TimePicker
                    label="종료 시간"
                    value={parseTimeToDate(placeForm.end_time)}
                    onChange={(time) => handleTimeChange('end_time', time)}
                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    ampm={false}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="인원수"
                    type="number"
                    value={placeForm.participants}
                    onChange={(e) => handleFormChange('participants', e.target.value)}
                    size="small"
                    InputProps={{
                      inputProps: { 
                        min: 1, 
                        max: selectedPlace?.capacity || parseInt(formData.participants_count) || 100 
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleFormChange('participants', formData.participants_count || 0)}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    <PeopleIcon fontSize="small" />
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="가격"
                  type="number"
                  value={placeForm.price || ''}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₩
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        원
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.preventDefault(); // 기본 동작 방지
                      e.stopPropagation(); // 이벤트 전파 방지
                      handleAddClick();
                    }}
                    startIcon={editMode ? <SaveIcon /> : <AddIcon />}
                  >
                    {editMode ? '장소 예약 수정' : '장소 예약 추가'}
                  </Button>
                  <Button
                    variant={showForm ? "outlined" : "contained"}
                    color={showForm ? "secondary" : "primary"}
                    onClick={toggleForm}
                    startIcon={showForm ? <PlaceIcon /> : <AddIcon />}
                    size="small"
                  >
                    {showForm ? (editMode ? '수정 취소' : '장소 예약 취소') : '장소 예약 추가'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
          
          {selectedPlace && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                선택한 장소: {selectedPlace.location_name} 
                {selectedPlace.capacity ? ` (최대 ${selectedPlace.capacity}인)` : ''}
                {selectedPlace.description && ` - ${selectedPlace.description}`}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleForm(e);
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            장소 예약 추가
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default PlaceReservationForm; 