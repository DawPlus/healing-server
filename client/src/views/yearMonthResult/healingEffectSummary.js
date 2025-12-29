import React from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

const HealingEffectSummary = ({ data = {} }) => {
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.abs(num).toFixed(2);
  };

  // 경험 통계 데이터 (실제 데이터가 없을 경우 기본값)
  const experienceStats = data.experienceStats || {
    hasExperience: 0,
    noExperience: 0,
    notSpecified: 0
  };

  return (
    <TableContainer>
      <Table className="report custom-table" size="small">
        <TableHead>
          <TableRow>
            <TableCell 
              className="table-header" 
              align="center" 
              rowSpan={2}
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold',
                minWidth: '100px'
              }}
            >
              {/* 빈 칸 */}
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center" 
              rowSpan={2}
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold',
                minWidth: '200px'
              }}
            >
              과거스트레스 해소경험
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold',
                minWidth: '80px'
              }}
            >
              영역
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center" 
              colSpan={7}
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold'
              }}
            >
              평균(0-5점)
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              평가시점
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              욕구충족
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              긍정정서
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              자기이해
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              마음관리기술
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              정서능력측면
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              명상측면
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#f5f5f5',
                fontSize: '12px',
                padding: '8px 4px'
              }}
            >
              삶의조망측면
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell 
              className="table-cell" 
              align="center" 
              rowSpan={3}
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '8px 4px',
                minWidth: '40px',
                width: '40px',
                position: 'relative'
              }}
            >
              <div style={{
                transform: 'rotate(0)',
                transformOrigin: 'center',
                whiteSpace: 'nowrap',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-7px',
                marginLeft: '-12px'
              }}>
                통계
              </div>
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              유: {experienceStats.hasExperience || 0}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontWeight: 'bold'
              }}
            >
              사전
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg1)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg2)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg3)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg4)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg5)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg6)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.pre_avg7)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              무: {experienceStats.noExperience || 0}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontWeight: 'bold'
              }}
            >
              사후
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg1)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg2)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg3)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg4)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg5)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg6)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.post_avg7)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              미기재: {experienceStats.notSpecified || 0}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff',
                fontWeight: 'bold'
              }}
            >
              차이값
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg1)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg2)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg3)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg4)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg5)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg6)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(data.diff_avg7)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HealingEffectSummary; 