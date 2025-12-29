import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, TableHead, Box, Typography, Divider } from '@mui/material';

// Updated header configuration for rowSpan and colSpan
const headerConfig = [
    // First header row definition
    [
        { label: "지출및매출금액", rowSpan: 2, align: 'center' },
        { label: "지출(천원)", colSpan: 10, align: 'center' },
        { label: "수입(천원)", colSpan: 6, align: 'center' },
        { label: "최종금액", rowSpan: 2, align: 'center' }
    ],
    // Second header row definition (Cells under colspan headers)
    [
        // Cells under "지출(천원)"
        { label: '강사비', align: 'center' }, { label: '강사교통비', align: 'center' }, { label: '강사식비', align: 'center' }, { label: '보조강사비', align: 'center' }, { label: '참가자숙박', align: 'center' }, { label: '참가자식비', align: 'center' }, { label: '재료비', align: 'center' }, { label: '기타비', align: 'center' }, { label: '예비비', align: 'center' }, { label: '합계', align: 'center' },
        // Cells under "수입(천원)"
        { label: '프로그램', align: 'center' }, { label: '숙박비', align: 'center' }, { label: '식사비', align: 'center' }, { label: '재료비', align: 'center' }, { label: '기타비', align: 'center' }, { label: '합계', align: 'center' }
    ]
];

// 수입지출
const ExIncomeList = ({ data }) => {
    // Log the received data prop (which should be the exIncomeList object itself)
    console.log("[ExIncomeList] Received data prop:", JSON.stringify(data, null, 2));

    // Use the 'data' prop directly. Provide defaults if 'data' is null/undefined.
    const { expend = {}, income = {}, incomeTotal = null } = data || {}; 

    // Function to format numbers or return a placeholder
    const formatValue = (value) => {
        if (value === null || value === undefined || value === 0) {
            // Display '-' for null, undefined, or zero values
            return '-'; 
        }
        // Add comma formatting for non-zero numbers
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
    };

    return (
        <>
            <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>
                지출 및 매출 금액
            </h3>
            <TableContainer>
                <Table className="report custom-table">
                    <TableHead>
                        {headerConfig.map((row, rowIndex) => (
                            <TableRow key={`header-row-${rowIndex}`}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell
                                        key={`header-cell-${rowIndex}-${cellIndex}`}
                                        align={cell.align || 'center'}
                                        colSpan={cell.colSpan || 1}
                                        rowSpan={cell.rowSpan || 1}
                                        className="table-header"
                                    >
                                        {cell.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center">구분</TableCell>
                            <TableCell align="center">{formatValue(expend.instructorExecutedCost)}</TableCell>
                            <TableCell align="center">{formatValue(expend.instructorExecutedTransportation)}</TableCell>
                            <TableCell align="center">{formatValue(expend.instructorExecutedMeals)}</TableCell>
                            <TableCell align="center">{formatValue(expend.instructorExecutedAssistant)}</TableCell>
                            <TableCell align="center">{formatValue(expend.customerExecutedAccommodation)}</TableCell>
                            <TableCell align="center">{formatValue(expend.customerExecutedMeals)}</TableCell>
                            <TableCell align="center">{formatValue(expend.customerExecutedMaterials)}</TableCell>
                            <TableCell align="center">{formatValue(expend.customerExecutedOthers)}</TableCell>
                            <TableCell align="center">{formatValue(expend.reserve)}</TableCell>
                            <TableCell align="center">{formatValue(expend.total)}</TableCell>
                            <TableCell align="center">{formatValue(income.program)}</TableCell>
                            <TableCell align="center">{formatValue(income.accommodation)}</TableCell>
                            <TableCell align="center">{formatValue(income.meals)}</TableCell>
                            <TableCell align="center">{formatValue(income.materials)}</TableCell>
                            <TableCell align="center">{formatValue(income.other)}</TableCell>
                            <TableCell align="center">{formatValue(income.total)}</TableCell>
                            <TableCell align="center">{formatValue(incomeTotal)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
        </>
    );
};

export default ExIncomeList;