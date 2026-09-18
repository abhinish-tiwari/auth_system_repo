import apiClient from "../api/api-client";

import type { ApiResponse } from "../types/api.types";

import {
  type LoginRequest,
  type LoginData,
  type RegisterRequest,
  type User,
} from "../types/auth.types";

import { setAccessToken } from "../auth/token-manager";

export const registerUser = async (
  data: RegisterRequest,
): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>(
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

export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>("/users/profile");
  return response.data;
};

