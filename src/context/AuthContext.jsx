import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');

      if (storedUser && storedToken) {
        // Try to refresh token
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          if (response.data.success) {
            setUser(response.data.user);
            setAccessToken(response.data.accessToken);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('accessToken', response.data.accessToken);
          } else {
            // Token refresh failed, but keep user logged in with existing token
            // until it actually fails on an API call
            setUser(JSON.parse(storedUser));
            setAccessToken(storedToken);
            setIsAuthenticated(true);
          }
        } catch (refreshError) {
          // Token refresh failed, try to use existing token
          // User will be logged out on next API failure
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('accessToken', response.data.accessToken);
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        userData,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Auto-login user after successful registration if token is provided
        if (response.data.accessToken && response.data.user) {
          setUser(response.data.user);
          setAccessToken(response.data.accessToken);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('accessToken', response.data.accessToken);
          return { success: true, autoLoggedIn: true, message: response.data.message };
        }
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        return response.data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        userData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
