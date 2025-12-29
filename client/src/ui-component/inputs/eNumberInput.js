import React, { useMemo } from 'react';
import { FormControl, OutlinedInput, InputLabel } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const PositiveNumberInput = ({ label, value, onChange, name }) => {
  const id = useMemo(() => uuidv4(), []);

  const handleChange = (event) => {
    try {
      const numericValue = event.target.value.replace(/[^0-9.]/g, '');

      if (numericValue === '') {
        if (onChange && typeof onChange === 'function') {
          onChange({ target: { name, value: '' } });
        }
      } else {
        // Parse the numericValue as a float
        const parsedValue = parseFloat(numericValue);
        
        // Check if parsedValue is within the range of 0 to 6
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 6) {
          // Convert back to string before passing to onChange
          if (onChange && typeof onChange === 'function') {
            onChange({ target: { name, value: String(parsedValue) } });
          }
        }
      }
    } catch (error) {
      console.error('eNumberInput: Error in handleChange:', error);
    }
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        type="text"
        value={value}
        onChange={handleChange}
      />
    </FormControl>
  );
};

export default PositiveNumberInput;
