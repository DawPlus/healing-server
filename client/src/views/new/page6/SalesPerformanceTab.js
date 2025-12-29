import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const SalesPerformanceTab = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <MonetizationOnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>매출실적</Typography>
        <Typography variant="body1" color="textSecondary">
          이 탭은 매출실적을 위한 공간입니다. 필요한 기능을 추가로 구현해 주세요.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SalesPerformanceTab; 