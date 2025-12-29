import React, { useState } from 'react';
import { Button, Grid, Paper, Typography, Divider, Box, TextField, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  handleImportAllTeacherExpenses,
  handleImportAllParticipantExpenses, 
  handleImportAllIncome,
  processedDataTracker
} from '../utils/importHandlers';

/**
 * Teacher Expense Import Component
 */
export const TeacherExpenseImport = ({ 
  page1Id, 
  handleAddTeacherExpense, 
  refetch, 
  loadInstructorData,
  showAlert 
}) => {
  const theme = useTheme();
  
  const handleImport = () => {
    // 데이터 트래킹 시스템 초기화 - 중복 방지
    processedDataTracker.resetTracking();
    
    handleImportAllTeacherExpenses({
      page1Id,
      showAlert,
      handleAddTeacherExpense,
      refetch,
      loadInstructorData
    });
  };
  
  return (
    <Paper 
      elevation={2}
      sx={{ 
        padding: 2, 
        mb: 2,
        backgroundColor: '#f5f5f5' 
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            강사 비용 데이터 불러오기
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2페이지의 프로그램 정보에서 강사 비용을 불러옵니다.
          </Typography>
        </Grid>
        <Grid item xs={4} container justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleImport}
          >
            강사비 불러오기
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

/**
 * Participant Expense Import Component
 */
export const ParticipantExpenseImport = ({ 
  page1Id, 
  handleAddParticipantExpense, 
  refetch, 
  loadRoomData, 
  loadMealData, 
  loadMaterialData,
  showAlert 
}) => {
  const theme = useTheme();
  
  const handleImport = () => {
    // 데이터 트래킹 시스템 초기화 - 중복 방지
    processedDataTracker.resetTracking();
    
    handleImportAllParticipantExpenses({
      page1Id,
      showAlert,
      handleAddParticipantExpense,
      refetch,
      loadRoomData,
      loadMealData,
      loadMaterialData
    });
  };
  
  return (
    <Paper 
      elevation={2}
      sx={{ 
        padding: 2, 
        mb: 2,
        backgroundColor: '#f5f5f5' 
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            참가자 비용 데이터 불러오기
          </Typography>
          <Typography variant="body2" color="text.secondary">
            3페이지의 객실 및 식사 정보, 4페이지의 재료비 정보를 불러옵니다.
          </Typography>
        </Grid>
        <Grid item xs={4} container justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleImport}
          >
            참가자비용 불러오기
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

/**
 * Income Import Component
 */
export const IncomeImport = ({ 
  page1Id, 
  handleAddIncome, 
  refetch, 
  loadInstructorData, 
  loadMealData, 
  loadMaterialData, 
  loadExpenseData,
  showAlert 
}) => {
  const theme = useTheme();
  
  const handleImport = () => {
    // 데이터 트래킹 시스템 초기화 - 중복 방지
    processedDataTracker.resetTracking();
    
    handleImportAllIncome({
      page1Id,
      showAlert,
      handleAddIncome,
      refetch,
      loadInstructorData,
      loadMealData,
      loadMaterialData,
      loadExpenseData
    });
  };
  
  return (
    <Paper 
      elevation={2}
      sx={{ 
        padding: 2, 
        mb: 2,
        backgroundColor: '#f5f5f5' 
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            수입 데이터 불러오기
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2페이지의 프로그램, 3페이지의 식사, 4페이지의 재료비 및 기타비 수입을 불러옵니다.
          </Typography>
        </Grid>
        <Grid item xs={4} container justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleImport}
          >
            수입 불러오기
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

/**
 * Import Section Component - contains all import components
 */
export const ImportSection = (props) => {
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  const [discountConfirmOpen, setDiscountConfirmOpen] = useState(false);
  const [originalPrices, setOriginalPrices] = useState(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  
  // Debug log to check props
  console.log('ImportSection props:', {
    page1Id: props.page1Id,
    hasTeacherExpenseHandler: !!props.handleAddTeacherExpense,
    hasInstructors: !!props.instructors,
    instructorsCount: props.instructors?.length,
    isSocialContribution: props.isSocialContribution
  });
  
  // Function passed from PageFinalEdit for displaying alerts
  const showAlert = props.showAlert || ((message, severity) => {
    console.log(`${severity}: ${message}`);
  });
  
  // Function to safely get teacher expenses, including fallback for null
  const getTeacherExpenses = () => {
    const planned = props.teacherPlannedExpenses || [];
    const executed = props.teacherExecutedExpenses || [];
    return { planned, executed };
  };
  
  // Function to safely get participant expenses, including fallback for null
  const getParticipantExpenses = () => {
    const planned = props.participantPlannedExpenses || [];
    const executed = props.participantExecutedExpenses || [];
    return { planned, executed };
  };
  
  // Function to safely get income items, including fallback for null
  const getIncomeItems = () => {
    return props.incomeItems || [];
  };
  
  // 식사 타입 한국어 변환 함수
  const translateMealType = (type) => {
    const translations = {
      'breakfast': '조식',
      'lunch': '중식(일반)',
      'lunch_box': '중식(도시락)',
      'dinner': '석식(일반)',
      'dinner_special_a': '석식(특식A)',
      'dinner_special_b': '석식(특식B)'
    };
    
    return translations[type] || type;
  };
  
  // 일괄 데이터 불러오기 함수 - 최적화
  const handleImportAllData = async () => {
    console.log('======= 데이터 불러오기 버튼 클릭 시작 =======');
    console.log('데이터 불러오기 시작 - 로딩 상태:', { loading, deleteLoading });
    
    // 이미 로딩 중이면 중복 실행 방지
    if (loading || deleteLoading) {
      console.log('이미 로딩 중이므로 불러오기를 중단합니다.');
      return;
    }
    
    // 데이터 트래킹 시스템 초기화 - 중복 방지
    processedDataTracker.resetTracking();
    console.log('글로벌 데이터 트래킹 시스템을 초기화했습니다.');
    
    setLoading(true);
    console.log('로딩 상태를 true로 설정했습니다.');
    
    // 전체 페이지 로딩 상태 활성화
    if (props.setPageLoading) {
      props.setPageLoading(true);
      console.log('전체 페이지 로딩 상태를 활성화했습니다.');
    }
    
    // 시작 알림 - 이 알림만 먼저 표시
    showAlert('모든 데이터를 불러오는 중...', 'info');
    console.log('사용자에게 데이터 로딩 시작 알림을 표시했습니다.');
    
    // 사회공헌 여부 로깅
    console.log('사회공헌 단체 여부:', props.isSocialContribution);
    
    // 콘솔에만 로깅하는 무음 로거
    const silentLogger = function silentLogger(msg, sev) {
      console.log(`[Import] ${sev}: ${msg}`);
      return Promise.resolve();
    };
    
    // 카운터 변수
    let teacherCount = 0;
    let participantCount = 0;
    let incomeCount = 0;
    let hasErrors = false;
    
    try {
      console.log('데이터 불러오기 핸들러 설정 중...');
      // 무음 핸들러 - 결과 개수만 카운트
      const silentTeacherHandler = (data) => {
        console.log('강사비 항목 추가 요청:', data);
        teacherCount++;
        return props.handleAddTeacherExpense(data);
      };
      
      const silentParticipantHandler = (data) => {
        console.log('참가자비용 항목 추가 요청:', data);
        participantCount++;
        return props.handleAddParticipantExpense(data);
      };
      
      const silentIncomeHandler = (data) => {
        console.log('수입 항목 추가 요청:', data);
        incomeCount++;
        return props.handleAddIncome(data);
      };
      
      // 1. 강사비용 데이터
      try {
        console.log('1. 강사비용 데이터 불러오기 시작...');
        console.log('현재 강사 정보:', {
          instructorsCount: props.instructors?.length,
          existingExpensesCount: [
            ...(props.teacherPlannedExpenses || []), 
            ...(props.teacherExecutedExpenses || [])
          ].length
        });
        
        await handleImportAllTeacherExpenses({
          page1Id: props.page1Id,
          showAlert: silentLogger,
          handleAddTeacherExpense: silentTeacherHandler,
          refetch: () => Promise.resolve(),
          loadInstructorData: props.loadInstructorData,
          instructors: props.instructors,
          existingExpenses: [
            ...(props.teacherPlannedExpenses || []), 
            ...(props.teacherExecutedExpenses || [])
          ]
        });
        console.log('강사비용 데이터 불러오기 완료, 추가된 항목 수:', teacherCount);
      } catch (error) {
        console.error('강사비 로드 오류:', error);
        hasErrors = true;
      }
      
      // 2. 참가자 비용 데이터
      try {
        console.log('2. 참가자 비용 데이터 불러오기 시작...');
        // 사회공헌 단체 여부에 따른 처리
        const isSocialContribution = props.isSocialContribution || false;
        
        // 숙박비를 불러오지 않을지 결정 (사회공헌 단체는 숙박비 제외)
        const skipRoomData = isSocialContribution;
        
        // 식사비 계산 방식 결정 (재료비 기준 사용)
        const useMealIngredientCost = true;  // 항상 재료비 기준 사용
        
        console.log('참가자 비용 불러오기 설정:', {
          isSocialContribution,
          skipRoomData,
          useMealIngredientCost
        });
        
        await handleImportAllParticipantExpenses({
          page1Id: props.page1Id,
          showAlert: silentLogger,
          handleAddParticipantExpense: silentParticipantHandler,
          refetch: () => Promise.resolve(),
          loadRoomData: skipRoomData ? null : props.loadRoomData,  // 사회공헌 단체는 숙박비 제외
          loadMealData: props.loadMealData,
          loadMaterialData: props.loadMaterialData,
          loadExpenseData: props.loadExpenseData,  // 기타비 로딩 추가
          useMealIngredientCost
        });
        console.log('참가자 비용 데이터 불러오기 완료, 추가된 항목 수:', participantCount);
      } catch (error) {
        console.error('참가자비용 로드 오류:', error);
        hasErrors = true;
      }
      
      // 3. 수입 데이터
      try {
        console.log('3. 수입 데이터 불러오기 시작...');
        await handleImportAllIncome({
          page1Id: props.page1Id,
          showAlert: silentLogger,
          handleAddIncome: silentIncomeHandler,
          refetch: () => Promise.resolve(),
          loadInstructorData: props.loadInstructorData,
          loadMealData: props.loadMealData,
          loadMaterialData: props.loadMaterialData,
          loadExpenseData: props.loadExpenseData
        });
        console.log('수입 데이터 불러오기 완료, 추가된 항목 수:', incomeCount);
      } catch (error) {
        console.error('수입 데이터 로드 오류:', error);
        hasErrors = true;
      }
      
      // 데이터 새로고침
      console.log('모든 데이터 로드 완료, 데이터 새로고침 시작...');
      await props.refetch();
      console.log('데이터 새로고침 완료');
      
      // 최종 결과 알림
      const totalCount = teacherCount + participantCount + incomeCount;
      console.log('데이터 불러오기 최종 결과:', {
        totalCount,
        teacherCount,
        participantCount,
        incomeCount,
        hasErrors
      });
      
      if (totalCount === 0) {
        showAlert('불러올 데이터가 없습니다.', 'warning');
      } else if (hasErrors) {
        showAlert(`일부 데이터를 불러왔습니다. (강사비: ${teacherCount}, 참가자비용: ${participantCount}, 수입: ${incomeCount})`, 'warning');
      } else {
        showAlert(`모든 데이터를 성공적으로 불러왔습니다. (총 ${totalCount}개 항목)`, 'success');
      }
    } catch (error) {
      console.error('데이터 불러오기 중 최상위 오류:', error);
      showAlert(`데이터 불러오기 중 오류가 발생했습니다: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      if (props.setPageLoading) {
        props.setPageLoading(false);
      }
      console.log('로딩 상태를 false로 재설정했습니다.');
      console.log('======= 데이터 불러오기 버튼 클릭 종료 =======');
    }
  };
  
  // 일괄 삭제 처리 함수 - 최적화
  const handleBulkDelete = async () => {
    console.log('======= 일괄 삭제 시작 =======');
    // 이미 로딩 중이면 중복 실행 방지
    if (loading || deleteLoading) {
      console.log('이미 로딩 중이므로 삭제를 중단합니다.');
      return;
    }
    
    // 데이터 트래킹 시스템도 초기화
    processedDataTracker.resetTracking();
    
    setDeleteLoading(true);
    setConfirmOpen(false);
    console.log('삭제 로딩 상태를 true로 설정했습니다.');
    
    // 전체 페이지 로딩 상태 활성화
    if (props.setPageLoading) {
      props.setPageLoading(true);
      console.log('전체 페이지 로딩 상태를 활성화했습니다.');
    }
    
    // 시작 알림 - 이 알림만 먼저 표시
    showAlert('모든 데이터를 삭제하는 중...', 'info');
    
    try {
      // 모든 아이템 ID 수집
      const allItems = {
        teacher: [
          ...(props.teacherPlannedExpenses || []), 
          ...(props.teacherExecutedExpenses || [])
        ],
        participant: [
          ...(props.participantPlannedExpenses || []), 
          ...(props.participantExecutedExpenses || [])
        ],
        income: [...(props.incomeItems || [])]
      };
      
      console.log('삭제할 항목 수:', {
        teacher: allItems.teacher.length,
        participant: allItems.participant.length,
        income: allItems.income.length
      });
      
      // 카테고리별 삭제 함수 - 배치 처리로 최적화
      const deleteItems = async (items, deleteHandler) => {
        if (items.length === 0) return 0;
        
        // 배치 사이즈 (한 번에 5개씩 처리)
        const batchSize = 5;
        const batches = [];
        
        // 배치 구성
        for (let i = 0; i < items.length; i += batchSize) {
          batches.push(items.slice(i, i + batchSize));
        }
        
        console.log(`${items.length}개 항목을 ${batches.length}개 배치로 삭제 시작`);
        
        // 각 배치 처리
        for (const batch of batches) {
          await Promise.all(
            batch.map(item => {
              try {
                console.log(`항목 삭제 요청 (ID: ${item.id})`);
                return deleteHandler(item.id);
              } catch (error) {
                console.log(`삭제 오류 (ID: ${item.id}): ${error.message}`);
                return Promise.resolve();
              }
            })
          );
        }
        
        return items.length;
      };
      
      // 각 카테고리 삭제 처리 - 순차적으로 실행
      console.log('1. 강사비용 항목 삭제 시작...');
      const teacherCount = await deleteItems(allItems.teacher, props.handleDeleteTeacherExpense);
      console.log(`강사비용 항목 ${teacherCount}개 삭제 완료`);
      
      console.log('2. 참가자비용 항목 삭제 시작...');
      const participantCount = await deleteItems(allItems.participant, props.handleDeleteParticipantExpense);
      console.log(`참가자비용 항목 ${participantCount}개 삭제 완료`);
      
      console.log('3. 수입 항목 삭제 시작...');
      const incomeCount = await deleteItems(allItems.income, props.handleDeleteIncome);
      console.log(`수입 항목 ${incomeCount}개 삭제 완료`);
      
      // 데이터 갱신
      console.log('모든 항목 삭제 완료, 데이터 새로고침 시작...');
      await props.refetch();
      console.log('데이터 새로고침 완료');
      
      // 최종 알림
      const totalCount = teacherCount + participantCount + incomeCount;
      
      if (totalCount === 0) {
        showAlert('삭제할 데이터가 없습니다.', 'info');
      } else {
        showAlert(`모든 데이터가 성공적으로 삭제되었습니다. (총 ${totalCount}개 항목)`, 'success');
      }
    } catch (error) {
      console.error('데이터 삭제 중 오류:', error);
      showAlert(`데이터 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    } finally {
      setDeleteLoading(false);
      if (props.setPageLoading) {
        props.setPageLoading(false);
      }
      console.log('삭제 로딩 상태를 false로 재설정했습니다.');
      console.log('======= 일괄 삭제 종료 =======');
    }
  };
  
  // 할인율 적용 처리 함수
  const handleApplyDiscount = async () => {
    console.log('======= 할인율 적용 시작 =======');
    // 이미 로딩 중이면 중복 실행 방지
    if (loading || deleteLoading) {
      console.log('이미 로딩 중이므로 할인율 적용을 중단합니다.');
      return;
    }
    
    setLoading(true);
    setDiscountConfirmOpen(false);
    
    // 전체 페이지 로딩 상태 활성화
    if (props.setPageLoading) {
      props.setPageLoading(true);
      console.log('전체 페이지 로딩 상태를 활성화했습니다.');
    }
    
    // 시작 알림
    props.showAlert('모든 금액에 할인율을 적용하는 중...', 'info');
    
    try {
      // 원래 가격 저장 (아직 저장된 것이 없는 경우에만)
      if (!originalPrices) {
        // 강사 비용 항목 원본 저장
        const teacherExpenses = getTeacherExpenses();
        const allTeacherExpenses = [...teacherExpenses.planned, ...teacherExpenses.executed];
        
        // 참가자 비용 항목 원본 저장
        const participantExpenses = getParticipantExpenses();
        const allParticipantExpenses = [...participantExpenses.planned, ...participantExpenses.executed];
        
        // 수입 항목 원본 저장
        const incomeItems = getIncomeItems();
        
        // 모든 원본 가격을 저장
        setOriginalPrices({
          teachers: allTeacherExpenses.map(item => ({ id: item.id, amount: item.amount })),
          participants: allParticipantExpenses.map(item => ({ id: item.id, amount: item.amount })),
          incomes: incomeItems.map(item => ({ id: item.id, amount: item.amount }))
        });
        
        console.log('원래 가격 저장 완료');
      }

      // 강사 비용 항목에 할인율 적용
      const teacherExpenses = getTeacherExpenses();
      const allTeacherExpenses = [...teacherExpenses.planned, ...teacherExpenses.executed];
      
      console.log(`강사 비용 항목 ${allTeacherExpenses.length}개에 할인율 적용 시작...`);
      let updatedTeacherCount = 0;
      
      for (const expense of allTeacherExpenses) {
        try {
          const discountedAmount = Math.round(expense.amount * (1 - discountRate / 100));
          await props.handleUpdateTeacherExpense(expense.id, {
            ...expense,
            amount: discountedAmount
          });
          updatedTeacherCount++;
        } catch (error) {
          console.error(`강사 비용 항목 ID ${expense.id} 할인율 적용 중 오류:`, error);
        }
      }
      
      // 참가자 비용 항목에 할인율 적용
      const participantExpenses = getParticipantExpenses();
      const allParticipantExpenses = [...participantExpenses.planned, ...participantExpenses.executed];
      
      console.log(`참가자 비용 항목 ${allParticipantExpenses.length}개에 할인율 적용 시작...`);
      let updatedParticipantCount = 0;
      
      for (const expense of allParticipantExpenses) {
        try {
          const discountedAmount = Math.round(expense.amount * (1 - discountRate / 100));
          await props.handleUpdateParticipantExpense(expense.id, {
            ...expense,
            amount: discountedAmount
          });
          updatedParticipantCount++;
        } catch (error) {
          console.error(`참가자 비용 항목 ID ${expense.id} 할인율 적용 중 오류:`, error);
        }
      }
      
      // 수입 항목에 할인율 적용
      const incomeItems = getIncomeItems();
      
      console.log(`수입 항목 ${incomeItems.length}개에 할인율 적용 시작...`);
      let updatedIncomeCount = 0;
      
      for (const income of incomeItems) {
        try {
          const discountedAmount = Math.round(income.amount * (1 - discountRate / 100));
          await props.handleUpdateIncome(income.id, {
            ...income,
            amount: discountedAmount
          });
          updatedIncomeCount++;
        } catch (error) {
          console.error(`수입 항목 ID ${income.id} 할인율 적용 중 오류:`, error);
        }
      }
      
      // 데이터 갱신
      console.log('모든 항목 할인율 적용 완료, 데이터 새로고침 시작...');
      await props.refetch();
      console.log('데이터 새로고침 완료');
      
      // 최종 알림
      const totalCount = updatedTeacherCount + updatedParticipantCount + updatedIncomeCount;
      
      if (totalCount === 0) {
        props.showAlert('할인율을 적용할 데이터가 없습니다.', 'info');
      } else {
        props.showAlert(`모든 항목에 ${discountRate}% 할인율이 적용되었습니다. (총 ${totalCount}개 항목)`, 'success');
      }
    } catch (error) {
      console.error('할인율 적용 중 오류:', error);
      props.showAlert(`할인율 적용 중 오류가 발생했습니다: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      if (props.setPageLoading) {
        props.setPageLoading(false);
      }
      console.log('로딩 상태를 false로 재설정했습니다.');
      console.log('======= 할인율 적용 종료 =======');
    }
  };
  
  // 원래 가격으로 되돌리기 처리 함수
  const handleRestoreOriginalPrices = async () => {
    console.log('======= 원래 가격으로 되돌리기 시작 =======');
    // 이미 로딩 중이면 중복 실행 방지
    if (loading || deleteLoading) {
      console.log('이미 로딩 중이므로 원래 가격으로 되돌리기를 중단합니다.');
      return;
    }
    
    // 저장된 원래 가격이 없는 경우
    if (!originalPrices) {
      props.showAlert('원래 가격 정보가 없습니다. 할인율을 적용한 후에 사용할 수 있습니다.', 'warning');
      return;
    }
    
    setLoading(true);
    setRestoreConfirmOpen(false);
    
    // 전체 페이지 로딩 상태 활성화
    if (props.setPageLoading) {
      props.setPageLoading(true);
      console.log('전체 페이지 로딩 상태를 활성화했습니다.');
    }
    
    // 시작 알림
    props.showAlert('모든 금액을 원래 가격으로 되돌리는 중...', 'info');
    
    try {
      // 강사 비용 항목 되돌리기
      const teacherExpenses = getTeacherExpenses();
      const allTeacherExpenses = [...teacherExpenses.planned, ...teacherExpenses.executed];
      
      console.log(`강사 비용 항목 ${allTeacherExpenses.length}개 되돌리기 시작...`);
      let restoredTeacherCount = 0;
      
      for (const expense of allTeacherExpenses) {
        try {
          // 원래 가격 찾기
          const originalItem = originalPrices.teachers.find(item => item.id === expense.id);
          if (originalItem) {
            await props.handleUpdateTeacherExpense(expense.id, {
              ...expense,
              amount: originalItem.amount
            });
            restoredTeacherCount++;
          }
        } catch (error) {
          console.error(`강사 비용 항목 ID ${expense.id} 되돌리기 중 오류:`, error);
        }
      }
      
      // 참가자 비용 항목 되돌리기
      const participantExpenses = getParticipantExpenses();
      const allParticipantExpenses = [...participantExpenses.planned, ...participantExpenses.executed];
      
      console.log(`참가자 비용 항목 ${allParticipantExpenses.length}개 되돌리기 시작...`);
      let restoredParticipantCount = 0;
      
      for (const expense of allParticipantExpenses) {
        try {
          // 원래 가격 찾기
          const originalItem = originalPrices.participants.find(item => item.id === expense.id);
          if (originalItem) {
            await props.handleUpdateParticipantExpense(expense.id, {
              ...expense,
              amount: originalItem.amount
            });
            restoredParticipantCount++;
          }
        } catch (error) {
          console.error(`참가자 비용 항목 ID ${expense.id} 되돌리기 중 오류:`, error);
        }
      }
      
      // 수입 항목 되돌리기
      const incomeItems = getIncomeItems();
      
      console.log(`수입 항목 ${incomeItems.length}개 되돌리기 시작...`);
      let restoredIncomeCount = 0;
      
      for (const income of incomeItems) {
        try {
          // 원래 가격 찾기
          const originalItem = originalPrices.incomes.find(item => item.id === income.id);
          if (originalItem) {
            await props.handleUpdateIncome(income.id, {
              ...income,
              amount: originalItem.amount
            });
            restoredIncomeCount++;
          }
        } catch (error) {
          console.error(`수입 항목 ID ${income.id} 되돌리기 중 오류:`, error);
        }
      }
      
      // 데이터 갱신
      console.log('모든 항목 되돌리기 완료, 데이터 새로고침 시작...');
      await props.refetch();
      console.log('데이터 새로고침 완료');
      
      // 최종 알림
      const totalCount = restoredTeacherCount + restoredParticipantCount + restoredIncomeCount;
      
      if (totalCount === 0) {
        props.showAlert('되돌릴 데이터가 없습니다.', 'info');
      } else {
        props.showAlert(`모든 항목을 원래 가격으로 되돌렸습니다. (총 ${totalCount}개 항목)`, 'success');
      }
      
      // 원래 가격 정보 초기화
      setOriginalPrices(null);
    } catch (error) {
      console.error('원래 가격으로 되돌리기 중 오류:', error);
      props.showAlert(`원래 가격으로 되돌리기 중 오류가 발생했습니다: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      if (props.setPageLoading) {
        props.setPageLoading(false);
      }
      console.log('로딩 상태를 false로 재설정했습니다.');
      console.log('======= 원래 가격으로 되돌리기 종료 =======');
    }
  };
  
  // 원래 가격으로 되돌리기 확인 다이얼로그 열기
  const handleOpenRestoreConfirmDialog = () => {
    setRestoreConfirmOpen(true);
  };
  
  // 원래 가격으로 되돌리기 확인 다이얼로그 닫기
  const handleCloseRestoreConfirmDialog = () => {
    setRestoreConfirmOpen(false);
  };
  
  // Handle opening the confirmation dialog
  const handleOpenConfirmDialog = () => {
    setConfirmOpen(true);
  };
  
  // Handle closing the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmOpen(false);
  };
  
  // 할인율 확인 다이얼로그 열기
  const handleOpenDiscountConfirmDialog = () => {
    setDiscountConfirmOpen(true);
  };
  
  // 할인율 확인 다이얼로그 닫기
  const handleCloseDiscountConfirmDialog = () => {
    setDiscountConfirmOpen(false);
  };
  
  return (
    <Box 
      mb={4} 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
    >
      <Box display="flex" justifyContent="center" mb={1}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleImportAllData}
          disabled={loading || deleteLoading}
          sx={{ 
            minWidth: 150, 
            py: 1.5,
            mr: 2,
            boxShadow: 3,
            fontSize: '1rem'
          }}
        >
          {loading ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              <span>불러오는 중...</span>
            </Box>
          ) : (
            '데이터 불러오기'
          )}
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          size="large"
          onClick={handleOpenConfirmDialog}
          disabled={loading || deleteLoading}
          sx={{ 
            minWidth: 150, 
            py: 1.5,
            mr: 2,
            boxShadow: 3,
            fontSize: '1rem'
          }}
        >
          {deleteLoading ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              <span>삭제 중...</span>
            </Box>
          ) : (
            '일괄 삭제'
          )}
        </Button>
        
        
      </Box>
      
 
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
        참고: 사회공헌 단체는 숙박비가 지출사항에서 제외됩니다. 식사비는 식사가격이 아닌 재료비로 계산됩니다.
        {props.isSocialContribution && <span style={{ color: theme.palette.secondary.main }}> (현재 단체는 사회공헌으로 분류되어 있습니다)</span>}
      </Typography>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"모든 데이터 삭제 확인"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            이 페이지의 모든 강사비용, 참가자비용, 수입 데이터가 삭제됩니다. 정말로 삭제하시겠습니까?
            이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleBulkDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Discount Confirmation Dialog */}
      <Dialog
        open={discountConfirmOpen}
        onClose={handleCloseDiscountConfirmDialog}
        aria-labelledby="discount-dialog-title"
        aria-describedby="discount-dialog-description"
      >
        <DialogTitle id="discount-dialog-title">
          {"할인율 적용 확인"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="discount-dialog-description">
            모든 비용과 수입 항목에 {discountRate}% 할인율을 적용합니다.
            기존 금액의 {discountRate}%가 차감됩니다. 진행하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscountConfirmDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleApplyDiscount} color="secondary" autoFocus>
            적용
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreConfirmOpen}
        onClose={handleCloseRestoreConfirmDialog}
        aria-labelledby="restore-dialog-title"
        aria-describedby="restore-dialog-description"
      >
        <DialogTitle id="restore-dialog-title">
          {"원래 가격으로 되돌리기 확인"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="restore-dialog-description">
            할인율이 적용되기 전의 원래 가격으로 모든 항목을 되돌립니다.
            이 작업을 수행하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestoreConfirmDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleRestoreOriginalPrices} color="primary" autoFocus>
            되돌리기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Complaint Component 
 */
export const ComplaintSection = ({ 
  complaints, 
  handleComplaintChange, 
  handleAddComplaint, 
  handleRemoveComplaint 
}) => {
  const theme = useTheme();
  
  return (
    <Box mt={4} mb={4}>
      <Box mb={2} display="flex" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          민원 사항
        </Typography>
        <Divider sx={{ marginLeft: 2, flexGrow: 1 }} />
      </Box>
      
      <Paper elevation={2} sx={{ padding: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              value={complaints || ''}
              onChange={(e) => handleComplaintChange(e.target.value)}
              placeholder="민원 사항을 입력하세요"
              multiline
              rows={3}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddComplaint}
            >
              민원 저장
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

/**
 * Discount Component
 */
export const DiscountSection = ({
  discounts,
  handleDiscountChange,
  handleAddDiscount,
  handleRemoveDiscount
}) => {
  const theme = useTheme();
  
  return (
    <Box mt={4} mb={4}>
      <Box mb={2} display="flex" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          할인 사항
        </Typography>
        <Divider sx={{ marginLeft: 2, flexGrow: 1 }} />
      </Box>
      
      <Paper elevation={2} sx={{ padding: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="할인율 (%)"
              type="number"
              value={discounts?.rate || 0}
              onChange={(e) => handleDiscountChange('rate')(e.target.value)}
              InputProps={{
                inputProps: { min: 0, max: 100 }
              }}
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="할인 내용"
              multiline
              rows={2}
              value={discounts?.notes || ''}
              onChange={(e) => handleDiscountChange('notes')(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddDiscount}
              sx={{ mt: 3 }}
            >
              할인 저장
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}; 