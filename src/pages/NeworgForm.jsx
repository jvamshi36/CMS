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
import CheckIcon from "@mui/icons-material/Check";
import Layout from "../components/Layout/Layout";



const steps = ["Organization Details", "Organization Credentials", "Organization Representative", "Website Credentials"];

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
    drugLicense1:"",
    drugLicense2: "",
    representativeFirstName: "",
    representativeLastName: "",
    representativeEmail: "",
    representativeAadhar:"",
    representativeNumber:"",
    websiteUsername: "",
    confirmWebsiteUsername: "",
    websitePassword: "",
    confirmWebsitePassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleNext = () => {
    let newErrors = {};
    if (activeStep === 3) {
      if (formData.websiteUsername !== formData.confirmWebsiteUsername) {
        newErrors.websiteUsername = "Usernames do not match";
      }
      if (formData.websitePassword !== formData.confirmWebsitePassword) {
        newErrors.websitePassword = "Passwords do not match";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };


  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Layout>
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center",p: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, width: "75%" }}>
      </Box>

      {/* Main Content */}
      <Box sx={{ width:"75%", mb: 4, display: "flex", justifyContent: "center"  }}>
          <Stepper activeStep={activeStep}  alternativeLabel sx={{ width: "100%" }}>
          {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel StepIconComponent={() =>
                  activeStep > index ? <CheckIcon sx={{ color: "green" }} /> :
                  activeStep === index ? <Typography sx={{ color: "#2563EB", fontWeight: "bold" }}>{index + 1}</Typography> :
                  <Typography>{index + 1}</Typography>
                }>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Form Content */}
        <Box sx={{ flexGrow: 1, maxWidth: "500px", display: "flex", justifyContent: "center", mx: "auto" }}>
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
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  mt: 3,
                  justifyContent: "flex-end", 
                  backgroundColor:"#2563EB"
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
                    name="GSTNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="PAN"
                    name="PANNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Drug License 1"
                    name="DrugLicense1"
                    value={formData.drugLicense1}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Drug License 2"
                    name="DrugLicense2"
                    value={formData.drugLicense2}
                    onChange={handleChange}
                    fullWidth
                    required
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
                    inputProps = {{pattern: "[0-9]*", maxLength : 10}}
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
                    inputProps = {{pattern: "[0-9]*", maxLength : 12}}
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
              <Box component="form" sx={{ mt: 3}}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Website Username"
                    name="websiteUsername"
                    type="email"
                    value={formData.websiteUsername}
                    onChange={handleChange}
                    fullWidth
                    required
                    error = {!!errors.websiteUsername}
                    helperText = {errors.websiteUsername}
                  />
                </Grid>
                 <Grid item xs={12}>
                  <TextField
                    label="Confirm Website Username"
                    name="confirmwebsiteUsername"
                    type="email"
                    value={formData.confirmWebsiteUsername}
                    onChange={handleChange}
                    fullWidth
                    required
                    error = {!!errors.websiteUsername}
                    helperText = {errors.websiteUsername}
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
                    error = {!!errors.websitePassword}
                    helperText = {errors.websitePassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm Website Password"
                    name="confirmwebsitePassword"
                    type="password"
                    value={formData.confirmtwebsitePassword}
                    onChange={handleChange}
                    fullWidth
                    required
                    error = {!!errors.websitePassword}
                    helperText = {errors.websitePassword}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                {/* Add final submission logic here */}
                <Button variant="contained" sx={{ backgroundColor: "#2563EB" }}>
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
