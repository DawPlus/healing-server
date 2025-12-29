import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { actions } from 'store/reducers/new4Reducer';
import { formatDateForDisplay } from 'utils/dateUtils';

// Import components
import MaterialsTable from './MaterialsTable';
import ExpensesTable from './ExpensesTable';
import SyncSettings from './SyncSettings';
import MaterialDialog from './MaterialDialog';
import ExpenseDialog from './ExpenseDialog';

// New component to display Page1 data
const Page1Summary = ({ data }) => {
  if (!data) return null;
  
  const getStatusChip = (status) => {
    switch(status) {
      case 'preparation':
        return <Chip label="가예약" size="small" color="primary" sx={{ fontWeight: 'bold' }} />;
      case 'confirmed':
        return <Chip label="확정예약" size="small" color="success" sx={{ fontWeight: 'bold' }} />;
      case 'canceled':
        return <Chip label="예약취소" size="small" color="error" sx={{ fontWeight: 'bold' }} />;
      case 'completed':
        return <Chip label="완료" size="small" color="info" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={status || "미지정"} size="small" color="default" sx={{ fontWeight: 'bold' }} />;
    }
  };
  
  const getBusinessCategoryText = (category) => {
    switch(category) {
      case 'social_contribution':
        return '사회공헌';
      case 'profit_business':
        return '수익사업';
      default:
        return category || '-';
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, borderLeft: '5px solid #1976d2', boxShadow: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          예약 정보
        </Typography>
        {getStatusChip(data.reservation_status)}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center">
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '120px' }}>
                단체명:
              </Typography>
              <Typography variant="body1">{data.group_name || '-'}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '120px' }}>
                고객명:
              </Typography>
              <Typography variant="body1">{data.customer_name || '-'}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '120px' }}>
                일정:
              </Typography>
              <Typography variant="body1">
                {formatDateForDisplay(data.start_date)} ~ {formatDateForDisplay(data.end_date)}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center">
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '120px' }}>
                연락처:
              </Typography>
              <Typography variant="body1">
                {data.mobile_phone || data.landline_phone || '-'}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '120px' }}>
                이메일:
              </Typography>
              <Typography variant="body1">{data.email || '-'}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', width: '120px' }}>
                사업 구분:
              </Typography>
              <Typography variant="body1">{getBusinessCategoryText(data.business_category)}</Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

const FormView = ({ onBack }) => {
  const dispatch = useDispatch();
  const { id } = useParams();
  
  // Redux state with fallback defaults to prevent errors
  const {
    formData = { id: null, project_name: '', created_by: '' },
    selectedExpense = null,
    materials = [],
    materialTotal = 0,
    materialForm = { id: null, expense_id: null, material_type: '', amount: '', quantity: '', total: 0, note: '' },
    etcExpenses = [],
    etcExpenseTotal = 0,
    etcExpenseForm = { id: null, expense_id: null, name: '', amount: '', expense_type: '', quantity: '', price: '', note: '' },
    syncSettings = [],
    isLoading = false
  } = useSelector(state => state.new4 || {});
  
  // Local state
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(false);
  const [editingExpense, setEditingExpense] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Check if we have page1 data
  const hasPage1Data = Boolean(selectedExpense && selectedExpense.page1_data);
  const isFromPage1 = Boolean(selectedExpense && (selectedExpense.page1_data || selectedExpense.page1_id));
  
  // Load data if ID is provided
  useEffect(() => {
    // 이미 로드한 경우 또는 id가 없는 경우 로드하지 않음
    if (hasLoaded || !id) return;
    
    // id가 있고, selectedExpense가 없거나 selectedExpense.id가 현재 id와 다른 경우에만 데이터를 가져옴
    if (!selectedExpense || selectedExpense.id?.toString() !== id.toString()) {
      console.log('[FormView] Fetching expense data for ID:', id);
      dispatch(actions.fetchExpense(id));
      setHasLoaded(true);
    }
  }, [id, dispatch, selectedExpense, hasLoaded]);
  
  // Main project expense save/delete handlers
  const handleSaveExpense = () => {
    if (!formData.project_name) {
      alert('프로젝트명은 필수 입력 항목입니다.');
      return;
    }
    
    setLocalLoading(true);
    dispatch(actions.saveExpense());
    
    // Safety timeout to ensure loading is finished even if saga fails
    setTimeout(() => {
      setLocalLoading(false);
    }, 5000);
  };
  
  const handleDeleteExpense = () => {
    if (window.confirm('정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setLocalLoading(true);
      dispatch(actions.deleteExpense(formData.id));
      
      // Safety timeout to ensure loading is finished even if saga fails
      setTimeout(() => {
        setLocalLoading(false);
      }, 5000);
    }
  };
  
  const handleUpdateFormField = (field, value) => {
    dispatch(actions.updateFormField({ field, value }));
  };
  
  // Material handlers
  const handleOpenMaterialDialog = (material = null) => {
    if (material) {
      dispatch(actions.setEditingMaterial(material));
      setEditingMaterial(true);
    } else {
      dispatch(actions.setEditingMaterial({
        id: null,
        expense_id: formData.id,
        material_type: '',
        amount: '',
        quantity: '',
        total: 0,
        note: ''
      }));
      setEditingMaterial(false);
    }
    setShowMaterialDialog(true);
  };
  
  const handleCloseMaterialDialog = () => {
    setShowMaterialDialog(false);
  };
  
  const handleUpdateMaterialForm = (params) => {
    const { field, value } = params;
    dispatch(actions.updateMaterialForm({ field, value }));
  };
  
  const handleSaveMaterial = () => {
    // Validate material form
    if (!materialForm.material_type || !materialForm.amount || !materialForm.quantity) {
      alert('재료 종류, 단가, 수량은 필수 입력 항목입니다.');
      return;
    }
    
    dispatch(actions.addMaterial(materialForm));
    setShowMaterialDialog(false);
  };
  
  const handleDeleteMaterial = (id) => {
    dispatch(actions.removeMaterial(id));
  };
  
  // Expense handlers
  const handleOpenExpenseDialog = (expense = null) => {
    if (expense) {
      dispatch(actions.setEditingEtcExpense(expense));
      setEditingExpense(true);
    } else {
      dispatch(actions.setEditingEtcExpense({
        id: null,
        expense_id: formData.id,
        name: '',
        amount: '',
        expense_type: '',
        quantity: '',
        price: '',
        note: ''
      }));
      setEditingExpense(false);
    }
    setShowExpenseDialog(true);
  };
  
  const handleCloseExpenseDialog = () => {
    setShowExpenseDialog(false);
  };
  
  const handleUpdateExpenseForm = (params) => {
    const { field, value } = params;
    dispatch(actions.updateEtcExpenseForm({ field, value }));
  };
  
  const handleSaveEtcExpense = () => {
    // Validate expense form
    if (!etcExpenseForm.name || !etcExpenseForm.amount || !etcExpenseForm.expense_type) {
      alert('항목명, 금액, 종류는 필수 입력 항목입니다.');
      return;
    }
    
    dispatch(actions.addEtcExpense(etcExpenseForm));
    setShowExpenseDialog(false);
  };
  
  const handleDeleteEtcExpense = (id) => {
    dispatch(actions.removeEtcExpense(id));
  };
  
  const handleToggleSyncSetting = (docId) => {
    dispatch(actions.toggleSyncSetting(docId));
  };
  
  // Rendering loading state
  if (isLoading || localLoading) {
    return (
      <MainCard title="프로젝트 경비 관리">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>데이터를 불러오는 중입니다...</Typography>
        </Box>
      </MainCard>
    );
  }
  
  return (
    <MainCard 
      title={
        <Box display="flex" alignItems="center">
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            {isFromPage1 ? '예약 관련 경비' : '프로젝트 경비'}
          </Typography>
        </Box>
      }
    >
      {/* Page1 예약 정보가 있는 경우 */}
      {hasPage1Data && (
        <Page1Summary data={selectedExpense.page1_data} />
      )}
      
      {/* Page1에서 왔으나 page1_data가 없는 경우 알림 */}
      {isFromPage1 && !hasPage1Data && (
        <Alert severity="info" sx={{ mb: 3 }}>
          이 경비는 예약에서 생성되었지만 예약 상세 정보를 가져올 수 없습니다.
        </Alert>
      )}

      {/* 기본 정보 입력 */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          기본 정보
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="프로젝트명"
              name="project_name"
              value={formData.project_name || ''}
              onChange={(e) => handleUpdateFormField('project_name', e.target.value)}
              fullWidth
              required
              placeholder={hasPage1Data ? selectedExpense.page1_data.group_name || '프로젝트명 입력' : '프로젝트명 입력'}
              helperText={hasPage1Data ? "예약의 단체명이 기본값으로 설정됩니다" : ""}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="작성자"
              name="created_by"
              value={formData.created_by || ''}
              onChange={(e) => handleUpdateFormField('created_by', e.target.value)}
              fullWidth
              placeholder={hasPage1Data ? selectedExpense.page1_data.customer_name || '작성자 입력' : '작성자 입력'}
              helperText={hasPage1Data ? "예약의 고객명이 기본값으로 설정됩니다" : ""}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 재료비 목록 */}
      <MaterialsTable
        materials={materials}
        materialTotal={materialTotal}
        onAddMaterial={() => handleOpenMaterialDialog()}
        onEditMaterial={handleOpenMaterialDialog}
        onDeleteMaterial={handleDeleteMaterial}
      />
      
      {/* 기타 경비 목록 */}
      <ExpensesTable
        expenses={etcExpenses}
        expenseTotal={etcExpenseTotal}
        onAddExpense={() => handleOpenExpenseDialog()}
        onEditExpense={handleOpenExpenseDialog}
        onDeleteExpense={handleDeleteEtcExpense}
      />
      
      {/* 동기화 설정 */}
      <SyncSettings
        settings={syncSettings}
        onToggle={handleToggleSyncSetting}
      />
      
      {/* 버튼 영역 */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {formData.id && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteExpense}
            disabled={isLoading || localLoading}
          >
            삭제
          </Button>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveExpense}
          disabled={isLoading || localLoading}
        >
          저장
        </Button>
      </Box>
      
      {/* 다이얼로그 */}
      <MaterialDialog
        open={showMaterialDialog}
        onClose={handleCloseMaterialDialog}
        material={materialForm}
        onUpdate={handleUpdateMaterialForm}
        onSave={handleSaveMaterial}
        editing={editingMaterial}
      />
      
      <ExpenseDialog
        open={showExpenseDialog}
        onClose={handleCloseExpenseDialog}
        expense={etcExpenseForm}
        onUpdate={handleUpdateExpenseForm}
        onSave={handleSaveEtcExpense}
        editing={editingExpense}
      />
    </MainCard>
  );
};

export default FormView; 