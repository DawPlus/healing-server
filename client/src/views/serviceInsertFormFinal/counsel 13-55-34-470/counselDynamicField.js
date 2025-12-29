import React, { memo } from "react";
import { TextField, TableCell } from '@mui/material';
import Select from "ui-component/select";
import NumberInput from "ui-component/inputs/numberInput2";
import SNumberInput from "ui-component/inputs/sNumberInput";
import CounselNumberInput from "./counselNumberInput";  // 새로운 전용 컴포넌트를 사용

const item = {
    SEX : [
        {label: "남", value: "남"},
        {label: "여", value: "여"},
        {label: "미기재", value: "미기재"},
    ],
    RESIDENCE : [
        {label: "서울", value: "서울"},
        {label: "부산", value: "부산"},
        {label: "대구", value: "대구"},
        {label: "인천", value: "인천"},
        {label: "광주", value: "광주"},
        {label: "대전", value: "대전"},
        {label: "울산", value: "울산"},
        {label: "세종", value: "세종"},
        {label: "경기", value: "경기"},
        {label: "강원", value: "강원"},
        {label: "충북", value: "충북"},
        {label: "충남", value: "충남"},
        {label: "전북", value: "전북"},
        {label: "전남", value: "전남"},
        {label: "경북", value: "경북"},
        {label: "경남", value: "경남"},
        {label: "제주", value: "제주"},
        {label: "미기재", value: "미기재"}
    ],
    JOB : [
        {label: "학생", value: "학생"},
        {label: "자영업", value: "자영업"},
        {label: "서비스직", value: "서비스직"},
        {label: "판매영업직", value: "판매영업직"},
        {label: "기능", value: "기능"},
        {label: "단순노무직", value: "단순노무직"},
        {label: "고위공직/임직원", value: "고위공직/임직원"},
        {label: "임직원", value: "임직원"},
        {label: "전문직", value: "전문직"},
        {label: "일반사무직", value: "일반사무직"},
        {label: "농림어업축산직", value: "농림어업축산직"},
        {label: "주부", value: "주부"},
        {label: "무직", value: "무직"},
        {label: "기타", value: "기타"},
        {label: "미기재", value: "미기재"},
    ]
};

const CounselDynamicField = (props) => {
    const { type, label, name, onChange, value, idx } = props;
    
    // 값이 null/undefined인 경우 빈 문자열로 처리
    const safeValue = value !== null && value !== undefined ? String(value) : "";
    
    const getItems = () => {
        // 필드 이름에 해당하는 아이템이 없으면 대문자 버전으로 시도
        return item[name] || item[name.toUpperCase()] || [];
    };
    
    const handleChange = (e) => {
        if (onChange && typeof onChange === 'function') {
            // 값을 문자열로 변환하여 일관성 있게 처리
            const normalizedValue = e.target.value !== null && e.target.value !== undefined 
                ? String(e.target.value) 
                : "";
                
            onChange({
                target: {
                    name: e.target.name || name,
                    value: normalizedValue
                }
            });
        }
    };
    
    if (type === "select") {
        return (
            <TableCell>
                <Select 
                    items={getItems()} 
                    label={label} 
                    value={safeValue} 
                    name={name} 
                    onChange={handleChange} 
                    style={{minWidth: "100px"}}
                />
            </TableCell>
        );
    } else if (type === "age") {
        return (
            <TableCell>
                <NumberInput 
                    label={label} 
                    value={safeValue} 
                    name={name} 
                    onChange={handleChange} 
                    style={{minWidth: "100px"}}
                />
            </TableCell>
        );
    } else if (type === "eNumber") {
        return (
            <TableCell>
                <CounselNumberInput 
                    label={label} 
                    value={safeValue} 
                    name={name} 
                    onChange={handleChange} 
                    maxLength={1} 
                    style={{minWidth: "100px"}}
                />
            </TableCell>
        );
    } else {
        return (
            <TableCell>
                <TextField 
                    size="small" 
                    label={label} 
                    value={safeValue} 
                    name={name} 
                    onChange={handleChange} 
                />
            </TableCell>
        );
    }
};

export default memo(CounselDynamicField); 