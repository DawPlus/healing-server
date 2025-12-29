import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";

const InsertForm = forwardRef((props, ref) => {
    const { 
        rows = [], 
        addRow, 
        removeRow, 
        changeValue,
        onCheckChange,
        setAllData
    } = props;
    
    // Keep a local copy of rows for FormDataAdapter compatibility
    const [localRows, setLocalRows] = useState([]);
    
    // 힐링서비스 직업 목록 (예방효과와 통일)
    const healingJobOptions = [
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

    // Memoize fields and headerInfo to prevent unnecessary re-renders
    const fields = useMemo(() => [
        {name: 'name', label: "이름", type: "text"},
        {name: 'sex', label: "성별", type: "select"},
        {name: 'age', label: "연령", type: "age"},
        {name: 'residence', label: "거주지", type: "select"},
        {name: 'job', label: "직업", type: "select", options: healingJobOptions},
        {name: 'past_stress_experience', label: "과거 경험", type: "select", options: ["", "없음", "있음"]},
        {name: 'score1', label: "내면화된 수치심(문항1)", type: "sNumber"},
        {name: 'score2', label: "내면화된 수치심(문항2)", type: "sNumber"},
        {name: 'score3', label: "내면화된 수치심(문항3)", type: "sNumber"},
        {name: 'score4', label: "내면화된 수치심(문항4)", type: "sNumber"},
        {name: 'score5', label: "문제해결 능력(문항5)", type: "sNumber"},
        {name: 'score6', label: "문제해결 능력(문항6)", type: "sNumber"},
        {name: 'score7', label: "문제해결 능력(문항7)", type: "sNumber"},
        {name: 'score8', label: "문제해결 능력(문항8)", type: "sNumber"},
        {name: 'score9', label: "인지적 정서조절(문항9)", type: "sNumber"},
        {name: 'score10', label: "인지적 정서조절(문항10)", type: "sNumber"},
        {name: 'score11', label: "인지적 정서조절(문항11)", type: "sNumber"},
        {name: 'score12', label: "인지적 정서조절(문항12)", type: "sNumber"},
        {name: 'score13', label: "회복탄력성(문항13)", type: "sNumber"},
        {name: 'score14', label: "회복탄력성(문항14)", type: "sNumber"},
        {name: 'score15', label: "회복탄력성(문항15)", type: "sNumber"},
        {name: 'score16', label: "회복탄력성(문항16)", type: "sNumber"},
        {name: 'score17', label: "자존감(문항17)", type: "sNumber"},
        {name: 'score18', label: "자존감(문항18)", type: "sNumber"},
        {name: 'score19', label: "자존감(문항19)", type: "sNumber"},
        {name: 'score20', label: "자존감(문항20)", type: "sNumber"},
        {name: 'score21', label: "생활 스트레스(문항21)", type: "sNumber"},
        {name: 'score22', label: "생활 스트레스(문항22)", type: "sNumber"}
    ], []);

    const headerInfo = useMemo(() => [
        ['선택', '이름', '성별', '연령', '거주지', '직업', '과거경험', '내면화된 수치심', '내면화된 수치심', '내면화된 수치심', '내면화된 수치심', '문제해결 능력', '문제해결 능력', '문제해결 능력', '문제해결 능력', '인지적 정서조절', '인지적 정서조절', '인지적 정서조절', '인지적 정서조절', '회복탄력성', '회복탄력성', '회복탄력성', '회복탄력성', '자존감', '자존감', '자존감', '자존감', '생활 스트레스', '생활 스트레스'],
        ['', '', '', '', '', '', '', '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', '문항11', '문항12', '문항13', '문항14', '문항15', '문항16', '문항17', '문항18', '문항19', '문항20', '문항21', '문항22']
    ], []);
    
    // Update local rows when props change
    useEffect(() => {
        if (rows && rows.length > 0) {
            setLocalRows([...rows]);
            console.log("InsertForm: Updated local rows from props, count:", rows.length);
        }
    }, [rows]);
    
    // Expose methods via ref - critical for FormDataAdapter
    useImperativeHandle(ref, () => ({
        addRow,
        removeRow,
        setAllData,
        setRows: (newRows) => {
            console.log("InsertForm: setRows called with", newRows?.length, "rows");
            if (Array.isArray(newRows)) {
                setLocalRows([...newRows]);
                
                if (typeof setAllData === 'function') {
                    setAllData('all', newRows);
                }
            }
            return true;
        },
        rows: localRows || rows,
        // Add forceUpdate method
        forceUpdate: () => {
            setLocalRows([...rows]);
        },
        resetForm: () => {
            // Add form reset logic if needed
        }
    }), [addRow, removeRow, setAllData, localRows, rows]);

    const handleChange = (idx, name, value) => {
        console.log(`InsertForm handling change: idx=${idx}, name=${name}, value=${value}`);
        
        // Update our local copy immediately
        setLocalRows(prevRows => 
            prevRows.map((row, rowIndex) => 
                (rowIndex === idx || row.idx === idx) ? { ...row, [name]: value } : row
            )
        );
        
        // Call the parent's change handler
        if (typeof changeValue === 'function') {
            changeValue(idx, name, value);
        } else {
            console.error("changeValue is not a function in InsertForm");
        }
    };

    const handleCheckChange = (idx, checked) => {
        console.log("InsertForm.handleCheckChange", idx, checked);
        if (typeof onCheckChange === 'function') {
            onCheckChange(idx, checked);
        }
    };

    // Use rows from props for rendering if available, otherwise use local state
    const rowsToRender = rows.length > 0 ? rows : localRows;
    
    console.log("InsertForm rendering with rows:", rowsToRender.length, new Date().toISOString());

    return (
        <>
            <SetValue 
                onAdd={addRow} 
                onRemove={removeRow}
                onSetData={setAllData}
            />

            <TableContainer style={{ minHeight: "560px", paddingBottom: "50px" }}>
                <Table className="insertForm custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <DynamicTableRow 
                        rows={rowsToRender} 
                        fields={fields} 
                        onCheckChange={handleCheckChange} 
                        onChange={handleChange}
                        onChangeValue={handleChange}
                        changeValue={handleChange}
                        id="idx" 
                    />
                </Table>
            </TableContainer>
        </>
    );
});

InsertForm.displayName = "HealingInsertForm";

export default InsertForm;