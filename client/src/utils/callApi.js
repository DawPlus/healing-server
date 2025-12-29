import axios from 'axios';
import Swal from 'sweetalert2';
import { store } from 'store';
import { actions } from 'store/reducers/commonReducer';

// 백엔드 API 서버 URL - 프로덕션에서는 같은 도메인 사용
const baseUrl = process.env.REACT_APP_BASE_URL || '';
const API_BASE_URL = baseUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');
console.log('API Base URL:', API_BASE_URL); // 디버깅을 위해 콘솔에 출력

export const client = axios.create({
  method : "post",
  baseURL: `${API_BASE_URL}/api`, // 명시적인 문자열 결합
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  // request 시작전에 store의 isLoading 값을 true로 변경
  store.dispatch(actions.startLoading());
  console.log('API Request to:', config.baseURL + config.url); // 요청 URL 로깅
  return config;
});

client.interceptors.response.use(
  (response) => {
    store.dispatch(actions.finishLoading());
    // 응답 데이터에서 invalidateSession 값을 체크
    if (response.data.invalidateSession) {
      // Check if request is from room management or other new_menus endpoints
      const isMenuManagementUrl = response.config.url && (
        response.config.url.includes('/new_menus/getRooms') ||
        response.config.url.includes('/new_menus/addRoom') ||
        response.config.url.includes('/new_menus/updateRoom') ||
        response.config.url.includes('/new_menus/deleteRoom')
      );

      if (isMenuManagementUrl) {
        // For room management, just return empty data instead of redirecting
        console.error('Session invalidated for menu management, returning empty data');
        return { 
          ...response, 
          data: response.config.url.includes('getRooms') ? [] : { success: false, error: 'Session error' } 
        };
      }
      
      // For other routes, show the session expired message and redirect
      Swal.fire({
        icon: 'warning',
        title: '세션 종료',
        text: "세션이 종료되었습니다. 다시 로그인해주세요.",
      }).then(() => {
        // "/login" 페이지로 이동
        window.location.href = '/login';
      });
      
      // 에러를 발생시켜 후속 요청 중단
      return Promise.reject(new Error('세션이 종료되었습니다. 다시 로그인해주세요.'));
    }
    return response;
  },

  (error) => {
    store.dispatch(actions.finishLoading());
    Swal.fire({
      icon: 'error',
      title: '에러',
      text: "오류가 발생했습니다 관리자에게 문의해 주세요 ",
    });
    return Promise.reject(error);
  }
);

export const callApi = (url, data) => {  
  return client.request({
    url, 
    data
  });
};

export default callApi;


