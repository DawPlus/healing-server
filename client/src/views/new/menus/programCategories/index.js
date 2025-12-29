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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
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
import FilterListIcon from '@mui/icons-material/FilterList';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// ====================== GraphQL Queries and Mutations ======================
// Program Categories
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

// Program Items
const GET_PROGRAM_ITEMS = gql`
  query ProgramItems {
    programItems {
      id
      program_name
      category_id
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

const CREATE_PROGRAM_ITEM = gql`
  mutation CreateProgramItem($input: ProgramItemInput!) {
    createProgramItem(input: $input) {
      id
      program_name
      category_id
      description
      display_order
    }
  }
`;

const UPDATE_PROGRAM_ITEM = gql`
  mutation UpdateProgramItem($id: Int!, $input: ProgramItemInput!) {
    updateProgramItem(id: $id, input: $input) {
      id
      program_name
      category_id
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

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`program-tabpanel-${index}`}
      aria-labelledby={`program-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `program-tab-${index}`,
    'aria-controls': `program-tabpanel-${index}`,
  };
}

const ProgramManagement = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <MainCard title="프로그램 관리" content={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="프로그램 관리 탭">
          <Tab label="프로그램 카테고리" {...a11yProps(0)} />
          <Tab label="프로그램 항목" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <ProgramCategories />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <ProgramItems />
      </TabPanel>
    </MainCard>
  );
};

// Program Categories Component
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
      console.error('Error saving program category:', error);
    }
  };

  // Handle category deletion
  const handleDelete = async (id) => {
    if (window.confirm('프로그램 카테고리를 삭제하시겠습니까? 관련된 모든 프로그램이 함께 삭제됩니다.')) {
      try {
        await deleteProgramCategory({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting program category:', error);
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
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
            rows={4}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            취소
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={!formData.category_name}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </CardContent>
  );
};

// Program Items Component
const ProgramItems = () => {
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    program_name: '',
    category_id: '',
    description: '',
    display_order: 0
  });

  // Filter state
  const [filterCategory, setFilterCategory] = useState('');

  // GraphQL hooks
  const { loading: itemsLoading, error: itemsError, data: itemsData, refetch } = useQuery(GET_PROGRAM_ITEMS);
  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_PROGRAM_CATEGORIES);
  const [createProgramItem] = useMutation(CREATE_PROGRAM_ITEM);
  const [updateProgramItem] = useMutation(UPDATE_PROGRAM_ITEM);
  const [deleteProgramItem] = useMutation(DELETE_PROGRAM_ITEM);

  const items = itemsData?.programItems || [];
  const categories = categoriesData?.programCategories || [];

  // Filter items based on selected category
  const filteredItems = filterCategory 
    ? items.filter(item => item.category_id === parseInt(filterCategory))
    : items;

  // Helper function to get category name by category_id
  const getCategoryName = (categoryId) => {
    if (!categoryId) return '-';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.category_name : '-';
  };

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      program_name: '',
      category_id: '',
      description: '',
      display_order: 0
    });
  };

  const handleEdit = (item) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedItem(item);
    setFormData({
      program_name: item.program_name,
      category_id: item.category_id || '',
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
      const input = {
        ...formData,
        category_id: parseInt(formData.category_id, 10)
      };
      
      if (isEdit && selectedItem) {
        await updateProgramItem({
          variables: {
            id: selectedItem.id,
            input
          }
        });
      } else {
        await createProgramItem({
          variables: {
            input
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
    if (window.confirm('프로그램 항목을 삭제하시겠습니까?')) {
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
        <Table sx={{ minWidth: 650 }} aria-label="프로그램 항목 테이블">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">프로그램명</TableCell>
              <TableCell align="center">카테고리</TableCell>
              <TableCell align="center">설명</TableCell>
              <TableCell align="center">표시 순서</TableCell>
              <TableCell align="center">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {filterCategory 
                    ? '선택한 카테고리에 등록된 프로그램이 없습니다.' 
                    : '등록된 프로그램이 없습니다.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell align="center">{item.id}</TableCell>
                  <TableCell align="center">{item.program_name}</TableCell>
                  <TableCell align="center">{getCategoryName(item.category_id)}</TableCell>
                  <TableCell align="center">
                    {item.description 
                      ? item.description.length > 30 
                        ? `${item.description.substring(0, 30)}...` 
                        : item.description 
                      : '-'}
                  </TableCell>
                  <TableCell align="center">{item.display_order}</TableCell>
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? '프로그램 수정' : '프로그램 추가'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={gridSpacing} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="program_name"
                label="프로그램명"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.program_name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-select-label">카테고리</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
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
            
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
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
    </CardContent>
  );
};

export default ProgramManagement; 