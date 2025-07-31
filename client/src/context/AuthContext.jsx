import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';

// Create Auth Context
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data from localStorage on app start
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        console.log('Loading user from storage...');
        const storedToken = authService.getToken();
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          console.log('Found stored user and token');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Set auth header for future requests
          authService.setAuthHeader(storedToken);
        } else {
          console.log('No stored user or token found');
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.register(userData);
      console.log('Register result:', result);
      
      if (result.success) {
        setUser(result.data.user);
        setToken(result.data.token);
        
        // Persist user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Set auth header for future requests
        authService.setAuthHeader(result.data.token);
        
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (userData, token) => {
    try {
      console.log('AuthContext login called with:', { userData, token });
      setLoading(true);
      setError(null);
      
      // Set user and token in state
      setUser(userData);
      setToken(token);
      
      // Persist user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set auth header for future requests
      authService.setAuthHeader(token);
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      console.log('Logging out user');
      // Clear auth service token
      authService.logout();
      
      // Clear context state
      setUser(null);
      setToken(null);
      setError(null);
      
      // Remove user data from localStorage
      localStorage.removeItem('user');
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && token);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Context value
  const contextValue = {
    // State
    user,
    token,
    loading,
    error,
    
    // Methods
    register,
    login,
    logout,
    isAuthenticated,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};