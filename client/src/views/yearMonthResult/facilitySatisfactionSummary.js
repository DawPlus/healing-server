import React from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

const FacilitySatisfactionSummary = ({ data = {} }) => {
  // Process actual data if available
  const facilityScoresByAgency = data.facilityScoresByAgency || {};
  
  // Convert backend data to display format
  const displayData = Object.keys(facilityScoresByAgency).length > 0 
    ? Object.entries(facilityScoresByAgency).map(([agency, scores]) => ({
        agency,
        scores: [
          scores.score1 || 0,   // 숙소
          scores.score5 || 0,   // 시설/야외
          scores.score11 || 0,  // 운영
          scores.score14 || 0,  // 식사
          scores.score1 || 0,   // 숙소 (동일)
          scores.score5 || 0,   // 시설/야외 (동일)
          scores.score11 || 0,  // 운영 (동일)
          scores.score14 || 0   // 식사 (동일)
        ]
      }))
    : []; // 실제 데이터가 없으면 빈 배열 반환

  const formatScore = (score) => {
    if (score === null || score === undefined) return '';
    return typeof score === 'number' ? score.toFixed(2) : score;
  };

  // Calculate statistics for the header row
  const calculateStatistics = () => {
    if (displayData.length === 0) return [0, 0, 0, 0, 0, 0, 0, 0];
    
    const stats = [0, 0, 0, 0, 0, 0, 0, 0];
    let validCounts = [0, 0, 0, 0, 0, 0, 0, 0];
    
    displayData.forEach(item => {
      item.scores.forEach((score, index) => {
        if (score !== null && score !== undefined && !isNaN(score)) {
          stats[index] += score;
          validCounts[index]++;
        }
      });
    });
    
    return stats.map((sum, index) => 
      validCounts[index] > 0 ? sum / validCounts[index] : 0
    );
  };

  const statistics = calculateStatistics();

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
                minWidth: '120px'
              }}
            >
              기관명/단체명
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold'
              }}
            >
              숙소
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold'
              }}
            >
              시설/야외
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold'
              }}
            >
              운영
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold'
              }}
            >
              식사
            </TableCell>
            <TableCell 
              className="table-header" 
              align="center"
              colSpan={4}
              style={{
                border: '1px solid #838383',
                backgroundColor: '#e1e1e1',
                fontWeight: 'bold'
              }}
            >
              평균
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
              숙소는 이용하기 편리했다
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
              시설 및 산책로 품질 만족한다
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
              프로그램 안내 및 운영방식는 만족스러웠다
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
              재료가 신선하고 맛있는 식사가 제공되었다
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
              숙소
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
              시설/야외
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
              운영
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
              식사
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Statistics Row - 파스텔 에메랄드 백그라운드 */}
          <TableRow>
            <TableCell 
              className="table-cell" 
              align="center"
              style={{
                border: '1px solid #838383',
                fontWeight: 'bold',
                backgroundColor: '#b3f0e6', // 파스텔 에메랄드
                color: '#2d5a51'
              }}
            >
              통계
            </TableCell>
            {statistics.map((stat, index) => (
              <TableCell 
                key={index}
                className="table-cell" 
                align="center"
                style={{
                  border: '1px solid #838383',
                  backgroundColor: '#b3f0e6', // 파스텔 에메랄드
                  color: '#2d5a51',
                  fontWeight: 'bold'
                }}
              >
                {formatScore(stat)}
              </TableCell>
            ))}
          </TableRow>
          
          {/* Data Rows */}
          {displayData.map((item, index) => (
            <TableRow key={index}>
              <TableCell 
                className="table-cell" 
                align="center"
                style={{
                  border: '1px solid #838383',
                  fontWeight: 'bold',
                  backgroundColor: '#fff'
                }}
              >
                {item.agency}
              </TableCell>
              {item.scores.map((score, scoreIndex) => (
                <TableCell 
                  key={scoreIndex}
                  className="table-cell" 
                  align="center"
                  style={{
                    border: '1px solid #838383',
                    backgroundColor: '#fff'
                  }}
                >
                  {formatScore(score)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FacilitySatisfactionSummary; 