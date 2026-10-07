import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api, { errorMessage } from '../api/axiosInstance';
import { logout, setUser } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { clearOrders } from '../redux/slices/orderSlice';

export default function Profile() {
  const user = useSelector(state => state.auth.user);
  const [values, setValues] = useState({ name: user.name, email: user.email, address: user.address, password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { dispatch(setUser((await api.put('/profile', values)).data)); setValues({ ...values, password: '' }); setMessage('Profile updated'); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!window.confirm('Delete your account? You will no longer be able to log in.')) return;
    setBusy(true); setError('');
    try { await api.delete('/profile'); sessionStorage.removeItem('token'); dispatch(logout()); dispatch(clearCart()); dispatch(clearOrders()); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="form-page"><h1 className="h3">My profile</h1><form onSubmit={save}>
    {['name', 'email', 'address', 'password'].map(field => <div className="mb-3" key={field}><label className="form-label text-capitalize" htmlFor={field}>{field === 'password' ? 'New password (optional)' : field}</label><input id={field} className="form-control" type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'} required={['name', 'email'].includes(field)} minLength={field === 'password' ? 8 : undefined} maxLength={field === 'address' ? 500 : field === 'password' ? 72 : field === 'name' ? 80 : 254} value={values[field]} onChange={event => setValues({ ...values, [field]: event.target.value })} /></div>)}
    {error && <p className="alert alert-danger" role="alert">{error}</p>}{message && <p className="alert alert-success" role="status">{message}</p>}
    <button className="btn btn-primary" disabled={busy}>Save profile</button>
  </form><button className="btn btn-outline-danger mt-4" disabled={busy} onClick={remove}>Delete account</button></div>;
}
