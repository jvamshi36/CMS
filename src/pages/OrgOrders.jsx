// src/pages/OrgOrders.jsx
import React, { useState, useEffect } from "react";
import OrgLayout from "../components/Layout/OrgLayout";
import { useNavigate, NavLink } from "react-router-dom";
import { Button, CircularProgress, Box, Typography, Alert } from "@mui/material";
import apiService from "../utils/api";
import "../styles/Orders.css";

const OrgOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await apiService.get("/api/org/dashboard/orders");
                setOrders(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message || "Failed to load orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Pagination Logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <OrgLayout>
                <Box className="orders-loading">
                    <CircularProgress />
                    <Typography variant="body1">Loading orders...</Typography>
                </Box>
            </OrgLayout>
        );
    }

    if (error) {
        return (
            <OrgLayout>
                <Box className="orders-error">
                    <Alert severity="error">{error}</Alert>
                    <Button 
                        variant="contained" 
                        className="retry-button"
                        onClick={() => window.location.reload()}
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
                <div className="orders-header">
                    <Typography variant="h4" className="page-title">Your Orders</Typography>
                    <Button 
                        variant="contained" 
                        className="new-order-button"
                        onClick={() => navigate("/org/new-order")}
                    >
                        Place New Order
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <Box className="no-orders">
                        <Typography variant="h6">No orders found</Typography>
                        <Typography variant="body1" className="no-orders-message">
                            You haven't placed any orders yet.
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate("/org/new-order")}
                            className="place-order-button"
                        >
                            Place Your First Order
                        </Button>
                    </Box>
                ) : (
                    <>
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>{new Date(order.date).toLocaleDateString()}</td>
                                            <td>{order.items}</td>
                                            <td>₹{order.total?.toLocaleString() || "N/A"}</td>
                                            <td>
                                                <span className={`status-badge ${order.status?.toLowerCase() || "pending"}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    className="view-button"
                                                    onClick={() => navigate(`/org/orders/${order.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination">
                            {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => paginate(index + 1)}
                                    className={currentPage === index + 1 ? 'active' : ''}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </OrgLayout>
    );
};

export default OrgOrders;