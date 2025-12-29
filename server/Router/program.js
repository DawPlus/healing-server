const express = require("express");
const router = express.Router();
const maria = require("../maria");

// 프로그램 리스트 조회
router.post("/getProgramList", (req, res) => {
  const { openDay, endDay } = req.body;
  let sql = `SELECT * FROM basic_info WHERE PROGRESS_STATE = "E"`;

  if (openDay && endDay) {
    sql += ` AND OPENDAY BETWEEN '${openDay}' AND '${endDay}'`;
  }

  sql += ` ORDER BY OPENDAY DESC`;

  maria(sql)
    .then((rows) => {
      res.json(rows);
    })
    .catch((err) =>
      res
        .status(500)
        .json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
    );
});

// 상세
router.post("/getProgramListDetail", (req, res) => {
  const { seq, agency, openday } = req.body;

  const sql = `SELECT * FROM basic_info WHERE PROGRESS_STATE ="E" and BASIC_INFO_SEQ = ?`;

  const sql2 = `SELECT 
                            IFNULL(ROUND(AVG(score1), 2), 0) as score1,
                            IFNULL(ROUND(AVG(score2), 2), 0) as score2,
                            IFNULL(ROUND(AVG(score3), 2), 0) as score3,
                            IFNULL(ROUND(AVG(score4), 2), 0) as score4,
                            IFNULL(ROUND(AVG(score5), 2), 0) as score5,
                            IFNULL(ROUND(AVG(score6), 2), 0) as score6,
                            IFNULL(ROUND(AVG(score7), 2), 0) as score7,
                            IFNULL(ROUND(AVG(score8), 2), 0) as score8,
                            IFNULL(ROUND(AVG(score9), 2), 0) as score9,
                            IFNULL(ROUND(AVG(score10), 2), 0) as score10,
                            IFNULL(ROUND(AVG(score11), 2), 0) as score11,
                            IFNULL(ROUND(AVG(score12), 2), 0) as score12,
                            IFNULL(ROUND(AVG(score13), 2), 0) as score13,
                            IFNULL(ROUND(AVG(score14), 2), 0) as score14,
                            IFNULL(ROUND(AVG(score15), 2), 0) as score15,
                            IFNULL(ROUND(AVG(score16), 2), 0) as score16,
                            IFNULL(ROUND(AVG(score17), 2), 0) as score17,
                            IFNULL(ROUND(AVG(score18), 2), 0) as score18
                        FROM service_env_satisfaction
                        WHERE AGENCY = ? AND OPENDAY = ?`;

  const sql3 = `SELECT ps.PROGRAM_NAME, ps.TEACHER, ps.BUNYA, ps.type, 
                    IFNULL(ROUND(AVG(nullif(ps.score1, 0)), 2), 0) as score1,
                    IFNULL(ROUND(AVG(nullif(ps.score2, 0)), 2), 0) as score2,
                    IFNULL(ROUND(AVG(nullif(ps.score3, 0)), 2), 0) as score3,
                    IFNULL(ROUND(AVG(nullif(ps.score4, 0)), 2), 0) as score4,
                    IFNULL(ROUND(AVG(nullif(ps.score5, 0)), 2), 0) as score5,
                    IFNULL(ROUND(AVG(nullif(ps.score6, 0)), 2), 0) as score6,
                    IFNULL(ROUND(AVG(nullif(ps.score7, 0)), 2), 0) as score7,
                    IFNULL(ROUND(AVG(nullif(ps.score8, 0)), 2), 0) as score8,
                    IFNULL(ROUND(AVG(nullif(ps.score9, 0)), 2), 0) as score9,
                    COUNT(*) AS cnt
                FROM program_satisfaction ps
                LEFT JOIN dbstatistics.basic_info bi ON ps.OPENDAY = bi.OPENDAY AND ps.AGENCY = bi.AGENCY
                WHERE 1=1 
                    AND ps.AGENCY = ?
                    AND ps.OPENDAY = ?  
                    AND (ps.TYPE = "참여자" OR ps.TYPE = "인솔자")
                GROUP BY ps.PROGRAM_NAME, ps.TEACHER, ps.BUNYA, ps.TYPE
                ORDER BY ps.PROGRAM_NAME, ps.TEACHER, ps.BUNYA,
                    CASE WHEN ps.TYPE = '참여자' THEN 0 ELSE 1 END;
                `;
  const sql4 = `
        SELECT 
            PROGRAM_NAME,
            TEACHER,
            BUNYA,
            TYPE,
            OPENDAY,
            AGENCY,
            COUNT(*) AS count
        FROM dbstatistics.program_satisfaction
        WHERE AGENCY = ? AND OPENDAY = ?
        GROUP BY PROGRAM_NAME, TEACHER, BUNYA, TYPE, OPENDAY, AGENCY;
    `;

  Promise.all([
    maria(sql, [seq]),
    maria(sql2, [agency, openday]),
    maria(sql3, [agency, openday]),
    maria(sql4, [agency, openday]),
  ])
    .then((results) => {
      let rows1 = results[0]; // the result from the first query
      let rows2 = results[1]; // the result from the second query
      let rows3 = results[2]; // the result from the second query
      let rows4 = results[3]; // the result from the second query

      const resultArray = rows3.map((item1) => {
        const matchingItem = rows4.find(
          (item2) =>
            item1.PROGRAM_NAME === item2.PROGRAM_NAME &&
            item1.TEACHER === item2.TEACHER &&
            item1.BUNYA === item2.BUNYA &&
            item1.type === item2.TYPE
        );

        return matchingItem ? { ...item1, cnt: matchingItem.count } : item1;
      });

      res.json({
        basicInfo: rows1[0],
        serviceList: rows2,
        programSaf: resultArray,
        rows4,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " });
    });
});

// 상세
router.post("/getProgramListDetailEffect", (req, res) => {
  const { agency, openday } = req.body;
  // 프로그램 효과
  const sql1 = `SELECT 
                    '사전' AS type,
                    IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+SCORE19+SCORE20), 0) AS sum1,
                    IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                    SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+SCORE19+SCORE20)/20, 2), 0) AS avg1
                FROM prevent_service 
                WHERE AGENCY = ? AND OPENDAY = ? AND AGE != 0 and PV= "사전"

                UNION

                SELECT 
                    '사후' AS type,
                    IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+SCORE19+SCORE20), 0) AS sum2,
                    IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                    SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+SCORE19+SCORE20)/20, 2), 0) AS avg2
                FROM prevent_service
                WHERE AGENCY = ? AND OPENDAY = ? AND AGE != 0 and PV= "사후"
                `;
  const sql2 = `SELECT
                    '사전' AS pv,
                    IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18
                        + SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27
                        + SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37
                        + SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47
                        + SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57
                        + SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62),0) AS sum1,
                    IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18
                        + SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27
                        + SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37
                        + SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47
                        + SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57
                        + SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62)/62,2),0) AS avg1 
                FROM counsel_service

                        WHERE AGENCY = ? AND OPENDAY = ? AND PV ="사전" AND AGE !=0

                UNION ALL

                SELECT
                    '사후' AS pv,
                    IFNULL(SUM(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18
                        + SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27
                        + SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37
                        + SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47
                        + SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57
                        + SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62),0) AS sum2,
                    IFNULL(ROUND(AVG(SCORE1+ SCORE2+ SCORE3+ SCORE4+ SCORE5+ SCORE6+ SCORE7+ SCORE8+ SCORE9+ SCORE10+
                        SCORE11+ SCORE12+ SCORE13+ SCORE14+ SCORE15+ SCORE16+ SCORE17+ SCORE18+ SCORE18
                        + SCORE19+ SCORE20+ SCORE21+ SCORE22+ SCORE23+ SCORE24+ SCORE25+ SCORE26+ SCORE27
                        + SCORE28+ SCORE29+ SCORE30+ SCORE31+ SCORE32+ SCORE33+ SCORE34+ SCORE35+ SCORE36+ SCORE37
                        + SCORE38+ SCORE39+ SCORE40+ SCORE41+ SCORE42+ SCORE43+ SCORE44+ SCORE45+ SCORE46+ SCORE47
                        + SCORE48+ SCORE49+ SCORE50+ SCORE51+ SCORE52+ SCORE53+ SCORE54+ SCORE55+ SCORE56+ SCORE57
                        + SCORE58+ SCORE59+ SCORE60+ SCORE61+ SCORE62)/62,2),0) AS avg2 
                FROM counsel_service
                WHERE AGENCY = ? AND OPENDAY = ? AND PV ="사후" AND AGE !=0
                `;
  const sql3 = `
                SELECT 
                    '사전' AS pv,
                    IFNULL(SUM(SCORE1 + SCORE2 + SCORE3 + SCORE4 + SCORE5 + SCORE6 + SCORE7 + SCORE8 + SCORE9 + SCORE10 +
                        SCORE11 + SCORE12 + SCORE13 + SCORE14 + SCORE15 + SCORE16 + SCORE17 + SCORE18 + SCORE19 + SCORE20 +
                        SCORE21 + SCORE22), 0) AS sum1,
                    IFNULL(ROUND(AVG(SCORE1 + SCORE2 + SCORE3 + SCORE4 + SCORE5 + SCORE6 + SCORE7 + SCORE8 + SCORE9 + SCORE10 +
                        SCORE11 + SCORE12 + SCORE13 + SCORE14 + SCORE15 + SCORE16 + SCORE17 + SCORE18 + SCORE19 + SCORE20 +
                        SCORE21 + SCORE22) / 22, 2), 0) AS avg1
                FROM healing_service
                WHERE AGENCY = ? AND OPENDAY = ? AND PV = "사전" AND AGE != 0

            UNION ALL

                SELECT 
                    '사후' AS pv,
                    IFNULL(SUM(SCORE1 + SCORE2 + SCORE3 + SCORE4 + SCORE5 + SCORE6 + SCORE7 + SCORE8 + SCORE9 + SCORE10 +
                        SCORE11 + SCORE12 + SCORE13 + SCORE14 + SCORE15 + SCORE16 + SCORE17 + SCORE18 + SCORE19 + SCORE20 +
                        SCORE21 + SCORE22), 0) AS sum2,
                    IFNULL(ROUND(AVG(SCORE1 + SCORE2 + SCORE3 + SCORE4 + SCORE5 + SCORE6 + SCORE7 + SCORE8 + SCORE9 + SCORE10 +
                        SCORE11 + SCORE12 + SCORE13 + SCORE14 + SCORE15 + SCORE16 + SCORE17 + SCORE18 + SCORE19 + SCORE20 +
                        SCORE21 + SCORE22) / 22, 2), 0) AS avg2
                FROM healing_service
                WHERE AGENCY = ? AND OPENDAY = ? AND PV = "사후" AND AGE != 0;
                `;
  const sql4 = `
                SELECT
                    '사전' AS pv,
                    IFNULL(ROUND(AVG(nullif(num1,0)),2),0) as num1,
                    IFNULL(ROUND(AVG(nullif(num2,0)),2),0) as num2,
                    IFNULL(ROUND(AVG(nullif(num3,0)),2),0) as num3,
                    IFNULL(ROUND(AVG(nullif(num4,0)),2),0) as num4,
                    IFNULL(ROUND(AVG(nullif(num5,0)),2),0) as num5
                FROM hrv_service
                WHERE AGENCY = ? AND DATE = ? AND PV = "사전"

                UNION ALL

                SELECT
                    '사후' AS pv,
                    IFNULL(ROUND(AVG(nullif(num1,0)),2),0) as num1,
                    IFNULL(ROUND(AVG(nullif(num2,0)),2),0) as num2,
                    IFNULL(ROUND(AVG(nullif(num3,0)),2),0) as num3,
                    IFNULL(ROUND(AVG(nullif(num4,0)),2),0) as num4,
                    IFNULL(ROUND(AVG(nullif(num5,0)),2),0) as num5
                FROM hrv_service
                WHERE AGENCY = ? AND DATE = ? AND PV = "사후";

                `;

  Promise.all([
    maria(sql1, [agency, openday, agency, openday]),
    maria(sql2, [agency, openday, agency, openday]),
    maria(sql3, [agency, openday, agency, openday]),
    maria(sql4, [agency, openday, agency, openday]),
  ])
    .then((results) => {
      let rows1 = results[0]; // the result from the first query
      let rows2 = results[1]; // the result from the second query
      let rows3 = results[2]; // the result from the second query
      let rows4 = results[3]; // the result from the second query

      res.json({
        prevent: rows1,
        counsel: rows2,
        healing: rows3,
        hrv: rows4,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " });
    });
});

// 투두 수입금액 지출금액
router.post("/getProgramListDetailInEx", (req, res) => {
  const { seq } = req.body;
  // 프로그램 효과

  const sql1 = `select * from income where BASIC_INFO_SEQ = ?`;
  const sql2 = `select * from expense where BASIC_INFO_SEQ = ?`;

  Promise.all([maria(sql1, [seq]), maria(sql2, [seq])])
    .then((results) => {
      let rows1 = results[0]; // the result from the first query
      let rows2 = results[1]; // the result from the second query

      res.json({
        income: rows1,
        expense: rows2,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " });
    });
});

module.exports = router;
