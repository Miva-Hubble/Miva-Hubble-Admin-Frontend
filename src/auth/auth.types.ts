export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AdminUser | null>;
}
