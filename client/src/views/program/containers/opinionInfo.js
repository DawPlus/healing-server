import React  from "react";

import {Grid} from '@mui/material';
import {  Input } from "ui-component/inputs";

import { useDispatch, useSelector } from "react-redux";
import { getState , actions} from "store/reducers/programReducer";
 
const DefaultInfos = ()=>{

    const dispatch =useDispatch();
    
    const PROGRAM_OPINION= useSelector(s=> getState(s).basicInfo.PROGRAM_OPINION);
    const SERVICE_OPINION= useSelector(s=> getState(s).basicInfo.SERVICE_OPINION);
    const OVERALL_OPINION= useSelector(s=> getState(s).basicInfo.OVERALL_OPINION);
    


    const onChange = e=> {
        
        dispatch(actions.setBasicInfo({
            key : e.target.name,
            value : e.target.value
        }))
    }

    
    return(
        <> 
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <Input name="PROGRAM_OPINION"  value={PROGRAM_OPINION} label="프로그램소감" multiline rows={4} onChange={onChange}/>
            </Grid>
            <Grid item xs={12}>
                <Input name="SERVICE_OPINION" value={SERVICE_OPINION}label="시설서비스 소감(식사포함)" multiline rows={4} onChange={onChange}/>
            </Grid>
            <Grid item xs={12}>
                <Input name="OVERALL_OPINION" value={OVERALL_OPINION} label="종합의견 및 불편사항" multiline rows={4} onChange={onChange}/>
            </Grid>
        </Grid>
        </>



    );


}
export default DefaultInfos;