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
const GET_ASSISTANT_INSTRUCTORS = gql`
  query AssistantInstructors {
    assistantInstructors {
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

const CREATE_ASSISTANT_INSTRUCTOR = gql`
  mutation CreateAssistantInstructor($input: AssistantInstructorInput!) {
    createAssistantInstructor(input: $input) {
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

const UPDATE_ASSISTANT_INSTRUCTOR = gql`
  mutation UpdateAssistantInstructor($id: Int!, $input: AssistantInstructorInput!) {
    updateAssistantInstructor(id: $id, input: $input) {
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

const DELETE_ASSISTANT_INSTRUCTOR = gql`
  mutation DeleteAssistantInstructor($id: Int!) {
    deleteAssistantInstructor(id: $id)
  }
`;

const AssistantInstructors = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAssistantInstructor, setSelectedAssistantInstructor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    description: '',
    payment_rate: 60000 // Default 60,000 won
  });

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_ASSISTANT_INSTRUCTORS);
  const [createAssistantInstructor] = useMutation(CREATE_ASSISTANT_INSTRUCTOR);
  const [updateAssistantInstructor] = useMutation(UPDATE_ASSISTANT_INSTRUCTOR);
  const [deleteAssistantInstructor] = useMutation(DELETE_ASSISTANT_INSTRUCTOR);

  const assistantInstructors = data?.assistantInstructors || [];

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
      payment_rate: 60000 // Default 60,000 won
    });
  };

  const handleEdit = (assistantInstructor) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedAssistantInstructor(assistantInstructor);
    setFormData({
      name: assistantInstructor.name,
      specialty: assistantInstructor.specialty || '',
      phone: assistantInstructor.phone || '',
      email: assistantInstructor.email || '',
      description: assistantInstructor.description || '',
      payment_rate: assistantInstructor.payment_rate || 60000
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
      if (isEdit && selectedAssistantInstructor) {
        await updateAssistantInstructor({
          variables: {
            id: selectedAssistantInstructor.id,
            input: formData
          }
        });
      } else {
        await createAssistantInstructor({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving assistant instructor:', error);
    }
  };

  // Handle assistant instructor deletion
  const handleDelete = async (id) => {
    if (window.confirm('보조강사를 삭제하시겠습니까?')) {
      try {
        await deleteAssistantInstructor({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting assistant instructor:', error);
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <MainCard title="보조강사 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            보조강사 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="보조강사 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">이름</TableCell>
                <TableCell align="center">전문 분야</TableCell>
                <TableCell align="center">강사비</TableCell>
                <TableCell align="center">연락처</TableCell>
                <TableCell align="center">이메일</TableCell>
                <TableCell align="center">설명</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assistantInstructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    등록된 보조강사가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                assistantInstructors.map((assistantInstructor) => (
                  <TableRow key={assistantInstructor.id}>
                    <TableCell align="center">{assistantInstructor.id}</TableCell>
                    <TableCell align="center">{assistantInstructor.name}</TableCell>
                    <TableCell align="center">{assistantInstructor.specialty || '-'}</TableCell>
                    <TableCell align="center">{(assistantInstructor.payment_rate || 60000).toLocaleString()}원</TableCell>
                    <TableCell align="center">{assistantInstructor.phone || '-'}</TableCell>
                    <TableCell align="center">{assistantInstructor.email || '-'}</TableCell>
                    <TableCell align="center">
                      {assistantInstructor.description 
                        ? assistantInstructor.description.length > 30 
                          ? `${assistantInstructor.description.substring(0, 30)}...` 
                          : assistantInstructor.description 
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(assistantInstructor)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(assistantInstructor.id)}
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
        <DialogTitle>{isEdit ? '보조강사 수정' : '보조강사 추가'}</DialogTitle>
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
                label="강사비"
                name="payment_rate"
                type="number"
                value={formData.payment_rate}
                onChange={handleChange}
                InputProps={{
                  readOnly: true,
                  endAdornment: <InputAdornment position="end">원</InputAdornment>
                }}
                margin="dense"
                helperText="보조강사비는 고정 60,000원입니다 (공제 없음)"
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

export default AssistantInstructors; 