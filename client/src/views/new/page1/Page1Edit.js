import React from 'react';
import { Box } from '@mui/material';
import Edit from './Edit';

const Page1Edit = ({ id, isEmbedded = false, onDataUpdate }) => {
  return (
    <Box>
      <Edit overrideId={id} isEmbedded={isEmbedded} onDataUpdate={onDataUpdate} />
    </Box>
  );
};

export default Page1Edit; 