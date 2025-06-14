import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  Alert,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box, // Added for more flexible layout with MUI sx prop
  useTheme, // To access theme for consistent colors
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // For the info section
import OrgLayout from "../components/Layout/OrgLayout";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Custom Alert component for Snackbar (consistent with other files)
const CustomAlert = React.forwardRef(function CustomAlert(props, ref) {
  return <Alert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Re-designed Order Submission Info Component
const OrderSubmissionInfo = () => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme(); // Access theme for consistent colors

  return (
    <Paper
      className="mb-8 p-6 rounded-2xl shadow-lg"
      sx={{
        background: `linear-gradient(to right, ${theme.palette.info.light}20, ${theme.palette.info.light}05)`,
        borderLeft: `5px solid ${theme.palette.info.main}`,
      }}
    >
      <Box className="flex items-center mb-2">
        <InfoOutlinedIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
        <Typography variant="h6" className="font-bold" sx={{ color: theme.palette.info.dark }}>
          Important Information About Order Submission
        </Typography>
      </Box>
      <Typography variant="body2" className="text-gray-700 mb-2">
        When you submit an order, it will be sent to our admin team for review and approval. Orders are typically processed within 24-48 hours.
      </Typography>
      {expanded && (
        <Box className="mb-2 transition-all duration-300 ease-in-out">
          <Typography variant="body2" className="text-gray-700 mb-1 font-semibold">
            Order approval process:
          </Typography>
          <ol className="list-decimal list-inside text-gray-700 mb-2 pl-4">
            <li>Your order is submitted with status "Pending"</li>
            <li>Admin reviews the order details and product availability</li>
            <li>If approved, status changes to "Processing"</li>
            <li>Once shipped, status will update to "Shipped"</li>
            <li>When delivery is complete, status will be "Delivered"</li>
          </ol>
          <Typography variant="body2" className="text-gray-700">
            You can track the status of your orders in the Orders section. You'll receive notifications when your order status changes.
          </Typography>
        </Box>
      )}
      <Button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 px-0 font-medium normal-case"
        sx={{ color: theme.palette.info.main }}
      >
        {expanded ? "Show less" : "Learn more about the order process"}
      </Button>
    </Paper>
  );
};

const OrgNewOrder = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme(); // Access the Material-UI theme

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        const orgResponse = await apiService.get("/api/org/dashboard/profile");
        setOrganizationData(orgResponse);
        const productsResponse = await apiService.get("/api/org/available-products");
        // Use provided mock data if API response is empty or invalid
        setAvailableProducts(
          productsResponse && Array.isArray(productsResponse) && productsResponse.length > 0
            ? productsResponse
            : [
                { id: "prod_1", name: "Paracetamol 500mg", type: "Medicine", unitTypes: ["Tablet", "Bottle"], availableBatches: ["100", "500", "1000"] },
                { id: "prod_2", name: "Amoxicillin 250mg", type: "Medicine", unitTypes: ["Capsule", "Box"], availableBatches: ["50", "100", "500"] },
                { id: "prod_3", name: "Vitamin C 1000mg", type: "Supplement", unitTypes: ["Tablet"], availableBatches: ["30", "60", "90"] },
                { id: "prod_4", name: "Ibuprofen 400mg", type: "Medicine", unitTypes: ["Tablet", "Bottle"], availableBatches: ["100", "200", "500"] },
                { id: "prod_5", name: "Calcium + D3", type: "Supplement", unitTypes: ["Tablet"], availableBatches: ["60", "120"] }
              ]
        );
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setSnackbar({
          open: true,
          message: "Failed to load necessary data. Please try again.",
          severity: "error"
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    if (isAuthenticated()) {
      fetchData();
    } else {
      // Handle case where user is not authenticated, e.g., redirect to login
      setSnackbar({ open: true, message: "You are not authenticated.", severity: "warning" });
      navigate('/login'); // Or whatever your login route is
    }
  }, [isAuthenticated, navigate]);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "productId") {
      // Reset dependent fields when product changes
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

  const validateItem = () => {
    const newErrors = {};
    if (!currentItem.productId) newErrors.productId = "Please select a product.";
    if (!currentItem.batchSize) newErrors.batchSize = "Please select batch size.";
    if (!currentItem.units) newErrors.units = "Please select unit type.";
    if (!currentItem.mrp || isNaN(currentItem.mrp) || parseFloat(currentItem.mrp) <= 0) newErrors.mrp = "Please enter a valid MRP (>0).";
    if (!currentItem.quantity || isNaN(currentItem.quantity) || parseInt(currentItem.quantity) <= 0) newErrors.quantity = "Please enter a valid quantity (>0).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addToCart = () => {
    if (!validateItem()) {
      setSnackbar({ open: true, message: "Please fill all required fields correctly.", severity: "error" });
      return;
    }
    const selectedProduct = availableProducts.find(p => p.id.toString() === currentItem.productId.toString());
    if (!selectedProduct) {
      setSnackbar({ open: true, message: "Selected product not found.", severity: "error" });
      return;
    }

    const newItem = {
      ...currentItem,
      id: Date.now().toString(), // Unique ID for cart item
      productName: selectedProduct.name,
      productType: selectedProduct.type,
      // Ensure subtotal is calculated from parsed numbers
      subtotal: parseFloat(currentItem.mrp) * parseInt(currentItem.quantity)
    };
    setCartItems(prev => [...prev, newItem]);
    setCurrentItem({ productId: "", batchSize: "", units: "", mrp: "", quantity: "" }); // Reset form
    setErrors({}); // Clear any lingering errors
    setSnackbar({ open: true, message: "Item added to cart!", severity: "success" });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setSnackbar({ open: true, message: "Item removed from cart.", severity: "info" });
  };

  const totalOrderAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setSnackbar({ open: true, message: "Your cart is empty. Please add items before submitting.", severity: "warning" });
      return;
    }
    if (!organizationData || !organizationData.id) {
        setSnackbar({ open: true, message: "Organization data is missing. Cannot submit order.", severity: "error" });
        return;
    }

    setLoading(true);
    try {
      // Format date for backend consistently
      const formatDateForBackend = (dateValue) => {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        return date.toISOString().slice(0, 19) + 'Z'; // Append 'Z' for UTC if backend expects it
      };

      const orderData = {
        orgId: organizationData.id,
        organizationName: organizationData.organizationName,
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
        status: "Pending", // Initial status
        shippingAddress: organizationData.addressLine1 || "Not specified",
        contactEmail: organizationData.representativeEmail || "Not specified",
        contactPhone: organizationData.representativeNumber || "Not specified",
        // Setting expectedDelivery to current date + 7 days as a default placeholder
        expectedDelivery: formatDateForBackend(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      };

      await apiService.post('/api/org/orders/submit', orderData);
      setSnackbar({ open: true, message: "Order submitted successfully! Awaiting admin approval.", severity: "success" });
      setTimeout(() => { navigate('/org/orders'); }, 2000);
    } catch (error) {
      console.error("Order submission error:", error);
      setSnackbar({ open: true, message: `Failed to submit order: ${error.response?.data?.message || error.message || "Unknown error"}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({...snackbar, open: false});

  const getAvailableBatchSizes = () => {
    const selectedProduct = availableProducts.find(p => p.id.toString() === currentItem.productId.toString());
    return selectedProduct ? selectedProduct.availableBatches : [];
  };

  const getAvailableUnitTypes = () => {
    const selectedProduct = availableProducts.find(p => p.id.toString() === currentItem.productId.toString());
    return selectedProduct ? selectedProduct.unitTypes : [];
  };

  // Determine if Add to Cart button should be disabled
  const isAddToCartDisabled = !currentItem.productId ||
                             !currentItem.batchSize ||
                             !currentItem.units ||
                             isNaN(parseFloat(currentItem.mrp)) || parseFloat(currentItem.mrp) <= 0 ||
                             isNaN(parseInt(currentItem.quantity)) || parseInt(currentItem.quantity) <= 0 ||
                             loadingProducts; // Also disable if products are still loading

  return (
    <OrgLayout>
      <Box className="max-w-6xl mx-auto px-4 py-10"> {/* Increased max-width for more space */}
        {/* Header */}
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <Typography variant="h4" component="h1" className="font-bold" sx={{ color: theme.palette.primary.main }}>
            Place New Order
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate("/org/orders")}
            className="rounded-xl font-semibold px-6 py-2 transition hover:scale-105"
            sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}10`, // Subtle hover
                    borderColor: theme.palette.primary.dark,
                }
            }}
          >
            Back to Orders
          </Button>
        </Box>

        <OrderSubmissionInfo />

        {loadingProducts ? (
          <Box className="flex justify-center items-center h-60 bg-white rounded-2xl shadow-xl my-8">
            <CircularProgress size={50} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" className="ml-4 text-gray-700">Loading available products...</Typography>
          </Box>
        ) : availableProducts.length === 0 ? (
            <Box className="text-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
                <Typography variant="h6" className="text-gray-600 mb-4">
                    No products available for order at the moment.
                </Typography>
                <Typography variant="body1" className="text-gray-500 mb-6">
                    Please check back later or contact support.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/org/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:scale-105 transition"
                >
                    Go to Dashboard
                </Button>
            </Box>
        ) : (
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap */}
            {/* Product Selection Card */}
            <Card className="shadow-2xl rounded-3xl border border-blue-100 bg-white transform transition-transform duration-300 hover:scale-[1.01]">
              <CardContent>
                <Typography variant="h5" className="mb-6 font-bold flex items-center" sx={{ color: theme.palette.primary.dark }}>
                  <AddIcon className="mr-2" sx={{ color: theme.palette.primary.main }} /> Select Products to Add
                </Typography>
                <Box className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Increased gap in form */}
                  <FormControl fullWidth error={!!errors.productId}>
                    <InputLabel id="product-select-label">Product</InputLabel>
                    <Select
                      labelId="product-select-label"
                      name="productId"
                      value={currentItem.productId}
                      onChange={handleItemChange}
                      label="Product"
                      className="rounded-lg bg-gray-50 border border-gray-200" // Subtle input styling
                    >
                      {availableProducts.map(product => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} ({product.type})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.productId && (
                      <Typography color="error" variant="caption" className="mt-1 ml-2">
                        {errors.productId}
                      </Typography>
                    )}
                  </FormControl>
                  <FormControl fullWidth error={!!errors.batchSize} disabled={!currentItem.productId}>
                    <InputLabel id="batch-size-label">Batch Size</InputLabel>
                    <Select
                      labelId="batch-size-label"
                      name="batchSize"
                      value={currentItem.batchSize}
                      onChange={handleItemChange}
                      label="Batch Size"
                      className="rounded-lg bg-gray-50 border border-gray-200"
                    >
                      {getAvailableBatchSizes().map(size => (
                        <MenuItem key={size} value={size}>{size}</MenuItem>
                      ))}
                    </Select>
                    {errors.batchSize && (
                      <Typography color="error" variant="caption" className="mt-1 ml-2">
                        {errors.batchSize}
                      </Typography>
                    )}
                  </FormControl>
                  <FormControl fullWidth error={!!errors.units} disabled={!currentItem.productId}>
                    <InputLabel id="unit-type-label">Unit Type</InputLabel>
                    <Select
                      labelId="unit-type-label"
                      name="units"
                      value={currentItem.units}
                      onChange={handleItemChange}
                      label="Unit Type"
                      className="rounded-lg bg-gray-50 border border-gray-200"
                    >
                      {getAvailableUnitTypes().map(unit => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </Select>
                    {errors.units && (
                      <Typography color="error" variant="caption" className="mt-1 ml-2">
                        {errors.units}
                      </Typography>
                    )}
                  </FormControl>
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
                    inputProps={{ min: 0, step: "0.01" }} // Allow decimals for MRP
                    className="rounded-lg bg-gray-50 border border-gray-200"
                  />
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
                    className="rounded-lg bg-gray-50 border border-gray-200"
                  />
                </Box>
                <Box className="flex justify-end mt-8">
                  <Button
                    variant="contained"
                    onClick={addToCart}
                    startIcon={loadingProducts ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    disabled={isAddToCartDisabled}
                    className="rounded-xl font-semibold shadow-lg transition hover:scale-105"
                    sx={{
                        background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        '&:hover': {
                            background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        },
                        color: 'white',
                    }}
                  >
                    {loadingProducts ? 'Loading...' : 'Add to Order'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Cart Summary Card */}
            <Card className="shadow-2xl rounded-3xl border border-blue-100 bg-white transform transition-transform duration-300 hover:scale-[1.01]">
              <CardContent>
                <Typography variant="h5" className="mb-6 font-bold flex items-center" sx={{ color: theme.palette.primary.dark }}>
                  <ShoppingCartIcon className="mr-2" sx={{ color: theme.palette.primary.main }} /> Order Summary
                </Typography>
                {cartItems.length === 0 ? (
                  <Box className="py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <ShoppingCartIcon sx={{ fontSize: 60, color: theme.palette.grey[300], mb: 2 }} />
                    <Typography variant="body1">
                      Your cart is empty. Add products to place an order.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} className="mb-4 rounded-xl border border-gray-200">
                      <Table size="small" aria-label="cart items table">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.primary.light + '10' }}>
                            <TableCell className="font-bold text-blue-700">Product</TableCell>
                            <TableCell align="right" className="font-bold text-blue-700">Batch</TableCell>
                            <TableCell align="right" className="font-bold text-blue-700">Unit</TableCell>
                            <TableCell align="right" className="font-bold text-blue-700">MRP</TableCell>
                            <TableCell align="right" className="font-bold text-blue-700">Qty</TableCell>
                            <TableCell align="right" className="font-bold text-blue-700">Subtotal</TableCell>
                            <TableCell align="right" className="font-bold text-blue-700">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cartItems.map((item, index) => (
                            <TableRow
                              key={item.id}
                              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} // Alternating row colors
                              sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
                            >
                              <TableCell className="text-gray-800">{item.productName}</TableCell>
                              <TableCell align="right" className="text-gray-700">{item.batchSize}</TableCell>
                              <TableCell align="right" className="text-gray-700">{item.units}</TableCell>
                              <TableCell align="right" className="text-gray-700">₹{parseFloat(item.mrp).toFixed(2)}</TableCell>
                              <TableCell align="right" className="text-gray-700">{item.quantity}</TableCell>
                              <TableCell align="right" className="font-semibold text-gray-800">₹{item.subtotal.toFixed(2)}</TableCell>
                              <TableCell align="right">

                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box className="flex justify-between items-center py-3 px-2 border-t border-gray-200 mt-4">
                      <Typography variant="h5" className="font-bold text-gray-800">Total Amount:</Typography>
                      <Typography variant="h5" className="font-bold" sx={{ color: theme.palette.success.dark }}>
                        ₹{totalOrderAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                )}
                <Divider className="my-6" />
                <Box className="flex justify-end gap-4"> {/* Aligned buttons to end */}
                  <Button
                    variant="outlined"
                    onClick={() => {
                        setCartItems([]); // Clear cart on cancel
                        navigate('/org/orders');
                    }}
                    disabled={loading}
                    className="rounded-xl font-semibold px-6 py-2"
                    sx={{
                        borderColor: theme.palette.grey[400],
                        color: theme.palette.grey[700],
                        '&:hover': {
                            backgroundColor: theme.palette.grey[100],
                        }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={cartItems.length === 0 || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    className="rounded-xl font-semibold shadow-lg transition hover:scale-105"
                    sx={{
                        background: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                        '&:hover': {
                            background: `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                        },
                        color: 'white',
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Order'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <CustomAlert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </CustomAlert>
        </Snackbar>
      </Box>
    </OrgLayout>
  );
};

export default OrgNewOrder;