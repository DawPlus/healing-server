import React from 'react';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import EditLayout from './components/EditLayout';

/**
 * Edit component now just wraps the EditLayout component
 * This maintains backward compatibility with existing code while using the new component structure
 */
const Edit = ({ overrideId, isEmbedded = false, onDataUpdate, hideReservationInfo = false }) => {
  const { id: urlId } = useParams();
  const id = overrideId || urlId; // Use overrideId if provided, otherwise use from URL
  
      return (
    <EditLayout
      id={id}
        isEmbedded={isEmbedded}
      onDataUpdate={onDataUpdate}
      hideReservationInfo={hideReservationInfo}
    />
  );
};

export default Edit; 