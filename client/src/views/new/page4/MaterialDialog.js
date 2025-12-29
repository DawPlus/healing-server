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
  Divider
} from '@mui/material';

const MaterialDialog = ({ 
  open, 
  onClose, 
  material,
  onChange,
  onSave,
  isEditing
}) => {
  // 필드 터치 상태 추적을 위한 state
  const [touchedFields, setTouchedFields] = useState({});
  
  if (!material) {
    return null;
  }

  // 필드가 유효하지 않은지 확인
  const isFieldInvalid = (field) => {
    if (!touchedFields[field]) return false;
    
    switch(field) {
      case 'material_type':
        return !material.material_type;
      case 'amount':
        // Changed validation to allow 0 won
        return material.amount === undefined || material.amount === '';
      case 'actual_amount':
        // Allow 0 won for actual amount
        return material.actual_amount === undefined || material.actual_amount === '';
      case 'quantity':
        return !material.quantity || parseFloat(material.quantity) <= 0;
      default:
        return false;
    }
  };

  // 모든 필수 필드가 채워졌는지 확인
  const isFormValid = () => {
    return material.material_type && 
           material.amount !== undefined && material.amount !== '' &&
           material.actual_amount !== undefined && material.actual_amount !== '' &&
           material.quantity && 
           parseFloat(material.quantity) > 0;
  };

  // 콤마 제거 함수
  const removeCommas = (value) => {
    return value.toString().replace(/,/g, '');
  };

  // 필드 값 변경 처리
  const handleFieldChange = (field, value) => {
    // 콤마 제거
    const cleanValue = removeCommas(value);
    
    // 필드 터치 상태 업데이트
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));

    // 기본 필드 업데이트
    onChange({ field, value: cleanValue });

    // 합계 자동 계산 (amount나 quantity가 변경될 때)
    if (field === 'amount' || field === 'quantity') {
      const currentAmount = field === 'amount' ? cleanValue : (material.amount || '0');
      const currentQuantity = field === 'quantity' ? cleanValue : (material.quantity || '0');
      
      const amount = parseInt(currentAmount) || 0;
      const quantity = parseInt(currentQuantity) || 0;
      const total = amount * quantity;
      
      // 32-bit integer 범위 검증
      const MAX_INT_32 = 2147483647; // 2^31 - 1
      
      if (total > MAX_INT_32) {
        // 경고 표시하지만 값은 설정 (사용자가 볼 수 있도록)
        onChange({ field: 'total', value: total.toString() });
        
        // 경고 메시지
        setTimeout(() => {
          alert(`⚠️ 합계가 너무 큽니다!\n최대값: ${MAX_INT_32.toLocaleString()}원\n현재값: ${total.toLocaleString()}원\n\n단가나 수량을 줄여주세요.`);
        }, 100);
      } else {
        onChange({ field: 'total', value: total.toString() });
      }
      
      // 항목명 자동 생성 (없는 경우에만)
      if (!material.name && material.material_type) {
        onChange({ field: 'name', value: material.material_type });
      }
    }
  };

  // 필드 블러 처리
  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // 저장 처리
  const handleSave = () => {
    // 모든 필드를 터치된 상태로 표시
    setTouchedFields({
      material_type: true,
      amount: true,
      actual_amount: true,
      quantity: true
    });
    
    // 항목명 자동 생성 (없는 경우에만)
    if (!material.name) {
      onChange({ field: 'name', value: `재료 ${new Date().toISOString()}` });
    }
    
    if (isFormValid()) {
      onSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? '재료 수정' : '재료 생성'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="재료 종류"
              value={material.material_type || ''}
              onChange={(e) => handleFieldChange('material_type', e.target.value)}
              onBlur={() => handleFieldBlur('material_type')}
              required
              error={isFieldInvalid('material_type')}
              helperText={isFieldInvalid('material_type') ? '재료 종류를 입력해주세요' : ''}
              placeholder="직접 입력 (예: 프로그램 재료, 객실 재료, 기타 재료 등)"
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
              label="수입 단가 (견적서 금액)"
              value={material.amount !== undefined && material.amount !== null ? Number(material.amount).toLocaleString() : ''}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              onBlur={() => handleFieldBlur('amount')}
              required
              error={isFieldInvalid('amount')}
              helperText={isFieldInvalid('amount') ? '수입 단가를 입력해주세요 (0 가능)' : ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="지출 단가 (실제 지출)"
              value={material.actual_amount !== undefined && material.actual_amount !== null ? Number(material.actual_amount).toLocaleString() : ''}
              onChange={(e) => handleFieldChange('actual_amount', e.target.value)}
              onBlur={() => handleFieldBlur('actual_amount')}
              required
              error={isFieldInvalid('actual_amount')}
              helperText={isFieldInvalid('actual_amount') ? '지출 단가를 입력해주세요 (0 가능)' : ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="수량"
              value={material.quantity ? Number(material.quantity).toLocaleString() : ''}
              onChange={(e) => handleFieldChange('quantity', e.target.value)}
              onBlur={() => handleFieldBlur('quantity')}
              required
              error={isFieldInvalid('quantity')}
              helperText={isFieldInvalid('quantity') ? '0보다 큰 수량을 입력해주세요' : ''}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="합계 (견적서 금액)"
              value={material.total ? Number(material.total).toLocaleString() : '0'}
              InputProps={{
                readOnly: true,
                endAdornment: <InputAdornment position="end">원</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="비고"
              value={material.note || ''}
              onChange={(e) => handleFieldChange('note', e.target.value)}
              multiline
              rows={4}
              placeholder="견적서에 표시될 비고 내용을 입력하세요"
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

export default MaterialDialog; 