import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Markdown } from "tiptap-markdown";
import {
  FileText, FileUp, Download, Printer, Check, Code,
  Type, Paintbrush, Palette, Columns, ChevronDown, X,
  Bold, Italic, Strikethrough, Link2, Heading1, Heading2, Heading3,
  Trash2, LayoutTemplate, Copy,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface PresetConfig {
  name: string;
  bodyFont: string;
  headingFont: string;
  fontSize: number;
  lineHeight: number;
  pageWidth: number;
  marginH: number;
  marginV: number;
  textColor: string;
  headingColor: string;
  accentColor: string;
  paperColor: string;
  codeBg: string;
  codeColor: string;
  codeFont: string;
  borderColor: string;
  h1Size: number;
  h1Weight: number;
  h1BorderBottom: boolean;
  h2Size: number;
  h2Weight: number;
  h3Size: number;
  h3Weight: number;
  blockquoteBorderColor: string;
  blockquoteBg: string;
  blockquoteColor: string;
}

interface SavedStyle {
  id: string;
  name: string;
  presetId: string;
  overrides: Partial<PresetConfig>;
  customCSS: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_MARKDOWN = `# The Craft of Typography

Typography is the art and technique of arranging type to make written language legible, readable, and appealing. The arrangement of type involves selecting typefaces, point sizes, line lengths, and spacing.

## Why Typography Matters

Well-set type creates a reading experience that feels natural and effortless. Poor typography creates friction — the reader notices the form instead of absorbing the content.

### The Core Principles

Good typography rests on three pillars: **hierarchy**, **rhythm**, and **contrast**. When these work in harmony, the reader moves through the document with ease.

## Working with Type

Consider these qualities when selecting a typeface:

- **Legibility** — Can individual characters be distinguished easily?
- **Readability** — Is the text comfortable to read in long passages?
- **Personality** — Does the typeface suit the tone of the content?
- **Versatility** — Does it perform across different sizes?

### Code Example

\`\`\`javascript
const typography = {
  heading: "Newsreader",    // Elegant serif for display
  body: "Figtree",          // Clean sans for reading
  mono: "JetBrains Mono",  // Structured for code
};
\`\`\`

## Measurement & Scale

| Unit | Use Case | Example |
|------|----------|---------|
| em | Relative to parent | \`1.5em\` |
| rem | Relative to root | \`1rem\` |
| px | Fixed pixels | \`16px\` |
| pt | Print points | \`12pt\` |

---

> "Typography is the voice of the text — it communicates before the reader reads a single word."

A well-chosen typeface carries meaning beyond its letterforms. Serifs suggest tradition and authority; geometric sans-serifs signal modernity and clarity. Learn more in [The Elements of Typographic Style](https://example.com) by Robert Bringhurst.
`;

const PRESETS: Record<string, PresetConfig> = {
  clean: {
    name: "Clean",
    bodyFont: "'Figtree', -apple-system, sans-serif",
    headingFont: "'Figtree', -apple-system, sans-serif",
    fontSize: 16,
    lineHeight: 1.75,
    pageWidth: 720,
    marginH: 72,
    marginV: 64,
    textColor: "#1c1917",
    headingColor: "#0c0a09",
    accentColor: "#2563eb",
    paperColor: "#ffffff",
    codeBg: "#f8fafc",
    codeColor: "#1e293b",
    codeFont: "'JetBrains Mono', monospace",
    borderColor: "#e4e1da",
    h1Size: 2.0, h1Weight: 600, h1BorderBottom: true,
    h2Size: 1.5, h2Weight: 600,
    h3Size: 1.25, h3Weight: 600,
    blockquoteBorderColor: "#2563eb",
    blockquoteBg: "#eff6ff",
    blockquoteColor: "#1e40af",
  },
  academic: {
    name: "Academic",
    bodyFont: "'Newsreader', Georgia, serif",
    headingFont: "'Newsreader', Georgia, serif",
    fontSize: 17,
    lineHeight: 1.85,
    pageWidth: 680,
    marginH: 80,
    marginV: 80,
    textColor: "#1a1a1a",
    headingColor: "#000000",
    accentColor: "#7c2d12",
    paperColor: "#fffef7",
    codeBg: "#f5f2e8",
    codeColor: "#1a1a1a",
    codeFont: "'JetBrains Mono', monospace",
    borderColor: "#d4ccbc",
    h1Size: 1.9, h1Weight: 400, h1BorderBottom: true,
    h2Size: 1.45, h2Weight: 400,
    h3Size: 1.2, h3Weight: 600,
    blockquoteBorderColor: "#92400e",
    blockquoteBg: "transparent",
    blockquoteColor: "#78716c",
  },
  report: {
    name: "Report",
    bodyFont: "'DM Sans', -apple-system, sans-serif",
    headingFont: "'DM Sans', -apple-system, sans-serif",
    fontSize: 14,
    lineHeight: 1.65,
    pageWidth: 794,
    marginH: 72,
    marginV: 64,
    textColor: "#1f2937",
    headingColor: "#111827",
    accentColor: "#1d4ed8",
    paperColor: "#ffffff",
    codeBg: "#f9fafb",
    codeColor: "#111827",
    codeFont: "'JetBrains Mono', monospace",
    borderColor: "#d1d5db",
    h1Size: 1.75, h1Weight: 700, h1BorderBottom: true,
    h2Size: 1.35, h2Weight: 700,
    h3Size: 1.15, h3Weight: 600,
    blockquoteBorderColor: "#1d4ed8",
    blockquoteBg: "#eff6ff",
    blockquoteColor: "#1e3a8a",
  },
  github: {
    name: "GitHub",
    bodyFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    headingFont: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    fontSize: 16,
    lineHeight: 1.5,
    pageWidth: 800,
    marginH: 48,
    marginV: 48,
    textColor: "#24292f",
    headingColor: "#24292f",
    accentColor: "#0969da",
    paperColor: "#ffffff",
    codeBg: "#f6f8fa",
    codeColor: "#24292f",
    codeFont: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
    borderColor: "#d0d7de",
    h1Size: 2.0, h1Weight: 600, h1BorderBottom: true,
    h2Size: 1.5, h2Weight: 600,
    h3Size: 1.25, h3Weight: 600,
    blockquoteBorderColor: "#d0d7de",
    blockquoteBg: "transparent",
    blockquoteColor: "#57606a",
  },
  minimal: {
    name: "Minimal",
    bodyFont: "'DM Mono', 'Courier New', monospace",
    headingFont: "'DM Mono', 'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.7,
    pageWidth: 640,
    marginH: 48,
    marginV: 60,
    textColor: "#374151",
    headingColor: "#111827",
    accentColor: "#6b7280",
    paperColor: "#f9fafb",
    codeBg: "#f3f4f6",
    codeColor: "#374151",
    codeFont: "'DM Mono', 'Courier New', monospace",
    borderColor: "#e5e7eb",
    h1Size: 1.5, h1Weight: 500, h1BorderBottom: false,
    h2Size: 1.2, h2Weight: 500,
    h3Size: 1.1, h3Weight: 500,
    blockquoteBorderColor: "#9ca3af",
    blockquoteBg: "transparent",
    blockquoteColor: "#6b7280",
  },
};

const BODY_FONTS = [
  { label: "Figtree", value: "'Figtree', -apple-system, sans-serif" },
  { label: "Newsreader", value: "'Newsreader', Georgia, serif" },
  { label: "DM Sans", value: "'DM Sans', -apple-system, sans-serif" },
  { label: "DM Mono", value: "'DM Mono', monospace" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "System UI", value: "-apple-system, BlinkMacSystemFont, sans-serif" },
];

const CODE_FONTS = [
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "DM Mono", value: "'DM Mono', monospace" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Consolas", value: "Consolas, monospace" },
];

const PAPER_COLORS = ["#ffffff", "#fffef7", "#fdf6e3", "#f9fafb", "#f5f5f0", "#fff8f0"];

// ─── CSS Generator ──────────────────────────────────────────────────────────

function generateDocumentCSS(s: PresetConfig, customCSS: string): string {
  const hex = (color: string, alpha: number) => {
    // Append hex alpha to 6-digit hex color
    const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
    return color.startsWith("#") && color.length === 7 ? `${color}${a}` : color;
  };
  return `
    /* ── Paper ── */
    .doc-preview {
      font-family: ${s.bodyFont};
      font-size: ${s.fontSize}px;
      line-height: ${s.lineHeight};
      color: ${s.textColor};
      background: ${s.paperColor};
      max-width: ${s.pageWidth}px;
      padding: ${s.marginV}px ${s.marginH}px;
      margin: 0 auto;
      word-break: break-word;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      cursor: text;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.04);
      min-height: 600px;
    }
    .doc-preview:focus { outline: none; }

    /* ── Placeholder ── */
    .doc-preview p.is-editor-empty:first-child::before,
    .doc-preview h1.is-editor-empty:first-child::before,
    .doc-preview h2.is-editor-empty:first-child::before {
      color: #b0a899;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    /* ── Selection ── */
    .doc-preview ::selection { background: ${hex(s.accentColor, 0.15)}; }

    /* ── First/last child ── */
    .doc-preview > *:first-child { margin-top: 0 !important; }
    .doc-preview > *:last-child { margin-bottom: 0 !important; }

    /* ── Headings ── */
    .doc-preview h1, .doc-preview h2, .doc-preview h3,
    .doc-preview h4, .doc-preview h5, .doc-preview h6 {
      font-family: ${s.headingFont};
      color: ${s.headingColor};
      margin-top: 1.75em;
      margin-bottom: 0.5em;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    .doc-preview h1:first-child,
    .doc-preview h2:first-child { margin-top: 0; }

    .doc-preview h1 {
      font-size: ${s.h1Size}em;
      font-weight: ${s.h1Weight};
      padding-bottom: ${s.h1BorderBottom ? "0.3em" : "0"};
      border-bottom: ${s.h1BorderBottom ? `1px solid ${s.borderColor}` : "none"};
      margin-bottom: ${s.h1BorderBottom ? "0.75em" : "0.5em"};
    }
    .doc-preview h2 { font-size: ${s.h2Size}em; font-weight: ${s.h2Weight}; }
    .doc-preview h3 { font-size: ${s.h3Size}em; font-weight: ${s.h3Weight}; }
    .doc-preview h4 { font-size: 1em; font-weight: 600; }
    .doc-preview h5, .doc-preview h6 { font-size: 0.875em; font-weight: 600; }

    /* ── Body text ── */
    .doc-preview p { margin: 0 0 1em; }
    .doc-preview strong { font-weight: 700; color: ${s.headingColor}; }
    .doc-preview em { font-style: italic; }
    .doc-preview s { text-decoration: line-through; }

    /* ── Links ── */
    .doc-preview a {
      color: ${s.accentColor};
      text-decoration: underline;
      text-underline-offset: 2px;
      text-decoration-thickness: 1px;
      cursor: pointer;
    }
    .doc-preview a:hover { opacity: 0.75; }

    /* ── Lists ── */
    .doc-preview ul, .doc-preview ol {
      padding-left: 1.75em;
      margin: 0 0 1em;
    }
    .doc-preview li { margin: 0.3em 0; }
    .doc-preview li > p { margin-bottom: 0.25em; }
    .doc-preview ul { list-style-type: disc; }
    .doc-preview ul ul { list-style-type: circle; }
    .doc-preview ol { list-style-type: decimal; }

    /* ── Task lists ── */
    .doc-preview ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0;
    }
    .doc-preview ul[data-type="taskList"] > li {
      display: flex;
      align-items: flex-start;
      gap: 0.6em;
      margin: 0.35em 0;
    }
    .doc-preview ul[data-type="taskList"] > li > label {
      flex-shrink: 0;
      margin-top: 0.15em;
      user-select: none;
      cursor: pointer;
    }
    .doc-preview ul[data-type="taskList"] > li > label input[type="checkbox"] {
      width: 14px;
      height: 14px;
      accent-color: ${s.accentColor};
      cursor: pointer;
    }
    .doc-preview ul[data-type="taskList"] > li > div { flex: 1; }
    .doc-preview ul[data-type="taskList"] > li[data-checked="true"] > div {
      text-decoration: line-through;
      opacity: 0.55;
    }

    /* ── Blockquote ── */
    .doc-preview blockquote {
      border-left: 3px solid ${s.blockquoteBorderColor};
      background: ${s.blockquoteBg};
      margin: 1.25em 0;
      padding: 0.85em 1.25em;
      color: ${s.blockquoteColor};
      border-radius: 0 4px 4px 0;
    }
    .doc-preview blockquote p:last-child { margin-bottom: 0; }

    /* ── Code ── */
    .doc-preview code {
      font-family: ${s.codeFont};
      font-size: 0.85em;
    }
    .doc-preview :not(pre) > code {
      background: ${s.codeBg};
      color: ${s.codeColor};
      padding: 0.15em 0.45em;
      border-radius: 4px;
      border: 1px solid ${s.borderColor};
    }
    .doc-preview pre {
      background: ${s.codeBg};
      border: 1px solid ${s.borderColor};
      border-radius: 8px;
      padding: 1.25em 1.5em;
      overflow-x: auto;
      margin: 1.25em 0;
      position: relative;
    }
    .doc-preview pre code {
      background: none;
      border: none;
      padding: 0;
      color: ${s.codeColor};
      font-size: 0.875em;
      line-height: 1.65;
    }
    /* Language label via data attribute */
    .doc-preview pre[data-language]::before {
      content: attr(data-language);
      position: absolute;
      top: 0.6em;
      right: 1em;
      font-size: 0.7em;
      font-family: ${s.codeFont};
      color: ${s.codeColor};
      opacity: 0.4;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Tables ── */
    .doc-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.25em 0;
      font-size: 0.9em;
      table-layout: auto;
    }
    .doc-preview table th, .doc-preview table td {
      border: 1px solid ${s.borderColor};
      padding: 0.55em 0.85em;
      text-align: left;
      vertical-align: top;
      min-width: 80px;
    }
    .doc-preview table th {
      background: ${s.codeBg};
      font-weight: 600;
      color: ${s.headingColor};
      font-size: 0.85em;
      letter-spacing: 0.02em;
    }
    .doc-preview table tbody tr:nth-child(even) { background: ${hex(s.codeBg, 0.5)}; }
    .doc-preview table p { margin: 0; }

    /* ── Tiptap table selected cell ── */
    .doc-preview .selectedCell::after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0; right: 0; top: 0; bottom: 0;
      background: ${hex(s.accentColor, 0.1)};
      pointer-events: none;
    }
    .doc-preview td, .doc-preview th { position: relative; }

    /* ── HR ── */
    .doc-preview hr {
      border: none;
      border-top: 1px solid ${s.borderColor};
      margin: 2em 0;
    }

    /* ── Images ── */
    .doc-preview img { max-width: 100%; border-radius: 6px; height: auto; }

    /* ── ProseMirror node selection ── */
    .doc-preview .ProseMirror-selectednode {
      outline: 2px solid ${s.accentColor};
      outline-offset: 2px;
    }

    /* ── Gap cursor ── */
    .doc-preview .ProseMirror-gapcursor {
      display: none;
      pointer-events: none;
      position: absolute;
    }
    .doc-preview .ProseMirror-gapcursor::after {
      content: "";
      display: block;
      position: absolute;
      top: -2px;
      width: 20px;
      border-top: 1px solid ${s.textColor};
      animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    }
    @keyframes ProseMirror-cursor-blink { to { visibility: hidden; } }
    .doc-preview.ProseMirror-focused .ProseMirror-gapcursor { display: block; }

    /* ── Column resize handle ── */
    .doc-preview .column-resize-handle { display: none; }

    ${customCSS}
  `;
}

// ─── Sidebar helpers ─────────────────────────────────────────────────────────

function SidebarAccordion({
  title, icon, isOpen, onToggle, children,
}: {
  title: string; icon: React.ReactNode;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black/5 transition-colors text-left"
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <ChevronDown
          size={13}
          className={`text-muted-foreground/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0.5 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function SliderControl({
  label, value, min, max, step = 1,
  format = (v: number) => String(v),
  onChange,
}: {
  label: string; value: number; min: number; max: number;
  step?: number; format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-mono text-foreground/70 tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="doc-slider w-full"
      />
    </div>
  );
}

function ColorControl({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono text-muted-foreground">{value.toLowerCase()}</span>
        <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border cursor-pointer">
          <div className="absolute inset-0" style={{ background: value }} />
          <input
            type="color" value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

function SelectControl({ label, value, options, onChange }: {
  label: string; value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] px-2.5 py-1.5 rounded-md border border-border bg-input-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent appearance-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "28px",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── CSS Editor Modal ────────────────────────────────────────────────────────

function CSSEditorModal({
  customCSS, onSave, onClose,
  savedStyles, onSaveStyle, onLoadStyle, onDeleteStyle,
}: {
  customCSS: string;
  onSave: (css: string) => void;
  onClose: () => void;
  savedStyles: SavedStyle[];
  onSaveStyle: (name: string, css: string) => void;
  onLoadStyle: (style: SavedStyle) => void;
  onDeleteStyle: (id: string) => void;
}) {
  const [css, setCss] = useState(customCSS);
  const [styleName, setStyleName] = useState("");
  const [tab, setTab] = useState<"editor" | "saved">("editor");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div
        className="bg-card border border-border rounded-xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "80vh", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <Code size={14} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold flex-1">CSS Editor</h2>
          <div className="flex rounded-lg border border-border overflow-hidden text-[11px] font-medium">
            <button
              onClick={() => setTab("editor")}
              className={`px-3 py-1.5 transition-colors ${tab === "editor" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              Edit CSS
            </button>
            <button
              onClick={() => setTab("saved")}
              className={`px-3 py-1.5 transition-colors border-l border-border ${tab === "saved" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              Saved ({savedStyles.length})
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors ml-1">
            <X size={14} />
          </button>
        </div>

        {tab === "editor" ? (
          <>
            <div className="px-5 py-2 border-b border-border bg-muted/30 flex-shrink-0">
              <p className="text-[11px] text-muted-foreground">
                Target <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">.doc-preview</code> and its children to override document styles.
              </p>
            </div>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              className="flex-1 p-5 resize-none bg-background text-foreground focus:outline-none leading-relaxed min-h-[280px] text-[12px]"
              placeholder={`.doc-preview h1 {\n  letter-spacing: -0.03em;\n}\n\n.doc-preview blockquote {\n  font-style: italic;\n}`}
              spellCheck={false}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-t border-border flex-shrink-0">
              <input
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                placeholder="Name this style…"
                className="flex-1 text-[11px] px-3 py-1.5 rounded-md border border-border bg-input-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/60"
              />
              <button
                onClick={() => {
                  if (styleName.trim()) { onSaveStyle(styleName.trim(), css); setStyleName(""); }
                }}
                disabled={!styleName.trim()}
                className="px-3 py-1.5 text-[11px] border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-40"
              >
                Save Style
              </button>
              <button
                onClick={() => { onSave(css); onClose(); }}
                className="px-4 py-1.5 text-[11px] font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[280px]">
            {savedStyles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Paintbrush size={22} className="text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No saved styles yet.</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Write CSS and save it to reuse it later.</p>
              </div>
            ) : (
              savedStyles.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <p className="text-[12px] font-medium">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Based on {PRESETS[s.presetId]?.name}</p>
                  </div>
                  <button
                    onClick={() => { onLoadStyle(s); onClose(); }}
                    className="text-[11px] px-3 py-1.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDeleteStyle(s.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bubble Menu Bar ─────────────────────────────────────────────────────────

function BubbleMenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const handleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL:");
    if (url?.trim()) {
      editor.chain().focus().setLink({ href: url.trim() }).run();
    }
  };

  const btn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
        active
          ? "bg-white/20 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 shadow-xl"
      style={{
        background: "rgba(20,18,16,0.92)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Bold (⌘B)", <Bold size={13} />)}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Italic (⌘I)", <Italic size={13} />)}
      {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Strikethrough", <Strikethrough size={13} />)}
      {btn(editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), "Inline code", <Code size={13} />)}

      <div className="w-px h-4 bg-white/15 mx-0.5" />

      {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Heading 1", <Heading1 size={13} />)}
      {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Heading 2", <Heading2 size={13} />)}
      {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Heading 3", <Heading3 size={13} />)}

      <div className="w-px h-4 bg-white/15 mx-0.5" />

      {btn(editor.isActive("link"), handleLink, editor.isActive("link") ? "Remove link" : "Add link", <Link2 size={13} />)}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [presetId, setPresetId] = useState("clean");
  const [overrides, setOverrides] = useState<Partial<PresetConfig>>({});
  const [customCSS, setCustomCSS] = useState("");
  const [showCSSEditor, setShowCSSEditor] = useState(false);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>(() => {
    try { return JSON.parse(localStorage.getItem("rendermarkdown-styles") || "[]"); } catch { return []; }
  });
  const [openSections, setOpenSections] = useState(new Set(["presets", "typography"]));
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  const settings = useMemo<PresetConfig>(() => ({
    ...PRESETS[presetId],
    ...overrides,
  }), [presetId, overrides]);

  const docCSS = useMemo(() => generateDocumentCSS(settings, customCSS), [settings, customCSS]);

  // Inject dynamic document CSS
  useEffect(() => {
    if (!styleTagRef.current) {
      const el = document.createElement("style");
      el.id = "rendermarkdown-doc-css";
      document.head.appendChild(el);
      styleTagRef.current = el;
    }
    styleTagRef.current.textContent = docCSS;
  }, [docCSS]);

  useEffect(() => {
    return () => {
      if (styleTagRef.current && document.head.contains(styleTagRef.current)) {
        document.head.removeChild(styleTagRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("rendermarkdown-styles", JSON.stringify(savedStyles));
  }, [savedStyles]);

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false, // we configure our own Link extension below
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: false,
        breaks: false,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "Start writing, or import a Markdown file…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: DEFAULT_MARKDOWN,
    editorProps: {
      attributes: {
        class: "doc-preview",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor: e }) => {
      const text = e.getText().trim();
      setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
    },
    onCreate: ({ editor: e }) => {
      const text = e.getText().trim();
      setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
    },
  });

  const toggleSection = useCallback((s: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }, []);

  const setOverride = useCallback(<K extends keyof PresetConfig>(key: K, value: PresetConfig[K]) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  const selectPreset = useCallback((id: string) => {
    setPresetId(id);
    setOverrides({});
    setCustomCSS("");
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const md = ev.target?.result as string;
      if (md && editor) editor.commands.setContent(md);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const getMarkdown = useCallback(() => {
    return editor?.storage?.markdown?.getMarkdown?.() ?? "";
  }, [editor]);

  const handleExport = useCallback(() => {
    const md = getMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getMarkdown]);

  const handleCopyMD = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }, [getMarkdown]);

  const handleSaveStyle = (name: string, css: string) => {
    setSavedStyles((prev) => [
      ...prev,
      { id: Date.now().toString(), name, presetId, overrides, customCSS: css },
    ]);
  };

  const handleLoadStyle = (style: SavedStyle) => {
    setPresetId(style.presetId);
    setOverrides(style.overrides);
    setCustomCSS(style.customCSS);
  };

  const isPresetUnmodified = Object.keys(overrides).length === 0 && !customCSS;

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #doc-canvas { background: white !important; padding: 0 !important; overflow: visible !important; }
          .doc-preview { box-shadow: none !important; max-width: 100% !important; min-height: auto !important; }
        }

        .doc-slider {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 3px; border-radius: 2px;
          background: #D4D0C8; cursor: pointer; outline: none;
        }
        .doc-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 13px; height: 13px; border-radius: 50%;
          background: #18181B; cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 0 1.5px #C0BBB2;
          transition: box-shadow 0.15s;
        }
        .doc-slider:hover::-webkit-slider-thumb,
        .doc-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 1.5px #2563EB80;
        }
        .doc-slider::-moz-range-thumb {
          width: 13px; height: 13px; border-radius: 50%;
          background: #18181B; cursor: pointer;
          border: 2px solid white; box-shadow: 0 0 0 1.5px #C0BBB2;
        }

        * { scrollbar-width: thin; scrollbar-color: #C4C0B8 transparent; }
        *::-webkit-scrollbar { width: 4px; height: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: #C4C0B8; border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: #ABA79F; }

        /* Keep EditorContent wrapper transparent */
        .tiptap-editor-wrapper { display: block; }
      `}</style>

      <div
        className="h-screen w-screen flex flex-col overflow-hidden bg-background"
        style={{ fontFamily: "'Figtree', -apple-system, sans-serif" }}
      >
        {/* ── Topbar ── */}
        <header
          className="no-print h-11 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-card"
          style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="bg-foreground rounded-md flex items-center justify-center"
              style={{ width: 22, height: 22 }}
            >
              <FileText size={12} className="text-background" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">RenderMarkdown</span>
          </div>

          {/* Word count (center) */}
          <span className="text-[11px] text-muted-foreground/60 tabular-nums">
            {wordCount > 0 ? `${wordCount.toLocaleString()} words` : ""}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <FileUp size={12} />
              Import
            </button>
            <button
              onClick={handleCopyMD}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy MD"}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Download size={12} />
              Export .md
            </button>
            <div className="w-px h-3.5 bg-border mx-1.5" />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
            >
              <Printer size={12} />
              Print / PDF
            </button>
          </div>
        </header>

        {/* ── Main ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Document canvas */}
          <div
            id="doc-canvas"
            className="flex-1 overflow-y-auto"
            style={{ background: "var(--background)", padding: "48px 20px 80px" }}
          >
            {editor && (
              <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: [120, 80], placement: "top", offset: [0, 10] }}
                shouldShow={({ from, to }) => from !== to}
              >
                <BubbleMenuBar editor={editor} />
              </BubbleMenu>
            )}
            <EditorContent editor={editor} className="tiptap-editor-wrapper" />
          </div>

          {/* ── Style sidebar ── */}
          <aside className="no-print w-[268px] flex-shrink-0 border-l border-border flex flex-col overflow-hidden bg-card">

            <div className="px-4 py-2.5 border-b border-border flex-shrink-0">
              <h2 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Document Style
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* Presets */}
              <SidebarAccordion
                title="Presets" icon={<LayoutTemplate size={11} />}
                isOpen={openSections.has("presets")} onToggle={() => toggleSection("presets")}
              >
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(PRESETS).map(([id, preset]) => {
                    const active = presetId === id && isPresetUnmodified;
                    return (
                      <button
                        key={id}
                        onClick={() => selectPreset(id)}
                        className={`px-3 py-2 text-[11px] rounded-lg border transition-all text-left font-medium ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground/30 hover:bg-black/5 text-foreground"
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
                {savedStyles.length > 0 && (
                  <div className="mt-2 pt-2.5 border-t border-border">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Saved</p>
                    <div className="space-y-1">
                      {savedStyles.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleLoadStyle(s)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] rounded-lg border border-dashed border-border hover:border-foreground/30 hover:bg-black/5 transition-colors text-left"
                        >
                          <Paintbrush size={11} className="text-muted-foreground/60 flex-shrink-0" />
                          <span className="truncate">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </SidebarAccordion>

              {/* Typography */}
              <SidebarAccordion
                title="Typography" icon={<Type size={11} />}
                isOpen={openSections.has("typography")} onToggle={() => toggleSection("typography")}
              >
                <SelectControl
                  label="Body font" value={settings.bodyFont} options={BODY_FONTS}
                  onChange={(v) => setOverride("bodyFont", v)}
                />
                <SelectControl
                  label="Heading font" value={settings.headingFont}
                  options={[{ label: "Same as body", value: settings.bodyFont }, ...BODY_FONTS.filter((f) => f.value !== settings.bodyFont)]}
                  onChange={(v) => setOverride("headingFont", v)}
                />
                <SliderControl
                  label="Font size" value={settings.fontSize} min={12} max={22}
                  format={(v) => `${v}px`} onChange={(v) => setOverride("fontSize", v)}
                />
                <SliderControl
                  label="Line height" value={settings.lineHeight} min={1.2} max={2.2} step={0.05}
                  format={(v) => v.toFixed(2)} onChange={(v) => setOverride("lineHeight", v)}
                />
              </SidebarAccordion>

              {/* Layout */}
              <SidebarAccordion
                title="Layout" icon={<Columns size={11} />}
                isOpen={openSections.has("layout")} onToggle={() => toggleSection("layout")}
              >
                <SliderControl
                  label="Page width" value={settings.pageWidth} min={480} max={1000} step={8}
                  format={(v) => `${v}px`} onChange={(v) => setOverride("pageWidth", v)}
                />
                <SliderControl
                  label="Side margins" value={settings.marginH} min={24} max={120} step={4}
                  format={(v) => `${v}px`} onChange={(v) => setOverride("marginH", v)}
                />
                <SliderControl
                  label="Top / bottom" value={settings.marginV} min={24} max={120} step={4}
                  format={(v) => `${v}px`} onChange={(v) => setOverride("marginV", v)}
                />
              </SidebarAccordion>

              {/* Headings */}
              <SidebarAccordion
                title="Headings" icon={<Type size={11} />}
                isOpen={openSections.has("headings")} onToggle={() => toggleSection("headings")}
              >
                <SliderControl
                  label="H1 size" value={settings.h1Size} min={1.2} max={3.0} step={0.05}
                  format={(v) => `${v.toFixed(2)}em`} onChange={(v) => setOverride("h1Size", v)}
                />
                <SliderControl
                  label="H2 size" value={settings.h2Size} min={1.0} max={2.2} step={0.05}
                  format={(v) => `${v.toFixed(2)}em`} onChange={(v) => setOverride("h2Size", v)}
                />
                <SliderControl
                  label="H3 size" value={settings.h3Size} min={1.0} max={1.75} step={0.05}
                  format={(v) => `${v.toFixed(2)}em`} onChange={(v) => setOverride("h3Size", v)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">H1 underline</span>
                  <button
                    onClick={() => setOverride("h1BorderBottom", !settings.h1BorderBottom)}
                    className={`relative flex items-center rounded-full transition-colors flex-shrink-0`}
                    style={{
                      width: 32, height: 18,
                      background: settings.h1BorderBottom ? "#18181B" : "#DDD9D1",
                    }}
                  >
                    <span
                      className="absolute left-0.5 top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform"
                      style={{ transform: settings.h1BorderBottom ? "translateX(14px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              </SidebarAccordion>

              {/* Colors */}
              <SidebarAccordion
                title="Colors" icon={<Palette size={11} />}
                isOpen={openSections.has("colors")} onToggle={() => toggleSection("colors")}
              >
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">Paper</p>
                  <div className="flex gap-1.5 flex-wrap items-center">
                    {PAPER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setOverride("paperColor", color)}
                        className="w-5 h-5 rounded-full border-[1.5px] transition-all flex-shrink-0"
                        style={{
                          background: color,
                          borderColor: settings.paperColor === color ? "#18181B" : "rgba(0,0,0,0.15)",
                          transform: settings.paperColor === color ? "scale(1.2)" : "scale(1)",
                        }}
                      />
                    ))}
                    <div className="relative w-5 h-5 rounded-full border border-border overflow-hidden flex-shrink-0" title="Custom">
                      <div className="absolute inset-0" style={{ background: settings.paperColor }} />
                      <input type="color" value={settings.paperColor} onChange={(e) => setOverride("paperColor", e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    </div>
                  </div>
                </div>
                <ColorControl label="Body text" value={settings.textColor} onChange={(v) => setOverride("textColor", v)} />
                <ColorControl label="Headings" value={settings.headingColor} onChange={(v) => setOverride("headingColor", v)} />
                <ColorControl label="Links" value={settings.accentColor} onChange={(v) => setOverride("accentColor", v)} />
                <ColorControl label="Borders" value={settings.borderColor} onChange={(v) => setOverride("borderColor", v)} />
              </SidebarAccordion>

              {/* Code Blocks */}
              <SidebarAccordion
                title="Code Blocks" icon={<Code size={11} />}
                isOpen={openSections.has("code")} onToggle={() => toggleSection("code")}
              >
                <SelectControl
                  label="Font" value={settings.codeFont} options={CODE_FONTS}
                  onChange={(v) => setOverride("codeFont", v)}
                />
                <ColorControl label="Background" value={settings.codeBg} onChange={(v) => setOverride("codeBg", v)} />
                <ColorControl label="Text" value={settings.codeColor} onChange={(v) => setOverride("codeColor", v)} />
              </SidebarAccordion>

            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 flex-shrink-0 space-y-1.5">
              <button
                onClick={() => setShowCSSEditor(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-medium border border-border rounded-lg hover:bg-black/5 transition-colors"
              >
                <Code size={12} />
                Edit CSS / Create Style
              </button>
              {!isPresetUnmodified && (
                <button
                  onClick={() => { setOverrides({}); setCustomCSS(""); }}
                  className="w-full px-4 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-lg transition-colors"
                >
                  Reset to preset defaults
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {showCSSEditor && (
        <CSSEditorModal
          customCSS={customCSS}
          onSave={setCustomCSS}
          onClose={() => setShowCSSEditor(false)}
          savedStyles={savedStyles}
          onSaveStyle={handleSaveStyle}
          onLoadStyle={handleLoadStyle}
          onDeleteStyle={(id) => setSavedStyles((prev) => prev.filter((s) => s.id !== id))}
        />
      )}
    </>
  );
}
