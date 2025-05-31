import { createSlice } from '@reduxjs/toolkit';

export const managerSlice = createSlice({
  name: 'Manager',
  initialState: {
    token : null,
    managerData : {},
    lastRollover: {}
  },
  reducers: {
    setManagerData:(state,action)=>{
      state.managerData= action.payload
    },
    setManagerToken  :(state,action)=>{
      state.token = action.payload
    },
    setLastRollover: (state,action)=>{
      state.lastRollover = action.payload
    },
    managerLogout : (state,action)=>{
      state.token = null
      state.managerData = null
    },
  },
});

export const { setManagerData,setManagerToken,setLastRollover,setManagerId,managerLogout} = managerSlice.actions;

export default managerSlice.reducer;