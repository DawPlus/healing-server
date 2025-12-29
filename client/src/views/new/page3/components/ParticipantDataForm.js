import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Card,
  CardContent,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import Swal from 'sweetalert2';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';

// Import GraphQL queries & mutations
import { 
  GET_PARTICIPANT_ROOMS, 
  GET_PARTICIPANT_MEALS 
} from '../graphql/queries';
import {
  CREATE_PARTICIPANT_ROOM,
  UPDATE_PARTICIPANT_ROOM,
  DELETE_PARTICIPANT_ROOM,
  CREATE_PARTICIPANT_MEAL,
  UPDATE_PARTICIPANT_MEAL,
  DELETE_PARTICIPANT_MEAL
} from '../graphql/mutations';

const ParticipantDataForm = ({ page1Id }) => {
  const theme = useTheme();
  const [roomForm, setRoomForm] = useState({ room_type: '', count: 0 });
  const [mealForm, setMealForm] = useState({ meal_type: '', count: 0 });
  const [editing, setEditing] = useState({ type: null, id: null });
  
  // Query participant data
  const { 
    data: roomsData, 
    loading: roomsLoading, 
    refetch: refetchRooms 
  } = useQuery(GET_PARTICIPANT_ROOMS, {
    variables: { page1Id: parseInt(page1Id) },
    fetchPolicy: 'network-only'
  });
  
  const { 
    data: mealsData, 
    loading: mealsLoading, 
    refetch: refetchMeals 
  } = useQuery(GET_PARTICIPANT_MEALS, {
    variables: { page1Id: parseInt(page1Id) },
    fetchPolicy: 'network-only'
  });
  
  // Mutations
  const [createParticipantRoom] = useMutation(CREATE_PARTICIPANT_ROOM, {
    onCompleted: () => {
      refetchRooms();
      setRoomForm({ room_type: '', count: 0 });
    }
  });
  
  const [updateParticipantRoom] = useMutation(UPDATE_PARTICIPANT_ROOM, {
    onCompleted: () => {
      refetchRooms();
      setRoomForm({ room_type: '', count: 0 });
      setEditing({ type: null, id: null });
    }
  });
  
  const [deleteParticipantRoom] = useMutation(DELETE_PARTICIPANT_ROOM, {
    onCompleted: () => {
      refetchRooms();
    }
  });
  
  const [createParticipantMeal] = useMutation(CREATE_PARTICIPANT_MEAL, {
    onCompleted: () => {
      refetchMeals();
      setMealForm({ meal_type: '', count: 0 });
    }
  });
  
  const [updateParticipantMeal] = useMutation(UPDATE_PARTICIPANT_MEAL, {
    onCompleted: () => {
      refetchMeals();
      setMealForm({ meal_type: '', count: 0 });
      setEditing({ type: null, id: null });
    }
  });
  
  const [deleteParticipantMeal] = useMutation(DELETE_PARTICIPANT_MEAL, {
    onCompleted: () => {
      refetchMeals();
    }
  });
  
  // Handle form changes
  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMealFormChange = (e) => {
    const { name, value } = e.target;
    setMealForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submissions
  const handleRoomSubmit = (e) => {
    e.preventDefault();
    
    if (!roomForm.room_type) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '객실 유형을 입력해주세요.'
      });
      return;
    }
    
    const input = {
      page1_id: parseInt(page1Id),
      room_type: roomForm.room_type,
      count: parseInt(roomForm.count) || 0
    };
    
    if (editing.type === 'room' && editing.id) {
      // Update existing room
      updateParticipantRoom({
        variables: {
          id: editing.id,
          input
        }
      });
    } else {
      // Create new room
      createParticipantRoom({
        variables: { input }
      });
    }
  };
  
  const handleMealSubmit = (e) => {
    e.preventDefault();
    
    if (!mealForm.meal_type) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '식사 유형을 입력해주세요.'
      });
      return;
    }
    
    const input = {
      page1_id: parseInt(page1Id),
      meal_type: mealForm.meal_type,
      count: parseInt(mealForm.count) || 0
    };
    
    if (editing.type === 'meal' && editing.id) {
      // Update existing meal
      updateParticipantMeal({
        variables: {
          id: editing.id,
          input
        }
      });
    } else {
      // Create new meal
      createParticipantMeal({
        variables: { input }
      });
    }
  };
  
  // Handle edit actions
  const handleEdit = (type, item) => {
    if (type === 'room') {
      setRoomForm({
        room_type: item.room_type,
        count: item.count
      });
      setEditing({ type: 'room', id: item.id });
    } else if (type === 'meal') {
      setMealForm({
        meal_type: item.meal_type,
        count: item.count
      });
      setEditing({ type: 'meal', id: item.id });
    }
  };
  
  // Handle delete actions
  const handleDelete = (type, id) => {
    Swal.fire({
      title: '삭제 확인',
      text: '정말로 이 항목을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        if (type === 'room') {
          deleteParticipantRoom({
            variables: { id }
          });
        } else if (type === 'meal') {
          deleteParticipantMeal({
            variables: { id }
          });
        }
      }
    });
  };
  
  // Cancel edit mode
  const handleCancelEdit = (type) => {
    if (type === 'room') {
      setRoomForm({ room_type: '', count: 0 });
    } else if (type === 'meal') {
      setMealForm({ meal_type: '', count: 0 });
    }
    setEditing({ type: null, id: null });
  };
  
  // Render functions
  const renderRoomForm = () => {
    return (
      <Box component="form" onSubmit={handleRoomSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="객실 유형"
              name="room_type"
              value={roomForm.room_type}
              onChange={handleRoomFormChange}
              placeholder="일반, 우수, VIP 등"
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="수량"
              name="count"
              type="number"
              value={roomForm.count}
              onChange={handleRoomFormChange}
              inputProps={{ min: 0 }}
              size="small"
            />
          </Grid>
          <Grid item xs={5}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              startIcon={editing.type === 'room' ? <SaveIcon /> : <AddIcon />}
              sx={{ ml: 1 }}
            >
              {editing.type === 'room' ? '저장' : '추가'}
            </Button>
            {editing.type === 'room' && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelEdit('room')}
                sx={{ ml: 1 }}
              >
                취소
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderMealForm = () => {
    return (
      <Box component="form" onSubmit={handleMealSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="식사 유형"
              name="meal_type"
              value={mealForm.meal_type}
              onChange={handleMealFormChange}
              placeholder="식사횟수, 특식 등"
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="인원"
              name="count"
              type="number"
              value={mealForm.count}
              onChange={handleMealFormChange}
              inputProps={{ min: 0 }}
              size="small"
            />
          </Grid>
          <Grid item xs={5}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              startIcon={editing.type === 'meal' ? <SaveIcon /> : <AddIcon />}
              sx={{ ml: 1 }}
            >
              {editing.type === 'meal' ? '저장' : '추가'}
            </Button>
            {editing.type === 'meal' && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelEdit('meal')}
                sx={{ ml: 1 }}
              >
                취소
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderRoomTable = () => {
    const rooms = roomsData?.getParticipantRooms || [];
    
    if (roomsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }
    
    if (rooms.length === 0) {
      return (
        <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
          등록된 객실 데이터가 없습니다.
        </Typography>
      );
    }
    
    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>객실 유형</TableCell>
              <TableCell align="center">수량</TableCell>
              <TableCell align="right">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.room_type}</TableCell>
                <TableCell align="center">{room.count}</TableCell>
                <TableCell align="right">
                  <Tooltip title="수정">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit('room', room)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete('room', room.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  const renderMealTable = () => {
    const meals = mealsData?.getParticipantMeals || [];
    
    if (mealsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }
    
    if (meals.length === 0) {
      return (
        <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
          등록된 식사 데이터가 없습니다.
        </Typography>
      );
    }
    
    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>식사 유형</TableCell>
              <TableCell align="center">인원</TableCell>
              <TableCell align="right">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meals.map((meal) => (
              <TableRow key={meal.id}>
                <TableCell>{meal.meal_type}</TableCell>
                <TableCell align="center">{meal.count}</TableCell>
                <TableCell align="right">
                  <Tooltip title="수정">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit('meal', meal)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete('meal', meal.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          참가자 정보
        </Typography>
        <Divider />
      </Box>
      
      <Grid container spacing={4}>
        {/* Room data section */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">객실</Typography>
              </Box>
              
              {renderRoomForm()}
              
              <Box sx={{ mt: 2 }}>
                {renderRoomTable()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Meal data section */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">식사</Typography>
              </Box>
              
              {renderMealForm()}
              
              <Box sx={{ mt: 2 }}>
                {renderMealTable()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ParticipantDataForm; 