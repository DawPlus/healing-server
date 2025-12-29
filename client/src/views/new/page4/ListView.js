import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Tooltip,
  Stack,
  Fab
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import AddIcon from '@mui/icons-material/Add';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useQuery, gql } from '@apollo/client';
import moment from 'moment';

// GraphQL query to get Page1 list
const GET_PAGE1_LIST = gql`
  query GetPage1List {
    getPage1List {
      id
      group_name
      customer_name
      reservation_status
      start_date
      end_date
      total_count
      email
      mobile_phone
      landline_phone
      notes
      page4 {
        id
        page1_id
        project_name
        material_total
        etc_expense_total
        total_budget
        materials {
          id
          material_type
          name
          amount
          quantity
          total
          note
        }
        expenses {
          id
          name
          amount
          expense_type
          quantity
          price
          note
        }
      }
    }
  }
`;

// Format date for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  
  try {
    return moment(dateString).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

const ListView = ({ onCreateNew }) => {
  const navigate = useNavigate();
  
  // Fetch data using GraphQL
  const { loading, error, data, refetch } = useQuery(GET_PAGE1_LIST);
  
  // Get list of page1 reservations from GraphQL data
  const list = data?.getPage1List || [];
  
  // Check if data exists
  const dataExists = list.length > 0;
  
  // Get reservation status chip
  const getStatusChip = (status) => {
    switch(status) {
      case 'preparation':
        return <Chip label="가예약" size="small" color="primary" />;
      case 'confirmed':
        return <Chip label="확정예약" size="small" color="success" />;
      case 'canceled':
        return <Chip label="예약취소" size="small" color="error" />;
      case 'completed':
        return <Chip label="완료" size="small" color="info" />;
      default:
        return <Chip label={status || "미지정"} size="small" color="default" />;
    }
  };
  
  // Handle row click - navigate to edit page
  const handleRowClick = (reservation) => {
    // page2와 동일한 로직으로 수정: 항상 page1Id로 접근
    // (page4 데이터가 이미 있든 없든 같은 경로를 사용)
    navigate(`/new/page4/edit/${reservation.id}`);
  };

  // Handle create new expense - not used for now since we're creating expenses for existing reservations
  const handleCreateNew = () => {
    navigate('/new/page4/create');
  };
  
  return (
    <MainCard title={
      <Box display="flex" alignItems="center">
        <AttachMoneyIcon sx={{ mr: 1 }} />
        <Typography variant="h3">프로젝트 경비 관리</Typography>
      </Box>
    }>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          <Box component="span" sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', p: 0.5, borderRadius: 1, mr: 1 }}>
            <EventNoteIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            예약 데이터
          </Box>
          일정별 경비 관리
        </Typography>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            데이터를 불러오는 중 오류가 발생했습니다
          </Typography>
          <Typography color="textSecondary">
            {error.message}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        </Paper>
      ) : !dataExists ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            예약 데이터가 없습니다
          </Typography>
        </Paper>
      ) : (
        <>
          <Box mb={2}>
            <Typography variant="body2" color="textSecondary">
              목록을 클릭하여 경비 정보를 수정하거나 추가할 수 있습니다.
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>단체명</TableCell>
                  <TableCell>담당자</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>일정</TableCell>
                  <TableCell>인원</TableCell>
                  <TableCell align="right">경비 총액</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((reservation) => (
                  <TableRow 
                    key={reservation.id} 
                    hover
                    onClick={() => handleRowClick(reservation)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Tooltip title={`단체: ${reservation.group_name || '-'}`}>
                        <Box sx={{ fontWeight: 'medium' }}>
                          {reservation.group_name || '(제목 없음)'}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`이메일: ${reservation.email || '-'}`}>
                        <Box>
                          {reservation.customer_name || '-'}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(reservation.reservation_status)}
                    </TableCell>
                    <TableCell>
                      {`${formatDateForDisplay(reservation.start_date)} ~ ${formatDateForDisplay(reservation.end_date)}`}
                    </TableCell>
                    <TableCell align="center">{reservation.total_count || 0}명</TableCell>
                    <TableCell align="right">
                      {reservation.page4 ? 
                        `${(reservation.page4.total_budget || 0).toLocaleString()}원` : 
                        '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </MainCard>
  );
};

export default ListView; 