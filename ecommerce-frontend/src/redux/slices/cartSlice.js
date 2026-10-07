import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      if (product.stock < 1) return;
      const item = state.items.find(item => item._id === product._id);
      if (item) { item.stock = product.stock; item.quantity = Math.min(item.quantity + 1, product.stock); }
      else state.items.push({ ...product, quantity: 1 });
    },
    changeQuantity(state, action) {
      const item = state.items.find(item => item._id === action.payload.id);
      const quantity = Number(action.payload.quantity);
      if (item && Number.isInteger(quantity) && quantity >= 1 && quantity <= item.stock) item.quantity = quantity;
    },
    removeFromCart(state, action) { state.items = state.items.filter(item => item._id !== action.payload); },
    clearCart(state) { state.items = []; }
  }
});
export const { addToCart, changeQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
