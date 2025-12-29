import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import DynamicTableHead from "ui-component/DynamicTableHead";

const headerInfo = [
    ["참여일자 및 기간", "참여일자 및 기간", "지역", "참여자(명)", "참여자(명)", "참여자(명)", "인솔자(명)", "인솔자(명)", "인솔자(명)", "총계", "연령대", "참가자유형", "사업구분", "단체성격", "참여형태"],
    ["참여일자", "체류일자", "", "남", "여", "계", "남", "여", "계", "", "", "", "", "", ""],
];

// 기본 정보 
const ParticipationType = ({ data = {} }) => {
    // props로 전달받은 데이터 사용
    const {
        OPENDAY = "", // 참여일자 
        DAYS_TO_STAY = "", // 체류일자
        RESIDENCE = "", // 지역
        PART_MAN_CNT = "0", // 참여자(남)
        PART_WOMAN_CNT = "0", // 참여자(여)
        LEAD_MAN_CNT = "0", // 인솔자(남)
        LEAD_WOMAN_CNT = "0", // 인솔자(여)
        PART_TYPE = "", // 참가자유형
        AGE_TYPE = "", // 연령대
        BIZ_PURPOSE = "", // 사업구분
        org_nature = "", // 단체 성격
        PROGRAM_IN_OUT = "", // 참여형태
    } = data;

    // 숫자 계산
    const sum1 = +PART_MAN_CNT + +PART_WOMAN_CNT;
    const sum2 = +LEAD_MAN_CNT + +LEAD_WOMAN_CNT;
    const daysToStayNum = +DAYS_TO_STAY || 0;

    return (
        <>
            <TableContainer>
                <h3 className="tableTitle" style={{ marginTop: "0px" }}>프로그램시행개요</h3>
                <Table className="report custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <TableBody>
                        <TableRow>
                            <TableCell style={{ width: "150px" }}>{OPENDAY}</TableCell>
                            <TableCell style={{ width: "150px" }}>{DAYS_TO_STAY}</TableCell>
                            <TableCell style={{ width: "150px" }}>{RESIDENCE}</TableCell>
                            <TableCell style={{ width: "150px" }}>{PART_MAN_CNT}</TableCell>
                            <TableCell style={{ width: "150px" }}>{PART_WOMAN_CNT}</TableCell>
                            <TableCell style={{ width: "150px" }}>{sum1}</TableCell>
                            <TableCell style={{ width: "150px" }}>{LEAD_MAN_CNT}</TableCell>
                            <TableCell style={{ width: "150px" }}>{LEAD_WOMAN_CNT}</TableCell>
                            <TableCell style={{ width: "150px" }}>{sum2}</TableCell>
                            <TableCell style={{ width: "150px" }}>{sum1 + sum2}</TableCell>
                            <TableCell style={{ width: "150px" }}>{AGE_TYPE}</TableCell>
                            <TableCell style={{ width: "150px" }}>{PART_TYPE}</TableCell>
                            <TableCell style={{ width: "150px" }}>{BIZ_PURPOSE}</TableCell>
                            <TableCell style={{ width: "150px" }}>{org_nature}</TableCell>
                            <TableCell style={{ width: "150px" }}>{PROGRAM_IN_OUT}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default ParticipationType;