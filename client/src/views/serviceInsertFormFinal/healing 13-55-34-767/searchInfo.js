import React, { useState } from "react";
import { Grid, FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { getState, actions } from "store/reducers/serviceInsert/healing";
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

const SearchInfo = () => {
    const dispatch = useDispatch();
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

    const { 
        OPENDAY, // 시작일자
        AGENCY, // 기관명
        AGENCY_ID, // 기관 ID
        NAME, // 이름
        EVAL_DATE, // 실시일자
        PTCPROGRAM, // 참여일정
        PV, // 시점 (사전/사후)
        PAST_STRESS_EXPERIENCE, // 과거 스트레스 해소 경험
    } = useSelector(s => getState(s).searchInfo);

    const onChange = (e) => {
        dispatch(actions.setSearchInfo({
            key: e.target.name, 
            value: e.target.value
        }));
    }

    const onDateChange = (key, value) => {
        dispatch(actions.setSearchInfo({ key, value }));
    }

    const handleOrganizationChange = (e) => {
        const orgId = e.target.value;
        const selectedOrg = organizations.find(org => org.id === orgId);
        
        if (selectedOrg) {
            // 기관명과 ID 업데이트
            dispatch(actions.setSearchInfo({ key: 'AGENCY_ID', value: orgId }));
            dispatch(actions.setSearchInfo({ key: 'AGENCY', value: selectedOrg.group_name }));
        } else {
            dispatch(actions.setSearchInfo({ key: 'AGENCY_ID', value: null }));
            dispatch(actions.setSearchInfo({ key: 'AGENCY', value: '' }));
        }
    }

    const item = ["당일형", "1박2일형", "2박3일형"];
    const item2 = ['사전', '사후'];
    const expOptions = ['있음', '없음'];

    return <>
        <Grid container spacing={2} alignItems={"center"}>
            <Grid item sm={2}>
                <DatePicker value={OPENDAY} onChange={onDateChange} label="시작일자" name="OPENDAY" />
            </Grid>
            <Grid item sm={2}>
                <DatePicker label="실시일자" value={EVAL_DATE} onChange={onDateChange} name="EVAL_DATE"/>
            </Grid>
            <Grid item sm={8}></Grid>
            
            <Grid item sm={4}>
                <FormControl fullWidth size="small">
                    <InputLabel>기관 선택</InputLabel>
                    <MuiSelect
                        value={AGENCY_ID || ''}
                        onChange={handleOrganizationChange}
                        label="기관 선택"
                        name="AGENCY_ID"
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
            
            <Grid item sm={2}>
                <Input label="기관명" value={AGENCY} name="AGENCY" onChange={onChange}/> 
            </Grid>
            
            <Grid item sm={2}>
                <Input label="이름" value={NAME} name="NAME" onChange={onChange}/> 
            </Grid>
            
            <Grid item sm={2}>
                <Select options={item} label="참여일정" value={PTCPROGRAM} name="PTCPROGRAM" onChange={onChange} />
            </Grid>
            
            <Grid item sm={2}>
                <Select options={item2} label="시점" value={PV} name="PV" onChange={onChange} />
            </Grid>
            
            <Grid item sm={2}>
                <Select options={expOptions} label="스트레스 해소 경험" value={PAST_STRESS_EXPERIENCE} name="PAST_STRESS_EXPERIENCE" onChange={onChange} />
            </Grid>
        </Grid>
    </>
}

export default SearchInfo;