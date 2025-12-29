import React from "react";
import { useDispatch } from "react-redux";
import { actions} from "store/reducers/programReducer";
import { Grid} from '@mui/material';
import {  Input} from "ui-component/inputs";
import NumberInput from "ui-component/inputs/numberInput";

const AmountInputForm = ({ data,  type}) => {
    // dispatch
    const dispatch = useDispatch();


    const { TITLE, EXPENSE_PRICE, EXPENSE_DETAIL, EXPENSE_NOTE , id} = data;

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        dispatch(actions.setArrTargetIdChange({
            target: type === "expense" ? "teacherList" : "customList",
            id,
            name,
            value,
        }));
    };
    
    const onNumberChange = (name, value)=>{
        dispatch(actions.setArrTargetIdChange({
            target: type === "expense" ? "teacherList" : "customList",
            id,
            name,
            value,
        }));
    }


    const wordsToRemove = ["강사집행", "고객집행"];
    const regex = new RegExp(wordsToRemove.join("|"), "g");
    const modifiedString = TITLE.replace(regex, "");

    return (
        <>
            <Grid container item spacing={1} alignItems="center" sm={12} style={{marginTop : "3px"}}>
                <Grid item sm={2}>
                    <div style={{textAlign:"center"}}>
                    {modifiedString}
                    </div>
                </Grid>
                <Grid item sm={3}>
                    <NumberInput name="EXPENSE_PRICE" maxLength={15} value={EXPENSE_PRICE} label="금액" size="small" onChange={onNumberChange}/>
                </Grid>
                <Grid item sm={4}>
                    <Input name="EXPENSE_DETAIL"  value={EXPENSE_DETAIL} label="세부내역" size="small" onChange={onChangeHandler}/>
                </Grid>
                <Grid item sm={3}>
                    <Input name="EXPENSE_NOTE"  value={EXPENSE_NOTE} label="비고" size="small" onChange={onChangeHandler}/>
                </Grid>
            </Grid>
        </>
    );
};

export default React.memo(AmountInputForm);
