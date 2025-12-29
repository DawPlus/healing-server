import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid, IconButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import logo from "assets/images/healing.jpg"
import Lottie from "lottie-react";
import animationData from 'ui-component/lottie/404Error.json';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const lottieStyle = { width: '300px', outline: 'none', backgroundColor: 'transparent', }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.main}), url("https://www.transparenttextures.com/patterns/45-degree-fabric-light.png")`,
        backgroundBlendMode: 'overlay',
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          sx={{
            padding: theme.spacing(6),
            textAlign: 'center',
          }} 
          elevation={5}
        >
          <img 
            src={logo} 
            alt="하이힐링원" 
            style={{ 
              width: "250px", 
              marginBottom: theme.spacing(2) 
            }}
          />
          <Typography 
            variant="h3" 
            color="primary" 
            sx={{ marginBottom: theme.spacing(2) }}
          >  
            <div style={lottieStyle}>
              <Lottie animationData={animationData} loop={true} />
            </div>
          </Typography>
          <Typography 
            variant="h5" 
            color="textSecondary" 
            sx={{ marginBottom: theme.spacing(4) }}
          >
            페이지를 찾을 수 없습니다.
          </Typography>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item>
              <IconButton color="primary" onClick={() => navigate('/')}>
                <HomeIcon fontSize="large" />
              </IconButton>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={() => navigate('/main')}>
                홈페이지로 돌아가기
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
