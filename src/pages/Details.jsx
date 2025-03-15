// src/pages/Details.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import "../styles/Details.css";
import Layout from "../components/Layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OrgDetails = () => {
  const [organizationData, setOrganizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { companyId } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await api.get(`/api/new-org/${companyId}`);
        setOrganizationData(response.data);
        setEditFormData(response.data); // Initialize edit form with current data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching organization data:", err);
        setError("Failed to load organization data. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [companyId, api]);

  const getOrganizationDetails = () => {
    if (!organizationData) return {};

    return {
      "Organization Name": organizationData.organizationName,
      "Constitution": organizationData.constitution,
      "Address": organizationData.addressLine1,
      "City": organizationData.city,
      "Zip": organizationData.zip,
      "GST No.": organizationData.gstNumber || "Not provided",
      "PAN No.": organizationData.panNumber || "Not provided",
      "Drug License No. 1": organizationData.drugLicense1 || "Not provided",
      "Drug License No. 2": organizationData.drugLicense2 || "Not provided",
      "Status": organizationData.status || "Processing",
    };
  };

  const getRepresentativeDetails = () => {
    if (!organizationData) return {};

    return {
      "Representative FirstName": organizationData.representativeFirstName,
      "Representative LastName": organizationData.representativeLastName,
      "Representative Email": organizationData.representativeEmail,
      "Representative Number": organizationData.representativeNumber,
      "Representative Aadhar": organizationData.representativeAadhar,
      "Web Username": organizationData.websiteUsername,
      "Web Password": "********", // For security, don't display actual password
    };
  };

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
    setEditFormData(organizationData); // Reset form data
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
      if (organizationData[key] !== editFormData[key]) {
        return true;
      }
    }
    return false;
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      // Make API call to update the organization
      await api.put(`/api/new-org/${companyId}`, editFormData);

      // Update the local state with the edited data
      setOrganizationData(editFormData);
      setIsEditing(false);

      // Show success message
      setSnackbar({
        open: true,
        message: "Organization details updated successfully!",
        severity: "success"
      });
    } catch (err) {
      console.error("Error updating organization data:", err);
      setSnackbar({
        open: true,
        message: "Failed to update organization details. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !organizationData) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography color="error">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box className="details-container">
        {/* Organization Details Container */}
        <Typography variant="h5" className="section-title">
            Organization Details
        </Typography>
        <Box sx={{ my: 2 }}/>

        {isEditing ? (
          // Edit Form for Organization Details
          <Box className="details-card">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  name="organizationName"
                  value={editFormData.organizationName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Constitution"
                  name="constitution"
                  value={editFormData.constitution || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                >
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Public">Public</MenuItem>
                  <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="addressLine1"
                  value={editFormData.addressLine1 || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={editFormData.city || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip"
                  name="zip"
                  value={editFormData.zip || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  name="gstNumber"
                  value={editFormData.gstNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  name="panNumber"
                  value={editFormData.panNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Drug License No. 1"
                  name="drugLicense1"
                  value={editFormData.drugLicense1 || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Drug License No. 2"
                  name="drugLicense2"
                  value={editFormData.drugLicense2 || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
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
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Display Organization Details
          <Box className="details-card">
            <Grid container spacing={2}>
              {Object.entries(getOrganizationDetails()).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Typography variant="body1" className="detail-value">
                    {key}: <span>{value}</span>
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Representative Details Container */}
        <Typography variant="h5" className="section-title">
            Representative Details
        </Typography>
        <Box sx={{ my: 2 }}/>

        {isEditing ? (
          // Edit Form for Representative Details
          <Box className="details-card">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="representativeFirstName"
                  value={editFormData.representativeFirstName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="representativeLastName"
                  value={editFormData.representativeLastName || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="representativeEmail"
                  value={editFormData.representativeEmail || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="representativeNumber"
                  value={editFormData.representativeNumber || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  name="representativeAadhar"
                  value={editFormData.representativeAadhar || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Web Username"
                  name="websiteUsername"
                  value={editFormData.websiteUsername || ""}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Display Representative Details
          <Box className="details-card">
            <Grid container spacing={2}>
              {Object.entries(getRepresentativeDetails()).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Typography variant="body1" className="detail-value">
                    {key}: <span>{value}</span>
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Action Buttons */}
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditClick}
              startIcon={<Edit />}
              className="edit-button"
            >
              Edit Details
            </Button>
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

export default OrgDetails;