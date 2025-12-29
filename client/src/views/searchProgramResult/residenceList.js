import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const ResidenceList = ({ data, isCloseMineCount = 0 }) => {
    const residenceList = data?.residenceList || [];
    
    // Define header for residence types
    const headerInfo = [
        "서울", '부산', '대구', '인천', '대전', '광주', '울산', '경기', '강원', '폐광지역', '충북', '충남', '세종', '경북', '경남', '전북', '전남', '제주'
    ];

    // Calculate the sum of the count values
    const totalCount = residenceList.reduce((sum, item) => sum + item.count, 0);

    // Calculate the sum of the total values
    const totalSum = residenceList.reduce((sum, item) => sum + item.total, 0);

    // Calculate the percentage of participants near the mine (폐광지역)
    const mineArea = residenceList.find(item => item.RESIDENCE === '폐광지역') || { count: 0, total: 0 };
    const minePercentage = totalSum > 0 
        ? ((mineArea.total / totalSum) * 100).toFixed(2) 
        : 0;

    return (
        <>
            <TableContainer style={{marginTop: "20px"}}>
                <h3 className="tableTitle" style={{marginBottom: "0px"}}>지역</h3>
                <Table className="report custom-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header">지역</TableCell>
                            {headerInfo.map((i, idx) => 
                                <TableCell className="table-header" key={idx} align="center">{i}</TableCell>
                            )}
                            <TableCell className="table-header">계</TableCell>
                            <TableCell className="table-header">폐광지역</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>유형(건)</TableCell>
                            {headerInfo.map((header) => (
                                <TableCell key={header}>
                                    {residenceList.find((item) => item.RESIDENCE === header)?.count || 0}
                                </TableCell>
                            ))}
                            <TableCell>{totalCount}</TableCell>
                            <TableCell rowSpan={2}>{isCloseMineCount}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>인원(수)</TableCell>
                            {headerInfo.map((header) => (
                                <TableCell key={header}>
                                    {residenceList.find((item) => item.RESIDENCE === header)?.total || 0}
                                </TableCell>
                            ))}
                            <TableCell>{totalSum}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <div style={{ marginTop: "15px" }}>폐광지역 거주자: {minePercentage}% (총 {isCloseMineCount}건)</div>
        </>
    );
};

export default ResidenceList;