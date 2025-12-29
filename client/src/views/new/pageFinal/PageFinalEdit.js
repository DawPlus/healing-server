import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Typography,
  Divider,
  Button,
  Rating,
  Snackbar,
  Alert,
  CircularProgress,
  TextareaAutosize,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {
  GET_PAGE_FINAL_BY_PAGE1_ID,
  UPSERT_PAGE_FINAL,
  ADD_TEACHER_EXPENSE,
  UPDATE_TEACHER_EXPENSE,
  DELETE_TEACHER_EXPENSE,
  ADD_PARTICIPANT_EXPENSE,
  UPDATE_PARTICIPANT_EXPENSE,
  DELETE_PARTICIPANT_EXPENSE,
  ADD_INCOME_ITEM,
  UPDATE_INCOME_ITEM,
  DELETE_INCOME_ITEM,
  UPDATE_DISCOUNT_INFO,
  GET_INSTRUCTOR_DATA_FOR_IMPORT,
  GET_ROOM_DATA_FOR_IMPORT,
  GET_EXPENSE_DATA_FOR_IMPORT,
  GET_INSTRUCTORS_FOR_PAYMENT,
  GET_PAGE1_DETAILS
} from '../../../graphql/pageFinal';
import { 
  ImportSection, 
  ComplaintSection, 
  DiscountSection 
} from './components/ImportComponents';
import {
  handleImportAllTeacherExpenses,
  handleImportAllParticipantExpenses,
  handleImportAllIncome,
  handleInstructorDataLoaded,
  handleRoomDataLoaded,
  handleMealDataLoaded,
  handleMaterialDataLoaded,
  handleExpenseDataLoaded,
  handleProgramDataLoaded
} from './utils/importHandlers';

const SectionContainer = ({ title, children, ...rest }) => (
  <Box sx={{ mb: 3 }} {...rest}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const FeedbackRow = ({ title, rating, onRatingChange, note, onNoteChange }) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid item xs={12}>
      <Typography variant="subtitle1">{title}</Typography>
    </Grid>
    <Grid item xs={12} sm={4} md={3} lg={2}>
      <Box display="flex" alignItems="center">
        <Typography variant="body2" sx={{ mr: 1 }}>평가:</Typography>
        <Rating
          name={`rating-${title}`}
          value={rating}
          onChange={(event, newValue) => onRatingChange(newValue)}
          precision={1}
          size="large"
        />
        <Typography variant="body2" sx={{ ml: 1 }}>{rating || 0}/5</Typography>
      </Box>
    </Grid>
    <Grid item xs={12} sm={8} md={9} lg={10}>
      <TextField
        fullWidth
        variant="outlined"
        label="세부 내용"
        value={note || ''}
        onChange={(e) => onNoteChange(e.target.value)}
        size="small"
      />
    </Grid>
  </Grid>
);

// Number input with thousands separator
const NumberInput = ({ label, value, onChange, error, helperText, ...props }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    // When input is empty, set value to 0
    const parsedValue = inputValue === '' ? 0 : parseInt(inputValue);
    onChange(parsedValue);
  };

  // Ensure value is a number, then format it
  const numValue = typeof value === 'number' ? value : 0;
  const formattedValue = numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <TextField
      label={label}
      value={formattedValue}
      onChange={handleChange}
      fullWidth
      InputProps={{
        endAdornment: <InputAdornment position="end">(단위:천원)</InputAdornment>,
      }}
      error={error}
      helperText={helperText}
      {...props}
    />
  );
};

// Expense item dialog for adding/editing expenses
const ExpenseDialog = ({ open, onClose, onSave, initialData, title, categoryOptions }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    details: '',
    notes: '',
    is_planned: false,
    discount_rate: null
  });

  useEffect(() => {
    if (initialData) {
      // Strip __typename and id from the initial data
      const { __typename, id, ...cleanData } = initialData;
      setFormData(cleanData);
    } else {
      setFormData({
        category: '', // 기본값을 빈 문자열로 설정하여 사용자가 직접 선택하도록 함
        amount: 0,
        details: '',
        notes: '',
        is_planned: false,
        discount_rate: null
      });
    }
  }, [initialData, open, categoryOptions]);

  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };

  const handleNumberChange = (field) => (value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    // 카테고리가 선택되지 않은 경우 경고
    if (!formData.category) {
      alert('분류를 선택해주세요.');
      return;
    }
    
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>분류</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="분류"
                >
                  <MenuItem value="">
                    <em>분류를 선택해주세요</em>
                  </MenuItem>
                  {categoryOptions?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumberInput
                label="금액"
                value={formData.amount}
                onChange={handleNumberChange('amount')}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="할인율 (%)"
                value={formData.discount_rate || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    discount_rate: value === '' ? null : parseFloat(value)
                  });
                }}
                fullWidth
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.1 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="세부 내역"
                value={formData.details || ''}
                onChange={handleChange('details')}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Discount application dialog
const DiscountDialog = ({ open, onClose, onApply, title }) => {
  const [discountRate, setDiscountRate] = useState(0);

  const handleApply = () => {
    onApply(discountRate);
    onClose();
    setDiscountRate(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title} 할인율 적용</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <NumberInput
            label="할인율 (%)"
            value={discountRate}
            onChange={setDiscountRate}
            fullWidth
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            입력한 할인율이 해당 섹션의 모든 항목에 적용됩니다.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          적용
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Expense table component with import button
const ExpenseTable = ({ data, onAdd, onEdit, onDelete, title, categoryOptions, onImport, onApplyDiscount }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);

  // 수입 항목 관련 로깅 추가
  useEffect(() => {
    if (title && title.includes('수입')) {
      console.log('[ExpenseTable] 수입 항목 테이블 렌더링:', {
        title,
        dataCount: data?.length || 0,
        data: data?.map(item => ({
          id: item.id,
          category: item.category,
          amount: item.amount,
          discount_rate: item.discount_rate,
          details: item.details,
          notes: item.notes
        })) || []
      });

      // 프로그램 카테고리 항목 특별 로깅
      const programItems = data?.filter(item => 
        item.category && item.category.includes('프로그램')
      ) || [];
      
      console.log('[ExpenseTable] 프로그램 카테고리 항목 분석:', {
        programItemsCount: programItems.length,
        programItems: programItems.map(item => ({
          id: item.id,
          category: item.category,
          amount: item.amount,
          discount_rate: item.discount_rate,
          details: item.details
        }))
      });
    }
  }, [data, title]);

  const handleOpenDialog = () => {
    console.log('[ExpenseTable] 새 항목 추가 다이얼로그 열기:', { title });
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item) => {
    console.log('[ExpenseTable] 항목 수정 다이얼로그 열기:', { 
      title,
      item: {
        id: item.id,
        category: item.category,
        amount: item.amount,
        discount_rate: item.discount_rate,
        details: item.details
      }
    });
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log('[ExpenseTable] 다이얼로그 닫기:', { title });
    setDialogOpen(false);
  };

  const handleSaveItem = (formData) => {
    console.log('[ExpenseTable] 항목 저장:', {
      title,
      isEdit: !!selectedItem,
      selectedItemId: selectedItem?.id,
      formData
    });

    if (selectedItem) {
      onEdit(selectedItem.id, formData);
    } else {
      onAdd(formData);
    }
  };

  const handleApplyDiscount = (discountRate) => {
    console.log('[ExpenseTable] 할인율 적용:', {
      title,
      discountRate,
      itemCount: data?.length || 0
    });

    if (onApplyDiscount) {
      onApplyDiscount(discountRate);
    }
  };

  // 테이블 렌더링 시 데이터 로깅
  console.log('[ExpenseTable] 테이블 렌더링:', {
    title,
    hasData: data && data.length > 0,
    dataCount: data?.length || 0,
    firstFewItems: data?.slice(0, 3).map(item => ({
      id: item.id,
      category: item.category,
      amount: item.amount,
      discount_rate: item.discount_rate
    })) || []
  });

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="600">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onImport && (
            <Tooltip title="데이터 불러오기">
              <Button
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={onImport}
                variant="outlined"
              >
                불러오기
              </Button>
            </Tooltip>
          )}
          {onApplyDiscount && (
            <Tooltip title="할인율 적용">
              <Button
                size="small"
                onClick={() => setDiscountDialogOpen(true)}
                variant="outlined"
                color="secondary"
              >
                할인적용
              </Button>
            </Tooltip>
          )}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            variant="contained"
          >
            항목 추가
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80}>번호</TableCell>
              <TableCell>분류</TableCell>
              <TableCell>금액</TableCell>
              <TableCell>할인율</TableCell>
              <TableCell>세부내역</TableCell>
              <TableCell width={120}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.amount !== undefined ? 
                      (item.amount === 0 ? 
                        '0원' : 
                        `${item.amount.toLocaleString()}(단위:천원)`) : 
                      '0원'}
                  </TableCell>
                  <TableCell>
                    {item.discount_rate !== null && item.discount_rate !== undefined 
                      ? `${item.discount_rate}%` 
                      : '-'}
                  </TableCell>
                  <TableCell>{item.details || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditItem(item)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  등록된 항목이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ExpenseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
        initialData={selectedItem}
        title={selectedItem ? '항목 수정' : '항목 추가'}
        categoryOptions={categoryOptions}
      />
      <DiscountDialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
        onApply={handleApplyDiscount}
        title={title}
      />
    </>
  );
};

const PageFinalEdit = ({ overrideId, isEmbedded, onDataUpdate }) => {
  const { id } = useParams();
  const page1Id = parseInt(overrideId || id);
  
  console.log('[PageFinalEdit] 컴포넌트 시작:', {
    overrideId,
    id,
    page1Id,
    isEmbedded
  });
  
  // States
  const [complaint, setComplaint] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [discountNotes, setDiscountNotes] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [alertQueue, setAlertQueue] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [isSocialContribution, setIsSocialContribution] = useState(false);
  const [businessSubcategory, setBusinessSubcategory] = useState('');
  
  // Organized expense data
  const [teacherPlannedExpenses, setTeacherPlannedExpenses] = useState([]);
  const [teacherExecutedExpenses, setTeacherExecutedExpenses] = useState([]);
  const [participantPlannedExpenses, setParticipantPlannedExpenses] = useState([]);
  const [participantExecutedExpenses, setParticipantExecutedExpenses] = useState([]);
  const [incomeItems, setIncomeItems] = useState([]);
  
  console.log('[PageFinalEdit] 현재 state 데이터:', {
    teacherPlannedExpenses: teacherPlannedExpenses.length,
    teacherExecutedExpenses: teacherExecutedExpenses.length,
    participantPlannedExpenses: participantPlannedExpenses.length,
    participantExecutedExpenses: participantExecutedExpenses.length,
    incomeItems: incomeItems.length,
    complaint,
    discountRate,
    discountNotes
  });
  
  // Category options
  const teacherExpenseCategories = ['강사비', '보조강사비', '교통비', '식사비'];
  const participantExpenseCategories = ['숙박비', '식사비', '재료비', '기타비', '예비비'];
  const incomeCategories = ['프로그램', '숙박비', '식사비', '재료비', '기타비'];
  
  // Get all instructors for payment rate calculation
  const { loading: loadingInstructors } = useQuery(GET_INSTRUCTORS_FOR_PAYMENT, {
    onCompleted: (data) => {
      console.log('[PageFinalEdit] 강사 데이터 로드 완료:', data?.instructors?.length || 0);
      if (data && data.instructors) {
        setInstructors(data.instructors);
      }
    },
    onError: (error) => {
      console.error('[PageFinalEdit] 강사 데이터 로드 오류:', error);
    }
  });

  // Get Page1 data to check if organization is social contribution
  const { loading: loadingPage1 } = useQuery(GET_PAGE1_DETAILS, {
    variables: { id: page1Id },
    onCompleted: (data) => {
      if (data && data.getPage1ById) {
        console.log('Page1 data loaded:', data.getPage1ById);
        setIsSocialContribution(data.getPage1ById.business_category === 'social_contribution');
        setBusinessSubcategory(data.getPage1ById.business_subcategory || '');
      }
    },
    onError: (error) => {
      console.error('Error fetching Page1 data:', error);
    }
  });

  // Data import queries
  const [loadInstructorData, { loading: loadingInstructorData }] = useLazyQuery(GET_INSTRUCTOR_DATA_FOR_IMPORT, {
    onCompleted: (instructorData) => {
      console.log('[PageFinalEdit][loadInstructorData] 쿼리 완료:', {
        hasInstructorData: !!instructorData,
        page2Id: instructorData?.getPage2ByPage1Id?.id,
        programsCount: instructorData?.getPage2ByPage1Id?.programs?.length || 0,
        hasHandlers: {
          showAlert: !!showAlert,
          handleAddTeacherExpense: !!handleAddTeacherExpense,
          refetch: !!refetch
        },
        pageFinalId: data?.getPageFinalByPage1Id?.id,
        instructorsCount: instructors?.length,
        teacherExpensesCount: {
          planned: teacherPlannedExpenses?.length || 0,
          executed: teacherExecutedExpenses?.length || 0
        }
      });
      
      // 프로그램 데이터 샘플 로그
      if (instructorData?.getPage2ByPage1Id?.programs?.length > 0) {
        const samplePrograms = instructorData.getPage2ByPage1Id.programs.slice(0, 2);
        console.log('[PageFinalEdit][loadInstructorData] 프로그램 데이터 샘플:', 
          samplePrograms.map(p => ({
            id: p.id,
            name: p.program_name,
            instructor: p.instructor_name,
            price: p.price,
            participants: p.participants,
            totalValue: p.price * p.participants
          }))
        );
      }
      
      // Check if we have pageFinalId from the main query
      if (!data?.getPageFinalByPage1Id?.id) {
        console.error('[PageFinalEdit][loadInstructorData] Missing pageFinalId - main query data:', data);
        showAlert("강사비 항목을 추가하기 위한 기본 페이지 데이터가 없습니다.", "error");
        return;
      }
      
      // 기존 강사비 항목 합치기 - 중복 체크에 사용
      const existingExpenses = [
        ...(teacherPlannedExpenses || []),
        ...(teacherExecutedExpenses || [])
      ];
      
      // Now that we know we have the pageFinalId, proceed with handling
      console.log('[PageFinalEdit][loadInstructorData] handleInstructorDataLoaded 호출 시작');
      return handleInstructorDataLoaded(instructorData, { 
        showAlert, 
        handleAddTeacherExpense, 
        refetch,
        instructors,
        existingExpenses // 기존 항목 전달
      });
    },
    onError: (error) => {
      console.error('[PageFinalEdit][loadInstructorData] 쿼리 오류:', error);
      showAlert(`강사 데이터 불러오기 중 오류 발생: ${error.message}`, 'error');
    }
  });
  
  const [loadRoomData, { loading: loadingRoomData }] = useLazyQuery(GET_ROOM_DATA_FOR_IMPORT, {
    onCompleted: handleRoomDataLoaded,
    onError: (error) => showAlert(`숙박 데이터 불러오기 중 오류 발생: ${error.message}`, 'error')
  });
  
  const [loadMealData, { loading: loadingMealData }] = useLazyQuery(GET_ROOM_DATA_FOR_IMPORT, {
    onCompleted: handleMealDataLoaded,
    onError: (error) => showAlert(`식사 데이터 불러오기 중 오류 발생: ${error.message}`, 'error')
  });
  
  const [loadMaterialData, { loading: loadingMaterialData }] = useLazyQuery(GET_EXPENSE_DATA_FOR_IMPORT, {
    onCompleted: handleMaterialDataLoaded,
    onError: (error) => showAlert(`재료비 데이터 불러오기 중 오류 발생: ${error.message}`, 'error')
  });
  
  const [loadExpenseData, { loading: loadingExpenseData }] = useLazyQuery(GET_EXPENSE_DATA_FOR_IMPORT, {
    onCompleted: handleExpenseDataLoaded,
    onError: (error) => showAlert(`기타비 데이터 불러오기 중 오류 발생: ${error.message}`, 'error')
  });
  
  // GraphQL queries and mutations
  // Get data
  const { loading, error, data, refetch } = useQuery(GET_PAGE_FINAL_BY_PAGE1_ID, {
    variables: { page1_id: page1Id },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('[PageFinalEdit] GET_PAGE_FINAL_BY_PAGE1_ID 쿼리 완료:', {
        hasData: !!data,
        hasPageFinal: !!data?.getPageFinalByPage1Id,
        page1Id
      });

      if (data.getPageFinalByPage1Id) {
        const {
          complaint: dbComplaint,
          discount_rate: dbDiscountRate,
          discount_notes: dbDiscountNotes,
          teacher_expenses,
          participant_expenses,
          income_items
        } = data.getPageFinalByPage1Id;

        console.log('[PageFinalEdit] 로드된 데이터 상세:', {
          pageFinalId: data.getPageFinalByPage1Id.id,
          complaint: dbComplaint,
          discountRate: dbDiscountRate,
          discountNotes: dbDiscountNotes,
          teacherExpensesCount: teacher_expenses?.length || 0,
          participantExpensesCount: participant_expenses?.length || 0,
          incomeItemsCount: income_items?.length || 0
        });

        // 수입 항목 분석 - 프로그램 항목 필터링 및 로깅
        if (income_items && income_items.length > 0) {
          console.log('[PageFinalEdit] 전체 수입 항목 분석:', {
            total: income_items.length,
            details: income_items.map(i => ({ 
              id: i.id,
              category: i.category, 
              amount: i.amount, 
              details: i.details,
              discount_rate: i.discount_rate
            }))
          });

          // 프로그램 카테고리 필터링
          const programIncomeItems = income_items.filter(item => 
            item.category?.includes('프로그램')
          );
          
          console.log('[PageFinalEdit] 프로그램 수입 항목 필터링 결과:', {
            programItemsCount: programIncomeItems.length,
            programItems: programIncomeItems.map(item => ({
              id: item.id,
              category: item.category,
              amount: item.amount,
              details: item.details,
              discount_rate: item.discount_rate,
              notes: item.notes
            }))
          });
        } else {
          console.log('[PageFinalEdit] 수입 항목 없음');
        }

        // 강사 비용 분석
        if (teacher_expenses && teacher_expenses.length > 0) {
          const planned = teacher_expenses.filter(item => item.is_planned);
          const executed = teacher_expenses.filter(item => !item.is_planned);
          console.log('[PageFinalEdit] 강사 비용 분석:', {
            total: teacher_expenses.length,
            planned: planned.length,
            executed: executed.length,
            plannedDetails: planned.map(e => ({ category: e.category, amount: e.amount, details: e.details })),
            executedDetails: executed.map(e => ({ category: e.category, amount: e.amount, details: e.details }))
          });
        }

        // 참가자 비용 분석  
        if (participant_expenses && participant_expenses.length > 0) {
          const planned = participant_expenses.filter(item => item.is_planned);
          const executed = participant_expenses.filter(item => !item.is_planned);
          console.log('[PageFinalEdit] 참가자 비용 분석:', {
            total: participant_expenses.length,
            planned: planned.length,
            executed: executed.length,
            plannedDetails: planned.map(e => ({ category: e.category, amount: e.amount, details: e.details })),
            executedDetails: executed.map(e => ({ category: e.category, amount: e.amount, details: e.details }))
          });
        }

        // Set main data
        setComplaint(dbComplaint || '');
        setDiscountRate(dbDiscountRate || 0);
        setDiscountNotes(dbDiscountNotes || '');
        
        // Organize expenses by type
        setTeacherPlannedExpenses(teacher_expenses?.filter(item => item.is_planned) || []);
        setTeacherExecutedExpenses(teacher_expenses?.filter(item => !item.is_planned) || []);
        setParticipantPlannedExpenses(participant_expenses?.filter(item => item.is_planned) || []);
        setParticipantExecutedExpenses(participant_expenses?.filter(item => !item.is_planned) || []);
        
        // 수입 항목 설정 시 추가 로깅
        const finalIncomeItems = income_items || [];
        console.log('[PageFinalEdit] 수입 항목 state 설정:', {
          originalCount: income_items?.length || 0,
          finalCount: finalIncomeItems.length,
          programItemsInFinal: finalIncomeItems.filter(item => 
            item.category?.includes('프로그램')
          ).length
        });
        
        console.log("여기입니다~~", finalIncomeItems);
        
        setIncomeItems(finalIncomeItems);

        console.log('[PageFinalEdit] state 업데이트 완료:', {
          teacherPlannedCount: teacher_expenses?.filter(item => item.is_planned)?.length || 0,
          teacherExecutedCount: teacher_expenses?.filter(item => !item.is_planned)?.length || 0,
          participantPlannedCount: participant_expenses?.filter(item => item.is_planned)?.length || 0,
          participantExecutedCount: participant_expenses?.filter(item => !item.is_planned)?.length || 0,
          incomeCount: finalIncomeItems?.length || 0
        });
      } else {
        console.log('[PageFinalEdit] PageFinal 데이터 없음, 기본 데이터 초기화');
        // Initialize with empty state
        initializeDefaultExpenses();
      }
    },
    onError: (error) => {
      console.error('[PageFinalEdit] GET_PAGE_FINAL_BY_PAGE1_ID 쿼리 오류:', {
        error: error.message,
        page1Id,
        stack: error.stack
      });
      showAlert(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`, 'error');
      initializeDefaultExpenses();
    }
  });

  // Initialize with default expenses if no data exists
  const initializeDefaultExpenses = async () => {
    try {
      await upsertPageFinal({
        variables: {
          input: {
            page1_id: page1Id,
            complaint: '',
            discount_rate: 0,
            discount_notes: ''
          }
        }
      });
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };
  
  // Upsert main PageFinal record
  const [upsertPageFinal, { loading: savingPageFinal }] = useMutation(UPSERT_PAGE_FINAL, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error saving pageFinal data:', error);
      showAlert(`기본 데이터 저장 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // Teacher expense mutations
  const [addTeacherExpense] = useMutation(ADD_TEACHER_EXPENSE, {
    onCompleted: (response) => {
      // 즉시 로컬 state 업데이트
      const newItem = response.addTeacherExpense;
      if (newItem.is_planned) {
        setTeacherPlannedExpenses(prev => [...prev, newItem]);
      } else {
        setTeacherExecutedExpenses(prev => [...prev, newItem]);
      }
      
      showAlert('강사 비용 항목이 추가되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('강사 비용 항목이 추가되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`강사 비용 항목 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [updateTeacherExpense] = useMutation(UPDATE_TEACHER_EXPENSE, {
    onCompleted: (response) => {
      // 즉시 로컬 state 업데이트
      const updatedItem = response.updateTeacherExpense;
      const updateState = (items) => 
        items.map(item => item.id === updatedItem.id ? updatedItem : item);
      
      if (updatedItem.is_planned) {
        setTeacherPlannedExpenses(prev => updateState(prev));
        // If moved from executed to planned, remove from executed
        setTeacherExecutedExpenses(prev => prev.filter(item => item.id !== updatedItem.id));
      } else {
        setTeacherExecutedExpenses(prev => updateState(prev));
        // If moved from planned to executed, remove from planned
        setTeacherPlannedExpenses(prev => prev.filter(item => item.id !== updatedItem.id));
      }
      
      showAlert('강사 비용 항목이 수정되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('강사 비용 항목이 수정되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`강사 비용 항목 수정 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [deleteTeacherExpense] = useMutation(DELETE_TEACHER_EXPENSE, {
    onCompleted: () => {
      showAlert('강사 비용 항목이 삭제되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('강사 비용 항목이 삭제되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`강사 비용 항목 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // Participant expense mutations
  const [addParticipantExpense] = useMutation(ADD_PARTICIPANT_EXPENSE, {
    onCompleted: (response) => {
      // 즉시 로컬 state 업데이트
      const newItem = response.addParticipantExpense;
      if (newItem.is_planned) {
        setParticipantPlannedExpenses(prev => [...prev, newItem]);
      } else {
        setParticipantExecutedExpenses(prev => [...prev, newItem]);
      }
      
      showAlert('참가자 비용 항목이 추가되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('참가자 비용 항목이 추가되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`참가자 비용 항목 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [updateParticipantExpense] = useMutation(UPDATE_PARTICIPANT_EXPENSE, {
    onCompleted: (response) => {
      // 즉시 로컬 state 업데이트
      const updatedItem = response.updateParticipantExpense;
      const updateState = (items) => 
        items.map(item => item.id === updatedItem.id ? updatedItem : item);
      
      if (updatedItem.is_planned) {
        setParticipantPlannedExpenses(prev => updateState(prev));
        // If moved from executed to planned, remove from executed
        setParticipantExecutedExpenses(prev => prev.filter(item => item.id !== updatedItem.id));
      } else {
        setParticipantExecutedExpenses(prev => updateState(prev));
        // If moved from planned to executed, remove from planned
        setParticipantPlannedExpenses(prev => prev.filter(item => item.id !== updatedItem.id));
      }
      
      showAlert('참가자 비용 항목이 수정되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('참가자 비용 항목이 수정되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`참가자 비용 항목 수정 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [deleteParticipantExpense] = useMutation(DELETE_PARTICIPANT_EXPENSE, {
    onCompleted: () => {
      showAlert('참가자 비용 항목이 삭제되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('참가자 비용 항목이 삭제되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`참가자 비용 항목 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // Income mutations
  const [addIncomeItem] = useMutation(ADD_INCOME_ITEM, {
    onCompleted: (response) => {
      // 즉시 로컬 state 업데이트
      const newItem = response.addIncomeItem;
      setIncomeItems(prev => [...prev, newItem]);
      
      showAlert('수입 항목이 추가되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('수입 항목이 추가되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`수입 항목 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [updateIncomeItem] = useMutation(UPDATE_INCOME_ITEM, {
    onCompleted: (response) => {
      // 즉시 로컬 state 업데이트
      const updatedItem = response.updateIncomeItem;
      setIncomeItems(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      
      showAlert('수입 항목이 수정되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('수입 항목이 수정되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`수입 항목 수정 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  const [deleteIncomeItem] = useMutation(DELETE_INCOME_ITEM, {
    onCompleted: () => {
      showAlert('수입 항목이 삭제되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('수입 항목이 삭제되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`수입 항목 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // Update discount info
  const [updateDiscountInfo] = useMutation(UPDATE_DISCOUNT_INFO, {
    onCompleted: () => {
      refetch();
      showAlert('할인 정보가 업데이트되었습니다.', 'success');
      if (onDataUpdate) {
        onDataUpdate('할인 정보가 업데이트되었습니다.');
      }
    },
    onError: (error) => {
      showAlert(`할인 정보 업데이트 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  });

  // Teacher expense handlers
  const handleAddTeacherExpense = async (formData) => {
    console.log('[PageFinalEdit] handleAddTeacherExpense 시작:', {
      formData,
      pageFinalId: data?.getPageFinalByPage1Id?.id,
      currentExpenseCounts: {
        planned: teacherPlannedExpenses.length,
        executed: teacherExecutedExpenses.length
      }
    });

    try {
      if (!data?.getPageFinalByPage1Id?.id) {
        console.error('[PageFinalEdit] handleAddTeacherExpense: pageFinalId 없음');
        showAlert('페이지 정보가 없습니다. 페이지를 새로고침해 주세요.', 'error');
        return;
      }

      await addTeacherExpense({
        variables: {
          pageFinalId: parseInt(data.getPageFinalByPage1Id.id),
          input: formData
        }
      });

      console.log('[PageFinalEdit] handleAddTeacherExpense 성공');
    } catch (error) {
      console.error('[PageFinalEdit] handleAddTeacherExpense 오류:', {
        error: error.message,
        formData,
        stack: error.stack
      });
      // Error handling is done in mutation onError callback
    }
  };
  
  const handleUpdateTeacherExpense = async (id, formData) => {
    console.log('[PageFinalEdit] handleUpdateTeacherExpense 시작:', {
      id,
      formData,
      currentExpenseCounts: {
        planned: teacherPlannedExpenses.length,
        executed: teacherExecutedExpenses.length
      }
    });

    try {
      await updateTeacherExpense({
        variables: { id, input: formData }
      });

      console.log('[PageFinalEdit] handleUpdateTeacherExpense 성공');
    } catch (error) {
      console.error('[PageFinalEdit] handleUpdateTeacherExpense 오류:', {
        error: error.message,
        id,
        formData,
        stack: error.stack
      });
      // Error handling is done in mutation onError callback
    }
  };
  
  const handleDeleteTeacherExpense = async (id) => {
    console.log('[PageFinalEdit] handleDeleteTeacherExpense 시작:', {
      id,
      currentExpenseCounts: {
        planned: teacherPlannedExpenses.length,
        executed: teacherExecutedExpenses.length
      }
    });

    try {
      await deleteTeacherExpense({
        variables: { id }
      });

      console.log('[PageFinalEdit] handleDeleteTeacherExpense 성공');
      
      // Update local state immediately for delete operations
      setTeacherPlannedExpenses(prev => prev.filter(item => item.id !== id));
      setTeacherExecutedExpenses(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('[PageFinalEdit] handleDeleteTeacherExpense 오류:', {
        error: error.message,
        id,
        stack: error.stack
      });
      // Error handling is done in mutation onError callback
    }
  };
  
  // Participant expense handlers
  const handleAddParticipantExpense = async (formData) => {
    console.log('[PageFinalEdit] handleAddParticipantExpense 시작:', {
      formData,
      pageFinalId: data?.getPageFinalByPage1Id?.id,
      currentExpenseCounts: {
        planned: participantPlannedExpenses.length,
        executed: participantExecutedExpenses.length
      }
    });

    try {
      if (!data?.getPageFinalByPage1Id?.id) {
        console.error('[PageFinalEdit] handleAddParticipantExpense: pageFinalId 없음');
        showAlert('페이지 정보가 없습니다. 페이지를 새로고침해 주세요.', 'error');
        return;
      }

      await addParticipantExpense({
        variables: {
          pageFinalId: parseInt(data.getPageFinalByPage1Id.id),
          input: formData
        }
      });

      console.log('[PageFinalEdit] handleAddParticipantExpense 성공');
    } catch (error) {
      console.error('[PageFinalEdit] handleAddParticipantExpense 오류:', {
        error: error.message,
        formData,
        stack: error.stack
      });
      // Error handling is done in mutation onError callback
    }
  };
  
  const handleUpdateParticipantExpense = async (id, formData) => {
    // Remove any __typename or id properties if they exist
    const { __typename, id: itemId, ...cleanInput } = formData;
    
    try {
      await updateParticipantExpense({
        variables: {
          id: parseInt(id),
          input: cleanInput
        }
      });
    } catch (error) {
      console.error('Error updating participant expense:', error);
      // Error handling is done in mutation onError callback
    }
  };
  
  const handleDeleteParticipantExpense = async (id) => {
    try {
      await deleteParticipantExpense({
        variables: {
          id: parseInt(id)
        }
      });
      
      // Update local state immediately for delete operations
      setParticipantPlannedExpenses(prev => prev.filter(item => item.id !== id));
      setParticipantExecutedExpenses(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting participant expense:', error);
      // 클라이언트에서 UI 업데이트 - 이미 삭제된 항목이라면 UI에서도 제거
      if (error.message.includes('Record to delete does not exist')) {
        showAlert('항목이 이미 삭제되었습니다. 목록을 새로고침합니다.', 'info');
        // Immediately update local state even if there was an error
        setParticipantPlannedExpenses(prev => prev.filter(item => item.id !== id));
        setParticipantExecutedExpenses(prev => prev.filter(item => item.id !== id));
      }
      // Other error handling is done in mutation onError callback
    }
  };

  console.log("incomeItemsincomeItems",incomeItems)
  
  // Income handlers
  const handleAddIncome = async (formData) => {
    console.log('[PageFinalEdit] handleAddIncome 시작:', {
      formData,
      pageFinalId: data?.getPageFinalByPage1Id?.id,
      currentIncomeCount: incomeItems.length,
      currentIncomeItems: incomeItems.map(item => ({
        id: item.id,
        category: item.category,
        amount: item.amount,
        details: item.details,
        discount_rate: item.discount_rate
      }))
    });

    // Remove is_planned from formData for income items
    const { is_planned, ...inputForMutation } = formData;

    console.log('[PageFinalEdit] handleAddIncome 처리된 입력 데이터:', {
      originalData: formData,
      cleanedData: inputForMutation,
      removedFields: { is_planned }
    });

    try {
      if (!data?.getPageFinalByPage1Id?.id) {
        console.error('[PageFinalEdit] handleAddIncome: pageFinalId 없음');
        showAlert('페이지 정보가 없습니다. 페이지를 새로고침해 주세요.', 'error');
        return;
      }

      const result = await addIncomeItem({
        variables: {
          pageFinalId: parseInt(data.getPageFinalByPage1Id.id),
          input: inputForMutation
        }
      });

      console.log('[PageFinalEdit] handleAddIncome 성공:', {
        newItem: result.data?.addIncomeItem,
        newIncomeCount: incomeItems.length + 1
      });
    } catch (error) {
      console.error('[PageFinalEdit] handleAddIncome 오류:', {
        error: error.message,
        formData: inputForMutation, 
        stack: error.stack
      });
      // Error handling is done in mutation onError callback
    }
  };
  
  const handleUpdateIncome = async (id, formData) => {
    console.log('[PageFinalEdit] handleUpdateIncome 시작:', {
      id,
      formData,
      currentIncomeItem: incomeItems.find(item => item.id === id)
    });

    // Remove any __typename, id, and is_planned properties if they exist
    const { __typename, id: itemId, is_planned, ...cleanInput } = formData;
    
    console.log('[PageFinalEdit] handleUpdateIncome 처리된 데이터:', {
      originalData: formData,
      cleanedData: cleanInput,
      removedFields: { __typename, id: itemId, is_planned }
    });
    
    try {
      const result = await updateIncomeItem({
        variables: {
          id: parseInt(id),
          input: cleanInput
        }
      });

      console.log('[PageFinalEdit] handleUpdateIncome 성공:', {
        updatedItem: result.data?.updateIncomeItem
      });
    } catch (error) {
      console.error('[PageFinalEdit] handleUpdateIncome 오류:', {
        error: error.message,
        id,
        formData: cleanInput,
        stack: error.stack
      });
      // Error handling is done in mutation onError callback
    }
  };
  
  const handleDeleteIncome = async (id) => {
    console.log('[PageFinalEdit] handleDeleteIncome 시작:', {
      id,
      currentIncomeCount: incomeItems.length,
      itemToDelete: incomeItems.find(item => item.id === id)
    });

    try {
      await deleteIncomeItem({
        variables: {
          id: parseInt(id)
        }
      });
      
      console.log('[PageFinalEdit] handleDeleteIncome 성공');
      
      // Update local state immediately for delete operations
      setIncomeItems(prev => {
        const newItems = prev.filter(item => item.id !== id);
        console.log('[PageFinalEdit] handleDeleteIncome state 업데이트:', {
          beforeCount: prev.length,
          afterCount: newItems.length,
          deletedId: id
        });
        return newItems;
      });
    } catch (error) {
      console.error('[PageFinalEdit] handleDeleteIncome 오류:', {
        error: error.message,
        id,
        stack: error.stack
      });
      
      // 클라이언트에서 UI 업데이트 - 이미 삭제된 항목이라면 UI에서도 제거
      if (error.message.includes('Record to delete does not exist')) {
        console.log('[PageFinalEdit] handleDeleteIncome: 이미 삭제된 항목, UI에서 제거');
        showAlert('항목이 이미 삭제되었습니다. 목록을 새로고침합니다.', 'info');
        // Immediately update local state even if there was an error
        setIncomeItems(prev => prev.filter(item => item.id !== id));
      }
      // Other error handling is done in mutation onError callback
    }
  };

  // Discount handlers for Teacher Planned Expenses
  const handleApplyTeacherPlannedDiscount = async (discountRate) => {
    try {
      const updatedItems = [];
      
      for (const item of teacherPlannedExpenses) {
        const discountedAmount = Math.floor(item.amount * (100 - discountRate) / 100);
        
        const serverData = {
          category: item.category,
          amount: discountedAmount,
          details: item.details,
          notes: item.notes,
          is_planned: item.is_planned,
          discount_rate: discountRate
        };
        
        await updateTeacherExpense({
        variables: {
            id: parseInt(item.id),
            input: serverData
          }
        });
        
        updatedItems.push({
          ...item,
          amount: discountedAmount,
          discount_rate: discountRate
        });
      }
      
      setTeacherPlannedExpenses(updatedItems);
      showAlert(`강사 예정금액에 ${discountRate}% 할인이 적용되었습니다.`, 'success');
    } catch (error) {
      console.error('Error applying discount to teacher planned expenses:', error);
      showAlert(`할인 적용 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  // Discount handlers for Teacher Executed Expenses
  const handleApplyTeacherExecutedDiscount = async (discountRate) => {
    try {
      const updatedItems = [];
      
      for (const item of teacherExecutedExpenses) {
        const discountedAmount = Math.floor(item.amount * (100 - discountRate) / 100);
        
        const serverData = {
          category: item.category,
          amount: discountedAmount,
          details: item.details,
          notes: item.notes,
          is_planned: item.is_planned,
          discount_rate: discountRate
        };
        
        await updateTeacherExpense({
        variables: {
            id: parseInt(item.id),
            input: serverData
          }
        });
        
        updatedItems.push({
          ...item,
          amount: discountedAmount,
          discount_rate: discountRate
        });
      }
      
      setTeacherExecutedExpenses(updatedItems);
      showAlert(`강사 집행금액에 ${discountRate}% 할인이 적용되었습니다.`, 'success');
    } catch (error) {
      console.error('Error applying discount to teacher executed expenses:', error);
      showAlert(`할인 적용 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  // Discount handlers for Participant Planned Expenses
  const handleApplyParticipantPlannedDiscount = async (discountRate) => {
    try {
      const updatedItems = [];
      
      for (const item of participantPlannedExpenses) {
        const discountedAmount = Math.floor(item.amount * (100 - discountRate) / 100);
        
        const serverData = {
          category: item.category,
          amount: discountedAmount,
          details: item.details,
          notes: item.notes,
          is_planned: item.is_planned,
          discount_rate: discountRate
        };
        
        await updateParticipantExpense({
        variables: {
            id: parseInt(item.id),
            input: serverData
          }
        });
        
        updatedItems.push({
          ...item,
          amount: discountedAmount,
          discount_rate: discountRate
        });
      }
      
      setParticipantPlannedExpenses(updatedItems);
      showAlert(`참가자 예정금액에 ${discountRate}% 할인이 적용되었습니다.`, 'success');
    } catch (error) {
      console.error('Error applying discount to participant planned expenses:', error);
      showAlert(`할인 적용 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  // Discount handlers for Participant Executed Expenses
  const handleApplyParticipantExecutedDiscount = async (discountRate) => {
    try {
      const updatedItems = [];
      
      for (const item of participantExecutedExpenses) {
        const discountedAmount = Math.floor(item.amount * (100 - discountRate) / 100);
        
        const serverData = {
          category: item.category,
          amount: discountedAmount,
          details: item.details,
          notes: item.notes,
          is_planned: item.is_planned,
          discount_rate: discountRate
        };
        
        await updateParticipantExpense({
        variables: {
            id: parseInt(item.id),
            input: serverData
          }
        });
        
        updatedItems.push({
          ...item,
          amount: discountedAmount,
          discount_rate: discountRate
        });
      }
      
      setParticipantExecutedExpenses(updatedItems);
      showAlert(`참가자 집행금액에 ${discountRate}% 할인이 적용되었습니다.`, 'success');
    } catch (error) {
      console.error('Error applying discount to participant executed expenses:', error);
      showAlert(`할인 적용 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  // Discount handlers for Income Items
  const handleApplyIncomeDiscount = async (discountRate) => {
    console.log('[PageFinalEdit] handleApplyIncomeDiscount 시작:', {
      discountRate,
      currentIncomeCount: incomeItems.length,
      incomeItems: incomeItems.map(item => ({
        id: item.id,
        category: item.category,
        amount: item.amount,
        currentDiscountRate: item.discount_rate
      }))
    });

    try {
      const updatedItems = [];
      
      for (const item of incomeItems) {
        const originalAmount = item.amount;
        const discountedAmount = Math.floor(item.amount * (100 - discountRate) / 100);
        
        console.log('[PageFinalEdit] handleApplyIncomeDiscount 개별 항목 처리:', {
          itemId: item.id,
          category: item.category,
          originalAmount,
          discountRate,
          discountedAmount,
          difference: originalAmount - discountedAmount
        });
        
        const serverData = {
          category: item.category,
          amount: discountedAmount,
          details: item.details,
          notes: item.notes,
          discount_rate: discountRate
        };
        
        await updateIncomeItem({
        variables: {
            id: parseInt(item.id),
            input: serverData
          }
        });
        
        updatedItems.push({
          ...item,
          amount: discountedAmount,
          discount_rate: discountRate
        });
      }
      
      console.log('[PageFinalEdit] handleApplyIncomeDiscount 완료:', {
        updatedItemsCount: updatedItems.length,
        appliedDiscountRate: discountRate,
        updatedItems: updatedItems.map(item => ({
          id: item.id,
          category: item.category,
          amount: item.amount,
          discount_rate: item.discount_rate
        }))
      });
      
      setIncomeItems(updatedItems);
      showAlert(`수입항목에 ${discountRate}% 할인이 적용되었습니다.`, 'success');
    } catch (error) {
      console.error('[PageFinalEdit] handleApplyIncomeDiscount 오류:', {
        error: error.message,
        discountRate,
        incomeItemsCount: incomeItems.length,
        stack: error.stack
      });
      showAlert(`할인 적용 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  // Handler for saving complaint text
  const handleSaveComplaint = async () => {
    try {
      await upsertPageFinal({
        variables: {
          input: {
            page1_id: page1Id,
            complaint
          }
        }
      });
      
      // No need to update state as it's already updated via controlled input
      
      const message = '민원 사항이 저장되었습니다.';
      showAlert(message, 'success');
      
      if (onDataUpdate) {
        onDataUpdate(message);
      }
    } catch (error) {
      console.error('Error saving complaint:', error);
      showAlert(`민원 사항 저장 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };
  
  // Handler for saving discount info
  const handleSaveDiscountInfo = async () => {
    try {
      const response = await updateDiscountInfo({
        variables: {
          pageFinalId: parseInt(data?.getPageFinalByPage1Id?.id),
          discountRate: parseInt(discountRate) || 0,
          discountNotes: discountNotes || ''
        }
      });
      
      // No need to update state as it's already updated via controlled inputs
      showAlert('할인 정보가 업데이트되었습니다.', 'success');
      
      if (onDataUpdate) {
        onDataUpdate('할인 정보가 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('Error saving discount info:', error);
      showAlert(`할인 정보 저장 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };
  
  // 개선된 알림 처리 함수 - 중복 방지 및 큐 관리
  const showAlert = (message, severity = 'info') => {
    // 로딩 중에는 인포 메시지만 콘솔에 기록
    if ((loading || savingPageFinal) && severity === 'info') {
      console.log(`[Silent] ${severity}: ${message}`);
      return;
    }
    
    // 일괄 작업 메시지는 특별 처리
    if (message.includes('삭제하는 중') || message.includes('불러오는 중')) {
      // 진행 중 메시지는 기존 큐를 모두 비우고 이 메시지만 표시
      setAlertQueue([]);
      setAlertMessage(message);
      setAlertSeverity(severity);
      setAlertOpen(true);
      return;
    }

    // 알림 유형별 그룹화를 위한 메시지 분류
    const getMessageType = (msg) => {
      if (msg.includes('삭제')) return 'delete';
      if (msg.includes('추가')) return 'add';
      if (msg.includes('수정')) return 'update';
      if (msg.includes('불러왔습니다')) return 'import';
      return 'other';
    };
    
    const messageType = getMessageType(message);
    
    // 현재 알림 큐에서 같은 유형의 메시지가 있는지 확인
    const hasSimilarMessage = alertQueue.some(item => 
      getMessageType(item.message) === messageType
    );
    
    // 같은 유형의 메시지가 이미 있다면 새 메시지 무시
    if (hasSimilarMessage) {
      console.log(`[Skipped similar] ${severity}: ${message}`);
      return;
    }
    
    // 큐가 너무 길어지지 않도록 관리 (최대 1개만 유지)
    if (alertQueue.length > 0) {
      // 기존 알림이 있으면 닫고 새 알림만 표시
      setAlertOpen(false);
      setAlertQueue([]);
      
      // 잠시 후 새 알림 표시
      setTimeout(() => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
      }, 300);
    } else {
      // 큐가 비어있으면 바로 알림 표시
      setAlertQueue([{ message, severity }]);
      setAlertMessage(message);
      setAlertSeverity(severity);
      setAlertOpen(true);
    }
  };

  // 알림 닫기 처리 - 큐를 완전히 비움
  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setAlertOpen(false);
    setAlertQueue([]);
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* 전체 화면 로딩 인디케이터 */}
      {(loading || savingPageFinal || pageLoading || 
        loadingInstructorData || loadingRoomData || loadingMealData || 
        loadingMaterialData || loadingExpenseData || loadingInstructors) && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(255,255,255,0.8)', 
          zIndex: 9999, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 2,
              minWidth: 250
            }}
          >
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              데이터를 불러오는 중
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              잠시만 기다려주세요. 모든 데이터가 로드되고 있습니다.
            </Typography>
          </Paper>
        </Box>
      )}
      
      <ImportSection
        page1Id={page1Id}
        handleAddTeacherExpense={handleAddTeacherExpense}
        handleAddParticipantExpense={handleAddParticipantExpense}
        handleAddIncome={handleAddIncome}
        handleDeleteTeacherExpense={handleDeleteTeacherExpense}
        handleDeleteParticipantExpense={handleDeleteParticipantExpense}
        handleDeleteIncome={handleDeleteIncome}
        handleUpdateTeacherExpense={handleUpdateTeacherExpense}
        handleUpdateParticipantExpense={handleUpdateParticipantExpense}
        handleUpdateIncome={handleUpdateIncome}
        teacherPlannedExpenses={teacherPlannedExpenses}
        teacherExecutedExpenses={teacherExecutedExpenses}
        participantPlannedExpenses={participantPlannedExpenses}
        participantExecutedExpenses={participantExecutedExpenses}
        incomeItems={incomeItems}
        instructors={instructors}
        loadInstructorData={loadInstructorData}
        loadRoomData={loadRoomData}
        loadMealData={loadMealData}
        loadMaterialData={loadMaterialData}
        loadExpenseData={loadExpenseData}
        refetch={refetch}
        showAlert={showAlert}
        setPageLoading={setPageLoading}
        isSocialContribution={isSocialContribution}
      />

      {/* 지출사항-강사 (단위: 천원) */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="지출사항-강사 (단위: 천원)" 
        />
        <Divider />
        <CardContent>
          <ExpenseTable
            data={teacherPlannedExpenses}
            onAdd={(data) => handleAddTeacherExpense({ ...data, is_planned: true })}
            onEdit={handleUpdateTeacherExpense}
            onDelete={handleDeleteTeacherExpense}
            title="예정금액"
            categoryOptions={teacherExpenseCategories}
            onApplyDiscount={handleApplyTeacherPlannedDiscount}
          />
          
          <Box sx={{ mt: 4 }}>
            <ExpenseTable
              data={teacherExecutedExpenses}
              onAdd={(data) => handleAddTeacherExpense({ ...data, is_planned: false })}
              onEdit={handleUpdateTeacherExpense}
              onDelete={handleDeleteTeacherExpense}
              title="집행금액"
              categoryOptions={teacherExpenseCategories}
              onApplyDiscount={handleApplyTeacherExecutedDiscount}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 지출사항-참가자 (단위: 천원) */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="지출사항-참가자 (단위: 천원)" 
        />
        <Divider />
        <CardContent>
          <ExpenseTable
            data={participantPlannedExpenses}
            onAdd={(data) => handleAddParticipantExpense({ ...data, is_planned: true })}
            onEdit={handleUpdateParticipantExpense}
            onDelete={handleDeleteParticipantExpense}
            title="예정금액"
            categoryOptions={participantExpenseCategories}
            onApplyDiscount={handleApplyParticipantPlannedDiscount}
          />
          
          <Box sx={{ mt: 4 }}>
            <ExpenseTable
              data={participantExecutedExpenses}
              onAdd={(data) => handleAddParticipantExpense({ ...data, is_planned: false })}
              onEdit={handleUpdateParticipantExpense}
              onDelete={handleDeleteParticipantExpense}
              title="집행금액"
              categoryOptions={participantExpenseCategories}
              onApplyDiscount={handleApplyParticipantExecutedDiscount}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 수입금액 (단위: 천원) */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="수입금액 (단위: 천원)" 
        />
        <Divider />
        <CardContent>
          {(() => {
            console.log('[PageFinalEdit] 수입금액 섹션 렌더링:', {
              incomeItemsCount: incomeItems.length,
              incomeItems: incomeItems.map(item => ({
                id: item.id,
                category: item.category,
                amount: item.amount,
                discount_rate: item.discount_rate,
                details: item.details,
                notes: item.notes
              })),
              programItems: incomeItems.filter(item => 
                item.category && item.category.includes('프로그램')
              ).map(item => ({
                id: item.id,
                category: item.category,
                amount: item.amount,
                discount_rate: item.discount_rate
              }))
            });
            return null;
          })()}
          <ExpenseTable
            data={incomeItems}
            onAdd={handleAddIncome}
            onEdit={handleUpdateIncome}
            onDelete={handleDeleteIncome}
            title="수입 항목"
            categoryOptions={incomeCategories}
            onApplyDiscount={handleApplyIncomeDiscount}
          />
        </CardContent>
      </Card>

      {/* 민원 사항 섹션을 가장 아래로 이동 */}
      <ComplaintSection
        complaints={complaint}
        handleComplaintChange={(value) => setComplaint(value)}
        handleAddComplaint={handleSaveComplaint}
        handleRemoveComplaint={() => {}}
      />

      {/* 할인 섹션 비표시 처리 */}
      {/* 
      <DiscountSection
        discounts={{ rate: discountRate, notes: discountNotes }}
        handleDiscountChange={(field) => (value) => {
          if (field === 'rate') {
            setDiscountRate(value);
          } else if (field === 'notes') {
            setDiscountNotes(value);
          }
        }}
        handleAddDiscount={handleSaveDiscountInfo}
        handleRemoveDiscount={() => {}}
      />
      */}

      {/* Toast Alert */}
      <Snackbar
        key={`alert-${alertMessage}`}
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PageFinalEdit; 