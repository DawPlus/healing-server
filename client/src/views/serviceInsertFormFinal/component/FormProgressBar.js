import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Badge, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

// 스타일이 적용된 프로그레스 바 컨테이너
const FormProgressBarContainer = styled(Box)(({ theme, isfixed }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  backgroundColor: isfixed 
    ? 'rgba(236, 245, 255, 0.95)' // 은은한 파스텔 블루 (fixed 상태일 때)
    : 'rgba(246, 249, 252, 0.8)', // 더 밝은 색상 (일반 상태)
  borderRadius: isfixed ? 0 : theme.shape.borderRadius,
  boxShadow: isfixed 
    ? '0px 2px 8px rgba(0, 0, 0, 0.08)' 
    : '0px 1px 3px rgba(0, 0, 0, 0.05)',
  padding: '12px 0 8px',
  zIndex: 1000,
  position: isfixed ? 'fixed' : 'static',
  top: isfixed ? window.HEADER_HEIGHT || 64 : 'auto', // 헤더 높이 동적으로 적용
  left: isfixed ? 0 : 'auto',
  right: isfixed ? 0 : 'auto',
  transition: 'all 0.3s ease',
  borderBottom: isfixed ? '1px solid rgba(187, 208, 231, 0.4)' : 'none',
  backdropFilter: isfixed ? 'blur(5px)' : 'none', // 블러 효과 추가
}));

// 버튼 컨테이너
const ButtonsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  padding: '8px 16px 4px',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(241, 241, 241, 0.5)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(136, 136, 136, 0.5)',
    borderRadius: '4px',
  },
});

// 프로그레스 버튼
const ProgressButton = styled(Button)(({ theme, active }) => ({
  minWidth: '120px',
  margin: '0 8px',
  backgroundColor: active 
    ? theme.palette.primary.main 
    : 'rgba(243, 246, 249, 0.9)',
  color: active 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  fontWeight: active ? 'bold' : 'normal',
  border: active 
    ? `2px solid ${theme.palette.primary.dark}` 
    : '1px solid rgba(207, 220, 235, 0.7)',
  '&:hover': {
    backgroundColor: active 
      ? theme.palette.primary.dark 
      : 'rgba(226, 235, 245, 0.9)',
  },
  boxShadow: active 
    ? '0 2px 4px rgba(25, 118, 210, 0.2)' 
    : '0 1px 2px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  borderRadius: '25px', // 더 둥근 버튼
  textTransform: 'none', // 대문자 변환 방지
  padding: '6px 16px',
}));

// 진행 중인 섹션 정보를 표시하는 레이블
const ActiveSectionLabel = styled(Typography)({
  textAlign: 'center',
  padding: '6px 0 2px',
  fontWeight: 'bold',
  color: '#3f51b5', // 더 눈에 띄는 색상
  fontSize: '0.9rem',
  letterSpacing: '0.3px',
});

// 완료된 섹션 배지
const ProgressBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    right: -3,
    top: -3,
    border: '2px solid white', // 흰색 테두리 추가
  },
}));

// 스페이서 - 프로그레스 바가 fixed 상태일 때 공간 확보용
const Spacer = styled(Box)(({ theme, visible }) => ({
  height: visible ? (window.PROGRESS_BAR_HEIGHT || 65) : 0, // 프로그레스 바 높이 + 패딩
  transition: 'height 0.3s ease',
}));

const FormProgressBar = ({ forms, activeFormId, onFormSelect }) => {
  const [isFixed, setIsFixed] = useState(false);
  const [completedForms, setCompletedForms] = useState({});
  
  // 헤더 높이 계산 함수
  const calculateHeaderHeight = useCallback(() => {
    // 헤더 요소를 선택합니다 - 적절한 선택자로 변경할 수 있습니다
    const headerElement = document.querySelector('.MuiAppBar-root') || document.querySelector('header');
    
    if (headerElement) {
      const headerHeight = headerElement.offsetHeight;
      window.HEADER_HEIGHT = headerHeight;
      return headerHeight;
    }
    
    // 기본값 반환
    window.HEADER_HEIGHT = 64;
    return 64;
  }, []);

  // 프로그레스 바 높이 계산 함수
  const calculateProgressBarHeight = useCallback(() => {
    const progressBarElement = document.getElementById('form-progress-bar-container');
    
    if (progressBarElement) {
      const progressBarHeight = progressBarElement.offsetHeight;
      window.PROGRESS_BAR_HEIGHT = progressBarHeight;
      return progressBarHeight;
    }
    
    // 기본값 반환
    window.PROGRESS_BAR_HEIGHT = 65;
    return 65;
  }, []);

  // 스크롤 이벤트 핸들러 - 프로그레스 바를 상단에 고정시키는 기능
  const handleScroll = useCallback(() => {
    const progressBarElement = document.getElementById('form-progress-bar-container');
    
    if (!progressBarElement) return;
    
    const progressBarPosition = progressBarElement.getBoundingClientRect().top;
    const headerHeight = window.HEADER_HEIGHT || calculateHeaderHeight();
    const shouldBeFixed = progressBarPosition <= headerHeight;
    
    setIsFixed(shouldBeFixed);
    
    // 현재 스크롤 위치에 따라 현재 활성화된 섹션을 감지합니다
    if (forms && forms.length > 0) {
      const scrollPosition = window.scrollY + headerHeight + (window.PROGRESS_BAR_HEIGHT || 65) + 20; // 헤더, 프로그레스바 높이, 여백 20px 고려
      
      // 각 폼 요소의 위치를 검사합니다
      let currentActiveForm = null;
      let minDistance = Infinity;
      
      forms.forEach(form => {
        const formElement = document.getElementById(`form-${form.id}`);
        if (formElement) {
          const formPosition = formElement.getBoundingClientRect().top + window.scrollY;
          const formHeight = formElement.offsetHeight;
          
          // 현재 스크롤 위치가 폼 영역 내에 있는지 확인
          if (scrollPosition >= formPosition && scrollPosition <= formPosition + formHeight) {
            currentActiveForm = form.id;
            // 발견하면 루프 중단을 위해 forEach 대신 for 사용도 가능
          } else {
            // 가장 가까운 폼 찾기 (스크롤이 모든 폼 사이에 있지 않을 경우)
            const distance = Math.abs(formPosition - scrollPosition);
            if (distance < minDistance) {
              minDistance = distance;
              currentActiveForm = form.id;
            }
          }
        }
      });
      
      // 활성화된 폼이 변경되었을 때만 상태 업데이트
      if (currentActiveForm && currentActiveForm !== activeFormId) {
        onFormSelect(currentActiveForm);
      }
    }
  }, [forms, activeFormId, onFormSelect, calculateHeaderHeight]);

  // 쓰로틀링 함수
  const throttle = (callback, delay) => {
    let lastCall = 0;
    return function(...args) {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return callback(...args);
    };
  };
  
  // 초기화 및 스크롤 이벤트 리스너 등록
  useEffect(() => {
    // 초기 헤더 높이 계산
    calculateHeaderHeight();
    
    // 컴포넌트가 마운트된 후 약간의 지연 시간을 두고 프로그레스 바 높이 계산
    setTimeout(() => {
      calculateProgressBarHeight();
    }, 100);
    
    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledHandleScroll);
    
    // 초기 스크롤 위치에 따른 활성 폼 설정
    throttledHandleScroll();
    
    // 리사이즈 이벤트 처리
    const handleResize = () => {
      calculateHeaderHeight();
      calculateProgressBarHeight();
      throttledHandleScroll();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, calculateHeaderHeight, calculateProgressBarHeight]);
  
  // 양식 선택 및 스크롤 처리
  const handleFormClick = (formId) => {
    onFormSelect(formId);
    
    // 해당 양식 요소로 스크롤
    const formElement = document.getElementById(`form-${formId}`);
    if (formElement) {
      const headerHeight = window.HEADER_HEIGHT || calculateHeaderHeight();
      const progressBarHeight = window.PROGRESS_BAR_HEIGHT || calculateProgressBarHeight();
      const yOffset = -(headerHeight + progressBarHeight + 10); // 헤더와 프로그레스 바 높이, 여백 10px을 고려한 오프셋
      const y = formElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
    
    // 해당 양식 완료 상태로 표시
    setCompletedForms(prev => ({
      ...prev,
      [formId]: true
    }));
  };
  
  return (
    <>
      <Spacer visible={isFixed} />
      <FormProgressBarContainer id="form-progress-bar-container" isfixed={isFixed ? 1 : 0}>
        <ButtonsContainer>
          {forms.map((form) => (
            <ProgressButton
              key={form.id}
              active={activeFormId === form.id ? 1 : 0}
              onClick={() => handleFormClick(form.id)}
            >
              {completedForms[form.id] ? (
                <ProgressBadge
                  badgeContent={<CheckIcon fontSize="small" />}
                >
                  {form.label}
                </ProgressBadge>
              ) : (
                form.label
              )}
            </ProgressButton>
          ))}
        </ButtonsContainer>
        {activeFormId && (
          <ActiveSectionLabel variant="subtitle1">
            현재 작성 중: {forms.find(f => f.id === activeFormId)?.label}
          </ActiveSectionLabel>
        )}
      </FormProgressBarContainer>
    </>
  );
};

export default FormProgressBar; 