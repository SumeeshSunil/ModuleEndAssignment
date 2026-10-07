import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, checking } = useSelector(state => state.auth);
  const location = useLocation();
  if (checking) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
