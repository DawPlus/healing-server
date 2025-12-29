import React, {useState, useEffect} from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import MainCard from 'ui-component/cards/MainCard';

import { Grid, CircularProgress, Typography, Collapse, IconButton, Box } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Swal from "sweetalert2";
import Program from "./program"
import Facility from "./facility"
import Prevent from "./prevent"
import Healing from "./healing"

import DatePicker from "ui-component/inputs/datePicker";
import SelectItems from "ui-component/inputs/selectItems";
import { useQuery, useLazyQuery, gql } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';

// Import the query for reservation list (agency list)
const GET_PAGE5_RESERVATION_LIST = gql`
  query GetPage5ReservationList {
    getPage1List {
      id
      group_name
      customer_name
      start_date
      end_date
      reservation_status
    }
  }
`;

// GraphQL queries for different types of data
const GET_PROGRAM_RESULT = gql`
  query GetProgramResult($agency: String, $agency_id: Int, $type: String!, $openday: String, $endday: String, $inType: String, $keywords: [KeywordInput]) {
    getProgramResult(agency: $agency, agency_id: $agency_id, type: $type, openday: $openday, endday: $endday, inType: $inType, keywords: $keywords) {
      PROGRAM_NAME
      TEACHER
      PLACE
      TYPE
      AGENCY
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
    }
  }
`;

const GET_FACILITY_LIST = gql`
  query GetFacilityList($agency: String, $agency_id: Int, $type: String!, $openday: String, $endday: String, $keywords: [KeywordInput]) {
    getFacilityList(agency: $agency, agency_id: $agency_id, type: $type, openday: $openday, endday: $endday, keywords: $keywords) {
      OPENDAY
      AGENCY
      PTCPROGRAM
      SEX
      AGE
      RESIDENCE
      JOB
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      SCORE10
      FACILITY_OPINION
      SCORE11
      SCORE12
      SCORE13
      SCORE14
      SCORE15
      SCORE16
      OPERATION_OPINION
      SCORE17
      SCORE18
    }
  }
`;

const GET_PREVENT_LIST = gql`
  query GetPreventList($agency: String, $agency_id: Int, $type: String!, $openday: String, $endday: String, $keywords: [KeywordInput]) {
    getPreventList(agency: $agency, agency_id: $agency_id, type: $type, openday: $openday, endday: $endday, keywords: $keywords) {
      NAME
      SEX
      RESIDENCE
      JOB
      PTCPROGRAM
      PAST_STRESS_EXPERIENCE
      PV
      AGENCY
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      SCORE10
      SCORE11
      SCORE12
      SCORE13
      SCORE14
      SCORE15
      SCORE16
      SCORE17
      SCORE18
      SCORE19
      SCORE20
    }
  }
`;

const GET_HEALING_LIST = gql`
  query GetHealingList($agency: String, $agency_id: Int, $type: String!, $openday: String, $endday: String, $keywords: [KeywordInput]) {
    getHealingList(agency: $agency, agency_id: $agency_id, type: $type, openday: $openday, endday: $endday, keywords: $keywords) {
      NAME
      SEX
      RESIDENCE
      JOB
      PTCPROGRAM
      PAST_STRESS_EXPERIENCE
      PV
      AGENCY
      SCORE1
      SCORE2
      SCORE3
      SCORE4
      SCORE5
      SCORE6
      SCORE7
      SCORE8
      SCORE9
      SCORE10
      SCORE11
      SCORE12
      SCORE13
      SCORE14
      SCORE15
      SCORE16
      SCORE17
      SCORE18
      SCORE19
      SCORE20
      SCORE21
      SCORE22
    }
  }
`;

const typeItems = [
    {label: "선택", value: ""},
    {label: "인솔자", value: "인솔자"},
    {label: "참가자", value: "참가자"},
    {label: "미기재", value: "미기재"},
];

// 키워드 검색 필터 항목 정의
const keywordItems = [
  { value: "X", label: "해당없음" },
  { value: "SEX", label: "성별" },
  { value: "AGE", label: "연령(만)" },
  { value: "RESIDENCE", label: "거주지" },
  { value: "JOB", label: "직업" },
  { value: "OPENDAY", label: "시작일자" },
  { value: "PLACE", label: "장소" },
  { value: "TEACHER", label: "강사" },
  { value: "PROGRAM_NAME", label: "프로그램이름" },
  { value: "TYPE", label: "참여구분" },
  { value: "PV", label: "평가시점" },
];

// 키워드 항목별 옵션 정의
const keywordOptions = {
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
  ],
  PV: [
    { label: "사전", value: "사전" },
    { label: "사후", value: "사후" }
  ]
};

const AgencyList = () => {
    // State variables
    const [type, setType] = useState("");
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [openday, setOpenday] = useState("");
    const [endday, setEndday] = useState("");
    const [searchType, setSearchType] = useState("");
    const [programResult, setProgramResult] = useState([]);
    const [facilityList, setFacilityList] = useState([]);
    const [preventList, setPreventList] = useState([]);
    const [healingList, setHealingList] = useState([]);
    
    // 상세검색 관련 상태
    const [showDetailSearch, setShowDetailSearch] = useState(false);
    const [keywords, setKeywords] = useState([
        { type: "X", value: "" },
        { type: "X", value: "" },
        { type: "X", value: "" }
    ]);
    
    // Fetch reservation list for the agency dropdown
    const { loading: loadingAgencies, error: errorAgencies, data: agencyData } = useQuery(GET_PAGE5_RESERVATION_LIST, {
        fetchPolicy: 'network-only'
    });

    // Float 필드의 빈 문자열을 null로 변환하는 함수 추가
    const sanitizeFloat = (value) => {
        // 값이 없거나 빈 문자열이면 null 반환
        if (value === "" || value === undefined || value === null) {
            return null;
        }
        
        // 문자열이면 숫자로 변환 시도
        if (typeof value === 'string') {
            // 빈 공백 제거
            const trimmedValue = value.trim();
            if (trimmedValue === "") {
                return null;
            }
            
            // 숫자로 변환
            const parsed = parseFloat(trimmedValue);
            if (isNaN(parsed)) {
                return null;
            }
            return parsed;
        }
        
        // 이미 숫자면 그대로 반환
        if (typeof value === 'number') {
            return isNaN(value) ? null : value;
        }
        
        // 기타 타입은 null로 처리
        return null;
    };

    // 프로그램 결과 조회 쿼리 (Lazy Query)
    const [getProgramResult, { loading: loadingProgram, error: errorProgram }] = useLazyQuery(GET_PROGRAM_RESULT, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            console.log("프로그램 쿼리 결과:", data);
            if (data && data.getProgramResult) {
                // Process program result data
                setProgramResult(data.getProgramResult.map(i => {
                    // 빈 문자열을 null로 변환
                    const sanitizedItem = {
                        ...i,
                        SCORE1: sanitizeFloat(i.SCORE1),
                        SCORE2: sanitizeFloat(i.SCORE2),
                        SCORE3: sanitizeFloat(i.SCORE3),
                        SCORE4: sanitizeFloat(i.SCORE4),
                        SCORE5: sanitizeFloat(i.SCORE5),
                        SCORE6: sanitizeFloat(i.SCORE6),
                        SCORE7: sanitizeFloat(i.SCORE7),
                        SCORE8: sanitizeFloat(i.SCORE8),
                        SCORE9: sanitizeFloat(i.SCORE9)
                    };
                    
                    const sum1List = [sanitizedItem.SCORE1, sanitizedItem.SCORE2, sanitizedItem.SCORE3].filter(Boolean);
                    const sum2List = [sanitizedItem.SCORE4, sanitizedItem.SCORE5, sanitizedItem.SCORE6].filter(Boolean);
                    const sum3List = [sanitizedItem.SCORE7, sanitizedItem.SCORE8, sanitizedItem.SCORE9].filter(Boolean);
                
                    const sum1 = calculateAverage(sum1List);
                    const sum2 = calculateAverage(sum2List);
                    const sum3 = calculateAverage(sum3List);
                
                    return {
                        ...sanitizedItem,
                        sum1,
                        sum2,
                        sum3,
                    };
                }));

                // 데이터가 없을 경우 메시지 표시
                if (data.getProgramResult.length === 0) {
                    Swal.fire({
                        title: "확인", 
                        text: "조회된 데이터가 없습니다.",
                        icon: 'info',
                    });
                }
            }
        },
        onError: (error) => {
            console.error("프로그램 조회 오류:", error);
            Swal.fire({
                title: "오류",
                text: "데이터 조회 중 오류가 발생했습니다: " + error.message,
                icon: 'error',
            });
        }
    });

    // 시설 리스트 조회 쿼리 (Lazy Query)
    const [getFacilityList, { loading: loadingFacility, error: errorFacility }] = useLazyQuery(GET_FACILITY_LIST, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            console.log("시설 쿼리 결과:", data);
            if (data && data.getFacilityList) {
                // Process facility data
                setFacilityList(data.getFacilityList.map(i => {
                    // 빈 문자열을 null로 변환
                    const sanitizedItem = {
                        ...i,
                        SCORE1: sanitizeFloat(i.SCORE1),
                        SCORE2: sanitizeFloat(i.SCORE2),
                        SCORE3: sanitizeFloat(i.SCORE3),
                        SCORE4: sanitizeFloat(i.SCORE4),
                        SCORE5: sanitizeFloat(i.SCORE5),
                        SCORE6: sanitizeFloat(i.SCORE6),
                        SCORE7: sanitizeFloat(i.SCORE7),
                        SCORE8: sanitizeFloat(i.SCORE8),
                        SCORE9: sanitizeFloat(i.SCORE9),
                        SCORE10: sanitizeFloat(i.SCORE10),
                        SCORE11: sanitizeFloat(i.SCORE11),
                        SCORE12: sanitizeFloat(i.SCORE12),
                        SCORE13: sanitizeFloat(i.SCORE13),
                        SCORE14: sanitizeFloat(i.SCORE14),
                        SCORE15: sanitizeFloat(i.SCORE15),
                        SCORE16: sanitizeFloat(i.SCORE16),
                        SCORE17: sanitizeFloat(i.SCORE17),
                        SCORE18: sanitizeFloat(i.SCORE18)
                    };
                
                    const sum1List = [sanitizedItem.SCORE1, sanitizedItem.SCORE2].filter(Boolean);
                    const sum2List = [sanitizedItem.SCORE3, sanitizedItem.SCORE4].filter(Boolean);
                    const sum3List = [sanitizedItem.SCORE5, sanitizedItem.SCORE6, sanitizedItem.SCORE7].filter(Boolean);
                    const sum4List = [sanitizedItem.SCORE8, sanitizedItem.SCORE9, sanitizedItem.SCORE10].filter(Boolean);
                    const sum5List = [sanitizedItem.SCORE11, sanitizedItem.SCORE12, sanitizedItem.SCORE13].filter(Boolean);
                    const sum6List = [sanitizedItem.SCORE14, sanitizedItem.SCORE15, sanitizedItem.SCORE16].filter(Boolean);
                    const sum7List = [sanitizedItem.SCORE17, sanitizedItem.SCORE18].filter(Boolean);
                
                    const sum1 = calculateAverage(sum1List);
                    const sum2 = calculateAverage(sum2List);
                    const sum3 = calculateAverage(sum3List);
                    const sum4 = calculateAverage(sum4List);
                    const sum5 = calculateAverage(sum5List);
                    const sum6 = calculateAverage(sum6List);
                    const sum7 = calculateAverage(sum7List);
                
                    return { ...sanitizedItem, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
                }));

                // 데이터가 없을 경우 메시지 표시
                if (data.getFacilityList.length === 0) {
                    Swal.fire({
                        title: "확인", 
                        text: "조회된 데이터가 없습니다.",
                        icon: 'info',
                    });
                }
            }
        },
        onError: (error) => {
            console.error("시설 조회 오류:", error);
            Swal.fire({
                title: "오류",
                text: "데이터 조회 중 오류가 발생했습니다: " + error.message,
                icon: 'error',
            });
        }
    });

    // 예방 리스트 조회 쿼리 (Lazy Query)
    const [getPreventList, { loading: loadingPrevent, error: errorPrevent }] = useLazyQuery(GET_PREVENT_LIST, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            console.log("예방 쿼리 결과:", data);
            if (data && data.getPreventList) {
                // Process prevent data
                const originalData = data.getPreventList.map(i => ({
                    ...i,
                    SCORE1: sanitizeFloat(i.SCORE1),
                    SCORE2: sanitizeFloat(i.SCORE2),
                    SCORE3: sanitizeFloat(i.SCORE3),
                    SCORE4: sanitizeFloat(i.SCORE4),
                    SCORE5: sanitizeFloat(i.SCORE5),
                    SCORE6: sanitizeFloat(i.SCORE6),
                    SCORE7: sanitizeFloat(i.SCORE7),
                    SCORE8: sanitizeFloat(i.SCORE8),
                    SCORE9: sanitizeFloat(i.SCORE9),
                    SCORE10: sanitizeFloat(i.SCORE10),
                    SCORE11: sanitizeFloat(i.SCORE11),
                    SCORE12: sanitizeFloat(i.SCORE12),
                    SCORE13: sanitizeFloat(i.SCORE13),
                    SCORE14: sanitizeFloat(i.SCORE14),
                    SCORE15: sanitizeFloat(i.SCORE15),
                    SCORE16: sanitizeFloat(i.SCORE16),
                    SCORE17: sanitizeFloat(i.SCORE17),
                    SCORE18: sanitizeFloat(i.SCORE18),
                    SCORE19: sanitizeFloat(i.SCORE19),
                    SCORE20: sanitizeFloat(i.SCORE20)
                }));

                const sortedData = originalData.sort((a, b) => {
                    if (a.NAME < b.NAME) return -1;
                    if (a.NAME > b.NAME) return 1;
                    if (a.PV === '사전' && b.PV === '사후') return -1;
                    if (a.PV === '사후' && b.PV === '사전') return 1;
                    return 0;
                });
                
                // 모든 데이터를 표시 (매칭되지 않는 사전/사후 데이터도 포함)
                const filteredData = sortedData;
                
                setPreventList(filteredData.map(i => {
                    // 새로운 카테고리 구조에 맞는 합계 계산 (14개 문항)
                    const sum1List = [i.SCORE1, i.SCORE2, i.SCORE3].filter(Boolean); // 자가인식/도박인식 (3개)
                    const sum2List = [i.SCORE4, i.SCORE5, i.SCORE6].filter(Boolean); // 예방역량/도박예방역량 (3개)
                    const sum3List = [i.SCORE7, i.SCORE8, i.SCORE9, i.SCORE10].filter(Boolean); // 스트레스관리/자기통제력 (4개)
                    const sum4List = [i.SCORE11, i.SCORE12, i.SCORE13, i.SCORE14].filter(Boolean); // 중독위험인식/대인관계능력 (4개)
                    
                    const sum1 = calculateAverage(sum1List);
                    const sum2 = calculateAverage(sum2List);
                    const sum3 = calculateAverage(sum3List);
                    const sum4 = calculateAverage(sum4List);
                
                    return { ...i, sum1, sum2, sum3, sum4 };
                }));

                // 데이터가 없을 경우 메시지 표시
                if (data.getPreventList.length === 0) {
                    Swal.fire({
                        title: "확인", 
                        text: "조회된 데이터가 없습니다.",
                        icon: 'info',
                    });
                }
            }
        },
        onError: (error) => {
            console.error("예방 조회 오류:", error);
            Swal.fire({
                title: "오류",
                text: "데이터 조회 중 오류가 발생했습니다: " + error.message,
                icon: 'error',
            });
        }
    });

    // 힐링 리스트 조회 쿼리 (Lazy Query)
    const [getHealingList, { loading: loadingHealing, error: errorHealing }] = useLazyQuery(GET_HEALING_LIST, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            console.log("힐링 쿼리 결과:", data);
            if (data && data.getHealingList) {
                // Process healing data
                const originalData = data.getHealingList.map(i => ({
                    ...i,
                    SCORE1: sanitizeFloat(i.SCORE1),
                    SCORE2: sanitizeFloat(i.SCORE2),
                    SCORE3: sanitizeFloat(i.SCORE3),
                    SCORE4: sanitizeFloat(i.SCORE4),
                    SCORE5: sanitizeFloat(i.SCORE5),
                    SCORE6: sanitizeFloat(i.SCORE6),
                    SCORE7: sanitizeFloat(i.SCORE7),
                    SCORE8: sanitizeFloat(i.SCORE8),
                    SCORE9: sanitizeFloat(i.SCORE9),
                    SCORE10: sanitizeFloat(i.SCORE10),
                    SCORE11: sanitizeFloat(i.SCORE11),
                    SCORE12: sanitizeFloat(i.SCORE12),
                    SCORE13: sanitizeFloat(i.SCORE13),
                    SCORE14: sanitizeFloat(i.SCORE14),
                    SCORE15: sanitizeFloat(i.SCORE15),
                    SCORE16: sanitizeFloat(i.SCORE16),
                    SCORE17: sanitizeFloat(i.SCORE17),
                    SCORE18: sanitizeFloat(i.SCORE18),
                    SCORE19: sanitizeFloat(i.SCORE19),
                    SCORE20: sanitizeFloat(i.SCORE20),
                    SCORE21: sanitizeFloat(i.SCORE21),
                    SCORE22: sanitizeFloat(i.SCORE22)
                }));

                const sortedData = originalData.sort((a, b) => {
                    if (a.NAME < b.NAME) return -1;
                    if (a.NAME > b.NAME) return 1;
                    if (a.PV === '사전' && b.PV === '사후') return -1;
                    if (a.PV === '사후' && b.PV === '사전') return 1;
                    return 0;
                });
                
                // 모든 데이터를 표시 (매칭되지 않는 사전/사후 데이터도 포함)
                const filteredData = sortedData;
                
                setHealingList(filteredData.map(i => {
                    const sum1List = [i.SCORE1, i.SCORE2].filter(Boolean);
                    const sum2List = [i.SCORE3, i.SCORE4, i.SCORE5].filter(Boolean);
                    const sum3List = [i.SCORE6, i.SCORE7, i.SCORE8, i.SCORE9].filter(Boolean);
                    const sum4List = [i.SCORE10, i.SCORE11, i.SCORE12].filter(Boolean);
                    const sum5List = [i.SCORE13, i.SCORE14, i.SCORE15, i.SCORE16].filter(Boolean);
                    const sum6List = [i.SCORE17, i.SCORE18, i.SCORE19].filter(Boolean);
                    const sum7List = [i.SCORE20, i.SCORE21, i.SCORE22].filter(Boolean);
                
                    const sum1 = calculateAverage(sum1List);
                    const sum2 = calculateAverage(sum2List);
                    const sum3 = calculateAverage(sum3List);
                    const sum4 = calculateAverage(sum4List);
                    const sum5 = calculateAverage(sum5List);
                    const sum6 = calculateAverage(sum6List);
                    const sum7 = calculateAverage(sum7List);
                
                    return { ...i, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
                }));

                // 데이터가 없을 경우 메시지 표시
                if (data.getHealingList.length === 0) {
            Swal.fire({
                title: "확인",
                        text: "조회된 데이터가 없습니다.",
                        icon: 'info',
                    });
                }
            }
        },
        onError: (error) => {
            console.error("힐링 조회 오류:", error);
            Swal.fire({
                title: "오류",
                text: "데이터 조회 중 오류가 발생했습니다: " + error.message,
                icon: 'error',
            });
        }
    });

    // Function to calculate average
    const calculateAverage = (scores) => {
        // 유효한 점수가 없으면 "-" 반환
        if (!scores || scores.length === 0) {
            return "-";
        }
        
        // null, 빈 문자열, NaN 등 제외하고 숫자만 필터링
        const validScores = scores.filter(score => 
            score !== null && 
            score !== undefined && 
            score !== "" && 
            !isNaN(parseFloat(score))
        );
        
        // 유효한 점수가 없으면 "-" 반환
        if (validScores.length === 0) {
            return "-";
        }
        
        // 평균 계산
        const sum = validScores.reduce((total, score) => total + parseFloat(score), 0);
        const average = sum / validScores.length;
        
        if (isNaN(average)) {
            return "-";
        }
        
        // 소수점 형식 지정
        return average.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: average % 1 === 0 ? 1 : 2,
        });
    };

    const onAgencyChange = (event, newValue) => {
        setSelectedAgency(newValue);
    };

    const onSelectedChange = (e) => {
        setType(e.target.value);
        // Reset data when changing type
        setProgramResult([]);
        setFacilityList([]);
        setPreventList([]);
        setHealingList([]);
        setSelectedAgency(null);
    };

    // 키워드 변경 핸들러
    const handleKeywordTypeChange = (index, newType) => {
        // 해당 타입이 이미 다른 키워드에 선택되어 있는지 확인
        const existingIndex = keywords.findIndex(k => k.type === newType);
        
        // "X"(해당없음)이 아니고 이미 사용 중인 타입이면 경고
        if (newType !== "X" && existingIndex >= 0 && existingIndex !== index) {
            Swal.fire({
                title: "알림",
                text: `이미 선택된 주제어입니다. 다른 주제어를 선택해주세요.`,
                icon: "warning",
                timer: 2000
            });
            return;
        }
        
        // 문제 없으면 업데이트
        const updatedKeywords = [...keywords];
        updatedKeywords[index] = { type: newType, value: "" };
        setKeywords(updatedKeywords);
    };
    
    // 키워드 값 변경 핸들러
    const handleKeywordValueChange = (index, newValue) => {
        const updatedKeywords = [...keywords];
        updatedKeywords[index] = { ...updatedKeywords[index], value: newValue };
        setKeywords(updatedKeywords);
    };

    // 키워드 날짜 변경 핸들러
    const handleKeywordDateChange = (index, name, value) => {
        console.log("날짜 키워드 변경:", index, value);
        // 값이 없으면 처리하지 않음
        if (!value) return;
        
        // 날짜 형식 확인 (YYYY-MM-DD)
        let formattedDate = value;
        if (typeof value === 'object' && value instanceof Date) {
            // Date 객체인 경우 형식화
            formattedDate = value.toISOString().split('T')[0];
        }
        
        console.log("포맷된 날짜:", formattedDate);
        
        const updatedKeywords = [...keywords];
        updatedKeywords[index] = { ...updatedKeywords[index], value: formattedDate };
        setKeywords(updatedKeywords);
    };

    const onSearch = () => {
        const agencyName = selectedAgency ? selectedAgency.group_name : null;
        const agencyId = selectedAgency ? selectedAgency.id : null;

            if (!type) {
                Swal.fire({
                    icon: 'warning',
                title: '확인',
                text: "입력양식을 선택해 주십시오.",
                });
                return;
            }
            
        const activeKeywords = keywords.filter(k => k.type !== 'X' && k.value);

            if (type === "1") {
            // inType을 searchType으로 설정하여 참가자/인솔자 필터링
            getProgramResult({ variables: { agency: agencyName, agency_id: agencyId, type: searchType, openday, endday, inType: searchType, keywords: activeKeywords } });
        } else if (type === "2") {
            getFacilityList({ variables: { agency: agencyName, agency_id: agencyId, type: "시설", openday, endday, keywords: activeKeywords } });
        } else if (type === "4") {
            getPreventList({ variables: { agency: agencyName, agency_id: agencyId, type: "스마트폰", openday, endday, keywords: activeKeywords } });
        } else if (type === "5") {
            getHealingList({ variables: { agency: agencyName, agency_id: agencyId, type: "힐링", openday, endday, keywords: activeKeywords } });
        } else if (type === "6") {
            getPreventList({ variables: { agency: agencyName, agency_id: agencyId, type: "도박", openday, endday, keywords: activeKeywords } });
        }
    };

    const onReset = () => {
        setType("");
        setSelectedAgency(null);
        setOpenday("");
        setEndday("");
        setSearchType("");
        setProgramResult([]);
        setFacilityList([]);
        setPreventList([]);
        setHealingList([]);
        // 상세검색 필드 초기화
        setKeywords([
            { type: "X", value: "" },
            { type: "X", value: "" },
            { type: "X", value: "" }
        ]);
    };

    // 환경 정보 로깅을 위한 useEffect 추가
    useEffect(() => {
        console.log("======= 프로그램 결과 조회 컴포넌트 마운트 =======");
        console.log("브라우저:", navigator.userAgent);
        console.log("환경:", process.env.NODE_ENV);
        console.log("Apollo Client 사용중");
        
        // 마운트된 이후에 파라미터 확인
        if (type) {
            console.log("초기 type:", type);
        }
        
        return () => {
            console.log("프로그램 결과 조회 컴포넌트 언마운트");
        };
    }, []);

    return <>
        <MainCard>
            <Grid container spacing={2} alignItems="center">
                <Grid item container spacing={2} alignItems="center" md={12}>
                    <Grid item sm={3}><DatePicker label="시작일" name="openday" value={openday} onChange={(_, value) => setOpenday(value)} /></Grid>
                    <Grid item sm={3}><DatePicker label="종료일" name="endday" value={endday} onChange={(_, value) => setEndday(value)} /></Grid>
                    <Grid item sm={6}>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            onClick={() => setShowDetailSearch(!showDetailSearch)}
                            endIcon={showDetailSearch ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 0.75,
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
                        {showDetailSearch && keywords.some(k => k.type !== "X" && k.value) && (
                            <Button 
                                variant="text" 
                                color="secondary" 
                                onClick={() => {
                                    setKeywords([
                                        { type: "X", value: "" },
                                        { type: "X", value: "" },
                                        { type: "X", value: "" }
                                    ]);
                                }}
                                startIcon={<ClearIcon />}
                                sx={{ ml: 1 }}
                            >
                                필터 초기화
                            </Button>
                        )}
                    </Grid>
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
                                    <Grid item container spacing={2} key={index} sx={{ mb: 1 }}>
                                        <Grid item sm={2}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id={`keyword-type-label-${index}`}>주제어 {index + 1}</InputLabel>
                                                <Select
                                                    labelId={`keyword-type-label-${index}`}
                                                    value={keyword.type}
                                                    label={`주제어 ${index + 1}`}
                                                    onChange={(e) => handleKeywordTypeChange(index, e.target.value)}
                                                    MenuProps={{ 
                                                        PaperProps: { 
                                                            sx: { maxHeight: 300 } 
                                                        } 
                                                    }}
                                                >
                                                    {keywordItems.map((item) => (
                                                        <MenuItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item sm={4}>
                                            {keyword.type === "X" ? (
                                                <TextField
                                                    fullWidth
                                                    disabled
                                                    size="small"
                                                    label="값"
                                                    placeholder="주제어 항목을 먼저 선택하세요"
                                                />
                                            ) : keyword.type === "OPENDAY" ? (
                                                <DatePicker 
                                                    label="값" 
                                                    name="keyword_date"
                                                    value={keyword.value} 
                                                    onChange={(name, value) => handleKeywordDateChange(index, name, value)} 
                                                    fullWidth
                                                    size="small"
                                                />
                                            ) : ["SEX", "RESIDENCE", "JOB", "TYPE", "PV"].includes(keyword.type) ? (
                                                <FormControl fullWidth size="small">
                                                    <InputLabel id={`keyword-value-label-${index}`}>값</InputLabel>
                                                    <Select
                                                        labelId={`keyword-value-label-${index}`}
                                                        value={keyword.value}
                                                        label="값"
                                                        onChange={(e) => handleKeywordValueChange(index, e.target.value)}
                                                        MenuProps={{ 
                                                            PaperProps: { 
                                                                sx: { maxHeight: 300 } 
                                                            } 
                                                        }}
                                                    >
                                                        {keywordOptions[keyword.type].map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="값"
                                                    value={keyword.value || ""}
                                                    onChange={(e) => handleKeywordValueChange(index, e.target.value)}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Collapse>
                </Grid>
                
                {/* 활성화된 키워드 표시 */}
                {keywords.some(k => k.type !== "X" && k.value) && (
                    <Grid item xs={12}>
                        <Box sx={{ 
                            p: 1.5, 
                            mb: 2, 
                            display: 'flex', 
                            flexWrap: 'wrap',
                            gap: 1,
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            borderRadius: 2,
                            border: '1px solid rgba(25, 118, 210, 0.2)',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 'bold', color: 'primary.dark' }}>
                                활성화된 필터:
                            </Typography>
                            {keywords.filter(k => k.type !== "X" && k.value).map((k, idx) => {
                                const keywordLabel = keywordItems.find(item => item.value === k.type)?.label || k.type;
                                let valueLabel = k.value;
                                
                                // For special types, get the display label
                                if (["SEX", "RESIDENCE", "JOB", "TYPE", "PV"].includes(k.type) && keywordOptions[k.type]) {
                                    valueLabel = keywordOptions[k.type].find(opt => opt.value === k.value)?.label || k.value;
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
                
                <Grid item sm={3}>
                    <FormControl fullWidth size="small" style={{ height: 40 }}>
                        <InputLabel id="forms">입력양식</InputLabel>
                        <Select labelId="forms" value={type} label="입력양식" onChange={onSelectedChange}>
                            <MenuItem value="">선택하세요</MenuItem>
                            <MenuItem value="1">프로그램 만족도</MenuItem>
                            <MenuItem value="2">시설서비스환경 만족도</MenuItem>
                            {/* <MenuItem value="3">상담&치유서비스 효과평가</MenuItem> */}
                            <MenuItem value="4">예방효과(스마트폰)</MenuItem>
                            <MenuItem value="5">힐링서비스 효과평가</MenuItem>
                            <MenuItem value="6">예방효과(도박)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item sm={3}>       
                    {type !== "" && (
                        <Autocomplete
                            size="small"
                            value={selectedAgency}
                            onChange={onAgencyChange}
                            options={agencyData?.getPage1List || []}
                            getOptionLabel={(option) => option.group_name || ''}
                            loading={loadingAgencies}
                            disablePortal
                            id="combo-box-agency"
                            fullWidth
                            noOptionsText={"조회된 단체가 없습니다."}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="단체선택" 
                                    style={{height: "40px"}}
                                    error={!!errorAgencies}
                                    helperText={errorAgencies ? "데이터를 불러오는 중 오류가 발생했습니다." : ""}
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
                    )}
                </Grid>
                <Grid item sm={3}>
                    {type === "1" ? <SelectItems items={typeItems} label={"참여구분"} value={searchType} name={"name"} onChange={(e) => setSearchType(e.target.value)} /> : null}
                </Grid>
                <Grid item sm={3}>
                    <div style={{textAlign:"right"}}>
                        <Button 
                            variant="contained" 
                            size="small" 
                            color="primary" 
                            onClick={onReset} 
                            style={{marginRight: "10px"}} 
                        >
                            초기화
                        </Button>
                        <Button 
                            variant="contained" 
                            size="small" 
                            color="primary" 
                            onClick={onSearch}
                            disabled={loadingProgram || loadingFacility || loadingPrevent || loadingHealing}
                        >
                            {(loadingProgram || loadingFacility || loadingPrevent || loadingHealing) ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : "조회"}
                        </Button>
                        {keywords.some(k => k.type !== "X" && k.value) && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'primary.main' }}>
                                <b>{keywords.filter(k => k.type !== "X" && k.value).length}개</b>의 주제어 필터가 적용됨
                            </Typography>
                        )}
                    </div>
                    {(errorProgram || errorFacility || errorPrevent || errorHealing) && (
                        <div style={{color: "red", fontSize: "12px", marginTop: "5px"}}>
                            데이터 조회 중 오류가 발생했습니다. 콘솔을 확인해주세요.
                        </div>
                    )}
                </Grid>
            </Grid>
        </MainCard>
        <MainCard style={{marginTop: "10px"}}>
            {
                {
                    "1": <Program programResult={programResult} />,
                    "2": <Facility facilityList={facilityList} />,
                    // "3": <Facility/>,  //?
                    "4": <Prevent preventList={preventList} preventType="스마트폰" />,
                    "5": <Healing healingList={healingList} />,
                    "6": <Prevent preventList={preventList} preventType="도박" />
                }[type] || null
            }
        </MainCard>
    </>
};

export default AgencyList;