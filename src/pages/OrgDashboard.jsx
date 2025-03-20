import React, { useState, useEffect } from "react";
import OrgLayout from "../components/Layout/OrgLayout";
import { Box, Typography, Grid, CircularProgress, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css"; // Using the same Dashboard.css file
import { TrendingUp, ShoppingCart, BarChart, Clock } from "lucide-react";

const OrgDashboard = () => {
  const [orgData, setOrgData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalAmount: 0
  });
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
        const ordersData = await apiService.get("/api/org/orders");

        // Ensure orders is always an array
        const ordersArray = Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersArray);

        // Calculate dashboard statistics
        calculateStats(ordersArray);

        setError(null);
      } catch (err) {
        console.error("Error fetching organization data:", err);

        // Check if it's an authentication error
        if (err.status === 401 || (err.response && err.response.status === 401)) {
          setError("Your session has expired. Please login again.");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(err.message || "Failed to load organization data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [navigate]);

  // Calculate dashboard statistics from orders data
  const calculateStats = (ordersData) => {
    if (!Array.isArray(ordersData) || ordersData.length === 0) {
      return;
    }

    const totalOrders = ordersData.length;

    const pendingOrders = ordersData.filter(order =>
      order.status === "Pending" || order.status === "Processing"
    ).length;

    const completedOrders = ordersData.filter(order =>
      order.status === "Completed" || order.status === "Delivered"
    ).length;

    // Calculate total amount from all orders
    const totalAmount = ordersData.reduce((sum, order) => {
      const orderAmount = order.totalAmount ? parseFloat(order.totalAmount) : 0;
      return sum + orderAmount;
    }, 0);

    setStats({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalAmount
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
            <h2 className="page-title">Oragnization Dashboard</h2>

<Typography variant="subtitle1" className="welcome-message">
  Welcome, <span style={{fontWeight: 'bold' }}>{orgData?.organizationName}</span>
</Typography>
        </div>

        {/* Stats Grid - Styled like Admin Dashboard */}
        <Grid container spacing={3} className="dashboard-stats-container">
          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="dashboard-icon orders">
                 <ShoppingCart size={24} />
              </div>
              <div className="dashboard-content">
                <div className="dashboard-text">Total Orders</div>
                <div className="dashboard-value">{stats.totalOrders}</div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="dashboard-icon pending">
                  <Clock size={24} />
              </div>
              <div className="dashboard-content">
                <div className="dashboard-text">Pending Orders</div>
                <div className="dashboard-value">{stats.pendingOrders}</div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="dashboard-icon completed">
                 <TrendingUp size={24} />
              </div>
              <div className="dashboard-content">
                <div className="dashboard-text">Completed Orders</div>
                <div className="dashboard-value">{stats.completedOrders}</div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="dashboard-icon revenue">
                <BarChart size={24} />
              </div>
              <div className="dashboard-content">
                <div className="dashboard-text">Total Amount</div>
                <div className="dashboard-value">{formatCurrency(stats.totalAmount)}</div>
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Organization Info Card */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <div className="dashboard-card">
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
                  <span className={`status ${orgData?.status?.toLowerCase() || "pending"}`}>
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
            </div>
          </Grid>

          {/* Representative Info Card */}
          <Grid item xs={12} md={6}>
            <div className="dashboard-card">
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
            </div>
          </Grid>
        </Grid>

        {/* Orders Overview */}
        <div className="dashboard-card" style={{ marginTop: "20px" }}>
          <Typography variant="h6" className="card-title">
            Recent Orders
          </Typography>
          {Array.isArray(orders) && orders.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>PRN NO.</th>
                  <th>Date</th>
                  <th>Product Name</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id || 'N/A'}</td>
                    <td>{order.prnNo || 'N/A'}</td>
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
        </div>
      </div>
    </OrgLayout>
  );
};

export default OrgDashboard;