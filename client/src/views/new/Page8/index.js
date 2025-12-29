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
import SettingsTab from './SettingsTab';
import PerformanceTab from './PerformanceTab';

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

const New8View = () => {
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
              실적관리시스템
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              SFR-009 & SFR-010: 설문관리, 결과 입력사항 변경, 운영통계 검색 및 만족도/효과평가 결과 검색 기능 구현
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
                <Tab label="실적관리시스템 설정" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="운영통계 검색 및 결과 분석" id="tab-1" aria-controls="tabpanel-1" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <SettingsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <PerformanceTab />
            </TabPanel>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default New8View; 