import apiClient from "./api-client";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../auth/token-manager";

// Attach in-memory access token to outgoing requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single in-flight refresh promise to prevent parallel refresh collisions
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  // Use bare axios instance with credentials to avoid triggering interceptor
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );

  const newAccessToken = response.data.data.accessToken;
  setAccessToken(newAccessToken);
  return newAccessToken;
};

// Endpoints that should NEVER trigger automatic token refresh on 401
const AUTH_ENDPOINTS_BYPASS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // If there is no response, or status is not 401, reject immediately
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do NOT trigger refresh on auth endpoints (login, register, refresh)
    const requestUrl = originalRequest.url || "";
    const isAuthBypass = AUTH_ENDPOINTS_BYPASS.some((path) =>
      requestUrl.includes(path)
    );

    if (isAuthBypass || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark request as retried to avoid infinite retry loops
    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      // Update header and replay original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      // Only redirect to login if user is currently on an authenticated page
      const publicPaths = ["/login", "/register"];
      const isPublicPage = publicPaths.some((p) =>
        window.location.pathname.startsWith(p)
      );

      if (!isPublicPage) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);
