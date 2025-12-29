import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// Import the query for reservation list (agency list)
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

const AgencyDropdown = ({ value, onChange, label = "기관명" }) => {
  const [reservations, setReservations] = useState([]);
  
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

  // Find the selected agency object based on the agency_id
  const selectedAgency = value?.agency_id ? 
    reservations.find(res => res.id === parseInt(value.agency_id, 10)) : null;

  const handleAgencyChange = (event, newValue) => {
    // Safety check to ensure onChange is a function
    if (typeof onChange !== 'function') {
      console.error('AgencyDropdown: onChange prop is not a function', onChange);
      return;
    }

    try {
      if (newValue) {
        onChange({
          agency: newValue.group_name,
          agency_id: newValue.id
        });
      } else {
        onChange({
          agency: '',
          agency_id: null
        });
      }
    } catch (err) {
      console.error('Error in AgencyDropdown onChange callback:', err);
    }
  };

  return (
    <Autocomplete
      size="small"
      options={reservations}
      getOptionLabel={(option) => option.group_name || ''}
      value={selectedAgency || null}
      onChange={handleAgencyChange}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          error={!!error}
          helperText={error ? "데이터를 불러오는 중 오류가 발생했습니다." : ""}
          style={{ height: "40px" }}
        />
      )}
    />
  );
};

export default AgencyDropdown; 