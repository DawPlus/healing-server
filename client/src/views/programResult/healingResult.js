import React, { useState, useMemo } from "react";
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

const HealingResult = ({ rows = [] }) => {
  const classes = useStyles();
  
  // If no rows provided, use mock data
  const mockRows = [
    {
      NAME: "이영희",
      SEX: "여",
      RESIDENCE: "경기도",
      JOB: "교사",
      PTCPROGRAM: "자연치유 워크샵",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사전",
      SCORE1: 3.9,
      SCORE2: 4.0,
      SCORE3: 3.8,
      SCORE4: 4.1,
      SCORE5: 3.9,
      SCORE6: 4.0,
      SCORE7: 3.9,
      SCORE8: 3.8,
      SCORE9: 4.1,
      SCORE10: 3.9,
      SCORE11: 4.0,
      SCORE12: 3.9,
      SCORE13: 3.8,
      SCORE14: 4.0,
      SCORE15: 3.9,
      SCORE16: 4.0,
      SCORE17: 3.9,
      SCORE18: 3.8,
      SCORE19: 3.9,
      SCORE20: 4.0,
      SCORE21: 3.9,
      SCORE22: 3.8,
      sum1: 3.95,
      sum2: 3.95,
      sum3: 3.95,
      sum4: 3.95,
      sum5: 3.9,
      sum6: 3.95,
      sum7: 3.85
    },
    {
      NAME: "이영희",
      SEX: "여",
      RESIDENCE: "경기도",
      JOB: "교사",
      PTCPROGRAM: "자연치유 워크샵",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사후",
      SCORE1: 4.5,
      SCORE2: 4.6,
      SCORE3: 4.4,
      SCORE4: 4.7,
      SCORE5: 4.5,
      SCORE6: 4.6,
      SCORE7: 4.5,
      SCORE8: 4.4,
      SCORE9: 4.7,
      SCORE10: 4.5,
      SCORE11: 4.6,
      SCORE12: 4.5,
      SCORE13: 4.4,
      SCORE14: 4.6,
      SCORE15: 4.5,
      SCORE16: 4.6,
      SCORE17: 4.5,
      SCORE18: 4.4,
      SCORE19: 4.5,
      SCORE20: 4.6,
      SCORE21: 4.5,
      SCORE22: 4.4,
      sum1: 4.55,
      sum2: 4.55,
      sum3: 4.55,
      sum4: 4.55,
      sum5: 4.5,
      sum6: 4.55,
      sum7: 4.45
    },
    {
      NAME: "박지민",
      SEX: "남",
      RESIDENCE: "대전",
      JOB: "연구원",
      PTCPROGRAM: "마음 휴식 프로그램",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사전",
      SCORE1: 3.5,
      SCORE2: 3.6,
      SCORE3: 3.4,
      SCORE4: 3.7,
      SCORE5: 3.5,
      SCORE6: 3.6,
      SCORE7: 3.5,
      SCORE8: 3.4,
      SCORE9: 3.7,
      SCORE10: 3.5,
      SCORE11: 3.6,
      SCORE12: 3.5,
      SCORE13: 3.4,
      SCORE14: 3.6,
      SCORE15: 3.5,
      SCORE16: 3.6,
      SCORE17: 3.5,
      SCORE18: 3.4,
      SCORE19: 3.5,
      SCORE20: 3.6,
      SCORE21: 3.5,
      SCORE22: 3.4,
      sum1: 3.55,
      sum2: 3.55,
      sum3: 3.55,
      sum4: 3.55,
      sum5: 3.5,
      sum6: 3.55,
      sum7: 3.45
    },
    {
      NAME: "박지민",
      SEX: "남",
      RESIDENCE: "대전",
      JOB: "연구원",
      PTCPROGRAM: "마음 휴식 프로그램",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사후",
      SCORE1: 4.3,
      SCORE2: 4.4,
      SCORE3: 4.2,
      SCORE4: 4.5,
      SCORE5: 4.3,
      SCORE6: 4.4,
      SCORE7: 4.3,
      SCORE8: 4.2,
      SCORE9: 4.5,
      SCORE10: 4.3,
      SCORE11: 4.4,
      SCORE12: 4.3,
      SCORE13: 4.2,
      SCORE14: 4.4,
      SCORE15: 4.3,
      SCORE16: 4.4,
      SCORE17: 4.3,
      SCORE18: 4.2,
      SCORE19: 4.3,
      SCORE20: 4.4,
      SCORE21: 4.3,
      SCORE22: 4.2,
      sum1: 4.35,
      sum2: 4.35,
      sum3: 4.35,
      sum4: 4.35,
      sum5: 4.3,
      sum6: 4.35,
      sum7: 4.25
    }
  ];

  const healingList = rows.length > 0 ? rows : mockRows;

  // Calculate averages for pre-evaluation scores
  const [
    AVG1, AVG2, AVG3, AVG4, AVG5, AVG6, AVG7, AVG8, AVG9, AVG10,
    AVG11, AVG12, AVG13, AVG14, AVG15, AVG16, AVG17, AVG18, AVG19, AVG20,
    AVG21, AVG22, SUMAVG1, SUMAVG2, SUMAVG3, SUMAVG4, SUMAVG5, SUMAVG6, SUMAVG7
  ] = useMemo(() => {
    return [
      "SCORE1", "SCORE2", "SCORE3", "SCORE4", "SCORE5", "SCORE6", "SCORE7", "SCORE8", "SCORE9", "SCORE10",
      "SCORE11", "SCORE12", "SCORE13", "SCORE14", "SCORE15", "SCORE16", "SCORE17", "SCORE18", "SCORE19", "SCORE20",
      "SCORE21", "SCORE22", "sum1", "sum2", "sum3", "sum4", "sum5", "sum6", "sum7"
    ].map(k => {
      const preEvals = healingList.filter(i => i.PV === "사전");
      const nonEmptyValues = preEvals.filter(item => item[k] !== "" && item[k] !== undefined);
      const sum = nonEmptyValues.reduce((a, c) => a + parseFloat(c[k] || 0), 0);
      const average = sum / nonEmptyValues.length;
      return isNaN(average) ? "-" : average.toFixed(2);
    });
  }, [healingList]);

  // Calculate averages for post-evaluation scores
  const [
    AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A, AVG7_A, AVG8_A, AVG9_A, AVG10_A,
    AVG11_A, AVG12_A, AVG13_A, AVG14_A, AVG15_A, AVG16_A, AVG17_A, AVG18_A, AVG19_A, AVG20_A,
    AVG21_A, AVG22_A, SUMAVG1_A, SUMAVG2_A, SUMAVG3_A, SUMAVG4_A, SUMAVG5_A, SUMAVG6_A, SUMAVG7_A
  ] = useMemo(() => {
    return [
      "SCORE1", "SCORE2", "SCORE3", "SCORE4", "SCORE5", "SCORE6", "SCORE7", "SCORE8", "SCORE9", "SCORE10",
      "SCORE11", "SCORE12", "SCORE13", "SCORE14", "SCORE15", "SCORE16", "SCORE17", "SCORE18", "SCORE19", "SCORE20",
      "SCORE21", "SCORE22", "sum1", "sum2", "sum3", "sum4", "sum5", "sum6", "sum7"
    ].map(k => {
      const postEvals = healingList.filter(i => i.PV === "사후");
      const nonEmptyValues = postEvals.filter(item => item[k] !== "" && item[k] !== undefined);
      const sum = nonEmptyValues.reduce((a, c) => a + parseFloat(c[k] || 0), 0);
      const average = sum / nonEmptyValues.length;
      return isNaN(average) ? "-" : average.toFixed(2);
    });
  }, [healingList]);

  const downloadExcel = () => {
    // Mock function for Excel download
    alert("Excel 다운로드 기능은 목업 데이터에서는 지원하지 않습니다.");
  };

  return (
    <>
      {healingList.length > 0 ? (
        <>
          <div style={{ padding: "10px 0px", textAlign: "right" }}>
            <Button variant="contained" color="primary" size="small" onClick={downloadExcel}>Excel 다운로드</Button>
          </div>
          <TableContainer component={Paper} className={classes.paper} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }} aria-label="spanning table" size="small" className="custom-table">
              <TableHead>
                <TableRow>
                  <TableCell className="table-header" rowSpan={2} align="center">ID</TableCell>
                  <TableCell className="table-header" rowSpan={2} align="center">성명</TableCell>
                  <TableCell className="table-header" rowSpan={2} align="center">성별</TableCell>
                  <TableCell className="table-header" rowSpan={2} align="center">거주지</TableCell>
                  <TableCell className="table-header" rowSpan={3} align="center">직업</TableCell>
                  <TableCell className="table-header" rowSpan={3} align="center">참여일정</TableCell>
                  <TableCell className="table-header" rowSpan={3} align="center">과거스트레스<br/>해소및힐링<br/>서비스경험</TableCell>
                  <TableCell className="table-header" align="center">영역</TableCell>
                  <TableCell className="table-header" colSpan={2} align="center">1.욕구충족</TableCell>
                  <TableCell className="table-header" colSpan={3} align="center">2.긍정정서</TableCell>
                  <TableCell className="table-header" colSpan={4} align="center">3.자기이해</TableCell>
                  <TableCell className="table-header" colSpan={3} align="center">4.마음관리기술</TableCell>
                  <TableCell className="table-header" colSpan={4} align="center">5.정서능력측면</TableCell>
                  <TableCell className="table-header" colSpan={3} align="center">6.영성측면</TableCell>
                  <TableCell className="table-header" colSpan={3} align="center">7.삶의조망측면</TableCell>
                  <TableCell className="table-header" align="center">영역</TableCell>
                  <TableCell className="table-header" colSpan={7} align="center">평균(0~6점)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="table-header" align="center">평가시점</TableCell>
                  <TableCell className="table-header" align="center">문항1</TableCell>
                  <TableCell className="table-header" align="center">문항2</TableCell>
                  <TableCell className="table-header" align="center">문항3</TableCell>
                  <TableCell className="table-header" align="center">문항4</TableCell>
                  <TableCell className="table-header" align="center">문항5</TableCell>
                  <TableCell className="table-header" align="center">문항6</TableCell>
                  <TableCell className="table-header" align="center">문항7</TableCell>
                  <TableCell className="table-header" align="center">문항8</TableCell>
                  <TableCell className="table-header" align="center">문항9</TableCell>
                  <TableCell className="table-header" align="center">문항10</TableCell>
                  <TableCell className="table-header" align="center">문항11</TableCell>
                  <TableCell className="table-header" align="center">문항12</TableCell>
                  <TableCell className="table-header" align="center">문항13</TableCell>
                  <TableCell className="table-header" align="center">문항14</TableCell>
                  <TableCell className="table-header" align="center">문항15</TableCell>
                  <TableCell className="table-header" align="center">문항16</TableCell>
                  <TableCell className="table-header" align="center">문항17</TableCell>
                  <TableCell className="table-header" align="center">문항18</TableCell>
                  <TableCell className="table-header" align="center">문항19</TableCell>
                  <TableCell className="table-header" align="center">문항20</TableCell>
                  <TableCell className="table-header" align="center">문항21</TableCell>
                  <TableCell className="table-header" align="center">문항22</TableCell>
                  <TableCell className="table-header" align="center">평가시점</TableCell>
                  <TableCell className="table-header" align="center">욕구충족</TableCell>
                  <TableCell className="table-header" align="center">긍정정서</TableCell>
                  <TableCell className="table-header" align="center">자기이해</TableCell>
                  <TableCell className="table-header" align="center">마음관리기술</TableCell>
                  <TableCell className="table-header" align="center">정서능력측면</TableCell>
                  <TableCell className="table-header" align="center">영성측면</TableCell>
                  <TableCell className="table-header" align="center">삶의조망측면</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* 평균(사전) */}
                <TableRow>
                  <TableCell className="table-result" align="center" colSpan={7}>통계</TableCell>
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
                  <TableCell className="table-result" align="center">{AVG21}</TableCell>
                  <TableCell className="table-result" align="center">{AVG22}</TableCell>
                  <TableCell className="table-result" align="center">사전</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG1}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG2}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG3}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG4}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG5}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG6}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG7}</TableCell>
                </TableRow>
                
                {/* 평균(사후) */}
                <TableRow>
                  <TableCell className="table-result" align="center" colSpan={7}>평균</TableCell>
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
                  <TableCell className="table-result" align="center">{AVG21_A}</TableCell>
                  <TableCell className="table-result" align="center">{AVG22_A}</TableCell>
                  <TableCell className="table-result" align="center">사후</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG1_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG2_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG3_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG4_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG5_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG6_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG7_A}</TableCell>
                </TableRow>
                
                {/* 차이값 */}
                <TableRow>
                  <TableCell className="table-result" align="center" colSpan={7}></TableCell>
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
                  <TableCell className="table-result" align="center">{(AVG21_A - AVG21).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(AVG22_A - AVG22).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">차이값</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG1_A - SUMAVG1).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG2_A - SUMAVG2).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG3_A - SUMAVG3).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG4_A - SUMAVG4).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG5_A - SUMAVG5).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG6_A - SUMAVG6).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG7_A - SUMAVG7).toFixed(2)}</TableCell>
                </TableRow>

                {healingList.map((row, index) => {
                  const personIndex = Math.floor(index / 2) + 1;
                  const showPersonInfo = index % 2 === 0;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? personIndex : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? row.NAME : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? row.SEX : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? row.RESIDENCE : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? row.JOB : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? row.PTCPROGRAM : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{showPersonInfo ? row.PAST_STRESS_EXPERIENCE : ""}</TableCell>
                      <TableCell className="table-cell" align="center">{row.PV}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE1}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE2}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE3}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE4}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE5}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE6}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE7}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE8}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE9}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE10}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE11}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE12}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE13}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE14}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE15}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE16}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE17}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE18}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE19}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE20}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE21}</TableCell>
                      <TableCell className="table-cell" align="center">{row.SCORE22}</TableCell>
                      <TableCell className="table-cell" align="center">{row.PV}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum1}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum2}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum3}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum4}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum5}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum6}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum7}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default HealingResult; 