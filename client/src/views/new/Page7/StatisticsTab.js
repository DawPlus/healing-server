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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

// 더미 데이터
const initialStatTypes = [
  { 
    id: 1, 
    name: '프로그램 만족도', 
    description: '프로그램별 만족도 통계',
    chartTypes: ['bar', 'pie'],
    filters: ['program', 'date', 'age', 'gender'],
    isActive: true,
    dataSource: 'satisfaction'
  },
  { 
    id: 2, 
    name: '강사 평가', 
    description: '강사별 평가 통계',
    chartTypes: ['bar', 'pie', 'table'],
    filters: ['instructor', 'program', 'date'],
    isActive: true,
    dataSource: 'instructor'
  },
  { 
    id: 3, 
    name: '시설 만족도', 
    description: '시설별 만족도 통계',
    chartTypes: ['bar', 'pie'],
    filters: ['facility', 'date', 'program'],
    isActive: true,
    dataSource: 'facility'
  },
  { 
    id: 4, 
    name: '연령대별 참여율', 
    description: '연령대별 프로그램 참여율',
    chartTypes: ['pie', 'bar'],
    filters: ['age', 'program', 'date'],
    isActive: true,
    dataSource: 'demographic'
  },
  { 
    id: 5, 
    name: '식사 만족도', 
    description: '식사 메뉴별 만족도',
    chartTypes: ['bar', 'table'],
    filters: ['meal', 'date', 'age'],
    isActive: false,
    dataSource: 'meal'
  }
];

// 필터 옵션
const filterOptions = [
  { value: 'program', label: '프로그램' },
  { value: 'instructor', label: '강사' },
  { value: 'date', label: '일자' },
  { value: 'age', label: '연령대' },
  { value: 'gender', label: '성별' },
  { value: 'facility', label: '시설' },
  { value: 'meal', label: '식사' }
];

// 차트 타입 옵션
const chartTypeOptions = [
  { value: 'bar', label: '막대 그래프', icon: <BarChartIcon /> },
  { value: 'pie', label: '파이 차트', icon: <PieChartIcon /> },
  { value: 'table', label: '테이블', icon: <TableChartIcon /> }
];

// 데이터 소스 옵션
const dataSourceOptions = [
  { value: 'satisfaction', label: '만족도 조사' },
  { value: 'instructor', label: '강사 평가' },
  { value: 'facility', label: '시설 이용' },
  { value: 'demographic', label: '인구 통계' },
  { value: 'meal', label: '식사 평가' }
];

const StatisticsTab = () => {
  const [statTypes, setStatTypes] = useState(initialStatTypes);
  const [selectedStatType, setSelectedStatType] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStatType, setEditingStatType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chartTypes: [],
    filters: [],
    isActive: true,
    dataSource: ''
  });
  const [searchText, setSearchText] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  // 상태 변경 감지
  useEffect(() => {
    setHasChanges(true);
  }, [statTypes]);

  // 검색 핸들러
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setCurrentTabIndex(newValue);
  };

  // 필터링된 통계 유형 목록
  const filteredStatTypes = statTypes.filter(type => {
    return searchText
      ? type.name.toLowerCase().includes(searchText.toLowerCase()) ||
        type.description.toLowerCase().includes(searchText.toLowerCase())
      : true;
  });

  // 통계 유형 선택 핸들러
  const handleSelectStatType = (statType) => {
    setSelectedStatType(statType);
  };

  // 다이얼로그 열기 - 추가
  const handleOpenAddDialog = () => {
    setEditingStatType(null);
    setFormData({
      name: '',
      description: '',
      chartTypes: [],
      filters: [],
      isActive: true,
      dataSource: ''
    });
    setOpenDialog(true);
  };

  // 다이얼로그 열기 - 수정
  const handleOpenEditDialog = (statType) => {
    setEditingStatType(statType);
    setFormData({
      name: statType.name,
      description: statType.description,
      chartTypes: [...statType.chartTypes],
      filters: [...statType.filters],
      isActive: statType.isActive,
      dataSource: statType.dataSource
    });
    setOpenDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 미리보기 다이얼로그 열기
  const handleOpenPreviewDialog = () => {
    if (!selectedStatType) {
      setSnackbar({
        open: true,
        message: '미리보기할 통계 유형을 선택해주세요.',
        severity: 'error'
      });
      return;
    }
    
    setPreviewDialogOpen(true);
  };

  // 미리보기 다이얼로그 닫기
  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  // 통계 유형 복제
  const handleDuplicateStatType = (statType) => {
    const newId = Math.max(...statTypes.map(type => type.id), 0) + 1;
    const newStatType = { 
      ...statType, 
      id: newId, 
      name: `${statType.name} (복사본)` 
    };
    
    setStatTypes(prev => [...prev, newStatType]);
    setSelectedStatType(newStatType);
    
    setSnackbar({
      open: true,
      message: '통계 유형이 성공적으로 복제되었습니다.',
      severity: 'success'
    });
  };

  // 입력 폼 변경 핸들러
  const handleFormChange = (event) => {
    const { name, value, checked } = event.target;
    
    if (name === 'isActive') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 다중 선택 핸들러
  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 통계 유형 저장 (추가 또는 수정)
  const handleSaveStatType = () => {
    // 입력 검증
    if (!formData.name || formData.chartTypes.length === 0 || formData.filters.length === 0 || !formData.dataSource) {
      setSnackbar({
        open: true,
        message: '필수 항목을 모두 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingStatType) {
      // 통계 유형 수정
      setStatTypes(prev => 
        prev.map(type => type.id === editingStatType.id ? { ...formData, id: type.id } : type)
      );
      // 선택된 통계 유형도 업데이트
      if (selectedStatType && selectedStatType.id === editingStatType.id) {
        setSelectedStatType({ ...formData, id: editingStatType.id });
      }
      setSnackbar({
        open: true,
        message: '통계 유형이 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 통계 유형 추가
      const newId = Math.max(...statTypes.map(type => type.id), 0) + 1;
      const newStatType = { ...formData, id: newId };
      setStatTypes(prev => [...prev, newStatType]);
      setSelectedStatType(newStatType);
      setSnackbar({
        open: true,
        message: '새 통계 유형이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  // 통계 유형 삭제
  const handleDeleteStatType = (id) => {
    if (window.confirm('정말로 이 통계 유형을 삭제하시겠습니까?')) {
      setStatTypes(prev => prev.filter(type => type.id !== id));
      if (selectedStatType && selectedStatType.id === id) {
        setSelectedStatType(null);
      }
      setSnackbar({
        open: true,
        message: '통계 유형이 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    }
  };

  // 통계 유형 활성화 상태 변경
  const handleToggleStatTypeActive = (id, isActive) => {
    setStatTypes(prev => 
      prev.map(type => type.id === id ? { ...type, isActive } : type)
    );
    // 선택된 통계 유형도 업데이트
    if (selectedStatType && selectedStatType.id === id) {
      setSelectedStatType(prev => ({ ...prev, isActive }));
    }
  };

  // 설정 저장
  const handleSaveSettings = () => {
    // 실제 구현에서는 API 호출 등을 통해 서버에 저장
    setSnackbar({
      open: true,
      message: '통계 설정이 성공적으로 저장되었습니다.',
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
        ⊙ 입력마감 통계 추가
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 입력마감시 통계결과 산출</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 항목별 통계 항목 설정</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 통계 결과에 맞는 분석도구 설정(그래프, 도넛, 표 등)</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 항목별 필터설정(프로그램별, 강사별, 날짜별, 연령대별 등)</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          통계 항목 설정
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<VisibilityIcon />}
            onClick={handleOpenPreviewDialog}
            disabled={!selectedStatType}
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
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={currentTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="모든 통계" />
          <Tab label="활성화된 통계" />
          <Tab label="비활성화된 통계" />
        </Tabs>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="통계 유형 검색"
              placeholder="이름 또는 설명으로 검색"
              size="small"
              value={searchText}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              onClick={handleOpenAddDialog}
            >
              통계 유형 추가
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, minHeight: '500px' }}>
            <Typography variant="h6" gutterBottom>
              통계 유형 목록
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
              {filteredStatTypes
                .filter(type => 
                  currentTabIndex === 0 ? true : 
                  currentTabIndex === 1 ? type.isActive : 
                  !type.isActive
                )
                .map((statType) => (
                <Card 
                  key={statType.id} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    backgroundColor: selectedStatType && selectedStatType.id === statType.id ? '#f0f7ff' : 'white',
                    opacity: statType.isActive ? 1 : 0.7,
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  onClick={() => handleSelectStatType(statType)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium' }}>
                        {statType.name}
                        {!statType.isActive && (
                          <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: '0.8rem' }}>
                            (비활성)
                          </Typography>
                        )}
                      </Typography>
                      <Box>
                        <Tooltip title="복제">
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateStatType(statType);
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
                              handleOpenEditDialog(statType);
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
                              handleDeleteStatType(statType.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                      {statType.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {statType.chartTypes.map((chartType) => {
                        const chartOption = chartTypeOptions.find(option => option.value === chartType);
                        return (
                          <Box 
                            key={chartType} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              bgcolor: 'action.hover',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            {chartOption?.icon && React.cloneElement(chartOption.icon, { fontSize: 'small', sx: { mr: 0.5 } })}
                            {chartOption?.label}
                          </Box>
                        );
                      })}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip 
                        size="small"
                        label={dataSourceOptions.find(opt => opt.value === statType.dataSource)?.label || statType.dataSource}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        필터: 
                      </Typography>
                      {statType.filters.map((filter) => {
                        const filterOption = filterOptions.find(option => option.value === filter);
                        return (
                          <Typography key={filter} variant="body2" color="text.secondary">
                            {filterOption?.label || filter},
                          </Typography>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {filteredStatTypes
                .filter(type => 
                  currentTabIndex === 0 ? true : 
                  currentTabIndex === 1 ? type.isActive : 
                  !type.isActive
                ).length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                  {searchText ? '검색 결과가 없습니다.' : '등록된 통계 유형이 없습니다.'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, minHeight: '500px' }}>
            {selectedStatType ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedStatType.name} 상세정보
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedStatType.isActive}
                        onChange={(e) => handleToggleStatTypeActive(selectedStatType.id, e.target.checked)}
                        color="primary"
                      />
                    }
                    label="활성화"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      설명
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedStatType.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      데이터 소스
                    </Typography>
                    <Chip 
                      label={dataSourceOptions.find(opt => opt.value === selectedStatType.dataSource)?.label || selectedStatType.dataSource}
                      color="primary"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      차트 유형
                    </Typography>
                    <Grid container spacing={1}>
                      {chartTypeOptions.map((option) => (
                        <Grid item key={option.value}>
                          <Paper 
                            variant="outlined"
                            sx={{ 
                              p: 1, 
                              display: 'flex', 
                              alignItems: 'center',
                              bgcolor: selectedStatType.chartTypes.includes(option.value) ? 'primary.light' : 'white',
                              color: selectedStatType.chartTypes.includes(option.value) ? 'primary.contrastText' : 'text.primary'
                            }}
                          >
                            {option.icon}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {option.label}
                            </Typography>
                            {selectedStatType.chartTypes.includes(option.value) && (
                              <CheckIcon fontSize="small" sx={{ ml: 1 }} />
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      필터 옵션
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {filterOptions.map((option) => (
                        <Paper 
                          key={option.value}
                          variant="outlined"
                          sx={{ 
                            px: 1.5, 
                            py: 0.75, 
                            bgcolor: selectedStatType.filters.includes(option.value) ? 'primary.light' : 'white',
                            color: selectedStatType.filters.includes(option.value) ? 'primary.contrastText' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2">
                            {option.label}
                            {selectedStatType.filters.includes(option.value) && (
                              <CheckIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                            )}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(selectedStatType)}
                      >
                        수정
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDeleteStatType(selectedStatType.id)}
                      >
                        삭제
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  좌측에서 통계 유형을 선택하면 상세 정보를 확인할 수 있습니다.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 통계 유형 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStatType ? '통계 유형 수정' : '새 통계 유형 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="통계 유형 이름"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
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
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="data-source-label">데이터 소스</InputLabel>
                  <Select
                    labelId="data-source-label"
                    name="dataSource"
                    value={formData.dataSource}
                    onChange={handleFormChange}
                    label="데이터 소스"
                  >
                    {dataSourceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="chart-types-label">차트 유형</InputLabel>
                  <Select
                    labelId="chart-types-label"
                    multiple
                    name="chartTypes"
                    value={formData.chartTypes}
                    onChange={handleMultiSelectChange}
                    renderValue={(selected) => 
                      selected.map(value => 
                        chartTypeOptions.find(option => option.value === value)?.label || value
                      ).join(', ')
                    }
                    label="차트 유형"
                  >
                    {chartTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={formData.chartTypes.indexOf(option.value) > -1} />
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                          {option.icon}
                        </ListItemIcon>
                        <ListItemText primary={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="filters-label">필터 옵션</InputLabel>
                  <Select
                    labelId="filters-label"
                    multiple
                    name="filters"
                    value={formData.filters}
                    onChange={handleMultiSelectChange}
                    renderValue={(selected) => 
                      selected.map(value => 
                        filterOptions.find(option => option.value === value)?.label || value
                      ).join(', ')
                    }
                    label="필터 옵션"
                  >
                    {filterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={formData.filters.indexOf(option.value) > -1} />
                        <ListItemText primary={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="활성화"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSaveStatType} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 통계 미리보기 다이얼로그 */}
      <Dialog open={previewDialogOpen} onClose={handleClosePreviewDialog} maxWidth="lg" fullWidth>
        {selectedStatType && (
          <>
            <DialogTitle>
              {selectedStatType.name} - 통계 미리보기
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedStatType.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        필터 옵션
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {selectedStatType.filters.map(filter => {
                          const filterOption = filterOptions.find(option => option.value === filter);
                          return (
                            <FormControl 
                              key={filter} 
                              fullWidth 
                              size="small" 
                              sx={{ mt: 1 }}
                            >
                              <InputLabel id={`filter-${filter}-label`}>
                                {filterOption?.label || filter}
                              </InputLabel>
                              <Select
                                labelId={`filter-${filter}-label`}
                                label={filterOption?.label || filter}
                                value=""
                                disabled
                              >
                                <MenuItem value="">
                                  <em>전체</em>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          );
                        })}
                      </Box>
                      
                      <Button variant="contained" color="primary" fullWidth disabled>
                        적용
                      </Button>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Paper variant="outlined" sx={{ p: 2, minHeight: '400px' }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          통계 그래프
                        </Typography>
                        
                        <Box>
                          {selectedStatType.chartTypes.map(chartType => {
                            const chartOption = chartTypeOptions.find(option => option.value === chartType);
                            return (
                              <Tooltip key={chartType} title={chartOption?.label || chartType}>
                                <IconButton size="small">
                                  {chartOption?.icon}
                                </IconButton>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box 
                        sx={{ 
                          height: '300px', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          bgcolor: '#f9f9f9',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          통계 데이터가 수집되면 이곳에 그래프가 표시됩니다.
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
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

export default StatisticsTab; 