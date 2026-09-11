"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/services/user.service";
import { normalizeError } from "@/errors/normalizeError";
import type { AdminUsersQuery } from "@/types/user";

export const USERS_KEY = ["admin", "users"] as const;

/** Read-only roster — no mutations, so no QueryClient/invalidation needed. */
export function useUsers(query: AdminUsersQuery = {}) {
  const queryKey = [
    ...USERS_KEY,
    query.page ?? 1,
    query.limit ?? 20,
    query.search ?? "",
    query.level ?? "",
    query.department ?? "",
    query.onboarded ?? "ALL",
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
    queryFn: () => fetchUsers(query),
    staleTime: 30_000,
  });

  return {
    users: data?.users ?? [],
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
