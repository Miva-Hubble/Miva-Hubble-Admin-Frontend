import { redirect } from "next/navigation";

// Root is intentionally a pure pass-through, not a page in its own right.
// `/dashboard` owns the "am I authenticated" branching via <RequireAuth>
// (redirecting to /login if not) — that logic should live in exactly one
// place, not be duplicated here.
export default function HomePage() {
  redirect("/dashboard");
}
