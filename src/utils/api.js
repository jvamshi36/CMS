// src/utils/api.js - Optimized version with request deduplication
import axios from 'axios';

// Get the base URL from environment variable or use default
const baseURL = process.env.REACT_APP_API_URL || 'https://localhost:8081';

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map();

// Create axios instance with default config
const api = axios.create({
  baseURL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // 15 seconds timeout
});

// Generate a unique key for a request to track duplicates
const getRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Add a request interceptor to include auth token and handle duplicates
api.interceptors.request.use(
  (config) => {
    // Get token from session storage
    const token = sessionStorage.getItem('_auth_token');

    // If token exists, add it to the header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check for duplicate requests
    const requestKey = getRequestKey(config);

    // If this is a GET request and there's already a pending request with the same key
    if (config.method.toLowerCase() === 'get' && pendingRequests.has(requestKey)) {
      // Create a new CancelToken to abort this duplicate request
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      // Abort immediately
      source.cancel(`Duplicate request cancelled for ${requestKey}`);
    } else {
      // For non-GET methods or new GET requests, record this request
      pendingRequests.set(requestKey, true);

      // Add a callback to remove from pending when the request completes
      const originalRequestComplete = config.requestComplete || (() => {});
      config.requestComplete = () => {
        pendingRequests.delete(requestKey);
        originalRequestComplete();
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to mark requests as complete and handle errors
api.interceptors.response.use(
  (response) => {
    // Call the requestComplete callback if it exists
    if (response.config.requestComplete) {
      response.config.requestComplete();
    }
    return response;
  },
  (error) => {
    // For cancelled requests due to duplicates, just return a rejected promise
    // with a custom flag so we can handle it specially
    if (axios.isCancel(error)) {
      return Promise.reject({
        isDuplicateRequest: true,
        message: error.message
      });
    }

    // For other errors, make sure to mark the request as complete
    if (error.config && error.config.requestComplete) {
      error.config.requestComplete();
    }

    // Handle network errors
    if (!error.response) {
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

// API service methods with duplicate request handling
const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      // If this was a cancelled duplicate request, try to reuse the original response
      if (error.isDuplicateRequest) {
        // For duplicate GET requests, we'd ideally like to return the result of the original request
        // We could implement a more sophisticated caching/promise sharing mechanism here
      }
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
  },

  // Clear all pending requests (useful for page transitions, logout, etc.)
  clearPendingRequests: () => {
    pendingRequests.clear();
  }
};

export default apiService;