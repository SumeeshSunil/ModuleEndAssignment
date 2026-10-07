import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route, Link } from 'react-router-dom';
import { loadProfile } from './redux/thunks/authThunks';
import { logout } from './redux/slices/authSlice';
import { clearCart } from './redux/slices/cartSlice';
import { clearOrders } from './redux/slices/orderSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

export default function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (sessionStorage.getItem('token')) dispatch(loadProfile());
    const expire = () => { dispatch(logout()); dispatch(clearCart()); dispatch(clearOrders()); };
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, [dispatch]);
  return <><Navbar /><main className="container"><Routes>
    <Route path="/" element={<Home />} /><Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/login" element={<Login />} /><Route path="/cart" element={<Cart />} /><Route path="/contact" element={<Contact />} />
    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
    <Route path="*" element={<><h1>Page not found</h1><Link to="/">Go home</Link></>} />
  </Routes></main><Footer /></>;
}
