import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import Layout from "../components/Layout/Layout"; // Adjust the path as necessary
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Snackbar, Alert } from "@mui/material";
import "../styles/NeworgForm.css";
import apiService from "../utils/api";

const steps = [
  "Organization Details",
  "Organization Credentials",
  "Organization Representative",
  "Website Credentials",
];

const NeworgForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    organizationName: "",
    constitution: "",
    addressLine1: "",
    city: "",
    zip: "",
    gstNumber: "",
    panNumber: "",
    drugLicense1: "",
    drugLicense2: "",
    representativeFirstName: "",
    representativeLastName: "",
    representativeEmail: "",
    representativeAadhar: "",
    representativeNumber: "",
    websiteUsername: "",
    confirmWebsiteUsername: "",
    websitePassword: "",
    confirmWebsitePassword: "",
  });

  const [errors, setErrors] = useState({}); // For displaying validation errors
  const navigate = useNavigate(); // Initialize useNavigate
 const [openSnackbar, setOpenSnackbar] = useState(false);

  const validateStep = () => {
    let newErrors = {};
    const requiredFields = {
      0: ["organizationName", "constitution", "addressLine1", "city", "zip"],
      1: ["gstNumber", "panNumber", "drugLicense1", "drugLicense2"],
      2: ["representativeFirstName", "representativeLastName", "representativeEmail", "representativeAadhar", "representativeNumber"],
      3: ["websiteUsername", "confirmWebsiteUsername", "websitePassword", "confirmWebsitePassword"],
    };

    requiredFields[activeStep].forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (activeStep === 3) {
      if (formData.websiteUsername !== formData.confirmWebsiteUsername) {
        newErrors.websiteUsername = "Usernames do not match";
      }
      if (formData.websitePassword !== formData.confirmWebsitePassword) {
        newErrors.websitePassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for the field being edited
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    // Enforce numeric input for specific fields
    const numericFields = ["zip", "representativeNumber", "representativeAadhar"];
    if (numericFields.includes(name) && !/^\d*$/.test(value)) {
      return; // Do not update state if non-numeric input is detected
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return; // Ensure final step is validated

    try {
      const token = localStorage.getItem('token');
      const response = await apiService.post(
        '/api/new-org/submit',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      console.log("Organization created:", response.data);
       setOpenSnackbar(true);

            // Redirect after 5 seconds
            setTimeout(() => {
              navigate("/companies");
            }, 5000);

    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        if (error.response.status === 401) {
          alert("You need to log in to submit this form");
        } else if (error.response.status === 400 && error.response.data) {
          setErrors(error.response.data);
        } else {
          alert(`Server error: ${error.response.status}`);
        }
      } else {
        alert("Error connecting to server");
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Organization Name"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.organizationName}
                helperText={errors.organizationName}
                className="form-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Constitution"
                name="constitution"
                value={formData.constitution}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.constitution}
                helperText={errors.constitution}
                className="form-input"
              >
                <MenuItem value="Private">Private</MenuItem>
                <MenuItem value="Public">Public</MenuItem>
                <MenuItem value="Non-Profit">Non-Profit</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
                className="form-input"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.city}
                helperText={errors.city}
                className="form-input"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.zip}
                helperText={errors.zip}
                className="form-input"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.gstNumber}
                helperText={errors.gstNumber}
                className="form-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="PAN"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.panNumber}
                helperText={errors.panNumber}
                className="form-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Drug License 1"
                name="drugLicense1"
                value={formData.drugLicense1}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.drugLicense1}
                helperText={errors.drugLicense1}
                className="form-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Drug License 2"
                name="drugLicense2"
                value={formData.drugLicense2}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.drugLicense2}
                helperText={errors.drugLicense2}
                className="form-input"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                name="representativeFirstName"
                value={formData.representativeFirstName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.representativeFirstName}
                helperText={errors.representativeFirstName}
                className="form-input"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                name="representativeLastName"
                value={formData.representativeLastName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.representativeLastName}
                helperText={errors.representativeLastName}
                className="form-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="representativeEmail"
                type="email"
                value={formData.representativeEmail}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.representativeEmail}
                helperText={errors.representativeEmail}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                name="representativeNumber"
                type="tel"
                value={formData.representativeNumber}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ pattern: "[0-9]*", maxLength: 10 }}
                error={!!errors.representativeNumber}
                helperText={errors.representativeNumber}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Aadhar Number"
                name="representativeAadhar"
                type="tel"
                value={formData.representativeAadhar}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ pattern: "[0-9]*", maxLength: 12 }}
                error={!!errors.representativeAadhar}
                helperText={errors.representativeAadhar}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Website Username"
                name="websiteUsername"
                value={formData.websiteUsername}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.websiteUsername}
                helperText={errors.websiteUsername}
                className="form-input"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Website Username"
                name="confirmWebsiteUsername"
                value={formData.confirmWebsiteUsername}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.websiteUsername}
                helperText={errors.websiteUsername}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Website Password"
                name="websitePassword"
                type="password"
                value={formData.websitePassword}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.websitePassword}
                helperText={errors.websitePassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Website Password"
                name="confirmWebsitePassword"
                type="password"
                value={formData.confirmWebsitePassword}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.websitePassword}
                helperText={errors.websitePassword}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="form-container">
        {/* Futuristic Title */}
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
          Create New Organization
        </Typography>

        {/* Enhanced Stepper */}
        <Box className="stepper-wrapper">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  StepIconComponent={() =>
                    activeStep > index ? (
                      <div className="step-completed">
                        <CheckIcon style={{ color: '#10B981' }} />
                      </div>
                    ) : (
                      <div className={`step-number ${activeStep === index ? 'active' : ''}`}>
                        {index + 1}
                      </div>
                    )
                  }
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Form Content */}
        <Box className="form-content">
          <div className="form-card form-animation">
            {renderStepContent(activeStep)}
            <Box className="button-container" sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} className="back-button">
                  ← Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                className="submit-button"
              >
                {activeStep === steps.length - 1 ? "Submit" : "Continue →"}
              </Button>
            </Box>
          </div>
        </Box>
              <Snackbar
                open={openSnackbar}
                autoHideDuration={5000}
                onClose={() => setOpenSnackbar(false)}
              >
                <Alert severity="info" variant="filled">
                  Saving information... Redirecting in 5 seconds 🚀
                </Alert>
              </Snackbar>
      </div>
    </Layout>
  );
};

export default NeworgForm;
