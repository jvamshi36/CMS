import axios from 'axios';

// Get the base URL from environment variable or use default
const baseURL = process.env.REACT_APP_API_URL || 'https://localhost:8081';

// Create axios instance with default config
const api = axios.create({
  baseURL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // 15 seconds timeout
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from session storage
    const token = sessionStorage.getItem('_auth_token');
    
    // If token exists, add it to the header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for common error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        networkError: true
      });
    }
    
    // Handle different response status codes
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Bad request
        return Promise.reject({
          message: data.message || 'Invalid request',
          errors: data.errors,
          status
        });
      case 401:
        // Unauthorized - let auth context handle this
        if (window.location.pathname !== '/login') {
          // Only handle if we're not already on the login page to avoid loops
          console.error('Authentication error:', error);
        }
        return Promise.reject({
          message: 'Session expired. Please login again.',
          authError: true,
          status
        });
      case 403:
        // Forbidden
        return Promise.reject({
          message: 'You do not have permission to access this resource',
          status
        });
      case 404:
        // Not found
        return Promise.reject({
          message: 'Resource not found',
          status
        });
      case 422:
        // Validation errors
        return Promise.reject({
          message: 'Validation error',
          errors: data.errors,
          status
        });
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        return Promise.reject({
          message: 'Server error. Please try again later.',
          status
        });
      default:
        return Promise.reject({
          message: data.message || 'An error occurred',
          status
        });
    }
  }
);

// API service methods with standardized error handling
const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Upload files
  upload: async (url, formData, onProgress = () => {}) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService;