import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * FormRefAdapter - HOC that adds ref handling to form components
 * 
 * This component wraps any form component to add the ref forwarding support and 
 * imperative methods needed by the CustomFormContainer to update the rows.
 * 
 * @param {React.Component} WrappedComponent The original form component to wrap
 * @param {Object} initRowStructure The initial row data structure
 * @returns {React.Component} Enhanced component with ref forwarding
 */
const FormRefAdapter = (WrappedComponent, initRowStructure) => {
  // Create ref-forwarded component
  const EnhancedComponent = forwardRef((props, ref) => {
    const { searchInfo, ...otherProps } = props;
    const insertFormRef = useRef(null);
    const [rows, setRows] = useState(props.rows || []);
    
    // Track component name for debugging
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'FormComponent';
    
    // Process and set row data
    const setRowsData = (newRows) => {
      console.log(`[${componentName}] setRowsData 호출됨: ${newRows?.length || 0}개 행, 소스:`, new Error().stack.split('\n').slice(1, 3).join('\n'));
      
      if (!newRows || newRows.length === 0) {
        console.log(`[${componentName}] 빈 rows 데이터, 무시함`);
        return false;
      }
      
      // Process rows
      const processedRows = newRows.map((row, index) => {
        const result = {
          ...(initRowStructure || {}),
          ...row,
          idx: row.idx || uuidv4()
        };
        console.log(`[${componentName}] 행 ${index} 처리: idx=${result.idx}, name=${result.name || result.NAME}`);
        return result;
      });
      
      console.log(`[${componentName}] rows 업데이트: ${processedRows.length}개 행`);
      
      // Update state
      setRows(processedRows);
      
      // Call custom setAllData if it exists in original component's props
      if (props.setAllData && typeof props.setAllData === 'function') {
        try {
          console.log(`[${componentName}] setAllData 호출 시도 ('all' 타입)`);
          // Try to call with 'all' type (used in newer components)
          props.setAllData('all', processedRows);
          console.log(`[${componentName}] setAllData 호출 성공 ('all' 타입)`);
          return true;
        } catch (error) {
          console.error(`[${componentName}] 'all' 타입 setAllData 호출 실패:`, error);
          try {
            console.log(`[${componentName}] setAllData 호출 시도 (객체 형식)`);
            // If that fails, try the object format (used in older components)
            props.setAllData({ type: 'all', value: processedRows });
            console.log(`[${componentName}] setAllData 호출 성공 (객체 형식)`);
            return true;
          } catch (secondError) {
            console.error(`[${componentName}] setAllData 호출 중 오류:`, secondError);
            return false;
          }
        }
      } else {
        console.log(`[${componentName}] setAllData 함수가 존재하지 않음`);
      }
      
      return false;
    };
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      // Method to update rows
      setRows: setRowsData,
      
      // Provide access to rows
      rows: rows,
      
      // Provide reference to insert form
      _insertFormRef: insertFormRef,
      
      // Force update method
      forceUpdate: () => {
        setRows([...rows]);
      }
    }), [rows]);
    
    // Render original component with ref and updated props
    return (
      <WrappedComponent
        ref={insertFormRef}
        {...otherProps}
        searchInfo={searchInfo}
        rows={rows}
      />
    );
  });
  
  // Set display name for debugging
  EnhancedComponent.displayName = `FormRefAdapter(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return EnhancedComponent;
};

export default FormRefAdapter; 