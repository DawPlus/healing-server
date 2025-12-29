import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import Swal from 'sweetalert2';
import apolloClient from 'utils/apolloClient';

import List from './List';
import Edit from './Edit';

const Page2Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  
  // page1의 ID를 URL에서 가져옵니다 (예: ?from=123)
  const queryParams = new URLSearchParams(location.search);
  const fromPage1Id = queryParams.get('from');
  
  useEffect(() => {
    console.log('[Page2] Component mounted, fromPage1Id:', fromPage1Id);
    
    // 특정 ID가 URL에 지정된 경우, Edit 페이지로 이동
    if (fromPage1Id) {
      console.log('[Page2] Redirecting to edit page for ID:', fromPage1Id);
      navigate(`/new/page2/edit/${fromPage1Id}`, { replace: true });
    }
    
    return () => {
      console.log('[Page2] Component unmounting');
    };
  }, [navigate, fromPage1Id]);
  
  // 로딩 중이면 로딩 표시
  if (!isDataLoaded && (location.pathname === '/new/2' || fromPage1Id)) {
    return <div>데이터 로드 중...</div>;
  }
  
  // 정상적인 라우팅
  return (
    <ApolloProvider client={apolloClient}>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ApolloProvider>
  );
};

export default Page2Index; 