"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerDecisor } from "@/lib/decisor-actions";

type DecidorGateProps = {
  sourceSlug?: string;
  sourceCaderno?: "PROTOCOLO";
};

// Camada 2 — fricção zero. Só email libera o Protocolo. O lead é gravado,
// o cookie httpOnly é setado, e um welcome email dispara via Resend
// confirmando inscrição na newsletter + link pra completar perfil depois.
//
// O usuário NÃO precisa preencher cargo, vertical ou nome aqui. Esses
// campos viram opcionais e podem ser preenchidos depois pra personalizar
// o digest. Decisão do founder: maior taxa de conversão > dado granular
// no primeiro toque.
export function DecidorGate({ sourceSlug, sourceCaderno = "PROTOCOLO" }: DecidorGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const utmParams = readUtmFromUrl();

    startTransition(async () => {
      const result = await registerDecisor({
        email,
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
          Continue lendo o <em>Protocolo</em>
        </h2>
        <p className="decidor-gate-tag">
          Só seu email. Liberamos o resto na hora e mandamos o briefing semanal toda
          terça e quinta às 7h. Sem boletim. Sem spam. Cancela em 1 clique.
        </p>

        <form onSubmit={handleSubmit} className="decidor-gate-form" noValidate>
          <div className="decidor-gate-singlefield">
            <label className="decidor-gate-field decidor-gate-field-grow">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="voce@cooperativa.coop.br"
              />
            </label>
            <button type="submit" className="decidor-gate-submit" disabled={pending}>
              {pending ? "Liberando…" : "Liberar leitura →"}
            </button>
          </div>

          {error ? <p className="decidor-gate-error">{error}</p> : null}

          <p className="decidor-gate-fineprint">
            Você recebe um email de boas-vindas e a próxima edição da newsletter.
            Quando quiser, complete seu perfil pra personalizar pela vertical (Crédito ·
            Agro · Saúde · Consumo).
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
