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
  Card,
  CardContent,
  CardMedia,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Chip,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterAlt as FilterIcon, 
  FileDownload as FileDownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';

// 더미 데이터 - 프로그램 목록
const programs = [
  { id: 1, name: '힐링 프로그램', category: '힐링', active: true },
  { id: 2, name: '숲체험 프로그램', category: '교육', active: true },
  { id: 3, name: '명상 프로그램', category: '힐링', active: true },
  { id: 4, name: '환경교육 프로그램', category: '교육', active: true },
  { id: 5, name: '예술치유 프로그램', category: '예술', active: true }
];

// 더미 데이터 - 운영 결과
const operationResults = [
  { 
    id: 1, 
    programId: 1, 
    date: '2023-05-10', 
    participantCount: 25, 
    sessionCount: 2,
    instructor: '김철수',
    organization: 'ABC 기업',
    satisfactionScore: 4.8,
    effectScore: 4.5,
    details: { 
      environment: 4.9, 
      instructor: 4.7, 
      content: 4.8,
      ageGroups: {
        '20s': 8,
        '30s': 10,
        '40s': 5,
        '50s': 2
      } 
    }
  },
  { 
    id: 2, 
    programId: 1, 
    date: '2023-05-15', 
    participantCount: 18, 
    sessionCount: 1,
    instructor: '김철수',
    organization: 'DEF 기업',
    satisfactionScore: 4.6,
    effectScore: 4.3,
    details: { 
      environment: 4.5, 
      instructor: 4.8, 
      content: 4.5,
      ageGroups: {
        '20s': 4,
        '30s': 8,
        '40s': 4,
        '50s': 2
      } 
    }
  },
  { 
    id: 3, 
    programId: 2, 
    date: '2023-05-20', 
    participantCount: 30, 
    sessionCount: 3,
    instructor: '이영희',
    organization: 'GHI 학교',
    satisfactionScore: 4.9,
    effectScore: 4.7,
    details: { 
      environment: 4.9, 
      instructor: 5.0, 
      content: 4.8,
      ageGroups: {
        '10s': 20,
        '20s': 8,
        '30s': 2
      }
    }
  },
  { 
    id: 4, 
    programId: 3, 
    date: '2023-06-05', 
    participantCount: 15, 
    sessionCount: 2,
    instructor: '박지훈',
    organization: 'JKL 기업',
    satisfactionScore: 4.7,
    effectScore: 4.8,
    details: { 
      environment: 4.6, 
      instructor: 4.9, 
      content: 4.7,
      ageGroups: {
        '30s': 6,
        '40s': 7,
        '50s': 2
      }
    }
  },
  { 
    id: 5, 
    programId: 4, 
    date: '2023-06-10', 
    participantCount: 22, 
    sessionCount: 2,
    instructor: '정민석',
    organization: 'MNO 학교',
    satisfactionScore: 4.5,
    effectScore: 4.4,
    details: { 
      environment: 4.3, 
      instructor: 4.6, 
      content: 4.6,
      ageGroups: {
        '10s': 15,
        '20s': 5,
        '40s': 2
      }
    }
  }
];

// 차트 탭 패널 컴포넌트
function ChartTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PerformanceTab = () => {
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    programId: '',
    organization: '',
    instructor: ''
  });
  const [showResults, setShowResults] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 검색 파라미터 변경 핸들러
  const handleSearchParamChange = (event) => {
    const { name, value } = event.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    if (!searchParams.startDate || !searchParams.endDate) {
      setSnackbar({
        open: true,
        message: '시작일과 종료일을 모두 입력해주세요.',
        severity: 'error'
      });
      return;
    }
    
    setShowResults(true);
    setSnackbar({
      open: true,
      message: '검색이 완료되었습니다.',
      severity: 'success'
    });
  };

  // 검색 초기화 핸들러
  const handleResetSearch = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      programId: '',
      organization: '',
      instructor: ''
    });
    setShowResults(false);
  };

  // 차트 탭 변경 핸들러
  const handleChartTabChange = (event, newValue) => {
    setActiveChartTab(newValue);
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 검색 결과에 맞는 운영 결과 필터링
  const filteredResults = operationResults.filter(result => {
    const matchesProgram = searchParams.programId ? result.programId === parseInt(searchParams.programId) : true;
    const matchesOrganization = searchParams.organization ? 
      result.organization.toLowerCase().includes(searchParams.organization.toLowerCase()) : true;
    const matchesInstructor = searchParams.instructor ? 
      result.instructor.toLowerCase().includes(searchParams.instructor.toLowerCase()) : true;
      
    // 날짜 범위 필터링
    let matchesDateRange = true;
    if (searchParams.startDate && searchParams.endDate) {
      const resultDate = new Date(result.date);
      const startDate = new Date(searchParams.startDate);
      const endDate = new Date(searchParams.endDate);
      matchesDateRange = resultDate >= startDate && resultDate <= endDate;
    }
    
    return matchesProgram && matchesOrganization && matchesInstructor && matchesDateRange;
  });

  // 통계 계산
  const calculateStats = () => {
    if (filteredResults.length === 0) return null;
    
    const totalParticipants = filteredResults.reduce((sum, result) => sum + result.participantCount, 0);
    const totalSessions = filteredResults.reduce((sum, result) => sum + result.sessionCount, 0);
    const avgSatisfaction = filteredResults.reduce((sum, result) => sum + result.satisfactionScore, 0) / filteredResults.length;
    const avgEffect = filteredResults.reduce((sum, result) => sum + result.effectScore, 0) / filteredResults.length;
    
    // 프로그램별 참여자 수 계산
    const programStats = {};
    filteredResults.forEach(result => {
      const program = programs.find(p => p.id === result.programId)?.name || '알 수 없음';
      
      if (!programStats[program]) {
        programStats[program] = {
          participants: 0,
          sessions: 0,
          satisfaction: 0,
          effect: 0,
          count: 0
        };
      }
      
      programStats[program].participants += result.participantCount;
      programStats[program].sessions += result.sessionCount;
      programStats[program].satisfaction += result.satisfactionScore;
      programStats[program].effect += result.effectScore;
      programStats[program].count += 1;
    });
    
    // 평균 계산
    Object.keys(programStats).forEach(program => {
      programStats[program].satisfaction = programStats[program].satisfaction / programStats[program].count;
      programStats[program].effect = programStats[program].effect / programStats[program].count;
    });
    
    return {
      totalParticipants,
      totalSessions,
      avgSatisfaction,
      avgEffect,
      programStats
    };
  };

  const stats = calculateStats();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 운영통계 검색 및 결과 분석
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 운영통계 검색 및 효과평가 결과 검색 수정</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 연/월통계 내용변경</Typography>
                <Typography>• 입력사항 변경에 따른 결과검색 변경</Typography>
                <Typography>• 영역별/프로그램별 통계&분석 수정</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 운영통계-운영통계, 만족도 및 효과평가 결과검색-주제어별 만족도 및 효과평가</Typography>
                <Typography>• 강사별 통계&분석 추가 가능</Typography>
                <Typography>• 강사별 통계&분석(운영횟수/만족도/효과도점수 등) 표시-변동 항목 만족도 및 효과평가 결과와 연동</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 운영통계-운영통계, 만족도 및 효과평가가 결과검색-주제어별 만족도 및 효과평가 항목 연계</Typography>
                <Typography>• → 라. 데이터 요구사항 DAR-003와 연결</Typography>
                <Typography>• 단체별 만족도 및 효과평가 삭제</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* 검색 필터 */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          검색 조건
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="시작일"
              type="date"
              name="startDate"
              value={searchParams.startDate}
              onChange={handleSearchParamChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="종료일"
              type="date"
              name="endDate"
              value={searchParams.endDate}
              onChange={handleSearchParamChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth>
              <InputLabel>프로그램</InputLabel>
              <Select
                name="programId"
                value={searchParams.programId}
                label="프로그램"
                onChange={handleSearchParamChange}
              >
                <MenuItem value="">전체</MenuItem>
                {programs.map(program => (
                  <MenuItem key={program.id} value={program.id}>{program.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="단체명"
              name="organization"
              value={searchParams.organization}
              onChange={handleSearchParamChange}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              fullWidth
              label="강사명"
              name="instructor"
              value={searchParams.instructor}
              onChange={handleSearchParamChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleResetSearch}
              >
                초기화
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                검색
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 검색 결과 */}
      {showResults && (
        <>
          {/* 결과 요약 카드 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: '#f5f7ff', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    총 참여자 수
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.totalParticipants || 0}명
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    검색 기간 내 모든 프로그램 참여자 수
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: '#f5f7ff', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    총 운영 횟수
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.totalSessions || 0}회
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    검색 기간 내 모든 프로그램 운영 횟수
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: '#f5f7ff', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    평균 만족도
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.avgSatisfaction ? stats.avgSatisfaction.toFixed(1) : 0}점
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    검색 기간 내 모든 프로그램 평균 만족도
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: '#f5f7ff', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    평균 효과성
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.avgEffect ? stats.avgEffect.toFixed(1) : 0}점
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    검색 기간 내 모든 프로그램 평균 효과성
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* 차트 및 상세 테이블 */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeChartTab} onChange={handleChartTabChange}>
                <Tab 
                  icon={<BarChartIcon sx={{ mr: 1 }} />} 
                  label="프로그램별 통계" 
                  id="chart-tab-0" 
                  aria-controls="chart-tabpanel-0" 
                />
                <Tab 
                  icon={<PieChartIcon sx={{ mr: 1 }} />} 
                  label="만족도/효과성 분석" 
                  id="chart-tab-1" 
                  aria-controls="chart-tabpanel-1" 
                />
                <Tab 
                  icon={<TableChartIcon sx={{ mr: 1 }} />} 
                  label="상세 데이터" 
                  id="chart-tab-2" 
                  aria-controls="chart-tabpanel-2" 
                />
              </Tabs>
            </Box>
            
            {/* 프로그램별 통계 */}
            <ChartTabPanel value={activeChartTab} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>프로그램명</TableCell>
                      <TableCell align="right">참여자 수</TableCell>
                      <TableCell align="right">운영 횟수</TableCell>
                      <TableCell align="right">평균 만족도</TableCell>
                      <TableCell align="right">평균 효과성</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats && Object.entries(stats.programStats).map(([program, data]) => (
                      <TableRow key={program} hover>
                        <TableCell>{program}</TableCell>
                        <TableCell align="right">{data.participants}명</TableCell>
                        <TableCell align="right">{data.sessions}회</TableCell>
                        <TableCell align="right">{data.satisfaction.toFixed(1)}점</TableCell>
                        <TableCell align="right">{data.effect.toFixed(1)}점</TableCell>
                      </TableRow>
                    ))}
                    {!stats || Object.keys(stats.programStats).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<FileDownloadIcon />}
                >
                  통계 데이터 다운로드
                </Button>
              </Box>
            </ChartTabPanel>
            
            {/* 만족도/효과성 분석 */}
            <ChartTabPanel value={activeChartTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    프로그램 유형별 만족도/효과성 비교
                  </Typography>
                  
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography>
                      차트 영역 (실제 구현 시 차트 라이브러리로 시각화)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    월별 추이 분석
                  </Typography>
                  
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography>
                      차트 영역 (실제 구현 시 차트 라이브러리로 시각화)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<FileDownloadIcon />}
                >
                  분석 데이터 다운로드
                </Button>
              </Box>
            </ChartTabPanel>
            
            {/* 상세 데이터 */}
            <ChartTabPanel value={activeChartTab} index={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>날짜</TableCell>
                      <TableCell>프로그램</TableCell>
                      <TableCell>단체명</TableCell>
                      <TableCell>강사</TableCell>
                      <TableCell align="right">참여자 수</TableCell>
                      <TableCell align="right">운영 횟수</TableCell>
                      <TableCell align="right">만족도</TableCell>
                      <TableCell align="right">효과성</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map(result => (
                      <TableRow key={result.id} hover>
                        <TableCell>{result.date}</TableCell>
                        <TableCell>
                          {programs.find(p => p.id === result.programId)?.name || '알 수 없음'}
                        </TableCell>
                        <TableCell>{result.organization}</TableCell>
                        <TableCell>{result.instructor}</TableCell>
                        <TableCell align="right">{result.participantCount}명</TableCell>
                        <TableCell align="right">{result.sessionCount}회</TableCell>
                        <TableCell align="right">{result.satisfactionScore.toFixed(1)}점</TableCell>
                        <TableCell align="right">{result.effectScore.toFixed(1)}점</TableCell>
                      </TableRow>
                    ))}
                    {filteredResults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<FileDownloadIcon />}
                >
                  상세 데이터 다운로드
                </Button>
              </Box>
            </ChartTabPanel>
          </Paper>
        </>
      )}
      
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

export default PerformanceTab; 