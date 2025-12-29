import React, { useState, useEffect } from 'react';
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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// GraphQL queries and mutations
const GET_PROGRAM_ITEMS = gql`
  query ProgramItems {
    programItems {
      id
      category_id
      program_name
      description
      display_order
      created_at
      updated_at
      category {
        id
        category_name
      }
    }
  }
`;

const GET_PROGRAM_CATEGORIES = gql`
  query ProgramCategories {
    programCategories {
      id
      category_name
    }
  }
`;

const CREATE_PROGRAM_ITEM = gql`
  mutation CreateProgramItem($input: ProgramItemInput!) {
    createProgramItem(input: $input) {
      id
      category_id
      program_name
      description
      display_order
    }
  }
`;

const UPDATE_PROGRAM_ITEM = gql`
  mutation UpdateProgramItem($id: Int!, $input: ProgramItemInput!) {
    updateProgramItem(id: $id, input: $input) {
      id
      category_id
      program_name
      description
      display_order
    }
  }
`;

const DELETE_PROGRAM_ITEM = gql`
  mutation DeleteProgramItem($id: Int!) {
    deleteProgramItem(id: $id)
  }
`;

const ProgramItems = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    program_name: '',
    description: '',
    display_order: 0
  });

  // State for filtering
  const [filterCategory, setFilterCategory] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  // GraphQL hooks
  const { loading: itemsLoading, error: itemsError, data: itemsData, refetch } = useQuery(GET_PROGRAM_ITEMS);
  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_PROGRAM_CATEGORIES);
  
  const [createProgramItem] = useMutation(CREATE_PROGRAM_ITEM);
  const [updateProgramItem] = useMutation(UPDATE_PROGRAM_ITEM);
  const [deleteProgramItem] = useMutation(DELETE_PROGRAM_ITEM);

  const programs = itemsData?.programItems || [];
  const categories = categoriesData?.programCategories || [];

  // Apply filtering
  useEffect(() => {
    if (programs) {
      if (filterCategory) {
        setFilteredItems(programs.filter(item => item.category_id.toString() === filterCategory.toString()));
      } else {
        setFilteredItems(programs);
      }
    }
  }, [programs, filterCategory]);

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      program_name: '',
      description: '',
      display_order: 0
    });
  };

  const handleEdit = (item) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedItem(item);
    setFormData({
      category_id: item.category_id,
      program_name: item.program_name,
      description: item.description || '',
      display_order: item.display_order || 0
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
      if (isEdit && selectedItem) {
        await updateProgramItem({
          variables: {
            id: selectedItem.id,
            input: formData
          }
        });
      } else {
        await createProgramItem({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving program item:', error);
    }
  };

  // Handle item deletion
  const handleDelete = async (id) => {
    if (window.confirm('프로그램을 삭제하시겠습니까?')) {
      try {
        await deleteProgramItem({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting program item:', error);
      }
    }
  };

  if (itemsLoading || categoriesLoading) return <CircularProgress />;
  if (itemsError) return <Typography color="error">Error loading programs: {itemsError.message}</Typography>;
  if (categoriesError) return <Typography color="error">Error loading categories: {categoriesError.message}</Typography>;

  return (
    <MainCard title="프로그램 아이템 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="filter-category-label">카테고리 필터</InputLabel>
            <Select
              labelId="filter-category-label"
              id="filter-category"
              value={filterCategory}
              label="카테고리 필터"
              onChange={(e) => setFilterCategory(e.target.value)}
              startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="">
                <em>전체 보기</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            프로그램 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="프로그램 아이템 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">카테고리</TableCell>
                <TableCell align="center">프로그램명</TableCell>
                <TableCell align="center">설명</TableCell>
                <TableCell align="center">표시 순서</TableCell>
                <TableCell align="center">생성일</TableCell>
                <TableCell align="center">수정일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {filterCategory 
                      ? '선택한 카테고리에 등록된 프로그램이 없습니다.' 
                      : '등록된 프로그램이 없습니다.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell align="center">{item.id}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.category?.category_name || '(없음)'} 
                        color="primary" 
                        variant="outlined" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">{item.program_name}</TableCell>
                    <TableCell align="center">{item.description || '-'}</TableCell>
                    <TableCell align="center">{item.display_order}</TableCell>
                    <TableCell align="center">
                      {new Date(item.created_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell align="center">
                      {new Date(item.updated_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(item.id)}
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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? '프로그램 수정' : '프로그램 추가'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="category-label">카테고리</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              label="카테고리"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            name="program_name"
            label="프로그램명"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.program_name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
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
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.program_name || !formData.category_id}
          >
            {isEdit ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default ProgramItems; 