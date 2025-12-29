import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';
import Swal from "sweetalert2";

const name ="serviceInsert/vibra";

const key = "VIBRA_SEQ"

const initRow =   {
  idx : "1", 
  chk : false, 
  "VIBRA_SEQ" : "",
  ID:"",
  NAME:"",
  JUMIN:"",
  SEX:"",
  AGE:"",
  NUM1:"",
  NUM2:"",
  NUM3:"",
  NUM4:"",
  NUM5:"",
  NUM6:"",
  NUM7:"",
  NUM8:"",
  NUM9:"",
  NUM10:"",
}


const initialState = {
    type : "vibra_service",
    deleteRow : [], 
    rows : [
      {
        idx : "1", 
        chk : false, 
        [key] : "",
        ID:"",
        NAME:"",
        JUMIN:"",
        SEX:"",
        AGE:"",
        NUM1:"",
        NUM2:"",
        NUM3:"",
        NUM4:"",
        NUM5:"",
        NUM6:"",
        NUM7:"",
        NUM8:"",
        NUM9:"",
        NUM10:"",
    }

    ],
    searchInfo : {
        
        AGENCY : "", // 기관명
        DATE : "", // 실시일자
        EQUIPMENT  : "", // 측정기구
        PV : "", // 시점
    }
  
};

const action = {
  getUserTemp : createAction(`${name}/getUserTemp`),
 // getList : createAction(`${name}/getList`, (data) => ({payload : data})),
  getListAfterSave : createAction(`${name}/getListAfterSave`, (data) => ({payload : data}))
}


export const {getState, reducer, actions} = createCustomSlice({
  name,
  initialState,
  action, 
  reducers: {
    getList : (state, {payload})=>{
      state.searchInfo = {
        ...state.searchInfo, 
        ...payload.data
      }
    },
    addRow  : (state)=>{
      state.rows = state.rows.concat({...initialState.rows[0], id: v4()})
    }, 
    removeRow : (state, {payload})=>{
        const filteredList = payload.map(i=> i.idx);
        const deleteSeq = payload.map(i=> i[key]); // seq
        state.deleteRow = [...new Set([...state.deleteRow, ...deleteSeq])];
        state.rows = state.rows.filter((i)=> !filteredList.includes(i.idx))
    },
    changeValue : (state, {payload : {index, key , value}})=>{
      state.rows[index][key] = value;
    }, 
    setSearchInfo : (state, {payload})=>{
      // Handle both object format and key-value format
      if (payload.key && payload.value !== undefined) {
        state.searchInfo[payload.key] = payload.value;
      } else {
        state.searchInfo = {
          ...state.searchInfo,
          ...payload
        };
      }
    },

    setDate : (state, {payload })=>{
      state.searchInfo.OPENDAY = payload;
      state.searchInfo.EVAL_DATE = payload;
    },

    // For GraphQL integration - sets the entire rows array
    setRows: (state, {payload}) => {
      state.rows = payload;
    },

    initState: (state) => {
      return initialState;
    },

    setTest : (state) =>{
      const newData = state.rows.map((item) => {
        const updatedItem = { ...item };
        for (let key in updatedItem) {
          updatedItem[key] = "1";
        }
        return updatedItem;
      });
      state.rows = newData;
    },

    getList_SUCCESS : (state, {payload  : {data}})=>{
      if(data.length === 0 ){
        Swal.fire({ icon: 'warning', title: '확인', text: "기존 입력된 데이터가 없습니다.", })
      }else{
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다."});
        state.rows = data.map(i=> ({...i, idx : v4(), chk : false}));
        
      }
    },
    getListAfterSave_SUCCESS : (state, {payload  : {data}})=>{
        state.rows = data.map(i=> ({...i, idx : v4(), chk : false}));
    },
    setAllData  : (state, {payload : {type, value}})=>{
      state.rows = state.rows.map(i=> ({...i, 
          [type] : value      
      }))
    },
    // 입력유저관리 
    getUserTemp_SUCCESS : (state, {payload : {data}})=>{
      state.rows  =data.map(i=> ({
        ...initialState.rows[0],
        idx : v4(),
        ID :i.id, 
        SEX:i.sex, // 성별
        AGE:i.age, // 연령
        NAME : i.name, 
        JUMIN : i.jumin  
        
      }))
    },

    setExcelData : (state, {payload})=>{
      const _rows = payload.map(i=>({
        ...initRow, 
        idx : v4(), 

        ID  : i.col1,
        NAME  : i.col2,
        JUMIN  : i.col3,
        SEX  : i.col4,
        AGE  : i.col5,
        NUM1  : i.col6,
        NUM2  : i.col7,
        NUM3  : i.col8,
        NUM4  : i.col9,
        NUM5  : i.col10,
        NUM6  : i.col11,
        NUM7  : i.col12,
        NUM8  : i.col13,
        NUM9  : i.col14,
        NUM10  : i.col15,
      }))
      state.rows = _rows;
    }

  }
});

