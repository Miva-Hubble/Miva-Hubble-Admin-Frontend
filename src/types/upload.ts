import type { AudienceTag, ContentType } from "@/lib/enums";

export interface UploadFormData {
  file?: File;
  title: string;
  author: string;
  contentType: ContentType;
  bookType: string;
  department: string;
  level: string;
  tags: AudienceTag[];
  description: string;
}

export interface UploadResponse {
  success: boolean;
  resourceId?: string;
  message: string;
  error?: string;
}

export interface AudienceEstimate {
  count: number;
  label: string;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
  size?: number;
  type?: string;
}
