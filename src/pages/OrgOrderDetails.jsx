// src/pages/OrgOrderDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrgLayout from "../components/Layout/OrgLayout";
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Button, Chip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import apiService from "../utils/api";
import "../styles/OrderDetails.css";

const OrgOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const data = await apiService.get(`/api/org/orders/${orderId}`);
                setOrder(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.message || "Failed to load order details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <OrgLayout>
                <Box className="order-details-loading">
                    <CircularProgress />
                    <Typography variant="body1">Loading order details...</Typography>
                </Box>
            </OrgLayout>
        );
    }

    if (error) {
        return (
            <OrgLayout>
                <Box className="order-details-error">
                    <Alert severity="error">{error}</Alert>
                    <div className="error-actions">
                        <Button 
                            variant="outlined" 
                            startIcon={<ArrowBack />} 
                            onClick={() => navigate("/org/orders")}
                            className="back-button"
                        >
                            Back to Orders
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={() => window.location.reload()}
                            className="retry-button"
                        >
                            Retry
                        </Button>
                    </div>
                </Box>
            </OrgLayout>
        );
    }

    return (
        <OrgLayout>
            <div className="order-details-container">
                <Box className="order-details-header">
                    <Button 
                        startIcon={<ArrowBack />} 
                        onClick={() => navigate("/org/orders")}
                        variant="outlined"
                        className="back-button"
                    >
                        Back to Orders
                    </Button>
                    <Typography variant="h4" className="page-title">
                        Order #{orderId}
                    </Typography>
                </Box>

                <Paper className="order-summary-card">
                    <Typography variant="h6" className="card-title">Order Summary</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Box className="order-info-section">
                                <Typography variant="subtitle1" className="section-title">Order Information</Typography>
                                <div className="info-row">
                                    <span className="info-label">Order ID:</span>
                                    <span className="info-value">{order?.id}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Date:</span>
                                    <span className="info-value">{new Date(order?.date).toLocaleString()}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Status:</span>
                                    <span className={`status-badge ${order?.status?.toLowerCase() || "pending"}`}>
                                        {order?.status}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Total Amount:</span>
                                    <span className="info-value price">₹{order?.total?.toLocaleString() || "N/A"}</span>
                                </div>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="order-info-section">
                                <Typography variant="subtitle1" className="section-title">Shipping Information</Typography>
                                <div className="info-row">
                                    <span className="info-label">Shipping Address:</span>
                                    <span className="info-value">{order?.shippingAddress || "N/A"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Expected Delivery:</span>
                                    <span className="info-value">{order?.expectedDelivery 
                                        ? new Date(order.expectedDelivery).toLocaleDateString() 
                                        : "To be determined"}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tracking Number:</span>
                                    <span className="info-value">{order?.trackingNumber || "Not available yet"}</span>
                                </div>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper className="order-items-card">
                    <Typography variant="h6" className="card-title">Order Items</Typography>
                    <Box className="order-items-table-container">
                        <table className="order-items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Unit Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="product-info">
                                                <span className="product-name">{item.name}</span>
                                                <span className="product-description">{item.description}</span>
                                            </div>
                                        </td>
                                        <td>₹{item.unitPrice?.toLocaleString() || "N/A"}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{(item.unitPrice * item.quantity)?.toLocaleString() || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="total-label">Total:</td>
                                    <td className="total-value">₹{order?.total?.toLocaleString() || "N/A"}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </Box>
                </Paper>

                {order?.status === "Pending" && (
                    <Box className="order-actions">
                        <Button 
                            variant="contained" 
                            color="error"
                            className="cancel-order-button"
                            onClick={() => {/* Implement cancel order functionality */}}
                        >
                            Cancel Order
                        </Button>
                    </Box>
                )}
            </div>
        </OrgLayout>
    );
};

export default OrgOrderDetails;