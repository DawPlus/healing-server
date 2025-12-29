import React, {memo, useMemo} from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { v4  } from "uuid";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        },
    },
};
function getStyles(name, value, theme) {
    return {
        fontWeight:
        value.indexOf(name) === -1
            ? theme.typography.fontWeightRegular
            : theme.typography.fontWeightMedium,
    };
}

const MultiSelectChip = (props) => {

    const {options = [],  label, onChange , value = []} =props;
    const id = useMemo(() => v4(), []);
    const theme = useTheme();
    

    const handleChange = (event) => {
        const { target: { value } } = event;
        onChange(typeof value === 'string' ? value.split(',') : value )
    };

    return (
        
        <FormControl fullWidth size="small">
            <InputLabel id={id}>{label}</InputLabel>
            <Select
                labelId={id}
                multiple
                value={value}
                onChange={handleChange}
                input={<OutlinedInput id={id} label={label} />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected && selected.map((value) => (
                            <Chip key={value} label={value} />
                        ))}
                    </Box>
                )}  MenuProps={MenuProps} >
            {options && options.map((name) => (
                <MenuItem key={name} value={name} style={getStyles(name, value, theme)} >
                    {name}
                </MenuItem>
            ))}
            </Select>
        </FormControl>
        
    );
}
export default memo(MultiSelectChip);