import React, { memo, useMemo } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { makeStyles } from "@mui/styles";
import Button from '@mui/material/Button';
import useDownloadExcel from "utils/useDownloadExcel";

// Mock data for prevention service effectiveness evaluation
const MOCK_PREVENT_DATA = [
  {
    NAME: "김철수",
    SEX: "남",
    RESIDENCE: "서울",
    JOB: "회사원",
    PTCPROGRAM: "마음챙김",
    PAST_STRESS_EXPERIENCE: "있음",
    PV: "사전",
    SCORE1: "3.5",
    SCORE2: "3.7",
    SCORE3: "3.6",
    SCORE4: "3.8",
    SCORE5: "3.4",
    SCORE6: "3.3",
    SCORE7: "3.5",
    SCORE8: "3.2",
    SCORE9: "3.6",
    SCORE10: "3.8",
    SCORE11: "3.7",
    SCORE12: "3.5",
    SCORE13: "3.6",
    SCORE14: "3.3",
    SCORE15: "3.2",
    SCORE16: "3.5",
    SCORE17: "3.6",
    SCORE18: "3.4",
    SCORE19: "3.5",
    SCORE20: "3.7",
    sum1: "3.60",
    sum2: "3.50",
    sum3: "3.52",
    sum4: "3.60",
    sum5: "3.44",
    sum6: "3.53"
  },
  {
    NAME: "김철수",
    SEX: "남",
    RESIDENCE: "서울",
    JOB: "회사원",
    PTCPROGRAM: "마음챙김",
    PAST_STRESS_EXPERIENCE: "있음",
    PV: "사후",
    SCORE1: "4.7",
    SCORE2: "4.9",
    SCORE3: "4.8",
    SCORE4: "4.9",
    SCORE5: "4.6",
    SCORE6: "4.7",
    SCORE7: "4.8",
    SCORE8: "4.6",
    SCORE9: "4.9",
    SCORE10: "5.0",
    SCORE11: "4.9",
    SCORE12: "4.8",
    SCORE13: "4.7",
    SCORE14: "4.8",
    SCORE15: "4.6",
    SCORE16: "4.9",
    SCORE17: "4.8",
    SCORE18: "4.7",
    SCORE19: "4.8",
    SCORE20: "4.9",
    sum1: "4.80",
    sum2: "4.73",
    sum3: "4.82",
    sum4: "4.85",
    sum5: "4.76",
    sum6: "4.80"
  },
  {
    NAME: "이영희",
    SEX: "여",
    RESIDENCE: "부산",
    JOB: "교사",
    PTCPROGRAM: "스트레스 관리",
    PAST_STRESS_EXPERIENCE: "없음",
    PV: "사전",
    SCORE1: "3.3",
    SCORE2: "3.4",
    SCORE3: "3.5",
    SCORE4: "3.2",
    SCORE5: "3.3",
    SCORE6: "3.4",
    SCORE7: "3.6",
    SCORE8: "3.2",
    SCORE9: "3.5",
    SCORE10: "3.6",
    SCORE11: "3.4",
    SCORE12: "3.3",
    SCORE13: "3.4",
    SCORE14: "3.2",
    SCORE15: "3.0",
    SCORE16: "3.1",
    SCORE17: "3.3",
    SCORE18: "3.2",
    SCORE19: "3.4",
    SCORE20: "3.5",
    sum1: "3.40",
    sum2: "3.30",
    sum3: "3.47",
    sum4: "3.35",
    sum5: "3.20",
    sum6: "3.37"
  },
  {
    NAME: "이영희",
    SEX: "여",
    RESIDENCE: "부산",
    JOB: "교사",
    PTCPROGRAM: "스트레스 관리",
    PAST_STRESS_EXPERIENCE: "없음",
    PV: "사후",
    SCORE1: "4.6",
    SCORE2: "4.7",
    SCORE3: "4.8",
    SCORE4: "4.5",
    SCORE5: "4.6",
    SCORE6: "4.7",
    SCORE7: "4.8",
    SCORE8: "4.6",
    SCORE9: "4.7",
    SCORE10: "4.9",
    SCORE11: "4.8",
    SCORE12: "4.7",
    SCORE13: "4.6",
    SCORE14: "4.7",
    SCORE15: "4.5",
    SCORE16: "4.8",
    SCORE17: "4.6",
    SCORE18: "4.7",
    SCORE19: "4.5",
    SCORE20: "4.6",
    sum1: "4.70",
    sum2: "4.60",
    sum3: "4.75",
    sum4: "4.75",
    sum5: "4.64",
    sum6: "4.60"
  }
];

const useStyles = makeStyles({
  paper: {
    borderRadius: 0
  }
});

const Prevent = ({ preventList = [], preventType = "스마트폰" }) => {
  const classes = useStyles();
  
  const getCategoryMapping = (type) => {
    if (type === "도박") {
      return {
        category1: { name: "도박인식", scores: ["SCORE1", "SCORE2", "SCORE3"] },
        category2: { name: "도박예방역량", scores: ["SCORE4", "SCORE5", "SCORE6"] },
        category3: { name: "자기통제력", scores: ["SCORE7", "SCORE8", "SCORE9", "SCORE10"] },
        category4: { name: "대인관계능력", scores: ["SCORE11", "SCORE12", "SCORE13", "SCORE14"] }
      };
    } else {
      return {
        category1: { name: "자가인식", scores: ["SCORE1", "SCORE2", "SCORE3"] },
        category2: { name: "예방역량", scores: ["SCORE4", "SCORE5", "SCORE6"] },
        category3: { name: "스트레스관리", scores: ["SCORE7", "SCORE8", "SCORE9", "SCORE10"] },
        category4: { name: "중독위험인식", scores: ["SCORE11", "SCORE12", "SCORE13", "SCORE14"] }
      };
    }
  };

  const categoryMapping = getCategoryMapping(preventType);
  
  const [
    AVG1, AVG2, AVG3, AVG4, AVG5, AVG6, AVG7, AVG8, AVG9, AVG10, AVG11, AVG12, AVG13, AVG14,
    SUMAVG1, SUMAVG2, SUMAVG3, SUMAVG4,
  ] = useMemo(() => {
    const preList = preventList.filter(i => i.PV === "사전" || i.PV === ""); // PV가 없는 경우도 사전에 포함
    if (preList.length === 0) return Array(18).fill("-");

    return [
      "SCORE1", "SCORE2", "SCORE3", "SCORE4", "SCORE5", "SCORE6", "SCORE7", "SCORE8", "SCORE9", "SCORE10", "SCORE11", "SCORE12", "SCORE13", "SCORE14",
      "sum1", "sum2", "sum3", "sum4",
    ].map(k => {
      const sum = preList.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
      const nonEmptyValues = preList.filter(item => item[k] != null && item[k] !== "");
      const average = sum / (nonEmptyValues.length || 1);
      return isNaN(average) ? "-" : average.toFixed(2);
    });
  }, [preventList]);
  
  const [
    AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A, AVG7_A, AVG8_A, AVG9_A, AVG10_A, AVG11_A, AVG12_A, AVG13_A, AVG14_A,
    SUMAVG1_A, SUMAVG2_A, SUMAVG3_A, SUMAVG4_A,
  ] = useMemo(() => {
    const postList = preventList.filter(i => i.PV === "사후");
    if (postList.length === 0) return Array(18).fill("-");
    
    return [
      "SCORE1", "SCORE2", "SCORE3", "SCORE4", "SCORE5", "SCORE6", "SCORE7", "SCORE8", "SCORE9", "SCORE10", "SCORE11", "SCORE12", "SCORE13", "SCORE14",
      "sum1", "sum2", "sum3", "sum4",
    ].map(k => {
      const sum = postList.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
      const nonEmptyValues = postList.filter(item => item[k] != null && item[k] !== "");
      const average = sum / (nonEmptyValues.length || 1);
      return isNaN(average) ? "-" : average.toFixed(2);
    });
  }, [preventList]);

  const headerInfo = useMemo(() => {
    const categories = Object.values(categoryMapping);
    const firstRow = [
      "ID", "성명", "성별", "거주지", "직업", "과거스트레스\n해소및힐링\n서비스경험", "영역",
      ...categories.flatMap(c => Array(c.scores.length).fill(c.name)),
      "영역", ...categories.map(c => "평균(0~6점)")
    ];
    const secondRow = [
      "", "", "", "", "", "", "평가시점",
      ...Array.from({length: 14}, (_, i) => `문항${i+1}`),
      "평가시점", ...categories.map(c => c.name)
    ];
    return [firstRow, secondRow];
  }, [categoryMapping]);

  const groupedData = useMemo(() => {
    const groups = preventList.reduce((acc, current) => {
      // 이름이 없는 데이터는 그룹핑에서 제외
      if (!current.NAME) return acc;
      acc[current.NAME] = acc[current.NAME] || [];
      acc[current.NAME].push(current);
      return acc;
    }, {});

    return Object.values(groups).map(group => {
      const pre = group.find(item => item.PV === '사전' || item.PV === '') || {};
      const post = group.find(item => item.PV === '사후') || {};
      // 그룹의 첫 번째 항목을 기본 정보로 사용하여 정보 누락 방지
      const baseInfo = group[0]; 

      return { 
        NAME: baseInfo.NAME,
        SEX: baseInfo.SEX,
        RESIDENCE: baseInfo.RESIDENCE,
        JOB: baseInfo.JOB,
        PAST_STRESS_EXPERIENCE: baseInfo.PAST_STRESS_EXPERIENCE,
        pre, 
        post 
      };
    });
  }, [preventList]);

  const calcDiff = (val1, val2) => {
    if (val1 === "-" || val2 === "-" || val1 === null || val2 === null) return "-";
    const num1 = parseFloat(val1);
    const num2 = parseFloat(val2);
    if (isNaN(num1) || isNaN(num2)) return "-";
    return (num2 - num1).toFixed(2);
  };

  const avgData = [
    ["","","","","","","", "사전", AVG1, AVG2, AVG3, AVG4, AVG5, AVG6, AVG7, AVG8, AVG9, AVG10, AVG11, AVG12, AVG13, AVG14, "사전", SUMAVG1, SUMAVG2, SUMAVG3, SUMAVG4],
    ["","","","통계","","","평균","사후", AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A, AVG7_A, AVG8_A, AVG9_A, AVG10_A, AVG11_A, AVG12_A, AVG13_A, AVG14_A, "사후", SUMAVG1_A, SUMAVG2_A, SUMAVG3_A, SUMAVG4_A],
    ["","","","","","","","차이값", calcDiff(AVG1, AVG1_A), calcDiff(AVG2, AVG2_A), calcDiff(AVG3, AVG3_A), calcDiff(AVG4, AVG4_A), calcDiff(AVG5, AVG5_A), calcDiff(AVG6, AVG6_A), calcDiff(AVG7, AVG7_A), calcDiff(AVG8, AVG8_A), calcDiff(AVG9, AVG9_A), calcDiff(AVG10, AVG10_A), calcDiff(AVG11, AVG11_A), calcDiff(AVG12, AVG12_A), calcDiff(AVG13, AVG13_A), calcDiff(AVG14, AVG14_A), "차이값", calcDiff(SUMAVG1, SUMAVG1_A), calcDiff(SUMAVG2, SUMAVG2_A), calcDiff(SUMAVG3, SUMAVG3_A), calcDiff(SUMAVG4, SUMAVG4_A)]
  ];

  const downloadExcel = useDownloadExcel({
    headerInfo, 
    cellData: [], // cellData is now generated inside the component
    avgData, 
    filename: preventList.length > 0 ? preventList[0].AGENCY || "prevent" : "prevent", 
    merges: [], // Merges need to be recalculated if needed
    wscols: [], // wscols need to be recalculated if needed
    type: "type2",
    customBody: groupedData.flatMap((person, pIndex) => [
        ["사전", ...Array.from({length: 14}, (_, i) => person.pre[`SCORE${i+1}`] || ''), "사전", person.pre.sum1 || '', person.pre.sum2 || '', person.pre.sum3 || '', person.pre.sum4 || '' ],
        ["사후", ...Array.from({length: 14}, (_, i) => person.post[`SCORE${i+1}`] || ''), "사후", person.post.sum1 || '', person.post.sum2 || '', person.post.sum3 || '', person.post.sum4 || '' ],
    ])
  });

  return <>
    {preventList.length > 0 ?
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
                <TableCell className="table-header" rowSpan={2} align="center">직업</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">과거스트레스<br/>해소및힐링<br/>서비스경험</TableCell>
                <TableCell className="table-header" align="center">영역</TableCell>
                {Object.values(categoryMapping).map((category, index) => (
                  <TableCell key={index} className="table-header" colSpan={category.scores.length} align="center">
                    {category.name}
                  </TableCell>
                ))}
                <TableCell className="table-header" align="center">영역</TableCell>
                <TableCell className="table-header" colSpan={4} align="center">평균(0~6점)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="table-header" align="center">평가시점</TableCell>
                {Array.from({length: 14}, (_, i) => (
                  <TableCell key={i} className="table-header" align="center">문항{i+1}</TableCell>
                ))}
                <TableCell className="table-header" align="center">평가시점</TableCell>
                {Object.values(categoryMapping).map((category, index) => (
                  <TableCell key={index} className="table-header" align="center">{category.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 통계 행들 */}
              <TableRow>
                <TableCell className="table-result" align="center" colSpan={6}>통계</TableCell>
                <TableCell className="table-result" align="center">사전</TableCell>
                {Array.from({length: 14}).map((_, i) => <TableCell key={i} className="table-result" align="center">{[AVG1, AVG2, AVG3, AVG4, AVG5, AVG6, AVG7, AVG8, AVG9, AVG10, AVG11, AVG12, AVG13, AVG14][i]}</TableCell>)}
                <TableCell className="table-result" align="center">사전</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG1}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG2}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG3}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG4}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="table-result" align="center" colSpan={6}>평균</TableCell>
                <TableCell className="table-result" align="center">사후</TableCell>
                {Array.from({length: 14}).map((_, i) => <TableCell key={i} className="table-result" align="center">{[AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A, AVG7_A, AVG8_A, AVG9_A, AVG10_A, AVG11_A, AVG12_A, AVG13_A, AVG14_A][i]}</TableCell>)}
                <TableCell className="table-result" align="center">사후</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG1_A}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG2_A}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG3_A}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG4_A}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="table-result" align="center" colSpan={6}></TableCell>
                <TableCell className="table-result" align="center">차이값</TableCell>
                {Array.from({length: 14}).map((_, i) => <TableCell key={i} className="table-result" align="center">{calcDiff([AVG1, AVG2, AVG3, AVG4, AVG5, AVG6, AVG7, AVG8, AVG9, AVG10, AVG11, AVG12, AVG13, AVG14][i], [AVG1_A, AVG2_A, AVG3_A, AVG4_A, AVG5_A, AVG6_A, AVG7_A, AVG8_A, AVG9_A, AVG10_A, AVG11_A, AVG12_A, AVG13_A, AVG14_A][i])}</TableCell>)}
                <TableCell className="table-result" align="center">차이값</TableCell>
                <TableCell className="table-result" align="center">{calcDiff(SUMAVG1, SUMAVG1_A)}</TableCell>
                <TableCell className="table-result" align="center">{calcDiff(SUMAVG2, SUMAVG2_A)}</TableCell>
                <TableCell className="table-result" align="center">{calcDiff(SUMAVG3, SUMAVG3_A)}</TableCell>
                <TableCell className="table-result" align="center">{calcDiff(SUMAVG4, SUMAVG4_A)}</TableCell>
              </TableRow>

              {groupedData.map((person, pIndex) => (
                <React.Fragment key={pIndex}>
                  <TableRow>
                    <TableCell className="table-cell" align="center" rowSpan={person.post.NAME ? 2 : 1}>{pIndex + 1}</TableCell>
                    <TableCell className="table-cell" align="center" rowSpan={person.post.NAME ? 2 : 1}>{person.NAME}</TableCell>
                    <TableCell className="table-cell" align="center" rowSpan={person.post.NAME ? 2 : 1}>{person.SEX}</TableCell>
                    <TableCell className="table-cell" align="center" rowSpan={person.post.NAME ? 2 : 1}>{person.RESIDENCE}</TableCell>
                    <TableCell className="table-cell" align="center" rowSpan={person.post.NAME ? 2 : 1}>{person.JOB}</TableCell>
                    <TableCell className="table-cell" align="center" rowSpan={person.post.NAME ? 2 : 1}>{person.PAST_STRESS_EXPERIENCE ?? ''}</TableCell>
                    <TableCell className="table-cell" align="center">{person.pre.PV || '사전'}</TableCell>
                    {Array.from({length: 14}, (_, i) => (
                      <TableCell key={`pre-score-${i}`} className="table-cell" align="center">{person.pre[`SCORE${i+1}`] ?? ''}</TableCell>
                    ))}
                    <TableCell className="table-cell" align="center">{person.pre.PV || '사전'}</TableCell>
                    <TableCell className="table-cell" align="center">{person.pre.sum1 ?? ''}</TableCell>
                    <TableCell className="table-cell" align="center">{person.pre.sum2 ?? ''}</TableCell>
                    <TableCell className="table-cell" align="center">{person.pre.sum3 ?? ''}</TableCell>
                    <TableCell className="table-cell" align="center">{person.pre.sum4 ?? ''}</TableCell>
                  </TableRow>
                  {person.post.NAME &&
                    <TableRow>
                      <TableCell className="table-cell" align="center">{person.post.PV || '사후'}</TableCell>
                      {Array.from({length: 14}, (_, i) => (
                        <TableCell key={`post-score-${i}`} className="table-cell" align="center">{person.post[`SCORE${i+1}`] ?? ''}</TableCell>
                      ))}
                      <TableCell className="table-cell" align="center">{person.post.PV || '사후'}</TableCell>
                      <TableCell className="table-cell" align="center">{person.post.sum1 ?? ''}</TableCell>
                      <TableCell className="table-cell" align="center">{person.post.sum2 ?? ''}</TableCell>
                      <TableCell className="table-cell" align="center">{person.post.sum3 ?? ''}</TableCell>
                      <TableCell className="table-cell" align="center">{person.post.sum4 ?? ''}</TableCell>
                </TableRow>
                  }
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
      : <></>
    }
  </>
}

export default memo(Prevent); 