import React, { forwardRef } from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";

// 테이블 헤더 정보 정의
export const headerInfo = [
    ['선택', '순서', '성별', '연령', '거주지', '직업', '참여구분', '강사', '구성/품질', '효과성'],
    ['', '', '', '', '', '', '', '강사는 전문성을 가지고 프로그램을 제공했다', '프로그램은 체계적이고 알찼다', '기회가 된다면 이 프로그램에 다시 참여할 것이다']
];

// 프로그램 만족도 직업 목록 (예방효과와 통일)
const programJobOptions = [
    { label: "초등학생", value: "초등학생" },
    { label: "중학생", value: "중학생" },
    { label: "고등학생", value: "고등학생" },
    { label: "대학/대학원생", value: "대학/대학원생" },
    { label: "사무/전문직", value: "사무/전문직" },
    { label: "기술/생산/현장직", value: "기술/생산/현장직" },
    { label: "서비스/판매직", value: "서비스/판매직" },
    { label: "의료/보건/예술", value: "의료/보건/예술" },
    { label: "복지/상담직", value: "복지/상담직" },
    { label: "공공서비스/교육", value: "공공서비스/교육" },
    { label: "자영업/프리랜서", value: "자영업/프리랜서" },
    { label: "군인", value: "군인" },
    { label: "주부", value: "주부" },
    { label: "무직/취업준비생", value: "무직/취업준비생" },
    { label: "기타", value: "기타" },
];

// 필드 정의
export const fields = [
    { name: "program_seq", label: "ID" },
    { type: 'select', label: '성별', name: 'sex'},
    { label: '연령', name: 'age', type: "age"},
    { type: 'select', label: '거주지', name: 'residence'},
    { type: 'select', label: '직업', name: 'job', options: programJobOptions},
    { type: 'select', label: '참여구분', name: 'type'},
    { label: '강사는 전문성을 가지고 프로그램을 제공했다', name: 'score1', type: "sNumber"},
    { label: '프로그램은 체계적이고 알찼다', name: 'score4', type: "sNumber"},
    { label: '기회가 된다면 이 프로그램에 다시 참여할 것이다', name: 'score7', type: "sNumber"}
];

const InsertForm = forwardRef((props, ref) => {
    const { 
        rows, 
        addRow, 
        removeRow, 
        changeValue,
        onCheckChange
    } = props;

    const handleChange = (idx, name, value) => {
        changeValue(idx, name, value);
    };

    const handleCheckChange = (idx, checked) => {
        onCheckChange(idx, checked);
    };

    return (
        <>
            <SetValue onAdd={addRow} onRemove={removeRow} />

            <TableContainer style={{ minHeight: "560px", paddingBottom: "50px" }}>
                <Table className="insertForm custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <DynamicTableRow 
                        rows={rows} 
                        fields={fields} 
                        onCheckChange={handleCheckChange} 
                        onChange={handleChange} 
                        id="idx" 
                    />
                </Table>
            </TableContainer>
        </>
    );
});

InsertForm.displayName = 'ProgramInsertForm';

export default InsertForm;