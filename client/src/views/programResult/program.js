import React , {memo, useMemo}from "react";
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
import { generateMergeInfo } from "utils/utils";
const useStyles = makeStyles({
    paper: {
        borderRadius: 0
    }
    });

const Program = ({ programResult = [] })=>{

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
            "sum1",
            "sum2",
            "sum3",
        ].map(k => {
            const sum = programResult.reduce((a, c) => a + (parseFloat(c[k]) || 0), 0);
            const average = sum / programResult.length;
            const formattedAverage = isNaN(average) ? "-" : average.toFixed(2);
            return formattedAverage;
        });
    }, [programResult]);
    

    const headerInfo = [
        ['ID', '프로그램명', '강사명', '장소',"참여구분", '강사', '구성/품질', '효과성', '평균', '평균', '평균'],
        ['', '', '', '','', '강사는 전문성을 가지고 프로그램을 제공했다', '프로그램은 체계적이고 알찼다', '기회가 된다면 이 프로그램에 다시 참여할 것이다', '강사', '구성품질', '효과성']
    ]
    const merges = generateMergeInfo(headerInfo);
    const cellData = programResult.map((item,idx) => Object.values({
        idx: idx + 1,
        PROGRAM_NAME: item.PROGRAM_NAME,
        TEACHER: item.TEACHER,
        PLACE: item.PLACE,
        TYPE: item.TYPE,
        SCORE1: item.SCORE1,
        SCORE2: item.SCORE2,
        SCORE3: item.SCORE3,
        SCORE4: item.SCORE4,
        SCORE5: item.SCORE5,
        SCORE6: item.SCORE6,
        SCORE7: item.SCORE7,
        SCORE8: item.SCORE8,
        SCORE9: item.SCORE9,
        sum1: item.sum1,
        sum2: item.sum2,
        sum3: item.sum3,
    }));

    const avgData = [ "", "", "","","통계", AVG1, AVG4, AVG7, AVG10, AVG11, AVG12]

    var wscols = [ {wch:8}, {wch:25}, {wch:15}, {wch:17}, {wch:10}, {wch:30}, {wch:30}, {wch:35}, {wch:10}, {wch:15}, {wch:10}];        
    
    const downloadExcel = useDownloadExcel({
        headerInfo, 
        cellData, 
        avgData, 
        filename: programResult.length > 0 ? programResult[0].AGENCY || "program" : "program", 
        merges, 
        wscols
    });

    return <>
            {programResult.length > 0 ? 
            <>
            <div style={{padding : "10px 0px", textAlign:"right"}}>
                <Button variant="contained" color="primary" size="small" onClick={downloadExcel} >Excel 다운로드</Button>
            </div>
            <TableContainer component={Paper} className={classes.paper}>
                <Table sx={{ minWidth: 700 }} aria-label="spanning table" size="small" className="custom-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" rowSpan={2} align="center">ID</TableCell>
                            <TableCell className="table-header" rowSpan={2} align="center">프로그램명</TableCell>
                            <TableCell className="table-header" rowSpan={2} align="center">강사명</TableCell>
                            <TableCell className="table-header" rowSpan={2} align="center">장소</TableCell>
                            <TableCell className="table-header" rowSpan={2} align="center">참여구분</TableCell>
                            <TableCell className="table-header" align="center">강사</TableCell>
                            <TableCell className="table-header" align="center">구성/품질</TableCell>
                            <TableCell className="table-header" align="center">효과성</TableCell>
                            <TableCell className="table-header" colSpan={3} align="center">평균</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="table-header" align="center">강사는 전문성을 가지고 프로그램을 제공했다</TableCell>
                            <TableCell className="table-header" align="center">프로그램은 체계적이고 알찼다</TableCell>
                            <TableCell className="table-header" align="center">기회가 된다면 이 프로그램에 다시 참여할 것이다</TableCell>
                            <TableCell className="table-header" align="center">강사</TableCell>
                            <TableCell className="table-header" align="center">구성품질</TableCell>
                            <TableCell className="table-header" align="center">효과성</TableCell>
                        </TableRow>
                    </TableHead>
                        
                    <TableBody>
                        <TableRow>
                                <TableCell className="table-result" align="center" colSpan={5}>통계</TableCell>
                                <TableCell className="table-result" align="center">{AVG1}</TableCell>
                                <TableCell className="table-result" align="center">{AVG4}</TableCell>
                                <TableCell className="table-result" align="center">{AVG7}</TableCell>
                                <TableCell className="table-result" align="center">{AVG10}</TableCell>
                                <TableCell className="table-result" align="center">{AVG11}</TableCell>
                                <TableCell className="table-result" align="center">{AVG12}</TableCell>
                            </TableRow>
                    {programResult.map((row, index) => {
                        
                        return <TableRow key={index}>
                                <TableCell className="table-cell" align="center">{index + 1}</TableCell>
                                <TableCell className="table-cell" align="center">{row.PROGRAM_NAME}</TableCell>
                                <TableCell className="table-cell" align="center">{row.TEACHER}</TableCell>
                                <TableCell className="table-cell" align="center">{row.PLACE}</TableCell>
                                <TableCell className="table-cell" align="center">{row.TYPE}</TableCell>
                                <TableCell className="table-cell" align="center">{row.SCORE1}</TableCell>
                                <TableCell className="table-cell" align="center">{row.SCORE4}</TableCell>
                                <TableCell className="table-cell" align="center">{row.SCORE7}</TableCell>
                                <TableCell className="table-cell" align="center">{row.sum1}</TableCell>
                                <TableCell className="table-cell" align="center">{row.sum2}</TableCell>
                                <TableCell className="table-cell" align="center">{row.sum3}</TableCell>
                            </TableRow>
                    })}
                    </TableBody>
                </Table>
            </TableContainer>
            </>
            :<></>
        }
    </>

}
export default memo(Program)