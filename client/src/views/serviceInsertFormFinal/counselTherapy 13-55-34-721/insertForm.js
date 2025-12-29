import React, { forwardRef, useImperativeHandle } from "react";
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import DynamicTableHead from "ui-component/DynamicTableHead";
import DynamicTableRow from "../component/dynamicTableRow";
import SetValue from "../component/setValue";

const InsertForm = forwardRef((props, ref) => {
    const { 
        rows = [],
        onCheckChange,
        onChange,
        setAllData,
        onAdd,
        onRemove
    } = props;
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        // Expose a method to update rows from outside
        setRows: (newRows) => {
            if (setAllData && typeof setAllData === 'function') {
                console.log("[CounselTherapy InsertForm] 🔄 setRows 호출됨:", newRows?.length);
                
                if (!newRows || newRows.length === 0) {
                    console.log("[CounselTherapy InsertForm] ⚠️ 빈 rows 데이터, 무시함");
                    return false;
                }
                
                console.log("[CounselTherapy InsertForm] 🔍 참가자 데이터 첫 번째 행:", 
                    JSON.stringify(newRows[0]).substring(0, 200) + '...');
                
                // Call setAllData to update rows
                console.log("[CounselTherapy InsertForm] 🔄 setAllData 호출 시작");
                setAllData('all', newRows);
                console.log("[CounselTherapy InsertForm] ✅ setAllData 호출 완료");
                return true;
            }
            console.log("[CounselTherapy InsertForm] ❌ setAllData 함수 없음");
            return false;
        },
        // Expose current rows
        getRows: () => rows
    }), [rows, setAllData]);

    // 직업 옵션 (15가지)
    const jobOptions = [
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
        { label: "기타", value: "기타" }
    ];

    // 콘텐츠 종류 옵션 (6가지)
    const contentTypeOptions = [
        { label: "게임", value: "게임" },
        { label: "돈내기게임(도박)", value: "돈내기게임(도박)" },
        { label: "SNS", value: "SNS" },
        { label: "영상(유튜브, 아프리카TV 시청 등)", value: "영상(유튜브, 아프리카TV 시청 등)" },
        { label: "웹툰/소설", value: "웹툰/소설" },
        { label: "기타", value: "기타" }
    ];

    const fields = [
        {name: 'sex', label: "성별", type: "select"},
        {name: 'age', label: "연령", type: "age"},
        {name: 'residence', label: "거주지", type: "select"},
        {name: 'job', label: "직업", type: "select", options: jobOptions},
        {name: 'past_experience', label: "과거 경험", type: "select", options: ["미기재", "없음", "있음"]},
        {name: 'content_type', label: "콘텐츠 종류", type: "select", options: contentTypeOptions},
        {name: 'average_usage_time', label: "1회 평균 사용 시간", type: "input"},
        {name: 'monthly_expense', label: "월 평균 지출 금액", type: "input"},
        {name: 'score1', label: "조절실패(문항1)", type: "sNumber"},
        {name: 'score2', label: "조절실패(문항2)", type: "sNumber"},
        {name: 'score3', label: "현저성(문항3)", type: "sNumber"},
        {name: 'score4', label: "현저성(문항4)", type: "sNumber"},
        {name: 'score5', label: "문제적결과(문항5)", type: "sNumber"},
        {name: 'score6', label: "문제적결과(문항6)", type: "sNumber"},
        {name: 'score7', label: "문제적결과(문항7)", type: "sNumber"},
        {name: 'score8', label: "문제적결과(문항8)", type: "sNumber"},
        {name: 'score9', label: "문제적결과(문항9)", type: "sNumber"},
        {name: 'score10', label: "문제적결과(문항10)", type: "sNumber"},
        {name: 'score11', label: "낮은자기조절력(문항11)", type: "sNumber"},
        {name: 'score12', label: "낮은자기조절력(문항12)", type: "sNumber"},
        {name: 'score13', label: "낮은자기조절력(문항13)", type: "sNumber"},
        {name: 'score14', label: "낮은자기조절력(문항14)", type: "sNumber"},
        {name: 'score15', label: "낮은자기조절력(문항15)", type: "sNumber"},
        {name: 'score16', label: "낮은자기조절력(문항16)", type: "sNumber"},
        {name: 'score17', label: "자기이해(문항17)", type: "sNumber"},
        {name: 'score18', label: "자기이해(문항18)", type: "sNumber"},
        {name: 'score19', label: "자기이해(문항19)", type: "sNumber"},
        {name: 'score20', label: "자기이해(문항20)", type: "sNumber"},
        {name: 'score21', label: "자기수용(문항21)", type: "sNumber"},
        {name: 'score22', label: "자기수용(문항22)", type: "sNumber"},
        {name: 'score23', label: "자기수용(문항23)", type: "sNumber"},
        {name: 'score24', label: "대인관계기술부족(문항24)", type: "sNumber"},
        {name: 'score25', label: "대인관계기술부족(문항25)", type: "sNumber"},
        {name: 'score26', label: "대인관계기술부족(문항26)", type: "sNumber"},
        {name: 'score27', label: "마음관리기술/기회(문항27)", type: "sNumber"},
        {name: 'score28', label: "마음관리기술/기회(문항28)", type: "sNumber"},
        {name: 'score29', label: "마음관리기술/기회(문항29)", type: "sNumber"},
        {name: 'score30', label: "마음관리기술/기회(문항30)", type: "sNumber"}
    ];

    const headerInfo = [
        [
          '선택', '성별', '연령', '거주지', '직업', '과거경험', '콘텐츠 종류', '1회 평균 사용 시간', '월 평균 지출 금액',
          '조절실패', '조절실패',
          '현저성', '현저성',
          '문제적결과', '문제적결과', '문제적결과', '문제적결과', '문제적결과', '문제적결과',
          '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력', '낮은자기조절력',
          '자기이해', '자기이해', '자기이해', '자기이해',
          '자기수용', '자기수용', '자기수용',
          '대인관계기술부족', '대인관계기술부족', '대인관계기술부족',
          '마음관리기술/기회', '마음관리기술/기회', '마음관리기술/기회', '마음관리기술/기회'
        ],
        [
          '', '', '', '', '', '', '', '', '',
          '문항1', '문항2',
          '문항3', '문항4',
          '문항5', '문항6', '문항7', '문항8', '문항9', '문항10',
          '문항11', '문항12', '문항13', '문항14', '문항15', '문항16',
          '문항17', '문항18', '문항19', '문항20',
          '문항21', '문항22', '문항23',
          '문항24', '문항25', '문항26',
          '문항27', '문항28', '문항29', '문항30'
        ]
    ];

    const addRow = () => {
        if (onAdd && typeof onAdd === 'function') {
            onAdd();
        }
    };

    const removeRow = () => {
        if (onRemove && typeof onRemove === 'function') {
            onRemove();
        }
    };

    const handleChange = (idx, name, value) => {
        console.log("[CounselTherapy InsertForm] handleChange:", { idx, name, value });
        if (onChange && typeof onChange === 'function') {
            onChange(idx, name, value);
        }
    };

    const handleCheckChange = (idx, checked) => {
        console.log("[CounselTherapy InsertForm] handleCheckChange:", { idx, checked });
        if (onCheckChange && typeof onCheckChange === 'function') {
            onCheckChange(idx, checked);
        }
    };

    return (
        <>
            <SetValue 
                onAdd={addRow} 
                onRemove={removeRow}
                onSetData={setAllData}
            />

            <TableContainer style={{ minHeight: "560px", paddingBottom: "50px" }}>
                <Table className="insertForm custom-table">
                    <DynamicTableHead headerInfo={headerInfo} />
                    <DynamicTableRow 
                        rows={rows} 
                        fields={fields} 
                        onCheckChange={handleCheckChange} 
                        onChange={handleChange} 
                        id="idx" 
                    />
                </Table>
            </TableContainer>
        </>
    );
});

InsertForm.displayName = 'CounselTherapyInsertForm';

export default InsertForm; 