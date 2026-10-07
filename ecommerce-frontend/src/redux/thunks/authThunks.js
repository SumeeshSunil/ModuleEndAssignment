import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { errorMessage } from '../../api/axiosInstance';

export const authenticate = createAsyncThunk('auth/authenticate', async ({ mode, values }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/auth/${mode}`, values);
    sessionStorage.setItem('token', data.token);
    return data.user;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const loadProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/profile')).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});
