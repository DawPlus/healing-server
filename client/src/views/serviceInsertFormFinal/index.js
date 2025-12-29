import React, { useState, forwardRef } from "react";
import MainCard from 'ui-component/cards/MainCard';
import { useLocation } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import Swal from "sweetalert2";

// UI Components
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  FormHelperText,
  IconButton,
} from '@mui/material';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UnifiedIcon from '@mui/icons-material/SyncAlt';

// Enhanced Form components
import {
  Service,
  Program,
  Counsel,
  Prevent,
  Healing,
  Hrv,
  Vibra
} from "./component/EnhancedForms";

import PreventGambling from "./preventGambling 13-55-34-972";
import CustomFormContainer from "./component/CustomFormContainer";

// Get organizations query
const GET_ORGANIZATION_LIST = gql`
  query GetPage1List {
    getPage1List {
      id
      group_name
      start_date
      end_date
    }
  }
`;

const ServiceInsertForm = () => {
  // States
  const location = useLocation();
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [organizationInfo, setOrganizationInfo] = useState({
    agency: "",
    agency_id: null,
    openday: "",
    eval_date: new Date().toISOString().split('T')[0],
    ptcprogram: ""
  });
  const [participants, setParticipants] = useState([
    {
      id: uuidv4(),
      personal: {
        name: "",
        sex: "미기재",
        age: "",
        residence: "미기재",
        job: "미기재",
        participationPeriod: ""
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    organization: {},
    participants: []
  });
  const [activeFormId, setActiveFormId] = useState('service'); // 활성화된 설문지
  const [formData, setFormData] = useState({
    service: [],
    program: [],
    counsel: [],
    prevent: [],
    preventGambling: [],
    healing: [],
    hrv: [],
    vibra: []
  });
  
  // 각 폼 컴포넌트의 ref를 저장할 객체
  const formRefs = {
    service: React.useRef(null),
    program: React.useRef(null),
    counsel: React.useRef(null),
    prevent: React.useRef(null),
    preventGambling: React.useRef(null),
    healing: React.useRef(null),
    hrv: React.useRef(null),
    vibra: React.useRef(null)
  };

  // Queries
  const { data: organizationsData, loading: organizationsLoading } = useQuery(GET_ORGANIZATION_LIST);
  const organizations = organizationsData?.getPage1List || [];

  // Form types
  const formTypes = [
    { id: "service", label: "서비스환경 만족도", component: Service },
    { id: "program", label: "프로그램 만족도", component: Program },
    { id: "counsel", label: "상담&치유서비스 효과평가", component: Counsel },
    { id: "prevent", label: "예방효과(스마트폰)", component: Prevent },
    { id: "preventGambling", label: "예방효과(도박)", component: PreventGambling },
    { id: "healing", label: "힐링서비스 효과평가", component: Healing },
    { id: "hrv", label: "HRV 측정 검사", component: Hrv },
    { id: "vibra", label: "바이브라 측정 검사", component: Vibra }
  ];

  // Handle organization info change
  const handleOrganizationChange = (eventOrData) => {
    console.log('[Main] handleOrganizationChange 호출됨:', eventOrData);
    
    // 상담 탭에서 객체 형태로 전달되는 경우 처리
    if (eventOrData && typeof eventOrData === 'object' && !eventOrData.target) {
      console.log('[Main] 객체 형태 기관 정보 수신됨:', eventOrData);
      
      const newOrgInfo = {
        ...organizationInfo,
        agency: eventOrData.agency || organizationInfo.agency,
        agency_id: eventOrData.agency_id ? parseInt(eventOrData.agency_id, 10) : organizationInfo.agency_id,
        openday: eventOrData.openday || organizationInfo.openday,
        eval_date: eventOrData.eval_date || organizationInfo.eval_date
      };
      
      console.log('[Main] 객체에서 기관 정보 업데이트:', newOrgInfo);
      setOrganizationInfo(newOrgInfo);
      
      // 다른 탭들에도 전파
      propagateOrganizationInfoToOtherForms(newOrgInfo);
      return;
    }
    
    // 기존 event.target 형태 처리
    const { name, value } = eventOrData.target;
    
    console.log('[Main] event.target 형태 기관 정보 수신됨:', { name, value });
    
    if (name === "agency_id" && value) {
      const selectedOrg = organizations.find(org => org.id === parseInt(value));
      if (selectedOrg) {
        const newOrgInfo = {
          ...organizationInfo,
          agency_id: parseInt(selectedOrg.id, 10),
          agency: selectedOrg.group_name,
          openday: selectedOrg.start_date
        };
        
        console.log('[Main] 기관 선택으로 인한 전체 기관 정보 업데이트:', newOrgInfo);
        setOrganizationInfo(newOrgInfo);
        
        // 서비스 환경 만족도에서 기관선택이 변경되면 다른 탭들에도 전파
        propagateOrganizationInfoToOtherForms(newOrgInfo);
        return;
      }
    }
    
    const newOrgInfo = {
      ...organizationInfo,
      [name]: name === 'agency_id' ? parseInt(value, 10) : value
    };
    
    console.log('[Main] 개별 필드 업데이트:', { name, value, newOrgInfo });
    setOrganizationInfo(newOrgInfo);
    
    // 기관명이나 시작일자가 변경되면 다른 탭들에도 전파
    if (name === 'agency' || name === 'openday') {
      propagateOrganizationInfoToOtherForms(newOrgInfo);
    }
  };
  
  // 기관 정보를 다른 폼들에 전파하는 함수
  const propagateOrganizationInfoToOtherForms = (orgInfo) => {
    console.log('=== 기관 정보 전파 시작 ===');
    console.log('전파할 기관 정보:', orgInfo);
    
    // 서비스 환경 만족도를 제외한 나머지 7개 탭에 전파
    const targetForms = ['program', 'counsel', 'prevent', 'preventGambling', 'healing', 'hrv', 'vibra'];
    
    targetForms.forEach(formId => {
      const formRef = formRefs[formId];
      
      if (formRef && formRef.current) {
        try {
          console.log(`${formId} 폼에 기관 정보 전파 시도...`);
          
          // FormDataAdapter의 updateOrganizationInfo 메서드 사용
          if (typeof formRef.current.updateOrganizationInfo === 'function') {
            formRef.current.updateOrganizationInfo({
              agency: orgInfo.agency,
              agency_id: orgInfo.agency_id,
              openday: orgInfo.openday
            });
            console.log(`${formId} 폼에 updateOrganizationInfo로 기관 정보 전파 완료`);
          }
          // 기존 방법도 백업으로 유지
          else if (typeof formRef.current.onChangeSearchInfo === 'function') {
            // 기관명 업데이트
            if (orgInfo.agency) {
              formRef.current.onChangeSearchInfo('agency', orgInfo.agency);
            }
            // 기관 ID 업데이트
            if (orgInfo.agency_id) {
              formRef.current.onChangeSearchInfo('agency_id', orgInfo.agency_id);
            }
            // 시작일자 업데이트
            if (orgInfo.openday) {
              formRef.current.onChangeSearchInfo('openday', orgInfo.openday);
            }
            
            console.log(`${formId} 폼에 onChangeSearchInfo로 기관 정보 전파 완료`);
          } else {
            console.log(`${formId} 폼에 사용 가능한 업데이트 메서드가 없음`);
          }
          
          // 직접 searchInfo 상태 업데이트 시도 (백업 방법)
          if (formRef.current.setSearchInfo && typeof formRef.current.setSearchInfo === 'function') {
            formRef.current.setSearchInfo(prev => ({
              ...prev,
              agency: orgInfo.agency || prev.agency,
              agency_id: orgInfo.agency_id || prev.agency_id,
              openday: orgInfo.openday || prev.openday
            }));
            console.log(`${formId} 폼에 직접 searchInfo 업데이트 완료`);
          }
          
        } catch (error) {
          console.error(`${formId} 폼에 기관 정보 전파 중 오류:`, error);
        }
      } else {
        console.log(`${formId} 폼 ref가 아직 준비되지 않음`);
      }
    });
    
    console.log('=== 기관 정보 전파 완료 ===');
  };

  // Handle participant personal info change
  const handleParticipantPersonalChange = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].personal = {
      ...updatedParticipants[index].personal,
      [field]: value
    };
    setParticipants(updatedParticipants);
  };

  // Add new participant
  const addParticipant = () => {
    setParticipants([
      ...participants,
      {
        id: uuidv4(),
        personal: {
          name: "",
          sex: "미기재",
          age: "",
          residence: "미기재",
          job: "미기재",
          participationPeriod: ""
        }
      }
    ]);
    // 새 참가자를 추가하면 자동으로 해당 참가자를 선택
    setCurrentParticipantIndex(participants.length);
  };

  // Remove participant
  const removeParticipant = (index) => {
    if (participants.length > 1) {
      const newParticipants = participants.filter((_, i) => i !== index);
      setParticipants(newParticipants);
      if (currentParticipantIndex >= newParticipants.length) {
        setCurrentParticipantIndex(newParticipants.length - 1);
      }
    }
  };

  // Participant selection change handler
  const handleParticipantSelect = (index) => {
    setCurrentParticipantIndex(index);
  };

  // 선택된 설문지 변경 핸들러
  const handleFormSelect = (formId) => {
    setActiveFormId(formId);
  };

  // 입력사항 통일 함수 - 첫 번째 행의 정보(이름 제외)를 다른 모든 행에 적용
  const unifyInputs = () => {
    if (participants.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: '통일할 항목이 없습니다',
        text: '참가자가 2명 이상이어야 입력사항을 통일할 수 있습니다.',
      });
      return;
    }

    const firstParticipant = participants[0];
    if (!firstParticipant.personal.name) {
      Swal.fire({
        icon: 'warning',
        title: '첫 번째 참가자 정보 필요',
        text: '첫 번째 참가자의 이름을 입력해주세요.',
      });
      return;
    }

    // 첫 번째 참가자의 정보(이름 제외)를 다른 모든 참가자에게 적용
    const updatedParticipants = participants.map((participant, index) => {
      if (index === 0) {
        return participant; // 첫 번째 참가자는 그대로 유지
      }
      
      return {
        ...participant,
        personal: {
          ...participant.personal,
          name: participant.personal.name, // 이름은 유지
          sex: firstParticipant.personal.sex,
          age: firstParticipant.personal.age,
          residence: firstParticipant.personal.residence,
          job: firstParticipant.personal.job,
          participationPeriod: firstParticipant.personal.participationPeriod
        }
      };
    });

    setParticipants(updatedParticipants);
    
    Swal.fire({
      icon: 'success',
      title: '입력사항 통일 완료',
      text: `첫 번째 참가자의 정보(이름 제외)가 ${participants.length - 1}명의 참가자에게 적용되었습니다.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // 모든 폼에 참가자 정보 일괄 적용
  const applyToAllForms = () => {
    // 입력 검증
    const missingFields = [];
    
    console.log("===== 일괄적용 시작 =====");
    console.log("참가자 수:", participants.length);
    console.log("참가자 정보:", JSON.stringify(participants));
    
    // 참가자 정보 검증
    if (participants.length === 0) {
      missingFields.push('참가자 정보');
    } else {
      const hasEmptyParticipantName = participants.some(p => !p.personal.name);
      if (hasEmptyParticipantName) {
        missingFields.push('참가자 이름');
      }
    }
    
    // 에러 메시지 표시 (필요한 경우)
    if (missingFields.length > 0) {
      console.log("일괄적용 검증 실패:", missingFields.join(', '));
      Swal.fire({
        icon: 'warning',
        title: '입력 필요',
        text: `${missingFields.join(', ')}을(를) 입력해주세요.`,
      });
      return;
    }
    
    // 로딩 표시
    setLoading(true);
    console.log("일괄적용 검증 통과: 참가자 정보를 모든 폼에 적용합니다", participants.length);

    // 각 폼 유형별로 참가자 데이터 적용
    const updatedFormData = { ...formData };
    
    // 각 폼 유형에 대해 참가자 수만큼 데이터 생성 또는 업데이트
    formTypes.forEach(formType => {
      const formId = formType.id;
      console.log(`폼 처리 시작: ${formId}, 폼 설명: ${formType.desc}`); // Add logging for debugging
      
      // 현재 폼의 기존 데이터 가져오기 (없으면 빈 배열)
      let currentFormData = updatedFormData[formId] || [];
      
      // 기존 데이터를 참가자 수에 맞게 조정
      const participantCount = participants.length;
      
      console.log(`폼 ${formId}: 기존 데이터 ${currentFormData.length}개, 필요 데이터 ${participantCount}개`);
      
      if (currentFormData.length < participantCount) {
        // 부족한 항목 추가 (빈 객체로 초기화)
        const additionalItems = Array(participantCount - currentFormData.length).fill(null).map(() => ({}));
        currentFormData = [...currentFormData, ...additionalItems];
        console.log(`폼 ${formId}: ${additionalItems.length}개 항목 추가됨`);
      } else if (currentFormData.length > participantCount) {
        // 초과 항목 제거
        currentFormData = currentFormData.slice(0, participantCount);
        console.log(`폼 ${formId}: ${currentFormData.length - participantCount}개 항목 제거됨`);
      }
      
      // 각 참가자 데이터 업데이트
      updatedFormData[formId] = currentFormData.map((item, index) => {
        // Ensure index is valid for participants array
        if (index >= participants.length) {
          console.error(`참가자 인덱스 ${index}가 유효하지 않습니다.`);
          return item || {}; // Return existing item or empty object to prevent errors
        }
        
        const participant = participants[index];
        const participantPersonal = participant.personal;

        console.log(`폼 ${formId}: 참가자[${index}] ${participantPersonal.name} 데이터 처리 중`);

        // 1. 기본 필드 매핑 (모든 폼에 공통 적용)
        const baseData = {
          participantId: participant.id,
          participantName: participantPersonal.name,
          participantInfo: { ...participantPersonal },
          // 기본 개인 정보 필드 (소문자/대문자 포함)
          name: participantPersonal.name || '',
          NAME: participantPersonal.name || '',
          sex: participantPersonal.sex || '미기재',
          SEX: participantPersonal.sex || '미기재',
          age: participantPersonal.age || '',
          AGE: participantPersonal.age || '',
          residence: participantPersonal.residence || '미기재',
          RESIDENCE: participantPersonal.residence || '미기재',
          job: participantPersonal.job || '미기재',
          JOB: participantPersonal.job || '미기재',
          // 참여기간 유형
          participationPeriod: participantPersonal.participationPeriod || '',
          PARTICIPATION_PERIOD: participantPersonal.participationPeriod || '',
          // 스트레스 경험 필드 (소문자/대문자 포함)
          past_stress_experience: '1',
          PAST_STRESS_EXPERIENCE: '1',
          // 기관 정보
          agency: organizationInfo.agency || '',
          agency_id: organizationInfo.agency_id || null,
          openday: organizationInfo.openday || '',
          eval_date: organizationInfo.eval_date || new Date().toISOString().split('T')[0],
          ptcprogram: organizationInfo.ptcprogram || '',
          // 기본 관리 필드 (기존 값 유지 시도)
          idx: item?.idx || participant.id, // Preserve existing idx or use participant id
          chk: typeof item?.chk === 'boolean' ? item.chk : false // Preserve existing boolean chk or default to false
        };
        
        // 2. 폼별 특수 필드 처리 (기존 값 유지 또는 기본값 설정)
        let specificData = {};
        if (formId === 'healing') {
          // Note: original code used past_stress_experience for both fields below
          specificData.past_stress_experience = item?.past_stress_experience || '미기재'; 
          specificData.past_experience = item?.past_experience || '미기재'; // Use item's past_experience if exists
          // 점수 필드 유지 (1-22)
          for (let i = 1; i <= 22; i++) {
            const scoreKey = `score${i}`;
            specificData[scoreKey] = item?.[scoreKey] || ''; // Preserve existing score or default to empty string
          }
          console.log(`힐링서비스 참가자 ${index + 1} 데이터 업데이트 준비:`, { name: baseData.name, idx: baseData.idx });
        } else if (formId === 'counsel') {
          specificData.past_experience = item?.past_experience || '미기재';
          // 점수 필드 유지 (1-62)
          for (let i = 1; i <= 62; i++) {
            const scoreKey = `score${i}`;
            specificData[scoreKey] = item?.[scoreKey] || ''; // Preserve existing score or default to empty string
          }
          console.log(`상담&치유서비스 참가자 ${index + 1} 데이터 업데이트 준비:`, { name: baseData.name, idx: baseData.idx });
        } else if (formId === 'prevent') {
          specificData.past_stress_experience = item?.past_stress_experience || '1'; // 무: 1 (기본값)
          specificData.PAST_STRESS_EXPERIENCE = item?.PAST_STRESS_EXPERIENCE || '1'; // 무: 1 (기본값)
          specificData.PARTICIPATION_PERIOD = item?.PARTICIPATION_PERIOD || ''; // 참여기간 유형
          // 예방효과(스마트폰) 점수 필드 유지 (1-22)
          for (let i = 1; i <= 22; i++) {
            const scoreKey = `score${i}`;
            specificData[scoreKey] = item?.[scoreKey] || '';
          }
          console.log(`예방효과(스마트폰) 참가자 ${index + 1} 데이터 업데이트 준비:`, { name: baseData.name, idx: baseData.idx });
        } else if (formId === 'preventGambling') {
          specificData.past_stress_experience = item?.past_stress_experience || '1'; // 무: 1 (기본값)
          specificData.PAST_STRESS_EXPERIENCE = item?.PAST_STRESS_EXPERIENCE || '1'; // 무: 1 (기본값)
          specificData.PARTICIPATION_PERIOD = item?.PARTICIPATION_PERIOD || ''; // 참여기간 유형
          // 예방효과(도박) 점수 필드 유지 (1-14)
          for (let i = 1; i <= 14; i++) {
            const scoreKey = `SCORE${i}`;  // 대문자 SCORE 사용
            specificData[scoreKey] = item?.[scoreKey] || '';
          }
          console.log(`예방효과(도박) 참가자 ${index + 1} 데이터 업데이트 준비:`, { name: baseData.name, idx: baseData.idx });
        }
        // Add similar 'else if' blocks here for 'hrv', 'vibra' if they have 
        // specific fields that need preserving or special default values during this update.
        // If they only need the baseData, no specific block is required.

        // 3. 최종 데이터 객체 생성: 기존 item 데이터 + 특수 데이터 + 기본 데이터
        // 순서가 중요: baseData가 마지막이므로, 기본 정보 필드는 항상 최신 참가자 정보로 덮어쓰게 됨.
        // item에만 있고 specificData나 baseData에 없는 필드는 유지됨.
        const mergedData = {
          ...(item || {}),   // Start with existing item data (or empty object if item is null/undefined)
          ...specificData,  // Add/overwrite with specific form data logic results
          ...baseData       // Add/overwrite with the latest base participant/org data
        };

        // Ensure essential fields 'idx' and 'chk' are definitely set if somehow missing after merge
        if (!mergedData.hasOwnProperty('idx')) {
           mergedData.idx = participant.id;
           console.warn(`idx was missing for form ${formId}, participant ${index}. Setting to participant.id.`);
        }
        if (typeof mergedData.chk !== 'boolean') {
           mergedData.chk = false;
           console.warn(`chk was missing or not boolean for form ${formId}, participant ${index}. Setting to false.`);
        }
        
        return mergedData;
      });
      
      // 이벤트 트리거 - 각 폼에 데이터 변경을 알림
      console.log(`폼 ${formId}: 폼 업데이트 이벤트 발생`);
      
      // 특정 폼에 대한 이벤트 발생
      const formEvent = new CustomEvent(`formdata-update-${formId}`, { 
        detail: { 
          participants,
          formData: updatedFormData[formId]
        } 
      });
      
      window.dispatchEvent(formEvent);
      
      // 추가적으로 범용 이벤트도 발생 (모든 폼이 들을 수 있음)
      const genericEvent = new CustomEvent('formdata-update', { 
        detail: { 
          formId,
          participants,
          formData: updatedFormData[formId]
        } 
      });
      
      window.dispatchEvent(genericEvent);
    });
    
    // formData 상태 업데이트
    console.log("모든 폼 데이터 업데이트 완료, 상태 반영:");
    Object.keys(updatedFormData).forEach(formId => {
      console.log(`- ${formId}: ${updatedFormData[formId]?.length || 0}개 항목`);
    });
    
    setFormData(updatedFormData);
    
    // 알림 및 로딩 상태 해제 
    setTimeout(() => {
      setLoading(false);
      
      // 성공 알림
      Swal.fire({
        icon: 'success',
        title: '적용 완료',
        text: `${participants.length}명의 참가자 정보가 모든 설문지에 적용되었습니다.`,
        timer: 2000,
        showConfirmButton: false
      });
      
      console.log("===== 일괄적용 완료 =====");
    }, 800);
  };

  // 힐링서비스 상단 메뉴
  const HealingFormContainer = forwardRef(({ children, ...props }, ref) => {
    console.log("HealingFormContainer 렌더링", props.participants?.length, ref ? "(ref 전달됨)" : "(ref 없음)");
    return (
      <CustomFormContainer {...props} ref={ref}>
        {children}
      </CustomFormContainer>
    );
  });
  // 명시적 displayName 설정
  HealingFormContainer.displayName = 'HealingFormContainer';

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3">만족도 및 효과평가 입력</Typography>
       
      </Box>

      {/* 참가자 정보 섹션 - 항상 펼쳐져 있음 */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 4,
          bgcolor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>참가자 정보</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="info"
              startIcon={<SaveIcon />}
              onClick={applyToAllForms}
              disabled={loading}
              sx={{ 
                borderRadius: '20px', 
                bgcolor: 'alert.main', 
                '&:hover': { bgcolor: 'alert.dark' },
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              {loading ? <CircularProgress size={20} /> : '일괄적용 (클릭 필수)'}
            </Button>
            <Button 
              variant="contained" 
              color="warning"
              startIcon={<UnifiedIcon />}
              onClick={unifyInputs}
              disabled={loading}
              sx={{ 
                borderRadius: '20px', 
                bgcolor: 'warning.main', 
                '&:hover': { bgcolor: 'warning.dark' },
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              입력사항 통일
            </Button>
          <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />}
            onClick={addParticipant}
              sx={{ borderRadius: '20px' }}
          >
            참가자 추가
          </Button>
        </Box>
        </Box>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          참가자 정보를 입력한 후 <strong>반드시 "일괄적용" 버튼을 클릭</strong>하여 모든 설문 폼에 정보를 적용해주세요.
        </Typography>
        
        <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden', borderRadius: '8px' }}>
          <Grid container spacing={0} sx={{ bgcolor: 'secondary.light', p: 1 }}>
            <Grid item xs={1.8}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}>이름</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}>성별</Typography>
            </Grid>
            <Grid item xs={1.2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}>연령</Typography>
            </Grid>
            <Grid item xs={2.3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}>거주지</Typography>
            </Grid>
            <Grid item xs={2.3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}>직업</Typography>
            </Grid>
            <Grid item xs={2.7}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}>참여기간 유형</Typography>
            </Grid>
            <Grid item xs={0.5} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', p: 1 }}></Typography>
            </Grid>
          </Grid>
        
        {participants.map((participant, index) => (
            <Grid 
              container 
              spacing={0} 
            key={participant.id}
            sx={{ 
                p: 1, 
                alignItems: 'center',
                '&:hover': { bgcolor: 'action.hover' },
                bgcolor: currentParticipantIndex === index ? 'primary.lighter' : 'inherit',
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
              onClick={() => handleParticipantSelect(index)}
            >
              <Grid item xs={1.8} sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="이름 입력"
                  value={participant.personal.name}
                  onChange={(e) => handleParticipantPersonalChange(index, 'name', e.target.value)}
                  error={!!(validationErrors.participants[index]?.name)}
                  helperText={validationErrors.participants[index]?.name}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              
              <Grid item xs={1.2} sx={{ p: 0.5 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <Select
                    value={participant.personal.sex}
                    onChange={(e) => handleParticipantPersonalChange(index, 'sex', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="미기재">미기재</MenuItem>
                    <MenuItem value="남">남</MenuItem>
                    <MenuItem value="여">여</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={1.2} sx={{ p: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="연령"
                  value={participant.personal.age}
                  onChange={(e) => handleParticipantPersonalChange(index, 'age', e.target.value)}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              
              <Grid item xs={2.3} sx={{ p: 0.5 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <Select
                    value={participant.personal.residence}
                    onChange={(e) => handleParticipantPersonalChange(index, 'residence', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="미기재">미기재</MenuItem>
                    <MenuItem value="서울">서울</MenuItem>
                    <MenuItem value="부산">부산</MenuItem>
                    <MenuItem value="대구">대구</MenuItem>
                    <MenuItem value="인천">인천</MenuItem>
                    <MenuItem value="광주">광주</MenuItem>
                    <MenuItem value="대전">대전</MenuItem>
                    <MenuItem value="울산">울산</MenuItem>
                    <MenuItem value="세종">세종</MenuItem>
                    <MenuItem value="경기">경기</MenuItem>
                    <MenuItem value="강원">강원</MenuItem>
                    <MenuItem value="충북">충북</MenuItem>
                    <MenuItem value="충남">충남</MenuItem>
                    <MenuItem value="전북">전북</MenuItem>
                    <MenuItem value="전남">전남</MenuItem>
                    <MenuItem value="경북">경북</MenuItem>
                    <MenuItem value="경남">경남</MenuItem>
                    <MenuItem value="제주">제주</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={2.3} sx={{ p: 0.5 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <Select
                  value={participant.personal.job}
                  onChange={(e) => handleParticipantPersonalChange(index, 'job', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="미기재">미기재</MenuItem>
                    <MenuItem value="초등학생">초등학생</MenuItem>
                    <MenuItem value="중학생">중학생</MenuItem>
                    <MenuItem value="고등학생">고등학생</MenuItem>
                    <MenuItem value="대학/대학원생">대학/대학원생</MenuItem>
                    <MenuItem value="사무/전문직">사무/전문직</MenuItem>
                    <MenuItem value="기술/생산/현장직">기술/생산/현장직</MenuItem>
                    <MenuItem value="서비스/판매직">서비스/판매직</MenuItem>
                    <MenuItem value="의료/보건/예술">의료/보건/예술</MenuItem>
                    <MenuItem value="복지/상담직">복지/상담직</MenuItem>
                    <MenuItem value="공공서비스/교육">공공서비스/교육</MenuItem>
                    <MenuItem value="자영업/프리랜서">자영업/프리랜서</MenuItem>
                    <MenuItem value="군인">군인</MenuItem>
                    <MenuItem value="주부">주부</MenuItem>
                    <MenuItem value="무직/취업준비생">무직/취업준비생</MenuItem>
                    <MenuItem value="기타">기타</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={2.7} sx={{ p: 0.5 }}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <Select
                    value={participant.personal.participationPeriod}
                    onChange={(e) => handleParticipantPersonalChange(index, 'participationPeriod', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    <MenuItem value="당일형">당일형</MenuItem>
                    <MenuItem value="1박 2일형">1박 2일형</MenuItem>
                    <MenuItem value="2박 3일형">2박 3일형</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={0.5} sx={{ textAlign: 'center', p: 0.5 }}>
                <IconButton 
                  color="error" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeParticipant(index);
                  }}
                  disabled={participants.length <= 1}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          </Paper>

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          * 행을 클릭하여 참가자를 선택하고, 오른쪽 + 버튼을 눌러 새 참가자를 추가할 수 있습니다.
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.main', mt: 1, fontWeight: 'bold' }}>
          * 참가자 정보 입력 후 반드시 상단의 "일괄적용" 버튼을 클릭해야 모든 설문지에 정보가 적용됩니다.
        </Typography>
      </Paper>

      {/* 폼 탭 네비게이션 */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: '4px',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {formTypes.map((form) => (
            <Button
              key={form.id}
              variant={activeFormId === form.id ? "contained" : "outlined"}
              onClick={() => handleFormSelect(form.id)}
              sx={(theme) => ({
                minWidth: '120px',
                m: 0.5,
                borderRadius: '25px',
                fontWeight: activeFormId === form.id ? 'bold' : 'normal',
                ...(activeFormId === form.id && {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }),
                ...(!(activeFormId === form.id) && {
                })
              })}
              className={`form-tab-button ${activeFormId === form.id ? 'active' : ''}`}
            >
              {form.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* 원본 폼 컴포넌트 표시 */}
      <Box sx={{ mt: 3, overflowX: 'auto' }}>
        {activeFormId === 'service' && (
          <CustomFormContainer 
            title="서비스환경 만족도"
            formId="service"
            isActive={true}
            participants={participants}
            formData={formData.service}
          >
            <Service 
              ref={formRefs.service}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
              onOrganizationChange={handleOrganizationChange}
            />
          </CustomFormContainer>
        )}
        {activeFormId === 'program' && (
          <CustomFormContainer 
            title="프로그램 만족도"
            formId="program"
            isActive={true}
            participants={participants}
            formData={formData.program}
          >
            <Program 
              ref={formRefs.program}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
            />
          </CustomFormContainer>
        )}
        {activeFormId === 'counsel' && (
          <CustomFormContainer 
            title="상담&치유서비스 효과평가"
            formId="counsel"
            isActive={true}
            participants={participants}
            formData={formData.counsel}
          >
            <Counsel 
              ref={formRefs.counsel}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
              onOrganizationChange={handleOrganizationChange}
            />
          </CustomFormContainer>
        )}
        {activeFormId === 'prevent' && (
          <CustomFormContainer 
            title="예방효과(스마트폰)"
            formId="prevent"
            isActive={true}
            participants={participants}
            formData={formData.prevent}
          >
            <Prevent 
              ref={formRefs.prevent}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
            />
          </CustomFormContainer>
        )}
        {activeFormId === 'preventGambling' && (
          <CustomFormContainer 
            title="예방효과(도박)"
            formId="preventGambling"
            isActive={true}
            participants={participants}
            formData={formData.preventGambling}
          >
            <PreventGambling 
              ref={formRefs.preventGambling}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
            />
          </CustomFormContainer>
        )}
        {activeFormId === 'healing' && (
          <HealingFormContainer 
            title="힐링서비스 효과평가"
            formId="healing"
            isActive={true}
            participants={participants}
            formData={formData.healing}
          >
            <Healing 
              ref={formRefs.healing}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
            />
          </HealingFormContainer>
        )}
        {activeFormId === 'hrv' && (
          <CustomFormContainer 
            title="HRV 측정 검사"
            formId="hrv"
            isActive={true}
            participants={participants}
            formData={formData.hrv}
          >
            <Hrv 
              ref={formRefs.hrv}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
            />
          </CustomFormContainer>
        )}
        {activeFormId === 'vibra' && (
          <CustomFormContainer 
            title="바이브라 측정 검사"
            formId="vibra"
            isActive={true}
            participants={participants}
            formData={formData.vibra}
          >
            <Vibra 
              ref={formRefs.vibra}
              searchInfo={{
                agency: organizationInfo.agency,
                agency_id: organizationInfo.agency_id,
                openday: organizationInfo.openday,
                eval_date: organizationInfo.eval_date,
                ptcprogram: organizationInfo.ptcprogram
              }}
            />
          </CustomFormContainer>
        )}
      </Box>

    </MainCard>
  );
};

export default ServiceInsertForm;