import React from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

import DynamicTableHead from "ui-component/DynamicTableHead";
import CounselTableRow from "./counselTableRow";
import SetValue from "../component/setValue";

const InsertForm = (props) => {
    const { 
        rows, 
        addRow, 
        removeRow, 
        onChange,
        onCheckChange,
        setAllData,
        getUserTemp
    } = props;

    const data = [ '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', '문항11', '문항12', '문항13', '문항14', '문항15', '문항16', '문항17', '문항18', '문항19', '문항20', '문항21', '문항22', '문항23', '문항24', '문항25', '문항26', '문항27', '문항28', '문항29', '문항30', '문항31', '문항32', '문항33', '문항34', '문항35', '문항36', '문항37', '문항38', '문항39', '문항40', '문항41', '문항42', '문항43', '문항44', '문항45', '문항46', '문항47', '문항48', '문항49', '문항50', '문항51', '문항52', '문항53', '문항54', '문항55', '문항56', '문항57', '문항58', '문항59', '문항60', '문항61', '문항62'].map((i, idx)=> ({ label : i, name : 'SCORE'+(idx+1), type : "eNumber"}))

    // 상담&치유서비스 효과평가 직업 목록 (예방효과와 통일)
    const counselJobOptions = [
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

    // 콘텐츠 종류 옵션
    const contentTypeOptions = [
        { label: "게임", value: "게임" },
        { label: "돈내기게임(도박)", value: "돈내기게임(도박)" },
        { label: "SNS", value: "SNS" },
        { label: "영상(유튜브, 아프리카TV 시청 등)", value: "영상(유튜브, 아프리카TV 시청 등)" },
        { label: "웹툰/소설", value: "웹툰/소설" },
        { label: "기타", value: "기타" },
    ];

    const fields = [ 
        { label: '이름', name: 'NAME'},
        { label: '성별', name: 'SEX', type:"select"},
        { label: '연령', name: 'AGE', type:"age"},
        { label: '거주지', name: 'RESIDENCE', type:"select"},
        { label: '직업', name: 'JOB', type:"select", options: counselJobOptions},
        { label: '콘텐츠 종류', name: 'CONTENT_TYPE', type:"select", options: contentTypeOptions},
        { label: '0-1. 선택한 콘텐츠를 한 번 사용 할 때 평균 명시간 정도 하시나요?', name: 'USAGE_HOURS', type:"eNumber"},
        { label: '0-2. 선택한 콘텐츠 이용을 위해 월 평균 얼마 정도의 돈을 쓰시나요?', name: 'MONTHLY_EXPENSE', type:"eNumber"},
        { label: '과거상담/치유서비스 경험', name: 'PAST_STRESS_EXPERIENCE', type : "eNumber"},
        ...data
    ];


    const headerInfo = [
        [ '선택','이름', '성별', '연령', '거주지', '직업', '콘텐츠 종류', '0-1. 선택한 콘텐츠를 한 번 사용 할 때 평균 명시간 정도 하시나요?', '0-2. 선택한 콘텐츠 이용을 위해 월 평균 얼마 정도의 돈을 쓰시나요?', '과거상담/치유서비스 경험', 
        '변화동기', '변화동기', '신뢰(라포)', '신뢰(라포)', '신뢰(라포)', '서비스이해', '서비스이해', '조절실패', '조절실패', '조절실패', '현저성', '현저성', '현저성', '문제적결과', '문제적결과', '문제적결과', '문제적결과', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '부정정서', '부정정서', '부정정서', '편향된신념', '편향된신념', '편향된신념', '역기능적자기도식', '역기능적자기도식', '역기능적자기도식', '역기능적자기도식', '역기능적자기도식', '역기능적자기도식', '대인관계기술부족', '대인관계기술부족', '대인관계기술부족', '대인민감성', '대인민감성', '대인민감성', '대인민감성', '관계/유능욕구충족', '관계/유능욕구충족', '긍정정서', '긍정정서', '긍정정서', '삶의만족', '삶의만족', '삶의만족', '자기이해', '자기이해', '자기이해', '자기이해', '자기수용', '자기수용', '자기수용', '마음관리기술/기회', '마음관리기술/기회', '마음관리기술/기회', '스마트폰활용역량', '스마트폰활용역량', ],
        [ '','', '', '', '', '', '', '', '', '',
        '문항1', '문항2', '문항3', '문항4', '문항5', '문항6', '문항7', '문항8', '문항9', '문항10', '문항11', '문항12', '문항13', '문항14', '문항15', '문항16', '문항17', '문항18', '문항19', '문항20', '문항21', '문항22', '문항23', '문항24', '문항25', '문항26', '문항27', '문항28', '문항29', '문항30', '문항31', '문항32', '문항33', '문항34', '문항35', '문항36', '문항37', '문항38', '문항39', '문항40', '문항41', '문항42', '문항43', '문항44', '문항45', '문항46', '문항47', '문항48', '문항49', '문항50', '문항51', '문항52', '문항53', '문항54', '문항55', '문항56', '문항57', '문항58', '문항59', '문항60', '문항61', '문항62',
        ],
    ]

    return <>   
            <SetValue onAdd={addRow} onRemove={removeRow} onSetData={setAllData} getUserTemp={getUserTemp}>  
                <span>※ 과거상담/치유 서비스경험 : [0 : 미기재, 1 : 무, 2:유]</span>
            </SetValue>

            <TableContainer style={{minHeight: "560px" , paddingBottom : "50px" }}>
                <Table className="insertForm custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <CounselTableRow rows={rows} fields={fields} onCheckChange={onCheckChange} onChange={onChange} id="idx" />
                </Table>
            </TableContainer>
    </>
}

export default InsertForm;