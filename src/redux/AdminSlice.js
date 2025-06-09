import { createSlice } from '@reduxjs/toolkit';

export const adminSlice = createSlice({
  name: 'Admin',
  initialState: {
    isAuthenticated: false,
    adminData : null,
  },
  reducers: {
    setAdminData:(state,action)=>{
      state.userData= action.payload
    },
    setIsAuthenticated  :(state,action)=>{
      state.isAuthenticated = true
    },
    adminLogout : (state,action)=>{
      state.isAuthenticated = false
      state.adminData = null
    },
  },
});

export const { setAdminData,setIsAuthenticated,adminLogout } = adminSlice.actions;

export default adminSlice.reducer;