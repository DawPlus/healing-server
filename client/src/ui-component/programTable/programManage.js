import React from "react";
import { Table,  TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useState } from "react";
import callApi from "utils/callApi";


const headerInfo =  ['구분', '산림교육', '예방교육', '산림치유', '아트','릴렉싱','에너제틱', '쿠킹', '이벤트', '합계'];


const ParticipationType = (props)=>{
    
    const {endday, openday, agency} = props;

    const [programManager, setProgramManager] = useState({
        manage : [],
        bunya  : [], 
    })

    React.useEffect(()=>{
        callApi("/programTable/programManage", {agency, openday, endday}).then(({data : {manage, bunya }})=>{

                let categories = ['산림교육', '예방교육', '산림치유', '아트','릴렉싱','에너제틱', '쿠킹', '이벤트'];
                let results = [
                    { type : '프로그램(개)' },
                    { type : '내부강사(명)' },
                    { type : '외부강사(명)' },
                ];
        
                // Initialize counts to 0
                for(let category of categories) {
                    let key = category.replace(/\s/g, '_'); // Replace whitespace with underscore for object keys
                    results[0][key] = 0;
                    results[1][key] = 0;
                    results[2][key] = 0;
                }
        
                // Count programs and instructors by category
                for(let item of manage) {
                    let programs = item.PROGRAM_IN_OUT2.split(',');
        
                    for(let i = 0; i < programs.length; i += 5) {
                        let category = programs[i + 1];
        
                        if(categories.includes(category)) {
                            let key = category.replace(/\s/g, '_');
                            results[0][key]++; // Increment program count
                            results[1][key] += parseInt(programs[i + 3]); // Add internal instructors
                            results[2][key] += parseInt(programs[i + 4]); // Add external instructors
                        }
                    }
                }
        
                // Calculate sums
                for(let result of results) {
                    let sum = 0;
                    for(let key in result) {
                        if(key !== 'type') {
                            sum += result[key];
                        }
                    }
                    result['합계'] = sum;
                }
                
        
        
        
        
            let result2 = [
                {type: '강사'},
                {type: '내용구성'},
                {type: '효과성'}
            ]
                    
                
            let avg = {type: '평균'};
        
            categories.forEach(category => {
                let filteredData = bunya.filter(item => item.bunya === category);
                if(filteredData.length > 0) {
                    let sum = 0;
                    filteredData.forEach(item => {
                        result2[0][category] = item.program || 0;
                        result2[1][category] = item.content || 0;
                        result2[2][category] = item.effect || 0;
                        sum += item.program + item.content + item.effect;
                    });
                    avg[category] = parseFloat((sum / (3 * filteredData.length)).toFixed(2));
                } else {
                    result2[0][category] = 0;
                    result2[1][category] = 0;
                    result2[2][category] = 0;
                    avg[category] = 0;
                }
            });
        
            result2.push(avg);
        
            // 합계를 계산하는 함수를 만듭니다.
            function calculateTotal(obj) {
            let sum = 0;
            let notnull =0;
            for(let key in obj) {
                if(key !== 'type') {
                    sum += obj[key] ;
                    obj[key] >0 && notnull++ ;
                }
            }
            return parseFloat((sum / notnull).toFixed(2));
            }
            // 각 객체에 '합계' 항목을 추가합니다.
            result2.forEach(row => {
            row['합계'] = calculateTotal(row);
            });

            setProgramManager(s=>({
                manage : results, 
                bunya  : result2, 
            }));

        })
    },[openday, endday, agency])


    const {manage, bunya} = programManager;


    return <>
        <TableContainer style={{marginTop : "20px"}}>
            <Table className="report custom-table">
            <TableHead>
                <TableRow>
                    <TableCell className="table-header"></TableCell>
                    {headerInfo.map((i, idx)=> <TableCell className="table-header" key={idx}  align="center" > {i} </TableCell>)}
                </TableRow>
            </TableHead>
                <TableBody>
                    {/* AS-is 데이터가 잘못됨 - 프로그램운영- 이벤트가 0 인데 사실 3건이 존재함 */}
                        {manage.map((data, idx) => (
                            <TableRow key={idx}>                        
                                {idx ===  0 ? <TableCell className="table-header" rowSpan={3}>프로그램<br/>운영</TableCell> : null}
                                <TableCell>{data.type}</TableCell>
                                <TableCell>{data.산림교육}</TableCell>
                                <TableCell>{data.예방교육}</TableCell>
                                <TableCell>{data.산림치유}</TableCell>
                                <TableCell>{data.아트}</TableCell>
                                <TableCell>{data.릴렉싱}</TableCell>
                                <TableCell>{data.에너제틱}</TableCell>
                                <TableCell>{data.쿠킹}</TableCell>
                                <TableCell>{data.이벤트}</TableCell>
                                <TableCell>{data.합계}</TableCell>
                            </TableRow>
                        ))}
                        
                        {bunya.map((data, idx) => (
                            <TableRow key={idx}>                        
                                {idx ===  0 ? <TableCell className="table-header" rowSpan={4}>프로그램<br/>만족도</TableCell> : null}
                                <TableCell>{data.type}</TableCell>
                                <TableCell>{data.산림교육}</TableCell>
                                <TableCell>{data.예방교육}</TableCell>
                                <TableCell>{data.산림치유}</TableCell>
                                <TableCell>{data.아트}</TableCell>
                                <TableCell>{data.릴렉싱}</TableCell>
                                <TableCell>{data.에너제틱}</TableCell>
                                <TableCell>{data.쿠킹}</TableCell>
                                <TableCell>{data.이벤트}</TableCell>
                                <TableCell>{data.합계}</TableCell>
                            </TableRow>
                        ))}
                        
                    
                </TableBody>
            </Table>
        </TableContainer>
    </>

}
export default ParticipationType;