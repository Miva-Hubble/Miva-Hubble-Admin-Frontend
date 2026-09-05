"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchStudentResources,
  reviewStudentResource,
  archiveStudentResource,
} from "@/services/student-resource.service";
import { normalizeError } from "@/errors/normalizeError";
import type {
  StudentResource,
  StudentResourcesQuery,
  ReviewStudentResourcePayload,
  ArchiveStudentResourcePayload,
} from "@/types/student-resource";

export const STUDENT_RESOURCES_KEY = ["admin", "student-resources"] as const;

export function useStudentResources(query: StudentResourcesQuery = {}) {
  const queryClient = useQueryClient();

  const queryKey = [
    ...STUDENT_RESOURCES_KEY,
    query.status ?? "ALL",
    query.page ?? 1,
    query.limit ?? 20,
    query.search ?? "",
    query.department ?? "",
    query.level ?? "",
  ] as const;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error: rawError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchStudentResources(query),
    staleTime: 30_000,
  });

  // Review (Approve / Reject) Mutation
  const reviewMutation = useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: string;
      payload: ReviewStudentResourcePayload;
    }) => reviewStudentResource(resourceId, payload),
    onSuccess: (_, variables) => {
      const isApprove = variables.payload.action === "APPROVE";
      toast.success(
        isApprove
          ? "Resource approved and published to Vault!"
          : "Resource rejected with feedback.",
      );
      // Invalidate all student resource queries so list & badges refresh
      queryClient.invalidateQueries({ queryKey: STUDENT_RESOURCES_KEY });
    },
    onError: (err) => {
      const appErr = normalizeError(err);
      toast.error(appErr.message || "Failed to process review.");
    },
  });

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: string;
      payload: ArchiveStudentResourcePayload;
    }) => archiveStudentResource(resourceId, payload),
    onSuccess: () => {
      toast.success("Resource archived successfully.");
      queryClient.invalidateQueries({ queryKey: STUDENT_RESOURCES_KEY });
    },
    onError: (err) => {
      const appErr = normalizeError(err);
      toast.error(appErr.message || "Failed to archive resource.");
    },
  });

  return {
    resources: data?.resources ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    isFetching,
    isError,
    error: isError ? normalizeError(rawError) : null,
    refetch,
    // Actions
    reviewResource: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isPending,
    archiveResource: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,
  };
}
