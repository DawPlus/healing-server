import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// GraphQL queries and mutations
const GET_PROGRAM_CATEGORIES = gql`
  query ProgramCategories {
    programCategories {
      id
      category_name
      description
      display_order
      created_at
      updated_at
    }
  }
`;

const CREATE_PROGRAM_CATEGORY = gql`
  mutation CreateProgramCategory($input: ProgramCategoryInput!) {
    createProgramCategory(input: $input) {
      id
      category_name
      description
      display_order
    }
  }
`;

const UPDATE_PROGRAM_CATEGORY = gql`
  mutation UpdateProgramCategory($id: Int!, $input: ProgramCategoryInput!) {
    updateProgramCategory(id: $id, input: $input) {
      id
      category_name
      description
      display_order
    }
  }
`;

const DELETE_PROGRAM_CATEGORY = gql`
  mutation DeleteProgramCategory($id: Int!) {
    deleteProgramCategory(id: $id)
  }
`;

const ProgramCategories = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: '',
    display_order: 0
  });

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_PROGRAM_CATEGORIES);
  const [createProgramCategory] = useMutation(CREATE_PROGRAM_CATEGORY);
  const [updateProgramCategory] = useMutation(UPDATE_PROGRAM_CATEGORY);
  const [deleteProgramCategory] = useMutation(DELETE_PROGRAM_CATEGORY);

  const categories = data?.programCategories || [];

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      category_name: '',
      description: '',
      display_order: 0
    });
  };

  const handleEdit = (category) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description || '',
      display_order: category.display_order || 0
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
      [name]: name === 'display_order' ? parseInt(value, 10) || 0 : value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (isEdit && selectedCategory) {
        await updateProgramCategory({
          variables: {
            id: selectedCategory.id,
            input: formData
          }
        });
      } else {
        await createProgramCategory({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Handle category deletion
  const handleDelete = async (id) => {
    if (window.confirm('카테고리를 삭제하시겠습니까? 관련된 모든 프로그램이 함께 삭제됩니다.')) {
      try {
        await deleteProgramCategory({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <MainCard title="프로그램 카테고리 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            카테고리 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="프로그램 카테고리 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">카테고리명</TableCell>
                <TableCell align="center">설명</TableCell>
                <TableCell align="center">표시 순서</TableCell>
                <TableCell align="center">생성일</TableCell>
                <TableCell align="center">수정일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    등록된 카테고리가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell align="center">{category.id}</TableCell>
                    <TableCell align="center">{category.category_name}</TableCell>
                    <TableCell align="center">{category.description || '-'}</TableCell>
                    <TableCell align="center">{category.display_order}</TableCell>
                    <TableCell align="center">
                      {new Date(category.created_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(category.updated_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(category.id)}
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? '카테고리 수정' : '카테고리 추가'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="category_name"
            label="카테고리명"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.category_name}
            onChange={handleChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
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
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="display_order"
            label="표시 순서"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.display_order}
            onChange={handleChange}
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default ProgramCategories; 