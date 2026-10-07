import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { errorMessage } from '../../api/axiosInstance';

export const getOrders = createAsyncThunk('orders/get', async (_, { rejectWithValue }) => {
  try { return (await api.get('/orders')).data; }
  catch (error) { return rejectWithValue(errorMessage(error)); }
});
