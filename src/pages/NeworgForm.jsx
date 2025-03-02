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
      const response = await axios.post(
        "https://localhost:8081/api/new-org/submit",
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
      navigate('/companies'); // Navigate to /companies after successful submission
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

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, width: "75%" }}></Box>

        {/* Main Content */}
        <Box sx={{ width: "75%", mb: 4, display: "flex", justifyContent: "center" }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ width: "100%" }}>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  StepIconComponent={() =>
                    activeStep > index ? (
                      <CheckIcon sx={{ color: "green" }} />
                    ) : activeStep === index ? (
                      <Typography sx={{ color: "#2563EB", fontWeight: "bold" }}>
                        {index + 1}
                      </Typography>
                    ) : (
                      <Typography>{index + 1}</Typography>
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
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: "500px",
            display: "flex",
            justifyContent: "center",
            mx: "auto",
          }}
        >
          <Box sx={{ width: "100%" }}>
            {activeStep === 0 && (
              <Box component="form" sx={{ mt: 3 }}>
                <Grid container spacing={2}>
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Constitution"
                      name="constitution"
                      value={formData.constitution}
                      onChange={handleChange}
                      select
                      fullWidth
                      required
                      error={!!errors.constitution}
                      helperText={errors.constitution}
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
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    mt: 3,
                    justifyContent: "flex-end",
                    backgroundColor: "#2563EB",
                  }}
                >
                  Continue →
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box component="form" sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="GST"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errors.gstNumber}
                      helperText={errors.gstNumber}
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
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={handleNext} sx={{ backgroundColor: "#2563EB" }}>
                    Continue →
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box component="form" sx={{ mt: 3 }}>
                <Grid container spacing={2}>
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
                <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="contained" onClick={handleNext} sx={{ backgroundColor: "#2563EB" }}>
                    Continue →
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 3 && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
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
                <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" variant="contained" sx={{ backgroundColor: "#2563EB" }}>
                    Submit
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default NeworgForm;
