import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Import components
import List from './List';
import Edit from './Edit';

const Page1Routes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // new/1 경로로 접근한 경우 new/page1으로 리다이렉트
  useEffect(() => {
    if (location.pathname === '/new/1') {
      navigate('/new/page1', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<List />} />
      <Route path="/edit/:id" element={<Edit />} />
      <Route path="*" element={<Navigate to="/new/page1" replace />} />
    </Routes>
  );
};

export default Page1Routes; 