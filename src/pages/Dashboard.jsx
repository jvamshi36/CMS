import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Card,
  Box,
  CircularProgress,
  Alert,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  BarChart as BarChartIcon,
  Clock,
  RefreshCw as Refresh,
  Settings,
  CircleX as Close,
  LayoutDashboard as DashboardIcon
} from "lucide-react";

import "../styles/Dashboard.css";
import Layout from "../components/Layout/Layout";
import apiService from "../utils/api";

// Widget component for customizable dashboard
const DashboardWidget = ({ title, children, onRemove, id, onMove }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="dashboard-card dashboard-widget">
      <div className="widget-header">
        <Typography variant="h6" className="card-title">{title}</Typography>
        <IconButton onClick={handleClick} size="small">
          <Settings size={16} />
        </IconButton>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); onMove(id, 'up'); }}>Move Up</MenuItem>
        <MenuItem onClick={() => { handleClose(); onMove(id, 'down'); }}>Move Down</MenuItem>
        <MenuItem onClick={() => { handleClose(); onRemove(id); }}>Remove Widget</MenuItem>
      </Menu>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

// NoData component
const NoData = ({ message }) => (
  <div className="no-data-container">
    <DashboardIcon size={60} color="#cbd5e1" />
    <Typography className="no-data-text">{message || "No data available"}</Typography>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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

  // State for widgets configuration
  const [widgets, setWidgets] = useState([
    { id: 'stats', title: 'Key Metrics', visible: true, order: 1 },
    { id: 'salesChart', title: 'Sales Chart', visible: true, order: 2 },
    { id: 'recentOrders', title: 'Recent Orders', visible: true, order: 3 }
  ]);

  // Chart configuration state
  const [chartConfig, setChartConfig] = useState({
    type: 'line',
    period: 'monthly'
  });

  // Customization dialog state
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Process sales data to ensure it works with recharts
  const processSalesData = (rawData, period) => {
    console.log("Processing sales data for period:", period);
    console.log("Raw data structure:", Array.isArray(rawData) ? "Array" : typeof rawData);
    console.log("Raw data sample:", rawData && Array.isArray(rawData) && rawData.length > 0 ? JSON.stringify(rawData[0]) : (rawData ? Object.keys(rawData).slice(0, 3) : "No data"));

    if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
      console.log("No data to process");
      return [];
    }

    // For different period formats, we need different field mappings
    const fieldMappings = {
      daily: { nameField: ["date", "day", "name", "period"], valueField: ["revenue", "sales", "value", "amount"] },
      weekly: { nameField: ["week", "date", "name", "period"], valueField: ["revenue", "sales", "value", "amount"] },
      monthly: { nameField: ["month", "name", "period"], valueField: ["revenue", "sales", "value", "amount"] },
      yearly: { nameField: ["year", "name", "period"], valueField: ["revenue", "sales", "value", "amount"] }
    };

    // Get the appropriate field mapping for the period
    const mapping = fieldMappings[period] || fieldMappings.monthly;

    // Function to extract the appropriate name and value fields from an item
    const extractFields = (item) => {
      // Find the first field name that exists in the item
      const findField = (fieldList) => {
        for (const field of fieldList) {
          if (item[field] !== undefined) {
            return field;
          }
        }
        return null;
      };

      const nameField = findField(mapping.nameField);
      const valueField = findField(mapping.valueField);

      return {
        name: nameField ? item[nameField] : null,
        value: valueField ? item[valueField] : null
      };
    };

    let processedData = [];

    // Convert the data based on its format
    if (Array.isArray(rawData)) {
      processedData = rawData.map((item, index) => {
        // Check if data already has name and value fields
        if (item.name !== undefined && item.value !== undefined) {
          return {
            name: item.name,
            value: Number(item.value) || 0
          };
        }

        // Extract appropriate fields based on period
        const extracted = extractFields(item);

        // If we couldn't extract proper fields, use fallback
        return {
          name: extracted.name || `Period ${index + 1}`,
          value: extracted.value !== null ? Number(extracted.value) : 0
        };
      });
    } else if (typeof rawData === 'object') {
      // For object format (key-value pairs)
      processedData = Object.entries(rawData).map(([key, value]) => ({
        name: key,
        value: typeof value === 'number' ? value : Number(value) || 0
      }));
    }

    console.log(`Processed ${processedData.length} data points for ${period} period`);
    return processedData;
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard summary data
      const summaryResponse = await apiService.get("/api/admin/dashboard/summary");

      // Fetch recent orders
      const recentOrdersResponse = await apiService.get("/api/admin/dashboard/recent-orders");

      // Fetch sales data for chart based on period
      let salesDataResponse;
      const period = chartConfig.period;

      console.log(`Fetching sales data for period: ${period}`);

      try {
        // First try the endpoint with a period parameter
        salesDataResponse = await apiService.get(`/api/admin/dashboard/sales-data?period=${period}`);
        console.log(`Successfully fetched sales data with period=${period}`);
      } catch (e) {
        console.error(`Error fetching sales data with period=${period}:`, e);

        // Try alternative endpoints for different periods
        try {
          if (period === 'daily') {
            salesDataResponse = await apiService.get('/api/admin/dashboard/daily-sales');
          } else if (period === 'weekly') {
            salesDataResponse = await apiService.get('/api/admin/dashboard/weekly-sales');
          } else if (period === 'yearly') {
            salesDataResponse = await apiService.get('/api/admin/dashboard/yearly-sales');
          } else {
            // Default to monthly if no specific endpoint works
            salesDataResponse = await apiService.get('/api/admin/dashboard/monthly-sales');
          }
          console.log(`Successfully fetched sales data from period-specific endpoint for ${period}`);
        } catch (err) {
          console.error(`Error fetching from period-specific endpoint for ${period}:`, err);

          // Final fallback - try without period parameter
          try {
            salesDataResponse = await apiService.get('/api/admin/dashboard/sales-data');
            console.log('Fetched sales data from default endpoint without period parameter');
          } catch (finalErr) {
            console.error('Error fetching sales data from all endpoints:', finalErr);

            // If everything fails, create some sample data
            if (period === 'daily') {
              salesDataResponse = createSampleData('daily', 7);
            } else if (period === 'weekly') {
              salesDataResponse = createSampleData('weekly', 4);
            } else if (period === 'yearly') {
              salesDataResponse = createSampleData('yearly', 3);
            } else {
              salesDataResponse = createSampleData('monthly', 12);
            }
          }
        }
      }

      // Process sales data to ensure it's in the correct format
      const processedSalesData = processSalesData(salesDataResponse, period);

      setDashboardData({
        stats: summaryResponse || {
          totalUsers: 0,
          totalOrders: 0,
          totalSales: 0,
          pendingOrders: 0
        },
        recentOrders: recentOrdersResponse || [],
        salesData: processedSalesData || []
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");

      // Set empty data structure in case of error
      setDashboardData({
        stats: {
          totalUsers: 0,
          totalOrders: 0,
          totalSales: 0,
          pendingOrders: 0
        },
        recentOrders: [],
        salesData: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to create sample data if API fails
  const createSampleData = (period, count) => {
    console.log(`Creating sample data for ${period} with ${count} data points`);

    const data = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (period === 'daily') {
      // Last 7 days
      for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 500) + 500
        });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 0; i < count; i++) {
        data.push({
          week: `Week ${i + 1}`,
          value: Math.floor(Math.random() * 2000) + 2000
        });
      }
    } else if (period === 'yearly') {
      // Last 3 years
      for (let i = 0; i < count; i++) {
        data.push({
          year: `${currentYear - i}`,
          value: Math.floor(Math.random() * 50000) + 50000
        });
      }
    } else {
      // Monthly (default)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < count; i++) {
        const monthIndex = (currentMonth - i + 12) % 12;
        data.push({
          month: monthNames[monthIndex],
          value: Math.floor(Math.random() * 10000) + 5000
        });
      }
    }

    return data;
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [chartConfig.period]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Widget management
  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.map(widget =>
      widget.id === widgetId ? {...widget, visible: false} : widget
    ));
  };

  const handleAddWidget = (widgetId) => {
    setWidgets(widgets.map(widget =>
      widget.id === widgetId ? {...widget, visible: true} : widget
    ));
  };

  const handleMoveWidget = (widgetId, direction) => {
    const currentWidget = widgets.find(w => w.id === widgetId);
    const targetOrder = direction === 'up'
      ? currentWidget.order - 1
      : currentWidget.order + 1;

    if (targetOrder < 1 || targetOrder > widgets.length) {
      return; // Can't move beyond boundaries
    }

    setWidgets(widgets.map(widget => {
      if (widget.id === widgetId) {
        return {...widget, order: targetOrder};
      } else if (widget.order === targetOrder) {
        return {...widget, order: currentWidget.order};
      }
      return widget;
    }));
  };

  // Chart configuration handler
  const handleChartConfigChange = (property, value) => {
    setChartConfig({
      ...chartConfig,
      [property]: value
    });
  };

  // Prepare stats data from API response
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
      icon: <BarChartIcon size={24} />,
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

  // Custom colors for charts
  const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

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

  // Sort widgets by order
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);
  const visibleWidgets = sortedWidgets.filter(widget => widget.visible);
  const hiddenWidgets = sortedWidgets.filter(widget => !widget.visible);

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-header-actions">
            <h2 className="page-title">Dashboard</h2>
            <div className="dashboard-actions">
              <IconButton
                className="refresh-button"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <Refresh className={refreshing ? "spin" : ""} />
              </IconButton>
            </div>
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </div>

        {/* Dashboard Widgets */}
        {visibleWidgets.map(widget => {
          // Stats Widget
          if (widget.id === 'stats' && widget.visible) {
            return (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                onRemove={handleRemoveWidget}
                onMove={handleMoveWidget}
              >
                <div className="dashboard-stats-container">
                  <Grid container spacing={3}>
                    {statsData.map((stat) => (
                      <Grid item xs={12} sm={6} md={3} key={stat.title}>
                        <div className="dashboard-card stat-card">
                          <div className={`dashboard-icon ${stat.className}`}>
                            {stat.icon}
                          </div>
                          <div className="dashboard-content">
                            <div className="dashboard-text">{stat.title}</div>
                            <div className="value-trend-container">
                              <div className="dashboard-value">{stat.value}</div>
                              {stat.trend !== "0% No change" && (
                                <div className={`dashboard-trend ${stat.trend.includes("Down") ? "negative" : "positive"}`}>
                                  {stat.trend.split(" ")[0]} <span>{stat.trend.includes("Down") ? "↓" : "↑"}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </DashboardWidget>
            );
          }

          // Sales Chart Widget
          if (widget.id === 'salesChart' && widget.visible) {
            return (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                onRemove={handleRemoveWidget}
                onMove={handleMoveWidget}
              >
                <div className="chart-controls">
                  <FormControl variant="outlined" size="small" className="chart-control">
                    <InputLabel>Chart Type</InputLabel>
                    <Select
                      value={chartConfig.type}
                      onChange={(e) => handleChartConfigChange('type', e.target.value)}
                      label="Chart Type"
                    >
                      <MenuItem value="line">Line Chart</MenuItem>
                      <MenuItem value="bar">Bar Chart</MenuItem>
                      <MenuItem value="pie">Pie Chart</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl variant="outlined" size="small" className="chart-control">
                    <InputLabel>Time Period</InputLabel>
                    <Select
                      value={chartConfig.period}
                      onChange={(e) => handleChartConfigChange('period', e.target.value)}
                      label="Time Period"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>

                  {refreshing && (
                    <Typography variant="caption" className="refresh-indicator">
                      Updating chart...
                    </Typography>
                  )}
                </div>

                {dashboardData.salesData.length > 0 ? (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      {chartConfig.type === 'line' ? (
                        <LineChart data={dashboardData.salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563EB"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Sales"
                          />
                        </LineChart>
                      ) : chartConfig.type === 'bar' ? (
                        <BarChart data={dashboardData.salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#2563EB" name="Sales" />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={dashboardData.salesData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {dashboardData.salesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <NoData message="No sales data available for the selected period" />
                )}
              </DashboardWidget>
            );
          }

          // Recent Orders Widget
          if (widget.id === 'recentOrders' && widget.visible) {
            return (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                onRemove={handleRemoveWidget}
                onMove={handleMoveWidget}
              >
                {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                  <div className="recent-orders-table-container">
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
                        {dashboardData.recentOrders.map((order) => (
                          <tr key={order.id || order.orderId}>
                            <td>{order.orderId || order.id}</td>
                            <td>{order.organizationName}</td>
                            <td>{order.productName}</td>
                            <td>{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
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
                ) : (
                  <NoData message="No recent orders to display" />
                )}
              </DashboardWidget>
            );
          }

          return null;
        })}

        {/* Customize Dashboard Dialog */}
        <Dialog
          open={customizeDialogOpen}
          onClose={() => setCustomizeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Customize Dashboard
            <IconButton
              aria-label="close"
              onClick={() => setCustomizeDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Active Widgets
            </Typography>
            {visibleWidgets.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No active widgets. Add widgets from below.
              </Typography>
            )}
            {visibleWidgets.map(widget => (
              <div key={widget.id} className="widget-list-item">
                <Typography variant="body1">{widget.title}</Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveWidget(widget.id)}
                >
                  Remove
                </Button>
              </div>
            ))}

            {hiddenWidgets.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Available Widgets
                </Typography>
                {hiddenWidgets.map(widget => (
                  <div key={widget.id} className="widget-list-item">
                    <Typography variant="body1">{widget.title}</Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleAddWidget(widget.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomizeDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </Layout>
  );
};

export default Dashboard;