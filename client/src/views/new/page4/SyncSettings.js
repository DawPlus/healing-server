import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

const SyncSettings = ({ settings, onToggle }) => {
  if (!settings || settings.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <SyncIcon sx={{ mr: 1 }} />
            <Typography variant="h4">문서 연동 설정</Typography>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {settings.map((setting) => (
            <Grid item xs={12} sm={6} md={4} key={setting.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={setting.enabled}
                    onChange={() => onToggle(setting.id)}
                  />
                }
                label={setting.name || '문서 연동'}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SyncSettings; 