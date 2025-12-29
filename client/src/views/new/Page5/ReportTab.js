import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import koLocale from 'date-fns/locale/ko';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// 더미 데이터
const dummyGroupList = [
  { id: 1, groupName: '하이힐링원', date: '2023-04-15', type: '가예약' },
  { id: 2, groupName: '서울대학교', date: '2023-04-16', type: '확정예약' },
  { id: 3, groupName: '강원대학교', date: '2023-04-20', type: '일정미정' },
  { id: 4, groupName: '대한병원', date: '2023-04-22', type: '확정예약' },
  { id: 5, groupName: '국립공원공단', date: '2023-05-05', type: '가예약' },
];

const dummyReportData = {
  1: {
    groupName: '하이힐링원',
    date: '2023-04-15 ~ 2023-04-16',
    reporter: '김철수',
    reportDate: '2023-04-01',
    program: '힐링 프로그램',
    participants: 25,
    purpose: '직원들의 스트레스 해소 및 팀 빌딩',
    content: '1일차: 오리엔테이션, 명상, 산책\n2일차: 요가, 팀 빌딩 객실, 정리',
    expectedResult: '직원 간 단합 및 업무 스트레스 감소',
    budget: '3,500,000원',
    remarks: '특이사항 없음'
  },
  2: {
    groupName: '서울대학교',
    date: '2023-04-16 ~ 2023-04-18',
    reporter: '이영희',
    reportDate: '2023-03-15',
    program: '힐링 캠프',
    participants: 40,
    purpose: '신입생 오리엔테이션 및 환경교육',
    content: '1일차: 입소식, 산림 교육\n2일차: 숲 체험, 팀 객실\n3일차: 발표회, 퇴소식',
    expectedResult: '신입생 간 유대감 형성 및 환경의식 고취',
    budget: '5,200,000원',
    remarks: '식단에 알러지 주의 필요'
  }
};

const ReportTab = () => {
  const [searchDate, setSearchDate] = useState(null);
  const [searchGroup, setSearchGroup] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // 검색 핸들러
  const handleSearch = () => {
    // 실제 구현에서는 API 호출 등의 로직 구현
    console.log('검색 조건:', { date: searchDate, groupName: searchGroup });
  };

  // 그룹 선택 핸들러 - 파일 정보 불러오기
  const handleSelectGroup = (groupId) => {
    const reportData = dummyReportData[groupId] || null;
    setSelectedGroup(reportData);
    
    // 해당 그룹에 첨부된 파일이 있는지 확인 (실제 구현에서는 API 호출)
    setAttachedFiles(reportData?.attachedFiles || []);
  };

  // 출력 대화상자 열기
  const handleOpenPrintDialog = () => {
    if (!selectedGroup) {
      setNotification({
        open: true,
        message: '출력할 보고서를 선택해주세요.',
        severity: 'warning'
      });
      return;
    }
    setPrintDialogOpen(true);
  };

  // 출력 대화상자 닫기
  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };

  // 파일 업로드 대화상자 열기
  const handleOpenFileUpload = () => {
    if (!selectedGroup) {
      setNotification({
        open: true,
        message: '문서를 첨부할 보고서를 선택해주세요.',
        severity: 'warning'
      });
      return;
    }
    setFileUploadOpen(true);
  };

  // 파일 업로드 대화상자 닫기
  const handleCloseFileUpload = () => {
    setFileUploadOpen(false);
  };

  // 파일 첨부 핸들러
  const handleFileAttach = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // 실제 구현에서는 API로 파일 업로드
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }));
      
      setAttachedFiles([...attachedFiles, ...newFiles]);
      setNotification({
        open: true,
        message: '파일이 첨부되었습니다.',
        severity: 'success'
      });
    }
  };

  // 파일 삭제 핸들러
  const handleFileDelete = (index) => {
    const updatedFiles = [...attachedFiles];
    updatedFiles.splice(index, 1);
    setAttachedFiles(updatedFiles);
    setNotification({
      open: true,
      message: '파일이 삭제되었습니다.',
      severity: 'info'
    });
  };

  // 알림 닫기 핸들러
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // 수주보고 출력 핸들러
  const handlePrint = () => {
    if (!selectedGroup) return;
    
    const doc = new jsPDF();
    
    // 헤더 추가
    doc.setFontSize(22);
    doc.text("수 주 보 고", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`작성일: ${selectedGroup.reportDate}`, 180, 30, null, null, "right");
    
    // 기본 정보 테이블
    const basicInfoRows = [
      ['단체명', selectedGroup.groupName],
      ['일정', selectedGroup.date],
      ['담당자', selectedGroup.reporter],
      ['프로그램명', selectedGroup.program],
      ['참가인원', `${selectedGroup.participants}명`],
      ['예산', selectedGroup.budget]
    ];
    
    doc.autoTable({
      startY: 40,
      theme: 'grid',
      head: [['항목', '내용']],
      body: basicInfoRows,
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold', fillColor: [240, 240, 240] },
        1: { cellWidth: 'auto' }
      }
    });
    
    // 목적 및 내용
    doc.setFontSize(14);
    doc.text("1. 목적", 14, doc.lastAutoTable.finalY + 15);
    
    doc.setFontSize(11);
    const purposeLines = doc.splitTextToSize(selectedGroup.purpose, 180);
    doc.text(purposeLines, 14, doc.lastAutoTable.finalY + 25);
    
    doc.setFontSize(14);
    doc.text("2. 프로그램 내용", 14, doc.lastAutoTable.finalY + 40);
    
    // 프로그램 내용 테이블
    const contentRows = selectedGroup.content.split('\n').map(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        return [parts[0].trim(), parts.slice(1).join(':').trim()];
      }
      return [line, ''];
    });
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 50,
      theme: 'grid',
      head: [['일정', '객실 내용']],
      body: contentRows,
      styles: { fontSize: 10, cellPadding: 5 }
    });
    
    // 기대 효과
    doc.setFontSize(14);
    doc.text("3. 기대효과", 14, doc.lastAutoTable.finalY + 15);
    
    doc.setFontSize(11);
    const effectLines = doc.splitTextToSize(selectedGroup.expectedResult, 180);
    doc.text(effectLines, 14, doc.lastAutoTable.finalY + 25);
    
    // 비고
    if (selectedGroup.remarks) {
      doc.setFontSize(14);
      doc.text("4. 비고", 14, doc.lastAutoTable.finalY + 40);
      
      doc.setFontSize(11);
      const remarksLines = doc.splitTextToSize(selectedGroup.remarks, 180);
      doc.text(remarksLines, 14, doc.lastAutoTable.finalY + 50);
    }
    
    // 첨부 파일 목록
    if (attachedFiles.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text("첨부 파일 목록", 105, 20, null, null, "center");
      
      const fileRows = attachedFiles.map(file => [
        file.name,
        new Date(file.uploadDate).toLocaleDateString('ko-KR'),
        `${Math.round(file.size / 1024)} KB`
      ]);
      
      doc.autoTable({
        startY: 30,
        theme: 'grid',
        head: [['파일명', '첨부일', '크기']],
        body: fileRows,
        styles: { fontSize: 10, cellPadding: 5 }
      });
    }
    
    // PDF 저장
    doc.save(`수주보고서_${selectedGroup.groupName}.pdf`);
    handleClosePrintDialog();
    
    setNotification({
      open: true,
      message: 'PDF 파일이 생성되었습니다.',
      severity: 'success'
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 수주보고
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 달력 내 단체명 선택시에도 확인 가능</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 단체명 선택 시 세부내용 확인, 출력기능</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 붙임 3. 수주보고 참조</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              예약 단체 목록
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                    <DatePicker
                      label="날짜 검색"
                      value={searchDate}
                      onChange={(newDate) => setSearchDate(newDate)}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Autocomplete
                      value={searchGroup ? dummyGroupList.find(group => group.groupName === searchGroup) || null : null}
                      onChange={(event, newValue) => {
                        setSearchGroup(newValue ? newValue.groupName : '');
                      }}
                      options={dummyGroupList}
                      getOptionLabel={(option) => `${option.groupName} (${option.type} - ${option.date})`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="단체명 선택/검색"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {option.groupName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.type} - {option.date}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={handleSearch}
                  >
                    검색
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {dummyGroupList.map((group) => (
                <React.Fragment key={group.id}>
                  <ListItem 
                    button 
                    selected={selectedGroup && selectedGroup.groupName === group.groupName}
                    onClick={() => handleSelectGroup(group.id)}
                  >
                    <ListItemText 
                      primary={`${group.groupName} (${group.type})`} 
                      secondary={`예약일: ${group.date}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {dummyGroupList.length === 0 && (
                <ListItem>
                  <ListItemText primary="검색 결과가 없습니다." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                수주보고 상세 정보
              </Typography>
              {selectedGroup && (
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<AttachFileIcon />}
                    onClick={handleOpenFileUpload}
                    sx={{ mr: 1 }}
                  >
                    문서 첨부
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={handleOpenPrintDialog}
                  >
                    보고서 출력
                  </Button>
                </Box>
              )}
            </Box>
            
            {selectedGroup ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" gutterBottom>
                    수 주 보 고
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="단체명"
                    value={selectedGroup.groupName}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="일정"
                    value={selectedGroup.date}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="작성자"
                    value={selectedGroup.reporter}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="작성일"
                    value={selectedGroup.reportDate}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="프로그램명"
                    value={selectedGroup.program}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="참가인원"
                    value={`${selectedGroup.participants}명`}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="예산"
                    value={selectedGroup.budget}
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    1. 목적
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={selectedGroup.purpose}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    2. 프로그램 내용
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={selectedGroup.content}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    3. 기대효과
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={selectedGroup.expectedResult}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    4. 비고
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={selectedGroup.remarks}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                
                {/* 첨부 파일 섹션 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    첨부 파일
                  </Typography>
                  <List>
                    {attachedFiles.length > 0 ? (
                      attachedFiles.map((file, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleFileDelete(index)}>
                              <CloseIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={file.name}
                            secondary={`${new Date(file.uploadDate).toLocaleDateString('ko-KR')} | ${Math.round(file.size / 1024)} KB`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="첨부된 파일이 없습니다." />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Typography color="textSecondary">수주보고를 확인할 단체를 선택하세요.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* 출력 대화상자 */}
      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog}>
        <DialogTitle>보고서 출력</DialogTitle>
        <DialogContent>
          <Typography>수주보고서를 PDF로 저장하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>취소</Button>
          <Button 
            onClick={handlePrint} 
            variant="contained" 
            startIcon={<PrintIcon />}
          >
            PDF 저장
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 파일 업로드 대화상자 */}
      <Dialog open={fileUploadOpen} onClose={handleCloseFileUpload}>
        <DialogTitle>문서 첨부</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>첨부할 파일을 선택해주세요.</Typography>
          <input
            type="file"
            multiple
            onChange={handleFileAttach}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFileUpload}>닫기</Button>
        </DialogActions>
      </Dialog>
      
      {/* 알림 메시지 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportTab; 