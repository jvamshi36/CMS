// src/pages/OrderDetails.jsx
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

  // Handle edit mode
  const handleEditClick = () => {
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
    setEditFormData(orderDetails); // Reset form data
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
    for (const key in editFormData) {
      if (orderDetails[key] !== editFormData[key]) {
        return true;
      }
    }
    return false;
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      // Make API call to update the order
      await apiService.put(`/api/admin/orders/${companyId}/${orderId}`, editFormData);

      // Update the local state with the edited data
      setOrderDetails(editFormData);
      setIsEditing(false);

      // Show success message
      setSnackbar({
        open: true,
        message: "Order details updated successfully!",
        severity: "success"
      });
    } catch (err) {
      console.error("Error updating order details:", err);
      setSnackbar({
        open: true,
        message: "Failed to update order details. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Shipped">Shipped</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
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
                    value={editFormData.expectedDelivery || ""}
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