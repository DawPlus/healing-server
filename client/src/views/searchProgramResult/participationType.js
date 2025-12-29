import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import DynamicTableHead from "ui-component/DynamicTableHead";

const ParticipationType = ({ data }) => {
    const {
        count_addict,
        count_adult,
        count_benefit,
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
    } = data?.partTypeList || {};

    const headerInfo = [
        ["참가유형", "연령대",  "연령대", "연령대", "연령대", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참가자유형", "참여형태", "참여형태", "참여형태", "참여형태", "사업구분", "사업구분", "사업구분", "단체성격", "단체성격", "단체성격", "단체성격", "단체성격", "단체성격"],
        ["", "아동ㆍ청소년",  "성인", "노인", "계", "장애인", "저소득층", "가족", "중독", "교직원", "기타", "계", "단체", "개인", "기타", "계", "사회공헌", "수입사업", "계", "교육기관", "복지기관", "기업", "관공서", "강원랜드", "계" ],
    ];

    return (
        <>
            <h3 className="tableTitle">참가유형</h3>
            <TableContainer>
                <Table className="report custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <TableBody>
                        <TableRow>
                            <TableCell>유형(건)</TableCell>
                            <TableCell>{count_kidboy || 0}</TableCell>
                            <TableCell>{count_adult || 0}</TableCell>
                            <TableCell>{count_old || 0}</TableCell>
                            <TableCell>{(Number(count_kidboy) || 0) + (Number(count_adult) || 0) + (Number(count_old) || 0)}</TableCell>
                            <TableCell>{count_handicap || 0}</TableCell>
                            <TableCell>{count_lowincome || 0}</TableCell>
                            <TableCell>{count_family || 0}</TableCell>
                            <TableCell>{count_addict || 0}</TableCell>
                            <TableCell>{count_teacher || 0}</TableCell>
                            <TableCell>{count_etc || 0}</TableCell>
                            <TableCell>{(Number(count_handicap) || 0) + (Number(count_lowincome) || 0) + (Number(count_family) || 0) + (Number(count_addict) || 0) + (Number(count_teacher) || 0) + (Number(count_etc) || 0)}</TableCell>
                            <TableCell>{count_income_green || 0}</TableCell>
                            <TableCell>{count_income_voucher || 0}</TableCell>
                            <TableCell>{count_income_etc || 0}</TableCell>
                            <TableCell>{(Number(count_income_green) || 0) + (Number(count_income_voucher) || 0) + (Number(count_income_etc) || 0)}</TableCell>
                            <TableCell>{count_society || 0}</TableCell>
                            <TableCell>{count_benefit || 0}</TableCell>
                            <TableCell>{(Number(count_society) || 0) + (Number(count_benefit) || 0)}</TableCell>
                            <TableCell>{org_1 || 0}</TableCell>
                            <TableCell>{org_2 || 0}</TableCell>
                            <TableCell>{org_3 || 0}</TableCell>
                            <TableCell>{org_4 || 0}</TableCell>
                            <TableCell>{org_5 || 0}</TableCell>
                            <TableCell>{(Number(org_1) || 0) + (Number(org_2) || 0) + (Number(org_3) || 0) + (Number(org_4) || 0) + (Number(org_5) || 0)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>인원(수)</TableCell>
                            <TableCell>{part_kidboy || 0}</TableCell>
                            <TableCell>{part_adult || 0}</TableCell>
                            <TableCell>{part_old || 0}</TableCell>
                            <TableCell>{(Number(part_kidboy) || 0) + (Number(part_adult) || 0) + (Number(part_old) || 0)}</TableCell>
                            <TableCell>{part_handicap || 0}</TableCell>
                            <TableCell>{part_lowincome || 0}</TableCell>
                            <TableCell>{part_family || 0}</TableCell>
                            <TableCell>{part_addict || 0}</TableCell>
                            <TableCell>{part_teacher || 0}</TableCell>
                            <TableCell>{part_etc || 0}</TableCell>
                            <TableCell>{(Number(part_handicap) || 0) + (Number(part_lowincome) || 0) + (Number(part_family) || 0) + (Number(part_addict) || 0) + (Number(part_teacher) || 0) + (Number(part_etc) || 0)}</TableCell>
                            <TableCell>{part_income_green || 0}</TableCell>
                            <TableCell>{part_income_voucher || 0}</TableCell>
                            <TableCell>{part_income_etc || 0}</TableCell>
                            <TableCell>{(Number(part_income_green) || 0) + (Number(part_income_voucher) || 0) + (Number(part_income_etc) || 0)}</TableCell>
                            <TableCell>{part_society || 0}</TableCell>
                            <TableCell>{part_benefit || 0}</TableCell>
                            <TableCell>{(Number(part_society) || 0) + (Number(part_benefit) || 0)}</TableCell>
                            <TableCell>{org_part_1 || 0}</TableCell>
                            <TableCell>{org_part_2 || 0}</TableCell>
                            <TableCell>{org_part_3 || 0}</TableCell>
                            <TableCell>{org_part_4 || 0}</TableCell>
                            <TableCell>{org_part_5 || 0}</TableCell>
                            <TableCell>{(Number(org_part_1) || 0) + (Number(org_part_2) || 0) + (Number(org_part_3) || 0) + (Number(org_part_4) || 0) + (Number(org_part_5) || 0)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ParticipationType;