import React, {memo} from "react";
import { IconButton, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import NumberInput from "ui-component/inputs/numberInput";
import Input from "ui-component/inputs/input";
import { makeStyles } from '@mui/styles';
import Swal from "sweetalert2";
import Select from "ui-component/inputs/selectItems";


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
/// 추가 테이블 
const MoneyTable = (props)=>{
    // Classes 
    const classes = useStyles();
    // Props 
    const {data,  type,  onAdd, onDelete} = props;
    
    // 값들 
    const [pageInfo, setPageInfo] = React.useState({
        EXPENSE_TYPE : "", 
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


        
        //const isEmpty = Object.values(pageInfo).some(value => value === "");
        if([  pageInfo.EXPENSE_TYPE, pageInfo.EXPENSE_PRICE].includes("") ){
            Swal.fire({ title : "확인", text : "분류 / 금액 을 입력해 주십시오 "})
            return;
        }

        onAdd({ ...pageInfo })
        setPageInfo({
            EXPENSE_TYPE  : "", 
            EXPENSE_PRICE  : "",
            EXPENSE_DETAIL  : "",
            EXPENSE_NOTE  : "",
        })
    }

    const onDeleteHandler= (id) => ()=>{
        onDelete(id);
    }
    


    const expenseItems = [
        {value : "강사집행강사비", label : "강사비"},
        {value : "강사집행보조강사비", label : "보조강사"},
        {value : "강사집행교통비", label : "교통비"},
        {value : "강사집행식사비", label : "식사비"},
    ]


    const expenseItems2 = [
        {value : "고객집행숙박비", label : "숙박비"},
        {value : "고객집행식사비", label : "식사비"},
        {value : "고객집행재료비", label : "재료비"},
        {value : "고객집행기타비", label : "기타"},
    ]


    const getLabel = value=> {
        const items =     type ==="expense"  ? expenseItems : expenseItems2;

        return items.find(i=> i.value === value)?.label

    }


    const onInputChange = (name, value)=>{
        setPageInfo(s=>({
            ...s, 
            [name] : value
        }))
    }

    const displayRows = React.useMemo(()=>[...data].sort((a, b) => a.EXPENSE_TYPE.localeCompare(b.EXPENSE_TYPE)),[data])


    return (<>
            <div style={{padding : "10px", width : "100%"}}>
                {/* <div style={{padding: "0px 0px 10px 8px" ,"fontSize": "15px"}}></div> */}
                <div style={{padding : "10px 0px "}}>
                <Grid container spacing={2}alignItems="center">
                    <Grid item md={2}>
                        <Select name="EXPENSE_TYPE"  value={pageInfo.EXPENSE_TYPE} label="분류" items={type==="expense" ? expenseItems : expenseItems2}size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item md={2}>
                        <NumberInput name="EXPENSE_PRICE"  maxLength={15} value={pageInfo.EXPENSE_PRICE} label="금액" size="small" onChange={onInputChange}/>
                    </Grid>
                    <Grid item md={4}>
                        <Input name="EXPENSE_DETAIL"  value={pageInfo.EXPENSE_DETAIL} label="세부내역" size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item md={2}>
                        <Input name="EXPENSE_NOTE"  value={pageInfo.EXPENSE_NOTE} label="비고" size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item md={2}>
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
                            <TableCell  style={{ width: '7%' }} align="center">번호</TableCell>
                            <TableCell  style={{ width: '14%' }} align="center">분류</TableCell>
                            <TableCell  style={{ width: '14%' }} align="center">금액</TableCell>
                            <TableCell  style={{ width: '40%' }} align="center">세부내역</TableCell>
                            <TableCell  style={{ width: '20%' }}align="center">비고</TableCell>
                            <TableCell  style={{ width: '20%' }}align="center">삭제</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length === 0 && 
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                <TableCell colSpan={5} align="center">등록된 항목이 없습니다.</TableCell>
                            </TableRow>
                            }
                            {displayRows.map((i, idx) => 
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={idx} >
                                    <TableCell align="center">{idx +1}</TableCell>
                                    <TableCell align="center">{getLabel(i.EXPENSE_TYPE)}</TableCell>
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