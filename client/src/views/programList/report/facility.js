import React, { useMemo } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

// 시설서비스 만족도 
const Facility = ({ data = {} }) => {
    // Get service forms data from props
    const serviceForms = data.serviceForms || [];
    // 서버에서 전달된 serviceList 데이터 가져오기
    const serviceList = data.serviceList || [];
    

    
    // serviceForms에서 개별 entries를 모두 수집
    const allServiceEntries = useMemo(() => {
        const entries = [];
        
   
        
        serviceForms.forEach((form, formIndex) => {
          
            
            if (form.entries && form.entries.length > 0) {
                // entries가 있으면 entries에서 데이터 추출
                form.entries.forEach((entry, entryIndex) => {
                 
                    
                    entries.push({
                        name: entry.name || entry.NAME || '-',
                        sex: entry.sex || '-',
                        age: entry.age || '-',
                        score1: entry.score1 || 0,   // 숙소는 이용하기 편리했다
                        score5: entry.score5 || 0,   // 시설 및 산책로 등에 만족한다
                        score11: entry.score11 || 0, // 프로그램 안내 및 운영방식은 만족스러웠다
                        score14: entry.score14 || 0  // 재료가 신선하고 맛있는 식사가 제공되었다
                    });
                });
            } else {
                
                // score 값들이 실제로 어떻게 처리되는지 확인
                const processedData = {
                    name: form.name || form.NAME || '-',
                    sex: form.sex || '-',
                    age: form.age || '-',
                    score1: form.score1 || 0,   // 숙소는 이용하기 편리했다
                    score5: form.score5 || 0,   // 시설 및 산책로 등에 만족한다
                    score11: form.score11 || 0, // 프로그램 안내 및 운영방식은 만족스러웠다
                    score14: form.score14 || 0  // 재료가 신선하고 맛있는 식사가 제공되었다
                };
                
          
                
                entries.push(processedData);
            }
        });
        
    
        
        // Form 5 (index 4)에 대한 특별 체크
        if (entries.length > 4) {
            console.log("\n[CLIENT] Form 5 (index 4) 최종 처리 결과:");
            console.log(entries[4]);
        }
        
        return entries;
    }, [serviceForms]);
    
    // 평균 계산 (요약용)
    const averageScores = useMemo(() => {
        if (allServiceEntries.length === 0) {
            return {
                score1: 0,   // 숙소
                score5: 0,   // 시설/야외  
                score11: 0,  // 운영
                score14: 0   // 식사
            };
        }
        
        const scoreFields = ['score1', 'score5', 'score11', 'score14'];
        const result = {};
        
        scoreFields.forEach(scoreField => {
            const validScores = allServiceEntries
                .map(entry => parseFloat(entry[scoreField]))
                .filter(score => !isNaN(score) && score > 0);
                
            result[scoreField] = validScores.length > 0 
                ? (validScores.reduce((sum, val) => sum + val, 0) / validScores.length).toFixed(1) 
                : '0';
        });
        
        return result;
    }, [allServiceEntries]);

    return (
        <>
            <TableContainer style={{ marginTop: "20px" }}>
                <h3 className="tableTitle">시설서비스만족도</h3>
                <Table className="report custom-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" align="center">숙소</TableCell>
                            <TableCell className="table-header" align="center">시설/야외</TableCell>
                            <TableCell className="table-header" align="center">운영</TableCell>
                            <TableCell className="table-header" align="center">식사</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-header" align="center">숙소는 이용하기 편리했다</TableCell>
                            <TableCell className="table-header" align="center">시설 및 산책로 등에 만족한다</TableCell>
                            <TableCell className="table-header" align="center">프로그램 안내 및 운영방식은 만족스러웠다</TableCell>
                            <TableCell className="table-header" align="center">재료가 신선하고 맛있는 식사가 제공되었다</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {allServiceEntries.length > 0 ? (
                            allServiceEntries.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">{entry.score1}</TableCell>
                                    <TableCell align="center">{entry.score5}</TableCell>
                                    <TableCell align="center">{entry.score11}</TableCell>
                                    <TableCell align="center">{entry.score14}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell align="center" colSpan={4}>데이터가 없습니다</TableCell>
                            </TableRow>
                        )} */}
                        {/* 평균값 행 추가 - 데이터가 없어도 기본값 0으로 표시 */}
                        <TableRow style={{ backgroundColor: 'white', fontWeight: 'bold' }}>
                            <TableCell align="center">{averageScores.score1 || '0'}</TableCell>
                            <TableCell align="center">{averageScores.score5 || '0'}</TableCell>
                            <TableCell align="center">{averageScores.score11 || '0'}</TableCell>
                            <TableCell align="center">{averageScores.score14 || '0'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default Facility;