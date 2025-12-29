import React, { useState } from 'react';
import { Grid, Button, FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress } from '@mui/material';
import Input from 'ui-component/inputs/input';
import DatePicker from 'ui-component/inputs/datePicker';
import moment from 'moment';
import 'moment/locale/ko';
import { useQuery, gql } from '@apollo/client';

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

const SearchInfo = ({ searchInfo, onChangeSearchInfo, onSearch }) => {
  // 한국어 로케일 설정
  moment.locale('ko');
  
  const [organizations, setOrganizations] = useState([]);
  
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

  const handleSearchInfoChange = (name) => (e) => {
    onChangeSearchInfo(name, e.target.value);
  };

  const handleDateChange = (name) => (date) => {
    if (date) {
      onChangeSearchInfo(name, moment(date).format('YYYY-MM-DD'));
    }
  };

  const handleOrganizationChange = (e) => {
    const orgId = e.target.value;
    const selectedOrg = organizations.find(org => org.id === orgId);
    
    if (selectedOrg) {
      // 기관명과 ID 업데이트
      onChangeSearchInfo('agency_id', orgId);
      onChangeSearchInfo('agency', selectedOrg.group_name);
    } else {
      onChangeSearchInfo('agency_id', null);
      onChangeSearchInfo('agency', '');
    }
  };

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth size="small">
          <InputLabel>기관 선택</InputLabel>
          <MuiSelect
            value={searchInfo.agency_id || ''}
            onChange={handleOrganizationChange}
            label="기관 선택"
            name="agency_id"
            disabled={orgLoading}
          >
            <MenuItem value="">선택하세요</MenuItem>
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.group_name} ({new Date(org.start_date).toLocaleDateString()} ~ {new Date(org.end_date).toLocaleDateString()})
              </MenuItem>
            ))}
          </MuiSelect>
          {orgLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <DatePicker
          label="시작일"
          value={searchInfo.openday ? moment(searchInfo.openday).toDate() : null}
          onChange={handleDateChange('openday')}
          fullWidth
          required
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <DatePicker
          label="실시일자"
          value={searchInfo.eval_date ? moment(searchInfo.eval_date).toDate() : null}
          onChange={handleDateChange('eval_date')}
          fullWidth
          required
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Input
          id="ptcprogram"
          label="프로그램명"
          variant="outlined"
          value={searchInfo.ptcprogram}
          onChange={handleSearchInfoChange('ptcprogram')}
          fullWidth
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Input
          id="prevent_contents"
          label="예방서비스 내용"
          variant="outlined"
          value={searchInfo.prevent_contents}
          onChange={handleSearchInfoChange('prevent_contents')}
          fullWidth
        />
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Input
          id="session1"
          label="회기(시작)"
          variant="outlined"
          value={searchInfo.session1}
          onChange={handleSearchInfoChange('session1')}
          fullWidth
        />
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Input
          id="session2"
          label="회기(종료)"
          variant="outlined"
          value={searchInfo.session2}
          onChange={handleSearchInfoChange('session2')}
          fullWidth
        />
      </Grid>
      
      <Grid item xs={12} md={2}>
        <Input
          id="pv"
          label="시점"
          variant="outlined"
          value={searchInfo.pv}
          onChange={handleSearchInfoChange('pv')}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default SearchInfo; 