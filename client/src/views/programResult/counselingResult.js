import React, { useMemo } from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from "@mui/styles";
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import DynamicTableHead from "ui-component/DynamicTableHead";
import { generateMergeInfo } from "utils/utils";

const useStyles = makeStyles({
    paper: {
        borderRadius: 0
    }
});

const CounselingResult = ({ rows = [] }) => {
    const classes = useStyles();
    
    // 상담&치유 서비스 효과평가를 위한 헤더 정보
    const headerInfo = [
        ['주제어1', '주제어2', '주제어3', '영역', '1.스트레스관리', '1.스트레스관리', '1.스트레스관리', '2.우울감개선', '2.우울감개선', '2.우울감개선', '3.불안감감소', '3.불안감감소', '3.불안감감소', '4.자기이해', '4.자기이해', '4.자기이해', '5.대인관계', '5.대인관계', '5.대인관계', '5.대인관계', '6.정서조절', '6.정서조절', '6.정서조절', '영역', '평균(0~6점)', '평균(0~6점)', '평균(0~6점)', '평균(0~6점)', '평균(0~6점)', '평균(0~6점)'],
        ['', '', '', '평가시점', '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', '문항11', '문항12', '문항13', '문항14', '문항15', '문항16', '문항17', '문항18', '문항19', '문항20', '평가시점', '스트레스관리', '우울감개선', '불안감감소', '자기이해', '대인관계', '정서조절']
    ];

    // Mock data for counseling
    const MOCK_COUNSELING_DATA = !rows.length ? [
        {
            id: 1,
            keyword0: "30대",
            keyword1: "여성",
            keyword2: "직장인",
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
            id: 2,
            keyword0: "30대",
            keyword1: "여성",
            keyword2: "직장인",
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
            id: 3,
            keyword0: "40대",
            keyword1: "남성",
            keyword2: "자영업",
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
            id: 4,
            keyword0: "40대",
            keyword1: "남성",
            keyword2: "자영업",
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
        }
    ] : rows;

    // 사전 평가 평균 계산
    const [AVG1, AVG2, AVG3, AVG4, AVG5, AVG6, AVG7, AVG8, AVG9, AVG10, AVG11, AVG12, AVG13, AVG14, AVG15, AVG16, AVG17, AVG18, AVG19, AVG20, SUMAVG1, SUMAVG2, SUMAVG3, SUMAVG4, SUMAVG5, SUMAVG6] = useMemo(() => {
        return [
            "SCORE1", "SCORE2", "SCORE3", "SCORE4", "SCORE5", "SCORE6", "SCORE7", "SCORE8", "SCORE9", "SCORE10",
            "SCORE11", "SCORE12", "SCORE13", "SCORE14", "SCORE15", "SCORE16", "SCORE17", "SCORE18", "SCORE19", "SCORE20",
            "sum1", "sum2", "sum3", "sum4", "sum5", "sum6"
        ].map(k => {
            const preData = MOCK_COUNSELING_DATA.filter(i => i.PV === "사전");
            if (preData.length === 0) return "0.00";
            const sum = preData.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
            return (sum / preData.length).toFixed(2);
        });
    }, [MOCK_COUNSELING_DATA]);

    // 사후 평가 평균 계산
    const [AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A, AVG7_A, AVG8_A, AVG9_A, AVG10_A, AVG11_A, AVG12_A, AVG13_A, AVG14_A, AVG15_A, AVG16_A, AVG17_A, AVG18_A, AVG19_A, AVG20_A, SUMAVG1_A, SUMAVG2_A, SUMAVG3_A, SUMAVG4_A, SUMAVG5_A, SUMAVG6_A] = useMemo(() => {
        return [
            "SCORE1", "SCORE2", "SCORE3", "SCORE4", "SCORE5", "SCORE6", "SCORE7", "SCORE8", "SCORE9", "SCORE10",
            "SCORE11", "SCORE12", "SCORE13", "SCORE14", "SCORE15", "SCORE16", "SCORE17", "SCORE18", "SCORE19", "SCORE20",
            "sum1", "sum2", "sum3", "sum4", "sum5", "sum6"
        ].map(k => {
            const postData = MOCK_COUNSELING_DATA.filter(i => i.PV === "사후");
            if (postData.length === 0) return "0.00";
            const sum = postData.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
            return (sum / postData.length).toFixed(2);
        });
    }, [MOCK_COUNSELING_DATA]);

    // 테이블에 표시할 데이터 매핑
    const cellData = MOCK_COUNSELING_DATA.map((item, idx) => Object.values({
        keyword0: idx % 2 === 0 ? item.keyword0 : "",
        keyword1: idx % 2 === 0 ? item.keyword1 : "",
        keyword2: idx % 2 === 0 ? item.keyword2 : "",
        PV: item.PV,
        SCORE1: item.SCORE1,
        SCORE2: item.SCORE2,
        SCORE3: item.SCORE3,
        SCORE4: item.SCORE4,
        SCORE5: item.SCORE5,
        SCORE6: item.SCORE6,
        SCORE7: item.SCORE7,
        SCORE8: item.SCORE8,
        SCORE9: item.SCORE9,
        SCORE10: item.SCORE10,
        SCORE11: item.SCORE11,
        SCORE12: item.SCORE12,
        SCORE13: item.SCORE13,
        SCORE14: item.SCORE14,
        SCORE15: item.SCORE15,
        SCORE16: item.SCORE16,
        SCORE17: item.SCORE17,
        SCORE18: item.SCORE18,
        SCORE19: item.SCORE19,
        SCORE20: item.SCORE20,
        PVs: item.PV,
        sum1: item.sum1,
        sum2: item.sum2,
        sum3: item.sum3,
        sum4: item.sum4,
        sum5: item.sum5,
        sum6: item.sum6,
    }));

    // Merge Info 
    const merges = generateMergeInfo(headerInfo);
    const wscols = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 13 }, { wch: 13 }, { wch: 11 }, { wch: 13 }];

    // 엑셀 다운로드 기능
    const handleExcelDownload = () => {
        alert("엑셀 다운로드는 목 데이터에서 지원되지 않습니다.");
    };

    return (
        <>
            <div style={{ padding: "10px 0px", textAlign: "right" }}>
                <Button variant="contained" color="primary" size="small" onClick={handleExcelDownload}>Excel 다운로드</Button>
            </div>
            <TableContainer component={Paper} className={classes.paper} sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }} aria-label="spanning table" size="small" className="custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <TableBody>
                        {/* 통계 */}
                        <TableRow>
                            <TableCell className="table-result" align="center" colSpan={2} rowSpan={3}>통계</TableCell>
                            <TableCell className="table-result" align="center" rowSpan={3}>평균</TableCell>
                            <TableCell className="table-result" align="center">사전</TableCell>
                            <TableCell className="table-result" align="center">{AVG1}</TableCell>
                            <TableCell className="table-result" align="center">{AVG2}</TableCell>
                            <TableCell className="table-result" align="center">{AVG3}</TableCell>
                            <TableCell className="table-result" align="center">{AVG4}</TableCell>
                            <TableCell className="table-result" align="center">{AVG5}</TableCell>
                            <TableCell className="table-result" align="center">{AVG6}</TableCell>
                            <TableCell className="table-result" align="center">{AVG7}</TableCell>
                            <TableCell className="table-result" align="center">{AVG8}</TableCell>
                            <TableCell className="table-result" align="center">{AVG9}</TableCell>
                            <TableCell className="table-result" align="center">{AVG10}</TableCell>
                            <TableCell className="table-result" align="center">{AVG11}</TableCell>
                            <TableCell className="table-result" align="center">{AVG12}</TableCell>
                            <TableCell className="table-result" align="center">{AVG13}</TableCell>
                            <TableCell className="table-result" align="center">{AVG14}</TableCell>
                            <TableCell className="table-result" align="center">{AVG15}</TableCell>
                            <TableCell className="table-result" align="center">{AVG16}</TableCell>
                            <TableCell className="table-result" align="center">{AVG17}</TableCell>
                            <TableCell className="table-result" align="center">{AVG18}</TableCell>
                            <TableCell className="table-result" align="center">{AVG19}</TableCell>
                            <TableCell className="table-result" align="center">{AVG20}</TableCell>
                            <TableCell className="table-result" align="center">사전</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG1}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG2}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG3}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG4}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG5}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG6}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-result" align="center">사후</TableCell>
                            <TableCell className="table-result" align="center">{AVG1_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG2_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG3_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG4_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG5_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG6_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG7_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG8_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG9_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG10_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG11_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG12_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG13_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG14_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG15_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG16_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG17_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG18_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG19_A}</TableCell>
                            <TableCell className="table-result" align="center">{AVG20_A}</TableCell>
                            <TableCell className="table-result" align="center">사후</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG1_A}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG2_A}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG3_A}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG4_A}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG5_A}</TableCell>
                            <TableCell className="table-result" align="center">{SUMAVG6_A}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-result" align="center">차이값</TableCell>
                            <TableCell className="table-result" align="center">{(AVG1_A - AVG1).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG2_A - AVG2).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG3_A - AVG3).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG4_A - AVG4).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG5_A - AVG5).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG6_A - AVG6).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG7_A - AVG7).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG8_A - AVG8).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG9_A - AVG9).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG10_A - AVG10).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG11_A - AVG11).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG12_A - AVG12).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG13_A - AVG13).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG14_A - AVG14).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG15_A - AVG15).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG16_A - AVG16).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG17_A - AVG17).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG18_A - AVG18).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG19_A - AVG19).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(AVG20_A - AVG20).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">차이값</TableCell>
                            <TableCell className="table-result" align="center">{(SUMAVG1_A - SUMAVG1).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(SUMAVG2_A - SUMAVG2).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(SUMAVG3_A - SUMAVG3).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(SUMAVG4_A - SUMAVG4).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(SUMAVG5_A - SUMAVG5).toFixed(2)}</TableCell>
                            <TableCell className="table-result" align="center">{(SUMAVG6_A - SUMAVG6).toFixed(2)}</TableCell>
                        </TableRow>

                        {/* 데이터 행 */}
                        {MOCK_COUNSELING_DATA.map((row, idx) => (
                            <TableRow key={idx}>
                                {idx % 2 === 0 && (
                                    <>
                                        <TableCell rowSpan={2} align="center">{row.keyword0}</TableCell>
                                        <TableCell rowSpan={2} align="center">{row.keyword1}</TableCell>
                                        <TableCell rowSpan={2} align="center">{row.keyword2}</TableCell>
                                    </>
                                )}
                                <TableCell align="center">{row.PV}</TableCell>
                                <TableCell align="center">{row.SCORE1}</TableCell>
                                <TableCell align="center">{row.SCORE2}</TableCell>
                                <TableCell align="center">{row.SCORE3}</TableCell>
                                <TableCell align="center">{row.SCORE4}</TableCell>
                                <TableCell align="center">{row.SCORE5}</TableCell>
                                <TableCell align="center">{row.SCORE6}</TableCell>
                                <TableCell align="center">{row.SCORE7}</TableCell>
                                <TableCell align="center">{row.SCORE8}</TableCell>
                                <TableCell align="center">{row.SCORE9}</TableCell>
                                <TableCell align="center">{row.SCORE10}</TableCell>
                                <TableCell align="center">{row.SCORE11}</TableCell>
                                <TableCell align="center">{row.SCORE12}</TableCell>
                                <TableCell align="center">{row.SCORE13}</TableCell>
                                <TableCell align="center">{row.SCORE14}</TableCell>
                                <TableCell align="center">{row.SCORE15}</TableCell>
                                <TableCell align="center">{row.SCORE16}</TableCell>
                                <TableCell align="center">{row.SCORE17}</TableCell>
                                <TableCell align="center">{row.SCORE18}</TableCell>
                                <TableCell align="center">{row.SCORE19}</TableCell>
                                <TableCell align="center">{row.SCORE20}</TableCell>
                                <TableCell align="center">{row.PV}</TableCell>
                                <TableCell align="center">{row.sum1}</TableCell>
                                <TableCell align="center">{row.sum2}</TableCell>
                                <TableCell align="center">{row.sum3}</TableCell>
                                <TableCell align="center">{row.sum4}</TableCell>
                                <TableCell align="center">{row.sum5}</TableCell>
                                <TableCell align="center">{row.sum6}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default CounselingResult; 