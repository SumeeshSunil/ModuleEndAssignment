import { useState } from 'react';
import api, { errorMessage } from '../api/axiosInstance';

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setResult(''); setError('');
    try { setResult((await api.post('/contact', values)).data.message); setValues({ name: '', email: '', message: '' }); }
    catch (error) { setError(errorMessage(error)); }
    finally { setLoading(false); }
  }
  return <div className="form-page"><h1 className="h3">Contact us</h1><p>Have a question? Leave us a message.</p><form onSubmit={submit}>
    {['name', 'email', 'message'].map(field => <div className="mb-3" key={field}><label htmlFor={field} className="form-label text-capitalize">{field}</label>{field === 'message' ? <textarea id={field} className="form-control" rows="5" required maxLength="2000" value={values[field]} onChange={event => setValues({ ...values, [field]: event.target.value })} /> : <input id={field} className="form-control" type={field === 'email' ? 'email' : 'text'} required maxLength={field === 'name' ? 80 : 254} value={values[field]} onChange={event => setValues({ ...values, [field]: event.target.value })} />}</div>)}
    {error && <p role="alert" className="alert alert-danger">{error}</p>}{result && <p role="status" className="alert alert-success">{result}</p>}
    <button className="btn btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send message'}</button>
  </form></div>;
}
