import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import koLocale from 'date-fns/locale/ko';
import RemoveIcon from '@mui/icons-material/Remove';

// 더미 데이터
const dummyGroupList = [
  { id: 1, groupName: '하이힐링원', date: '2023-04-15', type: '가예약' },
  { id: 2, groupName: '서울대학교', date: '2023-04-16', type: '확정예약' },
  { id: 3, groupName: '강원대학교', date: '2023-04-20', type: '일정미정' },
  { id: 4, groupName: '대한병원', date: '2023-04-22', type: '확정예약' },
  { id: 5, groupName: '국립공원공단', date: '2023-05-05', type: '가예약' },
];

const dummyInspectionData = {
  1: {
    groupName: '하이힐링원',
    date: '2023-04-15',
    inspector: '김철수',
    inspectDate: '2023-04-01',
    programName: '힐링 프로그램',
    participants: 25,
    room: {
      standard: { count: 2, price: 80000, discount: 0 },
      deluxe: { count: 1, price: 120000, discount: 0 },
      family: { count: 0, price: 180000, discount: 0 }
    },
    meal: [
      { type: '조식', count: 25, price: 10000, discount: 0 },
      { type: '중식', count: 25, price: 15000, discount: 0 }
    ],
    hall: { type: '세미나실', price: 150000, discount: 0 },
    program: { type: '힐링 프로그램', count: 25, price: 50000, discount: 0 },
    freeItems: [],
    remarks: '특이사항 없음'
  },
  2: {
    groupName: '서울대학교',
    date: '2023-04-16',
    inspector: '이영희',
    inspectDate: '2023-03-15',
    programName: '힐링 캠프',
    participants: 40,
    room: {
      standard: 0,
      deluxe: 5,
      family: 2
    },
    meal: ['석식'],
    hall: '대강당',
    remarks: '식단에 알러지 주의 필요'
  }
};

const InspectionTab = () => {
  const [searchDate, setSearchDate] = useState(null);
  const [searchGroup, setSearchGroup] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [freeItems, setFreeItems] = useState([]);
  const [newFreeItem, setNewFreeItem] = useState('');

  // 검색 핸들러
  const handleSearch = () => {
    // 실제 구현에서는 API 호출 등의 로직 구현
    console.log('검색 조건:', { date: searchDate, groupName: searchGroup });
  };

  // 그룹 선택 핸들러 - 할인 계산 로직 추가
  const handleSelectGroup = (groupId) => {
    const group = dummyInspectionData[groupId] || null;
    setSelectedGroup(group);
    
    if (group) {
      calculateTotal(group);
      setFreeItems(group.freeItems || []);
    }
  };

  // 할인율 변경 핸들러
  const handleDiscountChange = (category, index, value) => {
    if (!selectedGroup) return;
    
    const updatedGroup = { ...selectedGroup };
    let numericValue = parseInt(value, 10);
    
    // 유효성 검사: NaN이거나 음수인 경우 0으로, 100을 초과하는 경우 100으로 제한
    if (isNaN(numericValue) || numericValue < 0) {
      numericValue = 0;
    } else if (numericValue > 100) {
      numericValue = 100;
    }
    
    // 카테고리에 따라 다른 처리
    if (category === 'room') {
      const roomType = index; // 'standard', 'deluxe', 'family' 등
      updatedGroup.room[roomType].discount = numericValue;
    } else if (category === 'meal') {
      updatedGroup.meal[index].discount = numericValue;
    } else if (category === 'hall') {
      updatedGroup.hall.discount = numericValue;
    } else if (category === 'program') {
      updatedGroup.program.discount = numericValue;
    }
    
    setSelectedGroup(updatedGroup);
    calculateTotal(updatedGroup);
  };

  // 무상 제공 항목 추가 핸들러
  const handleAddFreeItem = () => {
    if (!newFreeItem.trim()) return;
    
    const updatedFreeItems = [...freeItems, newFreeItem];
    setFreeItems(updatedFreeItems);
    
    if (selectedGroup) {
      const updatedGroup = { ...selectedGroup, freeItems: updatedFreeItems };
      setSelectedGroup(updatedGroup);
    }
    
    setNewFreeItem('');
  };

  // 무상 제공 항목 삭제 핸들러
  const handleRemoveFreeItem = (index) => {
    const updatedFreeItems = freeItems.filter((_, i) => i !== index);
    setFreeItems(updatedFreeItems);
    
    if (selectedGroup) {
      const updatedGroup = { ...selectedGroup, freeItems: updatedFreeItems };
      setSelectedGroup(updatedGroup);
    }
  };

  // 총액 계산 함수
  const calculateTotal = (group) => {
    if (!group) return 0;
    
    let total = 0;
    
    // 객실 비용 계산
    Object.entries(group.room).forEach(([type, data]) => {
      if (data.count > 0) {
        const discount = data.discount || 0;
        const discountedPrice = data.price * (1 - discount / 100);
        total += discountedPrice * data.count;
      }
    });
    
    // 식사 비용 계산
    group.meal.forEach(meal => {
      if (meal.count > 0) {
        const discount = meal.discount || 0;
        const discountedPrice = meal.price * (1 - discount / 100);
        total += discountedPrice * meal.count;
      }
    });
    
    // 대관 비용 계산
    if (group.hall && group.hall.price > 0) {
      const discount = group.hall.discount || 0;
      const discountedPrice = group.hall.price * (1 - discount / 100);
      total += discountedPrice;
    }
    
    // 프로그램 비용 계산
    if (group.program && group.program.count > 0) {
      const discount = group.program.discount || 0;
      const discountedPrice = group.program.price * (1 - discount / 100);
      total += discountedPrice * group.program.count;
    }
    
    setDiscountedTotal(total);
    return total;
  };

  // 견적서 출력 핸들러
  const handlePrint = () => {
    console.log('견적서 출력:', selectedGroup);
    // 실제 구현에서는 출력 관련 로직 구현
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 견적서
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 견적 리스트(단체명 등 표시) / 검색기능, 화면표시 기간 설정</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 달력 내 단체명 선택시에도 확인 가능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 단체명 선택 시 세부견적 확인, 출력기능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 항목별(숙박, 식사, 프로그램, 대관 등) 할인율(직접입력) 적용</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 무상제공 항목 포함</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 붙임 2. 견적서 참조</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              예약 단체 목록
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                    <DatePicker
                      label="날짜 검색"
                      value={searchDate}
                      onChange={(newDate) => setSearchDate(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="단체명 검색"
                    size="small"
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={handleSearch}
                  >
                    검색
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {dummyGroupList.map((group) => (
                <React.Fragment key={group.id}>
                  <ListItem 
                    button 
                    selected={selectedGroup && selectedGroup.groupName === group.groupName}
                    onClick={() => handleSelectGroup(group.id)}
                  >
                    <ListItemText 
                      primary={`${group.groupName} (${group.type})`} 
                      secondary={`예약일: ${group.date}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {dummyGroupList.length === 0 && (
                <ListItem>
                  <ListItemText primary="검색 결과가 없습니다." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                견적서 상세 정보
              </Typography>
              {selectedGroup && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={handlePrint}
                >
                  견적서 출력
                </Button>
              )}
            </Box>
            
            {selectedGroup ? (
              <>
                <Grid container spacing={2}>
                  {/* 기본 정보 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="단체명"
                      value={selectedGroup.groupName}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="예약일"
                      value={selectedGroup.date}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  
                  {/* 추가 정보 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="견적자"
                      value={selectedGroup.inspector}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="견적일"
                      value={selectedGroup.inspectDate}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />

                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="프로그램명"
                      value={selectedGroup.programName}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="참가인원"
                      value={selectedGroup.participants}
                      fullWidth
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  견적 항목
                </Typography>
                
                {/* 객실 정보 */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  숙박
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>객실명</TableCell>
                        <TableCell align="right">수량</TableCell>
                        <TableCell align="right">단가</TableCell>
                        <TableCell align="right">할인율(%)</TableCell>
                        <TableCell align="right">금액</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(selectedGroup.room).map(([type, data]) => {
                        if (data.count === 0) return null;
                        
                        const discount = data.discount || 0;
                        const discountedPrice = data.price * (1 - discount / 100);
                        const total = discountedPrice * data.count;
                        
                        return (
                          <TableRow key={type}>
                            <TableCell>
                              {type === 'standard' ? '스탠다드' : 
                               type === 'deluxe' ? '디럭스' : 
                               type === 'family' ? '패밀리' : type}
                            </TableCell>
                            <TableCell align="right">{data.count}</TableCell>
                            <TableCell align="right">{data.price.toLocaleString()}원</TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                type="number"
                                value={discount}
                                onChange={(e) => handleDiscountChange('room', type, e.target.value)}
                                InputProps={{ 
                                  inputProps: { min: 0, max: 100 },
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                                }}
                                sx={{ width: '100px' }}
                              />
                            </TableCell>
                            <TableCell align="right">{total.toLocaleString()}원</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* 식사 정보 */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  식사
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>식사 유형</TableCell>
                        <TableCell align="right">인원</TableCell>
                        <TableCell align="right">단가</TableCell>
                        <TableCell align="right">할인율(%)</TableCell>
                        <TableCell align="right">금액</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedGroup.meal.map((meal, index) => {
                        const discount = meal.discount || 0;
                        const discountedPrice = meal.price * (1 - discount / 100);
                        const total = discountedPrice * meal.count;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{meal.type}</TableCell>
                            <TableCell align="right">{meal.count}</TableCell>
                            <TableCell align="right">{meal.price.toLocaleString()}원</TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                type="number"
                                value={discount}
                                onChange={(e) => handleDiscountChange('meal', index, e.target.value)}
                                InputProps={{ 
                                  inputProps: { min: 0, max: 100 },
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                                }}
                                sx={{ width: '100px' }}
                              />
                            </TableCell>
                            <TableCell align="right">{total.toLocaleString()}원</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* 대관 정보 */}
                {selectedGroup.hall && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      대관
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>시설</TableCell>
                            <TableCell align="right">단가</TableCell>
                            <TableCell align="right">할인율(%)</TableCell>
                            <TableCell align="right">금액</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{selectedGroup.hall.type}</TableCell>
                            <TableCell align="right">{selectedGroup.hall.price.toLocaleString()}원</TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                type="number"
                                value={selectedGroup.hall.discount || 0}
                                onChange={(e) => handleDiscountChange('hall', null, e.target.value)}
                                InputProps={{ 
                                  inputProps: { min: 0, max: 100 },
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                                }}
                                sx={{ width: '100px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {(selectedGroup.hall.price * (1 - (selectedGroup.hall.discount || 0) / 100)).toLocaleString()}원
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
                
                {/* 프로그램 정보 */}
                {selectedGroup.program && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      프로그램
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>프로그램명</TableCell>
                            <TableCell align="right">인원</TableCell>
                            <TableCell align="right">단가</TableCell>
                            <TableCell align="right">할인율(%)</TableCell>
                            <TableCell align="right">금액</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{selectedGroup.program.type}</TableCell>
                            <TableCell align="right">{selectedGroup.program.count}</TableCell>
                            <TableCell align="right">{selectedGroup.program.price.toLocaleString()}원</TableCell>
                            <TableCell align="right">
                              <TextField
                                size="small"
                                type="number"
                                value={selectedGroup.program.discount || 0}
                                onChange={(e) => handleDiscountChange('program', null, e.target.value)}
                                InputProps={{ 
                                  inputProps: { min: 0, max: 100 },
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                                }}
                                sx={{ width: '100px' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {(selectedGroup.program.price * selectedGroup.program.count * (1 - (selectedGroup.program.discount || 0) / 100)).toLocaleString()}원
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
                
                {/* 무상 제공 항목 */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  무상 제공 항목
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="항목 추가"
                      size="small"
                      value={newFreeItem}
                      onChange={(e) => setNewFreeItem(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={handleAddFreeItem}
                    >
                      추가
                    </Button>
                  </Grid>
                </Grid>
                
                <List sx={{ mb: 3 }}>
                  {freeItems.length > 0 ? (
                    freeItems.map((item, index) => (
                      <ListItem 
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRemoveFreeItem(index)}>
                            <RemoveIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={item} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="무상 제공 항목이 없습니다." />
                    </ListItem>
                  )}
                </List>
                
                {/* 총 금액 */}
                <Paper 
                  elevation={3} 
                  sx={{ p: 3, mt: 3, backgroundColor: '#f9f9f9', textAlign: 'right' }}
                >
                  <Typography variant="h6">
                    총 견적 금액: {discountedTotal.toLocaleString()}원
                  </Typography>
                </Paper>
                
                {/* 비고란 */}
                <TextField
                  label="비고"
                  multiline
                  rows={3}
                  fullWidth
                  margin="normal"
                  value={selectedGroup.remarks}
                  InputProps={{ readOnly: true }}
                />
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Typography color="textSecondary">견적서를 확인할 단체를 선택하세요.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InspectionTab; 