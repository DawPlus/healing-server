import React, { useState, useMemo } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from 'ui-component/cards/MainCard';

// GraphQL queries and mutations
const GET_INSTRUCTORS = gql`
  query Instructors {
    instructors {
      id
      name
      type
      category
      payment_rate
      tax_rate
      specialty
      phone
      email
      description
      bank_info
      address
      contact
      notes
      created_at
      updated_at
    }
  }
`;

const CREATE_INSTRUCTOR = gql`
  mutation CreateInstructor($input: InstructorInput!) {
    createInstructor(input: $input) {
      id
      name
      type
      category
      payment_rate
      tax_rate
      specialty
      phone
      email
      description
      bank_info
      address
      contact
      notes
    }
  }
`;

const UPDATE_INSTRUCTOR = gql`
  mutation UpdateInstructor($id: Int!, $input: InstructorInput!) {
    updateInstructor(id: $id, input: $input) {
      id
      name
      type
      category
      payment_rate
      tax_rate
      specialty
      phone
      email
      description
      bank_info
      address
      contact
      notes
    }
  }
`;

const DELETE_INSTRUCTOR = gql`
  mutation DeleteInstructor($id: Int!) {
    deleteInstructor(id: $id)
  }
`;

const InternalInstructors = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '내부',
    category: '강사',
    payment_rate: 0,
    tax_rate: 0,
    specialty: '',
    phone: '',
    email: '',
    description: '',
    bank_info: '',
    address: '',
    contact: '',
    notes: ''
  });

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_INSTRUCTORS);
  const [createInstructor] = useMutation(CREATE_INSTRUCTOR);
  const [updateInstructor] = useMutation(UPDATE_INSTRUCTOR);
  const [deleteInstructor] = useMutation(DELETE_INSTRUCTOR);

  // 내부강사 필터링: type이 '내부'이거나 category가 '강사'이고 type이 '내부'인 경우
  const internalInstructors = useMemo(() => {
    if (!data?.instructors) return [];
    return data.instructors.filter(instructor => {
      // type이 '내부'이거나, category가 '강사'이고 type이 '내부'인 경우
      return instructor.type === '내부' || 
        (instructor.category === '강사' && instructor.type === '내부');
    });
  }, [data]);

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setTabValue(0);
    setFormData({
      name: '',
      type: '내부',
      category: '강사',
      payment_rate: 0,
      tax_rate: 0,
      specialty: '',
      phone: '',
      email: '',
      description: '',
      bank_info: '',
      address: '',
      contact: '',
      notes: ''
    });
  };

  const handleEdit = (instructor) => {
    setOpen(true);
    setIsEdit(true);
    setTabValue(0);
    setSelectedInstructor(instructor);
    setFormData({
      name: instructor.name,
      type: instructor.type || '내부',
      category: instructor.category || '강사',
      payment_rate: instructor.payment_rate !== null && instructor.payment_rate !== undefined 
        ? instructor.payment_rate 
        : 0,
      tax_rate: instructor.tax_rate ? parseFloat((instructor.tax_rate * 100).toFixed(1)) / 100 : 0,
      specialty: instructor.specialty || '',
      phone: instructor.phone || '',
      email: instructor.email || '',
      description: instructor.description || '',
      bank_info: instructor.bank_info || '',
      address: instructor.address || '',
      contact: instructor.contact || '',
      notes: instructor.notes || ''
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // 숫자 필드의 경우 숫자로 변환
    if (name === 'payment_rate') {
      updatedValue = value === '' ? 0 : parseInt(value);
    } else if (name === 'tax_rate') {
      updatedValue = parseFloat(value) || 0;
    }

    setFormData({
      ...formData,
      [name]: updatedValue
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // 내부강사로 설정
      const submitData = {
        ...formData,
        type: '내부',
        category: '강사'
      };
      
      if (isEdit && selectedInstructor) {
        await updateInstructor({
          variables: {
            id: selectedInstructor.id,
            input: submitData
          }
        });
      } else {
        await createInstructor({
          variables: {
            input: submitData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving instructor:', error);
    }
  };

  // Handle instructor deletion
  const handleDelete = async (id) => {
    if (window.confirm('내부강사를 삭제하시겠습니까?')) {
      try {
        await deleteInstructor({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting instructor:', error);
      }
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <MainCard title="내부강사 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            내부강사 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="내부강사 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">이름</TableCell>
                <TableCell align="center">유형</TableCell>
                <TableCell align="center">전문분야</TableCell>
                <TableCell align="center">연락처</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {internalInstructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    등록된 내부강사가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                internalInstructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell align="center">{instructor.id}</TableCell>
                    <TableCell align="center">{instructor.name}</TableCell>
                    <TableCell align="center">{instructor.type || '내부'}</TableCell>
                    <TableCell align="center">{instructor.specialty || '-'}</TableCell>
                    <TableCell align="center">{instructor.phone || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(instructor)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(instructor.id)}
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
        <DialogTitle>{isEdit ? '내부강사 수정' : '내부강사 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="내부강사 정보 탭">
              <Tab label="기본 정보" />
              <Tab label="추가 정보" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="전문 분야"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="연락처"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="이메일"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="설명"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="주소"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="비상 연락처"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="기타 참고사항"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name}
          >
            {isEdit ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default InternalInstructors;

