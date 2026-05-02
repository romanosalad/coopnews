"use client";

import { useMemo } from "react";

type MarkdownPreviewProps = {
  markdown: string;
};

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const blocks = useMemo(() => parseBlocks(markdown), [markdown]);

  if (blocks.length === 0) {
    return <p className="composer-preview-empty">A pré-visualização aparece aqui assim que você começar a escrever.</p>;
  }

  return (
    <div className="composer-preview-body">
      {blocks.map((block, index) => {
        if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "quote")
          return (
            <blockquote key={index}>
              <p>{block.text}</p>
            </blockquote>
          );
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}

type Block = { type: "paragraph" | "heading" | "quote"; text: string };

function parseBlocks(markdown: string): Block[] {
  const out: Block[] = [];
  for (const raw of markdown.split(/\n{2,}/)) {
    const block = raw.trim();
    if (!block) continue;
    if (/^#{1,3}\s+/.test(block)) {
      out.push({ type: "heading", text: block.replace(/^#+\s+/, "").replace(/\*\*/g, "").trim() });
      continue;
    }
    if (block.startsWith("> ")) {
      out.push({ type: "quote", text: block.replace(/^>\s+/gm, "").replace(/\*\*/g, "").trim() });
      continue;
    }
    out.push({ type: "paragraph", text: block.replace(/\*\*/g, "").trim() });
  }
  return out;
}
