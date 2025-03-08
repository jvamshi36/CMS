import React, { useState, useEffect } from "react";
import OrgLayout from "../components/Layout/OrgLayout";
import { Typography, Paper, Box, Grid, TextField, Button, Switch, FormControlLabel, Divider, Alert, Snackbar, CircularProgress } from "@mui/material";
import { Lock, Notifications, AccountCircle } from "@mui/icons-material";
import apiService from "../utils/api";
import "../styles/Settings.css";

const OrgSettings = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    contactEmail: "",
    contactPhone: "",
    alternatePhone: "",
    contactPreference: "email"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderStatusUpdates: true,
    marketingEmails: false
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

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // In a real app, you'd fetch these from the server
        // const response = await apiService.get('/api/org/settings');
        // For now, we're just simulating a delay
        setTimeout(() => {
          setProfileData({
            contactEmail: "representative@example.com",
            contactPhone: "9876543210",
            alternatePhone: "",
            contactPreference: "email"
          });

          setNotificationSettings({
            emailNotifications: true,
            smsNotifications: false,
            orderStatusUpdates: true,
            marketingEmails: false
          });

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSnackbar({
          open: true,
          message: "Failed to load settings. Please try again.",
          severity: "error"
        });
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // In a real app, you'd save to the server
      // await apiService.put('/api/org/settings/profile', profileData);

      setSnackbar({
        open: true,
        message: "Profile settings saved successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to save profile settings. Please try again.",
        severity: "error"
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // In a real app, you'd save to the server
      // await apiService.put('/api/org/settings/notifications', notificationSettings);

      setSnackbar({
        open: true,
        message: "Notification preferences saved successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error saving notifications:", error);
      setSnackbar({
        open: true,
        message: "Failed to save notification settings. Please try again.",
        severity: "error"
      });
    }
  };

  const handleChangePassword = async () => {
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

    try {
      // In a real app, you'd save to the server
      // await apiService.put('/api/org/settings/password', passwordData);

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
    } catch (error) {
      console.error("Error changing password:", error);
      setSnackbar({
        open: true,
        message: "Failed to change password. Please try again.",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <OrgLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <div className="settings-container">
        <Typography variant="h4" className="settings-title">
          Organization Settings
        </Typography>

        <Box className="settings-grid">
          {/* Contact Settings */}
          <Paper className="settings-card">
            <Box className="settings-header">
              <AccountCircle className="settings-icon" />
              <Typography variant="h6">Contact Settings</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  value={profileData.contactEmail}
                  onChange={handleProfileChange}
                  variant="outlined"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="contactPhone"
                  value={profileData.contactPhone}
                  onChange={handleProfileChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alternate Phone (Optional)"
                  name="alternatePhone"
                  value={profileData.alternatePhone}
                  onChange={handleProfileChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileData.contactPreference === "email"}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        contactPreference: e.target.checked ? "email" : "phone"
                      })}
                      color="primary"
                    />
                  }
                  label={`Preferred Contact Method: ${profileData.contactPreference === "email" ? "Email" : "Phone"}`}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              className="settings-save-button"
              onClick={handleSaveProfile}
            >
              Save Contact Settings
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
            >
              Change Password
            </Button>
          </Paper>

          {/* Notification Settings */}
          <Paper className="settings-card">
            <Box className="settings-header">
              <Notifications className="settings-icon" />
              <Typography variant="h6">Notification Preferences</Typography>
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
                      checked={notificationSettings.smsNotifications}
                      onChange={handleNotificationChange}
                      name="smsNotifications"
                      color="primary"
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.orderStatusUpdates}
                      onChange={handleNotificationChange}
                      name="orderStatusUpdates"
                      color="primary"
                    />
                  }
                  label="Order Status Updates"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onChange={handleNotificationChange}
                      name="marketingEmails"
                      color="primary"
                    />
                  }
                  label="Promotional Emails"
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
    </OrgLayout>
  );
};

export default OrgSettings;