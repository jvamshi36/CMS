// src/pages/OrderDetails.jsx - Updated with complete edit support
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from "@mui/material";
import { ArrowBack, Edit, Save, Cancel } from "@mui/icons-material";
import Layout from "../components/Layout/Layout";
import apiService from "../utils/api";
import "../styles/OrderDetails.css";

const OrderDetails = () => {
  const { companyId, orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/api/admin/orders/${companyId}/${orderId}`);
        console.log("Order details received:", response);
        setOrderDetails(response);
        setEditFormData(response); // Initialize edit form with current data
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if not a valid date
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Date parsing error:", e);
      return dateString; // Return original string on error
    }
  };

  // Format date for input fields (YYYY-MM-DD format required by date inputs)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return ""; // Return empty string if invalid date
      }
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } catch (e) {
      console.error("Date formatting error:", e);
      return "";
    }
  };

  // Handle edit mode
  const handleEditClick = () => {
    setEditFormData({...orderDetails}); // Create a fresh copy
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasChanges()) {
      setConfirmDialogOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    setEditFormData({...orderDetails}); // Reset form data to original values
    setIsEditing(false);
  };

  const handleDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const hasChanges = () => {
    // Check if any fields have been changed
    if (!orderDetails) return false;

    for (const key in editFormData) {
      // Skip comparison for objects/arrays and undefined values
      if (
        typeof editFormData[key] === 'object' ||
        orderDetails[key] === undefined ||
        editFormData[key] === undefined
      ) {
        continue;
      }

      // Convert to string for comparison to handle different types
      if (String(orderDetails[key]) !== String(editFormData[key])) {
        console.log(`Field ${key} changed: ${orderDetails[key]} -> ${editFormData[key]}`);
        return true;
      }
    }
    return false;
  };

  const handleSaveClick = async () => {
    // Validate the form data before submitting
    const validationErrors = validateFormData(editFormData);
    if (Object.keys(validationErrors).length > 0) {
      // Display the first validation error in a snackbar
      const firstError = Object.values(validationErrors)[0];
      setSnackbar({
        open: true,
        message: firstError,
        severity: "error"
      });
      return;
    }

    try {
      setSaving(true);

      // Ensure IDs are set for the API request
      const dataToSubmit = {
        ...editFormData,
        id: Number(orderId),
        orgId: Number(companyId)
      };

      console.log("Saving order with data:", dataToSubmit);

      // Make API call to update the order
      const response = await apiService.put(`/api/admin/orders/${companyId}/${orderId}`, dataToSubmit);

      console.log("Update response:", response);

      // Update the local state with the response (complete updated order)
      setOrderDetails(response);
      setIsEditing(false);

      // Show success message
      setSnackbar({
        open: true,
        message: "Order details updated successfully!",
        severity: "success"
      });
    } catch (err) {
      console.error("Error updating order details:", err);

      // Check for validation errors in the response
      if (err.response && err.response.status === 400 && err.response.data) {
        console.error("Validation errors from server:", err.response.data);
        // Display the first validation error from the server
        const errorMessage = typeof err.response.data === 'object' ?
          Object.values(err.response.data)[0] :
          "Please check your form data and try again.";

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error"
        });
      } else {
        setSnackbar({
          open: true,
          message: err.message || "Failed to update order details. Please try again.",
          severity: "error"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Function to validate form data before submission
  const validateFormData = (formData) => {
    const errors = {};

    // Validate product name
    if (!formData.productName || formData.productName.trim() === '') {
      errors.productName = "Product name is required";
    }

    // Validate brand
    if (!formData.brand || formData.brand.trim() === '') {
      errors.brand = "Brand is required";
    }

    // Validate type
    if (!formData.type || formData.type.trim() === '') {
      errors.type = "Type is required";
    }

    // Validate quantity
    if (!formData.quantity) {
      errors.quantity = "Quantity is required";
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }

    // Validate shipping address if present
    if (formData.shippingAddress && formData.shippingAddress.trim() === '') {
      errors.shippingAddress = "Shipping address cannot be empty if provided";
    }

    // Validate prices
    if (formData.totalAmount && (isNaN(formData.totalAmount) || parseFloat(formData.totalAmount) < 0)) {
      errors.totalAmount = "Total amount must be a non-negative number";
    }

    if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
      errors.price = "Price must be a non-negative number";
    }

    // Validate expected delivery date if present
    if (formData.expectedDelivery) {
      try {
        const date = new Date(formData.expectedDelivery);
        if (isNaN(date.getTime())) {
          errors.expectedDelivery = "Invalid delivery date format";
        }
      } catch (e) {
        errors.expectedDelivery = "Invalid delivery date";
      }
    }

    return errors;
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Prepare displayable order data
  const getOrderDetailsData = () => {
    if (!orderDetails) return {};

    return {
      "Order ID": orderDetails.id || orderDetails.orderId,
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

  // Status options for the dropdown
  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Completed",
    "Cancelled"
  ];

  if (loading && !orderDetails) {
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

  return (
    <Layout>
      <Box className="details-container">
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
<Button
  variant="outlined"
  startIcon={<ArrowBack />}
  onClick={() => navigate(`/companies/${companyId}/orders`)}
  sx={{
    mb: 2,
    alignSelf: 'flex-start',
    borderRadius: '12px !important',
    padding: '10px 20px !important',
    fontWeight: '600 !important',
    letterSpacing: '0.5px !important',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.15) !important',
    backdropFilter: 'blur(10px) !important',
    WebkitBackdropFilter: 'blur(10px) !important',
    border: '1px solid rgb(255, 255, 255, 0.2) !important',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important',
    position: 'relative !important',
    overflow: 'hidden !important'
  }}
>
  Back to Orders
</Button>
        <Typography variant="h6" className="section-title">
          Order Details #{orderId}
        </Typography>
      </Box>

        {/* Order Details */}
        {isEditing ? (
          <Card className="details-card">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    name="productName"
                    value={editFormData.productName || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={editFormData.brand || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Type"
                    name="type"
                    value={editFormData.type || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="Medicine">Medicine</MenuItem>
                    <MenuItem value="Supplement">Supplement</MenuItem>
                    <MenuItem value="Equipment">Equipment</MenuItem>
                    <MenuItem value="Consumable">Consumable</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PRN No."
                    name="prnNo"
                    value={editFormData.prnNo || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    name="totalAmount"
                    value={editFormData.totalAmount || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    type="number"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={editFormData.status || "Processing"}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Shipping Address"
                    name="shippingAddress"
                    value={editFormData.shippingAddress || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tracking Number"
                    name="trackingNumber"
                    value={editFormData.trackingNumber || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expected Delivery Date"
                    name="expectedDelivery"
                    value={formatDateForInput(editFormData.expectedDelivery) || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Composition"
                    name="composition"
                    value={editFormData.composition || ""}
                    onChange={handleChange}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Card className="details-card">
            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(getOrderDetailsData()).map(([key, value]) => (
                  <Grid item xs={12} sm={4} key={key}>
                   <Typography variant="body2" className="detail-value">
                     {key}: <span>
                       {typeof value === "string" &&
                       ["processing", "pending", "completed", "cancelled", "shipped", "delivered"].includes(value.toLowerCase()) ? (
                         <span >{value}</span>
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
        )}

        {/* Additional Product Details if available */}
        {orderDetails && (orderDetails.items?.length > 0 || orderDetails.quantity) && (
          <>
            <Typography variant="h6" className="section-title">
              Product Information
            </Typography>

{isEditing ? (
  <Card className="details-card">
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            value={editFormData.quantity || ""}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="number"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Rate"
            name="rate"
            value={editFormData.rate || ""}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="number"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Batch Size (Strips)"
            name="batchSizeStrips"
            value={editFormData.batchSizeStrips || ""}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Batch Size (Tabs)"
            name="batchSizeTabs"
            value={editFormData.batchSizeTabs || ""}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="MRP"
            name="mrp"
            value={editFormData.mrp || ""}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="number"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Size Code"
            name="sizeCode"
            value={editFormData.sizeCode || ""}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
) : (
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
)}
          </>
        )}

        {/* Order Actions */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancelEdit}
                startIcon={<Cancel />}
                className="cancel-button"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveClick}
                startIcon={<Save />}
                className="save-button"
                disabled={loading || !hasChanges()}
              >
                {loading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditClick}
                startIcon={<Edit />}
                className="edit-button"
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
                  className="cancel-order-button"
                >
                  Cancel Order
                </Button>
              )}
            </>
          )}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleDialogClose}
        >
          <DialogTitle>Discard Changes?</DialogTitle>
          <DialogContent>
            <Typography>
              You have unsaved changes. Are you sure you want to discard them?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmCancel} color="error">
              Discard Changes
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
      </Box>
    </Layout>
  );
};

export default OrderDetails;