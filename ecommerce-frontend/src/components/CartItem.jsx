import { useDispatch } from 'react-redux';
import { changeQuantity, removeFromCart } from '../redux/slices/cartSlice';

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  return <div className="border-bottom py-3 d-flex flex-wrap align-items-center gap-3">
    <div className="me-auto"><h2 className="h6 mb-1">{item.name}</h2><span>₹{item.price.toFixed(2)} each</span></div>
    <label className="d-flex align-items-center gap-2">Quantity
      <input className="form-control quantity" aria-label={`Quantity for ${item.name}`} type="number" min="1" max={item.stock} value={item.quantity} onChange={event => dispatch(changeQuantity({ id: item._id, quantity: event.target.value }))} />
    </label>
    <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
    <button className="btn btn-outline-danger btn-sm" onClick={() => dispatch(removeFromCart(item._id))}>Remove</button>
  </div>;
}
