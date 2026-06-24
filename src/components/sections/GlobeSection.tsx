"use client";

import dynamic from "next/dynamic";

const GovernanceGlobe = dynamic(
  () => import("@/components/three/GovernanceGlobe").then((mod) => mod.GovernanceGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-mono text-sm text-terminal-muted">Loading governance globe…</span>
      </div>
    ),
  },
);

/**
 * GlobeSection — full-width feature section beneath the hero that presents the
 * interactive AI-governance globe. Visitors rotate the globe to explore the
 * jurisdictions where AI governance acts apply.
 */
export function GlobeSection() {
  return (
    <section className="section">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-terminal-border bg-terminal-dark/50 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-terminal-green" />
            <span className="font-mono text-sm text-terminal-muted">Global regulatory map</span>
          </span>
          <h2 className="section-title">
            Where AI governance <span className="text-terminal-green">acts apply</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Spin the globe to explore the laws, regulations, and frameworks shaping AI worldwide —
            from the EU AI Act to U.S. state laws, China, and beyond.
          </p>
        </div>

        {/* Interactive globe — larger, center stage */}
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="relative h-[460px] overflow-hidden rounded-xl sm:h-[560px] lg:h-[680px]">
            <GovernanceGlobe />
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber" />
                <span className="text-terminal-muted">In force / enacted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan" />
                <span className="text-terminal-muted">Proposed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-terminal-green" />
                <span className="text-terminal-muted">Voluntary framework</span>
              </div>
            </div>
            <p className="text-center font-mono text-xs text-terminal-muted">
              Drag to rotate • The jurisdiction facing you appears below • Tap a dot to jump
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
