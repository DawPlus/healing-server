import { v4 as uuidv4 } from 'uuid';

// Initial row data for prevent form
export const initRowData = {
  idx: "",
  id: "",
  chk: false,
  prevent_seq: "",
  sex: "미기재", // 성별
  age: "", // 연령
  residence: "미기재", // 거주지
  job: "",
  past_experience: "", // 과거 예방서비스 경험
  score1: "",
  score2: "",
  score3: "",
  score4: "",
  score5: "",
  score6: "",
  score7: "",
  score8: "",
  score9: "",
  score10: "",
  score11: "",
  score12: "",
  score13: "",
  score14: ""
};

// Options for selects
export const sexOptions = ["미기재", "남", "여"];
export const residenceOptions = ["미기재", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
export const jobOptions = ["미기재", "초등학생", "중학생", "고등학생", "대학/대학원생", "사무/전문직", "기술/생산/현장직", "서비스/판매직", "의료/보건/예술", "복지/상담직", "공공서비스/교육", "자영업/프리랜서", "군인", "주부", "무직/취업준비생", "기타"];
export const pastExperienceOptions = ["미기재", "없음", "있음"];

// Header information for the table
export const headerInfo = [
  [
    '선택', '성별', '연령', '거주지', '직업', '과거 예방서비스 경험',
    '중독특징이해', '중독특징이해', '핵심증상이해', '핵심증상이해', '중독특징이해',
    '문제대응방법이해', '문제대응방법이해', '활용역량', '활용역량', '활용역량',
    '심리적면역력강화법', '심리적면역력강화법', '삶의질', '삶의질'
  ],
  [
    '', '', '', '', '', '',
    '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10',
    '문항11', '문항12', '문항13', '문항14'
  ]
];

// Process Excel data for prevent form
export const processExcelData = (excelData) => {
  if (!excelData || excelData.length === 0) {
    return [];
  }
  
  return excelData.map((row, idx) => ({
    idx: uuidv4(),
    chk: false,
    prevent_seq: idx + 1,
    sex: row.col1 || "미기재",
    age: row.col2 || "",
    residence: row.col3 || "미기재",
    job: row.col4 || "",
    past_experience: row.col5 || "",
    score1: row.col6 || "",
    score2: row.col7 || "",
    score3: row.col8 || "",
    score4: row.col9 || "",
    score5: row.col10 || "",
    score6: row.col11 || "",
    score7: row.col12 || "",
    score8: row.col13 || "",
    score9: row.col14 || "",
    score10: row.col15 || "",
    score11: row.col16 || "",
    score12: row.col17 || "",
    score13: row.col18 || "",
    score14: row.col19 || ""
  }));
}; 