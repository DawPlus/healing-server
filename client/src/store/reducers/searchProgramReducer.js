import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";

const name ="searchProgram";

const initialState = {
    keyword : [
        {type : "X", text : ""},
        {type : "X", text : ""},    
        {type : "X", text : ""},
    ],
    partTypeList : {
        count_addict :"",
        count_adult :"",
        count_benefit :"",
        count_boy :"",
        count_etc :"",
        count_family :"",
        count_handicap :"",
        count_income_etc :"",
        count_income_green :"",
        count_income_voucher :"",
        count_kidboy :"",
        count_lowincome :"",
        count_old :"",
        count_society :"",
        count_teacher :"",
        part_addict :"",
        part_adult :"",
        part_benefit :"",
        part_boy :"",
        part_etc :"",
        part_family :"",
        part_handicap :"",
        part_income_etc :"",
        part_income_green :"",
        part_income_voucher :"",
        part_kidboy :"",
        part_lowincome :"",
        part_old :"",
        part_society :"",
        part_teacher :"",

        org_1 :"",
        org_2 :"",
        org_3 :"",
        org_4 :"",
        org_5 :"",
        
        org_part_1 :"",
        org_part_2 :"",
        org_part_3 :"",
        org_part_4 :"",
        org_part_5 :"",
        
    },
    programOverview : {
        people: [],
        pTotal : [], 
        service  : [], 
        room  : [{
        meal_etc: "",
        meal_lead: "",
        meal_part: "",
        room_etc_people: "",
        room_etc_room: "",
        room_lead_people: "",
        room_lead_room: "",
        room_part_people: "",
        room_part_room: "",
    }]
    },
    residenceList : [], 
    programManage: {
        manage : [],
        bunya  : [], 
    },
    serList : {
        score1: 0,
        score2: 0,
        score3: 0,
        score4: 0,
        score5: 0,
        score6: 0,
        score7: 0,
        score8: 0,
        score9: 0,
        score10: 0,
        score11: 0,
        score12: 0,
        score13: 0,
        score14: 0,
        score15: 0,
        score16: 0,
        total : 0,
    },
    programEffect :[],
};

const action = {
    getList : createAction(`${name}/getList`),
    getPartTypeList : createAction(`${name}/getPartTypeList`),
    programManage : createAction(`${name}/programManage`, (data) => ({payload : data})),
    getSerList : createAction(`${name}/getSerList`, (data) => ({payload : data})), // 시설 만족도
    getProgramEffect : createAction(`${name}/getProgramEffect`, (data) => ({payload : data})), // 프로그램 효과성 분석

    getResidenceList : createAction(`${name}/getResidenceList`, (data) => ({payload : data})),
    getAllPrograms : createAction(`${name}/getAllPrograms`, (data) => ({payload : data})),
}



export const {getState, reducer, actions} = createCustomSlice({
    name,
    initialState,
    action, 
    reducers: {
        onChangeSearchKeyword : (state, {payload : {index, key , value}})=>{
                state.keyword[index][key] =  value;
        },
        // 지역 목록 
        getResidenceList_SUCCESS :(state, {payload : {data}})=>{
            state.residenceList = data;
        },
        getPartTypeList_SUCCESS : (state, {payload})=>{
            state.partTypeList = payload.data[0]
        },
        getList_SUCCESS : (state, {payload: {data}})=>{
            state.rows = data;
        },
        // 프로그램시행개요
        getAllPrograms_SUCCESS :(state, {payload : {data}})=>{
            state.programOverview = data;
        },
        // 효과성분석    
        getProgramEffect_SUCCESS : (state, {payload : {data}})=>{
            
            let result = ["사전", "사후"].map(PV => {
            let row = { PV };
            for (let key in data) {
                let item = data[key].find(d => d.PV === PV);
                for (let prop in item) {
                    if (prop !== "PV") {
                        row[`${key}${prop[0].toUpperCase()}${prop.slice(1)}`] = item[prop];
                    }
                }
            }
            return row;
            });
            state.programEffect = result;
    
        },
         // 시설 서비스 만족도
        getSerList_SUCCESS : (state, {payload: {data}})=>{
            const result = Object.keys(data[0]).reduce((result, key) => {
            const score = data[0][key];
            if (typeof score === 'number') {
                result[key] = score.toFixed(2);
                result.total = ((result.total || 0) + score) / 2;
            }
            return result;
            }, {});
            
            if (typeof result.total === 'number') {
            result.total = result.total.toFixed(2);
            }
    
            state.serList = data.length > 0 ? result : {...state.serList};
        },
        // 프로그램운영-만족도
        programManage_SUCCESS :(state, {payload : {data : {manage, bunya }}})=>{
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
                state.programManage.manage = results;




                let result2 = [
                    {type: '강사'},
                    {type: '내용구성'},
                    {type: '효과성'},
                    {type: '참여인원'}
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
                        result2[3][category] = item.cnt || 0;
                        sum += item.program + item.content + item.effect;
                    });
                    avg[category] = parseFloat((sum / (3 * filteredData.length)).toFixed(2));
                } else {
                    result2[0][category] = 0;
                    result2[1][category] = 0;
                    result2[2][category] = 0;
                    result2[3][category] = 0;
                    avg[category] = 0;
                }
            });

                result2.push(avg);

            // 합계를 계산하는 함수를 만듭니다.
            function calculateTotal(obj) {
                let sum = 0;
                let notnull = 0;



                for (let key in obj) {
                    if (key !== 'type') {
                        const value = obj[key];
                        if (!isNaN(value)) { // Check if the value is NaN
                            sum += value;
                            value > 0 && notnull++;
                        } else {
                            // Replace NaN with 0
                            sum += 0;
                            notnull++;
                        }
                    }
                }
                

                if(obj["type"] ==="참여인원"){
                    return  sum;
                }

                return parseFloat((sum / notnull).toFixed(2));
            }
            // 각 객체에 '합계' 항목을 추가합니다.
            result2.forEach(row => {
                row['합계'] = calculateTotal(row);
            });

                state.programManage.bunya = result2;


            },


            
        }

    
});

