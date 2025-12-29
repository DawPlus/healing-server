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
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Chip,
  Checkbox
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Save as SaveIcon,
  CheckBox as CheckBoxIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  TextFields as TextFieldsIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

// 더미 데이터
const initialComplaintCategories = [
  { 
    id: 1, 
    name: '객실 불만사항', 
    description: '객실 관련 불만사항',
    items: [
      { id: 101, text: '냉난방 문제', isRequired: true, isActive: true, type: 'checkbox' },
      { id: 102, text: '청소 상태 불량', isRequired: true, isActive: true, type: 'checkbox' },
      { id: 103, text: '소음 문제', isRequired: false, isActive: true, type: 'checkbox' },
      { id: 104, text: '욕실 시설 고장', isRequired: false, isActive: true, type: 'radio' },
      { id: 105, text: '침구류 불편', isRequired: false, isActive: true, type: 'text' }
    ]
  },
  { 
    id: 2, 
    name: '식사 불만사항', 
    description: '식당 및 음식 관련 불만사항',
    items: [
      { id: 201, text: '음식 맛 불만', isRequired: true, isActive: true, type: 'radio' },
      { id: 202, text: '식당 환경', isRequired: false, isActive: true, type: 'checkbox' },
      { id: 203, text: '서비스 태도', isRequired: false, isActive: true, type: 'radio' },
      { id: 204, text: '메뉴 구성', isRequired: false, isActive: true, type: 'text' }
    ]
  },
  { 
    id: 3, 
    name: '프로그램 불만사항', 
    description: '프로그램 운영 관련 불만사항',
    items: [
      { id: 301, text: '프로그램 내용', isRequired: true, isActive: true, type: 'radio' },
      { id: 302, text: '강사 불만', isRequired: true, isActive: true, type: 'text' },
      { id: 303, text: '시설 불편', isRequired: false, isActive: true, type: 'checkbox' },
      { id: 304, text: '시간 배분', isRequired: false, isActive: true, type: 'radio' }
    ]
  },
  { 
    id: 4, 
    name: '시설 불만사항', 
    description: '공용 시설 관련 불만사항',
    items: [
      { id: 401, text: '주차 시설', isRequired: false, isActive: true, type: 'checkbox' },
      { id: 402, text: '화장실 청결도', isRequired: false, isActive: true, type: 'radio' },
      { id: 403, text: '휴게 공간', isRequired: false, isActive: true, type: 'text' }
    ]
  }
];

// 항목 타입 옵션
const itemTypes = [
  { value: 'checkbox', label: '체크박스', icon: <CheckBoxIcon /> },
  { value: 'radio', label: '라디오 버튼', icon: <RadioButtonCheckedIcon /> },
  { value: 'text', label: '서술형', icon: <TextFieldsIcon /> }
];

const AdminSettingsTab = () => {
  const [complaintCategories, setComplaintCategories] = useState(initialComplaintCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });
  const [itemFormData, setItemFormData] = useState({
    text: '',
    isRequired: false,
    isActive: true,
    type: 'checkbox'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchText, setSearchText] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 상태 변경 감지
  useEffect(() => {
    setHasChanges(true);
  }, [complaintCategories]);

  // 카테고리 선택 핸들러
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  // 카테고리 대화상자 열기 - 추가
  const handleOpenAddCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: ''
    });
    setOpenCategoryDialog(true);
  };

  // 카테고리 대화상자 열기 - 수정
  const handleOpenEditCategoryDialog = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description
    });
    setOpenCategoryDialog(true);
  };

  // 항목 대화상자 열기 - 추가
  const handleOpenAddItemDialog = () => {
    if (!selectedCategory) {
      setSnackbar({
        open: true,
        message: '항목을 추가할 카테고리를 먼저 선택해주세요.',
        severity: 'error'
      });
      return;
    }
    setEditingItem(null);
    setItemFormData({
      text: '',
      isRequired: false,
      isActive: true,
      type: 'checkbox'
    });
    setOpenItemDialog(true);
  };

  // 항목 대화상자 열기 - 수정
  const handleOpenEditItemDialog = (item) => {
    setEditingItem(item);
    setItemFormData({
      text: item.text,
      isRequired: item.isRequired,
      isActive: item.isActive,
      type: item.type
    });
    setOpenItemDialog(true);
  };

  // 카테고리 대화상자 닫기
  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
  };

  // 항목 대화상자 닫기
  const handleCloseItemDialog = () => {
    setOpenItemDialog(false);
  };

  // 카테고리 폼 변경 핸들러
  const handleCategoryFormChange = (event) => {
    const { name, value } = event.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 항목 폼 변경 핸들러
  const handleItemFormChange = (event) => {
    const { name, value, checked } = event.target;
    setItemFormData(prev => ({
      ...prev,
      [name]: name === 'isRequired' || name === 'isActive' ? checked : value
    }));
  };

  // 카테고리 저장 (추가 또는 수정)
  const handleSaveCategory = () => {
    // 입력 검증
    if (!categoryFormData.name) {
      setSnackbar({
        open: true,
        message: '카테고리 이름을 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingCategory) {
      // 카테고리 수정
      setComplaintCategories(prev => 
        prev.map(c => c.id === editingCategory.id ? 
          { ...c, name: categoryFormData.name, description: categoryFormData.description } : 
          c
        )
      );
      // 선택된 카테고리도 업데이트
      if (selectedCategory && selectedCategory.id === editingCategory.id) {
        setSelectedCategory(prev => ({
          ...prev,
          name: categoryFormData.name,
          description: categoryFormData.description
        }));
      }
      setSnackbar({
        open: true,
        message: '카테고리가 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 카테고리 추가
      const newId = Math.max(...complaintCategories.map(c => c.id), 0) + 1;
      const newCategory = { 
        ...categoryFormData, 
        id: newId, 
        items: [] 
      };
      setComplaintCategories(prev => [...prev, newCategory]);
      setSelectedCategory(newCategory);
      setSnackbar({
        open: true,
        message: '새 카테고리가 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseCategoryDialog();
  };

  // 항목 저장 (추가 또는 수정)
  const handleSaveItem = () => {
    // 입력 검증
    if (!itemFormData.text || !itemFormData.type) {
      setSnackbar({
        open: true,
        message: '항목 내용과 타입을 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingItem) {
      // 항목 수정
      setComplaintCategories(prev => 
        prev.map(category => 
          category.id === selectedCategory.id ? 
          {
            ...category,
            items: category.items.map(item => 
              item.id === editingItem.id ? 
              { ...item, ...itemFormData } : 
              item
            )
          } : 
          category
        )
      );
      // 선택된 카테고리도 업데이트
      setSelectedCategory(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === editingItem.id ? 
          { ...item, ...itemFormData } : 
          item
        )
      }));
      setSnackbar({
        open: true,
        message: '항목이 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 항목 추가
      const baseId = selectedCategory.id * 100;
      const newId = Math.max(...selectedCategory.items.map(i => i.id), baseId) + 1;
      const newItem = { ...itemFormData, id: newId };
      
      setComplaintCategories(prev => 
        prev.map(category => 
          category.id === selectedCategory.id ? 
          {
            ...category,
            items: [...category.items, newItem]
          } : 
          category
        )
      );
      // 선택된 카테고리도 업데이트
      setSelectedCategory(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      setSnackbar({
        open: true,
        message: '새 항목이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseItemDialog();
  };

  // 카테고리 삭제
  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까? 포함된 모든 항목도 함께 삭제됩니다.')) {
      setComplaintCategories(prev => prev.filter(c => c.id !== categoryId));
      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(null);
      }
      setSnackbar({
        open: true,
        message: '카테고리가 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    }
  };

  // 항목 삭제
  const handleDeleteItem = (itemId) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      setComplaintCategories(prev => 
        prev.map(category => 
          category.id === selectedCategory.id ? 
          {
            ...category,
            items: category.items.filter(item => item.id !== itemId)
          } : 
          category
        )
      );
      // 선택된 카테고리도 업데이트
      setSelectedCategory(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
      setSnackbar({
        open: true,
        message: '항목이 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    }
  };

  // 항목 활성화 상태 변경
  const handleToggleItemActive = (itemId, isActive) => {
    setComplaintCategories(prev => 
      prev.map(category => 
        category.id === selectedCategory.id ? 
        {
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? 
            { ...item, isActive } : 
            item
          )
        } : 
        category
      )
    );
    // 선택된 카테고리도 업데이트
    setSelectedCategory(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? 
        { ...item, isActive } : 
        item
      )
    }));
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 검색 핸들러
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  // 필터링된 카테고리 목록
  const filteredCategories = complaintCategories.filter(category => {
    return searchText 
      ? category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        category.description.toLowerCase().includes(searchText.toLowerCase()) ||
        category.items.some(item => item.text.toLowerCase().includes(searchText.toLowerCase()))
      : true;
  });

  // 카테고리 복제
  const handleDuplicateCategory = (category) => {
    const newId = Math.max(...complaintCategories.map(c => c.id), 0) + 1;
    
    // 새 항목 ID 생성
    const newItems = category.items.map(item => ({
      ...item,
      id: newId * 100 + (item.id % 100) // 카테고리 ID를 기반으로 새 ID 생성
    }));
    
    const newCategory = {
      ...category,
      id: newId,
      name: `${category.name} (복사본)`,
      items: newItems
    };
    
    setComplaintCategories(prev => [...prev, newCategory]);
    setSelectedCategory(newCategory);
    
    setSnackbar({
      open: true,
      message: '카테고리가 성공적으로 복제되었습니다.',
      severity: 'success'
    });
  };

  // 미리보기 대화상자 열기
  const handleOpenPreviewDialog = () => {
    if (!selectedCategory) {
      setSnackbar({
        open: true,
        message: '미리보기할 카테고리를 선택해주세요.',
        severity: 'error'
      });
      return;
    }
    
    setPreviewDialogOpen(true);
  };

  // 미리보기 대화상자 닫기
  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  // 설정 저장
  const handleSaveSettings = () => {
    // 실제 구현에서는 API 호출 등을 통해 서버에 저장
    setSnackbar({
      open: true,
      message: '민원 항목 설정이 성공적으로 저장되었습니다.',
      severity: 'success'
    });
    setHasChanges(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 민원사항 항목 추가
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 민원사항 항목 추가</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 민원사항 항목 추가</Typography>
                </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 민원 카테고리별 세부항목 설정 기능</Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography>- 체크박스, 라디오, 서술형 결과 집계 및 출력 기능</Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          민원 카테고리 및 항목 관리
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleOpenPreviewDialog}
            disabled={!selectedCategory}
            sx={{ mr: 1 }}
          >
            미리보기
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={!hasChanges}
          >
            설정 저장
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                카테고리 목록
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                size="small"
                onClick={handleOpenAddCategoryDialog}
              >
                카테고리 추가
              </Button>
            </Box>
            
            <TextField
              fullWidth
              size="small"
              placeholder="카테고리 검색"
              value={searchText}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
              {filteredCategories.map((category) => (
                <Paper 
                  key={category.id} 
                  elevation={selectedCategory && selectedCategory.id === category.id ? 3 : 1}
                  sx={{ 
                    p: 2, 
                    mb: 1.5, 
                    cursor: 'pointer',
                    backgroundColor: selectedCategory && selectedCategory.id === category.id ? '#f0f7ff' : 'white',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onClick={() => handleSelectCategory(category)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {category.name}
                    </Typography>
                    <Box>
                      <Tooltip title="복제">
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateCategory(category);
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="수정">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCategoryDialog(category);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    항목 {category.items.length}개
                  </Typography>
                </Paper>
              ))}
              {filteredCategories.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  {searchText ? '검색 결과가 없습니다.' : '등록된 카테고리가 없습니다.'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedCategory ? `${selectedCategory.name} 항목 관리` : '항목 관리'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                size="small"
                onClick={handleOpenAddItemDialog}
                disabled={!selectedCategory}
              >
                항목 추가
              </Button>
            </Box>
            
            {selectedCategory ? (
              <TableContainer sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell width="40%">항목 내용</TableCell>
                      <TableCell width="15%" align="center">입력 타입</TableCell>
                      <TableCell width="10%" align="center">필수 항목</TableCell>
                      <TableCell width="15%" align="center">활성화</TableCell>
                      <TableCell width="20%" align="center">관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCategory.items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.text}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {itemTypes.find(type => type.value === item.type)?.icon}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {itemTypes.find(type => type.value === item.type)?.label}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {item.isRequired ? '예' : '아니오'}
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={item.isActive}
                            onChange={(e) => handleToggleItemActive(item.id, e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenEditItemDialog(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedCategory.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          등록된 항목이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  좌측에서 카테고리를 선택하면 항목을 관리할 수 있습니다.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 카테고리 추가/수정 다이얼로그 */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="카테고리명"
                name="name"
                value={categoryFormData.name}
                onChange={handleCategoryFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                name="description"
                value={categoryFormData.description}
                onChange={handleCategoryFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>취소</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 항목 추가/수정 다이얼로그 */}
      <Dialog open={openItemDialog} onClose={handleCloseItemDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? '항목 수정' : '새 항목 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="항목 내용"
                name="text"
                value={itemFormData.text}
                onChange={handleItemFormChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>입력 타입</InputLabel>
                <Select
                  name="type"
                  value={itemFormData.type}
                  label="입력 타입"
                  onChange={handleItemFormChange}
                >
                  {itemTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={itemFormData.isRequired}
                    onChange={handleItemFormChange}
                    name="isRequired"
                    color="primary"
                  />
                }
                label="필수 항목"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={itemFormData.isActive}
                    onChange={handleItemFormChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="활성화"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDialog}>취소</Button>
          <Button onClick={handleSaveItem} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="md" fullWidth>
        {selectedCategory && (
          <>
            <DialogTitle>
              {selectedCategory.name} - 미리보기
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedCategory.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedCategory.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {selectedCategory.items.filter(item => item.isActive).length > 0 ? (
                  <Grid container spacing={3}>
                    {selectedCategory.items.filter(item => item.isActive).map((item) => (
                      <Grid item xs={12} key={item.id}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {item.text}
                            {item.isRequired && (
                              <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                *
                              </Typography>
                            )}
                          </Typography>
                          
                          {item.type === 'checkbox' && (
                            <Box>
                              <FormControlLabel
                                control={<Checkbox disabled />}
                                label="예"
                              />
                              <FormControlLabel
                                control={<Checkbox disabled />}
                                label="아니오"
                              />
                            </Box>
                          )}
                          
                          {item.type === 'radio' && (
                            <RadioGroup row>
                              <FormControlLabel
                                value="1"
                                control={<Radio disabled />}
                                label="매우 불만족"
                              />
                              <FormControlLabel
                                value="2"
                                control={<Radio disabled />}
                                label="불만족"
                              />
                              <FormControlLabel
                                value="3"
                                control={<Radio disabled />}
                                label="보통"
                              />
                              <FormControlLabel
                                value="4"
                                control={<Radio disabled />}
                                label="만족"
                              />
                              <FormControlLabel
                                value="5"
                                control={<Radio disabled />}
                                label="매우 만족"
                              />
                            </RadioGroup>
                          )}
                          
                          {item.type === 'text' && (
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              placeholder="서술형 응답 입력"
                              disabled
                            />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" align="center" sx={{ my: 3 }}>
                    활성화된 항목이 없습니다.
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreviewDialog}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSettingsTab; 