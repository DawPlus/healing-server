import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  TextField
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import 'moment/locale/ko';
import CalculateIcon from '@mui/icons-material/Calculate';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import Page5Layout from '../Page5/components/Page5Layout';
import { 
  GET_PAGE6_INSTRUCTOR_PAYMENTS, 
  GET_PAGE6_INSTRUCTORS,
  GET_PAGE6_MONTHLY_INSTRUCTOR_SUMMARY
} from './graphql/queries';
import { formatNumber, filterInstructorPayments, calculateInstructorSummary } from './services/dataService';
import { exportInstructorPaymentExcel } from './instructorExcelExport';

// 사업구분 한글 변환 함수
const translateBusinessCategory = (category) => {
  const categoryMap = {
    'social_contribution': '사회공헌',
    'profit_business': '수익사업',
    'preparation': '가예약',
    'default': '일반'
  };
  
  return categoryMap[category] || category;
};

const InstructorPaymentTab = () => {
  // 한국어 로케일 설정
  moment.locale('ko');
  
  // URL 파라미터 처리를 위한 코드
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const nameParam = searchParams.get('name');
  
  // 현재 연도와 월 설정
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [selectedInstructor, setSelectedInstructor] = useState(nameParam || '');
  const [startDate, setStartDate] = useState(moment(`${year}-${month}-01`));
  const [endDate, setEndDate] = useState(moment(`${year}-${month}-01`).endOf('month'));
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  
  // URL 파라미터가 있을 때 자동으로 강사 선택
  useEffect(() => {
    if (nameParam) {
      setSelectedInstructor(nameParam);
      // URL에서 파라미터 제거 (검색 후 파라미터 정리)
      const cleanUrl = window.location.pathname;
      navigate(cleanUrl, { replace: true });
    }
  }, [nameParam, navigate]);
  
  // 연도/월 변경 시 날짜 범위 업데이트
  useEffect(() => {
    if (!useCustomDateRange) {
      setStartDate(moment(`${year}-${month}-01`));
      setEndDate(moment(`${year}-${month}-01`).endOf('month'));
    }
  }, [year, month, useCustomDateRange]);
  
  // 강사 목록 가져오기
  const {
    loading: loadingInstructors,
    error: errorInstructors,
    data: instructorsData
  } = useQuery(GET_PAGE6_INSTRUCTORS, {
    fetchPolicy: 'network-only'
  });
  
  // 강사비 지급 정보 가져오기
  const {
    loading: loadingPayments,
    error: errorPayments,
    data: paymentsData,
    refetch: refetchPayments
  } = useQuery(GET_PAGE6_INSTRUCTOR_PAYMENTS, {
    variables: useCustomDateRange 
      ? {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          instructorName: selectedInstructor
        }
      : {
      year,
      month,
      instructorName: selectedInstructor
    },
    fetchPolicy: 'network-only'
  });
  
  // 월별 요약 정보 가져오기
  const {
    loading: loadingSummary,
    error: errorSummary,
    data: summaryData,
    refetch: refetchSummary
  } = useQuery(GET_PAGE6_MONTHLY_INSTRUCTOR_SUMMARY, {
    variables: useCustomDateRange
      ? {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      : {
      year,
      month
    },
    fetchPolicy: 'network-only'
  });
  
  // 강사 선택 변경 핸들러
  const handleInstructorChange = (event) => {
    setSelectedInstructor(event.target.value);
  };
  
  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (isCustom) => {
    setUseCustomDateRange(isCustom);
    if (!isCustom) {
      // 월 단위로 돌아가기
      setStartDate(moment(`${year}-${month}-01`));
      setEndDate(moment(`${year}-${month}-01`).endOf('month'));
    }
  };
  
  // 시작일 변경 핸들러
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    // 시작일이 종료일보다 뒤면 종료일도 같이 변경
    if (newDate.isAfter(endDate)) {
      setEndDate(newDate);
    }
  };
  
  // 종료일 변경 핸들러
  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    // 종료일이 시작일보다 앞이면 시작일도 같이 변경
    if (newDate.isBefore(startDate)) {
      setStartDate(newDate);
    }
  };
  
  // 날짜 변경시 데이터 다시 가져오기
  useEffect(() => {
    refetchPayments();
    refetchSummary();
  }, [year, month, startDate, endDate, useCustomDateRange, refetchPayments, refetchSummary]);
  
  // PDF 생성 및 인쇄
  const handlePrint = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // 제목
      doc.setFontSize(16);
      // 날짜 범위 문자열 생성
      const dateRangeStr = useCustomDateRange
        ? `${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')}`
        : `${year}년 ${month}월`;
      
      doc.text(`${dateRangeStr} 강사비&헬퍼활동비 지급 요청(3회차)`, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // 날짜
      doc.setFontSize(10);
      const today = moment().format('YYYY/MM/DD');
      doc.text(`지급일 : ${today}`, doc.internal.pageSize.getWidth() - 20, 15, { align: 'right' });
      
      // 테이블 헤더
      const headers = [
        ['구분', '강사', '강사구분', '단체', '사업구분', '프로그램명', '일자', '시간', '강사비(세전)', '강사비(세후)', '보조강사', '보조강사 활동비', '힐링헬퍼', '힐링헬퍼 활동비', '지급액']
      ];
      
      // 테이블 데이터
      const payments = paymentsData?.getInstructorPayments || [];
      const tableData = payments.map(item => [
        item.instructor_category,
        item.instructor_name,
        item.instructor_type,
        item.organization,
        translateBusinessCategory(item.business_category),
        item.program_name,
        `${item.day}일(${item.weekday})`,
        item.time,
        formatNumber(item.payment_amount),
        formatNumber(item.payment_amount - item.tax_amount),
        item.assistant_instructor_name || '-',
        formatNumber(item.assistant_instructor_fee || 0),
        item.healing_helper_name || '-',
        formatNumber(item.healing_helper_fee || 0),
        formatNumber(item.final_amount + (item.assistant_instructor_fee || 0) + (item.healing_helper_fee || 0))
      ]);
      
      // 합계 행
      const summary = summaryData?.getMonthlyInstructorSummary || calculateInstructorSummary(payments);
      tableData.push([
        '합계', '', '', '', '', '', '', '', 
        formatNumber(summary.total_amount), formatNumber(summary.total_amount - summary.total_tax), 
        '-', formatNumber(summary.total_assistant_fee || 0),
        '-', formatNumber(summary.total_helper_fee || 0),
        formatNumber(summary.total_final_amount + (summary.total_assistant_fee || 0) + (summary.total_helper_fee || 0))
      ]);
      
      // 테이블 렌더링
      doc.autoTable({
        head: headers,
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 220, 240], textColor: 0, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 12 }, // 구분
          1: { cellWidth: 15 }, // 강사
          2: { cellWidth: 15 }, // 강사구분
          3: { cellWidth: 20 }, // 단체
          4: { cellWidth: 15 }, // 사업구분
          5: { cellWidth: 22 }, // 프로그램명
          6: { cellWidth: 15 }, // 일자
          7: { cellWidth: 15 }, // 시간
          8: { cellWidth: 8, halign: 'center' }, // 강사비(세전)
          9: { cellWidth: 15, halign: 'right' }, // 강사비(세후)
          10: { cellWidth: 15 }, // 보조강사
          11: { cellWidth: 15, halign: 'right' }, // 보조강사 활동비
          12: { cellWidth: 15 }, // 힐링헬퍼
          13: { cellWidth: 15, halign: 'right' }, // 힐링헬퍼 활동비
          14: { cellWidth: 15, halign: 'right' } // 지급액
        },
        didDrawCell: (data) => {
          // 합계 행 강조
          if (data.section === 'body' && data.row.index === tableData.length - 1) {
            doc.setFillColor(240, 240, 240);
            doc.setTextColor(0, 0, 0);
            doc.setFontStyle('bold');
          }
        }
      });
      
      // PDF 저장
      const fileName = useCustomDateRange
        ? `강사비_${selectedInstructor || '전체'}_${startDate.format('YYYYMMDD')}_${endDate.format('YYYYMMDD')}.pdf`
        : `강사비_${selectedInstructor || '전체'}_${year}${month.toString().padStart(2, '0')}.pdf`;
      
      doc.save(fileName);
      
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };
  
  // 엑셀 내보내기
  const handleFormattedExcelExport = () => {
    try {
      const success = exportInstructorPaymentExcel(
        paymentsData, 
        year, 
        month, 
        useCustomDateRange ? {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        } : null
      );
      if (success) {
        alert('강사비 지급 내역이 엑셀 파일로 저장되었습니다.');
      } else {
        throw new Error('엑셀 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      alert(`엑셀 내보내기 오류: ${error.message}`);
    }
  };
  
  // 로딩 중 표시
  if (loadingInstructors) {
    return (
      <Page5Layout
        title="강사비 정산"
        icon={<CalculateIcon fontSize="large" />}
        activeTab="instructor-payment"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Page5Layout>
    );
  }
  
  // 오류 표시
  if (errorInstructors) {
    return (
      <Page5Layout
        title="강사비 정산"
        icon={<CalculateIcon fontSize="large" />}
        activeTab="instructor-payment"
      >
        <Alert severity="error">
          강사 목록을 불러오는 중 오류가 발생했습니다: {errorInstructors.message}
        </Alert>
      </Page5Layout>
    );
  }
  
  const payments = paymentsData?.getInstructorPayments || [];
  const summary = summaryData?.getMonthlyInstructorSummary || calculateInstructorSummary(payments);
  
  return (
    <Page5Layout
      title="강사비 정산"
      icon={<CalculateIcon fontSize="large" />}
      activeTab="instructor-payment"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
        {/* 상단 선택 영역 */}
        <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={12} md={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <FormControl component="fieldset">
                  <Grid container spacing={1} alignItems="center">
                    <Grid item>
                      <Button
                        variant={!useCustomDateRange ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() => handleDateRangeChange(false)}
                      >
                        월별 검색
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={useCustomDateRange ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() => handleDateRangeChange(true)}
                      >
                        기간별 검색
                      </Button>
                    </Grid>
                  </Grid>
                </FormControl>
              </Box>
            </Grid>
            
            {!useCustomDateRange ? (
              // 월별 검색 UI
              <>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="연도"
                type="number"
                size="small"
                fullWidth
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                margin="dense"
                InputProps={{ inputProps: { min: 2020, max: 2030 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="월"
                type="number"
                size="small"
                fullWidth
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                margin="dense"
                InputProps={{ inputProps: { min: 1, max: 12 } }}
              />
            </Grid>
              </>
            ) : (
              // 기간별 검색 UI
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      label="시작일"
                      value={startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          margin="dense"
                          fullWidth
                        />
                      )}
                      inputFormat="YYYY-MM-DD"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      label="종료일"
                      value={endDate}
                      onChange={handleEndDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          margin="dense"
                          fullWidth
                        />
                      )}
                      inputFormat="YYYY-MM-DD"
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} md={useCustomDateRange ? 5 : 5}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>강사</InputLabel>
                <Select
                  value={selectedInstructor}
                  onChange={handleInstructorChange}
                  label="강사"
                >
                  <MenuItem value="">전체 보기</MenuItem>
                  {instructorsData?.getInstructors?.map(instructor => (
                    <MenuItem key={instructor.id} value={instructor.name}>
                      {instructor.name} ({instructor.type || '일반'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
         
              <Button
                variant="contained"
                color="success"
                startIcon={<TableChartIcon />}
                onClick={handleFormattedExcelExport}
                sx={{ ml: 1 }}
                disabled={payments.length === 0}
                size="small"
              >
                강사비 지급내역 엑셀 다운로드(11번 항목) 
              </Button>
           
            </Grid>
          </Grid>
        </Paper>
        
        {/* 요약 정보 카드 영역 */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              backgroundColor: '#f5f9ff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              borderRadius: 1 
            }}>
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>총 지급액</Typography>
                </Box>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 0.5 }}>
                  {formatNumber(summary.total_final_amount)}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  세금 차감 후 금액
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              backgroundColor: '#f9f5ff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              borderRadius: 1 
            }}>
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <PersonIcon color="secondary" sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>강사 인원</Typography>
                </Box>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', my: 0.5 }}>
                  {summary.instructor_count}명
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  활동 강사 총원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              backgroundColor: '#f5fff9',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              borderRadius: 1 
            }}>
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <CalendarTodayIcon color="success" sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>활동 횟수</Typography>
                </Box>
                <Typography variant="h6" color="success" sx={{ fontWeight: 'bold', my: 0.5 }}>
                  {summary.session_count}회
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {year}년 {month}월 전체
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              backgroundColor: '#fff9f5',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              borderRadius: 1 
            }}>
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <CalculateIcon color="warning" sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>공제 세금</Typography>
                </Box>
                <Typography variant="h6" color="warning" sx={{ fontWeight: 'bold', my: 0.5 }}>
                  {formatNumber(summary.total_tax)}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  소득세, 주민세 포함
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* 메인 테이블 영역 */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {loadingPayments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : errorPayments ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              강사비 지급 정보를 불러오는 중 오류가 발생했습니다: {errorPayments.message}
            </Alert>
          ) : payments.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {selectedInstructor 
                ? `${selectedInstructor} 강사의 활동 정보가 없습니다.` 
                : `${year}년 ${month}월에 해당하는 강사비 지급 정보가 없습니다.`}
            </Alert>
          ) : (
            <Paper 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                px: 1.5, 
                py: 1,
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {useCustomDateRange 
                    ? `${startDate.format('YYYY년 MM월 DD일')} ~ ${endDate.format('YYYY년 MM월 DD일')} 강사비&헬퍼활동비 지급 요청(3회차)`
                    : `${year}년 ${month}월 강사비&헬퍼활동비 지급 요청(3회차)`}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  지급일 : {moment().format('YYYY/MM/DD')}(금)
        </Typography>
              </Box>
              
              <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100% - 45px)' }}>
                <Table stickyHeader size="small" sx={{ border: '1px solid #e0e0e0' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>구분</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>강사</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>강사구분</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '90px', border: '1px solid #e0e0e0' }}>단체</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>사업구분</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '90px', border: '1px solid #e0e0e0' }}>프로그램명</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>일자</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>시간</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>강사비(세전)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>강사비(세후)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>보조강사</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '80px', border: '1px solid #e0e0e0', whiteSpace: 'nowrap' }}>보조강사 활동비</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>힐링헬퍼</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '80px', border: '1px solid #e0e0e0', whiteSpace: 'nowrap' }}>힐링헬퍼 활동비</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', p: 0.5, fontSize: '0.75rem', width: '60px', border: '1px solid #e0e0e0' }}>지급액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((item, index) => (
                      <TableRow 
                        key={item.id}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.instructor_category}</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.instructor_name}</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.instructor_type}</TableCell>
                        <TableCell sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.organization}</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{translateBusinessCategory(item.business_category)}</TableCell>
                        <TableCell sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.program_name}</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.day}일({item.weekday})</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.time}</TableCell>
                        <TableCell align="right" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(item.payment_amount)}</TableCell>
                        <TableCell align="right" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(item.payment_amount - item.tax_amount)}</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.assistant_instructor_name || '-'}</TableCell>
                        <TableCell align="right" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(item.assistant_instructor_fee || 0)}</TableCell>
                        <TableCell align="center" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{item.healing_helper_name || '-'}</TableCell>
                        <TableCell align="right" sx={{ p: 0.5, fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(item.healing_helper_fee || 0)}</TableCell>
                        <TableCell align="right" sx={{ p: 0.5, fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #e0e0e0' }}>{formatNumber(item.final_amount + (item.assistant_instructor_fee || 0) + (item.healing_helper_fee || 0))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ backgroundColor: '#edf7ff', fontWeight: 'bold' }}>
                      <TableCell align="center" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }} colSpan={7}>합계</TableCell>
                      <TableCell align="center" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{summary.session_count}</TableCell>
                      <TableCell align="right" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(summary.total_amount)}</TableCell>
                      <TableCell align="right" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(summary.total_amount - summary.total_tax)}</TableCell>
                      <TableCell align="center" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>-</TableCell>
                      <TableCell align="right" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(summary.total_assistant_fee || 0)}</TableCell>
                      <TableCell align="center" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>-</TableCell>
                      <TableCell align="right" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #e0e0e0' }}>{formatNumber(summary.total_helper_fee || 0)}</TableCell>
                      <TableCell align="right" sx={{ p: 0.5, fontWeight: 'bold', fontSize: '0.75rem', color: '#ff1744', border: '1px solid #e0e0e0' }}>{formatNumber(summary.total_final_amount + (summary.total_assistant_fee || 0) + (summary.total_helper_fee || 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
      </Paper>
          )}
        </Box>
    </Box>
    </Page5Layout>
  );
};

export default InstructorPaymentTab; 