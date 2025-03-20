import React, { useState, useEffect } from "react";
import { Grid, Typography, Card, Box, CircularProgress, Alert } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ShoppingCart, BarChart, Clock } from "lucide-react";
import "../styles/Dashboard.css";
import Layout from "../components/Layout/Layout";
import apiService from "../utils/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalOrders: 0,
      totalSales: 0,
      pendingOrders: 0
    },
    recentOrders: [],
    salesData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard summary data
        const summaryResponse = await apiService.get("/api/admin/dashboard/summary");

        // Fetch recent orders
        const recentOrdersResponse = await apiService.get("/api/admin/dashboard/recent-orders");

        // Fetch sales data for chart
        const salesDataResponse = await apiService.get("/api/admin/dashboard/sales-data");

        setDashboardData({
          stats: summaryResponse || {
            totalUsers: 0,
            totalOrders: 0,
            totalSales: 0,
            pendingOrders: 0
          },
          recentOrders: recentOrdersResponse || [],
          salesData: salesDataResponse || []
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");

        // Set fallback data in case of error
        setDashboardData({
          stats: {
            totalUsers: 0,
            totalOrders: 0,
            totalSales: 0,
            pendingOrders: 0
          },
          recentOrders: [],
          salesData: generateFallbackChartData()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate fallback chart data if API fails
  const generateFallbackChartData = () => {
    return [
      { name: "Jan", value: 30 },
      { name: "Feb", value: 40 },
      { name: "Mar", value: 45 },
      { name: "Apr", value: 60 },
      { name: "May", value: 50 },
      { name: "Jun", value: 70 },
      { name: "Jul", value: 80 },
    ];
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
      <Layout>
        <Box className="loading-container">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" className="loading-text">Loading dashboard data...</Typography>
        </Box>
      </Layout>
    );
  }

  // Stats data mapped from API response
  const statsData = [
    {
      title: "Total Users",
      value: dashboardData.stats.totalUsers?.toLocaleString() || '0',
      trend: dashboardData.stats.userTrend || "0% No change",
      icon: <TrendingUp size={24} />,
      color: "#8B5CF6",
      className: "users"
    },
    {
      title: "Total Orders",
      value: dashboardData.stats.totalOrders?.toLocaleString() || '0',
      trend: dashboardData.stats.orderTrend || "0% No change",
      icon: <ShoppingCart size={24} />,
      color: "#FACC15",
      className: "orders"
    },
    {
      title: "Total Sales",
      value: formatCurrency(dashboardData.stats.totalSales || 0),
      trend: dashboardData.stats.salesTrend || "0% No change",
      icon: <BarChart size={24} />,
      color: "#22C55E",
      className: "revenue"
    },
    {
      title: "Pending Orders",
      value: dashboardData.stats.pendingOrders?.toLocaleString() || '0',
      trend: dashboardData.stats.pendingTrend || "0% No change",
      icon: <Clock size={24} />,
      color: "#FB923C",
      className: "growth"
    },
  ];

  // Use the chart data from API or fallback
  const chartData = dashboardData.salesData.length > 0
    ? dashboardData.salesData
    : generateFallbackChartData();

  return (
    <Layout>
      <div className="dashboard-container">
        <h2 className="page-title">Dashboard</h2>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <div className="dashboard-stats-container">
          <Grid container spacing={3}>
            {statsData.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <div className="dashboard-card">
                  <div className={`dashboard-icon ${stat.className}`}>
                    {stat.icon}
                  </div>
                  <div className="dashboard-content">
                    <div className="dashboard-text">{stat.title}</div>
                    <div className="value-trend-container">
                      <div className="dashboard-value">{stat.value}</div>
                      <div className={`dashboard-trend ${stat.trend.includes("Down") ? "negative" : "positive"}`}>
                        {stat.trend.split(" ")[0]} <span>{stat.trend.includes("Down") ? "↓" : "↑"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>

        <div className="dashboard-chart-container">
          <Typography variant="h6" className="chart-title">
            Sales Details
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders Section */}
        {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 && (
          <div className="dashboard-card" style={{ marginTop: "20px" }}>
            <Typography variant="h6" className="card-title">
              Recent Orders
            </Typography>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Organization</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderId || order.id}</td>
                    <td>{order.organizationName}</td>
                    <td>{order.productName}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`status ${(order.status || "").toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;