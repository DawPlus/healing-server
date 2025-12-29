import React from 'react';
import {
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDateForDisplay } from '../utils/DataUtils';

/**
 * ProgramList component displays a list of programs with edit/delete actions
 */
const ProgramList = ({
  programs,
  handleEditProgram,
  handleDeleteProgram,
  programListKey,
  disabled
}) => {
  // Sort programs by date
  const sortedPrograms = [...programs].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">프로그램 목록</Typography>
      </Box>
      
      {programs.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" key={`program-table-${programListKey}`}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell width={50}>순번</TableCell>
                <TableCell>프로그램</TableCell>
                <TableCell>장소</TableCell>
                <TableCell>강사</TableCell>
                <TableCell>날짜/시간</TableCell>
                <TableCell>참가인원</TableCell>
                <TableCell width={120}>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPrograms.map((program, index) => (
                <TableRow key={`program-row-${programListKey}-${program.id}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {program.program_name || '(프로그램명 없음)'}
                    </Typography>
                    {program.category_name && (
                      <Typography variant="caption" color="textSecondary">
                        {program.category_name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{program.place_name || '-'}</TableCell>
                  <TableCell>
                    <Box>
                      {program.instructor_name && (
                        <Typography variant="body2">
                          {program.instructor_name}
                        </Typography>
                      )}
                      {program.assistant_name && (
                        <Typography variant="caption" color="textSecondary">
                          보조: {program.assistant_name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {program.date && (
                        <Typography variant="body2">
                          {formatDateForDisplay(program.date)}
                        </Typography>
                      )}
                      {program.start_time && program.end_time && (
                        <Typography variant="caption" color="textSecondary">
                          {program.start_time} ~ {program.end_time}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {program.participants || '-'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditProgram(program)}
                        disabled={disabled}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProgram(program.id)}
                        disabled={disabled}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
          등록된 프로그램이 없습니다.
        </Typography>
      )}
    </Paper>
  );
};

export default ProgramList; 