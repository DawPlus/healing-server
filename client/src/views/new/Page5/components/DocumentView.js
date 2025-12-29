import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_PAGE5_RESERVATION_LIST,
  GET_PAGE5_DOCUMENTS,
  CREATE_PAGE5_DOCUMENT,
  UPDATE_PAGE5_DOCUMENT,
  DELETE_PAGE5_DOCUMENT
} from '../graphql';
import { formatDate, showAlert } from '../services/dataService';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ko as koLocale } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import moment from 'moment';
import MainCard from 'ui-component/cards/MainCard';
import Page5Layout from './Page5Layout';
import FolderIcon from '@mui/icons-material/Folder';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';

const DocumentView = () => {
  // Local state for document form
  const [open, setOpen] = useState(false);
  const [documentData, setDocumentData] = useState({
    page1_id: '',
    document_type: 'reservation_result',
    status: 'draft',
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    reservation_date: '',
    reservation_code: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState('all');
  
  // Get reservation list to populate the document form
  const { data: reservationsData, loading: reservationsLoading } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only'
  });
  
  // Get documents list
  const { data: documentsData, loading: documentsLoading } = useQuery(GET_PAGE5_DOCUMENTS, {
    fetchPolicy: 'network-only'
  });
  
  // Create document mutation
  const [createDocument, { loading: createLoading }] = useMutation(CREATE_PAGE5_DOCUMENT, {
    refetchQueries: ['GetPage5Documents'],
    onCompleted: () => {
      showAlert('문서가 성공적으로 생성되었습니다.', 'success');
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating document:', error);
      showAlert('문서 생성 중 오류가 발생했습니다.', 'error');
    }
  });
  
  // Update document mutation
  const [updateDocument, { loading: updateLoading }] = useMutation(UPDATE_PAGE5_DOCUMENT, {
    refetchQueries: ['GetPage5Documents'],
    onCompleted: () => {
      showAlert('문서가 성공적으로 업데이트되었습니다.', 'success');
      handleClose();
    },
    onError: (error) => {
      console.error('Error updating document:', error);
      showAlert('문서 업데이트 중 오류가 발생했습니다.', 'error');
    }
  });
  
  // Delete document mutation
  const [deleteDocument, { loading: deleteLoading }] = useMutation(DELETE_PAGE5_DOCUMENT, {
    refetchQueries: ['GetPage5Documents'],
    onCompleted: () => {
      showAlert('문서가 성공적으로 삭제되었습니다.', 'success');
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      showAlert('문서 삭제 중 오류가 발생했습니다.', 'error');
    }
  });
  
  // Get document types for filtering
  const documentTypes = [
    { value: 'all', label: '전체' },
    { value: 'reservation_result', label: '예약결과' },
    { value: 'inspection_doc', label: '견적서' },
    { value: 'order_report', label: '수주보고' },
    { value: 'schedule', label: '일정표' }
  ];
  
  // Status chip colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Open dialog to create a new document
  const handleCreateNew = () => {
    setIsEdit(false);
    setCurrentId(null);
    setDocumentData({
      page1_id: '',
      document_type: 'reservation_result',
      status: 'draft',
      organization_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      reservation_date: '',
      reservation_code: ''
    });
    setOpen(true);
  };
  
  // Open dialog to edit an existing document
  const handleEdit = (document) => {
    setIsEdit(true);
    setCurrentId(document.id);
    setDocumentData({
      page1_id: document.page1_id,
      document_type: document.document_type,
      status: document.status,
      organization_name: document.organization_name,
      contact_name: document.contact_name,
      contact_email: document.contact_email,
      contact_phone: document.contact_phone,
      reservation_date: document.reservation_date,
      reservation_code: document.reservation_code
    });
    setOpen(true);
  };
  
  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
  };
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentData({
      ...documentData,
      [name]: value
    });
    
    // If page1_id is selected, load reservation data
    if (name === 'page1_id' && value) {
      const reservation = reservationsData?.getPage1List.find(r => r.id === parseInt(value));
      if (reservation) {
        setDocumentData({
          ...documentData,
          page1_id: value,
          organization_name: reservation.group_name || '',
          contact_name: reservation.customer_name || '',
          contact_email: reservation.email || '',
          contact_phone: reservation.mobile_phone || '',
          reservation_date: reservation.start_date ? formatDate(reservation.start_date) : '',
          reservation_code: `RES-${reservation.id}`
        });
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const documentInput = {
        ...documentData,
        page1_id: parseInt(documentData.page1_id)
      };
      
      if (isEdit && currentId) {
        await updateDocument({
          variables: {
            id: parseInt(currentId),
            input: documentInput
          }
        });
      } else {
        await createDocument({
          variables: {
            input: documentInput
          }
        });
      }
    } catch (error) {
      console.error('Error submitting document:', error);
    }
  };
  
  // Handle document delete
  const handleDelete = async (id) => {
    try {
      await deleteDocument({
        variables: {
          id: parseInt(id)
        }
      });
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };
  
  // Filter documents based on search term and document type
  const filteredDocuments = () => {
    if (!documentsData?.getPage5Documents) return [];
    
    return documentsData.getPage5Documents.filter(doc => {
      const searchMatch = 
        doc.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const typeMatch = documentType === 'all' || doc.document_type === documentType;
      
      return searchMatch && typeMatch;
    });
  };
  
  return (
    <Page5Layout
      title="서류함"
      icon={<FolderIcon sx={{ fontSize: 28 }} />}
      activeTab="documents"
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* 좌측 문서 필터 및 검색 */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardHeader 
                title="문서 필터" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="검색어"
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>문서 유형</InputLabel>
                    <Select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      label="문서 유형"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value="reservation_result">예약결과</MenuItem>
                      <MenuItem value="inspection_doc">견적서</MenuItem>
                      <MenuItem value="order_report">수주보고</MenuItem>
                      <MenuItem value="schedule">일정표</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>상태</InputLabel>
                    <Select
                      value={documentData.status}
                      onChange={(e) => setDocumentData({
                        ...documentData,
                        status: e.target.value
                      })}
                      label="상태"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value="draft">작성중</MenuItem>
                      <MenuItem value="issued">발행됨</MenuItem>
                      <MenuItem value="signed">서명됨</MenuItem>
                      <MenuItem value="archived">보관됨</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                    <DatePicker
                      label="날짜 범위 시작"
                      value={documentData.reservation_date ? parseISO(documentData.reservation_date) : null}
                      onChange={(newValue) => {
                        setDocumentData({
                          ...documentData,
                          reservation_date: newValue ? format(newValue, 'yyyy-MM-dd') : null
                        });
                      }}
                      format="yyyy년 MM월 dd일"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true
                        }
                      }}
                    />
                    
                    <DatePicker
                      label="날짜 범위 종료"
                      value={documentData.reservation_date ? parseISO(documentData.reservation_date) : null}
                      onChange={(newValue) => {
                        setDocumentData({
                          ...documentData,
                          reservation_date: newValue ? format(newValue, 'yyyy-MM-dd') : null
                        });
                      }}
                      format="yyyy년 MM월 dd일"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true
                        }
                      }}
                    />
                  </LocalizationProvider>
                  
                  <Button 
                    variant="contained" 
                    startIcon={<FilterListIcon />}
                    onClick={handleSubmit}
                  >
                    필터 적용
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm('');
                      setDocumentType('all');
                      setDocumentData({
                        ...documentData,
                        status: 'all',
                        reservation_date: null
                      });
                    }}
                  >
                    필터 초기화
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          {/* 우측 문서 목록 */}
          <Grid item xs={12} md={9}>
            <Card variant="outlined">
              <CardHeader 
                title="문서 목록" 
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                  >
                    새 문서
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                {documentsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredDocuments().length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                      문서가 없습니다.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>문서번호</TableCell>
                          <TableCell>문서유형</TableCell>
                          <TableCell>단체명</TableCell>
                          <TableCell>날짜</TableCell>
                          <TableCell>담당자</TableCell>
                          <TableCell>상태</TableCell>
                          <TableCell>기능</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDocuments().map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>{doc.reservation_code || `-`}</TableCell>
                            <TableCell>
                              {doc.document_type === 'reservation_result' ? '예약결과' :
                               doc.document_type === 'inspection_doc' ? '견적서' :
                               doc.document_type === 'order_report' ? '수주보고' :
                               doc.document_type === 'schedule' ? '일정표' : doc.document_type}
                            </TableCell>
                            <TableCell>{doc.organization_name}</TableCell>
                            <TableCell>{doc.reservation_date ? formatDate(doc.reservation_date) : '-'}</TableCell>
                            <TableCell>{doc.contact_name || '-'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={
                                  doc.status === 'draft' ? '작성중' :
                                  doc.status === 'issued' ? '발행됨' :
                                  doc.status === 'signed' ? '서명됨' :
                                  doc.status === 'archived' ? '보관됨' : doc.status
                                }
                                color={getStatusColor(doc.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(doc)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (window.confirm('이 문서를 삭제하시겠습니까?')) {
                                    handleDelete(doc.id);
                                  }
                                }}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  // View document (placeholder)
                                  console.log('View document', doc.id);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  // Download document (placeholder)
                                  console.log('Download document', doc.id);
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Document create/edit dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? '문서 편집' : '새 문서 생성'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>예약 선택</InputLabel>
                  <Select
                    name="page1_id"
                    value={documentData.page1_id}
                    onChange={handleChange}
                    label="예약 선택 *"
                  >
                    <MenuItem value="">
                      <em>선택해주세요</em>
                    </MenuItem>
                    {reservationsData?.getPage1List?.map((reservation) => (
                      <MenuItem key={reservation.id} value={reservation.id}>
                        {reservation.group_name} ({formatDate(reservation.start_date)} ~ {formatDate(reservation.end_date)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>문서 유형</InputLabel>
                  <Select
                    name="document_type"
                    value={documentData.document_type}
                    onChange={handleChange}
                    label="문서 유형 *"
                  >
                    {documentTypes.filter(type => type.value !== 'all').map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="organization_name"
                  label="단체명"
                  fullWidth
                  required
                  value={documentData.organization_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="contact_name"
                  label="담당자 이름"
                  fullWidth
                  value={documentData.contact_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="contact_email"
                  label="담당자 이메일"
                  fullWidth
                  value={documentData.contact_email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="contact_phone"
                  label="담당자 연락처"
                  fullWidth
                  value={documentData.contact_phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                  <DatePicker
                    label="예약 날짜"
                    value={documentData.reservation_date ? parseISO(documentData.reservation_date) : null}
                    onChange={(newValue) => {
                      setDocumentData({
                        ...documentData,
                        reservation_date: newValue ? format(newValue, 'yyyy-MM-dd') : null
                      });
                    }}
                    format="yyyy년 MM월 dd일"
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="reservation_code"
                  label="예약 코드"
                  fullWidth
                  value={documentData.reservation_code}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>상태</InputLabel>
                  <Select
                    name="status"
                    value={documentData.status}
                    onChange={handleChange}
                    label="상태"
                  >
                    <MenuItem value="draft">작성중</MenuItem>
                    <MenuItem value="issued">발행됨</MenuItem>
                    <MenuItem value="signed">서명됨</MenuItem>
                    <MenuItem value="archived">보관됨</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading ? '처리중...' : (isEdit ? '수정' : '생성')}
          </Button>
        </DialogActions>
      </Dialog>
    </Page5Layout>
  );
};

export default DocumentView; 