export type ContentType = "pdf" | "ebook";

export const CONTENT_TYPES = [
  { label: "PDF", value: "pdf" as const },
  { label: "eBook", value: "ebook" as const },
];

export const BOOK_TYPES = [
  { label: "Textbook", value: "TEXTBOOK" },
  { label: "Past Question", value: "PAST_QUESTION" },
  { label: "Study Guide", value: "STUDY_GUIDE" },
  { label: "Reference", value: "REFERENCE" },
];
