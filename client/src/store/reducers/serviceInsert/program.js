import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';
import Swal from "sweetalert2";


const name ="serviceInsert/program";


const initRowData =   {
  id : "1", 
  chk : false, 
  PROGRAM_SEQ : "",
  SEX : "미기재", // 성별
  AGE : "", // 연령
  RESIDENCE : "미기재", // 거주지
  JOB : "미기재", // 직업
  SCORE1 : "",
  SCORE2 : "",
  SCORE3 : "",
  SCORE4 : "",
  SCORE5 : "",
  SCORE6 : "",
  SCORE7 : "",
  SCORE8 : "",
  SCORE9 : "",
  ETC_OPINION : "",
  TYPE : "참여자", // 참여구분
}

const initialState = {
    type : "program_satisfaction",
    deleteRow : [], 
    rows : [
    {
        id : "1", 
        chk : false, 
        PROGRAM_SEQ : "",
        SEX : "미기재", // 성별
        AGE : "", // 연령
        RESIDENCE : "미기재", // 거주지
        JOB : "미기재", // 직업
        SCORE1 : "",
        SCORE2 : "",
        SCORE3 : "",
        SCORE4 : "",
        SCORE5 : "",
        SCORE6 : "",
        SCORE7 : "",
        SCORE8 : "",
        SCORE9 : "",
        ETC_OPINION : "",
        TYPE : "참여자", // 참여구분
    }

    ],
    searchInfo : {
        // OPENDAY : "2021-10-16", //시작일자
        // AGENCY : "태백시장애인복지관", // 기관명
        // EVAL_DATE : "2021-10-16", // 실시일자
        // PROGRAM_NAME : "우드버닝", // 프로그램명
        OPENDAY : "", //시작일자
        AGENCY : "", // 기관명
        EVAL_DATE : "", // 실시일자
        PROGRAM_NAME : "", // 프로그램명
        PTCPROGRAM : "", // 참여일정
        TEACHER : "", // 강사명
        PLACE : "", // 장소 
        BUNYA : "", // 분야 
    },
  programItem: [],
  programList : [], 
  teacherItem :[],  
};

const action = {
  getProgramList  : createAction(`${name}/getProgramList`),
  getTeacherList  : createAction(`${name}/getTeacherList`),
  getUserTemp : createAction(`${name}/getUserTemp`),
  getPreviousProgramList : createAction(`${name}/getPreviousProgramList`, (data) => ({payload : data})),
  getPreviousProgramListAfterSave : createAction(`${name}/getPreviousProgramListAfterSave`, (data) => ({payload : data}))
}


export const {getState, reducer, actions} = createCustomSlice({
  name,
  initialState,
  action, 
  reducers: {
    getProgramList_SUCCESS : (state, {payload : {data}})=>{
      state.programList = data;
      state.programItem = data.map(({name, bunya})=> ({label : `${name}[${bunya}]` , value : name}))
    },
    getTeacherList_SUCCESS : (state, {payload : {data}})=>{
      state.teacherItem = data.map(({name})=> ({label : name , value : name}))
    },

    addRow  : (state)=>{
      state.rows = state.rows.concat({...initialState.rows[0], id: v4()})
    }, 
    removeRow : (state, {payload})=>{

        const filteredList = payload.map(i=> i.id);
        const deleteSeq = payload.map(i=> i.PROGRAM_SEQ); // seq

        state.deleteRow = [...new Set([...state.deleteRow, ...deleteSeq])];
        state.rows = state.rows.filter((i)=> !filteredList.includes(i.id))
    },
    changeValue : (state, {payload : {index, key , value}})=>{
      state.rows[index][key] = value;
    }, 
    setSearchInfo : (state, {payload : {key, value}})=>{
      state.searchInfo[key] = value;
    },
    setDate : (state, {payload })=>{
      state.searchInfo.OPENDAY = payload;
      state.searchInfo.EVAL_DATE = payload;
    },


    getPreviousProgramList_SUCCESS : (state, {payload  : {data}})=>{
      if(data.length === 0 ){
        Swal.fire({ icon: 'warning', title: '확인', text: "기존 입력된 데이터가 없습니다.", })
      }else{
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다."});
        state.rows = data.map(i=> ({...i, id : v4(), chk : false}));
        
      }
    },
    getPreviousProgramListAfterSave_SUCCESS : (state, {payload  : {data}})=>{
        state.rows = data.map(i=> ({...i, id : v4(), chk : false}));
    },

    setAllData  : (state, {payload : {type, value}})=>{
      state.rows = state.rows.map(i=> ({...i, 
          [type] : value      
      }))
    },
    setProgramInfo : (state, {payload : {program, bunya}})=>{
      state.searchInfo.PROGRAM_NAME= program;
      state.searchInfo.BUNYA= bunya;
    },
    // 입력유저관리 
    getUserTemp_SUCCESS : (state, {payload : {data}})=>{
      state.rows  =data.map(i=> ({
        ...initialState.rows[0],
        id : v4(), 
        chk : false, 
        SEX:i.sex, // 성별
        AGE:i.age, // 연령
        RESIDENCE:i.residence, // 거주지
        JOB:i.job,  
      }))
    },
    setExcelData : (state, {payload})=>{
      const _rows = payload.map(i=>({
        ...initRowData, 
        id : v4(), 
        SEX:i.col1, // 성별
        AGE:i.col2, // 연령
        RESIDENCE:i.col3, // 거주지
        JOB:i.col4,
        TYPE : i.col5, // 참여구분
        SCORE1:i.col6,
        SCORE2:i.col7,
        SCORE3:i.col8,
        SCORE4:i.col9,
        SCORE5:i.col10,
        SCORE6:i.col11,
        SCORE7:i.col12,
        SCORE8:i.col13,
        SCORE9:i.col14,        
      }))

      state.rows = _rows;
    }


  }
});

