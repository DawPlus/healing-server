import { createSlice } from '@reduxjs/toolkit';



const name = "common";
const initialState = {
    isLogin : false,
    isLoading : false,
};

const common = createSlice({
  name,
  initialState,
  reducers: {
    setValue : (state, {payload: {key , value}})=>{
        state[key] = value;
    },
    startLoading : (state)=>{
      state.isLoading = true;
    },
    finishLoading : (state)=>{
      state.isLoading = false;
    }
    
  }
});




export const getState = s=> s[name];
export const actions = common.actions;
export default common.reducer;
