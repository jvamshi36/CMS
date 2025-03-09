// src/App.js
import React, { Suspense, lazy } from "react";
import { Routes, Route,Navigate,  Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { CircularProgress, Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import OrgDashboard from './pages/OrgDashboard';
// Loading component for suspense fallback
const LoadingPage = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f9fafb',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={60} thickness={4} sx={{ color: '#2563EB' }} />
    <p>Loading...</p>
  </Box>
);

// Lazy load components for better performance
const Login = lazy(() => import('./components/Login/LoginPage'));
const ForgotPassword = lazy(() => import('./components/Login/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Login/ResetPassword'));
const NeworgForm = lazy(() => import('./pages/NeworgForm'));
const NewOrder = lazy(() => import('./pages/NewOrder'));
const Companies = lazy(() => import('./pages/Companies'));
const Details = lazy(() => import('./pages/Details'));
const Orders = lazy(() => import('./pages/Orders'));
const Settings = lazy(() =>import ('./pages/Settings'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Team = lazy(() => import('./pages/Team'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Logout = lazy(() => import('./components/Logout/LogoutPage'));
const OrgProfile = lazy(() => import('./pages/OrgProfile'));
const OrgOrders = lazy(() => import('./pages/OrgOrders'));
const OrgOrderDetails = lazy(() => import('./pages/OrgOrderDetails'));
const OrgSettings = lazy(() =>import ('./pages/OrgSettings'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token?" element={<ResetPassword />} />

            {/* Admin Protected Routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-org" element={<NeworgForm />} />
              <Route path="/new-order" element={<NewOrder />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:companyId/org-details" element={<Details />} />
              <Route path="/companies/:companyId/orders" element={<Orders />} />
              <Route path="/companies/:companyId/orders/:orderId/order-details" element={<OrderDetails />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Organization Protected Routes */}
            <Route element={<OrgProtectedRoute />}>
              <Route path="/org/dashboard" element={<OrgDashboard />} />
              <Route path="/org/profile" element={<OrgProfile />} />
              <Route path="/org/orders" element={<OrgOrders />} />
              <Route path="/org/orders/:orderId" element={<OrgOrderDetails />} />
              <Route path="/org/settings" element={<OrgSettings />} />
            </Route>

            {/* Shared Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/logout" element={<Logout />} />
            </Route>

            {/* Redirect root to appropriate dashboard based on user type */}
            <Route path="/" element={<RootRedirect />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Component to redirect based on user type
const RootRedirect = () => {
  const { isAuthenticated, isAdmin, isOrganization } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isOrganization()) {
    return <Navigate to="/org/dashboard" replace />;
  }
  
  // Fallback
  return <Navigate to="/login" replace />;
};

// AdminProtectedRoute - only for admin users
const AdminProtectedRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <LoadingPage />;
  }
  
  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// OrgProtectedRoute - only for organization users
const OrgProtectedRoute = () => {
  const { isAuthenticated, isOrganization, loading } = useAuth();
  
  if (loading) {
    return <LoadingPage />;
  }
  
  if (!isAuthenticated() || !isOrganization()) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default App;