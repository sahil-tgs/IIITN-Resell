// src/config/api.js
// API gateway URL — Spring Cloud Gateway fronting all Java microservices.
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";
export default API_BASE_URL;
