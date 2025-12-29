import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';

const ProgramSatisfaction = ({ data }) => {
    const { programSatisfaction = [] } = data || {};
    
    // 안전하게 숫자 변환
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };
    
    // SATISFACTION 필드에 따라 데이터 필터링
    const verySatisfied = programSatisfaction.filter(item => item.SATISFACTION === '매우만족');
    const satisfied = programSatisfaction.filter(item => item.SATISFACTION === '만족');
    const neutral = programSatisfaction.filter(item => item.SATISFACTION === '보통');
    const dissatisfied = programSatisfaction.filter(item => item.SATISFACTION === '불만족');
    const veryDissatisfied = programSatisfaction.filter(item => item.SATISFACTION === '매우불만족');
    
    // 카테고리 목록 (중복 제거)
    const categories = [...new Set(programSatisfaction.map(item => item.CATEGORY))];
    
    // 각 카테고리별 만족도 계산
    const calculateSatisfactionByCategory = () => {
        return categories.map(category => {
            const categoryItems = programSatisfaction.filter(item => item.CATEGORY === category);
            const verysat = categoryItems.filter(item => item.SATISFACTION === '매우만족').length;
            const sat = categoryItems.filter(item => item.SATISFACTION === '만족').length;
            const neu = categoryItems.filter(item => item.SATISFACTION === '보통').length;
            const dis = categoryItems.filter(item => item.SATISFACTION === '불만족').length;
            const verydis = categoryItems.filter(item => item.SATISFACTION === '매우불만족').length;
            const total = categoryItems.length;
            
            return {
                category,
                verysat,
                sat, 
                neu,
                dis,
                verydis,
                total,
                verysatPercent: total > 0 ? (verysat / total * 100).toFixed(2) : '0.00',
                satPercent: total > 0 ? (sat / total * 100).toFixed(2) : '0.00',
                neuPercent: total > 0 ? (neu / total * 100).toFixed(2) : '0.00',
                disPercent: total > 0 ? (dis / total * 100).toFixed(2) : '0.00',
                verydisPercent: total > 0 ? (verydis / total * 100).toFixed(2) : '0.00'
            };
        });
    };
    
    const satisfactionByCategory = calculateSatisfactionByCategory();
    
    return (
        <>
            <h3 className="tableTitle">프로그램 만족도</h3>
            <TableContainer>
                <Table className="report custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" rowSpan={2}>구분</TableCell>
                            <TableCell align="center" colSpan={2}>매우만족</TableCell>
                            <TableCell align="center" colSpan={2}>만족</TableCell>
                            <TableCell align="center" colSpan={2}>보통</TableCell>
                            <TableCell align="center" colSpan={2}>불만족</TableCell>
                            <TableCell align="center" colSpan={2}>매우불만족</TableCell>
                            <TableCell align="center" rowSpan={2}>합계</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">수</TableCell>
                            <TableCell align="center">%</TableCell>
                            <TableCell align="center">수</TableCell>
                            <TableCell align="center">%</TableCell>
                            <TableCell align="center">수</TableCell>
                            <TableCell align="center">%</TableCell>
                            <TableCell align="center">수</TableCell>
                            <TableCell align="center">%</TableCell>
                            <TableCell align="center">수</TableCell>
                            <TableCell align="center">%</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {satisfactionByCategory.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell align="center">{item.category}</TableCell>
                                <TableCell align="center">{item.verysat}</TableCell>
                                <TableCell align="center">{item.verysatPercent}%</TableCell>
                                <TableCell align="center">{item.sat}</TableCell>
                                <TableCell align="center">{item.satPercent}%</TableCell>
                                <TableCell align="center">{item.neu}</TableCell>
                                <TableCell align="center">{item.neuPercent}%</TableCell>
                                <TableCell align="center">{item.dis}</TableCell>
                                <TableCell align="center">{item.disPercent}%</TableCell>
                                <TableCell align="center">{item.verydis}</TableCell>
                                <TableCell align="center">{item.verydisPercent}%</TableCell>
                                <TableCell align="center">{item.total}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="total-row">
                            <TableCell align="center">합계</TableCell>
                            <TableCell align="center">{verySatisfied.length}</TableCell>
                            <TableCell align="center">
                                {programSatisfaction.length > 0 
                                    ? (verySatisfied.length / programSatisfaction.length * 100).toFixed(2) 
                                    : '0.00'}%
                            </TableCell>
                            <TableCell align="center">{satisfied.length}</TableCell>
                            <TableCell align="center">
                                {programSatisfaction.length > 0 
                                    ? (satisfied.length / programSatisfaction.length * 100).toFixed(2) 
                                    : '0.00'}%
                            </TableCell>
                            <TableCell align="center">{neutral.length}</TableCell>
                            <TableCell align="center">
                                {programSatisfaction.length > 0 
                                    ? (neutral.length / programSatisfaction.length * 100).toFixed(2) 
                                    : '0.00'}%
                            </TableCell>
                            <TableCell align="center">{dissatisfied.length}</TableCell>
                            <TableCell align="center">
                                {programSatisfaction.length > 0 
                                    ? (dissatisfied.length / programSatisfaction.length * 100).toFixed(2) 
                                    : '0.00'}%
                            </TableCell>
                            <TableCell align="center">{veryDissatisfied.length}</TableCell>
                            <TableCell align="center">
                                {programSatisfaction.length > 0 
                                    ? (veryDissatisfied.length / programSatisfaction.length * 100).toFixed(2) 
                                    : '0.00'}%
                            </TableCell>
                            <TableCell align="center">{programSatisfaction.length}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
        </>
    );
};

export default ProgramSatisfaction; 