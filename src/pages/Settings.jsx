import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import {
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from "@mui/material";
import {
  Lock,
  CloudDownload
} from "@mui/icons-material";
import "../styles/Settings.css";
import ExportCenter from "../components/ExportCenter/ExportCenter";


// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords do not match!",
        severity: "error"
      });
      return;
    }

    if (!passwordData.currentPassword) {
      setSnackbar({
        open: true,
        message: "Current password is required!",
        severity: "error"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: "New password must be at least 8 characters!",
        severity: "error"
      });
      return;
    }

    // This would normally save to the server
    setSnackbar({
      open: true,
      message: "Password changed successfully!",
      severity: "success"
    });

    // Reset password fields
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if there's a tab parameter in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'export') {
      setActiveTab(1); // Set to the export tab index
    }
  }, []);

  return (
    <Layout>
      <div className="settings-container">
        <Typography variant="h4" className="settings-title">
          Settings
        </Typography>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab icon={<Lock />} label="Password" iconPosition="start" />
            <Tab icon={<CloudDownload />} label="Export Data" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Password Change Tab */}
        <TabPanel value={activeTab} index={0}>
          <Paper className="settings-card">
            <Box className="settings-header">
              <Lock className="settings-icon" />
              <Typography variant="h6">Change Password</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className="settings-save-button"
              onClick={handleChangePassword}
              color="primary"
            >
              Change Password
            </Button>
          </Paper>
        </TabPanel>

        {/* Export Center Tab */}
        <TabPanel value={activeTab} index={1}>
          <ExportCenter />
        </TabPanel>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Layout>
  );
};

export default Settings;