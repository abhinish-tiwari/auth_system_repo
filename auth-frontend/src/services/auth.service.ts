import apiClient from "../api/api-client";
import axios from "axios";
import type { ApiResponse } from "../types/api.types";
import {
  type LoginRequest,
  type LoginData,
  type RegisterRequest,
  type RegisterResponseData,
  type ProfileResponseData,
} from "../types/auth.types";

export const silentRefresh = async (): Promise<string> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return response.data.data.accessToken as string;
};

export const getProfile = async (): Promise<
  ApiResponse<ProfileResponseData>
> => {
  const response =
    await apiClient.get<ApiResponse<ProfileResponseData>>("/users/profile");
  return response.data;
};

export const registerUser = async (
  data: RegisterRequest,
): Promise<ApiResponse<RegisterResponseData>> => {
  const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
    "/auth/register",
    data,
  );
  return response.data;
};

export const loginUser = async (
  data: LoginRequest,
): Promise<ApiResponse<LoginData>> => {
  const response = await apiClient.post<ApiResponse<LoginData>>(
    "/auth/login",
    data,
  );
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
