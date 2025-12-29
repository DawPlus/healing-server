import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Card,
  CardContent,
  Slider,
  Chip,
  Rating,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FaceIcon from '@mui/icons-material/Face';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import ElderlyIcon from '@mui/icons-material/Elderly';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InfoIcon from '@mui/icons-material/Info';

// Group types
const groupTypes = [
  { value: 'individual', label: '개인', icon: <PersonSearchIcon /> },
  { value: 'family', label: '가족', icon: <PeopleAltIcon /> },
  { value: 'school', label: '학교', icon: <SchoolIcon /> },
  { value: 'company', label: '기업', icon: <WorkIcon /> },
  { value: 'community', label: '지역사회', icon: <EmojiPeopleIcon /> },
  { value: 'mixed', label: '혼합', icon: <AccessibilityNewIcon /> }
];

const AgeGroupForm = ({ formData, handleFieldChange }) => {
  const theme = useTheme();
  const [showAgeRange, setShowAgeRange] = useState(false);
  const [ageRange, setAgeRange] = useState([20, 60]);

  const handleAgeRangeChange = (event, newValue) => {
    setAgeRange(newValue);
    handleFieldChange('age_min', newValue[0]);
    handleFieldChange('age_max', newValue[1]);
  };

  const handleSatisfactionChange = (event, newValue) => {
    handleFieldChange('satisfaction_rating', newValue);
  };

  // Calculate total from all age groups
  const calculateTotal = () => {
    const infant = parseInt(formData.infant_count || 0);
    const elementary = parseInt(formData.elementary_count || 0);
    const middle = parseInt(formData.middle_count || 0);
    const high = parseInt(formData.high_count || 0);
    const adult = parseInt(formData.adult_count || 0);
    const elderly = parseInt(formData.elderly_count || 0);
    
    return infant + elementary + middle + high + adult + elderly;
  };
  
  // Update total whenever any age group changes
  useEffect(() => {
    const total = calculateTotal();
    handleFieldChange('age_group_total', total);
  }, [
    formData.infant_count,
    formData.elementary_count,
    formData.middle_count,
    formData.high_count,
    formData.adult_count,
    formData.elderly_count
  ]);

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PeopleAltIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">연령대</Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 2 }}
        >
    
          <Typography variant="body2">
            - 총인원(참여자+인솔자)와 연령대 총인원 동일하게, 틀리면 경고 및 저장안됨
          </Typography>
        </Alert>
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="age group table">
          <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
            <TableRow>
              <TableCell align="center">유아</TableCell>
              <TableCell align="center">초등</TableCell>
              <TableCell align="center">중등</TableCell>
              <TableCell align="center">고등</TableCell>
              <TableCell align="center">성인</TableCell>
              <TableCell align="center">노인</TableCell>
              <TableCell align="center">총인원</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formData.infant_count || 0}
                  onChange={(e) => handleFieldChange('infant_count', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formData.elementary_count || 0}
                  onChange={(e) => handleFieldChange('elementary_count', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formData.middle_count || 0}
                  onChange={(e) => handleFieldChange('middle_count', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formData.high_count || 0}
                  onChange={(e) => handleFieldChange('high_count', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formData.adult_count || 0}
                  onChange={(e) => handleFieldChange('adult_count', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formData.elderly_count || 0}
                  onChange={(e) => handleFieldChange('elderly_count', parseInt(e.target.value) || 0)}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {calculateTotal()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AgeGroupForm; 