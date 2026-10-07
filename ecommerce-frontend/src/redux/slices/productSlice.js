import { createSlice } from '@reduxjs/toolkit';
import { getProducts } from '../thunks/productThunks';

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], categories: [], loading: false, error: '', requestId: null },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getProducts.pending, (state, action) => { state.loading = true; state.error = ''; state.requestId = action.meta.requestId; });
    builder.addCase(getProducts.fulfilled, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.loading = false; state.products = action.payload.products; state.categories = action.payload.categories;
    });
    builder.addCase(getProducts.rejected, (state, action) => {
      if (state.requestId !== action.meta.requestId) return;
      state.loading = false; state.error = action.meta.aborted ? '' : action.payload;
    });
  }
});
export default productSlice.reducer;
