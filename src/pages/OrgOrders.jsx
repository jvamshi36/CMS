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
  Grid,
  Alert,
} from "@mui/material";
import { FilterList, Clear, Visibility} from '@mui/icons-material';
import apiService from "../utils/api";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-rose-100 text-rose-700",
  default: "bg-gray-100 text-gray-700"
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return "Invalid date";
  }
};

const OrgOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Filters
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
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const applyFilters = () => {
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

  const ordersArray = Array.isArray(orders) ? orders : [];
  const filteredOrders = ordersArray.filter(order => {
    const matchesStatus = filters.status === 'all' || (order.status && order.status.toLowerCase() === filters.status.toLowerCase());
    const matchesSearch = !filters.searchTerm || (
      (order.id && order.id.toString().includes(filters.searchTerm)) ||
      (order.productName && order.productName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (order.prnNo && order.prnNo.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    );
    let matchesDateRange = true;
    if (filters.startDate) {
      const orderDate = new Date(order.date || '');
      const startDate = new Date(filters.startDate);
      matchesDateRange = orderDate >= startDate;
    }
    if (filters.endDate && matchesDateRange) {
      const orderDate = new Date(order.date || '');
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      matchesDateRange = orderDate <= endDate;
    }
    return matchesStatus && matchesSearch && matchesDateRange;
  });
  const currentOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && !orders.length) {
    return (
      <OrgLayout>
        <Box className="flex flex-col items-center justify-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <CircularProgress />
          <Typography variant="body1" className="mt-4 text-blue-700">Loading orders...</Typography>
        </Box>
      </OrgLayout>
    );
  }

  if (error && !orders.length) {
    return (
      <OrgLayout>
        <Box className="flex flex-col items-center justify-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <Typography variant="h6" color="error">Something went wrong</Typography>
          <Typography variant="body1">{error}</Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white"
          >
            Retry
          </Button>
        </Box>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Your Orders</h2>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transition"
          onClick={() => navigate("/org/new-order")}
        >
          Place New Order
        </button>
      </div>

      {/* Filters and Search */}
      <div className="relative mb-6 font-sans">
        <div className="flex items-center justify-end gap-4 mb-4">
          <TextField
            label="Search by Order ID, Product, or PRN"
            variant="outlined"
            size="small"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="bg-white rounded-lg"
            style={{ minWidth: '240px' }}
          />
          <Button
            variant={showFilters ? "contained" : "outlined"}
            color="primary"
            startIcon={<FilterList />}
            onClick={toggleFilters}
            className="rounded-xl px-6 py-2 font-semibold shadow-md backdrop-blur-md border border-white/30 transition"
          >
            Filters {activeFilters.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-cyan-500 text-white rounded-full w-6 h-6 text-xs font-bold shadow">{activeFilters.length}</span>
            )}
          </Button>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-gradient-to-tr from-white/40 to-white/10 border border-white/20 shadow backdrop-blur">
            {activeFilters.map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() => removeFilter(filter.key)}
                color="primary"
                variant="outlined"
                size="small"
                className="rounded-full"
              />
            ))}
            <Chip
              label="Clear All"
              onClick={resetFilters}
              color="secondary"
              size="small"
              className="rounded-full bg-purple-100 font-semibold"
              disabled={loading}
            />
          </div>
        )}
        <div className={`${showFilters ? "max-h-[500px] py-6" : "max-h-0 py-0"} overflow-hidden transition-all duration-500 mb-4`}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 shadow-lg border border-white/20 backdrop-blur-xl relative">
            <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400 opacity-80 rounded-t-2xl"></span>
            <h3 className="mb-4 text-lg font-bold text-gray-800">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  name="status"
                  onChange={handleFilterChange}
                  className="rounded-lg bg-white/60"
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="From Date"
                type="date"
                name="startDate"
                value={filters.startDate || ""}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                className="rounded-lg bg-white/60"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To Date"
                type="date"
                name="endDate"
                value={filters.endDate || ""}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                className="rounded-lg bg-white/60"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outlined"
                onClick={resetFilters}
                startIcon={<Clear />}
                disabled={loading}
                className="rounded-xl px-5 py-2 font-semibold"
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                startIcon={<FilterList />}
                className="rounded-xl px-5 py-2 font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/70 backdrop-blur-md mb-8">
        {orders.length > 0 && filteredOrders.length > 0 ? (
          <>
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
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition">
                    <td className="px-5 py-4 text-gray-800">{order.id || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-700">{order.prnNo|| 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-700">{order.date
                      ? new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'}</td>
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
                       variant="outlined"
                        size="small"
                        tartIcon={<Visibility />}
                        onClick={() => navigate(`/org/orders/${order.id}`)}
                        className="text-blue-600 hover:underline px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition"
                      >
                        View Details
                      </Button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              className="border-t border-blue-100"
            />
          </>
        ) : (
          <Box className="text-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
            <Typography variant="h6" className="text-gray-700 mb-2">
              No orders found
            </Typography>
            <Typography variant="body1" className="text-gray-500 mb-4">
              {activeFilters.length > 0
                ? "Try adjusting your search or filter criteria."
                : "You haven't placed any orders yet."}
            </Typography>
            {activeFilters.length === 0 && (
              <Button
                variant="contained"
                onClick={() => navigate("/org/new-order")}
                className="bg-blue-600 text-white rounded-lg shadow"
              >
                Place Your First Order
              </Button>
            )}
          </Box>
        )}
      </div>
    </OrgLayout>
  );
};

export default OrgOrders;
