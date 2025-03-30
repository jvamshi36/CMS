// src/pages/OrgOrderDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrgLayout from "../components/Layout/OrgLayout";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { ArrowBack, Assignment, LocalShipping, Receipt, AccessTime } from "@mui/icons-material";
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
            console.error("Date formatting error:", e);
            return dateString;
        }
    };

    const getStatusChip = (status) => {
        let color = "default";
        let icon = <AccessTime />;

        switch (status?.toLowerCase()) {
            case "pending":
                color = "warning";
                icon = <AccessTime />;
                break;
            case "processing":
                color = "info";
                icon = <Assignment />;
                break;
            case "shipped":
                color = "primary";
                icon = <LocalShipping />;
                break;
            case "delivered":
            case "completed":
                color = "success";
                icon = <Receipt />;
                break;
            case "cancelled":
                color = "error";
                break;
            default:
                break;
        }

        return (
            <Chip
                icon={icon}
                label={status || "Pending"}
                color={color}
                variant="filled"
                sx={{ fontWeight: "bold" }}
            />
        );
    };

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
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate("/org/orders")}
                    >
                        Back to Orders
                    </Button>
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
                    <Typography variant="h5" className="page-title">
                        Order Details
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Order Summary */}
                    <Grid item xs={12}>
                        <Paper className="order-summary-card">
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">
                                    Order #{order?.orderId}
                                </Typography>
                                {getStatusChip(order?.status)}
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2" color="textSecondary">Order Date</Typography>
                                    <Typography variant="body1">{formatDate(order?.date)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2" color="textSecondary">Expected Delivery</Typography>
                                    <Typography variant="body1">{formatDate(order?.expectedDelivery) || "To be determined"}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                                    <Typography variant="body1" fontWeight="bold">₹{order?.totalAmount?.toFixed(2) || "0.00"}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="body2" color="textSecondary">Tracking Number</Typography>
                                    <Typography variant="body1">{order?.trackingNumber || "Not available yet"}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {/* Order Items */}
                        <Paper className="order-items-card">
                            <Typography variant="h6" gutterBottom>Order Items</Typography>
                            {order?.items && order.items.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Qty</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {order.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Typography variant="body2">{item.productName}</Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {item.productDescription}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">₹{item.unitPrice?.toFixed(2)}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">₹{item.subtotal?.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box>
                                    <Typography variant="body1" gutterBottom>
                                        {order?.productName}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="textSecondary">Quantity:</Typography>
                                            <Typography variant="body1">{order?.quantity}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="textSecondary">Unit Price:</Typography>
                                            <Typography variant="body1">₹{order?.price?.toFixed(2)}</Typography>
                                        </Grid>
                                        {order?.batchSize && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Batch Size:</Typography>
                                                <Typography variant="body1">{order?.batchSize}</Typography>
                                            </Grid>
                                        )}
                                        {order?.unitType && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="textSecondary">Unit Type:</Typography>
                                                <Typography variant="body1">{order?.unitType}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            )}
                            <Box mt={2} display="flex" justifyContent="flex-end">
                                <Box textAlign="right">
                                    <Typography variant="body2" color="textSecondary">Total Amount:</Typography>
                                    <Typography variant="h6">₹{order?.totalAmount?.toFixed(2) || "0.00"}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {/* Product and Shipping Information */}
                        <Paper className="order-details-card">
                            <Typography variant="h6" gutterBottom>Product Details</Typography>
                            <Grid container spacing={2}>
                                {order?.brand && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Brand:</Typography>
                                        <Typography variant="body1">{order.brand}</Typography>
                                    </Grid>
                                )}
                                {order?.type && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Type:</Typography>
                                        <Typography variant="body1">{order.type}</Typography>
                                    </Grid>
                                )}
                                {order?.batchSizeStrips && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Batch Size (Strips):</Typography>
                                        <Typography variant="body1">{order.batchSizeStrips}</Typography>
                                    </Grid>
                                )}
                                {order?.batchSizeTabs && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Batch Size (Tabs):</Typography>
                                        <Typography variant="body1">{order.batchSizeTabs}</Typography>
                                    </Grid>
                                )}
                                {order?.mrp && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">MRP:</Typography>
                                        <Typography variant="body1">₹{order.mrp?.toFixed(2)}</Typography>
                                    </Grid>
                                )}
                                {order?.sizeCode && (
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Size Code:</Typography>
                                        <Typography variant="body1">{order.sizeCode}</Typography>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary">Shipping Address:</Typography>
                                    <Typography variant="body1">{order?.shippingAddress || "N/A"}</Typography>
                                </Grid>
                                {order?.organization && (
                                    <>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="textSecondary">Organization:</Typography>
                                            <Typography variant="body1">{order.organization.name}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="textSecondary">Location:</Typography>
                                            <Typography variant="body1">{order.organization.city}, {order.organization.zip}</Typography>
                                        </Grid>
                                    </>
                                )}
                                {order?.remarks && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="textSecondary">Remarks:</Typography>
                                        <Typography variant="body1">{order.remarks}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Order Actions */}
                <Box mt={3} display="flex" justifyContent="space-between">
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate("/org/orders")}
                    >
                        Back to Orders
                    </Button>
                    {(order?.status === "Pending" || order?.status === "Processing") && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                // Handle cancel order functionality
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                    // Call cancel API
                                    console.log("Order cancellation requested");
                                }
                            }}
                        >
                            Cancel Order
                        </Button>
                    )}
                </Box>
            </div>
        </OrgLayout>
    );
};

export default OrgOrderDetails;