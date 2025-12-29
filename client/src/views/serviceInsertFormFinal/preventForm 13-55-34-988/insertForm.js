import React from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';
import { 
  sexOptions, 
  residenceOptions, 
  jobOptions, 
  pastExperienceOptions,
  headerInfo
} from './fields';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  fontSize: '0.875rem',
}));

const SetValueSection = ({ onAddRow, onRemoveRow, onSetData, getUserTemp, children }) => {
  const [value, setValue] = React.useState("");
  const [field, setField] = React.useState("sex");
  
  const handleSelectChange = (e) => {
    setField(e.target.value);
  };
  
  const handleValueChange = (e) => {
    setValue(e.target.value);
  };
  
  const handleSetValue = () => {
    if (value) {
      onSetData(field, value);
    }
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl variant="outlined" size="small" fullWidth>
            <Select
              value={field}
              onChange={handleSelectChange}
            >
              <MenuItem value="sex">성별</MenuItem>
              <MenuItem value="age">연령</MenuItem>
              <MenuItem value="residence">거주지</MenuItem>
              <MenuItem value="job">직업</MenuItem>
              <MenuItem value="past_experience">과거 경험</MenuItem>
            </Select>
          </FormControl>
        </Grid>
     
        
  
        
        <Grid item xs={12} md={2}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onAddRow}
            fullWidth
          >
            행 추가
          </Button>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={onRemoveRow}
            fullWidth
          >
            행 삭제
          </Button>
        </Grid>
        
        {children && (
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              {children}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

const InsertForm = ({ rows, onCheckChange, onChange, setAllData, getUserTemp }) => {
  const handleSetAllData = (type, value) => {
    setAllData(type, value);
  };

  const handleCheckChange = (idx) => (e) => {
    onCheckChange(idx, e.target.checked);
  };

  const handleChange = (idx, name) => (e) => {
    onChange(idx, name, e.target.value);
  };

  return (
    <>
      <SetValueSection 
        onAddRow={() => setAllData("addRow")} 
        onRemoveRow={() => setAllData("removeRow")} 
        onSetData={handleSetAllData}
        getUserTemp={getUserTemp}
      >
        <span>※ 과거 예방서비스 경험 : [미기재, 없음, 있음] 중 선택</span>
      </SetValueSection>

      <TableContainer style={{ minHeight: "560px", paddingBottom: "50px" }}>
        <Table className="insertForm custom-table" stickyHeader size="small">
          <TableHead>
            {headerInfo.map((row, rowIndex) => (
              <TableRow key={`header-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <StyledTableCell 
                    key={`header-${rowIndex}-${cellIndex}`} 
                    align="center"
                    sx={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: 'bold',
                      backgroundColor: rowIndex === 0 ? '#e3f2fd' : '#f5f5f5' 
                    }}
                  >
                    {cell}
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row.idx}>
                <StyledTableCell align="center">
                  <Checkbox 
                    checked={row.chk || false} 
                    onChange={handleCheckChange(rowIndex)} 
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={row.sex || "미기재"}
                      onChange={handleChange(rowIndex, "sex")}
                      variant="outlined"
                      sx={{ minWidth: 80 }}
                    >
                      {sexOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <TextField
                    value={row.age || ""}
                    onChange={handleChange(rowIndex, "age")}
                    variant="outlined"
                    size="small"
                    sx={{ width: 60 }}
                    inputProps={{ style: { textAlign: 'center' } }}
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={row.residence || "미기재"}
                      onChange={handleChange(rowIndex, "residence")}
                      variant="outlined"
                      sx={{ minWidth: 100 }}
                    >
                      {residenceOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={row.job || "미기재"}
                      onChange={handleChange(rowIndex, "job")}
                      variant="outlined"
                      sx={{ minWidth: 100 }}
                    >
                      {jobOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={row.past_experience || "미기재"}
                      onChange={handleChange(rowIndex, "past_experience")}
                      variant="outlined"
                      sx={{ minWidth: 90 }}
                    >
                      {pastExperienceOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </StyledTableCell>
                
                {/* Score fields (1-30) */}
                {[...Array(30)].map((_, i) => (
                  <StyledTableCell key={`score-${i+1}`} align="center">
                    <TextField
                      value={row[`score${i+1}`] || ""}
                      onChange={handleChange(rowIndex, `score${i+1}`)}
                      variant="outlined"
                      size="small"
                      sx={{ width: 50 }}
                      inputProps={{ style: { textAlign: 'center' } }}
                    />
                  </StyledTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default InsertForm; 