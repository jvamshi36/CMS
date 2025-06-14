import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider, // Added for better visual separation
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Business,
  ShoppingCart,
  InfoOutlined, // Changed to a more neutral info icon
  EventNote, // Icon for Expected Delivery Date
  Description, // Icon for Remarks
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

const PendingOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [formData, setFormData] = useState({
    prnNo: "",
    batchSizeStrips: "",
    batchSizeTabs: "",
    mrp: "",
    sizeCode: "",
    pvcColor: "",
    packingSize: "",
    remarks: "",
    expectedDelivery: "",
    status: "Processing",
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(
          `/api/admin/orders/pending/${orderId}`
        );
        setOrder(response);
        if (response) {
          setFormData((prevData) => ({
            ...prevData,
            prnNo: response.prnNo || "",
            batchSizeStrips: response.batchSizeStrips || "",
            batchSizeTabs: response.batchSizeTabs || "",
            mrp: response.mrp || "",
            sizeCode: response.sizeCode || "",
            pvcColor: response.pvcColor || "",
            packingSize: response.packingSize || "",
            remarks: response.remarks || "",
            expectedDelivery:
              response.expectedDelivery ||
              formatDateForInput(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), // Default to 15 days from now
          }));
        }
        setError(null);
      } catch (err) {
        setError(
          err.message || "Failed to load order details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) =>
    !dateString ? "N/A" : new Date(dateString).toLocaleString();
  const formatDateForInput = (date) =>
    !date ? "" : new Date(date).toISOString().split("T")[0];

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    const requiredFields = [
      "prnNo",
      "batchSizeStrips",
      "batchSizeTabs",
      "mrp",
      "sizeCode",
      "expectedDelivery",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    // More robust number validation
    if (isNaN(parseFloat(formData.mrp)) || parseFloat(formData.mrp) <= 0)
      return false;
    if (
      isNaN(parseInt(formData.batchSizeStrips, 10)) ||
      parseInt(formData.batchSizeStrips, 10) <= 0
    )
      return false;
    if (
      isNaN(parseInt(formData.batchSizeTabs, 10)) ||
      parseInt(formData.batchSizeTabs, 10) <= 0
    )
      return false;
    return true;
  };

  const handleApproveOrder = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields and ensure valid numbers.",
        severity: "error",
      });
      return;
    }
    setProcessingOrder(true);
    try {
      const formattedDeliveryDate = formData.expectedDelivery
        ? `${formData.expectedDelivery}T00:00:00`
        : null;
      const updateData = {
        ...order,
        ...formData,
        status: "Processing",
        expectedDelivery: formattedDeliveryDate,
        mrp: parseFloat(formData.mrp),
        batchSizeStrips: parseInt(formData.batchSizeStrips, 10),
        batchSizeTabs: parseInt(formData.batchSizeTabs, 10),
      };
      await apiService.put(`/api/admin/orders/${orderId}/approve`, updateData);
      setSnackbar({
        open: true,
        message: "Order approved successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/pending-orders"), 1500); // Shorter delay for better UX
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to approve order. Please try again.",
        severity: "error",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  const openRejectDialog = () => setRejectDialogOpen(true);
  const handleRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection.",
        severity: "error",
      });
      return;
    }
    setProcessingOrder(true);
    try {
      await apiService.put(`/api/admin/orders/${orderId}/reject`, {
        rejectionReason,
      });
      setRejectDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Order rejected successfully.",
        severity: "success",
      });
      setTimeout(() => navigate("/pending-orders"), 1500); // Shorter delay
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to reject order. Please try again.",
        severity: "error",
      });
    } finally {
      setProcessingOrder(false);
    }
  };
  const handleCloseRejectDialog = () => setRejectDialogOpen(false);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Layout>
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
          <Typography className="mt-4 text-blue-700 font-medium">
            Loading order details...
          </Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
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
            onClick={() => navigate("/pending-orders")}
            sx={{ mt: 2, background: COLORS.primary, color: "#fff" }}
          >
            Back to Pending Orders
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box
        sx={{
          maxWidth: { xs: "95%", sm: "90%", md: "80%", lg: "70%" },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 6,
          backgroundColor: COLORS.bg,
          minHeight: "calc(100vh - 64px)", // Adjust based on your Layout header height
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/pending-orders")}
          sx={{
            mb: 4,
            borderColor: COLORS.primary,
            color: COLORS.primary,
            "&:hover": {
              backgroundColor: `${COLORS.primary}10`, // Light hover effect
            },
          }}
        >
          Back to Pending Orders
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
            fontFamily: "Merriweather, serif", // A more distinct font for titles
          }}
        >
          Review Pending Order <span style={{ color: COLORS.accent }}>#{orderId}</span>
        </Typography>

        {/* Organization Info */}
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
              alignItems: "center",
              mb: 3,
              pb: 1,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <Business sx={{ color: COLORS.primary, mr: 1.5, fontSize: 30 }} />
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, color: COLORS.textPrimary }}
            >
              Organization Information
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Organization Name:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.organizationName}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Order ID:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.id}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Submission Date:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{formatDate(order.date)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Contact Email:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.contactEmail || "N/A"}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Contact Phone:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.contactPhone || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Shipping Address:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.shippingAddress || "N/A"}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Product Info */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: "16px",
            p: { xs: 3, md: 4 },
            mb: 6,
            borderLeft: `8px solid ${COLORS.info}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
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
              Product Information
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Product Name:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.productName}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Brand:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.brand || "N/A"}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Type:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.type || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Unit Type:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.unitType || "N/A"}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Quantity:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.quantity}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Price per Unit:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>₹{order.price?.toFixed(2) || "N/A"}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Total Amount:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>₹{order.totalAmount?.toFixed(2) || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 0.5 }}>Composition:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>{order.composition || "N/A"}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Approval Form */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: "16px",
            p: { xs: 3, md: 4 },
            mb: 6,
            borderLeft: `8px solid ${COLORS.accent}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
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
            <CheckCircle sx={{ color: COLORS.accent, mr: 1.5, fontSize: 30 }} />
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, color: COLORS.textPrimary }}
            >
              Complete Order Details for Approval
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ mb: 4, color: COLORS.textSecondary }}
          >
            Please fill in the additional details required to process this order. All
            fields marked with <span style={{ color: COLORS.warn, fontWeight: "bold" }}>*</span> are
            required.
          </Typography>
          <form>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PRN Number"
                  name="prnNo"
                  value={formData.prnNo}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  error={!formData.prnNo && !processingOrder} // Dynamic error state
                  helperText={!formData.prnNo && !processingOrder ? "Required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Batch Size (Strips)"
                  name="batchSizeStrips"
                  value={formData.batchSizeStrips}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  error={(!formData.batchSizeStrips || isNaN(parseInt(formData.batchSizeStrips, 10)) || parseInt(formData.batchSizeStrips, 10) <= 0) && !processingOrder}
                  helperText={(!formData.batchSizeStrips || isNaN(parseInt(formData.batchSizeStrips, 10)) || parseInt(formData.batchSizeStrips, 10) <= 0) && !processingOrder ? "Required, must be a positive number" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Batch Size (Tabs)"
                  name="batchSizeTabs"
                  value={formData.batchSizeTabs}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  error={(!formData.batchSizeTabs || isNaN(parseInt(formData.batchSizeTabs, 10)) || parseInt(formData.batchSizeTabs, 10) <= 0) && !processingOrder}
                  helperText={(!formData.batchSizeTabs || isNaN(parseInt(formData.batchSizeTabs, 10)) || parseInt(formData.batchSizeTabs, 10) <= 0) && !processingOrder ? "Required, must be a positive number" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="MRP"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  type="number"
                  inputProps={{ min: 0.01, step: "0.01" }}
                  error={(!formData.mrp || isNaN(parseFloat(formData.mrp)) || parseFloat(formData.mrp) <= 0) && !processingOrder}
                  helperText={(!formData.mrp || isNaN(parseFloat(formData.mrp)) || parseFloat(formData.mrp) <= 0) && !processingOrder ? "Required, must be a positive number" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Size Code"
                  name="sizeCode"
                  value={formData.sizeCode}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  error={!formData.sizeCode && !processingOrder}
                  helperText={!formData.sizeCode && !processingOrder ? "Required" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PVC/PVDC Color"
                  name="pvcColor"
                  value={formData.pvcColor}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Packing Size"
                  name="packingSize"
                  value={formData.packingSize}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Delivery Date"
                  name="expectedDelivery"
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!formData.expectedDelivery && !processingOrder}
                  helperText={!formData.expectedDelivery && !processingOrder ? "Required" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                        <Description sx={{ color: COLORS.textSecondary }} />
                      </Box>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </form>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mt: 6,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={openRejectDialog}
              disabled={processingOrder}
              startIcon={<Cancel />}
              sx={{
                background: COLORS.warn,
                color: "#fff",
                fontWeight: 600,
                boxShadow: "none",
                py: 1.2,
                "&:hover": { backgroundColor: "#D32F2F" }, // Darker red on hover
              }}
            >
              Reject Order
            </Button>
            <Button
              variant="contained"
              onClick={handleApproveOrder}
              disabled={processingOrder}
              startIcon={processingOrder ? <CircularProgress size={24} color="inherit" /> : <CheckCircle />}
              sx={{
                background: COLORS.accent,
                color: "#fff",
                fontWeight: 600,
                boxShadow: "none",
                py: 1.2,
                "&:hover": { backgroundColor: "#0C8D6D" }, // Darker emerald on hover
              }}
            >
              {processingOrder ? "Approving..." : "Approve Order"}
            </Button>
          </Box>
        </Paper>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 600 }}>Reject Order</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: COLORS.textSecondary }}>
              Please provide a clear reason for rejecting this order. This information will be
              sent to the organization.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              fullWidth
              multiline
              rows={5}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              variant="outlined"
              error={!rejectionReason.trim() && !processingOrder && rejectDialogOpen} // Error if empty on dialog open
              helperText={!rejectionReason.trim() && !processingOrder && rejectDialogOpen ? "Reason is required" : ""}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseRejectDialog} disabled={processingOrder} sx={{ color: COLORS.textSecondary }}>Cancel</Button>
            <Button
              onClick={handleRejectOrder}
              sx={{ background: COLORS.warn, color: "#fff", "&:hover": { backgroundColor: "#D32F2F" } }}
              disabled={!rejectionReason.trim() || processingOrder}
              startIcon={processingOrder ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processingOrder ? "Rejecting..." : "Reject Order"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default PendingOrderDetail;