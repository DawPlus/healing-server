import React from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * SetValue component for managing row operations
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAdd - Function to add a new row
 * @param {Function} props.onRemove - Function to remove selected rows
 * @param {Function} props.onSetData - Function to handle bulk data updates
 * @param {React.ReactNode} props.children - Child components
 */
const SetValue = ({ onAdd, onRemove, onSetData, children }) => {
  const handleAdd = () => {
    onAdd();
  };

  const handleRemove = () => {
    onRemove();
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAdd}
          startIcon={<AddIcon />}
          sx={{ minWidth: '120px', borderRadius: '4px' }}
        >
          행 추가
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleRemove}
          startIcon={<DeleteIcon />}
          sx={{ minWidth: '120px', borderRadius: '4px' }}
        >
          행 삭제
        </Button>
      </Stack>
      
      {children && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default SetValue; 