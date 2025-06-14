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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  ArrowBack,
  Assignment,
  LocalShipping,
  Receipt,
  AccessTime,
  ShoppingCart,
  Business,
  InfoOutlined
} from "@mui/icons-material";
import apiService from "../utils/api";

const COLORS = {
  primary: "#2563EB", // Blue - for main actions and branding
  accent: "#10B981", // Emerald - for success and approval
  warn: "#F43F5E", // Rose - for rejection and warnings
  info: "#6366F1", // Indigo - for informational sections
  bg: "#F8FAFC", // Slate-50 - subtle background
  textPrimary: "#1A202C", // Darker text for better readability
  textSecondary: "#4A5568", // Lighter text for labels/less important info
  border: "#E2E8F0", // Light border for subtle separation
};

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  processing: { bg: "#DBEAFE", text: "#1E40AF" },
  shipped: { bg: "#A7F3D0", text: "#065F46" },
  delivered: { bg: "#D1FAE5", text: "#047857" },
  completed: { bg: "#D1FAE5", text: "#047857" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
  default: { bg: "#F3F4F6", text: "#374151" }
};

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
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const key = (status || '').toLowerCase();
    const colors = STATUS_COLORS[key] || STATUS_COLORS.default;
    let icon = <AccessTime fontSize="small" />;
    if (key === "processing") icon = <Assignment fontSize="small" />;
    else if (key === "shipped") icon = <LocalShipping fontSize="small" />;
    else if (key === "delivered" || key === "completed") icon = <Receipt fontSize="small" />;

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.5,
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 600,
          backgroundColor: colors.bg,
          color: colors.text,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        {icon}
        {status || "Pending"}
      </Box>
    );
  };

  if (loading) {
    return (
      <OrgLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            backgroundColor: COLORS.bg,
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: COLORS.primary }} />
          <Typography sx={{ mt: 2, color: COLORS.primary, fontWeight: 500 }}>
            Loading order details...
          </Typography>
        </Box>
      </OrgLayout>
    );
  }

  if (error) {
    return (
      <OrgLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            backgroundColor: COLORS.bg,
            p: 4,
          }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: "sm", width: "100%" }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/org/orders")}
            sx={{
              mt: 2,
              background: COLORS.primary,
              color: "#fff",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#1D4ED8" }
            }}
          >
            Back to Orders
          </Button>
        </Box>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <Box
        sx={{
          maxWidth: { xs: "95%", sm: "90%", md: "80%", lg: "70%" },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 6,
          backgroundColor: COLORS.bg,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/org/orders")}
          sx={{
            mb: 4,
            borderColor: COLORS.primary,
            color: COLORS.primary,
            "&:hover": {
              backgroundColor: `${COLORS.primary}10`,
            },
          }}
        >
          Back to Orders
        </Button>

        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: COLORS.textPrimary,
            mb: 6,
            fontFamily: "Merriweather, serif",
          }}
        >
          Order Details <span style={{ color: COLORS.accent }}>#{order?.orderId || order?.id}</span>
        </Typography>

        {/* Order Summary Card */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: "16px",
            p: { xs: 3, md: 4 },
            mb: 6,
            borderLeft: `8px solid ${COLORS.primary}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              mb: 3,
              gap: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: COLORS.textPrimary }}
            >
              Order #{order?.orderId || order?.id}
            </Typography>
            {getStatusBadge(order?.status)}
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                  Order Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                  {formatDate(order?.date)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                  Expected Delivery
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                  {formatDate(order?.expectedDelivery) || "To be determined"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                  Total Amount
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.accent }}>
                  ₹{order?.totalAmount?.toFixed(2) || "0.00"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                  Tracking Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                  {order?.trackingNumber || "Not available yet"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Order Items */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: "16px",
                p: { xs: 3, md: 4 },
                borderLeft: `8px solid ${COLORS.info}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                height: "fit-content"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  pb: 1,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <ShoppingCart sx={{ color: COLORS.info, mr: 1.5, fontSize: 30 }} />
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 600, color: COLORS.textPrimary }}
                >
                  Order Items
                </Typography>
              </Box>

              {order?.items && order.items.length > 0 ? (
                <TableContainer>
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: COLORS.info,
                          backgroundColor: `${COLORS.info}10`,
                          fontSize: "0.875rem"
                        }}>Product</th>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: COLORS.info,
                          backgroundColor: `${COLORS.info}10`,
                          fontSize: "0.875rem"
                        }}>Price</th>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: COLORS.info,
                          backgroundColor: `${COLORS.info}10`,
                          fontSize: "0.875rem"
                        }}>Qty</th>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: COLORS.info,
                          backgroundColor: `${COLORS.info}10`,
                          fontSize: "0.875rem"
                        }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "12px 16px" }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                                {item.productName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                {item.productDescription}
                              </Typography>
                            </Box>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                              ₹{item.unitPrice?.toFixed(2)}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <Typography variant="body2" sx={{ color: COLORS.textPrimary }}>
                              {item.quantity}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                              ₹{item.subtotal?.toFixed(2)}
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableContainer>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary, mb: 2 }}>
                    {order?.productName}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        Quantity:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                        {order?.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                        Unit Price:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                        ₹{order?.price?.toFixed(2)}
                      </Typography>
                    </Grid>
                    {order?.batchSize && (
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                          Batch Size:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                          {order?.batchSize}
                        </Typography>
                      </Grid>
                    )}
                    {order?.unitType && (
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                          Unit Type:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                          {order?.unitType}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                    Total Amount:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.accent }}>
                    ₹{order?.totalAmount?.toFixed(2) || "0.00"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Product & Shipping Info */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: "16px",
                p: { xs: 3, md: 4 },
                borderLeft: `8px solid ${COLORS.warn}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                height: "fit-content"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  pb: 1,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <InfoOutlined sx={{ color: COLORS.warn, mr: 1.5, fontSize: 30 }} />
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 600, color: COLORS.textPrimary }}
                >
                  Product & Shipping Details
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {order?.brand && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Brand:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.brand}
                    </Typography>
                  </Grid>
                )}
                {order?.type && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Type:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.type}
                    </Typography>
                  </Grid>
                )}
                {order?.batchSizeStrips && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Batch Size (Strips):
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.batchSizeStrips}
                    </Typography>
                  </Grid>
                )}
                {order?.batchSizeTabs && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Batch Size (Tabs):
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.batchSizeTabs}
                    </Typography>
                  </Grid>
                )}
                {order?.mrp && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      MRP:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      ₹{order.mrp?.toFixed(2)}
                    </Typography>
                  </Grid>
                )}
                {order?.sizeCode && (
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Size Code:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.sizeCode}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  pb: 1,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Business sx={{ color: COLORS.warn, mr: 1.5, fontSize: 24 }} />
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 600, color: COLORS.textPrimary }}
                >
                  Shipping Information
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                  Shipping Address:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                  {order?.shippingAddress || "N/A"}
                </Typography>
              </Box>

              {order?.organization && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Organization:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.organization.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                      Location:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                      {order.organization.city}, {order.organization.zip}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {order?.remarks && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>
                    Remarks:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {order.remarks}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Actions */}
        {(order?.status === "Pending" || order?.status === "Processing") && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 6 }}>
            <Button
              variant="contained"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  alert("Order cancellation requested (implement API call)");
                }
              }}
              sx={{
                background: COLORS.warn,
                color: "#fff",
                fontWeight: 600,
                boxShadow: "none",
                py: 1.2,
                "&:hover": { backgroundColor: "#D32F2F" },
              }}
            >
              Cancel Order
            </Button>
          </Box>
        )}
      </Box>
    </OrgLayout>
  );
};

export default OrgOrderDetails;