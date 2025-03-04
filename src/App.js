import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import {AuthProvider} from './context/AuthContext';
import NeworgForm from "./pages/NeworgForm";
import Companies from "./pages/Companies";
import Orders from "./pages/Orders";
import Details from "./pages/Details";
import Login from "./components/Login/LoginPage";
import Team from "./pages/Team";
import NewOrder from "./pages/NewOrder";
import Dashboard from "./pages/Dashboard";
import OrderDetails from "./pages/OrderDetails";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

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
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all route for unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
