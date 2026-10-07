import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api/axiosInstance';

const empty = { name: '', description: '', category: '', price: '', stock: '', image: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [values, setValues] = useState(empty);
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() { setProducts((await api.get('/products')).data.products); }
  useEffect(() => { load().catch(error => setError(errorMessage(error))); }, []);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const data = { ...values, price: Number(values.price), stock: Number(values.stock) };
      if (id) await api.put(`/products/${id}`, data);
      else await api.post('/products', data);
      setId(''); setValues(empty); await load(); setMessage('Product saved');
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function remove(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setBusy(true); setError(''); setMessage('');
    try { await api.delete(`/products/${product._id}`); if (id === product._id) { setId(''); setValues(empty); } await load(); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <><h1 className="h3">Manage products</h1>{error && <p className="alert alert-danger" role="alert">{error}</p>}{message && <p className="alert alert-success" role="status">{message}</p>}
    <form className="card card-body mb-4" onSubmit={save}><h2 className="h5">{id ? 'Edit product' : 'Add product'}</h2><div className="row g-3">
      {Object.keys(empty).map(field => <div className={field === 'description' ? 'col-12' : 'col-md-6'} key={field}><label className="form-label text-capitalize" htmlFor={field}>{field === 'image' ? 'Image URL (optional)' : field}</label><input className="form-control" id={field} type={['price', 'stock'].includes(field) ? 'number' : field === 'image' ? 'url' : 'text'} min="0" step={field === 'price' ? '0.01' : '1'} required={field !== 'image'} value={values[field]} onChange={event => setValues({ ...values, [field]: event.target.value })} /></div>)}
    </div><div className="mt-3 d-flex gap-2"><button className="btn btn-primary" disabled={busy}>Save product</button>{id && <button type="button" className="btn btn-secondary" onClick={() => { setId(''); setValues(empty); }}>Cancel edit</button>}</div></form>
    <div className="table-responsive"><table className="table table-bordered"><thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map(product => <tr key={product._id}><td>{product.name}</td><td>₹{product.price.toFixed(2)}</td><td>{product.stock}</td><td><div className="d-flex gap-2"><button disabled={busy} className="btn btn-sm btn-outline-primary" onClick={() => { setId(product._id); setValues(Object.fromEntries(Object.keys(empty).map(key => [key, product[key]]))); window.scrollTo(0, 0); }}>Edit</button><button disabled={busy} className="btn btn-sm btn-outline-danger" onClick={() => remove(product)}>Delete</button></div></td></tr>)}</tbody></table></div>
  </>;
}
