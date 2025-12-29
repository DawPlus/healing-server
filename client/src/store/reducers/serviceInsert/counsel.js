import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';
import Swal from "sweetalert2";

const name ="serviceInsert/counsel";

const key = "COUNSEL_SEQ"

const initRow = {
  id : "1", 
  chk : false, 
  [key] : "",
  NAME  : "",
  SEX  : "",
  AGE  : "",
  RESIDENCE  : "", // 지역
  JOB  : "",
  PAST_STRESS_EXPERIENCE  : "", //과거 상담·치유서비스 경험
  SCORE1  : "",
  SCORE2  : "",
  SCORE3  : "",
  SCORE4  : "",
  SCORE5  : "",
  SCORE6  : "",
  SCORE7  : "",
  SCORE8  : "",
  SCORE9  : "",
  SCORE10  : "",
  SCORE11  : "",
  SCORE12  : "",
  SCORE13  : "",
  SCORE14  : "",
  SCORE15  : "",
  SCORE16  : "",
  SCORE17  : "",
  SCORE18  : "",
  SCORE19  : "",
  SCORE20  : "",
  SCORE21  : "",
  SCORE22  : "",
  SCORE23  : "",
  SCORE24  : "",
  SCORE25  : "",
  SCORE26  : "",
  SCORE27  : "",
  SCORE28  : "",
  SCORE29  : "",
  SCORE30  : "",
  SCORE31  : "",
  SCORE32  : "",
  SCORE33  : "",
  SCORE34  : "",
  SCORE35  : "",
  SCORE36  : "",
  SCORE37  : "",
  SCORE38  : "",
  SCORE39  : "",
  SCORE40  : "",
  SCORE41  : "",
  SCORE42  : "",
  SCORE43  : "",
  SCORE44  : "",
  SCORE45  : "",
  SCORE46  : "",
  SCORE47  : "",
  SCORE48  : "",
  SCORE49  : "",
  SCORE50  : "",
  SCORE51  : "",
  SCORE52  : "",
  SCORE53  : "",
  SCORE54  : "",
  SCORE55  : "",
  SCORE56  : "",
  SCORE57  : "",
  SCORE58  : "",
  SCORE59  : "",
  SCORE60  : "",
  SCORE61  : "",
  SCORE62  : "",
}


const initialState = {
    type : "counsel_service",
    deleteRow : [], 
    rows : [
      {
        id : "1", 
        chk : false, 
        [key] : "",
        NAME  : "",
        SEX  : "",
        AGE  : "",
        RESIDENCE  : "", // 지역
        JOB  : "",
        PAST_STRESS_EXPERIENCE  : "", //과거 상담·치유서비스 경험
        SCORE1  : "",
        SCORE2  : "",
        SCORE3  : "",
        SCORE4  : "",
        SCORE5  : "",
        SCORE6  : "",
        SCORE7  : "",
        SCORE8  : "",
        SCORE9  : "",
        SCORE10  : "",
        SCORE11  : "",
        SCORE12  : "",
        SCORE13  : "",
        SCORE14  : "",
        SCORE15  : "",
        SCORE16  : "",
        SCORE17  : "",
        SCORE18  : "",
        SCORE19  : "",
        SCORE20  : "",
        SCORE21  : "",
        SCORE22  : "",
        SCORE23  : "",
        SCORE24  : "",
        SCORE25  : "",
        SCORE26  : "",
        SCORE27  : "",
        SCORE28  : "",
        SCORE29  : "",
        SCORE30  : "",
        SCORE31  : "",
        SCORE32  : "",
        SCORE33  : "",
        SCORE34  : "",
        SCORE35  : "",
        SCORE36  : "",
        SCORE37  : "",
        SCORE38  : "",
        SCORE39  : "",
        SCORE40  : "",
        SCORE41  : "",
        SCORE42  : "",
        SCORE43  : "",
        SCORE44  : "",
        SCORE45  : "",
        SCORE46  : "",
        SCORE47  : "",
        SCORE48  : "",
        SCORE49  : "",
        SCORE50  : "",
        SCORE51  : "",
        SCORE52  : "",
        SCORE53  : "",
        SCORE54  : "",
        SCORE55  : "",
        SCORE56  : "",
        SCORE57  : "",
        SCORE58  : "",
        SCORE59  : "",
        SCORE60  : "",
        SCORE61  : "",
        SCORE62  : "",
    }

    ],
    searchInfo : {
        OPENDAY : "", //시작일자
        AGENCY : "", // 기관명
        EVAL_DATE : "", // 실시일자
       // PTCPROGRAM  : "", // 참여일정
        COUNSEL_CONTENTS : "",
        PV : "", // 시점 (사전은 시작으로 변경됨)
        SESSION1 :"", // 회기 시점
        SESSION2 :"", // 회기 시점
    }
  
};

const action = {
  getUserTemp : createAction(`${name}/getUserTemp`),
  //getList : createAction(`${name}/getList`, (data) => ({payload : data})),
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
        const filteredList = payload.map(i=> i.id);
        const deleteSeq = payload.map(i=> i[key]); // seq
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
        state.rows = data.map(i=> ({...i, id : v4(), chk : false}));
        
      }
    },
    getListAfterSave_SUCCESS : (state, {payload  : {data}})=>{
        state.rows = data.map(i=> ({...i, id : v4(), chk : false}));
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
        id : v4(), 
        NAME : i.name, 
        SEX:i.sex, // 성별
        AGE:i.age, // 연령
        RESIDENCE:i.residence, // 거주지
        JOB:i.job,  
      }))
    },
    setExcelData : (state, {payload})=>{
      console.log(payload)
      const _rows = payload.map(i=>({
        ...initRow, 
        id : v4(), 
        NAME : i.col1, 
        SEX:i.col2, // 성별
        AGE:i.col3, // 연령
        RESIDENCE:i.col4, // 거주지
        JOB:i.col5,
        PAST_STRESS_EXPERIENCE : i.col6, // 참여구분
        SCORE1  : i.col7,
        SCORE2  : i.col8,
        SCORE3  : i.col9,
        SCORE4  : i.col10,
        SCORE5  : i.col11,
        SCORE6  : i.col12,
        SCORE7  : i.col13,
        SCORE8  : i.col14,
        SCORE9  : i.col15,
        SCORE10  : i.col16,
        SCORE11  : i.col17,
        SCORE12  : i.col18,
        SCORE13  : i.col19,
        SCORE14  : i.col20,
        SCORE15  : i.col21,
        SCORE16  : i.col22,
        SCORE17  : i.col23,
        SCORE18  : i.col24,
        SCORE19  : i.col25,
        SCORE20  : i.col26,
        SCORE21  : i.col27,
        SCORE22  : i.col28,
        SCORE23  : i.col29,
        SCORE24  : i.col30,
        SCORE25  : i.col31,
        SCORE26  : i.col32,
        SCORE27  : i.col33,
        SCORE28  : i.col34,
        SCORE29  : i.col35,
        SCORE30  : i.col36,
        SCORE31  : i.col37,
        SCORE32  : i.col38,
        SCORE33  : i.col39,
        SCORE34  : i.col40,
        SCORE35  : i.col41,
        SCORE36  : i.col42,
        SCORE37  : i.col43,
        SCORE38  : i.col44,
        SCORE39  : i.col45,
        SCORE40  : i.col46,
        SCORE41  : i.col47,
        SCORE42  : i.col48,
        SCORE43  : i.col49,
        SCORE44  : i.col50,
        SCORE45  : i.col51,
        SCORE46  : i.col52,
        SCORE47  : i.col53,
        SCORE48  : i.col54,
        SCORE49  : i.col55,
        SCORE50  : i.col56,
        SCORE51  : i.col57,
        SCORE52  : i.col58,
        SCORE53  : i.col59,
        SCORE54  : i.col60,
        SCORE55  : i.col61,
        SCORE56  : i.col62,
        SCORE57  : i.col63,
        SCORE58  : i.col64,
        SCORE59  : i.col65,
        SCORE60  : i.col66,
        SCORE61  : i.col67,
        SCORE62  : i.col68,
      }))
      state.rows = _rows;
    }
  }
});

