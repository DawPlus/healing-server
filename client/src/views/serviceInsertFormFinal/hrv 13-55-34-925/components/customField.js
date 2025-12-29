import React, { useMemo } from 'react';
import { FormControl, OutlinedInput, InputLabel, MenuItem, Select, TextField, TableCell } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const genderOptions = [
    { label: '남', value: '남' },
    { label: '여', value: '여' },
    { label: '미기재', value: '미기재' }
];

const CustomField = ({ type, label, name, onChange, value, idx }) => {
    const id = useMemo(() => uuidv4(), []);
    
    const handleChange = (e) => {
        if (onChange && typeof onChange === 'function') {
            onChange({
                target: {
                    name: e.target.name || name,
                    value: e.target.value
                }
            });
        }
    };
    
    const handleNumberChange = (e) => {
        let inputValue = e.target.value;
        
        // Special handling for ID and HRV_SEQ fields - only integers allowed
        if (name === "ID" || name === "HRV_SEQ") {
            inputValue = inputValue.replace(/[^0-9]/g, '');
        }
        // For age and jumin fields - only allow numbers
        else if (type === 'age' || type === 'jumin') {
            inputValue = inputValue.replace(/[^0-9]/g, '');
            
            // Apply length restriction for jumin
            if (type === 'jumin' && inputValue.length > 6) {
                inputValue = inputValue.slice(0, 6);
            }
        }
        // For numeric fields (NUM1-NUM8), allow numbers and decimal points
        else if (name.startsWith('NUM')) {
            inputValue = inputValue.replace(/[^0-9.]/g, '');
            
            // Ensure only one decimal point
            const decimalCount = (inputValue.match(/\./g) || []).length;
            if (decimalCount > 1) {
                const firstDecimalIndex = inputValue.indexOf('.');
                inputValue = inputValue.substring(0, firstDecimalIndex + 1) + 
                             inputValue.substring(firstDecimalIndex + 1).replace(/\./g, '');
            }
        }
        
        onChange({
            target: {
                name: e.target.name,
                value: inputValue
            }
        });
    };
    
    if (type === 'select') {
        return (
            <TableCell>
                <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel id={`${id}-label`}>{label}</InputLabel>
                    <Select
                        labelId={`${id}-label`}
                        id={id}
                        value={value || ''}
                        name={name}
                        label={label}
                        onChange={handleChange}
                    >
                        {genderOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </TableCell>
        );
    } else if (type === 'age' || type === 'jumin') {
        return (
            <TableCell>
                <FormControl fullWidth size="small">
                    <InputLabel htmlFor={id}>{label}</InputLabel>
                    <OutlinedInput
                        id={id}
                        name={name}
                        value={value || ''}
                        onChange={handleNumberChange}
                        label={label}
                    />
                </FormControl>
            </TableCell>
        );
    } else {
        // Check if this is a numeric field (NUM1-NUM8)
        const isNumericField = name.startsWith('NUM');
        const changeHandler = isNumericField ? handleNumberChange : handleChange;
        
        return (
            <TableCell>
                <TextField 
                    size="small" 
                    label={label}
                    value={value || ''} 
                    name={name} 
                    onChange={changeHandler} 
                    fullWidth
                    variant="outlined"
                />
            </TableCell>
        );
    }
};

export default CustomField; 