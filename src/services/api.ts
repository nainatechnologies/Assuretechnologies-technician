import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'X-Client-Type': 'technician',
  },
});

// Interceptor to attach Bearer token automatically for mobile and cross-origin requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('technician_token') || localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiry or 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('technician_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Only redirect if not already on login or root
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
