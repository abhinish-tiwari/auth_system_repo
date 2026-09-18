import apiClient from "../api/api-client";
import type { ApiResponse } from "../types/api.types";
import {
  type LoginRequest,
  type LoginData,
  type RegisterRequest,
  type RegisterResponseData,
  type ProfileResponseData,
} from "../types/auth.types";
import { setAccessToken } from "../auth/token-manager";

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
  setAccessToken(response.data.data.accessToken);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const getProfile = async (): Promise<ApiResponse<ProfileResponseData>> => {
  const response = await apiClient.get<ApiResponse<ProfileResponseData>>("/users/profile");
  return response.data;
};
