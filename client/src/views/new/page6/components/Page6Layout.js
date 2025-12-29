import React from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

// 탭 메뉴 구성
const tabs = [
  { value: 'schedule', label: '프로그램 일정표', path: '/new/page6/schedule' },
  { value: 'room-assignment', label: '식사/숙소 현황', path: '/new/page6/room-assignment' },
  { value: 'implementation-plan', label: '시행계획', path: '/new/page6/implementation-plan' },
  { value: 'inspection', label: '견적서', path: '/new/page5/inspection/excel?layout=page6' },
  { value: 'order-report', label: '수주 보고서', path: '/new/page5/order-report/organization' },
  { value: 'usage-report', label: '이용내역서', path: '/new/page6/usage-report' },
];

const Page6Layout = ({ title, icon, children, activeTab }) => {
  const location = useLocation();
  
  // 현재 경로에 따라 활성 탭 결정
  const currentTab = tabs.find(tab => {
    // For paths with query parameters, compare the base path
    const tabBasePath = tab.path.split('?')[0];
    const currentBasePath = location.pathname;
    
    // Special case for inspection tab with query params
    if (tab.value === 'inspection' && currentBasePath.includes('/inspection/excel')) {
      return true;
    }
    
    return currentBasePath === tabBasePath;
  })?.value || activeTab || 'schedule';
  
  return (
    <MainCard>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Typography variant="h3" component="h1">
            {title}
          </Typography>
        </Box>
        
        <Paper>
          <Tabs
            value={currentTab}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map(tab => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                component={Link}
                to={tab.path}
              />
            ))}
          </Tabs>
        </Paper>
      </Box>
      
      {children}
    </MainCard>
  );
};

export default Page6Layout; 