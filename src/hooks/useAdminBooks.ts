"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminBooks, deleteAdminBook } from "@/services/book.service";
import { normalizeError } from "@/errors/normalizeError";
import type { Book } from "@/types/book";

export const ADMIN_BOOKS_KEY = ["admin", "books"] as const;

export function useAdminBooks() {
  const queryClient = useQueryClient();

  const {
    data: books = [],
    isLoading,
    isError,
    error: rawError,
    refetch,
  } = useQuery({
    queryKey: ADMIN_BOOKS_KEY,
    queryFn: () => fetchAdminBooks(),
  });

  const {
    mutateAsync: removeBook,
    isPending: isDeleting,
    variables: deletingId,
    error: rawDeleteError,
  } = useMutation({
    mutationFn: deleteAdminBook,
    // Optimistic removal, rolled back on failure.
    onMutate: async (bookId: string) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_BOOKS_KEY });
      const previous = queryClient.getQueryData<Book[]>(ADMIN_BOOKS_KEY);
      queryClient.setQueryData<Book[]>(ADMIN_BOOKS_KEY, (prev = []) =>
        prev.filter((b) => b.id !== bookId),
      );
      return { previous };
    },
    onError: (_err, _bookId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADMIN_BOOKS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKS_KEY });
    },
  });

  return {
    books,
    isLoading,
    isError,
    error: isError ? normalizeError(rawError) : null,
    refetch,
    removeBook,
    deletingId: isDeleting ? (deletingId as string) : null,
    deleteError: rawDeleteError ? normalizeError(rawDeleteError) : null,
  };
}
