import React, {useState} from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import DynamicTableHead from "ui-component/DynamicTableHead";
import callApi from "utils/callApi";

const ParticipationType = (props)=>{

    // Props
    const { openday, endday, agency} = props;

    // State
    const [partTypeList, setPartTypeList] = useState({
        count_addict : "",
        count_adult : "",
        count_benefit : "",
        count_boy : "",
        count_etc : "",
        count_family : "",
        count_handicap : "",
        count_income_etc : "",
        count_income_green : "",
        count_income_voucher : "",
        count_kidboy : "",
        count_lowincome : "",
        count_old : "",
        count_society : "",
        count_teacher : "",
        part_addict : "",
        part_adult : "",
        part_benefit : "",
        part_boy : "",
        part_etc : "",
        part_family : "",
        part_handicap : "",
        part_income_etc : "",
        part_income_green : "",
        part_income_voucher : "",
        part_kidboy : "",
        part_lowincome : "",
        part_old : "",
        part_society : "",
        part_teacher : "",  
    })

    React.useEffect(()=>{
        callApi("/programResult/getPartTypeList", {agency, openday, endday}).then(r=>{
            setPartTypeList(r.data[0])

        })
    },[openday, endday, agency])




    const {
        count_addict,
        count_adult,
        count_benefit,
        count_boy,
        count_etc,
        count_family,
        count_handicap,
        count_income_etc,
        count_income_green,
        count_income_voucher,
        count_kidboy,
        count_lowincome,
        count_old,
        count_society,
        count_teacher,
        part_addict,
        part_adult,
        part_benefit,
        part_boy,
        part_etc,
        part_family,
        part_handicap,
        part_income_etc,
        part_income_green,
        part_income_voucher,
        part_kidboy,
        part_lowincome,
        part_old,
        part_society,
        part_teacher,
    } = partTypeList

    const headerInfo = [
        ["참가유형", "연령대",  "연령대", "연령대", "연령대", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "수입구분", "수입구분", "수입구분", "수입구분", "사업구분", "사업구분", "사업구분"],
        ["", "아동ㆍ청소년",  "성인", "노인", "계", "장애인", "저소득층", "가족", "중독", "교직원", "기타", "계", "녹색자금", "바우처", "기타", "계", "사회공헌", "수입사업", "계"],
    ]

    
    return <>
        <TableContainer>
        <Table className="report custom-table">
            <DynamicTableHead headerInfo={headerInfo}/>
            <TableBody>
                <TableRow>
                    <TableCell>유형(건)</TableCell>
                    <TableCell>{count_kidboy}</TableCell>
                    <TableCell>{count_adult}</TableCell>
                    <TableCell>{count_old}</TableCell>
                    <TableCell>{count_kidboy+count_old+count_boy +count_adult}</TableCell>
                    <TableCell>{count_handicap}</TableCell>
                    <TableCell>{count_lowincome}</TableCell>
                    <TableCell>{count_family}</TableCell>
                    <TableCell>{count_addict}</TableCell>
                    <TableCell>{count_teacher}</TableCell>
                    <TableCell>{count_etc}</TableCell>
                    <TableCell>{count_handicap+ count_lowincome+ count_family+ count_addict+ count_teacher+ count_etc}</TableCell>
                    <TableCell>{count_income_green}</TableCell>
                    <TableCell>{count_income_voucher}</TableCell>
                    <TableCell>{count_income_etc}</TableCell>
                    <TableCell>{count_income_green+ count_income_voucher+count_income_etc}</TableCell>
                    <TableCell>{count_society}</TableCell>
                    <TableCell>{count_benefit}</TableCell>
                    <TableCell>{count_benefit+ count_society}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>인원(수)</TableCell>
                    <TableCell>{part_kidboy}</TableCell>
                    <TableCell>{part_adult}</TableCell>
                    <TableCell>{part_old}</TableCell>
                    <TableCell>{part_kidboy+part_old+part_boy +part_adult}</TableCell>
                    <TableCell>{part_handicap}</TableCell>
                    <TableCell>{part_lowincome}</TableCell>
                    <TableCell>{part_family}</TableCell>
                    <TableCell>{part_addict}</TableCell>
                    <TableCell>{part_teacher}</TableCell>
                    <TableCell>{part_etc}</TableCell>
                    <TableCell>{part_handicap+ part_lowincome+ part_family+ part_addict+ part_teacher+ part_etc}</TableCell>
                    <TableCell>{part_income_green}</TableCell>
                    <TableCell>{part_income_voucher}</TableCell>
                    <TableCell>{part_income_etc}</TableCell>
                    <TableCell>{part_income_green+ part_income_voucher+part_income_etc}</TableCell>
                    <TableCell>{part_society}</TableCell>
                    <TableCell>{part_benefit}</TableCell>
                    <TableCell>{part_benefit+ part_society}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
        </TableContainer>
    
    </>

}
export default ParticipationType;