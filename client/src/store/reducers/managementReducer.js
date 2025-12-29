import { createAction, current } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';

const name ="management";


const initUserTemp = {
  seq : "", 
  id : "",
  name : "", 
  sex : "", 
  age : "", 
  residence : "", 
  job : "", 
  jumin : "", 
  idx : "1",
}

const _initUserTemp = new Array(20).fill(null).map(i=> ({...initUserTemp, idx : v4()}))


const initialState = {
    codeList : [],
    userMng : {
      rows : [], 
      detail : {
        displayName : "", 
        user_id : "", 
        user_name : "", 
        user_pwd : "",
        user_pwd_check : "",
        value : "", 
      }
    },
    // regUser : [],  // 등록된 사용자 목록
    history : [],   // 히스토리 


    programMng : {

      rows : [], 
      newInfo : {
        name : "", 
        bunya : "", 
      },
      updateInfo : {
        program_seq : "", 
        name : "", 
        bunya : "", 
      }
    }, 
    teacherMng : {
      rows : [], 
      newInfo : {
        name : "", 
        phone : "", 
      },
      updateInfo : {
        teacher_seq : "", 
        name : "", 
        phone : "", 
      }
    }, 

    userTempAgency : [],
    userTemp : _initUserTemp



};

const action = {
    getBaseInfoPage : createAction(`${name}/getBaseInfoPage`),
    getRegUser : createAction(`${name}/getRegUser`),
    getAllHistories : createAction(`${name}/getAllHistories`),
    getHistory : createAction(`${name}/getHistory`),
    getProgramMngList : createAction(`${name}/getProgramMngList`),
    getTeacherMngList : createAction(`${name}/getTeacherMngList`),

    getUserTempAgency : createAction(`${name}/getUserTempAgency`),
    getUserTemp : createAction(`${name}/getUserTemp`),
  
}

const codNameList  =[
  {type : "SUPPORT", name : "단체성격"},
  {type : "INCOME_TYPE", name : "참여형태"},
  {type : "PART_TYPE", name : "참가자유형"},
  {type : "BIZ_PURPOSE", name : "사업구분"},
  {type : "PROGRAM_IN_OUT", name : "프로그램"},
  {type : "SERVICE_TYPE", name : "서비스유형"},
  {type : "AGE_TYPE", name : "연령대"},
]
// 핸드폰번호양식생성
  const formatPhoneNumber = inputNumber => /^(\d{3})(\d{4})(\d{4})$/.test(inputNumber) ? `${RegExp.$1}-${RegExp.$2}-${RegExp.$3}` : inputNumber;

export const {getState, reducer, actions} = createCustomSlice({
    name,
    initialState,
    action, 
    reducers: {

      initUserTemp : (state)=> {
        state.userTemp = initialState.userTemp;
      },
        getBaseInfoPage_SUCCESS : (state, {payload })=>{
            const codeList = Object.entries(payload.data).reduce((acc, [type, values]) => {
              if (type !== 'SEQ') {
                acc.push({
                  type,
                  name: codNameList.find(codName => codName.type === type)?.name || "",
                  items: values.split(','),
                });
              }
              return acc;
            }, []);
            state.codeList = codeList
        },

      // 등록사용자 조회 
      getRegUser_SUCCESS : (state, {payload})=>{
        state.userMng.rows = payload.data.map(i=> ({...i, chk : false}))
        state.userMng.detail =initialState.userMng.detail;
      },
      onChangeUserDetailInfo : (state, {payload :{key, value}})=>{
        state.userMng.detail[key] = value;

      },
      // 모든히스토리 조회 
      getAllHistories_SUCCESS : (state, {payload})=>{
        state.history = payload.data
      },
      // 사용자 히스토리  조회 
      getHistory_SUCCESS : (state, {payload})=>{
        state.history = payload.data
      },


      // 프로그램 관리
      // 조회
      getProgramMngList_SUCCESS  : (state, {payload : {data}})=>{
        state.programMng.rows = data.map((i, index)=> ({...i, index : index +1}));
        state.programMng.newInfo = initialState.programMng.newInfo
        state.programMng.updateInfo = initialState.programMng.updateInfo
      },
      onChangeProgramMngInfo : (state, {payload : {target, key, value}})=>{
        state.programMng[target][key] = value;
      }, 
      setProgramUpdateInfo : (state, {payload})=>{
        state.programMng.updateInfo = payload;
      },

      // 프로그램 관리
      // 조회
      getTeacherMngList_SUCCESS  : (state, {payload : {data}})=>{
        state.teacherMng.rows = data.map((i,index)=> 
        ({...i
          , index : index +1
          , phoneDisplay : formatPhoneNumber(i.phone)
        })
        );
        state.teacherMng.newInfo = initialState.teacherMng.newInfo
        state.teacherMng.updateInfo = initialState.teacherMng.updateInfo
      },
      onChangeTeacherMngInfo : (state, {payload : {target, key, value}})=>{
        state.teacherMng[target][key] = value;
      }, 
      setTeacherUpdateInfo : (state, {payload})=>{
        state.teacherMng.updateInfo = payload;
      },



      // 입력유저관리 
      getUserTemp_SUCCESS :(state, {payload : {data}})=>{
        state.userTemp = data.length > 0 ? data.map(i=> ({...i, idx : v4()})) : initialState.userTemp
      },
      // 입력유저관리 
      getUserTempAgency_SUCCESS :(state, {payload : {data}})=>{
        state.userTempAgency = data; 
        state.userTemp = initialState.userTemp;
      },
    
      onUserTempAddRow : (state)=>{
        state.userTemp = state.userTemp.concat({...initUserTemp, idx : v4()})
      },
      onUserTempRemoveRow : (state, {payload})=>{
        state.userTemp = state.userTemp.filter(i=> i.idx !==payload); 
      },
      onChangeUserTemp : (state, {payload: {index, key, value}})=>{
        state.userTemp[index][key] = value;
      },
      setUserTempData : (state)=>{
        const userTemp = current(state.userTemp);
        state.userTemp = state.userTemp.map(i=>({

            ...i, 
            sex : userTemp[0].sex, 
            age : userTemp[0].age, 
            residence : userTemp[0].residence, 
            job : userTemp[0].job, 

        }))
      }

    }
});
