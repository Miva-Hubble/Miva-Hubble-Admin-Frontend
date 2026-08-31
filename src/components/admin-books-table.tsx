"use client";

import { useState } from "react";
import { Eye, Download, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminBooks } from "@/hooks/useAdminBooks";
import type { Book, BookStatus } from "@/types/book";

const STATUS_BADGE_VARIANT: Record<BookStatus, "secondary" | "default" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminBooksTable() {
  const { books, isLoading, isError, error, refetch, removeBook, deletingId, deleteError } =
    useAdminBooks();
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await removeBook(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // Error surfaces via deleteError below; keep the dialog open so the
      // user can see it and retry or cancel.
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error?.message || "Failed to load books."}
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-10 text-center">
        <p className="text-sm font-medium text-foreground">No books uploaded yet</p>
        <p className="text-xs text-muted-foreground">
          Books you upload will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {deleteError.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 font-semibold">Book</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Previews</th>
              <th className="pb-3 font-semibold">Downloads</th>
              <th className="pb-3 font-semibold">Uploaded</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {books.map((book) => (
              <tr key={book.id} className="text-sm">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 font-mono text-[10px] font-bold text-primary">
                      {book.fileFormat}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{book.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {book.author} · {book.department}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={STATUS_BADGE_VARIANT[book.status]}>
                    {book.status.charAt(0) + book.status.slice(1).toLowerCase()}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-foreground">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {book.previewCount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-foreground">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    {book.downloadCount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-muted-foreground">
                  {formatDate(book.createdAt)}
                </td>
                <td className="py-3 text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setPendingDelete(book)}
                    aria-label={`Delete ${book.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete book?</DialogTitle>
            <DialogDescription>
              This permanently deletes &ldquo;{pendingDelete?.title}&rdquo; and its file from
              storage. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingId === pendingDelete?.id}
            >
              {deletingId === pendingDelete?.id ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
