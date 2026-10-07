import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import products from './slices/productSlice';
import cart from './slices/cartSlice';
import orders from './slices/orderSlice';

export default configureStore({ reducer: { auth, products, cart, orders } });
