'use client';

import { useEffect, useRef, useState } from 'react';
import { Paperclip, ArrowUp, Loader2, ShieldCheck, X, FileText, Check } from 'lucide-react';

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

// Mirror the server limits in /api/documents/upload.
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILES =
  '.pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown';

interface AttachState {
  status: 'idle' | 'uploading' | 'done' | 'error';
  fileName?: string;
  message?: string;
}

interface SovereignInputProps {
  query: string;
  isLoading: boolean;
  followUpPrompt?: string | null;
  /** Optional actions affordance (the "+" menu) rendered beside the attach button. */
  actionsSlot?: React.ReactNode;
  /** Document upload is a Pro+ feature; free users get an upgrade hint instead. */
  isPaidUser?: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SovereignInput({
  query,
  isLoading,
  followUpPrompt,
  actionsSlot,
  isPaidUser,
  onChange,
  onSubmit,
}: SovereignInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [attach, setAttach] = useState<AttachState>({ status: 'idle' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (followUpPrompt && textareaRef.current) textareaRef.current.focus();
  }, [followUpPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleChange = (value: string) => {
    if (value.length <= MAX_LENGTH) {
      onChange(value);
      if (validationError) setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < MIN_LENGTH) {
      setValidationError(`Please provide at least ${MIN_LENGTH} characters to analyze.`);
      return;
    }
    setValidationError(null);
    onSubmit(e);
  };

  const openFilePicker = () => {
    if (isPaidUser === false) {
      setAttach({ status: 'error', message: 'Upgrade to Pro to attach documents.' });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setAttach({ status: 'error', fileName: file.name, message: 'File too large (max 5MB).' });
      return;
    }

    setAttach({ status: 'uploading', fileName: file.name });
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/documents/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAttach({
          status: 'error',
          fileName: file.name,
          message: data.error ?? 'Upload failed. Please try again.',
        });
        return;
      }
      setAttach({ status: 'done', fileName: file.name });
    } catch {
      setAttach({ status: 'error', fileName: file.name, message: 'Network error. Please try again.' });
    }
  };

  const attachTone =
    attach.status === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : attach.status === 'done'
        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
        : 'border-slate-200 bg-slate-50 text-slate-600';

  return (
    <form onSubmit={handleSubmit}>
      {followUpPrompt && !query.trim() && (
        <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-2">
          <p className="text-[13px] leading-relaxed text-emerald-800">
            <span className="font-semibold">Govi asked:</span> {followUpPrompt}
          </p>
        </div>
      )}

      {attach.status !== 'idle' && (
        <div className={`mb-2 flex items-center gap-2 rounded-lg border px-3.5 py-2 ${attachTone}`}>
          {attach.status === 'uploading' ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : attach.status === 'done' ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <FileText className="h-4 w-4 shrink-0" />
          )}
          <p className="flex-1 text-[13px] leading-snug">
            {attach.status === 'uploading'
              ? `Uploading ${attach.fileName}…`
              : attach.status === 'done'
                ? `${attach.fileName} attached — Govi can reference it in this conversation.`
                : attach.message}
          </p>
          {attach.status !== 'uploading' && (
            <button
              type="button"
              onClick={() => setAttach({ status: 'idle' })}
              aria-label="Dismiss"
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {validationError && (
        <p className="mb-2 px-1 text-xs text-red-500">{validationError}</p>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_2px_16px_rgba(15,23,42,0.06)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(15,23,42,0.1)] focus-within:border-slate-300">
        {actionsSlot}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          aria-label="Attach document"
          title="Attach a document (PDF, DOCX, TXT, MD)"
          onClick={openFilePicker}
          disabled={attach.status === 'uploading'}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {attach.status === 'uploading' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Describe your AI use case, or ask a governance question…"
          disabled={isLoading}
          className="max-h-40 min-h-[40px] flex-grow resize-none self-center bg-transparent px-1 py-2 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          aria-label="Send"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="mt-2.5 flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Grounded in the GovSecure Library
        </span>
        <span className="hidden text-[11px] font-mono text-slate-400 sm:block">
          Press ⌘ + Enter to send
        </span>
      </div>
    </form>
  );
}
