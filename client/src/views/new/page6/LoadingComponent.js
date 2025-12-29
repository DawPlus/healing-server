import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingComponent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', my: 3, py: 4 }}>
    <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
    <Typography variant="body1" color="textSecondary">데이터를 불러오는 중입니다...</Typography>
  </Box>
);

export default LoadingComponent; 