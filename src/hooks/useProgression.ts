"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchProgressionList,
  fetchUserProgression,
} from "@/services/student-resource.service";
import { normalizeError } from "@/errors/normalizeError";
import type { ProgressionQuery } from "@/types/progression";

export const PROGRESSION_KEY = ["admin", "progression"] as const;

export function useProgression(query: ProgressionQuery = {}) {
  const queryKey = [
    ...PROGRESSION_KEY,
    query.page ?? 1,
    query.limit ?? 20,
    query.search ?? "",
    query.department ?? "",
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
    queryFn: () => fetchProgressionList(query),
    staleTime: 60_000,
  });

  return {
    progression: data?.progression ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    isFetching,
    isError,
    error: isError ? normalizeError(rawError) : null,
    refetch,
  };
}

export function useUserProgression(userId?: string) {
  const {
    data: userProgression,
    isLoading,
    isError,
    error: rawError,
    refetch,
  } = useQuery({
    queryKey: [...PROGRESSION_KEY, "user", userId] as const,
    queryFn: () => fetchUserProgression(userId!),
    enabled: Boolean(userId),
  });

  return {
    userProgression,
    isLoading,
    isError,
    error: isError ? normalizeError(rawError) : null,
    refetch,
  };
}
