import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout/Layout";
import { NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Button,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid
} from "@mui/material";
import { FilterList, Clear } from '@mui/icons-material';
import { useAuth } from "../context/AuthContext";
import apiService from "../utils/api";

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-rose-100 text-rose-700",
  default: "bg-gray-100 text-gray-700"
};

const Orders = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const location = useLocation();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestInProgressRef = useRef(false);
  const isMountedRef = useRef(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: null,
    endDate: null,
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const { api, isAuthenticated } = useAuth();

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (requestInProgressRef.current || !isMountedRef.current) return;
    requestInProgressRef.current = true;
    setLoading(true);

    try {
      if (!isAuthenticated()) {
        setError("You must be logged in to view orders");
        setLoading(false);
        requestInProgressRef.current = false;
        return;
      }
      if (!companyId) {
        setError("Invalid company ID");
        setLoading(false);
        requestInProgressRef.current = false;
        return;
      }
      const queryParams = new URLSearchParams({
        page: pagination.currentPage - 1,
        size: pagination.itemsPerPage
      });
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      const endpoint = `/api/admin/company/${companyId}/orders?${queryParams.toString()}`;
      const response = await api.get(endpoint);

      if (!isMountedRef.current) return;
      if (response.data && response.data.content) {
        setOrdersData(response.data.content);
        setPagination({
          currentPage: response.data.number + 1,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalElements,
          itemsPerPage: response.data.size
        });
      } else {
        setOrdersData(Array.isArray(response.data) ? response.data : []);
        const totalItems = Array.isArray(response.data) ? response.data.length : 0;
        setPagination({
          ...pagination,
          totalItems,
          totalPages: Math.ceil(totalItems / pagination.itemsPerPage)
        });
      }
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err.message || "Failed to load orders. Please try again later.");
    } finally {
      if (isMountedRef.current) setLoading(false);
      requestInProgressRef.current = false;
    }
  }, [companyId, pagination.currentPage, pagination.itemsPerPage, filters, api, isAuthenticated, pagination]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Filter logic
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const newActiveFilters = [];
    if (filters.status && filters.status !== 'all') newActiveFilters.push({ key: 'status', label: `Status: ${filters.status}` });
    if (filters.startDate) newActiveFilters.push({ key: 'startDate', label: `From: ${filters.startDate}` });
    if (filters.endDate) newActiveFilters.push({ key: 'endDate', label: `To: ${filters.endDate}` });
    if (filters.minPrice) newActiveFilters.push({ key: 'minPrice', label: `Min Price: ₹${filters.minPrice}` });
    if (filters.maxPrice) newActiveFilters.push({ key: 'maxPrice', label: `Max Price: ₹${filters.maxPrice}` });
    setActiveFilters(newActiveFilters);
    setPagination({ ...pagination, currentPage: 1 });
    requestInProgressRef.current = false;
    setTimeout(() => { fetchOrders(); }, 0);
  };

  const resetFilters = () => {
    setFilters({ status: 'all', startDate: null, endDate: null, minPrice: '', maxPrice: '' });
    setActiveFilters([]);
    setPagination({ ...pagination, currentPage: 1 });
    requestInProgressRef.current = false;
    setTimeout(() => { fetchOrders(); }, 0);
  };

  const removeFilter = (key) => {
    const resetValue = key === 'status' ? 'all' :
      (key === 'startDate' || key === 'endDate') ? null : '';
    setFilters(prev => ({ ...prev, [key]: resetValue }));
    setActiveFilters(prev => prev.filter(filter => filter.key !== key));
    requestInProgressRef.current = false;
    setTimeout(() => { fetchOrders(); }, 0);
  };

  const paginate = (pageNumber) => {
    setPagination({ ...pagination, currentPage: pageNumber });
    requestInProgressRef.current = false;
    setTimeout(() => { fetchOrders(); }, 0);
  };

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  // UI
  if (loading && ordersData.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <CircularProgress size={56} />
          <Typography className="mt-4 text-blue-700 font-medium">Loading orders...</Typography>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Order List</h2>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transition"
          onClick={() => navigate(`/new-order?companyId=${companyId}`)}
        >
          New Order
        </button>
      </div>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={showFilters ? "contained" : "outlined"}
          color="primary"
          startIcon={<FilterList />}
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg"
        >
          Filters {activeFilters.length > 0 && (
            <span className="ml-1 text-xs font-semibold">{activeFilters.length}</span>
          )}
        </Button>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() => removeFilter(filter.key)}
                color="primary"
                variant="outlined"
                size="small"
                className="rounded"
              />
            ))}
            <Chip
              label="Clear All"
              onClick={resetFilters}
              color="secondary"
              size="small"
              className="rounded"
              disabled={loading}
            />
          </div>
        )}
      </div>
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-700">
            Advanced Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  name="status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="From Date"
                type="date"
                name="startDate"
                value={filters.startDate || ""}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="To Date"
                type="date"
                name="endDate"
                value={filters.endDate || ""}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Min Price"
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputProps={{ startAdornment: "₹" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Max Price"
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputProps={{ startAdornment: "₹" }}
              />
            </Grid>
          </Grid>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outlined"
              onClick={resetFilters}
              startIcon={<Clear />}
              className="rounded"
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              startIcon={<FilterList />}
              className="rounded"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      {/* Error alert */}
      {error && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}
      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-blue-100">
          <thead>
            <tr>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Order ID</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">PRN NO.</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Date Of Order</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Product Name</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Type</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Batch Size</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Total Amount</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Status</th>
              <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {ordersData.map((order) => (
              <tr key={order.id} className="hover:bg-blue-50 transition">
                <td className="px-5 py-4 text-gray-800">{order.id || 'N/A'}</td>
                <td className="px-5 py-4 text-gray-700">{order.prnNo || 'N/A'}</td>
                <td className="px-5 py-4 text-gray-700">
                  {order.date
                    ? new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </td>
                <td className="px-5 py-4 text-gray-700">{order.productName || 'N/A'}</td>
                <td className="px-5 py-4 text-gray-700">{order.type || 'N/A'}</td>
                <td className="px-5 py-4 text-gray-700">{order.batchSizeStrips || 'N/A'}</td>
                <td className="px-5 py-4 text-gray-800 font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                <td className="px-5 py-4">
                  <span className={
                    "inline-block px-4 py-1 rounded-full text-xs font-semibold shadow " +
                    (STATUS_COLORS[(order.status || '').toLowerCase()] || STATUS_COLORS.default)
                  }>
                    {order.status || 'Processing'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/companies/${companyId}/orders/${order.id}/order-details`)}
                    className="rounded-lg bg-blue-600 text-white shadow"
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            onClick={() => paginate(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="rounded"
          >
            &laquo; Prev
          </Button>
          {[...Array(pagination.totalPages).keys()].map((pageNum) => {
            const pageNumber = pageNum + 1;
            if (
              pageNumber === 1 ||
              pageNumber === pagination.totalPages ||
              Math.abs(pageNumber - pagination.currentPage) <= 1
            ) {
              return (
                <Button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  variant={pagination.currentPage === pageNumber ? "contained" : "outlined"}
                  color={pagination.currentPage === pageNumber ? "primary" : "inherit"}
                  className="rounded"
                >
                  {pageNumber}
                </Button>
              );
            }
            if (
              (pageNumber === 2 && pagination.currentPage > 3) ||
              (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
            ) {
              return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
            }
            return null;
          })}
          <Button
            onClick={() => paginate(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="rounded"
          >
            Next &raquo;
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
