import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
}

// AuthCard now handled by shadcn Card component in LoginForm
export function AuthCard({ children }: AuthCardProps) {
  return <>{children}</>;
}
