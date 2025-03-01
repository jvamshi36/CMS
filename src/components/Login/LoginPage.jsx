import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button, IconButton, InputAdornment, Typography, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from '../../context/AuthContext';
import img from "../assets/images/login-img.png";
import "../Login/LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {login}  = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8081/api/auth/login", { username, password });
      login(response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error.response?.data);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box className="login-container">
      <Box className="login-image-container">
        <img src={img} alt="Security Illustration" className="login-image" />
      </Box>

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
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Please enter your username"
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