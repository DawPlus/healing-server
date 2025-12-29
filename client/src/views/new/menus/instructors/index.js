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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid,
  Tabs,
  Tab,
  Divider
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

const Instructors = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '기타소득',
    payment_rate: 200000,
    tax_rate: 0.088,
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

  const instructors = data?.instructors || [];

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setTabValue(0);
    setFormData({
      name: '',
      type: '기타소득',
      payment_rate: 200000,
      tax_rate: 0.088,
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
      type: '기타소득',
      payment_rate: instructor.payment_rate !== null && instructor.payment_rate !== undefined 
        ? instructor.payment_rate 
        : 200000,
      tax_rate: instructor.tax_rate ? parseFloat((instructor.tax_rate * 100).toFixed(1)) / 100 : 0.088,
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
      // Explicitly check for empty strings to allow setting 0
      updatedValue = value === '' ? 0 : parseInt(value);
      // Don't use the || 0 pattern which treats 0 as falsy and replaces it
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
      if (isEdit && selectedInstructor) {
        await updateInstructor({
          variables: {
            id: selectedInstructor.id,
            input: formData
          }
        });
      } else {
        await createInstructor({
          variables: {
            input: formData
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
    if (window.confirm('강사를 삭제하시겠습니까?')) {
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
    <MainCard title="강사 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            강사 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="강사 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">이름</TableCell>
                <TableCell align="center">유형</TableCell>
                <TableCell align="center">지급금액</TableCell>
                <TableCell align="center">세금율</TableCell>
                <TableCell align="center">전문분야</TableCell>
                <TableCell align="center">연락처</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    등록된 강사가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                instructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell align="center">{instructor.id}</TableCell>
                    <TableCell align="center">{instructor.name}</TableCell>
                    <TableCell align="center">{instructor.type || '기타소득'}</TableCell>
                    <TableCell align="center">{instructor.payment_rate !== null && instructor.payment_rate !== undefined ? `${instructor.payment_rate.toLocaleString()}원` : '0원'}</TableCell>
                    <TableCell align="center">{(instructor.tax_rate * 100).toFixed(1)}%</TableCell>
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
        <DialogTitle>{isEdit ? '강사 수정' : '강사 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="강사 정보 탭">
              <Tab label="기본 정보" />
              <Tab label="추가 정보" />
              <Tab label="정산 정보" />
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="instructor-type-label">유형</InputLabel>
                  <Select
                    labelId="instructor-type-label"
                    name="type"
                    value={formData.type}
                    label="유형"
                    onChange={handleChange}
                  >
                    <MenuItem value="기타소득">기타소득</MenuItem>
                  </Select>
                </FormControl>
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

          {tabValue === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="지급 금액"
                  name="payment_rate"
                  value={formData.payment_rate}
                  onChange={handleChange}
                  type="number"
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">원</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0, // Allow values starting from 0
                    step: 1000 // Allow increments in thousands
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="세금율 (%)"
                  name="tax_rate"
                  type="number"
                  value={parseFloat((formData.tax_rate * 100).toFixed(1))}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      tax_rate: parseFloat((value / 100).toFixed(3))
                    });
                  }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="계좌 정보"
                  name="bank_info"
                  value={formData.bank_info}
                  onChange={handleChange}
                  margin="normal"
                  placeholder="예: 신한은행 110-123-456789 홍길동"
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

export default Instructors; 