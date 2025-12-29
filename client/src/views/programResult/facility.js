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

// Mock data for facility service environment satisfaction
const MOCK_FACILITY_DATA = [
  {
    OPENDAY: "2023-08-01",
    AGENCY: "국립산림치유원",
    PTCPROGRAM: "숲체험",
    SEX: "남",
    AGE: "35",
    RESIDENCE: "서울",
    JOB: "회사원",
    SCORE1: "4.7",
    SCORE2: "4.6",
    SCORE3: "4.8",
    SCORE4: "4.5",
    SCORE5: "4.9",
    SCORE6: "4.7",
    SCORE7: "4.8",
    SCORE8: "4.6",
    SCORE9: "4.7",
    SCORE10: "4.5",
    FACILITY_OPINION: "매우 만족스러웠습니다.",
    SCORE11: "4.6",
    SCORE12: "4.7",
    SCORE13: "4.5",
    SCORE14: "4.8",
    SCORE15: "4.6",
    SCORE16: "4.9",
    OPERATION_OPINION: "서비스가 친절했습니다.",
    SCORE17: "4.7",
    SCORE18: "4.6",
    sum1: "4.65",
    sum2: "4.65",
    sum3: "4.77",
    sum4: "4.63",
    sum5: "4.60",
    sum6: "4.77",
    sum7: "4.65"
  },
  {
    OPENDAY: "2023-08-02",
    AGENCY: "국립횡성숲체원",
    PTCPROGRAM: "산림명상",
    SEX: "여",
    AGE: "42",
    RESIDENCE: "경기",
    JOB: "교사",
    SCORE1: "4.5",
    SCORE2: "4.3",
    SCORE3: "4.6",
    SCORE4: "4.7",
    SCORE5: "4.6",
    SCORE6: "4.8",
    SCORE7: "4.6",
    SCORE8: "4.7",
    SCORE9: "4.8",
    SCORE10: "4.5",
    FACILITY_OPINION: "시설이 청결합니다.",
    SCORE11: "4.7",
    SCORE12: "4.5",
    SCORE13: "4.6",
    SCORE14: "4.7",
    SCORE15: "4.8",
    SCORE16: "4.5",
    OPERATION_OPINION: "프로그램이 다양했습니다.",
    SCORE17: "4.6",
    SCORE18: "4.7",
    sum1: "4.40",
    sum2: "4.65",
    sum3: "4.67",
    sum4: "4.67",
    sum5: "4.60",
    sum6: "4.67",
    sum7: "4.65"
  },
  {
    OPENDAY: "2023-08-03",
    AGENCY: "국립칠곡숲체원",
    PTCPROGRAM: "숲속휴양",
    SEX: "남",
    AGE: "28",
    RESIDENCE: "부산",
    JOB: "자영업",
    SCORE1: "4.8",
    SCORE2: "4.7",
    SCORE3: "4.9",
    SCORE4: "4.8",
    SCORE5: "4.7",
    SCORE6: "4.6",
    SCORE7: "4.7",
    SCORE8: "4.8",
    SCORE9: "4.6",
    SCORE10: "4.7",
    FACILITY_OPINION: "객실이 편안했습니다.",
    SCORE11: "4.8",
    SCORE12: "4.7",
    SCORE13: "4.8",
    SCORE14: "4.6",
    SCORE15: "4.7",
    SCORE16: "4.8",
    OPERATION_OPINION: "전체적으로 만족했습니다.",
    SCORE17: "4.8",
    SCORE18: "4.7",
    sum1: "4.75",
    sum2: "4.85",
    sum3: "4.67",
    sum4: "4.70",
    sum5: "4.77",
    sum6: "4.70",
    sum7: "4.75"
  }
];

const useStyles = makeStyles({
  paper: {
    borderRadius: 0
  }
});

const Facility = ({ facilityList = [] }) => {
  const classes = useStyles();
  
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
    AVG15,
    AVG16,
    AVG17,
    AVG18,
    SUMAVG1,
    SUMAVG2,
    SUMAVG3,
    SUMAVG4,
    SUMAVG5,
    SUMAVG6,
    SUMAVG7,
  ] = useMemo(() => {
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
      "SCORE15",
      "SCORE16",
      "SCORE17",
      "SCORE18",
      "sum1",
      "sum2",
      "sum3",
      "sum4",
      "sum5",
      "sum6",
      "sum7",
    ].map(k => {
      const nonEmptyValues = facilityList.filter(item => item[k] !== "");
      const sum = nonEmptyValues.reduce((a, c) => a + parseFloat(c[k] || 0), 0);
      const average = sum / nonEmptyValues.length;
      const formattedAverage = isNaN(average) ? "-" : average.toFixed(2);
      return formattedAverage;
    });
  }, [facilityList]);

  const headerInfo = [
    ["순번", "실시일자", "기관명", "참여일정", "성별", "연령", "거주지", "직업", "숙소", "시설/야외", "운영", "식사", "평균", "평균", "평균", "평균"],
    ["","","","","","","","", "숙소는 이용하기 편리했다", "시설 및 산책로 등에 만족한다", "프로그램 안내 및 운영방식은 만족스러웠다", "재료가 신선하고 맛있는 식사가 제공되었다", "숙소", "시설/야외", "운영", "식사"]
  ];

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
    { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
    { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },
    { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
    { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
    { s: { r: 0, c: 12 }, e: { r: 0, c: 15 } },
  ];
  
  const cellData = facilityList.map((item,idx) => Object.values({
    idx : idx + 1,
    OPENDAY : item.OPENDAY,
    AGENCY : item.AGENCY,
    PTCPROGRAM : item.PTCPROGRAM,
    SEX : item.SEX,
    AGE : item.AGE,
    RESIDENCE : item.RESIDENCE,
    JOB : item.JOB,
    SCORE1 : item.SCORE1,
    SCORE5 : item.SCORE5,
    SCORE11 : item.SCORE11,
    SCORE14 : item.SCORE14,
    sum1 : item.sum1,
    sum3 : item.sum3,
    sum5 : item.sum5,
    sum6 : item.sum6,
  }));

  const avgData = ["","","","","","","","","통계",AVG1,AVG5,AVG11,AVG14,SUMAVG1,SUMAVG3,SUMAVG5,SUMAVG6];

  var wscols = [
    { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 30 },
    { wch: 35 }, { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }
  ];

  const downloadExcel = useDownloadExcel({
    headerInfo, 
    cellData, 
    avgData, 
    filename: facilityList.length > 0 ? facilityList[0].AGENCY || "facility" : "facility", 
    merges, 
    wscols
  });

  return <>
    {facilityList.length > 0 ?
      <>
        <div style={{ padding: "10px 0px", textAlign: "right" }}>
          <Button variant="contained" color="primary" size="small" onClick={downloadExcel}>Excel 다운로드</Button>
        </div>
        <TableContainer component={Paper} className={classes.paper}>
          <Table sx={{ minWidth: 700 }} aria-label="spanning table" size="small" className="custom-table">
            <TableHead>
              <TableRow>
                <TableCell className="table-header" rowSpan={2} align="center">ID</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">실시일자</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">기관명</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">참여일정</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">성별</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">연령</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">거주지</TableCell>
                <TableCell className="table-header" rowSpan={2} align="center">직업</TableCell>
                <TableCell className="table-header" align="center">숙소</TableCell>
                <TableCell className="table-header" align="center">시설/야외</TableCell>
                <TableCell className="table-header" align="center">운영</TableCell>
                <TableCell className="table-header" align="center">식사</TableCell>
                <TableCell className="table-header" colSpan={4} align="center">평균</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="table-header" align="center">숙소는 이용하기 편리했다</TableCell>
                <TableCell className="table-header" align="center">시설 및 산책로 등에 만족한다</TableCell>
                <TableCell className="table-header" align="center">프로그램 안내 및 운영방식은 만족스러웠다</TableCell>
                <TableCell className="table-header" align="center">재료가 신선하고 맛있는 식사가 제공되었다</TableCell>
                <TableCell className="table-header" align="center">숙소</TableCell>
                <TableCell className="table-header" align="center">시설/야외</TableCell>
                <TableCell className="table-header" align="center">운영</TableCell>
                <TableCell className="table-header" align="center">식사</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="table-result" align="center" colSpan={8}>통계</TableCell>
                <TableCell className="table-result" align="center">{AVG1}</TableCell>
                <TableCell className="table-result" align="center">{AVG5}</TableCell>
                <TableCell className="table-result" align="center">{AVG11}</TableCell>
                <TableCell className="table-result" align="center">{AVG14}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG1}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG3}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG5}</TableCell>
                <TableCell className="table-result" align="center">{SUMAVG6}</TableCell>
              </TableRow>
              
              {facilityList.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="table-cell" align="center">{index + 1}</TableCell>
                  <TableCell className="table-cell" align="center">{row.OPENDAY}</TableCell>
                  <TableCell className="table-cell" align="center">{row.AGENCY}</TableCell>
                  <TableCell className="table-cell" align="center">{row.PTCPROGRAM}</TableCell>
                  <TableCell className="table-cell" align="center">{row.SEX}</TableCell>
                  <TableCell className="table-cell" align="center">{row.AGE}</TableCell>
                  <TableCell className="table-cell" align="center">{row.RESIDENCE}</TableCell>
                  <TableCell className="table-cell" align="center">{row.JOB}</TableCell>
                  <TableCell className="table-cell" align="center">{row.SCORE1}</TableCell>
                  <TableCell className="table-cell" align="center">{row.SCORE5}</TableCell>
                  <TableCell className="table-cell" align="center">{row.SCORE11}</TableCell>
                  <TableCell className="table-cell" align="center">{row.SCORE14}</TableCell>
                  <TableCell className="table-cell" align="center">{row.sum1}</TableCell>
                  <TableCell className="table-cell" align="center">{row.sum3}</TableCell>
                  <TableCell className="table-cell" align="center">{row.sum5}</TableCell>
                  <TableCell className="table-cell" align="center">{row.sum6}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
      : <></>
    }
  </>
}

export default memo(Facility); 