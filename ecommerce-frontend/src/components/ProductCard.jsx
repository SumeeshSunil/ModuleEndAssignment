import { Link } from 'react-router-dom';

export function ProductImage({ product }) {
  return product.image ? <img className="product-image" src={product.image} alt={product.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/product.svg'; }} /> : <img className="product-image" src="/product.svg" alt={product.name} />;
}

export default function ProductCard({ product }) {
  return <div className="col-sm-6 col-lg-3"><div className="card h-100">
    <ProductImage product={product} />
    <div className="card-body d-flex flex-column">
      <p className="small text-muted mb-1">{product.category}</p><h2 className="h5">{product.name}</h2>
      <p className="fw-bold">₹{product.price.toFixed(2)}</p>
      <p className="small">{product.stock > 0 ? 'In stock' : 'Out of stock'}</p>
      <Link className="btn btn-primary mt-auto" to={`/products/${product._id}`}>View product</Link>
    </div>
  </div></div>;
}
