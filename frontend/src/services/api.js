import axios from 'axios';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

// In dev, proxy handles /api -> localhost:5001
// In production, API is at /bakeoff/api
const API_URL = import.meta.env.VITE_API_URL || (BASE_PATH ? `${BASE_PATH}/api` : '/api');

// Helper to resolve image/upload paths for production
// Stored paths are like "/uploads/uuid.jpg" -- prefix with base path in production
export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_PATH}${path}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const loginPath = BASE_PATH ? `${BASE_PATH}/login` : '/login';
      window.location.href = loginPath;
    }
    return Promise.reject(error);
  }
);

export default api;
