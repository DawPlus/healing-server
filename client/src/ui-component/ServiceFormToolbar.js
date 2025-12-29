import React from 'react';
import { Grid, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExcelUpload from './excelUploader';

/**
 * Standardized toolbar component for all service insert forms
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Function to handle search
 * @param {Function} props.onSave - Function to handle save/submit
 * @param {Function} props.onDataProcessed - Function to process excel data
 * @param {Function} props.onAdd - Function to add a row
 * @param {Function} props.onRemove - Function to remove selected rows
 * @param {Function} props.onExport - Function to export data to Excel
 * @param {Function} props.onExcelImport - Function to import data from Excel
 * @param {number} props.startRow - Starting row for excel data (default: 1)
 * @param {string} props.type - Form type identifier for excel download
 */
function ServiceFormToolbar({ 
  onSearch, 
  onSave, 
  onDataProcessed, 
  onAdd, 
  onRemove, 
  onExport, 
  onExcelImport, 
  startRow = 1, 
  type 
}) {
  return (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      {onSearch && (
        <Grid item>
          <Button 
            variant="contained" 
            color="secondary" 
            size="small" 
            startIcon={<SearchIcon />}
            onClick={onSearch}
          >
            조회
          </Button>
        </Grid>
      )}
      
      {onSave && (
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            startIcon={<SendIcon />}
            onClick={onSave}
          >
            전송
          </Button>
        </Grid>
      )}
    
   
      
      <Grid item>
        <ExcelUpload 
          onDataProcessed={onExcelImport || onDataProcessed} 
          startRow={startRow} 
          type={type} 
        />
      </Grid>
    </Grid>
  );
}

export default ServiceFormToolbar; 