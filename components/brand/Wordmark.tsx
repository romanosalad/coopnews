import { BRAND } from "@/lib/brand";

type WordmarkProps = {
  height?: number;
  dark?: boolean;
};

// Wordmark canônico do Briefing.Co. Mantém o chevron lime e a partícula
// final em italic+lime — assinatura visual herdada do CoopNews preservada
// na transição de marca. Texto vem de lib/brand.ts (SSOT).
//
// Nome do componente CoopWordmark é mantido pra não cascatear quebra de
// import em todo lugar; o que renderiza é Briefing.Co.
export function CoopWordmark({ height = 28, dark = true }: WordmarkProps) {
  const fg = dark ? "#FAFAF7" : "#0A0A0A";
  const accent = "#C7F542";

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10, height }}
      aria-label={BRAND.name}
    >
      <svg
        width={height * 1.1}
        height={height}
        viewBox="0 0 44 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M 4 6 L 22 26 L 40 6 L 40 14 L 22 34 L 4 14 Z" fill={accent} />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: height * 0.85,
          letterSpacing: "-0.005em",
          color: fg,
          lineHeight: 1
        }}
      >
        {BRAND.mark_prefix}
        <span style={{ color: accent }}>{BRAND.mark_separator}</span>
        <em style={{ fontStyle: "italic", color: accent, fontWeight: 700 }}>{BRAND.mark_accent}</em>
      </span>
    </div>
  );
}
