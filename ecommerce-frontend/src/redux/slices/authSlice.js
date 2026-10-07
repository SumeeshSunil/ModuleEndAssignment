import { createSlice } from '@reduxjs/toolkit';
import { authenticate, loadProfile } from '../thunks/authThunks';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, checking: Boolean(sessionStorage.getItem('token')), error: '' },
  reducers: {
    logout(state) { state.user = null; state.error = ''; state.checking = false; },
    setUser(state, action) { state.user = action.payload; }
  },
  extraReducers: builder => {
    builder.addCase(authenticate.pending, state => { state.loading = true; state.error = ''; });
    builder.addCase(authenticate.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; });
    builder.addCase(authenticate.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    builder.addCase(loadProfile.fulfilled, (state, action) => { state.user = action.payload; state.checking = false; });
    builder.addCase(loadProfile.rejected, state => { state.user = null; state.checking = false; });
  }
});
export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
