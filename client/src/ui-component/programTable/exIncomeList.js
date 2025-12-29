import React, {useState} from "react";
import { Table,  TableBody, TableCell, TableContainer, TableRow } from '@mui/material';

import DynamicTableHead from "ui-component/DynamicTableHead";
import callApi from "utils/callApi";


const headerInfo =     [
    ["지출및매출금액",'지출(천원)','지출(천원)','지출(천원)','지출(천원)','지출(천원)','지출(천원)','지출(천원)','지출(천원)','지출(천원)','지출(천원)','수입(천원)','수입(천원)','수입(천원)','수입(천원)','수입(천원)','수입(천원)','수입(천원)'],
    ["",'강사비','강사교통비','강사식비','보조강사비','참가자숙박','참가자식비','재료비','기타비','예비비','합계','프로그램','숙박비','식사비','재료비','기타비','합계','최종금액'],
    
]
// 수입지출
const ExIncomeList = (props)=>{

    const {openday, endday, agency}  = props;
    const [exIncomeList , setExIncomeList] = useState( {
        expend :{
            강사예정강사비: "",
            강사예정교통비: "",
            강사예정보조강사비: "",
            강사예정식사비: "",
            강사집행강사비: "",
            강사집행교통비: "",
            강사집행보조강사비: "",
            강사집행식사비: "",
            고객예정숙박비: "",
            고객예정식사비: "",
            고객예정예비비: "",
            고객예정재료비: "",
            고객집행기타비: "",
            고객집행숙박비: "",
            고객집행식사비: "",
            고객집행재료비: "",
        },
        income : {
            기타:  "",
            숙박비:  "",
            식사비:  "",
            재료비:  "",
            프로그램:  "",
            할인율:  "",
        },
        incomeTotal : ""
    })

    
    React.useEffect(()=>{
        callApi("/programTable/getExIncomeList", {agency, openday, endday}).then(({data})=>{
                
            let result = {};
                data.expend.forEach(obj => {
            let sum = 0;
            let priceArray = obj.price1.split(',');
                priceArray.forEach(price => {
                    sum += parseFloat(price);
                });
                // 반올림하여 소수점 자리는 표시하지 않음
                sum = Math.round(sum);
                // 세 번째 자리마다 쉼표 추가
                //let formattedSum = sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                result[obj.type] = sum;
            });

            let tempTotal = 0;
            ["강사예정강사비", "강사예정교통비", "강사예정보조강사비", "강사예정식사비", "고객예정숙박비", "고객예정식사비", "고객예정예비비", "고객예정재료비"].forEach(i=>{
                    tempTotal += result[i];
            });

            result["예비비"] = tempTotal;

            let total = 0;
            ['강사예정강사비','강사예정교통비', '강사예정보조강사비', '강사예정식사비', '강사집행강사비', '강사집행교통비', '강사집행보조강사비', '강사집행식사비'].forEach(i=>{
                total += result[i];
            });
            result["합계"] = total;

            
            let income = {};
            data.income.forEach(obj => {
                let sum = 0;
                let priceArray = obj.price1.split(',');
                priceArray.forEach(price => {
                    sum += parseFloat(price);
                });
                // 반올림하여 소수점 자리는 표시하지 않음
                sum = Math.round(sum);
                income[obj.type] = sum;
                });

                
            let incomeTotal  = 0;
            ['기타', '숙박비', '식사비', '재료비', '프로그램'].forEach(i=> incomeTotal += income[i])
            income["합계"] = incomeTotal;

                let totalSum = 0;
                data.incomeTotal.forEach(item => {
                    totalSum += item.sum;
                });

                setExIncomeList({
                    expend  : result, 
                    income : income,
                    incomeTotal : totalSum
                });
                
        })
    },[openday, endday, agency])


    const {expend, income, incomeTotal} = exIncomeList;



    return <>
        <TableContainer style={{marginTop : "20px"}}>
            <Table className="report custom-table">
            <DynamicTableHead headerInfo={headerInfo}/>
                <TableBody>
                <TableRow>
                    <TableCell>구분</TableCell>
                    <TableCell>{expend["강사집행강사비"]}</TableCell>
                    <TableCell>{expend["강사집행교통비"]}</TableCell>
                    <TableCell>{expend["강사집행식사비"]}</TableCell>
                    <TableCell>{expend["강사집행보조강사비"]}</TableCell>
                    <TableCell>{expend["고객예정숙박비"]}</TableCell>
                    <TableCell>{expend["고객집행식사비"]}</TableCell>
                    <TableCell>{expend["고객집행재료비"]}</TableCell>
                    <TableCell>{expend["고객집행기타비"]}</TableCell>
                    <TableCell>{expend["예비비"]}</TableCell>
                    <TableCell>{expend["합계"]}</TableCell>
                    <TableCell>{income["프로그램"]}</TableCell>
                    <TableCell>{income["숙박비"]}</TableCell>
                    <TableCell>{income["식사비"]}</TableCell>
                    <TableCell>{income["재료비"]}</TableCell>
                    <TableCell>{income["기타"]}</TableCell>
                    <TableCell>{income["합계"]}</TableCell>
                    <TableCell>{incomeTotal}</TableCell>
                </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
}
export default ExIncomeList;