import { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Chip, ClickAwayListener, List, ListItemButton, ListItemIcon, ListItemText, Paper, Popper, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
// ES6 Modules or TypeScript
import Swal from 'sweetalert2'
// assets
import { IconLogout,  IconSettings } from '@tabler/icons';
import axios from 'axios';

// import callApi from "utils/callApi";
// import moment from "moment";
// import XLSX from "xlsx-js-style"
// import { defaultStyle, headerStyle } from "utils/utils";



// // 프로그램목록명
// const sheet1Header = [["분야", "프로그램명", "강사명", "내부강사", "외부강사"]];
// const sheet2Header = [["순번", "년도", "월", "일", "사업구분", "목적구분", "단체명", "지역", "단체유형", "참여형태", "대상", "체류일", "참여인원", "연인원", "폐광지역", "OM", "지출금액"]];
// const sheet3Header = [["순번", "년도", "월", "일", "단체명", "분야", "프로그램명", "강사명", "항목1", "항목2", "항목3", "항목4", "항목5", "항목6", "항목7", "항목8", "항목9"]];
// const sheet4Header = [ ['순번', '강사명', '프로그램명','횟수', '전문성',"성실성", "반응성", "평균", "체계성", "적합성", "흥미성", '평균', "학습성", "재참여", "추천", "평균", "총평균"] ];
//const sheet5Header = [["구분", "건(사회공헌)", "실인원(사회공헌)", "연인원(사회공헌)", "건(수입구분)", "실인원(수입구분)", "연인원(수입구분)", "건(전체)", "실인원(전체)", "연인원(전체)"]];

// ==============================|| PROFILE MENU ||============================== //

const ProfileSection = () => {
    const theme = useTheme();
    const customization = useSelector((state) => state.customization);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const anchorRef = useRef(null);
    const handleLogout = async () => 
    {
             
        Swal.fire({
            title: '로그아웃',
            text: '로그아웃 하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#767676',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
          }).then((result) => {    
            if (result.isConfirmed) {
                axios.post("/api/logout").then(r=> {
           
                    Swal.fire({
                        title: '로그아웃',
                        text: '로그아웃되었습니다. 로그인화면으로 이동합니다. ',
                        icon: 'success',
                        confirmButtonText: 'OK',
                      }).then((result) => {    
                        if (result.isConfirmed) {
                            navigate("/login")
                        } 
                      })


        
                })          
            } 
          })

        
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);









    // const onDownLoad = ()=>{

    //     callApi("/excelData/programList").then(({data : {sheet1, sheet2,sheet3, sheet4}})=>{
            
    //         // Excel WorkBook 선언 
    //         const wb = XLSX.utils.book_new();
    //         const todayInfo = moment().format("YYYY-MM-DD");
            
            
    //         // 프로그램 목록
    //         const sheet1Data = sheet1.map(i=> i.PROGRAM_IN_OUT).filter((i, idx)=> idx <30);
    //         const sheet1Result = sheet1Data.flatMap(row => {
    //             const items = row.split(","); // 각 로우를 ,로 분리하여 배열로 변환
    //             const subResult = [];
    //             for (let i = 0; i < items.length; i += 5) {
    //                 subResult.push(items.slice(i, i + 5)); // 각 하위 배열을 추가
    //             }
    //             return subResult;
    //         });
    //         // 프로그램목록 탭 
    //         const _sheet1Header = sheet1Header.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
    //         const _sheet1Data = sheet1Result.map(values => values.map(value => ({ v: value, t: 's', s: defaultStyle })));
    //         // Create worksheet
    //         const sh1 = XLSX.utils.aoa_to_sheet([..._sheet1Header, ..._sheet1Data]);
            
    //         sh1['!cols'] = [ {wch:25}, {wch:20}, {wch:15}, {wch:15}, {wch:15}];
    //         sh1['!rows'] = Array(sheet1Header.length).fill({ hpx: 23 }); 
    //         //XLSX.utils.book_append_sheet(wb, sh1, "프로그램목록");
    //         // 프로그램 목록 끝 


    //         // 운영현황
    //         // 운영현황 탭 
    //         const sheet2Result = sheet2.map(obj => Object.values(obj))
    //         const _sheet2Header = sheet2Header.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
    //         const _sheet2Data = sheet2Result.map(values => values.map(value => ({ v: value|| "", t: 's', s: defaultStyle })));
    //         // Create worksheet
    //         const sh2 = XLSX.utils.aoa_to_sheet([..._sheet2Header, ..._sheet2Data]);
    //         sh2['!cols'] =   [ {wch:8}, {wch:10}, {wch:7}, {wch:7}, {wch:15}, {wch:25}, {wch:20}, {wch:15}, {wch:15}, {wch:17}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:11}, {wch:11}, {wch:11}, {wch:13}, {wch:13}, {wch:11}, {wch:13} ];
    //         sh2['!rows'] = Array(sheet2Header.length).fill({ hpx: 23 }); 
    //         XLSX.utils.book_append_sheet(wb, sh2, "운영현황");
    //         // 운영현황 끝 

    //         // 프로그램현황
    //         const sheet3Result = sheet3.map(obj => Object.values(obj))
    //         const _sheet3Header = sheet3Header.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
    //         const _sheet3Data = sheet3Result.map(values => values.map(value => ({ v: value|| "", t: 's', s: defaultStyle })));
    //         // Create worksheet
    //         const sh3 = XLSX.utils.aoa_to_sheet([..._sheet3Header, ..._sheet3Data]);
    //         sh3['!cols'] =   [ {wch:8}, {wch:8}, {wch:8}, {wch:8}, {wch:30}, {wch:20}, {wch:20}, {wch:20}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10} ];
    //         sh3['!rows'] = Array(sheet3Header.length).fill({ hpx: 23 }); 
    //         XLSX.utils.book_append_sheet(wb, sh3, "프로그램현황");
    //         // 프로그램현황


    //         // 강사현황
    //         const sheet4Result = sheet4.map(obj => Object.values(obj))
    //         const _sheet4Header = sheet4Header.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
    //         const _sheet4Data = sheet4Result.map(values => values.map(value => ({ v: value|| "", t: 's', s: defaultStyle })));
            
    //         // Create worksheet
    //         const sh4 = XLSX.utils.aoa_to_sheet([..._sheet4Header, ..._sheet4Data]);
    //         sh4['!cols'] =   [ {wch:7}, {wch:10}, {wch:25}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:13}, {wch:18}, {wch:18}];
    //         sh4['!rows'] = Array(sheet4Header.length).fill({ hpx: 23 }); 
    //         XLSX.utils.book_append_sheet(wb, sh4, "강사현황");
    //         // 강사현황


            
    //         // // 월실적
    //         // // 월실적
    //         // const sheet3Result = sheet3.map(obj => Object.values(obj))
    //         // const _sheet3Header = sheet3Header.map(item => item.map( i => ({v : i, t : 's', s : headerStyle})) )
    //         // const _sheet3Data = sheet3Result.map(values => values.map(value => ({ v: value|| "", t: 's', s: defaultStyle })));
    //         // // Create worksheet
    //         // const sh3 = XLSX.utils.aoa_to_sheet([..._sheet2Header, ..._sheet2Data]);
    //         // sh3['!cols'] =   [ {wch:8}, {wch:10}, {wch:7}, {wch:7}, {wch:15}, {wch:15}, {wch:25}, {wch:10}, {wch:15}, {wch:15}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:11}, {wch:11}, {wch:11}, {wch:13}, {wch:13}, {wch:11}, {wch:13} ];
    //         // sh3['!rows'] = Array(sheet1Header.length).fill({ hpx: 23 }); 
    //         // XLSX.utils.book_append_sheet(wb, sh3, "운영현황");
    //         // // 운영현황 끝 



    //         XLSX.writeFile(wb, `통계서비스_${todayInfo}.xlsx`);


    //     })
    // }













    // const onTest = ()=>{
    //     callApi("/test/test", {data : "kim990119"}).then((r)=>{
    //         console.log(r)

    //     });
    // }














    return (
        <>
            <Chip
                sx={{
                    height: '48px',
                    alignItems: 'center',
                    borderRadius: '27px',
                    transition: 'all .2s ease-in-out',
                    borderColor: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.light,
                    '&[aria-controls="menu-list-grow"], &:hover': {
                        borderColor: theme.palette.primary.main,
                        background: `${theme.palette.primary.main}!important`,
                        color: theme.palette.primary.light,
                        '& svg': {
                            stroke: theme.palette.primary.light
                        }
                    },
                    '& .MuiChip-label': {
                        lineHeight: 0
                    }
                }}
                label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />}
                variant="outlined"
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                color="primary"
            />
            <Popper
                placement="bottom-end"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 14]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                        <Box sx={{ p: 2 }}>
                                            <List component="nav" sx={{ width: '100%', maxWidth: 350, minWidth: 300, backgroundColor: theme.palette.background.paper, borderRadius: '10px', [theme.breakpoints.down('md')]: { minWidth: '100%' }, '& .MuiListItemButton-root': { mt: 0.5 } }} >
                                                {/* <ListItemButton sx={{ borderRadius: `${customization.borderRadius}px` }}  onClick={onTest} >
                                                    <ListItemIcon>
                                                        <IconBookDownload stroke={1.5} size="1.3rem" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2">테스트</Typography>} />
                                                </ListItemButton> */}
                                                {/* <ListItemButton sx={{ borderRadius: `${customization.borderRadius}px` }}  onClick={onDownLoad} >
                                                    <ListItemIcon>
                                                        <IconBookDownload stroke={1.5} size="1.3rem" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2">엑셀데이터(삭제예정)</Typography>} />
                                                </ListItemButton> */}
                                                <ListItemButton sx={{ borderRadius: `${customization.borderRadius}px` }}  onClick={handleLogout} >
                                                    <ListItemIcon>
                                                        <IconLogout stroke={1.5} size="1.3rem" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                                                </ListItemButton>
                                            </List>
                                        </Box>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </>
    );
};

export default ProfileSection;
