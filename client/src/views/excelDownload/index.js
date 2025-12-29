import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import moment from 'moment';
import XLSX from 'xlsx-js-style';
import { defaultStyle, headerStyle } from 'utils/utils';
import DatePicker from 'ui-component/inputs/datePicker';
import { 
  Button, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  Card, 
  CardContent, 
  Divider, 
  Stack, 
  useTheme, 
  Fade,
  CircularProgress
} from '@mui/material';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EXCEL_PROGRAM_LIST } from 'graphql/queries';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import ExcelJS from 'exceljs';

// 시트 생성 함수들 import
import { createSheet1 } from './sheets/sheet1';
import { createSheet2 } from './sheets/sheet2';
import { createSheet3 } from './sheets/sheet3';
import { createSheet4 } from './sheets/sheet4';
import { createSheet5 } from './sheets/sheet5';
import { createSheet6 } from './sheets/sheet6';
import { createSheet7 } from './sheets/sheet7';
import { createSheet8 } from './sheets/sheet8';
import { createSheet9 } from './sheets/sheet9';
import { createSheet10 } from './sheets/sheet10';
import { createSheet11 } from './sheets/sheet11';

const ExcelDownload = () => {
  const theme = useTheme();
  const [openday, setOpenday] = useState('');
  const [endday, setEndday] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Console log to debug the state values
  console.log('State values:', { openday, endday, isLoading });

  // Handle date change using the correct parameter structure
  const handleDateChange = (name, value) => {
    console.log(`Date change: ${name} = ${value}`);
    if (name === 'startDate') {
      setOpenday(value);
    } else if (name === 'endDate') {
      setEndday(value);
    }
  };

  // GraphQL 쿼리를 준비만 하고 즉시 실행하지는 않음
  const { refetch } = useQuery(GET_EXCEL_PROGRAM_LIST, {
    skip: true, // 초기에는 쿼리를 실행하지 않음
    variables: { openday, endday },
    notifyOnNetworkStatusChange: true,
  });

  const onClick = async () => {
    if (!openday || !endday) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      // GraphQL 쿼리 실행
      const { data } = await refetch({ openday, endday });
      
      // 응답에서 데이터 추출
      const {
        sheet1,
        sheet2,
        sheet3,
        sheet4,
        sheet5,
        sheet6,
        sheet7,
        sheet8,
        sheet9,
        sheet10,
        sheet11,
      } = data.excelProgramList;

      // Excel WorkBook 선언
      const workbook = new ExcelJS.Workbook();
      const todayInfo = moment().format('YYYY-MM-DD');

      // 스타일 정의
      const defaultStyle = {
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        font: { size: 10, name: '굴림', color: { argb: 'FF364152' } },
        border: {
          top: { style: 'thin', color: { argb: 'FF666666' } },
          left: { style: 'thin', color: { argb: 'FF666666' } },
          bottom: { style: 'thin', color: { argb: 'FF666666' } },
          right: { style: 'thin', color: { argb: 'FF666666' } }
        }
      };

      const headerStyle = {
        ...defaultStyle,
        font: { ...defaultStyle.font, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
      };

      // 각 시트 생성
      await createSheet1(workbook, sheet1, defaultStyle, headerStyle);
      await createSheet2(workbook, sheet2, defaultStyle, headerStyle);
      await createSheet3(workbook, sheet3, defaultStyle, headerStyle);
      await createSheet4(workbook, sheet4, defaultStyle, headerStyle);
      await createSheet5(workbook, sheet5, defaultStyle, headerStyle);
      await createSheet6(workbook, sheet6, defaultStyle, headerStyle);
      await createSheet7(workbook, sheet7, defaultStyle, headerStyle);
      await createSheet8(workbook, sheet8, defaultStyle, headerStyle);
      await createSheet9(workbook, sheet9, defaultStyle, headerStyle);
      await createSheet10(workbook, sheet10, defaultStyle, headerStyle);
      await createSheet11(workbook, sheet11, defaultStyle, headerStyle);
      
      // 최종 엑셀 파일 생성 및 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `실적통합_${openday}_${endday}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Excel 다운로드 오류:', error);
      alert('엑셀 파일 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainCard 
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <TableChartOutlinedIcon color="primary" />
          <Typography variant="h3">엑셀 데이터 다운로드</Typography>
        </Stack>
      } 
      contentSX={{
        padding: 3,
        backgroundColor: (theme) => theme.palette.background.default
      }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          background: (theme) => theme.palette.primary.light, 
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.primary.lighter}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Typography variant="h5" color="primary.dark" sx={{ fontWeight: 500, mb: 1 }}>
                기간 선택
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <DatePicker
                    label="시작일"
                    value={openday}
                    name="startDate"
                    onChange={handleDateChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1
                      }
                    }}
                  />
                </Box>
                <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>~</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <DatePicker
                    label="종료일"
                    value={endday}
                    name="endDate"
                    onChange={handleDateChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems="center">
            <Button 
              variant="contained" 
                color="primary"
                size="large"
                startIcon={!isLoading ? <FileDownloadIcon /> : <CircularProgress size={20} color="inherit" />}
              onClick={onClick}
                disabled={isLoading}
              sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  minWidth: 160,
                  background: (theme) => theme.palette.primary.main,
                '&:hover': {
                    background: (theme) => theme.palette.primary.dark,
                }
              }}
            >
                {isLoading ? '다운로드 중...' : '엑셀 다운로드'}
            </Button>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                선택한 기간의 데이터를 엑셀로 다운로드합니다
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        {/* 안내 카드 */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <InfoOutlinedIcon color="info" />
                  <Typography variant="h6" color="info.main">다운로드 안내</Typography>
                </Stack>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • 시작일과 종료일을 모두 선택해주세요
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 다운로드 완료까지 잠시 기다려주세요
          </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 여러 시트로 구성된 통합 보고서가 생성됩니다
            </Typography>
          </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 시트 구성 카드 */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TableChartOutlinedIcon color="primary" />
                  <Typography variant="h6" color="primary.main">시트 구성</Typography>
                </Stack>
                <Divider />
                                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • 예약 현황 • 프로그램 예약현황 • 운영현황
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 프로그램 현황 • 강사 운영현황 • 시설서비스 만족도
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 효과성분석(힐링효과) • 기타 프로그램 현황
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 효과성분석(예방효과) • 효과성분석(상담치유)
            </Typography>
                </Stack>
              </Stack>
            </CardContent>
      </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default ExcelDownload;
