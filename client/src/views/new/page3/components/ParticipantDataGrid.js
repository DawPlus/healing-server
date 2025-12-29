import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from '@apollo/client';

// Import icons
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';

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

// Person types
const PERSON_TYPES = {
  PARTICIPANT: '참여자',
  LEADER: '인솔자',
  OTHER: '기타'
};

// Meal types
const MEAL_TYPES = {
  MEAL_COUNT: '식사횟수',
  PARTICIPANT: '참여자인원',
  LEADER: '인솔자인원',
  OTHER: '기타인원'
};

const ParticipantDataGrid = ({ page1Id }) => {
  const theme = useTheme();
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Debug logs
  useEffect(() => {
    console.log('ParticipantDataGrid - page1Id:', page1Id);
  }, [page1Id]);
  
  // Room state for each person type
  const [roomData, setRoomData] = useState({
    [PERSON_TYPES.PARTICIPANT]: { count: 0, rooms: 0 },
    [PERSON_TYPES.LEADER]: { count: 0, rooms: 0 },
    [PERSON_TYPES.OTHER]: { count: 0, rooms: 0 }
  });
  
  // Saved room data (to track changes)
  const [savedRoomData, setSavedRoomData] = useState({
    [PERSON_TYPES.PARTICIPANT]: { count: 0, rooms: 0 },
    [PERSON_TYPES.LEADER]: { count: 0, rooms: 0 },
    [PERSON_TYPES.OTHER]: { count: 0, rooms: 0 }
  });
  
  // Meal state
  const [mealData, setMealData] = useState({
    [MEAL_TYPES.MEAL_COUNT]: 0,
    [MEAL_TYPES.PARTICIPANT]: 0,
    [MEAL_TYPES.LEADER]: 0,
    [MEAL_TYPES.OTHER]: 0
  });
  
  // Saved meal data (to track changes)
  const [savedMealData, setSavedMealData] = useState({
    [MEAL_TYPES.MEAL_COUNT]: 0,
    [MEAL_TYPES.PARTICIPANT]: 0,
    [MEAL_TYPES.LEADER]: 0,
    [MEAL_TYPES.OTHER]: 0
  });
  
  // Query participant data
  const { data: roomsData, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useQuery(GET_PARTICIPANT_ROOMS, {
    variables: { page1Id: parseInt(page1Id) },
    fetchPolicy: 'network-only'
  });
  
  const { data: mealsData, loading: mealsLoading, error: mealsError, refetch: refetchMeals } = useQuery(GET_PARTICIPANT_MEALS, {
    variables: { page1Id: parseInt(page1Id) },
    fetchPolicy: 'network-only'
  });
  
  // Debug GraphQL errors
  useEffect(() => {
    if (roomsError) {
      console.error('ParticipantDataGrid - Error loading room data:', roomsError);
    }
    if (mealsError) {
      console.error('ParticipantDataGrid - Error loading meal data:', mealsError);
    }
  }, [roomsError, mealsError]);
  
  // Debug successful data loading
  useEffect(() => {
    if (roomsData) {
      console.log('ParticipantDataGrid - Room data loaded:', roomsData.getParticipantRooms);
    }
    if (mealsData) {
      console.log('ParticipantDataGrid - Meal data loaded:', mealsData.getParticipantMeals);
    }
  }, [roomsData, mealsData]);
  
  // Mutations for rooms
  const [updateParticipantRoom] = useMutation(UPDATE_PARTICIPANT_ROOM, {
    onCompleted: () => refetchRooms()
  });
  
  const [createParticipantRoom] = useMutation(CREATE_PARTICIPANT_ROOM, {
    onCompleted: () => refetchRooms()
  });
  
  // Mutations for meals
  const [updateParticipantMeal] = useMutation(UPDATE_PARTICIPANT_MEAL, {
    onCompleted: () => refetchMeals()
  });
  
  const [createParticipantMeal] = useMutation(CREATE_PARTICIPANT_MEAL, {
    onCompleted: () => refetchMeals()
  });
  
  // Find existing room data or create new ones
  useEffect(() => {
    if (roomsData?.getParticipantRooms) {
      const rooms = roomsData.getParticipantRooms;
      
      // Check if we have existing data
      if (rooms.length > 0) {
        setHasExistingData(true);
      }
      
      // Initialize with default empty values
      const newRoomData = {
        [PERSON_TYPES.PARTICIPANT]: { count: 0, rooms: 0 },
        [PERSON_TYPES.LEADER]: { count: 0, rooms: 0 },
        [PERSON_TYPES.OTHER]: { count: 0, rooms: 0 }
      };
      
      // Fill with data from server
      rooms.forEach(room => {
        // Regular person count entries
        if (Object.values(PERSON_TYPES).includes(room.room_type)) {
          newRoomData[room.room_type] = { 
            ...newRoomData[room.room_type],
            id: room.id,
            count: room.count
          };
        }
        
        // Room count entries (with _rooms suffix)
        for (const personType of Object.values(PERSON_TYPES)) {
          const roomTypeWithPrefix = `${personType}_rooms`;
          if (room.room_type === roomTypeWithPrefix) {
            newRoomData[personType] = {
              ...newRoomData[personType],
              rooms: room.count
            };
          }
        }
      });
      
      setRoomData(newRoomData);
      setSavedRoomData(JSON.parse(JSON.stringify(newRoomData))); // Deep copy for comparison
      
      // Calculate totals
      let totalPeople = 0;
      let totalRoomCount = 0;
      
      Object.values(newRoomData).forEach(data => {
        totalPeople += data.count || 0;
        totalRoomCount += data.rooms || 0;
      });
      
      setTotalParticipants(totalPeople);
      setTotalRooms(totalRoomCount);
    }
  }, [roomsData]);
  
  // Find existing meal data or create new ones
  useEffect(() => {
    if (mealsData?.getParticipantMeals) {
      const meals = mealsData.getParticipantMeals;
      
      // Check if we have existing data
      if (meals.length > 0) {
        setHasExistingData(true);
      }
      
      // Initialize with default empty values
      const newMealData = {
        [MEAL_TYPES.MEAL_COUNT]: 0,
        [MEAL_TYPES.PARTICIPANT]: 0,
        [MEAL_TYPES.LEADER]: 0,
        [MEAL_TYPES.OTHER]: 0
      };
      
      // Fill with data from server
      meals.forEach(meal => {
        if (Object.values(MEAL_TYPES).includes(meal.meal_type)) {
          newMealData[meal.meal_type] = meal.count;
        }
      });
      
      setMealData(newMealData);
      setSavedMealData(JSON.parse(JSON.stringify(newMealData))); // Deep copy for comparison
    }
  }, [mealsData]);
  
  // Update total calculations when roomData changes
  useEffect(() => {
    let totalPeople = 0;
    let totalRoomCount = 0;
    
    Object.values(roomData).forEach(data => {
      totalPeople += parseInt(data.count) || 0;
      totalRoomCount += parseInt(data.rooms) || 0;
    });
    
    setTotalParticipants(totalPeople);
    setTotalRooms(totalRoomCount);
  }, [roomData]);
  
  // Enable editing
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save room data
      for (const personType of Object.values(PERSON_TYPES)) {
        // Check if count has changed
        if (roomData[personType].count !== savedRoomData[personType].count) {
          await saveRoomData(personType, 'count', roomData[personType].count);
        }
        
        // Check if rooms has changed
        if (roomData[personType].rooms !== savedRoomData[personType].rooms) {
          await saveRoomData(personType, 'rooms', roomData[personType].rooms);
        }
      }
      
      // Save meal data
      for (const mealType of Object.values(MEAL_TYPES)) {
        // Check if count has changed
        if (mealData[mealType] !== savedMealData[mealType]) {
          await saveMealData(mealType, mealData[mealType]);
        }
      }
      
      // Update saved data references
      setSavedRoomData(JSON.parse(JSON.stringify(roomData)));
      setSavedMealData(JSON.parse(JSON.stringify(mealData)));
      
      // Show success message
      setAlert({
        open: true,
        message: '참가자 정보가 저장되었습니다.',
        severity: 'success'
      });
      
      // Disable editing mode
      setIsEditing(false);
      setIsSaving(false);
      
      // Refresh data from server
      refetchRooms();
      refetchMeals();
      
    } catch (error) {
      console.error('Error saving participant data:', error);
      setAlert({
        open: true,
        message: '저장 중 오류가 발생했습니다: ' + error.message,
        severity: 'error'
      });
      setIsSaving(false);
    }
  };
  
  // Fix the saveRoomData function to ensure room information is stored correctly
  const saveRoomData = async (personType, field, value) => {
    // Find if this room type already exists
    const existingRoom = roomsData?.getParticipantRooms?.find(
      room => room.room_type === personType
    );
    
    // For the database, we store room data as a count in the count field
    // For rooms, we'll store the information in the count field with a prefix
    const input = {
      page1_id: parseInt(page1Id),
      room_type: personType,
      count: field === 'count' 
        ? parseInt(value) || 0 
        : roomData[personType].count
    };
    
    if (existingRoom) {
      // Update existing room
      await updateParticipantRoom({
        variables: {
          id: existingRoom.id,
          input
        }
      });
    } else {
      // Create new room
      await createParticipantRoom({
        variables: { input }
      });
    }
    
    // Store room data in a separate entry if field is 'rooms'
    if (field === 'rooms') {
      const roomTypeWithPrefix = `${personType}_rooms`;
      const existingRoomCount = roomsData?.getParticipantRooms?.find(
        room => room.room_type === roomTypeWithPrefix
      );
      
      const roomInput = {
        page1_id: parseInt(page1Id),
        room_type: roomTypeWithPrefix,
        count: parseInt(value) || 0
      };
      
      if (existingRoomCount) {
        await updateParticipantRoom({
          variables: {
            id: existingRoomCount.id,
            input: roomInput
          }
        });
      } else {
        await createParticipantRoom({
          variables: { input: roomInput }
        });
      }
    }
  };
  
  // Save meal data
  const saveMealData = async (mealType, value) => {
    // Find if this meal type already exists
    const existingMeal = mealsData?.getParticipantMeals?.find(
      meal => meal.meal_type === mealType
    );
    
    const input = {
      page1_id: parseInt(page1Id),
      meal_type: mealType,
      count: parseInt(value) || 0
    };
    
    if (existingMeal) {
      // Update existing meal
      await updateParticipantMeal({
        variables: {
          id: existingMeal.id,
          input
        }
      });
    } else {
      // Create new meal
      await createParticipantMeal({
        variables: { input }
      });
    }
  };
  
  // Handle room input changes
  const handleRoomChange = (personType, field, e) => {
    const value = e.target.value;
    
    // Only update state, don't save to server immediately
    setRoomData(prev => ({
      ...prev,
      [personType]: {
        ...prev[personType],
        [field]: parseInt(value) || 0
      }
    }));
  };
  
  // Handle meal input changes
  const handleMealChange = (mealType, e) => {
    const value = e.target.value;
    
    // Only update state, don't save to server immediately
    setMealData(prev => ({
      ...prev,
      [mealType]: parseInt(value) || 0
    }));
  };
  
  // Close alert
  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };
  
  // Check if data has been modified
  const isDataModified = () => {
    // Check room data
    for (const personType of Object.values(PERSON_TYPES)) {
      if (roomData[personType].count !== savedRoomData[personType].count ||
          roomData[personType].rooms !== savedRoomData[personType].rooms) {
        return true;
      }
    }
    
    // Check meal data
    for (const mealType of Object.values(MEAL_TYPES)) {
      if (mealData[mealType] !== savedMealData[mealType]) {
        return true;
      }
    }
    
    return false;
  };
  
  // Loading state
  if (roomsLoading || mealsLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          객실 (총인원 : {totalParticipants}명 / 총객실 : {totalRooms}호)
        </Typography>
        
        {/* Action buttons */}
        {hasExistingData ? (
          isEditing ? (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />} 
              onClick={handleSave}
              disabled={isSaving || !isDataModified()}
            >
              {isSaving ? '저장중...' : '저장'}
            </Button>
          ) : (
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<EditIcon />} 
              onClick={handleEdit}
            >
              수정
            </Button>
          )
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            disabled={isSaving}
          >
            저장
          </Button>
        )}
      </Box>
      <Divider />
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Participant Row */}
        <Grid item xs={2}>
          <Typography>참여자</Typography>
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="인원"
            size="small"
            type="number"
            value={roomData[PERSON_TYPES.PARTICIPANT].count || ''}
            onChange={(e) => handleRoomChange(PERSON_TYPES.PARTICIPANT, 'count', e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="객실"
            size="small"
            type="number"
            value={roomData[PERSON_TYPES.PARTICIPANT].rooms || ''}
            onChange={(e) => handleRoomChange(PERSON_TYPES.PARTICIPANT, 'rooms', e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        {/* Leader Row */}
        <Grid item xs={2}>
          <Typography>인솔자</Typography>
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="인원"
            size="small"
            type="number"
            value={roomData[PERSON_TYPES.LEADER].count || ''}
            onChange={(e) => handleRoomChange(PERSON_TYPES.LEADER, 'count', e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="객실"
            size="small"
            type="number"
            value={roomData[PERSON_TYPES.LEADER].rooms || ''}
            onChange={(e) => handleRoomChange(PERSON_TYPES.LEADER, 'rooms', e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        {/* Other Row */}
        <Grid item xs={2}>
          <Typography>기타</Typography>
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="인원"
            size="small"
            type="number"
            value={roomData[PERSON_TYPES.OTHER].count || ''}
            onChange={(e) => handleRoomChange(PERSON_TYPES.OTHER, 'count', e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField
            fullWidth
            label="객실"
            size="small"
            type="number"
            value={roomData[PERSON_TYPES.OTHER].rooms || ''}
            onChange={(e) => handleRoomChange(PERSON_TYPES.OTHER, 'rooms', e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
      </Grid>
      
      {/* Meals Section */}
      <Box sx={{ mt: 4, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          식사
        </Typography>
      </Box>
      <Divider />
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Meal Count Row */}
        <Grid item xs={2}>
          <Typography>식사횟수</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            fullWidth
            label="식사횟수"
            size="small"
            type="number"
            value={mealData[MEAL_TYPES.MEAL_COUNT] || ''}
            onChange={(e) => handleMealChange(MEAL_TYPES.MEAL_COUNT, e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        {/* Participant Meal Row */}
        <Grid item xs={2}>
          <Typography>참여자인원</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            fullWidth
            label="참여자인원"
            size="small"
            type="number"
            value={mealData[MEAL_TYPES.PARTICIPANT] || ''}
            onChange={(e) => handleMealChange(MEAL_TYPES.PARTICIPANT, e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        {/* Leader Meal Row */}
        <Grid item xs={2}>
          <Typography>인솔자인원</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            fullWidth
            label="인솔자인원"
            size="small"
            type="number"
            value={mealData[MEAL_TYPES.LEADER] || ''}
            onChange={(e) => handleMealChange(MEAL_TYPES.LEADER, e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        {/* Other Meal Row */}
        <Grid item xs={2}>
          <Typography>기타인원</Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            fullWidth
            label="기타인원"
            size="small"
            type="number"
            value={mealData[MEAL_TYPES.OTHER] || ''}
            onChange={(e) => handleMealChange(MEAL_TYPES.OTHER, e)}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
      </Grid>
      
      {/* Alert for messages */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={5000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ParticipantDataGrid; 