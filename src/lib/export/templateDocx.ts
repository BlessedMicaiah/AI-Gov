/**
 * Browser-side colourful DOCX generator for the free landing-page templates.
 *
 * The guest landing page ships a set of plain-text governance templates (AI
 * inventory, intake form, risk assessment, …). This module turns one of those
 * plain-text bodies into a polished, modern Word document — a green cover
 * banner, shaded section bands with an accent spine, field rows, checkbox
 * lists, and a branded page footer — and streams it to the browser as a
 * `.docx` download.
 *
 * Runs entirely client-side via `Packer.toBlob`; `docx` is dynamically
 * imported by the caller so it stays out of the initial bundle.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

import {
  BRAND_COLORS,
  BRAND_FONTS,
  BRAND_FOOTER_TAGLINE,
  FONT_SIZES_HALF_PT,
} from '@/lib/exporters/styles';

// ─── Line classification ──────────────────────────────────────────────────────

type Line =
  | { kind: 'divider' }
  | { kind: 'section'; text: string }
  | { kind: 'subhead'; text: string }
  | { kind: 'field'; label: string; value: string }
  | { kind: 'checkbox'; text: string }
  | { kind: 'bullet'; text: string }
  | { kind: 'paragraph'; text: string };

const DIVIDER_RE = /^[─—=_*-]{6,}$/;
const FIELD_RE = /_{3,}/;
const SKIP_RE = /generated (by|free by) govsecure/i;

function classify(raw: string): Line | null {
  const line = raw.replace(/\s+$/, '');
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (DIVIDER_RE.test(trimmed)) return { kind: 'divider' };
  if (SKIP_RE.test(trimmed)) return null;

  // Field row: "LABEL:        ______" — detect the underscore run first so
  // it isn't mistaken for an all-caps heading.
  if (FIELD_RE.test(trimmed)) {
    const idx = trimmed.search(/_{3,}/);
    const label = trimmed.slice(0, idx).replace(/[:\s]+$/, '').trim();
    return { kind: 'field', label, value: '________________________________' };
  }

  // Checkbox / bullet items.
  if (/^[□☐☒]/.test(trimmed)) return { kind: 'checkbox', text: trimmed.replace(/^[□☐☒]\s*/, '') };
  if (/^[•·*-]\s+/.test(trimmed)) return { kind: 'bullet', text: trimmed.replace(/^[•·*-]\s+/, '') };

  // Major section band: ALL-CAPS, no colon, mostly letters.
  const letters = trimmed.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 2 && trimmed === trimmed.toUpperCase() && !trimmed.includes(':')) {
    return { kind: 'section', text: trimmed };
  }

  // Sub-heading: a label line ending in a colon (e.g. "RISK TIER (tick one):").
  if (/:$/.test(trimmed)) return { kind: 'subhead', text: trimmed.replace(/:$/, '') };

  return { kind: 'paragraph', text: trimmed };
}

// ─── Builders ──────────────────────────────────────────────────────────────

/** Green cover banner with the template title + brand line, edge to edge. */
function coverBanner(title: string, dateLabel: string): Table {
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' } as const;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
      insideHorizontal: noBorder, insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: 'auto', fill: BRAND_COLORS.banner },
            margins: { top: 260, bottom: 260, left: 280, right: 280 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: 'GOVSECURE · AI GOVERNANCE',
                    font: BRAND_FONTS.body,
                    size: 16,
                    bold: true,
                    color: BRAND_COLORS.white,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: title,
                    font: BRAND_FONTS.heading,
                    size: FONT_SIZES_HALF_PT.title,
                    bold: true,
                    color: BRAND_COLORS.white,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Free governance template  ·  Generated ${dateLabel}`,
                    font: BRAND_FONTS.body,
                    size: 18,
                    color: 'D9F2E5',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Shaded section band with an accent left spine. */
function sectionBand(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    shading: { type: ShadingType.SOLID, color: 'auto', fill: BRAND_COLORS.accentSoft },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: BRAND_COLORS.accent, space: 8 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: BRAND_FONTS.heading,
        size: FONT_SIZES_HALF_PT.h2,
        bold: true,
        color: BRAND_COLORS.accentDim,
      }),
    ],
  });
}

function subHead(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [
      new TextRun({
        text,
        font: BRAND_FONTS.heading,
        size: FONT_SIZES_HALF_PT.h4,
        bold: true,
        color: BRAND_COLORS.textPrimary,
      }),
    ],
  });
}

function fieldRow(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 70, after: 70 },
    children: [
      new TextRun({ text: `${label}:  `, font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.body, bold: true, color: BRAND_COLORS.textPrimary }),
      new TextRun({ text: value, font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.body, color: BRAND_COLORS.divider }),
    ],
  });
}

function checkboxItem(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 220 },
    children: [
      new TextRun({ text: '☐  ', font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.body, color: BRAND_COLORS.accent, bold: true }),
      new TextRun({ text, font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.body, color: BRAND_COLORS.textPrimary }),
    ],
  });
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    bullet: { level: 0 },
    children: [new TextRun({ text, font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.body, color: BRAND_COLORS.textPrimary })],
  });
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.body, color: BRAND_COLORS.textPrimary })],
  });
}

function brandedFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${BRAND_FOOTER_TAGLINE}  ·  govsecure.ai  ·  Page `, font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.footer, color: BRAND_COLORS.textMuted }),
          new TextRun({ children: [PageNumber.CURRENT], font: BRAND_FONTS.body, size: FONT_SIZES_HALF_PT.footer, color: BRAND_COLORS.textMuted }),
        ],
      }),
    ],
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a colourful DOCX Blob from a plain-text template body.
 * `content` is the raw template string; its first line is treated as the title
 * unless `title` is supplied.
 */
export async function buildTemplateDocxBlob(content: string, title?: string): Promise<Blob> {
  const rawLines = content.split('\n');
  const resolvedTitle = (title ?? rawLines.find((l) => l.trim())?.trim() ?? 'GovSecure Template')
    .replace(/\s+/g, ' ')
    .trim();
  const dateLabel = new Date().toLocaleDateString();

  // Skip the title line itself so it isn't repeated in the body.
  const titleSeen = { done: false };
  const children: (Paragraph | Table)[] = [coverBanner(resolvedTitle, dateLabel), new Paragraph({ spacing: { after: 160 }, children: [] })];

  for (const raw of rawLines) {
    const line = classify(raw);
    if (!line) continue;
    if (!titleSeen.done && line.kind !== 'divider') {
      // First meaningful line is the title — already in the banner.
      titleSeen.done = true;
      if (line.kind === 'section' || line.kind === 'paragraph') continue;
    }
    switch (line.kind) {
      case 'divider': break; // section bands provide the visual breaks
      case 'section': children.push(sectionBand(line.text)); break;
      case 'subhead': children.push(subHead(line.text)); break;
      case 'field': children.push(fieldRow(line.label, line.value)); break;
      case 'checkbox': children.push(checkboxItem(line.text)); break;
      case 'bullet': children.push(bulletItem(line.text)); break;
      case 'paragraph': children.push(bodyParagraph(line.text)); break;
    }
  }

  const doc = new Document({
    creator: 'GovSecure',
    title: resolvedTitle,
    description: 'GovSecure free AI-governance template',
    styles: {
      default: {
        heading2: { run: { font: BRAND_FONTS.heading } },
      },
    },
    sections: [
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children,
        footers: { default: brandedFooter() },
      },
    ],
  });

  return Packer.toBlob(doc) as Promise<Blob>;
}

/** Build the DOCX and trigger a browser download. */
export async function downloadTemplateDocx(content: string, filename: string, title?: string): Promise<void> {
  const blob = await buildTemplateDocxBlob(content, title);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
