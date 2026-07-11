import type {
  UploadFormData,
  UploadResponse,
  FileValidation,
} from "@/types/upload";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const ALLOWED_TYPES = ["application/pdf", "application/epub+zip"];

/**
 * Validate file before upload (client-side validation)
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
 * Upload resource to backend API
 */
export async function uploadResource(
  formData: UploadFormData,
): Promise<UploadResponse> {
  try {
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

    // Prepare FormData for upload
    const uploadFormData = new FormData();
    uploadFormData.append("file", formData.file);
    uploadFormData.append("title", formData.title);
    uploadFormData.append("author", formData.author);
    uploadFormData.append("contentType", formData.contentType);
    uploadFormData.append("bookType", formData.bookType);
    uploadFormData.append("department", formData.department);
    uploadFormData.append("level", formData.level);
    uploadFormData.append("tags", JSON.stringify(formData.tags));
    uploadFormData.append("description", formData.description);

    // Send to API endpoint
    const response = await fetch("/api/library/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Upload failed: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      resourceId: data.resourceId,
      message: "Resource uploaded successfully",
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
      error: String(error),
    };
  }
}

/**
 * Save resource metadata as draft (without file)
 */
export async function saveDraft(
  formData: UploadFormData,
): Promise<UploadResponse> {
  try {
    const response = await fetch("/api/library/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        // Remove File object - can't serialize
        file: null,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Save failed: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      resourceId: data.draftId,
      message: "Draft saved successfully",
    };
  } catch (error) {
    console.error("Draft save error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Save failed",
    };
  }
}
