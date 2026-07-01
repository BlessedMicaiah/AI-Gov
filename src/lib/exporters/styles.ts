/**
 * Shared GovSecure brand constants for the Phase 2.6 export pipeline.
 *
 * These are the single source of truth — both the Word and PDF exporters
 * import from here so a brand refresh only touches one file. Values are
 * lifted from `src/app/globals.css` where the on-screen palette is defined.
 *
 * @see GOVI_GOVSECURE_INTEGRATION_PLAN.md — Phase 2.6.1
 */

/** Hex (sans #) — `docx` and `jspdf` both want bare hex. */
export const BRAND_COLORS = {
  /** Document body / standard prose. */
  textPrimary: '1A1A1A',
  /** Muted text: footers, generated-on, page numbers. */
  textMuted: '666666',
  /** Headings + accent rules. Mapped to GovSecure terminal-green (light). */
  accent: '00AA55',
  /** Slightly darker accent for hover/secondary highlights. */
  accentDim: '008844',
  /** Page background — left white for print, but constants kept for parity. */
  bg: 'FFFFFF',
  /** Section divider lines. */
  divider: 'CCCCCC',
  /** White — banner/cover text on the deep-green fill. */
  white: 'FFFFFF',
  /** Vivid governance-green used as a cover/banner fill (white text on top). */
  banner: '0B7A45',
  /** Deep cover background (parity with the PDF cover page). */
  coverBg: '0B1A12',
  /** Light-green wash behind section heading bands. */
  accentSoft: 'E7F7EF',
  /** Neutral wash for callout / license boxes. */
  panel: 'F4F7F5',
  /** Border for washed panels. */
  panelBorder: 'DCE4DF',
} as const;

/**
 * Risk-tier colour coding (bare hex). Shared by the Word + PDF exporters so a
 * tier badge looks identical across formats.
 */
export const RISK_TIER_COLORS: Record<string, string> = {
  Low: '1F9D63',
  Medium: 'D99A0B',
  High: 'E1670E',
  Critical: 'D7263D',
};

/** Resolve a tier label to its brand colour, defaulting to the accent green. */
export function riskTierColor(tier: string): string {
  return RISK_TIER_COLORS[tier] ?? BRAND_COLORS.accent;
}

export const BRAND_FONTS = {
  /** Body / prose default. Chosen because every Office install ships it. */
  body: 'Calibri',
  /** Accent font for headings — Calibri Light reads well on screen and in print. */
  heading: 'Calibri Light',
  /** Mono font for inline document codes. */
  mono: 'Consolas',
} as const;

/**
 * Heading sizes in **half-points** (the unit `docx` accepts).
 * 1 pt = 2 half-points.
 *   Title  → 36pt = 72 hp
 *   H1     → 24pt = 48 hp
 *   H2     → 18pt = 36 hp
 *   H3     → 14pt = 28 hp
 *   H4     → 12pt = 24 hp
 *   Body   → 11pt = 22 hp
 *   Footer →  9pt = 18 hp
 */
export const FONT_SIZES_HALF_PT = {
  title: 72,
  h1: 48,
  h2: 36,
  h3: 28,
  h4: 24,
  body: 22,
  footer: 18,
} as const;

/** Same sizes in **points** for jsPDF. */
export const FONT_SIZES_PT = {
  title: 36,
  h1: 24,
  h2: 18,
  h3: 14,
  h4: 12,
  body: 11,
  footer: 9,
} as const;

/** Spacing in **twips** (1 inch = 1440 twips). */
export const PAGE_MARGINS_TWIPS = {
  top: 1440,
  right: 1440,
  bottom: 1440,
  left: 1440,
} as const;

/** Boilerplate confidentiality stamp shown on every page footer. */
export const CONFIDENTIALITY_NOTICE = 'Confidential — Internal Use Only';

/** Trailing brand line on every page footer. */
export const BRAND_FOOTER_TAGLINE = 'GovSecure AI Governance';
