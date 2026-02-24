import axios from 'axios';

// In dev, Vite proxy handles /api -> localhost:5001
// In production, Express serves both frontend and API at the same origin
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to resolve upload paths (pass-through, kept for consistency)
export const getUploadUrl = (path) => {
  if (!path) return '';
  return path;
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
