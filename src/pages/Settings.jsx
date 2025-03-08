import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { Typography, Paper, Box, Grid, TextField, Button, Switch, FormControlLabel, Divider, Alert, Snackbar } from "@mui/material";
import { PersonOutline, Lock, Security, Notifications, Public } from "@mui/icons-material";
import "../styles/Settings.css";

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Suraksha Pharma",
    adminEmail: "admin@suraksha.com",
    siteDescription: "Administrative portal for Suraksha Pharma"
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    autoLogout: true,
    sessionTimeout: 30
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    orderNotifications: true,
    systemUpdates: true
  });

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

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setSecuritySettings(prev => ({ ...prev, [name]: newValue }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveGeneral = () => {
    // This would normally save to the server
    setSnackbar({
      open: true,
      message: "General settings saved successfully!",
      severity: "success"
    });
  };

  const handleSaveSecurity = () => {
    // This would normally save to the server
    setSnackbar({
      open: true,
      message: "Security settings saved successfully!",
      severity: "success"
    });
  };

  const handleSaveNotifications = () => {
    // This would normally save to the server
    setSnackbar({
      open: true,
      message: "Notification preferences saved successfully!",
      severity: "success"
    });
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

  return (
    <Layout>
      <div className="settings-container">
        <Typography variant="h4" className="settings-title">
          Admin Settings
        </Typography>

        <Box className="settings-grid">
          {/* General Settings */}
          <Paper className="settings-card">
            <Box className="settings-header">
              <Public className="settings-icon" />
              <Typography variant="h6">General Settings</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Name"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  name="adminEmail"
                  value={generalSettings.adminEmail}
                  onChange={handleGeneralChange}
                  variant="outlined"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Description"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className="settings-save-button"
              onClick={handleSaveGeneral}
            >
              Save Changes
            </Button>
          </Paper>

          {/* Security Settings */}
          <Paper className="settings-card">
            <Box className="settings-header">
              <Security className="settings-icon" />
              <Typography variant="h6">Security Settings</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onChange={handleSecurityChange}
                      name="twoFactorAuth"
                      color="primary"
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.autoLogout}
                      onChange={handleSecurityChange}
                      name="autoLogout"
                      color="primary"
                    />
                  }
                  label="Auto Logout on Inactivity"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Session Timeout (minutes)"
                  name="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecurityChange}
                  variant="outlined"
                  disabled={!securitySettings.autoLogout}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className="settings-save-button"
              onClick={handleSaveSecurity}
            >
              Save Security Settings
            </Button>
          </Paper>

          {/* Password Change */}
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

          {/* Notification Settings */}
          <Paper className="settings-card">
            <Box className="settings-header">
              <Notifications className="settings-icon" />
              <Typography variant="h6">Notification Settings</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      name="emailNotifications"
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.browserNotifications}
                      onChange={handleNotificationChange}
                      name="browserNotifications"
                      color="primary"
                    />
                  }
                  label="Browser Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.orderNotifications}
                      onChange={handleNotificationChange}
                      name="orderNotifications"
                      color="primary"
                    />
                  }
                  label="New Order Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onChange={handleNotificationChange}
                      name="systemUpdates"
                      color="primary"
                    />
                  }
                  label="System Updates Notifications"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className="settings-save-button"
              onClick={handleSaveNotifications}
            >
              Save Notification Settings
            </Button>
          </Paper>
        </Box>
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Settings;