import { createSlice } from '@reduxjs/toolkit';

export const masterSlice = createSlice({
  name: 'Master',
  initialState: {
    token : null,
    masterData : null,
    lastRollover: {}
  },
  reducers: {
    setMasterData:(state,action)=>{
      state.userData= action.payload
    },
    setToken  :(state,action)=>{
      state.token = action.payload
    },
    setLastRollover: (state,action)=>{
        state.lastRollover = action.payload
    },
    masterLogout : (state,action)=>{
      state.token = null
      state.masterData = null
    },
  },
});

export const { setMasterData,setToken,masterLogout,setLastRollover } = masterSlice.actions;

export default masterSlice.reducer;