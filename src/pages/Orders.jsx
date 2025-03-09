import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Orders.css";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [ordersData, setOrdersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 9;

    // Use the auth context for API calls and auth state
    const { api, isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                console.log("Is authenticated?", isAuthenticated());
                            console.log("Is admin?", isAdmin());
                            console.log("Token:", sessionStorage.getItem('_auth_token'));

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

                console.log(`Fetching orders for company ID: ${companyId}`);

                // Make API call using the authenticated api instance from context
                // Update: Use the correct endpoint with companyId in the path, following company/{companyId}/orders format
                const response = await api.get(`/api/admin/company/${companyId}/orders`);
                console.log("API response:", response);

                setOrdersData(Array.isArray(response.data) ? response.data : []);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                console.error("Error details:", {
                    status: err.status || err.response?.status,
                    message: err.message,
                    response: err.response
                });

                // Handle specific error cases
                if (err.response?.status === 401) {
                    setError("Unauthorized. Please log in again.");
                    // Optionally redirect to login page
                    // navigate("/login");
                } else if (err.response?.status === 404) {
                    // Not found - just show empty state
                    console.log("No orders found - showing empty state");
                    setOrdersData([]);
                } else {
                    // For other errors, show the error message
                    setError(err.message || "Failed to load orders. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [companyId, api, isAuthenticated, navigate]);

    // Get current orders
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = ordersData.slice(indexOfFirstOrder, indexOfLastOrder);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
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

    // Show error state
    if (error) {
        return (
            <Layout>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                    flexDirection="column"
                    sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '15px',
                        padding: '30px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        margin: '20px'
                    }}
                >
                    <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/dashboard")}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setLoading(true) || window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </Box>
                </Box>
            </Layout>
        );
    }

    // Handle empty state - No orders
    if (!ordersData || ordersData.length === 0) {
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
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="50vh"
                    flexDirection="column"
                    sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '15px',
                        padding: '30px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        margin: '20px 0'
                    }}
                >
                    <Typography variant="h5" gutterBottom>No Orders Found</Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        This company doesn't have any orders yet.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/new-order?companyId=${companyId}`)}
                        sx={{ mt: 2 }}
                    >
                        Create First Order
                    </Button>
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
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>PRN NO. </th>
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
                                <NavLink to={`/companies/${companyId}/orders/${order.id}/order-details`}>
                                    Details
                                </NavLink>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {Math.ceil(ordersData.length / ordersPerPage) > 1 && (
                <div className="pagination">
                    {Array.from({ length: Math.ceil(ordersData.length / ordersPerPage) }).map((_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default Orders;