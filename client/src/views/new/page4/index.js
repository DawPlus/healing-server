import React from 'react';
import { useNavigate, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from 'utils/apolloClient';
import ListView from './ListView';
import Edit from './Edit';
import { Box } from '@mui/material';

const ExpenseList = ({ onCreateNew }) => {
  return (
    <Box>
      <ListView onCreateNew={onCreateNew} />
    </Box>
  );
};

const Page4 = () => {
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    navigate('/new/page4');
  };
  
  return (
    <ApolloProvider client={apolloClient}>
      <Routes>
        <Route path="/" element={<ExpenseList onCreateNew={handleCreateNew} />} />
        <Route path="/edit/:page1Id" element={<Edit />} />
        <Route path="*" element={<Navigate to="/new/page4" replace />} />
      </Routes>
    </ApolloProvider>
  );
};

export default Page4; 