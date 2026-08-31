export type BookStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BookType = "TEXTBOOK" | "PAST_QUESTION" | "STUDY_GUIDE" | "REFERENCE";

export type FileFormat = "PDF" | "EPUB" | "DOC" | "DOCX";

/**
 * Mirrors the `Book` Prisma model (see backend prisma/schema.prisma) as
 * returned by GET /admin/storage/books. Keep in sync with that model —
 * this is a hand-maintained mirror, not a generated type.
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  level: string;
  department: string;
  bookType: BookType;
  fileFormat: FileFormat;
  coverImageUrl: string | null;
  status: BookStatus;
  tags: string[];
  downloadCount: number;
  previewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooksResponse {
  success: boolean;
  books: Book[];
}
