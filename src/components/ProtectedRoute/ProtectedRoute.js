import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f9fafb'
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: '#2563EB' }} />
      </Box>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;