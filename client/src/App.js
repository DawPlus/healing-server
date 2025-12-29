import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { useLocation, useNavigate } from "react-router";
// routing
import Routes from 'routes';
// defaultTheme
import themes from 'themes';
// project imports
import NavigationScroll from 'layout/NavigationScroll';
import { actions } from "store/reducers/commonReducer";
import Loading from"ui-component/Lodings"
import { checkLoginStatus } from "utils/authApi";

const noAuthURL = [
  '/login',
  '/register'
]

const App = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = useSelector(s=> s.common.isLoading);
  const isLogin = useSelector(s=> s.common.isLogin);
  const userInfo = useSelector(s=> s.common.userInfo);


  useEffect(() => {
    const checkAuth = async () => {
      // 로그인 페이지에서 이미 로그인된 경우 리다이렉트
      if (location.pathname === '/login' && isLogin && userInfo) {
        console.log('이미 로그인됨 - 로그인 페이지에서 리다이렉트');
        navigate("/new/page0");
        return;
      }

      if (noAuthURL.includes(location.pathname)) {
        return;
      }

      // Redux에 이미 로그인 상태가 있으면 네트워크 체크 건너뛰기
      // (로그인 직후 네트워크 체크가 실패할 수 있는 타이밍 이슈 방지)
      if (isLogin && userInfo) {
        console.log('이미 로그인 상태 - 네트워크 체크 건너뛰기');
        return;
      }

      try {
        const response = await checkLoginStatus();

        if (response.isLogin) {
          dispatch(actions.setValue({ key: "isLogin", value: response.isLogin }));
          
          if (response.userInfo) {
            console.log('로그인 확인으로 사용자 정보 저장:', response.userInfo);
            dispatch(actions.setValue({ key: "userInfo", value: response.userInfo }));
            
            const userId = response.userInfo.id || response.userInfo.user_id;
            if (userId) {
              localStorage.setItem('userId', userId);
              localStorage.setItem('userName', response.userInfo.user_name);
              
              const currentPath = location.pathname;
              sessionStorage.setItem('initialPath', currentPath);
              console.log('초기 경로에 활동 로그 기록:', currentPath);
            }
          }

          const previousPath = localStorage.getItem("previousPath");

          if (previousPath && previousPath !== location.pathname) {
            navigate(previousPath);
          } else if (location.pathname === '/login' || location.pathname === '/') {
            navigate("/new/page0");
          }
        } else {
          // 로그인 페이지가 아닐 때만 리다이렉트
          if (location.pathname !== '/login') {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error('Login check error:', error);
        // 로그인 페이지가 아닐 때만 리다이렉트
        if (location.pathname !== '/login') {
          navigate("/login");
        }
      }
    };

    checkAuth();
  }, [dispatch, location.pathname, navigate, isLogin, userInfo]);

  useEffect(() => {
    const previousPath = localStorage.getItem("previousPath");
    if (previousPath !== location.pathname) {
      localStorage.setItem("previousPath", location.pathname);
    }
  }, [location.pathname]);

  const customization = useSelector((state) => state.customization);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
            {isLoading && <Loading/>}
            <Routes />
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
