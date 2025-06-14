import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout/Layout";
import { NavLink, useNavigate } from "react-router-dom"; // NavLink if needed for internal table links
import {
  Alert, // Using MUI Alert directly for Snackbar
  Snackbar,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  TablePagination,
  Box, // Use Box for div-like elements with MUI styling
  Typography, // Use Typography for text elements
  Paper, // Use Paper for elevated sections like the table container
  Table,
  TableBody,
  TabbleCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  InputAdornment,
  useTheme, // To access theme for consistent colors
  Fade, // For smooth transitions
  Skeleton, // For skeleton loading
} from "@mui/material";
import {
  Visibility,
  Refresh,
  Search,
  Business,
  ShoppingCart,
  MonetizationOn,
  AccessTime,
  FilterList, // For filter button
  Clear, // For clear filters
  ArrowDownward, // For sort direction
  ArrowUpward, // For sort direction
} from "@mui/icons-material";
import apiService from "../utils/api";

// Custom Alert component for Snackbar, matching Companies
const CustomAlert = React.forwardRef(function CustomAlert(props, ref) {
  return <Alert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PendingOrders = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Access the Material-UI theme

  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(""); // <--- Add this line

  const requestInProgressRef = useRef(false);
  const isMountedRef = useRef(true);

  const [filters, setFilters] = useState({
    priority: 'all',
    submittedAtStart: null,
    submittedAtEnd: null,
  });
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" }); // Default sort to date desc
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Theme-derived colors for consistent styling
  const COLORS = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    background: theme.palette.background.default,
    paper: theme.palette.background.paper,
    divider: theme.palette.divider,
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      apiService.clearPendingRequests(); // Assuming apiService has this method
    };
  }, []);

  const fetchPendingOrders = useCallback(async (applyCurrentFilters = true) => {
    if (requestInProgressRef.current) return;
    if (!isMountedRef.current) return;

    requestInProgressRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get("/api/admin/orders/pending");
      if (!isMountedRef.current) return;

      let processedOrders = Array.isArray(response) ? response : [];

      // Apply current filters if specified
      if (applyCurrentFilters) {
        if (filters.priority !== 'all') {
          processedOrders = processedOrders.filter(order =>
            getPriority(order.date) === filters.priority
          );
        }
        if (filters.submittedAtStart) {
          const startDate = new Date(filters.submittedAtStart);
          processedOrders = processedOrders.filter(order => {
            if (!order.date) return false;
            return new Date(order.date) >= startDate;
          });
        }
        if (filters.submittedAtEnd) {
          const endDate = new Date(filters.submittedAtEnd);
          processedOrders = processedOrders.filter(order => {
            if (!order.date) return false;
            return new Date(order.date) <= endDate;
          });
        }
      } else { // Reset filters locally for the fetch operation
          // This block is for initial fetch or explicit reset where filters are not applied yet
          // In a real app, you might refetch everything or pass default filters
      }

      // Sort data
      const sortedData = [...processedOrders].sort((a, b) => {
        let valA, valB;
        switch (sortConfig.key) {
          case "organizationName":
            valA = (a.organizationName || "").toLowerCase();
            valB = (b.organizationName || "").toLowerCase();
            break;
          case "productName":
            valA = (a.productName || "").toLowerCase();
            valB = (b.productName || "").toLowerCase();
            break;
          case "totalAmount":
            valA = a.totalAmount || 0;
            valB = b.totalAmount || 0;
            break;
          case "date": // This is for 'Time Submitted'
          default:
            valA = new Date(a.date || 0).getTime();
            valB = new Date(b.date || 0).getTime();
            break;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });

      setPendingOrders(sortedData);
      setSnackbar({ open: true, message: "Order list refreshed!", severity: "success" });
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Error fetching pending orders:", err);
      setError(
        err.message || "Failed to load pending orders. Please try again later."
      );
      setPendingOrders([]);
      setSnackbar({ open: true, message: err.message || "Failed to refresh orders.", severity: "error" });
    } finally {
      if (isMountedRef.current) setLoading(false);
      requestInProgressRef.current = false;
    }
  }, [filters, sortConfig]); // Depend on filters and sortConfig

  useEffect(() => {
    // Initial fetch of data when component mounts
    fetchPendingOrders();
  }, [fetchPendingOrders]); // Re-fetch when fetchPendingOrders callback changes (due to its dependencies)


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/pending-orders/${orderId}`);
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

  const getTimeSinceOrder = (dateString) => {
    if (!dateString) return "Unknown";

    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderDate;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  const getPriority = (dateString) => {
    if (!dateString) return "low";

    const orderDate = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - orderDate) / (1000 * 60 * 60));

    if (diffHours >= 72) { // Older than 3 days
      return "high";
    }
    if (diffHours >= 24) { // Older than 1 day
      return "medium";
    }
    return "low"; // Less than 1 day
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = useCallback(() => {
    const newActiveFilters = [];
    if (filters.priority && filters.priority !== 'all') {
      newActiveFilters.push({ key: 'priority', label: `Priority: ${filters.priority}`, value: filters.priority });
    }
    if (filters.submittedAtStart) {
      newActiveFilters.push({ key: 'submittedAtStart', label: `From: ${new Date(filters.submittedAtStart).toLocaleDateString()}`, value: filters.submittedAtStart });
    }
    if (filters.submittedAtEnd) {
      newActiveFilters.push({ key: 'submittedAtEnd', label: `To: ${new Date(filters.submittedAtEnd).toLocaleDateString()}`, value: filters.submittedAtEnd });
    }
    setActiveFilters(newActiveFilters);
    setPage(0); // Reset page when filters change
    fetchPendingOrders(true); // Re-fetch with applied filters
  }, [filters, fetchPendingOrders]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      priority: 'all',
      submittedAtStart: null,
      submittedAtEnd: null,
    };
    setFilters(defaultFilters);
    setActiveFilters([]);
    setPage(0); // Reset page on filter clear
    setSearchTerm(""); // Also clear search term
    fetchPendingOrders(false); // Re-fetch without applying filters
  }, [fetchPendingOrders]);

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: key.includes('submittedAt') ? null : 'all' }));
    setActiveFilters(prev => prev.filter(filter => filter.key !== key));
    setPage(0); // Reset page when filter is removed
    // After removing a filter, we need to re-apply the remaining filters
    // This will be handled by the useEffect watching `filters` or `activeFilters` changes if we were to introduce that
    // For now, re-calling fetchPendingOrders will do the trick if filters are dependencies.
  };

  useEffect(() => {
    // This useEffect ensures that when filters state changes (e.g., from `removeFilter`),
    // the data is re-fetched.
    // It's good practice to have filters/sort changes trigger a data update.
    // Only fetch if a filter is active or search term exists or sort config is not default
    if (activeFilters.length > 0 || searchTerm !== "" || sortConfig.key !== "date" || sortConfig.direction !== "desc") {
        fetchPendingOrders(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, searchTerm, sortConfig]); // Add searchTerm to dependencies

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleRetry = () => {
    requestInProgressRef.current = false; // Reset ref before retrying
    fetchPendingOrders();
  };
  const toggleFilters = () => setShowFilters(!showFilters);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpward fontSize="small" />
      ) : (
        <ArrowDownward fontSize="small" />
      );
    }
    return null;
  };

  const getPriorityChipStyle = (priority) => {
    let bgColor;
    let textColor = COLORS.textPrimary; // Default to dark text for yellow/light colors
    switch (priority) {
      case "high":
        bgColor = COLORS.error; // Red
        textColor = "#fff";
        break;
      case "medium":
        bgColor = COLORS.info; // Indigo
        textColor = "#fff";
        break;
      case "low":
      default:
        bgColor = COLORS.success; // Green (or your specific accent color)
        textColor = "#fff"; // Assuming white text looks good on green
        break;
    }
    return {
      backgroundColor: bgColor,
      color: textColor,
      fontWeight: 600,
      fontSize: "0.75rem",
      padding: '4px 8px', // px-2 py-1 equivalent
      borderRadius: '4px', // rounded equivalent
      boxShadow: `0 1px 2px rgba(0,0,0,0.1)`, // subtle shadow
    };
  };

  const getCurrentPageOrders = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return pendingOrders.slice(startIndex, endIndex);
  };

  const currentPageOrders = getCurrentPageOrders();

  if (loading && !pendingOrders.length) {
    return (
      <Layout>
        <Box className="flex flex-col items-center justify-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <CircularProgress size={60} thickness={4} sx={{ color: COLORS.primary }} />
          <Typography className="mt-4 text-lg" sx={{ color: COLORS.primary }}>
            Loading pending orders...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (error && !pendingOrders.length && !loading) { // Only show error if no data and not loading
    return (
      <Layout>
        <Box className="flex flex-col items-center justify-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <Typography variant="h5" className="font-semibold mb-2" sx={{ color: COLORS.error }}>
            Something went wrong
          </Typography>
          <Typography className="text-gray-700">{error}</Typography>
          <Button variant="contained" onClick={handleRetry} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            Retry
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold">Pending Orders</h2>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transition"
                onClick={() => navigate("/new-order")}
              >
                Create New Order
              </button>
            </div>

      {/* Filters and Search Section */}
      <Box className="relative mb-6 font-sans">
        <Box className="flex items-center justify-end gap-4 mb-4">
          <TextField
              variant="outlined"
              size="small"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              className="w-full sm:w-[200px] md:w-[250px] rounded-lg bg-white/60"
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
          <Tooltip title="Refresh Order List">
              <IconButton
                onClick={fetchPendingOrders}
                sx={{
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                  border: '1px solid',
                  '&:hover': {
                    backgroundColor: `${COLORS.primary}10`,
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
        </Box>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <Box className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-gradient-to-tr from-white/40 to-white/10 border border-white/20 shadow backdrop-blur">
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
          </Box>
        )}

        {/* Collapsible Filter Panel */}
        <Box className={`${showFilters ? "max-h-[500px] py-6" : "max-h-0 py-0"} overflow-hidden transition-all duration-500 mb-4`}>
          <Box className="p-6 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 shadow-lg border border-white/20 backdrop-blur-xl relative">
            <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400 opacity-80 rounded-t-2xl"></span>
            <Typography variant="h6" className="mb-4 text-lg font-bold text-gray-800">Advanced Filters</Typography>
            <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  name="priority"
                  onChange={handleFilterChange}
                  className="rounded-lg bg-white/60"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="From Date"
                type="date"
                name="submittedAtStart"
                value={filters.submittedAtStart || ""}
                onChange={handleDateChange}
                fullWidth
                size="small"
                className="rounded-lg bg-white/60"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To Date"
                type="date"
                name="submittedAtEnd"
                value={filters.submittedAtEnd || ""}
                onChange={handleDateChange}
                fullWidth
                size="small"
                className="rounded-lg bg-white/60"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box className="flex justify-end gap-4 mt-6">
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
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content: Table or No Orders Message */}
      {pendingOrders.length === 0 && !loading && !error ? (
        <Box className="text-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <Typography variant="h6" className="text-gray-600 mb-4">
            {searchTerm || filters.priority !== "all" || filters.submittedAtStart || filters.submittedAtEnd
              ? "No matching pending orders found."
              : "No pending orders at the moment."}
          </Typography>
          {(searchTerm || filters.priority !== "all" || filters.submittedAtStart || filters.submittedAtEnd) && (
            <Button
              variant="outlined"
              onClick={resetFilters}
              startIcon={<Clear />}
              className="mt-4 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Clear Filters & Search
            </Button>
          )}
          {!searchTerm && filters.priority === "all" && !filters.submittedAtStart && !filters.submittedAtEnd && (
            <Button
              variant="contained"
              onClick={() => navigate("/new-order")} // Assuming a route to create a new order
              className="mt-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:scale-105 transition"
            >
              Create Your First Order
            </Button>
          )}
        </Box>
      ) : (
<div className="overflow-x-auto rounded-2xl shadow-lg bg-white/70 backdrop-blur-md mb-8">
  <table className="min-w-full divide-y divide-blue-100">
    <thead>
      <tr>
        <th
          className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
          onClick={() => handleSort("id")}
        >
                    <Box className="flex items-center gap-1">
                        Order ID {getSortIcon("id")}
                    </Box>
                  </th>
                  <th
                    className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                    onClick={() => handleSort("organizationName")}
                  >
                    <Box className="flex items-center gap-1">
                      <Business fontSize="small" className="mr-1" /> Organization {getSortIcon("organizationName")}
                    </Box>
                  </th>
                  <th
                    className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                    onClick={() => handleSort("productName")}
                  >
                    <Box className="flex items-center gap-1">
                      <ShoppingCart fontSize="small" className="mr-1" /> Product {getSortIcon("productName")}
                    </Box>
                  </th>
                  <th
                    className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                    onClick={() => handleSort("date")}
                  >
                    <Box className="flex items-center gap-1">
                      <AccessTime fontSize="small" className="mr-1" /> Time Submitted {getSortIcon("date")}
                    </Box>
                  </th>
                  <th
                    className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                    onClick={() => handleSort("totalAmount")}
                  >
                    <Box className="flex items-center gap-1">
                      <MonetizationOn fontSize="small" className="mr-1" /> Total Amount {getSortIcon("totalAmount")}
                    </Box>
                  </th>
                  <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Priority</th>
                  <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {loading ? (
                    // Skeleton rows when loading and data is empty
                    Array.from(new Array(rowsPerPage)).map((_, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition">
                        <td className="px-5 py-4"><Skeleton variant="text" width={80} /></td>
                        <td className="px-5 py-4"><Skeleton variant="text" width={150} /></td>
                        <td className="px-5 py-4"><Skeleton variant="text" width={150} /></td>
                        <td className="px-5 py-4"><Skeleton variant="text" width={100} /></td>
                        <td className="px-5 py-4"><Skeleton variant="text" width={80} /></td>
                        <td className="px-5 py-4"><Skeleton variant="text" width={60} /></td>
                        <td className="px-5 py-4"><Skeleton variant="text" width={70} /></td>
                      </tr>
                    ))
                ) : (
                  currentPageOrders.map((order) => {
                    const priority = getPriority(order.date);
                    const isHighPriority = priority === "high";
                    return (
                      <Fade in={true} key={order.id} timeout={500}>
                        <tr className={`hover:bg-blue-50 transition ${isHighPriority ? 'bg-rose-50/70' : ''}`}>
                          <td className="px-5 py-4 text-gray-800">{order.id}</td>
                          <td className="px-5 py-4 text-gray-700">{order.organizationName}</td>
                          <td className="px-5 py-4 text-gray-700">{order.productName}</td>
                          <td className="px-5 py-4 text-gray-600">
                            <Tooltip title={formatDate(order.date)} arrow>
                              <span>{getTimeSinceOrder(order.date)}</span>
                            </Tooltip>
                          </td>
                          <td className="px-5 py-4 text-gray-800 font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                          <td className="px-5 py-4">
                            <span
                              className="inline-block px-4 py-1 rounded-full text-white font-semibold shadow"
                              style={getPriorityChipStyle(priority)}
                            >
                              {priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewOrder(order.id)}
                              className="text-blue-600 hover:underline px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition"
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      </Fade>
                    );
                  })
                )}
              </tbody>
    </table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pendingOrders.length} // Count of filtered and sorted orders
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="border-t border-blue-100"
          />
        </div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <CustomAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </CustomAlert>
      </Snackbar>
    </Layout>
  );
};

export default PendingOrders;