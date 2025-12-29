import React  from "react";
import { Link } from 'react-router-dom';
// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Stack, Typography, useMediaQuery } from '@mui/material';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import AuthLogin from './AuthLogin';
import logo from "assets/images/healing.jpg"

const Login = () => {
    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));



    return (
        <AuthWrapper1>
            <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems="center" justifyContent="center">
                                    <Grid item sx={{ mb: 3 }}>
                                        <Link to="#">
                                            <img src={logo} style={{width : "200px"}} alt="logo"/>
                                        </Link>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center" >
                                            <Grid item>
                                                <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                    <Typography color={theme.palette.primary.main} gutterBottom variant={matchDownSM ? 'h3' : 'h2'} >
                                                        하이힐링원 운영시스템
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <AuthLogin />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid item container direction="column" alignItems="center" xs={12}>
                                            <Typography variant="subtitle1" sx={{ textDecoration: 'none' }} >
                                                Copyright 2023. (재)산림힐링재단
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </AuthCardWrapper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </AuthWrapper1>
    );
};

export default Login;
