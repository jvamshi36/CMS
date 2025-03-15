import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { TextField, Button, Typography, Box, CircularProgress, Alert, Snackbar } from "@mui/material";
import { ArrowBack, Lock, CheckCircle } from "@mui/icons-material";
import img from "../assets/images/login-img.png";
import apiService from "../../utils/api";
import "../Login/LoginPage.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();

  // Extract token from URL if not passed as a param
  const urlToken = token || new URLSearchParams(location.search).get('token');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!urlToken) {
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        const response = await apiService.post("/api/auth/validate-reset-token", { token: urlToken });
        if (response && response.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Invalid or expired reset token:", error);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [urlToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!password) {
      setError("Password is required");
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await apiService.post("/api/auth/reset-password", {
        token: urlToken,
        newPassword: password
      });

      setSuccess(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Password has been successfully reset!");
      setOpenSnackbar(true);

      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Password reset successful. You can now log in with your new password.",
            status: "success"
          }
        });
      }, 3000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password. The token may be invalid or expired.");
      setSnackbarSeverity("error");
      setSnackbarMessage(error.message || "Failed to reset password. Please request a new reset link.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const renderContent = () => {
    if (validating) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Validating your reset link...</Typography>
        </Box>
      );
    }

    if (!tokenValid) {
      return (
        <Box sx={{
          textAlign: 'center',
          py: 4,
          px: 2,
          backgroundColor: 'rgba(254, 226, 226, 0.5)',
          borderRadius: 2,
          maxWidth: 400
        }}>
          <Typography variant="h6" sx={{ color: '#dc2626', mb: 2 }}>
            Invalid or Expired Link
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This password reset link is invalid or has expired. Please request a new password reset link.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/forgot-password")}
            sx={{
              backgroundColor: '#2563EB',
              '&:hover': {
                backgroundColor: '#1d4ed8'
              }
            }}
          >
            Request New Link
          </Button>
        </Box>
      );
    }

    if (success) {
      return (
        <Box sx={{
          textAlign: 'center',
          py: 4,
          px: 2,
          backgroundColor: 'rgba(220, 252, 231, 0.5)',
          borderRadius: 2,
          maxWidth: 400
        }}>
          <CheckCircle sx={{ color: '#16a34a', fontSize: 48, mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#16a34a', mb: 2 }}>
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your password has been successfully reset. You can now log in with your new password.
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
            Go to Login
          </Button>
        </Box>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="login-form">
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Enter your new password below.
        </Typography>

        <TextField
          fullWidth
          label="New Password"
          variant="outlined"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          disabled={loading}
          error={!!error && !password}
          helperText={!password && error ? "Password is required" : ""}
          InputProps={{
            autoComplete: "new-password"
          }}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          variant="outlined"
          type="password"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          disabled={loading}
          error={!!error && password && confirmPassword && password !== confirmPassword}
          helperText={password && confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""}
          InputProps={{
            autoComplete: "new-password"
          }}
        />

        {error && password && confirmPassword && password === confirmPassword && (
          <Typography className="login-error-text">
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          className="login-button"
          disabled={loading}
          startIcon={<Lock />}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
        </Button>
      </form>
    );
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

        {renderContent()}
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

export default ResetPassword;