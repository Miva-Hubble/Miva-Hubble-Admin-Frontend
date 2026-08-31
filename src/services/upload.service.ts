import { apiClient } from "@/api/axios";
import { isApiClientError } from "@/interceptors/response.interceptor";
import type {
  UploadFormData,
  UploadResponse,
  FileValidation,
} from "@/types/upload";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const ALLOWED_TYPES = ["application/pdf", "application/epub+zip"];

export const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB (aligned with backend storage.schema.ts limit)
export const ALLOWED_COVER_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

/**
 * Validate document file before upload (client-side validation).
 */
export function validateFile(file: File): FileValidation {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Max 200MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`,
      size: file.size,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF and EPUB supported",
      type: file.type,
    };
  }

  return { valid: true, size: file.size, type: file.type };
}

/**
 * Validate optional cover image file before upload.
 */
export function validateCoverImage(file: File): FileValidation {
  if (!file) {
    return { valid: false, error: "No image selected" };
  }

  if (file.size > MAX_COVER_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Cover image must be 5MB or smaller (selected file is ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      size: file.size,
    };
  }

  if (!ALLOWED_COVER_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid cover image format. Only JPEG, PNG, and WebP are supported",
      type: file.type,
    };
  }

  return { valid: true, size: file.size, type: file.type };
}

/**
 * Uploads a cover image binary using the presigned cover upload URL flow:
 * 1. POST /admin/storage/books/cover-upload-url -> returns { signedUrl, publicUrl }
 * 2. PUT <signedUrl> -> streams raw image binary directly to Supabase storage
 * 3. Returns { success: true, publicUrl }
 */
export async function uploadCoverImage(
  coverFile: File,
): Promise<{ success: boolean; publicUrl?: string; message?: string }> {
  const validation = validateCoverImage(coverFile);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || "Invalid cover image",
    };
  }

  try {
    const { data } = await apiClient.post<{
      signedUrl: string;
      publicUrl: string;
    }>("/admin/storage/books/cover-upload-url", {
      filename: coverFile.name,
      contentType: coverFile.type,
      sizeBytes: coverFile.size,
    });

    if (!data?.signedUrl || !data?.publicUrl) {
      return {
        success: false,
        message: "Server did not return a valid cover upload URL",
      };
    }

    const uploadResponse = await fetch(data.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": coverFile.type },
      body: coverFile,
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        message: `Cover image storage upload failed (${uploadResponse.status})`,
      };
    }

    return { success: true, publicUrl: data.publicUrl };
  } catch (error) {
    return {
      success: false,
      message: isApiClientError(error)
        ? `Cover upload failed: ${error.message}`
        : "Failed to upload cover image",
    };
  }
}

/**
 * Upload a resource to the backend using the 3-step presigned URL architecture:
 *
 *   Optional Step 0 — Upload Cover Image if present via POST /admin/storage/books/cover-upload-url
 *   Step 1 — POST /admin/storage/books/upload-url
 *            → Obtain a short-lived Supabase signed upload URL + storage path.
 *   Step 2 — PUT <signedUrl>
 *            → Stream the raw file binary directly to Supabase Storage.
 *   Step 3 — POST /admin/storage/books
 *            → Register normalized metadata with the backend.
 */
export async function uploadResource(
  formData: UploadFormData,
): Promise<UploadResponse> {
  if (!formData.file) {
    return { success: false, message: "No file provided" };
  }

  const validation = validateFile(formData.file);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || "Validation failed",
    };
  }

  // ── Step 0: Upload Cover Image if provided (Option A vs Option B) ─────────
  let coverImageUrl: string | null = null;
  if (formData.coverImage) {
    const coverResult = await uploadCoverImage(formData.coverImage);
    if (!coverResult.success) {
      return {
        success: false,
        message: coverResult.message || "Failed to upload cover image",
      };
    }
    coverImageUrl = coverResult.publicUrl ?? null;
  }

  // ── Step 1: Request a presigned upload URL from the backend ──────────────
  let signedUrl: string;
  let storagePath: string;

  try {
    const { data } = await apiClient.post<{ signedUrl: string; path: string }>(
      "/admin/storage/books/upload-url",
      {
        filename: formData.file.name,
        contentType: formData.file.type,
        sizeBytes: formData.file.size,
      },
    );

    signedUrl = data.signedUrl;
    storagePath = data.path;
  } catch (error) {
    return {
      success: false,
      message: isApiClientError(error)
        ? `Could not get upload URL: ${error.message}`
        : "Failed to request upload URL",
    };
  }

  // ── Step 2: Upload the raw binary directly to Supabase Storage ───────────
  try {
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": formData.file.type },
      body: formData.file,
    });

    if (!uploadResponse.ok) {
      const detail = await uploadResponse.text().catch(() => "");
      return {
        success: false,
        message: `Storage upload failed (${uploadResponse.status})${detail ? `: ${detail}` : ""}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Storage upload error: ${error.message}`
          : "File upload to storage failed",
    };
  }

  // ── Step 3: Register book metadata with the backend ───────────────────────
  try {
    const payload: Record<string, unknown> = {
      path: storagePath,
      title: formData.title,
      author: formData.author,
      level: formData.level,
      department: formData.department,
      bookType: formData.bookType,
      status: "PUBLISHED",
    };

    if (coverImageUrl) {
      payload.coverImageUrl = coverImageUrl;
    } else {
      payload.coverImageUrl = null;
    }

    if (formData.tags && formData.tags.length > 0) {
      payload.tags = formData.tags;
    }

    if (formData.description) {
      payload.description = formData.description;
    }

    const { data } = await apiClient.post<{ id?: string; resourceId?: string }>(
      "/admin/storage/books",
      payload,
    );

    return {
      success: true,
      resourceId: data.id ?? data.resourceId,
      message: "Resource published successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: isApiClientError(error)
        ? `Metadata registration failed: ${error.message}`
        : "Failed to register book metadata",
    };
  }
}

/**
 * Save resource metadata as a DRAFT.
 *
 * A file is always required: the backend's CreateBookSchema requires a
 * non-empty `path`, and Book.storageObjectId is a required, non-nullable
 * column resolved from a real uploaded file — there is no backend concept
 * of a metadata-only (file-less) draft. Enforced here defensively even
 * though the UI already disables "Save as draft" until a file is selected.
 */
export async function saveDraft(
  formData: UploadFormData,
): Promise<UploadResponse> {
  if (!formData.file) {
    return { success: false, message: "A file is required to save a draft" };
  }

  // Optional cover image upload for draft
  let coverImageUrl: string | null = null;
  if (formData.coverImage) {
    const coverResult = await uploadCoverImage(formData.coverImage);
    if (!coverResult.success) {
      return {
        success: false,
        message: coverResult.message || "Failed to upload cover image",
      };
    }
    coverImageUrl = coverResult.publicUrl ?? null;
  }

  // Draft with document file: run the full presigned flow
  const validation = validateFile(formData.file);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || "Validation failed",
    };
  }

  // Step 1: Get signed URL
  let signedUrl: string;
  let storagePath: string;

  try {
    const { data } = await apiClient.post<{ signedUrl: string; path: string }>(
      "/admin/storage/books/upload-url",
      {
        filename: formData.file.name,
        contentType: formData.file.type,
        sizeBytes: formData.file.size,
      },
    );
    signedUrl = data.signedUrl;
    storagePath = data.path;
  } catch (error) {
    return {
      success: false,
      message: isApiClientError(error)
        ? `Could not get upload URL: ${error.message}`
        : "Failed to request upload URL",
    };
  }

  // Step 2: Upload binary to storage
  try {
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": formData.file.type },
      body: formData.file,
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        message: `Storage upload failed (${uploadResponse.status})`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Storage upload error: ${error.message}`
          : "File upload to storage failed",
    };
  }

  // Step 3: Register metadata as DRAFT
  try {
    const payload: Record<string, unknown> = {
      path: storagePath,
      title: formData.title || "Untitled Draft",
      author: formData.author || "Unknown Author",
      level: formData.level,
      department: formData.department,
      bookType: formData.bookType,
      status: "DRAFT",
    };

    if (coverImageUrl) {
      payload.coverImageUrl = coverImageUrl;
    } else {
      payload.coverImageUrl = null;
    }

    if (formData.tags && formData.tags.length > 0) {
      payload.tags = formData.tags;
    }

    if (formData.description) {
      payload.description = formData.description;
    }

    const { data } = await apiClient.post<{ id?: string; draftId?: string }>(
      "/admin/storage/books",
      payload,
    );

    return {
      success: true,
      resourceId: data.id ?? data.draftId,
      message: "Draft saved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: isApiClientError(error)
        ? `Draft registration failed: ${error.message}`
        : "Failed to save draft",
    };
  }
}
