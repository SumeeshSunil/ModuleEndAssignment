import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../redux/thunks/orderThunks';
import api, { errorMessage } from '../api/axiosInstance';

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.orders);
  const user = useSelector(state => state.auth.user);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { dispatch(getOrders()); }, [dispatch]);
  async function change(order, status) {
    if (!window.confirm(status === 'delete' ? 'Delete this order?' : `Change this order to ${status}?`)) return;
    setBusy(true); setMessage('');
    try {
      if (status === 'delete') await api.delete(`/orders/${order._id}`);
      else await api.put(`/orders/${order._id}`, { status });
      await dispatch(getOrders());
    } catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <><h1 className="h3">{user.role === 'admin' ? 'All orders' : 'My orders'}</h1>
    {(error || message) && <p className="alert alert-danger" role="alert">{error || message}</p>}
    {loading ? <p>Loading orders...</p> : !orders.length ? <p>No orders yet.</p> : orders.map(order => <div key={order._id} className="card mb-3"><div className="card-body">
      <div className="d-flex flex-wrap justify-content-between gap-2"><h2 className="h6">Order {order._id.slice(-8)}</h2><span className="badge text-bg-secondary">{order.status}</span></div>
      <p className="small text-muted">{new Date(order.createdAt).toLocaleString()}</p>
      <ul>{order.items.map(item => <li key={item._id}>{item.name} × {item.quantity} — ₹{(item.price * item.quantity).toFixed(2)}</li>)}</ul>
      <p>Delivery: {order.address}</p><p className="fw-bold">Total: ₹{order.total.toFixed(2)}</p>
      <div className="d-flex gap-2 flex-wrap">
        {order.status === 'Placed' && <button className="btn btn-outline-danger btn-sm" disabled={busy} onClick={() => change(order, 'Cancelled')}>Cancel order</button>}
        {user.role === 'admin' && <>
          {order.status === 'Placed' && <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => change(order, 'Shipped')}>Mark shipped</button>}
          {order.status === 'Shipped' && <button className="btn btn-success btn-sm" disabled={busy} onClick={() => change(order, 'Delivered')}>Mark delivered</button>}
          {['Cancelled', 'Delivered'].includes(order.status) && <button className="btn btn-outline-danger btn-sm" disabled={busy} onClick={() => change(order, 'delete')}>Delete</button>}
        </>}
      </div>
    </div></div>)}
  </>;
}
