import React, { Component } from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }
  
  handleRefresh = () => {
    // Reload the current page
    window.location.reload();
  }
  
  handleGoHome = () => {
    // Navigate to home page and refresh the app
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            minHeight: '100vh',
            padding: 3,
            backgroundColor: '#f9fafb'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              textAlign: 'center',
              maxWidth: 500,
              borderRadius: 2,
              backgroundColor: 'white'
            }}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 70, 
                color: '#ef4444',
                mb: 2
              }} 
            />
            
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
              We're sorry — something has gone wrong. Please try refreshing the page or go back home.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#f1f5f9',
                  borderRadius: 1,
                  textAlign: 'left',
                  overflowX: 'auto',
                  mb: 3
                }}
              >
                <Typography variant="body2" component="pre" sx={{ color: '#ef4444', fontFamily: 'monospace' }}>
                  {this.state.error && this.state.error.toString()}
                </Typography>
                <Typography variant="body2" component="pre" sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={this.handleRefresh}
                sx={{ borderRadius: 2 }}
              >
                Refresh Page
              </Button>
              <Button 
                variant="contained" 
                onClick={this.handleGoHome}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: '#2563EB',
                  '&:hover': {
                    backgroundColor: '#1d4ed8'
                  }
                }}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;