export type StudentResourceStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export interface StudentContributor {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  department?: string;
  level?: string;
}

export interface StudentResource {
  id: string;
  title: string;
  author?: string | null;
  description?: string | null;
  level?: string | null;
  department?: string | null;
  bookType?: string | null;
  fileFormat?: string | null;
  path?: string | null;
  fileUrl?: string | null;
  coverImageUrl?: string | null;
  status: StudentResourceStatus;
  tags?: string[];
  rejectionReason?: string | null;
  archiveReason?: string | null;
  userId?: string | null;
  user?: StudentContributor | null;
  downloadCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentResourcesQuery {
  status?: StudentResourceStatus;
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  level?: string;
}

export interface PaginatedStudentResourcesResponse {
  success?: boolean;
  data?: StudentResource[];
  resources?: StudentResource[];
  items?: StudentResource[];
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

export interface ReviewStudentResourcePayload {
  action: "APPROVE" | "REJECT";
  reason?: string;
}

export interface ArchiveStudentResourcePayload {
  reason: string;
}
