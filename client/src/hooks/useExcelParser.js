import React from 'react';
import XLSX from 'xlsx';

function ExcelUpload({ onDataProcessed, startRow = 1 }) {
    

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const extension = file.name.split('.').pop().toUpperCase();

        if (!['XLS', 'XLSX'].includes(extension)) {
        alert('엑셀 파일만 업로드 가능합니다. [XLS, XLSX]');
        e.target.value = '';
        return;
        }

        readExcelFile(file);
    };

    const readExcelFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
        

            
            // range 설정
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            range.s.r = Math.max(startRow - 1, 0);

            const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range });
            
            onDataProcessed(excelData); // Excel 데이터를 상위 컴포넌트로 전달
        };
        reader.readAsArrayBuffer(file);
    };

    

    return (<>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </>);
    }

export default ExcelUpload;
