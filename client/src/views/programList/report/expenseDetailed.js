import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, TableHead } from '@mui/material';

// 지출금액 컴포넌트 (개별 항목 표시 버전)
const ExpenseDetailedContainer = ({ data = [], basicInfo = {}, page4Data = [] }) => {
    // 데이터가 있는지 확인
    const hasExpense = data && data.length > 0;
    const isInternalStaff = basicInfo.org_nature === '내부';

    // page4 데이터가 있는지 확인
    const hasPage4Data = page4Data && page4Data.length > 0;
    
    console.log('[ExpenseDetailed] 받은 데이터:', {
        dataLength: data?.length || 0,
        page4DataLength: page4Data?.length || 0,
        hasPage4Data
    });

    // 재료비, 기타비, 예비비 관련 데이터만 로그 출력
    const relevantData = data.filter(item => 
        item.ITEM.includes('재료비') || item.ITEM.includes('기타비') || item.ITEM.includes('예비비')
    );
    if (relevantData.length > 0) {
        console.log('[재료/기타/예비비] ExpenseDetailed 기존 데이터:', relevantData);
    }
    console.log("hasPage4Data",page4Data)
    console.log("hasPage4Data",data)
    

    // page4 데이터 로그 출력
    if (hasPage4Data) {
        page4Data.forEach((p4, index) => {
            console.log(`[ExpenseDetailed] Page4 데이터 ${index + 1}:`, {
                id: p4.id,
                project_name: p4.project_name,
                materialsCount: p4.materials?.length || 0,
                expensesCount: p4.expenses?.length || 0
            });
            
            if (p4.materials?.length > 0) {
                console.log(`[ExpenseDetailed] Page4 재료비 개별 항목:`, p4.materials);
                p4.materials.forEach((material, idx) => {
                    console.log(`  재료비 ${idx + 1}:`, {
                        id: material.id,
                        material_type: material.material_type,
                        note: material.note,
                        actual_amount: material.actual_amount,
                        quantity: material.quantity,
                        total: material.total
                    });
                });
            }
            
            if (p4.expenses?.length > 0) {
                console.log(`[ExpenseDetailed] Page4 기타비 개별 항목:`, p4.expenses);
                p4.expenses.forEach((expense, idx) => {
                    console.log(`  기타비 ${idx + 1}:`, {
                        id: expense.id,
                        expense_type: expense.expense_type,
                        note: expense.note,
                        actual_amount: expense.actual_amount,
                        amount: expense.amount
                    });
                });
            }
        });
    }

    // 예산 및 집행금액 분류 (개별 항목으로)
    const getExpensesByGroup = () => {
        if (!hasExpense) {
            return {};
        }
        
        // 집행금액(강사) - 개별 항목
        const instructorActual = data.filter(item => 
            item.ITEM.includes('_집행') && 
            (item.ITEM.includes('강사비') || item.ITEM.includes('교통비') || 
             item.ITEM.includes('보조강사비')) // 식사비 제외
        );
        
        // 집행금액(참가자) - 개별 항목
        const participantActual = data.filter(item => 
            item.ITEM.includes('_집행') && 
            (item.ITEM.includes('숙박비') || item.ITEM.includes('식사비') || 
             item.ITEM.includes('재료비') || item.ITEM.includes('기타비') ||
             item.ITEM.includes('예비비'))
        );

        // 재료비, 기타비, 예비비 관련 항목만 로그 출력
        const relevantParticipantActual = participantActual.filter(item => 
            item.ITEM.includes('재료비') || item.ITEM.includes('기타비') || item.ITEM.includes('예비비')
        );
        if (relevantParticipantActual.length > 0) {
            console.log('[재료/기타/예비비] 참가자 집행금액:', relevantParticipantActual);
        }

        return {
            instructorActual,
            participantActual
        };
    };

    const expenses = getExpensesByGroup();

    // 각 카테고리별 개별 항목들을 가져오기
    const instructorExpenseTypes = ['강사비', '교통비', '보조강사비'];
    const participantExpenseTypes = ['숙박비', '식사비', '재료비', '기타비', '예비비'];

    // 카테고리별로 그룹화하여 개별 항목 생성
    const getDetailedExpenseData = (group, itemType) => {
        let allItems = [];
        
        // page4 데이터가 있고 재료비나 기타비인 경우 page4 데이터만 사용 (기존 데이터 제외)
        if (hasPage4Data && (itemType === '재료비' || itemType === '기타비')) {
            console.log(`[ExpenseDetailed] Using ONLY page4 data for ${itemType} (excluding expense data to avoid duplicates)`);
            
            page4Data.forEach(p4 => {
                if (itemType === '재료비' && p4.materials) {
                    // 재료비 개별 항목 - 실제 집행금액 사용 (actual_amount * quantity 또는 total 사용)
                    p4.materials.forEach((material, index) => {
                        // 집행금액이므로 실제 금액 사용
                        const actualTotal = (material.actual_amount || 0) * (material.quantity || 0);
                        const executedAmount = actualTotal > 0 ? actualTotal : (material.total || 0);
                        
                        // 비고 형식: material_type(note)
                        const detailsText = material.material_type + (material.note ? `(${material.note})` : '');
                        
                        allItems.push({
                            amount: Math.round(executedAmount / 1000).toString(), // 천원 단위로 변환
                            details: detailsText,
                            category: itemType,
                            index: index,
                            id: material.id,
                            actualAmount: material.actual_amount || 0,
                            quantity: material.quantity || 0,
                            total: material.total || 0,
                            executedAmount: executedAmount,
                            source: 'page4'
                        });
                    });
                } else if (itemType === '기타비' && p4.expenses) {
                    // 기타비 개별 항목 - 실제 집행금액 사용
                    p4.expenses.forEach((expense, index) => {
                        // 집행금액이므로 실제 금액 우선 사용
                        const executedAmount = expense.actual_amount || expense.amount || 0;
                        
                        // 비고 형식: expense_type(note)
                        const detailsText = expense.expense_type + (expense.note ? `(${expense.note})` : '');
                        
                        allItems.push({
                            amount: Math.round(executedAmount / 1000).toString(), // 천원 단위로 변환
                            details: detailsText,
                            category: itemType,
                            index: index,
                            id: expense.id,
                            actualAmount: expense.actual_amount || 0,
                            expenseType: expense.expense_type || '',
                            executedAmount: executedAmount,
                            source: 'page4'
                        });
                    });
                }
            });
        } else {
            // page4 데이터가 없거나 재료비/기타비가 아닌 경우 기존 expense 데이터 사용
            if (expenses[group]) {
                const items = expenses[group].filter(i => i.ITEM.includes(itemType));
                items.forEach(item => {
                    allItems.push({
                        amount: item.PRICE,
                        details: item.DETAIL || '',
                        category: item.category || itemType,
                        index: item.index || 0,
                        source: 'expense'
                    });
                });
            }
        }
        
        console.log(`[ExpenseDetailed] 최종 ${itemType} 개별 항목 (천원 단위):`, allItems);
        allItems.forEach((item, idx) => {
            const amount = item.executedAmount || (parseInt(item.amount) * 1000);
            console.log(`  ${itemType} ${idx + 1}: ${item.details} - 금액: ${amount}원 → 천원: ${item.amount} (출처: ${item.source})`);
        });
        
        return allItems;
    };

    // 총 금액 계산 (중복 방지하여 정확한 합산)
    const getTotalAmount = (group) => {
        let total = 0;
        
        if (group === 'participantActual') {
            // 각 카테고리별로 getDetailedExpenseData를 사용하여 정확한 총합 계산
            participantExpenseTypes.forEach(expenseType => {
                const items = getDetailedExpenseData(group, expenseType);
                const categorySum = items.reduce((sum, item) => sum + parseInt(item.amount || 0), 0);
                total += categorySum;
                console.log(`[ExpenseDetailed] ${expenseType} 소계: ${categorySum} (항목 수: ${items.length})`);
            });
            
            console.log(`[ExpenseDetailed] 최종 ${group} 총합계: ${total}`);
            return total;
        } else if (group === 'instructorActual') {
            // 강사 관련 항목들 합계
            instructorExpenseTypes.forEach(expenseType => {
                // 내부 직원일 경우 강사비와 교통비는 제외
                if (isInternalStaff && (expenseType === '강사비' || expenseType === '교통비')) {
                    console.log(`[ExpenseDetailed] ${expenseType} 제외 (내부 직원)`);
                    return;
                }
                
                const items = getDetailedExpenseData(group, expenseType);
                const categorySum = items.reduce((sum, item) => sum + parseInt(item.amount || 0), 0);
                total += categorySum;
                console.log(`[ExpenseDetailed] ${expenseType} 소계: ${categorySum} (항목 수: ${items.length})`);
            });
            
            console.log(`[ExpenseDetailed] 최종 ${group} 총합계: ${total}`);
            return total;
        }
        
        // 기본 fallback 로직
        if (!expenses[group]) return 0;
        
        const fallbackTotal = expenses[group].reduce((sum, item) => {
            if (isInternalStaff && item.ITEM.includes('강사비')) {
                return sum;
            }
            return sum + parseInt(item.PRICE || 0);
        }, 0);
        console.log(`[ExpenseDetailed] Fallback ${group} 총합계: ${fallbackTotal}`);
        return fallbackTotal;
    };
    
    // 총 집행금액
    const totalActual = getTotalAmount('instructorActual') + getTotalAmount('participantActual');



    // 일반 셀 스타일 (카테고리 셀)
    const categoryCellStyle = {
        backgroundColor: '#e1e1e1',
        fontWeight: 'bold'
    };

    // 강사 섹션의 총 행 수 계산
    let instructorRowCount = 0;
    if (!isInternalStaff) {
        instructorRowCount += getDetailedExpenseData('instructorActual', '강사비').length || 1;
        instructorRowCount += getDetailedExpenseData('instructorActual', '교통비').length || 1;
    }
    instructorRowCount += getDetailedExpenseData('instructorActual', '보조강사비').length || 1;

    // 참가자 섹션의 총 행 수 계산
    const participantRowCount = participantExpenseTypes.reduce((count, type) => {
        return count + (getDetailedExpenseData('participantActual', type).length || 1);
    }, 0);

    let currentInstructorRow = 0;
    let currentParticipantRow = 0;

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
                        {instructorExpenseTypes.map((expenseType, typeIndex) => {
                            // 내부 직원일 경우 강사비와 교통비는 건너뛰기
                            if (isInternalStaff && (expenseType === '강사비' || expenseType === '교통비')) {
                                return null;
                            }

                            const expenseItems = getDetailedExpenseData('instructorActual', expenseType);
                            const itemsToRender = expenseItems.length > 0 ? expenseItems : [{ amount: "0", details: "", category: expenseType, index: 0 }];

                            return itemsToRender.map((item, itemIndex) => {
                                const isFirstItemOfType = itemIndex === 0;
                                const isFirstRowOverall = currentInstructorRow === 0;
                                
                                const row = (
                                    <TableRow key={`instructor-${expenseType}-${itemIndex}`}>
                                        {isFirstRowOverall && (
                                            <TableCell rowSpan={instructorRowCount} align="center" style={{ fontWeight: 'bold', backgroundColor: '#e1e1e1' }}>강사</TableCell>
                                        )}
                                        {isFirstRowOverall && (
                                            <TableCell rowSpan={instructorRowCount} align="center" style={{ backgroundColor: '#e1e1e1' }}>집행금액(강사)</TableCell>
                                        )}
                                        <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>
                                            {expenseType}(천원){expenseItems.length > 1 ? ` (${itemIndex + 1})` : ''}
                                        </TableCell>
                                        <TableCell align="right" style={{ backgroundColor: 'white' }}>
                                            {parseInt(item.amount || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: 'white' }}>{item.details}</TableCell>
                                        <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                                    </TableRow>
                                );
                                
                                currentInstructorRow++;
                                return row;
                            });
                        }).filter(Boolean)}
                        
                        {/* 참가자 섹션 */}
                        {participantExpenseTypes.map((expenseType, typeIndex) => {
                            const expenseItems = getDetailedExpenseData('participantActual', expenseType);
                            const itemsToRender = expenseItems.length > 0 ? expenseItems : [{ amount: "0", details: "", category: expenseType, index: 0 }];

                            return itemsToRender.map((item, itemIndex) => {
                                const isFirstRowOverall = currentParticipantRow === 0;
                                
                                const row = (
                                    <TableRow key={`participant-${expenseType}-${itemIndex}`}>
                                        {isFirstRowOverall && (
                                            <TableCell rowSpan={participantRowCount} align="center" style={{ fontWeight: 'bold', backgroundColor: '#e1e1e1' }}>참가자</TableCell>
                                        )}
                                        {isFirstRowOverall && (
                                            <TableCell rowSpan={participantRowCount} align="center" style={{ backgroundColor: '#e1e1e1' }}>집행금액(참가자)</TableCell>
                                        )}
                                        <TableCell style={{...categoryCellStyle, backgroundColor: 'white'}}>
                                            {expenseType}(천원){expenseItems.length > 1 ? ` (${itemIndex + 1})` : ''}
                                        </TableCell>
                                        <TableCell align="right" style={{ backgroundColor: 'white' }}>
                                            {parseInt(item.amount || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: 'white' }}>{item.details}</TableCell>
                                        <TableCell style={{ backgroundColor: 'white' }}></TableCell>
                                    </TableRow>
                                );
                                
                                currentParticipantRow++;
                                return row;
                            });
                        })}

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

export default ExpenseDetailedContainer; 