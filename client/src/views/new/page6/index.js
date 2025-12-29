import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from 'utils/apolloClient';

// Import components
import ScheduleTab from './ScheduleTab';
import RoomAssignmentTab from './RoomAssignmentTab';
import WeeklyScheduleTab from './WeeklyScheduleTab';
import ImplementationPlanTab from './ImplementationPlanTab';
import UsageReportTab from './UsageReportTab';
import InstructorPaymentTab from './InstructorPaymentTab';
import SalesPerformanceTab from './SalesPerformanceTab';
import OrderReportTab from './OrderReportTab';

const Page6Routes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 경로 리다이렉트 처리
  useEffect(() => {
    if (location.pathname === '/new/6') {
      navigate('/new/page6', { replace: true });
      return;
    }
    
    if (location.pathname === '/new/page6' || location.pathname === '/new/page6/') {
      navigate('/new/page6/schedule', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  return (
    <ApolloProvider client={apolloClient}>
      <Routes>
        <Route path="/" element={<Navigate to="/new/page6/schedule" replace />} />
        <Route path="/schedule" element={<ScheduleTab />} />
        <Route path="/room-assignment" element={<RoomAssignmentTab />} />
        <Route path="/weekly-schedule" element={<WeeklyScheduleTab />} />
        <Route path="/implementation-plan" element={<ImplementationPlanTab />} />
        <Route path="/usage-report" element={<UsageReportTab />} />
        <Route path="/instructor-payment" element={<InstructorPaymentTab />} />
        <Route path="/sales-performance" element={<SalesPerformanceTab />} />
        <Route path="/order-report" element={<OrderReportTab />} />
        <Route path="*" element={<Navigate to="/new/page6/schedule" replace />} />
      </Routes>
    </ApolloProvider>
  );
};

export default Page6Routes; 