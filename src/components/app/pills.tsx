const RISK_PILL: Record<string, string> = {
  high: "text-terminal-red bg-terminal-red/10 border-terminal-red/40",
  moderate: "text-terminal-amber bg-terminal-amber/10 border-terminal-amber/40",
  low: "text-terminal-green bg-terminal-green/10 border-terminal-green/40",
};

const RISK_LABELS: Record<string, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
};

/** Severity pill for the NIST impact tiers (High / Moderate / Low). */
export function RiskPill({ risk }: { risk: string }) {
  const style = RISK_PILL[risk] ?? RISK_PILL.moderate;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {RISK_LABELS[risk] ?? risk}
    </span>
  );
}

const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  piloting: "Piloting",
  production: "Production",
  retired: "Retired",
};

/** Neutral pill for an AI system's lifecycle stage. */
export function StagePill({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-terminal-border bg-terminal-gray/30 px-2.5 py-0.5 font-mono text-xs text-terminal-muted">
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}
