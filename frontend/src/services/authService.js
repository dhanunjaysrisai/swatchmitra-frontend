import axios from 'axios';
import { getApiBaseUrl } from '../config/apiBase';

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      const pathname = window.location.pathname;
      const onAuthPage = pathname === '/login' || pathname === '/register';
      const isAuthRequest =
        reqUrl.includes('/api/auth/login') ||
        reqUrl.includes('/api/auth/register') ||
        reqUrl.includes('/api/auth/profile');

      if (!onAuthPage && !isAuthRequest) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register user
  register: async (name, email, password) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Get user profile
  getUserProfile: async (token) => {
    const response = await api.get('/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },
};
