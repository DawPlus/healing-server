import React, { useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * 모든 값을 문자열로 안전하게 변환하는 헬퍼 함수
 * GraphQL 뮤테이션에서 발생하는 타입 오류를 방지
 */
const toSafeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

/**
 * 객체의 모든 값을 문자열로 변환하는 함수
 */
const convertAllValuesToString = (obj) => {
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
 * FormDataAdapter - HOC that adapts original form components to work with participant data
 * 
 * This component wraps any form component and adds the ability to process participants
 * and formData props, automatically updating the component's internal state accordingly.
 * 
 * @param {React.Component} WrappedComponent The original form component to wrap
 * @returns {React.Component} Enhanced component with participant data handling
 */
const FormDataAdapter = (WrappedComponent) => {
  // Create class name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // 직접 컴포넌트 이름 확인 (debugging)
  console.log(`[FormDataAdapter] 래핑 컴포넌트 정보:`, {
    displayName, 
    wrappedDisplayName: WrappedComponent.displayName || 'Unknown',
    isNameHealing: displayName === "HealingComponent" || displayName.includes('Healing'),
    isWrappedNameHealing: WrappedComponent.displayName === "HealingComponent"
  });
  
  // 컴포넌트 이름 확인 - 힐링서비스 특별 처리를 위함
  const isHealingComponent = 
    displayName === "HealingComponent" || 
    displayName.includes('Healing') ||
    WrappedComponent.displayName === "HealingComponent" ||
    WrappedComponent.name === "Healing";
  
  // 디버깅을 위한 로그
  console.log(`[FormDataAdapter] 컴포넌트 초기화: ${displayName}, 힐링서비스 여부: ${isHealingComponent ? 'true' : 'false'}`);

  // Create the enhanced component
  const EnhancedComponent = (props) => {
    const { participants, formData, searchInfo, forwardedRef, ...otherProps } = props;
    const componentRef = useRef(null);
    const [initializedParticipantIds, setInitializedParticipantIds] = useState("");  // 쉼표로 구분된 ID 문자열
    const [isProcessing, setIsProcessing] = useState(false);
    
    // 컴포넌트 참조 세팅용 콜백 함수 - 힐링서비스 전용 처리 포함
    const handleComponentRef = useCallback((ref) => {
      if (!ref) {
        console.log(`[FormDataAdapter] 빈 ref 수신됨: ${displayName}`);
        return;
      }
      
      // 힐링서비스 컴포넌트 특별 처리
      if (isHealingComponent) {
        console.log("[FormDataAdapter] 힐링서비스 컴포넌트 ref 수신됨", {
          refType: typeof ref,
          hasCurrentProp: ref.current !== undefined,
          refKeys: Object.keys(ref),
          refMethods: Object.getOwnPropertyNames(ref).filter(key => typeof ref[key] === 'function')
        });
      }
      
      componentRef.current = ref;
      
      // forwardedRef가 있으면 전달하되, onChangeSearchInfo 메서드도 포함
      if (forwardedRef) {
        const enhancedRef = {
          ...ref,
          // 원본 컴포넌트의 onChangeSearchInfo 메서드를 직접 노출
          onChangeSearchInfo: ref.onChangeSearchInfo,
          // 다른 필요한 메서드들도 노출
          setSearchInfo: ref.setSearchInfo,
          rows: ref.rows,
          setRows: ref.setRows || ref.setRowsData,
          // 기관 정보를 업데이트하는 메서드 추가
          updateOrganizationInfo: (orgInfo) => {
            console.log(`[FormDataAdapter-${displayName}] updateOrganizationInfo 호출됨:`, orgInfo);
            
            if (ref.onChangeSearchInfo && typeof ref.onChangeSearchInfo === 'function') {
              try {
                // 기관명 업데이트
                if (orgInfo.agency !== undefined) {
                  ref.onChangeSearchInfo('agency', orgInfo.agency);
                  console.log(`[FormDataAdapter-${displayName}] agency 업데이트: ${orgInfo.agency}`);
                }
                
                // 기관 ID 업데이트
                if (orgInfo.agency_id !== undefined) {
                  ref.onChangeSearchInfo('agency_id', orgInfo.agency_id);
                  console.log(`[FormDataAdapter-${displayName}] agency_id 업데이트: ${orgInfo.agency_id}`);
                }
                
                // 시작일자 업데이트
                if (orgInfo.openday !== undefined) {
                  ref.onChangeSearchInfo('openday', orgInfo.openday);
                  console.log(`[FormDataAdapter-${displayName}] openday 업데이트: ${orgInfo.openday}`);
                }
                
                console.log(`[FormDataAdapter-${displayName}] 기관 정보 업데이트 완료`);
              } catch (error) {
                console.error(`[FormDataAdapter-${displayName}] 기관 정보 업데이트 중 오류:`, error);
              }
            } else {
              console.warn(`[FormDataAdapter-${displayName}] onChangeSearchInfo 메서드가 없음`);
            }
          }
        };
        
        if (typeof forwardedRef === 'function') {
          forwardedRef(enhancedRef);
        } else if (forwardedRef.current !== undefined) {
          // ref 객체의 current에 enhancedRef 할당
          Object.assign(forwardedRef, { current: enhancedRef });
        }
      }
    }, [forwardedRef, isHealingComponent, displayName]);
    
    // 참가자 정보로 컴포넌트 행 업데이트
    const updateComponentRows = useCallback((participants) => {
      console.log(`[FormDataAdapter-${displayName}] updateComponentRows 호출됨: 참가자 수 ${participants?.length || 0}`);

      if (!participants || participants.length === 0) {
        console.log(`[FormDataAdapter-${displayName}] 참가자 데이터 없음, 처리 중단`);
        return false;
      }

      if (!componentRef.current) {
        console.log(`[FormDataAdapter-${displayName}] 컴포넌트 참조 없음, 처리 중단`);
        return false;
      }
      
      // 디버깅 정보 출력 - 참가자 데이터 샘플
      if (participants.length > 0) {
        const participantSample = participants[0];
        console.log(`[FormDataAdapter-${displayName}] 참가자 정보 샘플:`, {
          id: participantSample.id,
          name: participantSample.personal.name,
          sex: participantSample.personal.sex,
          age: participantSample.personal.age
        });
      }
        
        // insertFormRef를 통한 처리 시도
      const hasInsertFormRef = componentRef.current._insertFormRef && 
                              componentRef.current._insertFormRef.current;
      
      console.log(`[FormDataAdapter-${displayName}] insertFormRef 존재 여부:`, hasInsertFormRef);
      
        if (hasInsertFormRef) {
          try {
            // 참가자 정보 변환
            const newRows = participants.map(participant => ({
              idx: participant.id,
              id: "",
              chk: false,
              // 대문자 필드
              NAME: participant.personal.name || "",
              SEX: participant.personal.sex || "미기재",
              AGE: participant.personal.age || "",
              RESIDENCE: participant.personal.residence || "미기재",
              JOB: participant.personal.job || "미기재",
              PARTICIPATION_PERIOD: participant.personal.participationPeriod || "",
              // 소문자 필드 
              name: participant.personal.name || "",
              sex: participant.personal.sex || "미기재",
              age: participant.personal.age || "",
              residence: participant.personal.residence || "미기재",
              job: participant.personal.job || "미기재",
              participationPeriod: participant.personal.participationPeriod || "",
              past_stress_experience: "1"
            }));
            
            // insertFormRef의 setRows 호출
          console.log(`[FormDataAdapter-${displayName}] insertFormRef.current.setRows 직접 호출: ${newRows.length}개 행`);
            
            componentRef.current._insertFormRef.current.setRows(newRows);
          console.log(`[FormDataAdapter-${displayName}] insertFormRef.current.setRows 호출 성공`);
            return true;
          } catch (error) {
          console.error(`[FormDataAdapter-${displayName}] insertFormRef 처리 중 오류:`, error);
        }
      }
      
      // 기존 행 확인
      const existingRows = componentRef.current.rows || [];
      console.log(`[FormDataAdapter-${displayName}] 기존 행 수:`, existingRows.length);
      
      // 변경 필요 없음 검사
      if (existingRows.length > 0 && 
          participants.length > 0 && 
          existingRows.length === participants.length && 
          existingRows[0].idx === participants[0].id) {
        console.log(`[FormDataAdapter-${displayName}] 데이터 변경 필요 없음 - 동일한 참가자 데이터`);
        return true;
      }
      
      // 새 행 데이터 생성
      console.log(`[FormDataAdapter-${displayName}] 새 행 데이터 생성 시작`);
      const newRows = participants.map((participant, index) => {
        // 기본 필드
        const row = {
          idx: participant.id,
          id: "",
          chk: false,
          
          // 대문자 필드 (일괄적용 호환성)
          NAME: participant.personal.name || "",
          SEX: participant.personal.sex || "미기재",
          AGE: participant.personal.age || "",
          RESIDENCE: participant.personal.residence || "미기재",
          JOB: participant.personal.job || "미기재",
          PARTICIPATION_PERIOD: participant.personal.participationPeriod || "",
          
          // 소문자 필드 (힐링서비스 호환성)
          name: participant.personal.name || "",
          sex: participant.personal.sex || "미기재",
          age: participant.personal.age || "",
          residence: participant.personal.residence || "미기재",
          job: participant.personal.job || "미기재",
          participationPeriod: participant.personal.participationPeriod || "",
          
          // 특수 필드
          past_stress_experience: "1"
        };
        
        console.log(`[FormDataAdapter-${displayName}] 행 ${index} 생성: idx=${row.idx}, name=${row.name}`);
        
        // 문자열 변환
        return convertAllValuesToString(row);
      });
      
      // 행 업데이트 시도 - 다양한 방법으로 시도
      try {
        // 방법 1: setRows 함수 사용
        if (componentRef.current.setRows && typeof componentRef.current.setRows === 'function') {
          console.log(`[FormDataAdapter-${displayName}] setRows 메서드 호출 시도: ${newRows.length}개 행`);
          componentRef.current.setRows(newRows);
          console.log(`[FormDataAdapter-${displayName}] setRows 메서드 호출 성공`);
          return true;
        }
        
        // 방법 2: 직접 rows 속성 설정 (비권장이지만 마지막 수단)
        else if ('rows' in componentRef.current) {
          console.log(`[FormDataAdapter-${displayName}] rows 속성 직접 설정 시도: ${newRows.length}개 행`);
          componentRef.current.rows = newRows;
          console.log(`[FormDataAdapter-${displayName}] rows 속성 직접 설정 성공`);
          return true;
        }
        
        // 방법 3: setState 사용 (클래스 컴포넌트용)
        else if (componentRef.current.setState && typeof componentRef.current.setState === 'function') {
          console.log(`[FormDataAdapter-${displayName}] setState 호출 시도: ${newRows.length}개 행`);
          componentRef.current.setState({ rows: newRows });
          console.log(`[FormDataAdapter-${displayName}] setState 호출 성공`);
          return true;
        }
        
        // 업데이트 방법을 찾지 못함
        console.log(`[FormDataAdapter-${displayName}] 업데이트 방법을 찾지 못함 - 적절한 메서드 없음`);
        return false;
      } catch (error) {
        console.error(`[FormDataAdapter-${displayName}] 행 업데이트 오류:`, error);
        return false;
      }
    }, [displayName, WrappedComponent.displayName, WrappedComponent.name]);
    
    // 참가자 및 폼 데이터 변경 시 컴포넌트 업데이트
    useEffect(() => {
      // 참가자 정보가 있고, 아직 처리되지 않은 경우에만 처리
      if (participants && participants.length > 0) {
        // 이미 초기화된 참가자 ID 목록을 확인
        const currentParticipantIds = participants.map(p => p.id).join(',');
        
        // 이미 동일한 참가자들로 초기화되었는지 확인
        if (initializedParticipantIds === currentParticipantIds) {
          console.log(`[FormDataAdapter] 이미 동일한 참가자 ID로 초기화됨: ${currentParticipantIds}`);
          return;
        }
        
        console.log(`[FormDataAdapter] 참가자 정보로 컴포넌트 업데이트 시도: ${displayName}`);
        const success = updateComponentRows(participants);
        
        // 성공적으로 업데이트된 경우에만 initializedParticipantIds 설정
        if (success) {
          setInitializedParticipantIds(currentParticipantIds);
          console.log(`[FormDataAdapter] 컴포넌트 업데이트 완료: ${displayName}`);
        } else {
          console.log(`[FormDataAdapter] 컴포넌트 업데이트 실패: ${displayName}`);
        }
      }
    }, [participants, updateComponentRows, displayName]);

    // 검색 정보의 모든 값을 문자열로 변환
    const safeSearchInfo = searchInfo ? convertAllValuesToString({
      ...(searchInfo || {}),
      agency: searchInfo?.agency || "",
      agency_id: searchInfo?.agency_id || null,
      openday: searchInfo?.openday || "",
      eval_date: searchInfo?.eval_date || "",
      ptcprogram: searchInfo?.ptcprogram || ""
    }) : {};

    // 초기 행의 모든 값을 문자열로 변환
    const safeInitialRows = participants?.map((participant, index) => {
      const existingData = formData && formData[index] ? formData[index] : {};
      return convertAllValuesToString({
        idx: participant.id || uuidv4(),
        id: existingData.id || "",
        chk: false,
        NAME: participant.personal.name || "",
        SEX: participant.personal.sex || "미기재",
        AGE: participant.personal.age || "",
        // Add any other fields needed
        ...existingData
      });
    });

    // Render the original component with forwarded refs
    const enhancedProps = {
      ...otherProps,
      searchInfo: safeSearchInfo,
      participants: participants || [],
      formData: formData || [],
      // Override initial rows if the component expects it
      initialRows: safeInitialRows,
      // Special prop to let the component know it's being wrapped
      isWrappedByAdapter: true
    };

    return (
      <WrappedComponent 
        ref={handleComponentRef}
        {...enhancedProps}
      />
    );
  };
  
  // Set display name for debugging
  EnhancedComponent.displayName = `FormDataAdapter(${displayName})`;
  
  // 최종 컴포넌트에서 ref를 전달받아 EnhancedComponent에 넘겨줌
  return React.forwardRef((props, ref) => {
    // 디버깅 로그 추가
    console.log(`[FormDataAdapter] forwardRef 호출: ${displayName}`, ref ? "(ref 있음)" : "(ref 없음)");
    
    // 힐링 컴포넌트 식별
    const isHealingComponent = 
      displayName === "HealingComponent" || 
      displayName.includes('Healing') ||
      WrappedComponent.displayName === "HealingComponent";
    
    if (isHealingComponent) {
      console.log(`[FormDataAdapter] 힐링 컴포넌트(${displayName}) 감지됨 - 특별 ref 처리 적용`);
    }
    
    // 기본 props 
    const allProps = { ...props };
    
    // 일관성 있게 항상 forwardedRef 전달
    return <EnhancedComponent {...allProps} forwardedRef={ref} />;
  });
};

export default FormDataAdapter; 