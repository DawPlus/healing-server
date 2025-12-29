import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PAGE5_RESERVATION_DETAIL, GET_PAGE5_RESERVATION_LIST } from '../graphql';
import { formatDate, showAlert } from '../services/dataService';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List as MuiList,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Page5Layout from './Page5Layout';
import DescriptionIcon from '@mui/icons-material/Description';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import PercentIcon from '@mui/icons-material/Percent';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import GetAppIcon from '@mui/icons-material/GetApp';

// 견적서 목록 컴포넌트
const List = ({ loading, data, onSelectItem, selectedId }) => {
  return (
    <MuiList sx={{ width: '100%', p: 0 }}>
      {loading ? (
        <ListItem>
          <ListItemText primary="불러오는 중..." />
        </ListItem>
      ) : data && data.length > 0 ? (
        data.map((item) => (
          <ListItem 
            key={item.id} 
            button 
            selected={selectedId === item.id}
            onClick={() => onSelectItem(item)}
            divider
          >
            <ListItemText
              primary={item.group_name}
              secondary={`${formatDate(item.start_date)} | ${item.customer_name}`}
            />
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="데이터가 없습니다" />
        </ListItem>
      )}
    </MuiList>
  );
};

// 견적서 상세 컴포넌트
const InspectionDocDetail = ({ data, onPrint }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  
  // Detailed reservation data
  const { loading, error, data: reservationDetail } = useQuery(
    GET_PAGE5_RESERVATION_DETAIL,
    {
      variables: { id: data?.id },
      skip: !data?.id,
      fetchPolicy: 'network-only'
    }
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !reservationDetail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography color="textSecondary">견적서를 선택하세요</Typography>
      </Box>
    );
  }
  
  const detail = reservationDetail.getPage1ById;
  const page3Data = detail.page3 || {};
  
  // Parse JSON data from page3
  const parseJsonData = (jsonData) => {
    if (!jsonData) return [];
    if (typeof jsonData === 'string') {
      try {
        return JSON.parse(jsonData);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
      }
    }
    return jsonData;
  };
  
  const roomSelections = parseJsonData(page3Data.room_selections);
  const mealPlans = parseJsonData(page3Data.meal_plans);
  const placeReservations = parseJsonData(page3Data.place_reservations);
  
  // 할인 정보 포맷팅
  const formatDiscount = (discount) => {
    if (!discount) return '0%';
    return typeof discount === 'number' ? `${discount}%` : discount;
  };
  
  // 프린트 대화상자 열기
  const handleOpenPrintDialog = () => {
    setPrintDialogOpen(true);
  };
  
  // 프린트 대화상자 닫기
  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };
  
  // 엑셀 내보내기 페이지로 이동
  const handleGoToExcelExport = () => {
    navigate('/new/page5/inspection/excel');
  };
  
  // Calculate total amounts
  const calculateTotals = () => {
    let roomTotal = 0;
    let mealTotal = 0;
    let placeTotal = 0;
    let programTotal = 0;
    
    // Calculate room total
    roomSelections.forEach(room => {
      roomTotal += (room.price || 0) * (room.nights || 1);
    });
    
    // Calculate meal total
    mealPlans.forEach(meal => {
      mealTotal += (meal.price || 0) * (meal.participants || 0);
    });
    
    // Calculate place total
    placeReservations.forEach(place => {
      placeTotal += (place.price || 0);
    });
    
    // Calculate program total
    if (detail.page2_reservations && detail.page2_reservations.length > 0) {
      detail.page2_reservations.forEach(page2 => {
        if (page2.programs && page2.programs.length > 0) {
          page2.programs.forEach(program => {
            if (!program) return;
            
            // Use program.price directly without price_per_person
            // and fall back to the parent context for participant count
            const programPrice = program.price || 0;
            const participants = detail.total_count || 0; // Use total_count from the main reservation
            
            console.log(`Program: ${program.program_name}, Price: ${programPrice}, Participants: ${participants}`);
            
            programTotal += programPrice;
          });
        }
      });
    }
    
    const grandTotal = roomTotal + mealTotal + placeTotal + programTotal;
    
    return {
      roomTotal,
      mealTotal,
      placeTotal,
      programTotal,
      grandTotal
    };
  };
  
  const totals = calculateTotals();
  
  // 실제 PDF 출력 처리
  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      
      // 헤더 정보
      doc.setFontSize(20);
      doc.text('견적서', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`작성일: ${moment().format('YYYY-MM-DD')}`, 105, 30, { align: 'center' });
      
      // 기본 정보 테이블
      doc.setFontSize(12);
      doc.text('1. 기본 정보', 14, 45);
      
      const basicInfoRows = [
        ['단체명', detail.group_name],
        ['예약일', formatDate(detail.start_date) + ' ~ ' + formatDate(detail.end_date)],
        ['담당자', detail.customer_name],
        ['연락처', detail.mobile_phone || detail.landline_phone],
        ['이메일', detail.email],
        ['인원', `${detail.total_count || 0}명`]
      ];
      
      doc.autoTable({
        startY: 50,
        head: [['항목', '내용']],
        body: basicInfoRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 14, right: 14 }
      });
      
      // 요금 정보 테이블
      const priceY = doc.lastAutoTable.finalY + 10;
      doc.text('2. 요금 정보', 14, priceY);
      
      const priceRows = [];
      
      // Add room rows
      roomSelections.forEach(room => {
        priceRows.push([
              '숙박', 
          room.room_name, 
          `${room.nights || 1} 박`, 
              formatDiscount(room.discount),
          `${(room.price || 0).toLocaleString()} 원`,
          `${((room.price || 0) * (room.nights || 1)).toLocaleString()} 원`
            ]);
          });
      
      // Add meal rows
      mealPlans.forEach(meal => {
        priceRows.push([
              '식사', 
          meal.meal_type, 
          `${meal.participants || 0} 인분`, 
              formatDiscount(meal.discount),
          `${(meal.price || 0).toLocaleString()} 원`,
          `${((meal.price || 0) * (meal.participants || 0)).toLocaleString()} 원`
        ]);
      });
      
      // Add place rows
      placeReservations.forEach(place => {
        priceRows.push([
          '장소', 
          place.place_name, 
          `1 회`, 
          formatDiscount(place.discount),
          `${(place.price || 0).toLocaleString()} 원`,
          `${(place.price || 0).toLocaleString()} 원`
            ]);
          });
      
      // Add program rows
      if (detail.page2_reservations && detail.page2_reservations.length > 0) {
        detail.page2_reservations.forEach(page2 => {
          if (page2.programs && page2.programs.length > 0) {
            page2.programs.forEach(program => {
              if (!program) return;
              
              // Use program.price directly without price_per_person
              // and fall back to the parent context for participant count
              const programPrice = program.price || 0;
              const participants = detail.total_count || 0; // Use total_count from the main reservation
              
              console.log(`Program: ${program.program_name}, Price: ${programPrice}, Participants: ${participants}`);
              
              priceRows.push([
                '프로그램', 
                program.program_name || program.category_name, 
                `1 회`, 
                '0%',
                `${programPrice.toLocaleString()} 원`,
                `${programPrice.toLocaleString()} 원`
              ]);
            });
          }
        });
      }
      
      // Add total row
      priceRows.push([
            { content: '합계', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `${totals.grandTotal.toLocaleString()} 원`, styles: { fontStyle: 'bold' } }
          ]);
      
      doc.autoTable({
        startY: priceY + 5,
        head: [['구분', '항목', '수량', '할인', '단가', '금액']],
        body: priceRows,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 14, right: 14 }
      });
      
      // 안내사항 및 특이사항
      const notesY = doc.lastAutoTable.finalY + 10;
      doc.text('3. 안내사항', 14, notesY);
      
      const notesRows = [
        ['결제 방법', '계좌이체 (농협 123-4567-8910-11, 예금주: 하이힐링원)'],
        ['취소 정책', '예약일 7일 전까지 : 100% 환불\n예약일 3~6일 전 : 50% 환불\n예약일 2일 전 ~ 당일 : 환불 불가'],
        ['특이사항', detail.notes || '']
      ];
      
      doc.autoTable({
        startY: notesY + 5,
        body: notesRows,
        theme: 'grid',
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: 30 } },
        margin: { left: 14, right: 14 }
      });
      
      // 저장
      doc.save(`견적서_${detail.group_name}_${moment().format('YYYYMMDD')}.pdf`);
      handleClosePrintDialog();
      
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      showAlert('PDF 생성 중 오류가 발생했습니다.', 'error');
    }
  };
  
  return (
      <Box>
      <Grid container spacing={3}>
        {/* 견적서 헤더 */}
        <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">견적서</Typography>
              </Box>
            }
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  startIcon={<PrintIcon />} 
                  onClick={handleOpenPrintDialog}
                >
                    PDF 출력
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<GetAppIcon />}
                  onClick={handleGoToExcelExport}
                >
                  엑셀 다운로드
                </Button>
              </Box>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="primary">단체 정보</Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>단체명:</strong> {detail.group_name}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>예약일:</strong> {formatDate(detail.start_date)} ~ {formatDate(detail.end_date)}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>인원:</strong> {detail.total_count || 0}명
                  </Typography>
              </Grid>
              
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="primary">담당자 정보</Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>담당자:</strong> {detail.customer_name}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>연락처:</strong> {detail.mobile_phone || detail.landline_phone}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    <strong>이메일:</strong> {detail.email}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
              </Grid>
              
        {/* 객실 정보 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">숙박 정보</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>객실 종류</TableCell>
                      <TableCell>박 수</TableCell>
                      <TableCell align="right">수량</TableCell>
                      <TableCell align="right">이용 인원</TableCell>
                      <TableCell align="right">단가</TableCell>
                      <TableCell align="right">금액</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {roomSelections.length > 0 ? (
                      roomSelections.map((room, index) => (
                        <TableRow key={index}>
                          <TableCell>{room.room_name}</TableCell>
                          <TableCell>{room.nights || 1}박</TableCell>
                          <TableCell align="right">{room.quantity || 1}실</TableCell>
                          <TableCell align="right">{room.occupancy || 2}명</TableCell>
                          <TableCell align="right">{(room.price || 0).toLocaleString()}원</TableCell>
                          <TableCell align="right">{((room.price || 0) * (room.nights || 1)).toLocaleString()}원</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">숙박 정보가 없습니다</TableCell>
                      </TableRow>
                    )}
                    {roomSelections.length > 0 && (
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell colSpan={5} align="right"><strong>소계</strong></TableCell>
                        <TableCell align="right"><strong>{totals.roomTotal.toLocaleString()}원</strong></TableCell>
                    </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 식사 정보 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RestaurantIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">식사 정보</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>식사 종류</TableCell>
                      <TableCell>일자</TableCell>
                      <TableCell align="right">인원</TableCell>
                      <TableCell align="right">단가</TableCell>
                      <TableCell align="right">금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mealPlans.length > 0 ? (
                      mealPlans.map((meal, index) => (
                        <TableRow key={index}>
                          <TableCell>{meal.meal_type}</TableCell>
                          <TableCell>{meal.date ? formatDate(meal.date) : '-'}</TableCell>
                          <TableCell align="right">{meal.participants || 0}명</TableCell>
                          <TableCell align="right">{(meal.price || 0).toLocaleString()}원</TableCell>
                          <TableCell align="right">{((meal.price || 0) * (meal.participants || 0)).toLocaleString()}원</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">식사 정보가 없습니다</TableCell>
                      </TableRow>
                    )}
                    {mealPlans.length > 0 && (
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell colSpan={4} align="right"><strong>소계</strong></TableCell>
                        <TableCell align="right"><strong>{totals.mealTotal.toLocaleString()}원</strong></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 장소 정보 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MeetingRoomIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">장소 대관 정보</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>장소명</TableCell>
                      <TableCell>일자</TableCell>
                      <TableCell>시간</TableCell>
                      <TableCell>사용 목적</TableCell>
                      <TableCell align="right">인원</TableCell>
                      <TableCell align="right">금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {placeReservations.length > 0 ? (
                      placeReservations.map((place, index) => (
                        <TableRow key={index}>
                          <TableCell>{place.place_name}</TableCell>
                          <TableCell>{place.reservation_date ? formatDate(place.reservation_date) : '-'}</TableCell>
                          <TableCell>{place.start_time} ~ {place.end_time}</TableCell>
                          <TableCell>{place.purpose || '-'}</TableCell>
                          <TableCell align="right">{place.participants || 0}명</TableCell>
                          <TableCell align="right">{(place.price || 0).toLocaleString()}원</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">장소 대관 정보가 없습니다</TableCell>
                      </TableRow>
                    )}
                    {placeReservations.length > 0 && (
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell colSpan={5} align="right"><strong>소계</strong></TableCell>
                        <TableCell align="right"><strong>{totals.placeTotal.toLocaleString()}원</strong></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 프로그램 정보 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SportsKabaddiIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">프로그램 정보</Typography>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                      <TableCell>프로그램명</TableCell>
                      <TableCell>일자</TableCell>
                      <TableCell>시간</TableCell>
                      <TableCell>장소</TableCell>
                      <TableCell>진행자</TableCell>
                      <TableCell align="right">금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.page2_reservations && detail.page2_reservations.length > 0 && 
                     detail.page2_reservations.some(p2 => p2.programs && p2.programs.length > 0) ? (
                      detail.page2_reservations.flatMap(page2 => 
                        page2.programs ? page2.programs.map((program, pidx) => (
                          <TableRow key={`${page2.id}-${pidx}`}>
                            <TableCell>{program.program_name || program.category_name}</TableCell>
                            <TableCell>{program.date ? formatDate(program.date) : '-'}</TableCell>
                            <TableCell>{program.start_time} ~ {program.end_time}</TableCell>
                            <TableCell>{program.place_name}</TableCell>
                            <TableCell>{program.instructor_name}</TableCell>
                            <TableCell align="right">{(program.price || 0).toLocaleString()}원</TableCell>
                          </TableRow>
                        )) : []
                      )
                    ) : (
                  <TableRow>
                        <TableCell colSpan={6} align="center">프로그램 정보가 없습니다</TableCell>
                      </TableRow>
                    )}
                    {detail.page2_reservations && detail.page2_reservations.some(p2 => p2.programs && p2.programs.length > 0) && (
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell colSpan={5} align="right"><strong>소계</strong></TableCell>
                        <TableCell align="right"><strong>{totals.programTotal.toLocaleString()}원</strong></TableCell>
                  </TableRow>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 합계 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">총 견적 금액</Typography>
                </Box>
              }
            />
            <CardContent>
              <Typography variant="h4" align="right" sx={{ mt: 2 }}>
                {totals.grandTotal.toLocaleString()}원
            </Typography>
          </CardContent>
        </Card>
        </Grid>
      </Grid>
      
      {/* 프린트 대화상자 */}
      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog}>
        <DialogTitle>견적서 출력</DialogTitle>
        <DialogContent>
          <Typography>PDF 형식으로 견적서를 생성하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>취소</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              handleClosePrintDialog();
              handleGeneratePDF();
            }}
            startIcon={<PrintIcon />}
          >
            PDF 생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 견적서 메인 컴포넌트
const InspectionDoc = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month() + 1);
  
  // Years and months arrays for dropdowns
  const years = Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // State for filtered reservations
  const [filteredReservations, setFilteredReservations] = useState([]);
  
  // Use Apollo query to fetch data
  const { data: reservationsData, loading: queryLoading, error, refetch } = useQuery(GET_PAGE5_RESERVATION_LIST, {
    fetchPolicy: 'network-only',
  });
  
  useEffect(() => {
    if (reservationsData && reservationsData.getPage1List) {
      setFilteredReservations(reservationsData.getPage1List);
    }
  }, [reservationsData]);
  
  // Handle year change
  const handleYearChange = (event) => {
    setYear(parseInt(event.target.value));
    // Implement filtering based on year/month
  };
  
  // Handle month change
  const handleMonthChange = (event) => {
    setMonth(parseInt(event.target.value));
    // Implement filtering based on year/month
  };
  
  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle search button click
  const handleSearch = () => {
    if (!reservationsData || !reservationsData.getPage1List) return;
    
    const term = searchTerm.toLowerCase();
    if (!term.trim()) {
      setFilteredReservations(reservationsData.getPage1List);
      return;
    }
    
    const filtered = reservationsData.getPage1List.filter(reservation => {
      return (
        (reservation.group_name && reservation.group_name.toLowerCase().includes(term)) ||
        (reservation.customer_name && reservation.customer_name.toLowerCase().includes(term)) ||
        (reservation.business_category && reservation.business_category.toLowerCase().includes(term))
      );
    });
    
    setFilteredReservations(filtered);
  };
  
  // Handle document selection
  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
  };
  
  // Handle print function
  const handlePrint = () => {
    if (!selectedDoc) return;
    
    try {
      // PDF generation logic here
      const doc = new jsPDF();
      
      // Add content to the PDF
      
      // Save the PDF
      doc.save(`견적서_${selectedDoc.group_name || 'document'}.pdf`);
      
      // Show success message
      Swal.fire({
        title: 'PDF 생성 완료',
        text: 'PDF가 성공적으로 생성되었습니다.',
        icon: 'success',
        timer: 2000
      });
    } catch (error) {
      console.error('PDF 생성 중 오류:', error);
      Swal.fire({
        title: '오류',
        text: 'PDF 생성 중 문제가 발생했습니다.',
        icon: 'error'
      });
    }
  };
  
  return (
    <Page5Layout
      title="견적서"
      icon={<DescriptionIcon sx={{ fontSize: 28 }} />}
      activeTab="inspection"
    >
      <Grid container spacing={3}>
        {/* 좌측 견적서 목록 패널 */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader 
              title="견적서 목록" 
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
            <InputLabel>연도</InputLabel>
            <Select
                      value={year}
                      onChange={handleYearChange}
              label="연도"
            >
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>{y}년</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
            <InputLabel>월</InputLabel>
            <Select
                      value={month}
                      onChange={handleMonthChange}
              label="월"
            >
                      {months.map((m) => (
                        <MenuItem key={m} value={m}>{m}월</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
                <Grid item xs={12}>
          <TextField
            fullWidth
                    size="small"
                    placeholder="단체명 또는 담당자 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleSearch}
                            edge="end"
                            size="small"
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>
      
              <Box sx={{ mt: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <List 
                  loading={queryLoading}
                  data={filteredReservations}
                onSelectItem={handleSelectDoc}
                selectedId={selectedDoc?.id}
              />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 우측 견적서 상세 패널 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
          <InspectionDocDetail 
            data={selectedDoc} 
            onPrint={handlePrint}
          />
          </Paper>
        </Grid>
      </Grid>
    </Page5Layout>
  );
};

export default InspectionDoc; 