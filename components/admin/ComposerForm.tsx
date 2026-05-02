"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AssistSidebar } from "@/components/admin/AssistSidebar";
import { CoverPicker } from "@/components/admin/CoverPicker";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { saveArticle, transitionArticle, type ComposerInput } from "@/lib/composer-actions";

type ComposerFormProps = {
  initial: ComposerInput;
  isReviewer: boolean;
  currentState: string | null;
  isOwner: boolean;
};

const CATEGORIES = [
  "Marketing Cooperativista",
  "Cooperativismo Global",
  "Criatividade",
  "Martech",
  "IA",
  "Automacao",
  "Comunicacao do Bem",
  "La Fora"
];

export function ComposerForm({ initial, isReviewer, currentState, isOwner }: ComposerFormProps) {
  const [form, setForm] = useState<ComposerInput>(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function update<K extends keyof ComposerInput>(key: K, value: ComposerInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(action: "draft" | "review") {
    setError("");
    startTransition(async () => {
      const result = await saveArticle(form, action);
      if (result?.error) setError(result.error);
    });
  }

  function handleTransition(target: "approved" | "published" | "draft" | "archived") {
    if (!form.id) return;
    setError("");
    startTransition(async () => {
      const result = await transitionArticle(form.id!, target);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  const charCountTitle = form.title.length;
  const charCountDek = form.dek.length;
  const titleOverLimit = charCountTitle > 75;
  const dekOverLimit = charCountDek > 160;

  return (
    <div className="composer-grid">
      <form
        className="composer-main"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave("draft");
        }}
      >
        <header className="composer-section">
          <label className="composer-label" htmlFor="title">
            Título <span className={`composer-hint ${titleOverLimit ? "is-error" : ""}`}>{charCountTitle}/75</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Título editorial em PT-BR (≤75 chars). Ex: Por que o roxo do Nubank deixou de ser ousadia?"
            className="composer-input composer-input-title"
            required
          />

          <label className="composer-label" htmlFor="dek">
            Pré-resumo (lead) <span className={`composer-hint ${dekOverLimit ? "is-error" : ""}`}>{charCountDek}/160</span>
          </label>
          <textarea
            id="dek"
            value={form.dek}
            onChange={(event) => update("dek", event.target.value)}
            placeholder="Sentença editorial autônoma que antecipa a tensão ou a lição. Não copie a primeira frase do corpo."
            rows={2}
            className="composer-input composer-input-dek"
          />

          <div className="composer-row">
            <div className="composer-field">
              <label className="composer-label" htmlFor="category">Editoria</label>
              <select id="category" value={form.category} onChange={(event) => update("category", event.target.value)} className="composer-input">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="composer-field composer-field-grow">
              <label className="composer-label" htmlFor="source_url">Link da fonte (opcional)</label>
              <input
                id="source_url"
                type="url"
                value={form.source_url}
                onChange={(event) => update("source_url", event.target.value)}
                placeholder="https://..."
                className="composer-input"
              />
            </div>
            <div className="composer-field">
              <label className="composer-label" htmlFor="slug">Slug</label>
              <input
                id="slug"
                type="text"
                value={form.slug}
                onChange={(event) => update("slug", event.target.value)}
                placeholder="auto"
                className="composer-input composer-input-slug"
              />
            </div>
          </div>

          <CoverPicker value={form.image_url} onChange={(url) => update("image_url", url)} />
        </header>

        <section className="composer-section">
          <div className="composer-section-head">
            <label className="composer-label" htmlFor="body">Corpo da matéria (Markdown)</label>
            <span className="composer-hint">
              Use <code>## Subtítulo</code> a cada ~300 palavras. <code>&gt; Frase</code> para destaque. Parágrafos curtos.
            </span>
          </div>
          <div className="composer-editor">
            <textarea
              id="body"
              value={form.body_markdown}
              onChange={(event) => update("body_markdown", event.target.value)}
              placeholder="Abra com fato ou cena. Cite quem fez, quanto, com qual agência. Construa a leitura estratégica..."
              rows={20}
              className="composer-input composer-textarea"
            />
            <div className="composer-preview">
              <span className="composer-preview-label">Pré-visualização</span>
              <MarkdownPreview markdown={form.body_markdown} />
            </div>
          </div>
        </section>

        <section className="composer-section">
          <h3 className="composer-h3">Matriz C-MAD</h3>
          <p className="composer-help">
            Cada campo é uma sentença com sujeito + verbo + consequência. <strong>coop_business</strong> e <strong>marketing</strong> precisam mencionar coop, cooperativa, cooperado ou associado.
          </p>
          <div className="composer-row">
            <div className="composer-field composer-field-grow">
              <label className="composer-label" htmlFor="cmad_coop_business">C — Coop Business</label>
              <textarea id="cmad_coop_business" rows={2} value={form.cmad_coop_business} onChange={(event) => update("cmad_coop_business", event.target.value)} className="composer-input" placeholder="O que muda para o cooperado, operação ou marca cooperativa?" />
            </div>
            <div className="composer-field composer-field-grow">
              <label className="composer-label" htmlFor="cmad_marketing">M — Marketing</label>
              <textarea id="cmad_marketing" rows={2} value={form.cmad_marketing} onChange={(event) => update("cmad_marketing", event.target.value)} className="composer-input" placeholder="Posicionamento, awareness ou competição lido pela lente cooperativista." />
            </div>
          </div>
          <div className="composer-row">
            <div className="composer-field composer-field-grow">
              <label className="composer-label" htmlFor="cmad_art_craft">A — Art / Craft</label>
              <textarea id="cmad_art_craft" rows={2} value={form.cmad_art_craft} onChange={(event) => update("cmad_art_craft", event.target.value)} className="composer-input" placeholder="Direção de arte, copy, casting, fotografia." />
            </div>
            <div className="composer-field composer-field-grow">
              <label className="composer-label" htmlFor="cmad_design_ux">D — Design / UX</label>
              <textarea id="cmad_design_ux" rows={2} value={form.cmad_design_ux} onChange={(event) => update("cmad_design_ux", event.target.value)} className="composer-input" placeholder="Jornada do associado, atendimento, pertencimento." />
            </div>
          </div>
        </section>

        {error ? <div className="composer-error-bar">{error}</div> : null}

        <footer className="composer-actions">
          <div className="composer-actions-left">
            <button type="submit" className="composer-btn composer-btn-secondary" disabled={pending}>
              {pending ? "Salvando..." : "Salvar rascunho"}
            </button>
            {(isOwner || isReviewer) && currentState !== "published" ? (
              <button type="button" className="composer-btn composer-btn-primary" disabled={pending} onClick={() => handleSave("review")}>
                {pending ? "Enviando..." : "Submeter para revisão →"}
              </button>
            ) : null}
          </div>
          {isReviewer && form.id ? (
            <div className="composer-actions-right">
              {currentState === "review" ? (
                <>
                  <button type="button" className="composer-btn composer-btn-ghost" disabled={pending} onClick={() => handleTransition("draft")}>
                    Devolver ao autor
                  </button>
                  <button type="button" className="composer-btn composer-btn-approve" disabled={pending} onClick={() => handleTransition("published")}>
                    Aprovar e publicar
                  </button>
                </>
              ) : null}
              {currentState === "approved" ? (
                <button type="button" className="composer-btn composer-btn-approve" disabled={pending} onClick={() => handleTransition("published")}>
                  Publicar agora
                </button>
              ) : null}
              {currentState === "published" ? (
                <button type="button" className="composer-btn composer-btn-ghost" disabled={pending} onClick={() => handleTransition("archived")}>
                  Arquivar
                </button>
              ) : null}
            </div>
          ) : null}
        </footer>
      </form>

      <aside className="composer-sidebar">
        <div className="composer-sidebar-card">
          <span className="section-sub">Status</span>
          <h4 className="composer-sidebar-state">{stateLabel(currentState)}</h4>
        </div>
        <AssistSidebar
          draft={form}
          onApplyTitle={(title) => update("title", title)}
          onApplyDek={(dek) => update("dek", dek)}
          onApplyCmad={(cmad) => {
            update("cmad_coop_business", cmad.coop_business);
            update("cmad_marketing", cmad.marketing);
            update("cmad_art_craft", cmad.art_craft);
            update("cmad_design_ux", cmad.design_ux);
          }}
        />
        <div className="composer-sidebar-card">
          <span className="section-sub">Padrões editoriais</span>
          <ul className="composer-sidebar-list">
            <li>Título ≤ 75 chars, sem voz passiva.</li>
            <li>Lead ≤ 160 chars, autônomo, anuncia tensão.</li>
            <li>Parágrafos curtos (1-3 frases).</li>
            <li>H2 a cada ~300 palavras em textos longos.</li>
            <li>Cite agência, marca, valor e nome quando o release der.</li>
            <li>C-MAD com sujeito + verbo + consequência.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function stateLabel(state: string | null) {
  switch (state) {
    case "draft":
      return "Rascunho";
    case "review":
      return "Em revisão";
    case "approved":
      return "Aprovado";
    case "published":
      return "Publicado";
    case "archived":
      return "Arquivado";
    default:
      return "Novo";
  }
}
