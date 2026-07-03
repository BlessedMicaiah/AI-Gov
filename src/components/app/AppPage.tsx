import type { ReactNode } from "react";

/**
 * Standard container for authenticated app pages. Provides the app-density
 * rhythm (tight padding, not marketing-scale) and a centered max-width column
 * with consistent vertical spacing between page sections.
 *
 * Replaces the ad-hoc `<div className="section min-h-screen"><div className="max-w-7xl mx-auto">`
 * pattern that reused marketing spacing (py-20/28) on data pages.
 */
export function AppPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <div className={`mx-auto flex max-w-7xl flex-col gap-6 ${className}`}>{children}</div>
    </div>
  );
}
