import React, { forwardRef, useImperativeHandle } from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";

// 제가 원한건 만족도의 경우 1-5점, 효과성의 경우 0-6점 사이의 숫자만 입력되게 해달라는 것이었습니다. 
// 모든 숫자가 입력되게 하니 오타로 인해 44, 55 이렇게 입력이 되는 경우가 발생하더라구요

const InsertForm = forwardRef((props, ref) => {
    const { 
        rows, 
        addRow, 
        removeRow, 
        changeValue,
        onCheckChange
    } = props;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        // Expose a method to update rows from outside
        setRows: (newRows) => {
            if (props.setAllData && typeof props.setAllData === 'function') {
                console.log("[Service InsertForm] 🔄 setRows 호출됨:", newRows.length);
                console.log("[Service InsertForm] 🔍 참가자 데이터 첫 번째 행:", 
                    JSON.stringify(newRows[0]).substring(0, 200) + '...');
                
                // We need to update the parent component's state
                // This assumes the parent has a function to update all rows at once
                console.log("[Service InsertForm] 🔄 setAllData 호출 시작");
                props.setAllData({type: 'all', value: newRows});
                console.log("[Service InsertForm] ✅ setAllData 호출 완료");
                return true;
            }
            console.log("[Service InsertForm] ❌ setAllData 함수 없음");
            return false;
        },
        // Expose the current rows
        getRows: () => rows,
        // Add resetForm method
        resetForm: () => {
            console.log("[Service InsertForm] ♻️ resetForm 호출됨");
            if (props.setAllData && typeof props.setAllData === 'function') {
                // Reset inputs to default by using an empty row
                // This will trigger a re-render with clean inputs
                return true;
            }
            return false;
        }
    }), [rows, props.setAllData]);

    // 서비스환경 만족도 직업 목록 (예방효과와 통일)
    const serviceJobOptions = [
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

    const fields = [
        {name: 'sex', label: "성별", type: "select"},
        {name: 'age', label: "연령", type: "age"},
        {name: 'residence', label: "거주지", type: "select"},
        {name: 'job', label: "직업", type: "select", options: serviceJobOptions},
        {name: 'score1', label: "숙소는 이용하기 편리했다", type: "sNumber"},
        {name: 'score5', label: "시설 및 산책로 등에 만족한다", type: "sNumber"},
        {name: 'score11', label: "프로그램 안내 및 운영방식은 만족스러웠다", type: "sNumber"},
        {name: 'score14', label: "재료가 신선하고 맛있는 식사가 제공되었다", type: "sNumber"}
    ];

    const headerInfo = [
        ['선택', '성별', '연령', '거주지', '직업', '숙소', '시설/야외', '운영', '식사'],
        ['', '', '', '', '', '숙소는 이용하기 편리했다', '시설 및 산책로 등에 만족한다', '프로그램 안내 및 운영방식은 만족스러웠다', '재료가 신선하고 맛있는 식사가 제공되었다']
    ];

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
                    <DynamicTableRow rows={rows} fields={fields} onCheckChange={handleCheckChange} onChange={handleChange} id="idx" />
                </Table>
            </TableContainer>
        </>
    );
});

InsertForm.displayName = 'InsertForm';

export default InsertForm;