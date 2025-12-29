import React,{memo} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from "@mui/styles";
import Paper from '@mui/material/Paper';
import {useAvgDownloadExcel} from "utils/useDownloadExcel";
import Button from '@mui/material/Button';
import { generateMergeInfo } from "utils/utils";
import DynamicTableHead from "ui-component/DynamicTableHead";
import useAverageCells from "hooks/useAverageCells";



const useStyles = makeStyles({
    paper: {
        borderRadius: 0
    }
});


const DynamicTable = (props)=>{
    
    const {headerInfo, dataCellInfo, avgCellInfo, rows, wscols } = props;
    
    const classes = useStyles();
    // Merge Info 
    const merges = generateMergeInfo(headerInfo);
    // Cell Info 
    const cellData = rows.map((item) => {
        let filteredData = [];
        dataCellInfo.forEach((cellKey) => {
            filteredData.push(item[cellKey]);
        });
        return filteredData;
    });
    // 평균 Row 용 데이터     
    const avgCellData = useAverageCells(avgCellInfo, rows);
    // 평균 엑셀용 데이터 
    const avgData= avgCellData.map(i=> !i  ? '' : i.data)
    // 컬럼 넓이  없을경우 균일하게 10 
    const defaultWsCols = new Array(dataCellInfo.length).fill({wch: 10})

    // Excel 다운 
    const downloadExcel = useAvgDownloadExcel({headerInfo, cellData, avgData, merges, wscols : wscols ? wscols : defaultWsCols });


    return<>
            <div style={{padding : "10px 0px", textAlign:"right"}}>
                <Button variant="contained" color="primary" size="small" onClick={downloadExcel} >Excel 다운로드</Button>
            </div>
            <TableContainer component={Paper} className={classes.paper}>
                <Table sx={{ minWidth: 700 }} aria-label="spanning table" size="small" className="custom-table">
                    <DynamicTableHead headerInfo={headerInfo}/>
                    <TableBody>
                        <TableRow>
                            {avgCellData.map((cell, idx) =>
                                cell ? (
                                    <TableCell className="table-result" align="center" colSpan={cell.colSpan} key={idx}>
                                        {cell.data}
                                    </TableCell>
                                ) : null
                            )}
                        </TableRow>
                        {/* {rows.map((i, idx) =>
                            <TableRow key={idx}>
                                {dataCellInfo.map((cellKey) => 
                                <TableCell className="table-cell" align="center" key={cellKey}>
                                    {i[cellKey]}
                                </TableCell>
                                )}
                            </TableRow>
                        )} */}
                    </TableBody>
                </Table>
            </TableContainer>
    </>;


}
export default memo(DynamicTable);