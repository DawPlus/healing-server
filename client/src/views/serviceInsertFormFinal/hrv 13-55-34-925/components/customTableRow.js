import React from 'react';
import { TableCell, TableRow, Checkbox, TableBody } from '@mui/material';
import CustomField from './customField';

const CustomTableRow = ({ rows, fields, onCheckChange, onChange, id = "id" }) => {
  return (
    <TableBody style={{ minHeight: "500px" }}>
      {rows.map((row, idx) => 
        <TableRow key={row[id]}>
          {idx > 0 ? (
            <TableCell style={{ textAlign: "center" }}>
              <Checkbox 
                checked={row.chk} 
                value="" 
                name="chk" 
                onChange={(e) => onCheckChange(idx, e.target.checked)} 
              />
            </TableCell>
          ) : (
            <TableCell style={{ textAlign: "center" }}></TableCell>
          )}
          {fields.map((field) => (
            <CustomField
              key={field.name}
              type={field.type}
              label={field.label}
              name={field.name}
              onChange={(e) => onChange(idx, e.target.name, e.target.value)}
              value={row[field.name]}
              idx={idx}
            />
          ))}
        </TableRow>
      )}
    </TableBody>
  );
};

export default CustomTableRow; 