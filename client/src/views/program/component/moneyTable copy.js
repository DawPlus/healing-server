import React, {memo} from "react";
import { IconButton, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {  Input} from "ui-component/inputs";
import { makeStyles } from '@mui/styles';
import { relativeTimeRounding } from "moment";
import Swal from "sweetalert2";


const useStyles = makeStyles({
    tableContainer: {
        borderRadius : "4px",
        border: '1px solid #cbcbcb',
      '& .MuiTableCell-root': {  // 모든 TableCell에 대한 스타일 적용
    fontSize: '12px',
    }
},
tableHeader: {
    backgroundColor: 'rgba(144, 238, 144, 0.3)',
},
});

const MoneyTable = (props)=>{
    const classes = useStyles();
    const {data, title, type, onAdd, onDelete} = props;
    
    const [pageInfo, setPageInfo] = React.useState({
        EXPENSE_PRICE  : "",
        EXPENSE_DETAIL  : "",
        EXPENSE_NOTE  : "",
    })


    const onChange = (e)=>{
      
        setPageInfo(s=>({
            ...s, 
            [e.target.name] : e.target.value
        }))
    }

    const onAddClick = ()=>{
        

        const isEmpty = Object.values(pageInfo).some(value => value === "");

        if(isEmpty){
            Swal.fire({ title : "확인", text : "비어있는값이 있습니다."})
            return;
        }

        onAdd({ ...pageInfo, EXPENSE_TYPE  : type, })
        setPageInfo({
            EXPENSE_TYPE  : type, 
            EXPENSE_PRICE  : "",
            EXPENSE_DETAIL  : "",
            EXPENSE_NOTE  : "",
        })
    }

    const onDeleteHandler= (id) => ()=>{
        onDelete(id);
    }


    return (<>
            <div style={{padding : "10px", width : "100%"}}>
                <div style={{padding: "0px 0px 10px 8px" ,"fontSize": "15px"}}>{title}</div>
                <div style={{padding : "10px 0px "}}>
                <Grid container spacing={2}alignItems="center" sm={12}>
                    <Grid item sm="3">
                        <Input name="EXPENSE_PRICE"  value={pageInfo.EXPENSE_PRICE} label="금액" size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item sm="4">
                        <Input name="EXPENSE_DETAIL"  value={pageInfo.EXPENSE_DETAIL} label="세부내역" size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item sm="3">
                        <Input name="EXPENSE_NOTE"  value={pageInfo.EXPENSE_NOTE} label="비고" size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item sm="2">
                    <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={onAddClick}>
                        추가
                    </Button>
                    </Grid>
                </Grid>
                </div>
                <TableContainer component={Paper}  className={classes.tableContainer}>
                    <Table aria-label="simple table" size="small">
                    <TableHead className={classes.tableHeader}>
                        <TableRow>
                            <TableCell  style={{ width: '10%' }} align="center">번호</TableCell>
                            <TableCell  style={{ width: '20%' }} align="center">금액</TableCell>
                            <TableCell  style={{ width: '45%' }} align="center">세부내역</TableCell>
                            <TableCell  style={{ width: '20%' }}align="center">비고</TableCell>
                            <TableCell  style={{ width: '15%' }}align="center">삭제</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length === 0 && 
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                <TableCell colSpan={5} align="center">등록된 정보가 없습니다.</TableCell>
                            </TableRow>
                            }
                            {data.map((i, idx) => 
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={idx} >
                                    <TableCell align="center">{idx +1}</TableCell>
                                    <TableCell align="center">{i.EXPENSE_PRICE}</TableCell>
                                    <TableCell align="center">{i.EXPENSE_DETAIL}</TableCell>
                                    <TableCell align="center">{i.EXPENSE_NOTE}</TableCell>
                                    <TableCell align="center"><IconButton aria-label="delete" onClick={onDeleteHandler(i.id)}>
                                        <DeleteIcon />
                                            </IconButton>
                                    </TableCell>
                                </TableRow>
                            )}
                            
                        </TableBody>
                    </Table>
                    </TableContainer>
            </div>
    </>)

}
export default memo(MoneyTable)