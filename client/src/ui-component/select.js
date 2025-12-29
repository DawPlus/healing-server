import React from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const SelectComponent = (props) => {
    const { id, name, value, items = [], label, onChange, style } = props;
    
    // 값이 undefined/null인 경우 빈 문자열로 처리
    const safeValue = value !== undefined && value !== null ? value : "";
    
    const handleChange = (event) => {
        if (onChange) {
            onChange({
                target: {
                    name: event.target.name,
                    value: event.target.value
                }
            });
        }
    };

    return (
        <FormControl fullWidth size="small" style={style}>
            <InputLabel id={id}>{label}</InputLabel>
            <Select 
                labelId={id} 
                id={`${id}_select`} 
                value={safeValue} 
                label={label} 
                name={name} 
                onChange={handleChange}
            >
                {items && items.map((i, idx) => (
                    <MenuItem value={i.value} key={idx}>{i.label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SelectComponent;