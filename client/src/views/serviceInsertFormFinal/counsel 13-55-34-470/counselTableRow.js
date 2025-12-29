import React, { useCallback, useState, useEffect } from "react";
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import CounselDynamicField from "./counselDynamicField";
import { memo } from "react";

const CounselTableRow = ({ rows, fields, onCheckChange, onChange, id = "idx" }) => {
  
  // Move hooks to the top level of the component - before any conditional statements
  // 체크박스 변경 이벤트 처리
  const handleCheckChange = useCallback((rowId, checked) => {
    if (onCheckChange) {
      onCheckChange(rowId, checked);
    }
  }, [onCheckChange]);
  
  // 필드 값 변경 이벤트 처리
  const handleFieldChange = useCallback((rowId, name, value) => {
    if (onChange) {
      onChange(rowId, name, value);
    }
  }, [onChange]);
  
  // These hooks were conditionally called - move them here
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Move useEffect hook to the top level 
  useEffect(() => {
    // Only execute the body of the effect if rows exist
    if (rows && rows.length > 0) {
      // Effect logic here
    }
  }, [rows]);
  
  // Add any other conditionally used hooks here
  const memoizedCallback = useCallback(() => {
    // Only execute if needed
    if (rows && rows.length > 0) {
      // Callback logic here
    }
  }, [rows]);
  
  // 빈 테이블일 경우 처리 - Use conditional rendering instead of early return
  if (!rows || rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={fields.length + 1} align="center">
            데이터가 없습니다.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  return (
    <TableBody style={{ minHeight: "500px" }}>
      {rows.map((row, index) => {
        const rowId = row[id] || `row-${index}`;
        
        return (
          <TableRow key={rowId}>
            <TableCell style={{ textAlign: "center" }}>
              <Checkbox 
                checked={!!row.chk} 
                onChange={(e) => handleCheckChange(rowId, e.target.checked)} 
                name="chk"
              />
            </TableCell>
            {fields.map((field) => (
              <CounselDynamicField
                key={`${rowId}-${field.name}`}
                type={field.type}
                label={field.label}
                name={field.name}
                onChange={(e) => handleFieldChange(rowId, e.target.name, e.target.value)}
                value={row[field.name]}
                idx={index === 0 ? "first_row" : rowId}
              />
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default memo(CounselTableRow); 