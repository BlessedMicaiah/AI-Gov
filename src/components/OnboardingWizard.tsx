'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';
import { OCCUPATIONAL_ROLES } from '@/lib/occupationalRoles';

const AI_TOOLS = [
  'ChatGPT / OpenAI',
  'Microsoft Copilot',
  'Google Gemini',
  'GitHub Copilot',
  'Custom AI models',
  'AI in HR/recruiting',
  'AI in customer support',
  'AI in marketing',
];

const CONCERNS = [
  { value: 'data-privacy', label: 'Data privacy & GDPR compliance' },
  { value: 'regulatory-risk', label: 'Regulatory risk (EU AI Act, NIST)' },
  { value: 'vendor-risk', label: 'Vendor & third-party AI risk' },
  { value: 'bias-fairness', label: 'Bias, fairness & ethical AI' },
  { value: 'security', label: 'AI security & misuse prevention' },
  { value: 'governance', label: 'Internal AI governance & policies' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  const persistAnswers = async () => {
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiTools: selectedTools,
          primaryConcern: selectedConcerns.length > 0 ? selectedConcerns.join(', ') : undefined,
          occupationalRole: selectedRole || undefined,
        }),
      });
      if (!res.ok) {
        console.error('Failed to persist onboarding answers', res.status);
      }
    } catch (err) {
      console.error('Failed to persist onboarding answers', err);
    }
  };

  const handleSkip = async () => {
    await persistAnswers();
    onComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    await persistAnswers();

    const tools = selectedTools.length > 0 ? selectedTools.join(', ') : 'various AI tools';
    const concernLabels = selectedConcerns.map(
      (value) => CONCERNS.find((c) => c.value === value)?.label ?? value
    );
    const concerns = concernLabels.length > 0 ? concernLabels.join('; ') : 'general AI governance';
    const query = `We use ${tools} at our business. Our primary AI governance concern${concernLabels.length > 1 ? 's are' : ' is'}: ${concerns}. What governance steps should we take and what are the key risks we need to address?`;

    onComplete();
    router.push(`/govi?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg terminal-window glow-green">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="ml-4 text-xs text-terminal-muted font-mono">setup_wizard.sh</span>
          <button
            onClick={handleSkip}
            className="ml-auto text-terminal-muted hover:text-terminal-text transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-terminal-green' : 'bg-terminal-border'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-terminal-green' : 'bg-terminal-border'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-terminal-green' : 'bg-terminal-border'}`} />
          </div>

          {step === 1 && (
            <>
              <p className="font-mono text-terminal-green text-xs uppercase tracking-wider mb-1">Step 1 of 3</p>
              <h2 className="font-mono text-lg font-bold text-terminal-text mb-1">
                Which AI tools does your business use?
              </h2>
              <p className="text-sm text-terminal-muted font-sans mb-5">Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`text-left px-3 py-2.5 rounded border font-mono text-xs transition-colors ${
                      selectedTools.includes(tool)
                        ? 'border-terminal-green bg-terminal-green/10 text-terminal-green'
                        : 'border-terminal-border text-terminal-muted hover:border-terminal-green/50 hover:text-terminal-text'
                    }`}
                  >
                    {selectedTools.includes(tool) ? '✓ ' : ''}{tool}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={handleSkip} className="text-xs font-mono text-terminal-muted hover:text-terminal-text transition-colors">
                  Skip for now
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-terminal-green text-terminal-black font-mono text-sm font-bold rounded hover:bg-terminal-green/90 transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="font-mono text-terminal-green text-xs uppercase tracking-wider mb-1">Step 2 of 3</p>
              <h2 className="font-mono text-lg font-bold text-terminal-text mb-1">
                What are your primary AI governance concerns?
              </h2>
              <p className="text-sm text-terminal-muted font-sans mb-5">Select all that apply.</p>
              <div className="space-y-2 mb-6">
                {CONCERNS.map((concern) => (
                  <button
                    key={concern.value}
                    onClick={() => toggleConcern(concern.value)}
                    className={`w-full text-left px-4 py-3 rounded border font-mono text-sm transition-colors ${
                      selectedConcerns.includes(concern.value)
                        ? 'border-terminal-green bg-terminal-green/10 text-terminal-green'
                        : 'border-terminal-border text-terminal-muted hover:border-terminal-green/50 hover:text-terminal-text'
                    }`}
                  >
                    {selectedConcerns.includes(concern.value) ? '✓ ' : '○ '}{concern.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-xs font-mono text-terminal-muted hover:text-terminal-text transition-colors">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedConcerns.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-terminal-green text-terminal-black font-mono text-sm font-bold rounded hover:bg-terminal-green/90 transition-colors disabled:opacity-50"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="font-mono text-terminal-green text-xs uppercase tracking-wider mb-1">Step 3 of 3</p>
              <h2 className="font-mono text-lg font-bold text-terminal-text mb-1">
                What&apos;s your role?
              </h2>
              <p className="text-sm text-terminal-muted font-sans mb-5">
                We tailor clarifying questions and assessments to your lens.
              </p>
              <div className="space-y-2 mb-6">
                {OCCUPATIONAL_ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRole(r.value)}
                    className={`w-full text-left px-4 py-3 rounded border font-mono text-sm transition-colors ${
                      selectedRole === r.value
                        ? 'border-terminal-green bg-terminal-green/10 text-terminal-green'
                        : 'border-terminal-border text-terminal-muted hover:border-terminal-green/50 hover:text-terminal-text'
                    }`}
                  >
                    {selectedRole === r.value ? '● ' : '○ '}{r.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-xs font-mono text-terminal-muted hover:text-terminal-text transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!selectedRole || loading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-terminal-green text-terminal-black font-mono text-sm font-bold rounded hover:bg-terminal-green/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Starting…' : 'Start My Assessment'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}