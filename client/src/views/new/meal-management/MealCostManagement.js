import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { useQuery, useMutation, gql } from '@apollo/client';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';

// GraphQL queries
const GET_MEAL_OPTIONS = gql`
  query GetMealOptions {
    getMealOptions {
      id
      meal_type
      meal_option
      price_per_person
      ingredient_cost
      description
      is_active
    }
  }
`;

// GraphQL mutations
const UPDATE_MEAL_OPTION = gql`
  mutation UpdateMealOption($id: ID!, $input: MealOptionInput!) {
    updateMealOption(id: $id, input: $input) {
      id
      meal_type
      meal_option
      price_per_person
      ingredient_cost
      description
      is_active
    }
  }
`;

const CREATE_MEAL_OPTION = gql`
  mutation CreateMealOption($input: MealOptionInput!) {
    createMealOption(input: $input) {
      id
      meal_type
      meal_option
      price_per_person
      ingredient_cost
      description
      is_active
    }
  }
`;

const DELETE_MEAL_OPTION = gql`
  mutation DeleteMealOption($id: ID!) {
    deleteMealOption(id: $id)
  }
`;

const mealTypes = [
  { value: 'breakfast', label: '조식', icon: <BreakfastDiningIcon />, price: 8800, ingredient: 6000 },
  { value: 'lunch', label: '중식(일반)', icon: <LunchDiningIcon />, price: 12000, ingredient: 6000 },
  { value: 'lunch_box', label: '중식(도시락)', icon: <LunchDiningIcon />, price: 15000, ingredient: 10000 },
  { value: 'dinner', label: '석식(일반)', icon: <DinnerDiningIcon />, price: 12000, ingredient: 6000 },
  { value: 'dinner_special_a', label: '석식(특식A)', icon: <DinnerDiningIcon />, price: 20000, ingredient: 10000 },
  { value: 'dinner_special_b', label: '석식(특식B)', icon: <DinnerDiningIcon />, price: 25000, ingredient: 13000 }
];

const MealCostManagement = () => {
  const [mealOptions, setMealOptions] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMealOption, setEditMealOption] = useState({
    id: '',
    meal_type: 'breakfast',
    meal_option: '',
    price_per_person: 8800,
    ingredient_cost: 6000,
    description: '',
    is_active: true
  });
  const [newMealOption, setNewMealOption] = useState({
    meal_type: 'breakfast',
    meal_option: '',
    price_per_person: 8800,
    ingredient_cost: 6000,
    description: '',
    is_active: true
  });
  
  // GraphQL queries
  const { loading, error, data, refetch } = useQuery(GET_MEAL_OPTIONS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getMealOptions) {
        console.log('콘솔로그 - 전체 식사 옵션 데이터:', data.getMealOptions);
        setMealOptions(data.getMealOptions);
      }
    }
  });
  
  // GraphQL mutations
  const [updateMealOption, { loading: updateLoading }] = useMutation(UPDATE_MEAL_OPTION, {
    onCompleted: (data) => {
      showAlert('식사 옵션이 성공적으로 업데이트되었습니다.', 'success');
      
      // 업데이트된 항목의 ID 찾기
      const updatedOption = data.updateMealOption;
      
      // 지역 상태 직접 업데이트로 리로드 없이 바로 변경사항 반영
      setMealOptions(prevOptions => 
        prevOptions.map(option => 
          option.id === updatedOption.id ? updatedOption : option
        )
      );
      
      // 편집 모드 종료
      setEditDialogOpen(false);
    },
    onError: (error) => {
      showAlert(`식사 옵션 업데이트 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });
  
  const [createMealOption, { loading: createLoading }] = useMutation(CREATE_MEAL_OPTION, {
    onCompleted: (data) => {
      console.log('콘솔로그 - 새 식사 옵션 생성 완료:', data.createMealOption);
      showAlert('새 식사 옵션이 성공적으로 생성되었습니다.', 'success');
      
      // 새로운 항목을 지역 상태에 직접 추가하여 새로고침 없이 바로 반영
      const newMealOption = data.createMealOption;
      setMealOptions(prevOptions => {
        const updatedOptions = [...prevOptions, newMealOption];
        console.log('콘솔로그 - 생성 후 업데이트된 mealOptions:', updatedOptions);
        return updatedOptions;
      });
      
      setCreateDialogOpen(false);
      resetNewMealOptionForm();
    },
    onError: (error) => {
      console.error('콘솔로그 - 식사 옵션 생성 오류:', error);
      showAlert(`식사 옵션 생성 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [deleteMealOption, { loading: deleteLoading }] = useMutation(DELETE_MEAL_OPTION, {
    onCompleted: (data, { variables }) => {
      showAlert('식사 옵션이 성공적으로 삭제되었습니다.', 'success');
      
      // 삭제된 항목을 지역 상태에서 제거하여 새로고침 없이 바로 반영
      const deletedId = variables.id;
      setMealOptions(prevOptions => 
        prevOptions.filter(option => option.id !== deletedId)
      );
    },
    onError: (error) => {
      showAlert(`식사 옵션 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });
  
  // Alert handling
  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  // Reset form
  const resetNewMealOptionForm = () => {
    setNewMealOption({
      meal_type: 'breakfast',
      meal_option: '',
      price_per_person: 8800,
      ingredient_cost: 6000,
      description: '',
      is_active: true
    });
  };
  
  // Handle new meal option form change
  const handleNewMealOptionChange = (field, value) => {
    if (field === 'meal_type') {
      // 선택된 타입에 따라 가격과 재료비 자동 업데이트
      const selectedType = mealTypes.find(type => type.value === value);
      if (selectedType) {
        setNewMealOption({
          ...newMealOption,
          meal_type: value,
          price_per_person: selectedType.price,
          ingredient_cost: selectedType.ingredient
        });
      } else {
        setNewMealOption({
          ...newMealOption,
          [field]: value
        });
      }
    } else {
      setNewMealOption({
        ...newMealOption,
        [field]: value
      });
    }
  };
  
  // Handle create meal option
  const handleCreateMealOption = () => {
    setCreateDialogOpen(true);
  };
  
  // Handle create meal option submit
  const handleCreateMealOptionSubmit = () => {
    // Validate form
    if (!newMealOption.meal_option) {
      showAlert('식사 옵션 이름을 입력하세요.', 'error');
      return;
    }
    
    const price = parseFloat(newMealOption.price_per_person);
    if (isNaN(price) || price < 0) {
      showAlert('유효한 판매가를 입력하세요.', 'error');
      return;
    }
    
    const ingredientCost = parseFloat(newMealOption.ingredient_cost);
    if (isNaN(ingredientCost) || ingredientCost < 0) {
      showAlert('유효한 재료비를 입력하세요.', 'error');
      return;
    }
    
    // 선택된 식사 타입 찾기
    const selectedType = mealTypes.find(type => type.value === newMealOption.meal_type);
    if (!selectedType) {
      showAlert('유효한 식사 타입을 선택하세요.', 'error');
      return;
    }
    
    // 식사 타입에 따라 실제 DB에 저장될 meal_type 결정
    // breakfast, lunch, dinner 중 하나로 매핑해야 함
    let dbMealType;
    let optionName = newMealOption.meal_option;
    
    switch (selectedType.value) {
      case 'breakfast':
        dbMealType = 'breakfast';
        break;
      case 'lunch':
      case 'lunch_box':
        dbMealType = 'lunch';
        // 도시락인 경우 접두어 추가
        if (selectedType.value === 'lunch_box' && !optionName.includes('도시락')) {
          optionName = `도시락 ${optionName}`;
        }
        break;
      case 'dinner':
      case 'dinner_special_a':
      case 'dinner_special_b':
        dbMealType = 'dinner';
        // 특식 접두어 추가
        if (selectedType.value === 'dinner_special_a' && !optionName.includes('특식A')) {
          optionName = `특식A ${optionName}`;
        } else if (selectedType.value === 'dinner_special_b' && !optionName.includes('특식B')) {
          optionName = `특식B ${optionName}`;
        }
        break;
      default:
        dbMealType = 'breakfast';
    }
    
    createMealOption({
      variables: {
        input: {
          meal_type: dbMealType,
          meal_option: optionName,
          price_per_person: price,
          ingredient_cost: ingredientCost,
          description: newMealOption.description,
          is_active: true
        }
      }
    });
  };
  
  // Handle delete meal option
  const handleDeleteMealOption = (id) => {
    Swal.fire({
      title: '정말로 삭제하시겠습니까?',
      text: "이 작업은 되돌릴 수 없습니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMealOption({
          variables: { id }
        });
      }
    });
  };
  
  // Handle edit meal option
  const handleEditMealOption = (option) => {
    setEditMealOption({
      id: option.id,
      meal_type: option.meal_type,
      meal_option: option.meal_option,
      price_per_person: option.price_per_person,
      ingredient_cost: option.ingredient_cost,
      description: option.description,
      is_active: option.is_active
    });
    setEditDialogOpen(true);
  };

  // Handle edit meal option submit
  const handleEditMealOptionSubmit = () => {
    // Validate form
    if (!editMealOption.meal_option) {
      showAlert('식사 옵션 이름을 입력하세요.', 'error');
      return;
    }
    
    const price = parseFloat(editMealOption.price_per_person);
    if (isNaN(price) || price < 0) {
      showAlert('유효한 판매가를 입력하세요.', 'error');
      return;
    }
    
    const ingredientCost = parseFloat(editMealOption.ingredient_cost);
    if (isNaN(ingredientCost) || ingredientCost < 0) {
      showAlert('유효한 재료비를 입력하세요.', 'error');
      return;
    }
    
    updateMealOption({
      variables: {
        id: editMealOption.id,
        input: {
          meal_type: editMealOption.meal_type,
          meal_option: editMealOption.meal_option.trim(),
          price_per_person: price,
          ingredient_cost: ingredientCost,
          description: editMealOption.description,
          is_active: editMealOption.is_active
        }
      }
    });
  };

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditMealOption({
      id: '',
      meal_type: 'breakfast',
      meal_option: '',
      price_per_person: 8800,
      ingredient_cost: 6000,
      description: '',
      is_active: true
    });
  };
  
  // Get meal type icon
  const getMealTypeIcon = (type) => {
    const meal = mealTypes.find(m => m.value === type);
    return meal ? meal.icon : <RestaurantIcon />;
  };
  
  // Get meal type label
  const getMealTypeLabel = (type, option) => {
    const meal = mealTypes.find(m => m.value === type);
    return meal ? meal.label : type;
  };
  
  // Group meal options by type
  const groupedOptions = {};
  
  // Initialize empty arrays for all meal types
  mealTypes.forEach(mealType => {
    groupedOptions[mealType.value] = [];
  });
  
  // 커스텀 타입들을 위한 추가 그룹들
  const customTypes = new Set();
  
  console.log('콘솔로그 - 현재 mealOptions 상태:', mealOptions);
  console.log('콘솔로그 - 기본 mealTypes:', mealTypes);
  
  // Populate with actual options
  mealOptions.forEach(option => {
    console.log('콘솔로그 - 처리 중인 옵션:', option);
    
    let key;
    
    // 식사 타입 매핑
    switch (true) {
      case option.meal_type === 'breakfast':
        key = 'breakfast';
        break;
      case option.meal_type === 'lunch' && option.meal_option.includes('도시락'):
        key = 'lunch_box';
        break;
      case option.meal_type === 'lunch':
        key = 'lunch';
        break;
      case option.meal_type === 'dinner' && option.meal_option.includes('특식A'):
        key = 'dinner_special_a';
        break;
      case option.meal_type === 'dinner' && option.meal_option.includes('특식B'):
        key = 'dinner_special_b';
        break;
      case option.meal_type === 'dinner':
        key = 'dinner';
        break;
      default:
        // 알 수 없는 타입이면 원래 meal_type 사용 (커스텀 타입)
        key = option.meal_type;
        customTypes.add(option.meal_type);
        console.log('콘솔로그 - 커스텀 타입 발견:', option.meal_type, '옵션:', option.meal_option);
    }
    
    console.log('콘솔로그 - 매핑된 키:', key, '원본 meal_type:', option.meal_type, '옵션명:', option.meal_option);
    
    if (!groupedOptions[key]) {
      groupedOptions[key] = [];
    }
    groupedOptions[key].push(option);
  });
  
  console.log('콘솔로그 - 그룹화된 옵션들:', groupedOptions);
  console.log('콘솔로그 - 발견된 커스텀 타입들:', Array.from(customTypes));
  
  // 모든 타입들 (기본 + 커스텀) - 중복 제거
  const existingTypes = new Set(mealTypes.map(type => type.value));
  const uniqueCustomTypes = Array.from(customTypes).filter(customType => !existingTypes.has(customType));
  
  const allTypes = [
    ...mealTypes,
    ...uniqueCustomTypes.map(customType => ({
      value: customType,
      label: customType,
      icon: <RestaurantIcon />
    }))
  ];
  
  console.log('콘솔로그 - 중복 제거된 최종 모든 타입들 (allTypes):', allTypes);
  console.log('콘솔로그 - 기존 타입들:', Array.from(existingTypes));
  console.log('콘솔로그 - 고유한 커스텀 타입들:', uniqueCustomTypes);
  
  // 각 카테고리별 옵션 개수 출력
  allTypes.forEach(type => {
    const optionsCount = groupedOptions[type.value]?.length || 0;
    console.log(`콘솔로그 - ${type.label} 카테고리 옵션 개수:`, optionsCount, '옵션들:', groupedOptions[type.value]);
  });
  
  // Handle edit meal option form change
  const handleEditMealOptionChange = (field, value) => {
    if (field === 'meal_type') {
      // 선택된 타입에 따라 가격과 재료비 자동 업데이트 (기존 값 유지하거나 기본값 사용)
      const selectedType = mealTypes.find(type => type.value === value);
      if (selectedType) {
        setEditMealOption({
          ...editMealOption,
          meal_type: value,
          // 기존 값이 기본값과 다르면 유지, 같으면 새 기본값 적용
          price_per_person: editMealOption.price_per_person === selectedType.price ? selectedType.price : editMealOption.price_per_person,
          ingredient_cost: editMealOption.ingredient_cost === selectedType.ingredient ? selectedType.ingredient : editMealOption.ingredient_cost
        });
      } else {
        setEditMealOption({
          ...editMealOption,
          [field]: value
        });
      }
    } else {
      setEditMealOption({
        ...editMealOption,
        [field]: value
      });
    }
  };
  
  // Handle close create dialog
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    resetNewMealOptionForm();
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          식사 비용 관리
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
    
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateMealOption}
          sx={{ mb: 2 }}
        >
          새 식사 옵션 추가
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Alert severity="error">
              데이터를 불러오는 중 오류가 발생했습니다: {error.message}
            </Alert>
          </Grid>
        ) : (
          // Display all meal types, even if they don't have options
          allTypes.map((mealType, index) => {
            const type = mealType.optionType || mealType.value;
            const options = groupedOptions[type] || [];
            
            return (
              <Grid item xs={12} md={6} lg={3} key={`${type}-${index}`}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={getMealTypeIcon(mealType.value)}
                    title={mealType.label}
                    sx={{ backgroundColor: 'primary.light', color: 'white' }}
                  />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>옵션명</TableCell>
                            <TableCell align="right">판매가 (인당)</TableCell>
                            <TableCell align="right">재료비 (인당)</TableCell>
                            <TableCell align="right">액션</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {options.length > 0 ? (
                            options.map((option) => (
                              <TableRow key={option.id}>
                                <TableCell>{option.meal_option}</TableCell>
                                <TableCell align="right">
                                  {`${option.price_per_person.toLocaleString()}원`}
                                </TableCell>
                                <TableCell align="right">
                                  {`${option.ingredient_cost.toLocaleString()}원`}
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="수정">
                                    <IconButton 
                                      color="primary" 
                                      onClick={() => handleEditMealOption(option)}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="삭제">
                                    <IconButton 
                                      color="error" 
                                      onClick={() => handleDeleteMealOption(option.id)}
                                      size="small"
                                      disabled={deleteLoading}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                옵션이 없습니다
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
      
      {/* Create Meal Option Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>새 식사 옵션 생성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>식사 유형</InputLabel>
                <Select
                  value={newMealOption.meal_type}
                  onChange={(e) => handleNewMealOptionChange('meal_type', e.target.value)}
                  label="식사 유형"
                >
                  {mealTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="판매가 (인당)"
                type="number"
                value={newMealOption.price_per_person}
                onChange={(e) => handleNewMealOptionChange('price_per_person', e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="재료비 (인당)"
                type="number"
                value={newMealOption.ingredient_cost}
                onChange={(e) => handleNewMealOptionChange('ingredient_cost', e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="옵션명"
                value={newMealOption.meal_option}
                onChange={(e) => handleNewMealOptionChange('meal_option', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                value={newMealOption.description}
                onChange={(e) => handleNewMealOptionChange('description', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="inherit">취소</Button>
          <Button 
            onClick={handleCreateMealOptionSubmit} 
            color="primary" 
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? <CircularProgress size={24} /> : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Meal Option Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>식사 옵션 수정</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>식사 유형</InputLabel>
                <Select
                  value={editMealOption.meal_type}
                  onChange={(e) => handleEditMealOptionChange('meal_type', e.target.value)}
                  label="식사 유형"
                >
                  {mealTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="판매가 (인당)"
                type="number"
                value={editMealOption.price_per_person}
                onChange={(e) => handleEditMealOptionChange('price_per_person', e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="재료비 (인당)"
                type="number"
                value={editMealOption.ingredient_cost}
                onChange={(e) => handleEditMealOptionChange('ingredient_cost', e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="옵션명"
                value={editMealOption.meal_option}
                onChange={(e) => handleEditMealOptionChange('meal_option', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                value={editMealOption.description}
                onChange={(e) => handleEditMealOptionChange('description', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="inherit">취소</Button>
          <Button 
            onClick={handleEditMealOptionSubmit} 
            color="primary" 
            variant="contained"
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={24} /> : '수정'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MealCostManagement; 