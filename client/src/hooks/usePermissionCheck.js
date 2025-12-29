import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const usePermissionCheck = (requiredPermissions = []) => {
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.common.userInfo);

  useEffect(() => {
    console.log('=== usePermissionCheck ===');
    console.log('userInfo:', userInfo);
    console.log('현재 경로:', window.location.pathname);
    
    if (!userInfo) {
      console.log('사용자 정보가 없음 - 로그인 페이지로 이동');
      navigate('/login');
      return;
    }

    const userRole = userInfo.role;
    console.log('사용자 권한:', userRole);
    
    // 권한 정규화 (소문자로 변환, 공백 제거)
    const normalizedRole = userRole ? userRole.toString().toLowerCase().trim() : '';
    
    // 권한별 제한 페이지 정의
    const restrictions = {
      employee: [
        '/userActivity',
        '/new/menus/employee-management'
      ],
      viewer: [
        '/userActivity',
        '/new/menus/employee-management',
        '/new/page0'
      ]
    };

    // 현재 페이지 경로 확인
    const currentPath = window.location.pathname;
    
    // 사용자 권한에 따른 접근 제한 체크
    if (restrictions[normalizedRole]) {
      const restrictedPaths = restrictions[normalizedRole];
      
      // 현재 경로가 제한된 경로인지 확인
      const isRestricted = restrictedPaths.some(restrictedPath => 
        currentPath === restrictedPath || currentPath.startsWith(restrictedPath)
      );
      
      if (isRestricted) {
        console.log('접근 제한된 페이지 - 리다이렉트');
        alert(`접근 권한이 없습니다. (현재 권한: ${getRoleDisplayText(userRole)})`);
        navigate('/new/page5/calendar');
        return;
      }
    }

    // 추가 권한 요구사항이 있는 경우 체크
    if (requiredPermissions.length > 0) {
      const normalizedRequiredPermissions = requiredPermissions.map(perm => perm.toLowerCase().trim());
      const hasPermission = normalizedRequiredPermissions.includes(normalizedRole) || normalizedRole === 'admin';
      
      if (!hasPermission) {
        console.log('권한 부족으로 접근 거부');
        alert(`이 페이지에 접근하려면 다음 권한이 필요합니다: ${requiredPermissions.join(', ')}`);
        navigate('/new/page5/calendar');
        return;
      }
    }
    
    console.log('권한 체크 통과!');
  }, [userInfo, navigate, requiredPermissions]);

  // 권한 표시 텍스트 변환
  const getRoleDisplayText = (role) => {
    switch(role) {
      case 'admin':
        return '관리자';
      case 'employee':
        return '직원';
      case 'viewer':
        return '열람자';
      case 'pending':
        return '승인대기';
      default:
        return role;
    }
  };

  return {
    userInfo,
    userRole: userInfo?.role,
    hasAccess: true
  };
};

export default usePermissionCheck; 