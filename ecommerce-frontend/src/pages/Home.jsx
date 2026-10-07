import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../redux/thunks/productThunks';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector(state => state.products);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'newest' });
  useEffect(() => { const request = dispatch(getProducts(filters)); return () => request.abort(); }, [dispatch, filters]);
  return <>
    <div className="bg-light rounded p-4 mb-4"><h1>Welcome to Student Shop</h1><p className="mb-0">Find everyday essentials at simple prices.</p></div>
    <form className="row g-2 mb-4" onSubmit={event => { event.preventDefault(); setFilters({ ...filters, search }); }}>
      <div className="col-md-5"><label className="form-label" htmlFor="search">Search products</label><input id="search" className="form-control" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name" /></div>
      <div className="col-md-3"><label className="form-label" htmlFor="category">Category</label><select id="category" className="form-select" value={filters.category} onChange={event => setFilters({ ...filters, category: event.target.value })}><option value="">All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select></div>
      <div className="col-md-3"><label className="form-label" htmlFor="sort">Sort by</label><select id="sort" className="form-select" value={filters.sort} onChange={event => setFilters({ ...filters, sort: event.target.value })}><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name</option></select></div>
      <div className="col-md-1 d-flex align-items-end"><button className="btn btn-primary w-100">Search</button></div>
    </form>
    {loading ? <p>Loading products...</p> : error ? <p className="alert alert-danger" role="alert">{error}</p> : products.length ? <div className="row g-3">{products.map(product => <ProductCard key={product._id} product={product} />)}</div> : <p>No products found.</p>}
  </>;
}
