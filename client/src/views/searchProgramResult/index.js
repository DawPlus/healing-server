import React, { useState } from "react";
import MainCard from 'ui-component/cards/MainCard';
import PrintIcon from '@mui/icons-material/Print';
import Select from "ui-component/select";
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Swal from "sweetalert2";
import { PrintSection } from "ui-component/printButton";
import ProgramManage from "./programManage";
import DatePicker from "ui-component/inputs/datePicker";
import ParticipationType from "./participationType";
import ResidenceList from "./residenceList";
import SerList from "./serList";
import ProgramEffect from "./programEffect";
import { useLazyQuery } from '@apollo/client';
import { 
  GET_SEARCH_PART_TYPE_LIST, 
  GET_SEARCH_RESIDENCE_LIST, 
  GET_SEARCH_PROGRAM_MANAGE, 
  GET_SEARCH_SER_LIST, 
  GET_SEARCH_PROGRAM_EFFECT,
  GET_SEARCH_IS_CLOSE_MINE
} from '../../graphql/searchProgramResult';
import { CircularProgress } from '@mui/material';

// Mock data
const mockPartTypeList = {
  count_addict: 10,
  count_adult: 35,
  count_benefit: 25,
  count_etc: 15,
  count_family: 20,
  count_handicap: 8,
  count_income_etc: 12,
  count_income_green: 30,
  count_income_voucher: 18,
  count_kidboy: 20,
  count_lowincome: 10,
  count_old: 25,
  count_society: 30,
  count_teacher: 15,
  part_addict: 20,
  part_adult: 70,
  part_benefit: 50,
  part_etc: 30,
  part_family: 40,
  part_handicap: 15,
  part_income_etc: 25,
  part_income_green: 60,
  part_income_voucher: 35,
  part_kidboy: 40,
  part_lowincome: 20,
  part_old: 50,
  part_society: 60,
  part_teacher: 30,
  org_1: 15,
  org_2: 10,
  org_3: 20,
  org_4: 25,
  org_5: 15,
  org_part_1: 30,
  org_part_2: 25,
  org_part_3: 35,
  org_part_4: 45,
  org_part_5: 30,
};

const mockResidenceList = [
  { RESIDENCE: "서울", count: 12, total: 120 },
  { RESIDENCE: "부산", count: 8, total: 80 },
  { RESIDENCE: "대구", count: 5, total: 50 },
  { RESIDENCE: "인천", count: 6, total: 60 },
  { RESIDENCE: "대전", count: 4, total: 40 },
  { RESIDENCE: "광주", count: 3, total: 30 },
  { RESIDENCE: "울산", count: 2, total: 20 },
  { RESIDENCE: "경기", count: 15, total: 150 },
  { RESIDENCE: "강원", count: 10, total: 100 },
  { RESIDENCE: "폐광지역", count: 7, total: 70 },
  { RESIDENCE: "충북", count: 5, total: 50 },
  { RESIDENCE: "충남", count: 6, total: 60 },
  { RESIDENCE: "세종", count: 2, total: 20 },
  { RESIDENCE: "경북", count: 7, total: 70 },
  { RESIDENCE: "경남", count: 8, total: 80 },
  { RESIDENCE: "전북", count: 5, total: 50 },
  { RESIDENCE: "전남", count: 6, total: 60 },
  { RESIDENCE: "제주", count: 3, total: 30 }
];

const mockProgramManage = {
  manage: [
    { type: '프로그램(개)', 산림교육: 20, 예방교육: 15, 산림치유: 18, 아트: 12, 릴렉싱: 14, 에너제틱: 8, 쿠킹: 10, 이벤트: 15, 합계: 112 },
    { type: '내부강사(명)', 산림교육: 15, 예방교육: 10, 산림치유: 12, 아트: 8, 릴렉싱: 9, 에너제틱: 5, 쿠킹: 7, 이벤트: 10, 합계: 76 },
    { type: '외부강사(명)', 산림교육: 5, 예방교육: 5, 산림치유: 6, 아트: 4, 릴렉싱: 5, 에너제틱: 3, 쿠킹: 3, 이벤트: 5, 합계: 36 }
  ],
  bunya: [
    { type: '강사', 산림교육: 4.5, 예방교육: 4.3, 산림치유: 4.7, 아트: 4.2, 릴렉싱: 4.4, 에너제틱: 4.1, 쿠킹: 4.5, 이벤트: 4.6 },
    { type: '내용구성', 산림교육: 4.4, 예방교육: 4.2, 산림치유: 4.6, 아트: 4.3, 릴렉싱: 4.3, 에너제틱: 4.0, 쿠킹: 4.4, 이벤트: 4.5 },
    { type: '효과성', 산림교육: 4.6, 예방교육: 4.4, 산림치유: 4.8, 아트: 4.1, 릴렉싱: 4.5, 에너제틱: 4.2, 쿠킹: 4.3, 이벤트: 4.7 },
    { type: '참여인원', 산림교육: 150, 예방교육: 120, 산림치유: 135, 아트: 90, 릴렉싱: 105, 에너제틱: 60, 쿠킹: 75, 이벤트: 120 },
    { type: '평균', 산림교육: 4.5, 예방교육: 4.3, 산림치유: 4.7, 아트: 4.2, 릴렉싱: 4.4, 에너제틱: 4.1, 쿠킹: 4.4, 이벤트: 4.6 }
  ]
};

const mockSerList = {
  score1: 4.5,
  score2: 4.3,
  score3: 4.6,
  score4: 4.4,
  score5: 4.7,
  score6: 4.5,
  score7: 4.2,
  score8: 4.6,
  score9: 4.4,
  score10: 4.5,
  score11: 4.7,
  score12: 4.6,
  score13: 4.5,
  score14: 4.3,
  score15: 4.4,
  score16: 4.5,
  total: 4.5
};

const mockProgramEffect = [
  {
    PV: "사전",
    preventSum: 120,
    preventAvg: 4.0,
    counselSum: 110,
    counselAvg: 3.7,
    healingTotalSum: 115,
    healingAverageScore: 3.8,
    hrvNum1: 62,
    hrvNum2: 58,
    hrvNum3: 67,
    hrvNum4: 72,
    hrvNum5: 65
  },
  {
    PV: "사후",
    preventSum: 140,
    preventAvg: 4.7,
    counselSum: 135,
    counselAvg: 4.5,
    healingTotalSum: 138,
    healingAverageScore: 4.6,
    hrvNum1: 75,
    hrvNum2: 72,
    hrvNum3: 80,
    hrvNum4: 60,
    hrvNum5: 55
  }
];

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

const keywordItem = [
  {value: "X", label: "해당없음"},
  {value: "AGENCY", label: "기관명"},
  {value: "OM", label: "OM"},
  {value: "DAYS_TO_STAY", label: "체류기간"},
  {value: "RESIDENCE", label: "거주지역"},
  {value: "BIZ_PURPOSE", label: "사업구분"},
  {value: "PART_TYPE", label: "참가자유형"},
  {value: "AGE_TYPE", label: "연령대"},
  {value: "PART_FORM", label: "참여형태"},
  {value: "ORG_NATURE", label: "단체성격"},
  {value: "SERVICE_TYPE", label: "서비스유형"},
];

const SearchPage = () => {
  // State for search form
  const [openday, setOpenday] = useState("");
  const [endday, setEndday] = useState("");
  const [keyword, setKeyword] = useState([
    {type: "X", text: ""},
    {type: "X", text: ""},
    {type: "X", text: ""}
  ]);
  
  // State for data display
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for data
  const [partTypeList, setPartTypeList] = useState(mockPartTypeList);
  const [residenceList, setResidenceList] = useState(mockResidenceList);
  const [programManage, setProgramManage] = useState(mockProgramManage);
  const [serList, setSerList] = useState(mockSerList);
  const [programEffect, setProgramEffect] = useState(mockProgramEffect);
  const [isCloseMineCount, setIsCloseMineCount] = useState(15);

  // GraphQL 쿼리 정의
  const [getPartTypeList] = useLazyQuery(GET_SEARCH_PART_TYPE_LIST, {
    onCompleted: (data) => {
      if (data && data.getSearchPartTypeList) {
        setPartTypeList(data.getSearchPartTypeList);
      }
    },
    onError: (error) => {
      console.error("참가유형 조회 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '참가유형 데이터를 가져오는 중 오류가 발생했습니다.',
      });
    }
  });

  const [getResidenceList] = useLazyQuery(GET_SEARCH_RESIDENCE_LIST, {
    onCompleted: (data) => {
      if (data && data.getSearchResidenceList) {
        setResidenceList(data.getSearchResidenceList);
      }
    },
    onError: (error) => {
      console.error("지역 분포 조회 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '지역 분포 데이터를 가져오는 중 오류가 발생했습니다.',
      });
    }
  });

  const [getProgramManage] = useLazyQuery(GET_SEARCH_PROGRAM_MANAGE, {
    onCompleted: (data) => {
      if (data && data.getSearchProgramManage) {
        setProgramManage(data.getSearchProgramManage);
      }
    },
    onError: (error) => {
      console.error("프로그램 관리 조회 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '프로그램 관리 데이터를 가져오는 중 오류가 발생했습니다.',
      });
    }
  });

  const [getSerList] = useLazyQuery(GET_SEARCH_SER_LIST, {
    onCompleted: (data) => {
      if (data && data.getSearchSerList) {
        setSerList(data.getSearchSerList);
      }
    },
    onError: (error) => {
      console.error("시설 서비스 만족도 조회 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '시설 서비스 만족도 데이터를 가져오는 중 오류가 발생했습니다.',
      });
    }
  });

  const [getProgramEffect] = useLazyQuery(GET_SEARCH_PROGRAM_EFFECT, {
    onCompleted: (data) => {
      if (data && data.getSearchProgramEffect) {
        setProgramEffect(data.getSearchProgramEffect);
      }
    },
    onError: (error) => {
      console.error("프로그램 효과성 분석 조회 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '프로그램 효과성 분석 데이터를 가져오는 중 오류가 발생했습니다.',
      });
    }
  });

  const [getIsCloseMine] = useLazyQuery(GET_SEARCH_IS_CLOSE_MINE, {
    onCompleted: (data) => {
      if (data && data.getSearchIsCloseMine !== undefined) {
        setIsCloseMineCount(data.getSearchIsCloseMine);
      }
    },
    onError: (error) => {
      console.error("폐광지역 카운트 조회 오류:", error);
    }
  });

  const onChangeKeyword = (index) => (e) => {
    const newKeywords = [...keyword];
    newKeywords[index] = {
      ...newKeywords[index],
      [e.target.name]: e.target.value
    };
    setKeyword(newKeywords);
  };

  const onSearch = async () => {
    // 날짜 범위 체크
    if (openday && endday && new Date(openday) > new Date(endday)) {
      Swal.fire({
        title: "확인",
        text: "시작일은 종료일보다 이전이어야 합니다",
        icon: "warning",
      });
      return;
    }

    // 쿼리 파라미터 생성
    const queryParams = {
      keyword: keyword.filter(k => k.type !== "X" && k.text !== "").map(k => ({
        type: k.type,
        text: k.text
      })),
      openday: openday || null,
      endday: endday || null
    };

    try {
      setIsLoading(true);

      // 모든 쿼리 병렬로 실행
      await Promise.all([
        getPartTypeList({ variables: queryParams }),
        getResidenceList({ variables: queryParams }),
        getProgramManage({ variables: queryParams }),
        getSerList({ variables: queryParams }),
        getProgramEffect({ variables: queryParams }),
        getIsCloseMine({ variables: queryParams })
      ]);

      setShowResults(true);
      
    } catch (error) {
      console.error("데이터 조회 중 오류 발생:", error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '데이터 조회 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPrint = () => {
    window.print();
  };

  return (
    <>
      <MainCard>
        <Grid container alignItems="center" spacing={1}>
          <Grid item sm={3}><DatePicker label="시작일" name="openday" value={openday} onChange={(_, value) => setOpenday(value)}/></Grid>
          <Grid item sm={3}><DatePicker label="종료일" name="endday" value={endday} onChange={(_, value) => setEndday(value)}/></Grid>
          <Grid item sm={6}></Grid>
          {keyword.map((i, idx) => 
            <Grid item sm={3} key={idx}>
              <Grid container alignItems="center" spacing={1}>
                <Grid item sm={6}>
                  <Select 
                    minWidth="50" 
                    value={i.type} 
                    label={`주제어${idx+1}`} 
                    name="type" 
                    items={keywordItem} 
                    onChange={onChangeKeyword(idx)}
                  />
                </Grid>
                <Grid item sm={6}>
                  {itemObject[i.type] ? 
                    <Select 
                      value={i.text} 
                      label="주제어" 
                      name="text" 
                      items={itemObject[i.type]} 
                      onChange={onChangeKeyword(idx)}
                    /> :
                    <TextField 
                      label="주제어" 
                      name="text" 
                      value={i.text} 
                      size="small" 
                      onChange={onChangeKeyword(idx)} 
                      variant="outlined" 
                    />
                  }
                </Grid>
              </Grid>
            </Grid>
          )}
          <Grid item sm={3}>
            <div style={{textAlign: "right"}}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onSearch} 
                style={{margin: "0px 5px"}}
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
              >
                {isLoading ? '조회 중...' : '조회'}
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onPrint}
                disabled={!showResults || isLoading}
              >
                <PrintIcon />
              </Button>
            </div>
          </Grid>
        </Grid>
      </MainCard>
      
      <MainCard id="print" style={{marginTop: "10px", minHeight: "400px"}}>
        <PrintSection>
          <div style={{textAlign: "right", marginBottom: "15px"}}></div>
          <div style={{textAlign: "center", margin: "60px 0px 30px 0px"}}>
            <h1>주제어별 프로그램 통계</h1>
          </div>
          
          {showResults && (
            <>
              <ParticipationType data={{ partTypeList }} />
              <ResidenceList data={{ residenceList }} isCloseMineCount={isCloseMineCount} />
              <ProgramManage data={{ programManage }} />
              <SerList data={{ serList }} />
              <ProgramEffect data={{ programEffect }} />
            </>
          )}
          
          {isLoading && (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}>
              <CircularProgress size={60} />
            </div>
          )}
        </PrintSection>
      </MainCard>
    </>
  );
};

export default SearchPage;