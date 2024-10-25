// client/src/api/api.js

import axios from "axios";

// Set base URL for all API requests.
// Points at the Spring Cloud Gateway, which routes to each microservice.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
});

// Intercept requests to add Authorization header if token is available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
