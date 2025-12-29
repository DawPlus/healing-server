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
const GET_LOCATION_CATEGORIES = gql`
  query LocationCategories {
    locationCategories {
      id
      category_name
      description
      display_order
      created_at
      updated_at
    }
  }
`;

const CREATE_LOCATION_CATEGORY = gql`
  mutation CreateLocationCategory($input: LocationCategoryInput!) {
    createLocationCategory(input: $input) {
      id
      category_name
      description
      display_order
    }
  }
`;

const UPDATE_LOCATION_CATEGORY = gql`
  mutation UpdateLocationCategory($id: Int!, $input: LocationCategoryInput!) {
    updateLocationCategory(id: $id, input: $input) {
      id
      category_name
      description
      display_order
    }
  }
`;

const DELETE_LOCATION_CATEGORY = gql`
  mutation DeleteLocationCategory($id: Int!) {
    deleteLocationCategory(id: $id)
  }
`;

const LocationCategories = () => {
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
  const { loading, error, data, refetch } = useQuery(GET_LOCATION_CATEGORIES);
  const [createLocationCategory] = useMutation(CREATE_LOCATION_CATEGORY);
  const [updateLocationCategory] = useMutation(UPDATE_LOCATION_CATEGORY);
  const [deleteLocationCategory] = useMutation(DELETE_LOCATION_CATEGORY);

  const categories = data?.locationCategories || [];

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
        await updateLocationCategory({
          variables: {
            id: selectedCategory.id,
            input: formData
          }
        });
      } else {
        await createLocationCategory({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving location category:', error);
    }
  };

  // Handle category deletion
  const handleDelete = async (id) => {
    if (window.confirm('장소 카테고리를 삭제하시겠습니까? 관련된 모든 장소가 함께 삭제됩니다.')) {
      try {
        await deleteLocationCategory({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting location category:', error);
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <MainCard title="장소 카테고리 관리" content={false}>
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
          <Table sx={{ minWidth: 650 }} aria-label="장소 카테고리 테이블">
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
            rows={4}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            취소
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default LocationCategories; 