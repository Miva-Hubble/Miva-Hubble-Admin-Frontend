export interface UserOnboarding {
  level: string;
  department: string;
  goals: string[];
  preferredMode: "ANONYMOUS" | "IDENTIFIED";
  completedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  picture?: string | null;
  profilePicturePath?: string | null;
  emailVerified: boolean;
  lastLoginWith?: "GOOGLE" | "NORMAL" | null;
  lastLoginAt?: string | null;
  createdAt: string;
  onboarding: UserOnboarding | null;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  department?: string;
  /** Omit for "all"; true = onboarded only, false = not yet onboarded. */
  onboarded?: boolean;
}

// Matches GET /api/admin/users exactly (see adminUserController.ts), but
// kept loose/defensive the same way PaginatedStudentResourcesResponse and
// PaginatedProgressionResponse are — one normalizer in user.service.ts is
// the only place allowed to assume a specific shape.
export interface PaginatedUsersResponse {
  success?: boolean;
  data?: AdminUser[];
  users?: AdminUser[];
  items?: AdminUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}
