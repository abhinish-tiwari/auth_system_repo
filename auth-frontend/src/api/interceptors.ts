import apiClient from "./api-client";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../auth/token-manager";
import { silentRefresh } from "../services/auth.service";

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const AUTH_BYPASS_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";
    const isBypassRoute = AUTH_BYPASS_PATHS.some((path) =>
      requestUrl.includes(path)
    );

    if (isBypassRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark the request to prevent infinite retry loops
    originalRequest._retry = true;

    try {
      // Create or reuse the in-flight refresh promise
      if (!refreshPromise) {
        refreshPromise = silentRefresh()
          .then((token) => {
            setAccessToken(token);
            return token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      // Retry the original failed request with the new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      const publicPaths = ["/login", "/register"];
      const onPublicPage = publicPaths.some((p) =>
        window.location.pathname.startsWith(p)
      );

      if (!onPublicPage) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);
