import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Orders.css";
import { NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  IconButton
} from "@mui/material";
import { FilterList, Clear, ArrowDownward, ArrowUpward } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from "../context/AuthContext";
import apiService from "../utils/api";

const Orders = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const location = useLocation();

    // State for orders data and pagination
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reference to track if a request is in progress
    const requestInProgressRef = useRef(false);

    // Ref to ensure URL parsing only runs once
    const hasRunUrlParsing = useRef(false);

    // Ref to track if component is mounted
    const isMountedRef = useRef(true);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // State for filters
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: null,
        endDate: null,
        minPrice: '',
        maxPrice: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // Use the auth context for API calls and auth state
    const { api, isAuthenticated } = useAuth();

    // Clean up on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Parse URL query parameters on component mount - ONE TIME ONLY
    useEffect(() => {
        // Skip if already run
        if (hasRunUrlParsing.current) return;

        hasRunUrlParsing.current = true;

        const params = new URLSearchParams(location.search);

        // Extract filters from URL
        const status = params.get('status');
        if (status) {
            setFilters(prev => ({ ...prev, status }));
        }

        const startDate = params.get('startDate');
        if (startDate) {
            setFilters(prev => ({ ...prev, startDate }));
        }

        const endDate = params.get('endDate');
        if (endDate) {
            setFilters(prev => ({ ...prev, endDate }));
        }

        const minPrice = params.get('minPrice');
        if (minPrice) {
            setFilters(prev => ({ ...prev, minPrice }));
        }

        const maxPrice = params.get('maxPrice');
        if (maxPrice) {
            setFilters(prev => ({ ...prev, maxPrice }));
        }
    }, []);

    // Fetch orders with robust protection against duplicate calls
    const fetchOrders = useCallback(async () => {
        // Prevent duplicate calls
        if (requestInProgressRef.current) {
            console.log("Request already in progress, skipping duplicate call");
            return;
        }

        // Skip if component unmounted
        if (!isMountedRef.current) return;

        // Track the request
        requestInProgressRef.current = true;
        setLoading(true);

        try {
            if (!isAuthenticated()) {
                console.error("Authentication required");
                setError("You must be logged in to view orders");
                setLoading(false);
                requestInProgressRef.current = false;
                return;
            }

            // Validate companyId exists
            if (!companyId) {
                console.error("Company ID is missing");
                setError("Invalid company ID");
                setLoading(false);
                requestInProgressRef.current = false;
                return;
            }

            // Build query parameters
            const queryParams = new URLSearchParams({
                page: pagination.currentPage - 1, // API may be 0-based
                size: pagination.itemsPerPage
            });

            // Add filters if available
            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }

            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate);
            }

            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate);
            }

            if (filters.minPrice) {
                queryParams.append('minPrice', filters.minPrice);
            }

            if (filters.maxPrice) {
                queryParams.append('maxPrice', filters.maxPrice);
            }

            const endpoint = `/api/admin/company/${companyId}/orders?${queryParams.toString()}`;
            console.log("Fetching orders from:", endpoint);

            // Make API call using the authenticated api instance from context
            const response = await api.get(endpoint);

            // Skip if component unmounted during API call
            if (!isMountedRef.current) return;

            // If the response includes pagination data
            if (response.data && response.data.content) {
                setOrdersData(response.data.content);
                setPagination({
                    currentPage: response.data.number + 1, // Backend page is 0-based
                    totalPages: response.data.totalPages,
                    totalItems: response.data.totalElements,
                    itemsPerPage: response.data.size
                });
            } else {
                // Fallback for non-paginated responses
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
            // Skip if component unmounted during API call
            if (!isMountedRef.current) return;

            console.error("Error fetching orders:", err);

            if (err.response?.status === 401) {
                setError("Unauthorized. Please log in again.");
            } else if (err.response?.status === 404) {
                // Not found - just show empty state
                console.log("No orders found - showing empty state");
                setOrdersData([]);
                setPagination({
                    ...pagination,
                    totalItems: 0,
                    totalPages: 1
                });
            } else {
                setError(err.message || "Failed to load orders. Please try again later.");
            }
        } finally {
            // Skip if component unmounted during API call
            if (isMountedRef.current) {
                setLoading(false);
            }
            requestInProgressRef.current = false;
        }
    }, [companyId, pagination.currentPage, pagination.itemsPerPage, filters, api, isAuthenticated, isMountedRef]);

    // Use a single effect to fetch orders only when needed
    useEffect(() => {
        // Only fetch once on initial load
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only runs once

    // Separate effect to handle filter changes
    useEffect(() => {
        // Skip the initial render
        if (activeFilters.length > 0) {
            // Reset the request tracking flag to ensure we can make a new request
            requestInProgressRef.current = false;
            fetchOrders();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilters]); // Only depend on filters

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
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

        if (filters.startDate) {
            newActiveFilters.push({
                key: 'startDate',
                label: `From: ${filters.startDate}`,
                value: filters.startDate
            });
        }

        if (filters.endDate) {
            newActiveFilters.push({
                key: 'endDate',
                label: `To: ${filters.endDate}`,
                value: filters.endDate
            });
        }

        if (filters.minPrice) {
            newActiveFilters.push({
                key: 'minPrice',
                label: `Min Price: ₹${filters.minPrice}`,
                value: filters.minPrice
            });
        }

        if (filters.maxPrice) {
            newActiveFilters.push({
                key: 'maxPrice',
                label: `Max Price: ₹${filters.maxPrice}`,
                value: filters.maxPrice
            });
        }

        setActiveFilters(newActiveFilters);
        setPagination({...pagination, currentPage: 1}); // Reset to first page on filter apply

        // Reset the request flag to allow a new fetch
        requestInProgressRef.current = false;

        // Wait a tick before fetching to avoid race conditions
        setTimeout(() => {
            fetchOrders();
        }, 0);
    };

    // Reset filters with a single click
    const resetFilters = () => {
        // Reset everything in a single operation to prevent delays
        const defaultFilters = {
            status: 'all',
            startDate: null,
            endDate: null,
            minPrice: '',
            maxPrice: ''
        };

        // Update all states at once before fetching
        setFilters(defaultFilters);
        setActiveFilters([]);
        setPagination({...pagination, currentPage: 1});

        // Reset the request flag
        requestInProgressRef.current = false;

        // Directly fetch orders with the default filters rather than waiting for state updates
        const fetchWithDefaults = async () => {
            try {
                setLoading(true);

                if (!isAuthenticated()) {
                    setError("You must be logged in to view orders");
                    setLoading(false);
                    return;
                }

                if (!companyId) {
                    setError("Invalid company ID");
                    setLoading(false);
                    return;
                }

                // Build simple query params with just pagination
                const queryParams = new URLSearchParams({
                    page: 0, // Reset to first page
                    size: pagination.itemsPerPage
                });

                const endpoint = `/api/admin/company/${companyId}/orders?${queryParams.toString()}`;
                console.log("Resetting and fetching orders from:", endpoint);

                const response = await api.get(endpoint);

                if (response.data && response.data.content) {
                    setOrdersData(response.data.content);
                    setPagination({
                        currentPage: 1, // Force to page 1
                        totalPages: response.data.totalPages,
                        totalItems: response.data.totalElements,
                        itemsPerPage: pagination.itemsPerPage
                    });
                } else {
                    setOrdersData(Array.isArray(response.data) ? response.data : []);
                    const totalItems = Array.isArray(response.data) ? response.data.length : 0;
                    setPagination({
                        currentPage: 1,
                        totalPages: Math.ceil(totalItems / pagination.itemsPerPage),
                        totalItems,
                        itemsPerPage: pagination.itemsPerPage
                    });
                }

                setError(null);
            } catch (err) {
                console.error("Error resetting orders:", err);
                if (err.response?.status === 401) {
                    setError("Unauthorized. Please log in again.");
                } else if (err.response?.status === 404) {
                    setOrdersData([]);
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 0,
                        itemsPerPage: pagination.itemsPerPage
                    });
                } else {
                    setError(err.message || "Failed to reset orders. Please try again.");
                }
            } finally {
                setLoading(false);
                requestInProgressRef.current = false;
            }
        };

        // Execute the fetch immediately
        fetchWithDefaults();
    };

    // Remove specific filter
    const removeFilter = (key) => {
        // For date and price fields, set to null or empty string
        // For status, set to 'all'
        const resetValue = key === 'status' ? 'all' :
                          (key === 'startDate' || key === 'endDate') ? null : '';

        setFilters(prev => ({ ...prev, [key]: resetValue }));
        setActiveFilters(prev => prev.filter(filter => filter.key !== key));

        // Reset the request flag to allow a new fetch
        requestInProgressRef.current = false;

        // Wait a tick before fetching to avoid race conditions
        setTimeout(() => {
            fetchOrders();
        }, 0);
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Handle page change
    const paginate = (pageNumber) => {
        setPagination({...pagination, currentPage: pageNumber});
        requestInProgressRef.current = false; // Reset the request flag

        // Wait a tick before fetching
        setTimeout(() => {
            fetchOrders();
        }, 0);
    };

    // Retry fetching data if there was an error
    const handleRetry = () => {
        requestInProgressRef.current = false; // Reset the flag
        fetchOrders();
    };

    // Loading state
    if (loading && ordersData.length === 0) {
        return (
            <Layout>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="80vh"
                    flexDirection="column"
                >
                    <CircularProgress size={60} thickness={4} sx={{ color: '#2563EB', mb: 2 }} />
                    <Typography variant="body1">Loading orders...</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="orders-header">
                <h2 className="page-title">Order Lists</h2>
                <button
                    className="new-order-button"
                    onClick={() => navigate(`/new-order?companyId=${companyId}`)}
                >
                    New Order
                </button>
            </div>


          {/* Filter Bar */}
          <div className="search-filter-container">
            <div className="filter-section">
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
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small" className="filter-control">
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
                    className="filter-date"
                    InputLabelProps={{
                      shrink: true,
                    }}
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
                    className="filter-date"
                    InputLabelProps={{
                      shrink: true,
                    }}
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
                    className="filter-control"
                    InputProps={{
                      startAdornment: "₹",
                    }}
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
                    className="filter-control"
                    InputProps={{
                      startAdornment: "₹",
                    }}
                  />
                </Grid>
              </Grid>

              <Box className="filter-actions">
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  startIcon={<Clear />}
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

            {/* Error alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {ordersData.length === 0 ? (
                <div className="no-data">
                    <p>No orders found</p>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/new-order?companyId=${companyId}`)}
                        sx={{ mt: 2 }}
                    >
                        Create First Order
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop table view */}
                    <div className="table-container desktop-table-view">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>PRN NO.</th>
                                    <th>Date Of Order</th>
                                    <th>Product Name</th>
                                    <th>Type</th>
                                    <th>Batch Size</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Order Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersData.map((order) => (
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
                                        <td>{order.type || 'N/A'}</td>
                                        <td>{order.batchSizeStrips || 'N/A'}</td>
                                        <td>₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                                        <td>
                                            <span className={`status ${(order.status || '').toLowerCase()}`}>
                                                {order.status || 'Processing'}
                                            </span>
                                        </td>
                                        <td>
                                            <NavLink
                                                to={`/companies/${companyId}/orders/${order.id}/order-details`}
                                                className="table-link"
                                            >
                                                Details
                                            </NavLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="mobile-card-view">
                        {ordersData.map((order) => (
                            <div className="mobile-card" key={order.id}>
                                <div className="mobile-card-header">
                                    <strong>Order #{order.id}</strong>
                                    <span className={`status ${(order.status || '').toLowerCase()}`}>
                                        {order.status || 'Processing'}
                                    </span>
                                </div>

                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Date:</span>
                                    <span className="mobile-card-value">
                                        {order.date
                                            ? new Date(order.date).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                                })
                                            : 'N/A'
                                        }
                                    </span>
                                </div>

                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Product:</span>
                                    <span className="mobile-card-value">{order.productName || 'N/A'}</span>
                                </div>

                                <div className="mobile-card-row">
                                    <span className="mobile-card-label">Amount:</span>
                                    <span className="mobile-card-value">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                                </div>

                                <div className="mobile-card-actions">
                                    <NavLink
                                        to={`/companies/${companyId}/orders/${order.id}/order-details`}
                                        className="mobile-view-button"
                                    >
                                        View Details
                                    </NavLink>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            {/* Previous button */}
                            <button
                                onClick={() => paginate(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className={pagination.currentPage === 1 ? 'disabled' : ''}
                            >
                                &laquo; Prev
                            </button>

                            {/* Page numbers */}
                            {[...Array(pagination.totalPages).keys()].map((pageNum) => {
                                // Show limited page numbers for better UI
                                const pageNumber = pageNum + 1;

                                // Always show first, last, current, and pages adjacent to current
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === pagination.totalPages ||
                                    Math.abs(pageNumber - pagination.currentPage) <= 1
                                ) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className={pagination.currentPage === pageNumber ? 'active' : ''}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                }

                                // Show ellipsis for skipped pages
                                if (
                                    pageNumber === 2 && pagination.currentPage > 3 ||
                                    pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2
                                ) {
                                    return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                                }

                                return null;
                            })}

                            {/* Next button */}
                            <button
                                onClick={() => paginate(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className={pagination.currentPage === pagination.totalPages ? 'disabled' : ''}
                            >
                                Next &raquo;
                            </button>
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
};

export default Orders;