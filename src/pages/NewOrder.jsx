import React, { useState } from "react";
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
import "../styles/NewOrder.css";

const NewOrder = () => {
  const [products, setProducts] = useState([
    { name: "Product 1", formData: { brand: "", type: "", composition: "", quantity: "", price: "" } },
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
      formData: { brand: "", type: "", composition: "", quantity: "", price: "" },
    };
    setProducts([...products, newProduct]);
    setActiveStep(products.length);
  };

  const handleDeleteProduct = (index) => {
    if (index === 0 && products.length === 1) {
      setProducts([
        { name: "Product 1", formData: { brand: "", type: "", composition: "", quantity: "", price: "" } },
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

  const handleSubmit = () => {
    console.log("Submitted Order:", products);
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
            <Grid item xs={6}>
              <TextField
                label="Quantity"
                name="quantity"
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
                label="Price per Quantity"
                name="price"
                value={products[activeStep].formData.price}
                onChange={(e) => handleChange(activeStep, e)}
                fullWidth
                required
                className="form-input"
                error={!!errors.price}
                helperText={errors.price}
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
