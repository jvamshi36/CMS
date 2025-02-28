// src/pages/LoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, IconButton, InputAdornment, Typography, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import img from "../assets/images/login-img.png";
import "../Login/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null); // New state to track session ID

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValidated(/^[^\s@]+@[a-zA-Z]+\.(com|net|org|edu|gov)$/i.test(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8081/api/auth/login", { email, password });
      console.log("Login successful", response.data);
      setSessionId(response.data.sessionId); // Set session ID from response
    } catch (error) {
      console.error("Login failed", error.response?.data);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  // If session ID exists, do not navigate away
  if (sessionId) {
    return (
      <Box className="login-container">
        <Typography variant="h5" className="login-title">
          You are logged in!
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="login-container">
      {/* Left Side Image Section */}
      <Box className="login-image-container">
        <img src={img} alt="Security Illustration" className="login-image" />
      </Box>

      {/* Right Side Login Form */}
      <Box className="login-form-container">
        <Typography variant="subtitle1" className="login-welcome-text">
          Hi Suraksha Pharma, Welcome back!! 👋
        </Typography>
        <Typography variant="h5" className="login-title">
          Login to your account
        </Typography>

        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={handleEmailChange}
            placeholder="Please enter your email"
            InputProps={{
              endAdornment: emailValidated ? (
                <InputAdornment position="end">
                  <CheckIcon className="email-validated-icon" />
                </InputAdornment>
              ) : null,
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography className="login-error-text">
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" className="login-button">
            Login
          </Button>
        </form>

        <Button onClick={() => alert("Forgot password clicked")} className="forgot-password-button">
          Forgot Password?
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
