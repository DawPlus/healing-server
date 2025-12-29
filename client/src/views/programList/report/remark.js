import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import TextField from '@mui/material/TextField';

// 소감 컴포넌트
const RemarkContainer = ({ data = {}, complaint = '' }) => {
  // 데이터 준비 - props에서 데이터 받기
  const basicInfo = data || {};
  
  const PROGRAM_OPINION = basicInfo.PROGRAM_OPINION || '';
  const SERVICE_OPINION = basicInfo.SERVICE_OPINION || '';
  const OVERALL_OPINION = basicInfo.OVERALL_OPINION || '';
  
  // 민원사항은 PROGRAM_OPINION을 우선으로 표시하되, 없는 경우 상위 컴포넌트에서 전달받은 complaint 사용
  const displayComplaint = PROGRAM_OPINION || complaint || '';

  return (
    <>
      <TableContainer style={{ marginTop: '20px' }}>
        <Table className="report custom-table">
          <TableBody>
         
            <TableRow>
              <TableCell className="table-header" align="center">
                민원사항
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ height: '50px', padding: '0px' }}>
                <TextField
                  id="outlined-textarea"
                  multiline
                  className="customTextArea"
                  InputProps={{
                    readOnly: true,
                    style: { outline: 'none', fontSize: '12px', background: '#FFF' },
                  }}
                  fullWidth
                  value={displayComplaint}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default RemarkContainer;
