import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';
const name ="program";

const initialState = {
    basicInfo : {
      BASIC_INFO_SEQ : null, 
      AGENCY : "",
      OM : "",
      OPENDAY : "",
      ENDDAY : "",
      DAYS_TO_STAY : "",
      RESIDENCE : "",
      PART_MAN_CNT : "",
      PART_WOMAN_CNT : "",
      LEAD_MAN_CNT : "",
      LEAD_WOMAN_CNT : "",
      // SUPPORT : "",
      // INCOME_TYPE : "",
      PART_TYPE : "",
      AGE_TYPE : "",
      BIZ_PURPOSE : "",
      PROGRAM_IN_OUT : "",
      SERVICE_TYPE : "",
      ROOM_PART_PEOPLE : "",
      ROOM_PART_ROOM : "",
      ROOM_LEAD_PEOPLE : "",
      ROOM_LEAD_ROOM : "",
      ROOM_ETC_PEOPLE : "",
      ROOM_ETC_ROOM : "",
      MEAL_TYPE : "",
      MEAL_PART : "",
      MEAL_LEAD : "",
      MEAL_ETC : "",
      PROGRAM_OPINION : "",
      SERVICE_OPINION : "",
      OVERALL_OPINION : "",
      PROGRESS_STATE : "",
      REG_ID : "",

      ORG_NATURE : "",// 단체성격
      PART_FORM : "", // 참여형태

      ISCLOSEMINE : 0,
    },

    programList : [], 

    teacherList : [
      { TITLE : "강사예정강사비",     EXPENSE_TYPE : "강사예정강사비",    EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "1" },
      { TITLE : "강사예정보조강사비", EXPENSE_TYPE : "강사예정보조강사비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE :"",id: "2" },
      { TITLE : "강사예정교통비",     EXPENSE_TYPE : "강사예정교통비",    EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "3" },
      { TITLE : "강사예정식사비",     EXPENSE_TYPE : "강사예정식사비",    EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "4" },
      { TITLE : "강사집행강사비",     EXPENSE_TYPE : "강사집행강사비",    EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "5" },
      { TITLE : "강사집행보조강사비", EXPENSE_TYPE : "강사집행보조강사비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE :"",id: "6" },
      { TITLE : "강사집행교통비",     EXPENSE_TYPE : "강사집행교통비",    EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "7" },
      { TITLE : "강사집행식사비",     EXPENSE_TYPE : "강사집행식사비",    EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "8" },
    ],
    teacherExtraList : [], 

    // 고객예정
    customList : [ // 강사비 기본 1개의 row로 구성됨... 
      { TITLE : "고객예정숙박비", EXPENSE_TYPE : "고객예정숙박비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "1" },
      { TITLE : "고객예정식사비", EXPENSE_TYPE : "고객예정식사비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "",  id: "2" },
      { TITLE : "고객예정재료비", EXPENSE_TYPE : "고객예정재료비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "3" },
      { TITLE : "고객예정예비비", EXPENSE_TYPE : "고객예정예비비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "4" },
      { TITLE : "고객집행숙박비", EXPENSE_TYPE : "고객집행숙박비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "5" },
      { TITLE : "고객집행식사비", EXPENSE_TYPE : "고객집행식사비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "",  id: "6" },
      { TITLE : "고객집행재료비", EXPENSE_TYPE : "고객집행재료비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "7" },
      { TITLE : "고객집행기타비", EXPENSE_TYPE : "고객집행기타비", EXPENSE_PRICE : "", EXPENSE_DETAIL : "", EXPENSE_NOTE : "", id: "8" },
    ],
    customExtraList : [], 

    income : [
      { TITLE : "프로그램", INCOME_TYPE : "프로그램",  INCOME_PRICE : "", INCOME_DETAIL : "", INCOME_NOTE : "", id: "1" },
      { TITLE : "숙박비",   INCOME_TYPE : "숙박비",    INCOME_PRICE : "", INCOME_DETAIL : "", INCOME_NOTE : "", id: "2" },
      { TITLE : "식사비",   INCOME_TYPE : "식사비",    INCOME_PRICE : "", INCOME_DETAIL : "", INCOME_NOTE : "", id: "3" },
      { TITLE : "재료비",   INCOME_TYPE : "재료비",    INCOME_PRICE : "", INCOME_DETAIL : "", INCOME_NOTE : "", id: "4" },
      { TITLE : "기타",     INCOME_TYPE : "기타",      INCOME_PRICE : "", INCOME_DETAIL : "", INCOME_NOTE : "", id: "5" },
      { TITLE : "할인율",   INCOME_TYPE : "할인율",    INCOME_PRICE : "", INCOME_DETAIL : "", INCOME_NOTE : "", id: "6" },
    ],
    incomeExtraList : [] , 
    


    tempList : [], 
    bunyaList : [], 
    programMngList : [],
    teacherMngList : [],
    rows : [], 

    

};

const order = [
  "강사예정강사비",
  "강사예정보조강사비",
  "강사예정교통비",
  "강사예정식사비",
  "강사집행강사비",
  "강사집행보조강사비",
  "강사집행교통비",
  "강사집행식사비",
  "고객예정숙박비",
  "고객예정식사비",
  "고객예정재료비",
  "고객예정예비비",
  "고객집행숙박비",
  "고객집행식사비",
  "고객집행재료비",
  "고객집행기타비",
];

const incomeOrder = [
  "프로그램",
  "숙박비",
  "식사비",
  "재료비",
  "기타",
  "할인율",
]



const action = {
    getList : createAction(`${name}/getList`),
    getTempList : createAction(`${name}/getTempList`),
    getTempData : createAction(`${name}/getTempData`),
    getProgramMngList : createAction(`${name}/getProgramMngList`),
    getTeacherMngList : createAction(`${name}/getTeacherMngList`),
    
  }

export const {getState, reducer, actions} = createCustomSlice({
  name,
  initialState,
  action, 
  reducers: {
    onReset : (state)=>{
      state.basicInfo = initialState.basicInfo;
      state.programList = initialState.programList;
      state.teacherList = initialState.teacherList;
      state.teacherExtraList = initialState.teacherExtraList;
      state.customList = initialState.customList;
      state.customExtraList = initialState.customExtraList;
      state.income = initialState.income;
      state.incomeExtraList = initialState.incomeExtraList;
    },
    getList_SUCCESS : (state, {payload})=>{
      state.rows = payload.data.map((i, idx)=>({...i, index : idx +1}));
    },
    //임시저장항목조회
    getTempData_SUCCESS : (state, {payload : {data }})=>{
      const {basicInfo , expense, income} = data;
      const _info = {...initialState.basicInfo,  ...basicInfo[0]};
      // 기본정보 
      state.basicInfo = _info;
      if (_info.PROGRAM_IN_OUT.trim() === '') {
        state.programList =  [];
      }else{
      const _programList =  _info.PROGRAM_IN_OUT.split(',').reduce((acc, curr, idx) => {                
                const rowNumber = Math.floor(idx / 5);
                if (!acc[rowNumber]) {
                    acc[rowNumber] = { id: rowNumber + 1 };
                }
                const colName = ["programName","col1","col2","col3","col4"][idx % 5];
                acc[rowNumber][colName] = curr;
                return acc;
            }, []);

        state.programList = _programList;
      }

      const seenTypes = new Set();
      const sortedList = [];
      const extraList = [];
      
      expense.map(i=> ({...i, id : i.EXPENSE_SEQ, TITLE : i.EXPENSE_TYPE})).forEach(item => {
        const { EXPENSE_TYPE } = item;        
        if (order.includes(EXPENSE_TYPE)) {
          if (seenTypes.has(EXPENSE_TYPE)) {
            extraList.push(item);
          } else {
            sortedList.push(item);
            seenTypes.add(EXPENSE_TYPE);
          }
        } else {
          extraList.push(item);
        }
      });

      sortedList.sort((a, b) => order.indexOf(a.EXPENSE_TYPE) - order.indexOf(b.EXPENSE_TYPE));
      
      state.teacherList= sortedList.filter(i=> i.EXPENSE_TYPE.includes("강사"))
      state.teacherExtraList= extraList.filter(i=> i.EXPENSE_TYPE.includes("강사"))
      
      state.customList= sortedList.filter(i=> i.EXPENSE_TYPE.includes("고객"))
      state.customExtraList= extraList.filter(i=> i.EXPENSE_TYPE.includes("고객"))

      // state.incomeExtraList= extraList.filter(i=> i.EXPENSE_TYPE.includes("고객"))

      // 수입금액 
      const seenTypes2 = new Set();
      const sortedList2 = [];
      const extraList2 = [];
      
      income.map(i=> ({...i, id : i.INCOME_SEQ, TITLE : i.INCOME_TYPE})).forEach(item => {
        const { INCOME_TYPE } = item;        
        if (incomeOrder.includes(INCOME_TYPE)) {
          if (seenTypes2.has(INCOME_TYPE)) {
            extraList2.push(item);
          } else {
            sortedList2.push(item);
            seenTypes2.add(INCOME_TYPE);
          }
        } else {
          extraList2.push(item);
        }
      });

    
      const updateMap = new Map(sortedList2.map(item => [item.INCOME_TYPE, item]));

      const resultArray = initialState.income.map(item => ({
        ...item,
        ...(updateMap.get(item.INCOME_TYPE) || {}),
      }));
      state.income= resultArray;
      state.incomeExtraList= extraList2;
      


    },
    //임시저장목록
    getTempList_SUCCESS : (state, {payload : {data}})=>{
      state.tempList = data.map(i=> ({...i, label : `${i.AGENCY} [${i.OPENDAY}]` , value : i.BASIC_INFO_SEQ}));
    }, 


    setBasicInfo : (state, {payload : {key , value}})=>{
      state.basicInfo[key] = value;
    },


    // 배열의 값을 바꾼다 .
    setArrTargetChange  : (state, {payload : {target, index, name, value}})=>{
      state[target][index][name] = value;
    },
    
    // 배열의 값을 바꾼다 .
    setArrTargetIdChange  : (state, {payload : {target, id, name, value}})=>{
    
      state[target] = state[target].map((i,idx)=> ({...i, [name] : i.id === id ? value : i[name]}));
    },
    // Row 추가 
    addArrTarget : (state, {payload : {target, value}})=>{
      state[target] = state[target].concat({...value, id : v4()})
    },
    removeArrTarget : (state, {payload : {target, id}})=>{
      state[target] = state[target].filter(i=> i.id !== id)
    },



    getProgramMngList_SUCCESS :(state, {payload : {data}})=>{
      state.programMngList = data;
    },

    
    getTeacherMngList_SUCCESS :(state, {payload : {data}})=>{
      state.teacherMngList = data;
    },



  }
});

