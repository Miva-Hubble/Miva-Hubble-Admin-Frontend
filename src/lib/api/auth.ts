import { apiClient } from "@/lib/api/client";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/auth/login",
    credentials,
    {
      skipAuthHeader: true,
      skipAuthRedirect: true,
    },
  );
  return data;
}
