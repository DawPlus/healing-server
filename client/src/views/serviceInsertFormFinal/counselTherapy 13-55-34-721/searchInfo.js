import React, { useState, useEffect } from 'react';
import { Grid, FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress, TextField, Autocomplete } from '@mui/material';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import moment from 'moment';
import 'moment/locale/ko';
import { useQuery, gql } from '@apollo/client';
import Select from 'ui-component/inputs/select';

// 기관 목록 조회 쿼리
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

// 프로그램 카테고리 쿼리
const GET_PROGRAM_CATEGORIES = gql`
  query ProgramCategories {
    programCategories {
      id
      category_name
      description
    }
  }
`;

// 프로그램 목록 쿼리
const GET_PROGRAMS_BY_CATEGORY = gql`
  query GetProgramsByCategory($categoryId: Int!) {
    getProgramsByCategory(categoryId: $categoryId) {
      id
      program_name
      category_id
      description
    }
  }
`;

const SearchInfo = ({ searchInfo, onChangeSearchInfo }) => {
  // 한국어 로케일 설정
  moment.locale('ko');
  
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Find the selected agency object based on the agency_id
  const selectedAgency = searchInfo?.agency_id ? 
    organizations.find(org => org.id === parseInt(searchInfo.agency_id, 10)) : null;
  
  // 기관 목록 조회
  const { loading: orgLoading } = useQuery(GET_ORGANIZATION_LIST, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getPage1List) {
        setOrganizations(data.getPage1List);
      }
    },
    onError: (error) => {
      console.error("Error fetching organizations:", error);
    }
  });

  // 프로그램 카테고리 조회
  const { loading: catLoading } = useQuery(GET_PROGRAM_CATEGORIES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.programCategories) {
        setCategories(data.programCategories);
      }
    },
    onError: (error) => {
      console.error("Error fetching program categories:", error);
    }
  });

  // 선택된 카테고리에 따라 프로그램 목록 조회
  const { loading: progLoading, refetch: refetchPrograms } = useQuery(GET_PROGRAMS_BY_CATEGORY, {
    variables: { categoryId: selectedCategory ? parseInt(selectedCategory, 10) : 0 },
    skip: !selectedCategory,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getProgramsByCategory) {
        console.log('[CounselTherapy SearchInfo] Programs loaded:', data.getProgramsByCategory.length);
        setPrograms(data.getProgramsByCategory);
      }
    },
    onError: (error) => {
      console.error("Error fetching programs:", error);
    }
  });

  // 카테고리 변경 시 프로그램 목록 다시 조회
  useEffect(() => {
    if (selectedCategory) {
      console.log('[CounselTherapy SearchInfo] Fetching programs for category:', selectedCategory);
      refetchPrograms({ categoryId: parseInt(selectedCategory, 10) });
    }
  }, [selectedCategory, refetchPrograms]);

  useEffect(() => {
    // When component mounts or searchInfo.ptcprogram changes, find matching category
    if (searchInfo.ptcprogram && programs.length > 0) {
      const matchingProgram = programs.find(p => p.program_name === searchInfo.ptcprogram);
      if (matchingProgram && !selectedCategory) {
        console.log('[CounselTherapy SearchInfo] Found matching program category:', matchingProgram.category_id);
        setSelectedCategory(String(matchingProgram.category_id));
      }
    }
  }, [searchInfo.ptcprogram, programs, selectedCategory]);

  // Set default eval_date to today if not already set
  useEffect(() => {
    if (!searchInfo.eval_date) {
      const today = moment().format('YYYY-MM-DD');
      console.log('[CounselTherapy SearchInfo] Setting default eval_date to today:', today);
      onChangeSearchInfo('eval_date', today);
    }
  }, []);

  const handleSearchInfoChange = (name) => (e) => {
    console.log(`[CounselTherapy SearchInfo] Field ${name} changed:`, e.target.value);
    onChangeSearchInfo(name, e.target.value);
  };

  const handleDateChange = (name) => (date) => {
    if (date) {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      console.log(`[CounselTherapy SearchInfo] Date ${name} changed:`, formattedDate);
      
      // Ensure the date is a valid string in YYYY-MM-DD format
      if (formattedDate && formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        onChangeSearchInfo(name, formattedDate);
        
        // For eval_date, also set a default date if not already set
        if (name === 'openday' && !searchInfo.eval_date) {
          console.log('[CounselTherapy SearchInfo] Auto-setting eval_date to same as openday');
          onChangeSearchInfo('eval_date', formattedDate);
        }
      } else {
        console.error(`[CounselTherapy SearchInfo] Invalid date format for ${name}:`, formattedDate);
      }
    }
  };

  const handleOrganizationChange = (event, newValue) => {
    try {
      if (newValue) {
        // 기관명과 ID 업데이트
        console.log('[CounselTherapy SearchInfo] Organization selected:', newValue.group_name, newValue.id);
        onChangeSearchInfo('agency_id', newValue.id);
        onChangeSearchInfo('agency', newValue.group_name);
        
        // Only update start date but don't trigger a search
        if (newValue.start_date) {
          console.log('[CounselTherapy SearchInfo] Setting start date from org:', newValue.start_date);
          onChangeSearchInfo('openday', newValue.start_date);
        }
      } else {
        onChangeSearchInfo('agency_id', null);
        onChangeSearchInfo('agency', '');
      }
    } catch (err) {
      console.error('[CounselTherapy SearchInfo] Error in handleOrganizationChange:', err);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log('[CounselTherapy SearchInfo] Category changed:', categoryId);
    setSelectedCategory(categoryId);
    // 카테고리 변경 시 프로그램 선택 초기화
    onChangeSearchInfo('ptcprogram', '');
  };

  const handleProgramChange = (e) => {
    const programId = e.target.value;
    const selectedProgram = programs.find(prog => prog.id === programId);
    
    if (selectedProgram) {
      console.log('[CounselTherapy SearchInfo] Program selected:', selectedProgram.program_name);
      onChangeSearchInfo('ptcprogram', selectedProgram.program_name);
    } else {
      onChangeSearchInfo('ptcprogram', '');
    }
  };

  // Get the currently selected program ID
  const getSelectedProgramId = () => {
    if (!searchInfo.ptcprogram || !programs.length) return '';
    
    const program = programs.find(p => p.program_name === searchInfo.ptcprogram);
    return program ? program.id : '';
  };
  
  // Used to display current program selection state in logs
  useEffect(() => {
    console.log('[CounselTherapy SearchInfo] Current state:', {
      agency: searchInfo.agency,
      agency_id: searchInfo.agency_id,
      openday: searchInfo.openday,
      eval_date: searchInfo.eval_date,
      ptcprogram: searchInfo.ptcprogram,
      selectedCategory,
      programsCount: programs.length,
      selectedProgramId: getSelectedProgramId()
    });
  }, [searchInfo, programs, selectedCategory]);

  const directDateChange = (name, date) => {
    console.log(`[CounselTherapy SearchInfo] Direct date change for ${name}:`, date);
    if (date && typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      onChangeSearchInfo(name, date);
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <Autocomplete
            options={organizations}
            getOptionLabel={(option) => option.group_name || ''}
            value={selectedAgency || null}
            onChange={handleOrganizationChange}
            loading={orgLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="기관명"
                size="small"
                error={!!orgLoading}
                helperText={orgLoading ? "데이터를 불러오는 중..." : ""}
              />
            )}
          />
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <DatePicker
          label="시작일"
          value={searchInfo.openday || ""}
          onChange={directDateChange}
          name="openday"
          fullWidth
          required
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <DatePicker
          label="실시일자"
          value={searchInfo.eval_date || ""}
          onChange={directDateChange}
          name="eval_date"
          fullWidth
          required
        />
      </Grid>
      
      {/* <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>프로그램 카테고리</InputLabel>
          <MuiSelect
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            label="프로그램 카테고리"
            disabled={catLoading}
          >
            <MenuItem value="">선택하세요</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.category_name}
              </MenuItem>
            ))}
          </MuiSelect>
          {catLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>프로그램</InputLabel>
          <MuiSelect
            value={getSelectedProgramId()}
            onChange={handleProgramChange}
            label="프로그램"
            disabled={!selectedCategory || progLoading}
          >
            <MenuItem value="">선택하세요</MenuItem>
            {programs.map((program) => (
              <MenuItem key={program.id} value={program.id}>
                {program.program_name}
              </MenuItem>
            ))}
          </MuiSelect>
          {progLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </FormControl>
      </Grid> */}
   
      
      <Grid item xs={12} md={3}>
        <Input
          id="session1"
          label="회기(시작)"
          variant="outlined"
          value={searchInfo.session1}
          onChange={handleSearchInfoChange('session1')}
          fullWidth
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Input
          id="session2"
          label="회기(종료)"
          variant="outlined"
          value={searchInfo.session2}
          onChange={handleSearchInfoChange('session2')}
          fullWidth
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>시점</InputLabel>
          <MuiSelect
            value={searchInfo.pv || ''}
            onChange={handleSearchInfoChange('pv')}
            label="시점"
          >
            <MenuItem value="">선택하세요</MenuItem>
            <MenuItem value="사전">사전</MenuItem>
            <MenuItem value="사후">사후</MenuItem>
          </MuiSelect>
        </FormControl>
      </Grid>
      
   
    </Grid>
  );
};

export default SearchInfo; 