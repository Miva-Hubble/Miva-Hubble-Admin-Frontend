import { apiClient } from "@/api/axios";
import type { AdminUser, AdminUsersQuery, PaginatedUsersResponse } from "@/types/user";

export interface NormalizedUsersResult {
  users: AdminUser[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Fetch paginated user roster (identity + onboarding selection).
 * GET /api/admin/users?page=1&limit=20&search=&level=&department=&onboarded=
 *
 * Normalization mirrors fetchStudentResources / fetchProgressionList in
 * student-resource.service.ts — defensive against alternate response
 * shapes even though the current backend controller always returns
 * `{ success, users, pagination }`.
 */
export async function fetchUsers(
  query: AdminUsersQuery = {},
): Promise<NormalizedUsersResult> {
  const params: Record<string, string | number> = {};
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.search) params.search = query.search;
  if (query.level) params.level = query.level;
  if (query.department) params.department = query.department;
  if (query.onboarded !== undefined) params.onboarded = String(query.onboarded);

  const { data } = await apiClient.get<PaginatedUsersResponse | AdminUser[]>(
    "/admin/users",
    { params },
  );

  if (Array.isArray(data)) {
    return {
      users: data,
      total: data.length,
      totalPages: 1,
      page: query.page || 1,
      limit: query.limit || data.length,
    };
  }

  const items = data.data || data.users || data.items || [];
  const total = data.pagination?.total ?? data.total ?? items.length;
  const limit = query.limit || data.pagination?.limit || 20;
  const totalPages =
    data.pagination?.totalPages ??
    data.totalPages ??
    Math.max(1, Math.ceil(total / (limit || 1)));
  const page = query.page || data.pagination?.page || 1;

  return { users: items, total, totalPages, page, limit };
}
