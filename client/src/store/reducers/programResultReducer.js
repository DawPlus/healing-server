import { createAction, current } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";

const name ="programResult";

const initialState = {

    type : "",
    agency : "",
    agency_id: null,
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
    },
    residenceList : [], 
    programManage: {
      manage : [],
      bunya  : [], 
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

  agencyList : [], 
  programResult : [], 
  facilityList : [] , 
  preventList : [],
  healingList : [],

  searchResult  : {
    searchInfo : {
        openday : "", 
        endday : "",
        effect : "",
       //AGENCY : "상상지역아동센터",
        keyword : [
          {type : "X", text : ""},
          {type : "X", text : ""},
          {type : "X", text : ""},
        ]
    },

    rows : [], 
    facility : [], 

  }


};

const action = {


  //  getProgramAgency : createAction(`${name}/getProgramAgency`),
    getProgramResult : createAction(`${name}/getProgramResult`),
    getFaciltyList : createAction(`${name}/getFaciltyList`),
    getPreventList : createAction(`${name}/getPreventList`),
    getHealingList : createAction(`${name}/getHealingList`),
    programManage : createAction(`${name}/programManage`, (data) => ({payload : data})),
    getPartTypeList : createAction(`${name}/getPartTypeList`),
    getResidenceList : createAction(`${name}/getResidenceList`),


    getSearchResult : createAction(`${name}/getSearchResult`),




}

const calculateAverage= (scores) =>{
  const filteredScores = scores.filter(i => +i > 0);
  const sum = filteredScores.reduce((sum, num) => sum + +num, 0);
  const average = sum / filteredScores.length;
  if (isNaN(average)) {
    return 0;
  }
  return average.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: average % 1 === 0 ? 1 : 2,
  });
}


export const {getState, reducer, actions} = createCustomSlice({
    name,
    initialState,
    action, 
    reducers: {
      initState: (state) => {
        return initialState;
      },
      initProgramAgency : (state)=>{
        state.type = initialState.type;
        state.agency = initialState.agency;
        state.agency_id = initialState.agency_id;
        state.agencyList = initialState.agencyList;
        state.programResult = initialState.programResult;
      },
      setSearchAgency : (state, {payload})=>{
        state.searchResult.searchInfo.AGENCY = payload;
      },
      setSearchData : (state, {payload : {key, value}})=>{
        state.searchResult.searchInfo[key] = value;
      },

      setAgency : (state, {payload})=>{
        state.agency = payload?.label || payload;
        state.agency_id = payload?.agency_id || null;
        state.programResult = initialState.programResult;
        state.facilityList = initialState.facilityList;
      },


      // 힐링서비스  효과평가
      getHealingList_SUCCESS : (state, {payload})=>{

        const sortedData = payload.data.sort((a, b) => {
          if (a.NAME < b.NAME) return -1;
          if (a.NAME > b.NAME) return 1;
          if (a.PV === '사전' && b.PV === '사후') return -1;
          if (a.PV === '사후' && b.PV === '사전') return 1;
          return 0;
      });

      // 사전 사후가 없을경우는 0 으로 입력  
      // 사전과 사후가 모두 있는 항목만 출력
      const filteredData = sortedData.filter(data => {
          const hasPre = sortedData.some(item => item.NAME === data.NAME && item.PV === '사전');
          const hasPost = sortedData.some(item => item.NAME === data.NAME && item.PV === '사후');
          return hasPre && hasPost;
      });


      state.healingList = filteredData.map(i => {
        const sum1List = [i.SCORE1, i.SCORE2];
        const sum2List = [i.SCORE3, i.SCORE4, i.SCORE5];
        const sum3List = [i.SCORE6, i.SCORE7, i.SCORE8, i.SCORE9];
        const sum4List = [i.SCORE10, i.SCORE11, i.SCORE12];
        const sum5List = [i.SCORE11, i.SCORE12, i.SCORE13, i.SCORE14];
        const sum6List = [i.SCORE15, i.SCORE16, i.SCORE17];
        const sum7List = [i.SCORE18, i.SCORE19, i.SCORE20];
    
        const [sum1, sum2, sum3, sum4, sum5, sum6, sum7] = [
            calculateAverage(sum1List),
            calculateAverage(sum2List),
            calculateAverage(sum3List),
            calculateAverage(sum4List),
            calculateAverage(sum5List),
            calculateAverage(sum6List),
            calculateAverage(sum7List)
        ].map(value => isNaN(value) ? "-" : value);
    
        return { ...i, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
    });
    
        },
  
      // 예방서비스 효과평가
      getPreventList_SUCCESS : (state, {payload})=>{
       
        const sortedData = payload.data.sort((a, b) => {
          if (a.NAME < b.NAME) return -1;
          if (a.NAME > b.NAME) return 1;
          if (a.PV === '사전' && b.PV === '사후') return -1;
          if (a.PV === '사후' && b.PV === '사전') return 1;
          return 0;
      });
      
      // 사전 사후가 없을경우는 0 으로 입력  
      // 사전과 사후가 모두 있는 항목만 출력
      const filteredData = sortedData.filter(data => {
          const hasPre = sortedData.some(item => item.NAME === data.NAME && item.PV === '사전');
          const hasPost = sortedData.some(item => item.NAME === data.NAME && item.PV === '사후');
          return hasPre && hasPost;
      });
      


      state.preventList = filteredData.map(i => {
          const sum1List = [i.SCORE1, i.SCORE2, i.SCORE3];
          const sum2List = [i.SCORE4, i.SCORE5, i.SCORE6];
          const sum3List = [i.SCORE7, i.SCORE8, i.SCORE9, i.SCORE10];
          const sum4List = [i.SCORE11, i.SCORE12];
          const sum5List = [i.SCORE13, i.SCORE14, i.SCORE15, i.SCORE16, i.SCORE17];
          const sum6List = [i.SCORE18, i.SCORE19, i.SCORE20];
          
          const [sum1, sum2, sum3, sum4, sum5, sum6] = [
              calculateAverage(sum1List),
              calculateAverage(sum2List),
              calculateAverage(sum3List),
              calculateAverage(sum4List),
              calculateAverage(sum5List),
              calculateAverage(sum6List)
          ].map(value => isNaN(value) ? "-" : value);
      
          return { ...i, sum1, sum2, sum3, sum4, sum5, sum6 };
      });
    
      },

      getProgramAgency : (state, {payload : {type}})=>{
        state.type = type;
        state.agency = initialState.agency;
        state.agency_id = initialState.agency_id;
        state.programResult = initialState.programResult; 
        state.facilityList = initialState.facilityList; 
        state.preventList = initialState.preventList;
      },
      getProgramAgency_SUCCESS : (state, {payload})=>{
        state.agencyList = payload.data; // Data already has the correct format from the GraphQL query
      },
      // 프로그램 만족도
      getProgramResult_SUCCESS : (state, {payload})=>{
        state.programResult = payload.data.map(i => {
          const sum1List = [i.SCORE1, i.SCORE2, i.SCORE3];
          const sum2List = [i.SCORE4, i.SCORE5, i.SCORE6];
          const sum3List = [i.SCORE7, i.SCORE8, i.SCORE9];
      
          const sum1 = sum1List.reduce((sum, num) => sum + +num, 0) / sum1List.filter(num => +num > 0).length;
          const sum2 = sum2List.reduce((sum, num) => sum + +num, 0) / sum2List.filter(num => +num > 0).length;
          const sum3 = sum3List.reduce((sum, num) => sum + +num, 0) / sum3List.filter(num => +num > 0).length;
      
          const result1 = isNaN(sum1) ? "-" : sum1.toFixed(sum1 % 1 === 0 ? 1 : 2);
          const result2 = isNaN(sum2) ? "-" : sum2.toFixed(sum2 % 1 === 0 ? 1 : 2);
          const result3 = isNaN(sum3) ? "-" : sum3.toFixed(sum3 % 1 === 0 ? 1 : 2);
      
          return {
              ...i,
              sum1: result1,
              sum2: result2,
              sum3: result3,
          };
      });
      
      },



      // 시설 서비스환경만족도
      getFaciltyList_SUCCESS : (state, {payload})=>{
        state.facilityList = payload.data.map(i => {
          const sum1List = [i.SCORE1, i.SCORE2];
          const sum2List = [i.SCORE3, i.SCORE4];
          const sum3List = [i.SCORE5, i.SCORE6, i.SCORE7];
          const sum4List = [i.SCORE8, i.SCORE9, i.SCORE10];
          const sum5List = [i.SCORE11, i.SCORE12, i.SCORE13];
          const sum6List = [i.SCORE14, i.SCORE15, i.SCORE16];
          const sum7List = [i.SCORE17, i.SCORE18];
      
          const [sum1, sum2, sum3, sum4, sum5, sum6, sum7] = [
              calculateAverage(sum1List),
              calculateAverage(sum2List),
              calculateAverage(sum3List),
              calculateAverage(sum4List),
              calculateAverage(sum5List),
              calculateAverage(sum6List),
              calculateAverage(sum7List)
          ].map(value => isNaN(value) ? "-" : value);
      
          return { ...i, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
      });
      
      },




      // 주제어별 
      onChangeSearchResult : (state, {payload})=>{
        state.searchResult.searchInfo.effect = payload;
        state.searchResult.rows = initialState.searchResult.rows;
      },
      //주제어 변경 
      onChangeSearchKeyword : (state, {payload: {index, key, value}})=>{
        state.searchResult.searchInfo.keyword[index][key] = value
      },

      getSearchResult_SUCCESS : (state, {payload})=>{        
        const {searchInfo  : {keyword, effect}} = current(state).searchResult
        const _keyword = keyword.map(i=> ({...i, text : i.type=== "X" ? "" : i.text}))
        
        if(['program', 'facility'].includes(effect)){
          state.searchResult.rows = payload.data.map(i=> {
            let avgs = {};
            if(effect ==="program"){
              avgs = {
                avg1 : calculateAverage([i.SCORE1, i.SCORE2, i.SCORE3]),
                avg2 : calculateAverage([i.SCORE4, i.SCORE5, i.SCORE6]),
                avg3 : calculateAverage([i.SCORE7, i.SCORE8, i.SCORE9]),
                avg4 : calculateAverage([i.SCORE1, i.SCORE2, i.SCORE3, i.SCORE4, i.SCORE5, i.SCORE6,i.SCORE7, i.SCORE8, i.SCORE9])
              }
            }else if(effect==="facility"){
              const sum1List = [i.SCORE1, i.SCORE2];
              const sum2List = [i.SCORE3, i.SCORE4];
              const sum3List = [i.SCORE5, i.SCORE6, i.SCORE7];
              const sum4List = [i.SCORE8, i.SCORE9, i.SCORE10];
              const sum5List = [i.SCORE11, i.SCORE12, i.SCORE13];
              const sum6List = [i.SCORE14, i.SCORE15, i.SCORE16];
              const sum7List = [i.SCORE17, i.SCORE18];
              
              const [sum1, sum2, sum3, sum4, sum5, sum6, sum7] = [
                  calculateAverage(sum1List),
                  calculateAverage(sum2List),
                  calculateAverage(sum3List),
                  calculateAverage(sum4List),
                  calculateAverage(sum5List),
                  calculateAverage(sum6List),
                  calculateAverage(sum7List)
              ].map(value => isNaN(value) ? "-" : value);
              
              avgs = {
                  sum1, sum2, sum3, sum4, sum5, sum6, sum7
              };
              
            }
            return {
                ...i, 
                keyword0  : _keyword[0].text,
                keyword1  : _keyword[1].text,
                keyword2  : _keyword[2].text,
                ...avgs
            }
          })
        }else { 

          // 입력순으로 정렬 (ID 또는 생성일시 순서) - 문자정렬 제거
          const sortedData = payload.data.sort((a, b) => {
              // 먼저 ID로 정렬 (입력순)
              if (a.ID && b.ID) {
                  if (a.ID !== b.ID) {
                      return a.ID - b.ID;
                  }
              }
              // ID가 없거나 같으면 사전/사후 순서만 유지
              if (a.PV === '사전' && b.PV === '사후') return -1;
              if (a.PV === '사후' && b.PV === '사전') return 1;
              return 0;
          });
    
          
          // 사전 사후가 없을경우는 0 으로 입력  
          // 사전과 사후가 모두 있는 항목만 출력
          const filteredData = sortedData.filter(data => {
              const hasPre = sortedData.some(item => item.NAME === data.NAME && item.PV === '사전');
              const hasPost = sortedData.some(item => item.NAME === data.NAME && item.PV === '사후');
              return hasPre && hasPost;
          }); // 사전사후 모두 잇어야함 
  
          state.searchResult.rows = filteredData.map(i=> {
              let avgs = {}
              if(effect ==="prevent"){

                
                const sum1List = [i.SCORE1, i.SCORE2, i.SCORE3];
                const sum2List = [i.SCORE4, i.SCORE5, i.SCORE6];
                const sum3List = [i.SCORE7, i.SCORE8, i.SCORE9, i.SCORE10];
                const sum4List = [i.SCORE11, i.SCORE12];
                const sum5List = [i.SCORE13, i.SCORE14, i.SCORE15, i.SCORE16, i.SCORE17];
                const sum6List = [i.SCORE18, i.SCORE19, i.SCORE20];
                
                const [sum1, sum2, sum3, sum4, sum5, sum6] = [
                    calculateAverage(sum1List),
                    calculateAverage(sum2List),
                    calculateAverage(sum3List),
                    calculateAverage(sum4List),
                    calculateAverage(sum5List),
                    calculateAverage(sum6List)
                ].map(value => isNaN(value) ? "-" : value);
                
                avgs = { ...i, sum1, sum2, sum3, sum4, sum5, sum6 };
                
              }else{

                const sum1List = [i.SCORE1, i.SCORE2];
                const sum2List = [i.SCORE3, i.SCORE4, i.SCORE5];
                const sum3List = [i.SCORE6, i.SCORE7, i.SCORE8, i.SCORE9];
                const sum4List = [i.SCORE10, i.SCORE11, i.SCORE12];
                const sum5List = [i.SCORE11, i.SCORE12, i.SCORE13, i.SCORE14];
                const sum6List = [i.SCORE15, i.SCORE16, i.SCORE17];
                const sum7List = [i.SCORE18, i.SCORE19, i.SCORE20];
                
                const [sum1, sum2, sum3, sum4, sum5, sum6, sum7] = [
                    calculateAverage(sum1List),
                    calculateAverage(sum2List),
                    calculateAverage(sum3List),
                    calculateAverage(sum4List),
                    calculateAverage(sum5List),
                    calculateAverage(sum6List),
                    calculateAverage(sum7List)
                ].map(value => isNaN(value) ? "-" : value);
                
                avgs = { ...i, sum1, sum2, sum3, sum4, sum5, sum6, sum7 };
                
              }
              return {
                ...i, 
                keyword0  : _keyword[0].text,
                keyword1  : _keyword[1].text,
                keyword2  : _keyword[2].text,
                ...avgs
            }
          })
        }


      },









      getPartTypeList_SUCCESS : (state, {payload: {data}})=>{
        state.partTypeList = data[0];
      },
      // 지역 목록 
      getResidenceList_SUCCESS :(state, {payload : {data}})=>{
        state.residenceList = data;
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

      state.programManage.bunya = result2;


      },
    }
});
