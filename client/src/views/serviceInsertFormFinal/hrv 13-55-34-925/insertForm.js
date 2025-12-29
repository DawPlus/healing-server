import React from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import SetValue from "../component/setValue";
import CustomTableRow from "./components/customTableRow";

const InsertForm = ({ 
  rows, 
  addRow, 
  removeRow, 
  onCheckChange, 
  onChange
}) => {
    const fields = [ 
        {name: "HRV_SEQ", label: "ID"},
        {name: "SEX", label: "성별", type: "select"},
        {name: "AGE", label: "연령", type: "age"},
        {name: "NUM1", label: "자율신경활성도"},
        {name: "NUM2", label: "자율신경균형도"},
        {name: "NUM3", label: "스트레스저항도"},
        {name: "NUM4", label: "스트레스지수"},
        {name: "NUM5", label: "피로도지수"},
        {name: "NUM6", label: "평균심박동수"},
        {name: "NUM7", label: "심장안정도"},
        {name: "NUM8", label: "이상심박동수"},
    ];
    
    const headerInfo = [
        ['선택','ID', '성별', '연령', '자율신경활성도', '자율신경균형도', '스트레스저항도', '스트레스지수', '피로도지수', '평균심박동수', '심장안정도', '이상심박동수'],
        ['', '', '', '', '', '', '', '', '', '', '', '']
    ];

    const handleChange = (idx, name, value) => {
        onChange(idx, name, value);
    };

    const handleCheckChange = (idx, checked) => {
        onCheckChange(idx, checked);
    };

    return (
        <>   
            <SetValue 
                onAdd={addRow} 
                onRemove={removeRow}
            />
            <TableContainer style={{minHeight: "560px", paddingBottom: "50px"}}>
                <Table className="insertForm custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <CustomTableRow 
                        rows={rows} 
                        fields={fields} 
                        id="idx" 
                        onCheckChange={handleCheckChange} 
                        onChange={handleChange} 
                    />
                </Table>
            </TableContainer>
        </>
    );
};

export default InsertForm;