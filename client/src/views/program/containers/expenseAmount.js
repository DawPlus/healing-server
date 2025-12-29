import React ,{memo} from "react";
import {Grid} from '@mui/material';
// import {Input} from "ui-component/inputs";
import MainCard from "ui-component/cards/MainCard";
import MoneyTable from "../component/moneyTable"
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from "react-redux";
import NumberInput from "ui-component/inputs/numberInput";
import AmountInputForm  from "../component/amountInpuForm";
import { getState , actions} from "store/reducers/programReducer";
const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    fontSize: "17px"
}));

const ExpenseAmount = ()=>{

    const dispatch = useDispatch();

       // const mealState = useSelector(s => ({
    //     MEAL_TYPE: s.MEAL_TYPE,
    //     MEAL_PART: s.MEAL_PART,
    // }));
    // // 이후 컴포넌트에서는 mealState.MEAL_TYPE, mealState.MEAL_PART를 사용합니다.
    
    
    
    const customList= useSelector(s=> getState(s).customList);
    const teacherList= useSelector(s=> getState(s).teacherList);
    const teacherExtraList= useSelector(s=> getState(s).teacherExtraList);
    const customExtraList= useSelector(s=> getState(s).customExtraList);


    const onChange = (id, target) => (name, value)=>{
        dispatch(actions.setArrTargetIdChange({
            target,
            id, 
            name, 
            value
        }))
    }

    const onAdd = (target) => (value) => {
        dispatch(actions.addArrTarget({
            target, 
            value
        }))
    }

    const onDelete = (target) => (id) => {
        dispatch(actions.removeArrTarget({
            target, 
            id
        }))
    }



    return (<>
    
                <MainCard style={{marginTop : "10px"}}>
                    <Grid container spacing={1} alignItems="center"> 
                        <Grid item xs={12}>
                            <Div style={{  padding: "22px 0px 0px 8px"}}>예정금액-강사(단위:천원)</Div>
                        </Grid>
                        {teacherList.filter(i=> i.TITLE.includes("예정")).map((it, idx)=>{
                                return (
                                    <Grid item sm={3} key={idx}>
                                        <NumberInput name="EXPENSE_PRICE"  value={it.EXPENSE_PRICE} label={it.TITLE.replace("강사예정", "")}   maxLength={15} onChange={onChange(it.id, 'teacherList')}/>
                                    </Grid>)
                            }
                        )}
                        
                        <Grid item xs={12}>
                            <Div style={{  padding: "22px 0px 0px 8px"}}>집행금액-강사(단위:천원)</Div>
                        </Grid>
                        {teacherList.filter(i=> i.TITLE.includes("집행")).map((i, idx)=>
                            <AmountInputForm key={idx} data={i} index={idx} type="expense" />
                        )}
                        
                    </Grid>
                    <MoneyTable data={teacherExtraList} onAdd={onAdd("teacherExtraList")} onDelete={onDelete('teacherExtraList')} type="expense"/>
                </MainCard>

        
                <MainCard style={{marginTop : "10px"}}>
                    <Grid container spacing={1} alignItems="center"> 
                        <Grid item xs={12}>
                            <Div style={{  padding: "22px 0px 0px 8px"}}>예정금액-참가자(단위:천원)</Div>
                        </Grid>
                        {customList.filter(i=> i.TITLE.includes("예정")).map((it, idx)=>{
                                return (
                                    <Grid item sm={3} key={idx}>
                                        <NumberInput name="EXPENSE_PRICE"  value={it.EXPENSE_PRICE} label={it.TITLE.replace("고객예정", "")} maxLength={15} onChange={onChange(it.id, "customList")}/>
                                    </Grid>)
                            }
                        )}
                        
                        <Grid item xs={12}>
                            <Div style={{  padding: "22px 0px 0px 8px"}}>집행금액-참가자(단위:천원)</Div>
                        </Grid>
                        {customList.filter(i=> i.TITLE.includes("집행")).map((i, idx)=>
                            <AmountInputForm key={idx} data={i} index={idx} />
                        )}
                    </Grid>
                    <MoneyTable data={customExtraList} onAdd={onAdd("customExtraList")} onDelete={onDelete('customExtraList')}/>
                </MainCard>

            

        
    </>);

}
export default memo(ExpenseAmount);