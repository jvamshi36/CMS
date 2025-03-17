import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Orders.css";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Button, Alert } from "@mui/material";
import AdvancedSearchFilter from "../components/AdvancedSearchFilter/AdvancedSearchFilter";
import { useAuth } from "../context/AuthContext";
import apiService from "../utils/api";

const Orders = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();

    // State for orders data and pagination
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: null,
        endDate: null,
        minPrice: '',
        maxPrice: ''
    });

    // Use the auth context for API calls and auth state
    const { api, isAuthenticated } = useAuth();

    // Only fetch when these dependencies change - prevents infinite loops
    useEffect(() => {
        fetchOrders();
    }, [companyId, pagination.currentPage, searchTerm,
        filters.status, filters.startDate, filters.endDate,
        filters.minPrice, filters.maxPrice]);

    // Fetch orders with pagination and filters
    const fetchOrders = async () => {
        setLoading(true);

        try {
            if (!isAuthenticated()) {
                console.error("Authentication required");
                setError("You must be logged in to view orders");
                setLoading(false);
                return;
            }

            // Validate companyId exists
            if (!companyId) {
                console.error("Company ID is missing");
                setError("Invalid company ID");
                setLoading(false);
                return;
            }

            // Build query parameters
            const queryParams = new URLSearchParams({
                page: pagination.currentPage - 1, // API may be 0-based
                size: pagination.itemsPerPage
            });

            // Add search term if provided
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            // Add filters if available
            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }

            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate.toISOString().split('T')[0]);
            }

            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate.toISOString().split('T')[0]);
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
            setLoading(false);
        }
    };

    // Handle search - don't call fetchOrders directly, the useEffect will trigger it
    const handleSearch = (term) => {
        setSearchTerm(term);
        setPagination({...pagination, currentPage: 1}); // Reset to first page
    };

    // Handle filter - don't call fetchOrders directly
    const handleFilter = (filterValues) => {
        setFilters(filterValues);
        setPagination({...pagination, currentPage: 1}); // Reset to first page
    };

    // Handle reset - don't call fetchOrders directly
    const handleReset = () => {
        setSearchTerm('');
        setFilters({
            status: 'all',
            startDate: null,
            endDate: null,
            minPrice: '',
            maxPrice: ''
        });
        setPagination({...pagination, currentPage: 1}); // Reset to first page
    };

    // Handle page change
    const paginate = (pageNumber) => {
        setPagination({...pagination, currentPage: pageNumber});
        // fetchOrders will be called due to the dependency array
    };

    // Use the orders directly from state - server already handles pagination
    const currentOrders = ordersData;

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

            {/* Advanced Search and Filter */}
            <AdvancedSearchFilter
                onSearch={handleSearch}
                onFilter={handleFilter}
                onReset={handleReset}
                filterOptions={{
                    status: true,
                    dateRange: true,
                    price: true
                }}
            />

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
                                {currentOrders.map((order) => (
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
                        {currentOrders.map((order) => (
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