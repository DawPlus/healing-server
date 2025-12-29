import React, { useMemo } from "react";
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

// 프로그램 효과 컴포넌트
const ProgramEffect = ({ data = {} }) => {



    // Calculate prevent effect average scores
    const preventEffect = useMemo(() => {
        const result = {
            '사전': { sum: 0, avg: 0 },
            '사후': { sum: 0, avg: 0 }
        };
        
        // data.prevent 배열에서 직접 데이터 추출
        if (data.prevent && data.prevent.length >= 2) {
            const preData = data.prevent.find(item => item.type === '사전');
            const postData = data.prevent.find(item => item.type === '사후');
            
            if (preData) {
                result['사전'] = {
                    sum: preData.sum1 || 0,
                    avg: preData.avg1 || 0
                };
            }
            
            if (postData) {
                result['사후'] = {
                    sum: postData.sum1 || 0,
                    avg: postData.avg1 || 0
                };
            }
        }
        
        return result;
    }, [data.prevent]);
    
    // Calculate counsel effect average scores
    const counselEffect = useMemo(() => {
        const result = {
            '사전': { sum: 0, avg: 0 },
            '사후': { sum: 0, avg: 0 }
        };
        
        // data.counsel 배열에서 직접 데이터 추출
        if (data.counsel && data.counsel.length >= 2) {
            const preData = data.counsel.find(item => item.type === '사전');
            const postData = data.counsel.find(item => item.type === '사후');
            
            if (preData) {
                result['사전'] = {
                    sum: preData.sum1 || 0,
                    avg: preData.avg1 || 0
                };
            }
            
            if (postData) {
                result['사후'] = {
                    sum: postData.sum1 || 0,
                    avg: postData.avg1 || 0
                };
            }
        }
        
        return result;
    }, [data.counsel]);
    
    // Calculate healing effect average scores
    const healingEffect = useMemo(() => {
        const result = {
            '사전': { sum: 0, avg: 0 },
            '사후': { sum: 0, avg: 0 }
        };
        
        // data.healing 배열에서 직접 데이터 추출
        if (data.healing && data.healing.length >= 2) {
            const preData = data.healing.find(item => item.type === '사전');
            const postData = data.healing.find(item => item.type === '사후');
            
            if (preData) {
                result['사전'] = {
                    sum: preData.sum1 || 0,
                    avg: preData.avg1 || 0
                };
            }
            
            if (postData) {
                result['사후'] = {
                    sum: postData.sum1 || 0,
                    avg: postData.avg1 || 0
                };
            }
        }
        
        return result;
    }, [data.healing]);
    
    // Calculate HRV scores
    const hrvScores = useMemo(() => {
        const result = [];
        
        // data.hrv 배열에서 직접 데이터 추출
        if (data.hrv && data.hrv.length > 0) {
            // 데이터 형식 변환
            return data.hrv.map(item => ({
                pv: item.pv || item.type || '사후', // pv 또는 type 필드 사용
                num1: item.num1 || item.sum1 || 1,
                num2: item.num2 || item.sum2 || 2,
                num3: item.num3 || 3,
                num4: item.num4 || 4,
                num5: item.num5 || 5
            }));
        }
        
        return result;
    }, [data.hrv]);

    return (
        <>
            <div>
                <TableContainer style={{ marginTop: "20px" }}>
                    <h3 className="tableTitle">프로그램효과</h3>
                    <Table className="report custom-table">
                        <colgroup>
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell className="table-header" align="center" colSpan={3}>예방효과</TableCell>
                                <TableCell className="table-header" align="center" colSpan={3}>상담치유효과</TableCell>
                                <TableCell className="table-header" align="center" colSpan={3}>힐링효과</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="table-header" align="center">구분</TableCell>
                                <TableCell className="table-header" align="center">총점</TableCell>
                                <TableCell className="table-header" align="center">평점</TableCell>
                                <TableCell className="table-header" align="center">구분</TableCell>
                                <TableCell className="table-header" align="center">총점</TableCell>
                                <TableCell className="table-header" align="center">평점</TableCell>
                                <TableCell className="table-header" align="center">구분</TableCell>
                                <TableCell className="table-header" align="center">총점</TableCell>
                                <TableCell className="table-header" align="center">평점</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center">사전</TableCell>
                                <TableCell align="center">{preventEffect['사전'].sum}</TableCell>
                                <TableCell align="center">{preventEffect['사전'].avg}</TableCell>
                                <TableCell align="center">사전</TableCell>
                                <TableCell align="center">{counselEffect['사전'].sum}</TableCell>
                                <TableCell align="center">{counselEffect['사전'].avg}</TableCell>
                                <TableCell align="center">사전</TableCell>
                                <TableCell align="center">{healingEffect['사전'].sum}</TableCell>
                                <TableCell align="center">{healingEffect['사전'].avg}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">사후</TableCell>
                                <TableCell align="center">{preventEffect['사후'].sum}</TableCell>
                                <TableCell align="center">{preventEffect['사후'].avg}</TableCell>
                                <TableCell align="center">사후</TableCell>
                                <TableCell align="center">{counselEffect['사후'].sum}</TableCell>
                                <TableCell align="center">{counselEffect['사후'].avg}</TableCell>
                                <TableCell align="center">사후</TableCell>
                                <TableCell align="center">{healingEffect['사후'].sum}</TableCell>
                                <TableCell align="center">{healingEffect['사후'].avg}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {hrvScores.length > 0 && (
                <div>
                    <TableContainer style={{ marginTop: "20px" }}>
                        <h3 className="tableTitle">자율신경검사효과성</h3>
                        <Table className="report custom-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className="table-header" align="center" rowSpan={2}>구분</TableCell>
                                    <TableCell className="table-header" align="center" colSpan={2}>자율신경활성도</TableCell>
                                    <TableCell className="table-header" align="center" colSpan={2}>자율신경균형도</TableCell>
                                    <TableCell className="table-header" align="center" colSpan={2}>스트레스저항도</TableCell>
                                    <TableCell className="table-header" align="center" colSpan={2}>스트레스지수</TableCell>
                                    <TableCell className="table-header" align="center" colSpan={2}>피로도지수</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="table-header" align="center">총점</TableCell>
                                    <TableCell className="table-header" align="center">평점</TableCell>
                                    <TableCell className="table-header" align="center">총점</TableCell>
                                    <TableCell className="table-header" align="center">평점</TableCell>
                                    <TableCell className="table-header" align="center">총점</TableCell>
                                    <TableCell className="table-header" align="center">평점</TableCell>
                                    <TableCell className="table-header" align="center">총점</TableCell>
                                    <TableCell className="table-header" align="center">평점</TableCell>
                                    <TableCell className="table-header" align="center">총점</TableCell>
                                    <TableCell className="table-header" align="center">평점</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* 자율신경검사 데이터 */}
                                {hrvScores.map((i, key) => (
                                    <TableRow key={key}>
                                        <TableCell align="center">{i.pv}</TableCell>
                                        <TableCell align="center">{i.num1}</TableCell>
                                        <TableCell align="center">{i.num1}</TableCell>
                                        <TableCell align="center">{i.num2}</TableCell>
                                        <TableCell align="center">{i.num2}</TableCell>
                                        <TableCell align="center">{i.num3}</TableCell>
                                        <TableCell align="center">{i.num3}</TableCell>
                                        <TableCell align="center">{i.num4}</TableCell>
                                        <TableCell align="center">{i.num4}</TableCell>
                                        <TableCell align="center">{i.num5}</TableCell>
                                        <TableCell align="center">{i.num5}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </>
    );
}

export default ProgramEffect;