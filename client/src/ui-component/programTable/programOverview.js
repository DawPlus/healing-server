import React , {useState}from "react";
import { Table,  TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import DynamicTableHead from "ui-component/DynamicTableHead";
import callApi from "utils/callApi";


const headerInfo =     [
    ["구분", '참여인원(명)', '참여인원(명)', '참여인원(명)', '참여인원(명)', '참여인원(명)', '참여인원(명)', '참여인원(명)', '참여인원(명)', '지원사항', '지원사항', '지원사항', '지원사항', '서비스유형', '서비스유형', '서비스유형', '서비스유형', '서비스유형', '서비스유형'],
    ["", '남(참여자)', '여(참여자', '계', '남(인솔자)', '여(인솔자)', '계', '실인원', '연인원', '프로그램', '숙박', '식사', '기타', '산림교육', '산림치유', '중독치유', '중독예방', '힐링', '기타'],
    
]


const headerInfo2 =     [
    ["객실배정", '인원명', '인원명', '인원명', '인원명', '객실(실)', '객실(실)', '객실(실)', '객실(실)', '식사', '식사', '식사', '식사'],
    ["", '참여자', '인솔자', '기타', '계', '참여자', '인솔자', '기타', '계', '참여자', '인솔자', '기타', '계'],    
]
const ParticipationType = (props)=>{
    
    const {agency, openday, endday} = props;

    const [programOverview, setProgramOverview] = useState({
        people: [],
        pTotal : [], 
        service  : [], 
        room  : [{
        meal_etc: "",
        meal_lead: "",
        meal_part: "",
        room_etc_people: "",
        room_etc_room: "",
        room_lead_people: "",
        room_lead_room: "",
        room_part_people: "",
        room_part_room: "",
        }]  
    })

    const {people, service, room, pTotal} =programOverview


    React.useEffect(()=>{
        callApi("/programTable/getAllPrograms", {agency, openday, endday}).then(r=>{
            setProgramOverview(r.data)
        })
    },[openday, endday, agency])


    const combineData = people.map((peopleItem) => {
        const serviceItem = service.find((item) => item.BIZ_PURPOSE === peopleItem.BIZ_PURPOSE);
        const pTotalItem = pTotal.find((item) => item.BIZ_PURPOSE === peopleItem.BIZ_PURPOSE);        
            return {
            ...peopleItem,
            ...serviceItem,
            ...pTotalItem
            };
        });


    const totalRow = combineData.reduce((acc, curr) => {
        for (const key in curr) {
            if (key !== "BIZ_PURPOSE") {
            acc[key] = (acc[key] || 0) + curr[key];
            }
        }
        return acc;
        }, { "BIZ_PURPOSE": "계" });

    
    return <>
        <TableContainer style={{marginTop : "20px"}}>
            <Table className="report custom-table">
                <DynamicTableHead headerInfo={headerInfo}/>
                <TableBody>
                        {combineData.reverse().map((i, idx)=>
                            <TableRow key={idx}>
                                <TableCell>{i.BIZ_PURPOSE}</TableCell>                        
                                {i.BIZ_PURPOSE === "수익사업" ? <>
                                    <TableCell>{i.part_man}</TableCell>                        
                                    <TableCell>{i.part_woman}</TableCell>                        
                                    <TableCell>{i.part_man + i.part_woman || ""}</TableCell>                        
                                    <TableCell>{i.lead_man}</TableCell>                        
                                    <TableCell>{i.lead_woman}</TableCell>                        
                                    <TableCell>{i.lead_man + i.lead_woman}</TableCell>                        
                                    <TableCell>{i.part_man + i.part_woman+i.lead_man + i.lead_woman || ""}</TableCell>
                                </> : 
                                <>    
                                    <TableCell>{i.soc_part_man}</TableCell>                        
                                    <TableCell>{i.soc_part_woman}</TableCell>                        
                                    <TableCell>{i.soc_part_man + i.soc_part_woman}</TableCell>                        
                                    <TableCell>{i.soc_lead_man}</TableCell>                        
                                    <TableCell>{i.soc_lead_woman}</TableCell>                        
                                    <TableCell>{i.soc_lead_man + i.soc_lead_woman}</TableCell>
                                    <TableCell>{i.soc_part_man + i.soc_part_woman +i.soc_lead_man + i.soc_lead_woman || ""}</TableCell>
                                </>}
                                <TableCell>{i.grand_total}</TableCell>
                                <TableCell>{i.count_program}</TableCell>                        
                                <TableCell>{i.count_accommodation}</TableCell>                        
                                <TableCell>{i.count_meal}</TableCell>                        
                                <TableCell>{i.count_etc}</TableCell>                        
                                {/* <TableCell>{i.count_accommodation + i.count_program + i.count_meal + i.count_etc }</TableCell>                         */}
                                <TableCell>{i.forest_edu}</TableCell>                        
                                <TableCell>{i.forest_healing}</TableCell>                        
                                <TableCell>{i.addict_healing}</TableCell>                        
                                <TableCell>{i.addict_prevent}</TableCell>                        
                                <TableCell>{i.healing}</TableCell>
                                <TableCell>{i.ser_etc}</TableCell>                        
                            </TableRow>
                        )}
                            <TableRow>
                                <TableCell>{totalRow.BIZ_PURPOSE}</TableCell>                        
                                <TableCell>{totalRow.part_man +totalRow.soc_part_man  || ""}</TableCell>                        
                                <TableCell>{totalRow.part_woman + totalRow.soc_part_woman  || ""}</TableCell>                        
                                <TableCell>{totalRow.part_man + totalRow.part_woman + totalRow.soc_part_man + totalRow.soc_part_woman || ""}</TableCell>                        
                                <TableCell>{totalRow.lead_man+ totalRow.soc_lead_man  || ""}</TableCell>                        
                                <TableCell>{totalRow.lead_woman + totalRow.soc_lead_woman  || ""}</TableCell>                        
                                <TableCell>{totalRow.lead_man + totalRow.lead_woman  + totalRow.soc_lead_man + totalRow.soc_lead_woman  || ""}</TableCell>                        
                                <TableCell>{totalRow.part_man + totalRow.part_woman+totalRow.lead_man + totalRow.lead_woman + totalRow.soc_part_man + totalRow.soc_part_woman +totalRow.soc_lead_man + totalRow.soc_lead_woman  || ""}</TableCell>
                                <TableCell>{totalRow.grand_total}</TableCell>
                                <TableCell>{totalRow.count_program}</TableCell>                        
                                <TableCell>{totalRow.count_accommodation}</TableCell>                        
                                <TableCell>{totalRow.count_meal}</TableCell>                        
                                <TableCell>{totalRow.count_etc}</TableCell>                        
                                {/* <TableCell>{totalRow.count_accommodation + totalRow.count_program + totalRow.count_meal + totalRow.count_etc }</TableCell>                         */}
                                <TableCell>{totalRow.forest_edu}</TableCell>                        
                                <TableCell>{totalRow.forest_healing}</TableCell>                        
                                <TableCell>{totalRow.addict_healing}</TableCell>                        
                                <TableCell>{totalRow.addict_prevent}</TableCell>                        
                                <TableCell>{totalRow.healing}</TableCell>                        
                                <TableCell>{totalRow.ser_etc}</TableCell>                        
                            </TableRow>
                </TableBody>
            </Table>
            </TableContainer>
            <TableContainer style={{marginTop : "20px"}}>
            <Table className="report custom-table">
                <DynamicTableHead headerInfo={headerInfo2}/>
                <TableBody>
                    {room.map((i, idx)=>
                        <TableRow key={idx}>
                            <TableCell>객실배정</TableCell>
                            <TableCell>{i.room_part_people}</TableCell>
                            <TableCell>{i.room_lead_people}</TableCell>
                            <TableCell>{i.room_etc_people}</TableCell>
                            <TableCell>{i.room_part_people + i.room_lead_people + i.room_etc_people}</TableCell>
                            <TableCell>{i.room_part_room}</TableCell>
                            <TableCell>{i.room_lead_room}</TableCell>
                            <TableCell>{i.room_etc_room}</TableCell>
                            <TableCell>{i.room_part_room+ i.room_lead_room + i.room_etc_room}</TableCell>
                            <TableCell>{i.meal_part}</TableCell>
                            <TableCell>{i.meal_lead}</TableCell>
                            <TableCell>{i.meal_etc}</TableCell>
                            <TableCell>{i.meal_part+ i.meal_lead+i.meal_etc}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </>

}
export default ParticipationType;