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
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

// 더미 데이터
const initialInstructors = [
  { 
    id: 1, 
    name: '김철수', 
    category: '힐링', 
    qualification: '명상지도사 1급, 요가강사',
    baseRate: 250000,
    additionalRate: 50000,
    specialties: ['명상', '요가', '스트레스 관리'],
    notes: '주중 야간 수업 가능'
  },
  { 
    id: 2, 
    name: '이영희', 
    category: '교육', 
    qualification: '산림치유지도사 1급, 동식물 전문가',
    baseRate: 300000,
    additionalRate: 60000,
    specialties: ['산림치유', '숲체험', '자연교육'],
    notes: '주말 수업 선호'
  },
  { 
    id: 3, 
    name: '박지훈', 
    category: '힐링', 
    qualification: '심리상담사, 아트테라피 전문가',
    baseRate: 280000,
    additionalRate: 55000,
    specialties: ['심리상담', '미술치료', '정서관리'],
    notes: '단체 프로그램 전문'
  },
  { 
    id: 4, 
    name: '최수진', 
    category: '예술', 
    qualification: '음악치료사, 피아노 전문가',
    baseRate: 270000,
    additionalRate: 50000,
    specialties: ['음악치료', '음악객실', '합창지도'],
    notes: '악기 지참 가능'
  },
  { 
    id: 5, 
    name: '정민석', 
    category: '교육', 
    qualification: '환경교육사, 생태해설사',
    baseRate: 260000,
    additionalRate: 50000,
    specialties: ['환경교육', '생태탐방', '자연관찰'],
    notes: '야외 객실 전문'
  }
];

// 강사 카테고리
const categories = ['힐링', '교육', '예술', '건강', '기타'];

const CustomerInfoTab = () => {
  const [instructors, setInstructors] = useState(initialInstructors);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [specialty, setSpecialty] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    qualification: '',
    baseRate: '',
    additionalRate: '',
    specialties: [],
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // 상태 변경 감지
  useEffect(() => {
    setHasChanges(true);
  }, [instructors]);

  // 카테고리 필터링 핸들러
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // 검색 핸들러
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  // 필터링된 강사 목록
  const filteredInstructors = instructors.filter(instructor => {
    const matchesCategory = selectedCategory ? instructor.category === selectedCategory : true;
    const matchesSearch = searchText
      ? instructor.name.toLowerCase().includes(searchText.toLowerCase()) ||
        instructor.qualification.toLowerCase().includes(searchText.toLowerCase()) ||
        instructor.specialties.some(s => s.toLowerCase().includes(searchText.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  // 다이얼로그 열기 - 강사 추가
  const handleOpenAddDialog = () => {
    setEditingInstructor(null);
    setFormData({
      name: '',
      category: '',
      qualification: '',
      baseRate: '',
      additionalRate: '',
      specialties: [],
      notes: ''
    });
    setSpecialty('');
    setOpenDialog(true);
  };

  // 다이얼로그 열기 - 강사 수정
  const handleOpenEditDialog = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      category: instructor.category,
      qualification: instructor.qualification,
      baseRate: instructor.baseRate,
      additionalRate: instructor.additionalRate,
      specialties: [...instructor.specialties],
      notes: instructor.notes
    });
    setSpecialty('');
    setOpenDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 강사 상세 정보 열기
  const handleOpenDetails = (instructor) => {
    setSelectedInstructor(instructor);
    setDetailsOpen(true);
  };

  // 강사 상세 정보 닫기
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // 입력 폼 변경 핸들러
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'baseRate' || name === 'additionalRate' 
        ? (value === '' ? '' : Number(value)) 
        : value
    }));
  };

  // 전문분야 추가 핸들러
  const handleAddSpecialty = () => {
    if (specialty.trim() && !formData.specialties.includes(specialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty.trim()]
      }));
      setSpecialty('');
    }
  };

  // 전문분야 삭제 핸들러
  const handleDeleteSpecialty = (specialtyToDelete) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialtyToDelete)
    }));
  };

  // 강사 복제
  const handleDuplicateInstructor = (instructor) => {
    const newId = Math.max(...instructors.map(i => i.id), 0) + 1;
    const newInstructor = { 
      ...instructor, 
      id: newId, 
      name: `${instructor.name} (복사본)` 
    };
    setInstructors(prev => [...prev, newInstructor]);
    setSnackbar({
      open: true,
      message: '강사 정보가 복제되었습니다.',
      severity: 'success'
    });
  };

  // 강사 저장 (추가 또는 수정)
  const handleSaveInstructor = () => {
    // 입력 검증
    if (!formData.name || !formData.category || formData.baseRate === '') {
      setSnackbar({
        open: true,
        message: '필수 항목을 모두 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingInstructor) {
      // 강사 수정
      setInstructors(prev => 
        prev.map(p => p.id === editingInstructor.id ? { ...formData, id: p.id } : p)
      );
      setSnackbar({
        open: true,
        message: '강사 정보가 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 강사 추가
      const newId = Math.max(...instructors.map(p => p.id), 0) + 1;
      setInstructors(prev => [...prev, { ...formData, id: newId }]);
      setSnackbar({
        open: true,
        message: '새 강사가 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  // 강사 삭제
  const handleDeleteInstructor = (id) => {
    if (window.confirm('정말로 이 강사를 삭제하시겠습니까?')) {
      setInstructors(prev => prev.filter(p => p.id !== id));
      setSnackbar({
        open: true,
        message: '강사가 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    }
  };

  // 설정 저장
  const handleSaveSettings = () => {
    // 실제 구현에서는 API 호출 등을 통해 서버에 저장
    setSnackbar({
      open: true,
      message: '강사비 설정이 성공적으로 저장되었습니다.',
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
        ⊙ 강사비 설정
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 강사비 설정</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 강사 개인별 강사비 설정 기능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 기본강사비, 추가강사비(교통비 등) 가격 설정 및 수정기능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 강사 이력 및 자격증 등 정보 저장</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          강사 관리 및 강사비 설정
        </Typography>
        
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
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">카테고리</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="카테고리"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">전체</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="강사명 또는 전문분야로 검색"
              size="small"
              value={searchText}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              onClick={handleOpenAddDialog}
            >
              강사 추가
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="15%">강사명</TableCell>
              <TableCell width="10%">카테고리</TableCell>
              <TableCell width="15%">자격증</TableCell>
              <TableCell width="10%" align="right">기본강사비</TableCell>
              <TableCell width="10%" align="right">추가강사비</TableCell>
              <TableCell width="25%">전문분야</TableCell>
              <TableCell width="15%" align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstructors.map((instructor) => (
              <TableRow 
                key={instructor.id} 
                hover
                onClick={() => handleOpenDetails(instructor)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{instructor.name}</TableCell>
                <TableCell>{instructor.category}</TableCell>
                <TableCell>{instructor.qualification}</TableCell>
                <TableCell align="right">{instructor.baseRate.toLocaleString()}원</TableCell>
                <TableCell align="right">{instructor.additionalRate.toLocaleString()}원</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {instructor.specialties.map((specialty, index) => (
                      <Chip key={index} label={specialty} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="수정">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDialog(instructor);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="복제">
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateInstructor(instructor);
                      }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInstructor(instructor.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredInstructors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 강사 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInstructor ? '강사 정보 수정' : '새 강사 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="강사명"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="instructor-category-label">카테고리</InputLabel>
                <Select
                  labelId="instructor-category-label"
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="자격증/이력"
                name="qualification"
                value={formData.qualification}
                onChange={handleFormChange}
                placeholder="예: 명상지도사 1급, 요가강사 등"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="기본강사비"
                name="baseRate"
                type="number"
                value={formData.baseRate}
                onChange={handleFormChange}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
                helperText="기본 강의 1회 당 지급 금액"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="추가강사비"
                name="additionalRate"
                type="number"
                value={formData.additionalRate}
                onChange={handleFormChange}
                InputProps={{
                  endAdornment: <Typography variant="body2">원</Typography>
                }}
                helperText="교통비, 자료비 등 추가 지급 금액"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                전문분야
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="전문분야 입력"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ ml: 1 }}
                  onClick={handleAddSpecialty}
                >
                  추가
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.specialties.map((specialty, index) => (
                  <Chip 
                    key={index} 
                    label={specialty} 
                    onDelete={() => handleDeleteSpecialty(specialty)} 
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="비고"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSaveInstructor} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 강사 상세 정보 다이얼로그 */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedInstructor && (
          <>
            <DialogTitle>
              강사 상세 정보
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedInstructor.name}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">{selectedInstructor.category}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>자격증/이력</Typography>
                  <Typography variant="body2">{selectedInstructor.qualification || '정보 없음'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>비고</Typography>
                  <Typography variant="body2">{selectedInstructor.notes || '정보 없음'}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>전문분야</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedInstructor.specialties.map((specialty, index) => (
                      <Chip key={index} label={specialty} size="small" />
                    ))}
                    {selectedInstructor.specialties.length === 0 && (
                      <Typography variant="body2">등록된 전문분야가 없습니다.</Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>강사비 정보</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>기본강사비</Typography>
                    <Typography variant="h6" color="primary">
                      {selectedInstructor.baseRate.toLocaleString()}원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      기본 강의 1회 당 지급 금액
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>추가강사비</Typography>
                    <Typography variant="h6" color="secondary">
                      {selectedInstructor.additionalRate.toLocaleString()}원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      교통비, 자료비 등 추가 지급 금액
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="subtitle2" gutterBottom>총 지급액 (1회 기준)</Typography>
                    <Typography variant="h5" color="text.primary">
                      {(selectedInstructor.baseRate + selectedInstructor.additionalRate).toLocaleString()}원
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleOpenEditDialog(selectedInstructor)} color="primary">
                수정
              </Button>
              <Button onClick={handleCloseDetails}>닫기</Button>
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

export default CustomerInfoTab; 