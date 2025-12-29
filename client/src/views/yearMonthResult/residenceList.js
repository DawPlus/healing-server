import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';

const ResidenceList = ({ data, isCloseMineCount }) => {
    // Expect data in the format { residenceList: [...] }
    console.log("ResidenceList data prop:", data);
    const residenceList = data?.residenceList || [];
    
    const regionCounts = {};
    let totalTypeCount = 0;
    let totalParticipantCount = 0;
    
    if (Array.isArray(residenceList) && residenceList.length > 0) {
        residenceList.forEach(item => {
            // Use the region field directly from the item
            const region = item.region || '기타'; 
            if (!regionCounts[region]) {
                regionCounts[region] = { typeCount: 0, participantCount: 0 };
            }
            regionCounts[region].typeCount += 1; // Count occurrences (types/건)
            regionCounts[region].participantCount += item.total_count || 0; // Sum participants (인원/수)
            totalTypeCount += 1;
            totalParticipantCount += item.total_count || 0;
        });
    }
    
    // 모든 지역 목록 (고정)
    const allAreas = ['서울', '부산', '대구', '인천', '대전', '광주', '울산', '경기', '강원', '충북', '충남', '세종', '경북', '경남', '전북', '전남', '제주', '기타'];
    
    return (
        <>
            {/* <h3 className="tableTitle">지역</h3> */}
            <TableContainer>
                <Table className="report custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" align="center">지역</TableCell>
                            {allAreas.map(area => (
                                <TableCell key={area} className="table-header" align="center">{area}</TableCell>
                            ))}
                            <TableCell className="table-header" align="center">계</TableCell>
                            <TableCell className="table-header" align="center">폐광지역</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center">유형(건)</TableCell>
                            {allAreas.map(area => (
                                <TableCell key={area} align="center">{regionCounts[area]?.typeCount || 0}</TableCell>
                            ))}
                            <TableCell align="center">{totalTypeCount}</TableCell>
                            <TableCell align="center">{isCloseMineCount || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">인원(수)</TableCell>
                            {allAreas.map(area => (
                                <TableCell key={area} align="center">
                                    {regionCounts[area]?.participantCount || 0}
                                </TableCell>
                            ))}
                            <TableCell align="center">{totalParticipantCount}</TableCell>
                            <TableCell align="center"></TableCell> 
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
        </>
    );
};

export default ResidenceList;