import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage to every outgoing request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hokhma_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected route, remove expired token
      const isAuthLogin = error.config?.url?.includes('/auth/login');
      if (!isAuthLogin) {
        localStorage.removeItem('hokhma_token');
        localStorage.setItem('hokhma_is_admin', 'false');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
