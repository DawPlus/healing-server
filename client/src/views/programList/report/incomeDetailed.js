import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// 수입금액 컴포넌트 (개별 항목 표시 버전)
const IncomeDetailed = ({ data = [] }) => {
    // 수입 항목이 있는지 확인
    const hasIncome = data && data.length > 0;
    

    
    // 총액 계산
    const totalPrice = hasIncome
        ? data.reduce((total, item) => total + parseFloat(item.PRICE || 0), 0)
        : 0;
    
    return (
        <>
            <TableContainer style={{ marginTop: "20px" }}>
                <h3 className="tableTitle">수입금액</h3>
                <Table className="report custom-table">
                    <TableHead className="table-head">
                        <TableRow>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '15%' }}>수입항목</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '15%' }}>수입금액</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '55%' }}>세부내역</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '15%' }}>비고</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {hasIncome ? (
                            // 데이터가 있는 경우 각 항목을 개별적으로 표시
                            (() => {
                                // 같은 카테고리별로 그룹화
                                const groupedItems = {};
                                data.forEach(item => {
                                    const category = item.category || item.ITEM.replace('(천원)', '');
                                    if (!groupedItems[category]) {
                                        groupedItems[category] = [];
                                    }
                                    groupedItems[category].push(item);
                                });

                                return Object.entries(groupedItems).map(([category, items]) => 
                                    items.map((item, index) => (
                                        <TableRow key={`${category}-${index}`}>
                                            <TableCell style={{ backgroundColor: 'white' }}>
                                                {items.length > 1 ? `${category}(천원) (${index + 1})` : item.ITEM}
                                            </TableCell>
                                            <TableCell align="right" style={{ backgroundColor: 'white' }}>
                                                {parseInt(item.PRICE).toLocaleString()}
                                            </TableCell>
                                            <TableCell style={{ backgroundColor: 'white' }}>
                                                {item.DETAIL}
                                            </TableCell>
                                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                                        </TableRow>
                                    ))
                                ).flat();
                            })()
                        ) : (
                            // 데이터가 없는 경우 빈 행
                            <TableRow>
                                <TableCell style={{ backgroundColor: 'white' }}>-</TableCell>
                                <TableCell align="right" style={{ backgroundColor: 'white' }}>0</TableCell>
                                <TableCell style={{ backgroundColor: 'white' }}>-</TableCell>
                                <TableCell style={{ backgroundColor: 'white' }}>-</TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell className="bottom-cell" align="center" style={{ backgroundColor: '#white', fontWeight: 'bold' }}>계(천원)</TableCell>
                            <TableCell className="bottom-cell" align="right">{totalPrice.toLocaleString()}</TableCell>
                            <TableCell className="bottom-cell"></TableCell>
                            <TableCell className="bottom-cell"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="bottom-cell" align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold' }}>최종금액(천원)</TableCell>
                            <TableCell className="bottom-cell" align="right" colSpan={3} style={{ backgroundColor: '#e1e1e1' }}>{totalPrice.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default IncomeDetailed; 