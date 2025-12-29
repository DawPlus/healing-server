import React, { memo } from "react";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


// SELECT COMPONENT 
const SelectComponent = (props) => {

    const { label, name, checked, onChange,  ...res} = props;

    

    return (
        <FormControlLabel control={
            <Checkbox 
                name={name}
                checked={checked}
                onChange={onChange} 
                {...res}
            />
        } label={label} />
    );
};

export default memo(SelectComponent);
