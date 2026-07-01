'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { AdvisorView } from './Advisor';
import { SovereignConsole } from './sovereign/SovereignConsole';
import { useGoviSession } from './useGoviSession';
import { useGoviInterface, type GoviInterface } from './useGoviInterface';

interface GoviExperienceProps {
  initialQuery?: string;
  initialConversationId?: string;
}

const SWITCH_ITEMS: { id: GoviInterface; label: string }[] = [
  { id: 'terminal', label: 'Classic' },
  { id: 'sovereign', label: 'Console' },
];

/**
 * Segmented control for switching Govi's interface skin in place. Because the
 * session lives in {@link GoviExperience} (above both skins), toggling here
 * swaps the skin without dropping the conversation thread or context.
 */
function InterfaceSwitch({
  preference,
  onSelect,
  variant,
}: {
  preference: GoviInterface;
  onSelect: (next: GoviInterface) => void;
  variant: 'dark' | 'light';
}) {
  const container =
    variant === 'dark'
      ? 'inline-flex items-center gap-0.5 rounded-md border border-terminal-border bg-terminal-black/60 p-0.5'
      : 'inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100/80 p-0.5';

  return (
    <div role="group" aria-label="Govi interface style" className={container}>
      {SWITCH_ITEMS.map((item) => {
        const active = preference === item.id;
        const cls =
          variant === 'dark'
            ? active
              ? 'bg-terminal-green/15 text-terminal-green'
              : 'text-terminal-muted hover:text-terminal-text'
            : active
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800';
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(item.id)}
            className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${cls}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Picks the Govi interface skin for the current user and owns the shared
 * session so the skin can be switched without losing the conversation.
 *
 * Registered users can flip between the classic terminal `Advisor` and the
 * full-bleed "sovereign" console via an in-place toggle; guests always get the
 * terminal skin. The session (thread, active conversation, streaming state)
 * lives here, above both skins, so switching never remounts it. The preference
 * resolves from a localStorage cache first for a flicker-free first paint, then
 * reconciles with the server-persisted value.
 */
export function GoviExperience({ initialQuery, initialConversationId }: GoviExperienceProps) {
  const govi = useGoviSession({ initialQuery, initialConversationId });
  const { preference, setInterface, isAuthenticated } = useGoviInterface();

  if (isAuthenticated && preference === 'sovereign') {
    return (
      <SovereignConsole
        session={govi}
        interfaceToggle={
          <InterfaceSwitch preference={preference} onSelect={setInterface} variant="light" />
        }
      />
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="sticky top-16 z-10 border-b border-terminal-border bg-terminal-black/80 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div>
            <h1 className="font-mono text-sm font-bold text-terminal-green">
              Govi — AI Governance Advisor
            </h1>
            <p className="mt-0.5 font-mono text-xs text-terminal-muted">
              Anchored by the GovSecure Governance Library
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <InterfaceSwitch preference={preference} onSelect={setInterface} variant="dark" />
            )}
            <Link
              href="/govi/library"
              className="hidden items-center gap-1.5 rounded border border-terminal-border px-2.5 py-1 font-mono text-xs text-terminal-muted transition-colors hover:border-terminal-green hover:text-terminal-green sm:flex"
            >
              <BookOpen className="h-3 w-3" />
              GovSecure Library
            </Link>
          </div>
        </div>
      </div>

      <AdvisorView session={govi} showHeader={false} />
    </div>
  );
}
