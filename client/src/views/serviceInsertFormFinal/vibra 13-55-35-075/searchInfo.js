import React from "react";
import { Grid } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { getState, actions } from "store/reducers/serviceInsert/vibra";
import { Input, Select, DatePicker} from "ui-component/inputs";

const SearchInfo = ({ searchInfo, onChange })=>{
    const dispatch = useDispatch();
    
    // Also get from Redux for components that might still rely on it
    const reduxSearchInfo = useSelector(s=> getState(s).searchInfo);

    // Use the passed searchInfo or fallback to Redux state
    const { 
        AGENCY = reduxSearchInfo.AGENCY, // 기관명
        DATE = reduxSearchInfo.DATE, // 실시일자
        PV = reduxSearchInfo.PV, // 시점 (사전은 시작으로 변경됨)
    } = searchInfo || {};

    const handleChange = (e)=>{
        const { name, value } = e.target;
        
        // If parent passed onChange, use it
        if (onChange) {
            onChange(name, value);
        } else {
            // Fallback to Redux
            dispatch(actions.setSearchInfo({
                key: name, 
                value: value
            }));
        }
    }

    const handleDateChange = (key, value)=>{
        // If parent passed onChange, use it
        if (onChange) {
            onChange(key, value);
        } else {
            // Fallback to Redux
            dispatch(actions.setSearchInfo({ key, value }));
        }
    }

    const item2 =['사전', '사후'];

    return <>
        <Grid container spacing={2} alignItems={"center"}>
            <Grid item sm={2}>
                <DatePicker label="실시일자" value={DATE} onChange={handleDateChange} name="DATE"/>
            </Grid>
        
            <Grid item sm={2}>
                <Input label="기관명" value={AGENCY} name="AGENCY" onChange={handleChange}/> 
            </Grid>
            {/* <Grid item sm={2}>
            <Input  label="측정기구" value={EQUIPMENT} name="EQUIPMENT" onChange={onChange}/> 
            </Grid> */}
            <Grid item sm={2}>
                <Select options={item2} label="시점" value={PV} name="PV" onChange={handleChange} />
            </Grid>
        </Grid>
        
    </>

}
export default SearchInfo;