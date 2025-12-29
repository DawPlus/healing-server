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
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';

// Icons
import HotelIcon from '@mui/icons-material/Hotel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import BedIcon from '@mui/icons-material/Bed';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ListIcon from '@mui/icons-material/List';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Import the FloorRoomSelector component
import FloorRoomSelector from './FloorRoomSelector';

const RoomSelectionForm = ({ 
  formData, 
  handleFieldChange, 
  roomForm, 
  updateRoomForm, 
  addRoomSelection, 
  removeRoomSelection,
  availableRooms = [],
  onRoomSelect
}) => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Log available rooms when component mounts or when availableRooms changes
  useEffect(() => {
    console.log('[RoomSelectionForm] ============ ROOM DATA RECEIVED ============');
    console.log(`[RoomSelectionForm] Received ${availableRooms.length} rooms for dropdown`);
    
    if (availableRooms.length > 0) {
      console.log('[RoomSelectionForm] Room data format sample:', availableRooms[0]);
    } else {
      console.warn('[RoomSelectionForm] No rooms available for dropdown');
    }
  }, [availableRooms]);

  // Generate a unique ID for the new room selection
  const generateUniqueId = () => {
    return `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  // Handle room selection from floor view with proper action handling
  const handleRoomSelection = (action, room) => {
    console.log(`Room ${action} action:`, room);
    console.log(`[디버깅] 객실 ${action} - 체크인: ${room.check_in_date}, 체크아웃: ${room.check_out_date}`);
    
    // Log more details for selected room
    if (action === 'add' || action === 'edit') {
      console.table({
        "객실명": room.room_name,
        "객실타입": room.room_type,
        "체크인": room.check_in_date,
        "체크아웃": room.check_out_date,
        "박수": room.nights,
        "인원": room.occupancy,
        "기준인원": room.capacity,
        "가격": room.price,
        "총가격": room.total_price
      });
    }
    
    // Pass the action and room to the parent handler
    if (onRoomSelect) {
      onRoomSelect(action, room);
    }
  };

  // Make sure handleEditRoom properly calls handleRoomSelection with 'edit' action
  const handleEditRoom = (room) => {
    console.log('Edit room:', room);
    setCurrentRoom(room);
    setEditMode(true);
    setShowForm(true);
  };

  // Handle setting all room prices to zero
  const handleSetAllRoomPricesZero = () => {
    if (!formData.room_selections || formData.room_selections.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '객실이 없습니다',
        text: '가격을 변경할 객실이 없습니다.'
      });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: '객실 가격 일괄 변경',
      text: `모든 객실의 가격을 0원으로 변경하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        // Update all room prices to zero
        const updatedRooms = formData.room_selections.map(room => ({
          ...room,
          price: 0,
          total_price: 0
        }));

        // Use onRoomSelect with 'setAllZero' action to ensure server saving
        if (onRoomSelect) {
          onRoomSelect('setAllZero', updatedRooms);
        }
        
        Swal.fire({
          icon: 'success',
          title: '가격 변경 완료',
          text: '모든 객실의 가격이 0원으로 변경되었습니다.'
        });
      }
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      {/* Header with title only */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HotelIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">객실 예약</Typography>
      </Box>
    
      {/* FloorRoomSelector with zero price handler */}
      <FloorRoomSelector 
        formData={formData}
        selectedRooms={formData.room_selections}
        onRoomSelect={handleRoomSelection}
        page1Id={formData.page1_id}
        onSetAllRoomPricesZero={handleSetAllRoomPricesZero}
      />
    </Paper>
  );
};

export default RoomSelectionForm; 