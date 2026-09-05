import { apiClient } from "@/api/axios";
import type {
  StudentResource,
  StudentResourcesQuery,
  PaginatedStudentResourcesResponse,
  ReviewStudentResourcePayload,
  ArchiveStudentResourcePayload,
} from "@/types/student-resource";
import type {
  UserProgression,
  ProgressionQuery,
  PaginatedProgressionResponse,
} from "@/types/progression";

export interface NormalizedStudentResourcesResult {
  resources: StudentResource[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface NormalizedProgressionResult {
  progression: UserProgression[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Fetch paginated list of student uploaded resources with optional status filtering.
 * GET /api/admin/student-resources?status=PENDING_REVIEW&page=1&limit=20
 */
export async function fetchStudentResources(
  query: StudentResourcesQuery = {},
): Promise<NormalizedStudentResourcesResult> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.search) params.search = query.search;
  if (query.department) params.department = query.department;
  if (query.level) params.level = query.level;

  const { data } = await apiClient.get<
    PaginatedStudentResourcesResponse | StudentResource[]
  >("/admin/student-resources", { params });

  if (Array.isArray(data)) {
    return {
      resources: data,
      total: data.length,
      totalPages: 1,
      page: query.page || 1,
      limit: query.limit || data.length,
    };
  }

  const items = data.data || data.resources || data.items || [];
  const total =
    data.pagination?.total ?? data.total ?? items.length;
  const limit = query.limit || data.pagination?.limit || 20;
  const totalPages =
    data.pagination?.totalPages ??
    data.totalPages ??
    Math.max(1, Math.ceil(total / (limit || 1)));
  const page = query.page || data.pagination?.page || 1;

  return {
    resources: items,
    total,
    totalPages,
    page,
    limit,
  };
}

/**
 * Review a student resource submission (APPROVE or REJECT).
 * PATCH /api/admin/student-resources/:resourceId/review
 */
export async function reviewStudentResource(
  resourceId: string,
  payload: ReviewStudentResourcePayload,
): Promise<{ success: boolean; message?: string }> {
  const { data } = await apiClient.patch<{
    success: boolean;
    message?: string;
  }>(`/admin/student-resources/${encodeURIComponent(resourceId)}/review`, payload);

  return data || { success: true };
}

/**
 * Archive a student resource submission with a required reason.
 * PATCH /api/admin/student-resources/:resourceId/archive
 */
export async function archiveStudentResource(
  resourceId: string,
  payload: ArchiveStudentResourcePayload,
): Promise<{ success: boolean; message?: string }> {
  const { data } = await apiClient.patch<{
    success: boolean;
    message?: string;
  }>(`/admin/student-resources/${encodeURIComponent(resourceId)}/archive`, payload);

  return data || { success: true };
}

/**
 * Fetch progression reporting list.
 * GET /api/admin/progression?page=1&limit=20
 */
export async function fetchProgressionList(
  query: ProgressionQuery = {},
): Promise<NormalizedProgressionResult> {
  const params: Record<string, string | number> = {};
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  if (query.search) params.search = query.search;
  if (query.department) params.department = query.department;

  const { data } = await apiClient.get<
    PaginatedProgressionResponse | UserProgression[]
  >("/admin/progression", { params });

  if (Array.isArray(data)) {
    return {
      progression: data,
      total: data.length,
      totalPages: 1,
      page: query.page || 1,
      limit: query.limit || data.length,
    };
  }

  const items = data.data || data.progression || data.items || [];
  const total =
    data.pagination?.total ?? data.total ?? items.length;
  const limit = query.limit || data.pagination?.limit || 20;
  const totalPages =
    data.pagination?.totalPages ??
    data.totalPages ??
    Math.max(1, Math.ceil(total / (limit || 1)));
  const page = query.page || data.pagination?.page || 1;

  return {
    progression: items,
    total,
    totalPages,
    page,
    limit,
  };
}

/**
 * Fetch a single user's progression report.
 * GET /api/admin/users/:userId/progression
 */
export async function fetchUserProgression(
  userId: string,
): Promise<UserProgression> {
  const { data } = await apiClient.get<UserProgression | { data: UserProgression }>(
    `/admin/users/${encodeURIComponent(userId)}/progression`,
  );

  if ("data" in data && data.data) {
    return data.data;
  }
  return data as UserProgression;
}

/**
 * Obtain a secure preview URL for a student resource document.
 * Checks if a public fileUrl is already provided, or requests a signed URL.
 */
export async function fetchResourcePreviewUrl(
  resourceId: string,
  fallbackUrl?: string | null,
): Promise<{ url: string | null; isSigned: boolean }> {
  if (
    fallbackUrl &&
    (fallbackUrl.startsWith("http://") ||
      fallbackUrl.startsWith("https://") ||
      fallbackUrl.startsWith("blob:"))
  ) {
    return { url: fallbackUrl, isSigned: false };
  }

  try {
    const { data } = await apiClient.get<{
      success?: boolean;
      signedUrl?: string;
      previewUrl?: string;
      url?: string;
    }>(`/admin/student-resources/${encodeURIComponent(resourceId)}/preview-url`);

    const previewUrl = data?.signedUrl || data?.previewUrl || data?.url;
    if (previewUrl) {
      return { url: previewUrl, isSigned: true };
    }
  } catch {
    // Graceful fallback if preview-url endpoint is not yet deployed on backend
  }

  return { url: fallbackUrl || null, isSigned: false };
}

