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
  }
  
  export interface LoginData {
	accessToken: string;
	user: User;
  }
  
  export interface RegisterResponse {
	success: boolean;
	message: string;
	data: User;
  }
  
  export interface ProfileResponse {
	success: boolean;
	data: User;
  }