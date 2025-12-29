import { useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography, } from '@mui/material';

import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {useNavigate } from 'react-router';
// ===========================|| FIREBASE - REGISTER ||=========================== //

import { alert } from "ui-component/Alert";
import axios from 'axios';
const FirebaseRegister = () => {
    
    const theme = useTheme();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
   
    // 로그인 페이지로 돌아가기 
    const goBackLogin = () =>{
        navigate("/login");
    }

    const onSignIn = (e)=>{
        e.preventDefault();    
        const trimmedId = id.trim();
        const trimmedName = name.trim();
        const trimmedPassword = password.trim();
        const trimmedConfirmPassword = confirmPassword.trim();
      
        if (!trimmedId) {
          alert("ID를 입력하세요.");
          return;
        }
      
        if (!trimmedName) {
          alert("이름을 입력하세요.");
          return;
        }
      
        if (!trimmedPassword) {
          alert("비밀번호를 입력하세요.");
          return;
        }
      
        if (!trimmedConfirmPassword) {
          alert("비밀번호 확인을 입력하세요.");
          return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
        return;
        }
        if (!/(?=.*[!@#$%^&*])(?=.*[a-zA-Z])(?=.*[0-9]).{8,}/.test(password)) {
            alert(
                "비밀번호는 8자리 이상이며, 영문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다."
            );
            return;
        }

        axios.post("/api/register", {
            id, 
            name, 
            password
        }).then(r=> {
            if(r.data?.result){
                alert("사용자 등록이 완료 되었습니다.  관리자 승인후 사용가능합니다. ");
                navigate("/login")
            }
        }).catch(e=>  alert("오류가 발생하였습니다. 관리자에게 문의하세요"));


    }


    return (
        <>
            <Grid container direction="column" justifyContent="center" spacing={2}>
                
                <Grid item xs={12} container alignItems="center" justifyContent="center">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">관리자 승인 후 사용하실수 있습니다. </Typography>
                    </Box>
                </Grid>
            </Grid>     
            
            <FormControl fullWidth  sx={{ ...theme.typography.customInput }}>
                <InputLabel htmlFor="outlined-adornment-id-register">사용자 ID</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-id-register"
                    type="id"
                    value={id}
                    name="id"
                    onBlur={()=>{}}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(
                          e.nativeEvent.data || ""
                        );
                        if (isKorean) {
                            alert("ID는 한글을 입력할 수 없습니다.")
                        } 
                        setId(value);
                      }}
                />
            </FormControl>

            <FormControl fullWidth  sx={{ ...theme.typography.customInput }}>
                <InputLabel htmlFor="outlined-adornment-name-register">사용자명</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-name-register"
                    type="name"
                    value={name}
                    name="name"                    
                    onChange={e=> setName(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth sx={{ ...theme.typography.customInput }} >
                <InputLabel htmlFor="outlined-adornment-password-register">비밀번호</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password-register"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    name="password"
                    label="Password"
                    onChange={e=> setPassword(e.target.value)}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" size="large" >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                    inputProps={{}}
                />
            </FormControl>
            <FormControl fullWidth sx={{ ...theme.typography.customInput }} >
                <InputLabel htmlFor="outlined-adornment-password-register">비밀번호 확인</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-password-register"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    name="confirmPassword"
                    label="Password"
                     onChange={e=> setConfirmPassword(e.target.value)}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" size="large" >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>

            <Box sx={{ mt: 2 }}>
                <AnimateButton>
                    <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary" onClick={onSignIn}> 
                        사용자 등록 
                    </Button>
                </AnimateButton>
            </Box>
            <Box sx={{ mt: 2 }}>
                <AnimateButton>
                    <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary" onClick={goBackLogin} >
                        Login 돌아가기
                    </Button>
                </AnimateButton>
            </Box>
        </>
    );
};

export default FirebaseRegister;
