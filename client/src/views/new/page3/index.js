import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from 'utils/apolloClient';

import List from './List';
import Edit from './Edit';

const Page3Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // page1의 ID를 URL에서 가져옵니다 (예: ?from=123)
  const queryParams = new URLSearchParams(location.search);
  const fromPage1Id = queryParams.get('from');
  
  // If coming from page1, redirect to edit
  React.useEffect(() => {
    if (fromPage1Id) {
      navigate(`/new/page3/edit/${fromPage1Id}`);
    }
  }, [fromPage1Id, navigate]);

  return (
    <ApolloProvider client={apolloClient}>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/edit/:page1Id" element={<Edit />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ApolloProvider>
  );
};

export default Page3Index; 