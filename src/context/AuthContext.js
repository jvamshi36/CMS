// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Set up the axios instance with defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:8081',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept 401 responses and try to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to get a new token using the refresh endpoint
        const response = await axios.post('/api/auth/refresh', {}, { 
          withCredentials: true,
          baseURL: process.env.REACT_APP_API_URL || 'https://localhost:8081'
        });
        
        // If we got a new token, update it in memory
        if (response.data.token) {
          // Store the token in memory (not localStorage)
          sessionStorage.setItem('_auth_token', response.data.token);
          
          // Update the Authorization header for the original request
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.token;
          
          // Return the original request with the new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add auth header to requests when token exists
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'ADMIN' or 'ORGANIZATION'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verify token on initial load
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('_auth_token');
      const storedUserType = sessionStorage.getItem('_user_type');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/verify');
        setUser({ 
          username: response.data.username,
          tokenExpires: response.data.expires
        });
        setUserType(storedUserType || 'ADMIN');
      } catch (error) {
        console.error("Token verification failed:", error);
        sessionStorage.removeItem('_auth_token');
        sessionStorage.removeItem('_user_type');
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      
      if (response.data.token) {
        // Store token in memory
        console.log("Storing token:", response.data.token); // Add this line
        sessionStorage.setItem('_auth_token', response.data.token);
        sessionStorage.setItem('_user_type', response.data.userType);
        
        setUser({
          username,
          tokenExpires: Date.now() + response.data.expiresIn
        });
        
        setUserType(response.data.userType);
        
        return { 
          success: true,
          userType: response.data.userType 
        };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please try again."
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      sessionStorage.removeItem('_auth_token');
      sessionStorage.removeItem('_user_type');
      setUser(null);
      setUserType(null);
      navigate('/login');
    }
  };

  const isAuthenticated = () => {
    return !!user && !!sessionStorage.getItem('_auth_token');
  };

  const isAdmin = () => {
    return userType === 'ADMIN';
  };

  const isOrganization = () => {
    return userType === 'ORGANIZATION';
  };

  const authContextValue = {
    user,
    userType,
    login,
    logout,
    loading,
    isAuthenticated,
    isAdmin,
    isOrganization,
    api
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Export the api instance for use throughout the app
export { api };