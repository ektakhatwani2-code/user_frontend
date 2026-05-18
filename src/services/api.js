import axios from 'axios';

// VITE_API_URL must be injected at build time. In production builds without
// the env var we throw so the missing config is obvious instead of silently
// shipping with an undefined baseURL (which produces requests to the same
// origin and confusing 404s).
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? (() => {
        throw new Error('VITE_API_URL is required in production builds');
      })()
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
