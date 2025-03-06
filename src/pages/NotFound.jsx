import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../styles/NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="not-found-container">
      {/* Background gradient shapes */}
      <div className="background-shape shape-1"></div>
      <div className="background-shape shape-2"></div>

      {/* Content card */}
      <Container maxWidth="sm" className="not-found-card">
        {/* 404 browser window */}
        <div className="browser-window">
          <div className="browser-header">
            <div className="browser-button red"></div>
            <div className="browser-button yellow"></div>
            <div className="browser-button green"></div>
            <div className="browser-address"></div>
          </div>
          <div className="browser-content">
            <Typography variant="h1" className="error-code">404</Typography>
            <div className="browser-icons">
              <div className="browser-line"></div>
              <div className="browser-line"></div>
            </div>
            <div className="browser-dots">
              <div className="browser-dot"></div>
              <div className="browser-dot"></div>
              <div className="browser-dot"></div>
            </div>
          </div>
        </div>

        <Typography variant="h5" className="error-message">
          Looks like you've got lost....
        </Typography>

        <Button
          variant="contained"
          onClick={handleGoBack}
          className="back-button"
        >
          Back to Dashboard
        </Button>
      </Container>
    </div>
  );
};

export default NotFound;