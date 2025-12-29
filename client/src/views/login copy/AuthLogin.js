import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Checkbox, Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, Typography, } from '@mui/material';


import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {actions} from "store/reducers/commonReducer";
import {useNavigate } from 'react-router';
import {client} from "utils/callApi";

const FirebaseLogin = () => {
    
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [id , setId] = useState("");
    const [password , setPassword] = useState("");

    // Remember me 
    const [checked, setChecked] = useState(false);
    // 패스워드 보임여부
    const [showPassword, setShowPassword] = useState(false);
    // 패스워드 보여주기
    const handleClickShowPassword = () => setShowPassword(!showPassword); 
    const handleMouseDownPassword = (event) => event.preventDefault(); 
    // Component Did Mount 
    useEffect(() => {
        const rememberedId = localStorage.getItem('rememberedId');
        const rememberedPassword = localStorage.getItem('rememberedPassword');
        if (rememberedId && rememberedPassword) {
            setId(rememberedId);
            setPassword(rememberedPassword);
            setChecked(true);
        }
    }, []);

    // 로그인 버튼 클릭 
    const onLogin = () => {     
        client({ url : "/login", method : "POST", withCredentials : true, data : {id, password} })
        .then(r => {


        if (checked) {
            localStorage.setItem('rememberedId', id);
            localStorage.setItem('rememberedPassword', password);
        } else {
            localStorage.removeItem('rememberedId');
            localStorage.removeItem('rememberedPassword');
        }
    

        if(!r.data.isLogin){
            alert(r.data.message);
            return; 
        }
        dispatch(actions.setValue({ key : "isLogin", value : r.data.isLogin }));
        navigate("/main");
        })
    }
    // 회원가입 
    const onSignIn =()=>{     
        navigate("/register")
    }

    return (
        <>
            <Grid container direction="column" justifyContent="center" spacing={2}>
                <Grid item xs={12} container alignItems="center" justifyContent="center">
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">인증된 사용자만 이용가능한 서비스 입니다.2</Typography>                        
                    </Box>
                </Grid>
            </Grid>
            <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                <InputLabel htmlFor="outlined-adornment-id-login">ID</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-id-login"
                    type="id"
                    value={id}
                    name="id"
                    onBlur={()=>{}}
                    onChange={(e)=>setId(e.target.value)}
                    label="ID"
                />
            </FormControl>

                <FormControl fullWidth sx={{ ...theme.typography.customInput }} >
                    <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password-login"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            name="password"
                            onBlur={()=>{}}
                            onChange={(e)=>setPassword(e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                        size="large"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                        </FormControl>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked}
                                        onChange={(event) => setChecked(event.target.checked)}
                                        name="checked"
                                        color="primary"
                                    />
                                }
                                label="Remember me"
                            />
                        </Stack>
                        <Box sx={{ mt: 2 }}>
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={onLogin}
                                >
                                    Login
                                </Button>
                            </AnimateButton>
                        </Box>
                        <Divider style={{marginTop : "9px"}}/>
                        <Box sx={{ mt: 1 }}>
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={onSignIn}
                                >
                                    사용자 등록
                                </Button>
                            </AnimateButton>
                        </Box>
        </>
    );
};

export default FirebaseLogin;
