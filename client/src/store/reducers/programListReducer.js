import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";

const name ="programList";

const initialState = {
    tabIndex : "1", 
    rows : [] , 
    detailInfo : {
      AGENCY  : "",
      OM : "",
      OPENDAY : "", // 참여일자 
      DAYS_TO_STAY : "", // 체류일자
      RESIDENCE : "", // 지역
      PART_MAN_CNT : "", // 참여자(남)
      PART_WOMAN_CNT : "", // 참여자(여)
      LEAD_MAN_CNT : "", // 인솔자(남)
      LEAD_WOMAN_CNT : "", // 인솔자(여)
      SUPPORT : "", //지원사항
      INCOME_TYPE : "", // 수입구분
      PART_TYPE : "", // 참가자유형
      AGE_TYPE : "", // 연령대
      BIZ_PURPOSE : "", // 사업구분
      PROGRAM_IN_OUT : "",

      ROOM_PART_PEOPLE  : "",     // 참여자 - 인원
      ROOM_PART_ROOM  : "",     //   참여자 - 객실
      MEAL_TYPE  : "",    //  식사 횟수
      MEAL_PART  : "",    //  참여자 - 식사

      ROOM_LEAD_PEOPLE  : "",     //    인솔자 - 인원
      ROOM_LEAD_ROOM  : "",     //   인솔자 - 객실
      MEAL_LEAD  : "",    //  인솔자 - 식사

      ROOM_ETC_PEOPLE  : "",    //  기타 -인원
      ROOM_ETC_ROOM  : "",    //  기타- 객실
      MEAL_ETC : "", // 기타 -식사
    },
    serviceList : {
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
      score17: 0,
      score18: 0,
    }, 
    effect : {
      counsel : [], 
      healing : [], 
      hrv : [], 
      prevent : [], 
    },
    inExpense : {
      income : [], 
      expense : [] 
    }
};


const action = {
    getList : createAction(`${name}/getList`),
    getListDate : createAction(`${name}/getListDate`),
    getDetail : createAction(`${name}/getDetail`),
    
    
  }


  const getTotalPeople = ({LEAD_MAN_CNT, LEAD_WOMAN_CNT,PART_MAN_CNT, PART_WOMAN_CNT })=>{
    return parseFloat(LEAD_MAN_CNT) + parseFloat(LEAD_WOMAN_CNT)+parseFloat(PART_MAN_CNT)+ parseFloat(PART_WOMAN_CNT)

  }


export const {getState, reducer, actions} = createCustomSlice({
  name,
  initialState,
  action, 
  reducers: {
    getList_SUCCESS : (state, {payload})=>{
      state.rows = payload.data.map((i, idx)=>({...i, index : idx +1 , totalPeople : getTotalPeople(i)}));
      state.tabIndex = initialState.tabIndex;
    },
    getDetail_SUCCESS : (state, {payload  : {data  : {basicInfo, serviceList, programSaf}, effect, inExpense} })=>{
      state.tabIndex = "2";
      state.detailInfo = basicInfo;

      const formattedObj = {};

      for (const key in serviceList[0]) {
        const value = serviceList[0][key];
        const numberValue = parseFloat(value);
        formattedObj[key] = !isNaN(numberValue) ? numberValue.toFixed(2) : "Invalid Number";
      }
    
      state.serviceList = formattedObj;

      state.programSaf = programSaf;
      state.effect = effect;
      state.inExpense = inExpense;
    }
    
  }
});

