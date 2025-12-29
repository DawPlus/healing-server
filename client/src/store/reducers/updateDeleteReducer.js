import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";

const name ="updateDelete";

const initialState = {
    rows : [] ,
    type : 1, // 입력양식 
};

const action = {
    getList : createAction(`${name}/getList`)

}



export const {getState, reducer, actions} = createCustomSlice({
  name,
  initialState,
  action, 
  reducers: {
    getList_SUCCESS : (state, {payload : {data} })=>{
      state.rows = data.rows.map((i, idx)=> ({...i, INDEX : idx + 1}));
    }

  }
});

