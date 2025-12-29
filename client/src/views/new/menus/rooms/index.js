import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// GraphQL queries and mutations
const GET_MENU_ROOMS = gql`
  query MenuRooms {
    menuRooms {
      id
      room_type
      room_name
      capacity
      price
      description
      is_available
      facilities
      display_order
      created_at
      updated_at
    }
  }
`;

const CREATE_MENU_ROOM = gql`
  mutation CreateMenuRoom($input: MenuRoomInput!) {
    createMenuRoom(input: $input) {
      id
      room_type
      room_name
      capacity
      price
      description
      is_available
      facilities
      display_order
    }
  }
`;

const UPDATE_MENU_ROOM = gql`
  mutation UpdateMenuRoom($id: Int!, $input: MenuRoomInput!) {
    updateMenuRoom(id: $id, input: $input) {
      id
      room_type
      room_name
      capacity
      price
      description
      is_available
      facilities
      display_order
    }
  }
`;

const DELETE_MENU_ROOM = gql`
  mutation DeleteMenuRoom($id: Int!) {
    deleteMenuRoom(id: $id)
  }
`;

// Room type options
const roomTypeOptions = [
  '스탠다드',
  '디럭스'
];

const MenuRooms = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_type: roomTypeOptions[0],
    room_name: '',
    capacity: 1,
    price: 0,
    description: '',
    is_available: true,
    display_order: 0
  });

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_MENU_ROOMS, {
    onError: (error) => {
      console.error('Error fetching rooms:', error);
    }
  });
  const [createMenuRoom] = useMutation(CREATE_MENU_ROOM);
  const [updateMenuRoom] = useMutation(UPDATE_MENU_ROOM);
  const [deleteMenuRoom] = useMutation(DELETE_MENU_ROOM);

  const rooms = data?.menuRooms || [];

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      room_type: roomTypeOptions[0],
      room_name: '',
      capacity: 1,
      price: 0,
      description: '',
      is_available: true,
      display_order: 0
    });
  };

  const handleEdit = (room) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedRoom(room);
    setFormData({
      room_type: room.room_type,
      room_name: room.room_name,
      capacity: room.capacity,
      price: room.price,
      description: room.description || '',
      is_available: room.is_available,
      display_order: room.display_order || 0
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'is_available' ? checked : 
              (name === 'capacity' || name === 'price' || name === 'display_order') 
              ? parseInt(value, 10) || 0 
              : value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (isEdit && selectedRoom) {
        await updateMenuRoom({
          variables: {
            id: selectedRoom.id,
            input: formData
          }
        });
      } else {
        await createMenuRoom({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  // Handle room deletion
  const handleDelete = async (id) => {
    if (window.confirm('객실을 삭제하시겠습니까?')) {
      try {
        await deleteMenuRoom({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  if (loading) return <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-20px', marginLeft: '-20px' }} />;
  if (error) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error" variant="h5" gutterBottom>
        {error.message || '객실 목록을 불러오는 중 오류가 발생했습니다.'}
      </Typography>
      <Typography variant="body1" gutterBottom>
        서버 연결 상태를 확인해 주세요.
      </Typography>
      <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
        다시 시도
      </Button>
    </Box>
  );

  return (
    <MainCard title="객실 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            객실 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="객실 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">객실명</TableCell>
                <TableCell align="center">객실 타입</TableCell>
                <TableCell align="center">수용 인원</TableCell>
                <TableCell align="center">가격</TableCell>
                <TableCell align="center">이용 가능</TableCell>
                <TableCell align="center">표시 순서</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    등록된 객실이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell align="center">{room.id}</TableCell>
                    <TableCell align="center">{room.room_name}</TableCell>
                    <TableCell align="center">
                      {roomTypeOptions.includes(room.room_type) ? room.room_type : roomTypeOptions[0]}
                    </TableCell>
                    <TableCell align="center">{room.capacity}</TableCell>
                    <TableCell align="center">{room.price?.toLocaleString()}원</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={room.is_available ? '가능' : '불가능'} 
                        color={room.is_available ? 'success' : 'error'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{room.display_order}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(room)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(room.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? '객실 수정' : '객실 추가'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={gridSpacing} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                margin="dense"
                name="room_name"
                label="객실명"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.room_name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="room-type-label">객실 타입</InputLabel>
                <Select
                  labelId="room-type-label"
                  name="room_type"
                  value={formData.room_type}
                  label="객실 타입"
                  onChange={handleChange}
                >
                  {roomTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="capacity"
                label="수용 인원"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.capacity}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="price"
                label="가격"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="display_order"
                label="표시 순서"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.display_order}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.is_available} 
                    onChange={handleChange} 
                    name="is_available" 
                  />
                }
                label="이용 가능"
                sx={{ mt: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="설명"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.room_name || !formData.room_type || !formData.capacity}
          >
            {isEdit ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default MenuRooms; 