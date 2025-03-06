// src/components/Login/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, InputAdornment, Typography, Box, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from '../../context/AuthContext';
import img from "../assets/images/login-img.png";
import "./LoginPage.css";
import { Alert, Snackbar } from "@mui/material";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (!password) {
      setError("Password is required");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        setSnackbarSeverity("success");
        setSnackbarMessage("Login successful!");
        setOpenSnackbar(true);
        
        // Navigate after a short delay based on user type
        setTimeout(() => {
          if (result.userType === "ORGANIZATION") {
            navigate("/org/dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box className="login-container">
      <Box className="login-image-container">
        <img src={img} alt="Security Illustration" className="login-image" />
      </Box>

      <Box className="login-form-container">
        <Typography variant="subtitle1" className="login-welcome-text">
          Welcome to Suraksha Pharma! 👋
        </Typography>
        <Typography variant="h5" className="login-title">
          Login to your account
        </Typography>
        <Typography variant="body2" className="login-subtitle">
          Admin and Organization users can log in here
        </Typography>

        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Please enter your username"
            disabled={loading}
            error={!!error && !username}
            helperText={!username && error ? "Username is required" : ""}
            InputProps={{
              autoComplete: "username"
            }}
          />

          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={loading}
            error={!!error && !password}
            helperText={!password && error ? "Password is required" : ""}
            InputProps={{
              autoComplete: "current-password",
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && username && password && (
            <Typography className="login-error-text">
              {error}
            </Typography>
          )}

          <Button 
            type="submit" 
            variant="contained" 
            className="login-button"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>

        <Button 
          onClick={() => navigate("/forgot-password")} 
          className="forgot-password-button"
          disabled={loading}
        >
          Forgot Password?
        </Button>
      </Box>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;