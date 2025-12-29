import { createSlice } from '@reduxjs/toolkit';


export const createCustomSlice = ({name, initialState, reducers, action})=>{

  const custom = createSlice({
    name,
    initialState,
    reducers: {
      initState  : (state)=> initialState,
      initKeyState : (state, {payload}) => {
        state[payload] = initialState[payload]
      },
      setValue : (state, {payload: {key , value}})=>{
          state[key] = value;
      },
      ...reducers
    }
  });

  
  const getState = (obj) => name.split('/').reduce((acc, key) => acc?.[key], obj);
  
  
  return {
      reducer : custom.reducer,
      actions : {
        ...action,
        ...custom.actions
      },
      getState, 
  }

}
export default createCustomSlice;

