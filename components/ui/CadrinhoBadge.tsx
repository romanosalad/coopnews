// CadrinhoBadge — indicador de caderno (RADAR / PROTOCOLO / DOSSIÊ).
// Acima do título no template de matéria. Coexiste com o eyebrow editorial
// (editoria temática); este badge sinaliza nível de profundidade + camada de
// acesso, conforme fa.md V3.1 e BRIEFINGCO_MASTER_BLUEPRINT.md.

export type Caderno = "RADAR" | "PROTOCOLO" | "DOSSIÊ";

const CADERNO_META: Record<Caderno, { label: string; tipo: string; modifier: string }> = {
  RADAR: { label: "RADAR", tipo: "HARD NEWS", modifier: "cadrinho-badge--radar" },
  PROTOCOLO: { label: "PROTOCOLO", tipo: "HACK", modifier: "cadrinho-badge--protocolo" },
  DOSSIÊ: { label: "DOSSIÊ", tipo: "DEEP ANALYSIS", modifier: "cadrinho-badge--dossie" }
};

type CadrinhoBadgeProps = {
  caderno: Caderno;
  readTime?: string;
  className?: string;
};

export function CadrinhoBadge({ caderno, readTime, className = "" }: CadrinhoBadgeProps) {
  const meta = CADERNO_META[caderno];
  const ariaParts = [meta.label, readTime, meta.tipo].filter(Boolean).join(", ");

  return (
    <span
      className={`cadrinho-badge ${meta.modifier} ${className}`.trim()}
      role="status"
      aria-label={`Caderno: ${ariaParts}`}
    >
      <span className="cadrinho-badge__label">{meta.label}</span>
      {readTime ? (
        <>
          <span className="cadrinho-badge__sep" aria-hidden="true">·</span>
          <span className="cadrinho-badge__time">{readTime.toUpperCase()}</span>
        </>
      ) : null}
      <span className="cadrinho-badge__sep" aria-hidden="true">·</span>
      <span className="cadrinho-badge__tipo">{meta.tipo}</span>
    </span>
  );
}

// inferCaderno — transitório, até existir coluna `caderno` no Supabase.
// Decisão por densidade (fa.md V3.1: Radar 2k / Protocolo 6k / Dossiê 14k chars)
// com fallback por categoria editorial quando densidade está no limiar.
export function inferCaderno(bodyMarkdown: string, eyebrow: string): Caderno {
  const chars = (bodyMarkdown ?? "").length;
  const normalizedEyebrow = (eyebrow ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  if (chars >= 14000 || /\b(dossie|dossi|deep|analise profunda)\b/.test(normalizedEyebrow)) {
    return "DOSSIÊ";
  }

  if (
    chars >= 6000 ||
    /\b(protocolo|martech|ia|automacao|tech|hack)\b/.test(normalizedEyebrow)
  ) {
    return "PROTOCOLO";
  }

  return "RADAR";
}
