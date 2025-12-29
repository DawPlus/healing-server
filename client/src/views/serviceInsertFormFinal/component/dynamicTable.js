import React from "react";

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";


const DynamicTable = (props)=>{
    const {
        onAdd,
        removeRow, 
        headerInfo, 
        rows, 
        fields, 
        onCheckChange, 
        onChange, 
    } = props;


    return   <>
                <div style={{padding : "15px 5px"}}>
                    <IconButton color="primary" onClick={onAdd}>
                        <AddIcon color="primary" />
                    </IconButton>
                    <IconButton color="primary" onClick={removeRow} style={{margin : "0px 10px"}}>
                        <RemoveIcon color="primary" />
                    </IconButton>
                </div>
                <TableContainer style={{minHeight: "560px" , paddingBottom : "50px" }}>
                    <Table className="insertForm custom-table">
                        <DynamicTableHead headerInfo={headerInfo} />
                        <DynamicTableRow rows={rows} fields={fields} onCheckChange={onCheckChange} onChange={onChange} />
                    </Table>
                </TableContainer>
            </>




}
export default DynamicTable;