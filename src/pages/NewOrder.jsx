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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import Layout from "../components/Layout/Layout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/NewOrder.css";

const NewOrder = () => {
  const navigate = useNavigate();
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

  const handleSubmit = async () => {
    try {
      // Validate form data
      const currentProduct = products[activeStep];
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
        setErrors(formErrors);
        return;
      }

      // Clear any previous errors
      setErrors({});

      // Prepare data for submission
      const orderData = {
        products: products.map(product => ({
          ...product.formData
        }))
      };

      // Send data to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Order submitted successfully:", data);

      // Optionally redirect or show success message
      alert("Order submitted successfully!");
      // If you want to redirect after submission:
      // navigate('/orders');

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again.");
    }
  };

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
          Create New Order
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
              disabled={activeStep === 0}
              className="action-button"
            >
              ← Back
            </Button>
            {activeStep === products.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                className="action-button submit-button"
              >
                Submit Order
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                className="action-button next-button"
                disabled={activeStep === products.length - 1}
              >
                Continue →
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              onClick={handleAddProduct}
              startIcon={<AddIcon />}
              className="action-button add-product-button"
            >
              Add Product
            </Button>
          </Box>
        </div>
      </div>
    </Layout>
  );
};

export default NewOrder;