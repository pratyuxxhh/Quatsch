/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-session`, {
        method: 'GET',
        credentials: 'include',
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          console.error('Session check error:', errorData.message || `Server error: ${response.status}`);
        } catch {
          console.error('Session check error:', `Server error: ${response.status} ${response.statusText}`);
        }
        setUser(null);
        setAuthenticated(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setUser(data.user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      // Only log network errors, don't show error to user for session check
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error checking session. Backend server may not be running.');
      } else {
        console.error('Error checking session:', error);
      }
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          return {
            success: false,
            message: errorData.message || `Server error: ${response.status}`,
          };
        } catch {
          return {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
          };
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Only show "backend server is not running" for actual network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error. Please check if the backend server is running.',
        };
      }
      return {
        success: false,
        message: `An error occurred: ${error.message}`,
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          return {
            success: false,
            message: errorData.message || `Server error: ${response.status}`,
          };
        } catch {
          return {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
          };
        }
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setAuthenticated(true);
      }
      
      return data;
    } catch (error) {
      // Only show "backend server is not running" for actual network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error. Please check if the backend server is running.',
        };
      }
      return {
        success: false,
        message: `An error occurred: ${error.message}`,
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear local state even if request fails
      setUser(null);
      setAuthenticated(false);
    }
  };

  const value = {
    user,
    authenticated,
    loading,
    sendOTP,
    verifyOTP,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

