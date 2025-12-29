import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

const MaterialsTable = ({ 
  materials, 
  materialTotal, 
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial 
}) => {
  // Calculate total amount from materials array
  const calculateTotal = () => {
    return materials.reduce((sum, material) => {
      const total = parseFloat(material.total) || 0;
      return sum + total;
    }, 0);
  };

  // Calculate actual expenditure total
  const calculateActualTotal = () => {
    return materials.reduce((sum, material) => {
      const actualAmount = parseFloat(material.actual_amount) || 0;
      const quantity = parseFloat(material.quantity) || 0;
      return sum + (actualAmount * quantity);
    }, 0);
  };

  const total = calculateTotal();
  const actualTotal = calculateActualTotal();

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 1 }} />
            <Typography variant="h4">재료비</Typography>
            <Tooltip title="수입 금액(견적서)과 실제 지출 금액이 모두 표시됩니다.">
              <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
            </Tooltip>
          </Box>
        }
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddMaterial}
          >
            재료 생성
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>재료 종류</TableCell>
                <TableCell>수량</TableCell>
                <TableCell>수입 단가</TableCell>
                <TableCell>지출 단가</TableCell>
                <TableCell>수입 합계</TableCell>
                <TableCell>지출 합계</TableCell>
                <TableCell>비고</TableCell>
                <TableCell>기능</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">데이터가 없습니다</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => {
                  const actualTotal = (parseFloat(material.actual_amount) || 0) * (parseFloat(material.quantity) || 0);
                  
                  return (
                    <TableRow key={material.id}>
                      <TableCell>{material.material_type || '-'}</TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell>{typeof material.amount === 'number' ? material.amount.toLocaleString() + '원' : material.amount + '원'}</TableCell>
                      <TableCell>{typeof material.actual_amount === 'number' ? material.actual_amount.toLocaleString() + '원' : (material.actual_amount || '0') + '원'}</TableCell>
                      <TableCell>{typeof material.total === 'number' ? material.total.toLocaleString() + '원' : material.total + '원'}</TableCell>
                      <TableCell>{actualTotal.toLocaleString() + '원'}</TableCell>
                      <TableCell>{material.note || '-'}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => onEditMaterial(material)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onDeleteMaterial(material.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {materials.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        수입 재료비 총 합계
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={4}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {total.toLocaleString()}원
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        지출 재료비 총 합계
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={4}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {actualTotal.toLocaleString()}원
                      </Typography>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default MaterialsTable; 