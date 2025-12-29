import React, { useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, TableHead, Divider } from '@mui/material';

const ProgramManage = ({ data }) => {
    // 1. Log received props immediately
    console.log("[ProgramManage] Received data prop:", JSON.stringify(data, null, 2));
    
    const {
        manage = [],
        bunya = [],
        manage_cnt = [],
        categoryData = {}
    } = data || {}; // Use data directly, default to {} if data is null/undefined
    
    // 2. Log the extracted categoryData
    console.log("[ProgramManage] Extracted categoryData:", JSON.stringify(categoryData, null, 2));

    // 모든 카테고리 키 추출 - 실제 데이터베이스 쿼리 결과를 사용
    const categories = Object.keys(categoryData);
    console.log("[ProgramManage] Derived categories:", categories);

    // 3. Log categories with useEffect to track updates
    useEffect(() => {
        console.log("[ProgramManage] useEffect - Categories updated:", categories);
    }, [categories]); // Dependency array includes categories
    
    // 카테고리가 실제로 없는 경우 렌더링하지 않음
    if (categories.length === 0) {
        console.log("[ProgramManage] No categories found, rendering nothing.");
        return null; // 데이터가 없으면 아무것도 표시하지 않음
    }
    
    // --- Calculations (using derived categories) ---
    const totalPrograms = categories.reduce((sum, category) => {
        return sum + (categoryData[category]?.programs || 0);
    }, 0);
    
    const totalInternalInstructors = categories.reduce((sum, category) => {
        return sum + (categoryData[category]?.internal_instructors || 0);
    }, 0);
    
    const totalExternalInstructors = categories.reduce((sum, category) => {
        return sum + (categoryData[category]?.external_instructors || 0);
    }, 0);
    
    const getTotalAverageByCategory = (scoreType) => {
        const scores = categories.map(category => 
            categoryData[category]?.satisfaction?.[scoreType] || 0
        );
        const validScores = scores.filter(score => score > 0);
        if (validScores.length === 0) return '0.00';
        const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
        return average.toFixed(2);
    };
    
    const totalAverage = (() => {
        const instructorAvg = parseFloat(getTotalAverageByCategory('instructor'));
        const contentAvg = parseFloat(getTotalAverageByCategory('content'));
        const effectivenessAvg = parseFloat(getTotalAverageByCategory('effectiveness'));
        if (instructorAvg === 0 && contentAvg === 0 && effectivenessAvg === 0) return '0.00';
        const validCount = (instructorAvg > 0 ? 1 : 0) + (contentAvg > 0 ? 1 : 0) + (effectivenessAvg > 0 ? 1 : 0);
        const sum = instructorAvg + contentAvg + effectivenessAvg;
        return (sum / (validCount || 1)).toFixed(2);
    })();
    
    // 안전한 카테고리 데이터 접근을 위한 헬퍼 함수 (이제 categoryData가 보장되므로 필요성이 줄어듦)
    const getCategoryValue = (category, path, defaultValue = 0) => {
        const parts = path.split('.');
        let value = categoryData[category];
        for (const part of parts) {
            if (!value || typeof value !== 'object') return defaultValue;
            value = value[part];
            if (value === undefined || value === null) return defaultValue;
        }
        return value;
    };

    console.log("[ProgramManage] Rendering table with categories:", categories);
    
    // --- Render Table --- 
    return (
        <>
            <TableContainer>
                <Table className="report custom-table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-header" align="center"></TableCell>
                            <TableCell className="table-header" align="center">구분</TableCell>
                            {categories.map((category, index) => (
                                <TableCell className="table-header" key={index} align="center">{category}</TableCell>
                            ))}
                            <TableCell className="table-header" align="center">합계</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* 프로그램 운영 */} 
                        <TableRow>
                            <TableCell rowSpan={3} align="center">프로그램<br/>운영</TableCell>
                            <TableCell align="center">프로그램(개)</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-programs-${index}`} align="center">
                                    {getCategoryValue(category, 'programs')}
                                </TableCell>
                            ))}
                            <TableCell align="center">{totalPrograms}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">내부강사(명)</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-internal-${index}`} align="center">
                                    {getCategoryValue(category, 'internal_instructors')}
                                </TableCell>
                            ))}
                            <TableCell align="center">{totalInternalInstructors}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">외부강사(명)</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-external-${index}`} align="center">
                                    {getCategoryValue(category, 'external_instructors')}
                                </TableCell>
                            ))}
                            <TableCell align="center">{totalExternalInstructors}</TableCell>
                        </TableRow>
                        
                        {/* 프로그램 만족도 */} 
                        <TableRow>
                            <TableCell rowSpan={4} align="center">프로그램<br/>만족도</TableCell>
                            <TableCell align="center">강사</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-satisfaction-instructor-${index}`} align="center">
                                    {getCategoryValue(category, 'satisfaction.instructor', 0).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="center">{getTotalAverageByCategory('instructor')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">내용구성</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-satisfaction-content-${index}`} align="center">
                                    {getCategoryValue(category, 'satisfaction.content', 0).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="center">{getTotalAverageByCategory('content')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">효과성</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-satisfaction-effectiveness-${index}`} align="center">
                                    {getCategoryValue(category, 'satisfaction.effectiveness', 0).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="center">{getTotalAverageByCategory('effectiveness')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">평균</TableCell>
                            {categories.map((category, index) => (
                                <TableCell key={`${category}-satisfaction-average-${index}`} align="center">
                                    {getCategoryValue(category, 'satisfaction.average', 0).toFixed(2)}
                                </TableCell>
                            ))}
                            <TableCell align="center">{totalAverage}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ my: 2 }} />
        </>
    );
};

export default ProgramManage;