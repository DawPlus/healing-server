import React, { useMemo } from 'react';
import { FormControl, OutlinedInput, InputLabel } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const CounselNumberInput = ({ label, value, onChange, name, maxLength = 1 }) => {
  const id = useMemo(() => uuidv4(), []);

  const handleChange = (event) => {
    // 입력값 가져오기
    let inputValue = event.target.value;
    
    // 숫자만 허용하고 0-6 범위 내로 제한
    inputValue = inputValue.replace(/[^0-6]/g, '');
    
    // 최대 길이 제한
    if (inputValue.length > maxLength) {
      inputValue = inputValue.slice(0, maxLength);
    }
    
    // 변경된 값을 문자열로 전달
    if (onChange) {
      onChange({
        target: {
          name,
          value: inputValue
        }
      });
    }
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        id={id}
        name={name}
        type="text"
        value={value || ''}
        onChange={handleChange}
        inputProps={{ maxLength }}
      />
    </FormControl>
  );
};

export default CounselNumberInput; 