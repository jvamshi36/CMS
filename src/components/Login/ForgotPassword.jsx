import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, CircularProgress, Alert, Snackbar } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import img from "../assets/images/login-img.png";
import apiService from "../../utils/api";
import "../Login/LoginPage.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      // This would be implemented on the backend
      await apiService.post("/api/auth/forgot-password", { email });
      
      setSuccess(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Password reset instructions sent to your email!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setError(error.message || "Failed to send reset instructions. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to send reset instructions");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box className="login-container">
      <Box className="login-image-container">
        <img src={img} alt="Security Illustration" className="login-image" />
      </Box>

      <Box className="login-form-container">
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate("/login")}
          sx={{ alignSelf: 'flex-start', mb: 2 }}
        >
          Back to Login
        </Button>
        
        <Typography variant="h5" className="login-title">
          Reset Your Password
        </Typography>

        {success ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            px: 2,
            backgroundColor: 'rgba(220, 252, 231, 0.5)',
            borderRadius: 2,
            maxWidth: 400
          }}>
            <Typography variant="h6" sx={{ color: '#16a34a', mb: 2 }}>
              Check Your Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We've sent password reset instructions to {email}. Please check your inbox.
            </Typography>
            <Button 
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: '#2563EB',
                '&:hover': {
                  backgroundColor: '#1d4ed8'
                }
              }}
            >
              Return to Login
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={loading}
              error={!!error}
              helperText={error}
              InputProps={{
                autoComplete: "email"
              }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              className="login-button"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Instructions"}
            </Button>
          </form>
        )}
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

export default ForgotPassword;