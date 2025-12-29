import React from "react";
import {PrintSection } from "ui-component/printButton"
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

import DefaultInfo from "./defaultInfo"
import ProgramOperate from "./programOperate"
import Facility from "./facility"
import Satisfaction from "./satisfaction"
import Effect from "./effect"
import Remark from "./remark"
import Expense from "./expense"
import Income from "./income"
import ExpenseDetailed from "./expenseDetailed"
import IncomeDetailed from "./incomeDetailed"

// 보고서 컴포넌트 - 상세 정보와 선택된 항목 정보를 props로 받음
const ReportContainer = ({ programDetailData, selectedDetail }) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    
    // URL에 detailed=true가 있는지 확인
    const isDetailedMode = searchParams.get('detailed') === 'true';
    
    // 재료비, 기타비, 예비비 관련 데이터만 로그 출력
    if (isDetailedMode && programDetailData?.getProgramDetail?.inExpense?.expense) {
        const relevantExpenseData = programDetailData.getProgramDetail.inExpense.expense.filter(item => 
            item.ITEM.includes('재료비') || item.ITEM.includes('기타비') || item.ITEM.includes('예비비')
        );
        if (relevantExpenseData.length > 0) {
            console.log('[재료/기타/예비비] 상세 모드 데이터:', relevantExpenseData);
        }
    }

    // 출력 기능
    const onPrint = () => {
        window.print();
    }

    // programDetailData가 없으면 로딩 상태 표시
    if (!programDetailData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>보고서 데이터를 불러오는 중...</Typography>
            </Box>
        );
    }

    // 보고서 기본 정보 가져오기
    const AGENCY = selectedDetail?.AGENCY || "";
    const OM = selectedDetail?.OM || "";
    
    // 보고서 데이터 준비
    const reportData = programDetailData?.getProgramDetail || {
        basicInfo: {},
        serviceList: [],
        programSatisfaction: [],
        programSaf: [],
        effect: {
            counsel: [],
            healing: [],
            hrv: [],
            prevent: []
        },
        inExpense: {
            income: [],
            expense: []
        },
        complaint: ""
    };



    return (
        <>
            <div style={{textAlign : "right", marginBottom : "5px"}}>
                <Button variant="contained" color="primary" onClick={onPrint}><PrintIcon /></Button>
            </div>
            <PrintSection>
                <div style={{textAlign :"right" , marginBottom : "15px"}}></div>
                <div style={{textAlign:"center", margin: "60px 0px 30px 0px"}}>
                    <h1>하이힐링원 프로그램 실시 결과 보고</h1>
                </div>
                <div style={{textAlign: "right", fontSize: "12px"}}>
                    <span style={{marginRight :"40px"}}>{`단체명: ${AGENCY}`}</span> 
                    <span>{`OM: ${OM}`}</span> 
                </div>
                
                {/* 프로그램시행개요 */}
                <DefaultInfo data={reportData.basicInfo} />
                
                {/* 프로그램운영 */}
                <ProgramOperate data={reportData} />
                
                {/*시설서비스 만족도  */}
                <Facility data={reportData} />
                
                {/* 프로그램만족도 */}
                <Satisfaction data={reportData} />
                
                {/* 프로그램효과 */}
                <Effect data={reportData.effect} />
                
                {/* 소감 및 민원사항 */}
                <Remark data={reportData.basicInfo} complaint={reportData.complaint} />
                
                {/* 지출금액 */}
                {isDetailedMode ? (
                    <ExpenseDetailed 
                        data={reportData.inExpense?.expense} 
                        basicInfo={reportData.basicInfo} 
                        page4Data={reportData.page4Data}
                    />
                ) : (
                    <Expense data={reportData.inExpense?.expense} basicInfo={reportData.basicInfo} />
                )}
                
                {/* 수입금액 */}
                {isDetailedMode ? (
                    <IncomeDetailed data={reportData.inExpense?.income} />
                ) : (
                    <Income data={reportData.inExpense?.income} />
                )}
            </PrintSection>
        </>
    );
}

export default ReportContainer;