import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';

import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";
import { headerInfo, fields } from "./fields";

const InsertForm = forwardRef(({ 
  rows = [], 
  onAdd, 
  onRemove, 
  onCheckChange, 
  onChangeValue,
  setAllData
}, ref) => {
    useEffect(() => {
        console.log("InsertForm 렌더링 - rows 데이터:", rows);
    }, [rows]);
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        // Expose a method to update rows from outside
        setRows: (newRows) => {
            if (setAllData && typeof setAllData === 'function') {
                console.log("[Prevent InsertForm] 🔄 setRows 호출됨:", newRows.length);
                console.log("[Prevent InsertForm] 🔍 참가자 데이터 첫 번째 행:", 
                    JSON.stringify(newRows[0]).substring(0, 200) + '...');
                
                // 상위 컴포넌트의 setAllData 메서드를 사용하여 행 업데이트
                console.log("[Prevent InsertForm] 🔄 setAllData 호출 시작");
                setAllData({type: 'all', value: newRows});
                console.log("[Prevent InsertForm] ✅ setAllData 호출 완료");
                return true;
            }
            console.log("[Prevent InsertForm] ❌ setAllData 함수 없음");
            return false;
        },
        // 현재 rows 노출
        getRows: () => rows
    }), [rows, setAllData]);

    return <>   
        <SetValue onAdd={onAdd} onRemove={onRemove} setAllData={setAllData} />
        <TableContainer style={{minHeight: "560px", paddingBottom: "50px" }}>
            <Table className="insertForm custom-table">
                <DynamicTableHead headerInfo={headerInfo} />
                <DynamicTableRow rows={rows} fields={fields} onCheckChange={onCheckChange} onChange={onChangeValue} />
            </Table>
        </TableContainer>
    </>
});

export default InsertForm;