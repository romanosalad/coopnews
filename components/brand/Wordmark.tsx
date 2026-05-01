type WordmarkProps = {
  height?: number;
  dark?: boolean;
};

export function CoopWordmark({ height = 28, dark = true }: WordmarkProps) {
  const fg = dark ? "#FAFAF7" : "#0A0A0A";
  const accent = "#C7F542";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height }}>
      <svg width={height * 1.1} height={height} viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 4 6 L 22 26 L 40 6 L 40 14 L 22 34 L 4 14 Z" fill={accent} />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: height * 0.85,
          letterSpacing: 0,
          color: fg,
          lineHeight: 1
        }}
      >
        Coop<em style={{ fontStyle: "italic", color: accent }}>News</em>
      </span>
    </div>
  );
}
