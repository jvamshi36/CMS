import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Select,
  InputLabel,
  FormControl,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import OrgLayout from "../components/Layout/OrgLayout";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/NewOrder.css";


const OrderSubmissionInfo = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: 'rgba(37, 99, 235, 0.05)', 
        border: '1px solid rgba(37, 99, 235, 0.2)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>

        <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '1rem' }}>
          Important Information About Order Submission
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
        When you submit an order, it will be sent to our admin team for review and approval. 
        Orders are typically processed within 24-48 hours.
      </Typography>
      
      {expanded && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#4B5563', mb: 1 }}>
            <strong>Order approval process:</strong>
          </Typography>
          <ol style={{ margin: '0 0 16px 16px', paddingLeft: 0 }}>
            <li>Your order is submitted with status "Pending"</li>
            <li>Admin reviews the order details and product availability</li>
            <li>If approved, status changes to "Processing"</li>
            <li>Once shipped, status will update to "Shipped"</li>
            <li>When delivery is complete, status will be "Delivered"</li>
          </ol>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            You can track the status of your orders in the Orders section. You'll receive notifications 
            when your order status changes.
          </Typography>
        </Box>
      )}
      
      <Button 
        onClick={() => setExpanded(!expanded)} 
        sx={{ 
          mt: 1, 
          color: '#2563EB', 
          textTransform: 'none',
          p: 0,
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        {expanded ? "Show less" : "Learn more about the order process"}
      </Button>
    </Paper>
  );
};

const OrgNewOrder = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    batchSize: "",
    units: "",
    mrp: "",
    quantity: ""
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Fetch organization data and available products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organization profile data
        const orgResponse = await apiService.get("/api/org/dashboard/profile");
        setOrganizationData(orgResponse);

        // Fetch available products
        const productsResponse = await apiService.get("/api/org/available-products");
        
        // If the API doesn't return real data, use sample data
        if (!productsResponse || productsResponse.length === 0) {
          // Sample product data
          const sampleProducts = [
            { id: 1, name: "Paracetamol 500mg", type: "Medicine", unitTypes: ["I", "II"], availableBatches: ["100", "500", "1000"] },
            { id: 2, name: "Amoxicillin 250mg", type: "Medicine", unitTypes: ["I", "II"], availableBatches: ["50", "100", "500"] },
            { id: 3, name: "Vitamin C 1000mg", type: "Supplement", unitTypes: ["I"], availableBatches: ["30", "60", "90"] },
            { id: 4, name: "Ibuprofen 400mg", type: "Medicine", unitTypes: ["I", "II"], availableBatches: ["100", "200", "500"] },
            { id: 5, name: "Calcium + D3", type: "Supplement", unitTypes: ["I"], availableBatches: ["60", "120"] }
          ];
          setAvailableProducts(sampleProducts);
        } else {
          setAvailableProducts(productsResponse);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setSnackbar({
          open: true,
          message: "Failed to load necessary data. Please try again.",
          severity: "error"
        });
        
        // Set sample product data as fallback
        const sampleProducts = [
          { id: 1, name: "Paracetamol 500mg", type: "Medicine", unitTypes: ["I", "II"], availableBatches: ["100", "500", "1000"] },
          { id: 2, name: "Amoxicillin 250mg", type: "Medicine", unitTypes: ["I", "II"], availableBatches: ["50", "100", "500"] },
          { id: 3, name: "Vitamin C 1000mg", type: "Supplement", unitTypes: ["I"], availableBatches: ["30", "60", "90"] },
          { id: 4, name: "Ibuprofen 400mg", type: "Medicine", unitTypes: ["I", "II"], availableBatches: ["100", "200", "500"] },
          { id: 5, name: "Calcium + D3", type: "Supplement", unitTypes: ["I"], availableBatches: ["60", "120"] }
        ];
        setAvailableProducts(sampleProducts);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (isAuthenticated()) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Handle changes to the current item form
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // If product is changed, reset other fields
    if (name === "productId") {
      setCurrentItem(prev => ({
        ...prev,
        productId: value,
        batchSize: "",
        units: "",
        mrp: "",
        quantity: ""
      }));
    }
  };

  // Validate current item before adding to cart
  const validateItem = () => {
    const newErrors = {};
    
    if (!currentItem.productId) {
      newErrors.productId = "Please select a product";
    }
    
    if (!currentItem.batchSize) {
      newErrors.batchSize = "Please select batch size";
    }
    
    if (!currentItem.units) {
      newErrors.units = "Please select unit type";
    }
    
    if (!currentItem.mrp || isNaN(currentItem.mrp) || parseFloat(currentItem.mrp) <= 0) {
      newErrors.mrp = "Please enter a valid MRP";
    }
    
    if (!currentItem.quantity || isNaN(currentItem.quantity) || parseInt(currentItem.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add current item to cart
  const addToCart = () => {
    if (!validateItem()) {
      return;
    }
    
    // Find the selected product details
    const selectedProduct = availableProducts.find(p => p.id.toString() === currentItem.productId.toString());
    
    if (!selectedProduct) {
      setSnackbar({
        open: true,
        message: "Selected product not found",
        severity: "error"
      });
      return;
    }
    
    const newItem = {
      ...currentItem,
      id: Date.now().toString(), // Generate a temporary ID for the cart item
      productName: selectedProduct.name,
      productType: selectedProduct.type,
      // Calculate subtotal
      subtotal: parseFloat(currentItem.mrp) * parseInt(currentItem.quantity)
    };
    
    setCartItems(prev => [...prev, newItem]);
    
    // Reset current item form
    setCurrentItem({
      productId: "",
      batchSize: "",
      units: "",
      mrp: "",
      quantity: ""
    });
    
    setSnackbar({
      open: true,
      message: "Item added to cart",
      severity: "success"
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate total order amount
  const totalOrderAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Submit order
  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Your cart is empty. Please add items before submitting.",
        severity: "warning"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        orgId: organizationData?.id,
        organizationName: organizationData?.organizationName,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          batchSize: item.batchSize,
          unitType: item.units,
          mrp: parseFloat(item.mrp),
          quantity: parseInt(item.quantity),
          subtotal: item.subtotal
        })),
        totalAmount: totalOrderAmount,
        status: "Pending",
        shippingAddress: organizationData?.addressLine1 || "To be provided",
        contactEmail: organizationData?.representativeEmail,
        contactPhone: organizationData?.representativeNumber
      };
      
      console.log("Submitting order:", orderData);
      
      // Submit order to API
      const response = await apiService.post('/api/org/orders/submit', orderData);
      
      console.log("Order submission response:", response);
      
      setSnackbar({
        open: true,
        message: "Order submitted successfully! Awaiting admin approval.",
        severity: "success"
      });
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/org/orders');
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting order:", error);
      
      setSnackbar({
        open: true,
        message: `Failed to submit order: ${error.message || "Unknown error"}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Get available batch sizes for the selected product
  const getAvailableBatchSizes = () => {
    const selectedProduct = availableProducts.find(p => p.id.toString() === currentItem.productId.toString());
    return selectedProduct ? selectedProduct.availableBatches : [];
  };

  // Get available unit types for the selected product
  const getAvailableUnitTypes = () => {
    const selectedProduct = availableProducts.find(p => p.id.toString() === currentItem.productId.toString());
    return selectedProduct ? selectedProduct.unitTypes : [];
  };

  return (
    <OrgLayout>
      <div className="order-container">
        <Typography
          variant="h4"
          className="form-title"
          sx={{
            textAlign: "center",
            mb: 4,
            background: "linear-gradient(45deg, #2563EB, #1d4ed8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          Place New Order
        </Typography>
        <OrderSubmissionInfo />

        {loadingProducts ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Product Selection Form */}
            <Grid item xs={12} md={6}>
              <Card className="order-form-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Select Products
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.productId}>
                        <InputLabel>Product</InputLabel>
                        <Select
                          name="productId"
                          value={currentItem.productId}
                          onChange={handleItemChange}
                          label="Product"
                        >
                          {availableProducts.map(product => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} ({product.type})
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.productId && (
                          <Typography color="error" variant="caption">
                            {errors.productId}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.batchSize} disabled={!currentItem.productId}>
                        <InputLabel>Batch Size</InputLabel>
                        <Select
                          name="batchSize"
                          value={currentItem.batchSize}
                          onChange={handleItemChange}
                          label="Batch Size"
                        >
                          {getAvailableBatchSizes().map(size => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.batchSize && (
                          <Typography color="error" variant="caption">
                            {errors.batchSize}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.units} disabled={!currentItem.productId}>
                        <InputLabel>Unit Type</InputLabel>
                        <Select
                          name="units"
                          value={currentItem.units}
                          onChange={handleItemChange}
                          label="Unit Type"
                        >
                          {getAvailableUnitTypes().map(unit => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.units && (
                          <Typography color="error" variant="caption">
                            {errors.units}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="MRP"
                        name="mrp"
                        type="number"
                        value={currentItem.mrp}
                        onChange={handleItemChange}
                        fullWidth
                        disabled={!currentItem.productId}
                        error={!!errors.mrp}
                        helperText={errors.mrp}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={currentItem.quantity}
                        onChange={handleItemChange}
                        fullWidth
                        disabled={!currentItem.productId}
                        error={!!errors.quantity}
                        helperText={errors.quantity}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={addToCart}
                      startIcon={<AddIcon />}
                      disabled={!currentItem.productId}
                    >
                      Add to Order
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Cart Summary */}
            <Grid item xs={12} md={6}>
              <Card className="order-form-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingCartIcon sx={{ mr: 1 }} /> 
                    Order Summary
                  </Typography>
                  
                  {cartItems.length === 0 ? (
                    <Box py={4} textAlign="center">
                      <Typography color="textSecondary">
                        Your cart is empty. Add products to place an order.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="right">Batch</TableCell>
                              <TableCell align="right">Unit</TableCell>
                              <TableCell align="right">MRP</TableCell>
                              <TableCell align="right">Qty</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cartItems.map(item => (
                              <TableRow key={item.id}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell align="right">{item.batchSize}</TableCell>
                                <TableCell align="right">{item.units}</TableCell>
                                <TableCell align="right">₹{parseFloat(item.mrp).toFixed(2)}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">₹{item.subtotal.toFixed(2)}</TableCell>
                                <TableCell align="right">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box mb={3}>
                        <Divider />
                        <Box display="flex" justifyContent="space-between" py={2}>
                          <Typography variant="h6">Total Amount:</Typography>
                          <Typography variant="h6">₹{totalOrderAmount.toFixed(2)}</Typography>
                        </Box>
                        <Divider />
                      </Box>
                    </>
                  )}
                  
                  <Box display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/org/orders')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={cartItems.length === 0 || loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Submitting...' : 'Submit Order'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </div>

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
    </OrgLayout>
  );
};

export default OrgNewOrder;