export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  accessToken: string;
  user: User;
}

export interface RegisterResponseData {
  user: User;
}

export interface ProfileResponseData {
  user: User;
}