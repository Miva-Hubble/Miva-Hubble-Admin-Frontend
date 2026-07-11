export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}
