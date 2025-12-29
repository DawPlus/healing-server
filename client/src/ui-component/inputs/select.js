import React, { memo, useMemo } from "react";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { v4 as uuidv4 } from "uuid";

// SELECT COMPONENT 
const SelectComponent = (props) => {

  const { label, name, value, onChange, options=[], ...res} = props;

  const id = useMemo(() => uuidv4(), []);

  return (
      <FormControl fullWidth size="small">
        <InputLabel id={id}>{label}</InputLabel>
        <Select labelId={id} name={name} value={value} label={label} onChange={onChange} {...res} >
          {options && options.map((i, idx)=><MenuItem key={idx} value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>
  );
};

export default memo(SelectComponent);
