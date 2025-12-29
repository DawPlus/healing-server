import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Grid, FormControl, TextField, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DateFormatter from 'utils/DateFormatter';
import { ko } from 'date-fns/locale';
import Autocomplete from '@mui/material/Autocomplete';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Import the query for reservation list
const GET_PAGE5_RESERVATION_LIST = gql`
  query GetPage5ReservationList {
    getPage1List {
      id
      group_name
      customer_name
      start_date
      end_date
      reservation_status
    }
  }
`;

const SearchInfo = forwardRef((props, ref) => {
    const { searchInfo, onChange, onSearch } = props;
    const [reservations, setReservations] = useState([]);

    // 로컬 상태 추가
    const [localAgency, setLocalAgency] = useState('');
    const [localAgencyId, setLocalAgencyId] = useState(null);
    
    // 외부에서 접근할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
        resetForm: () => {
            console.log('[SearchInfo] resetForm called');
            setLocalAgency('');
            setLocalAgencyId(null);
        }
    }));

    // Fetch reservation list for agency dropdown
    const { loading, error, data } = useQuery(GET_PAGE5_RESERVATION_LIST, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data && data.getPage1List) {
                setReservations(data.getPage1List);
            }
        },
        onError: (error) => {
            console.error('Error fetching reservation list:', error);
        }
    });

    // 외부 props와 로컬 상태 동기화
    useEffect(() => {
        if (searchInfo?.agency) {
            setLocalAgency(searchInfo.agency);
        }
        if (searchInfo?.agency_id) {
            setLocalAgencyId(searchInfo.agency_id);
        }
    }, [searchInfo?.agency, searchInfo?.agency_id]);

    const handleChange = (e) => {
        try {
            const { name, value } = e.target;
            if (typeof onChange === 'function') {
                onChange(name, value);
            } else {
                console.error('[Service SearchInfo] onChange is not a function', onChange);
            }
        } catch (err) {
            console.error('[Service SearchInfo] Error in handleChange:', err);
        }
    };

    const handleAgencyChange = (event, newValue) => {
        try {
            if (typeof onChange !== 'function') {
                console.error('[Service SearchInfo] onChange is not a function', onChange);
                return;
            }

            // 로컬 상태 업데이트
            if (newValue) {
                setLocalAgency(newValue.group_name || '');
                setLocalAgencyId(parseInt(newValue.id, 10) || null);
                
                // 외부 상태 업데이트 - 기관 ID를 먼저 업데이트
                onChange('agency_id', parseInt(newValue.id, 10) || null);
                onChange('agency', newValue.group_name || '');
                
                // 기관 선택 시 해당 기관의 시작일자도 자동 설정
                if (newValue.start_date) {
                    onChange('openday', newValue.start_date);
                    console.log('[Service SearchInfo] 기관 선택으로 시작일자 자동 설정:', newValue.start_date);
                }
                
                console.log('[Service SearchInfo] Agency changed:', {
                    agency: newValue.group_name,
                    agency_id: parseInt(newValue.id, 10),
                    start_date: newValue.start_date
                });
            } else {
                setLocalAgency('');
                setLocalAgencyId(null);
                
                onChange('agency_id', null);
                onChange('agency', '');
                onChange('openday', '');
                
                console.log('[Service SearchInfo] Agency cleared');
            }
        } catch (err) {
            console.error('[Service SearchInfo] Error in handleAgencyChange:', err);
        }
    };

    const handleDateChange = (name, value) => {
        try {
            if (!value) return;
            
            if (typeof onChange !== 'function') {
                console.error('[Service SearchInfo] onChange is not a function', onChange);
                return;
            }
            
            const formatted = DateFormatter.format(value);
            onChange(name, formatted);
        } catch (err) {
            console.error('[Service SearchInfo] Error in handleDateChange:', err);
        }
    };

    // Find the selected agency object
    const selectedAgency = (() => {
        // agency_id가 있으면 ID로 찾기
        if (searchInfo?.agency_id || localAgencyId) {
            const agencyId = parseInt(searchInfo?.agency_id || localAgencyId, 10);
            const foundById = reservations.find(res => parseInt(res.id, 10) === agencyId);
            if (foundById) {
                return foundById;
            }
        }
        
        // agency_id가 없거나 ID로 찾지 못했으면 이름으로 찾기
        if (searchInfo?.agency || localAgency) {
            const agencyName = searchInfo?.agency || localAgency;
            return reservations.find(res => res.group_name === agencyName);
        }
        
        return null;
    })();

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
                <FormControl fullWidth size="small">
                    <Autocomplete
                        options={reservations}
                        getOptionLabel={(option) => option.group_name || ''}
                        value={selectedAgency || null}
                        onChange={handleAgencyChange}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="기관명"
                                size="small"
                                error={!!error}
                                helperText={error ? "데이터를 불러오는 중 오류가 발생했습니다." : ""}
                            />
                        )}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth size="small">
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                        <DatePicker
                            label="시작일자"
                            value={searchInfo?.openday ? new Date(searchInfo.openday) : null}
                            onChange={(value) => handleDateChange('openday', value)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl fullWidth size="small">
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                        <DatePicker
                            label="실시일자"
                            value={searchInfo?.eval_date ? new Date(searchInfo.eval_date) : null}
                            onChange={(value) => handleDateChange('eval_date', value)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>
                </FormControl>
            </Grid>
         
            {/* Remove search button - now in toolbar */}
        </Grid>
    );
});

export default SearchInfo;