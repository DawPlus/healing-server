import React from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

const PreventEffectSummary = ({ data = {} }) => {
  const { smartphone = {}, gambling = {}, experienceStats = {} } = data;

  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : Math.abs(num).toFixed(2);
  };

  // 스마트폰과 도박 데이터를 합쳐서 평균 계산
  const calculateCombinedAverage = (smartphoneValue, gamblingValue) => {
    const smartScore = parseFloat(smartphoneValue) || 0;
    const gambScore = parseFloat(gamblingValue) || 0;
    
    if (smartScore === 0 && gambScore === 0) return 0;
    if (smartScore === 0) return gambScore;
    if (gambScore === 0) return smartScore;
    
    return ((smartScore + gambScore) / 2).toFixed(2);
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
              과거 행위중독 예방 프로그램 경험 유무
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
              colSpan={6}
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
              중독특징이해
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
              핵심증상이해
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
              문제대응방법
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
              활동역량
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
              심리적면역력강화법
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
              실의질
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
              {calculateCombinedAverage(smartphone.avgScore1, gambling.avgScore1)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore2, gambling.avgScore2)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore3, gambling.avgScore3)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore4, gambling.avgScore4)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore5, gambling.avgScore5)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore6, gambling.avgScore6)}
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
              {calculateCombinedAverage(smartphone.avgScore4, gambling.avgScore4)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore5, gambling.avgScore5)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore6, gambling.avgScore6)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore1, gambling.avgScore1)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore2, gambling.avgScore2)}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {calculateCombinedAverage(smartphone.avgScore3, gambling.avgScore3)}
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
              {safeNumber(
                calculateCombinedAverage(smartphone.avgScore1, gambling.avgScore1) - 
                calculateCombinedAverage(smartphone.avgScore4, gambling.avgScore4)
              )}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(
                calculateCombinedAverage(smartphone.avgScore2, gambling.avgScore2) - 
                calculateCombinedAverage(smartphone.avgScore5, gambling.avgScore5)
              )}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(
                calculateCombinedAverage(smartphone.avgScore3, gambling.avgScore3) - 
                calculateCombinedAverage(smartphone.avgScore6, gambling.avgScore6)
              )}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(
                calculateCombinedAverage(smartphone.avgScore1, gambling.avgScore1) - 
                calculateCombinedAverage(smartphone.avgScore4, gambling.avgScore4)
              )}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(
                calculateCombinedAverage(smartphone.avgScore2, gambling.avgScore2) - 
                calculateCombinedAverage(smartphone.avgScore5, gambling.avgScore5)
              )}
            </TableCell>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#fff'
              }}
            >
              {safeNumber(
                calculateCombinedAverage(smartphone.avgScore3, gambling.avgScore3) - 
                calculateCombinedAverage(smartphone.avgScore6, gambling.avgScore6)
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PreventEffectSummary; 