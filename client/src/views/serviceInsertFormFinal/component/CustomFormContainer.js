import React, { useState, useEffect, cloneElement, useRef, forwardRef } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';

/**
 * 모든 값을 문자열로 안전하게 변환하는 헬퍼 함수
 */
const toSafeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

/**
 * 객체의 모든 값을 문자열로 변환하는 함수
 */
const convertAllValuesToString = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  Object.keys(obj).forEach(key => {
    // idx나 id와 같은 특수 필드는 원래 형식 유지
    if (key === 'idx' || key === 'chk') {
      result[key] = obj[key];
    } else {
      result[key] = toSafeString(obj[key]);
    }
  });
  return result;
};

/**
 * CustomFormContainer - 원본 서비스 폼 컴포넌트를 감싸는 컨테이너 컴포넌트
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 원본 폼 컴포넌트
 * @param {string} props.title - 폼 제목
 * @param {string} props.formId - 폼의 고유 ID
 * @param {boolean} props.isActive - 현재 활성화된 폼인지 여부
 * @param {Array} props.participants - 참가자 정보 배열
 * @param {Array} props.formData - 현재 폼의 데이터 배열
 * @param {React.Ref} ref - 상위 컴포넌트에서 전달된 ref
 */
const CustomFormContainer = forwardRef(({ children, title, formId, isActive, participants, formData }, ref) => {
  const [isDataApplied, setIsDataApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const childRef = useRef(null);
  const [childrenMounted, setChildrenMounted] = useState(false);
  const [applicationAttempts, setApplicationAttempts] = useState(0);

  console.log(`[CustomFormContainer-${formId}] 컴포넌트 렌더링`);

  // 컴포넌트가 마운트되면 childrenMounted를 true로 설정
  useEffect(() => {
    if (children) {
      setChildrenMounted(true);
    }
  }, [children]);

  // 상위 ref와 내부 childRef 연결
  useEffect(() => {
    if (ref) {
      // 함수형 ref인 경우
      if (typeof ref === 'function') {
        ref(childRef.current);
      } 
      // 객체 ref인 경우
      else if (ref.current !== undefined) {
        ref.current = childRef.current;
      }
    }
  }, [ref, childRef.current]);

  // participants나 formData가 변경될 때마다 테이블 데이터 적용 상태 업데이트
  useEffect(() => {
    if (participants && participants.length > 0 && formData && formData.length > 0 && childrenMounted) {
      setLoading(true);
      
      // 데이터 적용 시도 카운터 증가
      setApplicationAttempts(prev => prev + 1);
      
      const timer = setTimeout(() => {
        setIsDataApplied(true);
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [participants, formData, childrenMounted]);

  // Custom event handlers to listen for formdata updates
  useEffect(() => {
    const handleFormDataUpdate = (event) => {
      console.log(`[CustomFormContainer-${formId}] 범용 이벤트 수신:`, event.detail.formId);
      
      // Only process the event if it's for this form
      if (event.detail.formId === formId) {
        console.log(`[CustomFormContainer-${formId}] 범용 이벤트 처리 중: 참가자 수 ${event.detail.participants?.length}`);
        applyParticipantData(event.detail.participants);
      }
    };
    
    const handleSpecificFormDataUpdate = (event) => {
      console.log(`[CustomFormContainer-${formId}] 특정 폼 이벤트 수신: 참가자 수 ${event.detail.participants?.length}`);
      applyParticipantData(event.detail.participants);
    };
    
    // Listen for both generic and specific events
    window.addEventListener('formdata-update', handleFormDataUpdate);
    window.addEventListener(`formdata-update-${formId}`, handleSpecificFormDataUpdate);
    
    return () => {
      window.removeEventListener('formdata-update', handleFormDataUpdate);
      window.removeEventListener(`formdata-update-${formId}`, handleSpecificFormDataUpdate);
    };
  }, [formId, childRef]);
  
  // Function to apply participant data to the child component
  const applyParticipantData = (participants) => {
    if (!childRef.current || !participants || participants.length === 0) {
      console.log(`[CustomFormContainer-${formId}] 참가자 데이터 적용 실패: 컴포넌트 또는 데이터 없음`);
      return;
    }
    
    console.log(`[CustomFormContainer-${formId}] 참가자 데이터 적용 시작: ${participants.length}명`);
    
    // Try to update using updateComponentRows
    if (childRef.current.updateComponentRows) {
      console.log(`[CustomFormContainer-${formId}] updateComponentRows 메서드 사용`);
      const success = childRef.current.updateComponentRows(participants);
      
      if (success) {
        console.log(`[CustomFormContainer-${formId}] updateComponentRows 성공`);
        setIsDataApplied(true);
        return;
      }
    }
    
    // If updateComponentRows failed or doesn't exist, try setRows
    if (childRef.current.setRows) {
      try {
        console.log(`[CustomFormContainer-${formId}] setRows 메서드 사용`);
        
        // Create a minimal row structure with participant data
        const rows = participants.map(participant => ({
          id: participant.id,
          idx: participant.id,
          // 이름 정보 (대소문자 모두 포함)
          name: participant.personal.name,
          NAME: participant.personal.name,
          // 성별 정보
          sex: participant.personal.sex || '미기재',
          SEX: participant.personal.sex || '미기재',
          // 나이 정보
          age: participant.personal.age,
          AGE: participant.personal.age,
          // 지역 정보
          residence: participant.personal.residence || '미기재',
          RESIDENCE: participant.personal.residence || '미기재',
          // 직업 정보
          job: participant.personal.job || '미기재',
          JOB: participant.personal.job || '미기재',
          // 참여기간 유형
          participationPeriod: participant.personal.participationPeriod || '',
          PARTICIPATION_PERIOD: participant.personal.participationPeriod || ''
        }));
        
        childRef.current.setRows(rows);
        console.log(`[CustomFormContainer-${formId}] setRows 성공: ${rows.length}개 행 설정됨`);
        setIsDataApplied(true);
      } catch (error) {
        console.error(`[CustomFormContainer-${formId}] setRows 오류:`, error);
      }
    } else {
      console.log(`[CustomFormContainer-${formId}] 참가자 데이터 적용 실패: 컴포넌트에 적절한 메서드 없음`);
    }
  };
  
  // Apply participant data when it changes
  useEffect(() => {
    if (participants && participants.length > 0) {
      console.log(`[CustomFormContainer-${formId}] 참가자 데이터 변경 감지: ${participants.length}명`);
      applyParticipantData(participants);
    }
  }, [participants, formId, childRef]);

  // 원본 자식 컴포넌트에 props 추가
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // 전달할 props 준비 (모든 값을 문자열로 변환)
      const safeProps = {
        ref: childRef,
        participants: participants,
        formData: formData && formData.map(item => convertAllValuesToString(item)),
        searchInfo: child.props.searchInfo,
        initialRows: participants?.map(p => convertAllValuesToString({
          id: p.id,
          idx: p.id,
          NAME: p.personal.name,
          SEX: p.personal.sex,
          AGE: p.personal.age,
          RESIDENCE: p.personal.residence,
          JOB: p.personal.job,
          // 힐링서비스용 소문자 필드
          name: p.personal.name,
          sex: p.personal.sex,
          age: p.personal.age,
          residence: p.personal.residence,
          job: p.personal.job
        }))
      };
      
      return cloneElement(child, safeProps);
    }
    return child;
  });

  return (
    <Paper
      id={`form-${formId}`}
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderLeft: '5px solid',
        borderColor: isActive ? 'primary.main' : 'primary.light',
        boxShadow: isActive ? '0 0 10px rgba(0,0,0,0.2)' : '',
        transition: 'all 0.3s ease'
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: isActive ? 'primary.main' : 'primary.dark'
        }}
      >
        {title}
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isDataApplied && participants && participants.length > 0 ? (
            <Alert 
              severity="success" 
              sx={{ mt: 2, mb: 2 }}
            >
              {/* {participants.length}명의 참가자 정보가 이 탭에 적용되었습니다. */}
            </Alert>
          ) : (
            <></>
          )}
      
      <Box className="insertForm-container" sx={{ mt: 2 }}>
            {childrenWithProps}
      </Box>
        </>
      )}
    </Paper>
  );
});

// 명시적 displayName 설정
CustomFormContainer.displayName = 'CustomFormContainer';

export default CustomFormContainer; 