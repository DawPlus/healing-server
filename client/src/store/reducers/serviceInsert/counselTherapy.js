import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";
import { v4 } from 'uuid';
import Swal from "sweetalert2";

const name = "serviceInsert/counselTherapy";

const initRowData = {
  idx: "",
  id: "",
  chk: false,
  COUNSEL_THERAPY_SEQ: "",
  SEX: "미기재", // 성별
  AGE: "", // 연령
  RESIDENCE: "미기재", // 거주지
  JOB: "",
  PAST_EXPERIENCE: "", // 과거 상담/치유서비스 경험
  // 변화동기 (2문항)
  SCORE1: "",
  SCORE2: "",
  // 신뢰(라포) (3문항)
  SCORE3: "",
  SCORE4: "",
  SCORE5: "",
  // 서비스이해 (2문항)
  SCORE6: "",
  SCORE7: "",
  // 조절실패 (3문항)
  SCORE8: "",
  SCORE9: "",
  SCORE10: "",
  // 현저성 (3문항)
  SCORE11: "",
  SCORE12: "",
  SCORE13: "",
  // 문제적결과 (4문항)
  SCORE14: "",
  SCORE15: "",
  SCORE16: "",
  SCORE17: "",
  // 낮은자기조절력 (6문항)
  SCORE18: "",
  SCORE19: "",
  SCORE20: "",
  SCORE21: "",
  SCORE22: "",
  SCORE23: "",
  // 부정정서 (3문항)
  SCORE24: "",
  SCORE25: "",
  SCORE26: "",
  // 편향된신념 (3문항)
  SCORE27: "",
  SCORE28: "",
  SCORE29: "",
  // 역기능적자기도식 (6문항)
  SCORE30: "",
  SCORE31: "",
  SCORE32: "",
  SCORE33: "",
  SCORE34: "",
  SCORE35: "",
  // 대인관계기술부족 (3문항)
  SCORE36: "",
  SCORE37: "",
  SCORE38: "",
  // 대인민감성 (4문항)
  SCORE39: "",
  SCORE40: "",
  SCORE41: "",
  SCORE42: "",
  // 관계/유능욕구충족 (2문항)
  SCORE43: "",
  SCORE44: "",
  // 긍정정서 (3문항)
  SCORE45: "",
  SCORE46: "",
  SCORE47: "",
  // 삶의만족 (3문항)
  SCORE48: "",
  SCORE49: "",
  SCORE50: "",
  // 자기이해 (4문항)
  SCORE51: "",
  SCORE52: "",
  SCORE53: "",
  SCORE54: "",
  // 자기수용 (3문항)
  SCORE55: "",
  SCORE56: "",
  SCORE57: "",
  // 마음관리기술/기회 (3문항)
  SCORE58: "",
  SCORE59: "",
  SCORE60: "",
  // 스마트폰활용역량 (2문항)
  SCORE61: "",
  SCORE62: ""
};

const initialState = {
  deleteRow: [],
  rows: [{ ...initRowData, idx: v4() }],
  searchInfo: {
    AGENCY: "",
    AGENCY_ID: null,
    NAME: "",
    OPENDAY: "",
    EVAL_DATE: "",
    PTCPROGRAM: "",
    SESSION1: "", // 회기 시점 (시작)
    SESSION2: "", // 회기 시점 (종료)
    PV: "", // 시점 (사전/사후)
    PAST_STRESS_EXPERIENCE: "", // 과거 스트레스 경험
  }
};

const action = {
  getUserTemp: createAction(`${name}/getUserTemp`),
  getPreviousCounselTherapyList: createAction(`${name}/getPreviousCounselTherapyList`, (data) => ({ payload: data })),
  getPreviousCounselTherapyListAfterSave: createAction(`${name}/getPreviousCounselTherapyListAfterSave`, (data) => ({ payload: data }))
};

export const { getState, reducer, actions } = createCustomSlice({
  name,
  initialState,
  action,
  reducers: {
    getPreviousCounselTherapyList: (state, { payload: { data } }) => {
      state.searchInfo = {
        ...state.searchInfo,
        ...data
      };
    },
    addRow: (state) => {
      state.rows = state.rows.concat({ ...initRowData, idx: v4() });
    },
    removeRow: (state, { payload }) => {
      const filteredList = payload.map(i => i.idx);
      const deleteSeq = payload.filter(i => i.COUNSEL_THERAPY_SEQ).map(i => i.COUNSEL_THERAPY_SEQ);

      state.deleteRow = [...new Set([...state.deleteRow, ...deleteSeq])];
      state.rows = state.rows.filter((i) => !filteredList.includes(i.idx));
    },
    changeValue: (state, { payload: { index, key, value } }) => {
      state.rows[index][key] = value;
    },
    setSearchInfo: (state, { payload: { key, value } }) => {
      state.searchInfo[key] = value;
    },
    setDate: (state, { payload }) => {
      state.searchInfo.OPENDAY = payload;
      state.searchInfo.EVAL_DATE = payload;
    },
    getPreviousCounselTherapyList_SUCCESS: (state, { payload: { data } }) => {
      if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: '확인', text: "기존 입력된 데이터가 없습니다." });
        state.rows = initialState.rows;
      } else {
        Swal.fire({ icon: 'warning', title: '확인', text: "이전에 작성했던 데이터를 불러옵니다." });
        state.rows = data.map(i => ({ ...i, idx: v4(), chk: false }));
        state.searchInfo = {
          ...state.searchInfo,
          PTCPROGRAM: data[0].PTCPROGRAM,
          SESSION1: data[0].SESSION1,
          SESSION2: data[0].SESSION2,
          PV: data[0].PV
        };
      }
    },
    getPreviousCounselTherapyListAfterSave_SUCCESS: (state, { payload: { data } }) => {
      state.rows = data.map(i => ({ ...i, idx: v4(), chk: false }));
    },
    getUserTemp_SUCCESS: (state, { payload: { data } }) => {
      state.rows = data.map(i => ({
        ...initRowData,
        idx: v4(),
        id: i.id,
        chk: false,
        SEX: i.sex,
        AGE: i.age,
        RESIDENCE: i.residence,
        JOB: i.job,
      }));
    },
    setAllData: (state, { payload: { type, value } }) => {
      state.rows = state.rows.map(i => ({
        ...i,
        [type]: value
      }));
    },
    setExcelData: (state, { payload }) => {
      const _rows = payload.map(i => ({
        ...initRowData,
        idx: v4(),
        SEX: i.col1,
        AGE: i.col2,
        RESIDENCE: i.col3,
        JOB: i.col4,
        PAST_EXPERIENCE: i.col5,
        SCORE1: i.col6,
        SCORE2: i.col7,
        SCORE3: i.col8,
        SCORE4: i.col9,
        SCORE5: i.col10,
        SCORE6: i.col11,
        SCORE7: i.col12,
        SCORE8: i.col13,
        SCORE9: i.col14,
        SCORE10: i.col15,
        SCORE11: i.col16,
        SCORE12: i.col17,
        SCORE13: i.col18,
        SCORE14: i.col19,
        SCORE15: i.col20,
        SCORE16: i.col21,
        SCORE17: i.col22,
        SCORE18: i.col23,
        SCORE19: i.col24,
        SCORE20: i.col25,
        SCORE21: i.col26,
        SCORE22: i.col27,
        SCORE23: i.col28,
        SCORE24: i.col29,
        SCORE25: i.col30,
        SCORE26: i.col31,
        SCORE27: i.col32,
        SCORE28: i.col33,
        SCORE29: i.col34,
        SCORE30: i.col35,
        SCORE31: i.col36,
        SCORE32: i.col37,
        SCORE33: i.col38,
        SCORE34: i.col39,
        SCORE35: i.col40,
        SCORE36: i.col41,
        SCORE37: i.col42,
        SCORE38: i.col43,
        SCORE39: i.col44,
        SCORE40: i.col45,
        SCORE41: i.col46,
        SCORE42: i.col47,
        SCORE43: i.col48,
        SCORE44: i.col49,
        SCORE45: i.col50,
        SCORE46: i.col51,
        SCORE47: i.col52,
        SCORE48: i.col53,
        SCORE49: i.col54,
        SCORE50: i.col55,
        SCORE51: i.col56,
        SCORE52: i.col57,
        SCORE53: i.col58,
        SCORE54: i.col59,
        SCORE55: i.col60,
        SCORE56: i.col61,
        SCORE57: i.col62,
        SCORE58: i.col63,
        SCORE59: i.col64,
        SCORE60: i.col65,
        SCORE61: i.col66,
        SCORE62: i.col67
      }));

      state.rows = _rows;
    }
  }
}); 