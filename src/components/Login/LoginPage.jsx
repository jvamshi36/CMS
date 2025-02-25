import React, { useState } from "react";
import { TextField, Button, IconButton, InputAdornment, Typography, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import img from "../assets/images/login-img.png";
import "@fontsource/mulish";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValidated(/^[^\s@]+@[a-zA-Z]+\.(com|net|org|edu|gov)$/i.test(value));
  };


  return (
    <Box display="flex" minHeight="100vh" bgcolor="#F8FAFC" fontFamily="Mulish">
      {/* Left Side Image Section */}
      <Box flex={0.40} display="flex" justifyContent="center" alignItems="center" bgcolor="
#f4f9ff">
        <img src={img} alt="Security Illustration" style={{ width: "75%" }} />
      </Box>

      {/* Right Side Login Form */}
      <Box flex={0.60} display="flex" flexDirection="column" justifyContent="center" alignItems="center" px={4} fontFamily="Mulish">
        <Typography variant="subtitle1" color="textSecondary">
          Hi Suraksha Pharma, Welcome back!! 👋
        </Typography>
        <Typography variant="h5" fontWeight="bold" mt={1} color="#333333">
          Login to your account
        </Typography>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={handleEmailChange}
          placeholder="Please enter your email"
          sx={{ maxWidth: 350, fontFamily: "Mulish" }}
          InputProps={{
            endAdornment: emailValidated ? (
              <InputAdornment position="end">
                <CheckIcon style={{ color: "green" }} />
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
          sx={{ maxWidth: 350, fontFamily: "Mulish" }}
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

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, fontWeight: "bold", backgroundColor: "#2563EB", height: "48px", maxWidth: 350, fontFamily:"Mulish" }}
        >
          Login
        </Button>

        <Button onClick={() => alert("Forgot password clicked")} sx={{ mt: 2, color: "#2563EB", textTransform: "none", fontFamily:"Mulish" }}>
          Forgot Password?
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
