import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  useTheme
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import callApi from 'utils/callApi';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';

const Places = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Component state
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPlace, setCurrentPlace] = useState({ id: null, name: '', capacity: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  // Load places on mount
  useEffect(() => {
    fetchPlaces();
  }, []);
  
  // Fetch places from API
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await callApi('/new2/getPlaces');
      if (response?.data) {
        setPlaces(response.data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      showAlert('장소 목록을 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Open dialog to add a new place
  const handleAddPlace = () => {
    setCurrentPlace({ id: null, name: '', capacity: '', description: '' });
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Open dialog to edit a place
  const handleEditPlace = (place) => {
    setCurrentPlace(place);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  // Open dialog to confirm place deletion
  const handleDeleteClick = (place) => {
    setCurrentPlace(place);
    setDeleteDialogOpen(true);
  };
  
  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlace({ ...currentPlace, [name]: value });
  };
  
  // Save place (create or update)
  const handleSavePlace = async () => {
    // Validate
    if (!currentPlace.name) {
      showAlert('장소명은 필수 입력 항목입니다.', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = isEditing ? '/new2/updatePlace' : '/new2/addPlace';
      const response = await callApi(endpoint, currentPlace);
      
      if (response?.data) {
        setDialogOpen(false);
        fetchPlaces();
        showAlert(
          isEditing ? '장소가 성공적으로 수정되었습니다.' : '장소가 성공적으로 추가되었습니다.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error saving place:', error);
      showAlert('장소 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete place
  const handleDeletePlace = async () => {
    if (!currentPlace.id) return;
    
    setLoading(true);
    try {
      const response = await callApi(`/new2/deletePlace/${currentPlace.id}`, null, 'DELETE');
      
      if (response?.data) {
        setDeleteDialogOpen(false);
        fetchPlaces();
        showAlert('장소가 성공적으로 삭제되었습니다.', 'success');
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      showAlert('장소 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Navigate back to page2
  const handleBack = () => {
    navigate('/new/page2');
  };
  
  // Show alert
  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setAlertOpen(false);
  };
  
  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PlaceIcon sx={{ mr: 1 }} />
          <Typography variant="h3">장소 관리</Typography>
        </Box>
      }
    >
      <Box sx={{ mt: 2 }}>
        {/* Action buttons */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            목록으로
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPlace}
          >
            장소 추가
          </Button>
        </Box>
        
        {/* Places list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                  <TableCell width="40%">장소명</TableCell>
                  <TableCell width="20%">수용인원</TableCell>
                  <TableCell width="30%">설명</TableCell>
                  <TableCell width="10%">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {places.length > 0 ? (
                  places.map((place) => (
                    <TableRow key={place.id}>
                      <TableCell>{place.name}</TableCell>
                      <TableCell>{place.capacity || '-'}</TableCell>
                      <TableCell>{place.description || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditPlace(place)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(place)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      등록된 장소가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Add/Edit Place Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isEditing ? '장소 수정' : '장소 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                name="name"
                label="장소명"
                fullWidth
                value={currentPlace.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                name="capacity"
                label="수용인원"
                type="number"
                fullWidth
                value={currentPlace.capacity}
                onChange={handleInputChange}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
              <TextField
                name="description"
                label="설명"
                fullWidth
                multiline
                rows={3}
                value={currentPlace.description}
                onChange={handleInputChange}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>취소</Button>
            <Button onClick={handleSavePlace} color="primary" variant="contained">
              저장
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>장소 삭제</DialogTitle>
          <DialogContent>
            <DialogContentText>
              '{currentPlace.name}' 장소를 정말 삭제하시겠습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
            <Button onClick={handleDeletePlace} color="error">
              삭제
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Alert notification */}
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </MainCard>
  );
};

export default Places; 