import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from 'ui-component/cards/MainCard';

// GraphQL queries and mutations
const GET_HELPERS = gql`
  query Helpers {
    helpers {
      id
      name
      specialty
      phone
      email
      description
      payment_rate
      created_at
      updated_at
    }
  }
`;

const CREATE_HELPER = gql`
  mutation CreateHelper($input: HelperInput!) {
    createHelper(input: $input) {
      id
      name
      specialty
      phone
      email
      description
      payment_rate
    }
  }
`;

const UPDATE_HELPER = gql`
  mutation UpdateHelper($id: Int!, $input: HelperInput!) {
    updateHelper(id: $id, input: $input) {
      id
      name
      specialty
      phone
      email
      description
      payment_rate
    }
  }
`;

const DELETE_HELPER = gql`
  mutation DeleteHelper($id: Int!) {
    deleteHelper(id: $id)
  }
`;

const Helpers = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    description: '',
    payment_rate: 50000 // Default 50,000 won
  });

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_HELPERS);
  const [createHelper] = useMutation(CREATE_HELPER);
  const [updateHelper] = useMutation(UPDATE_HELPER);
  const [deleteHelper] = useMutation(DELETE_HELPER);

  const helpers = data?.helpers || [];

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      description: '',
      payment_rate: 50000 // Default 50,000 won
    });
  };

  const handleEdit = (helper) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedHelper(helper);
    setFormData({
      name: helper.name,
      specialty: helper.specialty || '',
      phone: helper.phone || '',
      email: helper.email || '',
      description: helper.description || '',
      payment_rate: helper.payment_rate || 50000
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (isEdit && selectedHelper) {
        await updateHelper({
          variables: {
            id: selectedHelper.id,
            input: formData
          }
        });
      } else {
        await createHelper({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving helper:', error);
    }
  };

  // Handle helper deletion
  const handleDelete = async (id) => {
    if (window.confirm('도우미를 삭제하시겠습니까?')) {
      try {
        await deleteHelper({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting helper:', error);
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <MainCard title="힐링헬퍼 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            힐링헬퍼 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="도우미 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">이름</TableCell>
                <TableCell align="center">전문 분야</TableCell>
                <TableCell align="center">활동비</TableCell>
                <TableCell align="center">연락처</TableCell>
                <TableCell align="center">이메일</TableCell>
                <TableCell align="center">설명</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {helpers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    등록된 힐링헬퍼가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                helpers.map((helper) => (
                  <TableRow key={helper.id}>
                    <TableCell align="center">{helper.id}</TableCell>
                    <TableCell align="center">{helper.name}</TableCell>
                    <TableCell align="center">{helper.specialty || '-'}</TableCell>
                    <TableCell align="center">{(helper.payment_rate || 50000).toLocaleString()}원</TableCell>
                    <TableCell align="center">{helper.phone || '-'}</TableCell>
                    <TableCell align="center">{helper.email || '-'}</TableCell>
                    <TableCell align="center">
                      {helper.description 
                        ? helper.description.length > 30 
                          ? `${helper.description.substring(0, 30)}...` 
                          : helper.description 
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(helper)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(helper.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? '힐링헬퍼 수정' : '힐링헬퍼 추가'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                required
                fullWidth
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="활동비"
                name="payment_rate"
                type="number"
                value={formData.payment_rate}
                onChange={handleChange}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
                margin="dense"
                helperText="힐링헬퍼 활동비는 고정 50,000원입니다 (공제 없음)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="specialty"
                label="전문 분야"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.specialty}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="phone"
                label="연락처"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="이메일"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="설명"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            취소
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={!formData.name}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Helpers; 