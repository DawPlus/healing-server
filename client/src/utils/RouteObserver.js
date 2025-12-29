import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import activityLogger from './activityLogger';
import { MENU_OPEN } from 'store/actions';
import menuItems from 'menu-items';

// 라우트와 페이지 제목 매핑
const routeTitles = {
  '/programList': '운영결과 보고검색',
  '/yearMonthResult': '운영통계검색',
  '/userTemp': '프로그램참가자입력',
  '/serviceInsertFormFinal': '만족도및 효과평가 입력',
  '/sae/agencyList': '단체별 만족도 및 효과평가',
  '/sae/searchResult': '주제어별 만족도 및 효과평가',
  '/excelDownload': '엑셀데이터',
  '/new/menus/program-management': '프로그램 관리',
  '/new/menus/location-management': '장소 관리',
  '/new/menus/instructors': '강사 관리',
  '/new/menus/assistant-instructors': '보조강사 관리',
  '/new/menus/helpers': '힐링헬퍼 관리',
  '/new/menus/rooms': '객실 관리',
  '/new/menus/meal-cost': '식사비용 관리',
  '/new/menus/employee-management': '직원계정 관리',
  '/userActivity': '사용자 이용기록',
  // 신규 기능 라우트
  '/new/page0': '신규예약',
  '/new/page1': '신규기능-1',
  '/new/page2': '신규기능-2',
  '/new/page3': '신규기능-3',
  '/new/page4': '신규기능-4',
  '/new/page5': '예약현황',
  '/new/page6': '예약정보',
  '/new/page7': '신규기능-7',
  '/new/page8': '신규기능-8',
  '/new/pageFinal': '만족도 조사'
};

// Helper function to find parent menu IDs for a given path
const findParentMenuIds = (pathname) => {
  const parentIds = [];
  
  // Helper function to traverse menu tree
  const findInItems = (items, parentId = null) => {
    for (const item of items) {
      if (item.url === pathname || (item.url && pathname.startsWith(item.url + '/'))) {
        if (parentId) {
          parentIds.push(parentId);
        }
        parentIds.push(item.id);
        return true;
      }
      
      // Check if pathname includes the item ID (for dynamic routes)
      if (pathname.split('/').includes(item.id)) {
        if (parentId) {
          parentIds.push(parentId);
        }
        parentIds.push(item.id);
        return true;
      }
      
      // Recursively check children
      if (item.children && findInItems(item.children, item.id)) {
        return true;
      }
    }
    return false;
  };
  
  findInItems(menuItems.items);
  return parentIds;
};

/**
 * 라우트 변경을 감지하고 활동 로깅하는 컴포넌트
 */
const RouteObserver = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  // 사용자 정보를 Redux store에서 가져오기
  const userInfo = useSelector(state => state.common.userInfo) || {};
  const isLogin = useSelector(state => state.common.isLogin);
  
  useEffect(() => {
    // 이미 방문한 경로인지 확인 (중복 로깅 방지)
    const lastPath = sessionStorage.getItem('lastLoggedPath');
    const currentPath = location.pathname;
    
    // Open parent menus for current route
    const parentMenuIds = findParentMenuIds(currentPath);
    if (parentMenuIds.length > 0) {
      parentMenuIds.forEach(id => {
        dispatch({ type: MENU_OPEN, id });
      });
    }
    
    if (lastPath === currentPath) {
      // 이미 로깅된 경로면 스킵
      console.log('이미 로깅된 경로입니다:', currentPath);
      return;
    }
    
    console.log('RouteObserver 활성화 - 현재 경로:', location.pathname);
    console.log('Redux 상태 - 로그인 상태:', isLogin, '사용자 정보:', userInfo);
    
    // localStorage에서 직접 사용자 정보 가져오기 (fallback)
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    console.log('localStorage 사용자 정보:', { 
      userId: storedUserId, 
      userName: storedUserName 
    });
    
    // 로그인 상태가 아니면 활동 로깅 안함
    if (!isLogin) {
      console.log('사용자가 로그인하지 않아 페이지 접근 로깅을 건너뜁니다.');
      return;
    }
    
    // ID 확인 - Redux 상태의 ID가 있으면 사용, 없으면 localStorage에서 가져옴
    let userId = userInfo?.id;
    let userName = userInfo?.user_name;
    
    // Redux에 정보가 없으면 localStorage에서 가져오기
    if (!userId && storedUserId) {
      console.log('Redux에 사용자 ID가 없어 localStorage의 ID를 사용합니다.');
      userId = parseInt(storedUserId, 10);
      userName = storedUserName || '사용자';
    }
    
    if (!userId) {
      console.log('유효한 사용자 ID가 없어 페이지 접근 로깅을 건너뜁니다.');
      return;
    }
    
    // 현재 경로에 해당하는 제목 찾기
    const routePath = Object.keys(routeTitles).find(
      route => location.pathname === route || location.pathname.startsWith(`${route}/`)
    );
    
    if (routePath) {
      const pageTitle = routeTitles[routePath];
      console.log('페이지 접근 로깅:', pageTitle, '사용자:', userId, userName);
      
      // 방문한 경로 저장 (중복 로깅 방지)
      sessionStorage.setItem('lastLoggedPath', currentPath);
      
      // 페이지 조회 액션 로깅
      activityLogger.logView(
        pageTitle, 
        null, 
        `페이지 접근: ${pageTitle}`,
        userId,
        userName
      );
    }
  }, [location.pathname, isLogin, userInfo, dispatch]);
  
  // 시각적 요소 없음
  return null;
};

export default RouteObserver; 