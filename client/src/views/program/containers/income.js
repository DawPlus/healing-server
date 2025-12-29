import React, {memo, useState} from "react";
import { IconButton, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button} from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { getState , actions} from "store/reducers/programReducer";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import NumberInput from "ui-component/inputs/numberInput";
import Input from "ui-component/inputs/input";
import { makeStyles } from '@mui/styles';
import Swal from "sweetalert2";
import Select from "ui-component/inputs/selectItems";
import { styled } from '@mui/material/styles';

const items = [
    {value : "프로그램",      label : "프로그램"},
    {value : "숙박비",  label : "숙박비"},
    {value : "식사비",      label : "식사비"},
    {value : "재료비",      label : "재료비"},
    {value : "기타",      label : "기타"},
    
]

const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    fontSize: "17px"
}));

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

// 수입금액 
const Incomes =memo(()=>{
     // Classes 
    const classes = useStyles();
    // dispatch
    const dispatch = useDispatch();
    // selector
    const income = useSelector(s=> getState(s).income);
    const incomeExtraList = useSelector(s=> getState(s).incomeExtraList);
    // page State
    const [pageInfo, setPageInfo] = useState({
        INCOME_TYPE : "",
        INCOME_PRICE : "",
        INCOME_DETAIL : "",
        INCOME_NOTE : "",
    })


    const onChange = (e)=>{
        const name = e.target.name;
        const value = e.target.value;
        setPageInfo(s=>({
            ...s, 
            [name] : value
        }))
    }

    const onInputChange = (name, value)=>{
        setPageInfo(s=>({
            ...s, 
            [name] : value
        }))
    }

    const onAddClick = ()=>{
        // const isEmpty =pageInfo.INCOME_TYPE === "할인율" ?  [pageInfo.INCOME_TYPE, pageInfo.INCOME_PRICE, pageInfo.INCOME_NOTE].includes(""):  Object.values(pageInfo).some(value => value === "");
        if( [pageInfo.INCOME_TYPE, pageInfo.INCOME_PRICE].includes("")){
            Swal.fire({ title : "확인", text : "분류 / 금액 을 입력해 주십시오 "})
            return;
        }

        dispatch(actions.addArrTarget({
            target : "incomeExtraList",
            value : pageInfo
        }))
        setPageInfo({
            INCOME_TYPE : "",
            INCOME_PRICE : "",
            INCOME_DETAIL : "",
            INCOME_NOTE : "",
        })
    }


    const onDeleteHandler= (id) => ()=>{
        dispatch(actions.removeArrTarget({
            target : "incomeExtraList", 
            id
        }));
    }
    
    const onChangeHandler = id => e=>{
        const {name, value} = e.target;
        dispatch(actions.setArrTargetIdChange({
            target : "income", 
            id , 
            name, 
            value
        }))
    }


    const onNumberChange= id=>  (name, value)=>{
        dispatch(actions.setArrTargetIdChange({
            target : "income", 
            id , 
            name, 
            value
        }))
    }


    const displayRows = React.useMemo(()=>[...incomeExtraList].sort((a, b) => a.INCOME_TYPE.localeCompare(b.INCOME_TYPE)),[incomeExtraList])
    



    return (<>   
                <Grid container spacing={2} alignItems="center" style={{padding :"10px 0px"}}>
                        <Grid item xs={12}>
                            <Div style={{  padding: "22px 0px 0px 8px"}}>수입금액</Div>
                        </Grid>

                    {income.map((i, idx)=>
                        {
                        return i.INCOME_TYPE !=="할인율" ? <Grid container item spacing={1} alignItems="center" sm={12} style={{marginTop : "1px"}} key={i.id}>
                                    <Grid item sm={2}>
                                        <div style={{textAlign:"center"}}>
                                            {i.TITLE}
                                        </div>
                                    </Grid>
                                    
                                    <Grid item sm={3}>
                                        <NumberInput name="INCOME_PRICE" maxLength={15}  value={i.INCOME_PRICE} label="금액" size="small" onChange={onNumberChange(i.id)}/>
                                    </Grid>
                                    <Grid item sm={4}>
                                        <Input name="INCOME_DETAIL"  value={i.INCOME_DETAIL} label="세부내역" size="small" onChange={onChangeHandler(i.id)}/>
                                    </Grid>
                                    <Grid item sm={3}>
                                        <Input name="INCOME_NOTE"  value={i.INCOME_NOTE} label="비고" size="small" onChange={onChangeHandler(i.id)}/>
                                    </Grid>
                                </Grid>
                                :
                                <Grid container item spacing={1} alignItems="center" sm={12} style={{marginTop : "1px"}} key={i.id}>
                                    <Grid item sm={2}>
                                        <div style={{textAlign:"center"}}>
                                            {i.TITLE}
                                        </div>
                                    </Grid>
                                    
                                    <Grid item sm={3} container  direction="row" justifyContent="center" alignItems="center">
                                        <Grid item sm={11}>
                                            <NumberInput name="INCOME_PRICE" maxLength={15}  value={i.INCOME_PRICE} label="할인율" size="small" onChange={onNumberChange(i.id)}/>
                                        </Grid>
                                        <Grid item sm={1}><div style={{textAlign:"center"}}>%</div></Grid>
                                    </Grid>
                                    <Grid item sm={7}>
                                        <Input name="INCOME_NOTE"  value={i.INCOME_NOTE} label="비고" size="small" onChange={onChangeHandler(i.id)}/>
                                    </Grid>
                                </Grid>

                        }
                    )}

                    <Grid item sm={2}>
                        <Select name="INCOME_TYPE"  value={pageInfo.INCOME_TYPE} label="분류" items={items}size="small" onChange={onChange}/>
                    </Grid>
                    <Grid item sm={2}>
                        <NumberInput name="INCOME_PRICE" maxLength={15}  value={pageInfo.INCOME_PRICE} label="금액" size="small" onChange={onInputChange}/>
                    </Grid>
                    {pageInfo.INCOME_TYPE === "할인율" ? 
                    <>
                        <Grid item sm={6}>
                            <Input name="INCOME_NOTE"  value={pageInfo.INCOME_NOTE} label="비고" size="small" onChange={onChange}/>
                        </Grid>
                    </> 
                    : 
                    <>
                        <Grid item sm={4}>
                            <Input name="INCOME_DETAIL"  value={pageInfo.INCOME_DETAIL} label="세부내역" size="small" onChange={onChange}/>
                        </Grid>
                        <Grid item sm={2}>
                            <Input name="INCOME_NOTE"  value={pageInfo.INCOME_NOTE} label="비고" size="small" onChange={onChange}/>
                        </Grid>
                    </>}
                    <Grid item sm={2}>
                    <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={onAddClick}>
                        추가
                    </Button>
                    </Grid>
                </Grid>
                
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
                            {displayRows.length === 0 && 
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                <TableCell colSpan={5} align="center">등록된 항목이 없습니다.</TableCell>
                            </TableRow>
                            }
                            {displayRows.map((i, idx) => 
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={idx} >
                                    <TableCell align="center">{idx +1}</TableCell>
                                    <TableCell align="center">{i.INCOME_TYPE}</TableCell>
                                    <TableCell align="center">{i.INCOME_PRICE}</TableCell>
                                    <TableCell align="center">{i.INCOME_DETAIL}</TableCell>
                                    <TableCell align="center">{i.INCOME_NOTE}</TableCell>
                                    <TableCell align="center"><IconButton aria-label="delete" onClick={onDeleteHandler(i.id)}>
                                        <DeleteIcon />
                                            </IconButton>
                                    </TableCell>
                                </TableRow>
                            )}
                            
                        </TableBody>
                    </Table>
                    </TableContainer>
            
    </>);

})
export default Incomes;