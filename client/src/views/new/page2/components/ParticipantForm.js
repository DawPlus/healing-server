import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  TextField,
  Box,
  Paper,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import ElderlyIcon from '@mui/icons-material/Elderly';
import ChildCareIcon from '@mui/icons-material/ChildCare';

// Age groups for selection
const ageGroups = [
  { value: 'elementary', label: '초등학생' },
  { value: 'middle', label: '중학생' },
  { value: 'high', label: '고등학생' },
  { value: 'college', label: '대학생' },
  { value: 'adult', label: '성인' },
  { value: 'senior', label: '어르신' },
  { value: 'mixed', label: '혼합' }
];

// Participant types
const participantTypes = [
  { value: 'student', label: '학생' },
  { value: 'employee', label: '직장인' },
  { value: 'family', label: '가족' },
  { value: 'community', label: '지역사회' },
  { value: 'mixed', label: '혼합' },
  { value: 'other', label: '기타' }
];

const ParticipantForm = ({ formData, handleFieldChange }) => {
  const theme = useTheme();

  // Calculate total count when male or female count changes
  useEffect(() => {
    const maleCount = parseInt(formData.male_count || 0, 10);
    const femaleCount = parseInt(formData.female_count || 0, 10);
    const totalCount = maleCount + femaleCount;
    
    if (!isNaN(totalCount)) {
      handleFieldChange('total_count', totalCount.toString());
    }
  }, [formData.male_count, formData.female_count, handleFieldChange]);

  // Calculate total leader count
  useEffect(() => {
    const maleLeaderCount = parseInt(formData.male_leader_count || 0, 10);
    const femaleLeaderCount = parseInt(formData.female_leader_count || 0, 10);
    const totalLeaderCount = maleLeaderCount + femaleLeaderCount;
    
    if (!isNaN(totalLeaderCount)) {
      handleFieldChange('total_leader_count', totalLeaderCount.toString());
    }
  }, [formData.male_leader_count, formData.female_leader_count, handleFieldChange]);

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PeopleIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">참여자 인원</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="남성 참여자 수"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: <ManIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />,
              inputProps: { min: 0 }
            }}
            value={formData.male_count || ''}
            onChange={(e) => handleFieldChange('male_count', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="여성 참여자 수"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: <WomanIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />,
              inputProps: { min: 0 }
            }}
            value={formData.female_count || ''}
            onChange={(e) => handleFieldChange('female_count', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="총 참여자 수"
            variant="outlined"
            InputProps={{
              startAdornment: <PeopleIcon fontSize="small" sx={{ mr: 1 }} />,
              readOnly: true
            }}
            value={`${formData.total_count || 0}명`}
            sx={{ bgcolor: theme.palette.action.hover }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
        <SupervisorAccountIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">인솔자 인원</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="남성 인솔자 수"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: <ManIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />,
              inputProps: { min: 0 }
            }}
            value={formData.male_leader_count || ''}
            onChange={(e) => handleFieldChange('male_leader_count', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="여성 인솔자 수"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: <WomanIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />,
              inputProps: { min: 0 }
            }}
            value={formData.female_leader_count || ''}
            onChange={(e) => handleFieldChange('female_leader_count', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="총 인솔자 수"
            variant="outlined"
            InputProps={{
              startAdornment: <SupervisorAccountIcon fontSize="small" sx={{ mr: 1 }} />,
              readOnly: true
            }}
            value={`${formData.total_leader_count || 0}명`}
            sx={{ bgcolor: theme.palette.action.hover }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ParticipantForm; 