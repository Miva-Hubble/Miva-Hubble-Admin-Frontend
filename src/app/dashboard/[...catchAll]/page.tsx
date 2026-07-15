import { notFound } from "next/navigation";

// Catch-all for any /dashboard/* path that doesn't have its own page yet
// (Library, Users, Moderation, Notifications, Settings, etc. — sections
// the sidebar links to that aren't built out). Being an actual matched
// route nested under dashboard/layout.tsx, this renders inside the
// RequireAuth guard and the sidebar/topbar shell, then immediately defers
// to the nearest not-found.tsx boundary (dashboard/not-found.tsx) instead
// of leaving the page blank or silently doing nothing.
export default function DashboardCatchAll() {
  notFound();
}
