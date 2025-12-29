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

const PreventResult = ({ rows = [] }) => {
  const classes = useStyles();
  
  // If no rows provided, use mock data
  const mockRows = [
    {
      NAME: "김철수",
      SEX: "남",
      RESIDENCE: "서울",
      JOB: "회사원",
      PTCPROGRAM: "마음챙김",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사전",
      SCORE1: 3.5,
      SCORE2: 3.7,
      SCORE3: 3.6,
      SCORE4: 3.8,
      SCORE5: 3.4,
      SCORE6: 3.3,
      SCORE7: 3.5,
      SCORE8: 3.2,
      SCORE9: 3.6,
      SCORE10: 3.8,
      SCORE11: 3.7,
      SCORE12: 3.5,
      SCORE13: 3.6,
      SCORE14: 3.3,
      SCORE15: 3.2,
      SCORE16: 3.5,
      SCORE17: 3.6,
      SCORE18: 3.4,
      SCORE19: 3.5,
      SCORE20: 3.7,
      sum1: 3.60,
      sum2: 3.50,
      sum3: 3.52,
      sum4: 3.60,
      sum5: 3.44,
      sum6: 3.53
    },
    {
      NAME: "김철수",
      SEX: "남",
      RESIDENCE: "서울",
      JOB: "회사원",
      PTCPROGRAM: "마음챙김",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사후",
      SCORE1: 4.7,
      SCORE2: 4.9,
      SCORE3: 4.8,
      SCORE4: 4.9,
      SCORE5: 4.6,
      SCORE6: 4.7,
      SCORE7: 4.8,
      SCORE8: 4.6,
      SCORE9: 4.9,
      SCORE10: 5.0,
      SCORE11: 4.9,
      SCORE12: 4.8,
      SCORE13: 4.7,
      SCORE14: 4.8,
      SCORE15: 4.6,
      SCORE16: 4.9,
      SCORE17: 4.8,
      SCORE18: 4.7,
      SCORE19: 4.8,
      SCORE20: 4.9,
      sum1: 4.80,
      sum2: 4.73,
      sum3: 4.82,
      sum4: 4.85,
      sum5: 4.76,
      sum6: 4.80
    },
    {
      NAME: "박영희",
      SEX: "여",
      RESIDENCE: "부산",
      JOB: "교사",
      PTCPROGRAM: "스트레스 관리",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사전",
      SCORE1: 3.8,
      SCORE2: 3.9,
      SCORE3: 3.7,
      SCORE4: 4.0,
      SCORE5: 3.9,
      SCORE6: 3.8,
      SCORE7: 3.7,
      SCORE8: 3.9,
      SCORE9: 3.8,
      SCORE10: 3.7,
      SCORE11: 3.9,
      SCORE12: 3.8,
      SCORE13: 4.0,
      SCORE14: 3.9,
      SCORE15: 3.7,
      SCORE16: 3.8,
      SCORE17: 3.9,
      SCORE18: 3.8,
      SCORE19: 3.7,
      SCORE20: 4.0,
      sum1: 3.80,
      sum2: 3.90,
      sum3: 3.77,
      sum4: 3.85,
      sum5: 3.84,
      sum6: 3.83
    },
    {
      NAME: "박영희",
      SEX: "여",
      RESIDENCE: "부산",
      JOB: "교사",
      PTCPROGRAM: "스트레스 관리",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사후",
      SCORE1: 4.6,
      SCORE2: 4.7,
      SCORE3: 4.8,
      SCORE4: 4.7,
      SCORE5: 4.9,
      SCORE6: 4.8,
      SCORE7: 4.6,
      SCORE8: 4.7,
      SCORE9: 4.9,
      SCORE10: 4.8,
      SCORE11: 4.7,
      SCORE12: 4.9,
      SCORE13: 5.0,
      SCORE14: 4.8,
      SCORE15: 4.9,
      SCORE16: 4.7,
      SCORE17: 4.8,
      SCORE18: 4.9,
      SCORE19: 4.8,
      SCORE20: 5.0,
      sum1: 4.70,
      sum2: 4.80,
      sum3: 4.75,
      sum4: 4.80,
      sum5: 4.82,
      sum6: 4.90
    }
  ];

  const preventList = rows.length > 0 ? rows : mockRows;

  // Calculate averages for pre-evaluation scores
  const [
    AVG1,
    AVG2,
    AVG3,
    AVG4,
    AVG5,
    AVG6,
    AVG7,
    AVG8,
    AVG9,
    AVG10,
    AVG11,
    AVG12,
    AVG13,
    AVG14,
    SUMAVG1,
    SUMAVG2,
    SUMAVG3,
    SUMAVG4,
  ] = useMemo(() => {
    const preList = preventList.filter(i => i.PV === "사전");
    if (preList.length === 0) {
      return Array(18).fill("-");
    }

    return [
      "SCORE1",
      "SCORE2",
      "SCORE3",
      "SCORE4",
      "SCORE5",
      "SCORE6",
      "SCORE7",
      "SCORE8",
      "SCORE9",
      "SCORE10",
      "SCORE11",
      "SCORE12",
      "SCORE13",
      "SCORE14",
      "sum1",
      "sum2",
      "sum3",
      "sum4",
    ].map(k => {
      const sum = preList.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
      const nonEmptyValues = preList.filter(item => item[k] !== "" && item[k] !== null);
      const average = sum / nonEmptyValues.length;
      const formattedAverage = isNaN(average) ? "-" : average.toFixed(2);
      return formattedAverage;
    });
  }, [preventList]);

  // Calculate averages for post-evaluation scores
  const [
    AVG1_A,
    AVG2_A,
    AVG3_A,
    AVG4_A,
    AVG5_A,
    AVG6_A,
    AVG7_A,
    AVG8_A,
    AVG9_A,
    AVG10_A,
    AVG11_A,
    AVG12_A,
    AVG13_A,
    AVG14_A,
    SUMAVG1_A,
    SUMAVG2_A,
    SUMAVG3_A,
    SUMAVG4_A,
  ] = useMemo(() => {
    const postList = preventList.filter(i => i.PV === "사후");
    if (postList.length === 0) {
      return Array(18).fill("-");
    }

    return [
      "SCORE1",
      "SCORE2",
      "SCORE3",
      "SCORE4",
      "SCORE5",
      "SCORE6",
      "SCORE7",
      "SCORE8",
      "SCORE9",
      "SCORE10",
      "SCORE11",
      "SCORE12",
      "SCORE13",
      "SCORE14",
      "sum1",
      "sum2",
      "sum3",
      "sum4",
    ].map(k => {
      const sum = postList.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
      const nonEmptyValues = postList.filter(item => item[k] !== "" && item[k] !== null);
      const average = sum / nonEmptyValues.length;
      const formattedAverage = isNaN(average) ? "-" : average.toFixed(2);
      return formattedAverage;
    });
  }, [preventList]);

  const downloadExcel = () => {
    // Mock function for Excel download
    alert("Excel 다운로드 기능은 목업 데이터에서는 지원하지 않습니다.");
  };

  return (
    <>
      {preventList.length > 0 ? (
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
                  <TableCell className="table-header" rowSpan={3} align="center">참여프로그램</TableCell>
                  <TableCell className="table-header" rowSpan={3} align="center">과거스트레스<br/>해소및힐링<br/>서비스경험</TableCell>
                  <TableCell className="table-header" align="center">영역</TableCell>
                  <TableCell className="table-header" colSpan={2} align="center">1.중독특징이해</TableCell>
                  <TableCell className="table-header" colSpan={2} align="center">2.핵심증상이해</TableCell>
                  <TableCell className="table-header" colSpan={1} align="center">1.중독특징이해</TableCell>
                  <TableCell className="table-header" colSpan={2} align="center">3.문제대응방법이해</TableCell>
                  <TableCell className="table-header" colSpan={3} align="center">4.활용역량</TableCell>
                  <TableCell className="table-header" colSpan={2} align="center">5.심리적면역력강화법</TableCell>
                  <TableCell className="table-header" colSpan={2} align="center">6.삶의질</TableCell>
                  <TableCell className="table-header" align="center">영역</TableCell>
                  <TableCell className="table-header" colSpan={4} align="center">평균(0~6점)</TableCell>
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
                  <TableCell className="table-header" align="center">평가시점</TableCell>
                  <TableCell className="table-header" align="center">중독특징이해</TableCell>
                  <TableCell className="table-header" align="center">핵심증상이해</TableCell>
                  <TableCell className="table-header" align="center">문제대응방법</TableCell>
                  <TableCell className="table-header" align="center">활용역량</TableCell>
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
                  <TableCell className="table-result" align="center">사전</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG1}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG2}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG3}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG4}</TableCell>
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
                  <TableCell className="table-result" align="center">사후</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG1_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG2_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG3_A}</TableCell>
                  <TableCell className="table-result" align="center">{SUMAVG4_A}</TableCell>
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
                  <TableCell className="table-result" align="center">차이값</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG1_A - SUMAVG1).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG2_A - SUMAVG2).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG3_A - SUMAVG3).toFixed(2)}</TableCell>
                  <TableCell className="table-result" align="center">{(SUMAVG4_A - SUMAVG4).toFixed(2)}</TableCell>
                </TableRow>

                {preventList.map((row, index) => {
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
                      <TableCell className="table-cell" align="center">{row.PV}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum1}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum2}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum3}</TableCell>
                      <TableCell className="table-cell" align="center">{row.sum4}</TableCell>
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

export default PreventResult; 