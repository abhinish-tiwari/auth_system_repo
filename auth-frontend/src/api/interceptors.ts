import apiClient from "./api-client";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../auth/token-manager";

// Request interceptor stays clean
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track the active refresh promise globally
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  // CRITICAL: Use basic 'axios', NOT 'apiClient' to avoid interceptor side-effects
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );

  const newAccessToken = response.data.data.accessToken;
  setAccessToken(newAccessToken);
  return newAccessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Safely exit if it's not a 401 or if this specific config has already retried
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // Explicitly flag this request to prevent looping
    originalRequest._retry = true;

    try {
      // If a refresh is not already in flight, create one
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          // Clear the promise after a small tick to let all simultaneous 
          // 401 requests resolve using this exact same in-flight promise
          setTimeout(() => {
            refreshPromise = null;
          }, 100);
        });
      }

      // Wait for the shared promise to resolve
      const newAccessToken = await refreshPromise;

      // Update the headers of the failed request and retry it
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // If refreshing fails entirely, clear credentials and boot to login
      refreshPromise = null;
      clearAccessToken();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);



// import apiClient from "./api-client";

// import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// import {
//   getAccessToken,
//   setAccessToken,
//   clearAccessToken,
// } from "../auth/token-manager";

// apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   const token = getAccessToken();

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// let refreshPromise: Promise<string> | null = null;

// const refreshAccessToken = async (): Promise<string> => {
//   const response = await axios.post(
//     `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
//     {},
//     {
//       withCredentials: true,
//     },
//   );

//   const newAccessToken = response.data.data.accessToken;

//   setAccessToken(newAccessToken);

//   return newAccessToken;
// };

// apiClient.interceptors.response.use(
//   (response) => response,

//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status !== 401 || originalRequest?._retry) {
//       return Promise.reject(error);
//     }

//     originalRequest._retry = true;

//     try {
//       if (!refreshPromise) {
//         refreshPromise = refreshAccessToken();
//       }

//       const newAccessToken = await refreshPromise;

//       refreshPromise = null;

//       originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//       return apiClient(originalRequest);
//     } catch (refreshError) {
//       refreshPromise = null;

//       clearAccessToken();

//       window.location.href = "/login";

//       return Promise.reject(refreshError);
//     }
//   },
// );
