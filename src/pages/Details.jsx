// src/pages/Details.jsx - Cleaned version
import { Box, Typography, CircularProgress, Grid, Button, TextField, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Autocomplete, Chip, Divider } from "@mui/material";
import { Edit, Save, Cancel, Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material";
import "../styles/Details.css";
import Layout from "../components/Layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../utils/api";
import React, { useState, useEffect } from "react";

const OrgDetails = () => {
  const [organizationData, setOrganizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // State for products management
  const [activeTab, setActiveTab] = useState(0);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAllProducts, setFilteredAllProducts] = useState([]);

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
        setError("Failed to load organization data. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [companyId, api]);

  // Fetch organization's available products
  useEffect(() => {
    const fetchAvailableProducts = async () => {
      if (!companyId) return;

      setLoadingProducts(true);
      try {
        const response = await apiService.get(`/api/organization/${companyId}/products`);
        setAvailableProducts(Array.isArray(response) ? response : []);
      } catch (err) {
        // Handle API error - set empty array
        setAvailableProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (activeTab === 1) {
      fetchAvailableProducts();
    }
  }, [companyId, activeTab]);

  // Fetch all products (for admin to choose from)
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (!companyId || activeTab !== 1) return;

      try {
        const response = await apiService.get(`/api/admin/products`);
        setAllProducts(Array.isArray(response) ? response : []);
      } catch (err) {
        // Handle API error - set empty array
        setAllProducts([]);
      }
    };

    if (activeTab === 1) {
      fetchAllProducts();
    }
  }, [companyId, activeTab]);

  // Filter products based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAllProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAllProducts(filtered);
  }, [searchTerm, allProducts]);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenProductDialog = () => {
    setProductDialogOpen(true);
    setSearchTerm("");
    setFilteredAllProducts(allProducts);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleAddProductToOrg = async () => {
    if (!selectedProduct) return;

    try {
      await apiService.post(`/api/organization/${companyId}/products`, {
        productId: selectedProduct.id
      });

      // Add the product to the available products list
      setAvailableProducts(prev => [...prev, selectedProduct]);

      setSnackbar({
        open: true,
        message: `${selectedProduct.name} added to organization successfully!`,
        severity: "success"
      });

      setProductDialogOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to add product. Please try again.",
        severity: "error"
      });
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await apiService.delete(`/api/organization/${companyId}/products/${productId}`);

      // Remove the product from the available products list
      setAvailableProducts(prev => prev.filter(p => p.id !== productId));

      setSnackbar({
        open: true,
        message: "Product removed from organization successfully!",
        severity: "success"
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to remove product. Please try again.",
        severity: "error"
      });
    }
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

    // Field-specific validation
    let fieldError = null;

    // Validate specific fields as the user types
    if (name === "representativeNumber") {
      // Phone number validation - must be exactly 10 digits
      if (value && !/^\d*$/.test(value)) {
        fieldError = "Phone number must contain only digits";
      } else if (value && value.length !== 10) {
        fieldError = "Phone number must be exactly 10 digits";
      }
    } else if (name === "representativeAadhar") {
      // Aadhar validation - must be exactly 12 digits
      if (value && !/^\d*$/.test(value)) {
        fieldError = "Aadhar number must contain only digits";
      } else if (value && value.length !== 12) {
        fieldError = "Aadhar number must be exactly 12 digits";
      }
    } else if (name === "representativeEmail") {
      // Email validation
      if (value && !/\S+@\S+\.\S+/.test(value)) {
        fieldError = "Please enter a valid email address";
      }
    }

    // Update form data
    setEditFormData(prev => ({ ...prev, [name]: value }));

    // Show validation error if present
    if (fieldError) {
      setSnackbar({
        open: true,
        message: fieldError,
        severity: "warning"
      });
    }
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
    // Validate the form data before submitting
    const validationErrors = validateFormData(editFormData);
    if (Object.keys(validationErrors).length > 0) {
      // Display the first validation error in a snackbar
      const firstError = Object.values(validationErrors)[0];
      setSnackbar({
        open: true,
        message: firstError,
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);

      // Make API call to update the organization
      const response = await apiService.put(`/api/new-org/${companyId}`, editFormData);

      // Update the local state with the edited data
      setOrganizationData(response);
      setIsEditing(false);

      // Show success message
      setSnackbar({
        open: true,
        message: "Organization details updated successfully!",
        severity: "success"
      });
    } catch (err) {
      // Check for validation errors in the response
      if (err.response && err.response.status === 400 && err.response.data) {
        // Display the first validation error from the server
        const errorMessage = typeof err.response.data === 'object' ?
          Object.values(err.response.data)[0] :
          "Please check your form data and try again.";

        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error"
        });
      } else {
        setSnackbar({
          open: true,
          message: err.message || "Failed to update organization details. Please try again.",
          severity: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to validate form data before submission
  const validateFormData = (formData) => {
    const errors = {};

    // Validate organization name
    if (!formData.organizationName || formData.organizationName.trim() === '') {
      errors.organizationName = "Organization name is required";
    }

    // Validate constitution
    if (!formData.constitution || formData.constitution.trim() === '') {
      errors.constitution = "Constitution is required";
    }

    // Validate address
    if (!formData.addressLine1 || formData.addressLine1.trim() === '') {
      errors.addressLine1 = "Address is required";
    }

    // Validate city
    if (!formData.city || formData.city.trim() === '') {
      errors.city = "City is required";
    }

    // Validate zip
    if (!formData.zip || formData.zip.trim() === '') {
      errors.zip = "Zip code is required";
    }

    // Validate representative first name
    if (!formData.representativeFirstName || formData.representativeFirstName.trim() === '') {
      errors.representativeFirstName = "Representative first name is required";
    }

    // Validate representative last name
    if (!formData.representativeLastName || formData.representativeLastName.trim() === '') {
      errors.representativeLastName = "Representative last name is required";
    }

    // Validate representative email
    if (!formData.representativeEmail || formData.representativeEmail.trim() === '') {
      errors.representativeEmail = "Representative email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.representativeEmail)) {
      errors.representativeEmail = "Please enter a valid email address";
    }

    // Validate representative phone number
    if (!formData.representativeNumber || formData.representativeNumber.trim() === '') {
      errors.representativeNumber = "Representative phone number is required";
    } else if (!/^\d{10}$/.test(formData.representativeNumber)) {
      errors.representativeNumber = "Phone number must be exactly 10 digits";
    }

    // Validate representative Aadhar
    if (!formData.representativeAadhar || formData.representativeAadhar.trim() === '') {
      errors.representativeAadhar = "Representative Aadhar is required";
    } else if (!/^\d{12}$/.test(formData.representativeAadhar)) {
      errors.representativeAadhar = "Aadhar number must be exactly 12 digits";
    }

    return errors;
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
        {/* Tabs for Organization Details and Products */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="organization tabs" variant="fullWidth">
            <Tab label="Organization Details" />
            <Tab label="Available Products" />
          </Tabs>
        </Box>

        {/* Organization Details Tab */}
        {activeTab === 0 && (
          <>
            <Typography variant="h5" className="section-title">Organization Details</Typography>
            <Box sx={{ my: 2 }}/>

            {isEditing ? (
              // Edit Form for Organization Details
              <Box className="details-card">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Organization Name" name="organizationName" value={editFormData.organizationName || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Constitution" name="constitution" value={editFormData.constitution || ""} onChange={handleChange} variant="outlined" margin="normal">
                      <MenuItem value="Private">Private</MenuItem>
                      <MenuItem value="Public">Public</MenuItem>
                      <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Address" name="addressLine1" value={editFormData.addressLine1 || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="City" name="city" value={editFormData.city || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Zip" name="zip" value={editFormData.zip || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="GST Number" name="gstNumber" value={editFormData.gstNumber || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="PAN Number" name="panNumber" value={editFormData.panNumber || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Drug License No. 1" name="drugLicense1" value={editFormData.drugLicense1 || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Drug License No. 2" name="drugLicense2" value={editFormData.drugLicense2 || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Status" name="status" value={editFormData.status || "Processing"} onChange={handleChange} variant="outlined" margin="normal">
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
            <Typography variant="h5" className="section-title">Representative Details</Typography>
            <Box sx={{ my: 2 }}/>

            {isEditing ? (
              // Edit Form for Representative Details
              <Box className="details-card">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name" name="representativeFirstName" value={editFormData.representativeFirstName || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name" name="representativeLastName" value={editFormData.representativeLastName || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" name="representativeEmail" value={editFormData.representativeEmail || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Contact Number" name="representativeNumber" value={editFormData.representativeNumber || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Aadhar Number" name="representativeAadhar" value={editFormData.representativeAadhar || ""} onChange={handleChange} variant="outlined" margin="normal" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Web Username" name="websiteUsername" value={editFormData.websiteUsername || ""} onChange={handleChange} variant="outlined" margin="normal" />
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
                  <Button variant="outlined" color="secondary" onClick={handleCancelEdit} className= "cancel-button" startIcon={<Cancel />}>Cancel</Button>
                  <Button variant="contained" color="primary" onClick={handleSaveClick} startIcon={<Save />} className= "save-button" disabled={loading || !hasChanges()}>
                    {loading ? <CircularProgress size={24} /> : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={handleEditClick} startIcon={<Edit />} className="edit-button">Edit Details</Button>
              )}
            </Box>
          </>
        )}

        {/* Available Products Tab */}
        {activeTab === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" className="section-title">Available Products</Typography>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenProductDialog} className="add-product-button">Add Product</Button>
            </Box>
            <Paper className="details-card">
              {loadingProducts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : availableProducts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">No products available for this organization.</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={handleOpenProductDialog}>Add First Product</Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Unit Types</TableCell>
                        <TableCell>Batch Sizes</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.id}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>
                            {product.unitTypes?.map(unit => (
                              <Chip key={unit} label={unit} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                          </TableCell>
                          <TableCell>
                            {product.availableBatches?.map(batch => (
                              <Chip key={batch} label={batch} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                          </TableCell>
                          <TableCell>
                            <IconButton color="error" size="small" onClick={() => handleRemoveProduct(product.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}

        {/* Add Product Dialog */}
        <Dialog open={productDialogOpen} onClose={handleCloseProductDialog} maxWidth="md" fullWidth>
          <DialogTitle>Add Product to Organization</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <TextField fullWidth label="Search Products" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} /> }} margin="normal" />
            </Box>

            <Divider sx={{ my: 2 }} />

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Unit Types</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAllProducts.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;
                    const isAlreadyAdded = availableProducts.some(p => p.id === product.id);

                    return (
                      <TableRow key={product.id} hover selected={isSelected} onClick={() => !isAlreadyAdded && handleSelectProduct(product)}
                        sx={{ cursor: isAlreadyAdded ? 'default' : 'pointer', opacity: isAlreadyAdded ? 0.5 : 1 }}>
                        <TableCell padding="checkbox">
                          <input type="radio" checked={isSelected} disabled={isAlreadyAdded} onChange={() => !isAlreadyAdded && handleSelectProduct(product)} />
                        </TableCell>
                        <TableCell>
                          {product.name}
                          {isAlreadyAdded && <Chip label="Already Added" size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />}
                        </TableCell>
                        <TableCell>{product.type}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          {product.unitTypes?.map(unit => (
                            <Chip key={unit} label={unit} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredAllProducts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary">No products match your search criteria.</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProductDialog}>Cancel</Button>
            <Button onClick={handleAddProductToOrg} variant="contained" color="primary" disabled={!selectedProduct}>Add Selected Product</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Discard Changes?</DialogTitle>
          <DialogContent>
            <Typography>You have unsaved changes. Are you sure you want to discard them?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">Cancel</Button>
            <Button onClick={handleConfirmCancel} color="error">Discard Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default OrgDetails;