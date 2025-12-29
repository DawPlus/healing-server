import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TableChartIcon from '@mui/icons-material/TableChart';

// Tabs menu for Page5 navigation
const TabsMenu = ({ activeTab }) => {
  const theme = useTheme();
  const location = useLocation();
  
  const tabs = [
    { 
      label: '예약 캘린더', 
      icon: <CalendarTodayIcon fontSize="small" />, 
      value: 'calendar', 
      path: '/new/page5/calendar' 
    },
    { 
      label: '예약 목록', 
      icon: <ListAltIcon fontSize="small" />, 
      value: 'list', 
      path: '/new/page5/list' 
    },
    { 
      label: '예약종합현황', 
      icon: <TableChartIcon fontSize="small" />, 
      value: 'status', 
      path: '/new/page5/status' 
    },
    { 
      label: '주간 일정', 
      icon: <EventNoteIcon fontSize="small" />, 
      value: 'weekly-schedule', 
      path: '/new/page6/weekly-schedule' 
    },
    { 
      label: '이용실적(매출)', 
      icon: <ReceiptIcon fontSize="small" />, 
      value: 'usage-report', 
      path: '/new/page5/order-report' 
    },
    { 
      label: '강사비 정산', 
      icon: <MonetizationOnIcon fontSize="small" />, 
      value: 'instructor-payment', 
      path: '/new/page6/instructor-payment'
    },
  ];
  
  // Determine current tab value from pathname
  const getCurrentTabValue = () => {
    const path = location.pathname;
    const matchingTab = tabs.find(tab => path.includes(tab.value));
    return matchingTab ? matchingTab.value : 'list';
  };
  
  return (
    <Box sx={{ 
      width: '100%', 
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
      mb: 3
    }}>
      <Tabs
        value={activeTab || getCurrentTabValue()}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Page5 navigation tabs"
        sx={{
          '& .MuiTab-root': {
            minHeight: '48px',
            textTransform: 'none',
            fontWeight: theme.typography.fontWeightMedium,
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                <span>{tab.label}</span>
              </Box>
            }
            value={tab.value}
            component={Link}
            to={tab.path}
          />
        ))}
      </Tabs>
    </Box>
  );
};

TabsMenu.propTypes = {
  activeTab: PropTypes.string
};

export default TabsMenu; 