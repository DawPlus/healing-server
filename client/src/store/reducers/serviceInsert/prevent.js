import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';
import Swal from "sweetalert2";

const name ="serviceInsert/prevent";

const key = "PREVENT_SEQ"

const initRow = {
  id : "1", 
  chk : false, 
  'PREVENT_SEQ' : "",
  'NAME'  : "",
  'SEX'  : "",
  'AGE'  : "",
  'RESIDENCE'  : "",
  'JOB'  : "",
  'PAST_STRESS_EXPERIENCE'  : "",
  'SCORE1'  : "",
  'SCORE2'  : "",
  'SCORE3'  : "",
  'SCORE4'  : "",
  'SCORE5'  : "",
  'SCORE6'  : "",
  'SCORE7'  : "",
  'SCORE8'  : "",
  'SCORE9'  : "",
  'SCORE10'  : "",
  'SCORE11'  : "",
  'SCORE12'  : "",
  'SCORE13'  : "",
  'SCORE14'  : "",
  'SCORE15'  : "",
  'SCORE16'  : "",
  'SCORE17'  : "",
  'SCORE18'  : "",
  'SCORE19'  : "",
  'SCORE20'  : "",
}

const initialState = {
    type : "prevent_service",
    deleteRow : [], 
    rows : [
      {
        id : "1", 
        chk : false, 
        [key] : "",
        'NAME'  : "",
        'SEX'  : "",
        'AGE'  : "",
        'RESIDENCE'  : "",
        'JOB'  : "",
        'PAST_STRESS_EXPERIENCE'  : "",
        'SCORE1'  : "",
        'SCORE2'  : "",
        'SCORE3'  : "",
        'SCORE4'  : "",
        'SCORE5'  : "",
        'SCORE6'  : "",
        'SCORE7'  : "",
        'SCORE8'  : "",
        'SCORE9'  : "",
        'SCORE10'  : "",
        'SCORE11'  : "",
        'SCORE12'  : "",
        'SCORE13'  : "",
        'SCORE14'  : "",
        'SCORE15'  : "",
        'SCORE16'  : "",
        'SCORE17'  : "",
        'SCORE18'  : "",
        'SCORE19'  : "",
        'SCORE20'  : "",
    }

    ],
    searchInfo : {
        OPENDAY : "", // 시작일자
        AGENCY : "", // 기관명
        AGENCY_ID : null, // 기관 ID
        NAME : "", // 이름
        EVAL_DATE : "", // 실시일자
        PTCPROGRAM  : "", // 참여일정
        PV : "", // 시점 (사전/사후)
        PAST_STRESS_EXPERIENCE : "", // 과거 힐링 서비스 경험
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

    // SET_PREVENT_ROWS 액션 추가 - API 응답에서 수신한 데이터로 rows 업데이트
    SET_PREVENT_ROWS: (state, {payload}) => {
      console.log("받은 데이터를 Redux store에 설정:", payload);
      
      // 데이터가 배열인지 확인
      if (Array.isArray(payload)) {
        try {
          // 각 항목에 필수 필드가 있는지 확인하고 없으면 기본값 설정
          const validRows = payload.map(row => {
            // id가 없거나 올바른 형식이 아니면 UUID 생성
            const id = (row.id && typeof row.id === 'string' && row.id.trim() !== '') ? row.id : v4();
            
            // 테이블에 표시되는 데이터 형식에 맞게 필드 구성
            const validRow = {
              ...initRow,  // 기본 필드 구조 사용
              ...row,      // API 데이터로 덮어쓰기
              id,          // ID는 항상 문자열이어야 함
              chk: false   // 체크박스는 항상 초기값 false
            };
            
            console.log("처리된 행:", validRow);
            return validRow;
          });
          
          // 보정된 데이터로 상태 업데이트
          console.log("최종 처리된 rows:", validRows);
          state.rows = validRows;
        } catch (error) {
          console.error("SET_PREVENT_ROWS 데이터 처리 중 오류:", error);
          // 오류 발생 시 기본 빈 행으로 초기화
          state.rows = [{...initialState.rows[0], id: v4()}];
        }
      } else {
        console.error("SET_PREVENT_ROWS: payload is not an array", payload);
        state.rows = [{...initialState.rows[0], id: v4()}];
      }
    },
    
    // CLEAR_PREVENT_ROWS 액션 추가 - rows 초기화
    CLEAR_PREVENT_ROWS: (state) => {
      console.log("Prevent rows 초기화");
      state.rows = [{...initialState.rows[0], id: v4()}];
      state.deleteRow = [];
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
      }))
      state.rows = _rows;
    }

  }
});

