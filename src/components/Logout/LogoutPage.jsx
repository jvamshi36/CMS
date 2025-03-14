import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import "./LogoutPage.css";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;

    const performLogout = async () => {
      try {
        const result = await logout();

        // If already in progress, just update UI
        if (result?.alreadyInProgress) {
          console.log("Logout was already in progress");
        }

        // Short delay for better UX - shows the loading state briefly
        setTimeout(() => {
          if (isMounted) {
            setIsLoggingOut(false);
            // Auto-redirect to login after a brief pause
            setTimeout(() => {
              if (isMounted) {
                navigate('/login?message=Logged out successfully&status=success', { replace: true }); // Send message to login page
              }
            }, 1500);
          }
        }, 1000);
      } catch (error) {
        console.error('Logout failed:', error);
        if (isMounted) {
          setError('Failed to log out properly. Please try again.');
          setIsLoggingOut(false);
        }
      }
    };

    performLogout();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [logout, navigate]);

  const handleManualRedirect = () => {
    // If there was an error, still redirect but with an error message
    const status = error ? 'warning' : 'success';
    const message = error ? 'Partial logout completed. Some account services may still be active.' : 'Logged out successfully';
    navigate(`/login?message=${encodeURIComponent(message)}&status=${status}`, { replace: true });
  };

  return (
    <div className="logout-container">
      {/* Background gradient shapes */}
      <div className="logout-shape shape-1"></div>
      <div className="logout-shape shape-2"></div>

      {/* Content card */}
      <div className="logout-card">
        {isLoggingOut ? (
          <>
            <CircularProgress
              size={60}
              thickness={4}
              className="logout-spinner"
            />
            <Typography variant="h5" gutterBottom className="logout-title">
              Logging you out...
            </Typography>
            <Typography variant="body1" className="logout-message">
              Please wait while we securely log you out of your account.
            </Typography>
          </>
        ) : error ? (
          <>
            <Typography
              variant="h5"
              gutterBottom
              className="logout-error-title"
            >
              Logout Error
            </Typography>
            <Typography variant="body1" className="logout-error-message">
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={handleManualRedirect}
              className="logout-button"
            >
              Return to Login
            </Button>
          </>
        ) : (
          <>
            <div className="logout-success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <Typography variant="h5" gutterBottom className="logout-title">
              Logged Out Successfully
            </Typography>
            <Typography variant="body1" className="logout-message">
              You have been safely logged out of your account.
            </Typography>
            <Button
              variant="contained"
              onClick={handleManualRedirect}
              className="logout-button"
            >
              Return to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;