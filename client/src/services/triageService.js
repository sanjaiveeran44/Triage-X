import axios from 'axios';

// Base URL for the backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Submit triage assessment
export const submitTriage = async (triageData) => {
  try {
    const response = await api.post('/api/triage/submit', triageData);
    return response.data;  // Return the direct response data
  } catch (error) {
    return handleError(error);
  }
};

// Get triage history for a user
export const getTriageHistory = async () => {
  try {
    const response = await api.get('/api/triage/history');
    return response.data;  // Return the direct response data
  } catch (error) {
    return handleError(error);
  }
};

// Get specific triage result
export const getTriageResult = async (triageId) => {
  try {
    const response = await api.get(`/api/triage/results/${triageId}`);
    return response.data;  // Return the direct response data
  } catch (error) {
    return handleError(error);
  }
};

// Helper function to handle errors
const handleError = (error) => {
  if (error.response) {
    return {
      success: false,
      message: error.response.data.message || 'Request failed',
      errors: error.response.data.errors || []
    };
  } else if (error.request) {
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  } else {
    return {
      success: false,
      message: 'An unexpected error occurred'
    };
  }
};

// Set authorization header for future requests
export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize auth header on app start if token exists
const token = localStorage.getItem('token');
if (token) {
  setAuthHeader(token);
}

export default api;
