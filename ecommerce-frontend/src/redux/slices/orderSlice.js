import { createSlice } from '@reduxjs/toolkit';
import { getOrders } from '../thunks/orderThunks';

const orderSlice = createSlice({
  name: 'orders', initialState: { orders: [], loading: false, error: '' }, reducers: { clearOrders(state) { state.orders = []; } },
  extraReducers: builder => {
    builder.addCase(getOrders.pending, state => { state.loading = true; state.error = ''; });
    builder.addCase(getOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; });
    builder.addCase(getOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});
export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
