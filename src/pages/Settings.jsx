import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import {
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  FormGroup,
  FormHelperText
} from "@mui/material";
import {
  PersonOutline,
  Lock,
  Security,
  Notifications,
  Public,
  Palette,
  Dashboard,
  DashboardCustomize
} from "@mui/icons-material";
import "../styles/Settings.css";

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
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

  const [themeSettings, setThemeSettings] = useState({
    theme: 'light',
    primaryColor: '#2563EB',
    fontSize: 'medium',
    animations: true
  });

  const [dashboardSettings, setDashboardSettings] = useState({
    showRecentOrders: true,
    showSalesChart: true,
    showStatistics: true,
    defaultView: 'orders',
    refreshRate: 5,
    visibleWidgets: ['recentOrders', 'salesChart', 'statistics', 'notifications']
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const handleThemeChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setThemeSettings(prev => ({ ...prev, [name]: newValue }));

    // Apply theme changes in real-time
    if (name === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
  };

  const handleDashboardChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setDashboardSettings(prev => ({ ...prev, [name]: newValue }));
  };

  const handleDashboardWidgetsChange = (event) => {
    const { value } = event.target;
    setDashboardSettings(prev => ({
      ...prev,
      visibleWidgets: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveGeneral = () => {
    setSnackbar({
      open: true,
      message: "General settings saved successfully!",
      severity: "success"
    });
  };

  const handleSaveSecurity = () => {
    setSnackbar({
      open: true,
      message: "Security settings saved successfully!",
      severity: "success"
    });
  };

  const handleSaveNotifications = () => {
    setSnackbar({
      open: true,
      message: "Notification preferences saved successfully!",
      severity: "success"
    });
  };

  const handleSaveTheme = () => {
    // Apply theme settings
    document.documentElement.setAttribute('data-theme', themeSettings.theme);
    // Save to localStorage for persistence
    localStorage.setItem('theme-settings', JSON.stringify(themeSettings));

    setSnackbar({
      open: true,
      message: "Theme settings saved successfully!",
      severity: "success"
    });
  };

  const handleSaveDashboard = () => {
    // Save dashboard settings to local storage
    localStorage.setItem('dashboard-settings', JSON.stringify(dashboardSettings));

    setSnackbar({
      open: true,
      message: "Dashboard preferences saved successfully!",
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

// Load saved settings on component mount (continued)
useEffect(() => {
  // Load theme settings from localStorage
  const savedTheme = localStorage.getItem('theme-settings');
  if (savedTheme) {
    const parsedTheme = JSON.parse(savedTheme);
    setThemeSettings(parsedTheme);
    document.documentElement.setAttribute('data-theme', parsedTheme.theme);
  }

  // Load dashboard settings from localStorage
  const savedDashboard = localStorage.getItem('dashboard-settings');
  if (savedDashboard) {
    const parsedDashboard = JSON.parse(savedDashboard);
    setDashboardSettings(parsedDashboard);
  }
}, []);

return (
  <Layout>
    <div className="settings-container">
      <Typography variant="h4" className="settings-title">
        Admin Settings
      </Typography>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
        >
          <Tab icon={<Public />} label="General" iconPosition="start" />
          <Tab icon={<Security />} label="Security" iconPosition="start" />
          <Tab icon={<Lock />} label="Password" iconPosition="start" />
          <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
          <Tab icon={<Palette />} label="Theme" iconPosition="start" />
          <Tab icon={<DashboardCustomize />} label="Dashboard" iconPosition="start" />
        </Tabs>
      </Box>

      {/* General Settings Tab */}
      <TabPanel value={activeTab} index={0}>
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
      </TabPanel>

      {/* Security Settings Tab */}
      <TabPanel value={activeTab} index={1}>
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
      </TabPanel>

      {/* Password Change Tab */}
      <TabPanel value={activeTab} index={2}>
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

      {/* Notification Settings Tab */}
      <TabPanel value={activeTab} index={3}>
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
      </TabPanel>

      {/* Theme Settings Tab */}
      <TabPanel value={activeTab} index={4}>
        <Paper className="settings-card">
          <Box className="settings-header">
            <Palette className="settings-icon" />
            <Typography variant="h6">Theme Preferences</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={themeSettings.theme}
                  onChange={handleThemeChange}
                  name="theme"
                  label="Theme Mode"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Primary Color</InputLabel>
                <Select
                  value={themeSettings.primaryColor}
                  onChange={handleThemeChange}
                  name="primaryColor"
                  label="Primary Color"
                >
                  <MenuItem value="#2563EB">Blue</MenuItem>
                  <MenuItem value="#10B981">Green</MenuItem>
                  <MenuItem value="#F59E0B">Orange</MenuItem>
                  <MenuItem value="#EF4444">Red</MenuItem>
                  <MenuItem value="#8B5CF6">Purple</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={themeSettings.fontSize}
                  onChange={handleThemeChange}
                  name="fontSize"
                  label="Font Size"
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeSettings.animations}
                    onChange={handleThemeChange}
                    name="animations"
                    color="primary"
                  />
                }
                label="Enable UI Animations"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, p: 2, bgcolor: themeSettings.theme === 'dark' ? '#333' : '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Theme Preview</Typography>
            <Box
              sx={{
                width: '100%',
                height: 100,
                bgcolor: themeSettings.primaryColor,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#fff',
                  fontSize: themeSettings.fontSize === 'small' ? '0.9rem' :
                           themeSettings.fontSize === 'medium' ? '1.1rem' : '1.3rem'
                }}
              >
                Preview Text
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            className="settings-save-button"
            onClick={handleSaveTheme}
            sx={{ mt: 3 }}
          >
            Apply Theme Settings
          </Button>
        </Paper>
      </TabPanel>

      {/* Dashboard Settings Tab */}
      <TabPanel value={activeTab} index={5}>
        <Paper className="settings-card">
          <Box className="settings-header">
            <DashboardCustomize className="settings-icon" />
            <Typography variant="h6">Dashboard Customization</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default Dashboard View</InputLabel>
                <Select
                  value={dashboardSettings.defaultView}
                  onChange={handleDashboardChange}
                  name="defaultView"
                  label="Default Dashboard View"
                >
                  <MenuItem value="orders">Orders</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                  <MenuItem value="companies">Companies</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Auto-refresh Rate (minutes)"
                name="refreshRate"
                type="number"
                value={dashboardSettings.refreshRate}
                onChange={handleDashboardChange}
                variant="outlined"
                inputProps={{ min: 0, max: 60 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Visible Widgets</InputLabel>
                <Select
                  multiple
                  value={dashboardSettings.visibleWidgets}
                  onChange={handleDashboardWidgetsChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  <MenuItem value="recentOrders">
                    <Checkbox checked={dashboardSettings.visibleWidgets.indexOf('recentOrders') > -1} />
                    <ListItemText primary="Recent Orders" />
                  </MenuItem>
                  <MenuItem value="salesChart">
                    <Checkbox checked={dashboardSettings.visibleWidgets.indexOf('salesChart') > -1} />
                    <ListItemText primary="Sales Chart" />
                  </MenuItem>
                  <MenuItem value="statistics">
                    <Checkbox checked={dashboardSettings.visibleWidgets.indexOf('statistics') > -1} />
                    <ListItemText primary="Statistics" />
                  </MenuItem>
                  <MenuItem value="notifications">
                    <Checkbox checked={dashboardSettings.visibleWidgets.indexOf('notifications') > -1} />
                    <ListItemText primary="Notifications" />
                  </MenuItem>
                  <MenuItem value="calendar">
                    <Checkbox checked={dashboardSettings.visibleWidgets.indexOf('calendar') > -1} />
                    <ListItemText primary="Calendar" />
                  </MenuItem>
                </Select>
                <FormHelperText>Select widgets to display on your dashboard</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dashboardSettings.showRecentOrders}
                      onChange={handleDashboardChange}
                      name="showRecentOrders"
                      color="primary"
                    />
                  }
                  label="Show Recent Orders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dashboardSettings.showSalesChart}
                      onChange={handleDashboardChange}
                      name="showSalesChart"
                      color="primary"
                    />
                  }
                  label="Show Sales Chart"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dashboardSettings.showStatistics}
                      onChange={handleDashboardChange}
                      name="showStatistics"
                      color="primary"
                    />
                  }
                  label="Show Statistics"
                />
              </FormGroup>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            className="settings-save-button"
            onClick={handleSaveDashboard}
          >
            Save Dashboard Settings
          </Button>
        </Paper>
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