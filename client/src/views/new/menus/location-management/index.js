import React from 'react';
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
  Grid,
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

// ====================== GraphQL Queries and Mutations ======================
// Location Categories
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

// Locations
const GET_LOCATIONS = gql`
  query Locations {
    locations {
      id
      location_name
      category_id
      capacity
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

const CREATE_LOCATION = gql`
  mutation CreateLocation($input: LocationInput!) {
    createLocation(input: $input) {
      id
      location_name
      category_id
      capacity
      description
      display_order
    }
  }
`;

const UPDATE_LOCATION = gql`
  mutation UpdateLocation($id: Int!, $input: LocationInput!) {
    updateLocation(id: $id, input: $input) {
      id
      location_name
      category_id
      capacity
      description
      display_order
    }
  }
`;

const DELETE_LOCATION = gql`
  mutation DeleteLocation($id: Int!) {
    deleteLocation(id: $id)
  }
`;

const LocationManagement = () => {
  return (
    <MainCard title="장소 관리" content={false}>
      <Locations />
    </MainCard>
  );
};

// Locations Component
const Locations = () => {
  // State for form data
  const [open, setOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [formData, setFormData] = React.useState({
    location_name: '',
    category_id: '',
    capacity: '',
    description: '',
    display_order: 0
  });

  // GraphQL hooks
  const { loading: locationsLoading, error: locationsError, data: locationsData, refetch } = useQuery(GET_LOCATIONS);
  const { loading: categoriesLoading, error: categoriesError, data: categoriesData } = useQuery(GET_LOCATION_CATEGORIES);
  const [createLocation] = useMutation(CREATE_LOCATION);
  const [updateLocation] = useMutation(UPDATE_LOCATION);
  const [deleteLocation] = useMutation(DELETE_LOCATION);

  const locations = locationsData?.locations || [];
  const categories = categoriesData?.locationCategories || [];

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      location_name: '',
      category_id: '',
      capacity: '',
      description: '',
      display_order: 0
    });
  };

  const handleEdit = (location) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedLocation(location);
    setFormData({
      location_name: location.location_name,
      category_id: location.category_id || '',
      capacity: location.capacity || '',
      description: location.description || '',
      display_order: location.display_order || 0
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
      [name]: name === 'display_order' || name === 'capacity' 
        ? (value === '' ? '' : parseInt(value, 10) || 0) 
        : value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Format data for submission
    const input = {
      ...formData,
      category_id: 1, // Set a default category_id (use the first category as default)
      capacity: formData.capacity === '' ? null : parseInt(formData.capacity, 10)
    };

    try {
      if (isEdit && selectedLocation) {
        await updateLocation({
          variables: {
            id: selectedLocation.id,
            input
          }
        });
      } else {
        await createLocation({
          variables: {
            input
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  // Handle location deletion
  const handleDelete = async (id) => {
    if (window.confirm('장소를 삭제하시겠습니까?')) {
      try {
        await deleteLocation({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  if (locationsLoading || categoriesLoading) return <CircularProgress />;
  if (locationsError) return <Typography color="error">Error loading locations: {locationsError.message}</Typography>;
  if (categoriesError) return <Typography color="error">Error loading categories: {categoriesError.message}</Typography>;

  return (
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
        >
          장소 추가
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="장소 테이블">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">장소명</TableCell>
              <TableCell align="center">수용 인원</TableCell>
              <TableCell align="center">설명</TableCell>
              <TableCell align="center">표시 순서</TableCell>
              <TableCell align="center">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  등록된 장소가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell align="center">{location.id}</TableCell>
                  <TableCell align="center">{location.location_name}</TableCell>
                  <TableCell align="center">{location.capacity || '-'}</TableCell>
                  <TableCell align="center">
                    {location.description 
                      ? location.description.length > 30 
                        ? `${location.description.substring(0, 30)}...` 
                        : location.description 
                      : '-'}
                  </TableCell>
                  <TableCell align="center">{location.display_order || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(location)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(location.id)}
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
        <DialogTitle>{isEdit ? '장소 수정' : '장소 추가'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={gridSpacing} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="location_name"
                label="장소명"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.location_name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="capacity"
                label="수용 인원"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.capacity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
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
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.location_name}
          >
            {isEdit ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </CardContent>
  );
};

export default LocationManagement; 