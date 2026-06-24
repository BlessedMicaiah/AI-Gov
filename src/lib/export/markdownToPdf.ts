/**
 * Convert markdown text to a branded, print-ready PDF buffer.
 *
 * Used as the fallback export path for artefacts that don't round-trip to a
 * structured `GovernanceDocumentOutput` (playbooks, intakes, ad-hoc docs).
 * Shares the GovSecure visual language with the branded exporter: title block
 * with an accent rule, a running header band, accent-coloured headings, and a
 * page-numbered footer.
 *
 * Uses `jspdf` for server-side PDF generation. Handles headings, paragraphs,
 * bullet & numbered lists, and bold markers.
 */

import { jsPDF } from 'jspdf';

import { BRAND_COLORS, BRAND_FOOTER_TAGLINE, CONFIDENTIALITY_NOTICE } from '@/lib/exporters/styles';

interface PdfOptions {
  title: string;
  /** Footer branding text. Default: GovSecure tagline. */
  branding?: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

const C = {
  text: hexToRgb(BRAND_COLORS.textPrimary),
  muted: hexToRgb(BRAND_COLORS.textMuted),
  accent: hexToRgb(BRAND_COLORS.accent),
  accentDim: hexToRgb(BRAND_COLORS.accentDim),
  divider: hexToRgb(BRAND_COLORS.divider),
};

/**
 * Convert a markdown string to a PDF buffer.
 */
export async function markdownToPdf(markdown: string, options: PdfOptions): Promise<Buffer> {
  const { title, branding = BRAND_FOOTER_TAGLINE } = options;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 18;
  const marginRight = 18;
  const marginTop = 26;
  const marginBottom = 22;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const totalPagesAlias = '{tp}';

  let y = marginTop;
  let firstPage = true;

  const setColor = (c: RGB) => doc.setTextColor(c.r, c.g, c.b);

  const addHeaderBand = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(C.accent);
    doc.text('GovSecure', marginLeft, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setColor(C.muted);
    const t = title.length > 70 ? `${title.slice(0, 69)}…` : title;
    doc.text(t, marginLeft + doc.getTextWidth('GovSecure') + 4, 14);
    doc.setDrawColor(C.divider.r, C.divider.g, C.divider.b);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, 18, pageWidth - marginRight, 18);
    // accent spine
    doc.setFillColor(C.accent.r, C.accent.g, C.accent.b);
    doc.rect(0, 20, 4, pageHeight - 40, 'F');
  };

  const addFooter = () => {
    const footerY = pageHeight - 12;
    doc.setDrawColor(C.divider.r, C.divider.g, C.divider.b);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 4, pageWidth - marginRight, footerY - 4);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(C.muted);
    doc.text(`${branding}  ·  ${CONFIDENTIALITY_NOTICE}`, marginLeft, footerY);
    doc.text(
      `Page ${doc.getNumberOfPages()} of ${totalPagesAlias}`,
      pageWidth - marginRight,
      footerY,
      { align: 'right' },
    );
    setColor(C.text);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
      addHeaderBand();
      addFooter();
    }
  };

  // ── Title block (page 1) ──
  doc.setFillColor(C.accent.r, C.accent.g, C.accent.b);
  doc.rect(marginLeft, y, 22, 1.4, 'F');
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(C.accent);
  doc.text('GOVSECURE AI GOVERNANCE', marginLeft, y, { charSpace: 0.6 });
  y += 9;

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  setColor(C.text);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, marginLeft, y);
  y += titleLines.length * 9 + 3;

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'italic');
  setColor(C.muted);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, marginLeft, y);
  y += 6;

  doc.setDrawColor(C.divider.r, C.divider.g, C.divider.b);
  doc.setLineWidth(0.4);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 9;

  // Footer on page 1 (header band is reserved for continuation pages).
  addFooter();
  firstPage = false;
  void firstPage;

  // ── Parse and render markdown ──
  const lines = markdown.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      y += 3;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      checkPageBreak(9);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      setColor(C.accentDim);
      doc.text(trimmed.slice(5), marginLeft, y);
      y += 6;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      checkPageBreak(11);
      y += 2;
      doc.setFontSize(12.5);
      doc.setFont('helvetica', 'bold');
      setColor(C.accentDim);
      doc.text(trimmed.slice(4), marginLeft, y);
      y += 7;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      checkPageBreak(14);
      y += 4;
      doc.setFontSize(14.5);
      doc.setFont('helvetica', 'bold');
      setColor(C.accent);
      const text = trimmed.slice(3);
      doc.text(text, marginLeft, y);
      y += 3;
      doc.setDrawColor(C.accent.r, C.accent.g, C.accent.b);
      doc.setLineWidth(0.6);
      doc.line(marginLeft, y, marginLeft + 16, y);
      y += 6;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      checkPageBreak(16);
      y += 5;
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      setColor(C.text);
      doc.text(trimmed.slice(2), marginLeft, y);
      y += 9;
      continue;
    }

    // Bullet list
    if (/^[-*] /.test(trimmed)) {
      const text = stripInline(trimmed.slice(2));
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setColor(C.text);
      const wrapped = doc.splitTextToSize(text, contentWidth - 8);
      checkPageBreak(wrapped.length * 5 + 2);
      doc.setTextColor(C.accent.r, C.accent.g, C.accent.b);
      doc.text('•', marginLeft + 2, y);
      setColor(C.text);
      doc.text(wrapped, marginLeft + 8, y);
      y += wrapped.length * 5 + 1.5;
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      const text = stripInline(numMatch[2]);
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(text, contentWidth - 10);
      checkPageBreak(wrapped.length * 5 + 2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(C.accent.r, C.accent.g, C.accent.b);
      doc.text(`${numMatch[1]}.`, marginLeft + 2, y);
      doc.setFont('helvetica', 'normal');
      setColor(C.text);
      doc.text(wrapped, marginLeft + 10, y);
      y += wrapped.length * 5 + 1.5;
      continue;
    }

    // Paragraph
    const plainText = stripInline(trimmed);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(C.text);
    const wrapped = doc.splitTextToSize(plainText, contentWidth);
    checkPageBreak(wrapped.length * 5 + 2);
    doc.text(wrapped, marginLeft, y);
    y += wrapped.length * 5 + 2.5;
  }

  if (typeof (doc as unknown as { putTotalPages?: unknown }).putTotalPages === 'function') {
    doc.putTotalPages(totalPagesAlias);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

function stripInline(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}
