import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const DetailDialog = ({ open, onClose, data, onPrint }) => {
  if (!data) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 4,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {data.group_name} 상세 정보
        </Typography>
        <Button 
          variant="text" 
          color="inherit" 
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          닫기
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 기본 정보 섹션 */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} /> 기본 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">단체명</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>{data.group_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">프로그램</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{data.program || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">시작일</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{data.start_date}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">종료일</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{data.end_date}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">참가자 수</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{data.participants}명</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">상태</Typography>
                  <Chip 
                    label={data.status || "확정"} 
                    color="success" 
                    size="small" 
                    sx={{ fontWeight: 'medium' }} 
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
          
          {/* 담당자 정보 */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} /> 담당자 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">담당자 이름</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>{data.contact_name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">직책</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{data.contact_position || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>{data.contact_phone || '-'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ mb: 1 }}>{data.contact_email || '-'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 배정 정보 */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <HotelIcon sx={{ mr: 1 }} /> 배정 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">숙소 배정</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <HotelIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{data.room_assignment || '-'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">식사 계획</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <RestaurantIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">{data.meal_plan || '-'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 프로그램 정보 */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} /> 프로그램 상세
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {data.program_details || '프로그램 상세 정보가 없습니다.'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PrintIcon />}
          onClick={onPrint}
        >
          출력
        </Button>
        <Button 
          variant="outlined" 
          onClick={onClose}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog; 