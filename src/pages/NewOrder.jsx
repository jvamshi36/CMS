import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import BugReportIcon from "@mui/icons-material/BugReport";
import Layout from "../components/Layout/Layout";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../utils/api";
import { useAuth } from "../context/AuthContext.js";
import "../styles/NewOrder.css";

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([
    {
      name: "Product 1",
      formData: {
        prnNo: "",
        productName: "",
        brand: "",
        type: "",
        unitType: "",
        batchSizeStrips: "",
        unit: "",
        batchSizeTabs: "",
        mrp: "",
        sizeCode: "",
        pvcColor: "",
        packingSize: "",
        rate: "",
        amount: "",
        remarks: "",
        cylinderCharges: "",
        dpcoMrp: "",
        composition: "",
        quantity: "",
        price: ""
      }
    },
  ]);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Extract company ID from URL query params
  const companyId = new URLSearchParams(location.search).get('companyId');

  // Log authentication status on component mount
  useEffect(() => {
    console.log("Component mounted");
    console.log("Is authenticated?", isAuthenticated());
    console.log("Is admin?", isAdmin());
    console.log("Company ID from URL:", companyId);
    console.log("Token:", sessionStorage.getItem('_auth_token'));
  }, [isAuthenticated, isAdmin, companyId]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, products.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleAddProduct = () => {
    const newProduct = {
      name: `Product ${products.length + 1}`,
      formData: {
        prnNo: "",
        productName: "",
        brand: "",
        type: "",
        unitType: "",
        batchSizeStrips: "",
        unit: "",
        batchSizeTabs: "",
        mrp: "",
        sizeCode: "",
        pvcColor: "",
        packingSize: "",
        rate: "",
        amount: "",
        remarks: "",
        cylinderCharges: "",
        dpcoMrp: "",
        composition: "",
        quantity: "",
        price: ""
      },
    };
    setProducts([...products, newProduct]);
    setActiveStep(products.length);
  };

  const handleDeleteProduct = (index) => {
    if (index === 0 && products.length === 1) {
      setProducts([
        {
          name: "Product 1",
          formData: {
            prnNo: "",
            productName: "",
            brand: "",
            type: "",
            unitType: "",
            batchSizeStrips: "",
            unit: "",
            batchSizeTabs: "",
            mrp: "",
            sizeCode: "",
            pvcColor: "",
            packingSize: "",
            rate: "",
            amount: "",
            remarks: "",
            cylinderCharges: "",
            dpcoMrp: "",
            composition: "",
            quantity: "",
            price: ""
          }
        },
      ]);
      setActiveStep(0);
    } else {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
      setActiveStep(Math.min(activeStep, updatedProducts.length - 1));
    }
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...products];
    updatedProducts[index].formData[name] = value;
    setProducts(updatedProducts);
  };

  // Debug function to check form data
  const debugFormData = () => {
    const currentProduct = products[activeStep];
    console.log("Current form data:", currentProduct.formData);
    console.log("Required fields for Order entity:", [
      "orgId", "status", "totalAmount", "shippingAddress", "productName",
      "brand", "type", "quantity", "price"
    ]);

    // Check for missing required fields
    const missingFields = ["productName", "brand", "type", "quantity", "price"]
      .filter(field => !currentProduct.formData[field]);

    console.log("Missing required fields:", missingFields);
    console.log("Company ID:", companyId);
    console.log("Authentication token:", sessionStorage.getItem('_auth_token'));

    setSnackbar({
      open: true,
      message: "Form data logged to console",
      severity: "info"
    });
  };

  const handleSubmit = async () => {
    try {
      console.log("Submit button clicked");
      setLoading(true);

      // Validate form data
      const currentProduct = products[activeStep];
      console.log("Current form data:", currentProduct.formData);

      const formErrors = {};

      // Basic validation checks
      Object.entries(currentProduct.formData).forEach(([key, value]) => {
        // Skip validation for optional fields
        if (['remarks', 'cylinderCharges', 'dpcoMrp'].includes(key)) return;

        if (!value && value !== 0) {
          formErrors[key] = "This field is required";
        }
      });

      // If there are errors, update the errors state and return
      if (Object.keys(formErrors).length > 0) {
        console.log("Validation errors:", formErrors);
        setErrors(formErrors);
        setLoading(false);
        setSnackbar({
          open: true,
          message: "Please fill in all required fields",
          severity: "error"
        });
        return;
      }

      // Clear any previous errors
      setErrors({});
      console.log("Form validation passed, preparing to submit");

      // Calculate a basic total amount if not provided
      let calculatedTotal = 0;
      if (currentProduct.formData.price && currentProduct.formData.quantity) {
        calculatedTotal = parseFloat(currentProduct.formData.price) *
                          parseInt(currentProduct.formData.quantity);
      }

      // Prepare data for submission
      const orderData = {
        // Include basic required fields
        orgId: parseInt(companyId) || null,
        status: "Processing",
        totalAmount: parseFloat(currentProduct.formData.amount) || calculatedTotal || 0,
        shippingAddress: "To be determined", // This should ideally come from a form field

        // Include all form fields
        ...currentProduct.formData,

        // Ensure numeric fields are properly formatted
        quantity: parseInt(currentProduct.formData.quantity || 0),
        price: parseFloat(currentProduct.formData.price || 0),

        // Generate a unique order ID if needed
        orderId: `ORD-${Date.now()}`
      };

      console.log("Order data being submitted:", orderData);
      console.log("Authentication status:", isAuthenticated());
      console.log("Admin status:", isAdmin());
      console.log("Sending request to: /api/admin/orders/submit");

      // Use API service to submit the order
      const response = await apiService.post('/api/admin/orders/submit', orderData);

      console.log("Order submission response:", response);

      setSnackbar({
        open: true,
        message: "Order submitted successfully!",
        severity: "success"
      });

      // Wait a moment before redirecting
      setTimeout(() => {
        if (companyId) {
          navigate(`/companies/${companyId}/orders`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);

    } catch (error) {
      console.error("Error submitting order:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

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

  // Function to automatically calculate amount based on rate and quantity
  const calculateAmount = (index) => {
    const product = products[index];
    const rate = parseFloat(product.formData.rate || 0);
    const quantity = parseInt(product.formData.quantity || 0);

    if (rate && quantity) {
      const amount = (rate * quantity).toFixed(2);

      const updatedProducts = [...products];
      updatedProducts[index].formData.amount = amount;
      updatedProducts[index].formData.price = rate; // Also set price to rate for consistency
      setProducts(updatedProducts);

      console.log(`Calculated amount: ${amount} (rate: ${rate} × quantity: ${quantity})`);
    }
  };

  useEffect(() => {
    // Calculate amount whenever rate or quantity changes
    const currentProduct = products[activeStep];
    if (currentProduct.formData.rate && currentProduct.formData.quantity) {
      calculateAmount(activeStep);
    }
  }, [products[activeStep]?.formData.rate, products[activeStep]?.formData.quantity]);

  return (
    <Layout>
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
          Create New Order {companyId ? `for Company #${companyId}` : ""}
        </Typography>

        <div className="stepper-wrapper">
          <Stepper activeStep={activeStep} alternativeLabel>
            {products.map((product, index) => (
              <Step key={product.name} completed={activeStep > index}>
                <StepLabel
                  StepIconComponent={() =>
                    activeStep > index ? (
                      <div className="step-completed">
                        <CheckIcon sx={{ color: "#10B981" }} />
                      </div>
                    ) : (
                      <div className={`step-number ${activeStep === index ? 'active' : ''}`}>
                        {index + 1}
                      </div>
                    )
                  }
                >
                  {product.name}
                  <Button
                    className="delete-button"
                    onClick={() => handleDeleteProduct(index)}
                    sx={{ ml: 2 }}
                  >
                    <DeleteIcon />
                  </Button>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>

        <div className="order-form-card">
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="PRN. NO"
                name="prnNo"
                value={products[activeStep].formData.prnNo}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.prnNo}
                helperText={errors.prnNo}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Product Name"
                name="productName"
                value={products[activeStep].formData.productName}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.productName}
                helperText={errors.productName}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Brand Name"
                name="brand"
                value={products[activeStep].formData.brand}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.brand}
                helperText={errors.brand}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Type"
                name="type"
                value={products[activeStep].formData.type}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.type}
                helperText={errors.type}
              >
                <MenuItem value="Medicine">Medicine</MenuItem>
                <MenuItem value="Supplement">Supplement</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Unit Type"
                name="unitType"
                value={products[activeStep].formData.unitType}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.unitType}
                helperText={errors.unitType}
              >
                <MenuItem value="I">I</MenuItem>
                <MenuItem value="II">II</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Batch Size (In Strips)"
                name="batchSizeStrips"
                value={products[activeStep].formData.batchSizeStrips}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.batchSizeStrips}
                helperText={errors.batchSizeStrips}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Unit"
                name="unit"
                value={products[activeStep].formData.unit}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.unit}
                helperText={errors.unit}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Batch Size (In Tabs)"
                name="batchSizeTabs"
                value={products[activeStep].formData.batchSizeTabs}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.batchSizeTabs}
                helperText={errors.batchSizeTabs}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="MRP"
                name="mrp"
                value={products[activeStep].formData.mrp}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.mrp}
                helperText={errors.mrp}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Size Code"
                name="sizeCode"
                value={products[activeStep].formData.sizeCode}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.sizeCode}
                helperText={errors.sizeCode}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="PVC/PVDC Color"
                name="pvcColor"
                value={products[activeStep].formData.pvcColor}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.pvcColor}
                helperText={errors.pvcColor}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Packing Size"
                name="packingSize"
                value={products[activeStep].formData.packingSize}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.packingSize}
                helperText={errors.packingSize}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Rate"
                name="rate"
                type="number"
                value={products[activeStep].formData.rate}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.rate}
                helperText={errors.rate}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={products[activeStep].formData.quantity}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Amount"
                name="amount"
                value={products[activeStep].formData.amount}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.amount}
                helperText={errors.amount}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price"
                name="price"
                type="number"
                value={products[activeStep].formData.price}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.price}
                helperText={errors.price}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Remarks"
                name="remarks"
                value={products[activeStep].formData.remarks}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                className="form-input"
                error={!!errors.remarks}
                helperText={errors.remarks}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Cylinder Charges Carton Deposit"
                name="cylinderCharges"
                value={products[activeStep].formData.cylinderCharges}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                className="form-input"
                error={!!errors.cylinderCharges}
                helperText={errors.cylinderCharges}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="DPCO MRP"
                name="dpcoMrp"
                value={products[activeStep].formData.dpcoMrp}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                className="form-input"
                error={!!errors.dpcoMrp}
                helperText={errors.dpcoMrp}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Composition"
                name="composition"
                value={products[activeStep].formData.composition}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.composition}
                helperText={errors.composition}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              className="action-button"
            >
              ← Back
            </Button>
            {activeStep === products.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                className="action-button submit-button"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Submit Order"}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                className="action-button next-button"
                disabled={activeStep === products.length - 1 || loading}
              >
                Continue →
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 4, textAlign: "center", display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddProduct}
              startIcon={<AddIcon />}
              className="action-button add-product-button"
              disabled={loading}
            >
              Add Product
            </Button>

            <Button
              variant="outlined"
              onClick={debugFormData}
              startIcon={<BugReportIcon />}
              color="secondary"
              className="debug-button"
              disabled={loading}
            >
              Debug Form Data
            </Button>
          </Box>
        </div>
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
    </Layout>
  );
};

export default NewOrder;