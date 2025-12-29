import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { GET_AVAILABLE_ROOMS_BY_DATE, GET_ROOM_MANAGE_BY_DATE_RANGE } from '../graphql/queries';
import Swal from 'sweetalert2';

// Icons
import HotelIcon from '@mui/icons-material/Hotel';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import InfoIcon from '@mui/icons-material/Info';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

/**
 * Floor-based room selection component
 * Displays rooms organized by floor with availability indicators
 */
const FloorRoomSelector = ({ 
  formData, 
  selectedRooms = [], 
  onRoomSelect,
  page1Id,
  onSetAllRoomPricesZero
}) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsByFloor, setRoomsByFloor] = useState({});
  const [currentSelection, setCurrentSelection] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editForm, setEditForm] = useState({
    occupancy: 1,
    notes: ''
  });
  const [totalPriceManuallyEdited, setTotalPriceManuallyEdited] = useState(false);
  
  // Add state for room management data
  const [roomManageRecords, setRoomManageRecords] = useState([]);
  
  // Extract start and end dates from form data
  const startDate = formData.start_date ? moment(formData.start_date).format('YYYY-MM-DD') : undefined;
  const endDate = formData.end_date ? moment(formData.end_date).format('YYYY-MM-DD') : undefined;
  
  // Query for available rooms
  const { loading, error, data, refetch } = useQuery(GET_AVAILABLE_ROOMS_BY_DATE, {
    variables: { 
      startDate, 
      endDate,
      excludePage1Id: page1Id ? parseInt(page1Id) : undefined
    },
    skip: !startDate || !endDate,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('[디버깅] 객실 쿼리 완료 ================');
      console.log(`체크인: ${startDate}, 체크아웃: ${endDate}, Page1ID: ${page1Id}`);
      console.log(`쿼리 결과: ${data?.getAvailableRoomsByDate?.length || 0}개 객실 로드됨`);
      
      // Print the first 3 rooms as samples
      if (data?.getAvailableRoomsByDate?.length > 0) {
        const sampleRooms = data.getAvailableRoomsByDate.slice(0, 3);
        console.log('객실 샘플 데이터:');
        sampleRooms.forEach(room => {
          console.log(`${room.room_name} (${room.room_type}), 예약 개수: ${room.reservations?.length || 0}`);
          if (room.reservations?.length > 0) {
            console.log('  예약 정보:');
            room.reservations.forEach(res => {
              console.log(`  - ${res.group_name}: ${res.check_in_date} ~ ${res.check_out_date}`);
            });
          }
        });
      }
    }
  });
  
  // Add query for room management data
  const { 
    data: roomManageData, 
    loading: loadingRoomManage,
    refetch: refetchRoomManage
  } = useQuery(GET_ROOM_MANAGE_BY_DATE_RANGE, {
    variables: {
      startDate,
      endDate
    },
    skip: !startDate || !endDate,
    fetchPolicy: 'network-only'
  });
  
  // Process room data when it changes
  useEffect(() => {
    if (data && data.getAvailableRoomsByDate) {
      const roomData = data.getAvailableRoomsByDate;
      // Set all available rooms
      setAvailableRooms(roomData);
      
      // Organize rooms by floor based on room_name
      const groupedRooms = {};
      roomData.forEach(room => {
        // Extract floor from room_name (e.g., "101" → floor 1, "412" → floor 4)
        const roomName = room.room_name || '';
        
        // Parse floor from room name using regex to get first digit(s)
        let floor = '0';
        if (roomName) {
          // Match the first digit(s) at the start of the room name
          const floorMatch = roomName.match(/^(\d+)/);
          if (floorMatch && floorMatch[1]) {
            // If the room number is like "101", extract the first digit as floor
            floor = floorMatch[1].charAt(0);
          }
        }
        
        if (!groupedRooms[floor]) {
          groupedRooms[floor] = [];
        }
        groupedRooms[floor].push({
          ...room,
          floor: floor // Add the extracted floor to the room object for reference
        });
      });
      
      // Sort floors in ascending order
      const sortedFloors = Object.keys(groupedRooms).sort((a, b) => parseInt(a) - parseInt(b));
      
      // Create new object with sorted floors
      const sortedGroupedRooms = {};
      sortedFloors.forEach(floor => {
        sortedGroupedRooms[floor] = groupedRooms[floor].sort((a, b) => {
          // Sort by room_name, assuming they are in the format "101", "102", etc.
          return a.room_name.localeCompare(b.room_name, undefined, { numeric: true });
        });
      });
      
      setRoomsByFloor(sortedGroupedRooms);
      
      // Log floor grouping results for debugging
      console.log('[FloorRoomSelector] Rooms grouped by floor:', 
        Object.keys(sortedGroupedRooms).map(floor => ({
          floor,
          roomCount: sortedGroupedRooms[floor].length,
          sampleRooms: sortedGroupedRooms[floor].slice(0, 3).map(r => r.room_name)
        }))
      );
    }
  }, [data]);
  
  // Add effect to process room management data
  useEffect(() => {
    if (roomManageData && roomManageData.getRoomManageByDateRange) {
      setRoomManageRecords(roomManageData.getRoomManageByDateRange);
    }
  }, [roomManageData]);
  
  // Function to check if a room has a RoomManage record
  const getRoomManageInfo = (roomId) => {
    if (!roomManageData || !roomManageData.getRoomManageByDateRange) return null;
    
    return roomManageData.getRoomManageByDateRange.find(
      record => record.room_id === parseInt(roomId)
    );
  };
  
  // Updated isRoomSelected function to check both selectedRooms and roomManageData
  const isRoomSelected = (roomId) => {
    const isInSelectedRooms = selectedRooms.some(room => room.room_id === roomId.toString());
    
    // If the room is already in selectedRooms, it's selected
    if (isInSelectedRooms) return true;
    
    // If the room is in roomManageData but not in selectedRooms and not for this page1_id, 
    // it's occupied by another reservation
    if (roomManageData && roomManageData.getRoomManageByDateRange) {
      const manageRecord = roomManageData.getRoomManageByDateRange.find(
        record => record.room_id === parseInt(roomId) && record.page1_id !== parseInt(page1Id)
      );
      return !!manageRecord;
    }
    
    return false;
  };
  
  // Updated function to determine room status
  const getRoomStatus = (room) => {
    // First check if this room is in the current selection
    const isInCurrentSelection = selectedRooms.some(
      selectedRoom => selectedRoom.room_id === room.id.toString()
    );
    
    if (isInCurrentSelection) {
      return {
        status: 'selected',
        label: '선택됨',
        color: 'primary'
      };
    }
    
    // Check reservations from the available rooms query
    if (room.reservations && room.reservations.length > 0) {
      // 같은 날짜 체크인/체크아웃 허용 로직: 이전 예약의 체크아웃 날짜에 새 예약 체크인 가능
      let isAvailable = true;
      let conflictingReservation = null;
      
      for (const reservation of room.reservations) {
        // 체크아웃 날짜가 선택하려는 체크인 날짜와 같은 경우는 예약 가능
        if (moment(reservation.check_out_date).format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
          continue; // 이 경우는 충돌로 간주하지 않음
        }
        
        // 추가: 선택하려는 체크인 날짜가 기존 예약의 체크아웃 날짜 바로 전날인 경우 (예: 기존 예약 체크아웃이 15일, 새 예약 체크인이 14일)
        if (moment(reservation.check_out_date).subtract(1, 'day').format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
          isAvailable = false;
          conflictingReservation = reservation;
          break;
        }
        
        // 그 외의 중복은 불가능
        if (moment(reservation.check_in_date).isBefore(moment(endDate)) &&
            moment(reservation.check_out_date).isAfter(moment(startDate))) {
          isAvailable = false;
          conflictingReservation = reservation;
          break;
        }
      }
      
      if (!isAvailable) {
        return {
          status: 'occupied',
          label: '예약됨',
          color: 'error',
          details: conflictingReservation
        };
      }
    }
    
    // Check RoomManage records
    if (roomManageData && roomManageData.getRoomManageByDateRange) {
      const manageRecord = roomManageData.getRoomManageByDateRange.find(
        record => record.room_id === parseInt(room.id) && record.page1_id !== parseInt(page1Id)
      );
      
      if (manageRecord) {
        // 체크아웃 날짜가 선택하려는 체크인 날짜와 같은 경우는 예약 가능
        if (moment(manageRecord.check_out_date).format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
          // 가능 상태로 처리
          return {
            status: 'available',
            label: '예약 가능',
            color: 'success',
            message: '이전 예약의 체크아웃 날짜에 체크인 가능'
          };
        } 
        // 추가: 선택하려는 체크인 날짜가 기존 예약의 체크아웃 날짜 바로 전날인 경우 (예: 기존 예약 체크아웃이 15일, 새 예약 체크인이 14일)
        else if (moment(manageRecord.check_out_date).subtract(1, 'day').format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
          return {
            status: manageRecord.status,
            label: manageRecord.status === 'maintenance' ? '유지보수' : '예약됨',
            color: manageRecord.status === 'maintenance' ? 'warning' : 'error',
            details: {
              group_name: manageRecord.organization_name,
              check_in_date: moment(manageRecord.check_in_date).format('YYYY-MM-DD'),
              check_out_date: moment(manageRecord.check_out_date).format('YYYY-MM-DD'),
              page1_id: manageRecord.page1_id
            }
          };
        }
        else if (
          // 그 외의 중복은 불가능
          moment(manageRecord.check_in_date).isBefore(moment(endDate)) &&
          moment(manageRecord.check_out_date).isAfter(moment(startDate))
        ) {
          return {
            status: manageRecord.status,
            label: manageRecord.status === 'maintenance' ? '유지보수' : '예약됨',
            color: manageRecord.status === 'maintenance' ? 'warning' : 'error',
            details: {
              group_name: manageRecord.organization_name,
              check_in_date: moment(manageRecord.check_in_date).format('YYYY-MM-DD'),
              check_out_date: moment(manageRecord.check_out_date).format('YYYY-MM-DD'),
              page1_id: manageRecord.page1_id
            }
          };
        }
      }
    }
    
    // Default is available
    return {
      status: 'available',
      label: '가능',
      color: 'success'
    };
  };
  
  // Add this function after getRoomStatus to log when a room's details are shown
  const logRoomDetails = (room, action) => {
    console.log(`[디버깅] 객실 상세 정보 (${action}) =================`);
    console.log(`객실: ${room.room_name} (${room.room_type || '타입 없음'})`);
    console.log(`위치: ${room.floor ? room.floor + '층' : '위치 정보 없음'}`);
    console.log(`수용 인원: ${room.capacity || 0}명`);
    console.log(`가격: ${room.price?.toLocaleString() || 0}원`);
    
    if (room.reservations && room.reservations.length > 0) {
      console.log('현재 예약 정보:');
      room.reservations.forEach((res, index) => {
        console.log(`${index+1}. ${res.group_name || '단체명 없음'}`);
        console.log(`   체크인: ${res.check_in_date}, 체크아웃: ${res.check_out_date}`);
        console.log(`   예약ID: ${res.page1_id}`);
      });
    } else {
      console.log('예약 정보 없음 (빈 객실)');
    }
    
    // Log room availability status
    const roomStatus = getRoomStatus(room);
    console.log(`객실 상태: ${roomStatus.status} (${roomStatus.label})`);
  };
  
  // Handle room click with detailed logging
  const handleRoomClick = (room) => {
    const roomStatus = getRoomStatus(room);
    console.log('[디버깅] 객실 클릭 =================');
    console.log(`객실: ${room.room_name}, 상태: ${roomStatus.status}`);
    console.log(`선택 기간: ${startDate} ~ ${endDate}`);
    
    // Log detailed room information
    logRoomDetails(room, 'click');
    
    // Check for existing reservations
    if (room.reservations && room.reservations.length > 0) {
      console.log('객실의 기존 예약 정보:');
      room.reservations.forEach(res => {
        console.log(`- ${res.group_name}: ${res.check_in_date} ~ ${res.check_out_date}`);
        // Check for date conflicts or check-in/check-out on same day
        if (moment(res.check_out_date).format('YYYY-MM-DD') === startDate) {
          console.log('  [주의] 기존 예약의 체크아웃 날짜와 새 예약의 체크인 날짜가 같습니다.');
        }
        if (moment(res.check_in_date).format('YYYY-MM-DD') === endDate) {
          console.log('  [주의] 기존 예약의 체크인 날짜와 새 예약의 체크아웃 날짜가 같습니다.');
        }
        // 추가: 체크인 날짜와 다른 예약 체크아웃 날짜 하루 전 체크
        if (moment(res.check_out_date).subtract(1, 'day').format('YYYY-MM-DD') === startDate) {
          console.log('  [경고] 선택한 체크인 날짜가 다른 예약의 체크아웃 전날입니다 - 중복 예약 불가');
        }
      });
    }
    
    // If room is occupied by another reservation or under maintenance, don't allow selection
    if (roomStatus.status === 'occupied' || roomStatus.status === 'maintenance') {
      // 추가로 체크아웃 날짜와 체크인 날짜가 같은 경우 예외처리
      let canSelectDueToCheckoutCheckinMatch = false;
      
      // 예약 정보가 있는지 확인
      if (room.reservations && room.reservations.length > 0) {
        // 모든 예약에 대해 체크아웃=체크인 날짜 일치 여부 확인
        canSelectDueToCheckoutCheckinMatch = room.reservations.every(reservation => {
          // 추가: 체크인 날짜와 다른 예약의 체크아웃 하루 전 검사
          if (moment(reservation.check_out_date).subtract(1, 'day').format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
            console.log('  [거부] 체크인 날짜가 다른 예약의 체크아웃 날짜 전날입니다.');
            return false;
          }
          
          // 체크아웃 날짜가 선택하려는 체크인 날짜와 같거나,
          // 체크인 날짜가 선택하려는 체크아웃 날짜와 같은 경우만 허용
          return moment(reservation.check_out_date).format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD') ||
                 moment(reservation.check_in_date).format('YYYY-MM-DD') === moment(endDate).format('YYYY-MM-DD');
        });
      }
      
      // 모든 예약이 체크아웃=체크인 날짜 일치 조건을 만족하지 않으면 선택 불가
      if (!canSelectDueToCheckoutCheckinMatch) {
        // 추가: 상세 안내 메시지 표시
        Swal.fire({
          icon: 'error',
          title: '예약 불가',
          text: '선택한 날짜에 이미 다른 예약이 있거나, 체크인 날짜가 다른 예약의 체크아웃 전날입니다.'
        });
        return; // 선택 불가
      }
    }
    
    // If the room is already selected, deselect it
    if (roomStatus.status === 'selected') {
      const selectedRoom = selectedRooms.find(
        selectedRoom => selectedRoom.room_id === room.id.toString()
      );
      
      if (selectedRoom && onRoomSelect) {
        onRoomSelect('remove', selectedRoom);
      }
      return;
    }
    
    // Generate a new room selection object
    if (startDate && endDate && onRoomSelect) {
      const nights = moment(endDate).diff(moment(startDate), 'days');
      
      // Set default occupancy based on room capacity for 3인실 and 6인실
      let occupancy = room.capacity; // Default to room capacity
      if (room.capacity === 3) {
        occupancy = 2; // 3인실의 경우 디폴트 인원을 2명으로 설정
      } else if (room.capacity === 6) {
        occupancy = 4; // 6인실의 경우 디폴트 인원을 4명으로 설정
      }
      
      const baseRoomPrice = room.price;
      
      // Calculate total price based on base room price and nights
      // No extra charge for default occupancy (1 person)
      const totalPrice = baseRoomPrice * nights;
      
      const newRoom = {
        id: `room_${Date.now()}`,
        room_id: room.id.toString(),
        room_name: room.room_name,
        room_type: room.room_type,
        check_in_date: startDate,
        check_out_date: endDate,
        occupancy: occupancy,
        price: baseRoomPrice, // Base room price
        total_price: totalPrice,
        capacity: room.capacity,
        nights: nights,
        notes: ''
      };
      
      setCurrentSelection(newRoom);
      onRoomSelect('add', newRoom);
    } else {
      alert('체크인 및 체크아웃 날짜를 먼저 선택해주세요.');
    }
  };
  
  // Render the room details card
  const renderRoomCard = (room) => {
    const roomStatus = getRoomStatus(room);
    const statusColor = roomStatus.color;
    const isDisabled = roomStatus.status === 'occupied' || roomStatus.status === 'maintenance';
    
    // Log room details when rendering (uncomment if you want to log all rooms)
    // logRoomDetails(room, 'card_render');
    
    // Create tooltip content based on room status
    let tooltipContent = '';
    if (roomStatus.status === 'occupied' && roomStatus.details) {
      // Log details when viewing occupied room info
      console.log('[디버깅] 예약된 객실 정보 보기 =================');
      console.log(`객실: ${room.room_name}`);
      console.log(`예약 단체: ${roomStatus.details.organization_name || roomStatus.details.group_name || ''}`);
      console.log(`체크인: ${moment(roomStatus.details.check_in_date).format('YYYY-MM-DD')}`);
      console.log(`체크아웃: ${moment(roomStatus.details.check_out_date).format('YYYY-MM-DD')}`);
      
      tooltipContent = `이미 예약됨\n${roomStatus.details.organization_name || roomStatus.details.group_name || ''}\n${moment(roomStatus.details.check_in_date).format('YYYY-MM-DD')} ~ ${moment(roomStatus.details.check_out_date).format('YYYY-MM-DD')}`;
    } else if (roomStatus.status === 'maintenance') {
      tooltipContent = `유지보수 중\n사유: ${roomStatus.details?.notes || '유지보수'}`;
    }
    
    const roomCard = (
      <Card 
        key={room.id}
        variant="outlined"
        sx={{
          width: '100%',
          borderColor: theme => theme.palette[statusColor].main,
          bgcolor: theme => {
            if (isDisabled) {
              return 'action.disabledBackground'; // Gray background for disabled rooms
            }
            return roomStatus.status === 'selected' 
              ? theme.palette[statusColor].lighter
              : 'background.paper';
          },
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: isDisabled ? undefined : theme => theme.palette[statusColor].dark,
            boxShadow: isDisabled ? 0 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer'
          },
          opacity: isDisabled ? 0.7 : 1
        }}
        onClick={isDisabled ? undefined : () => handleRoomClick(room)}
      >
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" color={isDisabled ? "text.disabled" : "textPrimary"}>
                {room.room_name} ({room.capacity}인실)
              </Typography>
              <Typography variant="caption" color={isDisabled ? "text.disabled" : "textSecondary"}>
                {room.room_type} · {room.price.toLocaleString()}원
              </Typography>
            </Box>
            <Chip 
              label={roomStatus.label} 
              color={statusColor} 
              size="small"
              sx={{ ml: 0.5 }}
            />
          </Box>
        </CardContent>
      </Card>
    );
    
    // Wrap with Tooltip if the room is disabled
    return isDisabled ? (
      <Tooltip 
        title={tooltipContent}
        arrow
        placement="top"
        enterDelay={500}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: statusColor === 'warning' ? 'warning.dark' : 'error.dark',
              '& .MuiTooltip-arrow': {
                color: statusColor === 'warning' ? 'warning.dark' : 'error.dark',
              },
              whiteSpace: 'pre-line'
            }
          }
        }}
      >
        <Box sx={{ width: '100%' }}>{roomCard}</Box>
      </Tooltip>
    ) : roomCard;
  };
  
  // Refresh availability data
  const handleRefresh = () => {
    if (refetch) {
      refetch();
    }
  };
  
  // Add a removeRoom handler
  const handleRemoveRoom = (roomId) => {
    if (onRoomSelect) {
      onRoomSelect('remove', roomId);
    }
  };
  
  // Add handleEditRoom to use inline editing
  const handleEditRoom = (room) => {
    if (onRoomSelect) {
      console.log('[디버깅] 객실 수정 모달 =================');
      console.log(`객실: ${room.room_name} (${room.room_type})`);
      console.log(`체크인: ${room.check_in_date}, 체크아웃: ${room.check_out_date}`);
      console.log(`인원: ${room.occupancy}명, 기준인원: ${room.capacity}명, 박수: ${room.nights}박`);
      console.log(`가격: ${room.price}원, 총 가격: ${room.total_price}원`);
      
      // Set editing state and prefill form
      setEditingRoomId(room.id);
      setEditForm({
        room_id: room.room_id || '',
        room_name: room.room_name || '',
        room_type: room.room_type || '',
        check_in_date: room.check_in_date || startDate,
        check_out_date: room.check_out_date || endDate,
        nights: room.nights || calculateNights(room.check_in_date, room.check_out_date),
        occupancy: room.occupancy || 1,
        price: room.price || 0,
        total_price: room.total_price || 0,
        capacity: room.capacity || 1,
        notes: room.notes || ''
      });
    }
  };
  
  // Add handleCancelEdit function
  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setEditForm({
      occupancy: 1,
      notes: ''
    });
    setTotalPriceManuallyEdited(false);
  };
  
  // Add handleSaveEdit function
  const handleSaveEdit = (room) => {
    if (onRoomSelect) {
      // Validate input
      const newOccupancy = parseInt(editForm.occupancy);
      const checkInDate = moment(editForm.check_in_date);
      const checkOutDate = moment(editForm.check_out_date);
      const groupStartDate = moment(startDate);
      const groupEndDate = moment(endDate);
      
      // Check if occupancy is valid
      if (isNaN(newOccupancy) || newOccupancy < 1) {
        Swal.fire({
          icon: 'error',
          title: '입력 오류',
          text: '투숙 인원은 1명 이상이어야 합니다.'
        });
        return;
      }
      
      // Check if occupancy exceeds capacity
      if (newOccupancy > editForm.capacity) {
        Swal.fire({
          icon: 'warning',
          title: '인원 초과',
          text: `최대 수용 인원 (${editForm.capacity}명)을 초과했습니다. 계속 진행하시겠습니까?`,
          showCancelButton: true,
          confirmButtonText: '계속',
          cancelButtonText: '취소'
        }).then((result) => {
          if (!result.isConfirmed) {
            return;
          } else {
            // Continue with save if user confirms
            completeRoomSave(room);
          }
        });
        return;
      }
      
      // Check if dates are within group reservation period
      if (checkInDate.isBefore(groupStartDate) || checkOutDate.isAfter(groupEndDate)) {
        Swal.fire({
          icon: 'error',
          title: '날짜 오류',
          text: `체크인/체크아웃 날짜는 단체 예약 기간(${startDate} ~ ${endDate}) 내에 있어야 합니다.`
        });
        return;
      }
      
      // Check if check-out is after check-in
      if (checkOutDate.isSameOrBefore(checkInDate)) {
        Swal.fire({
          icon: 'error',
          title: '날짜 오류',
          text: '체크아웃 날짜는 체크인 날짜 이후여야 합니다.'
        });
        return;
      }
      
      // 추가: 선택한 객실의 다른 예약과 체크인/체크아웃 날짜 충돌 체크
      const selectedRoomData = availableRooms.find(r => r.id.toString() === editForm.room_id);
      if (selectedRoomData && selectedRoomData.reservations && selectedRoomData.reservations.length > 0) {
        // 현재 수정 중인 객실의 ID는 제외 (자기 자신과 비교하지 않기 위함)
        const otherReservations = selectedRoomData.reservations.filter(res => 
          res.page1_id !== parseInt(page1Id) || 
          (room.id && res.id !== room.id)
        );
        
        for (const reservation of otherReservations) {
          // 체크아웃 날짜가 선택하려는 체크인 날짜와 같은 경우는 허용
          if (moment(reservation.check_out_date).format('YYYY-MM-DD') === moment(editForm.check_in_date).format('YYYY-MM-DD')) {
            continue;
          }
          
          // 선택하려는 체크인 날짜가 기존 예약의 체크아웃 날짜 바로 전날인 경우 체크 (예: 기존 예약 체크아웃이 15일, 새 예약 체크인이 14일)
          if (moment(reservation.check_out_date).subtract(1, 'day').format('YYYY-MM-DD') === 
              moment(editForm.check_in_date).format('YYYY-MM-DD')) {
            Swal.fire({
              icon: 'error',
              title: '날짜 중복',
              text: `선택한 체크인 날짜(${moment(editForm.check_in_date).format('YYYY-MM-DD')})가 다른 예약의 체크아웃 전날(${moment(reservation.check_out_date).format('YYYY-MM-DD')})과 중복됩니다.`
            });
            return;
          }
          
          // 일반적인 날짜 겹침 확인
          if (moment(reservation.check_in_date).isBefore(moment(editForm.check_out_date)) &&
              moment(reservation.check_out_date).isAfter(moment(editForm.check_in_date))) {
            Swal.fire({
              icon: 'error',
              title: '날짜 중복',
              text: `선택한 날짜가 다른 예약 (${reservation.group_name || '다른 단체'}: ${moment(reservation.check_in_date).format('YYYY-MM-DD')} ~ ${moment(reservation.check_out_date).format('YYYY-MM-DD')})과 중복됩니다.`
            });
            return;
          }
        }
      }
      
      // Log the edit details before saving
      console.log('[디버깅] 객실 수정 저장 =================');
      console.log(`객실: ${editForm.room_name} (${editForm.room_type})`);
      console.log(`체크인: ${editForm.check_in_date}, 체크아웃: ${editForm.check_out_date}`);
      console.log(`인원: ${editForm.occupancy}명, 기준인원: ${editForm.capacity}명, 박수: ${editForm.nights}박`);
      console.log(`가격: ${editForm.price}원, 총 가격: ${editForm.total_price}원`);
      
      // If all validations pass, complete the save
      completeRoomSave(room);
    }
  };
  
  // Handle form changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If user directly edits the total_price, mark it as manually edited
    if (field === 'total_price') {
      setTotalPriceManuallyEdited(true);
    }
    
    // If changing check-in or check-out dates, recalculate nights
    if (field === 'check_in_date' || field === 'check_out_date') {
      const checkInDate = field === 'check_in_date' ? value : editForm.check_in_date;
      const checkOutDate = field === 'check_out_date' ? value : editForm.check_out_date;
      
      if (checkInDate && checkOutDate) {
        const nights = calculateNights(checkInDate, checkOutDate);
        setEditForm(prev => ({
          ...prev,
          nights: nights
        }));
        
        // Recalculate total price if it hasn't been manually edited
        if (!totalPriceManuallyEdited) {
          const basePrice = editForm.price;
          const capacity = editForm.capacity;
          const occupancy = parseInt(editForm.occupancy) || 1;
          
          // Base room price calculation
          let totalPrice = basePrice * nights;
          
          // Add extra charge for people exceeding room capacity
          if (occupancy > capacity) {
            const extraPeople = occupancy - capacity;
            const extraCharge = extraPeople * 10000 * nights; // 10,000 won per extra person per night
            totalPrice += extraCharge;
          }
          
          setEditForm(prev => ({
            ...prev,
            total_price: totalPrice
          }));
        }
      }
    }
    
    // If changing occupancy, recalculate the total price if not manually edited
    if (field === 'occupancy' && !totalPriceManuallyEdited) {
      const occupancy = parseInt(value) || 1;
      const capacity = editForm.capacity;
      const basePrice = editForm.price;
      const nights = editForm.nights || 1;
      
      // Base room price calculation
      let totalPrice = basePrice * nights;
      
      // Add extra charge for people exceeding room capacity
      if (occupancy > capacity) {
        const extraPeople = occupancy - capacity;
        const extraCharge = extraPeople * 10000 * nights; // 10,000 won per extra person per night
        totalPrice += extraCharge;
      }
      
      setEditForm(prev => ({
        ...prev,
        total_price: totalPrice
      }));
    }
    
    // If changing room_id, update other room details
    if (field === 'room_id') {
      const selectedRoom = availableRooms.find(room => room.id.toString() === value);
      if (selectedRoom) {
        const nights = editForm.nights || 1;
        const newOccupancy = editForm.occupancy || 1;
        const newCapacity = selectedRoom.capacity;
        
        // Calculate new total price with the base room price and any extra charges
        let newTotalPrice = selectedRoom.price * nights;
        
        // Add extra charge for people exceeding room capacity
        if (newOccupancy > newCapacity) {
          const extraPeople = newOccupancy - newCapacity;
          const extraCharge = extraPeople * 10000 * nights; // 10,000 won per extra person per night
          newTotalPrice += extraCharge;
        }
        
        setEditForm(prev => {
          const updatedForm = {
            ...prev,
            room_name: selectedRoom.room_name,
            room_type: selectedRoom.room_type,
            price: selectedRoom.price,
            capacity: selectedRoom.capacity,
          };
          
          // Only auto-recalculate total_price if not manually edited
          if (!totalPriceManuallyEdited) {
            updatedForm.total_price = newTotalPrice;
          }
          
          return updatedForm;
        });
      }
    }
  };
  
  // Update the handleRoomSelection function to handle 'edit' action
  const handleRoomSelection = (action, room) => {
    if (action === 'add') {
      onRoomSelect('add', room);
    } else if (action === 'edit') {
      onRoomSelect('edit', room);
    } else if (action === 'remove') {
      onRoomSelect('remove', room);
    }
  };
  
  // Calculate number of nights between dates
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    return moment(checkOut).diff(moment(checkIn), 'days');
  };
  
  // Helper function to complete room save after validation
  const completeRoomSave = (room) => {
    // Calculate new total price based on room price, nights and occupancy
    const newNights = calculateNights(editForm.check_in_date, editForm.check_out_date);
    
    // Find the selected room from available rooms
    const selectedRoomDetails = availableRooms.find(r => r.id.toString() === editForm.room_id);
    const baseRoomPrice = selectedRoomDetails?.price || editForm.price;
    const roomCapacity = selectedRoomDetails?.capacity || editForm.capacity;
    const occupancy = parseInt(editForm.occupancy) || 1;
    
    // Calculate total room price:
    // 1. Base price for the room multiplied by nights
    // 2. Additional charge of 10,000 won per person when exceeding room capacity
    let calculatedPrice = baseRoomPrice * newNights;
    
    // Add extra charge for people exceeding room capacity (10,000 won per extra person per night)
    if (occupancy > roomCapacity) {
      const extraPeople = occupancy - roomCapacity;
      const extraCharge = extraPeople * 10000 * newNights; // 10,000 won per extra person per night
      calculatedPrice += extraCharge;
    }
    
    // Use manually entered value if available, otherwise use calculated price
    const totalPrice = totalPriceManuallyEdited ? editForm.total_price : calculatedPrice;
    
    // Create updated room object
    const updatedRoom = {
      ...room,
      room_id: editForm.room_id,
      room_name: selectedRoomDetails?.room_name || editForm.room_name,
      room_type: selectedRoomDetails?.room_type || editForm.room_type,
      check_in_date: editForm.check_in_date,
      check_out_date: editForm.check_out_date,
      nights: newNights,
      occupancy: occupancy,
      price: baseRoomPrice,
      capacity: roomCapacity,
      notes: editForm.notes,
      total_price: totalPrice
    };
    
    console.log('Saving updated room:', updatedRoom);
    
    // Pass the updated room with 'edit' action
    onRoomSelect('edit', updatedRoom);
    
    // Reset editing state
    setEditingRoomId(null);
    setEditForm({
      room_id: '',
      room_name: '',
      room_type: '',
      check_in_date: '',
      check_out_date: '',
      nights: 1,
      occupancy: 1,
      price: 0,
      capacity: 1,
      notes: '',
      total_price: 0
    });
    setTotalPriceManuallyEdited(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        객실 정보를 불러오는 중 오류가 발생했습니다: {error.message}
      </Alert>
    );
  }
  
  if (!startDate || !endDate) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        객실 목록을 불러오려면 예약 시작일과 종료일을 먼저 입력해주세요.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          <HotelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          객실 선택 - {startDate} ~ {endDate}
        </Typography>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<EventIcon />}
          onClick={handleRefresh}
        >
          예약 현황 새로고침
        </Button>
      </Box>
      
      {Object.keys(roomsByFloor).length === 0 ? (
        <Alert severity="warning">
          가능한 객실이 없습니다. 날짜를 변경하거나 관리자에게 문의하세요.
        </Alert>
      ) : (
        Object.entries(roomsByFloor)
          .filter(([floor, rooms]) => rooms && rooms.length > 0) // Skip empty floors
          .map(([floor, rooms]) => (
          <Paper key={floor} sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              {floor === '0' ? '기타 객실' : `${floor}층 객실`} ({rooms.length}개)
            </Typography>
            <Grid container spacing={2}>
              {rooms.map(room => {
                const roomStatus = getRoomStatus(room);
                const isSelected = isRoomSelected(room.id);
                const isAvailable = roomStatus.status === 'available';
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                    {renderRoomCard(room)}
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        ))
      )}
      
      {selectedRooms.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              선택된 객실 목록
            </Typography>
            {onSetAllRoomPricesZero && (
              <Button
                variant="contained"
                onClick={onSetAllRoomPricesZero}
                size="small"
                disabled={!selectedRooms || selectedRooms.length === 0}
                sx={{
                  backgroundColor: '#000',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
                  }
                }}
              >
                전체 0원 적용
              </Button>
            )}
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>객실명</TableCell>
                  <TableCell>객실타입</TableCell>
                  <TableCell>체크인</TableCell>
                  <TableCell>체크아웃</TableCell>
                  <TableCell align="right">박 수</TableCell>
                  <TableCell align="right">인원</TableCell>
                  <TableCell align="right">가격</TableCell>
                  <TableCell align="right">합계</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedRooms.map((room) => (
                  <React.Fragment key={room.id || room.room_id}>
                    <TableRow>
                      {/* Conditionally render editable fields or display values */}
                      {editingRoomId === room.id ? (
                        <>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={editForm.room_id}
                              onChange={(e) => handleEditFormChange('room_id', e.target.value)}
                              sx={{ width: '150px' }}
                              SelectProps={{
                                native: true,
                              }}
                            >
                              <option value={room.room_id}>
                                {editForm.room_name} (현재)
                              </option>
                              {availableRooms
                                .filter(r => {
                                  // Filter out rooms that are already selected by other entries
                                  const isAlreadySelected = selectedRooms.some(
                                    selectedRoom => 
                                      selectedRoom.room_id === r.id.toString() && 
                                      selectedRoom.id !== room.id
                                  );
                                  
                                  // 기존 선택 객실과 중복되는지 먼저 확인
                                  if (isAlreadySelected) return false;
                                  
                                  // 새로운 로직: 체크아웃 날짜가 체크인 날짜와 같은 객실은 선택 가능하도록 함
                                  // 이미 예약된 객실이라도 체크아웃 날짜가 현재 체크인 날짜와 같다면 허용
                                  if (r.reservations && r.reservations.length > 0) {
                                    // 각 예약에 대해 검사
                                    for (const reservation of r.reservations) {
                                      // 체크아웃 날짜가 현재 선택하려는 체크인 날짜와 같은 경우는 예약 가능
                                      if (moment(reservation.check_out_date).format('YYYY-MM-DD') === 
                                          moment(editForm.check_in_date).format('YYYY-MM-DD')) {
                                        continue;
                                      }
                                      
                                      // 추가: 선택하려는 체크인 날짜가 기존 예약의 체크아웃 날짜 바로 전날인 경우 (예: 기존 예약 체크아웃이 15일, 새 예약 체크인이 14일)
                                      if (moment(reservation.check_out_date).subtract(1, 'day').format('YYYY-MM-DD') === 
                                          moment(editForm.check_in_date).format('YYYY-MM-DD')) {
                                        return false;
                                      }
                                      
                                      // 다른 중복 상황은 예약 불가
                                      if (moment(reservation.check_in_date).isBefore(moment(editForm.check_out_date)) &&
                                          moment(reservation.check_out_date).isAfter(moment(editForm.check_in_date))) {
                                        return false;
                                      }
                                    }
                                  }
                                  
                                  // 위 조건을 통과했으면 선택 가능한 객실
                                  return true;
                                })
                                .map((r) => (
                                  <option key={r.id} value={r.id.toString()}>
                                    {r.room_name} ({r.room_type}, {r.capacity}인)
                                  </option>
                                ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            {editForm.room_type}
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              value={moment(editForm.check_in_date).format('YYYY-MM-DD')}
                              onChange={(e) => handleEditFormChange('check_in_date', e.target.value)}
                              sx={{ width: '140px' }}
                              inputProps={{ 
                                min: moment(startDate).format('YYYY-MM-DD'),
                                max: moment(endDate).format('YYYY-MM-DD')
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              value={moment(editForm.check_out_date).format('YYYY-MM-DD')}
                              onChange={(e) => handleEditFormChange('check_out_date', e.target.value)}
                              sx={{ width: '140px' }}
                              inputProps={{ 
                                min: moment(editForm.check_in_date).add(1, 'days').format('YYYY-MM-DD'),
                                max: moment(endDate).format('YYYY-MM-DD')
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {editForm.nights}박
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={editForm.occupancy}
                              onChange={(e) => handleEditFormChange('occupancy', e.target.value)}
                              inputProps={{ 
                                min: 1, 
                                max: editForm.capacity * 2, // Allow some flexibility for extra beds
                                style: { textAlign: 'right' } 
                              }}
                              sx={{ width: '60px' }}
                            />
                            <Typography variant="caption" color="text.secondary" display="block">
                              (최대: {editForm.capacity}명)
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {parseInt(editForm.occupancy) > parseInt(editForm.capacity) ? 
                                `초과 인원: ${parseInt(editForm.occupancy) - parseInt(editForm.capacity)}명 (1인당 10,000원/박)` : 
                                '기준 인원 내'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {Number(editForm.price).toLocaleString()}원
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={editForm.total_price !== undefined && editForm.total_price !== null ? editForm.total_price : (editForm.price * editForm.nights)}
                              onChange={(e) => handleEditFormChange('total_price', e.target.value !== "" ? parseInt(e.target.value) : 0)}
                              inputProps={{ 
                                min: 0,
                                step: 1000,
                                style: { textAlign: 'right' } 
                              }}
                              sx={{ width: '100px' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleSaveEdit(room)}
                                sx={{ mr: 1 }}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={handleCancelEdit}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{room.room_name}</TableCell>
                          <TableCell>{room.room_type}</TableCell>
                          <TableCell>{moment(room.check_in_date).format('YYYY-MM-DD')}</TableCell>
                          <TableCell>{moment(room.check_out_date).format('YYYY-MM-DD')}</TableCell>
                          <TableCell align="right">{room.nights}</TableCell>
                          <TableCell align="right">{room.occupancy}명</TableCell>
                          <TableCell align="right">{Number(room.price).toLocaleString()}원</TableCell>
                          <TableCell align="right">{Number(room.total_price).toLocaleString()}원</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleEditRoom(room)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRemoveRoom(room.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                    {/* Notes row - only shown when this room is being edited */}
                    {editingRoomId === room.id && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" gutterBottom>비고:</Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="비고 사항을 입력하세요"
                              value={editForm.notes}
                              onChange={(e) => handleEditFormChange('notes', e.target.value)}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* 예약 필터링 알림 추가 */}
      {data?.getAvailableRoomsByDate?.some(room => room.reservations && room.reservations.length > 0) && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">
            <b>예약 알림:</b> 일부 객실은 선택한 날짜에 다른 단체가 이미 예약했습니다. 회색으로 표시된 객실은 예약할 수 없습니다.
            <Button 
              size="small" 
              color="primary" 
              variant="text" 
              onClick={handleRefresh}
              sx={{ ml: 1 }}
            >
              예약 현황 새로고침
            </Button>
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FloorRoomSelector; 