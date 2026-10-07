import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { authenticate } from '../redux/thunks/authThunks';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const { user, loading, error } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  if (user) return <Navigate to={location.state?.from || '/'} replace />;
  return <div className="form-page"><h1 className="h3 mb-4">{mode === 'login' ? 'Login' : 'Create account'}</h1>
    <form onSubmit={event => { event.preventDefault(); dispatch(authenticate({ mode, values })); }}>
      {mode === 'register' && <div className="mb-3"><label htmlFor="name" className="form-label">Name</label><input id="name" className="form-control" required maxLength="80" value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} /></div>}
      <div className="mb-3"><label htmlFor="email" className="form-label">Email</label><input id="email" className="form-control" type="email" autoComplete="email" required value={values.email} onChange={event => setValues({ ...values, email: event.target.value })} /></div>
      <div className="mb-3"><label htmlFor="password" className="form-label">Password</label><input id="password" className="form-control" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" maxLength="72" required value={values.password} onChange={event => setValues({ ...values, password: event.target.value })} /></div>
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}</button>
    </form>
    <button className="btn btn-link px-0 mt-3" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'New here? Create an account' : 'Already registered? Login'}</button>
  </div>;
}
