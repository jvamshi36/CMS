import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes via Outlet
  return <Outlet />;
};

export default ProtectedRoute;