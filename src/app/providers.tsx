"use client";

// No providers needed for now - Supabase Auth handles sessions automatically
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
