import React, { memo, useMemo } from "react";
import { FormControl, OutlinedInput, InputLabel } from '@mui/material';
import { v4 as uuidv4 } from "uuid";

const InputComponent = (props) => {
    const { label, name, value, type ="text", ...res } = props;

    const id = useMemo(() => uuidv4(), []);

    return (
        <FormControl fullWidth size="small" >
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <OutlinedInput
                id={id}
                type={type}
                name={name}
                value={value}
                label={label}
                {...res}
            />
        </FormControl>
    );
};

export default memo(InputComponent);
