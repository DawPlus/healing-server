import React , {memo} from "react";
import ParticipationType from "./participationType";
import ResidenceList from "./residenceList"
import ProgramManager from "./programManage"
import ProgramOverView from "./programOverview"
import SerList from "./serList"
import ProgramEffect from "./programEffect";
import ExIncomeList from "./exIncomeList";

const ProgramTable = (props)=>{

    const {param} = props;


    return <>
        <ParticipationType {...param}/>
        <ResidenceList {...param}/>
        <ProgramOverView {...param}/>
        <ProgramManager {...param}/>
        <SerList {...param}/>
        <ProgramEffect {...param}/>
        <ExIncomeList {...param}/>
    </>;











}
export default memo(ProgramTable);