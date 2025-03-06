import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { CircularProgress, Box } from '@mui/material';

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
const Dashboard = lazy(() => import('./pages/Dashboard')); // Only declare this once
const NeworgForm = lazy(() => import('./pages/NeworgForm'));
const NewOrder = lazy(() => import('./pages/NewOrder'));
const Companies = lazy(() => import('./pages/Companies'));
const Details = lazy(() => import('./pages/Details'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Team = lazy(() => import('./pages/Team'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LogoutPage = lazy(() => import('./components/Logout/LogoutPage'));


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

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-org" element={<NeworgForm />} />
              <Route path="/new-order" element={<NewOrder />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:companyId/org-details" element={<Details />} />
              <Route path="/companies/:companyId/orders" element={<Orders />} />
              <Route path="/companies/:companyId/orders/:orderId/order-details" element={<OrderDetails />} />
              <Route path="/team" element={<Team />} />
              <Route path="/logout" element={<LogoutPage />} />
            </Route>

            {/* Redirect root to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;