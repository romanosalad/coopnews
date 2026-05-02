"use client";

import { useState } from "react";
import type { ComposerInput } from "@/lib/composer-actions";

type AssistSidebarProps = {
  draft: ComposerInput;
  onApplyTitle: (title: string) => void;
  onApplyDek: (dek: string) => void;
  onApplyCmad: (cmad: { coop_business: string; marketing: string; art_craft: string; design_ux: string }) => void;
};

type VoiceIssue = { kind: string; detail: string };

export function AssistSidebar({ draft, onApplyTitle, onApplyDek, onApplyCmad }: AssistSidebarProps) {
  const [loadingAction, setLoadingAction] = useState<string>("");
  const [error, setError] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [polishedDek, setPolishedDek] = useState<string>("");
  const [voiceResult, setVoiceResult] = useState<{ score: number; issues: VoiceIssue[] } | null>(null);
  const [coverBrief, setCoverBrief] = useState<string>("");

  async function call(action: string) {
    setLoadingAction(action);
    setError("");
    try {
      const response = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, draft })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Falha na assistência");
        return;
      }
      if (action === "titles" && Array.isArray(data.titles)) setTitleSuggestions(data.titles);
      if (action === "polish_dek" && typeof data.dek === "string") setPolishedDek(data.dek);
      if (action === "voice_check") setVoiceResult({ score: data.score, issues: data.issues ?? [] });
      if (action === "cmad" && data.cmad) onApplyCmad(data.cmad);
      if (action === "cover_brief" && typeof data.brief === "string") setCoverBrief(data.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "erro inesperado");
    } finally {
      setLoadingAction("");
    }
  }

  const isLoading = (key: string) => loadingAction === key;

  return (
    <div className="composer-sidebar-card composer-assist">
      <span className="section-sub">Assistência IA</span>
      <h4 className="composer-sidebar-state">Atalhos editoriais</h4>
      <p className="composer-help">A IA usa a mesma voz B9 + Meio &amp; Mensagem + Mundo do Marketing das matérias automatizadas.</p>

      <div className="composer-assist-actions">
        <button type="button" disabled={!!loadingAction} onClick={() => call("titles")}>
          {isLoading("titles") ? "..." : "Sugerir 5 títulos"}
        </button>
        <button type="button" disabled={!!loadingAction || !draft.dek.trim()} onClick={() => call("polish_dek")}>
          {isLoading("polish_dek") ? "..." : "Polir lead"}
        </button>
        <button type="button" disabled={!!loadingAction || !draft.body_markdown.trim()} onClick={() => call("voice_check")}>
          {isLoading("voice_check") ? "..." : "Checar voz"}
        </button>
        <button type="button" disabled={!!loadingAction || !draft.body_markdown.trim()} onClick={() => call("cmad")}>
          {isLoading("cmad") ? "..." : "Gerar C-MAD"}
        </button>
        <button type="button" disabled={!!loadingAction || !draft.title.trim()} onClick={() => call("cover_brief")}>
          {isLoading("cover_brief") ? "..." : "Brief de capa"}
        </button>
      </div>

      {error ? <div className="composer-assist-error">{error}</div> : null}

      {titleSuggestions.length > 0 ? (
        <div className="composer-assist-result">
          <strong>Sugestões de título</strong>
          <ul>
            {titleSuggestions.map((title, index) => (
              <li key={index}>
                <button type="button" onClick={() => onApplyTitle(title)}>{title}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {polishedDek ? (
        <div className="composer-assist-result">
          <strong>Lead polido ({polishedDek.length}/160)</strong>
          <p>{polishedDek}</p>
          <button type="button" className="composer-assist-apply" onClick={() => onApplyDek(polishedDek)}>Aplicar lead</button>
        </div>
      ) : null}

      {voiceResult ? (
        <div className="composer-assist-result">
          <strong>Voz editorial — score {voiceResult.score}/100</strong>
          {voiceResult.issues.length === 0 ? (
            <p className="composer-assist-ok">Sem problemas detectados. ✓</p>
          ) : (
            <ul className="composer-assist-issues">
              {voiceResult.issues.map((issue, index) => (
                <li key={index} className={`composer-assist-issue is-${issue.kind}`}>{issue.detail}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {coverBrief ? (
        <div className="composer-assist-result">
          <strong>Brief para gerar capa</strong>
          <pre className="composer-assist-brief">{coverBrief}</pre>
          <span className="composer-help">Geração visual via gpt-image-1 sai na próxima fase.</span>
        </div>
      ) : null}
    </div>
  );
}
