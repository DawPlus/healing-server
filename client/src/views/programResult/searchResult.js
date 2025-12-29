import React, { useState, useEffect } from "react";
import MainCard from 'ui-component/cards/MainCard';
import Select from "ui-component/select";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DatePicker from "ui-component/inputs/datePicker";
import Swal from "sweetalert2";
import { ThemeProvider, createTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';

import { useQuery, useLazyQuery } from '@apollo/client';
import { 
  SEARCH_PROGRAM_RESULTS, 
  SEARCH_FACILITY_RESULTS,
  SEARCH_PREVENT_RESULTS,
  SEARCH_HEALING_RESULTS,
  GET_AGENCY_LIST
} from '../../graphql/searchResult';

import ProgramResult from "./programResult";
import FacilityResult from "./facilityResult";
import PreventResult from "./preventResult";
import HealingResult from "./healingResult";
import CounselingResult from "./counselingResult";

// Material UI 기본 테마 생성
const theme = createTheme({
  spacing: 8,
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#f57c00',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
});

const itemObject = {
  SEX: [
    { label: "남", value: "남" },
    { label: "여", value: "여" },
    { label: "미기재", value: "미기재" },
  ],
  RESIDENCE: [
    { label: "서울", value: "서울" },
    { label: "부산", value: "부산" },
    { label: "대구", value: "대구" },
    { label: "인천", value: "인천" },
    { label: "광주", value: "광주" },
    { label: "대전", value: "대전" },
    { label: "울산", value: "울산" },
    { label: "세종", value: "세종" },
    { label: "경기", value: "경기" },
    { label: "강원", value: "강원" },
    { label: "충북", value: "충북" },
    { label: "충남", value: "충남" },
    { label: "전북", value: "전북" },
    { label: "전남", value: "전남" },
    { label: "경북", value: "경북" },
    { label: "경남", value: "경남" },
    { label: "제주", value: "제주" },
    { label: "미기재", value: "미기재" }
  ],
  PV: [
    { label: "사전", value: "사전" },
    { label: "사후", value: "사후" }
  ],
  JOB: [
    { label: "학생", value: "학생" },
    { label: "자영업", value: "자영업" },
    { label: "서비스직", value: "서비스직" },
    { label: "판매영업직", value: "판매영업직" },
    { label: "기능", value: "기능" },
    { label: "단순노무직", value: "단순노무직" },
    { label: "고위공직/임직원", value: "고위공직/임직원" },
    { label: "임직원", value: "임직원" },
    { label: "전문직", value: "전문직" },
    { label: "일반사무직", value: "일반사무직" },
    { label: "농림어업축산직", value: "농림어업축산직" },
    { label: "주부", value: "주부" },
    { label: "무직", value: "무직" },
    { label: "기타", value: "기타" },
    { label: "미기재", value: "미기재" },
  ],
  TYPE: [
    { label: "인솔자", value: "인솔자" },
    { label: "참여자", value: "참여자" },
    { label: "미기재", value: "미기재" },
  ]
};

// Mock results data
const MOCK_RESULTS = {
  "program": [
    {
      PROGRAM_NAME: "산림치유 프로그램",
      TEACHER: "김치유",
      PLACE: "숲속 쉼터",
      TYPE: "참여자",
      SCORE1: "4.5",
      SCORE2: "4.7",
      SCORE3: "4.6",
      SCORE4: "4.8",
      SCORE5: "4.4",
      SCORE6: "4.3",
      SCORE7: "4.9",
      SCORE8: "4.5",
      SCORE9: "4.7",
      sum1: "4.60",
      sum2: "4.50",
      sum3: "4.70",
      keyword0: "자연치유",
      keyword1: "스트레스해소",
      keyword2: "명상"
    },
    {
      PROGRAM_NAME: "명상 힐링",
      TEACHER: "박명상",
      PLACE: "명상 강당",
      TYPE: "참여자",
      SCORE1: "4.8",
      SCORE2: "4.9",
      SCORE3: "4.7",
      SCORE4: "4.6",
      SCORE5: "4.8",
      SCORE6: "4.7",
      SCORE7: "4.8",
      SCORE8: "4.9",
      SCORE9: "4.8",
      sum1: "4.80",
      sum2: "4.70",
      sum3: "4.83",
      keyword0: "마음챙김",
      keyword1: "내면치유",
      keyword2: "호흡법"
    }
  ],
  "facility": [
    {
      OPENDAY: "2023-05-12",
      AGENCY: "국립산림치유원",
      RESIDENCE: "서울특별시",
      AGE: 35,
      SEX: "남성",
      SCORE1: 4.7,
      SCORE2: 4.8,
      SCORE3: 4.5,
      SCORE4: 4.6,
      SCORE5: 4.9,
      SCORE6: 4.7,
      SCORE7: 4.8,
      SCORE8: 4.6,
      SCORE9: 4.7,
      SCORE10: 4.5,
      FACILITY_OPINION: "시설이 전반적으로 깨끗하고 잘 관리되어 있습니다.",
      SCORE11: 4.8,
      SCORE12: 4.7,
      SCORE13: 4.9,
      SCORE14: 4.6,
      SCORE15: 4.8,
      SCORE16: 4.7,
      OPERATION_OPINION: "운영이 체계적이고 친절합니다.",
      SCORE17: 4.8,
      SCORE18: 4.9,
      sum1: 4.7,
      sum2: 4.75,
      sum3: 4.8,
      sum4: 4.65,
      sum5: 4.75,
      sum6: 4.85,
      sum7: 4.75
    },
    {
      OPENDAY: "2023-06-18",
      AGENCY: "국립청도숲체원",
      RESIDENCE: "부산광역시",
      AGE: 42,
      SEX: "여성",
      SCORE1: 4.8,
      SCORE2: 4.9,
      SCORE3: 4.7,
      SCORE4: 4.8,
      SCORE5: 4.6,
      SCORE6: 4.8,
      SCORE7: 4.7,
      SCORE8: 4.9,
      SCORE9: 4.8,
      SCORE10: 4.7,
      FACILITY_OPINION: "자연과 잘 어우러진 시설 구성이 좋습니다.",
      SCORE11: 4.9,
      SCORE12: 4.8,
      SCORE13: 4.7,
      SCORE14: 4.8,
      SCORE15: 4.9,
      SCORE16: 4.8,
      OPERATION_OPINION: "다양한 프로그램이 잘 운영됩니다.",
      SCORE17: 4.9,
      SCORE18: 4.8,
      sum1: 4.8,
      sum2: 4.75,
      sum3: 4.85,
      sum4: 4.75,
      sum5: 4.8,
      sum6: 4.85,
      sum7: 4.8
    }
  ],
  "prevent": [
    {
      NAME: "김철수",
      SEX: "남",
      RESIDENCE: "서울",
      JOB: "회사원",
      PTCPROGRAM: "마음챙김",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사전",
      SCORE1: "3.5",
      SCORE2: "3.7",
      SCORE3: "3.6",
      SCORE4: "3.8",
      SCORE5: "3.4",
      SCORE6: "3.3",
      SCORE7: "3.5",
      SCORE8: "3.2",
      SCORE9: "3.6",
      SCORE10: "3.8",
      SCORE11: "3.7",
      SCORE12: "3.5",
      SCORE13: "3.6",
      SCORE14: "3.3",
      SCORE15: "3.2",
      SCORE16: "3.5",
      SCORE17: "3.6",
      SCORE18: "3.4",
      SCORE19: "3.5",
      SCORE20: "3.7",
      sum1: "3.60",
      sum2: "3.50",
      sum3: "3.52",
      sum4: "3.60",
      sum5: "3.44",
      sum6: "3.53"
    },
    {
      NAME: "김철수",
      SEX: "남",
      RESIDENCE: "서울",
      JOB: "회사원",
      PTCPROGRAM: "마음챙김",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사후",
      SCORE1: "4.7",
      SCORE2: "4.9",
      SCORE3: "4.8",
      SCORE4: "4.9",
      SCORE5: "4.6",
      SCORE6: "4.7",
      SCORE7: "4.8",
      SCORE8: "4.6",
      SCORE9: "4.9",
      SCORE10: "5.0",
      SCORE11: "4.9",
      SCORE12: "4.8",
      SCORE13: "4.7",
      SCORE14: "4.8",
      SCORE15: "4.6",
      SCORE16: "4.9",
      SCORE17: "4.8",
      SCORE18: "4.7",
      SCORE19: "4.8",
      SCORE20: "4.9",
      sum1: "4.80",
      sum2: "4.73",
      sum3: "4.82",
      sum4: "4.85",
      sum5: "4.76",
      sum6: "4.80"
    }
  ],
  "healing": [
    {
      NAME: "박서연",
      SEX: "여",
      RESIDENCE: "서울",
      JOB: "교사",
      PTCPROGRAM: "마음챙김 명상",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사전",
      SCORE1: "3.5",
      SCORE2: "3.6",
      SCORE3: "3.4",
      SCORE4: "3.5",
      SCORE5: "3.3",
      SCORE6: "3.7",
      SCORE7: "3.8",
      SCORE8: "3.6",
      SCORE9: "3.5",
      SCORE10: "3.4",
      SCORE11: "3.2",
      SCORE12: "3.5",
      SCORE13: "3.6",
      SCORE14: "3.7",
      SCORE15: "3.4",
      SCORE16: "3.3",
      SCORE17: "3.6",
      SCORE18: "3.5",
      SCORE19: "3.8",
      SCORE20: "3.6",
      SCORE21: "3.4",
      SCORE22: "3.7",
      sum1: "3.55",
      sum2: "3.40",
      sum3: "3.65",
      sum4: "3.37",
      sum5: "3.50",
      sum6: "3.50",
      sum7: "3.63"
    },
    {
      NAME: "박서연",
      SEX: "여",
      RESIDENCE: "서울",
      JOB: "교사",
      PTCPROGRAM: "마음챙김 명상",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사후",
      SCORE1: "4.8",
      SCORE2: "4.9",
      SCORE3: "4.7",
      SCORE4: "4.8",
      SCORE5: "4.6",
      SCORE6: "4.9",
      SCORE7: "5.0",
      SCORE8: "4.9",
      SCORE9: "4.8",
      SCORE10: "4.7",
      SCORE11: "4.8",
      SCORE12: "4.9",
      SCORE13: "4.7",
      SCORE14: "4.8",
      SCORE15: "4.6",
      SCORE16: "4.9",
      SCORE17: "4.8",
      SCORE18: "4.7",
      SCORE19: "5.0",
      SCORE20: "4.9",
      SCORE21: "4.8",
      SCORE22: "4.7",
      sum1: "4.85",
      sum2: "4.70",
      sum3: "4.90",
      sum4: "4.80",
      sum5: "4.75",
      sum6: "4.83",
      sum7: "4.75"
    }
  ],
  "counseling": [
    {
      keyword0: "30대",
      keyword1: "여성",
      keyword2: "직장인",
      NAME: "김서연",
      SEX: "여",
      RESIDENCE: "서울",
      JOB: "회사원",
      PTCPROGRAM: "스트레스 관리 상담",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사전",
      SCORE1: "2.5",
      SCORE2: "2.8",
      SCORE3: "2.6",
      SCORE4: "2.4",
      SCORE5: "2.7",
      SCORE6: "2.3",
      SCORE7: "2.5",
      SCORE8: "2.2",
      SCORE9: "2.6",
      SCORE10: "2.8",
      SCORE11: "2.7",
      SCORE12: "2.5",
      SCORE13: "2.6",
      SCORE14: "2.3",
      SCORE15: "2.2",
      SCORE16: "2.5",
      SCORE17: "2.6",
      SCORE18: "2.4",
      SCORE19: "2.5",
      SCORE20: "2.7",
      sum1: "2.63",
      sum2: "2.50",
      sum3: "2.43",
      sum4: "2.50",
      sum5: "2.48",
      sum6: "2.53"
    },
    {
      keyword0: "30대",
      keyword1: "여성",
      keyword2: "직장인",
      NAME: "김서연",
      SEX: "여",
      RESIDENCE: "서울",
      JOB: "회사원",
      PTCPROGRAM: "스트레스 관리 상담",
      PAST_STRESS_EXPERIENCE: "있음",
      PV: "사후",
      SCORE1: "4.2",
      SCORE2: "4.5",
      SCORE3: "4.3",
      SCORE4: "4.6",
      SCORE5: "4.4",
      SCORE6: "4.7",
      SCORE7: "4.8",
      SCORE8: "4.5",
      SCORE9: "4.6",
      SCORE10: "4.9",
      SCORE11: "4.7",
      SCORE12: "4.6",
      SCORE13: "4.5",
      SCORE14: "4.8",
      SCORE15: "4.6",
      SCORE16: "4.7",
      SCORE17: "4.8",
      SCORE18: "4.6",
      SCORE19: "4.7",
      SCORE20: "4.9",
      sum1: "4.33",
      sum2: "4.57",
      sum3: "4.63",
      sum4: "4.63",
      sum5: "4.68",
      sum6: "4.73"
    },
    {
      keyword0: "40대",
      keyword1: "남성",
      keyword2: "자영업",
      NAME: "이민수",
      SEX: "남",
      RESIDENCE: "부산",
      JOB: "자영업",
      PTCPROGRAM: "관계 개선 상담",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사전",
      SCORE1: "3.0",
      SCORE2: "3.2",
      SCORE3: "2.9",
      SCORE4: "3.1",
      SCORE5: "3.3",
      SCORE6: "2.8",
      SCORE7: "3.0",
      SCORE8: "2.7",
      SCORE9: "3.2",
      SCORE10: "2.9",
      SCORE11: "3.1",
      SCORE12: "3.3",
      SCORE13: "2.8",
      SCORE14: "3.0",
      SCORE15: "3.2",
      SCORE16: "2.9",
      SCORE17: "3.1",
      SCORE18: "3.0",
      SCORE19: "2.8",
      SCORE20: "3.2",
      sum1: "3.03",
      sum2: "3.07",
      sum3: "2.97",
      sum4: "3.07",
      sum5: "3.03",
      sum6: "3.00"
    },
    {
      keyword0: "40대",
      keyword1: "남성",
      keyword2: "자영업",
      NAME: "이민수",
      SEX: "남",
      RESIDENCE: "부산",
      JOB: "자영업",
      PTCPROGRAM: "관계 개선 상담",
      PAST_STRESS_EXPERIENCE: "없음",
      PV: "사후",
      SCORE1: "4.1",
      SCORE2: "4.3",
      SCORE3: "4.2",
      SCORE4: "4.4",
      SCORE5: "4.5",
      SCORE6: "4.3",
      SCORE7: "4.2",
      SCORE8: "4.0",
      SCORE9: "4.3",
      SCORE10: "4.1",
      SCORE11: "4.2",
      SCORE12: "4.4",
      SCORE13: "4.3",
      SCORE14: "4.5",
      SCORE15: "4.2",
      SCORE16: "4.1",
      SCORE17: "4.3",
      SCORE18: "4.2",
      SCORE19: "4.0",
      SCORE20: "4.4",
      sum1: "4.20",
      sum2: "4.40",
      sum3: "4.17",
      sum4: "4.30",
      sum5: "4.15",
      sum6: "4.20"
    }
  ]
};

const SearchResult = () => {
  const [searchInfo, setSearchInfo] = useState({
    openday: "",
    endday: "",
    effect: "",
    selectedAgency: null,
    keyword: [
      { type: "X", text: "" },
      { type: "X", text: "" },
      { type: "X", text: "" },
      { type: "X", text: "" }
    ]
  });
  const [rows, setRows] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Get agency list for dropdown
  const { data: agencyData, loading: loadingAgencies } = useQuery(GET_AGENCY_LIST, {
    fetchPolicy: 'network-only'
  });

  // Lazy queries for the different result types
  const [searchPrograms, { loading: loadingProgram }] = useLazyQuery(SEARCH_PROGRAM_RESULTS, {
    onCompleted: (data) => {
      setRows(data.searchProgramResults || []);
      setShowResults(true);
    },
    onError: (error) => {
      console.error("프로그램 검색 오류:", error);
      Swal.fire({
        title: "오류",
        text: "데이터 검색 중 오류가 발생했습니다: " + error.message,
        icon: 'error',
      });
    }
  });

  const [searchFacilities, { loading: loadingFacility }] = useLazyQuery(SEARCH_FACILITY_RESULTS, {
    onCompleted: (data) => {
      setRows(data.searchFacilityResults || []);
      setShowResults(true);
    },
    onError: (error) => {
      console.error("시설 검색 오류:", error);
      Swal.fire({
        title: "오류",
        text: "데이터 검색 중 오류가 발생했습니다: " + error.message,
        icon: 'error',
      });
    }
  });

  const [searchPrevent, { loading: loadingPrevent }] = useLazyQuery(SEARCH_PREVENT_RESULTS, {
    onCompleted: (data) => {
      setRows(data.searchPreventResults || []);
      setShowResults(true);
    },
    onError: (error) => {
      console.error("예방 검색 오류:", error);
      Swal.fire({
        title: "오류",
        text: "데이터 검색 중 오류가 발생했습니다: " + error.message,
        icon: 'error',
      });
    }
  });

  const [searchHealing, { loading: loadingHealing }] = useLazyQuery(SEARCH_HEALING_RESULTS, {
    onCompleted: (data) => {
      setRows(data.searchHealingResults || []);
      setShowResults(true);
    },
    onError: (error) => {
      console.error("힐링 검색 오류:", error);
      Swal.fire({
        title: "오류",
        text: "데이터 검색 중 오류가 발생했습니다: " + error.message,
        icon: 'error',
      });
    }
  });

  const effectItems = [
    { label: "프로그램 만족도", value: "program" },
    { label: "시설서비스 환경 만족도", value: "facility" },
    { label: "상담&치유 서비스", value: "counseling" },
    { label: "예방 서비스", value: "prevent" },
    { label: "힐링 서비스", value: "healing" },
  ];

  const programKeywordItem = [
    { value: "X", label: "해당없음" },
    { value: "SEX", label: "성별" },
    { value: "AGE", label: "연령(만)" },
    { value: "RESIDENCE", label: "거주지" },
    { value: "JOB", label: "직업" },
    { value: "OPENDAY", label: "시작일자" },
    { value: "PLACE", label: "장소" },
    { value: "TEACHER", label: "강사" },
    { value: "PROGRAM_NAME", label: "프로그램이름" },
    { value: "BUNYA", label: "분야" },
    { value: "TYPE", label: "참여구분" },
    { value: "PV", label: "평가시점" },
  ];

  const onChangeHandler = (e) => {
    setSearchInfo({
      ...searchInfo,
      effect: e.target.value
    });
  };

  const onChangeKeyword = index => e => {
    const updatedKeyword = [...searchInfo.keyword];
    updatedKeyword[index] = {
      ...updatedKeyword[index],
      [e.target.name]: e.target.value
    };
    
    setSearchInfo({
      ...searchInfo,
      keyword: updatedKeyword
    });
  };

  const onChangeKeywordDate = index => (key, value) => {
    const updatedKeyword = [...searchInfo.keyword];
    updatedKeyword[index] = {
      ...updatedKeyword[index],
      [key]: value
    };
    
    setSearchInfo({
      ...searchInfo,
      keyword: updatedKeyword
    });
  };

  const onAgencyChange = (event, newValue) => {
    setSearchInfo({
      ...searchInfo,
      selectedAgency: newValue
    });
  };

  const onSearch = () => {
    if (!searchInfo.effect) {
      Swal.fire({
        title: `확인`,
        text: `입력양식을 선택해 주십시오`,
        icon: 'warning',
      });
      return;
    }

    // Filter out empty keywords
    const validKeywords = searchInfo.keyword.filter(k => k.type !== "X" && k.text);

    // Build common query variables
    const variables = {
      openday: searchInfo.openday || null,
      endday: searchInfo.endday || null,
      keywords: validKeywords.length > 0 ? validKeywords : null
    };

    // Add agency if selected
    if (searchInfo.selectedAgency) {
      variables.agency = searchInfo.selectedAgency.agency;
    }

    console.log("검색 시작 - 검색 변수:", JSON.stringify(variables, null, 2));

    // Execute the appropriate query based on the effect type
    switch (searchInfo.effect) {
      case "program":
        searchPrograms({ variables });
        break;
      case "facility":
        searchFacilities({ variables });
        break;
      case "prevent":
        searchPrevent({ variables });
        break;
      case "healing":
        searchHealing({ variables });
        break;
      case "counseling":
        // Mock data for counseling since it's not implemented
        setRows(MOCK_RESULTS["counseling"] || []);
        setShowResults(true);
        break;
      default:
        Swal.fire({
          title: "오류",
          text: "알 수 없는 입력양식 유형입니다: " + searchInfo.effect,
          icon: 'error',
        });
        break;
    }
  };

  const setDate = (key, value) => {
    setSearchInfo({
      ...searchInfo,
      [key]: value
    });
  };

  // Helper to determine if any search is in progress
  const isLoading = loadingProgram || loadingFacility || loadingPrevent || loadingHealing;

  return (
    <ThemeProvider theme={theme}>
      <>
        <MainCard>
          <Grid container alignItems="center" spacing={2}>
            <Grid item md={3}>
              <DatePicker label="시작일" name="openday" value={searchInfo.openday} onChange={setDate} />
            </Grid>
            <Grid item md={3}>
              <DatePicker label="종료일" name="endday" value={searchInfo.endday} onChange={setDate} />
            </Grid>
            <Grid item md={3}>
              <Select value={searchInfo.effect} label="입력양식" name="effect" items={effectItems} onChange={onChangeHandler} />
            </Grid>
            <Grid item md={3}>
              <Autocomplete
                size="small"
                value={searchInfo.selectedAgency}
                onChange={onAgencyChange}
                options={agencyData?.getAgencies || []}
                getOptionLabel={(option) => option.agency || ''}
                loading={loadingAgencies}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="단체선택" 
                    size="small"
                    style={{height: "40px"}}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingAgencies ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item md={3}>
              <div style={{ textAlign: "right" }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={onSearch}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : "조회"}
                </Button>
              </div>
            </Grid>
            {searchInfo.keyword.map((i, idx) =>
              <Grid item md={3} key={idx}>
                <Grid container spacing={1}>
                  <Grid item md={6}>
                    <Select minWidth="50" value={i.type} label={`주제어${idx + 1}`} name="type" items={programKeywordItem} onChange={onChangeKeyword(idx)} />
                  </Grid>
                  <Grid item md={6}>
                    {
                      ["SEX", "RESIDENCE", "JOB", "PV", "TYPE"].includes(i.type) ?
                        <Select value={i.text} label="주제어" name="text" items={itemObject[i.type]} onChange={onChangeKeyword(idx)} />
                        : i.type === "OPENDAY" ? <DatePicker label="주제어" name="text" value={i.text} onChange={onChangeKeywordDate(idx)} /> :
                          <TextField label="주제어" name="text" value={i.text} size="small" onChange={onChangeKeyword(idx)} variant="outlined" />
                    }
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </MainCard>
        <MainCard style={{ marginTop: "10px" }}>
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <CircularProgress />
            </div>
          )}
          {showResults && rows.length > 0 && !isLoading &&
            <>
              {searchInfo.effect === "program" && <ProgramResult rows={rows} />}
              {searchInfo.effect === "facility" && <FacilityResult rows={rows} />}
              {searchInfo.effect === "prevent" && <PreventResult rows={rows} />}
              {searchInfo.effect === "counseling" && <CounselingResult rows={rows} />}
              {searchInfo.effect === "healing" && <HealingResult rows={rows} />}
            </>
          }
          {showResults && rows.length === 0 && !isLoading &&
            <div style={{ padding: "20px", textAlign: "center" }}>
              조회된 결과가 없습니다.
            </div>
          }
        </MainCard>
      </>
    </ThemeProvider>
  );
}

export default SearchResult; 