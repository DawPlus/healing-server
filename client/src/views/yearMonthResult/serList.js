import React from "react";
import { Table,  TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import DynamicTableHead from "ui-component/DynamicTableHead";


const headerInfo =     [
    ["구분",'숙소','숙소','식당','식당','프로그램장소','프로그램장소','프로그램장소','숲(야외)','숲(야외)','숲(야외)','운영','운영','운영','식사','식사','식사', '평균'],
    ["",'편리성','청결도','편리성','청결도','편리성','청결도','적절성','편리성','청결도','적절성','운영방식','시간편성','직원친절','신선도','다양성','영양', ''],
]

const SerList = ({ data = {} })=>{
    
    console.log("SerList data:", data);
    const {
        score1 = 0, score2 = 0, score3 = 0, score4 = 0, score5 = 0, 
        score6 = 0, score7 = 0, score8 = 0, score9 = 0, score10 = 0, 
        score11 = 0, score12 = 0, score13 = 0, score14 = 0, score15 = 0, 
        score16 = 0, total = 0 
    } = data;

    return <>
        <TableContainer>
            <Table className="report custom-table">
            <DynamicTableHead headerInfo={headerInfo}/>
                <TableBody>
                <TableRow>
                    <TableCell>구분</TableCell>
                    <TableCell>{score1}</TableCell>
                    <TableCell>{score2}</TableCell>
                    <TableCell>{score3}</TableCell>
                    <TableCell>{score4}</TableCell>
                    <TableCell>{score5}</TableCell>
                    <TableCell>{score6}</TableCell>
                    <TableCell>{score7}</TableCell>
                    <TableCell>{score8}</TableCell>
                    <TableCell>{score9}</TableCell>
                    <TableCell>{score10}</TableCell>
                    <TableCell>{score11}</TableCell>
                    <TableCell>{score12}</TableCell>
                    <TableCell>{score13}</TableCell>
                    <TableCell>{score14}</TableCell>
                    <TableCell>{score15}</TableCell>
                    <TableCell>{score16}</TableCell>
                    <TableCell>{total}</TableCell>
                </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>

}
export default SerList;