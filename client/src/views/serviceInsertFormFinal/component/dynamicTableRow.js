import React from "react";

import TableCell from '@mui/material/TableCell';

import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';

import TableBody from '@mui/material/TableBody';
import { v4 as uuidv4 } from 'uuid';

import DynamicField from "./dynamicField";
import { memo } from "react";

const DynamicTableRow = (props) => {
  const { 
    rows, 
    fields, 
    onCheckChange,
    id = "id"
  } = props;
  
  // Support multiple onChange prop names by checking in order
  // This handles different naming conventions across components
  const getChangeHandler = () => {
    if (typeof props.onChange === 'function') {
      return props.onChange;
    }
    
    if (typeof props.onChangeValue === 'function') {
      return props.onChangeValue;
    }
    
    if (typeof props.changeValue === 'function') {
      return props.changeValue;
    }
    
    // Fallback safety handler to prevent runtime errors
    console.warn('DynamicTableRow: No valid onChange handler provided!');
    return (idx, name, value) => {
      console.error(`DynamicTableRow: Attempted to change value but no handler provided. idx=${idx}, name=${name}, value=${value}`);
    };
  };
  
  const onChange = getChangeHandler();
  
  const safeOnChange = (idx, name, value) => {
    try {
      if (typeof onChange === 'function') {
        onChange(idx, name, value);
      } else {
        console.error('DynamicTableRow: onChange is not a function');
      }
    } catch (error) {
      console.error('DynamicTableRow: Error in onChange handler:', error);
    }
  };
  
  const safeOnCheckChange = (idx, checked) => {
    try {
      if (typeof onCheckChange === 'function') {
        onCheckChange(idx, checked);
      } else {
        console.error('DynamicTableRow: onCheckChange is not a function');
      }
    } catch (error) {
      console.error('DynamicTableRow: Error in onCheckChange handler:', error);
    }
  };

  return (
    <TableBody style={{minHeight:"500px"}}>
        {(rows || []).map((row, idx) => {
          // Ensure each row has a valid key - if the ID is missing or empty, use index as fallback
          const rowKey = (row[id] && row[id] !== '') ? row[id] : `row-${idx}-${uuidv4()}`;
          
          return (
            <TableRow key={rowKey}>
              {idx > 0 ? (
                <TableCell style={{ textAlign: "center" }}>
                  <Checkbox 
                    checked={row.chk} 
                    value="" 
                    name="chk" 
                    onChange={(e) => safeOnCheckChange(idx, e.target.checked)} 
                  />
                </TableCell>
              ) :    
              <TableCell style={{ textAlign: "center" }}></TableCell>}
              {fields.map((field) => (
                <DynamicField
                  key={`${rowKey}-${field.name}`}
                  type={field.type}
                  label={field.label}
                  name={field.name}
                  onChange={(e) => safeOnChange(idx, e.target.name, e.target.value)}
                  value={row[field.name]}
                  idx={idx}
                  options={field.options}
                />
              ))}
            </TableRow>
          );
        })}
    </TableBody>
  );
};
export default memo(DynamicTableRow);