import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import XLSX from 'xlsx-js-style';
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Select,
  Typography,
  TextField,
  InputAdornment,
  Fade,
  Card,
  Divider,
  useTheme,
  Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MainCard from 'ui-component/cards/MainCard';
import { headerStyle, defaultStyle } from 'utils/utils';
import { GET_PREVENT_EFFECTIVENESS } from 'graphql/effectiveness';

const EffectivenessEvaluation = () => {
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  
  // Years for dropdown
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 2020; i <= currentYear; i++) {
    years.push(i);
  }
  
  // GraphQL query - skip: true means we don't run this query on component mount
  const { loading, error, refetch } = useQuery(GET_PREVENT_EFFECTIVENESS, {
    variables: { year },
    skip: true
  });
  
  // Download excel function
  const downloadExcel = async () => {
    setIsLoading(true);
    
    try {
      // Execute the GraphQL query with the selected year
      const { data } = await refetch({ year });
      
      if (!data || !data.getPreventEffectiveness || data.getPreventEffectiveness.length === 0) {
        alert(`${year}년도에 해당하는 데이터가 없습니다.`);
        setIsLoading(false);
        return;
      }
      
      // Process the data for Excel
      const preventData = data.getPreventEffectiveness;
      const processedData = preventData.map((item, index) => {
        // Parse the openday to get year, month, day
        const date = item.openday ? new Date(item.openday) : new Date();
        const evalDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        return {
          단체명: item.agency || '',
          시작일자: item.openday || evalDate,
          실시일자: evalDate,
          이름: item.name || '',
          성별: item.sex || '',
          연령: item.age || '',
          시점: item.pv || '',
          거주지: item.residence || '',
          직업: item.job || '',
          문항1: item.score1 || '',
          문항2: item.score2 || '',
          문항3: item.score3 || '',
          문항4: item.score4 || '',
          문항5: item.score5 || '',
          문항6: item.score6 || '',
          문항7: item.score7 || '',
          문항8: item.score8 || '',
          문항9: item.score9 || '',
          문항10: item.score10 || '',
          문항11: item.score11 || '',
          문항12: item.score12 || '',
          문항13: item.score13 || '',
          문항14: item.score14 || '',
          문항15: item.score15 || '',
          문항16: item.score16 || '',
          문항17: item.score17 || '',
          문항18: item.score18 || '',
          문항19: item.score19 || '',
          문항20: item.score20 || ''
        };
      });
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create sheet header with the unified format - exactly matching the specified format
      const header = [
        ["단체명", "시작일자", "실시일자", "이름", "성별", "연령", "시점", "거주지", "직업", 
        "문항1", "문항2", "문항3", "문항4", "문항5", "문항6", "문항7", "문항8", "문항9", "문항10", 
        "문항11", "문항12", "문항13", "문항14", "문항15", "문항16", "문항17", "문항18", "문항19", "문항20"]
      ];
      
      // Format header with styles
      const formattedHeader = header.map(row => 
        row.map(cell => ({ v: cell, t: 's', s: headerStyle }))
      );
      
      // Format row data with styles
      const formattedData = processedData.map(row => 
        Object.values(row).map(cell => ({ v: cell, t: 's', s: defaultStyle }))
      );
      
      // Create worksheet with headers and data
      const ws = XLSX.utils.aoa_to_sheet([...formattedHeader, ...formattedData]);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // 단체명
        { wch: 15 }, // 시작일자
        { wch: 15 }, // 실시일자
        { wch: 15 }, // 이름
        { wch: 8 },  // 성별
        { wch: 8 },  // 연령
        { wch: 8 },  // 시점
        { wch: 15 }, // 거주지
        { wch: 15 }, // 직업
        { wch: 10 }, // 문항1
        { wch: 10 }, // 문항2
        { wch: 10 }, // 문항3
        { wch: 10 }, // 문항4
        { wch: 10 }, // 문항5
        { wch: 10 }, // 문항6
        { wch: 10 }, // 문항7
        { wch: 10 }, // 문항8
        { wch: 10 }, // 문항9
        { wch: 10 }, // 문항10
        { wch: 10 }, // 문항11
        { wch: 10 }, // 문항12
        { wch: 10 }, // 문항13
        { wch: 10 }, // 문항14
        { wch: 10 }, // 문항15
        { wch: 10 }, // 문항16
        { wch: 10 }, // 문항17
        { wch: 10 }, // 문항18
        { wch: 10 }, // 문항19
        { wch: 10 }  // 문항20
      ];
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `예방서비스효과평가_${year}`);
      
      // Write to file and trigger download
      XLSX.writeFile(wb, `예방서비스효과평가_${year}.xlsx`);
    } catch (error) {
      console.error('Excel download error:', error);
      alert('엑셀 파일 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainCard 
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <AssessmentOutlinedIcon color="primary" />
          <Typography variant="h3">효과성 평가</Typography>
        </Stack>
      } 
      content={false}
      sx={{
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardContent>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            background: theme.palette.primary.light, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.primary.lighter}`
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h5" color="primary.dark" sx={{ fontWeight: 500, minWidth: 100 }}>
                  연도 선택
                </Typography>
                <TextField
                  select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: theme.palette.primary.lighter
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main
                      }
                    }
                  }}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}년
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Button 
                variant="contained" 
                onClick={downloadExcel}
                disabled={isLoading || loading}
                size="large"
                startIcon={<DownloadIcon />}
                fullWidth
                sx={{
                  py: 1.5,
                  boxShadow: '0 4px 8px rgba(103, 58, 183, 0.3)',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: '0 6px 12px rgba(103, 58, 183, 0.4)'
                  }
                }}
              >
                {isLoading ? "처리 중..." : "데이터 다운로드"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Fade in={true} timeout={500}>
          <Card 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h2" 
                gutterBottom
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                예방효과(스마트폰)
              </Typography>
              <Divider sx={{ my: 3, width: '50%', mx: 'auto', borderColor: theme.palette.primary.lighter }} />
            </Box>
            
            <Box sx={{ p: 2, mb: 4 }}>
              <Stack 
                direction="row" 
                alignItems="flex-start" 
                spacing={1} 
                sx={{ mb: 2, color: theme.palette.text.secondary }}
              >
                <InfoOutlinedIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />
                <Typography variant="body1" align="left">
                  선택한 연도의 예방효과(스마트폰) 데이터를 엑셀 파일로 다운로드합니다.
                </Typography>
              </Stack>
         
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                {(isLoading || loading) && (
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                )}
              </Box>
            </Box>
          </Card>
        </Fade>
      </CardContent>
    </MainCard>
  );
};

export default EffectivenessEvaluation; 