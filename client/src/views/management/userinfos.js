import React from "react";

import { Button,} from '@mui/material';

import TableCell from '@mui/material/TableCell';

import TableRow from '@mui/material/TableRow';
import {actions} from "store/reducers/managementReducer"
import {  Input, SelectItems, NumberInput} from "ui-component/inputs";

import { useDispatch } from "react-redux";

const sexItems = [
    {label  :"남", value : "남"},
    {label  :"여", value : "여"},
    {label  :"미기재", value : "미기재"},
]
const residenceItems = [
    {label : "서울", value : "서울"},
    {label : "부산", value : "부산"},
    {label : "대구", value : "대구"},
    {label : "인천", value : "인천"},
    {label : "광주", value : "광주"},
    {label : "대전", value : "대전"},
    {label : "울산", value : "울산"},
    {label : "세종", value : "세종"},
    {label : "경기", value : "경기"},
    {label : "강원", value : "강원"},
    {label : "충북", value : "충북"},
    {label : "충남", value : "충남"},
    {label : "전북", value : "전북"},
    {label : "전남", value : "전남"},
    {label : "경북", value : "경북"},
    {label : "경남", value : "경남"},
    {label : "제주", value : "제주"},
    {label : "미기재", value : "미기재"}
]
const jobItem = [
    {label : "학생", value : "학생"},
    {label : "자영업", value : "자영업"},
    {label : "서비스직", value : "서비스직"},
    {label : "판매영업직", value : "판매영업직"},
    {label : "기능", value : "기능"},
    {label : "단순노무직", value : "단순노무직"},
    {label : "고위공직/임직원", value : "고위공직/임직원"},
    {label : "임직원", value : "임직원"},
    {label : "전문직", value : "전문직"},
    {label : "일반사무직", value : "일반사무직"},
    {label : "농림어업축산직", value : "농림어업축산직"},
    {label : "주부", value : "주부"},
    {label : "무직", value : "무직"},
    {label : "기타", value : "기타"},
    {label : "미기재", value : "미기재"},
]
const UserInfos = (props)=>{
    const dispatch = useDispatch();
    const {
        data,
        index, 
       // onChange,
       // onNumberChange,
       // removeRow
    } = props;



    const onChange= index =>  e=> {
        const key = e.target.name;
        const value = e.target.value;        
        dispatch(actions.onChangeUserTemp({ index, key, value }))
    }   
    const onNumberChange = index => (key, value)=>{
        dispatch(actions.onChangeUserTemp({ index, key, value }))
    }

 // 삭제
    const removeRow = (d)=>{
        dispatch(actions.onUserTempRemoveRow(d))
    }

    const {
        id,
        idx,
        name,
        sex,
        age,
        residence,
        job,
        //jumin,
    } = data;
    return (<>
    <           TableRow>
                    <TableCell >
                        <Input label="ID" value={id} name="id" onChange={onChange(index)}/> 
                    </TableCell>
                    <TableCell >
                        <Input label="이름" value={name} name="name" onChange={onChange(index)}/> 
                    </TableCell>
                    <TableCell >
                        <SelectItems items={sexItems} label="성별" value={sex} name="sex" onChange={onChange(index)}/>
                    </TableCell>
                    <TableCell >
                        <NumberInput label="연령" value={age} name="age" onChange={onNumberChange(index)}/> 
                    </TableCell>
                    <TableCell >
                        <SelectItems items={residenceItems} label="거주지" value={residence} name="residence" onChange={onChange(index)}/>
                    </TableCell>
                    <TableCell >
                        <SelectItems items={jobItem} label="직업" value={job} name="job" onChange={onChange(index)}/>
                    </TableCell>
                    {/* <TableCell >
                        <NumberInput label="주민번호앞자리" value={jumin} maxLength={6} name="jumin" onChange={onNumberChange(index)}/> 
                    </TableCell> */}
                    <TableCell align="center">
                        <Button variant="contained" size="small" color="primary" onClick={()=>removeRow(idx)}>삭제</Button>
                    </TableCell>
                </TableRow>
    
    </>);

}

// Individual components for use in userTemp.js
export const Sex = ({ value, onChange }) => (
    <SelectItems 
        items={sexItems} 
        label="성별" 
        value={value || ""}
        onChange={onChange}
    />
);

export const Age = ({ value, onChange }) => (
    <NumberInput 
        label="연령" 
        value={value || ""} 
        name="age"
        onChange={(name, val) => onChange({ target: { value: val } })}
    />
);

export const Residence = ({ value, onChange }) => (
    <SelectItems 
        items={residenceItems} 
        label="거주지" 
        value={value || ""}
        onChange={onChange}
    />
);

export const Job = ({ value, onChange }) => (
    <SelectItems 
        items={jobItem} 
        label="직업" 
        value={value || ""}
        onChange={onChange}
    />
);

// Attach the components to UserInfos
UserInfos.Sex = Sex;
UserInfos.Age = Age;
UserInfos.Residence = Residence;
UserInfos.Job = Job;

export default React.memo(UserInfos);