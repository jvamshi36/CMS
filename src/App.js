import React from "react";
import { Routes, Route } from "react-router-dom";
import './index.css'; // Ensure this imports your CSS
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
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
    <div className="dotted-grid">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/*" element={<ProtectedRoute />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-org" element={<NeworgForm />} />
          <Route path="/new-order" element={<NewOrder />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId/org-details" element={<Details />} />
          <Route path="/companies/:companyId/orders" element={<Orders />} />
          <Route path="/companies/:companyId/orders/:orderId/order-details" element={<OrderDetails />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;