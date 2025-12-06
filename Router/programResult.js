const express = require('express');
const router = express.Router();
const maria = require("../maria");


// 사용자 등록
router.post('/getProgramAgency', (req, res)=>{
    const {type} = req.body;
    
    // 1 : 프로그램 만족도 Program
    // 2 : 시설서비스환경 만족도
    // 3 : 상담&치유서비스 효과평가
    // 4 : 예방서비스 효과평가
    // 5 : 힐링서비스 효과평가
    const sql = [
        'select distinct agency FROM program_satisfaction', // 프로그램 만족도 
        'select distinct agency FROM service_env_satisfaction',// 시설서비스환경 만족도
        'select distinct agency FROM counsel_service',// 상담&치유서비스
        'select distinct agency FROM prevent_service',// 예방서비스
        'select distinct agency FROM healing_service'// 힐링서비스
    ];

    const selectedSql = sql[type - 1];
    
    maria(selectedSql).then((rows) => {
        res.json(rows)
    })
    .catch((err) => res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " }));
});



// 만족도 / 효과평가 조회 
router.post('/getProgramResult', (req, res) => {
    const { type, agency, openday, endday, inType } = req.body;
    
    const conditions = [`AGENCY = ?`];
    const params = [agency];

    if (openday && endday) {
        conditions.push(`OPENDAY BETWEEN ? AND ?`);
        params.push(openday, endday);
    } else if (openday) {
        conditions.push(`OPENDAY >= ?`);
        params.push(openday);
    } else if (endday) {
        conditions.push(`OPENDAY <= ?`);
        params.push(endday);
    }else if (inType && type === "1") {
        conditions.push(`TYPE = ?`);
        params.push(inType);
    }

    const conditionString = conditions.join(' AND ');

    const sql = [
        `SELECT * FROM program_satisfaction WHERE ${conditionString}`,
        `SELECT * FROM service_env_satisfaction WHERE ${conditionString}`,
        `SELECT * FROM counsel_service WHERE ${conditionString}`,
        `SELECT * FROM prevent_service WHERE ${conditionString}`,
        `SELECT * FROM healing_service WHERE ${conditionString}`
    ];
    const selectedSql = sql[type - 1];
    
    maria(selectedSql, params)
        .then((rows) => {
            res.json(rows);
        })
        .catch((err) =>
            res
                .status(500)
                .json({ error: '오류가 발생하였습니다. 관리자에게 문의하세요 ' })
        );
});


// 만족도 / 효과평가 조회 
router.post('/getSearchResult', (req, res)=>{
    const {effect, keyword,  openday, endday} = req.body;
    
    
    let whereText = keyword.filter(obj => {
        const notInclude = effect !== "program" ? ['X','TEACHER', 'PROGRAM_NAME', 'BUNYA', 'PLACE'] :['X']
        return obj.text !== '' && !notInclude.includes(obj.type)
    }).map(obj => `AND ${obj.type} LIKE '${obj.text}'`).join(' ');     





    // 1 : 프로그램 만족도 Program
    // 2 : 시설서비스환경 만족도
    // 3 : 상담&치유서비스 효과평가
    // 4 : 예방서비스 효과평가
    // 5 : 힐링서비스 효과평가

    

    const sql = {
        program : `SELECT * FROM program_satisfaction WHERE 1=1     ${openday ? `AND OPENDAY BETWEEN ? AND ?` : ''}   `+whereText, // 프로그램 만족도 
        facility : `SELECT * FROM service_env_satisfaction WHERE 1=1   ${openday ? `AND OPENDAY BETWEEN ? AND ?` : ''}   `+ whereText,// 시설서비스환경만족도
        counseling : `SELECT * FROM counsel_service WHERE 1=1    ${openday ? `AND OPENDAY BETWEEN ? AND ?` : ''}  `+ whereText,// 상담치유
        prevent : `SELECT * FROM prevent_service WHERE 1=1    ${openday ? `AND OPENDAY BETWEEN ? AND ?` : ''}  `+ whereText, // 예방서비스
        healing : `SELECT * FROM healing_service WHERE 1=1    ${openday ? `AND OPENDAY BETWEEN ? AND ?` : ''}  `+ whereText // 힐링서비스
    };

    
    const params = openday ? [openday, endday] : []; // 조건에 따라 파라미터 설정
        maria(sql[effect], params).then((rows) => res.json(rows)).catch((err) => {
          
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});


router.post('/getPartTypeList', (req, res)=>{

    const { openday , endday, agency} = req.body;
    let sql = `
        SELECT 
            COUNT(case when AGE_TYPE ="아동청소년" then 1 end ) as count_kidboy,
            COUNT(case when AGE_TYPE ="청소년" then 1 end ) as count_boy,
            COUNT(case when AGE_TYPE ="성인" then 1 end ) as count_adult,
            COUNT(case when AGE_TYPE ="노인" then 1 end ) as count_old,
            IFNULL(SUM(case when AGE_TYPE ="아동청소년" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_kidboy,
            IFNULL(SUM(case when AGE_TYPE ="청소년" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_boy,
            IFNULL(SUM(case when AGE_TYPE ="성인" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_adult,
            IFNULL(SUM(case when AGE_TYPE ="노인" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_old,
            COUNT(case when PART_TYPE ="장애인" then 1 end ) as count_handicap,
            COUNT(case when PART_TYPE ="저소득" then 1 end ) as count_lowincome,
            COUNT(case when PART_TYPE ="가족" then 1 end ) as count_family,
            COUNT(case when PART_TYPE ="교직원" then 1 end ) as count_teacher,
            COUNT(case when PART_TYPE ="중독" then 1 end ) as count_addict,
            COUNT(case when PART_TYPE ="기타" then 1 end ) as count_etc,
            IFNULL(SUM(case when PART_TYPE ="장애인" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_handicap,
            IFNULL(SUM(case when PART_TYPE ="저소득" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_lowincome,
            IFNULL(SUM(case when PART_TYPE ="가족" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_family,
            IFNULL(SUM(case when PART_TYPE ="교직원" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_teacher,
            IFNULL(SUM(case when PART_TYPE ="중독" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_addict,
            IFNULL(SUM(case when PART_TYPE ="기타" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_etc,
            COUNT(case when INCOME_TYPE ="기타" then 1 end ) as count_income_etc,
            COUNT(case when INCOME_TYPE ="녹색자금" then 1 end ) as count_income_green,
            COUNT(case when INCOME_TYPE ="산림복지바우처" then 1 end ) as count_income_voucher,
            IFNULL(SUM(case when INCOME_TYPE ="기타" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_income_etc,
            IFNULL(SUM(case when INCOME_TYPE ="녹색자금" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_income_green,
            IFNULL(SUM(case when INCOME_TYPE ="산림복지바우처" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_income_voucher,
            COUNT(case when BIZ_PURPOSE ="수익사업" then 1 end ) as count_benefit,
            COUNT(case when BIZ_PURPOSE ="사회공헌" then 1 end ) as count_society,
            IFNULL(SUM(case when BIZ_PURPOSE ="수익사업" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_benefit,
            IFNULL(SUM(case when BIZ_PURPOSE ="사회공헌" then PART_MAN_CNT+PART_WOMAN_CNT+LEAD_MAN_CNT+LEAD_WOMAN_CNT else 0 end),0) as part_society
        FROM basic_info
        WHERE OPENDAY BETWEEN ? AND ? AND PROGRESS_STATE ="E" AND AGENCY = ? 
    `;

    maria(sql,[openday, endday, agency]).then((rows) => {
        res.json(rows)
    })
    .catch((err) => { console.log(err); 
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })});

});

// 지역별 통계
router.post('/getResidenceList', (req, res)=>{
    const { openday, endday, agency} = req.body;
    let sql = `
        SELECT 
            r.RESIDENCE,
            COUNT(b.RESIDENCE) AS count,
            COALESCE(SUM(b.PART_MAN_CNT + b.PART_WOMAN_CNT + b.LEAD_MAN_CNT + b.LEAD_WOMAN_CNT), 0) AS total
        FROM 
            (SELECT "서울" AS RESIDENCE UNION ALL
            SELECT "부산" UNION ALL
            SELECT "대구" UNION ALL
            SELECT "인천" UNION ALL
            SELECT "대전" UNION ALL
            SELECT "광주" UNION ALL
            SELECT "울산" UNION ALL
            SELECT "경기" UNION ALL
            SELECT "강원" UNION ALL
            SELECT "폐광지역" UNION ALL
            SELECT "충북" UNION ALL
            SELECT "충남" UNION ALL
            SELECT "세종" UNION ALL
            SELECT "경북" UNION ALL
            SELECT "경남" UNION ALL
            SELECT "전북" UNION ALL
            SELECT "전남" UNION ALL
            SELECT "제주") AS r
        LEFT JOIN 
            basic_info AS b ON b.RESIDENCE = r.RESIDENCE AND b.PROGRESS_STATE = "E"
        WHERE 
            1 = 1
            AND OPENDAY BETWEEN ? AND ?  AND AGENCY =?
        GROUP BY 
            r.RESIDENCE;
    `;
    maria(sql,[openday, endday, agency]).then((rows) => {  
        res.json(rows)
    })
    .catch((err) => {
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});

// 프로그램운영
router.post('/programManage', (req, res)=>{
    const { openday, endday, agency} = req.body;
    let sql = `
        SELECT 
            PROGRAM_IN_OUT as PROGRAM_IN_OUT2
        FROM 
            basic_info
        WHERE PROGRESS_STATE ="E"
            AND OPENDAY BETWEEN ? AND ? AND AGENCY =?
    `;

    let sql2 = `
            SELECT
                bunya,
                ROUND(sum(SCORE1+SCORE2+SCORE3)/(count(Case WHEN SCORE1 != 0 then 1 END)+count(CASE WHEN SCORE2 !=0 then 1 END)+count(Case WHen SCORE3 !=0 then 1 END)),2)as program,
                ROUND(sum(SCORE4+SCORE5+SCORE6)/(count(Case WHEN SCORE4 != 0 then 1 END)+count(CASE WHEN SCORE5 !=0 then 1 END)+count(Case WHen SCORE6 !=0 then 1 END)),2)as content,
                ROUND(sum(SCORE7+SCORE8+SCORE9)/(count(Case WHEN SCORE8 != 0 then 1 END)+count(CASE WHEN SCORE7 !=0 then 1 END)+count(CASE WHEN SCORE9 !=0 then 1 END)),2)as effect
			FROM program_satisfaction
            WHERE  OPENDAY BETWEEN ? AND ? AND AGENCY =?
			group by bunya
    `;

    Promise.all([
        maria(sql, [openday, endday, agency]),
        maria(sql2, [openday, endday, agency]),
    
    ])
    .then((results) => {
        let rows1 = results[0]; // the result from the first query
        let rows2 = results[1]; // the result from the second query
    
        res.json({
            manage: rows1,
            bunya : rows2,
            
        });
    })
    .catch((err) => {
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});



module.exports = router;