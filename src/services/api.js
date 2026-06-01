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

// Endpoints where a 401 means "bad/absent credentials", not "access token
// expired". Trying to refresh for these is pointless and would loop the
// refresh call onto itself.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh-token'];
const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((p) => url.includes(p));

// Single-flight refresh: when several requests 401 at once they share ONE
// refresh request instead of firing in parallel and racing to overwrite each
// other's tokens.
let refreshPromise = null;
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.accessToken;
        if (!res.data?.success || !token) {
          throw new Error('Refresh failed');
        }
        localStorage.setItem('accessToken', token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// The session is unrecoverable (expired/absent refresh token). Clear it and —
// only if the user actually HAD a session — broadcast an event so the app can
// react. The guard keeps guests browsing public pages from ever being told
// their "session expired". AuthContext clears its state (protected pages then
// bounce to home) and Layout opens the login modal.
const handleSessionExpired = () => {
  const hadSession =
    !!localStorage.getItem('accessToken') || !!localStorage.getItem('user');
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  if (hadSession) {
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
  }
};

// Response interceptor: transparently refresh on a 401, and on an
// unrecoverable 401 surface a clean "log in again" flow instead of a raw error.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
