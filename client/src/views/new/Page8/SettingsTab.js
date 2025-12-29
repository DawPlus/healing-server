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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Switch
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// 더미 데이터 - 설문지 목록
const initialSurveys = [
  {
    id: 1,
    name: '만족도 설문지',
    description: '프로그램 만족도 측정을 위한 설문지',
    isActive: true,
    questions: [
      { id: 101, text: '프로그램의 전반적인 만족도는 어떠셨습니까?', type: 'rating', isRequired: true },
      { id: 102, text: '강사의 전문성과 교육 방식에 만족하셨습니까?', type: 'rating', isRequired: true },
      { id: 103, text: '시설 및 환경에 대해 만족하셨습니까?', type: 'rating', isRequired: true },
      { id: 104, text: '개선사항이나 건의사항이 있으시면 작성해주세요.', type: 'text', isRequired: false }
    ]
  },
  {
    id: 2,
    name: '효과평가 설문지',
    description: '프로그램 효과 측정을 위한 설문지',
    isActive: true,
    questions: [
      { id: 201, text: '프로그램 참여 후 스트레스가 감소했다고 느끼십니까?', type: 'rating', isRequired: true },
      { id: 202, text: '프로그램 참여 후 심리적 안정감이 증가했다고 느끼십니까?', type: 'rating', isRequired: true },
      { id: 203, text: '프로그램이 치유 및 힐링에 효과적이었다고 생각하십니까?', type: 'rating', isRequired: true },
      { id: 204, text: '프로그램을 통해 가장 큰 변화가 있었던 부분은 무엇입니까?', type: 'text', isRequired: false }
    ]
  },
  {
    id: 3,
    name: '식사 평가 설문지',
    description: '식사 및 메뉴 만족도 측정을 위한 설문지',
    isActive: false,
    questions: [
      { id: 301, text: '식사의 맛에 만족하셨습니까?', type: 'rating', isRequired: true },
      { id: 302, text: '식사의 양은 적절했습니까?', type: 'rating', isRequired: true },
      { id: 303, text: '식당 환경 및 서비스에 만족하셨습니까?', type: 'rating', isRequired: true },
      { id: 304, text: '가장 맛있었던 메뉴는 무엇이었습니까?', type: 'text', isRequired: false }
    ]
  }
];

// 설문지 유형
const questionTypes = [
  { value: 'rating', label: '평점 (1-5점)' },
  { value: 'text', label: '주관식 텍스트' },
  { value: 'choice', label: '객관식 선택' }
];

const SettingsTab = () => {
  const [surveys, setSurveys] = useState(initialSurveys);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [openSurveyDialog, setOpenSurveyDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formMode, setFormMode] = useState('');
  const [surveyFormData, setSurveyFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [questionFormData, setQuestionFormData] = useState({
    text: '',
    type: 'rating',
    isRequired: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 설문지 선택 핸들러
  const handleSelectSurvey = (survey) => {
    setSelectedSurvey(survey);
  };

  // 설문지 추가 다이얼로그 열기
  const handleOpenAddSurveyDialog = () => {
    setEditingSurvey(null);
    setSurveyFormData({
      name: '',
      description: '',
      isActive: true
    });
    setFormMode('addSurvey');
    setOpenSurveyDialog(true);
  };

  // 설문지 수정 다이얼로그 열기
  const handleOpenEditSurveyDialog = (survey) => {
    setEditingSurvey(survey);
    setSurveyFormData({
      name: survey.name,
      description: survey.description,
      isActive: survey.isActive
    });
    setFormMode('editSurvey');
    setOpenSurveyDialog(true);
  };

  // 질문 추가 다이얼로그 열기
  const handleOpenAddQuestionDialog = () => {
    if (!selectedSurvey) {
      setSnackbar({
        open: true,
        message: '질문을 추가할 설문지를 먼저 선택해주세요.',
        severity: 'error'
      });
      return;
    }
    setEditingQuestion(null);
    setQuestionFormData({
      text: '',
      type: 'rating',
      isRequired: true
    });
    setFormMode('addQuestion');
    setOpenQuestionDialog(true);
  };

  // 질문 수정 다이얼로그 열기
  const handleOpenEditQuestionDialog = (question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      text: question.text,
      type: question.type,
      isRequired: question.isRequired
    });
    setFormMode('editQuestion');
    setOpenQuestionDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenSurveyDialog(false);
    setOpenQuestionDialog(false);
  };

  // 설문지 폼 변경 핸들러
  const handleSurveyFormChange = (event) => {
    const { name, value, checked } = event.target;
    setSurveyFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  // 질문 폼 변경 핸들러
  const handleQuestionFormChange = (event) => {
    const { name, value, checked } = event.target;
    setQuestionFormData(prev => ({
      ...prev,
      [name]: name === 'isRequired' ? checked : value
    }));
  };

  // 설문지 저장 (추가 또는 수정)
  const handleSaveSurvey = () => {
    // 입력 검증
    if (!surveyFormData.name) {
      setSnackbar({
        open: true,
        message: '설문지 이름을 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingSurvey) {
      // 설문지 수정
      setSurveys(prev => 
        prev.map(s => s.id === editingSurvey.id ? 
          { ...s, name: surveyFormData.name, description: surveyFormData.description, isActive: surveyFormData.isActive } : 
          s
        )
      );
      // 선택된 설문지도 업데이트
      if (selectedSurvey && selectedSurvey.id === editingSurvey.id) {
        setSelectedSurvey(prev => ({
          ...prev,
          name: surveyFormData.name,
          description: surveyFormData.description,
          isActive: surveyFormData.isActive
        }));
      }
      setSnackbar({
        open: true,
        message: '설문지가 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 설문지 추가
      const newId = Math.max(...surveys.map(s => s.id), 0) + 1;
      const newSurvey = { 
        ...surveyFormData, 
        id: newId, 
        questions: [] 
      };
      setSurveys(prev => [...prev, newSurvey]);
      setSelectedSurvey(newSurvey);
      setSnackbar({
        open: true,
        message: '새 설문지가 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  // 질문 저장 (추가 또는 수정)
  const handleSaveQuestion = () => {
    // 입력 검증
    if (!questionFormData.text) {
      setSnackbar({
        open: true,
        message: '질문 내용을 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    if (editingQuestion) {
      // 질문 수정
      setSurveys(prev => 
        prev.map(s => {
          if (s.id === selectedSurvey.id) {
            return {
              ...s,
              questions: s.questions.map(q => 
                q.id === editingQuestion.id ? 
                { ...q, ...questionFormData } : 
                q
              )
            };
          }
          return s;
        })
      );
      // 선택된 설문지도 업데이트
      setSelectedSurvey(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === editingQuestion.id ? 
          { ...q, ...questionFormData } : 
          q
        )
      }));
      setSnackbar({
        open: true,
        message: '질문이 성공적으로 수정되었습니다.',
        severity: 'success'
      });
    } else {
      // 질문 추가
      const newQuestionId = Math.max(
        ...surveys.flatMap(s => s.questions.map(q => q.id)), 
        0
      ) + 1;
      const newQuestion = { 
        ...questionFormData, 
        id: newQuestionId 
      };
      
      // 설문지 업데이트
      setSurveys(prev => 
        prev.map(s => {
          if (s.id === selectedSurvey.id) {
            return {
              ...s,
              questions: [...s.questions, newQuestion]
            };
          }
          return s;
        })
      );
      
      // 선택된 설문지도 업데이트
      setSelectedSurvey(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
      
      setSnackbar({
        open: true,
        message: '새 질문이 성공적으로 추가되었습니다.',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  // 설문지 삭제
  const handleDeleteSurvey = (surveyId) => {
    if (window.confirm('정말로 이 설문지를 삭제하시겠습니까?')) {
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
      if (selectedSurvey && selectedSurvey.id === surveyId) {
        setSelectedSurvey(null);
      }
      setSnackbar({
        open: true,
        message: '설문지가 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    }
  };

  // 질문 삭제
  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      // 설문지 업데이트
      setSurveys(prev => 
        prev.map(s => {
          if (s.id === selectedSurvey.id) {
            return {
              ...s,
              questions: s.questions.filter(q => q.id !== questionId)
            };
          }
          return s;
        })
      );
      
      // 선택된 설문지도 업데이트
      setSelectedSurvey(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      }));
      
      setSnackbar({
        open: true,
        message: '질문이 성공적으로 삭제되었습니다.',
        severity: 'success'
      });
    }
  };

  // 설문지 활성화 상태 변경
  const handleToggleSurveyActive = (surveyId, isActive) => {
    setSurveys(prev => 
      prev.map(s => s.id === surveyId ? { ...s, isActive } : s)
    );
    // 선택된 설문지도 업데이트
    if (selectedSurvey && selectedSurvey.id === surveyId) {
      setSelectedSurvey(prev => ({ ...prev, isActive }));
    }
  };

  // 스낵바 닫기 핸들러
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ⊙ 실적관리시스템
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <Typography>• 결과 입력사항 변경</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography>• 설문지(만족도, 사전사후 효과성평가) 입력방식 변경</Typography>
                <Typography>• 만족도 설문지 문항수 축소(세부 변경사항 추후 통보)</Typography>
                <Typography>• 기존 설문지별 입력방식 → 사람별 입력방식으로 변경</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 프로그램 운영 횟수 및 참여인원 추가 입력/결과 반영</Typography>
                <Typography>• 기존 프로그램별 1회만 입력 가능</Typography>
                <Typography>• 결과보고/운영통계에서 운영횟수 및 참여인원 표시</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography>• 설문조사 미입력 경우에도 결과보고 내 프로그램 실시현황 표시</Typography>
                <Typography>• 기존 설문조사 입력미입력 혼합 경우 설문조사 입력된 결과만 표시됨</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        {/* 설문지 목록 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">설문지 목록</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddSurveyDialog}
              >
                설문지 추가
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {surveys.map((survey) => (
                <ListItem
                  key={survey.id}
                  button
                  selected={selectedSurvey && selectedSurvey.id === survey.id}
                  onClick={() => handleSelectSurvey(survey)}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditSurveyDialog(survey);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSurvey(survey.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={survey.name}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {survey.description}
                        </Typography>
                        <Typography variant="body2" color={survey.isActive ? "success.main" : "error.main"}>
                          {survey.isActive ? "활성화됨" : "비활성화됨"}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 설문지 상세정보 및 질문 목록 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {selectedSurvey ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedSurvey.name} - 질문 목록
                  </Typography>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedSurvey.isActive}
                          onChange={(e) => handleToggleSurveyActive(selectedSurvey.id, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={selectedSurvey.isActive ? "활성화됨" : "비활성화됨"}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddQuestionDialog}
                      sx={{ ml: 2 }}
                    >
                      질문 추가
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary" paragraph>
                  {selectedSurvey.description}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell width="5%">No.</TableCell>
                        <TableCell width="55%">질문</TableCell>
                        <TableCell width="15%">유형</TableCell>
                        <TableCell width="10%">필수</TableCell>
                        <TableCell width="15%">관리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSurvey.questions.map((question, index) => (
                        <TableRow key={question.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{question.text}</TableCell>
                          <TableCell>
                            {questionTypes.find(type => type.value === question.type)?.label || question.type}
                          </TableCell>
                          <TableCell>{question.isRequired ? "필수" : "선택"}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenEditQuestionDialog(question)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {selectedSurvey.questions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            등록된 질문이 없습니다. 질문을 추가해주세요.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  좌측에서 설문지를 선택하면 질문 목록을 확인할 수 있습니다.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 설문지 추가/수정 다이얼로그 */}
      <Dialog open={openSurveyDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSurvey ? '설문지 수정' : '새 설문지 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="설문지 이름"
                name="name"
                value={surveyFormData.name}
                onChange={handleSurveyFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="설명"
                name="description"
                value={surveyFormData.description}
                onChange={handleSurveyFormChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={surveyFormData.isActive}
                    onChange={handleSurveyFormChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="활성화"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSaveSurvey} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 질문 추가/수정 다이얼로그 */}
      <Dialog open={openQuestionDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingQuestion ? '질문 수정' : '새 질문 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="질문 내용"
                name="text"
                value={questionFormData.text}
                onChange={handleQuestionFormChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="question-type-label">질문 유형</InputLabel>
                <Select
                  labelId="question-type-label"
                  name="type"
                  value={questionFormData.type}
                  label="질문 유형"
                  onChange={handleQuestionFormChange}
                >
                  {questionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={questionFormData.isRequired}
                    onChange={handleQuestionFormChange}
                    name="isRequired"
                    color="primary"
                  />
                }
                label="필수 질문"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSaveQuestion} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 알림 스낵바 */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsTab; 