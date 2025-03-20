// src/pages/OrgOrders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrgLayout from "../components/Layout/OrgLayout";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Grid
} from "@mui/material";
import { FilterList, Clear } from '@mui/icons-material';
import apiService from "../utils/api";
import "../styles/Orders.css";

const OrgOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
    startDate: null,
    endDate: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await apiService.get("/api/org/orders");
        // Ensure orders is always an array and has no dummy data
        const validOrders = Array.isArray(data) ? data : [];

        // Make sure we're working with real data, not placeholder or dummy data
        setOrders(validOrders);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders. Please try again later.");
        setOrders([]); // Set orders to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    // Build active filters array for display
    const newActiveFilters = [];

    if (filters.status && filters.status !== 'all') {
      newActiveFilters.push({
        key: 'status',
        label: `Status: ${filters.status}`,
        value: filters.status
      });
    }

    if (filters.searchTerm) {
      newActiveFilters.push({
        key: 'searchTerm',
        label: `Search: ${filters.searchTerm}`,
        value: filters.searchTerm
      });
    }

    if (filters.startDate) {
      newActiveFilters.push({
        key: 'startDate',
        label: `From: ${new Date(filters.startDate).toLocaleDateString()}`,
        value: filters.startDate
      });
    }

    if (filters.endDate) {
      newActiveFilters.push({
        key: 'endDate',
        label: `To: ${new Date(filters.endDate).toLocaleDateString()}`,
        value: filters.endDate
      });
    }

    setActiveFilters(newActiveFilters);
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      searchTerm: '',
      startDate: null,
      endDate: null
    });
    setActiveFilters([]);
    setPage(0);
  };

  const removeFilter = (key) => {
    const resetValue = key === 'status' ? 'all' :
                      (key === 'startDate' || key === 'endDate') ? null : '';

    setFilters(prev => ({ ...prev, [key]: resetValue }));
    setActiveFilters(prev => prev.filter(filter => filter.key !== key));
    setPage(0);
  };

  // Ensure we're working with an array and not default/dummy data
  const ordersArray = Array.isArray(orders) ? orders : [];

  // Search input for ID search
  const [searchInput, setSearchInput] = useState('');

  // Filter orders based on all filters
  const filteredOrders = ordersArray.filter(order => {
    // Status filter
    const matchesStatus = filters.status === 'all' || order.status === filters.status;

    // Search term filter
    const matchesSearch = !filters.searchTerm || (
      (order.id && order.id.toString().includes(filters.searchTerm)) ||
      (order.productName && order.productName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (order.prnNo && order.prnNo.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    );

    // Date range filter
    let matchesDateRange = true;
    if (filters.startDate) {
      const orderDate = new Date(order.date || '');
      const startDate = new Date(filters.startDate);
      matchesDateRange = orderDate >= startDate;
    }

    if (filters.endDate && matchesDateRange) {
      const orderDate = new Date(order.date || '');
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      matchesDateRange = orderDate <= endDate;
    }

    return matchesStatus && matchesSearch && matchesDateRange;
  });

  // Get current page orders
  const currentOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Loading state only when initially loading
  if (loading && !orders.length) {
    return (
      <OrgLayout>
        <Box className="orders-loading">
          <CircularProgress />
          <Typography variant="body1">Loading orders...</Typography>
        </Box>
      </OrgLayout>
    );
  }

  // Error state only when an error occurred and no orders are available
  if (error && !orders.length) {
    return (
      <OrgLayout>
        <Box className="orders-error">
          <Typography variant="h6" color="error">Something went wrong</Typography>
          <Typography variant="body1">{error}</Typography>
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
      <div className="orders-container">
        <Box className="orders-header">
          <Typography variant="h4" className="page-title">
            Your Orders
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/org/new-order")}
            className="new-order-button"
          >
            Place New Order
          </Button>
        </Box>

        {/* Only show filters if there are orders */}
        {orders.length > 0 && (
          <div className="filter-component">
            {/* Filter Bar */}
            <div className="search-filter-container">
              <div className="filter-section">
                <TextField
                  label="Search by Order ID, Product, or PRN"
                  variant="outlined"
                  size="small"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="search-input"
                  style={{ marginRight: '16px', minWidth: '240px' }}
                />
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  color="primary"
                  startIcon={<FilterList />}
                  onClick={toggleFilters}
                  className="filter-button"
                >
                  Filters {activeFilters.length > 0 && (
                    <span className="filter-count">{activeFilters.length}</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="active-filters">
                {activeFilters.map((filter) => (
                  <Chip
                    key={filter.key}
                    label={filter.label}
                    onDelete={() => removeFilter(filter.key)}
                    color="primary"
                    variant="outlined"
                    size="small"
                    className="filter-chip"
                  />
                ))}

                <Chip
                  label="Clear All"
                  onClick={resetFilters}
                  color="secondary"
                  size="small"
                  className="filter-chip clear-all"
                  disabled={loading}
                />
              </div>
            )}

            {/* Filters Panel */}
            <div className={`filters-collapse ${showFilters ? 'expanded' : 'collapsed'}`}>
              <div className="filters-panel">
                <Typography variant="h6" className="filters-title">
                  Advanced Filters
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small" className="filter-control">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        label="Status"
                        name="status"
                        onChange={handleFilterChange}
                      >
                        <MenuItem value="all">All Orders</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Processing">Processing</MenuItem>
                        <MenuItem value="Shipped">Shipped</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="From Date"
                      type="date"
                      name="startDate"
                      value={filters.startDate || ""}
                      onChange={handleFilterChange}
                      fullWidth
                      size="small"
                      className="filter-date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="To Date"
                      type="date"
                      name="endDate"
                      value={filters.endDate || ""}
                      onChange={handleFilterChange}
                      fullWidth
                      size="small"
                      className="filter-date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>

                <Box className="filter-actions">
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    startIcon={<Clear />}
                    disabled={loading}
                    className="reset-button"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<FilterList />}
                    className="apply-button"
                  >
                    Apply Filters
                  </Button>
                </Box>
              </div>
            </div>
          </div>
        )}

        <Paper className="orders-table-container">
          {orders.length > 0 && filteredOrders.length > 0 ? (
            <>
              <TableContainer>
                <Table aria-label="orders table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>PRN NO.</TableCell>
                      <TableCell>Date Of Order</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Batch Size</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id || 'N/A'}</TableCell>
                        <TableCell>{order.prnNo|| 'N/A'}</TableCell>
                        <TableCell>{order.date?
                            new Date(order.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                                })
                            : 'N/A'
                        }</TableCell>
                        <TableCell>{order.productName || 'N/A'}</TableCell>
                        <TableCell>{order.type || 'N/A'}</TableCell>
                        <TableCell>{order.batchSizeStrips || 'N/A'}</TableCell>
                        <TableCell>₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <span className={`status ${(order.status || '').toLowerCase()}`}>
                            {order.status || 'Processing'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(`/org/orders/${order.id}`)}
                            className="view-order-button"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Box className="no-orders">
              <Typography variant="h6">No orders found</Typography>
              <Typography variant="body1">
                {activeFilters.length > 0
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't placed any orders yet."}
              </Typography>
              {activeFilters.length === 0 && (
                <Button
                  variant="contained"
                  onClick={() => navigate("/org/new-order")}
                  className="first-order-button"
                >
                  Place Your First Order
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </div>
    </OrgLayout>
  );
};

export default OrgOrders;