import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../contexts/useAdminAuth';

const AdminPrivateRoute = () => {
  const { isAuthenticated } = useAdminAuth();

  return isAuthenticated() ? <Outlet /> : <Navigate to="/admin/dashboard" replace />;
};

export default AdminPrivateRoute;
