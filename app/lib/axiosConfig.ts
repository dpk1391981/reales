import axios from "axios";

// Create instance
const axiosInstance = axios.create({
  baseURL:  "http://localhost:3000/api/v1",
  withCredentials: true, // ✅ send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// Attach Bearer token automatically
// ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Handle 401 globally
// ─────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — logging out");

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;