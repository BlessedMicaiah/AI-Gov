"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Renders the authenticated dashboard shell: a left sidebar plus main content
 * that is offset to make room for it. Unauthenticated visitors get the plain
 * full-width layout.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <>
      {isAuthenticated && <Sidebar />}
      <ErrorBoundary>
        <main className={`relative z-10 ${isAuthenticated ? "md:pl-60" : ""}`}>
          {children}
        </main>
      </ErrorBoundary>
    </>
  );
}
