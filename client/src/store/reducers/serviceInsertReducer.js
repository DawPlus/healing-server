import { createAction } from '@reduxjs/toolkit';
import createCustomSlice from "utils/createCustomSlice";

const name ="serviceInsert";

const initialState = {
  type : "serviceInsertForm",
  service : []
};

const action = {
    getList : createAction(`${name}/getList`)

}



export const {getState, reducer, actions} = createCustomSlice({
  name,
  initialState,
  action, 
  reducers: {
    getList_SUCCESS : (state, {payload: {data}})=>{
      
      state.rows = data;
    }

  }
});

