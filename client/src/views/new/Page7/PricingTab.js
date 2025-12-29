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
  Divider,
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
  Tabs,
  Tab
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';

// 더미 데이터
const initialProducts = [
  { 
    id: 1, 
    category: '숙박', 
    name: '스탠다드 객실', 
    price: 100000, 
    unit: '1박', 
    description: '기본 2인 기준' 
  },
  { 
    id: 2, 
    category: '숙박', 
    name: '디럭스 객실', 
    price: 150000, 
    unit: '1박', 
    description: '기본 2인 기준, 바다 전망' 
  },
  { 
    id: 3, 
    category: '숙박', 
    name: '패밀리 객실', 
    price: 200000, 
    unit: '1박', 
    description: '기본 4인 기준' 
  },
  { 
    id: 4, 
    category: '식사', 
    name: '조식', 
    price: 10000, 
    unit: '1인', 
    description: '뷔페식 제공' 
  },
  { 
    id: 5, 
    category: '식사', 
    name: '중식', 
    price: 15000, 
    unit: '1인', 
    description: '한식 정찬' 
  },
  { 
    id: 6, 
    category: '식사', 
    name: '석식', 
    price: 15000, 
    unit: '1인', 
    description: '한식 정찬' 
  },
  { 
    id: 7, 
    category: '대관', 
    name: '세미나실', 
    price: 50000, 
    unit: '1시간', 
    description: '최대 30인, 빔프로젝터 포함' 
  },
  { 
    id: 8, 
    category: '대관', 
    name: '대강당', 
    price: 100000, 
    unit: '1시간', 
    description: '최대 100인, 음향시설 포함' 
  },
  { 
    id: 9, 
    category: '대관', 
    name: '소회의실', 
    price: 30000, 
    unit: '1시간', 
    description: '최대 10인, 화이트보드 포함' 
  },
  { 
    id: 10, 
    category: '프로그램', 
    name: '숲 체험', 
    price: 20000, 
    unit: '1인', 
    description: '2시간 소요, 숲 체험 및 명상' 
  },
  { 
    id: 11, 
    category: '프로그램', 
    name: '요가 클래스', 
    price: 15000, 
    unit: '1인', 
    description: '1시간, 모든 레벨 가능' 
  }
];

const categories = ['숙박', '식사', '대관', '프로그램'];

// 추천 항목 템플릿
const recommendedTemplates = {
  '숙박': [
    { name: '스탠다드 객실', price: 100000, unit: '1박', description: '기본 2인 기준' },
    { name: '디럭스 객실', price: 150000, unit: '1박', description: '기본 2인 기준, 바다 전망' },
    { name: '패밀리 객실', price: 200000, unit: '1박', description: '기본 4인 기준' }
  ],
  '식사': [
    { name: '조식', price: 10000, unit: '1인', description: '뷔페식 제공' },
    { name: '석식', price: 15000, unit: '1인', description: '한식 정찬' }
  ],
  '대관': [
    { name: '세미나실', price: 50000, unit: '1시간', description: '최대 30인, 빔프로젝터 포함' },
    { name: '대강당', price: 100000, unit: '1시간', description: '최대 100인, 음향시설 포함' }
  ],
  '프로그램': [
    { name: '숲 체험', price: 20000, unit: '1인', description: '2시간 소요, 숲 체험 및 명상' },
    { name: '힐링 요가', price: 15000, unit: '1인', description: '1시간, 모든 레벨 가능' }
  ]
};

const PricingTab = () => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    price: '',
    unit: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [tabValue, setTabValue] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedCategory(categories[newValue]);
  };

  // 상품 변경시 변경 상태 업데이트
  useEffect(() => {
    setHasChanges(true);
  }, [products]);

  // 카테고리 필터링 핸들러
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // 검색 핸들러
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = searchText
      ? product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // 다이얼로그 열기 - 상품 추가
  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      category: selectedCategory || '',
      name: '',
      price: '',
      unit: '',
      description: ''
    });
    setOpenDialog(true);
  };

  // 다이얼로그 열기 - 상품 수정
  const handleOpenEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category,
      name: product.name,
      price: product.price,
      unit: product.unit,
      description: product.description
    });
    setOpenDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 템플릿 다이얼로그 열기
  const handleOpenTemplateDialog = () => {
    setSelectedTemplate('');
    setTemplateDialogOpen(true);
  };

  // 템플릿 다이얼로그 닫기
  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
  };

  // 템플릿 적용
  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      setSnackbar({
        open: true,
        message: '템플릿을 선택해주세요.',
        severity: 'error'
      });
      return;
    }

    const templateItems = recommendedTemplates[selectedTemplate];
    if (!templateItems) return;

    // 기존 템플릿 카테고리 상품 제거 확인
    if (window.confirm(`${selectedTemplate} 카테고리의 기존 상품을 삭제하고 템플릿을 적용하시겠습니까?`)) {
      // 해당 카테고리 상품 필터링
      const otherCategoryProducts = products.filter(p => p.category !== selectedTemplate);
      
      // 새 템플릿 상품에 ID 부여
      let maxId = Math.max(...products.map(p => p.id), 0);
      const newTemplateProducts = templateItems.map(item => ({
        ...item,
        category: selectedTemplate,
        id: ++maxId
      }));
      
      // 상품 목록 업데이트
      setProducts([...otherCategoryProducts, ...newTemplateProducts]);
      
      setSnackbar({
        open: true,
        message: `${selectedTemplate} 템플릿이 성공적으로 적용되었습니다.`,
        severity: 'success'
      });
      
      setSelectedCategory(selectedTemplate);
      // 해당 카테고리 탭 선택
      const tabIndex = categories.findIndex(c => c === selectedTemplate);
      if (tabIndex !== -1) {
        setTabValue(tabIndex);
      }
      
      setHasChanges(true);
    }
    
    handleCloseTemplateDialog();
  };

  // 입력 폼 변경 핸들러
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // 상품 저장 (추가 또는 수정)
  const handleSaveProduct = () => {
    // 입력 검증
    if (!formData.category || !formData.name || formData.price === '' || !formData.unit) {
      setSnackbar({
        open: true,
        message: '필수 항목을 모두 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingProduct) {
      // 상품 수정
      setProducts(prev => 
        prev.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p)
      );
      setSnackbar({
        open: true,
        message: '상품이 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 상품 추가
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      setProducts(prev => [...prev, { ...formData, id: newId }]);
      setSnackbar({
        open: true,
        message: '새 상품이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
    setHasChanges(true);
  };

  // 상품 삭제
  const handleDeleteProduct = (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setSnackbar({
        open: true,
        message: '상품이 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
      setHasChanges(true);
    }
  };

  // 설정 저장
  const handleSaveSettings = () => {
    // 실제 구현에서는 API 호출 등을 통해 서버에 저장
    setSnackbar({
      open: true,
      message: '가격 설정이 성공적으로 저장되었습니다.',
      severity: 'success'
    });
    setHasChanges(false);
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 상품 가격 설정
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 상품 가격 설정</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 숙박, 프로그램(프로그램 종류 변경 예정), 식사, 대관 기본 가격 설정 및 수정 기능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 가격 설정 저장 기능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 숙박 : 스탠다드, 디럭스, 패밀리</Typography>
                <Typography>• 식사 : 석식, 조식</Typography>
                <Typography>• 대관 : 대강당, 세미나실</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {categories.map((category, index) => (
            <Tab key={index} label={category} />
          ))}
        </Tabs>
        <Box>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={!hasChanges}
            sx={{ mr: 1 }}
          >
            설정 저장
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleOpenTemplateDialog}
          >
            템플릿 적용
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={selectedCategory ? 7 : 10}>
            <TextField
              fullWidth
              label="상품명 또는 설명으로 검색"
              size="small"
              value={searchText}
              onChange={handleSearchChange}
            />
          </Grid>
          {selectedCategory && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" disabled>
                <InputLabel id="category-select-label">카테고리</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={selectedCategory}
                  label="카테고리"
                >
                  <MenuItem value={selectedCategory}>{selectedCategory}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              onClick={handleOpenAddDialog}
            >
              상품 추가
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="15%">카테고리</TableCell>
              <TableCell width="20%">상품명</TableCell>
              <TableCell width="15%" align="right">가격</TableCell>
              <TableCell width="10%">단위</TableCell>
              <TableCell width="25%">설명</TableCell>
              <TableCell width="15%" align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell align="right">{product.price.toLocaleString()}원</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleOpenEditDialog(product)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {selectedCategory ? 
                    `${selectedCategory} 카테고리에 등록된 상품이 없습니다.` : 
                    '검색 결과가 없습니다.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 상품 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? '상품 수정' : '상품 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">카테고리</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="카테고리"
                  onChange={handleFormChange}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="상품명"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="가격"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="단위"
                name="unit"
                value={formData.unit}
                onChange={handleFormChange}
                placeholder="예: 1박, 1인, 1시간"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 템플릿 적용 다이얼로그 */}
      <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          템플릿 적용
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              선택한 카테고리의 상품을 기본 템플릿으로 설정합니다. 
              기존에 등록된 해당 카테고리의 상품은 삭제됩니다.
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="template-select-label">템플릿 선택</InputLabel>
              <Select
                labelId="template-select-label"
                value={selectedTemplate}
                label="템플릿 선택"
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category} 기본 템플릿</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedTemplate && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  포함될 상품:
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>상품명</TableCell>
                        <TableCell align="right">가격</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recommendedTemplates[selectedTemplate]?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.price.toLocaleString()}원</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>취소</Button>
          <Button 
            onClick={handleApplyTemplate} 
            variant="contained" 
            color="primary"
            disabled={!selectedTemplate}
          >
            적용
          </Button>
        </DialogActions>
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

export default PricingTab; 