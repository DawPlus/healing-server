import React, { memo } from "react";
import DynamicTable from "ui-component/DynamicTableNoRow";

const ProgramResult = ({ rows = [] }) => { 
    // Mock data if rows not provided
    const mockRows = [
        {
            keyword0: '자연체험',
            keyword1: '생태교육',
            keyword2: '산림치유',
            SCORE1: 4.7,
            SCORE2: 4.8,
            SCORE3: 4.6,
            avg1: 4.7,
            SCORE4: 4.5,
            SCORE5: 4.6,
            SCORE6: 4.8,
            avg2: 4.63,
            SCORE7: 4.5,
            SCORE8: 4.7,
            SCORE9: 4.6,
            avg3: 4.6,
            avg4: 4.64
        },
        {
            keyword0: '힐링명상',
            keyword1: '자연치유',
            keyword2: '심리안정',
            SCORE1: 4.9,
            SCORE2: 4.7,
            SCORE3: 4.8,
            avg1: 4.8,
            SCORE4: 4.6,
            SCORE5: 4.7,
            SCORE6: 4.9,
            avg2: 4.73,
            SCORE7: 4.8,
            SCORE8: 4.9,
            SCORE9: 4.8,
            avg3: 4.83,
            avg4: 4.79
        },
        {
            keyword0: '산림체험',
            keyword1: '자연학습',
            keyword2: '환경보호',
            SCORE1: 4.6,
            SCORE2: 4.5,
            SCORE3: 4.7,
            avg1: 4.6,
            SCORE4: 4.6,
            SCORE5: 4.5,
            SCORE6: 4.7,
            avg2: 4.6,
            SCORE7: 4.6,
            SCORE8: 4.5,
            SCORE9: 4.7,
            avg3: 4.6,
            avg4: 4.6
        }
    ];
    
    const displayRows = rows.length > 0 ? rows : mockRows;
    
    const headerInfo = [
        ['주제어1', '주제어2', '주제어3', '강사', '강사', '강사', '강사', '내용구성', '내용구성', '내용구성', '내용구성', '효과성', '효과성', '효과성', '효과성', '평균'],
        ['', '', '',  '전문성', '성실성', '반응성', '평균', '체계성', '적합성', '흥미성', '평균', '학습성', '재참여', '추천', '평균', '']
    ];
    const dataCell = ['keyword0', 'keyword1', 'keyword2', 'SCORE1', 'SCORE2', 'SCORE3', 'avg1', 'SCORE4', 'SCORE5', 'SCORE6', 'avg2', 'SCORE7', 'SCORE8', 'SCORE9', 'avg3', 'avg4'];
    const avgCell = ['', '', '통계', 'SCORE1', 'SCORE2', 'SCORE3', 'avg1', 'SCORE4', 'SCORE5', 'SCORE6', 'avg2', 'SCORE7', 'SCORE8', 'SCORE9', 'avg3', 'avg4'];
    
    var wscols = [ {wch:20}, {wch:20}, {wch:20}];
    
    return (
        <DynamicTable headerInfo={headerInfo} dataCellInfo={dataCell} avgCellInfo={avgCell} rows={displayRows} wscols={wscols}/>
    );
}

export default memo(ProgramResult); 