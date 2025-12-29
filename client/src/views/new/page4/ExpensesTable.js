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
import MoneyIcon from '@mui/icons-material/Money';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

const ExpensesTable = ({ 
  expenses, 
  totalAmount, 
  onAddExpense,
  onEditExpense,
  onDeleteExpense 
}) => {
  // Calculate total amount from expenses array (revenue)
  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return sum + amount;
    }, 0);
  };

  // Calculate total actual expenditure
  const calculateActualTotal = () => {
    return expenses.reduce((sum, expense) => {
      const actualAmount = parseFloat(expense.actual_amount) || 0;
      return sum + actualAmount;
    }, 0);
  };

  const total = calculateTotal();
  const actualTotal = calculateActualTotal();

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <MoneyIcon sx={{ mr: 1 }} />
            <Typography variant="h4">기타비</Typography>
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
            onClick={onAddExpense}
          >
            기타비 생성
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>종류</TableCell>
                <TableCell>수량</TableCell>
                <TableCell>수입 단가</TableCell>
                <TableCell>지출 단가</TableCell>
                <TableCell>수입 금액</TableCell>
                <TableCell>지출 금액</TableCell>
                <TableCell>비고</TableCell>
                <TableCell>기능</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">데이터가 없습니다</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.expense_type || '-'}</TableCell>
                    <TableCell>{expense.quantity ? Number(expense.quantity).toLocaleString() : '-'}</TableCell>
                    <TableCell>{expense.price ? Number(expense.price).toLocaleString() + '원' : '-'}</TableCell>
                    <TableCell>{expense.actual_price ? Number(expense.actual_price).toLocaleString() + '원' : '0원'}</TableCell>
                    <TableCell>{expense.amount ? Number(expense.amount).toLocaleString() + '원' : '-'}</TableCell>
                    <TableCell>{expense.actual_amount ? Number(expense.actual_amount).toLocaleString() + '원' : '0원'}</TableCell>
                    <TableCell>{expense.note || '-'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => onEditExpense(expense)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => onDeleteExpense(expense.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {expenses.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        수입 기타비 총 합계
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
                        지출 기타비 총 합계
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

export default ExpensesTable; 