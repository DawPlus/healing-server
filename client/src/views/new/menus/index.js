import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { ApolloProvider } from '@apollo/client';
import apolloClient from 'utils/apolloClient';

// Icons
import CategoryIcon from '@mui/icons-material/Category';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlaceIcon from '@mui/icons-material/Place';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

// Menu components
import ProgramCategories from './categories';
import ProgramItems from './programs';
import LocationCategories from './locationCategories';
import Locations from './locations';
import Instructors from './instructors';
import Rooms from './rooms';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box pt={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Custom Tab with Icon
function IconTab(props) {
  const { icon, label, ...other } = props;
  return (
    <Tab
      icon={icon}
      label={label}
      {...other}
      sx={{
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'left',
        p: 2,
        '& .MuiTab-iconWrapper': {
          marginRight: 1,
          marginBottom: '0 !important'
        }
      }}
    />
  );
}

const MenusManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ApolloProvider client={apolloClient}>
      <Box>
        <Box mb={2}>
          <Typography variant="h2" gutterBottom>
            메뉴 관리
          </Typography>
          <Typography variant="body1" color="textSecondary">
            프로그램, 장소, 강사 등의 시스템 데이터를 관리합니다.
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="메뉴 관리 탭"
          >
            <IconTab icon={<CategoryIcon />} label="프로그램 카테고리" id="menu-tab-0" aria-controls="menu-tabpanel-0" />
            <IconTab icon={<ListAltIcon />} label="프로그램" id="menu-tab-1" aria-controls="menu-tabpanel-1" />
            <IconTab icon={<PlaceIcon />} label="장소 카테고리" id="menu-tab-2" aria-controls="menu-tabpanel-2" />
            <IconTab icon={<RoomIcon />} label="장소" id="menu-tab-3" aria-controls="menu-tabpanel-3" />
            <IconTab icon={<PersonIcon />} label="강사 관리" id="menu-tab-4" aria-controls="menu-tabpanel-4" />
            <IconTab icon={<MeetingRoomIcon />} label="객실 관리" id="menu-tab-5" aria-controls="menu-tabpanel-5" />
          </Tabs>
        </Box>
        
        <TabPanel value={currentTab} index={0}>
          <ProgramCategories />
        </TabPanel>
        
        <TabPanel value={currentTab} index={1}>
          <ProgramItems />
        </TabPanel>
        
        <TabPanel value={currentTab} index={2}>
          {/* Placeholder for future implementation */}
          <Box p={3} textAlign="center">
            <Typography variant="h4" color="textSecondary">장소 카테고리 관리 기능은 준비 중입니다.</Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={currentTab} index={3}>
          {/* Placeholder for future implementation */}
          <Box p={3} textAlign="center">
            <Typography variant="h4" color="textSecondary">장소 관리 기능은 준비 중입니다.</Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={currentTab} index={4}>
          {/* Placeholder for future implementation */}
          <Box p={3} textAlign="center">
            <Typography variant="h4" color="textSecondary">강사 관리 기능은 준비 중입니다.</Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={currentTab} index={5}>
          {/* Placeholder for future implementation */}
          <Box p={3} textAlign="center">
            <Typography variant="h4" color="textSecondary">객실 관리 기능은 준비 중입니다.</Typography>
          </Box>
        </TabPanel>
      </Box>
    </ApolloProvider>
  );
};

export default MenusManagement; 