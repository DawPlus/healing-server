import React, {useRef}from 'react';
import XLSX from "xlsx-js-style"
import Button from '@mui/material/Button';
import Swal from "sweetalert2";
import axios from 'axios';



function ExcelUpload({ onDataProcessed, onChange, startRow = 1, type }) {
    
    const fileInputRef = useRef(null);

    // Use onDataProcessed or onChange depending on which is provided
    const handleProcessedData = (data) => {
        if (onDataProcessed) {
            onDataProcessed(data);
        } else if (onChange) {
            onChange(data);
        }
    };

    const openFileInput = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = (e) => {


        const file = e.target.files[0];
        const extension = file.name.split('.').pop().toUpperCase();

        if (!['XLS', 'XLSX'].includes(extension)) {
            Swal.fire({
                icon: 'error',
                title: '확인',
                text: '엑셀 파일만 업로드 가능합니다. [XLS, XLSX]',
                })
            
            e.target.value = '';
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: '엑셀업로드',
            text: ` 업로드된 항목은 꼭 확인이 필요합니다.` ,
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText : "취소"
        }).then((result) => {    
            if (result.isConfirmed) {
                readExcelFile(file, startRow);
                e.target.value ="";
                
            } 
        })

    };

    const readExcelFile = (file,startRow) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
                
            // Header를 스킵하고 싶은 행 수
            const skipRows = startRow - 1;
            
            const excelData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,  // 1로 설정하여 컬럼 헤더를 사용
            range: skipRows,  // 스킵할 행 수를 설정
            defval: ""
            });

            // 컬럼 순서대로 정렬
            const sortedData = excelData.map((row) => {
            const sortedRow = [];
            for (let i = 0; i < row.length; i++) {
                sortedRow.push(row[i]);
            }
            return sortedRow;
            });
            const _excelData = sortedData.map( (i, idx)=>{
                const modifyValue = {};
                Object.keys(i).forEach((key, index)=>{
                    const newKey = `col${index+1}`;
                    const value = (i[key] || "").toString(); // 값이 없는 경우나 다른 데이터 형식일 경우를 고려하여 toString()을 호출
                    modifyValue[newKey] = value.trim(); // 값 앞뒤 공백 제거 후 저장
                })
                return modifyValue;
            })
            
            handleProcessedData(_excelData); // Excel 데이터를 상위 컴포넌트로 전달
        };
        reader.readAsArrayBuffer(file);
    };


    const getExcelDown= ()=>{
        
        const typeToFileName = {
            default: "다운로드파일",
            service: "서비스환경만족도",
            program: "프로그램만족도",
            counsel: "상담/치유서비스효과평가",
            prevent: "예방서비스효과평가",
            healing: "힐링서비스효과평가",
            hrv: "HRV측정검사",
            vibra: "바이브라측정검사"
        };
        
        let fileName = typeToFileName[type] || typeToFileName.default;


        axios({
            method: 'get',
            url: `/api/download/${type}`,
            responseType: 'arraybuffer', // 응답 데이터를 ArrayBuffer로 받음
        }).then((response) => {
                const data = response.data;
                // 데이터를 Blob 객체로 변환
                const blob = new Blob([data], { type: 'application/octet-stream' });
                // Blob 객체를 URL.createObjectURL을 사용하여 URL로 변환
                const fileUrl = URL.createObjectURL(blob);
                // <a> 태그를 생성하고 속성을 설정
                const downloadLink = document.createElement('a');
                downloadLink.href = fileUrl;
                downloadLink.download = `${fileName}.xlsx`; // 클라이언트에게 제공될 파일 이름
                downloadLink.click();
            })
            .catch((error) => {
                console.error('파일 다운로드 요청 오류:', error);
            });
    }


    return (<>
            <Button variant="contained" size="small" color="primary" onClick={getExcelDown} style={{marginRight : "5px",marginLeft : "10px"}}>양식다운로드</Button>
            <Button variant="contained" size="small" color="primary" onClick={openFileInput}>엑셀 파일 선택 </Button>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload}  ref={fileInputRef} style={{ display: 'none' }}/>
        </>);
    }

export default ExcelUpload;
