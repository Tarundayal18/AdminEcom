import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://lot-ecom-backend.onrender.com/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('=== API REQUEST ===');
    console.log('URL:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.log('Token:', token);
    console.log('==================');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 for non-auth endpoints
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      // Force page reload to go to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
