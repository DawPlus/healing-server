const express = require('express');
const router = express.Router();
const maria = require("../maria");


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
            AND b.OPENDAY BETWEEN ? AND ?  AND b.AGENCY =?
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


//지원사항 , 서비스유형 
router.post('/getAllPrograms', (req, res)=>{
    const { openday, endday, agency} = req.body;
    let sql = `
    SELECT
        BIZ_PURPOSE,
        SUM(CASE WHEN FIND_IN_SET('프로그램', REPLACE(SUPPORT, ' ', '')) > 0 THEN 1 ELSE 0 END) AS count_program,
        SUM(CASE WHEN FIND_IN_SET('숙박', REPLACE(SUPPORT, ' ', '')) > 0 THEN 1 ELSE 0 END) AS count_accommodation,
        SUM(CASE WHEN FIND_IN_SET('식사', REPLACE(SUPPORT, ' ', '')) > 0 THEN 1 ELSE 0 END) AS count_meal,
        SUM(CASE WHEN FIND_IN_SET('기타', REPLACE(SUPPORT, ' ', '')) > 0 THEN 1 ELSE 0 END) AS count_etc,
        SUM(CASE WHEN SUPPORT = '해당없음' THEN 1 ELSE 0 END) AS count_none,
        COUNT(CASE WHEN SERVICE_TYPE = '산림교육' THEN 1 END) AS forest_edu,
        COUNT(CASE WHEN SERVICE_TYPE = '산림치유' THEN 1 END) AS forest_healing,
        COUNT(CASE WHEN SERVICE_TYPE = '행위중독치유' THEN 1 END) AS addict_healing,
        COUNT(CASE WHEN SERVICE_TYPE = '행위중독예방' THEN 1 END) AS addict_prevent,
        COUNT(CASE WHEN SERVICE_TYPE = '힐링' THEN 1 END) AS healing,
        COUNT(CASE WHEN SERVICE_TYPE = '기타' THEN 1 END) AS ser_etc
    FROM
        basic_info
    WHERE
        (BIZ_PURPOSE = '사회공헌' OR BIZ_PURPOSE = '수익사업') AND PROGRESS_STATE = 'E'

        AND OPENDAY BETWEEN ? AND ?
        AND AGENCY = ? 
    GROUP BY
        BIZ_PURPOSE;
    `;
    
    let sql2 = `
        SELECT
            BIZ_PURPOSE,
            SUM(CASE WHEN BIZ_PURPOSE = '수익사업' THEN PART_MAN_CNT ELSE 0 END) AS part_man,
            SUM(CASE WHEN BIZ_PURPOSE = '수익사업' THEN PART_WOMAN_CNT ELSE 0 END) AS part_woman,
            SUM(CASE WHEN BIZ_PURPOSE = '수익사업' THEN LEAD_MAN_CNT ELSE 0 END) AS lead_man,
            SUM(CASE WHEN BIZ_PURPOSE = '수익사업' THEN LEAD_WOMAN_CNT ELSE 0 END) AS lead_woman,
            SUM(CASE WHEN BIZ_PURPOSE = '사회공헌' THEN PART_MAN_CNT ELSE 0 END) AS soc_part_man,
            SUM(CASE WHEN BIZ_PURPOSE = '사회공헌' THEN PART_WOMAN_CNT ELSE 0 END) AS soc_part_woman,
            SUM(CASE WHEN BIZ_PURPOSE = '사회공헌' THEN LEAD_MAN_CNT ELSE 0 END) AS soc_lead_man,
            SUM(CASE WHEN BIZ_PURPOSE = '사회공헌' THEN LEAD_WOMAN_CNT ELSE 0 END) AS soc_lead_woman
        FROM
            basic_info
        WHERE
            BIZ_PURPOSE IN ('수익사업', '사회공헌') AND PROGRESS_STATE = 'E'
            AND OPENDAY BETWEEN ? AND ? 
            AND AGENCY = ?  
        GROUP BY
            BIZ_PURPOSE;
    `;

    let sql3 = `
        SELECT 
            SUM(ROOM_PART_PEOPLE) as room_part_people, SUM(ROOM_LEAD_PEOPLE) as room_lead_people, SUM(ROOM_ETC_PEOPLE) as room_etc_people,
            SUM(ROOM_PART_ROOM) as room_part_room, SUM(ROOM_LEAD_ROOM) as room_lead_room, SUM(ROOM_ETC_PEOPLE) as room_etc_room,
            SUM(MEAL_PART) as meal_part, SUM(MEAL_LEAD) as meal_lead, SUM(MEAL_ETC) as meal_etc
        FROM basic_info
        WHERE 
            1 = 1
            AND OPENDAY BETWEEN ? AND ?  
            AND AGENCY = ? 
            AND PROGRESS_STATE = "E"
    `;
    
    let sql4 = `
    SELECT BIZ_PURPOSE, 
        SUM((IFNULL(PART_MAN_CNT,0) + IFNULL(PART_WOMAN_CNT,0) + IFNULL(LEAD_MAN_CNT,0) + IFNULL(LEAD_WOMAN_CNT,0)) * IFNULL(DAYS_TO_STAY,0)) as grand_total
    FROM basic_info
    WHERE BIZ_PURPOSE IN ('수익사업', '사회공헌') AND PROGRESS_STATE = 'E'
        AND OPENDAY BETWEEN ? AND ?  
        AND AGENCY = ? 
    GROUP BY BIZ_PURPOSE;

    `

    Promise.all([
        maria(sql, [openday, endday, agency]),
        maria(sql2, [openday, endday, agency]),
        maria(sql3, [openday, endday, agency]),
        maria(sql4, [openday, endday, agency])
    ])
    .then((results) => {
        let rows1 = results[0]; // the result from the first query
        let rows2 = results[1]; // the result from the second query
        let rows3 = results[2]; // the result from the third query
        let rows4 = results[3]; // the result from the third query

        res.json({
            people: rows1,
            pTotal : rows4,
            service: rows2,
            room : rows3
        });
    })
    .catch((err) => {
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});


// 시설서비스 만족도
router.post('/getSerList', (req, res)=>{
    const { openday, endday, agency} = req.body;
    let sql = `
        SELECT 
            ifnull(ROUND(AVG(nullif(score1,0)),2),0) as score1,    ifnull(ROUND(AVG(nullif(score2,0)),2),0) as score2,   ifnull(ROUND(AVG(nullif(score3,0)),2),0) as score3,   ifnull(ROUND(AVG(nullif(score4,0)),2),0) as score4,   ifnull(ROUND(AVG(nullif(score5,0)),2),0) as score5,
            ifnull(ROUND(AVG(nullif(score6,0)),2),0) as score6,    ifnull(ROUND(AVG(nullif(score7,0)),2),0) as score7,   ifnull(ROUND(AVG(nullif(score8,0)),2),0) as score8,   ifnull(ROUND(AVG(nullif(score9,0)),2),0) as score9,   ifnull(ROUND(AVG(nullif(score10,0)),2),0) as score10,
            ifnull(ROUND(AVG(nullif(score11,0)),2),0) as score11,  ifnull(ROUND(AVG(nullif(score12,0)),2),0) as score12, ifnull(ROUND(AVG(nullif(score13,0)),2),0) as score13, ifnull(ROUND(AVG(nullif(score14,0)),2),0) as score14, ifnull(ROUND(AVG(nullif(score15,0)),2),0) as score15, 
            ifnull(ROUND(AVG(nullif(score16,0)),2),0) as score16
        FROM service_env_satisfaction
        WHERE OPENDAY BETWEEN ? AND ? AND AGENCY = ? 
    `;
    maria(sql,[openday, endday, agency]).then((rows) => {  
        res.json(rows)
    })
    .catch((err) => {
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});





//효과성 분석 
router.post('/getProgramEffect', (req, res)=>{
    const { openday, endday, agency} = req.body;
    
    let sql = `
        SELECT 
            PV,
            IFNULL(SUM(SCORE1 + SCORE2 + SCORE3 + SCORE4 + SCORE5 + SCORE6 + SCORE7 + SCORE8 + SCORE9 + SCORE10 +
                SCORE11 + SCORE12 + SCORE13 + SCORE14 + SCORE15 + SCORE16 + SCORE17 + SCORE18 + SCORE19 + SCORE20 +
                SCORE21 + SCORE22), 0) AS TotalSum,
            IFNULL(ROUND(AVG((SCORE1 + SCORE2 + SCORE3 + SCORE4 + SCORE5 + SCORE6 + SCORE7 + SCORE8 + SCORE9 + SCORE10 +
                SCORE11 + SCORE12 + SCORE13 + SCORE14 + SCORE15 + SCORE16 + SCORE17 + SCORE18 + SCORE19 + SCORE20 +
                SCORE21 + SCORE22) / 22), 2), 0) AS AverageScore
        FROM 
            healing_service
        WHERE PV IN ('사전', '사후')
            AND OPENDAY BETWEEN ? AND ? AND AGENCY = ? 
        GROUP BY PV;
    `;
    
    let sql2 = `
        SELECT 
            '사전' as PV,
            IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
            SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18+
            SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27+
            SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37+
            SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47+
            SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57+
            SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62),0) as sum,

            IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
            SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18+
            SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27+
            SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37+
            SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47+
            SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57+
            SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62)/62,2),0) as avg
        FROM counsel_service
        WHERE PV = '사전'
            AND OPENDAY BETWEEN ? AND ? AND AGENCY = ? 

        UNION ALL

        SELECT 
            '사후' as PV,
            IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
            SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18+
            SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27+
            SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37+
            SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47+
            SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57+
            SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62),0) as sum,

            IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
            SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18+
            SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27+
            SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37+
            SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47+
            SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57+
            SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62)/62,2),0) as avg
        FROM counsel_service
        WHERE PV = '사후'
        AND OPENDAY BETWEEN ? AND ? AND AGENCY = ? 
    `;

    let sql3 = `
        select PV,  IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
            SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18),0) as sum,
        IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18)/18,2),0) as avg 
        FROM prevent_service
        WHERE PV IN ("사전", "사후")
        AND OPENDAY BETWEEN ? AND ? AND AGENCY = ? 
        GROUP BY PV
    `;
    let sql4 = `
            SELECT 
                '사전' as PV, 
                IFNULL(ROUND(AVG(nullif(num1,0)),2),0) as num1, 
                IFNULL(ROUND(AVG(nullif(num2,0)),2),0) as num2,
                IFNULL(ROUND(AVG(nullif(num3,0)),2),0) as num3, 
                IFNULL(ROUND(AVG(nullif(num4,0)),2),0) as num4, 
                IFNULL(ROUND(AVG(nullif(num5,0)),2),0) as num5
            FROM hrv_service
            WHERE DATE BETWEEN ? AND ? AND PV = '사전' AND AGENCY = ? 

            UNION ALL

            SELECT 
                '사후' as PV, 
                IFNULL(ROUND(AVG(nullif(num1,0)),2),0) as num1, 
                IFNULL(ROUND(AVG(nullif(num2,0)),2),0) as num2,
                IFNULL(ROUND(AVG(nullif(num3,0)),2),0) as num3, 
                IFNULL(ROUND(AVG(nullif(num4,0)),2),0) as num4, 
                IFNULL(ROUND(AVG(nullif(num5,0)),2),0) as num5
            FROM hrv_service
            WHERE DATE BETWEEN ? AND ? AND PV = '사후' AND AGENCY = ? 

    `;

    Promise.all([
        maria(sql, [openday, endday, agency]),
        maria(sql2, [openday, endday, agency, openday, endday, agency]),
        maria(sql3, [openday, endday, agency]),
        maria(sql4, [openday, endday, agency,openday, endday, agency]),
    ])
    .then((results) => {
        let rows1 = results[0]; // the result from the first query
        let rows2 = results[1]; // the result from the second query
        let rows3 = results[2]; // the result from the third query
        let rows4 = results[3]; // the result from the third query

        res.json({
            healing: rows1,
            counsel : rows2,
            prevent: rows3,
            hrv : rows4
        });
    })
    .catch((err) => {
        console.log(err)
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});





//수입 지출 분석 
router.post('/getExIncomeList', (req, res)=>{
    const { openday, endday, agency} = req.body;
    
    let sql = `
    SELECT ic.expense_type as type, group_concat(expense_price) as price1 
		
		FROM dbstatistics.expense ic
		LEFT join dbstatistics.basic_info bi
		on (ic.BASIC_INFO_SEQ =bi.BASIC_INFO_SEQ)
    WHERE bi.OPENDAY BETWEEN ? AND ?
        AND bi.AGENCY = ?
		group by ic.expense_type
		order by type asc;
    `;
    
    let sql2 = `
        SELECT ic.INCOME_TYPE as type,group_concat(INCOME_PRICE) as price1
        FROM dbstatistics.income ic
        LEFT join dbstatistics.basic_info bi
        on (ic.BASIC_INFO_SEQ =bi.BASIC_INFO_SEQ)
        WHERE bi.OPENDAY BETWEEN ? AND ?
        AND bi.AGENCY = ?
        group by ic.INCOME_TYPE
        order by type asc;
    `;
    
    let sql3 = `
        select res.income_type, Round(sum(res.sum),0) as sum
        from (SELECT ic.income_type as income_type, (sum(ic.income_price) * 
        (100 - (select income_price from income where basic_info_seq = b.BASIC_INFO_SEQ and income_type = "할인율" group by BASIC_INFO_SEQ) ) / 100)  as sum
        FROM income ic, (select basic_info_seq from basic_info where openday between ? and ? and progress_state = "E" AND AGENCY = ? group by basic_info_seq) b
        where ic.basic_info_seq = b.basic_info_seq
        
        group by ic.income_type, b.basic_info_seq) res
        where res.income_type != "할인율"
        group by res.income_type;
    `;

    Promise.all([
        maria(sql, [openday, endday, agency]),
        maria(sql2, [openday, endday, agency]),
        maria(sql3, [openday, endday, agency]),

    ])
    .then((results) => {
        let rows1 = results[0]; // the result from the first query
        let rows2 = results[1]; // the result from the second query
        let rows3 = results[2]; // the result from the second query

        res.json({
            expend: rows1,
            income : rows2,
            incomeTotal : rows3,

        });
    })
    .catch((err) => {
        console.log(err)
        res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    });
});

module.exports = router;