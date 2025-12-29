import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  Tabs,
  Tab,
} from '@mui/material';

// Components
import PricingTab from './PricingTab';
import CustomerInfoTab from './CustomerInfoTab';
import AdminSettingsTab from './AdminSettingsTab';
import StatisticsTab from './StatisticsTab';

// 탭 패널 컴포넌트
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const New7View = () => {
  // 탭 상태
  const [tabValue, setTabValue] = useState(0);
  
  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              기능 구현 - 가격 및 설정 관리
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              SFR-007: 상품 가격 설정, 강사비 설정, 민원사항 항목 추가, 입력마감 통계 추가 기능 구현
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
                <Tab label="상품 가격 설정" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="강사비 설정" id="tab-1" aria-controls="tabpanel-1" />
                <Tab label="민원사항 항목 추가" id="tab-2" aria-controls="tabpanel-2" />
                <Tab label="입력마감 통계 추가" id="tab-3" aria-controls="tabpanel-3" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <PricingTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <CustomerInfoTab />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <AdminSettingsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <StatisticsTab />
            </TabPanel>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default New7View; 