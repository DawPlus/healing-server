import React,{memo} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from "@mui/styles";
import Paper from '@mui/material/Paper';
import useDownloadExcel from "utils/useDownloadExcel";
import Button from '@mui/material/Button';
import { generateMergeInfo } from "utils/utils";
import DynamicTableHead from "ui-component/DynamicTableHead";
import useAverageCells from "hooks/useAverageCells";



const useStyles = makeStyles({
    paper: {
        borderRadius: 0
    }
});


const DynamicDoubleTable = (props)=>{
    
    const {headerInfo, dataCellInfo, dataCellInfo2, avgCellInfo, rows, wscols } = props;
    
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
    const downloadExcel = useDownloadExcel({headerInfo, cellData, avgData, merges, wscols : wscols ? wscols : defaultWsCols });

    
    return<>
            <div style={{padding : "10px 0px", textAlign:"right"}}>
                <Button variant="contained" color="primary" size="small" onClick={downloadExcel} >Excel 다운로드</Button>
            </div>
            <TableContainer component={Paper} className={classes.paper}>
                <Table sx={{ minWidth: 700 }} aria-label="spanning table" size="small" className="custom-table">
                    <DynamicTableHead headerInfo={headerInfo}/>
                    <TableBody>
                        {rows.map((i, idx) =>{

                            const cnt = idx % 2;

                            return  cnt ===0 ? 
                            
                                    <TableRow key={idx}>
                                        {dataCellInfo.map((cellKey, _idx) => 
                                            _idx <3 ? 
                                            <TableCell className="table-cell" align="center" key={_idx} rowSpan={2}> {i[cellKey]} </TableCell>
                                            :
                                            <TableCell className="table-cell" align="center" key={_idx} > {i[cellKey]} </TableCell>
                                        )}
                                    </TableRow> : 
                                    
                                    <TableRow key={idx}>
                                        {dataCellInfo2.map((cellKey, _idx) => 
                                            <TableCell className="table-cell" align="center" key={cellKey+_idx} > {i[cellKey]} </TableCell>
                                        )}
                                    </TableRow>

                        })}
                        <TableRow>
                            {avgCellData.map((cell, idx) =>
                                cell ? (
                                    <TableCell className="table-result" align="center" colSpan={cell.colSpan} key={idx}>
                                        {cell.data}
                                    </TableCell>
                                ) : null
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
    </>;


}
export default memo(DynamicDoubleTable);