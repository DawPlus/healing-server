import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from 'utils/apolloClient';
// Import components
import ReservationList from './components/ReservationList';
import CalendarPage from './calendar';
import ReservationStatusTab from './ReservationStatusTab';
import InspectionDoc from './components/InspectionDoc';
import OrderReport from './components/OrderReport';
import OrganizationReport from './components/OrganizationReport';
import ScheduleView from './components/ScheduleView';
import ScheduleTab from './ScheduleTab';
import InspectionPage from './inspection';

// Create HTTP link


const Page5 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log the current location for debugging
  useEffect(() => {
    console.log('Current path:', location.pathname);
    
    // Redirect from /new/5 to /new/page5
    if (location.pathname === '/new/5') {
      navigate('/new/page5', { replace: true });
      return;
    }
    
    // Redirect from /new/page5 to /new/page5/list
    if (location.pathname === '/new/page5' || location.pathname === '/new/page5/') {
      navigate('/new/page5/calendar', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  return (
    <ApolloProvider client={apolloClient}>
      <Routes>
        <Route path="/" element={<Navigate to="/new/page5/calendar" replace />} />
        <Route path="/list" element={<ReservationList />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/status" element={<ReservationStatusTab />} />
        <Route path="/inspection" element={<InspectionDoc />} />
        <Route path="/inspection/excel" element={<InspectionPage />} />
        <Route path="/order-report" element={<OrderReport />} />
        <Route path="/order-report/organization" element={<OrganizationReport />} />
        <Route path="/schedule" element={<ScheduleView />} />
        <Route path="/documents" element={<ScheduleTab />} />
        <Route path="*" element={<Navigate to="/new/page5/calendar" replace />} />
      </Routes>
    </ApolloProvider>
  );
};

export default Page5; 