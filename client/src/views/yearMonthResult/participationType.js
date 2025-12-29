import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import DynamicTableHead from "ui-component/DynamicTableHead";

const ParticipationType = ({ data }) => {
    console.log("ParticipationType data:", data);
    
    const {
        count_adult,
        count_benefit,
        count_boy,
        count_etc,

        count_general, 
        count_family,
        count_handicap,
        count_multicultural,
        
        count_income_etc,
        count_income_green,
        count_income_voucher,
        count_kidboy,
        
        count_old,
        count_society,
        
        part_adult,
        part_benefit,
        part_boy,
        
        part_general, 
        part_family,
        part_handicap,
        part_multicultural,
        
        part_income_etc,
        part_income_green,
        part_income_voucher,
        part_kidboy,
        
        part_old,
        part_society,
        
        org_1,
        org_2,
        org_3,
        org_4,
        org_5,
        org_part_1,
        org_part_2,
        org_part_3,
        org_part_4,
        org_part_5,
    } = data || {};

    const headerInfo = [
        ["참가유형", "연령대",  "연령대", "연령대", "연령대", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참여형태", "참여형태", "참여형태", "참여형태", "사업구분", "사업구분", "사업구분", "단체성격", "단체성격", "단체성격", "단체성격", "단체성격", "단체성격"],
        ["", "아동ㆍ청소년",  "성인", "노인", "계", "일반", "가족", "장애인", "다문화", "계", "단체", "개인", "기타", "계", "사회공헌", "수입사업", "계", "교육기관", "복지기관", "기업", "관공서", "강원랜드", "계" ],
    ]
    
    // 안전하게 숫자 변환
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };
    
    return <>
        <TableContainer>
        <Table className="report custom-table">
            <DynamicTableHead headerInfo={headerInfo}/>
            <TableBody>
                <TableRow>
                    <TableCell style={{width : "170px"}}>유형(건)</TableCell>
                    <TableCell style={{width : "170px"}}>{count_kidboy || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_adult || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_old || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>
                        {safeNumber(count_kidboy) + safeNumber(count_old) + safeNumber(count_boy) + safeNumber(count_adult)}
                    </TableCell>
                    
                    <TableCell style={{width : "170px"}}>{count_general || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_family || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_handicap || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_multicultural || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>
                        {safeNumber(count_general) + safeNumber(count_family) + safeNumber(count_handicap) + safeNumber(count_multicultural)}
                    </TableCell>

                    <TableCell style={{width : "170px"}}>{count_income_etc || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_income_green || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_income_voucher || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>
                        {safeNumber(count_income_green) + safeNumber(count_income_voucher) + safeNumber(count_income_etc)}
                    </TableCell>
                    <TableCell style={{width : "170px"}}>{count_society || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{count_benefit || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>
                        {safeNumber(count_benefit) + safeNumber(count_society)}
                    </TableCell>
                    <TableCell style={{width : "170px"}}>{org_1 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_2 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_3 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_4 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_5 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>
                        {safeNumber(org_1) + safeNumber(org_2) + safeNumber(org_3) + safeNumber(org_4) + safeNumber(org_5)}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>인원(수)</TableCell>
                    <TableCell>{part_kidboy || 0}</TableCell>
                    <TableCell>{part_adult || 0}</TableCell>
                    <TableCell>{part_old || 0}</TableCell>
                    <TableCell>
                        {safeNumber(part_kidboy) + safeNumber(part_old) + safeNumber(part_boy) + safeNumber(part_adult)}
                    </TableCell>

                    <TableCell>{part_general || 0}</TableCell>
                    <TableCell>{part_family || 0}</TableCell>
                    <TableCell>{part_handicap || 0}</TableCell>
                    <TableCell>{part_multicultural || 0}</TableCell>
                    
                    <TableCell>
                        {safeNumber(part_general) + safeNumber(part_family) + safeNumber(part_handicap) + safeNumber(part_multicultural)}
                    </TableCell>
                    <TableCell>{part_income_etc || 0}</TableCell>
                    <TableCell>{part_income_green || 0}</TableCell>
                    <TableCell>{part_income_voucher || 0}</TableCell>
                    <TableCell>
                        {safeNumber(part_income_green) + safeNumber(part_income_voucher) + safeNumber(part_income_etc)}
                    </TableCell>
                    <TableCell>{part_society || 0}</TableCell>
                    <TableCell>{part_benefit || 0}</TableCell>
                    <TableCell>
                        {safeNumber(part_benefit) + safeNumber(part_society)}
                    </TableCell>
                    <TableCell style={{width : "170px"}}>{org_part_1 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_part_2 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_part_3 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_part_4 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>{org_part_5 || 0}</TableCell>
                    <TableCell style={{width : "170px"}}>
                        {safeNumber(org_part_1) + safeNumber(org_part_2) + safeNumber(org_part_3) + safeNumber(org_part_4) + safeNumber(org_part_5)}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
        </TableContainer>
    
    </>
}

export default ParticipationType;