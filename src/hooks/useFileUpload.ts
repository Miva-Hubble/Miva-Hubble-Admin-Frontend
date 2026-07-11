"use client";

import { useState, useCallback } from "react";
import type { UploadFormData, UploadResponse } from "@/types/upload";
import {
  uploadResource,
  saveDraft,
  validateFile,
} from "@/services/upload.service";

interface UseFileUploadState {
  file: File | null;
  uploading: boolean;
  error: string | null;
  progress: number;
  success: boolean;
}

/**
 * Hook for handling file upload operations
 * Manages file state, validation, upload progress, and error handling
 */
export function useFileUpload() {
  const [state, setState] = useState<UseFileUploadState>({
    file: null,
    uploading: false,
    error: null,
    progress: 0,
    success: false,
  });

  const setFile = useCallback((file: File | null) => {
    if (file) {
      const validation = validateFile(file);
      setState((prev) => ({
        ...prev,
        file,
        error: validation.valid ? null : validation.error || "Invalid file",
        success: false,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        file: null,
        error: null,
      }));
    }
  }, []);

  const upload = useCallback(
    async (formData: UploadFormData): Promise<UploadResponse> => {
      setState((prev) => ({
        ...prev,
        uploading: true,
        error: null,
      }));

      try {
        const result = await uploadResource(formData);

        setState((prev) => ({
          ...prev,
          uploading: false,
          success: result.success,
          error: result.success ? null : result.message,
          progress: result.success ? 100 : 0,
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
          progress: 0,
        }));
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [],
  );

  const saveAsDraft = useCallback(
    async (formData: UploadFormData): Promise<UploadResponse> => {
      setState((prev) => ({
        ...prev,
        uploading: true,
        error: null,
      }));

      try {
        const result = await saveDraft(formData);

        setState((prev) => ({
          ...prev,
          uploading: false,
          success: result.success,
          error: result.success ? null : result.message,
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Save failed";
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }));
        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({
      file: null,
      uploading: false,
      error: null,
      progress: 0,
      success: false,
    });
  }, []);

  return {
    ...state,
    setFile,
    upload,
    saveAsDraft,
    reset,
  };
}
