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
  Divider,
  TextField,
  MenuItem,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import { 
  ArrowBack, 
  CheckCircle, 
  Cancel, 
  Business, 
  ShoppingCart
} from "@mui/icons-material";
import apiService from "../utils/api";
import "../styles/PendingOrders.css";

const PendingOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // Additional form fields for admin to complete
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
    status: "Processing"
  });

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/api/admin/orders/pending/${orderId}`);
        setOrder(response);
        
        // Pre-fill form data from the order if available
        if (response) {
          setFormData(prevData => ({
            ...prevData,
            prnNo: response.prnNo || "",
            batchSizeStrips: response.batchSizeStrips || "",
            batchSizeTabs: response.batchSizeTabs || "",
            mrp: response.mrp || "",
            sizeCode: response.sizeCode || "",
            pvcColor: response.pvcColor || "",
            packingSize: response.packingSize || "",
            remarks: response.remarks || "",
            // Set expected delivery to 15 days from now as default
            expectedDelivery: response.expectedDelivery || formatDateForInput(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
          }));
        }
        
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      console.error("Date formatting error:", e);
      return "";
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle order approval
 // Handle order approval
 const handleApproveOrder = async () => {
   if (!validateForm()) {
     setSnackbar({
       open: true,
       message: "Please fill in all required fields",
       severity: "error"
     });
     return;
   }

   setProcessingOrder(true);
   try {
     // Format the expectedDelivery date to include time component
     const formattedDeliveryDate = formData.expectedDelivery ?
       `${formData.expectedDelivery}T00:00:00` : null;

     const updateData = {
       ...order,
       ...formData,
       status: "Processing",
       // Add the properly formatted date
       expectedDelivery: formattedDeliveryDate,
       // Convert string values to appropriate types
       mrp: parseFloat(formData.mrp),
       batchSizeStrips: parseInt(formData.batchSizeStrips, 10),
       batchSizeTabs: parseInt(formData.batchSizeTabs, 10)
     };

     const response = await apiService.put(`/api/admin/orders/${orderId}/approve`, updateData);

     setSnackbar({
       open: true,
       message: "Order approved successfully",
       severity: "success"
     });

     // Redirect after a short delay
     setTimeout(() => {
       navigate("/pending-orders");
     }, 2000);
   } catch (err) {
     console.error("Error approving order:", err);
     setSnackbar({
       open: true,
       message: err.message || "Failed to approve order. Please try again.",
       severity: "error"
     });
   } finally {
     setProcessingOrder(false);
   }
 };

  // Open reject dialog
  const openRejectDialog = () => {
    setRejectDialogOpen(true);
  };

  // Handle order rejection
  const handleRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection",
        severity: "error"
      });
      return;
    }

    setProcessingOrder(true);
    try {
      await apiService.put(`/api/admin/orders/${orderId}/reject`, {
        rejectionReason
      });

      setRejectDialogOpen(false);
      setSnackbar({
        open: true,
        message: "Order rejected successfully",
        severity: "success"
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/pending-orders");
      }, 2000);
    } catch (err) {
      console.error("Error rejecting order:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to reject order. Please try again.",
        severity: "error"
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  // Close reject dialog
  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Validate form data
  const validateForm = () => {
    // Check required fields
    const requiredFields = ['prnNo', 'batchSizeStrips', 'batchSizeTabs', 'mrp', 'sizeCode', 'expectedDelivery'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    
    // Validate numeric fields
    if (isNaN(parseFloat(formData.mrp)) || parseFloat(formData.mrp) <= 0) {
      return false;
    }
    
    if (isNaN(parseInt(formData.batchSizeStrips, 10)) || parseInt(formData.batchSizeStrips, 10) <= 0) {
      return false;
    }
    
    if (isNaN(parseInt(formData.batchSizeTabs, 10)) || parseInt(formData.batchSizeTabs, 10) <= 0) {
      return false;
    }
    
    return true;
  };

  if (loading) {
    return (
      <Layout>
        <Box className="pending-orders-loading">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1">Loading order details...</Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box className="pending-orders-loading">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/pending-orders")}
            sx={{ mt: 2 }}
          >
            Back to Pending Orders
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pending-orders-container">
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/pending-orders")}
            className="back-button"
          >
            Back to Pending Orders
          </Button>
        </Box>

        <Typography variant="h4" className="page-title" sx={{ mb: 3 }}>
          Review Pending Order #{orderId}
        </Typography>

        {order && (
          <>
            {/* Organization Information */}
            <Paper className="order-detail-card organization-card">
              <Typography variant="h6" className="section-title">
                <Business sx={{ color: '#2563EB' }} /> Organization Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <div className="detail-row">
                    <span className="detail-label">Organization Name:</span>
                    <span className="detail-value">{order.organizationName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{order.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Submission Date:</span>
                    <span className="detail-value">{formatDate(order.date)}</span>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="detail-row">
                    <span className="detail-label">Contact Email:</span>
                    <span className="detail-value">{order.contactEmail || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Contact Phone:</span>
                    <span className="detail-value">{order.contactPhone || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Shipping Address:</span>
                    <span className="detail-value">{order.shippingAddress || "N/A"}</span>
                  </div>
                </Grid>
              </Grid>
            </Paper>

            {/* Product Information */}
            <Paper className="order-detail-card product-card">
              <Typography variant="h6" className="section-title">
                <ShoppingCart sx={{ color: '#10B981' }} /> Product Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <div className="detail-row">
                    <span className="detail-label">Product Name:</span>
                    <span className="detail-value">{order.productName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Brand:</span>
                    <span className="detail-value">{order.brand || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{order.type || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Unit Type:</span>
                    <span className="detail-value">{order.unitType || "N/A"}</span>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="detail-row">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{order.quantity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price per Unit:</span>
                    <span className="detail-value">₹{order.price?.toFixed(2) || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">₹{order.totalAmount?.toFixed(2) || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Composition:</span>
                    <span className="detail-value">{order.composition || "N/A"}</span>
                  </div>
                </Grid>
              </Grid>
            </Paper>

            {/* Approval Form */}
            <Paper className="order-detail-card">
              <Typography variant="h6" className="section-title">
                <CheckCircle sx={{ color: '#10B981' }} /> Complete Order Details
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Please fill in the additional details required to process this order. All fields marked with * are required.
              </Typography>

              <div className="approval-form">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="PRN Number *"
                      name="prnNo"
                      value={formData.prnNo}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Batch Size (Strips) *"
                      name="batchSizeStrips"
                      value={formData.batchSizeStrips}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      type="number"
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Batch Size (Tabs) *"
                      name="batchSizeTabs"
                      value={formData.batchSizeTabs}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      type="number"
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="MRP *"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      type="number"
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Size Code *"
                      name="sizeCode"
                      value={formData.sizeCode}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="PVC/PVDC Color"
                      name="pvcColor"
                      value={formData.pvcColor}
                      onChange={handleChange}
                      variant="outlined"
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Packing Size"
                      name="packingSize"
                      value={formData.packingSize}
                      onChange={handleChange}
                      variant="outlined"
                      className="form-field"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expected Delivery Date *"
                      name="expectedDelivery"
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={handleChange}
                      variant="outlined"
                      required
                      className="form-field"
                      InputLabelProps={{
                        shrink: true,
                      }}
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
                      className="form-field"
                    />
                  </Grid>
                </Grid>
              </div>

              <div className="action-buttons">
                <Button
                  variant="contained"
                  color="error"
                  onClick={openRejectDialog}
                  disabled={processingOrder}
                  className="reject-button"
                  startIcon={<Cancel />}
                >
                  Reject Order
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleApproveOrder}
                  disabled={processingOrder}
                  className="approve-button"
                  startIcon={<CheckCircle />}
                >
                  {processingOrder ? <CircularProgress size={24} /> : "Approve Order"}
                </Button>
              </div>
            </Paper>
          </>
        )}

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog}>
          <DialogTitle>Reject Order</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please provide a reason for rejecting this order.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRejectDialog}>Cancel</Button>
            <Button 
              onClick={handleRejectOrder} 
              color="error" 
              disabled={!rejectionReason.trim() || processingOrder}
            >
              {processingOrder ? <CircularProgress size={24} /> : "Reject Order"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Layout>
  );
};

export default PendingOrderDetail;