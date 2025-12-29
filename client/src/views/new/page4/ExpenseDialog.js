import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Typography,
  Box,
  FormHelperText,
  Divider
} from '@mui/material';

const ExpenseDialog = ({ 
  open, 
  onClose,
  expense, 
  onChange, 
  onSave,
  isEditing
}) => {
  // Add local validation state
  const [touchedFields, setTouchedFields] = useState({});

  // null 체크 추가 - moved after useState to avoid conditional hook call
  if (!expense) {
    return null;
  }

  // Mark field as touched
  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Format number with commas for display
  const formatNumberWithCommas = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Remove commas for processing
  const removeCommas = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
  };

  // Check if field is invalid
  const isFieldInvalid = (field) => {
    if (!touchedFields[field]) return false;
    
    // Different validation logic based on field
    switch(field) {
      case 'expense_type':
        return !expense.expense_type;
      case 'quantity':
        return !expense.quantity;
      case 'price':
        // Allow 0 won input
        return expense.price === undefined || expense.price === '';
      case 'actual_price':
        // Allow 0 won input for actual price
        return expense.actual_price === undefined || expense.actual_price === '';
      case 'amount':
        return expense.amount === undefined || expense.amount === '';
      case 'actual_amount':
        return expense.actual_amount === undefined || expense.actual_amount === '';
      default:
        return false;
    }
  };

  // 필드 업데이트 핸들러
  const handleFieldChange = (field, value) => {
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Remove commas and convert to number if needed
    let cleanValue = value;
    if (field === 'price' || field === 'actual_price' || field === 'quantity') {
      // 콤마 제거 후 문자열 상태로 유지
      cleanValue = value.toString().replace(/,/g, '');
      
      // Calculate amount if price or quantity changes
      if (field === 'price' || field === 'quantity') {
        const currentPrice = field === 'price' ? cleanValue : (expense.price?.toString() || '0').replace(/,/g, '');
        const currentQuantity = field === 'quantity' ? cleanValue : (expense.quantity?.toString() || '0').replace(/,/g, '');
        
        // 계산은 숫자로 변환하여 수행
        const priceNum = parseFloat(currentPrice) || 0;
        const quantityNum = parseFloat(currentQuantity) || 0;
        const amount = priceNum * quantityNum;
        
        // 32-bit integer 범위 검증
        const MAX_INT_32 = 2147483647; // 2^31 - 1
        
        if (amount > MAX_INT_32) {
          // 경고 표시하지만 값은 설정 (사용자가 볼 수 있도록)
          onChange({ field, value: cleanValue });
          onChange({ field: 'amount', value: amount.toString() });
          
          // 경고 메시지
          setTimeout(() => {
            alert(`⚠️ 금액이 너무 큽니다!\n최대값: ${MAX_INT_32.toLocaleString()}원\n현재값: ${amount.toLocaleString()}원\n\n단가나 수량을 줄여주세요.`);
          }, 100);
        } else {
          // 필드 값 설정
          onChange({ field, value: cleanValue });
          
          // 계산된 금액은 문자열로 변환하여 설정
          if (!isNaN(amount)) {
            onChange({ field: 'amount', value: amount.toString() });
            setTouchedFields(prev => ({
              ...prev,
              amount: true
            }));
          }
        }
        
        // 수량 변경 시 actual_amount도 재계산
        if (field === 'quantity') {
          const currentActualPrice = (expense.actual_price?.toString() || '0').replace(/,/g, '');
          const actualPriceNum = parseFloat(currentActualPrice) || 0;
          const actualAmount = actualPriceNum * quantityNum;
          
          if (actualAmount > MAX_INT_32) {
            onChange({ field: 'actual_amount', value: actualAmount.toString() });
            setTimeout(() => {
              alert(`⚠️ 실제 금액이 너무 큽니다!\n최대값: ${MAX_INT_32.toLocaleString()}원\n현재값: ${actualAmount.toLocaleString()}원\n\n실제 단가나 수량을 줄여주세요.`);
            }, 200);
          } else {
            if (!isNaN(actualAmount)) {
              onChange({ field: 'actual_amount', value: actualAmount.toString() });
              setTouchedFields(prev => ({
                ...prev,
                actual_amount: true
              }));
            }
          }
        }
      } else if (field === 'actual_price') {
        const currentActualPrice = cleanValue;
        const currentQuantity = (expense.quantity?.toString() || '0').replace(/,/g, '');
        
        // 계산은 숫자로 변환하여 수행
        const actualPriceNum = parseFloat(currentActualPrice) || 0;
        const quantityNum = parseFloat(currentQuantity) || 0;
        const actualAmount = actualPriceNum * quantityNum;
        
        // 32-bit integer 범위 검증
        const MAX_INT_32 = 2147483647; // 2^31 - 1
        
        if (actualAmount > MAX_INT_32) {
          // 경고 표시하지만 값은 설정 (사용자가 볼 수 있도록)
          onChange({ field, value: cleanValue });
          onChange({ field: 'actual_amount', value: actualAmount.toString() });
          
          // 경고 메시지
          setTimeout(() => {
            alert(`⚠️ 실제 금액이 너무 큽니다!\n최대값: ${MAX_INT_32.toLocaleString()}원\n현재값: ${actualAmount.toLocaleString()}원\n\n실제 단가나 수량을 줄여주세요.`);
          }, 100);
        } else {
          // 필드 값 설정
          onChange({ field, value: cleanValue });
          
          // 계산된 실제 금액은 문자열로 변환하여 설정
          if (!isNaN(actualAmount)) {
            onChange({ field: 'actual_amount', value: actualAmount.toString() });
            setTouchedFields(prev => ({
              ...prev,
              actual_amount: true
            }));
          }
        }
      } else {
        onChange({ field, value: cleanValue });
      }
    } else {
      onChange({ field, value: cleanValue });
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return expense.expense_type && 
           expense.quantity && 
           expense.price !== undefined && expense.price !== '' &&
           expense.actual_price !== undefined && expense.actual_price !== '' &&
           expense.amount !== undefined && expense.amount !== '' &&
           expense.actual_amount !== undefined && expense.actual_amount !== '';
  };

  // Handle save with validation
  const handleSave = () => {
    // Mark all fields as touched
    setTouchedFields({
      expense_type: true,
      quantity: true,
      price: true,
      actual_price: true,
      amount: true,
      actual_amount: true
    });
    
    // Only proceed if form is valid
    if (isFormValid()) {
      onSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '기타비 수정' : '기타비 생성'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="종류"
              value={expense.expense_type || ''}
              onChange={(e) => handleFieldChange('expense_type', e.target.value)}
              onBlur={() => handleFieldBlur('expense_type')}
              placeholder="종류를 직접 입력하세요"
              required
              error={isFieldInvalid('expense_type')}
              helperText={isFieldInvalid('expense_type') ? '종류를 입력해주세요' : ''}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              금액 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="수량"
              type="text"
              value={expense.quantity ? Number(expense.quantity).toLocaleString() : ''}
              onChange={(e) => handleFieldChange('quantity', e.target.value)}
              onBlur={() => handleFieldBlur('quantity')}
              InputProps={{
                endAdornment: <InputAdornment position="end">개</InputAdornment>,
              }}
              required
              error={isFieldInvalid('quantity')}
              helperText={isFieldInvalid('quantity') ? '수량을 입력해주세요' : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="수입 단가 (견적서 금액)"
              type="text"
              value={expense.price !== undefined && expense.price !== null ? Number(expense.price).toLocaleString() : ''}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              onBlur={() => handleFieldBlur('price')}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
              }}
              required
              error={isFieldInvalid('price')}
              helperText={isFieldInvalid('price') ? '단가를 입력해주세요 (0 가능)' : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="수입 금액 (자동계산)"
              type="text"
              value={expense.amount !== undefined && expense.amount !== null ? Number(expense.amount).toLocaleString() : ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
                readOnly: true,
              }}
              required
              error={isFieldInvalid('amount')}
              sx={{ bgcolor: (theme) => theme.palette.action.hover }}
            />
            {isFieldInvalid('amount') && (
              <FormHelperText error>금액이 계산되지 않았습니다. 수량과 단가를 확인해주세요.</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="지출 단가 (실제 지출)"
              type="text"
              value={expense.actual_price !== undefined && expense.actual_price !== null ? Number(expense.actual_price).toLocaleString() : ''}
              onChange={(e) => handleFieldChange('actual_price', e.target.value)}
              onBlur={() => handleFieldBlur('actual_price')}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
              }}
              required
              error={isFieldInvalid('actual_price')}
              helperText={isFieldInvalid('actual_price') ? '실제 지출 단가를 입력해주세요 (0 가능)' : ''}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="지출 금액 (자동계산)"
              type="text"
              value={expense.actual_amount !== undefined && expense.actual_amount !== null ? Number(expense.actual_amount).toLocaleString() : ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
                readOnly: true,
              }}
              required
              error={isFieldInvalid('actual_amount')}
              sx={{ bgcolor: (theme) => theme.palette.action.hover }}
            />
            {isFieldInvalid('actual_amount') && (
              <FormHelperText error>지출 금액이 계산되지 않았습니다. 수량과 실제 단가를 확인해주세요.</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              * 금액은 수량 × 단가로 자동 계산됩니다
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="비고"
              value={expense.note || ''}
              onChange={(e) => handleFieldChange('note', e.target.value)}
              multiline
              rows={4}
              placeholder="특이사항을 기록하세요"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={!isFormValid()}
        >
          {isEditing ? '수정' : '생성'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDialog; 