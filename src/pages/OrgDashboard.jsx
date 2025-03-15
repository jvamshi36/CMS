// src/pages/OrgDashboard.jsx - Optimized version
import React, { useState, useEffect, useRef } from "react";
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
  const fetchInProgress = useRef(false);

  useEffect(() => {
    const fetchOrgData = async () => {
      // Skip if we already have a fetch in progress
      if (fetchInProgress.current) return;

      fetchInProgress.current = true;
      setLoading(true);

      try {
        // Fetch organization profile data
        const profileData = await apiService.get("/api/org/dashboard/profile");
        setOrgData(profileData);

        // Fetch organization orders - UPDATED PATH to match backend controller
        const ordersData = await apiService.get("/api/org/orders");
        // Ensure orders is always an array
        setOrders(Array.isArray(ordersData) ? ordersData : []);

        setError(null);
      } catch (err) {
        console.error("Error fetching organization data:", err);

        // Check if it's an authentication error
        if (err.status === 401 || (err.response && err.response.status === 401)) {
          // Handle authentication error
          setError("Your session has expired. Please login again.");

          // You might want to redirect to login page
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(err.message || "Failed to load organization data. Please try again later.");
        }
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchOrgData();

    // Cleanup function
    return () => {
      fetchInProgress.current = false;
      // Cancel any pending requests
      apiService.clearPendingRequests && apiService.clearPendingRequests();
    };
  }, [navigate]); // Only depends on navigate, will run once on mount

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
            onClick={() => {
              fetchInProgress.current = false; // Reset the flag
              window.location.reload();
            }}
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
                        <th>PRN NO. </th>
                        <th>Date Of Order</th>
                        <th>Product Name</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Order Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                           <td>{order.id || 'N/A'}</td>
                            <td>{order.prnNo|| 'N/A'}</td>
                           <td>
                             {order.date
                               ? new Date(order.date).toLocaleString('en-US', {
                                   year: 'numeric',
                                   month: 'short',
                                   day: 'numeric'
                                 })
                               : 'N/A'
                             }
                           </td>
                            <td>{order.productName || 'N/A'}</td>
                            <td>₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                            <td>
                                <span className={`status ${(order.status || '').toLowerCase()}`}>
                                    {order.status || 'Processing'}
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