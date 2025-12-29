import React, { useState, useEffect } from "react";
import MainCard from 'ui-component/cards/MainCard';
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import { Grid, CircularProgress, Typography, Box, Collapse, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import DatePicker from "ui-component/inputs/datePicker";
import ParticipationType from "./participationType";
import ResidenceList from "./residenceList";
import ProgramOverview from "./programOverview";
import ProgramManage from "./programManage";
import ProgramEffect from "./programEffect";
import PreventEffectSummary from "./preventEffectSummary";
import FacilitySatisfactionSummary from "./facilitySatisfactionSummary";
import HealingEffectSummary from "./healingEffectSummary";
import ExIncomeList from "./exIncomeList";
import { PrintSection } from "ui-component/printButton";
import Swal from "sweetalert2";
import { useLazyQuery } from '@apollo/client';
import { 
  GET_YEAR_MONTH_RESULTS,
  GET_YEAR_MONTH_SERVICE_STATS 
} from '../../graphql/yearMonthResult';

// 주제어 항목 정의
const keywordItems = [
  { value: "X", label: "해당없음" },
  { value: "AGENCY", label: "기관명" },
  { value: "OM", label: "OM" },
  { value: "DAYS_TO_STAY", label: "체류기간" },
  { value: "RESIDENCE", label: "거주지역" },
  { value: "BIZ_PURPOSE", label: "사업구분" },
  { value: "PART_TYPE", label: "참가자유형" },
  { value: "AGE_TYPE", label: "연령대" },
  { value: "PART_FORM", label: "참여형태" },
  { value: "ORG_NATURE", label: "단체성격" },
  { value: "SERVICE_TYPE", label: "서비스유형" },
];

// 주제어 항목별 옵션 정의
const itemObject = {
  RESIDENCE: [
    {label: "서울", value: "서울"},
    {label: "부산", value: "부산"},
    {label: "대구", value: "대구"},
    {label: "인천", value: "인천"},
    {label: "광주", value: "광주"},
    {label: "대전", value: "대전"},
    {label: "울산", value: "울산"},
    {label: "세종", value: "세종"},
    {label: "경기", value: "경기"},
    {label: "강원", value: "강원"},
    {label: "충북", value: "충북"},
    {label: "충남", value: "충남"},
    {label: "전북", value: "전북"},
    {label: "전남", value: "전남"},
    {label: "경북", value: "경북"},
    {label: "경남", value: "경남"},
    {label: "제주", value: "제주"},
    {label: "미기재", value: "미기재"}
  ],
  BIZ_PURPOSE: [
    {label: "사회공헌", value: "사회공헌"},
    {label: "수익사업", value: "수익사업"},
  ],
  AGE_TYPE: [
    {label: "아동청소년", value: "아동청소년"},
    {label: "성인", value: "성인"},
    {label: "노인", value: "노인"},
  ],
  PART_FORM: [
    {label: "단체", value: "단체"},
    {label: "개인", value: "개인"},
    {label: "기타", value: "기타"},
  ],
  ORG_NATURE: [
    {label: "교육기관", value: "교육기관"},
    {label: "복지기관", value: "복지기관"},
    {label: "기업", value: "기업"},
    {label: "관공서", value: "관공서"},
    {label: "강원랜드", value: "강원랜드"},
  ],
  SERVICE_TYPE: [
    {label: "산림교육", value: "산림교육"},
    {label: "산림치유", value: "산림치유"},
    {label: "행위중독치유", value: "행위중독치유"},
    {label: "행위중독예방", value: "행위중독예방"},
    {label: "힐링", value: "힐링"},
  ],
  PART_TYPE: [
    {label: "일반", value: "일반"},
    {label: "가족", value: "가족"},
    {label: "장애인", value: "장애인"},
    {label: "다문화", value: "다문화"},
  ]
};

/**
 * 연/월별 결과 리포트 페이지 컴포넌트
 * 직접 GraphQL 쿼리 사용 (훅, 리덕스, 리듀서, 목업 사용 X)
 */
const YearMonthResult = () => {
  // 상태 관리
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCloseMineCount, setIsMineCloseCount] = useState(0);
  const [showDetailSearch, setShowDetailSearch] = useState(false);
  const [keywords, setKeywords] = useState([
    { type: "X", value: "" },
    { type: "X", value: "" },
    { type: "X", value: "" }
  ]);
  
  // GraphQL 쿼리 직접 사용
  const [getYearMonthResults, { 
    data: resultsData, 
    loading: resultsLoading, 
    error: resultsError 
  }] = useLazyQuery(GET_YEAR_MONTH_RESULTS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log("Year Month Results loaded:", data);
    }
  });
  
  const [getYearMonthServiceStats, { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError 
  }] = useLazyQuery(GET_YEAR_MONTH_SERVICE_STATS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log("Year Month Service Stats (Report Data) loaded:", data);
    }
  });
  
  // DatePicker의 onChange 이벤트 핸들러
  const onChange = (name, value) => {
    if (name === 'openday') {
      setStartDate(value);
    } else if (name === 'endday') {
      setEndDate(value);
    }
  };
  
  // 주제어 타입 변경 핸들러
  const handleKeywordTypeChange = (index, newType) => {
    const newKeywords = [...keywords];
    newKeywords[index] = {
      type: newType,
      value: ""
    };
    setKeywords(newKeywords);
  };

  // 주제어 값 변경 핸들러
  const handleKeywordValueChange = (index, newValue) => {
    const newKeywords = [...keywords];
    newKeywords[index] = {
      ...newKeywords[index],
      value: newValue
    };
    setKeywords(newKeywords);
  };
  
  // 데이터 조회
  const onSearch = () => {
    // 입력값 검증
    if ([startDate, endDate].includes("")) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "시작일과 종료일을 모두 입력해주세요.",
      });
      return;
    }
    
    // 필터링된 키워드 정보
    const filteredKeywords = keywords
      .filter(k => k.type !== "X" && k.value)
      .map(k => ({
        type: k.type,
        value: k.value
      }));
    
    // 키워드 선택 정보 로그
    console.log(`조회 시작: ${startDate} ~ ${endDate}, 주제어:`, 
      filteredKeywords.length > 0 ? filteredKeywords : '없음');
    
    // GraphQL 쿼리 실행 (키워드 검색 기능 포함)
    const queryParams = {
      startDate, 
      endDate,
      keywords: filteredKeywords.length > 0 ? filteredKeywords : null
    };
    
    getYearMonthResults({ 
      variables: queryParams
    });
    
    getYearMonthServiceStats({ 
      variables: queryParams
    });
  };
  
  // 필터 초기화
  const resetFilters = () => {
    setKeywords([
      { type: "X", value: "" },
      { type: "X", value: "" },
      { type: "X", value: "" }
    ]);
  };
  
  // 인쇄 기능
  const onPrint = () => {
    if (!statsData?.getYearMonthServiceStats) {
      Swal.fire({
        icon: 'warning',
        title: '확인',
        text: "조회 결과가 없습니다. 먼저 데이터를 조회해주세요.",
      });
      return;
    }
    
    window.print();
  };
  
  // 상태 확인
  const isLoading = resultsLoading || statsLoading;
  const hasError = resultsError || statsError;
  const hasData = resultsData?.getYearMonthResults !== undefined && statsData?.getYearMonthServiceStats !== undefined;
  const hasResults = resultsData?.getYearMonthResults?.length > 0 || (statsData?.getYearMonthServiceStats && Object.keys(statsData.getYearMonthServiceStats).length > 0);
  
  // 에러 메시지
  const errorMessage = hasError ? (resultsError?.message || statsError?.message) : null;

  // 로딩, 에러, 데이터 없음 상태 렌더링
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center',
          padding: '50px'
        }}>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 3 }}>데이터를 로딩 중입니다...</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>잠시만 기다려주세요.</Typography>
        </Box>
      );
    }
    
    if (hasError) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center',
          padding: '50px'
        }}>
          <Typography variant="h5" color="error">오류가 발생했습니다</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{errorMessage}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>조회 조건을 수정한 후 다시 시도해주세요.</Typography>
        </Box>
      );
    }
    
    if (!statsData?.getYearMonthServiceStats) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center',
          padding: '50px'
        }}>
          <Typography variant="h5">조회할 기간을 선택해주세요</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>시작일과 종료일을 입력한 후 조회 버튼을 클릭하세요.</Typography>
        </Box>
      );
    }
    
    const noResultsFound = !resultsData?.getYearMonthResults?.length && statsData?.getYearMonthServiceStats?.programOverview?.people?.[0]?.total === 0;
    if (noResultsFound) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center',
          padding: '50px'
        }}>
          <Typography variant="h5">검색 결과가 없습니다</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>선택한 날짜 범위 ({startDate} ~ {endDate})에 해당하는 데이터가 없습니다.</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>다른 기간을 선택한 후 다시 시도해주세요.</Typography>
        </Box>
      );
    }
    
    const reportData = statsData.getYearMonthServiceStats;
    
    return (
      <PrintSection>
        <div style={{textAlign:"center", margin: "60px 0px 30px 0px"}}>
          <h1>하이힐링원 연·월 프로그램 실시 결과 보고</h1>
        </div>
        <div style={{textAlign: "right", fontSize: "12px", marginBottom: "15px"}}>
          {`기간 : ${startDate} ~ ${endDate}`}
        </div>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>참가유형</h3>
        <ParticipationType data={reportData.partTypeList || {}}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>지역</h3>
        <ResidenceList data={{ residenceList: resultsData?.getYearMonthResults }} isCloseMineCount={isCloseMineCount}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>프로그램시행개요</h3>
        <ProgramOverview data={reportData.programOverview || {}} rawData={resultsData?.getYearMonthResults || []}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>프로그램운영/만족도</h3>
        <ProgramManage data={reportData.programManage || {}}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>효과성분석</h3>
        <ProgramEffect data={reportData.programEffect || []}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>시설만족도분석 만족도</h3>
        <FacilitySatisfactionSummary data={{
          ...reportData.serList,
          facilityScoresByAgency: reportData.facilityScoresByAgency
        }}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>예방서비스 효과평가</h3>
        <PreventEffectSummary data={reportData.preventEffect || {}}/>
        
        <h3 className="tableTitle" style={{marginTop:"20px", marginBottom:"10px"}}>힐링서비스 효과평가</h3>
        <HealingEffectSummary data={reportData.healingEffect || {}}/>
        
        <ExIncomeList data={reportData.exIncomeList || {}}/>
      </PrintSection>
    );
  };

  return (
    <>
      <MainCard>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item container xs={12} md={8} spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <DatePicker 
                value={startDate} 
                label="시작일자" 
                name="openday" 
                onChange={onChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker 
                value={endDate} 
                label="종료일자" 
                name="endday" 
                onChange={onChange}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setShowDetailSearch(!showDetailSearch)}
              endIcon={showDetailSearch ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 0.75,
                mr: 1,
                fontWeight: 'medium',
                boxShadow: showDetailSearch ? '0 2px 10px rgba(25, 118, 210, 0.2)' : 'none',
                backgroundColor: showDetailSearch ? '#e3f2fd' : '#f5f9ff',
                borderColor: showDetailSearch ? '#1976d2' : '#90caf9',
                color: showDetailSearch ? '#0d47a1' : '#1976d2',
                '&:hover': {
                  backgroundColor: showDetailSearch ? '#bbdefb' : '#e3f2fd',
                  borderColor: '#1976d2'
                }
              }}
            >
              {showDetailSearch ? '상세검색 닫기' : '상세검색 열기'}
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={onSearch} 
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{ mr: 1 }}
            >
              {isLoading ? '조회 중...' : '조회'}
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={onPrint} 
              disabled={!statsData?.getYearMonthServiceStats || isLoading}
              startIcon={<PrintIcon />}
            >
              인쇄
            </Button>
          </Grid>

          {/* 상세검색 섹션 */}
          <Grid item xs={12}>
            <Collapse in={showDetailSearch} timeout="auto" unmountOnExit>
              <Box sx={{ 
                p: 2, 
                mt: 1, 
                mb: 2, 
                border: '1px solid #90caf9', 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#f5f9ff'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      borderBottom: '2px solid rgba(25, 118, 210, 0.2)',
                      pb: 1,
                      mb: 2
                    }}>
                      주제어 상세검색
                    </Typography>
                    <Typography variant="caption" color="textSecondary" paragraph sx={{ mb: 2 }}>
                      최대 3개까지 주제어를 선택하여 검색할 수 있습니다.
                    </Typography>
                  </Grid>
                  {keywords.map((keyword, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Grid container spacing={1}>
                        <Grid item xs={5}>
                          <FormControl fullWidth size="small">
                            <InputLabel>주제어 {index + 1}</InputLabel>
                            <Select
                              value={keyword.type}
                              label={`주제어 ${index + 1}`}
                              onChange={(e) => handleKeywordTypeChange(index, e.target.value)}
                            >
                              {keywordItems.map(item => (
                                <MenuItem key={item.value} value={item.value}>
                                  {item.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={7}>
                          {itemObject[keyword.type] ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>{keywordItems.find(k => k.value === keyword.type)?.label}</InputLabel>
                              <Select
                                value={keyword.value}
                                label={keywordItems.find(k => k.value === keyword.type)?.label}
                                onChange={(e) => handleKeywordValueChange(index, e.target.value)}
                                disabled={keyword.type === 'X'}
                              >
                                {itemObject[keyword.type].map(opt => (
                                  <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label="검색어"
                              variant="outlined"
                              value={keyword.value}
                              onChange={(e) => handleKeywordValueChange(index, e.target.value)}
                              disabled={keyword.type === 'X'}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #e0e0e0', mt: 2 }}>
                    <Button 
                      onClick={resetFilters}
                      variant="text"
                      size="small"
                      startIcon={<ClearIcon />}
                    >
                      초기화
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Grid>
          
          {/* Active filters display */}
          {keywords.some(k => k.type !== 'X' && k.value) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>활성 필터:</Typography>
                {keywords.filter(k => k.type !== "X" && k.value).map((k, idx) => {
                  const keywordLabel = keywordItems.find(item => item.value === k.type)?.label || k.type;
                  let valueLabel = k.value;
                  
                  // For special types, get the display label
                  if (itemObject[k.type]) {
                    valueLabel = itemObject[k.type].find(opt => opt.value === k.value)?.label || k.value;
                  }
                  
                  return (
                    <Box 
                      key={idx} 
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1.5, 
                        py: 0.75, 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        borderRadius: 4,
                        fontSize: '0.85rem',
                        fontWeight: 'medium',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Typography component="span" sx={{ fontWeight: 'bold', mr: 0.5 }}>
                        {keywordLabel}:
                      </Typography> 
                      {valueLabel}
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          )}
        </Grid>
      </MainCard>
  
      <MainCard id="print" sx={{ mt: 2, minHeight: "400px" }}>
        {renderContent()}
      </MainCard>
    </>
  );
};

export default YearMonthResult;