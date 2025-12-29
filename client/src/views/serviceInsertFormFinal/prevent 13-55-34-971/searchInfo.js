import React, { useState } from "react";
import { Grid, FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { getState, actions } from "store/reducers/serviceInsert/prevent";
import { Input, Select, DatePicker } from "ui-component/inputs";
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

const SearchInfo = ({ searchInfo, onChangeSearchInfo }) => {
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

    const handleOrganizationChange = (e) => {
        const orgId = e.target.value;
        
        if (orgId === '') {
            // 기관 선택이 해제된 경우
            onChangeSearchInfo('agency_id', null);
            onChangeSearchInfo('agency', '');
            return;
        }
        
        // 문자열을 정수로 변환
        const numericOrgId = parseInt(orgId, 10);
        const selectedOrg = organizations.find(org => org.id === numericOrgId);
        
        if (selectedOrg) {
            // 기관명과 ID 업데이트
            onChangeSearchInfo('agency_id', numericOrgId);
            onChangeSearchInfo('agency', selectedOrg.group_name);
        } else {
            onChangeSearchInfo('agency_id', null);
            onChangeSearchInfo('agency', '');
        }
    };

    const handleInputChange = (e) => {
        onChangeSearchInfo(e.target.name, e.target.value);
    };

    const participationTypes = ["당일형", "1박2일형", "2박3일형"];
    const timePointOptions = ['사전', '사후'];
    const expOptions = ['있음', '없음'];

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item sm={2}>
                <DatePicker 
                    value={searchInfo.openday} 
                    onChange={(key, value) => onChangeSearchInfo('openday', value)} 
                    label="시작일자" 
                    name="openday" 
                />
            </Grid>
            <Grid item sm={2}>
                <DatePicker 
                    label="실시일자" 
                    value={searchInfo.eval_date} 
                    onChange={(key, value) => onChangeSearchInfo('eval_date', value)} 
                    name="eval_date"
                />
            </Grid>
            
            <Grid item sm={2}>
                <FormControl fullWidth size="small">
                    <InputLabel>기관 선택</InputLabel>
                    <MuiSelect
                        value={searchInfo.agency_id ? String(searchInfo.agency_id) : ''}
                        onChange={handleOrganizationChange}
                        label="기관 선택"
                        name="agency_id"
                        disabled={orgLoading}
                    >
                        <MenuItem value="">선택하세요</MenuItem>
                        {organizations.map((org) => (
                            <MenuItem key={org.id} value={String(org.id)}>
                                {org.group_name} ({new Date(org.start_date).toLocaleDateString()} ~ {new Date(org.end_date).toLocaleDateString()})
                            </MenuItem>
                        ))}
                    </MuiSelect>
                    {orgLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </FormControl>
            </Grid>
            
            <Grid item sm={2}>
                <Input 
                    label="기관명" 
                    value={searchInfo.agency || ""} 
                    name="agency" 
                    onChange={handleInputChange}
                /> 
            </Grid>
            
            <Grid item sm={2}>
                <Select 
                    options={participationTypes} 
                    label="참여일정" 
                    value={searchInfo.ptcprogram || ""} 
                    name="ptcprogram" 
                    onChange={handleInputChange} 
                />
            </Grid>
            
            <Grid item sm={2}>
                <Select 
                    options={timePointOptions} 
                    label="시점" 
                    name="pv" 
                    value={searchInfo.pv || ""} 
                    onChange={handleInputChange}
                />
            </Grid>
            
            <Grid item sm={2}>
                <Select 
                    options={expOptions} 
                    label="힐링 서비스 경험" 
                    value={searchInfo.past_stress_experience || ""} 
                    name="past_stress_experience" 
                    onChange={handleInputChange} 
                />
            </Grid>
        </Grid>
    );
};

export default SearchInfo;