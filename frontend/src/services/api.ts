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

// A rejected token on any protected route tells the app to sign out (AppContext listens for this event)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isAuthLogin) {
      window.dispatchEvent(new Event('hokhma:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
