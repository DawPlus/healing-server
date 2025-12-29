import React , {useEffect, useMemo}from "react";
import { useDispatch, useSelector } from "react-redux";
import {actions, getState} from "store/reducers/updateDeleteReducer"
import {actions as pActions} from "store/reducers/programReducer"
import Swal from "sweetalert2";
import MainCard from 'ui-component/cards/MainCard';
import DataGrid from 'ui-component/dataGrid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import {  InputLabel} from '@mui/material';
import callApi from "utils/callApi";
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DatePicker from "ui-component/inputs/datePicker";
import { useNavigate } from 'react-router-dom';

import { useLocation } from 'react-router-dom';


import { Grid } from "@mui/material";


const UpdateDelete = ()=>{

    // 1. useLocation 훅 취득
    const location = useLocation();

    const navigate = useNavigate();
    // Dispatch
    const dispatch = useDispatch();
    // Rows
    const {rows, type} = useSelector(s=> getState(s));


    React.useEffect(()=>{
        
        if(!location.state) return; 
        const {params}= location.state;
        
        setOpenday(s=> params.openday);
        setEndday(s=> params.endday);
        dispatch(actions.setValue({
            key : "type",
            value : params.type
        }));
        dispatch(actions.getList({...params}))

        // const [openday, setOpenday] = React.useState("");
        // const [endday, setEndday] = React.useState("");

    },[location.state])

    useEffect(()=>{
        
        return ()=>{
            dispatch(actions.initState())
        }
    }, [])

    // Component Did Mount 
    // useEffect(()=>{
    //     if(type){
    //         // dispatch(actions.getList({type}))
    //     }else{
    //         dispatch(actions.setValue({
    //             key : "rows", 
    //             value : []
    //         }))
    //     }

    // },[type]);

    // 입력양식 변경 Event 
    const onSelectChange = (e)=>{
        dispatch(actions.setValue({
            key : "type",
            value : e.target.value
        }))
    }


    const onUpdateClick = (data)=>{
        //PARAM 
        const [seq, name, openday, evalDate] = [data[0], data[2], data[3], data[4]]

        Swal.fire({
            title: `${name}`,
            text: `${name} 을/를 수정 하시겠습니까? ` ,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then(r=>{
            if(r.isConfirmed){

                // {value : "serviceInsertForm" , label : "서비스환경 만족도"},
                // {value : "programInsertForm" , label : "프로그램 만족도"},
                // {value : "counselInsertForm" , label : "상담&치유서비스 효과평가"},
                // {value : "preventInsertForm" , label : "예방서비스 효과평가"},
                // {value : "healingInsertForm" , label : "힐링서비스 효과평가"},
                // {value : "hrvInsertForm" , label : "HRV 측정 검사"},
                // {value : "vibraInsertForm" , label : "바이브라 측정 검사"},

                const searchInfo = {type, openday : selectOpenday, endday : selectEndday}


                switch(type){
                    case 1 : // 프로그램운영결과
                        alert("'프로그램 결과입력' 페이지가 삭제되었습니다.");
                        break;
                    case 2 : // 서비스환경만족도
                        navigate("/serviceInsertForm", {state : {type  : "serviceInsertForm", name ,openday, evalDate, searchInfo} })
                        break;
                    case 3 : // 프로그램만족도
                        navigate("/serviceInsertForm", {state : {type : "programInsertForm", data, searchInfo} })
                        break;
                    case 4 : // 상담&치유서비스 효과평가
                        navigate("/serviceInsertForm", {state : {type : "counselInsertForm", data, searchInfo} })
                        break;
                    case 5 : // 예방효과(스마트폰)
                        navigate("/serviceInsertForm", {state : {type : "preventInsertForm",data, searchInfo} })
                        break;
                    case 6 : // 힐링서비스 효과평가
                        navigate("/serviceInsertForm", {state : {type : "healingInsertForm", data, searchInfo} })
                        break;
                    case 7 : // HRV 측정 검사
                        navigate("/serviceInsertForm", {state : {type : "hrvInsertForm", data, searchInfo} })
                        break;
                    case 8 : // 바이브라 측정 검사
                        navigate("/serviceInsertForm", {state : {type : "vibraInsertForm", data, searchInfo} })
                        break;
                    default : break;
                        
                }
                
            }
        })
    }
    const displays = [3,4,5,6,7,8];

    // 삭제 클릭 
    const onDeleteClick = (data)=>{
        //PARAM 
        const seq = data[0];
        const [name, openday, eval_date, agency, pv, program_name ] = [data[2], data[3], data[4], data[6], data[7], data[8]]
        
        let value = {
            type
        };
        switch(type){
            case 1 : // 프로그램운영결과
                value = { seq }
                break;
            case 2 : // 서비스환경만족도
                value = {
                    ...value, 
                    agency : name,
                    openday, 
                    eval_date
                }
                break;
            case 3 : // 프로그램만족도
                value = {
                    ...value,
                    agency, 
                    openday, 
                    eval_date,
                    program_name
                }
                break;
            case 4 : // 상담&치유서비스 효과평가
            case 5 : // 예방효과(스마트폰)
                value = {
                    ...value, 
                    agency, 
                    openday, 
                    pv
                }
                break;
            case 6 : // 힐링서비스 효과평가
                value = {
                    ...value, 
                    agency : name, 
                    openday, 
                    pv
                }
                break;
            case 7 : // HRV 측정 검사
            case 8 : // 바이브라 측정 검사
                value = {
                    ...value, 
                    agency, 
                    pv
                }
                break;
            default : break;
            }
                
        Swal.fire({
            title: `${name}`,
            text: `${name} 을/를 삭제 하시겠습니까? ` ,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then((result) => {
            if(result.isConfirmed){
                
                const url = type ===1 ? '/updateDelete/deleteBasicInfo' : '/updateDelete/delete';
                
                callApi(url, value)
                .then(r => {
                    if(r.data?.result){
                        Swal.fire({
                            icon: 'success',
                            title: '확인',
                            text: "삭제 되었습니다.",
                            }).then(()=>dispatch(actions.getList({type})))
                    }
                })
            }
        })
    }

    
    
    const columns = useMemo(()=> {
    
        const result = [
            { name: "SEQ",  options : {display:false, filter: false} },
            { name: "INDEX",      label: "번호",options : { filter: false} },
            { name: displays.includes(Number(type)) ? "AGENCY_DISPLAY" : "AGENCY",   label: "기관명"},
            { name: "OPENDAY",  label: "실시일자"},
            { name: "EVAL_DATE",  options : {display:false, filter: false} },
            { name: "삭제", label: " ",
                options: {
                    filter: false,
                    sort : false, 
                    customBodyRender: (_, tableMeta, _u) => {
                    const data = tableMeta.rowData;
                    return ( 
                        <>
                        <Button  onClick={() => onDeleteClick(data)} > <Delete/> </Button>
                        <Button onClick={() => onUpdateClick(data)} > <BorderColorIcon/> </Button>
                        </>
                    );
                },
            },
            },
        ]

        const  options =  {display:false, filter: false}
        const appendRows = [
            {name : "AGENCY", options},
            {name : "PV", options},
        
        ]

        if (Number(type) === 3) {
            appendRows.push({ name: "PROGRAM_NAME", options }); // DISPLAY에 포함될 경우만 추가
            appendRows.push({ name: "BUNYA", options }); // DISPLAY에 포함될 경우만 추가
            appendRows.push({ name: "TEACHER", options }); // DISPLAY에 포함될 경우만 추가
            appendRows.push({ name: "PLACE", options }); // DISPLAY에 포함될 경우만 추가
        }
        // 상담치유
        if (Number(type) === 4) {
            appendRows.push({ name: "COUNSEL_CONTENTS", options }); // DISPLAY에 포함될 경우만 추가
            
        }
        if ([7,8].includes(Number(type))) {
            appendRows.push({ name: "DATE", options }); // DISPLAY에 포함될 경우만 추가
        }
        


        if(displays.includes(Number(type)) ){
            result.push(...appendRows);
        }


        return result;


    },[rows]);
    

    const [selectOpenday, setOpenday] = React.useState("");
    const [selectEndday, setEndday] = React.useState("");

    const onSearch= ()=>{
        dispatch(actions.getList({type, openday  : selectOpenday, endday : selectEndday}))
    }

    return <>
        <MainCard>
        <Grid item container spacing={2} alignItems="center" md={12}>
            <Grid item md={3}><DatePicker label="시작일"name="openday" value={selectOpenday} onChange={(_, value)=>setOpenday(value)}/></Grid>
            <Grid item md={3}><DatePicker label="종료일"name="endday" value={selectEndday} onChange={(_, value)=>setEndday(value)}/></Grid>
            <Grid item md={6}></Grid>
            <Grid item md={3}>
                <FormControl size="small" style={{width: "100%"}}>
                    <InputLabel id="demo-select-small-label">입력양식</InputLabel>
                    <Select labelId="demo-select-small-label" id="demo-select-small" value={type} label="입력양식" onChange={onSelectChange} >
                        <MenuItem value="">입력 양식을 선택해주세요.</MenuItem>
                        <MenuItem value={1}>프로그램 운영 결과</MenuItem>
                        <MenuItem value={2}>서비스환경 만족도</MenuItem>
                        <MenuItem value={3}>프로그램 만족도</MenuItem>
                        <MenuItem value={4}>상담&치유서비스 효과평가</MenuItem>
                        <MenuItem value={5}>예방효과(스마트폰)</MenuItem>
                        <MenuItem value={6}>힐링서비스 효과평가</MenuItem>
                        <MenuItem value={7}>HRV 측정 검사</MenuItem>
                        <MenuItem value={8}>바이브라 측정 검사</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item md={3}>  
                <Button variant="contained" size="small" color="primary" onClick={onSearch} >조회</Button>
            </Grid>
        </Grid>
        </MainCard>
        <MainCard>
            <DataGrid title="수정/삭제" data={rows} columns={columns} options={{
                rowsPerPage : 100
            }} />
        </MainCard>
    </>


}
export default UpdateDelete;