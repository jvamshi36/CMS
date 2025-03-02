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
import { useNavigate, NavLink, useParams } from "react-router-dom";


const NewOrder = () => {
  const [products, setProducts] = useState([
    { name: "Product 1", formData: { brand: "", type: "", composition: "", quantity: "", price: "" } },
  ]);
  const [activeStep, setActiveStep] = useState(0);

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
      <Stepper activeStep={activeStep} alternativeLabel>
        {products.map((product, index) => (
          <Step key={product.name} completed={activeStep > index}>
            <StepLabel StepIconComponent={() =>
              activeStep > index ? <CheckIcon sx={{ color: "green" }} /> :
              activeStep === index ? <Typography sx={{ fontWeight: "bold", color: "#2563EB" }}>{index + 1}</Typography> :
              <Typography>{index + 1}</Typography>
            }>
              {product.name}
              <Button variant="text" onClick={() => handleDeleteProduct(index)} sx={{ ml: 2 }}>
                <DeleteIcon />
              </Button>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="h6" sx={{ mb: 2 }}></Typography>
      <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
        <Grid item xs={12}>
          <TextField label="Brand Name" name="brand" value={products[activeStep].formData.brand} onChange={(e) => handleChange(activeStep, e)} fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Type" name="type" value={products[activeStep].formData.type} onChange={(e) => handleChange(activeStep, e)} select fullWidth required>
            <MenuItem value="Medicine">Medicine</MenuItem>
            <MenuItem value="Supplement">Supplement</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Composition" name="composition" value={products[activeStep].formData.composition} onChange={(e) => handleChange(activeStep, e)} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Quantity" name="quantity" value={products[activeStep].formData.quantity} onChange={(e) => handleChange(activeStep, e)} fullWidth required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Price per Quantity" name="price" value={products[activeStep].formData.price} onChange={(e) => handleChange(activeStep, e)} fullWidth required />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", maxWidth: 600, mx: 'auto' }}>
        <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>Back</Button>
        {activeStep === products.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "#FF5722" }}>Submit</Button>
        ) : (
          <Button variant="contained" onClick={handleNext} sx={{ backgroundColor: "#2563EB" }} disabled={activeStep === products.length - 1}>Next</Button>
        )}
      </Box>

      <Box sx={{ mt: 3, textAlign: "center", maxWidth: 600, mx: 'auto' }}>
        <Button variant="contained" onClick={handleAddProduct} startIcon={<AddIcon />} sx={{ backgroundColor: "#4CAF50" }}>
          Add Product
        </Button>
      </Box>
    </Layout>
  );
};

export default NewOrder;
