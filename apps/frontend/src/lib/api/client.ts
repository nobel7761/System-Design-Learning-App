import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const client: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Log error details in development
      if (process.env.NODE_ENV === "development") {
        console.error(`API Error [${status}]:`, {
          url: error.config?.url,
          method: error.config?.method,
          data: data,
        });
      }

      // Handle specific error statuses
      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            // Only redirect if not already on login page
            if (!window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
          break;
        case 403:
          // Forbidden
          console.error(
            "Access forbidden: You don't have permission to access this resource",
          );
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Internal server error
          console.error("Internal server error: Please try again later");
          break;
        default:
          // Other errors
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        "Network Error: Could not connect to backend. Is the server running on",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
        "?",
      );
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default client;
