import type { ContentType } from "@/lib/enums";

export interface UploadFormData {
  file?: File;
  coverImage?: File;
  title: string;
  author: string;
  contentType: ContentType;
  bookType: string;
  department: string;
  level: string;
  tags: string[];
  description: string;
}

export interface UploadResponse {
  success: boolean;
  resourceId?: string;
  message: string;
  error?: string;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
  size?: number;
  type?: string;
}
