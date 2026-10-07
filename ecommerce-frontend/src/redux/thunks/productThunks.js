import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { errorMessage } from '../../api/axiosInstance';

export const getProducts = createAsyncThunk('products/get', async (params, { rejectWithValue, signal }) => {
  try {
    return (await api.get('/products', { params, signal })).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});
