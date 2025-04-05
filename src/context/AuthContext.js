// src/context/AuthContext.js - Optimized version
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Create a flag to track logging out state (outside component to be globally accessible)
const isLoggingOut = { current: false };
const isRefreshing = { current: false };
let refreshPromise = null;

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

    // Skip token refresh if we're logging out or the request was for logout
    if (isLoggingOut.current || originalRequest.url?.includes('/logout')) {
      return Promise.reject(error);
    }

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Prevent multiple refresh calls - use existing promise if one is in progress
        if (isRefreshing.current) {
          if (refreshPromise) {
            await refreshPromise;
            // After refresh completes, update the original request header
            const token = sessionStorage.getItem('_auth_token');
            if (token) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return api(originalRequest);
            }
          }
          return Promise.reject(error); // If no refresh promise, reject
        }

        isRefreshing.current = true;
        refreshPromise = axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
          baseURL: process.env.REACT_APP_API_URL || 'https://localhost:8081'
        });

        // Wait for the refresh request
        const response = await refreshPromise;

        // If we got a new token, update it in memory
        if (response.data.token) {
          // Store the token in memory (not localStorage)
          sessionStorage.setItem('_auth_token', response.data.token);

          // Update the Authorization header for the original request
          originalRequest.headers['Authorization'] = 'Bearer ' + response.data.token;

          isRefreshing.current = false;
          refreshPromise = null;

          // Return the original request with the new token
          return api(originalRequest);
        }

        isRefreshing.current = false;
        refreshPromise = null;
      } catch (refreshError) {
        isRefreshing.current = false;
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add auth header to requests when token exists
api.interceptors.request.use(
  (config) => {
    // Skip adding auth token for logout requests if we're already logging out
    if (isLoggingOut.current && config.url?.includes('/logout')) {
      return config;
    }

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
  const [authError, setAuthError] = useState(null);
  const logoutInProgress = useRef(false); // Track logout state within component
  const initialCheckDone = useRef(false); // Track if initial token verification is done

  // Reset logout flag when component mounts
  useEffect(() => {
    isLoggingOut.current = false;
    logoutInProgress.current = false;

    // Only verify token once on initial load
    if (!initialCheckDone.current) {
      verifyToken();
    }

    return () => {
      // Clean up on unmount
      isLoggingOut.current = false;
      logoutInProgress.current = false;
    };
  }, []);

  // Verify token function
  const verifyToken = useCallback(async () => {
    const token = sessionStorage.getItem('_auth_token');
    const storedUserType = sessionStorage.getItem('_user_type');

    if (!token) {
      setLoading(false);
      initialCheckDone.current = true;
      return;
    }

    try {
      const response = await api.get('/api/auth/verify');
      setUser({
        username: response.data.username,
        tokenExpires: response.data.expires
      });
      setUserType(storedUserType || 'ADMIN');
      setAuthError(null);
    } catch (error) {
      sessionStorage.removeItem('_auth_token');
      sessionStorage.removeItem('_user_type');
      setAuthError("Session expired. Please login again.");
    } finally {
      setLoading(false);
      initialCheckDone.current = true;
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });

      if (response.data.token) {
        // Store token in memory
        sessionStorage.setItem('_auth_token', response.data.token);
        sessionStorage.setItem('_user_type', response.data.userType);

        setUser({
          username,
          tokenExpires: Date.now() + response.data.expiresIn
        });

        setUserType(response.data.userType);
        setAuthError(null);

        return {
          success: true,
          userType: response.data.userType
        };
      }

      // If we get here without a token, something went wrong
      return {
        success: false,
        message: "Invalid response from server. Please try again."
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again."
      };
    }
  };

  const logout = async () => {
    // Prevent duplicate logout calls
    if (logoutInProgress.current) {
      return { success: true, alreadyInProgress: true };
    }

    try {
      // Set both flags to prevent any refresh attempts during logout
      logoutInProgress.current = true;
      isLoggingOut.current = true;

      // Make the logout API call
      await api.post('/api/auth/logout');

      // Clear session data regardless of API response
      sessionStorage.removeItem('_auth_token');
      sessionStorage.removeItem('_user_type');
      setUser(null);
      setUserType(null);

      return { success: true };
    } catch (error) {
      // Still clear local session data even if API call fails
      sessionStorage.removeItem('_auth_token');
      sessionStorage.removeItem('_user_type');
      setUser(null);
      setUserType(null);
      throw error; // Re-throw the error so the component can handle it
    } finally {
      // Reset logout flags after a short delay to ensure any in-flight requests complete
      setTimeout(() => {
        logoutInProgress.current = false;
        isLoggingOut.current = false;
      }, 500);
    }
  };

  const isAuthenticated = useCallback(() => {
    return !!user && !!sessionStorage.getItem('_auth_token');
  }, [user]);

  const isAdmin = useCallback(() => {
    return userType === 'ADMIN';
  }, [userType]);

  const isOrganization = useCallback(() => {
    return userType === 'ORGANIZATION';
  }, [userType]);

  const authContextValue = {
    user,
    userType,
    login,
    logout,
    loading,
    authError,
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