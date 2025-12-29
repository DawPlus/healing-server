import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Collapse,
  TextField,
  useTheme,
  Divider,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  Card,
  CardContent,
  Button,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PublicIcon from '@mui/icons-material/Public';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';



// 단체성격 옵션
const organizationNatures = ["교육기관", "복지기관", "기업", "관공서", "강원랜드"];

// 참가자 유형 옵션
const participantTypes = ["일반", "가족", "장애인", "다문화"];

// 연령대 옵션
const ageTypes = ["아동청소년", "성인", "노인"];

// 참여형태 옵션
const participationTypes = ["단체", "개인", "기타"];

// 서비스유형 옵션
const serviceTypeOptions = ["산림교육", "산림치유", "행위중독치유", "행위중독예방", "힐링"];

const BusinessCategoryForm = ({ formData, handleFieldChange }) => {
  const theme = useTheme();
  const businessTypeInitialized = useRef(false);
  
  // Log formData to debug (조건부로 필요할 때만 로그 출력)
  useEffect(() => {
    if (businessTypeInitialized.current) {
      // 이미 초기화가 완료된 상태에서는 중요한 변경사항만 로그로 출력
      if (formData.business_type !== prevBusinessType.current) {
        console.log('BusinessCategoryForm - business_type changed:', formData.business_type);
        prevBusinessType.current = formData.business_type;
      }
    } else {
      // 초기화 전에는 전체 formData 로그
      console.log('BusinessCategoryForm - formData (initialization):', formData);
    }
  }, [formData.business_type]);
  
  // 이전 business_type 값을 저장하는 ref
  const prevBusinessType = useRef(formData.business_type);
  
  // Component state for form fields - use consistent naming with database fields
  const [orgNature, setOrgNature] = useState(formData.org_nature || '');
  const [partType, setPartType] = useState(formData.part_type || '');
  const [ageType, setAgeType] = useState(formData.age_type || '');
  const [partForm, setPartForm] = useState(formData.part_form || '');
  const [serviceType, setServiceType] = useState(formData.service_type || '');
  
  // Update local state when formData changes (for editing mode)
  useEffect(() => {
    // 실제로 값이 변경되었을 때만 상태를 업데이트하여 무한 루프 방지
    const newOrgNature = formData.org_nature || '';
    const newPartType = formData.part_type || '';
    const newAgeType = formData.age_type || '';
    const newPartForm = formData.part_form || '';
    const newServiceType = formData.service_type || '';
    
    let changed = false;
    if (newOrgNature !== orgNature) { setOrgNature(newOrgNature); changed = true; }
    if (newPartType !== partType) { setPartType(newPartType); changed = true; }
    if (newAgeType !== ageType) { setAgeType(newAgeType); changed = true; }
    if (newPartForm !== partForm) { setPartForm(newPartForm); changed = true; }
    if (newServiceType !== serviceType) { setServiceType(newServiceType); changed = true; }
    
    // 실제 변경이 있을 때만 로그 출력
    if (changed) {
      console.log('BusinessCategoryForm - Local state updated with form fields');
    }
  }, [
    formData.org_nature,
    formData.part_type,
    formData.age_type,
    formData.part_form,
    formData.service_type,
    orgNature,
    partType,
    ageType,
    partForm,
    serviceType
  ]);
  
  // Handle changes and propagate to parent
  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Update local state
    switch(name) {
      case 'org_nature':
        setOrgNature(value);
        break;
      case 'part_type':
        setPartType(value);
        break;
      case 'age_type':
        setAgeType(value);
        break;
      case 'part_form':
        setPartForm(value);
        break;
      case 'service_type':
        setServiceType(value);
        break;
      default:
        break;
    }
    
    // Propagate to parent
    handleFieldChange(name, value);
  };
  
  // Set business type based on page1 data, only once on mount
  useEffect(() => {
    // 이미 business_type이 설정된 경우 아무 것도 하지 않음
    if (businessTypeInitialized.current) {
      console.log('BusinessCategoryForm - Business type already initialized, skipping');
      return;
    }
    
    console.log('BusinessCategoryForm - Init effect running with:', {
      business_category: formData.business_category,
      business_type: formData.business_type,
      initialized: businessTypeInitialized.current
    });
    
    // business_type이 이미 있는 경우 초기화 완료로 표시하고 더 이상 진행하지 않음
    if (formData.business_type) {
      console.log('BusinessCategoryForm - Business type already set to:', formData.business_type);
      businessTypeInitialized.current = true;
      return;
    }
    
    // Ensure business_type is set correctly from page1 data
    if (formData.business_category) {
      console.log('BusinessCategoryForm - Setting business_type from page1:', formData.business_category);
      businessTypeInitialized.current = true; // 먼저 플래그 설정 (무한 루프 방지)
      handleFieldChange('business_type', formData.business_category);
    } 
    // Only set default if nothing is set yet
    else {
      console.log('BusinessCategoryForm - Setting default business_type: social_contribution');
      businessTypeInitialized.current = true; // 먼저 플래그 설정 (무한 루프 방지)
      handleFieldChange('business_type', 'social_contribution');
    }
  }, []);

  // Get effective business type with proper priority
  const getEffectiveBusinessType = () => {
    // Priority: business_category from page1, then business_type
    return formData.business_category || formData.business_type || '';
  };

  // Check if we're dealing with a social contribution business type
  const isSocialContribution = getEffectiveBusinessType() === 'social_contribution';
  const isProfitBusiness = getEffectiveBusinessType() === 'profit_business' || getEffectiveBusinessType() === 'profit';

  // Log business type determination on changes
  useEffect(() => {
    console.log('BusinessCategoryForm - Business type determination:', {
      effectiveType: getEffectiveBusinessType(),
      isSocialContribution,
      isProfitBusiness,
      fromPage1: formData.business_category,
      businessType: formData.business_type
    });
  }, [formData.business_category, formData.business_type, isSocialContribution, isProfitBusiness]);

  // Get business type display text
  const getBusinessTypeText = () => {
    switch(getEffectiveBusinessType()) {
      case 'social_contribution': return '사회공헌';
      case 'profit_business': 
      case 'profit': return '수익사업';
      default: return getEffectiveBusinessType() || '-';
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CategoryIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">관련 정보</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Business type display */}
     

       
        
     
          <>
            <Grid item xs={6}>  
              <FormControl fullWidth>
                <InputLabel id="org-nature-label">단체성격</InputLabel>
                <Select
                  labelId="org-nature-label"
                  id="org-nature"
                  name="org_nature"
                  value={orgNature}
                  label="단체성격"
                  onChange={onChange}
                >
                  {organizationNatures.map((nature) => (
                    <MenuItem key={nature} value={nature}>{nature}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>  
              <FormControl fullWidth>
                <InputLabel id="part-type-label">참가자 유형</InputLabel>
                <Select
                  labelId="part-type-label"
                  id="part-type"
                  name="part_type"
                  value={partType}
                  label="참가자 유형"
                  onChange={onChange}
                >
                  {participantTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>  
              <FormControl fullWidth>
                <InputLabel id="age-type-label">연령대</InputLabel>
                <Select
                  labelId="age-type-label"
                  id="age-type"
                  name="age_type"
                  value={ageType}
                  label="연령대"
                  onChange={onChange}
                >
                  {ageTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>  
              <FormControl fullWidth>
                <InputLabel id="part-form-label">참여형태</InputLabel>
                <Select
                  labelId="part-form-label"
                  id="part-form"
                  name="part_form"
                  value={partForm}
                  label="참여형태"
                  onChange={onChange}
                >
                  {participationTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>  
              <FormControl fullWidth>
                <InputLabel id="service-type-label">서비스유형</InputLabel>
                <Select
                  labelId="service-type-label"
                  id="service-type"
                  name="service_type"
                  value={serviceType}
                  label="서비스유형"
                  onChange={onChange}
                >
                  {serviceTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
      </Grid>
    </Paper>
  );
};

export default BusinessCategoryForm; 