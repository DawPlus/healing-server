import React , {useState, useEffect }from "react";
import { IconButton, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button} from '@mui/material';
import {  SelectItems } from "ui-component/inputs";
import { styled } from '@mui/material/styles';
import NumberInput from "ui-component/inputs/numberInput";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Autocomplete from '@mui/material/Autocomplete';
import { useDispatch, useSelector } from "react-redux";
import { getState , actions} from "store/reducers/programReducer";
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import Swal from "sweetalert2";
import { useMemo } from "react";


const useStyles = makeStyles({
    tableContainer: {
        marginTop : "20px",
        borderRadius : "4px",
        border: '1px solid #cbcbcb',
      '& .MuiTableCell-root': {  // 모든 TableCell에 대한 스타일 적용
    fontSize: '12px',
    }
},
tableHeader: {
    backgroundColor: 'rgba(144, 238, 144, 0.3)',
},
});

const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
    fontSize: "17px"
}));


const ProgramListContainer = ()=>{
    // Classes 
    const classes = useStyles();
    const dispatch = useDispatch();

    const programList = useSelector(s=> getState(s).programList) || [];
    const programMngList = useSelector(s=> getState(s).programMngList);
    const teacherMngList = useSelector(s=> getState(s).teacherMngList);
    
    // Mock 데이터 설정 (programMngList가 없을 경우 사용)
    useEffect(() => {
        // programMngList가 없거나 배열이 아닐 경우 빈 배열로 초기화
        if (!programMngList || !Array.isArray(programMngList)) {
            dispatch(actions.setArrTarget({
                target: 'programMngList',
                value: [
                    { id: 1, name: '명상 프로그램', bunya: '명상' },
                    { id: 2, name: '숲 체험 프로그램', bunya: '숲 체험' }, 
                    { id: 3, name: '요가 프로그램', bunya: '요가' },
                    { id: 4, name: '자연 교감 프로그램', bunya: '자연 교감' },
                    { id: 5, name: '산림욕 프로그램', bunya: '명상' }
                ]
            }));
        }
        
        // teacherMngList가 없거나 배열이 아닐 경우 빈 배열로 초기화
        if (!teacherMngList || !Array.isArray(teacherMngList)) {
            dispatch(actions.setArrTarget({
                target: 'teacherMngList',
                value: [
                    { id: 1, name: '김산림', specialty: '명상' },
                    { id: 2, name: '이치유', specialty: '숲 체험' },
                    { id: 3, name: '박자연', specialty: '요가' },
                    { id: 4, name: '최숲길', specialty: '자연 교감' }
                ]
            }));
        }
    }, [dispatch, programMngList, teacherMngList]);
    
    const [pageInfo , setPageInfo] = useState(
        { programName : "", col1 : "", col2 : "", col3 : "", col4 : ""  }
    );

    const onAdd = ()=>{
        const isEmpty = Object.values(pageInfo).some(value => value === "");
        if(isEmpty){
            Swal.fire({ title : "확인", text : "프로그램 입력중 비어있는값이 있습니다."})
            return;
        }

        // if (programList.length >= 7) { 
        //     Swal.fire({
        //         icon: 'warning',
        //         title: '확인',
        //         text: "프로그램은 7개 까지만 추가 할 수 있습니다. ",
        //         });
        //     return;
        // }
        dispatch(actions.addArrTarget({
            target : "programList", 
            value : pageInfo,
        }));
        setPageInfo({programName : "", col1 : "", col2 : "", col3 : "", col4 : ""  })
    }

    const onRemove = (id) => ()=>{
        dispatch(actions.removeArrTarget({
            target : 'programList', 
            id
        }))
    }

    const onNumberChange = (name, value)=>{
        setPageInfo(s=> ({
            ...s, 
            [name] : value  
        }));
    }

    // 안전한 배열 접근을 위한 방어 코드
    const safeProgramMngList = Array.isArray(programMngList) ? programMngList : [];
    const safeTeacherMngList = Array.isArray(teacherMngList) ? teacherMngList : [];

    const programItems = useMemo(()=> {
        // 방어 코드를 추가하여 programMngList가 배열이 아닐 때 빈 배열을 반환
        const list = safeProgramMngList
            .filter(i => i && typeof i === 'object') // 유효한 객체인지 확인
            .map(i => {
                if (i.bunya === pageInfo.col1) {
                    return {label: `${i.name || ''} [${i.bunya || ''}]`, value: i.name || ''};
                }
                return null;
            });
        return list.filter(i => i);
    }, [safeProgramMngList, pageInfo.col1]);

    const bunyaItem = useMemo(() => {
        // 방어 코드를 추가하여 programMngList가 배열이 아닐 때 빈 배열을 반환
        const _data = [...new Set(
            safeProgramMngList
                .filter(i => i && typeof i === 'object') // 유효한 객체인지 확인
                .map(i => i.bunya || '')
                .filter(bunya => bunya) // 빈 문자열 제거
        )];
        return _data.map(i => ({label: i, value: i}));
    }, [safeProgramMngList]);

    const teacherItems = useMemo(() => 
        safeTeacherMngList
            .filter(i => i && typeof i === 'object') // 유효한 객체인지 확인
            .map(i => ({label: i.name || '', value: i.name || ''}))
            .filter(item => item.label && item.value), // 빈 값 제거
    [safeTeacherMngList]);

    const onChangeProgram = (e)=>{
        setPageInfo(s=> ({
            ...s, 
            programName : e.target.value, 
        }))
    }

    const onChangeBunya = (e)=>{
        setPageInfo(s=> ({
            ...s, 
            col1 : e.target.value, 
        }))
    }
    const onChangeTeacher= (e,value)=>{
        
        setPageInfo(s=> ({
            ...s, 
            col2 : value
        }))
    }
    
    return(
        <>
            <Div alignItems="center">프로그램</Div>
            <Grid  container spacing={1} alignItems="center" justifyContent="flex-end">
                <Grid item  xs={2} >  
                    <SelectItems label="분야" value={pageInfo.col1} items={bunyaItem} onChange={onChangeBunya}/>
                </Grid>
                <Grid item  xs={2} >  
                    <SelectItems label="프로그램명" value={pageInfo.programName} items={programItems} onChange={onChangeProgram}/>
                </Grid>
                <Grid item  xs={2} >  
                    <Autocomplete
                            size="small"
                            value={pageInfo.col2}
                            disablePortal
                            id="combo-box-demo"
                            options={teacherItems}
                            onInputChange={onChangeTeacher}
                            fullWidth
                            noOptionsText={"조회된 강사가 없습니다."}
                            renderInput={(params) => <TextField {...params} label="강사" style={{height : "40px"}}/>}
                        />
                    {/* <SelectItems label="강사명" value={pageInfo.col2} items={teacherItems} onChange={onChangeTeacher}/> */}
                </Grid>
                <Grid item  xs={2} >  
                    <NumberInput name="col3" label="내부강사" value={pageInfo.col3} onChange={onNumberChange}/>
                </Grid>
                <Grid item  xs={2} >  
                    <NumberInput name="col4" label="외부강사" value={pageInfo.col4} onChange={onNumberChange}/>
                </Grid>
                <Grid item  xs={2} > 
                    <div style={{textAlign:"right"}}>
                        <Button variant="contained" color="primary" startIcon={<AddIcon />}   onClick={onAdd}>
                            추가
                        </Button>
                    </div> 
                </Grid>
        
            </Grid>
            <TableContainer component={Paper}  className={classes.tableContainer}>
                <Table aria-label="simple table" size="small">
                <TableHead className={classes.tableHeader}>
                    <TableRow>
                        <TableCell  style={{ width: '20%' }} align="center">프로그램명</TableCell>
                        <TableCell  style={{ width: '20%' }} align="center">분야</TableCell>
                        <TableCell  style={{ width: '15%' }} align="center">강사명</TableCell>
                        <TableCell  style={{ width: '15%' }} align="center">내부강사</TableCell>
                        <TableCell  style={{ width: '15%' }}align="center">외부강사</TableCell>
                        <TableCell  style={{ width: '15%' }}align="center">삭제</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {(!programList || programList.length === 0) && 
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                            <TableCell colSpan={6} align="center">등록된 항목이 없습니다.</TableCell>
                        </TableRow>
                        }
                        {programList && programList.map && programList.map((i, idx) => 
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={idx} >
                                <TableCell align="center">{i.programName}</TableCell>
                                <TableCell align="center">{i.col1}</TableCell>
                                <TableCell align="center">{i.col2}</TableCell>
                                <TableCell align="center">{i.col3}</TableCell>
                                <TableCell align="center">{i.col4}</TableCell>
                                <TableCell align="center">
                                    <IconButton aria-label="delete" onClick={onRemove(i.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default ProgramListContainer;