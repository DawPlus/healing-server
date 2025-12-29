import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar,
  Paper,
  TextField,
  Grid,
  LinearProgress
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import moment from 'moment';
import apolloClient from 'utils/apolloClient';
import { gql } from '@apollo/client';
// Import common components and utilities
import Page1InfoCard from 'views/new/common/Page1InfoCard';
import { formatDateForServer } from 'views/new/common/Page1DataMapper';

// Import page-specific components for expense management
import MaterialsTable from './MaterialsTable';
import ExpensesTable from './ExpensesTable';
import MaterialDialog from './MaterialDialog';
import ExpenseDialog from './ExpenseDialog';

// Import service functions
import { fetchPage4DataById, fetchPage4DataByPage1Id, savePage4Data, deletePage4Data, saveMaterial, saveExpense, deleteMaterial, deleteExpense, updatePage4Totals } from './services/dataService';

// Import icons
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import MoneyIcon from '@mui/icons-material/Money';
// GraphQL 쿼리 추가
const GET_PAGE1_BY_ID = gql`
  query GetPage1ById($id: Int!) {
    getPage1ById(id: $id) {
      id
      group_name
      customer_name
      total_count
      start_date
      end_date
      reservation_status
      email
      mobile_phone
    }
  }
`;



const Edit = ({ overrideId, isEmbedded = false, onDataUpdate, hideReservationInfo = false }) => {
  const { id: urlId, page1Id: urlPage1Id } = useParams();
  const id = urlId;
  const page1Id = overrideId || urlPage1Id; // Use overrideId if provided
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if initial data fetch has been done
  const initialFetchDone = useRef(false);
  
  // Local state
  const [formData, setFormData] = useState({ 
    id: null, 
    project_name: '', 
    created_by: '',
    page1_id: overrideId ? parseInt(overrideId) : (urlPage1Id ? parseInt(urlPage1Id) : null),
    material_total: 0,
    etc_expense_total: 0,
    total_budget: 0
  });
  const [page1Data, setPage1Data] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [etcExpenses, setEtcExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    id: null,
    expense_id: null,
    material_type: '',
    name: '',
    amount: '',
    actual_amount: '',
    quantity: '',
    total: 0,
    note: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    id: null,
    expense_id: null,
    name: '',
    expense_type: '',
    amount: '',
    actual_price: '',
    actual_amount: '',
    quantity: '',
    price: '',
    note: ''
  });
  const [editingMaterial, setEditingMaterial] = useState(false);
  const [editingExpense, setEditingExpense] = useState(false);
  
  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  // Determine if we're editing an existing Page4 record or creating based on Page1
  const isEditingPage4 = Boolean(id); // True if we have a page4 ID
  const isCreatingFromPage1 = Boolean(page1Id); // True if we're creating from page1 ID
  
  // Get the effective ID to work with (could be id for existing Page4 record or page1Id for new records)
  const effectiveId = id || page1Id;
  
  // Show alert message
  const showAlert = (message, severity = 'info') => {
    if (!isMounted.current) return;
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
    
    // Call onDataUpdate if provided and severity is success
    if (typeof onDataUpdate === 'function' && severity === 'success') {
      onDataUpdate(message);
    }
  };
  
  // Calculate totals
  const materialTotal = materials.reduce((total, item) => total + (parseInt(item.total) || 0), 0);
  const etcExpenseTotal = etcExpenses.reduce((total, item) => total + (parseInt(item.amount) || 0), 0);
  const totalBudget = materialTotal + etcExpenseTotal;
  
  // Effect to update totals when materials or expenses change
  useEffect(() => {
    const newMaterialTotal = materials.reduce((total, item) => total + (parseInt(item.total) || 0), 0);
    const newEtcExpenseTotal = etcExpenses.reduce((total, item) => total + (parseInt(item.amount) || 0), 0);
    const newTotalBudget = newMaterialTotal + newEtcExpenseTotal;
    
    if (
      formData.material_total !== newMaterialTotal ||
      formData.etc_expense_total !== newEtcExpenseTotal ||
      formData.total_budget !== newTotalBudget
    ) {
      const updatedFormData = {
        ...formData,
        material_total: newMaterialTotal,
        etc_expense_total: newEtcExpenseTotal,
        total_budget: newTotalBudget
      };
      
      setFormData(updatedFormData);
      
      // If we have a valid ID, update the totals in the database
      if (formData.id && !isNaN(Number(formData.id))) {
        // Use a debounce approach to avoid too many API calls
        const timeoutId = setTimeout(() => {
          updatePage4Totals(updatedFormData, showAlert)
            .then(success => {
              if (success) {
                console.log('[Edit4] Updated Page4 totals in database');
              }
            })
            .catch(error => {
              console.error('[Edit4] Error updating Page4 totals:', error);
            });
        }, 500); // Wait 500ms before updating
        
        // Clean up the timeout when the component unmounts or the effect runs again
        return () => clearTimeout(timeoutId);
      }
    }
  }, [materials, etcExpenses, formData.id]);
  
  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log('[Edit4] Component unmounting, cleaning up');
      isMounted.current = false;
    };
  }, []);
  
  // Log the component state early for debugging
  useEffect(() => {
    console.log('[Edit4] Component mounting with params:', { 
      id, 
      page1Id, 
      isEditingPage4, 
      isCreatingFromPage1,
      effectiveId
    });
  }, [id, page1Id, isEditingPage4, isCreatingFromPage1, effectiveId]);
  
  // Initial data load
  useEffect(() => {
    if (!page1Id || initialFetchDone.current) return;
    
    console.log('[Edit4] Component mounted, page1Id:', page1Id);
    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        // 문자열을 정수로 확실히 변환
        const page1IdInt = Number(page1Id);
        if (isNaN(page1IdInt)) {
          showAlert('유효하지 않은 Page1 ID입니다.', 'error');
          navigate('/new/page4');
          return;
        }
        
        // Page1 ID를 기준으로 page4 데이터 조회
        console.log(`[Edit4] Fetching page4 data for page1_id: ${page1IdInt}`);
        const result = await fetchPage4DataByPage1Id(page1IdInt, null, showAlert);
        
        if (result) {
          // Page1에 연결된 Page4 데이터가 있는 경우
          console.log('[Edit4] Found existing Page4 data for page1_id:', page1IdInt, result);
          setFormData(result);
          setPage1Data(result.page1);
          setMaterials(result.materials || []);
          setEtcExpenses(result.expenses || []);
          showAlert('경비 데이터를 불러왔습니다.', 'success');
        } else {
          // 데이터가 없는 경우 Page1 정보를 기반으로 초기화
          console.log('[Edit4] No existing Page4 data, initializing with Page1 data');
          try {
            const { data } = await apolloClient.query({
              query: GET_PAGE1_BY_ID,
              variables: { id: page1IdInt }
            });
            
            if (data && data.getPage1ById) {
              const page1 = data.getPage1ById;
              setPage1Data(page1);
              setFormData({
                id: null,
                project_name: page1.group_name || '새 프로젝트',
                created_by: page1.customer_name || '',
                page1_id: page1IdInt,
                material_total: 0,
                etc_expense_total: 0,
                total_budget: 0
              });
              setMaterials([]);
              setEtcExpenses([]);
              showAlert('새 경비 데이터를 생성합니다.', 'info');
            } else {
              throw new Error('Page1 데이터를 찾을 수 없습니다.');
            }
          } catch (error) {
            console.error('[Edit4] Error fetching Page1 data:', error);
            showAlert('Page1 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
            navigate('/new/page4');
          }
        }
      } catch (error) {
        console.error('[Edit4] Error fetching data:', error);
        showAlert('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        navigate('/new/page4');
      } finally {
        setIsLoading(false);
        initialFetchDone.current = true;
      }
    };
    
    fetchData();
    
    return () => {
      initialFetchDone.current = false;
    };
  }, [page1Id, navigate]);
  
  // Handle form field updates
  const handleUpdateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Material dialog handlers
  const handleOpenMaterialDialog = () => {
    // Reset the material form
    setMaterialForm({
      id: null,
      expense_id: null, // null로 설정, 저장 시점에 formData.id 사용
      material_type: '',
      name: '',
      amount: '',
      actual_amount: '',
      quantity: '',
      total: 0,
      note: ''
    });
    setEditingMaterial(false);
    setShowMaterialDialog(true);
  };
  
  const handleCloseMaterialDialog = () => {
    setShowMaterialDialog(false);
  };
  
  const handleUpdateMaterialForm = (field, value) => {
    setMaterialForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate total if amount or quantity changes
      if (field === 'amount' || field === 'quantity') {
        const amount = parseInt(updated.amount) || 0;
        const quantity = parseInt(updated.quantity) || 0;
        updated.total = amount * quantity;
        
        // 디버깅용 로그 추가
        console.log(`[Edit4] Calculated total: ${updated.total} = ${amount} * ${quantity}`);
      }
      
      return updated;
    });
  };
  
  // 기존 ID로 데이터를 다시 불러오는 함수 추가
  const refetchData = async () => {
    console.log('[Edit4] Refetching data with ID:', formData.id);
    if (!formData.id) return;
    
    setIsLoading(true);
    try {
      const result = await fetchPage4DataById(formData.id, null, showAlert);
      if (result) {
        console.log('[Edit4] Data refetched successfully:', result);
        console.log('[Edit4] Materials:', result.materials);
        console.log('[Edit4] Expenses:', result.expenses);
        
        // 명시적으로 각 필드를 로깅하여 디버깅에 도움이 되도록 합니다
        if (result.materials && result.materials.length > 0) {
          result.materials.forEach((material, index) => {
            console.log(`[Edit4] Material ${index}:`, {
              id: material.id,
              material_type: material.material_type,
              amount: material.amount,
              actual_amount: material.actual_amount,
              quantity: material.quantity,
              total: material.total
            });
          });
        }
        
        if (result.expenses && result.expenses.length > 0) {
          result.expenses.forEach((expense, index) => {
            console.log(`[Edit4] Expense ${index}:`, {
              id: expense.id,
              expense_type: expense.expense_type,
              amount: expense.amount,
              actual_amount: expense.actual_amount,
              price: expense.price,
              actual_price: expense.actual_price
            });
          });
        }
        
        // 상태 업데이트 순서가 중요함 - 전체 데이터를 먼저 설정
        setFormData(result);
        
        // 명시적으로 materials와 expenses를 deep copy하여 설정
        // 이렇게 하면 참조 문제를 방지하고 상태 업데이트가 확실히 감지됨
        const materialsCopy = result.materials ? [...result.materials] : [];
        const expensesCopy = result.expenses ? [...result.expenses] : [];
        
        setMaterials(materialsCopy);
        setEtcExpenses(expensesCopy);
        
        // 상태가 업데이트되었음을 확인
        console.log('[Edit4] State updated with new data');
      }
    } catch (error) {
      console.error('[Edit4] Error refetching data:', error);
      showAlert('데이터를 다시 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveMaterial = async () => {
    try {
      // Validate the form
      if (!materialForm.material_type || !materialForm.name) {
        Swal.fire({
          title: '입력 오류',
          text: '자재 종류, 품명은 필수 입력 항목입니다.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      // **중요**: Page4 메인 레코드가 없으면 먼저 저장
      let currentExpenseId = formData.id;
      if (!currentExpenseId) {
        console.log('[Edit4] No Page4 ID found, saving main record first...');
        const savedData = await handleSaveRecord();
        if (!savedData || !savedData.id) {
          showAlert('메인 경비 데이터를 먼저 저장해야 합니다.', 'error');
          return;
        }
        currentExpenseId = savedData.id;
        console.log('[Edit4] Main record saved, expense_id is now:', currentExpenseId);
      }
      
      // Remove fields not needed for GraphQL input
      const { __typename, ...cleanedMaterial } = materialForm;
      
      // Prepare the data for submission
      const materialData = {
        ...cleanedMaterial,
        // expense_id must be a number - 방금 저장된 ID 사용
        expense_id: Number(currentExpenseId),
        // Convert amount to a number
        amount: parseInt(cleanedMaterial.amount || 0),
        actual_amount: parseInt(cleanedMaterial.actual_amount || 0),
        // Ensure quantity is a number
        quantity: parseInt(cleanedMaterial.quantity || 0),
        total: parseInt(cleanedMaterial.total || 0)
      };
      
      // 32-bit integer 범위 검증 (GraphQL Int 타입 제한)
      const MAX_INT_32 = 2147483647; // 2^31 - 1
      const MIN_INT_32 = -2147483648; // -2^31
      
      if (materialData.total > MAX_INT_32) {
        Swal.fire({
          title: '입력 오류',
          text: `합계가 너무 큽니다. 최대값: ${MAX_INT_32.toLocaleString()}원\n현재값: ${materialData.total.toLocaleString()}원\n\n단가나 수량을 줄여주세요.`,
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      if (materialData.amount > MAX_INT_32) {
        Swal.fire({
          title: '입력 오류',
          text: `단가가 너무 큽니다. 최대값: ${MAX_INT_32.toLocaleString()}원`,
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      if (materialData.actual_amount > MAX_INT_32) {
        Swal.fire({
          title: '입력 오류',
          text: `실제 단가가 너무 큽니다. 최대값: ${MAX_INT_32.toLocaleString()}원`,
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      console.log('[Edit4] Submitting material data:', materialData);
      
      setIsLoading(true);
      
      const result = await saveMaterial(materialData, showAlert);
      
      if (result) {
        // 저장된 재료를 즉시 로컬 상태에 반영
        if (editingMaterial) {
          // 수정인 경우: 기존 재료 업데이트
          setMaterials(prevMaterials => 
            prevMaterials.map(material => 
              material.id === result.id ? result : material
            )
          );
        } else {
          // 추가인 경우: 새 재료 추가
          setMaterials(prevMaterials => [...prevMaterials, result]);
        }
        
        // Reset form
        setMaterialForm({
          id: null,
          expense_id: formData.id,
          material_type: '',
          name: '',
          amount: '',
          actual_amount: '',
          quantity: '',
          total: 0,
          note: ''
        });
        
        // Close dialog
        setShowMaterialDialog(false);
        
        // Reset editing state
        setEditingMaterial(false);
        
        // Show success message
        showAlert(
          editingMaterial 
            ? '자재 정보가 성공적으로 수정되었습니다.' 
            : '자재 정보가 성공적으로 추가되었습니다.', 
          'success'
        );
        
        // Call onDataUpdate if provided
        if (typeof onDataUpdate === 'function') {
          onDataUpdate('자재 정보가 업데이트되었습니다.');
        }
        
        // 백그라운드에서 전체 데이터 동기화 (UI 블로킹 없이)
        setTimeout(async () => {
          try {
            console.log('[Edit4] Background data sync...');
            await refetchData();
          } catch (error) {
            console.error('[Edit4] Background sync error:', error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('[Edit4] Error saving material:', error);
      showAlert('자재 저장 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMaterial = async (id) => {
    Swal.fire({
      title: '재료비 삭제',
      text: '이 재료비를 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme.palette.error.main
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        
        try {
          // Delete from backend
          const success = await deleteMaterial(id, showAlert);
          
          if (success) {
            // 즉시 로컬 상태에서 삭제된 재료 제거
            setMaterials(prevMaterials => 
              prevMaterials.filter(material => material.id !== id)
            );
            
            showAlert('재료비가 성공적으로 삭제되었습니다.', 'success');
            
            // 백그라운드에서 전체 데이터 동기화 (UI 블로킹 없이)
            setTimeout(async () => {
              try {
                console.log('[Edit4] Background data sync after deletion...');
                await refetchData();
              } catch (error) {
                console.error('[Edit4] Background sync error:', error);
              }
            }, 100);
          }
        } catch (error) {
          console.error('[Edit4] Error deleting material:', error);
          showAlert('재료비 삭제 중 오류가 발생했습니다.', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };
  
  const handleEditMaterial = (material) => {
    // Set form with existing material data
    setMaterialForm({
      id: material.id,
      expense_id: material.expense_id,
      material_type: material.material_type,
      name: material.name || '',
      amount: material.amount?.toString() || '',
      actual_amount: material.actual_amount?.toString() || '',
      quantity: material.quantity?.toString() || '',
      total: material.total?.toString() || '0',
      note: material.note || ''
    });
    setEditingMaterial(true);
    setShowMaterialDialog(true);
  };
  
  // Expense dialog handlers
  const handleOpenExpenseDialog = () => {
    // Reset the expense form
    setExpenseForm({
      id: null,
      expense_id: null, // null로 설정, 저장 시점에 formData.id 사용
      name: '',
      expense_type: '',
      amount: '',
      actual_price: '',
      actual_amount: '',
      quantity: '',
      price: '',
      note: ''
    });
    setEditingExpense(false);
    setShowExpenseDialog(true);
  };
  
  const handleCloseExpenseDialog = () => {
    setShowExpenseDialog(false);
  };
  
  const handleEditExpense = (expense) => {
    // Set form with existing expense data
    setExpenseForm({
      id: expense.id,
      expense_id: expense.expense_id,
      name: expense.name || '',
      expense_type: expense.expense_type || '',
      amount: expense.amount?.toString() || '',
      actual_price: expense.actual_price?.toString() || '',
      actual_amount: expense.actual_amount?.toString() || '',
      quantity: expense.quantity || '',
      price: expense.price || '',
      note: expense.note || ''
    });
    setEditingExpense(true);
    setShowExpenseDialog(true);
  };
  
  // 자동 저장 함수 (handleSave에서 저장 로직만 분리)
  const handleSaveRecord = async () => {
    try {
      // Validate form
      if (!formData.project_name) {
        showAlert('프로젝트명은 필수 입력 항목입니다.', 'error');
        return false;
      }
      
      if (!formData.page1_id) {
        showAlert('Page1 ID가 필요합니다.', 'error');
        return false;
      }
      
      console.log('[Edit4] Saving record:', formData);
      setIsLoading(true);
      
      // Recalculate totals based on current materials and expenses
      const materialTotal = materials.reduce((total, item) => total + (parseInt(item.total) || 0), 0);
      const etcExpenseTotal = etcExpenses.reduce((total, item) => total + (parseInt(item.amount) || 0), 0);
      const totalBudget = materialTotal + etcExpenseTotal;
      
      // Remove fields not needed for GraphQL input
      const { __typename, page1, created_at, updated_at, ...cleanData } = formData;
      
      // Update totals and clean data
      const updatedFormData = {
        ...cleanData,
        project_name: cleanData.project_name,
        created_by: cleanData.created_by || '',
        page1_id: parseInt(overrideId || page1Id || cleanData.page1_id),
        material_total: materialTotal,
        etc_expense_total: etcExpenseTotal,
        total_budget: totalBudget
      };
      
      console.log('[Edit4] Saving cleaned record data:', updatedFormData);
      
      const result = await savePage4Data(updatedFormData, materials, etcExpenses, showAlert);
      
      if (result) {
        // Success, update local state with the saved data
        console.log('[Edit4] Data saved successfully with result:', result);
        setFormData(result);
        setMaterials(result.materials || []);
        setEtcExpenses(result.expenses || []);
        showAlert('경비 데이터가 저장되었습니다.', 'success');
        
        // Call onDataUpdate if provided
        if (typeof onDataUpdate === 'function') {
          onDataUpdate('경비 데이터가 저장되었습니다.');
        }
        
        return result; // 저장된 데이터 객체를 반환
      } else {
        showAlert('저장에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      console.error('[Edit4] Error saving data:', error);
      showAlert('저장 중 오류가 발생했습니다: ' + error.message, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExpenseForm = (field, value) => {
    setExpenseForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate amount if price or quantity changes
      if (field === 'price' || field === 'quantity') {
        const price = parseInt(updated.price) || 0;
        const quantity = parseInt(updated.quantity) || 0;
        updated.amount = price * quantity;
      }
      
      return updated;
    });
  };
  
  const handleSaveExpense = async () => {
    try {
      // Validate required fields
      if (!expenseForm.expense_type) {
        Swal.fire({
          title: '입력 오류',
          text: '종류는 필수 입력 항목입니다.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      // **중요**: Page4 메인 레코드가 없으면 먼저 저장
      let currentExpenseId = formData.id;
      if (!currentExpenseId) {
        console.log('[Edit4] No Page4 ID found, saving main record first...');
        const savedData = await handleSaveRecord();
        if (!savedData || !savedData.id) {
          showAlert('메인 경비 데이터를 먼저 저장해야 합니다.', 'error');
          return;
        }
        currentExpenseId = savedData.id;
        console.log('[Edit4] Main record saved, formData.id is now:', currentExpenseId);
      }
      
      // Additional validation for expense_id
      if (!currentExpenseId || isNaN(Number(currentExpenseId))) {
        showAlert('유효한 expense_id가 없습니다. 페이지를 새로고침한 후 다시 시도해주세요.', 'error');
        return;
      }
      
      // Remove fields not needed for GraphQL input
      const { __typename, ...cleanedExpense } = expenseForm;
      
      // 항목명 기본값 설정 (종류를 기본 항목명으로 사용)
      const name = expenseForm.name || expenseForm.expense_type || '기타비 항목';
      
      // 서버에 전송할 데이터 - GraphQL 스키마 요구사항에 맞게 변환
      const updatedExpense = {
        ...cleanedExpense,
        name: name, // 종류를 항목명으로 사용
        expense_id: Number(currentExpenseId), // 방금 저장된 ID 사용
        amount: Number(cleanedExpense.amount) || 0, // 정수로 변환
        actual_amount: Number(cleanedExpense.actual_amount) || 0, // 정수로 변환
        actual_price: Number(cleanedExpense.actual_price) || 0, // 정수로 변환
        quantity: cleanedExpense.quantity?.toString() || '0', // 문자열로 변환
        price: cleanedExpense.price?.toString() || '0' // 문자열로 변환
      };
      
      // 32-bit integer 범위 검증 (GraphQL Int 타입 제한)
      const MAX_INT_32 = 2147483647; // 2^31 - 1
      
      if (updatedExpense.amount > MAX_INT_32) {
        Swal.fire({
          title: '입력 오류',
          text: `금액이 너무 큽니다. 최대값: ${MAX_INT_32.toLocaleString()}원`,
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      if (updatedExpense.actual_amount > MAX_INT_32) {
        Swal.fire({
          title: '입력 오류',
          text: `실제 금액이 너무 큽니다. 최대값: ${MAX_INT_32.toLocaleString()}원`,
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      if (updatedExpense.actual_price > MAX_INT_32) {
        Swal.fire({
          title: '입력 오류',
          text: `실제 단가가 너무 큽니다. 최대값: ${MAX_INT_32.toLocaleString()}원`,
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return;
      }
      
      console.log('[Edit4] Prepared expense data for saving:', updatedExpense);
      
      setIsLoading(true);
      
      // Save to backend
      const result = await saveExpense(updatedExpense, showAlert);
      
      if (result) {
        // 저장된 기타비용을 즉시 로컬 상태에 반영
        if (editingExpense) {
          // 수정인 경우: 기존 기타비용 업데이트
          setEtcExpenses(prevExpenses => 
            prevExpenses.map(expense => 
              expense.id === result.id ? result : expense
            )
          );
        } else {
          // 추가인 경우: 새 기타비용 추가
          setEtcExpenses(prevExpenses => [...prevExpenses, result]);
        }
        
        // 다이얼로그 닫기 및 폼 초기화
        setExpenseForm({
          id: null,
          expense_id: null, // null로 설정
          name: '',
          expense_type: '',
          amount: '',
          actual_price: '',
          actual_amount: '',
          quantity: '',
          price: '',
          note: ''
        });
        setShowExpenseDialog(false);
        setEditingExpense(false);
        
        showAlert(editingExpense ? '지출 정보가 성공적으로 수정되었습니다.' : '지출 정보가 성공적으로 추가되었습니다.', 'success');
        
        // Call onDataUpdate if provided
        if (typeof onDataUpdate === 'function') {
          onDataUpdate('지출 정보가 업데이트되었습니다.');
        }
        
        // 백그라운드에서 전체 데이터 동기화 (UI 블로킹 없이)
        setTimeout(async () => {
          try {
            console.log('[Edit4] Background data sync for expense...');
            await refetchData();
          } catch (error) {
            console.error('[Edit4] Background sync error:', error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('[Edit4] Error saving expense:', error);
      showAlert('지출 정보 저장 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteExpense = async (id) => {
    Swal.fire({
      title: '기타비 삭제',
      text: '이 기타비를 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: theme.palette.error.main
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        
        try {
          // Delete from backend
          const success = await deleteExpense(id, showAlert);
          
          if (success) {
            // 즉시 로컬 상태에서 삭제된 기타비용 제거
            setEtcExpenses(prevExpenses => 
              prevExpenses.filter(expense => expense.id !== id)
            );
            
            showAlert('기타비가 성공적으로 삭제되었습니다.', 'success');
            
            // 백그라운드에서 전체 데이터 동기화 (UI 블로킹 없이)
            setTimeout(async () => {
              try {
                console.log('[Edit4] Background data sync after expense deletion...');
                await refetchData();
              } catch (error) {
                console.error('[Edit4] Background sync error:', error);
              }
            }, 100);
          }
        } catch (error) {
          console.error('[Edit4] Error deleting expense:', error);
          showAlert('기타비 삭제 중 오류가 발생했습니다.', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };
  
  // Handle closing alert
  const handleCloseAlert = () => {
    setAlertOpen(false);
  };
  
  // Handle back button
  const handleBack = () => {
    // If we have materials or expenses, confirm before leaving
    if (materials.length > 0 || etcExpenses.length > 0) {
      Swal.fire({
        title: '저장하지 않은 변경사항',
        text: '저장하지 않은 변경사항이 있습니다. 목록으로 돌아가시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '네',
        cancelButtonText: '아니오',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/new/page4');
        }
      });
    } else {
      navigate('/new/page4');
    }
  };
  
  // Handle save button
  const handleSave = async () => {
    try {
      const saved = await handleSaveRecord();
      
      if (saved && formData.id) {
        // 저장 후 최신 데이터로 리패치
        await refetchData();
        
        Swal.fire({
          title: '저장 완료',
          text: '경비 데이터가 성공적으로 저장되었습니다.',
          icon: 'success',
          confirmButtonText: '확인'
        });
      }
    } catch (error) {
      console.error('[Edit4] Error saving data:', error);
      showAlert('저장 중 오류가 발생했습니다: ' + error.message, 'error');
    }
  };
  
  // Handle delete button
  const handleDelete = async () => {
    // Only allow deletion for existing records
    if (!formData.id) {
      showAlert('아직 저장되지 않은 데이터는 삭제할 수 없습니다.', 'error');
      return;
    }
    
    try {
      const result = await Swal.fire({
        title: '경비 데이터 삭제',
        text: '이 경비 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        confirmButtonColor: theme.palette.error.main
      });
      
      if (result.isConfirmed) {
        setIsLoading(true);
        const success = await deletePage4Data(formData.id, showAlert, navigate, theme);
        
        if (!success) {
          showAlert('삭제에 실패했습니다.', 'error');
          setIsLoading(false);
        }
        // If successful, navigation is handled in the service
      }
    } catch (error) {
      console.error('[Edit4] Error deleting data:', error);
      showAlert('삭제 중 오류가 발생했습니다: ' + error.message, 'error');
      setIsLoading(false);
    }
  };

  return (
    <MainCard
      title={
        <Box display="flex" alignItems="center">
          <MoneyIcon sx={{ mr: 1 }} />
          <Typography variant="h3">
            재료비ᆞ기타비(수익) 설정
          </Typography>
        </Box>
      }
      secondary={
        !isEmbedded && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
            >
              저장
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={isLoading}
            >
              삭제
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              목록
            </Button>
          </Box>
        )
      }
    >
      {isLoading && (
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.7)"
          zIndex={9999}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Only show Page1InfoCard if not hiding reservation info */}
      {!hideReservationInfo && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Page1InfoCard 
            data={page1Data?.getPage1ById} 
            loading={isLoading}
            isEmbedded={isEmbedded}
          />
        </Paper>
      )}
      
      {/* 기본 정보 */}
      <Paper sx={{ p: 3, mb: 3 }}>
      
        
        
   
        
        <Box mt={2} display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
          <Typography>
            <strong>재료비 합계:</strong> {materialTotal.toLocaleString()}원
          </Typography>
          <Typography>
            <strong>기타비 합계:</strong> {etcExpenseTotal.toLocaleString()}원
          </Typography>
          <Typography variant="h6" color="primary">
            <strong>총 합계:</strong> {totalBudget.toLocaleString()}원
          </Typography>
        </Box>
      </Paper>
      
      {/* 재료비 목록 */}
      <Box mb={3}>
        <MaterialsTable
          materials={materials}
          materialTotal={materialTotal}
          onAddMaterial={handleOpenMaterialDialog}
          onEditMaterial={handleEditMaterial}
          onDeleteMaterial={handleDeleteMaterial}
        />
      </Box>
      
      {/* 기타비 목록 */}
      <Box mb={3}>
        <ExpensesTable
          expenses={etcExpenses}
          totalAmount={etcExpenseTotal}
          onAddExpense={handleOpenExpenseDialog}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      </Box>
      
      {/* 재료 다이얼로그 */}
      {showMaterialDialog && (
        <MaterialDialog
          open={showMaterialDialog}
          onClose={handleCloseMaterialDialog}
          material={materialForm}
          onChange={({ field, value }) => handleUpdateMaterialForm(field, value)}
          onSave={handleSaveMaterial}
          isEditing={editingMaterial}
        />
      )}
      
      {/* 기타비 다이얼로그 */}
      {showExpenseDialog && (
        <ExpenseDialog
          open={showExpenseDialog}
          onClose={handleCloseExpenseDialog}
          expense={expenseForm}
          onChange={({ field, value }) => handleUpdateExpenseForm(field, value)}
          onSave={handleSaveExpense}
          isEditing={editingExpense}
        />
      )}
      
      {/* 알림 스낵바 */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default Edit; 