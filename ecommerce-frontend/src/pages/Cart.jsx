import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CartItem from '../components/CartItem';
import { clearCart } from '../redux/slices/cartSlice';
import api, { errorMessage } from '../api/axiosInstance';

export default function Cart() {
  const items = useSelector(state => state.cart.items);
  const user = useSelector(state => state.auth.user);
  const [address, setAddress] = useState(user?.address || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  async function checkout(event) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      await api.post('/orders', { items: items.map(item => ({ product: item._id, quantity: item.quantity })), address });
      dispatch(clearCart()); navigate('/orders');
    } catch (error) { setError(errorMessage(error)); }
    finally { setLoading(false); }
  }
  return <><h1 className="h3">Your cart</h1>{items.length ? <>
    {items.map(item => <CartItem key={item._id} item={item} />)}
    <h2 className="h4 mt-4">Total: ₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</h2>
    {user ? <form className="form-page ms-0 mt-4" onSubmit={checkout}><label className="form-label" htmlFor="address">Delivery address</label><textarea className="form-control mb-3" id="address" required maxLength="500" value={address} onChange={event => setAddress(event.target.value)} />
      <p>Payment: Cash on delivery</p>{error && <p className="alert alert-danger" role="alert">{error}</p>}<button className="btn btn-success" disabled={loading}>{loading ? 'Placing order...' : 'Place order'}</button>
    </form> : <Link className="btn btn-primary mt-3" to="/login" state={{ from: '/cart' }}>Login to place order</Link>}
  </> : <p>Your cart is empty. <Link to="/">Browse products</Link></p>}</>;
}
