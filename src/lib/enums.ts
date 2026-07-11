export type ContentType = "pdf" | "ebook";

export type AudienceTag =
  | "AI Track"
  | "Data Science"
  | "Cybersecurity"
  | "Software Eng."
  | "Clinical"
  | "Research"
  | "Entrepreneurship"
  | "Finance"
  | "Public Health"
  | "Robotics";

export const CONTENT_TYPES = [
  { label: "PDF", value: "pdf" as const },
  { label: "eBook", value: "ebook" as const },
];

export const BOOK_TYPES = [
  { label: "Textbook", value: "textbook" },
  { label: "Reference", value: "reference" },
  { label: "Course Pack", value: "course-pack" },
  { label: "Research Paper", value: "research-paper" },
];

export const DEPARTMENTS = [
  { label: "Computer Science", value: "computer-science" },
  { label: "Engineering", value: "engineering" },
  { label: "Business", value: "business" },
  { label: "Medicine", value: "medicine" },
  { label: "Arts", value: "arts" },
];

export const LEVELS = [
  { label: "Level 100", value: "100" },
  { label: "Level 200", value: "200" },
  { label: "Level 300", value: "300" },
  { label: "Level 400", value: "400" },
];

export const AUDIENCE_TAGS: AudienceTag[] = [
  "AI Track",
  "Data Science",
  "Cybersecurity",
  "Software Eng.",
  "Clinical",
  "Research",
  "Entrepreneurship",
  "Finance",
  "Public Health",
  "Robotics",
];
