import React, { useState, useEffect } from "react";
import { Grid, FormControl, InputLabel, Select as MuiSelect, MenuItem, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { getState, actions } from "store/reducers/serviceInsert/hrv";
import { Input, Select, DatePicker } from "ui-component/inputs";
import { useQuery, gql } from '@apollo/client';
import AgencyDropdown from '../common/AgencyDropdown';

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
    
    // 초기 상태값 - 리덕스 스토어에서 값을 가져오지 못할 경우를 대비한 기본값
    const [localAgency, setLocalAgency] = useState('');
    const [localAgencyId, setLocalAgencyId] = useState(null);
    
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

    const storeState = useSelector(s => getState(s).searchInfo) || {};
    
    // 안전하게 값을 추출 (undefined일 경우 기본값 사용)
    const AGENCY = storeState.AGENCY || localAgency;
    const AGENCY_ID = storeState.AGENCY_ID || localAgencyId;
    const DATE = storeState.DATE || '';
    const PV = storeState.PV || '';
    
    // 로컬 상태와 리덕스 상태 동기화
    useEffect(() => {
        if (storeState.AGENCY !== undefined) {
            setLocalAgency(storeState.AGENCY);
        }
        if (storeState.AGENCY_ID !== undefined) {
            setLocalAgencyId(storeState.AGENCY_ID);
        }
    }, [storeState.AGENCY, storeState.AGENCY_ID]);

    const onChange = (e) => {
        try {
            dispatch(actions.setSearchInfo({
                key: e.target.name, 
                value: e.target.value
            }));
        } catch (err) {
            console.error('[HRV SearchInfo] Error in onChange:', err);
        }
    }

    const onDateChange = (key, value) => {
        try {
            dispatch(actions.setSearchInfo({ key, value }));
        } catch (err) {
            console.error('[HRV SearchInfo] Error in onDateChange:', err);
        }
    }

    const handleAgencyChange = (agencyData) => {
        try {
            if (!agencyData) {
                console.log('[HRV SearchInfo] ⚠️ Agency data is null or undefined');
                return;
            }
            
            console.log('[HRV SearchInfo] 🔄 Agency changed:', agencyData);
            
            // 로컬 상태 업데이트
            setLocalAgency(agencyData.agency || '');
            setLocalAgencyId(agencyData.agency_id || null);
            
            // 리덕스 스토어 업데이트
            if (agencyData.agency_id !== undefined) {
                dispatch(actions.setSearchInfo({ key: 'AGENCY_ID', value: agencyData.agency_id }));
            }
            
            if (agencyData.agency !== undefined) {
                dispatch(actions.setSearchInfo({ key: 'AGENCY', value: agencyData.agency }));
            }
        } catch (err) {
            console.error('[HRV SearchInfo] Error in handleAgencyChange:', err);
        }
    }

    const item2 = ['사전', '사후'];

    return <>
        <Grid container spacing={2} alignItems={"center"}>
            <Grid item sm={2}>
                <DatePicker label="실시일자" value={DATE} onChange={onDateChange} name="DATE"/>
            </Grid>
            <Grid item sm={3}>
                <AgencyDropdown
                    value={{ agency: AGENCY, agency_id: AGENCY_ID }}
                    onChange={handleAgencyChange}
                    label="기관명"
                />
            </Grid>
            <Grid item sm={2}>
                <Select options={item2} label="시점" value={PV} name="PV" onChange={onChange} />
            </Grid>
        </Grid>
    </>
}

export default SearchInfo;