// client/src/api/api.js

import axios from 'axios';

// Set base URL for all API requests
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change if backend runs elsewhere
});

// Intercept requests to add Authorization header if token is available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
