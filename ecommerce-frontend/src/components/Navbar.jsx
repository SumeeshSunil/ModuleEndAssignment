import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { clearOrders } from '../redux/slices/orderSlice';

export default function Navbar() {
  const { user } = useSelector(state => state.auth);
  const count = useSelector(state => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const dispatch = useDispatch();
  function signOut() {
    sessionStorage.removeItem('token');
    dispatch(logout()); dispatch(clearCart()); dispatch(clearOrders());
  }
  return <nav className="navbar bg-dark navbar-dark mb-4">
    <div className="container gap-3">
      <Link className="navbar-brand" to="/">Student Shop</Link>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <NavLink to="/">Home</NavLink><NavLink to="/contact">Contact</NavLink><NavLink to="/cart">Cart ({count})</NavLink>
        {user ? <><NavLink to="/orders">Orders</NavLink><NavLink to="/profile">Profile</NavLink>
          {user.role === 'admin' && <NavLink to="/admin">Manage products</NavLink>}
          <button className="btn btn-outline-light btn-sm" onClick={signOut}>Logout</button></> : <NavLink to="/login">Login</NavLink>}
      </div>
    </div>
  </nav>;
}
