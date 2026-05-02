"use client";

import { useMemo, useState, useTransition } from "react";

type RecentArticle = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  published_at: string | null;
  image_url: string | null;
};

type VerticalOption = {
  value: string;
  label: string;
  count: number;
};

type DispatcherProps = {
  articles: RecentArticle[];
  verticalsWithCount: VerticalOption[];
};

type DispatchResult =
  | {
      kind: "dry_run";
      would_send_to: number;
      sample_subject: string;
      sample_html_preview_chars: number;
    }
  | {
      kind: "sent";
      sent_count: number;
      failed_count: number;
      failed: { email: string; reason: string }[];
      edition_label: string;
      article_count: number;
    }
  | {
      kind: "error";
      message: string;
    };

export function NewsletterDispatcher({ articles, verticalsWithCount }: DispatcherProps) {
  const defaultIds = articles.slice(0, 3).map((a) => a.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultIds);
  const [vertical, setVertical] = useState<string>("all");
  const [editionLabel, setEditionLabel] = useState<string>(suggestEditionLabel());
  const [dryRun, setDryRun] = useState<boolean>(true);
  const [testRecipient, setTestRecipient] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<DispatchResult | null>(null);

  const selectedCount = selectedIds.length;
  const selectedAudience = useMemo(
    () => verticalsWithCount.find((v) => v.value === vertical)?.count ?? 0,
    [vertical, verticalsWithCount]
  );

  function toggleArticle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleDispatch() {
    setResult(null);
    if (selectedIds.length === 0) {
      setResult({ kind: "error", message: "Selecione ao menos uma matéria." });
      return;
    }
    if (!apiKey.trim()) {
      setResult({
        kind: "error",
        message: "Cole a NEWSLETTER_API_KEY (mesma do n8n / Vercel env)."
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/newsletter/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            article_ids: selectedIds,
            vertical: vertical === "all" ? "all" : vertical,
            edition_label: editionLabel,
            dry_run: dryRun,
            test_recipient: testRecipient.trim() || undefined
          })
        });
        const data = await response.json();
        if (!response.ok) {
          setResult({ kind: "error", message: data.error ?? `HTTP ${response.status}` });
          return;
        }
        if (data.dry_run) {
          setResult({
            kind: "dry_run",
            would_send_to: data.would_send_to ?? 0,
            sample_subject: data.sample_subject ?? "",
            sample_html_preview_chars: data.sample_html_preview_chars ?? 0
          });
        } else {
          setResult({
            kind: "sent",
            sent_count: data.sent_count ?? 0,
            failed_count: data.failed_count ?? 0,
            failed: data.failed ?? [],
            edition_label: data.edition_label ?? editionLabel,
            article_count: data.article_count ?? selectedIds.length
          });
        }
      } catch (err) {
        setResult({ kind: "error", message: err instanceof Error ? err.message : "erro inesperado" });
      }
    });
  }

  return (
    <>
      <section className="admin-section">
        <header className="admin-section-head">
          <h2>Selecione as matérias da edição</h2>
          <span>últimos 30 dias</span>
          <span className="admin-section-count">{selectedCount} de {articles.length}</span>
        </header>

        {articles.length === 0 ? (
          <p className="admin-section-empty">Nenhuma matéria publicada nos últimos 30 dias.</p>
        ) : (
          <ul className="newsletter-article-picker">
            {articles.map((article) => {
              const checked = selectedIds.includes(article.id);
              return (
                <li key={article.id} className={`newsletter-article-row ${checked ? "is-selected" : ""}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleArticle(article.id)}
                    />
                    <div className="newsletter-article-meta">
                      <strong>{article.title}</strong>
                      <span>
                        {article.category ?? "—"}
                        {article.published_at ? ` · ${formatDate(article.published_at)}` : ""}
                      </span>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-section">
        <header className="admin-section-head">
          <h2>Configurar e disparar</h2>
        </header>

        <div className="newsletter-form">
          <label className="newsletter-field">
            <span>Rótulo da edição</span>
            <input
              type="text"
              value={editionLabel}
              onChange={(event) => setEditionLabel(event.target.value)}
              placeholder="Edição #14 — semana de 5 de mai"
            />
          </label>

          <label className="newsletter-field">
            <span>Vertical alvo · {selectedAudience} destinatários</span>
            <select value={vertical} onChange={(event) => setVertical(event.target.value)}>
              {verticalsWithCount.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </label>

          <label className="newsletter-field">
            <span>Test recipient (opcional · ignora vertical)</span>
            <input
              type="email"
              value={testRecipient}
              onChange={(event) => setTestRecipient(event.target.value)}
              placeholder="seu@email.com pra envio único de homologação"
            />
          </label>

          <label className="newsletter-field">
            <span>NEWSLETTER_API_KEY</span>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="cole o secret compartilhado com o n8n"
              autoComplete="off"
            />
          </label>

          <label className="newsletter-checkbox">
            <input type="checkbox" checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />
            <span>
              <strong>Dry Run (apenas logs / enviar só para meu e-mail)</strong> —
              renderiza o template sem disparar para a base. Se preencher
              <em> Test recipient</em> acima, manda só pra esse endereço.
            </span>
          </label>

          <button
            type="button"
            className={`newsletter-dispatch ${dryRun ? "is-dry" : "is-live"}`}
            onClick={handleDispatch}
            disabled={pending}
          >
            {pending
              ? "Processando…"
              : dryRun
                ? "Rodar Dry Run"
                : "Disparar Newsletter Semanal →"}
          </button>

          {result ? <DispatchResultBlock result={result} /> : null}
        </div>
      </section>
    </>
  );
}

function DispatchResultBlock({ result }: { result: DispatchResult }) {
  if (result.kind === "error") {
    return (
      <div className="newsletter-result is-error">
        <strong>Falha</strong>
        <p>{result.message}</p>
      </div>
    );
  }
  if (result.kind === "dry_run") {
    return (
      <div className="newsletter-result is-dry">
        <strong>Dry Run completo · nenhum email enviado</strong>
        <ul>
          <li><b>{result.would_send_to}</b> leads impactados (escopo do filtro atual)</li>
          <li>Assunto que seria usado: <em>{result.sample_subject}</em></li>
          <li>HTML renderizado: {result.sample_html_preview_chars.toLocaleString()} caracteres</li>
        </ul>
        <p>
          Quando confirmar a configuração, desmarque <strong>Dry Run</strong> e dispare de verdade.
        </p>
      </div>
    );
  }
  return (
    <div className="newsletter-result is-sent">
      <strong>Disparado · {result.sent_count} leads impactados</strong>
      <ul>
        <li>Edição: <em>{result.edition_label}</em></li>
        <li>Matérias incluídas: <b>{result.article_count}</b></li>
        <li>Entregues com sucesso: <b>{result.sent_count}</b></li>
        {result.failed_count > 0 ? <li>Falhas: <b>{result.failed_count}</b></li> : null}
      </ul>
      {result.failed.length > 0 ? (
        <details>
          <summary>Ver falhas ({result.failed.length})</summary>
          <ul>
            {result.failed.map((f) => (
              <li key={f.email}>
                <code>{f.email}</code> — {f.reason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function suggestEditionLabel() {
  const now = new Date();
  const month = now.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  return `Edição da semana — ${now.getDate()} de ${month}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
