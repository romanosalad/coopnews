"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerDecisor, type DecisorVertical } from "@/lib/decisor-actions";

const VERTICALS: { value: DecisorVertical; label: string }[] = [
  { value: "credito", label: "Crédito" },
  { value: "agro", label: "Agro" },
  { value: "saude", label: "Saúde" },
  { value: "consumo", label: "Consumo" },
  { value: "outro", label: "Outro" }
];

type DecidorGateProps = {
  sourceSlug?: string;
  sourceCaderno?: "PROTOCOLO";
};

export function DecidorGate({ sourceSlug, sourceCaderno = "PROTOCOLO" }: DecidorGateProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [vertical, setVertical] = useState<DecisorVertical | "">("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vertical) {
      setError("Selecione uma vertical.");
      return;
    }
    setError("");

    const utmParams = readUtmFromUrl();

    startTransition(async () => {
      const result = await registerDecisor({
        name,
        email,
        cargo,
        vertical,
        source_slug: sourceSlug,
        source_caderno: sourceCaderno,
        ...utmParams
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <aside className="decidor-gate" aria-labelledby="decidor-gate-title">
      <div className="decidor-gate-fade" aria-hidden="true" />
      <div className="decidor-gate-card">
        <span className="decidor-gate-eyebrow">Acesso · Camada Decisor</span>
        <h2 id="decidor-gate-title" className="decidor-gate-title">
          Desbloqueie o <em>Protocolo</em> completo
        </h2>
        <p className="decidor-gate-tag">
          Inteligência acionável para gestores cooperativistas. Sem boletim. Sem spam.
          Apenas Hacks, Hard News e Análises com Vantagem Injusta.
        </p>

        <form onSubmit={handleSubmit} className="decidor-gate-form" noValidate>
          <div className="decidor-gate-row">
            <label className="decidor-gate-field">
              <span>Nome</span>
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Seu nome"
              />
            </label>
            <label className="decidor-gate-field">
              <span>E-mail corporativo</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="voce@cooperativa.coop.br"
              />
            </label>
          </div>
          <div className="decidor-gate-row">
            <label className="decidor-gate-field">
              <span>Cargo</span>
              <input
                type="text"
                required
                minLength={2}
                value={cargo}
                onChange={(event) => setCargo(event.target.value)}
                autoComplete="organization-title"
                placeholder="CMO, Head de Marketing, Diretor…"
              />
            </label>
            <label className="decidor-gate-field">
              <span>Vertical</span>
              <select
                required
                value={vertical}
                onChange={(event) => setVertical(event.target.value as DecisorVertical)}
              >
                <option value="">Selecione…</option>
                {VERTICALS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="decidor-gate-error">{error}</p> : null}

          <button type="submit" className="decidor-gate-submit" disabled={pending}>
            {pending ? "Liberando acesso…" : "Continuar lendo →"}
          </button>

          <p className="decidor-gate-fineprint">
            Ao continuar, você libera todos os Protocolos no seu navegador. Seus dados ficam
            no Briefing.Co — não vendemos, não compartilhamos.
          </p>
        </form>
      </div>
    </aside>
  );
}

function readUtmFromUrl() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined
  };
}
