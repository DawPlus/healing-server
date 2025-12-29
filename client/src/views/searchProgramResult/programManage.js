import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const ProgramManage = ({ data }) => {
    const { manage = [], bunya = [] } = data?.programManage || {};

    // 한글 필드명과 영문 필드명 매핑
    const fieldMapping = {
        forestEducation: '산림교육',
        preventEducation: '예방교육',
        forestHealing: '산림치유',
        art: '아트',
        relaxing: '릴렉싱',
        energetic: '에너제틱',
        cooking: '쿠킹',
        event: '이벤트',
        total: '합계'
    };

    return (
        <>
            <TableContainer style={{marginTop: "20px"}}>
                <h3 className="tableTitle" style={{marginBottom: "0px"}}>프로그램운영/만족도</h3>
                <Table className="report custom-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header"></TableCell>
                            <TableCell className="table-header">구분</TableCell>
                            <TableCell className="table-header">{fieldMapping.forestEducation}</TableCell>
                            <TableCell className="table-header">{fieldMapping.preventEducation}</TableCell>
                            <TableCell className="table-header">{fieldMapping.forestHealing}</TableCell>
                            <TableCell className="table-header">{fieldMapping.art}</TableCell>
                            <TableCell className="table-header">{fieldMapping.relaxing}</TableCell>
                            <TableCell className="table-header">{fieldMapping.energetic}</TableCell>
                            <TableCell className="table-header">{fieldMapping.cooking}</TableCell>
                            <TableCell className="table-header">{fieldMapping.event}</TableCell>
                            <TableCell className="table-header">{fieldMapping.total}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {manage.map((row, index) => (
                            <TableRow key={index}>
                                {index === 0 ? <TableCell className="table-header" rowSpan={3}>프로그램운영</TableCell> : null}
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.forestEducation}</TableCell>
                                <TableCell>{row.preventEducation}</TableCell>
                                <TableCell>{row.forestHealing}</TableCell>
                                <TableCell>{row.art}</TableCell>
                                <TableCell>{row.relaxing}</TableCell>
                                <TableCell>{row.energetic}</TableCell>
                                <TableCell>{row.cooking}</TableCell>
                                <TableCell>{row.event}</TableCell>
                                <TableCell>{row.total}</TableCell>
                            </TableRow>
                        ))}
                        
                        {bunya
                            .filter(data => data.type !== "참여인원")
                            .map((row, index) => (
                                <TableRow key={`bunya-${index}`}>                        
                                    {index === 0 ? <TableCell className="table-header" rowSpan={4}>프로그램만족도</TableCell> : null}
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.forestEducation}</TableCell>
                                    <TableCell>{row.preventEducation}</TableCell>
                                    <TableCell>{row.forestHealing}</TableCell>
                                    <TableCell>{row.art}</TableCell>
                                    <TableCell>{row.relaxing}</TableCell>
                                    <TableCell>{row.energetic}</TableCell>
                                    <TableCell>{row.cooking}</TableCell>
                                    <TableCell>{row.event}</TableCell>
                                    <TableCell>-</TableCell>
                                </TableRow>           
                        ))}
                        
                        {bunya
                            .filter(data => data.type === "참여인원")
                            .map((row, index) => (
                                <TableRow key={`participants-${index}`}>                        
                                    <TableCell className="table-header" colSpan={2}>참여인원</TableCell>
                                    <TableCell>{row.forestEducation}</TableCell>
                                    <TableCell>{row.preventEducation}</TableCell>
                                    <TableCell>{row.forestHealing}</TableCell>
                                    <TableCell>{row.art}</TableCell>
                                    <TableCell>{row.relaxing}</TableCell>
                                    <TableCell>{row.energetic}</TableCell>
                                    <TableCell>{row.cooking}</TableCell>
                                    <TableCell>{row.event}</TableCell>
                                    <TableCell>-</TableCell>
                                </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ProgramManage;