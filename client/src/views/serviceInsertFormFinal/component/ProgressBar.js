import React, { useState, useEffect, useCallback } from 'react';
import { Box, ButtonGroup, Button, Tooltip, Typography, useMediaQuery, Badge } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// 스타일링된 프로그레스 버튼
const ProgressButton = styled(Button)(({ theme, active }) => ({
  borderRadius: '4px',
  transition: 'all 0.3s ease',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.primary.light,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.primary.main,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3]
  },
  padding: '8px 10px',
  minWidth: '65px',
  fontWeight: active ? 'bold' : 'normal',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    padding: '4px 6px',
    minWidth: '40px'
  }
}));

// 활성 버튼에 표시할 배지
const ProgressBadge = styled(Badge)(({ theme, active }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: active ? theme.palette.secondary.main : 'transparent',
    color: active ? theme.palette.secondary.contrastText : 'transparent',
    transition: 'all 0.3s ease',
    transform: active ? 'scale(1)' : 'scale(0.5)',
    right: -3,
    top: 3,
  },
}));

// 프로그레스 바 컨테이너
const ProgressBarContainer = styled(Box)(({ theme, isfixed }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '15px 0',
  backgroundColor: '#fff',
  zIndex: 1000,
  position: isfixed ? 'fixed' : 'static',
  top: isfixed ? 0 : 'auto',
  left: 0,
  boxShadow: isfixed ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
  transition: 'all 0.3s ease',
  borderBottom: isfixed ? `1px solid ${theme.palette.divider}` : 'none',
}));

// 섹션 레이블 컴포넌트
const SectionLabel = styled(Typography)(({ theme }) => ({
  margin: '8px 0',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  }
}));

const ProgressBar = ({ sections }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 스크롤 이벤트 핸들러 - useCallback으로 최적화
  const handleScroll = useCallback(() => {
    // 프로그레스 바가 상단에 도달했는지 확인
    const progressBarContainer = document.getElementById('progress-bar-container');
    if (!progressBarContainer) return;
    
    const progressBarPosition = progressBarContainer.offsetTop;
    const scrollPosition = window.scrollY;
    
    // 프로그레스 바를 고정할지 여부 결정
    setIsFixed(scrollPosition > progressBarPosition);
    
    // 현재 보이는 섹션 확인
    const sectionElements = sections.map(section => 
      document.getElementById(section.id)
    ).filter(Boolean); // null 필터링
    
    if (sectionElements.length === 0) return;
    
    // 현재 화면에 보이는 섹션 찾기
    let foundActiveSection = false;
    
    for (let i = sectionElements.length - 1; i >= 0; i--) {
      const element = sectionElements[i];
      
      const rect = element.getBoundingClientRect();
      // 요소가 화면에 보이는지 확인 (상단이 화면 내에 있거나 바로 위에 있음)
      if (rect.top <= 150) {
        setActiveSection(i);
        foundActiveSection = true;
        break;
      }
    }
    
    // 모든 섹션이 화면 아래에 있으면 첫 번째 섹션을 활성화
    if (!foundActiveSection && sectionElements.length > 0) {
      setActiveSection(0);
    }
  }, [sections]);

  // throttle 함수 구현
  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  useEffect(() => {
    // 스크롤 이벤트에 throttle 적용
    const throttledScrollHandler = throttle(handleScroll, 100);
    
    window.addEventListener('scroll', throttledScrollHandler);
    
    // 초기 로드 시 한 번 실행 (약간 지연시켜 DOM 로드 후 실행되도록)
    const timer = setTimeout(() => {
      handleScroll();
    }, 300);
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      clearTimeout(timer);
    };
  }, [handleScroll]);

  const scrollToSection = (index) => {
    const sectionElement = document.getElementById(sections[index].id);
    if (sectionElement) {
      // 스크롤 위치를 섹션 상단에서 약간 아래로 조정
      const headerOffset = 120; // 프로그레스 바와 약간의 여백을 고려
      const elementPosition = sectionElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // 바로 활성 섹션 업데이트 (스크롤 이벤트 기다리지 않고)
      setActiveSection(index);
      
      // 섹션에 포커스를 추가하여 키보드 접근성 향상
      sectionElement.focus();
    }
  };

  // 프로그레스 바의 여백을 위한 div
  const spacerHeight = isFixed ? (isMobile ? '90px' : '100px') : '0px';

  return (
    <>
      <div style={{ height: spacerHeight }} id="progress-bar-spacer"></div>
      <ProgressBarContainer id="progress-bar-container" isfixed={isFixed ? 1 : 0}>
        <ButtonGroup variant="contained" aria-label="form progress">
          {sections.map((section, index) => (
            <Tooltip key={section.id} title={section.label} arrow placement="top">
              <ProgressBadge
                badgeContent="✓"
                color="secondary"
                active={activeSection === index ? 1 : 0}
              >
                <ProgressButton
                  active={activeSection === index ? 1 : 0}
                  onClick={() => scrollToSection(index)}
                  aria-label={`이동: ${section.label}`}
                  data-section-id={section.id}
                >
                  {index + 1}
                </ProgressButton>
              </ProgressBadge>
            </Tooltip>
          ))}
        </ButtonGroup>
        
        {/* 현재 섹션 레이블 표시 */}
        <SectionLabel variant="body1">
          {activeSection >= 0 && activeSection < sections.length 
            ? sections[activeSection].label 
            : ''}
        </SectionLabel>
      </ProgressBarContainer>
    </>
  );
};

export default ProgressBar; 