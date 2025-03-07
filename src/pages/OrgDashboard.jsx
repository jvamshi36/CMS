// src/pages/OrgDashboard.jsx
import React, { useState, useEffect } from "react";
import OrgLayout from "../components/Layout/OrgLayout";
import { Box, Typography, Paper, Grid, CircularProgress, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

const OrgDashboard = () => {
  const [orgData, setOrgData] = useState(null);
  const [orders, setOrders] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgData = async () => {
      setLoading(true);
      try {
        // Fetch organization profile data
        const profileData = await apiService.get("/api/org/dashboard/profile");
        setOrgData(profileData);

        // Fetch organization orders
        const ordersData = await apiService.get("/api/org/dashboard/orders");
        // Ensure orders is always an array
        setOrders(Array.isArray(ordersData) ? ordersData : []);

        setError(null);
      } catch (err) {
        console.error("Error fetching organization data:", err);
        setError(err.message || "Failed to load organization data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  if (loading) {
    return (
      <OrgLayout>
        <Box className="loading-container">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" className="loading-text">Loading your dashboard...</Typography>
        </Box>
      </OrgLayout>
    );
  }

  if (error) {
    return (
      <OrgLayout>
        <Box className="error-container">
          <Typography variant="h6" className="error-title">Something went wrong</Typography>
          <Typography variant="body1" className="error-message">{error}</Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </Button>
        </Box>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Typography variant="h4" className="page-title">
            Organization Dashboard
          </Typography>
          <Typography variant="subtitle1" className="welcome-message">
            Welcome, {orgData?.organizationName}
          </Typography>
        </div>

        <Grid container spacing={3} className="dashboard-grid">
          {/* Organization Info Card */}
          <Grid item xs={12} md={6}>
            <Paper className="dashboard-card">
              <Typography variant="h6" className="card-title">
                Organization Information
              </Typography>
              <Box className="card-content">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{orgData?.organizationName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Constitution:</span>
                  <span className="info-value">{orgData?.constitution}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{`${orgData?.addressLine1}, ${orgData?.city}, ${orgData?.zip}`}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">GST Number:</span>
                  <span className="info-value">{orgData?.gstNumber || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">PAN Number:</span>
                  <span className="info-value">{orgData?.panNumber || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${orgData?.status?.toLowerCase() || "pending"}`}>
                    {orgData?.status || "Pending"}
                  </span>
                </div>
              </Box>
              <Button
                variant="outlined"
                className="card-button"
                onClick={() => navigate("/org/profile")}
              >
                View Full Profile
              </Button>
            </Paper>
          </Grid>

          {/* Representative Info Card */}
          <Grid item xs={12} md={6}>
            <Paper className="dashboard-card">
              <Typography variant="h6" className="card-title">
                Representative Information
              </Typography>
              <Box className="card-content">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{`${orgData?.representativeFirstName} ${orgData?.representativeLastName}`}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{orgData?.representativeEmail}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact Number:</span>
                  <span className="info-value">{orgData?.representativeNumber}</span>
                </div>
              </Box>
            </Paper>
          </Grid>

          {/* Orders Overview */}
          <Grid item xs={12}>
            <Paper className="dashboard-card">
              <Typography variant="h6" className="card-title">
                Recent Orders
              </Typography>
              {Array.isArray(orders) && orders.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>{order.items}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="contained"
                            size="small"
                            className="view-button"
                            onClick={() => navigate(`/org/orders/${order.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography variant="body1" className="empty-message">
                  No orders found.
                </Typography>
              )}
              {Array.isArray(orders) && orders.length > 0 && (
                <Button
                  variant="outlined"
                  className="card-button"
                  onClick={() => navigate("/org/orders")}
                >
                  View All Orders
                </Button>
              )}
              <Button
                variant="contained"
                className="new-order-button"
                onClick={() => navigate("/org/new-order")}
              >
                Place New Order
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </OrgLayout>
  );
};

export default OrgDashboard;