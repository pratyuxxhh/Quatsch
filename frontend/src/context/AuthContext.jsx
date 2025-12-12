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
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setUser(data.user);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
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
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check if the backend server is running.',
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
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setAuthenticated(true);
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error. Please check if the backend server is running.',
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

