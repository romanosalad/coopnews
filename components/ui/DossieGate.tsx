"use client";

// Camada 3 — Paywall do Dossiê (assinatura paga).
// Estética alinhada ao DecidorGate (Camada 2): card preto premium com
// fade gradient simulando "leitura cortada". Diferença: Dossiê é compra,
// não cadastro — copy de valor + 3 planos + CTA Stripe (placeholder até
// a Fase 2 do roadmap, quando o Stripe Checkout entra).
//
// Por enquanto o botão de cada plano leva pra um endpoint /checkout?plan=
// que vai ser implementado quando Stripe estiver configurado. Isso permite
// validar a UI + capturar intenção de compra (cliques) sem bloquear o
// shipping da Fase 1.

import { useState } from "react";

type DossieGateProps = {
  sourceSlug?: string;
  previewParagraphs?: number;
};

type Plan = {
  id: "monthly" | "annual" | "team";
  label: string;
  price: string;
  cadence: string;
  perks: string[];
  highlight?: boolean;
  cta: string;
};

const PLANS: Plan[] = [
  {
    id: "monthly",
    label: "Decisor Mensal",
    price: "R$ 97",
    cadence: "por mês",
    perks: [
      "Protocolo ilimitado",
      "2 Dossiês por mês",
      "Cancela quando quiser"
    ],
    cta: "Assinar mensal"
  },
  {
    id: "annual",
    label: "Decisor Anual",
    price: "R$ 797",
    cadence: "por ano · economiza R$ 367",
    perks: [
      "Protocolo + Dossiês ilimitados",
      "Arquivo histórico completo",
      "Acesso antecipado a relatórios setoriais"
    ],
    highlight: true,
    cta: "Assinar anual"
  },
  {
    id: "team",
    label: "Equipe Elite",
    price: "R$ 297",
    cadence: "por mês · 5 seats",
    perks: [
      "Tudo do Anual ×5",
      "Briefing customizado mensal pro time",
      "Onboarding dedicado"
    ],
    cta: "Falar com vendas"
  }
];

export function DossieGate({ sourceSlug }: DossieGateProps) {
  const [pendingPlan, setPendingPlan] = useState<Plan["id"] | null>(null);

  function handleSubscribe(plan: Plan) {
    setPendingPlan(plan.id);
    const params = new URLSearchParams({
      plan: plan.id,
      ...(sourceSlug ? { source_slug: sourceSlug } : {})
    });
    // Stripe Checkout entra na Fase 2 do roadmap. Por enquanto registra
    // a intenção via query string e exibe estado de loading. Quando o
    // /api/checkout estiver pronto, troca pra fetch + redirect.
    window.location.href = `/api/checkout?${params.toString()}`;
  }

  return (
    <aside className="dossie-gate" aria-labelledby="dossie-gate-title">
      <div className="dossie-gate-fade" aria-hidden="true" />
      <div className="dossie-gate-card">
        <span className="dossie-gate-eyebrow">Dossiê · Camada Elite</span>
        <h2 id="dossie-gate-title" className="dossie-gate-title">
          Esse <em>Dossiê</em> é para quem decide o orçamento.
        </h2>
        <p className="dossie-gate-tag">
          Análise profunda, dados não-públicos e leitura estratégica que você não acha
          no Google. Investigação editorial sem jabá, sem release, sem perfumaria.
        </p>

        <div className="dossie-gate-plans">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`dossie-gate-plan ${plan.highlight ? "is-featured" : ""} ${pendingPlan === plan.id ? "is-loading" : ""}`}
            >
              {plan.highlight ? <span className="dossie-gate-plan-flag">Mais escolhido</span> : null}
              <h3 className="dossie-gate-plan-label">{plan.label}</h3>
              <div className="dossie-gate-plan-price">
                <strong>{plan.price}</strong>
                <span>{plan.cadence}</span>
              </div>
              <ul className="dossie-gate-plan-perks">
                {plan.perks.map((perk, index) => (
                  <li key={index}>{perk}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`dossie-gate-plan-cta ${plan.highlight ? "is-primary" : ""}`}
                onClick={() => handleSubscribe(plan)}
                disabled={pendingPlan !== null}
              >
                {pendingPlan === plan.id ? "Carregando…" : plan.cta}
              </button>
            </article>
          ))}
        </div>

        <p className="dossie-gate-fineprint">
          Sem fidelidade. Cancela em 1 clique. Pagamento via cartão ou PIX.
          Já assinante? <a href="/admin/login">Entrar</a>.
        </p>
      </div>
    </aside>
  );
}
