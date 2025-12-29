import React, { useMemo } from 'react';
import { FormControl, OutlinedInput, InputLabel } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const PositiveNumberInput = ({ label, value, onChange, name, maxLength = 3, ...props }) => {
  const id = useMemo(() => uuidv4(), []);

  const handleChange = (event) => {
    const numericValue = event.target.value.replace(/[^0-9.]/g, '');

    if (numericValue === '') {
      onChange(name, '');
    } else if (maxLength !== undefined && numericValue.length <= maxLength) {
      const parsedValue = parseFloat(numericValue);
      onChange(name, parsedValue);
    }
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        {...props}
        type="text"
        value={value}
        onChange={handleChange}
      />
    </FormControl>
  );
};

export default PositiveNumberInput;
