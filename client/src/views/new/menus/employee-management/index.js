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
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from 'ui-component/cards/MainCard';
import usePermissionCheck from 'hooks/usePermissionCheck';

// GraphQL queries and mutations
const GET_USERS = gql`
  query Users {
    users {
      id
      user_id
      user_name
      user_pwd
      role
      value
      viewer_level
      create_dtm
      update_dtm
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      user_id
      user_name
      user_pwd
      role
      value
      viewer_level
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: Int!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      user_id
      user_name
      user_pwd
      role
      value
      viewer_level
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

const EmployeeManagement = () => {
  // 권한 체크 - 관리자만 접근 가능
  const { userInfo: permissionUserInfo } = usePermissionCheck(['admin']);
  
  // State for form data
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    user_pwd: '',
    role: 'pending',
    value: '1',
    viewer_level: '1'
  });

  // GraphQL hooks
  const { loading, error, data, refetch } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);

  const users = data?.users || [];

  // Handle form open/close
  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData({
      user_id: '',
      user_name: '',
      user_pwd: '',
      role: 'pending',
      value: '1',
      viewer_level: '1'
    });
  };

  const handleEdit = (user) => {
    setOpen(true);
    setIsEdit(true);
    setSelectedUser(user);
    setFormData({
      user_id: user.user_id,
      user_name: user.user_name,
      user_pwd: '', // Don't set password for security reasons
      role: user.role || 'pending',
      value: user.value || '1',
      viewer_level: user.viewer_level || '1'
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
      if (isEdit && selectedUser) {
        // For update, only include the password if it was changed
        const input = { ...formData };
        if (!input.user_pwd) {
          delete input.user_pwd;
        }
        
        await updateUser({
          variables: {
            id: selectedUser.id,
            input
          }
        });
      } else {
        await createUser({
          variables: {
            input: formData
          }
        });
      }
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    if (window.confirm('계정을 삭제하시겠습니까?')) {
      try {
        await deleteUser({
          variables: { id }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Get the role display text
  const getRoleDisplayText = (role) => {
    switch(role) {
      case 'admin':
        return '관리자';
      case 'employee':
        return '직원';
      case 'viewer':
        return '열람자';
      case 'pending':
        return '승인대기';
      default:
        return role;
    }
  };

  // Get the viewer level display text
  const getViewerLevelDisplayText = (level) => {
    switch(level) {
      case '1':
        return '레벨 1 (기본) - 기본 정보만 열람';
      case '2':
        return '레벨 2 (일반) - 일반 통계 열람';
      case '3':
        return '레벨 3 (고급) - 상세 통계 열람';
      case '4':
        return '레벨 4 (전문) - 전문 데이터 열람';
      case '5':
        return '레벨 5 (최고) - 모든 데이터 열람';
      default:
        return `레벨 ${level}`;
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <MainCard title="직원계정 관리" content={false}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
          >
            계정 추가
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="직원계정 테이블">
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">사용자 ID</TableCell>
                <TableCell align="center">이름</TableCell>
                <TableCell align="center">권한</TableCell>
                <TableCell align="center">열람자 등급</TableCell>
                <TableCell align="center">생성일</TableCell>
                <TableCell align="center">수정일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    등록된 계정이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center">{user.id}</TableCell>
                    <TableCell align="center">{user.user_id}</TableCell>
                    <TableCell align="center">{user.user_name}</TableCell>
                    <TableCell align="center">{getRoleDisplayText(user.role)}</TableCell>
                    <TableCell align="center">
                      {user.role === 'viewer' ? getViewerLevelDisplayText(user.viewer_level) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {user.create_dtm ? new Date(user.create_dtm).toLocaleString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {user.update_dtm ? new Date(user.update_dtm).toLocaleString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEdit(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(user.id)}
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
        <DialogTitle>{isEdit ? '직원계정 수정' : '직원계정 추가'}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="사용자 ID"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isEdit} // Don't allow changing user_id once created
          />
          <TextField
            fullWidth
            label="이름"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="비밀번호"
            name="user_pwd"
            type="password"
            value={formData.user_pwd}
            onChange={handleChange}
            margin="normal"
            required={!isEdit} // Only required for new users
            helperText={isEdit ? "변경하지 않으려면 빈칸으로 두세요" : ""}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">권한</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="권한"
              required
            >
              <MenuItem value="admin">관리자</MenuItem>
              <MenuItem value="employee">직원</MenuItem>
              <MenuItem value="viewer">열람자</MenuItem>
              <MenuItem value="pending">승인대기</MenuItem>
            </Select>
          </FormControl>
          {formData.role === 'viewer' && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="viewer-level-label">열람자 등급</InputLabel>
              <Select
                labelId="viewer-level-label"
                name="viewer_level"
                value={formData.viewer_level}
                onChange={handleChange}
                label="열람자 등급"
                required
              >
                <MenuItem value="1">레벨 1 (기본) - 기본 정보만 열람</MenuItem>
                <MenuItem value="2">레벨 2 (일반) - 일반 통계 열람</MenuItem>
                <MenuItem value="3">레벨 3 (고급) - 상세 통계 열람</MenuItem>
                <MenuItem value="4">레벨 4 (전문) - 전문 데이터 열람</MenuItem>
                <MenuItem value="5">레벨 5 (최고) - 모든 데이터 열람</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default EmployeeManagement; 