const headerInfo = [
    ['선택', '이름', '성별', '연령', '거주지', '직업', '과거 행위중독 예방 프로그램 경험 유무', '참여기간 유형',
        '자가인식',
        '자가인식',
        '자가인식',
        '예방역량',
        '예방역량',
        '예방역량',
        '스트레스관리',
        '스트레스관리',
        '스트레스관리',
        '스트레스관리',
        '중독위험인식',
        '중독위험인식',
        '중독위험인식',
        '중독위험인식',
    ],
    [ '','', '', '', '', '', '', '',
    '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', '문항11', '문항12', '문항13', '문항14'
    ],
];

const scoreFields = Array.from({length: 14}, (_, idx) => ({ 
    label: `문항${idx+1}`, 
    name: `SCORE${idx+1}`, 
    type: "eNumber" 
}));

// 예방효과(스마트폰) 직업 목록
const smartphoneJobOptions = [
    { label: "초등학생", value: "초등학생" },
    { label: "중학생", value: "중학생" },
    { label: "고등학생", value: "고등학생" },
    { label: "대학/대학원생", value: "대학/대학원생" },
    { label: "사무/전문직", value: "사무/전문직" },
    { label: "기술/생산/현장직", value: "기술/생산/현장직" },
    { label: "서비스/판매직", value: "서비스/판매직" },
    { label: "의료/보건/예술", value: "의료/보건/예술" },
    { label: "복지/상담직", value: "복지/상담직" },
    { label: "공공서비스/교육", value: "공공서비스/교육" },
    { label: "자영업/프리랜서", value: "자영업/프리랜서" },
    { label: "군인", value: "군인" },
    { label: "주부", value: "주부" },
    { label: "무직/취업준비생", value: "무직/취업준비생" },
    { label: "기타", value: "기타" },
];

// 참여기간 유형 옵션
const participationPeriodOptions = [
    { label: "당일형", value: "당일형" },
    { label: "1박 2일형", value: "1박 2일형" },
    { label: "2박 3일형", value: "2박 3일형" },
];

const fields = [ 
    { label: '이름', name: 'NAME'},
    { label: '성별', name: 'SEX', type: "select"},
    { label: '연령', name: 'AGE', type: "age"},
    { label: '거주지', name: 'RESIDENCE', type: "select"},
    { label: '직업', name: 'JOB', type: "select", options: smartphoneJobOptions},
    { label: '과거 행위중독 예방 프로그램 경험 유무', name: 'PAST_STRESS_EXPERIENCE', type: "number", placeholder: "무: 1, 유: 2"},
    { label: '참여기간 유형', name: 'PARTICIPATION_PERIOD', type: "select", options: participationPeriodOptions},
    ...scoreFields
];

export { headerInfo, fields }; 