import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api, { errorMessage } from '../api/axiosInstance';
import { addToCart } from '../redux/slices/cartSlice';
import ProductCard, { ProductImage } from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState({ products: [], source: '' });
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  useEffect(() => {
    let active = true;
    setProduct(null); setError(''); setAdded(false); setRelated({ products: [], source: '' });
    api.get(`/products/${id}`).then(({ data }) => { if (active) setProduct(data); }).catch(error => { if (active) setError(errorMessage(error)); });
    api.get(`/recommendations/${id}`).then(({ data }) => { if (active) setRelated(data); }).catch(() => {});
    return () => { active = false; };
  }, [id]);
  if (error) return <p className="alert alert-danger" role="alert">{error}</p>;
  if (!product) return <p>Loading product...</p>;
  return <><Link to="/">Back to products</Link><div className="row g-4 mt-2">
    <div className="col-md-6"><ProductImage product={product} /></div>
    <div className="col-md-6"><p className="text-muted">{product.category}</p><h1>{product.name}</h1><p>{product.description}</p><h2 className="h4">₹{product.price.toFixed(2)}</h2><p>{product.stock} in stock</p>
      <button className="btn btn-primary" disabled={!product.stock} onClick={() => { dispatch(addToCart(product)); setAdded(true); }}>Add to cart</button>
      {added && <p className="text-success mt-3" role="status">Added to cart. <Link to="/cart">View cart</Link></p>}
    </div>
  </div>{related.products.length > 0 && <section className="mt-5"><h2 className="h4">{related.source === 'rapidminer' ? 'Recommended products' : 'Similar products'}</h2><div className="row g-3">{related.products.map(item => <ProductCard key={item._id} product={item} />)}</div></section>}</>;
}
