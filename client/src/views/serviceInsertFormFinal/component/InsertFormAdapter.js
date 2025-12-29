import React, { forwardRef, useImperativeHandle } from 'react';

/**
 * InsertFormAdapter - HOC that adds ref forwarding to InsertForm components
 * 
 * This wrapper adds ref forwarding and imperative methods to make InsertForm components
 * work with the CustomFormContainer and react to participant data updates
 * 
 * @param {React.Component} WrappedComponent The original InsertForm component
 * @returns {React.ForwardRefExoticComponent} Enhanced InsertForm component
 */
const InsertFormAdapter = (WrappedComponent) => {
  // Name for logging purposes
  const componentName = WrappedComponent.displayName || WrappedComponent.name || 'InsertForm';
  
  // Create the enhanced component with forwardRef
  const EnhancedInsertForm = forwardRef((props, ref) => {
    const { rows, setAllData, ...otherProps } = props;
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      // Method to update rows from outside
      setRows: (newRows) => {
        console.log(`[${componentName}] setRows 호출됨:`, newRows?.length);
        
        if (!newRows || newRows.length === 0) {
          console.log(`[${componentName}] 빈 rows 데이터, 무시함`);
          return false;
        }
        
        if (setAllData) {
          try {
            // Try handling using 'all' type (newer format)
            if (typeof setAllData === 'function') {
              setAllData('all', newRows);
              return true;
            } 
            // Fall back to object format (older components)
            else {
              setAllData({ type: 'all', value: newRows });
              return true;
            }
          } catch (error) {
            console.error(`[${componentName}] setAllData 호출 중 오류:`, error);
          }
        }
        
        return false;
      },
      
      // Provide access to the current rows
      rows: rows || []
    }), [rows, setAllData]);
    
    // Render the wrapped component with all props and the ref
    return <WrappedComponent rows={rows} setAllData={setAllData} {...otherProps} />;
  });
  
  // Set display name for debugging
  EnhancedInsertForm.displayName = `InsertFormAdapter(${componentName})`;
  
  return EnhancedInsertForm;
};

export default InsertFormAdapter; 