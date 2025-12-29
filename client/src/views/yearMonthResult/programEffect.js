import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Helper to format numbers, ensuring two decimal places for non-integers
const formatScore = (score) => {
    if (score === null || score === undefined || isNaN(Number(score))) {
        return '0.00'; // Or perhaps '-' or handle as needed
    }
    const num = Number(score);
    return num % 1 === 0 ? num.toFixed(1) : num.toFixed(2);
};

const ProgramEffect = ({ data = [] }) => {
    console.log("ProgramEffect data:", data);

    // Create a map for easy lookup by type
    const effectMap = data.reduce((map, item) => {
        map[item.type] = item; // Assumes item structure is { type, avg1, avg2, diff, ...}
        return map;
    }, {});

    const getEffectData = (type) => {
        return effectMap[type] || { avg1: 0, avg2: 0 }; // Provide default if type not found
    };

    const preventEffect = getEffectData('예방');
    const counselEffect = getEffectData('상담');
    const healingEffect = getEffectData('힐링');
    const hrvActivity = getEffectData('HRV(자율신경활성도)');
    const hrvBalance = getEffectData('HRV(자율신경균형도)');
    const hrvResistance = getEffectData('HRV(스트레스저항도)');
    const hrvIndex = getEffectData('HRV(스트레스지수)');
    const hrvFatigue = getEffectData('HRV(피로도지수)');

    return (
        <>
            {/* <h3 className="tableTitle">효과성분석</h3> */}
            <TableContainer>
                <Table className="report custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" rowSpan={2} align="center" style={{width: "12%"}}>효과성분석</TableCell>
                            <TableCell className="table-header" colSpan={6} align="center">프로그램효과성</TableCell>
                            <TableCell className="table-header" colSpan={5} align="center">자율신경검사효과성</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-header" align="center">예방효과(합계)</TableCell>
                            <TableCell className="table-header" align="center">예방효과(평균)</TableCell>
                            <TableCell className="table-header" align="center">상담치유효과(합계)</TableCell>
                            <TableCell className="table-header" align="center">상담치유효과(평균)</TableCell>
                            <TableCell className="table-header" align="center">힐링효과(합계)</TableCell>
                            <TableCell className="table-header" align="center">힐링효과(평균)</TableCell>
                            <TableCell className="table-header" align="center">자율신경활성도</TableCell>
                            <TableCell className="table-header" align="center">자율신경균형도</TableCell>
                            <TableCell className="table-header" align="center">스트레스저항도</TableCell>
                            <TableCell className="table-header" align="center">스트레스지수</TableCell>
                            <TableCell className="table-header" align="center">피로도</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center">사전</TableCell>
                            {/* Assuming sum1/sum2 are not directly available or needed, using avg1 */}
                            <TableCell align="center">0.00</TableCell> 
                            <TableCell align="center">{formatScore(preventEffect.avg1)}</TableCell>
                            <TableCell align="center">0.00</TableCell>
                            <TableCell align="center">{formatScore(counselEffect.avg1)}</TableCell>
                            <TableCell align="center">0.00</TableCell>
                            <TableCell align="center">{formatScore(healingEffect.avg1)}</TableCell>
                            <TableCell align="center">{formatScore(hrvActivity.avg1)}</TableCell>
                            <TableCell align="center">{formatScore(hrvBalance.avg1)}</TableCell>
                            <TableCell align="center">{formatScore(hrvResistance.avg1)}</TableCell>
                            <TableCell align="center">{formatScore(hrvIndex.avg1)}</TableCell>
                            <TableCell align="center">{formatScore(hrvFatigue.avg1)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">사후</TableCell>
                            <TableCell align="center">0.00</TableCell>
                            <TableCell align="center">{formatScore(preventEffect.avg2)}</TableCell>
                            <TableCell align="center">0.00</TableCell>
                            <TableCell align="center">{formatScore(counselEffect.avg2)}</TableCell>
                            <TableCell align="center">0.00</TableCell>
                            <TableCell align="center">{formatScore(healingEffect.avg2)}</TableCell>
                            <TableCell align="center">{formatScore(hrvActivity.avg2)}</TableCell>
                            <TableCell align="center">{formatScore(hrvBalance.avg2)}</TableCell>
                            <TableCell align="center">{formatScore(hrvResistance.avg2)}</TableCell>
                            <TableCell align="center">{formatScore(hrvIndex.avg2)}</TableCell>
                            <TableCell align="center">{formatScore(hrvFatigue.avg2)}</TableCell>
                        </TableRow>
                        {/* Optionally add a row for difference (diff) if needed */}
                        {/* 
                        <TableRow>
                            <TableCell align="center">차이</TableCell>
                            <TableCell align="center"></TableCell> 
                            <TableCell align="center">{formatScore(preventEffect.diff)}</TableCell>
                            <TableCell align="center"></TableCell>
                            <TableCell align="center">{formatScore(counselEffect.diff)}</TableCell>
                            <TableCell align="center"></TableCell>
                            <TableCell align="center">{formatScore(healingEffect.diff)}</TableCell>
                            <TableCell align="center">{formatScore(hrvActivity.diff)}</TableCell>
                            <TableCell align="center">{formatScore(hrvBalance.diff)}</TableCell>
                            <TableCell align="center">{formatScore(hrvResistance.diff)}</TableCell>
                            <TableCell align="center">{formatScore(hrvIndex.diff)}</TableCell>
                            <TableCell align="center">{formatScore(hrvFatigue.diff)}</TableCell>
                        </TableRow>
                        */}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ProgramEffect;