import { apiClient } from "@/api/axios";
import type { AdminBooksResponse, Book, BookStatus } from "@/types/book";

/**
 * Fetches every book in the library for the admin dashboard, optionally
 * filtered by status. Hits the existing GET /admin/storage/books endpoint —
 * no new backend work required, this just wires the frontend up to it.
 */
export async function fetchAdminBooks(status?: BookStatus): Promise<Book[]> {
  const { data } = await apiClient.get<AdminBooksResponse>("/admin/storage/books", {
    params: status ? { status } : undefined,
  });
  return data.books;
}

/**
 * Deletes a book (and its underlying storage object) via
 * DELETE /admin/storage/books/:id.
 */
export async function deleteAdminBook(bookId: string): Promise<void> {
  await apiClient.delete(`/admin/storage/books/${bookId}`);
}
