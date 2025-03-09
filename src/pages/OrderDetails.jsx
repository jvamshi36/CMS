import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Alert, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Layout from "../components/Layout/Layout";
import apiService from "../utils/api";
import "../styles/Details.css";

const OrderDetails = () => {
  const { companyId, orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/api/admin/orders/${companyId}/${orderId}`);
        setOrderDetails(response);
        setError(null);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message || "Failed to load order details");

      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [companyId, orderId]);

  // Format date
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
      console.error("Date parsing error:", e);
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box className="error-container">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/companies/${companyId}/orders`)}
          >
            Back to Orders
          </Button>
        </Box>
      </Layout>
    );
  }

  // Prepare displayable order data
  const getOrderDetailsData = () => {
    if (!orderDetails) return {};

    return {
      "Order ID": orderDetails.id || orderDetails.id,
      "Product Name": orderDetails.productName || "Multiple Items",
      "Order Date": formatDate(orderDetails.date),
      "Expected Delivery": formatDate(orderDetails.expectedDelivery || orderDetails.deliveryDate),
      "Total Amount": `₹${orderDetails.totalAmount?.toLocaleString() || orderDetails.totalAmount || "N/A"}`,
      "Status": orderDetails.status || orderDetails.orderStatus || "Processing",
      "Shipping Address": orderDetails.shippingAddress || orderDetails.address || "N/A",
      "Tracking Number": orderDetails.trackingNumber || "Not available",
      "PRN No.": orderDetails.prnNo || "N/A",
      "Brand": orderDetails.brand || "N/A",
      "Type": orderDetails.type || "N/A",
      "Composition": orderDetails.composition || "N/A"
    };
  };

  return (
    <Layout>
      <Box className="details-container">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/companies/${companyId}/orders`)}
            sx={{ mr: 2 }}
          >
            Back to Orders
          </Button>
          <Typography variant="h6" className="section-title">
            Order Details #{orderId}
          </Typography>
        </Box>

        {/* Order Details */}
        <Card className="details-card">
          <CardContent>
            <Grid container spacing={3}>
              {Object.entries(getOrderDetailsData()).map(([key, value]) => (
                <Grid item xs={12} sm={4} key={key}>
                <Typography variant="body2" className="detail-value">
                  {key}: <span>
                    {typeof value === "string" &&
                    ["processing", "pending", "completed", "cancelled"].includes(value.toLowerCase()) ? (
                      <span className={`status ${value.toLowerCase()}`}>{value}</span>
                    ) : (
                      value?.toString() ?? "N/A"
                    )}
                  </span>
                </Typography>

                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Product Details if available */}
        {orderDetails && (orderDetails.items?.length > 0 || orderDetails.quantity) && (
          <>
            <Typography variant="h6" className="section-title">
              Product Information
            </Typography>
            <Card className="details-card">
              <CardContent>
                <Grid container spacing={3}>
                  {orderDetails.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Product: <span>{item.productName}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Quantity: <span>{item.quantity}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Price: <span>₹{item.unitPrice?.toLocaleString()}</span>
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  ))}
                  {orderDetails.quantity && !orderDetails.items?.length && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Quantity: <span>{orderDetails.quantity}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Rate: <span>₹{orderDetails.rate?.toLocaleString() || "N/A"}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Batch Size (Strips): <span>{orderDetails.batchSizeStrips || "N/A"}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Batch Size (Tabs): <span>{orderDetails.batchSizeTabs || "N/A"}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          MRP: <span>₹{orderDetails.mrp?.toLocaleString() || "N/A"}</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" className="detail-value">
                          Size Code: <span>{orderDetails.sizeCode || "N/A"}</span>
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* Order Actions */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/companies/${companyId}/orders/${orderId}/edit`)}
            sx={{ mr: 2 }}
          >
            Edit Order
          </Button>
          {orderDetails?.status !== 'Completed' && orderDetails?.status !== 'Cancelled' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                // Handle cancellation
                window.confirm('Are you sure you want to cancel this order?');
              }}
            >
              Cancel Order
            </Button>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default OrderDetails;