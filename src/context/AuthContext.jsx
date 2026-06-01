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

  // When an API call detects an unrecoverable 401 (api.js dispatches this after
  // a failed token refresh), drop to logged-out. Protected pages (Account,
  // Checkout) gate on isAuthenticated and will redirect away on their own.
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    };
    window.addEventListener('auth:session-expired', handleExpired);
    return () => window.removeEventListener('auth:session-expired', handleExpired);
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
        const userData = response.data.user;
        const token = response.data.accessToken;

        setUser(userData);
        setAccessToken(token);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token);

        return { success: true };
      }
      return {
        success: false,
        message: response.data.message || 'Login failed',
      };
    } catch (error) {
      const data = error.response?.data;
      // Unverified account: backend sent a fresh OTP — caller switches to the
      // OTP step instead of showing a generic error.
      if (data?.requiresOtp) {
        return {
          success: false,
          requiresOtp: true,
          email: data.email || email,
          message: data.message || 'Please verify your email.',
        };
      }
      return {
        success: false,
        message: data?.message || 'Login failed. Please check your credentials.',
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
        // Customer flow: backend requires email OTP verification before login.
        if (response.data.requiresOtp) {
          return {
            success: true,
            requiresOtp: true,
            email: response.data.email || userData.email,
            message: response.data.message,
          };
        }
        // Auto-login user after successful registration if token is provided
        // (e.g. pre-verified admin accounts).
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
      const data = error.response?.data;
      let message = data?.message || 'Registration failed. Please try again.';
      // The server returns per-field errors as { errors: [{ field, message }, ...] }
      // when express-validator rejects the input. Surface those so the user
      // sees the actual reason (e.g. "Password must include ...") rather than
      // a generic "Validation failed".
      if (Array.isArray(data?.errors) && data.errors.length) {
        message = data.errors.map((e) => e.message).join(' · ');
      }
      return {
        success: false,
        message,
      };
    }
  };

  // Verify the registration OTP. On success the backend logs the user in
  // (returns tokens), so we store the session just like login.
  const verifyOtp = async (email, otp) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.accessToken;
        setUser(userData);
        setAccessToken(token);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Verification failed' };
    } catch (error) {
      const data = error.response?.data;
      return {
        success: false,
        expired: Boolean(data?.expired),
        message: data?.message || 'Verification failed. Please try again.',
      };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
        { email },
        { withCredentials: true }
      );
      return { success: Boolean(response.data.success), message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Could not resend the code. Please try again.',
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
    verifyOtp,
    resendOtp,
    logout,
    refreshToken,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
