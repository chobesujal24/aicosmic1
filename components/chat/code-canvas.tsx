"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  EyeIcon,
  CodeIcon,
  XIcon,
  RefreshCcwIcon,
  MaximizeIcon,
  MinimizeIcon,
  CopyIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────
interface ExtractedBlock {
  lang: string;
  code: string;
  title?: string;
}

// ── Extraction Logic ───────────────────────────────────────────────
function extractCodeBlocks(text: string): ExtractedBlock[] {
  const regex =
    /```(html|react|javascript|js|jsx|tsx|ts|typescript|css|svg)[\t ]*\n([\s\S]*?)(?:```|$)/gi;
  const blocks: ExtractedBlock[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    blocks.push({ lang: m[1].toLowerCase(), code: m[2].trim() });
  }
  return blocks;
}

function isRenderable(lang: string) {
  return ["html", "react", "jsx", "tsx", "ts", "typescript", "javascript", "js", "css", "svg"].includes(lang);
}

function buildSrcDoc(block: ExtractedBlock): string {
  let src = block.code;

  if (["react", "jsx", "tsx", "ts", "typescript"].includes(block.lang)) {
    if (!src.includes("<html") && !src.includes("ReactDOM")) {
      src = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>body{margin:0;font-family:system-ui,-apple-system,sans-serif}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${src}
    if(typeof App!=='undefined'){ReactDOM.createRoot(document.getElementById('root')).render(<App/>)}
  <\/script>
</body>
</html>`;
    }
  } else if (["javascript", "js"].includes(block.lang)) {
    src = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;padding:20px}</style>
</head>
<body>
  <div id="root"></div>
  <script>
    try {
      ${src}
    } catch(e) {
      document.body.innerHTML += '<p style="color:red;font-family:monospace">' + e.toString() + '</p>';
    }
  </script>
</body>
</html>`;
  } else if (block.lang === "css") {
    src = `<!DOCTYPE html><html><head><style>${src}</style></head><body><div class="demo-box">CSS Live Preview<br><span style="font-size:0.8em;opacity:0.7">The styles above have been applied to this document</span></div></body></html>`;
  } else if (block.lang === "html") {
    if (!src.includes("tailwind")) {
      if (src.includes("</head>")) {
        src = src.replace(
          "</head>",
          '<script src="https://cdn.tailwindcss.com"><\/script>\n</head>'
        );
      } else if (src.includes("<head>")) {
        src = src.replace(
          "<head>",
          '<head>\n<script src="https://cdn.tailwindcss.com"><\/script>'
        );
      } else {
        src = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"><\/script><style>body{margin:0;font-family:system-ui,-apple-system,sans-serif}</style></head><body>${src}</body></html>`;
      }
    }
  } else if (block.lang === "svg") {
    src = `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f9fafb}</style></head><body>${src}</body></html>`;
  }

  return src;
}

// ── Canvas Panel (Gemini-style) ─────────────────────────────────────
export function CanvasPanel({
  open,
  blocks,
  onClose,
}: {
  open: boolean;
  blocks: ExtractedBlock[];
  onClose: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Clamp index
  useEffect(() => {
    if (activeIdx >= blocks.length) setActiveIdx(Math.max(0, blocks.length - 1));
  }, [blocks.length, activeIdx]);

  const activeBlock = blocks[activeIdx] ?? blocks[blocks.length - 1];

  const srcDoc = useMemo(
    () => (activeBlock ? buildSrcDoc(activeBlock) : ""),
    [activeBlock, refreshKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleCopy = useCallback(() => {
    if (activeBlock) navigator.clipboard.writeText(activeBlock.code);
  }, [activeBlock]);

  const handleOpenNew = useCallback(() => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(srcDoc);
      w.document.close();
    }
  }, [srcDoc]);

  if (!open || blocks.length === 0) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "flex flex-col overflow-hidden border-l border-border/40 bg-background",
            fullscreen
              ? "fixed inset-0 z-[60]"
              : "relative h-full"
          )}
          style={fullscreen ? undefined : { width: "100%" }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-2 border-b border-border/40 bg-muted/20 px-4 py-2.5 backdrop-blur-lg">
            {/* Left: View Tabs */}
            <div className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-[3px]">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
                  view === "preview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setView("preview")}
              >
                <EyeIcon size={13} /> Preview
              </button>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
                  view === "code"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setView("code")}
              >
                <CodeIcon size={13} /> Code
              </button>
            </div>

            {/* Center: Block tabs if multiple */}
            {blocks.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {blocks.map((b, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                      i === activeIdx
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {b.lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                title="Copy code"
              >
                <CopyIcon size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setRefreshKey((k) => k + 1)}
                title="Refresh preview"
              >
                <RefreshCcwIcon size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleOpenNew}
                title="Open in new tab"
              >
                <ExternalLinkIcon size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setFullscreen((f) => !f)}
                title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreen ? (
                  <MinimizeIcon size={14} />
                ) : (
                  <MaximizeIcon size={14} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onClose}
                title="Close canvas"
              >
                <XIcon size={14} />
              </Button>
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────────── */}
          <div className="relative flex-1 overflow-hidden">
            {view === "preview" ? (
              <iframe
                key={`${activeIdx}-${refreshKey}`}
                srcDoc={srcDoc}
                className="h-full w-full border-none bg-white"
                sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                title="Canvas Preview"
              />
            ) : (
              <div className="h-full w-full overflow-auto bg-[#1a1b26] p-5">
                <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-[#a9b1d6]">
                  <code>{activeBlock?.code ?? ""}</code>
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Inline Canvas Preview (small card in-chat) ──────────────────────
export function CodeCanvas({ textContent }: { textContent: string }) {
  const blocks = useMemo(() => extractCodeBlocks(textContent), [textContent]);
  const renderable = blocks.filter((b) => isRenderable(b.lang));
  const [expanded, setExpanded] = useState(false);

  if (renderable.length === 0) return null;

  const block = renderable[renderable.length - 1];
  const srcDoc = buildSrcDoc(block);

  return (
    <>
      {/* Inline mini-preview card */}
      <div className="group/canvas mt-3 w-full max-w-[min(100%,700px)]">
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card/60 shadow-[var(--shadow-card)] backdrop-blur-sm transition-shadow hover:shadow-lg">
          {/* Mini toolbar */}
          <div className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground/60">
                {block.lang.toUpperCase()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MaximizeIcon size={12} />
              Expand
            </button>
          </div>

          {/* Preview iframe — small */}
          <div className="relative h-[280px] overflow-hidden bg-white">
            <iframe
              srcDoc={srcDoc}
              className="h-full w-full scale-[0.75] origin-top-left border-none bg-white"
              style={{ width: "133.33%", height: "133.33%" }}
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
              title="Canvas Preview"
            />
            {/* Click overlay to expand */}
            <button
              type="button"
              className="absolute inset-0 cursor-pointer bg-transparent"
              onClick={() => setExpanded(true)}
              aria-label="Expand canvas preview"
            />
          </div>
        </div>
      </div>

      {/* Full-screen expanded view */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative flex h-[90vh] w-[90vw] flex-col overflow-hidden rounded-2xl border border-border/40 bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CanvasPanel
                open={true}
                blocks={renderable}
                onClose={() => setExpanded(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
