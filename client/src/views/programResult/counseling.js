import React , {useMemo}from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { makeStyles } from "@mui/styles";
import Button from '@mui/material/Button';

const useStyles = makeStyles({
    paper: {
        borderRadius: 0
    }
});

const Counseling = ({ searchType="" })=>{

    const classes = useStyles();
    
    // 상담&치유 서비스 목 데이터
    const MOCK_COUNSELING_DATA = [
        {
            NAME: "김서연",
            SEX: "여",
            RESIDENCE: "서울",
            JOB: "회사원",
            PTCPROGRAM: "스트레스 관리 상담",
            PAST_STRESS_EXPERIENCE: "있음",
            PV: "사전",
            SCORE1: "2.5",
            SCORE2: "2.8",
            SCORE3: "2.6",
            SCORE4: "2.4",
            SCORE5: "2.7",
            SCORE6: "2.3",
            SCORE7: "2.5",
            SCORE8: "2.2",
            SCORE9: "2.6",
            SCORE10: "2.8",
            SCORE11: "2.7",
            SCORE12: "2.5",
            SCORE13: "2.6",
            SCORE14: "2.3",
            SCORE15: "2.2",
            SCORE16: "2.5",
            SCORE17: "2.6",
            SCORE18: "2.4",
            SCORE19: "2.5",
            SCORE20: "2.7",
            sum1: "2.63",
            sum2: "2.50",
            sum3: "2.43",
            sum4: "2.50",
            sum5: "2.48",
            sum6: "2.53"
        },
        {
            NAME: "김서연",
            SEX: "여",
            RESIDENCE: "서울",
            JOB: "회사원",
            PTCPROGRAM: "스트레스 관리 상담",
            PAST_STRESS_EXPERIENCE: "있음",
            PV: "사후",
            SCORE1: "4.2",
            SCORE2: "4.5",
            SCORE3: "4.3",
            SCORE4: "4.6",
            SCORE5: "4.4",
            SCORE6: "4.7",
            SCORE7: "4.8",
            SCORE8: "4.5",
            SCORE9: "4.6",
            SCORE10: "4.9",
            SCORE11: "4.7",
            SCORE12: "4.6",
            SCORE13: "4.5",
            SCORE14: "4.8",
            SCORE15: "4.6",
            SCORE16: "4.7",
            SCORE17: "4.8",
            SCORE18: "4.6",
            SCORE19: "4.7",
            SCORE20: "4.9",
            sum1: "4.33",
            sum2: "4.57",
            sum3: "4.63",
            sum4: "4.63",
            sum5: "4.68",
            sum6: "4.73"
        },
        {
            NAME: "이민수",
            SEX: "남",
            RESIDENCE: "부산",
            JOB: "자영업",
            PTCPROGRAM: "관계 개선 상담",
            PAST_STRESS_EXPERIENCE: "없음",
            PV: "사전",
            SCORE1: "3.0",
            SCORE2: "3.2",
            SCORE3: "2.9",
            SCORE4: "3.1",
            SCORE5: "3.3",
            SCORE6: "2.8",
            SCORE7: "3.0",
            SCORE8: "2.7",
            SCORE9: "3.2",
            SCORE10: "2.9",
            SCORE11: "3.1",
            SCORE12: "3.3",
            SCORE13: "2.8",
            SCORE14: "3.0",
            SCORE15: "3.2",
            SCORE16: "2.9",
            SCORE17: "3.1",
            SCORE18: "3.0",
            SCORE19: "2.8",
            SCORE20: "3.2",
            sum1: "3.03",
            sum2: "3.07",
            sum3: "2.97",
            sum4: "3.07",
            sum5: "3.03",
            sum6: "3.00"
        },
        {
            NAME: "이민수",
            SEX: "남",
            RESIDENCE: "부산",
            JOB: "자영업",
            PTCPROGRAM: "관계 개선 상담",
            PAST_STRESS_EXPERIENCE: "없음",
            PV: "사후",
            SCORE1: "4.1",
            SCORE2: "4.3",
            SCORE3: "4.2",
            SCORE4: "4.4",
            SCORE5: "4.5",
            SCORE6: "4.3",
            SCORE7: "4.2",
            SCORE8: "4.0",
            SCORE9: "4.3",
            SCORE10: "4.1",
            SCORE11: "4.2",
            SCORE12: "4.4",
            SCORE13: "4.3",
            SCORE14: "4.5",
            SCORE15: "4.2",
            SCORE16: "4.1",
            SCORE17: "4.3",
            SCORE18: "4.2",
            SCORE19: "4.0",
            SCORE20: "4.4",
            sum1: "4.20",
            sum2: "4.40",
            sum3: "4.17",
            sum4: "4.30",
            sum5: "4.15",
            sum6: "4.20"
        },
        {
            NAME: "박지영",
            SEX: "여",
            RESIDENCE: "인천",
            JOB: "공무원",
            PTCPROGRAM: "스트레스 관리 프로그램",
            PAST_STRESS_EXPERIENCE: "있음",
            PV: "사전",
            SCORE1: "2.8",
            SCORE2: "3.0",
            SCORE3: "2.7",
            SCORE4: "2.9",
            SCORE5: "3.1",
            SCORE6: "2.6",
            SCORE7: "2.8",
            SCORE8: "2.5",
            SCORE9: "3.0",
            SCORE10: "2.7",
            SCORE11: "2.9",
            SCORE12: "3.1",
            SCORE13: "2.6",
            SCORE14: "2.8",
            SCORE15: "3.0",
            SCORE16: "2.7",
            SCORE17: "2.9",
            SCORE18: "2.8",
            SCORE19: "2.6",
            SCORE20: "3.0",
            sum1: "2.83",
            sum2: "2.87",
            sum3: "2.77",
            sum4: "2.87",
            sum5: "2.83",
            sum6: "2.80"
        },
        {
            NAME: "박지영",
            SEX: "여",
            RESIDENCE: "인천",
            JOB: "공무원",
            PTCPROGRAM: "스트레스 관리 프로그램",
            PAST_STRESS_EXPERIENCE: "있음",
            PV: "사후",
            SCORE1: "4.0",
            SCORE2: "4.2",
            SCORE3: "4.1",
            SCORE4: "4.3",
            SCORE5: "4.4",
            SCORE6: "4.2",
            SCORE7: "4.1",
            SCORE8: "3.9",
            SCORE9: "4.2",
            SCORE10: "4.0",
            SCORE11: "4.1",
            SCORE12: "4.3",
            SCORE13: "4.2",
            SCORE14: "4.4",
            SCORE15: "4.1",
            SCORE16: "4.0",
            SCORE17: "4.2",
            SCORE18: "4.1",
            SCORE19: "3.9",
            SCORE20: "4.3",
            sum1: "4.10",
            sum2: "4.30",
            sum3: "4.07",
            sum4: "4.20",
            sum5: "4.05",
            sum6: "4.10"
        }
    ];

    // 검색 타입에 따른 필터링
    const filteredData = useMemo(() => {
        if (!searchType) return MOCK_COUNSELING_DATA;
        return MOCK_COUNSELING_DATA.filter(item => {
            if (searchType === "SEX") return true; // 성별 구분 없이 모두 표시
            if (searchType === "AGE") return true; // 연령 구분 없이 모두 표시
            if (searchType === "RESIDENCE") return true; // 거주지 구분 없이 모두 표시
            if (searchType === "JOB") return true; // 직업 구분 없이 모두 표시
            return true;
        });
    }, [searchType]);

    // 사전 평가 평균 계산
    const [AVG1, AVG2, AVG3, AVG4, AVG5, AVG6] = useMemo(() => {
        return [
            "sum1", "sum2", "sum3", "sum4", "sum5", "sum6"
        ].map(k => {
            const preData = filteredData.filter(i => i.PV === "사전");
            if (preData.length === 0) return "0.00";
            const sum = preData.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
            return (sum / preData.length).toFixed(2);
        });
    }, [filteredData]);

    // 사후 평가 평균 계산
    const [AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A] = useMemo(() => {
        return [
            "sum1", "sum2", "sum3", "sum4", "sum5", "sum6"
        ].map(k => {
            const postData = filteredData.filter(i => i.PV === "사후");
            if (postData.length === 0) return "0.00";
            const sum = postData.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
            return (sum / postData.length).toFixed(2);
        });
    }, [filteredData]);

    // 엑셀 다운로드 기능
    const handleExcelDownload = () => {
        alert("엑셀 다운로드는 목 데이터에서 지원되지 않습니다.");
    };

    return (
        <>
            <div style={{ padding: "10px 0px", textAlign: "right" }}>
                <Button variant="contained" color="primary" size="small" onClick={handleExcelDownload}>Excel 다운로드</Button>
            </div>
            <TableContainer component={Paper} className={classes.paper}>
                <Table className="custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" rowSpan={2}>순번</TableCell>
                            <TableCell align="center" rowSpan={2}>이름</TableCell>
                            <TableCell align="center" rowSpan={2}>성별</TableCell>
                            <TableCell align="center" rowSpan={2}>거주지</TableCell>
                            <TableCell align="center" rowSpan={2}>직업</TableCell>
                            <TableCell align="center" rowSpan={2}>참여 프로그램</TableCell>
                            <TableCell align="center" rowSpan={2}>과거 서비스 경험</TableCell>
                            <TableCell align="center" rowSpan={2}>평가시점</TableCell>
                            <TableCell align="center" colSpan={6}>영역별 평균 점수</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">스트레스관리</TableCell>
                            <TableCell align="center">우울감개선</TableCell>
                            <TableCell align="center">불안감감소</TableCell>
                            <TableCell align="center">자기이해</TableCell>
                            <TableCell align="center">대인관계</TableCell>
                            <TableCell align="center">정서조절</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* 통계 행 */}
                        <TableRow>
                            <TableCell align="center" colSpan={7} rowSpan={3}>평균</TableCell>
                            <TableCell align="center">사전</TableCell>
                            <TableCell align="center">{AVG1}</TableCell>
                            <TableCell align="center">{AVG2}</TableCell>
                            <TableCell align="center">{AVG3}</TableCell>
                            <TableCell align="center">{AVG4}</TableCell>
                            <TableCell align="center">{AVG5}</TableCell>
                            <TableCell align="center">{AVG6}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">사후</TableCell>
                            <TableCell align="center">{AVG1_A}</TableCell>
                            <TableCell align="center">{AVG2_A}</TableCell>
                            <TableCell align="center">{AVG3_A}</TableCell>
                            <TableCell align="center">{AVG4_A}</TableCell>
                            <TableCell align="center">{AVG5_A}</TableCell>
                            <TableCell align="center">{AVG6_A}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">차이값</TableCell>
                            <TableCell align="center">{(AVG1_A - AVG1).toFixed(2)}</TableCell>
                            <TableCell align="center">{(AVG2_A - AVG2).toFixed(2)}</TableCell>
                            <TableCell align="center">{(AVG3_A - AVG3).toFixed(2)}</TableCell>
                            <TableCell align="center">{(AVG4_A - AVG4).toFixed(2)}</TableCell>
                            <TableCell align="center">{(AVG5_A - AVG5).toFixed(2)}</TableCell>
                            <TableCell align="center">{(AVG6_A - AVG6).toFixed(2)}</TableCell>
                        </TableRow>

                        {/* 데이터 행 */}
                        {filteredData.map((item, index) => {
                            const rowNumber = Math.floor(index / 2) + 1;
                            return (
                                <TableRow key={index}>
                                    <TableCell align="center">{index % 2 === 0 ? rowNumber : ""}</TableCell>
                                    <TableCell align="center">{index % 2 === 0 ? item.NAME : ""}</TableCell>
                                    <TableCell align="center">{index % 2 === 0 ? item.SEX : ""}</TableCell>
                                    <TableCell align="center">{index % 2 === 0 ? item.RESIDENCE : ""}</TableCell>
                                    <TableCell align="center">{index % 2 === 0 ? item.JOB : ""}</TableCell>
                                    <TableCell align="center">{index % 2 === 0 ? item.PTCPROGRAM : ""}</TableCell>
                                    <TableCell align="center">{index % 2 === 0 ? item.PAST_STRESS_EXPERIENCE : ""}</TableCell>
                                    <TableCell align="center">{item.PV}</TableCell>
                                    <TableCell align="center">{item.sum1}</TableCell>
                                    <TableCell align="center">{item.sum2}</TableCell>
                                    <TableCell align="center">{item.sum3}</TableCell>
                                    <TableCell align="center">{item.sum4}</TableCell>
                                    <TableCell align="center">{item.sum5}</TableCell>
                                    <TableCell align="center">{item.sum6}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default Counseling; 