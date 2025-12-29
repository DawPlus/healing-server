import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, TableHead } from '@mui/material';

// 지출금액 컴포넌트
const ExpenseContainer = ({ data = [], basicInfo = {} }) => {
    // 데이터가 있는지 확인
    const hasExpense = data && data.length > 0;
    const isInternalStaff = basicInfo.org_nature === '내부';

    console.log('[ExpenseContainer] 받은 데이터:', data);
    console.log('[ExpenseContainer] hasExpense:', hasExpense);
    console.log('[ExpenseContainer] isInternalStaff:', isInternalStaff);

    // 예산 및 집행금액 분류
    const getExpensesByGroup = () => {
        if (!hasExpense) {
            console.log('[ExpenseContainer] 데이터가 없어서 빈 객체 반환');
            return {};
        }
        
        // 집행금액(강사)
        const instructorActual = data.filter(item => 
            item.ITEM.includes('_집행') && 
            (item.ITEM.includes('강사비') || item.ITEM.includes('교통비') || 
             item.ITEM.includes('보조강사비')) // 식사비 제외
        );
        
        // 집행금액(참가자)
        const participantActual = data.filter(item => 
            item.ITEM.includes('_집행') && 
            (item.ITEM.includes('숙박비') || item.ITEM.includes('식사비') || 
             item.ITEM.includes('재료비') || item.ITEM.includes('기타비') ||
             item.ITEM.includes('예비비'))
        );

        console.log('[ExpenseContainer] 분류된 데이터:');
        console.log('- instructorActual:', instructorActual);
        console.log('- participantActual:', participantActual);

        return {
            instructorActual,
            participantActual
        };
    };

    const expenses = getExpensesByGroup();

    // 특정 항목의 금액과 세부내역 가져오기 (카테고리별 합산)
    const getExpenseData = (group, itemType) => {
        if (!expenses[group]) {
            return { amount: "0", details: "" };
        }
        
        const items = expenses[group].filter(i => i.ITEM.includes(itemType));
        const totalAmount = items.reduce((sum, item) => sum + parseInt(item.PRICE || 0), 0);
        const details = items.map(item => item.DETAIL).filter(detail => detail && detail.trim() !== '').join(', ');
        
        return { 
            amount: totalAmount.toString(), 
            details: details || ''
        };
    };

    // 총 금액 계산
    const getTotalAmount = (group) => {
        if (!expenses[group]) return 0;
        // 내부 직원일 경우 강사비는 총액에서 제외
        const total = expenses[group].reduce((sum, item) => {
            if (isInternalStaff && item.ITEM.includes('강사비')) {
                return sum;
            }
            return sum + parseInt(item.PRICE || 0);
        }, 0);
        return total;
    };
    
    // 총 집행금액
    const totalActual = getTotalAmount('instructorActual') + getTotalAmount('participantActual');

    console.log('[ExpenseContainer] 최종 합계:');
    console.log('- totalActual:', totalActual);

    // 일반 셀 스타일 (카테고리 셀)
    const categoryCellStyle = {
        backgroundColor: '#e1e1e1',
        fontWeight: 'bold'
    };

    return (
        <>
            <TableContainer style={{ marginTop: "20px" }}>
                <h3 className="tableTitle">지출금액</h3>
                <Table className="report custom-table">
                    <TableHead className="table-head">
                        <TableRow>
                            <TableCell colSpan={2} align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '15%' }}>구분</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '10%' }}>분류</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '10%' }}>금액</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '45%' }}>세부내역</TableCell>
                            <TableCell align="center" style={{ backgroundColor: '#e1e1e1', fontWeight: 'bold', width: '10%' }}>비고</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* 강사 섹션 */}
                        <TableRow>
                            <TableCell rowSpan={isInternalStaff ? 2 : 3} align="center" style={{ fontWeight: 'bold', backgroundColor: '#e1e1e1' }}>강사</TableCell>
                            <TableCell rowSpan={isInternalStaff ? 2 : 3} align="center" style={{ backgroundColor: '#e1e1e1' }}>집행금액(강사)</TableCell>
                            {!isInternalStaff && (
                                <>
                                    <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>강사비(천원)</TableCell>
                                    <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('instructorActual', '강사비').amount).toLocaleString()}</TableCell>
                                    <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('instructorActual', '강사비').details}</TableCell>
                                    <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                                </>
                            )}
                        </TableRow>
                        {!isInternalStaff && (
                        <TableRow>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>교통비(천원)</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('instructorActual', '교통비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('instructorActual', '교통비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>
                        )}
                        <TableRow>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>보조강사비(천원)</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('instructorActual', '보조강사비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('instructorActual', '보조강사비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>
                        
                        {/* 참가자 섹션 */}
                        <TableRow>
                            <TableCell rowSpan={5} align="center" style={{ fontWeight: 'bold', backgroundColor: '#e1e1e1' }}>참가자</TableCell>
                            <TableCell rowSpan={5} align="center" style={{ backgroundColor: '#e1e1e1' }}>집행금액(참가자)</TableCell>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>숙박비(천원)</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('participantActual', '숙박비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('participantActual', '숙박비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>식사비(천원)</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('participantActual', '식사비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('participantActual', '식사비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>재료비(천원)</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('participantActual', '재료비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('participantActual', '재료비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>기타비(천원)</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('participantActual', '기타비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('participantActual', '기타비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>예비비</TableCell>
                            <TableCell align="right" style={{ backgroundColor: 'white' }}>{parseInt(getExpenseData('participantActual', '예비비').amount).toLocaleString()}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}>{getExpenseData('participantActual', '예비비').details}</TableCell>
                            <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                        </TableRow>

                        {/* 합계 섹션 */}
                        <TableRow>
                            <TableCell colSpan={3} align="center" style={{...categoryCellStyle}}>합계</TableCell>
                            <TableCell align="right" style={{ fontWeight: 'bold' }}>{totalActual.toLocaleString()}</TableCell>
                            <TableCell colSpan={2}></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ExpenseContainer;